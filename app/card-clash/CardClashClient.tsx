'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function parseValue(est: string): number {
  const m = est.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) || 5 : 5;
}

function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

/* Daily seed for consistent daily puzzles */
function dayHash(): number {
  const d = new Date();
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 2147483647;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/* AI personality types */
type AIType = 'aggressive' | 'strategic' | 'balanced';

const AI_PROFILES: Record<AIType, { name: string; emoji: string; desc: string }> = {
  aggressive: { name: 'Max Value', emoji: '🦈', desc: 'Always grabs the highest value card' },
  strategic: { name: 'Deny King', emoji: '🧠', desc: 'Tries to deny your best picks' },
  balanced: { name: 'Steady Eddie', emoji: '⚖️', desc: 'Mixes value grabs with denial plays' },
};

type CardEntry = typeof sportsCards[0] & { _idx: number };

interface RoundState {
  pool: CardEntry[];
  yourPicks: CardEntry[];
  aiPicks: CardEntry[];
  turn: 'player' | 'ai';
  roundComplete: boolean;
}

interface GameState {
  rounds: RoundState[];
  currentRound: number;
  aiType: AIType;
  gameOver: boolean;
  yourWins: number;
  aiWins: number;
}

export default function CardClashClient() {
  const [game, setGame] = useState<GameState | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showShare, setShowShare] = useState(false);

  /* Load stats from localStorage */
  useEffect(() => {
    try {
      const s = localStorage.getItem('cv-clash-streak');
      const b = localStorage.getItem('cv-clash-best');
      if (s) setStreak(parseInt(s, 10) || 0);
      if (b) setBestStreak(parseInt(b, 10) || 0);
    } catch {}
  }, []);

  /* Generate round pool — 12 cards from DB */
  const generatePool = useCallback((seed: number): CardEntry[] => {
    const rand = seededRandom(seed);
    const all = sportsCards.map((c, i) => ({ ...c, _idx: i } as CardEntry));
    const shuffled = all.sort(() => rand() - 0.5);
    // Pick 12 cards with varied values
    return shuffled.slice(0, 12);
  }, []);

  /* Start new game */
  const startGame = useCallback(() => {
    const baseSeed = dayHash();
    const rand = seededRandom(baseSeed);
    const aiTypes: AIType[] = ['aggressive', 'strategic', 'balanced'];
    const aiType = aiTypes[Math.floor(rand() * 3)];

    const rounds: RoundState[] = [0, 1, 2].map(i => ({
      pool: generatePool(baseSeed + i * 1000),
      yourPicks: [],
      aiPicks: [],
      turn: 'player',
      roundComplete: false,
    }));

    setGame({
      rounds,
      currentRound: 0,
      aiType,
      gameOver: false,
      yourWins: 0,
      aiWins: 0,
    });
    setShowShare(false);
  }, [generatePool]);

  /* AI pick logic */
  const aiPick = useCallback((pool: CardEntry[], aiType: AIType, yourPicks: CardEntry[]): CardEntry => {
    const remaining = pool.sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));

    if (aiType === 'aggressive') {
      // Always grab highest value
      return remaining[0];
    } else if (aiType === 'strategic') {
      // Try to deny: if player has been picking from a sport, grab remaining cards in that sport
      const yourSports: Record<string, number> = {};
      yourPicks.forEach(c => {
        const s = c.sport || 'unknown';
        yourSports[s] = (yourSports[s] || 0) + parseValue(c.estimatedValueRaw);
      });
      const topSport = Object.entries(yourSports).sort((a, b) => b[1] - a[1])[0];
      if (topSport) {
        const deny = remaining.find(c => c.sport === topSport[0]);
        if (deny && parseValue(deny.estimatedValueRaw) > parseValue(remaining[0].estimatedValueRaw) * 0.5) {
          return deny;
        }
      }
      return remaining[0]; // fallback to highest
    } else {
      // Balanced: 60% highest value, 40% deny
      const rand = seededRandom(Date.now());
      if (rand() < 0.6) return remaining[0];
      // Deny: pick the card closest in sport to player's best picks
      if (yourPicks.length > 0) {
        const lastSport = yourPicks[yourPicks.length - 1].sport;
        const deny = remaining.find(c => c.sport === lastSport);
        if (deny) return deny;
      }
      return remaining[0];
    }
  }, []);

  /* Player picks a card */
  const pickCard = useCallback((card: CardEntry) => {
    if (!game || game.gameOver) return;
    const round = game.rounds[game.currentRound];
    if (round.turn !== 'player' || round.roundComplete) return;

    // Player picks
    const newPool = round.pool.filter(c => c._idx !== card._idx);
    const newYourPicks = [...round.yourPicks, card];

    // AI picks immediately
    const aiCard = aiPick(newPool, game.aiType, newYourPicks);
    const finalPool = newPool.filter(c => c._idx !== aiCard._idx);
    const newAiPicks = [...round.aiPicks, aiCard];

    const roundComplete = newYourPicks.length >= 6;

    const updatedRound: RoundState = {
      pool: finalPool,
      yourPicks: newYourPicks,
      aiPicks: newAiPicks,
      turn: 'player',
      roundComplete,
    };

    const updatedRounds = [...game.rounds];
    updatedRounds[game.currentRound] = updatedRound;

    // Check if round is complete
    if (roundComplete) {
      const yourTotal = newYourPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
      const aiTotal = newAiPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
      const yourWins = game.yourWins + (yourTotal > aiTotal ? 1 : 0);
      const aiWins = game.aiWins + (aiTotal > yourTotal ? 1 : 0);

      // Check if game is over (best of 3)
      const gameOver = yourWins >= 2 || aiWins >= 2 || game.currentRound >= 2;

      if (gameOver) {
        // Update streaks
        const won = yourWins > aiWins;
        const newStreak = won ? streak + 1 : 0;
        const newBest = Math.max(bestStreak, newStreak);
        setStreak(newStreak);
        setBestStreak(newBest);
        try {
          localStorage.setItem('cv-clash-streak', String(newStreak));
          localStorage.setItem('cv-clash-best', String(newBest));
        } catch {}

        setGame({
          ...game,
          rounds: updatedRounds,
          yourWins,
          aiWins,
          gameOver: true,
        });
      } else {
        setGame({
          ...game,
          rounds: updatedRounds,
          currentRound: game.currentRound + 1,
          yourWins,
          aiWins,
        });
      }
    } else {
      setGame({
        ...game,
        rounds: updatedRounds,
      });
    }
  }, [game, aiPick, streak, bestStreak]);

  /* Share text */
  const shareText = useMemo(() => {
    if (!game || !game.gameOver) return '';
    const won = game.yourWins > game.aiWins;
    const rounds = game.rounds.map((r, i) => {
      if (r.yourPicks.length === 0) return '';
      const y = r.yourPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
      const a = r.aiPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
      return `R${i + 1}: ${y > a ? '✅' : '❌'} ${fmt(y)} vs ${fmt(a)}`;
    }).filter(Boolean).join('\n');
    return `Card Clash ${new Date().toLocaleDateString()}\n${won ? '🏆 Won' : '💀 Lost'} ${game.yourWins}-${game.aiWins} vs ${AI_PROFILES[game.aiType].emoji} ${AI_PROFILES[game.aiType].name}\n${rounds}\n🃏 cardvault-two.vercel.app/card-clash`;
  }, [game]);

  /* Current round data */
  const currentRound = game ? game.rounds[game.currentRound] : null;

  return (
    <div className="space-y-6">
      {/* Pre-game */}
      {!game && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Card Clash</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            12 cards laid out. You and an AI opponent alternate picks. 6 cards each. Highest total value wins the round. Best of 3 takes the match.
          </p>
          <button
            onClick={startGame}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg transition-colors"
          >
            Start Match
          </button>

          {bestStreak > 0 && (
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div>
                <div className="text-gray-500">Current Streak</div>
                <div className="text-white font-bold text-xl">{streak}</div>
              </div>
              <div>
                <div className="text-gray-500">Best Streak</div>
                <div className="text-emerald-400 font-bold text-xl">{bestStreak}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active game */}
      {game && !game.gameOver && currentRound && (
        <>
          {/* Scoreboard */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-gray-500 text-xs">You</div>
                <div className="text-white font-bold text-2xl">{game.yourWins}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs">Round {game.currentRound + 1}/3</div>
                <div className="text-gray-400 text-sm">Pick {currentRound.yourPicks.length + 1}/6</div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs">{AI_PROFILES[game.aiType].emoji} {AI_PROFILES[game.aiType].name}</div>
                <div className="text-white font-bold text-2xl">{game.aiWins}</div>
              </div>
            </div>
          </div>

          {/* Card pool */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-3">Pick a Card</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentRound.pool.map(card => (
                <button
                  key={card._idx}
                  onClick={() => pickCard(card)}
                  className="text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-600 rounded-xl transition-all group"
                >
                  <div className="text-white text-sm font-semibold truncate group-hover:text-emerald-400">{card.player}</div>
                  <div className="text-gray-500 text-xs truncate">{card.name}</div>
                  <div className="text-emerald-400 font-bold text-sm mt-1">{card.estimatedValueRaw}</div>
                  <div className="text-gray-600 text-xs mt-0.5">{card.sport} &middot; {card.year}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current picks */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl p-4">
              <h4 className="text-emerald-400 font-bold text-sm mb-2">Your Picks ({currentRound.yourPicks.length}/6)</h4>
              <div className="space-y-1.5">
                {currentRound.yourPicks.map((c, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white truncate">{c.player}</span>
                    <span className="text-emerald-400 ml-2 shrink-0">{c.estimatedValueRaw}</span>
                  </div>
                ))}
              </div>
              {currentRound.yourPicks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-800 text-sm">
                  <span className="text-gray-500">Total:</span>
                  <span className="text-emerald-400 font-bold ml-2">
                    {fmt(currentRound.yourPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0))}
                  </span>
                </div>
              )}
            </div>
            <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-4">
              <h4 className="text-red-400 font-bold text-sm mb-2">{AI_PROFILES[game.aiType].emoji} AI Picks ({currentRound.aiPicks.length}/6)</h4>
              <div className="space-y-1.5">
                {currentRound.aiPicks.map((c, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white truncate">{c.player}</span>
                    <span className="text-red-400 ml-2 shrink-0">{c.estimatedValueRaw}</span>
                  </div>
                ))}
              </div>
              {currentRound.aiPicks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-800 text-sm">
                  <span className="text-gray-500">Total:</span>
                  <span className="text-red-400 font-bold ml-2">
                    {fmt(currentRound.aiPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Game over */}
      {game && game.gameOver && (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">{game.yourWins > game.aiWins ? '🏆' : '💀'}</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {game.yourWins > game.aiWins ? 'You Win!' : game.yourWins === game.aiWins ? 'Draw!' : 'You Lose!'}
            </h2>
            <div className="text-4xl font-bold text-white mb-4">{game.yourWins} — {game.aiWins}</div>
            <p className="text-gray-400 mb-2">
              vs {AI_PROFILES[game.aiType].emoji} {AI_PROFILES[game.aiType].name} — {AI_PROFILES[game.aiType].desc}
            </p>

            {/* Round results */}
            <div className="flex justify-center gap-4 my-6">
              {game.rounds.map((round, i) => {
                if (round.yourPicks.length === 0) return null;
                const yourTotal = round.yourPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
                const aiTotal = round.aiPicks.reduce((s, c) => s + parseValue(c.estimatedValueRaw), 0);
                const won = yourTotal > aiTotal;
                return (
                  <div key={i} className={`px-4 py-3 rounded-xl border ${won ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-red-950/40 border-red-800/50'}`}>
                    <div className="text-gray-500 text-xs">Round {i + 1}</div>
                    <div className={`font-bold ${won ? 'text-emerald-400' : 'text-red-400'}`}>{won ? 'W' : 'L'}</div>
                    <div className="text-white text-sm">{fmt(yourTotal)} vs {fmt(aiTotal)}</div>
                  </div>
                );
              })}
            </div>

            {/* Streak */}
            <div className="flex items-center justify-center gap-6 mb-6 text-sm">
              <div>
                <div className="text-gray-500">Streak</div>
                <div className="text-white font-bold text-xl">{streak}</div>
              </div>
              <div>
                <div className="text-gray-500">Best</div>
                <div className="text-emerald-400 font-bold text-xl">{bestStreak}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={startGame}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
              >
                Share Results
              </button>
            </div>

            {showShare && (
              <div className="mt-4 bg-gray-800 rounded-xl p-4 text-left max-w-sm mx-auto">
                <pre className="text-gray-300 text-xs whitespace-pre-wrap font-mono">{shareText}</pre>
                <button
                  onClick={() => { navigator.clipboard?.writeText(shareText); }}
                  className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
                >
                  Copy to clipboard
                </button>
              </div>
            )}
          </div>

          {/* Related */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-3">More Games</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/collection-draft', label: 'Collection Draft' },
                { href: '/card-battle', label: 'Card Battles' },
                { href: '/card-roulette', label: 'Card Roulette' },
                { href: '/card-stack', label: 'Card Stack Challenge' },
                { href: '/card-streak', label: 'Card Streak' },
                { href: '/card-detective', label: 'Card Detective' },
                { href: '/market-tycoon', label: 'Market Tycoon' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
