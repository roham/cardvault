import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardShowToolkit from './CardShowToolkit';

export const metadata: Metadata = {
  title: 'Card Show Companion — Mobile Toolkit for Card Shows',
  description: 'Free mobile toolkit for card shows. Quick price lookups, flip calculator, centering check, grading ROI, and haul tracker. Everything you need at a card show in one place.',
  openGraph: {
    title: 'Card Show Companion — CardVault',
    description: 'Your mobile toolkit for card shows. Quick price checks, flip calculator, haul tracker, and show tips.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Companion — CardVault',
    description: 'Quick tools and haul tracker for card shows. Free, mobile-first.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Show Companion' },
];

const faqItems = [
  {
    question: 'What is the Card Show Companion?',
    answer: 'The Card Show Companion is a free, mobile-first toolkit designed for collectors and dealers at card shows. It provides quick access to price lookups, flip calculators, centering checks, and a haul tracker — everything you need at a show in one place.',
  },
  {
    question: 'How does the haul tracker work?',
    answer: 'The haul tracker lets you log every purchase at a card show: card description, price paid, estimated value, and sport. It calculates your running total spent, estimated total value, and net profit/loss. All data is stored locally on your device.',
  },
  {
    question: 'Can I use this offline at a card show?',
    answer: 'The toolkit page loads and works on mobile browsers. The haul tracker uses localStorage so your data persists between visits. For price lookups, you will need an internet connection, but many card shows have WiFi or you can use mobile data.',
  },
  {
    question: 'Is there a cost to use this?',
    answer: 'No — the Card Show Companion and all CardVault tools are completely free. No account required, no sign-up, no premium tier.',
  },
];

export default function CardShowPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Companion',
        description: 'Free mobile toolkit for card shows with quick price lookups, flip calculator, and haul tracker.',
        url: 'https://cardvault-two.vercel.app/card-show',
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
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent mb-3">
          Card Show Companion
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Your mobile toolkit for card shows. Quick tools, haul tracker, and show tips — all in one place.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Bookmark this page. Pull it up at the show. Free, no account needed.
        </p>
      </div>

      <CardShowToolkit />

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

      {/* Related Tools */}
      <section className="mt-12 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold text-white mb-4">More Tools</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/tools/mystery-pack', label: 'Mystery Box Sim', icon: '🎲' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '🎰' },
            { href: '/tools/insurance-calc', label: 'Insurance Calc', icon: '🛡️' },
            { href: '/tools/grading-tracker', label: 'Grading Tracker', icon: '📋' },
            { href: '/tools/head-to-head', label: 'Head-to-Head', icon: '⚔️' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
