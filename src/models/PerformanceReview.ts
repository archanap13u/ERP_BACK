import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceReview extends Document {
    employee: string;
    employeeName: string;
    reviewDate: Date;
    rating: number; // 1-5
    feedback: string;
    reviewCycle: string; // e.g., "Q1 2026", "Annual 2025"
    reviewer: string;
    organizationId?: mongoose.Types.ObjectId;
}

const PerformanceReviewSchema: Schema = new Schema({
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
        index: true
    },
}, {
    timestamps: true,
    strict: false
});

// Avoid cache issues in dev
if (mongoose.models.PerformanceReview) {
    delete mongoose.models.PerformanceReview;
}

export default mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema);
