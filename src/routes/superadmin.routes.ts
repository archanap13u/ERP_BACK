import { Router, Request, Response } from 'express';
import Organization from '../models/Organization';
import Employee from '../models/Employee';
import Student from '../models/Student';
import License from '../models/License';
import PlatformSettings from '../models/PlatformSettings';
import { models } from '../models'; // Import all registered models
import mongoose from 'mongoose';

const router = Router();

router.get('/analytics', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string || '30');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get organization growth over time
        const organizationGrowth = await Organization.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get user registration trends
        const employeeGrowth = await Employee.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const studentGrowth = await Student.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get subscription distribution
        const subscriptionStats = await Organization.aggregate([
            { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
        ]);

        // Get top organizations by user count
        const topOrganizations = await Organization.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: '_id',
                    foreignField: 'organizationId',
                    as: 'employees'
                }
            },
            {
                $lookup: {
                    from: 'students',
                    localField: '_id',
                    foreignField: 'organizationId',
                    as: 'students'
                }
            },
            {
                $project: {
                    name: 1,
                    organizationId: 1,
                    isActive: 1,
                    'subscription.plan': 1,
                    employeeCount: { $size: '$employees' },
                    studentCount: { $size: '$students' },
                    totalUsers: { $add: [{ $size: '$employees' }, { $size: '$students' }] }
                }
            },
            { $sort: { totalUsers: -1 } },
            { $limit: 10 }
        ]);

        const [totalEmployees, totalStudents, totalOrganizations, activeOrganizations] = await Promise.all([
            Employee.countDocuments(),
            Student.countDocuments(),
            Organization.countDocuments(),
            Organization.countDocuments({ isActive: true })
        ]);

        const previousStart = new Date(startDate);
        previousStart.setDate(previousStart.getDate() - days);

        const [prevOrgs, prevEmployees, prevStudents] = await Promise.all([
            Organization.countDocuments({ createdAt: { $gte: previousStart, $lt: startDate } }),
            Employee.countDocuments({ createdAt: { $gte: previousStart, $lt: startDate } }),
            Student.countDocuments({ createdAt: { $gte: previousStart, $lt: startDate } })
        ]);

        const [currentOrgs, currentEmployees, currentStudents] = await Promise.all([
            Organization.countDocuments({ createdAt: { $gte: startDate } }),
            Employee.countDocuments({ createdAt: { $gte: startDate } }),
            Student.countDocuments({ createdAt: { $gte: startDate } })
        ]);

        const calculateGrowth = (current: number, previous: number) => {
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
                    totalStudents,
                    totalUsers: totalEmployees + totalStudents,
                    growth: {
                        organizations: calculateGrowth(currentOrgs, prevOrgs),
                        employees: calculateGrowth(currentEmployees, prevEmployees),
                        students: calculateGrowth(currentStudents, prevStudents)
                    }
                },
                charts: {
                    organizationGrowth,
                    employeeGrowth,
                    studentGrowth,
                    subscriptionStats: subscriptionStats.reduce((acc: any, item: any) => {
                        acc[item._id || 'free'] = item.count;
                        return acc;
                    }, {}),
                    userDistribution: {
                        employees: totalEmployees,
                        students: totalStudents
                    }
                },
                topOrganizations
            }
        });

    } catch (error: any) {
        console.error('[SuperAdmin Analytics API] Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch analytics data' });
    }
});

router.get('/stats', async (req: Request, res: Response) => {
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
                subscriptions: subscriptionStats.reduce((acc: any, item: any) => {
                    acc[item._id || 'free'] = item.count;
                    return acc;
                }, {}),
                recentOrganizations
            }
        });
    } catch (error: any) {
        console.error('[SuperAdmin Stats API] Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
    }
});

// --- Organization Management ---

router.get('/organizations', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string || '1');
        const limit = parseInt(req.query.limit as string || '10');
        const search = req.query.search as string || '';
        const status = req.query.status as string;

        const skip = (page - 1) * limit;
        const query: any = {};
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
            organizations.map(async (org: any) => {
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
    } catch (error: any) {
        return res.status(500).json({ success: false, error: 'Failed to fetch organizations' });
    }
});

router.post('/organizations', async (req: Request, res: Response) => {
    try {
        const { name, domain, username, password, adminId, subscription, createdBy } = req.body;
        if (!name || !createdBy || !username || !password) {
            return res.status(400).json({ success: false, error: 'Organization name, username, password and creator are required' });
        }

        const organizationId = `ORG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

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
                startDate: new Date()
            },
            createdBy,
            isActive: true
        });

        if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
            await Employee.findByIdAndUpdate(adminId, { isOrgAdmin: true, organizationId: organization._id });
        }

        return res.status(201).json({ success: true, data: organization });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/organizations/:id', async (req: Request, res: Response) => {
    try {
        const organization = await Organization.findById(req.params.id)
            .populate('adminId', 'employeeName email designation')
            .populate('createdBy', 'fullName email')
            .populate('subscription.activeLicense', 'name type duration')
            .lean();

        if (!organization) return res.status(404).json({ success: false, error: 'Organization not found' });

        const [employeeCount, studentCount] = await Promise.all([
            Employee.countDocuments({ organizationId: organization._id }),
            Student.countDocuments({ organizationId: organization._id })
        ]);

        return res.json({
            success: true,
            data: { ...organization, stats: { employeeCount, studentCount, totalUsers: employeeCount + studentCount } }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to fetch organization' });
    }
});

router.put('/organizations/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const organization = await Organization.findById(id);
        if (!organization) return res.status(404).json({ success: false, error: 'Organization not found' });

        const body = { ...req.body };

        // Handle empty domain - must unset it for sparse unique index to work
        const updateOp: any = { ...body };
        if (body.domain === '') {
            delete updateOp.domain;
            updateOp.$unset = { domain: 1 };
        } else if (body.domain) {
            updateOp.domain = body.domain.toLowerCase().trim();
        }

        const updatedOrg = await Organization.findByIdAndUpdate(id, updateOp, { new: true, runValidators: true });

        if (body.adminId && body.adminId !== organization.adminId?.toString()) {
            if (organization.adminId) await Employee.findByIdAndUpdate(organization.adminId, { isOrgAdmin: false });
            await Employee.findByIdAndUpdate(body.adminId, { isOrgAdmin: true, organizationId: organization._id });
        }

        return res.json({ success: true, data: updatedOrg });
    } catch (error: any) {
        console.error('[SuperAdmin API] Error updating organization:', error);
        return res.status(500).json({ success: false, error: 'Failed to update organization: ' + error.message });
    }
});

router.delete('/organizations/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const organization = await Organization.findById(id);
        if (!organization) return res.status(404).json({ success: false, error: 'Organization not found' });

        // Cascading delete for all related records in other models
        const modelNames = Object.keys(models);
        for (const name of modelNames) {
            const Model = models[name];
            // Skip core/global models or the organization model itself
            if (['organization', 'superadmin', 'platformsettings'].includes(name.toLowerCase())) continue;

            try {
                // Delete all records belonging to this organization
                await Model.deleteMany({ organizationId: organization._id });
            } catch (err) {
                console.error(`[Cascading Delete] Error cleaning up ${name}:`, err);
                // Continue with other models even if one fails
            }
        }

        await Organization.findByIdAndDelete(id);
        return res.json({ success: true, message: 'Organization and all associated data deleted permanently' });
    } catch (error) {
        console.error('[SuperAdmin API] Error deleting organization:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete organization' });
    }
});

export default router;
