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

        if (empRes.data && empRes.data.length > 0) {
            // Sort by createdAt desc if not already? API sorts by default.
            // Let's grab the first one (GeneircList usually fetches all, backend sorts updatedAt -1 as per resource.routes line 116)

            const latest = empRes.data[0];
            console.log('Latest Employee Found:');
            console.log('ID:', latest._id);
            console.log('EmployeeID:', latest.employeeId);
            console.log('EmployeeName:', latest.employeeName);
            console.log('Name (property):', latest.name);
            console.log('Keys:', Object.keys(latest));
        } else {
            console.log('No employees found.');
        }

    } catch (e) {
        console.error(e);
    }
}

run();
