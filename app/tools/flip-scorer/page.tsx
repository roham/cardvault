import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlipScorerClient from './FlipScorerClient';

export const metadata: Metadata = {
  title: 'Card Quick-Flip Scorer — Rate Any Card\'s Flippability | CardVault',
  description: 'Get an instant flip score (0-100) for any sports card. Analyzes liquidity, margin potential, demand trends, seasonal timing, and risk to tell you if a card is worth flipping right now. Free tool for card flippers and dealers.',
  openGraph: {
    title: 'Card Quick-Flip Scorer — Is This Card Worth Flipping? | CardVault',
    description: 'Rate any card\'s flip potential with a 0-100 score. Get sell timing, best platform, and suggested price.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Quick-Flip Scorer — CardVault',
    description: 'Instant flip scores for 7,000+ sports cards. Know before you buy.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Quick-Flip Scorer' },
];

const faqItems = [
  {
    question: 'What is the Quick-Flip Scorer?',
    answer: 'The Quick-Flip Scorer rates any sports card on its "flippability" — how good of a flip opportunity it is right now. It analyzes 5 dimensions: Liquidity (how easy to sell), Margin Potential (profit after fees), Demand Trend (current market interest), Seasonal Timing (sport-specific calendar), and Risk Level (price stability). Each dimension is scored 0-100 and combined into an overall flip score with a verdict: HOT FLIP, GOOD FLIP, HOLD, RISKY, or AVOID.',
  },
  {
    question: 'How is the flip score calculated?',
    answer: 'The flip score uses a weighted formula: Margin (25%), Liquidity (20%), Demand (20%), Risk (20%), and Timing (15%). Liquidity considers player popularity, sport market size, and price range. Margin factors in platform fees (~16%), grading uplift potential, and rookie premiums. Demand uses seasonal patterns, card era, and market heat. Timing reflects sport-specific calendars (e.g., NFL draft, World Series). Risk evaluates price stability based on value tier and card age.',
  },
  {
    question: 'What does each verdict mean?',
    answer: 'HOT FLIP (75-100): High demand, strong margins, great timing — flip immediately. GOOD FLIP (60-74): Solid opportunity with favorable conditions — flip when ready. HOLD (45-59): Margins exist but conditions aren\'t ideal — wait for a better window. RISKY (30-44): Low margins or high volatility — only flip if you got it cheap. AVOID (0-29): Poor flip conditions — hold for a better market or accept the loss.',
  },
  {
    question: 'What platforms are best for flipping cards?',
    answer: 'It depends on card value. Cards over $500 sell best on eBay 7-day auctions with authenticity guarantee. Cards $100-$500 work well as eBay Buy It Now listings. Cards $20-$100 sell on eBay or Mercari. Cards $5-$20 move fast on Mercari or at card shows. Cards under $5 are best sold in lots or at card shows where there are no shipping costs eating margins.',
  },
  {
    question: 'How does seasonal timing affect flip scores?',
    answer: 'Each sport has peak buying seasons that dramatically affect how fast cards sell and at what price. Football cards peak around the Super Bowl (February) and NFL Draft (April). Baseball peaks at Opening Day (April) and World Series (October). Basketball peaks during NBA Finals and Draft (June). Hockey peaks during Stanley Cup and Draft (June). Selling into peak demand can mean 20-40% higher prices and much faster sales.',
  },
];

export default function FlipScorerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Quick-Flip Scorer — Rate Any Card\'s Flippability',
        description: 'Get an instant flip score (0-100) for any sports card based on liquidity, margin, demand, timing, and risk.',
        url: 'https://cardvault-two.vercel.app/tools/flip-scorer',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          5-Factor Scoring &middot; 7,000+ Cards &middot; Instant Results
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Quick-Flip Scorer</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Rate any card&apos;s flip potential with a 0-100 score. See if you should flip now, hold for a better window, or avoid the trade entirely.
        </p>
      </div>

      <FlipScorerClient />

      {/* FAQ */}
      <div className="mt-12 space-y-4">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((f, i) => (
          <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white flex items-center justify-between">
              {f.question}
              <span className="text-gray-600 group-open:rotate-180 transition-transform">&#9662;</span>
            </summary>
            <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>

      {/* Related Tools */}
      <div className="mt-10 bg-gray-900/40 border border-gray-800/40 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Related Flipping Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/tools/flip-profit', label: 'Flip Profit Calculator' },
            { href: '/tools/flip-window', label: 'Flip Window Calendar' },
            { href: '/tools/flip-tracker', label: 'Flip P&L Tracker' },
            { href: '/tools/break-even', label: 'Break-Even Calculator' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/auction-bid', label: 'Auction Bid Calculator' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator' },
            { href: '/tools/grade-spread', label: 'Grade Price Spread' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
