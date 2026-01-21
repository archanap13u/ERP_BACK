import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus, LucideIcon } from 'lucide-react';

interface SummaryItem {
    label: string;
    value: string | number;
    color: string;
    doctype: string;
}

interface MasterCard {
    label: string;
    icon: LucideIcon;
    count: string | number;
    href: string;
}

interface WorkspaceProps {
    title: string;
    summaryItems: SummaryItem[];
    masterCards: MasterCard[];
    shortcuts: { label: string; href: string }[];
    onboardingSteps?: { title: string; description: string; completed?: boolean }[];
    newHref?: string;
    onCustomize?: () => void;
}

export default function Workspace({ title, summaryItems, masterCards, shortcuts, onboardingSteps, newHref, onCustomize }: WorkspaceProps) {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in pt-4 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-bold text-[#1d2129]">{title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={onCustomize}
                        className="bg-white border border-[#d1d8dd] px-3 py-1.5 rounded text-[13px] font-semibold text-[#1d2129] hover:bg-gray-50 flex items-center gap-2"
                    >
                        Customize
                    </button>
                    {newHref ? (
                        <Link to={newHref} className="bg-blue-600 text-white px-3 py-1.5 rounded text-[13px] font-semibold hover:bg-blue-700 flex items-center gap-2 no-underline shadow-sm">
                            <Plus size={14} />
                            Create New
                        </Link>
                    ) : (
                        <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-[13px] font-semibold hover:bg-blue-700 flex items-center gap-2 no-underline shadow-sm">
                            <Plus size={14} />
                            Create New
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryItems.map((item, i) => (
                    <Link key={i} to={`/${item.doctype}`} className="p-6 rounded-xl border border-[#d1d8dd] flex flex-col gap-1 bg-white hover:border-blue-400 hover:shadow-md transition-all no-underline group">
                        <span className={`text-[28px] font-bold ${item.color} group-hover:scale-105 transition-transform origin-left`}>
                            {item.value}
                        </span>
                        <span className="text-[14px] font-medium text-[#626161]">{item.label}</span>
                    </Link>
                ))}
            </div>

            <div>
                <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 uppercase tracking-wider">Masters</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {masterCards.map((card, i) => (
                        <Link key={i} to={card.href} className="p-4 rounded-xl border border-[#d1d8dd] flex items-center justify-between group cursor-pointer hover:border-blue-400 hover:shadow-md transition-all bg-white no-underline">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                    <card.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-[14px] font-bold text-[#1d2129]">{card.label}</p>
                                    <p className="text-[11px] font-bold text-[#8d99a6] uppercase tracking-tighter">
                                        {card.count} records
                                    </p>
                                </div>
                            </div>
                            <ArrowRight size={16} className="text-[#d1d8dd] group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-xl border border-[#d1d8dd] bg-white shadow-sm">
                    <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                        Your Shortcuts
                    </h3>
                    <div className="space-y-4">
                        {shortcuts.map(link => (
                            <Link key={link.label} to={link.href} className="flex items-center justify-between text-[14px] text-[#626161] hover:text-blue-600 font-medium cursor-pointer group pb-3 border-b border-gray-50 last:border-0 last:pb-0 no-underline transition-colors">
                                <span>{link.label}</span>
                                <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                            </Link>
                        ))}
                    </div>
                </div>

                {onboardingSteps && (
                    <div className="p-6 rounded-xl border border-[#d1d8dd] bg-white shadow-sm">
                        <h3 className="text-[16px] font-bold text-[#1d2129] mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                            Onboarding Progress
                        </h3>
                        <div className="space-y-4">
                            {onboardingSteps.map((step, idx) => (
                                <div key={idx} className={`flex gap-4 ${step.completed ? '' : 'opacity-60'}`}>
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[14px] font-bold shadow-sm ${step.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-bold text-[#1d2129]">{step.title}</p>
                                        <p className="text-[12px] text-[#8d99a6] font-medium">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
