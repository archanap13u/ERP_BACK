import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
    holidayName: string;
    date: Date;
    description?: string;
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    department?: string;
}

const HolidaySchema: Schema = new Schema({
    holidayName: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
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
    department: { type: String, index: true },
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', HolidaySchema);
