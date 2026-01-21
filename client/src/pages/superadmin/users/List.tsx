import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users,
    Search,
    Briefcase,
    GraduationCap,
    Building2,
    CheckCircle,
    XCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    username?: string;
    role: string;
    designation?: string;
    type: 'employee' | 'student';
    isActive: boolean;
    createdAt: string;
    organization?: {
        _id: string;
        name: string;
        organizationId: string;
    };
}

interface Organization {
    _id: string;
    name: string;
    organizationId: string;
}

export default function UserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'employee' | 'student'>('all');
    const [orgFilter, setOrgFilter] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        totalEmployees: 0,
        totalStudents: 0
    });

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [navigate, userTypeFilter, orgFilter, pagination.page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', userTypeFilter);
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());
            if (searchTerm) params.append('search', searchTerm);
            if (orgFilter) params.append('organizationId', orgFilter);

            const response = await fetch(`/api/superadmin/users?${params}`);
            const result = await response.json();

            if (result.success) {
                setUsers(result.data.users);
                setPagination(prev => ({
                    ...prev,
                    ...result.data.pagination
                }));
                setOrganizations(result.data.organizations);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchUsers();
    };

    const UserTypeIcon = ({ type }: { type: 'employee' | 'student' }) => {
        if (type === 'employee') {
            return <Briefcase className="w-4 h-4 text-blue-500" />;
        }
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
                <p className="text-gray-600">Manage all users across all organizations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                            <p className="text-sm text-gray-600">Total Users</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.totalEmployees}</p>
                            <p className="text-sm text-gray-600">Employees</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{pagination.totalStudents}</p>
                            <p className="text-sm text-gray-600">Students</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, or username..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* User Type Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={userTypeFilter}
                            onChange={(e) => {
                                setUserTypeFilter(e.target.value as any);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                        >
                            <option value="all">All Users</option>
                            <option value="employee">Employees Only</option>
                            <option value="student">Students Only</option>
                        </select>
                    </div>

                    {/* Organization Filter */}
                    <select
                        value={orgFilter}
                        onChange={(e) => {
                            setOrgFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                    >
                        <option value="">All Organizations</option>
                        {organizations.map((org) => (
                            <option key={org._id} value={org._id}>
                                {org.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSearchTerm('');
                            setUserTypeFilter('all');
                            setOrgFilter('');
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reset</span>
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                    </div>
                ) : users.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role / Class</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Organization</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={`${user.type}-${user._id}`} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${user.type === 'employee'
                                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                                        : 'bg-gradient-to-br from-purple-500 to-purple-600'
                                                        }`}>
                                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${user.type === 'employee'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    <UserTypeIcon type={user.type} />
                                                    <span className="capitalize">{user.type}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {user.role}
                                                {user.designation && (
                                                    <p className="text-xs text-gray-500">{user.designation}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.organization ? (
                                                    <Link
                                                        to={`/superadmin/organizations/${user.organization._id}`}
                                                        className="flex items-center space-x-2 text-gray-900 hover:text-indigo-600"
                                                    >
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                        <span>{user.organization.name}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.isActive ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Active
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Inactive
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} users
                            </p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg">
                                    {pagination.page} / {pagination.totalPages || 1}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">
                            {searchTerm || orgFilter || userTypeFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No users have been registered yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
