import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MythBustersClient from './MythBustersClient';

export const metadata: Metadata = {
  title: 'Card Collecting Myth Busters — 15 Common Myths Debunked with Data | CardVault',
  description: 'Are vintage cards always better investments? Do PSA 10s always go up? We analyze 15 common card collecting myths with real data from 5,700+ cards. True, False, or It Depends — get the verdict.',
  openGraph: {
    title: 'Card Collecting Myth Busters — CardVault',
    description: '15 common card collecting myths debunked with data. True, False, or It Depends?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Myth Busters — CardVault',
    description: 'Are rookie cards always good investments? Do PSA 10s always go up? We have the data.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Myth Busters' },
];

const faqItems = [
  {
    question: 'What is Card Collecting Myth Busters?',
    answer: 'Card Collecting Myth Busters is an interactive feature that analyzes 15 common beliefs in the sports card hobby. Each myth is evaluated using real data from our 5,700+ card database and assigned a verdict: True, False, or It Depends. We provide supporting evidence, counter-arguments, and the full context behind each myth.',
  },
  {
    question: 'How are the myth verdicts determined?',
    answer: 'Each myth is analyzed using a combination of market data, historical trends, and industry knowledge. We look at actual card values across different eras, sports, and conditions from our database to support or debunk each claim. Verdicts are True (the myth is generally correct), False (the myth is generally incorrect), or It Depends (the truth varies based on specific circumstances).',
  },
  {
    question: 'Are these myths based on real collector beliefs?',
    answer: 'Yes. These myths represent the most commonly held beliefs and misconceptions in the sports card collecting community, gathered from hobby forums, social media discussions, card show conversations, and collector interviews. Many are repeated so often they are taken as fact without examination.',
  },
  {
    question: 'Can I vote on whether I believe each myth?',
    answer: 'Yes! Each myth has a voting feature where you can indicate whether you believed the myth before reading the analysis. Community vote tallies are shown so you can see how your beliefs compare to other collectors. Votes are stored locally in your browser.',
  },
  {
    question: 'How often are the myths updated?',
    answer: 'We periodically review and update the myth analyses as market conditions change. Some myths that were true in previous eras may become false as the hobby evolves, and vice versa. The data supporting each verdict is refreshed as our card database grows.',
  },
];

export default function MythBustersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Myth Busters',
        description: '15 common card collecting myths analyzed with real market data. Verdicts, evidence, and community voting.',
        url: 'https://cardvault-two.vercel.app/myth-busters',
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Web',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Data-Driven Myth Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collecting Myth Busters</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          15 common card collecting myths analyzed with real data from 5,700+ cards. Vote on what you believe, then see the truth backed by evidence.
        </p>
      </div>

      {/* Client Component */}
      <MythBustersClient />

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Related Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/hobby-debates', label: 'Hobby Debates' },
            { href: '/market-data', label: 'Market Data Room' },
            { href: '/investment-thesis', label: 'Investment Thesis' },
            { href: '/market-report', label: 'Weekly Market Report' },
            { href: '/news', label: 'Hobby News' },
            { href: '/guides/card-collecting-glossary', label: 'Card Glossary' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
