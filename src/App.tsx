import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, FileText, Send, AlertTriangle, RefreshCw, History } from 'lucide-react';

import { Header, ToastContainer, SectionCard, ScoreBar, ToastMessage, cn } from './components/ui';
import Section1Input from './components/Section1Input';
import Section2News from './components/Section2News';
import Section3Brief from './components/Section3Brief';
import Section4SendCenter from './components/Section4SendCenter';
import HistoryBriefings, { BriefingRecord, makeBriefingRecord } from './components/HistoryBriefings';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import IssuesRequiringAttention from './components/IssuesRequiringAttention';

import { MOCK_DATA } from './mockData';
import { generateBriefing, generateBriefingFromN8N, getMockBriefingOutput, enrichBriefingWithActions } from './services/geminiService';
import { BriefingOutput, Contact, DataSource, Scope, SentLog } from './types';
import { User, getSessionUser, logout } from './auth';

// ─── Coverage Source Snapshot ─────────────────────────────────────────────────
function CoverageSourceSnapshot({ briefing }: { briefing: BriefingOutput }) {
  const allNews = [
    ...briefing.topNews.positive,
    ...briefing.topNews.neutral,
    ...briefing.topNews.negative,
  ];


  // Categorise sources into leadership-friendly buckets
  const buckets: Record<string, number> = {
    'News Media': 0,
    'Regional Media': 0,
    'Party Channels': 0,
    'Government Releases': 0,
    'Other': 0,
  };
  const newsKeywords = ['ndtv', 'times', 'hindustan', 'india today', 'republic', 'zee', 'the hindu', 'telegraph', 'mint', 'economic', 'news18', 'aaj tak', 'cnbc', 'bloomberg', 'reuters', 'pti', 'ani'];
  const regionalKeywords = ['nagpur', 'punjab', 'gujarat', 'bengal', 'rajasthan', 'odisha', 'assam', 'telangana', 'kerala', 'local', 'regional', 'state'];
  const partyKeywords = ['bjp', 'congress', 'aap', 'sp', 'bsp', 'party', 'neta', 'leader', 'spokesperson'];
  const govtKeywords = ['pib', 'ministry', 'government', 'pmo', 'official', 'release', 'press information'];

  for (const item of allNews) {
    const src = (item.source ?? '').toLowerCase();
    if (newsKeywords.some(k => src.includes(k))) buckets['News Media']++;
    else if (govtKeywords.some(k => src.includes(k))) buckets['Government Releases']++;
    else if (partyKeywords.some(k => src.includes(k))) buckets['Party Channels']++;
    else if (regionalKeywords.some(k => src.includes(k))) buckets['Regional Media']++;
    else buckets['Other']++;
  }

  // Remove empty buckets, sort by count desc
  const entries = Object.entries(buckets).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...entries.map(e => e[1]), 1);

  const colors = [
    'bg-[#1a2744]', 'bg-[#FF9933]', 'bg-blue-500', 'bg-green-500', 'bg-purple-400',
  ];

  if (entries.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-[#FF9933]"><BarChart3 className="w-4 h-4" /></span>
          <h2 className="text-base font-bold text-[#1a2744]">Coverage Source Snapshot</h2>
        </div>
        <span className="text-xs text-gray-400 font-medium">{allNews.length} items tracked</span>
      </div>
      <div className="px-6 py-5 space-y-4">
        <p className="text-[11px] text-gray-400 font-medium -mt-1">Based on coverage tracked in the last 24 hours</p>
        {entries.map(([label, count], i) => {
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={label} className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#1a2744] w-40 shrink-0">{label}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors[i % colors.length]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-500 w-14 text-right shrink-0">{count} item{count !== 1 ? 's' : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: 'Narendra Modi', role: 'PM', email: 'pm@bjp.org', whatsapp: '+919876543210', telegram: '@namo' },
  { id: '2', name: 'Amit Shah', role: 'Home Minister', email: 'hm@bjp.org', whatsapp: '+919876543211', telegram: '@amitshah' },
  { id: '3', name: 'J.P. Nadda', role: 'Party President', email: 'jpnadda@bjp.org', whatsapp: '+919876543212' },
  { id: '4', name: 'Rajnath Singh', role: 'Defence Minister', email: 'defence@bjp.org', whatsapp: '+919876543213' },
  { id: '5', name: 'Abhi', role: 'HR', email: 'abhimishra8622@gmail.com', whatsapp: '+916387070190', telegram: '1072520349' },
];

const LOADING_TEXTS = [
  'Gathering latest news...',
  'Reading the political landscape...',
  'Preparing your daily brief...',
];

type AuthView = 'login' | 'signup';

export default function App() {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSessionUser());
  const [authView, setAuthView] = useState<AuthView>('login');

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => { logout(); setCurrentUser(null); setAuthView('login'); };

  // ─── App state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scope, setScope] = useState<Scope>('Nationwide');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [dataSource] = useState<DataSource>('live');  // Updated to 'live' to test real Gemini calls
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [briefing, setBriefing] = useState<BriefingOutput | null>(null);
  const [editedMarkdown, setEditedMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('—');
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  const [sentLog, setSentLog] = useState<SentLog[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [history, setHistory] = useState<BriefingRecord[]>([]);
  const [sentimentTab, setSentimentTab] = useState<'positive' | 'neutral' | 'negative'>('positive');

  // Prevent double-execution in development (React StrictMode) and auto-generate guard
  const hasAutoGenerated = useRef(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isSingleDayToday = selectedDate === todayStr && toDate === todayStr;

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = String(Date.now());
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // Clear briefing when filters change so user knows they need to regenerate
  useEffect(() => {
    setBriefing(null);
    setEditedMarkdown(null);
  }, [scope, selectedState, selectedDate, toDate]);

  useEffect(() => {
    if (!isLoading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_TEXTS.length;
      setLoadingTextIdx(i);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = useCallback(async () => {
    // Prevent duplicate calls if already generating
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setEditedMarkdown(null);
    try {
      let result: BriefingOutput;
      if (dataSource === 'mock') {
        await new Promise(r => setTimeout(r, 1800));
        result = getMockBriefingOutput(scope, scope === 'State Wise' ? selectedState : undefined);
      } else {
        // Try n8n live pipeline first (Twitter + News scraper via Final_v2.json)
        // Falls back to direct RSS→Gemini if VITE_N8N_BRIEFING_WEBHOOK is not set
        const n8nResult = await generateBriefingFromN8N(scope, scope === 'State Wise' ? selectedState : undefined);
        result = n8nResult ?? await generateBriefing(MOCK_DATA, scope, scope === 'State Wise' ? selectedState : undefined);
      }
      // Enrich every news item with a specific Gemini-generated BJP cell action.
      // Works for both n8n and direct-Gemini results; handles Hindi/any language.
      // Falls back silently if the API call fails.
      result = await enrichBriefingWithActions(result);
      setBriefing(result);
      // ─ Save to history ─
      setHistory(prev => [...prev, makeBriefingRecord(result)]);
      setLastUpdated(new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }));
      addToast('Briefing generated successfully', 'success');
    } catch (err: any) {
      const msg = err?.message === 'RATE_LIMIT'
        ? 'Daily quota reached. Please try again in a few moments.'
        : 'Could not generate briefing. Please check your API key and try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [dataSource, scope, selectedState, addToast, isSingleDayToday, history, selectedDate, toDate, isLoading]);

  // Auto-generate on mount (only when logged in) - with guard to prevent double-execution
  useEffect(() => {
    if (currentUser && !hasAutoGenerated.current) {
      hasAutoGenerated.current = true;
      handleGenerate();
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyBrief = () => {
    const text = editedMarkdown ?? briefing?.briefingMarkdown ?? '';
    navigator.clipboard.writeText(text).then(() => addToast('Copied to clipboard', 'info'));
  };

  const ss = briefing?.sentimentSummary;

  // ─── Auth gate ─────────────────────────────────────────────────────────────
  if (!currentUser) {
    return authView === 'login'
      ? <LoginPage onLogin={handleLogin} onGoSignup={() => setAuthView('signup')} />
      : <SignupPage onLogin={handleLogin} onGoLogin={() => setAuthView('login')} />;
  }

  // ─── Authenticated app ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDFAF6] font-sans">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1a2744] to-[#243264] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {activeTab === 'history' ? 'Past Briefs' : 'Intelligence Dashboard'}
              </h1>
              <p className="text-white/50 text-sm font-medium mt-1">
                {activeTab === 'history'
                  ? `${history.length} brief${history.length !== 1 ? 's' : ''} generated this session`
                  : scope === 'State Wise' ? `Focused on: ${selectedState}` : 'Nationwide Political Overview'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ─── Dashboard ───────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

              <SectionCard title="Filter Options" icon={<BarChart3 className="w-4 h-4" />}>
                <div className="p-6">
                  <Section1Input
                    scope={scope}
                    setScope={setScope}
                    selectedState={selectedState}
                    setSelectedState={setSelectedState}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    toDate={toDate}
                    onToDateChange={setToDate}
                    isSingleDayToday={isSingleDayToday}
                    isLoading={isLoading}
                    loadingText={LOADING_TEXTS[loadingTextIdx]}
                    lastUpdated={lastUpdated}
                    onGenerate={handleGenerate}
                  />
                </div>
              </SectionCard>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700 font-medium flex-1">{error}</p>
                  <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}

              <SectionCard
                  title="Top News Signals"
                  icon={<FileText className="w-4 h-4" />}
                  badge={briefing && (
                    <span className="text-xs font-bold text-gray-400">
                      {briefing.topNews.positive.length + briefing.topNews.neutral.length + briefing.topNews.negative.length} items
                    </span>
                  )}
                >
                  <div className="p-6">
                    <Section2News briefing={briefing} isLoading={isLoading} sentimentTab={sentimentTab} onSentimentTabChange={setSentimentTab} />
                  </div>
                </SectionCard>

              {/* Issues Summary Card — below news, full width */}
              <IssuesRequiringAttention briefing={briefing} />

              <SectionCard title="Brief" icon={<FileText className="w-4 h-4" />}>
                <Section3Brief
                  briefing={briefing}
                  isLoading={isLoading}
                  editedMarkdown={editedMarkdown}
                  setEditedMarkdown={setEditedMarkdown}
                  onCopy={handleCopyBrief}
                />
              </SectionCard>

              <SectionCard title="Share Brief" icon={<Send className="w-4 h-4" />}>
                <Section4SendCenter
                  briefing={briefing}
                  editedMarkdown={editedMarkdown}
                  contacts={contacts}
                  setContacts={setContacts}
                  onToast={addToast}
                  sentLog={sentLog}
                  setSentLog={setSentLog}
                />
              </SectionCard>
            </motion.div>
          )}

          {/* ─── Past Briefs ─────────────────────────────────────────────────── */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SectionCard
                title="Past Briefs"
                icon={<History className="w-4 h-4" />}
              >
                <div className="px-6 pt-5 pb-6">
                  <p className="text-sm text-gray-500 font-medium mb-6">Previously generated briefings for quick reference.</p>
                  <HistoryBriefings records={history} />
                </div>
              </SectionCard>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div >
  );
}
