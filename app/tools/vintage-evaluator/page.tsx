import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import VintageEvaluatorClient from './VintageEvaluatorClient';

export const metadata: Metadata = {
  title: 'Are My Old Cards Worth Anything? — Free Vintage Card Evaluator | CardVault',
  description: 'Free tool to evaluate old sports cards. Find out if your vintage baseball, basketball, football, or hockey cards are valuable. Covers pre-war, vintage, junk wax, and modern eras with specific cards to look for and value estimates.',
  openGraph: {
    title: 'Are My Old Cards Worth Anything? — CardVault',
    description: 'Found a box of old cards? Find out if they\'re worth something. Free vintage card evaluator covers every era from pre-war to modern.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Are My Old Cards Worth Anything? — CardVault',
    description: 'Found old cards in your attic? This free tool tells you if they\'re valuable.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Vintage Card Evaluator' },
];

const faqItems = [
  {
    question: 'Are my old baseball cards from the 1980s and 1990s worth anything?',
    answer: 'Most cards from 1980-1994 (the "Junk Wax" era) are worth very little because billions were printed. However, specific cards can still be valuable: 1986 Fleer Michael Jordan RC ($3,000+), 1989 Upper Deck Ken Griffey Jr RC ($50-$200), 1993 SP Derek Jeter RC ($500+), and certain error cards. The key is identifying the few valuable needles in the haystack of commons.',
  },
  {
    question: 'How do I tell if my old sports cards are valuable?',
    answer: 'Three main factors determine old card value: (1) Era — pre-war (1900-1941) and vintage (1952-1979) cards are almost always worth something. (2) Player — Hall of Famers and legends command premiums. (3) Condition — a card in mint condition can be worth 10-100x more than the same card with creases and damage. Rookie cards of famous players in good condition are the most valuable.',
  },
  {
    question: 'Should I get my old cards graded by PSA or BGS?',
    answer: 'Only grade cards that are worth significantly more graded than raw. PSA grading starts at $20-30 per card. If your card is worth $10 raw, grading it rarely makes financial sense. Grade cards that are (a) rookie cards of stars, (b) in excellent condition, and (c) worth $50+ raw. Use our Grading ROI Calculator to check specific cards before submitting.',
  },
  {
    question: 'Where can I sell my old sports card collection?',
    answer: 'For individual valuable cards: eBay (largest audience), COMC (consignment), or local card shops. For bulk collections: Facebook Marketplace groups, local card shows, or consignment shops. Never sell a potentially valuable collection to the first buyer — get at least 2-3 offers. For cards worth $500+, consider auction houses like Heritage Auctions.',
  },
  {
    question: 'What are the most valuable old sports cards?',
    answer: 'The most valuable sports cards include: 1952 Topps Mickey Mantle ($12.6M PSA 9), T206 Honus Wagner ($7.25M), 1986 Fleer Michael Jordan ($840K PSA 10), 1958 Topps Jim Brown ($358K PSA 9), and 1979 O-Pee-Chee Wayne Gretzky ($3.75M PSA 10). But even more common vintage cards can be worth $50-$500+ depending on player and condition.',
  },
];

export default function VintageEvaluatorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Vintage Card Evaluator',
        description: 'Free tool to evaluate old sports cards. Find out if your vintage baseball, basketball, football, or hockey cards are valuable.',
        url: 'https://cardvault-two.vercel.app/tools/vintage-evaluator',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          5 Eras - Instant Evaluation - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Are My Old Cards Worth Anything?</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Found a box of old sports cards? Answer a few questions and get an instant assessment of whether your collection could be valuable, plus specific cards to look for.
        </p>
      </div>

      <VintageEvaluatorClient />

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i} className="border-b border-gray-700/50 pb-5 last:border-0 last:pb-0">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/tools/identify" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🔍</span>
            <div>
              <div className="text-white text-sm font-medium">Card Identifier</div>
              <div className="text-gray-500 text-xs">Find exactly which card you have</div>
            </div>
          </Link>
          <Link href="/tools/condition-grader" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏅</span>
            <div>
              <div className="text-white text-sm font-medium">Condition Grader</div>
              <div className="text-gray-500 text-xs">Estimate PSA/BGS grade</div>
            </div>
          </Link>
          <Link href="/tools/grading-roi" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📊</span>
            <div>
              <div className="text-white text-sm font-medium">Grading ROI Calculator</div>
              <div className="text-gray-500 text-xs">Is grading worth the cost?</div>
            </div>
          </Link>
          <Link href="/tools/collection-value" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-white text-sm font-medium">Collection Value</div>
              <div className="text-gray-500 text-xs">Calculate total collection worth</div>
            </div>
          </Link>
          <Link href="/tools/auth-check" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🔐</span>
            <div>
              <div className="text-white text-sm font-medium">Authentication Checker</div>
              <div className="text-gray-500 text-xs">Verify your cards are real</div>
            </div>
          </Link>
          <Link href="/tools/era-guide" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📅</span>
            <div>
              <div className="text-white text-sm font-medium">Era Guide</div>
              <div className="text-gray-500 text-xs">Explore cards by time period</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
