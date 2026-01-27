const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('./server/models/Department');

async function getOrgId() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const d = await Department.findOne({ name: 'hr' });
        if (d) {
            console.log('ORG_ID:' + d.organizationId.toString());
        } else {
            const any = await Department.findOne({});
            if (any) console.log('ORG_ID:' + any.organizationId.toString());
            else console.log('NONE');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
getOrgId();
