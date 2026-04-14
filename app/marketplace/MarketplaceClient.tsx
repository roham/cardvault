'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard, getJerseyNumber } from '@/data/sports-cards';
import { getWallet, saveWallet, addToVault, addTransaction, getVaultCards, removeFromVault, type VaultCard } from '@/lib/vault';

// ── Types ──────────────────────────────────────────────────────────────

interface Listing {
  card: SportsCard;
  sellerId: string;
  sellerName: string;
  listPrice: number;
  marketValue: number;
  discount: number; // negative = below market, positive = premium
  listedAt: string;
  condition: string;
}

type SortOption = 'price-low' | 'price-high' | 'discount' | 'newest' | 'value';
type Tab = 'browse' | 'sell';

// ── Helpers ────────────────────────────────────────────────────────────

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

const SELLER_FIRST = ['CardKing', 'VaultPro', 'TopDeck', 'GemMint', 'SlabCity', 'BaseBreaker', 'WaxRipper', 'GradeChaser', 'FlipMaster', 'SetBuilder', 'RookieHunter', 'VintageVault', 'ChromeCollector', 'PackRat', 'CaseBreaker'];
const SELLER_SUFFIX = ['99', '23', '07', '_TX', '_CA', '_NY', 'Official', '2026', '_Pro', ''];
const CONDITIONS = ['Raw NM', 'Raw EX', 'PSA 9', 'PSA 10', 'BGS 9.5', 'SGC 9.5', 'Raw VG'];

function generateListings(dayOffset: number): Listing[] {
  const rng = seededRng(20260414 + dayOffset);
  const listings: Listing[] = [];
  const eligible = sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 3);
  const count = Math.min(60, eligible.length);

  // Pick cards deterministically
  const shuffled = [...eligible].sort((a, b) => {
    return rng() - 0.5;
  });

  for (let i = 0; i < count; i++) {
    const card = shuffled[i];
    const mv = parseValue(card.estimatedValueRaw);
    // Discount: -15% to +10% from market value
    const discountPct = Math.round((rng() * 25 - 15));
    const listPrice = Math.max(1, Math.round(mv * (1 + discountPct / 100)));
    const sellerFirst = SELLER_FIRST[Math.floor(rng() * SELLER_FIRST.length)];
    const sellerSuffix = SELLER_SUFFIX[Math.floor(rng() * SELLER_SUFFIX.length)];
    const condition = CONDITIONS[Math.floor(rng() * CONDITIONS.length)];
    const hoursAgo = Math.floor(rng() * 48);

    listings.push({
      card,
      sellerId: `seller-${i}`,
      sellerName: `${sellerFirst}${sellerSuffix}`,
      listPrice,
      marketValue: mv,
      discount: discountPct,
      listedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      condition,
    });
  }

  return listings;
}

// ── Component ──────────────────────────────────────────────────────────

export default function MarketplaceClient() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('browse');
  const [balance, setBalance] = useState(0);
  const [sport, setSport] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('discount');
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [buying, setBuying] = useState<string | null>(null);
  const [purchased, setPurchased] = useState<Set<string>>(new Set());
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [sellPrice, setSellPrice] = useState<Record<string, number>>({});
  const [listed, setListed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    const w = getWallet();
    setBalance(w.balance);
    setVaultCards(getVaultCards());
  }, []);

  const dayOffset = useMemo(() => {
    const now = new Date();
    return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  }, []);

  const allListings = useMemo(() => generateListings(dayOffset), [dayOffset]);

  const filtered = useMemo(() => {
    let items = [...allListings];

    // Filter out purchased
    items = items.filter(l => !purchased.has(l.card.slug));

    if (sport !== 'all') items = items.filter(l => l.card.sport === sport);

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(l =>
        l.card.name.toLowerCase().includes(q) ||
        l.card.player.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q)
      );
    }

    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      items = items.filter(l => l.listPrice >= min && (max ? l.listPrice <= max : true));
    }

    // Sort
    switch (sort) {
      case 'price-low': items.sort((a, b) => a.listPrice - b.listPrice); break;
      case 'price-high': items.sort((a, b) => b.listPrice - a.listPrice); break;
      case 'discount': items.sort((a, b) => a.discount - b.discount); break;
      case 'newest': items.sort((a, b) => new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()); break;
      case 'value': items.sort((a, b) => b.marketValue - a.marketValue); break;
    }

    return items;
  }, [allListings, sport, sort, search, priceRange, purchased]);

  function handleBuy(listing: Listing) {
    setBuying(listing.card.slug);
    setTimeout(() => {
      const wallet = getWallet();
      if (wallet.balance < listing.listPrice) {
        setBuying(null);
        return;
      }
      wallet.balance -= listing.listPrice;
      wallet.totalSpent += listing.listPrice;
      saveWallet(wallet);
      setBalance(wallet.balance);

      addToVault([{
        slug: listing.card.slug,
        acquiredAt: new Date().toISOString(),
        acquiredFrom: 'marketplace',
        pricePaid: listing.listPrice,
      }]);

      addTransaction({
        type: 'marketplace-buy',
        amount: -listing.listPrice,
        description: `Bought ${listing.card.player} from ${listing.sellerName}`,
        cardSlugs: [listing.card.slug],
      });

      setPurchased(prev => new Set([...prev, listing.card.slug]));
      setVaultCards(getVaultCards());
      setBuying(null);
    }, 600);
  }

  function handleList(vc: VaultCard) {
    const card = sportsCards.find(c => c.slug === vc.slug);
    if (!card) return;
    const price = sellPrice[vc.slug] ?? parseValue(card.estimatedValueRaw);
    const fee = Math.round(price * 0.05);
    const proceeds = price - fee;

    removeFromVault(vc.slug);
    const wallet = getWallet();
    wallet.balance += proceeds;
    wallet.totalEarned += proceeds;
    saveWallet(wallet);
    setBalance(wallet.balance);

    addTransaction({
      type: 'marketplace-sell',
      amount: proceeds,
      description: `Sold ${card.player} on marketplace ($${price} - $${fee} fee)`,
      cardSlugs: [vc.slug],
    });

    setListed(prev => new Set([...prev, vc.slug]));
    setVaultCards(getVaultCards());
  }

  function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'just now';
    if (hours === 1) return '1h ago';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-800 rounded-xl w-1/3" />
        <div className="h-64 bg-gray-800 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          {filtered.length} listings available
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Marketplace</h1>
        <p className="text-gray-400 max-w-2xl">
          Browse cards listed by other collectors. Find deals below market value, or list your vault cards for sale.
        </p>
      </div>

      {/* Wallet Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500 text-xs">Wallet Balance</span>
            <p className="text-emerald-400 text-lg font-bold">${balance.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-gray-500 text-xs">Vault Cards</span>
            <p className="text-white text-lg font-bold">{vaultCards.length}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/packs" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors">
            Open Packs
          </Link>
          <Link href="/vault" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-gray-700">
            My Vault
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(['browse', 'sell'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'browse' ? 'Browse Listings' : 'Sell Your Cards'}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <select
              value={sport}
              onChange={e => setSport(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Sports</option>
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
            </select>
            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">Any Price</option>
              <option value="1-10">Under $10</option>
              <option value="10-50">$10 - $50</option>
              <option value="50-200">$50 - $200</option>
              <option value="200-0">$200+</option>
            </select>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="discount">Best Deals</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="value">Market Value</option>
              <option value="newest">Newest</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search player or card..."
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Listing Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg mb-2">No listings match your filters</p>
              <button onClick={() => { setSport('all'); setPriceRange('all'); setSearch(''); }} className="text-emerald-400 text-sm hover:underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(listing => {
                const jersey = getJerseyNumber(listing.card.player);
                const isDeal = listing.discount < -5;
                const isBuying = buying === listing.card.slug;
                const cantAfford = balance < listing.listPrice;

                return (
                  <div
                    key={listing.card.slug + listing.sellerId}
                    className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${
                      isDeal ? 'border-emerald-700/50 ring-1 ring-emerald-500/20' : 'border-gray-800'
                    }`}
                  >
                    <div className="p-4">
                      {/* Top row: badges */}
                      <div className="flex items-center gap-2 mb-3">
                        {isDeal && (
                          <span className="text-xs bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                            {listing.discount}% Deal
                          </span>
                        )}
                        {listing.discount > 5 && (
                          <span className="text-xs bg-red-950/60 border border-red-800/50 text-red-400 px-2 py-0.5 rounded-full font-medium">
                            +{listing.discount}% Premium
                          </span>
                        )}
                        <span className="text-xs text-gray-600 ml-auto">{timeAgo(listing.listedAt)}</span>
                      </div>

                      {/* Card info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg shrink-0">
                          {listing.card.sport === 'baseball' ? '⚾' : listing.card.sport === 'basketball' ? '🏀' : listing.card.sport === 'football' ? '🏈' : '🏒'}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/sports/${listing.card.slug}`} className="text-white font-medium text-sm hover:text-emerald-400 transition-colors line-clamp-1">
                            {listing.card.player}
                          </Link>
                          <p className="text-gray-500 text-xs truncate">{listing.card.set} #{listing.card.cardNumber}</p>
                          <p className="text-gray-600 text-xs">{listing.condition} {jersey ? `· #${jersey}` : ''}</p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <p className="text-gray-500 text-xs">Listed by {listing.sellerName}</p>
                          <p className="text-gray-600 text-xs line-through">Market: ${listing.marketValue}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${isDeal ? 'text-emerald-400' : 'text-white'}`}>
                            ${listing.listPrice}
                          </p>
                        </div>
                      </div>

                      {/* Buy button */}
                      <button
                        onClick={() => handleBuy(listing)}
                        disabled={isBuying || cantAfford}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                          isBuying
                            ? 'bg-emerald-800 text-emerald-300 cursor-wait'
                            : cantAfford
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isBuying ? 'Purchasing...' : cantAfford ? 'Insufficient Balance' : `Buy for $${listing.listPrice}`}
                      </button>

                      {listing.card.rookie && (
                        <div className="mt-2 text-center">
                          <span className="text-xs bg-amber-950/40 border border-amber-800/40 text-amber-400 px-2 py-0.5 rounded-full">RC</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'sell' && (
        <div>
          <p className="text-gray-400 text-sm mb-6">
            List cards from your vault for sale on the marketplace. A 5% marketplace fee applies. Cards sell instantly to simulated buyers.
          </p>

          {vaultCards.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
              <p className="text-gray-500 text-lg mb-2">Your vault is empty</p>
              <p className="text-gray-600 text-sm mb-4">Open packs or buy from the marketplace to add cards.</p>
              <Link href="/packs" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                Visit Pack Store →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vaultCards.filter(vc => !listed.has(vc.slug)).map(vc => {
                const card = sportsCards.find(c => c.slug === vc.slug);
                if (!card) return null;
                const mv = parseValue(card.estimatedValueRaw);
                const price = sellPrice[vc.slug] ?? mv;
                const fee = Math.round(price * 0.05);

                return (
                  <div key={vc.slug + vc.acquiredAt} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-lg shrink-0">
                      {card.sport === 'baseball' ? '⚾' : card.sport === 'basketball' ? '🏀' : card.sport === 'football' ? '🏈' : '🏒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{card.player}</p>
                      <p className="text-gray-500 text-xs">{card.set} · Market: ${mv}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">$</span>
                      <input
                        type="number"
                        value={price}
                        onChange={e => setSellPrice(prev => ({ ...prev, [vc.slug]: Math.max(1, parseInt(e.target.value) || 0) }))}
                        className="w-20 bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1.5 text-sm text-center focus:border-emerald-500 focus:outline-none"
                      />
                      <span className="text-gray-600 text-xs whitespace-nowrap">-${fee} fee</span>
                    </div>
                    <button
                      onClick={() => handleList(vc)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Sell (${price - fee})
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Related links */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pack Store', href: '/packs', icon: '📦' },
          { label: 'My Vault', href: '/vault', icon: '🏦' },
          { label: 'Trade Hub', href: '/trade-hub', icon: '🤝' },
          { label: 'Auction House', href: '/auction', icon: '🔨' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 hover:border-emerald-700/50 rounded-xl p-4 text-center transition-all group">
            <span className="text-2xl block mb-1">{link.icon}</span>
            <span className="text-gray-400 text-sm group-hover:text-emerald-400 transition-colors">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
