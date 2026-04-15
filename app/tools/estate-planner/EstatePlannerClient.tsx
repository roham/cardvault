'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface CollectionCategory {
  name: string;
  description: string;
  count: number;
  estimatedValue: number;
  storageLocation: string;
  notes: string;
}

interface Beneficiary {
  name: string;
  relationship: string;
  allocation: 'percentage' | 'specific';
  percentage: number;
  specificItems: string;
  contactInfo: string;
}

type LiquidationPref = 'keep-intact' | 'sell-high-value' | 'full-liquidate' | 'donate' | 'mix';
type TimelinePref = 'no-rush' | '6-months' | '1-year' | 'immediate';

interface EstatePlan {
  ownerName: string;
  dateCreated: string;
  categories: CollectionCategory[];
  beneficiaries: Beneficiary[];
  liquidationPref: LiquidationPref;
  timelinePref: TimelinePref;
  trustedContacts: string;
  specialInstructions: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  appraisalDate: string;
}

// ── Default state ──────────────────────────────────────────────────────────
const defaultCategories: CollectionCategory[] = [
  { name: 'Vintage Cards (Pre-1980)', description: 'Topps, Fleer, O-Pee-Chee from before 1980', count: 0, estimatedValue: 0, storageLocation: '', notes: '' },
  { name: 'Modern Cards (1980-2010)', description: 'Junk wax through early hobby revival', count: 0, estimatedValue: 0, storageLocation: '', notes: '' },
  { name: 'Ultra-Modern (2011+)', description: 'Panini Prizm, Bowman Chrome, Optic era', count: 0, estimatedValue: 0, storageLocation: '', notes: '' },
  { name: 'Graded Cards (PSA/BGS/CGC/SGC)', description: 'Professional graded slabs', count: 0, estimatedValue: 0, storageLocation: '', notes: '' },
  { name: 'Sealed Products', description: 'Unopened boxes, packs, cases', count: 0, estimatedValue: 0, storageLocation: '', notes: '' },
  { name: 'Memorabilia & Patches', description: 'Game-used, autographed, relic cards', count: 0, estimatedValue: 0, storageLocation: '', notes: '' },
];

const defaultPlan: EstatePlan = {
  ownerName: '',
  dateCreated: new Date().toISOString().slice(0, 10),
  categories: defaultCategories,
  beneficiaries: [],
  liquidationPref: 'keep-intact',
  timelinePref: 'no-rush',
  trustedContacts: '',
  specialInstructions: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  appraisalDate: '',
};

const STORAGE_KEY = 'cardvault-estate-plan';

const liquidationOptions: { value: LiquidationPref; label: string; desc: string }[] = [
  { value: 'keep-intact', label: 'Keep Collection Intact', desc: 'Pass the entire collection to beneficiaries as-is' },
  { value: 'sell-high-value', label: 'Sell High-Value Items', desc: 'Sell cards worth $500+ at auction, distribute remaining collection' },
  { value: 'full-liquidate', label: 'Full Liquidation', desc: 'Sell everything and distribute cash proceeds' },
  { value: 'donate', label: 'Donate Collection', desc: 'Donate to a museum, charity, or educational institution' },
  { value: 'mix', label: 'Mixed Approach', desc: 'Keep key pieces for family, sell the rest' },
];

const timelineOptions: { value: TimelinePref; label: string; desc: string }[] = [
  { value: 'no-rush', label: 'No Rush', desc: 'Take time to get best prices — 1-3 years' },
  { value: '1-year', label: 'Within 1 Year', desc: 'Balanced approach between speed and value' },
  { value: '6-months', label: 'Within 6 Months', desc: 'Faster sale, may accept slightly lower prices' },
  { value: 'immediate', label: 'As Fast as Possible', desc: 'Quick liquidation, accept bulk offers' },
];

const sellingGuide = [
  { tier: '$10,000+', where: 'Heritage Auctions, Goldin, REA', fee: '10-20% seller premium', timeline: '2-4 months' },
  { tier: '$1,000-$9,999', where: 'PWCC, MySlabs, Goldin', fee: '8-15%', timeline: '1-3 months' },
  { tier: '$100-$999', where: 'eBay, COMC, Whatnot', fee: '10-15%', timeline: '1-4 weeks' },
  { tier: '$10-$99', where: 'eBay, local card shops, card shows', fee: '10-13% (eBay) or 40-60% (shop buyback)', timeline: '1-2 weeks' },
  { tier: 'Under $10', where: 'Bulk lots on eBay, card shows, donate', fee: 'Varies', timeline: '1 week' },
];

const heirInstructions = [
  { icon: '🚫', title: 'Do NOT Throw Anything Away', detail: 'Even common-looking cards can be worth thousands. A 1952 Topps Mickey Mantle looks like any old baseball card but sells for $100,000+.' },
  { icon: '🧤', title: "Don't Touch Cards With Bare Hands", detail: 'Oils from skin damage card surfaces. Handle by the edges only, or wear clean cotton gloves. Never remove cards from their protective holders.' },
  { icon: '🌡️', title: 'Maintain Current Storage', detail: 'Keep cards where they are. Avoid attics, basements, and garages — heat, humidity, and pests destroy cards. Room temperature (65-75°F) is ideal.' },
  { icon: '📋', title: 'Get a Professional Appraisal', detail: 'Before selling anything, get the collection appraised. PSA, Heritage Auctions, and PWCC offer free preliminary evaluations for large collections.' },
  { icon: '⚠️', title: 'Beware Lowball Offers', detail: 'Anyone who offers to buy the entire collection for a single price without examining it closely is likely offering 20-40% of actual value. Get multiple quotes.' },
  { icon: '💰', title: 'Sell the Right Way', detail: 'High-value cards ($1,000+) should go to major auction houses. Mid-range cards sell well on eBay. Bulk commons can go to local shops or card shows.' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ── Tabs ────────────────────────────────────────────────────────────────────
type Tab = 'inventory' | 'beneficiaries' | 'preferences' | 'document';

export default function EstatePlannerClient() {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlan] = useState<EstatePlan>(defaultPlan);
  const [activeTab, setActiveTab] = useState<Tab>('inventory');

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPlan(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const savePlan = useCallback((updated: EstatePlan) => {
    setPlan(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }, []);

  const totalValue = plan.categories.reduce((s, c) => s + c.estimatedValue, 0);
  const totalCards = plan.categories.reduce((s, c) => s + c.count, 0);
  const totalBeneficiaryPct = plan.beneficiaries.filter(b => b.allocation === 'percentage').reduce((s, b) => s + b.percentage, 0);
  const estimatedCapGainsTax = totalValue * 0.28;
  const steppedUpSavings = totalValue * 0.28;

  if (!mounted) return <div className="h-96 flex items-center justify-center text-gray-500">Loading...</div>;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'inventory', label: 'Inventory', icon: '📦' },
    { key: 'beneficiaries', label: 'Beneficiaries', icon: '👥' },
    { key: 'preferences', label: 'Preferences', icon: '⚙️' },
    { key: 'document', label: 'Document', icon: '📄' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
          <div className="text-xs text-gray-500 mt-1">Total Est. Value</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalCards.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Total Cards</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{plan.beneficiaries.length}</div>
          <div className="text-xs text-gray-500 mt-1">Beneficiaries</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(steppedUpSavings)}</div>
          <div className="text-xs text-gray-500 mt-1">Heir Tax Savings*</div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-900/50 border border-gray-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
              activeTab === t.key ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && <InventoryTab plan={plan} savePlan={savePlan} totalValue={totalValue} />}
      {activeTab === 'beneficiaries' && <BeneficiaryTab plan={plan} savePlan={savePlan} totalValue={totalValue} totalPct={totalBeneficiaryPct} />}
      {activeTab === 'preferences' && <PreferencesTab plan={plan} savePlan={savePlan} />}
      {activeTab === 'document' && <DocumentTab plan={plan} totalValue={totalValue} totalCards={totalCards} estimatedTax={estimatedCapGainsTax} steppedUpSavings={steppedUpSavings} />}
    </div>
  );
}

// ── Inventory Tab ──────────────────────────────────────────────────────────
function InventoryTab({ plan, savePlan, totalValue }: { plan: EstatePlan; savePlan: (p: EstatePlan) => void; totalValue: number }) {
  const updateCategory = (idx: number, field: keyof CollectionCategory, value: string | number) => {
    const updated = { ...plan, categories: plan.categories.map((c, i) => i === idx ? { ...c, [field]: value } : c) };
    savePlan(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <label className="block text-sm text-gray-400 mb-2">Collection Owner Name</label>
        <input
          type="text"
          value={plan.ownerName}
          onChange={e => savePlan({ ...plan, ownerName: e.target.value })}
          placeholder="Your full legal name"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Collection Categories</h3>
        {plan.categories.map((cat, i) => (
          <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-white">{cat.name}</h4>
                <p className="text-xs text-gray-500">{cat.description}</p>
              </div>
              {cat.estimatedValue > 0 && totalValue > 0 && (
                <span className="text-amber-400 font-medium text-sm">
                  {Math.round((cat.estimatedValue / totalValue) * 100)}% of total
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Card Count</label>
                <input type="number" min={0} value={cat.count || ''} onChange={e => updateCategory(i, 'count', parseInt(e.target.value) || 0)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estimated Value ($)</label>
                <input type="number" min={0} value={cat.estimatedValue || ''} onChange={e => updateCategory(i, 'estimatedValue', parseInt(e.target.value) || 0)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Storage Location</label>
                <input type="text" value={cat.storageLocation} onChange={e => updateCategory(i, 'storageLocation', e.target.value)} placeholder="e.g., Home safe, closet shelf" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <input type="text" value={cat.notes} onChange={e => updateCategory(i, 'notes', e.target.value)} placeholder="Key cards, special items" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Insurance & Appraisal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Insurance Provider</label>
            <input type="text" value={plan.insuranceProvider} onChange={e => savePlan({ ...plan, insuranceProvider: e.target.value })} placeholder="e.g., CollectInsure, Hugh Wood" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Policy Number</label>
            <input type="text" value={plan.insurancePolicyNumber} onChange={e => savePlan({ ...plan, insurancePolicyNumber: e.target.value })} placeholder="Policy #" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Last Appraisal Date</label>
            <input type="date" value={plan.appraisalDate} onChange={e => savePlan({ ...plan, appraisalDate: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none" />
          </div>
        </div>
        {totalValue >= 50000 && (
          <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg text-amber-300 text-xs">
            Your collection is valued at {formatCurrency(totalValue)}. Collections over $50,000 should have a professional appraisal for insurance and estate tax purposes.
          </div>
        )}
      </div>

      {totalValue > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Value Distribution</h3>
          <div className="flex rounded-lg overflow-hidden h-6 mb-3">
            {plan.categories.filter(c => c.estimatedValue > 0).map((c, i) => {
              const pct = (c.estimatedValue / totalValue) * 100;
              const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500'];
              return (
                <div key={i} className={`${colors[i % colors.length]} relative`} style={{ width: `${pct}%` }} title={`${c.name}: ${formatCurrency(c.estimatedValue)} (${Math.round(pct)}%)`}>
                  {pct > 12 && <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{Math.round(pct)}%</span>}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            {plan.categories.filter(c => c.estimatedValue > 0).map((c, i) => {
              const colors = ['text-amber-400', 'text-blue-400', 'text-emerald-400', 'text-purple-400', 'text-rose-400', 'text-cyan-400'];
              return <span key={i} className={colors[i % colors.length]}>{c.name}: {formatCurrency(c.estimatedValue)}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Beneficiary Tab ────────────────────────────────────────────────────────
function BeneficiaryTab({ plan, savePlan, totalValue, totalPct }: { plan: EstatePlan; savePlan: (p: EstatePlan) => void; totalValue: number; totalPct: number }) {
  const addBeneficiary = () => {
    savePlan({ ...plan, beneficiaries: [...plan.beneficiaries, { name: '', relationship: '', allocation: 'percentage', percentage: 0, specificItems: '', contactInfo: '' }] });
  };
  const updateBeneficiary = (idx: number, field: keyof Beneficiary, value: string | number) => {
    savePlan({ ...plan, beneficiaries: plan.beneficiaries.map((b, i) => i === idx ? { ...b, [field]: value } : b) });
  };
  const removeBeneficiary = (idx: number) => {
    savePlan({ ...plan, beneficiaries: plan.beneficiaries.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {totalPct > 0 && totalPct !== 100 && (
        <div className={`p-3 rounded-lg text-xs border ${totalPct > 100 ? 'bg-red-950/40 border-red-800/40 text-red-300' : 'bg-yellow-950/40 border-yellow-800/40 text-yellow-300'}`}>
          {totalPct > 100 ? `Percentage allocations total ${totalPct}% — exceeds 100%. Please adjust.` : `Percentage allocations total ${totalPct}% — ${100 - totalPct}% unassigned.`}
        </div>
      )}

      {plan.beneficiaries.map((ben, i) => (
        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-white">Beneficiary {i + 1}</h4>
            <button onClick={() => removeBeneficiary(i)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Full Name</label>
              <input type="text" value={ben.name} onChange={e => updateBeneficiary(i, 'name', e.target.value)} placeholder="Beneficiary name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Relationship</label>
              <select value={ben.relationship} onChange={e => updateBeneficiary(i, 'relationship', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none">
                <option value="">Select...</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="grandchild">Grandchild</option>
                <option value="sibling">Sibling</option>
                <option value="parent">Parent</option>
                <option value="friend">Friend</option>
                <option value="charity">Charity/Museum</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Allocation Type</label>
              <select value={ben.allocation} onChange={e => updateBeneficiary(i, 'allocation', e.target.value as 'percentage' | 'specific')} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none">
                <option value="percentage">Percentage of Collection</option>
                <option value="specific">Specific Items</option>
              </select>
            </div>
            {ben.allocation === 'percentage' ? (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Percentage</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={100} value={ben.percentage || ''} onChange={e => updateBeneficiary(i, 'percentage', parseInt(e.target.value) || 0)} placeholder="0" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none" />
                  <span className="text-gray-400">%</span>
                  {totalValue > 0 && ben.percentage > 0 && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">({formatCurrency(totalValue * ben.percentage / 100)})</span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Specific Items</label>
                <input type="text" value={ben.specificItems} onChange={e => updateBeneficiary(i, 'specificItems', e.target.value)} placeholder="e.g., All graded cards, 1952 Topps set" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Contact Info (phone/email)</label>
              <input type="text" value={ben.contactInfo} onChange={e => updateBeneficiary(i, 'contactInfo', e.target.value)} placeholder="Phone or email" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none" />
            </div>
          </div>
        </div>
      ))}

      <button onClick={addBeneficiary} className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-amber-600 transition-colors text-sm">
        + Add Beneficiary
      </button>

      {plan.beneficiaries.length > 0 && totalValue > 0 && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Allocation Summary</h3>
          <div className="space-y-2">
            {plan.beneficiaries.filter(b => b.name).map((b, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-white">{b.name} <span className="text-gray-500">({b.relationship || 'unspecified'})</span></span>
                <span className="text-amber-400 font-medium">
                  {b.allocation === 'percentage' ? `${b.percentage}% (${formatCurrency(totalValue * b.percentage / 100)})` : b.specificItems}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preferences Tab ────────────────────────────────────────────────────────
function PreferencesTab({ plan, savePlan }: { plan: EstatePlan; savePlan: (p: EstatePlan) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Liquidation Preference</h3>
        <p className="text-sm text-gray-400 mb-4">What should happen to your collection?</p>
        <div className="space-y-2">
          {liquidationOptions.map(opt => (
            <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${plan.liquidationPref === opt.value ? 'border-amber-600 bg-amber-950/30' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="radio" name="liquidation" value={opt.value} checked={plan.liquidationPref === opt.value} onChange={e => savePlan({ ...plan, liquidationPref: e.target.value as LiquidationPref })} className="mt-0.5 accent-amber-500" />
              <div>
                <div className="text-sm font-medium text-white">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Sale Timeline (if applicable)</h3>
        <div className="space-y-2">
          {timelineOptions.map(opt => (
            <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${plan.timelinePref === opt.value ? 'border-amber-600 bg-amber-950/30' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="radio" name="timeline" value={opt.value} checked={plan.timelinePref === opt.value} onChange={e => savePlan({ ...plan, timelinePref: e.target.value as TimelinePref })} className="mt-0.5 accent-amber-500" />
              <div>
                <div className="text-sm font-medium text-white">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-2">Trusted Contacts</h3>
        <p className="text-xs text-gray-500 mb-3">Dealers, auction houses, or collector friends who can help your heirs</p>
        <textarea value={plan.trustedContacts} onChange={e => savePlan({ ...plan, trustedContacts: e.target.value })} rows={4} placeholder={"e.g., John at Heritage Auctions — (800) 872-6467\nLocal dealer: Bob's Cards — (555) 123-4567"} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none resize-none" />
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-2">Special Instructions</h3>
        <p className="text-xs text-gray-500 mb-3">Anything else your heirs should know</p>
        <textarea value={plan.specialInstructions} onChange={e => savePlan({ ...plan, specialInstructions: e.target.value })} rows={4} placeholder={"e.g., The 1952 Topps Mantle is in the bank safe deposit box #247.\nThe Pokemon collection in the closet is worth more than it looks."} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none resize-none" />
      </div>
    </div>
  );
}

// ── Document Tab ───────────────────────────────────────────────────────────
function DocumentTab({ plan, totalValue, totalCards, estimatedTax, steppedUpSavings }: { plan: EstatePlan; totalValue: number; totalCards: number; estimatedTax: number; steppedUpSavings: number }) {
  const [copied, setCopied] = useState(false);

  const generateDocument = (): string => {
    const lines: string[] = [];
    lines.push('===================================================');
    lines.push('       CARD COLLECTION ESTATE PLAN');
    lines.push('===================================================');
    lines.push('');
    lines.push(`Owner: ${plan.ownerName || '(Not specified)'}`);
    lines.push(`Date Created: ${plan.dateCreated}`);
    lines.push(`Total Estimated Value: ${formatCurrency(totalValue)}`);
    lines.push(`Total Cards: ${totalCards.toLocaleString()}`);
    lines.push('');
    if (plan.insuranceProvider) {
      lines.push('-- Insurance ------------------------------------------');
      lines.push(`Provider: ${plan.insuranceProvider}`);
      if (plan.insurancePolicyNumber) lines.push(`Policy #: ${plan.insurancePolicyNumber}`);
      if (plan.appraisalDate) lines.push(`Last Appraisal: ${plan.appraisalDate}`);
      lines.push('');
    }
    lines.push('-- Collection Inventory --------------------------------');
    plan.categories.filter(c => c.count > 0 || c.estimatedValue > 0).forEach(c => {
      lines.push(`\n${c.name}`);
      lines.push(`  Cards: ${c.count.toLocaleString()} | Value: ${formatCurrency(c.estimatedValue)}`);
      if (c.storageLocation) lines.push(`  Location: ${c.storageLocation}`);
      if (c.notes) lines.push(`  Notes: ${c.notes}`);
    });
    lines.push('');
    if (plan.beneficiaries.length > 0) {
      lines.push('-- Beneficiaries --------------------------------------');
      plan.beneficiaries.forEach((b, i) => {
        lines.push(`\n${i + 1}. ${b.name || '(Unnamed)'} -- ${b.relationship || 'unspecified'}`);
        if (b.allocation === 'percentage') lines.push(`   Allocation: ${b.percentage}% (${formatCurrency(totalValue * b.percentage / 100)})`);
        else lines.push(`   Specific Items: ${b.specificItems}`);
        if (b.contactInfo) lines.push(`   Contact: ${b.contactInfo}`);
      });
      lines.push('');
    }
    lines.push('-- Preferences ----------------------------------------');
    lines.push(`Liquidation: ${liquidationOptions.find(o => o.value === plan.liquidationPref)?.label || plan.liquidationPref}`);
    lines.push(`Sale Timeline: ${timelineOptions.find(o => o.value === plan.timelinePref)?.label || plan.timelinePref}`);
    lines.push('');
    if (plan.trustedContacts) { lines.push('-- Trusted Contacts -----------------------------------'); lines.push(plan.trustedContacts); lines.push(''); }
    if (plan.specialInstructions) { lines.push('-- Special Instructions --------------------------------'); lines.push(plan.specialInstructions); lines.push(''); }
    lines.push('-- Tax Information ------------------------------------');
    lines.push('IMPORTANT: Inherited collections receive a "stepped-up"');
    lines.push('cost basis. Heirs do NOT owe capital gains tax on');
    lines.push("appreciation during the original owner's lifetime.");
    lines.push('');
    lines.push(`If sold today by owner: ~${formatCurrency(estimatedTax)} in collectibles tax (28%)`);
    lines.push(`If inherited then sold: ~$0 in capital gains (stepped-up basis)`);
    lines.push(`Potential heir tax savings: ${formatCurrency(steppedUpSavings)}`);
    lines.push('');
    lines.push('-- INSTRUCTIONS FOR HEIRS -----------------------------');
    lines.push('');
    heirInstructions.forEach(h => { lines.push(`${h.icon} ${h.title}`); lines.push(`   ${h.detail}`); lines.push(''); });
    lines.push('-- WHERE TO SELL --------------------------------------');
    sellingGuide.forEach(s => { lines.push(`${s.tier}: ${s.where}`); lines.push(`  Fees: ${s.fee} | Timeline: ${s.timeline}`); });
    lines.push('');
    lines.push('===================================================');
    lines.push('Generated by CardVault Collection Estate Planner');
    lines.push('https://cardvault-two.vercel.app/tools/estate-planner');
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push('===================================================');
    return lines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateDocument());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateDocument()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardvault-estate-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Document Completeness</h3>
        <div className="space-y-2">
          {[
            { label: 'Owner name', done: !!plan.ownerName },
            { label: 'At least one category with value', done: plan.categories.some(c => c.estimatedValue > 0) },
            { label: 'At least one beneficiary', done: plan.beneficiaries.length > 0 },
            { label: 'Beneficiary allocations total 100%', done: plan.beneficiaries.filter(b => b.allocation === 'percentage').reduce((s, b) => s + b.percentage, 0) === 100 || plan.beneficiaries.every(b => b.allocation === 'specific') },
            { label: 'Liquidation preference set', done: !!plan.liquidationPref },
            { label: 'Insurance information', done: !!plan.insuranceProvider },
            { label: 'Trusted contacts listed', done: !!plan.trustedContacts },
            { label: 'Storage locations documented', done: plan.categories.some(c => c.storageLocation && c.estimatedValue > 0) },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={item.done ? 'text-emerald-400' : 'text-gray-600'}>{item.done ? '✓' : '○'}</span>
              <span className={item.done ? 'text-gray-300' : 'text-gray-500'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-3">Tax Implications</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-red-950/30 border border-red-800/30 rounded-lg">
            <div className="text-xs text-red-400 mb-1">If You Sell Today</div>
            <div className="text-xl font-bold text-red-300">{formatCurrency(estimatedTax)}</div>
            <div className="text-xs text-red-400/70 mt-1">28% collectibles capital gains rate</div>
          </div>
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/30 rounded-lg">
            <div className="text-xs text-emerald-400 mb-1">If Heirs Inherit & Sell</div>
            <div className="text-xl font-bold text-emerald-300">~$0</div>
            <div className="text-xs text-emerald-400/70 mt-1">Stepped-up basis eliminates gains</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          *Simplified estimate. Actual tax depends on purchase price, holding period, and state taxes. The stepped-up basis means heirs&apos; cost basis resets to fair market value at date of death. Consult a tax professional.
        </p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Instructions for Your Heirs</h3>
        <div className="space-y-3">
          {heirInstructions.map((h, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
              <span className="text-xl mt-0.5">{h.icon}</span>
              <div>
                <div className="text-sm font-medium text-white">{h.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{h.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Where to Sell by Value Tier</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-800">
                <th className="text-left pb-2 pr-4">Card Value</th>
                <th className="text-left pb-2 pr-4">Where to Sell</th>
                <th className="text-left pb-2 pr-4">Fees</th>
                <th className="text-left pb-2">Timeline</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {sellingGuide.map((s, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-medium text-amber-400 whitespace-nowrap">{s.tier}</td>
                  <td className="py-2 pr-4">{s.where}</td>
                  <td className="py-2 pr-4 text-gray-400">{s.fee}</td>
                  <td className="py-2 text-gray-400">{s.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleCopy} className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors text-sm">
          {copied ? 'Copied to Clipboard!' : 'Copy Estate Document'}
        </button>
        <button onClick={handleDownload} className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors text-sm">
          Download as Text File
        </button>
      </div>

      <p className="text-xs text-gray-600 text-center">
        This tool provides general guidance only and is not legal or tax advice. Consult an estate planning attorney and tax professional for your specific situation.
      </p>
    </div>
  );
}
