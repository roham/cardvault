import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InvestmentThesisClient from './InvestmentThesisClient';

export const metadata: Metadata = {
  title: 'Card Investment Thesis Builder — Bull & Bear Case for Any Sports Card | CardVault',
  description: 'Build a structured investment thesis for any sports card. Get bull case, bear case, key catalysts, comparable cards, risk score, and a Buy/Hold/Sell verdict powered by data from 5,700+ cards.',
  openGraph: {
    title: 'Card Investment Thesis Builder — CardVault',
    description: 'Generate a Wall Street-style bull/bear investment thesis for any sports card. Free.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Investment Thesis Builder — CardVault',
    description: 'Bull case. Bear case. Key catalysts. Comparable cards. Investment verdict. Free.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/news' },
  { label: 'Investment Thesis Builder' },
];

const faqItems = [
  {
    question: 'What is the Card Investment Thesis Builder?',
    answer: 'The Card Investment Thesis Builder generates a structured investment analysis for any sports card in our 5,700+ card database. Like a Wall Street equity research report, it presents the bull case (reasons the card could appreciate), bear case (risks and downsides), key catalysts (upcoming events that could move the price), comparable cards, and a final Buy/Hold/Sell verdict with a risk score.',
  },
  {
    question: 'How is the investment thesis generated?',
    answer: 'The thesis is generated algorithmically based on multiple factors: card age, player career stage, rookie status, current value tier, sport-specific market dynamics, era scarcity, and comparable card performance. It is not financial advice — it is a structured framework to help you think through a card investment decision.',
  },
  {
    question: 'What factors affect the bull and bear cases?',
    answer: 'Bull case factors include: rookie cards of young players with upside, cards from scarce vintage eras, undervalued cards relative to player achievement, and upcoming catalysts like Hall of Fame inductions or milestone seasons. Bear case factors include: high current valuation with limited upside, player injury risk, overproduction era (junk wax), declining player performance, and sport-specific market headwinds.',
  },
  {
    question: 'What are key catalysts for card prices?',
    answer: 'Key catalysts are events that can cause significant price movement. Examples include: MVP/award announcements, playoff runs, retirement announcements, Hall of Fame eligibility, milestone achievements (3,000 hits, 500 home runs), rookie seasons for highly drafted players, and draft night for prospects. The builder identifies which catalysts are relevant to each specific card.',
  },
  {
    question: 'Should I make investment decisions based on this tool?',
    answer: 'No. This tool is for educational and entertainment purposes only. It provides a structured way to think about card investment decisions, but card markets are unpredictable and affected by factors no algorithm can capture — injuries, scandals, market sentiment shifts, and macroeconomic conditions. Always do your own research and never invest more than you can afford to lose.',
  },
];

export default function InvestmentThesisPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Investment Thesis Builder',
        description: 'Generate structured bull/bear investment theses for any sports card. Risk scoring, key catalysts, comparable cards, and Buy/Hold/Sell verdicts.',
        url: 'https://cardvault-two.vercel.app/investment-thesis',
        applicationCategory: 'FinanceApplication',
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Wall Street-Style Card Analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Investment Thesis Builder</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Search any card from our 5,700+ database and get a structured investment thesis — bull case, bear case, key catalysts, comparable cards, risk score, and a final verdict.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">1.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Search a Card</h3>
          <p className="text-gray-500 text-xs">Pick any card from the 5,700+ sports card database. Search by player name, year, or set.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">2.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Get Your Thesis</h3>
          <p className="text-gray-500 text-xs">See a structured bull/bear analysis with risk scoring, key catalysts, and comparable cards.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-2xl mb-2">3.</div>
          <h3 className="text-white font-semibold text-sm mb-1">Make Your Call</h3>
          <p className="text-gray-500 text-xs">Review the verdict — Strong Buy, Buy, Hold, Sell, or Strong Sell — and decide your strategy.</p>
        </div>
      </div>

      {/* Client Component */}
      <InvestmentThesisClient />

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-4">Related Tools & Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor' },
            { href: '/tools/flip-calc', label: 'Flip Calculator' },
            { href: '/market-data', label: 'Market Data Room' },
            { href: '/tools/grade-value-chart', label: 'Grade Value Chart' },
            { href: '/tools/heat-score', label: 'Collection Heat Score' },
            { href: '/market-report', label: 'Weekly Market Report' },
            { href: '/tools/price-alert', label: 'Price Alert Generator' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
