const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resource/designation?organizationId=6969b669217b28e718e16306',
    method: 'GET',
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log("Status:", res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log(`Initial fetch count: ${json.data ? json.data.length : 0}`);

            if (json.data && json.data.length > 0) {
                json.data.slice(0, 5).forEach(d => {
                    console.log(`Desig: ${d.title} | DeptId: ${d.departmentId} | Type: ${typeof d.departmentId}`);
                });
            }
        } catch (e) {
            console.log("Error parsing");
        }
    });
});

req.end();
