import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionNarrativeClient from './CollectionNarrativeClient';

export const metadata: Metadata = {
  title: 'Collection Narrative Generator — Your Collection as a Story | CardVault',
  description: 'Add 5–20 of your sports cards and get a shareable collection narrative: your collector archetype, signature card, vibe tag, and a 3-paragraph identity writeup. Turn your binder into a story.',
  openGraph: {
    title: 'Collection Narrative Generator | CardVault',
    description: 'Turn your card collection into a shareable identity story. 8 collector archetypes, signature card, custom vibe tag.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Narrative Generator | CardVault',
    description: 'Every collection tells a story. Find yours — archetype, signature card, and a 3-paragraph identity writeup.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Collection Narrative' },
];

const faqItems = [
  {
    question: 'What is a collection narrative?',
    answer: 'A collection narrative is a data-driven story about your collector identity. Add 5 to 20 of the cards you own (from our 9,800+ card database or custom entries) and the tool analyzes your era mix, sport spread, rookie concentration, and value tier to tell you who you are as a collector. Output includes a collector archetype, signature card, custom vibe tag, and a shareable 3-paragraph identity writeup.',
  },
  {
    question: 'What are the eight collector archetypes?',
    answer: 'Vintage Connoisseur (50%+ pre-1980 cards, patient era specialist), Modern Monster (70%+ cards 2015+, plugged into current releases), Rookie Hunter (60%+ rookie cards, chasing first-year magic), Team Loyalist (40%+ cards from one franchise or player, fandom-driven), Diversified Trader (spans 3–4 sports, low concentration, built like a portfolio), Set Completionist (4+ cards from a single set, obsessed with completeness), Budget Specialist (avg card under $50, master of value), and Premium Chaser (avg card over $500, goes straight for grails).',
  },
  {
    question: 'What is the signature card?',
    answer: 'The signature card is the single card from your input that most embodies your detected archetype — the card a friend would pick up and go "this is so you." For a Vintage Connoisseur it is the oldest. For a Rookie Hunter it is the highest-value rookie. For a Premium Chaser it is the most expensive card. It is the thumbnail of your collection identity.',
  },
  {
    question: 'Is my collection saved or shared publicly?',
    answer: 'Nothing is sent to a server. Your card list and generated narrative live in your browser only. You can copy the narrative to your clipboard to paste into Twitter/X, Reddit, Discord, or a group chat. You can also save snapshots locally to compare how your collection narrative evolves as you add cards over time.',
  },
  {
    question: 'Can I add cards I own that are not in your database?',
    answer: 'Yes. Use the "Add custom card" option to enter any card manually with name, year, sport, rookie flag, and approximate value. Custom cards factor into archetype detection, quirky stats, and narrative text just like database cards. Use this for one-of-ones, regional parallels, or anything too niche to be in our 9,800-card set.',
  },
  {
    question: 'What are the quirky stats?',
    answer: 'Six data points pulled from your collection that make the narrative feel personal: cards from the year you were born (if you enter birth year), dominant sport share, oldest card year, newest card year, rookie card percentage, and rough total estimated value. Small weird facts are what make collection stories actually shareable.',
  },
];

export default function CollectionNarrativePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Collection Narrative Generator',
        description: 'Turn your card collection into a shareable story: collector archetype, signature card, vibe tag, and 3-paragraph identity writeup.',
        url: 'https://cardvault-two.vercel.app/tools/collection-narrative',
        applicationCategory: 'UtilityApplication',
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
        <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/50 text-fuchsia-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
          Collection Narrative &middot; 8 Archetypes &middot; 9,800+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Collection Narrative Generator</h1>
        <p className="text-gray-400 text-lg">
          Add 5 to 20 of your cards. Get back a collector archetype, signature card,
          vibe tag, and a 3-paragraph identity writeup worth sharing.
        </p>
      </div>

      <CollectionNarrativeClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-fuchsia-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/tools/player-portfolio" className="text-fuchsia-500 hover:text-fuchsia-400">Player Portfolio</Link>
          <Link href="/tools/collection-heatmap" className="text-fuchsia-500 hover:text-fuchsia-400">Collection Heatmap</Link>
          <Link href="/tools/diversification" className="text-fuchsia-500 hover:text-fuchsia-400">Diversification</Link>
          <Link href="/showcase" className="text-fuchsia-500 hover:text-fuchsia-400">Showcase</Link>
          <Link href="/tools/value-dna" className="text-fuchsia-500 hover:text-fuchsia-400">Value DNA</Link>
          <Link href="/wrapped" className="text-fuchsia-500 hover:text-fuchsia-400">Wrapped</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-fuchsia-500 hover:text-fuchsia-400">&larr; All Tools</Link>
        <Link href="/games" className="text-fuchsia-500 hover:text-fuchsia-400">Games</Link>
        <Link href="/" className="text-fuchsia-500 hover:text-fuchsia-400">Home</Link>
      </div>
    </div>
  );
}
