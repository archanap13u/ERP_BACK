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

        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${org._id}`);
        // Default sort is updatedAt desc
        if (empRes.data && empRes.data.length > 0) {
            const latest = empRes.data[0];
            console.log('LATEST EMP ID:', latest._id);
            console.log('LATEST EMP Name:', latest.employeeName);
            console.log('LATEST EMP ID (field):', latest.employeeId);
        } else {
            console.log('No employees.');
        }
    } catch (e) { console.error(e); }
}
run();
