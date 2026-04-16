import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardAgeClient from './CardAgeClient';

export const metadata: Metadata = {
  title: 'Card Age Calculator — How Old Is Your Sports Card? | CardVault',
  description: 'Enter any card year (1900-2025) and instantly see its age, collecting era, historical context, notable cards, and value trend outlook. Free sports card age and era calculator for baseball, basketball, football, and hockey cards.',
  openGraph: {
    title: 'Card Age Calculator — How Old Is Your Sports Card? | CardVault',
    description: 'Discover your card\'s era, age, historical context, and value trends. Covers Pre-War through Ultra-Modern.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Age Calculator — CardVault',
    description: 'Free card age calculator. Enter any year from 1900 to 2025 and get era, context, notable cards, and value outlook.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Age Calculator' },
];

const faqItems = [
  {
    question: 'What eras does the Card Age Calculator cover?',
    answer: 'The calculator covers five collecting eras: Pre-War (1900-1941) when tobacco and candy companies issued cards, Vintage (1942-1979) spanning the Golden Age of Topps and Bowman, Junk Wax (1980-1994) when overproduction crashed values, Modern (1995-2009) when Chrome refractors and autographs emerged, and Ultra-Modern (2010-present) with Prizm, social media hype, and massive parallel counts.',
  },
  {
    question: 'How does card age affect value?',
    answer: 'Generally, older cards from the Pre-War and Vintage eras appreciate most consistently because surviving examples decrease every year. Junk Wax era cards (1980-1994) are mostly flat or declining due to massive overproduction. Modern era key rookies in high grades have proven appreciation. Ultra-Modern cards are the most volatile, heavily tied to current player performance and market hype cycles.',
  },
  {
    question: 'What makes Pre-War cards so valuable?',
    answer: 'Pre-War cards (1900-1941) are valuable because of extreme scarcity. These were issued by tobacco, candy, and gum companies in small quantities, and most were discarded by children. The few surviving examples, especially in higher grades, command enormous premiums. Iconic sets like T206 (1909-1911), Goudey (1933-1934), and Play Ball (1939-1941) are cornerstones of the hobby.',
  },
  {
    question: 'Why are Junk Wax era cards worth so little?',
    answer: 'During the Junk Wax era (1980-1994), manufacturers like Topps, Fleer, Donruss, Score, and Upper Deck printed millions of copies of every card. A 1989 Ken Griffey Jr. Upper Deck rookie might have 2+ million copies in existence. Supply vastly outstripped demand, and millions of cards were hoarded by speculators. Exceptions include key rookies in PSA 10 and genuine error cards.',
  },
  {
    question: 'How accurate is the card age calculation?',
    answer: 'The age calculation uses the card year and today\'s date (April 2026). Since most card sets are released throughout their stated year, the age in years is precise but the months are approximate. For example, a 2020 Topps Series 1 released in February 2020 would be slightly older than a 2020 Topps Update released in October 2020, but both show the same year-based age.',
  },
];

export default function CardAgePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Age Calculator — How Old Is Your Sports Card?',
        description: 'Enter any card year from 1900 to 2025 and instantly see its age, collecting era, historical context, notable cards from that year, and value trend outlook.',
        url: 'https://cardvault-two.vercel.app/tools/card-age',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Era Lookup &middot; Age Calculator &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Age Calculator
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Enter a card year and instantly see how old it is, what era it belongs to, key historical context, notable cards, and value trend outlook.
        </p>
      </div>

      <CardAgeClient />

      {/* Related Tools */}
      <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/era-guide', label: 'Era Guide', desc: 'Deep dive into all collecting eras' },
            { href: '/tools/price-history', label: 'Price History', desc: 'Track card value over time' },
            { href: '/tools/collection-timeline', label: 'Collection Timeline', desc: 'Visualize your collection by year' },
            { href: '/tools/investment-calc', label: 'Investment Calc', desc: 'Annualized return calculator' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor', desc: 'Where is the market heading?' },
            { href: '/tools/heat-score', label: 'Heat Score', desc: 'How hot is a card right now?' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="block bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 hover:border-teal-600/50 transition-colors">
              <div className="text-white text-sm font-medium">{t.label}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f) => (
          <details key={f.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-lg">
            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-white group-open:border-b group-open:border-zinc-800">
              {f.question}
            </summary>
            <div className="px-5 py-4 text-sm text-zinc-400">{f.answer}</div>
          </details>
        ))}
      </div>

      <p className="text-center text-zinc-600 text-xs mt-10">
        Card Age Calculator is for educational purposes. Historical context and value trends are general estimates. Not financial advice.
      </p>
    </div>
  );
}
