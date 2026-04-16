'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Deterministic helpers                                              */
/* ------------------------------------------------------------------ */

function dateHash(offset = 0): number {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const str = `reactions-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type EventCategory = 'TRADE' | 'INJURY' | 'AWARD' | 'DRAFT' | 'MILESTONE' | 'GAME';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface AffectedCard {
  name: string;
  player: string;
  baseValue: number;
  change: number; // percentage
  newValue: number;
  direction: 'up' | 'down' | 'flat';
}

interface MarketEvent {
  id: number;
  category: EventCategory;
  sport: Sport;
  headline: string;
  detail: string;
  impactScore: number; // 1-10
  timestamp: string;
  affectedCards: AffectedCard[];
  strategyTip: string;
  sectorImpact: string;
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const SPORT_META: Record<Sport, { label: string; icon: string; color: string; bg: string; border: string }> = {
  baseball: { label: 'Baseball', icon: '\u26BE', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/40' },
  basketball: { label: 'Basketball', icon: '\uD83C\uDFC0', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40' },
  football: { label: 'Football', icon: '\uD83C\uDFC8', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/40' },
  hockey: { label: 'Hockey', icon: '\uD83C\uDFD2', color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/40' },
};

const CATEGORY_META: Record<EventCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  TRADE: { label: 'Trade Rumor', icon: '\uD83D\uDD04', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  INJURY: { label: 'Injury Report', icon: '\uD83E\uDE79', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  AWARD: { label: 'Award', icon: '\uD83C\uDFC6', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  DRAFT: { label: 'Draft Pick', icon: '\uD83C\uDFAF', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  MILESTONE: { label: 'Milestone', icon: '\u2B50', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  GAME: { label: 'Game Result', icon: '\uD83D\uDCCA', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
};

/* ------------------------------------------------------------------ */
/*  Event templates                                                    */
/* ------------------------------------------------------------------ */

interface EventTemplate {
  category: EventCategory;
  sport: Sport;
  headline: string;
  detail: string;
  players: { name: string; baseValue: number; reaction: [number, number] }[];
  sectorImpact: string;
  strategyTips: string[];
}

const EVENT_TEMPLATES: EventTemplate[] = [
  // BASEBALL
  {
    category: 'TRADE', sport: 'baseball',
    headline: 'Trade rumors swirl: Star pitcher on the move',
    detail: 'Multiple reports indicate a top-tier starting pitcher is being shopped ahead of the trade deadline. Contending teams are making aggressive offers, and a deal could come within 48 hours.',
    players: [
      { name: 'Paul Skenes RC', baseValue: 85, reaction: [8, 15] },
      { name: 'Corbin Burnes', baseValue: 45, reaction: [5, 12] },
      { name: 'Elly De La Cruz RC', baseValue: 68, reaction: [-3, 5] },
    ],
    sectorImpact: 'Pitching cards see broad movement. Contender team stars may also benefit from perceived lineup upgrade.',
    strategyTips: ['Buy the rumor, sell the news — prices often peak before the official announcement', 'Target the acquiring team\'s existing stars for secondary uplift', 'Wait 48 hours after a trade for the dust to settle before buying'],
  },
  {
    category: 'INJURY', sport: 'baseball',
    headline: 'Star outfielder headed to IL with hamstring strain',
    detail: 'An MRI confirmed a Grade 2 hamstring strain for one of the league\'s top power hitters. Expected timeline is 4-6 weeks, putting his All-Star candidacy in jeopardy.',
    players: [
      { name: 'Ronald Acuna Jr', baseValue: 320, reaction: [-15, -8] },
      { name: 'Juan Soto', baseValue: 265, reaction: [2, 8] },
      { name: 'Julio Rodriguez RC', baseValue: 145, reaction: [-2, 3] },
    ],
    sectorImpact: 'The injured player\'s cards take an immediate hit. Rival outfielders and same-team replacements see uptick as attention shifts.',
    strategyTips: ['Injuries create buying opportunities — buy the dip if the player is young with a good recovery track record', 'Avoid panic selling; short IL stints rarely impact long-term value', 'Monitor the replacement call-up — prospect cards can spike when a roster spot opens'],
  },
  {
    category: 'AWARD', sport: 'baseball',
    headline: 'Cy Young frontrunner dominates with another gem',
    detail: 'The leading Cy Young candidate tossed 8 shutout innings with 12 strikeouts, extending his scoreless streak to 28 innings. His ERA drops to 1.89 on the season.',
    players: [
      { name: 'Paul Skenes RC', baseValue: 85, reaction: [10, 22] },
      { name: 'Aaron Judge', baseValue: 290, reaction: [1, 4] },
      { name: 'Corbin Carroll RC', baseValue: 55, reaction: [-1, 2] },
    ],
    sectorImpact: 'Award contenders see sustained premium pricing. Pitching sector broadly lifts as attention flows to the rotation market.',
    strategyTips: ['Award-driven spikes are often temporary — sell into the hype if you\'re a flipper', 'Rookie cards of award winners tend to hold value better than veteran parallels', 'The best time to buy an award winner\'s cards is 2-3 weeks AFTER the award is announced'],
  },
  // BASKETBALL
  {
    category: 'TRADE', sport: 'basketball',
    headline: 'Blockbuster trade sends All-Star guard to contender',
    detail: 'A multi-team deal has reportedly been agreed upon in principle, sending an All-Star caliber guard to a championship contender in exchange for multiple first-round picks and young players.',
    players: [
      { name: 'Victor Wembanyama RC', baseValue: 250, reaction: [5, 12] },
      { name: 'Luka Doncic', baseValue: 750, reaction: [3, 8] },
      { name: 'Ja Morant RC', baseValue: 185, reaction: [8, 18] },
    ],
    sectorImpact: 'Trade deadline moves shake up the entire basketball card landscape. Contender additions lift team sets, while rebuilding teams\' star cards may dip.',
    strategyTips: ['Trades to contenders spike cards 10-20% immediately — sell within 72 hours for maximum profit', 'Players traded to small markets often see values drop even if they\'re still elite', 'The picks and young players sent back can be sleeper buys if they land in good development systems'],
  },
  {
    category: 'MILESTONE', sport: 'basketball',
    headline: 'Young star reaches 10,000-point milestone',
    detail: 'At just 25 years old, a generational talent has reached the 10,000-point milestone, making him the youngest player in league history to hit the mark. His pace projects to challenge all-time scoring records.',
    players: [
      { name: 'Luka Doncic', baseValue: 750, reaction: [8, 15] },
      { name: 'Victor Wembanyama RC', baseValue: 250, reaction: [3, 7] },
      { name: 'CJ Stroud RC', baseValue: 160, reaction: [-1, 2] },
    ],
    sectorImpact: 'Milestone moments create sustained interest. The player\'s entire card catalog — from base to parallels — sees elevated demand for weeks.',
    strategyTips: ['Milestones create predictable price spikes — position yourself before the milestone is reached', 'The best milestone buys are the player\'s cheapest base cards, which see the largest % gains', 'Milestones for young players have more lasting impact than veteran milestones'],
  },
  {
    category: 'GAME', sport: 'basketball',
    headline: 'Playoff elimination game delivers historic 50-point performance',
    detail: 'In a do-or-die Game 7, a superstar exploded for 50 points, 10 rebounds, and 8 assists to advance his team to the next round. Social media erupted, calling it an all-time great performance.',
    players: [
      { name: 'Ja Morant RC', baseValue: 185, reaction: [12, 25] },
      { name: 'Joe Burrow RC', baseValue: 210, reaction: [-2, 3] },
      { name: 'Victor Wembanyama RC', baseValue: 250, reaction: [2, 6] },
    ],
    sectorImpact: 'Playoff heroics drive short-term price surges. The entire basketball sector benefits from elevated viewership and social media buzz.',
    strategyTips: ['Playoff performance spikes are the MOST short-lived — sell within 24-48 hours', 'If the player wins the championship, a second wave of buying often follows', 'Historic performances create "moment" cards that become collectible touchstones — buy graded copies for long-term holds'],
  },
  // FOOTBALL
  {
    category: 'DRAFT', sport: 'football',
    headline: 'Top QB prospect goes #1 overall as expected',
    detail: 'The consensus #1 quarterback was selected with the first overall pick, heading to a franchise desperate for a franchise signal-caller. His college production (4,200 yards, 38 TDs) and pro day numbers have scouts comparing him to elite passers.',
    players: [
      { name: 'Caleb Williams RC', baseValue: 110, reaction: [15, 30] },
      { name: 'CJ Stroud RC', baseValue: 160, reaction: [3, 8] },
      { name: 'Joe Burrow RC', baseValue: 210, reaction: [1, 5] },
    ],
    sectorImpact: 'Draft night is the single biggest night for rookie card demand. #1 overall picks see massive immediate spikes. The entire football rookie class benefits from the hype cycle.',
    strategyTips: ['Draft night prices are almost always the PEAK — wait 2-4 weeks for the hype to cool before buying', 'The real buying window is after the initial spike fades but before training camp highlights emerge', 'Late-round picks who land in good situations are better value plays than top picks'],
  },
  {
    category: 'INJURY', sport: 'football',
    headline: 'Pro Bowl quarterback tears ACL in practice',
    detail: 'Devastating news from training camp as a top-10 quarterback suffered a torn ACL during a non-contact drill. He\'ll miss the entire upcoming season. The backup quarterback is a second-year player with limited starting experience.',
    players: [
      { name: 'Justin Herbert RC', baseValue: 180, reaction: [-18, -10] },
      { name: 'Caleb Williams RC', baseValue: 110, reaction: [-1, 3] },
      { name: 'Marvin Harrison Jr RC', baseValue: 190, reaction: [2, 6] },
    ],
    sectorImpact: 'ACL tears are the most feared card market event. The player\'s entire catalog drops 15-25% immediately, with partial recovery over 6-12 months as return timelines become clear.',
    strategyTips: ['ACL injuries in football create the BEST buying opportunities — young QBs almost always recover fully', 'Wait 1-2 weeks after the injury for the panic selling to subside', 'The backup QB\'s cards often spike — look for them before the news is widely processed'],
  },
  {
    category: 'AWARD', sport: 'football',
    headline: 'MVP announcement sends winner\'s cards soaring',
    detail: 'The league MVP was announced, and the winner\'s combination of passing yards, touchdowns, and clutch performances made it a near-unanimous selection. His team is the top seed heading into the playoffs.',
    players: [
      { name: 'CJ Stroud RC', baseValue: 160, reaction: [12, 20] },
      { name: 'Joe Burrow RC', baseValue: 210, reaction: [5, 10] },
      { name: 'Jayden Daniels RC', baseValue: 175, reaction: [3, 8] },
    ],
    sectorImpact: 'MVP announcements create a broad lift across the QB market. Winner sees 15-25% spike, runner-up gets a smaller bump, and the entire football sector benefits.',
    strategyTips: ['MVP winners\' cards peak within 48 hours of the announcement — set your sell price early', 'If the MVP winner also wins the Super Bowl, expect a second price spike', 'First-time MVP winners see bigger % gains than repeat winners'],
  },
  // HOCKEY
  {
    category: 'MILESTONE', sport: 'hockey',
    headline: 'Young star scores 50th goal, joins elite company',
    detail: 'A 23-year-old phenom netted his 50th goal of the season, becoming only the 7th player under 24 to reach the milestone. His Young Guns rookie card has already tripled in value this season.',
    players: [
      { name: 'Connor Bedard YG', baseValue: 200, reaction: [10, 20] },
      { name: 'Macklin Celebrini YG', baseValue: 135, reaction: [5, 12] },
      { name: 'Alexis Lafreniere YG', baseValue: 95, reaction: [2, 6] },
    ],
    sectorImpact: 'The 50-goal milestone is hockey\'s gold standard. The scorer\'s entire catalog surges, and the Young Guns RC leads the charge. Secondary impact lifts other elite young forwards.',
    strategyTips: ['50-goal scorers\' Young Guns RCs become blue-chip investments — buy and hold PSA 10s', 'The milestone creates a permanent floor price — these cards rarely return to pre-milestone levels', 'Other young stars in the same draft class benefit from the "rising tide" effect'],
  },
  {
    category: 'TRADE', sport: 'hockey',
    headline: 'Playoff contender acquires elite defenseman at deadline',
    detail: 'In the biggest trade deadline deal, a Stanley Cup contender acquired an All-Star defenseman in exchange for two first-round picks and a blue-chip prospect. The acquiring team is now the Cup favorite.',
    players: [
      { name: 'Connor Bedard YG', baseValue: 200, reaction: [3, 8] },
      { name: 'Macklin Celebrini YG', baseValue: 135, reaction: [6, 14] },
      { name: 'Ivan Demidov YG', baseValue: 88, reaction: [2, 7] },
    ],
    sectorImpact: 'Trade deadline deals spike the acquiring team\'s entire roster. The traded player\'s cards spike on the contender narrative, while the prospect heading back becomes a buy-low target.',
    strategyTips: ['Deadline acquisitions by Cup contenders create short-term spikes — sell before the playoff run starts', 'The prospect sent back in the trade is often the best long-term value play', 'If the acquiring team wins the Cup, the traded player\'s cards get a championship premium'],
  },
  {
    category: 'GAME', sport: 'hockey',
    headline: 'Goalie posts historic 55-save shutout in playoff game',
    detail: 'In an instant classic, a goaltender turned in a 55-save shutout performance to steal a playoff series game on the road. It\'s the most saves in a playoff shutout in over 20 years.',
    players: [
      { name: 'Connor Bedard YG', baseValue: 200, reaction: [-1, 3] },
      { name: 'Macklin Celebrini YG', baseValue: 135, reaction: [4, 10] },
      { name: 'Alexis Lafreniere YG', baseValue: 95, reaction: [6, 15] },
    ],
    sectorImpact: 'Goalie cards are historically undervalued. A legendary playoff performance can permanently elevate a goalie\'s Young Guns RC from common to collectible.',
    strategyTips: ['Goalie cards are the most undervalued segment — legendary performances create buying opportunities', 'Playoff goalie performances have more lasting impact on values than regular season stats', 'Buy the goalie\'s cheapest base cards first — they see the highest % return on milestone moments'],
  },
];

/* ------------------------------------------------------------------ */
/*  Data generation                                                    */
/* ------------------------------------------------------------------ */

function generateDayEvents(): MarketEvent[] {
  const seed = dateHash();
  const rng = seededRng(seed);

  // Shuffle templates and pick 6
  const shuffled = [...EVENT_TEMPLATES].sort(() => rng() - 0.5);
  const picked = shuffled.slice(0, 6);

  return picked.map((template, i) => {
    const impactScore = Math.round(3 + rng() * 7);

    const affectedCards: AffectedCard[] = template.players.map(p => {
      const changeRange = p.reaction;
      const change = Math.round((changeRange[0] + rng() * (changeRange[1] - changeRange[0])) * 10) / 10;
      const newValue = Math.round(p.baseValue * (1 + change / 100));
      return {
        name: p.name,
        player: p.name.replace(/ RC$| YG$/, '').replace(/^\d{4}\s+\w+\s+\w+\s+/, ''),
        baseValue: p.baseValue,
        change,
        newValue,
        direction: change > 1 ? 'up' : change < -1 ? 'down' : 'flat',
      };
    });

    const hour = 6 + Math.floor(rng() * 14);
    const minute = Math.floor(rng() * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timestamp = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;

    const tip = template.strategyTips[Math.floor(rng() * template.strategyTips.length)];

    return {
      id: i,
      category: template.category,
      sport: template.sport,
      headline: template.headline,
      detail: template.detail,
      impactScore,
      timestamp,
      affectedCards,
      strategyTip: tip,
      sectorImpact: template.sectorImpact,
    };
  }).sort((a, b) => b.impactScore - a.impactScore);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MarketReactionsClient() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');

  const events = useMemo(() => generateDayEvents(), []);

  const filtered = sportFilter === 'all' ? events : events.filter(e => e.sport === sportFilter);
  const expandedEvent = selectedEvent !== null ? events.find(e => e.id === selectedEvent) : null;

  // Summary stats
  const totalImpact = events.reduce((s, e) => s + e.impactScore, 0);
  const avgImpact = (totalImpact / events.length).toFixed(1);
  const hotSport = (() => {
    const sportImpact: Record<string, number> = {};
    events.forEach(e => { sportImpact[e.sport] = (sportImpact[e.sport] || 0) + e.impactScore; });
    return Object.entries(sportImpact).sort((a, b) => b[1] - a[1])[0]?.[0] as Sport || 'baseball';
  })();
  const biggestEvent = events[0];

  return (
    <div className="space-y-8">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Events Today</div>
          <div className="text-2xl font-bold text-white">{events.length}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Avg Impact</div>
          <div className="text-2xl font-bold text-amber-400">{avgImpact}/10</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Hottest Sport</div>
          <div className="text-2xl font-bold">
            <span className={SPORT_META[hotSport].color}>{SPORT_META[hotSport].icon} {SPORT_META[hotSport].label}</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Biggest Event</div>
          <div className="text-lg font-bold text-white truncate">
            {CATEGORY_META[biggestEvent.category].icon} {biggestEvent.impactScore}/10
          </div>
        </div>
      </div>

      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              sportFilter === s
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {s === 'all' ? 'All Sports' : `${SPORT_META[s].icon} ${SPORT_META[s].label}`}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filtered.map(event => {
          const catMeta = CATEGORY_META[event.category];
          const sportMeta = SPORT_META[event.sport];
          const isExpanded = selectedEvent === event.id;

          return (
            <div key={event.id} className={`${sportMeta.bg} border ${sportMeta.border} rounded-xl overflow-hidden transition-all`}>
              {/* Event Header */}
              <button
                onClick={() => setSelectedEvent(isExpanded ? null : event.id)}
                className="w-full text-left px-4 sm:px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Impact Badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                    event.impactScore >= 8 ? 'bg-red-500/20 border border-red-500/40' :
                    event.impactScore >= 5 ? 'bg-amber-500/20 border border-amber-500/40' :
                    'bg-green-500/20 border border-green-500/40'
                  }`}>
                    <span className={`text-lg font-black ${
                      event.impactScore >= 8 ? 'text-red-400' :
                      event.impactScore >= 5 ? 'text-amber-400' :
                      'text-green-400'
                    }`}>{event.impactScore}</span>
                    <span className="text-[8px] text-zinc-500 uppercase">impact</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${catMeta.bgColor} ${catMeta.color}`}>
                        {catMeta.icon} {catMeta.label}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 ${sportMeta.color}`}>
                        {sportMeta.icon} {sportMeta.label}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">{event.timestamp}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm sm:text-base leading-tight">{event.headline}</h3>
                    <p className="text-zinc-500 text-xs mt-1 line-clamp-1">{event.detail}</p>
                  </div>

                  {/* Chevron */}
                  <svg
                    className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform duration-300 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Detail */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 sm:px-5 pb-5 border-t border-zinc-800/60 pt-4 space-y-5">
                  {/* Full Detail */}
                  <p className="text-zinc-300 text-sm leading-relaxed">{event.detail}</p>

                  {/* Affected Cards */}
                  <div>
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3">Market Reaction</h4>
                    <div className="grid gap-2">
                      {event.affectedCards.map((card, ci) => (
                        <div key={ci} className="flex items-center justify-between bg-zinc-900/60 rounded-lg px-3 py-2.5 border border-zinc-800/50">
                          <div className="min-w-0">
                            <div className="text-white text-sm font-medium truncate">{card.name}</div>
                            <div className="text-zinc-500 text-xs">Base: ${card.baseValue}</div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="text-white text-sm font-bold">${card.newValue}</div>
                            </div>
                            <div className={`flex items-center gap-0.5 font-bold text-sm min-w-[65px] justify-end ${
                              card.direction === 'up' ? 'text-green-400' :
                              card.direction === 'down' ? 'text-red-400' :
                              'text-zinc-500'
                            }`}>
                              {card.direction === 'up' ? '\u25B2' : card.direction === 'down' ? '\u25BC' : '\u25C6'}
                              {' '}{card.change > 0 ? '+' : ''}{card.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sector Impact */}
                  <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-800/40">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Sector Impact</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{event.sectorImpact}</p>
                  </div>

                  {/* Strategy Tip */}
                  <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-3">
                    <h4 className="text-xs text-amber-400 uppercase tracking-wider font-bold mb-1">Strategy Tip</h4>
                    <p className="text-amber-200/80 text-sm leading-relaxed">{event.strategyTip}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          No events for the selected sport today. Try &quot;All Sports&quot; to see all events.
        </div>
      )}

      {/* How It Works */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-bold mb-3">How Market Reactions Work</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-amber-400 font-bold mb-1">1. Events Break</div>
            <p className="text-zinc-400">Each day generates 6 simulated sports events — trades, injuries, awards, draft picks, milestones, and game results across all 4 sports.</p>
          </div>
          <div>
            <div className="text-amber-400 font-bold mb-1">2. Market Reacts</div>
            <p className="text-zinc-400">Every event impacts specific cards differently. Trade rumors spike both parties, injuries create dips, awards drive short-term surges, and milestones build lasting value.</p>
          </div>
          <div>
            <div className="text-amber-400 font-bold mb-1">3. You Learn</div>
            <p className="text-zinc-400">Study the patterns. When a real event happens, you&#39;ll know whether to buy, sell, or hold. Pattern recognition is the edge every serious collector needs.</p>
          </div>
        </div>
      </div>

      {/* Impact Guide */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-bold mb-3">Impact Score Guide</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded text-xs w-12 text-center">1-3</span>
            <span className="text-zinc-400">Minor ripple — prices nudge slightly, mostly noise. Good for learning, not for trading.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded text-xs w-12 text-center">4-6</span>
            <span className="text-zinc-400">Moderate wave — noticeable price swings. Opportunities for prepared collectors.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded text-xs w-12 text-center">7-9</span>
            <span className="text-zinc-400">Major quake — entire sectors move. Fast action needed. Panic sellers create opportunities.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded text-xs w-12 text-center">10</span>
            <span className="text-zinc-400">Once-in-a-decade — generational player trade, record-breaking performance. Market reshapes permanently.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
