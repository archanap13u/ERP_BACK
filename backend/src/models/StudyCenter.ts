import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyCenter extends Document {
    centerName: string;
    location?: string;
    manager?: string;
    phone?: string;
    email?: string;
    username?: string;
    password?: string;
    organizationId?: mongoose.Types.ObjectId;
}

const StudyCenterSchema: Schema = new Schema({
    centerName: { type: String, required: true },
    location: { type: String },
    manager: { type: String },
    phone: { type: String },
    email: { type: String },
    username: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

if (mongoose.models.StudyCenter) {
    delete mongoose.models.StudyCenter;
}

export default mongoose.model<IStudyCenter>('StudyCenter', StudyCenterSchema);
