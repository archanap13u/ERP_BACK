const http = require('http');

const studentId = '67907f16f39185ea9367e91d';
const orgId = '6788a101297e68fa792825c8';
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
        try {
            console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
        } catch (e) {
            console.log('Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(JSON.stringify({ verificationStatus: 'Verified by Ops' }));
req.end();
