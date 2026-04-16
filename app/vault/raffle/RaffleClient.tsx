'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Phase = 'browse' | 'drawing' | 'result';
type Tab = 'active' | 'history';

interface RaffleEntry {
  slug: string;
  name: string;
  player: string;
  sport: string;
  value: number;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  myTickets: number;
  participants: { name: string; tickets: number }[];
  winner: string | null;
  iWon: boolean;
  endTime: number;
}

interface RaffleStats {
  entered: number;
  ticketsBought: number;
  wins: number;
  biggestWin: number;
  totalSpent: number;
  totalWon: number;
}

interface HistoryEntry {
  cardName: string;
  cardValue: number;
  myTickets: number;
  totalTickets: number;
  won: boolean;
  date: string;
}

function parseValue(val: string): number {
  const m = val.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(',', '')) : 5;
}

function seededRandom(seed: number): () => number {
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

const PARTICIPANT_NAMES = [
  'CardKing99', 'RookieHunter', 'WaxBreaker', 'GrailChaser', 'PSA10Life',
  'FlipMaster', 'SetBuilder_Joe', 'VintageVibes', 'ModernMint', 'SlapShotCards',
  'HoopDreams', 'GridironGems', 'DiamondDealer', 'ProspectPaul', 'MintCondition',
  'Wax_Warrior', 'SlabCollector', 'RC_Hunter', 'CardShowKing', 'PC_Builder',
  'LCS_Regular', 'BreakAddict', 'HobbyVet55', 'NoviceNick', 'TradeBait',
];

function getGrade(winRate: number, wins: number): { letter: string; color: string } {
  if (wins >= 5 && winRate >= 0.3) return { letter: 'S', color: 'text-yellow-400' };
  if (wins >= 3 && winRate >= 0.25) return { letter: 'A', color: 'text-emerald-400' };
  if (wins >= 2 && winRate >= 0.15) return { letter: 'B', color: 'text-blue-400' };
  if (wins >= 1) return { letter: 'C', color: 'text-purple-400' };
  if (winRate > 0) return { letter: 'D', color: 'text-orange-400' };
  return { letter: 'F', color: 'text-red-400' };
}

export default function RaffleClient() {
  const [tab, setTab] = useState<Tab>('active');
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [phase, setPhase] = useState<Phase>('browse');
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleEntry | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [drawProgress, setDrawProgress] = useState(0);
  const [balance, setBalance] = useState(500);
  const [stats, setStats] = useState<RaffleStats>({ entered: 0, ticketsBought: 0, wins: 0, biggestWin: 0, totalSpent: 0, totalWon: 0 });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [enteredRaffles, setEnteredRaffles] = useState<Set<string>>(new Set());
  const [randomSeed, setRandomSeed] = useState(0);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-raffle-stats');
      if (saved) setStats(JSON.parse(saved));
      const savedBal = localStorage.getItem('cardvault-raffle-balance');
      if (savedBal) setBalance(parseFloat(savedBal));
      const savedHist = localStorage.getItem('cardvault-raffle-history');
      if (savedHist) setHistory(JSON.parse(savedHist));
      const savedEntered = localStorage.getItem('cardvault-raffle-entered');
      if (savedEntered) setEnteredRaffles(new Set(JSON.parse(savedEntered)));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cardvault-raffle-stats', JSON.stringify(stats));
      localStorage.setItem('cardvault-raffle-balance', balance.toString());
      localStorage.setItem('cardvault-raffle-history', JSON.stringify(history));
      localStorage.setItem('cardvault-raffle-entered', JSON.stringify([...enteredRaffles]));
    } catch {}
  }, [stats, balance, history, enteredRaffles]);

  const seed = mode === 'daily' ? dateHash() : (randomSeed || dateHash() + 777);

  // Generate 8 active raffles
  const raffles = useMemo(() => {
    const rng = seededRandom(seed);
    const filtered = sportsCards.filter(c => sportFilter === 'all' || c.sport === sportFilter);
    if (filtered.length < 20) return [];

    const selected: RaffleEntry[] = [];
    const used = new Set<number>();

    for (let i = 0; i < 8 && used.size < filtered.length; i++) {
      let idx: number;
      let attempts = 0;
      do {
        idx = Math.floor(rng() * filtered.length);
        attempts++;
      } while (used.has(idx) && attempts < 100);
      if (used.has(idx)) continue;
      used.add(idx);

      const card = filtered[idx];
      const value = parseValue(card.estimatedValueRaw);
      if (value < 2) { i--; continue; }

      // Ticket price: ~10-15% of card value, min $2, max $25
      const rawTicketPrice = Math.max(2, Math.min(25, Math.round(value * (0.10 + rng() * 0.05))));
      const ticketPrice = Math.round(rawTicketPrice);
      // Total tickets: value / ticket price * 1.3 (house edge ~30%)
      const totalTickets = Math.max(5, Math.min(50, Math.round((value / ticketPrice) * (1.2 + rng() * 0.3))));

      // Simulated participants
      const numParticipants = Math.floor(2 + rng() * 6);
      const participants: { name: string; tickets: number }[] = [];
      let sold = 0;
      for (let p = 0; p < numParticipants; p++) {
        const nameIdx = Math.floor(rng() * PARTICIPANT_NAMES.length);
        const tix = Math.floor(1 + rng() * 4);
        participants.push({ name: PARTICIPANT_NAMES[nameIdx], tickets: tix });
        sold += tix;
      }
      // Leave some tickets available
      const ticketsSold = Math.min(sold, totalTickets - 2);

      selected.push({
        slug: card.slug,
        name: card.name,
        player: card.player,
        sport: card.sport,
        value,
        ticketPrice,
        totalTickets,
        ticketsSold,
        myTickets: 0,
        participants,
        winner: null,
        iWon: false,
        endTime: Date.now() + 3600000 * (1 + Math.floor(rng() * 23)),
      });
    }

    return selected;
  }, [seed, sportFilter]);

  const enterRaffle = useCallback((raffle: RaffleEntry) => {
    const cost = ticketCount * raffle.ticketPrice;
    if (cost > balance) return;
    if (enteredRaffles.has(raffle.slug)) return;

    setBalance(b => b - cost);
    setEnteredRaffles(prev => new Set([...prev, raffle.slug]));

    // Determine winner
    const allTickets: string[] = [];
    raffle.participants.forEach(p => {
      for (let i = 0; i < p.tickets; i++) allTickets.push(p.name);
    });
    for (let i = 0; i < ticketCount; i++) allTickets.push('YOU');
    // Fill remaining with random names
    const remaining = raffle.totalTickets - allTickets.length;
    const rng = seededRandom(seed + raffle.slug.length);
    for (let i = 0; i < remaining; i++) {
      allTickets.push(PARTICIPANT_NAMES[Math.floor(rng() * PARTICIPANT_NAMES.length)]);
    }

    // Draw winner
    const winnerIdx = Math.floor(rng() * allTickets.length);
    const winner = allTickets[winnerIdx];
    const iWon = winner === 'YOU';

    const updatedRaffle: RaffleEntry = {
      ...raffle,
      myTickets: ticketCount,
      ticketsSold: raffle.ticketsSold + ticketCount,
      winner,
      iWon,
    };

    setSelectedRaffle(updatedRaffle);
    setPhase('drawing');

    // Animate drawing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setDrawProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setPhase('result');

        // Update stats
        setStats(prev => ({
          entered: prev.entered + 1,
          ticketsBought: prev.ticketsBought + ticketCount,
          wins: prev.wins + (iWon ? 1 : 0),
          biggestWin: iWon ? Math.max(prev.biggestWin, raffle.value) : prev.biggestWin,
          totalSpent: prev.totalSpent + cost,
          totalWon: prev.totalWon + (iWon ? raffle.value : 0),
        }));

        if (iWon) {
          setBalance(b => b + raffle.value);
        }

        setHistory(prev => [{
          cardName: raffle.name,
          cardValue: raffle.value,
          myTickets: ticketCount,
          totalTickets: raffle.totalTickets,
          won: iWon,
          date: new Date().toLocaleDateString(),
        }, ...prev].slice(0, 50));
      }
    }, 30);
  }, [ticketCount, balance, enteredRaffles, seed]);

  const winRate = stats.entered > 0 ? stats.wins / stats.entered : 0;
  const grade = getGrade(winRate, stats.wins);
  const netPL = stats.totalWon - stats.totalSpent;

  const sportLabel = (s: string) => {
    const map: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };
    return map[s] || s;
  };

  const formatTime = (ms: number) => {
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-teal-400 text-xl font-bold">${balance.toFixed(0)}</div>
          <div className="text-gray-500 text-xs">Wallet</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-white text-xl font-bold">{stats.entered}</div>
          <div className="text-gray-500 text-xs">Raffles Entered</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-emerald-400 text-xl font-bold">{stats.wins}</div>
          <div className="text-gray-500 text-xs">Wins</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className={`text-xl font-bold ${netPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {netPL >= 0 ? '+' : ''}{netPL.toFixed(0)}
          </div>
          <div className="text-gray-500 text-xs">Net P&L</div>
        </div>
      </div>

      {/* Mode + Sport Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button onClick={() => { setMode('daily'); setPhase('browse'); setSelectedRaffle(null); }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>Daily</button>
          <button onClick={() => { setMode('random'); setRandomSeed(Date.now()); setPhase('browse'); setSelectedRaffle(null); }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'random' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>Random</button>
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
            <button key={s} onClick={() => { setSportFilter(s); setPhase('browse'); setSelectedRaffle(null); }} className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${sportFilter === s ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {s === 'all' ? 'All' : sportLabel(s)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          <button onClick={() => setTab('active')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'active' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>Active Raffles</button>
          <button onClick={() => setTab('history')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'history' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>History</button>
        </div>
      </div>

      {tab === 'active' && phase === 'browse' && (
        <div className="space-y-4">
          {raffles.map((raffle, i) => {
            const entered = enteredRaffles.has(raffle.slug);
            const ticketsLeft = raffle.totalTickets - raffle.ticketsSold;
            const fillPct = (raffle.ticketsSold / raffle.totalTickets) * 100;
            const timeLeft = raffle.endTime - Date.now();

            return (
              <div key={`${raffle.slug}-${i}`} className={`bg-gray-900/60 border rounded-xl p-4 transition-colors ${entered ? 'border-teal-800/50 opacity-60' : 'border-gray-800 hover:border-teal-700/50'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-teal-950/60 border border-teal-800/40 text-teal-400 px-2 py-0.5 rounded-full">{sportLabel(raffle.sport)}</span>
                      {entered && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">Entered</span>}
                      {timeLeft > 0 && <span className="text-xs text-gray-500">{formatTime(timeLeft)} left</span>}
                    </div>
                    <h3 className="text-white font-medium text-sm sm:text-base mb-0.5">{raffle.name}</h3>
                    <div className="text-gray-400 text-xs">{raffle.player}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-teal-400 font-bold">${raffle.value}</div>
                      <div className="text-gray-500 text-xs">Prize Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">${raffle.ticketPrice}</div>
                      <div className="text-gray-500 text-xs">Per Ticket</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold">{ticketsLeft}/{raffle.totalTickets}</div>
                      <div className="text-gray-500 text-xs">Tickets Left</div>
                    </div>
                  </div>
                </div>

                {/* Fill bar */}
                <div className="mt-3 mb-2">
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{raffle.participants.length + (entered ? 1 : 0)} participants &middot; {raffle.ticketsSold} tickets sold</div>
                </div>

                {!entered && (
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                      <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="text-gray-400 hover:text-white text-sm font-bold">-</button>
                      <span className="text-white text-sm font-medium w-6 text-center">{ticketCount}</span>
                      <button onClick={() => setTicketCount(Math.min(Math.min(10, ticketsLeft), ticketCount + 1))} className="text-gray-400 hover:text-white text-sm font-bold">+</button>
                    </div>
                    <span className="text-gray-400 text-sm">= ${ticketCount * raffle.ticketPrice}</span>
                    <button
                      onClick={() => enterRaffle(raffle)}
                      disabled={ticketCount * raffle.ticketPrice > balance}
                      className="ml-auto px-4 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Enter Raffle
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {raffles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No raffles available for this sport filter.</p>
              <p className="text-sm">Try &quot;All&quot; sports or refresh with Random mode.</p>
            </div>
          )}
        </div>
      )}

      {/* Drawing Phase */}
      {phase === 'drawing' && selectedRaffle && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-6 animate-bounce">🎟️</div>
          <h3 className="text-xl font-bold text-white mb-2">Drawing Winner...</h3>
          <p className="text-gray-400 mb-6">{selectedRaffle.name}</p>
          <div className="w-64 bg-gray-800 rounded-full h-3 mb-4">
            <div className="bg-teal-500 h-3 rounded-full transition-all" style={{ width: `${drawProgress}%` }} />
          </div>
          <div className="text-teal-400 text-sm">{selectedRaffle.totalTickets} tickets in the pool...</div>
        </div>
      )}

      {/* Result Phase */}
      {phase === 'result' && selectedRaffle && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-6">{selectedRaffle.iWon ? '🏆' : '😔'}</div>
          <h3 className={`text-2xl font-bold mb-2 ${selectedRaffle.iWon ? 'text-teal-400' : 'text-gray-400'}`}>
            {selectedRaffle.iWon ? 'YOU WON!' : 'Not This Time'}
          </h3>
          <p className="text-white font-medium mb-1">{selectedRaffle.name}</p>
          <p className="text-gray-400 text-sm mb-4">{selectedRaffle.player}</p>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 w-full max-w-md mb-6">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-teal-400 font-bold">${selectedRaffle.value}</div>
                <div className="text-gray-500 text-xs">Card Value</div>
              </div>
              <div>
                <div className="text-white font-bold">{selectedRaffle.myTickets} / {selectedRaffle.totalTickets}</div>
                <div className="text-gray-500 text-xs">Your Tickets</div>
              </div>
              <div>
                <div className="text-amber-400 font-bold">{((selectedRaffle.myTickets / selectedRaffle.totalTickets) * 100).toFixed(1)}%</div>
                <div className="text-gray-500 text-xs">Win Chance</div>
              </div>
              <div>
                <div className={`font-bold ${selectedRaffle.iWon ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedRaffle.iWon ? `+$${selectedRaffle.value}` : `-$${selectedRaffle.myTickets * selectedRaffle.ticketPrice}`}
                </div>
                <div className="text-gray-500 text-xs">Result</div>
              </div>
            </div>
            {!selectedRaffle.iWon && (
              <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                <span className="text-gray-500 text-xs">Winner: </span>
                <span className="text-teal-400 text-sm font-medium">{selectedRaffle.winner}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => { setPhase('browse'); setSelectedRaffle(null); setTicketCount(1); }}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors"
          >
            Back to Raffles
          </button>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div>
          {/* Grade card */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 mb-6 text-center">
            <div className={`text-5xl font-bold mb-2 ${grade.color}`}>{grade.letter}</div>
            <div className="text-gray-400 text-sm mb-3">Raffle Grade</div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-white font-bold">{(winRate * 100).toFixed(1)}%</div>
                <div className="text-gray-500 text-xs">Win Rate</div>
              </div>
              <div>
                <div className="text-teal-400 font-bold">${stats.biggestWin}</div>
                <div className="text-gray-500 text-xs">Biggest Win</div>
              </div>
              <div>
                <div className="text-white font-bold">{stats.ticketsBought}</div>
                <div className="text-gray-500 text-xs">Total Tickets</div>
              </div>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No raffle history yet.</p>
              <p className="text-sm">Enter a raffle to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center justify-between bg-gray-900/60 border rounded-xl p-3 ${h.won ? 'border-teal-800/50' : 'border-gray-800'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{h.cardName}</div>
                    <div className="text-gray-500 text-xs">{h.date} &middot; {h.myTickets}/{h.totalTickets} tickets</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">${h.cardValue}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.won ? 'bg-teal-950/60 text-teal-400' : 'bg-red-950/60 text-red-400'}`}>
                      {h.won ? 'WON' : 'LOST'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How Card Raffles Work */}
      <section className="mt-12 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How Card Raffles Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h3 className="text-teal-400 font-medium mb-1">1. Browse Active Raffles</h3>
            <p>Each raffle features a real sports card from our database of 9,700+ cards. Card values, ticket prices, and participant counts are all shown upfront.</p>
          </div>
          <div>
            <h3 className="text-teal-400 font-medium mb-1">2. Buy Tickets</h3>
            <p>Purchase 1-10 tickets per raffle using your wallet balance. More tickets = higher chance of winning. Each ticket is an equal share of the prize pool.</p>
          </div>
          <div>
            <h3 className="text-teal-400 font-medium mb-1">3. Watch the Drawing</h3>
            <p>When you enter, the raffle draws immediately. One ticket is selected at random from all purchased tickets. If yours is chosen, you win the card value!</p>
          </div>
          <div>
            <h3 className="text-teal-400 font-medium mb-1">4. Track Your Results</h3>
            <p>Your win rate, net P&L, biggest win, and complete history are all tracked. Try to beat the house edge and earn an S-grade raffle record!</p>
          </div>
        </div>
      </section>

      {/* Real-World Raffle Tips */}
      <section className="mt-6 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Real-World Card Raffle Tips</h2>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex gap-2"><span className="text-teal-400">&#x2022;</span>Only enter raffles from verified sellers with a track record — Instagram and Facebook group raffles are rife with scams</li>
          <li className="flex gap-2"><span className="text-teal-400">&#x2022;</span>Calculate the total ticket revenue vs card value — ethical raffles sell only enough tickets to cover cost + small margin</li>
          <li className="flex gap-2"><span className="text-teal-400">&#x2022;</span>Look for raffles where the host shows the actual card in hand (not stock photos) and provides tracking after shipping</li>
          <li className="flex gap-2"><span className="text-teal-400">&#x2022;</span>Set a monthly raffle budget and stick to it — the randomness makes it easy to chase losses</li>
          <li className="flex gap-2"><span className="text-teal-400">&#x2022;</span>Consider the &ldquo;expected value&rdquo; — if 30 tickets at $10 each chase a $200 card, the EV is negative ($6.67 per ticket for a 1/30 chance at $200)</li>
        </ul>
      </section>
    </div>
  );
}