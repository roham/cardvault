import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Build a Card Collection on a Budget: Smart Collecting in 2026',
  description: 'Budget card collecting strategies that actually work. How to build a meaningful sports card or Pokemon collection for $50-$200/month without overspending on retail wax or chasing hype.',
  keywords: ['budget card collecting', 'cheap sports cards', 'affordable card collection', 'card collecting on a budget', 'best budget cards', 'how to collect cards cheap'],
};

interface BudgetTier {
  amount: string;
  title: string;
  strategy: string;
  doThis: string[];
  avoidThis: string[];
  exampleBuys: string[];
}

const tiers: BudgetTier[] = [
  {
    amount: '$25/month',
    title: 'The Patient Builder',
    strategy: 'Focus on one player or one set. Buy raw singles from eBay or COMC. Skip sealed product entirely — expected value is always negative at this budget.',
    doThis: [
      'Pick ONE player you believe in long-term and buy their cheapest base rookie',
      'Target junk wax era (1986-93) rookies of HOF players — they are dirt cheap and still historically significant',
      'Buy at card shows where you can negotiate bulk deals on raw singles',
      'Build a set from commons bins ($0.25-$1 per card at shows)',
    ],
    avoidThis: [
      'Buying retail blasters — $25 for mostly base cards with slim odds of anything valuable',
      'Chasing "the next big thing" — hype cards at peak price are the fastest way to lose money',
      'Grading anything — $55+ per card is your entire monthly budget',
    ],
    exampleBuys: [
      '1990 Score Emmitt Smith RC — $2-$3 raw',
      '1989 Topps Ken Griffey Jr. RC — $5-$10 raw',
      '1986-87 Fleer Michael Jordan RC — $5-$8 (non-MJ cards from the set)',
      'Complete 1987 Topps Baseball commons lot — $15-$20 for 400+ cards',
    ],
  },
  {
    amount: '$50-$100/month',
    title: 'The Strategic Collector',
    strategy: 'Mix of targeted singles and occasional sealed product. Focus on buying the exact cards you want rather than gambling on packs. Allocate 70% to singles, 30% to sealed.',
    doThis: [
      'Buy PSA 8-9 graded copies of cards you want — already authenticated and protected',
      'Target "second-best" rookies (non-Prizm Silver, non-Chrome Refractor) at 50-80% discounts',
      'Participate in box breaks for your favorite team instead of buying whole boxes',
      'Buy sealed product only on release day when retail is available at MSRP',
    ],
    avoidThis: [
      'Buying from resellers at 2x markup after a set sells out at retail',
      'Spreading too thin across multiple players/sports',
      'Buying graded cards without checking eBay sold comps first — many are overpriced',
    ],
    exampleBuys: [
      'PSA 9 2018 Prizm Luka Doncic base — ~$100-$150 (iconic modern rookie)',
      'Raw 2023 Topps Chrome Corbin Carroll — $5-$15 per card',
      'One hobby blaster of the current release — $30-$40 at retail',
      'PSA 8 vintage cards of your favorite player — $20-$80 range for many HOFers',
    ],
  },
  {
    amount: '$200+/month',
    title: 'The Serious Collector',
    strategy: 'Build a portfolio with intention. Mix vintage anchors, modern star rookies, and selective sealed product. At this level you should track spending and returns like an investor.',
    doThis: [
      'Anchor your collection with 1-2 high-value cards per quarter rather than many cheap ones',
      'Buy vintage (pre-1980) graded cards — they historically appreciate and are harder to fake',
      'Allocate sealed product budget to hobby boxes, not retail — better hit rates and exclusive parallels',
      'Track every purchase in a spreadsheet with date, price, and current comp value',
    ],
    avoidThis: [
      'Buying hobby boxes at inflated secondary market prices',
      'Emotional buying after a player has a big game — that is when prices peak',
      'Holding too many low-value cards — sell the $5-$20 cards and reinvest up',
    ],
    exampleBuys: [
      'PSA 10 2022-23 Prizm Victor Wembanyama base — market price card for the generational talent',
      'PSA 7 1952 Topps common — $50-$100 (own a piece of the most famous set ever)',
      'One hobby box of a current release — $150-$300',
      'PSA 9 Base Set Charizard Holo (unlimited) — a benchmark Pokemon card',
    ],
  },
];

export default function BudgetCollectingPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Budget Collecting' },
        ]} />

        <h1 className="text-3xl sm:text-4xl font-bold mt-6 mb-4">How to Build a Card Collection on a Budget</h1>
        <p className="text-gray-400 text-lg mb-8">
          You do not need thousands of dollars to build a meaningful card collection. The key is
          <strong> buying singles, not packs</strong> — and having a plan for what you are building toward.
          This guide covers strategies at every budget level.
        </p>

        {/* Core Principle */}
        <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-amber-300 mb-3">The #1 Rule of Budget Collecting</h2>
          <p className="text-gray-300 mb-3">
            <strong>Buy singles, not packs.</strong> The expected value of sealed product is almost always negative.
            A $200 hobby box will, on average, yield $120-$160 in card value. You are paying a $40-$80 entertainment premium.
          </p>
          <p className="text-gray-300">
            If you know what card you want, buy it directly on eBay or TCGPlayer. You&apos;ll spend 50-80% less than trying to pull it from packs.
            Save sealed product for entertainment — not as a collecting strategy.
          </p>
        </div>

        {/* Budget Tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Strategies by Budget</h2>
          <div className="space-y-8">
            {tiers.map((tier) => (
              <div key={tier.amount} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-2xl font-black text-green-400">{tier.amount}</span>
                  <span className="text-lg font-semibold text-gray-300">{tier.title}</span>
                </div>
                <p className="text-gray-300 mb-5">{tier.strategy}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                  <div>
                    <h4 className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wide">Do This</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {tier.doThis.map((d, i) => <li key={i} className="flex gap-2"><span className="text-green-500 shrink-0">+</span>{d}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wide">Avoid This</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {tier.avoidThis.map((a, i) => <li key={i} className="flex gap-2"><span className="text-red-500 shrink-0">-</span>{a}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-800/40 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-400 mb-2">Example Buys at This Budget</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {tier.exampleBuys.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Where to Find Deals */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Where to Find the Best Deals</h2>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-semibold text-white mb-1">Local Card Shows</h3>
                <p className="text-sm">The best place to buy raw singles. Vendors negotiate, especially late in the show. Bring cash. Check COMC and eBay prices on your phone before buying.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">eBay Auctions (Not Buy It Now)</h3>
                <p className="text-sm">Auction listings for common/mid-range cards often close 20-40% below BIN prices. Best deals on Sunday-Tuesday evenings when bidding traffic is lower.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">COMC (Check Out My Cards)</h3>
                <p className="text-sm">Massive inventory of raw singles with standardized grading. Great for buying 10-50 cards at once. Combine shipping into one package.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">TCGPlayer (Pokemon)</h3>
                <p className="text-sm">The best marketplace for Pokemon singles. Cart optimizer finds you the lowest total price across sellers. Condition grading is standardized.</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Sportlots</h3>
                <p className="text-sm">The hidden gem for vintage and commons. Cards as low as $0.18 each. Best for set building and vintage commons.</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Collection Plan */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Build a Collection Plan</h2>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              The collectors who spend the most are the ones without a plan. Before buying anything, answer these questions:
            </p>
            <ol className="space-y-3 text-gray-300">
              <li><strong>1. What am I building?</strong> A complete set? A player collection? A team rainbow? Define your goal.</li>
              <li><strong>2. What is my monthly budget?</strong> Set it and stick to it for 6 months. Discipline is what separates collectors from impulse buyers.</li>
              <li><strong>3. What is my buy list?</strong> Write down the specific cards you need. Buy ONLY from this list. Update monthly.</li>
              <li><strong>4. What is my exit strategy?</strong> Will you sell eventually? Hold forever? Pass down? This affects what you buy — investment cards vs. sentimental cards are different strategies.</li>
            </ol>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Related Guides & Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/guides/best-cards-under-10" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Best Cards Under $10</h3>
              <p className="text-sm text-gray-400 mt-1">Affordable cards with real collection value.</p>
            </Link>
            <Link href="/guides/best-cards-under-25" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Best Cards Under $25</h3>
              <p className="text-sm text-gray-400 mt-1">Step up your collection without breaking the bank.</p>
            </Link>
            <Link href="/tools/set-cost" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Set Completion Cost Estimator</h3>
              <p className="text-sm text-gray-400 mt-1">See what every card in a set costs and plan your build.</p>
            </Link>
            <Link href="/tools/collection-value" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Collection Value Calculator</h3>
              <p className="text-sm text-gray-400 mt-1">Track the total value of your collection.</p>
            </Link>
          </div>
        </section>

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'How to Build a Card Collection on a Budget',
          description: 'Budget card collecting strategies at every price point.',
          author: { '@type': 'Organization', name: 'CardVault' },
          publisher: { '@type': 'Organization', name: 'CardVault' },
          datePublished: '2026-04-14',
          dateModified: '2026-04-14',
        }} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How much does it cost to start collecting cards?', acceptedAnswer: { '@type': 'Answer', text: 'You can start a meaningful collection for as little as $25/month by focusing on raw singles from eBay, COMC, or local card shows. Buy specific cards you want rather than packs — the expected value of sealed product is almost always negative.' } },
            { '@type': 'Question', name: 'Should I buy packs or singles?', acceptedAnswer: { '@type': 'Answer', text: 'Buy singles. A $200 hobby box yields on average $120-$160 in card value. If you know what card you want, buy it directly for 50-80% less than trying to pull it from packs. Save sealed product for entertainment, not as a strategy.' } },
          ],
        }} />
      </div>
    </main>
  );
}
