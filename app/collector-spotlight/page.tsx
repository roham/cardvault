import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SpotlightClient from './SpotlightClient';

export const metadata: Metadata = {
  title: 'Collector Spotlight — Real Collector Stories, Tips & Strategies | CardVault',
  description: 'Meet 6 real collector archetypes: The Flipper, The Dad, The Completionist, The Dealer, The Content Creator, and The Investor. Learn their strategies, daily routines, top tips, and favorite cards.',
  openGraph: {
    title: 'Collector Spotlight — Real Stories from the Hobby | CardVault',
    description: 'Six collector profiles with strategies, tips, prized cards, and daily routines. Find your collecting archetype.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collector Spotlight — CardVault',
    description: 'Profiles of 6 collector archetypes with strategies, tips, and stories.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Collector Spotlight' },
];

const faqItems = [
  {
    question: 'What is the Collector Spotlight series?',
    answer: 'The Collector Spotlight profiles six distinct collecting archetypes — The Flipper, The Returning Dad, The Completionist, The Dealer, The Content Creator, and The Investor. Each profile includes their strategy, daily routine, prized cards, biggest flips, and top tips for collectors.',
  },
  {
    question: 'Are these real collectors?',
    answer: 'These profiles are composite archetypes built from interviews, forum posts, and community research. They represent the most common collector types in the hobby. The stories, strategies, and tips are drawn from real collecting experiences.',
  },
  {
    question: 'Which collector type am I?',
    answer: 'Most collectors are a mix of 2-3 archetypes. Take the "What Should I Collect?" quiz at /tools/quiz to discover your primary collecting style, or read through the profiles to see which strategies resonate with your approach.',
  },
  {
    question: 'Can I submit my collector story?',
    answer: 'We are always looking for great collector stories. The Collector Spotlight series features archetypes that represent the broader community. Your experiences might inspire future profiles or content updates.',
  },
  {
    question: 'How often are new spotlights added?',
    answer: 'We rotate and update collector profiles regularly. New archetypes, seasonal strategies, and updated tips are added as the hobby evolves. Check back to see the latest collecting wisdom from the community.',
  },
];

export default function CollectorSpotlightPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Collector Spotlight — Real Stories from the Card Collecting Community',
        description: 'Six collector profiles with strategies, tips, prized cards, and daily routines.',
        url: 'https://cardvault-two.vercel.app/collector-spotlight',
        publisher: {
          '@type': 'Organization',
          name: 'CardVault',
          url: 'https://cardvault-two.vercel.app',
        },
        datePublished: '2026-04-15',
        dateModified: '2026-04-15',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Collector Spotlight</h1>
          <span className="text-xs bg-blue-950/60 border border-blue-800/50 text-blue-400 px-2 py-0.5 rounded-full">Series</span>
        </div>
        <p className="text-gray-400 text-lg">
          Six collector archetypes. Their strategies, stories, prized cards, and the tips they wish they knew from day one.
        </p>
      </div>

      <SpotlightClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related content */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Content</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/quiz', label: 'Find Your Type', icon: '🎯' },
            { href: '/news', label: 'Card News', icon: '📰' },
            { href: '/newsletter', label: 'The Morning Flip', icon: '☕' },
            { href: '/guides', label: 'Guides', icon: '📚' },
          ].map(g => (
            <Link key={g.href} href={g.href}
              className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center hover:border-gray-700 transition-colors">
              <span className="text-2xl block mb-1">{g.icon}</span>
              <span className="text-white text-sm font-medium">{g.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
