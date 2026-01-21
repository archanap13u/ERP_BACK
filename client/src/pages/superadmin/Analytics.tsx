import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    TrendingUp,
    Building2,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw
} from 'lucide-react';

interface AnalyticsData {
    summary: {
        totalOrganizations: number;
        activeOrganizations: number;
        totalEmployees: number;
        totalMembers: number;
        totalUsers: number;
        totalRevenue: number;
        growth: {
            organizations: number;
            employees: number;
            members: number;
        };
    };
    charts: {
        organizationGrowth: Array<{ _id: string; count: number }>;
        employeeGrowth: Array<{ _id: string; count: number }>;
        memberGrowth: Array<{ _id: string; count: number }>;
        subscriptionStats: { [key: string]: number };
        userDistribution: {
            employees: number;
            members: number;
        };
    };
    topOrganizations: Array<{
        _id: string;
        name: string;
        organizationId: string;
        isActive: boolean;
        subscription: { plan: string };
        employeeCount: number;
        memberCount: number;
        totalUsers: number;
    }>;
}

export default function SuperAdminAnalytics() {
    const navigate = useNavigate();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchAnalytics();
    }, [navigate, timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/superadmin/analytics?days=${timeRange}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const GrowthIndicator = ({ value }: { value: number }) => {
        const isPositive = value >= 0;
        return (
            <span className={`inline-flex items-center text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {Math.abs(value).toFixed(1)}%
            </span>
        );
    };

    const SimpleBarChart = ({ data, color }: { data: { [key: string]: number } | undefined; color: string }) => {
        const entries = data ? Object.entries(data) : [];
        const maxValue = Math.max(...entries.map(([_, v]) => v), 1);

        return (
            <div className="space-y-4">
                {entries.map(([label, value]) => (
                    <div key={label} className="space-y-1">
                        <div className="flex justify-between text-sm font-semibold">
                            <span className="text-gray-600 capitalize">{label}</span>
                            <span className="text-gray-900">{value}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${color}`}
                                style={{ width: `${(value / maxValue) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const ActivityChart = ({ data, color }: { data: Array<{ _id: string; count: number }> | undefined; color: string }) => {
        if (!data || data.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-gray-50 rounded-xl">
                    <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                    <p>No data for this period</p>
                </div>
            );
        }

        const maxValue = Math.max(...data.map(d => d.count), 1);
        const height = 100;
        const width = data.length * 40;

        return (
            <div className="relative h-48 w-full overflow-x-auto overflow-y-hidden pt-4">
                <svg className="h-full" style={{ width: `${width}px` }} preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
                    {[0, 25, 50, 75, 100].map(y => (
                        <line
                            key={y}
                            x1="0"
                            y1={height - y}
                            x2={width}
                            y2={height - y}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                        />
                    ))}
                    <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={data.map((d, i) => `${i * 40 + 20},${height - (d.count / maxValue) * height}`).join(' ')}
                    />
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={i * 40 + 20}
                            cy={height - (d.count / maxValue) * height}
                            r="4"
                            fill="white"
                            stroke={color}
                            strokeWidth="2"
                        />
                    ))}
                </svg>
            </div>
        );
    };

    const UserDistributionChart = ({ data }: { data: { employees: number; members: number } }) => {
        const total = (data.employees + data.members) || 1;
        const empPercent = (data.employees / total) * 100;
        const memPercent = (data.members / total) * 100;

        return (
            <div className="space-y-6">
                <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-100">
                    <div style={{ width: `${empPercent}%` }} className="bg-indigo-500 h-full" title="Employees" />
                    <div style={{ width: `${memPercent}%` }} className="bg-purple-500 h-full" title="Members" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Employees</p>
                        <p className="text-2xl font-bold text-indigo-900">{data.employees}</p>
                        <p className="text-xs text-indigo-500 font-medium">{empPercent.toFixed(1)}% of total</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Members</p>
                        <p className="text-2xl font-bold text-purple-900">{data.members}</p>
                        <p className="text-xs text-purple-500 font-medium">{memPercent.toFixed(1)}% of total</p>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
                    <p className="text-gray-600">Enterprise-wide statistics and strategic insights</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(Number(e.target.value))}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-700"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-100"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 rounded-xl bg-indigo-50">
                            <Building2 className="w-8 h-8 text-indigo-600" />
                        </div>
                        <GrowthIndicator value={data?.summary.growth.organizations || 0} />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">
                        {data?.summary.totalOrganizations || 0}
                    </h3>
                    <p className="text-gray-500 font-medium">Total Organizations</p>
                    <div className="mt-4 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-sm font-semibold text-gray-700">{data?.summary.activeOrganizations || 0} active</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 rounded-xl bg-orange-50">
                            <TrendingUp className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold uppercase tracking-wider">
                            Total Revenue
                        </div>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">
                        INR {(data?.summary.totalRevenue || 0).toLocaleString('en-IN')}
                    </h3>
                    <p className="text-gray-500 font-medium tracking-tight">Consolidated Subscription Amount (INR)</p>
                    <div className="mt-4 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="text-sm font-semibold text-gray-700">From active licenses</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-4 rounded-xl bg-purple-50">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                        <GrowthIndicator value={data?.summary.growth.members || 0} />
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">
                        {data?.summary.totalUsers || 0}
                    </h3>
                    <p className="text-gray-500 font-medium">Total Users Managed</p>
                    <div className="mt-4 flex space-x-6 text-sm">
                        <span className="text-gray-600 font-semibold">{data?.summary.totalEmployees || 0} Employees</span>
                        <span className="text-gray-600 font-semibold">{data?.summary.totalMembers || 0} Members</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-display">User Distribution</h2>
                    {data && (
                        <UserDistributionChart data={data.charts.userDistribution} />
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription Trends</h2>
                    {data && (
                        <SimpleBarChart
                            data={data.charts.subscriptionStats}
                            color="bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Organization Onboarding</h2>
                    {data && (
                        <ActivityChart
                            data={data.charts.organizationGrowth}
                            color="#4f46e5"
                        />
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Member Onboarding</h2>
                    {data && (
                        <ActivityChart
                            data={data.charts.memberGrowth}
                            color="#8b5cf6"
                        />
                    )}
                </div>
            </div>

            {/* Top Organizations Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Top Performing Organizations</h2>
                        <p className="text-sm text-gray-500 mt-1">Based on user count and activity</p>
                    </div>
                    <Link
                        to="/superadmin/organizations"
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition"
                    >
                        View All Organizations
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank & Organization</th>
                                <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Plan</th>
                                <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</th>
                                <th className="px-8 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.topOrganizations.map((org, index) => (
                                <tr key={org._id} className="hover:bg-gray-50/50 transition cursor-pointer" onClick={() => navigate(`/superadmin/organizations/${org._id}`)}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm rounded-lg ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-500'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{org.name}</p>
                                                <p className="text-xs text-gray-500">{org.organizationId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${org.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                            org.subscription?.plan === 'premium' ? 'bg-blue-100 text-blue-700' :
                                                org.subscription?.plan === 'basic' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {org.subscription?.plan || 'free'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="font-bold text-gray-900">{org.totalUsers}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-2 py-2 rounded-full inline-block ${org.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
