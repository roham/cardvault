import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardTypingClient from './CardTypingClient';

export const metadata: Metadata = {
  title: 'Card Typing Challenge — Speed Typing Game for Card Collectors | CardVault',
  description: 'Free typing speed game for card collectors. Type player names and hobby terms as fast as you can. 10 words, track your WPM, accuracy, and score. Daily challenges and unlimited random mode.',
  openGraph: {
    title: 'Card Typing Challenge — CardVault',
    description: 'Speed typing game for card collectors. Type player names and hobby terms. Daily challenge + random.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Typing Challenge — CardVault',
    description: 'How fast can you type card hobby terms? Test your speed!',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/my-hub' },
  { label: 'Card Typing Challenge' },
];

const faqItems = [
  {
    question: 'How does the Card Typing Challenge work?',
    answer: 'You are given 10 words to type as quickly and accurately as possible. 5 words are card hobby terms (like REFRACTOR, PRIZM, CHROME) and 5 are player last names from our 6,800+ card database. Type each word and press Enter to submit. Your score is based on speed (words per minute), accuracy (correct words), and bonus points for perfect accuracy.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'Each correct word earns 100 base points. Your average words-per-minute (WPM) is multiplied by 2 and added to the score. A 100% accuracy bonus adds 200 points, and 80%+ accuracy adds 100 points. Grades range from S (1200+) to F (under 300). A perfect game with fast typing can score over 1,500 points.',
  },
  {
    question: 'What is the Daily Challenge?',
    answer: 'The Daily Challenge uses the same 10 words for every player on the same day, generated from a date-based seed. This lets you compare scores with friends and other collectors. The Random mode generates a new set of words each time for unlimited practice.',
  },
  {
    question: 'What counts as a correct answer?',
    answer: 'The word must be typed exactly as shown — all uppercase, letter by letter. Spelling must match perfectly. The input automatically converts to uppercase for you, so you just need to type the right letters. There is no time limit per word, but faster typing earns a higher WPM score.',
  },
  {
    question: 'Can I share my results?',
    answer: 'Yes! After completing a game, click the "Share Results" button to copy a formatted summary to your clipboard. It includes colored squares showing which words you got right or wrong, your score, grade, accuracy, and WPM — perfect for sharing in group chats or social media.',
  },
];

export default function CardTypingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Typing Challenge',
        description: 'Speed typing game for card collectors. Type player names and hobby terms as fast as you can.',
        url: 'https://cardvault-two.vercel.app/card-typing',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
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

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Typing Challenge</h1>
        <p className="text-gray-400">Type card hobby terms and player names as fast as you can. 10 words, scored on speed and accuracy.</p>
      </div>

      <CardTypingClient />

      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-white hover:text-blue-400 transition-colors">
                {item.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
        <Link href="/card-scramble" className="hover:text-blue-400 transition-colors">Card Scramble</Link>
        <span>|</span>
        <Link href="/trivia" className="hover:text-blue-400 transition-colors">Daily Trivia</Link>
        <span>|</span>
        <Link href="/word-search" className="hover:text-blue-400 transition-colors">Word Search</Link>
        <span>|</span>
        <Link href="/guess-the-card" className="hover:text-blue-400 transition-colors">Guess the Card</Link>
        <span>|</span>
        <Link href="/card-speed-quiz" className="hover:text-blue-400 transition-colors">Speed Quiz</Link>
        <span>|</span>
        <Link href="/my-hub" className="hover:text-blue-400 transition-colors">My Hub</Link>
      </div>
    </div>
  );
}
