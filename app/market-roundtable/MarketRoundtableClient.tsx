'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface Panelist {
  id: string;
  name: string;
  badge: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  philosophy: string;
}

interface Topic {
  question: string;
  category: string;
  sportFocus?: string;
}

interface RoundtableStats {
  debatesJoined: number;
  votesCast: number;
  panelistVotes: Record<string, number>;
  communityAgrees: number;
}

// --- Helpers ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

// --- Panelists ---
const panelists: Panelist[] = [
  {
    id: 'bull',
    name: 'The Bull',
    badge: '🐂',
    title: 'Market Optimist',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-700/50',
    philosophy: 'Sees opportunity everywhere. The hobby is growing and smart money buys before the crowd.',
  },
  {
    id: 'bear',
    name: 'The Bear',
    badge: '🐻',
    title: 'Market Skeptic',
    color: 'text-red-400',
    bgColor: 'bg-red-950/40',
    borderColor: 'border-red-700/50',
    philosophy: 'Warns about hype cycles, overvaluation, and market corrections. Patience pays.',
  },
  {
    id: 'veteran',
    name: 'The Veteran',
    badge: '🏛️',
    title: '30-Year Collector',
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-700/50',
    philosophy: 'Survived the Junk Wax Era. Trusts history, scarcity, and long-term fundamentals.',
  },
  {
    id: 'flipper',
    name: 'The Flipper',
    badge: '💰',
    title: 'Profit Hunter',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40',
    borderColor: 'border-cyan-700/50',
    philosophy: 'In and out fast. Reads momentum, exploits timing windows, and never falls in love with a card.',
  },
  {
    id: 'newcomer',
    name: 'The Newcomer',
    badge: '🌟',
    title: 'Fresh Eyes',
    color: 'text-violet-400',
    bgColor: 'bg-violet-950/40',
    borderColor: 'border-violet-700/50',
    philosophy: 'Came in through social media. Values community, aesthetics, and new collecting experiences.',
  },
];

// --- Debate Topics ---
const debateTopics: Topic[] = [
  { question: 'Are rookie cards overvalued in today\'s market?', category: 'Investment Strategy' },
  { question: 'Is vintage (pre-1980) a better long-term investment than modern?', category: 'Investment Strategy' },
  { question: 'Will graded cards continue to dominate, or is raw making a comeback?', category: 'Collecting Philosophy' },
  { question: 'Is the hobby in a bubble, or are we just getting started?', category: 'Market Outlook' },
  { question: 'Should you collect what you love or invest for profit?', category: 'Collecting Philosophy' },
  { question: 'Are PSA 10s worth the premium over PSA 9s?', category: 'Investment Strategy' },
  { question: 'Which sport has the best card market right now?', category: 'Sport Analysis' },
  { question: 'Is baseball the safest long-term card investment?', category: 'Sport Analysis', sportFocus: 'baseball' },
  { question: 'Are basketball cards overexposed to a single star (Wembanyama)?', category: 'Sport Analysis', sportFocus: 'basketball' },
  { question: 'Can football cards ever catch baseball in legacy value?', category: 'Sport Analysis', sportFocus: 'football' },
  { question: 'Are hockey cards the hobby\'s best-kept secret?', category: 'Sport Analysis', sportFocus: 'hockey' },
  { question: 'Should beginners start with sealed wax or singles?', category: 'Collecting Philosophy' },
  { question: 'Is eBay still the best platform for selling cards?', category: 'Current Events' },
  { question: 'Will AI-grading kill traditional grading companies?', category: 'Current Events' },
  { question: 'Are card breaks good or bad for the hobby?', category: 'Current Events' },
  { question: 'Should you sell during the hype or hold for retirement?', category: 'Investment Strategy' },
  { question: 'Is the second-year dip real, and should you buy it?', category: 'Market Outlook' },
  { question: 'Are serial-numbered cards (/25, /10, /5) worth the chase?', category: 'Collecting Philosophy' },
  { question: 'Will the card hobby survive the next recession?', category: 'Market Outlook' },
  { question: 'Is it better to go deep on one player or diversify?', category: 'Investment Strategy' },
  { question: 'Are error cards and variations undervalued?', category: 'Collecting Philosophy' },
  { question: 'Should card shows adapt to the digital age?', category: 'Current Events' },
  { question: 'Is the current rookie class the best in a decade?', category: 'Market Outlook' },
  { question: 'Will cards ever be treated as a legitimate asset class?', category: 'Market Outlook' },
  { question: 'Are refractors and parallels diluting the market?', category: 'Collecting Philosophy' },
  { question: 'Is buying high-end ($1,000+) cards worth it for average collectors?', category: 'Investment Strategy' },
  { question: 'Should Panini losing its NBA license worry basketball collectors?', category: 'Current Events' },
  { question: 'Are autograph cards losing their appeal?', category: 'Collecting Philosophy' },
  { question: 'Is international player cards the next frontier?', category: 'Market Outlook' },
  { question: 'Are card subscription boxes a good deal?', category: 'Current Events' },
];

// --- Argument Templates ---
function generateArguments(topic: Topic, rng: () => number, sportCards: typeof sportsCards): Record<string, string> {
  const cards = sportCards.length > 0 ? sportCards : sportsCards;
  const sortedByValue = [...cards].sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
  const topCard = sortedByValue[Math.floor(rng() * Math.min(20, sortedByValue.length))];
  const midCard = sortedByValue[Math.floor(sortedByValue.length * 0.3 + rng() * sortedByValue.length * 0.3)];
  const rookieCards = cards.filter(c => c.rookie);
  const rookieCard = rookieCards.length > 0 ? rookieCards[Math.floor(rng() * rookieCards.length)] : topCard;
  const vintageCards = cards.filter(c => Number(c.year) < 1990);
  const vintageCard = vintageCards.length > 0 ? vintageCards[Math.floor(rng() * vintageCards.length)] : topCard;

  const topVal = parseValue(topCard?.estimatedValueRaw || '$100');
  const midVal = parseValue(midCard?.estimatedValueRaw || '$20');
  const rookieVal = parseValue(rookieCard?.estimatedValueRaw || '$50');

  const q = topic.question.toLowerCase();

  // Bull arguments
  const bullArgs = [
    `The numbers don't lie — cards like ${topCard?.player}'s ${topCard?.set} (${topCard?.estimatedValueRaw}) have shown consistent appreciation. More money is entering the hobby every year through social media exposure and mainstream acceptance. This is still early innings for serious card investors.`,
    `Look at ${rookieCard?.player} — a ${rookieCard?.rookie ? 'rookie' : 'key'} card already valued at ${rookieCard?.estimatedValueRaw}. The addressable market for cards is growing as Gen Z discovers the hobby through content creators. Population reports show demand outpacing supply on premium cards.`,
    `Every correction is a buying opportunity. ${topCard?.player}'s cards dipped last quarter and bounced back harder. Institutional money hasn't even arrived yet — when fractional card ownership goes mainstream, prices will look cheap in hindsight.`,
  ];

  // Bear arguments
  const bearArgs = [
    `We've seen this movie before — remember 1991? Everyone thought cards were a guaranteed investment then too. ${topCard?.player} at ${topCard?.estimatedValueRaw} is pricing in perfection. One bad season, one scandal, and that value evaporates overnight. The smart money is waiting.`,
    `The grading backlog is inflating perceived scarcity. When PSA catches up and pop reports spike, cards like ${midCard?.player}'s ${midCard?.set} will correct 20-30%. Most collectors are overleveraged on modern cards with print runs they don't fully understand.`,
    `Ask yourself: who is the buyer at these prices in 5 years? ${rookieCard?.player} at ${rookieCard?.estimatedValueRaw} needs sustained superstar performance just to hold value. History shows most rookies depreciate — only the true all-time greats appreciate long term.`,
  ];

  // Veteran arguments
  const veteranArgs = [
    `I've collected through booms and busts since the 1980s. The cards that held value were always the true legends in high grade — not hype picks. ${vintageCard?.player}'s ${vintageCard?.year} ${vintageCard?.set} has appreciated for decades because scarcity is real, not manufactured. Stick to cards that have already proven themselves.`,
    `The fundamentals haven't changed in 40 years: buy scarcity, buy condition, buy Hall of Famers. ${topCard?.player} could be a generational talent, sure. But I've seen dozens of "can't miss" prospects whose cards are now dollar bin fodder. Time separates the legends from the hype.`,
    `What the newcomers don't understand is that the hobby is cyclical. We're in a growth phase now, but corrections are healthy and inevitable. The collectors who survive build around vintage anchors like ${vintageCard?.player} and treat modern cards as the speculative portion of their portfolio.`,
  ];

  // Flipper arguments
  const flipperArgs = [
    `Forget the philosophy — follow the money. ${topCard?.player}'s cards have a 3-week flip window right now with margins of 15-25% if you buy raw and sell graded. The question isn't whether cards are "overvalued" — it's whether you can extract profit in the next 30 days.`,
    `I flipped ${midCard?.player}'s ${midCard?.set} three times last quarter. Buy the Monday dip, sell the Friday hype. Platform arbitrage between eBay and card shows alone is a 10% edge. Stop thinking like a collector and start thinking like a trader.`,
    `The Flipper's playbook is simple: catch the wave early, ride the momentum, and exit before consensus catches up. Right now ${rookieCard?.player} is in a buy window — social media sentiment is positive but pricing hasn't caught up. That gap is profit.`,
  ];

  // Newcomer arguments
  const newcomerArgs = [
    `I discovered cards through TikTok two years ago, and here's what the old guard misses: community IS value. ${topCard?.player}'s cards have a massive following, share counts through the roof, and that drives demand regardless of what the spreadsheet says. Culture moves markets.`,
    `The hobby needs fresh energy, and that means embracing new formats. Card breaks democratize access — a kid can get a ${midCard?.player} card for $20 instead of buying a $150 box. That expands the collector base, which lifts all boats. Stop gatekeeping.`,
    `My generation doesn't just collect — we create content around it. Unboxing videos, grading reveals, portfolio updates. ${rookieCard?.player}'s rookie card gets more engagement than most vintage cards combined. Attention is the new scarcity, and modern cards have it.`,
  ];

  const pick = (arr: string[]) => arr[Math.floor(rng() * arr.length)];

  return {
    bull: pick(bullArgs),
    bear: pick(bearArgs),
    veteran: pick(veteranArgs),
    flipper: pick(flipperArgs),
    newcomer: pick(newcomerArgs),
  };
}

// --- Community consensus simulation ---
function simulateCommunity(rng: () => number): Record<string, number> {
  const weights = {
    bull: 15 + Math.floor(rng() * 15),
    bear: 10 + Math.floor(rng() * 15),
    veteran: 15 + Math.floor(rng() * 15),
    flipper: 10 + Math.floor(rng() * 12),
    newcomer: 8 + Math.floor(rng() * 12),
  };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, Math.round((v / total) * 100)])
  );
}

const sportLabels: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };
const categoryColors: Record<string, string> = {
  'Market Outlook': 'text-sky-400 bg-sky-950/50 border-sky-800/40',
  'Investment Strategy': 'text-emerald-400 bg-emerald-950/50 border-emerald-800/40',
  'Sport Analysis': 'text-orange-400 bg-orange-950/50 border-orange-800/40',
  'Collecting Philosophy': 'text-violet-400 bg-violet-950/50 border-violet-800/40',
  'Current Events': 'text-rose-400 bg-rose-950/50 border-rose-800/40',
};

const STATS_KEY = 'cardvault_roundtable_stats';
const VOTE_KEY = 'cardvault_roundtable_vote';

function loadStats(): RoundtableStats {
  if (typeof window === 'undefined') return { debatesJoined: 0, votesCast: 0, panelistVotes: {}, communityAgrees: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { debatesJoined: 0, votesCast: 0, panelistVotes: {}, communityAgrees: 0 };
  } catch { return { debatesJoined: 0, votesCast: 0, panelistVotes: {}, communityAgrees: 0 }; }
}

function saveStats(stats: RoundtableStats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch {}
}

function loadTodayVote(seed: number): string | null {
  try {
    const raw = localStorage.getItem(VOTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.seed === seed ? parsed.vote : null;
  } catch { return null; }
}

function saveTodayVote(seed: number, vote: string) {
  try { localStorage.setItem(VOTE_KEY, JSON.stringify({ seed, vote })); } catch {}
}

export default function MarketRoundtableClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [sport, setSport] = useState<SportFilter>('all');
  const [randomSeed, setRandomSeed] = useState(0);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [stats, setStats] = useState<RoundtableStats>({ debatesJoined: 0, votesCast: 0, panelistVotes: {}, communityAgrees: 0 });
  const [showStats, setShowStats] = useState(false);
  const [revealedPanelists, setRevealedPanelists] = useState<Set<string>>(new Set());

  const seed = mode === 'daily' ? dateHash() : randomSeed;

  // Load stats and today's vote on mount
  useEffect(() => {
    setStats(loadStats());
    const todayVote = loadTodayVote(seed);
    if (todayVote) {
      setUserVote(todayVote);
      setShowResults(true);
      setRevealedPanelists(new Set(panelists.map(p => p.id)));
    }
  }, [seed]);

  // Filter cards by sport
  const filteredCards = useMemo(() => {
    if (sport === 'all') return sportsCards;
    return sportsCards.filter(c => c.sport === sport);
  }, [sport]);

  // Pick topic and generate arguments
  const { topic, args, community } = useMemo(() => {
    const rng = seededRng(seed + 777);
    let validTopics = debateTopics;
    if (sport !== 'all') {
      const sportSpecific = debateTopics.filter(t => t.sportFocus === sport || !t.sportFocus);
      if (sportSpecific.length > 0) validTopics = sportSpecific;
    }
    const topicIndex = Math.floor(rng() * validTopics.length);
    const pickedTopic = validTopics[topicIndex];
    const arguments_ = generateArguments(pickedTopic, rng, filteredCards);
    const communityVotes = simulateCommunity(rng);
    return { topic: pickedTopic, args: arguments_, community: communityVotes };
  }, [seed, sport, filteredCards]);

  // Get community winner
  const communityWinner = useMemo(() => {
    let maxId = 'bull';
    let maxVal = 0;
    for (const [id, val] of Object.entries(community)) {
      if (val > maxVal) { maxVal = val; maxId = id; }
    }
    return maxId;
  }, [community]);

  const handleVote = useCallback((panelistId: string) => {
    if (userVote) return;
    setUserVote(panelistId);
    setShowResults(true);
    saveTodayVote(seed, panelistId);

    const newStats = { ...stats };
    newStats.votesCast++;
    newStats.debatesJoined++;
    newStats.panelistVotes[panelistId] = (newStats.panelistVotes[panelistId] || 0) + 1;
    if (panelistId === communityWinner) newStats.communityAgrees++;
    setStats(newStats);
    saveStats(newStats);
  }, [userVote, seed, stats, communityWinner]);

  const handleRandom = useCallback(() => {
    setMode('random');
    setRandomSeed(Date.now());
    setUserVote(null);
    setShowResults(false);
    setRevealedPanelists(new Set());
  }, []);

  const handleDaily = useCallback(() => {
    setMode('daily');
    const todayVote = loadTodayVote(dateHash());
    if (todayVote) {
      setUserVote(todayVote);
      setShowResults(true);
      setRevealedPanelists(new Set(panelists.map(p => p.id)));
    } else {
      setUserVote(null);
      setShowResults(false);
      setRevealedPanelists(new Set());
    }
  }, []);

  const togglePanelist = useCallback((id: string) => {
    setRevealedPanelists(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const revealAll = useCallback(() => {
    setRevealedPanelists(new Set(panelists.map(p => p.id)));
  }, []);

  // Favorite panelist
  const favPanelist = useMemo(() => {
    let maxId = '';
    let maxVotes = 0;
    for (const [id, count] of Object.entries(stats.panelistVotes)) {
      if (count > maxVotes) { maxVotes = count; maxId = id; }
    }
    return panelists.find(p => p.id === maxId);
  }, [stats]);

  const catColor = categoryColors[topic.category] || 'text-gray-400 bg-gray-900/50 border-gray-700/50';

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-gray-900/80 rounded-lg p-1">
          <button onClick={handleDaily} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'daily' ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            Daily
          </button>
          <button onClick={handleRandom} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'random' ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            Random
          </button>
        </div>
        <div className="flex gap-1 bg-gray-900/80 rounded-lg p-1">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
            <button key={s} onClick={() => setSport(s)} className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${sport === s ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All' : sportLabels[s]}
            </button>
          ))}
        </div>
        <button onClick={() => setShowStats(!showStats)} className="ml-auto px-3 py-1.5 rounded bg-gray-900/80 text-xs font-medium text-gray-400 hover:text-white transition-colors">
          {showStats ? 'Hide Stats' : 'My Stats'}
        </button>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Your Roundtable Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-sky-400">{stats.debatesJoined}</div>
              <div className="text-xs text-gray-500">Debates Joined</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{stats.votesCast}</div>
              <div className="text-xs text-gray-500">Votes Cast</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">
                {favPanelist ? favPanelist.badge : '—'}
              </div>
              <div className="text-xs text-gray-500">
                Fav: {favPanelist ? favPanelist.name : 'None yet'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-400">
                {stats.votesCast > 0 ? `${Math.round((stats.communityAgrees / stats.votesCast) * 100)}%` : '—'}
              </div>
              <div className="text-xs text-gray-500">Community Agreement</div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Card */}
      <div className="bg-gradient-to-br from-slate-900 to-gray-900 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${catColor}`}>
            {topic.category}
          </span>
          {topic.sportFocus && (
            <span className="text-xs text-gray-500">
              {sportLabels[topic.sportFocus] || topic.sportFocus}
            </span>
          )}
          <span className="text-xs text-gray-600 ml-auto">
            {mode === 'daily' ? 'Today\'s Debate' : 'Random Debate'}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
          {topic.question}
        </h2>
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>5 panelists</span>
          <span>{filteredCards.length.toLocaleString()} cards analyzed</span>
          {!showResults && revealedPanelists.size < 5 && (
            <button onClick={revealAll} className="text-sky-400 hover:text-sky-300 transition-colors ml-auto">
              Reveal all arguments
            </button>
          )}
        </div>
      </div>

      {/* Panelist Arguments */}
      <div className="space-y-3">
        {panelists.map(p => {
          const isRevealed = revealedPanelists.has(p.id) || showResults;
          const isVoted = userVote === p.id;
          const communityPct = community[p.id] || 0;
          const isWinner = p.id === communityWinner && showResults;

          return (
            <div
              key={p.id}
              className={`${p.bgColor} border ${isVoted ? 'border-sky-500 ring-1 ring-sky-500/30' : isWinner ? `${p.borderColor} ring-1 ring-amber-500/20` : p.borderColor} rounded-xl overflow-hidden transition-all`}
            >
              {/* Panelist Header — always clickable to reveal */}
              <button
                onClick={() => !showResults && togglePanelist(p.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
              >
                <span className="text-2xl">{p.badge}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${p.color}`}>{p.name}</span>
                    <span className="text-xs text-gray-500">{p.title}</span>
                    {isWinner && <span className="text-xs bg-amber-900/60 text-amber-400 px-2 py-0.5 rounded-full">Community Pick</span>}
                    {isVoted && <span className="text-xs bg-sky-900/60 text-sky-400 px-2 py-0.5 rounded-full">Your Vote</span>}
                  </div>
                  {!isRevealed && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">{p.philosophy}</p>
                  )}
                </div>
                {!showResults && (
                  <span className="text-gray-600 text-sm">
                    {isRevealed ? '▼' : '▶'}
                  </span>
                )}
                {showResults && (
                  <div className="text-right">
                    <span className={`text-lg font-bold ${p.color}`}>{communityPct}%</span>
                  </div>
                )}
              </button>

              {/* Argument Body */}
              {isRevealed && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    &ldquo;{args[p.id]}&rdquo;
                  </p>

                  {/* Community vote bar (shown after voting) */}
                  {showResults && (
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          p.id === 'bull' ? 'bg-emerald-500' :
                          p.id === 'bear' ? 'bg-red-500' :
                          p.id === 'veteran' ? 'bg-amber-500' :
                          p.id === 'flipper' ? 'bg-cyan-500' :
                          'bg-violet-500'
                        }`}
                        style={{ width: `${communityPct}%` }}
                      />
                    </div>
                  )}

                  {/* Vote button */}
                  {!userVote && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleVote(p.id); }}
                      className={`mt-1 px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${p.borderColor} text-gray-300 hover:text-white hover:bg-gray-800/50`}
                    >
                      Vote for {p.name}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Results Summary */}
      {showResults && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Debate Results</h3>
          <p className="text-sm text-gray-400">
            {userVote === communityWinner
              ? '✅ You voted with the majority! Your pick matched the community consensus.'
              : `The community favored ${panelists.find(p => p.id === communityWinner)?.name} on this one. You went with ${panelists.find(p => p.id === userVote)?.name} — a bold independent pick.`
            }
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mode === 'daily' && (
              <button onClick={handleRandom} className="px-3 py-1.5 rounded-lg bg-sky-900/50 border border-sky-800/50 text-sky-400 text-xs font-medium hover:bg-sky-900/70 transition-colors">
                Try a Random Debate
              </button>
            )}
            {mode === 'random' && (
              <button onClick={handleRandom} className="px-3 py-1.5 rounded-lg bg-sky-900/50 border border-sky-800/50 text-sky-400 text-xs font-medium hover:bg-sky-900/70 transition-colors">
                New Random Debate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Card Data Attribution */}
      <p className="text-xs text-gray-600 text-center">
        Arguments reference real data from {sportsCards.length.toLocaleString()} sports cards in the CardVault database.
        Simulated community votes use deterministic seeding — all visitors see the same results.
      </p>
    </div>
  );
}
