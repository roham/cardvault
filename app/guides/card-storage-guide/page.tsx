import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Store and Protect Sports Cards: Complete Storage Guide (2026)',
  description: 'Step-by-step guide to storing sports cards and Pokemon cards. Penny sleeves, top loaders, one-touch cases, binder storage, and climate control. Protect your collection from damage.',
  keywords: ['how to store sports cards', 'card storage guide', 'penny sleeves', 'top loaders', 'card protection', 'how to protect Pokemon cards', 'sports card binder', 'one-touch magnetic holders'],
};

interface StorageMethod {
  name: string;
  bestFor: string;
  cost: string;
  protection: string;
  description: string;
  pros: string[];
  cons: string[];
}

const methods: StorageMethod[] = [
  {
    name: 'Penny Sleeve + Top Loader',
    bestFor: 'Individual cards worth $5-$200',
    cost: '~$0.05 per card',
    protection: 'Excellent for daily handling and storage',
    description: 'The standard protective setup for most collectors. A penny sleeve prevents surface scratches, and the top loader provides rigid protection against bending.',
    pros: ['Cheapest effective protection', 'Easy to stack and store', 'Universal standard — dealers and collectors expect this', 'Available at every card shop and online'],
    cons: ['Cards can slide out the top (use painter\'s tape to seal)', 'Penny sleeves can scratch Chrome/Prizm cards if dirty', 'Not display-friendly'],
  },
  {
    name: 'One-Touch Magnetic Holder',
    bestFor: 'High-value cards worth $200+',
    cost: '$3-$8 per holder',
    protection: 'Superior — magnetic seal, UV protection available',
    description: 'Premium rigid holders with a magnetic snap closure. No card-to-plastic friction during insertion. Many versions include UV protection for display.',
    pros: ['Best protection for raw high-value cards', 'Display-ready — looks clean on a shelf', 'No risk of scratching during insertion', 'Available in different thickness (35pt, 55pt, 100pt+) for various card types'],
    cons: ['Expensive for bulk storage', 'Takes up more space than top loaders', 'Cheap off-brand versions may not close flush'],
  },
  {
    name: 'Card Saver / Semi-Rigid',
    bestFor: 'Cards being submitted for grading',
    cost: '$0.15-$0.25 per holder',
    protection: 'Good — semi-rigid with opening at top',
    description: 'The required holder for PSA, BGS, and SGC submissions. Card Saver I is the industry standard. These are not for permanent storage — they\'re for transit.',
    pros: ['Required by PSA for submissions', 'Cheaper than one-touch holders', 'Flexible enough to prevent pressure damage in shipping'],
    cons: ['Not display-friendly', 'Cards can be removed easily — not secure for valuable cards', 'Only useful as a grading submission tool'],
  },
  {
    name: '9-Pocket Binder Pages',
    bestFor: 'Set completion, bulk collection browsing',
    cost: '$0.15-$0.30 per page (holds 9 cards)',
    protection: 'Moderate — depends on page quality',
    description: 'Side-loading binder pages in a D-ring or O-ring binder. The classic way to organize complete sets and bulk collections for easy browsing.',
    pros: ['Best for organizing and browsing complete sets', 'Space-efficient for large collections', 'Side-loading pages prevent cards from falling out', 'Satisfying flip-through experience'],
    cons: ['Pages can stick together in humidity', 'O-ring binders can damage pages at the ring holes', 'Not suitable for high-value cards — pages shift during handling', 'PVC pages (avoid!) can damage cards over time'],
  },
  {
    name: 'Graded Card Case (PSA/BGS/SGC slab)',
    bestFor: 'Cards worth $100+ that benefit from authentication',
    cost: '$25-$300+ (grading fee)',
    protection: 'Maximum — tamper-evident sealed case',
    description: 'The ultimate protection. A professional grading company authenticates, grades, and seals the card in a tamper-evident plastic case. The gold standard for high-value cards.',
    pros: ['Maximum physical protection', 'Authentication adds buyer confidence', 'Grade premium increases resale value', 'Easy to display — the case IS the display'],
    cons: ['Expensive (grading fees + shipping)', 'Card is locked in — you can\'t remove it without breaking the case', 'Not every card benefits from grading economically'],
  },
];

export default function CardStorageGuidePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Card Storage Guide' },
        ]} />

        <h1 className="text-3xl sm:text-4xl font-bold mt-6 mb-4">How to Store and Protect Your Card Collection</h1>
        <p className="text-gray-400 text-lg mb-8">
          Card condition directly affects value. A card that was worth $500 in NM-MT can drop to $50 if stored improperly.
          This guide covers every storage method, when to use each, and the environmental factors that silently destroy collections.
        </p>

        {/* Quick Reference */}
        <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-emerald-300 mb-3">Quick Rule of Thumb</h2>
          <ul className="space-y-2 text-gray-300">
            <li><strong>Under $10:</strong> Penny sleeve, then a team bag or bulk box. Don&apos;t overthink it.</li>
            <li><strong>$10-$200:</strong> Penny sleeve + top loader. The hobby standard.</li>
            <li><strong>$200-$1,000:</strong> One-touch magnetic holder with UV protection. Display-ready.</li>
            <li><strong>$1,000+:</strong> Get it graded (PSA, BGS, or SGC). The slab is the ultimate protection and adds value.</li>
          </ul>
        </div>

        {/* Storage Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Storage Methods Compared</h2>
          <div className="space-y-6">
            {methods.map((m) => (
              <div key={m.name} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2">{m.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-4">
                  <div><span className="text-gray-500">Best for:</span> <span className="text-gray-300">{m.bestFor}</span></div>
                  <div><span className="text-gray-500">Cost:</span> <span className="text-gray-300">{m.cost}</span></div>
                  <div><span className="text-gray-500">Protection:</span> <span className="text-gray-300">{m.protection}</span></div>
                </div>
                <p className="text-gray-300 mb-4">{m.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Pros</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {m.pros.map((p, i) => <li key={i}>+ {p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">Cons</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      {m.cons.map((c, i) => <li key={i}>- {c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Environment Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Climate & Environment: The Silent Collection Killer</h2>
          <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-red-300 mb-3">Warning: These Destroy Cards</h3>
            <ul className="space-y-3 text-gray-300">
              <li><strong>Humidity above 60%:</strong> Causes warping, mold growth, and sticker residue activation. Cards stored in basements or garages in humid climates are at extreme risk.</li>
              <li><strong>Temperature swings:</strong> Attics cycle from 40°F to 140°F seasonally. This expansion/contraction cracks graded cases and warps raw cards.</li>
              <li><strong>Direct sunlight:</strong> UV exposure fades card fronts within months. Even indirect light through windows causes gradual fading over years.</li>
              <li><strong>Cigarette smoke:</strong> Yellows card surfaces permanently. Vintage cards from smokers&apos; collections often grade 1-2 points lower due to surface discoloration.</li>
            </ul>
          </div>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-300 mb-3">Ideal Storage Conditions</h3>
            <ul className="space-y-2 text-gray-300">
              <li><strong>Temperature:</strong> 65-72°F (18-22°C) — room temperature, consistent</li>
              <li><strong>Humidity:</strong> 40-50% relative humidity — use a dehumidifier if needed</li>
              <li><strong>Light:</strong> Store in a dark, enclosed space (closet, cabinet). Display cards with UV-protected holders only.</li>
              <li><strong>Location:</strong> Interior room of your home. Never attic, garage, basement, or near exterior walls with temperature variance.</li>
              <li><strong>Monitoring:</strong> A $10 digital hygrometer tells you exact temperature and humidity. Worth it for any collection over $500.</li>
            </ul>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Common Storage Mistakes</h2>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
            <ul className="space-y-3 text-gray-300">
              <li><strong>Using rubber bands on stacks:</strong> Rubber bands degrade and leave sticky residue on card edges. Use team bags instead.</li>
              <li><strong>PVC binder pages:</strong> Old-style binder pages made from PVC (polyvinyl chloride) release gases that damage card surfaces over time. Use polypropylene or archival-quality pages only.</li>
              <li><strong>Stacking heavy items on top loader stacks:</strong> Pressure can push cards against the top loader edges, causing indentations. Store top loaders upright in rows, like filing cabinets.</li>
              <li><strong>Handling high-value cards without clean hands:</strong> Fingerprint oils on Chrome and foil cards are visible under magnification and will lower a grade. Use cotton gloves or wash your hands before handling.</li>
              <li><strong>Storing sealed wax products flat:</strong> Sealed boxes stored flat can develop pressure dents on packs. Store sealed product upright when possible.</li>
            </ul>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Related Guides & Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/guides/psa-grading-scale" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">PSA Grading Scale Explained</h3>
              <p className="text-sm text-gray-400 mt-1">Understand what PSA 10, 9, 8 mean and how grading companies evaluate condition.</p>
            </Link>
            <Link href="/tools/grading-roi" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Grading ROI Calculator</h3>
              <p className="text-sm text-gray-400 mt-1">Is it worth grading your card? Calculate the break-even point.</p>
            </Link>
            <Link href="/guides/how-to-start-collecting-cards" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">How to Start Collecting Cards</h3>
              <p className="text-sm text-gray-400 mt-1">The complete beginner roadmap — what to buy, where to buy, and traps to avoid.</p>
            </Link>
            <Link href="/guides/how-to-sell-cards" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">How to Sell Cards</h3>
              <p className="text-sm text-gray-400 mt-1">Where to sell, how to price, shipping tips, and platform fee comparisons.</p>
            </Link>
          </div>
        </section>

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to Store and Protect Sports Cards',
          description: 'Step-by-step guide to storing sports cards and Pokemon cards safely.',
          step: [
            { '@type': 'HowToStep', name: 'Sleeve your card', text: 'Place the card in a penny sleeve to prevent surface scratches.' },
            { '@type': 'HowToStep', name: 'Insert into top loader or one-touch', text: 'For cards under $200, use a top loader. For $200+, use a one-touch magnetic holder.' },
            { '@type': 'HowToStep', name: 'Store in proper environment', text: 'Keep cards at 65-72°F and 40-50% humidity in a dark, interior room.' },
            { '@type': 'HowToStep', name: 'Consider grading for high-value cards', text: 'Cards worth $1,000+ should be professionally graded for maximum protection and value.' },
          ],
        }} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How should I store sports cards?', acceptedAnswer: { '@type': 'Answer', text: 'Place each card in a penny sleeve, then into a top loader for cards worth $5-$200. Use one-touch magnetic holders for cards worth $200+. Store in a climate-controlled room at 65-72°F and 40-50% humidity.' } },
            { '@type': 'Question', name: 'What damages sports cards?', acceptedAnswer: { '@type': 'Answer', text: 'The biggest threats are humidity (causes warping and mold), temperature swings (cracks cases and warps cards), direct sunlight (fades card fronts), and improper handling (fingerprints on Chrome/foil cards).' } },
          ],
        }} />
      </div>
    </main>
  );
}
