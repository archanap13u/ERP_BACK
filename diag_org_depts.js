const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('./server/models/Department');

async function checkDepts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const depts = await Department.find({});
        if (depts.length === 0) {
            console.log('NO_DEPTS_FOUND');
            process.exit(0);
        }

        const orgId = depts[0].organizationId;
        console.log('--- DB Check for Org:', orgId, '---');

        const orgDepts = await Department.find({ organizationId: orgId });
        console.log('Count for this org:', orgDepts.length);
        orgDepts.forEach(d => {
            console.log(`Dept: "${d.name}" | ID: ${d._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkDepts();
