import type { SportsCard } from '@/data/sports-cards';

// Period-appropriate font styles
const eraStyles: Record<string, { font: string; style: string }> = {
  prewar: { font: 'font-serif', style: 'italic' },
  vintage: { font: 'font-serif', style: 'normal' },
  junkwax: { font: 'font-sans', style: 'normal' },
  modern: { font: 'font-sans', style: 'normal' },
};

function getEra(year: number): keyof typeof eraStyles {
  if (year < 1941) return 'prewar';
  if (year < 1985) return 'vintage';
  if (year < 2000) return 'junkwax';
  return 'modern';
}

// Sport-specific background patterns
const sportPatterns: Record<string, { bg: string; accent: string; stitching: string }> = {
  baseball: { bg: '#1a0a0a', accent: '#8B1A1A', stitching: '#CC3333' },
  basketball: { bg: '#1a0c00', accent: '#B84B00', stitching: '#E56020' },
  football: { bg: '#0a0d1a', accent: '#1A3A6B', stitching: '#3A5FA0' },
  hockey: { bg: '#000d1a', accent: '#0A4D6B', stitching: '#1A7FA0' },
};

// Team color overrides: player slug fragment → [primary, secondary]
const playerColors: Record<string, [string, string]> = {
  'michael-jordan': ['#CE1141', '#000000'],
  'kobe-bryant': ['#552583', '#FDB927'],
  'lebron-james': ['#860038', '#041E42'],
  'kevin-durant': ['#007AC1', '#EF3B24'],
  'shaquille-oneal': ['#552583', '#FDB927'],
  'magic-johnson': ['#552583', '#FDB927'],
  'larry-bird': ['#007A33', '#BA9653'],
  'charles-barkley': ['#006BB6', '#ED174C'],
  'zion-williamson': ['#0C2340', '#C8102E'],
  'victor-wembanyama': ['#C4CED4', '#000000'],
  'tom-brady': ['#002244', '#C60C30'],
  'patrick-mahomes': ['#E31837', '#FFB81C'],
  'joe-montana': ['#AA0000', '#B3995D'],
  'jerry-rice': ['#AA0000', '#B3995D'],
  'jim-brown': ['#FF3C00', '#311D00'],
  'peyton-manning': ['#002C5F', '#A2AAAD'],
  'joe-namath': ['#003594', '#E61929'],
  'lamar-jackson': ['#241773', '#9E7C0C'],
  'mickey-mantle': ['#003087', '#E4002C'],
  'babe-ruth': ['#003087', '#E4002C'],
  'willie-mays': ['#FD5A1E', '#27251F'],
  'derek-jeter': ['#003087', '#E4002C'],
  'mike-trout': ['#BA0021', '#003263'],
  'ken-griffey': ['#0C2C56', '#005C5C'],
  'roberto-clemente': ['#C41E3A', '#0C2340'],
  'nolan-ryan': ['#003278', '#C0111F'],
  'rickey-henderson': ['#003831', '#EFB21E'],
  'hank-aaron': ['#CE1141', '#13274F'],
  'albert-pujols': ['#C41E3A', '#0C2340'],
  'honus-wagner': ['#C41E3A', '#0C2340'],
  'wayne-gretzky': ['#CF4520', '#00205B'],
  'bobby-orr': ['#FFB81C', '#000000'],
  'gordie-howe': ['#CE1126', '#FFFFFF'],
  'sidney-crosby': ['#FCB514', '#000000'],
  'connor-mcdavid': ['#CF4520', '#00205B'],
  'martin-brodeur': ['#CE1126', '#003087'],
};

function getPlayerColors(slug: string, sport: string): [string, string] {
  for (const [key, colors] of Object.entries(playerColors)) {
    if (slug.includes(key)) return colors;
  }
  const pattern = sportPatterns[sport] ?? sportPatterns.baseball;
  return [pattern.accent, pattern.bg];
}

interface CardFrameProps {
  card: SportsCard;
  size?: 'small' | 'large';
}

export default function CardFrame({ card, size = 'small' }: CardFrameProps) {
  const era = getEra(card.year);
  const eraStyle = eraStyles[era];
  const [primary, secondary] = getPlayerColors(card.slug, card.sport);
  const pattern = sportPatterns[card.sport] ?? sportPatterns.baseball;

  const isLarge = size === 'large';

  // Sport abbreviations for the card header
  const sportAbbr: Record<string, string> = {
    baseball: 'MLB',
    basketball: 'NBA',
    football: 'NFL',
    hockey: 'NHL',
  };

  // Manufacturer label based on set name
  function getManufacturer(setName: string): string {
    if (setName.includes('Topps') || setName.includes('Bowman')) return 'TOPPS';
    if (setName.includes('Fleer')) return 'FLEER';
    if (setName.includes('Upper Deck') || setName.includes('UD')) return 'UPPER DECK';
    if (setName.includes('Panini') || setName.includes('Prizm') || setName.includes('Donruss') || setName.includes('National Treasures') || setName.includes('Exquisite') || setName.includes('Contenders')) return 'PANINI';
    if (setName.includes('O-Pee-Chee')) return 'O-PEE-CHEE';
    if (setName.includes('Parkhurst')) return 'PARKHURST';
    if (setName.includes('SP ') || setName.includes(' SP')) return 'UPPER DECK SP';
    if (setName.includes('Star ')) return 'STAR CO.';
    if (setName.includes('Cracker Jack')) return 'CRACKER JACK';
    if (setName.includes('T206') || setName.includes('National Chicle') || setName.includes('Goudey')) return 'TOBACCO ERA';
    return 'COLLECTOR SERIES';
  }

  const manufacturer = getManufacturer(card.set);

  if (isLarge) {
    return (
      <div
        className="relative w-full max-w-sm aspect-[2.5/3.5] rounded-2xl shadow-2xl overflow-hidden select-none"
        style={{ background: secondary }}
      >
        {/* Outer border / frame */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ border: `4px solid ${primary}`, boxShadow: `inset 0 0 0 2px ${secondary}, inset 0 0 0 4px ${primary}40` }}
        />

        {/* Top header band */}
        <div
          className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4"
          style={{ background: `linear-gradient(135deg, ${primary}, ${primary}CC)` }}
        >
          <span className="text-white text-xs font-bold tracking-widest opacity-90">{sportAbbr[card.sport]}</span>
          <span className="text-white text-xs font-bold tracking-wider opacity-80">{card.year}</span>
          {card.rookie && (
            <span className="bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded tracking-wide">RC</span>
          )}
        </div>

        {/* Main image area — stylized card art */}
        <div
          className="absolute top-12 left-3 right-3 bottom-16 rounded-lg overflow-hidden flex flex-col items-center justify-center"
          style={{ background: `linear-gradient(160deg, ${primary}33 0%, ${secondary}99 60%, ${primary}22 100%)` }}
        >
          {/* Abstract player silhouette / art representation */}
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Background texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0px, ${primary} 1px, transparent 1px, transparent 8px)`,
              }}
            />
            {/* Vintage cardstock grain texture */}
            <div
              className="absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />
            {/* Sport silhouette SVG */}
            <div className="opacity-15 select-none">
              {card.sport === 'baseball' && (
                <svg width="96" height="96" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="3.5" r="1.5"/>
                  <path d="M10 5.5c-.5.3-.8.8-.8 1.5v3l-1.5 1c-.4.3-.5.8-.3 1.2l.5.8 2.8-1.5v3.5l-2.5 3.5c-.3.4-.2.9.2 1.1.4.2.9.1 1.1-.3L12 16l2.5 3.3c.3.4.8.5 1.2.2.4-.3.5-.8.2-1.2l-2.4-3.3V9.5l2.8 1.5.5-.8c.2-.4.1-.9-.3-1.2l-1.5-1v-3c0-.7-.3-1.2-.8-1.5H10z"/>
                  <path d="M5 8.5l7 3.5M3.5 7.5l2 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
              {card.sport === 'basketball' && (
                <svg width="96" height="96" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="2.5" r="1.5"/>
                  <path d="M10.5 4.5c-.8.3-1.2 1-1.2 1.8v3.5L7 12c-.4.4-.3 1 .1 1.3.4.3 1 .2 1.3-.2L10 11v4l-1.5 4c-.2.5.1 1 .6 1.1.5.2 1-.1 1.1-.6L12 16l1.8 3.5c.2.5.6.7 1.1.6.5-.1.8-.6.6-1.1L14 15v-4l1.6 2.1c.3.4.9.5 1.3.2.4-.3.5-.9.1-1.3l-2.3-2.2V6.3c0-.8-.4-1.5-1.2-1.8h-3z"/>
                  <circle cx="18" cy="4" r="2"/>
                </svg>
              )}
              {card.sport === 'football' && (
                <svg width="96" height="96" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="2.5" r="1.5"/>
                  <path d="M8.5 4.5c-.7.3-1 .9-1 1.6v2.5L5 10c-.4.3-.5.8-.2 1.2.3.4.8.5 1.2.2L8.5 10v4l-1.5 4.5c-.2.5.1 1 .6 1.1.5.2 1-.1 1.1-.6L10 16l1.3 3c.2.5.7.7 1.2.5.5-.2.7-.7.5-1.2L11.5 14v-4l2.5 1.5c.4.3.9.2 1.2-.3.3-.4.2-1-.3-1.2l-2.4-1.5V6.1c0-.7-.3-1.3-1-1.6H8.5z"/>
                  <path d="M11 6.5l5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <ellipse cx="17.5" cy="3.2" rx="1.6" ry="1" transform="rotate(-30 17.5 3.2)"/>
                </svg>
              )}
              {card.sport === 'hockey' && (
                <svg width="96" height="96" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="2.5" r="1.5"/>
                  <path d="M9.5 4.5c-.6.3-1 .9-1 1.6v2l-1.5 2.5c-.3.4-.2.9.2 1.2.4.3.9.2 1.2-.2L9.5 10v2.5l-3 5c-.3.5-.1 1 .4 1.2.5.2 1 0 1.2-.4L11 14l1.9 4.3c.2.5.7.7 1.2.5.5-.2.7-.7.5-1.2L12.5 13V10l1 1.2c.3.4.8.5 1.2.2.4-.3.5-.8.2-1.2l-2.4-3V6.1c0-.7-.4-1.3-1-1.6H9.5z"/>
                  <path d="M8 12l-3 3.5M5 15.5l2.5 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  <ellipse cx="5.5" cy="17" rx="1.2" ry="0.5"/>
                </svg>
              )}
            </div>
            {/* Player name in big type over the art area */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p
                className={`text-white font-black leading-tight drop-shadow-lg ${eraStyle.font}`}
                style={{ fontSize: card.player.length > 14 ? '1.1rem' : '1.4rem', textShadow: `0 2px 8px ${secondary}` }}
              >
                {card.player.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom info strip */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 flex flex-col items-center justify-center px-4 py-2"
          style={{ background: `linear-gradient(0deg, ${secondary} 0%, ${secondary}EE 70%, transparent 100%)` }}
        >
          <p className="text-gray-300 text-xs font-bold tracking-widest truncate w-full text-center" style={{ color: `${primary}DD` }}>
            {card.set.toUpperCase()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400 text-xs opacity-60">{manufacturer}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-400 text-xs opacity-60">#{card.cardNumber}</span>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-14 left-4 w-3 h-3 border-t-2 border-l-2 opacity-40" style={{ borderColor: primary }} />
        <div className="absolute top-14 right-4 w-3 h-3 border-t-2 border-r-2 opacity-40" style={{ borderColor: primary }} />
        <div className="absolute bottom-18 left-4 w-3 h-3 border-b-2 border-l-2 opacity-40" style={{ borderColor: primary }} />
        <div className="absolute bottom-18 right-4 w-3 h-3 border-b-2 border-r-2 opacity-40" style={{ borderColor: primary }} />
      </div>
    );
  }

  // Small tile version
  return (
    <div
      className="relative w-full aspect-[2.5/3.5] rounded-xl overflow-hidden select-none"
      style={{ background: secondary, border: `2px solid ${primary}` }}
    >
      {/* Top band */}
      <div
        className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-2"
        style={{ background: primary }}
      >
        <span className="text-white text-xs font-bold opacity-90" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>{sportAbbr[card.sport]}</span>
        <span className="text-white font-bold" style={{ fontSize: '0.6rem' }}>{card.year}</span>
        {card.rookie && (
          <span className="bg-yellow-400 text-black font-black px-1 rounded" style={{ fontSize: '0.55rem' }}>RC</span>
        )}
      </div>

      {/* Art area */}
      <div
        className="absolute top-7 left-1.5 right-1.5 bottom-10 rounded flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${primary}22 0%, ${secondary}AA 100%)` }}
      >
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0px, ${primary} 1px, transparent 1px, transparent 6px)`,
          }}
        />
        <div className="opacity-15 select-none">
          {card.sport === 'baseball' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="3.5" r="1.5"/>
              <path d="M10 5.5c-.5.3-.8.8-.8 1.5v3l-1.5 1c-.4.3-.5.8-.3 1.2l.5.8 2.8-1.5v3.5l-2.5 3.5c-.3.4-.2.9.2 1.1.4.2.9.1 1.1-.3L12 16l2.5 3.3c.3.4.8.5 1.2.2.4-.3.5-.8.2-1.2l-2.4-3.3V9.5l2.8 1.5.5-.8c.2-.4.1-.9-.3-1.2l-1.5-1v-3c0-.7-.3-1.2-.8-1.5H10z"/>
              <path d="M5 8.5l7 3.5M3.5 7.5l2 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}
          {card.sport === 'basketball' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="2.5" r="1.5"/>
              <path d="M10.5 4.5c-.8.3-1.2 1-1.2 1.8v3.5L7 12c-.4.4-.3 1 .1 1.3.4.3 1 .2 1.3-.2L10 11v4l-1.5 4c-.2.5.1 1 .6 1.1.5.2 1-.1 1.1-.6L12 16l1.8 3.5c.2.5.6.7 1.1.6.5-.1.8-.6.6-1.1L14 15v-4l1.6 2.1c.3.4.9.5 1.3.2.4-.3.5-.9.1-1.3l-2.3-2.2V6.3c0-.8-.4-1.5-1.2-1.8h-3z"/>
              <circle cx="18" cy="4" r="2"/>
            </svg>
          )}
          {card.sport === 'football' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <circle cx="10" cy="2.5" r="1.5"/>
              <path d="M8.5 4.5c-.7.3-1 .9-1 1.6v2.5L5 10c-.4.3-.5.8-.2 1.2.3.4.8.5 1.2.2L8.5 10v4l-1.5 4.5c-.2.5.1 1 .6 1.1.5.2 1-.1 1.1-.6L10 16l1.3 3c.2.5.7.7 1.2.5.5-.2.7-.7.5-1.2L11.5 14v-4l2.5 1.5c.4.3.9.2 1.2-.3.3-.4.2-1-.3-1.2l-2.4-1.5V6.1c0-.7-.3-1.3-1-1.6H8.5z"/>
              <path d="M11 6.5l5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <ellipse cx="17.5" cy="3.2" rx="1.6" ry="1" transform="rotate(-30 17.5 3.2)"/>
            </svg>
          )}
          {card.sport === 'hockey' && (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <circle cx="11" cy="2.5" r="1.5"/>
              <path d="M9.5 4.5c-.6.3-1 .9-1 1.6v2l-1.5 2.5c-.3.4-.2.9.2 1.2.4.3.9.2 1.2-.2L9.5 10v2.5l-3 5c-.3.5-.1 1 .4 1.2.5.2 1 0 1.2-.4L11 14l1.9 4.3c.2.5.7.7 1.2.5.5-.2.7-.7.5-1.2L12.5 13V10l1 1.2c.3.4.8.5 1.2.2.4-.3.5-.8.2-1.2l-2.4-3V6.1c0-.7-.4-1.3-1-1.6H9.5z"/>
              <path d="M8 12l-3 3.5M5 15.5l2.5 1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <ellipse cx="5.5" cy="17" rx="1.2" ry="0.5"/>
            </svg>
          )}
        </div>
        <div className="absolute bottom-1 left-1 right-1 text-center">
          <p
            className={`text-white font-black leading-tight ${eraStyle.font}`}
            style={{
              fontSize: card.player.length > 14 ? '0.5rem' : '0.6rem',
              textShadow: `0 1px 4px ${secondary}`,
            }}
          >
            {card.player.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 flex flex-col items-center justify-center px-2"
        style={{ background: `linear-gradient(0deg, ${secondary} 0%, ${secondary}CC 100%)` }}
      >
        <p
          className="font-bold truncate w-full text-center"
          style={{ fontSize: '0.5rem', letterSpacing: '0.05em', color: `${primary}CC` }}
        >
          {card.set.toUpperCase()}
        </p>
        <p className="text-gray-400 opacity-50" style={{ fontSize: '0.45rem' }}>#{card.cardNumber}</p>
      </div>
    </div>
  );
}
