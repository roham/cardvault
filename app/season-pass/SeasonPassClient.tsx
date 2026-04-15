'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ───── Season Config ───── */
const SEASON_NAME = 'Spring 2026';
const SEASON_START = new Date('2026-04-01');
const SEASON_END = new Date('2026-06-30');
const TOTAL_TIERS = 50;
const XP_PER_TIER = 100;
const STORAGE_KEY = 'cv-season-pass';

interface Reward {
  tier: number;
  name: string;
  description: string;
  icon: string;
  type: 'free' | 'premium';
  category: 'pack' | 'cosmetic' | 'xp-boost' | 'tool' | 'badge' | 'cards';
}

const rewards: Reward[] = [
  // Free tier rewards (every 5 levels)
  { tier: 1, name: 'Welcome Pack', description: '3 random cards for your digital binder', icon: '📦', type: 'free', category: 'pack' },
  { tier: 3, name: 'Bronze Collector Badge', description: 'Display on your profile', icon: '🥉', type: 'free', category: 'badge' },
  { tier: 5, name: 'Standard Pack', description: '5 cards with 1 guaranteed rare', icon: '📦', type: 'free', category: 'pack' },
  { tier: 8, name: '2x XP Token', description: 'Double XP for 24 hours', icon: '⚡', type: 'free', category: 'xp-boost' },
  { tier: 10, name: 'Silver Collector Badge', description: 'Upgraded profile badge', icon: '🥈', type: 'free', category: 'badge' },
  { tier: 13, name: 'Team Pack', description: 'Pick your favorite team, get 5 cards', icon: '🏟️', type: 'free', category: 'pack' },
  { tier: 15, name: 'Rare Pack', description: '5 cards with 2 guaranteed rares', icon: '✨', type: 'free', category: 'pack' },
  { tier: 18, name: '3x XP Token', description: 'Triple XP for 24 hours', icon: '⚡', type: 'free', category: 'xp-boost' },
  { tier: 20, name: 'Gold Collector Badge', description: 'Elite profile badge', icon: '🥇', type: 'free', category: 'badge' },
  { tier: 25, name: 'Premium Pack', description: '5 cards with guaranteed parallel', icon: '💎', type: 'free', category: 'pack' },
  { tier: 30, name: 'Platinum Badge', description: 'Platinum tier profile badge', icon: '💿', type: 'free', category: 'badge' },
  { tier: 35, name: 'Mega Pack', description: '10 cards with 3 guaranteed rares', icon: '🎁', type: 'free', category: 'pack' },
  { tier: 40, name: 'Diamond Badge', description: 'Diamond tier — top collectors only', icon: '💠', type: 'free', category: 'badge' },
  { tier: 45, name: '5x XP Mega Token', description: 'Quintuple XP for 48 hours', icon: '⚡', type: 'free', category: 'xp-boost' },
  { tier: 50, name: 'Season Champion', description: 'Ultimate badge + exclusive pack', icon: '🏆', type: 'free', category: 'badge' },
  // Premium rewards (every 2-3 levels)
  { tier: 2, name: 'Premium Welcome Pack', description: '5 cards with guaranteed rookie', icon: '📦', type: 'premium', category: 'pack' },
  { tier: 4, name: 'Rookie Spotlight Pack', description: '3 top 2024-25 rookies', icon: '⭐', type: 'premium', category: 'pack' },
  { tier: 6, name: 'Chrome Pack', description: '5 chrome cards for your binder', icon: '🪞', type: 'premium', category: 'pack' },
  { tier: 7, name: 'Card Show VIP Badge', description: 'Exclusive VIP profile flair', icon: '🎫', type: 'premium', category: 'badge' },
  { tier: 9, name: 'Prizm Pack', description: '5 prizm-style cards', icon: '🌈', type: 'premium', category: 'pack' },
  { tier: 11, name: 'Auto Pack', description: '3 cards with simulated auto', icon: '✍️', type: 'premium', category: 'pack' },
  { tier: 12, name: 'Market Alert Tool', description: 'Unlock advanced price alerts', icon: '📊', type: 'premium', category: 'tool' },
  { tier: 14, name: 'Hobby Box Sim', description: 'Free hobby box simulator unlock', icon: '📦', type: 'premium', category: 'pack' },
  { tier: 16, name: 'Numbered Card', description: 'Guaranteed /99 numbered card', icon: '🔢', type: 'premium', category: 'cards' },
  { tier: 17, name: 'Dealer Pro Badge', description: 'Pro dealer profile flair', icon: '🏪', type: 'premium', category: 'badge' },
  { tier: 19, name: 'Select Pack', description: '5 select-tier cards', icon: '💜', type: 'premium', category: 'pack' },
  { tier: 21, name: 'Short Print Card', description: 'Guaranteed SP variation', icon: '🃏', type: 'premium', category: 'cards' },
  { tier: 22, name: 'All-Star Pack', description: 'All-Star lineup cards', icon: '⭐', type: 'premium', category: 'pack' },
  { tier: 24, name: 'XP Overdrive', description: '10x XP for 24 hours', icon: '🚀', type: 'premium', category: 'xp-boost' },
  { tier: 26, name: 'National Treasures Pack', description: 'Premium 3-card pack', icon: '👑', type: 'premium', category: 'pack' },
  { tier: 28, name: 'Gem Mint Card', description: 'Guaranteed PSA 10 slab', icon: '💎', type: 'premium', category: 'cards' },
  { tier: 30, name: 'Legendary Badge', description: 'Legendary profile flair', icon: '🦁', type: 'premium', category: 'badge' },
  { tier: 33, name: 'Mystery Hit Pack', description: 'Guaranteed hit (auto/relic/numbered)', icon: '🎰', type: 'premium', category: 'pack' },
  { tier: 36, name: 'SuperFractor Card', description: '1/1 SuperFractor for your binder', icon: '🌟', type: 'premium', category: 'cards' },
  { tier: 38, name: 'Infinite XP Token', description: '2x XP for rest of season', icon: '♾️', type: 'premium', category: 'xp-boost' },
  { tier: 42, name: 'MVP Pack', description: '10 MVP-caliber cards', icon: '🏆', type: 'premium', category: 'pack' },
  { tier: 46, name: 'Hall of Fame Pack', description: 'All HOF legends pack', icon: '🏛️', type: 'premium', category: 'pack' },
  { tier: 50, name: 'Season Champion Elite', description: 'Animated badge + exclusive 1/1 card', icon: '👑', type: 'premium', category: 'badge' },
];

/* ───── XP Sources ───── */
const xpSources = [
  { action: 'Daily login', xp: 10, icon: '📅', frequency: 'daily' },
  { action: 'Open daily pack', xp: 15, icon: '📦', frequency: 'daily' },
  { action: 'Win a card battle', xp: 20, icon: '⚔️', frequency: 'per action' },
  { action: 'Complete trivia', xp: 25, icon: '❓', frequency: 'daily' },
  { action: 'Card Bingo line', xp: 50, icon: '🎯', frequency: 'daily' },
  { action: 'Weekly challenge', xp: 100, icon: '🏅', frequency: 'weekly' },
  { action: 'Complete achievement', xp: 30, icon: '🏆', frequency: 'per action' },
  { action: 'Use any tool', xp: 5, icon: '🔧', frequency: 'per action' },
  { action: 'Visit a card page', xp: 2, icon: '🃏', frequency: 'per action' },
  { action: 'Rip or Skip vote', xp: 10, icon: '👍', frequency: 'daily' },
  { action: 'Streak milestone (7 days)', xp: 75, icon: '🔥', frequency: 'weekly' },
  { action: 'Trade in Trade Hub', xp: 15, icon: '🤝', frequency: 'per action' },
];

/* ───── State ───── */
interface SeasonPassState {
  xp: number;
  claimedTiers: number[];
  isPremium: boolean;
  lastDaily: string;
  dailyXpEarned: number;
}

const defaultState: SeasonPassState = {
  xp: 0,
  claimedTiers: [],
  isPremium: false,
  lastDaily: '',
  dailyXpEarned: 0,
};

function loadState(): SeasonPassState {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch { return defaultState; }
}

function saveState(state: SeasonPassState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* */ }
}

/* ───── Component ───── */
export default function SeasonPassClient() {
  const [state, setState] = useState<SeasonPassState>(defaultState);
  const [mounted, setMounted] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [claimAnimation, setClaimAnimation] = useState<number | null>(null);

  useEffect(() => {
    const loaded = loadState();
    // Daily XP reset
    const today = new Date().toISOString().slice(0, 10);
    if (loaded.lastDaily !== today) {
      loaded.dailyXpEarned = 0;
      loaded.lastDaily = today;
    }
    setState(loaded);
    setMounted(true);
  }, []);

  const currentTier = useMemo(() => Math.min(Math.floor(state.xp / XP_PER_TIER), TOTAL_TIERS), [state.xp]);
  const tierProgress = useMemo(() => (state.xp % XP_PER_TIER) / XP_PER_TIER * 100, [state.xp]);
  const totalXpNeeded = TOTAL_TIERS * XP_PER_TIER;
  const daysRemaining = useMemo(() => {
    const now = new Date();
    const diff = SEASON_END.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / 86400000));
  }, []);

  const earnXp = useCallback((amount: number) => {
    setState(prev => {
      const updated = { ...prev, xp: prev.xp + amount, dailyXpEarned: prev.dailyXpEarned + amount };
      saveState(updated);
      return updated;
    });
  }, []);

  const claimReward = useCallback((tier: number) => {
    if (currentTier < tier || state.claimedTiers.includes(tier)) return;
    const reward = rewards.find(r => r.tier === tier);
    if (reward && reward.type === 'premium' && !state.isPremium) return;

    setClaimAnimation(tier);
    setTimeout(() => setClaimAnimation(null), 1000);

    setState(prev => {
      const updated = { ...prev, claimedTiers: [...prev.claimedTiers, tier] };
      saveState(updated);
      return updated;
    });
  }, [currentTier, state.claimedTiers, state.isPremium]);

  const togglePremium = useCallback(() => {
    setState(prev => {
      const updated = { ...prev, isPremium: !prev.isPremium };
      saveState(updated);
      return updated;
    });
    setShowUpgrade(false);
  }, []);

  if (!mounted) {
    return <div className="mt-8 animate-pulse"><div className="h-64 bg-gray-800/50 rounded-xl" /></div>;
  }

  const freeRewards = rewards.filter(r => r.type === 'free');
  const premiumRewards = rewards.filter(r => r.type === 'premium');

  return (
    <div className="mt-6 space-y-8">
      {/* Season Header */}
      <div className="bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-800/30 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              {SEASON_NAME} — {daysRemaining} days remaining
            </div>
            <h2 className="text-2xl font-bold text-white">Season Pass</h2>
            <p className="text-gray-400 text-sm mt-1">Earn XP through daily activities. Unlock packs, badges, and exclusive rewards.</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-indigo-400">Tier {currentTier}</div>
            <div className="text-xs text-gray-500 mt-1">{state.xp.toLocaleString()} / {totalXpNeeded.toLocaleString()} XP</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Tier {currentTier}</span>
            <span>Tier {Math.min(currentTier + 1, TOTAL_TIERS)}</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${currentTier >= TOTAL_TIERS ? 100 : tierProgress}%` }}
            />
          </div>
          <div className="text-center text-xs text-gray-600 mt-1">
            {currentTier >= TOTAL_TIERS ? 'MAX TIER REACHED!' : `${XP_PER_TIER - (state.xp % XP_PER_TIER)} XP to next tier`}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{currentTier}/{TOTAL_TIERS}</div>
            <div className="text-xs text-gray-500">Current Tier</div>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-indigo-400">{state.xp.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total XP</div>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-emerald-400">{state.claimedTiers.length}</div>
            <div className="text-xs text-gray-500">Rewards Claimed</div>
          </div>
          <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-amber-400">{state.dailyXpEarned}</div>
            <div className="text-xs text-gray-500">XP Today</div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade CTA */}
      {!state.isPremium && (
        <div className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 border border-amber-800/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-amber-300">Upgrade to Premium Pass</h3>
            <p className="text-sm text-gray-400 mt-1">Unlock {premiumRewards.length} additional rewards including exclusive packs, badges, and XP boosts</p>
          </div>
          <button
            onClick={() => setShowUpgrade(true)}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors shrink-0"
          >
            View Premium Rewards
          </button>
        </div>
      )}

      {/* Reward Track */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Reward Track</h3>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-2" style={{ minWidth: `${TOTAL_TIERS * 72}px` }}>
            {Array.from({ length: TOTAL_TIERS }, (_, i) => i + 1).map(tier => {
              const freeReward = freeRewards.find(r => r.tier === tier);
              const premiumReward = premiumRewards.find(r => r.tier === tier);
              const isUnlocked = currentTier >= tier;
              const freeClaimed = freeReward && state.claimedTiers.includes(tier);
              const premiumClaimed = premiumReward && state.claimedTiers.includes(tier + 100);

              return (
                <div key={tier} className="flex flex-col items-center gap-1 min-w-[68px]">
                  {/* Premium reward slot */}
                  <div className={`w-14 h-14 rounded-lg border flex items-center justify-center text-lg transition-all ${
                    premiumReward
                      ? state.isPremium && isUnlocked
                        ? premiumClaimed
                          ? 'bg-amber-900/30 border-amber-700/50 opacity-50'
                          : claimAnimation === tier + 100
                            ? 'bg-amber-600/40 border-amber-500 scale-110'
                            : 'bg-amber-900/40 border-amber-700/50 cursor-pointer hover:border-amber-500'
                        : 'bg-gray-800/30 border-gray-700/30 opacity-40'
                      : 'bg-transparent border-transparent'
                  }`}
                  onClick={() => premiumReward && state.isPremium && isUnlocked && claimReward(tier + 100)}
                  title={premiumReward?.name}
                  >
                    {premiumReward ? (
                      <span className={premiumClaimed ? 'grayscale' : ''}>{premiumReward.icon}</span>
                    ) : null}
                  </div>

                  {/* Tier number */}
                  <div className={`text-[10px] font-mono font-bold ${isUnlocked ? 'text-indigo-400' : 'text-gray-600'}`}>
                    {tier}
                  </div>

                  {/* Progress dot */}
                  <div className={`w-3 h-3 rounded-full ${
                    isUnlocked ? 'bg-indigo-500' : tier === currentTier + 1 ? 'bg-indigo-800 ring-2 ring-indigo-500/30' : 'bg-gray-700'
                  }`} />

                  {/* Free reward slot */}
                  <div className={`w-14 h-14 rounded-lg border flex items-center justify-center text-lg transition-all ${
                    freeReward
                      ? isUnlocked
                        ? freeClaimed
                          ? 'bg-emerald-900/30 border-emerald-700/50 opacity-50'
                          : claimAnimation === tier
                            ? 'bg-emerald-600/40 border-emerald-500 scale-110'
                            : 'bg-emerald-900/40 border-emerald-700/50 cursor-pointer hover:border-emerald-500'
                        : 'bg-gray-800/30 border-gray-700/30 opacity-40'
                      : 'bg-transparent border-transparent'
                  }`}
                  onClick={() => freeReward && isUnlocked && claimReward(tier)}
                  title={freeReward?.name}
                  >
                    {freeReward ? (
                      <span className={freeClaimed ? 'grayscale' : ''}>{freeReward.icon}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-900/40 border border-emerald-700/50 inline-block" /> Free Rewards</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-900/40 border border-amber-700/50 inline-block" /> Premium Rewards</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Unlocked</span>
        </div>
      </div>

      {/* XP Sources */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-1">How to Earn XP</h3>
        <p className="text-gray-500 text-sm mb-4">Complete activities across CardVault to earn Season Pass XP</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {xpSources.map(source => (
            <button
              key={source.action}
              onClick={() => earnXp(source.xp)}
              className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/30 rounded-xl p-3 hover:border-indigo-700/50 hover:bg-indigo-950/20 transition-colors text-left"
            >
              <span className="text-xl">{source.icon}</span>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{source.action}</div>
                <div className="text-xs text-gray-500">{source.frequency}</div>
              </div>
              <div className="text-sm font-bold text-indigo-400">+{source.xp}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">Click any activity to simulate earning XP (prototype)</p>
      </div>

      {/* Current Reward Details */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Rewards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rewards
            .filter(r => r.tier > currentTier && (r.type === 'free' || state.isPremium))
            .slice(0, 6)
            .map(reward => (
              <div key={`${reward.tier}-${reward.type}`} className={`flex items-center gap-3 rounded-xl p-3 border ${
                reward.type === 'premium'
                  ? 'bg-amber-950/20 border-amber-800/30'
                  : 'bg-gray-800/40 border-gray-700/30'
              }`}>
                <span className="text-2xl">{reward.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{reward.name}</span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">Tier {reward.tier}</span>
                    {reward.type === 'premium' && <span className="text-[10px] bg-amber-900/60 text-amber-400 px-1.5 py-0.5 rounded">PREMIUM</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Cross-links */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Earn XP with These Features</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/daily-pack', label: 'Daily Pack (+15 XP)' },
            { href: '/trivia', label: 'Daily Trivia (+25 XP)' },
            { href: '/bingo', label: 'Card Bingo (+50 XP)' },
            { href: '/weekly-challenge', label: 'Weekly Challenge (+100 XP)' },
            { href: '/streak', label: 'Visit Streak (+10 XP)' },
            { href: '/achievements', label: 'Achievements (+30 XP)' },
            { href: '/rip-or-skip', label: 'Rip or Skip (+10 XP)' },
            { href: '/progression', label: 'Progression System' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-amber-300 mb-2">Premium Season Pass</h3>
            <p className="text-sm text-gray-400 mb-4">{premiumRewards.length} exclusive rewards including packs, badges, XP boosts, and rare cards.</p>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
              {premiumRewards.slice(0, 8).map(r => (
                <div key={r.tier} className="flex items-center gap-2 text-sm">
                  <span>{r.icon}</span>
                  <span className="text-gray-300">{r.name}</span>
                  <span className="text-xs text-gray-600">Tier {r.tier}</span>
                </div>
              ))}
              <p className="text-xs text-gray-500">...and {premiumRewards.length - 8} more rewards</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={togglePremium}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Activate Premium (Prototype)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
