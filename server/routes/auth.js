const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Import models from local CommonJS files
const Employee = require('../models/Employee');
const Student = require('../models/Student');
const Organization = require('../models/Organization');
const Department = require('../models/Department');
const SuperAdmin = require('../models/SuperAdmin');
const StudyCenter = require('../models/StudyCenter');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const cleanUsername = (username || '').trim();
        const cleanPassword = password;

        console.log(`[Auth] 🔑 Login attempt for: "${cleanUsername}"`);

        const userQuery = {
            $or: [
                { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
                { email: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } }
            ]
        };

        // --- Check Super Admin ---
        console.log(`[Auth] 🔍 Searching Super Admin...`);
        const superAdmins = await SuperAdmin.find(userQuery);
        for (const admin of superAdmins) {
            const isMatch = await bcrypt.compare(cleanPassword, admin.password);
            if (isMatch) {
                console.log(`[Auth] ✅ Password Match for SuperAdmin: ${admin.username}`);
                return res.json({
                    success: true,
                    user: {
                        name: admin.fullName,
                        role: 'SuperAdmin',
                        id: admin._id,
                        email: admin.email
                    }
                });
            }
        }

        // --- Check Organization ---
        console.log(`[Auth] 🔍 Searching Organizations...`);
        const organizations = await Organization.find({
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        });
        for (const org of organizations) {
            if (org.password === cleanPassword) {
                if (!org.isActive) {
                    console.warn(`[Auth] ⛔ Organization is deactivated: ${org.name}`);
                    return res.status(403).json({ success: false, error: 'Your organization account has been deactivated. Please contact the administrator.' });
                }
                return res.json({
                    success: true,
                    user: {
                        name: org.name,
                        role: 'OrganizationAdmin',
                        organizationId: org._id
                    }
                });
            }
        }

        // --- Check Department ---
        console.log(`[Auth] 🔍 Searching Departments...`);
        const departments = await Department.find({
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        });
        const deptMatches = departments.filter(d => d.password === cleanPassword);
        if (deptMatches.length > 1) {
            console.warn(`[Auth] ⚠️ Identity Collision (Department): Multiple accounts for "${cleanUsername}"`);
            return res.status(409).json({ success: false, error: 'Ambiguous credentials. Please use an organization-specific identifier or contact support.' });
        }
        if (deptMatches.length === 1) {
            const dept = deptMatches[0];
            console.log(`[Auth] ✅ Password Match for Department: ${dept.username}`);

            if (dept.organizationId) {
                const org = await Organization.findById(dept.organizationId);
                if (org && !org.isActive) {
                    console.warn(`[Auth] ⛔ Organization is deactivated for department: ${dept.username}`);
                    return res.status(403).json({ success: false, error: 'Your organization account has been deactivated. Please contact the administrator.' });
                }
            }

            let role = 'DepartmentAdmin';
            const pType = dept.panelType;

            if (pType === 'HR') role = 'HR';
            else if (pType === 'Operations') role = 'Operations';
            else {
                const deptName = (dept.name || '').toUpperCase();
                if (deptName.includes('HR')) role = 'HR';
                else if (deptName.includes('OPERATIONS')) role = 'Operations';
            }

            return res.json({
                success: true,
                user: {
                    name: dept.name,
                    role: role,
                    organizationId: dept.organizationId,
                    departmentId: dept._id,
                    features: dept.features || []
                }
            });
        }

        // --- Check Study Center ---
        console.log(`[Auth] 🔍 Searching Study Centers...`);
        const centers = await StudyCenter.find({
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        });
        const centerMatches = centers.filter(c => c.password === cleanPassword);
        if (centerMatches.length > 1) {
            console.warn(`[Auth] ⚠️ Identity Collision (StudyCenter): Multiple accounts for "${cleanUsername}"`);
            return res.status(409).json({ success: false, error: 'Ambiguous credentials. Please contact support.' });
        }
        if (centerMatches.length === 1) {
            const center = centerMatches[0];
            console.log(`[Auth] ✅ Password Match for Study Center: ${center.username}`);

            if (center.organizationId) {
                const org = await Organization.findById(center.organizationId);
                if (org && !org.isActive) {
                    console.warn(`[Auth] ⛔ Organization is deactivated for center: ${center.username}`);
                    return res.status(403).json({ success: false, error: 'Your organization account has been deactivated. Please contact the administrator.' });
                }
            }

            return res.json({
                success: true,
                user: {
                    name: center.centerName,
                    role: 'StudyCenter',
                    organizationId: center.organizationId,
                    study_center_id: center._id,
                    study_center_name: center.centerName
                }
            });
        }

        // --- Check Employee ---
        console.log(`[Auth] 🔍 Searching Employees...`);
        const employees = await Employee.find(userQuery);
        const empMatches = employees.filter(e => e.password === cleanPassword);
        if (empMatches.length > 1) {
            console.warn(`[Auth] ⚠️ Identity Collision (Employee): Multiple accounts for "${cleanUsername}"`);
            return res.status(409).json({ success: false, error: 'Ambiguous credentials across organizations.' });
        }
        if (empMatches.length === 1) {
            const emp = empMatches[0];
            console.log(`[Auth] ✅ Password Match for Employee: ${emp.username} (Org: ${emp.organizationId})`);

            // Check if organization is active
            if (emp.organizationId) {
                const org = await Organization.findById(emp.organizationId);
                if (org && !org.isActive) {
                    console.warn(`[Auth] ⛔ Organization is deactivated for employee: ${emp.username}`);
                    return res.status(403).json({ success: false, error: 'Your organization account has been deactivated. Please contact the administrator.' });
                }
            }

            let role = 'Employee';
            const desig = (emp.designation || '').toUpperCase();
            if (desig.includes('HR')) role = 'HR';
            else if (desig.includes('OPERATIONS')) role = 'Operations';

            return res.json({
                success: true,
                user: {
                    name: emp.employeeName,
                    role: role,
                    employeeId: emp.employeeId,
                    organizationId: emp.organizationId
                }
            });
        }

        // --- Check Student ---
        console.log(`[Auth] 🔍 Searching Students...`);
        const students = await Student.find(userQuery);
        const stuMatches = students.filter(s => s.password === cleanPassword);
        if (stuMatches.length > 1) {
            console.warn(`[Auth] ⚠️ Identity Collision (Student): Multiple accounts for "${cleanUsername}"`);
            return res.status(409).json({ success: false, error: 'Ambiguous student credentials.' });
        }
        if (stuMatches.length === 1) {
            const stu = stuMatches[0];
            if (stu.organizationId) {
                const org = await Organization.findById(stu.organizationId);
                if (org && !org.isActive) {
                    console.warn(`[Auth] ⛔ Organization is deactivated for student: ${stu.email}`);
                    return res.status(403).json({ success: false, error: 'Your organization account has been deactivated. Please contact the administrator.' });
                }
            }

            // Enforce Multi-Dept Verification
            if (stu.verificationStatus !== 'Active') {
                console.warn(`[Auth] ⛔ Student login denied. Status: ${stu.verificationStatus} for ${stu.email}`);
                return res.status(403).json({
                    success: false,
                    error: `Login restricted. Your enrollment status is currently "${stu.verificationStatus || 'Pending'}". You can access the portal only after final approval.`
                });
            }

            return res.json({
                success: true,
                user: {
                    name: stu.studentName,
                    role: 'Student',
                    email: stu.email,
                    organizationId: stu.organizationId
                }
            });
        }

        console.warn(`[Auth] ❌ Authentication failed for: "${cleanUsername}"`);
        return res.status(401).json({ success: false, error: 'Invalid username or password' });
    } catch (error) {
        console.error('[Auth] ❌ System Error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/auth/superadmin/login
// POST /api/auth/superadmin/login
router.post('/superadmin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const cleanUsername = String(username).trim();
        const cleanPassword = String(password);

        console.log(`[SuperAdmin Auth] Login attempt for: "${cleanUsername}"`);

        const admin = await SuperAdmin.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
                { email: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } }
            ]
        });

        if (!admin) {
            console.warn(`[SuperAdmin Auth] ❌ Admin not found: "${cleanUsername}"`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        if (!admin.password) {
            console.warn(`[SuperAdmin Auth] ❌ Admin user found but has NO password set: ${admin.username}`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(cleanPassword, admin.password);
        if (!isMatch) {
            console.warn(`[SuperAdmin Auth] ❌ Password mismatch for: "${cleanUsername}"`);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        console.log(`[SuperAdmin Auth] ✅ Login successful for: ${admin.username}`);
        return res.json({
            success: true,
            user: {
                name: admin.fullName,
                role: 'SuperAdmin',
                id: admin._id,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('[SuperAdmin Auth] Error:', error);
        return res.status(500).json({ success: false, error: `Internal server error: ${error.message}` });
    }
});

module.exports = router;
