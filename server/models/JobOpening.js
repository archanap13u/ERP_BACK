const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobOpeningSchema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    job_title: { type: String, required: true },
    department: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    no_of_positions: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['Open', 'Closed', 'On Hold'], default: 'Open' },
    description: { type: String },
    posting_date: { type: Date, default: Date.now },
    closed_date: { type: Date }
}, {
    timestamps: true
});

// Auto-create Designation when a Vacancy (JobOpening) is created
JobOpeningSchema.post('save', async function (doc) {
    try {
        const Designation = mongoose.model('Designation');

        // Check if a designation with this title already exists for this department/org
        const existingDesignation = await Designation.findOne({
            title: doc.job_title,
            organizationId: doc.organizationId,
            departmentId: doc.departmentId || null
        });

        if (!existingDesignation) {
            // Create a new designation based on the vacancy
            await Designation.create({
                title: doc.job_title,
                level: 1, // Default level
                organizationId: doc.organizationId,
                departmentId: doc.departmentId || null
            });
            console.log(`[Vacancy] Auto-created Designation "${doc.job_title}" for department ${doc.department || 'N/A'}`);
        } else {
            console.log(`[Vacancy] Designation "${doc.job_title}" already exists for this department`);
        }
    } catch (err) {
        // Don't fail the vacancy creation if designation creation fails
        console.error('[Vacancy] Failed to auto-create Designation:', err.message);
    }
});

// Optimization Indexes
JobOpeningSchema.index({ organizationId: 1 });
JobOpeningSchema.index({ organizationId: 1, departmentId: 1 });
JobOpeningSchema.index({ status: 1 });

module.exports = mongoose.model('JobOpening', JobOpeningSchema);

