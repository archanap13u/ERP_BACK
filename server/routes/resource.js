const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models index from local CommonJS files
const { models } = require('../models');

// GET /api/resource/:doctype
router.get('/:doctype', async (req, res) => {
    const { doctype } = req.params;
    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) {
            console.log(`[Resource API] Model not found: ${doctype}. Available models: ${Object.keys(models).join(', ')}`);
            return res.status(404).json({ error: `Model ${doctype} not found` });
        }

        const query = {};
        const organizationId = req.query.organizationId;
        const departmentId = req.query.departmentId;
        const departmentName = req.query.department;
        const studyCenter = req.query.studyCenter;

        // CRITICAL: Enforce strict isolation. 
        // For multi-tenant models, organizationId MUST be provided and valid.
        const isScopedModel = !['organization', 'user', 'superadmin', 'platformsettings'].includes(doctype.toLowerCase());

        // Handle common JS falsy strings from frontend localStorage
        const cleanOrgId = (organizationId === 'null' || organizationId === 'undefined') ? null : organizationId;

        if (isScopedModel && (!cleanOrgId || cleanOrgId === '')) {
            console.warn(`[Resource API] ⚠️ BLOCKING potentially un-isolated fetch for ${doctype}. Missing organizationId. Query was:`, req.query);
            return res.json({ data: [] });
        }

        if (cleanOrgId) {
            // Use explicit ObjectId if valid to ensure strict type matching
            query.organizationId = mongoose.isValidObjectId(cleanOrgId)
                ? new mongoose.Types.ObjectId(cleanOrgId)
                : cleanOrgId;
        }

        // Apply Departmental Isolation (Skip for the department resource itself)
        if ((departmentId || departmentName) && doctype.toLowerCase() !== 'department') {
            const deptSubQuery = { $or: [] };
            if (departmentId) {
                const targetId = mongoose.isValidObjectId(departmentId) ? new mongoose.Types.ObjectId(departmentId) : departmentId;
                deptSubQuery.$or.push({ departmentId: targetId });
                deptSubQuery.$or.push({ addedByDepartmentId: targetId });
            }
            if (departmentName && departmentName !== 'All') {
                deptSubQuery.$or.push({ department: { $regex: new RegExp(`^${departmentName.trim()}$`, "i") } });
            }
            deptSubQuery.$or.push({ department: 'All' });

            // Strictly combine with existing query (which has organizationId)
            const orgIdConstraint = query.organizationId;
            delete query.organizationId;

            query.$and = [
                { organizationId: orgIdConstraint },
                deptSubQuery
            ];
        }
        const cleanStudyCenter = (studyCenter === 'null' || studyCenter === 'undefined') ? null : studyCenter;
        if (cleanStudyCenter) {
            query.studyCenter = { $regex: new RegExp(`^${cleanStudyCenter.trim()}$`, "i") };
        }

        // Allow filtering by employeeId/employeeName (for complaints - data isolation per employee)
        if (doctype.toLowerCase() === 'complaint') {
            const empId = req.query.employeeId;
            const empName = req.query.employeeName;

            if (empId || empName) {
                const empFilters = [];
                if (empId) empFilters.push({ employeeId: empId });
                if (empName) empFilters.push({ employeeName: { $regex: new RegExp(`^${empName.trim()}$`, "i") } });

                if (empFilters.length > 0) {
                    // If there's an existing query (like organizationId), combine it
                    if (Object.keys(query).length > 0 || query.$and) {
                        const existingQuery = { ...query };
                        // Remove organizationId from top level if we're moving it into an $and
                        // Actually, resource.js usually handles $and for departments already.
                        // Let's be safe and just add it to the top level or combine.
                        query.$and = query.$and || [];
                        query.$and.push({ $or: empFilters });
                    } else {
                        query.$or = empFilters;
                    }
                }
            }
        }

        // Allow filtering by verificationStatus (for Students/Employees)
        if (req.query.verificationStatus) {
            query.verificationStatus = req.query.verificationStatus;
        }

        console.log(`[API GET List] ${doctype} Query:`, JSON.stringify(query));
        const data = await Model.find(query).sort({ updatedAt: -1 });
        console.log(`[API GET List] ${doctype}: Found ${data.length} records for org ${cleanOrgId}`);
        return res.json({ data });
    } catch (error) {
        console.error(`[Resource API] Error in GET ${doctype}:`, error);
        return res.status(500).json({ error: error.message });
    }
});

// POST /api/resource/:doctype
router.post('/:doctype', async (resq, res) => {
    const { doctype } = resq.params;
    try {
        if (doctype === 'internalmark') {
            console.log('--- BACKEND RECEIVING INTERNAL MARK ---');
            console.log('Body:', JSON.stringify(resq.body, null, 2));
            console.log('---------------------------------------');
        }
        const Model = models[doctype.toLowerCase()];
        if (!Model) {
            console.log(`[Resource API] Model not found in POST: ${doctype}. Available: ${Object.keys(models).join(', ')}`);
            return res.status(404).json({ error: `Model ${doctype} not found` });
        }

        const body = resq.body;

        // Strict Validation: Ensure organizationId is present for scoped models
        const unscopedModels = ['organization', 'user'];
        if (!unscopedModels.includes(doctype.toLowerCase()) && !body.organizationId) {
            console.warn(`[Resource API] ⚠️ BLOCKING POST for ${doctype}. Missing organizationId in body. Body:`, body);
            return res.status(400).json({ error: 'Missing organizationId' });
        }

        // TEMPORARILY DISABLED: Enforce seat limits for employees/students
        // const lowerType = doctype.toLowerCase();
        // if (lowerType === 'employee' || lowerType === 'student') {
        //     const orgId = body.organizationId;
        //     if (orgId) {
        //         const Organization = models.organization;
        //         if (Organization) {
        //             let org = await Organization.findById(mongoose.isValidObjectId(orgId) ? orgId : null);
        //             if (!org) org = await Organization.findOne({ organizationId: orgId });
        //
        //             if (org) {
        //                 if (!org.isActive) {
        //                     return res.status(403).json({ error: 'Organization is inactive' });
        //                 }
        //                 if (org.subscription?.status === 'suspended' || org.subscription?.status === 'expired') {
        //                     return res.status(403).json({ error: `Subscription is ${org.subscription.status}. Please contact support.` });
        //                 }
        //
        //                 const maxUsers = org.subscription?.maxUsers || 10;
        //                 const [empCount] = await Promise.all([
        //                     models.employee ? models.employee.countDocuments({ organizationId: org._id }) : 0
        //                 ]);
        //
        //                 if (empCount >= maxUsers) {
        //                     return res.status(403).json({ error: `Seat count limit reached (${empCount}/${maxUsers}). Contact Super Admin.` });
        //                 }
        //             }
        //         }
        //     }
        // }

        const record = new Model(body);
        await record.save();
        console.log(`[API POST] Success: Record ${record._id} saved for org ${body.organizationId}`);

        return res.json({ data: record });
    } catch (error) {
        if (error.code === 11000) {
            console.warn(`[API POST] Duplicate key error for ${doctype}:`, error.keyValue);
            const fields = Object.keys(error.keyValue).join(', ');
            const values = Object.values(error.keyValue).join(', ');
            return res.status(400).json({
                error: `Duplicate entry: A record with this '${fields}' (values: '${values}') already exists for your organization.`
            });
        }
        console.error(`[Resource API] Error in POST ${doctype}:`, error);
        return res.status(500).json({ error: error.message });
    }
});

// GET /api/resource/:doctype/:id
router.get('/:doctype/:id', async (req, res) => {
    const { doctype, id } = req.params;
    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) {
            console.log(`[Resource API] Model not found in GET by ID: ${doctype}`);
            return res.status(404).json({ error: `Model ${doctype} not found` });
        }

        const query = { _id: id };
        const organizationId = req.query.organizationId;
        const departmentId = req.query.departmentId;

        // Strict Ownership Check: For multi-tenant models, organizationId MUST be provided
        const lowerType = doctype.toLowerCase();
        if (lowerType !== 'organization' && lowerType !== 'user') {
            if (!organizationId) {
                console.warn(`[Resource API] Missing organizationId for ${doctype} fetch: ${id}`);
                return res.status(400).json({ error: 'Missing organizationId for scoped resource' });
            }
            query.organizationId = organizationId;
        }
        if (departmentId) query.departmentId = departmentId;

        const data = await Model.findOne(query);
        if (!data) {
            console.warn(`[API GET ById] ${doctype}:${id} NOT FOUND or MISMATCH for org ${organizationId}`);
            return res.status(404).json({ error: 'Record not found or access denied.' });
        }

        return res.json({ data });
    } catch (error) {
        console.error(`[Resource API] Error in GET ${doctype}:${id}:`, error);
        return res.status(500).json({ error: error.message });
    }
});

// PUT /api/resource/:doctype/:id
router.put('/:doctype/:id', async (req, res) => {
    const { doctype, id } = req.params;
    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) {
            console.log(`[Resource API] Model not found in PUT: ${doctype}`);
            return res.status(404).json({ error: `Model ${doctype} not found` });
        }

        const body = req.body;
        const query = { _id: id };
        const organizationId = req.query.organizationId;

        // Enforce Ownership for Multi-Tenant Data
        const lowerType = doctype.toLowerCase();

        // Handle common JS falsy strings from frontend localStorage
        const cleanOrgIdQuery = (organizationId === 'null' || organizationId === 'undefined') ? null : organizationId;
        const cleanOrgIdBody = (body.organizationId === 'null' || body.organizationId === 'undefined') ? null : body.organizationId;
        const effectiveOrgId = cleanOrgIdQuery || cleanOrgIdBody;

        if (lowerType !== 'organization' && lowerType !== 'user') {
            if (!effectiveOrgId) {
                console.warn(`[Resource API] ⚠️ Missing organizationId for ${doctype} update: ${id}. Query:`, req.query, 'Body Org:', body.organizationId);
                return res.status(400).json({ error: 'Missing organizationId for update' });
            }
            query.organizationId = mongoose.isValidObjectId(effectiveOrgId)
                ? new mongoose.Types.ObjectId(effectiveOrgId)
                : effectiveOrgId;
        }

        const record = await Model.findOneAndUpdate(query, { $set: body }, { new: true });
        if (!record) return res.status(404).json({ error: 'Record not found or access denied.' });

        return res.json({ data: record });
    } catch (error) {
        if (error.code === 11000) {
            console.warn(`[API PUT] Duplicate key error for ${doctype}:`, error.keyValue);
            const fields = Object.keys(error.keyValue).join(', ');
            return res.status(400).json({
                error: `Duplicate entry: A record with this '${fields}' already exists for your organization.`
            });
        }
        console.error(`[Resource API] Error in PUT ${doctype}:${id}:`, error);
        return res.status(500).json({ error: error.message });
    }
});

// DELETE /api/resource/:doctype/:id
router.delete('/:doctype/:id', async (req, res) => {
    const { doctype, id } = req.params;
    try {
        const Model = models[doctype.toLowerCase()];
        if (!Model) {
            console.log(`[Resource API] Model not found in DELETE: ${doctype}`);
            return res.status(404).json({ error: `Model ${doctype} not found` });
        }

        const query = { _id: id };
        const organizationId = req.query.organizationId;

        // Enforce Ownership for Multi-Tenant Data
        const lowerType = doctype.toLowerCase();
        const cleanOrgId = (organizationId === 'null' || organizationId === 'undefined') ? null : organizationId;

        if (lowerType !== 'organization' && lowerType !== 'user') {
            if (!cleanOrgId) {
                console.warn(`[Resource API] ⚠️ Missing organizationId for ${doctype} delete: ${id}`);
                return res.status(400).json({ error: 'Missing organizationId for delete' });
            }
            query.organizationId = mongoose.isValidObjectId(cleanOrgId)
                ? new mongoose.Types.ObjectId(cleanOrgId)
                : cleanOrgId;
        }

        const record = await Model.findOneAndDelete(query);
        if (!record) return res.status(404).json({ error: 'Record not found or access denied.' });

        return res.json({ success: true });
    } catch (error) {
        console.error(`[Resource API] Error in DELETE ${doctype}:${id}:`, error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
