'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// --- Helpers ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function encodeGift(data: { theme: string; from: string; message: string; cardSlugs: string[] }): string {
  return btoa(JSON.stringify(data));
}

function decodeGift(hash: string): { theme: string; from: string; message: string; cardSlugs: string[] } | null {
  try {
    return JSON.parse(atob(hash));
  } catch {
    return null;
  }
}

const THEMES = [
  { id: 'birthday', label: 'Birthday', emoji: '🎂', gradient: 'from-pink-600 to-purple-600', border: 'border-pink-500/50' },
  { id: 'holiday', label: 'Holiday', emoji: '🎄', gradient: 'from-red-600 to-green-600', border: 'border-red-500/50' },
  { id: 'congrats', label: 'Congrats', emoji: '🎉', gradient: 'from-amber-500 to-yellow-500', border: 'border-amber-500/50' },
  { id: 'thankyou', label: 'Thank You', emoji: '💝', gradient: 'from-rose-500 to-pink-500', border: 'border-rose-500/50' },
  { id: 'welcome', label: 'Welcome', emoji: '👋', gradient: 'from-blue-500 to-cyan-500', border: 'border-blue-500/50' },
  { id: 'random', label: 'Surprise', emoji: '🎲', gradient: 'from-emerald-500 to-teal-500', border: 'border-emerald-500/50' },
];

const PACK_SIZES = [
  { count: 3, label: '3 Cards', desc: 'Quick gift' },
  { count: 5, label: '5 Cards', desc: 'Standard pack' },
  { count: 7, label: '7 Cards', desc: 'Deluxe gift' },
];

type Mode = 'create' | 'receive';

export default function GiftPackClient() {
  const [mode, setMode] = useState<Mode>('create');
  const [giftData, setGiftData] = useState<{ theme: string; from: string; message: string; cardSlugs: string[] } | null>(null);

  // Create mode state
  const [selectedTheme, setSelectedTheme] = useState('birthday');
  const [packSize, setPackSize] = useState(5);
  const [fromName, setFromName] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState<'random' | 'curate'>('random');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [curatedSlugs, setCuratedSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Receive mode state
  const [revealIndex, setRevealIndex] = useState(-1);
  const [allRevealed, setAllRevealed] = useState(false);
  const [addedToBinder, setAddedToBinder] = useState(false);

  // Check URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeGift(hash);
      if (decoded) {
        setGiftData(decoded);
        setMode('receive');
      }
    }
  }, []);

  // Random card selection
  const randomCards = useMemo(() => {
    const seed = Date.now();
    const rng = seededRng(seed);
    const filtered = sportFilter === 'all' ? sportsCards : sportsCards.filter(c => c.sport === sportFilter);
    const shuffled = [...filtered].sort(() => rng() - 0.5);
    return shuffled.slice(0, packSize);
  }, [sportFilter, packSize]);

  // Search for curate mode
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return sportsCards
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 10);
  }, [searchQuery]);

  const createGift = () => {
    const slugs = method === 'random' ? randomCards.map(c => c.slug) : curatedSlugs;
    if (slugs.length === 0) return;
    const data = {
      theme: selectedTheme,
      from: fromName || 'A Fellow Collector',
      message: message || 'Here are some cards for you!',
      cardSlugs: slugs,
    };
    const encoded = encodeGift(data);
    const url = `${window.location.origin}/gift-pack#${encoded}`;
    setShareUrl(url);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revealNext = () => {
    if (giftData && revealIndex < giftData.cardSlugs.length - 1) {
      setRevealIndex(i => i + 1);
    }
  };

  const revealAll = () => {
    if (giftData) {
      setRevealIndex(giftData.cardSlugs.length - 1);
      setAllRevealed(true);
    }
  };

  const addAllToBinder = () => {
    if (!giftData) return;
    const existing = JSON.parse(localStorage.getItem('cardvault-binder') || '[]');
    const newCards = giftData.cardSlugs.filter(s => !existing.includes(s));
    localStorage.setItem('cardvault-binder', JSON.stringify([...existing, ...newCards]));
    setAddedToBinder(true);
  };

  const addToCurated = (slug: string) => {
    if (!curatedSlugs.includes(slug) && curatedSlugs.length < packSize) {
      setCuratedSlugs(prev => [...prev, slug]);
    }
  };

  const removeFromCurated = (slug: string) => {
    setCuratedSlugs(prev => prev.filter(s => s !== slug));
  };

  // --- Receive Mode ---
  if (mode === 'receive' && giftData) {
    const theme = THEMES.find(t => t.id === giftData.theme) || THEMES[0];
    const giftCards = giftData.cardSlugs
      .map(slug => sportsCards.find(c => c.slug === slug))
      .filter((c): c is SportsCard => !!c);

    return (
      <div className="space-y-8">
        {/* Gift Banner */}
        <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-center`}>
          <p className="text-5xl mb-4">{theme.emoji}</p>
          <h2 className="text-2xl font-black text-white mb-2">You Got a Gift Pack!</h2>
          <p className="text-white/80 text-sm">From: <strong>{giftData.from}</strong></p>
          <p className="text-white/90 mt-2 text-base italic">&ldquo;{giftData.message}&rdquo;</p>
          <p className="text-white/60 text-xs mt-3">{giftCards.length} cards inside</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={revealNext}
            disabled={revealIndex >= giftCards.length - 1}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 transition-all"
          >
            {revealIndex === -1 ? 'Open Gift' : `Reveal Card ${revealIndex + 2}/${giftCards.length}`}
          </button>
          {!allRevealed && (
            <button onClick={revealAll} className="px-5 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-all">
              Reveal All
            </button>
          )}
        </div>

        {/* Card Reveal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {giftCards.map((card, idx) => {
            const revealed = idx <= revealIndex;
            return (
              <div
                key={card.slug}
                className={`border rounded-xl overflow-hidden transition-all duration-700 ${
                  revealed
                    ? `bg-gray-900/80 border-gray-700/50 ${idx === revealIndex ? 'ring-2 ring-emerald-500/50 scale-[1.02]' : ''}`
                    : 'bg-gray-900/20 border-gray-800/30'
                }`}
              >
                {revealed ? (
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        card.sport === 'baseball' ? 'bg-red-900/50 text-red-400' :
                        card.sport === 'basketball' ? 'bg-orange-900/50 text-orange-400' :
                        card.sport === 'football' ? 'bg-green-900/50 text-green-400' :
                        'bg-blue-900/50 text-blue-400'
                      }`}>
                        {card.sport}
                      </span>
                      {card.rookie && <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded-full font-semibold">RC</span>}
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1 truncate">{card.player}</h3>
                    <p className="text-gray-400 text-xs mb-2">{card.set} #{card.cardNumber}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 text-xs font-semibold">{card.estimatedValueGem}</span>
                      <Link href={`/sports/${card.slug}`} className="text-gray-500 text-xs hover:text-emerald-400 transition-colors">
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 flex items-center justify-center h-32">
                    <div className="text-center">
                      <p className="text-3xl mb-1">{theme.emoji}</p>
                      <p className="text-gray-600 text-xs">Card {idx + 1}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add to Binder */}
        {revealIndex >= giftCards.length - 1 && (
          <div className="text-center space-y-3">
            {!addedToBinder ? (
              <button onClick={addAllToBinder} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all">
                Add All to My Binder
              </button>
            ) : (
              <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-xl p-4 inline-block">
                <p className="text-emerald-400 font-semibold">Added {giftCards.length} cards to your binder!</p>
                <Link href="/binder" className="text-emerald-300 text-sm hover:underline mt-1 inline-block">View Binder &rarr;</Link>
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button onClick={() => { setMode('create'); window.location.hash = ''; }} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
                Create Your Own Gift
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Create Mode ---
  return (
    <div className="space-y-8">
      {/* Step 1: Pick Theme */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">1. Pick a Theme</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`p-3 rounded-xl text-center transition-all ${
                selectedTheme === theme.id
                  ? `bg-gradient-to-br ${theme.gradient} ring-2 ring-white/20 scale-105`
                  : 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/30'
              }`}
            >
              <span className="text-2xl block mb-1">{theme.emoji}</span>
              <span className="text-xs text-white font-medium">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Pack Size */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">2. Choose Pack Size</h2>
        <div className="flex gap-3">
          {PACK_SIZES.map(ps => (
            <button
              key={ps.count}
              onClick={() => { setPackSize(ps.count); setCuratedSlugs([]); }}
              className={`flex-1 p-3 rounded-xl text-center transition-all ${
                packSize === ps.count
                  ? 'bg-emerald-900/50 border-2 border-emerald-500/50'
                  : 'bg-gray-800/50 border border-gray-700/30 hover:bg-gray-800'
              }`}
            >
              <span className="text-white font-bold text-lg block">{ps.count}</span>
              <span className="text-gray-400 text-xs">{ps.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Card Selection */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">3. Select Cards</h2>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setMethod('random')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              method === 'random' ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Random
          </button>
          <button
            onClick={() => setMethod('curate')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              method === 'curate' ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Hand-Pick
          </button>
        </div>

        {method === 'random' && (
          <div>
            <div className="flex gap-2 mb-3">
              {['all', 'baseball', 'basketball', 'football', 'hockey'].map(sport => (
                <button
                  key={sport}
                  onClick={() => setSportFilter(sport)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    sportFilter === sport ? 'bg-gray-700 text-white' : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {sport === 'all' ? 'All Sports' : sport.charAt(0).toUpperCase() + sport.slice(1)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {randomCards.map(card => (
                <div key={card.slug} className="bg-gray-900/50 border border-gray-800/30 rounded-lg p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{card.player}</p>
                    <p className="text-gray-500 text-xs truncate">{card.set} #{card.cardNumber}</p>
                  </div>
                  <span className="text-emerald-400 text-xs font-semibold flex-shrink-0 ml-2">{card.estimatedValueGem}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {method === 'curate' && (
          <div>
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for cards to add..."
                className="w-full bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="bg-gray-900/80 border border-gray-800/50 rounded-xl mb-3 max-h-48 overflow-y-auto">
                {searchResults.map(card => (
                  <button
                    key={card.slug}
                    onClick={() => addToCurated(card.slug)}
                    disabled={curatedSlugs.includes(card.slug) || curatedSlugs.length >= packSize}
                    className="w-full text-left px-3 py-2 hover:bg-gray-800/50 transition-colors disabled:opacity-40 flex items-center justify-between border-b border-gray-800/30 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{card.player} — {card.set}</p>
                      <p className="text-gray-500 text-xs">{card.sport} &middot; {card.estimatedValueGem}</p>
                    </div>
                    {curatedSlugs.includes(card.slug) ? (
                      <span className="text-emerald-400 text-xs">Added</span>
                    ) : (
                      <span className="text-gray-500 text-xs">+ Add</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <p className="text-gray-500 text-xs mb-2">{curatedSlugs.length}/{packSize} cards selected</p>
            <div className="space-y-2">
              {curatedSlugs.map(slug => {
                const card = sportsCards.find(c => c.slug === slug);
                if (!card) return null;
                return (
                  <div key={slug} className="bg-gray-900/50 border border-gray-800/30 rounded-lg p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{card.player}</p>
                      <p className="text-gray-500 text-xs truncate">{card.set}</p>
                    </div>
                    <button onClick={() => removeFromCurated(slug)} className="text-red-400 text-xs hover:text-red-300 flex-shrink-0 ml-2">Remove</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Personalize */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">4. Personalize</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={fromName}
            onChange={e => setFromName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={30}
            className="w-full bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
          />
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a message (optional)"
            maxLength={150}
            rows={2}
            className="w-full bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
          />
        </div>
      </div>

      {/* Step 5: Generate & Share */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">5. Create & Share</h2>
        {!shareUrl ? (
          <button
            onClick={createGift}
            disabled={method === 'curate' && curatedSlugs.length === 0}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 transition-all"
          >
            Create Gift Pack
          </button>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800/30 rounded-xl p-4 space-y-3">
            <p className="text-emerald-400 font-semibold text-sm">Gift Pack created! Share this link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-gray-800/50 border border-gray-700/30 rounded-lg px-3 py-2 text-gray-300 text-xs font-mono"
              />
              <button onClick={copyUrl} className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I made you a gift pack of sports cards on CardVault! Open it here: ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Share on X
              </a>
              <button
                onClick={() => { setShareUrl(''); setCuratedSlugs([]); setMethod('random'); setFromName(''); setMessage(''); }}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
