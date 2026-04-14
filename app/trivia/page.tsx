import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TriviaClient from './TriviaClient';

export const metadata: Metadata = {
  title: 'Daily Card Trivia — Test Your Collecting Knowledge',
  description: 'Answer 5 daily card trivia questions covering card history, player records, grading, Pokemon, and market knowledge. Track your streak and compete for a perfect score.',
  openGraph: {
    title: 'Daily Card Trivia — CardVault',
    description: 'Test your card collecting knowledge with 5 daily trivia questions. Track your streak and share your score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Daily Card Trivia — CardVault',
    description: '5 daily trivia questions for card collectors. How well do you know your hobby?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Trivia' },
];

export default function TriviaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Daily Card Trivia',
        description: 'Test your card collecting knowledge with 5 daily trivia questions covering card history, player records, grading, and more.',
        url: 'https://cardvault-two.vercel.app/trivia',
        applicationCategory: 'Entertainment',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-500 bg-clip-text text-transparent mb-3">
          Daily Card Trivia
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Test your collecting knowledge with 5 daily questions. Come back every day to keep your streak alive.
        </p>
      </div>

      <TriviaClient />

      {/* Related Tools */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/card-of-the-day" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Card of the Day</h3>
            <p className="text-sm text-gray-400 mt-1">Discover a new featured card every day with trivia and market insights.</p>
          </Link>
          <Link href="/rip-or-skip" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Rip or Skip</h3>
            <p className="text-sm text-gray-400 mt-1">Vote on whether to rip or skip today&apos;s sealed product.</p>
          </Link>
          <Link href="/guides" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Collecting Guides</h3>
            <p className="text-sm text-gray-400 mt-1">Learn more about cards, grading, and the hobby to boost your score.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
