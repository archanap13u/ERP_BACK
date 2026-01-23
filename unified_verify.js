require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./server/models/Student');
const connectDB = require('./server/config/db');
const http = require('http');

async function verify() {
    await connectDB();
    console.log('--- Final Verification Suite ---');

    const testStudent = await Student.findOne({ verificationStatus: 'Processing' });
    if (!testStudent) {
        console.log('No processing students found to test. Test skipped.');
        mongoose.disconnect();
        return;
    }

    const stuId = testStudent._id.toString();
    const orgId = testStudent.organizationId.toString();

    console.log(`Testing with Student: ${testStudent.studentName} (${stuId}), Org: ${orgId}`);

    // Test 1: Successful Approval (Happy Path)
    await runTest('Happy Path', `/api/resource/student/${stuId}?organizationId=${orgId}`, 'PUT', { verificationStatus: 'Verified by Ops' }, 200);

    // Test 2: Missing OrganizationId (Should Clean and then Fail with 400)
    await runTest('Missing OrgId', `/api/resource/student/${stuId}?organizationId=null`, 'PUT', { verificationStatus: 'Verified by Ops' }, 400);

    // Test 3: String "undefined" OrgId (Should Clean and then Fail with 400)
    await runTest('String Undefined OrgId', `/api/resource/student/${stuId}?organizationId=undefined`, 'PUT', { verificationStatus: 'Verified by Ops' }, 400);

    console.log('\n--- Verification Complete ---');
    mongoose.disconnect();
}

function runTest(name, path, method, body, expectedStatus) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            console.log(`[${name}] Status: ${res.statusCode} (Expected: ${expectedStatus})`);
            if (res.statusCode === expectedStatus) {
                console.log(`  PASS: Received expected status.`);
            } else {
                console.log(`  FAIL: Unexpected status.`);
            }
            res.on('data', () => { });
            res.on('end', resolve);
        });

        req.on('error', (e) => {
            console.log(`  ERROR: ${e.message}`);
            resolve();
        });

        req.write(JSON.stringify(body));
        req.end();
    });
}

verify().catch(console.error);
