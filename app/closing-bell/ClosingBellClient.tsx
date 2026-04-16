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
  // Note: different multiplier from Opening Bell so the close episode
  // diverges meaningfully from the morning episode of the same day.
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h * 37) + key.charCodeAt(i) + 911) | 0;
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

// --- Post-Close Moods (distinct from Opening Bell's morning moods) ---
const CLOSE_MOODS = [
  { key: 'strong-close', label: 'STRONG CLOSE', tone: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-700/50', blurb: 'Buyers pressed the tape into the close. Asks stayed thin all afternoon.' },
  { key: 'green-print', label: 'GREEN PRINT', tone: 'text-emerald-300', bg: 'bg-emerald-950/30', border: 'border-emerald-800/50', blurb: 'Orderly finish in the green. Bids held; no late liquidation.' },
  { key: 'late-rally', label: 'LATE RALLY', tone: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-700/50', blurb: 'Market faded most of the day then caught a bid into the close.' },
  { key: 'flat-close', label: 'FLAT CLOSE', tone: 'text-amber-300', bg: 'bg-amber-950/30', border: 'border-amber-800/50', blurb: 'Unchanged at the bell. Winners balanced losers. Tape took the day off.' },
  { key: 'late-fade', label: 'LATE FADE', tone: 'text-rose-300', bg: 'bg-rose-950/30', border: 'border-rose-800/50', blurb: 'Held green most of the session, rolled over into the last hour.' },
  { key: 'red-print', label: 'RED PRINT', tone: 'text-rose-400', bg: 'bg-rose-950/40', border: 'border-rose-700/50', blurb: 'Bid ladder collapsed. Every tier gave back something into the close.' },
];

const OPENING_LINES = [
  "Closing bell has rung, desks. Let's wrap the tape.",
  "Good evening, cardboard nation — that's the close.",
  "Evening, collectors. Another session in the books.",
  "The close is in. Here's how it printed.",
  "Lights on the trading floor are dimming. Let's recap.",
  "That's the bell. Bids pulled, asks locked — session over.",
  "Final tape is printed. Here's what the day gave us.",
];

const AFTER_HOURS_STORIES = [
  'a group-chat screenshot leaked a hot PSA 10 reveal just after the close',
  'an auction house posted late consignment preview images catching bidders off-guard',
  'a trade rumor broke on a podcast minutes after the final print',
  'a pop-report update dropped on the PSA site during dinner',
  'an influencer posted an unopened case with an on-camera pull',
  'a grading turnaround update tightened the timeline for pending submissions',
  'a set-completion checklist change added a short-print variant nobody knew existed',
];

const CLOSING_THOUGHTS = [
  'The close is just a snapshot. The story is the trend.',
  'Evening asks are wishful. Morning bids are real.',
  'The best trades settle overnight when nobody is watching.',
  'Winners today are tomorrow\'s benchmark. Losers are tomorrow\'s setup.',
  'Don\'t read too much into a single close. Read into three.',
  'Patience at the bell pays better than conviction at the open.',
  'A quiet close is still a close. Not every day has to scream.',
];

const TOMORROW_TEASERS = [
  'the pre-market gainer watch',
  'a grading-report drop expected at the open',
  'rookies with morning scheduled games',
  'the most-shorted tier in yesterday\'s afternoon tape',
  'whether today\'s winners hold overnight or give it all back',
  'a sleeper segment on cards nobody\'s watching yet',
  'the vintage tier that woke up on our screens at 3pm',
];

// --- Segment identifiers ---
type SegmentId = 'final' | 'winners' | 'losers' | 'afterhours' | 'setup';

interface Segment {
  id: SegmentId;
  chapter: number;
  label: string;
  icon: string;
  durationMs: number;
}

const SEGMENTS: Segment[] = [
  { id: 'final',       chapter: 1, label: 'Final Tape',         icon: '🧾', durationMs: 14000 },
  { id: 'winners',     chapter: 2, label: 'Top 3 Winners',      icon: '🏆', durationMs: 20000 },
  { id: 'losers',      chapter: 3, label: 'Top 3 Losers',       icon: '🧊', durationMs: 20000 },
  { id: 'afterhours',  chapter: 4, label: 'After-Hours',        icon: '🌙', durationMs: 18000 },
  { id: 'setup',       chapter: 5, label: 'Overnight Setup',    icon: '🌅', durationMs: 15000 },
];

// --- Episode generation ---
interface MoverRow {
  card: SportsCard;
  delta: number;
  priceClose: number;
  volHint: string;
}

interface TickerItem {
  card: SportsCard;
  delta: number;
}

interface Episode {
  date: string;
  mood: typeof CLOSE_MOODS[number];
  indexOpen: number;
  indexClose: number;
  indexDelta: number;
  openingLine: string;
  volumeMillions: number;
  breadth: { up: number; down: number };
  winners: MoverRow[];
  losers: MoverRow[];
  afterHours: { card: SportsCard; story: string; priceHint: number };
  afterHoursStory: string;
  closingThought: string;
  tomorrowTeaser: string;
  ticker: TickerItem[];
  episodeNumber: number;
}

function pickOne<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const VOLUME_HINTS = ['thin', 'steady', 'heavy', 'churn', 'breakout'];

function generateEpisode(dateK: string, episodeNum: number): Episode {
  const seed = dateToSeed(dateK);
  const rng = seededRng(seed);

  const pool = sportsCards;

  const mood = pickOne(rng, CLOSE_MOODS);
  const openingLine = pickOne(rng, OPENING_LINES);
  const closingThought = pickOne(rng, CLOSING_THOUGHTS);
  const tomorrowTeaser = pickOne(rng, TOMORROW_TEASERS);
  const afterHoursStory = pickOne(rng, AFTER_HOURS_STORIES);

  const moodBias: Record<string, number> = {
    'strong-close': 85,
    'green-print': 38,
    'late-rally': 42,
    'flat-close': 2,
    'late-fade': -38,
    'red-print': -82,
  };
  const bias = moodBias[mood.key] ?? 0;
  // indexOpen anchors the morning; indexClose shifts by the session bias
  const indexOpen = Math.round(1000 + (rng() - 0.5) * 40);
  const indexClose = Math.round(indexOpen + bias + (rng() - 0.5) * 24);
  const indexDelta = +(((indexClose - indexOpen) / 10) + (rng() - 0.5) * 0.4).toFixed(2);
  const volumeMillions = +(rng() * 22 + 5).toFixed(1);
  const totalBreadth = 240;
  const upRatio = mood.key === 'strong-close' ? 0.74
    : mood.key === 'green-print' ? 0.60
    : mood.key === 'late-rally' ? 0.58
    : mood.key === 'flat-close' ? 0.50
    : mood.key === 'late-fade' ? 0.40
    : 0.26;
  const up = Math.round(totalBreadth * upRatio);

  function pickCard(): SportsCard {
    const sampled: { c: SportsCard; score: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const c = pool[Math.floor(rng() * pool.length)];
      const v = parseValue(c.estimatedValueRaw);
      const score = Math.log10(Math.max(5, v)) + (c.rookie ? 0.3 : 0) + rng() * 1.2;
      sampled.push({ c, score });
    }
    sampled.sort((a, b) => b.score - a.score);
    const topN = sampled.slice(0, 10);
    return topN[Math.floor(rng() * topN.length)].c;
  }

  const picked = new Set<string>();
  function pickUnique(): SportsCard {
    for (let t = 0; t < 30; t++) {
      const c = pickCard();
      if (!picked.has(c.slug)) { picked.add(c.slug); return c; }
    }
    const c = pickCard(); picked.add(c.slug); return c;
  }

  // Top 3 winners
  const winners: MoverRow[] = [];
  const baseWinnerPct = mood.key === 'red-print' ? 3 : 5;
  for (let i = 0; i < 3; i++) {
    const c = pickUnique();
    const pct = +(baseWinnerPct + rng() * 13 + (2 - i) * 2).toFixed(1);
    const basePrice = parseValue(c.estimatedValueRaw);
    const priceClose = Math.round(basePrice * (1 + pct / 100));
    winners.push({ card: c, delta: pct, priceClose, volHint: VOLUME_HINTS[Math.floor(rng() * VOLUME_HINTS.length)] });
  }
  // Sort descending by delta
  winners.sort((a, b) => b.delta - a.delta);

  // Top 3 losers
  const losers: MoverRow[] = [];
  const baseLoserPct = mood.key === 'strong-close' ? 2 : 4;
  for (let i = 0; i < 3; i++) {
    const c = pickUnique();
    const pct = -+(baseLoserPct + rng() * 10 + (2 - i) * 1.5).toFixed(1);
    const basePrice = parseValue(c.estimatedValueRaw);
    const priceClose = Math.round(basePrice * (1 + pct / 100));
    losers.push({ card: c, delta: pct, priceClose, volHint: VOLUME_HINTS[Math.floor(rng() * VOLUME_HINTS.length)] });
  }
  // Sort ascending by delta (most negative first)
  losers.sort((a, b) => a.delta - b.delta);

  // After-hours subject
  const afterCard = pickUnique();
  const afterBase = parseValue(afterCard.estimatedValueRaw);
  const afterMove = +(rng() * 12 + 2).toFixed(1);
  const afterPriceHint = Math.round(afterBase * (1 + (rng() < 0.5 ? afterMove : -afterMove) / 100));

  // Ticker
  const ticker: TickerItem[] = [];
  const tickerSlugs = new Set<string>();
  while (ticker.length < 16) {
    const c = pool[Math.floor(rng() * pool.length)];
    if (tickerSlugs.has(c.slug)) continue;
    tickerSlugs.add(c.slug);
    const isUp = rng() < upRatio;
    const magnitude = +(rng() * 7 + 0.5).toFixed(1);
    ticker.push({ card: c, delta: isUp ? magnitude : -magnitude });
  }

  return {
    date: dateK,
    mood,
    indexOpen,
    indexClose,
    indexDelta,
    openingLine,
    volumeMillions,
    breadth: { up, down: totalBreadth - up },
    winners,
    losers,
    afterHours: { card: afterCard, story: afterHoursStory, priceHint: afterPriceHint },
    afterHoursStory,
    closingThought,
    tomorrowTeaser,
    ticker,
    episodeNumber: episodeNum,
  };
}

// --- Component ---
const STORAGE_KEY = 'cv_closing_bell_stats_v1';
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
  bestCloseSeen: number;
}

export default function ClosingBellClient() {
  const today = useMemo(() => dateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [activeSegment, setActiveSegment] = useState<SegmentId>('final');
  const [playing, setPlaying] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ episodesWatched: 0, lastEpisode: '', bellsRung: 0, bestCloseSeen: 0 });
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const saveStats = useCallback((next: Stats) => {
    setStats(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const episode = useMemo(
    () => generateEpisode(selectedDate, episodeNumberFor(selectedDate)),
    [selectedDate]
  );

  // Track "watched" once per day + best close seen
  useEffect(() => {
    if (!mounted) return;
    if (selectedDate === today && stats.lastEpisode !== today) {
      saveStats({
        ...stats,
        episodesWatched: stats.episodesWatched + 1,
        lastEpisode: today,
        bestCloseSeen: Math.max(stats.bestCloseSeen, episode.indexClose),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, selectedDate, today]);

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
  }, [stats, saveStats]);

  const handleShare = useCallback(async () => {
    const arrow = episode.indexDelta >= 0 ? '▲' : '▼';
    const w = episode.winners[0];
    const l = episode.losers[0];
    const text = `🧾 The Closing Bell — ${shortDate(episode.date)}\n` +
      `Close: ${episode.mood.label} · CVX ${episode.indexClose} ${arrow} ${episode.indexDelta}%\n` +
      `Top Winner: ${w.card.name} (+${w.delta.toFixed(1)}%)\n` +
      `Top Loser: ${l.card.name} (${l.delta.toFixed(1)}%)\n` +
      `After-Hours: ${episode.afterHours.card.name}\n` +
      `https://cardvault-two.vercel.app/closing-bell`;
    try {
      await navigator.clipboard.writeText(text);
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
              <span className="inline-flex items-center gap-2 bg-indigo-600 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-sm tracking-[0.2em] uppercase">
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
              Post-Close Mood &middot; {episode.mood.label}
            </div>
            <div className="text-gray-300 text-sm">{episode.mood.blurb}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">CVX Close</div>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{episode.indexClose.toLocaleString()}</span>
              <span className={`text-sm font-mono ${greenArrow ? 'text-emerald-400' : 'text-rose-400'}`}>
                {greenArrow ? '▲' : '▼'} {Math.abs(episode.indexDelta).toFixed(2)}%
              </span>
            </div>
            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mt-0.5">
              Open {episode.indexOpen.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Ticker strip */}
      <div className="relative overflow-hidden rounded-lg border border-gray-800 bg-black">
        <div className="flex gap-6 py-2.5 px-3 animate-[scroll_55s_linear_infinite] whitespace-nowrap">
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
            onClick={() => { setPlaying(p => !p); if (!playing && activeSegment === 'setup') setActiveSegment('final'); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-mono font-bold rounded tracking-wider uppercase transition-colors"
          >
            {playing ? '⏸ Pause' : '▶ Play Wrap'}
          </button>
          <button
            onClick={() => { setPlaying(false); setActiveSegment('final'); }}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-mono rounded transition-colors"
          >
            ⟲ Restart
          </button>
          <button
            onClick={handleRingBell}
            className="px-3 py-2 bg-gray-900 border border-indigo-700/50 hover:border-indigo-500 text-indigo-300 text-sm font-mono rounded transition-colors"
            aria-label="Ring the closing bell"
          >
            🔔 Ring Close
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-600 text-gray-200 text-sm font-mono rounded transition-colors"
          >
            ⎘ Share Wrap
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
                  ? 'bg-indigo-950/60 border-indigo-700/60'
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
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5 sm:p-8 min-h-[340px]">
        {activeSegment === 'final' && <FinalTapeSegment episode={episode} />}
        {activeSegment === 'winners' && <WinnersSegment episode={episode} />}
        {activeSegment === 'losers' && <LosersSegment episode={episode} />}
        {activeSegment === 'afterhours' && <AfterHoursSegment episode={episode} />}
        {activeSegment === 'setup' && <SetupSegment episode={episode} />}
      </div>

      {/* Episode navigator */}
      <div>
        <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">Past 7 Closes</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {recentEpisodes.map(d => {
            const active = d === selectedDate;
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => { setSelectedDate(d); setActiveSegment('final'); setPlaying(false); }}
                className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                  active
                    ? 'bg-indigo-950/50 border-indigo-700/60 text-white'
                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700 text-gray-300'
                }`}
              >
                <div className="text-[10px] font-mono text-gray-500 uppercase">
                  {isToday ? 'Tonight' : 'Close'}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Watched</div>
            <div className="text-xl font-bold text-white font-mono">{stats.episodesWatched}</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Bells Rung</div>
            <div className="text-xl font-bold text-indigo-300 font-mono">{stats.bellsRung}</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Best CVX Close</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{stats.bestCloseSeen ? stats.bestCloseSeen.toLocaleString() : '—'}</div>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-3">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Last Close</div>
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

function MoverRowPanel({ row, rank, positive }: { row: MoverRow; rank: number; positive: boolean }) {
  const arrow = positive ? '▲' : '▼';
  const color = positive ? 'text-emerald-400' : 'text-rose-400';
  const bg = positive ? 'bg-emerald-950/30 border-emerald-800/50' : 'bg-rose-950/30 border-rose-800/50';
  return (
    <Link href={`/sports/${row.card.slug}`} className={`block rounded-xl border ${bg} hover:brightness-110 p-4 transition-all`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl font-bold font-mono text-white/40 w-10 text-center">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className={`text-[10px] font-mono uppercase tracking-widest ${sportColor(row.card.sport)}`}>
                {sportEmoji(row.card.sport)} {row.card.sport} &middot; {row.card.year}
              </div>
              <div className="text-white font-bold text-base truncate">{row.card.player}</div>
              <div className="text-gray-400 text-xs truncate">{row.card.set} {row.card.cardNumber ? `#${row.card.cardNumber}` : ''}</div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-mono font-bold text-lg ${color}`}>
                {arrow} {Math.abs(row.delta).toFixed(1)}%
              </div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                {row.volHint} vol
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono mt-2 pt-2 border-t border-white/10">
            <span className="text-gray-500 uppercase tracking-widest">Close Print</span>
            <span className="text-white font-bold">{formatMoney(row.priceClose)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FinalTapeSegment({ episode }: { episode: Episode }) {
  const green = episode.indexDelta >= 0;
  return (
    <div>
      <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-[0.25em] mb-2">Chapter 1 &middot; Final Tape</div>
      <p className="text-2xl sm:text-3xl text-white font-light leading-snug mb-6">
        &ldquo;{episode.openingLine}&rdquo;
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="rounded-lg border border-gray-800 bg-black/40 px-4 py-3">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Close</div>
          <div className="text-xl font-bold text-white font-mono">{episode.indexClose.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-black/40 px-4 py-3">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Open → Close</div>
          <div className={`text-xl font-bold font-mono ${green ? 'text-emerald-400' : 'text-rose-400'}`}>
            {green ? '+' : ''}{episode.indexDelta.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-lg border border-gray-800 bg-black/40 px-4 py-3">
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Session Vol</div>
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
        Regular session finished with a <span className={`font-mono font-bold ${episode.mood.tone}`}>{episode.mood.label}</span> print.
        CVX touched <span className="font-mono text-white">{episode.indexOpen.toLocaleString()}</span> at the open and settled
        at <span className="font-mono text-white">{episode.indexClose.toLocaleString()}</span>, putting the session
        at <span className={`font-mono font-bold ${green ? 'text-emerald-400' : 'text-rose-400'}`}>{green ? '+' : ''}{episode.indexDelta.toFixed(2)}%</span>
        {' '}on <span className="font-mono text-white">${episode.volumeMillions}M</span> in simulated volume. Breadth
        was <span className="font-mono text-emerald-400">{episode.breadth.up}</span> up vs <span className="font-mono text-rose-400">{episode.breadth.down}</span> down
        across the tracked tape. Next up — today&apos;s podium.
      </p>
    </div>
  );
}

function WinnersSegment({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.25em] mb-2">Chapter 2 &middot; Top 3 Winners</div>
      <h3 className="text-xl sm:text-2xl text-white font-light leading-snug mb-4">
        The session&apos;s podium — three cards that wouldn&apos;t let the tape sit still.
      </h3>
      <div className="space-y-3">
        {episode.winners.map((w, i) => (
          <MoverRowPanel key={w.card.slug} row={w} rank={i + 1} positive={true} />
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-5 leading-relaxed">
        Top of the board is <span className="font-mono text-emerald-400">{episode.winners[0].card.player}</span> at <span className="font-mono font-bold text-emerald-400">+{episode.winners[0].delta.toFixed(1)}%</span> —
        runner-up <span className="font-mono text-white">{episode.winners[1].card.player}</span> kept pace, and <span className="font-mono text-white">{episode.winners[2].card.player}</span> rounded
        out the podium. Three winners, one afternoon.
      </p>
    </div>
  );
}

function LosersSegment({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-rose-400 uppercase tracking-[0.25em] mb-2">Chapter 3 &middot; Top 3 Losers</div>
      <h3 className="text-xl sm:text-2xl text-white font-light leading-snug mb-4">
        The other side of the tape — three cards that gave back ground into the close.
      </h3>
      <div className="space-y-3">
        {episode.losers.map((l, i) => (
          <MoverRowPanel key={l.card.slug} row={l} rank={i + 1} positive={false} />
        ))}
      </div>
      <p className="text-gray-400 text-sm mt-5 leading-relaxed">
        Biggest drop was <span className="font-mono text-rose-400">{episode.losers[0].card.player}</span> at <span className="font-mono font-bold text-rose-400">{episode.losers[0].delta.toFixed(1)}%</span> —
        <span className="font-mono text-white">{' '}{episode.losers[1].card.player}</span> and <span className="font-mono text-white">{episode.losers[2].card.player}</span> filled the other two
        slots. Not panic — just profit takers.
      </p>
    </div>
  );
}

function AfterHoursSegment({ episode }: { episode: Episode }) {
  const { card, story, priceHint } = episode.afterHours;
  return (
    <div>
      <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-[0.25em] mb-2">Chapter 4 &middot; After-Hours</div>
      <h3 className="text-xl sm:text-2xl text-white font-light leading-snug mb-4">
        Post-close, {story}. The card in focus:
      </h3>
      <Link href={`/sports/${card.slug}`} className="block rounded-xl border border-indigo-800/50 bg-indigo-950/20 hover:bg-indigo-950/30 p-5 transition-colors mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={`text-xs font-mono uppercase tracking-widest ${sportColor(card.sport)}`}>
              {sportEmoji(card.sport)} {card.sport} &middot; {card.year}
            </div>
            <div className="text-white font-bold text-lg mt-0.5">{card.player}</div>
            <div className="text-gray-400 text-sm">{card.set} {card.cardNumber ? `#${card.cardNumber}` : ''}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">After-Hours Print</div>
            <div className="text-lg font-bold text-white font-mono">{formatMoney(priceHint)}</div>
          </div>
        </div>
        {card.rookie && (
          <div className="inline-block mt-3 text-[10px] font-mono bg-amber-950/40 border border-amber-800/50 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Rookie</div>
        )}
      </Link>
      <p className="text-gray-400 text-sm leading-relaxed">
        After-hours prints aren&apos;t the close — they&apos;re the tell. If a bid-ask spread is still tightening in the
        evening tape, the next open usually picks up where this one left off. The indicated after-hours value
        above is <span className="font-mono text-white">{formatMoney(priceHint)}</span> — we&apos;ll know by tomorrow&apos;s open whether
        that holds.
      </p>
    </div>
  );
}

function SetupSegment({ episode }: { episode: Episode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-amber-300 uppercase tracking-[0.25em] mb-2">Chapter 5 &middot; Overnight Setup</div>
      <p className="text-2xl sm:text-3xl text-white font-light leading-snug mb-6">
        &ldquo;{episode.closingThought}&rdquo;
      </p>
      <div className="rounded-xl border border-gray-800 bg-black/40 p-5 mb-4">
        <div className="text-[10px] font-mono text-amber-300 uppercase tracking-widest mb-2">Tomorrow&apos;s Morning Setup</div>
        <div className="text-white text-base font-medium">On the slate at the open: {episode.tomorrowTeaser}.</div>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">
        That wraps tonight&apos;s session. Tune The Opening Bell in the morning for the pre-market take, and we&apos;ll
        reconvene here at the close with a fresh five-segment recap. Trade safe, sleeve your cards, and don&apos;t
        let tomorrow&apos;s tape price tonight&apos;s regrets.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/opening-bell" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 border border-red-800/50 hover:border-red-500 rounded-lg text-sm text-red-300 transition-colors">
          <span>🔔</span> Pre-Market &middot; Opening Bell
        </Link>
        <Link href="/market-movers" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg text-sm text-gray-200 transition-colors">
          <span>🚀</span> Market Movers
        </Link>
        <Link href="/card-of-the-day" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg text-sm text-gray-200 transition-colors">
          <span>🗓️</span> Tomorrow&apos;s Card of the Day
        </Link>
      </div>
    </div>
  );
}
