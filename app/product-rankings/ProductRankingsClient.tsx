'use client';

import { useEffect, useMemo, useState } from 'react';

type Tier = 'LEGENDARY' | 'ICONIC' | 'CLASSIC' | 'NOTABLE';
type Sport = 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'Multi';
type Category = 'Ultra-Premium' | 'Premium' | 'Flagship' | 'Prospecting' | 'Chrome' | 'Design-Driven';
type SortKey = 'tier' | 'rating' | 'alpha' | 'era';

interface Product {
  id: string;
  name: string;
  publisher: string;
  sports: Sport[];
  category: Category;
  tier: Tier;
  rating: 1 | 2 | 3 | 4 | 5;
  since: string;           // earliest year the product existed
  boxPrice: string;        // typical 2026 hobby box $
  hitsPerBox: string;      // typical auto/relic/numbered per box
  signatureCard: string;   // defining chase
  designIdentity: string;  // visual grammar / what this product is known for
  notes: string;
  trivia: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'national-treasures',
    name: 'National Treasures',
    publisher: 'Panini',
    sports: ['NBA', 'NFL', 'MLB'],
    category: 'Ultra-Premium',
    tier: 'LEGENDARY',
    rating: 5,
    since: '2009',
    boxPrice: '$5,500-$9,500',
    hitsPerBox: '8 hits (4 autos, 4 relics minimum)',
    signatureCard: 'RPA (Rookie Patch Auto) /25 or lower',
    designIdentity: 'Jumbo patch + on-card auto + gold-framed base. The RPA format that redefined modern rookie hits.',
    notes: 'Defines the ultra-premium tier. Single-card ceiling cleared $3M (2009 NT Steph Curry RPA /99 Gold /10) and $5.2M (2020 NT Justin Herbert RPA Platinum 1/1 via Goldin 2022). Every major rookie-era chase-card conversation starts with National Treasures.',
    trivia: 'The 2019 NT Luka RPA /99 sold for $4.6M in 2021 at Goldin — at the time the highest modern rookie card sale ever. Luka was 22.',
  },
  {
    id: 'the-cup-hockey',
    name: 'The Cup',
    publisher: 'Upper Deck',
    sports: ['NHL'],
    category: 'Ultra-Premium',
    tier: 'LEGENDARY',
    rating: 5,
    since: '2005-06',
    boxPrice: '$1,400-$2,800',
    hitsPerBox: '6 hits (includes 1 Rookie Patch Auto)',
    signatureCard: 'Rookie Patch Auto /249 on-card',
    designIdentity: 'Signature shields at top, large photo + on-card auto + premium patch. Hockey\'s NT equivalent.',
    notes: 'The definitive hockey product since 2005-06. The Cup RPAs for McDavid, Crosby, Matthews, MacKinnon have all cleared six figures. The single-card ceiling is capped by hockey\'s narrower investor audience but design + checklist are untouchable at the NHL level.',
    trivia: 'A 2005-06 The Cup Sidney Crosby RPA Gold /10 sold for $1.9M at Heritage in 2023, the largest hockey card sale in modern history.',
  },
  {
    id: 'flawless',
    name: 'Flawless',
    publisher: 'Panini',
    sports: ['NBA', 'NFL', 'MLB'],
    category: 'Ultra-Premium',
    tier: 'ICONIC',
    rating: 4,
    since: '2012-13',
    boxPrice: '$3,500-$6,000 (1-box case)',
    hitsPerBox: '10 hits (all numbered, includes diamond-embedded cards)',
    signatureCard: 'Flawless Rookie Patch Auto with embedded gem',
    designIdentity: 'Actual gemstones embedded in select cards, chrome-mirror stock, cellophane-wrapped per-card presentation.',
    notes: 'The "product as object" experience. Embedded rubies, sapphires, diamonds. Single-case product — you buy a whole case at retail, not a box from a case. Single-card ceiling in the $500K-$1M band. Production consistency has been uneven; design template shifted year-over-year more than peers.',
    trivia: 'The 2017-18 Flawless Ben Simmons RPA Diamond 1/1 sold for $680K in 2021. The embedded diamond is real.',
  },
  {
    id: 'bowman-chrome',
    name: 'Bowman Chrome',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Prospecting',
    tier: 'LEGENDARY',
    rating: 5,
    since: '1999',
    boxPrice: '$350-$550',
    hitsPerBox: '1 auto per box guaranteed',
    signatureCard: '1st Bowman Chrome Prospect Auto Superfractor 1/1',
    designIdentity: 'Chrome refractor stock + 1st Bowman Chrome designation + minor-league-era player photography. Owns the prospecting genre outright.',
    notes: 'The most important prospecting product in baseball history. First Bowman Chromes for Mike Trout ($3.93M in 2020), Ronald Acuña Jr., Juan Soto, Bryce Harper all cleared $400K+. Superfractor 1/1 is the grail format for rookie investors. Single-product-line investment thesis in its own right.',
    trivia: 'The 2009 Bowman Chrome Mike Trout Superfractor Auto 1/1 sold for $3.93M at Goldin in 2020 — the highest modern baseball card sale at the time.',
  },
  {
    id: 'topps-chrome',
    name: 'Topps Chrome',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Chrome',
    tier: 'LEGENDARY',
    rating: 5,
    since: '1996',
    boxPrice: '$180-$300',
    hitsPerBox: '1 auto per box (hobby)',
    signatureCard: 'Rookie Auto Red Refractor /5 or Superfractor 1/1',
    designIdentity: 'Chrome refractor base + low-pop color parallel tree. The reference product for mainstream baseball Chrome.',
    notes: 'The 1996 launch set the modern Chrome genre. The 2011 Topps Update Trout RC ($3.93M PSA 10 in 2022, Blue Refractor) is the modern-era baseball grail. Topps Chrome 2001 Albert Pujols, 2018 Juan Soto, 2020 Ronald Acuña all have chase parallels cleared $100K+.',
    trivia: 'Topps Chrome Baseball returns to NBA in 2026 after a 17-year Panini exclusivity lapse — first Topps Chrome Basketball drop since 2009.',
  },
  {
    id: 'prizm',
    name: 'Prizm',
    publisher: 'Panini',
    sports: ['NBA', 'NFL', 'MLB', 'NHL'],
    category: 'Flagship',
    tier: 'LEGENDARY',
    rating: 5,
    since: '2012-13',
    boxPrice: '$600-$1,200',
    hitsPerBox: '3-5 autos per hobby box',
    signatureCard: 'Silver Prizm RC + Color Blast',
    designIdentity: 'Chrome-style refractor base + extensive color parallel tree. The modern-era flagship across 4 sports.',
    notes: 'Most broadly-loved modern product. The 2012-13 Prizm Damian Lillard Gold /10 is the defining Prizm grail. Silver Prizm RCs are the default "is this a real rookie card" reference for basketball/football modern collectors. Checklist consistency is elite; single-card ceiling capped by auto-rookie format (no on-card RPA structure like NT).',
    trivia: 'The 2012-13 Prizm LeBron James Gold /10 sold for $1.8M in 2021. It\'s the product\'s single-card ceiling and not an RPA — the signature card is the BASE Gold parallel.',
  },
  {
    id: 'select',
    name: 'Select',
    publisher: 'Panini',
    sports: ['NBA', 'NFL', 'MLB'],
    category: 'Flagship',
    tier: 'ICONIC',
    rating: 4,
    since: '2013-14',
    boxPrice: '$350-$650',
    hitsPerBox: '2-3 autos',
    signatureCard: 'Concourse / Premier / Courtside rookie auto RC',
    designIdentity: 'Three-tier design (Concourse base / Premier mid / Courtside jumbo). Tiered print-run visual signature.',
    notes: 'Beloved basketball/football product with Chrome mirror + die-cut Premier insert identity. The tiered design (Concourse → Premier → Courtside) is one of the few products where all three tiers have their own collector base. 2012-13 Select LeBron Prizm Red and 2017-18 Select Tatum Tie-Dye are iconic modern parallels.',
    trivia: 'The tiered design was a deliberate homage to stadium seating — Concourse (cheap seats, plentiful), Premier (middle, rarer), Courtside (most expensive + largest photo).',
  },
  {
    id: 'contenders-optic',
    name: 'Contenders Optic',
    publisher: 'Panini',
    sports: ['NFL', 'NBA'],
    category: 'Chrome',
    tier: 'ICONIC',
    rating: 4,
    since: '2016',
    boxPrice: '$500-$900',
    hitsPerBox: '4-5 autos (all rookies in football)',
    signatureCard: 'Rookie Ticket Auto Red/Gold Prizm',
    designIdentity: 'Chrome-stock Rookie Ticket Auto + Prizm color parallels + on-card sig on ticket strip.',
    notes: 'The definitive NFL rookie-auto product post-2016. Every rookie QB of note has a Rookie Ticket Auto. Optic stock upgrades the base Contenders Rookie Ticket to Chrome parallels with the Prizm tree. Ceiling cards: Mahomes Rookie Ticket Auto Gold /25 ($300K+), Josh Allen Red Variation ($400K+).',
    trivia: 'The original non-Optic Contenders Rookie Ticket format dates to 1998. Optic merged the format with Chrome stock in 2016 and immediately became the most-requested NFL rookie product.',
  },
  {
    id: 'immaculate',
    name: 'Immaculate',
    publisher: 'Panini',
    sports: ['NBA', 'NFL', 'MLB'],
    category: 'Ultra-Premium',
    tier: 'ICONIC',
    rating: 4,
    since: '2014-15',
    boxPrice: '$2,200-$3,800',
    hitsPerBox: '5 hits (all premium autos/patches)',
    signatureCard: 'Immaculate Rookie Patch Auto /99 or lower',
    designIdentity: 'White-stock premium base + jumbo patch + on-card auto. Understated luxury.',
    notes: 'The quiet alternative to National Treasures in the RPA-premium category. White borders and clean design attract collectors who want premium without National Treasures\' busier gold framing. Single-card ceiling in the $100K-$500K band across sports.',
    trivia: 'The 2014-15 Immaculate Andrew Wiggins RPA /99 was the inaugural Immaculate Basketball RPA. Ten years later, the format is basically unchanged — testament to the original design.',
  },
  {
    id: 'spectra',
    name: 'Spectra',
    publisher: 'Panini',
    sports: ['NBA', 'NFL'],
    category: 'Premium',
    tier: 'CLASSIC',
    rating: 3,
    since: '2017-18',
    boxPrice: '$900-$1,500',
    hitsPerBox: '4-5 autos/patches',
    signatureCard: 'Spectra Neon Rookie Patch Auto',
    designIdentity: 'Holographic neon stock + extensive Prizm-style parallel tree + jumbo patch.',
    notes: 'The visually loudest premium product. Neon stock divides collectors — some love the aesthetic, some find it cluttered. Checklist and hit structure are strong but the ceiling is capped by the design-polarization.',
    trivia: 'Spectra is the only premium product where the base stock color (neon) is brighter than the parallels.',
  },
  {
    id: 'topps-dynasty',
    name: 'Topps Dynasty',
    publisher: 'Topps',
    sports: ['MLB', 'NFL'],
    category: 'Ultra-Premium',
    tier: 'CLASSIC',
    rating: 3,
    since: '2014',
    boxPrice: '$400-$700',
    hitsPerBox: '1 hit per mini-box',
    signatureCard: 'Dynasty Autograph Patch /10 or 1/1',
    designIdentity: 'Single-hit-per-mini-box, multi-relic + jumbo auto format.',
    notes: 'Low-print, high-ceiling multi-relic product. Classic-tier because the production consistency and design identity are less distinctive than National Treasures or Flawless. But single-card ceiling is elite — 2018 Dynasty Ohtani Red Sox 1/1 patches cleared $500K+.',
    trivia: 'Dynasty is the product most likely to produce game-used log-homer patches — topps uses actual milestone-game-worn material more often than Panini equivalents.',
  },
  {
    id: 'stadium-club',
    name: 'Stadium Club',
    publisher: 'Topps',
    sports: ['MLB', 'NBA', 'NFL'],
    category: 'Design-Driven',
    tier: 'ICONIC',
    rating: 4,
    since: '1991',
    boxPrice: '$90-$180',
    hitsPerBox: '1 auto per hobby master box',
    signatureCard: 'Full-bleed photograph rookie base + Red Foil parallel',
    designIdentity: 'The most photographically-celebrated product in the hobby. Full-bleed action shots, minimal text, photography-as-hero.',
    notes: 'Cult-classic product. Ardently loved by photographers-turned-collectors. Not a big-hit product — the value is in the base photography and low-print parallels. 1991 Stadium Club Baseball debut remains the high-water mark of card photography.',
    trivia: 'Stadium Club is the product most frequently cited by professional photographers and designers as "the card that changed my view of what cards could be". The 1991 set was a creative inflection point.',
  },
  {
    id: 'donruss-optic',
    name: 'Donruss Optic',
    publisher: 'Panini',
    sports: ['NBA', 'NFL', 'MLB'],
    category: 'Chrome',
    tier: 'ICONIC',
    rating: 4,
    since: '2016-17',
    boxPrice: '$400-$700',
    hitsPerBox: '2-3 autos',
    signatureCard: 'Rated Rookie Holo Prizm + Hyper Pink parallels',
    designIdentity: 'Chrome stock + Rated Rookie banner + Hyper Pink / Lime Green / Holo parallel tree.',
    notes: 'The Chrome-upgrade of Donruss. Rated Rookie designation carries over from base Donruss with Chrome refractor visual upgrade. Ceiling: 2016-17 Optic Joel Embiid Gold /10, 2019-20 Optic Zion Red /10, 2020 Optic Herbert Silver. Consistent modern NBA/NFL rookie-auto product.',
    trivia: 'The "Rated Rookie" banner has been a Donruss property since 1984 when Pete Rose\'s son was the first.',
  },
  {
    id: 'bowman-draft',
    name: 'Bowman Draft',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Prospecting',
    tier: 'ICONIC',
    rating: 4,
    since: '1997',
    boxPrice: '$160-$280',
    hitsPerBox: '1 auto per hobby box + Chrome parallels',
    signatureCard: '1st Bowman Draft Chrome Autograph /5 or 1/1 Superfractor',
    designIdentity: 'Chrome stock + Draft class coverage + future-star prospecting. Companion to Bowman Chrome targeting draft-class players specifically.',
    notes: 'The draft-class prospecting product. Bowman Chrome covers top MiLB prospects (draft + international); Bowman Draft is the product that captures the actual MLB Draft class in the year it happens. 2014 Bowman Draft Carlos Correa Superfractor set the format.',
    trivia: '2020 Bowman Draft Colton Cowser, Tanner Burns, and Ed Howard are the current sleepers — all debuted with SuperFractor Autos 1/1 that went off for 6-figures in 2022 before correcting.',
  },
  {
    id: 'upper-deck-young-guns',
    name: 'Upper Deck Series 1 Young Guns',
    publisher: 'Upper Deck',
    sports: ['NHL'],
    category: 'Flagship',
    tier: 'LEGENDARY',
    rating: 5,
    since: '1990-91',
    boxPrice: '$140-$240',
    hitsPerBox: '2-3 Young Gun RCs per box',
    signatureCard: 'Young Guns Rookie #XXX (parallel-free base RC)',
    designIdentity: 'Young Guns subset within Series 1 base — the canonical NHL rookie designation since 1990.',
    notes: 'Hockey\'s Chrome Topps equivalent in rookie-identification. Every elite NHL rookie has a YG card. McDavid YG ($80K+ PSA 10), MacKinnon YG, Matthews YG, Crosby YG are hockey\'s default rookie card references. Non-auto, non-parallel product — the scarcity-engine is the print run alone.',
    trivia: 'The Young Guns subset originated in 1990-91 UD Hockey (Jaromir Jagr YG is the first). The format has survived 35+ years of hobby shifts without major redesign.',
  },
  {
    id: 'topps-finest',
    name: 'Topps Finest',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Chrome',
    tier: 'CLASSIC',
    rating: 4,
    since: '1993',
    boxPrice: '$160-$240',
    hitsPerBox: '2 autos per hobby box',
    signatureCard: 'Finest Refractor RC Auto Red /5 or Superfractor 1/1',
    designIdentity: 'Chrome refractor + gold+silver foil framing. Premium version of Topps Chrome with lower print runs.',
    notes: 'The upscale Topps Chrome sibling. Lower print runs than Chrome, higher card prices per tier. 1993 Topps Finest is one of the most important debut products of the premium era. Modern Finest 2018 Ohtani and 2019 Tatis Superfractor Auto 1/1s cleared $100K+.',
    trivia: 'The 1993 Topps Finest Refractors are the original refractor cards — the format was invented for this set and copied into Topps Chrome.',
  },
  {
    id: 'topps-tier-one',
    name: 'Topps Tier One',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Premium',
    tier: 'NOTABLE',
    rating: 3,
    since: '2011',
    boxPrice: '$140-$220',
    hitsPerBox: '3 autos + 1 relic minimum',
    signatureCard: 'Tier One Breakout Star Auto Blue /25',
    designIdentity: 'On-card auto + star-power focused veteran/rookie mix.',
    notes: 'Auto-heavy premium product where the value is in the signatures not the patches. Respected but rarely the chase product of the year. Notable tier because the product has a clear identity (on-card autos of established stars) even if it doesn\'t define its category.',
    trivia: 'Tier One is one of the few products where a single box can contain 3 different on-card autos of current All-Stars without Ultra-Premium pricing.',
  },
  {
    id: 'topps-transcendent',
    name: 'Topps Transcendent',
    publisher: 'Topps',
    sports: ['MLB', 'NFL'],
    category: 'Ultra-Premium',
    tier: 'CLASSIC',
    rating: 4,
    since: '2016',
    boxPrice: '$25,000+ (Collection only)',
    hitsPerBox: '1 guaranteed PSA 10 auto + full collection',
    signatureCard: 'Transcendent Auto 1/1 or /5 PSA 10 pre-slabbed',
    designIdentity: 'Boxed "Collection" product — not single boxes, a curated collector kit per allocation.',
    notes: 'Boutique allocation product. Buyers purchase by-invitation a full Collection set containing a guaranteed PSA 10 auto + print-run-1/1 + multi-sport mix. Single-product per year, very limited. Classic tier because format is highly exclusive but production history is short (7 years).',
    trivia: 'Each year\'s Transcendent Collection is limited to <100 allocations worldwide. Becoming a Transcendent buyer requires spending history with Topps.',
  },
  {
    id: 'spx',
    name: 'SPx / SP Authentic',
    publisher: 'Upper Deck',
    sports: ['NBA', 'NHL'],
    category: 'Design-Driven',
    tier: 'ICONIC',
    rating: 4,
    since: '1996',
    boxPrice: '$80-$160 (hockey) / discontinued (basketball)',
    hitsPerBox: '3 autos + 1 relic minimum',
    signatureCard: 'SP Authentic Future Watch RC Auto /999',
    designIdentity: 'Holographic stock (SPx) + Future Watch RC designation (SP Authentic Hockey). Low-numbered auto rookies.',
    notes: 'Definitive NHL design product outside The Cup. Future Watch Auto /999 is hockey\'s third-tier RC designation after Cup RPA and YG. Basketball SPx was a 1990s icon (Jordan Holoviews) but the product has lapsed in NBA.',
    trivia: 'The 1996-97 SPx Michael Jordan Holoview Die-Cut is one of the most iconic Jordan design cards — the product invented the modern die-cut premium insert format.',
  },
  {
    id: 'panini-impeccable',
    name: 'Impeccable',
    publisher: 'Panini',
    sports: ['NBA', 'NFL'],
    category: 'Ultra-Premium',
    tier: 'CLASSIC',
    rating: 3,
    since: '2017-18',
    boxPrice: '$3,000-$5,000 (1-box case)',
    hitsPerBox: '4-5 hits (all numbered, auto+relic premium)',
    signatureCard: 'Impeccable Platinum Rookie Patch Auto',
    designIdentity: 'All-metal silver-rimmed stock + jumbo swatches + on-card auto.',
    notes: 'Metal-stock ultra-premium alternative to National Treasures. The stock is noticeably heavier than standard Chrome/Prizm because it incorporates actual silver or metal composite. Elite ceiling cards but lower volume than NT.',
    trivia: 'The metal stock has made Impeccable a favorite with grading companies for sub-grade inconsistency — the metal edges are prone to nicks in shipping, creating grading variance across the same print run.',
  },
  {
    id: 'topps-chrome-black',
    name: 'Topps Chrome Black',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Premium',
    tier: 'CLASSIC',
    rating: 4,
    since: '2020',
    boxPrice: '$250-$400',
    hitsPerBox: '1 auto per box',
    signatureCard: 'Chrome Black RC Auto Refractor /50',
    designIdentity: 'Black Chrome refractor stock — inverted color palette of regular Topps Chrome.',
    notes: 'Short-run Topps Chrome alternative that plays with a black-stock aesthetic. Chase cards cleared $100K+ within first 2 years of release. Faster-appreciating product line than vanilla Chrome because print-runs are tighter.',
    trivia: 'Black Chrome was introduced because Chrome Baseball flagship production volumes had expanded so much that collectors wanted a scarcer chrome alternative without paying Finest prices.',
  },
  {
    id: 'donruss-baseball',
    name: 'Donruss Baseball',
    publisher: 'Panini',
    sports: ['MLB'],
    category: 'Flagship',
    tier: 'NOTABLE',
    rating: 3,
    since: '1981',
    boxPrice: '$60-$120',
    hitsPerBox: '0.5 autos per box',
    signatureCard: 'Rated Rookie Blue /50',
    designIdentity: 'Rated Rookie banner + vintage-homage base design. Longevity icon but with no MLB license since 2017.',
    notes: 'The unlicensed-era baseball Donruss — Panini cannot use team logos on MLB cards. This has permanently capped single-card ceilings. Still has cultural weight through Rated Rookie branding. Notable tier.',
    trivia: '1981 Donruss Baseball was the first Donruss baseball product — it launched the same year as 1981 Fleer, both trying to break Topps\' monopoly. Donruss\'s gum-packed 1981 set is legitimately scarce in high-grade condition.',
  },
  {
    id: 'bowman-sterling',
    name: 'Bowman Sterling',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Premium',
    tier: 'CLASSIC',
    rating: 3,
    since: '2004',
    boxPrice: '$260-$400',
    hitsPerBox: '3-4 autos + relics',
    signatureCard: 'Sterling Auto Refractor /25',
    designIdentity: 'Chrome stock + all-auto/relic format. Sibling to Bowman Chrome with a hit-heavy configuration.',
    notes: 'Auto-dense Bowman product. Every card in the set is a relic or auto — no base. Produces lower-ceiling but higher-volume autos than Bowman Chrome.',
    trivia: 'Bowman Sterling is where many MLB rookies receive their first auto relic before their Topps Chrome Update debuts.',
  },
  {
    id: 'topps-heritage',
    name: 'Topps Heritage',
    publisher: 'Topps',
    sports: ['MLB'],
    category: 'Design-Driven',
    tier: 'ICONIC',
    rating: 4,
    since: '2001',
    boxPrice: '$75-$140',
    hitsPerBox: '1 auto + 1 relic per master box',
    signatureCard: 'Real One Auto + Clubhouse Collection relics',
    designIdentity: 'Year-N design replays the Topps set from exactly 50 years ago. 2026 Heritage = 1976 Topps design.',
    notes: 'The nostalgia-through-replay product. Each year\'s Heritage uses the 50-years-prior Topps design template. Beloved by set-builders and vintage-style collectors. Unique product positioning — no competitor does "explicitly retro-formatted annual release".',
    trivia: 'The 2001 Heritage baseball debut used the 1952 Topps design template — one of the most important set layouts in hobby history. Collectors still reference Heritage releases by "the 5X Topps year".',
  },
  {
    id: 'upper-deck-mars-attacks',
    name: 'Upper Deck Master Collection',
    publisher: 'Upper Deck',
    sports: ['NBA', 'NHL'],
    category: 'Ultra-Premium',
    tier: 'NOTABLE',
    rating: 3,
    since: '1999',
    boxPrice: '$6,000-$12,000 (boxed Collection)',
    hitsPerBox: 'Full team-logo autograph + premium inserts',
    signatureCard: 'Master Collection Logoman 1/1',
    designIdentity: 'Team-centric boxed Collection with logoman patches and on-card autos.',
    notes: 'Team-loyalty ultra-premium product. Each year\'s Master Collection focuses on a specific team\'s history with curated auto lineups. Collectors buy for team loyalty more than flipping.',
    trivia: 'Master Collection 2008-09 New York Yankees Logoman Babe Ruth 1/1 sold for $2.2M in 2022 — one of the highest Babe Ruth card sales ever.',
  },
  {
    id: 'topps-allen-ginter',
    name: 'Topps Allen & Ginter',
    publisher: 'Topps',
    sports: ['MLB', 'Multi'],
    category: 'Design-Driven',
    tier: 'ICONIC',
    rating: 4,
    since: '2006',
    boxPrice: '$100-$170',
    hitsPerBox: '3 hits per box (autos + relics + mini inserts)',
    signatureCard: 'Framed Mini Relic + Full-Size Auto',
    designIdentity: 'Tobacco-era Topps Allen & Ginter homage (1880s brand revival). Illustration-style portraits + mini cards subset.',
    notes: 'The most creative Topps product. Autos from non-sports figures (historical figures, celebrities, pop culture). Framed mini relics are a collector sub-genre of their own. A Topps Allen & Ginter set build is a cultural statement, not just a team-player collection.',
    trivia: 'Allen & Ginter 2008 Barack Obama minor-league political card predates his presidency by a year and is one of the most traded "pre-election" cards in the hobby.',
  },
  {
    id: 'upper-deck-exquisite',
    name: 'Exquisite Collection',
    publisher: 'Upper Deck (defunct) / Legacy',
    sports: ['NBA', 'NFL'],
    category: 'Ultra-Premium',
    tier: 'LEGENDARY',
    rating: 5,
    since: '2003-04',
    boxPrice: 'Discontinued (secondary market)',
    hitsPerBox: '5 hits (all numbered, auto+relic premium)',
    signatureCard: 'Exquisite Rookie Patch Auto /99',
    designIdentity: 'Original modern RPA format. Upper Deck invented the template Panini copied with National Treasures.',
    notes: 'The product that invented the modern RPA. 2003-04 Exquisite LeBron RPA /99 ($5.2M in 2021) and 2003-04 Exquisite Wade/Melo RPAs are defining modern basketball grails. UD lost NBA license in 2010, so Exquisite Basketball effectively ended then — product legacy is preserved but no new product exists.',
    trivia: 'Upper Deck\'s 2003-04 Exquisite Basketball launch included the LeBron/Wade/Carmelo/Bosh rookie class — arguably the most important rookie-product pairing in modern basketball history.',
  },
  {
    id: 'panini-obsidian',
    name: 'Obsidian',
    publisher: 'Panini',
    sports: ['NBA', 'NFL'],
    category: 'Premium',
    tier: 'NOTABLE',
    rating: 3,
    since: '2019-20',
    boxPrice: '$500-$900',
    hitsPerBox: '4 autos + relics',
    signatureCard: 'Obsidian Electric Etch Rookie Auto',
    designIdentity: 'Black-foil stock + etched pattern base + jumbo patch.',
    notes: 'Younger ultra-premium alternative. Production history too short to cement tier. Design identity is distinctive but has moved year-over-year.',
    trivia: 'Obsidian\'s base-card stock contains real micro-etching — each card has slightly different surface texture under magnification.',
  },
];

const TIERS: Record<Tier, { label: string; badge: string; ring: string; bg: string; order: number }> = {
  LEGENDARY: {
    label: 'Legendary',
    badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black',
    ring: 'ring-amber-400/60',
    bg: 'bg-amber-500/5',
    order: 0,
  },
  ICONIC: {
    label: 'Iconic',
    badge: 'bg-gradient-to-r from-cyan-400 to-teal-500 text-black',
    ring: 'ring-cyan-400/50',
    bg: 'bg-cyan-500/5',
    order: 1,
  },
  CLASSIC: {
    label: 'Classic',
    badge: 'bg-gradient-to-r from-indigo-400 to-violet-500 text-white',
    ring: 'ring-indigo-400/50',
    bg: 'bg-indigo-500/5',
    order: 2,
  },
  NOTABLE: {
    label: 'Notable',
    badge: 'bg-gradient-to-r from-slate-400 to-slate-500 text-white',
    ring: 'ring-slate-400/50',
    bg: 'bg-slate-500/5',
    order: 3,
  },
};

const CATEGORIES: Category[] = ['Ultra-Premium', 'Premium', 'Flagship', 'Prospecting', 'Chrome', 'Design-Driven'];
const ALL_TIERS: Tier[] = ['LEGENDARY', 'ICONIC', 'CLASSIC', 'NOTABLE'];
const ALL_SPORTS: Sport[] = ['MLB', 'NBA', 'NFL', 'NHL'];

const STORAGE_KEY = 'cv_product_rankings_votes_v1';

export default function ProductRankingsClient() {
  const [sortKey, setSortKey] = useState<SortKey>('tier');
  const [tierFilter, setTierFilter] = useState<Tier | 'ALL'>('ALL');
  const [sportFilter, setSportFilter] = useState<Sport | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, 'up' | 'down' | null>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVotes(JSON.parse(raw));
    } catch {}
  }, []);

  function vote(id: string, direction: 'up' | 'down') {
    const next = { ...votes };
    next[id] = next[id] === direction ? null : direction;
    setVotes(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  const filtered = useMemo(() => {
    let list = [...PRODUCTS];
    if (tierFilter !== 'ALL') list = list.filter(p => p.tier === tierFilter);
    if (sportFilter !== 'ALL') list = list.filter(p => p.sports.includes(sportFilter) || p.sports.includes('Multi'));
    if (categoryFilter !== 'ALL') list = list.filter(p => p.category === categoryFilter);

    switch (sortKey) {
      case 'tier':
        list.sort((a, b) => TIERS[a.tier].order - TIERS[b.tier].order || b.rating - a.rating || a.name.localeCompare(b.name));
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name));
        break;
      case 'alpha':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'era':
        list.sort((a, b) => parseInt(a.since, 10) - parseInt(b.since, 10) || a.name.localeCompare(b.name));
        break;
    }
    return list;
  }, [sortKey, tierFilter, sportFilter, categoryFilter]);

  const tierCounts = useMemo(() => {
    const counts: Record<Tier, number> = { LEGENDARY: 0, ICONIC: 0, CLASSIC: 0, NOTABLE: 0 };
    PRODUCTS.forEach(p => counts[p.tier]++);
    return counts;
  }, []);

  const upVoteTotal = Object.values(votes).filter(v => v === 'up').length;
  const downVoteTotal = Object.values(votes).filter(v => v === 'down').length;

  const groupedByTier = useMemo(() => {
    if (sortKey !== 'tier') return null;
    const groups = new Map<Tier, Product[]>();
    for (const t of ALL_TIERS) groups.set(t, []);
    for (const p of filtered) {
      groups.get(p.tier)!.push(p);
    }
    return groups;
  }, [filtered, sortKey]);

  if (!mounted) return <div className="h-96 bg-gray-900/40 border border-gray-800 rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ALL_TIERS.map(t => (
          <div key={t} className={`rounded-xl border border-gray-800 p-3 ${TIERS[t].bg}`}>
            <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${TIERS[t].badge}`}>
              {TIERS[t].label.toUpperCase()}
            </div>
            <div className="text-2xl font-black text-white mt-2">{tierCounts[t]}</div>
            <div className="text-[11px] text-gray-500">products</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-semibold">Community lean</span>
            <span className="text-emerald-400">👍 {upVoteTotal}</span>
            <span className="text-rose-400">👎 {downVoteTotal}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-500">Sort:</label>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className="px-2 py-1 rounded-lg border border-gray-800 bg-black/30 text-gray-300 text-xs">
              <option value="tier">By Tier</option>
              <option value="rating">By Rating</option>
              <option value="era">By Era</option>
              <option value="alpha">A-Z</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterChip label="All tiers" active={tierFilter === 'ALL'} onClick={() => setTierFilter('ALL')} />
          {ALL_TIERS.map(t => <FilterChip key={t} label={TIERS[t].label} active={tierFilter === t} onClick={() => setTierFilter(t)} />)}
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterChip label="All sports" active={sportFilter === 'ALL'} onClick={() => setSportFilter('ALL')} />
          {ALL_SPORTS.map(s => <FilterChip key={s} label={s} active={sportFilter === s} onClick={() => setSportFilter(s)} />)}
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterChip label="All categories" active={categoryFilter === 'ALL'} onClick={() => setCategoryFilter('ALL')} />
          {CATEGORIES.map(c => <FilterChip key={c} label={c} active={categoryFilter === c} onClick={() => setCategoryFilter(c)} />)}
        </div>
      </div>

      {groupedByTier ? (
        <div className="space-y-8">
          {ALL_TIERS.map(t => {
            const list = groupedByTier.get(t) ?? [];
            if (list.length === 0) return null;
            return (
              <section key={t}>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-3 ${TIERS[t].badge}`}>
                  {TIERS[t].label.toUpperCase()} · {list.length}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.map(p => <ProductCard key={p.id} product={p} expanded={expandedId === p.id} onExpand={() => setExpandedId(expandedId === p.id ? null : p.id)} vote={votes[p.id] ?? null} onVote={dir => vote(p.id, dir)} />)}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(p => <ProductCard key={p.id} product={p} expanded={expandedId === p.id} onExpand={() => setExpandedId(expandedId === p.id ? null : p.id)} vote={votes[p.id] ?? null} onVote={dir => vote(p.id, dir)} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
          No products match the filters. Try clearing one or more filter chips above.
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${active ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300' : 'border-gray-800 bg-black/30 text-gray-500 hover:border-gray-700'}`}
    >
      {label}
    </button>
  );
}

function ProductCard({ product, expanded, onExpand, vote, onVote }: { product: Product; expanded: boolean; onExpand: () => void; vote: 'up' | 'down' | null; onVote: (dir: 'up' | 'down') => void }) {
  const meta = TIERS[product.tier];
  return (
    <div className={`bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden transition-all ${expanded ? 'ring-2 ' + meta.ring : ''}`}>
      <button onClick={onExpand} className="w-full text-left p-4 hover:bg-gray-900/60 transition-colors">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${meta.badge}`}>{meta.label}</span>
              <span className="text-[10px] text-gray-500 font-semibold">{product.category.toUpperCase()}</span>
              <span className="text-[10px] text-gray-600">{product.sports.join(' · ')}</span>
            </div>
            <h3 className="font-bold text-lg text-white truncate">{product.name}</h3>
            <div className="text-xs text-gray-500 mt-0.5">
              <span className="text-gray-400">{product.publisher}</span> · since {product.since}
            </div>
            <div className="text-xs text-gray-400 mt-2 line-clamp-2">{product.designIdentity}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg">{'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{product.boxPrice}</div>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
          <Field label="Signature card">{product.signatureCard}</Field>
          <Field label="Hits per box">{product.hitsPerBox}</Field>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Notes</div>
            <p className="text-sm text-gray-300 leading-relaxed">{product.notes}</p>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Trivia</div>
            <p className="text-xs text-gray-400 italic leading-relaxed">{product.trivia}</p>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={() => onVote('up')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${vote === 'up' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-gray-800 bg-black/30 text-gray-500 hover:border-gray-700'}`}
            >
              👍 Agree
            </button>
            <button
              onClick={() => onVote('down')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${vote === 'down' ? 'border-rose-500 bg-rose-500/15 text-rose-300' : 'border-gray-800 bg-black/30 text-gray-500 hover:border-gray-700'}`}
            >
              👎 Disagree
            </button>
            <span className="ml-auto text-[10px] text-gray-600">tier = {meta.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="col-span-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="col-span-2 text-gray-300">{children}</div>
    </div>
  );
}
