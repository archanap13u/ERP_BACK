import React, { useState, useEffect } from 'react';
import { Landmark, Receipt, CreditCard, PieChart } from 'lucide-react';
import Workspace from '../../components/Workspace';
import CustomizationModal from '../../components/CustomizationModal';
import { toast } from 'react-toastify';

export default function AccountingWorkspace() {
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
                title="Accounting Workspace"
                newHref="/salesinvoice/new"
                onCustomize={() => setIsCustomizing(true)}
                summaryItems={[
                    { label: 'Bank Balance', value: '$0.00', color: 'text-blue-600', doctype: 'paymententry' },
                    { label: 'Orders to Bill', value: '0', color: 'text-orange-600', doctype: 'salesorder' },
                    { label: 'Pending Payments', value: '0', color: 'text-red-600', doctype: 'purchaseinvoice' },
                ]}
                masterCards={[
                    { label: 'Account', icon: Landmark, count: '0', href: '/account' },
                    { label: 'Sales Invoice', icon: Receipt, count: '0', href: '/salesinvoice' },
                    { label: 'Payment Entry', icon: CreditCard, count: '0', href: '/paymententry' },
                    { label: 'Cost Center', icon: PieChart, count: '0', href: '/costcenter' },
                ]}
                shortcuts={[
                    { label: 'General Ledger', href: '/accounting' },
                    { label: 'Accounts Payable', href: '/accounting' },
                    { label: 'Accounts Receivable', href: '/accounting' },
                ]}
            />

            <CustomizationModal
                isOpen={isCustomizing}
                onClose={() => setIsCustomizing(false)}
                currentFeatures={features}
                onSave={handleSaveFeatures}
                title="Accounting Portal Customization"
            />
        </div>
    );
}
