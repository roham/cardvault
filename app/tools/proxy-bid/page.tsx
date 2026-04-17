import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProxyBidClient from './ProxyBidClient';

export const metadata: Metadata = {
  title: 'Proxy Bid Optimizer — eBay Increment Ladder & Second-Price Auction Calculator | CardVault',
  description: 'Before you place that max bid — model what you will actually pay. Uses eBay\u2019s real increment ladder ($0.05 under $1 all the way to $100+ above $5K) and second-price auction dynamics. Enter your max, the current bid, and estimated competition — see your expected clearing price, worst case, and snipe-timing strategy. Free tool for card auction buyers.',
  openGraph: {
    title: 'Proxy Bid Optimizer — CardVault',
    description: 'Model your real clearing price on eBay-style auctions. Increment ladder, second-price math, snipe timing.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Proxy Bid Optimizer — CardVault',
    description: 'See what you\u2019ll actually pay at auction. Increment ladder + snipe strategy for card buyers.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Proxy Bid Optimizer' },
];

const faqItems = [
  {
    question: 'What is a proxy bid?',
    answer: 'When you enter a max bid on eBay or a similar second-price auction, the platform does not actually bid your full amount right away. Instead, the platform acts as your proxy — it bids only enough to stay ahead of the next-highest bidder, one increment at a time. If nobody bids above you, you win at the smallest amount above the second-highest max. This is why entering $500 on a lot sitting at $50 does not jump the price to $500 — the system only raises by one increment when someone else bids.',
  },
  {
    question: 'What is the eBay bid increment ladder?',
    answer: 'eBay bid increments are tiered by current price. $0.01–$0.99 uses $0.05 increments. $1.00–$4.99 uses $0.25. $5–$24.99 uses $0.50. $25–$99.99 uses $1. $100–$249.99 uses $2.50. $250–$499.99 uses $5. $500–$999.99 uses $10. $1,000–$2,499.99 uses $25. $2,500–$4,999.99 uses $50. $5,000+ uses $100. When you are the high bidder at the $247 mark and a rival outbids, the system jumps by $5 to $252 (not the $7 you might intuit). Knowing the ladder lets you pick a max bid that sits just above a rival\u2019s likely round-number target.',
  },
  {
    question: 'How does second-price auction clearing work in practice?',
    answer: 'You bid $500 max. Your one rival bids $350 max. You win at the next increment above $350 — on eBay that is $355 ($5 increment at the $250–$500 band). You do NOT pay $500 unless a second rival also happens to bid above $495. The tool models this: enter your max + the highest rival max, and it shows your expected clearing price, which is almost always far below your max. This is why bidding your true maximum on a sniped auction is rational — you only pay what the competition forces.',
  },
  {
    question: 'Why do odd-dollar deterrent bids matter?',
    answer: 'Human bidders gravitate to round numbers — $100, $250, $500, $1,000. A casual rival picks $500 as their max because it feels like a limit. If you bid $503, you beat that rival by exactly $3 when the auction clears. Across many auctions that 1–3% delta compounds into real savings. The tool suggests an optimal deterrent bid just above nearby round-number anchors — typically $503, $1,003, $2,513 — rather than the default $500 your rival intuits you at.',
  },
  {
    question: 'Should I snipe or bid early?',
    answer: 'Both strategies have tradeoffs. Early bidding signals strength and can deter casuals but gives professionals time to raise. Sniping (bidding in the last 10 seconds) prevents emotional rivals from re-bidding against you, but requires execution and gives you one chance to be right. Tool\u2019s guidance: snipe when your rivals are likely emotional bidders (rare grails, heated nostalgia cards). Bid early when rivals are sophisticated and will raise anyway (modern high-series, numbered parallels tracked by flippers). Never bid in the $10–$60s-to-go window — that is the worst of both worlds (wakes up rivals without preventing their last-second counter).',
  },
  {
    question: 'How does the tool handle multiple rivals?',
    answer: 'With one rival you pay one increment above their max. With two or more rivals, the clearing price is one increment above the second-highest MAX across the entire field (not the sum, not the average — just the #2 max). Adding more rivals only matters if at least one of them bids above your current top rival. The tool lets you enter up to 4 rival max bids and shows how the clearing price moves as you add bidders or raise their maxes.',
  },
];

export default function ProxyBidPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 bg-clip-text text-transparent">
          Proxy Bid Optimizer
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          Before you enter that max bid — model what you will actually pay. Real eBay increment ladder, second-price clearing math, and snipe-timing strategy for card auction buyers.
        </p>
        <p className="text-sm text-gray-500">
          10-tier increment ladder • Up to 4 rivals • Worst-case scenario toggle • Deterrent bid suggestion
        </p>
      </header>

      <ProxyBidClient />

      <section className="mt-12 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
        <h2 className="text-2xl font-bold mb-4">The eBay Bid Increment Ladder</h2>
        <p className="text-sm text-gray-700 mb-3">
          Knowing the ladder lets you pick maxes that sit just above common rival anchors. A few noteworthy transitions:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-indigo-100 text-indigo-900">
                <th className="border border-indigo-200 px-3 py-2 text-left">Current price band</th>
                <th className="border border-indigo-200 px-3 py-2 text-left">Increment</th>
                <th className="border border-indigo-200 px-3 py-2 text-left">What it means</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$0.01 – $0.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$0.05</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">20-cent penny auctions are where flipper wars begin</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$1 – $4.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$0.25</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Common-card lots</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$5 – $24.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$0.50</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Star raws, low-end graded</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$25 – $99.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$1.00</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Mid-tier modern slabs</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$100 – $249.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$2.50</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Solid RC Chrome 9s</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$250 – $499.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$5.00</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Key modern RC 10s</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$500 – $999.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$10.00</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Elite modern, vintage commons 9</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$1,000 – $2,499.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$25.00</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Vintage stars, prospect autos</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$2,500 – $4,999.99</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$50.00</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Elite vintage RCs 8-9</td>
              </tr>
              <tr>
                <td className="border border-indigo-200 px-3 py-2">$5,000+</td>
                <td className="border border-indigo-200 px-3 py-2 font-semibold">$100.00</td>
                <td className="border border-indigo-200 px-3 py-2 text-xs">Grails and trophy cards</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Source: eBay bid increment schedule, public help page as of 2026. Most major card-specific platforms (Whatnot, MySlabs, PWCC, Goldin) use either this exact ladder or a close variant.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/tools/auction-bid" className="p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <div className="font-semibold text-sm">Auction Bid Calculator</div>
            <div className="text-xs text-gray-600">Total cost of winning (fees + tax + ship)</div>
          </Link>
          <Link href="/tools/reserve-price" className="p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <div className="font-semibold text-sm">Reserve Price Calculator</div>
            <div className="text-xs text-gray-600">Seller-side floor pricing</div>
          </Link>
          <Link href="/tools/best-offer" className="p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <div className="font-semibold text-sm">Best Offer Calculator</div>
            <div className="text-xs text-gray-600">Accept, counter, or reject offers</div>
          </Link>
          <Link href="/tools/shill-detector" className="p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <div className="font-semibold text-sm">Shill Bid Detector</div>
            <div className="text-xs text-gray-600">Spot manipulated auctions</div>
          </Link>
          <Link href="/tools/counterfeit-scanner" className="p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <div className="font-semibold text-sm">Counterfeit Risk Scanner</div>
            <div className="text-xs text-gray-600">Pre-purchase risk score</div>
          </Link>
          <Link href="/tools" className="p-3 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <div className="font-semibold text-sm">All Tools</div>
            <div className="text-xs text-gray-600">150+ card collector tools</div>
          </Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Proxy Bid Optimizer',
          url: 'https://cardvault-two.vercel.app/tools/proxy-bid',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Any',
          description:
            'Proxy bid optimizer for card auctions. Models eBay-style increment ladder and second-price auction clearing. Input your max bid and rival max-bid estimates; see expected clearing price, worst-case outcome, and snipe-timing strategy.',
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
