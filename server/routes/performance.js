const express = require('express');
const router = express.Router();

// Import models from local CommonJS files
const Lead = require('../models/Lead');
const Application = require('../models/Application');
const Employee = require('../models/Employee');

// GET /api/performance
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find({});

        const performanceData = await Promise.all(
            employees.map(async (emp) => {
                const employeeId = emp.employeeId;

                const totalLeads = await Lead.countDocuments({ assignedTo: employeeId });
                const convertedLeads = await Lead.countDocuments({
                    assignedTo: employeeId,
                    status: 'Converted'
                });

                const totalApplications = await Application.countDocuments({ assignedTo: employeeId });
                const approvedApplications = await Application.countDocuments({
                    assignedTo: employeeId,
                    status: 'Approved'
                });

                const conversionRate = totalLeads > 0
                    ? Math.round((convertedLeads / totalLeads) * 100)
                    : 0;

                return {
                    employeeId: emp.employeeId,
                    employeeName: emp.employeeName,
                    department: emp.department,
                    totalLeads,
                    convertedLeads,
                    conversionRate,
                    totalApplications,
                    approvedApplications,
                    status: emp.status
                };
            })
        );

        return res.json({ data: performanceData });
    } catch (error) {
        console.error('[Performance API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
