'use client';

import { useState, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

type Venue = 'card_show' | 'lcs' | 'online' | 'private';
type Condition = 'mint' | 'near_mint' | 'excellent' | 'good' | 'poor';
type Motivation = 'must_have' | 'nice_to_have' | 'impulse' | 'investment';

const VENUES: { id: Venue; label: string; discount: number; desc: string }[] = [
  { id: 'card_show', label: 'Card Show', discount: 0.18, desc: 'Dealers expect negotiation. 10-25% off is standard.' },
  { id: 'lcs', label: 'Local Card Shop', discount: 0.12, desc: 'Less room than shows. 5-15% off on higher-priced cards.' },
  { id: 'online', label: 'Online (eBay/Marketplace)', discount: 0.10, desc: 'Best Offer listings expect 5-15% below ask.' },
  { id: 'private', label: 'Private Sale', discount: 0.20, desc: 'Most flexibility. No platform fees = bigger discounts.' },
];

const CONDITIONS: { id: Condition; label: string; factor: number }[] = [
  { id: 'mint', label: 'Mint / Gem Mint (PSA 9-10)', factor: 0.95 },
  { id: 'near_mint', label: 'Near Mint (PSA 7-8)', factor: 0.88 },
  { id: 'excellent', label: 'Excellent (PSA 5-6)', factor: 0.78 },
  { id: 'good', label: 'Good (PSA 3-4)', factor: 0.65 },
  { id: 'poor', label: 'Poor (PSA 1-2)', factor: 0.50 },
];

const MOTIVATIONS: { id: Motivation; label: string; aggression: number }[] = [
  { id: 'must_have', label: 'Must-Have (Grail Card)', aggression: 0.05 },
  { id: 'nice_to_have', label: 'Nice to Have', aggression: 0.12 },
  { id: 'impulse', label: 'Impulse / Browsing', aggression: 0.18 },
  { id: 'investment', label: 'Investment / Flip', aggression: 0.22 },
];

const TACTICS = [
  { title: 'The Bundle', tip: 'Ask "What if I buy 2-3 cards?" Dealers give 15-25% off on multi-card deals.' },
  { title: 'The Walk-Away', tip: 'Say "Let me think about it" and start walking. 50% of the time they call you back with a better price.' },
  { title: 'The Cash Flash', tip: 'Show cash and say "I have $X on me right now." Physical cash is a powerful closer at shows.' },
  { title: 'The Comp Check', tip: 'Pull up recent eBay sold listings on your phone. Data beats opinion.' },
  { title: 'End of Show', tip: 'Visit on the last day or last hour. Dealers discount heavily to avoid packing inventory.' },
  { title: 'The Flaw Finder', tip: 'Politely point out any condition issues. "I see some whitening on the corners — would you do $X?"' },
];

function parsePrice(s: string): number {
  const cleaned = s.replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
}

function fmt(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `$${n.toFixed(2)}`;
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export default function NegotiationCalc() {
  const [askingPrice, setAskingPrice] = useState('100');
  const [venue, setVenue] = useState<Venue>('card_show');
  const [condition, setCondition] = useState<Condition>('near_mint');
  const [motivation, setMotivation] = useState<Motivation>('nice_to_have');
  const [isGraded, setIsGraded] = useState(false);
  const [dayOfShow, setDayOfShow] = useState<'early' | 'mid' | 'late'>('mid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [counterOffer, setCounterOffer] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  const result = useMemo(() => {
    const ask = parsePrice(askingPrice);
    if (ask <= 0) return null;

    const venueData = VENUES.find(v => v.id === venue)!;
    const condData = CONDITIONS.find(c => c.id === condition)!;
    const motivData = MOTIVATIONS.find(m => m.id === motivation)!;

    // Base discount from venue
    let baseDiscount = venueData.discount;

    // Graded cards have less negotiation room
    if (isGraded) baseDiscount *= 0.7;

    // Day-of-show adjustment (card shows only)
    let showAdjust = 0;
    if (venue === 'card_show') {
      if (dayOfShow === 'early') showAdjust = -0.03;
      if (dayOfShow === 'late') showAdjust = 0.08;
    }

    // Higher-priced cards have more negotiation room
    let priceAdjust = 0;
    if (ask >= 500) priceAdjust = 0.05;
    else if (ask >= 200) priceAdjust = 0.03;
    else if (ask >= 100) priceAdjust = 0.01;
    else if (ask < 25) priceAdjust = -0.03;

    const totalDiscount = Math.max(0.02, Math.min(0.35,
      baseDiscount + showAdjust + priceAdjust + motivData.aggression * 0.3
    ));

    // Fair market estimate (condition-adjusted)
    const fairMarket = ask * condData.factor;

    // Opening offer: aggressive
    const openingOffer = ask * (1 - totalDiscount - 0.05);

    // Target price: realistic goal
    const targetPrice = ask * (1 - totalDiscount);

    // Walk-away: absolute maximum
    const walkAway = ask * (1 - totalDiscount * 0.4);

    // Savings
    const savingsAtTarget = ask - targetPrice;
    const savingsPercent = savingsAtTarget / ask;

    // Counter-offer analysis
    const counter = parsePrice(counterOffer);
    let counterVerdict = '';
    let counterColor = '';
    if (counter > 0) {
      if (counter <= openingOffer) {
        counterVerdict = 'Great deal — below your opening offer!';
        counterColor = 'text-green-400';
      } else if (counter <= targetPrice) {
        counterVerdict = 'Good deal — at or below your target.';
        counterColor = 'text-green-400';
      } else if (counter <= walkAway) {
        counterVerdict = 'Acceptable — between target and walk-away.';
        counterColor = 'text-yellow-400';
      } else {
        counterVerdict = 'Too high — consider walking away.';
        counterColor = 'text-red-400';
      }
    }

    return {
      ask,
      fairMarket,
      openingOffer: Math.max(openingOffer, 1),
      targetPrice: Math.max(targetPrice, 1),
      walkAway: Math.max(walkAway, 1),
      savingsAtTarget,
      savingsPercent,
      totalDiscount,
      venueDesc: venueData.desc,
      counterVerdict,
      counterColor,
    };
  }, [askingPrice, venue, condition, motivation, isGraded, dayOfShow, counterOffer]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Card & Price */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Asking Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={askingPrice}
                onChange={e => setAskingPrice(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-7 pr-4 py-3 text-white text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="100.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Find Card (optional)</label>
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Search 5,700+ cards..."
            />
            {showSearch && searchResults.length > 0 && (
              <div className="mt-1 bg-gray-900 border border-gray-700 rounded-xl max-h-48 overflow-y-auto">
                {searchResults.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      setSelectedCard(c.name);
                      setSearchQuery(c.name);
                      setShowSearch(false);
                      if (!askingPrice || askingPrice === '100') {
                        const rawVal = parsePrice(c.estimatedValueRaw);
                        if (rawVal > 0) setAskingPrice(rawVal.toString());
                      }
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-500 ml-2">Raw: {c.estimatedValueRaw} / Gem: {c.estimatedValueGem}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedCard && (
              <p className="mt-1 text-xs text-blue-400">Selected: {selectedCard}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Card Condition</label>
            <select
              value={condition}
              onChange={e => setCondition(e.target.value as Condition)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            >
              {CONDITIONS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-10 h-6 rounded-full transition-colors ${isGraded ? 'bg-blue-600' : 'bg-gray-700'} relative`}
              onClick={() => setIsGraded(!isGraded)}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isGraded ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-gray-300">Card is professionally graded (PSA/BGS/CGC slab)</span>
          </label>
        </div>

        {/* Right: Context */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Where Are You Buying?</label>
            <div className="space-y-2">
              {VENUES.map(v => (
                <label
                  key={v.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    venue === v.id
                      ? 'border-blue-500 bg-blue-950/30'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="venue"
                    value={v.id}
                    checked={venue === v.id}
                    onChange={() => setVenue(v.id)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 ${venue === v.id ? 'border-blue-500 bg-blue-500' : 'border-gray-600'}`}>
                    {venue === v.id && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                  </div>
                  <span className="text-sm text-white font-medium">{v.label}</span>
                </label>
              ))}
            </div>
          </div>

          {venue === 'card_show' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">When at the Show?</label>
              <div className="grid grid-cols-3 gap-2">
                {([['early', 'Opening Hour'], ['mid', 'Mid-Day'], ['late', 'Last Hour']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setDayOfShow(val)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dayOfShow === val
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">How Badly Do You Want It?</label>
            <select
              value={motivation}
              onChange={e => setMotivation(e.target.value as Motivation)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
            >
              {MOTIVATIONS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Price Targets */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Negotiation Playbook</h2>
            <p className="text-sm text-gray-400 mb-6">{result.venueDesc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-950/30 border border-green-800/40 rounded-xl p-4 text-center">
                <p className="text-xs text-green-400 font-medium mb-1">OPENING OFFER</p>
                <p className="text-2xl font-bold text-green-400">{fmt(result.openingOffer)}</p>
                <p className="text-xs text-gray-500 mt-1">Start here. Expect a counter.</p>
              </div>
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-400 font-medium mb-1">TARGET PRICE</p>
                <p className="text-2xl font-bold text-blue-400">{fmt(result.targetPrice)}</p>
                <p className="text-xs text-gray-500 mt-1">Your realistic goal. {pct(result.savingsPercent)} off.</p>
              </div>
              <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-center">
                <p className="text-xs text-red-400 font-medium mb-1">WALK-AWAY PRICE</p>
                <p className="text-2xl font-bold text-red-400">{fmt(result.walkAway)}</p>
                <p className="text-xs text-gray-500 mt-1">Above this? Walk away.</p>
              </div>
            </div>

            {/* Visual price bar */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Opening</span>
                <span>Target</span>
                <span>Walk-Away</span>
                <span>Asking</span>
              </div>
              <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 via-blue-600 to-red-600 rounded-full"
                  style={{ width: '100%' }}
                />
                {/* Opening marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-green-300"
                  style={{ left: `${(result.openingOffer / result.ask) * 100}%` }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-blue-300"
                  style={{ left: `${(result.targetPrice / result.ask) * 100}%` }}
                />
                {/* Walk-away marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-red-300"
                  style={{ left: `${(result.walkAway / result.ask) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-green-400">{fmt(result.openingOffer)}</span>
                <span className="text-blue-400">{fmt(result.targetPrice)}</span>
                <span className="text-red-400">{fmt(result.walkAway)}</span>
                <span className="text-white">{fmt(result.ask)}</span>
              </div>
            </div>

            {/* Savings */}
            <div className="mt-4 bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4 text-center">
              <p className="text-sm text-emerald-400">
                At your target price, you save <span className="font-bold text-lg">{fmt(result.savingsAtTarget)}</span> ({pct(result.savingsPercent)} off)
              </p>
            </div>
          </div>

          {/* Counter-Offer Analyzer */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-3">Counter-Offer Analyzer</h2>
            <p className="text-sm text-gray-400 mb-4">They countered? Enter their price to see if it&apos;s a deal.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={counterOffer}
                  onChange={e => setCounterOffer(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-7 pr-4 py-3 text-white focus:border-blue-500 outline-none"
                  placeholder="Their counter..."
                />
              </div>
            </div>
            {result.counterVerdict && (
              <p className={`mt-3 text-sm font-medium ${result.counterColor}`}>
                {result.counterVerdict}
              </p>
            )}
          </div>

          {/* Negotiation Tactics */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Negotiation Tactics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TACTICS.map((t, i) => (
                <div key={i} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-yellow-400 mb-1">{t.title}</h3>
                  <p className="text-xs text-gray-400">{t.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What to Say */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">What to Say</h2>
            <div className="space-y-3">
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">OPENING LINE</p>
                <p className="text-sm text-white italic">
                  &ldquo;I like this card. Would you take {fmt(result.openingOffer)} cash?&rdquo;
                </p>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">IF THEY COUNTER HIGH</p>
                <p className="text-sm text-white italic">
                  &ldquo;I&apos;ve seen recent comps around {fmt(result.targetPrice)}. Could you meet me closer to there?&rdquo;
                </p>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">BUNDLE DEAL</p>
                <p className="text-sm text-white italic">
                  &ldquo;What if I grab a couple more cards? Can we work out a package deal?&rdquo;
                </p>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">WALK-AWAY LINE</p>
                <p className="text-sm text-white italic">
                  &ldquo;I appreciate it, but {fmt(result.walkAway)} is really my max. Let me think on it.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-800">
                    <th className="pb-2 pr-4">Factor</th>
                    <th className="pb-2 pr-4">Your Setting</th>
                    <th className="pb-2">Effect</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 pr-4">Venue</td>
                    <td className="py-2 pr-4">{VENUES.find(v => v.id === venue)?.label}</td>
                    <td className="py-2">{pct(VENUES.find(v => v.id === venue)!.discount)} typical discount</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 pr-4">Condition</td>
                    <td className="py-2 pr-4">{CONDITIONS.find(c => c.id === condition)?.label}</td>
                    <td className="py-2">Fair value ~{pct(CONDITIONS.find(c => c.id === condition)!.factor)} of asking</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 pr-4">Graded?</td>
                    <td className="py-2 pr-4">{isGraded ? 'Yes' : 'No'}</td>
                    <td className="py-2">{isGraded ? 'Less room — slabs have firm comps' : 'More room — raw cards are subjective'}</td>
                  </tr>
                  <tr className="border-b border-gray-800/50">
                    <td className="py-2 pr-4">Motivation</td>
                    <td className="py-2 pr-4">{MOTIVATIONS.find(m => m.id === motivation)?.label}</td>
                    <td className="py-2">{motivation === 'must_have' ? 'Conservative — protect the deal' : 'Aggressive — maximize savings'}</td>
                  </tr>
                  {venue === 'card_show' && (
                    <tr>
                      <td className="py-2 pr-4">Time of Day</td>
                      <td className="py-2 pr-4">{dayOfShow === 'early' ? 'Opening Hour' : dayOfShow === 'mid' ? 'Mid-Day' : 'Last Hour'}</td>
                      <td className="py-2">{dayOfShow === 'late' ? 'Best time — dealers want to clear inventory' : dayOfShow === 'early' ? 'Worst time — fresh inventory, firm prices' : 'Average — normal negotiation room'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Internal Links */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-gray-400 mb-3">Related Tools</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
                { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator' },
                { href: '/tools/show-planner', label: 'Show Profit Planner' },
                { href: '/tools/show-checklist', label: 'Show Checklist' },
                { href: '/tools/price-alert', label: 'Price Alert Generator' },
                { href: '/tools/damage-assessment', label: 'Damage Assessment' },
                { href: '/tools/condition-grader', label: 'Condition Grader' },
                { href: '/tools/auth-check', label: 'Authentication Checker' },
              ].map(l => (
                <a key={l.href} href={l.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
