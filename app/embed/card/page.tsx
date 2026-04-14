import { sportsCards } from '@/data/sports-cards';
import { getGradePricing } from '@/data/grade-pricing';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CardVault Card Widget',
  robots: 'noindex, nofollow',
};

function parsePrice(val: string): number {
  const match = val.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

export default async function EmbedCardPage(props: { searchParams: Promise<{ slug?: string; theme?: string }> }) {
  const searchParams = await props.searchParams;
  const slug = searchParams.slug || '';
  const theme = searchParams.theme || 'dark';

  const card = sportsCards.find(c => c.slug === slug);

  if (!card) {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', color: theme === 'dark' ? '#9ca3af' : '#6b7280', background: theme === 'dark' ? '#111827' : '#f9fafb', borderRadius: 12, border: `1px solid ${theme === 'dark' ? '#1f2937' : '#e5e7eb'}`, textAlign: 'center' }}>
        Card not found
      </div>
    );
  }

  const pricing = getGradePricing(card.slug);
  const sportEmoji: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };
  const isDark = theme === 'dark';
  const bg = isDark ? '#111827' : '#ffffff';
  const border = isDark ? '#1f2937' : '#e5e7eb';
  const textPrimary = isDark ? '#ffffff' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6b7280';
  const accent = '#10b981';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: bg, borderRadius: 12, border: `1px solid ${border}`, overflow: 'hidden', maxWidth: 400 }}>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{sportEmoji[card.sport] || '🃏'}</span>
              <span style={{ color: textPrimary, fontWeight: 700, fontSize: 15 }}>{card.player}</span>
              {card.rookie && (
                <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 6px', borderRadius: 4 }}>RC</span>
              )}
            </div>
            <div style={{ color: textSecondary, fontSize: 12 }}>{card.year} {card.set} #{card.cardNumber}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 16 }}>{card.estimatedValueRaw}</div>
            <div style={{ color: textSecondary, fontSize: 10 }}>RAW</div>
          </div>
        </div>

        {/* Grade prices row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${border}` }}>
          {[
            { label: 'PSA 8', value: pricing?.grades.find(g => g.grade === 8)?.estimatedValue || '—' },
            { label: 'PSA 9', value: pricing?.grades.find(g => g.grade === 9)?.estimatedValue || '—' },
            { label: 'PSA 10', value: card.estimatedValueGem },
          ].map((g, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: textSecondary, fontSize: 10, fontWeight: 500 }}>{g.label}</div>
              <div style={{ color: i === 2 ? accent : textPrimary, fontSize: 12, fontWeight: 600 }}>{g.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: isDark ? '#0d1117' : '#f3f4f6', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href={`https://cardvault-two.vercel.app/sports/${card.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
          View on CardVault
        </a>
        <a href={card.ebaySearchUrl} target="_blank" rel="noopener noreferrer" style={{ color: textSecondary, fontSize: 11, textDecoration: 'none' }}>
          eBay Comps
        </a>
      </div>
    </div>
  );
}
