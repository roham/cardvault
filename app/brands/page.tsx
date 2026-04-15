import type { Metadata } from 'next';
import Link from 'next/link';
import { cardBrands } from '@/data/brands';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Card Brand Guide — Topps, Panini, Upper Deck, Pokemon & More',
  description: 'Complete guide to every major card brand. Learn about Topps, Panini, Upper Deck, Pokemon TCG, Bowman, and Fleer. History, key products, collecting tips, and famous cards for each brand.',
  openGraph: {
    title: 'Card Brand Guide — CardVault',
    description: 'Everything you need to know about Topps, Panini, Upper Deck, Pokemon TCG, Bowman, and Fleer.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

export default function BrandsPage() {
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Brands' }];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb items={crumbs} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Card Brand Guide',
          description: 'Complete guide to every major card brand.',
          url: 'https://cardvault-two.vercel.app/brands',
          numberOfItems: cardBrands.length,
        }} />

        <h1 className="text-3xl md:text-4xl font-bold mb-3">Card Brand Guide</h1>
        <p className="text-gray-400 text-lg mb-8 max-w-3xl">
          Everything you need to know about the {cardBrands.length} major card brands.
          History, key products, collecting tips, and the most famous cards from each manufacturer.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cardBrands.map(brand => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-600 transition group"
            >
              <h2 className="text-xl font-bold group-hover:text-blue-400 transition mb-1">{brand.name}</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">Est. {brand.founded}</span>
                {brand.sports.map(s => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">{s}</span>
                ))}
              </div>
              <p className="text-sm text-gray-400 line-clamp-3 mb-3">{brand.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{brand.keyProducts.length} key products</span>
                <span>{brand.famousCards.length} famous cards</span>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Related Resources</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/products" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Sealed Products</div>
              <div className="text-xs text-gray-500">Browse 58 products</div>
            </Link>
            <Link href="/tools/era-guide" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Era Guide</div>
              <div className="text-xs text-gray-500">Cards by decade</div>
            </Link>
            <Link href="/tools/open-guide" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">What to Open?</div>
              <div className="text-xs text-gray-500">Product recommender</div>
            </Link>
            <Link href="/tools/auth-check" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Auth Checker</div>
              <div className="text-xs text-gray-500">Verify authenticity</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
