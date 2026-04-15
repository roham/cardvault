'use client';

import { useState, useMemo } from 'react';
import { sealedProducts, calculateEV } from '@/data/sealed-products';
import type { SealedProduct } from '@/data/sealed-products';

const sportLabels: Record<string, string> = {
  baseball: 'Baseball',
  basketball: 'Basketball',
  football: 'Football',
  hockey: 'Hockey',
  pokemon: 'Pokemon',
};

const typeLabels: Record<string, string> = {
  'hobby-box': 'Hobby Box',
  'blaster': 'Blaster',
  'mega-box': 'Mega Box',
  'hanger': 'Hanger',
  'fat-pack': 'Bundle / Fat Pack',
  'etb': 'Elite Trainer Box',
};

const sportColors: Record<string, { bg: string; border: string; text: string }> = {
  baseball: { bg: 'bg-red-950/30', border: 'border-red-800/50', text: 'text-red-400' },
  basketball: { bg: 'bg-orange-950/30', border: 'border-orange-800/50', text: 'text-orange-400' },
  football: { bg: 'bg-green-950/30', border: 'border-green-800/50', text: 'text-green-400' },
  hockey: { bg: 'bg-blue-950/30', border: 'border-blue-800/50', text: 'text-blue-400' },
  pokemon: { bg: 'bg-yellow-950/30', border: 'border-yellow-800/50', text: 'text-yellow-400' },
};

const horizons = [
  { label: '1 Year', years: 1 },
  { label: '3 Years', years: 3 },
  { label: '5 Years', years: 5 },
  { label: '10 Years', years: 10 },
];

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

function getAppreciationRate(product: SealedProduct): number {
  const currentYear = 2026;
  const productAge = currentYear - product.year;
  let baseRate = 0.05; // 5% base annual appreciation for sealed

  // Hobby boxes appreciate faster than retail
  if (product.type === 'hobby-box') baseRate = 0.08;
  else if (product.type === 'mega-box') baseRate = 0.06;

  // Older products appreciate faster (scarcity premium)
  if (productAge >= 10) baseRate += 0.06;
  else if (productAge >= 5) baseRate += 0.04;
  else if (productAge >= 3) baseRate += 0.02;

  // Pokemon has outsized sealed appreciation historically
  if (product.sport === 'pokemon') baseRate += 0.03;

  // Football hobby has strong sealed market
  if (product.sport === 'football' && product.type === 'hobby-box') baseRate += 0.02;

  return baseRate;
}

function projectSealedValue(currentPrice: number, annualRate: number, years: number): number {
  return currentPrice * Math.pow(1 + annualRate, years);
}

export default function RipOrHoldCalculator() {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<SealedProduct | null>(null);
  const [currentSealedPrice, setCurrentSealedPrice] = useState<string>('');
  const [selectedHorizon, setSelectedHorizon] = useState(1);

  const sports = useMemo(() => [...new Set(sealedProducts.map(p => p.sport))], []);
  const types = useMemo(() => [...new Set(sealedProducts.map(p => p.type))], []);

  const filteredProducts = useMemo(() => {
    return sealedProducts.filter(p => {
      if (selectedSport !== 'all' && p.sport !== selectedSport) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      return true;
    });
  }, [selectedSport, selectedType]);

  const sealedPrice = currentSealedPrice ? parseFloat(currentSealedPrice) : selectedProduct?.retailPrice ?? 0;

  const analysis = useMemo(() => {
    if (!selectedProduct || sealedPrice <= 0) return null;

    const evResult = calculateEV(selectedProduct);
    const ripEV = evResult.expectedValue;

    const appreciationRate = getAppreciationRate(selectedProduct);
    const projectedSealedValue = projectSealedValue(sealedPrice, appreciationRate, selectedHorizon);
    const sealedGain = projectedSealedValue - sealedPrice;
    const sealedROI = (sealedGain / sealedPrice) * 100;

    const ripNetValue = ripEV; // what you get from opening
    const holdNetValue = projectedSealedValue; // what sealed will be worth

    const difference = holdNetValue - ripNetValue;
    const verdict: 'rip' | 'hold' | 'toss-up' =
      difference > sealedPrice * 0.1 ? 'hold' :
      difference < -sealedPrice * 0.1 ? 'rip' :
      'toss-up';

    // Confidence: 0-100 based on how strongly the analysis points one direction
    const confidence = Math.min(100, Math.round((Math.abs(difference) / sealedPrice) * 200));

    // Tilt: -100 (full rip) to +100 (full hold)
    const tilt = Math.max(-100, Math.min(100, Math.round((difference / sealedPrice) * 200)));

    return {
      ripEV,
      ripROI: ((ripEV - sealedPrice) / sealedPrice) * 100,
      projectedSealedValue,
      sealedGain,
      sealedROI,
      appreciationRate,
      difference,
      verdict,
      confidence,
      tilt,
      hitBreakdown: evResult.hitBreakdown,
    };
  }, [selectedProduct, sealedPrice, selectedHorizon]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Sport / Category</label>
          <select
            value={selectedSport}
            onChange={(e) => { setSelectedSport(e.target.value); setSelectedProduct(null); }}
            className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {sports.map(s => <option key={s} value={s}>{sportLabels[s] || s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">Product Type</label>
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setSelectedProduct(null); }}
            className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{typeLabels[t] || t}</option>)}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map(product => {
          const ev = calculateEV(product);
          const colors = sportColors[product.sport] || sportColors.baseball;
          const isSelected = selectedProduct?.slug === product.slug;
          const rate = getAppreciationRate(product);
          return (
            <button
              key={product.slug}
              onClick={() => { setSelectedProduct(product); setCurrentSealedPrice(''); }}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.border} border ${colors.text}`}>
                  {sportLabels[product.sport]}
                </span>
                <span className="text-xs text-gray-500">{typeLabels[product.type]}</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 leading-tight">{product.name}</h3>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-gray-400 text-xs">Rip EV: <span className={ev.roi >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>{formatCurrency(ev.expectedValue)}</span></span>
                <span className="text-gray-400 text-xs">Appr: <span className="text-blue-400 font-medium">{(rate * 100).toFixed(0)}%/yr</span></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Analysis Panel */}
      {selectedProduct && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedProduct.name}</h3>
              <p className="text-gray-400 text-sm">{selectedProduct.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span>{selectedProduct.packsPerBox} packs x {selectedProduct.cardsPerPack} cards</span>
                <span>Released {selectedProduct.releaseDate}</span>
              </div>
            </div>
            <div className="shrink-0 space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Current Sealed Price</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={currentSealedPrice}
                    onChange={(e) => setCurrentSealedPrice(e.target.value)}
                    placeholder={selectedProduct.retailPrice.toString()}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-28 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1">Retail: ${selectedProduct.retailPrice}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">Time Horizon</label>
                <div className="flex gap-1">
                  {horizons.map(h => (
                    <button
                      key={h.years}
                      onClick={() => setSelectedHorizon(h.years)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedHorizon === h.years
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {analysis && (
            <>
              {/* Verdict Gauge */}
              <div className="relative bg-gray-800/50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <span className={`text-3xl font-black ${
                    analysis.verdict === 'rip' ? 'text-red-400' :
                    analysis.verdict === 'hold' ? 'text-blue-400' :
                    'text-amber-400'
                  }`}>
                    {analysis.verdict === 'rip' ? 'RIP IT' :
                     analysis.verdict === 'hold' ? 'HOLD IT' :
                     'TOSS-UP'}
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    {analysis.confidence}% confidence over {selectedHorizon} year{selectedHorizon > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Visual tilt bar */}
                <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 bg-gradient-to-r from-red-600/40 to-red-600/10" />
                    <div className="w-1/2 bg-gradient-to-l from-blue-600/40 to-blue-600/10" />
                  </div>
                  {/* Indicator */}
                  <div
                    className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg shadow-white/30 transition-all duration-500"
                    style={{ left: `${50 + analysis.tilt / 2}%`, transform: 'translateX(-50%)' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="text-red-400">RIP</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-blue-400">HOLD</span>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Rip Scenario */}
                <div className={`rounded-xl border p-5 ${
                  analysis.verdict === 'rip' ? 'border-red-500/50 bg-red-950/10' : 'border-gray-800 bg-gray-800/30'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">&#x1F4A5;</span>
                    <h4 className="text-white font-bold text-lg">Rip It</h4>
                    {analysis.verdict === 'rip' && (
                      <span className="ml-auto text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Expected pull value</span>
                      <span className="text-white font-semibold">{formatCurrency(analysis.ripEV)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Cost to open</span>
                      <span className="text-white font-semibold">{formatCurrency(sealedPrice)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                      <span className="text-gray-400">Net result</span>
                      <span className={`font-bold ${analysis.ripROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {analysis.ripROI >= 0 ? '+' : ''}{formatCurrency(analysis.ripEV - sealedPrice)} ({analysis.ripROI >= 0 ? '+' : ''}{analysis.ripROI.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-3">
                    Immediate value. You get the thrill of the rip plus whatever cards you pull. Results vary widely per box.
                  </p>
                </div>

                {/* Hold Scenario */}
                <div className={`rounded-xl border p-5 ${
                  analysis.verdict === 'hold' ? 'border-blue-500/50 bg-blue-950/10' : 'border-gray-800 bg-gray-800/30'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">&#x1F4E6;</span>
                    <h4 className="text-white font-bold text-lg">Hold It</h4>
                    {analysis.verdict === 'hold' && (
                      <span className="ml-auto text-xs font-semibold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current sealed value</span>
                      <span className="text-white font-semibold">{formatCurrency(sealedPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Projected ({selectedHorizon}yr)</span>
                      <span className="text-white font-semibold">{formatCurrency(analysis.projectedSealedValue)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 flex justify-between text-sm">
                      <span className="text-gray-400">Sealed gain</span>
                      <span className="text-blue-400 font-bold">
                        +{formatCurrency(analysis.sealedGain)} (+{analysis.sealedROI.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-3">
                    At {(analysis.appreciationRate * 100).toFixed(0)}% annual appreciation. Sealed products generally increase in value as supply decreases.
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-gray-800/30 rounded-xl p-5">
                <h4 className="text-white font-semibold text-sm mb-3">Why {analysis.verdict === 'rip' ? 'Rip' : analysis.verdict === 'hold' ? 'Hold' : 'It Could Go Either Way'}</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  {analysis.verdict === 'rip' ? (
                    <>
                      <p>The expected pull value ({formatCurrency(analysis.ripEV)}) exceeds the projected sealed appreciation over {selectedHorizon} year{selectedHorizon > 1 ? 's' : ''} ({formatCurrency(analysis.projectedSealedValue)}).</p>
                      <p>Even accounting for sealed product appreciation at {(analysis.appreciationRate * 100).toFixed(0)}% per year, you&apos;re better off opening and selling the hits. Plus, you get the entertainment value of the rip.</p>
                      <p className="text-amber-400/80 text-xs">Remember: EV is an average. Individual box results vary wildly. You might hit a massive card or get nothing.</p>
                    </>
                  ) : analysis.verdict === 'hold' ? (
                    <>
                      <p>The projected sealed value in {selectedHorizon} year{selectedHorizon > 1 ? 's' : ''} ({formatCurrency(analysis.projectedSealedValue)}) exceeds the expected rip value ({formatCurrency(analysis.ripEV)}) by {formatCurrency(analysis.difference)}.</p>
                      <p>This product appreciates at ~{(analysis.appreciationRate * 100).toFixed(0)}% annually sealed. {selectedProduct.type === 'hobby-box' ? 'Hobby boxes' : 'Sealed products'} from {selectedProduct.year} are getting scarcer, which supports continued price growth.</p>
                      <p className="text-amber-400/80 text-xs">Sealed investment requires patience and proper storage. Boxes should be stored in climate-controlled environments away from sunlight.</p>
                    </>
                  ) : (
                    <>
                      <p>The rip value ({formatCurrency(analysis.ripEV)}) and projected sealed value ({formatCurrency(analysis.projectedSealedValue)}) are within 10% of each other.</p>
                      <p>At this margin, go with your gut. If you enjoy the experience of opening, rip it. If you prefer the guaranteed slow appreciation, hold.</p>
                      <p className="text-amber-400/80 text-xs">When the math is close, the deciding factor is usually whether you value entertainment (rip) or security (hold).</p>
                    </>
                  )}
                </div>
              </div>

              {/* Key Factors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Product Age</p>
                  <p className="text-white font-bold text-lg">{2026 - selectedProduct.year}yr</p>
                  <p className="text-gray-600 text-xs">{2026 - selectedProduct.year >= 5 ? 'Vintage premium' : 'Modern release'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Appreciation Rate</p>
                  <p className="text-blue-400 font-bold text-lg">{(analysis.appreciationRate * 100).toFixed(0)}%</p>
                  <p className="text-gray-600 text-xs">per year sealed</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Rip EV vs Cost</p>
                  <p className={`font-bold text-lg ${analysis.ripROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {analysis.ripROI >= 0 ? '+' : ''}{analysis.ripROI.toFixed(0)}%
                  </p>
                  <p className="text-gray-600 text-xs">expected return</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">{selectedHorizon}yr Hold ROI</p>
                  <p className="text-blue-400 font-bold text-lg">+{analysis.sealedROI.toFixed(0)}%</p>
                  <p className="text-gray-600 text-xs">projected gain</p>
                </div>
              </div>

              {/* eBay link */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={selectedProduct.ebaySearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Check Sealed Prices on eBay
                </a>
              </div>
            </>
          )}
        </div>
      )}

      {/* Methodology */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl px-4 py-3">
        <p className="text-amber-300/80 text-sm">
          <strong className="font-semibold">How this works:</strong> We compare the Expected Value of opening a box (based on published hit rates and current card values) against the projected sealed appreciation over your selected time horizon. Sealed appreciation rates are estimated based on product type, age, sport, and historical hobby trends. Hobby boxes typically appreciate faster than retail products, and older sealed products command vintage premiums. These are estimates, not guarantees — actual appreciation depends on market conditions, player performance, and collector demand.
        </p>
      </div>
    </div>
  );
}
