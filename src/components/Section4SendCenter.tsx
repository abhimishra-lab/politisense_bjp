import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageSquare, Mail, Send, ChevronDown, Search, X, UserPlus, Check, CheckSquare, Square, Upload, AlertCircle, AlertTriangle, Phone, AtSign, Shield, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui';
import { Contact, BriefingOutput, Channel, SentLog } from '../types';
import { sendBriefingBatch, BriefingBatchPayload } from '../services/geminiService';
import { parseCSV, parseXLSX, detectColumnMapping, rowsToContacts, mergeContacts } from '../utils/contactImport';
import { ColumnMapping } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getContactDetail(c: Contact, ch: Channel): string | undefined {
    if (ch === 'whatsapp') return c.whatsapp;
    if (ch === 'email') return c.email;
    if (ch === 'telegram') return c.telegram;
}
function hasContactDetail(c: Contact, ch: Channel): boolean {
    return !!getContactDetail(c, ch);
}

// Format content per channel
function formatContent(markdown: string, ch: Channel): string {
    // For now all channels use the same markdown; stubs for future formatting
    if (ch === 'whatsapp') return markdown;
    if (ch === 'telegram') return markdown;
    return markdown; // email
}

// ─── Channel Config ────────────────────────────────────────────────────────────
const CHANNEL_META: Record<Channel, { label: string; icon: React.ReactNode; color: string; bg: string; badgeBg: string; badgeText: string }> = {
    whatsapp: { label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" />, color: 'text-green-700', bg: 'bg-green-50', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
    telegram: { label: 'Telegram', icon: <Send className="w-4 h-4" />, color: 'text-blue-700', bg: 'bg-blue-50', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' },
    email: { label: 'Email', icon: <Mail className="w-4 h-4" />, color: 'text-purple-700', bg: 'bg-purple-50', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' },
};
const ALL_CHANNELS: Channel[] = ['whatsapp', 'telegram', 'email'];

// ─── Composer components ──────────────────────────────────────────────────────
function WhatsAppComposer({ content }: { content: string }) {
    return (
        <div className="bg-[#e5ddd5] rounded-xl p-4 flex flex-col items-end">
            <div className="max-w-xs bg-[#056162] text-white p-4 rounded-2xl rounded-tr-none shadow-md relative leading-relaxed">
                <div className="absolute -right-2 top-0 w-3 h-3 bg-[#056162] rotate-45" />
                <div className="whitespace-pre-wrap text-xs"><ReactMarkdown>{content}</ReactMarkdown></div>
                <div className="text-right text-[10px] text-white/50 mt-2">
                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}
function EmailComposer({ content, subject }: { content: string; subject: string }) {
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                <span className="text-xs font-bold uppercase text-gray-400 w-16">Subject:</span>
                <span className="text-sm font-semibold text-[#1a2744]">{subject}</span>
            </div>
            <div className="bg-white p-5">
                <div className="prose prose-sm max-w-none text-gray-600 prose-headings:text-[#1a2744]">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
function TelegramComposer({ content }: { content: string }) {
    return (
        <div className="bg-[#1c2b3a] rounded-xl p-4 flex flex-col">
            <div className="text-[10px] text-[#FF9933] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                PolitiSense Bot
            </div>
            <div className="bg-[#2b5278] text-white p-4 rounded-xl rounded-tl-none max-w-sm leading-relaxed">
                <div className="whitespace-pre-wrap text-xs"><ReactMarkdown>{content}</ReactMarkdown></div>
                <div className="text-right text-[10px] text-white/40 mt-2">
                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

// RecipientCard component is unused and removed.

// ─── Contacts Modal ────────────────────────────────────────────────────────────
function ContactsModal({ contacts, onClose }: {
    contacts: Contact[];
    onClose: () => void;
}) {
    const [search, setSearch] = useState('');
    const filtered = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase()) ||
        c.whatsapp?.toLowerCase().includes(search.toLowerCase()) ||
        c.telegram?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 space-y-5 z-10 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-[#1a2744]">Contacts</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Total contacts: {contacts.length}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
                </div>

                <div className="relative shrink-0">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name / role / channel"
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF9933]/50 focus:ring-1 focus:ring-[#FF9933]/50"
                    />
                </div>

                <div className="flex-1 overflow-auto border border-gray-100 rounded-xl min-h-[300px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-500">Name</th>
                                <th className="px-4 py-3 font-semibold text-gray-500">Role</th>
                                <th className="px-4 py-3 font-semibold text-gray-500">WhatsApp</th>
                                <th className="px-4 py-3 font-semibold text-gray-500">Telegram</th>
                                <th className="px-4 py-3 font-semibold text-gray-500">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#1a2744]">{c.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{c.role || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500">{c.whatsapp || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500">{c.telegram || '-'}</td>
                                    <td className="px-4 py-3 text-gray-500">{c.email || '-'}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No contacts found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="shrink-0 pt-2 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-[#1a2744] text-white rounded-xl text-sm font-bold hover:bg-[#243264] transition-colors">
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ConfirmSendModal component has been removed as per the simplified send flow.

// ─── Import Modal ─────────────────────────────────────────────────────────────
function ImportModal({ onClose, onImport, existingContacts }: {
    onClose: () => void;
    onImport: (contacts: Contact[], added: number, skipped: number) => void;
    existingContacts: Contact[];
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<Record<string, string>[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({});
    const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
    const [fileName, setFileName] = useState('');

    const handleFile = useCallback(async (file: File) => {
        setFileName(file.name);
        let parsed: Record<string, string>[] = [];
        if (file.name.endsWith('.csv')) {
            parsed = parseCSV(await file.text());
        } else {
            parsed = parseXLSX(await file.arrayBuffer());
        }
        if (parsed.length === 0) return;
        const hdrs = Object.keys(parsed[0]);
        setHeaders(hdrs);
        setRows(parsed);
        const auto = detectColumnMapping(hdrs);
        setMapping(auto);
        setStep(!auto.name ? 'map' : 'preview');
    }, []);

    const handleImport = () => {
        const newContacts = rowsToContacts(rows, mapping);
        const result = mergeContacts([...existingContacts], newContacts);
        onImport(result.contacts, result.added, result.skipped);
        onClose();
    };

    const fields: (keyof ColumnMapping)[] = ['name', 'role', 'whatsapp', 'email', 'telegram'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#1a2744]">Import Contacts</h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-500" /></button>
                </div>

                {step === 'upload' && (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-[#FF9933]/40 transition-colors cursor-pointer"
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-600">Click or drag a file here</p>
                        <p className="text-xs text-gray-400 mt-1">Supports .csv and .xlsx</p>
                        <p className="text-xs text-gray-300 mt-2">Headers: name, role, whatsapp, email, telegram</p>
                        <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    </div>
                )}

                {step === 'map' && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-500">Map your file columns to contact fields:</p>
                        {fields.map(f => (
                            <div key={f} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-[#1a2744] w-20 capitalize">{f}</span>
                                <select value={mapping[f] ?? ''} onChange={e => setMapping(m => ({ ...m, [f]: e.target.value || undefined }))} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none">
                                    <option value="">— Skip —</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        ))}
                        <button onClick={() => setStep('preview')} disabled={!mapping.name} className="w-full py-2.5 bg-[#1a2744] text-white rounded-xl text-sm font-bold disabled:opacity-40">
                            Continue to Preview
                        </button>
                    </div>
                )}

                {step === 'preview' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5" />{rows.length} rows found in "{fileName}"
                        </div>
                        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>{fields.filter(f => mapping[f]).map(f => <th key={f} className="px-3 py-2 text-left font-bold text-gray-500 capitalize">{f}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rows.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            {fields.filter(f => mapping[f]).map(f => <td key={f} className="px-3 py-2 text-gray-600 truncate max-w-[100px]">{mapping[f] ? row[mapping[f]!] : ''}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {rows.length > 10 && <p className="text-xs text-gray-400 text-center">...and {rows.length - 10} more rows</p>}
                        <div className="flex gap-3">
                            <button onClick={() => setStep('map')} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Back</button>
                            <button onClick={handleImport} className="flex-1 py-2.5 bg-[#FF9933] text-white rounded-xl text-sm font-bold">Import {rows.length} Contacts</button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─── Main Section4 ─────────────────────────────────────────────────────────────
interface Props {
    briefing: BriefingOutput | null;
    editedMarkdown: string | null;
    contacts: Contact[];
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
    onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
    sentLog: SentLog[];
    setSentLog: React.Dispatch<React.SetStateAction<SentLog[]>>;
}

export default function Section4SendCenter({ briefing, editedMarkdown, contacts, setContacts, onToast, sentLog, setSentLog }: Props) {
    // ── Multi-channel state ──────────────────────────────────────────────────
    const [channels, setChannels] = useState<Channel[]>(['telegram']);
    const [previewChannel, setPreviewChannel] = useState<Channel>('telegram');

    const toggleChannel = (ch: Channel) => {
        setChannels(prev => {
            if (prev.includes(ch)) {
                const next = prev.filter(c => c !== ch);
                return next.length === 0 ? prev : next; // keep at least 1
            }
            return [...prev, ch];
        });
        // Keep preview pointing at a valid channel
        setPreviewChannel(ch);
    };

    // Sync previewChannel if removed
    useEffect(() => {
        if (!channels.includes(previewChannel)) setPreviewChannel(channels[0]);
    }, [channels, previewChannel]);

    const [isSending, setIsSending] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', role: '', whatsapp: '', email: '', telegram: '' });

    const content = editedMarkdown ?? briefing?.briefingMarkdown ?? '';
    const emailSubject = briefing
        ? `PolitiSense Brief — ${briefing.scope === 'Nationwide' ? 'Nationwide' : briefing.state} — ${new Date(briefing.generatedAt).toLocaleDateString('en-IN')}`
        : 'PolitiSense Intelligence Brief';

    // Per-channel deliverable counts using all imported contacts
    const getDeliverableForChannel = (ch: Channel) =>
        contacts.filter(c => hasContactDetail(c, ch));

    const totalDeliverable = channels.reduce((acc, ch) => acc + getDeliverableForChannel(ch).length, 0);
    const hasAnyDeliverable = totalDeliverable > 0;

    // Actual send — single batch POST to n8n, reads delivery report
    const executeSend = async () => {
        setIsSending(true);
        try {
            const briefingId = `brief-${Date.now()}`;
            const deliverableChannels = channels.filter(ch => ch === 'telegram' || ch === 'email') as ('telegram' | 'email')[];

            const payload: BriefingBatchPayload = {
                briefing_id: briefingId,
                selected_channels: deliverableChannels,
                recipients: contacts.map(c => ({
                    name: c.name,
                    role: c.role || '',
                    telegram_chat_id: c.telegram || null,
                    email: c.email || null,
                })),
                outputs: {
                    telegram: formatContent(content, 'telegram'),
                    email_subject: emailSubject,
                    email_body: formatContent(content, 'email'),
                },
            };

            const report = await sendBriefingBatch(payload);
            const totalSent = Object.values(report.delivery).reduce((s, d) => s + (d?.sent ?? 0), 0);

            // User-facing status message
            if (totalSent > 0) {
                const deliveredVia = deliverableChannels.map(ch => CHANNEL_META[ch].label).join(' and ');
                onToast(`Brief sent successfully. Delivered via ${deliveredVia}.`, 'success');
            } else {
                onToast('Delivery issue — please try again.', 'error');
            }
        } catch {
            onToast('Delivery issue — please try again.', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const handleAddContact = () => {
        if (!newContact.name.trim()) return;
        const c: Contact = { ...newContact, id: `manual-${Date.now()}` };
        setContacts(prev => [...prev, c]);
        setNewContact({ name: '', role: '', whatsapp: '', email: '', telegram: '' });
        setShowAddContact(false);
        onToast(`${c.name} added to contacts`, 'success');
    };

    return (
        <div className="space-y-6 p-6">
            <div className="grid md:grid-cols-2 gap-6">

                {/* ── LEFT: Channel selector + Composer ── */}
                <div className="space-y-4">

                    {/* Multi-select channel checkboxes */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Channels</p>
                        <div className="grid grid-cols-3 gap-2">
                            {ALL_CHANNELS.map(ch => {
                                const meta = CHANNEL_META[ch];
                                const active = channels.includes(ch);
                                return (
                                    <button
                                        key={ch}
                                        onClick={() => toggleChannel(ch)}
                                        className={cn(
                                            'flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all cursor-pointer select-none',
                                            active
                                                ? 'border-[#1a2744] bg-[#1a2744] text-white'
                                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                        )}
                                    >
                                        <div className={cn('flex items-center justify-center gap-1.5 text-xs font-bold', active ? 'text-white' : 'text-gray-500')}>
                                            {active
                                                ? <Check className="w-3 h-3 text-[#FF9933]" />
                                                : <div className="w-3 h-3 rounded border border-gray-300" />
                                            }
                                            {meta.icon}
                                        </div>
                                        <span className="text-[11px] font-bold">{meta.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {channels.length > 1 && (
                            <p className="text-[10px] text-[#FF9933] font-bold mt-2 px-0.5">
                                ✓ Multi-channel: {channels.map(ch => CHANNEL_META[ch].label).join(' + ')}
                            </p>
                        )}
                    </div>

                    {/* Composer Preview (tab per selected channel) */}
                    {!briefing ? (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-sm text-gray-300 font-medium">
                            Generate a briefing first to preview and send
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Preview tab selector (only shown when >1 channel) */}
                            {channels.length > 1 && (
                                <div className="flex gap-1.5">
                                    {channels.map(ch => {
                                        const meta = CHANNEL_META[ch];
                                        return (
                                            <button
                                                key={ch}
                                                onClick={() => setPreviewChannel(ch)}
                                                className={cn(
                                                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all',
                                                    previewChannel === ch
                                                        ? 'bg-[#1a2744] text-white border-[#1a2744]'
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                )}
                                            >
                                                {meta.icon} {meta.label}
                                            </button>
                                        );
                                    })}
                                    <span className="text-[10px] text-gray-300 self-center ml-1">preview</span>
                                </div>
                            )}
                            <AnimatePresence mode="wait">
                                <motion.div key={previewChannel} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                                    {previewChannel === 'whatsapp' && <WhatsAppComposer content={content} />}
                                    {previewChannel === 'email' && <EmailComposer content={content} subject={emailSubject} />}
                                    {previewChannel === 'telegram' && <TelegramComposer content={content} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Recipients + Send ── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1a2744]">Contacts</span>
                        <div className="flex gap-2">
                            <button onClick={() => setShowContactsModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                <Users className="w-3.5 h-3.5" /> See Contacts
                            </button>
                            <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                <Upload className="w-3.5 h-3.5" /> Import
                            </button>
                            <button onClick={() => setShowAddContact(s => !s)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2744] text-white rounded-lg text-xs font-semibold hover:bg-[#243264] transition-colors">
                                <UserPlus className="w-3.5 h-3.5" /> Add Contact
                            </button>
                        </div>
                    </div>

                    {/* Add contact inline */}
                    <AnimatePresence>
                        {showAddContact && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 overflow-hidden">
                                {(['name', 'role', 'whatsapp', 'email', 'telegram'] as const).map(f => (
                                    <input
                                        key={f}
                                        placeholder={f.charAt(0).toUpperCase() + f.slice(1) + (f === 'name' ? ' *' : '')}
                                        value={newContact[f]}
                                        onChange={e => setNewContact(n => ({ ...n, [f]: e.target.value }))}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30"
                                    />
                                ))}
                                <div className="flex gap-2">
                                    <button onClick={() => setShowAddContact(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500">Cancel</button>
                                    <button onClick={handleAddContact} disabled={!newContact.name.trim()} className="flex-1 py-2 bg-[#FF9933] text-white rounded-lg text-xs font-bold disabled:opacity-40">Add</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Send button */}
                    <button
                        onClick={executeSend}
                        disabled={!briefing || contacts.length === 0 || isSending}
                        className="w-full flex flex-col items-center justify-center gap-1 py-3 bg-[#FF9933] text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-40 hover:bg-[#e68a2e] transition-colors shadow-lg hover:shadow-[#FF9933]/30 min-h-[52px]"
                    >
                        <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            {isSending ? 'Sending...' : 'Send Brief'}
                        </div>
                    </button>

                    {/* Sent log */}
                    {sentLog.length > 0 && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Sent Log</div>
                            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                                {sentLog.map(s => {
                                    const meta = CHANNEL_META[s.channel];
                                    return (
                                        <div key={s.id} className="px-4 py-3 flex items-center gap-3">
                                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-[#1a2744] truncate">{s.contactName}</p>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <span className={cn('font-bold', meta.badgeText)}>{meta.label}</span>
                                                    · {new Date(s.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {showContactsModal && (
                    <ContactsModal
                        contacts={contacts}
                        onClose={() => setShowContactsModal(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showImport && (
                    <ImportModal
                        onClose={() => setShowImport(false)}
                        existingContacts={contacts}
                        onImport={(newList, added, skipped) => {
                            setContacts(newList);
                            onToast(`Imported ${added} contacts. ${skipped} skipped (duplicates).`, 'success');
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
