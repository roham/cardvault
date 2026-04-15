import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PackOddsCalculator from './PackOddsCalculator';

export const metadata: Metadata = {
  title: 'Pack Odds Calculator — Probability of Pulling Any Card from Any Box',
  description: 'Free pack odds calculator for sports cards and Pokémon. Calculate the probability of pulling autographs, numbered parallels, refractors, and specific cards from hobby boxes, blasters, and retail packs. See how many packs or boxes you need.',
  openGraph: {
    title: 'Pack Odds Calculator — CardVault',
    description: 'What are the odds of pulling the card you want? Calculate exact probabilities for any sealed product.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pack Odds Calculator — CardVault',
    description: 'Calculate your odds of pulling autos, numbered parallels, and specific cards from any box.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Pack Odds Calculator' },
];

const faqItems = [
  {
    question: 'How are pack odds calculated for sports cards?',
    answer: 'Pack odds are calculated using probability theory. If a card type appears at 1:24 packs, each pack has a 1/24 (4.17%) chance. For a full hobby box of 24 packs, the probability of pulling at least one is 1 - (23/24)^24 = 63.7%. For multiple boxes, the formula extends: 1 - (1 - p)^n where p is per-pack probability and n is total packs opened.',
  },
  {
    question: 'How many hobby boxes do I need to open to guarantee pulling an auto?',
    answer: 'You can never truly guarantee a pull — probability never reaches 100%. However, at 1:24 pack odds, opening 3 hobby boxes (72 packs) gives you a 95.1% chance. For 99% confidence, you need about 5 hobby boxes (110 packs). Many hobby boxes guarantee one auto, but specific player autos remain extremely rare depending on the checklist size.',
  },
  {
    question: 'What does "1:24 packs" mean on a pack odds table?',
    answer: 'The notation "1:24 packs" means that on average, you will find one of that insert type in every 24 packs opened. This is a statistical average — you might pull one in your first pack or go 50+ packs without hitting one. In a 24-pack hobby box, 1:24 odds means roughly a 63.7% chance of pulling at least one, not a guarantee.',
  },
  {
    question: 'Are hobby box odds better than blaster box odds?',
    answer: 'Yes, hobby boxes have significantly better odds for premium inserts. A hobby box might have 1:12 odds for a numbered parallel while a blaster has 1:14 or worse. Hobby boxes also contain exclusive insert sets not available in retail. However, blasters are cheaper per box, so the cost-per-hit can sometimes be comparable for lower-tier inserts.',
  },
  {
    question: 'Should I buy packs or just buy the single card I want?',
    answer: 'Almost always buy the single. If you want a specific player\'s auto from a product with 100 possible auto subjects, and autos appear at 1:24 packs, your odds per pack are roughly 1:2,400. That means you\'d need to open about 5,500 packs (229 hobby boxes, ~$38,000) for a 90% chance at that specific card — when the single might cost $50-$200. Use our calculator to see the math for your specific situation.',
  },
];

export default function PackOddsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Pack Odds Calculator',
        description: 'Calculate the probability of pulling autographs, numbered parallels, refractors, and specific cards from any sports card or Pokémon hobby box, blaster, or retail pack.',
        url: 'https://cardvault-two.vercel.app/tools/pack-odds',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Real Odds &middot; All Products &middot; Exact Probabilities &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pack Odds Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          What are the real odds of pulling the card you want? Select a product, pick an insert type, and see exact probabilities for 1 pack, 1 box, multiple boxes, and a full case.
        </p>
      </div>

      <PackOddsCalculator />

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 pt-8 border-t border-gray-800">
        <p className="text-gray-500 text-sm">
          Try the <a href="/tools/pack-sim" className="text-emerald-400 hover:underline">pack simulator</a> to rip virtual packs,{' '}
          calculate <a href="/tools/sealed-ev" className="text-emerald-400 hover:underline">sealed product EV</a>,{' '}
          compare <a href="/tools/wax-vs-singles" className="text-emerald-400 hover:underline">wax vs singles value</a>, or{' '}
          analyze <a href="/tools/box-break" className="text-emerald-400 hover:underline">box break formats</a>.
        </p>
      </section>
    </div>
  );
}
