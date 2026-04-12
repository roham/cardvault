// Card variations and parallels for iconic cards
// Helps collectors understand what versions exist and relative rarity

export interface CardVariant {
  name: string;
  description: string;
  estimatedMultiplier: string; // e.g. '3-5x base' or '$2,000-5,000'
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare';
  notes?: string;
}

export interface CardVariations {
  slug: string;
  baseDescription: string;
  variants: CardVariant[];
  collectingTip: string;
}

const rarityColor: Record<string, string> = {
  common: 'text-gray-400',
  uncommon: 'text-blue-400',
  rare: 'text-purple-400',
  'ultra-rare': 'text-amber-400',
};

export const cardVariations: CardVariations[] = [
  {
    slug: '1986-87-fleer-michael-jordan-57',
    baseDescription: 'The 1986-87 Fleer set was printed in one series with no official parallels or short prints. Every Jordan is the same card — variation is purely about condition.',
    variants: [
      { name: 'Standard Base', description: 'The only version that exists — all 1986-87 Fleer cards are base cards.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Signed by Jordan', description: 'PSA/JSA-authenticated Jordan signature on a Fleer card.', estimatedMultiplier: '$25,000–$200,000', rarity: 'rare', notes: 'Not officially produced — collector-obtained signatures' },
    ],
    collectingTip: 'Grade is everything for this card. A PSA 8 trades at 60-70% discount to a PSA 9. The center seam cut is the single biggest grading killer — look for even left/right borders in raw copies.',
  },
  {
    slug: '1952-topps-mickey-mantle-311',
    baseDescription: 'The 1952 Topps set has two distinct print varieties — the High Number series (cards 311-407, including Mantle) was printed in much smaller quantities than the low series.',
    variants: [
      { name: 'Standard Print', description: 'Normal print run — already a short print vs. the low series.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Red Back Variation', description: 'Faint reddish hue on the reverse — believed to be a different print run.', estimatedMultiplier: 'Slight premium', rarity: 'rare', notes: 'Not universally recognized; verify with PSA' },
    ],
    collectingTip: 'Paper loss on the reverse is the cardinal sin for this card. Examine the back under strong light for pinholes, tape, and writing. The Mantle cuts badly in the upper-left corner — pristine corners are the price separator.',
  },
  {
    slug: '2018-19-panini-prizm-luka-doncic-280',
    baseDescription: 'Prizm produces a rainbow of parallels from common silver to ultra-rare 1/1 variations. The base Prizm Silver is the flagship card.',
    variants: [
      { name: 'Silver Prizm', description: 'The flagship parallel — classic refractor shine.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Blue Prizm', description: 'Blue refractor. /199 numbered.', estimatedMultiplier: '2-3x Silver', rarity: 'uncommon' },
      { name: 'Red Prizm', description: 'Red refractor. /149 numbered.', estimatedMultiplier: '3-5x Silver', rarity: 'uncommon' },
      { name: 'Gold Prizm', description: 'Gold refractor. /10 numbered.', estimatedMultiplier: '15-25x Silver', rarity: 'rare' },
      { name: 'Black Prizm', description: '1/1 one-of-one. True holy grail.', estimatedMultiplier: '$500,000+', rarity: 'ultra-rare' },
      { name: 'Auto Silver', description: 'Signed base Prizm. /99 or /149.', estimatedMultiplier: '$4,000–$15,000', rarity: 'rare' },
    ],
    collectingTip: 'The Silver base is the most liquid. Numbered parallels command premiums but are illiquid in bear markets. If budget is limited, a PSA 10 Silver outperforms a raw Gold almost every time for resale.',
  },
  {
    slug: '2003-04-topps-chrome-lebron-james-111',
    baseDescription: '2003-04 Topps Chrome produced refractor parallels and autographed versions. The base refractor is the most collected.',
    variants: [
      { name: 'Base Refractor', description: 'Standard refractor — the card everyone wants.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Black Refractor', description: '/500 numbered. First-year black refractor.', estimatedMultiplier: '3-5x base', rarity: 'uncommon' },
      { name: 'X-Fractor', description: '/220 numbered. Grid pattern finish.', estimatedMultiplier: '4-7x base', rarity: 'uncommon' },
      { name: 'Gold Refractor', description: '/99 numbered. Classic gold border.', estimatedMultiplier: '10-15x base', rarity: 'rare' },
      { name: 'Superfractor', description: '1/1. The ultimate LeBron Chrome.', estimatedMultiplier: '$1,000,000+', rarity: 'ultra-rare' },
      { name: 'Autograph Refractor', description: 'Signed /500 — print run varies.', estimatedMultiplier: '$50,000–$200,000', rarity: 'rare', notes: 'LeBron autograph Chromees are extremely rare' },
    ],
    collectingTip: 'Centering is the biggest obstacle to a PSA 10. Most LeBron Chrome refractors grade at 8-9. The BGS grading scale rewards centered copies — a BGS 9.5 (Black Label) is worth 3x a PSA 10 in this card.',
  },
  {
    slug: '1993-sp-derek-jeter-279',
    baseDescription: '1993 SP produced foil cards with no official parallels. The entire allure is the condition difficulty — the foil surface shows any handling damage.',
    variants: [
      { name: 'Standard 1993 SP', description: 'The only version. No parallels exist.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Autographed (collector)' , description: 'Jeter signed examples — not produced by Upper Deck.', estimatedMultiplier: '$30,000–$80,000', rarity: 'rare', notes: 'Authentication critical — verify with JSA or PSA' },
    ],
    collectingTip: '1993 SP foil scratches from the smallest friction. Never slide it in a sleeve — drop it straight in. Print lines (dark streaks in the foil) are common and will knock a potential 9 down to an 8. Examine the foil under raking light before buying raw.',
  },
  {
    slug: '2000-playoff-contenders-tom-brady-144',
    baseDescription: 'The Brady Contenders auto is a sticker autograph card with variations in autograph placement, ink boldness, and centering.',
    variants: [
      { name: 'Ticket Auto Standard', description: 'The standard autograph version — sticker auto on ticket-design card.', estimatedMultiplier: 'Market price', rarity: 'uncommon', notes: 'Original print run reportedly 100 copies' },
      { name: 'Variation: Ink Quality', description: 'Some copies show faded/light ink — significantly discounted.', estimatedMultiplier: '40-60% discount', rarity: 'common' },
    ],
    collectingTip: 'Three things kill value: light ink, off-center sticker placement, and centering. PSA grades the card AND the autograph quality. The 1 existing PSA 10 had perfect centering and bold, full signature. Confirm autograph quality before paying PSA 9+ prices.',
  },
  {
    slug: '1996-97-topps-chrome-kobe-bryant-138',
    baseDescription: '1996-97 Topps Chrome produced refractor parallels. The base Chrome and Refractor are the two main collecting targets.',
    variants: [
      { name: 'Base Chrome', description: 'Standard non-refractor — shinier than base Topps but not a full refractor.', estimatedMultiplier: '60-70% of Refractor price', rarity: 'common' },
      { name: 'Refractor', description: 'The true refractor — distinctive rainbow-angle shine. More scarce.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
    ],
    collectingTip: 'The Kobe Chrome has a micro-pattern on the image that grades poorly under UV — get graded copies with provenance. Refractors are clearly identifiable by the refractor text on the reverse. Any raw copy claimed to be a refractor must show text on the back.',
  },
  {
    slug: '1979-80-opee-chee-wayne-gretzky-18',
    baseDescription: 'The OPC Gretzky is a distinct card from the 1979-80 Topps Gretzky — OPC is printed in Canada, has bilingual (English/French) text on the back, and is the true hobby favorite. The Topps version is also collected but commands a significant discount.',
    variants: [
      { name: 'O-Pee-Chee (OPC)', description: 'The main event — Canadian issue with French/English back.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Topps', description: 'American version — same photo, English-only back, less scarce.', estimatedMultiplier: '15-25% of OPC', rarity: 'common', notes: 'Confusingly undervalued given same player/photo' },
    ],
    collectingTip: 'The OPC print process left many copies with rough centering — 70/30 is common and kills grade. The card also suffers from back paper loss from wax packs. For OPC vs Topps: check the reverse. OPC has French text. Never pay OPC prices for a Topps.',
  },
];

export function getCardVariations(slug: string): CardVariations | undefined {
  return cardVariations.find(v => v.slug === slug);
}
