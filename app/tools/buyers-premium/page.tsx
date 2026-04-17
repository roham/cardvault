import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BuyersPremiumClient from './BuyersPremiumClient';

export const metadata: Metadata = {
  title: "Buyer's Premium Calculator — Auction All-In Cost & Max Hammer | CardVault",
  description: "Free auction buyer's premium calculator for card buyers. Reverse-calc the maximum hammer you can bid given your total budget, or compute the true all-in cost after BP, sales tax, shipping, and grading surcharges. Built-in rate cards for 11 auction houses — Heritage, Goldin, PWCC, Lelands, REA, Memory Lane, Huggins & Scott, Fanatics Collect, eBay, Robert Edward, Love of the Game. Side-by-side house comparison, sales tax by state, insured shipping estimator.",
  openGraph: {
    title: "Buyer's Premium Calculator — CardVault",
    description: "Reverse-calc your max auction bid or compute all-in cost. 11 auction houses. BP + tax + shipping.",
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: "Buyer's Premium Calculator — CardVault",
    description: "Know your true all-in cost before you bid. 11 auction houses + BP rates + state sales tax.",
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: "Buyer's Premium Calculator" },
];

const faqItems = [
  {
    question: "What is a buyer's premium?",
    answer: "A buyer's premium (BP) is a percentage surcharge the auction house adds on top of the hammer price, paid by the winning bidder. On a $10,000 hammer with a 20% BP, the buyer writes a check for $12,000 — the extra $2,000 goes to the house as its revenue. BP rates in sports/TCG auctions typically range from 15% to 27%, though rates for super-high-end lots can be privately negotiated. BP is usually disclosed in the catalog terms but is missed by most new bidders, who anchor on the hammer price and forget the 20% add-on.",
  },
  {
    question: "Why does BP matter for budgeting?",
    answer: "If you have a hard ceiling of $10,000 to spend on a card and you bid up to $10,000 hammer on a 20% BP auction, your actual cost is $12,000 plus sales tax and shipping — you will have blown your budget by $2,500 or more. The calculator reverses the math: tell it your total all-in budget, and it returns the maximum hammer you can bid to land at or under your budget. This is the single most useful pre-bid discipline tool we ship.",
  },
  {
    question: "What BP rates do major card auction houses charge in 2026?",
    answer: "Heritage Auctions: 20% on lots below a tier threshold, typically 25% on sports/trading cards. Goldin (Fanatics-owned): 20% on most lots. PWCC Marketplace Premier: 17.5%. Lelands: 22%. Memory Lane Inc: 20%. Robert Edward Auctions (REA): 20%. Huggins & Scott: 22%. Fanatics Collect (buyer side): 15%. Love of the Game Auctions: 20%. eBay: no formal BP — fees embedded in listing side. Always verify on the current catalog terms page before bidding, as houses adjust rates periodically and some run promotional tiers.",
  },
  {
    question: "How does sales tax factor in?",
    answer: "Since South Dakota v. Wayfair (2018), all major auction houses now collect state sales tax from the buyer based on the shipping-destination state. Rates vary widely — Delaware, Montana, New Hampshire, Oregon charge zero; California 7.25-10.25% depending on county; Tennessee 7-9.75%; New York 4-8.875%; Texas 6.25-8.25%. Tax is applied to the HAMMER + BP combined total, NOT just the hammer. On a $10K hammer with 20% BP at 8% sales tax, you pay $12,960 total. The calculator includes a state dropdown with approximate state + typical-local combined rates; enter your exact local rate for precision.",
  },
  {
    question: "What about shipping for a high-value card?",
    answer: "Insured shipping for graded cards scales with insured value. Rough tiers: $0-1K card = $10-20 USPS Priority with insurance; $1-5K = $20-40 USPS Priority + Registered; $5-20K = $40-100 UPS/FedEx signature-required with declared value; $20-100K = $100-400 armored courier or hand-delivery option; $100K+ = private armored transit. Most major houses offer flat shipping in the $15-50 range for standard lots and negotiate separately for grails. The tool estimates by value tier but always check the house's shipping quote before bidding on a six-figure lot.",
  },
  {
    question: "Can I compare multiple auction houses side by side?",
    answer: "Yes — enter your target hammer and the tool fans out all 11 houses at once, showing all-in cost for each. Useful when you see the same card listed at two houses (say, a 1986 Fleer Jordan PSA 10 at Goldin and at Heritage) and want to pick the cheaper venue. Also useful when deciding where to consign the SELL side in exchange, because BP revenue at a house correlates with its ability to price-discover your lot — low-BP houses attract more bidders but capture less per-lot revenue, potentially leaving less marketing budget.",
  },
  {
    question: "What about additional fees I might not see?",
    answer: "Beyond BP + sales tax + shipping, watch for: payment-method surcharges (credit cards often add 2-3% on top at some houses — check-wire fees zero), high-end lot service charges on lots above threshold values, currency conversion if bidding cross-border (1-3% spread), and optional third-party grading or authentication add-ons if you ask the house to ship to PSA/BGS/SGC before delivery. The tool lets you toggle a credit-card surcharge and a grading add-on to see the full picture.",
  },
  {
    question: "Is a higher BP rate always worse for buyers?",
    answer: "Not always. High-BP houses (Heritage 25%, Lelands 22%) often run the biggest marketing machines, attracting more bidders — which in a liquid category can actually LOWER hammer prices because the market discovers a deeper bid stack. A 20% BP on a $8K hammer ($9,600 all-in) can beat a 15% BP on a $9K hammer ($10,350 all-in) from the same card at a less-trafficked house. The tool helps you reason about this by showing all-in cost rather than just BP rate. For liquid cards with 10+ public comps, pick the house with the most distribution. For thin-comp cards, lean toward lower BP because price discovery is weak either way.",
  },
];

export default function BuyersPremiumPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: "Buyer's Premium Calculator",
        description: "Auction buyer's premium calculator. Reverse-calc max hammer from budget, or compute all-in cost. 11 auction houses.",
        url: 'https://cardvault-two.vercel.app/tools/buyers-premium',
        applicationCategory: 'FinanceApplication',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>🔨</span>
          <span>Auction budgeting tool · P2 Tools · 157th tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          Buyer's Premium Calculator
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          Know your true all-in cost before you raise the paddle. Flip between two modes —
          reverse-calc the maximum hammer you can bid given a budget, or compute the full landed cost
          after BP, sales tax, shipping, and grading for a won lot. Side-by-side across 11 major
          auction houses.
        </p>
      </div>

      <BuyersPremiumClient />

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-start gap-4">
                <span>{f.question}</span>
                <span className="text-orange-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-slate-300 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/tools/reserve-price" className="bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Reserve Price Calculator</div>
            <div className="text-sm text-slate-400">Seller side — set auction reserves across 9 platforms</div>
          </Link>
          <Link href="/vault/proxy-bid-optimizer" className="bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Proxy Bid Optimizer</div>
            <div className="text-sm text-slate-400">Increment ladders + max-bid placement</div>
          </Link>
          <Link href="/vault/auction-sniper" className="bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Auction Sniper</div>
            <div className="text-sm text-slate-400">Time-of-auction bidding strategy</div>
          </Link>
          <Link href="/tools/fee-comparator" className="bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Marketplace Fee Comparator</div>
            <div className="text-sm text-slate-400">Compare net proceeds across 12 platforms</div>
          </Link>
          <Link href="/tools/cost-basis" className="bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Cost Basis Aggregator</div>
            <div className="text-sm text-slate-400">Multi-lot cost tracking + IRS methods</div>
          </Link>
          <Link href="/tools" className="bg-slate-900/60 border border-slate-800 hover:border-orange-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">All Tools →</div>
            <div className="text-sm text-slate-400">Browse 156+ card collecting tools</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
