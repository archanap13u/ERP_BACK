const http = require('http');

async function verify() {
    // We saw "arun" in the DB earlier
    const orgId = "696f24697e737d6a7669c501";
    const empName = "ammu";
    const url = `/api/resource/complaint?organizationId=${orgId}&employeeName=${encodeURIComponent(empName)}`;

    console.log(`Testing URL: ${url}`);

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            const json = JSON.parse(data);
            console.log(`Found ${json.data ? json.data.length : 0} complaints.`);
            if (json.data && json.data.length > 0) {
                json.data.forEach(c => {
                    console.log(`- Subject: ${c.subject}, Name: ${c.employeeName}, ID: ${c.employeeId}`);
                });
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
    });

    req.end();
}

verify();
