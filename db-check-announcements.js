const mongoose = require('mongoose');
const path = require('path');

// Mock a simple model loader
const MONGODB_URI = 'mongodb://127.0.0.1:27017/erpnext';

async function inspect() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;

        console.log('\n--- DEPARTMENTS ---');
        const departments = await db.collection('departments').find({}).toArray();
        departments.forEach(d => {
            console.log(`ID: ${d._id}, Name: "${d.name}", Panel: ${d.panelType}, Org: ${d.organizationId}`);
        });

        console.log('\n--- ANNOUNCEMENTS (HR) ---');
        const announcements = await db.collection('announcements').find({}).toArray();
        announcements.forEach(a => {
            console.log(`ID: ${a._id}, Title: "${a.title}", Dept: "${a.department}", DeptID: ${a.departmentId}, Org: ${a.organizationId}`);
        });

        console.log('\n--- OPS ANNOUNCEMENTS ---');
        const opsAnns = await db.collection('opsannouncements').find({}).toArray();
        opsAnns.forEach(a => {
            console.log(`ID: ${a._id}, Title: "${a.title}", Dept: "${a.department}", DeptID: ${a.departmentId}, Org: ${a.organizationId}`);
        });

        await mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
}

inspect();
