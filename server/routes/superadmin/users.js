const express = require('express');
const router = express.Router();

// Import models from local CommonJS files
const Employee = require('../../models/Employee');
const Student = require('../../models/Student');
const Organization = require('../../models/Organization');

// GET /api/superadmin/users
router.get('/', async (req, res) => {
    try {
        const userType = req.query.type || 'all';
        const organizationId = req.query.organizationId;
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let employees = [];
        let students = [];
        let totalEmployees = 0;
        let totalStudents = 0;

        const searchQuery = search ? {
            $or: [
                { employeeName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const studentSearchQuery = search ? {
            $or: [
                { studentName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const orgFilter = organizationId ? { organizationId } : {};

        if (userType === 'all' || userType === 'employee') {
            const employeeQuery = { ...searchQuery, ...orgFilter };
            [employees, totalEmployees] = await Promise.all([
                Employee.find(employeeQuery)
                    .select('employeeName email username designation role isActive createdAt organizationId')
                    .populate('organizationId', 'name organizationId')
                    .sort({ createdAt: -1 })
                    .skip(userType === 'employee' ? skip : 0)
                    .limit(userType === 'employee' ? limit : Math.floor(limit / 2))
                    .lean(),
                Employee.countDocuments(employeeQuery)
            ]);
        }

        if (userType === 'all' || userType === 'student') {
            const studentQuery = { ...studentSearchQuery, ...orgFilter };
            [students, totalStudents] = await Promise.all([
                Student.find(studentQuery)
                    .select('studentName email username class section isActive createdAt organizationId')
                    .populate('organizationId', 'name organizationId')
                    .sort({ createdAt: -1 })
                    .skip(userType === 'student' ? skip : 0)
                    .limit(userType === 'student' ? limit : Math.floor(limit / 2))
                    .lean(),
                Student.countDocuments(studentQuery)
            ]);
        }

        const formattedEmployees = employees.map(emp => ({
            _id: emp._id,
            name: emp.employeeName,
            email: emp.email,
            username: emp.username,
            role: emp.role || 'Employee',
            designation: emp.designation,
            type: 'employee',
            isActive: emp.isActive !== false,
            createdAt: emp.createdAt,
            organization: emp.organizationId ? {
                _id: emp.organizationId._id,
                name: emp.organizationId.name,
                organizationId: emp.organizationId.organizationId
            } : null
        }));

        const formattedStudents = students.map(std => ({
            _id: std._id,
            name: std.studentName,
            email: std.email,
            username: std.username,
            role: 'Student',
            designation: std.class ? `${std.class}${std.section ? ` - ${std.section}` : ''}` : null,
            type: 'student',
            isActive: std.isActive !== false,
            createdAt: std.createdAt,
            organization: std.organizationId ? {
                _id: std.organizationId._id,
                name: std.organizationId.name,
                organizationId: std.organizationId.organizationId
            } : null
        }));

        const allUsers = [...formattedEmployees, ...formattedStudents]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const organizations = await Organization.find()
            .select('name organizationId')
            .sort({ name: 1 })
            .lean();

        return res.json({
            success: true,
            data: {
                users: allUsers,
                pagination: {
                    page,
                    limit,
                    totalEmployees,
                    totalStudents,
                    total: totalEmployees + totalStudents,
                    totalPages: Math.ceil((totalEmployees + totalStudents) / limit)
                },
                organizations
            }
        });
    } catch (error) {
        console.error('[SuperAdmin Users API] Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

module.exports = router;
