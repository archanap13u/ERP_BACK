const mongoose = require('mongoose');

const salesInvoiceSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    invoiceId: { type: String, required: true },
    customerName: String,
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
        default: 'Unpaid'
    },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
salesInvoiceSchema.index({ organizationId: 1, invoiceId: 1 }, { unique: true });

module.exports = mongoose.model('SalesInvoice', salesInvoiceSchema);
