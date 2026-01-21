const mongoose = require('mongoose');
const { Schema } = mongoose;

const ApplicationSchema = new Schema({
    applicantName: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String },
    program: { type: String }, // Program Name
    studyCenter: { type: String }, // Study Center Name
    status: { type: String, enum: ['Draft', 'Processed', 'Enrolled'], default: 'Draft' },
    applicationDate: { type: Date, default: Date.now },
    assignedTo: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    department: { type: String } // Department name for data isolation
}, { timestamps: true });

module.exports = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
