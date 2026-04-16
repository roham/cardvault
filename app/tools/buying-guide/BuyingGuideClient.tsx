'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ---------- Types ---------- */

interface Platform {
  name: string;
  fee: string;
  protection: string;
  bestFor: string;
  pros: string[];
  cons: string[];
  score: number; // 0-100
  color: string;
}

interface AuthCheck {
  label: string;
  detail: string;
  critical: boolean;
}

interface RedFlag {
  flag: string;
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

type CardFormat = 'raw' | 'graded' | 'sealed';

/* ---------- Platform Data ---------- */

function getPlatforms(value: number, isGraded: boolean): Platform[] {
  const platforms: Platform[] = [
    {
      name: 'eBay',
      fee: '13.25% seller fee (free for buyers)',
      protection: 'Money Back Guarantee + Authenticity Guarantee ($150+)',
      bestFor: value >= 150 ? 'Best choice — Authenticity Guarantee protects you' : value >= 20 ? 'Great selection, compare multiple sellers' : 'Widest selection, but watch shipping costs on cheap cards',
      pros: ['Largest selection of any platform', 'Authenticity Guarantee on $150+ cards', 'Money Back Guarantee on all purchases', 'Price history via sold listings'],
      cons: value < 20 ? ['Shipping costs can exceed card value', 'Many overpriced BIN listings'] : ['Some counterfeit risk under $150', 'Bidding wars can push past fair value'],
      score: value >= 150 ? 95 : value >= 20 ? 85 : 70,
      color: 'rgb(59, 130, 246)',
    },
    {
      name: 'COMC',
      fee: '5% processing + $0.50-$3 per card',
      protection: 'All cards verified and scanned in-house',
      bestFor: value >= 5 && value <= 200 ? 'Great for mid-range — every card is scanned and verified' : 'Good for verified condition, but slow shipping',
      pros: ['Every card professionally photographed', 'Condition visible before purchase', 'Cards stored in their facility', 'No counterfeits — all verified'],
      cons: ['Slow shipping (3-5 business days to ship)', 'Limited selection vs eBay', 'Processing fees add up on cheap cards'],
      score: value >= 10 && value <= 200 ? 88 : value > 200 ? 75 : 60,
      color: 'rgb(34, 197, 94)',
    },
    {
      name: 'Whatnot',
      fee: '0% buyer fee (sellers pay ~10%)',
      protection: 'In-app disputes, community moderation',
      bestFor: value >= 10 ? 'Live auction deals — often 20-40% below market' : 'Fun for cheap pickups, but hard to target specific cards',
      pros: ['Live auctions often below market value', 'No buyer fees', 'Interactive — can ask seller questions live', 'Deals on bulk lots'],
      cons: ['Must watch live streams to find deals', 'Impulse buying risk', 'Less buyer protection than eBay', 'Can\'t search for specific cards easily'],
      score: value >= 20 && value <= 500 ? 82 : 65,
      color: 'rgb(168, 85, 247)',
    },
    {
      name: 'Facebook Groups',
      fee: '0% fees (direct transactions)',
      protection: 'Group admin disputes only — no platform protection',
      bestFor: value >= 20 ? 'Best prices — no fees means lower prices' : 'Good for lots and bulk deals',
      pros: ['Zero fees = lowest prices', 'Direct negotiation with seller', 'Build relationships with dealers', 'Group vouches for trusted sellers'],
      cons: ['No platform buyer protection', 'Must use PayPal G&S for protection (3% fee)', 'Scam risk is higher', 'No standardized condition grading'],
      score: value >= 50 ? 78 : 60,
      color: 'rgb(59, 130, 246)',
    },
    {
      name: 'Card Shows',
      fee: '0% fees (cash or Venmo)',
      protection: 'None — inspect in person before paying',
      bestFor: isGraded ? 'Verify slab in hand, negotiate face-to-face' : 'Inspect condition yourself, negotiate price',
      pros: ['Inspect card in person before buying', 'Negotiate price (15-25% off asking is normal)', 'No shipping costs or risk', 'Cash deals = best prices'],
      cons: ['Limited to shows in your area', 'Dealers know more than you about condition', 'No recourse after walking away', 'Heat of the moment overpaying'],
      score: value >= 50 ? 80 : value >= 10 ? 75 : 65,
      color: 'rgb(234, 179, 8)',
    },
    {
      name: 'Local Card Shop',
      fee: 'Retail markup (10-30% over market)',
      protection: 'Store reputation, potential returns policy',
      bestFor: 'Building relationships, instant gratification, supporting local',
      pros: ['Inspect in person', 'Build relationship for future deals', 'Some shops offer layaway', 'Support the hobby community'],
      cons: ['Typically 10-30% above market price', 'Limited inventory', 'No standardized pricing', 'Emotional buying pressure'],
      score: value >= 100 ? 65 : 55,
      color: 'rgb(249, 115, 22)',
    },
    {
      name: 'Mercari',
      fee: '0% buyer fee (sellers pay 10%)',
      protection: 'Return within 3 days of delivery',
      bestFor: value < 50 ? 'Good for cheap pickups — less competition than eBay' : 'Decent deals, but less selection than eBay',
      pros: ['Less competition = better deals', 'No buyer fees', '3-day inspection window', 'Easy to make offers'],
      cons: ['Smaller sports card selection', 'Less collector expertise', 'Condition descriptions less reliable', 'Seller photos often poor quality'],
      score: value < 50 ? 75 : 65,
      color: 'rgb(239, 68, 68)',
    },
  ];

  return platforms.sort((a, b) => b.score - a.score);
}

/* ---------- Authentication Data ---------- */

function getAuthChecks(isVintage: boolean, isGraded: boolean): AuthCheck[] {
  const checks: AuthCheck[] = [];

  if (isGraded) {
    checks.push(
      { label: 'Verify cert number', detail: 'Enter the certification number on the grading company website (PSA: psacard.com/cert, BGS: beckett.com/grading/card-lookup). The card, grade, and details should match exactly.', critical: true },
      { label: 'Check slab font', detail: 'Each grading company uses specific fonts on their labels. PSA uses a distinct bold font; BGS uses a thinner serif. Fake slabs often have slightly wrong font weights or spacing.', critical: true },
      { label: 'Inspect hologram', detail: 'PSA slabs have a holographic sticker on the back. BGS has a hologram on the front label. CGC has a barcode. These should be smooth, not peeling, and change color at angles.', critical: true },
      { label: 'Weigh the slab', detail: 'PSA slabs weigh ~2.0 oz (57g). BGS slabs weigh ~2.5 oz (71g). CGC slabs weigh ~2.3 oz (65g). A kitchen scale can catch fake slabs — they are often lighter or heavier.', critical: false },
      { label: 'Check inner sleeve fit', detail: 'Authentic graded cards fit snugly inside the slab with minimal movement. If the card slides around freely, the slab may be counterfeit or the card has been swapped.', critical: false },
    );
  } else {
    checks.push(
      { label: 'Check card stock', detail: 'Authentic cards have a specific thickness and feel. Modern Topps Chrome should be noticeably thicker than base Topps. Compare to a known authentic card if possible.', critical: true },
      { label: 'Examine print quality', detail: 'Use a loupe or phone camera zoom to check the dot pattern. Authentic cards have a consistent rosette print pattern. Counterfeits often show fuzzy or misaligned dots.', critical: true },
      { label: 'Black light test', detail: 'Some cards fluoresce differently under UV light. Reprints and fakes often glow differently than authentic cards from the same set.', critical: false },
    );
  }

  if (isVintage) {
    checks.push(
      { label: 'Check for trimming', detail: 'Measure the card dimensions with a ruler. Standard cards are 2.5" x 3.5". Trimmed cards are slightly smaller. Also check that all edges are equally smooth — trimmed cards may have one edge sharper than others.', critical: true },
      { label: 'Look for re-coloring', detail: 'Examine borders under magnification. Re-colored (touched-up) cards will have paint sitting ON TOP of the card surface rather than being part of the printing process.', critical: true },
      { label: 'Verify card back', detail: 'Vintage counterfeiters often get the front right but miss details on the back — wrong stats, wrong font, wrong card number format.', critical: false },
    );
  }

  return checks;
}

function getRedFlags(value: number): RedFlag[] {
  const flags: RedFlag[] = [
    { flag: 'Price 30%+ below recent sold comps', severity: 'high', detail: 'If a deal seems too good to be true, it usually is. Scammers price cards below market to attract quick buyers.' },
    { flag: 'New seller account with zero feedback', severity: 'high', detail: 'Zero-feedback sellers on eBay or Mercari are the highest-risk purchases. Wait for sellers with 50+ positive reviews.' },
    { flag: 'Stock photos instead of actual card photos', severity: 'high', detail: 'Legitimate sellers photograph the actual card they are selling. Stock photos mean you have no idea what condition you will receive.' },
    { flag: 'Refuses PayPal Goods & Services', severity: 'medium', detail: 'On Facebook or direct deals, PayPal G&S provides buyer protection. Sellers who insist on Friends & Family, Zelle, or crypto are avoiding dispute resolution.' },
    { flag: 'Blurry or distant photos of graded card', severity: 'medium', detail: 'Legitimate graded card sellers show clear, close-up photos where you can read the cert number and grade. Blurry photos may hide slab damage or counterfeits.' },
    { flag: 'Listing says "reprint" or "RP" in fine print', severity: 'medium', detail: 'Some listings advertise cards that look authentic but are labeled as reprints in the description. Always read the full listing description.' },
  ];

  if (value >= 200) {
    flags.push(
      { flag: 'No authentication guarantee on high-value card', severity: 'high', detail: `For a card worth $${value.toLocaleString()}, insist on eBay Authenticity Guarantee, PSA verification, or an escrow service. Never send large payments without protection.` },
    );
  }

  if (value >= 500) {
    flags.push(
      { flag: 'Pressure to "buy now" or "deal expires today"', severity: 'medium', detail: 'High-value card purchases should never be rushed. Take time to verify, compare, and authenticate. Urgency is a scammer tactic.' },
    );
  }

  return flags.sort((a, b) => {
    const sev = { high: 0, medium: 1, low: 2 };
    return sev[a.severity] - sev[b.severity];
  });
}

/* ---------- Buying Checklist ---------- */

function getBuyingChecklist(value: number, isGraded: boolean): string[] {
  const steps = [
    'Research the card — check recent eBay sold listings (filter "Sold Items") for the exact card + grade',
    'Establish fair price range — median of last 5-10 sales, excluding outliers',
    'Choose your platform — use the rankings above based on your card\'s value and format',
  ];

  if (isGraded) {
    steps.push('Verify the cert number on the grading company website BEFORE buying');
  }

  steps.push(
    'Check seller reputation — look for 50+ positive reviews and recent activity',
    'Request additional photos if the listing photos are unclear or limited',
    'Compare condition to price — a PSA 9 should not be priced at PSA 10 levels',
  );

  if (value >= 100) {
    steps.push('Use buyer protection — eBay Authenticity Guarantee, PayPal G&S, or escrow');
    steps.push('Consider insurance for shipping — USPS Priority Mail with declared value');
  }

  if (value >= 500) {
    steps.push('Get a second opinion — ask a trusted collector friend or online community before buying');
  }

  steps.push(
    'Save the listing URL, screenshots, and receipt for your records',
    'Inspect the card immediately upon arrival — report issues within the platform\'s dispute window',
  );

  return steps;
}

/* ---------- Negotiation Tips ---------- */

function getNegotiationTips(platform: string, value: number): string[] {
  const tips: Record<string, string[]> = {
    'eBay': [
      'Use "Make an Offer" — most sellers accept 10-15% below BIN price',
      'Watch auctions ending late at night (less competition)',
      'Bundle multiple cards from the same seller for a shipping discount',
      'Set up saved searches with email alerts for price drops',
    ],
    'Facebook Groups': [
      'Always use PayPal Goods & Services for buyer protection',
      'Offer 15-25% below asking — sellers expect negotiation',
      'Ask for a "bundle deal" if buying multiple cards',
      'Check the seller\'s vouches and past transactions in the group',
    ],
    'Card Shows': [
      'Wait until late afternoon — dealers are more flexible near closing',
      'Bring cash — dealers give better prices for cash (no processing fees)',
      'Ask "What\'s your best price?" instead of making a lowball offer',
      'Walk away if the price isn\'t right — you can always come back',
      'Buy in bulk — "I\'ll take all 5 for $X" gets better deals',
    ],
    'COMC': [
      'Add cards to your cart and wait — COMC sometimes offers checkout discounts',
      'Buy during sales events (Black Friday, National Card Day)',
      'Combine shipping by ordering multiple cards at once',
    ],
    'Whatnot': [
      'Follow sellers who specialize in your sport/era',
      'Set a maximum bid BEFORE the auction starts',
      'Late-night streams have fewer bidders = better deals',
      'New seller streams often have lower prices to build followers',
    ],
  };

  return tips[platform] || [
    'Compare prices across 2-3 platforms before committing',
    `For a $${value.toLocaleString()} card, a 10% savings is $${Math.round(value * 0.1).toLocaleString()} — worth the effort`,
    'Patience is your best tool — most cards are not truly scarce',
  ];
}

/* ---------- Helper ---------- */

function parseValue(str: string): number {
  const m = str.match(/\$([0-9,.]+)/);
  return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
}

/* ---------- Component ---------- */

export default function BuyingGuideClient() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCard, setSelectedCard] = useState<typeof sportsCards[0] | null>(null);
  const [format, setFormat] = useState<CardFormat>('raw');
  const [manualValue, setManualValue] = useState('');
  const [manualSport, setManualSport] = useState('baseball');
  const [manualEra, setManualEra] = useState<'vintage' | 'modern' | 'ultra-modern'>('ultra-modern');
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const [showResults, setShowResults] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const estimatedValue = useMemo(() => {
    if (selectedCard) {
      return parseValue(selectedCard.estimatedValueRaw);
    }
    return manualValue ? parseFloat(manualValue) : 50;
  }, [selectedCard, manualValue]);

  const isVintage = useMemo(() => {
    if (selectedCard) return selectedCard.year < 1980;
    return manualEra === 'vintage';
  }, [selectedCard, manualEra]);

  const isGraded = format === 'graded';

  const platforms = useMemo(() => getPlatforms(estimatedValue, isGraded), [estimatedValue, isGraded]);
  const authChecks = useMemo(() => getAuthChecks(isVintage, isGraded), [isVintage, isGraded]);
  const redFlags = useMemo(() => getRedFlags(estimatedValue), [estimatedValue]);
  const checklist = useMemo(() => getBuyingChecklist(estimatedValue, isGraded), [estimatedValue, isGraded]);

  function selectCard(card: typeof sportsCards[0]) {
    setSelectedCard(card);
    setQuery(card.name);
    setShowSuggestions(false);
    setShowResults(false);
  }

  function generateGuide() {
    setShowResults(true);
  }

  const cardLabel = selectedCard ? selectedCard.name : `${manualSport} card (~$${estimatedValue})`;

  return (
    <div className="space-y-8">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setMode('search'); setShowResults(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          Search Card Database
        </button>
        <button onClick={() => { setMode('manual'); setSelectedCard(null); setShowResults(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          Manual Entry
        </button>
      </div>

      {/* Search Mode */}
      {mode === 'search' && (
        <div className="relative" ref={suggestRef}>
          <label className="block text-sm text-gray-400 mb-1">Search for a card (8,900+ in database)</label>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); setSelectedCard(null); setShowResults(false); }}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder="e.g. 2023 Topps Chrome Wembanyama..."
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl max-h-64 overflow-y-auto shadow-xl">
              {suggestions.map(c => (
                <button
                  key={c.slug}
                  onClick={() => selectCard(c)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-800 text-sm border-b border-gray-800/50 last:border-0"
                >
                  <span className="text-white">{c.player}</span>
                  <span className="text-gray-500 ml-2">{c.year} {c.set}</span>
                  <span className="text-green-400 ml-2">{c.estimatedValueRaw}</span>
                </button>
              ))}
            </div>
          )}
          {selectedCard && (
            <div className="mt-3 p-4 bg-gray-900/80 border border-blue-800/40 rounded-xl">
              <div className="text-white font-semibold">{selectedCard.name}</div>
              <div className="text-gray-400 text-sm mt-1">{selectedCard.sport} &middot; {selectedCard.year} &middot; {selectedCard.rookie ? 'Rookie Card' : 'Base'}</div>
              <div className="text-green-400 text-sm mt-1">Raw: {selectedCard.estimatedValueRaw} &middot; Gem: {selectedCard.estimatedValueGem}</div>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sport</label>
            <select value={manualSport} onChange={e => setManualSport(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white outline-none focus:border-blue-500">
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Era</label>
            <select value={manualEra} onChange={e => setManualEra(e.target.value as typeof manualEra)} className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white outline-none focus:border-blue-500">
              <option value="vintage">Vintage (pre-1980)</option>
              <option value="modern">Modern (1980-2010)</option>
              <option value="ultra-modern">Ultra-Modern (2011+)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estimated Value ($)</label>
            <input type="number" value={manualValue} onChange={e => setManualValue(e.target.value)} placeholder="50" className="w-full px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 outline-none focus:border-blue-500" />
          </div>
        </div>
      )}

      {/* Format + Generate */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Card Format</label>
          <div className="flex gap-2">
            {(['raw', 'graded', 'sealed'] as CardFormat[]).map(f => (
              <button key={f} onClick={() => { setFormat(f); setShowResults(false); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${format === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={generateGuide}
          disabled={mode === 'search' && !selectedCard}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl font-semibold transition-colors"
        >
          Get Buying Guide
        </button>
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-8 pt-4 border-t border-gray-800">
          {/* Fair Price */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Fair Price Estimate</h2>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              <div className="text-3xl font-bold text-green-400 mb-1">
                ${Math.round(estimatedValue * 0.85).toLocaleString()} – ${Math.round(estimatedValue * 1.15).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">
                Based on {selectedCard ? 'our database estimate' : 'your input'} of ~${estimatedValue.toLocaleString()} {isGraded ? '(graded)' : '(raw)'}
              </div>
              <div className="mt-3 text-sm text-gray-500">
                A &quot;good deal&quot; is below ${Math.round(estimatedValue * 0.85).toLocaleString()}. Anything above ${Math.round(estimatedValue * 1.15).toLocaleString()} is overpriced. Always verify against recent eBay sold listings.
              </div>
            </div>
          </section>

          {/* Platform Rankings */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Best Platforms for This Card</h2>
            <div className="space-y-3">
              {platforms.map((p, i) => (
                <div key={p.name} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold" style={{ color: p.color }}>#{i + 1}</span>
                      <span className="text-white font-semibold">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.score}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="text-sm font-mono" style={{ color: p.color }}>{p.score}</span>
                    </div>
                  </div>
                  <div className="text-blue-300 text-sm mb-2">{p.bestFor}</div>
                  <div className="text-gray-500 text-xs mb-2">Fees: {p.fee} &middot; Protection: {p.protection}</div>
                  <details className="group">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">Pros & Cons</summary>
                    <div className="grid sm:grid-cols-2 gap-2 mt-2">
                      <div>
                        {p.pros.map((pro, j) => (
                          <div key={j} className="text-xs text-green-400/80 flex gap-1"><span>+</span>{pro}</div>
                        ))}
                      </div>
                      <div>
                        {p.cons.map((con, j) => (
                          <div key={j} className="text-xs text-red-400/80 flex gap-1"><span>-</span>{con}</div>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </section>

          {/* Authentication Checklist */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Authentication Checklist</h2>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
              {authChecks.map((check, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${check.critical ? 'bg-red-600/20 text-red-400 border border-red-600/40' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                    {check.critical ? '!' : i + 1}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{check.label} {check.critical && <span className="text-red-400 text-xs ml-1">CRITICAL</span>}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{check.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Red Flags */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Red Flags to Watch</h2>
            <div className="space-y-2">
              {redFlags.map((rf, i) => (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border ${rf.severity === 'high' ? 'bg-red-950/30 border-red-800/40' : rf.severity === 'medium' ? 'bg-yellow-950/30 border-yellow-800/40' : 'bg-gray-900/60 border-gray-800'}`}>
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded ${rf.severity === 'high' ? 'bg-red-600/30 text-red-400' : rf.severity === 'medium' ? 'bg-yellow-600/30 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
                    {rf.severity.toUpperCase()}
                  </span>
                  <div>
                    <div className="text-white text-sm font-medium">{rf.flag}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{rf.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Buying Checklist */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Step-by-Step Buying Checklist</h2>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
              {checklist.map((step, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-gray-800/50 last:border-0">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-blue-400 text-xs font-bold">{i + 1}</span>
                  <span className="text-gray-300 text-sm">{step}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Negotiation Tips */}
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Negotiation Tips for {platforms[0]?.name}</h2>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-2">
              {getNegotiationTips(platforms[0]?.name || 'eBay', estimatedValue).map((tip, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-blue-400 shrink-0">&#8226;</span>
                  <span className="text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          {selectedCard && (
            <section>
              <h2 className="text-lg font-bold text-white mb-3">Quick Actions</h2>
              <div className="flex flex-wrap gap-2">
                <a href={selectedCard.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600/20 border border-blue-600/40 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors">
                  Search eBay Sold Listings
                </a>
                <Link href={`/cards/${selectedCard.slug}`} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:border-gray-600 transition-colors">
                  View Card Page
                </Link>
                <Link href="/tools/condition-grader" className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:border-gray-600 transition-colors">
                  Grade Condition
                </Link>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
