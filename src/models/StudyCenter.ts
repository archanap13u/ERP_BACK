import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyCenter extends Document {
    centerName: string;
    location?: string;
    manager?: string;
    phone?: string;
    email?: string;
    username?: string;
    password?: string;
    organizationId: mongoose.Types.ObjectId;
    salesEmployeeId?: string;
    salesEmployeeName?: string;
    departmentId?: mongoose.Types.ObjectId;
    status?: string;
    paymentReceipt?: string;
}

const StudyCenterSchema: Schema = new Schema({
    centerName: { type: String, required: true, trim: true },
    location: { type: String },
    manager: { type: String },
    phone: { type: String },
    email: { type: String },
    username: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        index: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Verified by Ops', 'Active', 'Rejected', 'Pending Deletion']
    },
    paymentReceipt: { type: String }
}, {
    timestamps: true,
    strict: false
});

if (mongoose.models.StudyCenter) {
    delete mongoose.models.StudyCenter;
}

export default mongoose.model<IStudyCenter>('StudyCenter', StudyCenterSchema);
