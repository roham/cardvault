'use client';

import { useState, useMemo } from 'react';
import { sportsCards } from '@/data/sports-cards';

export default function EmbedPriceCheck() {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return sportsCards
      .filter(c =>
        c.player.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query]);

  const sportEmoji: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#111827', borderRadius: 12, border: '1px solid #1f2937', overflow: 'hidden', maxWidth: 420 }}>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>CardVault</div>
          <div style={{ color: '#6b7280', fontSize: 11 }}>Price Check</div>
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any card..."
          style={{
            width: '100%', background: '#1f2937', border: '1px solid #374151', borderRadius: 10,
            padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {query.trim() && (
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {results.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 13 }}>No results found</div>
          )}
          {results.map(card => (
            <a
              key={card.slug}
              href={`https://cardvault-two.vercel.app/sports/${card.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid #1f2937', textDecoration: 'none', gap: 8 }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12 }}>{sportEmoji[card.sport] || '🃏'}</span>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.player}</span>
                  {card.rookie && <span style={{ fontSize: 9, fontWeight: 700, background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '1px 5px', borderRadius: 3 }}>RC</span>}
                </div>
                <div style={{ color: '#6b7280', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.year} {card.set}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>{card.estimatedValueRaw}</div>
                <div style={{ color: '#4b5563', fontSize: 9 }}>RAW</div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ background: '#0d1117', padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="https://cardvault-two.vercel.app/tools" target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', fontSize: 10, fontWeight: 600, textDecoration: 'none' }}>
          Powered by CardVault
        </a>
        <span style={{ color: '#4b5563', fontSize: 10 }}>3,600+ cards</span>
      </div>
    </div>
  );
}
