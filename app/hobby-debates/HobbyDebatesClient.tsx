'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';

/* ───── Debate Data ───── */
interface Debate {
  id: number;
  title: string;
  category: string;
  sideA: { label: string; arguments: string[]; };
  sideB: { label: string; arguments: string[]; };
  verdict: string;
  verdictSide: 'A' | 'B' | 'split';
}

const debates: Debate[] = [
  {
    id: 1, title: 'PSA vs BGS: Which Grading Company Is Better for Value?', category: 'Grading',
    sideA: { label: 'PSA', arguments: ['Higher resale premiums across virtually every category', 'Largest market share means most buyer confidence', 'Faster turnaround at most service levels', 'Cleaner, simpler slabs that display well'] },
    sideB: { label: 'BGS', arguments: ['Subgrades provide transparency into condition', 'BGS Black Label 10 commands the highest premium of ANY graded card', 'Half-point grading (8.5, 9.5) is more precise', 'Better slab for thicker cards and patches'] },
    verdict: 'PSA wins for most collectors on pure resale value. BGS wins for high-end collectors who want precision. If flipping: PSA. If collecting: BGS.',
    verdictSide: 'split',
  },
  {
    id: 2, title: 'Modern Cards vs Vintage: Where Is the Better ROI?', category: 'Investing',
    sideA: { label: 'Modern (2010+)', arguments: ['Lower barrier to entry — start collecting for under $50', 'Massive player pool with breakout potential every season', 'Liquidity is higher — modern cards sell in hours on eBay', 'Grading infrastructure is built for modern cards'] },
    sideB: { label: 'Vintage (Pre-1980)', arguments: ['Finite supply — they stopped printing these decades ago', 'Historical appreciation data shows consistent 8-12% annual returns', 'Not subject to overproduction risk like modern cards', 'Cultural significance increases over time, never decreases'] },
    verdict: 'Vintage is safer long-term wealth preservation. Modern is higher risk/reward with potential 10x+ returns. Your timeline matters: short-term flip = modern, generational hold = vintage.',
    verdictSide: 'split',
  },
  {
    id: 3, title: 'Football vs Basketball Cards: Which Sport Is a Better Investment?', category: 'Investing',
    sideA: { label: 'Football', arguments: ['NFL is America\'s #1 sport — 16 of the 20 most-watched broadcasts are NFL', 'QB rookies drive massive card demand every April', 'Panini products (Prizm, Select, Optic) are the gold standard', 'Patrick Mahomes Prizm RC went from $30 to $3,000+'] },
    sideB: { label: 'Basketball', arguments: ['Global reach — basketball is popular worldwide, football is not', 'Longer careers (15+ years) mean longer value windows', 'NBA has better player marketing and social media presence', 'Wembanyama, Ant-Man, Luka generation is just beginning'] },
    verdict: 'Football has higher short-term spikes (draft/playoffs) but basketball has better global demand and longer career arcs. Best strategy: own both, weighted toward your knowledge area.',
    verdictSide: 'split',
  },
  {
    id: 4, title: 'Is Chasing PSA 10s Worth It in 2026?', category: 'Grading',
    sideA: { label: 'Yes, chase the 10', arguments: ['PSA 10 commands 3-10x premium over PSA 9 for key cards', 'The "gem mint" standard is universally recognized', 'As population grows, 10s maintain value while 9s decline', 'Auction houses increasingly only feature 10s for modern cards'] },
    sideB: { label: 'No, buy raw or PSA 9', arguments: ['PSA 10 pop counts are exploding — scarcity is eroding', 'Modern QC means PSA 10 is easier to get than ever (60-70% rates)', 'The 10 premium is overinflated — you pay 5x for a 1-point difference', 'Raw cards offer better value and the thrill of submitting yourself'] },
    verdict: 'For vintage and key rookies, PSA 10 premium is justified — those are genuinely scarce. For modern base cards with high pop counts, the premium is increasingly hard to justify. Know the population report before chasing.',
    verdictSide: 'split',
  },
  {
    id: 5, title: 'Hobby Box vs Singles: Which Is the Smarter Buy?', category: 'Strategy',
    sideA: { label: 'Hobby Box', arguments: ['The thrill of the rip — pulling a card yourself is the best feeling in the hobby', 'Guaranteed autos/relics provide floor value', 'You might pull a 1/1 or numbered parallel worth 10x the box', 'Opening content drives social media engagement and community'] },
    sideB: { label: 'Buy Singles', arguments: ['Expected value of most boxes is negative — you lose money on average', 'You can target exactly the player and card you want', 'No gamble — you know exactly what you are getting', 'Money goes further: one box = 3-5 targeted singles'] },
    verdict: 'Mathematically, singles are almost always the better value play. But if you budget for entertainment (treat boxes like a movie ticket, not an investment), ripping is one of the great joys of the hobby.',
    verdictSide: 'B',
  },
  {
    id: 6, title: 'Rookie Cards vs 2nd Year Cards: Which Appreciates More?', category: 'Investing',
    sideA: { label: 'Rookie Cards', arguments: ['First-year cards are the industry standard for value', 'RC designation drives 90% of the card market for modern players', 'Panini Prizm, Topps Chrome RCs are the benchmark cards', 'Rookie premium exists across all sports and eras'] },
    sideB: { label: '2nd Year Cards', arguments: ['2nd year cards are 50-80% cheaper with similar upside if player breaks out', 'No one cares about the RC logo in 10 years — they care about the player', 'Better card photography and design after year 1', 'Lower entry point means you can buy more copies for diversification'] },
    verdict: 'Rookie cards dominate resale and collector sentiment. 2nd year cards can be a value play, but the RC premium is real and persistent. If you can only buy one card of a player, buy the RC.',
    verdictSide: 'A',
  },
  {
    id: 7, title: 'Topps Chrome vs Panini Prizm: Which Is the Better Product?', category: 'Products',
    sideA: { label: 'Topps Chrome', arguments: ['Topps has the MLB and now NFL license — only licensed option', 'Chrome technology since 1996 — proven, trusted, collectible', 'Refractors are the original chromium parallels', 'Better photography and card design consistency'] },
    sideB: { label: 'Panini Prizm', arguments: ['Prizm Silver is the most iconic modern parallel in the hobby', 'Color parallels (Green, Blue, Red, Gold) are highly desirable', 'Prizm Basketball is the undisputed king of basketball cards', 'Better hit rates in hobby boxes (more autos, more parallels)'] },
    verdict: 'This depends entirely on sport. Baseball: Topps Chrome (no competition). Basketball: Prizm (king of the mountain). Football: Prizm historically, but Topps is entering the market in 2026+. Both are blue-chip products.',
    verdictSide: 'split',
  },
  {
    id: 8, title: 'Card Shows vs Online Buying: Which Is Better?', category: 'Strategy',
    sideA: { label: 'Card Shows', arguments: ['Negotiate in person — dealers will deal at the end of the day', 'See the card in hand before buying (centering, surface, edges)', 'No shipping costs, no shipping damage risk', 'Discovery — find cards you didn\'t know you wanted'] },
    sideB: { label: 'Online (eBay/COMC)', arguments: ['Infinitely larger selection — find any card from any era', 'Price comparison across thousands of sellers instantly', 'Buy at 2am in your pajamas — convenience is unmatched', 'eBay buyer protection and money-back guarantees'] },
    verdict: 'Serious collectors do both. Card shows for deals, networking, and raw cards. Online for specific targeted buys, price comparison, and convenience. The best collectors arbitrage between the two.',
    verdictSide: 'split',
  },
  {
    id: 9, title: 'Should You Invest in Hockey Cards?', category: 'Investing',
    sideA: { label: 'Yes, buy hockey', arguments: ['Hockey cards are undervalued relative to other sports', 'Upper Deck Young Guns program is one of the best RC programs in any sport', 'McDavid, Bedard, and Celebrini are generational talents driving new interest', 'Smaller collector base = less competition for key cards'] },
    sideB: { label: 'No, avoid hockey', arguments: ['Smaller market means lower liquidity — harder to sell', 'NHL has lowest TV ratings of the big 4 sports', 'Upper Deck monopoly limits product variety', 'Price ceiling is much lower than football or basketball'] },
    verdict: 'Hockey cards are a niche play with genuine upside for patient collectors. The lack of competition means better entry prices, but the smaller market means longer sell times. Best for collectors who actually follow the sport.',
    verdictSide: 'split',
  },
  {
    id: 10, title: 'Sealed Wax vs Graded Singles: Best Store of Value?', category: 'Investing',
    sideA: { label: 'Sealed Wax', arguments: ['Sealed product appreciates consistently over 5-10 year windows', 'No condition risk — the product is factory sealed', 'Potential for massive ROI if key rookie emerges from that set', '1990s sealed wax has appreciated 5-20x in the last decade'] },
    sideB: { label: 'Graded Singles', arguments: ['You know exactly what you own — no mystery, no gambling', 'Liquid market with established comps for every card', 'Can target specific players you believe in', 'Easier to store and insure than cases of wax'] },
    verdict: 'Both are valid wealth preservation strategies. Sealed wax is a bet on future rookies and scarcity. Graded singles are a bet on specific players. Best collectors own both — sealed wax as a long-term lottery, singles as targeted conviction plays.',
    verdictSide: 'split',
  },
  {
    id: 11, title: 'Are Pokémon Cards a Good Investment in 2026?', category: 'Investing',
    sideA: { label: 'Yes, buy Pokémon', arguments: ['Pokémon is the #1 grossing franchise in human history ($150B+)', 'Nostalgia wave from millennials now earning real money', 'Global demand — Pokémon is huge in Japan, Europe, and Americas', 'Base Set Charizard went from $200 to $40,000+ in 5 years'] },
    sideB: { label: 'No, Pokémon is peaked', arguments: ['Print runs have increased massively since 2020', 'Prices already corrected 40-60% from 2021 peaks', 'New sets release every quarter — constant dilution', 'Sports cards have real-world performance catalysts; Pokémon does not'] },
    verdict: 'Vintage Pokémon (1999-2003) remains a solid store of value. Modern Pokémon is a riskier play due to high print runs. The brand is indestructible, but not every card from every set will appreciate.',
    verdictSide: 'split',
  },
  {
    id: 12, title: 'Is Card Collecting a Legitimate Investment Strategy?', category: 'Philosophy',
    sideA: { label: 'Yes, it\'s an asset class', arguments: ['Alternative assets are mainstream — art, wine, sneakers, cards', 'Top-end cards have outperformed the S&P 500 over 20-year periods', 'Portfolio diversification benefits from non-correlated assets', 'Professional auction houses (Heritage, Goldin) bring institutional credibility'] },
    sideB: { label: 'No, it\'s a hobby', arguments: ['No dividends, no yield, no cash flow — just price speculation', 'Massive transaction costs (eBay 13%, auction 20%+ buyer premium)', 'Illiquid compared to stocks — selling takes days to weeks', 'Subject to manipulation, fads, and unpredictable market shifts'] },
    verdict: 'Cards can be PART of an investment strategy, but should never be the majority of a portfolio. Treat your top-end cards as alternative assets. Treat everything else as entertainment spending. The joy of collecting is the real return.',
    verdictSide: 'split',
  },
];

/* ───── Utilities ───── */
function dateHash(dateStr: string): number {
  let hash = 0;
  const str = 'cardvault-debate-' + dateStr;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const STORAGE_KEY = 'cardvault-debate-votes';

interface VoteData {
  [debateId: number]: 'A' | 'B';
}

function loadVotes(): VoteData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return {};
}

function saveVotes(votes: VoteData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(votes)); } catch { /* noop */ }
}

const categoryIcons: Record<string, string> = {
  Grading: '\u2696\ufe0f',
  Investing: '\ud83d\udcc8',
  Strategy: '\ud83c\udfaf',
  Products: '\ud83d\udce6',
  Philosophy: '\ud83e\udde0',
};

const categoryColors: Record<string, string> = {
  Grading: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  Investing: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40',
  Strategy: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  Products: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  Philosophy: 'bg-rose-900/40 text-rose-300 border-rose-700/40',
};

export default function HobbyDebatesClient() {
  const [votes, setVotes] = useState<VoteData>({});
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { setVotes(loadVotes()); }, []);

  /* ───── Weekly featured debate (deterministic) ───── */
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-W${Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)}`;
  }, []);
  const featuredId = useMemo(() => {
    const hash = dateHash(today);
    return debates[hash % debates.length].id;
  }, [today]);

  /* ───── Filter ───── */
  const categories = useMemo(() => [...new Set(debates.map(d => d.category))], []);
  const filtered = useMemo(() => {
    if (filter === 'all') return debates;
    return debates.filter(d => d.category === filter);
  }, [filter]);

  /* ───── Vote handler ───── */
  const handleVote = useCallback((debateId: number, side: 'A' | 'B') => {
    setVotes(prev => {
      const updated = { ...prev, [debateId]: side };
      saveVotes(updated);
      return updated;
    });
  }, []);

  /* ───── Stats ───── */
  const totalVoted = Object.keys(votes).length;
  const aVotes = Object.values(votes).filter(v => v === 'A').length;
  const bVotes = Object.values(votes).filter(v => v === 'B').length;

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{debates.length}</div>
          <div className="text-xs text-gray-400">Total Debates</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalVoted}</div>
          <div className="text-xs text-gray-400">Your Votes</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{totalVoted > 0 ? `${aVotes}-${bVotes}` : '—'}</div>
          <div className="text-xs text-gray-400">Side A vs B</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >All ({debates.length})</button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === cat ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {categoryIcons[cat]} {cat} ({debates.filter(d => d.category === cat).length})
          </button>
        ))}
      </div>

      {/* Debate cards */}
      <div className="space-y-4">
        {filtered.map(debate => {
          const isFeatured = debate.id === featuredId;
          const userVote = votes[debate.id];
          const isExpanded = expanded === debate.id;

          return (
            <div key={debate.id} className={`rounded-xl border p-5 transition-all ${isFeatured ? 'border-amber-700/60 bg-gradient-to-br from-amber-950/30 to-orange-950/20' : 'border-gray-800/50 bg-gray-900/40 hover:border-gray-700/60'}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  {isFeatured && (
                    <span className="text-xs font-medium text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full mb-2 inline-block">
                      Featured This Week
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-white leading-tight">{debate.title}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${categoryColors[debate.category] || 'bg-gray-800 text-gray-400'}`}>
                  {categoryIcons[debate.category]} {debate.category}
                </span>
              </div>

              {/* Two-side voting */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => handleVote(debate.id, 'A')}
                  className={`p-3 rounded-lg border text-left transition-all ${userVote === 'A' ? 'border-emerald-600 bg-emerald-950/40 ring-1 ring-emerald-600' : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600'}`}
                >
                  <div className="text-sm font-bold text-white mb-1">{debate.sideA.label}</div>
                  <div className="text-xs text-gray-400">{debate.sideA.arguments[0]}</div>
                  {userVote === 'A' && <div className="text-emerald-400 text-xs mt-1 font-medium">Your vote</div>}
                </button>
                <button
                  onClick={() => handleVote(debate.id, 'B')}
                  className={`p-3 rounded-lg border text-left transition-all ${userVote === 'B' ? 'border-blue-600 bg-blue-950/40 ring-1 ring-blue-600' : 'border-gray-700/50 bg-gray-800/40 hover:border-gray-600'}`}
                >
                  <div className="text-sm font-bold text-white mb-1">{debate.sideB.label}</div>
                  <div className="text-xs text-gray-400">{debate.sideB.arguments[0]}</div>
                  {userVote === 'B' && <div className="text-blue-400 text-xs mt-1 font-medium">Your vote</div>}
                </button>
              </div>

              {/* Expand/collapse */}
              <button
                onClick={() => setExpanded(isExpanded ? null : debate.id)}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                {isExpanded ? 'Hide arguments' : 'See full arguments & verdict'}
                <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9662;</span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-4 space-y-4">
                  {/* Side A arguments */}
                  <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-emerald-400 mb-2">Case for {debate.sideA.label}</h4>
                    <ul className="space-y-1.5">
                      {debate.sideA.arguments.map((arg, i) => (
                        <li key={i} className="text-sm text-gray-300 flex gap-2">
                          <span className="text-emerald-500 shrink-0">+</span> {arg}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Side B arguments */}
                  <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">Case for {debate.sideB.label}</h4>
                    <ul className="space-y-1.5">
                      {debate.sideB.arguments.map((arg, i) => (
                        <li key={i} className="text-sm text-gray-300 flex gap-2">
                          <span className="text-blue-500 shrink-0">+</span> {arg}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Verdict */}
                  <div className="bg-gray-800/60 border border-gray-700/40 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-amber-400 mb-2">
                      The Verdict {debate.verdictSide === 'A' ? `(${debate.sideA.label})` : debate.verdictSide === 'B' ? `(${debate.sideB.label})` : '(It Depends)'}
                    </h4>
                    <p className="text-sm text-gray-300">{debate.verdict}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Related links */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/grade-or-fade" className="text-blue-400 hover:text-blue-300">Grade or Fade</Link>
        <span className="text-gray-600">|</span>
        <Link href="/guides" className="text-blue-400 hover:text-blue-300">Collector Guides</Link>
        <span className="text-gray-600">|</span>
        <Link href="/tools/grading-roi" className="text-blue-400 hover:text-blue-300">Grading ROI Calculator</Link>
        <span className="text-gray-600">|</span>
        <Link href="/market-sentiment" className="text-blue-400 hover:text-blue-300">Market Sentiment</Link>
        <span className="text-gray-600">|</span>
        <Link href="/news" className="text-blue-400 hover:text-blue-300">Hobby News</Link>
      </div>
    </div>
  );
}
