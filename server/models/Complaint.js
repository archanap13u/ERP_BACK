const mongoose = require('mongoose');
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
    subject: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Dismissed'], default: 'Open' },
    employeeId: { type: String }, // Employee ID of the complainer
    employeeName: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }, // Department of the employee filing complaint
    department: { type: String }, // Department name for easy filtering
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
