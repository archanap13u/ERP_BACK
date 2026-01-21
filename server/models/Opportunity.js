const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    leadName: String,
    opportunityFrom: {
        type: String,
        enum: ['Lead', 'Customer'],
        default: 'Lead'
    },
    status: {
        type: String,
        enum: ['Open', 'Replied', 'Won', 'Lost', 'Cancelled'],
        default: 'Open'
    },
    expectedValue: Number
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
