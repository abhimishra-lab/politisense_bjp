import React from 'react';
import { FileDown } from 'lucide-react';
import { BriefingOutput, IssueItem, NewsItem } from '../types';

// ─── Action resolver (single line, topic-specific) ────────────────────────────
// Returns ONE concise BJP social media cell instruction.
// Uses bjpResponse[0] from data if present.
// Fallbacks are topic-specific — no banned generic phrases.

function getAction(item: NewsItem): string {
  if (item.bjpResponse && item.bjpResponse.length > 0) return item.bjpResponse[0];

  const s = item.sentiment.toUpperCase();
  const h = item.headline.toLowerCase();
  const src = item.source.toLowerCase();

  // ── POSITIVE ─────────────────────────────────────────────────────────────────
  if (s === 'POSITIVE') {
    if (src.includes('bjp') || src.includes('pmo') || src.includes('modi'))
      return 'Amplify via all state BJP handles with regional-language adaptations.';
    if (h.includes('scheme') || h.includes('welfare') || h.includes('beneficiar'))
      return 'Quote-tweet with beneficiary count infographic; push to WhatsApp karyakarta groups.';
    if (h.includes('infrastructure') || h.includes('road') || h.includes('highway') || h.includes('rail'))
      return 'Post a before/after visual thread on X tagging the relevant state BJP handle.';
    if (h.includes('economy') || h.includes('gdp') || h.includes('growth') || h.includes('invest'))
      return 'Publish a BJP-branded data card with the growth figure and share across party handles.';
    return 'Reshare via official BJP handles; brief state social media teams to add local-language captions.';
  }

  // ── NEGATIVE ─────────────────────────────────────────────────────────────────
  if (s === 'NEGATIVE') {
    if (h.includes('farmer') || h.includes('msp') || h.includes('kisan')) {
      if (h.includes('suicide') || h.includes('death') || h.includes('protest') || h.includes('blockade'))
        return 'Post MSP hike data and PM Kisan disbursement figures on X as a factual counter; do not tag the original post.';
      return 'Counter with NAFED procurement stats and crop insurance coverage numbers on X.';
    }
    if (h.includes('scam') || h.includes('corruption') || h.includes('bribery') || h.includes('kickback')) {
      if (src.includes('congress') || src.includes('aap') || src.includes('wire') || src.includes('quint'))
        return 'Thread the official investigation status with source links; counter with documented opposition scam record.';
      return 'Skip public reply; screenshot and archive — deploy factual rebuttal only if a wire picks it up.';
    }
    if (h.includes('unemployment') || h.includes('jobs') || h.includes('layoff') || h.includes('jobless'))
      return 'Post PLFS employment data and PLI scheme job-creation numbers as a BJP fact-card on X.';
    if (h.includes('price') || h.includes('inflation') || h.includes('onion') || h.includes('petrol') || h.includes('fuel'))
      return 'Counter with state-wise price stabilisation data; quote official buffer-stock deployment numbers.';
    if (h.includes('electric') || h.includes('power') || h.includes('outage') || h.includes('load'))
      return 'Post verified restoration schedule data on X; do not amplify if traction is under 500 impressions.';
    if (src.includes('congress') || src.includes('inc') || src.includes('aam aadmi') || src.includes('tmc') || src.includes('samajwadi'))
      return 'Skip reply; log it — prepare a fact-card rebuttal to deploy if engagement crosses threshold.';
    if (h.includes('riot') || h.includes('communal') || h.includes('violence') || h.includes('attack'))
      return 'Route immediately to BJP spokesperson; do not post independently — coordinate party line first.';
    if (h.includes('health') || h.includes('hospital') || h.includes('vaccine') || h.includes('covid'))
      return 'Counter with vaccination coverage data and health infrastructure milestones in a BJP fact-thread.';
    return 'Ignore publicly; screenshot and archive for escalation watch if traction builds.';
  }

  // ── NEUTRAL ───────────────────────────────────────────────────────────────────
  if (h.includes('election') || h.includes('poll') || h.includes('seat') || h.includes('campaign'))
    return 'Insert BJP booth-connect data into this conversation thread via a quote-tweet from the state handle.';
  if (h.includes('scheme') || h.includes('launch') || h.includes('initiative') || h.includes('program'))
    return 'Add verifiable beneficiary figures and implementation data in a reply to steer the narrative.';
  if (h.includes('infrastructure') || h.includes('project') || h.includes('tender'))
    return 'Share BJP-led infrastructure milestone comparison card across state handles.';
  if (src.includes('bjp') || src.includes('pmo'))
    return 'Amplify through regional BJP handles with a translated caption for local audiences.';
  return 'Quote-tweet from official BJP state handle with a relevant data point to establish context.';
}

// ─── Single issue row ─────────────────────────────────────────────────────────

function IssueRow({ item, isLast }: { item: IssueItem; isLast: boolean }) {
  return (
    <div className={`${!isLast ? 'pb-4 mb-4 border-b border-gray-100' : ''}`}>
      {/* Area badge + Issue */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[9px] font-black text-white bg-[#1a2744] uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0">
          {item.area}
        </span>
      </div>
      <p className="text-sm font-bold text-[#1a2744] leading-snug mb-1">
        {item.issue}
      </p>

      {/* Impact */}
      {item.impact && (
        <p className="text-[11px] text-gray-500 leading-relaxed mb-1">
          <span className="font-semibold text-gray-400">Impact:</span> {item.impact}
        </p>
      )}

      {/* Evidence */}
      {item.evidence && (
        <p className="text-[10px] font-semibold text-gray-400 mb-1">
          Evidence: <span className="text-[#FF9933]">{item.evidence}</span>
        </p>
      )}

      {/* Suggested Action */}
      {item.suggestedAction && (
        <p className="text-[11px] text-[#1a2744] leading-relaxed whitespace-pre-line">
          <span className="text-[9px] font-black text-[#FF9933] uppercase tracking-widest mr-1">Action:</span>
          {item.suggestedAction}
        </p>
      )}
    </div>
  );
}

// ─── PDF helpers ──────────────────────────────────────────────────────────────

function buildNewsItemHTML(item: NewsItem): string {
  return `
    <div class="news-item">
      <p class="news-title">${item.headline}</p>
      <p class="news-source">Posted by: <span class="source-handle">${item.source}</span></p>
      ${item.summary ? `<p class="news-brief">${item.summary}</p>` : ''}
    </div>
  `;
}

function buildIssueItemHTML(item: IssueItem): string {
  return `
    <div class="issue-item">
      <p class="issue-area">${item.area}</p>
      <p class="issue-title">${item.issue}</p>
      ${item.impact ? `<p class="issue-brief"><span class="label-text">Impact:</span> ${item.impact}</p>` : ''}
      ${item.evidence ? `<p class="issue-source">Evidence: <span class="source-handle">${item.evidence}</span></p>` : ''}
      ${item.suggestedAction ? `<p class="issue-action"><span class="action-label-text">Action:</span> ${item.suggestedAction.replace(/\n/g, '<br/>')}</p>` : ''}
    </div>
  `;
}

function buildPDFHTML(briefing: BriefingOutput): string {
  const dateStr = new Date().toLocaleString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const positive = briefing.topNews.positive || [];
  const negative = briefing.topNews.negative || [];
  const neutral = briefing.topNews.neutral || [];
  const issues = briefing.issues || [];

  const positiveHTML = positive.length > 0
    ? positive.map(buildNewsItemHTML).join('')
    : '<p class="no-items">No positive items available for this date range.</p>';

  const negativeHTML = negative.length > 0
    ? negative.map(buildNewsItemHTML).join('')
    : '<p class="no-items">No negative items available for this date range.</p>';

  const neutralHTML = neutral.length > 0
    ? neutral.map(buildNewsItemHTML).join('')
    : '<p class="no-items">No neutral items available for this date range.</p>';

  const issuesHTML = issues.length > 0
    ? issues.map(buildIssueItemHTML).join('')
    : '<p class="no-items">No issues requiring attention identified.</p>';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BJP Intelligence Brief</title>
  <style>
    @page { margin: 1.5cm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1a2744;
      line-height: 1.6;
      max-width: 820px;
      margin: 0 auto;
      padding: 20px;
      font-size: 13px;
    }
    .header-bar {
      border-bottom: 3px solid #FF9933;
      padding-bottom: 12px;
      margin-bottom: 6px;
    }
    h1 { font-size: 22px; font-weight: 900; color: #1a2744; margin: 0 0 4px 0; }
    .meta { font-size: 11px; color: #888; margin-bottom: 28px; }
    .section-heading {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #1a2744;
      border-left: 3px solid #FF9933;
      padding-left: 8px;
      margin: 28px 0 14px 0;
    }
    .section-heading:first-of-type { margin-top: 0; }
    /* News items (positive / negative / neutral) */
    .news-item {
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f0f0f0;
    }
    .news-item:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
    .news-title { font-weight: 700; font-size: 13px; color: #1a2744; margin: 0 0 3px 0; }
    .news-source { font-size: 10px; color: #999; font-weight: 600; margin: 0 0 3px 0; }
    .news-brief { font-size: 12px; color: #555; margin: 0; }
    .source-handle { color: #FF9933; }
    /* Issue items */
    .issue-item {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    .issue-item:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
    .issue-area { display: inline-block; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.07em; color: #fff; background: #1a2744; border-radius: 999px; padding: 1px 7px; margin: 0 0 4px 0; }
    .issue-title { font-weight: 700; font-size: 13px; color: #1a2744; margin: 0 0 3px 0; }
    .issue-source { font-size: 10px; color: #999; font-weight: 600; margin: 0 0 3px 0; }
    .issue-brief { font-size: 12px; color: #555; margin: 0 0 4px 0; }
    .label-text { font-weight: 600; color: #888; }
    .issue-action { font-size: 12px; color: #1a2744; margin: 0; }
    .action-label-text {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #FF9933;
      margin-right: 4px;
    }
    .no-items { font-style: italic; color: #aaa; font-size: 12px; margin: 0; }
    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #aaa;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <h1>BJP Political Intelligence Brief</h1>
  </div>
  <p class="meta">BJP Social Media Cell &nbsp;|&nbsp; Generated: ${dateStr}</p>

  <p class="section-heading">Positive News</p>
  ${positiveHTML}

  <p class="section-heading">Negative News</p>
  ${negativeHTML}

  <p class="section-heading">Neutral News</p>
  ${neutralHTML}

  <p class="section-heading">Issues Requiring Attention</p>
  ${issuesHTML}

  <div class="footer">
    <span>BJP Political Intelligence System</span>
    <span>CONFIDENTIAL</span>
  </div>
</body>
</html>`;
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function IssuesRequiringAttention({ briefing }: { briefing: BriefingOutput | null }) {
  if (!briefing) return null;

  const allItems: IssueItem[] = briefing.issues || [];
  const totalItems = allItems.length;

  const handleExportPDF = () => {
    const html = buildPDFHTML(briefing);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 250);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <span className="text-[#FF9933]">&#9888;</span>
          <h2 className="text-base font-bold text-[#1a2744]">Issues Requiring Attention</h2>
        </div>
        <span className="text-xs text-gray-400 font-medium">{totalItems} items tracked</span>
      </div>

      {/* Single tile — all items together */}
      <div className="p-6">
        {totalItems === 0 ? (
          <p className="text-sm text-gray-400 font-medium text-center py-4">
            No items available.
          </p>
        ) : (
          <>
            <div>
              {allItems.map((item, idx) => (
                <IssueRow
                  key={idx}
                  item={item}
                  isLast={idx === allItems.length - 1}
                />
              ))}
            </div>

            <div className="flex justify-center pt-6 mt-4 border-t border-gray-100">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-3 bg-[#1a2744] hover:bg-[#243264] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                Export Brief as PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
