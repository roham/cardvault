'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Helpers ───────────────────────────────────────────────────────────

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString();
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// AI personality names
const AI_NAMES = [
  { name: 'FlipKing', style: 'value', emoji: '💰' },
  { name: 'RookieHunter', style: 'rookie', emoji: '⭐' },
  { name: 'VintageVault', style: 'vintage', emoji: '🏛️' },
  { name: 'AllSportAce', style: 'balanced', emoji: '🎯' },
  { name: 'HockeyHero', style: 'hockey', emoji: '🏒' },
  { name: 'GridironGuru', style: 'football', emoji: '🏈' },
  { name: 'DiamondDave', style: 'baseball', emoji: '⚾' },
];

type DraftPhase = 'setup' | 'drafting' | 'results';
type DraftFormat = '4-team' | '6-team' | '8-team';

interface DraftPick {
  round: number;
  pick: number;
  overall: number;
  drafter: string;
  card: SportsCard;
  value: number;
  isUser: boolean;
}

interface DraftTeam {
  name: string;
  emoji: string;
  style: string;
  cards: SportsCard[];
  totalValue: number;
  isUser: boolean;
}

// ── AI pick logic ─────────────────────────────────────────────────────

function aiPick(
  available: { card: SportsCard; value: number }[],
  style: string,
  rng: () => number,
): { card: SportsCard; value: number } {
  let pool = [...available];

  // Style-based filtering: AI has preferences but isn't perfect
  switch (style) {
    case 'value':
      // Top 20% by value
      pool.sort((a, b) => b.value - a.value);
      pool = pool.slice(0, Math.max(5, Math.floor(pool.length * 0.2)));
      break;
    case 'rookie':
      // Prefer rookies
      { const rookies = pool.filter(c => c.card.rookie);
      if (rookies.length >= 3) pool = rookies; }
      break;
    case 'vintage':
      // Prefer pre-1990
      { const vintage = pool.filter(c => c.card.year < 1990);
      if (vintage.length >= 3) pool = vintage; }
      break;
    case 'hockey':
      { const hockey = pool.filter(c => c.card.sport === 'hockey');
      if (hockey.length >= 3) pool = hockey; }
      break;
    case 'football':
      { const football = pool.filter(c => c.card.sport === 'football');
      if (football.length >= 3) pool = football; }
      break;
    case 'baseball':
      { const baseball = pool.filter(c => c.card.sport === 'baseball');
      if (baseball.length >= 3) pool = baseball; }
      break;
    default:
      // balanced — slight preference for value
      pool.sort((a, b) => b.value - a.value);
      pool = pool.slice(0, Math.max(8, Math.floor(pool.length * 0.4)));
      break;
  }

  // Weighted random from pool (top cards more likely)
  pool.sort((a, b) => b.value - a.value);
  const weights = pool.map((_, i) => Math.pow(0.85, i));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = rng() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[0];
}

// ── Component ─────────────────────────────────────────────────────────

export default function CollectionDraftClient() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<DraftPhase>('setup');
  const [format, setFormat] = useState<DraftFormat>('4-team');
  const [rounds, setRounds] = useState(5);
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [teams, setTeams] = useState<DraftTeam[]>([]);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [currentPick, setCurrentPick] = useState(0);
  const [available, setAvailable] = useState<{ card: SportsCard; value: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'name' | 'year'>('value');
  const [showDraftBoard, setShowDraftBoard] = useState(false);
  const [userPosition, setUserPosition] = useState(0);

  useEffect(() => setMounted(true), []);

  const numTeams = format === '4-team' ? 4 : format === '6-team' ? 6 : 8;
  const totalPicks = numTeams * rounds;

  // Get snake draft order
  const getDraftOrder = useCallback((numT: number, numR: number): { team: number; round: number; pick: number }[] => {
    const order: { team: number; round: number; pick: number }[] = [];
    for (let r = 0; r < numR; r++) {
      const isEven = r % 2 === 0;
      for (let t = 0; t < numT; t++) {
        const teamIdx = isEven ? t : numT - 1 - t;
        order.push({ team: teamIdx, round: r + 1, pick: t + 1 });
      }
    }
    return order;
  }, []);

  // Is it the user's pick?
  const isUserPick = useMemo(() => {
    if (phase !== 'drafting') return false;
    const order = getDraftOrder(numTeams, rounds);
    if (currentPick >= order.length) return false;
    return order[currentPick].team === userPosition;
  }, [phase, currentPick, numTeams, rounds, userPosition, getDraftOrder]);

  // Current drafter info
  const currentDrafter = useMemo(() => {
    const order = getDraftOrder(numTeams, rounds);
    if (currentPick >= order.length) return null;
    const o = order[currentPick];
    return teams[o.team] || null;
  }, [currentPick, numTeams, rounds, teams, getDraftOrder]);

  // Filtered available cards for user
  const filteredAvailable = useMemo(() => {
    let pool = [...available];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(c =>
        c.card.player.toLowerCase().includes(q) ||
        c.card.name.toLowerCase().includes(q) ||
        c.card.set.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'value': pool.sort((a, b) => b.value - a.value); break;
      case 'name': pool.sort((a, b) => a.card.player.localeCompare(b.card.player)); break;
      case 'year': pool.sort((a, b) => b.card.year - a.card.year); break;
    }
    return pool.slice(0, 50);
  }, [available, searchQuery, sortBy]);

  // Start draft
  function startDraft() {
    const seed = Date.now();
    const rng = seededRandom(seed);

    // Build card pool
    let pool = sportsCards.map(c => ({ card: c, value: parseValue(c.estimatedValueRaw) }));
    pool = pool.filter(c => c.value >= 10); // Only draft-worthy cards
    if (sportFilter !== 'all') pool = pool.filter(c => c.card.sport === sportFilter);

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Determine user position (random)
    const pos = Math.floor(rng() * numTeams);
    setUserPosition(pos);

    // Build teams
    const shuffledAI = [...AI_NAMES];
    for (let i = shuffledAI.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffledAI[i], shuffledAI[j]] = [shuffledAI[j], shuffledAI[i]];
    }

    const draftTeams: DraftTeam[] = [];
    for (let i = 0; i < numTeams; i++) {
      if (i === pos) {
        draftTeams.push({ name: 'You', emoji: '🏆', style: 'user', cards: [], totalValue: 0, isUser: true });
      } else {
        const ai = shuffledAI.pop() || AI_NAMES[0];
        draftTeams.push({ name: ai.name, emoji: ai.emoji, style: ai.style, cards: [], totalValue: 0, isUser: false });
      }
    }

    setTeams(draftTeams);
    setAvailable(pool);
    setPicks([]);
    setCurrentPick(0);
    setPhase('drafting');

    // If first pick isn't user, start AI picks
    const order = getDraftOrder(numTeams, rounds);
    if (order[0].team !== pos) {
      runAIPicks(draftTeams, pool, [], 0, order, pos, rng);
    }
  }

  // Run AI picks until it's user's turn (or draft ends)
  function runAIPicks(
    currentTeams: DraftTeam[],
    currentAvailable: { card: SportsCard; value: number }[],
    currentPicks: DraftPick[],
    startIdx: number,
    order: { team: number; round: number; pick: number }[],
    userPos: number,
    rng: () => number,
  ) {
    let idx = startIdx;
    const newPicks = [...currentPicks];
    const newAvailable = [...currentAvailable];
    const newTeams = currentTeams.map(t => ({ ...t, cards: [...t.cards] }));

    while (idx < order.length && order[idx].team !== userPos) {
      const o = order[idx];
      const team = newTeams[o.team];
      const picked = aiPick(newAvailable, team.style, rng);

      team.cards.push(picked.card);
      team.totalValue += picked.value;

      newPicks.push({
        round: o.round,
        pick: o.pick,
        overall: idx + 1,
        drafter: team.name,
        card: picked.card,
        value: picked.value,
        isUser: false,
      });

      // Remove from available
      const removeIdx = newAvailable.findIndex(c => c.card.slug === picked.card.slug);
      if (removeIdx !== -1) newAvailable.splice(removeIdx, 1);

      idx++;
    }

    setTeams(newTeams);
    setAvailable(newAvailable);
    setPicks(newPicks);
    setCurrentPick(idx);

    // Check if draft is over
    if (idx >= order.length) {
      setPhase('results');
    }
  }

  // User makes a pick
  function userPick(card: SportsCard, value: number) {
    const order = getDraftOrder(numTeams, rounds);
    const o = order[currentPick];

    const newTeams = teams.map(t => ({ ...t, cards: [...t.cards] }));
    const team = newTeams[o.team];
    team.cards.push(card);
    team.totalValue += value;

    const newPick: DraftPick = {
      round: o.round,
      pick: o.pick,
      overall: currentPick + 1,
      drafter: 'You',
      card,
      value,
      isUser: true,
    };

    const newPicks = [...picks, newPick];
    const newAvailable = available.filter(c => c.card.slug !== card.slug);
    const nextIdx = currentPick + 1;

    setTeams(newTeams);
    setPicks(newPicks);
    setAvailable(newAvailable);
    setSearchQuery('');

    if (nextIdx >= order.length) {
      setCurrentPick(nextIdx);
      setPhase('results');
      return;
    }

    setCurrentPick(nextIdx);

    // Continue AI picks
    const rng = seededRandom(Date.now());
    if (order[nextIdx].team !== userPosition) {
      // Use setTimeout so the UI updates with the user's pick before AI runs
      setTimeout(() => {
        runAIPicks(newTeams, newAvailable, newPicks, nextIdx, order, userPosition, rng);
      }, 300);
    }
  }

  // Ranking for results
  const rankings = useMemo(() => {
    return [...teams].sort((a, b) => b.totalValue - a.totalValue);
  }, [teams]);

  const userRank = useMemo(() => {
    return rankings.findIndex(t => t.isUser) + 1;
  }, [rankings]);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-500">Loading draft...</div>;
  }

  // ═══════════════════════════════════════════════════════════════
  // SETUP PHASE
  // ═══════════════════════════════════════════════════════════════
  if (phase === 'setup') {
    return (
      <div className="space-y-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Draft Settings</h2>

          {/* Format */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">League Size</label>
            <div className="flex gap-3">
              {(['4-team', '6-team', '8-team'] as DraftFormat[]).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${format === f
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                  {f.replace('-', ' ').replace('t', 'T')}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rounds: {rounds}</label>
            <div className="flex gap-3">
              {[3, 5, 7, 10].map(r => (
                <button key={r} onClick={() => setRounds(r)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${rounds === r
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                  {r} rounds
                </button>
              ))}
            </div>
          </div>

          {/* Sport filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Card Pool</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Sports' },
                { value: 'baseball', label: 'Baseball' },
                { value: 'basketball', label: 'Basketball' },
                { value: 'football', label: 'Football' },
                { value: 'hockey', label: 'Hockey' },
              ].map(s => (
                <button key={s.value} onClick={() => setSportFilter(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sportFilter === s.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">{numTeams} teams</span> &middot;{' '}
              <span className="text-white font-medium">{rounds} rounds</span> &middot;{' '}
              <span className="text-white font-medium">{numTeams * rounds} total picks</span> &middot;{' '}
              Snake draft order (picks reverse each round)
            </p>
          </div>

          <button onClick={startDraft}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors">
            Start Draft
          </button>
        </div>

        {/* How it works */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">How Snake Drafts Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-emerald-400 font-medium mb-1">Round 1: Normal Order</p>
              <p className="text-gray-400">Team 1 picks first, then 2, 3, 4...</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-emerald-400 font-medium mb-1">Round 2: Reversed</p>
              <p className="text-gray-400">Last team picks first (Team 4, 3, 2, 1)</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-emerald-400 font-medium mb-1">Build Your Collection</p>
              <p className="text-gray-400">Highest total value wins. Strategy matters!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DRAFTING PHASE
  // ═══════════════════════════════════════════════════════════════
  if (phase === 'drafting') {
    const order = getDraftOrder(numTeams, rounds);
    const currentOrder = order[currentPick] || order[order.length - 1];
    const userTeam = teams[userPosition];

    return (
      <div className="space-y-6">
        {/* Draft progress bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Pick {currentPick + 1} of {totalPicks} &middot; Round {currentOrder.round}
            </span>
            <span className={`text-sm font-medium ${isUserPick ? 'text-emerald-400' : 'text-gray-400'}`}>
              {isUserPick ? 'YOUR PICK' : `${currentDrafter?.emoji} ${currentDrafter?.name} picking...`}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentPick / totalPicks) * 100}%` }} />
          </div>
        </div>

        {/* Your team summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Your Team ({userTeam?.cards.length || 0}/{rounds} picks)</h3>
            <span className="text-emerald-400 font-bold">{formatCurrency(userTeam?.totalValue || 0)}</span>
          </div>
          {userTeam?.cards.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userTeam.cards.map((c, i) => (
                <div key={c.slug + i} className="bg-gray-800 rounded-lg px-3 py-1.5 text-xs">
                  <span className="text-white">{c.player}</span>
                  <span className="text-gray-500 ml-1">{c.estimatedValueRaw}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No picks yet</p>
          )}
        </div>

        {/* Toggle draft board */}
        <button onClick={() => setShowDraftBoard(!showDraftBoard)}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          {showDraftBoard ? 'Hide' : 'Show'} Draft Board ({picks.length} picks made)
        </button>

        {showDraftBoard && picks.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 max-h-60 overflow-y-auto">
            <div className="space-y-1">
              {picks.slice().reverse().map((p, i) => (
                <div key={i} className={`flex items-center justify-between text-xs py-1 ${p.isUser ? 'text-emerald-400' : 'text-gray-400'}`}>
                  <span className="font-mono w-8">#{p.overall}</span>
                  <span className="flex-1 truncate mx-2">{p.drafter}: {p.card.player}</span>
                  <span className="font-medium">{p.card.estimatedValueRaw}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card selection (user's turn) */}
        {isUserPick && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-emerald-400 font-bold">Your Pick!</p>
                <p className="text-gray-400 text-sm">Round {currentOrder.round}, Pick {currentOrder.pick} (#{currentPick + 1} overall)</p>
              </div>
            </div>

            {/* Search and sort */}
            <div className="flex flex-wrap gap-3">
              <input type="text" placeholder="Search players..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 w-48 focus:outline-none focus:border-emerald-600" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'value' | 'name' | 'year')}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                <option value="value">Value: High to Low</option>
                <option value="name">Player Name</option>
                <option value="year">Year: Newest</option>
              </select>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredAvailable.map(c => (
                <button key={c.card.slug} onClick={() => userPick(c.card, c.value)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-left hover:border-emerald-600 transition-colors group">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors line-clamp-1">{c.card.player}</span>
                    <span className="text-emerald-400 text-sm font-bold ml-2 whitespace-nowrap">{c.card.estimatedValueRaw}</span>
                  </div>
                  <p className="text-gray-500 text-xs line-clamp-1">{c.card.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-gray-500 capitalize">{c.card.sport}</span>
                    <span className="text-[10px] text-gray-600">&middot;</span>
                    <span className="text-[10px] text-gray-500">{c.card.year}</span>
                    {c.card.rookie && <span className="text-[10px] text-amber-400 font-bold">RC</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Waiting for AI */}
        {!isUserPick && (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-pulse text-4xl mb-3">{currentDrafter?.emoji}</div>
            <p className="text-lg">{currentDrafter?.name} is picking...</p>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RESULTS PHASE
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">
      {/* Result banner */}
      <div className={`text-center py-8 rounded-2xl border ${
        userRank === 1 ? 'bg-yellow-950/30 border-yellow-700/50' :
        userRank <= 3 ? 'bg-emerald-950/30 border-emerald-800/50' :
        'bg-gray-900 border-gray-800'
      }`}>
        <p className="text-5xl mb-3">{userRank === 1 ? '🏆' : userRank === 2 ? '🥈' : userRank === 3 ? '🥉' : '📊'}</p>
        <h2 className="text-2xl font-bold text-white mb-1">
          {userRank === 1 ? 'Draft Champion!' : userRank <= 3 ? `${userRank}${userRank === 2 ? 'nd' : 'rd'} Place!` : `${userRank}th Place`}
        </h2>
        <p className="text-gray-400">
          Your collection: <span className="text-emerald-400 font-bold">{formatCurrency(teams[userPosition]?.totalValue || 0)}</span>
        </p>
      </div>

      {/* Final standings */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Final Standings</h3>
        <div className="space-y-3">
          {rankings.map((team, i) => (
            <div key={team.name} className={`flex items-center justify-between p-3 rounded-xl border ${
              team.isUser ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-gray-800/30 border-gray-800/50'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">
                  {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span className="text-xl">{team.emoji}</span>
                <div>
                  <p className={`font-medium ${team.isUser ? 'text-emerald-400' : 'text-white'}`}>
                    {team.name} {team.isUser ? '(You)' : ''}
                  </p>
                  <p className="text-gray-500 text-xs">{team.cards.length} cards</p>
                </div>
              </div>
              <span className="text-white font-bold">{formatCurrency(team.totalValue)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Your picks */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Your Picks</h3>
        <div className="space-y-2">
          {teams[userPosition]?.cards.map((c, i) => {
            const val = parseValue(c.estimatedValueRaw);
            return (
              <div key={c.slug + i} className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-gray-600 font-mono w-5">R{i + 1}</span>
                  <div className="min-w-0">
                    <Link href={`/sports/${c.slug}`} className="text-white text-sm font-medium hover:text-emerald-400 transition-colors truncate block">
                      {c.name}
                    </Link>
                    <p className="text-gray-500 text-xs">{c.player} &middot; {c.year} &middot; {c.sport}</p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold text-sm whitespace-nowrap ml-3">{formatCurrency(val)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full draft board */}
      <details className="bg-gray-900 border border-gray-800 rounded-2xl">
        <summary className="px-6 py-4 text-white font-semibold cursor-pointer hover:text-emerald-400 transition-colors">
          Full Draft Board ({picks.length} picks)
        </summary>
        <div className="px-6 pb-6 space-y-1 max-h-80 overflow-y-auto">
          {picks.map((p, i) => (
            <div key={i} className={`flex items-center text-xs py-1.5 border-b border-gray-800/50 last:border-0 ${p.isUser ? 'text-emerald-400' : 'text-gray-400'}`}>
              <span className="font-mono w-8">#{p.overall}</span>
              <span className="w-8 text-gray-600">R{p.round}</span>
              <span className="w-28 truncate">{p.drafter}</span>
              <span className="flex-1 truncate text-white">{p.card.name}</span>
              <span className="font-medium ml-2">{p.card.estimatedValueRaw}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => { setPhase('setup'); setTeams([]); setPicks([]); setCurrentPick(0); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          Draft Again
        </button>
        <Link href="/leaderboard" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-medium border border-gray-700 transition-colors">
          Leaderboard
        </Link>
        <Link href="/tools/portfolio" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-medium border border-gray-700 transition-colors">
          Fantasy Portfolio
        </Link>
      </div>
    </div>
  );
}
