import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CompareMatrix from './CompareMatrix';

export const metadata: Metadata = {
  title: 'Card Compare Matrix — Compare Up to 5 Cards Side by Side',
  description: 'Free card comparison tool. Compare 2-5 sports cards side by side across 9 dimensions: value, year, sport, era, grade multiplier, rarity, and more. Find the best card to buy or grade.',
  openGraph: {
    title: 'Card Compare Matrix — CardVault',
    description: 'Compare up to 5 cards side by side. 9 dimensions. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Compare Matrix — CardVault',
    description: 'Compare 2-5 sports cards across 9 dimensions. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Compare Matrix' },
];

const faqItems = [
  {
    question: 'How many cards can I compare at once?',
    answer: 'You can compare between 2 and 5 cards simultaneously. Each card is displayed as a column in the comparison table, making it easy to see differences at a glance.',
  },
  {
    question: 'What dimensions are compared?',
    answer: 'Cards are compared across 9 dimensions: Sport, Year, Set, Rookie Status, Raw Value, Gem Mint Value, Grade Multiplier (gem/raw ratio), Card Age, and Era classification (Pre-War through Ultra-Modern).',
  },
  {
    question: 'What does the green checkmark mean?',
    answer: 'The green checkmark highlights the "best" card for each numeric dimension — highest raw value, highest gem value, highest grade multiplier, oldest card, and rookie status. For text dimensions like Sport and Set, no winner is marked since these are categorical.',
  },
  {
    question: 'What is the Grade Multiplier?',
    answer: 'The Grade Multiplier shows how much more a card is worth in gem mint condition compared to raw. A 10x multiplier means the PSA 10 value is 10 times the raw value. Higher multipliers indicate cards where grading creates the most value — these are the best candidates for grading submission.',
  },
  {
    question: 'Can I compare cards from different sports?',
    answer: 'Yes! Cross-sport comparison is fully supported. This is useful for portfolio diversification decisions — comparing a baseball rookie card against a football or basketball card to see which offers better value or growth potential.',
  },
];

export default function CompareMatrixPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Compare Matrix',
        description: 'Compare 2-5 sports cards side by side across 9 dimensions including value, year, era, and grade multiplier.',
        url: 'https://cardvault-two.vercel.app/tools/compare-matrix',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          5,200+ Cards &middot; 9 Dimensions &middot; Up to 5 Cards &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Compare Matrix</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Compare up to 5 cards side by side across value, era, grade multiplier, and more. The best way to decide which card to buy, grade, or add to your collection.
        </p>
      </div>

      <CompareMatrix />

      {/* FAQ */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <details key={f.question} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
            <summary className="px-4 py-3 text-white font-medium cursor-pointer hover:text-indigo-400 transition-colors">
              {f.question}
            </summary>
            <div className="px-4 pb-4 text-gray-400 text-sm">{f.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
