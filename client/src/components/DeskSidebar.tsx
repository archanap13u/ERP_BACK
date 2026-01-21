import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    School,
    Building2,
    BookOpen,
    GraduationCap,
    FileCheck,
    Users,
    LogOut,
    Megaphone,
    TrendingUp,
    FileBarChart
} from 'lucide-react';

export default function DeskSidebar() {
    const [role, setRole] = useState<string | null>(null);
    const [deptId, setDeptId] = useState<string | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [features, setFeatures] = useState<string[]>([]);

    const location = useLocation();
    const pathname = location.pathname;
    const navigate = useNavigate();

    useEffect(() => {
        const currentRole = localStorage.getItem('user_role');
        const currentOrgId = localStorage.getItem('organization_id');
        const currentDeptId = localStorage.getItem('department_id');
        const storedFeatures = localStorage.getItem('user_features');

        setRole(currentRole);
        setDeptId(currentDeptId);
        if (storedFeatures) {
            try {
                setFeatures(JSON.parse(storedFeatures));
            } catch (e) {
                console.error('Error parsing features', e);
            }
        }

        if (currentRole === 'OrganizationAdmin' && currentOrgId) {
            fetch(`/api/resource/department?organizationId=${currentOrgId}`)
                .then(res => res.json())
                .then(json => setDepartments(json.data || []));
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Employee Dashboard', href: '/employee-dashboard', roles: ['Employee'] },
        { icon: LayoutDashboard, label: 'Student Portal', href: '/student-dashboard', roles: ['Student'] },
        { icon: LayoutDashboard, label: 'Ops Workspace', href: '/ops-dashboard', roles: ['Operations'] },
        { icon: LayoutDashboard, label: 'Org Dashboard', href: '/organization-dashboard', roles: ['OrganizationAdmin'] },
        { icon: FileBarChart, label: 'Total Reports', href: '/organization-reports', roles: ['OrganizationAdmin'] },
        { icon: LayoutDashboard, label: 'Department Panel', href: `/department/${deptId}`, roles: ['DepartmentAdmin'] },

        // HR Workspace links - Exclusive to HR department/role
        { icon: Users, label: 'HR Workspace', href: '/hr', roles: ['HR'], feature: 'HR Workspace' },
        { icon: School, label: 'Holidays', href: '/holiday', roles: ['HR'], feature: 'HR Workspace' },
        { icon: Megaphone, label: 'Announcements', href: '/announcement', roles: ['HR'], feature: 'HR Workspace' },
        { icon: GraduationCap, label: 'Employees', href: '/employee', roles: ['HR'], feature: 'HR Workspace' },
        { icon: FileCheck, label: 'Attendance', href: '/attendance', roles: ['HR'], feature: 'HR Workspace' },
        { icon: TrendingUp, label: 'Performance', href: '/performancereview', roles: ['HR'], feature: 'HR Workspace' },

        { icon: School, label: 'Universities', href: '/university', roles: ['Operations'], feature: 'Operations' },
        { icon: Building2, label: 'Study Centers', href: '/studycenter', roles: ['Operations'], feature: 'Operations' },
        { icon: BookOpen, label: 'Programs', href: '/program', roles: ['Operations'], feature: 'Operations' },
        { icon: GraduationCap, label: 'Students', href: '/student', roles: ['Operations'], feature: 'Student Management' },
        { icon: FileCheck, label: 'Applications', href: '/application', roles: ['Operations'], feature: 'Student Management' },
    ];

    const visibleItems = menuItems.filter(item => {
        if (!role) return false;
        if (item.roles?.includes(role)) return true;

        // If DepartmentAdmin, also show items that match enabled features
        if (role === 'DepartmentAdmin' && item.feature && features.includes(item.feature)) {
            return true;
        }

        return false;
    });

    return (
        <div className="w-60 h-screen bg-[#f4f5f6] border-r border-[#d1d8dd] flex flex-col fixed left-0 top-0 z-50 overflow-y-auto">
            <div className="p-4 pt-16 flex-1">
                <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3 flex items-center justify-between">
                    <span>{role ? `${role} View` : 'Navigation'}</span>
                </div>
                <nav className="space-y-1">
                    {visibleItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                to={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded text-[#1d2129] hover:bg-[#eef1f5] transition-colors no-underline ${isActive ? 'bg-white border border-[#d1d8dd] font-semibold text-blue-600 shadow-sm' : ''}`}
                            >
                                <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[13px]">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {role === 'OrganizationAdmin' && departments.length > 0 && (
                    <div className="mt-8">
                        <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3">
                            Departments
                        </div>
                        <nav className="space-y-1">
                            {departments.map((dept) => {
                                const href = `/department/${dept._id}`;
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={dept._id}
                                        to={href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded text-[#1d2129] hover:bg-[#eef1f5] transition-colors no-underline ${isActive ? 'bg-white border border-[#d1d8dd] font-semibold text-blue-600 shadow-sm' : ''}`}
                                    >
                                        <Building2 size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[13px] truncate">{dept.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}

                <div className="mt-8">
                    <div className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-wider mb-4 px-3">
                        Quick Actions
                    </div>
                    <div className="px-3 space-y-3">
                        {(role === 'HR') && (
                            <Link to="/employee/new" className="block text-[13px] text-[#626161] hover:text-blue-600 no-underline">Add Employee</Link>
                        )}
                        <Link to="/application/new" className="block text-[13px] text-[#626161] hover:text-blue-600 no-underline">New Application</Link>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-[#d1d8dd]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded text-red-600 hover:bg-red-50 transition-colors no-underline"
                >
                    <LogOut size={16} />
                    <span className="text-[13px]">Logout</span>
                </button>
            </div>
        </div>
    );
}
