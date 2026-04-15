'use client';

import { useState, useMemo, useCallback } from 'react';

/* ─── types ─── */
interface LiqCard {
  id: string;
  name: string;
  value: number;
}

type Speed = 'quick' | 'balanced' | 'max-value';

interface TierPlan {
  tier: string;
  range: string;
  cards: LiqCard[];
  totalValue: number;
  platform: string;
  feePercent: number;
  netProceeds: number;
  timeEstimate: string;
  note: string;
  color: string;
}

/* ─── helpers ─── */
function fmt(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtExact(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function genId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/* ─── platform configs by speed ─── */
const PLATFORMS: Record<Speed, Record<string, { platform: string; feePercent: number; time: string; note: string }>> = {
  quick: {
    premium: { platform: 'Goldin Auctions (quick consign)', feePercent: 18, time: '30-45 days', note: 'Fast auction cycle for premium cards' },
    high: { platform: 'eBay Auction (7-day)', feePercent: 13.25, time: '7-14 days', note: 'Auction format for quick sale' },
    notable: { platform: 'Facebook Card Groups', feePercent: 3, time: '1-5 days', note: 'Post and negotiate directly' },
    mid: { platform: 'Local Card Shop', feePercent: 40, time: '1 day', note: 'Instant cash, lowest return' },
    bulk: { platform: 'Bulk Dealer', feePercent: 60, time: '1-3 days', note: 'Sell entire lot at once' },
  },
  balanced: {
    premium: { platform: 'Goldin Auctions', feePercent: 15, time: '45-60 days', note: 'Premium auction house for top cards' },
    high: { platform: 'eBay (Buy It Now + Best Offer)', feePercent: 13.25, time: '7-30 days', note: 'Flexible pricing, large audience' },
    notable: { platform: 'eBay (Buy It Now)', feePercent: 13.25, time: '7-21 days', note: 'Individual listings for best return' },
    mid: { platform: 'COMC Consignment', feePercent: 25, time: '14-45 days', note: 'Ship once, they handle the rest' },
    bulk: { platform: 'eBay Bulk Lots', feePercent: 13.25, time: '7-14 days', note: 'Group by sport/year, sell as lots' },
  },
  'max-value': {
    premium: { platform: 'Heritage Auctions', feePercent: 12, time: '60-120 days', note: 'Top auction house, best realized prices' },
    high: { platform: 'Goldin Auctions', feePercent: 15, time: '45-75 days', note: 'Premium platform, strong bidder pool' },
    notable: { platform: 'eBay (Buy It Now, patient pricing)', feePercent: 13.25, time: '14-45 days', note: 'List high, wait for the right buyer' },
    mid: { platform: 'MySlabs / eBay (individual)', feePercent: 10, time: '14-60 days', note: 'Individual listings for mid-range' },
    bulk: { platform: 'COMC + eBay Lots', feePercent: 20, time: '30-90 days', note: 'Consign better ones, lot the rest' },
  },
};

const TIER_CONFIG: { key: string; tier: string; range: string; min: number; max: number; color: string }[] = [
  { key: 'premium', tier: 'Premium', range: '$1,000+', min: 1000, max: Infinity, color: 'text-yellow-400' },
  { key: 'high', tier: 'High Value', range: '$200-999', min: 200, max: 999.99, color: 'text-purple-400' },
  { key: 'notable', tier: 'Notable', range: '$50-199', min: 50, max: 199.99, color: 'text-blue-400' },
  { key: 'mid', tier: 'Mid-Range', range: '$10-49', min: 10, max: 49.99, color: 'text-emerald-400' },
  { key: 'bulk', tier: 'Bulk', range: 'Under $10', min: 0, max: 9.99, color: 'text-gray-400' },
];

const SAMPLE_CARDS: LiqCard[] = [
  { id: 's1', name: '1986 Fleer Michael Jordan RC #57', value: 5000 },
  { id: 's2', name: '2017 Prizm Patrick Mahomes RC Silver', value: 800 },
  { id: 's3', name: '2018 Topps Chrome Shohei Ohtani RC', value: 300 },
  { id: 's4', name: '2024 Panini Prizm Caitlin Clark RC', value: 200 },
  { id: 's5', name: '2020 Prizm Justin Herbert RC Silver', value: 150 },
  { id: 's6', name: '2019 Prizm Zion Williamson RC', value: 120 },
  { id: 's7', name: '1993 SP Derek Jeter RC #279', value: 400 },
  { id: 's8', name: '2024 Topps Chrome Paul Skenes RC', value: 50 },
  { id: 's9', name: '2023 Prizm Victor Wembanyama RC', value: 75 },
  { id: 's10', name: '2019 Mosaic Ja Morant RC', value: 80 },
  { id: 's11', name: '2022 Topps Series 1 Julio Rodriguez RC', value: 25 },
  { id: 's12', name: '2021 Prizm Trevor Lawrence RC', value: 15 },
  { id: 's13', name: '2020 Topps Update Randy Arozarena RC', value: 8 },
  { id: 's14', name: '2023 Topps Series 2 Corbin Carroll RC', value: 12 },
  { id: 's15', name: '2022 Panini Select Brock Purdy RC', value: 35 },
  { id: 's16', name: '2023 Upper Deck Connor Bedard YG', value: 60 },
  { id: 's17', name: '2021 Bowman Chrome Gunnar Henderson 1st', value: 45 },
  { id: 's18', name: '2019 Topps Chrome Yordan Alvarez RC', value: 30 },
  { id: 's19', name: '2024 Topps Heritage Jackson Holliday RC', value: 5 },
  { id: 's20', name: '2023 Prizm Caleb Williams RC', value: 7 },
];

/* ─── component ─── */
export default function LiquidationPlannerClient() {
  const [cards, setCards] = useState<LiqCard[]>([]);
  const [speed, setSpeed] = useState<Speed>('balanced');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [showPlan, setShowPlan] = useState(false);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);

  const addCard = useCallback(() => {
    const v = parseFloat(value);
    if (!name.trim() || isNaN(v) || v <= 0) return;
    setCards(prev => [...prev, { id: genId(), name: name.trim(), value: v }]);
    setName('');
    setValue('');
    setShowPlan(false);
  }, [name, value]);

  const removeCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    setShowPlan(false);
  }, []);

  const loadSamples = useCallback(() => {
    setCards(SAMPLE_CARDS);
    setShowPlan(false);
  }, []);

  const clearAll = useCallback(() => {
    setCards([]);
    setShowPlan(false);
    setExpandedTier(null);
  }, []);

  /* ─── build plan ─── */
  const plan = useMemo((): TierPlan[] => {
    if (cards.length === 0) return [];

    return TIER_CONFIG.map(tc => {
      const tierCards = cards.filter(c => c.value >= tc.min && c.value <= tc.max);
      const totalValue = tierCards.reduce((s, c) => s + c.value, 0);
      const cfg = PLATFORMS[speed][tc.key];
      const fees = totalValue * (cfg.feePercent / 100);
      return {
        tier: tc.tier,
        range: tc.range,
        cards: tierCards.sort((a, b) => b.value - a.value),
        totalValue,
        platform: cfg.platform,
        feePercent: cfg.feePercent,
        netProceeds: totalValue - fees,
        timeEstimate: cfg.time,
        note: cfg.note,
        color: tc.color,
      };
    }).filter(t => t.cards.length > 0);
  }, [cards, speed]);

  const totalValue = useMemo(() => cards.reduce((s, c) => s + c.value, 0), [cards]);
  const totalNet = useMemo(() => plan.reduce((s, t) => s + t.netProceeds, 0), [plan]);
  const totalFees = totalValue - totalNet;
  const feePercent = totalValue > 0 ? (totalFees / totalValue) * 100 : 0;

  /* ─── time estimate summary ─── */
  const timeEstimate = useMemo(() => {
    if (speed === 'quick') return '1-6 weeks';
    if (speed === 'balanced') return '2-8 weeks';
    return '1-4 months';
  }, [speed]);

  return (
    <div className="space-y-6">
      {/* Card Input */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Your Cards</h2>
          <div className="flex gap-2">
            <button onClick={loadSamples} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">
              Load Sample Collection
            </button>
            {cards.length > 0 && (
              <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Add Card Form */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Card name (e.g. 2020 Prizm Burrow RC)"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCard()}
            className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-rose-500/50"
          />
          <input
            type="number"
            placeholder="Value"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCard()}
            className="w-24 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-rose-500/50"
            min="0.01"
            step="0.01"
          />
          <button
            onClick={addCard}
            disabled={!name.trim() || !value || parseFloat(value) <= 0}
            className="bg-rose-600 hover:bg-rose-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>

        {/* Card List */}
        {cards.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {cards.sort((a, b) => b.value - a.value).map(card => {
              const tierCfg = TIER_CONFIG.find(t => card.value >= t.min && card.value <= t.max);
              return (
                <div key={card.id} className="flex items-center justify-between bg-gray-800/40 rounded-lg px-3 py-2 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs font-medium ${tierCfg?.color || 'text-gray-400'}`}>
                      {tierCfg?.tier || 'Bulk'}
                    </span>
                    <span className="text-white text-sm truncate">{card.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-white text-sm font-medium">{fmt(card.value)}</span>
                    <button
                      onClick={() => removeCard(card.id)}
                      className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs"
                    >
                      remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cards.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800/50 flex justify-between items-center">
            <span className="text-gray-400 text-sm">{cards.length} card{cards.length !== 1 ? 's' : ''}</span>
            <span className="text-white font-semibold">{fmtExact(totalValue)} total value</span>
          </div>
        )}
      </div>

      {/* Speed Selection */}
      {cards.length > 0 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Liquidation Speed</h2>
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'quick' as Speed, label: 'Quick', desc: 'Fastest sale, lower net', time: '1-6 weeks' },
              { key: 'balanced' as Speed, label: 'Balanced', desc: 'Good mix of speed & value', time: '2-8 weeks' },
              { key: 'max-value' as Speed, label: 'Maximum Value', desc: 'Patient, highest return', time: '1-4 months' },
            ]).map(s => (
              <button
                key={s.key}
                onClick={() => { setSpeed(s.key); setShowPlan(false); }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  speed === s.key
                    ? 'bg-rose-950/40 border-rose-700/50 ring-1 ring-rose-500/30'
                    : 'bg-gray-800/40 border-gray-700/40 hover:border-gray-600/50'
                }`}
              >
                <div className={`font-semibold text-sm ${speed === s.key ? 'text-rose-400' : 'text-white'}`}>
                  {s.label}
                </div>
                <div className="text-gray-400 text-xs mt-1">{s.desc}</div>
                <div className="text-gray-500 text-xs mt-0.5">{s.time}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowPlan(true)}
            className="mt-4 w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Generate Liquidation Plan
          </button>
        </div>
      )}

      {/* Results */}
      {showPlan && plan.length > 0 && (
        <>
          {/* Summary Dashboard */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Liquidation Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">Total Value</div>
                <div className="text-white font-bold text-lg">{fmt(totalValue)}</div>
              </div>
              <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">Net Proceeds</div>
                <div className="text-emerald-400 font-bold text-lg">{fmt(totalNet)}</div>
              </div>
              <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">Total Fees</div>
                <div className="text-red-400 font-bold text-lg">-{fmt(totalFees)}</div>
                <div className="text-gray-500 text-xs">{feePercent.toFixed(1)}% avg</div>
              </div>
              <div className="bg-gray-800/40 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">Timeline</div>
                <div className="text-rose-400 font-bold text-lg">{timeEstimate}</div>
              </div>
            </div>

            {/* Value Retention Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Value Retention</span>
                <span className="text-emerald-400 font-medium">{((totalNet / totalValue) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${(totalNet / totalValue) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              You keep {fmtExact(totalNet)} of {fmtExact(totalValue)} ({((totalNet / totalValue) * 100).toFixed(1)}%).
              {speed === 'quick' && ' Quick liquidation sacrifices ~10-20% more value for speed.'}
              {speed === 'balanced' && ' A balanced approach optimizes for both speed and return.'}
              {speed === 'max-value' && ' Patient selling maximizes your return but takes longer.'}
            </p>
          </div>

          {/* Tier-by-Tier Plan */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Selling Plan by Tier</h2>
            {plan.map(tier => (
              <div key={tier.tier} className="bg-gray-900/50 border border-gray-800/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedTier(expandedTier === tier.tier ? null : tier.tier)}
                  className="w-full p-4 sm:p-5 text-left hover:bg-gray-800/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold ${tier.color}`}>{tier.tier}</span>
                      <span className="text-gray-500 text-xs">{tier.range}</span>
                      <span className="text-gray-600 text-xs">{tier.cards.length} card{tier.cards.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-medium text-sm">{fmt(tier.totalValue)}</div>
                        <div className="text-emerald-400 text-xs">net {fmt(tier.netProceeds)}</div>
                      </div>
                      <span className={`text-gray-500 transition-transform ${expandedTier === tier.tier ? 'rotate-180' : ''}`}>
                        &#9662;
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                    <span className="text-gray-400">
                      Platform: <span className="text-white">{tier.platform}</span>
                    </span>
                    <span className="text-gray-400">
                      Fees: <span className="text-red-400">{tier.feePercent}%</span> (-{fmt(tier.totalValue - tier.netProceeds)})
                    </span>
                    <span className="text-gray-400">
                      Time: <span className="text-rose-400">{tier.timeEstimate}</span>
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{tier.note}</p>
                </button>

                {expandedTier === tier.tier && (
                  <div className="border-t border-gray-800/50 p-4 space-y-1">
                    {tier.cards.map(card => {
                      const fee = card.value * (tier.feePercent / 100);
                      return (
                        <div key={card.id} className="flex items-center justify-between text-sm bg-gray-800/30 rounded-lg px-3 py-2">
                          <span className="text-gray-300 truncate mr-3">{card.name}</span>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-white">{fmt(card.value)}</span>
                            <span className="text-red-400 text-xs">-{fmt(fee)}</span>
                            <span className="text-emerald-400 font-medium">{fmt(card.value - fee)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Checklist */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Liquidation Checklist</h2>
            <div className="space-y-3">
              {plan.map((tier, i) => (
                <div key={tier.tier} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-rose-900/60 text-rose-400' : 'bg-gray-800 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-white text-sm font-medium">
                      Sell {tier.cards.length} {tier.tier.toLowerCase()} card{tier.cards.length !== 1 ? 's' : ''} on {tier.platform}
                    </span>
                    <div className="text-gray-500 text-xs mt-0.5">
                      Expected: {fmt(tier.netProceeds)} net &middot; {tier.timeEstimate}
                      {tier.tier === 'Premium' || tier.tier === 'High Value' ? ' — consider grading first if cards are NM+' : ''}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 pt-2 border-t border-gray-800/50">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-emerald-900/60 text-emerald-400">
                  $
                </div>
                <div>
                  <span className="text-emerald-400 text-sm font-medium">
                    Total expected proceeds: {fmtExact(totalNet)}
                  </span>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {((totalNet / totalValue) * 100).toFixed(1)}% of collection value after all fees
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Speed Comparison */}
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Speed Comparison</h2>
            <div className="space-y-3">
              {(['quick', 'balanced', 'max-value'] as Speed[]).map(s => {
                const tierPlans = TIER_CONFIG.map(tc => {
                  const tierCards = cards.filter(c => c.value >= tc.min && c.value <= tc.max);
                  const tv = tierCards.reduce((sum, c) => sum + c.value, 0);
                  const cfg = PLATFORMS[s][tc.key];
                  return tv - (tv * cfg.feePercent / 100);
                });
                const net = tierPlans.reduce((a, b) => a + b, 0);
                const pct = totalValue > 0 ? (net / totalValue) * 100 : 0;
                const isActive = s === speed;
                const label = s === 'quick' ? 'Quick' : s === 'balanced' ? 'Balanced' : 'Max Value';
                const time = s === 'quick' ? '1-6 weeks' : s === 'balanced' ? '2-8 weeks' : '1-4 months';

                return (
                  <div key={s} className={`flex items-center justify-between p-3 rounded-lg ${
                    isActive ? 'bg-rose-950/30 border border-rose-800/40' : 'bg-gray-800/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      {isActive && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                      <span className={`text-sm font-medium ${isActive ? 'text-rose-400' : 'text-gray-300'}`}>{label}</span>
                      <span className="text-gray-500 text-xs">{time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isActive ? 'bg-rose-500' : 'bg-gray-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium w-16 text-right ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {fmt(net)}
                      </span>
                      <span className="text-gray-500 text-xs w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Difference between quick and max-value: {fmt(
                (() => {
                  const netFor = (s: Speed) => TIER_CONFIG.reduce((total, tc) => {
                    const tierCards = cards.filter(c => c.value >= tc.min && c.value <= tc.max);
                    const tv = tierCards.reduce((sum, c) => sum + c.value, 0);
                    return total + tv - (tv * PLATFORMS[s][tc.key].feePercent / 100);
                  }, 0);
                  return netFor('max-value') - netFor('quick');
                })()
              )} more for waiting longer.
            </p>
          </div>
        </>
      )}

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="text-center py-12 bg-gray-900/30 border border-gray-800/30 rounded-xl">
          <p className="text-gray-400 mb-2">Add cards to plan your liquidation strategy</p>
          <button onClick={loadSamples} className="text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors">
            Load Sample Collection (20 cards)
          </button>
        </div>
      )}
    </div>
  );
}
