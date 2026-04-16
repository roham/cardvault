'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type CardType = 'rookie' | 'veteran-star' | 'vintage' | 'prospect' | 'sealed';

interface MonthData {
  month: string;
  shortMonth: string;
  buyScore: number; // -100 to +100, negative = sell, positive = buy
  events: string[];
  action: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell';
}

interface SportCalendar {
  sport: Sport;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  months: MonthData[];
  bestBuyMonths: string;
  bestSellMonths: string;
  keyInsight: string;
}

const cardTypes: { value: CardType; label: string; desc: string }[] = [
  { value: 'rookie', label: 'Rookie Cards', desc: 'First-year player cards' },
  { value: 'veteran-star', label: 'Veteran Stars', desc: 'Established stars & HOFers' },
  { value: 'vintage', label: 'Vintage (pre-1990)', desc: 'Classic & vintage cards' },
  { value: 'prospect', label: 'Prospects', desc: 'Pre-debut prospect cards' },
  { value: 'sealed', label: 'Sealed Product', desc: 'Boxes, packs, cases' },
];

function getCalendar(sport: Sport, cardType: CardType): SportCalendar {
  const baseCalendars: Record<Sport, SportCalendar> = {
    baseball: {
      sport: 'baseball',
      label: 'Baseball',
      color: 'text-red-400',
      bgColor: 'bg-red-950/40',
      borderColor: 'border-red-800/50',
      bestBuyMonths: 'November - January',
      bestSellMonths: 'March - April, July (All-Star)',
      keyInsight: 'Baseball card prices peak during Spring Training hype and around the All-Star break. The offseason (Nov-Jan) offers the deepest discounts as collector attention shifts to football and basketball.',
      months: [
        { month: 'January', shortMonth: 'Jan', buyScore: 70, events: ['Hall of Fame ballot results', 'Hot Stove signings'], action: 'strong-buy' },
        { month: 'February', shortMonth: 'Feb', buyScore: 40, events: ['Spring Training begins', 'Topps Series 1 release'], action: 'buy' },
        { month: 'March', shortMonth: 'Mar', buyScore: -30, events: ['Opening Day hype', 'WBC years'], action: 'sell' },
        { month: 'April', shortMonth: 'Apr', buyScore: -50, events: ['Opening Day', 'Early season breakouts'], action: 'strong-sell' },
        { month: 'May', shortMonth: 'May', buyScore: -20, events: ['Bowman release', 'Prospect hype'], action: 'sell' },
        { month: 'June', shortMonth: 'Jun', buyScore: 10, events: ['MLB Draft', 'Bowman Draft hype fades'], action: 'hold' },
        { month: 'July', shortMonth: 'Jul', buyScore: -40, events: ['All-Star Game', 'Trade deadline buzz'], action: 'sell' },
        { month: 'August', shortMonth: 'Aug', buyScore: 20, events: ['Post-deadline settling', 'Topps Update preview'], action: 'buy' },
        { month: 'September', shortMonth: 'Sep', buyScore: 10, events: ['Playoff race heats up', 'Call-ups'], action: 'hold' },
        { month: 'October', shortMonth: 'Oct', buyScore: -20, events: ['Postseason', 'World Series heroes spike'], action: 'sell' },
        { month: 'November', shortMonth: 'Nov', buyScore: 80, events: ['Season ends', 'Football takes over', 'Prices dip'], action: 'strong-buy' },
        { month: 'December', shortMonth: 'Dec', buyScore: 60, events: ['Holiday deals', 'Offseason lull'], action: 'strong-buy' },
      ],
    },
    basketball: {
      sport: 'basketball',
      label: 'Basketball',
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/40',
      borderColor: 'border-orange-800/50',
      bestBuyMonths: 'July - September',
      bestSellMonths: 'October - November, February (All-Star)',
      keyInsight: 'Basketball cards are cheapest during the NBA offseason (Jul-Sep) when attention shifts to baseball and football. The season opener and All-Star weekend create the biggest demand spikes.',
      months: [
        { month: 'January', shortMonth: 'Jan', buyScore: -10, events: ['Mid-season push', 'All-Star voting'], action: 'hold' },
        { month: 'February', shortMonth: 'Feb', buyScore: -50, events: ['All-Star Weekend', 'Rising Stars'], action: 'strong-sell' },
        { month: 'March', shortMonth: 'Mar', buyScore: 10, events: ['Playoff positioning', 'March Madness distraction'], action: 'hold' },
        { month: 'April', shortMonth: 'Apr', buyScore: -30, events: ['Playoffs begin', 'Playoff performer spikes'], action: 'sell' },
        { month: 'May', shortMonth: 'May', buyScore: -20, events: ['Conference Finals'], action: 'sell' },
        { month: 'June', shortMonth: 'Jun', buyScore: -40, events: ['NBA Finals', 'NBA Draft', 'Champion cards spike'], action: 'sell' },
        { month: 'July', shortMonth: 'Jul', buyScore: 70, events: ['Free agency', 'Summer League', 'Season ends'], action: 'strong-buy' },
        { month: 'August', shortMonth: 'Aug', buyScore: 80, events: ['Dead period', 'Lowest attention'], action: 'strong-buy' },
        { month: 'September', shortMonth: 'Sep', buyScore: 60, events: ['Pre-season hype building', 'Prizm release window'], action: 'strong-buy' },
        { month: 'October', shortMonth: 'Oct', buyScore: -50, events: ['Season opener', 'Rookie debut hype'], action: 'strong-sell' },
        { month: 'November', shortMonth: 'Nov', buyScore: -30, events: ['Early season breakouts', 'Prizm mania'], action: 'sell' },
        { month: 'December', shortMonth: 'Dec', buyScore: 20, events: ['Holiday deals', 'Mid-season reset'], action: 'buy' },
      ],
    },
    football: {
      sport: 'football',
      label: 'Football',
      color: 'text-green-400',
      bgColor: 'bg-green-950/40',
      borderColor: 'border-green-800/50',
      bestBuyMonths: 'March - June',
      bestSellMonths: 'September - October, January (Playoffs)',
      keyInsight: 'Football cards follow the NFL calendar tightly. The offseason (Mar-Jun) is the buying window. Prices spike hardest at the season opener and during playoff runs. Draft picks create short-lived hype cycles.',
      months: [
        { month: 'January', shortMonth: 'Jan', buyScore: -60, events: ['NFL Playoffs', 'Super Bowl hype'], action: 'strong-sell' },
        { month: 'February', shortMonth: 'Feb', buyScore: -30, events: ['Super Bowl', 'Combine buzz starts'], action: 'sell' },
        { month: 'March', shortMonth: 'Mar', buyScore: 50, events: ['Free agency', 'Combine', 'Post-SB dip'], action: 'buy' },
        { month: 'April', shortMonth: 'Apr', buyScore: 30, events: ['NFL Draft', 'Draft pick hype spikes'], action: 'buy' },
        { month: 'May', shortMonth: 'May', buyScore: 70, events: ['Post-draft settling', 'OTAs'], action: 'strong-buy' },
        { month: 'June', shortMonth: 'Jun', buyScore: 80, events: ['Dead period', 'Minicamp', 'Lowest prices'], action: 'strong-buy' },
        { month: 'July', shortMonth: 'Jul', buyScore: 40, events: ['Training camp', 'Hype building'], action: 'buy' },
        { month: 'August', shortMonth: 'Aug', buyScore: 10, events: ['Preseason', 'Prizm Football release'], action: 'hold' },
        { month: 'September', shortMonth: 'Sep', buyScore: -70, events: ['Season opener', 'Week 1 breakouts'], action: 'strong-sell' },
        { month: 'October', shortMonth: 'Oct', buyScore: -40, events: ['Mid-season push', 'Bye week patterns'], action: 'sell' },
        { month: 'November', shortMonth: 'Nov', buyScore: -20, events: ['Playoff picture forming', 'Optic release'], action: 'sell' },
        { month: 'December', shortMonth: 'Dec', buyScore: -10, events: ['Playoff race', 'Holiday buying'], action: 'hold' },
      ],
    },
    hockey: {
      sport: 'hockey',
      label: 'Hockey',
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-800/50',
      bestBuyMonths: 'July - September',
      bestSellMonths: 'October (YG release), April-June (Playoffs)',
      keyInsight: 'Hockey card prices revolve around Upper Deck Young Guns releases (typically October). The summer offseason offers deep discounts. Stanley Cup playoff runs create short-term spikes for contender players.',
      months: [
        { month: 'January', shortMonth: 'Jan', buyScore: 10, events: ['Mid-season', 'All-Star voting'], action: 'hold' },
        { month: 'February', shortMonth: 'Feb', buyScore: -20, events: ['All-Star Weekend', 'Trade deadline approaching'], action: 'sell' },
        { month: 'March', shortMonth: 'Mar', buyScore: -30, events: ['Trade deadline', 'Playoff push'], action: 'sell' },
        { month: 'April', shortMonth: 'Apr', buyScore: -40, events: ['Playoffs begin', 'Playoff hero spikes'], action: 'sell' },
        { month: 'May', shortMonth: 'May', buyScore: -30, events: ['Conference Finals'], action: 'sell' },
        { month: 'June', shortMonth: 'Jun', buyScore: -10, events: ['Stanley Cup Finals', 'NHL Draft'], action: 'hold' },
        { month: 'July', shortMonth: 'Jul', buyScore: 70, events: ['Free agency', 'Season ends', 'Dead period'], action: 'strong-buy' },
        { month: 'August', shortMonth: 'Aug', buyScore: 80, events: ['Lowest attention', 'Best deals'], action: 'strong-buy' },
        { month: 'September', shortMonth: 'Sep', buyScore: 50, events: ['Pre-season', 'Young Guns anticipation'], action: 'buy' },
        { month: 'October', shortMonth: 'Oct', buyScore: -60, events: ['Young Guns release', 'Season opener'], action: 'strong-sell' },
        { month: 'November', shortMonth: 'Nov', buyScore: 20, events: ['Post-YG settling', 'World Juniors hype'], action: 'buy' },
        { month: 'December', shortMonth: 'Dec', buyScore: 30, events: ['World Juniors', 'Holiday deals'], action: 'buy' },
      ],
    },
  };

  const calendar = { ...baseCalendars[sport] };

  // Adjust based on card type
  if (cardType === 'vintage') {
    calendar.keyInsight = `Vintage ${calendar.label.toLowerCase()} cards are less seasonal than modern cards. Major auction house cycles (Heritage Auctions in Feb/Aug, Goldin year-round) matter more. ` + calendar.keyInsight;
    calendar.months = calendar.months.map(m => ({
      ...m,
      buyScore: Math.round(m.buyScore * 0.5), // Vintage is less volatile
      action: Math.abs(m.buyScore * 0.5) < 15 ? 'hold' : m.action,
    }));
  } else if (cardType === 'prospect') {
    calendar.keyInsight = `Prospect cards are most volatile around draft/debut dates. Buy well before callup rumors start, sell into the hype — most prospects lose value after their first full season. ` + calendar.keyInsight;
  } else if (cardType === 'sealed') {
    calendar.keyInsight = `Sealed product appreciates best 2-5 years after release when supply dries up. Buy at retail on release day if possible. Hobby boxes outperform retail long-term. ` + calendar.keyInsight;
    calendar.months = calendar.months.map(m => ({
      ...m,
      buyScore: Math.round(m.buyScore * 0.4), // Sealed is very stable
      action: Math.abs(m.buyScore * 0.4) < 15 ? 'hold' : (m.buyScore * 0.4 > 0 ? 'buy' : 'sell'),
    }));
  }

  // Recalculate actions based on adjusted scores
  calendar.months = calendar.months.map(m => ({
    ...m,
    action: m.buyScore >= 50 ? 'strong-buy' : m.buyScore >= 20 ? 'buy' : m.buyScore > -20 ? 'hold' : m.buyScore > -40 ? 'sell' : 'strong-sell',
  }));

  return calendar;
}

function getCurrentMonthIndex(): number {
  return new Date().getMonth();
}

const actionColors: Record<string, { bg: string; text: string; label: string }> = {
  'strong-buy': { bg: 'bg-emerald-500/30', text: 'text-emerald-400', label: 'STRONG BUY' },
  'buy': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', label: 'BUY' },
  'hold': { bg: 'bg-slate-500/20', text: 'text-slate-300', label: 'HOLD' },
  'sell': { bg: 'bg-red-500/15', text: 'text-red-300', label: 'SELL' },
  'strong-sell': { bg: 'bg-red-500/30', text: 'text-red-400', label: 'STRONG SELL' },
};

const sportOptions: { value: Sport; label: string; emoji: string }[] = [
  { value: 'baseball', label: 'Baseball', emoji: '\u26be' },
  { value: 'basketball', label: 'Basketball', emoji: '\ud83c\udfc0' },
  { value: 'football', label: 'Football', emoji: '\ud83c\udfc8' },
  { value: 'hockey', label: 'Hockey', emoji: '\ud83c\udfd2' },
];

const tips = [
  { title: 'Buy the Offseason', desc: 'Every sport has a dead period when collector attention shifts elsewhere. This is when prices drop 15-30% on average. Set alerts and be ready.' },
  { title: 'Sell into Hype', desc: 'The biggest price spikes happen during in-season breakouts and playoff runs. These spikes are temporary — sell within 1-2 weeks of peak hype for maximum return.' },
  { title: 'Avoid Release Week Premium', desc: 'New product releases create artificial scarcity. Prices typically drop 20-40% within 4-6 weeks of release as supply normalizes. Be patient unless flipping.' },
  { title: 'Watch the Draft Calendar', desc: 'Prospect cards spike before the draft and often crash after (the "sell the news" effect). Buy prospects months before draft buzz begins.' },
  { title: 'Holiday Effect', desc: 'December sees increased buying from gift-givers, but January brings a flood of "I got this for Christmas and want cash" listings. January can be a stealth buying window.' },
  { title: 'The 2-Year Rule for Rookies', desc: 'Most rookie cards peak in their first or second year. Unless a player establishes superstar status by year 3, prices typically decline. Take profits early on speculative rookies.' },
];

export default function MarketTimerClient() {
  const [sport, setSport] = useState<Sport>('baseball');
  const [cardType, setCardType] = useState<CardType>('rookie');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const currentMonth = getCurrentMonthIndex();
  const calendar = useMemo(() => getCalendar(sport, cardType), [sport, cardType]);
  const currentMonthData = calendar.months[currentMonth];

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => c.sport === sport && (c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [searchQuery, sport]);

  const handleCardSelect = (cardName: string, cardSport: Sport) => {
    setSelectedCard(cardName);
    setSport(cardSport);
    setShowSearch(false);
    setSearchQuery('');
  };

  // Find next best buying window
  const nextBuyMonth = calendar.months.findIndex((m, i) => i > currentMonth && m.buyScore >= 40);
  const nextSellMonth = calendar.months.findIndex((m, i) => i > currentMonth && m.buyScore <= -30);

  return (
    <div className="space-y-8">
      {/* Sport & Card Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">Select Sport</label>
          <div className="grid grid-cols-2 gap-2">
            {sportOptions.map(s => (
              <button
                key={s.value}
                onClick={() => { setSport(s.value); setSelectedCard(null); setSearchQuery(''); }}
                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  sport === s.value
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="mr-2">{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">Card Type</label>
          <div className="space-y-2">
            {cardTypes.map(ct => (
              <button
                key={ct.value}
                onClick={() => setCardType(ct.value)}
                className={`w-full px-4 py-2.5 rounded-lg border text-left text-sm transition-all ${
                  cardType === ct.value
                    ? 'bg-indigo-600/30 border-indigo-500 text-white'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="font-medium">{ct.label}</span>
                <span className="text-xs text-slate-500 ml-2">{ct.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional: Search for a specific card */}
      <div className={`rounded-xl border ${calendar.borderColor} ${calendar.bgColor} p-4`}>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          {showSearch ? 'Hide card search' : 'Optional: Search for a specific card'} {showSearch ? '\u25b2' : '\u25bc'}
        </button>
        {showSearch && (
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder={`Search ${calendar.label.toLowerCase()} cards...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden z-10 max-h-64 overflow-y-auto">
                {searchResults.map(card => (
                  <button
                    key={card.slug}
                    onClick={() => handleCardSelect(card.name, card.sport as Sport)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                  >
                    <span className="text-white">{card.player}</span>
                    <span className="text-slate-400 ml-2 text-xs">{card.set} #{card.cardNumber}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {selectedCard && (
          <div className="mt-3 text-sm">
            <span className="text-slate-400">Timing for:</span>
            <span className="text-white font-medium ml-2">{selectedCard}</span>
            <button onClick={() => setSelectedCard(null)} className="text-red-400 ml-3 text-xs hover:text-red-300">[clear]</button>
          </div>
        )}
      </div>

      {/* Current Verdict */}
      <div className={`rounded-xl border-2 ${
        currentMonthData.buyScore >= 40 ? 'border-emerald-500/50 bg-emerald-950/30' :
        currentMonthData.buyScore <= -30 ? 'border-red-500/50 bg-red-950/30' :
        'border-slate-600/50 bg-slate-800/30'
      } p-6`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`text-3xl font-black ${actionColors[currentMonthData.action].text}`}>
            {actionColors[currentMonthData.action].label}
          </div>
          <div className="text-sm text-slate-400">
            {selectedCard ? `for ${selectedCard}` : `for ${calendar.label} ${cardTypes.find(c => c.value === cardType)?.label}`} right now
          </div>
        </div>
        <p className="text-slate-300 text-sm mb-4">{currentMonthData.events.join(' \u2022 ')}</p>
        <div className="flex flex-wrap gap-4 text-xs">
          {nextBuyMonth >= 0 && (
            <div className="text-emerald-400">
              Next buy window: <span className="font-medium">{calendar.months[nextBuyMonth].month}</span>
            </div>
          )}
          {nextSellMonth >= 0 && (
            <div className="text-red-400">
              Next sell window: <span className="font-medium">{calendar.months[nextSellMonth].month}</span>
            </div>
          )}
          {nextBuyMonth < 0 && currentMonthData.buyScore < 40 && (
            <div className="text-emerald-400">Next buy window: <span className="font-medium">{calendar.months.find(m => m.buyScore >= 40)?.month || 'Check back next cycle'}</span></div>
          )}
        </div>
      </div>

      {/* 12-Month Calendar */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">12-Month Timing Calendar</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {calendar.months.map((m, i) => {
            const ac = actionColors[m.action];
            const isCurrentMonth = i === currentMonth;
            return (
              <div
                key={m.shortMonth}
                className={`rounded-lg p-2.5 text-center border transition-all ${
                  isCurrentMonth ? 'ring-2 ring-indigo-400 border-indigo-500' : 'border-slate-700/50'
                } ${ac.bg}`}
              >
                <div className={`text-xs font-bold ${isCurrentMonth ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {m.shortMonth}
                </div>
                <div className={`text-[10px] font-bold mt-1 ${ac.text}`}>
                  {ac.label}
                </div>
                {/* Bar indicator */}
                <div className="mt-1.5 mx-auto w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  {m.buyScore > 0 ? (
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, m.buyScore)}%` }} />
                  ) : (
                    <div className="h-full bg-red-500 rounded-full ml-auto" style={{ width: `${Math.min(100, Math.abs(m.buyScore))}%` }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40" /> Buy window</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-600/40" /> Hold</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500/40" /> Sell window</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-1 ring-indigo-400" /> Now</span>
        </div>
      </div>

      {/* Key Events Timeline */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Key Events & Triggers</h2>
        <div className="space-y-2">
          {calendar.months.map((m, i) => (
            <div key={m.month} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg ${i === currentMonth ? 'bg-slate-800/80 ring-1 ring-indigo-500/30' : 'bg-slate-800/30'}`}>
              <div className={`w-10 text-xs font-bold ${i === currentMonth ? 'text-indigo-400' : 'text-slate-500'}`}>
                {m.shortMonth}
              </div>
              <div className={`w-20 text-xs font-bold ${actionColors[m.action].text}`}>
                {actionColors[m.action].label}
              </div>
              <div className="flex-1 text-xs text-slate-400">
                {m.events.map((e, j) => (
                  <span key={j}>
                    {j > 0 && <span className="mx-1.5 text-slate-600">\u2022</span>}
                    {e}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sport-Specific Insight */}
      <div className={`rounded-xl ${calendar.bgColor} border ${calendar.borderColor} p-6`}>
        <h3 className={`text-lg font-bold ${calendar.color} mb-2`}>{calendar.label} Market Insight</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{calendar.keyInsight}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-3">
            <div className="text-xs text-emerald-400 font-bold mb-1">Best Months to BUY</div>
            <div className="text-sm text-white">{calendar.bestBuyMonths}</div>
          </div>
          <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3">
            <div className="text-xs text-red-400 font-bold mb-1">Best Months to SELL</div>
            <div className="text-sm text-white">{calendar.bestSellMonths}</div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Market Timing Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="text-sm font-bold text-white mb-1">{tip.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
        <p className="text-xs text-amber-400/80 leading-relaxed">
          <strong>Disclaimer:</strong> Market timing analysis is based on historical seasonal patterns and general market observations. Past patterns do not guarantee future results. Card prices are influenced by many factors including player performance, injuries, market sentiment, and macroeconomic conditions. This tool is for educational purposes only and should not be considered financial advice. Always do your own research before making buying or selling decisions.
        </p>
      </div>

      {/* Related Tools */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/tools/value-projector', label: 'Value Projector', desc: 'Future value estimates' },
            { href: '/tools/price-history', label: 'Price History', desc: '90-day price charts' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'ROI vs benchmarks' },
            { href: '/tools/investment-planner', label: 'Investment Planner', desc: 'Portfolio allocation' },
            { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Quick flip P&L' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor', desc: 'Price trend analysis' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-indigo-500/50 transition-colors">
              <div className="text-sm font-medium text-white">{t.label}</div>
              <div className="text-xs text-slate-500">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}