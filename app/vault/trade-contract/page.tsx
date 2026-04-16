import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeContractClient from './TradeContractClient';

export const metadata: Metadata = {
  title: 'Card Trade Contract Generator — Two-Party Swap Agreement | CardVault',
  description: 'Free card-trade contract generator for private two-party swaps. List cards given by each side, auto-balance values with cash boot, set inspection window and grading-dispute terms, sign, print two copies. Essential for any card trade over $500.',
  openGraph: {
    title: 'Card Trade Contract Generator — CardVault',
    description: 'Generate a binding trade agreement for peer-to-peer card swaps. Value balance, inspection window, grading-dispute arbitration, print-ready PDF.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Trade Contract Generator — CardVault',
    description: 'A printable contract for private card trades. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Trade Contract' },
];

const faqItems = [
  {
    question: 'When do I actually need a written trade contract?',
    answer: 'Any time the total value on either side crosses roughly $500, and always when one side includes a card worth more than $1,000. A typed contract protects both traders against three specific scenarios: (1) a card arrives damaged or not as described, (2) one side pulls out after the other has shipped, (3) either party later wants to claim a tax basis or insurance value for the cards received. Below $500, most collectors rely on platform screenshots plus tracking numbers, but even there a short agreement costs nothing to produce and is the single fastest way to resolve disputes without a lawyer.',
  },
  {
    question: 'Is a typed contract legally binding?',
    answer: 'A trade contract with both signatures, a date, and clear identification of the cards exchanged is generally enforceable as evidence of the trade in most US states. It is not a full commercial sales agreement — if you need warranties of title, indemnification, or specific performance clauses, consult an attorney. For hobby-level trades, this document is functionally equivalent to a bill of sale and satisfies the typical needs of insurers, IRS collectible-basis documentation, and small-claims court in the rare case it becomes necessary.',
  },
  {
    question: 'What is a cash boot and when do I need one?',
    answer: 'A cash boot is a cash payment added to equalize consideration when the two sides are not of equal value. If Party A is trading a $2,000 card for Party B\u2019s $1,500 card, Party B can pay a $500 cash boot to make the trade fair. The tool calculates the value delta automatically and lets you enter the boot amount and direction. The IRS treats boot as taxable boot under like-kind rules for non-personal collectibles, so if you are operating as a dealer or investor rather than a hobbyist, track boot separately from the card exchange.',
  },
  {
    question: 'Why does the contract include a grading-dispute clause?',
    answer: 'Because raw-card trades fall apart most often over perceived grade differences. One trader thinks they are shipping a "clean PSA 9" and the receiver, looking at the same card in hand, sees a corner ding that drops it to a PSA 7. Without a pre-agreed arbiter, the dispute becomes subjective. Pre-naming a grader (PSA, BGS, SGC, or mutually chosen) gives both sides a concrete resolution path: if you disagree, submit the card and the slab result wins. The contract makes the submission a remedy, not a surprise.',
  },
  {
    question: 'What is the inspection window and what does "materially differs" mean?',
    answer: 'The inspection window (default 3 days) is the period after delivery during which the receiver can open, inspect, and return cards that do not match the described condition. "Materially differs" means a difference that affects the card\u2019s market value — a corner ding not disclosed, a grade that is two or more points below the represented grade, a cert number that does not verify, or any alteration (trimming, recoloring, recapturing) not disclosed. Minor condition differences that a reasonable collector would not re-value based on (a light surface blemish within the stated grade range) do not qualify.',
  },
  {
    question: 'AS IS vs warranted condition — which should I choose?',
    answer: 'AS IS is standard for slabbed-only trades where the grader has already certified condition — the slab is the warranty. Use warranted condition when trading raw cards and both sides want stronger comfort that the description is accurate. Warranted adds a 30-day survival of the condition representations, which narrows to "did you send what you said you sent" disputes rather than opening the trade to perpetual regret. When one side is very experienced and the other is new, warranted condition protects the newer trader.',
  },
  {
    question: 'How should I ship the cards after signing?',
    answer: 'Use a tracked, insured service with signature confirmation (USPS Priority Registered, UPS Ground with declared value, or FedEx Ground with signature required). Declared value should match the FMV stated in the contract. For raw cards, use a semi-rigid card saver inside a team bag inside a bubble mailer inside a box — never a PWE (plain white envelope) for anything over $20 even on a trade, because lost PWE claims are rarely paid and destroy trust. For slabs over $500, double-box with bubble wrap between the two boxes.',
  },
];

export default function TradeContractPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Trade Contract Generator',
        description: 'Two-party card-trade contract generator with auto-balancing value math, cash-boot calculation, inspection window, shipping split, grading-dispute arbitration clause, warranty posture, and print-ready PDF.',
        url: 'https://cardvault-two.vercel.app/vault/trade-contract',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Trade Contract &middot; 2-party swap &middot; value-balanced &middot; print-ready
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Trade Contract Generator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Fill in the two parties, list what each side is giving up, set the terms \u2014 the contract builds itself and auto-balances with a cash boot when values differ. Print two copies, sign one each, keep for insurance and tax records.
        </p>
      </div>

      <TradeContractClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        Not legal advice. This template handles standard peer-to-peer hobby trades. For trades above $5,000, or any trade involving minors, estates, or cross-border counterparties, consult an attorney and consider a formal sales agreement with additional warranties and tax counsel.
      </div>

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-blue-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools & Documents</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/vault/bill-of-sale" className="text-blue-300 hover:text-blue-200">Bill of Sale Generator</Link>
          <Link href="/vault/return-request" className="text-blue-300 hover:text-blue-200">Return Request</Link>
          <Link href="/vault/shipping-claim" className="text-blue-300 hover:text-blue-200">Shipping Claim Generator</Link>
          <Link href="/vault/cash-offer" className="text-blue-300 hover:text-blue-200">Dealer Cash Offer</Link>
          <Link href="/tools/trade" className="text-blue-300 hover:text-blue-200">Trade Evaluator</Link>
          <Link href="/tools/comp-calculator" className="text-blue-300 hover:text-blue-200">Comp Calculator</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/vault" className="text-blue-300 hover:text-blue-200">&larr; All Vault Documents</Link>
        <Link href="/tools" className="text-blue-300 hover:text-blue-200">All Tools</Link>
        <Link href="/" className="text-blue-300 hover:text-blue-200">Home</Link>
      </div>
    </div>
  );
}
