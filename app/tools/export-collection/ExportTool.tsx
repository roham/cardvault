'use client';

import { useState, useEffect } from 'react';
import { sportsCards } from '@/data/sports-cards';

type ExportFormat = 'csv' | 'json' | 'text';
type Source = 'binder' | 'vault' | 'all';

interface ExportCard {
  name: string;
  player: string;
  year: number;
  set: string;
  sport: string;
  cardNumber: string;
  estimatedValueRaw: string;
  estimatedValueGem: string;
  rookie: boolean;
  ebayUrl: string;
}

function parseStorageCollection(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object') return Object.keys(parsed).filter(k => parsed[k]);
    return [];
  } catch {
    return [];
  }
}

function toCSV(cards: ExportCard[]): string {
  const headers = ['Name', 'Player', 'Year', 'Set', 'Sport', 'Card Number', 'Raw Value', 'Gem Value', 'Rookie', 'eBay URL'];
  const rows = cards.map(c => [
    `"${c.name}"`, `"${c.player}"`, c.year, `"${c.set}"`, c.sport, `"${c.cardNumber}"`,
    `"${c.estimatedValueRaw}"`, `"${c.estimatedValueGem}"`, c.rookie ? 'Yes' : 'No', c.ebayUrl,
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

function toJSON(cards: ExportCard[]): string {
  return JSON.stringify(cards, null, 2);
}

function toText(cards: ExportCard[]): string {
  return cards.map(c =>
    `${c.name} | ${c.sport} | ${c.year} | Raw: ${c.estimatedValueRaw} | Gem: ${c.estimatedValueGem}${c.rookie ? ' | RC' : ''}`
  ).join('\n');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportTool() {
  const [source, setSource] = useState<Source>('all');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [binderSlugs, setBinderSlugs] = useState<string[]>([]);
  const [vaultSlugs, setVaultSlugs] = useState<string[]>([]);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    setBinderSlugs(parseStorageCollection('cardvault-binder'));
    setVaultSlugs(parseStorageCollection('cardvault-vault'));
  }, []);

  const getCards = (): ExportCard[] => {
    let slugs: string[];
    if (source === 'binder') slugs = binderSlugs;
    else if (source === 'vault') slugs = vaultSlugs;
    else slugs = [...new Set([...binderSlugs, ...vaultSlugs])];

    if (slugs.length === 0) {
      // Export all cards in database
      return sportsCards.map(c => ({
        name: c.name, player: c.player, year: c.year, set: c.set, sport: c.sport,
        cardNumber: c.cardNumber, estimatedValueRaw: c.estimatedValueRaw,
        estimatedValueGem: c.estimatedValueGem, rookie: c.rookie, ebayUrl: c.ebaySearchUrl,
      }));
    }

    return slugs.map(slug => {
      const card = sportsCards.find(c => c.slug === slug);
      if (!card) return null;
      return {
        name: card.name, player: card.player, year: card.year, set: card.set, sport: card.sport,
        cardNumber: card.cardNumber, estimatedValueRaw: card.estimatedValueRaw,
        estimatedValueGem: card.estimatedValueGem, rookie: card.rookie, ebayUrl: card.ebaySearchUrl,
      };
    }).filter(Boolean) as ExportCard[];
  };

  const handleExport = () => {
    const cards = getCards();
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      downloadFile(toCSV(cards), `cardvault-export-${timestamp}.csv`, 'text/csv');
    } else if (format === 'json') {
      downloadFile(toJSON(cards), `cardvault-export-${timestamp}.json`, 'application/json');
    } else {
      downloadFile(toText(cards), `cardvault-export-${timestamp}.txt`, 'text/plain');
    }

    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleCopy = () => {
    const cards = getCards();
    let content: string;
    if (format === 'csv') content = toCSV(cards);
    else if (format === 'json') content = toJSON(cards);
    else content = toText(cards);

    navigator.clipboard.writeText(content);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const cardCount = source === 'binder' ? binderSlugs.length :
    source === 'vault' ? vaultSlugs.length :
    new Set([...binderSlugs, ...vaultSlugs]).size;

  const hasCollection = cardCount > 0;

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">What to Export</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { id: 'binder' as Source, label: 'My Binder', count: binderSlugs.length, desc: 'Cards you\'ve collected' },
            { id: 'vault' as Source, label: 'My Vault', count: vaultSlugs.length, desc: 'Cards in your vault' },
            { id: 'all' as Source, label: 'Full Database', count: sportsCards.length, desc: 'All 4,400+ sports cards' },
          ]).map(s => (
            <button
              key={s.id}
              onClick={() => setSource(s.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                source === s.id
                  ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-white">{s.label}</div>
              <div className="text-xs mt-1">{s.count} cards</div>
              <div className="text-xs mt-0.5 opacity-70">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Export Format</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { id: 'csv' as ExportFormat, label: 'CSV', desc: 'Open in Excel, Google Sheets, Numbers' },
            { id: 'json' as ExportFormat, label: 'JSON', desc: 'For developers and API integrations' },
            { id: 'text' as ExportFormat, label: 'Plain Text', desc: 'Simple list, paste anywhere' },
          ]).map(f => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                format === f.id
                  ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                  : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-white">{f.label}</div>
              <div className="text-xs mt-1 opacity-70">{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Ready to Export</h2>
            <p className="text-sm text-gray-400">
              {hasCollection ? `${cardCount} cards from your ${source}` : `Full database (${sportsCards.length} cards)`} as {format.toUpperCase()}
            </p>
          </div>
          {exported && (
            <span className="text-sm text-emerald-400 font-medium">Exported!</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            Download {format.toUpperCase()}
          </button>
          <button
            onClick={handleCopy}
            className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">Fields Included</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {['Card Name', 'Player', 'Year', 'Set', 'Sport', 'Card Number', 'Raw Value', 'Gem Value', 'Rookie Status', 'eBay URL'].map(field => (
            <div key={field} className="px-3 py-1.5 bg-gray-800 rounded text-xs text-gray-300 text-center">
              {field}
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">Export Tips</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li><strong className="text-white">CSV for spreadsheets:</strong> Import into Google Sheets or Excel to sort, filter, and track your collection value over time.</li>
          <li><strong className="text-white">JSON for developers:</strong> Use this format if you are building your own tools or integrating with other card management software.</li>
          <li><strong className="text-white">Track your portfolio:</strong> Export monthly and compare values to see which cards are gaining or losing value.</li>
          <li><strong className="text-white">Insurance documentation:</strong> Keep a CSV export as proof of your collection for insurance purposes. Include photos separately.</li>
        </ul>
      </div>
    </div>
  );
}
