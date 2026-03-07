/**
 * URL Normalization & Validation Utility
 * Ensures all news URLs are canonical publisher URLs, free of tracking params, AMP, and redirects.
 */

// ─── Known source domain map ───────────────────────────────────────────────────
const SOURCE_CANONICAL_DOMAINS: Record<string, string> = {
    'times of india': 'timesofindia.indiatimes.com',
    'toi': 'timesofindia.indiatimes.com',
    'hindustan times': 'hindustantimes.com',
    'ht': 'hindustantimes.com',
    'the hindu': 'thehindu.com',
    'ndtv': 'ndtv.com',
    'india today': 'indiatoday.in',
    'the wire': 'thewire.in',
    'scroll': 'scroll.in',
    'the print': 'theprint.in',
    'print': 'theprint.in',
    'business standard': 'business-standard.com',
    'financial express': 'financialexpress.com',
    'economic times': 'economictimes.indiatimes.com',
    'et': 'economictimes.indiatimes.com',
    'live mint': 'livemint.com',
    'mint': 'livemint.com',
    'dainik jagran': 'jagran.com',
    'jagran': 'jagran.com',
    'amar ujala': 'amarujala.com',
    'maharashtra times': 'maharashtratimes.com',
    'pib india': 'pib.gov.in',
    'pib': 'pib.gov.in',
    'ani': 'aninews.in',
    'pti': 'ptinews.com',
    '@bjp4india': 'x.com/BJP4India',
    'bjp4india': 'x.com/BJP4India',
    'bjp official': 'facebook.com/BJP4India',
};

// ─── Tracking / junk parameters to strip ─────────────────────────────────────
const TRACKING_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'gclid', 'msclkid', 'ref', 'referrer', 'source', '_ga',
    'mc_cid', 'mc_eid', 'igshid', 'ncid', 'via', 'cid',
];

// ─── AMP URL patterns ─────────────────────────────────────────────────────────
const AMP_PATTERNS = [
    /^https?:\/\/amp\./i,                        // amp.example.com
    /\/amp\/?$/i,                                 // example.com/article/amp
    /\/amp\//i,                                   // example.com/amp/article
    /[?&]amp=1/i,                                 // example.com/article?amp=1
    /\.amp\.html$/i,                              // article.amp.html
];

// ─── Google News / aggregator detection ──────────────────────────────────────
const AGGREGATOR_PATTERNS = [
    /news\.google\.com/i,
    /google\.com\/search/i,
    /news\.yahoo\.com/i,
    /flipboard\.com/i,
    /smartnews\.com/i,
    /ground\.news/i,
    /bit\.ly/i,
    /t\.co\//i,
    /tinyurl\.com/i,
    /ow\.ly/i,
];

/**
 * Remove tracking parameters from a URL.
 */
function stripTrackingParams(url: URL): URL {
    const cleaned = new URL(url.toString());
    TRACKING_PARAMS.forEach(p => cleaned.searchParams.delete(p));
    return cleaned;
}

/**
 * Convert an AMP URL to its canonical version.
 * e.g. https://amp.hindustantimes.com/news/article → https://www.hindustantimes.com/news/article
 * e.g. https://thehindu.com/news/article/amp/ → https://thehindu.com/news/article/
 */
function deAmpUrl(url: URL): URL {
    let href = url.toString();

    // Handle amp.subdomain.com
    if (/^https?:\/\/amp\./i.test(href)) {
        href = href.replace(/^(https?:\/\/)amp\./i, '$1www.');
    }

    // Remove /amp/ prefix variant
    href = href.replace(/(https?:\/\/[^/]+)\/amp\//i, '$1/');

    // Remove trailing /amp
    href = href.replace(/\/amp\/?$/i, '/');

    // Remove .amp.html
    href = href.replace(/\.amp\.html$/i, '.html');

    // Remove ?amp=1 or &amp=1
    const result = new URL(href);
    result.searchParams.delete('amp');
    return result;
}

/**
 * Check whether a URL belongs to a known source domain.
 */
function matchesDomain(url: URL, sourceName: string): boolean {
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    const key = sourceName.toLowerCase();

    // Direct domain check
    const expectedDomain = SOURCE_CANONICAL_DOMAINS[key];
    if (expectedDomain) {
        return hostname === expectedDomain.replace(/^www\./, '').split('/')[0];
    }

    // Fuzzy: any source keyword appears in hostname
    const sourceWords = key.split(/\s+/).filter(w => w.length > 3);
    return sourceWords.some(word => hostname.includes(word));
}

/**
 * Build a site-search fallback URL: searches Google for headline on source's site.
 */
function buildSiteSearchFallback(headline: string, sourceName: string): string {
    const domain = SOURCE_CANONICAL_DOMAINS[sourceName.toLowerCase()];
    const siteQuery = domain ? `site:${domain.split('/')[0]} ` : '';
    const query = encodeURIComponent(`${siteQuery}"${headline.slice(0, 80)}"`);
    return `https://www.google.com/search?q=${query}`;
}

export interface UrlValidationResult {
    url: string;           // Final canonical URL
    isCanonical: boolean;  // Whether we are confident it is the real article URL
    isFallback: boolean;   // Whether this is a site-search fallback
    warning?: string;      // Optional warning message
}

/**
 * Main entry point. Call this before rendering any news URL.
 * @param rawUrl   Raw URL as provided (could be AMP, tracking-laden, aggregator, etc.)
 * @param headline Article headline (for fallback search)
 * @param source   Display name of the source (e.g. "The Hindu")
 */
export function normalizeAndValidateUrl(
    rawUrl: string | undefined | null,
    headline: string,
    source: string,
): UrlValidationResult {
    // ── 1. Handle missing or obviously invalid ───────────────────────────────
    if (!rawUrl || rawUrl.trim() === '' || rawUrl.startsWith('javascript:')) {
        return { url: buildSiteSearchFallback(headline, source), isCanonical: false, isFallback: true, warning: 'URL missing; showing site search.' };
    }

    let parsed: URL;
    try {
        parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    } catch {
        return { url: buildSiteSearchFallback(headline, source), isCanonical: false, isFallback: true, warning: 'Malformed URL; showing site search.' };
    }

    // ── 2. Enforce HTTPS ─────────────────────────────────────────────────────
    parsed.protocol = 'https:';

    // ── 3. Reject aggregator / redirect links ────────────────────────────────
    const isAggregator = AGGREGATOR_PATTERNS.some(p => p.test(parsed.toString()));
    if (isAggregator) {
        return { url: buildSiteSearchFallback(headline, source), isCanonical: false, isFallback: true, warning: 'Aggregator/redirect URL detected; showing site search.' };
    }

    // ── 4. De-AMP ────────────────────────────────────────────────────────────
    const isAmp = AMP_PATTERNS.some(p => p.test(parsed.toString()));
    if (isAmp) parsed = deAmpUrl(parsed);

    // ── 5. Strip tracking parameters ────────────────────────────────────────
    parsed = stripTrackingParams(parsed);

    // ── 6. Remove trailing slash inconsistencies ─────────────────────────────
    // Keep trailing slash only if path is root
    if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
        parsed.pathname = parsed.pathname.replace(/\/$/, '');
    }

    const finalUrl = parsed.toString();

    // ── 7. Domain validation ─────────────────────────────────────────────────
    const domainMatch = matchesDomain(parsed, source);
    if (!domainMatch) {
        // Still usable but warn
        return { url: finalUrl, isCanonical: true, isFallback: false, warning: `URL domain may not match source "${source}"` };
    }

    return { url: finalUrl, isCanonical: true, isFallback: false };
}

/**
 * Extract hostname without www. for display.
 */
export function displayDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

/**
 * Check if a URL looks like a canonical article (has a meaningful path).
 */
export function isArticleUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.pathname.length > 1 && !u.pathname.match(/^\/search/);
    } catch {
        return false;
    }
}
