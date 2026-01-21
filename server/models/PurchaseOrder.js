const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    purchaseOrderId: { type: String, required: true },
    supplierName: String,
    orderDate: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Ordered', 'Received', 'Cancelled'],
        default: 'Draft'
    }
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
purchaseOrderSchema.index({ organizationId: 1, purchaseOrderId: 1 }, { unique: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
