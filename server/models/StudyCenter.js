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
    password: { type: String },
    salesEmployeeId: { type: String }, // For attribution to the sales person who referred this center
    salesEmployeeName: { type: String },
    source: { type: String, default: 'Internal' } // 'Internal' or 'Referral'
}, { timestamps: true });

// Compound Indexes for Multi-Tenant Isolation
StudyCenterSchema.index({ organizationId: 1, username: 1 }, { unique: true, sparse: true });
StudyCenterSchema.index({ organizationId: 1, centerName: 1 }, { unique: true });

module.exports = mongoose.model('StudyCenter', StudyCenterSchema);
