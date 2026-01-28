const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    department: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },

    leaveType: {
        type: String,
        enum: ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Unpaid Leave'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },

    // Workflow Status
    // Pending Department -> Pending HR -> Approved
    // OR Rejected (at any stage)
    status: {
        type: String,
        enum: ['Pending Department', 'Pending HR', 'Approved', 'Rejected'],
        default: 'Pending Department'
    },

    // Approval Details
    deptAdminRemarks: { type: String },
    deptAdminApprovedBy: { type: String },
    deptAdminApprovalDate: { type: Date },

    hrRemarks: { type: String },
    hrApprovedBy: { type: String },
    hrApprovalDate: { type: Date },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
