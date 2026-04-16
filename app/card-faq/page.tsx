import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardFaqClient from './CardFaqClient';

export const metadata: Metadata = {
  title: '50 Most Asked Card Collecting Questions — Answered | CardVault',
  description: 'Answers to the 50 most common sports card and Pokémon card collecting questions. Covers grading, buying, selling, investing, condition, breaks, and collecting basics. Searchable and filterable.',
  openGraph: {
    title: '50 Card Collecting Questions Answered — CardVault',
    description: 'Everything you need to know about card collecting in 50 answers. Grading, buying, selling, investing, breaks, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '50 Card Collecting FAQ — CardVault',
    description: '50 most asked card collecting questions, answered with tool links.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: '50 Most Asked Questions' },
];

const topFaqs = [
  { question: 'Is it worth grading my card?', answer: 'It depends on the card\'s raw value and condition. The "3x Rule" says grading is worth it if a graded copy sells for at least 3x the raw price plus grading cost.' },
  { question: 'What is the difference between PSA, BGS, and CGC?', answer: 'PSA is the most popular with highest premiums. BGS uses 4 subgrades and a BGS 10 is rarer than PSA 10. CGC is newer, often cheaper. SGC is great for vintage.' },
  { question: 'Should I buy sealed boxes or singles?', answer: 'Almost always buy singles for specific cards. Sealed product expected value is 50-70% of retail. You pay a "fun premium" to rip.' },
  { question: 'How much are my old baseball cards worth?', answer: 'Most 1987-1994 "Junk Wax" cards are worth $0.01-$0.10 due to overproduction. Check eBay "Sold Items" for actual market prices.' },
  { question: 'Are sports cards a good investment?', answer: 'Cards can be profitable but are illiquid, volatile, and unregulated. Top vintage appreciates steadily. Modern cards are speculative. Keep card "investing" to 5-10% of your portfolio.' },
  { question: 'What is a card break?', answer: 'A group break where a breaker opens sealed product and sells spots by team or pick order. Participants receive cards matching their team/pick. A way to access expensive products affordably.' },
  { question: 'How do I start collecting sports cards?', answer: 'Pick one sport and player you love. Search their cards on eBay "Sold Items". Buy a few singles in the $5-$25 range. Protect them properly. Don\'t spend big until you know the hobby.' },
  { question: 'What does "RC" mean on a card?', answer: 'RC = Rookie Card — the first officially licensed base card in a player\'s major league uniform. Typically the most valuable version of any player.' },
];

export default function CardFaqPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: topFaqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: '50 Most Asked Card Collecting Questions',
        description: 'Comprehensive FAQ covering grading, buying, selling, investing, condition, Pokémon, breaks, and collecting basics.',
        url: 'https://cardvault-two.vercel.app/card-faq',
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          50 Questions &middot; 8 Categories &middot; Tool Links
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          50 Most Asked Card Collecting Questions
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Everything you need to know about sports cards and Pokémon cards — grading, buying, selling, investing, condition, breaks, and collecting basics. Searchable and filterable.
        </p>
      </div>

      <CardFaqClient />

      {/* Related Resources */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Related Resources</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/guides', label: 'Collector Guides', desc: '25+ in-depth guides' },
            { href: '/card-encyclopedia', label: 'Encyclopedia', desc: '120+ collecting terms' },
            { href: '/golden-rules', label: '25 Golden Rules', desc: 'Essential collecting rules' },
            { href: '/collecting-mistakes', label: '20 Mistakes', desc: 'Costly mistakes to avoid' },
            { href: '/tools/quiz', label: 'Collector Quiz', desc: 'Find your collector type' },
            { href: '/start', label: 'Getting Started', desc: 'New to cards? Start here' },
          ].map(g => (
            <Link key={g.href} href={g.href} className="bg-zinc-800/60 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600/50 transition-colors">
              <p className="text-white text-sm font-medium">{g.label}</p>
              <p className="text-zinc-500 text-xs">{g.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
