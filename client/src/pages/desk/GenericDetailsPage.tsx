import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { fieldRegistry } from '../../config/fields';
import { toast } from 'react-toastify';

export default function GenericDetailsPage() {
    const { doctype, id } = useParams<{ doctype: string, id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState<{ [key: string]: string[] }>({});

    const fields = fieldRegistry[doctype as string] || [{ name: 'name', label: 'Name', type: 'text' }];
    const displayTitle = (doctype || '').replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

    useEffect(() => {
        const orgId = localStorage.getItem('organization_id');

        const fetchDynamicOptions = async () => {
            const options: { [key: string]: string[] } = {};
            for (const field of fields) {
                if (field.link && orgId) {
                    try {
                        const res = await fetch(`/api/resource/${field.link}?organizationId=${orgId}`);
                        const json = await res.json();
                        options[field.name] = (json.data || []).map((item: any) => item.name || item.employeeName || item.studentName || item.holidayName || item.universityName || item._id);
                    } catch (e) {
                        console.error(`Error fetching options for ${field.name}`, e);
                    }
                }
            }
            setDynamicOptions(options);
        };

        if (doctype && id) {
            fetchDynamicOptions();
            fetch(`/api/resource/${doctype}/${id}`)
                .then(res => res.json())
                .then(json => {
                    setFormData(json.data || {});
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching record:', err);
                    toast.error('Failed to load record');
                    setLoading(false);
                });
        }
    }, [doctype, id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/resource/${doctype}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success('Record updated successfully');
                navigate(`/${doctype}`);
            } else {
                const err = await res.json();
                toast.error(`Error: ${err.error || 'Failed to update'}`);
            }
        } catch (e) {
            toast.error('Failed to update record');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/resource/${doctype}/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Record deleted');
                navigate(`/${doctype}`);
            } else {
                toast.error('Failed to delete record');
            }
        } catch (e) {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[12px]">Retrieving Secure Record...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-in pb-20 px-4">
            <form onSubmit={handleSave}>
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-5">
                        <button type="button" onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all text-gray-500">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <p className="text-[11px] text-blue-600 font-bold uppercase tracking-[0.2em]">{displayTitle} Details</p>
                            <h2 className="text-[28px] font-black text-[#1d2129] tracking-tight">
                                {formData.name || formData.holidayName || formData.universityName || formData.centerName || formData.programName || formData.employeeName || formData.studentName || formData.student || formData.title || id}
                            </h2>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-3 text-red-500 hover:bg-red-50 hover:text-red-600 bg-white border border-transparent hover:border-red-100 rounded-2xl transition-all mr-2"
                            title="Delete Record"
                        >
                            <Trash2 size={24} />
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="bg-white border border-gray-200 px-6 py-3 rounded-2xl text-[14px] font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[14px] font-black hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Update Record'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/50 p-10 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {fields.map((field, idx) => (
                            <div key={idx} className="space-y-2 group">
                                <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 group-focus-within:text-blue-500 transition-colors">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-[14px] font-bold text-[#1d2129] focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none cursor-pointer"
                                        value={formData[field.name] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                        required={field.required}
                                    >
                                        <option value="">Select an option</option>
                                        {Array.from(new Set([
                                            ...(field.options || []),
                                            ...(dynamicOptions[field.name] || [])
                                        ])).map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'multi-select' ? (
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus-within:bg-white focus-within:border-blue-500/20 transition-all">
                                        {(field.options || []).map(opt => {
                                            const isActive = (formData[field.name] || []).includes(opt);
                                            return (
                                                <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={isActive}
                                                        onChange={(e) => {
                                                            const current = formData[field.name] || [];
                                                            const next = e.target.checked
                                                                ? [...current, opt]
                                                                : current.filter((i: string) => i !== opt);
                                                            setFormData({ ...formData, [field.name]: next });
                                                        }}
                                                    />
                                                    <span className="text-[13px] font-bold">{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : field.type === 'date' ? (
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-[14px] font-bold text-[#1d2129] focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                        value={formData[field.name]?.split('T')[0] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                        required={field.required}
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'number' ? 'number' : field.type}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-[14px] font-bold text-[#1d2129] focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                        value={formData[field.name] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-gray-50 flex items-center justify-between text-gray-400">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} />
                            <span className="text-[11px] font-bold uppercase tracking-tighter">Last Modified {formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : 'Just now'}</span>
                        </div>
                        <span className="text-[11px] font-black bg-gray-50 px-3 py-1 rounded-lg">ID: {id}</span>
                    </div>
                </div>
            </form>
        </div>
    );
}
