const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resource/department?organizationId=6969b669217b28e718e16306',
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
            console.log(`Depts count: ${json.data ? json.data.length : 0}`);

            if (json.data && json.data.length > 0) {
                json.data.forEach(d => {
                    console.log(`Dept: ${d.name} | ID: ${d._id}`);
                });
            }
        } catch (e) {
            console.log("Error parsing");
        }
    });
});

req.end();
