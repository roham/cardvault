// Grade-by-grade PSA pricing estimates for iconic cards
// Values based on publicly known eBay sold comps and auction results as of April 2026

export interface GradePricing {
  slug: string;
  grades: GradeRow[];
  sweetSpot: number; // PSA grade number that is the best value
  sourceName: string;
  sourceNote: string;
}

export interface GradeRow {
  grade: number;
  label: string;
  estimatedValue: string;
  population?: number; // PSA population in this grade (if notable)
  trend: 'up' | 'down' | 'flat';
}

export const gradePricingData: GradePricing[] = [
  {
    slug: '1986-87-fleer-michael-jordan-57',
    sweetSpot: 8,
    sourceName: 'eBay Sold Comps / PSA Pop Report',
    sourceNote: 'Estimates based on recent eBay sold listings as of April 2026. Populations are approximate PSA-certified counts.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$800–$1,200', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$1,500–$2,000', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$2,000–$3,000', trend: 'flat' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$3,500–$5,000', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$5,000–$7,500', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$7,500–$12,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$14,000–$20,000', population: 1420, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$28,000–$45,000', population: 2830, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$150,000–$250,000', population: 600, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: '$600,000–$738,000', population: 315, trend: 'up' },
    ],
  },
  {
    slug: '1952-topps-mickey-mantle-311',
    sweetSpot: 7,
    sourceName: 'eBay Sold Comps / Heritage Auctions',
    sourceNote: 'Estimates based on recent sold listings and major auction results as of April 2026.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$8,000–$12,000', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$12,000–$18,000', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$20,000–$30,000', trend: 'up' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$35,000–$50,000', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$60,000–$90,000', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$100,000–$150,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$200,000–$350,000', population: 180, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$500,000–$1,200,000', population: 70, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$12,600,000+', population: 3, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: 'No known examples', population: 0, trend: 'flat' },
    ],
  },
  {
    slug: '2000-playoff-contenders-tom-brady-144',
    sweetSpot: 9,
    sourceName: 'eBay Sold Comps / Goldin Auctions',
    sourceNote: 'Brady Contenders auto values fluctuate significantly by centering and signature quality.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$1,500–$2,500', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$2,500–$4,000', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$5,000–$8,000', trend: 'up' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$8,000–$12,000', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$12,000–$20,000', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$20,000–$35,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$35,000–$80,000', population: 8, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$150,000–$500,000', population: 5, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$1,000,000–$2,500,000', population: 3, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: '$3,107,852 (sold record)', population: 1, trend: 'up' },
    ],
  },
  {
    slug: '1979-80-opee-chee-wayne-gretzky-18',
    sweetSpot: 8,
    sourceName: 'eBay Sold Comps / Goldin Auctions',
    sourceNote: 'Gretzky OPC values are driven by centering and corner sharpness. High-grade copies are extraordinarily rare.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$300–$500', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$600–$1,000', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$1,200–$2,000', trend: 'up' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$2,500–$4,000', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$5,000–$8,000', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$10,000–$20,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$25,000–$60,000', population: 310, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$100,000–$250,000', population: 90, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$1,000,000–$4,300,000', population: 6, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: 'No known examples', population: 0, trend: 'flat' },
    ],
  },
  {
    slug: '2003-04-topps-chrome-lebron-james-111',
    sweetSpot: 9,
    sourceName: 'eBay Sold Comps / PWCC Auctions',
    sourceNote: 'LeBron Chrome rookies are heavily graded — PSA 10 population is growing but grade pressure keeps premium high.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$200–$400', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$400–$700', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$700–$1,200', trend: 'flat' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$1,200–$2,000', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$2,000–$3,500', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$3,500–$6,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$6,000–$10,000', population: 1200, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$12,000–$20,000', population: 2100, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$30,000–$55,000', population: 420, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: '$80,000–$150,000', population: 48, trend: 'up' },
    ],
  },
  {
    slug: '2009-bowman-chrome-mike-trout-bdpp89',
    sweetSpot: 9,
    sourceName: 'eBay Sold Comps',
    sourceNote: 'Trout Bowman Chrome base vs. auto commands dramatically different prices. These estimates are for the base version.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$50–$100', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$100–$200', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$200–$400', trend: 'flat' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$400–$700', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$700–$1,200', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$1,200–$2,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$2,000–$3,500', population: 850, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$4,000–$8,000', population: 1200, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$15,000–$35,000', population: 320, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: '$150,000–$400,000', population: 42, trend: 'up' },
    ],
  },
  {
    slug: '1993-sp-derek-jeter-279',
    sweetSpot: 9,
    sourceName: 'eBay Sold Comps',
    sourceNote: '1993 SP is notoriously difficult to grade due to foil surface sensitivity and print lines.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$50–$100', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$100–$200', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$200–$400', trend: 'flat' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$400–$700', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$700–$1,000', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$1,200–$2,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$2,500–$4,000', population: 380, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$5,000–$10,000', population: 210, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$20,000–$50,000', population: 65, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: '$100,000–$200,000+', population: 8, trend: 'up' },
    ],
  },
  {
    slug: '1996-97-topps-chrome-kobe-bryant-138',
    sweetSpot: 9,
    sourceName: 'eBay Sold Comps / Goldin Auctions',
    sourceNote: 'Kobe demand spiked sharply after January 2020. PSA 10 population is critically small for a modern card.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$200–$400', trend: 'flat' },
      { grade: 2, label: 'Good', estimatedValue: '$400–$700', trend: 'flat' },
      { grade: 3, label: 'Very Good', estimatedValue: '$700–$1,200', trend: 'up' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$1,200–$2,000', trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$2,000–$3,500', trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$4,000–$6,000', trend: 'up' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$8,000–$15,000', population: 950, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$20,000–$40,000', population: 1850, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$60,000–$120,000', population: 380, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: '$200,000–$400,000+', population: 22, trend: 'up' },
    ],
  },
  {
    slug: '2018-19-panini-prizm-luka-doncic-280',
    sweetSpot: 10,
    sourceName: 'eBay Sold Comps',
    sourceNote: 'Modern Prizm cards have higher PSA 10 populations than vintage — the premium is in BGS 10 Black Label.',
    grades: [
      { grade: 4, label: 'VG-EX', estimatedValue: '$50–$100', trend: 'flat' },
      { grade: 5, label: 'Excellent', estimatedValue: '$100–$200', trend: 'flat' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$200–$400', trend: 'flat' },
      { grade: 7, label: 'Near Mint', estimatedValue: '$400–$800', population: 1200, trend: 'up' },
      { grade: 8, label: 'NM-MT', estimatedValue: '$800–$1,500', population: 3200, trend: 'up' },
      { grade: 9, label: 'Mint', estimatedValue: '$1,500–$3,000', population: 8400, trend: 'up' },
      { grade: 10, label: 'Gem Mint', estimatedValue: '$8,000–$15,000', population: 1800, trend: 'up' },
    ],
  },
  {
    slug: '1914-cracker-jack-babe-ruth',
    sweetSpot: 4,
    sourceName: 'Heritage Auctions / Goldin Auctions',
    sourceNote: 'Cracker Jack cards were printed on flimsy stock distributed inside food packaging. High-grade copies are extraordinarily rare.',
    grades: [
      { grade: 1, label: 'Poor', estimatedValue: '$100,000–$200,000', population: 3, trend: 'up' },
      { grade: 2, label: 'Good', estimatedValue: '$250,000–$400,000', population: 2, trend: 'up' },
      { grade: 3, label: 'Very Good', estimatedValue: '$400,000–$700,000', population: 1, trend: 'up' },
      { grade: 4, label: 'VG-EX', estimatedValue: '$800,000–$1,500,000', population: 1, trend: 'up' },
      { grade: 5, label: 'Excellent', estimatedValue: '$2,000,000–$5,000,000', population: 1, trend: 'up' },
      { grade: 6, label: 'EX-MT', estimatedValue: '$8,000,000–$15,000,000+', population: 0, trend: 'flat' },
    ],
  },
];

export function getGradePricing(slug: string): GradePricing | undefined {
  return gradePricingData.find(g => g.slug === slug);
}
