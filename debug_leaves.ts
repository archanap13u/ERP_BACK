import mongoose from 'mongoose';

// Hardcoded URI for debugging
const MONGO_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

const checkData = async () => {
    try {
        console.log('Connecting to Mongo...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Generic Schema for flexibility
        const LeaveRequest = mongoose.connection.collection('leaverequests');
        const Employee = mongoose.connection.collection('employees');
        const Department = mongoose.connection.collection('departments');

        console.log('\n--- FINDING EMPLOYEE: Arun ---');
        // Regex search for Arun
        const employees = await Employee.find({
            employeeName: { $regex: /Arun/i }
        }).toArray();

        if (employees.length === 0) {
            console.log('No employee found with name matching "Arun"');
        } else {
            for (const emp of employees) {
                console.log(`Found Employee: ${emp.employeeName} (ID: ${emp.employeeId})`);
                console.log(`- _id: ${emp._id}`);
                console.log(`- Department: ${emp.department} (ID: ${emp.departmentId})`);
                console.log(`- OrganizationId: ${emp.organizationId}`);

                // Find Department details
                if (emp.departmentId) {
                    const dept = await Department.findOne({ _id: new mongoose.Types.ObjectId(emp.departmentId) });
                    console.log(`- Linked Dept Metadata: Name=${dept?.name}, PanelType=${dept?.panelType}`);
                }
            }
        }

        console.log('\n--- FINDING LEAVE REQUESTS FOR ARUN ---');
        // Find leaves for these employees
        for (const emp of employees) {
            console.log(`\nChecking leaves for ${emp.employeeName} (${emp._id}):`);
            const leaves = await LeaveRequest.find({
                $or: [
                    { employeeId: emp.employeeId },
                    { employeeName: emp.employeeName }
                ]
            }).toArray();

            if (leaves.length === 0) console.log('No leave requests found.');

            for (const leave of leaves) {
                console.log(`> Leave Request: ${leave._id}`);
                console.log(`  - Status: "${leave.status}"`);
                console.log(`  - Department: "${leave.department}"`);
                console.log(`  - DepartmentId: "${leave.departmentId}"`);
                console.log(`  - OrganizationId: "${leave.organizationId}"`);
                console.log(`  - Dates: ${leave.fromDate} to ${leave.toDate}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
