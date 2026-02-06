import mongoose from 'mongoose';

const jobOpeningSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    job_title: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    department: { type: String },
    no_of_positions: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['Open', 'Closed', 'On Hold'], default: 'Open' },
    description: { type: String },
    posting_date: { type: Date, default: Date.now },
    closed_date: { type: Date }
}, {
    timestamps: true
});

export const JobOpening = mongoose.model('JobOpening', jobOpeningSchema);
