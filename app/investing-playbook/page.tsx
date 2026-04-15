import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import InvestingPlaybookClient from './InvestingPlaybookClient';

export const metadata: Metadata = {
  title: 'Card Investing Playbook — 6 Strategies to Build Wealth with Sports Cards | CardVault',
  description: 'Free sports card investing guide. 6 proven strategies: Value Hunting, Rookie Growth, Vintage Appreciation, Momentum Trading, Contrarian Buying, and Set Completion. Risk profiles, example cards, and actionable steps for every budget level.',
  openGraph: {
    title: 'Card Investing Playbook — 6 Strategies | CardVault',
    description: 'Master sports card investing with 6 proven strategies. Example cards, risk profiles, and step-by-step playbooks.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Investing Playbook — CardVault',
    description: '6 sports card investing strategies with real examples and risk/reward analysis.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Investing Playbook' },
];

const faqItems = [
  {
    question: 'What is the best sports card investing strategy for beginners?',
    answer: 'Value Hunting is the best strategy for beginners. It focuses on finding undervalued cards with strong fundamentals — good players, quality sets, and reasonable prices. The risk is low because you are buying cards that are already below fair value. Start with a $100-500 budget and focus on players you know well in sports you follow closely.',
  },
  {
    question: 'How much money do I need to start investing in sports cards?',
    answer: 'You can start with as little as $25-50 using the Value Hunting strategy, focusing on undervalued base cards and low-grade rookies. A $100-500 budget opens up more strategies like Rookie Growth (buying promising young players). For Vintage Appreciation, you typically need $500+ for quality vintage cards. The key is to start small, learn the market, and scale up as you gain experience.',
  },
  {
    question: 'Are sports cards a good investment compared to stocks?',
    answer: 'Sports cards can outperform stocks for specific cards in specific time periods, but they carry different risks. Cards are illiquid (harder to sell quickly), have no dividends, require storage and insurance, and are subject to player performance risk. However, cards offer tangible ownership, potential for outsized returns on individual picks, and enjoyment beyond financial returns. Most experts recommend cards as 5-10% of a diversified portfolio, not as a primary investment vehicle.',
  },
  {
    question: 'What is the difference between flipping and investing in cards?',
    answer: 'Flipping is short-term trading — buying cards at one price and selling quickly (days to weeks) for a profit. It requires active monitoring, fast execution, and accounts for platform fees. Investing is long-term holding (months to years), betting on career trajectory, market trends, or scarcity appreciation. Flipping targets 10-30% margins on volume; investing targets 2-10x returns on select cards held for years. Most successful collectors do both.',
  },
  {
    question: 'Which sports have the best card investment returns?',
    answer: 'Baseball has the deepest market and most liquid vintage cards, making it best for long-term value storage. Basketball has the highest upside for modern rookies due to individual player impact and global appeal. Football has strong seasonal patterns (buy in summer, sell during playoffs) that favor momentum traders. Hockey is the most undervalued market with the best entry points but lower liquidity. A diversified approach across 2-3 sports reduces risk.',
  },
];

export default function InvestingPlaybookPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Investing Playbook',
        description: '6 proven sports card investing strategies with example cards, risk profiles, and actionable playbooks.',
        url: 'https://cardvault-two.vercel.app/investing-playbook',
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
          6 Strategies &middot; Real Examples &middot; Risk Profiles
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Investing Playbook
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
          Six proven strategies for building wealth through sports cards. Each playbook includes risk profile, example cards from our database, entry budgets, and step-by-step instructions.
        </p>
      </div>

      <InvestingPlaybookClient />

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Tools for Investors</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'See if grading is worth it for your cards' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit after fees on any flip' },
            { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Compare card returns vs S&P 500' },
            { href: '/tools/value-dna', label: 'Card Value DNA', desc: 'Understand why a card is priced the way it is' },
            { href: '/tools/diversification', label: 'Portfolio Diversification', desc: 'Score your collection diversity' },
            { href: '/tools/card-matchmaker', label: 'Card Matchmaker', desc: 'Discover similar cards to ones you own' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/70 transition-colors">
              <div>
                <div className="text-white text-sm font-medium">{t.label}</div>
                <div className="text-gray-500 text-xs">{t.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-gray-900/50 border border-gray-800/50 rounded-xl">
              <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:text-emerald-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
