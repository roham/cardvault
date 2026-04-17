import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakAgreementClient from './BreakAgreementClient';

export const metadata: Metadata = {
  title: 'Group Break Agreement Generator — Random Team / PYT / Hit Draft | CardVault',
  description: 'Free group-break participation agreement for hobby breakers and collectors. Formalize random-team, pick-your-team, hit-draft, or pick-your-price breaks with participant list, slot assignments, randomizer method, shipping + hits + dispute policies, and printable signed copy.',
  openGraph: {
    title: 'Group Break Agreement Generator — CardVault',
    description: 'Formalize your next group break. Document participants, slots, randomizer, shipping, hits, and dispute resolution.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Group Break Agreement Generator — CardVault',
    description: 'A printable group-break contract for every participant. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Break Agreement' },
];

const faqItems = [
  {
    question: 'When is a written break agreement necessary?',
    answer: 'Any group break with a combined buy-in over roughly $500, any break with participants who have not broken together before, and any break involving a card whose expected hit value exceeds $500. Below those thresholds most friends-circle breaks rely on screenshot of the Whatnot/Fanatics Live chat plus Venmo history, which is functionally a contract but not a clean one if a dispute arises. Above those thresholds, the 2-minute cost of a written agreement is cheaper than any dispute resolution.',
  },
  {
    question: 'What is "randomization" and why does it need to be documented?',
    answer: 'Randomization is the method used to assign teams to participants in a random-team break, or to establish draft order in a hit-draft break. Common methods: random.org list shuffler (dominant standard because the seed can be recorded and verified), physical dice rolls on camera, digital spinner wheels, or shuffled-deck card draws. Documenting the method \u2014 and recording the randomization as it happens \u2014 prevents the #1 dispute in group breaks: "I didn\'t get the team I was supposed to get." If the organizer used random.org with a recorded timestamp, the dispute is dispositively resolved in seconds.',
  },
  {
    question: 'Random Team vs Pick Your Team vs Hit Draft \u2014 which should I pick?',
    answer: 'Random Team is the classic format: every slot gets a team randomly after the break starts. It\u2019s fair, easy to run, but doesn\'t let participants bid on their favorite teams. Pick Your Team (PYT) lets participants pre-select at fixed or tier-priced slots \u2014 popular teams cost more, less popular teams cost less. Hit Draft means everyone pays the same buy-in and drafts hits in a pre-set order after the pack is opened \u2014 eliminates bad-team randomness but concentrates value in the top drafters. Each has dedicated collectors; choose based on product and audience.',
  },
  {
    question: 'What is the safest shipping policy for an organizer?',
    answer: 'Organizer-ships-all with tracked + insured + signature required for any card over $250. This protects the organizer against participant INR claims, ensures documentation for insurance if a package is lost in transit, and formalizes the handoff. The alternative \u2014 ship-per-participant \u2014 reduces the organizer\u2019s responsibility but opens the door to "I never got my card" claims the organizer cannot easily defend. For groups with a pre-existing trust relationship and buy-ins under $200 per slot, per-participant shipping is fine.',
  },
  {
    question: 'Hits policy: does the team owner keep the hit, or should it be split?',
    answer: 'Stay-with-team-owner is the default for random-team breaks because the entire format is built on "my team = my cards." Split-by-buy-in is used in hit-draft and pick-your-price breaks where teams are pre-purchased at different price points. Re-randomize is rare and controversial \u2014 it strips the value of winning team randomization but can make sense for highly asymmetric cases (one team gets 4 hits, others get zero). State the policy explicitly in the agreement and do not change it mid-break.',
  },
  {
    question: 'What if a participant doesn\'t pay their buy-in but claims a slot?',
    answer: 'The agreement should state: slots are assigned only after buy-in is received. Track paid amounts per participant in the Participants section; the Slots Paid / Total Buy-In coverage percentage at the top of the form should reach 100% before randomization. An organizer who randomizes before full buy-in exposes themselves to "you said I had a slot" disputes that no written contract can fully resolve.',
  },
  {
    question: 'Is the organizer personally liable for product defects or misprints?',
    answer: 'Generally no, as long as the product is factory-sealed when the break begins. The Organizer Warranties section of this agreement states explicitly that the seal is intact \u2014 participants are betting on sealed product variance, not on the organizer guaranteeing a specific outcome. The main organizer liability exposure is (a) double-assigning slots, (b) pre-opening packs, (c) misrepresenting product (claiming hobby box when selling retail), or (d) keeping hits pulled from the group product. Document the sealed product on camera before opening and the liability shrinks to zero.',
  },
];

export default function BreakAgreementPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Group Break Agreement Generator',
        description: 'Group break participation agreement generator for hobby card breakers and participants. Covers random-team, pick-your-team, hit-draft, and pick-your-price formats with randomizer method, shipping policy, hits policy, and dispute resolution.',
        url: 'https://cardvault-two.vercel.app/vault/break-agreement',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Group Break Contract &middot; up to 32 slots &middot; print-ready
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Group Break Agreement Generator</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Every group break deserves a written contract before the wrapper gets ripped. Fill in the participants, randomization method, shipping policy, hits policy, and dispute resolution \u2014 the agreement builds itself. Share with every participant before they pay the buy-in.
        </p>
      </div>

      <BreakAgreementClient />

      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-900/40 p-4 text-sm text-amber-200">
        Not legal advice. For breaks with combined buy-ins over $5,000, or any break involving sealed product you did not purchase yourself, consult an attorney and consider a formal sales agreement with product-authenticity representations and warranties.
      </div>

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-indigo-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools & Documents</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/vault/trade-contract" className="text-indigo-300 hover:text-indigo-200">Trade Contract</Link>
          <Link href="/vault/bill-of-sale" className="text-indigo-300 hover:text-indigo-200">Bill of Sale</Link>
          <Link href="/vault/shipping-claim" className="text-indigo-300 hover:text-indigo-200">Shipping Claim</Link>
          <Link href="/tools/break-roi" className="text-indigo-300 hover:text-indigo-200">Break ROI</Link>
          <Link href="/tools/break-cost" className="text-indigo-300 hover:text-indigo-200">Break Cost</Link>
          <Link href="/tools/break-spot" className="text-indigo-300 hover:text-indigo-200">Break Spot EV</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/vault" className="text-indigo-300 hover:text-indigo-200">&larr; All Vault Documents</Link>
        <Link href="/tools" className="text-indigo-300 hover:text-indigo-200">Tools</Link>
        <Link href="/" className="text-indigo-300 hover:text-indigo-200">Home</Link>
      </div>
    </div>
  );
}
