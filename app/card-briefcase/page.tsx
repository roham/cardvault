import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardBriefcaseClient from './CardBriefcaseClient';

export const metadata: Metadata = {
  title: 'Card Briefcase — Deal or No Deal Mystery Elimination Game | CardVault',
  description: 'Free deal-or-no-deal card elimination game. Pick 1 of 16 briefcases, eliminate the rest, and weigh the Banker\u2019s offer against your hidden card\u2019s value. Daily and free play modes.',
  openGraph: {
    title: 'Card Briefcase — CardVault',
    description: 'Pick a briefcase, eliminate the rest, take the Banker\u2019s offer or play on. Real sports cards inside.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Briefcase — CardVault',
    description: 'Deal or no deal with real sports cards. Pick 1, eliminate 15, take the offer or go all the way.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Briefcase' },
];

const faqItems = [
  {
    question: 'How does Card Briefcase work?',
    answer: 'Sixteen briefcases are placed in front of you. Each one hides a real sports card from our database with a different value. You pick one briefcase as "yours" and set it aside. Then you eliminate the others in waves — after each wave the Banker makes you a cash offer to buy your briefcase. Take the offer (deal) or keep going (no deal). At the end, you either walk away with the Banker\u2019s last offer or open your briefcase and take whatever card was inside.',
  },
  {
    question: 'How does the Banker calculate offers?',
    answer: 'The Banker\u2019s offer is a function of the expected value (average) of the remaining briefcases, adjusted by a psychological discount that starts low and rises as the game progresses. Early rounds the offer is a fraction of the mean (the Banker wants you to keep playing). Late rounds the offer approaches the mean as the Banker tries to close the deal. The discount also narrows if your briefcase is statistically likely to be a high-value card.',
  },
  {
    question: 'Is the Daily board the same for everyone?',
    answer: 'Yes. The Daily mode seeds the 16 briefcases from today\u2019s date, so every player faces the same 16 cards in the same positions. Compare your final grade with friends to see who played the Banker best. Free play mode reshuffles every game.',
  },
];

export default function CardBriefcasePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Briefcase',
        description: 'Deal or no deal-style card elimination game. Pick one of 16 briefcases hiding real sports cards and weigh the Banker\u2019s offer against the hidden value.',
        url: 'https://cardvault-two.vercel.app/card-briefcase',
        applicationCategory: 'GameApplication',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Card Briefcase &middot; 16 cases &middot; Banker offers &middot; Daily mode
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Briefcase</h1>
        <p className="text-gray-400 text-lg">
          Pick one of 16 briefcases. Each hides a real sports card of unknown value. Eliminate the rest, listen to the
          Banker&rsquo;s offers, and decide: <strong className="text-white">deal</strong> or <strong className="text-white">no deal</strong>.
        </p>
      </div>

      <CardBriefcaseClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-amber-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-price-is-right" className="text-amber-500 hover:text-amber-400">Price is Right</Link>
          <Link href="/card-mystery-box" className="text-amber-500 hover:text-amber-400">Card Mystery Box</Link>
          <Link href="/card-thrift" className="text-amber-500 hover:text-amber-400">Card Thrift Store</Link>
          <Link href="/card-roulette" className="text-amber-500 hover:text-amber-400">Card Roulette</Link>
          <Link href="/card-mastermind" className="text-amber-500 hover:text-amber-400">Card Mastermind</Link>
          <Link href="/card-poker" className="text-amber-500 hover:text-amber-400">Card Poker</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-amber-500 hover:text-amber-400">&larr; All Games</Link>
        <Link href="/tools" className="text-amber-500 hover:text-amber-400">Tools</Link>
        <Link href="/" className="text-amber-500 hover:text-amber-400">Home</Link>
      </div>
    </div>
  );
}
