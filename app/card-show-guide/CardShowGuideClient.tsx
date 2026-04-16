'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

/* ── types ──────────────────────────────────────────────────── */

interface ChecklistItem {
  id: string;
  label: string;
  category: 'money' | 'supplies' | 'personal' | 'tech';
}

interface NegotiationTactic {
  title: string;
  description: string;
  example: string;
  effectiveness: 'high' | 'medium' | 'low';
}

interface RedFlag {
  title: string;
  description: string;
  howToSpot: string;
  severity: 'critical' | 'warning' | 'caution';
}

interface PurchaseItem {
  id: string;
  name: string;
  pricePaid: number;
  marketValue: number;
}

interface GuideData {
  checklist: Record<string, boolean>;
  purchases: PurchaseItem[];
}

/* ── storage ────────────────────────────────────────────────── */

const STORAGE_KEY = 'cardvault_show_guide';

function defaultData(): GuideData {
  return {
    checklist: {},
    purchases: [],
  };
}

function loadData(): GuideData {
  if (typeof window === 'undefined') return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return { ...defaultData(), ...JSON.parse(raw) };
  } catch { return defaultData(); }
}

function saveData(data: GuideData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function fmt(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

function fmtDec(n: number) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

/* ── data ───────────────────────────────────────────────────── */

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'cash', label: 'Cash in small bills ($1s, $5s, $10s, $20s)', category: 'money' },
  { id: 'budget-limit', label: 'Budget limit set and committed', category: 'money' },
  { id: 'business-cards', label: 'Business cards or contact info', category: 'money' },
  { id: 'want-list', label: 'Want list with target prices', category: 'supplies' },
  { id: 'ref-prices', label: 'Reference prices loaded on phone', category: 'tech' },
  { id: 'penny-sleeves', label: 'Penny sleeves (pack of 100)', category: 'supplies' },
  { id: 'top-loaders', label: 'Top loaders (pack of 25)', category: 'supplies' },
  { id: 'card-storage', label: 'Card storage box or bag for purchases', category: 'supplies' },
  { id: 'phone-charged', label: 'Phone fully charged + power bank', category: 'tech' },
  { id: 'scanner-app', label: 'Card scanner / price check app ready', category: 'tech' },
  { id: 'comfortable-shoes', label: 'Comfortable shoes (you will walk miles)', category: 'personal' },
  { id: 'water', label: 'Water bottle and snacks', category: 'personal' },
];

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  money: { label: 'Money', color: 'text-green-400' },
  supplies: { label: 'Supplies', color: 'text-blue-400' },
  personal: { label: 'Personal', color: 'text-purple-400' },
  tech: { label: 'Tech', color: 'text-cyan-400' },
};

const NEGOTIATION_TACTICS: NegotiationTactic[] = [
  {
    title: 'Ask for their best price first',
    description: 'Never name a price first. Ask "What\'s your best price on this?" — dealers often drop 10-20% immediately without you making an offer.',
    example: '"I\'m interested in this card. What\'s your best price?"',
    effectiveness: 'high',
  },
  {
    title: 'Bundle multiple cards',
    description: 'Buying 3-5 cards from one dealer gives you leverage. Dealers prefer selling multiple items to maximize their table time. Ask for 15-30% off the total.',
    example: '"I want these four cards. What can you do on all of them together?"',
    effectiveness: 'high',
  },
  {
    title: 'End-of-show timing',
    description: 'The last 1-2 hours of the show are prime negotiation time. Dealers would rather sell at a discount than pack up unsold inventory for the drive home.',
    example: 'Circle back to big-ticket items in the final hour after doing a full lap.',
    effectiveness: 'high',
  },
  {
    title: 'Be ready to walk away',
    description: 'The most powerful negotiation tool. If a dealer won\'t meet your price, politely say thanks and walk. Many will call you back with a better offer.',
    example: '"That\'s a bit more than I want to spend. I\'ll think about it — thanks!" Then walk away slowly.',
    effectiveness: 'high',
  },
  {
    title: 'Cash is king',
    description: 'Flash the cash. Dealers pay 3-4% on card transactions and deal with chargebacks. Offer to pay cash and ask for a cash discount.',
    example: '"I can do $80 cash right now" while holding the bills visible.',
    effectiveness: 'medium',
  },
  {
    title: 'Build relationships',
    description: 'Return to the same dealers show after show. Regulars get first looks at new inventory, better prices, and dealers set aside cards they know you want.',
    example: 'Exchange business cards. Remember their name. Ask about their next show.',
    effectiveness: 'medium',
  },
  {
    title: 'Check condition before buying',
    description: 'Always inspect cards outside the sleeve under good light. Surface scratches, corner damage, and centering issues affect value. Use condition as a negotiation lever.',
    example: '"I like this card but the corners are a bit soft — would you take $X considering the condition?"',
    effectiveness: 'medium',
  },
  {
    title: 'Compare before committing',
    description: 'Walk the entire show before buying. Multiple dealers may have the same card at different prices. Use the lower price as leverage.',
    example: '"I saw this same card at another table for $X — can you match or beat that?"',
    effectiveness: 'medium',
  },
  {
    title: 'Ask about quantity discounts',
    description: 'Dealers buying or selling in bulk often have quantity pricing tiers. Ask if buying 10+ of a common card or multiple lots gets a per-card discount.',
    example: '"If I buy the whole lot, what\'s the per-card price?"',
    effectiveness: 'low',
  },
  {
    title: 'Know your comps',
    description: 'Check recent eBay sold listings and 130point.com before the show. Knowing what a card actually sells for gives you confidence and credibility in negotiations.',
    example: '"Recent sales on eBay are at $X — can you get close to that?"',
    effectiveness: 'high',
  },
];

const RED_FLAGS: RedFlag[] = [
  {
    title: 'Trimmed cards',
    description: 'Cards with edges cut to appear sharper or to remove damage. Trimming is fraud and makes a card essentially worthless to graders.',
    howToSpot: 'Compare card dimensions to a known-good copy. Look for unnaturally sharp edges or slightly smaller size. Use a ruler if in doubt.',
    severity: 'critical',
  },
  {
    title: 'Restored corners',
    description: 'Vintage cards with corners rebuilt using filler, paint, or material from other cards. A restored card may look VG/EX but is actually altered.',
    howToSpot: 'Examine corners under a loupe. Look for color inconsistencies, texture differences, or excess material at corner tips.',
    severity: 'critical',
  },
  {
    title: 'Recolored patches',
    description: 'Memorabilia cards with jersey patches that have been dyed or painted to appear as a rarer color variation (e.g., making a white swatch look like a game-worn color).',
    howToSpot: 'Compare the patch color and texture to known examples. Recolored patches often have an unnatural sheen or color bleeding at the edges.',
    severity: 'critical',
  },
  {
    title: 'Fake autographs',
    description: 'Cards with forged signatures, either hand-signed fakes or printed reproductions sold as authentic. Without legitimate authentication, autos are risky.',
    howToSpot: 'Only buy authenticated autos (PSA/DNA, JSA, Beckett). Compare the signature to known examples. If it comes with an unknown COA company, it is likely fake.',
    severity: 'critical',
  },
  {
    title: 'Stolen graded slabs',
    description: 'Graded cards that were stolen from other collectors, shows, or shops. Buying stolen property is illegal even if you did not know.',
    howToSpot: 'Verify the cert number on PSA, BGS, or CGC websites. Check the card matches the cert description. If the price is suspicious, ask for provenance.',
    severity: 'critical',
  },
  {
    title: 'Too-good-to-be-true graded cards',
    description: 'Counterfeit graded slabs — fake PSA/BGS/CGC cases with real or fake cards inside. The slab looks authentic but is a reproduction.',
    howToSpot: 'Check the label font, barcode, and hologram carefully. Verify the cert number online. Weigh the slab — counterfeits are often slightly off. Compare case quality.',
    severity: 'critical',
  },
  {
    title: 'Pressure sales tactics',
    description: 'Dealers claiming "someone else is looking at this" or "I\'m about to raise the price" to rush your decision. Legitimate dealers do not pressure you.',
    howToSpot: 'If you feel rushed or pressured, walk away. Good deals will wait 5 minutes. Any dealer who pressures you does not deserve your business.',
    severity: 'warning',
  },
  {
    title: 'No return policy',
    description: 'Reputable dealers stand behind what they sell. A dealer who refuses any returns — even within minutes of purchase — may be selling questionable goods.',
    howToSpot: 'Ask about the return policy before purchasing high-value items. Most honest dealers allow returns at the same show if you discover an issue.',
    severity: 'caution',
  },
];

const SEVERITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-red-950/30 border-red-800/40', text: 'text-red-400', label: 'Critical' },
  warning: { bg: 'bg-amber-950/30 border-amber-800/40', text: 'text-amber-400', label: 'Warning' },
  caution: { bg: 'bg-yellow-950/30 border-yellow-800/40', text: 'text-yellow-400', label: 'Caution' },
};

const EFFECTIVENESS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-green-900/40', text: 'text-green-400', label: 'High Impact' },
  medium: { bg: 'bg-blue-900/40', text: 'text-blue-400', label: 'Medium Impact' },
  low: { bg: 'bg-gray-800/40', text: 'text-gray-400', label: 'Situational' },
};

/* ── price guide data ───────────────────────────────────────── */

const PRICE_SCENARIOS = [
  { label: 'Dealer Table (sticker price)', range: '110-130%', factor: [1.10, 1.30], color: 'text-red-400' },
  { label: 'Negotiated Price', range: '90-110%', factor: [0.90, 1.10], color: 'text-amber-400' },
  { label: 'End-of-Day Deal', range: '80-95%', factor: [0.80, 0.95], color: 'text-green-400' },
  { label: 'Trade-In Value', range: '50-65%', factor: [0.50, 0.65], color: 'text-blue-400' },
  { label: 'Bulk Commons', range: '25-50%', factor: [0.25, 0.50], color: 'text-purple-400' },
];

const VENUE_COMPARISON = [
  { venue: 'Card Show (negotiated)', price: '90-110%', shipping: 'Free', speed: 'Instant', inspect: 'Yes', notes: 'Best for high-value singles' },
  { venue: 'eBay Auction', price: '85-105%', shipping: '$4-8', speed: '3-7 days', inspect: 'Photos', notes: 'Best selection, buyer protection' },
  { venue: 'eBay BIN', price: '100-120%', shipping: '$4-8', speed: '3-7 days', inspect: 'Photos', notes: 'Convenience premium' },
  { venue: 'COMC', price: '95-115%', shipping: '$0-4', speed: '1-14 days', inspect: 'Scan', notes: 'Good for bulk singles' },
  { venue: 'LCS (Local Shop)', price: '105-130%', shipping: 'Free', speed: 'Instant', inspect: 'Yes', notes: 'Relationship pricing' },
  { venue: 'Facebook Groups', price: '80-100%', shipping: '$4-5', speed: '3-7 days', inspect: 'Photos', notes: 'No buyer protection' },
];

/* ── component ──────────────────────────────────────────────── */

type Tab = 'before' | 'at-show' | 'pricing' | 'post-show';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'before', label: 'Before the Show', icon: '\u2705' },
  { key: 'at-show', label: 'At the Show', icon: '\ud83e\udd1d' },
  { key: 'pricing', label: 'Price Guide', icon: '\ud83d\udcb2' },
  { key: 'post-show', label: 'Post-Show', icon: '\ud83d\udcca' },
];

export default function CardShowGuideClient() {
  const [data, setData] = useState<GuideData>(defaultData);
  const [tab, setTab] = useState<Tab>('before');
  const [mounted, setMounted] = useState(false);
  const [expandedTactic, setExpandedTactic] = useState<string | null>(null);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const [marketValue, setMarketValue] = useState<string>('100');

  // Post-show form state
  const [newName, setNewName] = useState('');
  const [newPaid, setNewPaid] = useState('');
  const [newMarketVal, setNewMarketVal] = useState('');

  useEffect(() => { setData(loadData()); setMounted(true); }, []);

  const update = useCallback((patch: Partial<GuideData>) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      saveData(next);
      return next;
    });
  }, []);

  /* ── derived stats ─── */
  const stats = useMemo(() => {
    const checklistDone = Object.values(data.checklist).filter(Boolean).length;
    const totalCards = data.purchases.length;
    const totalSpent = data.purchases.reduce((s, p) => s + p.pricePaid, 0);
    const totalValue = data.purchases.reduce((s, p) => s + p.marketValue, 0);
    const savings = totalValue - totalSpent;
    return { checklistDone, totalCards, totalSpent, totalValue, savings };
  }, [data]);

  const toggleChecklist = (id: string) => {
    update({ checklist: { ...data.checklist, [id]: !data.checklist[id] } });
  };

  const addPurchase = () => {
    const paid = parseFloat(newPaid);
    const mv = parseFloat(newMarketVal);
    if (!newName.trim() || isNaN(paid) || isNaN(mv)) return;
    const item: PurchaseItem = { id: uid(), name: newName.trim(), pricePaid: paid, marketValue: mv };
    update({ purchases: [...data.purchases, item] });
    setNewName('');
    setNewPaid('');
    setNewMarketVal('');
  };

  const removePurchase = (id: string) => {
    update({ purchases: data.purchases.filter(p => p.id !== id) });
  };

  const clearPurchases = () => {
    update({ purchases: [] });
  };

  const pnlGrade = (pnlPercent: number): { letter: string; color: string } => {
    if (pnlPercent >= 30) return { letter: 'A', color: 'text-green-400' };
    if (pnlPercent >= 15) return { letter: 'B', color: 'text-emerald-400' };
    if (pnlPercent >= 0) return { letter: 'C', color: 'text-yellow-400' };
    if (pnlPercent >= -15) return { letter: 'D', color: 'text-orange-400' };
    return { letter: 'F', color: 'text-red-400' };
  };

  const mvNum = parseFloat(marketValue) || 0;

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-800/50 rounded-lg" />)}
        </div>
        <div className="h-10 bg-gray-800/50 rounded-lg w-full" />
        <div className="h-64 bg-gray-800/50 rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Checklist Done', value: `${stats.checklistDone}/${CHECKLIST_ITEMS.length}`, color: 'text-orange-400' },
          { label: 'Cards Logged', value: stats.totalCards.toString(), color: 'text-blue-400' },
          { label: 'Est. Savings', value: stats.savings >= 0 ? fmt(stats.savings) : `-${fmt(Math.abs(stats.savings))}`, color: stats.savings >= 0 ? 'text-green-400' : 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-orange-900/50 text-orange-300 border border-orange-700/50'
                : 'bg-gray-900/50 text-gray-400 border border-gray-800 hover:border-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ BEFORE THE SHOW ═══════════════ */}
      {tab === 'before' && (
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Pre-Show Checklist</h2>
          <p className="text-gray-400 text-sm mb-4">
            Check off each item as you prepare. Your progress is saved automatically.
          </p>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-orange-400 font-medium">
                {stats.checklistDone}/{CHECKLIST_ITEMS.length} ({Math.round((stats.checklistDone / CHECKLIST_ITEMS.length) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-600 to-orange-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(stats.checklistDone / CHECKLIST_ITEMS.length) * 100}%` }}
              />
            </div>
            {stats.checklistDone === CHECKLIST_ITEMS.length && (
              <p className="text-green-400 text-sm mt-2 font-medium">You are show-ready! Good luck out there.</p>
            )}
          </div>

          {/* Grouped by category */}
          {(['money', 'supplies', 'tech', 'personal'] as const).map(cat => {
            const items = CHECKLIST_ITEMS.filter(c => c.category === cat);
            const catInfo = CATEGORY_LABELS[cat];
            return (
              <div key={cat} className="mb-4">
                <h3 className={`text-sm font-semibold ${catInfo.color} mb-2 uppercase tracking-wide`}>
                  {catInfo.label}
                </h3>
                <div className="space-y-1">
                  {items.map(item => {
                    const checked = !!data.checklist[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleChecklist(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors text-left ${
                          checked
                            ? 'bg-green-950/20 border-green-800/40 text-green-300'
                            : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          checked ? 'bg-green-600 border-green-600' : 'border-gray-600'
                        }`}>
                          {checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className={checked ? 'line-through text-gray-500' : ''}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Reset */}
          {stats.checklistDone > 0 && (
            <button
              onClick={() => update({ checklist: {} })}
              className="mt-4 text-xs text-gray-500 hover:text-gray-400 transition-colors underline"
            >
              Reset checklist
            </button>
          )}
        </div>
      )}

      {/* ═══════════════ AT THE SHOW ═══════════════ */}
      {tab === 'at-show' && (
        <div>
          {/* Negotiation Tactics */}
          <h2 className="text-xl font-bold text-white mb-2">Negotiation Tactics</h2>
          <p className="text-gray-400 text-sm mb-4">
            10 proven strategies to get better deals. Tap to expand for details and examples.
          </p>

          <div className="space-y-2 mb-8">
            {NEGOTIATION_TACTICS.map((tactic, i) => {
              const isExpanded = expandedTactic === tactic.title;
              const eff = EFFECTIVENESS_STYLES[tactic.effectiveness];
              return (
                <div key={tactic.title} className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedTactic(isExpanded ? null : tactic.title)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-900/50 text-orange-400 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-white font-medium text-sm">{tactic.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${eff.bg} ${eff.text}`}>{eff.label}</span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700/50">
                      <p className="text-gray-400 text-sm mt-3 mb-2">{tactic.description}</p>
                      <div className="bg-gray-900/60 border border-gray-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Example</p>
                        <p className="text-gray-300 text-sm italic">{tactic.example}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Red Flags */}
          <h2 className="text-xl font-bold text-white mb-2">Red Flags</h2>
          <p className="text-gray-400 text-sm mb-4">
            8 warning signs to watch for. Protecting yourself from fraud and bad deals.
          </p>

          <div className="space-y-2">
            {RED_FLAGS.map(flag => {
              const isExpanded = expandedFlag === flag.title;
              const sev = SEVERITY_STYLES[flag.severity];
              return (
                <div key={flag.title} className={`border rounded-xl overflow-hidden ${sev.bg}`}>
                  <button
                    onClick={() => setExpandedFlag(isExpanded ? null : flag.title)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium border ${sev.bg} ${sev.text}`}>
                      {sev.label}
                    </span>
                    <span className="flex-1 text-white font-medium text-sm">{flag.title}</span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700/30">
                      <p className="text-gray-400 text-sm mt-3 mb-3">{flag.description}</p>
                      <div className="bg-gray-900/40 border border-gray-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">How to spot it</p>
                        <p className="text-gray-300 text-sm">{flag.howToSpot}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════ PRICE GUIDE ═══════════════ */}
      {tab === 'pricing' && (
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Show Pricing Calculator</h2>
          <p className="text-gray-400 text-sm mb-6">
            Enter a card&apos;s online market value to see what to expect at a show.
          </p>

          {/* Market value input */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Online Market Value (eBay last sold)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-lg">$</span>
              <input
                type="number"
                value={marketValue}
                onChange={e => setMarketValue(e.target.value)}
                min="0"
                step="1"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-lg font-mono focus:outline-none focus:border-orange-600 transition-colors"
                placeholder="100"
              />
            </div>
          </div>

          {/* Scenario breakdown */}
          {mvNum > 0 && (
            <div className="space-y-3 mb-8">
              {PRICE_SCENARIOS.map(scenario => {
                const low = mvNum * scenario.factor[0];
                const high = mvNum * scenario.factor[1];
                return (
                  <div key={scenario.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm font-medium">{scenario.label}</span>
                      <span className={`text-xs ${scenario.color}`}>{scenario.range} of market</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-xl font-bold ${scenario.color}`}>{fmtDec(low)}</span>
                      <span className="text-gray-500">-</span>
                      <span className={`text-xl font-bold ${scenario.color}`}>{fmtDec(high)}</span>
                    </div>
                    {/* Visual bar */}
                    <div className="mt-2 h-2 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          scenario.factor[1] <= 0.65 ? 'bg-blue-500' :
                          scenario.factor[1] <= 1.0 ? 'bg-green-500' :
                          scenario.factor[1] <= 1.1 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, ((scenario.factor[0] + scenario.factor[1]) / 2) * 50)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Venue Comparison Table */}
          <h3 className="text-lg font-bold text-white mb-3">Show vs Online Comparison</h3>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium py-2 pr-3">Venue</th>
                  <th className="text-left text-gray-400 font-medium py-2 pr-3">Price</th>
                  <th className="text-left text-gray-400 font-medium py-2 pr-3 hidden sm:table-cell">Shipping</th>
                  <th className="text-left text-gray-400 font-medium py-2 pr-3 hidden sm:table-cell">Inspect</th>
                  <th className="text-left text-gray-400 font-medium py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {VENUE_COMPARISON.map(row => (
                  <tr key={row.venue} className="border-b border-gray-800/50">
                    <td className="py-2.5 pr-3 text-white font-medium whitespace-nowrap">{row.venue}</td>
                    <td className="py-2.5 pr-3 text-orange-400 font-mono whitespace-nowrap">{row.price}</td>
                    <td className="py-2.5 pr-3 text-gray-400 hidden sm:table-cell">{row.shipping}</td>
                    <td className="py-2.5 pr-3 text-gray-400 hidden sm:table-cell">{row.inspect}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pro tips */}
          <div className="mt-8 bg-orange-950/20 border border-orange-800/30 rounded-xl p-5">
            <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wide">Show Pricing Tips</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex gap-2"><span className="text-orange-400 flex-shrink-0">&bull;</span>Always check eBay &quot;sold&quot; listings before a show — not &quot;listed&quot; prices</li>
              <li className="flex gap-2"><span className="text-orange-400 flex-shrink-0">&bull;</span>Show prices include no shipping or tax — factor that into your comparison</li>
              <li className="flex gap-2"><span className="text-orange-400 flex-shrink-0">&bull;</span>Dealers at national shows charge more than local shows (higher booth fees)</li>
              <li className="flex gap-2"><span className="text-orange-400 flex-shrink-0">&bull;</span>Vintage raw cards are often better deals at shows than online (condition verification)</li>
              <li className="flex gap-2"><span className="text-orange-400 flex-shrink-0">&bull;</span>Sealed product is usually the same price at shows as online — focus on singles</li>
            </ul>
          </div>
        </div>
      )}

      {/* ═══════════════ POST-SHOW ═══════════════ */}
      {tab === 'post-show' && (
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Post-Show P&amp;L Tracker</h2>
          <p className="text-gray-400 text-sm mb-6">
            Log every card you bought. See your total spend, market value, and deal grade.
          </p>

          {/* Add purchase form */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-bold text-white mb-3">Add Purchase</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Card name"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-600 transition-colors"
              />
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={newPaid}
                  onChange={e => setNewPaid(e.target.value)}
                  placeholder="Price paid"
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-600 transition-colors"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={newMarketVal}
                  onChange={e => setNewMarketVal(e.target.value)}
                  placeholder="Market value"
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-600 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={addPurchase}
              disabled={!newName.trim() || !newPaid || !newMarketVal}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Card
            </button>
          </div>

          {/* Summary cards */}
          {data.purchases.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {(() => {
                  const pnlAmt = stats.totalValue - stats.totalSpent;
                  const pnlPct = stats.totalSpent > 0 ? ((pnlAmt / stats.totalSpent) * 100) : 0;
                  const grade = pnlGrade(pnlPct);
                  return [
                    { label: 'Total Spent', value: fmt(stats.totalSpent), color: 'text-red-400' },
                    { label: 'Market Value', value: fmt(stats.totalValue), color: 'text-blue-400' },
                    { label: 'P&L', value: `${pnlAmt >= 0 ? '+' : ''}${fmt(pnlAmt)}`, color: pnlAmt >= 0 ? 'text-green-400' : 'text-red-400' },
                    { label: 'Deal Grade', value: grade.letter, color: grade.color },
                  ];
                })().map(s => (
                  <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-gray-500 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Grade explanation */}
              <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg px-4 py-2 mb-4 text-xs text-gray-500">
                <span className="font-medium text-gray-400">Grading:</span>{' '}
                <span className="text-green-400">A</span> = 30%+ profit,{' '}
                <span className="text-emerald-400">B</span> = 15-29%,{' '}
                <span className="text-yellow-400">C</span> = 0-14% (break even),{' '}
                <span className="text-orange-400">D</span> = 0-15% loss,{' '}
                <span className="text-red-400">F</span> = 15%+ loss
              </div>

              {/* Purchase list */}
              <div className="space-y-2 mb-4">
                {data.purchases.map(p => {
                  const diff = p.marketValue - p.pricePaid;
                  const pct = p.pricePaid > 0 ? ((diff / p.pricePaid) * 100) : 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{p.name}</p>
                        <p className="text-gray-500 text-xs">
                          Paid {fmtDec(p.pricePaid)} &middot; Value {fmtDec(p.marketValue)}
                        </p>
                      </div>
                      <div className={`text-sm font-bold whitespace-nowrap ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {diff >= 0 ? '+' : ''}{fmtDec(diff)} ({pct >= 0 ? '+' : ''}{pct.toFixed(0)}%)
                      </div>
                      <button
                        onClick={() => removePurchase(p.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={clearPurchases}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors underline"
              >
                Clear all purchases
              </button>
            </>
          )}

          {data.purchases.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-lg mb-1">No purchases logged yet</p>
              <p className="text-sm">Add cards you bought at the show to track your P&amp;L</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
