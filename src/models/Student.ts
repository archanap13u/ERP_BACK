import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
    studentName: string;
    email: string;
    phone: string;
    qualification: string;
    status: 'Inquiry' | 'Verified' | 'Registered' | 'Admitted';
    username?: string;
    password?: string;
    isActive?: boolean;
    verificationStatus?: string;
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    hierarchyNodeId?: string;
}

const StudentSchema: Schema = new Schema({
    studentName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    qualification: { type: String },
    status: { type: String, default: 'Inquiry' },
    username: { type: String },
    password: { type: String },
    isActive: { type: Boolean, default: false },
    verificationStatus: { type: String, default: 'Pending' },
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
    hierarchyNodeId: { type: String }
}, {
    timestamps: true,
    strict: false // CRITICAL: This allows fields not in the schema to be saved
});

// Compound index for unique email within organization
StudentSchema.index({ organizationId: 1, email: 1 }, { unique: true, sparse: true });

// Remove from cache to force schema update in development
if (mongoose.models.Student) {
    delete mongoose.models.Student;
}

export default mongoose.model<IStudent>('Student', StudentSchema);
