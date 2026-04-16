import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTopTrumpsClient from './CardTopTrumpsClient';

export const metadata: Metadata = {
  title: 'Card Top Trumps — Beat the CPU in a Stats Showdown | CardVault',
  description: 'Free head-to-head card game for sports card collectors. Pick the strongest stat on your card to beat the CPU. 10 rounds, 5 stat categories (Raw Value, Gem Value, Year, Age, Rookie Power). Daily challenge + random mode. 9,700+ real sports cards.',
  openGraph: {
    title: 'Card Top Trumps — Stats Showdown | CardVault',
    description: 'Pick the best stat on your card to beat the CPU. 10-round head-to-head card battle using real sports card data.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Top Trumps — CardVault',
    description: 'Beat the CPU by picking your card\'s strongest stat. Daily challenge + random mode.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Top Trumps' },
];

const faqItems = [
  {
    question: 'How does Card Top Trumps work?',
    answer: 'You and the CPU each get 10 random sports cards. Each round, you see your card face-up while the CPU card is hidden. Pick the stat category where you think your card is strongest — Raw Value, Gem Value, Year, Card Age, or Rookie Power. The higher value wins the round. Win more rounds than the CPU to claim victory.',
  },
  {
    question: 'What are the stat categories?',
    answer: 'Five categories to choose from: Raw Value (PSA 9 estimated price), Gem Value (PSA 10 estimated price), Year (when the card was made — newer wins), Age (older cards score higher), and Rookie Power (rookie cards score 100, base cards score 0). Each card has different strengths, so strategy matters.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Your grade is based on win percentage across 10 rounds. S grade = 90%+ wins (9-10 of 10), A = 75%+, B = 60%+, C = 40%+, D = 20%+, F = under 20%. Perfect 10-0 sweeps are rare and earn the coveted S grade.',
  },
  {
    question: 'What is the difference between Daily and Random?',
    answer: 'Daily mode uses a date-based seed — everyone gets the same 20 cards that day, making it fair to compare scores with friends. Random mode generates a unique matchup each time for unlimited practice and experimentation.',
  },
  {
    question: 'What is the best strategy?',
    answer: 'Look at your card\'s strengths before picking. Vintage cards from the 1980s-90s dominate the Age category. Rookie cards always win Rookie Power. High-end cards ($100+) dominate value categories. Modern cards win the Year stat. Read your card, then pick the stat where you have the biggest edge.',
  },
];

export default function CardTopTrumpsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Top Trumps',
        description: 'Head-to-head card stat battle game using real sports card data. Pick your strongest stat to beat the CPU.',
        url: 'https://cardvault-two.vercel.app/card-top-trumps',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Stats Battle &middot; 9,700+ Cards &middot; 5 Stats
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
          Card Top Trumps
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Head-to-head card stat battle. Pick the category where your card is strongest to beat the CPU.
          10 rounds, 5 stats, real card data. Can you outsmart the deck?
        </p>
      </div>

      <CardTopTrumpsClient />

      {/* FAQ Section */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <details key={f.question} className="group bg-gray-900/50 border border-gray-800/50 rounded-xl">
            <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-200 hover:text-white transition">
              {f.question}
            </summary>
            <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</div>
          </details>
        ))}
      </div>

      {/* Related games */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">More Card Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-gauntlet', title: 'Card Gauntlet', desc: 'Endless survival — pick the pricier card' },
            { href: '/card-chain', title: 'Card Chain', desc: 'Build the longest connected chain' },
            { href: '/card-draft', title: 'Card Draft', desc: 'Snake draft vs 3 AI opponents' },
            { href: '/card-snap', title: 'Card Snap', desc: 'Speed matching — snap shared attributes' },
            { href: '/card-wordle', title: 'Card Wordle', desc: 'Guess the mystery player in 6 tries' },
            { href: '/games', title: 'All Games →', desc: '60+ free card games' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-3 hover:border-teal-700/50 transition">
              <p className="text-sm font-bold text-white">{g.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
