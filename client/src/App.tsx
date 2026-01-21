import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoginPage from './pages/LoginPage'
import SuperAdminLayout from './components/SuperAdminLayout'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import OrganizationList from './pages/superadmin/organizations/List'
import NewOrganization from './pages/superadmin/organizations/New'
import EditOrganization from './pages/superadmin/organizations/Edit'
import OrganizationDetails from './pages/superadmin/organizations/Details'
import LicenseList from './pages/superadmin/licenses/List'
import UserList from './pages/superadmin/users/List'
import PlatformSettings from './pages/superadmin/Settings'
import SuperAdminAnalytics from './pages/superadmin/Analytics'
import DeskLayout from './components/DeskLayout'
import OrganizationDashboard from './pages/desk/OrganizationDashboard'
import HRWorkspace from './pages/desk/HRWorkspace'
import EmployeeDashboard from './pages/desk/EmployeeDashboard'
import StudentDashboard from './pages/desk/StudentDashboard'
import OpsDashboard from './pages/desk/OpsDashboard'
import GenericListPage from './pages/desk/GenericListPage'
import GenericNewPage from './pages/desk/GenericNewPage'
import GenericDetailsPage from './pages/desk/GenericDetailsPage'
import AccountingWorkspace from './pages/desk/AccountingWorkspace'
import SellingWorkspace from './pages/desk/SellingWorkspace'
import BuyingWorkspace from './pages/desk/BuyingWorkspace'
import CRMWorkspace from './pages/desk/CRMWorkspace'
import PerformanceDashboard from './pages/desk/PerformanceDashboard'
import RootPage from './pages/desk/RootPage'
import OrganizationReports from './pages/desk/OrganizationReports'
import DepartmentReportDetail from './pages/desk/DepartmentReportDetail'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Super Admin Routes */}
                    <Route path="/superadmin" element={<SuperAdminLayout />}>
                        <Route path="dashboard" element={<SuperAdminDashboard />} />
                        <Route path="organizations" element={<OrganizationList />} />
                        <Route path="organizations/new" element={<NewOrganization />} />
                        <Route path="organizations/:id" element={<OrganizationDetails />} />
                        <Route path="organizations/:id/edit" element={<EditOrganization />} />
                        <Route path="licenses" element={<LicenseList />} />
                        <Route path="users" element={<UserList />} />
                        <Route path="settings" element={<PlatformSettings />} />
                        <Route path="analytics" element={<SuperAdminAnalytics />} />
                        <Route path="" element={<Navigate to="/superadmin/dashboard" replace />} />
                    </Route>

                    {/* Desk / Organization Admin Routes */}
                    <Route path="/" element={<DeskLayout />}>
                        <Route index element={<RootPage />} />
                        <Route path="organization-dashboard" element={<OrganizationDashboard />} />
                        <Route path="hr" element={<HRWorkspace />} />
                        <Route path="employee-dashboard" element={<EmployeeDashboard />} />
                        <Route path="student-dashboard" element={<StudentDashboard />} />
                        <Route path="ops-dashboard" element={<OpsDashboard />} />
                        <Route path="organization-reports" element={<OrganizationReports />} />
                        <Route path="organization-reports/:deptId" element={<DepartmentReportDetail />} />

                        {/* Generic Doctype Routes */}
                        <Route path=":doctype" element={<GenericListPage />} />
                        <Route path=":doctype/new" element={<GenericNewPage />} />
                        <Route path=":doctype/:id" element={<GenericDetailsPage />} />

                        <Route path="accounting" element={<AccountingWorkspace />} />
                        <Route path="selling" element={<SellingWorkspace />} />
                        <Route path="buying" element={<BuyingWorkspace />} />
                        <Route path="crm" element={<CRMWorkspace />} />
                        <Route path="performance" element={<PerformanceDashboard />} />

                        {/* More desk routes will be added here */}
                    </Route>

                    <Route path="/" element={<Navigate to="/login" replace />} />
                    {/* Other routes will be added here */}
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </Router>
    )
}

export default App
