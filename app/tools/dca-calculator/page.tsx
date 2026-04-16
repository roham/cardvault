import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DcaCalculatorClient from './DcaCalculatorClient';

export const metadata: Metadata = {
  title: 'Card DCA Calculator — Dollar Cost Average Into Any Card | CardVault',
  description: 'Plan a dollar-cost averaging strategy for any sports card. See projected accumulation, average cost basis, and DCA vs lump-sum comparison over 3-24 months. Free investment planning tool for card collectors.',
  openGraph: {
    title: 'Card DCA Calculator — Dollar Cost Average Into Cards | CardVault',
    description: 'Plan your card investment with DCA. See cost basis, projected value, and compare to lump-sum buying.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card DCA Calculator — CardVault',
    description: 'Dollar-cost average into any sports card. See projected returns vs lump-sum.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'DCA Calculator' },
];

const faqItems = [
  {
    question: 'What is dollar-cost averaging (DCA) for cards?',
    answer: 'Dollar-cost averaging means buying copies of the same card at regular intervals (e.g., monthly) instead of all at once. This smooths out price volatility — you buy more copies when prices dip and fewer when prices spike. Over time, your average cost per card tends to be lower than if you tried to time the market. DCA is especially effective for volatile rookie cards and cards tied to player performance.',
  },
  {
    question: 'How does this calculator work?',
    answer: 'Enter any card from our 7,400+ card database and set a monthly budget and time horizon. The calculator simulates monthly price fluctuations based on the card\'s sport, era, and value tier, then shows how many copies you\'d accumulate, your average cost basis, projected portfolio value, and total return. It also compares DCA to buying all copies at once (lump-sum) so you can see which strategy performs better for that card.',
  },
  {
    question: 'When should I use DCA vs lump-sum for cards?',
    answer: 'DCA works best for volatile cards — rookie cards, cards of active players whose performance fluctuates, and cards in the $20-$500 range where price swings are common. Lump-sum tends to win for stable vintage cards that appreciate steadily (like a 1952 Topps Mantle) or when you\'re confident the current price is a good entry point. DCA is also better when you\'re investing a significant amount relative to your budget — spreading risk over time reduces the chance of buying at a peak.',
  },
  {
    question: 'What assumptions does the simulation use?',
    answer: 'The simulation uses sport-specific volatility (football cards are most volatile due to injury risk, vintage cards are most stable), era-based appreciation rates (pre-war cards appreciate ~3-5% annually, modern rookies ~8-15% but with high variance), and value-tier adjustments (higher-value cards tend to be less volatile percentage-wise). Monthly price changes are simulated with realistic noise patterns. Results are projections, not guarantees.',
  },
  {
    question: 'Can I DCA into graded cards?',
    answer: 'Yes. The calculator uses raw card values by default, but the same DCA principles apply to graded cards. In fact, DCA works even better for graded cards because PSA/BGS populations change over time, affecting supply and price. Buying graded copies monthly means you might catch population report dips or temporary oversupply that pushes prices down. Just factor in that graded card prices are generally more stable than raw prices.',
  },
];

export default function DcaCalculatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card DCA Calculator — Dollar Cost Average Into Any Card',
        description: 'Plan a dollar-cost averaging strategy for any sports card. See projected accumulation, average cost basis, and DCA vs lump-sum comparison.',
        url: 'https://cardvault-two.vercel.app/tools/dca-calculator',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          DCA Strategy &middot; 7,400+ Cards &middot; Lump-Sum Comparison
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card DCA Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Plan a dollar-cost averaging strategy for any sports card. See how buying monthly compares to buying all at once — with projected accumulation, cost basis, and returns.
        </p>
      </div>

      <DcaCalculatorClient />

      {/* DCA Tips */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">DCA Tips for Card Collectors</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Set a Fixed Budget', desc: 'Decide your monthly card budget and stick to it. Consistency is the key to DCA — don\'t chase spikes or panic during dips.' },
            { title: 'Buy on Dips, Not Hype', desc: 'DCA naturally buys more when prices are low. But you can amplify this by being patient during hype cycles and aggressive during dips.' },
            { title: 'Track Your Cost Basis', desc: 'Keep a spreadsheet or use CardVault\'s Flip Tracker to log every purchase. Knowing your average cost per card is essential for sell decisions.' },
            { title: 'Focus on Liquid Cards', desc: 'DCA works best for cards that sell quickly — popular players, key rookie cards, and flagship sets like Prizm, Topps Chrome, and Upper Deck.' },
            { title: 'Consider Multiple Copies', desc: 'Owning 5-10 copies of a $30 card gives you more exit flexibility than owning one $300 card. You can sell some and hold others.' },
            { title: 'Review Quarterly', desc: 'Every 3 months, assess your DCA positions. Has the player\'s situation changed? Is the card still liquid? Adjust your strategy accordingly.' },
          ].map(tip => (
            <div key={tip.title} className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="text-white font-semibold text-sm mb-1">{tip.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator' },
            { href: '/tools/flip-window', label: 'Flip Window Calculator' },
            { href: '/tools/flip-scorer', label: 'Quick-Flip Scorer' },
            { href: '/tools/watchlist', label: 'Price Watchlist' },
            { href: '/tools/budget-planner', label: 'Budget Planner' },
            { href: '/tools/portfolio-rebalancer', label: 'Portfolio Rebalancer' },
            { href: '/tools/stress-test', label: 'Portfolio Stress Test' },
            { href: '/tools/seasonality', label: 'Market Seasonality' },
            { href: '/tools/trend-predictor', label: 'Trend Predictor' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
