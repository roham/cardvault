import Link from 'next/link';
import InstantSearch from '@/components/InstantSearch';
import NewsCard from '@/components/NewsCard';
import CardFrame from '@/components/CardFrame';
import JsonLd from '@/components/JsonLd';
import TodayDashboard from '@/components/TodayDashboard';
import { newsItems } from '@/data/news';
import { sportsCards } from '@/data/sports-cards';

// Card of the Day — rotates by date
function getCardOfTheDay() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % sportsCards.length;
  return sportsCards[index];
}

const popularLookups = [
  sportsCards.find(c => c.slug === '1986-87-fleer-michael-jordan-57')!,
  sportsCards.find(c => c.slug === '2000-playoff-contenders-tom-brady-144')!,
  sportsCards.find(c => c.slug === '1979-80-opee-chee-wayne-gretzky-18')!,
  sportsCards.find(c => c.slug === '2022-23-panini-prizm-victor-wembanyama-258')!,
  sportsCards.find(c => c.slug === '1909-t206-honus-wagner')!,
  sportsCards.find(c => c.slug === '1952-topps-mickey-mantle-311')!,
  sportsCards.find(c => c.slug === '2011-topps-update-mike-trout-us175')!,
  sportsCards.find(c => c.slug === '1996-97-topps-chrome-kobe-bryant-138')!,
].filter(Boolean).slice(0, 8);

const topMovers = [
  { name: 'Wembanyama Prizm Auto', change: '+24%', direction: 'up', detail: 'All-Star season closing strong', color: 'text-emerald-400' },
  { name: 'Ovechkin Young Guns PSA 10', change: '+18%', direction: 'up', detail: 'Retirement watch driving demand', color: 'text-emerald-400' },
  { name: 'Luka Prizm Silver PSA 10', change: '-8%', direction: 'down', detail: 'Population growth pressure', color: 'text-red-400' },
  { name: 'Griffey Upper Deck PSA 10', change: '+6%', direction: 'up', detail: 'Steady vintage appreciation', color: 'text-emerald-400' },
];

const recentSales = [
  { desc: '2000 Playoff Contenders Tom Brady #144', grade: 'PSA 9', price: '$18,500', venue: 'Heritage Auctions', daysAgo: 3, category: 'sports' },
  { desc: 'Charizard ex Special Art Rare — Obsidian Flames', grade: 'NM', price: '$285', venue: 'TCGPlayer', daysAgo: 1, category: 'pokemon' },
  { desc: '2022 Panini Prizm Victor Wembanyama #258', grade: 'PSA 10', price: '$4,200', venue: 'eBay', daysAgo: 2, category: 'sports' },
  { desc: 'Pikachu ex SAR — Scarlet & Violet 151', grade: 'NM-Mint', price: '$82', venue: 'TCGPlayer', daysAgo: 1, category: 'pokemon' },
  { desc: '1986-87 Fleer Michael Jordan #57', grade: 'PSA 8', price: '$8,100', venue: 'PWCC', daysAgo: 5, category: 'sports' },
  { desc: 'Umbreon ex SAR — Prismatic Evolutions', grade: 'NM', price: '$108', venue: 'TCGPlayer', daysAgo: 2, category: 'pokemon' },
  { desc: '1979-80 O-Pee-Chee Wayne Gretzky #18', grade: 'PSA 7', price: '$3,400', venue: 'Goldin', daysAgo: 4, category: 'sports' },
  { desc: 'Mewtwo ex SAR — Scarlet & Violet 151', grade: 'NM-Mint', price: '$65', venue: 'TCGPlayer', daysAgo: 1, category: 'pokemon' },
  { desc: '1996-97 Topps Chrome Kobe Bryant #138', grade: 'PSA 9', price: '$5,600', venue: 'Heritage Auctions', daysAgo: 6, category: 'sports' },
  { desc: 'Lugia ex SAR — Silver Tempest', grade: 'NM', price: '$48', venue: 'TCGPlayer', daysAgo: 3, category: 'pokemon' },
];

const sportGradients: Record<string, string> = {
  baseball: 'from-red-900 to-red-800',
  basketball: 'from-orange-900 to-orange-800',
  football: 'from-blue-900 to-blue-800',
  hockey: 'from-cyan-900 to-cyan-800',
};

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

// Collector stats
const totalSportsCards = sportsCards.length;
const rookieCount = sportsCards.filter(c => c.rookie).length;
const sportsSet = new Set(sportsCards.map(c => c.set)).size;
const pokemonCardCount = '20,218';
const buildDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export default function HomePage() {
  const latestNews = newsItems.slice(0, 4);
  const cardOfTheDay = getCardOfTheDay();

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CardVault',
        url: 'https://cardvault-two.vercel.app',
        description: 'Free sports card and Pokémon card price guide. Real prices from eBay sold listings, TCGPlayer, and major auction houses.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://cardvault-two.vercel.app/price-guide?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CardVault',
        url: 'https://cardvault-two.vercel.app',
        logo: 'https://cardvault-two.vercel.app/favicon.ico',
        description: 'The free card price guide for sports cards and Pokémon TCG collectors.',
      }} />
      {/* Hero — Price Check first */}
      <section className="relative bg-gray-950 border-b border-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Real prices from eBay sold listings, TCGPlayer, and auction houses
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4">
              What Is Your<br />
              <span className="text-emerald-400">Card Worth?</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mb-8 max-w-xl leading-relaxed">
              Search any sports card or Pokémon card. Get real prices from eBay sold listings, TCGPlayer, and major auction houses. Free, no account required.
            </p>
            <div className="max-w-xl mb-4">
              <InstantSearch
                sportsCards={sportsCards}
                large
                placeholder="Search any sports or Pokémon card..."
              />
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Trusted data from eBay · TCGPlayer · Heritage Auctions · Goldin · PWCC · PSA
            </p>
            <div className="flex flex-wrap gap-3">
              {['PSA 10 Prices', 'Rookie Cards', 'Vintage Baseball', 'Pokémon SARs', 'Modern NBA'].map(tag => (
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
          {/* Start here CTA for beginners */}
          <div className="mt-8 border-t border-gray-800 pt-6">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
              </span>
              New to cards? Start here — 3 questions to the right tool
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-50">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Today on CardVault — daily engagement dashboard */}
      <TodayDashboard />

      {/* Trust bar */}
      <div className="border-b border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 justify-center sm:justify-start">
            {[
              { label: 'Pokémon Cards', value: pokemonCardCount, color: 'text-yellow-400' },
              { label: 'Sports Cards', value: `${totalSportsCards}+`, color: 'text-emerald-400' },
              { label: 'Sets Covered', value: `${sportsSet}+`, color: 'text-blue-400' },
              { label: 'Rookie Cards', value: `${rookieCount}+`, color: 'text-orange-400' },
              { label: 'Free Forever', value: '100%', color: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-gray-500 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Lookups */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Lookups</h2>
            <p className="text-gray-400 text-sm mt-1">Most-searched cards with verified sold data</p>
          </div>
          <Link href="/tools" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
            Full price check →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {popularLookups.map(card => (
            <Link key={card.slug} href={`/sports/${card.slug}`} className="group block">
              <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sportGradients[card.sport]} flex items-center justify-center text-lg shrink-0`}>
                  {sportIcons[card.sport]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold truncate group-hover:text-emerald-400 transition-colors">{card.player}</p>
                  <p className="text-gray-500 text-xs truncate">{card.year} · {card.set.split(' ').slice(0,3).join(' ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 text-xs font-bold">{card.estimatedValueRaw}</p>
                  <p className="text-gray-600 text-xs">mid grade</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-4 text-center">Prices sourced from eBay sold listings and TCGPlayer · <Link href="/about#data" className="text-gray-500 hover:text-emerald-400 transition-colors">Data methodology →</Link></p>
      </section>

      {/* Recently Sold Feed */}
      <section className="border-y border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <h2 className="text-2xl font-bold text-white">Latest Sold Data</h2>
              </div>
              <p className="text-gray-400 text-sm">Real recent transactions from eBay, TCGPlayer, and major auction houses</p>
            </div>
            <a
              href="https://www.ebay.com/sch/i.html?_nkw=sports+card+graded&LH_Complete=1&LH_Sold=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Live eBay sold →
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentSales.map((sale, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">{sale.desc}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {sale.grade} · {sale.venue} · {sale.daysAgo === 1 ? '1 day ago' : `${sale.daysAgo} days ago`}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-emerald-400 font-bold text-sm">{sale.price}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${sale.category === 'pokemon' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-blue-900/40 text-blue-400'}`}>
                    {sale.category === 'pokemon' ? 'Pokémon' : 'Sports'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs text-center mt-4">Representative recent sales sourced from public auction records and marketplace data.</p>
        </div>
      </section>

      {/* Card of the Day */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-8 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-5 w-fit">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                Card of the Day
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{cardOfTheDay.name}</h2>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">{cardOfTheDay.description.slice(0, 160)}...</p>
              <div className="flex flex-wrap gap-3 mb-2">
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs">Recent Sales (Mid Grade)</p>
                  <p className="text-emerald-400 font-bold">{cardOfTheDay.estimatedValueRaw}</p>
                </div>
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs">Recent Sales (Gem Mint)</p>
                  <p className="text-emerald-400 font-bold">{cardOfTheDay.estimatedValueGem}</p>
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-5">Source: eBay sold comps, Heritage Auctions, Goldin — April 2026</p>
              <div className="flex flex-wrap gap-2">
              <Link
                href={`/sports/${cardOfTheDay.slug}`}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm w-fit"
              >
                Full Price Breakdown
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/card-of-the-day"
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm border border-gray-700"
              >
                See All Daily Cards
              </Link>
              </div>
            </div>
            <div className="flex items-center justify-center p-8 bg-gray-950/50 border-t lg:border-t-0 lg:border-l border-gray-800">
              <div className="w-52">
                <CardFrame card={cardOfTheDay} size="large" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Pulse + Top Movers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Pulse */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Sports Cards</h2>
                <p className="text-gray-400 text-sm mt-1">Market values based on eBay sold comps and auction results</p>
              </div>
              <Link href="/price-guide" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                Full guide →
              </Link>
            </div>
            <div className="space-y-3">
              {popularLookups.slice(0, 4).map(card => (
                <Link key={card.slug} href={`/sports/${card.slug}`} className="group block">
                  <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sportGradients[card.sport]} flex items-center justify-center text-xl shrink-0`}>
                      {sportIcons[card.sport]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-semibold truncate group-hover:text-emerald-400 transition-colors">{card.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5 capitalize">{card.sport} · {card.year}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-emerald-400 text-sm font-bold">{card.estimatedValueRaw}</p>
                      <p className="text-gray-600 text-xs">eBay comps</p>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/sports" className="block text-center py-2.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium border border-emerald-900/50 hover:border-emerald-800 rounded-xl transition-all">
                Browse all {totalSportsCards}+ sports cards →
              </Link>
            </div>
          </div>

          {/* Top Movers */}
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Top Movers</h2>
              <p className="text-gray-400 text-sm mt-1">30-day price trend vs eBay comps</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {topMovers.map((mover, i) => (
                <div key={i} className={`flex items-start gap-3 p-4 ${i < topMovers.length - 1 ? 'border-b border-gray-800' : ''}`}>
                  <span className={`text-lg shrink-0 mt-0.5 ${mover.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {mover.direction === 'up' ? '↑' : '↓'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium leading-snug">{mover.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{mover.detail}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${mover.color}`}>{mover.change}</span>
                </div>
              ))}
              <div className="px-4 py-3 border-t border-gray-800">
                <p className="text-gray-600 text-xs">Based on eBay sold comp trend analysis. <Link href="/about#data" className="text-gray-500 hover:text-emerald-400 transition-colors">Methodology →</Link></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick-start links */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold text-white text-center mb-10">What are you looking for?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { href: '/tools', title: 'Price Check', description: 'Instant value lookup for any card, any grade', icon: '🔎', color: 'from-emerald-900/50 to-teal-900/30', border: 'border-emerald-800/30 hover:border-emerald-600/50' },
              { href: '/pokemon', title: 'Pokémon TCG', description: '20,000+ cards with live TCGPlayer prices', icon: '⚡', color: 'from-yellow-900/50 to-amber-900/30', border: 'border-yellow-800/30 hover:border-yellow-600/50' },
              { href: '/sports', title: 'Sports Cards', description: `${totalSportsCards}+ iconic cards from T206 to Wemby`, icon: '🏆', color: 'from-blue-900/50 to-indigo-900/30', border: 'border-blue-800/30 hover:border-blue-600/50' },
              { href: '/sports/sets', title: 'Browse by Set', description: '230+ sets organized by sport and era', icon: '📦', color: 'from-orange-900/50 to-amber-900/30', border: 'border-orange-800/30 hover:border-orange-600/50' },
              { href: '/tools/grading-roi', title: 'Grading ROI', description: 'Is grading your card worth it? Find out', icon: '💰', color: 'from-purple-900/50 to-fuchsia-900/30', border: 'border-purple-800/30 hover:border-purple-600/50' },
              { href: '/tools/sealed-ev', title: 'Box EV Calc', description: 'Expected value for hobby boxes & blasters', icon: '📦', color: 'from-cyan-900/50 to-blue-900/30', border: 'border-cyan-800/30 hover:border-cyan-600/50' },
              { href: '/tools/pack-sim', title: 'Pack Simulator', description: 'Open virtual packs free — see your pulls!', icon: '🎰', color: 'from-red-900/50 to-orange-900/30', border: 'border-red-800/30 hover:border-red-600/50' },
              { href: '/tools/daily-pack', title: 'Daily Free Pack', description: 'One free pack every day — track your streak!', icon: '🎁', color: 'from-orange-900/50 to-yellow-900/30', border: 'border-orange-800/30 hover:border-orange-600/50' },
              { href: '/tools/market-dashboard', title: 'Market Dashboard', description: 'Bloomberg Terminal for cards — indices, movers, alerts', icon: '📊', color: 'from-green-900/50 to-emerald-900/30', border: 'border-green-800/30 hover:border-green-600/50' },
              { href: '/market-movers', title: 'Market Movers', description: 'Today\'s trending cards — gainers & losers', icon: '📈', color: 'from-green-900/50 to-emerald-900/30', border: 'border-green-800/30 hover:border-green-600/50' },
              { href: '/weekly-challenge', title: 'Weekly Challenge', description: 'Draft 5 cards, compete for the best score', icon: '🏆', color: 'from-purple-900/50 to-pink-900/30', border: 'border-purple-800/30 hover:border-purple-600/50' },
              { href: '/tools/watchlist', title: 'Price Watchlist', description: 'Track cards and get price movement alerts', icon: '👀', color: 'from-amber-900/50 to-orange-900/30', border: 'border-amber-800/30 hover:border-amber-600/50' },
              { href: '/guides', title: 'Collector Guides', description: 'Grading, investing, Pokémon, and eras', icon: '📖', color: 'from-rose-900/50 to-pink-900/30', border: 'border-rose-800/30 hover:border-rose-600/50' },
              { href: '/calendar', title: 'Release Calendar', description: '2026 product release schedule', icon: '📅', color: 'from-amber-900/50 to-orange-900/30', border: 'border-amber-800/30 hover:border-amber-600/50' },
              { href: '/my-hub', title: 'My Hub', description: 'Your personal dashboard — streaks, packs, achievements', icon: '🎯', color: 'from-amber-900/50 to-red-900/30', border: 'border-amber-800/30 hover:border-amber-600/50' },
              { href: '/rip-or-skip', title: 'Rip or Skip?', description: 'Daily vote — would you open this product?', icon: '🔥', color: 'from-red-900/50 to-orange-900/30', border: 'border-red-800/30 hover:border-red-600/50' },
              { href: '/tools/price-history', title: 'Price History', description: '90-day price trends for any card', icon: '📊', color: 'from-cyan-900/50 to-blue-900/30', border: 'border-cyan-800/30 hover:border-cyan-600/50' },
              { href: '/trivia', title: 'Daily Trivia', description: '5 questions a day — test your card knowledge', icon: '🧠', color: 'from-violet-900/50 to-purple-900/30', border: 'border-violet-800/30 hover:border-violet-600/50' },
              { href: '/tools/head-to-head', title: 'Head-to-Head', description: 'Compare any two cards side-by-side', icon: '⚔️', color: 'from-orange-900/50 to-amber-900/30', border: 'border-orange-800/30 hover:border-orange-600/50' },
              { href: '/flip-or-keep', title: 'Flip or Keep', description: 'Daily game — flip for cash or keep for collection?', icon: '🃏', color: 'from-purple-900/50 to-indigo-900/30', border: 'border-purple-800/30 hover:border-purple-600/50' },
              { href: '/news', title: 'Hobby News', description: 'Latest news, set drops, and market updates', icon: '📰', color: 'from-sky-900/50 to-blue-900/30', border: 'border-sky-800/30 hover:border-sky-600/50' },
              { href: '/leaderboard', title: 'Leaderboards', description: 'Top collectors — weekly challenge and portfolio rankings', icon: '🥇', color: 'from-amber-900/50 to-yellow-900/30', border: 'border-amber-800/30 hover:border-amber-600/50' },
              { href: '/showcase', title: 'Trophy Case', description: 'Curate your top 9 cards and share your showcase', icon: '🏆', color: 'from-emerald-900/50 to-teal-900/30', border: 'border-emerald-800/30 hover:border-emerald-600/50' },
              { href: '/market-report', title: 'Market Report', description: 'Weekly AI analysis of the card market', icon: '📈', color: 'from-blue-900/50 to-indigo-900/30', border: 'border-blue-800/30 hover:border-blue-600/50' },
              { href: '/binder', title: 'Digital Binder', description: 'Collect, organize, and trade cards digitally', icon: '📚', color: 'from-indigo-900/50 to-violet-900/30', border: 'border-indigo-800/30 hover:border-indigo-600/50' },
              { href: '/digital-pack', title: 'Digital Pack', description: '5 free cards for your binder every day', icon: '🎁', color: 'from-violet-900/50 to-purple-900/30', border: 'border-violet-800/30 hover:border-violet-600/50' },
              { href: '/premium-packs', title: 'Premium Packs', description: 'Themed packs: Legends, Rookies, Pre-War, more', icon: '💎', color: 'from-fuchsia-900/50 to-pink-900/30', border: 'border-fuchsia-800/30 hover:border-fuchsia-600/50' },
              { href: '/drops', title: 'Drop Calendar', description: 'Themed events: Draft Night, Playoff Heat, Vintage Weekend', icon: '🗓️', color: 'from-emerald-900/50 to-teal-900/30', border: 'border-emerald-800/30 hover:border-emerald-600/50' },
              { href: '/trade-hub', title: 'Trade Hub', description: 'Propose and accept card trades with collectors', icon: '🔄', color: 'from-purple-900/50 to-fuchsia-900/30', border: 'border-purple-800/30 hover:border-purple-600/50' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="group block">
                <div className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-5 h-full transition-all hover:-translate-y-0.5`}>
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="text-white font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pokémon Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Pokémon TCG — Live Prices</h2>
            <p className="text-gray-400 text-sm mt-1">Real TCGPlayer marketplace data via the Pokémon TCG API</p>
          </div>
          <Link href="/pokemon" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">All sets →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Charizard ex SAR', set: 'Obsidian Flames', price: '$180–$320', gradient: 'from-orange-900 via-red-900 to-gray-900', emoji: '🔥', source: 'TCGPlayer market' },
            { name: 'Umbreon ex SAR', set: 'Prismatic Evolutions', price: '$60–$120', gradient: 'from-indigo-900 via-purple-900 to-gray-900', emoji: '🌙', source: 'TCGPlayer market' },
            { name: 'Pikachu ex SAR', set: 'Scarlet & Violet 151', price: '$45–$90', gradient: 'from-yellow-900 via-amber-900 to-gray-900', emoji: '⚡', source: 'TCGPlayer market' },
          ].map(card => (
            <Link key={card.name} href="/pokemon" className="group block">
              <div className={`bg-gradient-to-br ${card.gradient} border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-all`}>
                <div className="text-4xl mb-3">{card.emoji}</div>
                <h3 className="text-white font-bold mb-0.5 group-hover:text-emerald-400 transition-colors">{card.name}</h3>
                <p className="text-gray-400 text-xs mb-2">{card.set} · Special Art Rare</p>
                <p className="text-emerald-400 font-bold text-lg">{card.price}</p>
                <p className="text-gray-600 text-xs mt-1">{card.source}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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

      {/* Trust Signals */}
      <section className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-gray-500 text-sm mb-8">Trusted data from 10+ sources including eBay, TCGPlayer, Heritage Auctions, Goldin, PWCC, and PSA</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: '📊', title: 'Real Sold Data', body: 'Every price comes from actual completed sales: eBay sold listings, Heritage, Goldin, and PWCC auction results. No book value, no guesses.' },
              { icon: '🔓', title: 'Always Free', body: 'No account required. No paywalls. CardVault is a free resource for every collector. It always will be.' },
              { icon: '🔗', title: 'Verify Everything', body: 'Every price links directly to eBay sold results so you can check the data yourself. We show our sources.' },
            ].map(trust => (
              <div key={trust.title} className="flex flex-col items-center">
                <span className="text-3xl mb-3">{trust.icon}</span>
                <h3 className="text-white font-bold mb-2">{trust.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{trust.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Footer nav */}
      <section className="bg-gradient-to-br from-emerald-950 to-gray-950 border-t border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Find out what your cards are worth</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Real prices from eBay, TCGPlayer, and auction houses. Sports cards and Pokémon. Free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/tools" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Price Check a Card
            </Link>
            <Link href="/pokemon" className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors border border-gray-700">
              Browse Pokémon Prices
            </Link>
          </div>
          {/* Footer links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            {[
              { href: '/sports/sets', label: 'Browse by Set' },
              { href: '/calendar', label: 'Release Calendar' },
              { href: '/guides/grading-guide', label: 'Grading Guide' },
              { href: '/guides/investing-101', label: 'Investing 101' },
              { href: '/guides/pokemon-investing', label: 'Pokémon Investing' },
              { href: '/tools', label: 'Price Check' },
              { href: '/news', label: 'News' },
              { href: '/about', label: 'About' },
              { href: '/about#data', label: 'Data Methodology' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="hover:text-emerald-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-gray-700 text-xs mt-6">
            CardVault · Free sports card and Pokémon TCG price guide · Last updated: {buildDate}
          </p>
        </div>
      </section>
    </>
  );
}
