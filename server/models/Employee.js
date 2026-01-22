const mongoose = require('mongoose');
const { Schema } = mongoose;

// Employee Schema
const EmployeeSchema = new Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    dateOfJoining: { type: Date, default: Date.now },
    status: { type: String, default: 'Active' },
    verificationStatus: { type: String, enum: ['Pending', 'Verified'], default: 'Pending' },
    email: { type: String },
    username: { type: String },
    password: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    studyCenter: { type: String }, // Name of city/center
    studyCenterId: { type: Schema.Types.ObjectId, ref: 'StudyCenter' },
    reportsTo: { type: Schema.Types.ObjectId, ref: 'Employee' }, // Legacy/Optional
    reportsToRole: { type: String }, // New: Reports to a Designation (e.g., 'Manager')
    hierarchyNodeId: { type: String },
    isOrgAdmin: { type: Boolean, default: false },
    permissions: [{ type: String }],
    jobOpening: { type: Schema.Types.ObjectId, ref: 'JobOpening' },
    addedByDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    addedByDepartmentName: { type: String }
}, { timestamps: true });

// Enforce Vacancy Limits & Organization Seat Limits
EmployeeSchema.pre('save', async function (next) {
    const Employee = this.constructor;
    const Organization = mongoose.model('Organization');

    // 1. Strict Seat Limit Check
    if (this.organizationId) {
        const org = await Organization.findById(this.organizationId);
        if (org && org.subscription && org.subscription.maxUsers) {
            // Count ALL employees for this organization (excluding this one if it's an update)
            const currentTotal = await Employee.countDocuments({
                organizationId: this.organizationId,
                _id: { $ne: this._id },
                status: 'Active' // Only count active employees? usually seats match active users.
            });

            // Note: Students are excluded here as they are Customers.
            // If Students also count, we would need to check Student model too.
            // Assuming Seat Limit = Employees only based on context.

            if (currentTotal >= org.subscription.maxUsers) {
                throw new Error(`Organization Seat Limit Reached (${org.subscription.maxUsers}). Cannot add more employees.`);
            }
        }
    }

    // 2. Vacancy Limit Check
    if (this.jobOpening) {
        const JobOpening = mongoose.model('JobOpening');
        const vacancy = await JobOpening.findById(this.jobOpening);
        if (vacancy) {
            const currentCount = await Employee.countDocuments({ jobOpening: this.jobOpening, _id: { $ne: this._id } });
            if (currentCount >= vacancy.no_of_positions) {
                throw new Error(`Vacancy limit reached for ${vacancy.job_title}. Position is filled.`);
            }
        }
    }
});

// Auto-Close Vacancy if Filled
EmployeeSchema.post('save', async function (doc) {
    if (doc.jobOpening) {
        try {
            const JobOpening = mongoose.model('JobOpening');
            const Employee = mongoose.model('Employee');

            const vacancy = await JobOpening.findById(doc.jobOpening);
            if (vacancy && vacancy.status === 'Open') {
                const currentCount = await Employee.countDocuments({ jobOpening: doc.jobOpening });

                if (currentCount >= vacancy.no_of_positions) {
                    vacancy.status = 'Closed';
                    vacancy.closed_date = new Date();
                    await vacancy.save();
                    console.log(`[Vacancy] Auto-closed vacancy "${vacancy.job_title}" as all ${vacancy.no_of_positions} positions are filled.`);
                }
            }
        } catch (err) {
            console.error('[Vacancy] Failed to auto-close vacancy:', err);
        }
    }
});

// Auto-Reopen Vacancy if Position becomes available
EmployeeSchema.post('findOneAndDelete', async function (doc) {
    if (doc && doc.jobOpening) {
        try {
            const JobOpening = mongoose.model('JobOpening');
            const Employee = mongoose.model('Employee');

            const vacancy = await JobOpening.findById(doc.jobOpening);
            if (vacancy) {
                const currentCount = await Employee.countDocuments({ jobOpening: doc.jobOpening });

                if (currentCount < vacancy.no_of_positions) {
                    if (vacancy.status !== 'Open') {
                        vacancy.status = 'Open';
                        vacancy.closed_date = null;
                        await vacancy.save();
                        console.log(`[Vacancy] Re-opened vacancy "${vacancy.job_title}" as a position became available (Count: ${currentCount}/${vacancy.no_of_positions}).`);
                    }
                }
            }
        } catch (err) {
            console.error('[Vacancy] Failed to auto-reopen vacancy:', err);
        }
    }
});

// Compound Index for Multi-Tenant Isolation
EmployeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });
EmployeeSchema.index({ organizationId: 1, username: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ organizationId: 1 });
EmployeeSchema.index({ departmentId: 1 });
EmployeeSchema.index({ organizationId: 1, departmentId: 1 });

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
