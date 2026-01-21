const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProgramSchema = new Schema({
    programName: { type: String, required: true },
    university: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    programType: {
        type: String,
        enum: ['Skill', 'B.Voc'],
        default: 'Skill',
        required: true
    },
    duration: { type: Number }, // In Months or Years, generic
    durationUnit: { type: String, enum: ['Months', 'Semesters', 'Years'], default: 'Years' },
    mode: { type: String, enum: ['Online', 'Distance', 'Regular'] },
    fees: { type: Number },
    description: { type: String },

    // B.Voc Specific Fields
    miscellaneous: { type: String },
    feeStructure: { type: String }, // Can be rich text or URL
    syllabus: { type: String }, // URL or Text

    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

// Compound Index for Multi-Tenant Isolation
ProgramSchema.index({ organizationId: 1, programName: 1 }, { unique: true });

module.exports = mongoose.model('Program', ProgramSchema);
