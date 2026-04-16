import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RoadmapClient from './RoadmapClient';

export const metadata: Metadata = {
  title: 'Card Collecting Roadmap — From Beginner to Expert | CardVault',
  description: 'Your complete learning path to becoming a card collecting expert. 6 stages from Curious to Master, with milestones, tool recommendations, and progress tracking. Free interactive collecting roadmap.',
  openGraph: {
    title: 'Card Collecting Roadmap — Beginner to Expert Path | CardVault',
    description: '6 stages, 30+ milestones, progress tracking. Your complete guide from first card to expert collector.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Roadmap — CardVault',
    description: 'Interactive learning path from beginner to expert card collector. Track your progress.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Collecting Roadmap' },
];

const faqItems = [
  {
    question: 'What is the card collecting roadmap?',
    answer: 'The roadmap is an interactive learning path that takes you from complete beginner to expert card collector in 6 stages: Curious, Beginner, Intermediate, Advanced, Expert, and Master. Each stage has specific milestones to complete — like learning grading basics, making your first purchase, or building a portfolio. Track your progress and unlock new stages as you learn.',
  },
  {
    question: 'How long does it take to complete each stage?',
    answer: 'Stage 1 (Curious) takes about a week of casual learning. Stage 2 (Beginner) is typically 2-4 weeks as you make your first purchases. Stage 3 (Intermediate) takes 1-3 months as you develop your strategy. Stages 4-6 develop over months to years as you refine your expertise. There is no rush — collecting is a lifelong hobby.',
  },
  {
    question: 'Do I need to complete milestones in order?',
    answer: 'No! While the stages are ordered from beginner to advanced, you can check off milestones in any order within each stage. Some collectors skip ahead on topics they already know. The roadmap adapts to your pace.',
  },
  {
    question: 'How does progress tracking work?',
    answer: 'Click any milestone to mark it as complete. Your progress saves automatically in your browser using localStorage. You can see your completion percentage per stage and overall. No account needed — your progress stays on your device.',
  },
  {
    question: 'Can I share my progress?',
    answer: 'Yes! Click the "Share Progress" button to copy a text summary of your roadmap completion to your clipboard. Share it in card collecting communities, Discord servers, or social media to show your collecting journey.',
  },
];

export default function CollectingRoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Roadmap',
        description: 'Interactive learning path from beginner to expert card collector. 6 stages, 30+ milestones, progress tracking.',
        url: 'https://cardvault-two.vercel.app/collecting-roadmap',
        applicationCategory: 'EducationalApplication',
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
          6 Stages &middot; 30+ Milestones &middot; Progress Tracking &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collecting Roadmap</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Your complete learning path from curious newcomer to expert collector.
          Track your progress through 6 stages and 30+ milestones.
        </p>
      </div>

      <RoadmapClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {faq.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">Related Resources</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/tools/quiz', label: 'Collector Quiz', desc: 'Find your collector personality' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calc', desc: 'Is grading worth it?' },
            { href: '/tools/gift-guide', label: 'Card Gift Guide', desc: 'Perfect gift for any collector' },
            { href: '/card-encyclopedia', label: 'Encyclopedia', desc: '120+ collecting terms explained' },
            { href: '/card-faq', label: 'FAQ Hub', desc: '50 common questions answered' },
            { href: '/cheat-sheets', label: 'Cheat Sheets', desc: 'Quick-reference guides' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-indigo-700/50 transition-colors">
              <span className="text-white text-sm font-medium">{t.label}</span>
              <span className="text-gray-500 text-xs block mt-0.5">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
