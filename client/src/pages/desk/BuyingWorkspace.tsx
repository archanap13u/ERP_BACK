import React, { useEffect, useState } from 'react';
import { ShoppingBag, FilePlus, UserSquare, FileText } from 'lucide-react';
import Workspace from '../../components/Workspace';
import CustomizationModal from '../../components/CustomizationModal';
import { toast } from 'react-toastify';

export default function BuyingWorkspace() {
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
                const res = await fetch(`/api/resource/supplier?organizationId=${orgId || ''}`);
                const json = await res.json();
                setCounts({ supplier: json.data?.length || 0 });
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
                title="Buying Workspace"
                newHref="/supplier/new"
                onCustomize={() => setIsCustomizing(true)}
                summaryItems={[
                    { label: 'Purchase Orders', value: '0', color: 'text-blue-600', doctype: 'purchaseorder' },
                    { label: 'Suppliers', value: loading ? '...' : counts.supplier || 0, color: 'text-orange-600', doctype: 'supplier' },
                    { label: 'Purchase Invoices', value: '0', color: 'text-emerald-600', doctype: 'purchaseinvoice' },
                ]}
                masterCards={[
                    { label: 'Supplier', icon: UserSquare, count: counts.supplier || 0, href: '/supplier' },
                    { label: 'Purchase Order', icon: ShoppingBag, count: '0', href: '/purchaseorder' },
                    { label: 'Supplier Quotation', icon: FilePlus, count: '0', href: '/supplierquotation' },
                    { label: 'Purchase Invoice', icon: FileText, count: '0', href: '/purchaseinvoice' },
                ]}
                shortcuts={[
                    { label: 'Purchase Order List', href: '/purchaseorder' },
                    { label: 'Supplier Group', href: '/supplier' },
                    { label: 'Request for Quotation', href: '/purchaseorder' },
                ]}
            />

            <CustomizationModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentFeatures={features}
                onSave={handleSaveFeatures}
                title="Buying Portal Customization"
            />
        </div>
    );
}
