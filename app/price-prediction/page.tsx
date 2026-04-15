import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PricePredictionClient from './PricePredictionClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Price Prediction — Daily Card Market Forecasting Game',
  description: 'Predict whether sports card prices will go up or down based on real market factors. Daily challenges, streak tracking, and shareable results. Test your card market instincts.',
  openGraph: {
    title: 'Price Prediction — Daily Market Forecasting Game — CardVault',
    description: 'Will this card go up or down? Predict price movements based on real market factors.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Price Prediction — CardVault',
    description: 'Daily card price prediction game. Test your market instincts.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/tools' },
  { label: 'Price Prediction' },
];

const faqItems = [
  {
    question: 'How does Price Prediction work?',
    answer: 'Each day you get 5 cards with real market scenarios. For each card, you see the current estimated value, a market factor (like a player trade, injury, championship win, or rookie hype), and you predict if the price will go UP or DOWN. After each prediction, you see the simulated outcome with an explanation of why the market moved that way.',
  },
  {
    question: 'Are the price movements real?',
    answer: 'The scenarios are based on real market dynamics — player performance, trades, injuries, and seasonal patterns all affect card values. The outcomes use historically accurate patterns (e.g., a player winning MVP typically increases card values 20-50%). Actual outcomes may differ from the simulation.',
  },
  {
    question: 'How is the score calculated?',
    answer: 'You earn 100 points for each correct prediction, plus bonus points for confidence level (if you are very confident and correct, you earn 150 points; if wrong, you lose 50). Your daily score out of 500 possible points determines your grade: S (450+), A (350+), B (250+), C (150+), D (50+), F (under 50).',
  },
  {
    question: 'Does Price Prediction reset daily?',
    answer: 'Yes, you get 5 new prediction scenarios every day at midnight. The card selection and scenarios are determined by a date-based seed, so everyone sees the same challenges. Your all-time stats (correct %, longest streak, total predictions) persist in your browser.',
  },
];

export default function PricePredictionPage() {
  const cardData = sportsCards.map(c => ({
    name: c.name,
    player: c.player,
    sport: c.sport,
    year: c.year,
    set: c.set,
    estimatedValueRaw: c.estimatedValueRaw,
    slug: c.slug,
    rookie: c.rookie,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Price Prediction — Daily Card Market Forecasting Game',
        description: 'Predict card price movements based on real market factors. Daily challenges with scoring.',
        url: 'https://cardvault-two.vercel.app/price-prediction',
        applicationCategory: 'GameApplication',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          5 daily predictions
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Price Prediction</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Will this card go up or down? Read the market scenario, make your call, and test your card market instincts.
        </p>
      </div>

      {/* How to play */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#128200;</div>
          <p className="text-white text-sm font-medium">Read</p>
          <p className="text-gray-500 text-xs">Market scenario</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#129300;</div>
          <p className="text-white text-sm font-medium">Predict</p>
          <p className="text-gray-500 text-xs">Up or down?</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <div className="text-lg mb-1">&#127942;</div>
          <p className="text-white text-sm font-medium">Score</p>
          <p className="text-gray-500 text-xs">Beat your best</p>
        </div>
      </div>

      {/* Game */}
      <PricePredictionClient cards={cardData} />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 group">
            <summary className="text-white font-medium cursor-pointer list-none flex items-center justify-between">
              {f.question}
              <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
            </summary>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Bottom links */}
      <div className="mt-12 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <h3 className="text-white font-semibold text-sm mb-3">More Daily Games</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link href="/card-ladder" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Card Ladder</Link>
          <Link href="/grade-or-fade" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Grade or Fade</Link>
          <Link href="/card-slots" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Card Slots</Link>
          <Link href="/flip-or-keep" className="text-blue-400 hover:text-blue-300 text-sm py-1.5 px-3 bg-gray-900/60 border border-gray-800 rounded-lg text-center transition-colors">Flip or Keep</Link>
        </div>
      </div>
    </div>
  );
}
