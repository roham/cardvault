import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShippingCalcClient from './ShippingCalcClient';

export const metadata: Metadata = {
  title: 'Card Shipping Calculator — Compare Shipping Costs for Cards | CardVault',
  description: 'Free shipping cost calculator for sports cards and graded slabs. Compare PWE, USPS First Class, Priority Mail, UPS, and FedEx rates. Domestic, Canada, and international estimates with insurance, packaging supplies, and cost-as-percent-of-value analysis.',
  openGraph: {
    title: 'Card Shipping Calculator — CardVault',
    description: 'Compare 7 shipping methods for raw cards and graded slabs. See total cost including postage, insurance, and supplies. Domestic, Canada, and international.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Shipping Calculator — CardVault',
    description: 'How much does it cost to ship a sports card? Compare all methods side-by-side.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Shipping Calculator' },
];

const faqItems = [
  {
    question: 'How much does it cost to ship a single sports card?',
    answer: 'A single raw card in a PWE (plain white envelope) costs about $0.73 for a stamp, but has no tracking and no insurance. USPS First Class Package with tracking costs $4.50-$5.50. For graded slabs, USPS Priority Mail at $9-$12 is the most popular choice because it includes $50 insurance and 2-3 day delivery. Always factor in packaging supplies ($0.50-$3.00) when calculating total shipping cost.',
  },
  {
    question: 'Should I ship cards PWE or with tracking?',
    answer: 'Use PWE only for raw cards worth under $20 where you can accept the risk of a lost package dispute. PWE has no tracking, so platforms like eBay will side with buyers who claim non-delivery. For any card worth $20+, always use USPS First Class Package ($4.50) or better with tracking. The extra $3-4 in shipping cost is insurance against losing a dispute.',
  },
  {
    question: 'How should I ship graded slabs safely?',
    answer: 'Wrap the slab in bubble wrap, place it in a small rigid box (not just a padded mailer for valuable slabs), and ship via USPS Priority Mail ($10.40 flat rate small box, includes $50 insurance) or UPS Ground ($10-$15, includes $100 declared value). For slabs worth $200+, add extra insurance. Never ship a slab in just a bubble mailer without rigid protection — slabs can crack if bent during transit.',
  },
  {
    question: 'How much does shipping insurance cost for cards?',
    answer: 'USPS Priority Mail includes $50 free insurance. UPS Ground includes $100 declared value coverage. Additional USPS insurance costs $2.75 for up to $100, $5.75 for up to $500, and $12.25 for up to $2,000. For cards worth $50+, insurance typically costs less than 3% of card value — always worth the protection against loss or damage in transit.',
  },
  {
    question: 'What is the cheapest way to ship cards to Canada or internationally?',
    answer: 'USPS First Class International starts around $15-$18 for a small package to Canada and $18-$25 for other countries. USPS Priority Mail International runs $30-$45 to Canada and $45-$65 internationally. UPS and FedEx international rates start around $25-$35 to Canada. PWE is not recommended internationally due to customs delays and no tracking. Always include customs forms and accurate declared values.',
  },
];

export default function ShippingCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Shipping Calculator',
        description: 'Free shipping cost calculator for sports cards. Compare PWE, USPS, UPS, and FedEx rates with insurance and packaging supply estimates. Domestic, Canada, and international.',
        url: 'https://cardvault-two.vercel.app/tools/shipping-calc',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          7 Shipping Methods - Insurance Calc - Packaging Costs - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Shipping Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Compare shipping costs across all major methods. See total cost including postage, insurance, and packaging supplies. Find the best value for raw cards, graded slabs, and bulk shipments.
        </p>
      </div>

      <ShippingCalcClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/tools/flip-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💸</span>
            <div>
              <div className="text-white text-sm font-medium">Flip Profit Calculator</div>
              <div className="text-gray-500 text-xs">Net profit after fees and shipping</div>
            </div>
          </Link>
          <Link href="/tools/listing-generator" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📝</span>
            <div>
              <div className="text-white text-sm font-medium">Listing Generator</div>
              <div className="text-gray-500 text-xs">Create optimized eBay listings</div>
            </div>
          </Link>
          <Link href="/tools/storage-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🗄️</span>
            <div>
              <div className="text-white text-sm font-medium">Storage Calculator</div>
              <div className="text-gray-500 text-xs">How much space for your collection</div>
            </div>
          </Link>
          <Link href="/tools/insurance-calc" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🛡️</span>
            <div>
              <div className="text-white text-sm font-medium">Insurance Calculator</div>
              <div className="text-gray-500 text-xs">Protect your cards in transit</div>
            </div>
          </Link>
          <Link href="/tools/holder-guide" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🔲</span>
            <div>
              <div className="text-white text-sm font-medium">Holder Guide</div>
              <div className="text-gray-500 text-xs">Sleeves, top-loaders, and cases</div>
            </div>
          </Link>
          <Link href="/tools/export-collection" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📤</span>
            <div>
              <div className="text-white text-sm font-medium">Export Collection</div>
              <div className="text-gray-500 text-xs">Download your collection data</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
