import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cardBrands, getBrandBySlug } from '@/data/brands';
import { sportsCards } from '@/data/sports-cards';
import { sealedProducts } from '@/data/sealed-products';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return cardBrands.map(b => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) return { title: 'Brand Not Found' };

  return {
    title: `${brand.name} Card Guide — History, Products, Collecting Tips`,
    description: `Complete guide to ${brand.name} cards. ${brand.description.slice(0, 120)} Key products, collecting tips, and famous cards.`,
    openGraph: {
      title: `${brand.name} Card Guide — CardVault`,
      description: `Everything about ${brand.name} cards. History, products, and tips.`,
      type: 'article',
    },
    alternates: { canonical: './' },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  // Count cards and products from this brand
  const brandCards = sportsCards.filter(c => {
    const setLower = c.set.toLowerCase();
    const brandLower = brand.name.toLowerCase();
    if (brandLower === 'topps') return setLower.includes('topps') && !setLower.includes('bowman');
    if (brandLower === 'panini') return setLower.includes('panini') || setLower.includes('prizm') || setLower.includes('donruss') || setLower.includes('select') || setLower.includes('contenders') || setLower.includes('mosaic') || setLower.includes('optic');
    if (brandLower.includes('upper deck')) return setLower.includes('upper deck') || setLower.includes('sp ') || setLower.includes('o-pee-chee');
    if (brandLower.includes('bowman')) return setLower.includes('bowman');
    if (brandLower === 'fleer') return setLower.includes('fleer');
    return false;
  });

  const brandProducts = sealedProducts.filter(p => {
    const bLower = p.brand.toLowerCase();
    if (brand.slug === 'topps') return bLower === 'topps';
    if (brand.slug === 'panini') return bLower === 'panini';
    if (brand.slug === 'upper-deck') return bLower === 'upper deck';
    if (brand.slug === 'pokemon-tcg') return bLower === 'pokemon';
    if (brand.slug === 'bowman') return bLower === 'bowman';
    return false;
  });

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/brands' },
    { label: brand.name },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    description: brand.description,
    url: `https://cardvault-two.vercel.app/brands/${brand.slug}`,
    foundingDate: brand.founded.toString(),
    address: { '@type': 'PostalAddress', addressLocality: brand.headquarters },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={crumbs} />
        <JsonLd data={jsonLd} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{brand.name}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-400">Est. {brand.founded}</span>
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-400">{brand.headquarters}</span>
            {brand.sports.map(s => (
              <span key={s} className="text-sm px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 capitalize">{s}</span>
            ))}
          </div>
          <p className="text-gray-400 text-lg">{brand.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold text-white">{brandCards.length}</div>
            <div className="text-sm text-gray-400">Cards in Database</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold text-white">{brandProducts.length}</div>
            <div className="text-sm text-gray-400">Sealed Products</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-center">
            <div className="text-2xl font-bold text-white">{brand.keyProducts.length}</div>
            <div className="text-sm text-gray-400">Product Lines</div>
          </div>
        </div>

        {/* History */}
        <section className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-bold mb-3">History</h2>
          <p className="text-gray-300 leading-relaxed">{brand.history}</p>
        </section>

        {/* Key Products */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Key Product Lines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brand.keyProducts.map(product => (
              <div key={product.name} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                {product.slug ? (
                  <Link href={`/products/${product.slug}`} className="text-base font-semibold text-blue-400 hover:text-blue-300 transition">
                    {product.name}
                  </Link>
                ) : (
                  <h3 className="text-base font-semibold">{product.name}</h3>
                )}
                <p className="text-sm text-gray-400 mt-1">{product.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Famous Cards */}
        <section className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-bold mb-4">Most Famous Cards</h2>
          <div className="space-y-3">
            {brand.famousCards.map((card, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <div className="font-medium">{card.name}</div>
                  <div className="text-xs text-gray-500">{card.year}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collecting Tips */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Collecting Tips</h2>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <ul className="space-y-3">
              {brand.collectingTips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pros & Cons */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-500/5 rounded-lg p-5 border border-green-500/20">
            <h3 className="text-lg font-bold text-green-400 mb-3">Pros</h3>
            <ul className="space-y-2">
              {brand.prosAndCons.pros.map((pro, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-green-400 shrink-0">+</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-500/5 rounded-lg p-5 border border-red-500/20">
            <h3 className="text-lg font-bold text-red-400 mb-3">Cons</h3>
            <ul className="space-y-2">
              {brand.prosAndCons.cons.map((con, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-red-400 shrink-0">-</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sealed Products from this brand */}
        {brandProducts.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-4">{brand.name} Sealed Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {brandProducts.map(p => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-gray-600 transition">
                  <h3 className="text-sm font-semibold hover:text-blue-400 mb-1">{p.name}</h3>
                  <div className="text-xs text-gray-500">${p.retailPrice} retail</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Other Brands */}
        <section className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-bold mb-3">Other Brands</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cardBrands.filter(b => b.slug !== brand.slug).map(b => (
              <Link key={b.slug} href={`/brands/${b.slug}`} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
                <div className="text-sm font-medium text-blue-400">{b.name}</div>
                <div className="text-xs text-gray-500">Est. {b.founded}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: `What are the best ${brand.name} cards to collect?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `The most valuable ${brand.name} cards include ${brand.famousCards.slice(0, 3).map(c => c.name).join(', ')}. ${brand.collectingTips[0]}`,
              },
            },
            {
              '@type': 'Question',
              name: `When was ${brand.name} founded?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${brand.name} was founded in ${brand.founded} and is headquartered in ${brand.headquarters}. ${brand.history.split('.').slice(0, 2).join('.')}.`,
              },
            },
            {
              '@type': 'Question',
              name: `What sports does ${brand.name} cover?`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${brand.name} produces cards for ${brand.sports.join(', ')}. Their key product lines include ${brand.keyProducts.slice(0, 3).map(p => p.name).join(', ')}.`,
              },
            },
          ],
        }} />
      </div>
    </div>
  );
}
