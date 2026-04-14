'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Authentication checks ───── */
interface AuthCheck {
  id: string;
  category: string;
  categoryColor: string;
  name: string;
  description: string;
  passDescription: string;
  failDescription: string;
  weight: number; // 1-5, how important this check is
  tip: string;
}

const authChecks: AuthCheck[] = [
  // Visual checks
  {
    id: 'print-quality',
    category: 'Visual',
    categoryColor: 'text-blue-400',
    name: 'Print Quality & Sharpness',
    description: 'Look at the text and images under magnification. Are edges crisp? Are colors vibrant and consistent?',
    passDescription: 'Text is sharp, colors are vibrant, dot pattern is consistent',
    failDescription: 'Blurry text, washed-out colors, visible banding or inconsistent dot pattern',
    weight: 5,
    tip: 'Use a 10x jeweler\'s loupe or phone macro mode. Fakes often show fuzzy text, especially in small print like card numbers and copyright lines.',
  },
  {
    id: 'color-accuracy',
    category: 'Visual',
    categoryColor: 'text-blue-400',
    name: 'Color Matching',
    description: 'Compare colors to a known authentic card from the same set. Does the overall hue and saturation match?',
    passDescription: 'Colors match authentic reference — correct hue, saturation, and contrast',
    failDescription: 'Colors are off — too dark, too light, wrong hue, or oversaturated',
    weight: 4,
    tip: 'Common fake tells: yellow tones instead of white borders, overly vivid or neon-looking colors, or a blueish tint to the entire card.',
  },
  {
    id: 'surface-texture',
    category: 'Visual',
    categoryColor: 'text-blue-400',
    name: 'Surface Texture & Finish',
    description: 'Feel the card surface. Is the gloss/matte finish consistent? Does it match the expected finish for this product?',
    passDescription: 'Surface finish is consistent and matches the expected product type',
    failDescription: 'Surface is too glossy, too matte, uneven, or has a plastic/waxy feel',
    weight: 4,
    tip: 'Chrome and refractor cards should have a specific reflective pattern. If the refraction looks "off" or too uniform, it may be a color-printed reproduction.',
  },
  // Physical checks
  {
    id: 'card-stock',
    category: 'Physical',
    categoryColor: 'text-emerald-400',
    name: 'Card Stock Thickness & Feel',
    description: 'Hold the card. Does it feel the right thickness? Is it too flimsy or too rigid compared to authentic cards?',
    passDescription: 'Thickness and rigidity match authentic cards from this era and product',
    failDescription: 'Card feels too thin, too thick, too flexible, or unnaturally stiff',
    weight: 5,
    tip: 'Stack the suspect card with known authentics from the same set. They should be the same thickness. Fakes are often printed on different cardstock.',
  },
  {
    id: 'light-test',
    category: 'Physical',
    categoryColor: 'text-emerald-400',
    name: 'Light Test (Flashlight Behind Card)',
    description: 'Hold a bright light or flashlight behind the card. How much light passes through?',
    passDescription: 'Light transmission matches authentic cards — typically very little for modern cards',
    failDescription: 'Too much light passes through (thin paper) or too little (thick counterfeit stock)',
    weight: 4,
    tip: 'Modern sports cards should block most light. If you can clearly see the flashlight through the card, it may be printed on regular paper. Vintage cards allow slightly more light.',
  },
  {
    id: 'edge-quality',
    category: 'Physical',
    categoryColor: 'text-emerald-400',
    name: 'Edge Cut Quality',
    description: 'Examine the edges under magnification. Are the cuts clean and consistent?',
    passDescription: 'Edges are clean-cut, consistent on all four sides, corners are sharp',
    failDescription: 'Rough or uneven edges, visible paper fibers, inconsistent cut angles',
    weight: 3,
    tip: 'Factory-cut cards have very uniform edges. Hand-cut fakes often show slight irregularities. Compare edge quality to known authentic cards from the same product.',
  },
  {
    id: 'bend-test',
    category: 'Physical',
    categoryColor: 'text-emerald-400',
    name: 'Flex/Bend Test',
    description: 'Gently flex the card. Does it spring back naturally? Does the flexibility feel right?',
    passDescription: 'Card flexes and springs back naturally with appropriate resistance',
    failDescription: 'Card is too rigid (won\'t flex), too floppy, or creases too easily',
    weight: 3,
    tip: 'Be very gentle — you don\'t want to damage a real card. Authentic cards have a specific springiness to their cardstock. Fakes printed on photo paper often feel different.',
  },
  // Detail checks
  {
    id: 'hologram',
    category: 'Detail',
    categoryColor: 'text-purple-400',
    name: 'Hologram / Security Features',
    description: 'Check for the hologram sticker or security features specific to this product (if applicable).',
    passDescription: 'Hologram is present, shifts correctly, and matches known authentic pattern',
    failDescription: 'Missing hologram, static image instead of shifting, wrong pattern, or bubbled sticker',
    weight: 5,
    tip: 'Many modern cards have foil stamps or holograms (e.g., Topps chrome logo, Panini hologram). These are very hard to replicate. A missing or poor hologram is a strong fake indicator.',
  },
  {
    id: 'serial-number',
    category: 'Detail',
    categoryColor: 'text-purple-400',
    name: 'Serial Number / Numbering',
    description: 'If the card is numbered (/25, /99, etc.), check the numbering quality and placement.',
    passDescription: 'Numbering is clean, properly stamped/foiled, and in the correct location',
    failDescription: 'Numbering looks printed (not stamped), wrong font, wrong placement, or inconsistent',
    weight: 4,
    tip: 'Hand-numbered cards should show slight variation. Machine-numbered cards should be perfectly consistent. If the numbering looks like it was inkjet printed, it\'s likely fake.',
  },
  {
    id: 'back-design',
    category: 'Detail',
    categoryColor: 'text-purple-400',
    name: 'Card Back Design & Text',
    description: 'Flip the card over. Check stats, copyright text, card number, and overall design against known authentic examples.',
    passDescription: 'Back matches authentic reference — correct stats, fonts, layout, and copyright',
    failDescription: 'Wrong stats, missing copyright, incorrect font, or design doesn\'t match the set',
    weight: 4,
    tip: 'Fakers often focus on the front and neglect the back. Check for typos, incorrect stats, wrong copyright year, or missing legal text. This is where many fakes fail.',
  },
  {
    id: 'centering',
    category: 'Detail',
    categoryColor: 'text-purple-400',
    name: 'Border Centering Consistency',
    description: 'Look at the borders. While centering varies on real cards, are the borders proportional and consistent?',
    passDescription: 'Borders are proportional and consistent with factory centering variation',
    failDescription: 'Wildly off-center in a way inconsistent with factory variation, or borders look trimmed',
    weight: 2,
    tip: 'Some fakes are trimmed from larger prints. If borders look suspiciously perfect (exactly equal on all sides), it could be a trimmed reproduction.',
  },
  // Provenance
  {
    id: 'provenance',
    category: 'Provenance',
    categoryColor: 'text-yellow-400',
    name: 'Source & Seller Reputation',
    description: 'Where did this card come from? Is the seller reputable? Does the price seem too good to be true?',
    passDescription: 'Card comes from a reputable source with a verifiable sales history',
    failDescription: 'Unknown seller, no sales history, price is suspiciously low for the card',
    weight: 4,
    tip: 'If a PSA 10 Luka Doncic Prizm RC is priced at 20% of market value, something is wrong. Buy from established sellers, card shows with return policies, or reputable online platforms.',
  },
];

type CheckStatus = 'pass' | 'fail' | 'skip' | 'unchecked';

export default function AuthCheckTool() {
  const [statuses, setStatuses] = useState<Record<string, CheckStatus>>(() => {
    const init: Record<string, CheckStatus> = {};
    for (const check of authChecks) init[check.id] = 'unchecked';
    return init;
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const setStatus = (id: string, status: CheckStatus) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
  };

  const verdict = useMemo(() => {
    const checked = authChecks.filter(c => statuses[c.id] !== 'unchecked');
    if (checked.length === 0) return null;

    const passed = checked.filter(c => statuses[c.id] === 'pass');
    const failed = checked.filter(c => statuses[c.id] === 'fail');
    const skipped = checked.filter(c => statuses[c.id] === 'skip');

    const maxScore = checked.filter(c => statuses[c.id] !== 'skip').reduce((sum, c) => sum + c.weight, 0);
    const actualScore = passed.reduce((sum, c) => sum + c.weight, 0);
    const failScore = failed.reduce((sum, c) => sum + c.weight, 0);
    const pct = maxScore > 0 ? (actualScore / maxScore) * 100 : 0;

    let level: 'authentic' | 'likely-authentic' | 'suspicious' | 'likely-fake' | 'fake';
    let label: string;
    let color: string;
    let bgColor: string;

    if (pct >= 90) { level = 'authentic'; label = 'LIKELY AUTHENTIC'; color = 'text-emerald-400'; bgColor = 'bg-emerald-900/40'; }
    else if (pct >= 70) { level = 'likely-authentic'; label = 'PROBABLY AUTHENTIC'; color = 'text-green-400'; bgColor = 'bg-green-900/40'; }
    else if (pct >= 50) { level = 'suspicious'; label = 'SUSPICIOUS \u2014 PROCEED WITH CAUTION'; color = 'text-yellow-400'; bgColor = 'bg-yellow-900/40'; }
    else if (pct >= 30) { level = 'likely-fake'; label = 'LIKELY COUNTERFEIT'; color = 'text-orange-400'; bgColor = 'bg-orange-900/40'; }
    else { level = 'fake'; label = 'ALMOST CERTAINLY FAKE'; color = 'text-red-400'; bgColor = 'bg-red-900/40'; }

    return { level, label, color, bgColor, pct, passed: passed.length, failed: failed.length, skipped: skipped.length, total: checked.length, failScore, maxScore, actualScore };
  }, [statuses]);

  const categories = [...new Set(authChecks.map(c => c.category))];
  const resetAll = () => {
    const fresh: Record<string, CheckStatus> = {};
    for (const check of authChecks) fresh[check.id] = 'unchecked';
    setStatuses(fresh);
    setExpandedId(null);
  };

  const checkedCount = authChecks.filter(c => statuses[c.id] !== 'unchecked').length;

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Checks completed: {checkedCount}/{authChecks.length}</span>
          {checkedCount > 0 && (
            <button onClick={resetAll} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">Reset all</button>
          )}
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(checkedCount / authChecks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checks by category */}
      {categories.map(category => {
        const checks = authChecks.filter(c => c.category === category);
        return (
          <div key={category}>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className={checks[0].categoryColor}>{category}</span>
              <span className="text-zinc-600 text-sm font-normal">({checks.length} checks)</span>
            </h2>
            <div className="space-y-2">
              {checks.map(check => {
                const status = statuses[check.id];
                const isExpanded = expandedId === check.id;
                return (
                  <div
                    key={check.id}
                    className={`rounded-xl border transition-all ${
                      status === 'pass' ? 'bg-emerald-950/20 border-emerald-800/50' :
                      status === 'fail' ? 'bg-red-950/20 border-red-800/50' :
                      status === 'skip' ? 'bg-zinc-900/40 border-zinc-800/50' :
                      'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : check.id)}
                            className="text-left w-full"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                check.weight >= 5 ? 'bg-red-900/50 text-red-400' :
                                check.weight >= 4 ? 'bg-yellow-900/50 text-yellow-400' :
                                'bg-zinc-800 text-zinc-400'
                              }`}>
                                {check.weight >= 5 ? 'Critical' : check.weight >= 4 ? 'Important' : 'Helpful'}
                              </span>
                              <span className={`text-xs ${check.categoryColor}`}>{check.category}</span>
                            </div>
                            <h3 className="text-white font-medium text-sm">{check.name}</h3>
                            <p className="text-zinc-400 text-xs mt-1">{check.description}</p>
                          </button>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => setStatus(check.id, status === 'pass' ? 'unchecked' : 'pass')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              status === 'pass'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-900/50 hover:text-emerald-400'
                            }`}
                          >
                            Pass
                          </button>
                          <button
                            onClick={() => setStatus(check.id, status === 'fail' ? 'unchecked' : 'fail')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              status === 'fail'
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-red-900/50 hover:text-red-400'
                            }`}
                          >
                            Fail
                          </button>
                          <button
                            onClick={() => setStatus(check.id, status === 'skip' ? 'unchecked' : 'skip')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              status === 'skip'
                                ? 'bg-zinc-600 text-white'
                                : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
                            }`}
                          >
                            N/A
                          </button>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-zinc-800/50 space-y-2">
                          <div className="flex gap-2">
                            <span className="text-emerald-400 text-xs shrink-0">Pass:</span>
                            <span className="text-zinc-400 text-xs">{check.passDescription}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-red-400 text-xs shrink-0">Fail:</span>
                            <span className="text-zinc-400 text-xs">{check.failDescription}</span>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
                            <p className="text-zinc-300 text-xs"><span className="text-yellow-400 font-medium">Pro tip: </span>{check.tip}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Verdict */}
      {verdict && (
        <div className={`rounded-xl border p-6 ${verdict.bgColor} border-zinc-800`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Authentication Verdict</h2>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${verdict.bgColor} ${verdict.color} border border-current/20`}>
              {verdict.label}
            </span>
          </div>
          <div className="grid sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-zinc-900/60 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{verdict.passed}</p>
              <p className="text-zinc-500 text-xs">Passed</p>
            </div>
            <div className="bg-zinc-900/60 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{verdict.failed}</p>
              <p className="text-zinc-500 text-xs">Failed</p>
            </div>
            <div className="bg-zinc-900/60 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-zinc-400">{verdict.skipped}</p>
              <p className="text-zinc-500 text-xs">Skipped</p>
            </div>
            <div className="bg-zinc-900/60 rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${verdict.color}`}>{verdict.pct.toFixed(0)}%</p>
              <p className="text-zinc-500 text-xs">Confidence</p>
            </div>
          </div>
          {/* Score bar */}
          <div className="w-full bg-zinc-800 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                verdict.pct >= 90 ? 'bg-emerald-500' :
                verdict.pct >= 70 ? 'bg-green-500' :
                verdict.pct >= 50 ? 'bg-yellow-500' :
                verdict.pct >= 30 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${verdict.pct}%` }}
            />
          </div>
          <p className="text-zinc-400 text-xs mt-3">
            {verdict.level === 'authentic' && 'This card passes all major authentication checks. While no visual inspection is 100% definitive, the evidence strongly suggests authenticity.'}
            {verdict.level === 'likely-authentic' && 'Most checks pass. A few minor concerns, but overall the card appears genuine. Consider professional authentication for high-value cards.'}
            {verdict.level === 'suspicious' && 'Several checks raised concerns. Do NOT buy this card without professional authentication from PSA, BGS, or CGC. Request more photos and provenance.'}
            {verdict.level === 'likely-fake' && 'Multiple critical checks failed. This card has strong indicators of being counterfeit. Do not purchase unless professionally authenticated.'}
            {verdict.level === 'fake' && 'This card fails most authentication checks. It is almost certainly a reproduction or counterfeit. Do not purchase.'}
          </p>
        </div>
      )}

      {/* Equipment guide */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Authentication Equipment</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { name: '10x Jeweler\'s Loupe', price: '$5-15', use: 'See print quality, dot pattern, edge detail', essential: true },
            { name: 'UV Blacklight', price: '$8-15', use: 'Detect paper whiteners and security features', essential: false },
            { name: 'LED Flashlight', price: '$5-10', use: 'Light test for card stock thickness', essential: true },
            { name: 'Digital Scale', price: '$10-20', use: 'Verify card weight vs authentic reference', essential: false },
            { name: 'Phone Macro Lens', price: '$10-20', use: 'Photograph print details for comparison', essential: false },
            { name: 'Known Authentic Card', price: 'Varies', use: 'Side-by-side comparison reference', essential: true },
          ].map(item => (
            <div key={item.name} className={`rounded-lg p-4 ${item.essential ? 'bg-emerald-950/20 border border-emerald-800/30' : 'bg-zinc-800/50'}`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-medium text-sm">{item.name}</h3>
                {item.essential && <span className="text-emerald-400 text-xs">Essential</span>}
              </div>
              <p className="text-zinc-500 text-xs mb-1">{item.price}</p>
              <p className="text-zinc-400 text-xs">{item.use}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Most commonly faked */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Most Commonly Faked Cards</h2>
        <p className="text-zinc-400 text-sm mb-4">Be extra careful when buying these — they are the most frequently counterfeited cards in the hobby:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { card: '1952 Topps Mickey Mantle #311', reason: 'Most valuable post-war card — fakes range from obvious reprints to sophisticated forgeries' },
            { card: '1986 Fleer Michael Jordan #57', reason: 'Most iconic basketball card — fake stickers, trimmed cards, and color-printed reproductions are common' },
            { card: '1st Edition Base Set Charizard', reason: 'Most valuable Pokemon card — fake 1st edition stamps, re-glued packaging, and reprints everywhere' },
            { card: '2003 Topps Chrome LeBron #111', reason: 'Modern grail — refractor fakes, re-colored base cards, and altered serial numbers' },
            { card: '1916 Sporting News Babe Ruth M101-4', reason: 'Pre-war icon — sophisticated reproductions on aged paper stock' },
            { card: '2018 Prizm Luka Doncic #280', reason: 'Modern hype — fake silver Prizm parallels and altered base cards to mimic rarer variants' },
          ].map(item => (
            <div key={item.card} className="bg-zinc-800/50 rounded-lg p-3">
              <h3 className="text-white font-medium text-sm mb-1">{item.card}</h3>
              <p className="text-zinc-400 text-xs">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Condition Self-Grader', href: '/tools/condition-grader', desc: 'Assess your card\'s grade potential' },
            { title: 'Population Report', href: '/tools/pop-report', desc: 'Check scarcity — rare cards are faked more' },
            { title: 'Centering Calculator', href: '/tools/centering-calc', desc: 'Check if centering looks factory-authentic' },
            { title: 'Submission Planner', href: '/tools/submission-planner', desc: 'Plan professional authentication submission' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-emerald-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
