import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CollectionReportClient from './CollectionReportClient';

export const metadata: Metadata = {
  title: 'Collection Report Card — Grade Your Card Collection A+ to F',
  description: 'Free collection report card tool. Grade your sports card collection across 8 dimensions: diversification, value density, grade quality, rookie ratio, vintage depth, growth potential, liquidity, and premium cards. Get a GPA score with personalized recommendations to improve your collection.',
  openGraph: {
    title: 'Collection Report Card — CardVault',
    description: 'Grade your card collection A+ to F across 8 dimensions. Get your GPA and personalized improvement plan.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Collection Report Card — CardVault',
    description: 'Grade your card collection across 8 dimensions. Free GPA calculator with recommendations.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Collection Report Card' },
];

const faqItems = [
  {
    question: 'How is my collection GPA calculated?',
    answer: 'Your collection is graded across 8 dimensions: Diversification (sport and era spread), Value Density (average card value), Grade Quality (percentage graded and average grade), Rookie Ratio (percentage of rookie cards), Vintage Depth (pre-1980 card representation), Growth Potential (active players and young stars), Liquidity (how easily you could sell), and Premium Cards (autographs and numbered parallels). Each dimension receives a letter grade (A+ to F) with a corresponding GPA value (4.0 to 0.0). Your overall GPA is the average across all 8 dimensions.',
  },
  {
    question: 'What makes a good card collection for investment?',
    answer: 'Investment-grade collections typically score well across: high rookie card ratio (40-60%), strong grading profile (50%+ graded at PSA 9 or better), multi-sport diversification (3+ sports), and good liquidity (popular players in popular sports). A GPA of 3.0 or higher across these investment-focused dimensions suggests a collection positioned for appreciation. The most important single factor is rookie cards of active stars — they drive 60-80% of long-term value.',
  },
  {
    question: 'Should I grade all my cards to improve my collection score?',
    answer: 'No. Grading only makes sense for cards worth $50+ raw where a high grade (PSA 9 or 10) would significantly increase value. Grading a $5 base card at $20-30 per submission is a net loss. Focus grading on: rookie cards of star players, vintage cards in excellent condition, and any card where the PSA 10 premium is 3x or more the raw price. A collection where 25-50% of cards are graded is considered optimal.',
  },
  {
    question: 'How much vintage should a balanced collection have?',
    answer: 'A well-balanced collection should have 10-25% vintage cards (pre-1980). Vintage cards provide stability — they hold value through market downturns because supply is fixed and demand is generational. Even 3-5 affordable vintage cards ($20-100 range) significantly improve your Vintage Depth score. Key eras to target: 1950s-1970s Topps baseball, 1960s-1970s Topps basketball, and 1950s-1970s Topps football.',
  },
  {
    question: 'What is the ideal rookie card percentage?',
    answer: 'For collectors focused on value appreciation, 30-50% rookie cards is the sweet spot. Rookie cards are the most liquid and most volatile — they spike on breakout performances, MVP awards, and championships. Below 20% rookies means your collection may underperform the market. Above 70% means heavy speculation risk. The ideal mix combines 40% rookies with 30% established star base cards and 30% vintage or premium cards for stability.',
  },
];

export default function CollectionReportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Collection Report Card',
        description: 'Grade your card collection across 8 dimensions with letter grades, GPA score, and personalized improvement recommendations.',
        url: 'https://cardvault-two.vercel.app/tools/collection-report',
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
          8 Dimensions &middot; Letter Grades &middot; GPA Score &middot; Action Plan &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Collection Report Card</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          How does your card collection stack up? Describe your collection and get graded A+ to F across
          8 key dimensions — diversification, value density, grade quality, rookie ratio, vintage depth,
          growth potential, liquidity, and premium cards.
        </p>
      </div>

      <CollectionReportClient />

      {/* FAQ Section */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700 rounded-xl">
              <summary className="cursor-pointer px-6 py-4 text-white font-medium list-none flex items-center justify-between">
                {f.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/diversification', label: 'Diversification Analyzer', desc: 'Deep dive into your collection spread' },
            { href: '/tools/heat-score', label: 'Collection Heat Score', desc: 'How hot is your collection right now?' },
            { href: '/tools/collection-value', label: 'Collection Value Calculator', desc: 'Calculate total collection worth' },
            { href: '/tools/portfolio-rebalancer', label: 'Portfolio Rebalancer', desc: 'Optimize your collection allocation' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Which cards to grade for max ROI' },
            { href: '/tools/roi-heatmap', label: 'ROI Heatmap', desc: 'Find the best grading opportunities' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-colors">
              <div>
                <span className="text-white text-sm font-medium">{t.label}</span>
                <span className="text-gray-500 text-xs block">{t.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="mb-12 prose prose-invert prose-sm max-w-none">
        <h2 className="text-xl font-bold text-white">How to Evaluate Your Card Collection</h2>
        <p className="text-gray-400">
          Whether you&apos;re a seasoned investor like Kai managing a six-figure portfolio, a returning collector like Dave
          rediscovering childhood cards with your kids, or a flipper like Marcus turning inventory weekly — understanding
          your collection&apos;s strengths and weaknesses is essential. The Collection Report Card analyzes 8 critical
          dimensions that determine both the current value and future potential of your card collection.
        </p>
        <p className="text-gray-400">
          <strong className="text-white">Diversification</strong> measures how spread your collection is across sports, eras, and players.
          Single-sport, single-era collections are vulnerable to market shifts. <strong className="text-white">Value Density</strong> tracks
          your average card value — higher density means fewer cards doing more work. <strong className="text-white">Grade Quality</strong> evaluates
          what percentage of your collection is professionally graded and at what average grade level. Graded cards
          command 2-10x premiums over raw equivalents.
        </p>
        <p className="text-gray-400">
          <strong className="text-white">Rookie Ratio</strong> is the engine of appreciation — rookie cards drive the majority of value movement
          in the hobby. <strong className="text-white">Vintage Depth</strong> provides stability through market cycles, as pre-1980 cards have
          fixed supply. <strong className="text-white">Growth Potential</strong> measures how much upside your collection has based on active players
          and young stars. <strong className="text-white">Liquidity</strong> estimates how quickly you could sell your collection at fair market value.
          <strong className="text-white"> Premium Cards</strong> counts your autographs and numbered parallels — the cards that command the highest
          collector interest.
        </p>
      </section>
    </div>
  );
}
