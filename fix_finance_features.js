const mongoose = require('mongoose');
require('dotenv').config();
const { Schema } = mongoose;

const DepartmentSchema = new Schema({}, { strict: false });
const Department = mongoose.model('Department', DepartmentSchema);

async function checkAndFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find Finance Departments
        const depts = await Department.find({
            $or: [{ panelType: 'Finance' }, { name: 'Finance' }]
        });

        console.log(`Found ${depts.length} Finance Departments.`);

        for (const d of depts) {
            console.log(`Dept: ${d.name} (${d._id})`);
            console.log(`Current Features:`, d.features);

            if (!d.features || !d.features.includes('STUDENTS')) {
                console.log('Adding "STUDENTS" feature...');
                d.features = d.features || [];
                d.features.push('STUDENTS');
                await Department.updateOne({ _id: d._id }, { $set: { features: d.features } });
                console.log('Updated.');
            } else {
                console.log('"STUDENTS" feature already present.');
            }
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkAndFix();
