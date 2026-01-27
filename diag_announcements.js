const mongoose = require('mongoose');
require('dotenv').config();
const OpsAnnouncement = require('./server/models/OpsAnnouncement');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const ann = await OpsAnnouncement.findOne({});
        if (ann) {
            const obj = ann.toObject();
            console.log('--- SAMPLE_START ---');
            console.log('TITLE:', obj.title);
            console.log('TARGET_CENTER:', obj.targetCenter);
            console.log('TARGET_STUDY_CENTER:', obj.targetStudyCenter);
            console.log('KEYS_COUNT:', Object.keys(obj).length);
            Object.keys(obj).forEach(k => console.log('KEY:', k));
            console.log('--- SAMPLE_END ---');
        } else {
            console.log('NO_ANNOUNCEMENTS');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkData();
