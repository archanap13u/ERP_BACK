import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
    organizationId: string;
    name: string;
    domain?: string;
    username: string;
    password: string;
    adminId?: mongoose.Types.ObjectId;
    settings: {
        timezone?: string;
        currency?: string;
        dateFormat?: string;
        [key: string]: any;
    };
    isActive: boolean;
    subscription: {
        plan: 'free' | 'basic' | 'premium' | 'enterprise';
        status: 'active' | 'expired' | 'suspended' | 'trial';
        activeLicense?: mongoose.Types.ObjectId;
        startDate: Date;
        expiryDate?: Date;
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema({
    organizationId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    settings: {
        type: Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'suspended', 'trial'],
            default: 'active'
        },
        activeLicense: {
            type: Schema.Types.ObjectId,
            ref: 'License'
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: Date,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster lookups
OrganizationSchema.index({ organizationId: 1 });
OrganizationSchema.index({ domain: 1 });
OrganizationSchema.index({ username: 1 });
OrganizationSchema.index({ isActive: 1 });

// Remove from cache to force schema update in development
if (mongoose.models.Organization) {
    delete mongoose.models.Organization;
}

export default mongoose.model<IOrganization>('Organization', OrganizationSchema);

