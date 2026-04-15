import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardMatchmakerClient from './CardMatchmakerClient';

export const metadata: Metadata = {
  title: 'Card Matchmaker — Find Similar Cards You\'ll Love | CardVault',
  description: 'Free card recommendation engine. Select any sports card and discover 8 similar cards you should check out. Similarity scoring across 6 dimensions: same player, era, value range, position, set family, and investment profile. Search 6,800+ sports cards.',
  openGraph: {
    title: 'Card Matchmaker — Discover Your Next Card | CardVault',
    description: 'Pick a card you like, get 8 personalized recommendations with match scores. The Spotify Discover Weekly of card collecting.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Matchmaker — CardVault',
    description: 'Find cards similar to ones you already love. 6-dimension similarity scoring.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Matchmaker' },
];

const faqItems = [
  {
    question: 'What is the Card Matchmaker?',
    answer: 'The Card Matchmaker is a recommendation engine for sports card collectors. Select any card from our database of 6,800+ cards, and it finds the 8 most similar cards you should check out. It scores similarity across 6 dimensions: same player (different cards), era match (similar year), value range (comparable price point), position/role match, set family (related product lines), and investment profile (rookie status, grading upside). Each recommendation shows a match percentage and explains why the card is a good match.',
  },
  {
    question: 'How does the similarity scoring work?',
    answer: 'Each recommendation is scored 0-100% across 6 weighted dimensions. Same Player (25%) rewards different cards of the same athlete. Era Match (20%) favors cards from the same decade. Value Match (20%) finds cards at a similar price point. Position Match (15%) connects players who play the same position or role. Set Family (10%) links cards from related product lines like Topps Chrome and Topps. Investment Profile (10%) matches cards with similar rookie status, grading multipliers, and age profiles. The overall match score is the weighted average of all 6 dimensions.',
  },
  {
    question: 'Can I filter recommendations by sport?',
    answer: 'The matchmaker finds the best matches across all four major sports (baseball, basketball, football, hockey) by default. If you select a baseball card, you will naturally get more baseball recommendations because same-sport cards score higher on position matching. However, cross-sport recommendations appear when cards share strong era, value, or investment profile similarities.',
  },
  {
    question: 'How is this different from the Head-to-Head tool?',
    answer: 'The Head-to-Head tool compares exactly 2 specific cards side by side on detailed metrics. The Card Matchmaker is a discovery tool — you provide one card and it finds 8 cards you might not have considered. Think of Head-to-Head as a microscope (deep comparison of known cards) and Card Matchmaker as a telescope (discovering new cards based on what you already like).',
  },
  {
    question: 'Why should I use this tool?',
    answer: 'Card Matchmaker helps you discover cards you did not know existed, find affordable alternatives to expensive cards, diversify your collection into related players and eras, identify investment opportunities with similar profiles to cards that have performed well, and build thematic collections around an era, position, or value tier. It is the fastest way to go from "I like this card" to "here are 8 more I should look at."',
  },
];

export default function CardMatchmakerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Matchmaker',
        description: 'Card recommendation engine. Select any sports card and discover 8 similar cards based on 6-dimension similarity scoring.',
        url: 'https://cardvault-two.vercel.app/tools/card-matchmaker',
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
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          Discovery Tool &middot; 6-Dimension Matching &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Matchmaker
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
          Pick a card you love. We&apos;ll find 8 cards you should check out next &mdash; scored across player, era, value, position, set, and investment profile.
        </p>
      </div>

      <CardMatchmakerClient />

      {/* How It Works */}
      <div className="mt-12 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Pick a Card', desc: 'Search and select any card from 6,800+ in our database.' },
            { step: '2', title: 'We Score Matches', desc: '6-dimension similarity analysis finds the best matches.' },
            { step: '3', title: 'Discover & Collect', desc: 'Explore 8 personalized recommendations with eBay links.' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 bg-pink-500/20 border border-pink-500/30 rounded-full flex items-center justify-center text-pink-400 font-bold mx-auto mb-2">{s.step}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-gray-500 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/head-to-head', label: 'Head-to-Head Comparison', desc: 'Compare any 2 cards side by side' },
            { href: '/tools/value-dna', label: 'Card Value DNA', desc: 'Understand why a card is worth what it is' },
            { href: '/tools/rookie-finder', label: 'Rookie Finder', desc: 'Find the best rookie cards by sport' },
            { href: '/tools/combo-analyzer', label: 'Combo Analyzer', desc: 'Build and analyze multi-card packages' },
            { href: '/tools/card-scout', label: 'Card Scout', desc: 'Find undervalued cards in the database' },
            { href: '/tools/quiz', label: 'What Should I Collect?', desc: 'Take the quiz to find your collecting style' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/70 transition-colors">
              <div>
                <div className="text-white text-sm font-medium">{t.label}</div>
                <div className="text-gray-500 text-xs">{t.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
              <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:text-pink-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
