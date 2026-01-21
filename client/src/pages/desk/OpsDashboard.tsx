import React, { useEffect, useState } from 'react';
import { School, Building2, BookOpen, GraduationCap, FileCheck, TrendingUp } from 'lucide-react';
import Workspace from '../../components/Workspace';
import CustomizationModal from '../../components/CustomizationModal';
import { toast } from 'react-toastify';

export default function OpsDashboard() {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);

    const deptId = localStorage.getItem('department_id');
    const orgId = localStorage.getItem('organization_id');

    useEffect(() => {
        const storedFeatures = localStorage.getItem('user_features');
        if (storedFeatures) {
            try {
                setFeatures(JSON.parse(storedFeatures));
            } catch (e) {
                console.error(e);
            }
        }

        async function fetchCounts() {
            try {
                const orgId = localStorage.getItem('organization_id');
                const deptId = localStorage.getItem('department_id');
                const userRole = localStorage.getItem('user_role');

                let baseUrl = `/api/resource`;
                let queryParams = `?organizationId=${orgId || ''}`;

                // Only apply department isolation for non-admins
                if (deptId && userRole !== 'SuperAdmin' && userRole !== 'OrganizationAdmin') {
                    queryParams += `&departmentId=${deptId}`;
                }

                const [resUni, resStd, resApp, resCen] = await Promise.all([
                    fetch(`${baseUrl}/university${queryParams}`),
                    fetch(`${baseUrl}/student${queryParams}`),
                    fetch(`${baseUrl}/application${queryParams}`),
                    fetch(`${baseUrl}/studycenter${queryParams}`)
                ]);
                const [jsonUni, jsonStd, jsonApp, jsonCen] = await Promise.all([
                    resUni.json(), resStd.json(), resApp.json(), resCen.json()
                ]);

                setCounts({
                    university: jsonUni.data?.length || 0,
                    student: jsonStd.data?.length || 0,
                    application: jsonApp.data?.length || 0,
                    studycenter: jsonCen.data?.length || 0
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCounts();
    }, []);

    const handleSaveFeatures = async (newFeatures: string[]) => {
        try {
            const res = await fetch(`/api/resource/department/${deptId}?organizationId=${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: newFeatures })
            });

            if (res.ok) {
                localStorage.setItem('user_features', JSON.stringify(newFeatures));
                setFeatures(newFeatures);
                setIsCustomizing(false);
                toast.success('Portal customized successfully! Reloading sidebar...');
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to update customization');
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <Workspace
                title="Operations Management Workspace"
                newHref="/application/new"
                onCustomize={() => setIsCustomizing(true)}
                summaryItems={[
                    { label: 'Active Applications', value: loading ? '...' : counts.application || 0, color: 'text-blue-600', doctype: 'application' },
                    { label: 'Total Students', value: loading ? '...' : counts.student || 0, color: 'text-emerald-600', doctype: 'student' },
                    { label: 'Partner Universities', value: loading ? '...' : counts.university || 0, color: 'text-orange-600', doctype: 'university' },
                ]}
                masterCards={[
                    { label: 'Universities', icon: School, count: counts.university || 0, href: '/university' },
                    { icon: Building2, label: 'Study Centers', count: counts.studycenter || 0, href: '/studycenter' },
                    { icon: BookOpen, label: 'Programs', count: '0', href: '/program' },
                    { icon: GraduationCap, label: 'Students', count: counts.student || 0, href: '/student' },
                    { icon: FileCheck, label: 'Applications', count: counts.application || 0, href: '/application' },
                ]}
                shortcuts={[
                    { label: 'New Application', href: '/application/new' },
                    { label: 'Add University', href: '/university/new' },
                ]}
            />

            <CustomizationModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentFeatures={features}
                onSave={handleSaveFeatures}
                title="Operations Portal Customization"
            />

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-[18px] font-bold text-[#1d2129] flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                <TrendingUp size={20} />
                            </div>
                            Admission Trends & Analytics
                        </h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center min-h-[400px] shadow-sm transform hover:scale-[1.01] transition-all group">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors mb-6">
                        <GraduationCap size={48} className="text-gray-200 group-hover:text-blue-200 transition-colors" />
                    </div>
                    <p className="text-xl font-black text-gray-300 group-hover:text-blue-400 transition-colors tracking-tight">Analytics Dashboard Coming Soon</p>
                    <p className="text-[14px] text-gray-200 mt-2 font-bold uppercase tracking-widest text-center max-w-sm">Integrating real-time visualization<br />for university enrollment metrics</p>
                </div>
            </div>
        </div>
    );
}
