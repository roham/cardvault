import Link from 'next/link';
import Image from 'next/image';
import InstantSearch from '@/components/InstantSearch';
import NewsCard from '@/components/NewsCard';
import { newsItems } from '@/data/news';
import { sportsCards } from '@/data/sports-cards';

const featuredSportsCards = [
  sportsCards.find(c => c.slug === '1986-87-fleer-michael-jordan-57')!,
  sportsCards.find(c => c.slug === '2000-playoff-contenders-tom-brady-144')!,
  sportsCards.find(c => c.slug === '1979-80-opee-chee-wayne-gretzky-18')!,
];

const featuredPokemonCards = [
  {
    name: 'Charizard ex SAR',
    set: 'Obsidian Flames',
    price: '$180–$320',
    rarity: 'Special Art Rare',
    gradient: 'from-orange-900 via-red-900 to-gray-900',
    href: '/pokemon',
    emoji: '🔥',
  },
  {
    name: 'Pikachu ex SAR',
    set: 'Scarlet & Violet 151',
    price: '$45–$90',
    rarity: 'Special Art Rare',
    gradient: 'from-yellow-900 via-amber-900 to-gray-900',
    href: '/pokemon',
    emoji: '⚡',
  },
  {
    name: 'Umbreon ex SAR',
    set: 'Prismatic Evolutions',
    price: '$60–$120',
    rarity: 'Special Art Rare',
    gradient: 'from-indigo-900 via-purple-900 to-gray-900',
    href: '/pokemon',
    emoji: '🌙',
  },
];

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

const sportGradients: Record<string, string> = {
  baseball: 'from-red-900 to-red-800',
  basketball: 'from-orange-900 to-orange-800',
  football: 'from-blue-900 to-blue-800',
  hockey: 'from-cyan-900 to-cyan-800',
};

export default function HomePage() {
  const latestNews = newsItems.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gray-950 border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live market data from Pokémon TCG API + curated sports card database
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Know What Your<br />
              <span className="text-emerald-400">Cards Are Worth</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mb-10 max-w-xl leading-relaxed">
              Browse 15,000+ Pokémon TCG cards with live prices. Explore 100+ iconic sports cards from every era. One place for the entire hobby.
            </p>
            <div className="max-w-xl">
              <InstantSearch
                sportsCards={sportsCards}
                large
                placeholder="Search Charizard, Jordan rookie, Gretzky..."
              />
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {['PSA 10 Grading', 'Rookie Cards', 'Vintage Baseball', 'Pokémon Vintage', 'Modern NBA'].map(tag => (
                <Link
                  key={tag}
                  href={`/price-guide?q=${encodeURIComponent(tag)}`}
                  className="text-xs text-gray-400 hover:text-emerald-400 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 px-3 py-1 rounded-full transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Market Pulse */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Market Pulse</h2>
            <p className="text-gray-400 text-sm mt-1">High-value cards collectors are watching right now</p>
          </div>
          <Link href="/price-guide" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            Full Price Guide →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sports column */}
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Sports Cards</h3>
            <div className="space-y-3">
              {featuredSportsCards.map(card => (
                <Link key={card.slug} href={`/sports/${card.slug}`} className="group block">
                  <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${sportGradients[card.sport]} flex items-center justify-center text-2xl shrink-0`}>
                      {sportIcons[card.sport]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-emerald-400 transition-colors">{card.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 capitalize">{card.sport} · {card.year}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 text-sm font-bold">{card.estimatedValueRaw}</p>
                      {card.rookie && <span className="text-xs text-gray-500">Rookie Card</span>}
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/sports" className="block text-center py-2.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium border border-emerald-900/50 hover:border-emerald-800 rounded-xl transition-all">
                Browse all sports cards →
              </Link>
            </div>
          </div>

          {/* Pokémon column */}
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Pokémon TCG</h3>
            <div className="space-y-3">
              {featuredPokemonCards.map(card => (
                <Link key={card.name} href={card.href} className="group block">
                  <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-2xl shrink-0`}>
                      {card.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-emerald-400 transition-colors">{card.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{card.set} · {card.rarity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 text-sm font-bold">{card.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/pokemon" className="block text-center py-2.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium border border-emerald-900/50 hover:border-emerald-800 rounded-xl transition-all">
                Browse all Pokémon sets →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick-start links */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Where do you want to start?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              {
                href: '/pokemon',
                title: 'Browse Pokémon Cards',
                description: '15,000+ cards with live TCGPlayer prices across every set from Base through Scarlet & Violet',
                icon: '⚡',
                color: 'from-yellow-900/50 to-amber-900/30',
                border: 'border-yellow-800/30 hover:border-yellow-600/50',
              },
              {
                href: '/sports',
                title: 'Browse Sports Cards',
                description: '100+ iconic cards across baseball, basketball, football, and hockey — from T206 Wagner to Wembanyama',
                icon: '🏆',
                color: 'from-blue-900/50 to-indigo-900/30',
                border: 'border-blue-800/30 hover:border-blue-600/50',
              },
              {
                href: '/price-guide',
                title: 'Price Guide',
                description: 'Searchable, filterable price table covering both sports and Pokémon cards with sorting by year and set',
                icon: '📊',
                color: 'from-emerald-900/50 to-teal-900/30',
                border: 'border-emerald-800/30 hover:border-emerald-600/50',
              },
              {
                href: '/tools',
                title: 'Collector Tools',
                description: 'Grade value calculator, grading cost estimator, and eBay sold search generator — free, no account needed',
                icon: '🛠️',
                color: 'from-purple-900/50 to-violet-900/30',
                border: 'border-purple-800/30 hover:border-purple-600/50',
              },
              {
                href: '/guides',
                title: 'Collector Guides',
                description: 'How to start collecting, when to grade, how to read price data, and the history of card eras explained',
                icon: '📖',
                color: 'from-rose-900/50 to-pink-900/30',
                border: 'border-rose-800/30 hover:border-rose-600/50',
              },
            ].map(item => (
              <Link key={item.href} href={item.href} className="group block">
                <div className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-6 h-full transition-all hover:-translate-y-0.5 hover:shadow-lg`}>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Latest News</h2>
            <p className="text-gray-400 text-sm mt-1">Market moves, set releases, and grading updates</p>
          </div>
          <Link href="/news" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            All news →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestNews.map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-emerald-950 to-gray-950 border-t border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to explore?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Start with our complete Pokémon TCG set browser or dive into iconic sports cards from every era.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pokemon"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Browse Pokémon Sets
            </Link>
            <Link
              href="/sports"
              className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors border border-gray-700"
            >
              Explore Sports Cards
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
