import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BucketListClient from './BucketListClient';

export const metadata: Metadata = {
  title: 'Card Collecting Bucket List — 50 Cards Every Collector Should Own | CardVault',
  description: '50 iconic sports cards every collector should own. Interactive checklist with progress tracking across Vintage Legends, Modern Icons, New Era Stars, Error Cards, and Record-Breakers. Track your bucket list, share progress, and discover must-have cards from baseball, basketball, football, and hockey.',
  openGraph: {
    title: 'Card Collecting Bucket List — 50 Must-Own Cards | CardVault',
    description: '50 iconic sports cards every collector should own. Interactive checklist with progress tracking.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Bucket List — 50 Must-Own Cards | CardVault',
    description: 'Track your progress on the 50 cards every collector should own.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Bucket List' },
];

const faqItems = [
  {
    question: 'What is the Card Collecting Bucket List?',
    answer: 'The Card Collecting Bucket List is a curated collection of 50 iconic sports cards that every serious collector should aspire to own. It spans five categories — Vintage Legends (pre-1980), Modern Icons (1980-2010), New Era Stars (2010+), Error & Oddball Cards, and Record-Breakers & Firsts — covering baseball, basketball, football, and hockey. Use the interactive checklist to track which ones you already own.',
  },
  {
    question: 'How were these 50 cards selected?',
    answer: 'Cards were selected based on historical significance, cultural impact, market value, and collector demand. Each card represents a pivotal moment in sports history or the card collecting hobby — from the 1952 Topps Mickey Mantle (#1 most valuable post-war card) to modern icons like the 2018 Prizm Luka Doncic. We balanced across all four major sports and included error cards and oddball entries that make the hobby unique.',
  },
  {
    question: 'What do the difficulty ratings mean?',
    answer: 'Difficulty ratings range from 1 to 5 stars. 1 star means the card is readily available for under $100 raw. 2 stars means $100-$500 and commonly found. 3 stars means $500-$5,000 and requires patience. 4 stars means $5,000-$50,000 and a serious investment. 5 stars means the card is extremely rare and expensive ($50,000+), and may take years of searching and significant capital to acquire.',
  },
  {
    question: 'Is my bucket list progress saved?',
    answer: 'Yes, your checklist progress is automatically saved to your browser\'s local storage. When you return to the page, your checked cards will still be marked. You can also share your progress to X (Twitter) or copy it to your clipboard using the Share buttons at the top of the page.',
  },
  {
    question: 'Can I complete the bucket list on a budget?',
    answer: 'Absolutely. Many cards on the list are available in lower grades (PSA 5-7) or raw condition for significantly less than gem mint prices. Start with the 1-2 star difficulty cards — many are available for under $50 raw. Focus on cards in the condition you can afford rather than waiting for perfect examples. The joy is in the hunt, not just the grade.',
  },
];

export default function BucketListPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Bucket List',
        description: '50 iconic sports cards every collector should own. Interactive checklist with progress tracking.',
        applicationCategory: 'ReferenceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/bucket-list',
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

      <BucketListClient />

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

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Related Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/record-book', label: 'Price Record Book', desc: 'Most expensive cards ever sold' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it for your card?' },
            { href: '/investing-playbook', label: 'Investing Playbook', desc: '6 strategies for card investing' },
            { href: '/investment-thesis', label: 'Investment Thesis', desc: 'Bull/bear case for any card' },
            { href: '/tools/nostalgia', label: 'Nostalgia Machine', desc: 'Your childhood cards by birth year' },
            { href: '/market-data', label: 'Market Data Room', desc: 'Comprehensive market statistics' },
            { href: '/cheat-sheets', label: 'Cheat Sheets', desc: '8 quick-reference collecting guides' },
            { href: '/collection-goals', label: 'Collection Goals', desc: 'Set and track collecting goals' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
