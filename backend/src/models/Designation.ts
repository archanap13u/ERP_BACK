import mongoose, { Schema, Document } from 'mongoose';

export interface IDesignation extends Document {
    title: string;
    level: number; // 1 = Top, 2 = Below, etc.
    reportsTo?: string; // ID of parent designation or title
    departmentId?: mongoose.Types.ObjectId;
    departmentName?: string;
    organizationId: mongoose.Types.ObjectId;
}

const DesignationSchema: Schema = new Schema({
    title: { type: String, required: true },
    level: { type: Number, required: true, default: 1 },
    reportsTo: { type: String }, // e.g., 'Manager'
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    departmentName: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, {
    timestamps: true
});

// Remove from cache to force schema update in development
if (mongoose.models.Designation) {
    delete mongoose.models.Designation;
}

export default mongoose.model<IDesignation>('Designation', DesignationSchema);
