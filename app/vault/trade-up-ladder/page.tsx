import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeUpLadderClient from './TradeUpLadderClient';

export const metadata: Metadata = {
  title: 'Card Trade-Up Ladder Planner — Trade Your Way to a Grail | CardVault',
  description: 'Plan a multi-step trade-up route from a low-value card to a grail card. Set your starting value and target, pick your pace, and get a realistic step-by-step ladder with card category suggestions, estimated days per step, and success probability per rung. The classic "one red paperclip" strategy, applied to the hobby.',
  openGraph: {
    title: 'Card Trade-Up Ladder Planner — CardVault',
    description: 'Build a realistic multi-step trade ladder from a $5 common to a $5K grail.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Trade-Up Ladder Planner — CardVault',
    description: 'Plan your trade-up route from common to grail with realistic step math.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Trade-Up Ladder' },
];

const faqItems = [
  {
    question: 'What is a trade-up ladder?',
    answer: 'A trade-up ladder is a chain of sequential trades, each swapping a smaller-value card for a larger-value one, until you reach a target "grail" card that would have been unaffordable to buy outright. Collectors have done this informally for decades — you trade a $50 rookie for a $100 lot, then flip the lot into a $200 PSA 9, and so on. Done patiently, a $25 base rookie can become a $5,000 graded vintage over 12–24 months. The ladder is the plan that keeps each trade intentional rather than opportunistic.',
  },
  {
    question: 'Is this realistic or wishful thinking?',
    answer: 'Realistic IF you accept three constraints: (1) each step costs time — 15 to 60 days per trade depending on how patient you are about finding fair swaps, (2) each step has a slippage cost of 5–15% from fees, shipping, and trade-fairness rounding, (3) each step has a non-zero failure rate where the market shifts under you. A 6-step ladder with 85% per-step success has a ~38% all-the-way success rate. Calibrate expectations: you may not finish the ladder on the first try, but every completed step still leaves you with a more valuable card than you started with.',
  },
  {
    question: 'How do I find trade partners at each step?',
    answer: 'Reddit r/sportscards and r/pkmntcgcollections run weekly trade threads. Instagram DMs are the informal hobby trading floor. Facebook groups ("[Sport] Card Traders", regional hobby groups). Card shows are trade-heavy — dedicated trade nights at local LCSs. Whatnot live streams occasionally run trade-only shows. Discord servers for specific players and sets. The higher the ladder value, the narrower the partner pool — at $10K+ you are mostly working with established collectors and auction house consignment paths, not random Reddit traders.',
  },
  {
    question: 'Should I take cash on top in trades?',
    answer: 'Cash-boot trades (swap my cards + $X cash for your card) are how the ladder bridges uneven trades. Standard: if your card is worth 80–90% of theirs, offer cash to bridge the gap. Most trade partners accept boot up to ~25% of the total trade value. Beyond that, a pure cash purchase is usually cleaner. Document boot explicitly in the trade record — boot creates tax implications (IRS treats it as partial sale). For simple ladders, aim for trades within 10% value symmetry and avoid boot.',
  },
  {
    question: 'What about grading on the ladder?',
    answer: 'Grading is a ladder accelerator when done well and a ladder destroyer when done poorly. Submitting a raw card that grades PSA 10 can triple the value in a single step without a trade. Submitting a raw card that comes back PSA 8 can tank the value below what you paid. Rule: only grade cards that have strong centering, no visible defects under a loupe, and where the PSA 10 jump is a documented 3–5× multiplier. Graded-to-graded crossover (BGS to PSA) is also a ladder mechanism, but sub-grade specificity matters.',
  },
  {
    question: 'How many steps should my ladder have?',
    answer: 'Depends on the value gap. A $25-to-$500 ladder is 3–4 steps at ~2× per step. A $5-to-$5,000 ladder is 6–8 steps at ~2× per step. More steps = more total slippage (each step costs 5–15%), but larger per-step multipliers are harder to find fair trade partners for. Sweet spot: 2× to 2.5× per step, 4–6 steps total. Aggressive ladders (3× per step) work at the lower end but break down above $1,000 as the buyer pool thins.',
  },
  {
    question: 'Can I ladder across categories (sports to Pokémon)?',
    answer: 'Yes and often wisely. Cross-category trades open up non-overlapping collector pools — someone who wants a graded Charizard but has a Jordan rookie they are ready to move. The ladder benefits when you are not competing with other laddering collectors in the same narrow subcategory. Downside: cross-category price comparisons are fuzzier (Pokémon grades and conditions trade differently from sports), so double-check value estimates. A good ladder is mode-agnostic: base card → graded Pokémon → graded football RC → vintage HOFer.',
  },
  {
    question: 'What kills a ladder mid-climb?',
    answer: 'Five common killers: (1) IMPATIENCE — rushing to the next step means accepting bad trades that silently drop ladder value, (2) MARKET DOWNTURN — a 20% sport-wide correction mid-climb means your $500 rung is suddenly a $400 rung, (3) FAKE CARDS — one authenticity fraud mid-ladder can reset you to zero, (4) GRADING WHIFF — paid $200 to grade a card that came back a 7 instead of 9, (5) EGO ATTACHMENT — you stop trading up because the rung you hold is a beloved card, not because the math changed. Plan the ladder end before the first trade; you will not exit otherwise.',
  },
];

export default function TradeUpLadderPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Multi-step trade planner
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
          Trade-Up Ladder Planner
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Set a starting value and a target grail. Get a realistic step-by-step ladder with per-rung card categories, estimated days per step, cumulative time, and compounded success probability. The classic &ldquo;one red paperclip&rdquo; strategy, engineered for the hobby.
        </p>
      </div>

      <TradeUpLadderClient />

      <section className="mt-14 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">How the ladder math works</h2>
        <div className="grid md:grid-cols-2 gap-5 text-sm text-slate-300">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="text-emerald-400 font-semibold mb-2">Step multiplier</div>
            <p className="leading-relaxed">Patient pace uses 1.6&times; per step (safer, easier partners). Balanced uses 2.2&times; (the hobby sweet spot). Aggressive uses 3.0&times; (fewer steps but narrower partner pool above $500).</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="text-emerald-400 font-semibold mb-2">Days per step</div>
            <p className="leading-relaxed">Patient: 45d to find a genuinely fair swap. Balanced: 28d typical. Aggressive: 18d but the per-step success rate drops meaningfully.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="text-emerald-400 font-semibold mb-2">Slippage per step</div>
            <p className="leading-relaxed">Every trade loses roughly 5-12% to fees, shipping, trade-fairness rounding, or a partner who drives a hard bargain. Slippage compounds — an 8-step ladder with 10% slippage loses ~57% of nominal value.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="text-emerald-400 font-semibold mb-2">Success probability</div>
            <p className="leading-relaxed">Patient trades complete 92% of the time. Balanced 85%. Aggressive 72%. Compounds across N steps: Balanced&times;6 = 0.85^6 = 38% all-the-way. Expect to restart a rung or two.</p>
          </div>
        </div>
      </section>

      <section className="mt-10 bg-slate-900/40 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-5">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
              <summary className="cursor-pointer list-none px-4 py-3 text-slate-200 font-medium flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                <span>{item.question}</span>
                <span className="text-emerald-400 text-lg group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-4 py-3 text-sm text-slate-400 leading-relaxed border-t border-slate-800">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Link href="/vault/bill-of-sale" className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-emerald-700 transition-colors">
          <div className="text-xs text-emerald-400 font-semibold mb-1">Document</div>
          <div className="text-sm text-slate-200 font-medium">Bill of Sale Generator</div>
        </Link>
        <Link href="/vault/trade-contract" className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-emerald-700 transition-colors">
          <div className="text-xs text-emerald-400 font-semibold mb-1">Document</div>
          <div className="text-sm text-slate-200 font-medium">Trade Contract</div>
        </Link>
        <Link href="/trade-hub" className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-emerald-700 transition-colors">
          <div className="text-xs text-emerald-400 font-semibold mb-1">Platform</div>
          <div className="text-sm text-slate-200 font-medium">Trade Hub</div>
        </Link>
        <Link href="/tools/trade-evaluator" className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-emerald-700 transition-colors">
          <div className="text-xs text-emerald-400 font-semibold mb-1">Tool</div>
          <div className="text-sm text-slate-200 font-medium">Trade Evaluator</div>
        </Link>
        <Link href="/tools/fee-calculator" className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-emerald-700 transition-colors">
          <div className="text-xs text-emerald-400 font-semibold mb-1">Tool</div>
          <div className="text-sm text-slate-200 font-medium">Platform Fee Calculator</div>
        </Link>
        <Link href="/vault/goals" className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 hover:border-emerald-700 transition-colors">
          <div className="text-xs text-emerald-400 font-semibold mb-1">Vault</div>
          <div className="text-sm text-slate-200 font-medium">Collection Goals</div>
        </Link>
      </section>

      <div className="mt-10 text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-lg p-4">
        <span className="font-semibold">Planning tool only.</span> Step math is an educational model based on typical hobby trade dynamics. Actual trade outcomes depend on market timing, partner availability, card authenticity, and grading results. Use this as a strategic reference, not an investment guarantee. Card values fluctuate and a ladder that looks viable today may require mid-course correction in a changing market.
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Card Trade-Up Ladder Planner',
          url: 'https://cardvault-two.vercel.app/vault/trade-up-ladder',
          description:
            'Plan a multi-step card trade ladder from a low-value starting card to a target grail. Models step multiplier, days per step, slippage, and compound success probability.',
          applicationCategory: 'BusinessApplication',
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
