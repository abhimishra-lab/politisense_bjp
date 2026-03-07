import React from 'react';
import { MapPin, RefreshCw, TrendingUp, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui';
import { Scope } from '../types';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi (NCT)", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

interface Props {
    scope: Scope;
    setScope: (s: Scope) => void;
    selectedState: string;
    setSelectedState: (s: string) => void;
    selectedDate: string;
    onDateChange: (d: string) => void;
    toDate: string;
    onToDateChange: (d: string) => void;
    isSingleDayToday: boolean;
    isLoading: boolean;
    loadingText: string;
    lastUpdated: string;
    onGenerate: () => void;
}

export default function Section1Input({
    scope, setScope, selectedState, setSelectedState,
    selectedDate, onDateChange, toDate, onToDateChange, isSingleDayToday,
    isLoading, loadingText, lastUpdated, onGenerate,
}: Props) {
    const todayStr = new Date().toISOString().split('T')[0];

    // Formatting dates for display
    const formatDate = (dateStr: string) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    const fromDateLabel = formatDate(selectedDate);
    const toDateLabel = formatDate(toDate);
    const isSingleDay = selectedDate === toDate;

    // Validation handler
    const handleFromDateChange = (val: string) => {
        onDateChange(val);
        // Auto-correct toDate if fromDate becomes later than toDate
        if (val > toDate) {
            onToDateChange(val);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Scope & State */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 text-[#1a2744]">
                    <MapPin className="w-4 h-4 text-[#FF9933]" />
                    <span className="text-sm font-bold uppercase tracking-wider">Coverage</span>
                </div>

                {/* Scope toggle */}
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {(['Nationwide', 'State Wise'] as Scope[]).map(s => (
                        <button
                            key={s}
                            onClick={() => setScope(s)}
                            className={cn(
                                'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all',
                                scope === s
                                    ? 'bg-[#FF9933] text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-600'
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* State selector */}
                <AnimatePresence>
                    {scope === 'State Wise' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <select
                                value={selectedState}
                                onChange={e => setSelectedState(e.target.value)}
                                className="w-full bg-[#1a2744] text-[#FF9933] border-2 border-[#FF9933]/40 px-4 py-3 text-sm font-semibold rounded-xl appearance-none focus:outline-none focus:border-[#FF9933] cursor-pointer"
                            >
                                <optgroup label="States">
                                    {INDIAN_STATES.slice(0, 28).map(s => <option key={s} value={s}>{s}</option>)}
                                </optgroup>
                                <optgroup label="Union Territories">
                                    {INDIAN_STATES.slice(28).map(s => <option key={s} value={s}>{s}</option>)}
                                </optgroup>
                            </select>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Date Range picker */}
                <div className="space-y-4 pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[#1a2744]">
                        <Calendar className="w-4 h-4 text-[#FF9933]" />
                        <span className="text-sm font-bold uppercase tracking-wider">Date Range</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">From Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                max={todayStr}
                                onChange={e => handleFromDateChange(e.target.value)}
                                className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1a2744] focus:outline-none focus:border-[#FF9933] cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                min={selectedDate} // Cannot go before From Date
                                max={todayStr}
                                onChange={e => onToDateChange(e.target.value)}
                                className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#1a2744] focus:outline-none focus:border-[#FF9933] cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Right: What You'll See Summary */}
            <div className="bg-[#1a2744] rounded-2xl border border-[#FF9933]/20 shadow-sm p-10 flex flex-col justify-center items-center text-center space-y-8">

                <div className="space-y-2">
                    <h3 className="text-white font-bold text-2xl tracking-tight">Generate Brief</h3>

                    <p className="text-white/70 text-[15px] font-medium max-w-[250px] mx-auto">
                        {isSingleDay
                            ? isSingleDayToday ? "Your daily political brief is ready." : `Brief for ${fromDateLabel} is ready.`
                            : `Briefs for ${fromDateLabel} – ${toDateLabel} are ready.`}
                    </p>
                </div>

                {/* Generate button */}
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className={cn(
                        'w-full max-w-[280px] py-4 rounded-xl font-bold text-[15px] tracking-wide transition-all flex items-center justify-center gap-2',
                        isLoading
                            ? 'bg-[#FF9933]/40 text-white/50 cursor-not-allowed'
                            : 'bg-[#FF9933] text-white hover:bg-[#e68a2e] shadow-lg hover:shadow-[#FF9933]/30'
                    )}
                >
                    {isLoading
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> {loadingText}</>
                        : "Generate Brief"
                    }
                </button>
            </div>
        </div>
    );
}
