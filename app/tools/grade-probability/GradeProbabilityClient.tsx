'use client';

import { useState, useMemo } from 'react';

/* ─── Types ──────────────────────────────────────────────── */
interface GradeProb {
  grade: string;
  psa: number;
  bgs: number;
  cgc: number;
}

interface Assessment {
  corners: number;
  edges: number;
  surface: number;
  centering: number;
}

const CRITERIA = [
  { key: 'corners' as const, label: 'Corners', icon: '📐', descriptions: ['Heavy rounding/damage', 'Visible wear or whitening', 'Minor whitening under magnification', 'Light touch — nearly perfect', 'Razor sharp, no whitening'] },
  { key: 'edges' as const, label: 'Edges', icon: '🔪', descriptions: ['Major chipping or damage', 'Visible roughness or chips', 'Minor chipping or roughness', 'Very slight imperfections', 'Clean, crisp cut lines'] },
  { key: 'surface' as const, label: 'Surface', icon: '✨', descriptions: ['Creases, heavy scratches, staining', 'Noticeable scratches or print lines', 'Minor surface wear under light', 'Barely perceptible imperfections', 'Flawless — no scratches, marks, or lines'] },
  { key: 'centering' as const, label: 'Centering', icon: '🎯', descriptions: ['70/30 or worse', '65/35 — noticeably off', '60/40 — slightly off center', '55/45 — minimal shift', '50/50 or within 55/45 on both axes'] },
];

const GRADE_LABELS: Record<string, string> = {
  '10': 'Gem Mint',
  '9.5': 'Gem Mint (BGS)',
  '9': 'Mint',
  '8.5': 'NM-MT+',
  '8': 'NM-MT',
  '7': 'NM',
  '6': 'EX-MT',
  '5': 'EX',
  '≤4': 'VG or lower',
};

const VALUE_MULTIPLIERS: Record<string, { modern: string; vintage: string }> = {
  '10': { modern: '5-15x raw', vintage: '20-50x raw' },
  '9.5': { modern: '2-5x raw', vintage: '10-25x raw' },
  '9': { modern: '1.5-3x raw', vintage: '5-15x raw' },
  '8.5': { modern: '1-1.5x raw', vintage: '3-8x raw' },
  '8': { modern: '0.8-1.2x raw', vintage: '2-5x raw' },
  '7': { modern: '0.5-0.8x raw', vintage: '1.5-3x raw' },
  '6': { modern: '0.3-0.5x raw', vintage: '1-2x raw' },
  '5': { modern: '0.2-0.3x raw', vintage: '0.8-1.5x raw' },
  '≤4': { modern: '0.1-0.2x raw', vintage: '0.5-1x raw' },
};

/* ─── Probability engine ─────────────────────────────────── */
function calculateProbabilities(assessment: Assessment, vintage: boolean): GradeProb[] {
  const avg = (assessment.corners + assessment.edges + assessment.surface + assessment.centering) / 4;
  const min = Math.min(assessment.corners, assessment.edges, assessment.surface, assessment.centering);

  // The weakest criterion caps the grade (PSA rule)
  const capGrade = min + 5; // scale 1-5 → cap at grade 6-10

  // Vintage gets a slight bump on surface/corners (graders are more lenient)
  const vintageBonus = vintage ? 0.3 : 0;
  const effectiveAvg = Math.min(avg + vintageBonus, 5);

  // Base distribution centered around effective average
  const center = effectiveAvg + 5; // scale 1-5 → grade 6-10

  function gaussian(x: number, mu: number, sigma: number): number {
    return Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
  }

  const grades = [10, 9.5, 9, 8.5, 8, 7, 6, 5, 4];

  // PSA — stricter on 10s, no half grades except via crossover
  const psaRaw = grades.map(g => {
    if (g === 9.5) return 0; // PSA doesn't give 9.5
    if (g === 8.5) return 0; // PSA doesn't give 8.5
    let prob = gaussian(g, center, 0.8);
    if (g > capGrade) prob *= 0.15; // hard cap penalty
    if (g === 10) prob *= (min >= 4 ? 0.7 : min >= 3 ? 0.15 : 0.02); // PSA 10 requires near-perfection
    if (vintage && g >= 9) prob *= 1.1; // vintage slight leniency at high grades
    return Math.max(0, prob);
  });

  // BGS — gives half grades, stricter on 10 (Black Label), 9.5 is Gem Mint
  const bgsRaw = grades.map(g => {
    let prob = gaussian(g, center - 0.2, 0.7); // BGS tends slightly lower than PSA
    if (g > capGrade) prob *= 0.12;
    if (g === 10) prob *= (min >= 5 ? 0.5 : min >= 4 ? 0.05 : 0.005); // BGS 10 Black Label extremely rare
    if (g === 9.5) prob *= (min >= 4 ? 0.8 : min >= 3 ? 0.2 : 0.03);
    return Math.max(0, prob);
  });

  // CGC — similar to PSA but slightly more generous on 9.5/10
  const cgcRaw = grades.map(g => {
    if (g === 8.5) return 0; // CGC uses whole + .5 selectively
    let prob = gaussian(g, center + 0.1, 0.75);
    if (g > capGrade) prob *= 0.15;
    if (g === 10) prob *= (min >= 4 ? 0.75 : min >= 3 ? 0.2 : 0.03);
    if (g === 9.5) prob *= (min >= 4 ? 0.85 : min >= 3 ? 0.25 : 0.04);
    return Math.max(0, prob);
  });

  // Normalize each
  const psaTotal = psaRaw.reduce((a, b) => a + b, 0) || 1;
  const bgsTotal = bgsRaw.reduce((a, b) => a + b, 0) || 1;
  const cgcTotal = cgcRaw.reduce((a, b) => a + b, 0) || 1;

  return grades.map((g, i) => ({
    grade: g <= 4 ? '≤4' : String(g),
    psa: Math.round((psaRaw[i] / psaTotal) * 100),
    bgs: Math.round((bgsRaw[i] / bgsTotal) * 100),
    cgc: Math.round((cgcRaw[i] / cgcTotal) * 100),
  })).filter(g => g.psa > 0 || g.bgs > 0 || g.cgc > 0);
}

function getExpectedGrade(probs: GradeProb[], company: 'psa' | 'bgs' | 'cgc'): string {
  let sum = 0;
  let total = 0;
  for (const p of probs) {
    const g = p.grade === '≤4' ? 4 : parseFloat(p.grade);
    const pct = p[company];
    sum += g * pct;
    total += pct;
  }
  if (total === 0) return '—';
  const expected = sum / total;
  if (expected >= 9.75) return '10';
  if (expected >= 9.25) return '9.5';
  if (expected >= 8.75) return '9';
  if (expected >= 8.25) return '8.5';
  if (expected >= 7.5) return '8';
  if (expected >= 6.5) return '7';
  if (expected >= 5.5) return '6';
  if (expected >= 4.5) return '5';
  return '≤4';
}

function getVerdict(expectedGrade: string, vintage: boolean): { verdict: string; color: string; detail: string } {
  const g = expectedGrade === '≤4' ? 4 : parseFloat(expectedGrade);
  if (vintage) {
    if (g >= 8) return { verdict: 'Strong Submit', color: 'text-green-400', detail: 'Vintage cards in this condition range command significant premiums. Authentication alone adds value.' };
    if (g >= 6) return { verdict: 'Worth Submitting', color: 'text-emerald-400', detail: 'Mid-grade vintage is highly collectible. Slabbing provides authentication and protection.' };
    if (g >= 4) return { verdict: 'Consider It', color: 'text-yellow-400', detail: 'For valuable vintage cards ($200+), even lower grades benefit from authentication. Check if the raw value justifies grading costs.' };
    return { verdict: 'Sell Raw', color: 'text-red-400', detail: 'Unless the card is worth $500+ raw, grading at this condition likely won\'t add enough value to justify the cost.' };
  }
  if (g >= 9.5) return { verdict: 'Strong Submit', color: 'text-green-400', detail: 'High probability of a premium grade. The PSA 10 / BGS 9.5 multiplier will more than cover grading costs for cards worth $30+.' };
  if (g >= 9) return { verdict: 'Good Submit', color: 'text-emerald-400', detail: 'Likely PSA 9+ territory. Worth grading for cards valued $50+ raw. The grade premium at 9+ is significant for most modern cards.' };
  if (g >= 8) return { verdict: 'Borderline', color: 'text-yellow-400', detail: 'Expected grade around 8-8.5. Only worth grading if the card is valued $100+ raw, as the grade premium at 8 is modest for modern cards.' };
  if (g >= 7) return { verdict: 'Likely Not Worth It', color: 'text-orange-400', detail: 'Expected grade 7-7.5. Modern cards graded below 8 often sell for less than raw copies. Save your grading dollars.' };
  return { verdict: 'Don\'t Submit', color: 'text-red-400', detail: 'Cards in this condition range typically lose value when graded (modern). The slab confirms the flaws and reduces buyer interest compared to raw.' };
}

/* ─── Component ──────────────────────────────────────────── */
export default function GradeProbabilityClient() {
  const [assessment, setAssessment] = useState<Assessment>({ corners: 4, edges: 4, surface: 4, centering: 4 });
  const [vintage, setVintage] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const probs = useMemo(() => calculateProbabilities(assessment, vintage), [assessment, vintage]);

  const expectedPSA = useMemo(() => getExpectedGrade(probs, 'psa'), [probs]);
  const expectedBGS = useMemo(() => getExpectedGrade(probs, 'bgs'), [probs]);
  const expectedCGC = useMemo(() => getExpectedGrade(probs, 'cgc'), [probs]);

  const verdict = useMemo(() => getVerdict(expectedPSA, vintage), [expectedPSA, vintage]);

  const handleCriterion = (key: keyof Assessment, value: number) => {
    setAssessment(prev => ({ ...prev, [key]: value }));
  };

  const maxProb = useMemo(() => {
    let max = 0;
    for (const p of probs) {
      max = Math.max(max, p.psa, p.bgs, p.cgc);
    }
    return max || 1;
  }, [probs]);

  return (
    <div className="space-y-8">
      {/* Assessment Input */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Rate Your Card&apos;s Condition</h2>
          <button
            onClick={() => setVintage(!vintage)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${vintage ? 'bg-amber-950/60 border-amber-700 text-amber-400' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:text-slate-300'}`}
          >
            <span>{vintage ? '📜' : '🃏'}</span>
            {vintage ? 'Vintage (Pre-1980)' : 'Modern Card'}
          </button>
        </div>

        <div className="space-y-6">
          {CRITERIA.map(criterion => (
            <div key={criterion.key}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{criterion.icon}</span>
                <span className="text-sm font-bold text-white">{criterion.label}</span>
                <span className="text-xs text-slate-500 ml-auto">{assessment[criterion.key]}/5</span>
              </div>
              <div className="flex gap-2 mb-1">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => handleCriterion(criterion.key, val)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      assessment[criterion.key] === val
                        ? val >= 4 ? 'bg-green-900/40 border-green-600 text-green-400'
                          : val >= 3 ? 'bg-yellow-900/40 border-yellow-600 text-yellow-400'
                          : 'bg-red-900/40 border-red-600 text-red-400'
                        : 'bg-slate-700/30 border-slate-700 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">{criterion.descriptions[assessment[criterion.key] - 1]}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowResults(true)}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Calculate Grade Probabilities
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <>
          {/* Verdict Banner */}
          <div className={`bg-slate-800/60 border border-slate-700 rounded-xl p-6 text-center`}>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Submission Verdict</p>
            <p className={`text-2xl font-black ${verdict.color}`}>{verdict.verdict}</p>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">{verdict.detail}</p>
          </div>

          {/* Expected Grades */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { company: 'PSA', grade: expectedPSA, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-800/40' },
              { company: 'BGS', grade: expectedBGS, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-800/40' },
              { company: 'CGC', grade: expectedCGC, color: 'text-emerald-400', bg: 'bg-emerald-900/20', border: 'border-emerald-800/40' },
            ].map(c => (
              <div key={c.company} className={`${c.bg} border ${c.border} rounded-xl p-4 text-center`}>
                <p className="text-xs text-slate-500 font-medium">{c.company} Expected</p>
                <p className={`text-3xl font-black ${c.color} mt-1`}>{c.grade}</p>
                <p className="text-xs text-slate-500 mt-1">{GRADE_LABELS[c.grade] || 'Fair or lower'}</p>
              </div>
            ))}
          </div>

          {/* Probability Distribution Chart */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Grade Probability Distribution</h2>
            <div className="space-y-3">
              {probs.map(p => (
                <div key={p.grade} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white w-8 text-right">{p.grade}</span>
                    <span className="text-xs text-slate-500 w-16">{GRADE_LABELS[p.grade] || ''}</span>
                    <div className="flex-1 space-y-0.5">
                      {/* PSA bar */}
                      {p.psa > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-red-400 w-7">PSA</span>
                          <div className="flex-1 bg-slate-700/50 rounded-full h-3 overflow-hidden">
                            <div className="bg-red-500/70 h-full rounded-full transition-all" style={{ width: `${(p.psa / maxProb) * 100}%` }} />
                          </div>
                          <span className="text-xs text-red-400 w-8 text-right">{p.psa}%</span>
                        </div>
                      )}
                      {/* BGS bar */}
                      {p.bgs > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-blue-400 w-7">BGS</span>
                          <div className="flex-1 bg-slate-700/50 rounded-full h-3 overflow-hidden">
                            <div className="bg-blue-500/70 h-full rounded-full transition-all" style={{ width: `${(p.bgs / maxProb) * 100}%` }} />
                          </div>
                          <span className="text-xs text-blue-400 w-8 text-right">{p.bgs}%</span>
                        </div>
                      )}
                      {/* CGC bar */}
                      {p.cgc > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-400 w-7">CGC</span>
                          <div className="flex-1 bg-slate-700/50 rounded-full h-3 overflow-hidden">
                            <div className="bg-emerald-500/70 h-full rounded-full transition-all" style={{ width: `${(p.cgc / maxProb) * 100}%` }} />
                          </div>
                          <span className="text-xs text-emerald-400 w-8 text-right">{p.cgc}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700">
              <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-2 bg-red-500/70 rounded-sm" /> PSA</span>
              <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-2 bg-blue-500/70 rounded-sm" /> BGS</span>
              <span className="flex items-center gap-1.5 text-xs"><span className="w-3 h-2 bg-emerald-500/70 rounded-sm" /> CGC</span>
            </div>
          </div>

          {/* Value Multiplier Table */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Value Impact by Grade</h2>
            <p className="text-sm text-slate-400 mb-4">How much does each grade affect your card&apos;s value compared to raw?</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400 font-medium">Grade</th>
                    <th className="text-center py-2 text-slate-400 font-medium">Modern Cards</th>
                    <th className="text-center py-2 text-slate-400 font-medium">Vintage Cards</th>
                    <th className="text-center py-2 text-slate-400 font-medium">Your Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(VALUE_MULTIPLIERS).map(([grade, mult]) => {
                    const prob = probs.find(p => p.grade === grade);
                    const yourProb = prob ? Math.max(prob.psa, prob.bgs, prob.cgc) : 0;
                    const isExpected = grade === expectedPSA;
                    return (
                      <tr key={grade} className={`border-b border-slate-800 ${isExpected ? 'bg-indigo-900/20' : ''}`}>
                        <td className={`py-2 font-bold ${isExpected ? 'text-indigo-400' : 'text-white'}`}>
                          {grade} {isExpected && '←'}
                        </td>
                        <td className="py-2 text-center text-slate-300">{mult.modern}</td>
                        <td className="py-2 text-center text-slate-300">{mult.vintage}</td>
                        <td className="py-2 text-center">
                          {yourProb > 0 ? (
                            <span className={yourProb >= 30 ? 'text-green-400 font-bold' : yourProb >= 10 ? 'text-yellow-400' : 'text-slate-500'}>
                              {yourProb}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Tips to Maximize Your Grade</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Improve Centering Odds', tip: 'If your card is off-center, some graders are more lenient. BGS gives subgrades, so a 9.5 with 9 centering is common. PSA may bump to 10 if centering is 55/45 or better.', icon: '🎯' },
                { title: 'Surface Preparation', tip: 'Use a microfiber cloth to gently remove fingerprints before submission. Never use chemicals. Store in a penny sleeve + top loader during transit to prevent new scratches.', icon: '✨' },
                { title: 'Choose the Right Company', tip: 'PSA 10 commands the highest premium for most cards. BGS 9.5 Gem Mint is easier to get and still sells well. CGC is fastest turnaround if time matters more than max premium.', icon: '🏢' },
                { title: 'Batch for Savings', tip: 'Submit 10+ cards at economy tier ($20-30/card) instead of single submissions ($50-100/card). The savings add up fast and the turnaround is only slightly longer.', icon: '📦' },
                { title: 'Consider the Card Value', tip: 'Rule of thumb: don\'t grade cards worth less than 3x the grading cost in raw condition. A $10 raw card is almost never worth $30+ to grade.', icon: '💰' },
                { title: 'Vintage Exception', tip: 'Pre-1970 cards benefit from grading even at lower grades. Authentication alone adds value. A PSA 5 1952 Topps is worth more than raw because it\'s verified genuine.', icon: '📜' },
              ].map(item => (
                <div key={item.title} className="bg-slate-700/30 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">How This Calculator Works</h2>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Self-Assessment', desc: 'You rate your card on the same 4 criteria professional graders use: corners, edges, surface, and centering.' },
                { step: '2', title: 'Cap Rule Applied', desc: 'Like real grading, your weakest criterion caps the maximum grade. A card with perfect everything but poor centering won\'t get a 10.' },
                { step: '3', title: 'Company Adjustments', desc: 'PSA, BGS, and CGC have different grading tendencies. BGS gives subgrades and half-grades. PSA 10 is the gold standard but harder to achieve. CGC trends slightly more generous.' },
                { step: '4', title: 'Probability Distribution', desc: 'Instead of one grade, you see the probability of each possible grade. This reflects real-world variance — even identical cards can grade differently.' },
              ].map(item => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 bg-indigo-600/30 border border-indigo-500/40 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
            <p className="text-xs text-amber-400/80 leading-relaxed">
              <strong>Disclaimer:</strong> This calculator provides estimates based on general grading patterns and your self-assessment. Actual grades depend on the specific grader, card type, era, and many factors not captured here. Professional grading involves trained experts examining cards under magnification. Use these probabilities as a screening tool, not a guarantee. Most users find actual grades within 0.5-1 points of the expected grade.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
