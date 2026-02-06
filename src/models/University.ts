import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
    universityName: string;
    country?: string;
    accreditation?: string;
    email?: string;
    organizationId?: mongoose.Types.ObjectId;
}

const UniversitySchema: Schema = new Schema({
    universityName: { type: String, required: true },
    country: { type: String },
    accreditation: { type: String },
    email: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

// Remove from cache to force schema update in development
if (mongoose.models.University) {
    delete mongoose.models.University;
}

export default mongoose.model<IUniversity>('University', UniversitySchema);
