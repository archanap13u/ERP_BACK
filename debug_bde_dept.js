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
        if (!org) return;

        console.log('Fetching Employees...');
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${org._id}`);
        const employees = empRes.data || [];

        console.log(`Total Employees: ${employees.length}`);

        const bdes = employees.filter(e =>
            (e.designation || '').toLowerCase().includes('bde') ||
            (e.role || '').toLowerCase() === 'bde' ||
            (e.employeeName || '').toLowerCase().includes('bde')
        );

        console.log(`Found ${bdes.length} BDE-related employees:`);
        bdes.forEach(e => {
            console.log(`- Name: ${e.employeeName} | ID: ${e.employeeId} | Dept: ${e.department} | DeptID: ${e.departmentId}`);
        });

        // Also check if any employee has department 'Operations' but designation 'BDE'
        const mismatched = employees.filter(e =>
            (e.department || '').toLowerCase().includes('operations') &&
            (e.designation || '').toLowerCase().includes('sales')
        );

        if (mismatched.length > 0) {
            console.log('\n--- POTENTIAL MISMATCHES (Ops Dept + Sales Title) ---');
            mismatched.forEach(e => {
                console.log(`- Name: ${e.employeeName} | Dept: ${e.department} | Designation: ${e.designation}`);
            });
        }

    } catch (e) { console.error(e); }
}
run();
