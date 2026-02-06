import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    student: string;
    program: string;
    studyCenter: string;
    applicationDate: Date;
    status: 'Draft' | 'Submitted to University' | 'Approved' | 'Rejected' | 'Fee Paid';
    assignedTo?: string; // Employee ID
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
}

const ApplicationSchema: Schema = new Schema({
    student: { type: String, required: true },
    program: { type: String, required: true },
    studyCenter: { type: String, required: true },
    applicationDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Draft' },
    assignedTo: { type: String },
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
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
