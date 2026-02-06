import { Router, Request, Response } from 'express';
import Employee from '../models/Employee';
import Student from '../models/Student';
import Organization from '../models/Organization';
import Department from '../models/Department';
import SuperAdmin from '../models/SuperAdmin';
import StudyCenter from '../models/StudyCenter';
import { verifyPassword } from '../lib/auth';

const router = Router();


router.post('/login', async (req: Request, res: Response) => {
    console.log(`[Auth] 📥 Login POST received:`, JSON.stringify(req.body));
    try {
        const { username, password } = req.body;
        const cleanUsername = (username || '').toString().trim();
        const cleanPassword = (password || '').toString();

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
        console.log(`[Auth] Checked Organization: Found ${organizations.length}`);
        for (const org of organizations) {
            const dbPass = (org.password || '').toString().trim();
            const providedPass = cleanPassword.trim();
            if (dbPass === providedPass) {
                console.log(`[Auth] ✓ Organization Login Success: ${org.name}`);
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
        console.log(`[Auth] Checked Department: Found ${departments.length}`);
        for (const dept of departments) {
            const dbPass = (dept.password || '').toString().trim();
            const providedPass = cleanPassword.trim();
            if (dbPass === providedPass) {
                console.log(`[Auth] ✓ Department Login Success: ${dept.name}`);
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
        console.log(`[Auth] Checked Employee: Found ${employees.length}`);
        for (const emp of employees) {
            if (emp.password === cleanPassword) {
                console.log(`[Auth] ✓ Employee Login Success: ${emp.employeeName}`);
                let role = 'Employee';
                const desig = (emp.designation || '').toUpperCase();
                const isAdminDesig = desig.includes('MANAGER') || desig.includes('ADMIN') || desig.includes('HOD') || desig.includes('LEAD') || desig.includes('DIRECTOR') || desig.includes('HEAD');

                if (isAdminDesig) {
                    if (desig.includes('HR') || desig.includes('HUMAN RESOURCE')) role = 'HR';
                    else if (desig.includes('OPERATIONS')) role = 'Operations';
                    else if (desig.includes('FINANCE')) role = 'Finance';
                }

                if (desig.includes('BDE') || desig.includes('SALES') || desig.includes('BUSINESS DEVELOPMENT') || desig.includes('MARKETING')) role = 'BDE';

                let panelType = 'Generic';
                if (emp.departmentId) {
                    const dept = await Department.findById(emp.departmentId);
                    if (dept) panelType = dept.panelType || 'Generic';
                }

                // Force Sales panel for BDE role to ensure dashbrd visibility
                if (role === 'BDE' && (!panelType || panelType === 'Generic')) {
                    panelType = 'Sales';
                }

                return res.json({
                    success: true,
                    user: {
                        name: emp.employeeName,
                        role: role,
                        employeeId: emp.employeeId,
                        designation: emp.designation,
                        organizationId: emp.organizationId,
                        departmentId: emp.departmentId,
                        panelType: panelType
                    }
                });
            }
        }

        // --- Check Student ---
        const students = await Student.find(userQuery);
        console.log(`[Auth] Checked Student: Found ${students.length}`);
        for (const stu of students) {
            if (stu.password === cleanPassword) {
                if (!stu.isActive) {
                    console.warn(`[Auth] ❌ Student Login blocked: Account "${stu.studentName}" is not yet Active/Approved.`);
                    return res.status(403).json({ success: false, error: 'Your account is pending approval from the Finance team.' });
                }
                console.log(`[Auth] ✓ Student Login Success: ${stu.studentName}`);
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

        // --- Check StudyCenter ---
        const centerQuery = {
            $or: [
                { username: { $regex: new RegExp(`^\\s*${cleanUsername}\\s*$`, 'i') } },
                { email: { $regex: new RegExp(`^\\s*${cleanUsername}\\s*$`, 'i') } },
                { centerName: { $regex: new RegExp(`^\\s*${cleanUsername}\\s*$`, 'i') } }
            ]
        };
        const centers = await StudyCenter.find(centerQuery);
        console.log(`[Auth] Checked StudyCenter: Found ${centers.length}`);

        for (const center of centers) {
            const dbPass = (center.password || '').toString().trim();
            const providedPass = cleanPassword.trim();

            console.log(`[Auth] Checking Center: "${center.centerName}" | DB Pass: "${dbPass}" | Provided: "${providedPass}"`);

            if (dbPass === providedPass) {
                console.log(`[Auth] ✓ StudyCenter Login Success: ${center.centerName}`);
                return res.json({
                    success: true,
                    user: {
                        id: center._id,
                        _id: center._id,
                        name: center.centerName,
                        role: 'StudyCenter',
                        studyCenterId: center._id,
                        studyCenterName: center.centerName,
                        centerName: center.centerName,
                        organizationId: center.organizationId
                    }
                });
            }
        }

        if (centers.length > 0) {
            console.warn(`[Auth] ❌ StudyCenter Login failed: Found ${centers.length} records, but password mismatch for "${cleanUsername}"`);
            console.log(`[Auth] Debug - Entered Pass: "${cleanPassword}"`);
        } else {
            console.warn(`[Auth] ❌ StudyCenter Login failed: No user found with identifier "${cleanUsername}"`);
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
