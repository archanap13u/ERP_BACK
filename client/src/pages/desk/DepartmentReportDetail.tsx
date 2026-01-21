import React, { useEffect, useState } from 'react';
import {
    Users,
    UserCheck,
    Building2,
    GraduationCap,
    ArrowLeft,
    TrendingUp,
    Clock,
    Shield
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export default function DepartmentReportDetail() {
    const { deptId } = useParams();
    const navigate = useNavigate();
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [department, setDepartment] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        if (!orgId || !deptId) return;

        async function fetchData() {
            try {
                const query = `?organizationId=${orgId}&departmentId=${deptId}`;
                const [resDept, resEmp, resStud, resAtt] = await Promise.all([
                    fetch(`/api/resource/department/${deptId}`),
                    fetch(`/api/resource/employee${query}`),
                    fetch(`/api/resource/student${query}`),
                    fetch(`/api/resource/attendance${query}`)
                ]);

                const [jsonDept, jsonEmp, jsonStud, jsonAtt] = await Promise.all([
                    resDept.json(),
                    resEmp.json(),
                    resStud.json(),
                    resAtt.json()
                ]);

                setDepartment(jsonDept.data);
                const empData = jsonEmp.data || [];
                const studData = jsonStud.data || [];
                const attData = jsonAtt.data || [];

                setEmployees(empData);
                setStudents(studData);
                setAttendance(attData);

                setCounts({
                    employee: empData.length,
                    student: studData.length,
                    attendance: attData.length
                });

            } catch (e) {
                console.error('Error fetching department details:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [orgId, deptId]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="max-w-6xl mx-auto px-4 mt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-[13px] uppercase tracking-widest mb-6"
                >
                    <ArrowLeft size={16} /> Back to Reports
                </button>

                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 border border-blue-100">
                        <Building2 size={30} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-[28px] font-black text-[#1d2129] tracking-tight">{department?.name || 'Department'} Details</h1>
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border border-emerald-100">Active Panel</span>
                        </div>
                        <p className="text-[14px] text-gray-500 font-medium">Detailed metrics and staff roster for {department?.code}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Dept Staff', value: counts.employee, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Dept Members', value: counts.student, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Today Presence', value: counts.attendance, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                    <item.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                                    <h3 className="text-2xl font-black text-[#1d2129]">{item.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Employee Roster */}
                    <div className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                                <Users size={18} className="text-blue-600" />
                                Staff Roster
                            </h3>
                            <span className="text-[12px] font-bold text-gray-400 uppercase">{employees.length} Members</span>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left text-[13px]">
                                <thead className="bg-[#f9fafb] border-b border-[#d1d8dd] text-[#8d99a6] font-bold uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Designation</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">No staff records found in this department.</td>
                                        </tr>
                                    ) : (
                                        employees.map((emp, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[#1d2129]">{emp.name}</div>
                                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{emp.employeeId || emp.username}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wide border border-blue-100">
                                                        {emp.designation || 'Staff'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        <span className="text-[11px] font-bold text-gray-500 uppercase">Active</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Member/Student List */}
                    <div className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-[#1d2129] flex items-center gap-2">
                                <GraduationCap size={18} className="text-purple-600" />
                                Member Directory
                            </h3>
                            <span className="text-[12px] font-bold text-gray-400 uppercase">{students.length} Enrolled</span>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left text-[13px]">
                                <thead className="bg-[#f9fafb] border-b border-[#d1d8dd] text-[#8d99a6] font-bold uppercase tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-10 text-center text-gray-400 italic">No member records found.</td>
                                        </tr>
                                    ) : (
                                        students.map((stud, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[#1d2129]">{stud.name}</div>
                                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{stud.studentId || stud.rollNo}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-600 font-medium">{stud.email || 'N/A'}</div>
                                                    <div className="text-gray-400 text-[11px]">{stud.mobile || ''}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Enrolled</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Performance/History Section */}
                <div className="mt-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-[20px] font-bold mb-2 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-blue-200" />
                                    Departmental Activity
                                </h3>
                                <p className="text-blue-100 text-[14px] font-medium max-w-lg">
                                    Aggregate attendance and performance logs are synced daily. Current presence rate is <span className="text-white font-black underline">{(attendance.length / Math.max(employees.length, 1) * 100).toFixed(1)}%</span>.
                                </p>
                            </div>
                            <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold text-[14px] hover:bg-blue-50 transition-all shadow-lg">
                                Export Full Report
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
