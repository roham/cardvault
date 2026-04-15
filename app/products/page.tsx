import type { Metadata } from 'next';
import Link from 'next/link';
import { sealedProducts, calculateEV } from '@/data/sealed-products';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Sealed Product Guide — Every Box, Blaster & ETB with EV Analysis',
  description: 'Browse 55+ sealed card products with expected value analysis, hit rates, and ROI calculations. Sports cards and Pokemon TCG hobby boxes, blasters, mega boxes, and ETBs.',
  openGraph: {
    title: 'Sealed Product Guide — CardVault',
    description: 'Browse 55+ sealed products with EV analysis and hit rates.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

const sportConfig: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  baseball: { label: 'Baseball', emoji: '⚾', color: 'text-red-400', bg: 'bg-red-500/20' },
  basketball: { label: 'Basketball', emoji: '🏀', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  football: { label: 'Football', emoji: '🏈', color: 'text-green-400', bg: 'bg-green-500/20' },
  hockey: { label: 'Hockey', emoji: '🏒', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  pokemon: { label: 'Pokemon', emoji: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
};

const typeLabels: Record<string, string> = {
  'hobby-box': 'Hobby Box',
  'blaster': 'Blaster Box',
  'mega-box': 'Mega Box',
  'hanger': 'Hanger Pack',
  'fat-pack': 'Fat Pack / Bundle',
  'etb': 'Elite Trainer Box',
};

export default function ProductsPage() {
  const products = sealedProducts.map(p => ({
    ...p,
    ev: calculateEV(p),
  })).sort((a, b) => b.year - a.year || a.retailPrice - b.retailPrice);

  const sportCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  for (const p of products) {
    sportCounts.set(p.sport, (sportCounts.get(p.sport) || 0) + 1);
    typeCounts.set(p.type, (typeCounts.get(p.type) || 0) + 1);
  }

  const totalEV = products.reduce((s, p) => s + p.ev.expectedValue, 0);
  const avgEVPercent = products.reduce((s, p) => s + p.ev.roiPercent, 0) / products.length;
  const bestROI = products.reduce((best, p) => p.ev.roiPercent > best.ev.roiPercent ? p : best, products[0]);
  const worstROI = products.reduce((worst, p) => p.ev.roiPercent < worst.ev.roiPercent ? p : worst, products[0]);

  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Products' }];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sealed Product Guide',
    description: 'Browse 55+ sealed card products with expected value analysis.',
    url: 'https://cardvault-two.vercel.app/products',
    numberOfItems: products.length,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://cardvault-two.vercel.app/products/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={crumbs} />
        <JsonLd data={jsonLd} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Sealed Product Guide
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl">
            Browse {products.length} sealed products with expected value analysis, hit rates, and ROI calculations.
            Find the best value across hobby boxes, blasters, mega boxes, and ETBs.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">{products.length}</div>
            <div className="text-sm text-gray-400">Total Products</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-white">{Object.keys(sportConfig).filter(s => sportCounts.has(s)).length}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className={`text-2xl font-bold ${avgEVPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgEVPercent >= 0 ? '+' : ''}{avgEVPercent.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Avg EV ROI</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-2xl font-bold text-green-400">
              ${Math.round(bestROI.ev.expectedValue)}
            </div>
            <div className="text-sm text-gray-400">Best EV Product</div>
          </div>
        </div>

        {/* Quick Filters by Sport */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(sportConfig).filter(([s]) => sportCounts.has(s)).map(([sport, cfg]) => (
            <a key={sport} href={`#${sport}`} className={`px-3 py-1.5 rounded-full text-sm font-medium ${cfg.bg} ${cfg.color} border border-gray-700 hover:border-gray-500 transition`}>
              {cfg.emoji} {cfg.label} ({sportCounts.get(sport)})
            </a>
          ))}
        </div>

        {/* Product Grid by Sport */}
        {Object.entries(sportConfig).filter(([s]) => sportCounts.has(s)).map(([sport, cfg]) => {
          const sportProducts = products.filter(p => p.sport === sport);
          return (
            <section key={sport} id={sport} className="mb-10">
              <h2 className={`text-2xl font-bold mb-4 ${cfg.color}`}>
                {cfg.emoji} {cfg.label} Products ({sportProducts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sportProducts.map(product => {
                  const roi = product.ev.roiPercent;
                  const roiColor = roi >= 20 ? 'text-green-400' : roi >= 0 ? 'text-yellow-400' : roi >= -20 ? 'text-orange-400' : 'text-red-400';
                  return (
                    <Link
                      key={product.slug}
                      href={`/products/${product.slug}`}
                      className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-gray-600 transition group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold group-hover:text-blue-400 transition leading-tight flex-1 mr-2">
                          {product.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 shrink-0">
                          {typeLabels[product.type] || product.type}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-white">${product.retailPrice}</div>
                          <div className="text-xs text-gray-500">Retail</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-400">${Math.round(product.ev.expectedValue)}</div>
                          <div className="text-xs text-gray-500">Est. EV</div>
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${roiColor}`}>
                            {roi >= 0 ? '+' : ''}{roi.toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">ROI</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{product.packsPerBox} packs / {product.totalCards} cards</span>
                        <span>{product.hitRates.length} hit types</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Related Tools */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Related Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/tools/sealed-ev', label: 'Sealed EV Calculator', desc: 'Calculate expected value' },
              { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Simulate opening packs' },
              { href: '/tools/wax-vs-singles', label: 'Wax vs Singles', desc: 'Compare buying strategies' },
              { href: '/tools/box-break', label: 'Box Break Calculator', desc: 'Calculate break costs' },
              { href: '/tools/rip-or-hold', label: 'Rip or Hold', desc: 'Should you open it?' },
              { href: '/tools/sealed-yield', label: 'Sealed Yield', desc: 'Long-term sealed value' },
              { href: '/tools/pack-odds', label: 'Pack Odds Calculator', desc: 'Hit rate analysis' },
              { href: '/tools/subscription-boxes', label: 'Subscription Boxes', desc: 'Monthly box reviews' },
            ].map(tool => (
              <Link key={tool.href} href={tool.href} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
                <div className="text-sm font-medium text-blue-400">{tool.label}</div>
                <div className="text-xs text-gray-500">{tool.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Schema */}
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is the best sealed product to buy for value?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Based on expected value analysis, ${bestROI.name} has the best ROI at ${bestROI.ev.roiPercent.toFixed(0)}%. However, EV fluctuates with card prices and should be one factor among many in your buying decision.`,
              },
            },
            {
              '@type': 'Question',
              name: 'How is expected value (EV) calculated for sealed products?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'EV is calculated by multiplying the expected number of each hit type per box by the average market value of that hit, then adding the base card value. ROI compares this total to the retail price.',
              },
            },
            {
              '@type': 'Question',
              name: 'What is the difference between hobby boxes and blasters?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Hobby boxes are premium products sold at card shops with guaranteed hits (autographs, memorabilia cards). Blasters are retail products sold at stores like Target and Walmart at lower prices with no guaranteed premium hits.',
              },
            },
            {
              '@type': 'Question',
              name: 'How many sealed products does CardVault track?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: `CardVault tracks ${products.length} sealed products across baseball, basketball, football, hockey, and Pokemon with detailed hit rates and EV analysis.`,
              },
            },
          ],
        }} />
      </div>
    </div>
  );
}
