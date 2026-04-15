import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RookieFinderClient from './RookieFinderClient';

export const metadata: Metadata = {
  title: 'Rookie Card Finder — Search Any Player\'s Rookie Cards with Values | CardVault',
  description: 'Find every rookie card for any player across baseball, basketball, football, and hockey. Search 5,300+ cards to see all first-year cards with estimated raw and graded values, set details, and eBay links. The fastest way to identify rookie cards.',
  openGraph: {
    title: 'Rookie Card Finder — CardVault',
    description: 'Search any player and instantly find all their rookie cards with values, sets, and buying links.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rookie Card Finder — CardVault',
    description: 'Find all rookie cards for any player. 5,300+ cards across 4 sports.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Rookie Card Finder' },
];

const faqItems = [
  {
    question: 'What is a rookie card?',
    answer: 'A rookie card (RC) is the first licensed trading card of a professional athlete, typically issued during their first season. Rookie cards are the most sought-after and valuable cards in the hobby because they represent a player\'s earliest collectible. Cards marked with "RC" in the set, first-year inserts, and Bowman 1st Chrome cards for baseball are all considered rookie cards.',
  },
  {
    question: 'How does the Rookie Card Finder work?',
    answer: 'Search any player name and the tool instantly scans CardVault\'s database of 5,300+ sports cards to find all cards flagged as rookie cards. Results show the card name, set, year, estimated raw and graded values, and a direct link to search for that card on eBay. You can filter by sport and sort by value.',
  },
  {
    question: 'Why do some players have multiple rookie cards?',
    answer: 'Modern players often have rookie cards in many different sets released during the same year. For example, a 2024 NFL rookie might have cards in Prizm, Optic, Select, Mosaic, and Topps Chrome — each counts as a rookie card. Collectors often debate which is the "true" rookie, but all first-year licensed cards qualify. The tool shows every one.',
  },
  {
    question: 'Which rookie cards are worth the most?',
    answer: 'Value depends on the player, set, and condition. Generally, flagship rookie cards (Topps Chrome for baseball, Prizm for basketball and football, Upper Deck Young Guns for hockey) command the highest premiums. Numbered parallels, autographs, and patch cards of star players can be worth thousands. The tool shows estimated values for both raw and gem mint graded copies.',
  },
  {
    question: 'Can I search for vintage rookie cards?',
    answer: 'Yes. The database includes legendary rookie cards from every era — from Mickey Mantle\'s 1952 Topps to Michael Jordan\'s 1986 Fleer to modern prospects. Search any player regardless of era and see all their first-year cards with current market values.',
  },
];

export default function RookieFinderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Rookie Card Finder',
        description: 'Search any player and find all their rookie cards with estimated values. Covers baseball, basketball, football, and hockey across 5,300+ cards.',
        url: 'https://cardvault-two.vercel.app/tools/rookie-finder',
        applicationCategory: 'UtilitiesApplication',
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
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          5,300+ Cards &middot; 4 Sports &middot; All Eras
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Rookie Card Finder
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Search any player and instantly find all their rookie cards with estimated values. The fastest way to discover which first-year cards exist and what they are worth.
        </p>
      </div>

      <RookieFinderClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform ml-4 shrink-0">&#9660;</span>
              </summary>
              <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 mb-8 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/tools/card-scout', label: 'Card Scout' },
            { href: '/tools/identify', label: 'Card Identifier' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/grade-value-chart', label: 'Grade Value Chart' },
            { href: '/tools/prospect-tracker', label: 'Prospect Tracker' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/rookie-tracker', label: 'Rookie Tracker' },
            { href: '/tools/price-history', label: 'Price History' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
