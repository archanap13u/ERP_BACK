const mongoose = require('mongoose');
const { Schema } = mongoose;

const DepartmentSchema = new Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String },
    panelType: { type: String, enum: ['HR', 'Operations', 'Finance', 'Inventory', 'CRM', 'Projects', 'Support', 'Assets', 'Sales', 'Custom', 'Generic'], default: 'Custom' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    features: [{ type: String }],
    designations: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Unique department code per organization
DepartmentSchema.index({ organizationId: 1, code: 1 }, { unique: true });

// Cascade Delete: Clean up associated data when a Department is deleted
// Cascade Delete: Clean up associated data when a Department is deleted
// Cascade Delete: Clean up associated data AFTER a Department is deleted
DepartmentSchema.post('findOneAndDelete', async function (doc) {
    if (!doc) return;

    console.log(`[Cascade Delete] Department deleted: ${doc.name} (${doc._id}). Cleaning up dependencies...`);

    try {
        // Helper to safely delete models
        const safeDelete = async (modelName, query) => {
            try {
                // Use mongoose.model(name) to avoid circular dependency issues
                const Model = mongoose.models[modelName];
                if (Model) {
                    const result = await Model.deleteMany(query);
                    console.log(`[Cascade Delete] Removed ${result.deletedCount} ${modelName}s.`);
                }
            } catch (e) {
                console.warn(`[Cascade Delete] Warning: Failed to clean up ${modelName}:`, e.message);
            }
        };

        // 1. Delete Employees
        await safeDelete('Employee', { departmentId: doc._id });

        // 2. Delete Job Openings
        await safeDelete('JobOpening', {
            $or: [
                { department: doc.name },
                { departmentId: doc._id }
            ],
            organizationId: doc.organizationId
        });

        // 3. Delete Projects
        await safeDelete('Project', { departmentId: doc._id });

        // 4. Delete Study Centers
        await safeDelete('StudyCenter', { departmentId: doc._id });

    } catch (err) {
        console.error('[Cascade Delete] Critical Error during cleanup:', err);
    }
});

module.exports = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
