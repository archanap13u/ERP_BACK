const mongoose = require('mongoose');
const { Schema } = mongoose;

const DesignationSchema = new Schema({
    title: { type: String, required: true },
    level: { type: Number, required: true, default: 1 },
    reportsTo: { type: String }, // e.g., 'Manager'
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, {
    timestamps: true
});

// Compound Index for Multi-Tenant Isolation
DesignationSchema.index({ organizationId: 1, title: 1, departmentId: 1 }, { unique: true });

module.exports = mongoose.models.Designation || mongoose.model('Designation', DesignationSchema);
