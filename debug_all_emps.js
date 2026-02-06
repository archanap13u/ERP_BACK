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

        console.log('Fetching ALL employees...');
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${org._id}`);

        if (empRes.data) {
            console.log(`Found ${empRes.data.length} employees:`);
            empRes.data.forEach((emp, i) => {
                console.log(`${i + 1}. ID: ${emp._id} | EmpID: ${emp.employeeId || 'MISSING'} | Name: "${emp.employeeName}"`);
            });
        }
    } catch (e) { console.error(e); }
}
run();
