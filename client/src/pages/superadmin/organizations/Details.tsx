import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    Edit,
    Trash2,
    Users,
    Calendar,
    Globe,
    Shield,
    CheckCircle,
    XCircle,
    Crown,
    Key,
    Eye,
    EyeOff,
    Copy,
    CreditCard
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
        _id: string;
        employeeName: string;
        email: string;
        designation: string;
    };
    createdBy?: {
        fullName: string;
        email: string;
    };
    subscription: {
        plan: string;
        status?: string;
        activeLicense?: {
            name: string;
            type: string;
            price?: number;
        };
        startDate: string;
        expiryDate?: string;
        maxUsers?: number;
    };
    stats?: {
        totalUsers: number;
        employeeCount: number;
        studentCount: number;
    };
}

export default function OrganizationDetails() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check authentication
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }

        if (id) {
            fetchOrganization();
        }
    }, [navigate, id]);

    const fetchOrganization = async () => {
        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`);
            const data = await response.json();

            if (data.success) {
                setOrganization(data.data);
            } else {
                toast.error('Organization not found');
                navigate('/superadmin/organizations');
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            toast.error('Failed to load organization');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!organization) return;

        if (!window.confirm(`Are you sure you want to delete "${organization.name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                navigate('/superadmin/organizations');
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error deleting organization:', error);
            toast.error('Failed to delete organization');
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="p-8">
                <p>Organization not found</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/superadmin/organizations"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Organizations
                </Link>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                            <p className="text-gray-600">{organization.organizationId}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            to={`/superadmin/organizations/${id}/edit`}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Badge */}
            <div className="mb-6">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${organization.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                    }`}>
                    {organization.isActive ? (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Active
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Inactive
                        </>
                    )}
                </span>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Login Credentials */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Key className="w-5 h-5 mr-2 text-indigo-600" />
                            Login Credentials
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Username</p>
                                    <code className="text-lg font-mono font-semibold text-gray-900">
                                        {organization.username || '—'}
                                    </code>
                                </div>
                                {organization.username && (
                                    <button
                                        onClick={() => copyToClipboard(organization.username, 'Username')}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                                        title="Copy username"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Password</p>
                                        <code className="text-lg font-mono font-semibold text-gray-900">
                                            {showPassword ? (organization.password || '—') : '••••••••••••'}
                                        </code>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        {organization.password && (
                                            <button
                                                onClick={() => copyToClipboard(organization.password, 'Password')}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                                                title="Copy password"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Building2 className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Organization Name</p>
                                    <p className="text-base font-semibold text-gray-900">{organization.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Shield className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Organization ID</p>
                                    <p className="text-base font-mono text-gray-900">{organization.organizationId}</p>
                                </div>
                            </div>

                            {organization.domain && (
                                <div className="flex items-start">
                                    <Globe className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Domain</p>
                                        <p className="text-base text-indigo-600">{organization.domain}.yourplatform.com</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Created On</p>
                                    <p className="text-base text-gray-900">
                                        {new Date(organization.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Admin</h2>
                        {organization.adminId ? (
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{organization.adminId.employeeName}</p>
                                    <p className="text-sm text-gray-600">{organization.adminId.designation}</p>
                                    <p className="text-sm text-gray-500">{organization.adminId.email}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-gray-500">No admin assigned</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Stats */}
                <div className="space-y-6">
                    {/* Subscription & License */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                            License
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${organization.subscription?.status === 'active' ? 'bg-green-100 text-green-700' :
                                    organization.subscription?.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                                        organization.subscription?.status === 'expired' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {organization.subscription?.status || 'Active'}
                                </span>
                            </div>

                            {organization.subscription?.activeLicense?.price !== undefined && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Subscription Amount</p>
                                    <p className="text-gray-900 font-semibold">
                                        INR {organization.subscription.activeLicense.price.toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm text-gray-500 mb-1">User Limit</p>
                                <div className="flex items-center space-x-2">
                                    <span className={`font-semibold ${(organization.stats?.totalUsers || 0) >= (organization.subscription?.maxUsers || 0)
                                        ? 'text-red-600'
                                        : 'text-gray-900'
                                        }`}>
                                        {organization.stats?.totalUsers || 0}
                                    </span>
                                    <span className="text-gray-400">/</span>
                                    <span className="font-semibold text-gray-900">
                                        {organization.subscription?.maxUsers || 0}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">users used</span>
                                </div>
                            </div>

                            {organization.subscription?.activeLicense ? (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Active License</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-semibold text-gray-900">
                                            {organization.subscription.activeLicense.name}
                                        </p>
                                        <Link
                                            to="/superadmin/licenses"
                                            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                                        >
                                            Manage
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">License</p>
                                    <p className="text-sm text-gray-400 italic">No license assigned</p>
                                    <Link
                                        to="/superadmin/licenses"
                                        className="text-xs text-indigo-600 hover:text-indigo-800 underline block mt-1"
                                    >
                                        Assign License
                                    </Link>
                                </div>
                            )}

                            {organization.subscription?.expiryDate && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(organization.subscription.expiryDate).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Created By */}
                    {organization.createdBy && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Created By</h2>
                            <div>
                                <p className="font-semibold text-gray-900">{organization.createdBy.fullName}</p>
                                <p className="text-sm text-gray-500">{organization.createdBy.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
