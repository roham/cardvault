'use client';

import { useMemo, useState } from 'react';

interface Format {
  key: string;
  name: string;
  era: string;
  years: string;
  widthIn: number;
  heightIn: number;
  widthMm: number;
  heightMm: number;
  examples: string[];
  sleeveRec: string;
  toploaderRec: string;
  binderRec: string;
  grading: string;
  notes: string;
  palette: 'cyan' | 'amber' | 'rose' | 'emerald' | 'violet' | 'stone' | 'sky' | 'fuchsia';
}

// Real historical card dimensions. Sources: T206 Resource Guide, Beckett size reference,
// Card Gradings standard sleeve specs, Ultra Pro / BCW product dimensions.
const FORMATS: Format[] = [
  {
    key: 'standard-modern',
    name: 'Standard Modern',
    era: 'Modern',
    years: '1957–present',
    widthIn: 2.5,
    heightIn: 3.5,
    widthMm: 63.5,
    heightMm: 88.9,
    examples: ['1989 Upper Deck Griffey', '2018 Topps Chrome Acuña', 'Panini Prizm', 'Bowman Chrome', 'Pokemon English'],
    sleeveRec: 'Ultra Pro Penny Sleeve (2-5/8" x 3-5/8")',
    toploaderRec: '35pt 3" x 4" top loader',
    binderRec: 'Standard 9-pocket page',
    grading: 'Standard tier — no size upcharge at PSA/BGS/CGC/SGC',
    notes: 'The universal industry standard. Every major modern brand uses this size. Fits every standard sleeve, top loader, one-touch, and 9-pocket page ever made.',
    palette: 'cyan',
  },
  {
    key: 't206-tobacco',
    name: 'T206 Tobacco',
    era: 'Pre-War Tobacco',
    years: '1909–1915',
    widthIn: 1.4375,
    heightIn: 2.625,
    widthMm: 36.5,
    heightMm: 66.7,
    examples: ['T206 Honus Wagner', 'T206 White Borders', 'T205 Gold Border', 'T207 Brown Background'],
    sleeveRec: 'BCW / Ultra Pro Tobacco Sleeve (1.75" x 3")',
    toploaderRec: '1.5" x 2.75" tobacco top loader',
    binderRec: '12-pocket or 16-pocket mini page',
    grading: 'PSA accepts in dedicated T206 slabs — same cost as standard',
    notes: 'Classic cigarette-pack insert size. Way too narrow for modern sleeves. Never force into a standard sleeve — the card slides, corners ding. Semi-rigid Card Savers are preferred for shipping.',
    palette: 'amber',
  },
  {
    key: 'early-tobacco',
    name: 'Early Tobacco (N-series)',
    era: 'Pre-War Tobacco',
    years: '1887–1895',
    widthIn: 1.5,
    heightIn: 2.75,
    widthMm: 38.1,
    heightMm: 69.85,
    examples: ['N28 Allen & Ginter', 'N172 Old Judge', 'N162 Goodwin Champions', 'N184 Kimball'],
    sleeveRec: 'Small tobacco sleeve (1.75" x 3")',
    toploaderRec: '1.5" x 2.75" tobacco top loader',
    binderRec: '12-pocket or dedicated tobacco page',
    grading: 'PSA and SGC specialize in 19th-century tobacco — often 2-3x standard fee',
    notes: 'Oldest collectible sports cards. Thin paperstock, extremely fragile. Most surviving copies are low-grade. Handle with cotton gloves. Never put in a penny sleeve — use archival-quality holders only.',
    palette: 'stone',
  },
  {
    key: 'cracker-jack',
    name: 'Cracker Jack / E-Cards',
    era: 'Pre-War Food Issue',
    years: '1914–1915',
    widthIn: 2.25,
    heightIn: 3.0625,
    widthMm: 57.15,
    heightMm: 77.8,
    examples: ['E145 Cracker Jack', 'E90 American Caramel', 'E107 Breisch-Williams'],
    sleeveRec: 'Cracker Jack size sleeve (2.375" x 3.25")',
    toploaderRec: '2.5" x 3.25" vintage top loader',
    binderRec: 'Specialty 9-pocket vintage page',
    grading: 'Standard vintage tier at PSA/SGC',
    notes: 'Candy box inserts. Thicker stock than tobacco but heavily susceptible to food stains and caramel damage. Most have centering issues because they were machine-cut from sheets inside candy boxes.',
    palette: 'amber',
  },
  {
    key: 'goudey-diamond-stars',
    name: 'Goudey / Diamond Stars',
    era: 'Pre-War Gum',
    years: '1933–1941',
    widthIn: 2.375,
    heightIn: 2.875,
    widthMm: 60.3,
    heightMm: 73.0,
    examples: ['1933 Goudey Ruth', '1934 Goudey Gehrig', '1934-36 Diamond Stars', '1933 Sport Kings'],
    sleeveRec: 'Goudey-size sleeve (2.5" x 3.125")',
    toploaderRec: '2.5" x 3.25" Goudey-specific top loader',
    binderRec: '9-pocket vintage page (slightly wider pockets)',
    grading: 'Standard vintage tier',
    notes: 'Square-ish aspect ratio. Too short for modern penny sleeves — card slides to bottom. Gum residue is common on backs. "Heartland" HOFers from this era (Cochrane, Terry, Klein, Foxx, Hubbell) are undervalued compared to Ruth/Gehrig.',
    palette: 'rose',
  },
  {
    key: 'play-ball',
    name: 'Play Ball / 1939-41',
    era: 'Pre-War Gum',
    years: '1939–1941',
    widthIn: 2.5,
    heightIn: 3.125,
    widthMm: 63.5,
    heightMm: 79.4,
    examples: ['1939 Play Ball', '1940 Play Ball DiMaggio', '1941 Play Ball Williams'],
    sleeveRec: 'Ultra Pro Penny (2-5/8" x 3-5/8") — extra room',
    toploaderRec: '35pt modern top loader works (slight slack)',
    binderRec: 'Standard 9-pocket (card will slide slightly)',
    grading: 'Standard vintage tier',
    notes: 'Bridge format between Goudey and modern. Width matches modern (2.5") but shorter by 3/8". Photo-quality B&W printing was a breakthrough. Ted Williams rookie is 1939 Play Ball #92.',
    palette: 'violet',
  },
  {
    key: '1948-bowman',
    name: 'Early Bowman',
    era: 'Post-War',
    years: '1948–1951',
    widthIn: 2.0625,
    heightIn: 2.5,
    widthMm: 52.4,
    heightMm: 63.5,
    examples: ['1948 Bowman Musial', '1949 Bowman Jackie Robinson', '1951 Bowman Mantle'],
    sleeveRec: 'Small vintage sleeve (2.25" x 2.75")',
    toploaderRec: '2.25" x 2.75" Bowman top loader',
    binderRec: 'Specialty vintage page or 16-pocket mini',
    grading: 'Standard vintage tier',
    notes: 'Smaller than everything that came after. These are sometimes miscataloged because collectors forget how tiny early Bowman was. The 1951 Bowman Mantle rookie (#253) is the most famous card in this format.',
    palette: 'emerald',
  },
  {
    key: '1952-topps-vintage',
    name: '1952–1956 Topps / Vintage Large',
    era: 'Post-War Golden Age',
    years: '1952–1956',
    widthIn: 2.625,
    heightIn: 3.75,
    widthMm: 66.7,
    heightMm: 95.25,
    examples: ['1952 Topps Mantle', '1954 Topps Aaron RC', '1955 Topps Clemente RC', '1956 Topps Koufax'],
    sleeveRec: 'Vintage large sleeve (2.75" x 4")',
    toploaderRec: 'Vintage large top loader (2.75" x 4")',
    binderRec: 'Specialty 9-pocket oversized vintage page',
    grading: 'Standard vintage tier (PSA has special 1952 slab form factor)',
    notes: 'The "classic" Topps size, larger than modern. Modern penny sleeves DO NOT fit. A 1952 Topps Mantle will not close in a modern one-touch. Magnetic holders exist in this size but cost 3-5x standard.',
    palette: 'fuchsia',
  },
  {
    key: '1957-1980s-standard',
    name: '1957+ Modern Topps',
    era: 'Post-War / Vintage',
    years: '1957–present',
    widthIn: 2.5,
    heightIn: 3.5,
    widthMm: 63.5,
    heightMm: 88.9,
    examples: ['1957 Topps Mantle', '1963 Topps Rose RC', '1968 Topps Ryan RC', '1989 Upper Deck Griffey'],
    sleeveRec: 'Ultra Pro Penny Sleeve',
    toploaderRec: '35pt 3" x 4" top loader',
    binderRec: 'Standard 9-pocket page',
    grading: 'Standard tier',
    notes: '1957 Topps switched to modern dimensions to cut production costs. Every post-1957 major-brand card uses this size. Vintage cards (pre-1980) are still fragile despite modern dimensions — handle by edges only.',
    palette: 'sky',
  },
  {
    key: 'kelloggs-3d',
    name: "Kellogg's 3D",
    era: 'Food Issue',
    years: '1970–1983',
    widthIn: 2.125,
    heightIn: 3.5,
    widthMm: 54.0,
    heightMm: 88.9,
    examples: ["1970 Kellogg's Rose", "1971 Kellogg's 3D", "1980 Kellogg's Brett"],
    sleeveRec: `Kellogg's size sleeve (2.25" x 3.625")`,
    toploaderRec: '2.25" x 3.75" Kellogg-specific top loader',
    binderRec: 'Specialty narrow 9-pocket',
    grading: 'Standard tier but prone to "curl cracks"',
    notes: 'Narrower than modern. Lenticular 3D effect makes them popular. The plastic overlay is prone to cracking over time — "Kellogg\'s curl cracks" are the #1 condition issue. Cannot be flattened once curled.',
    palette: 'rose',
  },
  {
    key: 'mini-1975',
    name: '1975 Topps Mini',
    era: 'Vintage',
    years: '1975',
    widthIn: 2.125,
    heightIn: 3,
    widthMm: 54.0,
    heightMm: 76.2,
    examples: ['1975 Topps Mini George Brett RC', '1975 Topps Mini Yount RC', '1975 Topps Mini Rice RC'],
    sleeveRec: 'Mini sleeve (2.25" x 3.125")',
    toploaderRec: 'Mini top loader (2.25" x 3.25")',
    binderRec: 'Mini 12-pocket page',
    grading: 'Standard vintage tier',
    notes: '85% of normal 1975 Topps size. A one-year experiment (test issue sold only in select regions). Minis command 2-5x over the full-size 1975 Topps equivalents because far fewer were produced.',
    palette: 'emerald',
  },
  {
    key: 'allen-ginter-mini',
    name: 'Allen & Ginter Mini',
    era: 'Modern Retro',
    years: '2006–present',
    widthIn: 1.75,
    heightIn: 2.75,
    widthMm: 44.5,
    heightMm: 69.85,
    examples: ['2006-present A&G Minis', 'Topps Heritage Minis', 'Ginter Black Border Minis'],
    sleeveRec: 'Mini sleeve (1.875" x 2.875")',
    toploaderRec: 'Mini top loader (1.875" x 3")',
    binderRec: 'Mini 12-pocket or 16-pocket page',
    grading: 'Standard tier at PSA',
    notes: 'Retro nod to 1887 Allen & Ginter tobacco cards. Roughly the same size as original N28s. Parallels (black border, wood, gold border, 1/1 printing plate) are the real chase in modern A&G.',
    palette: 'stone',
  },
  {
    key: 'japanese-tcg',
    name: 'Japanese TCG / Yu-Gi-Oh',
    era: 'Modern TCG',
    years: '1996–present',
    widthIn: 2.48,
    heightIn: 3.46,
    widthMm: 63.0,
    heightMm: 88.0,
    examples: ['Japanese Pokemon', 'Yu-Gi-Oh', 'Japanese Magic', 'Weiss Schwarz'],
    sleeveRec: 'Japanese-size "Perfect Fit" sleeve (2.5" x 3.5")',
    toploaderRec: 'Standard 35pt works but card slides slightly',
    binderRec: 'Standard 9-pocket (slight slack)',
    grading: 'Standard tier at PSA / CGC / Ace Grading',
    notes: 'Slightly smaller than English TCG. The difference is ~0.5mm width and ~1mm height — enough that English Ultra Pro Penny sleeves are visibly loose. Japanese brands (KMC, Katana, Dragon Shield Matte Japanese) make dedicated sleeves.',
    palette: 'fuchsia',
  },
  {
    key: 'oversized-5x7',
    name: 'Oversized / Box Topper (5x7)',
    era: 'Modern Insert',
    years: '1990–present',
    widthIn: 5,
    heightIn: 7,
    widthMm: 127,
    heightMm: 177.8,
    examples: ['Stadium Club Members Only', 'Topps Finest 5x7', 'Panini National Treasures boxtoppers'],
    sleeveRec: '5" x 7" photo sleeve',
    toploaderRec: '5" x 7" top loader (BCW, Ultra Pro)',
    binderRec: '4-pocket oversized page',
    grading: 'PSA/BGS specialty oversized slab — 2-3x standard fee',
    notes: 'Classic photo size. Originally used for "supers" and box toppers. Requires specialty supplies throughout — cannot ship in a standard PWE. Often paired with hand-numbered SP parallels (/5, /10, /25).',
    palette: 'violet',
  },
  {
    key: 'panoramic',
    name: 'Panoramic Wide',
    era: 'Modern Insert',
    years: '1995–present',
    widthIn: 2.5,
    heightIn: 5.25,
    widthMm: 63.5,
    heightMm: 133.4,
    examples: ['Topps Chrome Wide', 'Panini Panorama', 'Bowman Sterling Panorama'],
    sleeveRec: 'Panoramic sleeve (2.625" x 5.375")',
    toploaderRec: 'Panoramic top loader (2.75" x 5.5")',
    binderRec: '3-pocket panoramic page',
    grading: 'PSA/BGS support — slight upcharge',
    notes: '1.5x the height of a standard card. Used for action shots, team photos, and booklet panels. Hard to display because standard holders do not fit — panoramic supplies are a niche market (BCW, Cardboard Gold).',
    palette: 'sky',
  },
  {
    key: 'booklet',
    name: 'Booklet / Folding',
    era: 'Modern Premium',
    years: '2008–present',
    widthIn: 5,
    heightIn: 3.5,
    widthMm: 127,
    heightMm: 88.9,
    examples: ['National Treasures Booklets', 'Flawless Booklets', 'Immaculate Dual Patch'],
    sleeveRec: 'Booklet sleeve (5.25" x 3.75")',
    toploaderRec: 'Booklet top loader (Ultra Pro, Cardboard Gold)',
    binderRec: '4-pocket landscape page',
    grading: 'PSA/BGS specialty booklet slab — 2-3x standard fee',
    notes: 'Folds open to double-wide. Usually contain dual patches, dual autos, or commemorative photography. Print runs typically /1 to /25. Booklet one-touches cost $15-25 per card — expensive to properly protect a collection of these.',
    palette: 'emerald',
  },
];

type Palette = Format['palette'];

const COLOR_MAP: Record<Palette, { ring: string; text: string; bg: string; border: string; bar: string }> = {
  cyan: { ring: 'ring-cyan-500/40', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', bar: 'bg-cyan-500' },
  amber: { ring: 'ring-amber-500/40', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' },
  rose: { ring: 'ring-rose-500/40', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', bar: 'bg-rose-500' },
  emerald: { ring: 'ring-emerald-500/40', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
  violet: { ring: 'ring-violet-500/40', text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', bar: 'bg-violet-500' },
  stone: { ring: 'ring-stone-500/40', text: 'text-stone-300', bg: 'bg-stone-500/10', border: 'border-stone-500/30', bar: 'bg-stone-400' },
  sky: { ring: 'ring-sky-500/40', text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', bar: 'bg-sky-500' },
  fuchsia: { ring: 'ring-fuchsia-500/40', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', bar: 'bg-fuchsia-500' },
};

// Pixel scale: the largest card (7 inches tall) maps to 180px for the silhouette chart.
const MAX_IN = 7;
const CHART_MAX_PX = 180;
const pxFromIn = (n: number) => Math.max(18, Math.round((n / MAX_IN) * CHART_MAX_PX));

const ERAS = ['All', 'Pre-War Tobacco', 'Pre-War Gum', 'Pre-War Food Issue', 'Post-War', 'Post-War Golden Age', 'Vintage', 'Modern', 'Modern TCG', 'Modern Retro', 'Modern Insert', 'Modern Premium', 'Food Issue'];

export default function CardDimensions() {
  const [selected, setSelected] = useState<string>('standard-modern');
  const [eraFilter, setEraFilter] = useState<string>('All');
  const [compareA, setCompareA] = useState<string>('standard-modern');
  const [compareB, setCompareB] = useState<string>('1952-topps-vintage');

  const filtered = useMemo(() => {
    if (eraFilter === 'All') return FORMATS;
    return FORMATS.filter(f => f.era === eraFilter);
  }, [eraFilter]);

  const active = FORMATS.find(f => f.key === selected) || FORMATS[0];
  const activeColor = COLOR_MAP[active.palette];
  const fmtA = FORMATS.find(f => f.key === compareA) || FORMATS[0];
  const fmtB = FORMATS.find(f => f.key === compareB) || FORMATS[0];

  const areaA = fmtA.widthIn * fmtA.heightIn;
  const areaB = fmtB.widthIn * fmtB.heightIn;
  const areaDelta = areaA === areaB ? 0 : ((areaB - areaA) / areaA) * 100;

  return (
    <div className="space-y-6">
      {/* Era Filter */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Filter by Era</div>
        <div className="flex flex-wrap gap-2">
          {ERAS.map(e => (
            <button
              key={e}
              onClick={() => setEraFilter(e)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                eraFilter === e
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Format Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(f => {
          const c = COLOR_MAP[f.palette];
          const isSelected = f.key === selected;
          return (
            <button
              key={f.key}
              onClick={() => setSelected(f.key)}
              className={`group relative rounded-2xl border p-4 text-left transition-all ${
                isSelected ? `${c.border} ${c.bg} ring-2 ${c.ring}` : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isSelected ? c.text : 'text-gray-500'}`}>
                {f.era}
              </div>
              <div className="font-bold text-white text-sm mb-1 leading-tight">{f.name}</div>
              <div className="text-xs text-gray-400 mb-3">{f.years}</div>
              <div className={`text-xs font-mono ${isSelected ? c.text : 'text-gray-500'}`}>
                {f.widthIn}" × {f.heightIn}"
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      <div className={`rounded-2xl border p-6 sm:p-8 ${activeColor.border} ${activeColor.bg}`}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Silhouette */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative" style={{ width: `${pxFromIn(active.widthIn)}px`, height: `${pxFromIn(active.heightIn)}px` }}>
              <div className={`absolute inset-0 rounded-md border-2 ${activeColor.border} bg-gradient-to-br from-black/40 to-black/10`} />
              <div className={`absolute inset-2 rounded-sm border ${activeColor.border} opacity-40`} />
              <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold ${activeColor.text} whitespace-nowrap`}>
                {active.widthIn}" × {active.heightIn}"
              </div>
            </div>
            <div className="mt-3 text-center">
              <div className="text-xs text-gray-500 font-mono">{active.widthMm}mm × {active.heightMm}mm</div>
              <div className="text-xs text-gray-600 mt-1">Area: {(active.widthIn * active.heightIn).toFixed(2)} in²</div>
            </div>
          </div>

          {/* Specs */}
          <div className="flex-1 space-y-4">
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${activeColor.text} mb-1`}>{active.era} · {active.years}</div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{active.name}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SpecRow label="Sleeve" value={active.sleeveRec} color={activeColor} />
              <SpecRow label="Top Loader" value={active.toploaderRec} color={activeColor} />
              <SpecRow label="Binder Page" value={active.binderRec} color={activeColor} />
              <SpecRow label="Grading" value={active.grading} color={activeColor} />
            </div>

            <div className="bg-black/40 border border-gray-800 rounded-xl p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Notable Examples</div>
              <div className="text-sm text-gray-300 leading-relaxed">
                {active.examples.map((ex, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-gray-600 mx-1.5">·</span>}
                    <span>{ex}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-black/40 border border-gray-800 rounded-xl p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Collector Notes</div>
              <p className="text-sm text-gray-300 leading-relaxed">{active.notes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Size Comparison */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-white">Side-by-Side Comparison</h3>
          <span className="text-xs text-gray-500">(Silhouettes are to scale)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1.5">Format A</label>
            <select
              value={compareA}
              onChange={e => setCompareA(e.target.value)}
              className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              {FORMATS.map(f => (
                <option key={f.key} value={f.key}>
                  {f.name} ({f.widthIn}" × {f.heightIn}")
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-1.5">Format B</label>
            <select
              value={compareB}
              onChange={e => setCompareB(e.target.value)}
              className="w-full bg-black/60 border border-gray-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              {FORMATS.map(f => (
                <option key={f.key} value={f.key}>
                  {f.name} ({f.widthIn}" × {f.heightIn}")
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-end justify-center gap-8 py-6 min-h-[220px]">
          <ComparisonCard fmt={fmtA} label="A" />
          <ComparisonCard fmt={fmtB} label="B" />
        </div>

        <div className="mt-2 text-center text-sm">
          {areaDelta === 0 ? (
            <span className="text-gray-500">Same total area ({areaA.toFixed(2)} in²)</span>
          ) : (
            <span className="text-gray-400">
              <span className="text-white font-semibold">{fmtB.name}</span> is{' '}
              <span className={areaDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {Math.abs(areaDelta).toFixed(0)}% {areaDelta > 0 ? 'larger' : 'smaller'}
              </span>{' '}
              than {fmtA.name} by area
            </span>
          )}
        </div>
      </div>

      {/* Quick Reference Table */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-white mb-4">Quick Reference Table</h3>
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-2 text-gray-500 font-semibold uppercase tracking-wider">Format</th>
              <th className="text-left py-2 px-2 text-gray-500 font-semibold uppercase tracking-wider">Years</th>
              <th className="text-right py-2 px-2 text-gray-500 font-semibold uppercase tracking-wider">Inches</th>
              <th className="text-right py-2 px-2 text-gray-500 font-semibold uppercase tracking-wider">Millimeters</th>
              <th className="text-left py-2 px-2 text-gray-500 font-semibold uppercase tracking-wider hidden sm:table-cell">Sleeve</th>
            </tr>
          </thead>
          <tbody>
            {FORMATS.map(f => {
              const c = COLOR_MAP[f.palette];
              return (
                <tr key={f.key} className="border-b border-gray-800/50 hover:bg-black/40 cursor-pointer" onClick={() => setSelected(f.key)}>
                  <td className="py-2 px-2">
                    <span className={`font-semibold ${f.key === selected ? c.text : 'text-white'}`}>{f.name}</span>
                  </td>
                  <td className="py-2 px-2 text-gray-400">{f.years}</td>
                  <td className="py-2 px-2 text-right font-mono text-gray-300">{f.widthIn}" × {f.heightIn}"</td>
                  <td className="py-2 px-2 text-right font-mono text-gray-500">{f.widthMm} × {f.heightMm}</td>
                  <td className="py-2 px-2 text-gray-400 hidden sm:table-cell">{f.sleeveRec}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpecRow({ label, value, color }: { label: string; value: string; color: { text: string } }) {
  return (
    <div className="bg-black/40 border border-gray-800 rounded-xl p-3">
      <div className={`text-xs font-semibold uppercase tracking-wider ${color.text} mb-0.5`}>{label}</div>
      <div className="text-sm text-gray-200 leading-snug">{value}</div>
    </div>
  );
}

function ComparisonCard({ fmt, label }: { fmt: Format; label: string }) {
  const c = COLOR_MAP[fmt.palette];
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-md border-2 ${c.border} bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center`}
        style={{ width: `${pxFromIn(fmt.widthIn)}px`, height: `${pxFromIn(fmt.heightIn)}px` }}
      >
        <div className={`absolute top-1 left-1.5 text-[10px] font-black ${c.text}`}>{label}</div>
        <div className={`absolute bottom-1 right-1.5 text-[9px] font-mono ${c.text}`}>
          {fmt.widthIn}×{fmt.heightIn}
        </div>
      </div>
      <div className="text-[11px] text-gray-400 mt-2 text-center max-w-[120px] leading-tight">{fmt.name}</div>
    </div>
  );
}
