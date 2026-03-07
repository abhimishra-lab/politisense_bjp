import { GoogleGenAI } from '@google/genai';
import { StructuredData, BriefingOutput, Scope, NewsItem, IssueItem, PerformanceRating } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_KEY: string = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY ?? '') : '');

// ─── Types ────────────────────────────────────────────────────────────────────
interface StateMock {
  positive: Partial<NewsItem>[];
  neutral: Partial<NewsItem>[];
  negative: Partial<NewsItem>[];
  ratings: Partial<PerformanceRating>[];
  issues: IssueItem[];
  sentiment: { pos: number; neu: number; neg: number };
  wins: string[];
  concerns: string[];
  actions: string[];
}

// ─── Uttar Pradesh ────────────────────────────────────────────────────────────
const UP_MOCK: StateMock = {
  positive: [
    { headline: 'Yogi govt launches rural broadband for 1 crore farmers in UP', source: 'Dainik Jagran', url: 'https://www.jagran.com/uttar-pradesh/', time: '2026-02-19T06:00:00Z', summary: 'High-speed internet to reach remote villages across UP by year-end.', bjpResponse: ['Share this alongside a state-level district coverage map on X and Instagram.', 'Tag district BJP handles and ask them to reshare with local farmer photos.', 'Create a 30-second reel showing farmers accessing government schemes online.'] },
    { headline: 'Purvanchal Expressway cuts goods transport time by half', source: 'Hindustan Times', url: 'https://www.hindustantimes.com/cities/lucknow-news', time: '2026-02-19T07:30:00Z', summary: 'Expressway slashes Lucknow–Gorakhpur freight cost by 30%.', bjpResponse: ['Publish a before-and-after freight cost comparison graphic on X and Facebook.', 'Share trader and logistics company testimonials as quote-cards.', 'Amplify through UP BJP handle with "Yogi Delivers Connectivity" narrative framing.'] },
    { headline: 'Agra Tourism Circuit draws record visitors this peak season', source: 'Times of India', url: 'https://timesofindia.indiatimes.com/city/agra', time: '2026-02-19T08:15:00Z', summary: 'Taj Mahal and Agra Fort log highest footfall in 5 years.', bjpResponse: ['Release drone visuals of Taj footfall peak on Instagram and YouTube today.', 'Create a short reel with visitor testimonials for the BJP4UP handle.', 'Tag Tourism Ministry handle to cross-amplify with national reach.'] },
    { headline: 'BJP booth connect in Lucknow achieves 100% ward coverage', source: 'BJP4India Twitter', url: 'https://x.com/BJP4India', time: '2026-02-19T09:00:00Z', summary: 'Grassroots outreach complete ahead of local body elections.', bjpResponse: ['Highlight 100% ward coverage as a party organisation story on X with a visual data card.', 'Post a recognition post for top-performing booth workers by name and ward.', 'Brief all 75 district handles to post their local booth coverage numbers today.'] },
    { headline: 'UP launches one-stop grievance portal for 25 crore citizens', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T10:30:00Z', summary: 'Citizens can file and track complaints across 75 districts online.', bjpResponse: ['Create a 60-second explainer video on how to use the portal and post on YouTube Shorts.', 'Share a graphic with portal stats and district coverage across all BJP UP handles.', 'Amplify through UP influencer network with real citizen usage testimonials.'] },
  ],
  neutral: [
    { headline: 'UP cabinet reviews backward district development roadmap', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T10:00:00Z', summary: 'State cabinet evaluates development plans across 50 backward districts.', bjpResponse: ['Post a factual update on the backward district roadmap with key metrics and district names.', 'Hold proactive amplification; respond with data only if opposition misrepresents this story.'] },
    { headline: 'Kashi Vishwanath corridor draws investor interest from UP diaspora', source: 'The Hindu', url: 'https://www.thehindu.com/news/national/uttar-pradesh/', time: '2026-02-19T11:30:00Z', summary: 'Overseas investors express interest in Varanasi hospitality sector.', bjpResponse: ['Share diaspora interest story with "Kashi Goes Global" framing on X.', 'Tag BJP business cell handles for targeted amplification among NRI audience networks.'] },
    { headline: 'Lucknow Metro Phase 2 DPR submitted for Centre approval', source: 'NDTV', url: 'https://www.ndtv.com/india-news', time: '2026-02-19T12:00:00Z', summary: 'Phase 2 will add 26 km of new metro network to Lucknow city.', bjpResponse: ['Post a DPR progress update graphic showing Lucknow Metro Phase 2 route and timeline.', 'Frame as "BJP Delivering Urban Mobility" with factual data — no speculation on approval dates.'] },
    { headline: 'UP government revises minimum wage for construction workers', source: 'Business Standard', url: 'https://www.business-standard.com/economy', time: '2026-02-19T13:00:00Z', summary: 'Revised wage structure effective April 1; 40 lakh workers to benefit.', bjpResponse: ['Publish a worker-centric infographic showing the wage increase and affected worker count.', 'Share alongside BJP\'s broader labour welfare record as a Labour Day-ready content asset.'] },
    { headline: 'UPSIDA invites bids for new industrial park near Noida', source: 'Financial Express', url: 'https://www.financialexpress.com/economy/', time: '2026-02-19T14:00:00Z', summary: 'New industrial cluster to attract electronics and textile industries.', bjpResponse: ['Post investment news as part of BJP\'s UP industrialisation series on X.', 'No mass amplification needed at this stage; keep in reserve for economic narrative content.'] },
  ],
  negative: [
    { headline: 'Power outages hit UP farmers during wheat sowing season', source: 'NDTV', url: 'https://www.ndtv.com/india-news', time: '2026-02-19T08:00:00Z', summary: '12 UP districts report 8-hour daily cuts affecting irrigation pumps.', bjpResponse: ['Post UPPCL\'s exact restoration schedule for each district to preempt panic spread on X.', 'Rebut opposition framing by sharing the planned load-management schedule as evidence of control.', 'If traction remains low, do not amplify — monitor sentiment for 6 hours before next post.'] },
    { headline: 'Sugarcane farmers await ₹3200 crore in pending mill arrears', source: 'India Today', url: 'https://www.indiatoday.in/india', time: '2026-02-19T10:30:00Z', summary: 'Western UP sugarcane belt seeing rising anger over unpaid mill dues.', bjpResponse: ['Post official data on previously cleared arrear amounts to provide factual counter-context.', 'Counter narrative with BJP\'s farmer welfare record — PM Kisan and MSP increases — as a comparison visual.', 'Brief BJP spokesperson in western UP to go on record with a verifiable payment timeline.'] },
    { headline: 'Opposition targets CM Yogi over law & order situation in Prayagraj', source: 'Amar Ujala', url: 'https://www.amarujala.com/uttar-pradesh', time: '2026-02-19T09:45:00Z', summary: 'SP demands accountability after reported crime spike in Prayagraj division.', bjpResponse: ['Share official crime statistics for Prayagraj district as factual counter to SP claims on X and Facebook.', 'Post verified data showing overall UP crime rate trend downward under CM Yogi since 2017.', 'Send talking points with verified UP Police data to BJP MLAs in Prayagraj for coordinated rebuttal.'] },
    { headline: 'Flooding concerns mount in eastern UP ahead of monsoon pre-season', source: 'Dainik Jagran', url: 'https://www.jagran.com/uttar-pradesh/', time: '2026-02-19T11:00:00Z', summary: 'Ghaghara and Rapti rivers showing unusual flow — embankments under review.', bjpResponse: ['Post embankment inspection status updates to demonstrate proactive Yogi government action.', 'No crisis amplification; share factual flood-preparedness steps as the state\'s response narrative.', 'Counter if opposition amplifies — post data on riverbank work done since 2017.'] },
    { headline: 'UP school dropout rate rises in 15 Bundelkhand districts', source: 'The Hindu', url: 'https://www.thehindu.com/news/national/uttar-pradesh/', time: '2026-02-19T12:30:00Z', summary: 'NGOs report rising dropout rates among girls in drought-hit Bundelkhand.', bjpResponse: ['Counter with Kanya Sumangala Yojana enrolment numbers and impact statistics posted on X.', 'Post girl education success stories from Bundelkhand districts as visual content.', 'Brief UP Education Cell handles to share scheme data in local dialect for Bundeli audience.'] },
  ],
  ratings: [
    { category: 'Infrastructure', score: 8, label: 'Strong' },
    { category: 'Agriculture', score: 3, label: 'Needs Attention' },
    { category: 'Law & Order', score: 6, label: 'Moderate' },
    { category: 'Social Welfare', score: 7, label: 'Good' },
    { category: 'Education', score: 5, label: 'Moderate' },
  ],
  issues: [
    { area: 'Agriculture', issue: 'Sugarcane arrear payments pending from mills', impact: 'Farmer anger growing in western UP — possible electoral impact', evidence: '₹3200 Cr unpaid, India Today and local TV coverage', suggestedAction: 'Engage UP sugar mill federation to release at least 50% arrears this week; CM to address farmers publicly in Muzaffarnagar.' },
    { area: 'Power', issue: 'Irrigation power cuts during peak sowing window', impact: 'Direct hit on wheat crop yield; high rural visibility', evidence: '12 districts reporting 8-hour daily outages, NDTV coverage', suggestedAction: 'Issue UPPCL circular: zero agriculture outages 6 AM–6 PM for next 30 days; track compliance district-wise.' },
    { area: 'Education', issue: 'Rising girl dropout rates in Bundelkhand', impact: 'Long-term human development setback; opposition ammunition', evidence: 'NGO reports, The Hindu coverage across 15 districts', suggestedAction: 'Launch emergency transport-to-school scheme for girls in 15 Bundelkhand districts; appoint district nodal officers by end of week.' },
  ],
  sentiment: { pos: 54, neu: 27, neg: 27 },
  wins: [
    'Rural broadband rollout receiving strong positive coverage in Dainik Jagran and local media',
    'Purvanchal Expressway trade story trending positively across social platforms',
    'Agra Tourism Circuit boost is a visible governance win — push through district BJP handles',
    'Citizen grievance portal is a good digital governance story for urban audiences',
  ],
  concerns: [
    '**Sugarcane Arrears:** ₹3200 Cr unpaid — high anger in western UP farmer belt',
    '**Irrigation Power Cuts:** 8-hour outages during peak sowing — directly impacts wheat yield',
    '**Opposition L&O Narrative:** SP amplifying Prayagraj crime incidents — needs structured rebuttal',
    '**Bundelkhand Dropouts:** Rising girl dropout trend requires urgent district-level action',
  ],
  actions: [
    'Direct sugar mills to release 50% pending arrears by end of week; announce via CM social media',
    'Issue UPPCL emergency order: zero agriculture power cuts 6 AM–6 PM for 30 days',
    'Brief BJP MLAs in Prayagraj with verified crime data to counter opposition claims publicly',
    'Launch transport-to-school scheme for girls in Bundelkhand; appoint district nodal officers',
    'Amplify Expressway and tourism stories through all 75 UP district BJP handles today',
  ],
};

// ─── Maharashtra ──────────────────────────────────────────────────────────────
const MH_MOCK: StateMock = {
  positive: [
    { headline: 'Mahayuti govt secures ₹1.2 lakh crore investment at WEF Davos', source: 'Hindustan Times', url: 'https://www.hindustantimes.com/cities/mumbai-news', time: '2026-02-19T07:00:00Z', summary: 'Maharashtra MoUs to generate 4 lakh manufacturing and services jobs.', bjpResponse: ['Create a jobs-per-district breakdown infographic and push to all Maharashtra BJP handles now.', 'Share MoU job creation timeline as part of "Mahayuti Delivers" campaign across X and Instagram.', 'Tag allied Shinde camp handles to cross-amplify as a coalition governance achievement.'] },
    { headline: 'Mumbai Metro Line 3 crosses 2 lakh daily ridership milestone', source: 'Maharashtra Times', url: 'https://maharashtratimes.com/maharashtra', time: '2026-02-19T08:30:00Z', summary: 'Underground Metro exceeds projections in first full month of operations.', bjpResponse: ['Release ridership milestone video with live Metro footage on Instagram and YouTube today.', 'Create a comparison post — Mumbai Metro ridership 6 months ago vs today — for X.', 'Post commuter testimonials as quote-cards on Facebook for reaching Maharashtra voter base.'] },
    { headline: 'BJP-Shinde alliance booth connect in Pune reaches 95% of wards', source: 'BJP4India Twitter', url: 'https://x.com/BJP4India', time: '2026-02-19T09:00:00Z', summary: 'Strong Alliance outreach visible in Pune ahead of BMC polls.', bjpResponse: ['Amplify 95% ward coverage as coalition strength story across all Pune BJP handles today.', 'Post a visual ward coverage map on X with #PuneForMahayuti hashtag.', 'Send this success story to BJP4India national handle for national-level amplification.'] },
    { headline: 'Maharashtra records highest-ever FDI inflow in FY26 at $18 billion', source: 'Financial Express', url: 'https://www.financialexpress.com/economy/', time: '2026-02-19T06:30:00Z', summary: 'State leads all Indian states in FDI attraction for third straight year.', bjpResponse: ['Publish state-by-state FDI comparison chart showing Maharashtra at #1 for three consecutive years.', 'Share on X: "Investors trust Maharashtra, investors trust Mahayuti" — keep framing simple.', 'Brief business journalists with data for editorial pickup following the social media push.'] },
    { headline: 'Nagpur–Mumbai Samruddhi Expressway boosts Orange City economy', source: 'Times of India', url: 'https://timesofindia.indiatimes.com/city/nagpur', time: '2026-02-19T10:00:00Z', summary: 'Real estate and logistics sectors seeing 20% growth near Samruddhi Expressway.', bjpResponse: ['Post growth data with real business examples from Nagpur and Wardha on X.', 'Share a before-and-after connectivity visual for Vidarbha region on Instagram.', 'Tag CM Fadnavis\'s handle for cross-amplification to his audience.'] },
  ],
  neutral: [
    { headline: 'Fadnavis reviews Samruddhi Expressway extension towards Nagpur', source: 'The Hindu', url: 'https://www.thehindu.com/news/national/', time: '2026-02-19T11:00:00Z', summary: 'State evaluates ₹8000 Cr extension plan for east Maharashtra connectivity.', bjpResponse: ['Post the extension plan update as "Mahayuti\'s Vision for East Maharashtra" progress story.', 'Keep factual with key data — no electoral framing needed at this planning stage.'] },
    { headline: 'OBC census data to shape welfare schemes in rural Maharashtra', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T12:00:00Z', summary: 'State OBC survey to guide benefit targeting across 200 talukas.', bjpResponse: ['Post factual survey progress update and expected beneficiary count across BJP Maharashtra handles.', 'Frame as proof of BJP\'s commitment to data-driven OBC welfare without over-amplifying.'] },
    { headline: 'MSRDC to upgrade 3500 km of state highways in 2-year plan', source: 'Business Standard', url: 'https://www.business-standard.com/economy', time: '2026-02-19T13:00:00Z', summary: 'Road improvement project will connect regional cities to national grid.', bjpResponse: ['Share district-level connectivity status with regional BJP handles for local resonance.', 'No national push needed at this stage — regional handles should amplify with local angles.'] },
    { headline: 'Pune IT corridor witnesses 15% employment growth in Q3 FY26', source: 'Mint', url: 'https://www.livemint.com/industry', time: '2026-02-19T09:30:00Z', summary: 'Hinjewadi and Kharadi IT parks see rapid headcount expansion.', bjpResponse: ['Share employment growth chart for Pune IT corridor on LinkedIn and X as an urban governance win.', 'Post with "Mahayuti Delivers for Pune\'s Youth" framing targeting educated urban voter segment.'] },
    { headline: 'Maharashtra launches single-window clearance for MSME sector', source: 'Economic Times', url: 'https://economictimes.indiatimes.com/small-biz', time: '2026-02-19T14:30:00Z', summary: 'New portal brings all 18 MSME approvals under one digital interface.', bjpResponse: ['Create a simple explainer visual on the new MSME portal for small business owners on X and Facebook.', 'Share with MSME and trader associations for organic amplification beyond BJP handles.'] },
  ],
  negative: [
    { headline: 'Maratha quota agitation resumes with Marathwada blockades', source: 'NDTV', url: 'https://www.ndtv.com/india-news', time: '2026-02-19T09:30:00Z', summary: 'Manoj Jarange-Patil resumes fast as government notification deadline passes.', bjpResponse: ['Post BJP\'s official OBC-EWS roadmap with a factual timeline — one clear, structured statement on X.', 'Counter with CM Fadnavis\'s direct video address to the Maratha community on YouTube and X.', 'Do not engage trolls amplifying Jarange-Patil\'s statements — issue one factual counter and stop.'] },
    { headline: 'Nashik onion farmers face heavy losses as export ban continues', source: 'India Today', url: 'https://www.indiatoday.in/india', time: '2026-02-19T10:15:00Z', summary: 'Mandi prices at ₹3–4/kg while imports continue — severe farmer distress.', bjpResponse: ['Post data showing how BJP government cleared previous onion export bans as counter-context.', 'Brief BJP Kisan Morcha handle to post farmer support measures already deployed in Nashik.', 'Do not amplify — this story has high traction; counter must be surgical and fact-based only.'] },
    { headline: 'Vidarbha farmers protest over delayed cotton bonus payments', source: 'Dainik Jagran', url: 'https://www.jagran.com/maharashtra/', time: '2026-02-19T11:00:00Z', summary: 'Vidarbha cotton growers block Amravati-Nagpur highway over ₹650 Cr dues.', bjpResponse: ['Share CCI cotton procurement data showing BJP\'s MSP action already under way in Vidarbha.', 'Counter highway blockade narrative by highlighting BJP farmer schemes in Amravati district.', 'Send counter-messaging brief to Vidarbha BJP handles immediately — do not wait.'] },
    { headline: 'Mumbai auto and taxi drivers call for fare revision protest', source: 'Hindustan Times', url: 'https://www.hindustantimes.com/cities/mumbai-news', time: '2026-02-19T12:00:00Z', summary: '2 lakh drivers threaten city-wide strike over CNG price pressures.', bjpResponse: ['Post Mahayuti\'s stance on transport worker welfare with actual data on CNG subsidy steps taken.', 'No amplification of strike threat — respond with one factual post only if traction increases.'] },
    { headline: 'Opposition demands probe into Dharavi redevelopment land deal', source: 'The Wire', url: 'https://thewire.in/politics', time: '2026-02-19T13:00:00Z', summary: 'Congress alleges irregularities in Dharavi land allocation to Adani group.', bjpResponse: ['Post official MHADA/BMC project approval documents as a factual X thread to counter the narrative.', 'Keep response sharp and document-backed — do not over-explain or use defensive language.', 'No response required on The Wire platform directly; one post on BJP handles is sufficient.'] },
  ],
  ratings: [
    { category: 'Urban Development', score: 8, label: 'Strong' },
    { category: 'Investment & Industry', score: 9, label: 'Excellent' },
    { category: 'Agriculture', score: 3, label: 'Needs Attention' },
    { category: 'Social Harmony', score: 4, label: 'Moderate' },
    { category: 'Connectivity', score: 7, label: 'Good' },
  ],
  issues: [
    { area: 'Social', issue: 'Maratha quota agitation intensifying', impact: 'Road blockades in Marathwada; coalition stability under pressure', evidence: 'Jarange-Patil fast resumed, NDTV breaking coverage', suggestedAction: 'CM Fadnavis to hold emergency dialogue with Jarange-Patil; share written OBC-EWS roadmap within 48 hours.' },
    { area: 'Agriculture', issue: 'Onion export ban and Vidarbha cotton arrears', impact: 'Dual agricultural distress — two farmer communities simultaneously angry', evidence: 'Nashik mandi ₹3–4/kg, Vidarbha highway blockade reported', suggestedAction: 'Pursue partial onion export permit from Centre; clear Vidarbha cotton bonus within 7 days as state priority.' },
    { area: 'Urban', issue: 'Mumbai transport workers strike threat', impact: 'City mobility risk — negative optics for Mahayuti urban governance', evidence: '2 lakh auto/taxi drivers threatening week-long strike', suggestedAction: 'Transport Commissioner to hold emergency fare revision talks with driver unions before Thursday.' },
  ],
  sentiment: { pos: 52, neu: 28, neg: 27 },
  wins: [
    'Davos investment wins — amplify MoU job creation timelines through all state BJP social channels',
    'Mumbai Metro Line 3 ridership is a tangible urban governance win with strong video potential',
    'Maharashtra FDI #1 ranking — push to national business press as governance success story',
    'Pune IT growth is a high-credibility positive story for urban, educated voter segments',
  ],
  concerns: [
    '**Maratha Agitation:** Jarange-Patil fast resumed — coalition risk and high media visibility',
    '**Onion + Cotton Farmers:** Two major farm communities simultaneously in distress',
    '**Mumbai Strike Threat:** 2 lakh transport workers could trigger negative urban news cycle',
    '**Dharavi Probe Demand:** Opposition narrative gaining social media traction',
  ],
  actions: [
    'CM to personally meet Jarange-Patil with written OBC notification timeline',
    'Coordinate with Centre for partial onion export relaxation; clear Vidarbha cotton bonus',
    'Transport Commissioner to convene emergency fare talks before Thursday',
    'BJP spokesperson to refute Dharavi claims with verified project data',
    'Push Davos MoU stories with per-district job numbers through all state coalition handles',
  ],
};

// ─── Gujarat ──────────────────────────────────────────────────────────────────
const GJ_MOCK: StateMock = {
  positive: [
    { headline: 'GIFT City attracts 50 new global financial firms in FY26', source: 'Financial Express', url: 'https://www.financialexpress.com/economy/', time: '2026-02-19T07:00:00Z', summary: 'GIFT City crosses 500-firm milestone; PM lauds Gujarat\'s financial hub progress.', bjpResponse: ['Publish the 100-to-500 firm milestone progression as a visual timeline on X and Instagram.', 'Share as "Gujarat\'s Global Finance Story" across all Gujarat BJP handles today.', 'Tag PM\'s official handle for national amplification — GIFT City is directly linked to PM\'s vision.'] },
    { headline: 'Statue of Unity reaches 1 crore visitors, boosts tribal economy', source: 'Times of India', url: 'https://timesofindia.indiatimes.com/city/ahmedabad', time: '2026-02-19T08:00:00Z', summary: 'Ekta Nagar tourism generates ₹1200 crore for local tribal economy.', bjpResponse: ['Release a recap reel celebrating 1 crore visitors with economic impact data on YouTube and Instagram.', 'Post tribal economy income data alongside the milestone to counter any opposition framing.', 'Tag BJP Tribal Morcha for cross-amplification targeting tribal community audiences.'] },
    { headline: 'Gujarat tops national Ease of Doing Business ranking 2026', source: 'Business Standard', url: 'https://www.business-standard.com/economy', time: '2026-02-19T09:30:00Z', summary: 'Gujarat ranked #1 for third consecutive year in national EoDB assessment.', bjpResponse: ['Post side-by-side comparison showing Gujarat\'s 3-consecutive-year #1 ranking on X.', 'Brief CM Bhupendrabhai Patel\'s team to issue a short quote-card for social amplification.', 'Push to business press and trade associations for editorial coverage following digital push.'] },
    { headline: 'Surat Diamond Bourse fully operational, hosts global gem traders', source: 'Economic Times', url: 'https://economictimes.indiatimes.com/small-biz', time: '2026-02-19T10:00:00Z', summary: 'World\'s largest diamond trading hub in Surat sees 90% occupancy by global traders.', bjpResponse: ['Post 90% occupancy milestone with trader testimonials from Surat as visual content on X.', 'Tie the story to PM Modi\'s Surat inauguration visit for BJP legacy framing.', 'Share with Surat-based business influencers for organic amplification beyond party handles.'] },
    { headline: 'Gujarat\'s renewable energy capacity crosses 30GW milestone', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T11:00:00Z', summary: 'Solar and wind power combine to make Gujarat India\'s top clean energy state.', bjpResponse: ['Publish Gujarat\'s clean energy progression visual showing state-wise comparison on X and Instagram.', 'Share as BJP\'s environmental delivery story targeting urban and educated voter audiences.', 'Tag Centre\'s renewable energy handles for national cross-amplification through official channels.'] },
  ],
  neutral: [
    { headline: 'Ahmedabad–Mumbai bullet train crosses 60% land acquisition', source: 'The Hindu', url: 'https://www.thehindu.com/news/national/gujarat/', time: '2026-02-19T10:00:00Z', summary: 'NHSRCL accelerates work on Gujarat section with 60% land acquired.', bjpResponse: ['Post construction milestone with a visual timeline showing land acquisition progress on X.', 'Frame as a national project with BJP governance urgency — keep factual, no delay narrative.'] },
    { headline: 'Gujarat to set up semiconductor unit under national policy', source: 'Business Standard', url: 'https://www.business-standard.com/economy', time: '2026-02-19T11:30:00Z', summary: 'State finalising location near Dholera SIR for fab unit under PLI scheme.', bjpResponse: ['Share Dholera SIR semiconductor story for targeted amplification among tech and business audiences.', 'Frame as Gujarat being first-mover in PM\'s Make-in-India semiconductor mission.'] },
    { headline: 'Vadodara Smart City project completes Phase 1 implementation', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T12:30:00Z', summary: 'Traffic, water, and waste management systems digitised in Vadodara.', bjpResponse: ['Release Phase 1 achievements with before-and-after utility management visuals on X and Instagram.', 'Tag Vadodara BJP municipal handle for local amplification of this civic win.'] },
    { headline: 'Dholera SIR attracts 12 new anchor industries in FY26', source: 'Financial Express', url: 'https://www.financialexpress.com/economy/', time: '2026-02-19T13:00:00Z', summary: 'Greenfield industrial city starts operations with 12 companies commencing work.', bjpResponse: ['Post a visual breakdown of the 12 industries starting in Dholera with sector-wise jobs data.', 'Targeted amplification through business channels — no mass push needed at this stage.'] },
    { headline: 'Gujarat fisheries ministry upgrades 40 coastal jetties', source: 'Hindustan Times', url: 'https://www.hindustantimes.com/india-news', time: '2026-02-19T14:00:00Z', summary: 'Jetty upgrades to improve safety and income for 5 lakh coastal fishermen.', bjpResponse: ['Share the 40-jetty upgrade as a coastal welfare story with fishing community images on X.', 'Tag BJP coastal district handles in Saurashtra for local-level amplification and resonance.'] },
  ],
  negative: [
    { headline: 'Porbandar fishermen demand action on maritime conflict zone', source: 'NDTV', url: 'https://www.ndtv.com/india-news', time: '2026-02-19T11:00:00Z', summary: 'Families of detained fishermen demand government intervention at sea border.', bjpResponse: ['Post BJP\'s immediate outreach to affected families on X — show empathy and action, not defence.', 'Brief Porbandar BJP MP to release a personal video solidarity message for X and YouTube today.', 'Run "We Stand With Our Fishermen" supportive messaging across Gujarat BJP coastal district handles.'] },
    { headline: 'Groundwater depletion crisis hits 200 north Gujarat villages', source: 'India Today', url: 'https://www.indiatoday.in/india', time: '2026-02-19T09:00:00Z', summary: 'Water table falling 2–3 meters annually in Patan and Banaskantha districts.', bjpResponse: ['Post Atal Bhujal Yojana steps already under way in north Gujarat as factual counter to crisis narrative.', 'Create a "What BJP Is Doing For Water" visual specifically for Patan-Banaskantha belt.', 'Low-traction event currently — hold response; do not amplify the negative story.'] },
    { headline: 'Cotton farmers in Saurashtra upset over below-MSP prices', source: 'Dainik Jagran', url: 'https://www.jagran.com/gujarat/', time: '2026-02-19T10:00:00Z', summary: 'Open market prices ₹400 below MSP fuelling resentment in Saurashtra belt.', bjpResponse: ['Post NAFED procurement data and MSP guarantee steps immediately on X and Facebook.', 'Send talking points to Saurashtra BJP MLA handles for coordinated local-level response.', 'Brief BJP Kisan Morcha Gujarat handle with verified price support data for daily posts.'] },
    { headline: 'Opposition accuses state govt of favouring Ambani in gas allocation', source: 'The Wire', url: 'https://thewire.in/politics', time: '2026-02-19T13:00:00Z', summary: 'Congress raises KG basin gas pricing issue in Gujarat assembly session.', bjpResponse: ['Counter with verified KG basin gas pricing documents as a structured X thread.', 'No amplification — The Wire story has limited mass reach; issue one factual rebuttal and stop.', 'Do not engage The Wire handle directly — one clear BJP handles post is sufficient.'] },
    { headline: 'Air quality in Ahmedabad deteriorates in industrial zones', source: 'Hindustan Times', url: 'https://www.hindustantimes.com/cities/ahmedabad-news', time: '2026-02-19T14:30:00Z', summary: 'AQI crosses 250 for 3 consecutive days in Odhav and Vatva industrial areas.', bjpResponse: ['Post Gujarat EPA\'s ongoing industrial inspection data as factual counter on X.', 'Avoid defensive framing — acknowledge AQI concern and share BJP\'s action steps already in place.', 'No major push needed — respond only if mainstream national media picks this story up.'] },
  ],
  ratings: [
    { category: 'Investment & Industry', score: 9, label: 'Excellent' },
    { category: 'Infrastructure', score: 8, label: 'Strong' },
    { category: 'Tourism', score: 8, label: 'Strong' },
    { category: 'Agriculture', score: 5, label: 'Moderate' },
    { category: 'Coastal Safety', score: 4, label: 'Moderate' },
  ],
  issues: [
    { area: 'Coastal', issue: 'Detained fishermen in Pakistani waters', impact: 'Community distress in Saurashtra fishing belt; local MP and MLA pressure', evidence: 'NDTV coverage, MP and MLA representations', suggestedAction: 'CM to personally meet affected families in Porbandar; escalate to MEA for consular contact within 24 hours.' },
    { area: 'Water', issue: 'Groundwater depletion in north Gujarat', impact: 'Long-term agricultural and drinking water crisis building', evidence: '200 villages affected, India Today field report', suggestedAction: 'Launch emergency micro-irrigation expansion in Patan and Banaskantha; activate ATAL Bhujal scheme in affected blocks.' },
    { area: 'Agriculture', issue: 'Cotton prices below MSP in Saurashtra', impact: 'Farmer income hit in BJP stronghold region', evidence: 'Open market at ₹400 below MSP, field reports from Rajkot', suggestedAction: 'Activate NAFED cotton procurement at full MSP in Saurashtra mandis immediately.' },
  ],
  sentiment: { pos: 60, neu: 25, neg: 20 },
  wins: [
    'GIFT City 500-firm milestone — nationally significant investment story, push to business media',
    'Statue of Unity 1 crore visitors — BJP legacy story, ideal for reels and short videos',
    'EoDB #1 ranking for 3rd year — major credibility win for CM Bhupendrabhai Patel',
    'Surat Diamond Bourse and Dholera SIR stories reinforce Gujarat\'s industrial identity',
  ],
  concerns: [
    '**Detained Fishermen:** Saurashtra coastal community under distress — MEA coordination needed',
    '**Groundwater Crisis:** 200 villages in north Gujarat facing depletion — long-term risk',
    '**Saurashtra Cotton Prices:** Below-MSP pricing in BJP stronghold — must correct urgently',
  ],
  actions: [
    'CM to visit Porbandar and meet detained fishermen families; escalate to MEA same day',
    'Activate ATAL Bhujal scheme in Patan and Banaskantha blocks for emergency groundwater work',
    'Direct NAFED to begin MSP cotton procurement in Rajkot and Amreli mandis by end of week',
    'Amplify EoDB rankings and GIFT City milestones across Gujarat BJP social media today',
    'Push Statue of Unity 1 crore milestone with CM video message for social amplification',
  ],
};

// ─── Nationwide ────────────────────────────────────────────────────────────────
const NATIONWIDE_MOCK: StateMock = {
  positive: [
    { headline: 'PM Modi inaugurates 5000 km national highway network across 12 states', source: 'Hindustan Times', url: 'https://www.hindustantimes.com/india-news', time: '2026-02-19T07:00:00Z', summary: 'Major connectivity push covering eastern, western and central India corridors.', bjpResponse: ['Post a state-wise highway inauguration map covering all 12 states on X for maximum reach.', 'Create short state-specific reels for each state and distribute to respective state BJP handles.', 'Tag PM Modi\'s official handle to ensure national amplification from the top.'] },
    { headline: 'India achieves 100GW solar energy milestone 5 years ahead of schedule', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T08:30:00Z', summary: 'PM hails milestone as proof of India\'s renewable energy leadership.', bjpResponse: ['Release India\'s solar energy journey milestone visual — 2014 to 2026 progress chart on all platforms.', 'Brief BJP national spokesperson to give a video byte emphasising PM\'s clean energy leadership.', 'Post India vs global solar comparison to reinforce credibility with educated urban audiences.'] },
    { headline: 'Ayushman Bharat enrolment crosses 30 crore beneficiaries', source: 'Times of India', url: 'https://timesofindia.indiatimes.com/india', time: '2026-02-19T09:00:00Z', summary: 'World\'s largest health insurance scheme adds 2 crore beneficiaries this month.', bjpResponse: ['Publish beneficiary milestone post with real health success stories as testimonials on Instagram.', 'Create district-by-district coverage infographic for all BJP state handles to reshare.', 'Frame as BJP\'s flagship health promise delivered — link to PM health vision campaign series.'] },
    { headline: 'PM Vishwakarma scheme supports 50 lakh artisans with credit & training', source: 'BJP4India Twitter', url: 'https://x.com/BJP4India', time: '2026-02-19T06:30:00Z', summary: 'Unorganised sector workers receive credit and upskilling under signature scheme.', bjpResponse: ['Post artisan testimonials and credit disbursement data across all BJP handles today.', 'Create reels showing artisans using scheme benefits across different states and crafts for Instagram.', 'Brief BJP OBC Morcha and artisan community influencers for targeted amplification.'] },
    { headline: 'India launches dedicated freight corridor between Delhi and Mumbai', source: 'Business Standard', url: 'https://www.business-standard.com/economy', time: '2026-02-19T11:00:00Z', summary: 'Western DFC fully commissioned — logistics cost expected to drop by 20%.', bjpResponse: ['Publish freight corridor operational video showing trains running and logistics savings data.', 'Post trade body and logistics industry reactions as endorsement quotes on X.', 'Frame as Made-in-India infrastructure story with economic data for educated business audience.'] },
  ],
  neutral: [
    { headline: 'Centre reviews Smart Cities Mission progress before final March deadline', source: 'The Hindu', url: 'https://www.thehindu.com/news/national/', time: '2026-02-19T10:00:00Z', summary: 'Cabinet evaluates 100-city implementation with mixed state-level progress.', bjpResponse: ['No proactive push needed — share progress figures on X only if opposition begins attacking outcomes.', 'Reserve data for counter-messaging; keep talking points ready for BJP spokespersons.'] },
    { headline: 'National Water Grid project approved for ₹2 lakh crore outlay', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T12:00:00Z', summary: 'River-linking project to address water stress in western and peninsular India.', bjpResponse: ['Post project details with a beneficiary-states heat map as a factual governance update on X.', 'Frame as BJP\'s long-term water security vision — not a routine approval news item.'] },
    { headline: 'India\'s manufacturing PMI holds steady at 56.5 in January', source: 'Economic Times', url: 'https://economictimes.indiatimes.com/industry', time: '2026-02-19T09:00:00Z', summary: 'Manufacturing activity remains robust — 7th consecutive month of expansion.', bjpResponse: ['Share as economic health proof to counter the unemployment narrative on X and Instagram.', 'Post a PMI chart comparing 2014 vs 2026 average as a BJP economic governance visual.'] },
    { headline: 'Cabinet approves national semiconductor policy Phase 2 funding', source: 'PIB India', url: 'https://pib.gov.in/PressReleasePage.aspx', time: '2026-02-19T13:00:00Z', summary: 'Additional ₹28,000 Cr approved for chip design and fab ecosystem.', bjpResponse: ['Post funding details with domestic chip ecosystem progress visuals on X and LinkedIn.', 'Tag BJP IT Cell handles for amplification among tech community and start-up audiences.'] },
    { headline: 'India signs FTA with EU — detail round of negotiations completed', source: 'Financial Express', url: 'https://www.financialexpress.com/economy/', time: '2026-02-19T14:00:00Z', summary: 'FTA expected to significantly boost Indian textile and pharmaceutical exports.', bjpResponse: ['Create a sector-specific impact visual showing pharma and textile export gains and share with industry influencers.', 'Post as diplomatic and economic win attributing to PM Modi\'s global governance leadership on X.'] },
  ],
  negative: [
    { headline: 'Farmers in Punjab, MP protest over delayed crop insurance payouts', source: 'NDTV', url: 'https://www.ndtv.com/india-news', time: '2026-02-19T09:00:00Z', summary: '₹800 Cr in pending insurance claims — unions threatening rail blockades.', bjpResponse: ['Post verified insurance claim settlement data state-wise to counter the "unpaid arrears" narrative on X.', 'Brief BJP Kisan Morcha to amplify completed claim stories from Punjab and MP with data.', 'Counter rail blockade threat coverage with BJP farmer welfare action steps already in motion.'] },
    { headline: 'Opposition intensifies campaign against new income tax amendments', source: 'Dainik Jagran', url: 'https://www.jagran.com/news/national/', time: '2026-02-19T08:15:00Z', summary: 'INDIA bloc calls for rollback; claims middle-class burden will increase.', bjpResponse: ['Publish a 5-point plain-language explainer on actual tax savings for middle class on X and Instagram.', 'Counter INDIA bloc talking points with a side-by-side comparison of 2014 vs 2026 effective tax rates.', 'Ensure all BJP economic spokespersons are briefed with the same counter-narrative data points today.'] },
    { headline: 'Conflicting unemployment data fuels political war of numbers', source: 'The Wire', url: 'https://thewire.in/economy', time: '2026-02-19T11:00:00Z', summary: 'CMIE vs PLFS data dispute being amplified by opposition on social media.', bjpResponse: ['Post PLFS official data as the authoritative government source on X — establish the benchmark clearly.', 'Publish a BJP comparison graphic calling out CMIE methodology misrepresentation with facts.', 'Counter with GDP growth and job creation statistics that all BJP handles can deploy uniformly today.'] },
    { headline: 'Manipur violence resumes — 3 districts put under curfew', source: 'India Today', url: 'https://www.indiatoday.in/india', time: '2026-02-19T10:00:00Z', summary: 'Fresh ethnic clashes in Kangpokpi district prompt curfew in 3 areas.', bjpResponse: ['Post BJP-led humanitarian relief activities currently active in Kangpokpi on X immediately.', 'Share peace outreach and community work by BJP state leadership in Manipur as the narrative.', 'Do not amplify curfew news further — one factual BJP action post is sufficient, no further engagement.'] },
    { headline: 'Rising onion and tomato prices spark consumer protests in metros', source: 'Hindustan Times', url: 'https://www.hindustantimes.com/india-news', time: '2026-02-19T12:30:00Z', summary: 'Retail vegetable prices 60–80% above seasonal average in Delhi, Mumbai.', bjpResponse: ['Post Centre\'s price stabilisation steps already in motion — NAFED buffer stock deployment — as factual counter.', 'Share state-wise price charts showing stabilisation in BJP-governed states vs non-BJP states.', 'Counter the "BJP doing nothing" narrative with a 2-point verified data visual on X.'] },
  ],
  ratings: [
    { category: 'Infrastructure', score: 8, label: 'Strong' },
    { category: 'Economy', score: 5, label: 'Moderate' },
    { category: 'Agriculture', score: 3, label: 'Needs Attention' },
    { category: 'Social Welfare', score: 7, label: 'Good' },
    { category: 'Internal Security', score: 4, label: 'Moderate' },
  ],
  issues: [
    { area: 'Agriculture', issue: 'Crop insurance arrears unpaid across 6 states', impact: 'Nationwide farmer unrest gaining opposition media amplification', evidence: 'Punjab, MP, Rajasthan protests — NDTV and India Today coverage', suggestedAction: '• Clarify the current insurance claim status with a simple infographic on X and Instagram\n• Amplify farmer testimonials and success stories already shared by BJP state handles\n• Counter opposition misinformation with fact-based posts showing claims processed this year\n• Publish short video bytes of BJP spokespersons reassuring farmers on timelines' },
    { area: 'Economy', issue: 'Tax reform narrative controlled by opposition', impact: 'Middle-class perception shifting; X trending negatively on "tax"', evidence: 'Opposition leaders trending nationwide; negative tax sentiment on X', suggestedAction: '• Clarify tax reform impact with a 5-point visual explainer targeting middle-income groups\n• Reframe narrative by highlighting tax relief and savings already delivered to citizens\n• Amplify positive voices of beneficiaries across X, Instagram, and YouTube Shorts\n• Counter misleading comparisons with side-by-side fact posts from BJP handles' },
    { area: 'Internal Security', issue: 'Manipur ethnic violence resuming', impact: 'National credibility concern; opposition amplifying Centre\'s challenge', evidence: 'Curfew in 3 districts, India Today breaking news coverage', suggestedAction: '• Share BJP\'s consistent peace efforts and relief activities in Manipur via state handles\n• Reframe narrative around resilience and BJP\'s humanitarian response on the ground\n• Counter opposition politicisation with documented facts of BJP-led relief measures\n• Amplify voices of community leaders and local BJP workers supporting normalcy' },
  ],
  sentiment: { pos: 55, neu: 25, neg: 25 },
  wins: [
    'Highway network inauguration — saturation coverage across 12 states, amplify state-by-state',
    '100GW solar milestone is a high-credibility governance story with strong visual potential',
    'Ayushman Bharat and PM Vishwakarma stories — ready for hyper-local social media campaigns',
    'DFC launch and FTA news — strong stories for business audience and trade associations',
  ],
  concerns: [
    '**Crop Insurance Coverage:** Farmer unrest gaining media attention — clarify BJP\'s payment progress online',
    '**Tax Narrative:** Opposition controlling middle-class digital conversation — counter with facts',
    '**Unemployment Data:** Conflicting numbers spreading confusion — publish BJP\'s unified numbers',
    '**Manipur Violence:** Fresh curfew gaining national coverage — amplify BJP\'s relief and peace efforts',
    '**Vegetable Prices:** Consumer frustration visible online — highlight BJP\'s price stabilisation steps',
  ],
  actions: [
    'Clarify crop insurance payment progress with a simple visual post across all BJP handles',
    'Publish a 5-point tax reform explainer — plain language, shareable, targeted at middle-income groups',
    'Amplify BJP\'s Manipur relief efforts through video content and spokesperson quotes',
    'Share unified unemployment data talking points with all BJP state social media handles by evening',
    'Counter vegetable price misinformation with BJP state-level price moderation updates',
  ],
};

// ─── State dispatch map ────────────────────────────────────────────────────────
const STATE_MOCK: Record<string, StateMock> = {
  'Uttar Pradesh': UP_MOCK,
  'Maharashtra': MH_MOCK,
  'Gujarat': GJ_MOCK,
};

// ─── Mock Output Builder ────────────────────────────────────────────────────────
export function getMockBriefingOutput(scope: Scope, state?: string): BriefingOutput {
  const d: StateMock = scope === 'State Wise' && state && STATE_MOCK[state]
    ? STATE_MOCK[state]
    : NATIONWIDE_MOCK;

  const label = scope === 'State Wise' && state ? state : 'Nationwide';
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const mood = d.sentiment.pos >= 57 ? 'broadly positive' : d.sentiment.pos >= 46 ? 'mixed' : 'under pressure';

  const toNewsItem = (sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE') =>
    (item: Partial<NewsItem>): NewsItem => ({
      headline: item.headline ?? '',
      source: item.source ?? '',
      url: item.url,
      time: item.time,
      summary: item.summary ?? '',
      sentiment,
      state,
      platform: undefined,
      bjpResponse: item.bjpResponse,
    });

  return {
    scope,
    state,
    generatedAt: new Date().toISOString(),
    sentimentSummary: {
      positiveCount: d.positive.length,
      neutralCount: d.neutral.length,
      negativeCount: d.negative.length,
      total: d.positive.length + d.neutral.length + d.negative.length,
      percentages: { positive: d.sentiment.pos, neutral: d.sentiment.neu, negative: d.sentiment.neg },
    },
    performanceRatings: d.ratings.map(r => ({
      category: r.category ?? '', score: r.score ?? 5, label: r.label ?? '',
      posCount: 0, negCount: 0, neutralCount: 0,
    })),
    topNews: {
      positive: d.positive.map(toNewsItem('POSITIVE')),
      neutral: d.neutral.map(toNewsItem('NEUTRAL')),
      negative: d.negative.map(toNewsItem('NEGATIVE')),
    },
    issues: d.issues,
    briefingMarkdown: `# Morning Intelligence Brief — ${label}
**Date:** ${date}

---

## Overall Sentiment
The ${label} political environment is **${mood}** today.
**${d.sentiment.pos}%** positive · **${d.sentiment.neu}%** neutral · **${d.sentiment.neg}%** negative

## Key Wins Today
${d.wins.map(b => `- ${b}`).join('\n')}

## Key Concerns
${d.concerns.map(b => `- ${b}`).join('\n')}

## Suggested Actions for Next 24 Hours
${d.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

---
*Generated by PolitiSense Intelligence Unit*`,
  };
}

// ─── Batch Delivery Types ──────────────────────────────────────────────────────
export interface BriefingBatchPayload {
  briefing_id: string;
  selected_channels: ('telegram' | 'email')[];
  recipients: Array<{
    name: string;
    role: string;
    telegram_chat_id: string | null;
    email: string | null;
  }>;
  outputs: {
    telegram: string;
    email_subject: string;
    email_body: string;
  };
}

export interface DeliveryReport {
  briefing_id: string;
  delivery: {
    telegram?: { sent: number; skipped: number; failed: number };
    email?: { sent: number; skipped: number; failed: number };
  };
  timestamp: string;
}

// ─── Send Briefing (Batch) ───────────────────────────────────────────────────
// Posts a single batch payload to n8n. n8n loops over recipients internally.
// Vite proxy (/n8n-webhook → VITE_N8N_WEBHOOK_URL) avoids browser CORS.
// Falls back to simulation if VITE_N8N_WEBHOOK_URL is not set.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const N8N_WEBHOOK_URL: string = (import.meta as any).env?.VITE_N8N_WEBHOOK_URL ?? '';

export async function sendBriefingBatch(payload: BriefingBatchPayload): Promise<DeliveryReport> {
  if (!N8N_WEBHOOK_URL) {
    // Simulation mode — compute report from payload without real sends
    await new Promise(r => setTimeout(r, 900));
    console.log('[PolitiSense] SIMULATION sendBriefingBatch:', payload);
    const report: DeliveryReport = { briefing_id: payload.briefing_id, delivery: {}, timestamp: new Date().toISOString() };
    for (const ch of payload.selected_channels) {
      const sent = payload.recipients.filter(r => ch === 'telegram' ? !!r.telegram_chat_id : !!r.email).length;
      report.delivery[ch] = { sent, skipped: payload.recipients.length - sent, failed: 0 };
    }
    return report;
  }

  const response = await fetch('/n8n-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Delivery failed (${response.status})`);
  }

  return response.json() as Promise<DeliveryReport>;
}


// ─── Dynamic RSS Fallback Builder ──────────────────────────────────────────────
export function buildDynamicFallbackFromRSS(items: any[], scope: Scope, state?: string): BriefingOutput {
  const positive: any[] = [];
  const neutral: any[] = [];
  const negative: any[] = [];

  const posKeywords = ['win', 'launches', 'inaugurates', 'boost', 'highest', 'record', 'success', 'growth', 'tops', 'secures', 'achieves'];
  const negKeywords = ['protest', 'fails', 'crisis', 'violence', 'clash', 'concerns', 'declines', 'poor', 'delayed', 'demands', 'outage', 'agitation', 'strike'];

  items.forEach((item, i) => {
    const text = (item.headline + ' ' + item.summary).toLowerCase();
    const isPos = posKeywords.some(k => text.includes(k));
    const isNeg = negKeywords.some(k => text.includes(k));

    const formattedItem = {
      headline: item.headline,
      source: item.source,
      url: item.url,
      time: item.time,
      summary: item.summary,
      sentiment: 'NEUTRAL' as 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE',
      state,
      platform: undefined
    };

    if (isPos && !isNeg) {
      formattedItem.sentiment = 'POSITIVE';
      positive.push(formattedItem);
    } else if (isNeg) {
      formattedItem.sentiment = 'NEGATIVE';
      negative.push(formattedItem);
    } else {
      // Round robin if no keywords match, to ensure dashboard looks populated
      if (i % 3 === 0) {
        formattedItem.sentiment = 'POSITIVE';
        positive.push(formattedItem);
      } else if (i % 2 === 0) {
        formattedItem.sentiment = 'NEGATIVE';
        negative.push(formattedItem);
      } else {
        formattedItem.sentiment = 'NEUTRAL';
        neutral.push(formattedItem);
      }
    }
  });

  const label = scope === 'State Wise' && state ? state : 'Nationwide';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const total = items.length || 1; // avoid div by 0
  const pctPos = Math.round((positive.length / total) * 100);
  const pctNeu = Math.round((neutral.length / total) * 100);
  const pctNeg = Math.round((negative.length / total) * 100);

  const mood = pctPos > 40 ? 'optimistic' : pctNeg > 40 ? 'under pressure' : 'mixed';

  const issues = negative.slice(0, 3).map(neg => ({
    area: 'Current Affairs',
    issue: neg.headline,
    impact: 'Potential negative public perception based on recent media coverage.',
    evidence: neg.source,
    suggestedAction: `• Clarify the ground reality regarding this issue quickly\n• Amplify positive counter-narratives on social channels\n• Monitor social media sentiment closely over the next 12 hours`
  }));

  const wins = positive.slice(0, 3).map(pos => pos.headline);
  const concerns = negative.slice(0, 3).map(neg => neg.headline);

  const briefingMarkdown = `# Morning Intelligence Brief — ${label} (Auto-Generated)
**Date:** ${dateStr}

---

## Overall Sentiment
The ${label} political environment is **${mood}** today based on automated news scanning.
**${pctPos}%** positive · **${pctNeu}%** neutral · **${pctNeg}%** negative

## Key Wins Today
${wins.length > 0 ? wins.map(b => `- ${b}`).join('\n') : '- No major positive highlights in immediate coverage'}

## Key Concerns
${concerns.length > 0 ? concerns.map(b => `- ${b}`).join('\n') : '- No critical concerns identified in currently available data'}

## Suggested Actions for Next 24 Hours
1. Share positive updates across verified social media handles.
2. Monitor regional platforms for any emerging local issues.
3. Coordinate with local spokespersons to address any minor concerns efficiently.

---
*[DEMO] Source: Auto-categorized News RSS feeds (OpenAI Fallback).*`;

  return {
    scope,
    state,
    generatedAt: new Date().toISOString(),
    sentimentSummary: {
      positiveCount: positive.length,
      neutralCount: neutral.length,
      negativeCount: negative.length,
      total: positive.length + neutral.length + negative.length,
      percentages: { positive: pctPos, neutral: pctNeu, negative: pctNeg }
    },
    performanceRatings: [
      { category: 'Public Perception', score: 6, label: 'Moderate', posCount: 0, negCount: 0, neutralCount: 0 },
      { category: 'Media Sentiment', score: pctPos > 40 ? 8 : (pctNeg > 40 ? 4 : 6), label: pctPos > 40 ? 'Strong' : 'Moderate', posCount: 0, negCount: 0, neutralCount: 0 },
      { category: 'Digital Outreach', score: 7, label: 'Good', posCount: 0, negCount: 0, neutralCount: 0 },
    ],
    topNews: {
      positive,
      neutral,
      negative
    },
    issues,
    briefingMarkdown
  };
}

// ─── n8n Live Intelligence Mapper (v2) ────────────────────────────────────────
// Maps the new Final_v2.json response format to BriefingOutput
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapN8nResponseToBriefing(payload: any, scope: Scope, state?: string): BriefingOutput {
  const allItems = [...(payload.digital || []), ...(payload.social || [])];

  const positive: any[] = [];
  const neutral: any[] = [];
  const negative: any[] = [];
  // Use pre-analyzed issues from n8n (Gemini already processed them) — only fall back to auto-build
  const prebuiltIssues: any[] = Array.isArray(payload.issues) ? payload.issues : [];
  const autoIssues: any[] = [];

  allItems.forEach((item) => {
    const s = String(item.sentiment || '').toUpperCase();
    const isPos = s.includes('POSITIVE');
    const isNeg = s.includes('NEGATIVE');

    const formattedItem = {
      headline: item.headline || item.summary || 'No headline',
      source: item.source || item.channel || 'Unknown',
      url: item.url || '',
      summary: item.summary || '',
      sentiment: isPos ? 'POSITIVE' : isNeg ? 'NEGATIVE' : 'NEUTRAL',
      state,
      platform: item.source_type === 'social' ? 'x' : 'news',
      bjpResponse: Array.isArray(item.bjpResponse) ? item.bjpResponse : undefined,
    };

    if (isPos) {
      positive.push(formattedItem);
    } else if (isNeg) {
      negative.push(formattedItem);

      if (autoIssues.length < 3) {
        autoIssues.push({
          area: item.source_type === 'social' ? 'Social Media' : 'Current Affairs',
          issue: item.headline || 'Negative Sentiment Detected',
          impact: 'Potential perception risk among digital and social audiences.',
          evidence: item.source || 'Media Report',
          suggestedAction: Array.isArray(item.key_claims) && item.key_claims.length > 0
            ? `• Clarify claims: ${item.key_claims.join(', ')}\n• Counter narrative via verified channels.\n• Monitor sentiment closely.`
            : `• Clarify ground reality\n• Amplify counter-narratives\n• Monitor discourse`
        });
      }
    } else {
      neutral.push(formattedItem);
    }
  });

  // Prefer n8n's Gemini-analyzed issues; fill up to 3 with auto-detected ones if needed
  const issues = prebuiltIssues.length > 0
    ? prebuiltIssues
    : autoIssues;

  const total = allItems.length || 1;
  const pctPos = Math.round((positive.length / total) * 100);
  const pctNeu = Math.round((neutral.length / total) * 100);
  const pctNeg = Math.round((negative.length / total) * 100);

  const mood = pctPos > 40 ? 'optimistic' : pctNeg > 40 ? 'under pressure' : 'mixed';
  const label = scope === 'State Wise' && state ? state : 'Nationwide';
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const wins = positive.slice(0, 3).map(pos => pos.headline);
  const concerns = negative.slice(0, 3).map(neg => neg.headline);

  const briefingMarkdown = `# Morning Intelligence Brief — ${label} (n8n Live Pipeline v2)
**Date:** ${dateStr}

---

## Overall Sentiment
The ${label} political environment is **${mood}** today based on cross-channel (Digital + Social) live analysis.
**${pctPos}%** positive · **${pctNeu}%** neutral · **${pctNeg}%** negative

## Key Wins Today
${wins.length > 0 ? wins.map(b => `- ${b}`).join('\n') : '- No major positive highlights in immediate coverage'}

## Key Concerns
${concerns.length > 0 ? concerns.map(b => `- ${b}`).join('\n') : '- No critical concerns identified in currently available data'}

## Suggested Actions for Next 24 Hours
1. Share positive updates across verified social media handles.
2. Monitor regional platforms for any emerging local issues.
3. Coordinate with local spokespersons to address identified concerns.

---
*[LIVE] Source: n8n Intelligence Pipeline v2 (Digital & Social Fusion).*
`;

  return {
    scope,
    state,
    generatedAt: payload.generatedAt || new Date().toISOString(),
    sentimentSummary: {
      positiveCount: positive.length,
      neutralCount: neutral.length,
      negativeCount: negative.length,
      total: positive.length + neutral.length + negative.length,
      percentages: { positive: pctPos, neutral: pctNeu, negative: pctNeg }
    },
    performanceRatings: [
      { category: 'Digital Reach', score: 7, label: 'Good', posCount: 0, negCount: 0, neutralCount: 0 },
      { category: 'Social Engagement', score: 6, label: 'Moderate', posCount: 0, negCount: 0, neutralCount: 0 },
      { category: 'Media Sentiment', score: pctPos > 40 ? 8 : (pctNeg > 40 ? 4 : 6), label: pctPos > 40 ? 'Strong' : 'Moderate', posCount: 0, negCount: 0, neutralCount: 0 },
    ],
    topNews: { positive, neutral, negative },
    issues,
    briefingMarkdown
  } as BriefingOutput;
}

// ─── n8n Live Intelligence Webhook ────────────────────────────────────────────
// Calls the PolitiSense n8n workflow (Final_v2.json) which scrapes real news,
// runs Gemini analysis, and returns a fully structured BriefingOutput.
// Set VITE_N8N_BRIEFING_WEBHOOK in .env.local to enable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const N8N_BRIEFING_WEBHOOK: string = (import.meta as any).env?.VITE_N8N_BRIEFING_WEBHOOK ?? '';

export async function generateBriefingFromN8N(
  scope: Scope,
  state?: string
): Promise<BriefingOutput | null> {
  if (!N8N_BRIEFING_WEBHOOK) return null;

  try {
    console.log('[n8n] Calling live intelligence webhook via proxy...');
    // Use Vite proxy /n8n-brief → avoids CORS (browser can't call n8n.cloud directly)
    const res = await fetch('/n8n-brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope, state, triggeredAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(180_000),
    });

    if (!res.ok) throw new Error(`n8n webhook failed: ${res.status}`);

    const data = await res.json();

    // n8n "allIncomingItems" can return multiple items (one per parallel branch).
    // Merge ALL items instead of only taking data[0], which silently drops branches.
    let payload: any;
    if (Array.isArray(data)) {
      const allDigital = data.flatMap((item: any) => Array.isArray(item.digital) ? item.digital : []);
      const allSocial  = data.flatMap((item: any) => Array.isArray(item.social)  ? item.social  : []);
      const allIssues  = data.flatMap((item: any) => Array.isArray(item.issues)  ? item.issues  : []);
      payload = {
        ...(data[0] || {}),
        digital: allDigital,
        social:  allSocial,
        issues:  allIssues,
      };
      console.log(`[n8n] Merged ${data.length} response items → digital:${allDigital.length} social:${allSocial.length} issues:${allIssues.length}`);
    } else {
      payload = data;
    }

    // Backward compatibility with older n8n workflows
    if (payload.sentimentSummary && payload.topNews) {
      console.log('[n8n] ✅ Live briefing received (old format). Sentiment:', payload.sentimentSummary?.percentages);
      return {
        ...payload,
        scope,
        state,
        generatedAt: payload.generatedAt || new Date().toISOString(),
        dataSource: payload.dataSource || 'n8n Live Pipeline',
      } as BriefingOutput;
    }

    // New format (Final_v2.json)
    const hasData = (payload.digital?.length ?? 0) > 0 || (payload.social?.length ?? 0) > 0;
    if (!hasData) {
      throw new Error(`n8n returned empty digital/social arrays (items in response: ${Array.isArray(data) ? data.length : 1})`);
    }

    console.log('[n8n] ✅ Live briefing received (new format v2). Mapping to BriefingOutput...');
    return mapN8nResponseToBriefing(payload, scope, state);

  } catch (err: any) {
    console.warn('[n8n] webhook failed, falling back to direct AI:', err.message);
    return null;
  }
}

export async function generateBriefing(
  data: StructuredData,
  scope: Scope,
  state?: string
): Promise<BriefingOutput> {
  // ── Priority 0: n8n live intelligence pipeline (real news + social media) ──
  const n8nResult = await generateBriefingFromN8N(scope, state);
  if (n8nResult) return n8nResult;

  const OPENAI_API_KEY: string = (import.meta as any).env?.VITE_OPENAI_API_KEY || (typeof process !== 'undefined' ? (process.env.OPENAI_API_KEY ?? '') : '');
  const NEWSDATA_API_KEY: string = (import.meta as any).env?.VITE_NEWSDATA_API_KEY || (typeof process !== 'undefined' ? (process.env.NEWSDATA_API_KEY ?? '') : '');

  let allItems = data.news;
  let actuallyFetchedLive = false;

  // 1. Try NewsData.io first if API key is provided
  if (NEWSDATA_API_KEY) {
    try {
      const query = scope === 'State Wise' && state
        ? `"${state}" AND (bjp OR modi OR "amit shah" OR "jp nadda" OR nda OR "yogi adityanath" OR "bharatiya janata party" OR congress)`
        : '(india OR indian) AND (bjp OR modi OR "amit shah" OR "jp nadda" OR nda OR "bharatiya janata party" OR "yogi adityanath" OR congress)';
      const newsDataUrl = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=${encodeURIComponent(query)}&country=in&language=en&category=politics,top`;

      const res = await fetch(newsDataUrl);
      const json = await res.json();

      if (json.status === 'success' && json.results && json.results.length > 0) {
        let items = json.results.map((item: any) => ({
          headline: item.title,
          source: item.source_id || 'NewsData.io',
          url: item.link,
          time: item.pubDate,
          summary: item.description?.replace(/<[^>]*>?/gm, '')?.substring(0, 200) || 'No summary available.'
        }));

        items.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
        allItems = items.slice(0, 30);
        actuallyFetchedLive = true;
        console.log("Successfully fetched live news from NewsData.io");
      }
    } catch (e) {
      console.warn("Failed to fetch from NewsData.io. Falling back to RSS...", e);
    }
  }

  // 2. Fallback to Google News RSS if NewsData.io didn't work or isn't configured
  if (!actuallyFetchedLive) {
    try {
      const today = new Date();
      // e.g. "India politics", "Uttar Pradesh politics"
      const query = scope === 'State Wise' && state ? `${state} politics` : 'India politics';
      const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&gl=IN&ceid=IN:en`;
      const apiReqUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=`; // Free tier is rate limited but works

      const rssFetch = await fetch(apiReqUrl);
      const rssJson = await rssFetch.json();
      if (rssJson.status === 'ok' && rssJson.items && rssJson.items.length > 0) {
        // Filter for recent items (approx last 48 hours for better coverage, but prioritize today)
        let items = rssJson.items.map((item: any) => ({
          headline: item.title,
          source: item.author || 'Google News RSS',
          url: item.link,
          time: item.pubDate,
          summary: item.description?.replace(/<[^>]*>?/gm, '')?.substring(0, 200) || 'No summary available.'
        }));

        // Attempt to sort by newest first and take top 30
        items.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
        allItems = items.slice(0, 30);
        actuallyFetchedLive = true;
        console.log("Successfully fetched live news from Google News RSS");
      }
    } catch (e) {
      console.warn("Failed to fetch live RSS. Falling back to default data.", e);
    }
  }

  // ── Scope instruction (client-controlled, no auto-inference) ───────────────
  const scopeInstruction = scope === 'State Wise' && state
    ? `SCOPE: STATE — ${state.toUpperCase()}
Analyse ONLY data that is directly relevant to the state of ${state}.
DO NOT include news from other states, even if politically significant nationally.
If fewer than 3 items exist for ${state}, include this note at the top of briefingMarkdown:
"⚠ Limited state-specific coverage available for ${state} in the last 24 hours."`
    : `SCOPE: NATIONAL
Analyse all provided data for a nationwide political intelligence briefing covering India.
Include all states where relevant. Do NOT narrow focus to a single state unless the story is state-specific.`;

  const prompt = `You are a senior political intelligence analyst producing a leadership-facing briefing for the Bharatiya Janata Party.

────────────────────────────────────────────────────────
DATA SOURCE CONTEXT
────────────────────────────────────────────────────────
- Input data is sourced EXCLUSIVELY from verified, publicly available Indian NEWS RSS feeds.
- Sources include national and regional Indian news publications.
- All content represents real reporting from the last 24 hours.
- NO social media data (X/Twitter, Instagram, Facebook) is included in this run.
- This is intentional: cost control, legal safety, signal quality, and demo reliability.

────────────────────────────────────────────────────────
SCOPE
────────────────────────────────────────────────────────
${scopeInstruction}

────────────────────────────────────────────────────────
INPUT DATA (${allItems.length} news items)
────────────────────────────────────────────────────────
${JSON.stringify(allItems.slice(0, 25), null, 2)}

────────────────────────────────────────────────────────
SENTIMENT CLASSIFICATION CRITERIA
────────────────────────────────────────────────────────
You are classifying news EXCLUSIVELY from the perspective of BJP's Social Media Cell.
The question to ask for EVERY item is: "Is this news GOOD or BAD for BJP?"
Not: "Is this news good or bad for India?" — BJP's interests ARE the frame of reference.

POSITIVE — Assign when the news is GOOD FOR BJP:
- Government achievement, scheme success, infrastructure, welfare delivery, economic milestone
- BJP/NDA electoral wins, rising approval ratings, alliance strengthening, booth-level outreach
- BJP leaders countering, rebutting, or attacking opposition — BJP fighting back = BJP winning
- India taking a strong diplomatic stance (against Pakistan, at UN, internationally) — strong India = BJP credit
- Opposition caught in contradiction, hypocrisy, corruption, or infighting
- BJP's narrative framing is working: historical rebuttals, comparisons, legacy arguments gaining traction
- Viral positive content about BJP/Modi/govt ministers
- Any news where BJP is ON OFFENSE — attacking, reframing, countering — this is POSITIVE (cell is winning)
- Example: "BJP targets Nehru-Gandhi legacy to counter opposition on trade deal" → POSITIVE (BJP is counter-attacking)
- Example: "India slams Pakistan at UN" → POSITIVE (government's strong diplomatic stance)
- Example: "BJP hits back at Priyanka Gandhi" → POSITIVE (BJP counter-messaging is active)
- Example: "PM Modi inaugurates 12 new Vande Bharat routes" → POSITIVE

NEGATIVE — Assign when the news is BAD FOR BJP / requires damage control:
- Genuine government failures, scandals, corruption with evidence against BJP leaders/govt
- Opposition criticism that is LANDING — gaining public traction, going viral, creating pressure
- Anti-BJP narratives spreading that the cell needs to counter urgently
- Public protests or agitations that are large-scale and damaging BJP's image
- Economic distress stories making BJP look responsible: farmer suicides, unemployment data, price rise
- Unfavorable court verdicts, CAG indictments, or ED/CBI actions against BJP allies
- Media or opposition attacks that are factually hard to rebut
- Stories that undermine BJP's core narrative (nationalism, Hindutva, development, anti-corruption)
- Sarcasm or mockery of government going viral (see Sarcasm Detection section)
- Opinion pieces from credible publications that damage BJP's image with evidence
- Example: "Farmers block highway for 3rd day demanding MSP guarantee" → NEGATIVE
- Example: "How the Absence of Shame is Reshaping Indian Democracy - Frontline" → NEGATIVE (anti-BJP framing)

NEUTRAL — Assign ONLY when genuinely neither good nor bad for BJP:
- Purely procedural news: session dates, routine appointments, election schedule announcements
- International events with zero impact on BJP's domestic image
- Court hearings with no outcome yet
- Statistical/data releases with no positive or negative BJP angle
- Balanced coverage that gives equal space to both sides
- Example: "Budget session of Parliament begins Monday" → NEUTRAL

TIEBREAKER RULES:
- BJP on OFFENSE (attacking, countering, rebutting opposition) → always POSITIVE — this is the cell doing its job
- Strong India = Strong BJP: any news showing India's strength, diplomacy, global stature → POSITIVE
- Opposition attack WITHOUT traction/evidence → NEUTRAL (not worth alarming leadership)
- Opposition attack WITH viral spread or hard evidence → NEGATIVE (needs counter-strategy)
- If uncertain: ask "Does BJP's social media cell celebrate this or fight this?" — celebrate = POSITIVE, fight = NEGATIVE

────────────────────────────────────────────────────────
STRICT ANALYSIS RULES
────────────────────────────────────────────────────────
- Base ALL insights strictly on the provided input data above.
- DO NOT fabricate, invent, or hallucinate any news items, events, or political signals.
- DO NOT assume or infer public sentiment beyond what is explicitly reported.
- DO NOT add items that are not present in the input data.
- If fewer items exist than expected for a category, report only what the data supports.
- Clearly indicate data limitations where applicable using plain language.
- Every issue flagged must cite evidence from the provided data ("evidence" field).

────────────────────────────────────────────────────────
SARCASM & IRONY DETECTION (MANDATORY)
────────────────────────────────────────────────────────
- ALWAYS check for sarcasm, irony, satire, and rhetorical praise before assigning sentiment.
- Headlines or text using praise words sarcastically (e.g. "Congratulations, you have ruined this", "Well done on destroying the economy", "Great job making everyone suffer", "Brilliant move to ignore farmers") MUST be classified as NEGATIVE — never Positive.
- Indicators of sarcasm: exaggerated praise + negative outcome, quotation marks around praise, mocking tone, contradiction between words and context.
- When in doubt about whether praise is genuine or sarcastic, look at the actual outcome or claim described. If the outcome is negative, classify sentiment as NEGATIVE regardless of the surface-level positive words.
- This rule applies to ALL outputs: topNews sentiment, sentimentSummary counts, and issues.

────────────────────────────────────────────────────────
ISSUES REQUIRING ATTENTION — QUALIFICATION GATE (MANDATORY — APPLIES TO ALL SOURCES)
────────────────────────────────────────────────────────
This rule applies REGARDLESS of source type: Digital Media, Foreign Media, Social Media, or News RSS.
Before adding ANY item to "issues", run it through this gate. Include it ONLY IF at least one condition below is TRUE:

✅ INCLUDE IF:
  1. Sentiment is NEGATIVE AND intensity is MEDIUM or HIGH.
  2. Sentiment is NEGATIVE AND the content makes a specific allegation, accusation, or claim
     that could reasonably spread or be reused by opposition or media.
  3. Sentiment is NEUTRAL AND the topic is sensitive or politically exploitable
     AND it is clearly connected to BJP, its leaders, its government, or its core narratives.

❌ EXCLUDE IF:
  - Sentiment is POSITIVE (never an issue).
  - Sentiment is NEUTRAL and purely informational with no political leverage for the opposition.
  - Engagement and narrative impact are LOW with no realistic escalation risk.

If NONE of the above ✅ conditions apply → DO NOT include in issues.

────────────────────────────────────────────────────────
ISSUES — SOCIAL MEDIA CELL RESPONSE RULES (ZERO TOLERANCE)
────────────────────────────────────────────────────────
You are operating STRICTLY as a Political Social Media Cell.
You are NOT a ministry. You are NOT a government department.
You are NOT allowed to suggest governance, administrative, or policy actions.

ABSOLUTE PROHIBITIONS — if any appear, the output is INVALID:
- No ministry names (Finance Ministry, MHA, Agriculture Ministry, etc.)
- No government directives, circulars, orders, or notifications
- No administrative, law enforcement, or policy actions
- No phrases: "deploy", "direct", "instruct", "issue order", "government to", "announce policy"
- No actions requiring a minister or bureaucrat to act

THE ONLY ALLOWED ACTIONS (Social Media Cell):
- Posting clarifications and explainer content
- Reframing narratives and counter-messaging
- Amplifying positive stories and BJP achievements
- Coordinating spokesperson messaging
- Publishing short videos, infographics, reels
- Hashtag campaigns and trend management
- Monitoring and responding to misinformation
- Engaging influencers and digital supporters

HOW TO THINK: Do NOT ask "What should the government do?" — ONLY ask "What should the Social Media Cell SAY or SHOW right now?"

MANDATORY: Each bullet in suggestedAction MUST start with one of these action verbs:
[Clarify / Highlight / Amplify / Counter / Reframe / Reinforce / Publish / Share / Respond]

SELF-CHECK before output: Scan every word. If any ministry name, governance verb, or policy language appears — REMOVE and REWRITE.

Each suggestedAction: 3–5 bullet points, communication-only, executable within 24 hours.

────────────────────────────────────────────────────────
OUTPUT FORMAT — Return ONLY raw JSON, no markdown fences, no explanation
────────────────────────────────────────────────────────
{
  "sentimentSummary": {
    "positiveCount": number,
    "neutralCount": number,
    "negativeCount": number,
    "total": number,
    "percentages": { "positive": number, "neutral": number, "negative": number }
  },
  "performanceRatings": [
    {
      "category": "string — e.g. Infrastructure, Agriculture, Law & Order",
      "score": 0-9,
      "label": "string — e.g. Strong / Good / Moderate / Needs Attention",
      "posCount": number,
      "negCount": number,
      "neutralCount": number
    }
  ],
  "topNews": {
    "positive": [{ "headline": "string", "source": "string", "url": "CANONICAL_URL_OR_NULL", "time": "ISO_STRING_OR_NULL", "sentiment": "POSITIVE", "summary": "one-line factual summary", "bjpResponse": ["<action 1>", "<action 2>", "<action 3>"] }],
    "neutral":  [same structure, sentiment: "NEUTRAL"],
    "negative": [same structure, sentiment: "NEGATIVE"]
  },

bjpResponse RULES (mandatory for every topNews item):
- Write 2–3 strings. Each string is a single executable social media action.
- POSITIVE items: amplification, resharing, endorsements, visual storytelling. Never use "consider" or "monitor".
- NEUTRAL items: adding context, factual framing, or selective platform-specific engagement.
- NEGATIVE items: factual rebuttal, counter-narrative with verified sources. If engagement is low, write exactly: "No amplification required — low traction."
- Actions must be from a SOCIAL MEDIA CELL perspective only. No ministry language. No policy suggestions.
- Every action must start with a verb: Share / Post / Publish / Amplify / Counter / Reframe / Highlight / Brief / Create / Tag.
- No defensive language, no slogans, no generic advice.

  "issues": [
    {
      "area": "string — e.g. Agriculture / Economy / Opposition Narrative / Foreign Media",
      "issue": "string — 1 line: what threat or negative signal exists that BJP's cell needs to address. IMPORTANT: BJP countering opposition, attacking rivals, or using historical comparisons is NEVER an issue — it is a tactic. Only flag things that are hurting BJP's image.",
      "impact": "string — electoral, perception, or narrative impact ON BJP if left unaddressed",
      "evidence": "string — direct reference to a headline or source from the input data",
      "suggestedAction": "string — 2–4 bullet points. SOCIAL MEDIA CELL / DIGITAL COMMS TEAM ACTIONS ONLY. No ministry names. No governance language. Focus: clarify, amplify, counter-narrative, reassure, publish visibility content."
    }
  ],
  "briefingMarkdown": "Full markdown briefing. Sections: Overall Public Mood, Key Wins Today (BJP achievements, BJP counter-attacks that landed, strong diplomacy), Key Concerns (only genuine threats to BJP), Immediate Focus Areas. The 'Key Wins Today' section must include BJP offensive moves — countering opposition, rebuttals, India's strong stances — as WINS for the cell. The 'Immediate Focus Areas' section must ONLY contain Social Media Cell and Digital Communication Team actions — no ministry names, no governance or administrative instructions. End with: ---\\n*[DEMO] Source: News RSS feeds only. Production system supports multi-platform ingestion.*"
}

URL RULES:
- Use ONLY canonical publisher URLs (e.g. https://www.thehindu.com/news/national/article.html)
- NEVER use Google News, AMP (/amp/), shortened URLs (bit.ly / t.co), or tracking-param URLs
- Set url to null if canonical URL cannot be confirmed from the input data

QUANTITY RULES:
- topNews: up to 5 items per sentiment category (fewer if data does not support it)
- performanceRatings: 4–5 categories most relevant to the input data
- issues: 3–5 items, strictly evidence-backed
`;

  const GEMINI_API_KEY: string = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_ALT_API_KEY || '';

  try {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found. Falling back to dynamic RSS data.');
      if (actuallyFetchedLive) {
        return buildDynamicFallbackFromRSS(allItems, scope, state);
      }
      return getMockBriefingOutput(scope, state);
    }

    console.log('[Gemini] Calling gemini-2.0-flash for briefing analysis...');
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API failed body:', errBody);
      throw new Error(`Gemini API failed: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // ── Normalize topNews buckets ──────────────────────────────────────────────
    // Gemini occasionally places an item in the wrong array (e.g. a NEGATIVE item
    // inside topNews.neutral). Re-bucket every item based on its own sentiment
    // field so the UI tab and the badge always agree.
    if (parsed.topNews) {
      const allNewsItems: any[] = [
        ...(parsed.topNews.positive || []),
        ...(parsed.topNews.neutral  || []),
        ...(parsed.topNews.negative || []),
      ];
      const rebucketedPositive: any[] = [];
      const rebucketedNeutral: any[]   = [];
      const rebucketedNegative: any[]  = [];
      for (const item of allNewsItems) {
        const s = String(item.sentiment || '').toUpperCase();
        if (s === 'POSITIVE') rebucketedPositive.push({ ...item, sentiment: 'POSITIVE' });
        else if (s === 'NEGATIVE') rebucketedNegative.push({ ...item, sentiment: 'NEGATIVE' });
        else rebucketedNeutral.push({ ...item, sentiment: 'NEUTRAL' });
      }
      parsed.topNews = {
        positive: rebucketedPositive,
        neutral:  rebucketedNeutral,
        negative: rebucketedNegative,
      };
    }

    console.log('[Gemini] ✅ Briefing generated successfully.');
    return { ...parsed, scope, state, generatedAt: new Date().toISOString() } as BriefingOutput;

  } catch (err: any) {
    console.error('Gemini generation failed:', err);
    console.warn('Falling back to local dynamic data seamlessly...');
    if (actuallyFetchedLive && allItems.length > 0) {
      return buildDynamicFallbackFromRSS(allItems, scope, state);
    }
    return getMockBriefingOutput(scope, state);
  }
}

// ─── Enrich briefing: one Gemini call → specific bjpCellAction per item ───────
// Works for BOTH n8n-sourced and direct-Gemini briefings.
// Hindi / emoji / any language headlines are handled because Gemini reads the
// full post text. Falls back silently — returns original briefing on any error.
export async function enrichBriefingWithActions(
  briefing: BriefingOutput
): Promise<BriefingOutput> {
  const GEMINI_API_KEY: string =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_ALT_API_KEY || '';

  if (!GEMINI_API_KEY) return briefing; // no key — return as-is

  // Flatten all items, preserving source array name for re-assembly
  type Tagged = { item: NewsItem; bucket: 'positive' | 'neutral' | 'negative' };
  const tagged: Tagged[] = [
    ...(briefing.topNews.positive || []).map(item => ({ item, bucket: 'positive' as const })),
    ...(briefing.topNews.neutral  || []).map(item => ({ item, bucket: 'neutral'  as const })),
    ...(briefing.topNews.negative || []).map(item => ({ item, bucket: 'negative' as const })),
  ];

  if (tagged.length === 0) return briefing;

  const itemsPayload = tagged.map((t, i) => ({
    index: i,
    headline: t.item.headline,
    source: t.item.source,
    summary: t.item.summary || '',
    sentiment: t.item.sentiment,
  }));

  const enrichPrompt = `You are acting as a senior strategist inside the BJP Social Media Cell (IT Cell / War Room).

Your task is to generate ONE clear, decisive, and practical action for each post listed below, based strictly on the post's content, tone, reach, political relevance, and narrative risk.

CRITICAL BEHAVIOR RULES (MANDATORY):
- Think like a BJP social media head, not an analyst.
- Do NOT sound academic, neutral, or robotic.
- Do NOT repeat the same action across posts — repeated actions will be treated as FAILURE.
- Each action must be DIFFERENT if the narrative is different. Sarcastic attack ≠ humanitarian post ≠ routine opposition allegation ≠ international issue.
- Actions must be realistically executable — something a BJP social media team would actually do today.
- Posts may be in Hindi, English, or mixed — read the full meaning and respond in English.

DECISION LOGIC (follow internally before writing):
1. Is the post high risk or low risk?
2. Is engagement viral, moderate, or negligible?
3. Is the narrative domestic, state-level, national, or foreign-policy?
4. Does responding help BJP or amplify the attack?
Then choose ONLY ONE action per post.

ALLOWED ACTION TYPES (use only if genuinely relevant):
- Ignore completely (state clearly why it is the smartest move)
- Amplify quietly (retweets, regional handles, supporter ecosystem)
- Counter with facts (official handle + specific data point)
- Redirect narrative (shift conversation to BJP achievements)
- Localize response (state unit handles, not central)
- Deploy video bite (spokesperson / minister clip)
- Let organic support respond (no official touch needed)
- Pre-empt future attack (context-setting post)

STYLE EXAMPLES:
✅ Good: "Ignore — engagement is low and responding would unnecessarily amplify this unverified governance allegation."
✅ Good: "Push a factual infographic from the BJP handle countering the employment data claim with PLFS numbers."
✅ Good: "Let state BJP handles amplify the positive angle; no central intervention required."
✅ Good: "Deploy a short spokesperson clip reframing this foreign-policy criticism around India's diplomatic record."
❌ Bad: "Monitor sentiment closely" / "Engage with balanced coverage" / same action repeated across posts.

CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON in this exact structure — no explanations, no markdown, no extra keys.
- The "actions" array must have EXACTLY the same number of entries as the Items array below, in the SAME ORDER.
- Each entry must be ONE sentence — the action only, no "ACTION:" prefix.

{ "actions": ["action for index 0", "action for index 1", ...] }

Items:
${JSON.stringify(itemsPayload, null, 2)}`;

  try {
    console.log(`[Gemini] Enriching ${tagged.length} items with specific cell actions...`);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: enrichPrompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini enrich API failed: ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed: { actions: string[] } = JSON.parse(cleaned);
    const actions = parsed.actions;

    if (!Array.isArray(actions) || actions.length !== tagged.length) {
      throw new Error('Gemini returned wrong number of actions');
    }

    // Re-assemble enriched items by bucket
    let pi = 0, ni = 0, ui = 0;
    const posEnriched: NewsItem[] = [];
    const neuEnriched: NewsItem[] = [];
    const negEnriched: NewsItem[] = [];

    tagged.forEach((t, i) => {
      const enriched: NewsItem = { ...t.item, bjpResponse: [actions[i]] };
      if (t.bucket === 'positive') { posEnriched[pi++] = enriched; }
      else if (t.bucket === 'neutral') { neuEnriched[ui++] = enriched; }
      else { negEnriched[ni++] = enriched; }
    });

    console.log('[Gemini] ✅ Cell actions enriched for all items.');

    // ─── Enrich issues with specific Gemini-generated suggestedAction ─────────
    const rawIssues = briefing.issues || [];
    let enrichedIssues = rawIssues;

    if (rawIssues.length > 0) {
      const issuesPayload = rawIssues.map((iss, i) => ({
        index: i,
        area: iss.area,
        issue: iss.issue,
        impact: iss.impact || '',
        evidence: iss.evidence || '',
      }));

      const issuesPrompt = `You are the head of the BJP Social Media Cell (IT Cell / War Room).

For each issue below, generate 3–4 SPECIFIC, ACTIONABLE bullet points the BJP Social Media Cell should execute TODAY.

RULES (MANDATORY):
- Think like a BJP social media head — decisive, direct, battle-ready.
- Each bullet = one specific executable action. No vague or generic advice.
- DIFFERENT actions per issue — the narrative context determines the response.
- Social Media Cell ONLY: posting, reframing, counter-narratives, infographics, reels, spokesperson clips, hashtag pushes.
- NO ministry names, NO governance actions, NO policy suggestions.
- Every bullet MUST start with one of: Clarify / Highlight / Amplify / Counter / Reframe / Reinforce / Publish / Share / Respond
- Each bullet max 1 sentence.

STYLE EXAMPLES:
✅ "Counter the farmer distress narrative by publishing state-wise MSP disbursement data as a BJP fact-card on X."
✅ "Amplify BJP Kisan Morcha's ground-level relief work via short reels from district handles."
✅ "Reframe the employment debate by sharing PLFS official data as an infographic targeting urban audiences."
❌ "Monitor the situation" / "The ministry should act" / same bullet repeated across issues.

CRITICAL OUTPUT FORMAT:
- Return ONLY valid JSON — no markdown, no explanation.
- The "actions" array must have EXACTLY the same number of entries as the Issues array, in the SAME ORDER.
- Each entry is a string with 3–4 bullet points separated by \\n, each starting with •

{ "actions": ["• bullet1\\n• bullet2\\n• bullet3", ...] }

Issues:
${JSON.stringify(issuesPayload, null, 2)}`;

      try {
        console.log(`[Gemini] Enriching ${rawIssues.length} issues with specific cell actions...`);
        const issRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: issuesPrompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
            }),
          }
        );

        if (issRes.ok) {
          const issData = await issRes.json();
          const issText = issData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const issCleaned = issText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const issParsed: { actions: string[] } = JSON.parse(issCleaned);
          if (Array.isArray(issParsed.actions) && issParsed.actions.length === rawIssues.length) {
            enrichedIssues = rawIssues.map((iss, i) => ({ ...iss, suggestedAction: issParsed.actions[i] }));
            console.log('[Gemini] ✅ Issue actions enriched for all issues.');
          } else {
            throw new Error('Gemini returned wrong number of issue actions');
          }
        } else {
          throw new Error(`Gemini issue enrich API failed: ${issRes.status}`);
        }
      } catch (issErr: any) {
        console.warn('[Gemini] Issue enrichment failed — using original suggestedActions:', issErr.message);
      }
    }

    return {
      ...briefing,
      issues: enrichedIssues,
      topNews: {
        ...briefing.topNews,
        positive: posEnriched,
        neutral:  neuEnriched,
        negative: negEnriched,
      },
    };
  } catch (err: any) {
    console.warn('[Gemini] enrichBriefingWithActions failed — using original briefing:', err.message);
    return briefing; // silent fallback, never breaks the UI
  }
}
