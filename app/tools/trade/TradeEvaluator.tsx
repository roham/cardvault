'use client';

import { useState, useMemo } from 'react';
import { sportsCards, SportsCard } from '@/data/sports-cards';

function parseValue(val: string): number {
  const m = val.match(/\$([\d,]+)/);
  if (!m) return 0;
  return parseInt(m[1].replace(/,/g, ''), 10) || 0;
}

function parseMidValue(val: string): number {
  const matches = val.match(/\$([\d,]+)/g);
  if (!matches || matches.length === 0) return 0;
  const nums = matches.map(m => parseInt(m.replace(/[$,]/g, ''), 10));
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0] + nums[1]) / 2);
}

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

interface TradeCard {
  card: SportsCard;
  condition: 'raw' | 'graded';
}

function CardSearch({ onSelect, excludeSlugs }: { onSelect: (card: SportsCard) => void; excludeSlugs: string[] }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return sportsCards
      .filter(c => !excludeSlugs.includes(c.slug))
      .filter(c => c.name.toLowerCase().includes(q) || c.player.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, excludeSlugs]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search by player or card name..."
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {results.map(card => (
            <button
              key={card.slug}
              onClick={() => { onSelect(card); setQuery(''); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-0"
            >
              <p className="text-white text-sm font-medium">{sportIcons[card.sport]} {card.player}</p>
              <p className="text-gray-500 text-xs">{card.name}</p>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-500 text-sm">No cards found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

function TradeSide({ label, cards, onAdd, onRemove, onToggleCondition, color }: {
  label: string;
  cards: TradeCard[];
  onAdd: (card: SportsCard) => void;
  onRemove: (slug: string) => void;
  onToggleCondition: (slug: string) => void;
  color: string;
}) {
  const excludeSlugs = cards.map(c => c.card.slug);
  const totalValue = cards.reduce((sum, tc) => {
    const val = tc.condition === 'graded' ? parseMidValue(tc.card.estimatedValueGem) : parseMidValue(tc.card.estimatedValueRaw);
    return sum + val;
  }, 0);

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-sm">{label}</h3>
        <span className="text-emerald-400 font-bold text-lg">${totalValue.toLocaleString()}</span>
      </div>

      <CardSearch onSelect={onAdd} excludeSlugs={excludeSlugs} />

      <div className="mt-4 space-y-2">
        {cards.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-4">Add cards to this side of the trade</p>
        )}
        {cards.map(tc => {
          const val = tc.condition === 'graded' ? parseMidValue(tc.card.estimatedValueGem) : parseMidValue(tc.card.estimatedValueRaw);
          return (
            <div key={tc.card.slug} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{sportIcons[tc.card.sport]} {tc.card.player}</p>
                <p className="text-gray-500 text-xs truncate">{tc.card.set} &middot; {tc.card.year}</p>
              </div>
              <button
                onClick={() => onToggleCondition(tc.card.slug)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  tc.condition === 'graded'
                    ? 'bg-purple-900/40 text-purple-400 border border-purple-800/50'
                    : 'bg-gray-700 text-gray-400 border border-gray-600'
                }`}
              >
                {tc.condition === 'graded' ? 'Gem' : 'Raw'}
              </button>
              <span className="shrink-0 text-sm text-gray-300 font-medium w-16 text-right">${val.toLocaleString()}</span>
              <button
                onClick={() => onRemove(tc.card.slug)}
                className="shrink-0 w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors"
              >
                x
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TradeEvaluator() {
  const [sideA, setSideA] = useState<TradeCard[]>([]);
  const [sideB, setSideB] = useState<TradeCard[]>([]);

  const addToA = (card: SportsCard) => setSideA([...sideA, { card, condition: 'raw' }]);
  const addToB = (card: SportsCard) => setSideB([...sideB, { card, condition: 'raw' }]);
  const removeFromA = (slug: string) => setSideA(sideA.filter(c => c.card.slug !== slug));
  const removeFromB = (slug: string) => setSideB(sideB.filter(c => c.card.slug !== slug));
  const toggleA = (slug: string) => setSideA(sideA.map(c => c.card.slug === slug ? { ...c, condition: c.condition === 'raw' ? 'graded' : 'raw' } : c));
  const toggleB = (slug: string) => setSideB(sideB.map(c => c.card.slug === slug ? { ...c, condition: c.condition === 'raw' ? 'graded' : 'raw' } : c));

  const totalA = sideA.reduce((sum, tc) => sum + (tc.condition === 'graded' ? parseMidValue(tc.card.estimatedValueGem) : parseMidValue(tc.card.estimatedValueRaw)), 0);
  const totalB = sideB.reduce((sum, tc) => sum + (tc.condition === 'graded' ? parseMidValue(tc.card.estimatedValueGem) : parseMidValue(tc.card.estimatedValueRaw)), 0);

  const diff = totalA - totalB;
  const hasBothSides = sideA.length > 0 && sideB.length > 0;

  return (
    <div className="space-y-6">
      {/* Two sides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TradeSide
          label="Side A — You're Giving"
          cards={sideA}
          onAdd={addToA}
          onRemove={removeFromA}
          onToggleCondition={toggleA}
          color=""
        />
        <TradeSide
          label="Side B — You're Getting"
          cards={sideB}
          onAdd={addToB}
          onRemove={removeFromB}
          onToggleCondition={toggleB}
          color=""
        />
      </div>

      {/* Trade Analysis */}
      {hasBothSides && (
        <div className={`rounded-2xl p-6 border ${
          Math.abs(diff) < totalA * 0.1 && Math.abs(diff) < totalB * 0.1
            ? 'bg-emerald-950/20 border-emerald-800/50'
            : diff > 0
              ? 'bg-red-950/20 border-red-800/50'
              : 'bg-blue-950/20 border-blue-800/50'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
              Math.abs(diff) < totalA * 0.1 && Math.abs(diff) < totalB * 0.1
                ? 'bg-emerald-900/50' : diff > 0 ? 'bg-red-900/50' : 'bg-blue-900/50'
            }`}>
              {Math.abs(diff) < totalA * 0.1 && Math.abs(diff) < totalB * 0.1
                ? '✅' : diff > 0 ? '⚠️' : '🎯'}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                {Math.abs(diff) < totalA * 0.1 && Math.abs(diff) < totalB * 0.1
                  ? 'Fair Trade'
                  : diff > 0
                    ? 'You\'re Overpaying'
                    : 'You\'re Getting a Deal'}
              </h3>
              <p className="text-gray-400 text-sm">
                Based on estimated market values
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs mb-1">You Give</p>
              <p className="text-white font-bold text-lg">${totalA.toLocaleString()}</p>
              <p className="text-gray-600 text-xs">{sideA.length} card{sideA.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs mb-1">Difference</p>
              <p className={`font-bold text-lg ${diff > 0 ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-gray-300'}`}>
                {diff > 0 ? '-' : diff < 0 ? '+' : ''}{diff !== 0 ? `$${Math.abs(diff).toLocaleString()}` : 'Even'}
              </p>
              <p className="text-gray-600 text-xs">
                {diff > 0 ? 'you overpay' : diff < 0 ? 'you gain' : 'balanced'}
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-xs mb-1">You Get</p>
              <p className="text-white font-bold text-lg">${totalB.toLocaleString()}</p>
              <p className="text-gray-600 text-xs">{sideB.length} card{sideB.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Value bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Side A: ${totalA.toLocaleString()}</span>
              <span>Side B: ${totalB.toLocaleString()}</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div
                className="bg-red-500/80 transition-all duration-300"
                style={{ width: `${totalA + totalB > 0 ? (totalA / (totalA + totalB)) * 100 : 50}%` }}
              />
              <div
                className="bg-blue-500/80 transition-all duration-300"
                style={{ width: `${totalA + totalB > 0 ? (totalB / (totalA + totalB)) * 100 : 50}%` }}
              />
            </div>
          </div>

          {/* Advice */}
          <div className="bg-gray-900/30 rounded-xl p-4">
            <h4 className="text-amber-300 font-semibold text-sm mb-2">Trade Advice</h4>
            <div className="text-amber-200/70 text-sm space-y-1">
              {Math.abs(diff) < totalA * 0.1 && Math.abs(diff) < totalB * 0.1 ? (
                <>
                  <p>* This trade looks fair — values are within 10% of each other.</p>
                  <p>* Consider which cards better fit your collection goals beyond pure value.</p>
                </>
              ) : diff > 0 ? (
                <>
                  <p>* You&apos;re giving up ${Math.abs(diff).toLocaleString()} more in value than you&apos;re receiving.</p>
                  <p>* Ask the other side to add cash or another card to balance the trade.</p>
                  <p>* Consider if the card you&apos;re getting has upside potential that justifies the premium.</p>
                </>
              ) : (
                <>
                  <p>* You&apos;re getting ${Math.abs(diff).toLocaleString()} more in value — this trade favors you.</p>
                  <p>* Make sure values are based on comparable conditions and recent sales.</p>
                  <p>* Don&apos;t let the other side find out how good this deal is for you.</p>
                </>
              )}
              <p className="text-amber-400/40 text-xs mt-2">* Values are estimates based on market data. Always verify with recent eBay sold comps before finalizing a trade.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick tips when empty */}
      {!hasBothSides && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">How to Use the Trade Evaluator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Add Cards to Side A', desc: 'Search for cards you\'re giving in the trade. Toggle between raw and graded values.' },
              { step: '2', title: 'Add Cards to Side B', desc: 'Search for cards you\'re receiving. Build up both sides of the trade.' },
              { step: '3', title: 'See the Verdict', desc: 'We compare total estimated values and tell you who\'s getting the better deal.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-emerald-950/60 border border-emerald-800/50 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">{s.step}</div>
                <div>
                  <p className="text-white font-medium text-sm">{s.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
