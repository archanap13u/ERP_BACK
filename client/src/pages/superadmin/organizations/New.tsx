import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, Save, Eye, EyeOff, Key } from 'lucide-react';
import { toast } from 'react-toastify';

export default function NewOrganization() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        username: '',
        password: '',
        plan: 'free' as 'free' | 'basic' | 'premium' | 'enterprise',
        maxUsers: 5
    });

    const [planDefaults, setPlanDefaults] = useState<Record<string, { maxUsers: number, price: number, pricingModel: string }>>({
        free: { maxUsers: 5, price: 0, pricingModel: 'flat' },
        basic: { maxUsers: 10, price: 10, pricingModel: 'per_user' },
        premium: { maxUsers: 50, price: 50, pricingModel: 'per_user' },
        enterprise: { maxUsers: 100, price: 100, pricingModel: 'per_user' }
    });

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const res = await fetch('/api/superadmin/licenses/defaults');
                const data = await res.json();
                if (data.success) {
                    setPlanDefaults(data.data);
                    // Update current plan's limit immediately if it matches
                    const selectedPlan = formData.plan;
                    if (data.data[selectedPlan]) {
                        setFormData(prev => ({
                            ...prev,
                            maxUsers: data.data[selectedPlan].maxUsers
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch plan defaults:', err);
            }
        };
        fetchDefaults();
    }, []);

    // Auto-update maxUsers when plan changes
    useEffect(() => {
        if (planDefaults[formData.plan]) {
            setFormData(prev => ({
                ...prev,
                maxUsers: planDefaults[prev.plan].maxUsers
            }));
        }
    }, [formData.plan, planDefaults]);

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
        setLoading(true);

        try {
            const createdBy = localStorage.getItem('user_id');

            if (!createdBy) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            if (!formData.username || !formData.password) {
                setError('Username and password are required');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/superadmin/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    createdBy,
                    subscription: {
                        plan: formData.plan,
                        maxUsers: formData.maxUsers,
                        maxEmployees: formData.maxUsers,
                        startDate: new Date()
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Organization created successfully!');
                navigate('/superadmin/organizations');
            } else {
                setError(data.error || 'Failed to create organization');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error creating organization:', err);
        } finally {
            setLoading(false);
        }
    };

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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Organization</h1>
                <p className="text-gray-600">Set up a new organization in your platform</p>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            <p className="mt-1 text-xs text-gray-500">
                                The official name of the organization
                            </p>
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
                            <p className="mt-1 text-xs text-gray-500">
                                Custom subdomain for this organization (lowercase, no spaces)
                            </p>
                        </div>

                        {/* Credentials Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Key className="w-5 h-5 mr-2 text-indigo-600" />
                                Organization Login Credentials
                            </h3>

                            {/* Username */}
                            <div className="mb-4">
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
                                <p className="mt-1 text-xs text-gray-500">
                                    Login username for this organization (lowercase, no spaces)
                                </p>
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
                                <p className="mt-1 text-xs text-gray-500">
                                    Set a secure password for the organization admin
                                </p>
                            </div>
                        </div>

                        {/* Subscription Plan & Seats */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Subscription Plan *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
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
                                                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
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

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Allocated Seat Count (Users) *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.maxUsers}
                                    onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    placeholder="e.g. 10"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Total number of users (Employees + Students) allowed for this organization
                                </p>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Building2 className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Important</p>
                                    <p>
                                        Save the username and password securely. The organization admin will use these credentials to login to their dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <Link
                                to="/superadmin/organizations"
                                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                <span>{loading ? 'Creating...' : 'Create Organization'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
