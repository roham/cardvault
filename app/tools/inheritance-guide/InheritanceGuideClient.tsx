'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ---------- Types ---------- */

type CollectionType = 'boxes' | 'binders' | 'singles' | 'graded' | 'sealed' | 'mixed';
type Size = 'small' | 'medium' | 'large' | 'huge';
type Era = 'pre-war' | 'vintage' | 'junk-wax' | 'modern' | 'ultra-modern' | 'mixed';
type Intent = 'sell-all' | 'sell-valuable' | 'keep' | 'not-sure';

interface Step {
  number: number;
  title: string;
  detail: string;
  timeEstimate: string;
  tools?: { href: string; label: string }[];
  warning?: string;
}

/* ---------- Data ---------- */

const COLLECTION_TYPES: { id: CollectionType; label: string; emoji: string; description: string }[] = [
  { id: 'boxes', label: 'Cardboard Boxes', emoji: '📦', description: 'Loose cards in shoeboxes, storage boxes, or rubber-banded bundles' },
  { id: 'binders', label: 'Binder Pages', emoji: '📒', description: 'Cards stored in 9-pocket binder pages, organized or not' },
  { id: 'singles', label: 'Individual Cards', emoji: '🃏', description: 'A few specific cards, possibly in sleeves or top-loaders' },
  { id: 'graded', label: 'Graded Slabs', emoji: '🏆', description: 'Cards already graded by PSA, BGS, CGC, or SGC in hard cases' },
  { id: 'sealed', label: 'Sealed Product', emoji: '🎁', description: 'Unopened boxes, packs, cases, or complete sealed sets' },
  { id: 'mixed', label: 'Everything Mixed', emoji: '🗃️', description: 'A combination of loose cards, binders, slabs, and sealed product' },
];

const SIZES: { id: Size; label: string; count: string }[] = [
  { id: 'small', label: 'Small', count: 'Under 100 cards' },
  { id: 'medium', label: 'Medium', count: '100 – 1,000 cards' },
  { id: 'large', label: 'Large', count: '1,000 – 10,000 cards' },
  { id: 'huge', label: 'Huge', count: '10,000+ cards' },
];

const ERAS: { id: Era; label: string; years: string }[] = [
  { id: 'pre-war', label: 'Pre-War', years: 'Before 1942' },
  { id: 'vintage', label: 'Vintage', years: '1952 – 1979' },
  { id: 'junk-wax', label: 'Junk Wax', years: '1980 – 1994' },
  { id: 'modern', label: 'Modern', years: '1995 – 2010' },
  { id: 'ultra-modern', label: 'Ultra-Modern', years: '2011 – Present' },
  { id: 'mixed', label: 'Mixed / Not Sure', years: 'Multiple eras' },
];

const INTENTS: { id: Intent; label: string; emoji: string }[] = [
  { id: 'sell-all', label: 'Sell everything', emoji: '💵' },
  { id: 'sell-valuable', label: 'Sell the valuable ones, keep the rest', emoji: '⚖️' },
  { id: 'keep', label: 'Keep the collection', emoji: '💎' },
  { id: 'not-sure', label: 'Not sure yet — need to know what I have', emoji: '🤔' },
];

/* ---------- Plan Generator ---------- */

function generatePlan(type: CollectionType, size: Size, era: Era, intent: Intent): { steps: Step[]; urgentWarnings: string[]; estimatedTime: string; valueEstimate: string } {
  const steps: Step[] = [];
  const urgentWarnings: string[] = [];
  let stepNum = 1;

  // Warning: don't clean or alter cards
  urgentWarnings.push('DO NOT clean, wipe, or alter any cards. Even well-meaning cleaning destroys value. Leave them exactly as they are.');

  if (era === 'pre-war' || era === 'vintage') {
    urgentWarnings.push('Handle pre-war and vintage cards with extreme care. Use clean, dry hands. Do not bend or stack heavy items on top.');
  }

  if (type === 'sealed') {
    urgentWarnings.push('Do NOT open sealed product. Sealed boxes and packs are often worth MORE than the cards inside. Get an appraisal first.');
  }

  // Step 1: Document everything
  steps.push({
    number: stepNum++,
    title: 'Document Everything First',
    detail: 'Before touching anything, take photos of the entire collection as you found it. Photograph boxes, binders, and any visible card fronts. This creates a record for insurance, estate purposes, and potential buyers.',
    timeEstimate: '15-30 minutes',
    warning: 'Take photos BEFORE sorting or moving cards. This protects you legally and helps with insurance claims.',
  });

  // Step 2: Sort by type
  if (type === 'mixed' || type === 'boxes' || size === 'large' || size === 'huge') {
    steps.push({
      number: stepNum++,
      title: 'Sort Into Categories',
      detail: 'Separate cards into piles: (1) Graded slabs (in hard plastic cases with labels), (2) Cards in top-loaders or sleeves — the previous owner thought these were important, (3) Binder pages, (4) Loose cards in boxes, (5) Sealed unopened product. The sleeved/top-loaded cards are your highest priority to evaluate.',
      timeEstimate: size === 'huge' ? '2-4 hours' : size === 'large' ? '1-2 hours' : '30-60 minutes',
    });
  }

  // Step 3: Identify the stars
  steps.push({
    number: stepNum++,
    title: 'Find the Stars',
    detail: 'Look for recognizable names: Mickey Mantle, Babe Ruth, Michael Jordan, LeBron James, Tom Brady, Wayne Gretzky, Mike Trout, Patrick Mahomes. Also look for "RC" (Rookie Card) markings and any cards with serial numbers on the back (e.g., "023/100"). These are your potential money cards.',
    timeEstimate: size === 'huge' ? '2-3 hours' : size === 'large' ? '1 hour' : '15-30 minutes',
    tools: [
      { href: '/tools/identify', label: 'Card Identifier' },
      { href: '/tools/vintage-evaluator', label: 'Vintage Card Evaluator' },
    ],
  });

  // Step 4: Check for graded slabs
  if (type === 'graded' || type === 'mixed') {
    steps.push({
      number: stepNum++,
      title: 'Look Up Graded Slabs',
      detail: 'Each graded slab has a certification number. Search that number on the grading company\'s website (PSA: psacard.com/cert, BGS: beckett.com/grading/card-lookup) to verify authenticity and see the card details. Then search the card name + grade on eBay "Sold Items" to see recent sale prices.',
      timeEstimate: '5 minutes per slab',
      tools: [
        { href: '/tools/cert-check', label: 'Cert Verifier' },
        { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
      ],
    });
  }

  // Step 5: Check sealed product
  if (type === 'sealed' || type === 'mixed') {
    steps.push({
      number: stepNum++,
      title: 'Evaluate Sealed Product',
      detail: 'Search each sealed box/pack on eBay "Sold Items" to see current market value. Some sealed boxes from the 1990s-2000s are worth hundreds or thousands of dollars. A sealed 1986 Fleer Basketball box can be worth $100,000+. Even common sealed wax from the 2000s often sells for 2-5x its original retail price.',
      timeEstimate: '5 minutes per item',
      tools: [{ href: '/tools/sealed-ev', label: 'Sealed EV Calculator' }],
    });
  }

  // Step 6: Value assessment
  steps.push({
    number: stepNum++,
    title: 'Get a Value Estimate',
    detail: era === 'junk-wax'
      ? 'For junk wax era cards (1980-1994), most commons are worth very little ($0.01-0.10 each). Focus ONLY on rookie cards of Hall of Famers and known error cards. A box of 1988 Donruss commons is worth $3-5 total, but a 1986 Fleer Jordan in that same box could be worth $3,000+.'
      : era === 'pre-war' || era === 'vintage'
        ? 'Vintage and pre-war cards almost always have value. Even common cards from before 1970 can be worth $5-50+ each depending on condition. Get a professional appraisal before selling — the difference between a $50 card and a $5,000 card often comes down to authentication and grading.'
        : 'Search each notable card on eBay using "Sold Items" filter to see what it actually sold for recently. PSA-graded copies sell for clear premiums. For raw cards, assume your condition is 1-2 grades below what you think it is — collectors are optimistic about their own cards.',
    timeEstimate: '30 minutes to 2 hours',
    tools: [
      { href: '/tools/collection-value', label: 'Collection Value Calculator' },
      { href: '/tools/condition-grader', label: 'Condition Grader' },
    ],
  });

  // Step 7: Decide what to grade
  if (intent === 'sell-all' || intent === 'sell-valuable') {
    steps.push({
      number: stepNum++,
      title: 'Decide What to Grade',
      detail: 'Only grade cards where the graded value exceeds the raw value by more than the grading cost ($20-50 per card). A card worth $30 raw probably shouldn\'t be graded. A card worth $200 raw that could be $800 in PSA 10 is a strong grading candidate. Focus on rookie cards of stars in excellent condition.',
      timeEstimate: '30 minutes',
      tools: [
        { href: '/tools/submission-planner', label: 'Grading Planner' },
        { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
      ],
    });
  }

  // Step 8: Selling strategy
  if (intent === 'sell-all' || intent === 'sell-valuable') {
    steps.push({
      number: stepNum++,
      title: 'Choose a Selling Strategy',
      detail: intent === 'sell-all'
        ? 'For selling everything: (1) Individual eBay listings for cards worth $25+, (2) eBay lots for cards worth $5-25, (3) Local card shop or Facebook group for bulk commons. For collections worth $5,000+, consider consignment with a reputable auction house like Heritage Auctions, PWCC, or Goldin. Get at least 2-3 offers before selling.'
        : 'List valuable cards ($50+) individually on eBay with good photos and accurate descriptions. Use COMC for mid-range cards ($10-50) — they handle photos, storage, and shipping. Keep the commons for personal enjoyment or donate them.',
      timeEstimate: 'Varies — days to weeks',
      tools: [
        { href: '/tools/listing-generator', label: 'eBay Listing Generator' },
        { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
        { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator' },
      ],
    });
  }

  // Step 9: Storage/preservation
  if (intent === 'keep' || intent === 'sell-valuable') {
    steps.push({
      number: stepNum++,
      title: 'Store Cards Properly',
      detail: 'Put valuable cards in penny sleeves first, then top-loaders. Store in a cool, dry location away from direct sunlight. Never use rubber bands (they damage edges) or PVC-containing binder pages (they cause surface damage over time). Consider a fireproof safe for high-value items.',
      timeEstimate: '1-2 hours',
      tools: [
        { href: '/tools/storage-calc', label: 'Storage Calculator' },
        { href: '/tools/holder-guide', label: 'Holder Guide' },
        { href: '/tools/insurance-calc', label: 'Insurance Calculator' },
      ],
    });
  }

  // Step 10: Tax implications
  if (intent === 'sell-all' || intent === 'sell-valuable') {
    steps.push({
      number: stepNum++,
      title: 'Understand Tax Implications',
      detail: 'Inherited collectibles receive a "stepped-up basis" — the cost basis is the fair market value on the date of death, not what the original owner paid. This can significantly reduce capital gains taxes. For large collections ($10,000+), consult a tax professional. Collectibles are taxed at up to 28% federal (higher than regular capital gains).',
      timeEstimate: '30 minutes research',
      tools: [{ href: '/tools/tax-calc', label: 'Card Tax Calculator' }],
      warning: 'This is general information, not tax advice. Consult a CPA or tax attorney for your specific situation.',
    });
  }

  // Estimated total time
  const timeMap: Record<Size, string> = {
    small: '2-4 hours total',
    medium: '1-2 days total',
    large: '3-7 days total',
    huge: '1-3 weeks total',
  };

  // Value estimate
  let valueEstimate = '';
  if (era === 'pre-war') {
    valueEstimate = size === 'small' ? '$500 – $50,000+' : size === 'medium' ? '$2,000 – $200,000+' : '$10,000 – $1,000,000+';
  } else if (era === 'vintage') {
    valueEstimate = size === 'small' ? '$100 – $10,000+' : size === 'medium' ? '$500 – $50,000+' : '$2,000 – $200,000+';
  } else if (era === 'junk-wax') {
    valueEstimate = size === 'small' ? '$5 – $500' : size === 'medium' ? '$10 – $2,000' : '$50 – $5,000';
  } else if (era === 'modern') {
    valueEstimate = size === 'small' ? '$20 – $2,000' : size === 'medium' ? '$50 – $10,000' : '$200 – $50,000+';
  } else if (era === 'ultra-modern') {
    valueEstimate = size === 'small' ? '$50 – $5,000' : size === 'medium' ? '$100 – $20,000' : '$500 – $100,000+';
  } else {
    valueEstimate = size === 'small' ? '$20 – $5,000' : size === 'medium' ? '$100 – $20,000' : '$500 – $100,000+';
  }

  return { steps, urgentWarnings, estimatedTime: timeMap[size], valueEstimate };
}

/* ---------- Component ---------- */

export default function InheritanceGuideClient() {
  const [collectionType, setCollectionType] = useState<CollectionType | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [era, setEra] = useState<Era | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  const canGenerate = collectionType && size && era && intent;

  const plan = canGenerate ? generatePlan(collectionType, size, era, intent) : null;

  const handleReset = () => {
    setCollectionType(null);
    setSize(null);
    setEra(null);
    setIntent(null);
    setShowPlan(false);
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Collection Type */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">1</span>
          <h2 className="text-lg font-bold text-white">What did you inherit?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLLECTION_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setCollectionType(t.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                collectionType === t.id
                  ? 'bg-purple-950/60 border-purple-600 ring-1 ring-purple-500'
                  : 'bg-gray-900/60 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{t.emoji}</span>
                <span className="text-white font-semibold">{t.label}</span>
              </div>
              <div className="text-gray-500 text-xs">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Size */}
      {collectionType && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">2</span>
            <h2 className="text-lg font-bold text-white">How much is there?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SIZES.map(s => (
              <button
                key={s.id}
                onClick={() => setSize(s.id)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  size === s.id
                    ? 'bg-purple-950/60 border-purple-600 ring-1 ring-purple-500'
                    : 'bg-gray-900/60 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-white font-semibold mb-1">{s.label}</div>
                <div className="text-gray-500 text-xs">{s.count}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Era */}
      {collectionType && size && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">3</span>
            <h2 className="text-lg font-bold text-white">What era are the cards from?</h2>
          </div>
          <p className="text-gray-400 text-sm mb-3">Check the copyright year on the back of any card.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ERAS.map(e => (
              <button
                key={e.id}
                onClick={() => setEra(e.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  era === e.id
                    ? 'bg-purple-950/60 border-purple-600 ring-1 ring-purple-500'
                    : 'bg-gray-900/60 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-white font-semibold text-sm">{e.label}</div>
                <div className="text-gray-500 text-xs">{e.years}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Intent */}
      {collectionType && size && era && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">4</span>
            <h2 className="text-lg font-bold text-white">What do you want to do with it?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTENTS.map(i => (
              <button
                key={i.id}
                onClick={() => setIntent(i.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  intent === i.id
                    ? 'bg-purple-950/60 border-purple-600 ring-1 ring-purple-500'
                    : 'bg-gray-900/60 border-gray-700 hover:border-gray-600'
                }`}
              >
                <span className="text-xl mr-2">{i.emoji}</span>
                <span className="text-white font-medium">{i.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {canGenerate && !showPlan && (
        <button
          onClick={() => setShowPlan(true)}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-lg transition-colors"
        >
          Get My Action Plan
        </button>
      )}

      {/* Results */}
      {showPlan && plan && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-purple-950/60 border border-purple-700/50 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-purple-300 mb-3">Your Inheritance Action Plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900/60 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs uppercase mb-1">Estimated Value Range</div>
                <div className="text-white font-bold text-lg">{plan.valueEstimate}</div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs uppercase mb-1">Total Time Needed</div>
                <div className="text-white font-bold text-lg">{plan.estimatedTime}</div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-3 text-center">
                <div className="text-gray-400 text-xs uppercase mb-1">Steps</div>
                <div className="text-white font-bold text-lg">{plan.steps.length} steps</div>
              </div>
            </div>
          </div>

          {/* Urgent Warnings */}
          <div className="bg-red-950/30 border border-red-800/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-red-300 mb-3">Before You Start</h3>
            <div className="space-y-2">
              {plan.urgentWarnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-400 mt-0.5 shrink-0">!</span>
                  <span className="text-red-200/80">{w}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-Step Plan */}
          <div className="space-y-4">
            {plan.steps.map(step => (
              <div key={step.number} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/30 text-purple-400 text-lg font-bold shrink-0">
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-bold text-lg">{step.title}</h4>
                      <span className="text-gray-500 text-xs bg-gray-700/50 px-2 py-1 rounded-full">{step.timeEstimate}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{step.detail}</p>

                    {step.warning && (
                      <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-3 mb-3">
                        <p className="text-yellow-200/80 text-xs">{step.warning}</p>
                      </div>
                    )}

                    {step.tools && step.tools.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {step.tools.map(tool => (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/30 hover:bg-purple-800/40 border border-purple-700/30 rounded-lg text-purple-300 text-xs font-medium transition-colors"
                          >
                            Use: {tool.label} &rarr;
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Common Mistakes */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Common Mistakes to Avoid</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">1.</span>
                <div>
                  <span className="text-white font-medium">Selling to the first buyer who offers.</span>
                  <span className="text-gray-400"> Card shops often offer 30-50% of market value. Get multiple offers and check eBay sold prices first.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">2.</span>
                <div>
                  <span className="text-white font-medium">Assuming old = valuable.</span>
                  <span className="text-gray-400"> A 1989 Topps box has 500 cards worth $3 total. Age alone doesn&apos;t determine value — player, condition, and scarcity matter more.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">3.</span>
                <div>
                  <span className="text-white font-medium">Opening sealed product.</span>
                  <span className="text-gray-400"> A sealed 1996 Topps Chrome box sells for $5,000+. The cards inside are worth a fraction of that. Always check sealed value first.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">4.</span>
                <div>
                  <span className="text-white font-medium">Grading everything.</span>
                  <span className="text-gray-400"> Grading costs $20-50 per card. Only grade cards where the graded value significantly exceeds raw value. Never grade commons.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">5.</span>
                <div>
                  <span className="text-white font-medium">Throwing away the &quot;junk.&quot;</span>
                  <span className="text-gray-400"> Even bulk commons can be sold for $5-20 per thousand. Sealed complete sets from the 80s-90s may be worth $20-100+.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Start Over */}
          <button
            onClick={handleReset}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
          >
            Start Over with Different Collection
          </button>
        </div>
      )}
    </div>
  );
}
