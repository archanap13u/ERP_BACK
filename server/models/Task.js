const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
    subject: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    assignedToName: { type: String },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
    assignedByName: { type: String },
    exp_end_date: { type: Date },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'Working', 'Pending Review', 'Completed', 'Cancelled', 'Overdue'], default: 'Open' },
    completionEvidence: { type: String },
    verificationStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    adminRemarks: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    department: { type: String }
}, { timestamps: true });

TaskSchema.index({ organizationId: 1, departmentId: 1 });

module.exports = mongoose.model('Task', TaskSchema);
