import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PowerPlaysClient from './PowerPlaysClient';

export const metadata: Metadata = {
  title: 'Card Market Power Plays — Daily BUY / SELL / HOLD Picks | CardVault',
  description: 'Daily curated BUY, SELL, and HOLD recommendations for sports cards. Confidence scores, risk levels, time horizons, and detailed reasoning — updated every day from 9,000+ cards.',
  openGraph: {
    title: 'Card Market Power Plays — CardVault',
    description: 'Daily BUY / SELL / HOLD picks with confidence scores and expert reasoning for sports card collectors.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Power Plays — CardVault',
    description: 'Daily BUY / SELL / HOLD picks with confidence scores for sports cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Power Plays' },
];

const faqItems = [
  {
    question: 'What are Card Market Power Plays?',
    answer: 'Power Plays are daily curated investment-style recommendations for sports cards. Each pick includes a BUY, SELL, or HOLD signal, a confidence score (1–5 stars), a risk level (Low/Medium/High), a time horizon, and a detailed reasoning paragraph. They refresh every day with a new date-seeded selection from our 9,000+ card database.',
  },
  {
    question: 'How are BUY, SELL, and HOLD signals determined?',
    answer: 'BUY signals favor rookie cards, lower-value cards with upside potential, and cards in rising sport markets. SELL signals lean toward high-value veteran cards in cooling segments. HOLD signals apply to established players with stable, moderate-value cards. Card attributes — year, rookie status, value tier, and sport — all factor into the signal.',
  },
  {
    question: 'What do confidence scores mean?',
    answer: 'Confidence (1–5 stars) reflects how strong the underlying data signal is. A 5-star pick has multiple reinforcing factors — e.g., a rookie card in a rising sport at a low price point. A 2-star pick has mixed signals. Higher confidence does not guarantee better results; it simply means the conviction behind the call is higher.',
  },
  {
    question: 'How should I use time horizons?',
    answer: 'Short (1–3 months) plays are tactical — often tied to a season, upcoming draft, or short-term catalyst. Medium (3–12 months) plays reflect developing storylines or gradual price appreciation. Long (1+ year) plays are strategic holds where the thesis may take time to play out, such as a prospect maturing into a star.',
  },
  {
    question: 'Is this financial advice?',
    answer: 'No. Power Plays are generated for entertainment and educational purposes only. Card values can rise or fall based on many unpredictable factors. Always conduct your own research before buying or selling. Past performance of any card or recommendation is not indicative of future results.',
  },
];

export default function PowerPlaysPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        name: 'Card Market Power Plays',
        description: 'Daily BUY, SELL, and HOLD recommendations for sports cards with confidence scores, risk levels, and detailed reasoning.',
        url: 'https://cardvault-two.vercel.app/power-plays',
        publisher: {
          '@type': 'Organization',
          name: 'CardVault',
          url: 'https://cardvault-two.vercel.app',
        },
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Updated daily · Date-seeded picks
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Power Plays</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Five curated BUY, SELL, and HOLD recommendations from our 9,000+ card database — with confidence scores, risk levels, time horizons, and detailed reasoning.
        </p>
      </div>

      <PowerPlaysClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-zinc-900/40 border border-zinc-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-zinc-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-white mb-4">Related Market Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/market-movers" className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Market Movers</h3>
            <p className="text-xs text-zinc-400 mt-1">Today&#39;s top gainers and losers.</p>
          </Link>
          <Link href="/fear-greed" className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Fear &amp; Greed Index</h3>
            <p className="text-xs text-zinc-400 mt-1">Collector sentiment gauge — fear or euphoria?</p>
          </Link>
          <Link href="/market-radar" className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Market Radar</h3>
            <p className="text-xs text-zinc-400 mt-1">Live price-spike and deal scanner.</p>
          </Link>
          <Link href="/daily-flip" className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">The Daily Flip</h3>
            <p className="text-xs text-zinc-400 mt-1">Morning brief — picks, movers, catalysts.</p>
          </Link>
          <Link href="/card-wire" className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Card Wire</h3>
            <p className="text-xs text-zinc-400 mt-1">Live market news wire and trade ticker.</p>
          </Link>
          <Link href="/market-analysis" className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
            <h3 className="text-sm font-semibold text-white">Daily Analysis</h3>
            <p className="text-xs text-zinc-400 mt-1">What moved today and why — AI intelligence.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
