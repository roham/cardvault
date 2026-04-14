'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Grading criteria and their weight
interface CriterionScore {
  label: string;
  description: string;
  score: number; // 1-10
  weight: number;
  options: { value: number; label: string; desc: string }[];
}

const CRITERIA: Omit<CriterionScore, 'score'>[] = [
  {
    label: 'Corners',
    description: 'Examine all four corners under good lighting. Look for whitening, fraying, dings, or rounding.',
    weight: 0.30,
    options: [
      { value: 10, label: 'Flawless', desc: 'All 4 corners razor sharp — no whitening even under magnification' },
      { value: 9, label: 'Near Perfect', desc: 'Extremely sharp — one corner may show a tiny speck of whitening under magnification' },
      { value: 8, label: 'Sharp', desc: 'Corners are sharp to the naked eye — minor whitening visible under magnification' },
      { value: 7, label: 'Slightly Soft', desc: 'Very slight rounding or whitening on 1-2 corners visible to naked eye' },
      { value: 6, label: 'Soft', desc: 'Noticeable softness or whitening on 2+ corners' },
      { value: 5, label: 'Worn', desc: 'Visible rounding on most corners — some fraying' },
      { value: 4, label: 'Rounded', desc: 'All corners show significant rounding or damage' },
      { value: 3, label: 'Heavy Wear', desc: 'Major rounding, splitting, or damage on multiple corners' },
      { value: 2, label: 'Damaged', desc: 'Corners are heavily damaged, peeling, or missing material' },
      { value: 1, label: 'Destroyed', desc: 'Corners are bent, torn, or missing' },
    ],
  },
  {
    label: 'Edges',
    description: 'Run your finger along all four edges. Check for chipping, roughness, whitening, or nicks.',
    weight: 0.25,
    options: [
      { value: 10, label: 'Flawless', desc: 'All edges clean-cut and smooth — no chipping or whitening at any point' },
      { value: 9, label: 'Near Perfect', desc: 'Virtually flawless — one tiny nick or spec visible only under magnification' },
      { value: 8, label: 'Clean', desc: 'Edges appear clean to naked eye — minor imperfections under magnification' },
      { value: 7, label: 'Light Chipping', desc: 'Very slight chipping or whitening on 1-2 edges visible to naked eye' },
      { value: 6, label: 'Moderate Chipping', desc: 'Noticeable chipping or roughness along edges' },
      { value: 5, label: 'Rough', desc: 'Multiple edges show chipping, whitening, or rough texture' },
      { value: 4, label: 'Worn', desc: 'Significant edge wear — chipping visible from arm\'s length' },
      { value: 3, label: 'Heavy Wear', desc: 'Major chipping, peeling, or damage along most edges' },
      { value: 2, label: 'Damaged', desc: 'Edges severely damaged, paper separating, or deep nicks' },
      { value: 1, label: 'Destroyed', desc: 'Edges are torn, split, or missing material' },
    ],
  },
  {
    label: 'Surface',
    description: 'Tilt the card under light to check for scratches, print defects, staining, creases, or wax residue.',
    weight: 0.30,
    options: [
      { value: 10, label: 'Pristine', desc: 'No scratches, print defects, staining, or marks — surface is immaculate' },
      { value: 9, label: 'Near Pristine', desc: 'Virtually perfect — one minor print dot or hairline visible only under magnification' },
      { value: 8, label: 'Clean', desc: 'Surface appears clean — very minor imperfection visible under focused light' },
      { value: 7, label: 'Light Marks', desc: 'One or two light surface scratches or minor print imperfections visible' },
      { value: 6, label: 'Moderate Marks', desc: 'Multiple light scratches or minor staining visible under normal viewing' },
      { value: 5, label: 'Visible Wear', desc: 'Surface scratches, wax staining, or print issues clearly visible' },
      { value: 4, label: 'Heavy Marks', desc: 'Significant scratching, staining, or surface damage' },
      { value: 3, label: 'Creased', desc: 'One or more creases, heavy staining, or paper loss on surface' },
      { value: 2, label: 'Major Damage', desc: 'Multiple creases, writing, tape residue, or heavy staining' },
      { value: 1, label: 'Destroyed', desc: 'Surface is extensively damaged — tears, holes, or complete deterioration' },
    ],
  },
  {
    label: 'Centering',
    description: 'Compare left-right and top-bottom borders. Measure if possible. Most impactful for gem mint grades.',
    weight: 0.15,
    options: [
      { value: 10, label: '50/50 Perfect', desc: 'Borders are equal on all sides — virtually perfect centering' },
      { value: 9, label: '55/45 or Better', desc: 'Very slight off-center — nearly imperceptible without measuring' },
      { value: 8, label: '60/40', desc: 'Slightly off-center but acceptable for high grades' },
      { value: 7, label: '65/35', desc: 'Noticeably off-center on one or both axes' },
      { value: 6, label: '70/30', desc: 'Clearly off-center — visible at a glance' },
      { value: 5, label: '75/25', desc: 'Significantly off-center on one or both axes' },
      { value: 4, label: '80/20', desc: 'Major centering shift — image is clearly misplaced' },
      { value: 3, label: '85/15', desc: 'Severely miscut — one border nearly absent' },
      { value: 2, label: '90/10', desc: 'Extreme miscut — borders are dramatically uneven' },
      { value: 1, label: 'Miscut', desc: 'Card is miscut showing part of adjacent card' },
    ],
  },
];

// Calculate estimated PSA, BGS, CGC grade
function calculateGrades(scores: Record<string, number>) {
  const corners = scores['Corners'] || 0;
  const edges = scores['Edges'] || 0;
  const surface = scores['Surface'] || 0;
  const centering = scores['Centering'] || 0;

  // Weighted average
  const weighted = corners * 0.30 + edges * 0.25 + surface * 0.30 + centering * 0.15;

  // PSA: lowest attribute matters more — a single bad area caps the grade
  const lowest = Math.min(corners, edges, surface, centering);
  const psaRaw = Math.min(weighted, lowest + 1.5); // Can't be more than 1.5 above worst area
  const psa = Math.round(psaRaw * 2) / 2; // Round to nearest 0.5

  // BGS: sub-grades system — more granular
  const bgsOverall = (corners * 0.25 + edges * 0.25 + surface * 0.25 + centering * 0.25);
  const bgs = Math.round(bgsOverall * 2) / 2;

  // CGC: similar to PSA but slightly more lenient on centering
  const cgcRaw = corners * 0.28 + edges * 0.25 + surface * 0.30 + centering * 0.17;
  const cgcCapped = Math.min(cgcRaw, lowest + 2);
  const cgc = Math.round(cgcCapped * 2) / 2;

  return {
    psa: Math.max(1, Math.min(10, psa)),
    bgs: Math.max(1, Math.min(10, bgs)),
    cgc: Math.max(1, Math.min(10, cgc)),
    subgrades: { corners, edges, surface, centering },
    weighted: Math.round(weighted * 10) / 10,
  };
}

function getGradeColor(grade: number): string {
  if (grade >= 9.5) return 'text-yellow-400';
  if (grade >= 9) return 'text-emerald-400';
  if (grade >= 8) return 'text-sky-400';
  if (grade >= 7) return 'text-blue-400';
  if (grade >= 6) return 'text-zinc-300';
  if (grade >= 5) return 'text-orange-400';
  return 'text-red-400';
}

function getGradeLabel(grade: number): string {
  if (grade >= 10) return 'Gem Mint';
  if (grade >= 9.5) return 'Mint+';
  if (grade >= 9) return 'Mint';
  if (grade >= 8.5) return 'NM-MT+';
  if (grade >= 8) return 'NM-MT';
  if (grade >= 7.5) return 'Near Mint+';
  if (grade >= 7) return 'Near Mint';
  if (grade >= 6) return 'EX-MT';
  if (grade >= 5) return 'Excellent';
  if (grade >= 4) return 'VG-EX';
  if (grade >= 3) return 'Very Good';
  if (grade >= 2) return 'Good';
  return 'Poor';
}

function getGradeBg(grade: number): string {
  if (grade >= 9.5) return 'bg-yellow-500/10 border-yellow-500/30';
  if (grade >= 9) return 'bg-emerald-500/10 border-emerald-500/30';
  if (grade >= 8) return 'bg-sky-500/10 border-sky-500/30';
  if (grade >= 7) return 'bg-blue-500/10 border-blue-500/30';
  if (grade >= 6) return 'bg-zinc-500/10 border-zinc-500/30';
  return 'bg-orange-500/10 border-orange-500/30';
}

function getVerdict(psa: number): { text: string; detail: string; action: string } {
  if (psa >= 9.5) return {
    text: 'Potential Gem Mint!',
    detail: 'This card shows characteristics consistent with a PSA 10/BGS 9.5+ grade. High-value cards in this condition range command significant premiums.',
    action: 'Consider professional grading — the premium for gem mint grades is substantial.',
  };
  if (psa >= 9) return {
    text: 'Strong Candidate for Grading',
    detail: 'This card appears to be in mint condition. PSA 9 and BGS 9 grades are highly desirable and command good premiums over raw.',
    action: 'Grade if the card\'s raw value is $30+ — the graded premium will cover costs.',
  };
  if (psa >= 8) return {
    text: 'Decent Condition — Grade Selectively',
    detail: 'A PSA 8 NM-MT grade is respectable but the premium over raw is smaller. Consider the card\'s base value before grading.',
    action: 'Grade only if raw value is $75+ — otherwise the grading cost may not be worth it.',
  };
  if (psa >= 7) return {
    text: 'Moderate Condition',
    detail: 'This card shows enough wear to limit it to PSA 7 or below. Grading vintage cards at this level can still add value and authenticity.',
    action: 'Grade vintage cards ($100+ raw) for authentication. Modern cards at this grade are usually better sold raw.',
  };
  if (psa >= 5) return {
    text: 'Visible Wear — Hold or Enjoy',
    detail: 'This card shows noticeable wear consistent with PSA 5-6 range. Best for personal collections or vintage key cards where authentication matters.',
    action: 'Grade only high-value vintage keys for authentication and holder protection.',
  };
  return {
    text: 'Well-Loved Card',
    detail: 'Significant wear is present. This card is best enjoyed in a personal collection. Grading is typically not economical at this condition level.',
    action: 'Keep and enjoy — grading costs would exceed any premium at this grade level.',
  };
}

export default function ConditionGrader() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isVintage, setIsVintage] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const allScored = CRITERIA.every(c => scores[c.label] !== undefined);

  const grades = useMemo(() => {
    if (!allScored) return null;
    return calculateGrades(scores);
  }, [scores, allScored]);

  const verdict = useMemo(() => {
    if (!grades) return null;
    return getVerdict(grades.psa);
  }, [grades]);

  const handleScore = (label: string, value: number) => {
    setScores(prev => ({ ...prev, [label]: value }));
    // Auto-advance to next step
    if (currentStep < CRITERIA.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleReset = () => {
    setScores({});
    setCurrentStep(0);
    setShowResults(false);
    setIsVintage(false);
  };

  const progress = Object.keys(scores).length / CRITERIA.length;

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Assessment Progress</span>
          <span className="text-sm text-zinc-500">{Object.keys(scores).length}/{CRITERIA.length} criteria</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {CRITERIA.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setCurrentStep(i)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                currentStep === i
                  ? 'text-sky-400 bg-sky-500/10'
                  : scores[c.label] !== undefined
                    ? 'text-emerald-400'
                    : 'text-zinc-600'
              }`}
            >
              {scores[c.label] !== undefined ? '✓' : (i + 1)} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vintage Toggle */}
      <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
        <button
          onClick={() => setIsVintage(!isVintage)}
          className={`relative w-11 h-6 rounded-full transition-colors ${isVintage ? 'bg-amber-600' : 'bg-zinc-700'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isVintage ? 'translate-x-5' : ''}`}
          />
        </button>
        <div>
          <span className="text-white text-sm font-medium">Vintage Card (Pre-1980)</span>
          <p className="text-zinc-500 text-xs">Grading companies are more lenient on vintage. Results will be adjusted.</p>
        </div>
      </div>

      {/* Assessment Steps */}
      {!showResults && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-8 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center text-sm font-bold">
                {currentStep + 1}
              </span>
              <h3 className="text-xl font-bold text-white">{CRITERIA[currentStep].label}</h3>
              {scores[CRITERIA[currentStep].label] !== undefined && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Scored: {scores[CRITERIA[currentStep].label]}/10
                </span>
              )}
            </div>
            <p className="text-zinc-400 text-sm">{CRITERIA[currentStep].description}</p>
          </div>

          <div className="grid gap-2">
            {CRITERIA[currentStep].options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleScore(CRITERIA[currentStep].label, opt.value)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  scores[CRITERIA[currentStep].label] === opt.value
                    ? 'bg-sky-500/15 border-sky-500/50 text-white'
                    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      scores[CRITERIA[currentStep].label] === opt.value
                        ? 'bg-sky-500/30 text-sky-300'
                        : 'bg-zinc-700/50 text-zinc-400'
                    }`}>
                      {opt.value}
                    </span>
                    <div>
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                  {scores[CRITERIA[currentStep].label] === opt.value && (
                    <span className="text-sky-400 text-lg">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            {allScored && !showResults && (
              <button
                onClick={() => setShowResults(true)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm"
              >
                See Results →
              </button>
            )}
            <button
              onClick={() => {
                if (currentStep < CRITERIA.length - 1) {
                  setCurrentStep(prev => prev + 1);
                } else if (allScored) {
                  setShowResults(true);
                }
              }}
              disabled={currentStep === CRITERIA.length - 1 && !allScored}
              className="text-sm text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && grades && verdict && (
        <div className="space-y-6">
          {/* Grade Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'PSA', grade: grades.psa, company: 'Professional Sports Authenticator' },
              { label: 'BGS', grade: grades.bgs, company: 'Beckett Grading Services' },
              { label: 'CGC', grade: grades.cgc, company: 'Certified Guaranty Company' },
            ].map(({ label, grade, company }) => {
              const displayGrade = isVintage ? Math.min(10, grade + 0.5) : grade;
              return (
                <div key={label} className={`border rounded-xl p-5 text-center ${getGradeBg(displayGrade)}`}>
                  <div className="text-zinc-400 text-sm font-medium mb-1">{label}</div>
                  <div className={`text-4xl font-bold ${getGradeColor(displayGrade)}`}>
                    {displayGrade}
                  </div>
                  <div className="text-zinc-400 text-sm mt-1">{getGradeLabel(displayGrade)}</div>
                  <div className="text-zinc-600 text-xs mt-2">{company}</div>
                </div>
              );
            })}
          </div>

          {/* Sub-grades */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Sub-Grade Breakdown</h3>
            <div className="space-y-4">
              {CRITERIA.map((c) => {
                const score = scores[c.label] || 0;
                const vintageBonus = isVintage ? 0.5 : 0;
                const displayScore = Math.min(10, score + vintageBonus);
                return (
                  <div key={c.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-300">{c.label} ({Math.round(c.weight * 100)}% weight)</span>
                      <span className={`text-sm font-bold ${getGradeColor(displayScore)}`}>
                        {displayScore}/10
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          displayScore >= 9 ? 'bg-emerald-500' :
                          displayScore >= 7 ? 'bg-sky-500' :
                          displayScore >= 5 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${displayScore * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {isVintage && (
              <p className="text-amber-400/70 text-xs mt-4">
                * Vintage adjustment (+0.5) applied to all sub-grades. Grading companies are more lenient on pre-1980 cards.
              </p>
            )}
          </div>

          {/* Verdict */}
          <div className={`border rounded-xl p-6 ${getGradeBg(grades.psa)}`}>
            <h3 className={`text-xl font-bold ${getGradeColor(grades.psa)} mb-2`}>
              {verdict.text}
            </h3>
            <p className="text-zinc-300 text-sm mb-3">{verdict.detail}</p>
            <div className="bg-zinc-900/40 rounded-lg p-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Recommendation</span>
              <p className="text-white text-sm mt-1">{verdict.action}</p>
            </div>
          </div>

          {/* Grading Tips Based on Weakest Area */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">How to Improve This Grade</h3>
            <div className="space-y-3">
              {Object.entries(scores)
                .sort(([, a], [, b]) => a - b)
                .slice(0, 2)
                .map(([label, score]) => (
                  <div key={label} className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-orange-400 text-sm font-bold">Weakest: {label} ({score}/10)</span>
                    </div>
                    <p className="text-zinc-400 text-sm">
                      {label === 'Corners' && score < 9 && 'Corner issues are the most common reason for lower grades. Consider using a magnifying glass to verify condition before submitting. Sleeve cards immediately after purchasing.'}
                      {label === 'Edges' && score < 9 && 'Edge whitening often occurs from sliding cards across surfaces. Always handle from the top corners and use penny sleeves for protection.'}
                      {label === 'Surface' && score < 9 && 'Surface scratches can sometimes be from pack insertion. Modern cards with holo surfaces are especially prone. Hold cards by edges only.'}
                      {label === 'Centering' && score < 9 && 'Centering is a manufacturing issue — you can\'t improve it. When buying for grading, always check centering first. Use our Centering Calculator for precise measurements.'}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors text-sm border border-zinc-700"
            >
              Grade Another Card
            </button>
            <Link
              href="/tools/grading-roi"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Check Grading ROI →
            </Link>
            <Link
              href="/tools/centering-calc"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Centering Calculator →
            </Link>
            <Link
              href="/tools/grading-tracker"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Track Submission →
            </Link>
          </div>

          {/* Quick Reference */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">PSA Grade Quick Reference</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {[
                { grade: 'PSA 10', label: 'Gem Mint', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                { grade: 'PSA 9', label: 'Mint', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { grade: 'PSA 8', label: 'NM-MT', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
                { grade: 'PSA 7', label: 'Near Mint', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { grade: 'PSA 6', label: 'EX-MT', color: 'text-zinc-300 bg-zinc-500/10 border-zinc-500/20' },
                { grade: 'PSA 5', label: 'Excellent', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
                { grade: 'PSA 4', label: 'VG-EX', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
                { grade: 'PSA 3', label: 'Very Good', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                { grade: 'PSA 2', label: 'Good', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
                { grade: 'PSA 1', label: 'Poor', color: 'text-red-600 bg-red-500/10 border-red-500/20' },
              ].map(g => (
                <div key={g.grade} className={`p-2 rounded-lg border ${g.color}`}>
                  <div className="font-bold">{g.grade}</div>
                  <div className="opacity-70">{g.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
