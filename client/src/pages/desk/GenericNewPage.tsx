import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { fieldRegistry } from '../../config/fields';
import { toast } from 'react-toastify';

export default function GenericNewPage() {
    const { doctype } = useParams<{ doctype: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [dynamicOptions, setDynamicOptions] = useState<{ [key: string]: string[] }>({});

    const fields = fieldRegistry[doctype as string] || [{ name: 'name', label: 'Name', type: 'text' }];
    const displayTitle = (doctype || '').replace(/([A-Z])/g, ' $1').trim();

    useEffect(() => {
        const orgId = localStorage.getItem('organization_id');
        if (!orgId) return;

        const fetchDynamicOptions = async () => {
            const options: { [key: string]: string[] } = {};
            for (const field of fields) {
                if (field.link) {
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

            const deptId = localStorage.getItem('department_id');
            const userRole = localStorage.getItem('user_role');

            setFormData((prev: any) => {
                const updated = { ...prev, organizationId: orgId };
                if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin') {
                    updated.departmentId = deptId;
                }
                return updated;
            });

            if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin') {
                try {
                    const res = await fetch(`/api/resource/department/${deptId}`);
                    const json = await res.json();
                    if (json.data?.name) {
                        setFormData((prev: any) => ({
                            ...prev,
                            department: json.data.name,
                            departmentId: deptId // Ensure both name and ID are set
                        }));
                    }
                } catch (e) {
                    console.error('Error pre-populating department name', e);
                }
            }
        };

        fetchDynamicOptions();
    }, [doctype]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/resource/${doctype}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(`${displayTitle} created successfully`);
                navigate(`/${doctype}`);
            } else {
                const err = await res.json();
                toast.error(`Error: ${err.error || 'Failed to save'}`);
            }
        } catch (e) {
            toast.error('Failed to save record');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in pb-20 px-4">
            <form onSubmit={handleSave}>
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-5">
                        <button type="button" onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all text-gray-500">
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <p className="text-[11px] text-blue-600 font-bold uppercase tracking-[0.2em]">New {displayTitle}</p>
                            <h2 className="text-[28px] font-black text-[#1d2129] tracking-tight">Draft Record</h2>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="bg-white border border-gray-200 px-6 py-3 rounded-2xl text-[14px] font-bold text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all">
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[14px] font-black hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                        >
                            <Save size={18} />
                            {saving ? 'Processing...' : 'Save Record'}
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
                                        value={formData[field.name] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                        required={field.required}
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-3.5 text-[14px] font-bold text-[#1d2129] focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
                                        value={formData[field.name] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-gray-50 flex items-start gap-3 text-orange-400 bg-orange-50/30 -mx-10 -mb-10 p-10 rounded-b-[2rem]">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[12px] font-bold leading-relaxed">
                                Please ensure all mandatory fields are filled correctly before saving.
                                The record will be instantly available in the system once submitted.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
