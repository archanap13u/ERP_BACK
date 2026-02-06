import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
    employeeId: string;
    employeeName: string;
    departmentId: mongoose.Types.ObjectId;
    department: string;
    organizationId: mongoose.Types.ObjectId;
    leaveType: 'Sick Leave' | 'Casual Leave' | 'Emergency Leave' | 'Unpaid Leave';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'Pending Department' | 'Pending HR' | 'Approved' | 'Rejected';
    deptAdminRemarks?: string;
    deptAdminApprovedBy?: string;
    deptAdminApprovalDate?: Date;
    hrRemarks?: string;
    hrApprovedBy?: string;
    hrApprovalDate?: Date;
    requesterRole?: string; // e.g., 'Employee' or 'DepartmentAdmin'
    createdAt: Date;
}

const LeaveRequestSchema: Schema = new Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    department: { type: String, required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },

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
    requesterRole: { type: String },

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
