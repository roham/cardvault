export interface HitRate {
  insert: string;
  odds: string;        // e.g. "1:12" means 1 per 12 packs
  avgValue: number;    // average market value of this insert
  description: string;
}

export interface SealedProduct {
  slug: string;
  name: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon';
  year: number;
  brand: string;
  type: 'hobby-box' | 'blaster' | 'mega-box' | 'hanger' | 'fat-pack' | 'etb';
  retailPrice: number;
  packsPerBox: number;
  cardsPerPack: number;
  totalCards: number;
  baseCardValue: number;  // average value of all base cards combined in a box
  hitRates: HitRate[];
  description: string;
  releaseDate: string;
  ebaySearchUrl: string;
}

export const sealedProducts: SealedProduct[] = [
  // ===== BASEBALL =====
  {
    slug: '2025-topps-series-1-hobby',
    name: '2025 Topps Series 1 Hobby Box',
    sport: 'baseball',
    year: 2025,
    brand: 'Topps',
    type: 'hobby-box',
    retailPrice: 160,
    packsPerBox: 24,
    cardsPerPack: 14,
    totalCards: 336,
    baseCardValue: 8,
    hitRates: [
      { insert: 'Autograph', odds: '1:24 packs', avgValue: 25, description: 'One guaranteed auto per hobby box' },
      { insert: 'Relic / Memorabilia', odds: '1:12 packs', avgValue: 8, description: 'Game-used jersey or bat relic cards' },
      { insert: 'Numbered Parallel (/299 or less)', odds: '1:8 packs', avgValue: 12, description: 'Short-printed numbered parallels' },
      { insert: 'Foil / Refractor Parallel', odds: '1:4 packs', avgValue: 3, description: 'Standard foil or refractor parallels' },
      { insert: 'SP / SSP Base Variation', odds: '1:10 packs', avgValue: 15, description: 'Short-print photo variations' },
    ],
    description: 'The flagship annual Topps baseball release. One auto guaranteed per hobby box. Strong rookie class with Paul Skenes, Jackson Merrill, and more.',
    releaseDate: '2025-02-12',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2025+topps+series+1+hobby+box',
  },
  {
    slug: '2025-topps-series-1-blaster',
    name: '2025 Topps Series 1 Blaster Box',
    sport: 'baseball',
    year: 2025,
    brand: 'Topps',
    type: 'blaster',
    retailPrice: 30,
    packsPerBox: 7,
    cardsPerPack: 14,
    totalCards: 98,
    baseCardValue: 2,
    hitRates: [
      { insert: 'Exclusive Parallel', odds: '1:7 packs', avgValue: 5, description: 'Blaster-exclusive Royal Blue parallel' },
      { insert: 'Numbered Parallel', odds: '1:14 packs', avgValue: 10, description: 'Short-printed numbered parallels' },
      { insert: 'SP / SSP Base Variation', odds: '1:21 packs', avgValue: 15, description: 'Short-print photo variations — much rarer in retail' },
    ],
    description: 'Retail blaster box available at Target, Walmart, and card shops. Exclusive Royal Blue parallels. No guaranteed auto.',
    releaseDate: '2025-02-12',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2025+topps+series+1+blaster+box',
  },
  {
    slug: '2024-topps-chrome-hobby',
    name: '2024 Topps Chrome Hobby Box',
    sport: 'baseball',
    year: 2024,
    brand: 'Topps',
    type: 'hobby-box',
    retailPrice: 250,
    packsPerBox: 24,
    cardsPerPack: 4,
    totalCards: 96,
    baseCardValue: 12,
    hitRates: [
      { insert: 'Chrome Autograph', odds: '1:12 packs', avgValue: 40, description: 'Two guaranteed Chrome autos per hobby box' },
      { insert: 'Refractor', odds: '1:3 packs', avgValue: 5, description: 'Standard refractor parallels' },
      { insert: 'Numbered Refractor (/299 or less)', odds: '1:8 packs', avgValue: 20, description: 'Numbered refractor parallels — Gold, Orange, Red' },
      { insert: 'X-Fractor / Prism', odds: '1:6 packs', avgValue: 8, description: 'Special refractor patterns' },
    ],
    description: 'The chromium version of Topps flagship. Two autos per hobby box. Premium refractor parallels. Key rookie autos command strong premiums.',
    releaseDate: '2024-10-09',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024+topps+chrome+hobby+box',
  },
  {
    slug: '2024-bowman-chrome-hobby',
    name: '2024 Bowman Chrome Hobby Box',
    sport: 'baseball',
    year: 2024,
    brand: 'Bowman',
    type: 'hobby-box',
    retailPrice: 280,
    packsPerBox: 24,
    cardsPerPack: 4,
    totalCards: 96,
    baseCardValue: 15,
    hitRates: [
      { insert: 'Chrome Autograph', odds: '1:12 packs', avgValue: 50, description: 'Two guaranteed autos — prospect autos carry premium' },
      { insert: 'Refractor', odds: '1:3 packs', avgValue: 6, description: 'Standard refractor parallels' },
      { insert: 'Numbered Refractor (/250 or less)', odds: '1:6 packs', avgValue: 25, description: 'Numbered parallels — the chase for 1st Bowman Chrome numbered' },
      { insert: 'Mojo Refractor', odds: '1:8 packs', avgValue: 10, description: 'Mojo-pattern refractors — fan favorite' },
    ],
    description: 'The most important product for prospect collectors. 1st Bowman Chrome autos of top prospects can be worth hundreds to thousands. Ethan Salas, Upper Jurickson chase.',
    releaseDate: '2024-09-18',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024+bowman+chrome+hobby+box',
  },
  // ===== BASKETBALL =====
  {
    slug: '2024-25-panini-prizm-basketball-hobby',
    name: '2024-25 Panini Prizm Basketball Hobby Box',
    sport: 'basketball',
    year: 2024,
    brand: 'Panini',
    type: 'hobby-box',
    retailPrice: 500,
    packsPerBox: 12,
    cardsPerPack: 12,
    totalCards: 144,
    baseCardValue: 15,
    hitRates: [
      { insert: 'Autograph', odds: '1:6 packs', avgValue: 60, description: 'Two guaranteed autos per hobby box' },
      { insert: 'Silver Prizm', odds: '1:3 packs', avgValue: 15, description: 'The iconic Silver Prizm parallels — most recognizable in the hobby' },
      { insert: 'Color Prizm (Gold, Green, Blue)', odds: '1:6 packs', avgValue: 30, description: 'Numbered color Prizm parallels' },
      { insert: 'Hyper Prizm / Mojo', odds: '1:12 packs', avgValue: 50, description: 'Premium pattern parallels — low numbered' },
    ],
    description: 'The king of modern basketball cards. Silver Prizms are the standard for modern rookies. Wembanyama and Zach Edey rookie Silvers carry huge premiums.',
    releaseDate: '2025-04-02',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+panini+prizm+basketball+hobby+box',
  },
  {
    slug: '2024-25-panini-prizm-basketball-blaster',
    name: '2024-25 Panini Prizm Basketball Blaster Box',
    sport: 'basketball',
    year: 2024,
    brand: 'Panini',
    type: 'blaster',
    retailPrice: 40,
    packsPerBox: 6,
    cardsPerPack: 4,
    totalCards: 24,
    baseCardValue: 3,
    hitRates: [
      { insert: 'Silver Prizm', odds: '1:6 packs', avgValue: 15, description: 'Silver Prizm parallel — one per blaster on average' },
      { insert: 'Blaster-Exclusive Prizm', odds: '1:3 packs', avgValue: 8, description: 'Retail-exclusive color parallels' },
      { insert: 'Numbered Prizm', odds: '1:24 packs', avgValue: 40, description: 'Rare numbered parallels in retail — huge upside' },
    ],
    description: 'Retail Prizm at an accessible price. Blaster-exclusive parallels. The Silver Prizm chase makes every pack exciting.',
    releaseDate: '2025-04-02',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+panini+prizm+basketball+blaster',
  },
  {
    slug: '2024-25-panini-donruss-basketball-hobby',
    name: '2024-25 Panini Donruss Basketball Hobby Box',
    sport: 'basketball',
    year: 2024,
    brand: 'Panini',
    type: 'hobby-box',
    retailPrice: 180,
    packsPerBox: 24,
    cardsPerPack: 8,
    totalCards: 192,
    baseCardValue: 8,
    hitRates: [
      { insert: 'Autograph', odds: '1:12 packs', avgValue: 30, description: 'Two guaranteed autos per hobby box' },
      { insert: 'Rated Rookie', odds: '1:4 packs', avgValue: 5, description: 'The iconic Rated Rookie cards — Donruss signature subset' },
      { insert: 'Holo Parallel', odds: '1:6 packs', avgValue: 8, description: 'Holo parallels of base and Rated Rookie cards' },
      { insert: 'Press Proof / Laser', odds: '1:8 packs', avgValue: 15, description: 'Numbered Press Proof and Laser parallels' },
    ],
    description: 'The entry-level hobby basketball product. Rated Rookies are iconic. Two autos per hobby box. Strong value at the $180 price point.',
    releaseDate: '2025-01-22',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+donruss+basketball+hobby+box',
  },
  // ===== FOOTBALL =====
  {
    slug: '2024-panini-prizm-football-hobby',
    name: '2024 Panini Prizm Football Hobby Box',
    sport: 'football',
    year: 2024,
    brand: 'Panini',
    type: 'hobby-box',
    retailPrice: 600,
    packsPerBox: 12,
    cardsPerPack: 12,
    totalCards: 144,
    baseCardValue: 15,
    hitRates: [
      { insert: 'Autograph', odds: '1:4 packs', avgValue: 80, description: 'Three guaranteed autos per hobby box' },
      { insert: 'Silver Prizm', odds: '1:3 packs', avgValue: 12, description: 'Silver Prizm parallels — the gold standard for modern football' },
      { insert: 'Color Prizm (numbered)', odds: '1:6 packs', avgValue: 35, description: 'Gold, Green, Blue, Red numbered parallels' },
      { insert: 'Rookie Prizm (Silver)', odds: '1:12 packs', avgValue: 25, description: 'Rookie Silver Prizms — Caleb Williams, Jayden Daniels, Marvin Harrison Jr' },
    ],
    description: 'The most popular modern football product. Three autos per hobby box. 2024 class features Caleb Williams, Jayden Daniels, Marvin Harrison Jr, Brock Bowers.',
    releaseDate: '2025-03-19',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024+panini+prizm+football+hobby+box',
  },
  {
    slug: '2024-panini-prizm-football-blaster',
    name: '2024 Panini Prizm Football Blaster Box',
    sport: 'football',
    year: 2024,
    brand: 'Panini',
    type: 'blaster',
    retailPrice: 40,
    packsPerBox: 6,
    cardsPerPack: 4,
    totalCards: 24,
    baseCardValue: 3,
    hitRates: [
      { insert: 'Silver Prizm', odds: '1:6 packs', avgValue: 12, description: 'One Silver Prizm per blaster on average' },
      { insert: 'Blaster-Exclusive Prizm', odds: '1:3 packs', avgValue: 6, description: 'Retail-exclusive No Huddle Prizm parallels' },
      { insert: 'Rookie Card', odds: '1:2 packs', avgValue: 3, description: 'Rookie base cards of the 2024 draft class' },
    ],
    description: 'Retail Prizm football. Accessible entry point with blaster-exclusive parallels and Silver Prizm chase.',
    releaseDate: '2025-03-19',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024+panini+prizm+football+blaster',
  },
  {
    slug: '2024-panini-select-football-hobby',
    name: '2024 Panini Select Football Hobby Box',
    sport: 'football',
    year: 2024,
    brand: 'Panini',
    type: 'hobby-box',
    retailPrice: 450,
    packsPerBox: 12,
    cardsPerPack: 5,
    totalCards: 60,
    baseCardValue: 10,
    hitRates: [
      { insert: 'Autograph', odds: '1:4 packs', avgValue: 65, description: 'Three guaranteed autos per hobby box' },
      { insert: 'Die-Cut Prizm', odds: '1:6 packs', avgValue: 20, description: 'Die-cut Select parallels — visually striking' },
      { insert: 'Concourse/Premier/Club Level', odds: '1:2 packs', avgValue: 8, description: 'Tiered base card system — Premier Level carries more value' },
      { insert: 'Zebra / Tie-Dye Prizm', odds: '1:12 packs', avgValue: 50, description: 'Premium short-printed parallels' },
    ],
    description: 'Three-tier base card system (Concourse, Premier Level, Club Level). Die-cut parallels are visually distinctive. Three autos per box.',
    releaseDate: '2025-02-26',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024+panini+select+football+hobby+box',
  },
  // ===== HOCKEY =====
  {
    slug: '2024-25-upper-deck-series-1-hockey-hobby',
    name: '2024-25 Upper Deck Series 1 Hockey Hobby Box',
    sport: 'hockey',
    year: 2024,
    brand: 'Upper Deck',
    type: 'hobby-box',
    retailPrice: 120,
    packsPerBox: 24,
    cardsPerPack: 8,
    totalCards: 192,
    baseCardValue: 6,
    hitRates: [
      { insert: 'Young Guns Rookie', odds: '1:4 packs', avgValue: 8, description: 'Young Guns — the most iconic hockey rookie card brand' },
      { insert: 'Canvas Parallel', odds: '1:8 packs', avgValue: 5, description: 'Canvas-texture parallels with artistic designs' },
      { insert: 'Jersey / Relic', odds: '1:24 packs', avgValue: 15, description: 'One guaranteed jersey relic per hobby box' },
      { insert: 'Acetate / Clear Cut', odds: '1:48 packs', avgValue: 40, description: 'Premium acetate insert cards' },
    ],
    description: 'The flagship Upper Deck hockey release. Young Guns rookies are THE hockey rookie card. Macklin Celebrini Young Guns is the chase card of the year.',
    releaseDate: '2024-11-13',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+series+1+hockey+hobby+box',
  },
  {
    slug: '2024-25-upper-deck-series-1-hockey-blaster',
    name: '2024-25 Upper Deck Series 1 Hockey Blaster Box',
    sport: 'hockey',
    year: 2024,
    brand: 'Upper Deck',
    type: 'blaster',
    retailPrice: 30,
    packsPerBox: 6,
    cardsPerPack: 8,
    totalCards: 48,
    baseCardValue: 2,
    hitRates: [
      { insert: 'Young Guns Rookie', odds: '1:6 packs', avgValue: 8, description: 'Young Guns rookies — one per blaster on average' },
      { insert: 'Canvas Parallel', odds: '1:12 packs', avgValue: 5, description: 'Canvas parallels — rarer in retail' },
      { insert: 'Blaster-Exclusive Parallel', odds: '1:6 packs', avgValue: 3, description: 'Retail-exclusive parallels' },
    ],
    description: 'Retail hockey at an accessible price. Young Guns rookies are the big chase. Macklin Celebrini cards carry premium.',
    releaseDate: '2024-11-13',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+series+1+hockey+blaster',
  },
  // ===== POKEMON =====
  {
    slug: 'pokemon-scarlet-violet-prismatic-evolutions-etb',
    name: 'Pokemon Prismatic Evolutions Elite Trainer Box',
    sport: 'pokemon',
    year: 2025,
    brand: 'Pokemon',
    type: 'etb',
    retailPrice: 60,
    packsPerBox: 9,
    cardsPerPack: 10,
    totalCards: 90,
    baseCardValue: 3,
    hitRates: [
      { insert: 'Holo Rare', odds: '1:3 packs', avgValue: 3, description: 'Holographic rare cards' },
      { insert: 'Ultra Rare (ex)', odds: '1:9 packs', avgValue: 15, description: 'Pokemon ex cards — one per ETB on average' },
      { insert: 'Illustration Rare', odds: '1:18 packs', avgValue: 25, description: 'Full-art illustration rares — the most sought after cards' },
      { insert: 'Special Art Rare (SAR)', odds: '1:36 packs', avgValue: 80, description: 'Special Art Rares — premium chase cards with stunning artwork' },
      { insert: 'Hyper Rare (Gold)', odds: '1:72 packs', avgValue: 50, description: 'Gold Hyper Rare cards — low pull rate' },
    ],
    description: 'The most hyped Pokemon set of 2025. Eeveelution-themed set with stunning artwork. Special Art Rares of Umbreon, Espeon, Sylveon are the chase cards.',
    releaseDate: '2025-01-17',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=prismatic+evolutions+elite+trainer+box',
  },
  {
    slug: 'pokemon-scarlet-violet-surging-sparks-booster-box',
    name: 'Pokemon Surging Sparks Booster Box',
    sport: 'pokemon',
    year: 2024,
    brand: 'Pokemon',
    type: 'hobby-box',
    retailPrice: 140,
    packsPerBox: 36,
    cardsPerPack: 10,
    totalCards: 360,
    baseCardValue: 5,
    hitRates: [
      { insert: 'Holo Rare', odds: '1:3 packs', avgValue: 2, description: 'Standard holographic rares' },
      { insert: 'Ultra Rare (ex)', odds: '1:6 packs', avgValue: 8, description: 'Pokemon ex cards — ~6 per booster box' },
      { insert: 'Illustration Rare', odds: '1:18 packs', avgValue: 15, description: 'Full-art illustration rares' },
      { insert: 'Special Art Rare (SAR)', odds: '1:36 packs', avgValue: 60, description: 'Special Art Rares — Pikachu, Charizard chase cards' },
      { insert: 'Hyper Rare (Gold)', odds: '1:72 packs', avgValue: 35, description: 'Gold Hyper Rares' },
    ],
    description: 'Major Scarlet & Violet expansion featuring Pikachu ex Special Art Rare as the chase card. Strong Charizard cards. Standard 36-pack booster box.',
    releaseDate: '2024-11-08',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=surging+sparks+booster+box',
  },
  {
    slug: 'pokemon-scarlet-violet-prismatic-evolutions-booster-bundle',
    name: 'Pokemon Prismatic Evolutions Booster Bundle',
    sport: 'pokemon',
    year: 2025,
    brand: 'Pokemon',
    type: 'fat-pack',
    retailPrice: 30,
    packsPerBox: 6,
    cardsPerPack: 10,
    totalCards: 60,
    baseCardValue: 2,
    hitRates: [
      { insert: 'Holo Rare', odds: '1:3 packs', avgValue: 3, description: 'Holographic rares' },
      { insert: 'Ultra Rare (ex)', odds: '1:12 packs', avgValue: 15, description: 'Pokemon ex cards — half per bundle on average' },
      { insert: 'Illustration Rare', odds: '1:18 packs', avgValue: 25, description: 'Full-art illustration rares' },
      { insert: 'Special Art Rare (SAR)', odds: '1:36 packs', avgValue: 80, description: 'Special Art Rares — extremely rare in small format' },
    ],
    description: 'Prismatic Evolutions at a lower entry price. Six packs of the most hyped 2025 Pokemon set. Eeveelution artwork chase.',
    releaseDate: '2025-01-17',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=prismatic+evolutions+booster+bundle',
  },
  {
    slug: '2025-topps-chrome-baseball-hobby',
    name: '2025 Topps Chrome Baseball Hobby Box',
    sport: 'baseball',
    year: 2025,
    brand: 'Topps',
    type: 'hobby-box',
    retailPrice: 280,
    packsPerBox: 24,
    cardsPerPack: 4,
    totalCards: 96,
    baseCardValue: 12,
    hitRates: [
      { insert: 'Chrome Autograph', odds: '1:12 packs', avgValue: 45, description: 'Two guaranteed Chrome autos — Paul Skenes, Merrill chase' },
      { insert: 'Refractor', odds: '1:3 packs', avgValue: 6, description: 'Standard refractor parallels' },
      { insert: 'Numbered Refractor (/199 or less)', odds: '1:8 packs', avgValue: 25, description: 'Gold, Orange, Red, Superfractor chase' },
      { insert: 'X-Fractor / Prism', odds: '1:6 packs', avgValue: 10, description: 'Special pattern refractors' },
    ],
    description: 'Chrome version of 2025 Topps. Two autos per hobby box. Premium refractor parallels of the 2025 rookie class. Paul Skenes Chrome Auto is the chase.',
    releaseDate: '2025-10-15',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2025+topps+chrome+baseball+hobby+box',
  },
  {
    slug: '2024-panini-donruss-football-hobby',
    name: '2024 Panini Donruss Football Hobby Box',
    sport: 'football',
    year: 2024,
    brand: 'Panini',
    type: 'hobby-box',
    retailPrice: 160,
    packsPerBox: 24,
    cardsPerPack: 8,
    totalCards: 192,
    baseCardValue: 6,
    hitRates: [
      { insert: 'Autograph', odds: '1:12 packs', avgValue: 25, description: 'Two guaranteed autos per hobby box' },
      { insert: 'Rated Rookie', odds: '1:4 packs', avgValue: 4, description: 'Rated Rookies of the 2024 NFL draft class' },
      { insert: 'Press Proof Parallel', odds: '1:6 packs', avgValue: 6, description: 'Numbered Press Proof parallels' },
      { insert: 'Holo / Laser', odds: '1:8 packs', avgValue: 10, description: 'Holo and Laser premium parallels' },
    ],
    description: 'Budget-friendly hobby football. Two autos, Rated Rookies of Caleb Williams, Jayden Daniels, MHJ. Solid entry-level product.',
    releaseDate: '2024-11-20',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024+donruss+football+hobby+box',
  },
  {
    slug: '2024-25-panini-nba-hoops-basketball-hobby',
    name: '2024-25 Panini NBA Hoops Basketball Hobby Box',
    sport: 'basketball',
    year: 2024,
    brand: 'Panini',
    type: 'hobby-box',
    retailPrice: 130,
    packsPerBox: 24,
    cardsPerPack: 8,
    totalCards: 192,
    baseCardValue: 5,
    hitRates: [
      { insert: 'Autograph', odds: '1:12 packs', avgValue: 20, description: 'Two guaranteed autos per hobby box' },
      { insert: 'Holo Parallel', odds: '1:4 packs', avgValue: 3, description: 'Holofoil parallels' },
      { insert: 'Artist Proof', odds: '1:8 packs', avgValue: 8, description: 'Numbered Artist Proof parallels' },
      { insert: 'Slam Dunk Insert', odds: '1:6 packs', avgValue: 4, description: 'Slam Dunk and Arriving Now insert sets' },
    ],
    description: 'The most affordable hobby basketball product. Two autos, iconic Hoops brand. Great for beginners and set collectors.',
    releaseDate: '2024-12-04',
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+nba+hoops+basketball+hobby+box',
  },
];

// Helper to calculate EV
export function calculateEV(product: SealedProduct): {
  expectedValue: number;
  roi: number;
  roiPercent: number;
  hitBreakdown: { insert: string; expectedHits: number; expectedValue: number }[];
} {
  let totalHitValue = 0;
  const hitBreakdown: { insert: string; expectedHits: number; expectedValue: number }[] = [];

  for (const hit of product.hitRates) {
    // Parse odds like "1:12 packs" → 12
    const oddsMatch = hit.odds.match(/1:(\d+)/);
    const oddsDenom = oddsMatch ? parseInt(oddsMatch[1], 10) : 1;
    const expectedHits = product.packsPerBox / oddsDenom;
    const expectedValue = expectedHits * hit.avgValue;
    totalHitValue += expectedValue;
    hitBreakdown.push({ insert: hit.insert, expectedHits, expectedValue });
  }

  const expectedValue = totalHitValue + product.baseCardValue;
  const roi = expectedValue - product.retailPrice;
  const roiPercent = ((roi / product.retailPrice) * 100);

  return { expectedValue, roi, roiPercent, hitBreakdown };
}
