const mongoose = require('mongoose');
const { Schema } = mongoose;

const SuperAdminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.SuperAdmin || mongoose.model('SuperAdmin', SuperAdminSchema);
