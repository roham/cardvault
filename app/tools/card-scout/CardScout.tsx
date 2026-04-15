'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

/* ───── Types & Constants ───── */
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Era = 'all' | 'vintage' | 'junk' | 'modern' | 'ultra-modern';
type Budget = 'all' | 'under10' | '10to50' | '50to200' | '200to1k' | '1kto10k' | 'over10k';
type Style = 'all' | 'investor' | 'flipper' | 'completionist' | 'rookie-hunter' | 'vintage-collector';

interface ScoutResult {
  card: SportsCard;
  score: number;
  reasons: string[];
  rawMid: number;
}

const SPORTS: { value: Sport; label: string; icon: string }[] = [
  { value: 'all', label: 'All Sports', icon: '🏆' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'football', label: 'Football', icon: '🏈' },
  { value: 'hockey', label: 'Hockey', icon: '🏒' },
];

const ERAS: { value: Era; label: string; range: string }[] = [
  { value: 'all', label: 'Any Era', range: '' },
  { value: 'vintage', label: 'Vintage', range: 'Pre-1980' },
  { value: 'junk', label: 'Junk Wax', range: '1980–1995' },
  { value: 'modern', label: 'Modern', range: '1996–2019' },
  { value: 'ultra-modern', label: 'Ultra-Modern', range: '2020+' },
];

const BUDGETS: { value: Budget; label: string; min: number; max: number }[] = [
  { value: 'all', label: 'Any Budget', min: 0, max: Infinity },
  { value: 'under10', label: 'Under $10', min: 0, max: 10 },
  { value: '10to50', label: '$10 – $50', min: 10, max: 50 },
  { value: '50to200', label: '$50 – $200', min: 50, max: 200 },
  { value: '200to1k', label: '$200 – $1K', min: 200, max: 1000 },
  { value: '1kto10k', label: '$1K – $10K', min: 1000, max: 10000 },
  { value: 'over10k', label: '$10K+', min: 10000, max: Infinity },
];

const STYLES: { value: Style; label: string; desc: string; icon: string }[] = [
  { value: 'all', label: 'Any Style', desc: 'Show everything', icon: '🎯' },
  { value: 'investor', label: 'Investor', desc: 'High grading ROI & appreciation', icon: '📈' },
  { value: 'flipper', label: 'Flipper', desc: 'Quick resale opportunity', icon: '💸' },
  { value: 'completionist', label: 'Completionist', desc: 'Set builders & collectors', icon: '📋' },
  { value: 'rookie-hunter', label: 'Rookie Hunter', desc: 'First-year cards of rising stars', icon: '⭐' },
  { value: 'vintage-collector', label: 'Vintage', desc: 'Pre-1980 classics & HOFers', icon: '🏛️' },
];

/* ───── Helpers ───── */
function parseMidpoint(value: string): number | null {
  const cleaned = value.replace(/\s*\(.*?\)\s*/g, '').trim();
  const singlePlus = cleaned.match(/^\$([0-9,]+)\+?$/);
  if (singlePlus) return parseFloat(singlePlus[1].replace(/,/g, ''));
  const range = cleaned.match(/^\$([0-9,]+(?:\.\d+)?)\s*[-–]\s*\$([0-9,]+(?:\.\d+)?)$/);
  if (range) {
    const low = parseFloat(range[1].replace(/,/g, ''));
    const high = parseFloat(range[2].replace(/,/g, ''));
    return (low + high) / 2;
  }
  return null;
}

function getEra(year: number): Era {
  if (year < 1980) return 'vintage';
  if (year <= 1995) return 'junk';
  if (year <= 2019) return 'modern';
  return 'ultra-modern';
}

function getGradingMultiplier(rawMid: number, gemMid: number): number {
  if (!rawMid || rawMid <= 0) return 1;
  return gemMid / rawMid;
}

function scoreCard(card: SportsCard, rawMid: number, gemMid: number, style: Style): { score: number; reasons: string[] } {
  let score = 50; // base
  const reasons: string[] = [];
  const mult = getGradingMultiplier(rawMid, gemMid);
  const era = getEra(card.year);

  // Universal scoring
  if (card.rookie) { score += 15; reasons.push('Rookie card'); }

  if (style === 'investor' || style === 'all') {
    if (mult >= 10) { score += 25; reasons.push(`${mult.toFixed(0)}x grading ROI`); }
    else if (mult >= 5) { score += 15; reasons.push(`${mult.toFixed(0)}x grading ROI`); }
    else if (mult >= 3) { score += 8; reasons.push(`${mult.toFixed(1)}x grading ROI`); }
    if (card.rookie && card.year >= 2022) { score += 10; reasons.push('Recent rookie — upside'); }
  }

  if (style === 'flipper' || style === 'all') {
    if (rawMid >= 5 && rawMid <= 100 && mult >= 3) { score += 15; reasons.push('Sweet spot for flipping'); }
    if (rawMid >= 20 && rawMid <= 200) { score += 5; reasons.push('Active price range on eBay'); }
  }

  if (style === 'completionist') {
    if (rawMid < 20) { score += 10; reasons.push('Affordable set filler'); }
    if (!card.rookie) { score += 5; reasons.push('Non-rookie — less competition'); }
  }

  if (style === 'rookie-hunter') {
    if (card.rookie) { score += 30; reasons.push('First-year card'); }
    if (card.year >= 2023) { score += 15; reasons.push('Current/recent rookie class'); }
    if (card.year >= 2020 && card.year < 2023) { score += 8; reasons.push('Young player — still developing'); }
  }

  if (style === 'vintage-collector') {
    if (era === 'vintage') { score += 30; reasons.push('Pre-1980 vintage'); }
    if (card.year < 1970) { score += 15; reasons.push('Pre-1970 classic'); }
    if (card.year < 1960) { score += 10; reasons.push('Pre-1960 golden age'); }
  }

  // Value tier bonus
  if (rawMid >= 1000) { score += 5; reasons.push('High-value card'); }
  if (rawMid >= 10000) { score += 5; reasons.push('Premium tier'); }

  return { score: Math.min(score, 100), reasons: [...new Set(reasons)] };
}

/* ───── Component ───── */
export default function CardScout() {
  const [sport, setSport] = useState<Sport>('all');
  const [era, setEra] = useState<Era>('all');
  const [budget, setBudget] = useState<Budget>('all');
  const [style, setStyle] = useState<Style>('all');
  const [playerSearch, setPlayerSearch] = useState('');
  const [showCount, setShowCount] = useState(20);

  const results: ScoutResult[] = useMemo(() => {
    const budgetRange = BUDGETS.find(b => b.value === budget) || BUDGETS[0];

    return sportsCards
      .map(card => {
        const rawMid = parseMidpoint(card.estimatedValueRaw);
        const gemMid = parseMidpoint(card.estimatedValueGem);
        if (!rawMid || rawMid <= 0) return null;

        // Filters
        if (sport !== 'all' && card.sport !== sport) return null;
        if (era !== 'all' && getEra(card.year) !== era) return null;
        if (budget !== 'all' && (rawMid < budgetRange.min || rawMid >= budgetRange.max)) return null;
        if (playerSearch && !card.player.toLowerCase().includes(playerSearch.toLowerCase()) && !card.name.toLowerCase().includes(playerSearch.toLowerCase())) return null;

        const { score, reasons } = scoreCard(card, rawMid, gemMid || rawMid, style);
        return { card, score, reasons, rawMid };
      })
      .filter((r): r is ScoutResult => r !== null)
      .sort((a, b) => b.score - a.score || b.rawMid - a.rawMid)
      .slice(0, showCount);
  }, [sport, era, budget, style, playerSearch, showCount]);

  const totalMatches = useMemo(() => {
    const budgetRange = BUDGETS.find(b => b.value === budget) || BUDGETS[0];
    return sportsCards.filter(card => {
      const rawMid = parseMidpoint(card.estimatedValueRaw);
      if (!rawMid || rawMid <= 0) return false;
      if (sport !== 'all' && card.sport !== sport) return false;
      if (era !== 'all' && getEra(card.year) !== era) return false;
      if (budget !== 'all' && (rawMid < budgetRange.min || rawMid >= budgetRange.max)) return false;
      if (playerSearch && !card.player.toLowerCase().includes(playerSearch.toLowerCase()) && !card.name.toLowerCase().includes(playerSearch.toLowerCase())) return false;
      return true;
    }).length;
  }, [sport, era, budget, playerSearch]);

  // Surprise me — random filters
  const surpriseMe = () => {
    const sports: Sport[] = ['baseball', 'basketball', 'football', 'hockey'];
    const eras: Era[] = ['vintage', 'junk', 'modern', 'ultra-modern'];
    const styles: Style[] = ['investor', 'flipper', 'completionist', 'rookie-hunter', 'vintage-collector'];
    setSport(sports[Math.floor(Math.random() * sports.length)]);
    setEra(eras[Math.floor(Math.random() * eras.length)]);
    setStyle(styles[Math.floor(Math.random() * styles.length)]);
    setBudget('all');
    setPlayerSearch('');
    setShowCount(20);
  };

  const resetFilters = () => {
    setSport('all');
    setEra('all');
    setBudget('all');
    setStyle('all');
    setPlayerSearch('');
    setShowCount(20);
  };

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={surpriseMe}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Surprise Me
        </button>
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 space-y-6">
        {/* Player search */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Search by Player or Card Name</label>
          <input
            type="text"
            value={playerSearch}
            onChange={e => setPlayerSearch(e.target.value)}
            placeholder="e.g., Mike Trout, 1952 Topps, Wembanyama..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
          />
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSport(s.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sport === s.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Era */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Era</label>
          <div className="flex flex-wrap gap-2">
            {ERAS.map(e => (
              <button
                key={e.value}
                onClick={() => setEra(e.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  era === e.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                {e.label} {e.range && <span className="text-xs opacity-70 ml-1">({e.range})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Budget (Raw Card Value)</label>
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map(b => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  budget === b.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Collector Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`px-3 py-3 rounded-lg text-left transition-colors ${
                  style === s.value
                    ? 'bg-emerald-600/20 border-2 border-emerald-500 text-white'
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                <div className="text-sm font-medium">{s.icon} {s.label}</div>
                <div className="text-xs opacity-60 mt-0.5">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Showing <span className="text-white font-semibold">{results.length}</span> of{' '}
          <span className="text-white font-semibold">{totalMatches.toLocaleString()}</span> matching cards
        </span>
        <span className="text-xs text-gray-500">Sorted by recommendation score</span>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-white mb-2">No cards match your filters</h3>
          <p className="text-gray-400 text-sm mb-4">Try broadening your search — adjust sport, era, or budget range.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r, i) => {
            const gemMid = parseMidpoint(r.card.estimatedValueGem);
            const mult = gemMid && r.rawMid > 0 ? (gemMid / r.rawMid) : null;
            const sportColors: Record<string, string> = {
              baseball: 'border-red-800/50 bg-red-950/20',
              basketball: 'border-orange-800/50 bg-orange-950/20',
              football: 'border-green-800/50 bg-green-950/20',
              hockey: 'border-blue-800/50 bg-blue-950/20',
            };
            const sportIcons: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

            return (
              <div
                key={r.card.slug}
                className={`border rounded-xl p-4 sm:p-5 transition-colors hover:border-gray-600 ${sportColors[r.card.sport] || 'border-gray-700/50 bg-gray-800/30'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">#{i + 1}</span>
                      <span className="text-xs text-gray-500">{sportIcons[r.card.sport]} {r.card.sport.charAt(0).toUpperCase() + r.card.sport.slice(1)}</span>
                      {r.card.rookie && <span className="text-xs font-medium text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded">RC</span>}
                      <span className="text-xs text-gray-600">Score: {r.score}</span>
                    </div>
                    <Link href={`/sports/${r.card.slug}`} className="text-white font-semibold hover:text-emerald-400 transition-colors text-sm sm:text-base">
                      {r.card.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">{r.card.player} &middot; {r.card.set}</div>

                    {/* Reasons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {r.reasons.map((reason, j) => (
                        <span key={j} className="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price column */}
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-500 mb-0.5">Raw</div>
                    <div className="text-sm font-semibold text-white">{r.card.estimatedValueRaw}</div>
                    {mult && mult > 1 && (
                      <>
                        <div className="text-xs text-gray-500 mt-1.5 mb-0.5">Gem Mint</div>
                        <div className="text-xs text-emerald-400 font-medium">{r.card.estimatedValueGem}</div>
                        <div className="text-xs text-emerald-500 mt-0.5">{mult.toFixed(1)}x ROI</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-800/50">
                  <Link href={`/sports/${r.card.slug}`} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">
                    View Card →
                  </Link>
                  <a href={r.card.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                    Buy on eBay ↗
                  </a>
                  <Link href={`/players/${r.card.player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} className="text-xs text-gray-400 hover:text-gray-300 font-medium">
                    Player Hub →
                  </Link>
                  <Link href="/tools/grading-roi" className="text-xs text-gray-400 hover:text-gray-300 font-medium">
                    Grade This? →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {results.length >= showCount && totalMatches > showCount && (
        <div className="text-center">
          <button
            onClick={() => setShowCount(s => s + 20)}
            className="px-6 py-3 bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
          >
            Show More Cards ({totalMatches - showCount} remaining)
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scout Tips</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <span className="text-emerald-400 font-medium">Investor:</span> Look for cards with 5x+ grading multiplier — the spread between raw and gem mint is your profit.
          </div>
          <div>
            <span className="text-emerald-400 font-medium">Flipper:</span> Target the $20–$200 raw range — enough margin to profit after fees, low enough to sell quickly.
          </div>
          <div>
            <span className="text-emerald-400 font-medium">Rookie Hunter:</span> Buy rookie cards in their first 2 seasons when prices dip. Hold through career milestones.
          </div>
          <div>
            <span className="text-emerald-400 font-medium">Vintage:</span> Pre-1970 HOF cards appreciate 5–10% annually. Focus on iconic sets (1952 Topps, 1986 Fleer, 1979 O-Pee-Chee).
          </div>
          <div>
            <span className="text-emerald-400 font-medium">Completionist:</span> Buy common cards during off-season when demand is lowest. Stars and rookies can wait.
          </div>
          <div>
            <span className="text-emerald-400 font-medium">General:</span> Always check eBay sold listings before buying. CardVault prices are estimates — real prices vary by condition and timing.
          </div>
        </div>
      </div>
    </div>
  );
}
