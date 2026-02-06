const http = require('http');
const fs = require('fs');

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
        if (!org) return;

        console.log('Fetching Employees...');
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${org._id}`);
        const employees = empRes.data || [];

        const bdes = employees.filter(e =>
            (e.designation || '').toLowerCase().includes('bde') ||
            (e.role || '').toLowerCase() === 'bde' ||
            (e.employeeName || '').toLowerCase().includes('bde')
        );

        const mismatched = employees.filter(e =>
            (e.department || '').toLowerCase().includes('operations') &&
            (e.designation || '').toLowerCase().includes('sales')
        );

        const output = {
            bdes: bdes.map(e => ({ name: e.employeeName, id: e.employeeId, dept: e.department, designation: e.designation })),
            mismatched: mismatched.map(e => ({ name: e.employeeName, dept: e.department, designation: e.designation }))
        };

        fs.writeFileSync('bde_results.json', JSON.stringify(output, null, 2));
        console.log('Results written to bde_results.json');

    } catch (e) { console.error(e); }
}
run();
