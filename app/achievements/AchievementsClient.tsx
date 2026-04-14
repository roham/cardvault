'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'explorer' | 'collector' | 'tools' | 'social' | 'streak';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  requirement: string;
  checkKey: string; // localStorage key to check
  checkValue: number; // minimum value needed
}

const achievements: Achievement[] = [
  // Explorer
  { id: 'first-card', name: 'First Look', description: 'View your first card page', icon: '1', category: 'explorer', tier: 'bronze', requirement: 'View 1 card', checkKey: 'cv-cards-viewed', checkValue: 1 },
  { id: 'card-collector-10', name: 'Card Curious', description: 'View 10 different card pages', icon: '2', category: 'explorer', tier: 'bronze', requirement: 'View 10 cards', checkKey: 'cv-cards-viewed', checkValue: 10 },
  { id: 'card-collector-50', name: 'Card Enthusiast', description: 'View 50 different card pages', icon: '3', category: 'explorer', tier: 'silver', requirement: 'View 50 cards', checkKey: 'cv-cards-viewed', checkValue: 50 },
  { id: 'card-collector-200', name: 'Card Expert', description: 'View 200 different card pages', icon: '4', category: 'explorer', tier: 'gold', requirement: 'View 200 cards', checkKey: 'cv-cards-viewed', checkValue: 200 },
  { id: 'card-collector-500', name: 'Card Master', description: 'View 500 different card pages', icon: '5', category: 'explorer', tier: 'diamond', requirement: 'View 500 cards', checkKey: 'cv-cards-viewed', checkValue: 500 },
  { id: 'guide-reader', name: 'Student of the Game', description: 'Read your first guide', icon: '6', category: 'explorer', tier: 'bronze', requirement: 'Read 1 guide', checkKey: 'cv-guides-read', checkValue: 1 },
  { id: 'guide-reader-5', name: 'Well-Read Collector', description: 'Read 5 different guides', icon: '7', category: 'explorer', tier: 'silver', requirement: 'Read 5 guides', checkKey: 'cv-guides-read', checkValue: 5 },

  // Tools
  { id: 'first-tool', name: 'Tool Time', description: 'Use your first tool', icon: '8', category: 'tools', tier: 'bronze', requirement: 'Use 1 tool', checkKey: 'cv-tools-used', checkValue: 1 },
  { id: 'tool-explorer', name: 'Swiss Army Collector', description: 'Use 5 different tools', icon: '9', category: 'tools', tier: 'silver', requirement: 'Use 5 tools', checkKey: 'cv-tools-used', checkValue: 5 },
  { id: 'tool-master', name: 'Power User', description: 'Use 10 different tools', icon: '10', category: 'tools', tier: 'gold', requirement: 'Use 10 tools', checkKey: 'cv-tools-used', checkValue: 10 },
  { id: 'pack-opener', name: 'Pack Ripper', description: 'Open your first simulated pack', icon: '11', category: 'tools', tier: 'bronze', requirement: 'Open 1 pack', checkKey: 'cv-packs-opened', checkValue: 1 },
  { id: 'pack-opener-10', name: 'Box Buster', description: 'Open 10 simulated packs', icon: '12', category: 'tools', tier: 'silver', requirement: 'Open 10 packs', checkKey: 'cv-packs-opened', checkValue: 10 },
  { id: 'pack-opener-50', name: 'Case Breaker', description: 'Open 50 simulated packs', icon: '13', category: 'tools', tier: 'gold', requirement: 'Open 50 packs', checkKey: 'cv-packs-opened', checkValue: 50 },
  { id: 'grading-check', name: 'Grade Curious', description: 'Use the Grading ROI Calculator', icon: '14', category: 'tools', tier: 'bronze', requirement: 'Check grading ROI', checkKey: 'cv-grading-used', checkValue: 1 },
  { id: 'trade-eval', name: 'Deal Maker', description: 'Use the Trade Evaluator', icon: '15', category: 'tools', tier: 'bronze', requirement: 'Evaluate a trade', checkKey: 'cv-trade-used', checkValue: 1 },

  // Collector
  { id: 'collection-start', name: 'Getting Started', description: 'Add your first card to collection', icon: '16', category: 'collector', tier: 'bronze', requirement: 'Add 1 card', checkKey: 'cv-collection-size', checkValue: 1 },
  { id: 'collection-10', name: 'Budding Collection', description: 'Have 10 cards in your collection', icon: '17', category: 'collector', tier: 'silver', requirement: 'Collect 10 cards', checkKey: 'cv-collection-size', checkValue: 10 },
  { id: 'collection-50', name: 'Serious Collector', description: 'Have 50 cards in your collection', icon: '18', category: 'collector', tier: 'gold', requirement: 'Collect 50 cards', checkKey: 'cv-collection-size', checkValue: 50 },
  { id: 'portfolio-player', name: 'Card Investor', description: 'Create your first fantasy portfolio', icon: '19', category: 'collector', tier: 'bronze', requirement: 'Draft a portfolio', checkKey: 'cv-portfolio-created', checkValue: 1 },

  // Social
  { id: 'first-share', name: 'Show and Tell', description: 'Share your collection or results', icon: '20', category: 'social', tier: 'bronze', requirement: 'Share once', checkKey: 'cv-shares', checkValue: 1 },
  { id: 'share-pro', name: 'Community Builder', description: 'Share 5 times', icon: '21', category: 'social', tier: 'silver', requirement: 'Share 5 times', checkKey: 'cv-shares', checkValue: 5 },

  // Streak
  { id: 'daily-visitor', name: 'Daily Visitor', description: 'Visit CardVault 2 days in a row', icon: '22', category: 'streak', tier: 'bronze', requirement: '2-day streak', checkKey: 'cv-visit-streak', checkValue: 2 },
  { id: 'weekly-visitor', name: 'Weekly Regular', description: 'Visit 7 days in a row', icon: '23', category: 'streak', tier: 'silver', requirement: '7-day streak', checkKey: 'cv-visit-streak', checkValue: 7 },
  { id: 'monthly-visitor', name: 'Dedicated Collector', description: 'Visit 30 days in a row', icon: '24', category: 'streak', tier: 'gold', requirement: '30-day streak', checkKey: 'cv-visit-streak', checkValue: 30 },
];

const tierConfig = {
  bronze: { color: 'text-amber-600', bg: 'bg-amber-900/20', border: 'border-amber-800/30', label: 'Bronze' },
  silver: { color: 'text-gray-300', bg: 'bg-gray-700/20', border: 'border-gray-600/30', label: 'Silver' },
  gold: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700/30', label: 'Gold' },
  diamond: { color: 'text-cyan-400', bg: 'bg-cyan-900/20', border: 'border-cyan-700/30', label: 'Diamond' },
};

const categoryConfig = {
  explorer: { label: 'Explorer', color: 'text-emerald-400' },
  collector: { label: 'Collector', color: 'text-purple-400' },
  tools: { label: 'Tools', color: 'text-blue-400' },
  social: { label: 'Social', color: 'text-pink-400' },
  streak: { label: 'Streaks', color: 'text-amber-400' },
};

const STORAGE_KEY = 'cv-achievements';

function trackVisitStreak() {
  const today = new Date().toISOString().split('T')[0];
  const lastVisit = localStorage.getItem('cv-last-visit');
  const streak = parseInt(localStorage.getItem('cv-visit-streak') || '0');

  if (lastVisit === today) return; // Already tracked today

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (lastVisit === yesterday) {
    localStorage.setItem('cv-visit-streak', String(streak + 1));
  } else {
    localStorage.setItem('cv-visit-streak', '1');
  }
  localStorage.setItem('cv-last-visit', today);
}

export default function AchievementsClient() {
  const [mounted, setMounted] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
    trackVisitStreak();

    // Check which achievements are unlocked
    const unlocked = new Set<string>();
    for (const a of achievements) {
      const val = parseInt(localStorage.getItem(a.checkKey) || '0');
      if (val >= a.checkValue) unlocked.add(a.id);
    }

    // Also load manually granted achievements
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const manual = JSON.parse(saved) as string[];
        for (const id of manual) unlocked.add(id);
      } catch { /* ignore */ }
    }

    setUnlockedIds(unlocked);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse"><div className="h-64 bg-gray-800 rounded-2xl" /></div>;
  }

  const unlockedCount = unlockedIds.size;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  const categories = ['all', 'explorer', 'collector', 'tools', 'social', 'streak'] as const;
  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-white text-2xl font-bold">{unlockedCount}</span>
            <span className="text-gray-500 text-lg"> / {totalCount}</span>
          </div>
          <span className="text-gray-400 text-sm">{progress}% complete</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span>{achievements.filter(a => a.tier === 'bronze' && unlockedIds.has(a.id)).length}/{achievements.filter(a => a.tier === 'bronze').length} Bronze</span>
          <span>{achievements.filter(a => a.tier === 'silver' && unlockedIds.has(a.id)).length}/{achievements.filter(a => a.tier === 'silver').length} Silver</span>
          <span>{achievements.filter(a => a.tier === 'gold' && unlockedIds.has(a.id)).length}/{achievements.filter(a => a.tier === 'gold').length} Gold</span>
          <span>{achievements.filter(a => a.tier === 'diamond' && unlockedIds.has(a.id)).length}/{achievements.filter(a => a.tier === 'diamond').length} Diamond</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === cat
                ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'
            }`}
          >
            {cat === 'all' ? 'All' : categoryConfig[cat].label}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(a => {
          const unlocked = unlockedIds.has(a.id);
          const tier = tierConfig[a.tier];
          const cat = categoryConfig[a.category];

          return (
            <div
              key={a.id}
              className={`relative rounded-xl p-4 border transition-all ${
                unlocked
                  ? `${tier.bg} ${tier.border} border`
                  : 'bg-gray-900/50 border-gray-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0 ${
                  unlocked ? `${tier.bg} ${tier.color}` : 'bg-gray-800 text-gray-600'
                }`}>
                  {unlocked ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {a.name}
                    </h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${tier.bg} ${tier.color}`}>
                      {tier.label}
                    </span>
                  </div>
                  <p className={`text-xs ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {a.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${cat.color}`}>{cat.label}</span>
                    <span className="text-gray-700 text-xs">{a.requirement}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How to Earn */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mt-6">
        <h2 className="text-white font-bold mb-3">How to Earn Achievements</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-400">
          <div>
            <span className="text-emerald-400 font-medium">Explorer badges:</span> Browse card pages and read guides
          </div>
          <div>
            <span className="text-blue-400 font-medium">Tool badges:</span> Use calculators, simulators, and evaluators
          </div>
          <div>
            <span className="text-purple-400 font-medium">Collector badges:</span> Build your card collection and portfolio
          </div>
          <div>
            <span className="text-amber-400 font-medium">Streak badges:</span> Visit CardVault on consecutive days
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/tools/pack-sim" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
            Open Packs
          </Link>
          <Link href="/tools/collection-value" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
            Track Collection
          </Link>
          <Link href="/sports" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
            Browse Cards
          </Link>
          <Link href="/guides" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
            Read Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
