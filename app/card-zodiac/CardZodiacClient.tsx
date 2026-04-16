'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type SignKey =
  | 'archer' | 'goalkeeper' | 'rookie' | 'slugger'
  | 'sprinter' | 'closer' | 'veteran' | 'scout'
  | 'trader' | 'completist' | 'hoarder' | 'grail-hunter';

interface ZodiacSign {
  key: SignKey;
  name: string;
  emoji: string;
  month: number; // 1-12
  dateRange: string;
  sport: string;
  sportEmoji: string;
  era: string;
  luckyNumber: number;
  traits: string[];
  motto: string;
  compatible: SignKey[];
  rival: SignKey;
  // Player name substrings — each sign picks from its pool
  grailPlayers: string[];
  color: string; // tailwind accent base
  description: string;
}

const SIGNS: Record<SignKey, ZodiacSign> = {
  'archer': {
    key: 'archer',
    name: 'The Archer',
    emoji: '🏹',
    month: 1,
    dateRange: 'January 1 – January 31',
    sport: 'Baseball',
    sportEmoji: '⚾',
    era: '1950s Topps',
    luckyNumber: 7,
    traits: ['Patient and precise', 'Value over volume', 'Waits for the dip'],
    motto: 'Aim true. Hold long.',
    compatible: ['veteran', 'grail-hunter', 'scout'],
    rival: 'sprinter',
    grailPlayers: ['Mickey Mantle', 'Willie Mays', 'Hank Aaron'],
    color: 'amber',
    description: 'You pick your shots with care. While others chase every spike, you wait for the moment when a vintage classic dips below fair value — then you draw back the bowstring and commit.',
  },
  'goalkeeper': {
    key: 'goalkeeper',
    name: 'The Goalkeeper',
    emoji: '🥅',
    month: 2,
    dateRange: 'February 1 – February 29',
    sport: 'Hockey',
    sportEmoji: '🏒',
    era: '1970s OPC',
    luckyNumber: 1,
    traits: ['Defensive-minded', 'Low-variance holder', 'Buys the proven, never the hype'],
    motto: 'Block every unforced loss.',
    compatible: ['completist', 'veteran', 'scout'],
    rival: 'hoarder',
    grailPlayers: ['Wayne Gretzky', 'Bobby Orr', 'Mario Lemieux', 'Patrick Roy'],
    color: 'sky',
    description: 'You protect the net. Every card in your binder earned its spot. You never get burned on speculative modern parallels — your rule is "I only buy cards that have already been cards for 20 years."',
  },
  'rookie': {
    key: 'rookie',
    name: 'The Rookie',
    emoji: '🌱',
    month: 3,
    dateRange: 'March 1 – March 31',
    sport: 'Basketball',
    sportEmoji: '🏀',
    era: 'Ultra-modern RC',
    luckyNumber: 23,
    traits: ['Optimistic about potential', 'Follows draft class religiously', 'Early adopter of names'],
    motto: 'Every legend was once a rookie card.',
    compatible: ['scout', 'sprinter', 'trader'],
    rival: 'veteran',
    grailPlayers: ['Victor Wembanyama', 'Luka Doncic', 'LeBron James', 'Ja Morant'],
    color: 'emerald',
    description: 'You buy the first card, not the best card. If a 19-year-old has hit the floor for four games you\'ve already tracked their Prizm base. The Archer thinks you\'re reckless. You think the Archer missed Jordan\'s rookie by waiting for proof.',
  },
  'slugger': {
    key: 'slugger',
    name: 'The Slugger',
    emoji: '⚾',
    month: 4,
    dateRange: 'April 1 – April 30',
    sport: 'Baseball',
    sportEmoji: '⚾',
    era: '1980s Donruss',
    luckyNumber: 24,
    traits: ['Bold swings', 'High-variance whale', 'Big bets or no bets'],
    motto: 'Go big or go sell.',
    compatible: ['grail-hunter', 'hoarder', 'closer'],
    rival: 'completist',
    grailPlayers: ['Ken Griffey Jr.', 'Barry Bonds', 'Albert Pujols', 'Shohei Ohtani'],
    color: 'rose',
    description: 'You swing for the fence. Three $50 cards a year don\'t excite you — you\'d rather hold one $3,000 card and watch it rip. Sometimes you strike out hard. But when you connect, the home run funds next year\'s entire portfolio.',
  },
  'sprinter': {
    key: 'sprinter',
    name: 'The Sprinter',
    emoji: '⚡',
    month: 5,
    dateRange: 'May 1 – May 31',
    sport: 'Basketball',
    sportEmoji: '🏀',
    era: '1990s Fleer / modern breakout',
    luckyNumber: 30,
    traits: ['Momentum-driven', 'Fast in, fast out', 'Reads the room better than the cards'],
    motto: 'First to the buy. First to the sell.',
    compatible: ['trader', 'rookie', 'closer'],
    rival: 'archer',
    grailPlayers: ['Michael Jordan', 'Kobe Bryant', 'Stephen Curry'],
    color: 'fuchsia',
    description: 'You move in hours, not years. A rookie hits 40 points on a Tuesday night and you own the Prizm by Wednesday morning — and sold it by the playoffs. The Archer calls this degenerate. You call it keeping up.',
  },
  'closer': {
    key: 'closer',
    name: 'The Closer',
    emoji: '🔒',
    month: 6,
    dateRange: 'June 1 – June 30',
    sport: 'Football',
    sportEmoji: '🏈',
    era: '2000s Playoff Contenders',
    luckyNumber: 12,
    traits: ['Deal-maker', 'Patient for the right trade', 'Wins the negotiation'],
    motto: 'Always be closing — at a fair price.',
    compatible: ['trader', 'slugger', 'sprinter'],
    rival: 'scout',
    grailPlayers: ['Tom Brady', 'Peyton Manning', 'Patrick Mahomes'],
    color: 'violet',
    description: 'You read the seller before you read the card. You know the difference between "not for sale" and "not for sale at that number." You close two deals a year — both at the precise price you projected six months earlier.',
  },
  'veteran': {
    key: 'veteran',
    name: 'The Veteran',
    emoji: '🎖️',
    month: 7,
    dateRange: 'July 1 – July 31',
    sport: 'Baseball',
    sportEmoji: '⚾',
    era: 'Pre-war tobacco & Goudey',
    luckyNumber: 3,
    traits: ['Long-hold conservative', 'Decades-long thesis', 'Trusts history over hype'],
    motto: 'Time is the only honest dealer.',
    compatible: ['archer', 'grail-hunter', 'goalkeeper'],
    rival: 'rookie',
    grailPlayers: ['Babe Ruth', 'Ty Cobb', 'Lou Gehrig', 'Honus Wagner'],
    color: 'stone',
    description: 'You don\'t worry about quarterly performance. The oldest card in your collection has survived three recessions, two recessions-we-called-corrections, and every breaker cycle since 2020. It will survive the next cycle too.',
  },
  'scout': {
    key: 'scout',
    name: 'The Scout',
    emoji: '🔭',
    month: 8,
    dateRange: 'August 1 – August 31',
    sport: 'Baseball',
    sportEmoji: '⚾',
    era: 'Bowman Chrome prospect autos',
    luckyNumber: 27,
    traits: ['Research-obsessed', 'Reads every farm-system report', 'Buys names before you\'ve heard them'],
    motto: 'Find him before the crowd finds him.',
    compatible: ['rookie', 'archer', 'goalkeeper'],
    rival: 'closer',
    grailPlayers: ['Mike Trout', 'Ronald Acuna Jr.', 'Paul Skenes', 'Junior Caminero'],
    color: 'teal',
    description: 'You know the High-A roster of teams you don\'t cheer for. You read FanGraphs leaderboards for fun. Your Bowman Chrome stack has 40 names on it — by 2030, six of them will be All-Stars and you\'ll have owned them at $12.',
  },
  'trader': {
    key: 'trader',
    name: 'The Trader',
    emoji: '🤝',
    month: 9,
    dateRange: 'September 1 – September 30',
    sport: 'Basketball',
    sportEmoji: '🏀',
    era: '2010s Prizm & Optic',
    luckyNumber: 77,
    traits: ['Social dealflow', 'Loves the swap more than the card', 'Every trade slightly in your favor'],
    motto: 'One good trade a week.',
    compatible: ['closer', 'sprinter', 'rookie'],
    rival: 'grail-hunter',
    grailPlayers: ['Luka Doncic', 'Nikola Jokic', 'Jayson Tatum', 'Giannis Antetokounmpo'],
    color: 'cyan',
    description: 'You\'d rather trade one Jokic for three cards totaling one-point-two Jokics than own the Jokic. The collection is a vehicle, not a destination. At card shows you spend more time with sellers than displays.',
  },
  'completist': {
    key: 'completist',
    name: 'The Completist',
    emoji: '📚',
    month: 10,
    dateRange: 'October 1 – October 31',
    sport: 'Baseball',
    sportEmoji: '⚾',
    era: 'Junk Wax / Topps Flagship',
    luckyNumber: 24,
    traits: ['Methodical set-builder', 'Spreadsheet-driven', 'The joy is in the last card'],
    motto: '660 cards. No gaps.',
    compatible: ['goalkeeper', 'veteran', 'scout'],
    rival: 'slugger',
    grailPlayers: ['Cal Ripken Jr.', 'Ken Griffey Jr.', 'Tony Gwynn'],
    color: 'blue',
    description: 'You own 657 of the 660 cards in the 1989 Topps Baseball set. You have tracked the remaining 3 across 14 months of COMC listings. When the last card lands in your binder it will be the best day of your collecting year.',
  },
  'hoarder': {
    key: 'hoarder',
    name: 'The Hoarder',
    emoji: '📦',
    month: 11,
    dateRange: 'November 1 – November 30',
    sport: 'Football',
    sportEmoji: '🏈',
    era: '1980s Topps / modern parallels',
    luckyNumber: 34,
    traits: ['Quantity accumulator', 'Rainbow chaser', 'Every parallel, every year'],
    motto: 'If one is good, forty-eight is better.',
    compatible: ['slugger', 'trader', 'rookie'],
    rival: 'goalkeeper',
    grailPlayers: ['Bo Jackson', 'Jerry Rice', 'Barry Sanders', 'Walter Payton'],
    color: 'orange',
    description: 'You have 40+ different Prizm parallels of one running back. You have 30+ Topps Chrome refractors of one quarterback. You call it "a collection." Your spouse calls it "a problem." The rainbow will be complete eventually.',
  },
  'grail-hunter': {
    key: 'grail-hunter',
    name: 'The Grail Hunter',
    emoji: '💎',
    month: 12,
    dateRange: 'December 1 – December 31',
    sport: 'Baseball',
    sportEmoji: '⚾',
    era: 'T206 & pre-war tobacco',
    luckyNumber: 8,
    traits: ['All-in on rare', 'Whale tier only', 'Fewer cards, each more iconic'],
    motto: 'One card in the safe beats ten in the binder.',
    compatible: ['archer', 'veteran', 'slugger'],
    rival: 'trader',
    grailPlayers: ['Honus Wagner', 'Mickey Mantle', 'Babe Ruth', 'Ty Cobb'],
    color: 'purple',
    description: 'You own three cards. Each one costs more than most cars. You walk past 10,000 cards at a show without slowing down — the one card you want isn\'t there, because it isn\'t anywhere. When you find it you pay full asking and never negotiate.',
  },
};

const ALL_KEYS = Object.keys(SIGNS) as SignKey[];

function getSignByMonth(month: number): ZodiacSign {
  const sign = ALL_KEYS.find(k => SIGNS[k].month === month);
  return SIGNS[sign ?? 'archer'];
}

function parseValue(raw: string): number {
  const m = raw.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

function pickGrailCard(sign: ZodiacSign, day: number) {
  const pool = sportsCards.filter(c =>
    sign.grailPlayers.some(p => c.player.toLowerCase() === p.toLowerCase())
  );
  if (pool.length === 0) return null;
  pool.sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw));
  const topN = pool.slice(0, Math.min(6, pool.length));
  const pick = topN[day % topN.length];
  return {
    name: pick.name,
    player: pick.player,
    sport: pick.sport,
    slug: pick.slug,
    value: pick.estimatedValueRaw,
  };
}

const COLOR_MAP: Record<string, { ring: string; text: string; bg: string; border: string; from: string; to: string }> = {
  amber: { ring: 'ring-amber-500/50', text: 'text-amber-300', bg: 'bg-amber-950/40', border: 'border-amber-800/50', from: 'from-amber-900/40', to: 'to-yellow-900/20' },
  sky: { ring: 'ring-sky-500/50', text: 'text-sky-300', bg: 'bg-sky-950/40', border: 'border-sky-800/50', from: 'from-sky-900/40', to: 'to-blue-900/20' },
  emerald: { ring: 'ring-emerald-500/50', text: 'text-emerald-300', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', from: 'from-emerald-900/40', to: 'to-teal-900/20' },
  rose: { ring: 'ring-rose-500/50', text: 'text-rose-300', bg: 'bg-rose-950/40', border: 'border-rose-800/50', from: 'from-rose-900/40', to: 'to-pink-900/20' },
  fuchsia: { ring: 'ring-fuchsia-500/50', text: 'text-fuchsia-300', bg: 'bg-fuchsia-950/40', border: 'border-fuchsia-800/50', from: 'from-fuchsia-900/40', to: 'to-pink-900/20' },
  violet: { ring: 'ring-violet-500/50', text: 'text-violet-300', bg: 'bg-violet-950/40', border: 'border-violet-800/50', from: 'from-violet-900/40', to: 'to-indigo-900/20' },
  stone: { ring: 'ring-stone-400/50', text: 'text-stone-300', bg: 'bg-stone-900/40', border: 'border-stone-700/50', from: 'from-stone-800/40', to: 'to-neutral-900/20' },
  teal: { ring: 'ring-teal-500/50', text: 'text-teal-300', bg: 'bg-teal-950/40', border: 'border-teal-800/50', from: 'from-teal-900/40', to: 'to-cyan-900/20' },
  cyan: { ring: 'ring-cyan-500/50', text: 'text-cyan-300', bg: 'bg-cyan-950/40', border: 'border-cyan-800/50', from: 'from-cyan-900/40', to: 'to-sky-900/20' },
  blue: { ring: 'ring-blue-500/50', text: 'text-blue-300', bg: 'bg-blue-950/40', border: 'border-blue-800/50', from: 'from-blue-900/40', to: 'to-indigo-900/20' },
  orange: { ring: 'ring-orange-500/50', text: 'text-orange-300', bg: 'bg-orange-950/40', border: 'border-orange-800/50', from: 'from-orange-900/40', to: 'to-amber-900/20' },
  purple: { ring: 'ring-purple-500/50', text: 'text-purple-300', bg: 'bg-purple-950/40', border: 'border-purple-800/50', from: 'from-purple-900/40', to: 'to-fuchsia-900/20' },
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STORAGE_KEY = 'cv_card_zodiac_v1';

export default function CardZodiacClient() {
  const [month, setMonth] = useState<number>(1);
  const [day, setDay] = useState<number>(1);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { month: number; day: number };
        if (saved.month >= 1 && saved.month <= 12 && saved.day >= 1 && saved.day <= 31) {
          setMonth(saved.month);
          setDay(saved.day);
          setRevealed(true);
        }
      }
    } catch { /* ignore */ }
  }, []);

  const sign = useMemo(() => getSignByMonth(month), [month]);
  const colors = COLOR_MAP[sign.color] || COLOR_MAP.amber;
  const grail = useMemo(() => pickGrailCard(sign, day), [sign, day]);
  const compatibleSigns = useMemo(() => sign.compatible.map(k => SIGNS[k]), [sign]);
  const rivalSign = SIGNS[sign.rival];

  const maxDay = useMemo(() => {
    if (month === 2) return 29;
    if ([4, 6, 9, 11].includes(month)) return 30;
    return 31;
  }, [month]);

  const handleReveal = () => {
    setRevealed(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ month, day }));
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    setRevealed(false);
    setCopied(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  };

  const handleCopy = async () => {
    const url = 'https://cardvault-two.vercel.app/card-zodiac';
    const text = `My Card Zodiac sign: ${sign.emoji} ${sign.name}\n` +
      `Ruling sport: ${sign.sportEmoji} ${sign.sport}\n` +
      `Lucky #: ${sign.luckyNumber}\n` +
      `Ruling grail: ${grail ? grail.name : sign.grailPlayers[0]}\n` +
      `Motto: "${sign.motto}"\n` +
      `Rival sign: ${SIGNS[sign.rival].emoji} ${SIGNS[sign.rival].name}\n\n` +
      `What's your Card Zodiac? ${url}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (!revealed) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Enter your birthday</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  setMonth(m);
                  if (m === 2 && day > 29) setDay(29);
                  else if ([4, 6, 9, 11].includes(m) && day > 30) setDay(30);
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Day</label>
              <select
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value, 10))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              >
                {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleReveal}
            className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
          >
            Reveal My Zodiac Sign
          </button>
          <p className="mt-3 text-xs text-gray-500">
            Your birthday stays in your browser (localStorage). Nothing is sent to a server.
          </p>
        </div>

        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">All 12 Signs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {ALL_KEYS.map(k => {
              const s = SIGNS[k];
              const c = COLOR_MAP[s.color] || COLOR_MAP.amber;
              return (
                <div key={k} className={`${c.bg} ${c.border} border rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{s.emoji}</span>
                    <span className={`text-xs font-bold ${c.text}`}>{MONTH_NAMES[s.month - 1].slice(0, 3)}</span>
                  </div>
                  <div className="text-white text-sm font-semibold">{s.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{s.sportEmoji} {s.sport}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero sign reveal */}
      <div className={`bg-gradient-to-br ${colors.from} ${colors.to} ${colors.border} border rounded-2xl p-8 ring-1 ${colors.ring}`}>
        <div className="text-center">
          <div className="text-6xl sm:text-7xl mb-3">{sign.emoji}</div>
          <div className={`text-xs font-bold uppercase tracking-widest ${colors.text} mb-2`}>
            Born {sign.dateRange.split(' – ')[0].replace(/^\w+ /, '')} to {sign.dateRange.split(' – ')[1].replace(/^\w+ /, '')} &middot; {MONTH_NAMES[sign.month - 1]}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{sign.name}</h2>
          <p className={`text-lg italic ${colors.text} mb-4`}>&ldquo;{sign.motto}&rdquo;</p>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto leading-relaxed">{sign.description}</p>
        </div>
      </div>

      {/* Sign attributes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Ruling Sport</div>
          <div className="text-xl font-bold text-white">{sign.sportEmoji} {sign.sport}</div>
          <div className="text-xs text-gray-500 mt-1">Era: {sign.era}</div>
        </div>
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Lucky Jersey</div>
          <div className="text-3xl font-bold text-white">#{sign.luckyNumber}</div>
        </div>
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Rival Sign</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{rivalSign.emoji}</span>
            <span className="text-white font-semibold">{rivalSign.name}</span>
          </div>
        </div>
      </div>

      {/* Traits */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Your Collecting Traits</h3>
        <ul className="space-y-2">
          {sign.traits.map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
              <span className={`${colors.text} mt-0.5`}>◆</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ruling grail card */}
      {grail && (
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-5`}>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Your Ruling Grail</div>
          <Link
            href={`/sports/${grail.slug}`}
            className="block p-4 bg-gray-900/60 border border-gray-700/50 rounded-lg hover:border-gray-500 transition-colors"
          >
            <div className="text-lg font-bold text-white mb-1">{grail.name}</div>
            <div className="text-xs text-gray-400 mb-2">{grail.player} &middot; {grail.sport}</div>
            <div className={`text-sm font-semibold ${colors.text}`}>{grail.value}</div>
          </Link>
          <p className="text-xs text-gray-500 mt-3">
            Pulled from the CardVault 9,840-card database. This is the highest-value card in your ruling player pool.
          </p>
        </div>
      )}

      {/* Compatible signs */}
      <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Compatible Signs</h3>
        <p className="text-xs text-gray-500 mb-4">
          These three signs share your collecting DNA — similar patience, similar eras, similar risk appetite.
          Trading with them feels natural; your thesis aligns.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {compatibleSigns.map(s => {
            const c = COLOR_MAP[s.color] || COLOR_MAP.amber;
            return (
              <div key={s.key} className={`${c.bg} ${c.border} border rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className={`text-xs font-bold ${c.text}`}>{MONTH_NAMES[s.month - 1].slice(0, 3)}</span>
                </div>
                <div className="text-white text-sm font-semibold">{s.name}</div>
                <div className="text-gray-500 text-xs mt-0.5">{s.sportEmoji} {s.sport}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className={`px-5 py-2.5 ${colors.bg} ${colors.border} border ${colors.text} font-semibold rounded-lg transition-colors hover:opacity-80`}
        >
          {copied ? 'Copied!' : 'Copy Result'}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Try Another Birthday
        </button>
      </div>
    </div>
  );
}
