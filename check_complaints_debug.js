const mongoose = require('mongoose');
require('dotenv').config();

async function checkComplaints() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const Complaint = mongoose.connection.db.collection('complaints');

        // Get all complaints
        const allComplaints = await Complaint.find({}).toArray();
        console.log(`📊 Total Complaints in DB: ${allComplaints.length}\n`);

        if (allComplaints.length > 0) {
            console.log('Recent Complaints:');
            allComplaints.slice(0, 5).forEach((comp, idx) => {
                console.log(`${idx + 1}. Subject: "${comp.subject}"`);
                console.log(`   Employee: ${comp.employeeName} (ID: ${comp.employeeId})`);
                console.log(`   Department: ${comp.department}`);
                console.log(`   Status: ${comp.status}`);
                console.log(`   Date: ${comp.date}`);
                console.log(`   OrgID: ${comp.organizationId}`);
                console.log('');
            });
        } else {
            console.log('⚠️  NO COMPLAINTS FOUND IN DATABASE');
        }

        // Group by employeeId
        const byEmployee = {};
        allComplaints.forEach(c => {
            if (!byEmployee[c.employeeId]) byEmployee[c.employeeId] = [];
            byEmployee[c.employeeId].push(c);
        });

        console.log('\n📋 Complaints by Employee:');
        Object.entries(byEmployee).forEach(([empId, complaints]) => {
            console.log(`  ${empId}: ${complaints.length} complaint(s)`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkComplaints();
