import type { SportsCard } from '@/data/sports-cards';
import { getJerseyNumber } from '@/data/sports-cards';
import cardImages from '@/data/card-images.json';

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
const sportPatterns: Record<string, { bg: string; accent: string }> = {
  baseball: { bg: '#1a0a0a', accent: '#8B1A1A' },
  basketball: { bg: '#1a0c00', accent: '#B84B00' },
  football: { bg: '#0a0d1a', accent: '#1A3A6B' },
  hockey: { bg: '#000d1a', accent: '#0A4D6B' },
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

// Get player initials from full name
function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(p => p.length > 0)
    .map(p => p[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

interface CardFrameProps {
  card: SportsCard;
  size?: 'small' | 'large';
}

const imageMapTyped = cardImages as Record<string, string>;

export default function CardFrame({ card, size = 'small' }: CardFrameProps) {
  const realImage = imageMapTyped[card.slug];
  const era = getEra(card.year);
  const eraStyle = eraStyles[era];
  const [primary, secondary] = getPlayerColors(card.slug, card.sport);
  const jerseyNum = card.jerseyNumber ?? getJerseyNumber(card.player);
  const displayNumber = jerseyNum && jerseyNum !== 'N/A' ? jerseyNum : getInitials(card.player);
  const isNumber = jerseyNum && jerseyNum !== 'N/A';

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

        {/* Main image area */}
        <div
          className="absolute top-12 left-3 right-3 bottom-16 rounded-lg overflow-hidden flex flex-col items-center justify-center"
          style={{ background: realImage ? '#000' : `linear-gradient(160deg, ${primary}44 0%, ${secondary}CC 50%, ${primary}22 100%)` }}
        >
          {realImage ? (
            /* Real card image from eBay */
            <img
              src={realImage}
              alt={card.name}
              className="absolute inset-0 w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <>
              {/* Diagonal stripe texture — vintage card feel */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(135deg, ${primary}08 0px, ${primary}08 1px, transparent 1px, transparent 12px)`,
                }}
              />

              {/* Era-appropriate horizontal rule accent */}
              {era === 'prewar' || era === 'vintage' ? (
                <div className="absolute top-4 left-4 right-4 flex flex-col gap-1 opacity-20">
                  <div className="h-px w-full" style={{ background: primary }} />
                  <div className="h-px w-full" style={{ background: primary }} />
                </div>
              ) : null}

              {/* Big jersey number / initials — the card's centerpiece */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span
                  className={`font-black leading-none select-none ${eraStyle.font}`}
                  style={{
                    fontSize: isNumber ? (displayNumber.length > 2 ? '5rem' : '7rem') : '4.5rem',
                    color: primary,
                    opacity: 0.85,
                    textShadow: `0 4px 24px ${secondary}CC, 0 0 60px ${primary}40`,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {displayNumber}
                </span>
                {isNumber && (
                  <span
                    className="text-xs font-bold tracking-[0.2em] uppercase mt-1 opacity-50"
                    style={{ color: primary }}
                  >
                    {card.sport === 'baseball' ? 'jersey' : '#'}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Rookie stamp — angled overlay, bottom-right */}
          {card.rookie && (
            <div
              className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-xs font-black tracking-wider"
              style={{
                background: '#FFD700',
                color: '#000',
                transform: 'rotate(-8deg)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                fontSize: '0.6rem',
              }}
            >
              ROOKIE CARD
            </div>
          )}

          {/* Player name bottom of art area */}
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p
              className={`text-white font-black leading-tight drop-shadow-lg ${eraStyle.font}`}
              style={{ fontSize: card.player.length > 14 ? '1.1rem' : '1.4rem', textShadow: `0 2px 8px ${secondary}` }}
            >
              {card.player.toUpperCase()}
            </p>
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
        className="absolute top-7 left-1.5 right-1.5 bottom-10 rounded flex flex-col items-center justify-center overflow-hidden"
        style={{ background: realImage ? '#000' : `linear-gradient(160deg, ${primary}33 0%, ${secondary}CC 100%)` }}
      >
        {realImage ? (
          <img
            src={realImage}
            alt={card.name}
            className="absolute inset-0 w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, ${primary}08 0px, ${primary}08 1px, transparent 1px, transparent 8px)`,
          }}
        />
        {/* Jersey number / initials */}
        <span
          className={`relative z-10 font-black leading-none ${eraStyle.font}`}
          style={{
            fontSize: isNumber ? (displayNumber.length > 2 ? '1.8rem' : '2.6rem') : '1.6rem',
            color: primary,
            opacity: 0.80,
            textShadow: `0 2px 10px ${secondary}CC`,
            letterSpacing: '-0.02em',
          }}
        >
          {displayNumber}
        </span>
          </>
        )}
        {/* Rookie stamp small */}
        {card.rookie && (
          <div
            className="absolute bottom-1 right-1 px-1 rounded font-black"
            style={{
              background: '#FFD700',
              color: '#000',
              transform: 'rotate(-8deg)',
              fontSize: '0.38rem',
            }}
          >
            RC
          </div>
        )}
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
