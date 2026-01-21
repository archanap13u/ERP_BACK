const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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
    address: String,
    supplierGroup: String
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
supplierSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Supplier', supplierSchema);
