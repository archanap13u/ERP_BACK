const mongoose = require('mongoose');
require('dotenv').config();
const Department = require('./server/models/Department');

async function getOrgId() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const d = await Department.findOne({ name: 'hr' });
        if (d) {
            console.log('ID_START' + d.organizationId.toString() + 'ID_END');
        } else {
            console.log('NOTFOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
getOrgId();
