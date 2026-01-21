import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Phone, Briefcase } from 'lucide-react';
import Workspace from '../../components/Workspace';
import CustomizationModal from '../../components/CustomizationModal';
import { toast } from 'react-toastify';

export default function CRMWorkspace() {
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
                const res = await fetch(`/api/resource/lead?organizationId=${orgId || ''}`);
                const json = await res.json();
                setCounts({ lead: json.data?.length || 0 });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCounts();
    }, [orgId]);

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
                toast.success('Portal customized successfully!');
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
                title="CRM Workspace"
                newHref="/lead/new"
                onCustomize={() => setIsCustomizing(true)}
                summaryItems={[
                    { label: 'Total Leads', value: loading ? '...' : counts.lead || 0, color: 'text-orange-600', doctype: 'lead' },
                    { label: 'Opportunities', value: '0', color: 'text-blue-600', doctype: 'opportunity' },
                    { label: 'Customers', value: '...', color: 'text-emerald-600', doctype: 'customer' },
                ]}
                masterCards={[
                    { label: 'Lead', icon: UserPlus, count: counts.lead || 0, href: '/lead' },
                    { label: 'Customer', icon: Users, count: '...', href: '/customer' },
                    { label: 'Opportunity', icon: Briefcase, count: '0', href: '/opportunity' },
                    { label: 'Appointment', icon: Phone, count: '0', href: '/appointment' },
                ]}
                shortcuts={[
                    { label: 'Lead List', href: '/lead' },
                    { label: 'Customer Group', href: '/customer' },
                    { label: 'Address List', href: '/customer' },
                ]}
                onboardingSteps={[
                    { title: 'Create Leads', description: 'Begin tracking potential customers.', completed: true },
                    { title: 'Set up CRM settings', description: 'Configure lead sources and stages.', completed: false },
                ]}
            />

            <CustomizationModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentFeatures={features}
                onSave={handleSaveFeatures}
                title="CRM Portal Customization"
            />
        </div>
    );
}
