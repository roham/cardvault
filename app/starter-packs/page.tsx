import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import StarterPacksClient from './StarterPacksClient';

export const metadata: Metadata = {
  title: 'Starter Packs — Curated Card Collections for Every Collector | CardVault',
  description: 'Not sure what to collect? Choose from 6 curated starter packs: Budget Rookies, Vintage Classics, Current Superstars, Multi-Sport Sampler, Grading Investments, and Pre-War Legends. Each pack has 8 hand-picked cards with buy links.',
  openGraph: {
    title: 'Starter Packs — Curated Card Collections | CardVault',
    description: '6 curated starter collections for new and experienced collectors. Budget to premium, beginner to advanced.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Starter Packs — CardVault',
    description: 'Not sure what to collect? Pick a starter pack and start your collection today.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Starter Packs' },
];

const faqItems = [
  {
    question: 'What are Starter Packs?',
    answer: 'Starter Packs are curated collections of 8 cards designed for different types of collectors. Each pack has a theme (Budget Rookies, Vintage, Current Stars, etc.), a budget range, and a difficulty level. The cards are automatically selected from our database of 6,500+ cards based on value, relevance, and investment potential. Think of them as build guides for your collection.',
  },
  {
    question: 'How are the cards selected?',
    answer: 'Each starter pack has a scoring algorithm that evaluates every card in our database based on the pack\'s criteria. For Budget Rookies, it prioritizes rookie cards under $25 from recent years. For Vintage, it looks for pre-1985 cards with strong name recognition. For Grading Candidates, it finds cards with the highest raw-to-gem value multipliers. Cards are deduplicated by player so you get variety.',
  },
  {
    question: 'Are the buy links affiliate links?',
    answer: 'The eBay links take you to eBay search results for the specific card, making it easy to find and compare listings. We recommend comparing prices across multiple platforms (eBay, COMC, MySlabs, local card shops) before purchasing. Always check seller ratings and card photos carefully.',
  },
  {
    question: 'Can I mix cards from different packs?',
    answer: 'Absolutely! The packs are starting points, not strict rules. Many collectors start with a Budget Rookie pack and add a few Vintage picks over time. The key is to collect what excites you — your collection should reflect your interests, not just investment potential.',
  },
  {
    question: 'Which pack should I choose as a complete beginner?',
    answer: 'Start with the Budget Rookie Collection or the Current Superstars pack. Both have low cost of entry (under $200 total), feature players you probably already know, and give you cards that are easy to resell if you decide collecting is not for you. The Multi-Sport Sampler is also great if you want to explore different sports before committing to one.',
  },
];

export default function StarterPacksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Starter Packs',
        description: 'Curated card collections for every type of collector. 6 themed starter packs from budget to premium, beginner to advanced.',
        url: 'https://cardvault-two.vercel.app/starter-packs',
        applicationCategory: 'ShoppingApplication',
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
          6 Curated Packs &middot; Beginner to Advanced &middot; eBay Buy Links
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Starter Packs</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Not sure what to collect? Pick a starter pack matched to your budget
          and interests. Each pack has 8 hand-picked cards with direct buy links.
        </p>
      </div>

      <StarterPacksClient />

      <div className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {item.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 text-sm">
        <Link href="/guides" className="text-emerald-400 hover:underline">All Guides</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/start" className="text-emerald-400 hover:underline">Getting Started</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/quiz" className="text-emerald-400 hover:underline">Collector Quiz</Link>
        <span className="text-gray-600">&middot;</span>
        <Link href="/tools/value-dna" className="text-emerald-400 hover:underline">Card Value DNA</Link>
      </div>
    </div>
  );
}
