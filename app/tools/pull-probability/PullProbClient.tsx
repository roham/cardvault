'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

const SPORT_COLORS: Record<string, string> = {
  baseball: 'bg-red-500',
  basketball: 'bg-orange-500',
  football: 'bg-blue-500',
  hockey: 'bg-cyan-500',
  pokemon: 'bg-yellow-500',
};

interface Preset {
  name: string;
  sport: string;
  odds: number; // 1 in X
  packPrice: number;
  description: string;
}

const PRESETS: Preset[] = [
  { name: '2024 Topps Chrome Hobby — Auto', sport: 'baseball', odds: 12, packPrice: 8, description: '2 autos per 24-pack box' },
  { name: '2024 Topps Chrome Hobby — Numbered /25', sport: 'baseball', odds: 480, packPrice: 8, description: 'Ultra-short print' },
  { name: '2024 Prizm Football Hobby — Auto', sport: 'football', odds: 6, packPrice: 25, description: '4 autos per 12-pack box' },
  { name: '2024 Prizm Football — Silver Prizm', sport: 'football', odds: 4, packPrice: 25, description: '~3 per box' },
  { name: '2024 Prizm Football — Gold /10', sport: 'football', odds: 1200, packPrice: 25, description: 'Case hit territory' },
  { name: '2024-25 Prizm Basketball — Auto', sport: 'basketball', odds: 6, packPrice: 20, description: '~2 per box' },
  { name: '2024-25 Prizm Basketball — Silver', sport: 'basketball', odds: 4, packPrice: 20, description: '~3 per box' },
  { name: '2024-25 Upper Deck Series 1 — Young Guns', sport: 'hockey', odds: 3, packPrice: 5, description: '~2 per box on average' },
  { name: '2024-25 Upper Deck — Patch Auto', sport: 'hockey', odds: 192, packPrice: 5, description: 'Roughly 1 per 8 boxes' },
  { name: 'Pokemon Scarlet & Violet — Illustration Rare', sport: 'pokemon', odds: 18, packPrice: 4.50, description: '~2 per booster box' },
  { name: 'Pokemon Scarlet & Violet — Special Art Rare', sport: 'pokemon', odds: 72, packPrice: 4.50, description: '~0.5 per booster box' },
  { name: '2024 Topps Series 1 Blaster — Auto', sport: 'baseball', odds: 72, packPrice: 1.50, description: 'Roughly 1 per 5 blasters' },
  { name: '2024 Donruss Football Blaster — Rated Rookie Auto', sport: 'football', odds: 24, packPrice: 2.50, description: 'Chase insert auto' },
  { name: 'Custom Odds', sport: 'baseball', odds: 100, packPrice: 5, description: 'Enter your own odds' },
];

const THRESHOLDS = [50, 75, 90, 95, 99];

function packsNeeded(oddsOneInX: number, confidencePct: number): number {
  if (oddsOneInX <= 1) return 1;
  const p = 1 / oddsOneInX;
  const target = confidencePct / 100;
  if (p >= 1) return 1;
  if (p <= 0) return Infinity;
  return Math.ceil(Math.log(1 - target) / Math.log(1 - p));
}

function probAfterNPacks(oddsOneInX: number, n: number): number {
  if (oddsOneInX <= 1) return 100;
  const p = 1 / oddsOneInX;
  return (1 - Math.pow(1 - p, n)) * 100;
}

export default function PullProbClient() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customOdds, setCustomOdds] = useState(100);
  const [customPackPrice, setCustomPackPrice] = useState(5);
  const [customPacks, setCustomPacks] = useState(50);
  const [sportFilter, setSportFilter] = useState<string>('all');

  const preset = PRESETS[selectedPreset];
  const isCustom = preset.name === 'Custom Odds';
  const odds = isCustom ? customOdds : preset.odds;
  const packPrice = isCustom ? customPackPrice : preset.packPrice;

  const thresholdData = useMemo(() => {
    return THRESHOLDS.map(pct => {
      const packs = packsNeeded(odds, pct);
      return {
        pct,
        packs,
        cost: packs * packPrice,
        boxes: Math.ceil(packs / (preset.sport === 'pokemon' ? 36 : preset.sport === 'hockey' ? 24 : 12)),
      };
    });
  }, [odds, packPrice, preset.sport]);

  const customProb = useMemo(() => {
    return probAfterNPacks(odds, customPacks);
  }, [odds, customPacks]);

  const filteredPresets = sportFilter === 'all'
    ? PRESETS
    : PRESETS.filter(p => p.sport === sportFilter || p.name === 'Custom Odds');

  return (
    <div className="space-y-8">
      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'baseball', 'football', 'basketball', 'hockey', 'pokemon'].map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              sportFilter === s
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {s === 'all' ? 'All Sports' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPresets.map((p, i) => {
          const realIndex = PRESETS.indexOf(p);
          return (
            <button
              key={p.name}
              onClick={() => setSelectedPreset(realIndex)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedPreset === realIndex
                  ? 'bg-purple-950/60 border-purple-600 ring-1 ring-purple-600'
                  : 'bg-gray-900/60 border-gray-800/40 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${SPORT_COLORS[p.sport] || 'bg-gray-500'}`} />
                <span className="text-sm font-medium text-white truncate">{p.name}</span>
              </div>
              <div className="text-xs text-gray-500">{p.description}</div>
              {p.name !== 'Custom Odds' && (
                <div className="mt-2 text-xs text-gray-400">
                  1 in {p.odds.toLocaleString()} packs &middot; ${p.packPrice.toFixed(2)}/pack
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Odds Input */}
      {isCustom && (
        <div className="bg-gray-900/60 border border-gray-800/40 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Custom Odds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Odds: 1 in X packs</label>
              <input
                type="number"
                min={1}
                max={100000}
                value={customOdds}
                onChange={e => setCustomOdds(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pack Price ($)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={customPackPrice}
                onChange={e => setCustomPackPrice(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Product Summary */}
      <div className="bg-gray-900/60 border border-gray-800/40 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-3 h-3 rounded-full ${SPORT_COLORS[preset.sport] || 'bg-gray-500'}`} />
          <h3 className="text-lg font-bold text-white">{isCustom ? 'Custom Scenario' : preset.name}</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">1 in {odds.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Pull Odds</div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">${packPrice.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">Per Pack</div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{(100 / odds).toFixed(2)}%</div>
            <div className="text-xs text-gray-500 mt-1">Per-Pack Chance</div>
          </div>
        </div>
      </div>

      {/* Probability Threshold Table */}
      <div className="bg-gray-900/60 border border-gray-800/40 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800/40">
          <h3 className="text-lg font-bold text-white">How Many Packs Do You Need?</h3>
          <p className="text-xs text-gray-500 mt-1">Based on geometric probability: P = 1 - (1 - 1/odds)^n</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/40">
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Confidence</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Packs Needed</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Est. Boxes</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {thresholdData.map(row => (
                <tr key={row.pct} className="border-b border-gray-800/20 hover:bg-gray-800/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.pct >= 95 ? 'bg-emerald-500' : row.pct >= 90 ? 'bg-green-500' : row.pct >= 75 ? 'bg-amber-500' : 'bg-gray-500'
                          }`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">{row.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-white font-mono">{row.packs.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-400 font-mono">~{row.boxes.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-medium ${
                      row.cost > 5000 ? 'text-red-400' : row.cost > 1000 ? 'text-amber-400' : row.cost > 200 ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      ${row.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Pack Count Calculator */}
      <div className="bg-gray-900/60 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Calculate Your Odds</h3>
        <p className="text-sm text-gray-400 mb-4">Enter the number of packs you plan to open:</p>
        <div className="flex items-center gap-4 mb-6">
          <input
            type="range"
            min={1}
            max={Math.max(500, odds * 5)}
            value={customPacks}
            onChange={e => setCustomPacks(parseInt(e.target.value))}
            className="flex-1 accent-purple-500"
          />
          <input
            type="number"
            min={1}
            value={customPacks}
            onChange={e => setCustomPacks(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm text-center focus:border-purple-500 focus:outline-none"
          />
          <span className="text-sm text-gray-500">packs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800/60 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${
              customProb >= 90 ? 'text-emerald-400' : customProb >= 75 ? 'text-green-400' : customProb >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {customProb.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Chance of Pulling</div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">
              ${(customPacks * packPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500 mt-1">Total Cost</div>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${customProb >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
              {customProb >= 50 ? 'Likely' : 'Unlikely'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Verdict</div>
          </div>
        </div>

        {/* Visual probability bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                customProb >= 90 ? 'bg-emerald-500' : customProb >= 75 ? 'bg-green-500' : customProb >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, customProb)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow">{customProb.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* The Math Explained */}
      <div className="bg-gray-900/60 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">How the Math Works</h3>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            Each pack is an independent trial. The probability of <strong className="text-white">not</strong> pulling
            the card from one pack is <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-400">1 - (1/{odds})</code> = {((1 - 1/odds) * 100).toFixed(4)}%.
          </p>
          <p>
            After <em>n</em> packs, the probability of <strong className="text-white">never</strong> pulling it is{' '}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-400">(1 - 1/{odds})^n</code>.
          </p>
          <p>
            So the chance of pulling it <strong className="text-white">at least once</strong> in <em>n</em> packs is:{' '}
            <code className="bg-gray-800 px-2 py-1 rounded text-emerald-400 text-base">P = 1 - (1 - 1/{odds})^n</code>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Note: This assumes each pack is independent (no box-level guarantees). Real products may have
            guaranteed hits per box, which improves your odds. This calculator gives the <em>worst-case</em> statistical baseline.
          </p>
        </div>
      </div>

      {/* Collecting Cost Context */}
      <div className="bg-gray-900/60 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">Should You Rip or Buy Singles?</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>
            If it costs <strong className="text-amber-400">${thresholdData[2]?.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> for
            a 90% chance of pulling the card, but the card sells for less than that on the secondary market, buying the single is always smarter.
          </p>
          <p>
            Use this alongside the{' '}
            <Link href="/tools/wax-vs-singles" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Wax vs Singles Calculator
            </Link>{' '}
            and{' '}
            <Link href="/tools/sealed-ev" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Sealed Product EV Calculator
            </Link>{' '}
            for the complete picture.
          </p>
        </div>
      </div>

      {/* Related Tools */}
      <div className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/pack-sim', label: 'Pack Simulator' },
            { href: '/tools/pack-odds', label: 'Pack Odds Calculator' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles' },
            { href: '/tools/box-break', label: 'Box Break Calculator' },
            { href: '/tools/mystery-pack', label: 'Mystery Repack Sim' },
            { href: '/tools/rip-or-hold', label: 'Rip or Hold' },
            { href: '/tools/daily-pack', label: 'Daily Free Pack' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
