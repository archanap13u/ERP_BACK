import mongoose, { Schema, Document } from 'mongoose';

export interface IInternalMark extends Document {
    studentId: mongoose.Types.ObjectId;
    student: string;
    program: string;
    subject: string;
    marksObtained: number;
    maxMarks: number;
    semester?: string;
    batch?: string;
    studyCenter?: string;
    organizationId: mongoose.Types.ObjectId;
}

const InternalMarkSchema: Schema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    student: { type: String },
    program: { type: String },
    subject: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    semester: { type: String },
    batch: { type: String },
    studyCenter: { type: String },
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

if (mongoose.models.InternalMark) {
    delete mongoose.models.InternalMark;
}

export default mongoose.model<IInternalMark>('InternalMark', InternalMarkSchema);
