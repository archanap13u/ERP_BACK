const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
    organizationId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    settings: { type: Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
    subscription: {
        plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
        status: { type: String, enum: ['active', 'expired', 'suspended', 'trial'], default: 'active' },
        activeLicense: { type: Schema.Types.ObjectId, ref: 'License' },
        startDate: { type: Date, default: Date.now },
        expiryDate: Date,
        maxUsers: Number,
        maxEmployees: { type: Number, default: 10 }
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', required: true }
}, { timestamps: true });

OrganizationSchema.index({ organizationId: 1 });
OrganizationSchema.index({ domain: 1 });
OrganizationSchema.index({ username: 1 });
OrganizationSchema.index({ isActive: 1 });

module.exports = mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
