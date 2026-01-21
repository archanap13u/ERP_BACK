const mongoose = require('mongoose');
const { Schema } = mongoose;

const UniversitySchema = new Schema({
    universityName: { type: String, required: true },
    country: { type: String },
    accreditation: { type: String }, // Keep for backward compat, or migrate to plural
    accreditations: { type: String }, // Comma separated or rich text
    email: { type: String },
    logo: { type: String }, // URL
    bannerImage: { type: String }, // URL
    address: { type: String },
    description: { type: String },
    facilities: { type: [String] }, // Array of strings
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

module.exports = mongoose.model('University', UniversitySchema);
