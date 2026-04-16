'use client';

import { useState, useEffect, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Deterministic helpers                                              */
/* ------------------------------------------------------------------ */

const dateHash = (d: string) => {
  let h = 0;
  for (let i = 0; i < d.length; i++) {
    h = (h * 31 + d.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
};

const seededRng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface SportScore {
  sport: Sport;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  bulls: number;
  bears: number;
}

interface StarCard {
  label: string;
  badge: string;
  badgeColor: string;
  name: string;
  player: string;
  price: string;
  change: number;
}

type EventType = 'BIG_BUY' | 'SELL_OFF' | 'MARKET_ALERT' | 'NEW_HIGH' | 'BREAKOUT' | 'VOLUME_SPIKE';

interface PlayByPlayEvent {
  type: EventType;
  icon: string;
  label: string;
  description: string;
  time: string;
}

/* ------------------------------------------------------------------ */
/*  Curated card lists                                                 */
/* ------------------------------------------------------------------ */

const ICONIC_CARDS = [
  { name: '2024 Topps Chrome Paul Skenes RC', player: 'Paul Skenes', basePrice: 85 },
  { name: '2023 Panini Prizm Victor Wembanyama RC', player: 'Victor Wembanyama', basePrice: 250 },
  { name: '2018 Topps Update Ronald Acuna Jr RC', player: 'Ronald Acuna Jr', basePrice: 320 },
  { name: '2020 Panini Prizm Justin Herbert RC', player: 'Justin Herbert', basePrice: 180 },
  { name: '2023 Topps Chrome Corbin Carroll RC', player: 'Corbin Carroll', basePrice: 55 },
  { name: '2019 Panini Prizm Zion Williamson RC', player: 'Zion Williamson', basePrice: 400 },
  { name: '2021 Topps Chrome Julio Rodriguez RC', player: 'Julio Rodriguez', basePrice: 145 },
  { name: '2022 Panini Prizm Brock Purdy RC', player: 'Brock Purdy', basePrice: 120 },
  { name: '2020 Upper Deck Alexis Lafreniere YG', player: 'Alexis Lafreniere', basePrice: 95 },
  { name: '2018 Panini Prizm Luka Doncic RC', player: 'Luka Doncic', basePrice: 750 },
  { name: '2023 Topps Chrome Elly De La Cruz RC', player: 'Elly De La Cruz', basePrice: 68 },
  { name: '2024 Panini Prizm Caleb Williams RC', player: 'Caleb Williams', basePrice: 110 },
  { name: '2021 Upper Deck Connor Bedard YG', player: 'Connor Bedard', basePrice: 200 },
  { name: '2017 Topps Update Aaron Judge RC', player: 'Aaron Judge', basePrice: 290 },
  { name: '2020 Panini Prizm Joe Burrow RC', player: 'Joe Burrow', basePrice: 210 },
  { name: '2022 Topps Chrome Michael Harris II RC', player: 'Michael Harris II', basePrice: 42 },
  { name: '2019 Panini Prizm Ja Morant RC', player: 'Ja Morant', basePrice: 185 },
  { name: '2023 Panini Prizm CJ Stroud RC', player: 'CJ Stroud', basePrice: 160 },
  { name: '2024 Upper Deck Macklin Celebrini YG', player: 'Macklin Celebrini', basePrice: 135 },
  { name: '2018 Topps Update Juan Soto RC', player: 'Juan Soto', basePrice: 265 },
];

const ROOKIE_CARDS = [
  { name: '2024 Topps Chrome Paul Skenes RC', player: 'Paul Skenes', basePrice: 85 },
  { name: '2024 Panini Prizm Caleb Williams RC', player: 'Caleb Williams', basePrice: 110 },
  { name: '2024 Upper Deck Macklin Celebrini YG', player: 'Macklin Celebrini', basePrice: 135 },
  { name: '2024 Panini Prizm Zach Edey RC', player: 'Zach Edey', basePrice: 45 },
  { name: '2024 Topps Chrome Jackson Merrill RC', player: 'Jackson Merrill', basePrice: 52 },
  { name: '2024 Panini Prizm Marvin Harrison Jr RC', player: 'Marvin Harrison Jr', basePrice: 190 },
  { name: '2024 Panini Prizm Jayden Daniels RC', player: 'Jayden Daniels', basePrice: 175 },
  { name: '2024 Panini Prizm Alexandre Sarr RC', player: 'Alexandre Sarr', basePrice: 60 },
  { name: '2024 Topps Chrome Jackson Chourio RC', player: 'Jackson Chourio', basePrice: 75 },
  { name: '2024 Panini Prizm Malik Nabers RC', player: 'Malik Nabers', basePrice: 140 },
  { name: '2024 Upper Deck Cutter Gauthier YG', player: 'Cutter Gauthier', basePrice: 48 },
  { name: '2024 Topps Chrome Junior Caminero RC', player: 'Junior Caminero', basePrice: 38 },
  { name: '2024 Panini Prizm Reed Sheppard RC', player: 'Reed Sheppard', basePrice: 55 },
  { name: '2024 Panini Prizm Bo Nix RC', player: 'Bo Nix', basePrice: 65 },
  { name: '2024 Upper Deck Ivan Demidov YG', player: 'Ivan Demidov', basePrice: 88 },
];

const SLEEPER_CARDS = [
  { name: '2023 Topps Chrome Masataka Yoshida RC', player: 'Masataka Yoshida', basePrice: 18 },
  { name: '2022 Panini Prizm Desmond Ridder RC', player: 'Desmond Ridder', basePrice: 8 },
  { name: '2023 Panini Prizm Brandon Miller RC', player: 'Brandon Miller', basePrice: 32 },
  { name: '2022 Upper Deck Shane Wright YG', player: 'Shane Wright', basePrice: 22 },
  { name: '2023 Topps Chrome Andrew Abbott RC', player: 'Andrew Abbott', basePrice: 15 },
  { name: '2022 Panini Prizm Garrett Wilson RC', player: 'Garrett Wilson', basePrice: 42 },
  { name: '2023 Panini Prizm Jaime Jaquez Jr RC', player: 'Jaime Jaquez Jr', basePrice: 28 },
  { name: '2021 Upper Deck Owen Power YG', player: 'Owen Power', basePrice: 35 },
];

/* ------------------------------------------------------------------ */
/*  Event templates                                                    */
/* ------------------------------------------------------------------ */

const EVENT_TEMPLATES: { type: EventType; icon: string; label: string; templates: string[] }[] = [
  {
    type: 'BIG_BUY',
    icon: '\u{1F7E2}',
    label: 'BIG BUY',
    templates: [
      '{card} -- ${price} (+{pct}%)',
      '{card} scooped up at ${price} (+{pct}%)',
      'Buyer swoops on {card} at ${price} (+{pct}%)',
    ],
  },
  {
    type: 'SELL_OFF',
    icon: '\u{1F534}',
    label: 'SELL OFF',
    templates: [
      '{card} -- ${price} (-{pct}%)',
      '{card} dumped at ${price} (-{pct}%)',
      'Seller moves {card} at ${price} (-{pct}%)',
    ],
  },
  {
    type: 'MARKET_ALERT',
    icon: '\u26A1',
    label: 'MARKET ALERT',
    templates: [
      '{sport} cards surging ahead of upcoming events',
      '{sport} market heating up with heavy volume',
      'Unusual activity detected in {sport} sector',
    ],
  },
  {
    type: 'NEW_HIGH',
    icon: '\u{1F3C6}',
    label: 'NEW HIGH',
    templates: [
      '{card} hits new 52-week high at ${price}',
      'All-time record: {card} reaches ${price}',
      '{card} breaks through resistance at ${price}',
    ],
  },
  {
    type: 'BREAKOUT',
    icon: '\u{1F525}',
    label: 'BREAKOUT',
    templates: [
      '{card} breaking out -- up {pct}% today',
      '{player} cards on fire -- {card} +{pct}%',
      'Breakout alert: {card} climbing fast (+{pct}%)',
    ],
  },
  {
    type: 'VOLUME_SPIKE',
    icon: '\u{1F4C8}',
    label: 'VOLUME SPIKE',
    templates: [
      '{sport} trading volume up {pct}% vs yesterday',
      'Volume spike: {card} seeing 3x normal activity',
      'Heavy trading detected on {card}',
    ],
  },
];

const SPORT_NAMES: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];

/* ------------------------------------------------------------------ */
/*  Data generation                                                    */
/* ------------------------------------------------------------------ */

function generateDayData(today: string) {
  const hash = dateHash(today);
  const rng = seededRng(hash);

  // ---- Per-sport scores ----
  const sportMeta: Record<Sport, { label: string; icon: string; color: string; bgColor: string }> = {
    baseball: { label: 'Baseball', icon: '\u26BE', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    basketball: { label: 'Basketball', icon: '\u{1F3C0}', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    football: { label: 'Football', icon: '\u{1F3C8}', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    hockey: { label: 'Hockey', icon: '\u{1F3D2}', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  };

  const sportScores: SportScore[] = SPORT_NAMES.map((sport) => {
    const bulls = Math.round(50 + rng() * 450);
    const bears = Math.round(50 + rng() * 450);
    return { sport, ...sportMeta[sport], bulls, bears };
  });

  const totalBulls = sportScores.reduce((s, x) => s + x.bulls, 0);
  const totalBears = sportScores.reduce((s, x) => s + x.bears, 0);

  // ---- Stars ----
  const pickCard = (list: typeof ICONIC_CARDS) => {
    const idx = Math.floor(rng() * list.length);
    const card = list[idx];
    const change = Math.round((rng() * 30 - 5) * 10) / 10;
    const price = Math.round(card.basePrice * (1 + change / 100));
    return { ...card, price, change };
  };

  const mvpCard = pickCard(ICONIC_CARDS);
  const rookieCard = pickCard(ROOKIE_CARDS);

  // Biggest mover: pick from iconic with high change
  const moverSeed = Math.floor(rng() * ICONIC_CARDS.length);
  const moverBase = ICONIC_CARDS[moverSeed];
  const moverChange = Math.round((10 + rng() * 25) * 10) / 10;
  const moverPrice = Math.round(moverBase.basePrice * (1 + moverChange / 100));

  // Sleeper
  const sleeperIdx = Math.floor(rng() * SLEEPER_CARDS.length);
  const sleeperBase = SLEEPER_CARDS[sleeperIdx];
  const sleeperChange = Math.round((2 + rng() * 12) * 10) / 10;
  const sleeperPrice = Math.round(sleeperBase.basePrice * (1 + sleeperChange / 100));

  const stars: StarCard[] = [
    {
      label: 'MVP Card',
      badge: 'MVP',
      badgeColor: 'bg-yellow-500/30 text-yellow-300',
      name: mvpCard.name,
      player: mvpCard.player,
      price: `$${mvpCard.price}`,
      change: mvpCard.change,
    },
    {
      label: 'Rookie Sensation',
      badge: 'ROY',
      badgeColor: 'bg-cyan-500/30 text-cyan-300',
      name: rookieCard.name,
      player: rookieCard.player,
      price: `$${rookieCard.price}`,
      change: rookieCard.change,
    },
    {
      label: 'Biggest Mover',
      badge: 'HOT',
      badgeColor: 'bg-red-500/30 text-red-300',
      name: moverBase.name,
      player: moverBase.player,
      price: `$${moverPrice}`,
      change: moverChange,
    },
    {
      label: 'Sleeper Pick',
      badge: 'ZZZ',
      badgeColor: 'bg-purple-500/30 text-purple-300',
      name: sleeperBase.name,
      player: sleeperBase.player,
      price: `$${sleeperPrice}`,
      change: sleeperChange,
    },
  ];

  // ---- Play-by-play events ----
  const events: PlayByPlayEvent[] = [];
  for (let i = 0; i < 20; i++) {
    const tplGroup = EVENT_TEMPLATES[Math.floor(rng() * EVENT_TEMPLATES.length)];
    const tpl = tplGroup.templates[Math.floor(rng() * tplGroup.templates.length)];
    const card = ICONIC_CARDS[Math.floor(rng() * ICONIC_CARDS.length)];
    const pct = Math.round((2 + rng() * 20) * 10) / 10;
    const price = Math.round(card.basePrice * (1 + (rng() * 0.3 - 0.1)));
    const sport = ['Baseball', 'Basketball', 'Football', 'Hockey'][Math.floor(rng() * 4)];

    const hour = 6 + Math.floor(rng() * 16);
    const minute = Math.floor(rng() * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;

    const description = tpl
      .replace('{card}', card.name)
      .replace('{player}', card.player)
      .replace('{price}', price.toString())
      .replace('{pct}', pct.toString())
      .replace('{sport}', sport);

    events.push({
      type: tplGroup.type,
      icon: tplGroup.icon,
      label: tplGroup.label,
      description,
      time: timeStr,
    });
  }

  // Sort events by simulated time (newest first)
  events.sort((a, b) => {
    const parse = (t: string) => {
      const [time, period] = t.split(' ');
      const [h, m] = time.split(':').map(Number);
      const hour24 = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
      return hour24 * 60 + m;
    };
    return parse(b.time) - parse(a.time);
  });

  // ---- Market Stats ----
  const totalVolume = totalBulls + totalBears;
  const activeTrades = Math.round(800 + rng() * 4200);
  const biggestGain = Math.round((8 + rng() * 28) * 10) / 10;
  const biggestDrop = -Math.round((5 + rng() * 20) * 10) / 10;
  const bullBearRatio = Math.round((totalBulls / totalBears) * 100) / 100;

  // ---- Halftime report ----
  const leadingSport = [...sportScores].sort((a, b) => (b.bulls - b.bears) - (a.bulls - a.bears))[0];
  const morningBias = totalBulls > totalBears ? 'bullish' : 'bearish';
  const halftimeReport = {
    summary: `Morning trading was decisively ${morningBias} with ${morningBias === 'bullish' ? 'buyers' : 'sellers'} dominating across most sectors. Total volume reached $${totalVolume}K through midday, ${totalVolume > 800 ? 'well above' : 'slightly below'} the 30-day average.`,
    leader: `${leadingSport.label} leads all sports with a net ${leadingSport.bulls > leadingSport.bears ? 'buyer' : 'seller'} advantage of $${Math.abs(leadingSport.bulls - leadingSport.bears)}K. ${leadingSport.label === 'Football' ? 'Draft speculation is fueling heavy activity.' : leadingSport.label === 'Baseball' ? 'Season momentum continues to drive demand.' : leadingSport.label === 'Basketball' ? 'Playoff positioning is creating price swings.' : 'Trade deadline buzz is pushing volume higher.'}`,
    trend: `The overall market trend is ${morningBias} with a ${bullBearRatio.toFixed(2)} bull/bear ratio. ${biggestGain > 20 ? 'Several cards are seeing outsized gains, suggesting strong conviction buying.' : 'Gains are broad-based but moderate, indicating steady accumulation.'} Collectors should watch for ${morningBias === 'bullish' ? 'potential profit-taking in the afternoon session' : 'a possible reversal if key rookie cards find support levels'}.`,
  };

  return {
    sportScores,
    totalBulls,
    totalBears,
    stars,
    events,
    stats: { totalVolume, activeTrades, biggestGain, biggestDrop, bullBearRatio },
    halftimeReport,
  };
}

/* ------------------------------------------------------------------ */
/*  Quarter helper                                                     */
/* ------------------------------------------------------------------ */

function getQuarter(hour: number): { label: string; num: number } {
  if (hour >= 6 && hour < 12) return { label: 'Q1', num: 1 };
  if (hour >= 12 && hour < 15) return { label: 'Q2', num: 2 };
  if (hour >= 15 && hour < 18) return { label: 'Q3', num: 3 };
  return { label: 'Q4', num: 4 };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MarketScoreboardClient() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const [halftimeOpen, setHalftimeOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const today = useMemo(() => (mounted ? new Date().toISOString().slice(0, 10) : ''), [mounted]);
  const data = useMemo(() => (today ? generateDayData(today) : null), [today]);

  if (!mounted || !data) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-lg">Loading Market Scoreboard...</div>
      </div>
    );
  }

  const hour = now.getHours();
  const quarter = getQuarter(hour);
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const bullsWinning = data.totalBulls >= data.totalBears;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ============================================================ */}
        {/*  GAME HEADER / SCOREBOARD                                    */}
        {/* ============================================================ */}
        <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Live indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            LIVE
          </div>

          <div className="pt-6 pb-8 px-6 text-center space-y-4">
            {/* Quarter + Clock */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <span className="bg-gray-800 px-3 py-1 rounded-full font-bold tracking-wider">{quarter.label}</span>
              <span className="font-mono">{timeStr}</span>
            </div>

            {/* Main Scoreboard */}
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              {/* Bulls */}
              <div className="text-center">
                <div className="text-green-400 text-sm sm:text-base font-bold uppercase tracking-widest mb-1">Bulls</div>
                <div className="text-4xl sm:text-6xl lg:text-7xl font-black tabular-nums text-green-400">
                  {data.totalBulls}
                </div>
                <div className="text-xs text-gray-500 mt-1">$K Buy Volume</div>
              </div>

              {/* VS + Momentum */}
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl sm:text-2xl font-black text-gray-600">VS</div>
                <div
                  className={`text-2xl sm:text-3xl transition-all duration-500 ${bullsWinning ? 'text-green-400' : 'text-red-400'}`}
                  title={bullsWinning ? 'Bulls leading' : 'Bears leading'}
                >
                  {bullsWinning ? '\u25B2' : '\u25BC'}
                </div>
              </div>

              {/* Bears */}
              <div className="text-center">
                <div className="text-red-400 text-sm sm:text-base font-bold uppercase tracking-widest mb-1">Bears</div>
                <div className="text-4xl sm:text-6xl lg:text-7xl font-black tabular-nums text-red-400">
                  {data.totalBears}
                </div>
                <div className="text-xs text-gray-500 mt-1">$K Sell Volume</div>
              </div>
            </div>

            <p className="text-gray-500 text-xs max-w-md mx-auto">
              Today&#39;s card market presented as a live game. Simulated volume data resets daily.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  PER-SPORT SCORELINES                                        */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.sportScores.map((s) => {
            const sportWinner = s.bulls >= s.bears ? 'bulls' : 'bears';
            return (
              <div
                key={s.sport}
                className={`${s.bgColor} border border-gray-800 rounded-xl p-4 transition-transform hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className={`font-bold ${s.color}`}>{s.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      sportWinner === 'bulls'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {sportWinner === 'bulls' ? 'BULLS WIN' : 'BEARS WIN'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Bulls</div>
                    <div className="text-2xl font-black text-green-400 tabular-nums">{s.bulls}</div>
                  </div>
                  <div className="text-gray-600 text-lg font-bold pb-1">-</div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-0.5">Bears</div>
                    <div className="text-2xl font-black text-red-400 tabular-nums">{s.bears}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/*  MARKET STATS BAR                                            */}
        {/* ============================================================ */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Volume</div>
              <div className="text-xl font-bold text-white">${data.stats.totalVolume}K</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Trades</div>
              <div className="text-xl font-bold text-white">{data.stats.activeTrades.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Biggest Gain</div>
              <div className="text-xl font-bold text-green-400">+{data.stats.biggestGain}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Biggest Drop</div>
              <div className="text-xl font-bold text-red-400">{data.stats.biggestDrop}%</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bull/Bear Ratio</div>
              <div className={`text-xl font-bold ${data.stats.bullBearRatio >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                {data.stats.bullBearRatio.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  TODAY'S STARS                                                */}
        {/* ============================================================ */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">{'\u2B50'}</span> Today&#39;s Stars
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.stars.map((star) => (
              <div
                key={star.label}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{star.label}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${star.badgeColor}`}>
                    {star.badge}
                  </span>
                </div>
                <div className="font-semibold text-white text-sm leading-tight mb-1">{star.name}</div>
                <div className="text-xs text-gray-400 mb-3">{star.player}</div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-white">{star.price}</span>
                  <span
                    className={`text-sm font-bold flex items-center gap-0.5 ${
                      star.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {star.change >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(star.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  LIVE PLAY-BY-PLAY TICKER                                    */}
        {/* ============================================================ */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            Live Play-by-Play
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800/60 max-h-[480px] overflow-y-auto">
            {data.events.map((ev, i) => (
              <div
                key={i}
                className="px-4 py-3 flex items-start gap-3 hover:bg-gray-800/40 transition-colors"
              >
                <span className="text-lg flex-shrink-0 pt-0.5">{ev.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        ev.type === 'SELL_OFF'
                          ? 'bg-red-500/20 text-red-400'
                          : ev.type === 'BIG_BUY' || ev.type === 'BREAKOUT'
                          ? 'bg-green-500/20 text-green-400'
                          : ev.type === 'NEW_HIGH'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {ev.label}
                    </span>
                    <span className="text-[10px] text-gray-600 font-mono">{ev.time}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  HALFTIME REPORT                                             */}
        {/* ============================================================ */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setHalftimeOpen(!halftimeOpen)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-800/40 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{'\u{1F4CB}'}</span>
              <span className="font-bold text-white">Halftime Report</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                Midday Analysis
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${halftimeOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              halftimeOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-6 space-y-4 border-t border-gray-800 pt-4">
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Morning Summary</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{data.halftimeReport.summary}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sport Leaders</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{data.halftimeReport.leader}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trend Analysis</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{data.halftimeReport.trend}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
