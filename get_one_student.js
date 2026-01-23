require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');

async function list() {
    await connectDB();
    const s = await Student.findOne({ verificationStatus: { $ne: 'Active' } });
    if (s) {
        console.log(`STU_ID=${s._id}`);
        console.log(`ORG_ID=${s.organizationId}`);
        console.log(`NAME=${s.studentName}`);
        console.log(`STATUS=${s.verificationStatus}`);
    } else {
        const s2 = await Student.findOne({});
        if (s2) {
            console.log(`STU_ID=${s2._id}`);
            console.log(`ORG_ID=${s2.organizationId}`);
            console.log(`NAME=${s2.studentName}`);
            console.log(`STATUS=${s2.verificationStatus}`);
        }
    }
    mongoose.disconnect();
}

list().catch(console.error);
