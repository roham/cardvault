import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MonteCarloClient from './MonteCarloClient';

export const metadata: Metadata = {
  title: 'Card Monte Carlo Simulator — Price Outcome Distribution | CardVault',
  description: 'Simulate 10,000 possible price paths for any sports card using geometric Brownian motion. See the full distribution of outcomes — median, 5th/95th percentile, probability of gain, probability of hitting your target price. Free tool for card investors who want to understand risk, not just expected return.',
  openGraph: {
    title: 'Card Monte Carlo Simulator — CardVault',
    description: '10,000 simulated price paths. See the range of outcomes, not just the average. Free card investor tool.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Monte Carlo Simulator — CardVault',
    description: 'Simulate 10,000 price paths. Understand card investment risk.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Monte Carlo Simulator' },
];

const faqItems = [
  {
    question: 'What is a Monte Carlo simulation and why use it for cards?',
    answer: 'Monte Carlo simulation runs thousands of random price paths forward in time using a volatility model (geometric Brownian motion). Instead of showing a single "expected price" it shows the full distribution of possible outcomes — a 5% chance price falls below $X, a 50% chance price lands at $Y, a 5% chance price exceeds $Z. For card investors this is powerful: a card with a high expected return can still have a 30% chance of losing 40% of its value. One-number forecasts hide that risk; Monte Carlo reveals it.',
  },
  {
    question: 'How do I pick volatility and drift for my card?',
    answer: 'Volatility (annualized standard deviation of returns) typically ranges from 15% for blue-chip vintage (1952 Mantle) to 60%+ for speculative modern rookies. Drift (expected annual return) typically ranges from -5% (declining players) to +25% (hot rookies). Use the presets — Vintage Blue-Chip (15% vol, 6% drift), HoF Veteran (25% vol, 8%), Modern RC Established (35% vol, 10%), Modern RC Speculative (55% vol, 15%), Prospect Lottery Ticket (70% vol, 20% drift with fat tails). These are calibrated to realistic hobby ranges based on historical card-price data. You can override any preset.',
  },
  {
    question: 'Are simulation outputs predictions?',
    answer: 'No. This is a probability model, not a forecast. The simulation answers "given these assumptions about volatility and drift, what is the range of outcomes a year from now?" The assumptions are yours — if you believe LeBron has 40% volatility, the simulation shows what that implies. If actual volatility turns out to be 20%, reality will be tighter than the simulation shows. Use it to stress-test whether you are comfortable with the downside before buying, not to time the market.',
  },
  {
    question: 'What is geometric Brownian motion and is it the right model?',
    answer: 'Geometric Brownian motion is the mathematical framework used in Black-Scholes option pricing. It assumes log-returns are normally distributed, which means prices can never go negative (good for cards) and that percent moves are symmetric (a 10% gain is as likely as a 10% loss at mean drift). It is imperfect for cards because hobby prices can have "fat tails" (crash events, Top Rookie injuries) that GBM underweights. The model is still useful as a first-order risk sketch, but treat the 1st/99th percentiles as "slightly wider in reality."',
  },
  {
    question: 'Can I simulate a card I already own?',
    answer: 'Yes. Search any card from the 9,840-card CardVault database and the tool pre-fills its current estimated raw value as the starting price. Then pick a preset or set volatility/drift manually. You can also enter a custom starting price for graded copies (e.g., 350 for a PSA 9) and override the raw-based default.',
  },
  {
    question: 'What does the "Probability of reaching target price" mean?',
    answer: 'Set a target price (e.g., 2x your current value). The simulation counts how many of the 10,000 paths touch or exceed that target at any point during the time horizon (path-dependent). This is more useful than just checking the final price, because it captures "the card hit 2x, then pulled back" scenarios that a point-in-time check would miss.',
  },
];

export default function MonteCarloPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          PROBABILITY TOOL · 10,000 SIMULATIONS
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Card Monte Carlo Simulator
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400 sm:text-base">
          Pick a card, choose a volatility profile, run 10,000 simulated price paths. See the full distribution of outcomes — not just the expected price. Understand the downside risk before you buy.
        </p>
      </header>

      <MonteCarloClient />

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">How to read the results</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li><span className="font-semibold text-cyan-300">Median (P50):</span> half the paths end above this, half below. Your "middle case" outcome.</li>
          <li><span className="font-semibold text-cyan-300">5th percentile (P5):</span> pessimistic scenario. Only 5% of simulated outcomes are worse than this number.</li>
          <li><span className="font-semibold text-cyan-300">95th percentile (P95):</span> optimistic scenario. Only 5% of outcomes are better than this.</li>
          <li><span className="font-semibold text-cyan-300">Probability of gain:</span> share of paths ending above the starting price.</li>
          <li><span className="font-semibold text-cyan-300">Target hit %:</span> share of paths that touch or exceed your target price at any time during the horizon (path-dependent).</li>
          <li><span className="font-semibold text-cyan-300">Histogram:</span> shape of the final-price distribution. Wide and flat = high uncertainty. Tall and narrow = tight range.</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Preset volatility profiles</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { n: 'Vintage Blue-Chip', v: '15%', d: '6%', ex: '1952 Mantle · 1986 Fleer Jordan · 1933 Goudey Ruth' },
            { n: 'HoF Veteran', v: '25%', d: '8%', ex: 'Mike Trout RCs · Alex Ovechkin RC · Kobe auto' },
            { n: 'Modern RC — Established', v: '35%', d: '10%', ex: 'Luka Prizm · Herbert Prizm · Justin Jefferson Mosaic' },
            { n: 'Modern RC — Speculative', v: '55%', d: '15%', ex: "Bronny Prizm · Jayden Daniels Prizm · Jackson Chourio" },
            { n: 'Prospect Lottery', v: '70%', d: '20%', ex: 'Bowman Chrome 1st auto · Wyatt Langford · Paul Skenes' },
            { n: 'Pokémon Sealed (stable)', v: '20%', d: '7%', ex: 'Modern Booster Box · PSA 9 Charizard · Celebrations ETB' },
          ].map((p) => (
            <div key={p.n} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
              <div className="text-xs font-semibold text-cyan-300">{p.n}</div>
              <div className="mt-1 text-[11px] text-slate-500">Vol {p.v} · Drift {p.d}</div>
              <div className="mt-1 text-[11px] text-slate-400">{p.ex}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Frequently asked</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question}>
              <h3 className="text-sm font-semibold text-slate-200">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Related tools</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/flip-calc', label: 'Flip Calculator' },
            { href: '/tools/dca-calculator', label: 'DCA Calculator' },
            { href: '/tools', label: 'All Tools →' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Card Monte Carlo Simulator',
          url: 'https://cardvault-two.vercel.app/tools/monte-carlo',
          description:
            'Run 10,000 simulated price paths for any sports card using geometric Brownian motion. See the distribution of outcomes — median, 5th/95th percentile, probability of gain and target hit.',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </main>
  );
}
