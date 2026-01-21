const mongoose = require('mongoose');

async function checkEmployees() {
    try {
        await mongoose.connect('mongodb://localhost:27017/erpnext');
        console.log('Connected to MongoDB');

        const EmployeeSchema = new mongoose.Schema({}, { strict: false });
        const Employee = mongoose.model('Employee', EmployeeSchema, 'employees');

        const DepartmentSchema = new mongoose.Schema({}, { strict: false });
        const Department = mongoose.model('Department', DepartmentSchema, 'departments');

        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees total.`);

        for (const emp of employees) {
            console.log(`\nEmployee: ${emp.employeeName} (${emp.employeeId})`);
            console.log(`- OrgId: ${emp.organizationId}`);
            console.log(`- Dept: ${emp.department}`);
            console.log(`- DeptId: ${emp.departmentId}`);
            console.log(`- AddedByDeptId: ${emp.addedByDepartmentId}`);
            console.log(`- AddedByDeptName: ${emp.addedByDepartmentName}`);
        }

        const depts = await Department.find({});
        console.log(`\nFound ${depts.length} departments total.`);
        for (const d of depts) {
            console.log(`- Dept: ${d.name} (_id: ${d._id}, panelType: ${d.panelType})`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkEmployees();
