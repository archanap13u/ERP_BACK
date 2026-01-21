import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, ArrowLeft, RefreshCw } from 'lucide-react';
import { fieldRegistry } from '../../config/fields';

export default function GenericListPage() {
    const { doctype } = useParams<{ doctype: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const displayTitle = (doctype || '').replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

    const fetchData = async () => {
        setLoading(true);
        try {
            const orgId = localStorage.getItem('organization_id');
            const deptId = localStorage.getItem('department_id');
            const userRole = localStorage.getItem('user_role');

            let url = `/api/resource/${doctype}?organizationId=${orgId || ''}`;

            if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin') {
                url += `&departmentId=${deptId}`;
            }

            const res = await fetch(url);
            const json = await res.json();
            setData(json.data || []);
        } catch (e) {
            console.error('Error fetching list:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (doctype) {
            fetchData();
        }
    }, [doctype]);

    const handleRowClick = (id: string) => {
        navigate(`/${doctype}/${id}`);
    };

    const filteredData = data.filter(item => {
        const searchStr = searchTerm.toLowerCase();
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="animate-in pb-20 max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-gray-200">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <div>
                        <h2 className="text-[24px] font-black text-[#1d2129] tracking-tight">{displayTitle}s</h2>
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{data.length} records available</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        className="bg-white border border-[#d1d8dd] p-2.5 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {doctype !== 'student' && (
                        <button
                            onClick={() => navigate(`/${doctype}/new`)}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                        >
                            <Plus size={18} />
                            Add {displayTitle}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#d1d8dd] shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${displayTitle}s...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-[14px] font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-[14px] text-gray-600 hover:text-blue-600 font-bold px-6 py-3 bg-white border border-gray-200 rounded-2xl hover:border-blue-200 transition-all shadow-sm">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[#8d99a6] font-black uppercase tracking-widest text-[11px]">
                                <th className="px-6 py-4 w-12"><input type="checkbox" className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                                <th className="px-6 py-4">Title / Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date Updated</th>
                                <th className="px-6 py-4 w-12 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && data.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-20">
                                            <Search size={48} className="mb-4" />
                                            <p className="text-xl font-black">No matching records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => handleRowClick(item._id)}
                                        className="hover:bg-blue-50/30 cursor-pointer group transition-all"
                                    >
                                        <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                            <input type="checkbox" className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#1d2129] group-hover:text-blue-600 transition-colors text-[15px]">
                                                    {item.name || item.holidayName || item.universityName || item.centerName || item.programName || item.employeeName || item.studentName || item.student || item.title || item._id}
                                                </span>
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">ID: {item._id.slice(-8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${item.status === 'Signed' || item.status === 'Active' || item.status === 'Present' || item.status === 'Accepted'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {item.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-[#626161] font-medium">
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button className="p-2 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-gray-100">
                                                <MoreHorizontal size={18} className="text-gray-400 hover:text-blue-600" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredData.length > 0 && (
                    <div className="p-6 border-t border-gray-50 bg-gray-50/20 flex items-center justify-between">
                        <p className="text-[12px] font-bold text-gray-400 uppercase">Showing {filteredData.length} of {data.length} entries</p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-400 cursor-not-allowed">Previous</button>
                            <button className="px-4 py-2 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-400 cursor-not-allowed">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
