const mongoose = require('mongoose');
const { Schema } = mongoose;

const PerformanceReviewSchema = new Schema({
    employee: { type: String, required: true }, // Employee ID
    employeeName: { type: String, required: true },
    reviewDate: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    feedback: { type: String },
    reviewCycle: { type: String },
    reviewer: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    }
}, {
    timestamps: true,
    strict: false
});

module.exports = mongoose.model('PerformanceReview', PerformanceReviewSchema);
