const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: String,
    phone: String,
    customerGroup: String,
    territory: String
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
customerSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
