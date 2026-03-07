import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// ─── cn utility ───────────────────────────────────────────────────────────────
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export interface ToastMessage {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={cn(
                        'toast-enter flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold pointer-events-auto max-w-sm',
                        t.type === 'success' && 'bg-green-600 text-white',
                        t.type === 'error' && 'bg-red-600 text-white',
                        t.type === 'info' && 'bg-[#1a2744] text-white',
                    )}
                >
                    {t.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                    {t.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                    {t.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
                    <span className="flex-1">{t.message}</span>
                    <button onClick={() => onRemove(t.id)} className="opacity-70 hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('skeleton', className)} />;
}

export function NewsSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                </div>
            ))}
        </div>
    );
}

export function BriefingSkeleton() {
    return (
        <div className="space-y-4 p-6">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-6 w-1/4 mt-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    );
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────
export function SectionCard({ title, icon, badge, children, className }: {
    title: string; icon?: React.ReactNode; badge?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', className)}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                    {icon && <span className="text-[#FF9933]">{icon}</span>}
                    <h2 className="text-base font-bold text-[#1a2744]">{title}</h2>
                </div>
                {badge}
            </div>
            {children}
        </div>
    );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────
export function ScoreBar({ score, max = 9 }: { score: number; max?: number }) {
    const pct = Math.round((score / max) * 100);
    const color = pct >= 70 ? '#22C55E' : pct >= 40 ? '#F59E0B' : '#EF4444';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full score-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-bold w-6 text-right" style={{ color }}>{score}</span>
        </div>
    );
}

// ─── Header ──────────────────────────────────────────────────────────────────
export function Header({ activeTab, onTabChange, currentUser, onLogout }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    currentUser?: { name: string; email: string; role: string } | null;
    onLogout?: () => void;
}) {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'history', label: 'Past Briefs' },
    ];
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-0 flex items-center justify-between h-16">
                <button onClick={() => onTabChange('dashboard')} className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 bg-white rounded-full border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                            src="/bjp-logo.png"
                            alt="BJP Logo"
                            className="h-8 w-8 object-contain"
                        />
                    </div>
                    <div>
                        <div className="text-base font-black text-[#1a2744] leading-none tracking-tight">PolitiSense</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#FF9933] leading-none mt-0.5">Intelligence Unit</div>
                    </div>
                </button>
                <nav className="hidden md:flex items-center gap-1">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => onTabChange(t.id)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                                activeTab === t.id
                                    ? 'bg-[#FF9933]/10 text-[#FF9933]'
                                    : 'text-gray-500 hover:text-[#1a2744] hover:bg-gray-50'
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                        System Active
                    </div>
                    {currentUser && onLogout && (
                        <div className="flex items-center gap-2 border-l border-gray-100 pl-3 ml-1">
                            <div className="text-right hidden sm:block">
                                <div className="text-xs font-bold text-[#1a2744] leading-none">{currentUser.name}</div>
                                <div className="text-[10px] text-gray-400 leading-none mt-0.5 capitalize">{currentUser.role}</div>
                            </div>
                            <button
                                onClick={onLogout}
                                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

