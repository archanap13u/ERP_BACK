import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
    leadName: string;
    email?: string;
    status: 'Lead' | 'Open' | 'Replied' | 'Opportunity' | 'Quotation' | 'Lost Quotation' | 'Interested' | 'Converted' | 'Do Not Contact';
    assignedTo?: string; // Employee ID
    organizationId?: mongoose.Types.ObjectId;
}

const LeadSchema: Schema = new Schema({
    leadName: { type: String, required: true },
    email: { type: String },
    status: { type: String, default: 'Lead' },
    assignedTo: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
