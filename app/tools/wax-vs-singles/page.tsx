import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import WaxVsSinglesCalculator from './WaxVsSinglesCalculator';

export const metadata: Metadata = {
  title: 'Wax vs Singles Calculator — Should You Buy Packs or Singles?',
  description: 'Free calculator to compare buying sealed wax (hobby boxes, blasters) vs buying individual singles. See which option saves you money based on the cards you want.',
  openGraph: {
    title: 'Wax vs Singles Calculator — CardVault',
    description: 'Should you rip packs or buy singles? Compare the cost of sealed product vs buying the exact cards you want.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Wax vs Singles Calculator — CardVault',
    description: 'Wax or singles? Calculate which option is better for your budget and goals.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Wax vs Singles Calculator' },
];

const faqItems = [
  {
    question: 'Should I buy sealed wax or singles?',
    answer: 'It depends on your goals. If you want specific cards, buying singles is almost always cheaper and more efficient. If you enjoy the thrill of opening packs and want a variety of cards from a set, sealed wax offers entertainment value plus a chance at big pulls. Most collectors use a mix of both strategies.',
  },
  {
    question: 'What does "wax" mean in card collecting?',
    answer: 'Wax is the hobby term for sealed, unopened card products — hobby boxes, blasters, retail packs, etc. The term comes from the wax paper wrappers used on vintage card packs in the 1950s-1980s. Today, "ripping wax" simply means opening sealed packs or boxes.',
  },
  {
    question: 'How do I calculate the cost of buying singles?',
    answer: 'Add up the market price of each individual card you want from a set. Include shipping costs (typically $1-4 per card on eBay) and platform fees if selling later. Compare this total to the cost of sealed product needed to statistically pull those cards.',
  },
  {
    question: 'What is the expected number of boxes to pull a specific card?',
    answer: 'The expected number of boxes depends on the card rarity and box configuration. For a base card in a 200-card set with 10 cards per pack and 24 packs per box, you get 240 cards per box — roughly a 1.2x chance of pulling any specific base card per box. For short prints or inserts, you may need 5-50+ boxes.',
  },
  {
    question: 'When is buying wax better than singles?',
    answer: 'Buying wax is better when: (1) you want to complete a large portion of a set, (2) the sealed product is below retail/market price, (3) you enjoy the experience of opening, (4) you plan to sell extras to offset cost, or (5) you want a chance at rare inserts and parallels that command premiums.',
  },
];

export default function WaxVsSinglesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Wax vs Singles Calculator',
        description: 'Free calculator comparing the cost of buying sealed wax vs individual singles for sports card and Pokemon collectors.',
        url: 'https://cardvault-two.vercel.app/tools/wax-vs-singles',
        applicationCategory: 'FinanceApplication',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Sealed vs Singles - All Sports + Pokemon - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Wax vs Singles Calculator
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Should you rip packs or buy the cards you want directly? Compare the cost of buying sealed
          product vs individual singles to find the best strategy for your budget.
        </p>
      </div>

      <WaxVsSinglesCalculator />

      {/* How It Works */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Choose a Product', desc: 'Select a sealed product — hobby box, blaster, or ETB — and see its market price and configuration.' },
            { step: '2', title: 'Add Your Want List', desc: 'Add the specific cards you want and their market prices. We calculate the total singles cost.' },
            { step: '3', title: 'Compare Results', desc: 'See how many boxes you need to statistically pull your cards vs just buying them as singles.' },
          ].map(item => (
            <div key={item.step} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
              <div className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-sm font-bold mb-3">
                {item.step}
              </div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Sealed Product EV', href: '/tools/sealed-ev', desc: 'Calculate expected value of sealed boxes' },
            { title: 'Box Break Calculator', href: '/tools/box-break', desc: 'Compare group break formats and costs' },
            { title: 'Pack Simulator', href: '/tools/pack-sim', desc: 'Simulate opening packs for free' },
            { title: 'Set Completion Cost', href: '/tools/set-cost', desc: 'Estimate cost to complete any set' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-amber-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>Prices are estimates based on market averages. Always verify current prices before making purchasing decisions.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-amber-500 hover:text-amber-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/sports" className="text-amber-500 hover:text-amber-400">Browse Cards</Link>
          {' '}&middot;{' '}
          <Link href="/guides" className="text-amber-500 hover:text-amber-400">Collecting Guides</Link>
        </p>
      </div>
    </div>
  );
}
