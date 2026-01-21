const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'On Leave'],
        default: 'Present'
    },
    checkIn: Date,
    checkOut: Date,
    remarks: String
}, { timestamps: true });

// Compound index to prevent duplicate attendance for same person on same day
// We use a partial index or just include both IDs and hope one is null
attendanceSchema.index({ organizationId: 1, employeeId: 1, studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
