export type MonthVibe = 'PEAK' | 'HOT' | 'STEADY' | 'BUILD' | 'COLD';
export type SpendTier = 'low' | 'moderate' | 'high' | 'peak';

export interface AlmanacRelease {
  label: string;
  sport: 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'Multi' | 'Pokemon';
  detail: string;
}

export interface AlmanacEvent {
  label: string;
  location?: string;
  detail: string;
}

export interface AlmanacStoryline {
  label: string;
  sport: 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'Multi';
  detail: string;
}

export interface AlmanacHistoricalNote {
  year: number;
  note: string;
}

export interface AlmanacMonth {
  month: number;
  name: string;
  emoji: string;
  theme: string;
  tagline: string;
  vibe: MonthVibe;
  spend: SpendTier;
  releases: AlmanacRelease[];
  events: AlmanacEvent[];
  storylines: AlmanacStoryline[];
  buyAdvice: string;
  sellAdvice: string;
  historical: AlmanacHistoricalNote[];
}

export const VIBE_STYLE: Record<MonthVibe, { label: string; bg: string; text: string; border: string }> = {
  PEAK: { label: 'PEAK', bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-800/60' },
  HOT: { label: 'HOT', bg: 'bg-orange-950/60', text: 'text-orange-300', border: 'border-orange-800/60' },
  STEADY: { label: 'STEADY', bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800/60' },
  BUILD: { label: 'BUILD', bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-800/60' },
  COLD: { label: 'COLD', bg: 'bg-sky-950/60', text: 'text-sky-300', border: 'border-sky-800/60' },
};

export const SPEND_STYLE: Record<SpendTier, { label: string; color: string }> = {
  low: { label: 'Low spend', color: 'text-emerald-300' },
  moderate: { label: 'Moderate spend', color: 'text-amber-300' },
  high: { label: 'High spend', color: 'text-orange-300' },
  peak: { label: 'Peak spend', color: 'text-rose-300' },
};

export const almanacMonths: AlmanacMonth[] = [
  {
    month: 1,
    name: 'January',
    emoji: '❄️',
    theme: 'NFL playoffs + hobby hangover',
    tagline: 'The hobby year starts cold. Wallets are recovering from December, card shows are quiet, and most collectors are NFL-only until All-Star Weekend.',
    vibe: 'COLD',
    spend: 'low',
    releases: [
      { label: '2024-25 Upper Deck Series 2 (NHL)', sport: 'NHL', detail: 'Back-half Young Guns rookies for the current NHL season — late call-ups and early Calder contenders land here.' },
      { label: '2025 Topps Series 1 (MLB)', sport: 'MLB', detail: 'The annual flagship MLB base set. Rookie Cup subset + Future Stars + Update candidates. First card for dozens of 2025 debut arms.' },
      { label: '2024-25 Panini Prizm Monopoly WWE / UFC (Multi)', sport: 'Multi', detail: 'Niche crossover Prizm products that see collector interest during the NBA/NFL gap period.' },
    ],
    events: [
      { label: 'NFL Wild Card + Divisional weekends', location: 'Nationwide', detail: 'Playoff QBs + RBs see 30-60% hobby spikes on monster performances. Primetime TDs = overnight eBay listing waves.' },
      { label: 'NHL Winter Classic fallout', location: 'Outdoor rink TBD', detail: 'The New Year\u2019s Day Winter Classic creates a 2-week hobby bump for the featured teams\u2019 rookies.' },
    ],
    storylines: [
      { label: 'NFL playoff run narratives', sport: 'NFL', detail: 'Which rookie QB survives to the AFC/NFC Championship. Which underdog RB gets "Playoff Legend" treatment. Stock movers are earned here.' },
      { label: 'MLB free agent signings tail end', sport: 'MLB', detail: 'Late-January free agent deals reshape the Topps Series 1 narrative — which team did your new star land on?' },
    ],
    buyAdvice: 'Buy slow-grading backlog cards at soft prices. Vintage vintage (pre-1970) holds steady. Modern rookies of non-playoff teams dip — this is accumulation month for football rookies whose teams missed the playoffs.',
    sellAdvice: 'Do not sell. Most buyers are sidelined; inventory clears at a 15-25% discount vs November peaks.',
    historical: [
      { year: 2021, note: 'January 2021 marked the final month before the February-April 2021 modern boom peaked — prices doubled for top rookie RCs by April.' },
      { year: 2022, note: 'January 2022 saw Topps announce the loss of the MLB license to Fanatics, reshaping the entire baseball hobby.' },
      { year: 2023, note: 'January 2023 was the bottom of the 2022 crash — speculative modern had bled out 40-60% from 2021 peaks.' },
    ],
  },
  {
    month: 2,
    name: 'February',
    emoji: '🏀',
    theme: 'Super Bowl + NBA All-Star',
    tagline: 'The single biggest NFL hobby week of the year, then NBA All-Star Weekend reshapes basketball narratives.',
    vibe: 'PEAK',
    spend: 'peak',
    releases: [
      { label: '2024 Panini Prizm Football (NFL)', sport: 'NFL', detail: 'The delayed flagship NFL Prizm typically ships late January / early February. Silver parallels become the hobby\u2019s most-chased parallel for 60 days post-release.' },
      { label: '2024 Panini Contenders Optic Football (NFL)', sport: 'NFL', detail: 'Rookie Ticket autographs — the canonical NFL rookie auto. Silver Cracked Ice parallels are the Super Bowl timing chase.' },
      { label: '2024-25 Panini Revolution (NBA)', sport: 'NBA', detail: 'Mid-tier NBA chrome product. Astro + Galactic color parallels. Ships ahead of All-Star Weekend.' },
    ],
    events: [
      { label: 'Super Bowl LIX week', location: 'Super Bowl host city', detail: 'Super Bowl-winning QBs see 2-3x hobby spikes overnight. MVPs print records. Losing QBs dip 20-30% for 60 days.' },
      { label: 'NBA All-Star Weekend', location: 'All-Star host city', detail: 'Three-Point Contest + Slam Dunk Contest winners see 2-week spikes. First-time All-Star selection = permanent hobby reprice.' },
      { label: 'NBA Trade Deadline', location: 'League-wide', detail: 'Early-February deadline reshapes team-based hobby. New-team Prizm RCs + Panini Instant print-on-demand trade cards move fast.' },
    ],
    storylines: [
      { label: 'Super Bowl MVP narrative', sport: 'NFL', detail: 'The Super Bowl MVP captures a decade of hobby weight in 4 hours. Backup QB winners (Nick Foles 2018, Jimmy Garoppolo 2020, Patrick Mahomes\u2019 brother) create outlier card arcs.' },
      { label: 'NBA All-Star Weekend highlights', sport: 'NBA', detail: 'Dunk Contest winner\u2019s Prizm Silver typically gains 30-50% in 48 hours. MVP of the game = institutional hobby weight.' },
      { label: 'MLB Spring Training openings', sport: 'MLB', detail: 'Pitchers + catchers report late February. First bullpen-session videos from top prospects = Bowman Chrome spike catalysts.' },
    ],
    buyAdvice: 'Do not buy flagship NFL rookies during Super Bowl week — prices are 20-35% above steady-state. Buy losing-team Super Bowl rookies 2 weeks post-game at a discount.',
    sellAdvice: 'Sell Super Bowl MVP + winning-team star rookies in the 7-day post-game window — prices peak there and normalize within 30 days.',
    historical: [
      { year: 2021, note: 'Super Bowl LV Brady-Mahomes produced the last \u201cdual-GOAT\u201d card window — both players\u2019 Contenders autos spiked 60%+ through the week.' },
      { year: 2023, note: 'Mahomes\u2019 second Super Bowl MVP in Super Bowl LVII locked in the $3,000+ Contenders Championship Ticket tier permanently.' },
    ],
  },
  {
    month: 3,
    name: 'March',
    emoji: '🎓',
    theme: 'March Madness + MLB Spring Training',
    tagline: 'College basketball takes center stage. MLB prospect watch heats up. Final pre-NFL-draft speculation window.',
    vibe: 'HOT',
    spend: 'high',
    releases: [
      { label: '2025 Bowman Chrome Draft (MLB)', sport: 'MLB', detail: 'Prior-year MLB draft class 1st Bowman Chrome cards. The canonical MLB prospecting entry — some of the hottest RCs in the hobby ship here annually.' },
      { label: '2024 Panini Immaculate Football (NFL)', sport: 'NFL', detail: 'Ultra-premium NFL rookie patch autos. Lowest-print NFL RPAs of the year.' },
      { label: '2023-24 Upper Deck Synergy / Black Diamond (NHL)', sport: 'NHL', detail: 'Premium NHL supplemental products. Relic + auto short-prints favor Young Guns carryover stars.' },
    ],
    events: [
      { label: 'March Madness', location: 'Nationwide', detail: 'College basketball\u2019s 3-week tournament reshapes the NBA Draft order in the hobby market. Elite 8 / Final Four breakout RCs spike 40-100%.' },
      { label: 'MLB Spring Training games', location: 'FL + AZ', detail: 'Spring Training stats don\u2019t count, but stat-line leaks from camp fuel Bowman Chrome 1st Bowman speculation. Top prospect home runs trend daily.' },
    ],
    storylines: [
      { label: 'NCAA Tournament breakouts', sport: 'NBA', detail: 'The \u201cone-game hero\u201d archetype — a role player who scores 30 in a tournament game and repices their Bowman University RC overnight.' },
      { label: 'MLB Opening Day rookie projections', sport: 'MLB', detail: 'Which top prospects break camp with the big-league team vs. start in AAA. Service-time manipulation debates + Super 2 cutoff speculation.' },
      { label: 'NFL Combine + Pro Day tape', sport: 'NFL', detail: 'Combine 40 times + Pro Day measurements are the last pre-draft variables. Each week creates 2-3 stock movers.' },
    ],
    buyAdvice: 'Buy Bowman University RCs of players who made the Sweet 16 but weren\u2019t national-TV stars. Market is slow to reprice. Accumulate before Elite 8.',
    sellAdvice: 'Sell pre-tournament favorites whose teams got upset in the first weekend. Post-March-Madness pricing takes 60-90 days to recover.',
    historical: [
      { year: 2022, note: '\u201918 Kansas guard Christian Braun Bowman RCs spiked 250% in 4 days after Kansas won the national title.' },
      { year: 2023, note: 'San Diego State\u2019s Darrion Trammell hit a buzzer-beater; his previously-zero-value Bowman RC printed $60 PSA 10 overnight.' },
    ],
  },
  {
    month: 4,
    name: 'April',
    emoji: '⚾',
    theme: 'MLB Opening Day + NBA playoff race + NFL Draft',
    tagline: 'Three sports pull equally — MLB\u2019s first pitch, NBA playoff positioning, and the final countdown to NFL Draft night.',
    vibe: 'PEAK',
    spend: 'peak',
    releases: [
      { label: '2025 Topps Chrome (MLB)', sport: 'MLB', detail: 'The canonical MLB chrome base + Rookie Debut Patch + refractor parallel runs. Some of the most-bought MLB cards of the year.' },
      { label: '2024-25 Panini National Treasures (NBA)', sport: 'NBA', detail: 'NBA\u2019s highest-end product. Rookie Patch Autographs /99 are the premier RPA tier in basketball. Hobby royalty.' },
      { label: '2025 Bowman Chrome (MLB)', sport: 'MLB', detail: 'Flagship prospect chrome product. Top MLB prospect 1st Bowman Chrome cards debut here.' },
    ],
    events: [
      { label: 'MLB Opening Day', location: 'Nationwide', detail: 'First at-bat + first pitch moments can reprice rookie Bowman RCs overnight. Walkoff HRs on Opening Day = immediate hobby folklore.' },
      { label: 'NFL Draft', location: 'Draft host city', detail: 'Last Thursday of April. The single biggest 4-hour hobby event of the year. First-round WRs + QBs reprice in real-time during the broadcast.' },
      { label: 'NBA Play-In + Round 1', location: 'Nationwide', detail: 'Seeding races + Round 1 narratives produce 2-3 hobby stock movers per week.' },
      { label: 'Masters Golf (tangential)', location: 'Augusta GA', detail: 'Golf is a niche card segment but a Masters winner\u2019s Upper Deck SP Authentic RC prints a 6-8 week hobby arc.' },
    ],
    storylines: [
      { label: 'NFL Draft landing spots', sport: 'NFL', detail: 'Draft-night team fit determines 6-12 months of hobby momentum. Receiver landing on run-first team = 30% hobby haircut; QB landing with offensive-coordinator match = 2x reprice.' },
      { label: 'MLB prospect callups', sport: 'MLB', detail: 'April callups avoid Super 2 service-time penalty, opening the window for the most valuable top prospect debuts of the year.' },
      { label: 'NBA MVP + ROY final voting window', sport: 'NBA', detail: 'Regular season wraps; MVP + ROY ballots lock on the last day of the regular season. Dark-horse ROY candidates see hobby spikes.' },
    ],
    buyAdvice: 'Pre-draft, buy WR rookies projected top-15 who are being mocked to rush-first teams — the narrative discount creates a 40% value gap vs the fair market.',
    sellAdvice: 'Sell QBs projected top-5 during the 48 hours before the draft — pre-draft speculation peaks there, post-draft landing-spot discounts are common.',
    historical: [
      { year: 2023, note: 'Bryce Young\u2019s pre-draft Bowman Chrome RC was trading at $450 PSA 10; after landing in Carolina with a middling roster, it settled at $120 within 90 days.' },
      { year: 2024, note: 'Caleb Williams\u2019 post-draft Bears landing sparked a 2x Bowman University RC move within 48 hours.' },
    ],
  },
  {
    month: 5,
    name: 'May',
    emoji: '🏆',
    theme: 'NBA Conference Finals + NHL playoff run + MLB settling',
    tagline: 'NBA\u2019s final four reshape the hobby. Stanley Cup playoffs hit peak narrative. MLB rookies find their footing.',
    vibe: 'HOT',
    spend: 'high',
    releases: [
      { label: '2024 Panini Select Football (NFL)', sport: 'NFL', detail: 'Late-May NFL Select shipment. Concourse / Premier / Courtside tiers for the 2024 draft class.' },
      { label: '2024-25 Upper Deck SP Authentic Hockey (NHL)', sport: 'NHL', detail: 'The premier on-card NHL rookie auto format. Future Watch Autographs /999 are the hobby canonical hockey rookie auto tier.' },
      { label: '2025 Topps Heritage (MLB)', sport: 'MLB', detail: 'Throwback-design MLB product mimicking the 1976 Topps design. Real / Hot Parallel / Black parallel + rookie auto cards.' },
    ],
    events: [
      { label: 'NBA Conference Finals', location: 'Nationwide', detail: 'Series-defining performances reshape playoff-legacy narratives. Conference Finals MVP = permanent hobby reprice.' },
      { label: 'NHL Conference Finals + Stanley Cup Final start', location: 'Nationwide', detail: 'Hockey\u2019s premier hobby window. Cup-final rookies see 50-100% spikes.' },
      { label: 'Kentucky Derby aftermath', location: 'Churchill Downs KY', detail: 'Tangential to cards but Breeders\u2019 Cup winners get niche horse-racing hobby coverage.' },
    ],
    storylines: [
      { label: 'NBA Finals seeding', sport: 'NBA', detail: 'Which two teams advance determines 6 months of hobby narrative. \u201cWho was the second-best player on the winning team\u201d debates set rookie hierarchies.' },
      { label: 'MLB Rookie of the Year first-half cases', sport: 'MLB', detail: 'Mid-May performance separates the front-runners from the injured / demoted also-rans. Hobby consolidates around the leaderboard.' },
    ],
    buyAdvice: 'Buy NBA playoff team role-player rookies — they\u2019re undervalued vs star teammates but see 30-50% spikes if the team reaches the Finals.',
    sellAdvice: 'Sell NBA regular-season awards winners within 30 days of the award announcement — \u201cpeak recognition\u201d typically fades by October.',
    historical: [
      { year: 2021, note: 'Giannis\u2019 Milwaukee Bucks Finals run produced a 3x move on his 2013 Topps Chrome refractor through May-July 2021.' },
      { year: 2023, note: 'Florida Panthers\u2019 Cinderella run saw Matthew Tkachuk\u2019s Young Guns RC spike 40% in 14 days.' },
    ],
  },
  {
    month: 6,
    name: 'June',
    emoji: '🏀',
    theme: 'NBA Finals + NHL Stanley Cup + MLB Draft',
    tagline: 'Two championships crown and one draft drops. The last full summer hobby burst before vacation months.',
    vibe: 'PEAK',
    spend: 'peak',
    releases: [
      { label: '2024 Topps Tier One / Archives Signatures (MLB)', sport: 'MLB', detail: 'Premium MLB on-card auto products. Tier One is the $150+ per-pack elite auto tier.' },
      { label: '2024-25 Panini Flawless Basketball (NBA)', sport: 'NBA', detail: 'NBA\u2019s most premium product — $1,500+ per box. Logoman /1, Dual Signatures /10, Ruby /5. The ceiling of NBA hobby pricing.' },
      { label: '2024 Bowman Draft (MLB)', sport: 'MLB', detail: 'The 2024 draft class\u2019s first Bowman product — 1st Bowman Chrome card territory (though flagship is Q4 Chrome Draft).' },
    ],
    events: [
      { label: 'NBA Finals', location: 'Nationwide', detail: 'The single biggest NBA hobby event of the year. Finals MVP = permanent top-tier hobby weight.' },
      { label: 'Stanley Cup Final', location: 'Nationwide', detail: 'Hockey\u2019s championship. Cup-winning rookies reprice 50-100% within 48 hours.' },
      { label: 'MLB Draft', location: 'All-Star Game host city', detail: 'The MLB Draft moved to All-Star weekend in July but college baseball\u2019s signing deadline + top-10 projection window peaks here.' },
      { label: 'NBA Draft Lottery + pre-draft workouts', location: 'Chicago IL', detail: 'Lottery results determine team-fit trades. Workouts create daily stock movers.' },
    ],
    storylines: [
      { label: 'NBA Finals MVP debate', sport: 'NBA', detail: 'Close Finals series produce 2-3 candidates. The winner gets the permanent Trophy Case bump.' },
      { label: 'Stanley Cup winner narrative', sport: 'NHL', detail: 'Winner\u2019s roster Young Guns + Premieres RCs see organic hobby demand into 2025-26 season.' },
    ],
    buyAdvice: 'Buy NBA runner-up team star rookies 2 weeks after the Finals end — the loss discount is typically 15-25% below pre-Finals pricing and recovers within the off-season.',
    sellAdvice: 'Sell Finals MVP at the 7-14 day post-championship peak. Historical retrace is 20-30% within 60 days as the news cycle fades.',
    historical: [
      { year: 2023, note: 'Nuggets\u2019 first Finals championship repriced Jokic\u2019s entire RC tier — 2014-15 Panini Prizm Silver gained $2,500 in book value over 90 days.' },
      { year: 2024, note: 'Celtics\u2019 Finals win consolidated Jayson Tatum\u2019s \u201cface of the league\u201d hobby lane — 2017-18 Prizm Silver touched $8K.' },
    ],
  },
  {
    month: 7,
    name: 'July',
    emoji: '🎤',
    theme: 'The National + MLB All-Star + NBA Summer League',
    tagline: 'The hobby\u2019s single biggest in-person event is always in July. The National redirects all spending to one city for 5 days.',
    vibe: 'PEAK',
    spend: 'peak',
    releases: [
      { label: '2024-25 Panini Prizm Basketball (NBA)', sport: 'NBA', detail: 'The canonical NBA flagship Prizm typically ships late July (behind the historical schedule). Silver parallels = 60-day obsession.' },
      { label: '2025 Topps Update (MLB)', sport: 'MLB', detail: 'The flagship MLB rookie-debut capture product — all rookies called up through July get their institutional RC here.' },
      { label: 'NHL Ultimate Collection (NHL)', sport: 'NHL', detail: 'Premium NHL auto product. Ships just ahead of October season start.' },
    ],
    events: [
      { label: 'The National Sports Collectors Convention', location: 'Rotates: Rosemont IL / Atlantic City NJ / Cleveland OH', detail: 'The hobby\u2019s Super Bowl. 5-day convention. 600+ dealers. Exclusive redemption cards. Thousands of attendees. The single biggest pricing event of the year.' },
      { label: 'MLB All-Star Game', location: 'All-Star host city', detail: 'Home Run Derby winner = permanent hobby lane. First-time All-Star selection = career reprice.' },
      { label: 'NBA Summer League', location: 'Las Vegas NV', detail: 'Rookie class\u2019s first real NBA-level game footage. Summer League MVP historically predicts ROY narrative.' },
      { label: 'MLB Trade Deadline (late July)', location: 'League-wide', detail: 'Contenders acquire stars; rebuilders acquire prospects. Panini Instant print-on-demand trade cards dominate the week.' },
    ],
    storylines: [
      { label: 'National exclusive redemption chase', sport: 'Multi', detail: 'Panini + Topps release NSCC-only exclusive base cards + auto redemptions. Flippable-in-real-time on the show floor.' },
      { label: 'Summer League rookie breakouts', sport: 'NBA', detail: 'Role-player rookies who weren\u2019t first-round picks but dominate Summer League see 2-3x RC moves within 10 days.' },
    ],
    buyAdvice: 'Budget for National cash-in-hand deals — dealers discount inventory to rotate capital. 15-30% discounts on sealed wax + singles are typical.',
    sellAdvice: 'Pre-National, list high-tier autographs through July. The 2-week window before National compresses prices 10-15% as collectors save for show-floor inventory.',
    historical: [
      { year: 2021, note: 'The National 2021 (Chicago) marked the top of the modern hobby peak — in-person prices exceeded online comps by 20-30% for the first and last time.' },
      { year: 2024, note: 'The National 2024 saw the $12.6M Mantle return to public display. Attendance topped 100K for the first time.' },
    ],
  },
  {
    month: 8,
    name: 'August',
    emoji: '🎬',
    theme: 'NFL preseason + MLB stretch + NBA offseason content',
    tagline: 'The NFL season is starting. MLB is in the dog days. NBA spends August on media-day content.',
    vibe: 'HOT',
    spend: 'high',
    releases: [
      { label: '2025 Topps Chrome Update (MLB)', sport: 'MLB', detail: 'Late-summer chrome update product. Includes mid-season rookie debut RCs.' },
      { label: '2024-25 Panini Select Basketball (NBA)', sport: 'NBA', detail: 'Previous-season NBA rookie class Select product. Concourse / Premier / Courtside tiers.' },
      { label: '2025 Bowman Chrome (MLB)', sport: 'MLB', detail: 'Occasional August late-releases. Covers mid-season MLB debuts + top prospects who moved up organizational depth charts.' },
    ],
    events: [
      { label: 'NFL Preseason games', location: 'Nationwide', detail: 'Preseason injuries + breakout rookie tape moves the market. \u201cUndrafted rookie goes off in Preseason Week 3\u201d = overnight hobby story.' },
      { label: 'MLB stretch run storylines', location: 'Nationwide', detail: 'Wild Card race positioning + MVP debates move cards 15-25%.' },
      { label: 'Little League World Series (tangential)', location: 'Williamsport PA', detail: 'Future MLB prospects appear here a decade early; rarely a hobby event but cultural touchstone.' },
    ],
    storylines: [
      { label: 'NFL rookie QB Week 1 starter reveals', sport: 'NFL', detail: 'Teams announce QB1 the Tuesday before Week 1. Named starter rookies see 30-60% spikes that week.' },
      { label: 'MLB MVP two-horse races', sport: 'MLB', detail: 'By late August the MVP race is typically a two-player debate. Cards of both candidates hold + rise 10-20%.' },
    ],
    buyAdvice: 'Buy NFL rookie skill-position cards 2-3 weeks before Week 1. Preseason injury discounts create acquisition windows that close fast.',
    sellAdvice: 'Sell NFL rookies announced as Week 1 starters within 5 days of the announcement — prices compound through September then normalize mid-October.',
    historical: [
      { year: 2022, note: 'Kenny Pickett\u2019s Week 1 starter announcement (late August) sparked a 2x Bowman RC move; by November he was back at pre-announcement levels.' },
      { year: 2023, note: 'C.J. Stroud\u2019s Texans starter announcement in August repriced his Bowman U RC 3x in 10 days.' },
    ],
  },
  {
    month: 9,
    name: 'September',
    emoji: '🏈',
    theme: 'NFL kickoff + MLB playoff push',
    tagline: 'The NFL season starts. Every Sunday reshapes the hobby. MLB playoff race intensifies.',
    vibe: 'PEAK',
    spend: 'peak',
    releases: [
      { label: '2025 Panini Score Football (NFL)', sport: 'NFL', detail: 'Early-season NFL base product. Low-end budget rookie RCs; sets the foundation before premium products ship.' },
      { label: '2024-25 Panini Hoops Basketball (NBA)', sport: 'NBA', detail: 'Budget-tier NBA base product. Rookie designation + parallel chase appropriate to accessibility tier.' },
      { label: '2024-25 Upper Deck Series 1 Hockey (NHL)', sport: 'NHL', detail: 'The flagship NHL Young Guns SP product. Shipping timed to season opener.' },
    ],
    events: [
      { label: 'NFL Week 1 through Week 4', location: 'Nationwide', detail: 'Early-season rookie QB + WR debuts. Monday Night Football breakouts = hobby events.' },
      { label: 'MLB Playoff Race (Wild Card positioning)', location: 'Nationwide', detail: 'September callups + clinching nights drive hobby spikes for team-based collectors.' },
      { label: 'College Football national rankings', location: 'NCAA', detail: 'Heisman-tier college QBs + RBs see Bowman University RC spikes on primetime performances.' },
    ],
    storylines: [
      { label: 'NFL rookie QB debuts', sport: 'NFL', detail: 'First career starts reshape the draft-class hierarchy. Early-season rookie QB leaderboard = hobby leaderboard.' },
      { label: 'NHL preseason + opening night', sport: 'NHL', detail: 'Training camp invites + Young Guns pre-release leaks fuel speculative accumulation.' },
    ],
    buyAdvice: 'Buy NHL Young Guns SP pre-release (September is the pre-release month). First 2 weeks post-release carry a 20-30% premium over the steady-state price.',
    sellAdvice: 'Sell NFL rookie WR cards after a 100+ receiving yard Week 1 performance — hype premium typically unwinds within 30 days.',
    historical: [
      { year: 2023, note: 'C.J. Stroud\u2019s rookie NFL debut (4 TD Week 2) sparked a 4x Bowman U RC move in 72 hours.' },
      { year: 2024, note: 'Caleb Williams\u2019 first career MNF appearance in Week 2 produced the largest single-game NFL rookie hobby move of 2024.' },
    ],
  },
  {
    month: 10,
    name: 'October',
    emoji: '🎃',
    theme: 'MLB postseason + NBA opening + NFL Week 5-8',
    tagline: 'MLB crowns its champion. NBA regular season opens. NFL mid-season narratives solidify.',
    vibe: 'HOT',
    spend: 'high',
    releases: [
      { label: '2024-25 Panini Donruss Basketball (NBA)', sport: 'NBA', detail: 'Budget-tier NBA base. Rated Rookie designation + Holo parallels. First mass-distributed NBA product of the season.' },
      { label: '2025 Topps Chrome Platinum Anniversary (MLB)', sport: 'MLB', detail: 'Retrospective-themed chrome product. Often includes veteran legends + current rookie updates.' },
      { label: '2024-25 Upper Deck SP Game Used (NHL)', sport: 'NHL', detail: 'Premium NHL game-used relic + auto product. Stick / sweater pieces + Sign of the Times auto set.' },
    ],
    events: [
      { label: 'MLB Postseason', location: 'Nationwide', detail: 'Every round = 15-25% hobby spike for remaining teams\u2019 stars. World Series MVP = permanent top-tier hobby weight.' },
      { label: 'NBA Opening Night', location: 'Nationwide', detail: 'Rookie class debuts. Prizm pre-release expectations lock in based on Week 1 performances.' },
      { label: 'NFL mid-season standings', location: 'Nationwide', detail: 'By Week 7-8, playoff contenders + pretenders separate. Surprise teams drive rookie hobby.' },
      { label: 'World Series conclusion', location: 'NL vs AL pennant winners', detail: 'MLB\u2019s capstone event. World Series MVP\u2019s Bowman Chrome + Topps Chrome RCs see 2-3x moves.' },
    ],
    storylines: [
      { label: 'MLB postseason star-turn narratives', sport: 'MLB', detail: 'Role-player playoff heroes create permanent hobby weight. \u201cNovember Mr. October\u201d moments repeat annually.' },
      { label: 'NBA Rookie of the Year early leaderboard', sport: 'NBA', detail: 'By end of October the ROY front-runners emerge. Hobby accumulates around top 3.' },
    ],
    buyAdvice: 'Buy World Series losing-team star rookies within 7 days of the World Series end — discount is typically 15-20% and normalizes by spring training.',
    sellAdvice: 'Sell World Series MVP within 14 days of the Game 7 win. Historical peak is in that window; retracement begins within 30 days.',
    historical: [
      { year: 2023, note: 'Corey Seager\u2019s second World Series MVP (2023 Rangers) repriced his 2013 Bowman Chrome auto tier permanently upward.' },
      { year: 2024, note: 'Dodgers\u2019 World Series win sparked a 30-50% move on Ohtani\u2019s 2018 Topps Update RC.' },
    ],
  },
  {
    month: 11,
    name: 'November',
    emoji: '🎁',
    theme: 'NBA mid-season + NFL Week 10-13 + holiday gift hobby',
    tagline: 'NBA narratives solidify. NFL playoff picture clarifies. The first wave of holiday-gift hobby spending starts late month.',
    vibe: 'HOT',
    spend: 'high',
    releases: [
      { label: '2024-25 Panini Mosaic Basketball (NBA)', sport: 'NBA', detail: 'Mid-tier NBA chromed parallel-heavy product. Orange Fluorescent + Pink Camo parallels trend on social.' },
      { label: '2024 Panini Donruss Football (NFL)', sport: 'NFL', detail: 'Budget-tier NFL base. Rated Rookie RCs + Signature Series auto cards.' },
      { label: '2025 Topps Holiday (MLB)', sport: 'MLB', detail: 'Holiday-themed MLB retail product. Snowflake parallels + metal inserts + rookie cards in retail blasters.' },
    ],
    events: [
      { label: 'NBA Cup (In-Season Tournament)', location: 'Las Vegas NV', detail: 'November + December group stage + knockout rounds. Tournament MVP typically sees a 2-week hobby bump.' },
      { label: 'NFL Thanksgiving slate', location: 'Detroit MI / Dallas TX / Rotating', detail: 'Triple-header national TV audience. Breakout Thanksgiving performances create overnight hobby narratives.' },
      { label: 'Black Friday release', location: 'Retail nationwide', detail: 'Retail-exclusive Black Friday products + big-box promotional pricing. First major holiday-gift hobby event.' },
    ],
    storylines: [
      { label: 'NFL playoff picture clarification', sport: 'NFL', detail: 'Week 10-13 games typically decide division races. Division-champion team rookies see 15-25% spikes.' },
      { label: 'NBA MVP early leaderboard', sport: 'NBA', detail: 'By Thanksgiving the MVP race narrative is set. Cards of top 3 candidates hold + rise.' },
    ],
    buyAdvice: 'Buy mid-season performance breakouts immediately. Role-player NFL rookies who hit 100+ yards in back-to-back games produce 30-50% arcs over 2 weeks.',
    sellAdvice: 'Sell Thanksgiving prime-time heroes within 7 days. Holiday-gift demand produces short peaks that don\u2019t sustain.',
    historical: [
      { year: 2023, note: 'Tyreek Hill\u2019s Thanksgiving 200+ yard game produced a 25% move in his 2016 Prizm RC within 72 hours.' },
      { year: 2024, note: 'Wembanyama\u2019s Nov 2024 hot streak (3 straight 30-point games) sparked 2x moves on his Prizm DP RC tier.' },
    ],
  },
  {
    month: 12,
    name: 'December',
    emoji: '🎁',
    theme: 'Holiday gift hobby + NFL playoff race + NBA Christmas',
    tagline: 'The single biggest spending month of the year. Holiday gifts drive retail + online volume. The NFL playoff race reaches fever pitch.',
    vibe: 'PEAK',
    spend: 'peak',
    releases: [
      { label: '2024 Panini Prizm Draft Picks Football (NFL)', sport: 'NFL', detail: 'College-jersey NFL draft-class pre-rookie product. Short-prints the late-December window before Bowl Games.' },
      { label: '2024-25 Upper Deck Series 1 Young Guns releases (NHL)', sport: 'NHL', detail: 'Ongoing Young Guns circulation; mid-season Upper Deck promotional packs drop through retail.' },
      { label: '2025 Topps Holiday Mega Boxes (MLB)', sport: 'MLB', detail: 'Retail holiday exclusives. Snowflake-themed rookie parallels + holiday-specific inserts.' },
    ],
    events: [
      { label: 'NBA Christmas Day Games', location: 'Nationwide', detail: 'NBA\u2019s annual showcase slate. Christmas Day 30-point performances create permanent highlight-reel weight.' },
      { label: 'NFL Week 15-18 playoff race', location: 'Nationwide', detail: 'Playoff-clinching performances + MVP final push. Prime-time primetime means maximum hobby leverage.' },
      { label: 'College Football Conference Championships + Heisman announcement', location: 'Nationwide', detail: 'Heisman winner = permanent Bowman U RC top tier. Conference championship MVPs see 2-4 week arcs.' },
    ],
    storylines: [
      { label: 'NFL MVP final-stretch narrative', sport: 'NFL', detail: 'By mid-December the MVP race is typically 2-3 candidates. Cards of top 3 hold + rise through February.' },
      { label: 'Holiday gift rookie demand', sport: 'Multi', detail: 'Parents + gift-buyers absorb entry-level rookie inventory. Under-$50 rookies see 40-60% seasonal lift.' },
    ],
    buyAdvice: 'Pre-Christmas, buy premium vintage at soft pricing — wealthy collectors are sidelined by tax-loss harvesting + holiday cash flow concerns. Vintage dips 5-10% in early December.',
    sellAdvice: 'Sell entry-level rookies + gift-friendly $50-150 slabs through December. Holiday demand tolerates a 10-20% markup vs November.',
    historical: [
      { year: 2020, note: 'December 2020 marked the acceleration of the pandemic-era hobby boom — monthly sales volume tripled year-over-year.' },
      { year: 2023, note: 'December 2023 saw Lamar Jackson\u2019s MVP consolidation sparking his Prizm SIlver RC to touch $800 from a $450 November floor.' },
    ],
  },
];

export function getMonth(index: number): AlmanacMonth | undefined {
  return almanacMonths.find((m) => m.month === index);
}
