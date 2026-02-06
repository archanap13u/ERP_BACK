import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
    supplierName: string;
    supplierGroup: string;
    organizationId?: mongoose.Types.ObjectId;
}

const SupplierSchema: Schema = new Schema({
    supplierName: { type: String, required: true },
    supplierGroup: { type: String, default: 'All Supplier Groups' },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
