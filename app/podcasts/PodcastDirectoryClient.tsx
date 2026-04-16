'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Podcast {
  name: string;
  hosts: string;
  description: string;
  focus: string[];
  sports: string[];
  frequency: string;
  platform: string;
  rating: number;
  listeners: string;
  bestFor: string;
  since: number;
}

const PODCASTS: Podcast[] = [
  { name: 'Sports Card Investor', hosts: 'Geoff Wilson', description: 'The most popular card investing podcast. Data-driven analysis of the sports card market with real-time sales data, market trends, and investment strategies.', focus: ['investing', 'market analysis', 'data'], sports: ['baseball', 'basketball', 'football', 'hockey'], frequency: 'Daily', platform: 'Apple/Spotify', rating: 4.8, listeners: '100K+', bestFor: 'Investors and flippers tracking daily market movements', since: 2019 },
  { name: 'Card Chat', hosts: 'Multiple hosts', description: 'Long-running podcast covering all aspects of the card hobby. Product reviews, industry news, collecting tips, and interviews with major hobby figures.', focus: ['news', 'reviews', 'interviews'], sports: ['baseball', 'basketball', 'football'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.6, listeners: '50K+', bestFor: 'Collectors who want broad hobby coverage and product reviews', since: 2018 },
  { name: 'The Hobby Wire', hosts: 'Various', description: 'Breaking hobby news and analysis. Covers product releases, industry controversies, counterfeit alerts, and major auction results.', focus: ['news', 'industry'], sports: ['baseball', 'basketball', 'football', 'hockey'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.5, listeners: '30K+', bestFor: 'Collectors who want to stay on top of hobby news', since: 2020 },
  { name: 'Baseball Card Breakdown', hosts: 'Gavin', description: 'Dedicated baseball card podcast focusing on vintage and modern baseball cards. Set reviews, player card analysis, and baseball collecting history.', focus: ['baseball', 'vintage', 'reviews'], sports: ['baseball'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.7, listeners: '25K+', bestFor: 'Baseball card collectors, especially vintage enthusiasts', since: 2019 },
  { name: 'Cardboard Chronicles', hosts: 'Multiple', description: 'Deep dives into card collecting culture, the business of cards, and collector stories. Features interviews with top collectors and industry insiders.', focus: ['culture', 'interviews', 'stories'], sports: ['baseball', 'basketball', 'football'], frequency: 'Bi-weekly', platform: 'Apple/Spotify', rating: 4.4, listeners: '20K+', bestFor: 'Collectors who enjoy human-interest stories and hobby culture', since: 2021 },
  { name: 'Pokemon TCG Radio', hosts: 'Various', description: 'Everything Pokemon TCG — set reviews, meta analysis, collecting tips, investment strategies for Pokemon cards, and Japanese set previews.', focus: ['pokemon', 'collecting', 'investing'], sports: ['pokemon'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.6, listeners: '40K+', bestFor: 'Pokemon TCG collectors and investors', since: 2020 },
  { name: 'The Rip Show', hosts: 'Various', description: 'Live pack-opening content and reviews of new products. Hosts rip boxes on air and discuss hit rates, value, and whether products are worth buying.', focus: ['ripping', 'reviews', 'live'], sports: ['baseball', 'basketball', 'football'], frequency: 'Multiple/week', platform: 'YouTube/Spotify', rating: 4.3, listeners: '35K+', bestFor: 'Collectors who love box breaks and product ripping content', since: 2020 },
  { name: 'Wax Museum Podcast', hosts: 'Various hosts', description: 'Vintage card collecting podcast covering pre-war through 1980s cards. T206, Goudey, Bowman, and early Topps sets. Expert interviews and grading discussions.', focus: ['vintage', 'pre-war', 'grading'], sports: ['baseball', 'basketball', 'football', 'hockey'], frequency: 'Monthly', platform: 'Apple/Spotify', rating: 4.7, listeners: '15K+', bestFor: 'Vintage card collectors and pre-war enthusiasts', since: 2019 },
  { name: 'Blowout Buzz', hosts: 'Blowout Cards team', description: 'Product preview and checklist breakdown podcast from one of the largest online card retailers. First looks at new products, insert previews, and box break odds.', focus: ['previews', 'checklists', 'odds'], sports: ['baseball', 'basketball', 'football', 'hockey'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.2, listeners: '20K+', bestFor: 'Collectors who want first looks at upcoming products', since: 2018 },
  { name: 'Cardboard Connection Podcast', hosts: 'Various', description: 'From the premiere card collecting resource site. Set checklists, news, price guide updates, and hobby event coverage including the National.', focus: ['news', 'checklists', 'events'], sports: ['baseball', 'basketball', 'football', 'hockey'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.5, listeners: '25K+', bestFor: 'Collectors who rely on Cardboard Connection for checklists and news', since: 2017 },
  { name: 'The Beckett Experience', hosts: 'Beckett staff', description: 'Behind-the-scenes of card grading at Beckett. Grading standards, BGS vs PSA analysis, market impacts of grades, and pop report breakdowns.', focus: ['grading', 'BGS', 'standards'], sports: ['baseball', 'basketball', 'football', 'hockey'], frequency: 'Monthly', platform: 'Apple/Spotify', rating: 4.4, listeners: '20K+', bestFor: 'Collectors focused on grading and understanding grade values', since: 2020 },
  { name: 'Football Card Fire', hosts: 'Various', description: 'NFL-focused card podcast covering rookie card values, draft impact on cards, seasonal price patterns, and football-specific investment strategies.', focus: ['football', 'rookies', 'investing'], sports: ['football'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.5, listeners: '30K+', bestFor: 'Football card collectors and investors', since: 2021 },
  { name: 'Hoops Card Central', hosts: 'Multiple', description: 'Basketball card collecting and investing podcast. NBA rookie analysis, Prizm and Select set reviews, and basketball card market trends.', focus: ['basketball', 'rookies', 'Prizm'], sports: ['basketball'], frequency: 'Weekly', platform: 'Apple/Spotify', rating: 4.4, listeners: '25K+', bestFor: 'Basketball card collectors, especially Prizm and Select fans', since: 2021 },
  { name: 'Hockey Card Podcast', hosts: 'Various', description: 'Upper Deck product reviews, Young Guns analysis, and hockey card market coverage. Covers NHL rookies, vintage Parkhurst/OPC, and draft impact on cards.', focus: ['hockey', 'Upper Deck', 'Young Guns'], sports: ['hockey'], frequency: 'Bi-weekly', platform: 'Apple/Spotify', rating: 4.3, listeners: '10K+', bestFor: 'Hockey card collectors navigating the Upper Deck monopoly', since: 2020 },
  { name: 'The Breakout Show', hosts: 'Various', description: 'Live group break analysis and reviews. Covers break formats, which products are best for breaking, fair pricing, and break host reviews.', focus: ['breaks', 'group breaks', 'reviews'], sports: ['baseball', 'basketball', 'football'], frequency: 'Weekly', platform: 'YouTube/Spotify', rating: 4.2, listeners: '15K+', bestFor: 'Collectors who participate in group breaks and want to find good ones', since: 2022 },
];

const FOCUS_TAGS = ['investing', 'news', 'reviews', 'grading', 'vintage', 'rookies', 'breaks', 'pokemon', 'culture', 'interviews'];
const SPORT_OPTIONS = ['all', 'baseball', 'basketball', 'football', 'hockey', 'pokemon'];

const SPORT_ICONS: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒', pokemon: '⚡',
};
const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-red-400', basketball: 'text-orange-400', football: 'text-blue-400', hockey: 'text-cyan-400', pokemon: 'text-yellow-400',
};

export default function PodcastDirectoryClient() {
  const [sportFilter, setSportFilter] = useState('all');
  const [focusFilter, setFocusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'listeners' | 'name'>('rating');

  const filtered = useMemo(() => {
    let list = [...PODCASTS];
    if (sportFilter !== 'all') list = list.filter(p => p.sports.includes(sportFilter));
    if (focusFilter) list = list.filter(p => p.focus.includes(focusFilter));
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'listeners') list.sort((a, b) => parseInt(b.listeners) - parseInt(a.listeners));
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sportFilter, focusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{PODCASTS.length}</p>
          <p className="text-xs text-gray-400">Podcasts Listed</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400">{Math.round(PODCASTS.reduce((s, p) => s + p.rating, 0) / PODCASTS.length * 10) / 10}</p>
          <p className="text-xs text-gray-400">Avg Rating</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">4</p>
          <p className="text-xs text-gray-400">Sports Covered</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{FOCUS_TAGS.length}</p>
          <p className="text-xs text-gray-400">Topic Categories</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {SPORT_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sportFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {s === 'all' ? 'All Sports' : `${SPORT_ICONS[s] ?? ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {FOCUS_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setFocusFilter(focusFilter === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${focusFilter === tag ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 self-center">Sort:</span>
          {(['rating', 'listeners', 'name'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${sortBy === s ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              {s === 'rating' ? 'Top Rated' : s === 'listeners' ? 'Most Popular' : 'A-Z'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">{filtered.length} podcast{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Podcast Cards */}
      <div className="space-y-4">
        {filtered.map(podcast => (
          <div key={podcast.name} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 hover:border-gray-600/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white">{podcast.name}</h3>
                  <span className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full">{podcast.rating}/5</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">by {podcast.hosts} &middot; Since {podcast.since}</p>
                <p className="text-sm text-gray-300 mb-3">{podcast.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {podcast.sports.map(s => (
                    <span key={s} className={`text-xs ${SPORT_COLORS[s] ?? 'text-gray-400'}`}>
                      {SPORT_ICONS[s] ?? ''} {s}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {podcast.focus.map(f => (
                    <span key={f} className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Frequency: {podcast.frequency}</span>
                  <span>Platform: {podcast.platform}</span>
                  <span>Listeners: {podcast.listeners}</span>
                </div>
                <p className="text-xs text-emerald-400 mt-2">Best for: {podcast.bestFor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Why Listen Section */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 mt-8">
        <h2 className="text-lg font-bold text-white mb-3">Why Listen to Card Collecting Podcasts?</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <p className="font-medium text-white mb-1">Market Intelligence</p>
            <p className="text-gray-400">Stay ahead of price movements. The best podcasts break news faster than social media and provide context that short posts lack.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Product Previews</p>
            <p className="text-gray-400">Get first looks at upcoming sets, checklist breakdowns, and hit rate analysis before products release. Know what to buy before everyone else.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Community Insights</p>
            <p className="text-gray-400">Learn from experienced collectors who share buying strategies, grading tips, and mistakes to avoid. Decades of knowledge distilled into episodes.</p>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Multitask Friendly</p>
            <p className="text-gray-400">Listen while sorting cards, driving to card shows, or browsing eBay. Podcasts let you absorb hobby knowledge without stopping your day.</p>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="border-t border-gray-800 pt-6">
        <h2 className="text-lg font-bold text-white mb-3">More Hobby Resources</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/creators" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Content Creators</p>
            <p className="text-xs text-gray-400">YouTube and social media card creators</p>
          </Link>
          <Link href="/news" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Hobby News</p>
            <p className="text-xs text-gray-400">Latest card collecting news and analysis</p>
          </Link>
          <Link href="/guides" className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 hover:border-gray-500/50 transition-colors">
            <p className="text-sm font-medium text-white">Collecting Guides</p>
            <p className="text-xs text-gray-400">Beginner to advanced card guides</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
