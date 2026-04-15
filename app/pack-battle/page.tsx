import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PackBattleClient from './PackBattleClient';

export const metadata: Metadata = {
  title: 'Pack Battle — Head-to-Head Product Comparison Simulator',
  description: 'Compare two sealed card products head-to-head by simulating openings side by side. See which hobby box, blaster, or retail pack gives better pulls. Free pack battle simulator for sports cards and Pokemon.',
  openGraph: {
    title: 'Pack Battle — CardVault',
    description: 'Which box gives better pulls? Simulate head-to-head openings and find out.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pack Battle — CardVault',
    description: 'Head-to-head pack opening simulator. Compare products side by side.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Pack Battle' },
];

const faqItems = [
  {
    question: 'How does Pack Battle work?',
    answer: 'Select two sealed products (hobby boxes, blasters, etc.) and click Battle. We simulate opening each product using real pack odds and hit rates, then compare the results side by side. The product with the higher total pull value wins the battle. Run multiple battles to see which product consistently gives better returns.',
  },
  {
    question: 'Are the simulated pulls accurate?',
    answer: 'Yes — we use the actual published pack odds for each product. Insert hit rates (autos, relics, refractors, numbered parallels) match what manufacturers print on their boxes. Individual card values are estimates based on market averages. Your actual experience will vary due to random chance, but over many battles the averages hold true.',
  },
  {
    question: 'Which product should I buy — hobby or blaster?',
    answer: 'It depends on your budget and goals. Hobby boxes cost more but guarantee premium hits (autos, numbered cards). Blasters are cheaper per box but have worse odds and no guaranteed hits. For pure value-per-dollar, hobby boxes usually win. For casual fun on a budget, blasters are fine. Use Pack Battle to see the math for specific products.',
  },
  {
    question: 'Why do some battles show very different results each time?',
    answer: 'That is the nature of randomness in card products. A hobby box might produce a $200 auto one battle and a $5 auto the next. This variance is exactly why the card hobby is exciting — and why you should never evaluate a product based on a single box. Run 5-10 battles to see the true expected value range.',
  },
];

export default function PackBattlePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Pack Battle',
        description: 'Head-to-head sealed product comparison simulator. Compare two hobby boxes, blasters, or retail packs side by side with simulated openings and real pack odds.',
        url: 'https://cardvault-two.vercel.app/pack-battle',
        applicationCategory: 'EntertainmentApplication',
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
          Head-to-Head &middot; Real Odds &middot; Side-by-Side Results &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pack Battle</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Which box gives better pulls? Pick two products, hit Battle, and watch them open side by side. Real pack odds. Real value comparison. Settle the debate.
        </p>
      </div>

      <PackBattleClient />

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
          Rip virtual packs in the <a href="/tools/pack-sim" className="text-emerald-400 hover:underline">pack simulator</a>,{' '}
          calculate <a href="/tools/pack-odds" className="text-emerald-400 hover:underline">pack odds</a>,{' '}
          compare <a href="/tools/wax-vs-singles" className="text-emerald-400 hover:underline">wax vs singles</a>, or{' '}
          check <a href="/tools/sealed-ev" className="text-emerald-400 hover:underline">sealed product EV</a>.
        </p>
      </section>
    </div>
  );
}
