'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type EstateType = 'ATTIC_FIND' | 'LIFETIME' | 'DEALER' | 'CURATED' | 'ONE_OWNER';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'multi';
type Era = 'pre-war' | 'vintage' | 'junk-wax' | 'modern' | 'mixed';
type House = 'Heritage' | 'Goldin' | 'PWCC' | 'REA' | 'Lelands' | 'Memory Lane' | 'Huggins & Scott' | 'Love of the Game';

type TypeMeta = {
  label: string;
  emoji: string;
  weight: number;
  badge: string;
  strip: string;
  storyPrefix: string[];
  freshnessRange: [number, number];
  lotsRange: [number, number];
  premiumRange: [number, number]; // provenance premium % estimate
};

const TYPES: Record<EstateType, TypeMeta> = {
  ATTIC_FIND: {
    label: 'ATTIC FIND',
    emoji: '📦',
    weight: 24,
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
    strip: 'bg-gradient-to-b from-amber-400 to-orange-500',
    storyPrefix: [
      'Basement discovery after parent passing',
      'Childhood collection rediscovered in storage unit',
      'Grandfather\'s box pulled from attic beam',
      'Shoebox recovered during home sale',
      'Family cedar chest opened after 40 years',
      'Binder found in deceased uncle\'s closet',
    ],
    freshnessRange: [25, 55],
    lotsRange: [8, 80],
    premiumRange: [5, 15],
  },
  LIFETIME: {
    label: 'LIFETIME COLLECTION',
    emoji: '📚',
    weight: 20,
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
    strip: 'bg-gradient-to-b from-emerald-400 to-teal-500',
    storyPrefix: [
      'Single-collector 40-year build',
      'Documented 35-year accumulation',
      'Lifetime collector health-forced sale',
      '50+ year build by retiring collector',
      '30-year focused vintage build',
      'Multi-decade HOF rookie chase',
    ],
    freshnessRange: [20, 50],
    lotsRange: [60, 400],
    premiumRange: [8, 22],
  },
  DEALER: {
    label: 'DEALER ESTATE',
    emoji: '🏪',
    weight: 18,
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
    strip: 'bg-gradient-to-b from-slate-400 to-gray-500',
    storyPrefix: [
      'Retiring card-shop owner inventory',
      'LCS (local card shop) closing liquidation',
      'Estate of deceased card-show vendor',
      'Wholesale dealer back-stock dispersal',
      'Breakroom accumulation from 80s-90s vendor',
      'Traveling-show dealer retirement',
    ],
    freshnessRange: [5, 35],
    lotsRange: [200, 2000],
    premiumRange: [-5, 5], // dealer estates often UNDER market
  },
  CURATED: {
    label: 'CURATED CONSIGNMENT',
    emoji: '🏆',
    weight: 18,
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    strip: 'bg-gradient-to-b from-purple-400 to-fuchsia-500',
    storyPrefix: [
      'White-glove single-owner cataloged sale',
      'Photographed-with-collector premium consignment',
      'Museum-quality estate with letter of provenance',
      'Ultra-high-end curated single-collector auction',
      'Cataloged private-museum deaccession',
      'Hall-of-Fame-grade cataloged sale',
    ],
    freshnessRange: [10, 30],
    lotsRange: [40, 200],
    premiumRange: [18, 35],
  },
  ONE_OWNER: {
    label: 'ONE-OWNER',
    emoji: '✋',
    weight: 20,
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    strip: 'bg-gradient-to-b from-blue-400 to-indigo-500',
    storyPrefix: [
      'Single-hand-pulled childhood accumulation',
      'Never-sold stadium-employee collection',
      'Relative of player, single source',
      'Single-owner breaker-era accumulation',
      'Stadium vendor documented keepsakes',
      'Never-traded original-owner binder',
    ],
    freshnessRange: [30, 60],
    lotsRange: [20, 150],
    premiumRange: [10, 25],
  },
};

const TYPE_ORDER: EstateType[] = ['CURATED', 'LIFETIME', 'ATTIC_FIND', 'ONE_OWNER', 'DEALER'];

type HouseMeta = { name: House; weight: number; color: string };
const HOUSES: HouseMeta[] = [
  { name: 'Heritage', weight: 24, color: 'text-rose-300' },
  { name: 'Goldin', weight: 18, color: 'text-amber-300' },
  { name: 'PWCC', weight: 14, color: 'text-sky-300' },
  { name: 'REA', weight: 12, color: 'text-emerald-300' },
  { name: 'Lelands', weight: 10, color: 'text-violet-300' },
  { name: 'Memory Lane', weight: 9, color: 'text-teal-300' },
  { name: 'Huggins & Scott', weight: 7, color: 'text-slate-300' },
  { name: 'Love of the Game', weight: 6, color: 'text-cyan-300' },
];

const SPORTS: { sport: Sport; label: string; weight: number }[] = [
  { sport: 'baseball', label: 'Baseball', weight: 38 },
  { sport: 'basketball', label: 'Basketball', weight: 22 },
  { sport: 'football', label: 'Football', weight: 16 },
  { sport: 'hockey', label: 'Hockey', weight: 10 },
  { sport: 'multi', label: 'Multi-sport', weight: 14 },
];

const ERAS: { era: Era; label: string; weight: number; yearRange: string }[] = [
  { era: 'pre-war', label: 'Pre-war (1909-1941)', weight: 14, yearRange: '1909-1941' },
  { era: 'vintage', label: 'Vintage (1948-1979)', weight: 38, yearRange: '1948-1979' },
  { era: 'junk-wax', label: 'Junk-wax (1981-1994)', weight: 12, yearRange: '1981-1994' },
  { era: 'modern', label: 'Modern (1995-today)', weight: 16, yearRange: '1995-2025' },
  { era: 'mixed', label: 'Mixed-era', weight: 20, yearRange: 'spanning decades' },
];

const COLLECTOR_NAMES = [
  'R. Wilson Estate', 'The Harper Collection', 'J. Thompson Estate', 'McKenzie Family Find',
  'The Becker Basement', 'Delaney Attic Hoard', 'W. Chang Collection', 'The Barrett Archive',
  'T. Callahan Estate', 'Morrissey Family Cache', 'B. Nakagawa Collection', 'The Pierce Binder',
  'R. Steiner Estate', 'The Gutierrez Find', 'K. O\'Donnell Collection', 'The Nakamura Archive',
  'L. Petrov Estate', 'The Carmichael Hoard', 'D. Okafor Collection', 'The Whitmore Binder',
];

const KEY_CARD_SAMPLES: Record<Sport, string[]> = {
  baseball: [
    '1952 Topps Mantle #311', '1909 T206 Wagner', '1914 Cracker Jack Joe Jackson', '1933 Goudey Ruth #53',
    '1948 Leaf Robinson #79', '1954 Topps Aaron RC', '1955 Topps Clemente RC', '1968 Topps Ryan RC',
    '1989 UD Griffey Jr. RC', '1993 SP Derek Jeter RC',
  ],
  basketball: [
    '1969 Topps Alcindor RC', '1986 Fleer Jordan RC', '1996 Topps Chrome Kobe RC',
    '2003 Topps Chrome LeBron RC', '2009 Panini National Treasures Curry RPA', '1957 Topps Russell RC',
    '1980 Topps Bird/Erving/Magic', '2018 Prizm Luka Silver', '1961 Fleer Wilt RC', '1972 Topps Dr. J RC',
  ],
  football: [
    '1957 Topps Unitas RC', '1976 Topps Payton RC', '1981 Topps Montana RC',
    '1984 Topps Marino RC', '2000 Playoff Contenders Brady RC Auto', '1998 Playoff Contenders Manning RC Auto',
    '2017 Panini National Treasures Mahomes RPA', '1986 Topps Jerry Rice RC', '1989 Score Barry Sanders RC', '2012 Topps Chrome Luck RC',
  ],
  hockey: [
    '1979 OPC Gretzky RC', '1951 Parkhurst Howe RC', '1966 Topps Orr RC',
    '1990 OPC Premier Jagr RC', '2005-06 The Cup Crosby RC /99', '1984 OPC Yzerman RC',
    '1985 OPC Lemieux RC', '2015 Young Guns McDavid RC', '1998 McDonalds Lundqvist RC', '2023 YG Bedard RC',
  ],
  multi: [
    'Mixed HOF binder (35 rookies)', '1970s star-lot (12 HOFers)', 'Cross-sport rookie run',
    '1980s 4-sport HOF case', 'Multi-era rookie anchors', 'Star-HOF dispersal lot',
    '1990s foundation 4-sport stash', 'Modern 4-sport rookie master set', '1950s-60s HOF rookies', '1970s-80s 4-sport legends',
  ],
};

type EstateItem = {
  id: string;
  type: EstateType;
  sport: Sport;
  era: Era;
  collectorName: string;
  storyPrefix: string;
  house: House;
  lots: number;
  freshnessYears: number;
  headline: string;
  keyCards: string[];
  premiumPct: number;
  estHammerTotal: number; // total hammer estimate $
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

function pickEstateType(rand: () => number): EstateType {
  const arr = TYPE_ORDER.map(t => ({ type: t, weight: TYPES[t].weight }));
  return pickWeighted(arr, rand).type;
}

function genHeadline(type: EstateType, sport: Sport, era: Era, collector: string, rand: () => number): string {
  const verbs = ['hits', 'drops', 'catalogs', 'opens', 'arrives at', 'lands at'];
  const verb = verbs[Math.floor(rand() * verbs.length)];
  const sportLabel = sport === 'multi' ? 'multi-sport' : sport;
  const eraShort = era === 'pre-war' ? 'pre-war' : era === 'vintage' ? 'vintage' : era === 'junk-wax' ? '80s-90s' : era === 'modern' ? 'modern' : 'mixed-era';
  return `${collector} ${verb} market — ${eraShort} ${sportLabel}`;
}

function genEstate(now: number, idSeed: number): EstateItem {
  const rand = () => Math.random();
  const type = pickEstateType(rand);
  const sport = pickWeighted(SPORTS, rand).sport;
  const era = pickWeighted(ERAS, rand).era;
  const typeMeta = TYPES[type];
  const house = pickWeighted(HOUSES, rand).name;
  const collector = COLLECTOR_NAMES[Math.floor(rand() * COLLECTOR_NAMES.length)];
  const storyPrefix = typeMeta.storyPrefix[Math.floor(rand() * typeMeta.storyPrefix.length)];
  const lots = Math.floor(typeMeta.lotsRange[0] + rand() * (typeMeta.lotsRange[1] - typeMeta.lotsRange[0]));
  const freshnessYears = Math.floor(typeMeta.freshnessRange[0] + rand() * (typeMeta.freshnessRange[1] - typeMeta.freshnessRange[0]));
  const premiumPct = Math.round(typeMeta.premiumRange[0] + rand() * (typeMeta.premiumRange[1] - typeMeta.premiumRange[0]));
  const keyCardPool = KEY_CARD_SAMPLES[sport];
  const keyCards: string[] = [];
  const numKeys = 2 + Math.floor(rand() * 2);
  const pool = [...keyCardPool];
  for (let i = 0; i < numKeys && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    keyCards.push(pool.splice(idx, 1)[0]);
  }
  const headline = genHeadline(type, sport, era, collector, rand);

  // Estimate hammer total: lots × avg-per-lot ($ depends on era + type)
  const eraMultiplier = era === 'pre-war' ? 8 : era === 'vintage' ? 4 : era === 'modern' ? 3 : era === 'mixed' ? 2.5 : 0.8;
  const typeMultiplier = type === 'CURATED' ? 12 : type === 'LIFETIME' ? 5 : type === 'ONE_OWNER' ? 3.5 : type === 'ATTIC_FIND' ? 2 : 1.2;
  const basePerLot = 80 + rand() * 120;
  const estHammerTotal = Math.round(lots * basePerLot * eraMultiplier * typeMultiplier / 100) * 100;

  const ageMs = Math.floor(Math.pow(rand(), 2) * 45 * 60 * 1000); // bias recent, tail to 45min
  return {
    id: `estate-${now}-${idSeed}`,
    type, sport, era, collectorName: collector, storyPrefix, house, lots, freshnessYears,
    headline, keyCards, premiumPct, estHammerTotal,
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
const REFRESH_MS = 5500;
const MAX_FEED = 22;
const ROLLOFF_MS = 45 * 60 * 1000;

export default function EstateWireClient() {
  const [feed, setFeed] = useState<EstateItem[]>([]);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [typeFilter, setTypeFilter] = useState<Set<EstateType>>(new Set(TYPE_ORDER));
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [eraFilter, setEraFilter] = useState<Era | 'all'>('all');
  const [houseFilter, setHouseFilter] = useState<House | 'all'>('all');
  const idCounter = useRef(0);

  useEffect(() => {
    const initial: EstateItem[] = [];
    for (let i = 0; i < INITIAL_FEED; i++) {
      initial.push(genEstate(Date.now(), i));
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
        const fresh = genEstate(t, idCounter.current++);
        const merged = [fresh, ...prev].filter(i => t - i.bornAt < ROLLOFF_MS).slice(0, MAX_FEED);
        return merged;
      });
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    const tickInterval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tickInterval);
  }, []);

  const filtered = useMemo(() => {
    return feed.filter(item =>
      typeFilter.has(item.type) &&
      (sportFilter === 'all' || item.sport === sportFilter) &&
      (eraFilter === 'all' || item.era === eraFilter) &&
      (houseFilter === 'all' || item.house === houseFilter)
    );
  }, [feed, typeFilter, sportFilter, eraFilter, houseFilter]);

  const counts = useMemo(() => {
    const c: Record<EstateType, number> = { ATTIC_FIND: 0, LIFETIME: 0, DEALER: 0, CURATED: 0, ONE_OWNER: 0 };
    feed.forEach(item => { c[item.type]++; });
    return c;
  }, [feed]);

  function toggleType(t: EstateType) {
    setTypeFilter(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
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
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Estate type</div>
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
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All sports</option>
              {SPORTS.map(s => <option key={s.sport} value={s.sport}>{s.label}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Era</div>
            <select
              value={eraFilter}
              onChange={e => setEraFilter(e.target.value as Era | 'all')}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All eras</option>
              {ERAS.map(e => <option key={e.era} value={e.era}>{e.label}</option>)}
            </select>
          </label>
          <label className="block">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Auction house</div>
            <select
              value={houseFilter}
              onChange={e => setHouseFilter(e.target.value as House | 'all')}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All houses</option>
              {HOUSES.map(h => <option key={h.name} value={h.name}>{h.name}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-10 text-center text-slate-500 text-sm">
            No estates match the current filters. Adjust filters above to widen the feed.
          </div>
        ) : (
          filtered.map(item => {
            const typeMeta = TYPES[item.type];
            const houseColor = HOUSES.find(h => h.name === item.house)?.color || 'text-slate-300';
            return (
              <div key={item.id} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex">
                <div className={`w-1.5 ${typeMeta.strip}`} />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${typeMeta.badge}`}>
                        {typeMeta.emoji} {typeMeta.label}
                      </span>
                      <span className="text-xs text-slate-500">via <span className={`font-semibold ${houseColor}`}>{item.house}</span></span>
                    </div>
                    <div className="text-xs text-slate-500">{timeAgo(item.bornAt, now)}</div>
                  </div>

                  <div className="text-lg font-bold text-white mb-1">{item.headline}</div>
                  <div className="text-sm text-slate-400 mb-3 italic">&ldquo;{item.storyPrefix}&rdquo;</div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-xs">
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Lots</div>
                      <div className="font-mono text-white">{item.lots.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Freshness</div>
                      <div className="font-mono text-white">{item.freshnessYears}y private</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Est. hammer</div>
                      <div className="font-mono text-white">{fmtMoney(item.estHammerTotal)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase tracking-wider text-[10px]">Provenance prem.</div>
                      <div className={`font-mono ${item.premiumPct >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {item.premiumPct >= 0 ? '+' : ''}{item.premiumPct}%
                      </div>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">Key lots:</span>
                    {item.keyCards.map((c, i) => (
                      <span key={i} className="inline-block bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded mr-1 mb-1">
                        {c}
                      </span>
                    ))}
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
