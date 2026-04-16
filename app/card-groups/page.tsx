import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardGroupsClient from './CardGroupsClient';

export const metadata: Metadata = {
  title: 'Card Groups — Group 16 Players into 4 Hidden Categories | CardVault',
  description: 'Free daily puzzle game for card collectors. Group 16 sports card players into 4 secret categories. Like NYT Connections for the card hobby. Daily challenge with shareable results. 2,000+ players from MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Card Groups — Find the Hidden Categories | CardVault',
    description: 'Group 16 players into 4 secret categories. Daily puzzle, shareable emoji results.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Groups — CardVault',
    description: 'Connections-style puzzle for card collectors. Group 16 players into 4 categories.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Groups' },
];

const faqItems = [
  {
    question: 'How does Card Groups work?',
    answer: 'You are shown 16 player names from the CardVault database. Your goal is to group them into 4 categories of 4 players each. Categories might be players from the same sport, same decade, same card set, same value tier, or other shared attributes. Tap 4 players and hit Submit to guess. Correct groups are revealed instantly.',
  },
  {
    question: 'How many mistakes can I make?',
    answer: 'You have 4 mistakes before the game ends. Each incorrect guess costs one life. If you use all 4, the remaining groups are revealed automatically. A perfect game means solving all 4 groups with zero mistakes.',
  },
  {
    question: 'What do the colors mean?',
    answer: 'Each group has a difficulty color: yellow (easiest), green (medium), blue (hard), and purple (trickiest). The colors are assigned based on how non-obvious the category is. Typically, sport-based or decade-based groups are easier, while name patterns or value tiers are harder.',
  },
  {
    question: 'Is the daily puzzle the same for everyone?',
    answer: 'Yes! The daily puzzle uses a date-based seed so every player sees the same 16 names and same 4 categories. This means you can share your results with friends and compare strategies. Switch to Random mode for unlimited practice puzzles.',
  },
  {
    question: 'How are categories generated?',
    answer: 'Categories are algorithmically generated from the CardVault database of 7,500+ sports cards. Possible themes include same sport, same debut decade, rookie card holders, same card set, value tiers, name patterns, and mixed-sport groups. Each puzzle is unique and balanced.',
  },
];

export default function CardGroupsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Groups',
        description: 'Group 16 sports card players into 4 secret categories. Daily puzzle with shareable results.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/card-groups',
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

      <CardGroupsClient />

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
