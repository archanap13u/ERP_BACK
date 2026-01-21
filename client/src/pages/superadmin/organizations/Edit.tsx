import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Key, Eye, EyeOff, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

export default function EditOrganization() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // License Info for display
    const [activeLicenseName, setActiveLicenseName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        username: '',
        password: '',
        isActive: true,
        // Subscription fields
        plan: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
        subscriptionStatus: 'active' as 'active' | 'expired' | 'suspended' | 'trial',
        expiryDate: '',
        maxUsers: 0
    });

    const [planDefaults, setPlanDefaults] = useState<Record<string, { maxUsers: number, price: number, pricingModel: string }>>({
        free: { maxUsers: 5, price: 0, pricingModel: 'flat' },
        basic: { maxUsers: 10, price: 10, pricingModel: 'per_user' },
        premium: { maxUsers: 50, price: 50, pricingModel: 'per_user' },
        enterprise: { maxUsers: 100, price: 100, pricingModel: 'per_user' }
    });

    useEffect(() => {
        // Fetch defaults
        const fetchDefaults = async () => {
            try {
                const res = await fetch('/api/superadmin/licenses/defaults');
                const data = await res.json();
                if (data.success) {
                    setPlanDefaults(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch plan defaults:', err);
            }
        };
        fetchDefaults();

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

    const handlePlanChange = (newPlan: string) => {
        const defaults = planDefaults[newPlan];
        if (defaults) {
            setFormData(prev => ({
                ...prev,
                plan: newPlan as any,
                maxUsers: defaults.maxUsers
            }));
        }
    };

    const fetchOrganization = async () => {
        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`);
            const data = await response.json();

            if (data.success) {
                const org = data.data;
                setFormData({
                    name: org.name,
                    domain: org.domain || '',
                    username: org.username || '',
                    password: org.password || '',
                    isActive: org.isActive,
                    plan: org.subscription?.plan || 'free',
                    subscriptionStatus: org.subscription?.status || 'active',
                    expiryDate: org.subscription?.expiryDate ? new Date(org.subscription.expiryDate).toISOString().split('T')[0] : '',
                    maxUsers: org.subscription?.maxUsers || 0
                });

                if (org.subscription?.activeLicense) {
                    setActiveLicenseName(org.subscription.activeLicense.name);
                }
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

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const response = await fetch(`/api/superadmin/organizations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    domain: formData.domain || undefined,
                    username: formData.username,
                    password: formData.password,
                    isActive: formData.isActive,
                    subscription: {
                        plan: formData.plan,
                        status: formData.subscriptionStatus,
                        expiryDate: formData.expiryDate || null,
                        maxUsers: formData.maxUsers
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Organization updated successfully!');
                navigate(`/superadmin/organizations/${id}`);
            } else {
                setError(data.error || 'Failed to update organization');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error updating organization:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to={`/superadmin/organizations/${id}`}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Organization Details
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Organization</h1>
                <p className="text-gray-600">Update organization settings and configuration</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - General & Credentials */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                            General Details
                        </h2>

                        <div className="space-y-6">
                            {/* Organization Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Organization Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="e.g., Acme Corporation"
                                    required
                                />
                            </div>

                            {/* Domain */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Domain (Optional)
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={formData.domain}
                                        onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase() })}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        placeholder="acme"
                                    />
                                    <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                                        .yourplatform.com
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <Key className="w-5 h-5 mr-2 text-indigo-600" />
                            Credentials
                        </h2>

                        <div className="space-y-6">
                            {/* Username */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="e.g., acme_admin"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password *
                                </label>
                                <div className="flex items-center space-x-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            placeholder="Enter password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition whitespace-nowrap"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Subscription & Status */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                            Subscription Details
                        </h2>

                        <div className="space-y-6">
                            {/* License Info */}
                            {activeLicenseName ? (
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
                                    <p className="text-xs text-indigo-500 uppercase font-bold tracking-wide">Active License</p>
                                    <p className="text-lg font-semibold text-indigo-900">{activeLicenseName}</p>
                                    <p className="text-xs text-indigo-600 mt-1">
                                        Plan details are managed by this license.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg mb-4">
                                    <p className="text-sm text-gray-500">No license assigned. Go to <b>Licenses</b> page to assign one.</p>
                                </div>
                            )}

                            {/* Plan Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Subscription Plan
                                </label>
                                <div className="space-y-3">
                                    {[
                                        { value: 'free', label: 'Free', desc: 'Basic features' },
                                        { value: 'basic', label: 'Basic', desc: 'Standard features' }
                                    ].map((plan) => {
                                        const details = planDefaults[plan.value] || { maxUsers: 0, price: 0, pricingModel: 'flat' };
                                        return (
                                            <label
                                                key={plan.value}
                                                className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${formData.plan === plan.value
                                                    ? 'border-indigo-600 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="plan"
                                                    value={plan.value}
                                                    checked={formData.plan === plan.value}
                                                    onChange={(e) => handlePlanChange(e.target.value)}
                                                    className="sr-only"
                                                />
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-gray-900">{plan.label}</span>
                                                    <span className="text-sm font-bold text-indigo-600">
                                                        INR {details.price}
                                                        <span className="text-xs font-normal text-gray-500">
                                                            {details.pricingModel === 'per_user' ? '/user' : ' flat'}
                                                        </span>
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">{plan.desc}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status & Expiry Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subscription Status
                                    </label>
                                    <select
                                        value={formData.subscriptionStatus}
                                        onChange={(e) => setFormData({ ...formData, subscriptionStatus: e.target.value as any })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="trial">Trial</option>
                                        <option value="expired">Expired</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Expiry Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Allocated Seat Count (Users)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.maxUsers}
                                            onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Manual override for user limit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overall Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                            />
                            <div>
                                <span className="font-semibold text-gray-900">Organization Active</span>
                                <p className="text-sm text-gray-500">
                                    If unchecked, the organization is disabled and users cannot login.
                                    This is separate from subscription expiry.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <Link
                            to={`/superadmin/organizations/${id}`}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}
        </div>
    );
}
