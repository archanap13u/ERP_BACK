const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentEntrySchema = new Schema({
    paymentType: { type: String, enum: ['Receive', 'Pay'], required: true },
    partyType: { type: String, enum: ['Customer', 'Supplier', 'Employee', 'Student'] },
    partyName: { type: String },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    reference: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

module.exports = mongoose.model('PaymentEntry', PaymentEntrySchema);
