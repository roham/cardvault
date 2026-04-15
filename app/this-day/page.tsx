import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ThisDayClient from './ThisDayClient';

export const metadata: Metadata = {
  title: 'This Day in Cards — Daily Sports Card History & Featured Cards | CardVault',
  description: 'Discover what happened on this day in sports card history. Historic moments, player spotlights, related cards, and daily featured cards. New content every day. A daily destination for card collectors.',
  openGraph: {
    title: 'This Day in Cards — Daily Card History | CardVault',
    description: 'Daily sports card history, featured players, and card spotlights. New content every day.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'This Day in Cards — Daily Card History',
    description: 'What happened today in the world of sports cards? Historic moments, player spotlights, and daily featured cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'This Day in Cards' },
];

const faqItems = [
  {
    question: 'What is This Day in Cards?',
    answer: 'This Day in Cards is a daily-updating page that shows historic sports moments, player spotlights, and featured cards for the current date. Content changes every day, giving you a reason to visit CardVault daily. Each entry includes related cards from our database so you can explore and collect.',
  },
  {
    question: 'How often does the content change?',
    answer: 'The page generates completely new content every day at midnight. Historic moments are tied to the calendar date. Featured players and spotlight cards are deterministically rotated daily so you see different content each visit while the same content appears if you revisit on the same day.',
  },
  {
    question: 'Are the historic moments accurate?',
    answer: 'The historic moments reference real events in sports history — from Jackie Robinson breaking the color barrier to Hank Aaron hitting #715 to Wayne Gretzky breaking records. Some dates feature market insights tied to the sports calendar (draft season, playoffs, release dates) rather than specific historic events.',
  },
  {
    question: 'How are the featured cards selected?',
    answer: 'Featured cards are selected using a deterministic daily rotation from our database of 4,000+ sports cards. Related cards are matched to the historic moment of the day — if the moment involves a specific player, you will see their cards. Featured players and spotlight cards rotate to show different parts of the collection each day.',
  },
  {
    question: 'Can I see past days?',
    answer: 'Currently the page shows today only. Each day brings fresh content, so bookmark the page and check back daily. Historic moments, related cards, featured players, and spotlight cards are all different every day of the year.',
  },
];

export default function ThisDayPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'This Day in Cards — Daily Sports Card History',
        description: 'Daily sports card history, featured players, and card spotlights.',
        url: 'https://cardvault-two.vercel.app/this-day',
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

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          This Day in Cards
        </h1>
        <p className="text-gray-400 text-base max-w-2xl">
          What happened today in the world of sports cards? Historic moments, player spotlights, and daily featured cards — new content every day.
        </p>
      </div>

      <ThisDayClient />

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/30 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium text-sm flex items-center justify-between">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Cross Links */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/card-of-the-day" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Card of the Day</h3>
          <p className="text-gray-500 text-xs">Daily featured card with history and trivia</p>
        </Link>
        <Link href="/news" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Hobby News</h3>
          <p className="text-gray-500 text-xs">Latest card market news and updates</p>
        </Link>
        <Link href="/market-analysis" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Daily Market Analysis</h3>
          <p className="text-gray-500 text-xs">AI-powered daily market intelligence</p>
        </Link>
      </section>
    </div>
  );
}
