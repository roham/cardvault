// Year in Cards — annual hobby retrospectives, 2020-2025.
// Each year summarizes the dominant market story, biggest auction hammers,
// notable product launches, industry-level events, and a "year grade" A-F
// reflecting the hobby's overall condition that calendar year. Content is
// editorial commentary; specific hammer prices reference publicly reported
// sales where available.

export type YearGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D';
export type YearMood = 'EUPHORIC' | 'PEAK' | 'CRASH' | 'RESET' | 'RECOVERY' | 'STEADY';

export interface AnnualEntry {
  label: string;
  detail: string;
}

export interface CardYear {
  id: string;
  year: number;
  theme: string;            // one-sentence characterization
  grade: YearGrade;
  mood: YearMood;
  moodTint: string;         // tailwind class for mood badge
  marketMove: string;       // eg "+150% modern" or "-45% speculative"
  narrative: string;        // 2-3 sentence editorial
  topStories: AnnualEntry[];       // 3 major market narratives
  bigHammers: AnnualEntry[];       // 3 biggest auction results
  productLaunches: AnnualEntry[];  // 3 notable product releases
  industryEvents: AnnualEntry[];   // 2-3 industry-level happenings
  watershedMoment: string;        // 1 key turning point
  lookback: string;               // 1 retrospective sentence
  stats: AnnualEntry[];           // 3 quantitative stats
}

export const cardYears: CardYear[] = [
  {
    id: 'cy-2020',
    year: 2020,
    theme: 'The Boom Begins — lockdowns collide with cheap capital and the hobby discovers the internet is wide open.',
    grade: 'A+',
    mood: 'EUPHORIC',
    moodTint: 'from-emerald-500/20 to-emerald-900/10 text-emerald-300 border-emerald-500/40',
    marketMove: '+150% modern rookies YoY',
    narrative:
      'March 2020 shut the sports world down and funneled a generation of restless capital into cards. Modern rookies went parabolic: Trout, LeBron, Luka, and Mahomes all repriced 5–10x between April and December. Breakers became minor celebrities on eBay Live and Whatnot, and Goldin Auctions moved from a specialist outfit to the dominant modern-market venue almost overnight.',
    topStories: [
      { label: 'Pandemic pump', detail: 'With sports paused, retail capital pours into modern rookies — Luka Silver Prizm PSA 10 goes from ~$3K in February to ~$35K by December.' },
      { label: 'Logan Paul unboxes WotC', detail: '$200K+ first-edition Pokémon box openings on YouTube pull 30M+ views and re-price vintage TCG overnight.' },
      { label: 'LeBron Exquisite RPA', detail: 'July 2020 $1.8M Goldin hammer becomes the shot heard round retail — CNBC, Bloomberg, and Forbes run features within six weeks.' },
    ],
    bigHammers: [
      { label: '1952 Topps Mantle PSA 9', detail: '$5.2M private sale via PWCC (December 2020) — the then-record for any trading card.' },
      { label: 'LeBron 2003-04 Exquisite RPA PSA 10', detail: '$1.8M Goldin (July 2020) — the sale that minted modern as its own asset class.' },
      { label: 'T206 Honus Wagner PSA 2', detail: '$1.4M Memory Lane (December 2020) — low-grade Wagners catch the rising tide.' },
    ],
    productLaunches: [
      { label: 'Topps NOW record volume', detail: 'On-demand product hits lifetime-high print runs as collectors chase playoff moments from home.' },
      { label: 'Panini Flawless Collegiate', detail: 'First mainstream ultra-premium college-branded product — sets up the NIL era three years early.' },
      { label: 'Upper Deck Synergy NHL', detail: 'Retro-Chrome design returns; Lafrenière rookie anchors a breakout product year for hockey.' },
    ],
    industryEvents: [
      { label: 'PSA suspends Economy tier', detail: 'Grading backlog hits ~20-week turnaround; Economy suspended, prices bumped across the board.' },
      { label: 'eBay launches Authentication Guarantee', detail: 'Free third-party authentication for cards over $750 signals platform commitment to the category.' },
      { label: 'Topps–Mudrick SPAC collapses', detail: 'Proposed $1.3B public listing falls through in November after MLB non-renewal uncertainty.' },
    ],
    watershedMoment:
      'July\u2019s $1.8M LeBron Exquisite hammer. One sale, one mainstream news cycle, and retail collectors flood the platforms within weeks.',
    lookback:
      'The year the hobby stopped being a subculture and started being a search term.',
    stats: [
      { label: 'eBay card GMV', detail: 'Reported +142% YoY' },
      { label: 'PSA cert volume', detail: '~4.9M cards graded, roughly double 2019' },
      { label: 'Google Trends "sports cards"', detail: '+450% March\u2013December 2020' },
    ],
  },
  {
    id: 'cy-2021',
    year: 2021,
    theme: 'Peak Frenzy — modern rookies paint tops, Fanatics moves on Topps, and the hobby tries to swallow its own tail.',
    grade: 'A',
    mood: 'PEAK',
    moodTint: 'from-amber-500/20 to-orange-900/10 text-amber-300 border-amber-500/40',
    marketMove: '+80% Q1 peak / -25% Q4 retrace',
    narrative:
      'The January-through-April rally pushed modern rookies to heights no one had priced in. Luka Silver Prizm PSA 10 tagged roughly $75K in April; Trae Young, Ja Morant, and Justin Herbert all set all-time-high comps that still haven\u2019t been recovered. By Q4 the air had started leaving the room — the crash would come in 2022, but the exhaustion was already visible.',
    topStories: [
      { label: 'Fanatics\u2013Topps bombshell', detail: 'August 20, 2021: Fanatics announces MLB exclusive starting 2026, crashing Topps stock and rerouting the post-print-run industry.' },
      { label: 'Luka PSA 10 Silver peak', detail: 'Mid-April 2021 sale near $75K — modern-era high-water mark that still frames every subsequent "is it over?" piece.' },
      { label: 'Goldin exits standalone', detail: 'Ken Goldin announces sale of majority stake to eBay — closes January 2022 at reported nine-figure valuation.' },
    ],
    bigHammers: [
      { label: 'T206 Honus Wagner SGC 2 (Robert Edwards)', detail: '$6.606M in August 2021 — then a trading-card record and the first sub-grade-3 Wagner to clear $5M.' },
      { label: '1914 Baltimore News Babe Ruth PSA 3', detail: '$7.2M private (Rosen) — vintage hall of fame proves cash still parks at the top.' },
      { label: 'Tom Brady 2000 Playoff Contenders RC Auto BGS 9', detail: '$3.1M Lelands (April) — the Brady card that priced the category.' },
    ],
    productLaunches: [
      { label: 'Pokémon 25th Anniversary Celebrations', detail: 'McDonald\u2019s promo and mainline Celebrations sets spark a second TCG capital wave; packs sell out at retail for twelve straight weeks.' },
      { label: 'Topps Dynasty Baseball', detail: 'Premium return with 1/1 auto-patch focus; preamble to the ultra-high-end baseball arms race.' },
      { label: 'Panini Flawless NFL', detail: 'All-patch, no-base flagship cements Flawless as the prestige one-pack-per-box moment.' },
    ],
    industryEvents: [
      { label: 'MLBPA signs Fanatics direct', detail: 'Post-2022 MLBPA image licensing moves behind Fanatics, rerouting every baseball product from Panini onward.' },
      { label: 'PSA bulk price increase', detail: 'Base bulk tier jumps to $100 from $50; backlog briefly cleared, hobby discovers "waiting room grading."' },
      { label: 'Whatnot $1.5B valuation', detail: 'Live-auction platform closes Series D in August, signaling live-commerce is now where the breakers are.' },
    ],
    watershedMoment:
      'April\u2019s Luka $75K ceiling. The market printed a number nobody since has been able to touch.',
    lookback:
      'Anyone who sold in April 2021 looks like a genius. Anyone who held looks like a collector.',
    stats: [
      { label: 'Card Ladder modern index', detail: 'Peaks in May, then rolls over for 11 straight months' },
      { label: 'PSA cert volume', detail: '~11.5M cards graded, roughly +135% YoY' },
      { label: 'eBay card GMV', detail: 'Clears $2B trading-cards for the calendar year' },
    ],
  },
  {
    id: 'cy-2022',
    year: 2022,
    theme: 'The Crash — modern capitulates, the Mantle prints a record, and two things can be true at once.',
    grade: 'C',
    mood: 'CRASH',
    moodTint: 'from-rose-500/20 to-red-900/10 text-rose-300 border-rose-500/40',
    marketMove: '-45% modern speculative / vintage flat',
    narrative:
      'While modern rookies gave back 40-60% off 2021 peaks, vintage and single-digit populations held up shockingly well. August\u2019s $12.6M Mantle rewrote the ceiling even as modern breakers cut staff. The year taught the hobby that a crash in one half of the market can coexist with a record in the other.',
    topStories: [
      { label: 'Modern rookie capitulation', detail: 'Luka Silver drops from $75K peak to ~$15K by November; Justin Herbert Prizm drops 55% from Q1 2021 high; Trevor Lawrence Contenders Auto halves.' },
      { label: 'FTX collapse hits consignment', detail: 'November\u2019s exchange failure freezes several hundred million in collector capital; consignors pull grails from Q4 auctions.' },
      { label: 'Fanatics closes Topps acquisition', detail: 'January close at ~$500M; baseball\u2019s naming and physical production pipeline formally changes hands.' },
    ],
    bigHammers: [
      { label: '1952 Topps Mantle #311 SGC 9.5', detail: '$12.6M Heritage Platinum Night (August 27, 2022) — all-time trading card record, Anthony Giordano buyer.' },
      { label: 'Pikachu Illustrator PSA 10', detail: '$5.275M private sale to Logan Paul (July 2022) — single-digit-pop Pokémon grail.' },
      { label: 'LeBron 2003-04 Upper Deck Exquisite RPA 1/1 PSA 10', detail: '$5.2M private (reported H1 2022) — RPA grail holds despite broader modern compression.' },
    ],
    productLaunches: [
      { label: 'Topps Chrome Baseball F/S Update expansion', detail: 'Full Chrome refractor treatment on Update rookies; Spencer Strider and Bobby Witt Jr. set the tone.' },
      { label: 'Panini One Football', detail: 'Hand-numbered 1/1-per-player patch/auto/card product built for the post-ultra-premium era.' },
      { label: 'Bowman Sterling Baseball returns', detail: 'First revival since 2015; mini-parallels reconnect with early-2010s prospect collectors.' },
    ],
    industryEvents: [
      { label: 'PWCC restructuring', detail: 'November 2022 CEO Brent Huigens departs; PWCC Marketplace winds down U.S. consignment operations through Q1 2023.' },
      { label: 'Panini \u2194 Fanatics lawsuits', detail: 'August filings allege anti-competitive behavior around NFLPA/NBAPA exclusive deals; litigation runs through 2024.' },
      { label: 'eBay restructures vault', detail: 'eBay\u2019s Arizona vault quietly adjusts fee schedule; large consignors begin testing Fanatics\u2019 emerging direct channels.' },
    ],
    watershedMoment:
      'The $12.6M Mantle landing the same summer modern breakers cut staff. Two markets, one hobby, finally made visible.',
    lookback:
      'The year the vintage hierarchy re-announced itself while modern speculation got a haircut.',
    stats: [
      { label: 'eBay card GMV', detail: 'Reported \u224835% from 2021 peak for modern, flat for vintage' },
      { label: 'PSA cert volume', detail: '~8.8M cards graded, roughly -25% YoY' },
      { label: 'Modern rookie median', detail: 'Down 42% from Q2 2021 peak per Card Ladder 2022-end report' },
    ],
  },
  {
    id: 'cy-2023',
    year: 2023,
    theme: 'The Reset — Wemby debuts, the crash fails to continue, and everyone who predicted zero looks away.',
    grade: 'B',
    mood: 'RESET',
    moodTint: 'from-sky-500/20 to-blue-900/10 text-sky-300 border-sky-500/40',
    marketMove: 'Flat modern / +5% vintage blue-chip',
    narrative:
      'The expected 2023 leg down never really came. Instead, the market found footing: modern stabilized, vintage edged up, and Victor Wembanyama\u2019s rookie year introduced the first post-2018 class to actually reprice on hype. The Fanatics-under-Topps year ran clean — the product looked identical, the packaging said "Topps," and collectors mostly shrugged.',
    topStories: [
      { label: 'Wemby rookie year', detail: '2023-24 Topps Chrome and Bowman Chrome University superfractors become the highest-comped new-player cards since Luka five years earlier.' },
      { label: 'First Fanatics-owned Topps', detail: '2023 Topps Series 1 ships January under Fanatics ownership; Chrome, Heritage, Chrome Update all execute without visible disruption.' },
      { label: 'Caitlin Clark Iowa run', detail: 'NCAA tournament and Final Four driving Bowman University Chrome RCs to retail shortage and first-hint Prizm Draft Picks comps.' },
    ],
    bigHammers: [
      { label: 'T206 Wagner PSA/SGC 5', detail: '$7.25M private (Robert Edwards/Heritage split-report) — another ceiling nudge for the iconic Wagner.' },
      { label: '1996-97 Kobe Topps Chrome Refractor PSA 10', detail: '~$295K Goldin Q2 — shows modern-vintage continues to hold at the high end.' },
      { label: '1986 Fleer Jordan PSA 10', detail: 'Range settles $280-320K from 2021 peak of ~$840K; pop growth meets durable demand.' },
    ],
    productLaunches: [
      { label: 'Bowman Chrome University', detail: 'First full-season NIL-era college baseball/football/basketball chrome product.' },
      { label: 'Topps Dynasty Basketball (last pre-exclusive)', detail: 'Final Topps-branded premium basketball product before Fanatics-NBAPA transition.' },
      { label: 'Topps Stadium Club Chrome returns', detail: 'Photography-forward mid-premium reboot after a dormant half-decade; hits retail shortage inside three weeks.' },
    ],
    industryEvents: [
      { label: 'PSA pricing reform', detail: 'Introduces multi-year membership sub tiers and stabilizes bulk turnaround at 45\u201365 days.' },
      { label: 'CGC sports expansion', detail: 'Aggressive pricing on sub-$500 cards drives CGC share from low single digits to ~12% of sports market.' },
      { label: 'Goldin launches Weekly', detail: 'Shifts rhythm from monthly Platinum Night to high-cadence Weekly + quarterly Elite \u2014 changes dealer consignment math.' },
    ],
    watershedMoment:
      'Wemby\u2019s October debut resetting the "who\u2019s the new Luka" conversation with a card class that actually had volume.',
    lookback:
      'Everyone waiting for 2023 to finish the 2022 crash is still waiting.',
    stats: [
      { label: 'PSA cert volume', detail: '~10.3M cards graded, +17% YoY' },
      { label: 'Whatnot GMV', detail: 'Reported +60% YoY across live-auction verticals' },
      { label: 'eBay card GMV', detail: 'Flat vs 2022 \u2014 modern stabilized, vintage slightly up' },
    ],
  },
  {
    id: 'cy-2024',
    year: 2024,
    theme: 'Recovery Begins — Caitlin Clark changes which aisle women\u2019s cards live in, and Wemby locks the Year Two bump.',
    grade: 'B+',
    mood: 'RECOVERY',
    moodTint: 'from-teal-500/20 to-emerald-900/10 text-teal-300 border-teal-500/40',
    marketMove: '+10% modern grails / +8% vintage blue-chip',
    narrative:
      'Caitlin Clark\u2019s Fever debut lit up a dormant corner of the hobby and Indiana Fever product wasn\u2019t in shelves at the pace demand wanted it. Wemby\u2019s ROY-into-DPOY season validated his rookie-year pricing. Modern grail pop-1 and pop-2 cards led the year; speculative base rookies stayed quiet.',
    topStories: [
      { label: 'Caitlin Clark WNBA RC wave', detail: '2024 Panini Prizm WNBA Clark base hits $1.5K PSA 10 peak and $400 retail raw within weeks; Fever tickets and Clark cards move together.' },
      { label: 'Wemby DPOY year', detail: '2023-24 Topps Chrome/Bowman University Wemby refractor rainbow holds comps through Year Two — the first modern RC in five years to avoid the sophomore dip.' },
      { label: 'Fanatics Collect platform', detail: 'Direct-to-collector marketplace exits beta, positioned as eBay alternative with preferred fee structure for breakers and dealers.' },
    ],
    bigHammers: [
      { label: '1909 T206 Wagner SGC 2', detail: '$2.8M Memory Lane November \u2014 low-grade Wagner continues to compound against the ceiling.' },
      { label: 'Mahomes 2017 National Treasures RPA 1/1', detail: '$860K Goldin May \u2014 the Mahomes market re-rates on three Super Bowls.' },
      { label: 'Caitlin Clark 2024 Prizm WNBA Silver PSA 10', detail: 'Peak comp ~$30K spring; settles into $10-12K range by year-end as pop grows.' },
    ],
    productLaunches: [
      { label: 'Panini Prizm Draft Picks (NIL loaded)', detail: 'College Prizm with direct NIL signatures becomes the prospect-category entry point.' },
      { label: '2024 Bowman Chrome 2nd Year RC', detail: 'Bowman Chrome introduces officially designated 2nd-year RCs, changing the "which rookie" debate.' },
      { label: '2024-25 Topps Chrome Basketball (final)', detail: 'Last Topps-branded basketball release; Fanatics\u2013NBAPA direct begins 2025-26.' },
    ],
    industryEvents: [
      { label: 'PSA App + stable pricing', detail: 'Rolls out consumer-facing app; introduces multi-year sub with locked pricing to retain high-volume submitters.' },
      { label: 'Sports Card Investor CLM shutdown', detail: 'Card Ladder Market platform winds down; operators fold into standalone Card Ladder data product.' },
      { label: 'CGC sports crosses 15% share', detail: 'First non-PSA grader to sustain 15%+ sports share for a full quarter.' },
    ],
    watershedMoment:
      'Caitlin Clark\u2019s spring. The hobby discovered it had a second audience that wasn\u2019t being served, and the first product cycle barely caught the demand.',
    lookback:
      'If you bought Clark Prizm PSA 10s at $30K you relearned the Luka lesson. If you bought her base raw at $40 you didn\u2019t.',
    stats: [
      { label: 'Whatnot lifetime GMV', detail: 'Crosses $5B cumulative across live-commerce' },
      { label: 'PSA cert volume', detail: '~12.6M cards graded, +22% YoY' },
      { label: 'Clark Prizm base PSA 10 peak', detail: '$30K April 2024 \u2192 $10-12K December 2024' },
    ],
  },
  {
    id: 'cy-2025',
    year: 2025,
    theme: 'Normal Year \u2014 Fanatics ships its first full NBA product, women\u2019s cards settle, and the hobby exhales.',
    grade: 'B',
    mood: 'STEADY',
    moodTint: 'from-indigo-500/20 to-violet-900/10 text-indigo-300 border-indigo-500/40',
    marketMove: '+3% overall market / +8% pop-1 grails',
    narrative:
      'The first full season of Fanatics-NBAPA product shipped without a logo crisis. Caitlin Clark PSA 10 comps settled in the $8-12K range and stopped making daily news. The 2025 NBA Draft\u2019s Cooper Flagg prospect wave rebuilt the pre-rookie speculation pipeline for the first time since Wemby, but values stayed rational. The calmest year the hobby had managed since 2019.',
    topStories: [
      { label: 'Fanatics-NBAPA first season', detail: '2024-25 becomes the first full season without a Topps-branded NBA product; Fanatics-Panini transition handled smoother than market feared.' },
      { label: 'Clark settles, market relaxes', detail: 'Prizm WNBA PSA 10 settles into $8-12K range through 2025; audience expansion persists, speculation cools.' },
      { label: 'Cooper Flagg pre-rookie run', detail: 'Bowman U Chrome Superfractor rumors drive the first real prospect-tier speculation since Wemby; stays orderly.' },
    ],
    bigHammers: [
      { label: '1909 T206 Wagner SGC 3 (Heritage)', detail: '~$3.1M February \u2014 Wagner continues its ~2x-per-decade compounding.' },
      { label: 'Derek Jeter 1993 SP Foil PSA 10', detail: '~$600K Goldin Q3 \u2014 final-year of the 1993 SP foil chips era returns to headline comps.' },
      { label: '2003-04 LeBron Topps Chrome Refractor PSA 10', detail: '~$320K \u2014 recovery comp that shows modern-vintage is quietly grinding back.' },
    ],
    productLaunches: [
      { label: 'Fanatics NBA Flagship', detail: 'First fully Fanatics-branded NBA product; retains Panini production partner structure through the transition year.' },
      { label: 'Topps Chrome Baseball (Fanatics)', detail: 'Steady-state product: no design revolt, no disruption, a deliberately boring launch.' },
      { label: 'Bowman University Chrome Football', detail: 'NIL football crosses into Chrome territory; Arch Manning base inserts anchor the product.' },
    ],
    industryEvents: [
      { label: 'PSA sub restructuring complete', detail: 'Multi-year membership + stable pricing becomes the default; one-off bulk submissions decline in share.' },
      { label: 'Goldin $100M quarter', detail: 'Single-quarter hammer exceeds $100M for the first time in platform history.' },
      { label: 'eBay Authenticity Guarantee expansion', detail: 'Threshold lowered to $250; daily-driver raw cards get third-party handling by default.' },
    ],
    watershedMoment:
      'The first Fanatics-branded flagship NBA product landing without visible retailer or collector revolt. The transition worked.',
    lookback:
      'The most normal year the hobby has had since 2019.',
    stats: [
      { label: 'eBay card GMV', detail: 'Back in range of 2021 peak, mix now weighted vintage/grail' },
      { label: 'PSA cert volume', detail: '~13M cards graded, roughly +4% YoY' },
      { label: 'Goldin quarterly record', detail: 'Q3 2025 crosses $100M gross for the first time' },
    ],
  },
];

export const YEAR_GRADE_STYLE: Record<YearGrade, { fg: string; bg: string }> = {
  'A+': { fg: 'text-emerald-200', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  'A':  { fg: 'text-emerald-200', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  'A-': { fg: 'text-teal-200',    bg: 'bg-teal-500/15 border-teal-500/30' },
  'B+': { fg: 'text-sky-200',     bg: 'bg-sky-500/15 border-sky-500/30' },
  'B':  { fg: 'text-indigo-200',  bg: 'bg-indigo-500/15 border-indigo-500/30' },
  'B-': { fg: 'text-violet-200',  bg: 'bg-violet-500/15 border-violet-500/30' },
  'C+': { fg: 'text-amber-200',   bg: 'bg-amber-500/15 border-amber-500/30' },
  'C':  { fg: 'text-orange-200',  bg: 'bg-orange-500/15 border-orange-500/30' },
  'D':  { fg: 'text-rose-200',    bg: 'bg-rose-500/15 border-rose-500/30' },
};
