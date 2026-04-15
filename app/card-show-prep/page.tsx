import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardShowPrepKit from './CardShowPrepKit';

export const metadata: Metadata = {
  title: 'Card Show Prep Kit — Budget Planner, Want List & Trade Binder for Card Shows',
  description: 'Prepare for your next card show. Plan your budget, build a want list with target prices, organize your trade binder, pack your checklist, and log purchases with P&L tracking. Free, mobile-first tool for collectors and dealers.',
  openGraph: {
    title: 'Card Show Prep Kit — CardVault',
    description: 'Plan your budget, build a want list, organize your trade binder, and track purchases at card shows.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Prep Kit — CardVault',
    description: 'Budget planner, want list, trade binder, and post-show P&L tracker for card shows.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Show Prep Kit' },
];

const faqItems = [
  {
    question: 'What is the Card Show Prep Kit?',
    answer: 'The Card Show Prep Kit is a free, mobile-first planning tool for card show preparation. It includes five tabs: Budget Planner (set your total budget and allocate across categories like singles, sealed, and grading), Want List (add cards you are looking for with target and maximum prices), Trade Binder (list cards you are bringing to trade), Checklist (15 essential items to pack), and Post-Show (log purchases, calculate P&L, and share results).',
  },
  {
    question: 'How should I set my card show budget?',
    answer: 'A good rule of thumb is to allocate 60% for singles, 20% for sealed product, 10% for grading submissions, 5% for supplies (sleeves, top loaders), and 5% for food and parking. Always reserve 10% as a discovery fund for unexpected finds. Bring cash in small bills ($1s, $5s, $10s, $20s) because dealers typically offer better prices for cash transactions.',
  },
  {
    question: 'What should I bring to a card show?',
    answer: 'Essential supplies include: cash in small bills, penny sleeves and top loaders for protection, team bags for bulk purchases, a phone charger or power bank, your want list (printed or digital), a backpack or messenger bag, comfortable shoes, water, snacks, and optionally a loupe or magnifying glass for inspecting card condition. Our checklist tab covers all 15 essential items.',
  },
  {
    question: 'How does the want list prioritization work?',
    answer: 'Each card on your want list gets a priority level: Must Have (red, your top targets), Nice to Have (yellow, grab if the price is right), or If Cheap (blue, only if significantly under market). Cards are sorted by priority, and you can check them off as you find them at the show. Set target prices (what you want to pay) and max prices (your absolute ceiling) to stay disciplined.',
  },
  {
    question: 'Is my data saved between visits?',
    answer: 'Yes, all your data (budget, want list, trade binder, checklist, and purchases) is saved locally in your browser using localStorage. Your data stays on your device and is never sent to any server. Bookmark this page and your prep kit will be ready whenever you return. Clear your browser data to start fresh.',
  },
];

export default function CardShowPrepPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Prep Kit',
        description: 'Plan your card show budget, build a want list, organize your trade binder, and track show-day purchases with P&L analysis.',
        url: 'https://cardvault-two.vercel.app/card-show-prep',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Budget &middot; Want List &middot; Trade Binder &middot; Checklist &middot; P&amp;L
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Show Prep Kit</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Plan your budget, build your want list, organize your trade binder, and track everything you buy.
          The complete show-day planner for collectors and dealers.
        </p>
      </div>

      <CardShowPrepKit />

      {/* FAQ Section */}
      <section className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-gray-800 rounded-lg">
              <summary className="px-5 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors">
                {item.question}
              </summary>
              <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
