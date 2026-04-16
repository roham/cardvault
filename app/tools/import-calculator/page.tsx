import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ImportCalculatorClient from './ImportCalculatorClient';

export const metadata: Metadata = {
  title: 'Card Import Calculator — Customs, Duty, and Landed Cost | CardVault',
  description: 'Buying a card from Japan, the UK, Canada, or Germany? Calculate the true landed cost — shipping, customs duty, CBP merchandise fees, broker charges, and state use tax — before you click Pay.',
  openGraph: {
    title: 'Card Import Calculator — CardVault',
    description: 'Estimate landed cost for cards imported to the US. Country, shipping method, weight, and destination state all factored. Includes $800 de minimis guidance.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Import Calculator | CardVault',
    description: 'True landed cost for imported cards — duty, CBP, broker, state use tax. Covers Japan, UK, Canada, Germany, Australia, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Import Calculator' },
];

const faqItems = [
  {
    question: 'Do I owe customs duty on cards imported to the US?',
    answer: 'For most sports and trading cards, no. Cards classify under HTS 4911.91 (printed pictures / designs), which has a 0% MFN duty rate regardless of origin. Even if your shipment is above the $800 de minimis and requires formal entry, you pay no duty — only a small CBP merchandise processing fee and, if the carrier is express (DHL / FedEx / UPS), a broker fee. This is a key advantage of cards over other collectibles: watches, jewelry, and antiques all carry 5-10% duty rates.',
  },
  {
    question: 'What is the $800 de minimis rule and how do I use it?',
    answer: 'Personal imports under $800 per shipment enter the US duty-free and fee-free via the informal postal channel. This is the single most important number for international card buyers. If you are buying a $1,200 card, ask the seller whether they can split it into two shipments (e.g. card in one parcel, paperwork and extras in another). Many Japanese proxy services like Buyee offer split-shipping specifically for this. The rule applies per-shipment per-day, so two $600 packages arriving the same week is normal.',
  },
  {
    question: 'Why does the calculator show a broker fee for express couriers only?',
    answer: 'When a shipment requires formal entry (above de minimis), the carrier acts as the customs broker on your behalf. USPS, Canada Post, Royal Mail, and other national postal services charge nothing for this — they hand the parcel off to USPS at the US border and CBP processes it in the informal lane. DHL, FedEx, and UPS act as their own brokers and charge $15-30 for the service, since they are clearing the parcel at the commercial port of entry. For parcels under $800, even express couriers typically waive the fee.',
  },
  {
    question: 'Can the seller lower the declared value to save me money?',
    answer: 'Technically yes, but it is customs fraud and it hurts you if the parcel is lost. Insurance pays only up to the declared value, so a $500 card declared as "gift, $50" reimburses at $50. Sellers often offer this as a courtesy — especially from Japan and the UK — but the modern advice is: declare true value, take the hit on use tax, and trust that de minimis will save you on duty anyway. The risk-reward flipped once de minimis went up to $800 in 2016.',
  },
  {
    question: 'Do I actually pay state use tax on a $200 card from Japan?',
    answer: 'Legally, yes — 45 states require residents to self-report use tax on out-of-state and out-of-country purchases. Practically, enforcement is honor-system at the individual level and very few collectors report card imports. Large card show operators, LLC-based dealers, and anyone declaring collectibles on tax returns should absolutely report. For personal collectors with small-dollar imports, the risk of audit is low but non-zero. The calculator shows the tax so you know your real compliant cost.',
  },
  {
    question: 'Which origin countries give the best landed-cost arbitrage for collectors?',
    answer: 'Japan for vintage Pokemon and early Pocket Monsters graded cards — the market is larger there and PSA grading came later, so raw gems still surface. UK for pre-war British-issue tobacco cards and soccer. Hong Kong for Asian-print Pokemon with pop-report distinctions. Canada for hockey and a US-market-adjacent friction-free pipeline. Germany and Italy for pre-war soccer. Australia for cricket and rugby. The rule of thumb: if a sport is culturally dominant in another country, original print runs, grading populations, and price curves often create arbitrage windows — especially on postal-channel shipments under $800.',
  },
];

export default function ImportCalculatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Import Calculator',
        description: 'Estimate landed cost for sports and trading cards imported to the US, including shipping, customs duty, CBP merchandise fees, carrier brokerage, and state use tax.',
        url: 'https://cardvault-two.vercel.app/tools/import-calculator',
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
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          Import Calculator &middot; Customs &middot; Landed cost &middot; 10 origin countries
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Import Calculator</h1>
        <p className="text-gray-400 text-lg">
          Importing a card from Japan, the UK, Canada, or another origin? Enter the price, method, and your US state. We
          calculate the true landed cost — shipping, customs duty, CBP fees, broker charges, and state use tax — and flag
          whether you have crossed the $800 de minimis threshold.
        </p>
      </div>

      <ImportCalculatorClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-sky-400 transition-colors">
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
          <Link href="/tools/shipping-calc" className="text-sky-500 hover:text-sky-400">Shipping Calculator</Link>
          <Link href="/tools/ebay-fee-calc" className="text-sky-500 hover:text-sky-400">eBay Fee Calculator</Link>
          <Link href="/tools/true-cost" className="text-sky-500 hover:text-sky-400">True-Cost Calculator</Link>
          <Link href="/tools/comp-calculator" className="text-sky-500 hover:text-sky-400">Comp Calculator</Link>
          <Link href="/tools/auction-bid" className="text-sky-500 hover:text-sky-400">Auction Bid Calculator</Link>
          <Link href="/vault/ship-it" className="text-sky-500 hover:text-sky-400">Shipping Simulator</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-sky-500 hover:text-sky-400">&larr; All Tools</Link>
        <Link href="/games" className="text-sky-500 hover:text-sky-400">Games</Link>
        <Link href="/" className="text-sky-500 hover:text-sky-400">Home</Link>
      </div>
    </div>
  );
}
