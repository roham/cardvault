'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(v: string): number {
  const m = v.match(/\$[\d,]+/);
  return m ? parseInt(m[0].replace(/[$,]/g, ''), 10) : 0;
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ─── Sport seasonality data ─── */
const SPORT_SEASONS: Record<string, {
  months: { name: string; signal: 'buy' | 'sell' | 'hold'; reason: string; modifier: number }[];
  events: { name: string; month: number; impact: string; modifier: number }[];
  color: string;
  accent: string;
}> = {
  baseball: {
    months: [
      { name: 'Jan', signal: 'buy', reason: 'Off-season lull — lowest demand', modifier: -12 },
      { name: 'Feb', signal: 'buy', reason: 'Spring training anticipation building', modifier: -8 },
      { name: 'Mar', signal: 'hold', reason: 'Spring training starts, interest rising', modifier: -3 },
      { name: 'Apr', signal: 'sell', reason: 'Opening Day hype — peak demand', modifier: +15 },
      { name: 'May', signal: 'hold', reason: 'Early season — tracking performance', modifier: +5 },
      { name: 'Jun', signal: 'hold', reason: 'All-Star voting begins', modifier: +8 },
      { name: 'Jul', signal: 'sell', reason: 'All-Star Game + trade deadline buzz', modifier: +12 },
      { name: 'Aug', signal: 'hold', reason: 'Playoff race heating up', modifier: +6 },
      { name: 'Sep', signal: 'sell', reason: 'Playoff push — contender cards spike', modifier: +10 },
      { name: 'Oct', signal: 'sell', reason: 'World Series — peak spotlight', modifier: +18 },
      { name: 'Nov', signal: 'buy', reason: 'Post-season dip — offseason begins', modifier: -10 },
      { name: 'Dec', signal: 'buy', reason: 'Holiday buying but low card-specific demand', modifier: -6 },
    ],
    events: [
      { name: 'Opening Day', month: 3, impact: '+10-20% for star players', modifier: 15 },
      { name: 'All-Star Game', month: 6, impact: '+5-15% for All-Stars', modifier: 10 },
      { name: 'Trade Deadline', month: 7, impact: '+/-10-25% for traded players', modifier: 12 },
      { name: 'World Series', month: 9, impact: '+15-40% for WS players', modifier: 25 },
      { name: 'MVP/Cy Young Awards', month: 10, impact: '+10-30% for winners', modifier: 20 },
      { name: 'HOF Announcement', month: 0, impact: '+20-50% for inductees', modifier: 35 },
    ],
    color: 'text-rose-400',
    accent: 'bg-rose-950/40 border-rose-800/40',
  },
  basketball: {
    months: [
      { name: 'Jan', signal: 'hold', reason: 'Mid-season — All-Star talk begins', modifier: +3 },
      { name: 'Feb', signal: 'sell', reason: 'All-Star Weekend hype', modifier: +12 },
      { name: 'Mar', signal: 'hold', reason: 'Playoff positioning — tracking wins', modifier: +5 },
      { name: 'Apr', signal: 'sell', reason: 'Playoffs start — max excitement', modifier: +18 },
      { name: 'May', signal: 'sell', reason: 'Conference Finals spotlight', modifier: +15 },
      { name: 'Jun', signal: 'sell', reason: 'NBA Finals + Draft hype', modifier: +20 },
      { name: 'Jul', signal: 'hold', reason: 'Free agency moves cards', modifier: +8 },
      { name: 'Aug', signal: 'buy', reason: 'Dead period — summer lull', modifier: -15 },
      { name: 'Sep', signal: 'buy', reason: 'Off-season — lowest NBA demand', modifier: -12 },
      { name: 'Oct', signal: 'hold', reason: 'Season tips off, interest returns', modifier: +2 },
      { name: 'Nov', signal: 'hold', reason: 'Early season — tracking breakouts', modifier: +5 },
      { name: 'Dec', signal: 'hold', reason: 'Christmas Day games spotlight', modifier: +6 },
    ],
    events: [
      { name: 'All-Star Weekend', month: 1, impact: '+8-20% for All-Stars', modifier: 15 },
      { name: 'Playoffs Start', month: 3, impact: '+10-25% for contenders', modifier: 20 },
      { name: 'NBA Finals', month: 5, impact: '+15-40% for Finals players', modifier: 30 },
      { name: 'NBA Draft', month: 5, impact: '+50-200% for draft picks', modifier: 40 },
      { name: 'Free Agency', month: 6, impact: '+/-15-40% for movers', modifier: 20 },
      { name: 'MVP Award', month: 5, impact: '+15-35% for winner', modifier: 25 },
    ],
    color: 'text-orange-400',
    accent: 'bg-orange-950/40 border-orange-800/40',
  },
  football: {
    months: [
      { name: 'Jan', signal: 'sell', reason: 'Playoffs + Super Bowl hype', modifier: +20 },
      { name: 'Feb', signal: 'sell', reason: 'Super Bowl week — peak demand', modifier: +25 },
      { name: 'Mar', signal: 'hold', reason: 'Free agency moves', modifier: +8 },
      { name: 'Apr', signal: 'sell', reason: 'NFL Draft — rookie card mania', modifier: +30 },
      { name: 'May', signal: 'hold', reason: 'OTAs begin — post-draft settling', modifier: +5 },
      { name: 'Jun', signal: 'buy', reason: 'Dead period — mini-camps only', modifier: -10 },
      { name: 'Jul', signal: 'buy', reason: 'Training camp starts, low action', modifier: -5 },
      { name: 'Aug', signal: 'hold', reason: 'Preseason — rookie hype building', modifier: +3 },
      { name: 'Sep', signal: 'sell', reason: 'Season opener — full demand', modifier: +18 },
      { name: 'Oct', signal: 'hold', reason: 'Mid-season — tracking performance', modifier: +10 },
      { name: 'Nov', signal: 'hold', reason: 'Playoff picture forming', modifier: +12 },
      { name: 'Dec', signal: 'sell', reason: 'Playoff race + holiday buying', modifier: +15 },
    ],
    events: [
      { name: 'Super Bowl', month: 1, impact: '+20-50% for SB players', modifier: 35 },
      { name: 'NFL Draft', month: 3, impact: '+100-500% for top picks', modifier: 50 },
      { name: 'Free Agency', month: 2, impact: '+/-10-30% for movers', modifier: 15 },
      { name: 'Season Opener', month: 8, impact: '+10-20% across the board', modifier: 15 },
      { name: 'Trade Deadline', month: 9, impact: '+/-10-20% for traded players', modifier: 12 },
      { name: 'MVP Award', month: 1, impact: '+15-35% for winner', modifier: 25 },
    ],
    color: 'text-emerald-400',
    accent: 'bg-emerald-950/40 border-emerald-800/40',
  },
  hockey: {
    months: [
      { name: 'Jan', signal: 'hold', reason: 'Mid-season — All-Star talk', modifier: +3 },
      { name: 'Feb', signal: 'sell', reason: 'All-Star Game + trade deadline buzz', modifier: +10 },
      { name: 'Mar', signal: 'sell', reason: 'Trade deadline — big moves', modifier: +15 },
      { name: 'Apr', signal: 'sell', reason: 'Playoffs start — peak hockey', modifier: +18 },
      { name: 'May', signal: 'sell', reason: 'Conference Finals intensity', modifier: +15 },
      { name: 'Jun', signal: 'sell', reason: 'Stanley Cup Finals + NHL Draft', modifier: +20 },
      { name: 'Jul', signal: 'hold', reason: 'Free agency frenzy', modifier: +5 },
      { name: 'Aug', signal: 'buy', reason: 'Dead period — lowest demand', modifier: -15 },
      { name: 'Sep', signal: 'buy', reason: 'Off-season — summer lull', modifier: -10 },
      { name: 'Oct', signal: 'hold', reason: 'Season starts, interest returns', modifier: +3 },
      { name: 'Nov', signal: 'hold', reason: 'Early season — tracking breakouts', modifier: +5 },
      { name: 'Dec', signal: 'hold', reason: 'World Juniors + holiday interest', modifier: +5 },
    ],
    events: [
      { name: 'Trade Deadline', month: 2, impact: '+/-15-30% for traded players', modifier: 20 },
      { name: 'Playoffs Start', month: 3, impact: '+10-25% for contenders', modifier: 20 },
      { name: 'Stanley Cup Finals', month: 5, impact: '+20-50% for finalists', modifier: 35 },
      { name: 'NHL Draft', month: 5, impact: '+50-200% for top picks', modifier: 40 },
      { name: 'Free Agency', month: 6, impact: '+/-10-25% for movers', modifier: 15 },
      { name: 'Hart Trophy', month: 5, impact: '+10-25% for winner', modifier: 20 },
    ],
    color: 'text-sky-400',
    accent: 'bg-sky-950/40 border-sky-800/40',
  },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SPORT_EMOJI: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

export default function FlipWindowClient() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<(typeof sportsCards)[0] | null>(null);

  const currentMonth = new Date().getMonth(); // 0-indexed

  const filteredCards = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => {
        if (sportFilter !== 'all' && c.sport !== sportFilter) return false;
        return c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      })
      .slice(0, 20);
  }, [query, sportFilter]);

  const analysis = useMemo(() => {
    if (!selectedCard) return null;
    const sport = selectedCard.sport;
    const season = SPORT_SEASONS[sport];
    if (!season) return null;

    const rawValue = parseValue(selectedCard.estimatedValueRaw);
    const gemValue = parseValue(selectedCard.estimatedValueGem);
    const isRookie = selectedCard.rookie;

    // Calculate monthly estimated values
    const monthlyValues = season.months.map((m, i) => {
      let mod = m.modifier;
      if (isRookie) mod = Math.round(mod * 1.4); // Rookies are more volatile
      const estRaw = Math.round(rawValue * (1 + mod / 100));
      const estGem = Math.round(gemValue * (1 + mod / 100));
      return { ...m, estRaw: Math.max(1, estRaw), estGem: Math.max(1, estGem), index: i };
    });

    // Best buy and sell months
    const sorted = [...monthlyValues].sort((a, b) => a.modifier - b.modifier);
    const bestBuy = sorted[0];
    const bestSell = sorted[sorted.length - 1];

    // Current month signal
    const current = monthlyValues[currentMonth];

    // Flip profit estimate (buy at lowest, sell at highest)
    const buyPrice = Math.round(rawValue * (1 + bestBuy.modifier / 100));
    const sellPrice = Math.round(rawValue * (1 + bestSell.modifier / 100));
    const flipProfit = sellPrice - buyPrice;
    const flipROI = buyPrice > 0 ? Math.round((flipProfit / buyPrice) * 100) : 0;

    // Upcoming events
    const upcomingEvents = season.events
      .map(e => ({ ...e, monthsAway: ((e.month - currentMonth + 12) % 12) || 12 }))
      .sort((a, b) => a.monthsAway - b.monthsAway);

    return { monthlyValues, bestBuy, bestSell, current, buyPrice, sellPrice, flipProfit, flipROI, upcomingEvents, season };
  }, [selectedCard, currentMonth]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sportFilter === s ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {s === 'all' ? 'All Sports' : `${SPORT_EMOJI[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedCard(null); }}
          placeholder="Search by player name or card..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-600"
        />
        {filteredCards.length > 0 && !selectedCard && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-h-64 overflow-y-auto">
            {filteredCards.map(card => (
              <button
                key={card.slug}
                onClick={() => { setSelectedCard(card); setQuery(card.name); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/30 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm font-medium">{card.player}</span>
                    <span className="text-gray-500 text-xs ml-2">{card.year} {card.set}</span>
                    {card.rookie && <span className="ml-2 text-xs bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded">RC</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-xs">{card.estimatedValueRaw}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Analysis */}
      {selectedCard && analysis && (
        <div className="space-y-6">
          {/* Card info */}
          <div className={`p-5 rounded-2xl border ${analysis.season.accent}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{SPORT_EMOJI[selectedCard.sport]}</span>
                  <span className={`text-sm font-medium ${analysis.season.color}`}>
                    {selectedCard.sport.charAt(0).toUpperCase() + selectedCard.sport.slice(1)}
                  </span>
                  {selectedCard.rookie && <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded-full">Rookie Card</span>}
                </div>
                <h3 className="text-white font-bold text-lg">{selectedCard.name}</h3>
                <div className="text-gray-400 text-sm mt-1">{selectedCard.player} &middot; {selectedCard.year}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Raw</div>
                <div className="text-white font-semibold">{selectedCard.estimatedValueRaw}</div>
                <div className="text-xs text-gray-500 mt-1">Gem</div>
                <div className={`font-semibold ${analysis.season.color}`}>{selectedCard.estimatedValueGem}</div>
              </div>
            </div>
          </div>

          {/* Current Signal */}
          <div className={`p-5 rounded-2xl border ${analysis.current.signal === 'buy' ? 'bg-emerald-950/40 border-emerald-800/40' : analysis.current.signal === 'sell' ? 'bg-amber-950/40 border-amber-800/40' : 'bg-gray-800/40 border-gray-700/40'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Signal — {MONTHS[currentMonth]}</div>
                <div className={`text-2xl font-bold ${analysis.current.signal === 'buy' ? 'text-emerald-400' : analysis.current.signal === 'sell' ? 'text-amber-400' : 'text-gray-300'}`}>
                  {analysis.current.signal === 'buy' ? '🟢 BUY WINDOW' : analysis.current.signal === 'sell' ? '🟡 SELL WINDOW' : '⚪ HOLD'}
                </div>
                <div className="text-gray-400 text-sm mt-1">{analysis.current.reason}</div>
              </div>
              <div className={`text-right text-2xl font-bold ${analysis.current.modifier >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {analysis.current.modifier >= 0 ? '+' : ''}{analysis.current.modifier}%
              </div>
            </div>
          </div>

          {/* Optimal Strategy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/30 rounded-xl">
              <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-2">Best Buy Month</div>
              <div className="text-white text-xl font-bold">{analysis.bestBuy.name}</div>
              <div className="text-gray-400 text-xs mt-1">{analysis.bestBuy.reason}</div>
              <div className="text-emerald-400 text-sm font-semibold mt-2">~${analysis.buyPrice} raw</div>
            </div>
            <div className="p-4 bg-amber-950/30 border border-amber-800/30 rounded-xl">
              <div className="text-amber-400 text-xs font-medium uppercase tracking-wider mb-2">Best Sell Month</div>
              <div className="text-white text-xl font-bold">{analysis.bestSell.name}</div>
              <div className="text-gray-400 text-xs mt-1">{analysis.bestSell.reason}</div>
              <div className="text-amber-400 text-sm font-semibold mt-2">~${analysis.sellPrice} raw</div>
            </div>
            <div className="p-4 bg-violet-950/30 border border-violet-800/30 rounded-xl">
              <div className="text-violet-400 text-xs font-medium uppercase tracking-wider mb-2">Flip Profit</div>
              <div className="text-white text-xl font-bold">${analysis.flipProfit}</div>
              <div className="text-gray-400 text-xs mt-1">Buy {analysis.bestBuy.name} → Sell {analysis.bestSell.name}</div>
              <div className="text-violet-400 text-sm font-semibold mt-2">{analysis.flipROI}% ROI</div>
            </div>
          </div>

          {/* Monthly Calendar */}
          <section>
            <h3 className="text-white font-bold mb-3">12-Month Price Calendar</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {analysis.monthlyValues.map((m, i) => {
                const isCurrent = i === currentMonth;
                const isBest = m.name === analysis.bestBuy.name || m.name === analysis.bestSell.name;
                return (
                  <div
                    key={m.name}
                    className={`p-3 rounded-xl border text-center transition-colors ${isCurrent ? 'ring-2 ring-amber-500' : ''} ${m.signal === 'buy' ? 'bg-emerald-950/30 border-emerald-800/30' : m.signal === 'sell' ? 'bg-amber-950/30 border-amber-800/30' : 'bg-gray-800/30 border-gray-700/30'}`}
                  >
                    <div className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : 'text-gray-400'}`}>{m.name}{isCurrent ? ' ←' : ''}</div>
                    <div className={`text-lg font-bold mt-1 ${m.signal === 'buy' ? 'text-emerald-400' : m.signal === 'sell' ? 'text-amber-400' : 'text-gray-300'}`}>
                      {m.signal === 'buy' ? '↓' : m.signal === 'sell' ? '↑' : '→'}
                    </div>
                    <div className={`text-xs font-medium ${m.modifier >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.modifier >= 0 ? '+' : ''}{m.modifier}%
                    </div>
                    <div className="text-gray-500 text-[10px] mt-1">~${m.estRaw}</div>
                    {isBest && <div className="text-amber-400 text-[10px] mt-0.5">★</div>}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-600 rounded" /> Buy Window</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-600 rounded" /> Sell Window</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-600 rounded" /> Hold</span>
            </div>
          </section>

          {/* Upcoming Events */}
          <section>
            <h3 className="text-white font-bold mb-3">Upcoming Events That Move This Card</h3>
            <div className="space-y-2">
              {analysis.upcomingEvents.slice(0, 5).map((e, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/40 border border-gray-700/30 rounded-xl">
                  <div>
                    <div className="text-white text-sm font-medium">{e.name}</div>
                    <div className="text-gray-500 text-xs">{MONTHS[e.month]} &middot; {e.monthsAway === 12 ? 'This month' : `${e.monthsAway} month${e.monthsAway !== 1 ? 's' : ''} away`}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${e.modifier > 20 ? 'text-amber-400' : 'text-gray-300'}`}>+{e.modifier}%</div>
                    <div className="text-gray-500 text-xs">{e.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strategy Tips */}
          <section className="p-5 bg-gray-800/40 border border-gray-700/50 rounded-2xl">
            <h3 className="text-white font-bold mb-3">Flip Strategy Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {selectedCard.rookie
                  ? 'Rookie cards are 40% more volatile than base cards — wider buy/sell windows mean bigger potential profits.'
                  : 'Base/veteran cards have tighter price swings — focus on event-driven spikes for flip opportunities.'}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                Best time to buy {selectedCard.sport} cards is {analysis.bestBuy.name} — {analysis.bestBuy.reason.toLowerCase()}.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                Sell into hype, not after it peaks. List 1-2 days before major events, not the day of.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                Factor in eBay fees (~13%), shipping (~$4-5 per card), and grading costs when calculating actual flip profit.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {parseValue(selectedCard.estimatedValueGem) > 100
                  ? 'At this value level, grading before selling can significantly increase your margin — check the Grading ROI Calculator.'
                  : 'At this value level, selling raw may be more profitable than paying for grading — keep costs low.'}
              </li>
            </ul>
          </section>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/sports/${selectedCard.slug}`} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-colors">
              View Card Details →
            </Link>
            <Link href={`/players/${slugifyPlayer(selectedCard.player)}`} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700">
              Player Profile →
            </Link>
            <a href={selectedCard.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700">
              Search eBay →
            </a>
            <Link href="/tools/flip-calc" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors border border-gray-700">
              Flip Profit Calculator →
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedCard && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-lg">Search for a card to see its optimal flip window</p>
          <p className="text-sm mt-1">We analyze seasonal patterns, events, and market cycles for all 4 sports</p>
        </div>
      )}
    </div>
  );
}
