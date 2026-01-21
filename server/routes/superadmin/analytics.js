const express = require('express');
const router = express.Router();

// Import models from local CommonJS files
const Organization = require('../../models/Organization');
const Employee = require('../../models/Employee');
const Student = require('../../models/Student');

// GET /api/superadmin/analytics
router.get('/', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const organizationGrowth = await Organization.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const employeeGrowth = await Employee.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const memberGrowth = await Student.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const subscriptionStats = await Organization.aggregate([
            { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
        ]);

        const statsAggregation = await Organization.aggregate([
            { $match: { 'subscription.activeLicense': { $exists: true } } },
            {
                $lookup: {
                    from: 'licenses',
                    localField: 'subscription.activeLicense',
                    foreignField: '_id',
                    as: 'licenseDetails'
                }
            },
            { $unwind: '$licenseDetails' },
            { $group: { _id: null, totalRevenue: { $sum: '$licenseDetails.price' } } }
        ]);

        const totalRevenue = statsAggregation.length > 0 ? statsAggregation[0].totalRevenue : 0;

        const topOrganizations = await Organization.aggregate([
            { $lookup: { from: 'employees', localField: '_id', foreignField: 'organizationId', as: 'employees' } },
            { $lookup: { from: 'students', localField: '_id', foreignField: 'organizationId', as: 'members' } },
            {
                $project: {
                    name: 1,
                    organizationId: 1,
                    isActive: 1,
                    'subscription.plan': 1,
                    employeeCount: { $size: '$employees' },
                    memberCount: { $size: '$members' },
                    totalUsers: { $add: [{ $size: '$employees' }, { $size: '$members' }] }
                }
            },
            { $sort: { totalUsers: -1 } },
            { $limit: 10 }
        ]);

        const [totalEmployees, totalMembers, totalOrganizations, activeOrganizations] = await Promise.all([
            Employee.countDocuments(),
            Student.countDocuments(),
            Organization.countDocuments(),
            Organization.countDocuments({ isActive: true })
        ]);

        const previousStart = new Date(startDate);
        previousStart.setDate(previousStart.getDate() - days);

        const [prevOrgs, prevEmployees, prevMembers] = await Promise.all([
            Organization.countDocuments({ createdAt: { $gte: previousStart, $lt: startDate } }),
            Employee.countDocuments({ createdAt: { $gte: previousStart, $lt: startDate } }),
            Student.countDocuments({ createdAt: { $gte: previousStart, $lt: startDate } })
        ]);

        const [currentOrgs, currentEmployees, currentMembers] = await Promise.all([
            Organization.countDocuments({ createdAt: { $gte: startDate } }),
            Employee.countDocuments({ createdAt: { $gte: startDate } }),
            Student.countDocuments({ createdAt: { $gte: startDate } })
        ]);

        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return res.json({
            success: true,
            data: {
                summary: {
                    totalOrganizations,
                    activeOrganizations,
                    totalEmployees,
                    totalMembers,
                    totalUsers: totalEmployees + totalMembers,
                    totalRevenue,
                    growth: {
                        organizations: calculateGrowth(currentOrgs, prevOrgs),
                        employees: calculateGrowth(currentEmployees, prevEmployees),
                        members: calculateGrowth(currentMembers, prevMembers)
                    }
                },
                charts: {
                    organizationGrowth,
                    employeeGrowth,
                    memberGrowth,
                    subscriptionStats: subscriptionStats.reduce((acc, item) => { acc[item._id || 'free'] = item.count; return acc; }, {}),
                    userDistribution: { employees: totalEmployees, members: totalMembers }
                },
                topOrganizations
            }
        });
    } catch (error) {
        console.error('[SuperAdmin Analytics API] Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch analytics data' });
    }
});

module.exports = router;
