const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    orderId: { type: String, required: true },
    customerName: String,
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
        enum: ['Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Draft'
    },
    items: [{
        itemName: String,
        quantity: Number,
        rate: Number,
        amount: Number
    }]
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
salesOrderSchema.index({ organizationId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
