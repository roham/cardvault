import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyGlossaryClient, { GLOSSARY } from './HobbyGlossaryClient';

export const metadata: Metadata = {
  title: 'Hobby Glossary — 60+ Trading Card Terms Defined | CardVault',
  description: 'Comprehensive sports and Pokémon card glossary. 60+ terms from grading, production, market dynamics, slang, and trading covered — RC, RPA, FMV, pop report, shill bid, whatsit, flip, bump, crack-out, grail, and more. Alphabetized, searchable, filterable by category.',
  openGraph: {
    title: 'Hobby Glossary — CardVault',
    description: 'The definitive trading-card dictionary. 60+ terms across grading, production, market dynamics, slang, and more.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Hobby Glossary — CardVault',
    description: 'RC, RPA, FMV, pop report, crack-out, grail — every hobby term you need to know.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Hobby Glossary' },
];

export default function HobbyGlossaryPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        name: 'CardVault Hobby Glossary',
        description: 'Comprehensive dictionary of sports and Pokémon trading card terminology covering grading, production, market dynamics, and collector slang.',
        url: 'https://cardvault-two.vercel.app/hobby-glossary',
        inDefinedTermSet: 'CardVault Hobby Glossary',
        numberOfItems: GLOSSARY.length,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Hobby Glossary — 60+ Trading Card Terms Defined',
        description: 'Comprehensive trading-card dictionary.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', logo: { '@type': 'ImageObject', url: 'https://cardvault-two.vercel.app/icon.svg' } },
        datePublished: '2026-04-16',
        dateModified: '2026-04-16',
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          {GLOSSARY.length} terms &middot; alphabetized &middot; searchable
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Hobby Glossary</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Every term a collector hears and every piece of hobby slang defined. The hobby uses a private vocabulary &mdash; RC, RPA, FMV, pop report, shill bid, crack-out, grail, whatsit &mdash; and this glossary is the single reference for all of it. Alphabetized for scanning, searchable by keyword, filterable by category. Written for collectors at every experience level.
        </p>
      </div>

      <HobbyGlossaryClient />

      <div className="mt-10 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Guides</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/guides" className="text-amber-300 hover:text-amber-200">All Guides</Link>
          <Link href="/card-encyclopedia" className="text-amber-300 hover:text-amber-200">Card Encyclopedia</Link>
          <Link href="/card-lingo" className="text-amber-300 hover:text-amber-200">Card Lingo</Link>
          <Link href="/card-faq" className="text-amber-300 hover:text-amber-200">Card FAQ</Link>
          <Link href="/beginners-guide" className="text-amber-300 hover:text-amber-200">Beginner&rsquo;s Guide</Link>
          <Link href="/autographs-guide" className="text-amber-300 hover:text-amber-200">Autographs Guide</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-amber-300 hover:text-amber-200">&larr; Home</Link>
        <Link href="/tools" className="text-amber-300 hover:text-amber-200">Tools</Link>
      </div>
    </div>
  );
}
