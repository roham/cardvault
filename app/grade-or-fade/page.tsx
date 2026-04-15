import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GradeOrFade from './GradeOrFade';

export const metadata: Metadata = {
  title: 'Grade or Fade — Daily Card Investment Game',
  description: 'Test your card market knowledge! See a card investment opportunity and decide: Grade (buy/invest) or Fade (pass). 10 daily picks, scored instantly. Free card collecting game.',
  openGraph: {
    title: 'Grade or Fade — CardVault',
    description: 'Swipe-style card investment game. Grade or Fade 10 cards daily and test your market knowledge.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grade or Fade — CardVault',
    description: 'Daily card investment game. 10 picks. Grade or Fade. How sharp is your card market eye?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Grade or Fade' },
];

const faqItems = [
  {
    question: 'How does Grade or Fade work?',
    answer: 'You are shown 10 card investment opportunities per day. For each one, you decide: "Grade" (this is a good investment, buy it) or "Fade" (this is a bad investment, pass). After each pick, you see if you were right and get an explanation. At the end, you get a score out of 10 and a collector grade.',
  },
  {
    question: 'What does "Grade" mean in this game?',
    answer: 'Grade means you believe the card is a good investment — you would buy it, hold it, or recommend it to other collectors. It means the card has upside potential based on the player, scarcity, market position, and collecting demand.',
  },
  {
    question: 'What does "Fade" mean in this game?',
    answer: 'Fade means you believe the card is a bad investment — you would pass on it, sell it if you own it, or warn other collectors away. It means the card is overpriced, overhyped, or has fundamental issues (overproduction, player decline, etc.).',
  },
  {
    question: 'Are the answers based on opinions or data?',
    answer: 'The answers are based on established card market principles: scarcity drives value, player performance drives demand, overproduction kills value, and condition matters. While no investment advice is guaranteed, the answers reflect consensus hobby wisdom backed by historical market data.',
  },
];

export default function GradeOrFadePage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Grade or Fade — Daily Card Investment Game',
        description: 'Test your card market knowledge with daily Grade or Fade investment picks. 10 cards, score out of 10, shareable results.',
        url: 'https://cardvault-two.vercel.app/grade-or-fade',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          10 Daily Picks &middot; Grade or Fade &middot; Shareable Results &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Grade or Fade</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Test your card market instincts. See an investment opportunity — would you buy in (Grade) or pass (Fade)? 10 daily picks, scored instantly.
        </p>
      </div>

      <GradeOrFade />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          More games: <a href="/flip-or-keep" className="text-emerald-400 hover:underline">Flip or Keep</a>,{' '}
          <a href="/price-is-right" className="text-emerald-400 hover:underline">The Price is Right</a>,{' '}
          <a href="/trading-sim" className="text-emerald-400 hover:underline">Trading Simulator</a>,{' '}
          <a href="/guess-the-card" className="text-emerald-400 hover:underline">Guess the Card</a>.{' '}
          Tools: <a href="/tools/investment-calc" className="text-emerald-400 hover:underline">Investment Calculator</a>,{' '}
          <a href="/tools/grading-roi" className="text-emerald-400 hover:underline">Grading ROI</a>.
        </p>
      </section>
    </div>
  );
}
