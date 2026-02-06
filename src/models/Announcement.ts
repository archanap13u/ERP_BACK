import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
    title: string;
    content: string;
    postedBy: string;
    date: Date;
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    type: 'Announcement' | 'Poll';
    pollOptions: { label: string; votes: number }[];
    voters: mongoose.Types.ObjectId[];
    poll_options_text?: string;
}

const AnnouncementSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    postedBy: { type: String, default: 'HR Department' },
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
AnnouncementSchema.pre('save', function (next) {
    const doc = this as any;
    if (doc.type === 'Poll' && doc.poll_options_text) {
        const text: string = doc.poll_options_text;
        const options = text.split('\n')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        // Initialize pollOptions if empty (new poll)
        if (doc.isNew || !doc.pollOptions || doc.pollOptions.length === 0) {
            doc.pollOptions = options.map(label => ({ label, votes: 0 }));
        }
    }
    next();
});

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
