'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sealedProducts, calculateEV, type SealedProduct } from '@/data/sealed-products';

interface Recommendation {
  product: SealedProduct;
  ev: ReturnType<typeof calculateEV>;
  score: number;
  reasons: string[];
}

const sportOptions = [
  { value: 'all', label: 'Any Sport / Category', emoji: '🎯' },
  { value: 'baseball', label: 'Baseball', emoji: '⚾' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'football', label: 'Football', emoji: '🏈' },
  { value: 'hockey', label: 'Hockey', emoji: '🏒' },
  { value: 'pokemon', label: 'Pokemon', emoji: '⚡' },
];

const budgetOptions = [
  { value: 'low', label: 'Under $50', max: 50 },
  { value: 'mid', label: '$50 – $200', min: 30, max: 200 },
  { value: 'high', label: '$200 – $500', min: 150, max: 500 },
  { value: 'premium', label: '$500+', min: 400 },
];

const goalOptions = [
  { value: 'value', label: 'Best Value / ROI', desc: 'I want the best expected value for my money' },
  { value: 'fun', label: 'Most Fun to Open', desc: 'I want the most exciting ripping experience' },
  { value: 'rookies', label: 'Rookie Card Chase', desc: 'I want to pull the best rookie cards' },
  { value: 'autos', label: 'Autograph Hunting', desc: 'I want guaranteed autographs' },
  { value: 'budget', label: 'Casual / Budget', desc: 'I want affordable fun without breaking the bank' },
];

const experienceOptions = [
  { value: 'beginner', label: 'New to Cards', desc: 'Just getting started, want something approachable' },
  { value: 'intermediate', label: 'Some Experience', desc: 'I know the basics, ready for more' },
  { value: 'advanced', label: 'Experienced Collector', desc: 'I know what I want, show me the premium stuff' },
];

function scoreProduct(
  product: SealedProduct,
  ev: ReturnType<typeof calculateEV>,
  sport: string,
  budget: string,
  goal: string,
  experience: string
): { score: number; reasons: string[] } {
  let score = 50;
  const reasons: string[] = [];

  // Sport match
  if (sport !== 'all' && product.sport !== sport) return { score: 0, reasons: [] };

  // Budget match
  const bOpt = budgetOptions.find(b => b.value === budget);
  if (bOpt) {
    if (bOpt.max && product.retailPrice > bOpt.max * 1.2) return { score: 0, reasons: [] };
    if (bOpt.min && product.retailPrice < bOpt.min * 0.5) score -= 10;
    if (bOpt.max && product.retailPrice <= bOpt.max) {
      score += 15;
      reasons.push('Fits your budget');
    }
  }

  // EV-based scoring
  if (ev.roiPercent > 20) {
    score += 20;
    reasons.push(`Strong EV: +${ev.roiPercent.toFixed(0)}% ROI`);
  } else if (ev.roiPercent > 0) {
    score += 10;
    reasons.push('Positive expected value');
  } else if (ev.roiPercent < -30) {
    score -= 15;
  }

  // Goal-specific scoring
  switch (goal) {
    case 'value':
      score += Math.min(30, Math.max(-20, ev.roiPercent));
      if (ev.roiPercent > 10) reasons.push('Great value for money');
      break;
    case 'fun':
      score += product.packsPerBox * 0.5;
      if (product.packsPerBox >= 20) reasons.push(`${product.packsPerBox} packs = lots of ripping fun`);
      if (product.hitRates.length >= 4) {
        score += 10;
        reasons.push('Multiple hit types for variety');
      }
      break;
    case 'rookies':
      if (product.year >= 2024) {
        score += 15;
        reasons.push('Current-year rookies available');
      }
      if (product.description.toLowerCase().includes('rookie')) {
        score += 10;
        reasons.push('Strong rookie card content');
      }
      break;
    case 'autos':
      for (const hit of product.hitRates) {
        if (hit.insert.toLowerCase().includes('auto')) {
          const odds = hit.odds.match(/1:(\d+)/);
          const denom = odds ? parseInt(odds[1], 10) : 99;
          const expectedAutos = product.packsPerBox / denom;
          if (expectedAutos >= 1) {
            score += 25;
            reasons.push(`~${expectedAutos.toFixed(0)} guaranteed auto(s) per box`);
          }
          break;
        }
      }
      break;
    case 'budget':
      if (product.retailPrice <= 40) {
        score += 20;
        reasons.push('Budget-friendly price point');
      } else if (product.retailPrice <= 80) {
        score += 10;
        reasons.push('Moderate price point');
      } else {
        score -= product.retailPrice / 50;
      }
      break;
  }

  // Experience-specific
  switch (experience) {
    case 'beginner':
      if (product.type === 'blaster' || product.type === 'mega-box' || product.type === 'etb') {
        score += 15;
        reasons.push('Great format for beginners');
      }
      if (product.retailPrice <= 60) score += 10;
      break;
    case 'intermediate':
      if (product.type === 'hobby-box' && product.retailPrice <= 300) {
        score += 10;
        reasons.push('Hobby box with guaranteed hits');
      }
      break;
    case 'advanced':
      if (product.retailPrice >= 200) {
        score += 10;
        reasons.push('Premium product for serious collectors');
      }
      for (const hit of product.hitRates) {
        if (hit.avgValue >= 50) {
          score += 5;
          break;
        }
      }
      break;
  }

  // Product type bonus
  if (product.type === 'hobby-box') score += 5;

  // Freshness bonus for 2025 products
  if (product.year >= 2025) {
    score += 5;
    if (!reasons.some(r => r.includes('rookie'))) reasons.push('Latest release');
  }

  return { score, reasons: reasons.slice(0, 4) };
}

export default function OpenGuideClient() {
  const [sport, setSport] = useState('');
  const [budget, setBudget] = useState('');
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const step = !sport ? 1 : !budget ? 2 : !goal ? 3 : !experience ? 4 : 5;
  const canGenerate = sport && budget && goal && experience;

  function generate() {
    const scored: Recommendation[] = [];
    for (const product of sealedProducts) {
      const ev = calculateEV(product);
      const { score, reasons } = scoreProduct(product, ev, sport, budget, goal, experience);
      if (score > 0 && reasons.length > 0) {
        scored.push({ product, ev, score, reasons });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    setResults(scored.slice(0, 5));
  }

  function reset() {
    setSport('');
    setBudget('');
    setGoal('');
    setExperience('');
    setResults(null);
  }

  const roiColor = (roi: number) =>
    roi >= 20 ? 'text-green-400' : roi >= 0 ? 'text-yellow-400' : roi >= -20 ? 'text-orange-400' : 'text-red-400';

  return (
    <div>
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${s < step ? 'bg-blue-500' : s === step && !results ? 'bg-blue-500/50' : 'bg-gray-800'}`} />
        ))}
      </div>

      {!results ? (
        <div className="space-y-8">
          {/* Step 1: Sport */}
          <div>
            <h2 className="text-lg font-bold mb-3">1. What are you interested in?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sportOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSport(opt.value)}
                  className={`p-3 rounded-lg border text-left transition ${sport === opt.value ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
                >
                  <span className="text-xl mr-2">{opt.emoji}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Budget */}
          {sport && (
            <div>
              <h2 className="text-lg font-bold mb-3">2. What is your budget?</h2>
              <div className="grid grid-cols-2 gap-3">
                {budgetOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBudget(opt.value)}
                    className={`p-3 rounded-lg border text-left transition ${budget === opt.value ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
                  >
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Goal */}
          {budget && (
            <div>
              <h2 className="text-lg font-bold mb-3">3. What are you looking for?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`p-4 rounded-lg border text-left transition ${goal === opt.value ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Experience */}
          {goal && (
            <div>
              <h2 className="text-lg font-bold mb-3">4. How experienced are you?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {experienceOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExperience(opt.value)}
                    className={`p-4 rounded-lg border text-left transition ${experience === opt.value ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate */}
          {canGenerate && (
            <div className="text-center">
              <button
                onClick={generate}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
              >
                Get My Recommendations
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Results */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Top Picks</h2>
            <button onClick={reset} className="text-sm text-blue-400 hover:text-blue-300">
              Start Over
            </button>
          </div>

          {results.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 text-center">
              <p className="text-gray-400 mb-3">No products match your criteria. Try broadening your sport selection or budget range.</p>
              <button onClick={reset} className="text-blue-400 hover:text-blue-300 font-medium">
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((rec, idx) => (
                <div key={rec.product.slug} className={`bg-gray-900 rounded-lg p-5 border ${idx === 0 ? 'border-blue-500/50' : 'border-gray-800'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {idx === 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">#1 Pick</span>}
                        {idx === 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-bold">#2</span>}
                        {idx === 2 && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 font-bold">#3</span>}
                        {idx > 2 && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">#{idx + 1}</span>}
                      </div>
                      <Link href={`/products/${rec.product.slug}`} className="text-lg font-semibold hover:text-blue-400 transition">
                        {rec.product.name}
                      </Link>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-xl font-bold">${rec.product.retailPrice}</div>
                      <div className="text-xs text-gray-500">retail</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3">{rec.product.description}</p>

                  {/* Why this product */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rec.reasons.map((reason, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        {reason}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3 text-center text-sm">
                    <div>
                      <div className="font-bold text-blue-400">${Math.round(rec.ev.expectedValue)}</div>
                      <div className="text-xs text-gray-500">EV</div>
                    </div>
                    <div>
                      <div className={`font-bold ${roiColor(rec.ev.roiPercent)}`}>
                        {rec.ev.roiPercent >= 0 ? '+' : ''}{rec.ev.roiPercent.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">ROI</div>
                    </div>
                    <div>
                      <div className="font-bold">{rec.product.packsPerBox}</div>
                      <div className="text-xs text-gray-500">Packs</div>
                    </div>
                    <div>
                      <div className="font-bold">{rec.product.hitRates.length}</div>
                      <div className="text-xs text-gray-500">Hit Types</div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link href={`/products/${rec.product.slug}`} className="flex-1 text-center py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition">
                      View Details
                    </Link>
                    <a href={rec.product.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition">
                      Search eBay
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 text-xs text-gray-500 text-center">
            Recommendations are based on expected value analysis and your stated preferences. EV figures are estimates based on average pull rates and current market prices. Actual results will vary. Only spend what you can afford to lose.
          </div>
        </div>
      )}
    </div>
  );
}
