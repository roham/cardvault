import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DraftTradeCalculator from './DraftTradeCalculator';

export const metadata: Metadata = {
  title: 'NFL Draft Trade Value Calculator — Evaluate Any Pick Trade',
  description: 'Free NFL Draft trade value calculator using the Jimmy Johnson chart. Compare draft pick packages, see point values for all 257 picks, evaluate trade fairness, and understand rookie card market impact by draft position.',
  openGraph: {
    title: 'NFL Draft Trade Value Calculator — CardVault',
    description: 'Evaluate NFL Draft pick trades with the Jimmy Johnson value chart. See which team wins the trade + rookie card market impact.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'NFL Draft Trade Value Calculator — CardVault',
    description: 'Evaluate any NFL Draft pick trade. Jimmy Johnson chart values for all 257 picks + card market impact.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Draft Trade Value Calculator' },
];

const faqItems = [
  {
    question: 'What is the NFL Draft trade value chart?',
    answer: 'The draft trade value chart was created by Jimmy Johnson and the Dallas Cowboys in the early 1990s. It assigns a point value to every draft pick from #1 (3,000 points) to #257 (0.1 points). Teams add up the point values on each side of a proposed trade to determine if it\'s fair. While some teams use updated versions, the original chart remains the industry standard for evaluating draft day trades.',
  },
  {
    question: 'How do draft picks affect rookie card values?',
    answer: 'Draft position has a massive impact on rookie card values. #1 overall picks (especially QBs) generate the most card market demand — Caleb Williams and Bryce Young Prizm Silver RCs hit $200-$500+ on draft night. Top 5 picks typically see 2-5x price spikes on draft night. By Round 3+, rookie card demand drops significantly unless the player breaks out. Landing spot (big market vs small market) also matters — a QB going to the Bears or Giants generates more card demand than the same player going to the Jaguars.',
  },
  {
    question: 'Should I buy rookie cards before or after the draft?',
    answer: 'For investment: buy Bowman University Chrome cards BEFORE the draft when prices are low. If the player goes in the top 10, you profit from the draft night spike. For collecting: wait 2-4 weeks AFTER the draft when the initial hype dies down. The best long-term strategy is to identify players you believe in, buy during post-draft dips, and hold through their rookie season. Pre-draft Bowman cards are the only cards available before draft night.',
  },
  {
    question: 'How much is the #1 overall pick worth in a trade?',
    answer: 'The #1 overall pick is worth 3,000 points on the Jimmy Johnson chart — the highest value of any single pick. To trade up to #1, teams typically need to offer multiple first-round picks plus additional assets. In 2024, it cost the Cardinals pick #4, #33, #67, and a 2025 first-round pick (about 2,960 points) to acquire #1 from the Bears. The #1 pick is worth roughly the same as picks #6, #24, and #40 combined.',
  },
  {
    question: 'Which draft positions produce the best card investments?',
    answer: 'Historically, top 5 QBs produce the highest card values (Patrick Mahomes, Josh Allen, Lamar Jackson). However, the BEST card investments often come from later rounds — Tom Brady (pick 199), Puka Nacua (pick 177), and Brock Purdy (pick 262, Mr. Irrelevant) produced 100x-1000x returns on their rookie cards. The sweet spot for risk/reward is Round 2-3 skill position players who have starter potential but lower initial card prices.',
  },
];

export default function DraftTradeValuePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault NFL Draft Trade Value Calculator',
        description: 'Evaluate NFL Draft pick trades using the Jimmy Johnson chart. Compare draft pick packages and see rookie card market impact.',
        url: 'https://cardvault-two.vercel.app/tools/draft-trade-value',
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

      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          NFL Draft 2025 — April 24-26 · Tool #100
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">NFL Draft Trade Value Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Evaluate any NFL Draft pick trade using the Jimmy Johnson value chart.
          Add picks to both sides, see who wins the deal, and understand how
          draft position impacts the rookie card market.
        </p>
      </div>

      {/* Calculator */}
      <DraftTradeCalculator />

      {/* Educational Section */}
      <div className="mt-10 space-y-6">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-3">How the Draft Trade Value Chart Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h3 className="text-white font-semibold mb-2">The Basics</h3>
              <p className="mb-2">
                Created by Jimmy Johnson and the Cowboys in the early 1990s, this chart assigns
                a point value to every pick in the NFL Draft. The #1 overall pick is worth 3,000 points,
                while the last pick in Round 7 is worth less than 1 point.
              </p>
              <p>
                To evaluate a trade, add up the point values on each side. If the totals are within 5%,
                it&apos;s generally considered a fair deal. Most teams use this chart (or a variation) as
                a starting point for negotiations.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Key Insights</h3>
              <ul className="space-y-1.5">
                <li>The #1 pick (3,000 pts) is worth nearly 2x the #5 pick (1,700 pts)</li>
                <li>A 1st rounder averages ~1,200 pts vs ~460 for a 2nd rounder</li>
                <li>Teams routinely overpay 20-30% to trade up for QBs</li>
                <li>The Rich Hill chart (newer model) values mid-round picks higher</li>
                <li>Future 1st-round picks are typically valued as picks #20-25</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((faq, i) => (
          <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
            <summary className="cursor-pointer px-5 py-4 text-white font-medium flex items-center justify-between">
              <span>{faq.question}</span>
              <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
            </summary>
            <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
          </details>
        ))}
      </div>

      {/* Back to tools */}
      <div className="mt-10 text-center">
        <Link href="/tools" className="text-blue-400 hover:text-blue-300 text-sm">
          ← Back to All Tools
        </Link>
      </div>
    </div>
  );
}
