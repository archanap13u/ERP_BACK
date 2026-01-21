const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamScheduleSchema = new Schema({
    program: { type: Schema.Types.ObjectId, ref: 'Program' },
    studyCenter: { type: String }, // Optional: If exam is center specific
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., '10:00 AM'
    endTime: { type: String, required: true },   // e.g., '01:00 PM'
    venue: { type: String },

    // Multi-tenant
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

module.exports = mongoose.model('ExamSchedule', ExamScheduleSchema);
