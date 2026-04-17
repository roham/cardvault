import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PowerOfAttorneyClient from './PowerOfAttorneyClient';

export const metadata: Metadata = {
  title: 'Power of Attorney Generator — Card-Handling Agent Authorization | CardVault',
  description: 'Free limited power-of-attorney generator for trading-card handling. Authorize a trusted agent to submit to PSA/BGS/SGC, receive shipped packages, consign to auction, sign shipping releases, and manage transactions on your behalf. Expiration date, action checklist, value caps, revocation terms, notary-ready.',
  openGraph: {
    title: 'Power of Attorney Generator — CardVault',
    description: 'Delegate card-handling authority to a trusted agent with a printable POA. Covers grading submission, sales, auction consignment, and mail.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Power of Attorney Generator — CardVault',
    description: 'Delegate card-handling authority with a formal POA — free, printable, editable.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Power of Attorney' },
];

const faqItems = [
  {
    question: 'When is a card-handling power of attorney useful?',
    answer: 'Four common scenarios. Traveling or deployed collectors who need someone to receive grading returns or auction consignments shipped to their home address. Hospitalized or medically unavailable collectors who need trusted family or a hobby friend to handle time-sensitive transactions (a hot card that needs to sell, a grading return that can\'t sit in the mailbox). Estate pre-planning where a collector names a successor agent to handle hobby affairs if they become incapacitated. Professional arrangements — dealers, consignment specialists, or submission brokers acting as agent for clients who want to delegate the actual paperwork and mail handling.',
  },
  {
    question: 'Is this a durable POA?',
    answer: 'By default, no. This is a limited POA — scope is limited to card-handling (the Authorized Actions you check) and it expires on the date you specify. If you need a durable POA (one that survives your incapacity) you must explicitly mark the Durable toggle. Durable POAs have different legal requirements in most states (specific statutory language, notary or witness requirements, sometimes recording). Consult a lawyer for durable versions. The non-durable (default) form is sufficient for most "I\'m traveling for 3 weeks, handle my grading return" use cases.',
  },
  {
    question: 'Do I need a notary?',
    answer: 'Depends on what the agent will be signing. For simple receipt of shipped packages at your address, notary is generally not required. For auction consignment contracts and large-value sales (over $5,000 or whatever the specific platform requires), most auction houses and marketplaces will require a notarized POA before they\'ll accept the agent\'s signature on your behalf. Default to notary for any POA you intend to use for $5,000+ transactions. The generated letter includes a notary acknowledgment block at the bottom; take it to any bank notary (often free for customers) or a UPS Store notary ($5-15).',
  },
  {
    question: 'Can I limit the POA to specific cards?',
    answer: 'Yes. The "Scope limits" section lets you set (a) a total-value cap across all transactions the agent can execute, (b) a per-transaction value cap, and (c) optional card-category restrictions (graded only, raw only, vintage only, etc). If your agent needs to handle a specific grading return worth $8,000 but nothing else, set the total-value cap at $10,000 and the per-transaction cap at $8,500 — the generated language reflects these limits and they become enforceable if a counterparty reviews the POA.',
  },
  {
    question: 'How do I revoke a POA?',
    answer: 'Three methods in increasing formality. One: written notice to the agent stating the POA is revoked, dated and signed. For informal/low-stakes POAs this is sufficient. Two: written notice to each counterparty (PSA, your auction house, shipping carrier) specifically stating the POA is revoked and the agent no longer has authority to act on your behalf — required if the counterparty has been relying on the POA. Three: a formal Notice of Revocation filed with the county clerk in your state and notarized — required if the original POA was recorded. The generated POA includes standard revocation language making all three methods valid.',
  },
  {
    question: 'What about liability — am I responsible for what the agent does?',
    answer: 'Generally yes, within the scope of actions you authorized. If you authorize the agent to submit cards for grading and they lose a card in transit, you bear the loss (the insurance policy you had on that card is what covers it, not the agent personally — unless they acted with gross negligence). If the agent exceeds the scope (e.g., sells a card not on the authorized list, or submits cards worth more than the per-transaction cap), you may have recourse against them personally, but the transaction with the counterparty may still be enforceable. Structure the scope narrowly and pick agents with aligned incentives — never give broad POA authority to someone you wouldn\'t hand your wallet to.',
  },
  {
    question: 'Can the agent also act as buyer or seller in transactions with me?',
    answer: 'The "Self-dealing prohibition" clause in the generated language forbids this by default — the agent may not buy your cards personally, sell their own cards to you, or direct any transaction proceeds to themselves personally (beyond reimbursement of documented expenses and an optional fee you name in the form). If you specifically want to allow self-dealing (e.g., your agent is a dealer who regularly buys from clients), uncheck the prohibition and explicitly name the self-dealing-allowed scope in a rider section. Without this explicit authorization, self-dealing by an agent creates voidable transactions and potential breach-of-fiduciary-duty liability.',
  },
];

export default function PowerOfAttorneyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card-Handling Power of Attorney Generator',
        description: 'Limited power-of-attorney generator for trading-card handling. Generates a print-ready, notary-acknowledgment-included POA covering grading submission, sales, auction consignment, shipping releases, and mail receipt with optional durable, value-cap, and expiration clauses.',
        url: 'https://cardvault-two.vercel.app/vault/power-of-attorney',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
          Limited POA &middot; grading + sales + consignment + mail &middot; notary-ready
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Power of Attorney Generator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Traveling? Hospitalized? Running an auction consignment from another state? A limited power-of-attorney lets a trusted agent handle your card transactions &mdash; grading submissions, sales, mail receipt, auction consignment &mdash; within scope you define. Fill in the principal, agent, authorized actions, and scope limits; the letter builds itself.
        </p>
      </div>

      <PowerOfAttorneyClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        Not legal advice. Power-of-attorney law varies by state; durable POAs have specific statutory requirements (language, notary, witnesses) that vary across jurisdictions. For POAs intended to survive incapacity or to cover transactions exceeding $25,000 combined, consult a licensed attorney in your state before relying on this template.
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-fuchsia-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Documents</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/vault/escrow-letter" className="text-fuchsia-300 hover:text-fuchsia-200">Escrow Letter</Link>
          <Link href="/vault/bill-of-sale" className="text-fuchsia-300 hover:text-fuchsia-200">Bill of Sale</Link>
          <Link href="/vault/trade-contract" className="text-fuchsia-300 hover:text-fuchsia-200">Trade Contract</Link>
          <Link href="/vault/consignment-agreement" className="text-fuchsia-300 hover:text-fuchsia-200">Consignment Agreement</Link>
          <Link href="/vault/break-agreement" className="text-fuchsia-300 hover:text-fuchsia-200">Break Agreement</Link>
          <Link href="/vault/shipping-claim" className="text-fuchsia-300 hover:text-fuchsia-200">Shipping Claim</Link>
          <Link href="/vault/return-request" className="text-fuchsia-300 hover:text-fuchsia-200">Return Request</Link>
          <Link href="/vault/insurance" className="text-fuchsia-300 hover:text-fuchsia-200">Insurance Checklist</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/vault" className="text-fuchsia-300 hover:text-fuchsia-200">&larr; All Vault Documents</Link>
        <Link href="/tools" className="text-fuchsia-300 hover:text-fuchsia-200">Tools</Link>
        <Link href="/" className="text-fuchsia-300 hover:text-fuchsia-200">Home</Link>
      </div>
    </div>
  );
}
