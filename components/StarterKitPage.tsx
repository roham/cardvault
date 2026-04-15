import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import type { StarterKit } from '@/data/starter-kits';

interface Props {
  kit: StarterKit;
}

export default function StarterKitPage({ kit }: Props) {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Guides', href: '/guides' },
            { label: `Start Collecting ${kit.league}` },
          ]} />
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
              {kit.icon} {kit.league} · Beginner Guide · Updated April 2025
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {kit.title}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">{kit.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Why Collect */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Why Collect {kit.league} Cards?</h2>
          <ul className="space-y-3">
            {kit.whyCollect.map((reason, i) => (
              <li key={i} className="flex gap-3 text-gray-300">
                <span className="text-green-400 mt-1 shrink-0">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 bg-blue-950/30 border border-blue-900/50 rounded-lg p-4 text-sm text-blue-300">
            <strong>Season Timing:</strong> {kit.seasonTiming}
          </div>
        </section>

        {/* Budget Tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Starter Kits by Budget</h2>
          <p className="text-gray-400 mb-6">Pick a budget and we'll tell you exactly what to buy. Every recommendation uses real cards from our database.</p>
          <div className="space-y-8">
            {kit.budgetTiers.map((tier) => (
              <div key={tier.budget} className="bg-gray-900/60 border border-gray-800 rounded-lg overflow-hidden">
                <div className="bg-gray-800/60 px-6 py-3 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{tier.budget} Starter Kit</h3>
                  <span className="text-sm text-gray-400">Budget: {tier.budget}</span>
                </div>
                <div className="p-6">
                  <p className="text-gray-400 text-sm mb-4">{tier.strategy}</p>

                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Cards to Buy</h4>
                  <div className="space-y-2 mb-4">
                    {tier.cards.map((card, i) => (
                      <div key={i} className="bg-gray-800/40 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white text-sm">{card.name}</span>
                          <span className="text-green-400 text-sm font-mono">{card.price}</span>
                        </div>
                        <p className="text-xs text-gray-500">{card.why}</p>
                      </div>
                    ))}
                  </div>

                  <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Sealed Product</h4>
                  {tier.products.map((product, i) => (
                    <div key={i} className="bg-gray-800/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm">{product.name}</span>
                        <span className="text-yellow-400 text-sm font-mono">{product.price}</span>
                      </div>
                      <p className="text-xs text-gray-500">{product.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Sets */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Key {kit.league} Card Sets to Know</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kit.keySets.map((set) => (
              <div key={set.name} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{set.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{set.year}</span>
                </div>
                <p className="text-sm text-gray-400">{set.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beginner Mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">5 Beginner Mistakes to Avoid</h2>
          <div className="space-y-4">
            {kit.beginnerMistakes.map((item, i) => (
              <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-lg mt-0.5">✗</span>
                  <div>
                    <p className="text-white font-medium mb-1">{item.mistake}</p>
                    <p className="text-sm text-green-400">Instead: {item.instead}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Essential CardVault Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/tools/grading-roi', label: 'Grading ROI', icon: '📊' },
              { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '📦' },
              { href: '/tools/sealed-ev', label: 'Box EV Calculator', icon: '🎲' },
              { href: '/tools/price-history', label: 'Price History', icon: '📈' },
              { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👁️' },
              { href: '/tools/condition-grader', label: 'Condition Grader', icon: '🔍' },
              { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💰' },
              { href: `/teams`, label: 'Browse by Team', icon: '🏟️' },
            ].map(tool => (
              <Link key={tool.href} href={tool.href} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition-colors text-center">
                <div className="text-2xl mb-1">{tool.icon}</div>
                <div className="text-xs text-gray-300">{tool.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {kit.faqItems.map((faq, i) => (
              <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other Sports */}
        <section className="mb-8 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Starter Guides for Other Sports</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { sport: 'baseball', icon: '⚾', label: 'Baseball' },
              { sport: 'basketball', icon: '🏀', label: 'Basketball' },
              { sport: 'football', icon: '🏈', label: 'Football' },
              { sport: 'hockey', icon: '🏒', label: 'Hockey' },
            ].filter(s => s.sport !== kit.sport).map(s => (
              <Link key={s.sport} href={`/guides/start-collecting-${s.sport}`} className="bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-sm text-white font-medium">{s.label}</div>
                <div className="text-xs text-gray-500">Starter Guide</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* JSON-LD */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: kit.title,
        description: kit.description,
        url: `https://cardvault-two.vercel.app/guides/start-collecting-${kit.sport}`,
        datePublished: '2025-04-15',
        dateModified: '2025-04-15',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://cardvault-two.vercel.app/guides' },
            { '@type': 'ListItem', position: 3, name: `Start Collecting ${kit.league}` },
          ],
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: kit.faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />
    </div>
  );
}
