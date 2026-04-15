export interface GradingTier {
  name: string;
  price: string;
  turnaround: string;
  minValue: string;
}

export interface GradeScale {
  grade: string;
  label: string;
  description: string;
}

export interface GradingCompany {
  slug: string;
  name: string;
  fullName: string;
  founded: number;
  headquarters: string;
  slabColor: string;
  accent: string;       // Tailwind color class for UI accent
  accentBg: string;     // Tailwind bg class
  accentBorder: string; // Tailwind border class
  description: string;
  overview: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  website: string;
  totalCardsGraded: string;
  marketShare: string;
  tiers: GradingTier[];
  gradeScale: GradeScale[];
  faq: { question: string; answer: string }[];
}

export const gradingCompanies: GradingCompany[] = [
  {
    slug: 'psa',
    name: 'PSA',
    fullName: 'Professional Sports Authenticator',
    founded: 1991,
    headquarters: 'Santa Ana, California',
    slabColor: 'Red label',
    accent: 'text-red-400',
    accentBg: 'bg-red-950/60',
    accentBorder: 'border-red-800/50',
    description: 'The most recognized and liquid grading company in the hobby. PSA-graded cards command the highest premiums and sell fastest on the secondary market.',
    overview: 'PSA (Professional Sports Authenticator) is the largest and most well-known card grading company in the world, founded in 1991 by Collectors Universe. They have graded over 50 million cards and are considered the gold standard for sports card authentication and grading. PSA uses a simple 1-10 numerical scale that is universally understood by collectors and dealers. Their red-labeled slabs are instantly recognizable and command the highest market premiums of any grading company.',
    strengths: [
      'Highest resale premiums — PSA 10s consistently sell for 15-40% more than equivalent BGS 9.5s',
      'Most liquid — PSA-graded cards sell faster on eBay, Goldin, and other platforms',
      'Largest population reports — comprehensive data for price comparisons',
      'Universal brand recognition — even casual collectors know PSA',
      'Simple 1-10 scale is easy to understand for beginners',
      'Best for vintage cards — PSA is the industry standard for pre-1980 cards',
    ],
    weaknesses: [
      'Longer turnaround times than competitors — economy service can take 6+ months',
      'Higher pricing at premium tiers compared to competitors',
      'No subgrades — you only get a single overall number',
      'Inconsistent grading standards reported by some collectors (especially post-COVID)',
      'Older slab designs are easier to counterfeit than competitors',
    ],
    bestFor: [
      'Vintage cards (pre-1980)',
      'High-value cards you plan to sell',
      'Long-term investment holds',
      'Cards where maximum resale value matters',
      'Baseball cards (historically strongest PSA market)',
    ],
    website: 'https://www.psacard.com',
    totalCardsGraded: '50M+',
    marketShare: '~60%',
    tiers: [
      { name: 'Value', price: '$25/card', turnaround: '65 business days', minValue: 'Under $499' },
      { name: 'Economy', price: '$40/card', turnaround: '45 business days', minValue: 'Under $499' },
      { name: 'Regular', price: '$75/card', turnaround: '20 business days', minValue: 'Under $1,499' },
      { name: 'Express', price: '$150/card', turnaround: '10 business days', minValue: 'Under $2,499' },
      { name: 'Super Express', price: '$300/card', turnaround: '5 business days', minValue: 'Under $4,999' },
      { name: 'Walk-Through', price: '$600/card', turnaround: '2 business days', minValue: 'Under $9,999' },
      { name: 'Premium', price: '$1,000/card', turnaround: '1 business day', minValue: '$10,000+' },
    ],
    gradeScale: [
      { grade: '10', label: 'Gem Mint', description: 'Perfect centering (50/50), sharp corners, pristine edges, flawless surface. Virtually perfect card.' },
      { grade: '9', label: 'Mint', description: 'One minor flaw. Centering 55/45 or better. Slight print spot or minor surface imperfection allowed.' },
      { grade: '8', label: 'Near Mint-Mint', description: 'Slight centering shift (60/40 or better). Minor corner or edge wear. Very slight surface issues.' },
      { grade: '7', label: 'Near Mint', description: 'Slight surface wear. Minor corner fuzzing. Centering 65/35 or better. Light print defects.' },
      { grade: '6', label: 'Excellent-Mint', description: 'Noticeable wear on corners and edges. Visible centering shift. Minor crease allowed in vintage.' },
      { grade: '5', label: 'Excellent', description: 'Moderate corner wear. Rough edges in spots. Surface scuffing. Light crease possible.' },
      { grade: '4', label: 'Very Good-Excellent', description: 'Corner rounding. Edge wear throughout. Surface scratches. One light crease.' },
      { grade: '3', label: 'Very Good', description: 'Heavy corner rounding. Creases. Surface marks. Still structurally sound.' },
      { grade: '2', label: 'Good', description: 'Major wear throughout. Heavy creases. Staining possible. Card is complete but well-loved.' },
      { grade: '1', label: 'Poor', description: 'Severe damage. Heavy creases, tears, writing, stains. Lowest assignable grade — card is authentic and complete.' },
    ],
    faq: [
      {
        question: 'How much does PSA grading cost?',
        answer: 'PSA grading starts at $25 per card for their Value tier (65 business day turnaround) and goes up to $1,000+ per card for Premium 1-day service. The most popular tier is Economy at $40/card with a ~45 business day turnaround. Bulk submissions (20+ cards at the same tier) often qualify for discounted per-card pricing.',
      },
      {
        question: 'How long does PSA grading take in 2026?',
        answer: 'PSA turnaround times in 2026 range from 65 business days (Value, $25/card) to 1 business day (Premium, $1,000/card). The most common Economy tier ($40/card) takes approximately 45 business days. Express service ($150/card) delivers in about 10 business days. Times can vary during peak submission periods like after major product releases.',
      },
      {
        question: 'Is PSA grading worth it for my cards?',
        answer: 'PSA grading is worth it when the PSA 10 (or PSA 9 for vintage) premium exceeds the grading cost by at least 2-3x. For example, if a raw card sells for $50 and a PSA 10 sells for $200, the $150 premium easily covers the $25-75 grading fee. PSA is especially worth it for rookie cards, vintage cards, and any card worth $100+ raw. Use our Grading ROI Calculator to check specific cards.',
      },
      {
        question: 'What is the difference between PSA 9 and PSA 10?',
        answer: 'A PSA 10 (Gem Mint) requires near-perfect centering (50/50 to 52/48), razor-sharp corners, pristine edges, and a flawless surface. A PSA 9 (Mint) allows one minor flaw — slightly off-center (up to 55/45), a faint print dot, or a barely visible surface mark. The price difference between PSA 9 and 10 varies wildly by card: for modern cards, PSA 10 can be 2-5x more; for vintage, a PSA 9 is often the practical "top grade" and commands massive premiums.',
      },
      {
        question: 'Can I get a PSA card regraded?',
        answer: 'Yes, PSA offers a Review service where you can request a regrade of a previously PSA-graded card. The card stays in the holder if the grade doesn\'t change or goes down, and gets a new holder if upgraded. Many collectors submit cards they believe are under-graded, especially from older eras when standards were different. There is a fee for the service regardless of the outcome.',
      },
    ],
  },
  {
    slug: 'bgs',
    name: 'BGS',
    fullName: 'Beckett Grading Services',
    founded: 1999,
    headquarters: 'Dallas, Texas',
    slabColor: 'Black label (10) / Gold label',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-950/60',
    accentBorder: 'border-amber-800/50',
    description: 'Known for their detailed subgrade system and coveted Black Label 10. BGS offers the most granular grading with four subgrades: centering, corners, edges, and surface.',
    overview: 'Beckett Grading Services (BGS) is the second-largest card grading company, operated by Beckett Media — the publisher of Beckett price guides since 1984. BGS differentiates itself with a unique subgrade system that breaks down each card\'s condition into four categories: Centering, Corners, Edges, and Surface. Each subgrade gets its own score (1-10 in half-point increments), and the overall grade is calculated from these four components. The coveted BGS Black Label 10 (all four subgrades must be 10) is one of the rarest and most valuable grades in the hobby.',
    strengths: [
      'Subgrades provide detailed condition breakdown — four scores instead of one',
      'BGS Black Label 10 commands massive premiums (often higher than PSA 10)',
      'Half-point grading increments (9, 9.5, 10) allow finer differentiation',
      'Stronger slab construction with better tamper-evident design',
      'Beckett brand heritage — trusted name in card collecting since 1984',
      'Best for modern cards, especially basketball and football',
    ],
    weaknesses: [
      'Lower liquidity than PSA — BGS cards can take longer to sell',
      'BGS 9.5 generally sells for less than PSA 10 despite similar standards',
      'More complex grading scale confuses beginners',
      'Slower turnaround compared to CGC and SGC at similar price points',
      'Inconsistent premium — some collectors only want PSA, reducing your buyer pool',
    ],
    bestFor: [
      'Modern cards (2000-present) where subgrades add value',
      'Basketball and football cards (strong BGS collector base)',
      'Cards you believe could grade BGS Black Label 10',
      'Personal collection (subgrades help you understand condition better)',
      'Crossover candidates — a BGS 9.5 with strong subgrades often crosses to PSA 10',
    ],
    website: 'https://www.beckett.com/grading',
    totalCardsGraded: '20M+',
    marketShare: '~20%',
    tiers: [
      { name: 'Economy', price: '$25/card', turnaround: '80+ business days', minValue: 'Under $250' },
      { name: 'Standard', price: '$40/card', turnaround: '30 business days', minValue: 'Under $500' },
      { name: 'Express', price: '$80/card', turnaround: '15 business days', minValue: 'Under $1,000' },
      { name: 'Priority', price: '$150/card', turnaround: '5 business days', minValue: 'Under $2,500' },
      { name: 'Premium', price: '$250/card', turnaround: '2 business days', minValue: '$2,500+' },
    ],
    gradeScale: [
      { grade: '10', label: 'Pristine (Black Label)', description: 'All four subgrades must be 10. Perfect in every way. Extremely rare — fewer than 1% of submissions achieve this.' },
      { grade: '10', label: 'Pristine (Gold Label)', description: 'Overall 10 with subgrades averaging 10 but not all individual 10s. Near-perfect card.' },
      { grade: '9.5', label: 'Gem Mint', description: 'Exceptional card. Minimum 9 on all subgrades with at least two 9.5s. The practical "top grade" for most cards.' },
      { grade: '9', label: 'Mint', description: 'Outstanding card. All subgrades 8.5 or higher. Minor imperfections barely visible.' },
      { grade: '8.5', label: 'Near Mint-Mint+', description: 'Sharp card with slight imperfections. One subgrade may be 8.' },
      { grade: '8', label: 'Near Mint-Mint', description: 'Slight wear visible. Centering within 65/35. Minor corner or edge wear.' },
      { grade: '7.5', label: 'Near Mint+', description: 'Noticeable centering or minor surface wear. Still an attractive card.' },
      { grade: '7', label: 'Near Mint', description: 'Light wear throughout. Some corner fuzzing and edge roughness.' },
    ],
    faq: [
      {
        question: 'What are BGS subgrades?',
        answer: 'BGS subgrades are four individual condition scores (each on a 1-10 scale in half-point increments) that make up the overall BGS grade: Centering (how well-centered the card is front and back), Corners (sharpness of all four corners), Edges (smoothness and cleanliness of the card edges), and Surface (freedom from print defects, scratches, and marks). The overall grade is a weighted calculation from these four subgrades — the lowest subgrade has the most impact.',
      },
      {
        question: 'What is a BGS Black Label 10?',
        answer: 'A BGS Black Label 10 means all four subgrades (Centering, Corners, Edges, Surface) received a perfect 10. The label is literally black instead of gold. Black Label 10s are extremely rare — typically fewer than 1% of all submissions achieve this grade. For popular modern cards, a BGS Black Label 10 can sell for 5-20x more than a regular BGS 10 or even a PSA 10, making it one of the most valuable designations in card grading.',
      },
      {
        question: 'Is BGS or PSA better for modern cards?',
        answer: 'For modern cards, the answer depends on your goal. If you plan to sell, PSA 10 generally sells faster and for slightly more than a BGS 9.5 in most cases. However, if you have a card that might achieve a BGS Black Label 10, BGS can be significantly more valuable. For personal collection, many prefer BGS because subgrades provide more information about your card\'s condition. Many collectors use a "BGS first, crossover to PSA" strategy — submit to BGS, and if it gets a 9.5 with strong subgrades (9.5/10/10/10), crossover to PSA where it often receives a PSA 10.',
      },
      {
        question: 'How does BGS grading work?',
        answer: 'BGS evaluates each card across four categories: Centering (front and back), Corners (all four), Edges (top, bottom, left, right), and Surface (front and back for defects). Each receives a half-point grade (e.g., 9, 9.5, 10). The overall grade is calculated as a weighted average with the lowest subgrade having disproportionate impact — you cannot get a BGS 10 overall if any subgrade is below 9. Graders use magnification tools and standardized lighting to evaluate each attribute.',
      },
      {
        question: 'Can I crossover a BGS card to PSA?',
        answer: 'Yes, many collectors submit BGS-graded cards to PSA for crossover grading. The most common strategy is submitting BGS 9.5s with strong subgrades (particularly 10 centering) to PSA, where they frequently receive a PSA 10. This can increase the card\'s value since PSA 10 premiums often exceed BGS 9.5 premiums. The success rate for BGS 9.5 → PSA 10 crossovers varies but is generally estimated at 30-60% depending on the subgrade profile.',
      },
    ],
  },
  {
    slug: 'cgc',
    name: 'CGC',
    fullName: 'Certified Guaranty Company (Cards)',
    founded: 2020,
    headquarters: 'Sarasota, Florida',
    slabColor: 'Green/Clear label',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-950/60',
    accentBorder: 'border-emerald-800/50',
    description: 'The newest major grading company, backed by the trusted CGC Comics brand. Fast turnaround, competitive pricing, and subgrades are attracting a growing collector base.',
    overview: 'CGC Cards (Certified Guaranty Company) launched their trading card grading division in 2020, leveraging 20+ years of trusted grading experience from CGC Comics — the world\'s largest comic book grading company. Despite being the newest entrant, CGC has rapidly gained market share by offering competitive pricing, fast turnaround times, and optional subgrades. Their high-security slab design incorporates an inner well with a microprint security label. CGC is particularly popular with Pokemon and TCG collectors, and their market acceptance for sports cards is growing steadily.',
    strengths: [
      'Fastest turnaround times of any major grading company',
      'Competitive pricing — often the cheapest option for bulk submissions',
      'Optional subgrades (centering, corners, edges, surface) at additional cost',
      'High-security slab design with microprint anti-counterfeit features',
      'Backed by CGC Comics — 20+ years of trusted grading heritage',
      'Strong and growing acceptance in the Pokemon/TCG market',
    ],
    weaknesses: [
      'Lower premiums than PSA — CGC 10 sells for less than PSA 10 in most cases',
      'Relatively new to sports cards — smaller population reports',
      'Market acceptance still growing — some collectors hesitant to buy CGC sports cards',
      'CGC 10 "Pristine" vs CGC 9.5 "Gem Mint" labeling can confuse collectors used to PSA/BGS terminology',
      'Smaller collector base means fewer comparable sales data points',
    ],
    bestFor: [
      'Pokemon and TCG cards (strong CGC market)',
      'Budget-conscious grading with fast turnaround',
      'Bulk submissions where speed and cost matter',
      'Cards you want subgrades on without paying BGS premiums',
      'Modern cards in the $20-$200 range where PSA premiums don\'t justify the cost',
    ],
    website: 'https://www.cgccards.com',
    totalCardsGraded: '10M+',
    marketShare: '~12%',
    tiers: [
      { name: 'Economy', price: '$15/card', turnaround: '50 business days', minValue: 'Under $250' },
      { name: 'Standard', price: '$30/card', turnaround: '20 business days', minValue: 'Under $500' },
      { name: 'Express', price: '$60/card', turnaround: '10 business days', minValue: 'Under $1,000' },
      { name: 'Priority', price: '$120/card', turnaround: '5 business days', minValue: 'Under $2,500' },
      { name: 'Walk-Through', price: '$250/card', turnaround: '2 business days', minValue: '$2,500+' },
    ],
    gradeScale: [
      { grade: '10', label: 'Pristine', description: 'Virtually flawless card. Perfect centering, sharp corners, clean edges, spotless surface. The highest CGC grade.' },
      { grade: '9.5', label: 'Gem Mint', description: 'Exceptional condition with only the most minor imperfection. Equivalent to what many would consider a "10" from other companies.' },
      { grade: '9', label: 'Mint', description: 'Outstanding card with one minor flaw. Slight centering shift or nearly invisible surface mark.' },
      { grade: '8.5', label: 'Near Mint/Mint+', description: 'Excellent card with very minor wear. Centering within 60/40.' },
      { grade: '8', label: 'Near Mint/Mint', description: 'Sharp card with slight wear on corners or edges. Minor surface imperfections.' },
      { grade: '7.5', label: 'Near Mint+', description: 'Light wear throughout. Some edge or corner softness.' },
      { grade: '7', label: 'Near Mint', description: 'Noticeable wear but still an attractive card. Minor creasing possible.' },
    ],
    faq: [
      {
        question: 'How much does CGC card grading cost?',
        answer: 'CGC card grading starts at $15 per card for their Economy tier (50 business day turnaround) — the cheapest option among major grading companies. Standard service is $30/card with a 20 business day turnaround. Adding subgrades costs an additional $10 per card at any tier. CGC frequently runs promotions and bulk submission discounts that can bring the per-card cost even lower.',
      },
      {
        question: 'Is CGC grading accepted for sports cards?',
        answer: 'CGC grading acceptance for sports cards has grown significantly since 2020 but still trails PSA and BGS. CGC-graded sports cards are fully accepted and sell well on eBay, COMC, and other marketplaces, though they typically sell for 10-30% less than equivalent PSA grades. For Pokemon and TCG cards, CGC is widely accepted and sometimes preferred over other options. The gap is closing as more collectors recognize CGC\'s quality standards and heritage from their comic book grading division.',
      },
      {
        question: 'What is the difference between CGC 10 and 9.5?',
        answer: 'CGC uses "Pristine" for their 10 grade and "Gem Mint" for 9.5 — which is different from PSA where 10 is "Gem Mint." A CGC 10 Pristine is extremely strict, requiring near-perfection in all categories. A CGC 9.5 Gem Mint is the more commonly achievable top grade and is roughly equivalent to a PSA 10 in terms of card quality. This labeling difference is important to understand when comparing across companies.',
      },
      {
        question: 'Does CGC offer subgrades?',
        answer: 'Yes, CGC offers optional subgrades for an additional $10 per card on top of the base grading fee. The subgrades cover the same four categories as BGS: Centering, Corners, Edges, and Surface. Unlike BGS where subgrades are included in the price, CGC gives you the choice — useful for personal collection cards where you want the detail, or when you want to evaluate crossover potential to PSA.',
      },
      {
        question: 'Is CGC better than PSA for Pokemon cards?',
        answer: 'For Pokemon cards specifically, CGC is a strong choice. CGC has significant market acceptance in the Pokemon community, faster turnaround times, lower prices, and their grading standards are well-suited to modern printed cards. While PSA 10 Pokemon cards still command premiums, the gap is smaller for Pokemon than for sports cards. Many Pokemon collectors prefer CGC for cards under $200 in value, and PSA for higher-value vintage Pokemon cards.',
      },
    ],
  },
  {
    slug: 'sgc',
    name: 'SGC',
    fullName: 'Sportscard Guaranty Corporation',
    founded: 1998,
    headquarters: 'Parsippany, New Jersey',
    slabColor: 'Tuxedo (black/white)',
    accent: 'text-sky-400',
    accentBg: 'bg-sky-950/60',
    accentBorder: 'border-sky-800/50',
    description: 'The vintage card specialist. SGC is known for fast service, consistent grading, and their iconic tuxedo slab design that beautifully displays older cards.',
    overview: 'SGC (Sportscard Guaranty Corporation) has been grading cards since 1998 and has built a strong reputation as the vintage card specialist. Their distinctive black-and-white "tuxedo" slab design is one of the most attractive holders in the hobby, particularly for vintage cards where the clean design complements older card aesthetics. SGC is known for consistent grading standards, excellent customer service, and the fastest turnaround times in the industry. While historically focused on vintage sports cards, SGC has expanded to grade modern cards and has been gaining market share across all eras.',
    strengths: [
      'Best slab design in the hobby — "tuxedo" slab showcases cards beautifully',
      'Fastest consistent turnaround times among major grading companies',
      'Most consistent grading standards — less variability between graders',
      'Excellent customer service and communication',
      'Strong reputation for vintage and pre-war cards',
      'Competitive pricing especially at the economy level',
    ],
    weaknesses: [
      'Lower premiums than PSA and BGS for modern cards',
      'Smallest market share of the four major companies',
      'No subgrades offered',
      'Some dealers and auction houses don\'t accept SGC at the same premium as PSA',
      'Population reports are less comprehensive than PSA',
      'Limited international recognition outside North America',
    ],
    bestFor: [
      'Vintage cards (pre-1970) — SGC "tuxedo" slabs look stunning with older cards',
      'Fast turnaround needs — SGC is consistently the quickest',
      'Consistent grading — if fair standards matter more than maximum premium',
      'Mid-value cards ($50-$500) where grading cost matters',
      'Pre-war and tobacco cards — SGC is highly respected for these eras',
    ],
    website: 'https://www.sgccard.com',
    totalCardsGraded: '8M+',
    marketShare: '~8%',
    tiers: [
      { name: 'Economy', price: '$18/card', turnaround: '20 business days', minValue: 'Under $500' },
      { name: 'Regular', price: '$35/card', turnaround: '10 business days', minValue: 'Under $1,500' },
      { name: 'Express', price: '$75/card', turnaround: '5 business days', minValue: 'Under $5,000' },
      { name: 'Premium', price: '$200/card', turnaround: '2 business days', minValue: '$5,000+' },
    ],
    gradeScale: [
      { grade: '10', label: 'Gem Mint', description: 'Perfect card in all respects. Centering within 52/48, pristine corners, flawless surface. The ultimate SGC grade.' },
      { grade: '9.5', label: 'Mint+', description: 'Nearly perfect. Centering within 55/45. Extremely minor imperfection barely visible under magnification.' },
      { grade: '9', label: 'Mint', description: 'Outstanding card. One minor flaw — slight centering shift or faint print mark.' },
      { grade: '8.5', label: 'Near Mint/Mint+', description: 'Excellent card with very minor wear. Slightly off-center or minor edge softness.' },
      { grade: '8', label: 'Near Mint/Mint', description: 'Sharp card. Centering within 60/40. Minor corner or edge wear.' },
      { grade: '7', label: 'Near Mint', description: 'Attractive card with light wear. Some corner fuzzing and minor surface marks.' },
      { grade: '6', label: 'Excellent/Near Mint', description: 'Moderate wear. Visible centering issues, corner wear, minor creases.' },
      { grade: '5', label: 'Excellent', description: 'Noticeable wear throughout. Corner rounding, edge wear, possible light creases.' },
    ],
    faq: [
      {
        question: 'How much does SGC grading cost?',
        answer: 'SGC grading starts at $18 per card for Economy service with a 20 business day turnaround — making it one of the most affordable options in the hobby. Regular service is $35/card with 10 business day turnaround. Express ($75, 5 days) and Premium ($200, 2 days) tiers are available for urgent submissions. SGC also offers bulk discounts for 50+ card submissions.',
      },
      {
        question: 'Is SGC grading worth it?',
        answer: 'SGC grading is absolutely worth it for vintage cards (pre-1970), mid-value cards ($50-$500), and any situation where fast turnaround matters. SGC 10s for modern cards sell for less than PSA 10s (typically 20-40% less), but the lower grading cost can make it profitable anyway. For vintage cards, the gap is much smaller — many collectors actually prefer SGC for pre-war and tobacco cards, where the tuxedo slab design is widely admired.',
      },
      {
        question: 'What is the SGC tuxedo slab?',
        answer: 'The "tuxedo" slab is SGC\'s signature holder design — a sleek black-and-white case that many collectors consider the best-looking slab in the hobby. The clean, elegant design is particularly striking with vintage cards, and the black background makes card imagery pop. SGC redesigned their slab several times, with the current tuxedo version being the most popular. Some collectors specifically choose SGC for the aesthetic appeal of the holder.',
      },
      {
        question: 'Can I crossover an SGC card to PSA?',
        answer: 'Yes, crossover from SGC to PSA is common. SGC 10s have a decent crossover rate to PSA 10 (estimated 40-60%), and even SGC 9.5s sometimes cross to PSA 10. The main reason to crossover is the premium difference — a PSA 10 typically sells for more than an SGC 10. However, the crossover cost (SGC grading fee + PSA submission fee) means this strategy works best for cards where the PSA premium exceeds $100+.',
      },
      {
        question: 'Is SGC good for modern cards?',
        answer: 'SGC is a solid budget option for modern cards. While SGC 10s sell for less than PSA 10s on modern cards, the combination of lower grading fees ($18 vs $25-40) and faster turnaround makes SGC attractive for mid-value modern cards. If you\'re grading cards in the $20-$200 raw value range where the PSA premium difference is small, SGC\'s lower cost can actually make it the more profitable choice. SGC is also a good "pre-screen" — grade with SGC first to identify your true gem mint cards, then crossover the best ones to PSA.',
      },
    ],
  },
];

export function getGradingCompany(slug: string): GradingCompany | undefined {
  return gradingCompanies.find(c => c.slug === slug);
}
