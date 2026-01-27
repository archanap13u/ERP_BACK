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

        console.log(`\n[Auth v2.2] === LOGIN ATTEMPT: "${cleanUsername}" ===`);

        // 1. GLOBAL SCAN (Diagnostic)
        const idRegex = new RegExp(`^${cleanUsername}$`, 'i');

        const [empCheck, stuCheck, deptCheck, orgCheck, superCheck, centerCheck] = await Promise.all([
            Employee.findOne({ $or: [{ username: idRegex }, { email: idRegex }, { employeeId: idRegex }] }),
            Student.findOne({ $or: [{ username: idRegex }, { email: idRegex }] }),
            Department.findOne({ username: idRegex }),
            Organization.findOne({ username: idRegex }),
            SuperAdmin.findOne({ $or: [{ username: idRegex }, { email: idRegex }] }),
            StudyCenter.findOne({ username: idRegex })
        ]);

        console.log(`[Auth Diagnostics] Trace for identifier: "${cleanUsername}"`);
        console.log(`  > Employee Search: ${empCheck ? `FOUND [ID: ${empCheck.employeeId}, User: ${empCheck.username}]` : 'NOT FOUND'}`);
        console.log(`  > Department Search: ${deptCheck ? `FOUND [Name: ${deptCheck.name}, Panel: ${deptCheck.panelType}]` : 'NOT FOUND'}`);

        // --- PRIORITY 1: EMPLOYEE ---
        if (empCheck) {
            console.log(`[Auth Phase] 1. Employee Matching Pattern found for ${empCheck.employeeId}`);
            if (empCheck.password === cleanPassword) {
                console.log(`[Auth Phase] ✅ Password Matched for Employee. ROLE = Employee`);

                if (empCheck.organizationId) {
                    const org = await Organization.findById(empCheck.organizationId);
                    if (org && !org.isActive) return res.status(403).json({ success: false, error: 'Organization deactivated.' });
                }

                const payload = {
                    success: true,
                    user: {
                        name: empCheck.employeeName,
                        role: 'Employee',
                        employeeId: empCheck.employeeId,
                        organizationId: empCheck.organizationId,
                        departmentId: empCheck.departmentId
                    }
                };
                console.log(`[Auth Phase] Sending Employee Payload:`, JSON.stringify(payload));
                return res.json(payload);
            } else {
                console.warn(`[Auth Phase] ❌ Password Mismatch for Employee ${empCheck.employeeId}. Blocking fallthrough.`);
                return res.status(401).json({ success: false, error: 'Invalid username or password' });
            }
        }

        // --- PRIORITY 2: STUDENT ---
        if (stuCheck) {
            console.log(`[Auth Phase] 2. Student Matching Pattern found.`);
            if (stuCheck.password === cleanPassword) {
                console.log(`[Auth Phase] ✅ Password Matched for Student.`);
                if (!stuCheck.isActive) return res.status(403).json({ success: false, error: 'Student account not active.' });
                return res.json({
                    success: true,
                    user: { name: stuCheck.studentName, role: 'Student', organizationId: stuCheck.organizationId }
                });
            } else {
                console.warn(`[Auth Phase] ❌ Password Mismatch for Student. Blocking fallthrough.`);
                return res.status(401).json({ success: false, error: 'Invalid username or password' });
            }
        }

        // --- PRIORITY 3: ADMIN ROLES (Fallthrough) ---
        console.log(`[Auth Phase] 3. No Individual Identity found. Checking Administrative roles...`);

        if (superCheck) {
            const isMatch = await bcrypt.compare(cleanPassword, superCheck.password);
            if (isMatch) {
                console.log(`[Auth Phase] Matched SuperAdmin`);
                return res.json({ success: true, user: { name: superCheck.fullName, role: 'SuperAdmin' } });
            }
        }

        if (orgCheck && orgCheck.password === cleanPassword) {
            if (!orgCheck.isActive) return res.status(403).json({ success: false, error: 'Organization deactivated.' });
            console.log(`[Auth Phase] Matched Organization ${orgCheck.name}`);
            return res.json({ success: true, user: { name: orgCheck.name, role: 'OrganizationAdmin', organizationId: orgCheck._id } });
        }

        if (deptCheck && deptCheck.password === cleanPassword) {
            console.log(`[Auth Phase] Matched Department ${deptCheck.name}`);
            let role = 'DepartmentAdmin';
            if (deptCheck.panelType === 'HR') role = 'HR';
            else if (deptCheck.panelType === 'Operations' || deptCheck.panelType === 'Education') role = 'Operations';
            else if (deptCheck.panelType === 'Finance') role = 'Finance';

            const payload = {
                success: true,
                user: {
                    name: deptCheck.name,
                    role: role,
                    departmentId: deptCheck._id,
                    organizationId: deptCheck.organizationId,
                    panelType: deptCheck.panelType || 'Admin'
                }
            };
            console.log(`[Auth Phase] Sending Admin Payload:`, JSON.stringify(payload));
            return res.json(payload);
        }

        if (centerCheck && centerCheck.password === cleanPassword) {
            console.log(`[Auth Phase] Matched Study Center`);
            return res.json({
                success: true,
                user: {
                    id: centerCheck._id,
                    name: centerCheck.centerName,
                    role: 'StudyCenter',
                    organizationId: centerCheck.organizationId,
                    study_center_id: centerCheck._id,
                    study_center_name: centerCheck.centerName,
                    centerName: centerCheck.centerName
                }
            });
        }

        console.warn(`[Auth Phase] ❌ NO MATCH for "${cleanUsername}"`);
        return res.status(401).json({ success: false, error: 'Invalid username or password' });
    } catch (error) {
        console.error('[Auth Phase] Critical Error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// POST /api/auth/superadmin/login
router.post('/superadmin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const cleanUsername = String(username).trim();
        const cleanPassword = String(password);

        const admin = await SuperAdmin.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
                { email: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } }
            ]
        });

        if (!admin || !admin.password) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(cleanPassword, admin.password);
        if (!isMatch) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        return res.json({
            success: true,
            user: { name: admin.fullName, role: 'SuperAdmin', id: admin._id, email: admin.email }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
