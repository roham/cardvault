'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
interface CardData {
  slug: string;
  name: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  estimatedValueRaw: string;
  estimatedValueGem: string;
}

interface LookupResult {
  query: string;
  match: CardData | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  rawValue: number;
  gemValue: number;
}

/* ───── Helpers ───── */
function parseValue(raw: string): number {
  const match = raw.match(/\$([0-9,]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ''), 10);
}

function formatCurrency(v: number): string {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
  return `$${v.toLocaleString()}`;
}

function normalize(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean);
}

function scoreMatch(query: string, card: CardData): number {
  const qNorm = normalize(query);
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return 0;

  const nameNorm = normalize(card.name);
  const playerNorm = normalize(card.player);
  const setNorm = normalize(card.set);
  const yearStr = String(card.year);

  // Exact name match
  if (qNorm === nameNorm) return 100;

  // Player name exact match
  if (qNorm === playerNorm) return 80;

  let score = 0;

  // Token matching against combined text
  const combined = `${nameNorm} ${playerNorm} ${setNorm} ${yearStr}`;

  let matchedTokens = 0;
  for (const token of qTokens) {
    if (combined.includes(token)) {
      matchedTokens++;
      // Bonus for matching player name tokens
      if (playerNorm.includes(token)) score += 10;
      // Bonus for matching year
      if (token === yearStr) score += 8;
      // Bonus for matching set tokens
      if (setNorm.includes(token)) score += 5;
    }
  }

  const matchRatio = matchedTokens / qTokens.length;
  score += matchRatio * 50;

  // Bonus for substring match of player in query
  if (qNorm.includes(playerNorm)) score += 15;
  if (playerNorm.includes(qNorm)) score += 12;

  // Bonus for last name match
  const playerParts = playerNorm.split(' ');
  const lastName = playerParts[playerParts.length - 1];
  if (qTokens.includes(lastName)) score += 8;

  return score;
}

function findBestMatch(query: string, cards: CardData[]): LookupResult {
  if (!query.trim()) return { query, match: null, confidence: 'none', rawValue: 0, gemValue: 0 };

  let bestCard: CardData | null = null;
  let bestScore = 0;

  for (const card of cards) {
    const s = scoreMatch(query, card);
    if (s > bestScore) {
      bestScore = s;
      bestCard = card;
    }
  }

  if (!bestCard || bestScore < 10) {
    return { query, match: null, confidence: 'none', rawValue: 0, gemValue: 0 };
  }

  const confidence = bestScore >= 60 ? 'high' : bestScore >= 35 ? 'medium' : 'low';
  const rawValue = parseValue(bestCard.estimatedValueRaw);
  const gemValue = parseValue(bestCard.estimatedValueGem);

  return { query, match: bestCard, confidence, rawValue, gemValue };
}

const sportBadge: Record<string, { bg: string; text: string }> = {
  baseball: { bg: 'bg-red-950/60', text: 'text-red-400' },
  basketball: { bg: 'bg-orange-950/60', text: 'text-orange-400' },
  football: { bg: 'bg-green-950/60', text: 'text-green-400' },
  hockey: { bg: 'bg-blue-950/60', text: 'text-blue-400' },
};

const EXAMPLE_INPUT = `Mickey Mantle 1952 Topps
Shohei Ohtani
2024 Prizm Jayden Daniels
Connor Bedard Young Guns
LeBron James Topps Chrome
Patrick Mahomes Prizm Silver`;

/* ───── Component ───── */
export default function BulkLookupClient({ cards }: { cards: CardData[] }) {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<LookupResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const doLookup = useCallback(() => {
    if (!input.trim()) return;
    setProcessing(true);

    // Process in next tick to allow UI to update
    setTimeout(() => {
      const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
      const lookups = lines.map(line => findBestMatch(line, cards));
      setResults(lookups);
      setProcessing(false);
    }, 50);
  }, [input, cards]);

  const matched = results.filter(r => r.match);
  const unmatched = results.filter(r => !r.match);
  const totalRaw = matched.reduce((sum, r) => sum + r.rawValue, 0);
  const totalGem = matched.reduce((sum, r) => sum + r.gemValue, 0);

  const copyResults = useCallback(() => {
    const header = 'Query\tMatch\tSport\tYear\tRaw Value\tGem Value\tConfidence';
    const rows = results.map(r => {
      if (!r.match) return `${r.query}\tNo match\t-\t-\t-\t-\tnone`;
      return `${r.query}\t${r.match.name}\t${r.match.sport}\t${r.match.year}\t${r.match.estimatedValueRaw}\t${r.match.estimatedValueGem}\t${r.confidence}`;
    });
    const text = [header, ...rows].join('\n');
    navigator.clipboard?.writeText(text);
  }, [results]);

  const downloadCSV = useCallback(() => {
    const header = 'Query,Match,Sport,Year,Raw Value,Gem Value,Confidence';
    const rows = results.map(r => {
      if (!r.match) return `"${r.query}","No match","","","","","none"`;
      return `"${r.query}","${r.match.name}","${r.match.sport}","${r.match.year}","${r.match.estimatedValueRaw}","${r.match.estimatedValueGem}","${r.confidence}"`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardvault-bulk-lookup-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <div className="space-y-6">
      {/* Input area */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Paste your card list (one per line)</h3>
          <button
            onClick={() => setInput(EXAMPLE_INPUT)}
            className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
          >
            Load example
          </button>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Mickey Mantle 1952 Topps&#10;Shohei Ohtani&#10;2024 Prizm Jayden Daniels&#10;Connor Bedard Young Guns..."
          rows={8}
          className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 focus:outline-none resize-y"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-gray-500 text-xs">
            {input.trim() ? `${input.split('\n').filter(l => l.trim()).length} cards to look up` : 'Accepts player names, card names, or "year set player" format'}
          </p>
          <button
            onClick={doLookup}
            disabled={!input.trim() || processing}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              !input.trim() || processing
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-[0.98]'
            }`}
          >
            {processing ? 'Looking up...' : 'Look Up All'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs">Looked Up</p>
              <p className="text-white font-bold text-lg">{results.length}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs">Matched</p>
              <p className="text-green-400 font-bold text-lg">{matched.length}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs">Total Raw</p>
              <p className="text-cyan-400 font-bold text-lg">{formatCurrency(totalRaw)}</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-gray-500 text-xs">Total Gem</p>
              <p className="text-yellow-400 font-bold text-lg">{formatCurrency(totalGem)}</p>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              onClick={copyResults}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              Copy to Clipboard (TSV)
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              Download CSV
            </button>
          </div>

          {/* Results table */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">Your Input</th>
                    <th className="text-left py-3 px-4">Best Match</th>
                    <th className="text-left py-3 px-4">Sport</th>
                    <th className="text-right py-3 px-4">Raw</th>
                    <th className="text-right py-3 px-4">Gem</th>
                    <th className="text-center py-3 px-4">Conf.</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const sb = r.match ? sportBadge[r.match.sport] || sportBadge.baseball : null;
                    return (
                      <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/40">
                        <td className="py-2.5 px-4 text-gray-600">{i + 1}</td>
                        <td className="py-2.5 px-4 text-gray-300 font-mono text-xs max-w-[200px] truncate">{r.query}</td>
                        <td className="py-2.5 px-4">
                          {r.match ? (
                            <Link href={`/sports/${r.match.slug}`} className="text-white hover:text-cyan-400 transition-colors text-xs">
                              {r.match.name}
                            </Link>
                          ) : (
                            <span className="text-red-400 text-xs">No match found</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {sb && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sb.bg} ${sb.text}`}>
                              {r.match!.sport}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {r.match ? (
                            <span className="text-cyan-400 text-xs">{r.match.estimatedValueRaw}</span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {r.match ? (
                            <span className="text-yellow-400 text-xs">{r.match.estimatedValueGem}</span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.confidence === 'high' ? 'bg-green-950/60 text-green-400' :
                            r.confidence === 'medium' ? 'bg-yellow-950/60 text-yellow-400' :
                            r.confidence === 'low' ? 'bg-orange-950/60 text-orange-400' :
                            'bg-red-950/60 text-red-400'
                          }`}>
                            {r.confidence}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Unmatched cards */}
          {unmatched.length > 0 && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
              <h4 className="text-red-400 font-medium text-sm mb-2">
                {unmatched.length} card{unmatched.length !== 1 ? 's' : ''} not found
              </h4>
              <p className="text-gray-500 text-xs mb-2">Try being more specific (include year or set name) or check spelling.</p>
              <div className="flex flex-wrap gap-1">
                {unmatched.map((r, i) => (
                  <span key={i} className="text-xs bg-red-950/40 text-red-300 px-2 py-1 rounded">
                    {r.query}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tips */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Tips for Best Results</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex gap-2">
            <span className="text-green-400">&#10003;</span>
            <p className="text-gray-400"><span className="text-white">Include year and set</span> for exact matches: "2024 Prizm Jayden Daniels"</p>
          </div>
          <div className="flex gap-2">
            <span className="text-green-400">&#10003;</span>
            <p className="text-gray-400"><span className="text-white">Player name alone works</span> — returns the most notable card for that player</p>
          </div>
          <div className="flex gap-2">
            <span className="text-green-400">&#10003;</span>
            <p className="text-gray-400"><span className="text-white">Paste from spreadsheets</span> — one column of card names works perfectly</p>
          </div>
          <div className="flex gap-2">
            <span className="text-green-400">&#10003;</span>
            <p className="text-gray-400"><span className="text-white">Check confidence badges</span> — "high" = exact match, "low" = verify manually</p>
          </div>
        </div>
      </div>
    </div>
  );
}
