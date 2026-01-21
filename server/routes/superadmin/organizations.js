const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models from local CommonJS files
const Organization = require('../../models/Organization');
const Employee = require('../../models/Employee');
const Student = require('../../models/Student');
const SuperAdmin = require('../../models/SuperAdmin');

// GET /api/superadmin/organizations
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status;
        const skip = (page - 1) * limit;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { organizationId: { $regex: search, $options: 'i' } },
                { domain: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'active') query.isActive = true;
        else if (status === 'inactive') query.isActive = false;

        const [organizations, total] = await Promise.all([
            Organization.find(query)
                .populate('adminId', 'employeeName email')
                .populate('createdBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Organization.countDocuments(query)
        ]);

        const orgsWithStats = await Promise.all(
            organizations.map(async (org) => {
                const [employeeCount, studentCount] = await Promise.all([
                    Employee.countDocuments({ organizationId: org._id }),
                    Student.countDocuments({ organizationId: org._id })
                ]);

                return {
                    ...org,
                    stats: {
                        employeeCount,
                        studentCount,
                        totalUsers: employeeCount + studentCount
                    }
                };
            })
        );

        return res.json({
            success: true,
            data: orgsWithStats,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[SuperAdmin API] Error fetching organizations:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch organizations' });
    }
});

// POST /api/superadmin/organizations
router.post('/', async (req, res) => {
    try {
        console.log('[SuperAdmin API] 🚀 POST /api/superadmin/organizations - Start');
        const { name, domain, username, password, adminId, subscription, createdBy } = req.body;

        if (!name || !createdBy || !username || !password) {
            return res.status(400).json({ success: false, error: 'Organization name, username, password and creator are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(createdBy)) {
            return res.status(400).json({ success: false, error: 'Invalid creator ID format. Please log in again.' });
        }

        const organizationId = `ORG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        if (domain) {
            const existingOrg = await Organization.findOne({ domain: domain.toLowerCase().trim() });
            if (existingOrg) {
                return res.status(400).json({ success: false, error: 'Domain is already taken' });
            }
        }

        const existingUsername = await Organization.findOne({ username: username.toLowerCase().trim() });
        if (existingUsername) {
            return res.status(400).json({ success: false, error: 'Username is already taken' });
        }

        const organization = await Organization.create({
            organizationId,
            name,
            domain: domain ? domain.toLowerCase().trim() : undefined,
            username: username.toLowerCase().trim(),
            password,
            adminId: adminId && mongoose.Types.ObjectId.isValid(adminId) ? adminId : undefined,
            subscription: subscription || {
                plan: 'free',
                status: 'active',
                maxUsers: 0,
                startDate: new Date()
            },
            createdBy,
            isActive: true
        });

        console.log(`[SuperAdmin API] ✓ Created organization: ${name} (${organizationId})`);

        if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
            await Employee.findByIdAndUpdate(adminId, {
                isOrgAdmin: true,
                organizationId: organization._id
            });
        }

        return res.status(201).json({ success: true, data: organization });
    } catch (error) {
        console.error('[SuperAdmin API] ❌ Error creating organization:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'A unique constraint was violated (duplicate entry).' });
        }
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

// GET /api/superadmin/organizations/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findById(id)
            .populate('adminId', 'employeeName email designation')
            .populate('createdBy', 'fullName email')
            .populate('subscription.activeLicense', 'name type duration price maxUsers')
            .lean();

        if (!organization) {
            return res.status(404).json({ success: false, error: 'Organization not found' });
        }

        const [employeeCount, studentCount] = await Promise.all([
            Employee.countDocuments({ organizationId: organization._id }),
            Student.countDocuments({ organizationId: organization._id })
        ]);

        const orgWithStats = {
            ...organization,
            stats: {
                employeeCount,
                studentCount,
                totalUsers: employeeCount + studentCount
            }
        };

        return res.json({ success: true, data: orgWithStats });
    } catch (error) {
        console.error('[SuperAdmin API] Error fetching organization:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch organization' });
    }
});

// PUT /api/superadmin/organizations/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let { name, domain, username, password, adminId, subscription, isActive, settings } = req.body;

        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ success: false, error: 'Organization not found' });
        }

        // Normalize inputs
        if (domain) domain = domain.toLowerCase().trim();
        if (domain === '') domain = null; // Handle empty string as null for sparse index
        if (username) username = username.toLowerCase().trim();

        if (domain && domain !== organization.domain) {
            const existingOrg = await Organization.findOne({ domain, _id: { $ne: id } });
            if (existingOrg) {
                return res.status(400).json({ success: false, error: 'Domain is already taken' });
            }
        }

        if (username && username !== organization.username) {
            const existingOrg = await Organization.findOne({ username, _id: { $ne: id } });
            if (existingOrg) {
                return res.status(400).json({ success: false, error: 'Username is already taken' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;

        // Handle domain update: if null/undefined, ensure we update correctly provided strictly passed
        if (domain !== undefined) updateData.domain = domain;

        if (username) updateData.username = username;
        if (password) updateData.password = password;
        if (adminId !== undefined) updateData.adminId = adminId;
        if (subscription) updateData.subscription = { ...organization.subscription.toObject(), ...subscription };
        if (isActive !== undefined) updateData.isActive = isActive;
        if (settings) updateData.settings = { ...organization.settings, ...settings };

        const updatedOrg = await Organization.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (adminId && adminId !== organization.adminId?.toString()) {
            if (organization.adminId) {
                await Employee.findByIdAndUpdate(organization.adminId, { isOrgAdmin: false });
            }
            if (mongoose.Types.ObjectId.isValid(adminId)) {
                await Employee.findByIdAndUpdate(adminId, { isOrgAdmin: true, organizationId: organization._id });
            }
        }

        console.log(`[SuperAdmin API] ✓ Updated organization: ${updatedOrg?.name}`);
        return res.json({ success: true, data: updatedOrg });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'A unique constraint was violated (duplicate username or domain).' });
        }
        console.error('[SuperAdmin API] Error updating organization:', error);
        return res.status(500).json({ success: false, error: 'Failed to update organization' });
    }
});

// DELETE /api/superadmin/organizations/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ success: false, error: 'Organization not found' });
        }

        const [employeeCount, studentCount] = await Promise.all([
            Employee.countDocuments({ organizationId: organization._id }),
            Student.countDocuments({ organizationId: organization._id })
        ]);

        await Organization.findByIdAndDelete(id);

        console.log(`[SuperAdmin API] ✓ Deleted organization: ${organization.name} (Had ${employeeCount} employees, ${studentCount} students)`);
        return res.json({ success: true, message: 'Organization deleted successfully' });
    } catch (error) {
        console.error('[SuperAdmin API] Error deleting organization:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete organization' });
    }
});

module.exports = router;
