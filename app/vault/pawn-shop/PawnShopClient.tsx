'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
interface PawnOffer {
  round: number;
  offer: number;
  message: string;
}

interface PawnSession {
  cardSlug: string;
  cardName: string;
  sport: string;
  marketValue: number;
  offers: PawnOffer[];
  finalDeal: number | null; // null = walked away
  status: 'negotiating' | 'accepted' | 'rejected' | 'walked';
}

interface PawnStats {
  totalDeals: number;
  totalPawned: number;
  totalEarned: number;
  bestDealPct: number;
  worstDealPct: number;
  walkedAway: number;
}

// --- Helpers ---
function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400',
  basketball: 'text-orange-400',
  football: 'text-blue-400',
  hockey: 'text-cyan-400',
};

const sportBg: Record<string, string> = {
  baseball: 'bg-red-950/40 border-red-800/40',
  basketball: 'bg-orange-950/40 border-orange-800/40',
  football: 'bg-blue-950/40 border-blue-800/40',
  hockey: 'bg-cyan-950/40 border-cyan-800/40',
};

const sportIcons: Record<string, string> = {
  baseball: '\u26be',
  basketball: '\ud83c\udfc0',
  football: '\ud83c\udfc8',
  hockey: '\ud83c\udfd2',
};

// Pawnbroker personalities
const brokerLines = {
  greeting: [
    "Welcome to Vinny's Card Pawn. Let's see what you've got...",
    "Another day, another collector looking for quick cash. Show me the card.",
    "Step right up. I've been buying cards since before Jeter was a rookie.",
    "Alright, let me take a look. Fair warning — I'm tough but honest.",
  ],
  lowball: [
    "Look, I gotta keep the lights on. This is what I can do.",
    "I see a lot of these come through. Here's my offer.",
    "The market's soft right now. Best I can do is...",
    "I've got overhead, insurance, rent... this is fair.",
  ],
  bump: [
    "Alright, you're a tough negotiator. I can come up a bit.",
    "Fine, fine. I'll move a little. But this is getting close to my ceiling.",
    "You're killing me here. Okay, one more bump.",
    "I respect the hustle. Here's my revised offer.",
  ],
  final: [
    "This is my absolute final offer. Take it or walk.",
    "Last chance — I can't go a penny higher.",
    "Final offer. I've got another collector waiting in the back.",
    "That's it. My final number. What do you say?",
  ],
  accept: [
    "Smart move. Pleasure doing business with you.",
    "Deal! I'll have your cash ready in a minute.",
    "Sold! You drove a hard bargain, I respect that.",
    "Done deal. Come back anytime.",
  ],
  reject: [
    "Your loss. That was a fair offer. Door's always open.",
    "Suit yourself. Good luck getting more on eBay after fees.",
    "Walking away? Bold move. Hope it works out.",
    "No hard feelings. Come back when you're ready to deal.",
  ],
  highValue: [
    "Now THAT'S a card. Let me put on my good glasses...",
    "Whoa. Don't see one of these every day. Let me think...",
    "This is serious inventory. Give me a second to calculate...",
  ],
  lowValue: [
    "Common card, nothing special. But hey, cash is cash.",
    "I've got a whole bin of these. Not much demand.",
    "Budget card. Quick flip at best.",
  ],
};

function getBrokerLine(category: keyof typeof brokerLines, seed: number): string {
  const lines = brokerLines[category];
  return lines[Math.abs(seed) % lines.length];
}

// Generate pawn offer based on round, card value, and random seed
function generateOffer(marketValue: number, round: number, seed: number): { pct: number; amount: number } {
  const rng = seededRng(seed + round * 7919);
  // Round 1: 40-55% of market value
  // Round 2: 50-65%
  // Round 3 (final): 58-72%
  const ranges = [
    { min: 0.40, max: 0.55 },
    { min: 0.50, max: 0.65 },
    { min: 0.58, max: 0.72 },
  ];
  const range = ranges[Math.min(round, 2)];
  const pct = range.min + rng() * (range.max - range.min);
  const amount = Math.round(marketValue * pct * 100) / 100;
  return { pct, amount };
}

export default function PawnShopClient() {
  // Search state
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);

  // Session state
  const [session, setSession] = useState<PawnSession | null>(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Stats
  const [stats, setStats] = useState<PawnStats>({
    totalDeals: 0, totalPawned: 0, totalEarned: 0,
    bestDealPct: 0, worstDealPct: 0, walkedAway: 0,
  });

  // History
  const [history, setHistory] = useState<Array<{
    cardName: string; sport: string; marketValue: number;
    dealValue: number | null; pct: number; timestamp: number;
  }>>([]);

  // Load stats and history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cardvault-pawn-stats');
      if (saved) setStats(JSON.parse(saved));
      const savedHist = localStorage.getItem('cardvault-pawn-history');
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch { /* ignore */ }
  }, []);

  // Save stats
  const saveStats = useCallback((s: PawnStats) => {
    setStats(s);
    try { localStorage.setItem('cardvault-pawn-stats', JSON.stringify(s)); } catch { /* ignore */ }
  }, []);

  const saveHistory = useCallback((h: typeof history) => {
    setHistory(h);
    try { localStorage.setItem('cardvault-pawn-history', JSON.stringify(h)); } catch { /* ignore */ }
  }, []);

  // Filtered cards for search
  const filteredCards = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      })
      .slice(0, 12);
  }, [query, sportFilter]);

  // Start a pawn session
  const startSession = useCallback((card: typeof sportsCards[0]) => {
    const marketValue = parseValue(card.estimatedValueRaw);
    const seed = card.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now();
    const { amount } = generateOffer(marketValue, 0, seed);
    const isHigh = marketValue >= 50;
    const isLow = marketValue < 10;

    const greeting = getBrokerLine('greeting', seed);
    const reaction = isHigh ? getBrokerLine('highValue', seed) : isLow ? getBrokerLine('lowValue', seed) : '';
    const offerLine = getBrokerLine('lowball', seed + 1);

    setSession({
      cardSlug: card.slug,
      cardName: card.name,
      sport: card.sport,
      marketValue,
      offers: [{
        round: 1,
        offer: amount,
        message: `${greeting}${reaction ? ' ' + reaction : ''} ${offerLine} $${amount.toFixed(2)}.`,
      }],
      finalDeal: null,
      status: 'negotiating',
    });
    setSelectedCard(card);
    setCurrentRound(1);
    setShowResult(false);
    setQuery('');
  }, []);

  // Counter-offer (ask for more)
  const counterOffer = useCallback(() => {
    if (!session || currentRound >= 3) return;
    const nextRound = currentRound + 1;
    const seed = session.cardSlug.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now();
    const { amount } = generateOffer(session.marketValue, nextRound - 1, seed);
    const lineCategory = nextRound >= 3 ? 'final' : 'bump';
    const msg = `${getBrokerLine(lineCategory, seed)} $${amount.toFixed(2)}.`;

    setSession({
      ...session,
      offers: [...session.offers, { round: nextRound, offer: amount, message: msg }],
    });
    setCurrentRound(nextRound);
  }, [session, currentRound]);

  // Accept the deal
  const acceptDeal = useCallback(() => {
    if (!session) return;
    const lastOffer = session.offers[session.offers.length - 1];
    const pct = lastOffer.offer / session.marketValue;
    const seed = Date.now();
    const newSession: PawnSession = {
      ...session,
      finalDeal: lastOffer.offer,
      status: 'accepted',
      offers: [...session.offers, {
        round: currentRound + 1,
        offer: lastOffer.offer,
        message: getBrokerLine('accept', seed),
      }],
    };
    setSession(newSession);
    setShowResult(true);

    // Update stats
    const newStats: PawnStats = {
      totalDeals: stats.totalDeals + 1,
      totalPawned: stats.totalPawned + 1,
      totalEarned: stats.totalEarned + lastOffer.offer,
      bestDealPct: stats.totalDeals === 0 ? pct : Math.max(stats.bestDealPct, pct),
      worstDealPct: stats.totalDeals === 0 ? pct : Math.min(stats.worstDealPct, pct),
      walkedAway: stats.walkedAway,
    };
    saveStats(newStats);

    const newHist = [{
      cardName: session.cardName, sport: session.sport,
      marketValue: session.marketValue, dealValue: lastOffer.offer,
      pct, timestamp: Date.now(),
    }, ...history].slice(0, 20);
    saveHistory(newHist);
  }, [session, currentRound, stats, history, saveStats, saveHistory]);

  // Walk away
  const walkAway = useCallback(() => {
    if (!session) return;
    const seed = Date.now();
    const newSession: PawnSession = {
      ...session,
      finalDeal: null,
      status: 'walked',
      offers: [...session.offers, {
        round: currentRound + 1,
        offer: 0,
        message: getBrokerLine('reject', seed),
      }],
    };
    setSession(newSession);
    setShowResult(true);

    const newStats: PawnStats = {
      ...stats,
      totalDeals: stats.totalDeals + 1,
      walkedAway: stats.walkedAway + 1,
    };
    saveStats(newStats);

    const newHist = [{
      cardName: session.cardName, sport: session.sport,
      marketValue: session.marketValue, dealValue: null,
      pct: 0, timestamp: Date.now(),
    }, ...history].slice(0, 20);
    saveHistory(newHist);
  }, [session, currentRound, stats, history, saveStats, saveHistory]);

  // Reset for new card
  const newCard = useCallback(() => {
    setSession(null);
    setSelectedCard(null);
    setCurrentRound(0);
    setShowResult(false);
    setQuery('');
  }, []);

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Visits', value: stats.totalDeals, icon: '\ud83d\udcbc' },
          { label: 'Cards Pawned', value: stats.totalPawned, icon: '\ud83d\udcb0' },
          { label: 'Total Earned', value: `$${stats.totalEarned.toFixed(0)}`, icon: '\ud83d\udcb5' },
          { label: 'Walked Away', value: stats.walkedAway, icon: '\ud83d\udeaa' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-white font-bold text-lg">{s.value}</div>
            <div className="text-gray-400 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Best/Worst Deal */}
      {stats.totalPawned > 0 && (
        <div className="flex gap-4 mb-8 text-sm">
          <div className="bg-green-950/30 border border-green-800/30 rounded-lg px-4 py-2 flex-1 text-center">
            <span className="text-gray-400">Best Deal: </span>
            <span className="text-green-400 font-bold">{(stats.bestDealPct * 100).toFixed(0)}%</span>
            <span className="text-gray-500"> of market</span>
          </div>
          <div className="bg-red-950/30 border border-red-800/30 rounded-lg px-4 py-2 flex-1 text-center">
            <span className="text-gray-400">Worst Deal: </span>
            <span className="text-red-400 font-bold">{(stats.worstDealPct * 100).toFixed(0)}%</span>
            <span className="text-gray-500"> of market</span>
          </div>
        </div>
      )}

      {/* Search Phase */}
      {!session && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-1">Bring a Card to Pawn</h2>
          <p className="text-gray-400 text-sm mb-4">Search from 9,000+ sports cards or browse by sport. See what Vinny will offer.</p>

          <div className="flex gap-2 mb-4">
            {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sportFilter === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by player name or card name..."
            className="w-full bg-gray-900/60 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 mb-2"
          />

          {filteredCards.length > 0 && (
            <div className="bg-gray-900/80 border border-gray-700/50 rounded-lg max-h-80 overflow-y-auto">
              {filteredCards.map(card => {
                const val = parseValue(card.estimatedValueRaw);
                return (
                  <button
                    key={card.slug}
                    onClick={() => startSession(card)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800/80 border-b border-gray-800/50 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{card.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs ${sportColors[card.sport]}`}>
                            {sportIcons[card.sport]} {card.player}
                          </span>
                          {card.rookie && (
                            <span className="text-[10px] bg-yellow-900/40 text-yellow-400 px-1.5 py-0.5 rounded">RC</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-amber-400 text-sm font-bold">${val}</div>
                        <div className="text-gray-500 text-xs">raw est.</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {query.length >= 2 && filteredCards.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4">No cards found. Try a different name or sport.</div>
          )}
        </div>
      )}

      {/* Negotiation Phase */}
      {session && !showResult && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          {/* Card being pawned */}
          <div className={`${sportBg[session.sport]} border rounded-lg p-4 mb-6`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold">{session.cardName}</div>
                <div className={`text-sm ${sportColors[session.sport]}`}>
                  {sportIcons[session.sport]} {selectedCard?.player}
                  {selectedCard?.rookie && <span className="ml-2 text-[10px] bg-yellow-900/40 text-yellow-400 px-1.5 py-0.5 rounded">RC</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs">Market Value</div>
                <div className="text-white font-bold text-lg">${session.marketValue}</div>
              </div>
            </div>
          </div>

          {/* Broker avatar + conversation */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-900/40 border border-amber-700/40 rounded-full flex items-center justify-center text-2xl">
                \ud83d\udcb0
              </div>
              <div>
                <div className="text-amber-400 font-bold text-sm">Vinny the Card Broker</div>
                <div className="text-gray-500 text-xs">30 years in the hobby. Fair but tough.</div>
              </div>
            </div>

            {/* Offer bubbles */}
            <div className="space-y-3">
              {session.offers.map((offer, idx) => (
                <div key={idx} className="bg-gray-900/60 border border-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 text-xs font-medium">Round {offer.round}</span>
                    {offer.offer > 0 && (
                      <span className="text-gray-500 text-xs">
                        ({((offer.offer / session.marketValue) * 100).toFixed(0)}% of market)
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{offer.message}</p>
                  {offer.offer > 0 && (
                    <div className="mt-2 text-amber-400 font-bold text-xl">${offer.offer.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={acceptDeal}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm"
            >
              Accept ${session.offers[session.offers.length - 1].offer.toFixed(2)}
            </button>
            {currentRound < 3 && (
              <button
                onClick={counterOffer}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm"
              >
                Counter &mdash; Ask for More
              </button>
            )}
            <button
              onClick={walkAway}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm"
            >
              Walk Away
            </button>
          </div>

          {/* Negotiation progress */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3].map(r => (
              <div
                key={r}
                className={`h-2 flex-1 rounded-full ${
                  r <= currentRound ? 'bg-amber-500' : 'bg-gray-700'
                }`}
              />
            ))}
            <span className="text-gray-500 text-xs ml-1">Round {currentRound}/3</span>
          </div>
        </div>
      )}

      {/* Result Phase */}
      {session && showResult && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          {/* Final broker message */}
          <div className="bg-gray-900/60 border border-gray-700/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-900/40 border border-amber-700/40 rounded-full flex items-center justify-center text-xl">
                \ud83d\udcb0
              </div>
              <span className="text-amber-400 font-bold text-sm">Vinny says:</span>
            </div>
            <p className="text-gray-300 text-sm">
              {session.offers[session.offers.length - 1].message}
            </p>
          </div>

          {/* Deal summary */}
          <div className={`rounded-xl p-6 mb-6 ${
            session.status === 'accepted'
              ? 'bg-green-950/30 border border-green-800/40'
              : 'bg-red-950/30 border border-red-800/40'
          }`}>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">{session.status === 'accepted' ? '\ud83e\udd1d' : '\ud83d\udeaa'}</div>
              <h3 className={`text-xl font-bold ${
                session.status === 'accepted' ? 'text-green-400' : 'text-red-400'
              }`}>
                {session.status === 'accepted' ? 'DEAL MADE!' : 'YOU WALKED AWAY'}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-gray-400 text-xs">Market Value</div>
                <div className="text-white font-bold text-lg">${session.marketValue}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs">
                  {session.status === 'accepted' ? 'You Got' : 'Best Offer Was'}
                </div>
                <div className={`font-bold text-lg ${
                  session.status === 'accepted' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  ${session.status === 'accepted'
                    ? session.finalDeal?.toFixed(2)
                    : session.offers.filter(o => o.offer > 0).reduce((max, o) => Math.max(max, o.offer), 0).toFixed(2)
                  }
                </div>
              </div>
            </div>

            {session.status === 'accepted' && session.finalDeal && (
              <div className="mt-4 text-center">
                <div className="text-gray-400 text-sm">
                  You received <span className="text-amber-400 font-bold">
                    {((session.finalDeal / session.marketValue) * 100).toFixed(0)}%
                  </span> of market value
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {session.finalDeal / session.marketValue >= 0.65
                    ? 'Great deal! You negotiated well above average.'
                    : session.finalDeal / session.marketValue >= 0.55
                    ? 'Solid deal. About what you\u2019d get from most shops.'
                    : 'Below average. Next time, push harder in negotiations.'
                  }
                </div>
              </div>
            )}
          </div>

          {/* What You'd Get Elsewhere */}
          <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-4 mb-6">
            <h4 className="text-white font-bold text-sm mb-3">What You&apos;d Get Elsewhere</h4>
            <div className="space-y-2">
              {[
                { platform: 'eBay (after fees)', pct: 0.85, note: '13% fees + shipping' },
                { platform: 'COMC', pct: 0.80, note: '20% commission' },
                { platform: 'Facebook Groups', pct: 0.90, note: 'No fees, some risk' },
                { platform: 'Card Show Dealer', pct: 0.60, note: 'Instant cash, steep discount' },
                { platform: 'LCS Buylist', pct: 0.50, note: 'Store credit better ~65%' },
              ].map(p => {
                const amt = Math.round(session.marketValue * p.pct * 100) / 100;
                return (
                  <div key={p.platform} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-300">{p.platform}</span>
                      <span className="text-gray-500 text-xs ml-2">{p.note}</span>
                    </div>
                    <span className="text-gray-300 font-medium">${amt.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4 mb-6">
            <div className="text-amber-400 font-bold text-sm mb-1">Pro Tip</div>
            <p className="text-gray-400 text-sm">
              {session.marketValue >= 100
                ? 'High-value cards ($100+) are worth selling on eBay or Goldin despite fees. Pawn shops and dealers rarely offer more than 60% on expensive cards.'
                : session.marketValue >= 20
                ? 'Mid-range cards ($20-$100) can be quick-flipped at card shows for 60-70% of market. If you have time, eBay nets more after fees.'
                : 'Budget cards (under $20) are best sold in lots or traded. Individual sales rarely justify the time and shipping cost.'
              }
            </p>
          </div>

          <button
            onClick={newCard}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Pawn Another Card
          </button>
        </div>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
          <h3 className="text-white font-bold mb-4">Pawn History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((h, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm bg-gray-900/40 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{h.cardName}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${sportColors[h.sport]}`}>{sportIcons[h.sport]}</span>
                    <span className="text-gray-500 text-xs">Market: ${h.marketValue}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  {h.dealValue ? (
                    <>
                      <div className="text-green-400 font-bold">${h.dealValue.toFixed(0)}</div>
                      <div className="text-gray-500 text-xs">{(h.pct * 100).toFixed(0)}%</div>
                    </>
                  ) : (
                    <div className="text-red-400 text-xs font-medium">Walked</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
        <h3 className="text-white font-bold mb-4">How the Card Pawn Shop Works</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Bring a Card', desc: 'Search from 9,000+ sports cards in our database. Pick the card you want to pawn.' },
            { step: '2', title: 'Get an Offer', desc: 'Vinny the Card Broker examines your card and makes an opening offer (typically 40-55% of market value).' },
            { step: '3', title: 'Negotiate', desc: 'Push back up to 3 rounds. Each counter-offer brings a higher price. Know when to hold and when to fold.' },
            { step: '4', title: 'Deal or Walk', desc: 'Accept the final offer or walk away. Compare to what you would get on eBay, COMC, or at shows.' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="w-8 h-8 bg-amber-600/20 border border-amber-600/30 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                {s.step}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{s.title}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8">
        <h3 className="text-white font-bold mb-4">5 Negotiation Tips from Real Dealers</h3>
        <div className="space-y-3">
          {[
            { tip: 'Always Counter', detail: 'Never accept the first offer. Dealers expect negotiation and build in margin for it. Even one counter-offer typically adds 10-15% to your payout.' },
            { tip: 'Know Your Floor', detail: 'Before negotiating, know the minimum you will accept. If a $100 card gets offered $45, your floor might be $60. Walk away if they cannot meet it.' },
            { tip: 'Mention Comps', detail: 'Real dealers respond to data. Mention recent eBay sold prices or auction results to justify your counter. Numbers beat emotions in negotiation.' },
            { tip: 'Bundle for Better Deals', detail: 'Selling multiple cards at once gives you leverage. Dealers prefer bulk purchases and will often pay 5-10% more per card when buying a lot.' },
            { tip: 'Timing Matters', detail: 'Sell during peak season (playoffs, draft, new releases). Dealers pay more when they know they can resell quickly. Off-season means lower offers.' },
          ].map((t, idx) => (
            <div key={idx} className="bg-gray-900/40 rounded-lg p-3">
              <div className="text-amber-400 font-medium text-sm">{t.tip}</div>
              <div className="text-gray-400 text-xs mt-1">{t.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: '/vault/flash-sale', label: 'Flash Sales', desc: 'Limited-time deals on packs and singles', icon: '\u26a1' },
          { href: '/vault/negotiator', label: 'Price Negotiator', desc: 'Practice haggling with AI sellers', icon: '\ud83e\udd1d' },
          { href: '/vault/auction-sniper', label: 'Auction Sniper', desc: 'Bid on timed card auctions', icon: '\ud83c\udfaf' },
          { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Calculate profit after fees', icon: '\ud83d\udcb8' },
          { href: '/vault/bulk-sale', label: 'Bulk Sale Calculator', desc: 'Compare selling platforms', icon: '\ud83d\udcca' },
          { href: '/vault/liquidation', label: 'Liquidation Planner', desc: 'Plan how to sell your collection', icon: '\ud83d\udcc5' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 hover:border-gray-600/50 transition-colors group">
            <div className="text-lg mb-1">{link.icon}</div>
            <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{link.label}</div>
            <div className="text-gray-500 text-xs">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
