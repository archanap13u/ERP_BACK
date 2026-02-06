import University from './University';
import Complaint from './Complaint';
import OpsAnnouncement from './OpsAnnouncement';
import StudyCenter from './StudyCenter';
import Program from './Program';
import Student from './Student';
import Application from './Application';
import Employee from './Employee';
import Attendance from './Attendance';
import Holiday from './Holiday';
import Announcement from './Announcement';
import PerformanceReview from './PerformanceReview';
import Lead from './Lead';
import SuperAdmin from './SuperAdmin';
import Organization from './Organization';
import OrganizationHierarchy from './OrganizationHierarchy';
import Customer from './Customer';
import Supplier from './Supplier';
import Item from './Item';
import SalesOrder from './SalesOrder';
import SalesInvoice from './SalesInvoice';
import Quotation from './Quotation';
import Department from './Department';
import Designation from './Designation';
import { JobOpening } from './JobOpening';
import InternalMark from './InternalMark';
import LeaveRequest from './LeaveRequest';

export const models: { [key: string]: any } = {
    university: University,
    studycenter: StudyCenter,
    program: Program,
    student: Student,
    application: Application,
    employee: Employee,
    attendance: Attendance,
    holiday: Holiday,
    announcement: Announcement,
    performancereview: PerformanceReview,
    lead: Lead,
    superadmin: SuperAdmin,
    organization: Organization,
    organizationhierarchy: OrganizationHierarchy,
    customer: Customer,
    supplier: Supplier,
    item: Item,
    salesorder: SalesOrder,
    salesinvoice: SalesInvoice,
    quotation: Quotation,
    department: Department,
    designation: Designation,
    jobopening: JobOpening,
    studentapplicant: Application,
    opsannouncement: OpsAnnouncement,
    complaint: Complaint,
    internalmark: InternalMark,
    leaverequest: LeaveRequest,
};
