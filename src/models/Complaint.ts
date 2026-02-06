import mongoose, { Schema, Document } from 'mongoose';

export interface IComplaint extends Document {
    employeeId?: string; // Optional - for employees
    username?: string; // Optional - for department admins
    employeeName: string;
    department: string;
    departmentId: mongoose.Types.ObjectId;
    subject: string;
    description: string;
    status: 'Pending' | 'In Progress' | 'Resolved' | 'Dismissed';
    date: Date;
    organizationId: mongoose.Types.ObjectId;
}

const ComplaintSchema: Schema = new Schema({
    employeeId: { type: String, required: false }, // Optional - for employees
    username: { type: String, required: false }, // Optional - for department admins
    employeeName: { type: String, required: true },
    department: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved', 'Dismissed'],
        default: 'Pending'
    },
    date: { type: Date, default: Date.now },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, {
    timestamps: true
});

// Validation: Must have either employeeId OR username
ComplaintSchema.pre('save', function (next) {
    if (!this.employeeId && !this.username) {
        next(new Error('Complaint must have either employeeId or username'));
    } else {
        next();
    }
});

// Compound index for organization-level filtering
ComplaintSchema.index({ organizationId: 1, date: -1 });
ComplaintSchema.index({ departmentId: 1 });

export default mongoose.model<IComplaint>('Complaint', ComplaintSchema);
