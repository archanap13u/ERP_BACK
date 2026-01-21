const mongoose = require('mongoose');
require('dotenv').config();
const { models } = require('./server/models');

async function audit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erpnext');
        console.log('--- StudyCenter Audit ---');

        const centers = await models.studycenter.find({}).lean();
        console.log(`TOTAL CENTERS IN DB: ${centers.length}`);

        const orgs = {};
        const orphans = [];

        centers.forEach(c => {
            const orgId = c.organizationId ? c.organizationId.toString() : 'MISSING';
            if (orgId === 'MISSING') {
                orphans.push(c);
            } else {
                orgs[orgId] = (orgs[orgId] || 0) + 1;
            }
        });

        console.log('Centers per Organization:');
        Object.entries(orgs).forEach(([orgId, count]) => {
            console.log(`Org ${orgId}: ${count} centers`);
        });

        if (orphans.length > 0) {
            console.warn(`CRITICAL: ${orphans.length} centers are MISSING organizationId!`);
            orphans.forEach(o => console.log(` - ${o.centerName} (${o._id})`));
        } else {
            console.log('All centers have an organizationId.');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

audit();
