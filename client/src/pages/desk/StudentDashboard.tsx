import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, Megaphone, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function StudentDashboard() {
    const [name, setName] = useState('');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedName = localStorage.getItem('user_name');
        setName(storedName || 'Student');

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
                    <h1 className="text-3xl font-bold text-[#1d2129] tracking-tight">University Portal</h1>
                    <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Welcome back, {name}
                    </p>
                </div>
                <div className="flex items-center">
                    <div className="bg-white px-6 py-4 rounded-2xl border border-[#d1d8dd] flex items-center gap-4 shadow-sm group hover:border-emerald-400 transition-all cursor-default">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Account Status</p>
                            <p className="text-[15px] font-bold text-emerald-600 tracking-tight">Verified Student</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Announcements */}
                    <section className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-[#f0f4f7] bg-[#f9fafb] flex items-center gap-3">
                            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm shadow-blue-100">
                                <Megaphone size={18} />
                            </div>
                            <h2 className="text-[16px] font-bold text-[#1d2129] uppercase tracking-wider">Campus News & Updates</h2>
                        </div>
                        <div className="p-8 space-y-8 flex-1">
                            {loading ? (
                                <div className="space-y-8">
                                    {[1, 2].map(i => (
                                        <div key={i} className="animate-pulse space-y-3">
                                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                                            <div className="h-3 bg-gray-50 rounded-full w-full"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : announcements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-400 opacity-30">
                                    <Megaphone size={48} className="mb-4" />
                                    <p className="italic font-bold tracking-tight text-center">No university announcements<br />posted recently.</p>
                                </div>
                            ) : (
                                announcements.map((ann, idx) => (
                                    <div key={idx} className="group relative pl-8 border-l-2 border-indigo-100 hover:border-indigo-600 transition-colors">
                                        <div className="absolute -left-[5px] top-0 w-[8px] h-[8px] rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-50 shadow-sm"></div>
                                        <h3 className="text-[16px] font-bold text-[#1d2129] group-hover:text-indigo-600 transition-colors tracking-tight leading-tight">{ann.title}</h3>
                                        <p className="text-[14px] text-gray-600 mt-2 leading-relaxed font-medium">{ann.content}</p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                                                {new Date(ann.date || ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <div className="h-4 w-[1px] bg-gray-200"></div>
                                            <span className="text-[11px] text-blue-500 font-black uppercase tracking-tighter">University Admin</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Quick Stats for student */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 group relative overflow-hidden">
                            <div className="relative z-10">
                                <FileText size={32} className="mb-6 opacity-40 group-hover:scale-110 transition-transform" />
                                <h3 className="text-3xl font-black tracking-tight leading-none mb-2">1 Active</h3>
                                <p className="text-indigo-100 text-[14px] font-bold uppercase tracking-widest leading-none">Application Stored</p>
                                <button className="mt-8 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-[12px] font-bold backdrop-blur-md transition-all">Track Progress</button>
                            </div>
                            <div className="absolute -right-8 -bottom-8 bg-white/5 w-40 h-40 rounded-full group-hover:scale-125 transition-transform"></div>
                        </div>
                        <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl text-white shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 group relative overflow-hidden">
                            <div className="relative z-10">
                                <BookOpen size={32} className="mb-6 opacity-40 group-hover:scale-110 transition-transform" />
                                <h3 className="text-3xl font-black tracking-tight leading-none mb-2">Verified</h3>
                                <p className="text-emerald-100 text-[14px] font-bold uppercase tracking-widest leading-none">Enrollment Status</p>
                                <button className="mt-8 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-[12px] font-bold backdrop-blur-md transition-all">View Program</button>
                            </div>
                            <div className="absolute -right-8 -bottom-8 bg-white/5 w-40 h-40 rounded-full group-hover:scale-125 transition-transform"></div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Holidays */}
                    <section className="bg-white rounded-2xl border border-[#d1d8dd] shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-[#f0f4f7] bg-[#f9fafb] flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                <CalendarDays size={18} />
                            </div>
                            <h2 className="text-[15px] font-bold text-[#1d2129] uppercase tracking-wider">Holiday Calendar</h2>
                        </div>
                        <div className="p-6 space-y-6 flex-1">
                            {holidays.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 opacity-20">
                                    <CalendarDays size={32} />
                                    <p className="text-[12px] font-bold uppercase mt-2">No Holidays Listed</p>
                                </div>
                            ) : (
                                holidays.map((hol, idx) => (
                                    <div key={idx} className="flex items-center gap-5 group cursor-pointer hover:bg-gray-50 p-3 -mx-3 rounded-2xl transition-all">
                                        <div className="text-center min-w-[50px] bg-white rounded-xl shadow-sm border border-gray-100 p-2 group-hover:border-orange-200 group-hover:bg-orange-50 transition-all">
                                            <p className="text-[10px] font-black text-orange-500 uppercase leading-none">{new Date(hol.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                                            <p className="text-[20px] font-black text-gray-900 leading-none mt-1">{new Date(hol.date).getDate()}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[14px] font-bold text-[#1d2129] tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-none mb-1">{hol.holidayName}</p>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{new Date(hol.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Support Info */}
                    <div className="p-8 bg-blue-600 rounded-3xl border border-blue-700 shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
                        <h4 className="text-[18px] font-bold mb-4 relative z-10 tracking-tight">University Support</h4>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center gap-3 text-blue-100 font-bold uppercase tracking-tighter text-[12px]">
                                <Clock size={16} className="text-blue-300" />
                                <span>IST: 09:00 - 18:00</span>
                            </div>
                            <button className="w-full bg-white text-blue-600 py-3 rounded-xl text-[13px] font-black shadow-lg shadow-blue-900/40 hover:bg-blue-50 transition-all active:scale-95 uppercase tracking-widest">
                                Contact Helpdesk
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
