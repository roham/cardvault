import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RipOrSkipClient from './RipOrSkipClient';

export const metadata: Metadata = {
  title: 'Rip or Skip — Should You Open This Product?',
  description: 'Daily voting game for card collectors. Should you rip or skip today\'s sealed product? Vote, see community results, and track your rip streak. New product every day.',
  openGraph: {
    title: 'Rip or Skip — CardVault',
    description: 'Should you rip or skip today\'s sealed product? Vote daily and see what the community thinks. Sports cards + Pokemon.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Rip or Skip — CardVault',
    description: 'Daily voting: should you rip or skip today\'s sealed product? Vote and see community results.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Rip or Skip' },
];

export default function RipOrSkipPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Rip or Skip',
        description: 'Daily voting game for card collectors. Should you rip or skip today\'s sealed product?',
        url: 'https://cardvault-two.vercel.app/rip-or-skip',
        applicationCategory: 'Entertainment',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent mb-3">
          Rip or Skip
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Should you open today&apos;s product? Vote and see what the community thinks.
        </p>
      </div>

      <RipOrSkipClient />

      {/* Related Tools */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/pack-sim" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Pack Simulator</h3>
            <p className="text-sm text-gray-400 mt-1">Want to rip virtually? Try the simulator.</p>
          </Link>
          <Link href="/tools/sealed-ev" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Sealed Product EV</h3>
            <p className="text-sm text-gray-400 mt-1">Check the full EV breakdown for any product.</p>
          </Link>
          <Link href="/tools/daily-pack" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Daily Free Pack</h3>
            <p className="text-sm text-gray-400 mt-1">Open a free daily pack instead.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
