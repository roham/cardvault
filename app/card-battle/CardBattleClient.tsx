'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const STORAGE_KEY = 'cardvault-card-battle';

interface BattleStats {
  power: number;      // from card value
  experience: number; // years since release
  potential: number;  // rookie bonus
  clutch: number;     // random factor
  gradeMultiplier: number;
  total: number;
}

interface BattleRecord {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  log: BattleLogEntry[];
}

interface BattleLogEntry {
  playerCard: string;
  opponentCard: string;
  playerScore: number;
  opponentScore: number;
  result: 'win' | 'loss' | 'draw';
  timestamp: string;
}

type Grade = 'PSA 10' | 'PSA 9' | 'PSA 8' | 'PSA 7' | 'Raw';

const GRADE_MULTIPLIERS: Record<Grade, number> = {
  'PSA 10': 1.5,
  'PSA 9': 1.3,
  'PSA 8': 1.15,
  'PSA 7': 1.05,
  'Raw': 1.0,
};

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function calculateStats(card: SportsCard, grade: Grade): BattleStats {
  const value = parseValue(card.estimatedValueRaw);
  const currentYear = new Date().getFullYear();

  const power = Math.min(100, Math.floor(Math.log2(Math.max(1, value)) * 8));
  const experience = Math.min(50, currentYear - card.year);
  const potential = card.rookie ? 25 : 0;
  const clutch = Math.floor(Math.random() * 20) + 1;
  const gradeMultiplier = GRADE_MULTIPLIERS[grade];
  const total = Math.round((power + experience + potential + clutch) * gradeMultiplier);

  return { power, experience, potential, clutch, gradeMultiplier, total };
}

function getRecord(): BattleRecord {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* fresh */ }
  return { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, log: [] };
}

function saveRecord(record: BattleRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

type Phase = 'select' | 'battle' | 'result';

export default function CardBattleClient() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('select');
  const [record, setRecord] = useState<BattleRecord>({ wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, log: [] });
  const [playerCard, setPlayerCard] = useState<SportsCard | null>(null);
  const [opponentCard, setOpponentCard] = useState<SportsCard | null>(null);
  const [playerGrade, setPlayerGrade] = useState<Grade>('PSA 9');
  const [opponentGrade, setOpponentGrade] = useState<Grade>('PSA 9');
  const [playerStats, setPlayerStats] = useState<BattleStats | null>(null);
  const [opponentStats, setOpponentStats] = useState<BattleStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRecord(getRecord());
  }, []);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  const pickOpponent = useCallback(() => {
    const idx = Math.floor(Math.random() * sportsCards.length);
    return sportsCards[idx];
  }, []);

  const startBattle = useCallback((myCard: SportsCard) => {
    const opp = pickOpponent();
    // Assign random grades
    const grades: Grade[] = ['PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'Raw'];
    const pGrade = grades[Math.floor(Math.random() * grades.length)];
    const oGrade = grades[Math.floor(Math.random() * grades.length)];

    setPlayerCard(myCard);
    setOpponentCard(opp);
    setPlayerGrade(pGrade);
    setOpponentGrade(oGrade);
    setPlayerStats(null);
    setOpponentStats(null);
    setPhase('battle');

    // Reveal stats with delay
    setTimeout(() => {
      const ps = calculateStats(myCard, pGrade);
      const os = calculateStats(opp, oGrade);
      setPlayerStats(ps);
      setOpponentStats(os);

      // Determine result after stats reveal
      setTimeout(() => {
        const result: 'win' | 'loss' | 'draw' = ps.total > os.total ? 'win' : ps.total < os.total ? 'loss' : 'draw';

        setRecord(prev => {
          const updated = { ...prev };
          if (result === 'win') {
            updated.wins++;
            updated.streak++;
            updated.bestStreak = Math.max(updated.bestStreak, updated.streak);
          } else if (result === 'loss') {
            updated.losses++;
            updated.streak = 0;
          } else {
            updated.draws++;
          }
          updated.log = [{
            playerCard: myCard.slug,
            opponentCard: opp.slug,
            playerScore: ps.total,
            opponentScore: os.total,
            result,
            timestamp: new Date().toISOString(),
          }, ...updated.log].slice(0, 20);
          saveRecord(updated);
          return updated;
        });

        setPhase('result');
      }, 800);
    }, 1000);
  }, [pickOpponent]);

  const quickMatch = useCallback(() => {
    const myCard = sportsCards[Math.floor(Math.random() * sportsCards.length)];
    startBattle(myCard);
  }, [startBattle]);

  if (!mounted) {
    return <div className="h-96 bg-gray-800/30 rounded-xl animate-pulse" />;
  }

  const result = playerStats && opponentStats
    ? playerStats.total > opponentStats.total ? 'win' : playerStats.total < opponentStats.total ? 'loss' : 'draw'
    : null;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-xl p-4">
        <div className="flex gap-4">
          <div><p className="text-gray-500 text-xs">Wins</p><p className="text-emerald-400 font-bold text-lg">{record.wins}</p></div>
          <div><p className="text-gray-500 text-xs">Losses</p><p className="text-red-400 font-bold text-lg">{record.losses}</p></div>
          <div><p className="text-gray-500 text-xs">Draws</p><p className="text-gray-400 font-bold text-lg">{record.draws}</p></div>
        </div>
        <div className="hidden sm:block h-8 w-px bg-gray-800" />
        <div className="flex gap-4">
          <div><p className="text-gray-500 text-xs">Streak</p><p className="text-amber-400 font-bold text-lg">{record.streak}</p></div>
          <div><p className="text-gray-500 text-xs">Best</p><p className="text-purple-400 font-bold text-lg">{record.bestStreak}</p></div>
        </div>
        <button
          onClick={() => setShowLog(!showLog)}
          className="ml-auto text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          {showLog ? 'Hide Log' : 'Battle Log'}
        </button>
      </div>

      {/* Battle log */}
      {showLog && record.log.length > 0 && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Recent Battles</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {record.log.map((entry, i) => {
              const pc = sportsCards.find(c => c.slug === entry.playerCard);
              const oc = sportsCards.find(c => c.slug === entry.opponentCard);
              return (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`font-bold ${entry.result === 'win' ? 'text-emerald-400' : entry.result === 'loss' ? 'text-red-400' : 'text-gray-400'}`}>
                      {entry.result === 'win' ? 'W' : entry.result === 'loss' ? 'L' : 'D'}
                    </span>
                    <span className="text-gray-300 truncate">{pc?.player ?? '?'}</span>
                    <span className="text-gray-600">vs</span>
                    <span className="text-gray-400 truncate">{oc?.player ?? '?'}</span>
                  </div>
                  <span className="text-gray-500 font-mono shrink-0 ml-2">{entry.playerScore}-{entry.opponentScore}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SELECT PHASE */}
      {phase === 'select' && (
        <div className="space-y-4">
          <div className="text-center py-8">
            <h2 className="text-xl font-bold text-white mb-2">Choose Your Fighter</h2>
            <p className="text-gray-400 text-sm">Search for a card or hit Quick Match for a random battle</p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for a card (e.g., Michael Jordan, Tom Brady)..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-10 shadow-2xl">
                {searchResults.map(card => (
                  <button
                    key={card.slug}
                    onClick={() => { setSearchQuery(''); startBattle(card); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                  >
                    <span className="text-lg">{sportIcons[card.sport] ?? '🃏'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{card.player}</p>
                      <p className="text-gray-500 text-xs">{card.year} {card.set} · {card.estimatedValueRaw.split(' ')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={quickMatch}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors text-sm"
            >
              Quick Match — Random Cards
            </button>
          </div>
        </div>
      )}

      {/* BATTLE / RESULT PHASE */}
      {(phase === 'battle' || phase === 'result') && playerCard && opponentCard && (
        <div>
          {/* Result banner */}
          {phase === 'result' && result && (
            <div className={`text-center py-4 mb-6 rounded-xl border ${
              result === 'win' ? 'bg-emerald-950/40 border-emerald-800/50' :
              result === 'loss' ? 'bg-red-950/40 border-red-800/50' :
              'bg-gray-800/40 border-gray-700/50'
            }`}>
              <p className={`text-2xl font-black ${
                result === 'win' ? 'text-emerald-400' : result === 'loss' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {result === 'win' ? 'VICTORY!' : result === 'loss' ? 'DEFEAT' : 'DRAW'}
              </p>
              {record.streak > 1 && result === 'win' && (
                <p className="text-amber-400 text-sm mt-1">{record.streak} win streak!</p>
              )}
            </div>
          )}

          {/* Battle arena */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Player card */}
            <div className={`bg-gray-900/60 border rounded-xl p-5 ${
              phase === 'result' && result === 'win' ? 'border-emerald-600/50' : 'border-gray-800'
            }`}>
              <div className="text-center mb-4">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Your Card</p>
                <div className="text-3xl mb-2">{sportIcons[playerCard.sport] ?? '🃏'}</div>
                <Link href={`/sports/${playerCard.slug}`} className="text-white font-bold hover:text-emerald-400 transition-colors">{playerCard.player}</Link>
                <p className="text-gray-500 text-xs mt-0.5">{playerCard.year} {playerCard.set}</p>
                <p className="text-gray-400 text-xs">{playerCard.estimatedValueRaw.split(' ')[0]}</p>
                <span className="inline-block mt-1 text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-800/50">{playerGrade}</span>
              </div>

              {playerStats ? (
                <div className="space-y-2">
                  {[
                    { label: 'Power', value: playerStats.power, max: 100, color: 'bg-red-500' },
                    { label: 'Experience', value: playerStats.experience, max: 50, color: 'bg-blue-500' },
                    { label: 'Potential', value: playerStats.potential, max: 25, color: 'bg-amber-500' },
                    { label: 'Clutch', value: playerStats.clutch, max: 20, color: 'bg-purple-500' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-400">{stat.label}</span>
                        <span className="text-white font-mono">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full transition-all duration-700`} style={{ width: `${(stat.value / stat.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Grade Multiplier</span>
                    <span className="text-amber-400 text-xs font-bold">x{playerStats.gradeMultiplier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">TOTAL</span>
                    <span className="text-emerald-400 font-black text-xl">{playerStats.total}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-gray-600 border-t-emerald-400 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* VS divider (visible on mobile) */}
            <div className="sm:hidden flex items-center justify-center -my-2">
              <div className="w-12 h-12 bg-red-900/60 border border-red-700/50 rounded-full flex items-center justify-center">
                <span className="text-red-400 font-black text-sm">VS</span>
              </div>
            </div>

            {/* Opponent card */}
            <div className={`bg-gray-900/60 border rounded-xl p-5 ${
              phase === 'result' && result === 'loss' ? 'border-red-600/50' : 'border-gray-800'
            }`}>
              <div className="text-center mb-4">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Opponent</p>
                <div className="text-3xl mb-2">{sportIcons[opponentCard.sport] ?? '🃏'}</div>
                <Link href={`/sports/${opponentCard.slug}`} className="text-white font-bold hover:text-red-400 transition-colors">{opponentCard.player}</Link>
                <p className="text-gray-500 text-xs mt-0.5">{opponentCard.year} {opponentCard.set}</p>
                <p className="text-gray-400 text-xs">{opponentCard.estimatedValueRaw.split(' ')[0]}</p>
                <span className="inline-block mt-1 text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded border border-blue-800/50">{opponentGrade}</span>
              </div>

              {opponentStats ? (
                <div className="space-y-2">
                  {[
                    { label: 'Power', value: opponentStats.power, max: 100, color: 'bg-red-500' },
                    { label: 'Experience', value: opponentStats.experience, max: 50, color: 'bg-blue-500' },
                    { label: 'Potential', value: opponentStats.potential, max: 25, color: 'bg-amber-500' },
                    { label: 'Clutch', value: opponentStats.clutch, max: 20, color: 'bg-purple-500' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="text-gray-400">{stat.label}</span>
                        <span className="text-white font-mono">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full transition-all duration-700`} style={{ width: `${(stat.value / stat.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Grade Multiplier</span>
                    <span className="text-amber-400 text-xs font-bold">x{opponentStats.gradeMultiplier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-sm">TOTAL</span>
                    <span className="text-red-400 font-black text-xl">{opponentStats.total}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-gray-600 border-t-red-400 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {phase === 'result' && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setPhase('select'); setSearchQuery(''); }}
                className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium text-sm hover:bg-gray-700 transition-colors"
              >
                Choose New Card
              </button>
              <button
                onClick={quickMatch}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors"
              >
                Quick Rematch
              </button>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">Battle Stats Explained</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            { stat: 'Power', desc: 'Derived from card market value. A $10,000 card hits harder than a $10 common.', color: 'text-red-400' },
            { stat: 'Experience', desc: 'Years since the card was printed. A 1952 Topps has decades more experience than a 2024 Prizm.', color: 'text-blue-400' },
            { stat: 'Potential', desc: 'Rookie cards get a +25 bonus. Young talent comes with upside.', color: 'text-amber-400' },
            { stat: 'Clutch', desc: 'Random factor (1-20). Any card can get hot. This is what makes upsets possible.', color: 'text-purple-400' },
          ].map(s => (
            <div key={s.stat}>
              <p className={`font-bold ${s.color}`}>{s.stat}</p>
              <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-4">
          Grade multiplier: PSA 10 = 1.5x, PSA 9 = 1.3x, PSA 8 = 1.15x, PSA 7 = 1.05x, Raw = 1.0x. Total = (Power + Experience + Potential + Clutch) × Grade.
        </p>
      </div>
    </div>
  );
}
