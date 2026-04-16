import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardShowBoothClient from './CardShowBoothClient';

export const metadata: Metadata = {
  title: 'Card Show Booth Simulator — Run a Weekend Table, Price Cards, Haggle with 8 Collector Personas | CardVault',
  description: 'Rent a booth at a local, regional, or national card show. Pick your specialty. Price 18 cards. Field 20 offers from grail hunters, flippers, parents, dealers, kids, and more. Accept, counter, or reject. Earn your Booth Grade.',
  keywords: [
    'card show booth simulator', 'how to sell at a card show', 'card show table cost',
    'card dealer simulation', 'card show haggling', 'card show pricing strategy',
    'run a card show table', 'vendor booth card show', 'card show profit calculator',
    'counter offer cards', 'card show foot traffic', 'card show specialty',
    'what to sell at card show', 'card show weekend earnings', 'card show dealer personas',
  ],
  openGraph: {
    title: 'Card Show Booth Simulator — CardVault',
    description: 'Weekend card show booth sim. 3 show tiers, 4 specialties, 18 cards, 20 customers, 8 personas. Accept / counter / reject. Earn your Booth Grade A-F.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Booth Simulator — CardVault',
    description: 'Rent a booth, price 18 cards, haggle with 20 collectors. Earn your Booth Grade.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Card Show Booth Simulator' },
];

const faqItems = [
  {
    question: 'What is the Card Show Booth Simulator?',
    answer: 'An interactive portfolio commerce simulation. You rent a booth at a card show (three tiers: Small Local $150, Regional $400, National $1,200), pick a specialty (Vintage / Modern RC / Autos / Pokémon), receive 18 inventory cards drawn from CardVault\'s 9,800+ card database, then field 20 customer offers over a simulated weekend. For each offer you can Accept, Counter with a new price, or Reject. At the end you get a P&L breakdown plus a Booth Grade A-F.',
  },
  {
    question: 'How do the 8 customer personas differ?',
    answer: 'Each persona has distinct budget, willingness-to-pay ceiling, and targeting behavior. Grail Hunters carry big budgets and pay 85-95% of asking on vintage/rookies. Flippers lowball hard (50-70% of FMV) and want cards 30%+ below market. Parents have modest budgets for gift-worthy rookies. Dealer Peers buy wholesale at 50-65%. First-Timers often pay full asking on mid-tier cards. Nostalgics pay emotional premiums on specific eras. Speculators analyze prospects analytically. Kids with allowance buy $5-25 cards with pure joy. The persona mix changes by show tier: National shows see more dealers and grail hunters; Small Local shows see more first-timers and kids.',
  },
  {
    question: 'How does the Counter mechanic work?',
    answer: 'When a customer offers $X on a card you listed at $Y, you can counter with any price between $X and $Y. Each persona has a hidden ceiling (their actual maximum willingness to pay). If your counter is at or below their ceiling, they accept. If it\'s above, they walk away and you lose the sale. Countering is a risk-reward decision: flippers walk easily, grail hunters tolerate bigger counters, kids never counter (they just walk).',
  },
  {
    question: 'Why does the specialty matter?',
    answer: 'Your inventory is filtered by specialty to reflect real-world booth curation. Vintage specialty weights pre-1980 cards; Modern RC weights 2015+ rookies; Autos weights high-value rookie/HoF cards; Pokémon would weight Pokemon sport (currently the DB is sports-only so Pokémon specialty falls back to modern mixed). Specialty also affects which personas visit more — a Vintage booth attracts Nostalgics, a Modern RC booth attracts Speculators and Flippers.',
  },
  {
    question: 'How is the Booth Grade calculated?',
    answer: 'Three components: (1) 60% recovery rate — total revenue as a percentage of the combined FMV of all inventory you started with. A=85%+, B=75-84%, C=65-74%, D=55-64%, F<55%. (2) 25% turnover rate — cards sold divided by 18 starting cards. Moving inventory is the point of being at a show. (3) 15% customer satisfaction — the percentage of interactions that ended in a sale (accept or counter-accept) vs walk-away. Grinding customers with lowball counters hurts this score even if you maximize per-card revenue. A 3-mode grade matches real booth priorities: net the right numbers, move the inventory, don\'t burn customers.',
  },
  {
    question: 'Is it Daily or repeatable?',
    answer: 'Both. Today\'s Show mode uses a date-seeded configuration so every player who opens the page today faces the same booth tier and same customer sequence — making it a shared daily challenge that\'s comparable across friends. Free Play re-seeds on every new booth so you can replay different tiers and specialties for practice.',
  },
  {
    question: 'Are the cards and prices real?',
    answer: 'Yes. Inventory is drawn from CardVault\'s 9,800+ sports card database — real card names, real sets, real years, real FMV estimates parsed from estimatedValueRaw ranges. Booth rental prices are benchmarked against real card show costs (local shows $100-200, regional $300-500, national $1,000-1,500). Customer offer percentages are benchmarked against real dealer-to-collector spreads observed at actual shows.',
  },
];

const relatedLinks = [
  { href: '/estate-sale', label: 'Estate Sale Simulator' },
  { href: '/vault/swap-meet', label: 'Swap Meet' },
  { href: '/card-show', label: 'Card Show Hub' },
  { href: '/card-show-prep', label: 'Card Show Prep' },
  { href: '/vault/market-maker', label: 'Market Maker' },
  { href: '/vault/negotiator', label: 'Price Negotiator' },
];

export default function CardShowBoothPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Card Show Booth Simulator',
          url: 'https://cardvault-two.vercel.app/card-show-booth',
          applicationCategory: 'GameApplication',
          applicationSubCategory: 'BusinessSimulation',
          operatingSystem: 'Web',
          description:
            'Portfolio commerce simulator where you rent a card show booth, price 18 cards, and field 20 customer offers. 8 personas. Accept / counter / reject. Earn your Booth Grade.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Breadcrumb items={breadcrumbs} />

        <header className="mb-8 mt-4 sm:mt-6">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-700/40 bg-orange-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-300">
              🎪 Card Show Booth
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
              Vault · Commerce Sim
            </span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Run a Card Show <span className="text-orange-400">Booth</span>
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            You just paid for a table at a card show. You have 18 cards, a weekend of foot traffic, and 20 collectors who all want
            to haggle. Pick your show tier. Pick your specialty. Accept, counter, or reject each offer. Earn your Booth Grade.
          </p>
        </header>

        <CardShowBoothClient />

        <section className="mt-14 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {faqItems.map((f) => (
              <div key={f.question}>
                <h3 className="mb-1.5 text-sm font-semibold text-orange-300">{f.question}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-white">Related commerce sims</h2>
          <div className="flex flex-wrap gap-2">
            {relatedLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-300 hover:border-orange-500/50 hover:text-orange-200"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <p>
            Simulator only. Booth rental, customer personas, offer percentages, and card values are educational estimates benchmarked
            against real card shows. Cards drawn from CardVault\'s 9,800+ database. No real transactions occur.
          </p>
        </footer>
      </div>
    </div>
  );
}
