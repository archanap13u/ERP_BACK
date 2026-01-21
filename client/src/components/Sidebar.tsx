'use client';

import React from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    School,
    Building2,
    BookOpen,
    GraduationCap,
    FileCheck,
    Settings,
    Grid,
    Users,
    LogOut,
    Megaphone,
    TrendingUp
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [role, setRole] = React.useState<string | null>(null);
    const [deptId, setDeptId] = React.useState<string | null>(null);
    const [departments, setDepartments] = React.useState<any[]>([]);

    React.useEffect(() => {
        const currentRole = localStorage.getItem('user_role');
        const currentOrgId = localStorage.getItem('organization_id');
        const currentDeptId = localStorage.getItem('department_id');
        setRole(currentRole);
        setDeptId(currentDeptId);

        if (currentRole === 'OrganizationAdmin' && currentOrgId) {
            fetch(`/api/resource/department?organizationId=${currentOrgId}`)
                .then(res => res.json())
                .then(json => setDepartments(json.data || []));
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Employee Dashboard', href: '/employee-dashboard', roles: ['Employee'] },
        { icon: LayoutDashboard, label: 'Student Portal', href: '/student-dashboard', roles: ['Student'] },
        { icon: LayoutDashboard, label: 'Ops Workspace', href: '/ops-dashboard', roles: ['Operations'] },
        { icon: LayoutDashboard, label: 'Org Dashboard', href: '/organization-dashboard', roles: ['OrganizationAdmin'] },
        { icon: LayoutDashboard, label: 'Department Panel', href: `/department/${deptId}`, roles: ['DepartmentAdmin'] },

        // HR Workspace links - Exclusive to HR department/role
        { icon: Users, label: 'HR Workspace', href: '/hr', roles: ['HR'] },
        { icon: School, label: 'Holidays', href: '/holiday', roles: ['HR'] },
        { icon: Megaphone, label: 'Announcements', href: '/announcement', roles: ['HR'] },
        { icon: GraduationCap, label: 'Employees', href: '/employee', roles: ['HR', 'OrganizationAdmin'] },
        { icon: FileCheck, label: 'Attendance', href: '/attendance', roles: ['HR', 'OrganizationAdmin'] },
        { icon: TrendingUp, label: 'Performance', href: '/performancereview', roles: ['HR'] },

        { icon: School, label: 'Universities', href: '/university', roles: ['Operations'] },
        { icon: Building2, label: 'Study Centers', href: '/studycenter', roles: ['Operations'] },
        { icon: BookOpen, label: 'Programs', href: '/program', roles: ['Operations', 'OrganizationAdmin'] },
        { icon: GraduationCap, label: 'Students', href: '/student', roles: ['Operations', 'OrganizationAdmin'] },
        { icon: FileCheck, label: 'Applications', href: '/application', roles: ['Operations', 'OrganizationAdmin'] },
    ];

    const visibleItems = menuItems.filter(item => !role || item.roles?.includes(role));

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
                                href={item.href}
                                className={`sidebar-item decoration-0 no-underline ${isActive ? 'active' : ''}`}
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
                                        href={href}
                                        className={`sidebar-item decoration-0 no-underline ${isActive ? 'active' : ''}`}
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
                            <Link href="/employee/new" className="block text-[13px] text-[#626161] hover:text-blue-600 no-underline">Add Employee</Link>
                        )}
                        <Link href="/application/new" className="block text-[13px] text-[#626161] hover:text-blue-600 no-underline">New Application</Link>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-[#d1d8dd]">
                <button
                    onClick={handleLogout}
                    className="sidebar-item w-full text-red-600 hover:bg-red-50 no-underline"
                >
                    <LogOut size={16} />
                    <span className="text-[13px]">Logout</span>
                </button>
            </div>
        </div>
    );
}
