import React, { useState } from 'react';
import { ExternalLink, Newspaper, ThumbsUp, Minus, ThumbsDown, Clock, AlertCircle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, NewsSkeleton } from './ui';
import { NewsItem, BriefingOutput } from '../types';
import { normalizeAndValidateUrl, displayDomain, isArticleUrl } from '../utils/urlUtils';

const SENTIMENT_TILE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    POSITIVE: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
    NEUTRAL: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
    NEGATIVE: { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-500' },
    MIXED: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
};

function NewsTile({ item }: { item: NewsItem }) {
    const validated = normalizeAndValidateUrl(item.url, item.headline, item.source);
    const hasRealUrl = validated.isCanonical && isArticleUrl(validated.url);
    const isFallback = validated.isFallback;
    const domain = displayDomain(validated.url);
    const sentiment = SENTIMENT_TILE_STYLES[item.sentiment] || SENTIMENT_TILE_STYLES.NEUTRAL;

    return (
        <div className={cn(
            'flex flex-col bg-white rounded-xl border transition-all overflow-hidden',
            'border-gray-100 hover:border-[#FF9933]/40 hover:shadow-md',
        )}>
            {/* ── Header bar: sentiment badge ─────────────────────────────── */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase',
                    sentiment.bg, sentiment.text,
                )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', sentiment.dot)} />
                    {item.sentiment}
                </span>
                {(hasRealUrl || isFallback) ? (
                    <a
                        href={validated.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={isFallback ? `Search for: "${item.headline}"` : `Open article at ${domain}`}
                        onClick={e => e.stopPropagation()}
                        className="text-gray-300 hover:text-[#FF9933] transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-gray-200" title="Source URL unavailable" />
                )}
            </div>

            {/* ── Headline ──────────────────────────────────────────────────── */}
            <p className="px-4 text-sm font-bold text-[#1a2744] leading-snug line-clamp-3">
                {item.headline}
            </p>

            {/* ── One-line Brief ────────────────────────────────────────────── */}
            {item.summary && (
                <p className="px-4 mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {item.summary}
                </p>
            )}

            {/* ── Posted by ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 px-4 mt-3 text-[11px] text-gray-400 font-medium">
                <span className="font-semibold text-gray-500">Posted by:</span>
                <span className="truncate">{item.source}</span>
                {item.time && (
                    <>
                        <span className="text-gray-200 select-none">·</span>
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="shrink-0">
                            {new Date(item.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </>
                )}
            </div>


        </div>
    );
}

type Tab = 'positive' | 'neutral' | 'negative';
type CoverageType = 'Social Media' | 'Digital Media' | 'Foreign Media' | null;

const SUB_SOURCES: Record<Exclude<CoverageType, null>, string[]> = {
    'Social Media': ['Facebook', 'X (Twitter)', 'Reddit', 'Instagram', 'YouTube'],
    'Digital Media': ['Times of India', 'Hindustan Times', 'Indian Express', 'NDTV', 'The Hindu', 'News18', 'India Today', 'Republic', 'Zee News', 'Mint', 'Economic Times', 'Telegraph', 'Aaj Tak'],
    'Foreign Media': ['BBC', 'Reuters', 'Al Jazeera', 'CNN', 'New York Times', 'Washington Post', 'Bloomberg', 'The Guardian', 'Financial Times'],
};

const ALL_SOURCES = Object.values(SUB_SOURCES).flat().sort();

const getCategoryForSource = (source: string): CoverageType => {
    if (SUB_SOURCES['Social Media'].includes(source)) return 'Social Media';
    if (SUB_SOURCES['Digital Media'].includes(source)) return 'Digital Media';
    if (SUB_SOURCES['Foreign Media'].includes(source)) return 'Foreign Media';
    return null;
};

export default function Section2News({ briefing, isLoading, sentimentTab, onSentimentTabChange }: {
    briefing: BriefingOutput | null;
    isLoading: boolean;
    sentimentTab: Tab;
    onSentimentTabChange: (tab: Tab) => void;
}) {
    const [coverageType, setCoverageType] = useState<CoverageType>(null);
    const [activeSources, setActiveSources] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCategorySelect = (type: CoverageType) => {
        setCoverageType(type);
        setActiveSources(type ? SUB_SOURCES[type] : []);
        onSentimentTabChange('positive');
        // Only open source-picker modal for Social Media (Phase-1: Digital & Foreign not yet live)
        if (type === 'Social Media') setIsModalOpen(true);
    };

    const toggleSource = (source: string) => {
        setActiveSources(prev => {
            if (prev.includes(source)) {
                if (prev.length === 1) return prev; // Cannot uncheck last source
                return prev.filter(s => s !== source);
            }
            return [...prev, source];
        });
        onSentimentTabChange('positive');
    };

    const clearFilter = () => {
        setCoverageType(null);
        setActiveSources([]);
        onSentimentTabChange('positive');
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode; active: string; inactive: string }[] = [
        { id: 'positive', label: 'Positive', icon: <ThumbsUp className="w-3.5 h-3.5" />, active: 'bg-green-50 border-green-200 text-green-600', inactive: 'bg-white border-gray-100 text-gray-400 hover:border-gray-200' },
        { id: 'neutral', label: 'Neutral', icon: <Minus className="w-3.5 h-3.5" />, active: 'bg-gray-100 border-gray-300 text-gray-600', inactive: 'bg-white border-gray-100 text-gray-400 hover:border-gray-200' },
        { id: 'negative', label: 'Negative', icon: <ThumbsDown className="w-3.5 h-3.5" />, active: 'bg-red-50 border-red-200 text-red-500', inactive: 'bg-white border-gray-100 text-gray-400 hover:border-gray-200' },
    ];

    const coverageOptions: CoverageType[] = ['Social Media', 'Digital Media', 'Foreign Media'];

    // Filter logic
    const filterNews = (items: NewsItem[], type: CoverageType, activeSrcs: string[]): NewsItem[] => {
        if (!items) return [];
        if (!type && activeSrcs.length === 0) return items; // Return all items when no filter is selected
        return items.filter(item => {
            const platform = (item.platform || '').toLowerCase();
            const source = (item.source || '').toLowerCase();

            let matchesType = true;
            if (type === 'Social Media') {
                matchesType = ['x', 'instagram', 'facebook', 'youtube', 'reddit'].includes(platform) ||
                    source.includes('twitter') || source.includes('instagram') || source.includes('facebook') || source.includes('reddit');
            } else if (type === 'Digital Media') {
                const foreignKeywords = ['nyt', 'new york times', 'bbc', 'cnn', 'washington', 'guardian', 'reuters', 'bloomberg', 'al jazeera'];
                const isForeign = foreignKeywords.some(k => source.includes(k));
                const isSocial = ['x', 'instagram', 'facebook', 'youtube', 'reddit'].includes(platform) || source.includes('twitter') || source.includes('instagram') || source.includes('facebook') || source.includes('reddit');
                matchesType = !isForeign && !isSocial;
            } else if (type === 'Foreign Media') {
                const foreignKeywords = ['nyt', 'new york times', 'bbc', 'cnn', 'washington', 'guardian', 'reuters', 'bloomberg', 'al jazeera'];
                matchesType = foreignKeywords.some(k => source.includes(k));
            }

            if (!matchesType) return false;

            if (type && activeSrcs.length > 0) {
                const activeLower = activeSrcs.map(s => s.toLowerCase());
                let matchesActive = false;
                for (const sub of activeLower) {
                    if (sub === 'x (twitter)') {
                        if (platform === 'x' || source.includes('twitter')) { matchesActive = true; break; }
                    } else if (source.includes(sub) || platform.includes(sub)) {
                        matchesActive = true;
                        break;
                    }
                }
                return matchesActive;
            }

            return true;
        });
    };

    const positiveItems = briefing ? filterNews(briefing.topNews.positive, coverageType, activeSources) : [];
    const neutralItems = briefing ? filterNews(briefing.topNews.neutral, coverageType, activeSources) : [];
    const negativeItems = briefing ? filterNews(briefing.topNews.negative, coverageType, activeSources) : [];

    const counts = {
        positive: positiveItems.length,
        neutral: neutralItems.length,
        negative: negativeItems.length,
    };

    const itemsToDisplay = sentimentTab === 'positive' ? positiveItems : sentimentTab === 'neutral' ? neutralItems : negativeItems;

    // Default view state if no briefing is generated yet
    if (!briefing && !isLoading) {
        return (
            <div className="py-12 text-center text-gray-300">
                <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">Generate a briefing to see top news</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <NewsSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Coverage Filter Bar & Sources Panel */}
            <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Showing coverage from: <span className="text-[#1a2744]">
                        {!coverageType ? 'All sources' : coverageType}
                    </span>
                </p>
                <div className="flex flex-wrap gap-2 items-center w-full relative">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {coverageOptions.filter(opt => !coverageType || coverageType === opt).map(option => (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, display: 'none' }}
                                transition={{ duration: 0.2 }}
                                key={option}
                                onClick={() => handleCategorySelect(option)}
                                className={cn(
                                    'px-4 py-2 text-sm font-bold rounded-xl transition-all border',
                                    coverageType === option
                                        ? 'bg-[#1a2744] border-[#1a2744] text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                )}
                            >
                                {option}
                            </motion.button>
                        ))}

                        {/* Clear Filter - Always visible */}
                        <motion.button
                            layout
                            key="clear-btn"
                            onClick={clearFilter}
                            className="px-4 py-2 text-sm font-bold rounded-xl transition-all border border-gray-300 bg-transparent text-gray-500 hover:bg-gray-50 ml-auto"
                        >
                            Clear Filter
                        </motion.button>
                    </AnimatePresence>
                </div>

                {/* Source Modifier Button (Appears if category selected) */}
                <AnimatePresence>
                    {coverageType && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2 ml-1"
                        >
                            Edit Sources
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal Drawer for Checkboxes */}
            <AnimatePresence>
                {isModalOpen && coverageType && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-[#1a2744]/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-lg text-[#1a2744]">Select Sources</h3>
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">Showing {activeSources.length} of {SUB_SOURCES[coverageType].length} sources</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-gray-500 transition-colors shadow-sm">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 overflow-y-auto flex-1 bg-white">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {SUB_SOURCES[coverageType].map(source => {
                                        const isChecked = activeSources.includes(source);
                                        return (
                                            <label
                                                key={source}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group select-none",
                                                    isChecked
                                                        ? "bg-blue-50/50 border-blue-200 shadow-sm"
                                                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={isChecked}
                                                    onChange={() => toggleSource(source)}
                                                />
                                                <div className={cn(
                                                    "w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0",
                                                    isChecked
                                                        ? "bg-[#1a2744] border-[#1a2744] text-white"
                                                        : "bg-white border-gray-300 text-transparent group-hover:border-gray-400"
                                                )}>
                                                    <Check className="w-3.5 h-3.5" />
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-semibold line-clamp-1",
                                                    isChecked ? "text-[#1a2744]" : "text-gray-500"
                                                )}>
                                                    {source}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="space-y-4 pt-2 border-t border-gray-100 mt-2">
                {/* Sentiment Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => onSentimentTabChange(t.id)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold border transition-all',
                                sentimentTab === t.id ? t.active : t.inactive
                            )}
                        >
                            {t.icon}
                            {t.label}
                            <span className={cn('ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black', sentimentTab === t.id ? 'bg-white/70' : 'bg-gray-100 text-gray-500')}>
                                {counts[t.id]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* News List */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${coverageType}-${sentimentTab}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
                    >
                        {itemsToDisplay.length === 0 ? (
                            <div className="col-span-full py-8 text-center text-gray-400 text-sm font-medium bg-gray-50 rounded-xl border border-gray-100">
                                {coverageType === 'Digital Media'
                                    ? 'Digital Media coverage coming soon'
                                    : coverageType === 'Foreign Media'
                                    ? 'Foreign Media coverage coming soon'
                                    : coverageType === 'Social Media'
                                    ? 'No Social Media updates available for the selected time range'
                                    : 'No items available for this selection.'}
                            </div>
                        ) : (
                            itemsToDisplay.map((item, i) => <NewsTile key={i} item={item} />)
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
