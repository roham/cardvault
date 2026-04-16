import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ExportCalculatorClient from './ExportCalculatorClient';

export const metadata: Metadata = {
  title: 'Card Export Calculator — Net Proceeds on International Sales | CardVault',
  description: 'Selling a card to a buyer in Japan, the UK, Canada, or Germany? Calculate your true net — outbound shipping, platform fees, international payment surcharges, IOSS/VAT collection, and return-risk buffer — before you accept the offer.',
  openGraph: {
    title: 'Card Export Calculator — CardVault',
    description: 'Seller-side cross-border math. Net after USPS International, eBay fees, PayPal international, and IOSS/VAT collection. 10 destination countries.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Export Calculator | CardVault',
    description: 'True net on international card sales — USPS International, platform fees, IOSS/VAT, return-risk buffer.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Export Calculator' },
];

const faqItems = [
  {
    question: 'Is selling cards internationally worth it for US sellers?',
    answer: 'For high-value modern Pokemon (Japanese-set demand is globally elastic), graded vintage baseball (European collectors of Ruth/Gehrig/DiMaggio), and soccer/cricket to their home markets, international often delivers 10-25% more than domestic. For mid-value US-sport cards ($50-300) sold to casual international buyers, platform fees and shipping usually erase any premium. The calculator flags which side of that line your specific listing lands on.',
  },
  {
    question: 'What is IOSS and why does it matter for UK and EU buyers?',
    answer: 'IOSS (Import One-Stop Shop) is a VAT-collection scheme where major platforms (eBay, Etsy, etc.) collect the buyer-side VAT at checkout for shipments under €150 into the EU, and under £135 into the UK. The buyer sees a higher total at checkout, the platform remits VAT directly to EU / UK tax authorities, and the parcel skips customs hold on arrival. You as the seller do not touch the VAT money — but you need to know it exists so your listing price feels reasonable to the buyer. Above the IOSS threshold, the buyer pays VAT plus handling fees on delivery, which often kills the sale.',
  },
  {
    question: 'Why is USPS First-Class Package International Service (FCPIS) the go-to for raw cards?',
    answer: 'FCPIS covers parcels up to 4 lb and is tracked through USPS plus most destination posts. For a raw card in a toploader (~30g with packaging), it costs $16-20 to most countries and arrives in 7-14 days. Priority Mail International adds $10-15 for limited benefit on a card. For graded slabs, Priority International is worth it because of the higher insurance ceiling and better tracking.',
  },
  {
    question: 'How do eBay international fees stack up against selling direct?',
    answer: 'eBay Global Shipping Program / eBay International Shipping charges the domestic final-value fee (13.25% for trading cards) plus a 1.65% international fee plus a payment-processing surcharge — roughly 16-17% all-in. Selling direct via Instagram DMs or a forum with PayPal international runs about 4.4% + $0.30 per transaction plus the 1.5% cross-border surcharge — roughly 6%. But direct sales cost you eBay buyer protection, and chargebacks on international parcels are nearly impossible to win. Most sellers pay the eBay premium for insurance.',
  },
  {
    question: 'What is the return-risk buffer and should I charge it into my price?',
    answer: 'International returns are expensive, slow, and often lossy. A buyer in Germany claiming "not as described" on a $400 PSA 9 forces you to either issue a full refund without return (dispute-safe but you lose the card) or pay $40-60 for inbound shipping on a $400 card (10-15% of sale price). The return-risk buffer is 3-8% that prudent sellers quietly bake into their international asking price — higher for raw cards, lower for graded slabs with encapsulated evidence. The calculator shows this as a separate line so you can decide whether to include it.',
  },
  {
    question: 'Do I owe US tax on international sales and how do I report?',
    answer: 'Yes — all proceeds from sales are taxable income regardless of buyer location, and the IRS 1099-K threshold is $600 across platforms for the 2026 tax year. International sales count toward the threshold and are reported in USD at the conversion rate on the transaction date. There is no US export duty on trading cards, and you do not collect US sales tax from foreign buyers. Keep a record of shipping and platform fees to deduct as cost of goods sold.',
  },
];

export default function ExportCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Export Calculator',
        description: 'Estimate net proceeds on international card sales from the US — outbound shipping, platform fees, international payment surcharges, and IOSS/VAT collection.',
        url: 'https://cardvault-two.vercel.app/tools/export-calculator',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
          Export Calculator &middot; Seller-side &middot; Net proceeds &middot; 10 destination countries
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Export Calculator</h1>
        <p className="text-gray-400 text-lg">
          Shipping a card to a buyer in Japan, the UK, Canada, or another country? Enter the sale price, platform, and
          destination. We calculate your true net — outbound USPS / UPS / DHL, platform fees, international payment
          surcharges, IOSS / VAT collection, and a return-risk buffer — so you know what you actually take home.
        </p>
      </div>

      <ExportCalculatorClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-fuchsia-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/import-calculator" className="text-fuchsia-500 hover:text-fuchsia-400">Import Calculator</Link>
          <Link href="/tools/shipping-calc" className="text-fuchsia-500 hover:text-fuchsia-400">Shipping Calculator</Link>
          <Link href="/tools/ebay-fee-calc" className="text-fuchsia-500 hover:text-fuchsia-400">eBay Fee Calculator</Link>
          <Link href="/tools/true-cost" className="text-fuchsia-500 hover:text-fuchsia-400">True-Cost Calculator</Link>
          <Link href="/tools/comp-calculator" className="text-fuchsia-500 hover:text-fuchsia-400">Comp Calculator</Link>
          <Link href="/vault/ship-it" className="text-fuchsia-500 hover:text-fuchsia-400">Shipping Simulator</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-fuchsia-500 hover:text-fuchsia-400">&larr; All Tools</Link>
        <Link href="/games" className="text-fuchsia-500 hover:text-fuchsia-400">Games</Link>
        <Link href="/" className="text-fuchsia-500 hover:text-fuchsia-400">Home</Link>
      </div>
    </div>
  );
}
