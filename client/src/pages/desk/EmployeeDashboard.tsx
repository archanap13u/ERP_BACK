import React, { useEffect, useState } from 'react';
import { UserCheck, CalendarDays, Megaphone, Clock, Calendar, GraduationCap } from 'lucide-react';

export default function EmployeeDashboard() {
    const [name, setName] = useState('');
    const [empId, setEmpId] = useState('');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        const storedId = localStorage.getItem('employee_id');
        setName(storedName || 'Staff Member');
        setEmpId(storedId || '');

        async function fetchData() {
            try {
                const [resAnn, resHol] = await Promise.all([
                    fetch('/api/resource/announcement'),
                    fetch('/api/resource/holiday')
                ]);
                const [jsonAnn, jsonHol] = await Promise.all([resAnn.json(), resHol.json()]);
                setAnnouncements(jsonAnn.data || []);
                setHolidays(jsonHol.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#1d2129] tracking-tight">Welcome back, {name}</h1>
                    <p className="text-gray-500 mt-2 font-medium">It's {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center">
                    <div className="bg-white px-6 py-4 rounded-2xl border border-[#d1d8dd] flex items-center gap-4 shadow-sm group hover:border-blue-400 transition-all cursor-default">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Shift Status</p>
                            <p className="text-[15px] font-bold text-emerald-600 tracking-tight">On Duty</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Announcements Feed */}
                    <section className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b border-[#f0f4f7] bg-[#f9fafb] flex items-center gap-3">
                            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-100">
                                <Megaphone size={18} />
                            </div>
                            <h2 className="text-[16px] font-bold text-[#1d2129] uppercase tracking-wider">Company Announcements</h2>
                        </div>
                        <div className="p-8 space-y-8 flex-1">
                            {loading ? (
                                <div className="space-y-8">
                                    {[1, 2].map(i => (
                                        <div key={i} className="animate-pulse space-y-3">
                                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                                            <div className="h-3 bg-gray-50 rounded-full w-full"></div>
                                            <div className="h-3 bg-gray-50 rounded-full w-5/6"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : announcements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400 opacity-30">
                                    <Megaphone size={48} className="mb-4" />
                                    <p className="italic font-bold tracking-tight">No announcements posted recently.</p>
                                </div>
                            ) : (
                                announcements.map((ann, idx) => (
                                    <div key={idx} className="group relative pl-8 border-l-2 border-blue-100 hover:border-blue-600 transition-colors">
                                        <div className="absolute -left-[5px] top-0 w-[8px] h-[8px] rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-50"></div>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-[16px] font-bold text-[#1d2129] group-hover:text-blue-600 transition-colors tracking-tight leading-tight">{ann.title}</h3>
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap ml-4">
                                                {new Date(ann.date || ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[14px] text-gray-600 leading-relaxed font-medium">{ann.content}</p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] flex items-center justify-center font-black">AD</div>
                                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">Office Admin</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* Quick Profile Section */}
                    <section className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-2xl font-black">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-blue-200 text-[11px] font-black uppercase tracking-widest leading-none mb-1">Employee ID</p>
                                    <p className="text-[18px] font-bold tracking-tight">{empId || 'STAFF-01'}</p>
                                </div>
                            </div>

                            <h3 className="text-[20px] font-bold leading-none mb-6">{name}</h3>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">System Access</span>
                                    <span className="text-[11px] font-black bg-emerald-400/20 text-emerald-300 px-2 py-1 rounded-md uppercase tracking-tighter">Verified</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                            <GraduationCap size={160} className="rotate-12" />
                        </div>
                    </section>

                    {/* Holidays Sidebar */}
                    <section className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb] flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                <CalendarDays size={18} />
                            </div>
                            <h2 className="text-[15px] font-bold text-[#1d2129] uppercase tracking-wider">Public Holidays</h2>
                        </div>
                        <div className="p-6 space-y-5">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse"></div>)}
                                </div>
                            ) : holidays.length === 0 ? (
                                <p className="text-gray-400 italic text-center font-medium text-[12px] py-4">No upcoming holidays.</p>
                            ) : (
                                holidays.map((hol, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-200 transition-all shadow-sm">
                                            <span className="text-[9px] font-black text-orange-500 uppercase leading-none">
                                                {new Date(hol.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-[18px] font-black text-gray-900 leading-none mt-0.5">
                                                {new Date(hol.date).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[13px] font-bold text-[#1d2129] tracking-tight group-hover:text-blue-600 transition-colors uppercase">{hol.holidayName}</p>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">{new Date(hol.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
                <button className="p-8 bg-white border border-[#d1d8dd] rounded-3xl flex items-center gap-6 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 transition-all text-left shadow-sm group transform hover:-translate-y-1">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm border border-emerald-100">
                        <UserCheck size={32} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-[#1d2129] tracking-tight">Log Attendance</p>
                        <p className="text-[13px] text-gray-500 font-bold uppercase tracking-widest mt-1">Submit your shift status</p>
                    </div>
                </button>
                <button className="p-8 bg-white border border-[#d1d8dd] rounded-3xl flex items-center gap-6 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all text-left shadow-sm group transform hover:-translate-y-1">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm border border-blue-100">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-[#1d2129] tracking-tight">Apply for Leave</p>
                        <p className="text-[13px] text-gray-500 font-bold uppercase tracking-widest mt-1">Request time off from system</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
