const mongoose = require('mongoose');
const { Schema } = mongoose;

const OpsAnnouncementSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // Description
    posting_date: { type: Date, default: Date.now },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    department: { type: String, default: 'Operations' }, // Default to Operations
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    pinned: { type: Boolean, default: false },
    showAsPopup: { type: Boolean, default: false },
    targetCenter: { type: String, default: 'All' }, // 'All' or specific Center Name
    startDate: { type: Date },
    endDate: { type: Date },
    author: { type: String }, // User who posted it
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    type: { type: String, enum: ['Announcement', 'Poll'], default: 'Announcement' },
    pollOptions: [{
        label: String,
        votes: { type: Number, default: 0 }
    }],
    voters: [String],
    poll_options_text: { type: String } // Explicitly define to ensure access in middleware
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

module.exports = mongoose.model('OpsAnnouncement', OpsAnnouncementSchema);
