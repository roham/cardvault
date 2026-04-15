export interface CardBrand {
  slug: string;
  name: string;
  founded: number;
  headquarters: string;
  sports: string[];
  description: string;
  history: string;
  keyProducts: { name: string; description: string; slug?: string }[];
  collectingTips: string[];
  famousCards: { name: string; year: number; value: string }[];
  prosAndCons: { pros: string[]; cons: string[] };
}

export const cardBrands: CardBrand[] = [
  {
    slug: 'topps',
    name: 'Topps',
    founded: 1938,
    headquarters: 'New York, NY (now owned by Fanatics)',
    sports: ['baseball', 'football', 'hockey', 'soccer', 'MLS'],
    description: 'The most iconic name in baseball cards. Topps has been the exclusive MLB card maker since 2009 and holds the longest continuous run of any card manufacturer. Now owned by Fanatics as part of the massive sports licensing reshuffling.',
    history: 'Founded in 1938 as a chewing gum company, Topps entered the baseball card market in 1951 and quickly became the dominant brand. The 1952 Topps Mickey Mantle (#311) is the most iconic post-war baseball card. Topps held a virtual monopoly on baseball cards from the late 1950s until competition arrived in 1981. After decades of competition with Fleer, Donruss, and Upper Deck, Topps regained exclusive MLB rights in 2009. Fanatics acquired Topps in January 2022 for $500 million, signaling the future of sports cards under the Fanatics umbrella.',
    keyProducts: [
      { name: 'Topps Series 1 & 2', description: 'The flagship annual baseball set. The gold standard for base cards and rookies since 1952.', slug: '2025-topps-series-1-hobby' },
      { name: 'Topps Chrome', description: 'Chromium technology version of the flagship set. Refractor parallels are the modern chase.', slug: '2025-topps-chrome-baseball-hobby' },
      { name: 'Bowman Chrome', description: 'The prospect collector\'s bible. 1st Bowman Chrome cards are the standard for pre-debut prospects.', slug: '2024-bowman-chrome-hobby' },
      { name: 'Topps Heritage', description: 'Vintage-inspired designs paying tribute to classic Topps sets from the 1950s-2000s.', slug: '2024-topps-heritage-hobby' },
      { name: 'Topps Inception', description: 'Ultra-premium single-pack product with guaranteed autographs and acetate cards.', slug: '2024-topps-inception-baseball-hobby' },
      { name: 'Stadium Club', description: 'Photography-focused product with full-bleed borderless images. The art lover\'s choice.' },
    ],
    collectingTips: [
      'Topps Series 1 rookies are the most liquid baseball cards — easy to buy and sell',
      'Bowman Chrome 1st cards of top prospects can be worth hundreds before the player even debuts',
      'Refractor parallels (Chrome, Bowman Chrome) carry significant premiums over base',
      'Heritage short prints (SPs) and error cards are the real value — not the base set',
      'Buy flagship products at retail when possible — hobby boxes carry a premium',
    ],
    famousCards: [
      { name: '1952 Topps Mickey Mantle #311', year: 1952, value: '$12.6M (PSA 9)' },
      { name: '2009 Bowman Chrome Mike Trout #BDPP89', year: 2009, value: '$3.9M (BGS 10)' },
      { name: '2011 Topps Update Mike Trout RC #US175', year: 2011, value: '$200K+ (PSA 10)' },
      { name: '1993 SP Derek Jeter RC #279', year: 1993, value: '$100K+ (PSA 10)' },
      { name: '1989 Upper Deck Ken Griffey Jr RC #1', year: 1989, value: '$15K+ (PSA 10)' },
    ],
    prosAndCons: {
      pros: ['Exclusive MLB license — the only game in town for baseball', 'Longest history and strongest brand recognition', 'Chrome and Bowman Chrome are universally collected', 'Wide retail distribution'],
      cons: ['Monopoly position means less competition on price/innovation', 'Fanatics ownership creates uncertainty about the future', 'Base cards have little resale value', 'Topps Update often cannibalizes Series 1/2 rookies'],
    },
  },
  {
    slug: 'panini',
    name: 'Panini',
    founded: 1961,
    headquarters: 'Modena, Italy / Irving, TX',
    sports: ['basketball', 'football', 'soccer'],
    description: 'The dominant force in basketball and football cards. Panini\'s Prizm brand created the modern standard for NBA and NFL rookie cards. Their exclusive NBA and NFL licenses make them the only option for major sport card collectors — but these licenses expire in 2025-2026 as Fanatics takes over.',
    history: 'Founded in Italy in 1961, Panini became globally known for soccer sticker albums before entering the American sports card market. After acquiring Donruss in 2009, Panini secured exclusive NBA and NFL licenses. The introduction of Prizm in 2012 revolutionized modern card collecting — the Silver Prizm became THE standard for modern rookie cards. However, Panini\'s licenses will transition to Fanatics starting in 2025-2026, creating both uncertainty and potential last-year premium for Panini products.',
    keyProducts: [
      { name: 'Panini Prizm', description: 'The king of modern sports cards. Silver Prizms are the gold standard for NBA and NFL rookies.', slug: '2024-25-panini-prizm-basketball-hobby' },
      { name: 'Panini Select', description: 'Three-tier card system (Concourse, Premier, Club) with stunning die-cut parallels.' },
      { name: 'Panini Contenders', description: 'Home of the iconic Rookie Ticket autograph — the most recognizable modern auto design.' },
      { name: 'Panini Mosaic', description: 'Stained glass-style pattern cards. Genesis parallels are the chase.' },
      { name: 'Donruss / Donruss Optic', description: 'Rated Rookies are an iconic design. Optic is the chrome version. Budget-friendly entry point.' },
      { name: 'National Treasures', description: 'The ultra-premium product. Rookie Patch Autos (RPAs) are the gold standard for high-end modern cards.' },
    ],
    collectingTips: [
      'Silver Prizms are the default comparison card — always check Silver Prizm prices first',
      'Contenders Rookie Ticket autos are on-card signatures, which carry a premium over sticker autos',
      'Last-year Panini products (2024-25 basketball, 2024 football) may carry premium due to license transition',
      'Select die-cuts are visually distinctive but fragile — centering and corners are hard to get perfect',
      'National Treasures RPAs of top rookies can be worth $10K+ for stars like Wembanyama',
    ],
    famousCards: [
      { name: '2012-13 Panini Prizm LeBron James #1', year: 2012, value: '$50K+ (PSA 10 Silver)' },
      { name: '2018-19 Panini Prizm Luka Doncic RC', year: 2018, value: '$30K+ (PSA 10 Silver)' },
      { name: '2017 Panini Prizm Patrick Mahomes II RC', year: 2017, value: '$15K+ (PSA 10 Silver)' },
      { name: '2020 Panini Prizm Justin Herbert RC', year: 2020, value: '$3K+ (PSA 10 Silver)' },
      { name: '2023-24 Panini Prizm Victor Wembanyama RC', year: 2023, value: '$5K+ (PSA 10 Silver est.)' },
    ],
    prosAndCons: {
      pros: ['Prizm is universally collected and liquid', 'Multiple product tiers from budget to ultra-premium', 'Contenders on-card autos are highly valued', 'Strong basketball and football presence'],
      cons: ['Licenses expiring — Fanatics transition creates uncertainty', 'Quality control inconsistencies (centering, surface issues)', 'No MLB license', 'Sticker autos in some products feel cheap'],
    },
  },
  {
    slug: 'upper-deck',
    name: 'Upper Deck',
    founded: 1988,
    headquarters: 'Carlsbad, CA',
    sports: ['hockey'],
    description: 'The exclusive license holder for NHL cards and the creator of the iconic Young Guns rookie card brand. Upper Deck revolutionized the hobby in 1989 with their premium card design and anti-counterfeiting hologram. Now focused primarily on hockey after losing MLB and NBA licenses.',
    history: 'Upper Deck launched in 1989 with the iconic Ken Griffey Jr. rookie card (#1) and instantly disrupted the market with higher quality card stock, UV coating, and a hologram to prevent counterfeiting. They held MLB, NBA, and NHL licenses simultaneously in the 1990s and early 2000s. After losing MLB (to Topps) and NBA (to Panini), Upper Deck retained exclusive NHL rights, making them the only manufacturer of licensed hockey cards.',
    keyProducts: [
      { name: 'Upper Deck Series 1 & 2', description: 'The flagship hockey set. Young Guns rookies are THE hockey rookie card brand.', slug: '2024-25-upper-deck-series-1-hockey-hobby' },
      { name: 'SP Authentic', description: 'The premium hockey auto product. Future Watch auto patches are the gold standard.', slug: '2024-25-sp-authentic-hockey-hobby' },
      { name: 'Upper Deck MVP', description: 'Budget-friendly hockey product. Great for set builders and beginners.' },
      { name: 'The Cup', description: 'Ultra-premium hockey. $500+ per pack. Autograph patch cards of legends and rookies.' },
      { name: 'Upper Deck Extended Series', description: 'Third series catching late-season rookies. Young Guns Update cards.' },
    ],
    collectingTips: [
      'Young Guns rookies from Series 1 are always more valuable than Series 2 or Extended',
      'SP Authentic Future Watch auto patches are the hockey equivalent of National Treasures RPAs',
      'Canvas parallels are affordable and visually appealing — great entry point',
      'Hockey cards are considered undervalued vs baseball/basketball — potential upside',
      'McDavid, Crosby, and now Celebrini Young Guns carry the biggest premiums',
    ],
    famousCards: [
      { name: '1989 Upper Deck Ken Griffey Jr #1', year: 1989, value: '$15K+ (PSA 10)' },
      { name: '2005-06 Upper Deck Sidney Crosby Young Guns RC', year: 2005, value: '$3K+ (PSA 10)' },
      { name: '2015-16 Upper Deck Connor McDavid Young Guns RC', year: 2015, value: '$5K+ (PSA 10)' },
      { name: '1979-80 O-Pee-Chee Wayne Gretzky RC', year: 1979, value: '$1.3M (PSA 10)' },
      { name: '2024-25 Upper Deck Macklin Celebrini Young Guns RC', year: 2024, value: '$200+ (PSA 10 est.)' },
    ],
    prosAndCons: {
      pros: ['Exclusive NHL license — only option for hockey cards', 'Young Guns is the most iconic hockey rookie brand', 'High quality card stock and printing', 'Hockey is considered undervalued vs other sports'],
      cons: ['Limited to hockey only', 'No basketball or baseball products', 'Young Guns can be hard to pull at retail', 'Premium products (The Cup) are extremely expensive'],
    },
  },
  {
    slug: 'pokemon-tcg',
    name: 'The Pokemon Company (Pokemon TCG)',
    founded: 1996,
    headquarters: 'Tokyo, Japan / Bellevue, WA',
    sports: ['pokemon'],
    description: 'The largest trading card game in the world by sales volume. Pokemon cards combine collectibility with an active competitive game, creating dual demand. The Scarlet & Violet era has produced some of the most beautiful cards in the game\'s history, with Special Art Rares commanding premium prices.',
    history: 'The Pokemon Trading Card Game launched in Japan in 1996 and came to the US in 1999, becoming an instant cultural phenomenon. After decades of steady popularity, the market exploded in 2020-2021 during the pandemic boom, with vintage cards reaching millions at auction. While prices have normalized from the peak, Pokemon remains the most collected trading card game globally, with new set releases generating massive demand.',
    keyProducts: [
      { name: 'Booster Box (36 packs)', description: 'The standard format. 36 packs with the best overall pull rates for SARs.', slug: 'pokemon-scarlet-violet-journey-together-booster-box' },
      { name: 'Elite Trainer Box (ETB)', description: 'The entry-level product. 9 packs plus accessories, dice, and sleeves.', slug: 'pokemon-scarlet-violet-prismatic-evolutions-etb' },
      { name: 'Booster Bundle', description: 'Budget option with 6 packs. Good for casual collecting.', slug: 'pokemon-scarlet-violet-prismatic-evolutions-booster-bundle' },
      { name: 'Special Collections', description: 'Themed box sets with exclusive promo cards. Higher price but guaranteed unique cards.' },
      { name: 'Japanese Products', description: 'Higher pull rates and different card types. 151 Japanese booster box is legendary.' },
    ],
    collectingTips: [
      'Special Art Rares (SARs) are the most valuable modern Pokemon cards — they drive set value',
      'Japanese products typically have better pull rates than English equivalents',
      'Prismatic Evolutions is the most hyped 2025 set — Umbreon and Eeveelution SARs are chase cards',
      'Buy sealed product at MSRP when possible — aftermarket markup can be steep for hot sets',
      'PSA 10 Pokemon cards carry a larger premium vs PSA 9 than in sports cards',
      'Illustration Rares and SARs have unique full-art designs that make them highly collectible',
    ],
    famousCards: [
      { name: '1999 Base Set Charizard Holo #4', year: 1999, value: '$300K+ (PSA 10 1st Edition)' },
      { name: '1998 Pikachu Illustrator Promo', year: 1998, value: '$5.2M+ (CGC 9.5)' },
      { name: '2023 Pokemon 151 Charizard ex SAR', year: 2023, value: '$500+ (PSA 10)' },
      { name: '2025 Prismatic Evolutions Umbreon ex SAR', year: 2025, value: '$300+ (PSA 10 est.)' },
      { name: '1999 Base Set Shadowless Charizard Holo', year: 1999, value: '$50K+ (PSA 10)' },
    ],
    prosAndCons: {
      pros: ['Largest TCG market by volume — extremely liquid', 'Active competitive game creates floor demand', 'Beautiful art — SARs are stunning', 'Global appeal — collectible worldwide', 'Strong nostalgia factor for Millennials/Gen Z'],
      cons: ['Volatile pricing during hype cycles', 'Aftermarket scalping on hot products', 'Centering issues common in English prints', 'Many sets — hard to keep up with release schedule'],
    },
  },
  {
    slug: 'bowman',
    name: 'Bowman (Topps sub-brand)',
    founded: 1948,
    headquarters: 'New York, NY (under Topps/Fanatics)',
    sports: ['baseball'],
    description: 'The prospect collector\'s brand. Bowman is technically a Topps sub-brand, but it has its own identity and devoted following. A player\'s "1st Bowman Chrome" card is the most important card in their prospect career — often more valuable than their eventual Topps rookie card.',
    history: 'Bowman was originally a competitor to Topps in the 1940s-1950s, producing iconic vintage baseball cards. Topps acquired Bowman in 1956. The brand was revived in 1989 and reinvented as a prospect-focused product. Bowman Chrome, introduced in 1997, became THE standard for prospect collecting. A player\'s 1st Bowman Chrome autograph can be worth thousands before they even play in the majors.',
    keyProducts: [
      { name: 'Bowman Chrome', description: 'The crown jewel. 1st Bowman Chrome autos of top prospects are the most liquid prospect cards.', slug: '2024-bowman-chrome-hobby' },
      { name: 'Bowman Baseball', description: 'Annual Bowman set featuring both prospects and MLB players. Two autos per hobby box.', slug: '2025-bowman-baseball-hobby' },
      { name: 'Bowman Sterling', description: 'Premium all-autograph Bowman product. Every pack has at least one auto.', slug: '2024-topps-bowman-sterling-hobby' },
      { name: 'Bowman Draft', description: 'Released after the MLB Draft featuring newly drafted players. 1st Bowman Chrome of draft picks.' },
      { name: 'Bowman University', description: 'College and amateur players across all sports. Growing in popularity for draft prospects.' },
    ],
    collectingTips: [
      '1st Bowman Chrome cards are more important than regular Bowman cards — look for the "1st" logo',
      'Buy prospect autos BEFORE the player is called up — prices spike on debut day',
      'Refractor parallels carry 2-5x premium over base 1st Bowman Chrome',
      'International prospects (especially from Latin America) can be available years before they debut',
      'Bowman Draft is the best time to invest in newly drafted college players',
    ],
    famousCards: [
      { name: '2011 Bowman Chrome Mike Trout Auto', year: 2011, value: '$100K+ (BGS 9.5/10 auto)' },
      { name: '2016 Bowman Chrome Ronald Acuna Jr 1st Auto', year: 2016, value: '$30K+ (BGS 9.5/10)' },
      { name: '2019 Bowman Chrome Wander Franco 1st Auto', year: 2019, value: '$15K+ (BGS 9.5/10)' },
      { name: '1951 Bowman Mickey Mantle RC #253', year: 1951, value: '$500K+ (PSA 8)' },
      { name: '1948 Bowman George Mikan RC #69', year: 1948, value: '$100K+ (PSA 8)' },
    ],
    prosAndCons: {
      pros: ['1st Bowman Chrome is THE prospect standard — universally recognized', 'Early access to players before they debut', 'Strong investment potential for breakout prospects', 'Bowman Draft/University covers all sports'],
      cons: ['Speculative — many prospects never pan out', 'Can be expensive to chase specific prospects', 'Multiple Bowman releases per year can be confusing', 'Not useful for collecting current MLB stars'],
    },
  },
  {
    slug: 'fleer',
    name: 'Fleer',
    founded: 1885,
    headquarters: 'Philadelphia, PA (defunct — acquired by Upper Deck)',
    sports: ['basketball', 'baseball'],
    description: 'A legendary but now-defunct card brand. Fleer broke Topps\' baseball card monopoly in 1981 and produced the most iconic basketball card ever — the 1986 Fleer Michael Jordan rookie. Fleer went bankrupt in 2005 and the brand was acquired by Upper Deck.',
    history: 'Frank Fleer & Company was originally a candy and gum maker dating back to 1885 (they invented Dubble Bubble). Fleer challenged Topps\' monopoly in court and won, releasing baseball cards in 1981 for the first time. Their 1986-87 Fleer basketball set is the most iconic basketball card set ever produced, featuring Michael Jordan\'s rookie card. Fleer struggled financially in the 2000s, filed for bankruptcy in 2005, and was acquired by Upper Deck.',
    keyProducts: [
      { name: '1986-87 Fleer Basketball', description: 'The holy grail basketball set. Michael Jordan RC #57 is the most valuable basketball card.' },
      { name: '1981 Fleer Baseball', description: 'The set that broke the Topps monopoly. Includes many stars\' first non-Topps cards.' },
      { name: 'Fleer Ultra', description: 'Premium photography-focused product produced from 1991-2007.' },
      { name: 'Fleer Tradition', description: 'Vintage-inspired design harking back to early Fleer sets.' },
      { name: 'Flair Showcase', description: 'High-end product with acetate cards and unique designs.' },
    ],
    collectingTips: [
      'The 1986-87 Fleer basketball set is the most iconic modern basketball set — Jordan RC is the crown jewel',
      'Fleer cards from the late 1990s-2000s have very low populations in high grades',
      'Fleer products are no longer being made — all Fleer cards are vintage/legacy',
      'Complete Fleer sets from 1981-1986 are achievable and affordable',
      'Fleer sticker inserts from 1986-87 basketball are valuable but often overlooked',
    ],
    famousCards: [
      { name: '1986-87 Fleer Michael Jordan RC #57', year: 1986, value: '$738K (PSA 10)' },
      { name: '1986-87 Fleer Hakeem Olajuwon RC #82', year: 1986, value: '$10K+ (PSA 10)' },
      { name: '1986-87 Fleer Charles Barkley RC #7', year: 1986, value: '$8K+ (PSA 10)' },
      { name: '1986-87 Fleer Patrick Ewing RC #32', year: 1986, value: '$5K+ (PSA 10)' },
      { name: '1981 Fleer Nolan Ryan #57', year: 1981, value: '$500+ (PSA 10)' },
    ],
    prosAndCons: {
      pros: ['Iconic legacy brand with legendary sets', '1986-87 basketball set is universally collected', 'No longer produced — finite supply', 'Deep history back to the 1880s'],
      cons: ['No longer being produced — limited to vintage market', 'Some eras (1990s-2000s) had quality issues', 'Brand is dormant under Upper Deck ownership', 'Most Fleer cards from 1990s-2000s have little value'],
    },
  },
];

export function getBrandBySlug(slug: string): CardBrand | undefined {
  return cardBrands.find(b => b.slug === slug);
}
