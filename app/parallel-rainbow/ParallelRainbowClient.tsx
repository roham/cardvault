'use client';

import { useState, useMemo } from 'react';

type Tier = 'common' | 'scarce' | 'rare' | 'super-rare' | 'grail';

interface Parallel {
  name: string;
  gradient: string; // tailwind gradient classes
  printRun?: number;
  printRunNote?: string;
  tier: Tier;
  multiplier: number; // typical value multiplier vs base
  note?: string;
}

interface ParallelSystem {
  id: string;
  name: string;
  manufacturer: string;
  launchYear: number;
  sports: string;
  flagship: boolean;
  primer: string;
  badgeColor: string;
  parallels: Parallel[];
}

const systems: ParallelSystem[] = [
  {
    id: 'topps-chrome',
    name: 'Topps Chrome (Baseball)',
    manufacturer: 'Topps',
    launchYear: 1996,
    sports: 'MLB',
    flagship: true,
    badgeColor: 'from-red-500 to-yellow-400',
    primer: 'The template for all modern parallels. Every baseball hobby box you buy inherits the Topps Chrome rainbow. Base and standard refractors are unnumbered; colored refractors scale from /250 down to the 1/1 SuperFractor. Flagship rookies here become hobby touchstones.',
    parallels: [
      { name: 'Base Chrome', gradient: 'from-gray-300 to-gray-500', tier: 'common', multiplier: 1, printRunNote: 'unnumbered', note: 'The common card. Still chrome stock but no color foil.' },
      { name: 'Refractor', gradient: 'from-purple-300 via-pink-300 via-yellow-300 to-cyan-300', tier: 'common', multiplier: 1.8, printRunNote: 'unnumbered', note: 'Entry-level rainbow shimmer. The original refractor.' },
      { name: 'Prism Refractor', gradient: 'from-fuchsia-400 via-amber-300 to-cyan-400', tier: 'scarce', multiplier: 2.2, printRun: 299 },
      { name: 'Aqua Refractor', gradient: 'from-cyan-400 to-teal-400', tier: 'scarce', multiplier: 3, printRun: 199 },
      { name: 'Purple Refractor', gradient: 'from-purple-500 to-purple-700', tier: 'scarce', multiplier: 3.5, printRun: 250 },
      { name: 'Blue Refractor', gradient: 'from-blue-500 to-blue-700', tier: 'rare', multiplier: 5, printRun: 150 },
      { name: 'Green Refractor', gradient: 'from-emerald-500 to-green-700', tier: 'rare', multiplier: 7, printRun: 99 },
      { name: 'Gold Refractor', gradient: 'from-yellow-400 via-amber-500 to-yellow-600', tier: 'rare', multiplier: 12, printRun: 50, note: 'The gold standard hobby milestone.' },
      { name: 'Orange Refractor', gradient: 'from-orange-500 to-amber-600', tier: 'super-rare', multiplier: 22, printRun: 25 },
      { name: 'Red Refractor', gradient: 'from-red-600 to-rose-700', tier: 'super-rare', multiplier: 60, printRun: 5, note: 'Single-digit serial. Real money.' },
      { name: 'SuperFractor', gradient: 'from-yellow-300 via-amber-400 via-orange-500 to-yellow-600', tier: 'grail', multiplier: 250, printRun: 1, note: 'The 1-of-1. Auction house territory.' },
    ],
  },
  {
    id: 'bowman-chrome',
    name: 'Bowman Chrome Prospect (Baseball)',
    manufacturer: 'Topps / Bowman',
    launchYear: 1997,
    sports: 'MLB Prospects',
    flagship: true,
    badgeColor: 'from-blue-500 to-cyan-400',
    primer: 'The prospect side. Bowman Chrome is where you buy a rookie 2-4 years before they reach MLB. Rainbows are almost identical to Topps Chrome but with the addition of mojo refractors and the all-important 1st Bowman Chrome Auto. First Bowman autos of breakout players are the single most speculative assets in the hobby.',
    parallels: [
      { name: 'Base Chrome Prospect', gradient: 'from-gray-300 to-gray-500', tier: 'common', multiplier: 1, printRunNote: 'unnumbered' },
      { name: 'Refractor', gradient: 'from-purple-300 via-pink-300 via-yellow-300 to-cyan-300', tier: 'common', multiplier: 1.8, printRunNote: 'unnumbered' },
      { name: 'Mojo Refractor', gradient: 'from-indigo-400 via-fuchsia-400 to-rose-400', tier: 'scarce', multiplier: 2.5, printRunNote: 'Mega Box exclusive' },
      { name: 'Aqua Refractor', gradient: 'from-cyan-400 to-teal-400', tier: 'scarce', multiplier: 3, printRun: 199 },
      { name: 'Purple Refractor', gradient: 'from-purple-500 to-purple-700', tier: 'scarce', multiplier: 3.5, printRun: 250 },
      { name: 'Blue Refractor', gradient: 'from-blue-500 to-blue-700', tier: 'rare', multiplier: 5, printRun: 150 },
      { name: 'Green Refractor', gradient: 'from-emerald-500 to-green-700', tier: 'rare', multiplier: 7, printRun: 99 },
      { name: 'Yellow Refractor', gradient: 'from-yellow-300 to-yellow-500', tier: 'rare', multiplier: 9, printRun: 75 },
      { name: 'Gold Refractor', gradient: 'from-yellow-400 via-amber-500 to-yellow-600', tier: 'rare', multiplier: 12, printRun: 50 },
      { name: 'Orange Refractor', gradient: 'from-orange-500 to-amber-600', tier: 'super-rare', multiplier: 22, printRun: 25 },
      { name: 'Red Refractor', gradient: 'from-red-600 to-rose-700', tier: 'super-rare', multiplier: 65, printRun: 5 },
      { name: 'SuperFractor', gradient: 'from-yellow-300 via-amber-400 via-orange-500 to-yellow-600', tier: 'grail', multiplier: 300, printRun: 1 },
    ],
  },
  {
    id: 'panini-prizm',
    name: 'Panini Prizm (NFL / NBA)',
    manufacturer: 'Panini',
    launchYear: 2012,
    sports: 'NFL, NBA, NCAA',
    flagship: true,
    badgeColor: 'from-purple-500 via-blue-500 to-cyan-400',
    primer: 'The flagship of modern football and basketball. A rookie Prizm is the default hobby entry for football and basketball collectors born after 1995. Unnumbered base Prizm (often called Silver Prizm informally) anchors the system. 20+ numbered parallels sit above it, capped by the Black Finite 1/1.',
    parallels: [
      { name: 'Base Prizm (Silver)', gradient: 'from-gray-200 to-gray-400', tier: 'common', multiplier: 1, printRunNote: 'unnumbered', note: 'The chrome-finish base. Often miscalled a "parallel."' },
      { name: 'Red White Blue Prizm', gradient: 'from-red-500 via-white to-blue-500', tier: 'common', multiplier: 1.4, printRunNote: 'unnumbered' },
      { name: 'Red Prizm', gradient: 'from-red-500 to-red-700', tier: 'common', multiplier: 1.5, printRunNote: 'unnumbered' },
      { name: 'Blue Prizm', gradient: 'from-blue-500 to-blue-700', tier: 'scarce', multiplier: 2, printRunNote: 'unnumbered' },
      { name: 'Hyper Prizm', gradient: 'from-teal-400 via-fuchsia-400 to-violet-500', tier: 'scarce', multiplier: 2.5, printRunNote: 'Retail' },
      { name: 'Light Blue Prizm', gradient: 'from-sky-300 to-sky-500', tier: 'scarce', multiplier: 3, printRun: 199 },
      { name: 'Purple Prizm', gradient: 'from-purple-500 to-purple-700', tier: 'rare', multiplier: 5, printRun: 75 },
      { name: 'Orange Prizm', gradient: 'from-orange-500 to-amber-600', tier: 'rare', multiplier: 8, printRun: 49 },
      { name: 'Red Cracked Ice', gradient: 'from-red-600 via-pink-400 to-red-700', tier: 'rare', multiplier: 10, printRun: 49 },
      { name: 'Green Prizm', gradient: 'from-emerald-500 to-green-700', tier: 'super-rare', multiplier: 18, printRun: 25 },
      { name: 'Gold Prizm', gradient: 'from-yellow-400 via-amber-500 to-yellow-600', tier: 'super-rare', multiplier: 40, printRun: 10, note: 'Single-digit serials, aggressive demand.' },
      { name: 'Black Finite', gradient: 'from-gray-900 to-black', tier: 'grail', multiplier: 180, printRun: 1, note: 'The Prizm 1/1. Elite rookie Black Finites sell $100k+.' },
    ],
  },
  {
    id: 'panini-select',
    name: 'Panini Select (NFL / NBA)',
    manufacturer: 'Panini',
    launchYear: 2013,
    sports: 'NFL, NBA',
    flagship: true,
    badgeColor: 'from-indigo-500 to-blue-400',
    primer: 'The tiered-box-seats system. Select is unique: instead of the same photo at different print runs, the rookie ascends through Concourse (base) into Premier, Club Level, and Field Level — each tier scarcer and deeper in the set. Within each tier, color parallels layer on top. A Field Level Gold /10 is Select elite.',
    parallels: [
      { name: 'Concourse', gradient: 'from-slate-400 to-slate-600', tier: 'common', multiplier: 1, printRunNote: 'Base tier' },
      { name: 'Premier Level', gradient: 'from-blue-400 to-indigo-500', tier: 'scarce', multiplier: 2, printRunNote: 'Tier 2' },
      { name: 'Club Level', gradient: 'from-fuchsia-400 to-purple-500', tier: 'rare', multiplier: 4, printRunNote: 'Tier 3' },
      { name: 'Field Level', gradient: 'from-orange-400 to-red-500', tier: 'super-rare', multiplier: 10, printRunNote: 'Tier 4 (scarcest photo)' },
      { name: 'Silver Prizm', gradient: 'from-gray-300 to-gray-500', tier: 'common', multiplier: 1.3, printRunNote: 'unnumbered' },
      { name: 'Blue Prizm', gradient: 'from-blue-500 to-blue-700', tier: 'scarce', multiplier: 2.5, printRun: 299 },
      { name: 'Red Prizm', gradient: 'from-red-500 to-red-700', tier: 'rare', multiplier: 4, printRun: 199 },
      { name: 'Tie-Dye Prizm', gradient: 'from-fuchsia-500 via-orange-400 to-green-400', tier: 'rare', multiplier: 8, printRun: 25 },
      { name: 'Gold Prizm', gradient: 'from-yellow-400 via-amber-500 to-yellow-600', tier: 'super-rare', multiplier: 25, printRun: 10 },
      { name: 'Black Prizm', gradient: 'from-gray-900 to-black', tier: 'grail', multiplier: 150, printRun: 1 },
    ],
  },
  {
    id: 'donruss-optic',
    name: 'Panini Donruss Optic (NFL / NBA)',
    manufacturer: 'Panini',
    launchYear: 2016,
    sports: 'NFL, NBA, MLB',
    flagship: false,
    badgeColor: 'from-emerald-500 to-yellow-400',
    primer: 'The budget-to-mid tier. Optic is the chrome-finish version of Donruss. Accessible for opening, rainbow-friendly for builders. The Gold Vinyl 1/1 is a cult grail. Fewer numbered colors than Prizm but each parallel has a distinct pattern (Shock, Velocity, Pandora) that collectors learn to recognize on sight.',
    parallels: [
      { name: 'Base Optic', gradient: 'from-gray-300 to-gray-500', tier: 'common', multiplier: 1, printRunNote: 'unnumbered' },
      { name: 'Holo', gradient: 'from-purple-300 via-pink-300 to-cyan-300', tier: 'common', multiplier: 1.8, printRunNote: 'unnumbered' },
      { name: 'Red & Yellow', gradient: 'from-red-400 to-yellow-400', tier: 'common', multiplier: 2, printRunNote: 'unnumbered' },
      { name: 'Blue Velocity', gradient: 'from-blue-400 to-blue-600', tier: 'scarce', multiplier: 2.5, printRunNote: 'Hobby exclusive' },
      { name: 'Orange', gradient: 'from-orange-400 to-orange-600', tier: 'scarce', multiplier: 3, printRun: 199 },
      { name: 'Purple Shock', gradient: 'from-purple-500 to-fuchsia-600', tier: 'scarce', multiplier: 4, printRun: 99 },
      { name: 'Checkerboard', gradient: 'from-white to-gray-800', tier: 'rare', multiplier: 6, printRun: 25 },
      { name: 'Blue Pandora', gradient: 'from-blue-500 via-cyan-400 to-blue-700', tier: 'rare', multiplier: 8, printRun: 15 },
      { name: 'Green', gradient: 'from-emerald-500 to-green-700', tier: 'super-rare', multiplier: 25, printRun: 5 },
      { name: 'Gold Vinyl', gradient: 'from-yellow-300 via-amber-400 to-yellow-600', tier: 'grail', multiplier: 180, printRun: 1, note: 'The Optic 1/1. Cult grail for modern collectors.' },
    ],
  },
  {
    id: 'panini-mosaic',
    name: 'Panini Mosaic (NFL / NBA)',
    manufacturer: 'Panini',
    launchYear: 2019,
    sports: 'NFL, NBA, MLB',
    flagship: false,
    badgeColor: 'from-pink-500 to-violet-500',
    primer: 'The loud-pattern cousin of Prizm. Mosaic prints the same player photo with a graphic-pattern foil background. Parallels emphasize reactive colors (change under light) and fluorescent neons. Generally valued below Prizm at equivalent print runs but known for visually striking rainbow builds.',
    parallels: [
      { name: 'Base Mosaic', gradient: 'from-gray-300 to-gray-500', tier: 'common', multiplier: 1, printRunNote: 'unnumbered' },
      { name: 'Silver', gradient: 'from-gray-200 to-gray-400', tier: 'common', multiplier: 1.5, printRunNote: 'unnumbered' },
      { name: 'Reactive Blue', gradient: 'from-cyan-300 to-blue-500', tier: 'scarce', multiplier: 2.2, printRunNote: 'Reactive' },
      { name: 'Reactive Orange', gradient: 'from-amber-400 to-orange-600', tier: 'scarce', multiplier: 2.2, printRunNote: 'Reactive' },
      { name: 'Orange Fluorescent', gradient: 'from-orange-400 to-red-500', tier: 'scarce', multiplier: 3, printRun: 199 },
      { name: 'Green Fluorescent', gradient: 'from-emerald-400 to-green-600', tier: 'rare', multiplier: 5, printRun: 25 },
      { name: 'Pink Camo', gradient: 'from-pink-300 via-pink-500 to-pink-700', tier: 'rare', multiplier: 7, printRun: 25 },
      { name: 'Genesis', gradient: 'from-fuchsia-500 via-violet-500 to-indigo-500', tier: 'super-rare', multiplier: 20, printRun: 10 },
      { name: 'Red', gradient: 'from-red-500 to-red-700', tier: 'super-rare', multiplier: 25, printRun: 10 },
      { name: 'Black', gradient: 'from-gray-900 to-black', tier: 'grail', multiplier: 120, printRun: 1 },
    ],
  },
  {
    id: 'young-guns',
    name: 'Upper Deck Young Guns (NHL)',
    manufacturer: 'Upper Deck',
    launchYear: 2001,
    sports: 'NHL',
    flagship: true,
    badgeColor: 'from-cyan-400 to-blue-600',
    primer: 'Hockey is different. Upper Deck holds the NHL exclusive and the Young Guns rookie subset (cards 201-250 + 451-500) is the single most recognized hockey rookie format in the modern era. Print run is unnumbered but short-printed at roughly 1-in-4 packs. Crosby, Ovechkin, McDavid, Matthews Young Guns are permanent blue-chip assets.',
    parallels: [
      { name: 'Young Guns (Base)', gradient: 'from-gray-300 to-gray-500', tier: 'common', multiplier: 1, printRunNote: 'SP ~1:4 packs' },
      { name: 'Canvas', gradient: 'from-amber-200 to-amber-400', tier: 'scarce', multiplier: 2, printRunNote: 'SP insert' },
      { name: 'UD Exclusive', gradient: 'from-blue-400 to-blue-600', tier: 'rare', multiplier: 8, printRun: 100 },
      { name: 'High Gloss', gradient: 'from-cyan-400 to-cyan-600', tier: 'super-rare', multiplier: 25, printRun: 10 },
      { name: 'Acetate Clear Cut', gradient: 'from-cyan-200 to-white', tier: 'super-rare', multiplier: 40, printRun: 25, note: 'Transparent acetate stock.' },
      { name: 'Printing Plate', gradient: 'from-gray-700 via-yellow-500 to-gray-700', tier: 'grail', multiplier: 60, printRun: 1 },
    ],
  },
  {
    id: 'pokemon-rarity',
    name: 'Pokemon TCG Rarity System',
    manufacturer: 'The Pokemon Company',
    launchYear: 1999,
    sports: 'TCG',
    flagship: true,
    badgeColor: 'from-yellow-400 via-red-500 to-blue-500',
    primer: 'Pokemon does not use refractors — it uses a rarity ladder printed right on the card. The small symbol in the bottom corner tells you the tier: circle (Common), diamond (Uncommon), star (Rare), star with holofoil for Rare Holo, then up through Ultra Rare and Secret Rare variants. Modern sets add Alt Arts which are the Pokemon equivalent of a grail parallel.',
    parallels: [
      { name: 'Common (●)', gradient: 'from-gray-300 to-gray-500', tier: 'common', multiplier: 1, printRunNote: '~75% of sheets' },
      { name: 'Uncommon (◆)', gradient: 'from-gray-400 to-gray-600', tier: 'common', multiplier: 1.5, printRunNote: '~20% of sheets' },
      { name: 'Rare (★)', gradient: 'from-gray-500 to-gray-700', tier: 'common', multiplier: 2, printRunNote: '1 per pack' },
      { name: 'Rare Holo', gradient: 'from-purple-300 via-pink-300 to-cyan-300', tier: 'scarce', multiplier: 3, printRunNote: 'Holofoil art box' },
      { name: 'Double Rare (V / ex)', gradient: 'from-blue-400 to-blue-600', tier: 'scarce', multiplier: 5, printRunNote: 'Pull rate ~1:6' },
      { name: 'Ultra Rare (VMAX / ex Full Art)', gradient: 'from-purple-500 to-fuchsia-500', tier: 'rare', multiplier: 12, printRunNote: 'Pull rate ~1:12' },
      { name: 'Secret Rare', gradient: 'from-yellow-400 to-amber-600', tier: 'rare', multiplier: 20, printRunNote: 'Numbered above set total' },
      { name: 'Rainbow Rare', gradient: 'from-red-400 via-yellow-300 via-green-400 via-blue-400 to-purple-500', tier: 'super-rare', multiplier: 30, printRunNote: 'Scale rainbow holo' },
      { name: 'Gold Secret Rare', gradient: 'from-yellow-300 via-amber-500 to-yellow-700', tier: 'super-rare', multiplier: 40, printRunNote: 'Gold foil treatment' },
      { name: 'Alternate Art (Alt Art)', gradient: 'from-fuchsia-400 via-violet-500 to-indigo-600', tier: 'grail', multiplier: 80, printRunNote: 'Modern art-style pulls', note: 'Modern chase. Japanese Alt Arts often 10x their US equivalents.' },
    ],
  },
];

const tierLabels: Record<Tier, { label: string; color: string }> = {
  'common': { label: 'Common', color: 'bg-gray-700 text-gray-300' },
  'scarce': { label: 'Scarce', color: 'bg-blue-900/60 text-blue-300' },
  'rare': { label: 'Rare', color: 'bg-purple-900/60 text-purple-300' },
  'super-rare': { label: 'Super Rare', color: 'bg-orange-900/60 text-orange-300' },
  'grail': { label: 'Grail', color: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border border-yellow-700/50' },
};

export default function ParallelRainbowClient() {
  const [activeSystem, setActiveSystem] = useState<string>('topps-chrome');
  const [basePrice, setBasePrice] = useState<number>(10);
  const [filter, setFilter] = useState<'all' | 'flagship' | 'panini' | 'topps'>('all');

  const totalParallels = systems.reduce((sum, s) => sum + s.parallels.length, 0);
  const total1of1s = systems.reduce((sum, s) => sum + s.parallels.filter(p => p.printRun === 1).length, 0);

  const filteredSystems = useMemo(() => {
    if (filter === 'all') return systems;
    if (filter === 'flagship') return systems.filter(s => s.flagship);
    if (filter === 'panini') return systems.filter(s => s.manufacturer === 'Panini');
    if (filter === 'topps') return systems.filter(s => s.manufacturer.includes('Topps'));
    return systems;
  }, [filter]);

  const active = systems.find(s => s.id === activeSystem) || systems[0];

  const rainbowTotal = useMemo(() => {
    return active.parallels.reduce((sum, p) => sum + basePrice * p.multiplier, 0);
  }, [active, basePrice]);

  return (
    <div className="space-y-10">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-purple-950/60 to-gray-900/60 border border-purple-800/40 rounded-xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-300">{systems.length}</div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-1">Parallel Systems</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-950/60 to-gray-900/60 border border-cyan-800/40 rounded-xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-cyan-300">{totalParallels}</div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-1">Total Parallels</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-950/60 to-gray-900/60 border border-yellow-800/40 rounded-xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{total1of1s}</div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500 mt-1">True 1-of-1s</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'flagship', 'panini', 'topps'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'All Systems' : f === 'flagship' ? 'Flagships Only' : f === 'panini' ? 'Panini' : 'Topps / Bowman'}
          </button>
        ))}
      </div>

      {/* System picker */}
      <div className="flex flex-wrap gap-2">
        {filteredSystems.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSystem(s.id)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeSystem === s.id
                ? `bg-gradient-to-r ${s.badgeColor} text-white shadow-lg`
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Active system display */}
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <div className={`inline-block bg-gradient-to-r ${active.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2`}>
              {active.manufacturer} &middot; {active.sports} &middot; since {active.launchYear}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{active.name}</h2>
          </div>
          {active.flagship && (
            <div className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold bg-yellow-950/40 border border-yellow-800/40 px-2 py-1 rounded">
              ★ Flagship
            </div>
          )}
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-6">{active.primer}</p>

        {/* Rainbow Value Estimator */}
        <div className="mb-6 bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">If the base card sells for:</label>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">$</span>
              <input
                type="number"
                min={1}
                max={10000}
                value={basePrice}
                onChange={e => setBasePrice(Math.max(1, Math.min(10000, Number(e.target.value) || 1)))}
                className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Full rainbow (every parallel at typical multiplier):{' '}
            <span className="text-purple-300 font-semibold">${rainbowTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            {' '}estimated. Multipliers reflect recent eBay sold-comps at typical demand. Star players push 2-3x higher; bench cards trade lower.
          </div>
        </div>

        {/* Parallels list */}
        <div className="space-y-2">
          {active.parallels.map((p, idx) => {
            const tier = tierLabels[p.tier];
            const estValue = basePrice * p.multiplier;
            return (
              <div
                key={idx}
                className="group bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/40 rounded-xl p-3 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.gradient} flex-shrink-0 shadow-inner border border-white/10`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-semibold">{p.name}</span>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${tier.color}`}>
                        {tier.label}
                      </span>
                      {p.printRun === 1 && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-900/60 text-yellow-300 font-bold">
                          1/1
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {p.printRun ? `/${p.printRun}` : p.printRunNote || 'unnumbered'}
                      {' · '}
                      <span className="text-cyan-400">~{p.multiplier}x base</span>
                      {' · '}
                      <span className="text-green-400">~${estValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    {p.note && (
                      <div className="text-xs text-gray-400 mt-1 italic">{p.note}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-[11px] text-gray-500 italic">
          Print runs reflect recent product years (2022-2024) and may vary slightly across releases. Value multipliers are
          rule-of-thumb starting points — always check eBay sold listings for the specific card before buying or selling.
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-4">
        <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Rarity Tier Legend</div>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(tierLabels) as [Tier, { label: string; color: string }][]).map(([key, t]) => (
            <span key={key} className={`text-[11px] px-2 py-1 rounded ${t.color}`}>
              {t.label}
            </span>
          ))}
        </div>
        <div className="text-[11px] text-gray-500 mt-3 leading-relaxed">
          Common: likely in most boxes. Scarce: one or two per case. Rare: numbered /99 and below.
          Super Rare: numbered /25 and below. Grail: 1/1s and their equivalents (SuperFractor, Black Finite, Gold Vinyl).
        </div>
      </div>

      {/* Cross-system comparison */}
      <div className="bg-gradient-to-br from-purple-950/40 to-gray-900/40 border border-purple-800/40 rounded-xl p-5">
        <div className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-3">Cross-System Cheat Sheet</div>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-white font-medium text-sm mb-1">The 1/1 tier by product</div>
            <ul className="text-gray-400 space-y-0.5">
              <li>Topps Chrome → <span className="text-yellow-400">SuperFractor</span></li>
              <li>Bowman Chrome → <span className="text-yellow-400">SuperFractor</span></li>
              <li>Panini Prizm → <span className="text-gray-300">Black Finite</span></li>
              <li>Panini Select → <span className="text-gray-300">Black Prizm</span></li>
              <li>Donruss Optic → <span className="text-yellow-400">Gold Vinyl</span></li>
              <li>Panini Mosaic → <span className="text-gray-300">Black</span></li>
              <li>Upper Deck Young Guns → <span className="text-yellow-400">Printing Plate</span></li>
              <li>Pokemon → <span className="text-fuchsia-400">Alt Art / SAR</span></li>
            </ul>
          </div>
          <div className="bg-gray-900/60 rounded-lg p-3">
            <div className="text-white font-medium text-sm mb-1">The /99 tier sweet spot</div>
            <ul className="text-gray-400 space-y-0.5">
              <li>Chrome → Green Refractor</li>
              <li>Prizm → Purple /75 (closest)</li>
              <li>Select → Tie-Dye /25 (scarcer tier)</li>
              <li>Optic → Purple Shock /99</li>
              <li>Mosaic → Pink Camo /25 (scarcer tier)</li>
            </ul>
            <div className="text-gray-500 mt-2 text-[10px]">
              /99 and below is the unofficial "slab it" threshold. Grading population numbers drop sharply here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
