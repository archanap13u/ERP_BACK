const mongoose = require('mongoose');
const { Schema } = mongoose;

const DepartmentSchema = new Schema({
    name: String,
    panelType: String
}, { strict: false });

const EmployeeSchema = new Schema({
    department: String,
    departmentId: Schema.Types.ObjectId
}, { strict: false });

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/education_erp');
        console.log('Connected to DB');

        const Department = mongoose.model('Department', DepartmentSchema);
        const Employee = mongoose.model('Employee', EmployeeSchema);

        const dept = await Department.findOne({ name: 'sa' });
        if (dept) {
            console.log(`Found department 'sa' (ID: ${dept._id}). Renaming to 'Sales'...`);
            dept.name = 'Sales';
            await dept.save();
            console.log('Department renamed.');
        } else {
            console.log("Department 'sa' not found.");
        }

        console.log('Disconnecting...');
        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}
run();
