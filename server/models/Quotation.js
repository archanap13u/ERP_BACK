const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    quotationId: { type: String, required: true },
    customerName: String,
    date: {
        type: Date,
        default: Date.now
    },
    validUntil: Date,
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
        default: 'Draft'
    }
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
quotationSchema.index({ organizationId: 1, quotationId: 1 }, { unique: true });

module.exports = mongoose.model('Quotation', quotationSchema);
