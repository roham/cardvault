import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EncyclopediaClient from './EncyclopediaClient';

export const metadata: Metadata = {
  title: 'Card Collecting Encyclopedia — 120+ Terms Every Collector Should Know | CardVault',
  description: 'The ultimate sports card glossary and encyclopedia. 120+ terms across 8 categories: Grading, Card Types, Market, Condition, Rarity, Selling, Investing, and Breaks. Searchable, filterable, with real examples and tool links.',
  openGraph: {
    title: 'Card Collecting Encyclopedia — CardVault',
    description: '120+ card collecting terms explained. Search by category, learn with examples, discover tools.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Encyclopedia — CardVault',
    description: '120+ terms. 8 categories. The definitive card collecting reference.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Encyclopedia' },
];

const faqItems = [
  {
    question: 'What is the most important card collecting term to know?',
    answer: 'PSA 10 (Gem Mint) is arguably the most important term because it defines the pinnacle of card grading. A PSA 10 card has perfect centering, sharp corners, smooth edges, and no surface flaws. Understanding grading levels (PSA 1-10, BGS 1-10 with subgrades, CGC 1-10) is essential because condition determines 50-90% of a card\'s value.',
  },
  {
    question: 'What does RC mean on a sports card?',
    answer: 'RC stands for Rookie Card — a player\'s first officially licensed trading card from their rookie season. Rookie cards are the most collectible and valuable card type because they mark the beginning of a player\'s career. The RC designation is typically printed on the card. First Bowman cards (for baseball) serve a similar purpose for prospects before their MLB debut.',
  },
  {
    question: 'What is the difference between raw and graded cards?',
    answer: 'A raw card is ungraded — it has not been submitted to a professional grading company (PSA, BGS, CGC, SGC). A graded card (also called a slab) has been professionally evaluated, assigned a numerical grade (1-10), and sealed in a tamper-proof case. Graded cards trade at premiums because buyers trust the condition assessment.',
  },
  {
    question: 'What are parallels and refractors?',
    answer: 'Parallels are alternate versions of a base card with different colors, patterns, or foil treatments. Refractors are a specific type of parallel with a shiny, rainbow-like surface that was pioneered by Topps Chrome. Parallels vary in rarity — from common (Silver) to ultra-rare (1/1 Superfractors). Rarer parallels command significant premiums.',
  },
  {
    question: 'What is a group break in card collecting?',
    answer: 'A group break is when a breaker purchases sealed products (boxes, cases) and splits the cost among participants. Each participant buys a team or spot. When packs are opened live, cards are distributed based on the team or slot purchased. Breaks make expensive products accessible but typically have negative expected value for individual participants.',
  },
];

export default function EncyclopediaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Encyclopedia',
        description: '120+ card collecting terms across 8 categories. Searchable glossary with examples and tool links.',
        applicationCategory: 'ReferenceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/card-encyclopedia',
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

      <EncyclopediaClient />

      {/* Related Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/guides" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Collector Guides</div>
            <div className="text-gray-500 text-xs">In-depth guides for grading, investing, eras</div>
          </a>
          <a href="/golden-rules" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">25 Golden Rules</div>
            <div className="text-gray-500 text-xs">Essential rules every collector should follow</div>
          </a>
          <a href="/collecting-mistakes" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">20 Collecting Mistakes</div>
            <div className="text-gray-500 text-xs">Costly errors to avoid</div>
          </a>
          <a href="/cheat-sheets" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Cheat Sheets</div>
            <div className="text-gray-500 text-xs">Quick-reference cards for every situation</div>
          </a>
          <a href="/tools/quiz" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Collector Quiz</div>
            <div className="text-gray-500 text-xs">Find your collector personality</div>
          </a>
          <a href="/bucket-list" className="px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-xl transition-colors">
            <div className="text-white text-sm font-medium">Card Bucket List</div>
            <div className="text-gray-500 text-xs">50 iconic cards every collector needs</div>
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
