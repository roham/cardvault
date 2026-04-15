import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyAwardsClient from './HobbyAwardsClient';

export const metadata: Metadata = {
  title: '2025 Card Hobby Awards — Best Rookie, Investment, and Iconic Cards | CardVault',
  description: 'The 2025 Card Hobby Awards celebrate the best in sports card collecting. 10 categories, 50 nominees across baseball, basketball, football, and hockey. Vote for your picks and share your ballot. Data-driven winners based on market performance and collector demand.',
  openGraph: {
    title: '2025 Card Hobby Awards — CardVault',
    description: '10 award categories, 50 nominees. Vote for the best rookie card, best investment, most iconic, and more. Share your picks.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2025 Card Hobby Awards — CardVault',
    description: 'Vote for the best sports cards of 2025. 10 categories. 50 nominees. 4 sports. Share your ballot.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: '2025 Card Hobby Awards' },
];

const faqItems = [
  {
    question: 'How are the Card Hobby Award winners selected?',
    answer: 'Winners are selected using a data-driven methodology that combines on-field/court performance, market price movement, collector demand signals, and auction volume data. We analyze card values across all four major sports (baseball, basketball, football, and hockey) and factor in both short-term momentum and long-term investment fundamentals. The awards are updated annually to reflect the current state of the hobby.',
  },
  {
    question: 'Can I vote for my own picks in the Card Hobby Awards?',
    answer: 'Yes! Each award category has 5 nominees and you can select your favorite in each category. Your ballot is tracked locally on your device. Once you have voted in one or more categories, you can share your complete ballot with friends via the Share button which copies your picks to clipboard in a ready-to-paste format.',
  },
  {
    question: 'What makes a card qualify as Best Investment Card?',
    answer: 'The Best Investment Card award goes to the card with the strongest risk-adjusted upside. We look at the player\'s age and career trajectory (younger is better), historical appreciation rate, market liquidity (how easy it is to buy and sell), population reports (supply scarcity), and the gap between current price and projected future value. Blue-chip rookies of generational players typically dominate this category.',
  },
  {
    question: 'How is the Best Budget Pick (Under $25) category determined?',
    answer: 'We identify cards priced under $25 in raw (ungraded) condition that have significant upside potential. These are typically young players early in their careers whose cards have not yet reflected their on-field talent. We look for players with strong fundamentals, improving performance trends, and the kind of ceiling that could push their card values 3-5x within a few seasons.',
  },
  {
    question: 'Are the community vote percentages based on real votes?',
    answer: 'Community vote percentages are simulated based on market signals and collector sentiment data including auction frequency, price trends, social media mentions, and search volume. They update periodically to reflect shifts in hobby sentiment. Your individual vote is tracked locally on your device and contributes to the displayed percentages on your next visit.',
  },
];

export default function HobbyAwardsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: '2025 Card Hobby Awards',
        description: 'Annual awards celebrating the best in sports card collecting. 10 categories, 50 nominees, interactive voting.',
        url: 'https://cardvault-two.vercel.app/hobby-awards',
        applicationCategory: 'UtilitiesApplication',
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
          2025 Awards &middot; 10 Categories &middot; 50 Nominees &middot; 4 Sports
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          2025 Card Hobby Awards
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Celebrating the best in sports card collecting. From Rookie Card of the Year to Lifetime Achievement
          &mdash; vote for your picks, see the data-driven winners, and share your ballot.
        </p>
      </div>

      <HobbyAwardsClient />

      {/* FAQ Section */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Pages */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <p className="text-sm text-zinc-500">
          Explore more: <Link href="/power-rankings" className="text-amber-400 hover:underline">Power Rankings</Link>
          {' '}&middot;{' '}
          <Link href="/market-movers" className="text-amber-400 hover:underline">Market Movers</Link>
          {' '}&middot;{' '}
          <Link href="/hobby-debates" className="text-amber-400 hover:underline">Hobby Debates</Link>
          {' '}&middot;{' '}
          <Link href="/invest" className="text-amber-400 hover:underline">Investment Guides</Link>
          {' '}&middot;{' '}
          <Link href="/prospect-pipeline" className="text-amber-400 hover:underline">Prospect Pipeline</Link>
        </p>
      </div>
    </div>
  );
}
