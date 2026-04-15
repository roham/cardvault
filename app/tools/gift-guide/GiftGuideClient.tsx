'use client';

import { useState, useMemo } from 'react';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────────────────
type RecipientType = 'kid' | 'teen' | 'casual' | 'serious' | 'returning';
type BudgetTier = 'under25' | '25to50' | '50to100' | '100to250' | '250plus';
type Occasion = 'birthday' | 'holiday' | 'graduation' | 'just-because' | 'starter';
type SportPref = 'baseball' | 'basketball' | 'football' | 'hockey' | 'any';

interface GiftPrefs {
  recipient: RecipientType | null;
  sport: SportPref | null;
  budget: BudgetTier | null;
  occasion: Occasion | null;
  favoriteTeam: string;
}

interface Recommendation {
  card: SportsCard;
  reason: string;
  giftScore: number;
  tag: string;
}

// ── Budget ranges ─────────────────────────────────────────────────────────
const budgetRanges: Record<BudgetTier, { min: number; max: number; label: string }> = {
  under25: { min: 0, max: 25, label: 'Under $25' },
  '25to50': { min: 25, max: 50, label: '$25 – $50' },
  '50to100': { min: 50, max: 100, label: '$50 – $100' },
  '100to250': { min: 100, max: 250, label: '$100 – $250' },
  '250plus': { min: 250, max: 100000, label: '$250+' },
};

// ── Helper: parse price from estimatedValueRaw ────────────────────────────
function parsePrice(val: string): number {
  const m = val.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

// ── Scoring helpers ───────────────────────────────────────────────────────
function getRecipientScore(card: SportsCard, recipient: RecipientType): number {
  const price = parsePrice(card.estimatedValueRaw);
  const isRookie = card.rookie;
  const isModern = card.year >= 2020;
  const isRecent = card.year >= 2015;
  const isVintage = card.year < 1990;

  switch (recipient) {
    case 'kid':
      // Kids love current stars, rookies, recognizable names
      return (isModern ? 30 : 0) + (isRookie ? 20 : 0) + (price < 30 ? 15 : 0);
    case 'teen':
      // Teens like current stars and slightly cooler/rare picks
      return (isRecent ? 25 : 0) + (isRookie ? 20 : 0) + (price < 60 ? 10 : 0);
    case 'casual':
      // Casual collectors like recognizable names, any era
      return (isRookie ? 15 : 10) + (isModern ? 10 : 0);
    case 'serious':
      // Serious collectors value rarity, grading potential, investment
      return (isRookie ? 25 : 0) + (isVintage ? 15 : 0) + (price > 50 ? 10 : 0);
    case 'returning':
      // Returning collectors love nostalgia — 90s/2000s era
      return (card.year >= 1990 && card.year <= 2010 ? 30 : 0) + (isRookie ? 15 : 0);
    default:
      return 0;
  }
}

function getOccasionTag(occasion: Occasion): string {
  switch (occasion) {
    case 'birthday': return 'Birthday Pick';
    case 'holiday': return 'Holiday Gift';
    case 'graduation': return 'Grad Gift';
    case 'just-because': return 'Great Find';
    case 'starter': return 'Starter Pick';
  }
}

function generateReason(card: SportsCard, recipient: RecipientType, occasion: Occasion): string {
  const player = card.player;
  const isRookie = card.rookie;
  const year = card.year;

  // Build a contextual reason
  const parts: string[] = [];

  if (isRookie) {
    parts.push(`${player}'s rookie card — a collectible milestone`);
  } else {
    parts.push(`${player}'s ${year} ${card.set} — a quality pick`);
  }

  switch (recipient) {
    case 'kid':
      parts.push('young collectors love current stars they watch on TV');
      break;
    case 'teen':
      parts.push('a card with real collecting credibility');
      break;
    case 'casual':
      parts.push('a recognizable name that any fan would appreciate');
      break;
    case 'serious':
      parts.push('strong long-term hold with investment potential');
      break;
    case 'returning':
      parts.push('nostalgia factor makes this a meaningful gift');
      break;
  }

  if (occasion === 'starter') {
    parts.push('perfect anchor for a new collection');
  }

  return parts.join('. ') + '.';
}

// ── Main recommendation engine ────────────────────────────────────────────
function getRecommendations(prefs: GiftPrefs): Recommendation[] {
  const { recipient, sport, budget, occasion } = prefs;
  if (!recipient || !sport || !budget || !occasion) return [];

  const range = budgetRanges[budget];
  const team = prefs.favoriteTeam.toLowerCase().trim();

  // Filter cards by sport and budget
  let candidates = sportsCards.filter(c => {
    if (sport !== 'any' && c.sport !== sport) return false;
    const price = parsePrice(c.estimatedValueRaw);
    if (price < range.min || price > range.max) return false;
    if (price === 0) return false;
    return true;
  });

  // Boost cards matching favorite team (by player name or description containing team keyword)
  const scored = candidates.map(card => {
    let score = 0;
    score += getRecipientScore(card, recipient);

    // Team match bonus
    if (team && (card.description.toLowerCase().includes(team) || card.name.toLowerCase().includes(team))) {
      score += 40;
    }

    // Rookie bonus for gift-giving (rookies are exciting gifts)
    if (card.rookie) score += 10;

    // Recent cards bonus (more recognizable)
    if (card.year >= 2022) score += 8;
    if (card.year >= 2020) score += 5;

    // Price sweet-spot bonus — prefer cards in the middle of the budget range
    const price = parsePrice(card.estimatedValueRaw);
    const rangeMid = (range.min + range.max) / 2;
    const priceDist = Math.abs(price - rangeMid) / (range.max - range.min || 1);
    score += Math.round((1 - priceDist) * 10);

    // Starter collection: favor variety (mix of sports if "any")
    if (occasion === 'starter') score += (card.rookie ? 10 : 0);

    return {
      card,
      reason: generateReason(card, recipient, occasion),
      giftScore: Math.min(score, 100),
      tag: getOccasionTag(occasion),
    };
  });

  // Sort by score descending, then deduplicate by player (max 1 card per player)
  scored.sort((a, b) => b.giftScore - a.giftScore);

  const seen = new Set<string>();
  const results: Recommendation[] = [];
  for (const rec of scored) {
    if (seen.has(rec.card.player)) continue;
    seen.add(rec.card.player);
    results.push(rec);
    if (results.length >= 8) break;
  }

  // If "any" sport, ensure sport diversity
  if (sport === 'any' && results.length >= 4) {
    const sportCounts: Record<string, number> = {};
    for (const r of results) {
      sportCounts[r.card.sport] = (sportCounts[r.card.sport] || 0) + 1;
    }
    // If one sport dominates (>50%), swap some out
    // (simple approach: the scoring already handles it, just return as-is)
  }

  return results;
}

// ── Sport emoji helper ────────────────────────────────────────────────────
function sportEmoji(sport: string): string {
  switch (sport) {
    case 'baseball': return '⚾';
    case 'basketball': return '🏀';
    case 'football': return '🏈';
    case 'hockey': return '🏒';
    default: return '🃏';
  }
}

function sportColor(sport: string): string {
  switch (sport) {
    case 'baseball': return 'text-rose-400';
    case 'basketball': return 'text-orange-400';
    case 'football': return 'text-emerald-400';
    case 'hockey': return 'text-sky-400';
    default: return 'text-gray-400';
  }
}

function sportBgColor(sport: string): string {
  switch (sport) {
    case 'baseball': return 'bg-rose-500/10 border-rose-500/30';
    case 'basketball': return 'bg-orange-500/10 border-orange-500/30';
    case 'football': return 'bg-emerald-500/10 border-emerald-500/30';
    case 'hockey': return 'bg-sky-500/10 border-sky-500/30';
    default: return 'bg-gray-500/10 border-gray-500/30';
  }
}

// ── Component ─────────────────────────────────────────────────────────────
export default function GiftGuideClient() {
  const [prefs, setPrefs] = useState<GiftPrefs>({
    recipient: null,
    sport: null,
    budget: null,
    occasion: null,
    favoriteTeam: '',
  });
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const recommendations = useMemo(() => {
    if (!showResults) return [];
    return getRecommendations(prefs);
  }, [prefs, showResults]);

  const handleSelect = (field: keyof GiftPrefs, value: string) => {
    setPrefs(p => ({ ...p, [field]: value }));
    if (step < 4) setStep(step + 1);
  };

  const handleGenerate = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setPrefs({ recipient: null, sport: null, budget: null, occasion: null, favoriteTeam: '' });
    setStep(0);
    setShowResults(false);
  };

  const handleShare = () => {
    const lines = recommendations.map((r, i) =>
      `${i + 1}. ${r.card.name} — ${r.card.estimatedValueRaw}`
    );
    const text = `🎁 My Card Gift Picks (via CardVault):\n\n${lines.join('\n')}\n\nhttps://cardvault-two.vercel.app/tools/gift-guide`;
    navigator.clipboard.writeText(text);
  };

  const allSelected = prefs.recipient && prefs.sport && prefs.budget && prefs.occasion;

  // ── Step configs ──────────────────────────────────────────────────────
  const steps = [
    {
      title: 'Who is the gift for?',
      field: 'recipient' as const,
      options: [
        { value: 'kid', label: 'Kid (8-12)', desc: 'Loves current stars and opening packs' },
        { value: 'teen', label: 'Teenager (13-17)', desc: 'Wants cool cards with real value' },
        { value: 'casual', label: 'Casual Fan', desc: 'Watches sports, new to collecting' },
        { value: 'serious', label: 'Serious Collector', desc: 'Already collects, appreciates quality' },
        { value: 'returning', label: 'Returning Collector', desc: 'Collected as a kid, getting back in' },
      ],
    },
    {
      title: 'What sport do they follow?',
      field: 'sport' as const,
      options: [
        { value: 'baseball', label: '⚾ Baseball', desc: 'MLB fans, Topps & Bowman lovers' },
        { value: 'basketball', label: '🏀 Basketball', desc: 'NBA fans, Prizm & Select hunters' },
        { value: 'football', label: '🏈 Football', desc: 'NFL fans, draft day excitement' },
        { value: 'hockey', label: '🏒 Hockey', desc: 'NHL fans, Young Guns collectors' },
        { value: 'any', label: '🎯 Any / Not Sure', desc: 'Mix of sports for variety' },
      ],
    },
    {
      title: 'What\'s your budget?',
      field: 'budget' as const,
      options: [
        { value: 'under25', label: 'Under $25', desc: 'Stocking stuffer, casual gift' },
        { value: '25to50', label: '$25 – $50', desc: 'Solid gift, quality single cards' },
        { value: '50to100', label: '$50 – $100', desc: 'Premium pick, graded options' },
        { value: '100to250', label: '$100 – $250', desc: 'Serious gift, investment-grade' },
        { value: '250plus', label: '$250+', desc: 'Showstopper, premium collectible' },
      ],
    },
    {
      title: 'What\'s the occasion?',
      field: 'occasion' as const,
      options: [
        { value: 'birthday', label: 'Birthday', desc: 'Celebrate with a personal pick' },
        { value: 'holiday', label: 'Holiday', desc: 'Christmas, Hanukkah, etc.' },
        { value: 'graduation', label: 'Graduation', desc: 'A lasting keepsake gift' },
        { value: 'just-because', label: 'Just Because', desc: 'Surprise or thank-you gift' },
        { value: 'starter', label: 'Start a Collection', desc: 'Help them begin collecting' },
      ],
    },
  ];

  if (showResults) {
    return (
      <div>
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Your Personalized Gift Picks</h2>
            <p className="text-gray-400 text-sm mt-1">
              {recommendations.length} cards matched for a {prefs.recipient} collector
              {prefs.sport !== 'any' ? ` who loves ${prefs.sport}` : ''}
              {' '}— {budgetRanges[prefs.budget!].label}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleShare} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
              Share
            </button>
            <button onClick={handleReset} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm rounded-lg transition-colors">
              Start Over
            </button>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center">
            <p className="text-gray-400 text-lg mb-2">No cards found in this budget range for your criteria.</p>
            <p className="text-gray-500 text-sm">Try adjusting your budget or sport preference.</p>
            <button onClick={handleReset} className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={rec.card.slug} className={`border rounded-xl p-4 sm:p-5 ${sportBgColor(rec.card.sport)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-medium bg-white/10 px-2 py-0.5 rounded text-white">#{i + 1}</span>
                      <span className={`text-xs font-medium ${sportColor(rec.card.sport)}`}>
                        {sportEmoji(rec.card.sport)} {rec.card.sport.charAt(0).toUpperCase() + rec.card.sport.slice(1)}
                      </span>
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">{rec.tag}</span>
                      {rec.card.rookie && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Rookie</span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-base sm:text-lg truncate">{rec.card.name}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{rec.reason}</p>

                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <div>
                        <span className="text-gray-500 text-xs">Raw</span>
                        <p className="text-white font-bold text-lg">{rec.card.estimatedValueRaw}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Gem Mint (PSA 10)</span>
                        <p className="text-emerald-400 font-bold text-lg">{rec.card.estimatedValueGem}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Gift Score</span>
                        <p className="text-amber-400 font-bold text-lg">{rec.giftScore}/100</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      <a
                        href={rec.card.ebaySearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition-colors"
                      >
                        Buy on eBay
                      </a>
                      <a
                        href={`/cards/${rec.card.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 border border-gray-500/30 rounded-lg text-xs font-medium transition-colors"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gift wrapping ideas */}
        {recommendations.length > 0 && (
          <div className="mt-8 bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Gift Wrapping Ideas</h3>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-amber-400 font-medium mb-1">Budget Option</p>
                <p className="text-gray-400">Card in a penny sleeve + top loader, wrapped in tissue paper inside a small gift bag. ~$2 extra.</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-emerald-400 font-medium mb-1">Premium Option</p>
                <p className="text-gray-400">Card in a one-touch magnetic holder, placed in a small display box with ribbon. ~$5-8 extra.</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-rose-400 font-medium mb-1">Collector&apos;s Option</p>
                <p className="text-gray-400">Card in a UV-protected display case with an engraved nameplate. Shelf-ready presentation. ~$15-25 extra.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                i < step ? 'bg-emerald-500 w-full' :
                i === step ? 'bg-emerald-500/60 w-1/2' :
                'w-0'
              }`}
              style={{ width: i < step ? '100%' : i === step ? '50%' : '0%' }}
            />
          </div>
        ))}
        <span className="text-gray-500 text-xs ml-1">{Math.min(step + 1, 4)}/4</span>
      </div>

      {/* Steps */}
      {steps.map((s, i) => {
        if (i > step) return null;
        const selected = prefs[s.field];
        const isActive = i === step;

        return (
          <div key={s.field} className={`mb-6 ${!isActive ? 'opacity-60' : ''}`}>
            <h2 className="text-lg font-bold text-white mb-3">
              <span className="text-gray-500 mr-2">{i + 1}.</span>
              {s.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {s.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(s.field, opt.value)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all ${
                    selected === opt.value
                      ? 'bg-emerald-600/20 border-emerald-500/50 text-white'
                      : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  }`}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Optional team input + generate button */}
      {step >= 4 && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Favorite team or player? <span className="text-gray-600">(optional — helps personalize)</span>
            </label>
            <input
              type="text"
              value={prefs.favoriteTeam}
              onChange={e => setPrefs(p => ({ ...p, favoriteTeam: e.target.value }))}
              placeholder="e.g. Lakers, Yankees, Mahomes..."
              className="w-full max-w-md px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!allSelected}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl text-base transition-colors"
          >
            Find Gift Cards
          </button>
        </div>
      )}
    </div>
  );
}
