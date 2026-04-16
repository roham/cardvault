'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function dateHash(d: Date): number {
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed || 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

/* ── types ───────────────────────────────────────────────────────── */

interface GameCard {
  name: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  slug: string;
  points: number; // 1-11 mapped from value
  isAce: boolean;
}

interface HandState {
  cards: GameCard[];
  total: number;
  softAce: boolean; // has an ace counted as 11
}

interface Stats {
  played: number;
  won: number;
  lost: number;
  pushed: number;
  blackjacks: number;
  bestStreak: number;
  bestBalance: number;
}

type Outcome = 'win' | 'lose' | 'push' | 'blackjack';

/* ── sport icons / colors ────────────────────────────────────────── */

const SPORT_COLORS: Record<string, string> = {
  baseball: 'border-red-500/60 bg-red-950/30',
  basketball: 'border-orange-500/60 bg-orange-950/30',
  football: 'border-green-500/60 bg-green-950/30',
  hockey: 'border-blue-500/60 bg-blue-950/30',
};

const SPORT_ICONS: Record<string, string> = {
  baseball: '\u26BE', basketball: '\uD83C\uDFC0', football: '\uD83C\uDFC8', hockey: '\uD83C\uDFD2',
};

/* ── point mapping ───────────────────────────────────────────────── */

function cardToPoints(value: number): { points: number; isAce: boolean } {
  if (value >= 500) return { points: 11, isAce: true }; // Ace (high-end cards)
  if (value >= 200) return { points: 10, isAce: false }; // Face card
  if (value >= 100) return { points: 9, isAce: false };
  if (value >= 75) return { points: 8, isAce: false };
  if (value >= 50) return { points: 7, isAce: false };
  if (value >= 35) return { points: 6, isAce: false };
  if (value >= 25) return { points: 5, isAce: false };
  if (value >= 15) return { points: 4, isAce: false };
  if (value >= 8) return { points: 3, isAce: false };
  return { points: 2, isAce: false }; // Budget cards
}

function calcTotal(cards: GameCard[]): { total: number; softAce: boolean } {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    total += c.points;
    if (c.isAce) aces++;
  }
  let softAce = false;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  if (cards.some(c => c.isAce) && total <= 21) {
    // check if an ace is still counted as 11
    const hardTotal = cards.reduce((s, c) => s + (c.isAce ? 1 : c.points), 0);
    softAce = total !== hardTotal;
  }
  return { total, softAce };
}

/* ── main component ──────────────────────────────────────────────── */

export default function CardBlackjackClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(50);
  const [hand, setHand] = useState(0); // current hand number (0-9)
  const [phase, setPhase] = useState<'betting' | 'playing' | 'dealer' | 'result' | 'gameover'>('betting');
  const [playerHand, setPlayerHand] = useState<HandState>({ cards: [], total: 0, softAce: false });
  const [dealerHand, setDealerHand] = useState<HandState>({ cards: [], total: 0, softAce: false });
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [message, setMessage] = useState('');
  const [streak, setStreak] = useState(0);
  const [handsPlayed, setHandsPlayed] = useState(0);
  const [results, setResults] = useState<Outcome[]>([]);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<Stats>({ played: 0, won: 0, lost: 0, pushed: 0, blackjacks: 0, bestStreak: 0, bestBalance: 1000 });
  const [doubledDown, setDoubledDown] = useState(false);

  // Build deck based on mode
  const deck = useMemo(() => {
    const allCards = sportsCards
      .filter(c => (c.sport as string) !== 'pokemon')
      .map(c => {
        const value = parseValue(c.estimatedValueRaw || '$0');
        const { points, isAce } = cardToPoints(value);
        return {
          name: c.name,
          player: c.player,
          sport: c.sport as string,
          year: c.year,
          value,
          slug: c.slug,
          points,
          isAce,
        };
      })
      .filter(c => c.value > 0);

    const seed = mode === 'daily' ? dateHash(new Date()) : Date.now();
    const rng = seededRng(seed);
    return shuffle(allCards, rng);
  }, [mode]);

  const [deckIndex, setDeckIndex] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem('cv-blackjack-stats');
    if (saved) {
      try { setStats(JSON.parse(saved)); } catch { /* ignore */ }
    }
    // Check daily completion
    if (mode === 'daily') {
      const today = new Date().toISOString().slice(0, 10);
      const lastPlayed = localStorage.getItem('cv-blackjack-daily');
      if (lastPlayed === today) {
        // Already played today — show results
        const savedResults = localStorage.getItem('cv-blackjack-daily-results');
        if (savedResults) {
          try {
            const r = JSON.parse(savedResults);
            setResults(r.results || []);
            setBalance(r.balance || 0);
            setPhase('gameover');
            setHandsPlayed(10);
          } catch { /* ignore */ }
        }
      }
    }
  }, [mounted, mode]);

  const drawCard = useCallback((): GameCard => {
    const card = deck[deckIndex % deck.length];
    setDeckIndex(prev => prev + 1);
    return card;
  }, [deck, deckIndex]);

  const deal = useCallback(() => {
    if (balance < bet) {
      setMessage('Not enough chips! Lower your bet.');
      return;
    }

    const idx = deckIndex;
    const p1 = deck[idx % deck.length];
    const d1 = deck[(idx + 1) % deck.length];
    const p2 = deck[(idx + 2) % deck.length];
    const d2 = deck[(idx + 3) % deck.length];
    setDeckIndex(idx + 4);

    const pCards = [p1, p2];
    const dCards = [d1, d2];
    const pTotal = calcTotal(pCards);
    const dTotal = calcTotal(dCards);

    setPlayerHand({ cards: pCards, ...pTotal });
    setDealerHand({ cards: dCards, ...dTotal });
    setDealerRevealed(false);
    setOutcome(null);
    setMessage('');
    setDoubledDown(false);

    // Check for natural blackjack
    if (pTotal.total === 21) {
      setDealerRevealed(true);
      if (dTotal.total === 21) {
        endHand(pCards, dCards, 'push');
      } else {
        endHand(pCards, dCards, 'blackjack');
      }
    } else {
      setPhase('playing');
    }
  }, [deck, deckIndex, balance, bet]);

  const endHand = useCallback((pCards: GameCard[], dCards: GameCard[], result: Outcome) => {
    setDealerRevealed(true);
    setOutcome(result);

    let payout = 0;
    const actualBet = doubledDown ? bet * 2 : bet;
    switch (result) {
      case 'blackjack':
        payout = Math.floor(actualBet * 1.5);
        setMessage(`Blackjack! +$${payout}`);
        break;
      case 'win':
        payout = actualBet;
        setMessage(`You win! +$${actualBet}`);
        break;
      case 'push':
        payout = 0;
        setMessage('Push — bet returned');
        break;
      case 'lose':
        payout = -actualBet;
        setMessage(`Dealer wins. -$${actualBet}`);
        break;
    }

    const newBalance = balance + payout;
    setBalance(newBalance);
    setHandsPlayed(prev => prev + 1);
    setResults(prev => [...prev, result]);
    const newStreak = result === 'win' || result === 'blackjack' ? streak + 1 : 0;
    setStreak(newStreak);

    // Update stats
    setStats(prev => {
      const updated: Stats = {
        played: prev.played + 1,
        won: prev.won + (result === 'win' ? 1 : 0),
        lost: prev.lost + (result === 'lose' ? 1 : 0),
        pushed: prev.pushed + (result === 'push' ? 1 : 0),
        blackjacks: prev.blackjacks + (result === 'blackjack' ? 1 : 0),
        bestStreak: Math.max(prev.bestStreak, newStreak),
        bestBalance: Math.max(prev.bestBalance, newBalance),
      };
      localStorage.setItem('cv-blackjack-stats', JSON.stringify(updated));
      return updated;
    });

    const newHandNum = hand + 1;
    if (newHandNum >= 10 || newBalance <= 0) {
      setPhase('gameover');
      // Save daily completion
      if (mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem('cv-blackjack-daily', today);
        const allResults = [...results, result];
        localStorage.setItem('cv-blackjack-daily-results', JSON.stringify({ results: allResults, balance: newBalance }));
      }
    } else {
      setHand(newHandNum);
      setPhase('result');
    }
  }, [balance, bet, hand, streak, results, mode, doubledDown]);

  const hit = useCallback(() => {
    const newCard = deck[deckIndex % deck.length];
    setDeckIndex(prev => prev + 1);
    const newCards = [...playerHand.cards, newCard];
    const totals = calcTotal(newCards);
    setPlayerHand({ cards: newCards, ...totals });

    if (totals.total > 21) {
      endHand(newCards, dealerHand.cards, 'lose');
    } else if (totals.total === 21) {
      // Auto-stand on 21
      runDealer(newCards);
    }
  }, [deck, deckIndex, playerHand, dealerHand, endHand]);

  const stand = useCallback(() => {
    runDealer(playerHand.cards);
  }, [playerHand]);

  const doubleDown = useCallback(() => {
    if (balance < bet) return; // can't afford double
    setDoubledDown(true);
    const newCard = deck[deckIndex % deck.length];
    setDeckIndex(prev => prev + 1);
    const newCards = [...playerHand.cards, newCard];
    const totals = calcTotal(newCards);
    setPlayerHand({ cards: newCards, ...totals });

    if (totals.total > 21) {
      endHand(newCards, dealerHand.cards, 'lose');
    } else {
      runDealer(newCards);
    }
  }, [deck, deckIndex, playerHand, dealerHand, balance, bet, endHand]);

  const runDealer = useCallback((pCards: GameCard[]) => {
    setPhase('dealer');
    setDealerRevealed(true);

    // Dealer hits until 17+
    let dCards = [...dealerHand.cards];
    let dIdx = deckIndex;
    let dTotal = calcTotal(dCards);

    while (dTotal.total < 17) {
      const card = deck[dIdx % deck.length];
      dIdx++;
      dCards = [...dCards, card];
      dTotal = calcTotal(dCards);
    }

    setDeckIndex(dIdx);
    setDealerHand({ cards: dCards, ...dTotal });

    const pTotal = calcTotal(pCards);

    if (dTotal.total > 21) {
      endHand(pCards, dCards, 'win');
    } else if (pTotal.total > dTotal.total) {
      endHand(pCards, dCards, 'win');
    } else if (pTotal.total < dTotal.total) {
      endHand(pCards, dCards, 'lose');
    } else {
      endHand(pCards, dCards, 'push');
    }
  }, [dealerHand, deck, deckIndex, endHand]);

  const startNewGame = useCallback(() => {
    setBalance(1000);
    setBet(50);
    setHand(0);
    setPhase('betting');
    setPlayerHand({ cards: [], total: 0, softAce: false });
    setDealerHand({ cards: [], total: 0, softAce: false });
    setOutcome(null);
    setMessage('');
    setStreak(0);
    setHandsPlayed(0);
    setResults([]);
    setDoubledDown(false);
    if (mode === 'random') {
      setDeckIndex(0);
    }
  }, [mode]);

  const shareResults = useCallback(() => {
    const wins = results.filter(r => r === 'win' || r === 'blackjack').length;
    const emojiLine = results.map(r => {
      switch (r) {
        case 'blackjack': return '\uD83C\uDFB0';
        case 'win': return '\u2705';
        case 'push': return '\u27A1\uFE0F';
        case 'lose': return '\u274C';
        default: return '\u2B1C';
      }
    }).join('');
    const text = `Card Blackjack ${mode === 'daily' ? '(Daily)' : ''}\n${emojiLine}\n${wins}/${results.length} won | $${balance.toLocaleString()} final\nhttps://cardvault-two.vercel.app/card-blackjack`;
    navigator.clipboard.writeText(text);
    setMessage('Copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  }, [results, balance, mode]);

  const grade = useMemo(() => {
    if (balance >= 2000) return { letter: 'A+', color: 'text-yellow-400', label: 'Card Shark' };
    if (balance >= 1500) return { letter: 'A', color: 'text-green-400', label: 'High Roller' };
    if (balance >= 1200) return { letter: 'B+', color: 'text-green-300', label: 'Smart Player' };
    if (balance >= 1000) return { letter: 'B', color: 'text-blue-400', label: 'Solid' };
    if (balance >= 750) return { letter: 'C', color: 'text-amber-400', label: 'Break Even' };
    if (balance >= 500) return { letter: 'D', color: 'text-orange-400', label: 'Tough Night' };
    return { letter: 'F', color: 'text-red-400', label: 'Busted' };
  }, [balance]);

  if (!mounted) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  /* ── render card ────────────────────────────────────────────────── */
  const renderCard = (card: GameCard, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-lg border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
          <span className="text-3xl">?</span>
        </div>
      );
    }
    const sportColor = SPORT_COLORS[card.sport] || 'border-gray-600 bg-gray-800';
    return (
      <div className={`w-24 sm:w-28 h-32 sm:h-36 rounded-lg border-2 ${sportColor} p-2 flex flex-col justify-between`}>
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-white bg-gray-900/70 px-1.5 py-0.5 rounded">
            {card.points}{card.isAce ? '/1' : ''}
          </span>
          <span className="text-sm">{SPORT_ICONS[card.sport] || ''}</span>
        </div>
        <div className="text-center flex-1 flex flex-col justify-center">
          <p className="text-xs font-semibold text-white leading-tight">{card.player}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{card.year}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-green-400">${card.value.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  /* ── game over screen ──────────────────────────────────────────── */
  if (phase === 'gameover') {
    const wins = results.filter(r => r === 'win' || r === 'blackjack').length;
    const bjs = results.filter(r => r === 'blackjack').length;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Card Blackjack</h1>
          <div className="flex gap-2">
            <button onClick={() => { setMode('daily'); startNewGame(); }} className={`px-3 py-1 text-sm rounded-full ${mode === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Daily</button>
            <button onClick={() => { setMode('random'); startNewGame(); }} className={`px-3 py-1 text-sm rounded-full ${mode === 'random' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Random</button>
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <p className={`text-5xl font-black ${grade.color}`}>{grade.letter}</p>
          <p className="text-gray-400 mt-1">{grade.label}</p>
          <p className="text-3xl font-bold text-white mt-3">${balance.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Final balance (started $1,000)</p>

          <div className="flex justify-center gap-1 mt-4">
            {results.map((r, i) => (
              <span key={i} className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                r === 'blackjack' ? 'bg-yellow-600 text-yellow-100' :
                r === 'win' ? 'bg-green-600 text-green-100' :
                r === 'push' ? 'bg-gray-600 text-gray-200' :
                'bg-red-600 text-red-100'
              }`}>
                {r === 'blackjack' ? 'BJ' : r === 'win' ? 'W' : r === 'push' ? 'P' : 'L'}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
            <div><p className="text-green-400 font-bold">{wins}</p><p className="text-gray-500">Won</p></div>
            <div><p className="text-yellow-400 font-bold">{bjs}</p><p className="text-gray-500">Blackjacks</p></div>
            <div><p className="text-gray-300 font-bold">{results.length}</p><p className="text-gray-500">Hands</p></div>
          </div>

          <div className="flex gap-3 mt-6 justify-center">
            <button onClick={shareResults} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">Share Results</button>
            {mode === 'random' && (
              <button onClick={startNewGame} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium">Play Again</button>
            )}
          </div>
          {message && <p className="text-green-400 text-sm mt-2">{message}</p>}
        </div>

        {/* Lifetime stats */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mt-4">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Lifetime Stats</h3>
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div><p className="text-white font-bold">{stats.played}</p><p className="text-gray-500">Played</p></div>
            <div><p className="text-green-400 font-bold">{stats.won + stats.blackjacks}</p><p className="text-gray-500">Won</p></div>
            <div><p className="text-yellow-400 font-bold">{stats.blackjacks}</p><p className="text-gray-500">BJs</p></div>
            <div><p className="text-amber-400 font-bold">${stats.bestBalance.toLocaleString()}</p><p className="text-gray-500">Best</p></div>
          </div>
        </div>

        {/* Related links */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/card-roulette', label: 'Card Roulette', icon: '\uD83C\uDFB0' },
            { href: '/card-tycoon', label: 'Card Tycoon', icon: '\uD83D\uDCB0' },
            { href: '/fortune-wheel', label: 'Fortune Wheel', icon: '\uD83C\uDFA1' },
            { href: '/card-dealer', label: 'Card Dealer', icon: '\uD83C\uDCCF' },
            { href: '/card-streak', label: 'Card Streak', icon: '\uD83D\uDD25' },
            { href: '/hot-potato', label: 'Hot Potato', icon: '\uD83E\uDD54' },
            { href: '/card-slots', label: 'Card Slots', icon: '\uD83C\uDF52' },
            { href: '/card-groups', label: 'Card Groups', icon: '\uD83D\uDD32' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="bg-gray-900/50 border border-gray-800 rounded-lg p-3 text-center hover:border-amber-600/50 transition-colors">
              <span className="text-lg">{l.icon}</span>
              <p className="text-xs text-gray-300 mt-1">{l.label}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  /* ── main game UI ──────────────────────────────────────────────── */
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Card Blackjack</h1>
        <div className="flex gap-2">
          <button onClick={() => { setMode('daily'); startNewGame(); }} className={`px-3 py-1 text-sm rounded-full ${mode === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Daily</button>
          <button onClick={() => { setMode('random'); startNewGame(); }} className={`px-3 py-1 text-sm rounded-full ${mode === 'random' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'}`}>Random</button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex justify-between items-center bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-2 mb-4 text-sm">
        <span className="text-amber-400 font-bold">${balance.toLocaleString()}</span>
        <span className="text-gray-400">Hand {Math.min(hand + 1, 10)}/10</span>
        <span className="text-gray-400">Streak: {streak}</span>
        <div className="flex gap-0.5">
          {results.map((r, i) => (
            <span key={i} className={`w-4 h-4 rounded-sm text-[9px] flex items-center justify-center font-bold ${
              r === 'blackjack' ? 'bg-yellow-600' : r === 'win' ? 'bg-green-600' : r === 'push' ? 'bg-gray-600' : 'bg-red-600'
            }`}>
              {r === 'blackjack' ? '\u2605' : r === 'win' ? '\u2713' : r === 'push' ? '=' : '\u2717'}
            </span>
          ))}
        </div>
      </div>

      {/* Betting phase */}
      {phase === 'betting' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
          <p className="text-lg text-gray-300 mb-4">Place your bet</p>
          <div className="flex gap-3 justify-center mb-4">
            {[25, 50, 100, 250].map(b => (
              <button
                key={b}
                onClick={() => setBet(b)}
                disabled={b > balance}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  bet === b ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                } ${b > balance ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                ${b}
              </button>
            ))}
          </div>
          <button
            onClick={deal}
            disabled={bet > balance}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Deal
          </button>
          {message && <p className="text-red-400 text-sm mt-2">{message}</p>}
        </div>
      )}

      {/* Playing / Dealer / Result phase */}
      {(phase === 'playing' || phase === 'dealer' || phase === 'result') && (
        <div className="space-y-6">
          {/* Dealer hand */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-400">DEALER</h3>
              <span className="text-sm font-bold text-white">
                {dealerRevealed ? calcTotal(dealerHand.cards).total : dealerHand.cards.length > 0 ? dealerHand.cards[0].points : '?'}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dealerHand.cards.map((c, i) => (
                <div key={i} className="flex-shrink-0">
                  {i === 1 && !dealerRevealed ? renderCard(c, true) : renderCard(c)}
                </div>
              ))}
            </div>
          </div>

          {/* Player hand */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-amber-400">YOUR HAND</h3>
              <span className={`text-sm font-bold ${playerHand.total > 21 ? 'text-red-400' : playerHand.total === 21 ? 'text-green-400' : 'text-white'}`}>
                {playerHand.total}{playerHand.softAce ? ' (soft)' : ''}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {playerHand.cards.map((c, i) => (
                <div key={i} className="flex-shrink-0">
                  {renderCard(c)}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {phase === 'playing' && (
            <div className="flex gap-3 justify-center">
              <button onClick={hit} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors">Hit</button>
              <button onClick={stand} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors">Stand</button>
              {playerHand.cards.length === 2 && balance >= bet && (
                <button onClick={doubleDown} className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-colors">Double</button>
              )}
            </div>
          )}

          {/* Result message */}
          {(phase === 'result' || (phase === 'dealer' && outcome)) && (
            <div className="text-center">
              <p className={`text-lg font-bold ${
                outcome === 'blackjack' ? 'text-yellow-400' :
                outcome === 'win' ? 'text-green-400' :
                outcome === 'push' ? 'text-gray-400' :
                'text-red-400'
              }`}>{message}</p>
              <button
                onClick={() => setPhase('betting')}
                className="mt-3 px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors"
              >
                Next Hand
              </button>
            </div>
          )}
        </div>
      )}

      {/* Point values guide */}
      <details className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <summary className="cursor-pointer text-sm font-bold text-gray-300 hover:text-white">How Card Values Work</summary>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="flex justify-between"><span>$500+ cards</span><span className="text-amber-400 font-bold">11/1 (Ace)</span></div>
          <div className="flex justify-between"><span>$200-$499</span><span className="text-white font-bold">10 pts</span></div>
          <div className="flex justify-between"><span>$100-$199</span><span className="text-white font-bold">9 pts</span></div>
          <div className="flex justify-between"><span>$75-$99</span><span className="text-white font-bold">8 pts</span></div>
          <div className="flex justify-between"><span>$50-$74</span><span className="text-white font-bold">7 pts</span></div>
          <div className="flex justify-between"><span>$35-$49</span><span className="text-white font-bold">6 pts</span></div>
          <div className="flex justify-between"><span>$25-$34</span><span className="text-white font-bold">5 pts</span></div>
          <div className="flex justify-between"><span>$15-$24</span><span className="text-white font-bold">4 pts</span></div>
          <div className="flex justify-between"><span>$8-$14</span><span className="text-white font-bold">3 pts</span></div>
          <div className="flex justify-between"><span>Under $8</span><span className="text-white font-bold">2 pts</span></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">Higher-value cards are worth more points, just like face cards in real blackjack. $500+ cards act as Aces (11 or 1).</p>
      </details>
    </div>
  );
}
