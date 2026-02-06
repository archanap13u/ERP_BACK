import mongoose, { Schema, Document } from 'mongoose';

export interface IOpsAnnouncement extends Document {
    title: string;
    content: string;
    description?: string;
    postedBy: string;
    date: Date;
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    targetCenter?: string;
    priority: 'Low' | 'Medium' | 'High';
    pinned?: boolean;
    startDate?: Date;
    endDate?: Date;
    type: 'Announcement' | 'Poll';
    pollOptions: { label: string; votes: number }[];
    voters: mongoose.Types.ObjectId[];
    poll_options_text?: string;
}

const OpsAnnouncementSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    description: { type: String },
    postedBy: { type: String, default: 'Operations' },
    date: { type: Date, default: Date.now },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        index: true
    },
    targetCenter: { type: String, default: 'All' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    pinned: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    type: { type: String, enum: ['Announcement', 'Poll'], default: 'Announcement' },
    pollOptions: [{
        label: String,
        votes: { type: Number, default: 0 }
    }],
    voters: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
}, {
    timestamps: true,
    strict: false
});

// Middleware to parse poll options text into array
OpsAnnouncementSchema.pre('save', function (next) {
    const doc = this as any;
    if (doc.type === 'Poll' && doc.poll_options_text) {
        const text: string = doc.poll_options_text;
        const options = text.split('\n')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        if (doc.isNew || !doc.pollOptions || doc.pollOptions.length === 0) {
            doc.pollOptions = options.map(label => ({ label, votes: 0 }));
        }
    }
    next();
});

export default mongoose.models.OpsAnnouncement || mongoose.model<IOpsAnnouncement>('OpsAnnouncement', OpsAnnouncementSchema);
