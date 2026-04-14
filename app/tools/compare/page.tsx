'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, SportsCard } from '@/data/sports-cards';

function parseValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10) || 0;
}

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

const sportColors: Record<string, string> = {
  baseball: 'border-red-800/40 bg-red-950/20',
  basketball: 'border-orange-800/40 bg-orange-950/20',
  football: 'border-blue-800/40 bg-blue-950/20',
  hockey: 'border-cyan-800/40 bg-cyan-950/20',
};

function CardSelector({ label, selected, onSelect, excludeSlug }: {
  label: string;
  selected: SportsCard | null;
  onSelect: (card: SportsCard) => void;
  excludeSlug?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => c.slug !== excludeSlug)
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, excludeSlug]);

  return (
    <div className="relative">
      <label className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1 block">{label}</label>
      {selected ? (
        <div className={`border rounded-xl p-4 ${sportColors[selected.sport]}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{selected.name}</p>
              <p className="text-gray-400 text-xs">{sportIcons[selected.sport]} {selected.player} &middot; {selected.set}</p>
            </div>
            <button onClick={() => { onSelect(null as unknown as SportsCard); setQuery(''); }} className="text-gray-500 hover:text-white text-xs">Change</button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search for a card..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
          />
          {open && results.length > 0 && (
            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-xl max-h-64 overflow-y-auto">
              {results.map(card => (
                <button
                  key={card.slug}
                  onClick={() => { onSelect(card); setOpen(false); setQuery(''); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800 border-b border-gray-800/50 last:border-0 transition-colors"
                >
                  <p className="text-white text-sm font-medium">{card.name}</p>
                  <p className="text-gray-500 text-xs">{sportIcons[card.sport]} {card.player} &middot; {card.estimatedValueRaw}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComparisonRow({ label, valueA, valueB, highlight }: { label: string; valueA: string; valueB: string; highlight?: 'a' | 'b' | 'equal' }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 border-b border-gray-800/50 last:border-0">
      <p className="text-gray-400 text-xs font-medium">{label}</p>
      <p className={`text-sm text-center ${highlight === 'a' ? 'text-emerald-400 font-semibold' : 'text-gray-300'}`}>{valueA}</p>
      <p className={`text-sm text-center ${highlight === 'b' ? 'text-emerald-400 font-semibold' : 'text-gray-300'}`}>{valueB}</p>
    </div>
  );
}

export default function ComparePage() {
  const [cardA, setCardA] = useState<SportsCard | null>(null);
  const [cardB, setCardB] = useState<SportsCard | null>(null);

  const comparison = useMemo(() => {
    if (!cardA || !cardB) return null;
    const rawA = parseValue(cardA.estimatedValueRaw);
    const rawB = parseValue(cardB.estimatedValueRaw);
    const gemA = parseValue(cardA.estimatedValueGem);
    const gemB = parseValue(cardB.estimatedValueGem);
    return { rawA, rawB, gemA, gemB };
  }, [cardA, cardB]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/tools" className="text-gray-500 hover:text-white text-xs mb-3 inline-block transition-colors">&larr; Back to Tools</Link>
        <h1 className="text-3xl font-bold text-white mb-2">Card Comparison Tool</h1>
        <p className="text-gray-400 text-sm">Compare any two sports cards side-by-side. Values, grades, investment metrics, and market context — all in one view.</p>
      </div>

      {/* Card selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <CardSelector label="Card A" selected={cardA} onSelect={setCardA} excludeSlug={cardB?.slug} />
        <CardSelector label="Card B" selected={cardB} onSelect={setCardB} excludeSlug={cardA?.slug} />
      </div>

      {/* Comparison table */}
      {cardA && cardB && comparison && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-3 pb-3 border-b border-gray-700 mb-2">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Metric</p>
            <p className="text-white text-xs font-bold text-center truncate">{cardA.name}</p>
            <p className="text-white text-xs font-bold text-center truncate">{cardB.name}</p>
          </div>

          <ComparisonRow label="Sport" valueA={`${sportIcons[cardA.sport]} ${cardA.sport.charAt(0).toUpperCase() + cardA.sport.slice(1)}`} valueB={`${sportIcons[cardB.sport]} ${cardB.sport.charAt(0).toUpperCase() + cardB.sport.slice(1)}`} />
          <ComparisonRow label="Player" valueA={cardA.player} valueB={cardB.player} />
          <ComparisonRow label="Year" valueA={String(cardA.year)} valueB={String(cardB.year)} highlight={cardA.year < cardB.year ? 'a' : cardA.year > cardB.year ? 'b' : 'equal'} />
          <ComparisonRow label="Set" valueA={cardA.set} valueB={cardB.set} />
          <ComparisonRow label="Card #" valueA={cardA.cardNumber} valueB={cardB.cardNumber} />
          <ComparisonRow label="Rookie Card" valueA={cardA.rookie ? 'Yes' : 'No'} valueB={cardB.rookie ? 'Yes' : 'No'} highlight={cardA.rookie && !cardB.rookie ? 'a' : !cardA.rookie && cardB.rookie ? 'b' : undefined} />
          <ComparisonRow label="Raw Value" valueA={cardA.estimatedValueRaw} valueB={cardB.estimatedValueRaw} highlight={comparison.rawA > comparison.rawB ? 'a' : comparison.rawA < comparison.rawB ? 'b' : 'equal'} />
          <ComparisonRow label="Gem Mint Value" valueA={cardA.estimatedValueGem} valueB={cardB.estimatedValueGem} highlight={comparison.gemA > comparison.gemB ? 'a' : comparison.gemA < comparison.gemB ? 'b' : 'equal'} />
          <ComparisonRow
            label="Grade Multiplier"
            valueA={comparison.rawA > 0 ? `${(comparison.gemA / comparison.rawA).toFixed(1)}x` : 'N/A'}
            valueB={comparison.rawB > 0 ? `${(comparison.gemB / comparison.rawB).toFixed(1)}x` : 'N/A'}
            highlight={comparison.rawA > 0 && comparison.rawB > 0 ? ((comparison.gemA / comparison.rawA) > (comparison.gemB / comparison.rawB) ? 'a' : 'b') : undefined}
          />

          {/* Action links */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-800">
            <Link href={`/sports/${cardA.slug}`} className="text-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              View {cardA.player} Details
            </Link>
            <Link href={`/sports/${cardB.slug}`} className="text-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              View {cardB.player} Details
            </Link>
          </div>

          {/* Analysis */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h3 className="text-white font-semibold text-sm mb-2">Quick Analysis</h3>
            <div className="space-y-2 text-gray-400 text-sm">
              {comparison.rawA > comparison.rawB && (
                <p><strong className="text-white">{cardA.name}</strong> has a higher raw value entry point ({cardA.estimatedValueRaw} vs {cardB.estimatedValueRaw}), suggesting more established market demand.</p>
              )}
              {comparison.rawB > comparison.rawA && (
                <p><strong className="text-white">{cardB.name}</strong> has a higher raw value entry point ({cardB.estimatedValueRaw} vs {cardA.estimatedValueRaw}), suggesting more established market demand.</p>
              )}
              {cardA.rookie && cardB.rookie && (
                <p>Both are rookie cards — the market tends to place higher long-term premiums on rookie cards compared to other issues of the same player.</p>
              )}
              {cardA.year < 1980 && cardB.year >= 2000 && (
                <p>This compares a vintage card ({cardA.year}) with a modern card ({cardB.year}). Vintage cards tend to have stronger floors due to scarcity, while modern cards offer higher upside if the player performs.</p>
              )}
              {cardB.year < 1980 && cardA.year >= 2000 && (
                <p>This compares a modern card ({cardA.year}) with a vintage card ({cardB.year}). Vintage cards tend to have stronger floors due to scarcity, while modern cards offer higher upside if the player performs.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popular comparisons */}
      {!cardA && !cardB && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Popular Comparisons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { a: 'Jordan Fleer RC', b: 'LeBron Chrome RC', desc: 'GOAT debate in card form' },
              { a: 'Trout Bowman Chrome', b: 'Ohtani Chrome RC', desc: 'Modern baseball kings' },
              { a: 'Brady Contenders', b: 'Mahomes Prizm RC', desc: 'NFL QB generations' },
              { a: 'Gretzky OPC RC', b: 'McDavid Young Guns', desc: 'Hockey GOAT vs next great' },
              { a: 'Mantle 1952 Topps', b: 'Wagner T206', desc: 'The two most valuable cards' },
              { a: 'Wembanyama Prizm', b: 'Edwards Prizm RC', desc: 'Next face of the NBA' },
            ].map(comp => (
              <div key={comp.desc} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-white font-semibold text-sm">{comp.a} vs {comp.b}</p>
                <p className="text-gray-500 text-xs mt-0.5">{comp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide links */}
      <div className="mt-12 pt-6 border-t border-gray-800">
        <h2 className="text-lg font-bold text-white mb-3">Related Guides</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/guides/best-rookie-cards-2026', label: 'Best Rookie Cards 2026' },
            { href: '/guides/investing-101', label: 'Investing 101' },
            { href: '/guides/how-to-read-price-data', label: 'How to Read Prices' },
            { href: '/guides/psa-vs-bgs-vs-cgc', label: 'PSA vs BGS vs CGC' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-xs text-gray-400 hover:text-emerald-400 bg-gray-800/60 border border-gray-700/50 px-3 py-1.5 rounded-full transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
