import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShippingCalculator from './ShippingCalculator';

export const metadata: Metadata = {
  title: 'Shipping Cost Calculator — How Much Does It Cost to Ship Sports Cards?',
  description: 'Free shipping cost calculator for sports cards and graded slabs. Compare USPS, UPS, and FedEx rates. PWE, bubble mailer, and box options with insurance estimates. Includes packing supply costs and pro tips.',
  openGraph: {
    title: 'Shipping Cost Calculator — CardVault',
    description: 'Compare USPS, UPS, and FedEx shipping costs for raw cards, graded slabs, lots, and sealed products. Includes insurance and supplies.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Shipping Cost Calculator — CardVault',
    description: 'How much does it cost to ship a sports card? Free calculator with carrier comparison.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Shipping Cost Calculator' },
];

const faqItems = [
  {
    question: 'How much does it cost to ship a sports card?',
    answer: 'Shipping a single raw sports card costs $1.50 via PWE (plain white envelope) without tracking, or $4-$5 via USPS First Class bubble mailer with tracking. Graded slabs cost $5-$13 depending on carrier and speed. For cards over $50, add insurance ($2.75+ via USPS). eBay sellers get discounted Commercial rates that save 10-30%.',
  },
  {
    question: 'Should I ship cards PWE or bubble mailer?',
    answer: 'Use PWE only for raw cards under $20 where losing the dispute risk is acceptable — PWE has no tracking, so eBay will side with buyers who claim non-delivery. Bubble mailer ($4-$5) includes tracking and is the standard for $20-$100 cards. Always use a top-loader and penny sleeve regardless of method.',
  },
  {
    question: 'How should I ship a PSA graded slab?',
    answer: 'Wrap the slab in bubble wrap, place it in a small box (not just a bubble mailer for valuable slabs), and use USPS Priority Mail ($10, includes $50 insurance) or UPS Ground ($13, includes $100 declared value). For slabs worth $200+, add extra insurance. Always ship in a rigid box — never bend or flex a slab during shipping.',
  },
  {
    question: 'What supplies do I need to ship sports cards safely?',
    answer: 'For raw cards: penny sleeve ($0.02), top-loader ($0.10), team bag ($0.05), and painters tape to seal the top-loader. For PWE add cardboard sandwich. For bubble mailer add the mailer ($0.50). For graded slabs: bubble wrap and a rigid box. Total supplies cost $0.67-$2.75 depending on card type.',
  },
  {
    question: 'Do I need insurance when shipping cards?',
    answer: 'Yes, for any card worth over $50. USPS Priority Mail includes $50 free insurance. UPS Ground includes $100 declared value. Additional USPS insurance costs $2.75 for up to $100, $6.00 for up to $500, and $12.00 for up to $2,000. Insurance costs less than 3% of card value — always worth it for protection against loss or damage.',
  },
];

export default function ShippingCalcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Shipping Cost Calculator',
        description: 'Free shipping cost calculator for sports cards, graded slabs, card lots, and sealed products. Compare USPS, UPS, and FedEx rates with insurance estimates.',
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
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          USPS, UPS & FedEx rates + insurance + packing supplies
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Shipping Cost Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Compare shipping costs for raw cards, graded slabs, lots, and sealed products. See total cost including postage, insurance, and packing supplies across all major carriers.
        </p>
      </div>

      <ShippingCalculator />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-lg font-semibold text-white mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-8 border-t border-gray-800 pt-6 text-sm text-gray-500">
        <p>
          Use the <Link href="/tools/flip-calc" className="text-emerald-400 hover:underline">Flip Profit Calculator</Link> to see your net profit after shipping and platform fees.
          Check the <Link href="/tools/grading-roi" className="text-emerald-400 hover:underline">Grading ROI Calculator</Link> to see if grading + shipping is worth it.
          Browse <Link href="/tools/dealer-scanner" className="text-emerald-400 hover:underline">Dealer Scanner</Link> for quick card show pricing.
          Protect your collection with the <Link href="/tools/insurance-calc" className="text-emerald-400 hover:underline">Insurance Calculator</Link>.
          Track your submissions with the <Link href="/tools/grading-tracker" className="text-emerald-400 hover:underline">Grading Tracker</Link>.
        </p>
      </div>
    </div>
  );
}
