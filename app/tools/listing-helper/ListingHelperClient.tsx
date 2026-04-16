'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ────────────────────────── Helpers ────────────────────────── */

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function fmt(n: number): string {
  return `$${n.toFixed(2)}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ────────────────────────── Types ────────────────────────── */

type ConditionType =
  | 'Raw'
  | 'PSA 1' | 'PSA 2' | 'PSA 3' | 'PSA 4' | 'PSA 5' | 'PSA 6' | 'PSA 7' | 'PSA 8' | 'PSA 9' | 'PSA 10'
  | 'BGS 1' | 'BGS 2' | 'BGS 3' | 'BGS 4' | 'BGS 5' | 'BGS 6' | 'BGS 7' | 'BGS 8' | 'BGS 8.5' | 'BGS 9' | 'BGS 9.5' | 'BGS 10'
  | 'CGC 1' | 'CGC 2' | 'CGC 3' | 'CGC 4' | 'CGC 5' | 'CGC 6' | 'CGC 7' | 'CGC 8' | 'CGC 8.5' | 'CGC 9' | 'CGC 9.5' | 'CGC 10'
  | 'SGC 1' | 'SGC 2' | 'SGC 3' | 'SGC 4' | 'SGC 5' | 'SGC 6' | 'SGC 7' | 'SGC 8' | 'SGC 8.5' | 'SGC 9' | 'SGC 9.5' | 'SGC 10';

interface SavedListing {
  id: string;
  title: string;
  player: string;
  timestamp: number;
}

interface CardInput {
  playerSearch: string;
  selectedPlayer: string;
  selectedCardSlug: string;
  setName: string;
  year: string;
  cardNumber: string;
  condition: ConditionType;
  sport: string;
  estimatedValue: number;
  estimatedValueGem: number;
}

const CONDITIONS: ConditionType[] = [
  'Raw',
  'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'PSA 6', 'PSA 5', 'PSA 4', 'PSA 3', 'PSA 2', 'PSA 1',
  'BGS 10', 'BGS 9.5', 'BGS 9', 'BGS 8.5', 'BGS 8', 'BGS 7', 'BGS 6', 'BGS 5', 'BGS 4', 'BGS 3', 'BGS 2', 'BGS 1',
  'CGC 10', 'CGC 9.5', 'CGC 9', 'CGC 8.5', 'CGC 8', 'CGC 7', 'CGC 6', 'CGC 5', 'CGC 4', 'CGC 3', 'CGC 2', 'CGC 1',
  'SGC 10', 'SGC 9.5', 'SGC 9', 'SGC 8.5', 'SGC 8', 'SGC 7', 'SGC 6', 'SGC 5', 'SGC 4', 'SGC 3', 'SGC 2', 'SGC 1',
];

const SPORTS = ['baseball', 'basketball', 'football', 'hockey'];

const SPORT_CATEGORIES: Record<string, string> = {
  baseball: '213',
  basketball: '214',
  football: '215',
  hockey: '216',
};

const LS_KEY = 'listing-helper-saved';

function getUniquePlayers(): string[] {
  const set = new Set<string>();
  for (const c of sportsCards) set.add(c.player);
  return Array.from(set).sort();
}

const ALL_PLAYERS = getUniquePlayers();

function isGraded(cond: ConditionType): boolean {
  return cond !== 'Raw';
}

function getGradingCompany(cond: ConditionType): string | null {
  if (cond === 'Raw') return null;
  return cond.split(' ')[0];
}

function getGradeNumber(cond: ConditionType): string | null {
  if (cond === 'Raw') return null;
  return cond.split(' ')[1];
}

/* ────────────────────────── Default State ────────────────────────── */

const defaultInput: CardInput = {
  playerSearch: '',
  selectedPlayer: '',
  selectedCardSlug: '',
  setName: '',
  year: '',
  cardNumber: '',
  condition: 'Raw',
  sport: 'baseball',
  estimatedValue: 0,
  estimatedValueGem: 0,
};

/* ────────────────────────── Component ────────────────────────── */

export default function ListingHelperClient() {
  const [input, setInput] = useState<CardInput>(defaultInput);
  const [showDropdown, setShowDropdown] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load saved listings from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSavedListings(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Close autocomplete when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* ── Player autocomplete ── */
  const playerMatches = useMemo(() => {
    const q = input.playerSearch.toLowerCase().trim();
    if (q.length < 2) return [];
    return ALL_PLAYERS.filter(p => p.toLowerCase().includes(q)).slice(0, 8);
  }, [input.playerSearch]);

  /* ── Cards for selected player ── */
  const playerCards = useMemo(() => {
    if (!input.selectedPlayer) return [];
    return sportsCards.filter(c => c.player === input.selectedPlayer);
  }, [input.selectedPlayer]);

  /* ── Selected card object ── */
  const selectedCard = useMemo(() => {
    if (!input.selectedCardSlug) return null;
    return sportsCards.find(c => c.slug === input.selectedCardSlug) || null;
  }, [input.selectedCardSlug]);

  /* ── Update helpers ── */
  const updateField = useCallback(<K extends keyof CardInput>(field: K, value: CardInput[K]) => {
    setInput(prev => ({ ...prev, [field]: value }));
    setGenerated(false);
  }, []);

  const selectPlayer = useCallback((player: string) => {
    const cards = sportsCards.filter(c => c.player === player);
    const firstCard = cards[0];
    setInput(prev => ({
      ...prev,
      playerSearch: player,
      selectedPlayer: player,
      selectedCardSlug: firstCard?.slug || '',
      setName: firstCard?.set || '',
      year: firstCard ? String(firstCard.year) : '',
      cardNumber: firstCard?.cardNumber || '',
      sport: firstCard?.sport || prev.sport,
      estimatedValue: firstCard ? parseValue(firstCard.estimatedValueRaw) : 0,
      estimatedValueGem: firstCard ? parseValue(firstCard.estimatedValueGem) : 0,
    }));
    setShowDropdown(false);
    setGenerated(false);
  }, []);

  const selectCard = useCallback((slug: string) => {
    const card = sportsCards.find(c => c.slug === slug);
    if (!card) return;
    setInput(prev => ({
      ...prev,
      selectedCardSlug: slug,
      setName: card.set,
      year: String(card.year),
      cardNumber: card.cardNumber,
      sport: card.sport,
      estimatedValue: parseValue(card.estimatedValueRaw),
      estimatedValueGem: parseValue(card.estimatedValueGem),
    }));
    setGenerated(false);
  }, []);

  /* ── Copy to clipboard ── */
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  /* ── Listing Generation Logic ── */
  const graded = isGraded(input.condition);
  const gradingCo = getGradingCompany(input.condition);
  const gradeNum = getGradeNumber(input.condition);
  const isRookie = selectedCard?.rookie ?? false;

  // Title
  const listingTitle = useMemo(() => {
    const parts: string[] = [];
    if (input.year) parts.push(input.year);
    if (input.setName) parts.push(input.setName);
    if (input.selectedPlayer) parts.push(input.selectedPlayer);
    if (input.cardNumber) parts.push(`#${input.cardNumber}`);
    if (isRookie) parts.push('RC');
    if (graded && gradingCo && gradeNum) {
      parts.push(`${gradingCo} ${gradeNum}`);
    }
    parts.push(`${capitalize(input.sport)} Card`);
    let title = parts.join(' ');
    if (title.length > 80) title = title.slice(0, 77) + '...';
    return title;
  }, [input.year, input.setName, input.selectedPlayer, input.cardNumber, isRookie, graded, gradingCo, gradeNum, input.sport]);

  const titleLen = listingTitle.length;
  const titleColor = titleLen <= 70 ? 'bg-emerald-500' : titleLen <= 80 ? 'bg-yellow-500' : 'bg-red-500';
  const titleBarWidth = Math.min((titleLen / 80) * 100, 100);

  // Description
  const listingDescription = useMemo(() => {
    const lines: string[] = [];
    lines.push('===== CARD DETAILS =====');
    if (input.selectedPlayer) lines.push(`Player: ${input.selectedPlayer}`);
    if (input.year) lines.push(`Year: ${input.year}`);
    if (input.setName) lines.push(`Set: ${input.setName}`);
    if (input.cardNumber) lines.push(`Card Number: #${input.cardNumber}`);
    lines.push(`Sport: ${capitalize(input.sport)}`);
    if (isRookie) lines.push('Rookie Card: Yes');
    lines.push('');

    lines.push('===== CONDITION / GRADE =====');
    if (graded && gradingCo && gradeNum) {
      lines.push(`Grade: ${gradingCo} ${gradeNum}`);
      lines.push(`Graded by ${gradingCo} -- authenticity guaranteed`);
      lines.push('Card is encased in a tamper-evident holder/slab.');
    } else {
      lines.push('Condition: Raw / Ungraded');
      lines.push('Card stored in penny sleeve + top loader.');
      lines.push('Please review photos for exact condition.');
    }
    lines.push('');

    // Key selling points from description
    if (selectedCard?.description) {
      lines.push('===== HIGHLIGHTS =====');
      // Split description into sentences for bullet points
      const sentences = selectedCard.description
        .split(/\.\s+/)
        .map(s => s.replace(/\.$/, '').trim())
        .filter(s => s.length > 10);
      sentences.forEach(s => lines.push(`- ${s}`));
      lines.push('');
    }

    lines.push('===== SHIPPING =====');
    if (graded) {
      lines.push('- Graded slab shipped in a padded bubble mailer or small box');
      lines.push('- Slab wrapped in bubble wrap for maximum protection');
    } else {
      lines.push('- Card ships in penny sleeve + top loader + team bag');
      lines.push('- PWE (Plain White Envelope) or BMWT (Bubble Mailer With Tracking)');
    }
    lines.push('- Tracking included on all BMWT shipments');
    lines.push('- Combined shipping available for multiple purchases');
    lines.push('- Ships within 1 business day of payment');
    lines.push('');

    lines.push('===== RETURN POLICY =====');
    lines.push('- 30-day returns accepted, buyer pays return shipping');
    lines.push('- Card must be returned in original condition');
    lines.push('- Refund issued within 2 business days of receiving return');
    lines.push('');

    if (graded && gradingCo) {
      lines.push(`Graded by ${gradingCo} -- authenticity guaranteed.`);
      lines.push('');
    }

    lines.push('Thank you for looking! Check out my other listings for more cards.');
    return lines.join('\n');
  }, [input, graded, gradingCo, gradeNum, selectedCard, isRookie]);

  // Pricing
  const pricing = useMemo(() => {
    const rawVal = input.estimatedValue;
    const gemVal = input.estimatedValueGem;
    const baseValue = graded ? gemVal : rawVal;
    if (baseValue <= 0) return null;

    // Auction start: -20% of raw value
    const auctionStart = Math.max(rawVal * 0.8, 0.99);
    // BIN price: gem mint value (or raw if not graded)
    const binPrice = graded ? gemVal : Math.max(rawVal * 1.1, rawVal + 5);

    // eBay fee: 13.25% FVF + $0.30 payment processing
    const auctionFees = auctionStart * 0.1325 + 0.30;
    const binFees = binPrice * 0.1325 + 0.30;

    const auctionNet = auctionStart - auctionFees;
    const binNet = binPrice - binFees;

    return {
      auctionStart,
      binPrice,
      auctionFees,
      binFees,
      auctionNet,
      binNet,
      rawVal,
      gemVal,
    };
  }, [input.estimatedValue, input.estimatedValueGem, graded]);

  // Comparable sales
  const comparables = useMemo(() => {
    if (!input.selectedPlayer) return [];
    return sportsCards
      .filter(c => c.player === input.selectedPlayer && c.slug !== input.selectedCardSlug)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        set: c.set,
        year: c.year,
        rawValue: parseValue(c.estimatedValueRaw),
        gemValue: parseValue(c.estimatedValueGem),
        rookie: c.rookie,
        slug: c.slug,
      }));
  }, [input.selectedPlayer, input.selectedCardSlug]);

  /* ── Generate handler ── */
  const handleGenerate = useCallback(() => {
    setGenerated(true);

    // Save to recent listings
    const listing: SavedListing = {
      id: Date.now().toString(),
      title: listingTitle,
      player: input.selectedPlayer,
      timestamp: Date.now(),
    };
    setSavedListings(prev => {
      const updated = [listing, ...prev].slice(0, 5);
      try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, [listingTitle, input.selectedPlayer]);

  /* ── Can generate? ── */
  const canGenerate = input.selectedPlayer && input.setName && input.year;

  /* ── Copy button helper ── */
  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(text, label)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
    >
      {copied === label ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          Copy
        </>
      )}
    </button>
  );

  /* ────────────────────────── Render ────────────────────────── */

  return (
    <div className="space-y-8">
      {/* ─── Step 1: Card Input ─── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
          <h3 className="text-lg font-semibold text-white">Card Details</h3>
        </div>
        <p className="text-gray-500 text-sm mb-6 ml-10">Search for a player, select the card, then adjust details as needed.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Player Name with Autocomplete */}
          <div className="relative sm:col-span-2 lg:col-span-1" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-300 mb-1">Player Name *</label>
            <input
              type="text"
              value={input.playerSearch}
              onChange={e => {
                updateField('playerSearch', e.target.value);
                setShowDropdown(true);
                if (e.target.value !== input.selectedPlayer) {
                  setInput(prev => ({
                    ...prev,
                    playerSearch: e.target.value,
                    selectedPlayer: '',
                    selectedCardSlug: '',
                  }));
                }
              }}
              onFocus={() => { if (playerMatches.length > 0) setShowDropdown(true); }}
              placeholder="e.g. Mike Trout"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showDropdown && playerMatches.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-56 overflow-y-auto">
                {playerMatches.map(p => (
                  <button
                    key={p}
                    onClick={() => selectPlayer(p)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-blue-600/30 hover:text-white transition-colors"
                  >
                    {p}
                    <span className="text-gray-500 ml-2 text-xs">
                      ({sportsCards.filter(c => c.player === p).length} cards)
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card Selection */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Select Card</label>
            <select
              value={input.selectedCardSlug}
              onChange={e => selectCard(e.target.value)}
              disabled={playerCards.length === 0}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {playerCards.length === 0 ? (
                <option value="">-- Select a player first --</option>
              ) : (
                playerCards.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {c.year} {c.set} #{c.cardNumber}{c.rookie ? ' (RC)' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Set Name (manual override) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Set Name</label>
            <input
              type="text"
              value={input.setName}
              onChange={e => updateField('setName', e.target.value)}
              placeholder="e.g. Topps Chrome"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
            <input
              type="text"
              value={input.year}
              onChange={e => updateField('year', e.target.value)}
              placeholder="e.g. 2024"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
            <input
              type="text"
              value={input.cardNumber}
              onChange={e => updateField('cardNumber', e.target.value)}
              placeholder="e.g. 150"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Condition / Grade</label>
            <select
              value={input.condition}
              onChange={e => updateField('condition', e.target.value as ConditionType)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sport</label>
            <select
              value={input.sport}
              onChange={e => updateField('sport', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              {SPORTS.map(s => (
                <option key={s} value={s}>{capitalize(s)}</option>
              ))}
            </select>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Est. Value Raw ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={input.estimatedValue || ''}
              onChange={e => updateField('estimatedValue', parseFloat(e.target.value) || 0)}
              placeholder="Auto-filled from DB"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Generate Listing
          </button>
          {!canGenerate && (
            <span className="text-sm text-gray-500">Fill in player, set, and year to generate.</span>
          )}
        </div>
      </div>

      {/* ─── Step 2: Generated Listing ─── */}
      {generated && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold">2</span>
            <h3 className="text-lg font-semibold text-white">Your eBay Listing</h3>
          </div>

          {/* A. Optimized Title */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Optimized Title</h4>
              <CopyButton text={listingTitle} label="title" />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm break-all">
              {listingTitle}
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>{titleLen} / 80 characters</span>
                <span className={titleLen <= 70 ? 'text-emerald-400' : titleLen <= 80 ? 'text-yellow-400' : 'text-red-400'}>
                  {titleLen <= 70 ? 'Good length' : titleLen <= 80 ? 'Near limit' : 'Over limit!'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${titleColor}`}
                  style={{ width: `${titleBarWidth}%` }}
                />
              </div>
            </div>
          </div>

          {/* B. Description Template */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">Description Template</h4>
              <CopyButton text={listingDescription} label="description" />
            </div>
            <pre className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">
              {listingDescription}
            </pre>
          </div>

          {/* C. Pricing Recommendation */}
          {pricing && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-4">Pricing Recommendation</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Auction Scenario */}
                <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-3">Auction Start</div>
                  <div className="text-3xl font-bold text-white mb-1">{fmt(pricing.auctionStart)}</div>
                  <div className="text-xs text-gray-500 mb-4">Based on {fmt(pricing.rawVal)} raw value (-20%)</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>eBay FVF (13.25%)</span>
                      <span className="text-red-400">-{fmt(pricing.auctionStart * 0.1325)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Payment processing</span>
                      <span className="text-red-400">-$0.30</span>
                    </div>
                    <div className="flex justify-between text-gray-400 border-t border-gray-700 pt-2">
                      <span>Total eBay fees</span>
                      <span className="text-red-400">-{fmt(pricing.auctionFees)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-white border-t border-gray-700 pt-2">
                      <span>Net to you</span>
                      <span className={pricing.auctionNet >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {fmt(pricing.auctionNet)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BIN Scenario */}
                <div className="bg-gray-800/60 border border-emerald-800/40 rounded-xl p-5">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-3">Buy It Now</div>
                  <div className="text-3xl font-bold text-white mb-1">{fmt(pricing.binPrice)}</div>
                  <div className="text-xs text-gray-500 mb-4">
                    {graded ? 'Based on gem mint estimated value' : 'Raw value + 10% premium for BIN convenience'}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-400">
                      <span>eBay FVF (13.25%)</span>
                      <span className="text-red-400">-{fmt(pricing.binPrice * 0.1325)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Payment processing</span>
                      <span className="text-red-400">-$0.30</span>
                    </div>
                    <div className="flex justify-between text-gray-400 border-t border-gray-700 pt-2">
                      <span>Total eBay fees</span>
                      <span className="text-red-400">-{fmt(pricing.binFees)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-white border-t border-gray-700 pt-2">
                      <span>Net to you</span>
                      <span className={pricing.binNet >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {fmt(pricing.binNet)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4">
                <div className="text-sm font-semibold text-blue-300 mb-1">Recommendation</div>
                <p className="text-sm text-gray-300">
                  {pricing.binPrice > pricing.auctionStart * 3
                    ? `List as Buy It Now at ${fmt(pricing.binPrice)} with Best Offer enabled. The BIN premium is significant enough to skip auction risk.`
                    : pricing.rawVal < 25
                    ? `Start auction at ${fmt(pricing.auctionStart)} -- low-value cards sell faster at auction with competitive starting prices.`
                    : `Start auction at ${fmt(pricing.auctionStart)} or list Buy It Now at ${fmt(pricing.binPrice)}. BIN + Best Offer gives you price control; auction creates urgency.`}
                </p>
              </div>
            </div>
          )}

          {!pricing && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-2">Pricing Recommendation</h4>
              <p className="text-sm text-gray-500">
                No estimated value available for this card. Enter a value in the &quot;Est. Value Raw&quot; field above to generate pricing recommendations.
              </p>
            </div>
          )}

          {/* D. Listing Settings Recommendations */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
            <h4 className="font-semibold text-white mb-4">Listing Settings</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Category</div>
                <div className="text-sm text-white">Sports Trading Cards</div>
                <div className="text-xs text-gray-500">eBay Category {SPORT_CATEGORIES[input.sport] || '213'} ({capitalize(input.sport)})</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Duration</div>
                <div className="text-sm text-white">
                  {pricing && pricing.binPrice > pricing.auctionStart * 3
                    ? 'Good Til Cancelled (BIN)'
                    : '7-Day Auction or Good Til Cancelled BIN'}
                </div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Shipping</div>
                <div className="text-sm text-white">
                  {graded
                    ? 'Flat rate $5.50 BMWT (bubble mailer with tracking)'
                    : '$4.50 PWE / $5.50 BMWT'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Or offer free shipping and build cost into price</div>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Returns</div>
                <div className="text-sm text-white">30-day, buyer pays return shipping</div>
                <div className="text-xs text-gray-500 mt-1">Improves search ranking and buyer confidence</div>
              </div>
            </div>

            {/* Best Practices Checklist */}
            <div>
              <h5 className="text-sm font-semibold text-gray-300 mb-3">Best Practices Checklist</h5>
              <div className="space-y-2">
                {[
                  'Take clear, well-lit photos of front, back, and all 4 corners',
                  'Fill out all Item Specifics (year, set, player, team, card number)',
                  graded
                    ? 'Include a photo of the grade label and cert number'
                    : 'Mention if the card is "pack fresh" or recently pulled',
                  'List on Sunday evening (6-9 PM EST) for maximum auction visibility',
                  'Enable Best Offer on BIN listings to attract negotiators',
                  'Use Promoted Listings Standard (2-5%) for faster sales',
                  'Add the card to relevant eBay categories and use all 80 title characters',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2} /></svg>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* E. Comparable Sales */}
          {comparables.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
              <h4 className="font-semibold text-white mb-4">Comparable Cards ({input.selectedPlayer})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-800">
                      <th className="pb-2 pr-4">Card</th>
                      <th className="pb-2 pr-4 text-right">Raw Value</th>
                      <th className="pb-2 text-right">Gem Mint Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparables.map(c => (
                      <tr key={c.slug} className="border-b border-gray-800/50">
                        <td className="py-2.5 pr-4 text-gray-300">
                          {c.year} {c.set}
                          {c.rookie && <span className="ml-1.5 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">RC</span>}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-gray-300 font-mono">{c.rawValue > 0 ? fmt(c.rawValue) : '--'}</td>
                        <td className="py-2.5 text-right text-gray-300 font-mono">{c.gemValue > 0 ? fmt(c.gemValue) : '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Values from CardVault database for pricing context. Check recent eBay sold listings for current market data.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Saved Listings ─── */}
      {savedListings.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h4 className="font-semibold text-white mb-3">Recent Listings</h4>
          <div className="space-y-2">
            {savedListings.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5">
                <div>
                  <div className="text-sm text-white truncate max-w-xs sm:max-w-md">{s.title}</div>
                  <div className="text-xs text-gray-500">{new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString()}</div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-3">{s.player}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Listing Tips Guide ─── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h4 className="font-semibold text-white mb-4">How to Write Great Card Listings</h4>
        <div className="space-y-4">
          {[
            {
              title: '1. Use All 80 Title Characters',
              body: 'eBay search favors titles that match buyer queries. Include year, set, player name, card number, condition/grade, and sport. Every character is valuable real estate for search visibility.',
            },
            {
              title: '2. Lead with Your Best Photo',
              body: 'The first image is your thumbnail in search results. Use natural or diffused lighting, a clean background, and shoot the card straight-on. For graded cards, angle slightly to avoid slab glare.',
            },
            {
              title: '3. Price Based on Recent Sold Data',
              body: 'Check "Sold Items" on eBay for the most accurate comps. Filter by condition/grade. Price 5-10% below the highest recent sale for a fast BIN, or start auctions at 60-80% of market value.',
            },
            {
              title: '4. Fill Out Every Item Specific',
              body: 'eBay filters rely on Item Specifics (year, set, team, player, card number, grade). Listings with complete specifics get up to 20% more views because buyers use these filters to narrow searches.',
            },
            {
              title: '5. Time Your Listings Strategically',
              body: 'Sunday evenings (6-9 PM EST) have the most active buyers. For 7-day auctions, list on Sunday night so the auction ends the following Sunday during peak hours. Avoid ending on weekday mornings.',
            },
            {
              title: '6. Offer Free Shipping When Possible',
              body: 'Free shipping increases sell-through rate by 20-30% and improves your Best Match ranking. Build the $4-5 shipping cost into your price. Buyers psychologically prefer "free" even if the total is the same.',
            },
            {
              title: '7. Be Transparent About Condition',
              body: 'For raw cards, describe any flaws (centering, corners, surface issues). Honesty prevents returns and builds your seller reputation. For graded cards, include the cert number so buyers can verify on the grading company website.',
            },
          ].map((tip, i) => (
            <div key={i}>
              <h5 className="text-sm font-semibold text-gray-200 mb-1">{tip.title}</h5>
              <p className="text-sm text-gray-400 leading-relaxed">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Related Tools ─── */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h4 className="font-semibold text-white mb-4">Related Tools</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Calculate profit margins on card flips' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator', desc: 'Find the cheapest shipping method' },
            { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator', desc: 'Break down eBay selling fees' },
            { href: '/tools/lot-evaluator', label: 'Lot Evaluator', desc: 'Evaluate card lot deals' },
            { href: '/tools/listing-generator', label: 'Listing Generator', desc: 'Generate title variants and hashtags' },
            { href: '/tools/break-roi', label: 'Break ROI', desc: 'Calculate box break returns' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800 hover:border-gray-600 transition-colors group"
            >
              <div className="text-sm font-medium text-blue-400 group-hover:text-blue-300">{link.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
