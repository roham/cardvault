import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sealedProducts, calculateEV, type SealedProduct } from '@/data/sealed-products';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return sealedProducts.map(p => ({ slug: p.slug }));
}

function findProduct(slug: string): SealedProduct | undefined {
  return sealedProducts.find(p => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: 'Product Not Found' };

  const ev = calculateEV(product);
  const sportLabel = product.sport.charAt(0).toUpperCase() + product.sport.slice(1);

  return {
    title: `${product.name} — EV $${Math.round(ev.expectedValue)} | Hit Rates & Value Analysis`,
    description: `${product.name} expected value analysis: $${Math.round(ev.expectedValue)} EV on $${product.retailPrice} retail (${ev.roiPercent >= 0 ? '+' : ''}${ev.roiPercent.toFixed(0)}% ROI). ${product.packsPerBox} packs, ${product.hitRates.length} hit types. ${product.description.slice(0, 100)}`,
    openGraph: {
      title: `${product.name} — EV Analysis | CardVault`,
      description: `$${Math.round(ev.expectedValue)} EV on $${product.retailPrice} retail. ${product.description.slice(0, 120)}`,
      type: 'article',
    },
    alternates: { canonical: './' },
  };
}

const sportConfig: Record<string, { label: string; emoji: string; color: string; bgGradient: string }> = {
  baseball: { label: 'Baseball', emoji: '⚾', color: 'text-red-400', bgGradient: 'from-red-950/40 to-gray-950' },
  basketball: { label: 'Basketball', emoji: '🏀', color: 'text-orange-400', bgGradient: 'from-orange-950/40 to-gray-950' },
  football: { label: 'Football', emoji: '🏈', color: 'text-green-400', bgGradient: 'from-green-950/40 to-gray-950' },
  hockey: { label: 'Hockey', emoji: '🏒', color: 'text-blue-400', bgGradient: 'from-blue-950/40 to-gray-950' },
  pokemon: { label: 'Pokemon', emoji: '⚡', color: 'text-yellow-400', bgGradient: 'from-yellow-950/40 to-gray-950' },
};

const typeLabels: Record<string, string> = {
  'hobby-box': 'Hobby Box',
  'blaster': 'Blaster Box',
  'mega-box': 'Mega Box',
  'hanger': 'Hanger Pack',
  'fat-pack': 'Fat Pack / Bundle',
  'etb': 'Elite Trainer Box',
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const ev = calculateEV(product);
  const cfg = sportConfig[product.sport] || sportConfig.baseball;
  const roiColor = ev.roiPercent >= 20 ? 'text-green-400' : ev.roiPercent >= 0 ? 'text-yellow-400' : ev.roiPercent >= -20 ? 'text-orange-400' : 'text-red-400';

  // Related products: same sport, different product
  const related = sealedProducts
    .filter(p => p.sport === product.sport && p.slug !== product.slug)
    .slice(0, 6);

  // Cross-sport similar type
  const sameType = sealedProducts
    .filter(p => p.type === product.type && p.sport !== product.sport)
    .slice(0, 4);

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: `https://cardvault-two.vercel.app/products/${product.slug}`,
    brand: { '@type': 'Brand', name: product.brand },
    category: `${cfg.label} Cards > Sealed Products > ${typeLabels[product.type] || product.type}`,
    offers: {
      '@type': 'Offer',
      price: product.retailPrice,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: product.ebaySearchUrl,
    },
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.bgGradient}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={crumbs} />
        <JsonLd data={jsonLd} />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full bg-gray-800 ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {typeLabels[product.type] || product.type}
            </span>
            <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {product.year}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
          <p className="text-gray-400 text-lg">{product.description}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Retail Price</div>
            <div className="text-2xl font-bold text-white">${product.retailPrice}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Expected Value</div>
            <div className="text-2xl font-bold text-blue-400">${Math.round(ev.expectedValue)}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">ROI</div>
            <div className={`text-2xl font-bold ${roiColor}`}>
              {ev.roiPercent >= 0 ? '+' : ''}{ev.roiPercent.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">EV Delta</div>
            <div className={`text-2xl font-bold ${ev.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {ev.roi >= 0 ? '+' : ''}${Math.round(ev.roi)}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h2 className="text-lg font-bold mb-3">Product Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-400">Brand</dt>
                <dd className="font-medium">{product.brand}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Year</dt>
                <dd className="font-medium">{product.year}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Format</dt>
                <dd className="font-medium">{typeLabels[product.type] || product.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Packs per Box</dt>
                <dd className="font-medium">{product.packsPerBox}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Cards per Pack</dt>
                <dd className="font-medium">{product.cardsPerPack}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Total Cards</dt>
                <dd className="font-medium">{product.totalCards}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Base Card Value</dt>
                <dd className="font-medium">${product.baseCardValue}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Release Date</dt>
                <dd className="font-medium">{product.releaseDate}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-gray-900 rounded-lg p-5 border border-gray-800">
            <h2 className="text-lg font-bold mb-3">EV Verdict</h2>
            <div className="mb-4">
              {ev.roiPercent >= 20 ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-green-400 font-bold text-lg mb-1">Strong Value</div>
                  <p className="text-sm text-gray-300">Expected value exceeds retail by {ev.roiPercent.toFixed(0)}%. This product offers above-average returns based on current market prices.</p>
                </div>
              ) : ev.roiPercent >= 0 ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-yellow-400 font-bold text-lg mb-1">Neutral / Fair</div>
                  <p className="text-sm text-gray-300">EV is roughly at retail. You are likely to break even or slightly profit based on average pull rates.</p>
                </div>
              ) : ev.roiPercent >= -20 ? (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <div className="text-orange-400 font-bold text-lg mb-1">Below Average</div>
                  <p className="text-sm text-gray-300">Expected value is {Math.abs(ev.roiPercent).toFixed(0)}% below retail. You will need above-average pulls to break even.</p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="text-red-400 font-bold text-lg mb-1">Poor Value</div>
                  <p className="text-sm text-gray-300">EV is significantly below retail ({ev.roiPercent.toFixed(0)}%). Consider buying singles instead unless you enjoy the ripping experience.</p>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              * EV is based on average pull rates and current market prices. Actual results will vary.
              Opening sealed product is gambling — only spend what you can afford to lose.
            </div>
          </div>
        </div>

        {/* Hit Rates Table */}
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 mb-8">
          <h2 className="text-lg font-bold mb-4">Hit Rates & Expected Value Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 pr-4 text-gray-400 font-medium">Insert Type</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Odds</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Avg Value</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Expected Hits</th>
                  <th className="text-right py-2 pl-3 text-gray-400 font-medium">Expected $</th>
                </tr>
              </thead>
              <tbody>
                {ev.hitBreakdown.map((hit, i) => {
                  const hitRate = product.hitRates[i];
                  return (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="py-2.5 pr-4">
                        <div className="font-medium text-white">{hit.insert}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{hitRate.description}</div>
                      </td>
                      <td className="text-right py-2.5 px-3 text-gray-300 font-mono text-xs">{hitRate.odds}</td>
                      <td className="text-right py-2.5 px-3 text-gray-300">${hitRate.avgValue}</td>
                      <td className="text-right py-2.5 px-3 text-gray-300">{hit.expectedHits.toFixed(1)}</td>
                      <td className="text-right py-2.5 pl-3 text-blue-400 font-medium">${Math.round(hit.expectedValue)}</td>
                    </tr>
                  );
                })}
                <tr className="border-b border-gray-800/50">
                  <td className="py-2.5 pr-4 text-gray-400">Base Card Value</td>
                  <td className="text-right py-2.5 px-3 text-gray-500">—</td>
                  <td className="text-right py-2.5 px-3 text-gray-500">—</td>
                  <td className="text-right py-2.5 px-3 text-gray-500">—</td>
                  <td className="text-right py-2.5 pl-3 text-blue-400 font-medium">${product.baseCardValue}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-3 pr-4 text-white">Total Expected Value</td>
                  <td colSpan={3}></td>
                  <td className="text-right py-3 pl-3 text-blue-400 text-lg">${Math.round(ev.expectedValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Buy Link */}
        <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 mb-8 text-center">
          <a
            href={product.ebaySearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
          >
            Search on eBay
          </a>
          <p className="text-xs text-gray-500 mt-2">Find current listings and recent sales</p>
        </div>

        {/* Related Products — Same Sport */}
        {related.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">More {cfg.label} Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(p => {
                const pev = calculateEV(p);
                return (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-600 transition">
                    <h3 className="text-sm font-semibold mb-1 hover:text-blue-400">{p.name}</h3>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>${p.retailPrice}</span>
                      <span>EV ${Math.round(pev.expectedValue)}</span>
                      <span className={pev.roiPercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {pev.roiPercent >= 0 ? '+' : ''}{pev.roiPercent.toFixed(0)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Cross-Sport Same Type */}
        {sameType.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Other {typeLabels[product.type] || product.type} Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sameType.map(p => {
                const pev = calculateEV(p);
                const pcfg = sportConfig[p.sport] || sportConfig.baseball;
                return (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-600 transition">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs ${pcfg.color}`}>{pcfg.emoji}</span>
                      <h3 className="text-sm font-semibold hover:text-blue-400">{p.name}</h3>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>${p.retailPrice}</span>
                      <span>EV ${Math.round(pev.expectedValue)}</span>
                      <span className={pev.roiPercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {pev.roiPercent >= 0 ? '+' : ''}{pev.roiPercent.toFixed(0)}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Tools CTA */}
        <section className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-bold mb-3">Analyze This Product</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/tools/sealed-ev" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition text-center">
              <div className="text-sm font-medium text-blue-400">EV Calculator</div>
              <div className="text-xs text-gray-500">Detailed analysis</div>
            </Link>
            <Link href="/tools/pack-sim" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition text-center">
              <div className="text-sm font-medium text-blue-400">Pack Simulator</div>
              <div className="text-xs text-gray-500">Virtual rip</div>
            </Link>
            <Link href="/tools/wax-vs-singles" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition text-center">
              <div className="text-sm font-medium text-blue-400">Wax vs Singles</div>
              <div className="text-xs text-gray-500">Compare strategies</div>
            </Link>
            <Link href="/tools/rip-or-hold" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition text-center">
              <div className="text-sm font-medium text-blue-400">Rip or Hold</div>
              <div className="text-xs text-gray-500">Open or invest?</div>
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `Is ${product.name} worth buying?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `Based on EV analysis, ${product.name} has an expected value of $${Math.round(ev.expectedValue)} on a $${product.retailPrice} retail price (${ev.roiPercent >= 0 ? '+' : ''}${ev.roiPercent.toFixed(0)}% ROI). ${ev.roiPercent >= 0 ? 'The EV is at or above retail, suggesting reasonable value.' : 'The EV is below retail, meaning you will need above-average luck to break even.'} Individual results vary widely.`,
              },
            },
            {
              '@type': 'Question',
              name: `What are the best pulls from ${product.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `The highest-value insert type is ${ev.hitBreakdown.sort((a, b) => b.expectedValue - a.expectedValue)[0].insert} with an average value of $${product.hitRates.sort((a, b) => b.avgValue - a.avgValue)[0].avgValue}. ${product.hitRates.map(h => h.insert).join(', ')} are all available as pulls.`,
              },
            },
            {
              '@type': 'Question',
              name: `How many packs are in ${product.name}?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${product.name} contains ${product.packsPerBox} packs with ${product.cardsPerPack} cards per pack for a total of ${product.totalCards} cards per box.`,
              },
            },
          ],
        }} />
      </div>
    </div>
  );
}
