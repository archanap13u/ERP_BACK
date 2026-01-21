require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const OpsAnnouncementSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['Announcement', 'Poll'], default: 'Announcement' },
    pollOptions: [{
        label: String,
        votes: { type: Number, default: 0 }
    }],
    poll_options_text: String,
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true, strict: false });

// Middleware to parse poll options text into array
OpsAnnouncementSchema.pre('save', async function () {
    const doc = this;
    if (doc.type === 'Poll' && doc.poll_options_text) {
        const text = doc.poll_options_text;
        const options = text.split('\n')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        // Initialize pollOptions if empty (new poll)
        if (doc.isNew || !doc.pollOptions || doc.pollOptions.length === 0) {
            doc.pollOptions = options.map(label => ({ label, votes: 0 }));
        }
    }
});

const OpsAnnouncement = mongoose.model('OpsAnnouncement', OpsAnnouncementSchema);

async function testCreate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        const orgId = new mongoose.Types.ObjectId(); // Fake ID

        const newPoll = new OpsAnnouncement({
            title: 'Test Poll Script',
            content: 'Does this work?',
            type: 'Poll',
            poll_options_text: 'Yes\nNo',
            organizationId: orgId,
            targetCenter: 'All',
            priority: 'Medium',
            startDate: new Date(),
            endDate: new Date(),
            pinned: false
        });

        const saved = await newPoll.save();
        console.log('Saved:', saved);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

testCreate();
