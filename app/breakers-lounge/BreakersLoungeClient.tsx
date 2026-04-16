'use client';

import { useState, useEffect, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Status = 'on-air' | 'qa' | 'pre-break' | 'between' | 'offline';

interface Host {
  id: string;
  handle: string;
  avatar: string;
  style: string;
  styleDesc: string;
  accent: string;
  border: string;
  signatureQuotes: string[];
  products: string[];
}

interface HostState {
  status: Status;
  viewers: number;
  product: string | null;
  lastHit: { cardName: string; value: string } | null;
  nextBreakInMin: number | null;
  currentQuote: string;
  streamMin: number;
}

const HOSTS: Host[] = [
  {
    id: 'hype-king',
    handle: 'HypeKingBreaks',
    avatar: '👑',
    style: 'Hype King',
    styleDesc: 'High-energy breaks, loud hits, chat goes wild.',
    accent: 'text-rose-300',
    border: 'border-rose-700/50 bg-rose-950/30',
    signatureQuotes: [
      'THAT\'S A BIG PULL BABY 🔥🔥🔥',
      'I told y\'all this break was going to hit!',
      'CHAT, WE EATING TONIGHT',
      'Who\'s ready for the next one?! Let\'s GO',
      'That card just paid for the whole box',
    ],
    products: ['2024 Panini Prizm Football Hobby', '2024 Topps Chrome Baseball', '2024-25 Panini Select Basketball'],
  },
  {
    id: 'calm-analyst',
    handle: 'TheSetSensei',
    avatar: '🧘',
    style: 'Calm Analyst',
    styleDesc: 'Deep card knowledge, set history, no theatrics.',
    accent: 'text-sky-300',
    border: 'border-sky-700/50 bg-sky-950/30',
    signatureQuotes: [
      'Print run on this parallel is historically significant.',
      'Let me pull up the PSA pop report on that one.',
      'This set checklist has an interesting anomaly worth noting.',
      'The grading curve on this era is consistently tough.',
      'Comparable sales suggest this is trading above trend.',
    ],
    products: ['2024 Bowman Chrome Baseball', '2023-24 Upper Deck Series 2 Hockey', '2024 Panini National Treasures Football'],
  },
  {
    id: 'comedy-bit',
    handle: 'BreakingBadly',
    avatar: '🎭',
    style: 'Comedy Bit',
    styleDesc: 'Breaks double as a stand-up set, skits between packs.',
    accent: 'text-amber-300',
    border: 'border-amber-700/50 bg-amber-950/30',
    signatureQuotes: [
      'Ladies and gentlemen, a base card. My third favorite genre of card.',
      'I swear this box was sealed by a toddler with a grudge.',
      'If this pack hits I will eat my neighbor\'s lawn. No notes.',
      'Welcome back, new viewer who will immediately leave.',
      'The card gods are unionized this week and on strike.',
    ],
    products: ['2024 Topps Heritage Baseball', '2024-25 Panini Donruss Basketball', '2024 Panini Score Football'],
  },
  {
    id: 'prospect-hunter',
    handle: 'ProspectPete',
    avatar: '🔭',
    style: 'Prospect Hunter',
    styleDesc: 'Low-numbered Bowman, college specialists, draft season obsessed.',
    accent: 'text-emerald-300',
    border: 'border-emerald-700/50 bg-emerald-950/30',
    signatureQuotes: [
      'That 1st Bowman Chrome is a real sleeper — watch this name.',
      'Prospect drops next Wednesday; boxes are already drying up.',
      'Check-swing Tuesday had him pegged as a riser.',
      'Short-prints on this checklist are brutal this year.',
      'Autograph per case ratio matters more than people admit.',
    ],
    products: ['2024 Bowman Chrome Draft', '2024-25 Panini Prizm Draft Picks', '2024 Panini Contenders Draft'],
  },
  {
    id: 'old-school',
    handle: 'GrandpaRips',
    avatar: '🧢',
    style: 'Old School',
    styleDesc: 'Vintage wax, penny sleeves, 40 years of stories per break.',
    accent: 'text-yellow-300',
    border: 'border-yellow-700/50 bg-yellow-950/30',
    signatureQuotes: [
      'Back in my day this pack cost a quarter. Now? Two hundred.',
      'Careful with the gum — it\'ll wreck the centering worse than a kid could.',
      'I opened 15 of these in 1987. Never pulled the Bo Jackson.',
      'Boys, this is real cardboard. None of that chrome stuff.',
      'If you crack these too fast you\'re disrespecting the card.',
    ],
    products: ['1987 Topps Wax Box', '1989 Upper Deck Baseball Low Series', '1986 Fleer Basketball Cello Pack'],
  },
  {
    id: 'speed-ripper',
    handle: 'RapidRipRandy',
    avatar: '⚡',
    style: 'Speed Ripper',
    styleDesc: 'Ten packs in ten minutes, efficiency over theater.',
    accent: 'text-cyan-300',
    border: 'border-cyan-700/50 bg-cyan-950/30',
    signatureQuotes: [
      'Alright, 48 packs to go. Keep up.',
      'Base, base, base — next.',
      'No time to read the backs, chat.',
      'That\'s a hit. Scanning. Moving on.',
      'Breaking the whole case in 22 minutes or your money back.',
    ],
    products: ['2024 Panini Prizm Mega Box', '2024 Topps Series 2 Jumbo', '2024 Panini Select Basketball Retail'],
  },
  {
    id: 'bass-blaster',
    handle: 'BassLoudBreaks',
    avatar: '🔊',
    style: 'Bass Blaster',
    styleDesc: 'Music-first stream, every hit gets an air horn, party vibes.',
    accent: 'text-fuchsia-300',
    border: 'border-fuchsia-700/50 bg-fuchsia-950/30',
    signatureQuotes: [
      '*AIR HORN* THAT JUST HIT',
      'DJ keeping the vibes up tonight chat',
      'This beat drops WHEN the auto drops',
      'Turn your sound ALL THE WAY UP for this one',
      'If we hit a 1/1 the bass goes nuclear',
    ],
    products: ['2024 Panini Mosaic Football', '2024 Panini Optic Basketball', '2024 Topps Chrome Update Baseball'],
  },
  {
    id: 'bargain-master',
    handle: 'DealDiggerDan',
    avatar: '💸',
    style: 'Bargain Master',
    styleDesc: 'Value-focused, breaks on budget products, teaches cost-per-spot math.',
    accent: 'text-lime-300',
    border: 'border-lime-700/50 bg-lime-950/30',
    signatureQuotes: [
      'Cost-per-spot on this format is a steal, do the math.',
      'Not every break needs to be $500. Show me ROI.',
      'Budget breakers eat well. High-end breakers eat anxiety.',
      'Retail boxes still pull chasers — don\'t let anyone tell you different.',
      'Math the break before you math the dream.',
    ],
    products: ['2024 Panini Prizm Blaster Box', '2024 Topps Update Baseball Hanger', '2024-25 Upper Deck Young Guns Blaster'],
  },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; pulse: boolean }> = {
  'on-air': { label: 'ON AIR', color: 'bg-red-900/60 text-red-300 border-red-700/60', pulse: true },
  'qa': { label: 'Q&A', color: 'bg-indigo-900/60 text-indigo-300 border-indigo-700/60', pulse: false },
  'pre-break': { label: 'PRE-BREAK HYPE', color: 'bg-amber-900/60 text-amber-300 border-amber-700/60', pulse: true },
  'between': { label: 'BETWEEN BREAKS', color: 'bg-gray-800/60 text-gray-400 border-gray-700/60', pulse: false },
  'offline': { label: 'OFFLINE', color: 'bg-slate-900/60 text-slate-500 border-slate-800/60', pulse: false },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomStatus(): Status {
  const r = Math.random();
  if (r < 0.5) return 'on-air';
  if (r < 0.65) return 'qa';
  if (r < 0.78) return 'pre-break';
  if (r < 0.9) return 'between';
  return 'offline';
}

function randomViewers(status: Status): number {
  if (status === 'offline') return 0;
  if (status === 'between') return 50 + Math.floor(Math.random() * 200);
  if (status === 'pre-break') return 200 + Math.floor(Math.random() * 800);
  if (status === 'qa') return 150 + Math.floor(Math.random() * 500);
  return 400 + Math.floor(Math.random() * 2400);
}

function randomCard() {
  // Bias toward higher-value cards for "hits"
  const filtered = sportsCards.filter(c => {
    const match = c.estimatedValueRaw.match(/\$(\d+)/);
    return match && parseInt(match[1]) > 25;
  });
  const pick = pickRandom(filtered.length > 0 ? filtered : sportsCards);
  const match = pick.estimatedValueRaw.match(/\$([\d,]+)/);
  return {
    cardName: pick.name,
    value: match ? `$${match[1]}` : pick.estimatedValueRaw.split('(')[0].trim(),
  };
}

function buildInitialState(h: Host): HostState {
  const status = randomStatus();
  return {
    status,
    viewers: randomViewers(status),
    product: status === 'on-air' || status === 'pre-break' ? pickRandom(h.products) : null,
    lastHit: Math.random() < 0.6 ? randomCard() : null,
    nextBreakInMin: status === 'between' || status === 'pre-break' ? 2 + Math.floor(Math.random() * 18) : null,
    currentQuote: pickRandom(h.signatureQuotes),
    streamMin: status === 'offline' ? 0 : Math.floor(Math.random() * 180),
  };
}

interface ActivityEntry {
  ts: number;
  hostHandle: string;
  hostAvatar: string;
  text: string;
  isHit: boolean;
}

export default function BreakersLoungeClient() {
  const [states, setStates] = useState<Record<string, HostState>>(() => {
    const init: Record<string, HostState> = {};
    HOSTS.forEach(h => { init[h.id] = buildInitialState(h); });
    return init;
  });
  const [paused, setPaused] = useState(false);
  const [followed, setFollowed] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate followed from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cardvault_breakers_lounge_followed');
      if (stored) setFollowed(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  // Persist followed
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('cardvault_breakers_lounge_followed', JSON.stringify(followed));
    } catch {}
  }, [followed, hydrated]);

  // Simulation loop
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setStates(prev => {
        const next = { ...prev };
        // Pick one random host to update significantly each tick
        const host = pickRandom(HOSTS);
        const prior = prev[host.id];
        const shouldRotateStatus = Math.random() < 0.35;
        const newStatus = shouldRotateStatus ? randomStatus() : prior.status;
        const newHit = Math.random() < 0.25 && newStatus === 'on-air' ? randomCard() : prior.lastHit;

        next[host.id] = {
          ...prior,
          status: newStatus,
          viewers: randomViewers(newStatus),
          product: newStatus === 'on-air' || newStatus === 'pre-break' ? pickRandom(host.products) : null,
          lastHit: newHit,
          nextBreakInMin: newStatus === 'between' || newStatus === 'pre-break'
            ? 2 + Math.floor(Math.random() * 18)
            : null,
          currentQuote: pickRandom(host.signatureQuotes),
          streamMin: newStatus === 'offline' ? 0 : prior.streamMin + 1,
        };

        // Log activity when something notable happens
        if (newHit !== prior.lastHit && newHit) {
          setActivity(a => [{
            ts: Date.now(),
            hostHandle: host.handle,
            hostAvatar: host.avatar,
            text: `pulled ${newHit.cardName} (${newHit.value})`,
            isHit: true,
          }, ...a].slice(0, 15));
        } else if (shouldRotateStatus && newStatus === 'on-air' && prior.status !== 'on-air') {
          setActivity(a => [{
            ts: Date.now(),
            hostHandle: host.handle,
            hostAvatar: host.avatar,
            text: `went live ripping ${next[host.id].product}`,
            isHit: false,
          }, ...a].slice(0, 15));
        } else if (shouldRotateStatus && newStatus === 'offline') {
          setActivity(a => [{
            ts: Date.now(),
            hostHandle: host.handle,
            hostAvatar: host.avatar,
            text: 'signed off for the night',
            isHit: false,
          }, ...a].slice(0, 15));
        }

        return next;
      });
    }, 6500);
    return () => clearInterval(interval);
  }, [paused]);

  const toggleFollow = (id: string) => {
    setFollowed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const sortedHosts = useMemo(() => {
    return [...HOSTS].sort((a, b) => {
      const af = followed.includes(a.id);
      const bf = followed.includes(b.id);
      if (af !== bf) return af ? -1 : 1;
      // Then by viewer count descending
      return states[b.id].viewers - states[a.id].viewers;
    });
  }, [states, followed]);

  const totalLive = useMemo(
    () => HOSTS.filter(h => states[h.id].status === 'on-air').length,
    [states]
  );
  const totalViewers = useMemo(
    () => HOSTS.reduce((sum, h) => sum + states[h.id].viewers, 0),
    [states]
  );
  const followedActivity = useMemo(
    () => activity.filter(a => {
      const host = HOSTS.find(h => h.handle === a.hostHandle);
      return host && followed.includes(host.id);
    }),
    [activity, followed]
  );

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">On Air</div>
          <div className="text-2xl font-bold text-red-400">{totalLive} <span className="text-xs text-gray-500">/ {HOSTS.length}</span></div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total Viewers</div>
          <div className="text-2xl font-bold text-violet-400">{totalViewers.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
          <div className="text-2xl font-bold text-amber-400">{followed.length}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Feed</div>
            <div className={`text-sm font-semibold ${paused ? 'text-gray-400' : 'text-emerald-400'}`}>
              {paused ? 'Paused' : 'Live'}
            </div>
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      {/* Host grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedHosts.map(host => {
          const s = states[host.id];
          const cfg = STATUS_CONFIG[s.status];
          const isFollowed = followed.includes(host.id);
          return (
            <div
              key={host.id}
              className={`rounded-xl border p-5 transition-all ${host.border} ${isFollowed ? 'ring-2 ring-amber-500/40' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{host.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold ${host.accent}`}>{host.handle}</h3>
                      {isFollowed && <span className="text-amber-400 text-xs">★ Following</span>}
                    </div>
                    <p className="text-xs text-gray-500">{host.style} &middot; {host.styleDesc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(host.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    isFollowed
                      ? 'bg-amber-900/40 border border-amber-700/50 text-amber-300'
                      : 'bg-gray-700/50 hover:bg-gray-600/60 border border-gray-600/50 text-gray-300'
                  }`}
                >
                  {isFollowed ? 'Unfollow' : 'Follow'}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${cfg.color}`}>
                  {cfg.pulse && <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />}
                  {cfg.label}
                </span>
                {s.status !== 'offline' && (
                  <span className="text-xs text-gray-400">
                    {s.viewers.toLocaleString()} viewer{s.viewers === 1 ? '' : 's'}
                  </span>
                )}
                {s.status !== 'offline' && s.streamMin > 0 && (
                  <span className="text-xs text-gray-500">&middot; {s.streamMin}m live</span>
                )}
              </div>

              {s.product && (
                <div className="mb-2">
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">Now Ripping</div>
                  <div className="text-sm text-white">{s.product}</div>
                </div>
              )}

              {s.nextBreakInMin !== null && (
                <div className="mb-2">
                  <div className="text-[10px] uppercase tracking-wide text-gray-500">Next Break</div>
                  <div className="text-sm text-gray-300">In {s.nextBreakInMin} minute{s.nextBreakInMin === 1 ? '' : 's'}</div>
                </div>
              )}

              {s.lastHit && (
                <div className="mb-3 bg-black/30 border border-gray-700/50 rounded-md px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-emerald-400 flex items-center gap-1">
                    🎯 Last Hit
                  </div>
                  <div className="text-xs text-white">{s.lastHit.cardName}</div>
                  <div className="text-xs text-emerald-300 font-semibold">{s.lastHit.value}</div>
                </div>
              )}

              <blockquote className={`text-sm italic ${host.accent} border-l-2 border-current/30 pl-3`}>
                &ldquo;{s.currentQuote}&rdquo;
              </blockquote>
            </div>
          );
        })}
      </div>

      {/* Followed Activity Feed */}
      {followed.length > 0 && (
        <div className="bg-gray-800/30 border border-amber-700/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400">★</span>
            <h2 className="font-bold text-white text-sm">Followed Activity</h2>
            <span className="text-xs text-gray-500">({followedActivity.length})</span>
          </div>
          {followedActivity.length === 0 ? (
            <p className="text-xs text-gray-500">
              No activity from your followed breakers yet. Keep watching — the feed updates every 6 seconds.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {followedActivity.map((a, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                  <span>{a.hostAvatar}</span>
                  <span className={a.isHit ? 'text-emerald-300' : ''}>
                    <span className="font-semibold">{a.hostHandle}</span> {a.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Style legend */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5">
        <h2 className="font-bold text-white text-sm mb-3">Breaker Archetypes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {HOSTS.map(h => (
            <div key={h.id} className="flex items-start gap-2">
              <span>{h.avatar}</span>
              <div>
                <span className={`font-semibold ${h.accent}`}>{h.style}</span>
                <span className="text-gray-500"> &middot; {h.styleDesc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
