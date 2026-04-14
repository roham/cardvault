import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DailyPack from './DailyPack';

export const metadata: Metadata = {
  title: 'Daily Free Pack — Open a Free Card Pack Every Day',
  description: 'Open one free virtual card pack every day! Track your streak, build your collection history, and see how lucky you get. Sports cards and Pokemon. No account needed.',
  openGraph: {
    title: 'Daily Free Pack — CardVault',
    description: 'One free virtual card pack every day. Sports cards + Pokemon. Track your streak. No signup required.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Daily Free Pack — CardVault',
    description: 'Open a free card pack every day! Track your streak and collect hits.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Daily Free Pack' },
];

const faqItems = [
  {
    question: 'How does the daily free pack work?',
    answer: 'Every day you get one free virtual pack to open. The product rotates daily — you might get a Pokemon booster, a baseball hobby pack, or a football blaster. Open it, see your pulls, and come back tomorrow for another!',
  },
  {
    question: 'How does the streak tracker work?',
    answer: 'Your streak counts consecutive days you open a free pack. Miss a day and your streak resets to zero. See how long you can keep it going! Your stats are saved in your browser.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No account needed! Your daily pack history and streak are saved locally in your browser. Just visit the page and open your pack.',
  },
  {
    question: 'Can I open more than one pack per day?',
    answer: 'The daily free pack is one per day — that is what makes it special! If you want unlimited pack openings, try our full Pack Simulator which lets you open entire boxes from any product.',
  },
];

export default function DailyPackPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Daily Free Pack',
        description: 'Open one free virtual card pack every day. Track your streak and collect hits.',
        url: 'https://cardvault-two.vercel.app/tools/daily-pack',
        applicationCategory: 'Entertainment',
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
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 bg-clip-text text-transparent mb-3">
          Daily Free Pack
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          One free pack every day. Track your streak. See how lucky you get.
        </p>
      </div>

      <DailyPack />

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
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/pack-sim" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Pack Simulator</h3>
            <p className="text-sm text-gray-400 mt-1">Open unlimited virtual boxes from any product.</p>
          </Link>
          <Link href="/tools/sealed-ev" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Sealed Product EV</h3>
            <p className="text-sm text-gray-400 mt-1">Calculate if a box is worth buying.</p>
          </Link>
          <Link href="/streak" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Streak Tracker</h3>
            <p className="text-sm text-gray-400 mt-1">Track your daily visit streak.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
