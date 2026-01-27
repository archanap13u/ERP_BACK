const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('./server/models/Department');

async function checkDepts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const depts = await Department.find({});
        console.log('--- ALL_DEPTS_CHECK ---');
        console.log('Total count:', depts.length);

        depts.forEach(d => {
            console.log(`- Dept: "${d.name}"`);
            console.log(`  ID: ${d._id}`);
            console.log(`  OrgID: ${d.organizationId} (${typeof d.organizationId})`);
            console.log(`  Panel: ${d.panelType}`);
            console.log('---');
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkDepts();
