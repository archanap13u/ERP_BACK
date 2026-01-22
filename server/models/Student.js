const mongoose = require('mongoose');
const { Schema } = mongoose;

const StudentSchema = new Schema({
    studentId: { type: String },
    studentName: { type: String, required: true },
    email: { type: String },
    username: { type: String },
    password: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String },
    address: { type: String },
    class: { type: String },
    section: { type: String },
    guardianName: { type: String },
    guardianPhone: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    department: { type: String }, // Department name for data isolation
    studyCenterId: { type: Schema.Types.ObjectId, ref: 'StudyCenter' },
    studyCenter: { type: String }, // Study Center name - tracks which center added this student
    university: { type: String }, // University name
    program: { type: String }, // Program name
    enrollmentDate: { type: Date, default: Date.now },
    verificationStatus: { type: String, enum: ['Pending', 'Processing', 'Verified by Ops', 'Active'], default: 'Processing' },
    paymentReceipt: { type: String }, // URL or reference
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Compound Indexes for Multi-Tenant Isolation
// Using partialFilterExpression to ignore empty strings/nulls, ensuring uniqueness only when data is provided.
StudentSchema.index({ organizationId: 1, studentId: 1 }, {
    unique: true,
    partialFilterExpression: { studentId: { $type: "string", $gt: "" } }
});

StudentSchema.index({ organizationId: 1, username: 1 }, {
    unique: true,
    partialFilterExpression: { username: { $type: "string", $gt: "" } }
});

StudentSchema.index({ organizationId: 1, email: 1 }, {
    unique: true,
    partialFilterExpression: { email: { $type: "string", $gt: "" } }
});

StudentSchema.index({ organizationId: 1 });
StudentSchema.index({ organizationId: 1, departmentId: 1 });
StudentSchema.index({ verificationStatus: 1 });

StudentSchema.index({ departmentId: 1 });

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
