import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import NostalgiaClient from './NostalgiaClient';

export const metadata: Metadata = {
  title: 'Card Nostalgia Machine — Discover Your Childhood Cards | CardVault',
  description: 'Enter your birth year and discover the sports cards that defined your childhood collecting era (ages 8-14). See top rookies, iconic sets, and what those cards are worth today. Free nostalgia tool for card collectors.',
  openGraph: {
    title: 'Card Nostalgia Machine — What Cards Were Hot When You Were a Kid? | CardVault',
    description: 'Enter your birth year and relive your card collecting golden years. See the rookies, sets, and values from your childhood era.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Nostalgia Machine — CardVault',
    description: 'Discover what cards were hot when you were a kid. Enter your birth year and find out.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Nostalgia Machine' },
];

const faqItems = [
  {
    question: 'What is the Card Nostalgia Machine?',
    answer: 'The Card Nostalgia Machine lets you enter your birth year and discover the sports cards from your childhood collecting era (ages 8-14). It shows you the most valuable cards, top rookies, iconic sets, and key hobby moments from the years when you were most likely collecting cards. It also calculates what a top-10 collection from your era would be worth today.',
  },
  {
    question: 'Why ages 8-14 for the "golden years" of collecting?',
    answer: 'Research shows that ages 8-14 are when most people start and are most active in card collecting. This is when allowance money goes to packs, when you trade cards at school, and when your favorite players feel larger than life. The emotional connection to cards from this era drives much of the nostalgia collecting market today.',
  },
  {
    question: 'What are the different card collecting eras?',
    answer: 'Card collecting spans several distinct eras: Pre-War (before 1946) with tobacco and Goudey cards, Post-War Vintage (1946-1957) with Bowman and early Topps, Classic Vintage (1957-1981) during the Topps monopoly, Early Modern (1981-1987) when Fleer and Donruss entered, Junk Wax (1987-1994) with massive overproduction, Insert Era (1994-2005) with refractors and serial numbers, Modern (2005-2020) with Prizm and autographs, and Ultra-Modern (2020+) with the COVID collecting boom.',
  },
  {
    question: 'Are cards from the Junk Wax era worthless?',
    answer: 'Not entirely. While most common cards from 1987-1993 have minimal value due to massive print runs, key rookies from this era are still valuable. Ken Griffey Jr. 1989 Upper Deck, Derek Jeter 1993 SP, Michael Jordan 1986 Fleer, and Wayne Gretzky 1979 O-Pee-Chee are examples of junk wax era rookies worth hundreds to thousands of dollars, especially in gem mint condition.',
  },
  {
    question: 'How are the card values calculated?',
    answer: 'Values shown are estimated market prices based on recent sales data for both raw (ungraded) and gem mint (PSA 10 or BGS 9.5) conditions. The "What If" portfolio calculates the combined value of the 10 most valuable cards from your era in our database. Actual values may vary based on specific card condition, market timing, and recent sales.',
  },
];

export default function NostalgiaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Nostalgia Machine — Discover Your Childhood Cards',
        description: 'Enter your birth year and discover the sports cards that defined your childhood collecting era.',
        url: 'https://cardvault-two.vercel.app/tools/nostalgia',
        applicationCategory: 'EntertainmentApplication',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          7,300+ Cards &middot; All Eras &middot; Shareable Results
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Nostalgia Machine</h1>
        <p className="text-gray-400 text-lg">
          Enter your birth year and travel back to your card collecting golden years.
          Discover the rookies, sets, and iconic cards from when you were a kid &mdash;
          and find out what they&apos;re worth today.
        </p>
      </div>

      <NostalgiaClient />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900/80 border border-gray-800 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-200 hover:text-white flex items-center justify-between">
                {f.question}
                <span className="text-gray-600 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500 space-y-1">
        <p>
          Explore more: <Link href="/tools" className="text-amber-400 hover:underline">All Tools</Link> &middot;{' '}
          <Link href="/sports/years" className="text-amber-400 hover:underline">Browse by Year</Link> &middot;{' '}
          <Link href="/tools/era-guide" className="text-amber-400 hover:underline">Era Guide</Link> &middot;{' '}
          <Link href="/tools/investment-calc" className="text-amber-400 hover:underline">Investment Calculator</Link> &middot;{' '}
          <Link href="/guides" className="text-amber-400 hover:underline">Collecting Guides</Link>
        </p>
      </div>
    </div>
  );
}
