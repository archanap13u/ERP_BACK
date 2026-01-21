const { MongoClient, ObjectId } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function repairDesignations() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        // 1. Get the Organization
        // We know the ID from debug logs: 6969b669217b28e718e16306
        // But let's find it dynamically to be safe
        const orgs = await db.collection("organizations").find({}).toArray();
        if (orgs.length === 0) { console.log("No orgs found"); return; }
        const org = orgs[0];
        console.log(`Using Org: ${org.organizationName} (${org._id})`);

        // 2. Get Valid Departments
        const departments = await db.collection("departments").find({ organizationId: org._id }).toArray();
        console.log(`Valid Departments (${departments.length}):`);
        departments.forEach(d => console.log(` - ${d.name} (${d._id})`));

        if (departments.length === 0) {
            console.log("No departments found. Cannot link designations.");
            return;
        }

        const validDeptIds = new Set(departments.map(d => d._id.toString()));
        const validDeptIdObj = departments[0]._id; // Default to the first one (HR) if orphaned

        // 3. Find Orphaned Designations
        const designations = await db.collection("designations").find({ organizationId: org._id }).toArray();
        let updatedCount = 0;

        for (const d of designations) {
            const currentDeptId = d.departmentId ? d.departmentId.toString() : null;

            if (!currentDeptId || !validDeptIds.has(currentDeptId)) {
                console.log(`[ORPHAN] Designation '${d.title}' has invalid DeptId: ${currentDeptId}`);

                // DATA REPAIR STRATEGY: 
                // Since we only found 1 department ('hr'), and we have orphans, 
                // we assume they belong to this department.
                // In a complex scenario, we might need manual mapping, but here auto-fix is safe-ish.

                await db.collection("designations").updateOne(
                    { _id: d._id },
                    { $set: { departmentId: validDeptIdObj } }
                );
                console.log(`   -> FIXED: Linked to '${departments[0].name}' (${validDeptIdObj})`);
                updatedCount++;
            }
        }

        console.log(`\nRepair Complete. Updated ${updatedCount} designations.`);

    } finally {
        await client.close();
    }
}

repairDesignations().catch(console.error);
