import React, { useState } from 'react';
import { BriefingOutput } from '../types';
import { X, Eye, FileText, MapPin, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export type AttentionLevel = 'Low Attention' | 'Medium Attention' | 'High Attention';

export interface BriefingRecord {
    id: string;
    generatedAt: string;
    scope: string;
    state?: string;
    sentimentPos: number;
    sentimentNeu: number;
    sentimentNeg: number;
    attentionLevel: AttentionLevel;
    briefingMarkdown: string;
    rawOutput: BriefingOutput;
}

interface Props {
    records: BriefingRecord[];
}

function deriveAttention(neg: number): AttentionLevel {
    if (neg >= 40) return 'High Attention';
    if (neg >= 25) return 'Medium Attention';
    return 'Low Attention';
}

function deriveTone(pos: number, neg: number): string {
    if (neg >= 40) return 'Under Pressure';
    if (pos >= 40 && pos > neg) return 'Mostly Positive';
    return 'Balanced';
}

export function makeBriefingRecord(output: BriefingOutput): BriefingRecord {
    const neg = output.sentimentSummary.percentages.negative;
    return {
        id: `br-${Date.now()}`,
        generatedAt: output.generatedAt,
        scope: output.scope,
        state: output.state,
        sentimentPos: output.sentimentSummary.percentages.positive,
        sentimentNeu: output.sentimentSummary.percentages.neutral,
        sentimentNeg: neg,
        attentionLevel: deriveAttention(neg),
        briefingMarkdown: output.briefingMarkdown,
        rawOutput: output,
    };
}

const ATTENTION_COLORS: Record<AttentionLevel, string> = {
    'Low Attention': 'bg-gray-50 text-gray-600 border border-gray-200',
    'Medium Attention': 'bg-amber-50 text-amber-700 border border-amber-200',
    'High Attention': 'bg-red-50 text-red-700 border border-red-200',
};

const TONE_COLORS: Record<string, string> = {
    'Mostly Positive': 'text-green-600',
    'Balanced': 'text-gray-600',
    'Under Pressure': 'text-red-600',
};

function formatFriendlyDate(iso: string) {
    const d = new Date(iso);
    // Format: "21 Feb 2026, 10:42 AM"
    const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const datePart = d.toLocaleDateString('en-IN', optionsDate);
    const timePart = d.toLocaleTimeString('en-IN', optionsTime);
    return `${datePart}, ${timePart.toUpperCase()}`;
}

export default function HistoryBriefings({ records }: Props) {
    const [viewing, setViewing] = useState<BriefingRecord | null>(null);

    if (records.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-5">
                    <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-[#1a2744] mb-2">No Briefings Yet</h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                    Generate your first intelligence briefing from the Dashboard. It will appear here automatically for quick reference.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header row */}
            <div className="hidden md:grid grid-cols-[1.5fr_160px_140px_140px_160px_120px] gap-4 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                <span>Brief Type</span>
                <span>Date & Time</span>
                <span>Coverage Tag</span>
                <span>Overall Tone</span>
                <span>Attention Level</span>
                <span className="text-right">Action</span>
            </div>

            {[...records].reverse().map(rec => {
                const tone = deriveTone(rec.sentimentPos, rec.sentimentNeg);

                return (
                    <div key={rec.id}
                        className="bg-white border border-gray-100 rounded-xl px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                        <div className="flex flex-col md:grid md:grid-cols-[1.5fr_160px_140px_140px_160px_120px] gap-3 md:gap-4 items-start md:items-center">

                            {/* Brief Type */}
                            <div className="font-semibold text-[#1a2744] text-[15px]">
                                {rec.state ? `State Brief – ${rec.state}` : 'Nationwide Brief'}
                            </div>

                            {/* Date & Time */}
                            <div className="text-sm text-gray-500 font-medium">
                                {formatFriendlyDate(rec.generatedAt)}
                            </div>

                            {/* Coverage Tag */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 w-fit">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <span className="font-semibold">
                                    {rec.scope === 'State Wise' && rec.state ? `State: ${rec.state}` : 'Nationwide'}
                                </span>
                            </div>

                            {/* Overall Tone */}
                            <div className={`text-sm font-bold ${TONE_COLORS[tone] || 'text-gray-600'}`}>
                                {tone}
                            </div>

                            {/* Attention Level */}
                            <div>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md ${ATTENTION_COLORS[rec.attentionLevel]}`}>
                                    <AlertCircle className="w-3.5 h-3.5 opacity-70" />
                                    {rec.attentionLevel}
                                </span>
                            </div>

                            {/* Action Button */}
                            <div className="md:flex md:justify-end w-full mt-2 md:mt-0">
                                <button
                                    onClick={() => setViewing(rec)}
                                    className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#FF9933] hover:text-[#e68a2e] hover:bg-[#FF9933]/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-[#FF9933]/20 w-full md:w-auto"
                                >
                                    <Eye className="w-4 h-4" /> View Brief
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Read-only Briefing Modal */}
            {viewing && (
                <div className="fixed inset-0 bg-[#1a2744]/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl my-8 border border-gray-100">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-bold text-[#1a2744]">
                                    {viewing.state ? `State Brief – ${viewing.state}` : 'Nationwide Brief'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 font-medium">{formatFriendlyDate(viewing.generatedAt)}</p>
                            </div>
                            <button
                                onClick={() => setViewing(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors bg-white hover:bg-gray-100 rounded-lg p-2 border border-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Briefing content */}
                        <div className="px-8 py-8 prose prose-slate prose-sm max-w-none
                            prose-headings:text-[#1a2744] prose-headings:font-bold
                            prose-p:text-gray-600 prose-p:leading-relaxed
                            prose-li:text-gray-600
                            prose-strong:text-[#1a2744]
                            prose-hr:border-gray-100
                            prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                        ">
                            <ReactMarkdown>{viewing.briefingMarkdown}</ReactMarkdown>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end">
                            <button
                                onClick={() => setViewing(null)}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Close document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
