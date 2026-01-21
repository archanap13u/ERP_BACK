const mongoose = require('mongoose');

async function checkEmployees() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/erpnext');
        console.log('Connected to MongoDB');

        const EmployeeSchema = new mongoose.Schema({}, { strict: false });
        const Employee = mongoose.model('Employee', EmployeeSchema, 'employees');

        const employees = await Employee.find({}).sort({ createdAt: -1 }).limit(5);
        console.log(`\nLast ${employees.length} employees:`);

        for (const emp of employees) {
            console.log(`\nName: ${emp.employeeName}`);
            console.log(`- Dept: ${emp.department}`);
            console.log(`- DeptId: ${emp.departmentId}`);
            console.log(`- OrgId: ${emp.organizationId}`);
            console.log(`- AddedByDeptId: ${emp.addedByDepartmentId}`);
            console.log(`- AddedByDeptName: ${emp.addedByDepartmentName}`);
            console.log(`- CreatedAt: ${emp.createdAt}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkEmployees();
