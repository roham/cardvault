'use client';

import { useState, useMemo } from 'react';

interface GradingStandard {
  company: string;
  grade: string;
  maxRatio: number; // e.g. 60 means 60/40
  label: string;
  color: string;
  bgColor: string;
}

const gradingStandards: GradingStandard[] = [
  { company: 'PSA', grade: '10', maxRatio: 60, label: 'PSA 10 Gem Mint', color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
  { company: 'PSA', grade: '9', maxRatio: 65, label: 'PSA 9 Mint', color: 'text-blue-400', bgColor: 'bg-blue-500' },
  { company: 'PSA', grade: '8', maxRatio: 70, label: 'PSA 8 NM-MT', color: 'text-amber-400', bgColor: 'bg-amber-500' },
  { company: 'PSA', grade: '7', maxRatio: 75, label: 'PSA 7 NM', color: 'text-orange-400', bgColor: 'bg-orange-500' },
  { company: 'BGS', grade: '10', maxRatio: 55, label: 'BGS 10 Pristine', color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
  { company: 'BGS', grade: '9.5', maxRatio: 60, label: 'BGS 9.5 Gem Mint', color: 'text-sky-400', bgColor: 'bg-sky-500' },
  { company: 'BGS', grade: '9', maxRatio: 65, label: 'BGS 9 Mint', color: 'text-blue-400', bgColor: 'bg-blue-500' },
  { company: 'CGC', grade: '10', maxRatio: 55, label: 'CGC 10 Pristine', color: 'text-emerald-400', bgColor: 'bg-emerald-500' },
  { company: 'CGC', grade: '9.5', maxRatio: 60, label: 'CGC 9.5 Gem Mint', color: 'text-sky-400', bgColor: 'bg-sky-500' },
  { company: 'CGC', grade: '9', maxRatio: 65, label: 'CGC 9 Mint', color: 'text-blue-400', bgColor: 'bg-blue-500' },
];

function calculateRatio(a: number, b: number): { ratio: string; percentage: number } {
  if (a <= 0 || b <= 0) return { ratio: '50/50', percentage: 50 };
  const total = a + b;
  const smaller = Math.min(a, b);
  const larger = Math.max(a, b);
  const pctSmaller = Math.round((smaller / total) * 100);
  const pctLarger = 100 - pctSmaller;
  return { ratio: `${pctLarger}/${pctSmaller}`, percentage: pctLarger };
}

export default function CenteringCalculator() {
  const [leftBorder, setLeftBorder] = useState('');
  const [rightBorder, setRightBorder] = useState('');
  const [topBorder, setTopBorder] = useState('');
  const [bottomBorder, setBottomBorder] = useState('');
  const [unit, setUnit] = useState<'mm' | 'inches'>('mm');
  const [selectedCompany, setSelectedCompany] = useState<'PSA' | 'BGS' | 'CGC'>('PSA');

  const left = parseFloat(leftBorder) || 0;
  const right = parseFloat(rightBorder) || 0;
  const top = parseFloat(topBorder) || 0;
  const bottom = parseFloat(bottomBorder) || 0;

  const hasInput = left > 0 && right > 0 && top > 0 && bottom > 0;

  const analysis = useMemo(() => {
    if (!hasInput) return null;

    const lr = calculateRatio(left, right);
    const tb = calculateRatio(top, bottom);
    const worstRatio = Math.max(lr.percentage, tb.percentage);

    const companyStandards = gradingStandards.filter(s => s.company === selectedCompany);
    const passedGrades = companyStandards.filter(s => worstRatio <= s.maxRatio);
    const bestGrade = passedGrades.length > 0 ? passedGrades[0] : null;
    const failedGrades = companyStandards.filter(s => worstRatio > s.maxRatio);

    return { lr, tb, worstRatio, bestGrade, passedGrades, failedGrades, companyStandards };
  }, [left, right, top, bottom, selectedCompany, hasInput]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Measure Your Card Borders</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Measure the border width on each side of your card using a ruler or centering tool. Enter the measurements below.
        </p>

        {/* Unit Toggle */}
        <div className="flex gap-2 mb-6">
          {(['mm', 'inches'] as const).map(u => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                unit === u
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-700/50'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {u === 'mm' ? 'Millimeters' : 'Inches'}
            </button>
          ))}
        </div>

        {/* Visual Card Preview + Inputs */}
        <div className="flex flex-col items-center gap-6">
          {/* Card Diagram */}
          <div className="relative w-64 h-80 sm:w-80 sm:h-96">
            {/* Card border */}
            <div className="absolute inset-0 border-2 border-zinc-600 rounded-lg bg-zinc-800/50">
              {/* Inner "image" area */}
              <div
                className="absolute bg-zinc-700/50 border border-dashed border-zinc-500 rounded"
                style={{
                  left: hasInput ? `${(left / (left + right)) * 100}%` : '15%',
                  right: hasInput ? `${(right / (left + right)) * 100}%` : '15%',
                  top: hasInput ? `${(top / (top + bottom)) * 100}%` : '12%',
                  bottom: hasInput ? `${(bottom / (top + bottom)) * 100}%` : '12%',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">
                  Card Image
                </div>
              </div>
            </div>

            {/* Top measurement */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <input
                type="number"
                placeholder="Top"
                value={topBorder}
                onChange={e => setTopBorder(e.target.value)}
                className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm text-center placeholder:text-zinc-600"
                step="0.1"
                min="0"
              />
            </div>

            {/* Bottom measurement */}
            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
              <input
                type="number"
                placeholder="Bottom"
                value={bottomBorder}
                onChange={e => setBottomBorder(e.target.value)}
                className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm text-center placeholder:text-zinc-600"
                step="0.1"
                min="0"
              />
            </div>

            {/* Left measurement */}
            <div className="absolute top-1/2 -left-24 -translate-y-1/2">
              <input
                type="number"
                placeholder="Left"
                value={leftBorder}
                onChange={e => setLeftBorder(e.target.value)}
                className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm text-center placeholder:text-zinc-600"
                step="0.1"
                min="0"
              />
            </div>

            {/* Right measurement */}
            <div className="absolute top-1/2 -right-24 -translate-y-1/2">
              <input
                type="number"
                placeholder="Right"
                value={rightBorder}
                onChange={e => setRightBorder(e.target.value)}
                className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-sm text-center placeholder:text-zinc-600"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <p className="text-zinc-500 text-xs">
            Enter border measurements in {unit}. Use a ruler, centering tool, or eyeball estimate.
          </p>
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          {/* Company Selector */}
          <div className="flex gap-2 mb-6">
            {(['PSA', 'BGS', 'CGC'] as const).map(company => (
              <button
                key={company}
                onClick={() => setSelectedCompany(company)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedCompany === company
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-700/50'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                }`}
              >
                {company}
              </button>
            ))}
          </div>

          {/* Centering Ratios */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
              <div className="text-zinc-400 text-sm mb-1">Left — Right</div>
              <div className={`text-2xl font-bold ${
                analysis.lr.percentage <= 60 ? 'text-emerald-400' :
                analysis.lr.percentage <= 65 ? 'text-blue-400' :
                analysis.lr.percentage <= 70 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {analysis.lr.ratio}
              </div>
              <div className="mt-2 h-3 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-sky-500 transition-all"
                    style={{ width: `${Math.min(left, right) / (left + right) * 100}%` }}
                  />
                  <div className="flex-1 bg-zinc-600" />
                  <div
                    className="bg-sky-500 transition-all"
                    style={{ width: `${Math.min(left, right) / (left + right) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-zinc-500 text-xs mt-1">
                <span>{left}{unit === 'mm' ? 'mm' : '"'}</span>
                <span>{right}{unit === 'mm' ? 'mm' : '"'}</span>
              </div>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
              <div className="text-zinc-400 text-sm mb-1">Top — Bottom</div>
              <div className={`text-2xl font-bold ${
                analysis.tb.percentage <= 60 ? 'text-emerald-400' :
                analysis.tb.percentage <= 65 ? 'text-blue-400' :
                analysis.tb.percentage <= 70 ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {analysis.tb.ratio}
              </div>
              <div className="mt-2 h-3 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-sky-500 transition-all"
                    style={{ width: `${Math.min(top, bottom) / (top + bottom) * 100}%` }}
                  />
                  <div className="flex-1 bg-zinc-600" />
                  <div
                    className="bg-sky-500 transition-all"
                    style={{ width: `${Math.min(top, bottom) / (top + bottom) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-zinc-500 text-xs mt-1">
                <span>{top}{unit === 'mm' ? 'mm' : '"'}</span>
                <span>{bottom}{unit === 'mm' ? 'mm' : '"'}</span>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div className={`rounded-xl p-6 mb-6 border ${
            analysis.bestGrade && analysis.bestGrade.grade === '10'
              ? 'bg-emerald-950/30 border-emerald-800/50'
              : analysis.bestGrade
              ? 'bg-sky-950/30 border-sky-800/50'
              : 'bg-red-950/30 border-red-800/50'
          }`}>
            {analysis.bestGrade ? (
              <>
                <div className={`text-2xl font-bold mb-2 ${analysis.bestGrade.color}`}>
                  Centering passes for {analysis.bestGrade.label}
                </div>
                <p className="text-zinc-300">
                  Your worst axis is {analysis.worstRatio}/{100 - analysis.worstRatio}, which meets
                  the {analysis.bestGrade.maxRatio}/{100 - analysis.bestGrade.maxRatio} threshold
                  for {analysis.bestGrade.label}.
                  {analysis.bestGrade.grade === '10' && ' Perfect centering! This card has strong 10 potential (assuming corners, edges, and surface are clean).'}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold mb-2 text-red-400">
                  Centering fails for {selectedCompany} {analysis.companyStandards[analysis.companyStandards.length - 1]?.grade || '9'}+
                </div>
                <p className="text-zinc-300">
                  Your worst axis is {analysis.worstRatio}/{100 - analysis.worstRatio}. This exceeds the
                  maximum threshold for the lowest tracked grade. Centering alone will limit this card.
                </p>
              </>
            )}
          </div>

          {/* Grade Threshold Table */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">{selectedCompany} Centering Thresholds</h3>
            <div className="space-y-2">
              {analysis.companyStandards.map(standard => {
                const passes = analysis.worstRatio <= standard.maxRatio;
                return (
                  <div key={`${standard.company}-${standard.grade}`} className="flex items-center gap-3">
                    <div className="w-24 text-sm font-medium text-white">{standard.label.split(' ').slice(-2).join(' ')}</div>
                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${passes ? standard.bgColor : 'bg-zinc-600'}`}
                        style={{ width: `${(standard.maxRatio / 80) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm text-zinc-400">{standard.maxRatio}/{100 - standard.maxRatio}</div>
                    <div className={`w-8 text-center text-lg ${passes ? 'text-emerald-400' : 'text-red-400'}`}>
                      {passes ? '\u2713' : '\u2717'}
                    </div>
                  </div>
                );
              })}
              {/* Your card marker */}
              <div className="flex items-center gap-3 border-t border-zinc-700 pt-2">
                <div className="w-24 text-sm font-bold text-sky-400">Your Card</div>
                <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500"
                    style={{ width: `${(analysis.worstRatio / 80) * 100}%` }}
                  />
                </div>
                <div className="w-16 text-right text-sm font-bold text-sky-400">
                  {analysis.worstRatio}/{100 - analysis.worstRatio}
                </div>
                <div className="w-8" />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
            <h3 className="text-white font-medium text-sm mb-2">Centering Tips</h3>
            <ul className="text-zinc-400 text-xs space-y-1">
              <li>- Centering is just ONE sub-grade. Corners, edges, and surface also matter for the final grade.</li>
              <li>- Use a centering tool or penny sleeve as a reference — eye estimates can be off by 5-10%.</li>
              <li>- Modern cards are generally better centered than vintage. Vintage cards get more centering leniency.</li>
              <li>- If centering is borderline, consider BGS or CGC — their sub-grade system can still yield a high overall grade.</li>
              <li>- Some collectors specifically seek off-center vintage cards for their character and uniqueness.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Reference */}
      {!analysis && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Reference: Centering Standards</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { company: 'PSA', rows: [
                { grade: 'PSA 10', ratio: '60/40 or better', color: 'text-emerald-400' },
                { grade: 'PSA 9', ratio: '65/35 or better', color: 'text-blue-400' },
                { grade: 'PSA 8', ratio: '70/30 or better', color: 'text-amber-400' },
              ]},
              { company: 'BGS', rows: [
                { grade: 'BGS 10', ratio: '55/45 or better', color: 'text-emerald-400' },
                { grade: 'BGS 9.5', ratio: '60/40 or better', color: 'text-sky-400' },
                { grade: 'BGS 9', ratio: '65/35 or better', color: 'text-blue-400' },
              ]},
              { company: 'CGC', rows: [
                { grade: 'CGC 10', ratio: '55/45 or better', color: 'text-emerald-400' },
                { grade: 'CGC 9.5', ratio: '60/40 or better', color: 'text-sky-400' },
                { grade: 'CGC 9', ratio: '65/35 or better', color: 'text-blue-400' },
              ]},
            ].map(section => (
              <div key={section.company} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                <h3 className="text-white font-semibold mb-3">{section.company}</h3>
                <div className="space-y-2">
                  {section.rows.map(row => (
                    <div key={row.grade} className="flex justify-between text-sm">
                      <span className={row.color}>{row.grade}</span>
                      <span className="text-zinc-400">{row.ratio}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
