import React, { useState } from 'react';
import { Edit2, Copy, Save, X, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { BriefingSkeleton } from './ui';
import { BriefingOutput } from '../types';

interface Props {
    briefing: BriefingOutput | null;
    isLoading: boolean;
    editedMarkdown: string | null;
    setEditedMarkdown: (v: string | null) => void;
    onCopy: () => void;
}

export default function Section3Brief({ briefing, isLoading, editedMarkdown, setEditedMarkdown, onCopy }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState('');

    const displayText = editedMarkdown ?? briefing?.briefingMarkdown ?? '';

    const handleEdit = () => {
        setDraftText(displayText);
        setIsEditing(true);
    };

    const handleSave = () => {
        setEditedMarkdown(draftText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setDraftText('');
    };

    if (isLoading) return <BriefingSkeleton />;

    if (!briefing) {
        return (
            <div className="py-14 text-center text-gray-300 px-6">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">Your intelligence brief will appear here</p>
                <p className="text-xs mt-1 text-gray-300">Generate a briefing to see results</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    {editedMarkdown && (
                        <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                            Edited
                        </span>
                    )}
                    <span className="text-gray-300">
                        Generated {new Date(briefing.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing && (
                        <>
                            <button
                                onClick={onCopy}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <Copy className="w-3.5 h-3.5" /> Copy
                            </button>
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a2744] text-white hover:bg-[#243264] transition-colors"
                            >
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                        </>
                    )}
                    {isEditing && (
                        <>
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" /> Save
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            {isEditing ? (
                <textarea
                    value={draftText}
                    onChange={e => setDraftText(e.target.value)}
                    className="w-full h-[480px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF9933]/40 resize-none"
                />
            ) : (
                <div className="prose prose-sm max-w-none text-gray-700 prose-headings:text-[#1a2744] prose-headings:font-bold prose-strong:text-[#1a2744] prose-a:text-[#FF9933]">
                    <ReactMarkdown>{displayText}</ReactMarkdown>
                </div>
            )}
        </div>
    );
}
