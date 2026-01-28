// Server-specific model exports (CommonJS)
const Employee = require('./Employee');
const Student = require('./Student');
const Organization = require('./Organization');
const SuperAdmin = require('./SuperAdmin');
const Department = require('./Department');
const License = require('./License');
const PlatformSettings = require('./PlatformSettings');
const Lead = require('./Lead');
const Application = require('./Application');
const Attendance = require('./Attendance');
const SalesOrder = require('./SalesOrder');
const SalesInvoice = require('./SalesInvoice');
const PurchaseOrder = require('./PurchaseOrder');
const Supplier = require('./Supplier');
const Quotation = require('./Quotation');
const Opportunity = require('./Opportunity');
const Customer = require('./Customer');
const Designation = require('./Designation');
const Announcement = require('./Announcement');
const Complaint = require('./Complaint');
const Holiday = require('./Holiday');
const PerformanceReview = require('./PerformanceReview');
const JobOpening = require('./JobOpening');
const Project = require('./Project');
const DailyReport = require('./DailyReport');
const University = require('./University');
const PaymentEntry = require('./PaymentEntry');
const ExpenseClaim = require('./ExpenseClaim');
const Program = require('./Program');
const StudyCenter = require('./StudyCenter');
const InternalMark = require('./InternalMark');
const OpsAnnouncement = require('./OpsAnnouncement');
const ExamSchedule = require('./ExamSchedule');
const Task = require('./Task');
const LeaveRequest = require('./LeaveRequest');

// Models index for dynamic resource API
const models = {
    employee: Employee,
    student: Student,
    organization: Organization,
    superadmin: SuperAdmin,
    department: Department,
    license: License,
    platformsettings: PlatformSettings,
    lead: Lead,
    application: Application,
    attendance: Attendance,
    salesorder: SalesOrder,
    salesinvoice: SalesInvoice,
    purchaseorder: PurchaseOrder,
    supplier: Supplier,
    quotation: Quotation,
    opportunity: Opportunity,
    customer: Customer,
    designation: Designation,
    announcement: Announcement,
    complaint: Complaint,
    holiday: Holiday,
    performancereview: PerformanceReview,
    jobopening: JobOpening,
    'job-opening': JobOpening,
    project: Project,
    project: Project,
    dailyreport: DailyReport,
    university: University,
    paymententry: PaymentEntry,
    expenseclaim: ExpenseClaim,
    program: Program,
    studycenter: StudyCenter,
    internalmark: InternalMark,
    studentapplicant: Application,
    opsannouncement: OpsAnnouncement,
    examschedule: ExamSchedule,
    task: Task,
    leaverequest: LeaveRequest
};

module.exports = {
    Employee,
    Student,
    Organization,
    SuperAdmin,
    Department,
    License,
    PlatformSettings,
    Announcement,
    OpsAnnouncement,
    Complaint,
    Lead,
    Application,
    Attendance,
    SalesOrder,
    SalesInvoice,
    PurchaseOrder,
    Supplier,
    Quotation,
    Opportunity,
    Customer,
    Holiday,
    PerformanceReview,
    JobOpening,
    Project,
    DailyReport,
    University,
    PaymentEntry,
    ExpenseClaim,
    Program,
    StudyCenter,
    InternalMark,
    ExamSchedule,
    Task,
    LeaveRequest,
    models
};
