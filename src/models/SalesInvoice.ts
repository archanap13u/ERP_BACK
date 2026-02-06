import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesInvoice extends Document {
    customer: string;
    postingDate: Date;
    dueDate: Date;
    total: number;
    status: 'Draft' | 'Unpaid' | 'Paid' | 'Partly Paid' | 'Cancelled';
    organizationId?: mongoose.Types.ObjectId;
}

const SalesInvoiceSchema: Schema = new Schema({
    customer: { type: String, required: true },
    postingDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    total: { type: Number, default: 0 },
    status: { type: String, default: 'Draft' },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.SalesInvoice || mongoose.model<ISalesInvoice>('SalesInvoice', SalesInvoiceSchema);
