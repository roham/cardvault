'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
interface ListingInput {
  player: string;
  year: string;
  set: string;
  cardNumber: string;
  parallel: string;
  grade: string;
  gradingCompany: string;
  auto: boolean;
  patch: boolean;
  numbered: string;
  condition: string;
  sport: string;
}

const defaultInput: ListingInput = {
  player: '',
  year: '2024',
  set: 'Topps Chrome',
  cardNumber: '',
  parallel: '',
  grade: '',
  gradingCompany: 'PSA',
  auto: false,
  patch: false,
  numbered: '',
  condition: 'Near Mint',
  sport: 'baseball',
};

const sports = ['baseball', 'basketball', 'football', 'hockey', 'soccer'];

const popularSets: Record<string, string[]> = {
  baseball: ['Topps', 'Topps Chrome', 'Bowman', 'Bowman Chrome', 'Topps Heritage', 'Topps Update', 'Topps Stadium Club', 'Panini Prizm', 'Topps Finest', 'Bowman 1st', 'Topps Series 1', 'Topps Series 2'],
  basketball: ['Panini Prizm', 'Panini Select', 'Donruss Optic', 'Donruss', 'Panini Mosaic', 'Panini Court Kings', 'Panini National Treasures', 'Panini Fleer', 'Topps Chrome', 'Panini Hoops'],
  football: ['Panini Prizm', 'Panini Select', 'Donruss Optic', 'Donruss', 'Panini Mosaic', 'Panini Playbook', 'Panini National Treasures', 'Panini Contenders', 'Topps Chrome', 'Bowman University'],
  hockey: ['Upper Deck', 'Upper Deck Young Guns', 'O-Pee-Chee', 'Upper Deck Series 1', 'Upper Deck Series 2', 'SP Authentic', 'Upper Deck Ice', 'Upper Deck Artifacts'],
  soccer: ['Topps Chrome', 'Panini Prizm', 'Panini Select', 'Topps Merlin', 'Panini Donruss', 'Topps Finest', 'Panini Mosaic'],
};

const parallels = [
  '', 'Silver', 'Gold', 'Red', 'Blue', 'Green', 'Orange', 'Purple', 'Pink',
  'Black', 'White', 'Camo', 'Holo', 'Refractor', 'Wave', 'Shimmer',
  'Prizm Silver', 'Prizm Gold', 'Prizm Red', 'Prizm Blue', 'Prizm Green',
  'Mojo', 'Xfractor', 'Gold Vinyl', 'SuperFractor', '1st Bowman Chrome',
  'Atomic', 'Speckle', 'Disco', 'Hyper', 'Fast Break', 'Choice',
];

const grades = ['', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'PSA 6', 'BGS 10', 'BGS 9.5', 'BGS 9', 'BGS 8.5', 'CGC 10', 'CGC 9.5', 'CGC 9', 'SGC 10', 'SGC 9.5', 'SGC 9'];

const conditionsRaw = ['Near Mint', 'Mint', 'Excellent', 'Very Good', 'Good', 'Fair'];

/* ───── Title Generation ───── */
function generateTitle(input: ListingInput): string {
  const parts: string[] = [];

  // Year
  if (input.year) parts.push(input.year);

  // Set name
  if (input.set) parts.push(input.set);

  // Player name
  if (input.player) parts.push(input.player);

  // Card number
  if (input.cardNumber) parts.push(`#${input.cardNumber}`);

  // Parallel
  if (input.parallel) parts.push(input.parallel);

  // Auto/Patch
  if (input.auto && input.patch) parts.push('Auto Patch');
  else if (input.auto) parts.push('Auto');
  else if (input.patch) parts.push('Patch');

  // Numbered
  if (input.numbered) parts.push(`/${input.numbered}`);

  // Grade
  if (input.grade) {
    parts.push(input.grade);
  } else {
    // RC designation for ungraded rookies
    parts.push('RC');
  }

  let title = parts.join(' ');

  // eBay title limit is 80 chars
  if (title.length > 80) {
    // Trim to fit
    title = title.slice(0, 77) + '...';
  }

  return title;
}

function generateTitleVariants(input: ListingInput): string[] {
  const variants: string[] = [];
  const base = generateTitle(input);
  variants.push(base);

  // Variant 2: Keyword-optimized
  const keywords: string[] = [];
  if (input.year) keywords.push(input.year);
  if (input.set) keywords.push(input.set);
  if (input.player) keywords.push(input.player);
  if (input.parallel) keywords.push(input.parallel);
  if (input.auto) keywords.push('Autograph');
  if (input.patch) keywords.push('Game-Used Patch');
  if (input.numbered) keywords.push(`#d /${input.numbered}`);
  if (input.grade) keywords.push(input.grade);
  if (input.cardNumber) keywords.push(`Card #${input.cardNumber}`);
  if (!input.grade) keywords.push('Raw');
  const kw = keywords.join(' ').slice(0, 80);
  variants.push(kw);

  // Variant 3: Short format
  const short: string[] = [];
  if (input.player) short.push(input.player);
  if (input.year) short.push(input.year);
  if (input.set) short.push(input.set);
  if (input.parallel) short.push(input.parallel);
  if (input.grade) short.push(input.grade);
  else short.push('RC');
  const sh = short.join(' ').slice(0, 80);
  variants.push(sh);

  return variants;
}

/* ───── Description Generation ───── */
function generateDescription(input: ListingInput): string {
  const lines: string[] = [];

  lines.push(`${input.year} ${input.set} ${input.player}${input.cardNumber ? ` #${input.cardNumber}` : ''}`);
  lines.push('');

  // Card details section
  lines.push('CARD DETAILS:');
  if (input.player) lines.push(`Player: ${input.player}`);
  if (input.year) lines.push(`Year: ${input.year}`);
  if (input.set) lines.push(`Set: ${input.set}`);
  if (input.cardNumber) lines.push(`Card Number: #${input.cardNumber}`);
  if (input.parallel) lines.push(`Parallel: ${input.parallel}`);
  if (input.numbered) lines.push(`Serial Numbered: /${input.numbered}`);
  if (input.auto) lines.push('Autograph: Yes (On-Card)');
  if (input.patch) lines.push('Patch/Relic: Yes (Game-Used)');
  lines.push(`Sport: ${input.sport.charAt(0).toUpperCase() + input.sport.slice(1)}`);
  lines.push('');

  // Condition/Grade
  if (input.grade) {
    lines.push('GRADE:');
    lines.push(`${input.grade} - Professionally graded and authenticated`);
    lines.push('Card is encased in a tamper-evident slab');
  } else {
    lines.push('CONDITION:');
    lines.push(`${input.condition} - Card has been stored in a penny sleeve and top loader`);
    lines.push('Please see photos for exact condition');
  }
  lines.push('');

  // Shipping
  lines.push('SHIPPING:');
  if (input.grade) {
    lines.push('- Graded card shipped in a padded bubble mailer or small box');
    lines.push('- Slab wrapped in bubble wrap for protection');
  } else {
    lines.push('- Card ships in a penny sleeve + top loader + team bag');
    lines.push('- Top loader taped shut and secured to cardboard backing');
    lines.push('- Shipped in a bubble mailer (PWE available on request)');
  }
  lines.push('- Tracking included on all orders');
  lines.push('- Combined shipping available for multiple purchases');
  lines.push('');

  // Terms
  lines.push('TERMS:');
  lines.push('- Payment due within 3 days of purchase');
  lines.push('- All sales are final - please review photos carefully');
  lines.push('- Message me with any questions before bidding');
  lines.push('');

  lines.push('Thank you for looking!');

  return lines.join('\n');
}

/* ───── Hashtags ───── */
function generateHashtags(input: ListingInput): string[] {
  const tags: string[] = [];

  if (input.sport) tags.push(`#${input.sport}cards`);
  if (input.player) {
    const clean = input.player.replace(/[^a-zA-Z]/g, '');
    tags.push(`#${clean}`);
  }
  if (input.set) {
    const setClean = input.set.replace(/[^a-zA-Z0-9]/g, '');
    tags.push(`#${setClean}`);
  }
  tags.push('#sportscards');
  tags.push('#cardcollecting');
  if (input.grade) tags.push('#gradedcards');
  else tags.push('#rawcards');
  if (input.auto) tags.push('#autograph');
  if (input.patch) tags.push('#gameworn');
  if (input.parallel) tags.push('#parallel');
  tags.push('#hobby');
  tags.push('#whodoyoucollect');
  if (input.sport === 'baseball') tags.push('#topps', '#mlb');
  if (input.sport === 'basketball') tags.push('#panini', '#nba');
  if (input.sport === 'football') tags.push('#panini', '#nfl');
  if (input.sport === 'hockey') tags.push('#upperdeck', '#nhl');

  return [...new Set(tags)].slice(0, 15);
}

/* ───── Pricing Tips ───── */
function getPricingTips(input: ListingInput): string[] {
  const tips: string[] = [];

  tips.push('Start auctions at $0.99 for maximum bidding activity');
  tips.push('BIN (Buy It Now) with Best Offer gets the most visibility');

  if (input.grade) {
    tips.push(`${input.grade} cards sell for 20-40% more than raw equivalents`);
    tips.push('Include clear photos of the slab label and all four corners');
  } else {
    tips.push('Raw cards with clear, well-lit photos sell 15% faster');
    tips.push('Mention if the card is "pack fresh" or recently pulled');
  }

  if (input.auto) {
    tips.push('Autograph cards command a 3-5x premium over base');
    tips.push('Mention if the auto is on-card vs sticker');
  }

  if (input.parallel) {
    tips.push(`${input.parallel} parallels typically sell for 2-10x over base depending on print run`);
  }

  if (input.numbered) {
    const num = parseInt(input.numbered);
    if (num <= 10) tips.push('Single-digit numbered cards are extremely rare - price accordingly');
    else if (num <= 25) tips.push('Low-numbered cards (/25 or less) command significant premiums');
    else if (num <= 99) tips.push('/99 or less cards are considered "short print" territory');
  }

  tips.push('List on Sunday evening (6-9 PM EST) for maximum auction end-time visibility');
  tips.push('Free shipping increases sell-through rate by 20-30%');

  return tips;
}

/* ───── Component ───── */
export default function ListingGenerator() {
  const [input, setInput] = useState<ListingInput>(defaultInput);
  const [copied, setCopied] = useState<string | null>(null);

  const titles = useMemo(() => generateTitleVariants(input), [input]);
  const description = useMemo(() => generateDescription(input), [input]);
  const hashtags = useMemo(() => generateHashtags(input), [input]);
  const pricingTips = useMemo(() => getPricingTips(input), [input]);
  const charCount = titles[0]?.length || 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const updateField = (field: keyof ListingInput, value: string | boolean) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const sportSets = popularSets[input.sport] || popularSets.baseball;

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Card Details</h3>
        <p className="text-gray-500 text-sm mb-6">Enter your card info and we&apos;ll generate optimized listing content.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Player Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Player Name *</label>
            <input
              type="text"
              value={input.player}
              onChange={e => updateField('player', e.target.value)}
              placeholder="e.g. Shohei Ohtani"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sport</label>
            <select
              value={input.sport}
              onChange={e => updateField('sport', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {sports.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
            <input
              type="text"
              value={input.year}
              onChange={e => updateField('year', e.target.value)}
              placeholder="e.g. 2024"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Set */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Set</label>
            <select
              value={input.set}
              onChange={e => updateField('set', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {sportSets.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
            <input
              type="text"
              value={input.cardNumber}
              onChange={e => updateField('cardNumber', e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Parallel */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Parallel</label>
            <select
              value={input.parallel}
              onChange={e => updateField('parallel', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Base (No Parallel)</option>
              {parallels.filter(p => p).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Grade (if graded)</label>
            <select
              value={input.grade}
              onChange={e => updateField('grade', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Raw (Ungraded)</option>
              {grades.filter(g => g).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Numbered */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Numbered (serial #)</label>
            <input
              type="text"
              value={input.numbered}
              onChange={e => updateField('numbered', e.target.value)}
              placeholder="e.g. 99, 25, 10, 1"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Condition (raw only) */}
          {!input.grade && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Condition</label>
              <select
                value={input.condition}
                onChange={e => updateField('condition', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                {conditionsRaw.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.auto}
              onChange={e => updateField('auto', e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Autograph</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={input.patch}
              onChange={e => updateField('patch', e.target.checked)}
              className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Patch / Relic</span>
          </label>
        </div>
      </div>

      {/* Generated Content */}
      {input.player && (
        <>
          {/* Title Variants */}
          <div className="bg-gradient-to-br from-blue-950/40 to-gray-900/60 border border-blue-800/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Listing Titles</h3>
              <span className={`text-xs font-mono px-2 py-1 rounded ${
                charCount <= 80 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-red-950/60 text-red-400 border border-red-800/50'
              }`}>
                {charCount}/80 chars
              </span>
            </div>

            <div className="space-y-3">
              {titles.map((title, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-gray-500 uppercase font-semibold">
                        {i === 0 ? 'Recommended' : i === 1 ? 'Keyword-Rich' : 'Short Format'}
                      </span>
                      {i === 0 && <span className="text-[10px] bg-blue-950/60 border border-blue-800/50 text-blue-400 px-1.5 py-0.5 rounded-full">BEST</span>}
                    </div>
                    <p className="text-white text-sm font-mono">{title}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{title.length} characters</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(title, `title-${i}`)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 hover:text-white rounded-lg transition-colors shrink-0"
                  >
                    {copied === `title-${i}` ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Listing Description</h3>
              <button
                onClick={() => copyToClipboard(description, 'description')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs text-white rounded-lg transition-colors"
              >
                {copied === 'description' ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <pre className="bg-gray-800/60 border border-gray-700/30 rounded-xl p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
              {description}
            </pre>
          </div>

          {/* Hashtags */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Social Hashtags</h3>
              <button
                onClick={() => copyToClipboard(hashtags.join(' '), 'hashtags')}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                {copied === 'hashtags' ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-blue-950/40 border border-blue-800/30 text-blue-400 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">Use these on Instagram, X, and TikTok when cross-posting your listing</p>
          </div>

          {/* Pricing Tips */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pricing & Selling Tips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pricingTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                  <span className="text-emerald-500 mt-0.5 shrink-0">$</span>
                  <p className="text-sm text-gray-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Tips */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Photo Tips for Maximum Sales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Front & Back', tip: 'Always show front and back of the card. Buyers want to verify condition on both sides.' },
                { title: 'Natural Light', tip: 'Use natural daylight or a desk lamp — avoid flash which creates glare on glossy cards.' },
                { title: 'Dark Background', tip: 'A dark background (black felt or mat) makes the card pop in listings.' },
                { title: 'Show All 4 Corners', tip: 'Include close-ups of all 4 corners. Corner condition is the #1 concern for buyers.' },
                { title: 'Include the Slab', tip: input.grade ? 'Show the full graded slab with the label clearly readable.' : 'If raw, show the card in its top loader or one-touch case.' },
                { title: 'Include Scale', tip: 'Place a penny or ruler for size reference on thick patches or relics.' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
                  <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-400">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Cross-links */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator' },
            { href: '/tools/condition-grader', label: 'Condition Grader' },
            { href: '/tools/grading-roi', label: 'Grading ROI' },
            { href: '/tools/dealer-scanner', label: 'Dealer Scanner' },
            { href: '/tools/auth-check', label: 'Auth Checker' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
