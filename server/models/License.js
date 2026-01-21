const mongoose = require('mongoose');
const { Schema } = mongoose;

const LicenseSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'basic' },
    duration: { type: Number, required: true, default: 365 },
    maxUsers: { type: Number, default: 10 },
    pricingModel: { type: String, enum: ['flat', 'per_user'], default: 'flat' },
    price: { type: Number, default: 0 },
    status: { type: String, enum: ['available', 'assigned', 'expired', 'revoked'], default: 'available' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Organization' },
    assignedDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'SuperAdmin', required: true }
}, { timestamps: true });

module.exports = mongoose.models.License || mongoose.model('License', LicenseSchema);
