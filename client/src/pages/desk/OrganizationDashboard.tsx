import React, { useEffect, useState } from 'react';
import {
    Building2,
    Users,
    Activity,
    Clock,
    User,
    Shield,
    Plus,
    Lock,
    ArrowRight,
    Trash2,
    TrendingUp,
    Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Workspace from '../../components/Workspace';
import CustomizationModal from '../../components/CustomizationModal';
import { toast } from 'react-toastify';

export default function OrganizationDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [showDeptForm, setShowDeptForm] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', code: '', username: '', password: '', panelType: 'Generic' });
    const [updatingCreds, setUpdatingCreds] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [rowInputs, setRowInputs] = useState<Record<string, { username?: string, password?: string }>>({});
    const [customizingDept, setCustomizingDept] = useState<any | null>(null);

    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        if (!orgId) return;

        async function fetchData() {
            try {
                const query = `?organizationId=${orgId}`;

                const responses = await Promise.all([
                    fetch(`/api/resource/organization/${orgId}`),
                    fetch(`/api/resource/employee${query}`),
                    fetch(`/api/resource/student${query}`),
                    fetch(`/api/resource/lead${query}`),
                    fetch(`/api/resource/salesorder${query}`),
                    fetch(`/api/resource/salesinvoice${query}`),
                    fetch(`/api/resource/department${query}`),
                    fetch(`/api/resource/attendance${query}`)
                ]);

                const [jsonOrg, jsonEmp, jsonStud, jsonLead, jsonOrder, jsonInv, jsonDept, jsonAtt] = await Promise.all(
                    responses.map(r => r.json())
                );

                setOrg(jsonOrg.data);
                const empData = jsonEmp.data || [];
                setEmployees(empData);
                setDepartments(jsonDept.data || []);
                setAttendance(jsonAtt.data || []);

                setCounts({
                    employee: jsonEmp.data?.length || 0,
                    student: jsonStud.data?.length || 0,
                    lead: jsonLead.data?.length || 0,
                    salesorder: jsonOrder.data?.length || 0,
                    salesinvoice: jsonInv.data?.length || 0,
                    department: jsonDept.data?.length || 0,
                    attendance: jsonAtt.data?.length || 0
                });

            } catch (e) {
                console.error('Error fetching dashboard data:', e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [orgId]);

    const handleAddDept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDept.name || !newDept.code) return;

        try {
            const res = await fetch(`/api/resource/department?organizationId=${orgId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newDept, organizationId: orgId })
            });
            if (res.ok) {
                const data = await res.json();
                setDepartments([...departments, data.data]);
                setNewDept({ name: '', code: '', username: '', password: '', panelType: 'Generic' });
                setShowDeptForm(false);
                setCounts(prev => ({ ...prev, department: (prev.department || 0) + 1 }));
            }
        } catch (e) {
            console.error('Error adding department:', e);
        }
    };

    const handleDeleteDept = async (e: React.MouseEvent, deptId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this panel/department? All credentials will be removed.')) return;

        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setDepartments(departments.filter(d => d._id !== deptId));
                setCounts(prev => ({ ...prev, department: (prev.department || 0) - 1 }));
            }
        } catch (e) {
            console.error('Error deleting department:', e);
        }
    };

    const handleUpdateCreds = async (deptId: string) => {
        const input = rowInputs[deptId];
        const dept = departments.find(d => d._id === deptId);
        if (!dept) return;

        const updatedUsername = input?.username || dept.username;
        const updatedPassword = input?.password || dept.password;

        if (!updatedUsername || !updatedPassword) return;

        setUpdatingCreds(deptId);
        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: updatedUsername,
                    password: updatedPassword
                })
            });
            if (res.ok) {
                setDepartments(departments.map(d =>
                    d._id === deptId ? { ...d, username: updatedUsername, password: updatedPassword } : d
                ));
                setRowInputs(prev => {
                    const next = { ...prev };
                    delete next[deptId];
                    return next;
                });
                setSaveSuccess(deptId);
                setTimeout(() => setSaveSuccess(null), 3000);
            }
        } catch (e) {
            console.error('Error updating credentials:', e);
        } finally {
            setUpdatingCreds(null);
        }
    };

    const handleSaveFeatures = async (newFeatures: string[]) => {
        if (!customizingDept) return;
        try {
            const res = await fetch(`/api/resource/department/${customizingDept._id}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: newFeatures })
            });
            if (res.ok) {
                setDepartments(departments.map(d =>
                    d._id === customizingDept._id ? { ...d, features: newFeatures } : d
                ));
                setCustomizingDept(null);
                toast.success('Department portal customized!');
            }
        } catch (e) {
            console.error('Error saving features:', e);
            toast.error('Failed to customize department');
        }
    };

    const maxEmployees = org?.subscription?.maxEmployees || 0;
    const empPercentage = maxEmployees > 0 ? Math.min((counts.employee / maxEmployees) * 100, 100) : 0;

    return (
        <div className="space-y-8 pb-20">
            <Workspace
                title={`${org?.name || 'Organization'} Dashboard`}
                newHref="/department/new"
                summaryItems={[
                    { label: 'Dept Admins', value: loading ? '...' : counts.department || 0, color: 'text-purple-600', doctype: 'department' },
                    { label: 'Active Sessions', value: 'Live', color: 'text-emerald-600', doctype: 'attendance' },
                ]}
                masterCards={[
                    { label: 'Departments', icon: Building2, count: counts.department || 0, href: '/department' },
                    { label: 'System Settings', icon: Shield, count: counts.department || 0, href: '#' },
                ]}
                shortcuts={[
                    { label: 'Total Reports', href: '/organization-reports' },
                    { label: 'Manage Roles', href: '#' },
                    { label: 'Access Logs', href: '#' },
                ]}
            />

            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[20px] font-bold text-[#1d2129]">Department Portals</h3>
                    <p className="text-[14px] text-gray-500 font-medium">Manage admin access for specialized units</p>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {departments.map(dept => {
                    const deptEmps = employees.filter(e => e.department === dept.name);
                    return (
                        <Link key={dept._id} to={`/department-login?dept=${dept._id}`} className="group no-underline block h-full">
                            <div className="bg-white p-8 rounded-2xl border border-[#d1d8dd] shadow-sm hover:border-blue-400 hover:shadow-xl transition-all flex flex-col h-full transform hover:-translate-y-1">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                        Online
                                    </div>
                                </div>
                                <h4 className="text-[18px] font-bold text-[#1d2129] mb-1">{dept.name}</h4>
                                <p className="text-[13px] text-gray-400 font-bold uppercase tracking-tight mb-4">Code: {dept.code}</p>

                                <div className="bg-gray-50/50 p-4 rounded-xl space-y-2 mb-6 border border-gray-100">
                                    <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                                        <Shield size={14} className="text-blue-500" />
                                        <span className="truncate">{dept.username || 'No User'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                                        <Lock size={14} className="text-blue-500" />
                                        <span>••••••••</span>
                                    </div>
                                    {dept.features && dept.features.length > 0 && (
                                        <div className="pt-2 flex flex-wrap gap-1.5 border-t border-gray-100 mt-2">
                                            {dept.features.map((f: string) => (
                                                <span key={f} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-tighter">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto">
                                    <div className="flex justify-between items-center text-[13px] mb-2 font-bold text-gray-500">
                                        <span className="flex items-center gap-2"><Users size={16} /> Staff Members</span>
                                        <span className="text-[#1d2129]">{deptEmps.length}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-6">
                                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${Math.min((deptEmps.length / 20) * 100, 100)}%` }}></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-600 text-[14px] font-bold group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                            Enter Portal <ArrowRight size={18} />
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setCustomizingDept(dept);
                                                }}
                                                className="p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                                                title="Customize Portal"
                                            >
                                                <Settings size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteDept(e, dept._id);
                                                }}
                                                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                                title="Delete Panel"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Credential Management Section */}
            <div className="max-w-6xl mx-auto mt-12">
                <div className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[#d1d8dd] bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold text-[#1d2129]">Access Management</h3>
                                <p className="text-[13px] text-gray-500 font-medium">Manage credentials for department portals</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f9fafb] border-b border-[#d1d8dd] text-[#8d99a6] font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Department / Panel</th>
                                    <th className="px-6 py-4">Current Admin User</th>
                                    <th className="px-6 py-4">New Username</th>
                                    <th className="px-6 py-4">New Password</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                                {departments.map((dept) => (
                                    <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-[#1d2129]">{dept.name}</div>
                                            <div className="text-[11px] font-bold text-gray-400 uppercase">{dept.code}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="font-bold text-gray-700">{dept.username || 'Not Set'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <input
                                                value={rowInputs[dept._id]?.username ?? ''}
                                                placeholder="Enter new username..."
                                                onChange={e => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], username: e.target.value } }))}
                                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[13px]"
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            <input
                                                type="text"
                                                value={rowInputs[dept._id]?.password ?? ''}
                                                placeholder="Enter new password..."
                                                onChange={e => setRowInputs(prev => ({ ...prev, [dept._id]: { ...prev[dept._id], password: e.target.value } }))}
                                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[13px]"
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            <button
                                                onClick={() => handleUpdateCreds(dept._id)}
                                                disabled={updatingCreds === dept._id || !rowInputs[dept._id]?.username || !rowInputs[dept._id]?.password}
                                                className={`px-4 py-2 rounded-lg text-[12px] font-bold text-white w-full transition-all shadow-sm ${saveSuccess === dept._id ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                                    } disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none`}
                                            >
                                                {updatingCreds === dept._id ? 'Saving...' : saveSuccess === dept._id ? '✓ Saved' : 'Update Credentials'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CustomizationModal
                isOpen={!!customizingDept}
                onClose={() => setCustomizingDept(null)}
                currentFeatures={customizingDept?.features || []}
                onSave={handleSaveFeatures}
                title={`${customizingDept?.name || ''} Portal Customization`}
            />
        </div>
    );
}
