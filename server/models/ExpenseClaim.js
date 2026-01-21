const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExpenseClaimSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    employeeName: { type: String },
    type: { type: String }, // e.g., Travel, Food
    amount: { type: Number, required: true },
    approveStatus: { type: String, enum: ['Draft', 'Approved', 'Rejected'], default: 'Draft' },
    description: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

module.exports = mongoose.model('ExpenseClaim', ExpenseClaimSchema);
