import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SealedPortfolioClient from './SealedPortfolioClient';

export const metadata: Metadata = {
  title: 'Sealed Portfolio Tracker — Track Your Wax Investments | CardVault',
  description: 'Free sealed product portfolio tracker for card collectors. Add hobby boxes, blasters, ETBs, and cases. Track purchase price, current value, P&L, and ROI. Allocation analytics by sport and product type. 50+ products across MLB, NBA, NFL, NHL, and Pokemon.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Sealed Portfolio Tracker — Track Your Wax Investments | CardVault',
    description: 'Track sealed wax investments with real-time P&L, ROI, and allocation analytics. Free portfolio tracker.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sealed Portfolio Tracker — CardVault',
    description: 'Track sealed product investments. P&L, ROI, sport allocation. Free tool.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Sealed Portfolio Tracker' },
];

const faqItems = [
  {
    question: 'How do I track sealed product investments?',
    answer: 'Add each sealed product you own — search our database of 50+ hobby boxes, blasters, ETBs, and cases across MLB, NBA, NFL, NHL, and Pokemon. Enter your purchase price, quantity, and date. The tracker calculates your current portfolio value, profit/loss, and ROI automatically. All data is saved locally in your browser.',
  },
  {
    question: 'Are sealed boxes a good investment?',
    answer: 'Sealed hobby boxes have historically appreciated well, especially products 3-5+ years old with strong rookie classes. Key factors: the quality of the rookie class (e.g., 2018-19 Prizm Basketball with Luka/Trae), print run scarcity (limited production runs appreciate faster), and brand prestige (Topps Chrome, Prizm, and Bowman Chrome are the top appreciating brands). However, recent overprinting has reduced returns on many modern products. Diversify across sports and years.',
  },
  {
    question: 'Which sealed products appreciate the most?',
    answer: 'Historically, hobby boxes outperform retail and blaster boxes for long-term appreciation. The top performers are flagship products with strong rookie classes: Topps Chrome (MLB), Panini Prizm (NBA/NFL), Bowman Chrome (MLB prospects), and Upper Deck Series 1 (NHL). Products from 2016-2020 have seen the strongest gains, with some doubling or tripling in value. ETBs and blasters can also appreciate but generally at slower rates.',
  },
  {
    question: 'How should I store sealed products?',
    answer: 'Store sealed products in a cool (65-75°F), dry environment with low humidity (40-50%). Avoid basements (moisture), attics (heat fluctuation), and direct sunlight (fading). Keep boxes in their original shrink wrap — opened but unsealed boxes lose 20-40% of their investment value. For high-value cases, consider plastic storage bins with silica gel packets. Stack carefully to avoid crushing bottom boxes.',
  },
  {
    question: 'Is my portfolio data stored securely?',
    answer: 'Your portfolio data is stored locally in your browser using localStorage. It never leaves your device and is not sent to any server. This means your data is private, but it also means clearing your browser data will remove your portfolio. We recommend periodically screenshotting your analytics for backup.',
  },
];

export default function SealedPortfolioPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Sealed Portfolio Tracker',
        description: 'Free sealed product portfolio tracker. Track hobby boxes, blasters, ETBs, and cases with P&L, ROI, and allocation analytics.',
        url: 'https://cardvault-two.vercel.app/tools/sealed-portfolio',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          50+ Products - P&L Tracking - ROI Analytics - Sport Allocation - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Sealed Portfolio Tracker
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Track your sealed wax investments. Add hobby boxes, blasters, ETBs, and cases — see your portfolio value, P&L, ROI, and allocation analytics in real time.
        </p>
      </div>

      <SealedPortfolioClient />

      {/* How It Works */}
      <section className="mt-16 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { step: '1', title: 'Add Your Sealed Products', desc: 'Search our database of 50+ popular sealed products or add custom entries with your own product details.' },
            { step: '2', title: 'Enter Purchase Details', desc: 'Record your purchase price per unit, quantity, date, and optional notes for each product in your portfolio.' },
            { step: '3', title: 'Track Performance', desc: 'See real-time P&L and ROI for each product and your total portfolio. Filter by sport and sort by performance.' },
            { step: '4', title: 'Analyze Allocation', desc: 'View your portfolio breakdown by sport and product type. Identify your best and worst performers.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-purple-600/20 border border-purple-600/40 flex items-center justify-center text-purple-400 font-bold text-sm">
                {item.step}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-purple-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/sealed-ev', label: 'Sealed Product EV Calculator', desc: 'Should you rip or hold?' },
            { href: '/tools/sealed-yield', label: 'Sealed Yield Calculator', desc: 'Annualized returns on wax' },
            { href: '/tools/investment-planner', label: 'Card Investment Planner', desc: 'Portfolio allocation advice' },
            { href: '/tools/investment-calc', label: 'Card Investment Calculator', desc: 'Returns vs S&P 500' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit on sells' },
            { href: '/tools/wax-vs-singles', label: 'Wax vs Singles Calculator', desc: 'Compare buying strategies' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="block p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-purple-600/50 transition-colors">
              <div className="text-white font-medium text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
