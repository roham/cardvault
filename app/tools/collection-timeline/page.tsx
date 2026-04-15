import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionTimeline from './CollectionTimeline';

export const metadata: Metadata = {
  title: 'Card Collection Timeline — Visualize Your Collection Across Eras',
  description: 'Free card collection timeline tool. Add your cards and see them visualized across decades — from pre-war vintage to modern releases. Identify era gaps, see your collection distribution, and discover your favorite collecting era.',
  openGraph: {
    title: 'Card Collection Timeline — CardVault',
    description: 'Visualize your card collection across eras. Find gaps, see distribution, discover your style. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collection Timeline — CardVault',
    description: 'See your card collection spread across 100+ years of sports history. Free timeline tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Collection Timeline' },
];

const faqItems = [
  {
    question: 'How does the collection timeline work?',
    answer: 'Add cards from our database of 5,500+ sports cards. Each card is placed on a visual timeline by its release year. The timeline shows era groupings (Pre-War, Golden Age, Post-War, Vintage, Junk Wax, Modern, Ultra-Modern) with your cards plotted across decades. You can see your collection density by era and identify gaps in your coverage.',
  },
  {
    question: 'What are the collecting eras?',
    answer: 'We use standard hobby era definitions: Pre-War (before 1942), Golden Age (1948-1959), Post-War (1960-1972), Vintage (1973-1980), Junk Wax (1981-1994), Modern (1995-2015), and Ultra-Modern (2016-present). Each era has distinct characteristics — for example, Pre-War cards are extremely scarce while Junk Wax era cards were massively overproduced.',
  },
  {
    question: 'Can I see which eras I am missing cards from?',
    answer: 'Yes! The era coverage section shows a percentage for each era based on how many of your cards fall into that time period vs the total available in our database. Green bars indicate strong coverage, yellow is moderate, and eras with zero cards show as empty gaps to fill.',
  },
  {
    question: 'Does the timeline affect my other CardVault data?',
    answer: 'No. The timeline is a standalone visualization tool. Cards you add here are stored in your browser\'s local storage and do not affect your vault, binder, or any other CardVault feature.',
  },
  {
    question: 'What is a well-balanced collection?',
    answer: 'A well-balanced collection spans multiple eras, sports, and value tiers. The timeline helps you see if you are too heavily concentrated in one era (like Ultra-Modern) and might benefit from adding vintage pieces. Diversifying across eras can also reduce risk since different eras respond differently to market conditions.',
  },
];

export default function CollectionTimelinePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Collection Timeline',
        description: 'Visualize your card collection across eras. Plot cards on a timeline from pre-war to modern, see era coverage, identify gaps. Free.',
        url: 'https://cardvault-two.vercel.app/tools/collection-timeline',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          5,500+ Cards &middot; 7 Eras &middot; Visual Timeline &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Collection Timeline
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See your collection plotted across 100+ years of sports card history. Find era gaps, discover your collecting style, and visualize your journey from vintage to modern.
        </p>
      </div>

      <CollectionTimeline />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-violet-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/diversification', label: 'Portfolio Diversification', desc: 'Score your collection diversity across 4 dimensions' },
            { href: '/tools/heat-score', label: 'Collection Heat Score', desc: 'How hot is your collection right now?' },
            { href: '/tools/collection-value', label: 'Collection Value Calculator', desc: 'Total up your collection worth' },
            { href: '/sports/year', label: 'Browse by Year', desc: 'Explore all cards by release year' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className="block p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
              <div className="text-white text-sm font-medium">{tool.label}</div>
              <div className="text-gray-500 text-xs mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
