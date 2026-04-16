'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// --- Helpers ---
function seededRng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateToSeed(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h * 31) + key.charCodeAt(i)) | 0;
  return Math.abs(h) || 1;
}

function parseValue(v: string): number {
  const nums = v.match(/\$[0-9,]+/g);
  if (!nums) return 5;
  const last = nums[nums.length - 1].replace(/[$,]/g, '');
  return parseInt(last, 10) || 5;
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

function humanDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function shortDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function sportColor(s: string): string {
  return s === 'baseball' ? 'text-red-400'
    : s === 'basketball' ? 'text-orange-400'
    : s === 'football' ? 'text-amber-400'
    : s === 'hockey' ? 'text-sky-400'
    : 'text-gray-400';
}

function sportEmoji(s: string): string {
  return s === 'baseball' ? '⚾'
    : s === 'basketball' ? '🏀'
    : s === 'football' ? '🏈'
    : s === 'hockey' ? '🏒'
    : '🏷️';
}

// --- Moods & Scripts ---
const MOODS = [
  { key: 'bull-charge', label: 'BULL CHARGE', tone: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-700/50', blurb: 'Buyers smashing the open. Bids stacking on every tier.' },
  { key: 'steady-green', label: 'STEADY GREEN', tone: 'text-emerald-300', bg: 'bg-emerald-950/30', border: 'border-emerald-800/50', blurb: 'Orderly grind higher. No fireworks — just slow tape.' },
  { key: 'mixed-tape', label: 'MIXED TAPE', tone: 'text-amber-300', bg: 'bg-amber-950/30', border: 'border-amber-800/50', blurb: 'Breadth is split. Winners winning, losers dragging.' },
  { key: 'chop', label: 'CHOPPY', tone: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-700/50', blurb: 'Tight range, no conviction. Volume light on both sides.' },
  { key: 'soft', label: 'SOFT OPEN', tone: 'text-rose-300', bg: 'bg-rose-950/30', border: 'border-rose-800/50', blurb: 'Bids pulling back. Sellers willing, buyers picky.' },
  { key: 'bear-claw', label: 'BEAR CLAW', tone: 'text-rose-400', bg: 'bg-rose-950/40', border: 'border-rose-700/50', blurb: 'Red across the board. Ask stacks thick, bid ladder thin.' },
];

const OPENING_LINES = [
  "Good morning, cardboard nation — the bell has rung.",
  "Morning, collectors. Grab your coffee, the tape is live.",
  "Welcome back to the floor. Another day, another thousand pulls.",
  "Opening bell is open. Let's call what we see.",
  "Good morning. Sun's up, markets are up — mostly.",
  "Morning, desks. The overnight tape set us up for drama.",
];

const WATCH_REASONS = [
  'trade rumor sparking collector whispers',
  'grading population report dropping this week',
  'a quiet accumulation pattern in the PSA 10 tier',
  'crossover buyers from an adjacent sport',
  'reprint scarcity finally being recognized',
  'an anniversary year drawing sentimental flow',
  'a rookie variant starting to move ahead of its base',
  'set-completion demand hitting the tail',
];

const CLOSING_THOUGHTS = [
  'Money follows stories. Today had a few to chase.',
  'The best tape is quiet tape. Patience pays more than clicks.',
  'One day doesn\'t make a thesis. But it makes a chart.',
  'Volume leaders tomorrow will be today\'s quiet accumulators.',
  'Don\'t chase the top pick. Chase the underpriced cousin.',
  'The market doesn\'t reward conviction. It rewards timing plus conviction.',
];

const TOMORROW_TEASERS = [
  'grading reveal watch',
  'the weekly set-completion leader',
  'a deep-dive on the quietest gainer of the week',
  'draft-eligible rookies trending now',
  'the vintage tier that woke up this week',
  'a sleeper segment on parallels nobody\'s tracking',
];

// --- Segment identifiers ---
type SegmentId = 'opening' | 'gainer' | 'loser' | 'watch' | 'closing';

interface Segment {
  id: SegmentId;
  chapter: number;
  label: string;
  icon: string;
  durationMs: number;
}

const SEGMENTS: Segment[] = [
  { id: 'opening', chapter: 1, label: 'Opening Monologue', icon: '🔔', durationMs: 12000 },
  { id: 'gainer', chapter: 2, label: 'Gainer of the Day', icon: '🚀', durationMs: 18000 },
  { id: 'loser', chapter: 3, label: 'Loser of the Day', icon: '🧊', durationMs: 18000 },
  { id: 'watch', chapter: 4, label: 'One to Watch', icon: '🔭', durationMs: 20000 },
  { id: 'closing', chapter: 5, label: 'Closing Bell', icon: '🎙️', durationMs: 15000 },
];

// --- Episode generation ---
interface TickerItem {
  card: SportsCard;
  delta: number;
}

interface Episode {
  date: string;
  mood: typeof MOODS[number];
  indexValue: number;
  indexDelta: number;
  openingLine: string;
  volumeMillions: number;
  breadth: { up: number; down: number };
  gainer: SportsCard;
  gainerDelta: number;
  gainerStory: string;
  loser: SportsCard;
  loserDelta: number;
  loserStory: string;
  watch: SportsCard;
  watchReason: string;
  watchTarget: number;
  closingThought: string;
  tomorrowTeaser: string;
  ticker: TickerItem[];
  episodeNumber: number;
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function buildGainerStory(card: SportsCard, delta: number): string {
  const pct = delta.toFixed(1);
  const tier = card.rookie ? 'rookie' : 'veteran flagship';
  const plays = [
    `${card.player} posted a highlight reel overnight and ${pct}% of the ask stack cleared before coffee was cold.`,
    `${card.player} cards just don't sit. ${pct}% green on the tape, and the PSA 10 asks keep climbing.`,
    `Nobody wanted to sell ${card.player} today. ${pct}% up and the bid ladder kept refilling.`,
    `${card.year} ${card.set} caught a bid — ${pct}% up on a rumor that the print run was even tighter than last year.`,
    `Momentum trade all morning on ${card.player}. ${pct}% on the day, and the raw market followed the slabs.`,
    `Collectors picked up ${card.player} with both hands. ${pct}% up on real conviction, not headlines.`,
  ];
  const idx = Math.floor((card.slug.charCodeAt(1) + card.year) % plays.length);
  const base = plays[idx];
  return `${base} This is a ${tier} card, so the move matters more than a prospect pop.`;
}

function buildLoserStory(card: SportsCard, delta: number): string {
  const pct = Math.abs(delta).toFixed(1);
  const plays = [
    `${card.player} cooled off — ${pct}% red as late sellers beat the ask down. No single story, just tape exhaustion.`,
    `Rough tape on ${card.player}. ${pct}% lower and the bid side thinned out by lunch.`,
    `${card.year} ${card.set} gave back recent gains — ${pct}% today. Profit takers, not panic.`,
    `Quiet day for ${card.player}. ${pct}% off the open; the float found a new floor.`,
    `${card.player} backed up ${pct}% on a grading report that widened the pop more than collectors hoped.`,
    `The ${card.year} ${card.set} asks crept down ${pct}%. Nothing broken — just supply catching up to demand.`,
  ];
  const idx = Math.floor((card.slug.charCodeAt(0) + card.year) % plays.length);
  return plays[idx];
}

function generateEpisode(dateK: string, episodeNum: number): Episode {
  const seed = dateToSeed(dateK);
  const rng = seededRng(seed);

  const pool = sportsCards;

  const mood = pickOne(rng, MOODS);
  const openingLine = pickOne(rng, OPENING_LINES);
  const closingThought = pickOne(rng, CLOSING_THOUGHTS);
  const tomorrowTeaser = pickOne(rng, TOMORROW_TEASERS);
  const watchReason = pickOne(rng, WATCH_REASONS);

  // Index value anchored around 1000, swung by mood
  const moodBias: Record<string, number> = {
    'bull-charge': 85, 'steady-green': 40, 'mixed-tape': 5,
    'chop': -10, 'soft': -40, 'bear-claw': -90,
  };
  const bias = moodBias[mood.key] ?? 0;
  const indexValue = Math.round(1000 + bias + (rng() - 0.5) * 30);
  const indexDelta = +(((indexValue - 1000) / 10) + (rng() - 0.5) * 0.8).toFixed(2);
  const volumeMillions = +(rng() * 20 + 3).toFixed(1);
  const totalBreadth = 200;
  const upRatio = mood.key === 'bull-charge' ? 0.72
    : mood.key === 'steady-green' ? 0.60
    : mood.key === 'mixed-tape' ? 0.52
    : mood.key === 'chop' ? 0.49
    : mood.key === 'soft' ? 0.38
    : 0.28;
  const up = Math.round(totalBreadth * upRatio);

  // Pick cards with weighting toward high-value + rookies
  function pickCard(): SportsCard {
    // Sample 40, rank by a soft score (value + rookie tilt + rng), pick top by rng
    const sampled: { c: SportsCard; score: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const c = pool[Math.floor(rng() * pool.length)];
      const v = parseValue(c.estimatedValueRaw);
      const score = Math.log10(Math.max(5, v)) + (c.rookie ? 0.3 : 0) + rng() * 1.2;
      sampled.push({ c, score });
    }
    sampled.sort((a, b) => b.score - a.score);
    const topN = sampled.slice(0, 8);
    return topN[Math.floor(rng() * topN.length)].c;
  }

  // Ensure distinct cards
  const picked = new Set<string>();
  function pickUnique(): SportsCard {
    for (let t = 0; t < 20; t++) {
      const c = pickCard();
      if (!picked.has(c.slug)) { picked.add(c.slug); return c; }
    }
    const c = pickCard(); picked.add(c.slug); return c;
  }

  const gainer = pickUnique();
  const gainerDelta = +(4 + rng() * 14).toFixed(1);
  const loser = pickUnique();
  const loserDelta = -+(3 + rng() * 11).toFixed(1);
  const watch = pickUnique();
  const watchBase = parseValue(watch.estimatedValueRaw);
  const watchTarget = Math.round(watchBase * (1.1 + rng() * 0.4));

  // Build a 12-card ticker
  const ticker: TickerItem[] = [];
  const tickerSlugs = new Set<string>();
  while (ticker.length < 14) {
    const c = pool[Math.floor(rng() * pool.length)];
    if (tickerSlugs.has(c.slug)) continue;
    tickerSlugs.add(c.slug);
    const isUp = rng() < upRatio;
    const magnitude = +(rng() * 8 + 0.4).toFixed(1);
    ticker.push({ card: c, delta: isUp ? magnitude : -magnitude });
  }

  return {
    date: dateK,
    mood,
    indexValue,
    indexDelta,
    openingLine,
    volumeMillions,
    breadth: { up, down: totalBreadth - up },
    gainer,
    gainerDelta,
    gainerStory: buildGainerStory(gainer, gainerDelta),
    loser,
    loserDelta,
    loserStory: buildLoserStory(loser, loserDelta),
    watch,
    watchReason,
    watchTarget,
    closingThought,
    tomorrowTeaser,
    ticker,
    episodeNumber: episodeNum,
  };
}

// --- Component ---
const STORAGE_KEY = 'cv_opening_bell_stats_v1';
const EPOCH_KEY = '2026-01-01';

function episodeNumberFor(dateK: string): number {
  const [y, m, d] = dateK.split('-').map(Number);
  const [ey, em, ed] = EPOCH_KEY.split('-').map(Number);
  const a = Date.UTC(y, m - 1, d);
  const b = Date.UTC(ey, em - 1, ed);
  return Math.max(1, Math.floor((a - b) / 86400000) + 1);
}

interface Stats {
  episodesWatched: number;
  lastEpisode: string;
  bellsRung: number;
}

export default function OpeningBellClient() {
  const today = useMemo(() => dateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [activeSegment, setActiveSegment] = useState<SegmentId>('opening');
  const [playing, setPlaying] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ episodesWatched: 0, lastEpisode: '', bellsRung: 0 });
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Load stats
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist stats
  const saveStats = useCallback((next: Stats) => {
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  // Track "watched" when user opens today's episode
  useEffect(() => {
    if (!mounted) return;
    if (selectedDate === today && stats.lastEpisode !== today) {
      saveStats({
        ...stats,
        episodesWatched: stats.episodesWatched + 1,
        lastEpisode: today,
      });
    }
  }, [mounted, selectedDate, today, stats, saveStats]);

  const episode = useMemo(
    () => generateEpisode(selectedDate, episodeNumberFor(selectedDate)),
    [selectedDate]
  );

  // Previous 7 days
  const recentEpisodes = useMemo(() => {
    const out: string[] = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() - i);
      out.push(dateKey(d));
    }
    return out;
  }, []);

  // Auto-play handling
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      return;
    }
    const seg = SEGMENTS.find(s => s.id === activeSegment)!;
    timerRef.current = window.setTimeout(() => {
      const idx = SEGMENTS.findIndex(s => s.id === activeSegment);
      if (idx < SEGMENTS.length - 1) {
        setActiveSegment(SEGMENTS[idx + 1].id);
      } else {
        setPlaying(false);
      }
    }, seg.durationMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, activeSegment]);

  const handleRingBell = useCallback(() => {
    saveStats({ ...stats, bellsRung: stats.bellsRung + 1 });
    // Bell SFX substitute: brief visual pulse handled via CSS
  }, [stats, saveStats]);

  const handleShare = useCallback(async () => {
    const mood = episode.mood.label;
    const arrow = episode.indexDelta >= 0 ? '▲' : '▼';
    const text = `🔔 The Opening Bell — ${shortDate(episode.date)}\n` +
      `Mood: ${mood} &middot; CVX Index ${episode.indexValue} ${arrow} ${episode.indexDelta}%\n` +
      `Gainer: ${episode.gainer.name} (+${episode.gainerDelta}%)\n` +
      `Loser: ${episode.loser.name} (${episode.loserDelta.toFixed(1)}%)\n` +
      `One to Watch: ${episode.watch.name}\n` +
      `https://cardvault-two.vercel.app/opening-bell`;
    const cleaned = text.replace(/&middot;/g, '·');
    try {
      await navigator.clipboard.writeText(cleaned);
      setShareMsg('Copied to clipboard');
      setTimeout(() => setShareMsg(null), 2500);
    } catch {
      setShareMsg('Copy failed');
      setTimeout(() => setShareMsg(null), 2500);
    }
  }, [episode]);

  const isLive = selectedDate === today;
  const segIdx = SEGMENTS.findIndex(s => s.id === activeSegment);
  const greenArrow = episode.indexDelta >= 0;

  return (
    <div className="space-y-6">
      {/* Broadcast header */}
      <div className={`rounded-2xl border ${episode.mood.border} ${episode.mood.bg} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {isLive ? (
              <span className="inline-flex items-center gap-2 bg-red-600 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-sm tracking-[0.2em] uppercase">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-gray-700 text-gray-200 text-[11px] font-mono font-bold px-2.5 py-1 rounded-sm tracking-[0.2em] uppercase">
                Replay
              </span>
            )}
            <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
              Episode #{episode.episodeNumber.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            {humanDate(episode.date)}
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className={`text-xs font-mono font-bold uppercase tracking-widest mb-1 ${episode.mood.tone}`}>
              Market Mood &middot; {episode.mood.label}
            </div>
            <div className="text-gray-300 text-sm">{episode.mood.blurb}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">CardVault Index</div>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{episode.indexValue.toLocaleString()}</span>
              <span className={`text-sm font-mono ${greenArrow ? 'text-emerald-400' : 'text-rose-400'}`}>
                {greenArrow ? '▲' : '▼'} {Math.abs(episode.indexDelta).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker strip */}
      <div className="relative overflow-hidden rounded-lg border border-gray-800 bg-black">
        <div className="flex gap-6 py-2.5 px-3 animate-[scroll_50s_linear_infinite] whitespace-nowrap">
          {[...episode.ticker, ...episode.ticker].map((t, i) => (
            <Link key={`${t.card.slug}-${i}`} href={`/sports/${t.card.slug}`} className="inline-flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-500">{sportEmoji(t.card.sport)}</span>
              <span className="text-white">{t.card.player}</span>
              <span className="text-gray-500">&middot;</span>
              <span className="text-gray-400">{t.card.year}</span>
              <span className={t.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {t.delta >= 0 ? '+' : ''}{t.delta.toFixed(1)}%
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setPlaying(p => !p); if (!playing && activeSegment === 'closing') setActiveSegment('opening'); }}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-mono font-bold rounded tracking-wider uppercase transition-colors"
          >
            {playing ? '⏸ Pause' : '▶ Play Episode'}
          </button>
          <button
            onClick={() => { setPlaying(false); setActiveSegment('opening'); }}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-mono rounded transition-colors"
          >
            ⟲ Restart
          </button>
          <button
            onClick={handleRingBell}
            className="px-3 py-2 bg-gray-900 border border-amber-700/50 hover:border-amber-500 text-amber-400 text-sm font-mono rounded transition-colors"
            aria-label="Ring the bell"
          >
            🔔 Ring Bell
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-200 text-sm font-mono rounded transition-colors"
          >
            ⎘ Share Episode
          </button>
        </div>
      </div>
      {shareMsg && <div className="text-xs text-emerald-400 font-mono">{shareMsg}</div>}

      {/* Rundown */}
      <div className="grid grid-cols-5 gap-2">
        {SEGMENTS.map((s, i) => {
          const isActive = s.id === activeSegment;
          const isPast = i < segIdx;
          return (
            <button
              key={s.id}
              onClick={() => { setPlaying(false); setActiveSegment(s.id); }}
              className={`text-left rounded-lg px-3 py-2.5 border transition-all ${
                isActive
                  ? 'bg-red-950/60 border-red-700/60'
                  : isPast
                    ? 'bg-gray-900/80 border-gray-800 opacity-70'
                    : 'bg-gray-900/40 border-gray-800/70 hover:border-gray-700'
              }`}
            >
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                Ch. {s.chapter}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm">{s.icon}</span>
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {s.label.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active segment */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5 sm:p-8 min-h-[320px]">
        {activeSegment === 'opening' && <OpeningSegment episode={episode} />}
        {activeSegment === 'gainer' && <GainerSegment episode={episode} />}
        {activeSegment === 'loser' && <LoserSegment episode={episode} />}
        {activeSegment === 'watch' && <WatchSegment episode={episode} />}
        {activeSegment === 'closing' && <ClosingSegment episode={episode} />}
      </div>

      {/* Episode navigator */}
      <div>
        <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Past 7 Episodes</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {recentEpisodes.map(d => {
            const active = d === selectedDate;
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => { setSelectedDate(d); setActiveSegment('opening'); setPlaying(false); }}
                className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                  active
                    ? 'bg-red-950/50 border-red-700/60 text-white'
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 text-gray-300'
                }`}
              >
                <div className="text-[10px] font-mono text-gray-500 uppercase">
                  {isToday ? 'Today' : 'Ep'}
                </div>
                <div className="text-xs font-medium mt-0.5">{shortDate(d)}</div>
                <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                  #{episodeNumberFor(d).toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      {mounted && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Watched</div>
            <div className="text-xl font-bold text-white font-mono">{stats.episodesWatched}</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Bells Rung</div>
            <div className="text-xl font-bold text-amber-400 font-mono">{stats.bellsRung}</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Last Aired</div>
            <div className="text-xs font-mono text-gray-300 mt-1">{stats.lastEpisode || '—'}</div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// --- Segment components ---
function CardPanel({ card, deltaBadge }: { card: SportsCard; deltaBadge?: React.ReactNode }) {
  const val = parseValue(card.estimatedValueRaw);
  return (
    <Link href={`/sports/${card.slug}`} className="block rounded-xl border border-gray-800 hover:border-gray-600 bg-gray-950 p-4 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className={`text-xs font-mono uppercase tracking-widest ${sportColor(card.sport)}`}>
            {sportEmoji(card.sport)} {card.sport} &middot; {card.year}
          </div>
          <div className="text-white font-bold text-lg mt-0.5">{card.player}</div>
          <div className="text-gray-400 text-sm">{card.set} {card.cardNumber ? `#${card.cardNumber}` : ''}</div>
        </div>
        {deltaBadge}
      </div>
      <div className="flex items-center justify-between text-xs font-mono mt-3 pt-3 border-t border-gray-800">
        <span className="text-gray-500 uppercase tracking-widest">Market Value</span>
        <span className="text-white font-bold">{formatMoney(val)}</span>
      </div>
      {card.rookie && (
        <div className="inline-block mt-2 text-[10px] font-mono bg-amber-950/40 border border-amber-800/50 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Rookie</div>
      )}
    </Link>
  );
}

function OpeningSegment({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-red-400 uppercase tracking-[0.25em] mb-2">Chapter 1 &middot; Opening Monologue</div>
      <p className="text-2xl sm:text-3xl text-white font-light leading-snug mb-6">
        &ldquo;{episode.openingLine}&rdquo;
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="rounded-lg border border-gray-800 bg-black/40 px-4 py-3">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Index</div>
          <div className="text-xl font-bold text-white font-mono">{episode.indexValue.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-black/40 px-4 py-3">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Change</div>
          <div className={`text-xl font-bold font-mono ${episode.indexDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {episode.indexDelta >= 0 ? '+' : ''}{episode.indexDelta.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-black/40 px-4 py-3">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Volume</div>
          <div className="text-xl font-bold text-white font-mono">${episode.volumeMillions}M</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-black/40 px-4 py-3">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Breadth</div>
          <div className="text-xl font-bold font-mono">
            <span className="text-emerald-400">{episode.breadth.up}</span>
            <span className="text-gray-600"> / </span>
            <span className="text-rose-400">{episode.breadth.down}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-400 text-sm mt-6 leading-relaxed">
        The tone of today&apos;s session reads <span className={episode.mood.tone}>{episode.mood.label.toLowerCase()}</span>. {episode.mood.blurb} Keep
        that frame in mind as we walk the top names from open to close.
      </p>
    </div>
  );
}

function GainerSegment({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.25em] mb-2">Chapter 2 &middot; Gainer of the Day</div>
      <h3 className="text-2xl font-bold text-white mb-4">Up the board</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <CardPanel
          card={episode.gainer}
          deltaBadge={
            <span className="bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 text-sm font-mono font-bold px-2 py-1 rounded">
              +{episode.gainerDelta.toFixed(1)}%
            </span>
          }
        />
        <div>
          <p className="text-gray-300 leading-relaxed">{episode.gainerStory}</p>
          <Link
            href={`/sports/${episode.gainer.slug}`}
            className="mt-4 inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-mono"
          >
            Open full card page →
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoserSegment({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-rose-400 uppercase tracking-[0.25em] mb-2">Chapter 3 &middot; Loser of the Day</div>
      <h3 className="text-2xl font-bold text-white mb-4">Down the board</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <CardPanel
          card={episode.loser}
          deltaBadge={
            <span className="bg-rose-950/60 border border-rose-700/50 text-rose-400 text-sm font-mono font-bold px-2 py-1 rounded">
              {episode.loserDelta.toFixed(1)}%
            </span>
          }
        />
        <div>
          <p className="text-gray-300 leading-relaxed">{episode.loserStory}</p>
          <Link
            href={`/sports/${episode.loser.slug}`}
            className="mt-4 inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-mono"
          >
            Open full card page →
          </Link>
        </div>
      </div>
    </div>
  );
}

function WatchSegment({ episode }: { episode: Episode }) {
  const current = parseValue(episode.watch.estimatedValueRaw);
  return (
    <div>
      <div className="text-[10px] font-mono text-sky-400 uppercase tracking-[0.25em] mb-2">Chapter 4 &middot; One to Watch</div>
      <h3 className="text-2xl font-bold text-white mb-4">A quiet name worth a look</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        <CardPanel card={episode.watch} />
        <div>
          <p className="text-gray-300 leading-relaxed mb-4">
            Our sleeper today is <span className="text-white font-semibold">{episode.watch.player}</span> — watch for {episode.watchReason}.
          </p>
          <div className="rounded-lg border border-sky-800/50 bg-sky-950/30 px-4 py-3 font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sky-300 text-xs uppercase tracking-widest">Now</span>
              <span className="text-white font-bold">{formatMoney(current)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sky-300 text-xs uppercase tracking-widest">Watch-List Target</span>
              <span className="text-sky-200 font-bold">{formatMoney(episode.watchTarget)}</span>
            </div>
            <div className="text-[10px] text-sky-400/70 mt-2">Illustrative only. Not a price forecast.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClosingSegment({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-amber-400 uppercase tracking-[0.25em] mb-2">Chapter 5 &middot; Closing Bell</div>
      <p className="text-2xl sm:text-3xl text-white font-light leading-snug mb-6">
        &ldquo;{episode.closingThought}&rdquo;
      </p>
      <div className="rounded-lg border border-gray-800 bg-black/40 p-4">
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Tomorrow&apos;s Agenda</div>
        <div className="text-gray-200">Coming up: {episode.tomorrowTeaser}.</div>
      </div>
      <div className="mt-6 text-sm text-gray-400">
        That&apos;s the close on Episode #{episode.episodeNumber.toLocaleString()}. Come back tomorrow for a fresh tape.
      </div>
    </div>
  );
}
