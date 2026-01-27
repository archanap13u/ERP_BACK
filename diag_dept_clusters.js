const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('./server/models/Department');

async function checkDepts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const allDepts = await Department.find({});
        console.log('--- ALL DEPARTMENTS IN DB ---');
        allDepts.forEach(d => {
            console.log(`Name: "${d.name}" | OrgID: ${d.organizationId} | Type: ${typeof d.organizationId} | Prototype: ${d.organizationId ? d.organizationId.constructor.name : 'N/A'}`);
        });

        // Group by OrgID string to see clusters
        const clusters = {};
        allDepts.forEach(d => {
            const oid = d.organizationId ? d.organizationId.toString() : 'NONE';
            if (!clusters[oid]) clusters[oid] = [];
            clusters[oid].push(d.name);
        });
        console.log('\n--- ORG ID CLUSTERS ---');
        console.log(JSON.stringify(clusters, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkDepts();
