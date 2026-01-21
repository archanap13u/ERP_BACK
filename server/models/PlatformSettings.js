const mongoose = require('mongoose');
const { Schema } = mongoose;

const PlatformSettingsSchema = new Schema({
    platformName: { type: String, default: 'ERP Platform' },
    defaultSubscriptionPlan: { type: String, default: 'free' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: '' },
    security: {
        maxLoginAttempts: { type: Number, default: 5 },
        sessionTimeout: { type: Number, default: 3600 }
    },
    email: {
        smtpHost: String,
        smtpPort: Number,
        smtpUser: String
    },
    features: {
        enableRegistration: { type: Boolean, default: true }
    },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', PlatformSettingsSchema);
