const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = 'mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP';

async function diagnostic() {
    let output = '';
    const log = (msg) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        await mongoose.connect(MONGODB_URI);
        log('Connected to MongoDB');

        const db = mongoose.connection.db;

        const orgs = await db.collection('organizations').find({}).toArray();
        log(`\nTotal Organizations in DB: ${orgs.length}`);
        orgs.forEach(o => {
            log(`- ${o.name} (ID: ${o._id}, orgId: ${o.organizationId})`);
        });

        const depts = await db.collection('departments').find({}).toArray();
        log(`\nTotal Departments in DB: ${depts.length}`);
        depts.forEach(d => {
            log(`- ${d.name} (ID: ${d._id}, orgId: ${d.organizationId})`);
        });

        await mongoose.disconnect();
    } catch (e) {
        log(e.toString());
    } finally {
        fs.writeFileSync('db-report.txt', output);
    }
}

diagnostic();
