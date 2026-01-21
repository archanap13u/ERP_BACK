const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const Department = mongoose.model('Department', new mongoose.Schema({
            name: String,
            organizationId: String,
            username: String
        }), 'departments');

        const Employee = mongoose.model('Employee', new mongoose.Schema({
            employeeName: String,
            organizationId: String,
            departmentId: String,
            username: String
        }), 'employees');

        const Student = mongoose.model('Student', new mongoose.Schema({
            studentName: String,
            organizationId: String,
            departmentId: String,
            username: String
        }), 'students');

        const Organization = mongoose.model('Organization', new mongoose.Schema({
            name: String
        }), 'organizations');

        console.log('\n--- Auditing Departments ---');
        const depts = await Department.find({ username: { $exists: true, $ne: '' } });
        for (const d of depts) {
            const orgExists = await Organization.exists({ _id: d.organizationId });
            if (!orgExists || !d.name) {
                console.log(`ORPHANED DEPT: ID=${d._id}, Name=${d.name}, OrgID=${d.organizationId}, Username=${d.username}`);
            }
        }

        console.log('\n--- Auditing Employees ---');
        const emps = await Employee.find({ username: { $exists: true, $ne: '' } });
        for (const e of emps) {
            const orgExists = await Organization.exists({ _id: e.organizationId });
            const deptExists = await Department.exists({ _id: e.departmentId });
            if (!orgExists || !deptExists) {
                console.log(`ORPHANED EMPLOYEE: ID=${e._id}, Name=${e.employeeName}, OrgID=${e.organizationId}, DeptID=${e.departmentId}, Username=${e.username}`);
            }
        }

        console.log('\n--- Auditing Students ---');
        const stus = await Student.find({ username: { $exists: true, $ne: '' } });
        for (const s of stus) {
            const orgExists = await Organization.exists({ _id: s.organizationId });
            const deptExists = await Department.exists({ _id: s.departmentId });
            if (!orgExists || !deptExists) {
                console.log(`ORPHANED STUDENT: ID=${s._id}, Name=${s.studentName}, OrgID=${s.organizationId}, DeptID=${s.departmentId}, Username=${s.username}`);
            }
        }

        console.log('\nAudit complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
