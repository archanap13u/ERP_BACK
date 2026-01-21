require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const OpsAnnouncementSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['Announcement', 'Poll'], default: 'Announcement' },
    pollOptions: [{
        label: String,
        votes: { type: Number, default: 0 }
    }],
    poll_options_text: String
}, { timestamps: true, strict: false });

const OpsAnnouncement = mongoose.model('OpsAnnouncement', OpsAnnouncementSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const latest = await OpsAnnouncement.find({}).sort({ createdAt: -1 }).limit(3);
        console.log(`Found ${latest.length} records`);

        latest.forEach((doc, i) => {
            console.log(`--- Record ${i + 1} ---`);
            console.log('Title:', doc.title);
            console.log('Type:', doc.type);
            console.log('PollOptions:', JSON.stringify(doc.pollOptions));
            console.log('PollOptionsText:', doc.poll_options_text); // Check if this was saved
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
