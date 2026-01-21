import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building2,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    Key,
    Copy,
    Power,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Organization {
    _id: string;
    name: string;
    organizationId: string;
    domain?: string;
    username: string;
    password: string;
    isActive: boolean;
    createdAt: string;
    adminId?: {
        employeeName: string;
        email: string;
    };
    subscription?: {
        plan: string;
        maxUsers?: number;
    };
    stats?: {
        totalUsers: number;
        employeeCount: number;
        studentCount: number;
    };
}

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    isDestructive = false,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all animate-in fade-in zoom-in-95">
                <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-100' : 'bg-amber-100'}`}>
                        <AlertTriangle className={`w-6 h-6 ${isDestructive ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                            {message}
                        </p>
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition ${isDestructive
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                            >
                                {isDestructive ? 'Delete' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function OrganizationList() {
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        isDestructive: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        isDestructive: false,
        onConfirm: () => { },
    });

    useEffect(() => {
        // Check authentication
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }

        fetchOrganizations();
    }, [navigate, statusFilter]);

    const fetchOrganizations = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const response = await fetch(`/api/superadmin/organizations?${params}`);
            const data = await response.json();

            if (data.success) {
                setOrganizations(data.data);
            }
        } catch (error) {
            console.error('Error fetching organizations:', error);
            toast.error('Failed to load organizations');
        } finally {
            setLoading(false);
        }
    };

    const confirmAction = (title: string, message: string, isDestructive: boolean, action: () => void) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            isDestructive,
            onConfirm: () => {
                action();
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleDelete = (id: string, name: string) => {
        confirmAction(
            `Delete Organization`,
            `Are you sure you want to permanently delete "${name}"? This will remove ALL associated users, data, and settings. This action cannot be undone.`,
            true,
            async () => {
                try {
                    const response = await fetch(`/api/superadmin/organizations/${id}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        toast.success(data.message);
                        fetchOrganizations();
                    } else {
                        toast.error(data.error);
                    }
                } catch (error) {
                    console.error('Error deleting organization:', error);
                    toast.error('Failed to delete organization');
                }
            }
        );
    };

    const handleToggleStatus = (id: string, currentStatus: boolean, name: string) => {
        const action = currentStatus ? 'deactivate' : 'activate';

        confirmAction(
            `${currentStatus ? 'Deactivate' : 'Activate'} Organization`,
            `Are you sure you want to ${action} "${name}"? ${currentStatus ? 'Users will temporarily lose access.' : 'Users will allow to access the platform.'}`,
            currentStatus,
            async () => {
                try {
                    const response = await fetch(`/api/superadmin/organizations/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: !currentStatus })
                    });

                    const data = await response.json();
                    if (data.success) {
                        setOrganizations(prev => prev.map(org =>
                            org._id === id ? { ...org, isActive: !currentStatus } : org
                        ));
                        toast.success(`Organization ${action}d successfully`);
                    } else {
                        toast.error(data.error);
                    }
                } catch (error) {
                    console.error('Error toggling status:', error);
                    toast.error('Failed to update status');
                }
            }
        );
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const filteredOrganizations = organizations.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.organizationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                isDestructive={modalConfig.isDestructive}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Organizations</h1>
                        <p className="text-gray-600">Manage all organizations in your platform</p>
                    </div>
                    <Link
                        to="/superadmin/organizations/new"
                        className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Organization</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search organizations..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Organizations Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredOrganizations.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Organization
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <Key className="w-3 h-3" />
                                            <span>Credentials</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Seats (Current/Max)
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredOrganizations.map((org) => (
                                    <tr key={org._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900">{org.name}</div>
                                                <div className="text-sm text-gray-500">{org.organizationId}</div>
                                                {org.domain && (
                                                    <div className="text-xs text-indigo-600">{org.domain}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500 w-16">Username:</span>
                                                    <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                        {org.username || '—'}
                                                    </code>
                                                    {org.username && (
                                                        <button
                                                            onClick={() => copyToClipboard(org.username, 'Username')}
                                                            className="text-gray-400 hover:text-indigo-600"
                                                            title="Copy username"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500 w-16">Password:</span>
                                                    <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                        {visiblePasswords.has(org._id)
                                                            ? (org.password || '—')
                                                            : '••••••••'
                                                        }
                                                    </code>
                                                    {org.password && (
                                                        <>
                                                            <button
                                                                onClick={() => togglePasswordVisibility(org._id)}
                                                                className="text-gray-400 hover:text-indigo-600"
                                                                title={visiblePasswords.has(org._id) ? 'Hide password' : 'Show password'}
                                                            >
                                                                {visiblePasswords.has(org._id)
                                                                    ? <EyeOff className="w-3 h-3" />
                                                                    : <Eye className="w-3 h-3" />
                                                                }
                                                            </button>
                                                            <button
                                                                onClick={() => copyToClipboard(org.password, 'Password')}
                                                                className="text-gray-400 hover:text-indigo-600"
                                                                title="Copy password"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${org.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                                org.subscription?.plan === 'premium' ? 'bg-blue-100 text-blue-700' :
                                                    org.subscription?.plan === 'basic' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {org.subscription?.plan || 'free'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="font-semibold text-gray-900 text-sm">
                                                    {org.stats?.totalUsers || 0} / {org.subscription?.maxUsers || 10}
                                                </div>
                                                <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${((org.stats?.totalUsers || 0) / (org.subscription?.maxUsers || 10)) >= 1
                                                            ? 'bg-red-500'
                                                            : ((org.stats?.totalUsers || 0) / (org.subscription?.maxUsers || 10)) > 0.8
                                                                ? 'bg-orange-500'
                                                                : 'bg-indigo-500'
                                                            }`}
                                                        style={{ width: `${Math.min(((org.stats?.totalUsers || 0) / (org.subscription?.maxUsers || 10)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${org.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {org.isActive ? (
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
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    to={`/superadmin/organizations/${org._id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/superadmin/organizations/${org._id}/edit`}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleStatus(org._id, org.isActive, org.name)}
                                                    className={`p-2 rounded-lg transition ${org.isActive
                                                        ? 'text-red-600 hover:bg-red-50 ring-1 ring-red-100' // Red for Deactivate (current is Active)
                                                        : 'text-green-600 hover:bg-green-50 ring-1 ring-green-100' // Green for Activate (current is Inactive)
                                                        }`}
                                                    title={org.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(org._id, org.name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete (Permanent)"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first organization'}
                        </p>
                        {!searchTerm && (
                            <Link
                                to="/superadmin/organizations/new"
                                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Organization</span>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
