'use client';

import { useState } from 'react';
import NewsCard from '@/components/NewsCard';
import type { NewsItem } from '@/data/news';

const categories: { value: NewsItem['category'] | 'all'; label: string }[] = [
  { value: 'all', label: 'All News' },
  { value: 'sports', label: 'Sports Cards' },
  { value: 'pokemon', label: 'Pokémon TCG' },
  { value: 'market', label: 'Market' },
];

export default function NewsFilter({ items, fromRss }: { items: NewsItem[]; fromRss: boolean }) {
  const [active, setActive] = useState<NewsItem['category'] | 'all'>('all');

  const filtered = active === 'all' ? items : items.filter(n => n.category === active);

  return (
    <>
      {/* Source badge */}
      <div className="mb-6 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          fromRss
            ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800'
            : 'bg-gray-800 text-gray-400 border border-gray-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${fromRss ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          {fromRss ? 'Live RSS feeds · 30-min refresh' : 'Curated articles · Live feeds unavailable'}
        </span>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActive(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              active === cat.value
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {cat.label}
            <span className={`ml-1.5 text-xs ${active === cat.value ? 'text-emerald-200' : 'text-gray-500'}`}>
              ({cat.value === 'all' ? items.length : items.filter(n => n.category === cat.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* News grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No news in this category</p>
        </div>
      )}
    </>
  );
}
