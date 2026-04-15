import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ComboAnalyzerClient from './ComboAnalyzerClient';

export const metadata: Metadata = {
  title: 'Card Combo Analyzer — Build the Perfect Trade Package | CardVault',
  description: 'Free card combo analyzer. Build multi-card trade packages and get instant analysis: total value, diversification score, grading upside, trade rating, and improvement suggestions. Search 6,700+ sports cards.',
  openGraph: {
    title: 'Card Combo Analyzer — CardVault',
    description: 'Build multi-card trade packages. Total value, diversification, grading upside, trade rating.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Combo Analyzer — CardVault',
    description: 'Build and analyze card trade packages.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Combo Analyzer' },
];

const faqItems = [
  {
    question: 'What is the Card Combo Analyzer?',
    answer: 'The Card Combo Analyzer lets you build a multi-card package (2-10 cards) and get instant analysis including total raw and gem-mint value, diversification score, grading upside potential, trade package rating, and personalized improvement suggestions. It helps you build the most appealing trade packages.',
  },
  {
    question: 'How is the trade package rating calculated?',
    answer: 'The trade rating considers total value and card count. Premium Package requires $1,000+ across 3+ cards. Strong Package needs $500+ total value. Decent Package needs $100+. Quality Cards means fewer but higher-value cards (avg $50+). Budget Package is anything below these thresholds.',
  },
  {
    question: 'What does the diversification score measure?',
    answer: 'The diversification score (0-100) measures four factors equally: sport variety (are you spread across baseball, basketball, football, hockey?), player uniqueness (different players vs duplicates), era coverage (vintage through ultra-modern), and rookie/veteran mix. Higher scores mean more appealing packages for trade partners.',
  },
  {
    question: 'What is grading upside?',
    answer: 'Grading upside shows the difference between raw card values and gem-mint (PSA 10) values in your package. A high multiplier means your cards gain significantly more value when graded. The total upside shows the dollar amount you could gain by grading all cards to gem-mint condition.',
  },
  {
    question: 'Can I save my combo?',
    answer: 'Yes, your combo is automatically saved in your browser (localStorage). When you return to the page, your cards will still be there. You can also copy a text summary to share your combo with trade partners.',
  },
];

export default function ComboAnalyzerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Combo Analyzer',
        description: 'Build multi-card trade packages with instant value analysis, diversification scoring, and improvement suggestions.',
        url: 'https://cardvault-two.vercel.app/tools/combo-analyzer',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Trade Tool &middot; Multi-Card Analysis &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Combo Analyzer</h1>
        <p className="text-gray-400 text-lg">
          Build a multi-card trade package and get instant analysis — total value, diversification, grading upside, and suggestions to improve your offer.
        </p>
      </div>

      <ComboAnalyzerClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((faq, i) => (
          <details key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden group">
            <summary className="px-6 py-4 cursor-pointer text-gray-200 font-medium hover:text-white transition-colors list-none flex items-center justify-between">
              {faq.question}
              <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </summary>
            <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
