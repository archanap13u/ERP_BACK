const { MongoClient, ObjectId } = require('mongodb');

// Your Connection String
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function repairDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");

        console.log("🛠️ Starting Database Repair...");

        // 1. Repair Employees
        // 1. Repair Employees
        const employeeCursor = db.collection("employees").find({ $or: [{ username: { $exists: false } }, { password: { $exists: false } }] });
        let employeeCount = 0;
        for await (const doc of employeeCursor) {
            const updates = {};
            if (!doc.username) updates.username = `temp_user_${doc._id}`;
            if (!doc.password) updates.password = "temp_password";
            if (Object.keys(updates).length > 0) {
                await db.collection("employees").updateOne({ _id: doc._id }, { $set: updates });
                employeeCount++;
            }
        }
        console.log(`✅ Employees updated: ${employeeCount}`);

        // 2. Repair Students
        // 2. Repair Students
        const studentCursor = db.collection("students").find({ $or: [{ username: { $exists: false } }, { password: { $exists: false } }] });
        let studentCount = 0;
        for await (const doc of studentCursor) {
            const updates = {};
            if (!doc.username) updates.username = `temp_student_${doc._id}`;
            if (!doc.password) updates.password = "temp_password";
            if (Object.keys(updates).length > 0) {
                await db.collection("students").updateOne({ _id: doc._id }, { $set: updates });
                studentCount++;
            }
        }
        console.log(`✅ Students updated: ${studentCount}`);

        console.log("\n🚀 All existing records now have placeholder credentials.");
        console.log("You can now edit them in the UI to set specific logins.");

    } catch (err) {
        console.error("❌ Error during repair:", err);
    } finally {
        await client.close();
    }
}

repairDatabase();
