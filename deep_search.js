const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log('--- DB SEARCH START ---');

    for (const col of collections) {
        const name = col.name;
        const docs = await db.collection(name).find({
            $or: [
                { employeeName: /Amal/i },
                { username: /Amal/i },
                { name: /Amal/i },
                { fullName: /Amal/i },
                { department: /Finance/i },
                { departmentName: /Finance/i },
                { subject: /Amal/i },
                { description: /Amal/i }
            ]
        }).toArray();

        if (docs.length > 0) {
            console.log(`\nCOLLECTION: ${name} (${docs.length} matches)`);
            docs.forEach(d => {
                console.log(`  - ID: ${d._id}`);
                console.log(`    Name/Employee: ${d.employeeName || d.name || d.username || d.fullName || 'N/A'}`);
                console.log(`    Dept: ${d.department || d.departmentName || 'N/A'}`);
                if (d.employeeId) console.log(`    EmployeeId: ${d.employeeId}`);
                if (d.departmentId) console.log(`    DeptId: ${d.departmentId}`);
            });
        }
    }

    console.log('\n--- DB SEARCH END ---');
    process.exit();
}

run();
