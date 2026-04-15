import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import { sportsCards } from '@/data/sports-cards';
import MatchmakerClient from './MatchmakerClient';

export const metadata: Metadata = {
  title: 'Card Matchmaker — Swipe to Discover Your Next Favorite Card',
  description: 'Tinder for sports cards! Swipe right on cards you love, left on cards you don\'t. Get 20 new cards daily and discover your collector personality — rookie hunter, vintage connoisseur, or sport specialist.',
  openGraph: {
    title: 'Card Matchmaker — CardVault',
    description: 'Swipe through sports cards to discover what you love. 20 new cards daily. Find your collector type.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Matchmaker — CardVault',
    description: 'Tinder for sports cards. Swipe, discover, and learn your collector personality.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Matchmaker' },
];

const faqItems = [
  {
    question: 'What is Card Matchmaker?',
    answer: 'Card Matchmaker is a daily card discovery game. Each day, you get 20 sports cards to swipe through — swipe right (or press →) on cards you like, left (or press ←) on cards you pass on. Over time, the game learns your preferences and builds your collector profile. It\'s like Tinder, but for sports cards.',
  },
  {
    question: 'How does the collector personality work?',
    answer: 'As you swipe, Card Matchmaker tracks your preferences across four dimensions: sport (baseball/basketball/football/hockey), era (vintage/junk-era/modern/ultra-modern), card type (rookies vs veterans), and selectivity (how often you swipe right). After enough swipes, you\'ll be assigned a type like Rookie Hunter, Vintage Connoisseur, Sport Specialist, or Selective Collector.',
  },
  {
    question: 'Do I get new cards every day?',
    answer: 'Yes! Every day at midnight, a new batch of 20 cards is generated from our database of 4,000+ sports cards. Your swipe history resets daily, but your collector personality and total stats carry over. Come back every day to discover new cards and refine your taste profile.',
  },
  {
    question: 'Can I buy the cards I like?',
    answer: 'Card Matchmaker is a discovery tool, not a marketplace. However, every card you like has a link to its full card page on CardVault, which includes an "Search on eBay" link where you can find real listings. Use Matchmaker to discover, then eBay to buy.',
  },
  {
    question: 'Is this available for Pokemon cards too?',
    answer: 'Currently, Card Matchmaker pulls from our sports card database (baseball, basketball, football, and hockey). Pokemon integration is planned for a future update. In the meantime, check out our Pack Simulator which supports both sports and Pokemon products.',
  },
];

export default function MatchmakerPage() {
  // Prepare card data for client component (strip down to needed fields)
  const matchCards = sportsCards.map(c => ({
    slug: c.slug,
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    estimatedValueRaw: c.estimatedValueRaw,
    rookie: c.rookie,
    description: c.description,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Matchmaker — Swipe to Discover Sports Cards',
        description: 'Daily card discovery game. Swipe through 20 sports cards, build your collector profile, and discover cards you love.',
        url: 'https://cardvault-two.vercel.app/matchmaker',
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

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          20 new cards daily · Swipe to discover · Build your taste profile
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Matchmaker</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Swipe right on cards you love, left on cards you pass. Discover your collector personality.
        </p>
      </div>

      <MatchmakerClient cards={matchCards} />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-pink-400 transition-colors">
                {faq.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
