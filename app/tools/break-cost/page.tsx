import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakCostClient from './BreakCostClient';

export const metadata: Metadata = {
  title: 'Break Cost Splitter — Fair Pricing for Every Spot | CardVault',
  description: 'Free break cost calculator. Split box and case break costs fairly among participants. Supports Random Team, Pick Your Team (tiered pricing), Hit Draft, and Personal Box formats. All 4 major sports.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Break Cost Splitter — Fair Spot Pricing | CardVault',
    description: 'Calculate fair break spot prices. PYT tiered pricing, random team splits, breaker fee included.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Break Cost Splitter | CardVault',
    description: 'Split break costs fairly. 4 formats, 4 sports, tiered PYT pricing.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Break Cost Splitter' },
];

const faqItems = [
  {
    question: 'How are Pick Your Team prices calculated?',
    answer: 'PYT pricing uses a tier system based on team popularity and rookie class strength. Premium teams like the Yankees, Chiefs, Lakers, and Oilers cost about 1.8 times the base price. Mid-tier teams cost about 1.2 times base. All other teams pay the base rate. This ensures the total collected covers all costs while reflecting real market demand for team spots.',
  },
  {
    question: 'What does the breaker fee cover?',
    answer: 'The breaker fee is a percentage added on top of product and shipping costs. It covers the breaker\'s time, streaming equipment, supplies like sleeves and top-loaders, and shipping hits to buyers. A typical breaker fee ranges from 5 to 15 percent.',
  },
  {
    question: 'How does Random Team differ from Pick Your Team?',
    answer: 'In Random Team breaks, every spot costs the same amount. After all spots are sold, teams are randomly assigned. This is the cheapest way to enter a break. In PYT, you choose your team but popular teams cost more because demand drives up the price.',
  },
  {
    question: 'What is a Hit Draft break?',
    answer: 'In Hit Draft format, all spots cost the same. As cards are pulled during the break, participants draft hits in a snake order. First pick gets the best hit, second pick gets next best, and so on. This format eliminates the luck factor of which team hits.',
  },
  {
    question: 'Can I use this for case breaks?',
    answer: 'Yes. Enter the full case cost as the product cost. The splitter works for any break size — single box, multi-box, half case, or full case. Adjust the number of spots and breaker fee to match your specific break setup.',
  },
];

export default function BreakCostPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Break Cost Splitter',
        description: 'Calculate fair break spot pricing. Supports Random Team, Pick Your Team, Hit Draft, and Personal Box formats with tiered pricing.',
        url: 'https://cardvault-two.vercel.app/tools/break-cost',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
          Break Splitter &middot; 4 Formats &middot; Tiered PYT
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Break Cost Splitter</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Calculate fair spot pricing for card breaks. Splits product cost, shipping, and breaker fee across all participants. Tiered pricing for Pick Your Team formats.
        </p>
      </div>

      <BreakCostClient />

      {/* Tips */}
      <div className="mt-12 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Break Pricing Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Include All Costs', tip: 'Do not forget shipping, PayPal fees, and supplies. Underpricing spots means you lose money as the breaker.' },
            { title: 'PYT Pricing Matters', tip: 'If you charge flat rate for PYT, popular teams sell instantly and you are stuck trying to fill the Marlins and Hornets.' },
            { title: 'Start With 10% Fee', tip: 'A 10% breaker fee is standard for most hobby box breaks. Adjust up for high-end products or cases that take longer to run.' },
            { title: 'Share the Breakdown', tip: 'Copy the full pricing breakdown and post it with your break listing. Transparency builds trust and fills spots faster.' },
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
          { href: '/tools/break-roi', label: 'Break ROI Tracker', desc: 'Track your break investment returns' },
          { href: '/tools/break-spot', label: 'Break Spot Picker', desc: 'Which teams to pick in breaks' },
          { href: '/tools/box-break', label: 'Box Break Calculator', desc: 'Calculate box break EV' },
          { href: '/tools/sealed-ev', label: 'Sealed Product EV', desc: 'Expected value per product' },
          { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate selling profits' },
          { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Simulate opening packs' },
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
