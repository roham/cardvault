import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SeasonalityGuide from './SeasonalityGuide';

export const metadata: Metadata = {
  title: 'Card Market Seasonality Guide — Best Times to Buy & Sell Sports Cards',
  description: 'Free interactive calendar showing the best months to buy and sell sports cards, basketball cards, football cards, hockey cards, and Pokémon cards. Monthly buy/sell signals, key events, and pro tips based on historical market patterns.',
  openGraph: {
    title: 'Card Market Seasonality Guide — CardVault',
    description: 'When to buy and sell cards for maximum value. Monthly buy/sell signals for baseball, basketball, football, hockey, and Pokémon.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Seasonality Guide — CardVault',
    description: 'Best times to buy and sell sports cards. Interactive monthly calendar with buy/sell signals.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Market Seasonality Guide' },
];

const faqItems = [
  {
    question: 'When is the best time to buy sports cards?',
    answer: 'The best time to buy sports cards is during each sport\'s off-season when attention is lowest. For baseball cards, buy in November. For basketball cards, buy in July. For football cards, buy in June. For hockey cards, buy in August. For Pokémon cards, buy in January after the holiday selling rush. Prices are typically 20-40% lower during dead periods compared to peak season.',
  },
  {
    question: 'When is the best time to sell sports cards?',
    answer: 'Sell sports cards during peak excitement events: World Series for baseball (October), NBA Finals for basketball (June), Super Bowl for football (January-February), Stanley Cup Finals for hockey (May-June), and Pokémon World Championships (August). Championship and award-winning performances create 24-72 hour price spikes of 100-400% that fade quickly.',
  },
  {
    question: 'Do sports card prices follow seasonal patterns?',
    answer: 'Yes, sports cards follow predictable seasonal cycles tied to each sport\'s schedule. Prices peak during playoffs/championships and bottom during off-seasons. Additional price catalysts include the NFL Draft (April), new card set releases, trade deadlines, and free agency periods. These patterns repeat annually with 80-90% consistency, though individual card prices also depend on player performance.',
  },
  {
    question: 'How long do event-driven card price spikes last?',
    answer: 'Most event-driven price spikes last 24-72 hours. A World Series MVP card might spike 200-400% during the series but return to near-normal within a week. Draft night picks spike and fade within 48 hours. Trade deadline moves create 1-3 day windows. The exception is sustained performance (e.g., a rookie who wins MVP) — those premiums can last weeks or months.',
  },
  {
    question: 'Should I buy new card sets on release day?',
    answer: 'No — never buy singles from a new release in the first 2 weeks. When boxes are first opened, supply floods the market and prices are inflated by hype. Wait 3-4 weeks after release for singles to bottom out, then buy. The exception is sealed product: if you can get boxes at MSRP on release day, that\'s often a good deal since secondary market prices for sealed boxes usually rise once the initial print run sells out.',
  },
];

export default function SeasonalityPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Market Seasonality Guide',
        description: 'Interactive calendar showing the best times to buy and sell sports cards, basketball cards, football cards, hockey cards, and Pokémon cards based on historical market patterns.',
        url: 'https://cardvault-two.vercel.app/tools/seasonality',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          5 Sports &middot; 12 Months &middot; Buy/Sell Signals &middot; Pro Tips &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Seasonality Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Know when to buy and when to sell. Interactive monthly calendar with buy/sell signals for baseball, basketball, football, hockey, and Pokémon cards based on historical market patterns.
        </p>
      </div>

      <SeasonalityGuide />

      {/* FAQ */}
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

      <section className="mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          Calculate your <a href="/tools/grading-roi" className="text-emerald-400 hover:underline">grading ROI</a>,{' '}
          check <a href="/tools/flip-calc" className="text-emerald-400 hover:underline">flip profit margins</a>,{' '}
          track <a href="/tools/watchlist" className="text-emerald-400 hover:underline">card prices on your watchlist</a>, or{' '}
          plan your hobby spending with the <a href="/tools/budget-planner" className="text-emerald-400 hover:underline">budget planner</a>.
        </p>
      </section>
    </div>
  );
}
