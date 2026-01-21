import mongoose, { Schema, Document } from 'mongoose';

export interface IProgram extends Document {
    programName: string;
    university: string;
    duration?: number;
    fees?: number;
    mode: 'Online' | 'Distance' | 'Regular';
    organizationId?: mongoose.Types.ObjectId;
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
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema);
