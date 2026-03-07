export type Platform = 'news' | 'x' | 'instagram' | 'facebook';
export type SentimentLabel = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
export type Scope = 'Nationwide' | 'State Wise';
export type Channel = 'whatsapp' | 'email' | 'telegram';
export type DataSource = 'mock' | 'live';

export interface Contact {
  id: string;
  name: string;
  role?: string;
  whatsapp?: string;
  email?: string;
  telegram?: string;
}

export interface NewsItem {
  headline: string;
  sentiment: SentimentLabel;
  source: string;
  url?: string;
  time?: string;
  summary: string; // 1-line summary
  platform?: Platform;
  state?: string;
  bjpResponse?: string[]; // BJP Social Media Cell actionable steps
}

export interface SentimentSummary {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  total: number;
  percentages: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface PerformanceRating {
  category: string;
  score: number; // 0–9
  label: string; // e.g. "Good", "Needs Attention"
  posCount: number;
  negCount: number;
  neutralCount: number;
}

export interface IssueItem {
  area: string;
  issue: string;
  impact: string;
  evidence: string;
  suggestedAction: string;
}

export interface BriefingOutput {
  sentimentSummary: SentimentSummary;
  performanceRatings: PerformanceRating[];
  topNews: {
    positive: NewsItem[];
    neutral: NewsItem[];
    negative: NewsItem[];
  };
  issues: IssueItem[];
  briefingMarkdown: string;
  generatedAt: string; // ISO string
  state?: string;
  scope: Scope;
}

export interface DataItem {
  platform: Platform;
  source: string;
  text: string;
  headline?: string;
  url?: string;
  time?: string;
  language: 'en' | 'hi' | 'mixed';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  sentiment: {
    sentiment: SentimentLabel;
    confidence: number;
    intensity: 'LOW' | 'MEDIUM' | 'HIGH';
    reason: string;
  };
  weightedScore: number;
  state?: string;
}

export interface StructuredData {
  news: DataItem[];
  x: DataItem[];
  instagram: DataItem[];
  facebook: DataItem[];
}

export interface SentLog {
  id: string;
  contactName: string;
  channel: Channel;
  timestamp: string;
  preview: string;
}

export interface ImportResult {
  added: number;
  skipped: number;
  contacts: Contact[];
}

export interface ColumnMapping {
  name?: string;
  role?: string;
  whatsapp?: string;
  email?: string;
  telegram?: string;
}
