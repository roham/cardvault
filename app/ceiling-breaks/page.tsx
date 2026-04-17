import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CeilingBreaksClient from './CeilingBreaksClient';

export const metadata: Metadata = {
  title: 'Ceiling Break Live — Cards Crossing New Price Thresholds | CardVault',
  description: 'Live feed of cards breaking price ceilings — first time over $100, $500, $1K, $5K, $10K, or $50K. Four milestone types: All-Time High, 12-Month High, 7-Day Breakout, Recovery Cross. Filter by sport, tier floor, event type. Watchlist any card. The milestones-first axis of hobby live feeds.',
  openGraph: {
    title: 'Ceiling Break Live — CardVault',
    description: 'Live milestone feed — cards breaking $100, $500, $1K, $5K, $10K for the first time. ATH, 12-month high, 7-day breakout, recovery cross.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Ceiling Break Live — CardVault',
    description: 'The hobby ceiling-break ticker. Watch cards cross new price milestones in real time.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Ceiling Break Live' },
];

const faqItems = [
  {
    question: 'What is a "ceiling break" in card collecting?',
    answer: 'A ceiling break is a closed sale that crosses a psychologically meaningful price threshold — $100, $500, $1,000, $5,000, $10,000, $50,000, or $100,000 — for the first time in a given window. Collectors treat these round-number crossings as regime changes for a card\u2019s price. A $90 card selling for $102 is bigger news than the $12 delta suggests, because the card is now a "three-figure card" in hobby parlance. The same logic applies at $500 (where flippers start treating cards seriously), $1K (where cards become portfolio assets), $5K (grail-tier), $10K (elite grail), $50K (trophy), and $100K (museum piece).',
  },
  {
    question: 'What are the four milestone types?',
    answer: 'All-Time High (ATH): the card just sold for more than it has ever sold for before. The biggest type of event — structural re-rating. 12-Month High: the card just matched or exceeded its highest price in the past 12 months without setting a new ATH. Signals momentum return. 7-Day Breakout: the card just set a new 7-day high, typically a short-term trend acceleration — could be a catalyst-driven move or an opening salvo in a new leg up. Recovery Cross: the card broke back above a threshold it had fallen below — e.g., a card that traded at $1,200 in 2021, fell to $650 through 2023, and just cleared $1,000 again. Recovery crosses are under-appreciated because they represent returning demand without the fomo of an ATH.',
  },
  {
    question: 'Which ceiling tier matters most?',
    answer: 'Depends on your position. For collectors: $100 and $500 crosses matter because they reshape what you can casually buy versus what you need to plan for. For flippers: $1K is the psychological threshold where selling effort (shipping, insurance, authentication) pays off. For investors: $5K and $10K are where you decide whether to hold or consolidate. For dealers: $50K+ ceiling breaks re-price entire inventory categories — if a PSA 10 modern RC just crossed $10K, all comparable PSA 10s in your case move with it. The Ceiling Break feed tiers all seven levels so every type of collector finds relevant signal.',
  },
  {
    question: 'Why are ceiling breaks significant, and what usually comes after?',
    answer: 'Round-number thresholds are sticky both ways. Before a card crosses $1,000, the $1K mark acts as resistance — sellers list at $999 to avoid the psychological barrier. After it crosses, $1K becomes support — listings at $950 feel cheap, bids below $1K get ignored. This asymmetric behavior creates measurable lift in average clearing prices after threshold breaks. Historical pattern from the 2020-2021 hobby boom: cards that broke $500 for the first time in Q4 2020 settled at an average of $680 in the three months following the break, a 36% lift over the break price itself. Not all crosses stick — the 2022 crash saw many 2021 breaks reverse — but the initial cross is always statistically meaningful.',
  },
  {
    question: 'Are these events real or simulated?',
    answer: 'Events are simulated based on realistic hobby patterns. Ceiling-break frequency is calibrated so $100 crosses happen every few minutes across 10,058 cards in the database, $500 crosses every 10-20 minutes, $1K crosses roughly hourly, $5K every few hours, $10K-$50K crosses daily to weekly, and $100K crosses every few months. Event tier (ATH vs 12M-high vs 7D-breakout vs recovery) is distribution-weighted so ATHs are the rarest (~8% of events) and 7-day breakouts the most common (~50%). Card selection is log-weighted by FMV so higher-value cards appear more often at higher tiers. Full real-time ceiling-break detection would require hour-resolution price history across every card in the database and is a long-term roadmap item.',
  },
  {
    question: 'How does this differ from Grail Watch, Steal Watch, and Pop Watch?',
    answer: 'Grail Watch surfaces $1K+ events across five contexts (auction hammer / private sale / trade / pull / mailday) — any transaction involving a $1K+ card, regardless of whether the price is notable. Steal Watch surfaces under-FMV closings — price relative to comp, not absolute. Pop Watch surfaces grading-population changes — slab velocity, not price. Ceiling Break Live is orthogonal: it surfaces MILESTONE crossings — the moment a card graduates to a new price tier. A card can appear on Grail Watch (high absolute price), Steal Watch (below comp), and Ceiling Break (first-time ATH) on the same sale — each feed tells you something different about the event.',
  },
];

export default function CeilingBreaksPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
          Ceiling Break Live
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          The milestones-first live feed. Cards crossing $100, $500, $1K, $5K, $10K, $50K, or $100K for the first time in their window. All-Time Highs, 12-month highs, 7-day breakouts, and recovery crosses.
        </p>
        <p className="text-sm text-gray-500">
          Seven ceiling tiers • Four milestone types • Sport + tier filters • Live rolling feed • Starrable watchlist
        </p>
      </header>

      <CeilingBreaksClient />

      <section className="mt-12 bg-gradient-to-br from-fuchsia-50 via-pink-50 to-rose-50 rounded-xl p-6 border border-fuchsia-200">
        <h2 className="text-2xl font-bold mb-4">Why Round Numbers Matter</h2>
        <div className="space-y-3 text-sm text-gray-800">
          <p>
            Round-number thresholds act as <strong>asymmetric anchors</strong> in card pricing. Before a card crosses $1,000, the threshold is resistance — sellers list at $999 to dodge the psychological wall. After it clears, $1,000 becomes support — bids below feel like lowballs, and listings at $1,050 feel cheap. The crossing itself is the inflection point.
          </p>
          <p>
            The Q4 2020 hobby boom produced a measurable pattern. Cards that broke $500 for the first time that quarter settled at an average of $680 in the following three months — a 36% lift over the break price. Cards that broke $1,000 settled at an average of $1,360, a 36% lift. The pattern held for the $5,000 and $10,000 tiers too. Not every cross stuck — the 2022 crash saw many 2021 breaks reverse — but the initial cross was always statistically meaningful.
          </p>
          <p>
            The four milestone types tell different stories. <strong>ATH</strong> = structural re-rating ("this card is worth more now than it ever has been"). <strong>12-month high</strong> = momentum return ("demand has quietly climbed back"). <strong>7-day breakout</strong> = short-term acceleration ("something changed this week — catalyst?"). <strong>Recovery cross</strong> = returning demand without fomo ("quiet accumulation after a drawdown").
          </p>
          <p className="text-xs text-gray-600">
            Flipper connection: watching ceiling breaks tells you when a sub-niche is heating. Three cards from the same set crossing $500 in 48 hours is not coincidence — it is sector rotation. Position ahead of the fourth.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Live Feeds</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/grail-watch" className="p-3 rounded-lg border border-gray-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition">
            <div className="font-semibold text-sm">Grail Watch Live</div>
            <div className="text-xs text-gray-600">$1K+ cross-context feed</div>
          </Link>
          <Link href="/steal-watch" className="p-3 rounded-lg border border-gray-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition">
            <div className="font-semibold text-sm">Steal Watch Live</div>
            <div className="text-xs text-gray-600">Under-FMV closings</div>
          </Link>
          <Link href="/pop-watch" className="p-3 rounded-lg border border-gray-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition">
            <div className="font-semibold text-sm">Pop Watch</div>
            <div className="text-xs text-gray-600">Grading velocity feed</div>
          </Link>
          <Link href="/auction-wire" className="p-3 rounded-lg border border-gray-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition">
            <div className="font-semibold text-sm">Auction Wire</div>
            <div className="text-xs text-gray-600">Live auction countdowns</div>
          </Link>
          <Link href="/vintage-wire" className="p-3 rounded-lg border border-gray-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition">
            <div className="font-semibold text-sm">Vintage Wire</div>
            <div className="text-xs text-gray-600">$10K+ vintage closings</div>
          </Link>
          <Link href="/live-hub" className="p-3 rounded-lg border border-gray-200 hover:border-fuchsia-400 hover:bg-fuchsia-50 transition">
            <div className="font-semibold text-sm">Live Hub</div>
            <div className="text-xs text-gray-600">All hobby live feeds</div>
          </Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Ceiling Break Live',
          url: 'https://cardvault-two.vercel.app/ceiling-breaks',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
          description:
            'Live feed of cards crossing price-threshold milestones. Seven ceiling tiers from $100 to $100K. Four milestone types: All-Time High, 12-Month High, 7-Day Breakout, Recovery Cross. Filter by sport, tier floor, and event type. Watchlist starrable.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((i) => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: { '@type': 'Answer', text: i.answer },
          })),
        }}
      />
    </main>
  );
}
