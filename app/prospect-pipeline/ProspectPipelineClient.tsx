'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────
type Sport = 'all' | 'football' | 'basketball' | 'baseball' | 'hockey';
type HeatLevel = 'fire' | 'hot' | 'warm' | 'watch';

interface Prospect {
  name: string;
  position: string;
  team: string; // college/minor league team
  sport: 'football' | 'basketball' | 'baseball' | 'hockey';
  draftYear: number;
  projectedPick: string;
  heat: HeatLevel;
  cardImpact: string; // short market prediction
  keyCards: string[];
  whyWatch: string;
  playerSlug?: string; // link to player page if exists
  riskLevel: 'low' | 'medium' | 'high';
  upside: string;
}

// ── Prospect Data ────────────────────────────────────────────────────────────
const PROSPECTS: Prospect[] = [
  // 2025 NFL Draft (April 24-26, 2025) — Top Prospects
  {
    name: 'Travis Hunter',
    position: 'CB/WR',
    team: 'Colorado',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'Top 5',
    heat: 'fire',
    cardImpact: 'Two-way player hype drives premium pricing. Bowman University and Prizm Draft are the key products.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC', '2024 Leaf Metal Draft RC Auto'],
    whyWatch: 'Heisman Trophy winner playing both CB and WR at Colorado. The last true two-way player. Could be the most dynamic NFL rookie since Deion Sanders.',
    playerSlug: 'travis-hunter',
    riskLevel: 'low',
    upside: 'If he dominates at both positions in the NFL, his cards could rival top QB RCs. Two-way narrative is unmatched.',
  },
  {
    name: 'Shedeur Sanders',
    position: 'QB',
    team: 'Colorado',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'Top 5',
    heat: 'fire',
    cardImpact: 'QBs always command the highest rookie card premiums. Coach Prime connection adds celebrity factor.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC', '2024 Sage Hit RC'],
    whyWatch: 'Son of Deion Sanders. Accurate passer with poise under pressure. NFL teams love his composure and arm talent. The built-in marketing machine of the Sanders brand.',
    playerSlug: 'shedeur-sanders',
    riskLevel: 'medium',
    upside: 'If he starts Day 1 and wins games, the celebrity + performance combo makes his RCs rocket.',
  },
  {
    name: 'Cam Ward',
    position: 'QB',
    team: 'Miami (FL)',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'Top 3',
    heat: 'fire',
    cardImpact: 'Projected #1 overall pick. Transfer portal success story. QBs at #1 get massive hobby attention.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC', '2024 Wild Card RC'],
    whyWatch: 'Transferred from Incarnate Word to Washington State to Miami, improving at each stop. Elite arm talent, dynamic playmaker. Could be the #1 overall pick.',
    playerSlug: 'cam-ward',
    riskLevel: 'medium',
    upside: 'The #1 pick narrative alone pushes prices. If he lands with a franchise that markets him well, sky is the limit.',
  },
  {
    name: 'Mason Graham',
    position: 'DT',
    team: 'Michigan',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'Top 5',
    heat: 'hot',
    cardImpact: 'DTs have lower card ceilings than skill positions, but elite DTs (Aaron Donald) prove there is a market.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Dominant interior presence on Michigan\'s national championship team. Rare athlete at DT. Projected top-5 pick.',
    playerSlug: 'mason-graham',
    riskLevel: 'medium',
    upside: 'If he becomes the next Aaron Donald, his RCs are underpriced now relative to QBs.',
  },
  {
    name: 'Will Johnson',
    position: 'CB',
    team: 'Michigan',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'Top 10',
    heat: 'hot',
    cardImpact: 'CBs have moderate card markets. Elite shutdown corners can build steady value over careers.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Lockdown corner who dominated in Michigan\'s national championship run. Elite size, speed, and ball skills for a CB.',
    playerSlug: 'will-johnson',
    riskLevel: 'medium',
    upside: 'Pro Bowl CBs hold value. If he becomes an All-Pro, early RCs at current prices are a bargain.',
  },
  {
    name: 'Tyler Warren',
    position: 'TE',
    team: 'Penn State',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'First Round',
    heat: 'hot',
    cardImpact: 'TEs are a growing card category thanks to Kelce and Andrews. Mackey Award winner carries premium.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'John Mackey Award winner as the nation\'s best TE. Versatile weapon who lined up at multiple positions. The next great NFL tight end.',
    playerSlug: 'tyler-warren',
    riskLevel: 'low',
    upside: 'TEs who produce early (like Kelce) see massive card value growth. Low risk given his skill set.',
  },
  // 2025 NBA Draft (June 25-26, 2025)
  {
    name: 'Cooper Flagg',
    position: 'PF/SF',
    team: 'Duke',
    sport: 'basketball',
    draftYear: 2025,
    projectedPick: '#1 Overall',
    heat: 'fire',
    cardImpact: 'Consensus #1 pick. Panini Prizm Draft Picks and Bowman University are the products to target.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC', '2024 Leaf RC'],
    whyWatch: 'Most hyped college player since Zion Williamson. Two-way force at Duke. Youngest player to be named to USA Basketball senior team.',
    playerSlug: 'cooper-flagg',
    riskLevel: 'low',
    upside: 'If he becomes a franchise player, his college RCs will be the most sought-after of the 2025 class.',
  },
  {
    name: 'Dylan Harper',
    position: 'SG',
    team: 'Rutgers',
    sport: 'basketball',
    draftYear: 2025,
    projectedPick: 'Top 3',
    heat: 'hot',
    cardImpact: 'Top-3 pick status means strong hobby attention. Scoring guards have the best card trajectories in the NBA.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Elite scorer who chose to stay close to home at Rutgers. Smooth game with NBA-ready size and skill set.',
    playerSlug: 'dylan-harper',
    riskLevel: 'medium',
    upside: 'Scoring guards (Booker, Ant Edwards) command top dollar. If Harper produces early, his RCs fly.',
  },
  {
    name: 'Ace Bailey',
    position: 'SF/PF',
    team: 'Rutgers',
    sport: 'basketball',
    draftYear: 2025,
    projectedPick: 'Top 3',
    heat: 'hot',
    cardImpact: 'Long wingspan, smooth scoring. The archetype (KD-lite) that collectors love to speculate on.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Elite length and scoring ability. Comparisons to Kevin Durant for his frame and skill set. Rutgers teammate of Dylan Harper — historic draft duo.',
    playerSlug: 'ace-bailey',
    riskLevel: 'medium',
    upside: 'KD comp players get premium pricing. If Bailey develops into an All-Star, early RCs are gold.',
  },
  // 2025 MLB Prospects
  {
    name: 'Roki Sasaki',
    position: 'SP',
    team: 'Dodgers (from NPB)',
    sport: 'baseball',
    draftYear: 2025,
    projectedPick: 'International FA',
    heat: 'fire',
    cardImpact: 'Japanese phenom on the Dodgers. Ohtani comparisons = massive hobby demand. First US cards are gold.',
    keyCards: ['2025 Topps Series 1 RC', '2025 Bowman Chrome RC', '2025 Topps Chrome RC'],
    whyWatch: 'Threw a perfect game in NPB at age 20. Signed with the Dodgers as an international free agent. 102 mph fastball with a devastating splitter. The next Japanese sensation.',
    riskLevel: 'low',
    upside: 'Ohtani effect: Japanese stars on the Dodgers get insane hobby attention. If he dominates MLB, his first US RCs will be worth thousands.',
  },
  {
    name: 'Jackson Chourio',
    position: 'OF',
    team: 'Brewers',
    sport: 'baseball',
    draftYear: 2024,
    projectedPick: 'Already Debuted',
    heat: 'hot',
    cardImpact: 'Youngest player in MLB when he debuted. 2024 RCs are still being distributed. Buy the dip on any slump.',
    keyCards: ['2024 Topps Chrome RC', '2024 Bowman Chrome RC', '2024 Topps Series 2 RC'],
    whyWatch: 'Signed for $1.7M at age 16 out of Venezuela. Five-tool talent with plus speed and power. Already in the majors at 20.',
    riskLevel: 'low',
    upside: 'Five-tool OFs (Trout, Acuna) become the hobby\'s biggest names. His RCs at current prices are a steal if he reaches his ceiling.',
  },
  {
    name: 'Paul Skenes',
    position: 'SP',
    team: 'Pirates',
    sport: 'baseball',
    draftYear: 2024,
    projectedPick: 'Already Debuted',
    heat: 'hot',
    cardImpact: '#1 overall pick who dominated immediately. 2024 Rookie of the Year. His chrome RCs are blue-chip investments.',
    keyCards: ['2024 Topps Chrome RC', '2024 Bowman Chrome 1st', '2024 Topps Series 2 RC'],
    whyWatch: 'Went #1 overall, made the All-Star Game as a rookie, throws 100+ mph with elite command. The real deal.',
    riskLevel: 'low',
    upside: 'Dominant pitchers (deGrom, Verlander) hold long-term value. Skenes is already producing at an elite level.',
  },
  // 2025 NHL Prospects
  {
    name: 'Ivan Demidov',
    position: 'RW',
    team: 'SKA St. Petersburg (KHL)',
    sport: 'hockey',
    draftYear: 2024,
    projectedPick: 'Drafted #5 (Canadiens)',
    heat: 'hot',
    cardImpact: 'Russian winger drafted by Montreal. First North American cards will be massive. KHL highlight reels drive hype.',
    keyCards: ['2024-25 Upper Deck Series 1 Young Guns', '2024-25 SP Authentic Future Watch'],
    whyWatch: 'Dominated the KHL as a teenager. Elite offensive talent with silky hands. Playing for the Canadiens means massive Canadian market.',
    riskLevel: 'medium',
    upside: 'Russian players who pan out (Ovechkin, Panarin) have premium card value. Montreal market amplifies everything.',
  },
  {
    name: 'Macklin Celebrini',
    position: 'C',
    team: 'San Jose Sharks',
    sport: 'hockey',
    draftYear: 2024,
    projectedPick: '#1 Overall (2024)',
    heat: 'hot',
    cardImpact: '#1 overall pick Young Guns RC is the card of the year for hockey. Early performance is encouraging.',
    keyCards: ['2024-25 Upper Deck Series 1 Young Guns RC', '2024-25 SP Authentic Future Watch RC'],
    whyWatch: 'Won the Hobey Baker Award as college hockey\'s best player. #1 overall pick by San Jose. Already making an impact in the NHL.',
    riskLevel: 'low',
    upside: '#1 picks who deliver (McDavid, Crosby) are the most valuable cards in hockey. Celebrini has that ceiling.',
  },
  // Rising Stars / Sleepers
  {
    name: 'Jalen Milroe',
    position: 'QB',
    team: 'Alabama',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'First Round',
    heat: 'warm',
    cardImpact: 'Dual-threat QBs with rushing ability (Lamar, Kyler) have explosive card markets when they hit.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Elite athlete with a cannon arm. Led Alabama to the playoff. Dual-threat ability gives him a high floor in the NFL.',
    playerSlug: 'jalen-milroe',
    riskLevel: 'high',
    upside: 'If he becomes Lamar Jackson 2.0, his RCs go from $5 to $200+. High risk, high reward.',
  },
  {
    name: 'Jalon Walker',
    position: 'LB/EDGE',
    team: 'Georgia',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'First Round',
    heat: 'warm',
    cardImpact: 'LB/EDGE cards are undervalued. Elite pass rushers (Watt, Bosa) prove the position can carry card value.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Versatile defender from Georgia\'s championship program. Can rush the passer and drop into coverage. First-round talent.',
    playerSlug: 'jalon-walker',
    riskLevel: 'medium',
    upside: 'Elite pass rushers are underpriced in the hobby. If Walker becomes a Pro Bowler, early RCs are a value play.',
  },
  {
    name: 'VJ Edgewood',
    position: 'C',
    team: 'Arizona State',
    sport: 'basketball',
    draftYear: 2025,
    projectedPick: 'Lottery',
    heat: 'watch',
    cardImpact: 'Lottery picks always get hobby attention. Big men who can shoot are trending in the NBA.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Athletic big man who emerged as a potential lottery pick. Interior presence with improving perimeter game.',
    riskLevel: 'high',
    upside: 'If he develops a perimeter game and becomes a modern big, his RCs jump significantly.',
  },
  {
    name: 'Kelvin Banks Jr.',
    position: 'OT',
    team: 'Texas',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'First Round',
    heat: 'warm',
    cardImpact: 'OL cards have the lowest hobby demand, but All-Americans at blue-blood schools have collector appeal.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Three-year starter at Texas. Elite pass protector with the size and technique NFL teams crave. Potential top-15 pick.',
    playerSlug: 'kelvin-banks-jr',
    riskLevel: 'low',
    upside: 'OL RCs are cheap. If Banks becomes a perennial Pro Bowler, even small gains are great ROI.',
  },
  {
    name: 'Luther Burden III',
    position: 'WR',
    team: 'Missouri',
    sport: 'football',
    draftYear: 2025,
    projectedPick: 'First Round',
    heat: 'warm',
    cardImpact: 'WRs with explosive playmaking ability (Ja\'Marr Chase, CeeDee Lamb) have strong card trajectories.',
    keyCards: ['2024 Bowman University Chrome RC', '2024 Panini Prizm Draft Picks RC'],
    whyWatch: 'Dynamic playmaker who can score from anywhere. 5-star recruit who lived up to the hype at Missouri. Elite route runner with YAC ability.',
    playerSlug: 'luther-burden-iii',
    riskLevel: 'medium',
    upside: 'WR1s are the second-most valuable position in the hobby after QBs. If Burden becomes a team\'s WR1, his RCs soar.',
  },
];

const HEAT_CONFIG: Record<HeatLevel, { label: string; color: string; bg: string; icon: string }> = {
  fire: { label: 'FIRE', color: 'text-red-400', bg: 'bg-red-950/50 border-red-800/40', icon: '\u{1F525}' },
  hot: { label: 'HOT', color: 'text-orange-400', bg: 'bg-orange-950/50 border-orange-800/40', icon: '\u{1F321}\u{FE0F}' },
  warm: { label: 'WARM', color: 'text-yellow-400', bg: 'bg-yellow-950/50 border-yellow-800/40', icon: '\u{2600}\u{FE0F}' },
  watch: { label: 'WATCH', color: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-800/40', icon: '\u{1F440}' },
};

const SPORT_ICON: Record<string, string> = {
  football: '\u{1F3C8}',
  basketball: '\u{1F3C0}',
  baseball: '\u26BE',
  hockey: '\u{1F3D2}',
};

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-400 bg-green-950/40',
  medium: 'text-yellow-400 bg-yellow-950/40',
  high: 'text-red-400 bg-red-950/40',
};

export default function ProspectPipelineClient() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [heatFilter, setHeatFilter] = useState<HeatLevel | 'all'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filteredProspects = useMemo(() => {
    return PROSPECTS.filter(p => {
      if (sportFilter !== 'all' && p.sport !== sportFilter) return false;
      if (heatFilter !== 'all' && p.heat !== heatFilter) return false;
      return true;
    });
  }, [sportFilter, heatFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: PROSPECTS.length,
    fire: PROSPECTS.filter(p => p.heat === 'fire').length,
    football: PROSPECTS.filter(p => p.sport === 'football').length,
    basketball: PROSPECTS.filter(p => p.sport === 'basketball').length,
    baseball: PROSPECTS.filter(p => p.sport === 'baseball').length,
    hockey: PROSPECTS.filter(p => p.sport === 'hockey').length,
  }), []);

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-zinc-500">Prospects Tracked</p>
        </div>
        <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.fire}</p>
          <p className="text-xs text-zinc-500">Must-Watch</p>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">4</p>
          <p className="text-xs text-zinc-500">Sports Covered</p>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">2025</p>
          <p className="text-xs text-zinc-500">Draft Classes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-zinc-900/70 border border-zinc-800 rounded-lg p-1">
          {(['all', 'football', 'basketball', 'baseball', 'hockey'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sportFilter === s ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Sports' : `${SPORT_ICON[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-zinc-900/70 border border-zinc-800 rounded-lg p-1">
          {(['all', 'fire', 'hot', 'warm', 'watch'] as const).map(h => (
            <button
              key={h}
              onClick={() => setHeatFilter(h)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                heatFilter === h ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {h === 'all' ? 'All Heat' : `${HEAT_CONFIG[h].icon} ${HEAT_CONFIG[h].label}`}
            </button>
          ))}
        </div>
      </div>

      {/* Prospect Cards */}
      <div className="space-y-3">
        {filteredProspects.map((prospect, i) => {
          const heat = HEAT_CONFIG[prospect.heat];
          const isExpanded = expandedIndex === i;

          return (
            <div
              key={prospect.name}
              className={`border rounded-xl overflow-hidden transition-all ${heat.bg}`}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="w-full text-left p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-lg">{SPORT_ICON[prospect.sport]}</span>
                      <h3 className="text-white font-bold text-lg">{prospect.name}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${heat.color} ${heat.bg.split(' ')[0]}`}>
                        {heat.icon} {heat.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
                      <span>{prospect.position}</span>
                      <span className="text-zinc-600">&middot;</span>
                      <span>{prospect.team}</span>
                      <span className="text-zinc-600">&middot;</span>
                      <span className="font-medium">{prospect.projectedPick}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[prospect.riskLevel]}`}>
                      {prospect.riskLevel.toUpperCase()} RISK
                    </span>
                    <span className="text-zinc-600 text-lg">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-zinc-800/50 pt-4 space-y-4">
                  {/* Why Watch */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Why Watch</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{prospect.whyWatch}</p>
                  </div>

                  {/* Card Impact */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Card Market Impact</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{prospect.cardImpact}</p>
                  </div>

                  {/* Key Cards */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Key Cards to Watch</h4>
                    <div className="flex flex-wrap gap-2">
                      {prospect.keyCards.map(card => (
                        <span key={card} className="text-xs bg-zinc-800/60 text-zinc-300 px-2.5 py-1 rounded-full">
                          {card}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Upside */}
                  <div className="bg-zinc-800/30 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Bull Case</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{prospect.upside}</p>
                  </div>

                  {/* Links */}
                  <div className="flex gap-2 flex-wrap">
                    {prospect.playerSlug && (
                      <Link
                        href={`/sports/players/${prospect.playerSlug}`}
                        className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        View Player Page &rarr;
                      </Link>
                    )}
                    <Link
                      href={`/tools/draft-predictor`}
                      className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Draft Night Predictor &rarr;
                    </Link>
                    <Link
                      href="/draft-hub"
                      className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Draft Hub &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProspects.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg mb-2">No prospects match your filters</p>
          <button
            onClick={() => { setSportFilter('all'); setHeatFilter('all'); }}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Draft Timeline */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 mt-6">
        <h3 className="font-bold text-white mb-4">2025 Draft Calendar</h3>
        <div className="space-y-3">
          {[
            { date: 'April 24-26', event: 'NFL Draft (Green Bay)', sport: 'football', status: 'upcoming' },
            { date: 'June 25-26', event: 'NBA Draft', sport: 'basketball', status: 'upcoming' },
            { date: 'July 13-15', event: 'MLB Draft', sport: 'baseball', status: 'upcoming' },
            { date: 'June 27-28', event: 'NHL Draft', sport: 'hockey', status: 'upcoming' },
          ].map(d => (
            <div key={d.event} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{SPORT_ICON[d.sport]}</span>
              <span className="text-white font-medium w-28">{d.date}</span>
              <span className="text-zinc-400 flex-1">{d.event}</span>
              <span className="text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full">
                {d.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Collecting Tips */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
        <h3 className="font-bold text-white mb-4">Prospect Collecting Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-zinc-800/40 rounded-lg p-3">
            <p className="text-white font-medium mb-1">Buy Before Draft Night</p>
            <p className="text-zinc-500 text-xs">Card prices spike 20-50% when a player is drafted. Buy pre-draft for maximum upside.</p>
          </div>
          <div className="bg-zinc-800/40 rounded-lg p-3">
            <p className="text-white font-medium mb-1">Target Chrome &amp; Prizm RCs</p>
            <p className="text-zinc-500 text-xs">Bowman Chrome (baseball), Prizm (basketball/football), and Upper Deck Young Guns (hockey) hold the most long-term value.</p>
          </div>
          <div className="bg-zinc-800/40 rounded-lg p-3">
            <p className="text-white font-medium mb-1">Diversify Your Bets</p>
            <p className="text-zinc-500 text-xs">Don&apos;t go all-in on one prospect. Spread across 3-5 players to hedge against busts.</p>
          </div>
          <div className="bg-zinc-800/40 rounded-lg p-3">
            <p className="text-white font-medium mb-1">Watch for Landing Spot</p>
            <p className="text-zinc-500 text-xs">A good player on a bad team = less card demand. Market size and team success matter.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
