'use client';

import { useState } from 'react';
import Link from 'next/link';

type Signal = 'buy' | 'sell' | 'hold';

interface MonthEvent {
  name: string;
  sport: string;
  impact: 'high' | 'medium' | 'low';
  approxDate: string;
}

interface MonthData {
  month: string;
  shortMonth: string;
  signals: { baseball: Signal; basketball: Signal; football: Signal; hockey: Signal };
  mood: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  tip: string;
  events: MonthEvent[];
}

const MONTHS: MonthData[] = [
  {
    month: 'January', shortMonth: 'Jan',
    signals: { baseball: 'buy', basketball: 'hold', football: 'sell', hockey: 'hold' },
    mood: 'neutral',
    summary: 'NFL playoffs dominate attention. Football card prices peak as contenders advance. Baseball cards sit at annual lows during the off-season — smart buyers accumulate. Basketball mid-season keeps prices stable.',
    tip: 'Best time of year to buy baseball cards. Sellers are distracted by football playoffs and nobody is thinking about spring training yet. Target undervalued stars whose teams made off-season upgrades.',
    events: [
      { name: 'NFL Divisional Round', sport: 'football', impact: 'high', approxDate: 'Jan 18-19' },
      { name: 'NFL Conference Championships', sport: 'football', impact: 'high', approxDate: 'Jan 26' },
      { name: 'NHL Winter Classic', sport: 'hockey', impact: 'medium', approxDate: 'Jan 1' },
      { name: 'NBA Christmas Hangover Rally', sport: 'basketball', impact: 'low', approxDate: 'Early Jan' },
    ],
  },
  {
    month: 'February', shortMonth: 'Feb',
    signals: { baseball: 'buy', basketball: 'sell', football: 'sell', hockey: 'hold' },
    mood: 'bullish',
    summary: 'Super Bowl creates peak football card demand. NBA All-Star weekend spikes interest in featured players. Spring Training news starts trickling in. NHL trade deadline creates hockey card volatility.',
    tip: 'Sell football cards the week before Super Bowl — not after. Winners get a brief spike but interest drops fast once the season ends. Buy the dip on football cards in late February.',
    events: [
      { name: 'Super Bowl', sport: 'football', impact: 'high', approxDate: 'Feb 9' },
      { name: 'NBA All-Star Weekend', sport: 'basketball', impact: 'high', approxDate: 'Feb 14-16' },
      { name: 'Spring Training Reports', sport: 'baseball', impact: 'medium', approxDate: 'Feb 15+' },
      { name: 'NHL Trade Deadline Buzz', sport: 'hockey', impact: 'medium', approxDate: 'Late Feb' },
    ],
  },
  {
    month: 'March', shortMonth: 'Mar',
    signals: { baseball: 'hold', basketball: 'hold', football: 'buy', hockey: 'hold' },
    mood: 'neutral',
    summary: 'March Madness drives interest in college stars entering NBA/NFL drafts. Football enters quiet period — prime buying window. Spring Training heats up. NHL enters playoff push stretch.',
    tip: 'March Madness standouts see card price spikes. If a player has a breakout tournament performance, their existing cards jump. Position before the tournament starts for prospects you believe in.',
    events: [
      { name: 'March Madness Begins', sport: 'basketball', impact: 'high', approxDate: 'Mar 18' },
      { name: 'Spring Training Games', sport: 'baseball', impact: 'medium', approxDate: 'All month' },
      { name: 'NFL Free Agency Opens', sport: 'football', impact: 'high', approxDate: 'Mar 12' },
      { name: 'NHL Trade Deadline', sport: 'hockey', impact: 'high', approxDate: 'Mar 7' },
    ],
  },
  {
    month: 'April', shortMonth: 'Apr',
    signals: { baseball: 'sell', basketball: 'sell', football: 'sell', hockey: 'sell' },
    mood: 'bullish',
    summary: 'The busiest month in cards. MLB Opening Day creates baseball buzz. NBA playoffs start. NFL Draft spikes prospect card prices. NHL playoffs begin. Every sport is active simultaneously.',
    tip: 'This is SELL month for short-term flippers — demand is high across all sports. Long-term holders should stay patient. NFL Draft night is the single biggest price swing event of the year for prospect cards.',
    events: [
      { name: 'MLB Opening Day', sport: 'baseball', impact: 'high', approxDate: 'Apr 1' },
      { name: 'NBA Playoffs Begin', sport: 'basketball', impact: 'high', approxDate: 'Apr 19' },
      { name: 'NFL Draft', sport: 'football', impact: 'high', approxDate: 'Apr 24-26' },
      { name: 'NHL Playoffs Begin', sport: 'hockey', impact: 'high', approxDate: 'Apr 19' },
      { name: 'March Madness Final Four', sport: 'basketball', impact: 'high', approxDate: 'Apr 5-7' },
    ],
  },
  {
    month: 'May', shortMonth: 'May',
    signals: { baseball: 'hold', basketball: 'sell', football: 'buy', hockey: 'sell' },
    mood: 'neutral',
    summary: 'NBA and NHL conference finals create star-driven demand spikes. Post-draft football card prices settle into a correction. MLB season is in full swing with early storylines emerging.',
    tip: 'Buy NFL Draft picks 2-3 weeks after the draft. The hype premium fades fast. Players who fell in the draft are especially undervalued — their card prices overcorrect downward.',
    events: [
      { name: 'NBA Conference Finals', sport: 'basketball', impact: 'high', approxDate: 'Mid-May' },
      { name: 'NHL Conference Finals', sport: 'hockey', impact: 'high', approxDate: 'Mid-May' },
      { name: 'Post-NFL Draft Settling', sport: 'football', impact: 'medium', approxDate: 'Early May' },
      { name: 'MLB Early Season Storylines', sport: 'baseball', impact: 'medium', approxDate: 'All month' },
    ],
  },
  {
    month: 'June', shortMonth: 'Jun',
    signals: { baseball: 'hold', basketball: 'sell', football: 'buy', hockey: 'sell' },
    mood: 'neutral',
    summary: 'NBA Finals and Stanley Cup Finals dominate. Championship winners see massive card spikes. MLB Draft brings new prospect names. Football is in the quiet OTA period — accumulation time.',
    tip: 'Championship winners spike 30-50% the night they win. This is a SELL signal, not a buy signal. The spike rarely holds past 2 weeks. Position before the finals start, not after.',
    events: [
      { name: 'NBA Finals', sport: 'basketball', impact: 'high', approxDate: 'Jun 5-22' },
      { name: 'Stanley Cup Finals', sport: 'hockey', impact: 'high', approxDate: 'Jun 7-25' },
      { name: 'MLB Draft', sport: 'baseball', impact: 'medium', approxDate: 'Jun 15-17' },
      { name: 'NFL OTAs / Minicamp', sport: 'football', impact: 'low', approxDate: 'All month' },
    ],
  },
  {
    month: 'July', shortMonth: 'Jul',
    signals: { baseball: 'sell', basketball: 'buy', football: 'hold', hockey: 'buy' },
    mood: 'bearish',
    summary: 'MLB All-Star break is peak baseball card interest. NBA and NHL enter deep off-season — lowest prices of the year for basketball and hockey. NFL training camp buzz starts building late in the month.',
    tip: 'Best buying window for basketball and hockey cards. The off-season depression hits hard in July. Target future Hall of Famers and young stars whose prices have cooled 20-30% from playoff peaks.',
    events: [
      { name: 'MLB All-Star Game', sport: 'baseball', impact: 'high', approxDate: 'Jul 15' },
      { name: 'NBA Summer League', sport: 'basketball', impact: 'medium', approxDate: 'Jul 12-21' },
      { name: 'NFL Training Camp Opens', sport: 'football', impact: 'medium', approxDate: 'Jul 23' },
      { name: 'NHL Free Agency', sport: 'hockey', impact: 'medium', approxDate: 'Jul 1' },
    ],
  },
  {
    month: 'August', shortMonth: 'Aug',
    signals: { baseball: 'sell', basketball: 'buy', football: 'hold', hockey: 'buy' },
    mood: 'neutral',
    summary: 'MLB trade deadline creates card volatility — traded stars spike. Basketball and hockey still in deep off-season dip. NFL preseason starts generating buzz for rookies.',
    tip: 'The MLB Trade Deadline (late July/early August) creates 24-48 hour price windows. Stars traded to contenders spike 15-25%. If you own cards of likely trade targets, set your ask price before the deadline.',
    events: [
      { name: 'MLB Trade Deadline', sport: 'baseball', impact: 'high', approxDate: 'Jul 30' },
      { name: 'NFL Preseason Games', sport: 'football', impact: 'medium', approxDate: 'Aug 1-25' },
      { name: 'NBA Off-Season Trades', sport: 'basketball', impact: 'medium', approxDate: 'All month' },
      { name: 'Hockey Off-Season', sport: 'hockey', impact: 'low', approxDate: 'All month' },
    ],
  },
  {
    month: 'September', shortMonth: 'Sep',
    signals: { baseball: 'sell', basketball: 'buy', football: 'sell', hockey: 'buy' },
    mood: 'bullish',
    summary: 'NFL season kicks off creating massive football card demand. MLB playoff races heat up. NBA preseason approaches. NHL preseason begins. The card market accelerates into Q4.',
    tip: 'NFL Week 1 is the second-biggest football card price event after the Draft. Breakout performers see 50-100% card spikes in the first 3 weeks. Position on sleeper rookies before Week 1.',
    events: [
      { name: 'NFL Season Opener', sport: 'football', impact: 'high', approxDate: 'Sep 4' },
      { name: 'MLB Playoff Race', sport: 'baseball', impact: 'high', approxDate: 'All month' },
      { name: 'NBA Training Camps', sport: 'basketball', impact: 'medium', approxDate: 'Late Sep' },
      { name: 'NHL Preseason', sport: 'hockey', impact: 'medium', approxDate: 'Late Sep' },
    ],
  },
  {
    month: 'October', shortMonth: 'Oct',
    signals: { baseball: 'sell', basketball: 'sell', football: 'hold', hockey: 'sell' },
    mood: 'bullish',
    summary: 'Four sports running simultaneously. World Series creates baseball demand spikes. NBA and NHL seasons open. NFL is in peak mid-season form. The card market is at its most active.',
    tip: 'October is SELL month for baseball cards — World Series performers spike and casual buyers flood the market. For NBA and NHL, opening week creates a brief demand bump for featured players on national TV.',
    events: [
      { name: 'MLB Postseason / World Series', sport: 'baseball', impact: 'high', approxDate: 'All month' },
      { name: 'NBA Season Opens', sport: 'basketball', impact: 'high', approxDate: 'Oct 21' },
      { name: 'NHL Season Opens', sport: 'hockey', impact: 'high', approxDate: 'Oct 7' },
      { name: 'NFL Mid-Season', sport: 'football', impact: 'medium', approxDate: 'All month' },
    ],
  },
  {
    month: 'November', shortMonth: 'Nov',
    signals: { baseball: 'buy', basketball: 'hold', football: 'sell', hockey: 'hold' },
    mood: 'neutral',
    summary: 'Football dominates the market as MVP races take shape. Baseball enters off-season — buying opportunity. NBA settling into regular season. Holiday gift-buying starts pushing prices up across all sports.',
    tip: 'Baseball off-season is a great buying window, BUT holiday gift demand starts lifting all card prices in late November. Buy your baseball targets before Thanksgiving. Black Friday deals exist for sealed product.',
    events: [
      { name: 'NFL MVP Race Heats Up', sport: 'football', impact: 'high', approxDate: 'All month' },
      { name: 'MLB Awards (MVP, Cy Young)', sport: 'baseball', impact: 'medium', approxDate: 'Nov 18-21' },
      { name: 'NBA Early Season Standouts', sport: 'basketball', impact: 'medium', approxDate: 'All month' },
      { name: 'Black Friday Card Deals', sport: 'baseball', impact: 'medium', approxDate: 'Nov 28' },
    ],
  },
  {
    month: 'December', shortMonth: 'Dec',
    signals: { baseball: 'buy', basketball: 'sell', football: 'sell', hockey: 'hold' },
    mood: 'bullish',
    summary: 'Holiday gift season drives peak retail demand across all sports. NBA Christmas Day games spike featured players. NFL playoff picture crystallizes. Baseball Hot Stove trades create buzz.',
    tip: 'Holiday season inflates card prices 10-20% for gift-friendly items (sealed product, graded iconic cards). Sell anything you want to move during December. Buy baseball deep cuts during Hot Stove — big signings spike whole-team card interest.',
    events: [
      { name: 'NBA Christmas Day Games', sport: 'basketball', impact: 'high', approxDate: 'Dec 25' },
      { name: 'NFL Playoff Picture', sport: 'football', impact: 'high', approxDate: 'Late Dec' },
      { name: 'Baseball Hot Stove', sport: 'baseball', impact: 'medium', approxDate: 'All month' },
      { name: 'Holiday Gift Season Peak', sport: 'baseball', impact: 'high', approxDate: 'Dec 15-25' },
    ],
  },
];

const SPORT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  baseball: { label: 'Baseball', icon: '⚾', color: 'text-red-400' },
  basketball: { label: 'Basketball', icon: '🏀', color: 'text-orange-400' },
  football: { label: 'Football', icon: '🏈', color: 'text-green-400' },
  hockey: { label: 'Hockey', icon: '🏒', color: 'text-cyan-400' },
};

const SIGNAL_CONFIG: Record<Signal, { label: string; bg: string; text: string; border: string; dot: string }> = {
  buy: { label: 'BUY', bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-700/40', dot: 'bg-emerald-400' },
  sell: { label: 'SELL', bg: 'bg-red-950/60', text: 'text-red-400', border: 'border-red-700/40', dot: 'bg-red-400' },
  hold: { label: 'HOLD', bg: 'bg-amber-950/60', text: 'text-amber-400', border: 'border-amber-700/40', dot: 'bg-amber-400' },
};

const MOOD_CONFIG: Record<string, { label: string; color: string }> = {
  bullish: { label: 'Bullish', color: 'text-emerald-400' },
  bearish: { label: 'Bearish', color: 'text-red-400' },
  neutral: { label: 'Neutral', color: 'text-amber-400' },
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'bg-red-900/40 border-red-700/50 text-red-300',
  medium: 'bg-amber-900/40 border-amber-700/50 text-amber-300',
  low: 'bg-slate-800/40 border-slate-600/50 text-slate-300',
};

function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

export default function SeasonalCalendarClient() {
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentMonthIndex());
  const [sportFilter, setSportFilter] = useState<string>('all');

  const currentMonthIdx = getCurrentMonthIndex();
  const month = MONTHS[selectedMonth];

  const sportKeys = ['baseball', 'basketball', 'football', 'hockey'] as const;
  const filteredSports = sportFilter === 'all' ? sportKeys : sportKeys.filter(s => s === sportFilter);

  // Count signals across the year
  const yearSignals = { buy: 0, sell: 0, hold: 0 };
  for (const m of MONTHS) {
    for (const s of sportKeys) {
      yearSignals[m.signals[s]]++;
    }
  }

  return (
    <div className="space-y-8">
      {/* Sport Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSportFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sportFilter === 'all' ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}
        >
          All Sports
        </button>
        {sportKeys.map(sport => (
          <button
            key={sport}
            onClick={() => setSportFilter(sport)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sportFilter === sport ? 'bg-white/10 text-white border border-white/20' : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}
          >
            {SPORT_LABELS[sport].icon} {SPORT_LABELS[sport].label}
          </button>
        ))}
      </div>

      {/* Year-at-a-Glance Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {MONTHS.map((m, idx) => {
          const isSelected = idx === selectedMonth;
          const isCurrent = idx === currentMonthIdx;

          return (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(idx)}
              className={`relative p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white/10 border-white/30 ring-1 ring-white/20'
                  : isCurrent
                    ? 'bg-blue-950/30 border-blue-700/40 hover:bg-blue-950/50'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
              }`}
            >
              {isCurrent && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
              <div className="text-xs font-semibold text-white/80 mb-2">{m.shortMonth}</div>
              <div className="flex flex-col gap-1">
                {filteredSports.map(sport => {
                  const sig = SIGNAL_CONFIG[m.signals[sport]];
                  return (
                    <div key={sport} className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${sig.dot}`} />
                      <span className="text-[10px] text-white/50">{SPORT_LABELS[sport].icon}</span>
                      <span className={`text-[10px] font-medium ${sig.text}`}>{sig.label}</span>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Annual Summary Bar */}
      <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <span className="text-sm text-white/60">Year Overview:</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">{yearSignals.buy} Buy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm text-red-400 font-medium">{yearSignals.sell} Sell</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-sm text-amber-400 font-medium">{yearSignals.hold} Hold</span>
        </div>
      </div>

      {/* Selected Month Detail */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {/* Month Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{month.month}</h2>
                {selectedMonth === currentMonthIdx && (
                  <span className="px-2 py-0.5 bg-blue-950/60 border border-blue-700/50 text-blue-400 text-xs font-medium rounded-full">Current Month</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-white/50">Market Mood:</span>
                <span className={`text-sm font-semibold ${MOOD_CONFIG[month.mood].color}`}>
                  {month.mood === 'bullish' ? '↑' : month.mood === 'bearish' ? '↓' : '→'} {MOOD_CONFIG[month.mood].label}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMonth(selectedMonth === 0 ? 11 : selectedMonth - 1)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 text-sm"
              >
                ← {MONTHS[selectedMonth === 0 ? 11 : selectedMonth - 1].shortMonth}
              </button>
              <button
                onClick={() => setSelectedMonth(selectedMonth === 11 ? 0 : selectedMonth + 1)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 text-sm"
              >
                {MONTHS[selectedMonth === 11 ? 0 : selectedMonth + 1].shortMonth} →
              </button>
            </div>
          </div>
        </div>

        {/* Signals Grid */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Buy / Sell / Hold Signals</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sportKeys.map(sport => {
              const sig = SIGNAL_CONFIG[month.signals[sport]];
              return (
                <div key={sport} className={`p-4 rounded-xl border ${sig.bg} ${sig.border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{SPORT_LABELS[sport].icon}</span>
                    <span className="text-sm font-medium text-white/80">{SPORT_LABELS[sport].label}</span>
                  </div>
                  <div className={`text-xl font-bold ${sig.text}`}>{sig.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Market Summary</h3>
          <p className="text-white/80 leading-relaxed">{month.summary}</p>
        </div>

        {/* Key Events */}
        <div className="p-6 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Key Events</h3>
          <div className="space-y-2">
            {month.events.map((evt, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">{SPORT_LABELS[evt.sport]?.icon ?? '📅'}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white/90 truncate">{evt.name}</div>
                    <div className="text-xs text-white/50">{evt.approxDate}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border flex-shrink-0 ${IMPACT_COLORS[evt.impact]}`}>
                  {evt.impact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Tip */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Pro Tip</h3>
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">💡</span>
              <p className="text-emerald-300/90 text-sm leading-relaxed">{month.tip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sport Annual Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sportKeys.map(sport => {
          const buyMonths = MONTHS.filter(m => m.signals[sport] === 'buy').map(m => m.shortMonth);
          const sellMonths = MONTHS.filter(m => m.signals[sport] === 'sell').map(m => m.shortMonth);
          const holdMonths = MONTHS.filter(m => m.signals[sport] === 'hold').map(m => m.shortMonth);

          return (
            <div key={sport} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{SPORT_LABELS[sport].icon}</span>
                <h3 className="text-lg font-bold text-white">{SPORT_LABELS[sport].label} Annual Pattern</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-1">Best to Buy</div>
                  <div className="flex flex-wrap gap-1.5">
                    {buyMonths.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-emerald-950/50 border border-emerald-700/40 text-emerald-400 text-xs rounded-full">{m}</span>
                    ))}
                    {buyMonths.length === 0 && <span className="text-xs text-white/40">No clear buy windows</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-red-400 mb-1">Best to Sell</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sellMonths.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-red-950/50 border border-red-700/40 text-red-400 text-xs rounded-full">{m}</span>
                    ))}
                    {sellMonths.length === 0 && <span className="text-xs text-white/40">No clear sell windows</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-400 mb-1">Hold / Neutral</div>
                  <div className="flex flex-wrap gap-1.5">
                    {holdMonths.map(m => (
                      <span key={m} className="px-2 py-0.5 bg-amber-950/50 border border-amber-700/40 text-amber-400 text-xs rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Mini year bar */}
              <div className="mt-4 flex gap-0.5 rounded-full overflow-hidden">
                {MONTHS.map((m, i) => {
                  const sig = m.signals[sport];
                  const color = sig === 'buy' ? 'bg-emerald-500' : sig === 'sell' ? 'bg-red-500' : 'bg-amber-500';
                  return (
                    <div
                      key={i}
                      className={`h-2 flex-1 ${color} ${i === currentMonthIdx ? 'ring-1 ring-white' : ''}`}
                      title={`${m.shortMonth}: ${sig.toUpperCase()}`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[9px] text-white/30 mt-1">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seasonal Strategy Quick Reference */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Seasonal Strategy Quick Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 text-white/60 font-medium">Month</th>
                {sportKeys.map(s => (
                  <th key={s} className="text-center py-2 px-2 text-white/60 font-medium">{SPORT_LABELS[s].icon}</th>
                ))}
                <th className="text-center py-2 pl-4 text-white/60 font-medium">Mood</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((m, idx) => (
                <tr
                  key={m.month}
                  className={`border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                    idx === selectedMonth ? 'bg-white/[0.06]' : ''
                  } ${idx === currentMonthIdx ? 'bg-blue-950/20' : ''}`}
                  onClick={() => setSelectedMonth(idx)}
                >
                  <td className="py-2 pr-4 text-white/80 font-medium">
                    {m.shortMonth}
                    {idx === currentMonthIdx && <span className="ml-1 text-blue-400 text-xs">●</span>}
                  </td>
                  {sportKeys.map(s => {
                    const sig = SIGNAL_CONFIG[m.signals[s]];
                    return (
                      <td key={s} className="text-center py-2 px-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${sig.text} ${sig.bg}`}>
                          {sig.label}
                        </span>
                      </td>
                    );
                  })}
                  <td className={`text-center py-2 pl-4 text-xs font-medium ${MOOD_CONFIG[m.mood].color}`}>
                    {m.mood === 'bullish' ? '↑' : m.mood === 'bearish' ? '↓' : '→'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Links */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Related Tools & Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/market-analysis', title: 'Daily Market Analysis', desc: 'What moved today and why' },
            { href: '/market-data', title: 'Market Data Room', desc: 'Comprehensive market statistics' },
            { href: '/market-movers', title: 'Market Movers', desc: 'Today\'s biggest gainers and losers' },
            { href: '/investment-thesis', title: 'Investment Thesis', desc: 'Bull/bear case for any card' },
            { href: '/tools/seasonality', title: 'Seasonality Guide', desc: 'Sport-by-sport seasonal patterns' },
            { href: '/hobby-timeline', title: 'Hobby Timeline', desc: '140 years of card collecting history' },
            { href: '/market-heatmap', title: 'Market Heat Map', desc: 'Visual temperature for every segment' },
            { href: '/card-catalysts', title: 'Price Catalysts', desc: 'Events that move card prices' },
            { href: '/ticker', title: 'Live Price Ticker', desc: 'Scrolling real-time card prices' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/90">{link.title}</div>
                <div className="text-xs text-white/50">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
