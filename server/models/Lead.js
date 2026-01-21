const mongoose = require('mongoose');
const { Schema } = mongoose;

const LeadSchema = new Schema({
    leadName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    source: { type: String },
    status: { type: String, default: 'New' },
    assignedTo: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    notes: { type: String }
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
LeadSchema.index({ organizationId: 1, leadName: 1 }, { unique: true });

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
