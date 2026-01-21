const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['Active', 'Completed', 'On Hold', 'Cancelled'], default: 'Active' },
    startDate: { type: Date },
    endDate: { type: Date },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    members: [{ type: Schema.Types.ObjectId, ref: 'Employee' }],
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
