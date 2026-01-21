import { Router, Request, Response } from 'express';
import Employee from '../models/Employee';
import Student from '../models/Student';
import Organization from '../models/Organization';
import Department from '../models/Department';
import SuperAdmin from '../models/SuperAdmin';
import { verifyPassword } from '../lib/auth';

const router = Router();


router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const cleanUsername = username.trim();
        const cleanPassword = password;

        console.log(`[Auth] 🔑 Login attempt for: "${cleanUsername}"`);

        const userQuery = {
            $or: [
                { username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } },
                { email: { $regex: new RegExp(`^${cleanUsername}$`, 'i') } }
            ]
        };

        // --- Check Organization ---
        const organizations = await Organization.find({
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        });
        for (const org of organizations) {
            if (org.password === cleanPassword) {
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
        const departments = await Department.find({
            username: { $regex: new RegExp(`^${cleanUsername}$`, 'i') }
        });
        for (const dept of departments) {
            if (dept.password === cleanPassword) {
                return res.json({
                    success: true,
                    user: {
                        name: dept.name,
                        role: 'DepartmentAdmin',
                        organizationId: dept.organizationId,
                        departmentId: dept._id,
                        panelType: dept.panelType
                    }
                });
            }
        }

        // --- Check Employee ---
        const employees = await Employee.find(userQuery);
        for (const emp of employees) {
            if (emp.password === cleanPassword) {
                let role = 'Employee';
                const desig = (emp.designation || '').toUpperCase();
                if (desig.includes('HR')) role = 'HR';
                else if (desig.includes('OPERATIONS')) role = 'Operations';
                else if (desig.includes('FINANCE')) role = 'Finance';

                let panelType = 'Generic';
                if (emp.departmentId) {
                    const dept = await Department.findById(emp.departmentId);
                    if (dept) panelType = dept.panelType || 'Generic';
                }

                return res.json({
                    success: true,
                    user: {
                        name: emp.employeeName,
                        role: role,
                        employeeId: emp.employeeId,
                        organizationId: emp.organizationId,
                        departmentId: emp.departmentId,
                        panelType: panelType
                    }
                });
            }
        }

        // --- Check Student ---
        const students = await Student.find(userQuery);
        for (const stu of students) {
            if (stu.password === cleanPassword) {
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
        }

        return res.status(401).json({ success: false, error: 'Invalid username or password' });
    } catch (error: any) {
        console.error('[Auth] ❌ System Error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.post('/superadmin/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        console.log(`[SuperAdmin Auth] Login attempt for: "${username}"`);

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const superAdmin = await SuperAdmin.findOne({
            $or: [
                { username: username.toLowerCase().trim() },
                { email: username.toLowerCase().trim() }
            ]
        });

        if (!superAdmin) {
            console.warn(`[SuperAdmin Auth] ❌ No super admin found for: "${username}"`);
            return res.json({ success: false, error: 'Invalid credentials' });
        }

        if (!superAdmin.isActive) {
            console.warn(`[SuperAdmin Auth] ❌ Inactive account: "${username}"`);
            return res.status(403).json({ success: false, error: 'Account is inactive' });
        }

        if (!superAdmin.password) {
            console.warn(`[SuperAdmin Auth] ❌ Corrupted record for: "${username}" (Missing password)`);
            return res.json({ success: false, error: 'Invalid credentials' });
        }

        const isPasswordValid = await verifyPassword(password, superAdmin.password);

        if (!isPasswordValid) {
            console.warn(`[SuperAdmin Auth] ❌ Invalid password for: "${username}"`);
            return res.json({ success: false, error: 'Invalid credentials' });
        }

        console.log(`[SuperAdmin Auth] ✓ Successful login: ${superAdmin.fullName}`);

        return res.json({
            success: true,
            user: {
                id: superAdmin._id,
                username: superAdmin.username,
                email: superAdmin.email,
                fullName: superAdmin.fullName,
                role: 'SuperAdmin'
            }
        });

    } catch (error: any) {
        console.error('[SuperAdmin Auth] ❌ System Error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

export default router;
