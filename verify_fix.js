const http = require('http');

// Use a valid student ID from the database
// From previous check: Found Student ID: 6971ee16f5... (Wait I need the full ID)
// I'll use the ID from test_400_v2.js but with a valid Org ID.
const studentId = '696f3d61efb280d88f609d8e'; // Correct real ID from DB

async function verify() {
    const orgId = "696f24697e737d6a7669c501"; // Archana's orgId
    const url = `/api/resource/student/${studentId}?organizationId=${orgId}`;

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: url,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Response:', data);
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.write(JSON.stringify({ verificationStatus: 'Verified by Ops' }));
    req.end();
}

verify();
