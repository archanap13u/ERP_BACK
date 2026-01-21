const mongoose = require('mongoose');
require('dotenv').config();
const Schema = mongoose.Schema;

async function dump() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const AnnouncementSchema = new Schema({}, { strict: false });
        const Announcement = mongoose.model('Announcement', AnnouncementSchema);
        const data = await Announcement.find({});
        console.log('FOUND:', data.length);
        console.log(JSON.stringify(data.map(d => ({
            _id: d._id,
            title: d.title,
            department: d.department,
            departmentId: d.departmentId,
            organizationId: d.organizationId
        })), null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

dump();
