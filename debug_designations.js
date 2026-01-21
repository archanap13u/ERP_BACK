const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resource/designation',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Status:", res.statusCode);
            if (json.data && json.data.length > 0) {
                console.log("Sample Designation:", JSON.stringify(json.data[0], null, 2));
                console.log("Total Designations:", json.data.length);

                // Check departmentId types
                json.data.forEach(d => {
                    console.log(`Title: ${d.title}, DeptId Type: ${typeof d.departmentId}, DeptId Value: ${JSON.stringify(d.departmentId)}`);
                });

            } else {
                console.log("No designations found or empty data.");
                console.log("Full response:", data);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw output:", data);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
