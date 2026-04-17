import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeEqualizerClient from './TradeEqualizerClient';

export const metadata: Metadata = {
  title: 'Trade Equalizer — Multi-Card Trade with Cash Boot Calculator | CardVault',
  description: 'Free multi-card trade fairness calculator for collector swaps. Balances N cards on each side plus cash boot, surfaces per-card FMV delta, and flags tax-realization events per IRC §1031 (no longer applies to collectibles post-TCJA) and §1001 (like-kind-style basis tracking).',
  openGraph: {
    title: 'Trade Equalizer — CardVault',
    description: 'Multi-card trade fairness + cash boot + tax-realization flagger.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Trade Equalizer — CardVault',
    description: 'Fair-value trade calculator with cash boot and tax-realization flags.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Trade Equalizer' },
];

const faqItems = [
  {
    question: 'What is a card trade with "cash boot"?',
    answer: 'A trade where one side gives cards PLUS cash (the "boot") to match the value of cards received. If your side has $3,000 in FMV and their side has $4,200, you owe $1,200 cash boot to equalize. Cash boot makes trades possible when the two sides\' card values don\'t match exactly — which is the common case. The Trade Equalizer computes the boot amount needed from either side to reach a fair balance, given per-card FMV inputs.',
  },
  {
    question: 'Are card trades a taxable event?',
    answer: 'YES, in nearly all cases, as of April 2026. The Tax Cuts & Jobs Act of 2017 (effective 2018) eliminated IRC §1031 like-kind exchange treatment for everything EXCEPT real estate. Pre-2018, a collectible-for-collectible swap could qualify for deferred recognition under §1031 (no tax due at trade time). Post-TCJA, every card-for-card trade is treated under IRC §1001 as a simultaneous SALE of your cards at FMV + PURCHASE of their cards at FMV. You realize gain/loss on YOUR side equal to (FMV of cards given - your cost basis in those cards). The tool computes this realized gain/loss per side of the trade.',
  },
  {
    question: 'What about the cash boot side?',
    answer: 'The party RECEIVING cash boot realizes additional gain equal to the cash received (treated as part of the sale proceeds). Example: You give a $5,000 FMV card ($2,000 basis) + $1,500 cash for their $6,500 FMV card. Your realized proceeds = $5,000 (FMV of your card given). Your realized gain = $5,000 - $2,000 = $3,000 long-term capital gain (assuming you held >12 months). Their realized proceeds = $6,500 (their card FMV, equal to the $5,000 your card + $1,500 cash they received). Their realized gain = $6,500 - their basis. Both parties have tax events; cash boot simply transfers cash in addition to the card exchange.',
  },
  {
    question: 'How is FMV determined in a trade?',
    answer: 'FMV should be the documentable fair market value of each card at the date of trade — typically the most recent public sale of a comparable card on a reputable platform (eBay sold listings, PWCC, Goldin, Heritage, PSA Price Guide). For graded cards: use recent same-grade sales within 60 days. For raw cards: use a PSA Price Guide estimate adjusted for condition. The IRS requires "reasonable assessment" but does NOT publish specific methodology for collectibles — the burden of reasonableness is on the taxpayer. The tool lets you manually enter FMV for each card side; use consistent methodology across both sides to stay defensible.',
  },
  {
    question: 'What if the trade is "even" with no cash?',
    answer: 'Even trades ($5,000 card for $5,000 card) are STILL taxable events. Each side realizes gain/loss equal to (FMV of cards given - cost basis). The IRS does not care that no cash changed hands — you effectively sold your card at FMV and bought theirs. This is a common misconception among collectors: "I traded, I didn\'t sell, no tax." False. Post-TCJA, every card-to-card trade creates two reportable transactions per Schedule D. Track them the same way you track cash sales.',
  },
  {
    question: 'What is a 3-way or multi-card trade?',
    answer: 'A 3-way trade (you give A, they give B, third party gives C) is structurally 3 bilateral trades happening in sequence. Each pair of trades creates its own gain/loss realization. The tool handles 2-party trades with up to 10 cards per side. For 3+ party trades, decompose into bilateral sub-trades and run each through the tool. Multi-card trades (10 cards for 3 cards, for example) are handled natively — each card on each side has its own FMV + basis and its own realized gain/loss.',
  },
  {
    question: 'What about holding-period on received cards?',
    answer: 'CRITICAL: cards RECEIVED in a trade start a FRESH holding period on the trade date — you do NOT inherit the holding period of the card you gave up. This matters for long-term capital gains qualification. If you receive a card in a trade today, you must hold it for 12+ months before qualifying for the 28% collectibles long-term rate on a future sale. The tool flags this reset. Cost basis of received cards = FMV at trade date (not the other party\'s basis — that is separate from your treatment).',
  },
  {
    question: 'How does this pair with other CardVault tools?',
    answer: 'Trade Equalizer pairs with: COST BASIS AGGREGATOR (look up the basis of the specific lot you are giving away), SELL-BY DATE TRACKER (check if your side\'s cards are past LTCG crossover before trading — otherwise you trigger short-term gains), TRADE CONTRACT GENERATOR (paper-trail the trade with both parties\' signatures), TAX CALCULATOR (compute the tax owed on the realized gains from the trade). Full workflow: price-check → LTCG-check → equalize → contract → tax-report.',
  },
];

export default function TradeEqualizerPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Trade Equalizer',
        description: 'Multi-card trade fairness calculator with cash boot and per-side realized-gain computation per IRC §1001.',
        url: 'https://cardvault-two.vercel.app/vault/trade-equalizer',
        applicationCategory: 'FinanceApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-lime-950/60 border border-lime-800/50 text-lime-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>⚖️</span>
          Multi-card trade · Cash boot · IRC §1001 realization
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Trade Equalizer</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          List your cards and theirs, add cost basis, see the fair-value delta, cash boot needed, and realized gain/loss
          per side — because every card-for-card trade is a taxable event under IRC §1001 post-TCJA.
        </p>
      </div>

      <TradeEqualizerClient />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/vault/trade-contract" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Trade Contract Generator →</div>
          <div className="text-xs text-slate-400">Paper-trail the trade with both parties&apos; signatures.</div>
        </Link>
        <Link href="/tools/cost-basis" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Cost Basis Aggregator →</div>
          <div className="text-xs text-slate-400">Look up specific-lot cost basis before filling in the trade.</div>
        </Link>
        <Link href="/tools/sell-by" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Sell-By Date Tracker →</div>
          <div className="text-xs text-slate-400">Check LTCG status before trading to avoid short-term realization.</div>
        </Link>
        <Link href="/tools/tax-calc" className="block bg-slate-900/60 border border-slate-800 hover:border-lime-700 rounded-lg p-4 transition">
          <div className="text-sm font-semibold text-white mb-1">Capital Gains Tax Calculator →</div>
          <div className="text-xs text-slate-400">Compute tax owed on the realized gains from the trade.</div>
        </Link>
      </div>

      <div className="mt-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group border-b border-slate-800 pb-3 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold text-white py-2 hover:text-lime-300 transition">
                {f.question}
              </summary>
              <div className="text-sm text-slate-300 leading-relaxed mt-2 pl-2">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-xs text-slate-500">
        Disclaimer: CardVault is not a tax advisor. Methodology references IRC §1001 (realization), §1031 (like-kind, no
        longer applies to collectibles post-TCJA 2018), and §1(h)(4) (28% collectibles LTCG cap) as of April 2026.
        State tax treatment varies. Consult a qualified CPA before filing.
      </div>
    </div>
  );
}
