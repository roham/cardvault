// Card variations and parallels for iconic cards
// Helps collectors understand what versions exist and relative rarity

export interface CardVariant {
  name: string;
  printRun?: string; // e.g. '/50', '1/1', 'Short Print'
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

export const cardVariations: CardVariations[] = [
  // ─── BASKETBALL ──────────────────────────────────────────────
  {
    slug: '1986-87-fleer-michael-jordan-57',
    baseDescription: 'The 1986-87 Fleer set was printed in one series with no official parallels or short prints. Every Jordan is the same card — variation is purely about condition.',
    variants: [
      { name: 'Standard Base', description: 'The only version that exists — all 1986-87 Fleer cards are base cards.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Signed by Jordan (collector)', description: 'PSA/JSA-authenticated Jordan signature on a Fleer card.', estimatedMultiplier: '$25,000–$200,000', rarity: 'rare', notes: 'Not officially produced — collector-obtained signatures. Authentication is essential.' },
    ],
    collectingTip: 'Grade is everything for this card. A PSA 8 trades at 60-70% discount to a PSA 9. The center seam cut is the single biggest grading killer — look for even left/right borders in raw copies.',
  },
  {
    slug: '2003-04-topps-chrome-lebron-james-111',
    baseDescription: '2003-04 Topps Chrome produced refractor parallels and autographed versions. The base refractor is the most collected.',
    variants: [
      { name: 'Base Refractor', description: 'Standard refractor — the card everyone wants.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Black Refractor', printRun: '/500', description: '/500 numbered. First-year black refractor.', estimatedMultiplier: '3-5x base', rarity: 'uncommon' },
      { name: 'X-Fractor', printRun: '/220', description: '/220 numbered. Grid pattern finish.', estimatedMultiplier: '4-7x base', rarity: 'uncommon' },
      { name: 'Gold Refractor', printRun: '/99', description: '/99 numbered. Classic gold border.', estimatedMultiplier: '10-15x base', rarity: 'rare' },
      { name: 'Superfractor', printRun: '1/1', description: '1/1. The ultimate LeBron Chrome.', estimatedMultiplier: '$1,000,000+', rarity: 'ultra-rare' },
      { name: 'Autograph Refractor', printRun: '/500', description: 'Signed /500 — print run varies.', estimatedMultiplier: '$50,000–$200,000', rarity: 'rare', notes: 'LeBron autograph Chromes are extremely rare' },
    ],
    collectingTip: 'Centering is the biggest obstacle to a PSA 10. Most LeBron Chrome refractors grade at 8-9. The BGS grading scale rewards centered copies — a BGS 9.5 (Black Label) is worth 3x a PSA 10 in this card.',
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
    slug: '2018-19-panini-prizm-luka-doncic-280',
    baseDescription: 'Prizm produces a rainbow of parallels from common silver to ultra-rare 1/1 variations. The base Prizm Silver is the flagship card.',
    variants: [
      { name: 'Silver Prizm', description: 'The flagship parallel — classic refractor shine.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Blue Prizm', printRun: '/199', description: 'Blue refractor. /199 numbered.', estimatedMultiplier: '2-3x Silver', rarity: 'uncommon' },
      { name: 'Red Prizm', printRun: '/149', description: 'Red refractor. /149 numbered.', estimatedMultiplier: '3-5x Silver', rarity: 'uncommon' },
      { name: 'Green Prizm', printRun: '/125', description: 'Green refractor. /125 numbered.', estimatedMultiplier: '4-6x Silver', rarity: 'uncommon' },
      { name: 'Orange Prizm', printRun: '/25', description: 'Orange refractor. /25 numbered.', estimatedMultiplier: '8-15x Silver', rarity: 'rare' },
      { name: 'Gold Prizm', printRun: '/10', description: 'Gold refractor. /10 numbered.', estimatedMultiplier: '15-25x Silver', rarity: 'rare' },
      { name: 'Black Prizm', printRun: '1/1', description: '1/1 one-of-one. True holy grail.', estimatedMultiplier: '$500,000+', rarity: 'ultra-rare' },
      { name: 'Auto Silver Prizm', printRun: '/99 or /149', description: 'Signed base Prizm.', estimatedMultiplier: '$4,000–$15,000', rarity: 'rare' },
      { name: 'Auto Gold Prizm', printRun: '/10', description: 'Signed gold Prizm /10.', estimatedMultiplier: '$100,000+', rarity: 'ultra-rare' },
    ],
    collectingTip: 'The Silver base is the most liquid. Numbered parallels command premiums but are illiquid in bear markets. If budget is limited, a PSA 10 Silver outperforms a raw Gold almost every time for resale.',
  },
  {
    slug: '1984-85-star-michael-jordan-101',
    baseDescription: 'Star Company cards have no official parallels — the only variation is the card\'s condition and authentication status. Counterfeits are a serious problem; only buy PSA or BGS-authenticated copies.',
    variants: [
      { name: 'Standard Base', description: 'The only version. All Star cards are the same design.', estimatedMultiplier: 'Market price', rarity: 'uncommon', notes: 'Buy only PSA/BGS graded — counterfeits are prevalent' },
      { name: 'Team Set Version', description: 'Some copies came in different team set packaging. Visually identical.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
    ],
    collectingTip: 'Never buy a raw Star Jordan without expert authentication. Counterfeit Star cards are so common they have driven PSA to add extra verification layers. The card\'s centering, print quality, and cardboard stock all matter for authentication.',
  },
  {
    slug: '2007-08-topps-chrome-kevin-durant-131',
    baseDescription: 'KD\'s 2007-08 Topps Chrome rookie produced refractor parallels in the standard Chrome rainbow pattern.',
    variants: [
      { name: 'Base Refractor', description: 'Standard refractor — most collected.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Black Refractor', printRun: '/199', description: '/199 numbered.', estimatedMultiplier: '3-5x base', rarity: 'uncommon' },
      { name: 'Gold Refractor', printRun: '/50', description: '/50 numbered.', estimatedMultiplier: '10-15x base', rarity: 'rare' },
      { name: 'Superfractor', printRun: '1/1', description: '1/1 unique.', estimatedMultiplier: '$500,000+', rarity: 'ultra-rare' },
    ],
    collectingTip: 'The base refractor PSA 10 at $18K-$35K is significantly more liquid than numbered parallels. The Gold Refractor /50 commands disproportionate premiums at auction due to rarity.',
  },
  {
    slug: '2019-20-prizm-zion-williamson-248',
    baseDescription: 'Zion\'s Prizm rookie has the full Prizm parallel rainbow — high production makes many parallels accessible.',
    variants: [
      { name: 'Silver Prizm', description: 'Base parallel — most collected.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Hyper Prizm', description: 'The neon green/blue hyper parallel — scarcer than Silver.', estimatedMultiplier: '2-3x Silver', rarity: 'uncommon' },
      { name: 'Red Prizm', printRun: '/149', description: '/149 numbered.', estimatedMultiplier: '4-6x Silver', rarity: 'uncommon' },
      { name: 'Gold Prizm', printRun: '/10', description: '/10 numbered.', estimatedMultiplier: '20-40x Silver', rarity: 'rare' },
      { name: 'Black Prizm', printRun: '1/1', description: '1/1 true unique.', estimatedMultiplier: '$200,000+', rarity: 'ultra-rare' },
      { name: 'Auto Prizm Silver', printRun: '/199 or /149', description: 'Signed base Prizm.', estimatedMultiplier: '$8,000–$30,000', rarity: 'rare' },
    ],
    collectingTip: 'Zion\'s market is volatile due to injury history. Silver base PSA 10 is the most stable entry point. Numbered parallels are high-risk/high-reward — health determines everything.',
  },
  {
    slug: '2013-14-panini-prizm-giannis-antetokounmpo-290',
    baseDescription: 'Giannis\'s first Prizm as a rookie — one of the most coveted first-year Prizm cards in basketball.',
    variants: [
      { name: 'Silver Prizm', description: 'The flagship version. First Giannis Prizm ever made.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Gold Prizm', printRun: '/10', description: '/10 numbered. Extremely scarce.', estimatedMultiplier: '30-50x Silver', rarity: 'ultra-rare' },
      { name: 'Auto Prizm', printRun: 'Various', description: 'Signed Prizm in various parallel colors.', estimatedMultiplier: '$30,000–$150,000', rarity: 'rare' },
    ],
    collectingTip: 'The Silver base is more accessible than most early Prizm rookies due to decent production. However, surface issues from 2013-14 Prizm production quality are common — examine carefully under light.',
  },
  // ─── BASEBALL ─────────────────────────────────────────────────
  {
    slug: '1952-topps-mickey-mantle-311',
    baseDescription: 'The 1952 Topps set has two distinct print varieties — the High Number series (cards 311-407, including Mantle) was printed in much smaller quantities than the low series.',
    variants: [
      { name: 'Standard High Number', description: 'Normal print run — already a short print vs. the low series.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Red Back Variation', description: 'Faint reddish hue on the reverse — believed to be a different print run.', estimatedMultiplier: 'Slight premium', rarity: 'rare', notes: 'Not universally recognized; verify with PSA' },
    ],
    collectingTip: 'Paper loss on the reverse is the cardinal sin for this card. Examine the back under strong light for pinholes, tape, and writing. The Mantle cuts badly in the upper-left corner — pristine corners are the price separator.',
  },
  {
    slug: '2009-bowman-chrome-mike-trout-bdpp89',
    baseDescription: '2009 Bowman Chrome Draft Prospects produced the full Chrome refractor rainbow. The base and refractor are the two primary collecting targets.',
    variants: [
      { name: 'Base Chrome (non-refractor)', description: 'The base version — standard Chrome stock.', estimatedMultiplier: '30-40% of Refractor', rarity: 'common' },
      { name: 'Refractor', description: 'The standard refractor — most collected version.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Blue Refractor', printRun: '/150', description: '/150 numbered.', estimatedMultiplier: '3-5x base Refractor', rarity: 'uncommon' },
      { name: 'Gold Refractor', printRun: '/50', description: '/50 numbered.', estimatedMultiplier: '10-20x base Refractor', rarity: 'rare' },
      { name: 'Orange Refractor', printRun: '/25', description: '/25 numbered.', estimatedMultiplier: '20-35x base Refractor', rarity: 'rare' },
      { name: 'Red Refractor', printRun: '/5', description: '/5 numbered. Extremely scarce.', estimatedMultiplier: '50-100x base Refractor', rarity: 'ultra-rare' },
      { name: 'Superfractor', printRun: '1/1', description: '1/1. Most valuable Trout prospect card.', estimatedMultiplier: '$10,000,000+ (theoretical)', rarity: 'ultra-rare' },
      { name: 'Auto Refractor', printRun: 'Various', description: 'Signed refractor in multiple colors.', estimatedMultiplier: '$500,000–$4,000,000 (base auto PSA 10)', rarity: 'ultra-rare', notes: 'The Trout Bowman Chrome auto is one of the most valuable modern cards in existence' },
    ],
    collectingTip: 'The base non-refractor is 60-70% cheaper than the refractor but many serious collectors won\'t accept it. For investment, only buy PSA-authenticated refractors. The auto versions are a different market entirely and among the most coveted modern cards.',
  },
  {
    slug: '1993-sp-derek-jeter-279',
    baseDescription: '1993 SP produced foil cards with no official parallels. The entire allure is the condition difficulty — the foil surface shows any handling damage.',
    variants: [
      { name: 'Standard 1993 SP', description: 'The only version. No parallels exist.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Autographed (collector-obtained)', description: 'Jeter signed examples — not produced by Upper Deck.', estimatedMultiplier: '$30,000–$80,000', rarity: 'rare', notes: 'Authentication critical — verify with JSA or PSA' },
    ],
    collectingTip: '1993 SP foil scratches from the smallest friction. Never slide it in a sleeve — drop it straight in. Print lines (dark streaks in the foil) are common and will knock a potential 9 down to an 8. Examine the foil under raking light before buying raw.',
  },
  {
    slug: '1989-upper-deck-ken-griffey-jr-1',
    baseDescription: '1989 Upper Deck had no parallel program — the card #1 is the only Griffey in the set. Variations are purely about condition and error copies.',
    variants: [
      { name: 'Standard Base', description: 'The standard issue — what 98% of collectors target.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Error "Ken Griffey Jr." back', description: 'Some copies have a slightly different name placement on the reverse. Collectors debate if this is a true error.', estimatedMultiplier: 'Negligible premium', rarity: 'common', notes: 'Not an officially recognized error — PSA grades both identically' },
    ],
    collectingTip: 'With 98,000+ graded, PSA 10 is the only grade that matters for investment. PSA 9 has 22,000 examples and trades at a fraction of PSA 10. For raw cards: check for print lines on the white border and corner dings under magnification.',
  },
  {
    slug: '1955-topps-roberto-clemente-164',
    baseDescription: '1955 Topps had no parallel program. The Clemente RC is a single-variation card — condition defines value entirely.',
    variants: [
      { name: 'Standard Base', description: 'The only version. All are the same base card.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Green tint variation', description: 'Some copies show a slight greenish tint in the background. Believed to be a press variation, not separately catalogued.', estimatedMultiplier: 'No price differential', rarity: 'common' },
    ],
    collectingTip: 'The 1955 Topps design uses a painted portrait — look for sharp color saturation and clean portrait definition. Cards that look "muddy" in the portrait area have print quality issues. The back must have no writing or tape marks to reach PSA 8+.',
  },
  {
    slug: '1954-topps-hank-aaron-128',
    baseDescription: '1954 Topps had no parallel program. Aaron\'s rookie card is a single variation — condition is the only differentiator.',
    variants: [
      { name: 'Standard Base', description: 'The only version that exists.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
    ],
    collectingTip: '1954 Topps cards suffer badly from centering issues — the printing process left many copies cut noticeably off-center. For the Aaron RC, the top border is the most common issue. The back should show clean ink with no staining from adjacent cards in the wax pack.',
  },
  {
    slug: '2011-topps-update-mike-trout-us175',
    baseDescription: '2011 Topps Update has no parallel program beyond the standard Topps parallels. The base card and a much rarer photo variation are the two key versions.',
    variants: [
      { name: 'Standard Base', description: 'The most common version — batting pose.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Photo Variation SP', description: 'Extremely rare short print showing Trout fielding. Completely different photo from the standard version.', estimatedMultiplier: '$20,000–$50,000+ (PSA 10)', rarity: 'ultra-rare', notes: 'One of the most sought-after modern baseball short prints' },
      { name: 'Gold Parallel', printRun: '/2011', description: '/2011 numbered gold foil border. Common parallel.', estimatedMultiplier: '2-3x base', rarity: 'uncommon' },
    ],
    collectingTip: 'The photo variation is the holy grail — it\'s visually distinct (fielding vs. batting) and worth 20x+ the standard issue. Check the image carefully: if Trout is in the field, you have the SP. Never confuse the two versions.',
  },
  {
    slug: '2011-bowman-chrome-bryce-harper-bcp1',
    baseDescription: '2011 Bowman Chrome Prospects has the full refractor rainbow. Harper\'s BCP1 card number adds collectability.',
    variants: [
      { name: 'Base Chrome', description: 'Standard Chrome base, no refractor.', estimatedMultiplier: '40-50% of Refractor', rarity: 'common' },
      { name: 'Refractor', description: 'Standard refractor — most collected version.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Blue Refractor', printRun: '/150', description: '/150 numbered.', estimatedMultiplier: '3-5x base', rarity: 'uncommon' },
      { name: 'Gold Refractor', printRun: '/50', description: '/50 numbered.', estimatedMultiplier: '8-15x base', rarity: 'rare' },
      { name: 'Orange Refractor', printRun: '/25', description: '/25 numbered.', estimatedMultiplier: '15-25x base', rarity: 'rare' },
      { name: 'Superfractor', printRun: '1/1', description: '1/1 ultimate rarity.', estimatedMultiplier: '$500,000+', rarity: 'ultra-rare' },
      { name: 'Auto Refractor', printRun: 'Various', description: 'Signed refractor — multiple color variants.', estimatedMultiplier: '$5,000–$40,000', rarity: 'rare' },
    ],
    collectingTip: 'The BCP1 card number is significant — collectors who want the full Bowman Chrome prospect rainbow of their favorites target the #1 slot. Refractor PSA 10 is the sweet spot for investment vs. collectability.',
  },
  {
    slug: '1968-topps-nolan-ryan-177',
    baseDescription: 'A shared rookie card with Jerry Koosman. No parallels exist — 1968 Topps had a single base card design.',
    variants: [
      { name: 'Standard Base', description: 'The only version. Ryan and Koosman share card #177.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Autographed (collector-obtained)', description: 'Ryan-signed examples. Relatively common to find Ryan-signed cards given his accessibility at signings.', estimatedMultiplier: '$500–$3,000 additional', rarity: 'uncommon' },
    ],
    collectingTip: 'The print quality on 1968 Topps varies — look for clean, vibrant blue border colors. The miscut issue on this specific card (it sits off in the set cut direction) makes centering particularly important. A centered PSA 9 is extremely elusive.',
  },
  // ─── FOOTBALL ────────────────────────────────────────────────
  {
    slug: '2000-playoff-contenders-tom-brady-144',
    baseDescription: 'The Brady Contenders auto is a sticker autograph card with variations in autograph placement, ink boldness, and centering.',
    variants: [
      { name: 'Ticket Auto Standard', description: 'The standard autograph version — sticker auto on ticket-design card.', estimatedMultiplier: 'Market price', rarity: 'uncommon', notes: 'Original print run reportedly ~100 copies' },
      { name: 'Variation: Light Ink', description: 'Some copies show faded/light ink — significantly discounted.', estimatedMultiplier: '40-60% discount', rarity: 'common' },
      { name: 'Variation: Bold Ink / Strong Signature', description: 'Fully bold, complete signature — commands premium over standard.', estimatedMultiplier: '15-30% premium', rarity: 'uncommon' },
    ],
    collectingTip: 'Three things kill value: light ink, off-center sticker placement, and centering. PSA grades the card AND the autograph quality. The 1 existing PSA 10 had perfect centering and bold, full signature. Confirm autograph quality before paying PSA 9+ prices.',
  },
  {
    slug: '2018-national-treasures-patrick-mahomes-auto',
    baseDescription: 'National Treasures produces numbered patch autographs and base RPA versions. Mahomes\'s key NT cards carry jersey patches.',
    variants: [
      { name: 'Rookie Patch Auto (RPA) Base', printRun: '/99', description: '/99 numbered — the most common NT Mahomes.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'RPA Gold', printRun: '/25', description: '/25 numbered. Gold parallel.', estimatedMultiplier: '3-5x base', rarity: 'rare' },
      { name: 'RPA Platinum', printRun: '/10', description: '/10 numbered. Platinum parallel.', estimatedMultiplier: '8-15x base', rarity: 'rare' },
      { name: 'RPA 1/1', printRun: '1/1', description: '1/1 printing plate or black parallel. True holy grail.', estimatedMultiplier: '$5,000,000+ theoretical', rarity: 'ultra-rare' },
    ],
    collectingTip: 'NT RPA cards from Mahomes\'s year came in several distinct patch types. Logoman patches (patch featuring the league logo) are exponentially more valuable than jersey swatches. Verify the patch before paying a premium.',
  },
  {
    slug: '2018-panini-prizm-lamar-jackson-212',
    baseDescription: 'Lamar Jackson\'s 2018 Prizm rookie follows the standard Prizm parallel rainbow with numerous numbered variants.',
    variants: [
      { name: 'Silver Prizm', description: 'The base Prizm parallel — most collected.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Green Prizm', printRun: '/125', description: '/125 numbered.', estimatedMultiplier: '3-5x Silver', rarity: 'uncommon' },
      { name: 'Red Prizm', printRun: '/149', description: '/149 numbered.', estimatedMultiplier: '3-5x Silver', rarity: 'uncommon' },
      { name: 'Gold Prizm', printRun: '/10', description: '/10 numbered.', estimatedMultiplier: '20-30x Silver', rarity: 'rare' },
      { name: 'Black Prizm', printRun: '1/1', description: '1/1 unique. The ultimate Lamar Jackson Prizm.', estimatedMultiplier: '$300,000+', rarity: 'ultra-rare' },
      { name: 'Auto Silver Prizm', printRun: '/249 or /199', description: 'Signed base Prizm.', estimatedMultiplier: '$2,000–$8,000', rarity: 'rare' },
    ],
    collectingTip: 'Jackson\'s dual-MVP market is strong but volatile with team performance. The Silver PSA 10 is the most liquid hold. Auto Prizms command disproportionate premiums due to Jackson\'s infrequent signing history.',
  },
  {
    slug: '1986-topps-jerry-rice-161',
    baseDescription: '1986 Topps had no parallel program. Rice\'s rookie is a single base card — condition is the only variable.',
    variants: [
      { name: 'Standard Base', description: 'The only version. No parallels were produced.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Autographed (collector)', description: 'Rice-signed examples are relatively common from signings.', estimatedMultiplier: '$500–$2,000 additional', rarity: 'uncommon', notes: 'JSA or PSA authentication required for premium pricing' },
    ],
    collectingTip: 'The 1986 Topps print quality is generally solid but watch for gray border smudging and centering. PSA 10 copies have proven consistent performers over 15+ years — the low population (180) relative to production keeps the premium intact.',
  },
  // ─── HOCKEY ──────────────────────────────────────────────────
  {
    slug: '1979-80-opee-chee-wayne-gretzky-18',
    baseDescription: 'The OPC Gretzky is a distinct card from the 1979-80 Topps Gretzky — OPC is printed in Canada, has bilingual (English/French) text on the back, and is the true hobby favorite.',
    variants: [
      { name: 'O-Pee-Chee (OPC)', description: 'The main event — Canadian issue with French/English back.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Topps (US Version)', description: 'American version — same photo, English-only back, less scarce.', estimatedMultiplier: '15-25% of OPC', rarity: 'common', notes: 'Confusingly undervalued given same player/photo — check the reverse' },
    ],
    collectingTip: 'The OPC print process left many copies with rough centering — 70/30 is common and kills grade. The card also suffers from back paper loss from wax packs. For OPC vs Topps: check the reverse. OPC has French text. Never pay OPC prices for a Topps.',
  },
  {
    slug: '2005-06-upper-deck-young-guns-sidney-crosby-201',
    baseDescription: 'Upper Deck Young Guns are produced as base cards only — no parallel rainbow. The only "variations" are condition and error copies. Signed examples are collector-obtained.',
    variants: [
      { name: 'Standard Young Guns', description: 'The only official version. All YG cards are base cards.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'UD Young Guns Exclusives (retail)', description: 'Retail-exclusive version with a slightly different foil treatment. Less valuable than hobby version.', estimatedMultiplier: '60-70% of hobby', rarity: 'common', notes: 'Check packaging version — hobby commands meaningful premium' },
      { name: 'Autographed (collector)', description: 'Crosby-signed examples. Sid rarely signs at public events — premium is high.', estimatedMultiplier: '$2,000–$10,000 additional', rarity: 'rare' },
    ],
    collectingTip: 'Young Guns cards are infamous for surface scratches from sheet cutting. PSA 10 examples have perfect corners, no scratches, and centered image. The UD retail vs. hobby distinction is real — hobby-version cards have a foil sheen that retail versions lack.',
  },
  {
    slug: '2005-06-upper-deck-young-guns-alex-ovechkin-443',
    baseDescription: 'Ovechkin\'s Young Guns follows the same single-version structure as all Upper Deck YG cards. No official parallels.',
    variants: [
      { name: 'Standard Young Guns', description: 'The only version — base card, no parallels.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'Autographed (collector)', description: 'Ovi-signed examples from signings. Generally more available than Crosby autos.', estimatedMultiplier: '$500–$3,000 additional', rarity: 'uncommon' },
    ],
    collectingTip: 'Surface integrity is everything for the Ovechkin YG. The goals record drove demand so sharply that even PSA 8 and 9 copies saw significant appreciation. If budget is limited, a PSA 8 Ovechkin has outperformed most modern cards over 5 years.',
  },
  {
    slug: '2017-18-upper-deck-young-guns-connor-mcdavid-451',
    baseDescription: 'McDavid\'s Young Guns are base cards only — no parallel rainbow. The card was produced in the 2015-16 Upper Deck series (not 2017-18 as the slug might suggest).',
    variants: [
      { name: 'Standard Young Guns', description: 'The only version. Base card, no official parallels.', estimatedMultiplier: 'Market price', rarity: 'uncommon' },
      { name: 'UD Credentials (premium product)', description: 'Rare numbered version from Upper Deck premium products of the same year.', estimatedMultiplier: '5-15x base YG', rarity: 'rare' },
      { name: 'Autographed (collector)', description: 'McDavid-signed copies from in-person events.', estimatedMultiplier: '$1,000–$5,000 additional', rarity: 'uncommon' },
    ],
    collectingTip: 'McDavid has the strongest fundamentals of any current hockey card market. His consistent scoring titles and Hart Trophies make his YG a reliable long-term hold. Focus on PSA 9 and PSA 10 copies — PSA 8 and below have compressed in value.',
  },
  {
    slug: '2016-17-upper-deck-young-guns-auston-matthews-201',
    baseDescription: 'Matthews\'s Young Guns card was issued in the 2016-17 Upper Deck series following his record-setting 4-goal debut.',
    variants: [
      { name: 'Standard Young Guns', description: 'Base card. The definitive Auston Matthews rookie.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Canadian Exclusive YG', description: 'Some retail-only Canadian distributions had different packaging. Card is identical.', estimatedMultiplier: 'Market price', rarity: 'common' },
      { name: 'Autographed (UD products)', description: 'Upper Deck produced official Matthews autos in various premium sets.', estimatedMultiplier: '$2,000–$20,000', rarity: 'rare', notes: 'Check for official UD authentication sticker vs. third-party signed' },
    ],
    collectingTip: 'Matthews is the safest modern hockey hold after McDavid. His 60+ goal seasons and Hart Trophy wins make his cards fundamentally sound. The YG PSA 10 at $8K-$12K is considered fair value by most analysts vs. the McDavid YG at $15K-$60K PSA 10.',
  },
];

export function getCardVariations(slug: string): CardVariations | undefined {
  return cardVariations.find(v => v.slug === slug);
}
