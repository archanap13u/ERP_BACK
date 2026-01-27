const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('./server/models/Department');

async function checkDepts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const depts = await Department.find({});
        console.log('--- Departments ---');
        depts.forEach(d => {
            console.log(`Name: ${d.name} | ID: ${d._id} | Org: ${d.organizationId} | Panel: ${d.panelType}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkDepts();
