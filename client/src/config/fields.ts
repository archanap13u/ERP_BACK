export interface Field {
    name: string;
    label: string;
    type: 'text' | 'date' | 'select' | 'number' | 'email' | 'password' | 'multi-select';
    options?: string[];
    link?: string; // If it's a select linked to another doctype
    required?: boolean;
    placeholder?: string;
}

export const fieldRegistry: { [key: string]: Field[] } = {
    employee: [
        { name: 'employeeName', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Work Email', type: 'email', required: true },
        { name: 'username', label: 'Login Username', type: 'text', required: true },
        { name: 'password', label: 'Login Password', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'select', link: 'department' },
        { name: 'designation', label: 'Designation', type: 'text' },
        { name: 'dateOfJoining', label: 'Date of Joining', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'On Leave', 'Left'] }
    ],
    student: [
        { name: 'studentName', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'student', label: 'Admission #', type: 'text' },
        { name: 'program', label: 'Enrolled Program', type: 'select', options: ['Higher Education', 'Vocational', 'K-12'] },
        { name: 'academicYear', label: 'Academic Year', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'In-active', 'Graduated'] }
    ],
    department: [
        { name: 'name', label: 'Department Name', type: 'text', required: true },
        { name: 'code', label: 'Short Code', type: 'text', required: true },
        { name: 'username', label: 'Portal Username', type: 'text', required: true },
        { name: 'password', label: 'Portal Password', type: 'text', required: true },
        { name: 'panelType', label: 'UI Style', type: 'select', options: ['Generic', 'HR', 'Operations', 'Finance', 'Inventory', 'CRM', 'Projects', 'Support', 'Assets'] }
    ],
    university: [
        { name: 'universityName', label: 'University Name', type: 'text', required: true },
        { name: 'country', label: 'Country', type: 'text' },
        { name: 'website', label: 'Website URL', type: 'text' },
        { name: 'status', label: 'Partnership Status', type: 'select', options: ['Signed', 'Pending', 'Inactive'] }
    ],
    studycenter: [
        { name: 'centerName', label: 'Center Name', type: 'text', required: true },
        { name: 'location', label: 'Location/City', type: 'text' },
        { name: 'manager', label: 'Center Manager', type: 'text' },
        { name: 'status', label: 'Operation Status', type: 'select', options: ['Functional', 'Maintenance', 'Closed'] }
    ],
    application: [
        { name: 'studentName', label: 'Student Name', type: 'text', required: true },
        { name: 'program', label: 'Target Program', type: 'text', required: true },
        { name: 'university', label: 'Target University', type: 'select', link: 'university' },
        { name: 'status', label: 'Application Status', type: 'select', options: ['Submitted', 'Under Review', 'Accepted', 'Rejected'] }
    ],
    announcement: [
        { name: 'title', label: 'Subject', type: 'text', required: true },
        { name: 'content', label: 'Message Body', type: 'text', required: true },
        { name: 'date', label: 'Post Date', type: 'date', required: true },
        { name: 'postedBy', label: 'Author', type: 'text' }
    ],
    holiday: [
        { name: 'holidayName', label: 'Holiday Title', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'description', label: 'Description', type: 'text' }
    ],
    attendance: [
        { name: 'employeeName', label: 'Employee', type: 'select', link: 'employee', required: true },
        { name: 'status', label: 'Attendance', type: 'select', options: ['Present', 'Absent', 'Half-Day', 'On Leave'], required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'remarks', label: 'Remarks', type: 'text' }
    ],
    performancereview: [
        { name: 'employeeName', label: 'Employee Name', type: 'select', link: 'employee', required: true },
        { name: 'reviewer', label: 'Reviewer', type: 'text', required: true },
        { name: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
        { name: 'feedback', label: 'Feedback', type: 'text' }
    ],
    salesorder: [
        { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
        { name: 'date', label: 'Order Date', type: 'date' },
        { name: 'amount', label: 'Total Amount', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['Draft', 'Pending', 'Delivered', 'Cancelled'] }
    ],
    salesinvoice: [
        { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
        { name: 'salesOrder', label: 'Sales Order Link', type: 'select', link: 'salesorder' },
        { name: 'amount', label: 'Invoice Amount', type: 'number', required: true },
        { name: 'status', label: 'Payment Status', type: 'select', options: ['Unpaid', 'Paid', 'Overdue'] }
    ],
    lead: [
        { name: 'name', label: 'Lead Name', type: 'text', required: true },
        { name: 'source', label: 'Lead Source', type: 'select', options: ['Website', 'Referral', 'Advertisement', 'Walk-in'] },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'status', label: 'Lead Status', type: 'select', options: ['Open', 'Interested', 'Converted', 'Closed'] }
    ]
};
