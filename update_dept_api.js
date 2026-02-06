const http = require('http');

function fetch(url, options) {
    return new Promise((resolve, reject) => {
        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function run() {
    try {
        const orgRes = await new Promise((resolve, reject) => {
            http.get('http://localhost:5000/api/resource/organization', (res) => {
                let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
            }).on('error', reject);
        });
        const org = orgRes.data && orgRes.data[0];
        const orgId = org._id;

        const deptId = '697b020594396a1fd48f8b93'; // ID from debug output for "sa"

        const payload = JSON.stringify({ name: 'Sales' });

        const opts = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            body: payload
        };

        console.log(`Updating Department ${deptId} to 'Sales'...`);
        // Using PUT resource/:doctype/:id
        const updateUrl = `http://localhost:5000/api/resource/department/${deptId}?organizationId=${orgId}`;

        const res = await fetch(updateUrl, opts);
        console.log('Update Result:', JSON.stringify(res, null, 2));

    } catch (e) {
        console.error(e);
    }
}
run();
