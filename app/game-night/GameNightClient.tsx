'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

const sportConfig: Record<Sport, { icon: string; color: string; bg: string; border: string; events: string[]; teams: string[][] }> = {
  baseball: {
    icon: '⚾', color: 'text-rose-400', bg: 'bg-rose-950/40', border: 'border-rose-800/40',
    events: ['singles', 'doubles', 'home run', 'strikeout (pitching)', 'stolen base', 'diving catch', 'walk-off hit', 'double play turned', 'hit by pitch'],
    teams: [['NYY','BOS'],['LAD','SF'],['HOU','TEX'],['ATL','PHI'],['SD','ARI'],['CHC','MIL'],['CLE','DET'],['BAL','TB'],['SEA','MIN'],['STL','CIN']],
  },
  basketball: {
    icon: '🏀', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40',
    events: ['three-pointer', 'dunk', 'block', 'steal', 'assist', 'and-one play', 'buzzer-beater', 'triple-double watch', 'technical foul'],
    teams: [['BOS','MIL'],['DEN','LAL'],['PHX','DAL'],['MIA','NYK'],['OKC','MIN'],['PHI','CLE'],['SAC','GSW'],['MEM','NOP'],['IND','CHI'],['ATL','ORL']],
  },
  football: {
    icon: '🏈', color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/40',
    events: ['touchdown pass', 'rushing touchdown', 'interception', 'sack', 'fumble recovery', 'pick-six', 'field goal', 'punt return TD', '100-yard game'],
    teams: [['KC','BUF'],['SF','DAL'],['PHI','NYG'],['BAL','CIN'],['DET','GB'],['HOU','JAX'],['MIA','NYJ'],['MIN','CHI'],['LAR','SEA'],['DEN','LV']],
  },
  hockey: {
    icon: '🏒', color: 'text-sky-400', bg: 'bg-sky-950/40', border: 'border-sky-800/40',
    events: ['goal', 'assist', 'save (goalie)', 'power-play goal', 'shorthanded goal', 'hat trick watch', 'fight', 'penalty shot', 'empty-net goal'],
    teams: [['EDM','COL'],['TOR','MTL'],['NYR','NJD'],['CAR','FLA'],['DAL','MIN'],['VGK','LAK'],['BOS','DET'],['TBL','WSH'],['WPG','NSH'],['VAN','CGY']],
  },
};

interface GameEvent {
  id: number;
  time: string;
  sport: Sport;
  player: string;
  event: string;
  matchup: string;
  impact: number; // percentage card value change
  card: SportsCard;
  timestamp: number;
}

function dateHash(): number {
  const d = new Date();
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatPct(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function gameTime(sport: Sport, rng: () => number): string {
  switch (sport) {
    case 'baseball': { const inn = Math.floor(rng() * 9) + 1; const half = rng() > 0.5 ? 'Top' : 'Bot'; return `${half} ${inn}${inn === 1 ? 'st' : inn === 2 ? 'nd' : inn === 3 ? 'rd' : 'th'}`; }
    case 'basketball': { const q = Math.floor(rng() * 4) + 1; const min = Math.floor(rng() * 12); return `Q${q} ${min}:${String(Math.floor(rng() * 60)).padStart(2, '0')}`; }
    case 'football': { const q = Math.floor(rng() * 4) + 1; const min = Math.floor(rng() * 15); return `Q${q} ${min}:${String(Math.floor(rng() * 60)).padStart(2, '0')}`; }
    case 'hockey': { const p = Math.floor(rng() * 3) + 1; const min = Math.floor(rng() * 20); return `P${p} ${min}:${String(Math.floor(rng() * 60)).padStart(2, '0')}`; }
  }
}

function impactForEvent(event: string, rng: () => number): number {
  const base: Record<string, [number, number]> = {
    'home run': [2, 8], 'walk-off hit': [5, 15], 'strikeout (pitching)': [1, 4], 'stolen base': [1, 3],
    'diving catch': [1, 5], 'singles': [0.5, 2], 'doubles': [1, 3], 'double play turned': [0.5, 2], 'hit by pitch': [-1, 1],
    'three-pointer': [1, 4], 'dunk': [2, 6], 'block': [1, 3], 'steal': [1, 3], 'assist': [0.5, 2],
    'and-one play': [2, 5], 'buzzer-beater': [5, 15], 'triple-double watch': [3, 10], 'technical foul': [-2, -0.5],
    'touchdown pass': [3, 8], 'rushing touchdown': [3, 7], 'interception': [2, 6], 'sack': [1, 4],
    'fumble recovery': [1, 4], 'pick-six': [4, 12], 'field goal': [0.5, 2], 'punt return TD': [3, 8], '100-yard game': [2, 6],
    'goal': [2, 7], 'hockey assist': [1, 3], 'save (goalie)': [1, 4], 'power-play goal': [3, 8],
    'shorthanded goal': [4, 10], 'hat trick watch': [5, 15], 'fight': [-1, 2], 'penalty shot': [2, 6], 'empty-net goal': [1, 3],
  };
  const range = base[event] || [1, 5];
  return range[0] + rng() * (range[1] - range[0]);
}

export default function GameNightClient() {
  const [mounted, setMounted] = useState(false);
  const [activeSport, setActiveSport] = useState<Sport | 'all'>('all');
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [liveGames, setLiveGames] = useState<{ sport: Sport; matchup: string; score: string }[]>([]);
  const eventIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardsBySport = useMemo(() => {
    const map: Record<Sport, SportsCard[]> = { baseball: [], basketball: [], football: [], hockey: [] };
    for (const c of sportsCards) {
      if (c.sport in map) map[c.sport as Sport].push(c);
    }
    return map;
  }, []);

  // Initialize live games for today
  useEffect(() => {
    const rng = seededRng(dateHash());
    const games: { sport: Sport; matchup: string; score: string }[] = [];
    for (const sport of ['baseball', 'basketball', 'football', 'hockey'] as Sport[]) {
      const cfg = sportConfig[sport];
      const numGames = Math.floor(rng() * 3) + 2; // 2-4 games per sport
      for (let i = 0; i < numGames && i < cfg.teams.length; i++) {
        const [a, b] = cfg.teams[Math.floor(rng() * cfg.teams.length)];
        const s1 = Math.floor(rng() * (sport === 'baseball' ? 8 : sport === 'hockey' ? 5 : sport === 'football' ? 35 : 110));
        const s2 = Math.floor(rng() * (sport === 'baseball' ? 8 : sport === 'hockey' ? 5 : sport === 'football' ? 35 : 110));
        games.push({ sport, matchup: `${a} vs ${b}`, score: `${s1}-${s2}` });
      }
    }
    setLiveGames(games);
    setMounted(true);
  }, []);

  const generateEvent = useCallback(() => {
    const rng = seededRng(Date.now() + eventIdRef.current);
    const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
    const sport = sports[Math.floor(rng() * sports.length)];
    const cfg = sportConfig[sport];
    const cards = cardsBySport[sport];
    if (cards.length === 0) return null;

    const card = cards[Math.floor(rng() * cards.length)];
    const event = cfg.events[Math.floor(rng() * cfg.events.length)];
    const teamPair = cfg.teams[Math.floor(rng() * cfg.teams.length)];
    const matchup = `${teamPair[0]} vs ${teamPair[1]}`;
    const impact = impactForEvent(event, rng);
    const time = gameTime(sport, rng);

    eventIdRef.current++;
    return {
      id: eventIdRef.current,
      time,
      sport,
      player: card.player,
      event,
      matchup,
      impact,
      card,
      timestamp: Date.now(),
    } as GameEvent;
  }, [cardsBySport]);

  // Auto-generate events
  useEffect(() => {
    if (!mounted || paused) return;

    intervalRef.current = setInterval(() => {
      const ev = generateEvent();
      if (ev) {
        setEvents(prev => [ev, ...prev].slice(0, 50));
      }
    }, 4000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [mounted, paused, generateEvent]);

  // Generate initial batch
  useEffect(() => {
    if (!mounted) return;
    const initial: GameEvent[] = [];
    for (let i = 0; i < 8; i++) {
      const ev = generateEvent();
      if (ev) initial.push(ev);
    }
    setEvents(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const filteredEvents = useMemo(() => {
    if (activeSport === 'all') return events;
    return events.filter(e => e.sport === activeSport);
  }, [events, activeSport]);

  // Top movers
  const topMovers = useMemo(() => {
    const playerMap = new Map<string, { player: string; sport: Sport; totalImpact: number; eventCount: number; card: SportsCard }>();
    for (const ev of events) {
      const existing = playerMap.get(ev.player);
      if (existing) {
        existing.totalImpact += ev.impact;
        existing.eventCount++;
      } else {
        playerMap.set(ev.player, { player: ev.player, sport: ev.sport, totalImpact: ev.impact, eventCount: 1, card: ev.card });
      }
    }
    return [...playerMap.values()].sort((a, b) => b.totalImpact - a.totalImpact).slice(0, 5);
  }, [events]);

  if (!mounted) {
    return <div className="min-h-[400px] flex items-center justify-center text-gray-500">Loading live games...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Live scoreboard */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Live Games Tonight</h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {liveGames.map((g, i) => (
            <div key={i} className={`${sportConfig[g.sport].bg} ${sportConfig[g.sport].border} border rounded-lg px-3 py-2 text-center`}>
              <div className="text-lg">{sportConfig[g.sport].icon}</div>
              <div className="text-xs text-gray-400">{g.matchup}</div>
              <div className="text-sm font-bold text-white">{g.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSport('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeSport === 'all' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            All Sports
          </button>
          {(['baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
            <button
              key={s}
              onClick={() => setActiveSport(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeSport === s ? `${sportConfig[s].bg} ${sportConfig[s].color}` : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {sportConfig[s].icon} {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            paused ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'
          }`}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-white">Live Card Impact Feed</h2>
          {filteredEvents.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No events yet. Games are heating up...</div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map(ev => {
                const cfg = sportConfig[ev.sport];
                const value = parseValue(ev.card.estimatedValueRaw);
                const isPositive = ev.impact >= 0;
                return (
                  <div key={ev.id} className={`${cfg.bg} ${cfg.border} border rounded-xl p-4 transition-all animate-in`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{cfg.icon}</span>
                          <span className="text-xs text-gray-500">{ev.matchup} &middot; {ev.time}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/sports/${ev.card.slug}`} className="text-white font-semibold hover:text-emerald-400 truncate">
                            {ev.player}
                          </Link>
                          {ev.card.rookie && (
                            <span className="bg-amber-900/40 text-amber-400 text-[10px] font-medium px-1.5 py-0.5 rounded">RC</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          <span className="capitalize font-medium text-gray-300">{ev.event}</span>
                          {value > 0 && <span className="text-gray-500"> &middot; {ev.card.estimatedValueRaw}</span>}
                        </p>
                      </div>
                      <div className={`text-right shrink-0 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className="text-lg font-bold">{formatPct(ev.impact)}</div>
                        <div className="text-xs text-gray-500">card impact</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Top movers */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tonight&apos;s Top Movers</h3>
            {topMovers.length === 0 ? (
              <p className="text-sm text-gray-500">Waiting for events...</p>
            ) : (
              <div className="space-y-2">
                {topMovers.map((m, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{sportConfig[m.sport].icon}</span>
                      <div className="min-w-0">
                        <Link href={`/sports/${m.card.slug}`} className="text-sm font-medium text-white hover:text-emerald-400 truncate block">
                          {m.player}
                        </Link>
                        <div className="text-xs text-gray-500">{m.eventCount} event{m.eventCount !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${m.totalImpact >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPct(m.totalImpact)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tonight&apos;s Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{events.length}</div>
                <div className="text-xs text-gray-500">Events</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{liveGames.length}</div>
                <div className="text-xs text-gray-500">Games</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-400">
                  {events.filter(e => e.impact >= 5).length}
                </div>
                <div className="text-xs text-gray-500">Big Moves</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  {new Set(events.map(e => e.player)).size}
                </div>
                <div className="text-xs text-gray-500">Players</div>
              </div>
            </div>
          </div>

          {/* Related */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Related</h3>
            <div className="space-y-1.5 text-sm">
              <Link href="/market-movers" className="block text-emerald-400 hover:underline">Market Movers</Link>
              <Link href="/community-pulse" className="block text-emerald-400 hover:underline">Community Pulse</Link>
              <Link href="/market-alerts" className="block text-emerald-400 hover:underline">Market Alerts</Link>
              <Link href="/live-ticker" className="block text-emerald-400 hover:underline">Live Ticker</Link>
              <Link href="/event-countdowns" className="block text-emerald-400 hover:underline">Event Countdowns</Link>
              <Link href="/market-correlations" className="block text-emerald-400 hover:underline">Market Correlations</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
