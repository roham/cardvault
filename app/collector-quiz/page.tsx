import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectorQuizClient from './CollectorQuizClient';

export const metadata: Metadata = {
  title: 'Collector Personality Quiz — What Type of Card Collector Are You? | CardVault',
  description: 'Take our 10-question quiz to discover your collector personality. Are you a Flipper, Investor, Completionist, Dealer, Opener, or Returning Collector? Get personalized tool recommendations based on your archetype.',
  openGraph: {
    title: 'What Type of Card Collector Are You? | CardVault',
    description: 'Discover your collector personality in 2 minutes. 10 questions, 6 archetypes, personalized recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collector Personality Quiz — CardVault',
    description: 'What type of card collector are you? Take the quiz and find out.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Collector Personality Quiz' },
];

const faqItems = [
  {
    question: 'What is the Collector Personality Quiz?',
    answer: 'The Collector Personality Quiz is a 10-question assessment that matches you to one of six card collector archetypes: The Flipper (buy low, sell high), The Returning Collector (rediscovering the hobby), The Investor (portfolio-minded), The Completionist (set builders), The Dealer (full-time hobby business), and The Opener (rip and share). Each archetype comes with personalized tool recommendations, strengths, and blind spots.',
  },
  {
    question: 'How accurate is the quiz?',
    answer: 'The quiz is designed for fun and self-discovery, not clinical accuracy. Most collectors are a blend of 2-3 archetypes — the quiz shows your primary type and secondary tendencies. The archetype breakdown bar chart shows how you scored across all six types. Many collectors find their secondary archetype just as relevant as their primary.',
  },
  {
    question: 'What are the six collector archetypes?',
    answer: 'The Flipper (Marcus) focuses on buying and selling for profit. The Returning Collector (Dave) is rediscovering the hobby after years away. The Investor (Kai) treats cards like a portfolio with diversification and long-term thinking. The Completionist (Mia) builds sets and checks off checklists. The Dealer (Tony) runs the hobby as a business. The Opener (Jess) lives for the rip — opening packs and sharing the experience.',
  },
  {
    question: 'Can I retake the quiz?',
    answer: 'Yes. Click "Take Quiz Again" at the bottom of your results to start over. Your answers are not saved between sessions, so each attempt is fresh. Try answering with your gut instinct rather than overthinking — the first answer that comes to mind is usually the most accurate.',
  },
  {
    question: 'What do the tool recommendations mean?',
    answer: 'Based on your archetype, we recommend four CardVault tools that match your collecting style. Flippers get market and selling tools. Investors get portfolio and ROI tools. Completionists get set tracking and checklist tools. Every tool is free and works without an account.',
  },
];

export default function CollectorQuizPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Collector Personality Quiz',
        description: 'Discover your card collector personality. 10 questions, 6 archetypes, personalized recommendations.',
        url: 'https://cardvault-two.vercel.app/collector-quiz',
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

      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          10 Questions - 6 Archetypes - Personalized Results - Shareable
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">What Type of Card Collector Are You?</h1>
        <p className="text-gray-400 text-lg">
          Answer 10 questions to discover your collector personality. Get matched to one of six archetypes with personalized tool recommendations, strengths, and blind spots.
        </p>
      </div>

      <CollectorQuizClient />

      {/* FAQ section */}
      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-violet-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Explore More</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/quiz', label: 'What Should I Collect?', desc: 'Personalized collecting recommendation' },
            { href: '/tools', label: 'All Tools', desc: '71 free collector tools' },
            { href: '/pack-store', label: 'Pack Store', desc: 'Open digital card packs' },
            { href: '/card-detective', label: 'Card Detective', desc: 'Daily mystery card game' },
            { href: '/tier-list', label: 'Tier List Maker', desc: 'Rank cards S through F' },
            { href: '/guides', label: 'Collector Guides', desc: 'Learn the hobby fundamentals' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-violet-700 transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-violet-400 transition-colors">{link.label}</div>
              <div className="text-gray-500 text-xs mt-1">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
