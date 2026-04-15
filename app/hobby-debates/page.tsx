import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyDebatesClient from './HobbyDebatesClient';

export const metadata: Metadata = {
  title: 'Hobby Debates — Card Collecting Hot Takes & Arguments | CardVault',
  description: 'The biggest debates in card collecting: PSA vs BGS, modern vs vintage, football vs basketball, hobby box vs singles, and more. Read both sides, cast your vote, see the verdict. 12 expert-analyzed debates.',
  openGraph: {
    title: 'Hobby Debates — CardVault',
    description: 'The biggest debates in card collecting. PSA vs BGS? Modern vs vintage? Cast your vote.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hobby Debates — CardVault',
    description: '12 card collecting debates with expert verdicts. Pick a side!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Hobby Debates' },
];

const faqItems = [
  {
    question: 'What are Hobby Debates?',
    answer: 'Hobby Debates covers the biggest arguments in card collecting. Each debate presents two sides with detailed arguments, lets you cast your vote, and provides an expert verdict based on market data and hobby consensus.',
  },
  {
    question: 'How are the verdicts determined?',
    answer: 'Verdicts are based on established card market principles, historical data, and hobby consensus. Many debates result in "it depends" — because the right answer often varies based on your budget, timeline, and collecting goals.',
  },
  {
    question: 'Can I change my vote?',
    answer: 'Yes! You can change your vote at any time by clicking the other side. Your votes are saved locally on your device and persist between visits.',
  },
  {
    question: 'What is the Featured Debate?',
    answer: 'One debate is highlighted as "Featured This Week" on a rotating basis. It changes automatically every Monday. All debates are always available — the feature designation just draws attention to a particular topic.',
  },
  {
    question: 'Are these debates based on opinion or data?',
    answer: 'Both! Each debate presents factual arguments (market data, historical returns, industry statistics) alongside subjective collector preferences. The verdict aims to synthesize the data into actionable guidance while acknowledging that collecting is personal.',
  },
];

export default function HobbyDebatesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Hobby Debates — Card Collecting Hot Takes & Arguments',
        description: 'The biggest debates in card collecting with expert analysis, both sides argued, and community voting.',
        url: 'https://cardvault-two.vercel.app/hobby-debates',
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
          12 Debates &middot; Pick a Side &middot; Expert Verdicts &middot; Weekly Featured
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Hobby Debates</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The biggest arguments in card collecting. Read both sides. Cast your vote. See the verdict. Where do you stand?
        </p>
      </div>

      <HobbyDebatesClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/50 rounded-lg">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-amber-400 transition-colors">
                {faq.question}
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
