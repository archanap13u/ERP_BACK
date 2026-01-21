const express = require('express');
const router = express.Router();

// Import models from local CommonJS files
const Organization = require('../../models/Organization');
const Employee = require('../../models/Employee');
const Student = require('../../models/Student');

// GET /api/superadmin/stats
router.get('/', async (req, res) => {
    try {
        const [totalOrganizations, activeOrganizations, totalEmployees, totalStudents] = await Promise.all([
            Organization.countDocuments(),
            Organization.countDocuments({ isActive: true }),
            Employee.countDocuments(),
            Student.countDocuments()
        ]);

        const recentOrganizations = await Organization.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name organizationId createdAt isActive')
            .lean();

        const subscriptionStats = await Organization.aggregate([
            { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
        ]);

        return res.json({
            success: true,
            data: {
                organizations: {
                    total: totalOrganizations,
                    active: activeOrganizations,
                    inactive: totalOrganizations - activeOrganizations
                },
                users: {
                    totalEmployees,
                    totalStudents,
                    total: totalEmployees + totalStudents
                },
                subscriptions: subscriptionStats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                recentOrganizations
            }
        });
    } catch (error) {
        console.error('[SuperAdmin API] Error fetching stats:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
