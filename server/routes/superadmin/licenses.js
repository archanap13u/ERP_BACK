const express = require('express');
const router = express.Router();

// Import models from local CommonJS files
const License = require('../../models/License');
const Organization = require('../../models/Organization');

// GET /api/superadmin/licenses/defaults
router.get('/defaults', async (req, res) => {
    try {
        const planTypes = ['free', 'basic'];
        const defaults = {};

        for (const type of planTypes) {
            const latestLicense = await License.findOne({ type })
                .sort({ createdAt: -1 })
                .select('maxUsers price pricingModel');

            if (latestLicense) {
                defaults[type] = {
                    maxUsers: latestLicense.maxUsers,
                    price: latestLicense.price || 0,
                    pricingModel: latestLicense.pricingModel || 'flat'
                };
            } else {
                switch (type) {
                    case 'free': defaults[type] = { maxUsers: 5, price: 0, pricingModel: 'flat' }; break;
                    case 'basic': defaults[type] = { maxUsers: 10, price: 10, pricingModel: 'per_user' }; break;
                }
            }
        }

        return res.json({ success: true, data: defaults });
    } catch (error) {
        console.error('Error fetching license defaults:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch license defaults' });
    }
});

// GET /api/superadmin/licenses
router.get('/', async (req, res) => {
    try {
        const status = req.query.status;
        const query = {};
        if (status) query.status = status;

        const licenses = await License.find(query)
            .populate('assignedTo', 'name organizationId')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 });

        return res.json({ success: true, data: licenses });
    } catch (error) {
        console.error('Error fetching licenses:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch licenses' });
    }
});

// POST /api/superadmin/licenses
router.post('/', async (req, res) => {
    try {
        const { name, type, duration, maxUsers, pricingModel, price, createdBy } = req.body;

        if (!name || !type || !duration || !createdBy) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const license = await License.create({
            name,
            type,
            duration,
            maxUsers: maxUsers || 10,
            pricingModel: pricingModel || 'flat',
            price: price || 0,
            status: 'available',
            createdBy
        });

        return res.status(201).json({ success: true, data: license });
    } catch (error) {
        console.error('Error creating license:', error);
        return res.status(500).json({ success: false, error: 'Failed to create license' });
    }
});

// PUT /api/superadmin/licenses/:id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;

        const license = await License.findById(id);
        if (!license) {
            return res.status(404).json({ success: false, error: 'License not found' });
        }

        // Handle Assignment
        if (assignedTo && assignedTo !== license.assignedTo?.toString()) {
            if (license.status === 'expired' || license.status === 'revoked') {
                return res.status(400).json({ success: false, error: 'License is not valid for assignment' });
            }

            // Unlink previous org
            if (license.assignedTo) {
                await Organization.findByIdAndUpdate(license.assignedTo, { 'subscription.activeLicense': null });
            }

            // Link new org
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + license.duration);

            await Organization.findByIdAndUpdate(assignedTo, {
                $set: {
                    'subscription.plan': license.type,
                    'subscription.status': 'active',
                    'subscription.startDate': new Date(),
                    'subscription.expiryDate': expiryDate,
                    'subscription.activeLicense': license._id,
                    'subscription.maxUsers': license.maxUsers
                }
            });

            license.assignedTo = assignedTo;
            license.assignedDate = new Date();
            license.status = 'assigned';
            await license.save();

            return res.json({ success: true, data: license, message: 'License assigned successfully' });
        }

        // Handle Unassignment
        if (assignedTo === null && license.assignedTo) {
            await Organization.findByIdAndUpdate(license.assignedTo, { 'subscription.activeLicense': null });
            license.assignedTo = undefined;
            license.assignedDate = undefined;
            license.status = 'available';
            await license.save();

            return res.json({ success: true, data: license, message: 'License unassigned' });
        }

        return res.status(400).json({ success: false, error: 'No valid operation provided' });
    } catch (error) {
        console.error('Error updating license:', error);
        return res.status(500).json({ success: false, error: 'Failed to update license' });
    }
});

// DELETE /api/superadmin/licenses/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const license = await License.findById(id);
        if (!license) {
            return res.status(404).json({ success: false, error: 'License not found' });
        }

        if (license.assignedTo) {
            await Organization.findByIdAndUpdate(license.assignedTo, { 'subscription.activeLicense': null });
        }

        await License.findByIdAndDelete(id);
        return res.json({ success: true, message: 'License deleted' });
    } catch (error) {
        console.error('Error deleting license:', error);
        return res.status(500).json({ success: false, error: 'Delete failed' });
    }
});

module.exports = router;
