import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    customerName: string;
    customerGroup: string;
    territory: string;
    customerType: 'Company' | 'Individual';
    email?: string;
    mobile?: string;
    organizationId?: mongoose.Types.ObjectId;
}

const CustomerSchema: Schema = new Schema({
    customerName: { type: String, required: true },
    customerGroup: { type: String, default: 'All Customer Groups' },
    territory: { type: String, default: 'All Territories' },
    customerType: { type: String, enum: ['Company', 'Individual'], default: 'Company' },
    email: { type: String },
    mobile: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
