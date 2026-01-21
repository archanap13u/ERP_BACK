const mongoose = require('mongoose');
const { Schema } = mongoose;

const DailyReportSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, default: Date.now, required: true },
    tasks: [{
        description: { type: String, required: true },
        status: { type: String, enum: ['Completed', 'In Progress', 'Pending'], default: 'Completed' },
        timeSpent: { type: Number } // Hours
    }],
    blockers: { type: String },
    summary: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

module.exports = mongoose.model('DailyReport', DailyReportSchema);
