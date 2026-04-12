import Link from 'next/link';
import type { Metadata } from 'next';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you\'re looking for doesn\'t exist. Search for sports cards and Pokémon TCG cards on CardVault.',
};

const featuredCards = [
  { slug: '1952-topps-mickey-mantle-311', name: '1952 Topps Mickey Mantle', value: '$50K–$5M+', sport: '⚾' },
  { slug: '1986-87-fleer-michael-jordan-57', name: '1986-87 Fleer Michael Jordan', value: '$5K–$738K', sport: '🏀' },
  { slug: '2009-bowman-chrome-mike-trout-bdpp89', name: '2009 Bowman Chrome Trout', value: '$1K–$400K', sport: '⚾' },
  { slug: '2000-playoff-contenders-tom-brady-144', name: '2000 Playoff Contenders Brady', value: '$3K–$2.25M', sport: '🏈' },
];

export default function NotFound() {
  // Pick 2 random additional sports cards as suggestions
  const randomCards = [...sportsCards]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      {/* 404 visual */}
      <div className="mb-8">
        <p className="text-8xl font-black text-gray-800 leading-none select-none">404</p>
        <div className="text-4xl -mt-4 mb-6">🃏</div>
        <h1 className="text-2xl font-bold text-white mb-3">Card not found</h1>
        <p className="text-gray-400 text-base">
          That page doesn&apos;t exist — but our database of {sportsCards.length.toLocaleString()}+ sports cards and 20,000+ Pokémon cards might have what you&apos;re looking for.
        </p>
      </div>

      {/* Search prompt */}
      <div className="mb-10">
        <Link
          href="/price-guide"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          Search all cards
        </Link>
        <Link
          href="/"
          className="ml-3 inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-6 py-3 rounded-xl transition-colors text-sm border border-gray-700"
        >
          Go home
        </Link>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { href: '/sports', label: 'Sports Cards', icon: '🃏' },
          { href: '/pokemon', label: 'Pokémon TCG', icon: '⚡' },
          { href: '/guides', label: 'Guides', icon: '📖' },
          { href: '/tools', label: 'Tools', icon: '🔧' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-white text-xs font-medium">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Popular cards */}
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Popular Cards to Explore</p>
        <div className="space-y-2">
          {featuredCards.map(card => (
            <Link
              key={card.slug}
              href={`/sports/${card.slug}`}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-emerald-500/40 rounded-xl px-4 py-3 transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{card.sport}</span>
                <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{card.name}</span>
              </div>
              <span className="text-emerald-400 text-xs font-semibold">{card.value}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
