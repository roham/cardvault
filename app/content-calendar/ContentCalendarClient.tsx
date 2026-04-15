'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────
interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: 'article' | 'tool' | 'guide' | 'spotlight' | 'event' | 'drop';
  date: string;
  status: 'published' | 'upcoming' | 'in-progress';
  href?: string;
  sport?: string;
  tags: string[];
}

const CATEGORY_CONFIG: Record<ContentItem['category'], { label: string; icon: string; color: string; bgColor: string }> = {
  article: { label: 'Article', icon: '📰', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  tool: { label: 'Tool', icon: '🔧', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  guide: { label: 'Guide', icon: '📖', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20' },
  spotlight: { label: 'Spotlight', icon: '🔦', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  event: { label: 'Event', icon: '📅', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20' },
  drop: { label: 'Product Drop', icon: '📦', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/20' },
};

const STATUS_COLORS = {
  published: 'bg-emerald-500/10 text-emerald-400',
  upcoming: 'bg-amber-500/10 text-amber-400',
  'in-progress': 'bg-blue-500/10 text-blue-400',
};

// ── Content Data ──────────────────────────────────────────────
const CONTENT_ITEMS: ContentItem[] = [
  // Published
  { id: 'c-001', title: 'Best Rookie Cards 2026 — Investment Guide', description: 'Complete guide to the top rookie cards to invest in across all sports for 2026.', category: 'guide', date: '2026-04-14', status: 'published', href: '/guides/best-rookie-cards-2026', tags: ['rookies', 'investing', 'guide'] },
  { id: 'c-002', title: 'Collector Spotlight: 6 Collector Archetypes', description: 'Meet Marcus, Dave, Mia, Tony, Jess, and Kai — the six collector personalities and their strategies.', category: 'spotlight', date: '2026-04-13', status: 'published', href: '/collector-spotlight', tags: ['community', 'profiles'] },
  { id: 'c-003', title: 'Market Sentiment Index Launch', description: 'Our Fear & Greed index for the card market is now live. Track collector confidence in real time.', category: 'tool', date: '2026-04-12', status: 'published', href: '/market-sentiment', tags: ['market', 'analytics'] },
  { id: 'c-004', title: 'Card Price Catalysts — Event-Driven Alerts', description: 'See which upcoming events will move card prices: draft night, playoff runs, Hall of Fame voting.', category: 'article', date: '2026-04-11', status: 'published', href: '/card-catalysts', tags: ['market', 'analysis'] },
  { id: 'c-005', title: 'BGS Subgrade Calculator', description: 'Calculate your BGS subgrade breakdown and see how each subgrade affects overall value.', category: 'tool', date: '2026-04-10', status: 'published', href: '/tools/bgs-subgrade', tags: ['grading', 'tools'] },

  // This Week
  { id: 'c-006', title: '2026 NFL Draft Card Impact Preview', description: 'Which prospects will see the biggest card value spikes on draft night? Position-by-position analysis.', category: 'article', date: '2026-04-16', status: 'upcoming', tags: ['football', 'draft', 'analysis'] },
  { id: 'c-007', title: 'Vault Wishlist — Track Cards You Want', description: 'New vault feature: build a want-list with target prices and one-click eBay search.', category: 'tool', date: '2026-04-15', status: 'published', href: '/vault/wishlist', tags: ['vault', 'tools'] },
  { id: 'c-008', title: 'NBA Playoffs Card Watch: Round 1 Preview', description: 'Players whose cards are most likely to spike during the NBA playoffs. Buy windows and hold strategies.', category: 'article', date: '2026-04-17', status: 'upcoming', tags: ['basketball', 'playoffs', 'investing'] },

  // Next Week
  { id: 'c-009', title: 'PSA vs BGS vs CGC — 2026 Update', description: 'Updated comparison of grading companies with new 2026 pricing, turnaround times, and market premiums.', category: 'guide', date: '2026-04-21', status: 'upcoming', tags: ['grading', 'guide', 'comparison'] },
  { id: 'c-010', title: 'Top 10 Undervalued Hockey Cards', description: 'Deep dive into hockey cards that are trading below fair value heading into the 2026 Stanley Cup Playoffs.', category: 'article', date: '2026-04-22', status: 'upcoming', sport: 'hockey', tags: ['hockey', 'investing', 'undervalued'] },
  { id: 'c-011', title: 'Card Show Season Preview: May 2026', description: 'The biggest card shows happening in May. Locations, dates, featured dealers, and what to bring.', category: 'event', date: '2026-04-23', status: 'upcoming', tags: ['events', 'card shows'] },
  { id: 'c-012', title: 'Photo Grade Estimator (Tool Launch)', description: 'Upload photos of your card and get an AI-estimated grade based on centering, corners, edges, and surface.', category: 'tool', date: '2026-04-24', status: 'in-progress', tags: ['grading', 'tools', 'AI'] },

  // Coming Soon
  { id: 'c-013', title: '2026 Bowman Baseball Checklist & Box Break Guide', description: 'Complete checklist, hit rates, and whether to rip or skip 2026 Bowman Baseball.', category: 'drop', date: '2026-04-28', status: 'upcoming', sport: 'baseball', tags: ['baseball', 'new release', 'bowman'] },
  { id: 'c-014', title: 'Summer Collecting Guide: What to Buy Before Prices Rise', description: 'Seasonal analysis of cards that historically spike in summer — football pre-season, baseball All-Star.', category: 'guide', date: '2026-05-01', status: 'upcoming', tags: ['investing', 'seasonal', 'guide'] },
  { id: 'c-015', title: 'Card Tournament Bracket Feature', description: 'March Madness-style bracket where community votes on the greatest card of all time. 64-card single elimination.', category: 'event', date: '2026-05-05', status: 'in-progress', tags: ['community', 'games', 'engagement'] },
  { id: 'c-016', title: 'Monthly Market Report: April 2026', description: 'Full market recap: top movers, biggest sales, category trends, and outlook for May.', category: 'article', date: '2026-05-01', status: 'upcoming', tags: ['market', 'report', 'monthly'] },
  { id: 'c-017', title: 'Panini Prizm Football 2026 Preview', description: 'Everything we know about 2026 Prizm Football: release date, checklist rumors, and box pricing.', category: 'drop', date: '2026-05-10', status: 'upcoming', sport: 'football', tags: ['football', 'new release', 'prizm'] },
  { id: 'c-018', title: 'The Morning Flip Newsletter — Issue #1', description: 'Our weekly newsletter launches: top flips, market movers, card of the week, and community highlights.', category: 'article', date: '2026-05-12', status: 'in-progress', tags: ['newsletter', 'community'] },
];

type ViewMode = 'timeline' | 'calendar';
type CategoryFilter = 'all' | ContentItem['category'];

export default function ContentCalendarClient() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentItem['status']>('all');

  const filteredItems = useMemo(() => {
    let result = [...CONTENT_ITEMS];
    if (categoryFilter !== 'all') result = result.filter(i => i.category === categoryFilter);
    if (statusFilter !== 'all') result = result.filter(i => i.status === statusFilter);
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [categoryFilter, statusFilter]);

  // Group by week
  const grouped = useMemo(() => {
    const groups: Record<string, ContentItem[]> = {};
    const now = new Date();
    filteredItems.forEach(item => {
      const itemDate = new Date(item.date);
      const diffDays = Math.floor((itemDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let label: string;
      if (diffDays < -7) label = 'Earlier';
      else if (diffDays < 0) label = 'This Past Week';
      else if (diffDays < 1) label = 'Today';
      else if (diffDays < 7) label = 'This Week';
      else if (diffDays < 14) label = 'Next Week';
      else label = 'Coming Soon';
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }, [filteredItems]);

  const timelineOrder = ['Today', 'This Week', 'Next Week', 'Coming Soon', 'This Past Week', 'Earlier'];

  // Stats
  const stats = {
    total: CONTENT_ITEMS.length,
    published: CONTENT_ITEMS.filter(i => i.status === 'published').length,
    upcoming: CONTENT_ITEMS.filter(i => i.status === 'upcoming').length,
    inProgress: CONTENT_ITEMS.filter(i => i.status === 'in-progress').length,
  };

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-gray-500 uppercase">Total</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-emerald-400">{stats.published}</p>
          <p className="text-[10px] text-gray-500 uppercase">Published</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-amber-400">{stats.upcoming}</p>
          <p className="text-[10px] text-gray-500 uppercase">Upcoming</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-400">{stats.inProgress}</p>
          <p className="text-[10px] text-gray-500 uppercase">In Progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as CategoryFilter)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Types</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="upcoming">Upcoming</option>
          <option value="in-progress">In Progress</option>
        </select>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {timelineOrder.filter(label => grouped[label]?.length).map(label => (
            <div key={label}>
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                {label}
                <span className="text-gray-600 text-xs font-normal">({grouped[label].length})</span>
              </h3>
              <div className="space-y-2 ml-4 border-l border-gray-800 pl-4">
                {grouped[label].map(item => {
                  const cfg = CATEGORY_CONFIG[item.category];
                  return (
                    <div key={item.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bgColor}`}>
                              {cfg.icon} {cfg.label.toUpperCase()}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[item.status]}`}>
                              {item.status === 'in-progress' ? 'IN PROGRESS' : item.status.toUpperCase()}
                            </span>
                          </div>
                          {item.href ? (
                            <Link href={item.href} className="text-white font-medium text-sm hover:text-indigo-400 transition-colors">
                              {item.title}
                            </Link>
                          ) : (
                            <p className="text-white font-medium text-sm">{item.title}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-600 text-[10px]">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {item.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map(item => {
            const cfg = CATEGORY_CONFIG[item.category];
            return (
              <div key={item.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bgColor}`}>
                    {cfg.icon} {cfg.label.toUpperCase()}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[item.status]}`}>
                    {item.status === 'in-progress' ? 'IN PROGRESS' : item.status.toUpperCase()}
                  </span>
                </div>
                {item.href ? (
                  <Link href={item.href} className="text-white font-medium text-sm hover:text-indigo-400 transition-colors block mb-1">
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-white font-medium text-sm mb-1">{item.title}</p>
                )}
                <p className="text-gray-500 text-xs line-clamp-2 mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-[10px]">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex gap-1">
                    {item.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Related */}
      <div className="mt-8 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Stay Updated</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/news" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📰</span>
            <div>
              <div className="text-white text-sm font-medium">News Feed</div>
              <div className="text-gray-500 text-xs">Latest card collecting news</div>
            </div>
          </Link>
          <Link href="/newsletter" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📧</span>
            <div>
              <div className="text-white text-sm font-medium">The Morning Flip</div>
              <div className="text-gray-500 text-xs">Weekly newsletter</div>
            </div>
          </Link>
          <Link href="/drops" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📦</span>
            <div>
              <div className="text-white text-sm font-medium">Drop Calendar</div>
              <div className="text-gray-500 text-xs">Upcoming product releases</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
