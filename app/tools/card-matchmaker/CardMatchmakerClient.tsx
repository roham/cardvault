'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import type { SportsCard } from '@/data/sports-cards';

const sportIcons: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

const sportColors: Record<string, string> = {
  baseball: 'rose', basketball: 'orange', football: 'emerald', hockey: 'sky',
};

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

interface MatchResult {
  card: SportsCard;
  score: number;
  dimensions: { name: string; score: number; weight: number; reason: string }[];
  topReason: string;
}

function getSetFamily(set: string): string {
  const lower = set.toLowerCase();
  if (lower.includes('topps chrome')) return 'topps-chrome';
  if (lower.includes('bowman chrome')) return 'bowman-chrome';
  if (lower.includes('bowman')) return 'bowman';
  if (lower.includes('topps')) return 'topps';
  if (lower.includes('prizm')) return 'prizm';
  if (lower.includes('donruss optic')) return 'donruss-optic';
  if (lower.includes('donruss')) return 'donruss';
  if (lower.includes('select')) return 'select';
  if (lower.includes('mosaic')) return 'mosaic';
  if (lower.includes('panini')) return 'panini';
  if (lower.includes('fleer')) return 'fleer';
  if (lower.includes('upper deck')) return 'upper-deck';
  if (lower.includes('goudey')) return 'goudey';
  if (lower.includes('national treasures')) return 'national-treasures';
  if (lower.includes('sp authentic')) return 'sp-authentic';
  if (lower.includes('young guns')) return 'upper-deck';
  return lower.split(' ').slice(0, 2).join('-');
}

function getPosition(card: SportsCard): string {
  const desc = card.description.toLowerCase();
  const player = card.player.toLowerCase();
  if (card.sport === 'baseball') {
    if (desc.includes('pitcher') || desc.includes('cy young') || desc.includes(' k ') || desc.includes('strikeout') || desc.includes('era ') || desc.includes('lefty') || desc.includes('righty') || desc.includes('closer') || desc.includes('reliever')) return 'pitcher';
    if (desc.includes('catcher') || desc.includes(' c,') || desc.includes(' c ')) return 'catcher';
    if (desc.includes('shortstop') || desc.includes(' ss')) return 'infielder';
    if (desc.includes('outfield') || desc.includes(' of ') || desc.includes(' cf ') || desc.includes(' rf ') || desc.includes(' lf ')) return 'outfielder';
    return 'position-player';
  }
  if (card.sport === 'basketball') {
    if (desc.includes('point guard') || desc.includes(' pg') || desc.includes('playmaker')) return 'guard';
    if (desc.includes('shooting guard') || desc.includes(' sg')) return 'guard';
    if (desc.includes('center') || desc.includes(' c ') || desc.includes('big man')) return 'big';
    if (desc.includes('forward') || desc.includes(' pf') || desc.includes(' sf')) return 'forward';
    return 'wing';
  }
  if (card.sport === 'football') {
    if (desc.includes('quarterback') || desc.includes(' qb')) return 'qb';
    if (desc.includes('running back') || desc.includes(' rb') || desc.includes('rushing')) return 'rb';
    if (desc.includes('wide receiver') || desc.includes(' wr') || desc.includes('receiver') || desc.includes('receiving')) return 'wr';
    if (desc.includes('tight end') || desc.includes(' te')) return 'te';
    if (desc.includes('defensive end') || desc.includes(' de ') || desc.includes('edge') || desc.includes('sack')) return 'edge';
    if (desc.includes('linebacker') || desc.includes(' lb') || desc.includes(' olb') || desc.includes(' ilb')) return 'lb';
    if (desc.includes('cornerback') || desc.includes(' cb') || desc.includes('interception')) return 'db';
    if (desc.includes('safety') || desc.includes(' s,')) return 'db';
    if (desc.includes('offensive line') || desc.includes(' ot') || desc.includes(' og') || desc.includes('tackle') || desc.includes('guard')) return 'ol';
    if (desc.includes('kicker') || desc.includes('field goal')) return 'k';
    return 'defense';
  }
  if (card.sport === 'hockey') {
    if (desc.includes('goalie') || desc.includes('goaltend') || desc.includes('netmind') || desc.includes('saves') || desc.includes('gaa') || desc.includes('shutout')) return 'goalie';
    if (desc.includes('defenseman') || desc.includes('d-man') || desc.includes('blue line') || desc.includes('norris')) return 'defenseman';
    if (desc.includes('center') || desc.includes('faceoff')) return 'center';
    if (desc.includes('wing') || desc.includes('winger') || desc.includes(' lw') || desc.includes(' rw')) return 'wing';
    return 'forward';
  }
  return 'unknown';
}

function getInvestmentProfile(card: SportsCard): string {
  const rawVal = parseValue(card.estimatedValueRaw);
  const gemVal = parseValue(card.estimatedValueGem);
  const age = 2026 - card.year;
  const gradingMult = gemVal > 0 && rawVal > 0 ? gemVal / rawVal : 1;

  if (card.rookie && age <= 5 && rawVal < 50) return 'speculative-rookie';
  if (card.rookie && rawVal >= 100) return 'blue-chip-rookie';
  if (card.rookie) return 'rookie-value';
  if (age >= 50 && rawVal >= 500) return 'vintage-premium';
  if (age >= 50) return 'vintage-affordable';
  if (age >= 20 && age < 50) return 'mid-era';
  if (gradingMult >= 5) return 'grading-play';
  if (rawVal >= 200) return 'high-value';
  return 'modern-base';
}

function findMatches(selected: SportsCard, allCards: SportsCard[]): MatchResult[] {
  const selectedRaw = parseValue(selected.estimatedValueRaw);
  const selectedPos = getPosition(selected);
  const selectedFamily = getSetFamily(selected.set);
  const selectedProfile = getInvestmentProfile(selected);

  const candidates = allCards.filter(c => c.slug !== selected.slug);
  const scored: MatchResult[] = [];

  for (const card of candidates) {
    const dims: { name: string; score: number; weight: number; reason: string }[] = [];

    // 1. Same Player (25%)
    const samePlayer = card.player === selected.player;
    dims.push({
      name: 'Same Player',
      score: samePlayer ? 100 : 0,
      weight: 25,
      reason: samePlayer ? `Another ${selected.player} card — different year/set` : 'Different player',
    });

    // 2. Era Match (20%) — closeness in year
    const yearDiff = Math.abs(card.year - selected.year);
    const eraScore = yearDiff === 0 ? 100 : yearDiff <= 2 ? 85 : yearDiff <= 5 ? 65 : yearDiff <= 10 ? 40 : yearDiff <= 20 ? 20 : 5;
    dims.push({
      name: 'Era Match',
      score: eraScore,
      weight: 20,
      reason: yearDiff === 0 ? 'Same year' : yearDiff <= 5 ? `Within ${yearDiff} years (${card.year})` : `${card.year} — ${yearDiff} years apart`,
    });

    // 3. Value Match (20%) — closeness in price
    const cardRaw = parseValue(card.estimatedValueRaw);
    const ratio = selectedRaw > 0 && cardRaw > 0 ? Math.min(selectedRaw, cardRaw) / Math.max(selectedRaw, cardRaw) : 0;
    const valScore = ratio >= 0.8 ? 100 : ratio >= 0.5 ? 75 : ratio >= 0.25 ? 50 : ratio >= 0.1 ? 25 : 10;
    dims.push({
      name: 'Value Match',
      score: valScore,
      weight: 20,
      reason: `$${cardRaw.toLocaleString()} raw — ${ratio >= 0.5 ? 'similar price range' : ratio >= 0.25 ? 'comparable tier' : 'different price tier'}`,
    });

    // 4. Position/Role Match (15%)
    const cardPos = getPosition(card);
    const sameSport = card.sport === selected.sport;
    const samePos = cardPos === selectedPos && sameSport;
    const posScore = samePos ? 100 : sameSport ? 40 : 10;
    dims.push({
      name: 'Position Match',
      score: posScore,
      weight: 15,
      reason: samePos ? `Same position (${cardPos}) in ${card.sport}` : sameSport ? `Same sport (${card.sport}), different position` : `Different sport (${card.sport})`,
    });

    // 5. Set Family (10%)
    const cardFamily = getSetFamily(card.set);
    const sameSet = card.set === selected.set;
    const sameFamily = cardFamily === selectedFamily;
    const setScore = sameSet ? 100 : sameFamily ? 70 : 10;
    dims.push({
      name: 'Set Family',
      score: setScore,
      weight: 10,
      reason: sameSet ? `Same set: ${card.set}` : sameFamily ? `Related product line` : card.set,
    });

    // 6. Investment Profile (10%)
    const cardProfile = getInvestmentProfile(card);
    const sameProfile = cardProfile === selectedProfile;
    const bothRookie = card.rookie && selected.rookie;
    const profScore = sameProfile ? 100 : bothRookie ? 70 : (card.rookie === selected.rookie) ? 50 : 20;
    dims.push({
      name: 'Investment Profile',
      score: profScore,
      weight: 10,
      reason: sameProfile ? `Same profile: ${cardProfile.replace(/-/g, ' ')}` : bothRookie ? 'Both rookie cards' : card.rookie ? 'Rookie card' : 'Similar investment characteristics',
    });

    // Overall weighted score
    const total = dims.reduce((s, d) => s + d.score * d.weight, 0) / 100;

    // Top reason = highest scoring non-trivial dimension
    const sortedDims = [...dims].sort((a, b) => b.score * b.weight - a.score * a.weight);
    const topReason = sortedDims[0].score > 0 ? sortedDims[0].reason : sortedDims[1].reason;

    scored.push({ card, score: Math.round(total), dimensions: dims, topReason });
  }

  // Sort by score descending, take top 8. Deduplicate players (max 2 cards per player)
  scored.sort((a, b) => b.score - a.score);
  const results: MatchResult[] = [];
  const playerCounts: Record<string, number> = {};

  for (const m of scored) {
    const p = m.card.player;
    const count = playerCounts[p] || 0;
    if (count >= 2) continue; // max 2 cards per player
    playerCounts[p] = count + 1;
    results.push(m);
    if (results.length >= 8) break;
  }

  return results;
}

function MatchBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : score >= 40 ? 'bg-orange-500' : 'bg-gray-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-500">{score}</span>
    </div>
  );
}

export default function CardMatchmakerClient() {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<SportsCard | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filteredCards = useMemo(() => {
    if (!search) return [];
    let cards = [...sportsCards];
    if (sportFilter !== 'all') cards = cards.filter(c => c.sport === sportFilter);
    const q = search.toLowerCase();
    cards = cards.filter(c => c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q));
    return cards.sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw)).slice(0, 20);
  }, [search, sportFilter]);

  const matches = useMemo(() => {
    if (!selectedCard) return [];
    return findMatches(selectedCard, sportsCards);
  }, [selectedCard]);

  return (
    <div>
      {/* Search Section */}
      <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">Select a Card You Like</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex gap-2">
            {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sportFilter === s ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {s === 'all' ? 'All' : `${sportIcons[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by player, card name, or set..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Search Results */}
        {search && filteredCards.length > 0 && !selectedCard && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filteredCards.map(card => (
              <button
                key={card.slug}
                onClick={() => { setSelectedCard(card); setSearch(''); setExpandedIdx(null); }}
                className="w-full text-left p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors flex items-center gap-3"
              >
                <span className="text-lg">{sportIcons[card.sport]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{card.name}</div>
                  <div className="text-gray-500 text-xs">{card.player} &middot; ${parseValue(card.estimatedValueRaw).toLocaleString()} raw</div>
                </div>
                {card.rookie && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">RC</span>}
              </button>
            ))}
          </div>
        )}
        {search && filteredCards.length === 0 && (
          <p className="text-gray-500 text-sm">No cards found. Try a different search.</p>
        )}
      </div>

      {/* Selected Card */}
      {selectedCard && (
        <div className="bg-gray-900/50 border border-pink-800/30 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-gray-500 text-xs mb-1">MATCHING BASED ON</div>
              <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-400">{sportIcons[selectedCard.sport]} {selectedCard.player}</span>
                <span className="text-sm text-gray-500">${parseValue(selectedCard.estimatedValueRaw).toLocaleString()} raw &middot; ${parseValue(selectedCard.estimatedValueGem).toLocaleString()} gem</span>
                {selectedCard.rookie && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">RC</span>}
              </div>
            </div>
            <button onClick={() => { setSelectedCard(null); setExpandedIdx(null); }} className="text-gray-500 hover:text-white text-sm px-3 py-1 bg-gray-800 rounded-lg">
              Change
            </button>
          </div>

          {/* Match Results */}
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-bold text-white mb-3">
              8 Cards You Should Check Out
            </h3>
            <div className="space-y-3">
              {matches.map((m, i) => {
                const sc = sportColors[m.card.sport] || 'gray';
                const isExpanded = expandedIdx === i;
                return (
                  <div key={m.card.slug} className="bg-gray-800/40 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : i)}
                      className="w-full text-left p-4 flex items-center gap-4 hover:bg-gray-800/70 transition-colors"
                    >
                      <div className={`text-2xl font-bold w-8 text-center ${m.score >= 80 ? 'text-emerald-400' : m.score >= 60 ? 'text-amber-400' : 'text-gray-500'}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{sportIcons[m.card.sport]}</span>
                          <span className="text-white font-medium text-sm truncate">{m.card.name}</span>
                          {m.card.rookie && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex-shrink-0">RC</span>}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {m.card.player} &middot; ${parseValue(m.card.estimatedValueRaw).toLocaleString()} raw &middot; {m.topReason}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-lg font-bold ${m.score >= 80 ? 'text-emerald-400' : m.score >= 60 ? 'text-amber-400' : m.score >= 40 ? 'text-orange-400' : 'text-gray-500'}`}>
                          {m.score}%
                        </div>
                        <div className="text-gray-600 text-[10px]">match</div>
                      </div>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-700/50">
                        <div className="pt-3 mb-3">
                          <p className="text-gray-400 text-sm leading-relaxed">{m.card.description}</p>
                        </div>
                        {/* Dimension Breakdown */}
                        <div className="space-y-2 mb-4">
                          {m.dimensions.map(d => (
                            <div key={d.name} className="flex items-center gap-3">
                              <div className="w-28 text-xs text-gray-500">{d.name} ({d.weight}%)</div>
                              <div className="flex-1">
                                <MatchBar score={d.score} />
                              </div>
                              <div className="text-xs text-gray-600 w-36 truncate" title={d.reason}>{d.reason}</div>
                            </div>
                          ))}
                        </div>
                        {/* Action Links */}
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/sports/${m.card.slug}`} className="text-xs bg-pink-600/20 text-pink-400 px-3 py-1.5 rounded-lg hover:bg-pink-600/30 transition-colors">
                            View Card Details
                          </Link>
                          <Link href={`/players/${m.card.player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} className="text-xs bg-gray-700/50 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                            Player Profile
                          </Link>
                          <a href={m.card.ebaySearchUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-colors">
                            Buy on eBay &rarr;
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {matches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Avg match: {Math.round(matches.reduce((s, m) => s + m.score, 0) / matches.length)}%</span>
              <span>Sports: {[...new Set(matches.map(m => m.card.sport))].map(s => sportIcons[s]).join(' ')}</span>
              <span>Rookies: {matches.filter(m => m.card.rookie).length}/8</span>
              <span>Value range: ${Math.min(...matches.map(m => parseValue(m.card.estimatedValueRaw))).toLocaleString()} – ${Math.max(...matches.map(m => parseValue(m.card.estimatedValueRaw))).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
