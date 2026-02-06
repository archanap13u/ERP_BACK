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
        const orgId = '6979e17bfd1c05443556411c'; // From previous context (organizationId)
        // OR fetch org first?
        // I'll fetch org first just in case
        const orgRes = await fetch('http://localhost:5000/api/resource/organization');
        const org = orgRes.data && orgRes.data[0];
        const oid = org ? org._id : orgId;

        console.log(`Using Org ID: ${oid}`);

        // Fetch using filter
        const query = `http://localhost:5000/api/resource/employee?employeeId=EMP-98&organizationId=${oid}`;
        console.log(`Querying: ${query}`);
        const res = await fetch(query);

        console.log(`Status: ${res.data ? 'Success' : 'Format?'}`);
        const count = res.data ? res.data.length : 0;
        console.log(`Found ${count} records.`);

        if (res.data && res.data.length > 0) {
            console.log('First Record:');
            console.log(`Name: ${res.data[0].employeeName}`);
            console.log(`ID: ${res.data[0].employeeId}`);
            console.log(`Dept: ${res.data[0].department}`);
        } else {
            console.log('No records found.');
        }

    } catch (e) { console.error(e); }
}
run();
