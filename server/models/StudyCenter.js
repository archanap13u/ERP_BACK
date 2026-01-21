const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudyCenterSchema = new Schema({
    centerName: { type: String, required: true },
    location: { type: String },
    manager: { type: String },
    phone: { type: String },
    email: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    department: { type: String }, // Department name that manages this center
    username: { type: String, sparse: true },
    password: { type: String }
}, { timestamps: true });

// Compound Indexes for Multi-Tenant Isolation
StudyCenterSchema.index({ organizationId: 1, username: 1 }, { unique: true, sparse: true });
StudyCenterSchema.index({ organizationId: 1, centerName: 1 }, { unique: true });

module.exports = mongoose.model('StudyCenter', StudyCenterSchema);
