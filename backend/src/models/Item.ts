import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
    itemCode: string;
    itemName: string;
    itemGroup: string;
    valuationRate: number;
    stockQty: number;
    uom: string;
    organizationId?: mongoose.Types.ObjectId;
}

const ItemSchema: Schema = new Schema({
    itemCode: { type: String, required: true },
    itemName: { type: String, required: true },
    itemGroup: { type: String, default: 'All Item Groups' },
    valuationRate: { type: Number, default: 0 },
    stockQty: { type: Number, default: 0 },
    uom: { type: String, default: 'Nos' },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

// Compound index for unique itemCode within organization
ItemSchema.index({ organizationId: 1, itemCode: 1 }, { unique: true, sparse: true });

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
