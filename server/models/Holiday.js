const mongoose = require('mongoose');
const { Schema } = mongoose;

const HolidaySchema = new Schema({
    holidayName: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String },
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    departmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        index: true
    }
}, {
    timestamps: true,
    strict: false
});

module.exports = mongoose.model('Holiday', HolidaySchema);
