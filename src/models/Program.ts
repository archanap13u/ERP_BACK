import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
    programName: string;
    university: string;
    duration?: number;
    fees?: number;
    mode: 'Online' | 'Distance' | 'Regular';
    organizationId: mongoose.Types.ObjectId;
}

const ProgramSchema: Schema = new Schema({
    programName: { type: String, required: true },
    university: { type: String, required: true },
    duration: { type: Number },
    fees: { type: Number },
    mode: { type: String, default: 'Online' },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

// Remove from cache to force schema update in development
if (mongoose.models.Program) {
    delete mongoose.models.Program;
}

export default mongoose.model<IProgram>('Program', ProgramSchema);
