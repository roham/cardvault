import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardBlackjackClient from './CardBlackjackClient';

export const metadata: Metadata = {
  title: 'Card Blackjack — Hit 21 with Real Sports Cards | CardVault',
  description: 'Free blackjack game using real sports cards. Card values become points — $500+ cards are Aces, budget cards are low. Hit, stand, or double down across 10 hands. Daily challenge + unlimited random games. 7,500+ real cards from MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Card Blackjack — Sports Card Casino | CardVault',
    description: 'Blackjack with real sports cards. $500+ cards are Aces. 10 hands, $1,000 starting chips.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Blackjack — CardVault',
    description: 'Hit 21 with real sports cards. Daily challenge + unlimited play.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Blackjack' },
];

const faqItems = [
  {
    question: 'How does Card Blackjack work?',
    answer: 'Card Blackjack plays like classic blackjack but uses real sports cards from the CardVault database. Each card\'s real-world dollar value determines its point value in the game: $500+ cards act as Aces (11 or 1), $200+ cards are worth 10 points (like face cards), and budget cards under $8 are worth 2 points. You start with $1,000 in chips, bet on each hand, and try to beat the dealer by getting closest to 21 without going over.',
  },
  {
    question: 'What is the point system based on?',
    answer: 'Points are mapped directly from real card market values. High-end cards ($500+) like rare rookies and vintage legends act as Aces worth 11 or 1. Mid-range cards ($200-$499) are worth 10 points, similar to face cards. Budget cards under $8 are worth just 2 points. This means expensive cards are powerful but risky — just like in real card collecting.',
  },
  {
    question: 'How many hands do I play?',
    answer: 'Each game consists of 10 hands. You can bet $25, $50, $100, or $250 per hand from your $1,000 starting balance. The game ends after 10 hands or when you run out of chips. Your final balance determines your grade from F (busted) to A+ (Card Shark, $2,000+).',
  },
  {
    question: 'Is the daily game the same for everyone?',
    answer: 'Yes! The daily game uses a date-based seed so every player sees the same card sequence. This means you can share your results and compare strategies with friends. Switch to Random mode for unlimited practice games with different card sequences each time.',
  },
  {
    question: 'Can I double down?',
    answer: 'Yes! On your first two cards, you can Double Down to double your bet and receive exactly one more card. This is a classic blackjack strategy — ideal when you have 10 or 11 points and expect a high card. You need enough chips to cover the doubled bet.',
  },
];

export default function CardBlackjackPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Blackjack',
        description: 'Play blackjack with real sports cards. Card dollar values map to game points. Hit 21 to win.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/card-blackjack',
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

      <CardBlackjackClient />

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
