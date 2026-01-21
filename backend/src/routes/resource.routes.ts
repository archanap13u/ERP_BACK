import { Router, Request, Response } from 'express';
import { models } from '../models';
import mongoose from 'mongoose';

const router = Router();

// GET - List records
router.get('/:doctype', async (req: Request, res: Response) => {
    const { doctype } = req.params;
    const { organizationId, departmentId, department } = req.query;

    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) return res.status(404).json({ error: `Model ${doctype} not found` });

        const query: any = {};

        // Helper to safely convert to ObjectId
        const toObjectId = (val: any) => {
            if (typeof val === 'string' && val.match(/^[0-9a-fA-F]{24}$/)) {
                return new mongoose.Types.ObjectId(val);
            }
            return val;
        };

        const isGlobal = ['organization', 'university', 'program', 'superadmin', 'platformsettings'].includes(doctype.toLowerCase());

        if (organizationId) {
            const orgIdObj = toObjectId(organizationId);
            if (doctype.toLowerCase() === 'organization') {
                query._id = orgIdObj;
            } else {
                query.$or = [
                    { organizationId: orgIdObj },
                    { organization: orgIdObj }
                ];
            }
        } else if (!isGlobal) {
            return res.json({ data: [] });
        }

        if (doctype.toLowerCase() === 'holiday') {
            if (departmentId || department) {
                // For holidays, include:
                // 1. HR holidays (global inheritance)
                // 2. Holidays with NO department (global/all-org)
                // 3. Holidays specific to this department (ID or Name)

                const hrPattern = /^Human Resources$|^HR$|^hr$|^humanresources$/i;
                query.$or = [
                    { department: { $regex: hrPattern } },
                    { department: { $exists: false } },
                    { department: null },
                    { department: '' }
                ];

                if (departmentId) query.$or.push({ departmentId: toObjectId(departmentId) });
                if (department) {
                    // Match the specific department name case-insensitively
                    const deptStr = typeof department === 'string' ? department : String(department);
                    query.$or.push({ department: { $regex: new RegExp(`^${deptStr}$|^${deptStr.toLowerCase()}$`, 'i') } });
                }
            }
        } else if (doctype.toLowerCase() === 'department') {
            // No additional filters for departments beyond organizationId
        } else {
            if (departmentId) query.departmentId = toObjectId(departmentId);
            if (department) query.department = department;
        }

        const data = await Model.find(query).sort({ updatedAt: -1 });
        res.json({ data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Single record
router.get('/:doctype/:id', async (req: Request, res: Response) => {
    const { doctype, id } = req.params;
    const { organizationId, departmentId } = req.query;

    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) return res.status(404).json({ error: `Model ${doctype} not found` });

        const query: any = { _id: id };
        if (organizationId) {
            const orgIdObj = toObjectId(organizationId);
            if (doctype.toLowerCase() === 'organization') {
                if (id !== organizationId) return res.status(403).json({ error: "Access denied" });
            } else {
                query.$or = [
                    { organizationId: orgIdObj },
                    { organization: orgIdObj }
                ];
            }
        }
        if (departmentId) query.departmentId = new mongoose.Types.ObjectId(String(departmentId));

        const data = await Model.findOne(query);
        if (!data) return res.status(404).json({ error: "Record not found or access denied" });
        res.json({ data });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Create record
router.post('/:doctype', async (req: Request, res: Response) => {
    const { doctype } = req.params;
    const body = req.body;

    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) return res.status(404).json({ error: `Model ${doctype} not found` });

        // Holiday Restriction: Only HR can create holidays
        if (doctype.toLowerCase() === 'holiday') {
            const deptId = body.departmentId;
            const deptName = body.department || '';
            const userRole = (req.body.userRole || '').toLowerCase();

            let isHR = /^(Human Resources|HR)$/i.test(deptName);
            if (!isHR && deptId) {
                const DeptModel = models['department'];
                const dept = await DeptModel.findById(deptId);
                if (dept && dept.panelType === 'HR') isHR = true;
            }

            if (!isHR && userRole !== 'organizationadmin' && userRole !== 'superadmin') {
                return res.status(403).json({ error: 'Only the Human Resources department can create holidays.' });
            }
        }

        // Seat limit enforcement for employee/student
        const lowerType = doctype.toLowerCase();
        if (lowerType === 'employee' || lowerType === 'student') {
            const orgId = body.organizationId;
            if (orgId) {
                const Organization = models.organization;
                let org = await Organization.findById(mongoose.isValidObjectId(orgId) ? orgId : null);
                if (!org) org = await Organization.findOne({ organizationId: orgId });

                if (org) {
                    if (!org.isActive) return res.status(403).json({ error: 'Organization is inactive' });
                    if (org.subscription?.status === 'suspended' || org.subscription?.status === 'expired') {
                        return res.status(403).json({ error: `Subscription is ${org.subscription.status}` });
                    }

                    const maxUsers = org.subscription?.maxUsers || 10;
                    const [empCount, stuCount] = await Promise.all([
                        models.employee.countDocuments({ organizationId: org._id }),
                        models.student.countDocuments({ organizationId: org._id })
                    ]);
                    if (empCount + stuCount >= maxUsers) {
                        return res.status(403).json({ error: `Seat count limit reached (${empCount + stuCount}/${maxUsers})` });
                    }
                }
            }
        }

        // Vacancy Position Limit Check
        if (lowerType === 'employee' && body.vacancy) {
            const JobOpening = models.jobopening;
            if (JobOpening) {
                const vacancy = await JobOpening.findById(body.vacancy);
                if (!vacancy) return res.status(404).json({ error: 'Linked Vacancy not found' });
                if (vacancy.status !== 'Open') return res.status(400).json({ error: 'Linked Vacancy is not Open' });

                const hiredCount = await models.employee.countDocuments({ vacancy: body.vacancy });
                if (hiredCount >= (vacancy.no_of_positions || 1)) {
                    return res.status(400).json({ error: `Vacancy '${vacancy.job_title}' is full (${hiredCount}/${vacancy.no_of_positions} filled). Cannot hire more.` });
                }
            }
        }

        const record = new Model(body);
        await record.save();
        res.json({ data: record });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Update record
router.put('/:doctype/:id', async (req: Request, res: Response) => {
    const { doctype, id } = req.params;
    const body = req.body;
    const { organizationId, departmentId } = req.query;

    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) return res.status(404).json({ error: `Model ${doctype} not found` });

        const query: any = { _id: id };
        if (organizationId && doctype.toLowerCase() !== 'organization') query.organizationId = organizationId;
        if (departmentId) query.departmentId = departmentId;

        // Holiday Restriction: Only HR can update holidays
        if (doctype.toLowerCase() === 'holiday') {
            const reqDept = req.query.department as string || '';
            const reqDeptId = req.query.departmentId as string || '';
            let isHR = /^(Human Resources|HR)$/i.test(reqDept);

            if (!isHR && reqDeptId) {
                const DeptModel = models['department'];
                const dept = await DeptModel.findById(reqDeptId);
                if (dept && dept.panelType === 'HR') isHR = true;
            }

            if (reqDept && !isHR) {
                return res.status(403).json({ error: 'Only the Human Resources department can manage holidays.' });
            }
        }

        const record = await Model.findOneAndUpdate(query, { $set: body }, { new: true });
        if (!record) return res.status(404).json({ error: "Record not found or access denied" });
        res.json({ data: record });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Delete record
router.delete('/:doctype/:id', async (req: Request, res: Response) => {
    const { doctype, id } = req.params;
    const { organizationId, departmentId } = req.query;

    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) return res.status(404).json({ error: `Model ${doctype} not found` });

        const query: any = { _id: id };
        if (organizationId && doctype.toLowerCase() !== 'organization') query.organizationId = organizationId;
        if (departmentId) query.departmentId = departmentId;

        // Holiday Restriction: Only HR can delete holidays
        if (doctype.toLowerCase() === 'holiday') {
            const reqDept = req.query.department as string || '';
            const reqDeptId = req.query.departmentId as string || '';
            let isHR = /^(Human Resources|HR)$/i.test(reqDept);

            if (!isHR && reqDeptId) {
                const DeptModel = models['department'];
                const dept = await DeptModel.findById(reqDeptId);
                if (dept && dept.panelType === 'HR') isHR = true;
            }

            if (reqDept && !isHR) {
                return res.status(403).json({ error: 'Only the Human Resources department can manage holidays.' });
            }
        }

        const record = await Model.findOneAndDelete(query);
        if (!record) return res.status(404).json({ error: "Record not found or access denied" });

        // If deleting a department, also clean up all children records associated with it
        if (doctype.toLowerCase() === 'department') {
            const modelNames = Object.keys(models);
            for (const name of modelNames) {
                const M = models[name.toLowerCase()];
                if (!M) continue;

                // Skip basic models or the department model itself
                if (['organization', 'department', 'superadmin', 'platformsettings'].includes(name.toLowerCase())) continue;

                try {
                    // Delete all records belonging to this department
                    await M.deleteMany({ departmentId: record._id });
                } catch (err) {
                    console.error(`[Dept Cascading Cleanup] Error cleaning up ${name}:`, err);
                }
            }
        }

        res.json({ success: true, message: `${doctype} and associated data deleted successfully` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
