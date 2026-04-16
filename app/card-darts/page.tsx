import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDartsClient from './CardDartsClient';

export const metadata: Metadata = {
  title: 'Card Darts — Throw for the Bullseye Hit | CardVault',
  description: 'Throw 3 darts at the CardVault dartboard. Each ring is a card value tier — outer $25-100, mid $100-1000, inner $1000-5000, bullseye $5000+ grail territory. Time the aim meter, stop it on the ring you want. Daily and random modes. Share your Dart Score.',
  openGraph: {
    title: 'Card Darts — CardVault',
    description: 'Time the aim meter, stop it on the bullseye. 3 darts. 5 rings. Real cards revealed per ring hit.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Darts — CardVault',
    description: 'Throw 3 darts. Land them on the grail ring. Real card reveals per dart.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Darts' },
];

const faqItems = [
  {
    question: 'How does the aim meter work?',
    answer: 'A horizontal meter sweeps left-to-right at constant speed. Tap or click Throw to stop it. Where the meter stops determines which ring your dart hits. Center = bullseye (grail tier), edges = outer ring (common tier), anywhere between = intermediate rings. Three throws per game, three cards revealed.',
  },
  {
    question: 'What are the rings worth?',
    answer: 'Outer ring (0-12% of meter or 88-100%) = Common Tier ($0-$25 card), 100 pts. Near-outer (12-24% / 76-88%) = Mid Tier ($25-100), 250 pts. Mid (24-38% / 62-76%) = High Tier ($100-1000), 500 pts. Inner (38-48% / 52-62%) = Elite Tier ($1000-5000), 1000 pts. Bullseye (48-52%) = Grail Tier ($5000+), 2500 pts.',
  },
  {
    question: 'Why do some of my darts miss?',
    answer: 'There is a small 3% miss-chance per throw (board rim or off-target), reflecting the real challenge of dart accuracy. Missed throws score 0 and reveal no card. The miss is not biased by meter position — even a perfect bullseye timing can occasionally miss.',
  },
  {
    question: 'What is the difference between Daily and Random modes?',
    answer: 'Daily mode uses the current date as a random seed, so every player gets the same aim-meter speed and miss-roll sequence for the day. This enables fair score comparison and a daily leaderboard feel. Random mode re-seeds on every game for pure replay variety. Stats are tracked across both modes.',
  },
  {
    question: 'How is my Dart Score graded?',
    answer: 'Total score thresholds: S (5000+, needs at least one bullseye + two high-tier), A (3000-4999, at least one elite + two mids), B (1500-2999, reliable mid-tier), C (750-1499, spread of mid-and-below), D (300-749, mostly lower ring), F (under 300, mostly misses or commons). Grades persist in localStorage so you can chase a Best-Ever S grade.',
  },
];

export default function CardDartsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Darts',
        description: '3-dart throwing game with value-tier rings. Time the aim meter, reveal real card cards per ring hit.',
        url: 'https://cardvault-two.vercel.app/card-darts',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>🎯</span>
          Card Darts &middot; 3 Throws &middot; 5 Rings
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Darts</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Three throws. Five value rings. Stop the aim meter where you want it to land —
          bullseye for grail-tier cards, outer ring for commons. Real card reveals with every hit.
        </p>
      </div>

      <CardDartsClient />

      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-red-400 transition-colors list-none flex items-center gap-2">
                <span className="text-red-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          More <Link href="/games" className="text-red-400 hover:underline">CardVault Games</Link>:{' '}
          <Link href="/card-pairs" className="text-red-400 hover:underline">Card Pair Trader</Link>,{' '}
          <Link href="/card-plinko" className="text-red-400 hover:underline">Card Plinko</Link>,{' '}
          <Link href="/card-gauntlet" className="text-red-400 hover:underline">Card Gauntlet</Link>,{' '}
          <Link href="/card-thrift" className="text-red-400 hover:underline">Card Thrift Store</Link>,{' '}
          <Link href="/card-millionaire" className="text-red-400 hover:underline">Card Millionaire</Link>,{' '}
          <Link href="/card-wordle" className="text-red-400 hover:underline">Card Wordle</Link>.
        </p>
      </div>
    </div>
  );
}
