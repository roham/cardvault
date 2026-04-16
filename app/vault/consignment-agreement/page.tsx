import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ConsignmentAgreementClient from './ConsignmentAgreementClient';

export const metadata: Metadata = {
  title: 'Consignment Agreement Generator — Auction House & Dealer Contract | CardVault',
  description: 'Free consignment agreement generator for collectors sending cards to auction houses, dealers, or LCS. Set commission split, reserve prices, timelines, insurance terms, unsold-lot return policy. Print-ready legal template covering private party to major auction house consignments.',
  openGraph: {
    title: 'Consignment Agreement Generator — CardVault',
    description: 'Printable consignment contract template. Commission terms, reserve prices, return policy.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Consignment Agreement Generator — CardVault',
    description: 'Free printable consignment contract template for card collectors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Consignment Agreement' },
];

const faqItems = [
  {
    question: 'Why do I need a consignment agreement?',
    answer: 'Because verbal consignments fail. The three most common disputes: (1) commission rate was understood differently than agreed, (2) reserve price was bypassed, (3) unsold cards were returned with new damage or not returned at all. A written agreement anchors the terms and gives both parties a document to reference. Major auction houses (Heritage, Goldin, PWCC, Lelands, REA) all require their own consignment contract — this template is for the ~60% of consignments that happen at regional houses, LCS dealers, Instagram/Discord private dealers, and eBay consignment brokers where no formal contract exists.',
  },
  {
    question: 'What commission rate should I accept?',
    answer: 'Market rates as of 2026: major national auction houses 15-20% seller commission + 20-25% buyer premium (seller pays nothing extra — premium comes off hammer). Regional houses (MySlabs, Probstein, Alt) 10-15% seller. Local card shops 25-35% seller with faster turnaround. eBay consignment brokers 10-15% plus eBay fees. Private dealer consignments 15-25%. Higher commission is acceptable if the house has reach your cards need — Heritage for vintage, PWCC for premium modern. Lower commission at regional houses trades exposure for margin.',
  },
  {
    question: 'What is a reserve price and should I set one?',
    answer: 'A reserve is the minimum hammer price below which the lot does not sell. Set a reserve on any lot where you would rather keep the card than accept a bad price. Major auction houses often charge a reserve fee (5% of reserve, capped) whether the lot sells or not, to discourage unrealistic reserves. Rule of thumb: reserve at 70-80% of comparable recent sales. Setting reserve at expected-value loses you to snipers. Setting reserve at 50% of comp means you will sell too cheap in a weak room.',
  },
  {
    question: 'Who is responsible for the cards while the consignee has them?',
    answer: 'The consignee. Any reputable auction house or dealer carries commercial insurance covering cards in their custody, typically from arrival through sale + 30-day payout window. For cards over $5,000, explicitly name the insurance carrier and coverage limit in the agreement. For cards over $25,000, require a certificate of insurance naming you as additional insured before shipping. Never consign a grail card to a dealer without documented insurance — commercial insurance rates have risen sharply since 2024 and some smaller operations carry minimal coverage.',
  },
  {
    question: 'What happens to unsold lots?',
    answer: 'Three outcomes depending on contract: (1) returned to consignor at consignee cost — most common with auction houses, (2) re-listed at reduced reserve after consignor approves — MySlabs/Probstein pattern, (3) returned at consignor cost with a return-shipping fee — common at LCS consignments. Your agreement should specify WHICH outcome and WHO pays return shipping + insurance. Default to option 1 if negotiable. Watch for clauses that keep unsold cards on deposit beyond 90 days without written re-consignment.',
  },
  {
    question: 'How long does settlement typically take?',
    answer: 'Major auction houses: 30-45 days after close. PWCC: up to 45 days. Heritage: 30 days. Goldin: 30 days. Regional houses: 15-30 days. LCS consignments: 7-14 days after card sells. eBay consignment brokers: varies by broker, typically 14 days after buyer payment clears. Payout method matters — check, ACH, or wire. Wire fees are passed to consignor at most houses ($25-50). Specify payout method and fee responsibility in the agreement.',
  },
  {
    question: 'Can I cancel the consignment before the auction?',
    answer: 'Depends on contract stage. Before listing: usually yes, with no fee beyond return shipping. After listing but before bids open: typically a withdrawal fee (5-10% of estimate) to compensate for catalog/marketing work. After bids have opened: almost never. Most major houses prohibit withdrawal once a bid has been placed. This is what the "Withdrawal" clause in your agreement controls — a best practice is to negotiate a 72-hour post-receipt inspection window during which you can withdraw at no cost.',
  },
  {
    question: 'Is this document legally binding?',
    answer: 'A properly-executed consignment agreement with signatures from both parties and consideration (the cards + commission terms) creates an enforceable contract in most US states. This template provides a reasonable baseline but is not a substitute for state-specific legal review on high-value (>$25,000) consignments. Major auction houses have their own 10-20 page contracts drafted by counsel — use this template when the other party does not have a formal contract, or to compare their terms against a common baseline before you sign.',
  },
];

export default function ConsignmentAgreementPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
          LEGAL DOCUMENT · PRINTABLE
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Consignment Agreement Generator
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          Build a consignment contract for cards you are sending to an auction house, dealer, or local shop. Covers commission split, reserve prices, timelines, insurance, unsold-lot returns, and dispute jurisdiction. Print, sign, keep on file.
        </p>
      </header>

      <ConsignmentAgreementClient />

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">When to use a consignment agreement</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li><span className="font-semibold text-indigo-300">Regional / online auction houses</span> that don&apos;t auto-send a 10-page contract (MySlabs, Probstein, Alt, smaller houses)</li>
          <li><span className="font-semibold text-indigo-300">Local card shop consignments</span> where the LCS owner says &quot;don&apos;t worry about it, I&apos;ll take 30%&quot;</li>
          <li><span className="font-semibold text-indigo-300">Private dealer consignments</span> — Instagram, Discord, Whatnot show hosts, Facebook group dealers</li>
          <li><span className="font-semibold text-indigo-300">eBay consignment brokers</span> who handle photography, listing, shipping on your behalf</li>
          <li><span className="font-semibold text-indigo-300">Comparing against a major house&apos;s contract</span> — use this template to identify red-flag clauses in theirs</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Commission benchmarks (2026)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300">
            <thead className="text-slate-400">
              <tr>
                <th className="px-2 py-2 text-left">Consignee Type</th>
                <th className="px-2 py-2 text-right">Seller Commission</th>
                <th className="px-2 py-2 text-right">Buyer Premium</th>
                <th className="px-2 py-2 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr><td className="px-2 py-2">Heritage / Goldin / PWCC</td><td className="px-2 py-2 text-right">15-20%</td><td className="px-2 py-2 text-right">20-25%</td><td className="px-2 py-2 text-right">30-45 days</td></tr>
              <tr><td className="px-2 py-2">REA / Lelands / Memory Lane</td><td className="px-2 py-2 text-right">15-20%</td><td className="px-2 py-2 text-right">20-23%</td><td className="px-2 py-2 text-right">30-45 days</td></tr>
              <tr><td className="px-2 py-2">MySlabs / Probstein / Alt</td><td className="px-2 py-2 text-right">10-15%</td><td className="px-2 py-2 text-right">15-20%</td><td className="px-2 py-2 text-right">14-30 days</td></tr>
              <tr><td className="px-2 py-2">Local Card Shop</td><td className="px-2 py-2 text-right">25-35%</td><td className="px-2 py-2 text-right">—</td><td className="px-2 py-2 text-right">7-14 days</td></tr>
              <tr><td className="px-2 py-2">eBay Consignment Broker</td><td className="px-2 py-2 text-right">10-15% + eBay fees</td><td className="px-2 py-2 text-right">—</td><td className="px-2 py-2 text-right">14 days</td></tr>
              <tr><td className="px-2 py-2">Private Dealer</td><td className="px-2 py-2 text-right">15-25%</td><td className="px-2 py-2 text-right">Negotiable</td><td className="px-2 py-2 text-right">Negotiable</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Frequently asked</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question}>
              <h3 className="text-sm font-semibold text-slate-200">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Related vault tools</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: '/vault/consignment', label: 'Consignment Tracker' },
            { href: '/vault/bill-of-sale', label: 'Bill of Sale' },
            { href: '/vault/return-request', label: 'Return Request' },
            { href: '/vault/shipping-claim', label: 'Shipping Claim' },
            { href: '/vault/ship-it', label: 'Shipping Simulator' },
            { href: '/vault', label: 'All Vault Tools →' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-amber-200">
        <span className="font-semibold">Not legal advice.</span> This generator produces a general consignment-agreement template. For consignments over $25,000 or cross-border transactions, consult a licensed attorney. State laws vary. Major auction houses use their own counsel-drafted contracts and will not accept third-party templates — use this to compare their terms.
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Consignment Agreement Generator',
          url: 'https://cardvault-two.vercel.app/vault/consignment-agreement',
          description:
            'Generate a printable consignment agreement for sports cards. Commission terms, reserve prices, return of unsold lots, insurance, dispute jurisdiction.',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </main>
  );
}
