'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Grade prediction logic ───── */
interface SubGrade {
  label: string;
  value: number;
  description: string;
}

const SUB_GRADES: { key: string; label: string; descriptions: string[] }[] = [
  {
    key: 'corners',
    label: 'Corners',
    descriptions: [
      'Major wear, rounding, or paper loss visible',
      'Noticeable wear or slight rounding on 2+ corners',
      'Minor wear on 1-2 corners, not immediately visible',
      'Very slight imperfection on one corner under magnification',
      'Perfect, sharp corners with no visible wear',
    ],
  },
  {
    key: 'edges',
    label: 'Edges',
    descriptions: [
      'Chipping, rough edges, or significant wear',
      'Multiple small nicks or consistent light wear',
      'Minor nicks on 1-2 edges, barely visible',
      'Extremely minor imperfection under magnification',
      'Flawless, smooth edges all around',
    ],
  },
  {
    key: 'surface',
    label: 'Surface',
    descriptions: [
      'Scratches, print spots, or staining visible',
      'Light scratches or minor print quality issues',
      'Very faint surface marks, need to look carefully',
      'Near-perfect surface with minuscule imperfection',
      'Pristine, no marks, scratches, or print defects',
    ],
  },
  {
    key: 'centering',
    label: 'Centering',
    descriptions: [
      'Badly off-center (70/30 or worse)',
      'Noticeably off-center (65/35)',
      'Slightly off-center (60/40)',
      'Very good centering (55/45 or better)',
      'Perfect centering (50/50 front and back)',
    ],
  },
];

function predictGrade(scores: Record<string, number>): {
  psa: number;
  bgs: number;
  confidence: number;
  label: string;
  color: string;
  bgColor: string;
} {
  const avg = (scores.corners + scores.edges + scores.surface + scores.centering) / 4;
  const min = Math.min(scores.corners, scores.edges, scores.surface, scores.centering);

  // PSA grade (whole numbers, centering matters less)
  let psa: number;
  if (avg >= 4.75 && min >= 4) psa = 10;
  else if (avg >= 4.25 && min >= 3) psa = 9;
  else if (avg >= 3.5 && min >= 2) psa = 8;
  else if (avg >= 2.75 && min >= 2) psa = 7;
  else if (avg >= 2.0 && min >= 1) psa = 6;
  else if (avg >= 1.5) psa = 5;
  else psa = 4;

  // BGS grade (half grades, more granular)
  let bgs: number;
  if (avg >= 4.85 && min >= 4.5) bgs = 10;
  else if (avg >= 4.6 && min >= 4) bgs = 9.5;
  else if (avg >= 4.25 && min >= 3) bgs = 9;
  else if (avg >= 3.75 && min >= 2.5) bgs = 8.5;
  else if (avg >= 3.25 && min >= 2) bgs = 8;
  else if (avg >= 2.75 && min >= 2) bgs = 7.5;
  else if (avg >= 2.25 && min >= 1.5) bgs = 7;
  else bgs = 6.5;

  // Confidence based on how consistent the sub-scores are
  const spread = Math.max(scores.corners, scores.edges, scores.surface, scores.centering) - min;
  const confidence = Math.max(40, Math.min(95, Math.round(100 - spread * 15)));

  let label: string;
  let color: string;
  let bgColor: string;
  if (psa >= 10) { label = 'GEM MINT'; color = 'text-emerald-400'; bgColor = 'bg-emerald-500'; }
  else if (psa >= 9) { label = 'MINT'; color = 'text-blue-400'; bgColor = 'bg-blue-500'; }
  else if (psa >= 8) { label = 'NM-MT'; color = 'text-cyan-400'; bgColor = 'bg-cyan-500'; }
  else if (psa >= 7) { label = 'NM'; color = 'text-yellow-400'; bgColor = 'bg-yellow-500'; }
  else if (psa >= 6) { label = 'EX-MT'; color = 'text-orange-400'; bgColor = 'bg-orange-500'; }
  else { label = 'EX or Below'; color = 'text-red-400'; bgColor = 'bg-red-500'; }

  return { psa, bgs, confidence, label, color, bgColor };
}

export default function GradePredictorClient() {
  const [scores, setScores] = useState<Record<string, number>>({
    corners: 3,
    edges: 3,
    surface: 3,
    centering: 3,
  });

  const setScore = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => predictGrade(scores), [scores]);

  return (
    <div className="space-y-8">
      {/* Grade Display */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center">
        <div className="mb-4">
          <div className={`text-6xl font-bold ${result.color} mb-2`}>PSA {result.psa}</div>
          <div className="text-xl text-gray-300 font-medium">{result.label}</div>
        </div>
        <div className="flex items-center justify-center gap-8 text-sm">
          <div>
            <span className="text-gray-500">BGS Equivalent:</span>{' '}
            <span className="text-white font-bold">{result.bgs}</span>
          </div>
          <div>
            <span className="text-gray-500">Confidence:</span>{' '}
            <span className={`font-bold ${result.confidence >= 70 ? 'text-emerald-400' : result.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.confidence}%
            </span>
          </div>
        </div>
        {/* Gauge bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>PSA 4</span>
            <span>PSA 7</span>
            <span>PSA 10</span>
          </div>
          <div className="h-3 bg-gray-900 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${result.bgColor}`}
              style={{ width: `${Math.max(10, ((result.psa - 4) / 6) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {SUB_GRADES.map(sg => (
          <div key={sg.key} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">{sg.label}</h3>
              <span className={`text-lg font-bold ${scores[sg.key] >= 4 ? 'text-emerald-400' : scores[sg.key] >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {scores[sg.key]}/5
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={scores[sg.key]}
              onChange={e => setScore(sg.key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between mt-1">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setScore(sg.key, v)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${scores[sg.key] === v ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{sg.descriptions[scores[sg.key] - 1]}</p>
          </div>
        ))}
      </div>

      {/* Grade Breakdown */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">What This Means</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">PSA Grade</span>
              <span className={`font-bold ${result.color}`}>PSA {result.psa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">BGS Grade</span>
              <span className="text-white font-bold">BGS {result.bgs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CGC Equivalent</span>
              <span className="text-white font-bold">CGC {result.bgs}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Weakest Area</span>
              <span className="text-white font-bold">
                {SUB_GRADES.find(sg => scores[sg.key] === Math.min(...Object.values(scores)))?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Strongest Area</span>
              <span className="text-white font-bold">
                {SUB_GRADES.find(sg => scores[sg.key] === Math.max(...Object.values(scores)))?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Worth Grading?</span>
              <span className={`font-bold ${result.psa >= 8 ? 'text-emerald-400' : result.psa >= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                {result.psa >= 9 ? 'Yes — likely profitable' : result.psa >= 8 ? 'Maybe — depends on card value' : 'Probably not — raw value may be higher'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Presets</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Gem Mint', scores: { corners: 5, edges: 5, surface: 5, centering: 5 } },
            { label: 'Mint', scores: { corners: 4, edges: 5, surface: 5, centering: 4 } },
            { label: 'Near Mint', scores: { corners: 3, edges: 4, surface: 4, centering: 3 } },
            { label: 'Pack Fresh', scores: { corners: 5, edges: 5, surface: 4, centering: 3 } },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => setScores(p.scores)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Grading Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Use a Loupe', tip: 'A 10x jeweler loupe reveals imperfections invisible to the naked eye. Check all four corners and edges under magnification before submitting.' },
            { title: 'Check Both Sides', tip: 'The back of the card matters. Surface scratches and centering are graded on both front and back. Many grades are lost on the reverse.' },
            { title: 'Centering Is the Wildcard', tip: 'PSA is more lenient on centering than BGS. A 55/45 card can still get PSA 10 but will cap at BGS 9.5. Know the standards for your target grade.' },
            { title: 'Surface Issues Are Hardest to Spot', tip: 'Print dots, roller lines, and wax stains are common surface issues that are hard to see. Hold the card at an angle under bright light to check.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <h3 className="font-medium text-white text-sm mb-1">{t.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="pt-6 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Detailed step-by-step condition assessment' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it for your card?' },
            { href: '/tools/centering-calc', label: 'Centering Calculator', desc: 'Measure border centering precisely' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
              <span className="text-white font-medium text-sm">{t.label}</span>
              <span className="block text-gray-500 text-xs mt-1">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
