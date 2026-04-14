import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InsightsClient from './InsightsClient';

export const metadata: Metadata = {
  title: 'Collection Insights — Your Collector Profile & Stats',
  description: 'See your collector profile, engagement score, investment summary, and personalized recommendations. Track your progress across all CardVault features.',
  openGraph: {
    title: 'Collection Insights — CardVault',
    description: 'Your collector profile with engagement score, investment summary, and recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Insights — CardVault',
    description: 'Your complete collector profile and progress dashboard.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Collection Insights' },
];

const faqItems = [
  {
    question: 'What is the Collection Insights page?',
    answer: 'Collection Insights aggregates your activity across all CardVault features — streaks, achievements, pack openings, vault, binder, investments, and more — into a single collector profile with an engagement score and personalized recommendations.',
  },
  {
    question: 'How is the engagement score calculated?',
    answer: 'The engagement score (0-100) is based on how many CardVault features you actively use: daily streak, achievements, pack simulator, card battles, vault, binder, weekly challenges, and investments. Using more features increases your score.',
  },
  {
    question: 'Is my data private?',
    answer: 'Yes — all data is stored locally on your device. Nothing is sent to any server. Your collector profile is private to your browser.',
  },
];

export default function CollectionInsightsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Insights',
        description: 'Collector profile with engagement score, investment summary, and personalized recommendations.',
        url: 'https://cardvault-two.vercel.app/collection-insights',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
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

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-3">
          Collection Insights
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Your complete collector profile. See your stats, track your progress, and get personalized recommendations.
        </p>
      </div>

      <InsightsClient />

      {/* FAQ */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="px-5 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors">{item.question}</summary>
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">Explore Features</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/my-hub', label: 'My Hub', icon: '🏠' },
            { href: '/achievements', label: 'Achievements', icon: '🏅' },
            { href: '/streak', label: 'Streak', icon: '🔥' },
            { href: '/vault', label: 'My Vault', icon: '🔒' },
            { href: '/binder', label: 'Binder', icon: '📖' },
            { href: '/rookie-tracker', label: 'Rookie Tracker', icon: '📈' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors">
              <span>{t.icon}</span><span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
