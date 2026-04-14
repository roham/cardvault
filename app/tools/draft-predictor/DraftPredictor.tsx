'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DraftProspect {
  name: string;
  position: string;
  school: string;
  sport: 'football' | 'basketball' | 'baseball' | 'hockey';
  projectedPick: string;
  cardImpact: 'high' | 'medium' | 'low';
  keyCards: string[];
  preDraftValue: string;
  projectedPostDraftValue: string;
  spikeChance: number; // 0-100
  analysis: string;
  riskLevel: 'low' | 'medium' | 'high';
  searchQuery: string;
}

const nflDraft2025: DraftProspect[] = [
  {
    name: 'Shedeur Sanders',
    position: 'QB',
    school: 'Colorado',
    sport: 'football',
    projectedPick: 'Top 3',
    cardImpact: 'high',
    keyCards: ['2025 Prizm RC', '2025 Optic RC', 'Bowman University Chrome'],
    preDraftValue: '$5-20 (Bowman U)',
    projectedPostDraftValue: '$30-100+',
    spikeChance: 85,
    analysis: 'Franchise QB to a major market = massive card demand. The Sanders name adds extra celebrity appeal. QBs drive the football card market more than any position.',
    riskLevel: 'medium',
    searchQuery: 'shedeur+sanders+rookie+card',
  },
  {
    name: 'Cam Ward',
    position: 'QB',
    school: 'Miami',
    sport: 'football',
    projectedPick: 'Top 5',
    cardImpact: 'high',
    keyCards: ['2025 Prizm RC', '2025 Optic RC', 'Bowman University Chrome'],
    preDraftValue: '$5-15 (Bowman U)',
    projectedPostDraftValue: '$25-80+',
    spikeChance: 80,
    analysis: 'Big arm, big personality, Miami pedigree. If drafted by a large-market team, expect an immediate spike. Two-year starter with electric highlights.',
    riskLevel: 'medium',
    searchQuery: 'cam+ward+rookie+card',
  },
  {
    name: 'Travis Hunter',
    position: 'WR/CB',
    school: 'Colorado',
    sport: 'football',
    projectedPick: 'Top 3',
    cardImpact: 'high',
    keyCards: ['2025 Prizm RC', '2025 Select RC', 'Bowman University Chrome'],
    preDraftValue: '$10-30 (Bowman U)',
    projectedPostDraftValue: '$40-150+',
    spikeChance: 90,
    analysis: 'Heisman winner and the most unique prospect in decades — plays both offense and defense at an elite level. Two-way players are unprecedented in the modern NFL. Historic upside.',
    riskLevel: 'low',
    searchQuery: 'travis+hunter+rookie+card',
  },
  {
    name: 'Abdul Carter',
    position: 'EDGE',
    school: 'Penn State',
    sport: 'football',
    projectedPick: 'Top 5',
    cardImpact: 'medium',
    keyCards: ['2025 Prizm RC', 'Bowman University Chrome'],
    preDraftValue: '$3-10',
    projectedPostDraftValue: '$10-30',
    spikeChance: 60,
    analysis: 'Elite pass rusher, but defensive players historically have lower card demand than QBs and skill positions. Landing spot matters — a Cowboys or Steelers pick adds market premium.',
    riskLevel: 'medium',
    searchQuery: 'abdul+carter+rookie+card',
  },
  {
    name: 'Tetairoa McMillan',
    position: 'WR',
    school: 'Arizona',
    sport: 'football',
    projectedPick: 'Top 10',
    cardImpact: 'medium',
    keyCards: ['2025 Prizm RC', 'Bowman University Chrome'],
    preDraftValue: '$3-10',
    projectedPostDraftValue: '$15-50',
    spikeChance: 70,
    analysis: 'Elite size-speed combo (6\'5", 4.4 speed). WR1 prospect who drew Julio Jones comparisons. If he lands with a franchise QB, his cards will explode.',
    riskLevel: 'medium',
    searchQuery: 'tetairoa+mcmillan+rookie+card',
  },
  {
    name: 'Mason Graham',
    position: 'DT',
    school: 'Michigan',
    sport: 'football',
    projectedPick: 'Top 5',
    cardImpact: 'low',
    keyCards: ['2025 Prizm RC'],
    preDraftValue: '$2-5',
    projectedPostDraftValue: '$5-15',
    spikeChance: 30,
    analysis: 'Best DT in the class and possibly the best player overall, but interior defensive linemen rarely move the card market. Buy for the collection, not the investment.',
    riskLevel: 'high',
    searchQuery: 'mason+graham+rookie+card',
  },
];

const nbaDraft2025: DraftProspect[] = [
  {
    name: 'Cooper Flagg',
    position: 'F',
    school: 'Duke',
    sport: 'basketball',
    projectedPick: '#1 Overall',
    cardImpact: 'high',
    keyCards: ['2025-26 Prizm RC', '2025-26 Select RC', 'Bowman University Best'],
    preDraftValue: '$10-40 (Bowman U)',
    projectedPostDraftValue: '$50-200+',
    spikeChance: 95,
    analysis: 'The most hyped prospect since Wembanyama. Flagg at 6\'9" with guard skills is the consensus #1 pick. His Duke pedigree adds collector appeal. Cards will spike immediately on draft night.',
    riskLevel: 'low',
    searchQuery: 'cooper+flagg+rookie+card',
  },
  {
    name: 'Dylan Harper',
    position: 'G',
    school: 'Rutgers',
    sport: 'basketball',
    projectedPick: 'Top 3',
    cardImpact: 'high',
    keyCards: ['2025-26 Prizm RC', 'Bowman University Best'],
    preDraftValue: '$5-15',
    projectedPostDraftValue: '$20-60+',
    spikeChance: 75,
    analysis: 'Elite scorer with NBA-ready body. Harper has been linked to the Wizards — a #2 overall pick guarantees Prizm Silver demand. High school teammate of Ace Bailey adds narrative.',
    riskLevel: 'medium',
    searchQuery: 'dylan+harper+rookie+card',
  },
  {
    name: 'Ace Bailey',
    position: 'F',
    school: 'Rutgers',
    sport: 'basketball',
    projectedPick: 'Top 3',
    cardImpact: 'high',
    keyCards: ['2025-26 Prizm RC', 'Bowman University Best'],
    preDraftValue: '$5-15',
    projectedPostDraftValue: '$20-60+',
    spikeChance: 75,
    analysis: 'Long, athletic wing with elite scoring upside. The Harper-Bailey Rutgers connection is a storyline collectors love. Two top-3 picks from the same school = dual narrative.',
    riskLevel: 'medium',
    searchQuery: 'ace+bailey+rookie+card',
  },
  {
    name: 'VJ Edgecombe',
    position: 'G',
    school: 'Baylor',
    sport: 'basketball',
    projectedPick: 'Top 10',
    cardImpact: 'medium',
    keyCards: ['2025-26 Prizm RC'],
    preDraftValue: '$3-10',
    projectedPostDraftValue: '$10-30',
    spikeChance: 55,
    analysis: 'Explosive Bahamian guard with highlight-reel dunks. International players often have dedicated collector bases. Landing spot will determine spike magnitude.',
    riskLevel: 'medium',
    searchQuery: 'vj+edgecombe+rookie+card',
  },
];

const sportTabs = [
  { id: 'nfl', label: 'NFL Draft 2025', icon: '🏈', data: nflDraft2025 },
  { id: 'nba', label: 'NBA Draft 2025', icon: '🏀', data: nbaDraft2025 },
];

const impactColors: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-emerald-900/30', text: 'text-emerald-400' },
  medium: { bg: 'bg-amber-900/30', text: 'text-amber-400' },
  low: { bg: 'bg-gray-800', text: 'text-gray-400' },
};

const riskColors: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-emerald-900/30', text: 'text-emerald-400' },
  medium: { bg: 'bg-amber-900/30', text: 'text-amber-400' },
  high: { bg: 'bg-red-900/30', text: 'text-red-400' },
};

export default function DraftPredictor() {
  const [activeTab, setActiveTab] = useState('nfl');
  const activeSport = sportTabs.find(t => t.id === activeTab)!;
  const [selectedProspect, setSelectedProspect] = useState<DraftProspect | null>(null);

  return (
    <div className="space-y-6">
      {/* Sport tabs */}
      <div className="flex gap-2">
        {sportTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSelectedProspect(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Prospect cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeSport.data.map(prospect => {
          const impact = impactColors[prospect.cardImpact];
          const risk = riskColors[prospect.riskLevel];
          return (
            <button
              key={prospect.name}
              onClick={() => setSelectedProspect(selectedProspect?.name === prospect.name ? null : prospect)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedProspect?.name === prospect.name
                  ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${impact.bg} ${impact.text}`}>
                  {prospect.cardImpact.toUpperCase()} impact
                </span>
                <span className="text-xs text-gray-500">{prospect.projectedPick}</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-0.5">{prospect.name}</h3>
              <p className="text-gray-500 text-xs">{prospect.position} &middot; {prospect.school}</p>

              {/* Spike meter */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Card Spike Probability</span>
                  <span className={prospect.spikeChance >= 70 ? 'text-emerald-400' : prospect.spikeChance >= 40 ? 'text-amber-400' : 'text-gray-400'}>
                    {prospect.spikeChance}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className={`rounded-full h-1.5 transition-all ${
                      prospect.spikeChance >= 70 ? 'bg-emerald-500' : prospect.spikeChance >= 40 ? 'bg-amber-500' : 'bg-gray-600'
                    }`}
                    style={{ width: `${prospect.spikeChance}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className="text-gray-500">Pre: <span className="text-gray-300">{prospect.preDraftValue}</span></span>
                <span className="text-gray-600">-&gt;</span>
                <span className="text-gray-500">Post: <span className="text-emerald-400">{prospect.projectedPostDraftValue}</span></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected prospect detail */}
      {selectedProspect && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{selectedProspect.name}</h3>
              <p className="text-gray-400 text-sm">
                {selectedProspect.position} &middot; {selectedProspect.school} &middot; Projected {selectedProspect.projectedPick}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${riskColors[selectedProspect.riskLevel].bg} ${riskColors[selectedProspect.riskLevel].text}`}>
              {selectedProspect.riskLevel} risk
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Pre-Draft Value</p>
              <p className="text-white font-bold">{selectedProspect.preDraftValue}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Post-Draft Value</p>
              <p className="text-emerald-400 font-bold">{selectedProspect.projectedPostDraftValue}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Spike Chance</p>
              <p className="text-white font-bold">{selectedProspect.spikeChance}%</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Card Impact</p>
              <p className={`font-bold ${impactColors[selectedProspect.cardImpact].text}`}>
                {selectedProspect.cardImpact.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-2">Analysis</h4>
            <p className="text-gray-300 text-sm leading-relaxed">{selectedProspect.analysis}</p>
          </div>

          <div className="mb-6">
            <h4 className="text-white font-semibold text-sm mb-2">Key Cards to Watch</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProspect.keyCards.map(card => (
                <span key={card} className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700">
                  {card}
                </span>
              ))}
            </div>
          </div>

          <a
            href={`https://www.ebay.com/sch/i.html?_nkw=${selectedProspect.searchQuery}&LH_Sold=1&LH_Complete=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium transition-colors"
          >
            Check eBay Sold Prices
          </a>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-4">
        <p className="text-amber-300/80 text-sm">
          <strong>Disclaimer:</strong> Draft predictions and card value projections are estimates based on historical draft class data, current market trends, and consensus mock drafts. Actual card values will vary based on draft position, landing spot, and market conditions. This is not financial advice.
        </p>
      </div>
    </div>
  );
}
