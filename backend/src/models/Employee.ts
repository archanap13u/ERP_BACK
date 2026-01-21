import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
    employeeId: string;
    employeeName: string;
    designation: string;
    department: string;
    dateOfJoining: Date;
    status: 'Active' | 'On Leave' | 'Resigned';
    email: string;
    username?: string;
    password?: string;
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    hierarchyNodeId?: string;
    isOrgAdmin?: boolean;
    permissions?: string[];
}

const EmployeeSchema: Schema = new Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    dateOfJoining: { type: Date, default: Date.now },
    status: { type: String, default: 'Active' },
    email: { type: String },
    username: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        index: true
    },
    reportsTo: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        index: true
    },
    hierarchyNodeId: { type: String },
    isOrgAdmin: { type: Boolean, default: false },
    vacancy: {
        type: Schema.Types.ObjectId,
        ref: 'JobOpening',
        index: true
    },
    permissions: [{ type: String }]
}, {
    timestamps: true,
    strict: false // CRITICAL: This allows fields not in the schema to be saved
});

// Compound index for unique employeeId within organization
EmployeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true, sparse: true });

// Remove from cache to force schema update in development
if (mongoose.models.Employee) {
    delete mongoose.models.Employee;
}

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
