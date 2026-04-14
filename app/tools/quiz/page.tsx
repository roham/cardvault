import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectorQuiz from './CollectorQuiz';

export const metadata: Metadata = {
  title: 'What Should I Collect? — Card Collector Quiz',
  description: 'Take our free quiz to find out what type of card collector you are. Get personalized recommendations for sports cards and Pokemon based on your budget, interests, and goals.',
  openGraph: {
    title: 'What Should I Collect? — CardVault Quiz',
    description: 'Find your collector profile in 6 questions. Get personalized card collecting recommendations for sports cards and Pokemon.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'What Should I Collect? — CardVault Quiz',
    description: 'Take the quiz. Find your collector type. Get personalized card recommendations.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'What Should I Collect?' },
];

const faqItems = [
  {
    question: 'What type of card collector am I?',
    answer: 'There are five main collector types: Casual Collector (in it for fun), Set Builder (loves completing checklists), Flipper (buys and sells for profit), Investor (long-term holds of premium cards), and Pokemon Collector (focused on the TCG). Most people are a blend. Our quiz identifies your primary type and gives tailored recommendations.',
  },
  {
    question: 'What should a beginner collect first?',
    answer: 'Start with what you love — your favorite team, player, or Pokemon. Buy a blaster box ($25-40) from a retail store for the opening experience. Then pick up 2-3 singles of your favorite player in the $5-20 range on eBay. Don\'t overthink it. The best first card is one you\'re excited to own.',
  },
  {
    question: 'Are sports cards a good investment?',
    answer: 'Some cards appreciate significantly over time, especially PSA 10 rookies of Hall of Fame-caliber players. But most cards lose value after release. Cards are best viewed as a hobby first, investment second. If you want investment exposure, focus on graded rookie cards of proven franchise players and vintage key cards.',
  },
  {
    question: 'Should I collect sports cards or Pokemon?',
    answer: 'It depends on what excites you. Sports cards are tied to real athletes and have price movements based on player performance — great if you follow sports. Pokemon cards have stunning artwork, a devoted global community, and strong nostalgia appeal. Many collectors do both.',
  },
];

export default function QuizPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Collector Quiz — What Should I Collect?',
        description: 'Interactive quiz to find your card collector profile and get personalized recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/quiz',
        applicationCategory: 'EntertainmentApplication',
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

      <Breadcrumb items={breadcrumbs} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          6 questions · 5 profiles · Personalized picks
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          What Should I Collect?
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Answer 6 quick questions and we&apos;ll tell you what type of collector you are, what to buy first, and which tools to use. Works for sports cards and Pokemon.
        </p>
      </div>

      {/* Quiz */}
      <CollectorQuiz />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links */}
      <div className="border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Explore CardVault</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Check
          </Link>
          <Link href="/tools/grading-roi" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Grading ROI Calculator
          </Link>
          <Link href="/tools/sealed-ev" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Sealed Product EV
          </Link>
          <Link href="/tools/compare" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Compare Cards
          </Link>
          <Link href="/guides" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Beginner Guides
          </Link>
          <Link href="/start" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Getting Started
          </Link>
        </div>
      </div>
    </div>
  );
}
