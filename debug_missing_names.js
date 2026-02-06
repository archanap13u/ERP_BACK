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
            let badRecords = 0;
            empRes.data.forEach((emp, i) => {
                if (!emp.employeeName || emp.employeeName.trim() === '') {
                    console.log(`[BAD RECORD] ID: ${emp._id} | EmpID: ${emp.employeeId} | Name is EMPTY/MISSING`);
                    badRecords++;
                } else {
                    // console.log(`[OK] ${emp.employeeName}`);
                }
            });

            if (badRecords === 0) {
                console.log('All records have Names.');
            } else {
                console.log(`Found ${badRecords} records with missing names.`);
            }

            // Log the latest one just in case
            console.log('Total:', empRes.data.length);
        }
    } catch (e) { console.error(e); }
}
run();
