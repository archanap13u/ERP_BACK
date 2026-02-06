import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesOrder extends Document {
    customer: string;
    orderDate: Date;
    deliveryDate: Date;
    status: 'Draft' | 'On Hold' | 'To Deliver and Bill' | 'Completed' | 'Cancelled';
    totalAmount: number;
    organizationId?: mongoose.Types.ObjectId;
}

const SalesOrderSchema: Schema = new Schema({
    customer: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    status: { type: String, default: 'Draft' },
    totalAmount: { type: Number, default: 0 },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.SalesOrder || mongoose.model<ISalesOrder>('SalesOrder', SalesOrderSchema);
