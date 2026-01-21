import mongoose, { Schema, Document } from 'mongoose';

export interface IPlatformSettings extends Document {
    platformName: string;
    platformLogo?: string;
    defaultSubscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    security: {
        sessionTimeout: number; // in minutes
        maxLoginAttempts: number;
        passwordMinLength: number;
        requireSpecialCharacters: boolean;
        requireNumbers: boolean;
    };
    email: {
        senderName: string;
        senderEmail: string;
        enableNotifications: boolean;
    };
    features: {
        allowSelfRegistration: boolean;
        requireEmailVerification: boolean;
        enableStudentPortal: boolean;
        enableEmployeePortal: boolean;
    };
    updatedAt: Date;
    updatedBy?: mongoose.Types.ObjectId;
}

const PlatformSettingsSchema: Schema = new Schema({
    platformName: {
        type: String,
        default: 'ERP Platform'
    },
    platformLogo: {
        type: String
    },
    defaultSubscriptionPlan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceMessage: {
        type: String,
        default: 'The platform is currently under maintenance. Please try again later.'
    },
    security: {
        sessionTimeout: {
            type: Number,
            default: 60 // 60 minutes
        },
        maxLoginAttempts: {
            type: Number,
            default: 5
        },
        passwordMinLength: {
            type: Number,
            default: 8
        },
        requireSpecialCharacters: {
            type: Boolean,
            default: true
        },
        requireNumbers: {
            type: Boolean,
            default: true
        }
    },
    email: {
        senderName: {
            type: String,
            default: 'ERP Platform'
        },
        senderEmail: {
            type: String,
            default: 'noreply@erpplatform.com'
        },
        enableNotifications: {
            type: Boolean,
            default: true
        }
    },
    features: {
        allowSelfRegistration: {
            type: Boolean,
            default: false
        },
        requireEmailVerification: {
            type: Boolean,
            default: true
        },
        enableStudentPortal: {
            type: Boolean,
            default: true
        },
        enableEmployeePortal: {
            type: Boolean,
            default: true
        }
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'SuperAdmin'
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
PlatformSettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

export default mongoose.models.PlatformSettings || mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
