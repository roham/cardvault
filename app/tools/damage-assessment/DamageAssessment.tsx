'use client';

import { useState, useMemo } from 'react';

/* ---------- Defect Types ---------- */
interface Defect {
  id: string;
  name: string;
  description: string;
  severityOptions: { label: string; gradeImpact: number; valuePct: number }[];
  icon: string;
}

const DEFECTS: Defect[] = [
  {
    id: 'crease',
    name: 'Creases / Wrinkles',
    description: 'Visible fold lines or wrinkles in the cardboard. The most damaging defect.',
    icon: '\uD83D\uDCC4',
    severityOptions: [
      { label: 'None', gradeImpact: 0, valuePct: 0 },
      { label: 'Light crease (barely visible)', gradeImpact: -3, valuePct: -40 },
      { label: 'Moderate crease (visible at arm\'s length)', gradeImpact: -5, valuePct: -60 },
      { label: 'Heavy crease (prominent fold)', gradeImpact: -7, valuePct: -75 },
      { label: 'Multiple heavy creases', gradeImpact: -8, valuePct: -85 },
    ],
  },
  {
    id: 'corners',
    name: 'Corner Wear',
    description: 'Rounding, dings, or fraying on any of the four corners.',
    icon: '\uD83D\uDD32',
    severityOptions: [
      { label: 'None (sharp corners)', gradeImpact: 0, valuePct: 0 },
      { label: 'Slight touch on 1 corner', gradeImpact: -1, valuePct: -10 },
      { label: 'Minor wear on 2-3 corners', gradeImpact: -2, valuePct: -25 },
      { label: 'Moderate rounding on all corners', gradeImpact: -4, valuePct: -45 },
      { label: 'Heavy rounding / fraying', gradeImpact: -6, valuePct: -65 },
    ],
  },
  {
    id: 'surface',
    name: 'Surface Scratches',
    description: 'Visible scratches, scuffs, or marks on the front or back surface.',
    icon: '\uD83D\uDD0D',
    severityOptions: [
      { label: 'None (clean surface)', gradeImpact: 0, valuePct: 0 },
      { label: 'Hairline scratch (visible at angle)', gradeImpact: -1, valuePct: -10 },
      { label: 'Light scratches (visible in hand)', gradeImpact: -2, valuePct: -20 },
      { label: 'Moderate scuffing', gradeImpact: -3, valuePct: -35 },
      { label: 'Heavy surface damage', gradeImpact: -5, valuePct: -55 },
    ],
  },
  {
    id: 'edges',
    name: 'Edge Wear',
    description: 'Chipping, rough edges, or whitening along the card borders.',
    icon: '\u2B1C',
    severityOptions: [
      { label: 'None (clean edges)', gradeImpact: 0, valuePct: 0 },
      { label: 'Minor edge wear (1 edge)', gradeImpact: -1, valuePct: -10 },
      { label: 'Moderate wear (2-3 edges)', gradeImpact: -2, valuePct: -20 },
      { label: 'Chipping visible on all edges', gradeImpact: -4, valuePct: -40 },
      { label: 'Heavy edge damage / peeling', gradeImpact: -6, valuePct: -60 },
    ],
  },
  {
    id: 'staining',
    name: 'Staining / Discoloration',
    description: 'Yellow toning, wax stains, water damage, or other discoloration.',
    icon: '\uD83D\uDFE1',
    severityOptions: [
      { label: 'None', gradeImpact: 0, valuePct: 0 },
      { label: 'Light yellowing / toning', gradeImpact: -1, valuePct: -15 },
      { label: 'Wax staining on back', gradeImpact: -2, valuePct: -20 },
      { label: 'Visible stain on front', gradeImpact: -4, valuePct: -45 },
      { label: 'Water damage / heavy staining', gradeImpact: -6, valuePct: -65 },
    ],
  },
  {
    id: 'centering',
    name: 'Off-Center / Miscut',
    description: 'Borders are uneven. Not technically damage but affects grade significantly.',
    icon: '\uD83D\uDCCF',
    severityOptions: [
      { label: 'Well-centered (55/45 or better)', gradeImpact: 0, valuePct: 0 },
      { label: 'Slightly off (60/40)', gradeImpact: -1, valuePct: -10 },
      { label: 'Noticeably off (70/30)', gradeImpact: -2, valuePct: -20 },
      { label: 'Significantly off (80/20)', gradeImpact: -3, valuePct: -30 },
      { label: 'Miscut (diamond cut / severe)', gradeImpact: -5, valuePct: -50 },
    ],
  },
  {
    id: 'print',
    name: 'Print Defects',
    description: 'Factory ink spots, color bleeding, roller marks, or print lines.',
    icon: '\uD83D\uDDA8\uFE0F',
    severityOptions: [
      { label: 'None', gradeImpact: 0, valuePct: 0 },
      { label: 'Minor print line (back only)', gradeImpact: -1, valuePct: -5 },
      { label: 'Visible print defect on front', gradeImpact: -2, valuePct: -15 },
      { label: 'Ink spot or color shift', gradeImpact: -3, valuePct: -25 },
      { label: 'Major print error', gradeImpact: -4, valuePct: -35 },
    ],
  },
  {
    id: 'other',
    name: 'Other Damage',
    description: 'Tape residue, writing, holes, trimming, or other unusual defects.',
    icon: '\u26A0\uFE0F',
    severityOptions: [
      { label: 'None', gradeImpact: 0, valuePct: 0 },
      { label: 'Minor tape residue on back', gradeImpact: -3, valuePct: -30 },
      { label: 'Writing or marker on card', gradeImpact: -5, valuePct: -50 },
      { label: 'Pinhole or thumbtack hole', gradeImpact: -6, valuePct: -60 },
      { label: 'Trimmed or altered', gradeImpact: -9, valuePct: -90 },
    ],
  },
];

function getGradeFromScore(score: number): { grade: string; label: string; color: string } {
  if (score >= 10) return { grade: 'PSA 10', label: 'Gem Mint', color: 'text-emerald-400' };
  if (score >= 9) return { grade: 'PSA 9', label: 'Mint', color: 'text-emerald-400' };
  if (score >= 8) return { grade: 'PSA 8', label: 'NM-MT', color: 'text-sky-400' };
  if (score >= 7) return { grade: 'PSA 7', label: 'NM', color: 'text-sky-400' };
  if (score >= 6) return { grade: 'PSA 6', label: 'EX-MT', color: 'text-amber-400' };
  if (score >= 5) return { grade: 'PSA 5', label: 'EX', color: 'text-amber-400' };
  if (score >= 4) return { grade: 'PSA 4', label: 'VG-EX', color: 'text-orange-400' };
  if (score >= 3) return { grade: 'PSA 3', label: 'VG', color: 'text-orange-400' };
  if (score >= 2) return { grade: 'PSA 2', label: 'Good', color: 'text-red-400' };
  if (score >= 1) return { grade: 'PSA 1', label: 'Poor', color: 'text-red-400' };
  return { grade: 'AUTH', label: 'Authentic', color: 'text-red-400' };
}

export default function DamageAssessment() {
  const [selections, setSelections] = useState<Record<string, number>>(
    Object.fromEntries(DEFECTS.map(d => [d.id, 0]))
  );
  const [cardValue, setCardValue] = useState<string>('100');

  function setSeverity(defectId: string, idx: number) {
    setSelections(prev => ({ ...prev, [defectId]: idx }));
  }

  const result = useMemo(() => {
    const baseGrade = 10;
    let totalGradeImpact = 0;
    let totalValuePct = 0;
    const activeDefects: { name: string; severity: string; gradeImpact: number; valuePct: number }[] = [];

    for (const defect of DEFECTS) {
      const idx = selections[defect.id] || 0;
      const option = defect.severityOptions[idx];
      if (option.gradeImpact !== 0) {
        totalGradeImpact += option.gradeImpact;
        totalValuePct += option.valuePct;
        activeDefects.push({
          name: defect.name,
          severity: option.label,
          gradeImpact: option.gradeImpact,
          valuePct: option.valuePct,
        });
      }
    }

    // Grade cannot drop below 1 (Authentic at 0)
    const estimatedGradeNum = Math.max(0, baseGrade + totalGradeImpact);
    const gradeInfo = getGradeFromScore(estimatedGradeNum);

    // Value reduction (cap at -95%)
    const valueReduction = Math.max(-95, totalValuePct);
    const originalValue = parseFloat(cardValue) || 100;
    const adjustedValue = Math.max(originalValue * 0.05, originalValue * (1 + valueReduction / 100));

    return {
      estimatedGradeNum,
      gradeInfo,
      valueReduction,
      originalValue,
      adjustedValue,
      activeDefects,
      defectCount: activeDefects.length,
    };
  }, [selections, cardValue]);

  return (
    <div className="space-y-8">
      {/* Card Value Input */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-3">Card Value (Mint Condition)</h2>
        <div className="flex items-center gap-3">
          <span className="text-gray-400">$</span>
          <input
            type="number"
            value={cardValue}
            onChange={e => setCardValue(e.target.value)}
            placeholder="100"
            className="w-40 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
          />
          <span className="text-gray-500 text-sm">Enter the mint/gem mint value to calculate damage impact</span>
        </div>
      </div>

      {/* Defect Assessment */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Rate Each Defect</h2>
        <div className="space-y-5">
          {DEFECTS.map(defect => (
            <div key={defect.id}>
              <div className="flex items-center gap-2 mb-2">
                <span>{defect.icon}</span>
                <span className="text-white font-medium text-sm">{defect.name}</span>
              </div>
              <p className="text-gray-500 text-xs mb-2">{defect.description}</p>
              <div className="flex flex-wrap gap-2">
                {defect.severityOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSeverity(defect.id, i)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selections[defect.id] === i
                        ? i === 0
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Grade Estimate */}
        <div className={`border rounded-xl p-6 ${result.defectCount === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Estimated Grade</div>
              <div className={`text-3xl font-black ${result.gradeInfo.color}`}>
                {result.gradeInfo.grade}
              </div>
              <div className={`text-sm ${result.gradeInfo.color}`}>{result.gradeInfo.label}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Estimated Value</div>
              <div className="text-3xl font-black text-white">
                ${result.adjustedValue.toFixed(0)}
              </div>
              <div className={`text-sm ${result.valueReduction < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {result.valueReduction < 0 ? '' : '+'}{result.valueReduction}% from mint
              </div>
            </div>
          </div>

          {/* Grade bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>AUTH</span>
              <span>PSA 5</span>
              <span>PSA 10</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  result.estimatedGradeNum >= 8 ? 'bg-emerald-500' :
                  result.estimatedGradeNum >= 6 ? 'bg-sky-500' :
                  result.estimatedGradeNum >= 4 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.max(5, (result.estimatedGradeNum / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Defects Summary */}
        {result.defectCount > 0 && (
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">
              {result.defectCount} Defect{result.defectCount > 1 ? 's' : ''} Found
            </h3>
            <div className="space-y-2">
              {result.activeDefects.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">{d.name}</div>
                    <div className="text-gray-500 text-xs">{d.severity}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 text-sm font-medium">{d.gradeImpact} grade</div>
                    <div className="text-red-400/70 text-xs">{d.valuePct}% value</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Value Comparison */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Value Comparison</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Mint Value</div>
              <div className="text-xl font-bold text-white">${result.originalValue.toFixed(0)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Damaged Value</div>
              <div className="text-xl font-bold text-red-400">${result.adjustedValue.toFixed(0)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Value Lost</div>
              <div className="text-xl font-bold text-red-400">
                -${(result.originalValue - result.adjustedValue).toFixed(0)}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Max Bid</div>
              <div className="text-xl font-bold text-amber-400">
                ${(result.adjustedValue * 0.8).toFixed(0)}
              </div>
              <div className="text-gray-500 text-[10px]">80% of damaged value</div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-3">Damage Assessment Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2"><span className="text-red-400">1.</span> Creases are the worst defect. A single crease drops even a rare card to PSA 1-5 territory.</li>
            <li className="flex gap-2"><span className="text-red-400">2.</span> Corner wear is the most common defect. PSA grades corners heavily, so one bad corner can drop you 2-3 grades.</li>
            <li className="flex gap-2"><span className="text-red-400">3.</span> Surface scratches are harder to spot but graders use magnification. Check under bright light at an angle.</li>
            <li className="flex gap-2"><span className="text-red-400">4.</span> Centering issues are a factory defect, not collector damage. They still affect grade but don&apos;t indicate mishandling.</li>
            <li className="flex gap-2"><span className="text-red-400">5.</span> When buying damaged cards, always ask for photos of the specific damage and compare to recent sold comps at that grade.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
