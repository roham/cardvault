'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ---------- Types ---------- */

type Era = 'pre-war' | 'vintage' | 'junk-wax' | 'modern' | 'ultra-modern';
type Condition = 'mint' | 'good' | 'fair' | 'poor';
type Verdict = 'POTENTIAL GOLD MINE' | 'WORTH INVESTIGATING' | 'LIKELY COMMON' | 'JUNK WAX ERA' | 'COULD BE VALUABLE' | 'CHECK FOR GEMS';

interface EraInfo {
  id: Era;
  label: string;
  years: string;
  description: string;
  emoji: string;
  baseMultiplier: number;
  brands: string[];
  keysToLookFor: string[];
  commonPitfalls: string;
}

interface EvalResult {
  verdict: Verdict;
  verdictColor: string;
  estimatedRange: string;
  score: number; // 0-100
  factors: { label: string; impact: 'positive' | 'negative' | 'neutral'; detail: string }[];
  whatToLookFor: string[];
  nextSteps: string[];
}

/* ---------- Data ---------- */

const ERAS: EraInfo[] = [
  {
    id: 'pre-war',
    label: 'Pre-War',
    years: '1900 – 1941',
    description: 'T206, Goudey, Play Ball, Diamond Stars. Cards from this era are almost always valuable regardless of player.',
    emoji: '🏛️',
    baseMultiplier: 5.0,
    brands: ['T206 (1909-11)', 'T205 (1911)', 'Cracker Jack (1914-15)', 'Goudey (1933-34)', 'Diamond Stars (1934-36)', 'Play Ball (1939-41)', 'Other/Unknown Pre-War'],
    keysToLookFor: ['T206 Honus Wagner ($1M+)', 'T206 Eddie Plank ($100K+)', 'Goudey Babe Ruth #53, #149, #181 ($10K+)', 'Goudey Lou Gehrig #92, #160 ($5K+)', 'Play Ball Joe DiMaggio ($5K+)', 'Any T206 in good condition ($50-$500+)', 'Cracker Jack cards ($200+)'],
    commonPitfalls: 'Reprints are common. Check for modern paper stock, sharp corners (originals are usually rounded), and printing quality. Many "old-looking" cards are 1970s-80s reprints.',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    years: '1952 – 1979',
    description: 'The golden age. Topps dominated. Mickey Mantle, Hank Aaron, Roberto Clemente rookies. Condition is everything.',
    emoji: '⭐',
    baseMultiplier: 3.5,
    brands: ['Topps (1952-79)', 'Bowman (1948-55)', 'Fleer (1960-63)', 'O-Pee-Chee (1968-79)', 'Topps Basketball (1957-79)', 'Topps Football (1955-79)', 'Other/Unknown Vintage'],
    keysToLookFor: ['1952 Topps Mickey Mantle #311 ($50K+)', '1954 Topps Hank Aaron RC #128 ($5K+)', '1955 Topps Roberto Clemente RC #164 ($5K+)', '1968 Topps Nolan Ryan RC #177 ($3K+)', '1969 Topps Reggie Jackson RC #260 ($1K+)', '1957 Topps Bill Russell RC #77 ($2K+)', '1958 Topps Jim Brown RC #62 ($2K+)', 'Any Star HOFer in VG+ condition ($20-$500+)'],
    commonPitfalls: 'Trimming (cutting edges to look sharper) is the biggest issue. Also watch for color-added cards (someone painted over creases). A trimmed card is worth 10-20% of a genuine one.',
  },
  {
    id: 'junk-wax',
    label: 'Junk Wax',
    years: '1980 – 1994',
    description: 'Massively overproduced. Billions of cards printed. 99% of these are worth pennies. But there ARE exceptions.',
    emoji: '📦',
    baseMultiplier: 0.3,
    brands: ['Topps (1980-94)', 'Fleer (1981-94)', 'Donruss (1981-94)', 'Score (1988-94)', 'Upper Deck (1989-94)', 'Bowman (1989-94)', 'Stadium Club (1991-94)', 'Finest (1993-94)', 'SP (1993-94)'],
    keysToLookFor: ['1989 Upper Deck Ken Griffey Jr RC #1 ($50-$200)', '1986 Fleer Michael Jordan RC #57 ($3K+ raw)', '1984 Topps Dan Marino RC #123 ($50-$300)', '1979 O-Pee-Chee Wayne Gretzky RC #18 ($2K+)', '1986 Fleer Basketball Set (any card)', '1993 SP Derek Jeter RC #279 ($500+)', 'Topps Tiffany sets (limited print runs)', 'Error cards (1989 Fleer Billy Ripken, etc.)'],
    commonPitfalls: 'The #1 myth: "old = valuable." A 1988 Donruss commons box is worth $2-$5 total. Don\'t pay to grade junk wax commons. Focus only on rookies of HOFers and specific error cards.',
  },
  {
    id: 'modern',
    label: 'Modern',
    years: '1995 – 2010',
    description: 'Insert era. Refractors, autos, game-used jersey cards emerged. Low print-run parallels can be very valuable.',
    emoji: '💎',
    baseMultiplier: 1.5,
    brands: ['Topps Chrome (1996+)', 'Bowman Chrome (1997+)', 'Finest Refractors', 'SPx (1996+)', 'E-X (1996+)', 'Fleer/Ultra', 'Upper Deck SP Authentic', 'Panini Prizm (2012+)', 'Playoff Contenders'],
    keysToLookFor: ['Any refractor or numbered parallel (/25, /50, /100)', 'Autographed cards of current stars', 'Tom Brady 2000 rookies ($500-$50K+)', 'LeBron James 2003 rookies ($200-$10K+)', 'Albert Pujols 2001 rookies ($100-$2K+)', 'Sidney Crosby 2005 rookies ($100-$1K+)', 'Game-used jersey/patch cards of HOFers'],
    commonPitfalls: 'Base cards from this era are mostly worthless — the value is in the inserts and parallels. Check for serial numbers on the back (e.g., "023/100"). Those are the money cards.',
  },
  {
    id: 'ultra-modern',
    label: 'Ultra-Modern',
    years: '2011 – Present',
    description: 'Current hobby boom. Prizm, Optic, Bowman Chrome 1sts. Rookie cards of active stars drive the market.',
    emoji: '🔥',
    baseMultiplier: 1.8,
    brands: ['Panini Prizm', 'Topps Chrome', 'Bowman Chrome', 'Donruss Optic', 'Select', 'Mosaic', 'National Treasures', 'Flawless', 'Topps Flagship'],
    keysToLookFor: ['Any Prizm Silver or color parallel ($5-$1K+)', 'Bowman Chrome 1st autos ($10-$5K+)', 'Numbered parallels of star rookies', 'Rookie cards of: Trout, Ohtani, Wembanyama, Mahomes, Herbert', 'PSA 10 graded rookies', 'Case hits (1 per case autos/patches)'],
    commonPitfalls: 'Base cards of non-star players are worth $0.10-$0.50. The hobby is driven by rookies and parallels. A base Prizm of a bench player is not valuable just because it\'s Prizm.',
  },
];

const SPORTS = [
  { id: 'baseball', label: 'Baseball', emoji: '⚾' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'football', label: 'Football', emoji: '🏈' },
  { id: 'hockey', label: 'Hockey', emoji: '🏒' },
  { id: 'mixed', label: 'Mixed / Not Sure', emoji: '🃏' },
];

const CONDITIONS: { id: Condition; label: string; multiplier: number; description: string }[] = [
  { id: 'mint', label: 'Mint / Near Mint', multiplier: 3.0, description: 'Sharp corners, clean surfaces, stored in sleeves or binder pages' },
  { id: 'good', label: 'Good / Very Good', multiplier: 1.5, description: 'Minor wear on corners/edges, some surface marks, overall presentable' },
  { id: 'fair', label: 'Fair / Played With', multiplier: 0.5, description: 'Rounded corners, creases, rubber band marks, but card is intact' },
  { id: 'poor', label: 'Poor / Damaged', multiplier: 0.15, description: 'Major creases, tears, writing, water damage, or heavily worn' },
];

/* ---------- Evaluation Engine ---------- */

function evaluate(era: Era, sport: string, condition: Condition, hasStarPlayers: boolean, quantity: number, brand: string): EvalResult {
  const eraInfo = ERAS.find(e => e.id === era)!;
  const condInfo = CONDITIONS.find(c => c.id === condition)!;

  let score = 0;
  const factors: EvalResult['factors'] = [];

  // Era factor (biggest driver)
  score += eraInfo.baseMultiplier * 15;
  if (era === 'pre-war') {
    factors.push({ label: 'Pre-War Era', impact: 'positive', detail: 'Cards from before 1942 are almost always collectible. Even commons can be worth $10-$100+.' });
  } else if (era === 'vintage') {
    factors.push({ label: 'Vintage Era', impact: 'positive', detail: 'Golden age of card collecting. Star cards are highly valuable. Even commons of HOFers have value.' });
  } else if (era === 'junk-wax') {
    factors.push({ label: 'Junk Wax Era', impact: 'negative', detail: 'Billions of cards printed 1980-1994. Most are worth pennies. But specific rookies and errors can be worth hundreds.' });
  } else if (era === 'modern') {
    factors.push({ label: 'Modern Era', impact: 'neutral', detail: 'Value concentrated in inserts, refractors, and numbered parallels. Base cards are mostly worthless.' });
  } else {
    factors.push({ label: 'Ultra-Modern Era', impact: 'positive', detail: 'Active hobby boom. Rookie cards and parallels of stars can be very valuable.' });
  }

  // Condition factor
  score += condInfo.multiplier * 12;
  if (condition === 'mint') {
    factors.push({ label: 'Excellent Condition', impact: 'positive', detail: 'Cards in mint condition are worth 3-10x more than the same card in poor condition.' });
  } else if (condition === 'good') {
    factors.push({ label: 'Good Condition', impact: 'neutral', detail: 'Presentable cards still have solid market value, especially vintage and pre-war.' });
  } else if (condition === 'fair') {
    factors.push({ label: 'Fair Condition', impact: 'negative', detail: 'Visible wear reduces value significantly, but rare/vintage cards still have worth.' });
  } else {
    factors.push({ label: 'Poor Condition', impact: 'negative', detail: 'Damaged cards lose 80-90% of their value. Pre-war and vintage stars still worth checking.' });
  }

  // Star player factor
  if (hasStarPlayers) {
    score += 25;
    factors.push({ label: 'Star Players Present', impact: 'positive', detail: 'Recognizable Hall-of-Fame or current star players dramatically increase collection value.' });
  } else {
    score += 5;
    factors.push({ label: 'No Known Stars', impact: 'neutral', detail: 'Commons are less valuable, but you might have stars you don\'t recognize. Use our Card Identifier tool.' });
  }

  // Sport factor
  if (sport === 'baseball') {
    score += 8;
    factors.push({ label: 'Baseball Cards', impact: 'positive', detail: 'Baseball has the longest collecting tradition and deepest market. Vintage baseball is king.' });
  } else if (sport === 'basketball') {
    score += 10;
    factors.push({ label: 'Basketball Cards', impact: 'positive', detail: 'Basketball is the hottest sport in the current hobby. Even modern rookies command premiums.' });
  } else if (sport === 'football') {
    score += 7;
    factors.push({ label: 'Football Cards', impact: 'neutral', detail: 'Strong market for QB rookies and HOFers. Vintage football is undervalued compared to baseball.' });
  } else if (sport === 'hockey') {
    score += 5;
    factors.push({ label: 'Hockey Cards', impact: 'neutral', detail: 'Smaller market but passionate collectors. Gretzky, Lemieux, and vintage O-Pee-Chee are valuable.' });
  } else {
    score += 6;
    factors.push({ label: 'Mixed Collection', impact: 'neutral', detail: 'Multi-sport collections often contain hidden gems across categories. Sort by sport first.' });
  }

  // Brand factor
  const premiumBrands = ['T206', 'Goudey', 'Bowman (1948-55)', 'Topps Chrome', 'Bowman Chrome', 'Panini Prizm', 'SP (1993-94)', 'Finest', 'National Treasures', 'Flawless'];
  const isPremium = premiumBrands.some(b => brand.toLowerCase().includes(b.toLowerCase().split(' ')[0]));
  if (isPremium) {
    score += 10;
    factors.push({ label: 'Premium Brand', impact: 'positive', detail: `${brand} is a sought-after brand with strong collector demand and resale value.` });
  }

  // Quantity bonus (more cards = more chances for gems)
  if (quantity > 500) {
    score += 5;
    factors.push({ label: 'Large Collection', impact: 'positive', detail: 'With 500+ cards, statistical probability of finding valuable cards increases significantly.' });
  } else if (quantity > 100) {
    score += 3;
    factors.push({ label: 'Medium Collection', impact: 'neutral', detail: 'A decent-sized collection. Worth sorting through for star players and rookies.' });
  }

  // Cap score
  score = Math.min(100, Math.max(0, Math.round(score)));

  // Determine verdict
  let verdict: Verdict;
  let verdictColor: string;
  let estimatedRange: string;

  if (score >= 75) {
    verdict = 'POTENTIAL GOLD MINE';
    verdictColor = 'text-yellow-400 bg-yellow-950/60 border-yellow-700/50';
    estimatedRange = era === 'pre-war' ? '$500 – $100,000+' : era === 'vintage' ? '$200 – $50,000+' : '$100 – $10,000+';
  } else if (score >= 55) {
    verdict = 'WORTH INVESTIGATING';
    verdictColor = 'text-green-400 bg-green-950/60 border-green-700/50';
    estimatedRange = era === 'pre-war' ? '$100 – $10,000+' : era === 'vintage' ? '$50 – $5,000+' : '$20 – $2,000+';
  } else if (score >= 40) {
    verdict = era === 'junk-wax' ? 'JUNK WAX ERA' : 'CHECK FOR GEMS';
    verdictColor = era === 'junk-wax' ? 'text-orange-400 bg-orange-950/60 border-orange-700/50' : 'text-blue-400 bg-blue-950/60 border-blue-700/50';
    estimatedRange = era === 'junk-wax' ? '$5 – $500 (specific cards only)' : '$10 – $1,000+';
  } else {
    verdict = 'LIKELY COMMON';
    verdictColor = 'text-gray-400 bg-gray-800/60 border-gray-700/50';
    estimatedRange = '$1 – $50 total';
  }

  // Next steps
  const nextSteps = [
    'Sort cards by player — separate any names you recognize as famous',
    'Check for rookie cards (usually from a player\'s first year)',
    'Look for serial-numbered cards (e.g., "023/100" on the back)',
  ];
  if (era === 'pre-war' || era === 'vintage') {
    nextSteps.push('Handle carefully — even damaged vintage cards can be valuable');
    nextSteps.push('Consider professional authentication before selling');
  }
  if (era === 'junk-wax') {
    nextSteps.push('Focus ONLY on rookies of HOFers and known error cards');
    nextSteps.push('Don\'t pay to grade junk wax commons — it costs more than the card is worth');
  }
  if (condition === 'mint') {
    nextSteps.push('Consider PSA/BGS grading for any star rookies — a PSA 10 can be 5-50x raw value');
  }

  return {
    verdict,
    verdictColor,
    estimatedRange,
    score,
    factors,
    whatToLookFor: eraInfo.keysToLookFor,
    nextSteps,
  };
}

/* ---------- Component ---------- */

export default function VintageEvaluatorClient() {
  const [era, setEra] = useState<Era | null>(null);
  const [sport, setSport] = useState<string>('');
  const [condition, setCondition] = useState<Condition | null>(null);
  const [hasStars, setHasStars] = useState<boolean | null>(null);
  const [quantity, setQuantity] = useState<string>('50');
  const [brand, setBrand] = useState<string>('');
  const [showResult, setShowResult] = useState(false);

  const selectedEra = ERAS.find(e => e.id === era);

  const result = useMemo(() => {
    if (!era || !sport || !condition || hasStars === null) return null;
    return evaluate(era, sport, condition, hasStars, parseInt(quantity) || 50, brand);
  }, [era, sport, condition, hasStars, quantity, brand]);

  const handleEvaluate = () => {
    if (result) setShowResult(true);
  };

  const handleReset = () => {
    setEra(null);
    setSport('');
    setCondition(null);
    setHasStars(null);
    setQuantity('50');
    setBrand('');
    setShowResult(false);
  };

  const canEvaluate = era && sport && condition && hasStars !== null;

  return (
    <div className="space-y-8">
      {/* Step 1: Era */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
          <h2 className="text-lg font-bold text-white">When are your cards from?</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4">Select the era that best matches your cards. Not sure? Check the copyright year on the back.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ERAS.map(e => (
            <button
              key={e.id}
              onClick={() => { setEra(e.id); setBrand(''); }}
              className={`text-left p-4 rounded-xl border transition-all ${
                era === e.id
                  ? 'bg-blue-950/60 border-blue-600 ring-1 ring-blue-500'
                  : 'bg-gray-900/60 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{e.emoji}</span>
                <span className="text-white font-semibold">{e.label}</span>
              </div>
              <div className="text-blue-400 text-xs font-medium mb-1">{e.years}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{e.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Sport */}
      {era && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
            <h2 className="text-lg font-bold text-white">What sport?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {SPORTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSport(s.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  sport === s.id
                    ? 'bg-blue-950/60 border-blue-600 ring-1 ring-blue-500'
                    : 'bg-gray-900/60 border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl block mb-1">{s.emoji}</span>
                <span className="text-white text-sm font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Brand (optional) */}
      {era && sport && selectedEra && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">3</span>
            <h2 className="text-lg font-bold text-white">What brand or set? <span className="text-gray-500 font-normal text-sm">(optional)</span></h2>
          </div>
          <p className="text-gray-400 text-sm mb-3">Check the card front or back for the manufacturer name.</p>
          <div className="flex flex-wrap gap-2">
            {selectedEra.brands.map(b => (
              <button
                key={b}
                onClick={() => setBrand(brand === b ? '' : b)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  brand === b
                    ? 'bg-blue-950/60 border-blue-600 text-blue-300'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Condition */}
      {era && sport && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">4</span>
            <h2 className="text-lg font-bold text-white">What condition are they in?</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">Think about the average card in your collection, not the best or worst.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONDITIONS.map(c => (
              <button
                key={c.id}
                onClick={() => setCondition(c.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  condition === c.id
                    ? 'bg-blue-950/60 border-blue-600 ring-1 ring-blue-500'
                    : 'bg-gray-900/60 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-white font-semibold mb-1">{c.label}</div>
                <div className="text-gray-500 text-xs">{c.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Star Players + Quantity */}
      {era && sport && condition && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">5</span>
            <h2 className="text-lg font-bold text-white">A few more details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Do you recognize any famous players?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setHasStars(true)}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                    hasStars === true
                      ? 'bg-green-950/60 border-green-600 text-green-300'
                      : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  Yes, I see some famous names
                </button>
                <button
                  onClick={() => setHasStars(false)}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                    hasStars === false
                      ? 'bg-orange-950/60 border-orange-600 text-orange-300'
                      : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  No / Not sure
                </button>
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Approximately how many cards?</label>
              <div className="flex gap-3">
                {['10', '50', '100', '500', '1000'].map(q => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={`flex-1 p-2 rounded-lg border text-sm text-center transition-all ${
                      quantity === q
                        ? 'bg-blue-950/60 border-blue-600 text-blue-300'
                        : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {parseInt(q) >= 1000 ? '1,000+' : q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evaluate Button */}
      {canEvaluate && !showResult && (
        <button
          onClick={handleEvaluate}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-colors"
        >
          Evaluate My Cards
        </button>
      )}

      {/* Results */}
      {showResult && result && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div className={`border rounded-2xl p-6 text-center ${result.verdictColor}`}>
            <div className="text-3xl font-bold mb-2">{result.verdict}</div>
            <div className="text-lg opacity-80">Estimated Value Range: {result.estimatedRange}</div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-sm opacity-60">Confidence Score:</span>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${result.score}%`,
                    backgroundColor: result.score >= 75 ? '#facc15' : result.score >= 55 ? '#4ade80' : result.score >= 40 ? '#fb923c' : '#9ca3af',
                  }}
                />
              </div>
              <span className="text-sm font-bold">{result.score}/100</span>
            </div>
          </div>

          {/* Key Factors */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Key Factors</h3>
            <div className="space-y-3">
              {result.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`mt-0.5 text-lg ${
                    f.impact === 'positive' ? 'text-green-400' : f.impact === 'negative' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {f.impact === 'positive' ? '+' : f.impact === 'negative' ? '-' : '~'}
                  </span>
                  <div>
                    <div className="text-white font-medium text-sm">{f.label}</div>
                    <div className="text-gray-500 text-xs">{f.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What to Look For */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Cards to Look For in Your Collection</h3>
            <p className="text-gray-400 text-sm mb-3">These specific cards from your era are worth the most. Check if you have any:</p>
            <div className="space-y-2">
              {result.whatToLookFor.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-yellow-400 mt-0.5">$</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Pitfalls */}
          {selectedEra && (
            <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-red-300 mb-3">Watch Out For</h3>
              <p className="text-red-200/80 text-sm">{selectedEra.commonPitfalls}</p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">What To Do Next</h3>
            <div className="space-y-3">
              {result.nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpful Tools */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Tools to Help You</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/tools/identify" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
                <span className="text-xl">🔍</span>
                <div>
                  <div className="text-white text-sm font-medium">Card Identifier</div>
                  <div className="text-gray-500 text-xs">Find exactly which card you have</div>
                </div>
              </Link>
              <Link href="/tools/condition-grader" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
                <span className="text-xl">🏅</span>
                <div>
                  <div className="text-white text-sm font-medium">Condition Grader</div>
                  <div className="text-gray-500 text-xs">Estimate PSA/BGS grade</div>
                </div>
              </Link>
              <Link href="/tools/submission-planner" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
                <span className="text-xl">📋</span>
                <div>
                  <div className="text-white text-sm font-medium">Grading Planner</div>
                  <div className="text-gray-500 text-xs">Plan your grading submissions</div>
                </div>
              </Link>
              <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
                <span className="text-xl">📊</span>
                <div>
                  <div className="text-white text-sm font-medium">Grading ROI</div>
                  <div className="text-gray-500 text-xs">Is grading worth the cost?</div>
                </div>
              </Link>
              <Link href="/tools/collection-value" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
                <span className="text-xl">💰</span>
                <div>
                  <div className="text-white text-sm font-medium">Collection Value</div>
                  <div className="text-gray-500 text-xs">Estimate your total value</div>
                </div>
              </Link>
              <Link href="/tools/listing-generator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
                <span className="text-xl">📝</span>
                <div>
                  <div className="text-white text-sm font-medium">Listing Generator</div>
                  <div className="text-gray-500 text-xs">Create eBay listings</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Evaluate Again */}
          <button
            onClick={handleReset}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
          >
            Evaluate Different Cards
          </button>
        </div>
      )}

      {/* Educational Guide (always visible) */}
      {!showResult && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Understanding Card Value by Era</h2>
          <div className="space-y-4 text-sm text-gray-400">
            <div>
              <h3 className="text-white font-semibold mb-1">Pre-War (1900-1941) — Almost Always Valuable</h3>
              <p>Cards from this era survived wars, depressions, and 80+ years of attrition. Even commons from T206 (1909-11) sell for $20-$100. Star cards reach six or seven figures. If you have pre-war cards, treat them like antiques.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Vintage (1952-1979) — Condition Is King</h3>
              <p>The golden age of Topps. A 1952 Mantle in PSA 8 is worth $1M+. The same card in poor condition might be $5,000. Stars from this era (Aaron, Mays, Clemente, Bench) are always in demand. Even commons in high grade have value.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Junk Wax (1980-1994) — The Great Overproduction</h3>
              <p>Card companies printed billions of cards. Your 1988 Donruss box of 500 cards? Probably worth $3-5 total. BUT: 1986 Fleer Jordan ($3K+), 1989 UD Griffey ($100+), 1993 SP Jeter ($500+). The trick is knowing which needles to find in the haystack.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Modern (1995-2010) — It&apos;s All About the Inserts</h3>
              <p>Base cards are mostly worthless. The value is in refractors, autos, game-used cards, and low-numbered parallels. Check for serial numbers on the back. A base card might be $0.10 but the refractor parallel could be $100+.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Ultra-Modern (2011-Present) — The Boom</h3>
              <p>We&apos;re in a hobby renaissance. Rookie Prizm cards, Bowman Chrome 1st autos, and graded PSA 10s drive the market. Base cards of non-stars are still worthless, but a PSA 10 Wembanyama Prizm or Mahomes rookie can be worth thousands.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
