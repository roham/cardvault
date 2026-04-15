'use client';

import { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
type Company = 'PSA' | 'BGS' | 'CGC' | 'SGC';

interface SlabGeneration {
  label: string;
  key: string;
  minWeight: number;
  maxWeight: number;
}

interface AuthCheck {
  label: string;
  description: string;
}

// ── Weight Data ────────────────────────────────────────────────────────────
const slabGenerations: Record<Company, SlabGeneration[]> = {
  PSA: [
    { label: 'Current (2020+)', key: 'psa-current', minWeight: 50, maxWeight: 56 },
    { label: 'Current Thick (2020+)', key: 'psa-current-thick', minWeight: 58, maxWeight: 65 },
    { label: 'Vintage Holder (2016-2020)', key: 'psa-vintage', minWeight: 48, maxWeight: 54 },
    { label: 'Old Holder (pre-2016)', key: 'psa-old', minWeight: 46, maxWeight: 52 },
    { label: 'Oversized', key: 'psa-oversized', minWeight: 85, maxWeight: 100 },
  ],
  BGS: [
    { label: 'Standard', key: 'bgs-standard', minWeight: 55, maxWeight: 62 },
    { label: 'Thick (Jersey/Relic)', key: 'bgs-thick', minWeight: 68, maxWeight: 78 },
    { label: 'Vintage', key: 'bgs-vintage', minWeight: 52, maxWeight: 58 },
  ],
  CGC: [
    { label: 'Standard', key: 'cgc-standard', minWeight: 52, maxWeight: 58 },
    { label: 'Oversized', key: 'cgc-oversized', minWeight: 80, maxWeight: 95 },
  ],
  SGC: [
    { label: 'Standard Tuxedo', key: 'sgc-standard', minWeight: 48, maxWeight: 55 },
    { label: 'Vintage', key: 'sgc-vintage', minWeight: 46, maxWeight: 52 },
  ],
};

// ── Authentication Checks ──────────────────────────────────────────────────
const authChecks: Record<Company, AuthCheck[]> = {
  PSA: [
    { label: 'Label Quality', description: 'Authentic PSA labels have crisp, clear printing with no bleeding or smudging. The set name and card number should be perfectly aligned.' },
    { label: 'UV Glow', description: 'Under UV (blacklight), genuine PSA holders exhibit a specific fluorescence pattern. Counterfeits often glow differently or not at all.' },
    { label: 'Case Seam', description: 'The ultrasonic weld seam on authentic PSA slabs is smooth and consistent. Look for uneven seams, bubbles, or rough edges as red flags.' },
    { label: 'Hologram', description: 'PSA holders feature a holographic sticker with the PSA DNA logo. It should shift colors when tilted and be impossible to peel without damage.' },
    { label: 'Font Consistency', description: 'The fonts on genuine PSA labels are proprietary. Compare to known authentic slabs — fake labels often use slightly different letter spacing or weight.' },
  ],
  BGS: [
    { label: 'Subgrade Label', description: 'Authentic BGS labels display four subgrades (Centering, Corners, Edges, Surface) with precise decimal alignment. Fakes often misalign the numbers.' },
    { label: 'Edge Seam Quality', description: 'BGS holders are sonically welded with a distinctive tight seam. Run your finger along the edge — it should be smooth with no gaps or rough spots.' },
    { label: 'Beckett Hologram', description: 'The Beckett holographic seal should display the "B" logo with rainbow shifting. Counterfeits often have a flat or dull hologram.' },
    { label: 'QR Code', description: 'Scan the QR code on the label — it should link directly to the Beckett verification page showing matching card details and grade.' },
    { label: 'Barcode', description: 'The barcode on authentic BGS slabs corresponds to the cert number. Verify it scans correctly and matches the printed certification number.' },
  ],
  CGC: [
    { label: 'Holder Clarity', description: 'CGC holders are known for exceptional optical clarity. Authentic cases have no haze, yellowing, or distortion when viewed at an angle.' },
    { label: 'Label Printing', description: 'CGC labels use a specific matte finish with precise typography. The grade number should be bold and centered with consistent ink density.' },
    { label: 'Serial Number Format', description: 'CGC certification numbers follow a specific numeric format. Verify the cert number on the CGC website to confirm it matches the card described.' },
    { label: 'Case Edge Quality', description: 'Authentic CGC holders have precision-molded edges with no flash, burrs, or misalignment between the front and back halves.' },
    { label: 'UV Test', description: 'CGC holders and labels respond to UV light in a specific way. The holder material should show a characteristic fluorescence under blacklight.' },
  ],
  SGC: [
    { label: 'Tuxedo Label', description: 'SGC\'s distinctive black-and-white "tuxedo" label should have sharp contrast with no gray bleeding. The borders should be crisp and even.' },
    { label: 'Case Thickness', description: 'SGC holders have a specific wall thickness that counterfeiters struggle to replicate. The case should feel solid without being overly bulky.' },
    { label: 'Barcode Format', description: 'SGC barcodes follow a specific format. Scan it to verify it produces a valid cert number that matches the printed number on the label.' },
    { label: 'Label Font', description: 'SGC uses specific proprietary fonts on their labels. Compare the card name, set, and grade fonts carefully against known authentic examples.' },
    { label: 'Edge Quality', description: 'The edges of an authentic SGC holder are smooth and uniformly sealed. Check for any separation, bubbles, or inconsistent seam width.' },
  ],
};

// ── Company Colors ─────────────────────────────────────────────────────────
const companyColors: Record<Company, { text: string; bg: string; border: string; accent: string }> = {
  PSA: { text: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/50', accent: 'text-red-300' },
  BGS: { text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/50', accent: 'text-amber-300' },
  CGC: { text: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/50', accent: 'text-emerald-300' },
  SGC: { text: 'text-sky-400', bg: 'bg-sky-950/40', border: 'border-sky-800/50', accent: 'text-sky-300' },
};

// ── Verdict Logic ──────────────────────────────────────────────────────────
function getVerdict(weight: number, min: number, max: number) {
  if (weight >= min && weight <= max) {
    return { label: 'Weight Matches', color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-700/50', description: 'The measured weight falls within the expected range for this slab type. This is a positive indicator of authenticity.' };
  }
  const lowerBorderline = min - 2;
  const upperBorderline = max + 2;
  if (weight >= lowerBorderline && weight <= upperBorderline) {
    return { label: 'Borderline', color: 'text-amber-400', bg: 'bg-amber-950/50', border: 'border-amber-700/50', description: 'The weight is slightly outside the expected range but within a 2g tolerance. This could be due to card thickness variation, a relic/patch card, or scale calibration. Proceed with additional visual checks.' };
  }
  return { label: 'Weight Mismatch - Investigate Further', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-700/50', description: 'The measured weight falls significantly outside the expected range for this slab type. This does not confirm a fake on its own, but warrants careful inspection of all visual authentication markers before purchasing.' };
}

// ── All Weight Ranges for Reference Table ──────────────────────────────────
const allRanges = [
  { company: 'PSA', type: 'Current (2020+)', range: '50-56g', color: 'text-red-400' },
  { company: 'PSA', type: 'Current Thick', range: '58-65g', color: 'text-red-400' },
  { company: 'PSA', type: 'Vintage Holder (2016-2020)', range: '48-54g', color: 'text-red-400' },
  { company: 'PSA', type: 'Old Holder (pre-2016)', range: '46-52g', color: 'text-red-400' },
  { company: 'PSA', type: 'Oversized', range: '85-100g', color: 'text-red-400' },
  { company: 'BGS', type: 'Standard', range: '55-62g', color: 'text-amber-400' },
  { company: 'BGS', type: 'Thick (Jersey/Relic)', range: '68-78g', color: 'text-amber-400' },
  { company: 'BGS', type: 'Vintage', range: '52-58g', color: 'text-amber-400' },
  { company: 'CGC', type: 'Standard', range: '52-58g', color: 'text-emerald-400' },
  { company: 'CGC', type: 'Oversized', range: '80-95g', color: 'text-emerald-400' },
  { company: 'SGC', type: 'Standard Tuxedo', range: '48-55g', color: 'text-sky-400' },
  { company: 'SGC', type: 'Vintage', range: '46-52g', color: 'text-sky-400' },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function SlabWeightClient() {
  const [company, setCompany] = useState<Company>('PSA');
  const [generationIdx, setGenerationIdx] = useState(0);
  const [weightInput, setWeightInput] = useState('');

  const generations = slabGenerations[company];
  const selected = generations[generationIdx];
  const colors = companyColors[company];
  const checks = authChecks[company];

  const weight = parseFloat(weightInput);
  const hasWeight = !isNaN(weight) && weight > 0;
  const verdict = hasWeight ? getVerdict(weight, selected.minWeight, selected.maxWeight) : null;

  function handleCompanyChange(c: Company) {
    setCompany(c);
    setGenerationIdx(0);
    setWeightInput('');
  }

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Select Grading Company</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['PSA', 'BGS', 'CGC', 'SGC'] as Company[]).map(c => (
            <button
              key={c}
              onClick={() => handleCompanyChange(c)}
              className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${
                company === c
                  ? `${companyColors[c].bg} ${companyColors[c].border} ${companyColors[c].text}`
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Slab Generation Selection */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Select Slab Generation / Era</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Each grading company has released different holder designs over the years. Select the one that matches your slab.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {generations.map((gen, i) => (
            <button
              key={gen.key}
              onClick={() => { setGenerationIdx(i); setWeightInput(''); }}
              className={`text-left py-3 px-4 rounded-lg border transition-all ${
                generationIdx === i
                  ? `${colors.bg} ${colors.border} ${colors.text}`
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              <div className="text-sm font-medium">{gen.label}</div>
              <div className="text-xs mt-1 opacity-70">{gen.minWeight}-{gen.maxWeight}g expected</div>
            </button>
          ))}
        </div>
      </div>

      {/* Expected Weight Display */}
      <div className={`${colors.bg} border ${colors.border} rounded-xl p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Expected Weight Range</div>
            <div className={`text-2xl font-bold ${colors.text}`}>
              {selected.minWeight}g &ndash; {selected.maxWeight}g
            </div>
            <div className="text-sm text-zinc-400 mt-1">{company} {selected.label}</div>
          </div>
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Your Measured Weight (grams)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="200"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="e.g. 53.5"
              className="w-full sm:w-48 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Verdict */}
      {verdict && (
        <div className={`${verdict.bg} border ${verdict.border} rounded-xl p-6`}>
          <div className={`text-xl font-bold ${verdict.color} mb-2`}>{verdict.label}</div>
          <p className="text-sm text-zinc-400 leading-relaxed">{verdict.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
            <span>Measured: <span className="text-white font-medium">{weight}g</span></span>
            <span>Expected: <span className="text-white font-medium">{selected.minWeight}-{selected.maxWeight}g</span></span>
            <span>Difference: <span className="text-white font-medium">
              {weight < selected.minWeight
                ? `-${(selected.minWeight - weight).toFixed(1)}g below`
                : weight > selected.maxWeight
                  ? `+${(weight - selected.maxWeight).toFixed(1)}g above`
                  : 'Within range'}
            </span></span>
          </div>
        </div>
      )}

      {/* Authentication Checks */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          Visual Authentication Checks &mdash; {company}
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          Weight is only one data point. Always perform these visual inspections alongside the weight test.
        </p>
        <div className="space-y-4">
          {checks.map((check, i) => (
            <div key={i} className="flex gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${colors.text}`}>{i + 1}</span>
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${colors.accent}`}>{check.label}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mt-0.5">{check.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weight Reference Table */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Weight Reference Table &mdash; All Companies</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-2 text-zinc-400 font-medium">Company</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Slab Type</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Expected Weight</th>
              </tr>
            </thead>
            <tbody>
              {allRanges.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800">
                  <td className={`py-2.5 font-medium ${row.color}`}>{row.company}</td>
                  <td className="py-2.5 text-zinc-300">{row.type}</td>
                  <td className="py-2.5 text-zinc-300">{row.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-amber-950/30 to-zinc-900/50 border border-amber-800/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-3">Slab Authentication Tips</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">1.</span> Use a digital scale accurate to at least 0.1g for reliable weight measurements — kitchen scales are too imprecise</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">2.</span> Weight alone never confirms or denies authenticity — always combine with visual checks, cert verification, and hologram inspection</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">3.</span> Relic, patch, and jersey cards will be heavier than standard cards in the same holder type due to the thicker card stock</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">4.</span> Always verify the certification number on the grading company&apos;s official website before purchasing any high-value slab</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">5.</span> When buying at shows or meetups, bring a small pocket scale and a UV flashlight — the two cheapest tools that catch the most fakes</li>
        </ul>
      </div>
    </div>
  );
}
