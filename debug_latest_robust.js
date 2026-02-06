const http = require('http');

function fetch(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        const orgRes = await fetch('http://localhost:5000/api/resource/organization');
        const org = orgRes.data && orgRes.data[0];
        if (!org) { console.log('No org'); return; }

        console.log('Fetching employees...');
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${org._id}`);
        // Assuming sorted by updatedAt desc or creation
        if (empRes.data && empRes.data.length > 0) {
            const latest = empRes.data[0];
            // Check headers or date to be sure? 
            // resource.routes sorts by updatedAt: -1 usually.

            console.log('--- LATEST EMPLOYEE ---');
            console.log('ID:', latest._id);
            console.log('NAME:', latest.employeeName);
            console.log('EMP_ID:', latest.employeeId);
            console.log('RAW JSON:', JSON.stringify(latest));
        } else {
            console.log('No employees.');
        }
    } catch (e) { console.error(e); }
}
run();
