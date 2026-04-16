'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400',
};
const SPORT_BG: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40', basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40', hockey: 'bg-cyan-950/40 border-cyan-800/40',
};
const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2',
};

interface PullCard {
  slug: string;
  name: string;
  player: string;
  sport: string;
  value: number;
}

interface Racer {
  name: string;
  avatar: string;
  style: string; // personality description
  pulls: PullCard[];
  total: number;
  revealed: number;
}

const AI_RACERS = [
  { name: 'PackRipKing', avatar: '\ud83d\udc51', style: 'Aggressive ripper \u2014 rips fast, celebrates louder' },
  { name: 'GemMintGal', avatar: '\ud83d\udc8e', style: 'Careful collector \u2014 slow and steady, seeks quality' },
  { name: 'WaxBreaker99', avatar: '\ud83d\udd25', style: 'Veteran breaker \u2014 seen it all, plays the odds' },
];

const CARDS_PER_RACER = 5;
const REVEAL_INTERVAL = 1200; // ms per card reveal

export default function PackRaceClient() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'menu' | 'racing' | 'done'>('menu');
  const [isDaily, setIsDaily] = useState(true);
  const [racers, setRacers] = useState<Racer[]>([]);
  const [revealIndex, setRevealIndex] = useState(0); // which card we're revealing (0 to CARDS_PER_RACER-1)
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [stats, setStats] = useState({ races: 0, wins: 0, bestPull: 0, totalValue: 0 });
  const [commentary, setCommentary] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const validCards = useMemo(() =>
    sportsCards.filter(c => {
      const v = parseValue(c.estimatedValueRaw);
      return v >= 2 && v <= 1000 && (sportFilter === 'all' || c.sport === sportFilter);
    }), [sportFilter]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cv-pack-race-stats');
    if (saved) setStats(JSON.parse(saved));
  }, []);

  const saveStats = useCallback((s: typeof stats) => {
    setStats(s);
    localStorage.setItem('cv-pack-race-stats', JSON.stringify(s));
  }, []);

  const generateCommentary = useCallback((racerName: string, card: PullCard, cardIdx: number): string => {
    const val = card.value;
    if (val >= 200) return `\ud83d\udd25 ${racerName} pulls a MONSTER \u2014 ${card.player} worth $${val}! The crowd goes wild!`;
    if (val >= 100) return `\ud83d\udca5 Big hit for ${racerName}! ${card.player} at $${val} \u2014 that changes everything!`;
    if (val >= 50) return `\u2b50 ${racerName} lands a solid ${card.player} ($${val}) \u2014 nice pull!`;
    if (cardIdx === 0) return `\ud83c\udfc1 ${racerName} opens their first card: ${card.player} ($${val})`;
    if (val <= 5) return `\ud83d\ude10 ${racerName} pulls a base ${card.player} ($${val})... tough luck`;
    return `\ud83c\udccf ${racerName} gets ${card.player} ($${val})`;
  }, []);

  const startRace = useCallback(() => {
    if (validCards.length < CARDS_PER_RACER * 4) return;
    const seed = isDaily ? dateHash() : Date.now();
    const rng = seededRng(seed);

    // Generate pulls for all 4 racers (you + 3 AI)
    const allRacers: Racer[] = [
      { name: 'You', avatar: '\ud83c\udfc6', style: 'The challenger', pulls: [], total: 0, revealed: 0 },
      ...AI_RACERS.map(ai => ({ ...ai, pulls: [] as PullCard[], total: 0, revealed: 0 })),
    ];

    const usedIndices = new Set<number>();
    for (const racer of allRacers) {
      for (let i = 0; i < CARDS_PER_RACER; i++) {
        let idx = Math.floor(rng() * validCards.length);
        let attempts = 0;
        while (usedIndices.has(idx) && attempts < 100) {
          idx = (idx + 1) % validCards.length;
          attempts++;
        }
        usedIndices.add(idx);
        const card = validCards[idx];
        const val = parseValue(card.estimatedValueRaw);
        racer.pulls.push({
          slug: card.slug,
          name: card.name,
          player: card.player,
          sport: card.sport,
          value: val,
        });
        racer.total += val;
      }
    }

    setRacers(allRacers);
    setRevealIndex(-1);
    setCommentary(['\ud83c\udfc1 The race is about to begin! 4 collectors, 5 cards each. Who pulls the best pack?']);
    setMode('racing');

    // Start reveal sequence
    let currentReveal = 0;
    const revealNext = () => {
      if (currentReveal >= CARDS_PER_RACER) {
        // Race complete
        setMode('done');
        // Update stats
        const yourTotal = allRacers[0].total;
        const won = allRacers.every((r, i) => i === 0 || yourTotal >= r.total);
        const bestPull = Math.max(...allRacers[0].pulls.map(p => p.value));
        setStats(prev => {
          const newStats = {
            races: prev.races + 1,
            wins: prev.wins + (won ? 1 : 0),
            bestPull: Math.max(prev.bestPull, bestPull),
            totalValue: prev.totalValue + yourTotal,
          };
          localStorage.setItem('cv-pack-race-stats', JSON.stringify(newStats));
          return newStats;
        });
        return;
      }

      setRevealIndex(currentReveal);
      // Add commentary for each racer's reveal
      setCommentary(prev => {
        const newComments = [...prev];
        for (const racer of allRacers) {
          newComments.push(generateCommentary(racer.name, racer.pulls[currentReveal], currentReveal));
        }
        return newComments.slice(-12); // Keep last 12 comments
      });

      currentReveal++;
      timerRef.current = setTimeout(revealNext, REVEAL_INTERVAL);
    };

    timerRef.current = setTimeout(revealNext, 800);
  }, [validCards, isDaily, generateCommentary]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const getPlacement = useCallback(() => {
    if (racers.length === 0) return { rank: 0, label: '' };
    const sorted = [...racers].sort((a, b) => b.total - a.total);
    const yourIdx = sorted.findIndex(r => r.name === 'You');
    const labels = ['1st Place \ud83e\udd47', '2nd Place \ud83e\udd48', '3rd Place \ud83e\udd49', '4th Place'];
    return { rank: yourIdx + 1, label: labels[yourIdx] || '4th Place' };
  }, [racers]);

  const shareResults = useCallback(() => {
    const placement = getPlacement();
    const yourTotal = racers[0]?.total || 0;
    const sorted = [...racers].sort((a, b) => b.total - a.total);
    const podium = sorted.map((r, i) => `${i === 0 ? '\ud83e\udd47' : i === 1 ? '\ud83e\udd48' : i === 2 ? '\ud83e\udd49' : '4\ufe0f\u20e3'} ${r.name}: $${r.total}`).join('\n');
    const text = `\ud83c\udfc1 Pack Race Results!\n\nI finished ${placement.label}! ($${yourTotal} total)\n\n${podium}\n\nhttps://cardvault-two.vercel.app/pack-race`;
    navigator.clipboard.writeText(text);
  }, [racers, getPlacement]);

  if (!mounted) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  // --- MENU ---
  if (mode === 'menu') {
    return (
      <div className="space-y-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Races', value: stats.races, color: 'text-emerald-400' },
            { label: 'Wins', value: stats.wins, color: 'text-amber-400' },
            { label: 'Win Rate', value: stats.races > 0 ? `${Math.round((stats.wins / stats.races) * 100)}%` : '—', color: 'text-purple-400' },
            { label: 'Best Pull', value: stats.bestPull > 0 ? `$${stats.bestPull}` : '—', color: 'text-rose-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Mode Selection */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Choose Your Race</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setIsDaily(true)}
              className={`p-4 rounded-xl border text-left transition-all ${isDaily ? 'bg-emerald-950/40 border-emerald-600 ring-1 ring-emerald-500/30' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}
            >
              <p className="text-white font-bold">{'\ud83d\udcc5'} Daily Race</p>
              <p className="text-gray-400 text-sm mt-1">Same cards for everyone today — compare with friends!</p>
            </button>
            <button
              onClick={() => setIsDaily(false)}
              className={`p-4 rounded-xl border text-left transition-all ${!isDaily ? 'bg-purple-950/40 border-purple-600 ring-1 ring-purple-500/30' : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}`}
            >
              <p className="text-white font-bold">{'\ud83c\udfb2'} Random Race</p>
              <p className="text-gray-400 text-sm mt-1">Fresh cards every time — unlimited races!</p>
            </button>
          </div>

          {/* Sport Filter */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Filter by sport:</p>
            <div className="flex flex-wrap gap-2">
              {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sportFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                >
                  {s === 'all' ? 'All Sports' : `${SPORT_ICONS[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Racers Preview */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Your opponents:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {AI_RACERS.map(ai => (
                <div key={ai.name} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center gap-3">
                  <span className="text-2xl">{ai.avatar}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{ai.name}</p>
                    <p className="text-gray-500 text-xs">{ai.style}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startRace}
            disabled={validCards.length < CARDS_PER_RACER * 4}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            {'\ud83c\udfc1'} Start Race!
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-3">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { step: '1', title: 'Choose your race', desc: 'Daily (same for everyone) or Random (unlimited)' },
              { step: '2', title: 'Race starts', desc: '4 racers each open a 5-card pack simultaneously' },
              { step: '3', title: 'Cards revealed', desc: 'Watch cards flip one by one with live commentary' },
              { step: '4', title: 'Winner declared', desc: 'Highest total pack value takes the podium!' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">{s.step}</span>
                <div>
                  <p className="text-white font-medium">{s.title}</p>
                  <p className="text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- RACING / DONE ---
  const sorted = [...racers].sort((a, b) => b.total - a.total);
  const placement = getPlacement();
  const isComplete = mode === 'done';

  return (
    <div className="space-y-6">
      {/* Race Status Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <span className="text-2xl">{placement.rank === 1 ? '\ud83c\udfc6' : placement.rank === 2 ? '\ud83e\udd48' : placement.rank === 3 ? '\ud83e\udd49' : '\ud83d\udcaa'}</span>
            ) : (
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            )}
            <div>
              <p className="text-white font-bold">
                {isComplete ? `Race Complete \u2014 ${placement.label}!` : `Card ${Math.min(revealIndex + 1, CARDS_PER_RACER)} of ${CARDS_PER_RACER}`}
              </p>
              <p className="text-gray-500 text-xs">
                {isComplete ? `Your total: $${racers[0]?.total || 0}` : 'Cards revealing...'}
              </p>
            </div>
          </div>
          {isComplete && (
            <div className="flex gap-2">
              <button onClick={shareResults} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Copy Results
              </button>
              <button onClick={() => setMode('menu')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Race Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Race Grid — 4 racers side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(isComplete ? sorted : racers).map((racer, ri) => {
          const isYou = racer.name === 'You';
          const rank = isComplete ? ri + 1 : 0;
          return (
            <div
              key={racer.name}
              className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${
                isComplete && rank === 1 ? 'border-amber-500/60 ring-1 ring-amber-500/20' :
                isYou && !isComplete ? 'border-emerald-600/40' : 'border-gray-800'
              }`}
            >
              {/* Racer Header */}
              <div className={`p-3 border-b ${isComplete && rank === 1 ? 'bg-amber-950/30 border-amber-800/30' : isYou ? 'bg-emerald-950/20 border-gray-800' : 'bg-gray-800/30 border-gray-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isComplete && rank <= 3 && (
                      <span className="text-lg">{rank === 1 ? '\ud83e\udd47' : rank === 2 ? '\ud83e\udd48' : '\ud83e\udd49'}</span>
                    )}
                    <span className="text-lg">{racer.avatar}</span>
                    <span className={`font-bold text-sm ${isYou ? 'text-emerald-400' : 'text-white'}`}>{racer.name}</span>
                  </div>
                  <span className={`font-black text-lg ${isComplete && rank === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ${racer.pulls.slice(0, revealIndex + 1).reduce((sum, p) => sum + p.value, 0)}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-1.5">
                {racer.pulls.map((pull, ci) => {
                  const isRevealed = ci <= revealIndex;
                  const isJustRevealed = ci === revealIndex;
                  const isHit = pull.value >= 50;
                  const isBigHit = pull.value >= 200;

                  return (
                    <div
                      key={ci}
                      className={`rounded-lg p-2 border transition-all duration-500 ${
                        !isRevealed
                          ? 'bg-gray-800/40 border-gray-700/30'
                          : isBigHit
                          ? 'bg-amber-950/40 border-amber-700/50'
                          : isHit
                          ? 'bg-emerald-950/30 border-emerald-800/40'
                          : `${SPORT_BG[pull.sport] || 'bg-gray-800/40 border-gray-700/40'}`
                      } ${isJustRevealed && !isComplete ? 'scale-[1.02] ring-1 ring-emerald-500/30' : ''}`}
                    >
                      {isRevealed ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">{SPORT_ICONS[pull.sport] || ''}</span>
                              <Link href={`/sports/${pull.slug}`} className="text-white text-xs font-medium truncate hover:text-emerald-400 transition-colors">
                                {pull.player}
                              </Link>
                            </div>
                            <p className="text-gray-500 text-[10px] truncate">{pull.name.split(' ').slice(0, 4).join(' ')}</p>
                          </div>
                          <span className={`text-xs font-bold shrink-0 ${
                            isBigHit ? 'text-amber-400' : isHit ? 'text-emerald-400' : SPORT_COLORS[pull.sport] || 'text-gray-400'
                          }`}>
                            {isBigHit && '\ud83d\udd25'}{isHit && !isBigHit && '\u2b50'}${pull.value}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-1">
                          <span className="text-gray-600 text-xs">{'\ud83c\udccf'} Card {ci + 1}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Commentary */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          {'\ud83c\udfa4'} Live Commentary
          {!isComplete && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
        </h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {[...commentary].reverse().map((c, i) => (
            <p key={i} className={`text-sm ${i === 0 ? 'text-white' : 'text-gray-500'}`}>{c}</p>
          ))}
        </div>
      </div>

      {/* Final Standings */}
      {isComplete && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">{'\ud83c\udfc6'} Final Standings</h3>
          <div className="space-y-3">
            {sorted.map((racer, i) => {
              const isYou = racer.name === 'You';
              const best = racer.pulls.reduce((best, p) => p.value > best.value ? p : best, racer.pulls[0]);
              return (
                <div key={racer.name} className={`flex items-center gap-4 p-3 rounded-xl border ${
                  i === 0 ? 'bg-amber-950/20 border-amber-800/40' :
                  isYou ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-gray-800/30 border-gray-700/40'
                }`}>
                  <span className="text-2xl w-8 text-center">{i === 0 ? '\ud83e\udd47' : i === 1 ? '\ud83e\udd48' : i === 2 ? '\ud83e\udd49' : '4\ufe0f\u20e3'}</span>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">{racer.avatar}</span>
                    <div className="min-w-0">
                      <p className={`font-bold text-sm ${isYou ? 'text-emerald-400' : 'text-white'}`}>{racer.name}</p>
                      <p className="text-gray-500 text-xs truncate">Best: {best.player} (${best.value})</p>
                    </div>
                  </div>
                  <span className={`font-black text-xl ${i === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>${racer.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Links */}
      {isComplete && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/packs', label: 'Open Real Packs', icon: '\ud83d\udce6' },
            { href: '/live-rip-feed', label: 'Live Rip Feed', icon: '\ud83c\udfa5' },
            { href: '/card-tycoon', label: 'Card Tycoon', icon: '\ud83d\udcb0' },
            { href: '/pack-battle', label: 'Pack Battle', icon: '\u2694\ufe0f' },
            { href: '/card-battle', label: 'Card Battles', icon: '\ud83d\udca5' },
            { href: '/fortune-wheel', label: 'Fortune Wheel', icon: '\ud83c\udfa1' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="bg-gray-900 border border-gray-800 hover:border-emerald-600/40 rounded-xl p-3 text-center transition-all group">
              <span className="text-xl">{l.icon}</span>
              <p className="text-white text-xs font-medium mt-1 group-hover:text-emerald-400 transition-colors">{l.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
