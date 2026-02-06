import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    code: string;
    headOfDepartment?: string;
    parentDepartment?: string;
    username?: string;
    password?: string;
    panelType?: 'Generic' | 'HR' | 'Operations' | 'Finance' | 'Inventory' | 'CRM' | 'Projects' | 'Support' | 'Assets' | 'Sales';
    features?: string[];
    designations?: string[];
    organizationId: mongoose.Types.ObjectId;
}

const DepartmentSchema: Schema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    headOfDepartment: { type: String },
    parentDepartment: { type: String },
    username: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String },
    panelType: {
        type: String,
        enum: ['Generic', 'HR', 'Operations', 'Finance', 'Inventory', 'CRM', 'Projects', 'Support', 'Assets', 'Sales'],
        default: 'Generic'
    },
    features: [{ type: String }],
    designations: [{ type: String }],
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Unique department code per organization
DepartmentSchema.index({ organizationId: 1, code: 1 }, { unique: true });

if (mongoose.models.Department) {
    delete mongoose.models.Department;
}

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
