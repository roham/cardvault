'use client';

import { useState } from 'react';

type Issue = 'fingerprints' | 'dust' | 'surface_dirt' | 'wax_stains' | 'sticky_residue' | 'yellowing' | 'odor' | 'none';
type Material = 'modern' | 'vintage' | 'chrome' | 'canvas' | 'acetate';
type Protection = 'raw' | 'penny_sleeve' | 'toploader' | 'one_touch' | 'graded_slab';

interface CareResult {
  canClean: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'do_not_touch';
  method: string;
  supplies: string[];
  steps: string[];
  warnings: string[];
  preventionTips: string[];
}

const ISSUES: { id: Issue; label: string; desc: string }[] = [
  { id: 'none', label: 'No Issues — Just Want to Protect', desc: 'Card is clean, I want storage & handling advice' },
  { id: 'fingerprints', label: 'Fingerprints / Smudges', desc: 'Oily marks visible on surface or edges' },
  { id: 'dust', label: 'Dust / Loose Debris', desc: 'Fine particles sitting on the surface' },
  { id: 'surface_dirt', label: 'Surface Dirt / Grime', desc: 'Visible dirt marks, not just dust' },
  { id: 'wax_stains', label: 'Wax Stains (from packs)', desc: 'Yellowish wax residue from vintage packs' },
  { id: 'sticky_residue', label: 'Sticky Residue / Sticker Marks', desc: 'Adhesive left from stickers or tape' },
  { id: 'yellowing', label: 'Yellowing / Age Discoloration', desc: 'Card has turned yellow with age' },
  { id: 'odor', label: 'Smoke / Musty Odor', desc: 'Card smells like smoke, mildew, or must' },
];

const MATERIALS: { id: Material; label: string }[] = [
  { id: 'modern', label: 'Modern Card Stock (2000+)' },
  { id: 'vintage', label: 'Vintage Card Stock (pre-1980)' },
  { id: 'chrome', label: 'Chrome / Refractor / Foil' },
  { id: 'canvas', label: 'Canvas / Textured Surface' },
  { id: 'acetate', label: 'Acetate / Clear Cards' },
];

const PROTECTIONS: { id: Protection; label: string }[] = [
  { id: 'raw', label: 'Raw — No Protection' },
  { id: 'penny_sleeve', label: 'Penny Sleeve Only' },
  { id: 'toploader', label: 'Penny Sleeve + Toploader' },
  { id: 'one_touch', label: 'One-Touch Magnetic Case' },
  { id: 'graded_slab', label: 'Graded Slab (PSA/BGS/CGC)' },
];

function getCareResult(issue: Issue, material: Material, protection: Protection): CareResult {
  // Graded slabs — never open
  if (protection === 'graded_slab') {
    return {
      canClean: false,
      riskLevel: 'do_not_touch',
      method: 'Do not open graded slabs',
      supplies: ['Microfiber cloth for slab exterior only'],
      steps: [
        'Only clean the outside of the slab — never open it.',
        'Use a slightly damp microfiber cloth on the slab exterior.',
        'Dry immediately with a separate dry microfiber cloth.',
        'Store slab upright to prevent settling.',
      ],
      warnings: ['Opening a graded slab voids the grade and destroys the slab.', 'Any attempt to clean the card inside is not possible without cracking.'],
      preventionTips: ['Store slabs upright in a cool, dry location.', 'Use slab bags to prevent scratching the case.', 'Keep away from direct sunlight to prevent UV damage.'],
    };
  }

  if (issue === 'none') {
    return {
      canClean: true,
      riskLevel: 'low',
      method: 'Prevention & proper storage',
      supplies: ['Penny sleeves (acid-free)', 'Semi-rigid toploaders or One-Touch cases', 'Storage box (card house or BCW)', 'Silica gel packets (humidity control)'],
      steps: [
        'Handle cards by the edges only — never touch the face.',
        'Insert into a penny sleeve top-first to prevent edge damage.',
        'Place sleeved card into a toploader or One-Touch.',
        'Store upright in a card box, away from sunlight and heat.',
        'Add silica gel packets to storage boxes for humidity control.',
      ],
      warnings: ['Rubber bands damage edges — never use them.', 'Avoid storing in attics, basements, or garages.'],
      preventionTips: ['Wash hands before handling cards.', 'Work on a clean, soft surface.', 'Keep beverages away from your collection.', 'Maintain room temp: 65-72F, 35-45% humidity.'],
    };
  }

  if (issue === 'fingerprints') {
    const isChrome = material === 'chrome' || material === 'acetate';
    return {
      canClean: true,
      riskLevel: isChrome ? 'medium' : 'low',
      method: isChrome ? 'Gentle microfiber buff (extra care on foil)' : 'Microfiber cloth buff',
      supplies: ['Clean, dry microfiber cloth', 'Cotton gloves (for handling after)'],
      steps: [
        'Remove card from any sleeve or holder.',
        'Place card on a clean, soft surface (felt or microfiber).',
        isChrome
          ? 'Very gently wipe in one direction with a microfiber cloth. Do NOT rub chrome surfaces aggressively.'
          : 'Gently wipe the surface with a clean, dry microfiber cloth in one direction.',
        'Inspect under light for remaining marks.',
        'Re-sleeve immediately after cleaning.',
      ],
      warnings: [
        'Never use water, glass cleaner, or any liquid on cards.',
        isChrome ? 'Chrome/foil surfaces scratch easily — minimal pressure only.' : 'Do not rub aggressively — this can cause surface wear.',
        'Do not use paper towels — they leave micro-scratches.',
      ],
      preventionTips: ['Always handle cards by edges.', 'Wear cotton gloves for valuable cards.', 'Sleeve cards immediately after opening packs.'],
    };
  }

  if (issue === 'dust') {
    return {
      canClean: true,
      riskLevel: 'low',
      method: 'Compressed air or soft brush',
      supplies: ['Compressed air (camera lens cleaner)', 'Soft camel hair brush', 'Microfiber cloth'],
      steps: [
        'Remove card from holder.',
        'Hold card by edges over a clean surface.',
        'Use short bursts of compressed air from 6+ inches away, or gently sweep with a camel hair brush.',
        'Finish with a single gentle pass of a microfiber cloth.',
        'Re-sleeve immediately.',
      ],
      warnings: ['Hold compressed air upright — tilting can spray liquid propellant.', 'Do not blow on cards with your mouth — moisture damages surfaces.'],
      preventionTips: ['Store in sealed penny sleeves to prevent dust accumulation.', 'Keep storage area clean.', 'Use enclosed card boxes instead of open displays.'],
    };
  }

  if (issue === 'surface_dirt') {
    const isVintage = material === 'vintage';
    return {
      canClean: isVintage ? false : true,
      riskLevel: isVintage ? 'high' : 'medium',
      method: isVintage ? 'Professional conservation recommended' : 'Careful spot cleaning',
      supplies: isVintage
        ? ['Consult a professional card restorer']
        : ['White art gum eraser (Staedtler)', 'Microfiber cloth', 'Cotton gloves'],
      steps: isVintage
        ? ['Vintage cards with surface dirt should be evaluated by a professional.', 'Cleaning vintage cards incorrectly can cause more damage than the dirt itself.', 'PSA and BGS may note evidence of cleaning, which lowers grades.']
        : ['Test on a common card first — never start with a valuable card.', 'Very gently use an art gum eraser on the dirty area.', 'Use minimal pressure — let the eraser do the work.', 'Brush away eraser residue with a soft brush.', 'Inspect under good lighting before re-sleeving.'],
      warnings: [
        'Grading companies detect and penalize cleaned cards.',
        isVintage ? 'Vintage paper stock is fragile — cleaning can remove original surface texture.' : 'Over-erasure removes surface coating and causes whitening.',
        'Never use water, solvents, or household cleaners.',
      ],
      preventionTips: ['Handle with clean hands or gloves.', 'Store in protective holders immediately.', 'Keep storage environment clean and enclosed.'],
    };
  }

  if (issue === 'wax_stains') {
    return {
      canClean: false,
      riskLevel: 'high',
      method: 'Not recommended — wax stains are generally permanent',
      supplies: [],
      steps: [
        'Wax stains from vintage packs have typically bonded with the card surface.',
        'Professional card restorers may be able to reduce (not eliminate) wax staining.',
        'For vintage cards, some degree of wax staining is expected and accepted by grading companies.',
        'PSA will note wax staining but it does not automatically fail a card — many vintage gems have some wax.',
      ],
      warnings: [
        'Do NOT attempt to remove wax stains yourself.',
        'Ironing, heat guns, or solvents will destroy the card.',
        'Any home remedy will likely make it worse.',
      ],
      preventionTips: ['When opening vintage packs, carefully separate cards from wax paper.', 'Store vintage cards away from heat that could cause old wax to transfer.'],
    };
  }

  if (issue === 'sticky_residue') {
    return {
      canClean: false,
      riskLevel: 'high',
      method: 'Extremely risky — professional restoration only',
      supplies: [],
      steps: [
        'Sticky residue removal almost always damages the card surface.',
        'Professional restorers may use specialized solvents, but results vary.',
        'For low-value cards: you can try a very small amount of lighter fluid (naphtha) on a cotton swab — but this is risky and may cause discoloration.',
        'For valuable cards: do not attempt. Accept the condition or consult a professional.',
      ],
      warnings: [
        'Never pull tape or stickers off quickly — always peel slowly at a very low angle.',
        'Goo Gone and similar products will stain and damage cards.',
        'Rubbing alcohol can dissolve ink and surface coatings.',
      ],
      preventionTips: ['Never apply stickers or tape to cards.', 'Check for adhesive before placing cards in albums with sticky pages.', 'Use only penny sleeves and toploaders for storage.'],
    };
  }

  if (issue === 'yellowing') {
    return {
      canClean: false,
      riskLevel: 'do_not_touch',
      method: 'Cannot be reversed — it is a chemical process',
      supplies: [],
      steps: [
        'Yellowing is caused by acid in the paper reacting with air and light over time.',
        'This chemical change is permanent and cannot be safely reversed.',
        'Some collectors use UV light treatments, but this is unproven and risky.',
        'For grading: mild yellowing on vintage cards is expected and graded accordingly.',
      ],
      warnings: [
        'Bleaching or whitening products will destroy the card.',
        'UV treatments can cause further fading.',
        'Accept yellowing as part of the card\'s history.',
      ],
      preventionTips: ['Store cards away from sunlight and fluorescent lights.', 'Use acid-free penny sleeves and storage materials.', 'Maintain low humidity (35-45%) to slow oxidation.', 'UV-blocking display cases for cards on display.'],
    };
  }

  // odor
  return {
    canClean: true,
    riskLevel: 'medium',
    method: 'Odor absorption (passive, no contact)',
    supplies: ['Activated charcoal packets', 'Baking soda (open box)', 'Sealed container (airtight)', 'Dryer sheets (unscented)'],
    steps: [
      'Place the card (in its sleeve) inside an airtight container.',
      'Add activated charcoal packets or an open box of baking soda — do NOT let them touch the card.',
      'Seal the container and leave for 1-2 weeks.',
      'Check progress. Repeat if necessary.',
      'For smoke odor: this process may need 2-4 weeks.',
    ],
    warnings: [
      'Never spray anything on the card to mask odor.',
      'Do not use scented products — they transfer scent to the card.',
      'Charcoal and baking soda must not contact the card surface.',
    ],
    preventionTips: ['Store cards in a smoke-free environment.', 'Use silica gel packets to prevent mustiness.', 'Ensure good airflow in storage areas.'],
  };
}

const RISK_COLORS = {
  low: 'text-green-400 bg-green-950/30 border-green-800/40',
  medium: 'text-yellow-400 bg-yellow-950/30 border-yellow-800/40',
  high: 'text-red-400 bg-red-950/30 border-red-800/40',
  do_not_touch: 'text-red-400 bg-red-950/40 border-red-700/50',
};

export default function CardCareGuide() {
  const [issue, setIssue] = useState<Issue>('none');
  const [material, setMaterial] = useState<Material>('modern');
  const [protection, setProtection] = useState<Protection>('penny_sleeve');

  const result = getCareResult(issue, material, protection);

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">What&apos;s the Issue?</label>
          <div className="space-y-2">
            {ISSUES.map(i => (
              <label
                key={i.id}
                className={`block p-3 rounded-xl border cursor-pointer transition-colors ${
                  issue === i.id ? 'border-teal-500 bg-teal-950/30' : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="issue"
                  value={i.id}
                  checked={issue === i.id}
                  onChange={() => setIssue(i.id)}
                  className="sr-only"
                />
                <span className="text-sm text-white font-medium">{i.label}</span>
                <span className="block text-xs text-gray-500 mt-0.5">{i.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Card Material</label>
          <select
            value={material}
            onChange={e => setMaterial(e.target.value as Material)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none mb-4"
          >
            {MATERIALS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-300 mb-2">Current Protection</label>
          <select
            value={protection}
            onChange={e => setProtection(e.target.value as Protection)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none"
          >
            {PROTECTIONS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Result Panel */}
        <div className="space-y-4">
          <div className={`rounded-xl border p-4 ${RISK_COLORS[result.riskLevel]}`}>
            <p className="text-xs font-medium opacity-70">RISK LEVEL</p>
            <p className="text-xl font-bold capitalize">{result.riskLevel.replace(/_/g, ' ')}</p>
            <p className="text-xs mt-1 opacity-80">{result.canClean ? 'Cleaning is possible' : 'Do not attempt cleaning'}</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">RECOMMENDED METHOD</p>
            <p className="text-sm text-white font-medium">{result.method}</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      {result.steps.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Step-by-Step Instructions</h2>
          <ol className="space-y-3">
            {result.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-300">
                <span className="w-6 h-6 bg-teal-900/50 text-teal-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Supplies */}
      {result.supplies.length > 0 && (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Supplies Needed</h2>
          <div className="flex flex-wrap gap-2">
            {result.supplies.map((s, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      <div className="bg-red-950/20 border border-red-800/30 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-red-400 mb-4">Warnings</h2>
        <ul className="space-y-2">
          {result.warnings.map((w, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-red-400 shrink-0">!</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Prevention */}
      <div className="bg-teal-950/20 border border-teal-800/30 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-teal-400 mb-4">Prevention Tips</h2>
        <ul className="space-y-2">
          {result.preventionTips.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-teal-400 shrink-0">*</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Related Tools */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/condition-grader', label: 'Condition Grader' },
            { href: '/tools/storage-calc', label: 'Storage & Supplies' },
            { href: '/tools/holder-guide', label: 'Holder Size Guide' },
            { href: '/tools/photo-guide', label: 'Card Photo Guide' },
            { href: '/tools/damage-assessment', label: 'Damage Assessment' },
            { href: '/tools/insurance-calc', label: 'Insurance Calculator' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/photo-grade-estimator', label: 'Photo Grade Estimator' },
          ].map(l => (
            <a key={l.href} href={l.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-xs transition-colors">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
