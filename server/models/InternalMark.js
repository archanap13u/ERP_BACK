const mongoose = require('mongoose');
const { Schema } = mongoose;

const InternalMarkSchema = new Schema({
    student: { type: String, required: true }, // Student name/ID
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    program: { type: String },
    subject: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    semester: { type: String },
    batch: { type: String },
    studyCenter: { type: String }, // Track which center added it
    department: { type: String }, // For isolation
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.models.InternalMark || mongoose.model('InternalMark', InternalMarkSchema);
