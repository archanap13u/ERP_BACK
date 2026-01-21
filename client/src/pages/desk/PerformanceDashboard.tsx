import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Target, Award, ArrowLeft, BarChart3, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PerformanceMetric {
    employeeId: string;
    employeeName: string;
    department: string;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    totalApplications: number;
    approvedApplications: number;
    status: string;
}

export default function PerformanceDashboard() {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/performance')
            .then(res => res.json())
            .then(data => {
                setMetrics(data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const totalEmployees = metrics.length;
    const avgConversionRate = metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.conversionRate, 0) / metrics.length)
        : 0;
    const totalLeadsManaged = metrics.reduce((sum, m) => sum + m.totalLeads, 0);
    const totalConversions = metrics.reduce((sum, m) => sum + m.convertedLeads, 0);

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/hr')}
                        className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-gray-400 hover:text-blue-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <p className="text-[11px] text-blue-600 font-black uppercase tracking-[0.2em]">CRM Intelligence</p>
                        </div>
                        <h2 className="text-[32px] font-black text-[#1d2129] tracking-tight leading-none">Performance Analytics</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-all cursor-default group">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Live Integration</p>
                            <p className="text-[16px] font-black text-[#1d2129] tracking-tighter">Active Sync</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Staff', value: totalEmployees, icon: Users, color: 'blue', desc: 'Monitored Employees' },
                    { label: 'Total Leads', value: totalLeadsManaged, icon: Target, color: 'emerald', desc: 'Across All Channels' },
                    { label: 'Conversions', value: totalConversions, icon: Award, color: 'orange', desc: 'Successful Closures' },
                    { label: 'Avg Conv. Rate', value: `${avgConversionRate}%`, icon: TrendingUp, color: 'indigo', desc: 'Efficiency Score' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700 opacity-60`}></div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className={`text-4xl font-black text-${stat.color}-600 tracking-tighter mb-2`}>{stat.value}</h3>
                            <p className="text-[11px] font-bold text-gray-300 italic uppercase tracking-tighter">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
                    <h3 className="text-[20px] font-black text-[#1d2129] flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                            <BarChart3 size={20} />
                        </div>
                        Staff Efficiency Matrix
                    </h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[12px] font-black uppercase tracking-widest text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all shadow-sm">Export Data</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[#8d99a6] font-black uppercase tracking-[0.2em] text-[10px]">
                                <th className="px-8 py-5">Employee Context</th>
                                <th className="px-8 py-5">Department</th>
                                <th className="px-8 py-5 text-center">Engagement</th>
                                <th className="px-8 py-5 text-center">Conversions</th>
                                <th className="px-8 py-5 text-center">Performance Rating</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-8"><div className="h-4 bg-gray-100 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : metrics.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-10">
                                            <Users size={64} />
                                            <p className="text-2xl font-black mt-4 uppercase tracking-[0.5em]">No Data Collected</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                metrics.map((metric, idx) => (
                                    <tr key={idx} className="hover:bg-blue-50/30 transition-all group cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                                    {metric.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#1d2129] text-[15px] group-hover:text-blue-600 transition-colors tracking-tight leading-none mb-1">{metric.employeeName}</p>
                                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">ID: {metric.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[14px] font-bold text-gray-500 uppercase tracking-tighter">{metric.department}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col">
                                                <span className="text-blue-600 font-black text-[16px]">{metric.totalLeads}</span>
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Leads</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col">
                                                <span className="text-emerald-500 font-black text-[16px]">{metric.convertedLeads}</span>
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Approved</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="flex-1 max-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${metric.conversionRate >= 70 ? 'bg-emerald-500' :
                                                                metric.conversionRate >= 40 ? 'bg-orange-400' : 'bg-red-400'
                                                            }`}
                                                        style={{ width: `${metric.conversionRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[12px] font-black w-10 ${metric.conversionRate >= 70 ? 'text-emerald-600' :
                                                        metric.conversionRate >= 40 ? 'text-orange-600' : 'text-red-500'
                                                    }`}>
                                                    {metric.conversionRate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${metric.status === 'Active' ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {metric.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="flex items-start gap-6 relative z-10">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                        <TrendingUp size={32} />
                    </div>
                    <div className="max-w-3xl">
                        <h4 className="text-2xl font-black mb-3 tracking-tight">Intelligence Reporting Active</h4>
                        <p className="text-blue-100 text-[15px] font-medium leading-relaxed opacity-90">
                            Employee metrics are synchronized with real-time CRM activities. Performance is evaluated based on
                            <strong> total lead engagement</strong>, <strong>conversion accuracy</strong>, and <strong>application throughput</strong>.
                            Record associations are established via the "Assigned To" metadata in lead and application modules.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
