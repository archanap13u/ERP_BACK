import mongoose, { Schema, Document } from 'mongoose';

export interface IQuotation extends Document {
    customer: string;
    validTill: Date;
    total: number;
    status: 'Draft' | 'Open' | 'Replied' | 'Ordered' | 'Lost' | 'Cancelled';
    organizationId?: mongoose.Types.ObjectId;
}

const QuotationSchema: Schema = new Schema({
    customer: { type: String, required: true },
    validTill: { type: Date },
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

export default mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);
