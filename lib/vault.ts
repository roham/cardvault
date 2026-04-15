/**
 * CardVault Commerce & Vault Data Model (V-001)
 *
 * Prototype UX — all data in localStorage, no real payments.
 * Mock wallet with starting balance. Pack purchase → reveal → vault flow.
 */

import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────────────

export interface VaultCard {
  slug: string;
  acquiredAt: string;       // ISO timestamp
  acquiredFrom: 'pack' | 'marketplace' | 'trade' | 'daily' | 'starter';
  packId?: string;
  pricePaid: number;        // what user paid for the pack / card (0 for free)
}

export interface MockWallet {
  balance: number;          // dollars (e.g. 100.00)
  totalSpent: number;
  totalEarned: number;      // from buybacks and sales
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'buyback' | 'marketplace-buy' | 'marketplace-sell' | 'credit' | 'starter-bonus';
  amount: number;           // positive = credit, negative = debit
  description: string;
  timestamp: string;
  packId?: string;
  cardSlugs?: string[];
}

export type PackTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface StorePack {
  id: string;
  name: string;
  description: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey' | 'mixed';
  tier: PackTier;
  price: number;
  cardsPerPack: number;
  guaranteedRarity: string;   // e.g. "1 card worth $50+"
  odds: { label: string; chance: string }[];
  gradient: string;
  borderColor: string;
  icon: string;
  featured?: boolean;
  isNew?: boolean;
}

// ── Pack Store Catalog ─────────────────────────────────────────────────

export const STORE_PACKS: StorePack[] = [
  // Bronze Tier — $4.99, 5 cards
  { id: 'bronze-baseball', name: 'Baseball Basics', description: 'A starter pack of baseball cards with a chance at a valuable hit.', sport: 'baseball', tier: 'bronze', price: 4.99, cardsPerPack: 5, guaranteedRarity: 'All cards $5+', odds: [{ label: '$100+ card', chance: '8%' }, { label: '$50+ card', chance: '20%' }, { label: '$25+ card', chance: '40%' }], gradient: 'from-red-900/60 to-red-800/40', borderColor: 'border-red-700/50', icon: '⚾', featured: false },
  { id: 'bronze-basketball', name: 'Basketball Starters', description: 'Hardwood classics and modern stars at an entry-level price.', sport: 'basketball', tier: 'bronze', price: 4.99, cardsPerPack: 5, guaranteedRarity: 'All cards $5+', odds: [{ label: '$100+ card', chance: '8%' }, { label: '$50+ card', chance: '20%' }, { label: '$25+ card', chance: '40%' }], gradient: 'from-orange-900/60 to-orange-800/40', borderColor: 'border-orange-700/50', icon: '🏀' },
  { id: 'bronze-football', name: 'Football Fundamentals', description: 'Gridiron legends and rising stars. Great for building a foundation.', sport: 'football', tier: 'bronze', price: 4.99, cardsPerPack: 5, guaranteedRarity: 'All cards $5+', odds: [{ label: '$100+ card', chance: '8%' }, { label: '$50+ card', chance: '20%' }, { label: '$25+ card', chance: '40%' }], gradient: 'from-blue-900/60 to-blue-800/40', borderColor: 'border-blue-700/50', icon: '🏈' },
  { id: 'bronze-hockey', name: 'Hockey Essentials', description: 'Ice legends from the Original Six to modern superstars.', sport: 'hockey', tier: 'bronze', price: 4.99, cardsPerPack: 5, guaranteedRarity: 'All cards $5+', odds: [{ label: '$100+ card', chance: '8%' }, { label: '$50+ card', chance: '20%' }, { label: '$25+ card', chance: '40%' }], gradient: 'from-cyan-900/60 to-cyan-800/40', borderColor: 'border-cyan-700/50', icon: '🏒' },
  { id: 'bronze-mixed', name: 'All-Sport Sampler', description: 'A mix of all four sports. Perfect for discovering what you collect.', sport: 'mixed', tier: 'bronze', price: 4.99, cardsPerPack: 5, guaranteedRarity: 'All cards $5+', odds: [{ label: '$100+ card', chance: '10%' }, { label: '$50+ card', chance: '25%' }, { label: '$25+ card', chance: '45%' }], gradient: 'from-emerald-900/60 to-teal-800/40', borderColor: 'border-emerald-700/50', icon: '🎲', featured: true },

  // Silver Tier — $14.99, 5 cards, 1 guaranteed $50+
  { id: 'silver-baseball', name: 'Baseball All-Stars', description: 'Premium baseball selection. Guaranteed $50+ hit in every pack.', sport: 'baseball', tier: 'silver', price: 14.99, cardsPerPack: 5, guaranteedRarity: '1 card worth $50+', odds: [{ label: '$200+ card', chance: '12%' }, { label: '$100+ card', chance: '30%' }], gradient: 'from-red-800/60 to-rose-700/40', borderColor: 'border-red-600/50', icon: '⚾' },
  { id: 'silver-basketball', name: 'Basketball Ballers', description: 'Court kings and future legends. One guaranteed premium hit.', sport: 'basketball', tier: 'silver', price: 14.99, cardsPerPack: 5, guaranteedRarity: '1 card worth $50+', odds: [{ label: '$200+ card', chance: '12%' }, { label: '$100+ card', chance: '30%' }], gradient: 'from-orange-800/60 to-amber-700/40', borderColor: 'border-orange-600/50', icon: '🏀' },
  { id: 'silver-football', name: 'Football Franchise', description: 'Franchise players and playoff performers. Premium guaranteed.', sport: 'football', tier: 'silver', price: 14.99, cardsPerPack: 5, guaranteedRarity: '1 card worth $50+', odds: [{ label: '$200+ card', chance: '12%' }, { label: '$100+ card', chance: '30%' }], gradient: 'from-blue-800/60 to-indigo-700/40', borderColor: 'border-blue-600/50', icon: '🏈' },
  { id: 'silver-rookies', name: 'Rookie Spotlight', description: 'All rookie cards from across all sports. Chase the next big name.', sport: 'mixed', tier: 'silver', price: 14.99, cardsPerPack: 5, guaranteedRarity: '1 rookie worth $50+', odds: [{ label: '$200+ rookie', chance: '10%' }, { label: '$100+ rookie', chance: '25%' }], gradient: 'from-amber-800/60 to-yellow-700/40', borderColor: 'border-amber-600/50', icon: '⭐', isNew: true },

  // Gold Tier — $29.99, 4 cards, 1 guaranteed $200+
  { id: 'gold-legends', name: 'Diamond Kings', description: 'Premium baseball legends. Every pack has a $200+ card guaranteed.', sport: 'baseball', tier: 'gold', price: 29.99, cardsPerPack: 4, guaranteedRarity: '1 card worth $200+', odds: [{ label: '$500+ card', chance: '15%' }, { label: '$1,000+ card', chance: '5%' }], gradient: 'from-yellow-800/60 to-amber-600/40', borderColor: 'border-yellow-500/50', icon: '👑' },
  { id: 'gold-hardwood', name: 'Hardwood Heroes', description: 'Basketball royalty. Court legends and franchise cornerstones.', sport: 'basketball', tier: 'gold', price: 29.99, cardsPerPack: 4, guaranteedRarity: '1 card worth $200+', odds: [{ label: '$500+ card', chance: '15%' }, { label: '$1,000+ card', chance: '5%' }], gradient: 'from-yellow-800/60 to-orange-600/40', borderColor: 'border-yellow-500/50', icon: '🏅' },
  { id: 'gold-vintage', name: 'Vintage Vault', description: 'Pre-1975 cards only. A window into collecting history.', sport: 'mixed', tier: 'gold', price: 29.99, cardsPerPack: 4, guaranteedRarity: '1 card worth $200+', odds: [{ label: '$1,000+ card', chance: '10%' }, { label: '$500+ card', chance: '25%' }], gradient: 'from-amber-700/60 to-yellow-600/40', borderColor: 'border-amber-500/50', icon: '🏛️', featured: true },

  // Platinum Tier — $49.99, 3 cards, all guaranteed $100+
  { id: 'platinum-hof', name: 'Hall of Fame', description: 'Only Hall of Famers. Every card is a certified legend worth $100+.', sport: 'mixed', tier: 'platinum', price: 49.99, cardsPerPack: 3, guaranteedRarity: 'All cards $100+', odds: [{ label: '$1,000+ card', chance: '15%' }, { label: '$500+ card', chance: '35%' }], gradient: 'from-purple-800/60 to-violet-600/40', borderColor: 'border-purple-500/50', icon: '🏆', featured: true },
  { id: 'platinum-goat', name: 'The GOAT Pack', description: 'The 100 most valuable cards in the vault. Chase a five-figure hit.', sport: 'mixed', tier: 'platinum', price: 49.99, cardsPerPack: 3, guaranteedRarity: 'All cards $250+', odds: [{ label: '$5,000+ card', chance: '10%' }, { label: '$1,000+ card', chance: '30%' }], gradient: 'from-fuchsia-800/60 to-pink-600/40', borderColor: 'border-fuchsia-500/50', icon: '🐐', isNew: true },
];

// ── Tier metadata ──────────────────────────────────────────────────────

export const TIER_INFO: Record<PackTier, { label: string; color: string; bg: string; border: string }> = {
  bronze: { label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/50' },
  silver: { label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-800/40', border: 'border-gray-600/50' },
  gold: { label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-950/40', border: 'border-yellow-700/50' },
  platinum: { label: 'Platinum', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-700/50' },
};

// ── localStorage keys ──────────────────────────────────────────────────

const WALLET_KEY = 'cardvault-wallet';
const VAULT_KEY = 'cardvault-vault-cards';
const TRANSACTIONS_KEY = 'cardvault-transactions';

const STARTER_BALANCE = 250.00;

// ── Wallet helpers ─────────────────────────────────────────────────────

export function getWallet(): MockWallet {
  try {
    const saved = localStorage.getItem(WALLET_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* fresh wallet */ }
  const wallet: MockWallet = {
    balance: STARTER_BALANCE,
    totalSpent: 0,
    totalEarned: 0,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  // Log starter bonus transaction
  addTransaction({
    type: 'starter-bonus',
    amount: STARTER_BALANCE,
    description: 'Welcome bonus — start collecting!',
  });
  return wallet;
}

export function saveWallet(wallet: MockWallet): void {
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
}

// ── Vault helpers ──────────────────────────────────────────────────────

export function getVaultCards(): VaultCard[] {
  try {
    const saved = localStorage.getItem(VAULT_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* empty vault */ }
  return [];
}

export function addToVault(cards: VaultCard[]): void {
  const current = getVaultCards();
  localStorage.setItem(VAULT_KEY, JSON.stringify([...current, ...cards]));
}

export function removeFromVault(slug: string): VaultCard | undefined {
  const current = getVaultCards();
  const idx = current.findIndex(c => c.slug === slug);
  if (idx === -1) return undefined;
  const removed = current.splice(idx, 1)[0];
  localStorage.setItem(VAULT_KEY, JSON.stringify(current));
  return removed;
}

// ── Transaction helpers ────────────────────────────────────────────────

export function getTransactions(): Transaction[] {
  try {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* empty */ }
  return [];
}

export function addTransaction(partial: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
  const tx: Transaction = {
    ...partial,
    id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const list = getTransactions();
  list.unshift(tx);
  // Keep last 200 transactions
  if (list.length > 200) list.length = 200;
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
  return tx;
}

// ── Pack opening logic ─────────────────────────────────────────────────

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function openPack(pack: StorePack): SportsCard[] {
  const seed = Date.now() + Math.floor(Math.random() * 100000);
  const rng = seededRandom(seed);

  // Filter cards by sport
  let pool: SportsCard[];
  if (pack.sport === 'mixed') {
    pool = [...sportsCards];
  } else {
    pool = sportsCards.filter(c => c.sport === pack.sport);
  }

  // Apply tier-based value filters
  const allValues = pool.map(c => ({ card: c, value: parseValue(c.estimatedValueRaw) }));

  let minValue = 0;
  let guaranteedMinValue = 0;

  switch (pack.tier) {
    case 'bronze':
      minValue = 5;
      guaranteedMinValue = 0; // no guaranteed premium
      break;
    case 'silver':
      minValue = 5;
      guaranteedMinValue = 50;
      break;
    case 'gold':
      minValue = 25;
      guaranteedMinValue = 200;
      break;
    case 'platinum':
      minValue = 100;
      guaranteedMinValue = 100;
      break;
  }

  // Special filters
  const isVintage = pack.id === 'gold-vintage';
  const isRookieOnly = pack.id === 'silver-rookies';
  const isHofOnly = pack.id === 'platinum-hof';

  let filtered = allValues.filter(cv => cv.value >= minValue);
  if (isVintage) filtered = filtered.filter(cv => cv.card.year < 1975);
  if (isRookieOnly) filtered = filtered.filter(cv => cv.card.rookie);

  // Fallback: if pool too small, relax constraints
  if (filtered.length < pack.cardsPerPack * 3) {
    filtered = allValues.filter(cv => cv.value >= Math.max(1, minValue / 2));
  }

  // Sort by value for weighted selection
  filtered.sort((a, b) => a.value - b.value);

  const selected: SportsCard[] = [];
  const usedSlugs = new Set<string>();

  // Guaranteed premium card(s)
  if (guaranteedMinValue > 0) {
    const premiumPool = filtered.filter(cv => cv.value >= guaranteedMinValue);
    if (premiumPool.length > 0) {
      const pick = premiumPool[Math.floor(rng() * premiumPool.length)];
      selected.push(pick.card);
      usedSlugs.add(pick.card.slug);
    }
  }

  // Fill remaining slots with weighted random
  const remaining = pack.cardsPerPack - selected.length;
  const available = filtered.filter(cv => !usedSlugs.has(cv.card.slug));

  for (let i = 0; i < remaining && available.length > 0; i++) {
    // Weight toward lower-value cards (more common)
    const weights = available.map((cv, idx) => {
      const pos = idx / available.length;
      // Bronze/silver: heavy weight on common. Gold/platinum: more even.
      const skew = pack.tier === 'platinum' ? 0.5 : pack.tier === 'gold' ? 0.7 : 1.2;
      return Math.pow(1 - pos, skew);
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;
    let picked = 0;
    for (let j = 0; j < weights.length; j++) {
      r -= weights[j];
      if (r <= 0) { picked = j; break; }
    }
    selected.push(available[picked].card);
    usedSlugs.add(available[picked].card.slug);
    available.splice(picked, 1);
  }

  return selected;
}

// ── Purchase flow ──────────────────────────────────────────────────────

export interface PurchaseResult {
  success: boolean;
  error?: string;
  cards: SportsCard[];
  transaction?: Transaction;
}

export function purchasePack(pack: StorePack): PurchaseResult {
  const wallet = getWallet();

  if (wallet.balance < pack.price) {
    return { success: false, error: 'Insufficient balance', cards: [] };
  }

  // Open pack
  const cards = openPack(pack);

  // Debit wallet
  wallet.balance = Math.round((wallet.balance - pack.price) * 100) / 100;
  wallet.totalSpent = Math.round((wallet.totalSpent + pack.price) * 100) / 100;
  saveWallet(wallet);

  // Add cards to vault
  const now = new Date().toISOString();
  const vaultCards: VaultCard[] = cards.map(c => ({
    slug: c.slug,
    acquiredAt: now,
    acquiredFrom: 'pack' as const,
    packId: pack.id,
    pricePaid: Math.round((pack.price / cards.length) * 100) / 100,
  }));
  addToVault(vaultCards);

  // Log transaction
  const tx = addTransaction({
    type: 'purchase',
    amount: -pack.price,
    description: `Opened ${pack.name}`,
    packId: pack.id,
    cardSlugs: cards.map(c => c.slug),
  });

  return { success: true, cards, transaction: tx };
}

// ── Buyback (90% FMV) ──────────────────────────────────────────────────

export function buybackCard(slug: string): { success: boolean; credit: number; error?: string } {
  const card = sportsCards.find(c => c.slug === slug);
  if (!card) return { success: false, credit: 0, error: 'Card not found' };

  const removed = removeFromVault(slug);
  if (!removed) return { success: false, credit: 0, error: 'Card not in vault' };

  const rawValue = parseValue(card.estimatedValueRaw);
  const credit = Math.round(rawValue * 0.9 * 100) / 100; // 90% FMV

  const wallet = getWallet();
  wallet.balance = Math.round((wallet.balance + credit) * 100) / 100;
  wallet.totalEarned = Math.round((wallet.totalEarned + credit) * 100) / 100;
  saveWallet(wallet);

  addTransaction({
    type: 'buyback',
    amount: credit,
    description: `Sold back ${card.name} (90% FMV)`,
    cardSlugs: [slug],
  });

  return { success: true, credit };
}

// ── Batch Buyback ─────────────────────────────────────────────────────

export function buybackCards(slugs: string[]): { success: boolean; totalCredit: number; results: { slug: string; credit: number; name: string }[]; error?: string } {
  if (slugs.length === 0) return { success: false, totalCredit: 0, results: [], error: 'No cards selected' };

  const results: { slug: string; credit: number; name: string }[] = [];
  let totalCredit = 0;

  for (const slug of slugs) {
    const card = sportsCards.find(c => c.slug === slug);
    if (!card) continue;

    const removed = removeFromVault(slug);
    if (!removed) continue;

    const rawValue = parseValue(card.estimatedValueRaw);
    const credit = Math.round(rawValue * 0.9 * 100) / 100;
    totalCredit += credit;
    results.push({ slug, credit, name: card.name });
  }

  if (results.length === 0) return { success: false, totalCredit: 0, results: [], error: 'No valid cards to sell' };

  totalCredit = Math.round(totalCredit * 100) / 100;

  const wallet = getWallet();
  wallet.balance = Math.round((wallet.balance + totalCredit) * 100) / 100;
  wallet.totalEarned = Math.round((wallet.totalEarned + totalCredit) * 100) / 100;
  saveWallet(wallet);

  addTransaction({
    type: 'buyback',
    amount: totalCredit,
    description: `Sold back ${results.length} card${results.length > 1 ? 's' : ''} (90% FMV)`,
    cardSlugs: results.map(r => r.slug),
  });

  return { success: true, totalCredit, results };
}
