import mongoose, { Schema, Document } from 'mongoose';

export interface ILicense extends Document {
    name: string; // e.g., "Enterprise Yearly", "Basic Monthly"
    type: 'free' | 'basic' | 'premium' | 'enterprise'; // The plan it grants
    duration: number; // Duration in days
    price?: number;
    status: 'available' | 'assigned' | 'expired' | 'revoked';
    assignedTo?: mongoose.Types.ObjectId; // Organization ID
    assignedDate?: Date;
    createdBy: mongoose.Types.ObjectId; // SuperAdmin ID
    createdAt: Date;
    updatedAt: Date;
}

const LicenseSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        required: true
    },
    duration: {
        type: Number, // In days
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['available', 'assigned', 'expired', 'revoked'],
        default: 'available'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'Organization'
    },
    assignedDate: Date,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee', // Assuming SuperAdmin is an Employee with role
        required: true
    }
}, {
    timestamps: true
});

// Index for query performance
LicenseSchema.index({ status: 1 });
LicenseSchema.index({ assignedTo: 1 });

if (mongoose.models.License) {
    delete mongoose.models.License;
}

export default mongoose.model<ILicense>('License', LicenseSchema);
