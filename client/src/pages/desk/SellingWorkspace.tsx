import React, { useEffect, useState } from 'react';
import { ShoppingCart, FilePlus, BadgeDollarSign, Users } from 'lucide-react';
import Workspace from '../../components/Workspace';
import CustomizationModal from '../../components/CustomizationModal';
import { toast } from 'react-toastify';

export default function SellingWorkspace() {
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
                const res = await fetch(`/api/resource/salesorder?organizationId=${orgId || ''}`);
                const json = await res.json();
                setCounts({ salesorder: json.data?.length || 0 });
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
                title="Selling Workspace"
                newHref="/salesorder/new"
                onCustomize={() => setIsCustomizing(true)}
                summaryItems={[
                    { label: 'Sales Orders', value: loading ? '...' : counts.salesorder || 0, color: 'text-blue-600', doctype: 'salesorder' },
                    { label: 'Quotations', value: '0', color: 'text-orange-600', doctype: 'quotation' },
                    { label: 'Sales Invoices', value: '0', color: 'text-emerald-600', doctype: 'salesinvoice' },
                ]}
                masterCards={[
                    { label: 'Sales Order', icon: ShoppingCart, count: counts.salesorder || 0, href: '/salesorder' },
                    { label: 'Quotation', icon: FilePlus, count: '0', href: '/quotation' },
                    { label: 'Sales Invoice', icon: BadgeDollarSign, count: '0', href: '/salesinvoice' },
                    { label: 'Customer', icon: Users, count: '...', href: '/customer' },
                ]}
                shortcuts={[
                    { label: 'Quotation List', href: '/quotation' },
                    { label: 'Sales Order List', href: '/salesorder' },
                    { label: 'Product Prices', href: '/item' },
                ]}
            />

            <CustomizationModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentFeatures={features}
                onSave={handleSaveFeatures}
                title="Selling Portal Customization"
            />
        </div>
    );
}
