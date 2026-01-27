const mongoose = require('mongoose');
require('dotenv').config();
const OpsAnnouncement = require('./server/models/OpsAnnouncement');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const announcements = await OpsAnnouncement.find({}).limit(20);
        console.log('--- BROAD_CHECK ---');
        announcements.forEach(ann => {
            const obj = ann.toObject();
            console.log(`TITLE: ${obj.title} | TC: ${obj.targetCenter} | TSC: ${obj.targetStudyCenter}`);
        });
        process.exit(0);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkData();
