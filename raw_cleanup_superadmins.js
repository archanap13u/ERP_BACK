const { MongoClient } = require('mongodb');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function cleanup() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");
        const collection = db.collection("superadmins");

        console.log('Searching for corrupted records...');
        const result = await collection.deleteMany({
            $or: [
                { username: { $exists: false } },
                { username: null },
                { username: "undefined" },
                { password: { $exists: false } },
                { password: null },
                { password: "" }
            ]
        });

        console.log(`Successfully deleted ${result.deletedCount} corrupted records from superadmins collection.`);

    } catch (e) {
        console.error('Cleanup failed:', e);
    } finally {
        await client.close();
    }
}

cleanup().catch(console.error);
