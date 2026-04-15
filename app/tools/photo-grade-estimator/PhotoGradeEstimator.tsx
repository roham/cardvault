'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Assessment = 'mint' | 'near-mint' | 'excellent' | 'good' | 'fair' | 'poor';

interface CriterionState {
  assessment: Assessment | null;
}

const CRITERIA = [
  {
    id: 'corners',
    label: 'Corners',
    icon: '🔲',
    weight: 0.3,
    description: 'Examine all four corners under good lighting.',
    levels: [
      { value: 'mint' as Assessment, label: 'Mint', grade: 10, desc: 'All 4 corners are razor-sharp with zero whitening or fraying. Perfect points.' },
      { value: 'near-mint' as Assessment, label: 'Near Mint', grade: 9, desc: 'Very slight corner touch on 1-2 corners. Barely visible without magnification.' },
      { value: 'excellent' as Assessment, label: 'Excellent', grade: 7.5, desc: 'Minor fuzzing or whitening on 2-3 corners. Visible but not distracting.' },
      { value: 'good' as Assessment, label: 'Good', grade: 6, desc: 'Noticeable rounding or whitening on most corners. Clearly impacted.' },
      { value: 'fair' as Assessment, label: 'Fair', grade: 4, desc: 'Significant rounding, creasing, or dings on corners. Obviously worn.' },
      { value: 'poor' as Assessment, label: 'Poor', grade: 2, desc: 'Heavily rounded, paper loss, or major damage on corners.' },
    ],
  },
  {
    id: 'edges',
    label: 'Edges',
    icon: '📏',
    weight: 0.25,
    description: 'Run your finger along all 4 edges. Check for chipping or roughness.',
    levels: [
      { value: 'mint' as Assessment, label: 'Mint', grade: 10, desc: 'Perfectly clean-cut edges. No chipping, whitening, or roughness on any edge.' },
      { value: 'near-mint' as Assessment, label: 'Near Mint', grade: 9, desc: 'Very minor edge wear on 1 edge. Barely detectable. Clean overall.' },
      { value: 'excellent' as Assessment, label: 'Excellent', grade: 7.5, desc: 'Light chipping or whitening along 1-2 edges. Minor roughness.' },
      { value: 'good' as Assessment, label: 'Good', grade: 6, desc: 'Visible edge wear on multiple edges. Some chipping or whitening.' },
      { value: 'fair' as Assessment, label: 'Fair', grade: 4, desc: 'Heavy edge wear, significant chipping, or paper separation along edges.' },
      { value: 'poor' as Assessment, label: 'Poor', grade: 2, desc: 'Severe edge damage, peeling, or missing edge material.' },
    ],
  },
  {
    id: 'surface',
    label: 'Surface',
    icon: '✨',
    weight: 0.25,
    description: 'Tilt the card under direct light to reveal scratches, print dots, or staining.',
    levels: [
      { value: 'mint' as Assessment, label: 'Mint', grade: 10, desc: 'Flawless surface. No scratches, print defects, stains, or wax residue. Perfect gloss.' },
      { value: 'near-mint' as Assessment, label: 'Near Mint', grade: 9, desc: 'One minor surface imperfection — a tiny print dot or very light handling mark.' },
      { value: 'excellent' as Assessment, label: 'Excellent', grade: 7.5, desc: 'Light scratches visible under direct light, or minor print defects. Still presents well.' },
      { value: 'good' as Assessment, label: 'Good', grade: 6, desc: 'Noticeable scratches, light creasing, wax stains, or surface wear. Visible from arm length.' },
      { value: 'fair' as Assessment, label: 'Fair', grade: 4, desc: 'Heavy scratching, staining, creases that break the surface, or significant print issues.' },
      { value: 'poor' as Assessment, label: 'Poor', grade: 2, desc: 'Major surface damage — heavy creases, tears, writing, sticker residue, or delamination.' },
    ],
  },
  {
    id: 'centering',
    label: 'Centering',
    icon: '🎯',
    weight: 0.2,
    description: 'Compare left-right and top-bottom borders. Are they even?',
    levels: [
      { value: 'mint' as Assessment, label: 'Mint', grade: 10, desc: '50/50 or within 55/45 on both axes. Perfectly centered to the naked eye.' },
      { value: 'near-mint' as Assessment, label: 'Near Mint', grade: 9, desc: '55/45 to 60/40. Slightly off but still looks great. Passes PSA 9 standard.' },
      { value: 'excellent' as Assessment, label: 'Excellent', grade: 7.5, desc: '60/40 to 65/35. Noticeable shift but within acceptable range for PSA 8.' },
      { value: 'good' as Assessment, label: 'Good', grade: 6, desc: '65/35 to 75/25. Clearly off-center. One border significantly wider than opposite.' },
      { value: 'fair' as Assessment, label: 'Fair', grade: 4, desc: '75/25 or worse. Heavily miscut. Image or border noticeably shifted.' },
      { value: 'poor' as Assessment, label: 'Poor', grade: 2, desc: 'Extreme miscut — borders missing, image touching edge, or diamond-cut.' },
    ],
  },
];

function getGradeColor(grade: number): string {
  if (grade >= 9.5) return 'text-emerald-400';
  if (grade >= 9) return 'text-green-400';
  if (grade >= 8) return 'text-lime-400';
  if (grade >= 7) return 'text-yellow-400';
  if (grade >= 5) return 'text-orange-400';
  return 'text-red-400';
}

function getGradeLabel(grade: number): string {
  if (grade >= 9.5) return 'GEM MINT';
  if (grade >= 9) return 'MINT';
  if (grade >= 8.5) return 'NM-MT+';
  if (grade >= 8) return 'NM-MT';
  if (grade >= 7.5) return 'NM+';
  if (grade >= 7) return 'NM';
  if (grade >= 6.5) return 'EX-MT+';
  if (grade >= 6) return 'EX-MT';
  if (grade >= 5.5) return 'EX+';
  if (grade >= 5) return 'EX';
  if (grade >= 4) return 'VG-EX';
  if (grade >= 3) return 'VG';
  if (grade >= 2) return 'GOOD';
  return 'FAIR/POOR';
}

function getGradeBg(grade: number): string {
  if (grade >= 9.5) return 'bg-emerald-500/20 border-emerald-500/40';
  if (grade >= 9) return 'bg-green-500/20 border-green-500/40';
  if (grade >= 8) return 'bg-lime-500/20 border-lime-500/40';
  if (grade >= 7) return 'bg-yellow-500/20 border-yellow-500/40';
  if (grade >= 5) return 'bg-orange-500/20 border-orange-500/40';
  return 'bg-red-500/20 border-red-500/40';
}

function getPSAGrade(weighted: number): number {
  // Round to nearest 0.5 for PSA-style grades
  const rounded = Math.round(weighted * 2) / 2;
  return Math.min(10, Math.max(1, rounded));
}

function getBGSGrade(weighted: number): number {
  // BGS uses half-point increments, slightly stricter
  const adjusted = weighted * 0.97; // BGS is slightly stricter
  const rounded = Math.round(adjusted * 2) / 2;
  return Math.min(10, Math.max(1, rounded));
}

function getCGCGrade(weighted: number): number {
  // CGC uses half-point increments, similar to PSA
  const adjusted = weighted * 0.98;
  const rounded = Math.round(adjusted * 2) / 2;
  return Math.min(10, Math.max(1, rounded));
}

export default function PhotoGradeEstimator() {
  const [criteria, setCriteria] = useState<Record<string, CriterionState>>({
    corners: { assessment: null },
    edges: { assessment: null },
    surface: { assessment: null },
    centering: { assessment: null },
  });
  const [isVintage, setIsVintage] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const completedCount = Object.values(criteria).filter(c => c.assessment !== null).length;
  const allCompleted = completedCount === 4;

  const results = useMemo(() => {
    if (!allCompleted) return null;

    let weightedTotal = 0;
    const breakdown: { id: string; label: string; grade: number }[] = [];

    for (const crit of CRITERIA) {
      const state = criteria[crit.id];
      const level = crit.levels.find(l => l.value === state.assessment);
      if (!level) return null;
      const grade = isVintage ? Math.min(level.grade + 0.5, 10) : level.grade;
      weightedTotal += grade * crit.weight;
      breakdown.push({ id: crit.id, label: crit.label, grade });
    }

    const psaGrade = getPSAGrade(weightedTotal);
    const bgsGrade = getBGSGrade(weightedTotal);
    const cgcGrade = getCGCGrade(weightedTotal);

    // Determine weakest area
    const weakest = breakdown.reduce((min, item) => item.grade < min.grade ? item : min, breakdown[0]);

    // PSA cap: overall can't be more than 1 point above lowest sub
    const cappedPsa = Math.min(psaGrade, weakest.grade + 1);

    return {
      weighted: weightedTotal,
      psa: cappedPsa,
      bgs: bgsGrade,
      cgc: cgcGrade,
      breakdown,
      weakest,
    };
  }, [criteria, allCompleted, isVintage]);

  function setAssessment(criterionId: string, value: Assessment) {
    setCriteria(prev => ({
      ...prev,
      [criterionId]: { assessment: value },
    }));
  }

  function reset() {
    setCriteria({
      corners: { assessment: null },
      edges: { assessment: null },
      surface: { assessment: null },
      centering: { assessment: null },
    });
  }

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <button
            onClick={() => setIsVintage(!isVintage)}
            className={`w-10 h-5 rounded-full transition-colors ${isVintage ? 'bg-amber-600' : 'bg-zinc-700'} relative`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isVintage ? 'left-5' : 'left-0.5'}`} />
          </button>
          Vintage card (pre-1980) — grading is more lenient
        </label>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <div className="w-full bg-zinc-800 rounded-full h-2 max-w-[120px]">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
          {completedCount}/4 assessed
        </div>
        {completedCount > 0 && (
          <button onClick={reset} className="text-xs text-zinc-500 hover:text-white transition-colors">
            Reset All
          </button>
        )}
      </div>

      {/* Photo Assessment Tips */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <span className="font-medium text-white flex items-center gap-2">
            <span>📷</span> Photo Assessment Tips — Get an Accurate Grade
          </span>
          <span className={`text-zinc-400 transition-transform ${showTips ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showTips && (
          <div className="px-4 pb-4 grid sm:grid-cols-2 gap-3">
            {[
              { tip: 'Use natural daylight or a daylight-balanced bulb', why: 'Yellow/warm lighting hides scratches and makes yellowing invisible' },
              { tip: 'Tilt the card 15-45 degrees under direct light', why: 'Surface scratches only appear at specific angles — check from multiple angles' },
              { tip: 'Use a dark background (black felt or velvet)', why: 'Light backgrounds cause glare and make edge whitening harder to see' },
              { tip: 'Photograph at 2-3x zoom, not macro', why: 'Extreme macro distorts proportions and makes centering assessment unreliable' },
              { tip: 'Check all 4 corners individually', why: 'PSA grades to the WORST corner — one bad corner caps your grade' },
              { tip: 'Flip the card — check the back too', why: 'PSA grades front AND back. A perfect front with a damaged back still grades low' },
            ].map(t => (
              <div key={t.tip} className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-sm text-white font-medium">{t.tip}</p>
                <p className="text-xs text-zinc-500 mt-1">{t.why}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Cards */}
      {CRITERIA.map((crit, idx) => {
        const state = criteria[crit.id];
        const isComplete = state.assessment !== null;

        return (
          <div key={crit.id} className={`bg-zinc-900/60 border rounded-xl p-5 transition-all ${isComplete ? 'border-emerald-800/50' : 'border-zinc-800'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-xl">{crit.icon}</span>
                  <span>Step {idx + 1}: {crit.label}</span>
                  {isComplete && <span className="text-emerald-400 text-sm">✓</span>}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">{crit.description}</p>
              </div>
              {isComplete && (
                <span className={`text-sm font-bold ${getGradeColor(crit.levels.find(l => l.value === state.assessment)?.grade ?? 0)}`}>
                  {crit.levels.find(l => l.value === state.assessment)?.label}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              {crit.levels.map(level => (
                <button
                  key={level.value}
                  onClick={() => setAssessment(crit.id, level.value)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    state.assessment === level.value
                      ? 'border-emerald-600 bg-emerald-950/40 ring-1 ring-emerald-600/30'
                      : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${state.assessment === level.value ? 'text-emerald-400' : 'text-white'}`}>
                      {level.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      level.grade >= 9 ? 'bg-emerald-900/60 text-emerald-400' :
                      level.grade >= 7 ? 'bg-yellow-900/60 text-yellow-400' :
                      'bg-red-900/60 text-red-400'
                    }`}>
                      ~PSA {level.grade}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Results */}
      {results && (
        <div className={`border rounded-2xl p-6 ${getGradeBg(results.psa)}`}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Estimated Grades
          </h2>

          {/* Main grade */}
          <div className="text-center mb-6">
            <div className={`text-6xl font-black ${getGradeColor(results.psa)}`}>
              {results.psa}
            </div>
            <div className={`text-lg font-bold mt-1 ${getGradeColor(results.psa)}`}>
              PSA {getGradeLabel(results.psa)}
            </div>
            {isVintage && (
              <p className="text-xs text-amber-400 mt-2">
                Vintage adjustment applied — grading companies are more lenient on pre-1980 cards
              </p>
            )}
          </div>

          {/* Company comparison */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { company: 'PSA', grade: results.psa, color: 'red' },
              { company: 'BGS', grade: results.bgs, color: 'blue' },
              { company: 'CGC', grade: results.cgc, color: 'purple' },
            ].map(c => (
              <div key={c.company} className="bg-zinc-900/60 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 uppercase tracking-wider">{c.company}</div>
                <div className={`text-2xl font-black mt-1 ${getGradeColor(c.grade)}`}>{c.grade}</div>
                <div className="text-xs text-zinc-400 mt-1">{getGradeLabel(c.grade)}</div>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Criterion Breakdown</h3>
            {results.breakdown.map(item => {
              const crit = CRITERIA.find(c => c.id === item.id)!;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-6 text-center">{crit.icon}</span>
                  <span className="text-sm text-zinc-300 w-24">{item.label}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.grade >= 9 ? 'bg-emerald-500' :
                        item.grade >= 7 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(item.grade / 10) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold w-8 text-right ${getGradeColor(item.grade)}`}>
                    {item.grade}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Weakest area callout */}
          <div className="bg-zinc-900/60 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-amber-400 mb-1">
              ⚠️ Grade-Limiting Factor: {results.weakest.label}
            </h3>
            <p className="text-xs text-zinc-400">
              PSA grades are capped by the weakest criterion. Your {results.weakest.label.toLowerCase()} assessment
              ({results.weakest.grade}/10) is limiting your overall grade. Improving this area would have the
              biggest impact on your final grade.
            </p>
          </div>

          {/* Grading recommendation */}
          <div className="bg-zinc-900/60 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Should You Grade This Card?</h3>
            {results.psa >= 9 ? (
              <p className="text-sm text-emerald-400">
                <strong>Yes — strong grading candidate.</strong> Cards at PSA {results.psa} command
                significant premiums over raw. The grading fee is likely a worthwhile investment,
                especially for cards valued at $30+.
              </p>
            ) : results.psa >= 7 ? (
              <p className="text-sm text-yellow-400">
                <strong>Maybe — depends on value.</strong> A PSA {results.psa} provides moderate premium
                over raw. Grade only if the raw card is worth $50+ and you believe it could grade higher
                than estimated. Consider using economy service to minimize costs.
              </p>
            ) : (
              <p className="text-sm text-red-400">
                <strong>Probably not.</strong> At PSA {results.psa}, the grading premium is minimal.
                Unless the card is a high-value vintage piece where authentication alone adds value,
                the grading fee likely exceeds the value increase.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={reset}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
            >
              Grade Another Card
            </button>
          </div>
        </div>
      )}

      {/* Grade Reference Chart */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">PSA Grade Reference Chart</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 border-b border-zinc-800">
                <th className="py-2 pr-3">Grade</th>
                <th className="py-2 pr-3">Label</th>
                <th className="py-2 pr-3">Corners</th>
                <th className="py-2 pr-3">Edges</th>
                <th className="py-2 pr-3">Surface</th>
                <th className="py-2">Centering</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              {[
                { grade: 10, label: 'Gem Mint', corners: 'Perfect points', edges: 'Flawless', surface: 'No defects', centering: '55/45 or better' },
                { grade: 9, label: 'Mint', corners: 'Slight touch 1 corner', edges: 'Minor wear 1 edge', surface: '1 minor flaw', centering: '60/40 or better' },
                { grade: 8, label: 'NM-MT', corners: 'Light wear 2-3', edges: 'Light wear 1-2', surface: 'Few minor flaws', centering: '65/35 or better' },
                { grade: 7, label: 'NM', corners: 'Slight rounding', edges: 'Some roughness', surface: 'Light scratches', centering: '70/30 or better' },
                { grade: 6, label: 'EX-MT', corners: 'Noticeable wear', edges: 'Visible wear', surface: 'Noticeable marks', centering: '75/25 or better' },
                { grade: 5, label: 'EX', corners: 'Rounding', edges: 'Chipping', surface: 'Light creases', centering: '80/20 or better' },
                { grade: 4, label: 'VG-EX', corners: 'Heavy rounding', edges: 'Heavy wear', surface: 'Creases', centering: '85/15 or better' },
              ].map(row => (
                <tr key={row.grade} className="border-b border-zinc-800/50">
                  <td className={`py-2 pr-3 font-bold ${getGradeColor(row.grade)}`}>{row.grade}</td>
                  <td className="py-2 pr-3 font-medium">{row.label}</td>
                  <td className="py-2 pr-3 text-xs">{row.corners}</td>
                  <td className="py-2 pr-3 text-xs">{row.edges}</td>
                  <td className="py-2 pr-3 text-xs">{row.surface}</td>
                  <td className="py-2 text-xs">{row.centering}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Photo Pitfalls */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Common Photo Assessment Pitfalls</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Lighting hides scratches', desc: 'Overhead lighting can mask surface scratches. Tilt the card under a direct light source at 30-45 degrees to reveal hidden surface marks that would affect grading.' },
            { title: 'Phone cameras add distortion', desc: 'Smartphone lenses create barrel distortion, making centering look worse than reality. Hold camera parallel to card, 8-12 inches away for accurate assessment.' },
            { title: 'Glossy cards reflect light', desc: 'Chrome, Prizm, and refractor cards create reflection spots that hide surface defects. Photograph at a slight angle or use polarized lighting.' },
            { title: 'Dark edges look clean', desc: 'Dark-bordered cards (like 1993 SP) hide edge whitening in photos. Examine the actual card under magnification — white chipping may be invisible in pictures.' },
            { title: 'Penny sleeves add haze', desc: 'Grading a card through a penny sleeve makes it look hazier. Remove from sleeve for accurate surface assessment, then re-sleeve immediately.' },
            { title: 'Screen color shifts grades', desc: 'Monitor calibration affects how you see yellowing and discoloration. Compare to a known reference card in the same photo if possible.' },
          ].map(p => (
            <div key={p.title} className="bg-zinc-800/40 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-400 mb-1">{p.title}</h3>
              <p className="text-xs text-zinc-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white mb-4">Related Grading Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Detailed 4-step inspection', icon: '🔬' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is it worth grading?', icon: '💰' },
            { href: '/tools/centering-calc', label: 'Centering Calculator', desc: 'Measure exact centering', icon: '📐' },
            { href: '/tools/submission-planner', label: 'Submission Planner', desc: 'Compare PSA/BGS/CGC/SGC', icon: '📋' },
            { href: '/tools/pop-report', label: 'Population Report', desc: 'How rare is your grade?', icon: '📈' },
            { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator', desc: 'Calculate BGS overall', icon: '🎯' },
          ].map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors"
            >
              <span className="text-xl mt-0.5">{tool.icon}</span>
              <div>
                <span className="text-sm font-medium text-white">{tool.label}</span>
                <p className="text-xs text-zinc-500">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
