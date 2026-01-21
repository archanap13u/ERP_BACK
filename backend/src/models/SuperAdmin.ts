import mongoose, { Schema, Document } from 'mongoose';

export interface ISuperAdmin extends Document {
    username: string;
    email: string;
    password: string;
    fullName: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SuperAdminSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Remove from cache to force schema update in development
if (mongoose.models.SuperAdmin) {
    delete mongoose.models.SuperAdmin;
}

export default mongoose.model<ISuperAdmin>('SuperAdmin', SuperAdminSchema);
