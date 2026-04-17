import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EscrowLetterClient from './EscrowLetterClient';

export const metadata: Metadata = {
  title: 'Escrow Letter Generator — Third-Party Holding for High-End Card Sales | CardVault',
  description: 'Free three-party escrow letter for high-value sports and Pokemon card sales. Buyer, seller, and escrow agent sign a single instrument covering delivery, inspection window, release triggers, fee responsibility, and dispute resolution. Print-ready for sales $1,000+.',
  openGraph: {
    title: 'Escrow Letter Generator — CardVault',
    description: 'Three-party escrow instrument for high-end private card sales. Delivery, inspection, release triggers, dispute resolution — all in one printable letter.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Escrow Letter Generator — CardVault',
    description: 'Three-party escrow protection for your next $1K+ card sale. Free, printable, editable.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Escrow Letter' },
];

const faqItems = [
  {
    question: 'When do I actually need an escrow arrangement?',
    answer: 'Any private card sale over roughly $1,000 where the buyer and seller have not transacted before, any sale involving a cracked / raw card whose condition claims cannot be independently verified until received, and any sale involving a cross-border or multi-week-shipping transaction where chargeback risk and lost-package risk overlap. Below $1,000 the escrow fee eats too much margin; above $1,000 the ~2-3% escrow fee is cheaper than a single dispute.',
  },
  {
    question: 'Who can act as the escrow agent?',
    answer: 'Most hobby escrows use one of five agent types. Third-party escrow service (Escrow.com, PayPal G&S as pseudo-escrow) — highest protection, regulated, 1-4% fee, works for cross-border. Hobby attorney — legal protection + specialist expertise, flat fee $200-500, usually for $10K+. Auction house — consignment-style escrow, 5-15% commission, adds authentication and grading services. Mutually trusted friend / known hobby figure — low friction, no legal weight, only works for sub-$5K deals in tight communities. Bank or credit union — rare in hobby but available via "special agency account", flat fee plus wire fees. Pick based on deal size and cross-party trust.',
  },
  {
    question: 'Who pays the escrow fee?',
    answer: 'Three common splits. Buyer pays: common in hobby deals under $5K where the seller prices the card aggressively and expects the buyer to cover all friction. Seller pays: common for consigned or auction-house-mediated sales where the seller is already paying commission and absorbing the escrow inside the commission. 50/50 split: common for high-trust peer deals over $5K where both parties want a clean "we both put up skin in the game" structure. Document the split in the letter so neither party can later claim they were overcharged.',
  },
  {
    question: 'How long should the inspection window be?',
    answer: 'Inspection period is the window during which the buyer can accept, reject, or dispute the card after receiving it. Standard windows: 3 days for modern graded cards where condition is objective (PSA/BGS label intact = accept), 5-7 days for raw modern cards where the buyer needs time to examine corners and edges, 14 days for vintage cards where professional authentication may be required, 30 days for cards requiring outside authentication (JSA, Beckett, or an independent expert). Longer inspection windows protect the buyer; shorter windows protect the seller\u2019s capital. Pick based on card type.',
  },
  {
    question: 'What happens if the buyer rejects the card during inspection?',
    answer: 'Standard rejection flow. Buyer notifies escrow agent in writing within the inspection window with reason (condition mismatch, authenticity concern, wrong card). Buyer ships card back to seller tracked + insured + signature, funded by buyer but refundable from the escrow amount if the rejection is found valid. Escrow agent holds funds until seller confirms receipt of returned card in original claimed condition, then refunds buyer minus any documented damage offsets. If seller disputes the return condition, the letter\'s dispute-resolution clause kicks in.',
  },
  {
    question: 'Can I use an escrow letter for cross-border sales?',
    answer: 'Yes, and you should. Cross-border card sales carry amplified risk (customs seizure, longer transit, more chargeback avenues) and escrow is among the cleanest mitigations available. Use a regulated third-party escrow service (Escrow.com is licensed in most US states and accepts international deals), specify the currency in the letter, add a customs-seizure clause (typically: if seizure occurs, buyer and seller share the loss pro-rata), and extend the inspection window to account for longer transit. For EU buyers specifically, check VAT handling — the escrow letter should state which party bears VAT.',
  },
  {
    question: 'What dispute-resolution language is strongest?',
    answer: 'Three increasingly strong options. Escrow-agent-decision: the agent arbitrates and their decision is binding. Fast, cheap, works for clear-cut disputes (wrong card, obvious damage). Independent-authenticator-arbitration: disputes requiring card expertise are sent to a named third-party authenticator (PSA, Beckett, SGC, JSA) whose finding is binding. Best for condition / authenticity disputes. Formal arbitration under AAA rules: most expensive and slowest but required if the card is worth $25K+ or if either party has a track record of litigation. Most hobby escrows use the first two; layered language (escrow-decision first, escalating to authenticator if unresolved) is common and strong.',
  },
];

export default function EscrowLetterPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Escrow Letter Generator',
        description: 'Three-party escrow letter generator for high-value private card sales. Generates a print-ready escrow instrument covering buyer, seller, and escrow agent with delivery, inspection, release, fee, and dispute-resolution terms.',
        url: 'https://cardvault-two.vercel.app/vault/escrow-letter',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Three-Party Escrow &middot; buyer + seller + agent &middot; print-ready
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Escrow Letter Generator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Any private card sale over $1,000 should move through escrow. Fill in the parties, the card, the agent, the inspection window, and the release triggers &mdash; a print-ready three-party escrow letter builds itself. Sign, scan, and send before a single dollar or card changes hands.
        </p>
      </div>

      <EscrowLetterClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        Not legal advice. For sales exceeding $25,000, deals involving grading-sensitive authentication claims (1/1 patches, holy-grail 1952 Topps variants, pre-war cards with population-one pop reports), or any transaction crossing international borders, pair this letter with a hobby attorney or a licensed third-party escrow service (Escrow.com, auction-house custody). This generator produces a strong baseline instrument &mdash; adapt clauses for jurisdiction-specific requirements as needed.
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-violet-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools & Documents</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/vault/bill-of-sale" className="text-violet-300 hover:text-violet-200">Bill of Sale</Link>
          <Link href="/vault/trade-contract" className="text-violet-300 hover:text-violet-200">Trade Contract</Link>
          <Link href="/vault/consignment-agreement" className="text-violet-300 hover:text-violet-200">Consignment Agreement</Link>
          <Link href="/vault/break-agreement" className="text-violet-300 hover:text-violet-200">Break Agreement</Link>
          <Link href="/vault/shipping-claim" className="text-violet-300 hover:text-violet-200">Shipping Claim</Link>
          <Link href="/vault/return-request" className="text-violet-300 hover:text-violet-200">Return Request</Link>
          <Link href="/vault/appraisal" className="text-violet-300 hover:text-violet-200">Appraisal</Link>
          <Link href="/vault/insurance" className="text-violet-300 hover:text-violet-200">Insurance Checklist</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/vault" className="text-violet-300 hover:text-violet-200">&larr; All Vault Documents</Link>
        <Link href="/tools" className="text-violet-300 hover:text-violet-200">Tools</Link>
        <Link href="/" className="text-violet-300 hover:text-violet-200">Home</Link>
      </div>
    </div>
  );
}
