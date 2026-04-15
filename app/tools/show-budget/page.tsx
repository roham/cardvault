import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowBudgetTracker from './ShowBudgetTracker';

export const metadata: Metadata = {
  title: 'Card Show Budget Tracker — Track Buys & Sells at Live Shows',
  description: 'Free mobile-first budget tracker for card shows. Set a budget, log purchases and sales in real time, track your P&L, and see how much budget remains. Multiple show sessions saved locally.',
  openGraph: {
    title: 'Card Show Budget Tracker — CardVault',
    description: 'Track your spending and sales at card shows in real time. Set budgets, log transactions, see P&L.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Budget Tracker — CardVault',
    description: 'Mobile-first budget tracker for card shows. Real-time P&L, budget alerts, transaction history.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Show Budget Tracker' },
];

const faqItems = [
  {
    question: 'How does the card show budget tracker work?',
    answer: 'Create a show session with a budget amount, then log every buy and sell as you walk the show floor. The tracker shows your running total, remaining budget, and net P&L in real time. Everything is saved locally on your device across sessions so you can track multiple shows.',
  },
  {
    question: 'Can I track multiple card shows?',
    answer: 'Yes. Each show gets its own session with separate budgets and transactions. Switch between sessions using the tabs at the top. All data persists in your browser localStorage.',
  },
  {
    question: 'How should I set my card show budget?',
    answer: 'A good rule of thumb: bring only what you are comfortable spending and leave credit cards at home if impulse control is a concern. Common budgets range from $50-100 for casual browsing, $200-500 for targeted buying, and $1,000+ for serious collectors and dealers. The budget bar turns yellow at 70% and red at 90% to warn you.',
  },
];

export default function ShowBudgetPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Budget Tracker',
        description: 'Mobile-first budget tracker for card shows. Set a budget, log buys and sells in real time, track P&L.',
        url: 'https://cardvault-two.vercel.app/tools/show-budget',
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
          Multi-Show &middot; Real-Time P&amp;L &middot; Budget Alerts &middot; Mobile-First &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Show Budget Tracker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track your spending at card shows in real time. Set a budget, log buys and sells from your phone,
          and never overspend again. Perfect for show days.
        </p>
      </div>

      <ShowBudgetTracker />

      {/* FAQ */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <div key={f.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">{f.question}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
