'use client';

import { useState, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

const BASE = 'https://cardvault-two.vercel.app';

interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  previewUrl: string;
  embedCode: string;
  width: number;
  height: number;
  customizable: boolean;
}

export default function CreatorWidgets() {
  const [searchCard, setSearchCard] = useState('');
  const [selectedCard, setSelectedCard] = useState('1986-87-fleer-michael-jordan-57');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cardResults = useMemo(() => {
    if (!searchCard.trim()) return [];
    const q = searchCard.toLowerCase();
    return sportsCards.filter(c => c.player.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [searchCard]);

  const widgets: WidgetConfig[] = [
    {
      id: 'card',
      name: 'Card Price Widget',
      description: 'Show pricing for a specific card with raw + graded values, rookie badge, and eBay comps link.',
      icon: '💳',
      previewUrl: `${BASE}/embed/card?slug=${selectedCard}&theme=${theme}`,
      embedCode: `<iframe src="${BASE}/embed/card?slug=${selectedCard}&theme=${theme}" width="400" height="160" frameborder="0" style="border-radius:12px;overflow:hidden;"></iframe>`,
      width: 400,
      height: 160,
      customizable: true,
    },
    {
      id: 'price-check',
      name: 'Price Check Search',
      description: 'Interactive search widget — your audience can look up any card price right on your page.',
      icon: '🔎',
      previewUrl: `${BASE}/embed/price-check`,
      embedCode: `<iframe src="${BASE}/embed/price-check" width="420" height="400" frameborder="0" style="border-radius:12px;overflow:hidden;"></iframe>`,
      width: 420,
      height: 400,
      customizable: false,
    },
  ];

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Theme toggle */}
      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm">Theme:</span>
        <div className="flex gap-1 bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setTheme('dark')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              theme === 'dark' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              theme === 'light' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Light
          </button>
        </div>
      </div>

      {widgets.map(widget => (
        <div key={widget.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{widget.icon}</span>
              <div>
                <h3 className="text-white font-bold text-lg">{widget.name}</h3>
                <p className="text-gray-500 text-sm">{widget.description}</p>
              </div>
            </div>
          </div>

          {/* Card selector for card widget */}
          {widget.id === 'card' && (
            <div className="p-4 border-b border-gray-800 bg-gray-800/30">
              <label className="text-gray-400 text-xs font-medium mb-2 block">Select a card to embed:</label>
              <input
                type="text"
                value={searchCard}
                onChange={e => setSearchCard(e.target.value)}
                placeholder="Search by player or card name..."
                className="w-full bg-gray-900 border border-gray-700 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
              />
              {cardResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1 rounded-xl bg-gray-900 border border-gray-700 p-2">
                  {cardResults.map(card => (
                    <button
                      key={card.slug}
                      onClick={() => { setSelectedCard(card.slug); setSearchCard(''); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCard === card.slug ? 'bg-purple-900/40 text-purple-300' : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <span className="font-medium">{card.player}</span>
                      <span className="text-gray-500 ml-2">{card.year} {card.set}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedCard && (
                <div className="mt-2 text-xs text-gray-500">
                  Selected: <span className="text-purple-400 font-medium">{sportsCards.find(c => c.slug === selectedCard)?.name || selectedCard}</span>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="p-5 bg-gray-800/20">
            <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-3">Preview</h4>
            <div className="flex justify-center">
              <iframe
                src={widget.previewUrl}
                width={widget.width}
                height={widget.height}
                style={{ border: 'none', borderRadius: 12, overflow: 'hidden', maxWidth: '100%' }}
                title={`${widget.name} preview`}
              />
            </div>
          </div>

          {/* Embed code */}
          <div className="p-5 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Embed Code</h4>
              <button
                onClick={() => copyCode(widget.embedCode, widget.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  copiedId === widget.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {copiedId === widget.id ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 overflow-x-auto">
              <code className="text-emerald-400 text-xs break-all whitespace-pre-wrap">{widget.embedCode}</code>
            </pre>
          </div>
        </div>
      ))}

      {/* Use Cases */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Use Cases</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'YouTube Creators', desc: 'Embed card prices on your channel website or link page. Show your audience exactly what the cards in your videos are worth.', icon: '🎬' },
            { title: 'TikTok Creators', desc: 'Link your Linktree or bio page with embedded price checks. Viewers can look up cards from your content.', icon: '📱' },
            { title: 'Card Breakers', desc: 'Show real-time pricing during breaks. Embed card widgets for featured pulls on your break site.', icon: '📦' },
            { title: 'Blog Writers', desc: 'Add card price widgets inline with your articles. Market analysis and price guide posts get live data.', icon: '✍️' },
            { title: 'Card Shop Websites', desc: 'Show CardVault pricing alongside your inventory. Builds trust with transparent market data.', icon: '🏪' },
            { title: 'Forum Posts', desc: 'Some forums support iframe embeds. Add card pricing to your Blowout Forums or Net54 trade posts.', icon: '💬' },
          ].map(use => (
            <div key={use.title} className="flex items-start gap-3 p-4 bg-gray-800/40 rounded-xl">
              <span className="text-2xl flex-shrink-0">{use.icon}</span>
              <div>
                <h4 className="text-white font-semibold text-sm">{use.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{use.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
