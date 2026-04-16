import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RookieRankingsClient from './RookieRankingsClient';

export const metadata: Metadata = {
  title: 'Rookie Card Rankings 2025 — Top Rookies to Collect Across All Sports | CardVault',
  description: 'Ranked list of the top 20 rookie cards to collect in 2025. Baseball, basketball, football, and hockey. Investment ratings, key cards, estimated values, risk levels, and expert analysis.',
  alternates: { canonical: './' },
  openGraph: {
    title: '2025 Rookie Card Rankings — Best Rookies to Invest In | CardVault',
    description: 'Top 20 rookie cards ranked across all sports. Investment ratings, values, and risk analysis.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '2025 Rookie Rankings | CardVault',
    description: 'Top 20 rookies to collect. S/A/B/C investment ratings. All 4 sports.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: '2025 Rookie Rankings' },
];

const faqItems = [
  {
    question: 'How are rookie rankings determined?',
    answer: 'Rankings are based on a combination of on-field performance, draft pedigree, card market demand, price trajectory, and long-term investment potential. S-rated rookies are generational talents with the highest ceilings and lowest risk. A-rated are strong investments. B-rated are solid value plays. C-rated are speculative.',
  },
  {
    question: 'When should I buy rookie cards?',
    answer: 'The best time to buy is usually after the initial hype dies down — typically 3-6 months after a player debut. However, for generational talents like Travis Hunter or Macklin Celebrini, waiting too long means paying a premium. Monitor our market tools for optimal entry points.',
  },
  {
    question: 'What does the investment rating mean?',
    answer: 'S-tier means near-certain long-term value appreciation (generational talent). A-tier means strong investment with favorable risk-reward. B-tier means solid value at current prices with moderate upside. C-tier means speculative — higher risk but potential for significant returns if the player breaks out.',
  },
  {
    question: 'Which rookie cards should I buy raw vs graded?',
    answer: 'For players ranked S or A, buy PSA 10 or BGS 9.5+ graded copies of their flagship rookie cards (Prizm, Topps Chrome, Young Guns). For B and C-tier players, buy raw copies at lower prices — you can always grade later if they break out. The grading ROI calculator can help you decide.',
  },
  {
    question: 'How often are rankings updated?',
    answer: 'Rankings are reviewed and updated as the sports seasons progress. Major events like the NFL Draft, NBA Draft, and midseason breakouts can cause significant ranking changes. Check back regularly for the latest analysis.',
  },
];

export default function RookieRankingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Top 20 Rookie Card Rankings 2025 — Best Rookies to Collect and Invest In',
        description: 'Expert rankings of the top 20 rookie cards across baseball, basketball, football, and hockey for 2025.',
        url: 'https://cardvault-two.vercel.app/rookie-rankings',
        datePublished: '2025-04-01',
        dateModified: new Date().toISOString(),
        author: { '@type': 'Organization', name: 'CardVault' },
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          2025 Rankings &middot; 4 Sports &middot; Top 20
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">2025 Rookie Card Rankings</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          The definitive ranking of the top 20 rookie cards to collect and invest in across baseball, basketball, football, and hockey. Investment ratings, estimated values, risk analysis, and expert picks.
        </p>
      </div>

      <RookieRankingsClient />

      {/* Investment Tips */}
      <div className="mt-12 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Rookie Investment Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Buy the Flagship Card', tip: 'Prizm (basketball/football), Topps Chrome (baseball), and Young Guns (hockey) are the flagship rookie cards. These hold value better than any other product.' },
            { title: 'Diversify Across Sports', tip: 'Do not put all your money in one sport. A diversified rookie portfolio across 3+ sports reduces risk from any single player injury or bust.' },
            { title: 'S-Tier = Safety', tip: 'S-rated rookies like Skenes, Hunter, and Celebrini are the blue chips. They cost more upfront but have the highest probability of long-term appreciation.' },
            { title: 'Watch the Risk Column', tip: 'Low-risk rookies have already proven production. Medium-risk players have the talent but need more runway. High-risk means you are betting on potential.' },
          ].map((t, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-amber-400 mt-0.5">&#x2022;</span>
              <div>
                <span className="text-white font-medium text-sm">{t.title}:</span>{' '}
                <span className="text-slate-400 text-sm">{t.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors">
                {f.question}
              </summary>
              <p className="text-slate-400 text-sm mt-2 pl-4 border-l-2 border-slate-700">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: '/guides/best-rookie-cards-2026', label: 'Best Rookie Cards 2026', desc: 'Full guide to rookie investing' },
          { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Should you grade your rookie?' },
          { href: '/tools/investment-calc', label: 'Investment Calculator', desc: 'Compare vs S&P 500, gold, Bitcoin' },
          { href: '/tools/prospect-tracker', label: 'Prospect Pipeline', desc: 'Track rising prospects' },
          { href: '/tools/value-projector', label: 'Value Projector', desc: 'Future value estimates' },
          { href: '/tools/portfolio', label: 'Fantasy Portfolio', desc: 'Build a rookie card portfolio' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-amber-700/50 transition-colors group">
            <span className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{link.label}</span>
            <span className="text-slate-500 text-xs block mt-0.5">{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
