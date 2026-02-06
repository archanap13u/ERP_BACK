import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationHierarchy extends Document {
    organizationId: mongoose.Types.ObjectId;
    nodeId: string;
    nodeName: string;
    nodeType: 'department' | 'team' | 'division' | 'unit' | 'branch' | 'custom';
    parentNodeId?: string;
    level: number;
    path: string; // Materialized path for efficient queries (e.g., "/root/sales/team1")
    managerId?: mongoose.Types.ObjectId;
    metadata: {
        description?: string;
        location?: string;
        [key: string]: any;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationHierarchySchema: Schema = new Schema({
    organizationId: {
        type: Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    nodeId: {
        type: String,
        required: true,
        trim: true
    },
    nodeName: {
        type: String,
        required: true,
        trim: true
    },
    nodeType: {
        type: String,
        enum: ['department', 'team', 'division', 'unit', 'branch', 'custom'],
        default: 'department'
    },
    parentNodeId: {
        type: String,
        default: null
    },
    level: {
        type: Number,
        required: true,
        default: 0
    },
    path: {
        type: String,
        required: true,
        index: true
    },
    managerId: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for unique nodeId within organization
OrganizationHierarchySchema.index({ organizationId: 1, nodeId: 1 }, { unique: true });

// Index for efficient hierarchy queries
OrganizationHierarchySchema.index({ organizationId: 1, path: 1 });
OrganizationHierarchySchema.index({ organizationId: 1, parentNodeId: 1 });

// Remove from cache to force schema update in development
if (mongoose.models.OrganizationHierarchy) {
    delete mongoose.models.OrganizationHierarchy;
}

export default mongoose.model<IOrganizationHierarchy>('OrganizationHierarchy', OrganizationHierarchySchema);
