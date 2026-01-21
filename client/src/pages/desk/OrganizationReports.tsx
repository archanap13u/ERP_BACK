import React, { useEffect, useState } from 'react';
import {
    Users,
    UserCheck,
    Building2,
    GraduationCap,
    ArrowLeft,
    TrendingUp,
    FileBarChart,
    PieChart as PieChartIcon,
    ArrowRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Workspace from '../../components/Workspace';

export default function OrganizationReports() {
    const navigate = useNavigate();
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        if (!orgId) return;

        async function fetchData() {
            try {
                const query = `?organizationId=${orgId}`;
                const [resEmp, resStud, resDept, resAtt] = await Promise.all([
                    fetch(`/api/resource/employee${query}`),
                    fetch(`/api/resource/student${query}`),
                    fetch(`/api/resource/department${query}`),
                    fetch(`/api/resource/attendance${query}`)
                ]);

                const [jsonEmp, jsonStud, jsonDept, jsonAtt] = await Promise.all([
                    resEmp.json(),
                    resStud.json(),
                    resDept.json(),
                    resAtt.json()
                ]);

                const empData = jsonEmp.data || [];
                const studData = jsonStud.data || [];
                const deptData = jsonDept.data || [];
                const attData = jsonAtt.data || [];

                setEmployees(empData);
                setStudents(studData);
                setDepartments(deptData);

                setCounts({
                    employee: empData.length,
                    student: studData.length,
                    department: deptData.length,
                    attendance: attData.length
                });

            } catch (e) {
                console.error('Error fetching report data:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [orgId]);

    return (
        <div className="space-y-8 pb-20">
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-[13px] uppercase tracking-widest mb-6"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                        <FileBarChart size={30} />
                    </div>
                    <div>
                        <h1 className="text-[28px] font-black text-[#1d2129] tracking-tight">Organization Total Reports</h1>
                        <p className="text-[14px] text-gray-500 font-medium">Aggregated insights across all departmental units</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Staff', value: loading ? '...' : counts.employee, icon: Users, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
                        { label: 'Total Members', value: loading ? '...' : counts.student, icon: GraduationCap, color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
                        { label: 'Total Depts', value: loading ? '...' : counts.department, icon: Building2, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
                        { label: 'Today Presence', value: loading ? '...' : counts.attendance, icon: UserCheck, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' },
                    ].map((item, idx) => (
                        <div key={idx} className={`bg-white p-6 rounded-2xl border ${item.border} shadow-sm transition-all hover:shadow-md`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
                                    <item.icon size={20} />
                                </div>
                                <TrendingUp size={16} className="text-gray-300" />
                            </div>
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <h3 className="text-3xl font-black text-[#1d2129]">{item.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Department Breakdown Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                                <Building2 size={18} className="text-blue-600" />
                                Departmental Breakdown
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[13px]">
                                <thead className="bg-[#f9fafb] border-b border-[#d1d8dd] text-[#8d99a6] font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Department Name</th>
                                        <th className="px-6 py-4">Admin Hub</th>
                                        <th className="px-6 py-4 text-center">Staff</th>
                                        <th className="px-6 py-4 text-center">Members</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {departments.map((dept, idx) => {
                                        const deptEmps = employees.filter(e => e.departmentId === dept._id || e.department === dept.name).length;
                                        const deptStuds = students.filter(s => s.departmentId === dept._id || s.department === dept.name).length;
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <Link
                                                        to={`/organization-reports/${dept._id}`}
                                                        className="no-underline block group/link"
                                                    >
                                                        <div className="font-bold text-[#1d2129] group-hover/link:text-blue-600 transition-colors flex items-center gap-2">
                                                            {dept.name}
                                                            <ArrowRight size={14} className="opacity-0 group-hover/link:opacity-100 transition-all translate-x-[-4px] group-hover/link:translate-x-0" />
                                                        </div>
                                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{dept.code}</div>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-blue-600 font-bold">{dept.username || 'Unmanaged'}</div>
                                                    <div className="text-[11px] text-gray-400 font-medium uppercase">{dept.panelType || 'Custom'} Portal</div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">{deptEmps}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold">{deptStuds}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        <span className="text-[11px] font-bold text-gray-500 uppercase">Active</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Insights/Quick Actions */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-[#1d2129] to-[#2d323b] p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-[20px] font-bold mb-4 flex items-center gap-2">
                                    <PieChartIcon size={20} className="text-blue-400" />
                                    Growth Insights
                                </h3>
                                <p className="text-gray-400 text-[13px] font-medium leading-relaxed mb-8">
                                    Your organization has scaled to <span className="text-white font-bold">{counts.employee} staff members</span> across <span className="text-white font-bold">{counts.department} active departments</span>.
                                </p>
                                <div className="space-y-4">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Target Reached</span>
                                            <span className="text-[14px] font-black">84%</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full w-[84%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm">
                            <h3 className="text-[16px] font-bold text-[#1d2129] mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" />
                                System Health
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Cloud Database', status: 'Healthy', color: 'text-emerald-500' },
                                    { label: 'API Gateway', status: 'Responsive', color: 'text-emerald-500' },
                                    { label: 'Auth Service', status: 'Secured', color: 'text-blue-500' },
                                ].map((sys, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4">
                                        <span className="text-[13px] font-bold text-gray-500">{sys.label}</span>
                                        <span className={`text-[12px] font-black uppercase tracking-widest ${sys.color}`}>{sys.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
