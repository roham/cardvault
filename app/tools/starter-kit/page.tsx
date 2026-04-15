import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import StarterKitClient from './StarterKitClient';

export const metadata: Metadata = {
  title: 'Card Collecting Starter Kit Builder — Personalized for Your Budget & Style | CardVault',
  description: 'Build your perfect sports card starter kit. Pick your sport, budget ($25-$5,000), and collector style. Get a curated list of specific cards to buy with eBay links, values, and expert reasoning. Free tool for beginners and returning collectors.',
  openGraph: {
    title: 'Card Collecting Starter Kit Builder — CardVault',
    description: 'Pick your sport, budget, and style. Get a personalized starter collection with specific cards to buy.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Starter Kit Builder — CardVault',
    description: 'Build your perfect card collection starter kit. Personalized picks for any budget.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Starter Kit Builder' },
];

const faqItems = [
  {
    question: 'How does the Starter Kit Builder work?',
    answer: 'Select your preferred sport (or all sports), set your total budget from $25 to $5,000, and choose your collector style (balanced, flipper, investor, completionist, or casual fan). The tool analyzes over 6,200 cards in our database and recommends a curated kit of specific cards optimized for your preferences. Each card includes a buy link, estimated value, and explanation of why it was selected.',
  },
  {
    question: 'Are the card prices accurate?',
    answer: 'Prices are estimated market values based on recent sold data from eBay, auction houses, and dealer listings. Actual prices may vary depending on condition, seller, and market timing. Always check current eBay "Sold" listings before purchasing to verify the current market price.',
  },
  {
    question: 'What collector style should I pick?',
    answer: 'Balanced is great for beginners who want a mix of everything. Flipper prioritizes cards with high grading ROI and short-term profit potential. Investor focuses on blue-chip, established cards that hold value long-term. Completionist targets affordable foundation pieces from key sets. Casual Fan picks iconic cards of the greatest players regardless of investment potential.',
  },
  {
    question: 'Can I buy all these cards at once?',
    answer: 'Yes — each card in your kit includes a direct eBay search link. You can buy them individually from different sellers. We recommend starting with your highest-value pick first, as prices fluctuate. Budget about 10-20% extra for shipping costs, which are not included in the card values shown.',
  },
  {
    question: 'How is this different from the Card Scout tool?',
    answer: 'Card Scout recommends individual cards based on filters. The Starter Kit Builder creates a complete, budget-optimized PACKAGE — a curated collection where every card is selected to work together as a cohesive starter set. It ensures player diversity, sport balance, and stays within your exact budget.',
  },
];

export default function StarterKitPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collecting Starter Kit Builder',
        description: 'Build a personalized sports card starter kit. Pick your sport, budget, and collector style to get curated card recommendations with buy links.',
        url: 'https://cardvault-two.vercel.app/tools/starter-kit',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          Free Tool &middot; 6,200+ Cards &middot; Personalized
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collecting Starter Kit</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          New to collecting? Returning after years away? Pick your sport, budget, and style — get a
          personalized starter kit with specific cards to buy, complete with prices and eBay links.
        </p>
      </div>

      <StarterKitClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">More Beginner Resources</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/quiz', label: 'Collector Quiz', desc: 'Find your collector style' },
            { href: '/guides/getting-started', label: 'Beginner Guide', desc: 'Card collecting 101' },
            { href: '/tools/card-scout', label: 'Card Scout', desc: 'Personalized picks' },
            { href: '/guides/best-cards-under-25', label: 'Best Under $25', desc: 'Budget-friendly picks' },
            { href: '/guides/card-storage', label: 'Storage Guide', desc: 'Protect your cards' },
            { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Should you grade?' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="p-3 bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700 rounded-lg transition-colors group">
              <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{l.label}</div>
              <div className="text-gray-500 text-xs">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
