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
        const orgId = org._id;

        // Fetch Departments
        const deptRes = await fetch(`http://localhost:5000/api/resource/department?organizationId=${orgId}`);
        const departments = deptRes.data || [];
        const deptMap = {};
        departments.forEach(d => {
            deptMap[d._id] = d.name;
        });

        // Fetch Employees
        const empRes = await fetch(`http://localhost:5000/api/resource/employee?organizationId=${orgId}`);
        const employees = empRes.data || [];

        const bdes = employees.filter(e =>
            (e.designation || '').toLowerCase().includes('bde') ||
            (e.role || '').toLowerCase() === 'bde' ||
            ['fathima', 'anagha'].includes((e.employeeName || '').toLowerCase())
        );

        const output = {
            departments: departments.map(d => ({ name: d.name, id: d._id, panelType: d.panelType })),
            bdes: bdes.map(e => ({
                name: e.employeeName,
                id: e.employeeId,
                stored_dept_string: e.department,
                stored_dept_id: e.departmentId,
                resolved_dept_name: deptMap[e.departmentId] || 'UNKNOWN_ID'
            }))
        };

        fs.writeFileSync('id_debug_results.json', JSON.stringify(output, null, 2));

    } catch (e) { console.error(e); }
}
run();
