'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type ErrorType = 'MISCUT' | 'MISSING_NAME' | 'COLOR_SWAP' | 'BACK_ERROR' | 'PRINTING_PLATE' | 'CENTERING' | 'MISSING_INK';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'multi';
type PressStatus = 'famous' | 'emerging' | 'unknown';

type ErrorTypeMeta = {
  label: string;
  emoji: string;
  weight: number;
  badge: string;
  strip: string;
  minMult: number;
  maxMult: number;
  descriptors: string[];
};

const TYPES: Record<ErrorType, ErrorTypeMeta> = {
  MISCUT: {
    label: 'MISCUT',
    emoji: '✂️',
    weight: 26,
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    strip: 'bg-gradient-to-b from-rose-500 to-pink-600',
    minMult: 3,
    maxMult: 20,
    descriptors: ['cut off-register', 'adjacent card visible on right edge', 'severely miscut top border', 'diagonal miscut', '15% of neighboring card visible', 'production-sheet miscut'],
  },
  MISSING_NAME: {
    label: 'MISSING NAME-PLATE',
    emoji: '👻',
    weight: 8,
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
    strip: 'bg-gradient-to-b from-violet-500 to-purple-600',
    minMult: 5,
    maxMult: 30,
    descriptors: ['no name on front', 'blank name-plate', 'missing name + team', 'ghost-plate variant', 'name-less production error'],
  },
  COLOR_SWAP: {
    label: 'COLOR SWAP',
    emoji: '🎨',
    weight: 10,
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/50',
    strip: 'bg-gradient-to-b from-pink-500 to-rose-600',
    minMult: 10,
    maxMult: 40,
    descriptors: ['yellow ink missing (all-red)', 'cyan ink missing (all-red/yellow)', 'full color separation', 'mis-registered CMYK', 'inverted color channels'],
  },
  BACK_ERROR: {
    label: 'BACK-SIDE ERROR',
    emoji: '🔄',
    weight: 18,
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    strip: 'bg-gradient-to-b from-amber-500 to-orange-600',
    minMult: 3,
    maxMult: 15,
    descriptors: ['wrong player back', 'upside-down back', 'mis-aligned stats', 'wrong set back', 'blank back', 'back-side printing offset'],
  },
  PRINTING_PLATE: {
    label: 'PRINTING PLATE',
    emoji: '📜',
    weight: 5,
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    strip: 'bg-gradient-to-b from-yellow-500 to-amber-600',
    minMult: 100,
    maxMult: 500,
    descriptors: ['cyan printing plate 1/1', 'magenta plate 1/1', 'yellow plate 1/1', 'black plate 1/1 (rarest)'],
  },
  CENTERING: {
    label: 'EXTREME CENTERING',
    emoji: '📐',
    weight: 15,
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
    strip: 'bg-gradient-to-b from-sky-500 to-blue-600',
    minMult: 2,
    maxMult: 8,
    descriptors: ['20/80 centering', '15/85 centering', 'image cropped on one edge', 'off-center beyond typical variance'],
  },
  MISSING_INK: {
    label: 'MISSING FOIL / INK',
    emoji: '💫',
    weight: 18,
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    strip: 'bg-gradient-to-b from-emerald-500 to-teal-600',
    minMult: 5,
    maxMult: 25,
    descriptors: ['missing prizm foil', 'missing chrome layer', 'missing optic holo', 'partial foil absence', 'factory missing silver'],
  },
};

const TYPE_ORDER: ErrorType[] = ['PRINTING_PLATE', 'COLOR_SWAP', 'MISSING_NAME', 'MISCUT', 'MISSING_INK', 'BACK_ERROR', 'CENTERING'];

const PRESS_STATUS_META: Record<PressStatus, { label: string; weight: number; color: string; multBonus: number }> = {
  famous: { label: 'Famous', weight: 12, color: 'text-amber-300', multBonus: 1.5 },
  emerging: { label: 'Emerging', weight: 30, color: 'text-slate-300', multBonus: 1.0 },
  unknown: { label: 'Unknown', weight: 58, color: 'text-slate-500', multBonus: 0.7 },
};

const SPORT_POOL: { sport: Sport; weight: number }[] = [
  { sport: 'baseball', weight: 38 },
  { sport: 'basketball', weight: 24 },
  { sport: 'football', weight: 18 },
  { sport: 'hockey', weight: 8 },
  { sport: 'multi', weight: 12 },
];

const CARD_POOL: Record<Sport, { year: number; set: string; player: string; baseVal: number }[]> = {
  baseball: [
    { year: 1989, set: 'Upper Deck', player: 'Ken Griffey Jr. RC #1', baseVal: 180 },
    { year: 1990, set: 'Leaf', player: 'Frank Thomas RC #300', baseVal: 120 },
    { year: 1993, set: 'SP', player: 'Derek Jeter RC #279', baseVal: 650 },
    { year: 2011, set: 'Topps Update', player: 'Mike Trout RC', baseVal: 1800 },
    { year: 2018, set: 'Topps Chrome Update', player: 'Shohei Ohtani RC', baseVal: 85 },
    { year: 2001, set: 'Bowman Chrome', player: 'Albert Pujols RC Auto', baseVal: 8500 },
    { year: 1952, set: 'Topps', player: 'Mickey Mantle #311', baseVal: 45000 },
    { year: 1989, set: 'Upper Deck', player: 'Randy Johnson RC', baseVal: 45 },
  ],
  basketball: [
    { year: 1986, set: 'Fleer', player: 'Michael Jordan RC #57', baseVal: 22000 },
    { year: 2003, set: 'Topps Chrome', player: 'LeBron James RC #111', baseVal: 3200 },
    { year: 2018, set: 'Prizm', player: 'Luka Doncic Silver #280', baseVal: 1200 },
    { year: 1996, set: 'Topps Chrome', player: 'Kobe Bryant RC #138', baseVal: 2800 },
    { year: 2009, set: 'Panini National Treasures', player: 'Stephen Curry RPA /99', baseVal: 95000 },
    { year: 2019, set: 'Prizm', player: 'Zion Williamson Silver', baseVal: 650 },
    { year: 1961, set: 'Fleer', player: 'Wilt Chamberlain RC #8', baseVal: 8800 },
  ],
  football: [
    { year: 2000, set: 'Playoff Contenders', player: 'Tom Brady RC Ticket Auto', baseVal: 12500 },
    { year: 2017, set: 'Panini National Treasures', player: 'Patrick Mahomes RPA /99', baseVal: 45000 },
    { year: 2020, set: 'Optic', player: 'Justin Herbert Silver', baseVal: 220 },
    { year: 2023, set: 'Prizm', player: 'C.J. Stroud Silver', baseVal: 180 },
    { year: 1986, set: 'Topps', player: 'Jerry Rice RC #161', baseVal: 1200 },
    { year: 1989, set: 'Score', player: 'Barry Sanders RC #257', baseVal: 380 },
  ],
  hockey: [
    { year: 1979, set: 'O-Pee-Chee', player: 'Wayne Gretzky RC #18', baseVal: 12000 },
    { year: 1990, set: 'Upper Deck', player: 'Jaromir Jagr RC', baseVal: 85 },
    { year: 2005, set: 'The Cup', player: 'Sidney Crosby RC /99', baseVal: 45000 },
    { year: 2015, set: 'Young Guns', player: 'Connor McDavid RC', baseVal: 1500 },
  ],
  multi: [
    { year: 1989, set: 'Upper Deck', player: 'Dale Murphy Reverse Negative', baseVal: 420 },
    { year: 1990, set: 'Leaf', player: 'Frank Thomas No Name (famous error)', baseVal: 1800 },
    { year: 2000, set: 'Topps Traded', player: 'A-Rod Yankees Error (famous)', baseVal: 380 },
  ],
};

const PLATFORM_POOL = ['eBay', 'PWCC', 'MySlabs', 'Whatnot', 'Heritage', 'Goldin', 'Auction house reserve'];

type ErrorItem = {
  id: string;
  type: ErrorType;
  sport: Sport;
  year: number;
  setName: string;
  playerName: string;
  descriptor: string;
  baseVal: number;
  multiplier: number;
  estimatedPrice: number;
  pressStatus: PressStatus;
  platform: string;
  certified: boolean;
  grader: string;
  bornAt: number;
};

function pickWeighted<T extends { weight: number }>(arr: T[], rand: () => number): T {
  const total = arr.reduce((s, x) => s + x.weight, 0);
  let r = rand() * total;
  for (const x of arr) {
    r -= x.weight;
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
}

function pickErrorType(rand: () => number): ErrorType {
  return pickWeighted(TYPE_ORDER.map(t => ({ type: t, weight: TYPES[t].weight })), rand).type;
}

function pickPressStatus(rand: () => number): PressStatus {
  return pickWeighted((['famous', 'emerging', 'unknown'] as PressStatus[]).map(s => ({ status: s, weight: PRESS_STATUS_META[s].weight })), rand).status;
}

function genErrorItem(now: number, idSeed: number): ErrorItem {
  const rand = () => Math.random();
  const type = pickErrorType(rand);
  const sport = pickWeighted(SPORT_POOL, rand).sport;
  const cardPick = CARD_POOL[sport][Math.floor(rand() * CARD_POOL[sport].length)];
  const typeMeta = TYPES[type];
  const descriptor = typeMeta.descriptors[Math.floor(rand() * typeMeta.descriptors.length)];
  const baseMultiplier = typeMeta.minMult + rand() * (typeMeta.maxMult - typeMeta.minMult);
  const pressStatus = pickPressStatus(rand);
  const pressMeta = PRESS_STATUS_META[pressStatus];
  const finalMultiplier = baseMultiplier * pressMeta.multBonus;
  const estPrice = Math.round(cardPick.baseVal * finalMultiplier / 10) * 10;
  const platform = PLATFORM_POOL[Math.floor(rand() * PLATFORM_POOL.length)];
  const certified = rand() < 0.55;
  const graders = ['PSA', 'BGS', 'SGC'];
  const grader = certified ? graders[Math.floor(rand() * graders.length)] : '';
  const ageMs = Math.floor(Math.pow(rand(), 2) * 40 * 60 * 1000);
  return {
    id: `err-${now}-${idSeed}`,
    type, sport,
    year: cardPick.year,
    setName: cardPick.set,
    playerName: cardPick.player,
    descriptor,
    baseVal: cardPick.baseVal,
    multiplier: finalMultiplier,
    estimatedPrice: estPrice,
    pressStatus,
    platform,
    certified,
    grader,
    bornAt: now - ageMs,
  };
}

function timeAgo(ms: number, now: number): string {
  const elapsed = now - ms;
  const sec = Math.floor(elapsed / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

const INITIAL_FEED = 14;
const REFRESH_MS = 5000;
const MAX_FEED = 24;
const ROLLOFF_MS = 40 * 60 * 1000;

export default function ErrorWireClient() {
  const [feed, setFeed] = useState<ErrorItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [typeFilter, setTypeFilter] = useState<Set<ErrorType>>(new Set(TYPE_ORDER));
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [pressFilter, setPressFilter] = useState<PressStatus | 'all'>('all');
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const idCounter = useRef(0);

  useEffect(() => {
    const initial: ErrorItem[] = [];
    for (let i = 0; i < INITIAL_FEED; i++) {
      initial.push(genErrorItem(Date.now(), i));
      idCounter.current++;
    }
    initial.sort((a, b) => b.bornAt - a.bornAt);
    setFeed(initial);
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setNow(Date.now());
      setFeed(prev => {
        const t = Date.now();
        const fresh = genErrorItem(t, idCounter.current++);
        const merged = [fresh, ...prev].filter(i => t - i.bornAt < ROLLOFF_MS).slice(0, MAX_FEED);
        return merged;
      });
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const filtered = useMemo(() =>
    feed.filter(i =>
      typeFilter.has(i.type) &&
      (sportFilter === 'all' || i.sport === sportFilter) &&
      (pressFilter === 'all' || i.pressStatus === pressFilter) &&
      (!certifiedOnly || i.certified)
    )
  , [feed, typeFilter, sportFilter, pressFilter, certifiedOnly]);

  const counts = useMemo(() => {
    const c: Record<ErrorType, number> = { MISCUT: 0, MISSING_NAME: 0, COLOR_SWAP: 0, BACK_ERROR: 0, PRINTING_PLATE: 0, CENTERING: 0, MISSING_INK: 0 };
    feed.forEach(i => { c[i.type]++; });
    return c;
  }, [feed]);

  function toggleType(t: ErrorType) {
    setTypeFilter(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-slate-300 font-semibold">{filtered.length}</span>
            <span className="text-slate-500">showing / {feed.length} in feed</span>
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Error type</div>
          <div className="flex flex-wrap gap-2">
            {TYPE_ORDER.map(t => {
              const m = TYPES[t];
              const active = typeFilter.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition flex items-center gap-1.5 ${
                    active ? m.badge : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span>{m.emoji}</span>
                  <span className="font-semibold">{m.label}</span>
                  <span className="opacity-60">({counts[t]})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Sport</div>
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value as Sport | 'all')}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">All sports</option>
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
              <option value="multi">Multi-sport</option>
            </select>
          </label>
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Press status</div>
            <select
              value={pressFilter}
              onChange={e => setPressFilter(e.target.value as PressStatus | 'all')}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="all">All</option>
              <option value="famous">Famous (documented)</option>
              <option value="emerging">Emerging</option>
              <option value="unknown">Unknown</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-5">
            <input
              type="checkbox"
              checked={certifiedOnly}
              onChange={e => setCertifiedOnly(e.target.checked)}
              className="accent-red-500 w-4 h-4"
            />
            Certified (PSA / BGS / SGC) only
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-10 text-center text-slate-500 text-sm">
            No error cards match the current filters.
          </div>
        ) : (
          filtered.map(i => {
            const tm = TYPES[i.type];
            const press = PRESS_STATUS_META[i.pressStatus];
            return (
              <div key={i.id} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex">
                <div className={`w-1.5 ${tm.strip}`} />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${tm.badge}`}>
                        {tm.emoji} {tm.label}
                      </span>
                      {i.certified && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                          ✓ {i.grader} certified
                        </span>
                      )}
                      <span className={`text-[10px] font-semibold ${press.color}`}>{press.label}</span>
                    </div>
                    <div className="text-xs text-slate-500">{timeAgo(i.bornAt, i.bornAt)}... · {timeAgo(i.bornAt, now)}</div>
                  </div>

                  <div className="text-base font-bold text-white mb-1">
                    {i.year} {i.setName} {i.playerName}
                  </div>
                  <div className="text-sm text-slate-400 mb-3 italic">&ldquo;{i.descriptor}&rdquo;</div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Base card value</div>
                      <div className="font-mono text-slate-300">{fmtMoney(i.baseVal)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Error multiplier</div>
                      <div className="font-mono text-red-300">×{i.multiplier.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Est. price</div>
                      <div className="font-mono text-white font-bold">{fmtMoney(i.estimatedPrice)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Platform</div>
                      <div className="font-mono text-slate-300">{i.platform}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
