import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShipItClient from './ShipItClient';

export const metadata: Metadata = {
  title: 'Card Shipping Simulator — Pack & Ship Cards Safely (Prototype) | CardVault',
  description: 'Simulate shipping a card you just sold. Pick packing layers, carrier service, insurance level. Weighted outcome engine models damage, loss, and porch piracy. Educational shipping simulator.',
  openGraph: {
    title: 'Card Shipping Simulator — CardVault',
    description: 'Pack and ship cards like a pro. Protection score, cost math, and realistic outcome simulation based on your choices.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Shipping Simulator — CardVault',
    description: 'Learn how to ship cards safely. Every choice matters — packing, carrier, insurance, signature.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Shipping Simulator' },
];

const faqItems = [
  {
    question: 'How do I ship a sports card safely?',
    answer: 'Base layer: penny sleeve, then top loader or card saver, then a team bag to seal. Sandwich that between two cardboard pieces inside a bubble mailer (for cards under $100) or a small rigid box (for $500+ cards). Use tracked shipping, add insurance for anything over $50, require signature for anything over $250. Never ship in a plain envelope — carriers run cards through letter sorters that will bend or destroy them.',
  },
  {
    question: 'When should I use insurance vs. just carrier tracking?',
    answer: 'Under $50: tracking alone is fine. $50-$250: add carrier insurance (USPS Priority includes $100, additional is ~$1.70 per $100 of coverage). $250+: use private insurance through Shipsurance or U-PIC (typically 0.55-1% of declared value with higher payout caps and faster claim turnaround than USPS). $5,000+: consider registered mail or a dedicated courier for high-value slabs.',
  },
  {
    question: 'Do I really need signature confirmation?',
    answer: 'Signature confirmation costs $3-$6 and eliminates the #1 seller-loss vector: the "delivered but not received" dispute. Porch piracy is real, and without a signature the carrier has done its job once tracking shows delivered — you eat the loss. Any card over $250 should require signature. For $1,000+ cards, use adult signature required to prevent a minor or neighbor accepting.',
  },
  {
    question: 'What is the safest carrier for cards?',
    answer: 'For most cards, USPS Ground Advantage and Priority Mail are the standard — cheap, reliable, with decent tracking. Priority Express includes $100 insurance automatically and is fastest. For $1,000+ slabs, consider UPS 2-Day with signature because UPS has better claim resolution and fewer sort-line incidents than USPS. FedEx is a third option but their handling of small padded mailers is notably rougher than UPS.',
  },
  {
    question: 'What happens if the card gets damaged in shipping?',
    answer: 'If you packed it well and bought insurance, you file a claim with photos of the packaging, the damage, and the original listing price. Carrier claims (USPS) typically take 30-60 days and require the recipient to hold the package for inspection. Private insurance (Shipsurance) pays faster (7-14 days). If you did not buy insurance, the loss is on you — most buyers will open a dispute and you will likely refund the full sale price. Pack well, always insure.',
  },
];

export default function ShipItPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Shipping Simulator',
        description: 'Interactive shipping simulator for trading cards. Pick packaging, carrier, insurance. Weighted outcome engine.',
        url: 'https://cardvault-two.vercel.app/vault/ship-it',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          Ship-It Sim &middot; 9,800+ Cards &middot; 6 Carriers &middot; Realistic Loss Math
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Shipping Simulator</h1>
        <p className="text-gray-400 text-lg">
          You sold a card. Now you have to ship it. Pick your packaging, carrier, and insurance — then let the simulator run.
          Every choice changes your protection score and your odds of a clean delivery vs. damage, loss, or porch piracy.
        </p>
      </div>

      <ShipItClient />

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-sky-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Vault Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/vault/garage-sale" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-sky-700/50 rounded-xl transition-colors">
            <span className="text-xl">🏷️</span>
            <div><div className="text-white text-sm font-medium">Garage Sale</div><div className="text-gray-500 text-xs">Virtual selling simulator</div></div>
          </Link>
          <Link href="/vault/bulk-sale" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-sky-700/50 rounded-xl transition-colors">
            <span className="text-xl">📦</span>
            <div><div className="text-white text-sm font-medium">Bulk Sale Calc</div><div className="text-gray-500 text-xs">Compare 6 selling methods</div></div>
          </Link>
          <Link href="/vault/consignment" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-sky-700/50 rounded-xl transition-colors">
            <span className="text-xl">📤</span>
            <div><div className="text-white text-sm font-medium">Consignment Tracker</div><div className="text-gray-500 text-xs">8 auction houses</div></div>
          </Link>
          <Link href="/vault/insurance" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-sky-700/50 rounded-xl transition-colors">
            <span className="text-xl">🛡️</span>
            <div><div className="text-white text-sm font-medium">Insurance Estimator</div><div className="text-gray-500 text-xs">Collection coverage costs</div></div>
          </Link>
          <Link href="/vault/grading-queue" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-sky-700/50 rounded-xl transition-colors">
            <span className="text-xl">🏅</span>
            <div><div className="text-white text-sm font-medium">Grading Queue</div><div className="text-gray-500 text-xs">Track submissions</div></div>
          </Link>
          <Link href="/vault/negotiator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-sky-700/50 rounded-xl transition-colors">
            <span className="text-xl">🤝</span>
            <div><div className="text-white text-sm font-medium">Price Negotiator</div><div className="text-gray-500 text-xs">Haggle with AI sellers</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
