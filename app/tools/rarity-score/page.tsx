import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RarityCalculator from './RarityCalculator';

export const metadata: Metadata = {
  title: 'Card Rarity Score Calculator — How Rare Is Your Card?',
  description: 'Free card rarity calculator. Search any sports card and get a 0-100 rarity score based on age, value, gem rate, rookie status, set era, and sport. From "Mass Produced" to "Legendary" — know exactly how rare your card is.',
  openGraph: {
    title: 'Card Rarity Score Calculator — CardVault',
    description: 'Find out how rare your card really is. 0-100 rarity score with factor breakdown.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Rarity Score Calculator — CardVault',
    description: 'Free rarity scorer for sports cards. 6 factors, 6 tiers, instant results.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Rarity Score Calculator' },
];

const faqItems = [
  {
    question: 'How is the rarity score calculated?',
    answer: 'The rarity score (0-100) is based on 6 weighted factors: Card Age (25 pts) — older cards are rarer due to natural attrition; Market Value (25 pts) — prices reflect supply/demand dynamics; Gem Rate Premium (20 pts) — the ratio between gem mint and raw prices indicates grading scarcity; Rookie Status (10 pts) — first-year cards are more collected; Set/Era Rarity (10 pts) — print runs and era significance; Sport Factor (10 pts) — collector base size and preservation rates.',
  },
  {
    question: 'What do the rarity tiers mean?',
    answer: 'Legendary (85-100): Museum-quality cards like T206 Wagner, 1952 Topps Mantle. Ultra Rare (70-84): Key HOF rookies, high-value vintage. Rare (55-69): Desirable cards with limited supply. Uncommon (40-54): Moderate availability, solid collectibles. Common (25-39): Widely available cards. Mass Produced (0-24): Junk wax era and modern overproduction.',
  },
  {
    question: 'Why does a junk wax era card score so low?',
    answer: 'Cards from 1987-1994 (the "junk wax era") were massively overproduced. Millions of copies of each card exist. A 1989 Upper Deck Ken Griffey Jr. RC — one of the best cards of the era — still has millions of copies, which keeps prices low despite the player being a Hall of Famer. The era factor penalizes these cards for their extreme abundance.',
  },
  {
    question: 'Does the rarity score predict future value?',
    answer: 'No. The rarity score measures current scarcity based on available data. Future value depends on many additional factors: player career trajectory, hobby trends, economic conditions, and cultural relevance. A high rarity score indicates the card is scarce, but scarcity alone does not guarantee appreciation.',
  },
  {
    question: 'Can I use this for Pokemon cards?',
    answer: 'The calculator is optimized for sports cards (baseball, basketball, football, hockey). Pokemon and other TCG cards have different scarcity dynamics — print runs, pull rates, and set rotation work differently. A dedicated TCG rarity tool is planned for a future update.',
  },
];

export default function RarityScorePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Rarity Score Calculator',
        description: 'Calculate the rarity score (0-100) for any sports card based on age, value, gem rate, and more.',
        url: 'https://cardvault-two.vercel.app/tools/rarity-score',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Search 4,300+ cards &middot; 6 Rarity Factors &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Rarity Score Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How rare is your card? Search any sports card and get a rarity score from 0 to 100 based on age, market value, gem rate, rookie status, set era, and sport &mdash; from &ldquo;Mass Produced&rdquo; to &ldquo;Legendary.&rdquo;
        </p>
      </div>

      <RarityCalculator />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer p-4 text-white font-medium">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">More Card Analysis Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/tools/pop-report" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Population Report</div>
            <div className="text-gray-400 text-sm">See how many graded copies exist</div>
          </Link>
          <Link href="/tools/investment-calc" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Investment Calculator</div>
            <div className="text-gray-400 text-sm">Calculate returns vs S&P 500 and gold</div>
          </Link>
          <Link href="/tools/cross-grade" className="block p-4 bg-gray-900/80 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors">
            <div className="text-white font-medium mb-1">Cross-Grade Converter</div>
            <div className="text-gray-400 text-sm">PSA/BGS/CGC/SGC grade equivalents</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
