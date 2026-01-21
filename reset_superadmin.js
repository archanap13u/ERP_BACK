const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// URI from .env
const uri = "mongodb+srv://erp:erp@erp.jbyu7tj.mongodb.net/erp-next?retryWrites=true&w=majority&appName=ERP";

async function reset() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("erp-next");
        const collection = db.collection("superadmins");

        const newPassword = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        console.log('Resetting superadmin password...');
        const result = await collection.updateOne(
            { username: 'superadmin' },
            { $set: { password: hash } }
        );

        if (result.matchedCount > 0) {
            console.log('Successfully reset superadmin password to: admin123');
        } else {
            console.log('Superadmin user not found. Creating a new one...');
            await collection.insertOne({
                username: 'superadmin',
                email: 'admin@erp.com',
                fullName: 'Super Administrator',
                password: hash,
                isActive: true
            });
            console.log('Successfully created superadmin user with password: admin123');
        }

    } catch (e) {
        console.error('Reset failed:', e);
    } finally {
        await client.close();
    }
}

reset().catch(console.error);
