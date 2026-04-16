'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GradingCompany {
  id: string;
  name: string;
  fullName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  founded: number;
  headquarters: string;
  totalGraded: string;
  marketShare: string;
  slabDimensions: { width: string; height: string; thickness: string };
  slabFeatures: string[];
  gradeScale: string;
  subgrades: boolean;
  halfGrades: boolean;
  turnaround: { economy: string; standard: string; express: string };
  pricing: { economy: string; standard: string; express: string };
  premiumVsRaw: { gem: string; near: string; mid: string };
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  labelColors: string[];
  securityFeatures: string[];
  crossoverRate: string;
}

const companies: GradingCompany[] = [
  {
    id: 'psa',
    name: 'PSA',
    fullName: 'Professional Sports Authenticator',
    color: 'text-red-400',
    bgColor: 'bg-red-950/30',
    borderColor: 'border-red-800/40',
    founded: 1991,
    headquarters: 'Santa Ana, CA',
    totalGraded: '50M+',
    marketShare: '~52%',
    slabDimensions: { width: '3.5"', height: '5.25"', thickness: '0.5"' },
    slabFeatures: ['Tamper-evident case', 'Holographic label', 'Unique cert number', 'QR code verification', 'UV-reactive logo'],
    gradeScale: '1-10 (Authentic for altered)',
    subgrades: false,
    halfGrades: false,
    turnaround: { economy: '65+ business days', standard: '20 business days', express: '5 business days' },
    pricing: { economy: '$25/card', standard: '$75/card', express: '$150/card' },
    premiumVsRaw: { gem: '3x-10x raw', near: '1.5x-3x raw', mid: '0.8x-1.5x raw' },
    strengths: ['Largest market share = most liquidity', 'Most recognized brand globally', 'Best resale premiums for gem mint', 'Largest population reports', 'Universal acceptance on all platforms'],
    weaknesses: ['No subgrades (less granular)', 'Longer turnaround times', 'Higher cost per card', 'Some concerns about grading consistency', 'No half-point grades'],
    bestFor: ['High-value cards ($100+)', 'Cards you plan to sell', 'Vintage cards (pre-1990)', 'Sports cards in general', 'Maximum liquidity'],
    labelColors: ['Red (standard)', 'Gold (1 of 1 registry)', 'Green (special events)', 'Blue (Gem Mint 10)'],
    securityFeatures: ['UV-reactive PSA logo', 'Holographic strip', 'Tamper-evident seal', 'Unique certification number'],
    crossoverRate: 'N/A (most slabs cross TO PSA)',
  },
  {
    id: 'bgs',
    name: 'BGS',
    fullName: 'Beckett Grading Services',
    color: 'text-blue-400',
    bgColor: 'bg-blue-950/30',
    borderColor: 'border-blue-800/40',
    founded: 1999,
    headquarters: 'Dallas, TX',
    totalGraded: '28M+',
    marketShare: '~18%',
    slabDimensions: { width: '3.5"', height: '5.25"', thickness: '0.6"' },
    slabFeatures: ['Subgrade display', 'Tamper-evident case', 'Serial number', 'Holographic label', 'Thicker protective case'],
    gradeScale: '1-10 (with half-points)',
    subgrades: true,
    halfGrades: true,
    turnaround: { economy: '65+ business days', standard: '20 business days', express: '5 business days' },
    pricing: { economy: '$22/card', standard: '$50/card', express: '$150/card' },
    premiumVsRaw: { gem: '2x-8x raw (9.5)', near: '1.2x-2x raw', mid: '0.7x-1.2x raw' },
    strengths: ['4 subgrades (Centering, Corners, Edges, Surface)', 'Half-point grades for precision', 'Pristine 10 / Black Label for ultimate gem', 'Excellent for modern cards', 'Strong Beckett brand recognition'],
    weaknesses: ['Lower resale premium than PSA on most cards', 'BGS 10 Pristine is harder to achieve than PSA 10', 'Black Labels are extremely rare', 'Thicker slab takes more storage space', 'Less vintage card market presence'],
    bestFor: ['Modern cards (2000+)', 'Cards you want graded precisely', 'Showcasing card quality with subgrades', 'Pokemon and gaming cards', 'Chasing Pristine / Black Label'],
    labelColors: ['Silver (standard)', 'Gold (9.5 Gem Mint)', 'Black (10 Pristine / Black Label)'],
    securityFeatures: ['Holographic label', 'Tamper-evident case', 'Serial number lookup', 'Multi-layer authentication'],
    crossoverRate: '~30-40% cross to PSA successfully',
  },
  {
    id: 'cgc',
    name: 'CGC',
    fullName: 'Certified Guaranty Company',
    color: 'text-green-400',
    bgColor: 'bg-green-950/30',
    borderColor: 'border-green-800/40',
    founded: 2020,
    headquarters: 'Sarasota, FL',
    totalGraded: '15M+',
    marketShare: '~15%',
    slabDimensions: { width: '3.5"', height: '5.25"', thickness: '0.5"' },
    slabFeatures: ['Inner well holder', 'Tamper-evident case', 'CGC hologram', 'Barcode lookup', 'Subgrades available'],
    gradeScale: '1-10 (with half-points)',
    subgrades: true,
    halfGrades: true,
    turnaround: { economy: '45+ business days', standard: '15 business days', express: '5 business days' },
    pricing: { economy: '$18/card', standard: '$40/card', express: '$100/card' },
    premiumVsRaw: { gem: '1.5x-5x raw', near: '1x-2x raw', mid: '0.6x-1x raw' },
    strengths: ['Inner well protects card from movement', 'Lower cost than PSA/BGS', 'Faster turnaround times', 'Strong Pokemon/TCG market presence', 'Growing acceptance on eBay'],
    weaknesses: ['Newer company — less track record', 'Lower resale premiums than PSA', 'Less vintage card expertise', 'Smaller population reports', 'Some slab design criticism'],
    bestFor: ['Pokemon & TCG cards', 'Budget-conscious grading', 'Faster turnaround needs', 'Personal collection (not resale)', 'Modern cards'],
    labelColors: ['Green (standard)', 'Special labels for first editions', 'Event-specific labels'],
    securityFeatures: ['Holographic CGC label', 'Tamper-evident seal', 'Barcode verification', 'Inner well holder'],
    crossoverRate: '~20-30% cross to PSA successfully',
  },
  {
    id: 'sgc',
    name: 'SGC',
    fullName: 'Sportscard Guaranty Corporation',
    color: 'text-amber-400',
    bgColor: 'bg-amber-950/30',
    borderColor: 'border-amber-800/40',
    founded: 1998,
    headquarters: 'Parsippany, NJ',
    totalGraded: '10M+',
    marketShare: '~12%',
    slabDimensions: { width: '3.5"', height: '5.25"', thickness: '0.4"' },
    slabFeatures: ['Tuxedo slab (black background)', 'Thin profile', 'Gold foil label', 'QR verification', 'Minimalist design'],
    gradeScale: '1-10 (whole numbers only)',
    subgrades: false,
    halfGrades: false,
    turnaround: { economy: '30+ business days', standard: '10 business days', express: '3 business days' },
    pricing: { economy: '$17/card', standard: '$35/card', express: '$75/card' },
    premiumVsRaw: { gem: '1.5x-4x raw', near: '1x-1.5x raw', mid: '0.5x-1x raw' },
    strengths: ['Best slab design (Tuxedo is gorgeous)', 'Fastest turnaround times', 'Most affordable pricing', 'Excellent vintage card grading', 'Strictest gem rate (hardest 10)'],
    weaknesses: ['Lowest resale premium of the Big 4', 'Smallest market share', 'No subgrades', 'Less mainstream recognition', 'Fewer eBay filter options'],
    bestFor: ['Vintage cards (pre-1980)', 'Personal collection display', 'Budget grading', 'Cards you want graded strictly', 'Fastest service needed'],
    labelColors: ['Gold on black (Tuxedo standard)', 'Special event labels'],
    securityFeatures: ['Gold foil label', 'QR code verification', 'Tamper-evident construction', 'Holographic element'],
    crossoverRate: '~35-50% cross to PSA (strict grading helps)',
  },
];

const comparisonCategories = [
  { key: 'overview', label: 'Overview' },
  { key: 'grading', label: 'Grading Scale' },
  { key: 'pricing', label: 'Cost & Speed' },
  { key: 'value', label: 'Resale Value' },
  { key: 'slab', label: 'Slab Design' },
  { key: 'bestfor', label: 'Best For' },
];

export default function SlabComparisonClient() {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['psa', 'bgs']);
  const [activeTab, setActiveTab] = useState('overview');

  const toggleCompany = (id: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter(c => c !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const selected = companies.filter(c => selectedCompanies.includes(c.id));

  return (
    <div className="space-y-8">
      {/* Company selector */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-3">Select Companies to Compare (2-4)</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {companies.map(c => (
            <button
              key={c.id}
              onClick={() => toggleCompany(c.id)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                selectedCompanies.includes(c.id)
                  ? `${c.bgColor} ${c.borderColor} ${c.color}`
                  : 'bg-slate-800/30 border-slate-700 text-slate-500 hover:border-slate-500'
              }`}
            >
              {c.name}
              <div className="text-[10px] font-normal mt-0.5 opacity-70">{c.marketShare} market</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {comparisonCategories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
              activeTab === cat.key
                ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Comparison grid */}
      <div className="overflow-x-auto">
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(240px, 1fr))` }}>
          {/* Company headers */}
          {selected.map(c => (
            <div key={c.id} className={`rounded-xl ${c.bgColor} border ${c.borderColor} p-4 text-center`}>
              <div className={`text-2xl font-black ${c.color}`}>{c.name}</div>
              <div className="text-xs text-slate-400 mt-1">{c.fullName}</div>
              <div className="text-xs text-slate-500 mt-0.5">Est. {c.founded} | {c.headquarters}</div>
            </div>
          ))}

          {activeTab === 'overview' && selected.map(c => (
            <div key={c.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div><span className="text-[10px] text-slate-500 block">Total Graded</span><span className="text-sm text-white font-bold">{c.totalGraded}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Market Share</span><span className="text-sm text-white font-bold">{c.marketShare}</span></div>
              <div>
                <span className="text-[10px] text-slate-500 block">Strengths</span>
                <ul className="mt-1 space-y-1">
                  {c.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-emerald-400 flex items-start gap-1"><span className="mt-0.5">+</span> {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Weaknesses</span>
                <ul className="mt-1 space-y-1">
                  {c.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-red-400 flex items-start gap-1"><span className="mt-0.5">-</span> {w}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {activeTab === 'grading' && selected.map(c => (
            <div key={c.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div><span className="text-[10px] text-slate-500 block">Grade Scale</span><span className="text-sm text-white font-bold">{c.gradeScale}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Subgrades?</span><span className={`text-sm font-bold ${c.subgrades ? 'text-emerald-400' : 'text-red-400'}`}>{c.subgrades ? 'Yes (4 categories)' : 'No'}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Half Grades?</span><span className={`text-sm font-bold ${c.halfGrades ? 'text-emerald-400' : 'text-red-400'}`}>{c.halfGrades ? 'Yes' : 'No'}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Crossover Rate to PSA</span><span className="text-sm text-white">{c.crossoverRate}</span></div>
              <div>
                <span className="text-[10px] text-slate-500 block">Label Colors</span>
                <ul className="mt-1 space-y-1">
                  {c.labelColors.map((l, i) => (<li key={i} className="text-xs text-slate-300">{l}</li>))}
                </ul>
              </div>
            </div>
          ))}

          {activeTab === 'pricing' && selected.map(c => (
            <div key={c.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div><span className="text-[10px] text-slate-500 block">Economy</span><span className="text-sm text-white font-bold">{c.pricing.economy}</span><span className="text-[10px] text-slate-500 block mt-0.5">{c.turnaround.economy}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Standard</span><span className="text-sm text-white font-bold">{c.pricing.standard}</span><span className="text-[10px] text-slate-500 block mt-0.5">{c.turnaround.standard}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Express</span><span className="text-sm text-white font-bold">{c.pricing.express}</span><span className="text-[10px] text-slate-500 block mt-0.5">{c.turnaround.express}</span></div>
            </div>
          ))}

          {activeTab === 'value' && selected.map(c => (
            <div key={c.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div><span className="text-[10px] text-slate-500 block">Gem Mint Premium vs Raw</span><span className="text-sm text-emerald-400 font-bold">{c.premiumVsRaw.gem}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Near Mint Premium</span><span className="text-sm text-white font-bold">{c.premiumVsRaw.near}</span></div>
              <div><span className="text-[10px] text-slate-500 block">Mid-Grade Premium</span><span className="text-sm text-slate-400 font-bold">{c.premiumVsRaw.mid}</span></div>
            </div>
          ))}

          {activeTab === 'slab' && selected.map(c => (
            <div key={c.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div><span className="text-[10px] text-slate-500 block">Dimensions</span><span className="text-sm text-white">{c.slabDimensions.width} x {c.slabDimensions.height} x {c.slabDimensions.thickness}</span></div>
              <div>
                <span className="text-[10px] text-slate-500 block">Features</span>
                <ul className="mt-1 space-y-1">
                  {c.slabFeatures.map((f, i) => (<li key={i} className="text-xs text-slate-300">{f}</li>))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Security</span>
                <ul className="mt-1 space-y-1">
                  {c.securityFeatures.map((s, i) => (<li key={i} className="text-xs text-slate-300">{s}</li>))}
                </ul>
              </div>
            </div>
          ))}

          {activeTab === 'bestfor' && selected.map(c => (
            <div key={c.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[10px] text-slate-500 block">Best For</span>
                <ul className="mt-1 space-y-1.5">
                  {c.bestFor.map((b, i) => (
                    <li key={i} className={`text-xs ${c.color} flex items-start gap-1`}><span className="mt-0.5">\u2713</span> {b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick verdict */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Quick Decision Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs"><span className="text-red-400 font-bold">PSA</span> <span className="text-slate-400">if you plan to sell and want maximum resale value</span></div>
            <div className="text-xs"><span className="text-blue-400 font-bold">BGS</span> <span className="text-slate-400">if you want detailed subgrades and chase Pristine/Black Label</span></div>
            <div className="text-xs"><span className="text-green-400 font-bold">CGC</span> <span className="text-slate-400">if you collect Pokemon/TCG or want affordable grading</span></div>
            <div className="text-xs"><span className="text-amber-400 font-bold">SGC</span> <span className="text-slate-400">if you collect vintage or want the best-looking slab</span></div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-slate-400"><strong className="text-white">Selling?</strong> PSA for maximum liquidity</div>
            <div className="text-xs text-slate-400"><strong className="text-white">Personal collection?</strong> SGC for aesthetics, BGS for detail</div>
            <div className="text-xs text-slate-400"><strong className="text-white">On a budget?</strong> SGC economy or CGC economy</div>
            <div className="text-xs text-slate-400"><strong className="text-white">Vintage ($100+)?</strong> PSA or SGC</div>
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator', desc: 'Is grading worth it?' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter', desc: 'Grade equivalents' },
            { href: '/tools/submission-planner', label: 'Submission Planner', desc: 'Plan your submission' },
            { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator', desc: 'Calculate BGS grade' },
            { href: '/tools/turnaround-estimator', label: 'Turnaround Estimator', desc: 'Wait time comparison' },
            { href: '/tools/cert-check', label: 'Cert Verifier', desc: 'Verify slab authenticity' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-indigo-500/50 transition-colors">
              <div className="text-sm font-medium text-white">{t.label}</div>
              <div className="text-xs text-slate-500">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}