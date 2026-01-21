import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard,
    Plus,
    Search,
    Trash2,
    Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

interface License {
    _id: string;
    name: string;
    type: string;
    duration: number;
    maxUsers: number;
    pricingModel: 'flat' | 'per_user';
    price: number | string;
    status: 'available' | 'assigned' | 'expired' | 'revoked';
    assignedTo?: {
        _id: string;
        name: string;
        organizationId: string;
    };
    assignedDate?: string;
    createdAt: string;
}

export default function LicenseList() {
    const navigate = useNavigate();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form States
    const [createForm, setCreateForm] = useState({
        name: '',
        type: 'basic',
        duration: 365,
        pricingModel: 'flat',
        price: '0'
    });

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }

        fetchLicenses();
    }, [navigate]);

    const fetchLicenses = async () => {
        try {
            const response = await fetch('/api/superadmin/licenses');
            const data = await response.json();
            if (data.success) {
                setLicenses(data.data);
            }
        } catch (error) {
            console.error('Error fetching licenses:', error);
            toast.error('Failed to load licenses');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createdBy = localStorage.getItem('user_id');
            const response = await fetch('/api/superadmin/licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...createForm,
                    price: parseFloat(createForm.price) || 0,
                    pricingModel: createForm.pricingModel,
                    createdBy
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('License created successfully');
                setIsCreateModalOpen(false);
                fetchLicenses();
                // Reset form
                setCreateForm({ name: '', type: 'basic', duration: 365, pricingModel: 'flat', price: '0' });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Failed to create license');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this license?')) return;
        try {
            const response = await fetch(`/api/superadmin/licenses/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success('License deleted successfully');
                fetchLicenses();
            } else {
                toast.error('Failed to delete license');
            }
        } catch (error) {
            console.error('Error deleting license:', error);
            toast.error('Error deleting license');
        }
    };

    const filteredLicenses = licenses.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.assignedTo?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Licenses</h1>
                    <p className="text-gray-600">Manage and assign subscription licenses</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create License</span>
                </button>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search licenses..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">License Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLicenses.map((license) => (
                                <tr key={license._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{license.name}</td>
                                    <td className="px-6 py-4 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${license.type === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                            license.type === 'premium' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {license.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{license.duration} days</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${license.status === 'available' ? 'bg-green-100 text-green-800' :
                                            license.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {license.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {license.price === 0 ? 'Free' : (
                                            <span>
                                                INR {license.price}
                                                <span className="text-xs text-gray-400 ml-1">
                                                    ({license.pricingModel === 'per_user' ? 'Per User' : 'Flat'})
                                                </span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleDelete(license._id)}
                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredLicenses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <CreditCard className="w-12 h-12 text-gray-300 mb-2" />
                                            <p>No licenses found. Create one to get started.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create License Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 transform transition-all animate-in fade-in zoom-in-95">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New License</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">License Name</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.name}
                                    onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g. Standard Yearly"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Type</label>
                                <select
                                    value={createForm.type}
                                    onChange={e => setCreateForm({ ...createForm, type: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                >
                                    <option value="free">Free</option>
                                    <option value="basic">Basic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (Days)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={createForm.duration}
                                    onChange={e => setCreateForm({ ...createForm, duration: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Pricing Model</label>
                                <select
                                    value={createForm.pricingModel}
                                    onChange={e => setCreateForm({ ...createForm, pricingModel: e.target.value as any })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                >
                                    <option value="flat">Flat Rate</option>
                                    <option value="per_user">Amount Per User</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Price (INR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={createForm.price}
                                    onChange={e => setCreateForm({ ...createForm, price: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition"
                                >
                                    Create License
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
