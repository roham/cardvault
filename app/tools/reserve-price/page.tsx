import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ReservePriceClient from './ReservePriceClient';

export const metadata: Metadata = {
  title: 'Reserve Price Calculator — Set Auction Reserves & Starting Bids | CardVault',
  description: 'Free auction reserve-price calculator for card consignors and eBay sellers. Input FMV, platform, and risk tolerance → get a recommended reserve, starting bid, break-even price, and 3-scenario proceeds table. Covers 9 major platforms with platform-specific fee tables and reserve-fee warnings.',
  openGraph: {
    title: 'Reserve Price Calculator — CardVault',
    description: 'Free reserve-price + starting-bid + break-even calculator for auction consignors. 9 platforms.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Reserve Price Calculator — CardVault',
    description: 'Set auction reserves smartly. FMV → reserve + starting bid + break-even + 3-scenario EV.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Reserve Price Calculator' },
];

const faqItems = [
  {
    question: 'What is an auction reserve price?',
    answer: 'A reserve is the minimum price the seller is willing to accept. If bidding ends below the reserve, the lot does not sell (passes), and the seller owes the house a pass-through or unsold-lot fee on most platforms. If bidding clears the reserve, the lot sells at the high bid. Reserves protect sellers from a "cold room" (auction with sparse bidding) but signal caution to bidders, which can suppress bids. Setting the reserve correctly is the central consignor skill — too high and you kill momentum; too low and you give away a floor that smart bidders will probe.',
  },
  {
    question: 'How should I set the reserve?',
    answer: 'The tool follows a risk-tolerance model: Protective = reserve at 80-85% of FMV (rarely passes, captures most upside), Balanced = reserve at 65-70% of FMV (industry standard for confident lots), Aggressive = reserve at 45-55% of FMV (accepts pass risk to attract more early bids and a hot-room multiplier). Your choice should depend on lot LIQUIDITY (can you re-list easily?), TIMING (do you need cash now?), and MARKET TEMPERATURE (is the category hot or cold?). Protective is right when you have time and the category is cold. Aggressive is right when you want the lot to breathe and attract multi-party bidding.',
  },
  {
    question: 'What is the starting bid, and why is it different from the reserve?',
    answer: 'The starting bid is the price where bidding begins — it is PUBLIC and visible to all bidders. The reserve is often UNKNOWN to bidders (shown as "Reserve Not Met" until cleared). Setting a low starting bid (e.g. $1, or 10% of FMV) encourages many bidders to enter the auction early, building momentum and social proof. The reserve then does the protective work silently. Industry rule of thumb: starting bid at 5-15% of FMV, reserve at 50-85% of FMV depending on risk tolerance. A common mistake is setting the starting bid equal to the reserve, which kills momentum.',
  },
  {
    question: 'Why does break-even differ from the reserve?',
    answer: 'Break-even is the hammer price at which your NET PROCEEDS (after all fees, shipping, payment processing) equal your cost basis. This is the true floor — if the hammer lands at break-even, you have zero profit and zero loss. Reserve and break-even are different: reserve is what you will ACCEPT (a negotiating floor), break-even is what MAKES YOU WHOLE (an economic floor). Ideally reserve ≥ break-even; if your cost basis is high, the tool flags when a chosen risk tolerance would set reserve BELOW break-even, which means you could sell at a loss even if the reserve is met.',
  },
  {
    question: 'Does the platform matter?',
    answer: 'Yes — fee structures vary dramatically. eBay: 13-15% FVF + payment fee. Whatnot: 8% seller fee + 2.9% payment. Goldin: 20% buyer premium + 10-15% seller commission (offset). Heritage: 20% buyer premium + tiered seller commission (0-20%). PWCC: 17.5% buyer + 20% seller (Premier). Fanatics Collect: 15% buyer + 10% seller. Mercari: 10% + payment. MySlabs: 3% + payment. OfferUp: 12.9% + payment. High-premium houses (Goldin/Heritage/PWCC) capture more BUYER money, which means the hammer is LOWER than what the buyer pays — you have to reverse-engineer your reserve against the house-specific schedule.',
  },
  {
    question: 'What about the "reserve fee" some houses charge?',
    answer: 'Several auction houses charge a fee to set a reserve on your lot — this fee applies whether or not the lot sells. Heritage: 3% of reserve for reserves above $5K. PWCC: modest reserve surcharge on Premier auctions. Goldin: negotiated case-by-case on high-end lots. eBay: reserve available but only for listings above certain price thresholds. Whatnot: reserves not supported (all auctions are no-reserve live). The tool flags house-specific reserve-fee warnings. A reserve fee below 3% of reserve is typically absorbable; above that, consider a no-reserve auction with an aggressive starting bid instead.',
  },
  {
    question: 'How do I read the 3-scenario table?',
    answer: 'The tool shows three scenarios: UNDERSELL (hammer lands at 60% of FMV — cold room, limited bidders), TARGET (hammer at 100% FMV — fair market outcome), OUTPERFORM (hammer at 120% FMV — hot room, competitive bidding). Each row shows hammer price, seller fees taken, net proceeds to you, and whether the scenario clears your reserve and break-even. If UNDERSELL clears both, you are very protected. If OUTPERFORM is barely ahead of TARGET, the platform is fee-heavy and you may net more on a lower-fee venue. Use the table to stress-test your choices.',
  },
  {
    question: 'When should I NOT use a reserve?',
    answer: 'No-reserve auctions typically attract MORE bidders (no fear of "why bid if it won\'t sell"), MORE social-media spotlight (collectors love watching no-reserve auctions), and MORE final-moment sniping. The right time for no-reserve: (1) you have a low cost basis and will accept any reasonable outcome, (2) you want maximum reach and momentum, (3) you have multiple copies and one no-reserve lot serves as a market-maker for the others, (4) the platform penalizes reserves heavily via fees. Don\'t use no-reserve for: grails you only have one of, cards with thin liquidity (fewer than 10 closed comps in 90 days), or cards where one below-FMV sale would tank the public comp line.',
  },
];

export default function ReservePricePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Reserve Price Calculator',
        description: 'Auction reserve-price, starting-bid, and break-even calculator for card consignors. 9 major platforms.',
        url: 'https://cardvault-two.vercel.app/tools/reserve-price',
        applicationCategory: 'FinanceApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>🎯</span>
          <span>Auction tactical tool · P2 Tools · 150th tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          Reserve Price Calculator
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Set your auction reserve and starting bid with confidence. Input your FMV, pick a platform,
          choose a risk tolerance — get a recommended reserve, suggested starting bid, true break-even
          price, and a 3-scenario proceeds table across 9 major card auction venues.
        </p>
      </div>

      <ReservePriceClient />

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-start gap-4">
                <span>{f.question}</span>
                <span className="text-sky-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/tools/best-offer" className="bg-slate-900/60 border border-slate-800 hover:border-sky-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Best Offer Calculator</div>
            <div className="text-sm text-slate-400">Seller-side Accept / Counter / Reject engine</div>
          </Link>
          <Link href="/tools/fee-comparator" className="bg-slate-900/60 border border-slate-800 hover:border-sky-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Marketplace Fee Comparator</div>
            <div className="text-sm text-slate-400">Compare net proceeds across 12 platforms</div>
          </Link>
          <Link href="/vault/auction-sniper" className="bg-slate-900/60 border border-slate-800 hover:border-sky-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Auction Sniper</div>
            <div className="text-sm text-slate-400">Time-of-auction bidding strategy</div>
          </Link>
          <Link href="/vault/consignment-agreement" className="bg-slate-900/60 border border-slate-800 hover:border-sky-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Consignment Agreement</div>
            <div className="text-sm text-slate-400">Draft a consignor-auction contract</div>
          </Link>
          <Link href="/vault/escrow-letter" className="bg-slate-900/60 border border-slate-800 hover:border-sky-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Escrow Letter Generator</div>
            <div className="text-sm text-slate-400">Paper trail for high-value transactions</div>
          </Link>
          <Link href="/tools" className="bg-slate-900/60 border border-slate-800 hover:border-sky-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">All Tools →</div>
            <div className="text-sm text-slate-400">Browse 150+ card collecting tools</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
