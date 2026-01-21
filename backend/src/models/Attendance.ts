import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
    employee: string;
    employeeName: string;
    date: Date;
    status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
}

const AttendanceSchema: Schema = new Schema({
    employee: { type: String, required: true }, // employeeId
    employeeName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Present' },
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

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
