import { Router, Request, Response } from 'express';
import { models } from '../models';
import mongoose from 'mongoose';

const router = Router();

// GET - List records
// Helper to safely convert to ObjectId
const toObjectId = (val: any) => {
    if (typeof val === 'string' && val.match(/^[0-9a-fA-F]{24}$/)) {
        return new mongoose.Types.ObjectId(val);
    }
    return val;
};
router.get('/:doctype', async (req: Request, res: Response) => {
    const { doctype } = req.params;
    const { organizationId, departmentId, department, employeeId, studyCenter, verificationStatus, isActive, targetDepartment, targetStudyCenter } = req.query;

    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) return res.status(404).json({ error: `Model ${doctype} not found` });

        const query: any = {};

        // Helper to safely convert to ObjectId
        const isGlobal = ['organization', 'university', 'superadmin', 'platformsettings'].includes(doctype.toLowerCase());

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
                const hrPattern = /^Human Resources$|^HR$|^hr$|^humanresources$/i;
                const holidayOrCondition: any[] = [
                    { department: { $regex: hrPattern } },
                    { department: { $exists: false } },
                    { department: null },
                    { department: '' }
                ];

                if (departmentId) holidayOrCondition.push({ departmentId: toObjectId(departmentId) });
                if (department) {
                    const deptStr = typeof department === 'string' ? department : String(department);
                    holidayOrCondition.push({ department: { $regex: new RegExp(`^${deptStr}$|^${deptStr.toLowerCase()}$`, 'i') } });
                }

                if (query.$or) {
                    query.$and = [
                        { $or: query.$or },
                        { $or: holidayOrCondition }
                    ];
                    delete query.$or;
                } else {
                    query.$or = holidayOrCondition;
                }
            }
        } else if (doctype.toLowerCase() === 'department') {
            // No additional filters for departments beyond organizationId
        } else {
            // ONLY apply department filters for non-global entities
            if (!isGlobal) {
                if (departmentId) query.departmentId = toObjectId(departmentId);
                if (department) query.department = department;
            }
            if (studyCenter) query.studyCenter = studyCenter;
            if (verificationStatus) query.verificationStatus = verificationStatus;
            if (isActive !== undefined) query.isActive = isActive === 'true';
            if (targetDepartment) query.targetDepartment = targetDepartment;
            if (targetStudyCenter) query.targetStudyCenter = targetStudyCenter;

            // [Privacy] Filter by Employee ID OR Username for complaints
            if (doctype.toLowerCase() === 'complaint') {
                const username = req.query.username as string;
                const view = req.query.view as string;

                // Build filter: employeeId OR username (for dept admins)
                if (employeeId || username) {
                    const complaintFilter: any[] = [];
                    if (employeeId) complaintFilter.push({ employeeId: employeeId });
                    if (username) complaintFilter.push({ username: username });

                    if (complaintFilter.length > 0) {
                        if (query.$or) {
                            // If an existing $or exists (e.g. from Organization check), we must AND them
                            query.$and = [
                                { $or: query.$or },
                                { $or: complaintFilter }
                            ];
                            delete query.$or;
                        } else {
                            query.$or = complaintFilter;
                        }
                    }
                } else if (view !== 'all') {
                    // SECURITY HARDENING: 
                    // If no specific employee/username filter is provided, AND 'view=all' is not set,
                    // we return an EMPTY list by default to prevent data leakage.
                    return res.json({ data: [] });
                }
            } else if (employeeId && doctype.toLowerCase() === 'leaveapplication') {
                query.employeeId = employeeId;
            } else if (employeeId && doctype.toLowerCase() === 'employee') {
                query.employeeId = employeeId;
            }

            // [Filter] Announcement visibility for Students
            if (doctype.toLowerCase() === 'announcement' || doctype.toLowerCase() === 'opsannouncement') {
                const queryRole = req.query.userRole as string;
                if (queryRole?.toLowerCase() === 'student') {
                    const studentFilter = [
                        { department: 'All' },
                        { department: 'Student' },
                        { department: { $exists: false } },
                        { department: null },
                        { department: '' }
                    ];

                    if (query.$or) {
                        query.$and = [
                            { $or: query.$or },
                            { $or: studentFilter }
                        ];
                        delete query.$or;
                    } else {
                        query.$or = studentFilter;
                    }
                    console.log(`[Privacy] Applied Student visibility filter to ${doctype}`);
                }
            }

            // [Filter] Study Center visibility for Sales Staff (BDE/Employee/Sales Admin)
            if (doctype.toLowerCase() === 'studycenter') {
                const queryRole = req.query.userRole as string;
                const userId = req.query.userId as string;
                const panelType = req.query.panelType as string;

                const isSalesStaff = queryRole?.toLowerCase() === 'bde' || queryRole?.toLowerCase() === 'employee' || panelType?.toLowerCase() === 'sales';

                if (isSalesStaff) {
                    const salesFilters = [];
                    if (employeeId) salesFilters.push({ salesEmployeeId: employeeId });
                    if (userId) salesFilters.push({ salesEmployeeId: userId });

                    // BDE/Employee restricts to their own OR department
                    // DeptAdmin (Sales) should see ALL in org, so they just need the bypass
                    if (salesFilters.length > 0 || queryRole?.toLowerCase() === 'departmentadmin') {
                        // [Fix] Allow seeing referrals even if they don't match the current departmentId filter
                        // This prevents leads from "disappearing" if they aren't fully assigned or if IDs mismatch types
                        if (query.departmentId) {
                            const originalDeptId = query.departmentId;
                            delete query.departmentId;

                            const joinedFilters: any[] = [
                                { departmentId: originalDeptId }
                            ];
                            // Only add sales filters for non-admins to avoid over-restricting admins
                            if (queryRole?.toLowerCase() !== 'departmentadmin') {
                                joinedFilters.push(...salesFilters);
                            } else {
                                // For Sales Admin, we allow matching ANY sales employee if no dept id is set on lead
                                joinedFilters.push({ salesEmployeeId: { $ne: null } });
                                joinedFilters.push({ source: 'Referral' });
                            }

                            if (query.$or) {
                                query.$and = [
                                    { $or: query.$or },
                                    { $or: joinedFilters }
                                ];
                                delete query.$or;
                            } else {
                                query.$or = joinedFilters;
                            }
                        } else if (salesFilters.length > 0) {
                            if (query.$or) {
                                query.$and = [
                                    { $or: query.$or },
                                    { $or: salesFilters }
                                ];
                                delete query.$or;
                            } else {
                                query.$or = salesFilters;
                            }
                        }
                        console.log(`[Privacy] Restricting StudyCenter view to Sales Context (Role: ${queryRole}, IDs: ${employeeId || 'N/A'}, ${userId || 'N/A'}) with across-dept bypass`);
                    }
                }
            }

            // [Filter] Generic Status Filter
            const status = req.query.status as string;
            if (status) {
                query.status = status;
            }
        }

        const data = await Model.find(query).sort({ updatedAt: -1 });
        // Simplified log for clean production view, but includes count
        console.log(`[API] GET /${doctype} - Found: ${data.length} (Role: ${req.query.userRole || 'Admin'})`);
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

        const lowerType = doctype.toLowerCase();
        // Seat limit enforcement removed

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
        console.log(`[API] POST /${doctype} - Saved record with orgId: ${record.organizationId || 'MISSING'}, ID: ${record._id}`);

        // [Auto-Close Vacancy]
        if (lowerType === 'employee' && body.vacancy) {
            try {
                const JobOpening = models.jobopening;
                if (JobOpening) {
                    const vacancy = await JobOpening.findById(body.vacancy);
                    if (vacancy && vacancy.status === 'Open') {
                        const hiredCount = await models.employee.countDocuments({ vacancy: body.vacancy });
                        if (hiredCount >= (vacancy.no_of_positions || 1)) {
                            vacancy.status = 'Closed';
                            vacancy.closed_date = new Date();
                            await vacancy.save();
                            console.log(`[Vacancy Auto-Close] Vacancy '${vacancy.job_title}' closed. (Filled ${hiredCount}/${vacancy.no_of_positions})`);
                        }
                    }
                }
            } catch (err) {
                console.error('[Vacancy Auto-Close] Error:', err);
            }
        }

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
                // [Fix] Also skip 'employee' to prevent staff deletion when recreating a department. 
                // Employees will be preserved (orphaned ID) but retrievable by Name (Frontend Fix).
                if (['organization', 'department', 'superadmin', 'platformsettings', 'employee'].includes(name.toLowerCase())) continue;

                try {
                    // Delete all records belonging to this department
                    await M.deleteMany({ departmentId: record._id });
                } catch (err) {
                    console.error(`[Dept Cascading Cleanup] Error cleaning up ${name}:`, err);
                }
            }
        }

        // [New] Cascading Delete for Study Center -> Delete Students & Applications
        // This ensures no "Orphaned" Login credentials remain.
        if (doctype.toLowerCase() === 'studycenter') {
            try {
                const centerName = record.centerName; // Students link by Name, not ID
                const orgId = record.organizationId;

                console.log(`[Cascade Delete] Study Center "${centerName}" deleted. Cleaning up associated users...`);

                const StudentModel = models['student'];
                if (StudentModel) {
                    const sRes = await StudentModel.deleteMany({
                        studyCenter: centerName,
                        organizationId: orgId
                    });
                    console.log(`[Cascade Delete] Removed ${sRes.deletedCount} Students.`);
                }

                const AppModel = models['application'];
                if (AppModel) {
                    const aRes = await AppModel.deleteMany({
                        studyCenter: centerName,
                        organizationId: orgId
                    });
                    console.log(`[Cascade Delete] Removed ${aRes.deletedCount} Applications.`);
                }

                // Leads might not have studyCenter, but check if they do:
                const LeadModel = models['lead'];
                if (LeadModel) {
                    // Check if schema supports it or just try (if strict=false)
                    // Safest is to only do it if we are sure. GenericNew for Lead doesn't show StudyCenter.
                    // Skipping Lead to avoid accidental deletes if logic differs.
                }

            } catch (err) {
                console.error(`[StudyCenter Cascading Cleanup] Error:`, err);
            }
        }

        res.json({ success: true, message: `${doctype} and associated data deleted successfully` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
