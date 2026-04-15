'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Error Type Data ───── */
interface ErrorType {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare';
  premiumRange: string;
  multiplierLow: number;
  multiplierHigh: number;
  description: string;
  howToSpot: string[];
  examples: string[];
  gradingImpact: string;
}

const errorTypes: ErrorType[] = [
  {
    id: 'off-center',
    name: 'Off-Center / Miscut',
    icon: '📐',
    rarity: 'common',
    premiumRange: '10-50% premium (minor) / 2-10x (severe)',
    multiplierLow: 1.1,
    multiplierHigh: 3.0,
    description: 'Card image is shifted from center, with uneven borders. Mild off-center (60/40) is common and usually hurts value. Severe miscuts (90/10 or showing adjacent card) can be very valuable.',
    howToSpot: [
      'Compare left/right and top/bottom border widths',
      'Look for adjacent card image visible on one edge',
      'Check if card name or number is partially cut off',
      'Use a centering tool (like our Centering Calculator) to measure',
    ],
    examples: [
      '1989 Upper Deck Ken Griffey Jr. severely miscut — sold for 3x base value',
      '2020 Topps Chrome Jasson Dominguez 90/10 off-center — premium over centered copies',
      'Any vintage card showing the adjacent card\'s border commands a premium',
    ],
    gradingImpact: 'Minor off-center (60/40) lowers grades. Severe miscuts (80/20+) should be sent to PSA as "Error" designation for maximum value.',
  },
  {
    id: 'wrong-back',
    name: 'Wrong Back',
    icon: '🔄',
    rarity: 'rare',
    premiumRange: '5-50x base value',
    multiplierLow: 5.0,
    multiplierHigh: 50.0,
    description: 'The back of the card has a completely different player\'s information. One of the most valuable error types because it\'s dramatic and easy to verify.',
    howToSpot: [
      'Flip the card — does the back match the front?',
      'Check player name, number, and stats on the back vs front',
      'Verify the card number matches on both sides',
      'Some wrong backs have the correct team but wrong player',
    ],
    examples: [
      '1989 Fleer Bill Ripken wrong-back variations — major collector items',
      '1990 Topps Frank Thomas with wrong back — significant premium',
      'Any star player with a wrong back commands huge premiums at auction',
    ],
    gradingImpact: 'PSA will note "Wrong Back" on the label. BGS may note it as well. These should always be submitted for grading to authenticate the error.',
  },
  {
    id: 'blank-back',
    name: 'Blank Back',
    icon: '⬜',
    rarity: 'rare',
    premiumRange: '3-20x base value',
    multiplierLow: 3.0,
    multiplierHigh: 20.0,
    description: 'The back of the card is completely blank — no text, no stats, no design. Caused by the card going through the press only once instead of twice.',
    howToSpot: [
      'Flip the card — the back should be plain white or cream cardstock',
      'There should be zero printing on the back',
      'The front should look completely normal',
      'Check for very faint ghost printing — some partial blanks exist',
    ],
    examples: [
      '1990 Score Bo Jackson blank back — popular collector item',
      'Vintage Topps blank backs from the 1960s-70s command strong premiums',
      'Modern blank backs are rarer than vintage due to better quality control',
    ],
    gradingImpact: 'PSA labels these as "Blank Back." Always submit for grading — authenticated blank backs sell for multiples of non-authenticated ones.',
  },
  {
    id: 'double-print',
    name: 'Double Print / Ghost Image',
    icon: '👻',
    rarity: 'uncommon',
    premiumRange: '50-200% premium',
    multiplierLow: 1.5,
    multiplierHigh: 3.0,
    description: 'A shadow or ghost of the image is printed twice, slightly offset. The card appears to have a blurry duplicate image. Caused by a printing plate misalignment.',
    howToSpot: [
      'Look for a faint shadow or duplicate of the main image',
      'Text may appear doubled or blurry',
      'Hold the card at an angle — the ghost image becomes more visible',
      'Use a loupe or magnifying glass to confirm it\'s printed, not damage',
    ],
    examples: [
      '1989 Donruss double-printed errors were widespread and collectible',
      'Modern Topps Chrome double-prints are rarer and more valuable',
      'Panini Prizm ghost images occasionally appear on refractor cards',
    ],
    gradingImpact: 'Grading companies will typically note this as a printing defect. Severe double prints may lower the grade but increase collector interest.',
  },
  {
    id: 'missing-foil',
    name: 'Missing Foil / No Foil Stamp',
    icon: '✨',
    rarity: 'uncommon',
    premiumRange: '2-10x base value',
    multiplierLow: 2.0,
    multiplierHigh: 10.0,
    description: 'Cards that should have a foil stamp or foil coating are missing it entirely. Very popular with error collectors because the difference is dramatic and easy to see.',
    howToSpot: [
      'Compare to a normal copy — is the foil name/logo/stamp missing?',
      'Check if the area where foil should be is flat/matte instead of shiny',
      'Look for partial foil — sometimes only part of the stamp is missing',
      'Some "no foil" errors still have the emboss but no metallic ink',
    ],
    examples: [
      '1991 Donruss Elite no-serial-number errors — highly sought after',
      '2020 Topps Chrome missing refractor coating — significant premium',
      'Panini Prizm missing silver coating creates a "base" look on a Prizm card',
    ],
    gradingImpact: 'PSA may note "No Foil" on the label. The card should be compared to a normal copy to verify. Authentication is key for value.',
  },
  {
    id: 'color-variation',
    name: 'Color Error / Ink Variation',
    icon: '🎨',
    rarity: 'uncommon',
    premiumRange: '50-500% premium',
    multiplierLow: 1.5,
    multiplierHigh: 6.0,
    description: 'The card has wrong colors, missing colors, or unusual color shifts compared to the standard version. Some famous color errors are among the most valuable cards in the hobby.',
    howToSpot: [
      'Compare color to a known normal copy side-by-side',
      'Look for missing color layers (e.g., no yellow, no red)',
      'Check if the background color is different from other cards in the set',
      'Some color errors are subtle — photograph under consistent lighting',
    ],
    examples: [
      '1990 Topps Frank Thomas "No Name on Front" — iconic and valuable error',
      '2014 Topps Chrome Mookie Betts pink/magenta refractor error — significant premium',
      'Vintage Topps cards with missing color layers (yellow, cyan) are extremely collectible',
    ],
    gradingImpact: 'Color errors need authentication. PSA and BGS will typically note the specific error on the label, which dramatically increases value over raw.',
  },
  {
    id: 'inverted',
    name: 'Inverted / Upside Down',
    icon: '🙃',
    rarity: 'rare',
    premiumRange: '5-100x base value',
    multiplierLow: 5.0,
    multiplierHigh: 50.0,
    description: 'Part of the card is printed upside down — either the image, the text, or the back. Extremely rare in modern cards due to automated quality control.',
    howToSpot: [
      'Look for text that reads upside down relative to the image',
      'Check if the back is printed upside down vs the front orientation',
      'Compare to a normal card — rotated elements are obvious',
      'Some inversions are partial (just the text layer)',
    ],
    examples: [
      '1989 Topps Gary Sheffield inverted back — one of the most famous modern errors',
      '1968 Topps inverted backs are legendary vintage errors',
      'Any modern inverted printing is exceptionally rare and commands huge premiums',
    ],
    gradingImpact: 'These should ALWAYS be graded. PSA will note "Inverted Back" or similar on the label. Authenticated inversions sell for many multiples of raw examples.',
  },
  {
    id: 'no-name',
    name: 'Missing Name / No Text',
    icon: '❓',
    rarity: 'rare',
    premiumRange: '3-50x base value',
    multiplierLow: 3.0,
    multiplierHigh: 50.0,
    description: 'The player\'s name, team name, or other text is completely missing from the card. The most famous example is the 1990 Topps Frank Thomas "NNOF" (No Name On Front).',
    howToSpot: [
      'Look where the player name should appear — is it blank?',
      'Check for missing team name, position, or card number',
      'Some cards have partial missing text (faded vs completely absent)',
      'Compare to a normal copy to confirm text is truly missing',
    ],
    examples: [
      '1990 Topps Frank Thomas NNOF #414 — the most famous error card, $500-$5,000+ depending on grade',
      '1989 Upper Deck Dale Murphy no-name variation — popular error',
      'Missing text errors on star players command enormous premiums',
    ],
    gradingImpact: 'PSA notes "No Name On Front" (NNOF) or similar designations. The NNOF designation on a PSA label can 10x the value of an ungraded copy.',
  },
  {
    id: 'wrong-photo',
    name: 'Wrong Photo / Photo Variation',
    icon: '📷',
    rarity: 'uncommon',
    premiumRange: '2-20x base value',
    multiplierLow: 2.0,
    multiplierHigh: 20.0,
    description: 'The card shows a different player than the one named, or uses a clearly wrong photo (different team uniform, different era). Some are corrected later, making the error version more collectible.',
    howToSpot: [
      'Does the player in the photo match the name on the card?',
      'Is the player wearing the correct team\'s uniform?',
      'Is the photo from the correct era/year?',
      'Compare the face to known photos of the named player',
    ],
    examples: [
      '1989 Fleer Bill Ripken "F*** Face" bat knob — the most infamous error card of all time',
      '1990 Topps John Smoltz with Tom Glavine photo — corrected later',
      '1957 Topps reverse negative errors showing players batting from wrong side',
    ],
    gradingImpact: 'Photo errors are well-documented in hobby guides. Grading companies will authenticate the card. Corrected versions (if they exist) make the error more valuable.',
  },
  {
    id: 'die-cut',
    name: 'Die-Cut Error / Miscut Shape',
    icon: '✂️',
    rarity: 'rare',
    premiumRange: '2-15x base value',
    multiplierLow: 2.0,
    multiplierHigh: 15.0,
    description: 'Cards that were die-cut incorrectly — the shaped cut is off-register, missing, or applied to the wrong card. Specific to sets that use die-cutting (like Topps Finest, Select).',
    howToSpot: [
      'The die-cut shape is shifted from where it should be',
      'A non-die-cut card has an unexpected cut/hole',
      'The die-cut goes through important parts of the image',
      'Compare to normal die-cut alignment on other cards from the same set',
    ],
    examples: [
      '1997 Topps Finest die-cut alignment errors — shifted cuts showing wrong sections',
      'Select die-cut errors where the cut goes through the player image',
      'Any misaligned die-cut on a star player commands a premium',
    ],
    gradingImpact: 'Die-cut errors can be tricky to grade. PSA may not always note the error specifically. Having a comparison normal copy helps establish authenticity.',
  },
];

const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-gray-800/60', text: 'text-gray-300', border: 'border-gray-600/50' },
  uncommon: { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
  rare: { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/50' },
  'ultra-rare': { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
};

/* ───── Premium Calculator ───── */
function estimatePremium(baseValue: number, error: ErrorType, severity: number): { low: number; high: number; mid: number } {
  const severityFactor = 0.5 + (severity / 100) * 1.5; // 0.5x at 0%, 2x at 100%
  const low = baseValue * error.multiplierLow * severityFactor;
  const high = baseValue * error.multiplierHigh * severityFactor;
  const mid = (low + high) / 2;
  return { low, high, mid };
}

function formatUSD(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function ErrorCards() {
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [baseValue, setBaseValue] = useState<number>(25);
  const [severity, setSeverity] = useState<number>(50);

  const activeError = useMemo(() => errorTypes.find(e => e.id === selectedError), [selectedError]);

  const premium = useMemo(() => {
    if (!activeError) return null;
    return estimatePremium(baseValue, activeError, severity);
  }, [activeError, baseValue, severity]);

  const quickValues = [5, 10, 25, 50, 100, 250, 500, 1000];

  return (
    <div className="space-y-10">
      {/* Error Type Grid */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Select Error Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {errorTypes.map(error => {
            const rc = rarityColors[error.rarity];
            const isActive = selectedError === error.id;
            return (
              <button
                key={error.id}
                onClick={() => setSelectedError(isActive ? null : error.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-emerald-950/60 border-emerald-500/70 ring-1 ring-emerald-500/30'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/70 hover:bg-gray-800/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{error.icon}</span>
                    <span className="font-semibold text-white text-sm">{error.name}</span>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.text} border ${rc.border}`}>
                    {error.rarity}
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{error.description}</p>
                <p className="text-emerald-400 text-xs font-medium mt-2">{error.premiumRange}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Error Detail + Calculator */}
      {activeError && (
        <section className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{activeError.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">{activeError.name}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rarityColors[activeError.rarity].bg} ${rarityColors[activeError.rarity].text} border ${rarityColors[activeError.rarity].border}`}>
                  {activeError.rarity} error
                </span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">{activeError.description}</p>
          </div>

          {/* How to Spot */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">How to Spot This Error</h3>
            <ul className="space-y-2">
              {activeError.howToSpot.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-0.5 shrink-0">&#10003;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Famous Examples */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Famous Examples</h3>
            <div className="space-y-2">
              {activeError.examples.map((ex, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-3 text-sm text-gray-300">
                  {ex}
                </div>
              ))}
            </div>
          </div>

          {/* Grading Impact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Grading Impact</h3>
            <p className="text-gray-300 text-sm leading-relaxed bg-amber-950/30 border border-amber-800/30 rounded-lg p-3">
              {activeError.gradingImpact}
            </p>
          </div>

          {/* Premium Calculator */}
          <div className="border-t border-gray-700/50 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Estimate Error Premium</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Base Card Value (normal copy)</label>
                <div className="flex gap-2 mb-2">
                  <span className="text-gray-500 text-lg self-center">$</span>
                  <input
                    type="number"
                    value={baseValue}
                    onChange={e => setBaseValue(Math.max(0, Number(e.target.value)))}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-lg focus:border-emerald-500 focus:outline-none"
                    min={0}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quickValues.map(v => (
                    <button
                      key={v}
                      onClick={() => setBaseValue(v)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        baseValue === v
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                    >
                      ${v >= 1000 ? `${v / 1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Error Severity: <span className="text-emerald-400 font-bold">{severity}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={severity}
                  onChange={e => setSeverity(Number(e.target.value))}
                  className="w-full accent-emerald-500 mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtle / Minor</span>
                  <span>Moderate</span>
                  <span>Dramatic / Extreme</span>
                </div>
              </div>
            </div>

            {premium && (
              <div className="mt-6 bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-5">
                <p className="text-xs text-emerald-400/70 uppercase tracking-wider font-medium mb-3">Estimated Error Card Value</p>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-white">{formatUSD(premium.mid)}</span>
                  <span className="text-gray-400 text-sm">range: {formatUSD(premium.low)} &ndash; {formatUSD(premium.high)}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Normal Value</p>
                    <p className="text-white font-semibold">${baseValue}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Premium</p>
                    <p className="text-emerald-400 font-semibold">+{((premium.mid / baseValue - 1) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Multiplier</p>
                    <p className="text-amber-400 font-semibold">{(premium.mid / baseValue).toFixed(1)}x</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Estimates based on historical auction results. Actual value varies by player, set, year, and market demand. Always check recent sold comps.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* General Tips */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Error Card Collecting Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Always Get It Graded', tip: 'Authenticated error cards sell for 2-10x more than raw. The grading label confirms the error is real, not damage or alteration.' },
            { title: 'Star Players Matter Most', tip: 'A Frank Thomas error is worth 100x more than a common player error. The base card value is the foundation — errors amplify it.' },
            { title: 'Corrected = More Valuable', tip: 'If the card company fixed the error in later prints, the error version becomes rarer and more valuable. Check if a corrected version exists.' },
            { title: 'Document Everything', tip: 'Photograph the error clearly, compare it to a normal copy, and note the specific details. This helps when selling or submitting for grading.' },
            { title: 'Check Price Guides', tip: 'Major error cards are catalogued in Beckett and other price guides. Search the specific error designation (e.g., "NNOF", "Wrong Back") plus the card.' },
            { title: 'Beware Fakes', tip: 'Some "errors" are actually altered cards. Removed foil, erased text, or trimmed borders are not errors — they\'re damaged or counterfeit. Grading catches these.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <h3 className="font-semibold text-white text-sm mb-1">{item.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/auth-check', label: 'Authentication Checker' },
            { href: '/tools/centering-calc', label: 'Centering Calculator' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
            { href: '/tools/cert-check', label: 'PSA Cert Verifier' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/submission-planner', label: 'Submission Planner' },
            { href: '/tools/pop-report', label: 'Population Report' },
            { href: '/tools/photo-grade-estimator', label: 'Photo Grade Estimator' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
