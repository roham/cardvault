'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ───── Constants ───── */
const SUBGRADE_STEPS = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];

const GRADE_LABELS: Record<string, string> = {
  '10': 'Pristine',
  '9.5': 'Gem Mint',
  '9': 'Mint',
  '8.5': 'NM-MT+',
  '8': 'NM-MT',
  '7.5': 'NM+',
  '7': 'NM',
  '6.5': 'EX-MT+',
  '6': 'EX-MT',
};

const VALUE_MULTIPLIERS: { grade: string; label: string; multiplier: string }[] = [
  { grade: '10', label: 'Pristine', multiplier: '10-20x raw value' },
  { grade: '9.5', label: 'Gem Mint', multiplier: '3-5x raw value' },
  { grade: '9', label: 'Mint', multiplier: '1.5-2.5x raw value' },
  { grade: '8.5', label: 'NM-MT+', multiplier: '1.2-1.5x raw value' },
  { grade: '8', label: 'NM-MT', multiplier: '1-1.2x raw value' },
  { grade: '7 and below', label: 'NM or lower', multiplier: '0.5-1x raw value' },
];

const PSA_EQUIVALENT: Record<string, string> = {
  '10': 'PSA 10 (Gem Mint)',
  '9.5': 'PSA 10 (Gem Mint)',
  '9': 'PSA 9 (Mint)',
  '8.5': 'PSA 8-9',
  '8': 'PSA 8 (NM-MT)',
  '7.5': 'PSA 7-8',
  '7': 'PSA 7 (NM)',
  '6.5': 'PSA 6-7',
  '6': 'PSA 6 (EX-MT)',
};

const PRESETS: { label: string; values: [number, number, number, number] }[] = [
  { label: 'Perfect 10s', values: [10, 10, 10, 10] },
  { label: 'All 9.5s', values: [9.5, 9.5, 9.5, 9.5] },
  { label: 'All 9s', values: [9, 9, 9, 9] },
  { label: 'Mixed (9.5/9/9/9.5)', values: [9.5, 9, 9, 9.5] },
  { label: 'Problem Card (8/9/8.5/9)', values: [8, 9, 8.5, 9] },
];

const TIPS = [
  {
    title: 'Centering is the most common limiter',
    text: 'Centering is the easiest subgrade to check before submitting. Use a centering tool to measure 60/40 or better front and back. Cards with visible off-center cuts are almost guaranteed to lose at least 0.5 here.',
  },
  {
    title: 'Surface scratches are hard to spot',
    text: 'Use a bright LED light at an angle to reveal micro-scratches on the surface. Foil and chrome cards are especially prone to surface issues. Even factory-fresh cards can have print lines that BGS counts against surface.',
  },
  {
    title: 'Corners and edges compound each other',
    text: 'A dinged corner usually means the edge took damage too. Check all four corners under magnification. BGS graders use 10x loupes and are extremely strict on modern cards.',
  },
  {
    title: 'BGS 9.5 is the sweet spot for value',
    text: 'The jump from BGS 9 to BGS 9.5 is often a 2-3x value increase, while BGS 9.5 to BGS 10 can be 3-5x more. For most cards, a BGS 9.5 offers the best return on investment for grading costs.',
  },
];

/* ───── Helpers ───── */
function gradeColor(value: number): string {
  if (value >= 10) return 'text-amber-400';
  if (value >= 9.5) return 'text-blue-400';
  if (value >= 9) return 'text-emerald-400';
  if (value >= 8.5) return 'text-yellow-400';
  if (value >= 8) return 'text-orange-400';
  return 'text-red-400';
}

function gradeBg(value: number): string {
  if (value >= 10) return 'bg-amber-500/20 border-amber-500/40';
  if (value >= 9.5) return 'bg-blue-500/20 border-blue-500/40';
  if (value >= 9) return 'bg-emerald-500/20 border-emerald-500/40';
  if (value >= 8.5) return 'bg-yellow-500/20 border-yellow-500/40';
  if (value >= 8) return 'bg-orange-500/20 border-orange-500/40';
  return 'bg-red-500/20 border-red-500/40';
}

function gradeBgSolid(value: number): string {
  if (value >= 10) return 'bg-amber-500';
  if (value >= 9.5) return 'bg-blue-500';
  if (value >= 9) return 'bg-emerald-500';
  if (value >= 8.5) return 'bg-yellow-500';
  if (value >= 8) return 'bg-orange-500';
  return 'bg-red-500';
}

function calculateOverallGrade(centering: number, corners: number, edges: number, surface: number): { grade: number; label: string; average: number } {
  const avg = (centering + corners + edges + surface) / 4;
  const subs = [centering, corners, edges, surface];

  let rawGrade: number;
  if (avg >= 9.875) rawGrade = 10;
  else if (avg >= 9.375) rawGrade = 9.5;
  else if (avg >= 8.875) rawGrade = 9;
  else if (avg >= 8.375) rawGrade = 8.5;
  else if (avg >= 7.875) rawGrade = 8;
  else if (avg >= 7.375) rawGrade = 7.5;
  else if (avg >= 6.875) rawGrade = 7;
  else rawGrade = 6.5;

  // Cap rule: no subgrade can be more than 1.0 below the overall grade
  let cappedGrade = rawGrade;
  for (const sub of subs) {
    const maxOverall = sub + 1.0;
    // Round maxOverall down to nearest 0.5
    const maxOverallRounded = Math.floor(maxOverall * 2) / 2;
    if (maxOverallRounded < cappedGrade) {
      cappedGrade = maxOverallRounded;
    }
  }

  const label = GRADE_LABELS[String(cappedGrade)] || `${cappedGrade}`;
  return { grade: cappedGrade, label, average: avg };
}

/* ───── Subgrade Slider ───── */
function SubgradeSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const idx = SUBGRADE_STEPS.indexOf(value);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className={`text-lg font-bold ${gradeColor(value)}`}>{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={SUBGRADE_STEPS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(SUBGRADE_STEPS[Number(e.target.value)])}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500 bg-gray-700"
      />
      <div className="flex justify-between mt-1.5">
        {SUBGRADE_STEPS.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`text-xs px-1 py-0.5 rounded transition-colors ${
              s === value ? `font-bold ${gradeColor(s)}` : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {s % 1 === 0 ? s.toFixed(0) : s.toFixed(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───── Main Component ───── */
export default function BGSSubgradeCalc() {
  const [centering, setCentering] = useState(9.0);
  const [corners, setCorners] = useState(9.0);
  const [edges, setEdges] = useState(9.0);
  const [surface, setSurface] = useState(9.0);

  const result = useMemo(
    () => calculateOverallGrade(centering, corners, edges, surface),
    [centering, corners, edges, surface],
  );

  const subgrades = useMemo(() => [
    { label: 'Centering', value: centering },
    { label: 'Corners', value: corners },
    { label: 'Edges', value: edges },
    { label: 'Surface', value: surface },
  ], [centering, corners, edges, surface]);

  const weakestLink = useMemo(() => {
    let lowest = subgrades[0];
    for (const s of subgrades) {
      if (s.value < lowest.value) lowest = s;
    }
    return lowest;
  }, [subgrades]);

  const whatIfScenarios = useMemo(() => {
    const setters: Record<string, (v: number) => [number, number, number, number]> = {
      Centering: (v) => [v, corners, edges, surface],
      Corners: (v) => [centering, v, edges, surface],
      Edges: (v) => [centering, corners, v, surface],
      Surface: (v) => [centering, corners, edges, v],
    };

    const scenarios: { label: string; direction: 'up' | 'down'; from: number; to: number; newGrade: number; newLabel: string; changed: boolean }[] = [];

    for (const sub of subgrades) {
      const setter = setters[sub.label];
      // Up by 0.5
      if (sub.value < 10) {
        const newVal = sub.value + 0.5;
        const [c, co, e, s] = setter(newVal);
        const newResult = calculateOverallGrade(c, co, e, s);
        scenarios.push({
          label: sub.label,
          direction: 'up',
          from: sub.value,
          to: newVal,
          newGrade: newResult.grade,
          newLabel: newResult.label,
          changed: newResult.grade !== result.grade,
        });
      }
      // Down by 0.5
      if (sub.value > 6.0) {
        const newVal = sub.value - 0.5;
        const [c, co, e, s] = setter(newVal);
        const newResult = calculateOverallGrade(c, co, e, s);
        scenarios.push({
          label: sub.label,
          direction: 'down',
          from: sub.value,
          to: newVal,
          newGrade: newResult.grade,
          newLabel: newResult.label,
          changed: newResult.grade !== result.grade,
        });
      }
    }

    return scenarios;
  }, [centering, corners, edges, surface, subgrades, result.grade]);

  const applyPreset = useCallback((values: [number, number, number, number]) => {
    setCentering(values[0]);
    setCorners(values[1]);
    setEdges(values[2]);
    setSurface(values[3]);
  }, []);

  return (
    <div className="space-y-8">
      {/* Quick Presets */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Presets</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.values)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subgrade Sliders + Overall Grade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">Subgrades</h2>
          <SubgradeSlider label="Centering" value={centering} onChange={setCentering} />
          <SubgradeSlider label="Corners" value={corners} onChange={setCorners} />
          <SubgradeSlider label="Edges" value={edges} onChange={setEdges} />
          <SubgradeSlider label="Surface" value={surface} onChange={setSurface} />
        </div>

        {/* Overall Grade Display */}
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Overall Grade</h2>
          <div className={`border rounded-2xl p-6 text-center ${gradeBg(result.grade)}`}>
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">BGS</span>
            </div>
            <div className={`text-5xl font-extrabold mb-1 ${gradeColor(result.grade)}`}>
              {result.grade % 1 === 0 ? result.grade.toFixed(0) : result.grade.toFixed(1)}
            </div>
            <div className={`text-lg font-semibold mb-4 ${gradeColor(result.grade)}`}>
              {result.label}
            </div>
            <div className="border-t border-gray-700/50 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Average</span>
                <span className="text-white font-medium">{result.average.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Weakest</span>
                <span className={`font-medium ${gradeColor(weakestLink.value)}`}>
                  {weakestLink.label} ({weakestLink.value.toFixed(1)})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">PSA Equiv.</span>
                <span className="text-white font-medium">{PSA_EQUIVALENT[String(result.grade)] || 'N/A'}</span>
              </div>
            </div>

            {/* Mini subgrade bars */}
            <div className="mt-4 space-y-1.5">
              {subgrades.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-16 text-left">{s.label.slice(0, 4)}</span>
                  <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${gradeBgSolid(s.value)}`}
                      style={{ width: `${((s.value - 6) / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-7 text-right ${gradeColor(s.value)}`}>
                    {s.value % 1 === 0 ? s.value.toFixed(0) : s.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* What-If Scenarios */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">&ldquo;What If&rdquo; Scenarios</h2>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          {weakestLink.value < 10 && (
            <div className="mb-4 bg-amber-950/30 border border-amber-800/30 rounded-xl px-4 py-3">
              <p className="text-amber-300/90 text-sm">
                <strong className="font-semibold">{weakestLink.label}</strong> at {weakestLink.value.toFixed(1)} is your weakest subgrade and the most likely to hold your overall grade back.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatIfScenarios.filter((s) => s.direction === 'up').map((s) => (
              <div
                key={`${s.label}-${s.direction}`}
                className={`rounded-xl px-4 py-3 border transition-colors ${
                  s.changed
                    ? 'bg-emerald-950/30 border-emerald-800/30'
                    : 'bg-gray-900/50 border-gray-700/30'
                }`}
              >
                <p className="text-sm">
                  <span className="text-gray-400">If </span>
                  <span className="text-white font-medium">{s.label}</span>
                  <span className="text-gray-400"> were </span>
                  <span className={`font-semibold ${gradeColor(s.to)}`}>{s.to.toFixed(1)}</span>
                  <span className="text-gray-400"> instead of </span>
                  <span className="text-gray-500">{s.from.toFixed(1)}</span>
                </p>
                <p className="text-sm mt-1">
                  <span className="text-gray-500">Overall: </span>
                  <span className={`font-bold ${gradeColor(s.newGrade)}`}>
                    BGS {s.newGrade % 1 === 0 ? s.newGrade.toFixed(0) : s.newGrade.toFixed(1)} ({s.newLabel})
                  </span>
                  {s.changed && (
                    <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">
                      Grade Change
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>

          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
              Show downgrade scenarios
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {whatIfScenarios.filter((s) => s.direction === 'down').map((s) => (
                <div
                  key={`${s.label}-${s.direction}`}
                  className={`rounded-xl px-4 py-3 border transition-colors ${
                    s.changed
                      ? 'bg-red-950/30 border-red-800/30'
                      : 'bg-gray-900/50 border-gray-700/30'
                  }`}
                >
                  <p className="text-sm">
                    <span className="text-gray-400">If </span>
                    <span className="text-white font-medium">{s.label}</span>
                    <span className="text-gray-400"> dropped to </span>
                    <span className={`font-semibold ${gradeColor(s.to)}`}>{s.to.toFixed(1)}</span>
                    <span className="text-gray-400"> from </span>
                    <span className="text-gray-500">{s.from.toFixed(1)}</span>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-gray-500">Overall: </span>
                    <span className={`font-bold ${gradeColor(s.newGrade)}`}>
                      BGS {s.newGrade % 1 === 0 ? s.newGrade.toFixed(0) : s.newGrade.toFixed(1)} ({s.newLabel})
                    </span>
                    {s.changed && (
                      <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                        Grade Drop
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Grade Value Impact + BGS vs PSA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value Impact */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Grade Value Impact</h2>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Grade</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3">Value Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {VALUE_MULTIPLIERS.map((v) => {
                  const isActive = v.grade === String(result.grade) ||
                    (v.grade === '7 and below' && result.grade <= 7);
                  return (
                    <tr
                      key={v.grade}
                      className={`border-b border-gray-700/30 last:border-0 transition-colors ${
                        isActive ? 'bg-emerald-950/30' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold ${isActive ? 'text-emerald-400' : 'text-white'}`}>
                          BGS {v.grade}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">{v.label}</span>
                      </td>
                      <td className={`text-right px-4 py-2.5 font-medium ${isActive ? 'text-emerald-400' : 'text-gray-300'}`}>
                        {v.multiplier}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BGS vs PSA Comparison */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">BGS vs PSA Comparison</h2>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left text-gray-400 font-medium px-4 py-3">BGS Grade</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3">PSA Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PSA_EQUIVALENT).reverse().map(([bgs, psa]) => {
                  const bgsNum = parseFloat(bgs);
                  const isActive = bgsNum === result.grade;
                  return (
                    <tr
                      key={bgs}
                      className={`border-b border-gray-700/30 last:border-0 transition-colors ${
                        isActive ? 'bg-emerald-950/30' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold ${isActive ? 'text-emerald-400' : 'text-white'}`}>
                          BGS {bgsNum % 1 === 0 ? bgsNum.toFixed(0) : bgsNum.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">{GRADE_LABELS[bgs]}</span>
                      </td>
                      <td className={`text-right px-4 py-2.5 font-medium ${isActive ? 'text-emerald-400' : 'text-gray-300'}`}>
                        {psa}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">BGS Subgrade Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIPS.map((tip) => (
            <div key={tip.title} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-2">{tip.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="border-t border-gray-800 pt-8">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '💰' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter', icon: '🔄' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', icon: '🔬' },
            { href: '/tools/submission-planner', label: 'Submission Planner', icon: '📋' },
            { href: '/tools/pop-report', label: 'Population Report', icon: '📈' },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
