import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MistakesClient from './MistakesClient';

export const metadata: Metadata = {
  title: '20 Card Collecting Mistakes That Cost Collectors Thousands | CardVault',
  description: 'The 20 most expensive card collecting mistakes ranked by financial impact. Interactive self-assessment — check which mistakes you\'ve made and get a personalized collector health score. Learn from others\' losses.',
  openGraph: {
    title: '20 Card Collecting Mistakes — CardVault',
    description: 'Interactive guide to the most costly card collecting mistakes. Self-assess and get your collector health score.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '20 Collecting Mistakes — CardVault',
    description: 'Which card collecting mistakes have you made? Self-assess and learn.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Collecting Mistakes' },
];

const faqItems = [
  {
    question: 'What are the most common card collecting mistakes?',
    answer: 'The most costly mistakes include buying at peak hype (draft night/championship), neglecting card storage (UV damage, humidity), overpaying for grading, chasing short prints without research, and selling during market panics. Our guide ranks 20 mistakes by estimated financial impact.',
  },
  {
    question: 'How does the collector health score work?',
    answer: 'Check each mistake you\'ve made (be honest!). Your score starts at 100 and decreases based on the financial impact of each checked mistake. A score of 90+ means you\'re an elite collector. 70-89 is solid. Below 70 means there\'s room to improve your collecting strategy.',
  },
  {
    question: 'Can I fix these mistakes after making them?',
    answer: 'Most mistakes are recoverable! Each entry includes a "Fix It" strategy explaining how to mitigate the damage. For example, if you bought at peak hype, the fix is to hold rather than panic sell — most quality cards recover within 6-18 months after the initial hype fades.',
  },
  {
    question: 'Which mistake costs collectors the most money?',
    answer: 'Buying raw cards at graded prices (paying PSA 10 premiums for ungraded cards) is typically the most expensive single mistake, often resulting in 50-70% overpayment. Improper storage causing damage over time is the most expensive cumulative mistake.',
  },
  {
    question: 'Are these mistakes relevant for all sports?',
    answer: 'Yes, though some are sport-specific. Football cards have the most draft-night volatility. Baseball cards are most affected by seasonal timing. Basketball cards have the highest grading premiums. Hockey cards have the thinnest markets where liquidity mistakes hurt most.',
  },
];

export default function CollectingMistakesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Mistakes Guide',
        description: '20 most expensive card collecting mistakes with interactive self-assessment and collector health score.',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/collecting-mistakes',
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

      <MistakesClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
