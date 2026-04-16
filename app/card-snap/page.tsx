import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardSnapClient from './CardSnapClient';

export const metadata: Metadata = {
  title: 'Card Snap — Speed Matching Game for Sports Card Collectors | CardVault',
  description: 'Test your card knowledge in this fast-paced matching game. Two cards flash on screen — tap SNAP if they share an attribute (same sport, player, decade, rookies, value). 20 pairs in 60 seconds. Daily challenges and random modes.',
  openGraph: {
    title: 'Card Snap — Speed Matching Game | CardVault',
    description: 'Two cards. One second. Do they match? Fast-paced sports card matching game. 20 pairs, 60 seconds.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Snap — CardVault',
    description: 'Fast-paced card matching game. SNAP if they match, PASS if they don\'t. Beat the clock!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Snap' },
];

const faqItems = [
  {
    question: 'How do I play Card Snap?',
    answer: 'Two sports cards appear side by side. If they share any attribute — same sport, same player, same decade, both rookie cards, both worth $50 or more, or same set — tap SNAP. If they have nothing in common, tap PASS. You get 20 pairs and 60 seconds. Correct SNAPs earn 10+ points with speed bonuses, correct PASSes earn 5 points, and wrong answers cost 5 points.',
  },
  {
    question: 'What counts as a match in Card Snap?',
    answer: 'Six attributes can create a match: Same Sport (both baseball, both hockey, etc.), Same Player (two cards of the same athlete), Same Decade (both from the 2020s, both from the 1990s, etc.), Both Rookies (both cards are rookie cards), Both $50+ (both cards are worth $50 or more raw), and Same Set (both from the same card set like 2024 Topps Chrome).',
  },
  {
    question: 'What is the scoring system?',
    answer: 'Correct SNAP: 10 base points plus a speed bonus (up to +6 based on time remaining) plus streak bonus (+2 for 2-streak, +5 for 3+ streak). Correct PASS: 5 points. Wrong SNAP or missed match: -5 points. Grades range from S (200+ points, Legendary) down to F (under 30 points). Build long streaks for maximum score.',
  },
  {
    question: 'Is there a daily challenge?',
    answer: 'Yes. The Daily Challenge uses the same seed for everyone each day, so all players get the same 20 card pairs. This lets you compare scores with friends. Random mode generates a fresh set of pairs every time for unlimited practice.',
  },
  {
    question: 'How many cards are in the Card Snap database?',
    answer: 'Card Snap draws from over 9,000 real sports cards in the CardVault database, covering baseball, basketball, football, and hockey from 1909 to 2025. Each game randomly selects 40 cards to create 20 pairs, with approximately 60 percent being matches and 40 percent non-matches.',
  },
];

export default function CardSnapPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Snap',
        description: 'Fast-paced sports card matching game. Two cards flash on screen — SNAP if they match, PASS if they don\'t. 20 pairs, 60 seconds.',
        url: 'https://cardvault-two.vercel.app/card-snap',
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
        <div className="inline-flex items-center gap-2 bg-green-950/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Card Snap &middot; Speed Game &middot; 9,000+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Snap</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Two cards flash on screen. Do they share an attribute? SNAP if yes, PASS if no.
          20 pairs. 60 seconds. How fast are your card reflexes?
        </p>
      </div>

      <CardSnapClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-green-400 transition-colors list-none flex items-center gap-2">
                <span className="text-green-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/games" className="text-green-400 hover:underline">CardVault Games</Link> collection.
          See also: <Link href="/card-wordle" className="text-green-400 hover:underline">Card Wordle</Link>,{' '}
          <Link href="/card-groups" className="text-green-400 hover:underline">Card Groups</Link>,{' '}
          <Link href="/price-blitz" className="text-green-400 hover:underline">Price Blitz</Link>,{' '}
          <Link href="/card-streak" className="text-green-400 hover:underline">Card Streak</Link>,{' '}
          <Link href="/card-mystery-box" className="text-green-400 hover:underline">Mystery Box</Link>.
        </p>
      </div>
    </div>
  );
}
