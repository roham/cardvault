'use client';

import { useState } from 'react';
import { newsItems } from '@/data/news';
import NewsCard from '@/components/NewsCard';
import type { NewsItem } from '@/data/news';

const categories: { value: NewsItem['category'] | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All News', emoji: '📰' },
  { value: 'sports', label: 'Sports Cards', emoji: '🏆' },
  { value: 'pokemon', label: 'Pokémon TCG', emoji: '⚡' },
  { value: 'market', label: 'Market', emoji: '📊' },
];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsItem['category'] | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? newsItems
    : newsItems.filter(n => n.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Market News</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Set releases, auction records, grading updates, and market trends for sports cards and Pokémon TCG.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            <span className={`text-xs ${activeCategory === cat.value ? 'text-emerald-200' : 'text-gray-500'}`}>
              ({cat.value === 'all' ? newsItems.length : newsItems.filter(n => n.category === cat.value).length})
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
    </div>
  );
}
