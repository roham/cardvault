'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────
interface CenteringResult {
  lrRatio: string;
  tbRatio: string;
  psaGrade: string;
  bgsSubgrade: string;
  cgcGrade: string;
  verdict: string;
  verdictColor: string;
  gradeImpact: string;
  valueTip: string;
}

// ── Centering Calculator ──────────────────────────────────────────────────
function calculateCentering(leftPct: number, topPct: number): CenteringResult {
  const rightPct = 100 - leftPct;
  const bottomPct = 100 - topPct;

  const lrSmall = Math.min(leftPct, rightPct);
  const lrBig = Math.max(leftPct, rightPct);
  const tbSmall = Math.min(topPct, bottomPct);
  const tbBig = Math.max(topPct, bottomPct);

  const lrRatio = `${lrSmall.toFixed(0)}/${lrBig.toFixed(0)}`;
  const tbRatio = `${tbSmall.toFixed(0)}/${tbBig.toFixed(0)}`;

  const lrDiff = Math.abs(leftPct - 50);
  const tbDiff = Math.abs(topPct - 50);
  const worstDiff = Math.max(lrDiff, tbDiff);

  // PSA centering grades (approximate thresholds)
  let psaGrade: string;
  let bgsSubgrade: string;
  let cgcGrade: string;
  let verdict: string;
  let verdictColor: string;
  let gradeImpact: string;
  let valueTip: string;

  if (worstDiff <= 2) {
    psaGrade = 'PSA 10 eligible';
    bgsSubgrade = '10 (Pristine)';
    cgcGrade = '10 (Pristine)';
    verdict = 'Perfect Centering';
    verdictColor = 'text-emerald-400';
    gradeImpact = 'Centering will NOT limit your grade. This is gem mint territory.';
    valueTip = 'Perfect centering is the #1 factor that separates PSA 9s from PSA 10s. This card has maximum grading potential.';
  } else if (worstDiff <= 5) {
    psaGrade = 'PSA 10 eligible';
    bgsSubgrade = '9.5 (Gem Mint)';
    cgcGrade = '9.5-10';
    verdict = 'Excellent Centering';
    verdictColor = 'text-emerald-400';
    gradeImpact = 'Centering is within PSA 10 tolerance (60/40 or better). Other factors will determine the final grade.';
    valueTip = 'You are in the safe zone. Focus on corners and surface quality — centering is not your limiting factor.';
  } else if (worstDiff <= 10) {
    psaGrade = 'PSA 10 borderline';
    bgsSubgrade = '9 (Mint)';
    cgcGrade = '9';
    verdict = 'Good Centering';
    verdictColor = 'text-amber-400';
    gradeImpact = 'Centering is borderline for PSA 10. Some graders may pass it, others may dock to PSA 9 depending on the direction.';
    valueTip = 'Consider submitting to BGS where centering is a separate subgrade and won\'t tank the overall. A 9.5 with 9 centering is still a strong card.';
  } else if (worstDiff <= 15) {
    psaGrade = 'PSA 9 max';
    bgsSubgrade = '8.5';
    cgcGrade = '8.5-9';
    verdict = 'Below Average Centering';
    verdictColor = 'text-orange-400';
    gradeImpact = 'Centering will cap your PSA grade at 9. Even perfect corners and surface cannot overcome this.';
    valueTip = 'For high-value cards, a PSA 9 with centering issues still holds strong value. For lower-value cards, grading may not be worth the fee.';
  } else if (worstDiff <= 20) {
    psaGrade = 'PSA 8 max';
    bgsSubgrade = '8';
    cgcGrade = '8';
    verdict = 'Poor Centering';
    verdictColor = 'text-red-400';
    gradeImpact = 'Centering limits the card to PSA 8 at best. Visible off-center shift will be noted.';
    valueTip = 'Only grade if the card is valuable enough raw that even a PSA 8 adds value. Vintage cards with 70/30 centering are more accepted by the market.';
  } else {
    psaGrade = 'PSA 7 or lower';
    bgsSubgrade = '7 or lower';
    cgcGrade = '7 or lower';
    verdict = 'Severely Off-Center';
    verdictColor = 'text-red-500';
    gradeImpact = 'Major centering issue. The card is visibly off-center and will grade PSA 7 or lower regardless of other factors.';
    valueTip = 'Do not grade unless this is an extremely valuable vintage card where even a low-grade slab adds value (think 1952 Mantle or 1986 Jordan).';
  }

  return { lrRatio, tbRatio, psaGrade, bgsSubgrade, cgcGrade, verdict, verdictColor, gradeImpact, valueTip };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function CenteringCheckClient() {
  const [leftPct, setLeftPct] = useState(50);
  const [topPct, setTopPct] = useState(50);

  const result = useMemo(() => calculateCentering(leftPct, topPct), [leftPct, topPct]);

  // Grading company centering standards reference
  const standards = [
    { company: 'PSA', gem: '60/40 or better', mint: '65/35 or better', threshold: 'Centering alone can prevent PSA 10', color: 'text-red-400' },
    { company: 'BGS', gem: '50/50 to 55/45', mint: '55/45 to 60/40', threshold: 'Centering is a separate subgrade (1-10)', color: 'text-amber-400' },
    { company: 'CGC', gem: '55/45 or better', mint: '60/40 or better', threshold: 'Similar to PSA but slightly more lenient', color: 'text-emerald-400' },
    { company: 'SGC', gem: '60/40 or better', mint: '65/35 or better', threshold: 'Most lenient on centering of the big 4', color: 'text-sky-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Measure Your Card&apos;s Centering</h2>
        <p className="text-xs text-zinc-500 mb-6">
          Hold your card and estimate the border width on each side. Enter the left border as a percentage of total left+right,
          and the top border as a percentage of total top+bottom. 50% = perfectly centered.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Left/Right */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Left/Right: <span className="text-amber-400">{leftPct}% / {100 - leftPct}%</span>
            </label>
            <input
              type="range"
              min={30}
              max={70}
              value={leftPct}
              onChange={e => setLeftPct(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
              <span>70/30 (heavy left)</span>
              <span>50/50 (perfect)</span>
              <span>30/70 (heavy right)</span>
            </div>
          </div>

          {/* Top/Bottom */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Top/Bottom: <span className="text-amber-400">{topPct}% / {100 - topPct}%</span>
            </label>
            <input
              type="range"
              min={30}
              max={70}
              value={topPct}
              onChange={e => setTopPct(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
              <span>70/30 (heavy top)</span>
              <span>50/50 (perfect)</span>
              <span>30/70 (heavy bottom)</span>
            </div>
          </div>
        </div>

        {/* Visual Card Preview */}
        <div className="mt-6 flex justify-center">
          <div className="relative w-48 h-64 bg-zinc-800 border-2 border-zinc-600 rounded-lg overflow-hidden">
            <div
              className="absolute bg-zinc-700 border border-zinc-500 rounded"
              style={{
                left: `${leftPct * 0.6}%`,
                right: `${(100 - leftPct) * 0.6}%`,
                top: `${topPct * 0.6}%`,
                bottom: `${(100 - topPct) * 0.6}%`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400">
                Card Image
              </div>
            </div>
            {/* Border labels */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-zinc-500">{topPct}%</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-zinc-500">{100 - topPct}%</div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500">{leftPct}%</div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500">{100 - leftPct}%</div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${result.verdictColor}`}>{result.verdict}</div>
          <div className="text-xs text-zinc-500">Centering Grade</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{result.lrRatio}</div>
          <div className="text-xs text-zinc-500">L/R Ratio</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{result.tbRatio}</div>
          <div className="text-xs text-zinc-500">T/B Ratio</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-amber-400">{result.psaGrade}</div>
          <div className="text-xs text-zinc-500">PSA Potential</div>
        </div>
      </div>

      {/* Multi-Company Comparison */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Centering Across Grading Companies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-xs text-red-400 font-medium mb-1">PSA</div>
            <div className="text-lg font-bold text-white">{result.psaGrade}</div>
            <div className="text-xs text-zinc-500 mt-1">Most strict on centering for PSA 10</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-xs text-amber-400 font-medium mb-1">BGS Centering Sub</div>
            <div className="text-lg font-bold text-white">{result.bgsSubgrade}</div>
            <div className="text-xs text-zinc-500 mt-1">Separate subgrade — won&apos;t tank overall</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="text-xs text-emerald-400 font-medium mb-1">CGC</div>
            <div className="text-lg font-bold text-white">{result.cgcGrade}</div>
            <div className="text-xs text-zinc-500 mt-1">Slightly more lenient than PSA</div>
          </div>
        </div>
      </div>

      {/* Impact Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-400 mb-2">Grade Impact</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{result.gradeImpact}</p>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-emerald-400 mb-2">Value Tip</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{result.valueTip}</p>
        </div>
      </div>

      {/* Centering Standards Reference */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Centering Standards by Company</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-2 text-zinc-400 font-medium">Company</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Gem (10)</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Mint (9)</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {standards.map(s => (
                <tr key={s.company} className="border-b border-zinc-800">
                  <td className={`py-2.5 font-medium ${s.color}`}>{s.company}</td>
                  <td className="py-2.5 text-zinc-300">{s.gem}</td>
                  <td className="py-2.5 text-zinc-300">{s.mint}</td>
                  <td className="py-2.5 text-zinc-500 text-xs">{s.threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-amber-950/30 to-zinc-900/50 border border-amber-800/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-amber-300 mb-3">Centering Tips</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">1.</span> Use a centering tool (ruler or card centering app) for precise measurement before grading</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">2.</span> Left/right centering is weighted more heavily than top/bottom by most graders</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">3.</span> Vintage cards (pre-1980) have looser centering standards — 65/35 can still gem</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">4.</span> If centering is your only flaw, consider BGS where it is a separate subgrade</li>
          <li className="flex gap-2"><span className="text-amber-400 flex-shrink-0">5.</span> Some collectors prefer slight off-center cards — it proves the card is not trimmed</li>
        </ul>
      </div>

      {/* Internal Links */}
      <div className="border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/tools/grade-spread" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Grade Price Spread</h3>
            <p className="text-xs text-zinc-500">Value at every PSA grade 1-10</p>
          </Link>
          <Link href="/tools/grading-roi" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Grading ROI</h3>
            <p className="text-xs text-zinc-500">Should you grade this card?</p>
          </Link>
          <Link href="/tools/pop-report" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Pop Report Lookup</h3>
            <p className="text-xs text-zinc-500">PSA population data and gem rates</p>
          </Link>
          <Link href="/tools/photo-grader" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Photo Grade Estimator</h3>
            <p className="text-xs text-zinc-500">Quick condition assessment</p>
          </Link>
          <Link href="/grading" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Grading Company Hub</h3>
            <p className="text-xs text-zinc-500">PSA vs BGS vs CGC vs SGC</p>
          </Link>
          <Link href="/tools" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">All Tools</h3>
            <p className="text-xs text-zinc-500">82+ free collector tools</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
