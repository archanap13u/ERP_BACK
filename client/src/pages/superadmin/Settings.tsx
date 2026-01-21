import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Shield,
    Mail,
    Sliders,
    Save,
    AlertTriangle,
    CheckCircle,
    RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';

interface PlatformSettings {
    _id: string;
    platformName: string;
    defaultSubscriptionPlan: 'free' | 'basic' | 'premium' | 'enterprise';
    maintenanceMode: boolean;
    maintenanceMessage: string;
    security: {
        sessionTimeout: number;
        maxLoginAttempts: number;
        passwordMinLength: number;
        requireSpecialCharacters: boolean;
        requireNumbers: boolean;
    };
    email: {
        senderName: string;
        senderEmail: string;
        enableNotifications: boolean;
    };
    features: {
        allowSelfRegistration: boolean;
        requireEmailVerification: boolean;
        enableStudentPortal: boolean;
        enableEmployeePortal: boolean;
    };
    updatedAt: string;
}

export default function PlatformSettings() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'email' | 'features'>('general');

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'SuperAdmin') {
            navigate('/login');
            return;
        }
        fetchSettings();
    }, [navigate]);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/superadmin/settings');
            const result = await response.json();
            if (result.success) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        try {
            const response = await fetch('/api/superadmin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Settings saved successfully!');
                setSettings(result.data);
            } else {
                toast.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            toast.error('An error occurred while saving');
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (path: string, value: any) => {
        if (!settings) return;

        const keys = path.split('.');
        const newSettings = { ...settings };
        let current: any = newSettings;

        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setSettings(newSettings);
    };

    const tabs = [
        { id: 'general' as const, label: 'General', icon: Sliders },
        { id: 'security' as const, label: 'Security', icon: Shield },
        { id: 'email' as const, label: 'Email', icon: Mail },
        { id: 'features' as const, label: 'Features', icon: Settings }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                    <p className="text-gray-600">Configure platform-wide settings and preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50"
                >
                    {saving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-4 font-semibold transition border-b-2 -mb-px ${activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {/* General Settings */}
                {activeTab === 'general' && settings && (
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Platform Name
                            </label>
                            <input
                                type="text"
                                value={settings.platformName}
                                onChange={(e) => updateSetting('platformName', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Default Subscription Plan
                            </label>
                            <select
                                value={settings.defaultSubscriptionPlan}
                                onChange={(e) => updateSetting('defaultSubscriptionPlan', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="free">Free</option>
                                <option value="basic">Basic</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">Maintenance Mode</h3>
                                    <p className="text-sm text-gray-500">Disable user access during maintenance</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                                </label>
                            </div>

                            {settings.maintenanceMode && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 animate-in slide-in-from-top-2">
                                    <div className="flex items-start space-x-4">
                                        <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm text-yellow-800 font-bold mb-3">
                                                Maintenance Mode is enabled
                                            </p>
                                            <label className="block text-sm text-yellow-700 font-semibold mb-2">
                                                Maintenance Message:
                                            </label>
                                            <textarea
                                                value={settings.maintenanceMessage}
                                                onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                                                rows={3}
                                                className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none text-sm bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && settings && (
                    <div className="space-y-8 max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="1440"
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Max Login Attempts
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={settings.security.maxLoginAttempts}
                                    onChange={(e) => updateSetting('security.maxLoginAttempts', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Min Password Length
                                </label>
                                <input
                                    type="number"
                                    min="6"
                                    max="24"
                                    value={settings.security.passwordMinLength}
                                    onChange={(e) => updateSetting('security.passwordMinLength', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-8 space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Password Requirements</h3>

                            <label className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={settings.security.requireSpecialCharacters}
                                    onChange={(e) => updateSetting('security.requireSpecialCharacters', e.target.checked)}
                                    className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition"
                                />
                                <span className="text-gray-700 font-medium">Require special characters (!, @, #, $, etc.)</span>
                            </label>

                            <label className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                                <input
                                    type="checkbox"
                                    checked={settings.security.requireNumbers}
                                    onChange={(e) => updateSetting('security.requireNumbers', e.target.checked)}
                                    className="w-6 h-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition"
                                />
                                <span className="text-gray-700 font-medium">Require numbers</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Email Settings */}
                {activeTab === 'email' && settings && (
                    <div className="space-y-8 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sender Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.email.senderName}
                                    onChange={(e) => updateSetting('email.senderName', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sender Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.email.senderEmail}
                                    onChange={(e) => updateSetting('email.senderEmail', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-8">
                            <label className="flex items-center justify-between p-6 bg-gray-50 rounded-xl cursor-pointer">
                                <div>
                                    <h3 className="font-bold text-gray-900">Email Notifications</h3>
                                    <p className="text-sm text-gray-600">Send system notification emails to users</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.email.enableNotifications}
                                        onChange={(e) => updateSetting('email.enableNotifications', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                                </label>
                            </label>
                        </div>
                    </div>
                )}

                {/* Features Settings */}
                {activeTab === 'features' && settings && (
                    <div className="space-y-4 max-w-2xl">
                        {[
                            { path: 'features.allowSelfRegistration', title: 'Allow Self Registration', desc: 'Allow organizations to self-register on the platform' },
                            { path: 'features.requireEmailVerification', title: 'Require Email Verification', desc: 'Users must verify their email before accessing the system' },
                            { path: 'features.enableStudentPortal', title: 'Enable Student Portal', desc: 'Allow students to login and access their portal' },
                            { path: 'features.enableEmployeePortal', title: 'Enable Employee Portal', desc: 'Allow employees to login and access their portal' }
                        ].map((item) => (
                            <label key={item.path} className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-sm text-gray-600">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={item.path.split('.').reduce((obj, key) => obj[key], settings as any)}
                                        onChange={(e) => updateSetting(item.path, e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                                </label>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Last Updated */}
            {settings?.updatedAt && (
                <p className="text-sm text-gray-500 mt-6 text-right">
                    Last updated on {new Date(settings.updatedAt).toLocaleString()}
                </p>
            )}
        </div>
    );
}
