'use client';

import { useMemo, useState } from 'react';

type Category = 'grading' | 'production' | 'market' | 'slang' | 'trading' | 'authentication' | 'storage' | 'numbering';

export interface Term {
  term: string;
  abbr?: string;
  category: Category;
  def: string;
  etymology?: string;
  example: string;
  related?: string[];
}

export const GLOSSARY: Term[] = [
  { term: 'Bump', category: 'grading', def: 'The act of resubmitting a graded card to the same service hoping for a higher grade — e.g., a PSA 9 crossed back to PSA as a "bump attempt" for a potential PSA 10.', example: 'He sent his PSA 9 Trout Finest RC back for a bump — came back PSA 10 and doubled in value overnight.', related: ['Crack-out', 'Cross-grade', 'Regrade'] },
  { term: 'Case Hit', abbr: 'CH', category: 'market', def: 'A rare card or autograph pulled at a rate of approximately one per case (typically 12-24 boxes) — the highest-tier hit level short of a 1/1.', example: 'Panini advertised the Black Prizm auto as a case hit — about one per 18-box case.', related: ['1/1', 'SSP', 'Super Short Print'] },
  { term: 'Centering', category: 'grading', def: 'The alignment of the card\u2019s image within its borders, measured as left/right and top/bottom percentage ratios. PSA 10 typically requires 55/45 or better front centering.', example: 'The card had crisp corners but failed PSA 10 on centering — the left border was 65/35.', related: ['Subgrade', 'Trimming'] },
  { term: 'Comp', category: 'market', def: 'A comparable recent sale used to establish fair market value. "Comps" in the plural refers to the data set of recent comparable transactions.', etymology: 'Short for "comparable sale", borrowed from real-estate terminology.', example: 'Before listing, I pulled comps from the last 90 days — the median came in at $850.', related: ['FMV', 'Last Sale'] },
  { term: 'Crack-out', category: 'grading', def: 'Removing a graded card from its slab to resubmit raw (often to a different grading service, or for a potential grade bump).', example: 'She did a crack-out on her BGS 9.5 to send it to PSA — came back PSA 10 and sold for 3x.', related: ['Bump', 'Cross-grade', 'Regrade'] },
  { term: 'Cross-grade', category: 'grading', def: 'Transferring a graded card from one service (e.g., BGS) to another (e.g., PSA) through a formal crossover submission — the second grader confirms or exceeds the existing grade in-holder.', example: 'He tried a cross-grade on his SGC 9 to PSA — PSA declined and sent it back un-crossed.', related: ['Bump', 'Crack-out'] },
  { term: 'Dead Lot', category: 'market', def: 'An auction lot that ends with no bidders or only the opening bid — the item "died" on the block. Often happens with mispriced lots or lots with poor exposure.', example: 'The vintage lot was priced too aggressively and closed as a dead lot; the seller relisted at a 40% opening reduction.', related: ['Hammer', 'Opening Bid', 'Reserve'] },
  { term: 'Error Card', category: 'production', def: 'A card produced with a factory error — misprint, missing ink layer, wrong back, miscut, or wrong player identification. Some errors are corrected mid-production creating "error" and "corrected" variants both with value.', example: 'The 1989 Fleer Billy Ripken error ("F*** Face" black-bar version) is the most famous error card in modern hobby history.', related: ['Miscut', 'Misprint', 'Variation'] },
  { term: 'FMV', abbr: 'FMV', category: 'market', def: 'Fair Market Value — the estimated current selling price of a card based on recent comparable sales, usually a rolling 30- or 90-day median.', example: 'The card\u2019s FMV is $250; anything below $200 is a deal, anything above $300 is premium pricing.', related: ['Comp', 'Last Sale'] },
  { term: 'Gem Mint', abbr: 'GEM', category: 'grading', def: 'The highest standard grade level for most services — PSA 10, BGS 9.5 (or BGS 10 Pristine for the ultra-rare), SGC 10, CGC 10. Indicates a card essentially free of visible flaws.', example: 'Only 2% of pack-fresh modern cards grade Gem Mint at PSA.', related: ['Grade', 'Pristine'] },
  { term: 'Grail', category: 'slang', def: 'A collector\u2019s ultimate personal target card — often a high-value or emotionally significant card they are actively chasing or saving for.', etymology: 'From "Holy Grail" — the unattainable ultimate object.', example: 'My grail is a 1986 Fleer Michael Jordan PSA 10 — it\u2019s going to take years of saving.', related: ['Chase', 'PC'] },
  { term: 'Grail Watch', category: 'market', def: 'Informal monitoring of a collector\u2019s grail target across marketplaces — saved searches, price alerts, network inquiries. Can go on for years for ultra-high-end grails.', example: 'I\u2019ve been on grail watch for a PSA 9 Wagner for three years — one came up at Heritage but sold for 30% above my budget.', related: ['Grail', 'Watchlist'] },
  { term: 'Hammer', category: 'market', def: 'The final closing price of an auction lot, before buyer\u2019s premium. "Hammer price" is the auctioneer-accepted bid; total cost is hammer + BP.', etymology: 'From the literal gavel-hammer an auctioneer uses to close a lot.', example: 'The card hammered at $8,000; with 20% buyer\u2019s premium the total cost was $9,600.', related: ["Buyer's Premium", 'Opening Bid'] },
  { term: 'Hit', category: 'production', def: 'Any desirable insert, parallel, or autograph pulled from a pack. A "hit" is the pack-rip payoff — the non-base-card card that makes the pack worth opening.', example: 'The box delivered 3 hits — a numbered parallel and two autos.', related: ['Insert', 'Pull', 'RPA'] },
  { term: 'ITG', abbr: 'ITG', category: 'production', def: 'In The Game — a secondary trading-card manufacturer best known for non-licensed pre-NHL-draft hockey products (ITG Draft Prospects). Covers amateur-season cards outside UD\u2019s NHL exclusive.', example: 'McKenna\u2019s ITG Draft Prospects auto is the only way to own his rookie card pre-2026 NHL Draft.', related: ['Leaf', 'Pre-draft'] },
  { term: 'Jumbo', category: 'production', def: 'A pack or product SKU containing more cards per pack than standard — typically 40-50 cards vs 8-12 in a retail blaster. "Hobby Jumbo" is a step up from "Hobby" in content density.', example: 'Topps Chrome Jumbo boxes have fewer packs than Hobby but each pack carries two autos.', related: ['Blaster', 'Hobby', 'Retail'] },
  { term: 'Last Sale', category: 'market', def: 'The most recent documented transaction for an identical card in the same grade. Short for "last recorded sale price", often pulled from eBay sold listings or auction-house closings.', example: 'Last sale was $420 two weeks ago — probably sits in the $400-450 band today.', related: ['Comp', 'FMV'] },
  { term: 'LCS', abbr: 'LCS', category: 'trading', def: 'Local Card Shop — the brick-and-mortar retail store selling sealed product, singles, supplies, and running in-store events (pack nights, breaks, consignment).', example: 'My LCS is the only place around that still runs a Monday-night case break.', related: ['Card Show', 'Dealer'] },
  { term: 'Mail Day', category: 'slang', def: 'The day a package arrives with new cards — used as a verb ("I had a mail day today") and as a hashtag (#MailDay) on collector socials.', example: 'Mail day! My grading return from PSA finally arrived — all three graded 10.', related: ['Unboxing'] },
  { term: 'Marketplace', category: 'trading', def: 'Any platform where hobby transactions occur — eBay, Whatnot, Fanatics Collect, PWCC Marketplace, Facebook Marketplace, COMC, Mercari, OfferUp. Each has distinct fees, audiences, and typical card-value sweet spots.', example: 'For sub-$100 cards I use eBay; for $500+ I prefer PWCC Marketplace for the targeted audience.', related: ['Dealer', 'Consignment'] },
  { term: 'Miscut', category: 'production', def: 'A card cut off-center enough during production that the image runs off one border or shows part of the adjacent card. Severe miscuts become error cards with their own collector base.', example: 'The 1989 Upper Deck Griffey Jr miscut variation appears once per 10,000 cards and sells for $3K+ in any grade.', related: ['Error Card', 'Trim'] },
  { term: 'Numbered', category: 'numbering', def: 'A card with a serial number indicating its position within a print run (e.g., "42/99" = card number 42 of 99 produced). Lower print runs generally command higher prices.', example: 'The numbered-to-25 red parallel sells for 5x the numbered-to-199 blue parallel.', related: ['Print Run', 'Parallel', 'Serial'] },
  { term: 'OPC', abbr: 'OPC', category: 'production', def: 'O-Pee-Chee — Upper Deck\u2019s budget-tier NHL hockey rookie card set, analogous to Topps Update in baseball or Stickers in soccer. Not short-printed; serves as the entry-level hockey rookie card.', example: 'The OPC base rookie is $95 PSA 10 while the UD Young Guns version of the same player is $580.', related: ['Young Guns', 'Rainbow Foil'] },
  { term: 'PC', abbr: 'PC', category: 'slang', def: 'Personal Collection — cards a collector keeps rather than flips, typically organized around favorite players, teams, sets, or themes. "PC" is used both as a noun (my PC) and a verb (I PC his rookies).', example: 'His Ohtani PC has 47 cards including a gem-mint Bowman Chrome auto he refuses to sell.', related: ['Chase', 'Grail'] },
  { term: 'Pop Report', abbr: 'Pop', category: 'grading', def: 'Population report — the public count of how many cards of a specific variety have received each grade at a grading service. PSA, BGS, SGC all publish pop reports. Low pop counts at a high grade signal scarcity.', example: 'The pop report for that card shows 4 PSA 10s and 12 PSA 9s — Pop 4 justifies the $8K premium.', related: ['Gem Mint', 'Pop 1'] },
  { term: 'Pop 1', category: 'grading', def: 'A card with a population of exactly one copy graded at a specific grade level at a specific service — "the only PSA 10 of this card in existence". Pop 1 carries a significant price premium.', example: 'Her Pop 1 PSA 10 of the 1986 Fleer Barkley sold for 9x the Pop 2 price.', related: ['Pop Report', 'Gem Mint'] },
  { term: 'Pop-tracking', category: 'grading', def: 'The ongoing practice of watching PSA/BGS/SGC pop reports for changes that might signal new supply (a new Pop 10 surfacing) or price implications.', example: 'Pop-tracking showed three new PSA 10s emerged last week — expect the card\u2019s ceiling to soften 15-20%.', related: ['Pop Report'] },
  { term: 'Print Run', category: 'production', def: 'The total number of copies produced of a specific card or parallel. Numbered parallels carry explicit print runs; most base cards do not disclose their runs.', example: 'The card\u2019s print run was estimated at 2,500 based on case-per-year math and pack-odds.', related: ['Numbered', 'Parallel', 'Pop Report'] },
  { term: 'Pull', category: 'production', def: 'The card pulled from a pack or box — can be a "big pull" (a high-value hit), a "case pull" (a case-hit tier rarity), or a "chase pull" (a specific target card).', example: 'That case produced a legendary pull — the 1/1 Superfractor auto.', related: ['Case Hit', 'Chase', 'Hit'] },
  { term: 'Rainbow', category: 'slang', def: 'A "rainbow" of parallels — the complete set of colored parallel versions of a single card (silver, blue, purple, red, orange, gold, black, etc). Completing a rainbow is a high-difficulty collector goal.', example: 'He\u2019s missing one color to complete his Prizm Mahomes rainbow — the red /99 has been impossible to find.', related: ['Parallel', 'Chase'] },
  { term: 'Raw', category: 'grading', def: 'An ungraded card — out of any grading-service holder. Raw cards trade at a discount to their graded equivalents because the buyer absorbs grading risk.', example: 'The raw card was $120; graded PSA 9 copies average $340.', related: ['Graded', 'Holder'] },
  { term: 'RC', abbr: 'RC', category: 'production', def: 'Rookie Card — a player\u2019s first officially licensed trading card produced while they are an active rookie at the pro level. Each sport has its own RC designation rules (MLB uses the RC logo; NBA/NFL are more nuanced).', example: 'The 2018 Topps Update Ronald Acuña RC is his canonical MLB rookie card.', related: ['Prospect', 'RPA', 'True Rookie'] },
  { term: 'Reholder', category: 'grading', def: 'Sending a graded card back to the grading service to place it in a new, fresh holder (without regrading). Common for cracked holders or older holder designs that collectors prefer to modernize.', example: 'I sent my vintage PSA 8 for a reholder — the old green-label was yellowing.', related: ['Crack-out', 'Holder'] },
  { term: 'RPA', abbr: 'RPA', category: 'production', def: 'Rookie Patch Auto — a premium rookie card containing both a swatch of player-worn jersey material and an on-card autograph. The 2003-04 Upper Deck Exquisite LeBron RPA is the archetype and among the highest-value modern cards.', example: 'RPAs from Panini National Treasures are the modern football RPA gold standard — $5K+ for top rookies.', related: ['Patch', 'Rookie Auto'] },
  { term: 'Serial', category: 'numbering', def: 'The specific number assigned to an individual numbered card (e.g., serial 42 of a 99 print run). Collectors seek meaningful serials (player\u2019s jersey number, birth year, #1/X).', example: 'He held out for serial 7 — Mantle\u2019s jersey number — and paid a 3x premium over a random serial from the same parallel.', related: ['Numbered', 'Print Run'] },
  { term: 'Shill Bid', category: 'market', def: 'A fake bid placed by a seller or seller-associate on their own auction lot to inflate the closing price. Shill bidding is fraud on eBay and most auction platforms.', example: 'The listing\u2019s bid history showed three bids from a single account that canceled the night before close — classic shill-bid pattern.', related: ['Auction', 'Sniping'] },
  { term: 'Short Print', abbr: 'SP', category: 'numbering', def: 'A base card printed in smaller quantities than the rest of its set. "SSP" = Super Short Print (even rarer). UD Young Guns in hockey is printed SP at 1:4 pack odds.', example: 'The SP variation of the rookie card commands 4-8x the base-variation price.', related: ['SSP', 'Print Run', 'Young Guns'] },
  { term: 'Slab', category: 'storage', def: 'A graded card inside a tamper-evident holder. Also used as a verb ("slab it up") meaning to send for grading.', etymology: 'Hobby slang; the plastic holder resembles a stone slab.', example: 'I slabbed up my best 10 raw cards last month — return came in today.', related: ['Holder', 'Graded'] },
  { term: 'Sniping', category: 'market', def: 'Placing a bid in the final seconds of an auction to win without driving up the price through extended bidding.', example: 'He sniped the lot at 3 seconds left — won it at $12 over the previous high.', related: ['Auction', 'Shill Bid'] },
  { term: 'SSP', abbr: 'SSP', category: 'numbering', def: 'Super Short Print — a card printed in substantially smaller quantities than regular short prints. Often a "case hit" or chase card within its set.', example: 'The SSP photo variation drops at roughly 1-per-case odds.', related: ['Short Print', 'Case Hit'] },
  { term: 'Subgrade', category: 'grading', def: 'A component grade within a grading report — BGS gives separate subgrades for Centering, Corners, Edges, Surface that combine into the overall grade. PSA does not publish subgrades externally.', example: 'The BGS 9.5 has subgrades of 9.5 / 10 / 9.5 / 9 — the 9 on Surface is what kept it from pristine.', related: ['Centering', 'Pristine'] },
  { term: 'Superfractor', category: 'numbering', def: 'The ultra-rare 1/1 parallel in Topps Chrome, Bowman Chrome, and related products — a mirror-finish superfractor treatment. Superfractor rookies command 10-100x standard refractor prices.', example: 'The Superfractor 1/1 of the Strider rookie sold at PWCC for $45,000.', related: ['1/1', 'Refractor', 'Chrome'] },
  { term: 'The Pop', category: 'slang', def: 'Hobby shorthand for the PSA/BGS/SGC pop report as a collective — "the pop is 4 at 10" means four copies exist graded at the top grade.', example: "The pop just dropped for that card — only 2 at 10 now after two were cracked out.", related: ['Pop Report', 'Pop 1'] },
  { term: 'Trim', category: 'authentication', def: 'Illegal alteration of a card\u2019s edges to improve apparent centering or corner sharpness. A "trimmed" card is disqualified from most grading services and considered altered.', example: 'The dimensions came back 0.4mm short of spec — the card was trimmed and PSA returned it unflipped with an Altered designation.', related: ['Altered', 'Authentication'] },
  { term: 'True Rookie', category: 'production', def: 'A player\u2019s genuine first-year-of-eligibility rookie card as opposed to pre-draft, pre-pro, or prospect cards (which may predate the "true" rookie). MLB\u2019s RC logo formalized this distinction in 2006.', example: "Acuña's true rookie is the 2018 Topps Update — his Bowman Chrome prospect cards from 2015-2017 are prospect cards, not true rookies.", related: ['RC', 'Prospect'] },
  { term: 'UD', abbr: 'UD', category: 'production', def: 'Upper Deck — major trading-card manufacturer and the exclusive NHL/NHLPA licensee for most of the 2010s-2020s. Upper Deck\u2019s Young Guns SP is the canonical modern NHL rookie card format.', example: 'UD\u2019s hockey license is what makes Young Guns the flagship NHL rookie — no other licensed hockey rookie product competes.', related: ['Young Guns', 'Panini', 'Topps'] },
  { term: 'Unopened', category: 'market', def: 'Sealed, factory-original product that has never been opened. Unopened vintage wax (pre-1980 packs) commands significant premium over opened product due to authentication and pull potential.', example: 'The unopened 1986 Fleer Basketball wax box sold for $1.2M at Heritage — the opened-and-picked version of the same box is worth perhaps 12% of that.', related: ['Wax', 'Sealed'] },
  { term: 'Variant', category: 'production', def: 'A card printed with a deliberate image, photo, or design variation from the base — e.g., "Photo Variant" (different photo), "SP Variant" (short-printed image), "Image Variation" (different pose). Variants are intentional; errors are not.', example: 'The Photo Variant of the Jordan RC shows him dunking instead of the base handles-the-ball pose — 10x the base price.', related: ['Error Card', 'Short Print'] },
  { term: 'Wax', category: 'production', def: 'Trading-card industry term for sealed pack product, borrowed from the wax-paper wrapping used on packs through the 1980s-1990s.', etymology: 'Early Topps packs were literally wrapped in wax paper.', example: 'I collect vintage wax — my best box is a 1978 Topps Football hobby.', related: ['Unopened', 'Sealed'] },
  { term: 'Whale', category: 'slang', def: 'A collector who spends at the top of the market — typically five- or six-figure purchases, often tracked by hobby media for their PC acquisitions.', etymology: 'Borrowed from gambling (high-roller = whale).', example: 'A whale bought four Pop 1 Mantles in 30 days — auction-house invoices leaked to the hobby press.', related: ['Grail', 'PC'] },
  { term: 'Whatsit', category: 'slang', def: 'A card that lacks a clear identity — odd year, unfamiliar player, obscure brand, oddball format. "Is this a whatsit?" is shorthand for "what even is this card?".', example: 'The whatsit turned out to be a 1976 regional food-issue card of a minor-league outfielder — rare but illiquid.', related: ['Oddball', 'Regional'] },
  { term: 'Wrapper Redemption', category: 'production', def: 'A promotional program where a player returns pack wrappers to the manufacturer in exchange for a special insert or bonus card. Common in 1990s Upper Deck programs.', example: 'The 1993 Upper Deck wrapper redemption delivered a special-edition holograph of Griffey Jr.', related: ['Promo', 'Redemption'] },
  { term: 'Young Guns', abbr: 'YG', category: 'production', def: 'Upper Deck\u2019s flagship NHL rookie card insert — 1-in-4 pack odds short-print, card numbers 201-250 in Series 1 and 451-500 in Series 2. The canonical hockey modern RC format.', example: 'Celebrini\u2019s Young Guns RC floors at $1,400 PSA 10 with the Canvas parallel at $3,500.', related: ['UD', 'Short Print', 'OPC'] },
  { term: '1/1', category: 'numbering', def: 'A card with a print run of exactly one copy. The rarest numbered tier — every 1/1 is by definition the unique example of that specific card/parallel combination.', example: 'The Superfractor 1/1 and the Black Prizm 1/1 are often the hobby\'s most-chased "grails" for a given rookie.', related: ['Numbered', 'Grail', 'Superfractor'] },
  { term: 'Auto', category: 'production', def: 'Autograph — an on-card or sticker-affixed player signature. "On-card auto" is signed directly on the card surface (higher desirability); "sticker auto" is signed on a transparent sticker then applied to the card.', example: 'The on-card auto trades 1.5-2x the sticker-auto equivalent for the same player in the same set.', related: ['On-Card', 'Sticker Auto', 'RPA'] },
  { term: 'Buyer Premium', abbr: 'BP', category: 'market', def: 'A fee charged by auction houses on top of the hammer price, typically 15-25% depending on the house. The buyer pays hammer + BP as the total cost.', example: 'Goldin charges 20% BP — a $10K hammer becomes a $12K total cost.', related: ['Hammer', 'Auction'] },
  { term: 'Chrome', category: 'production', def: 'Topps\u2019 chrome-finish sub-brand — mirror-refractor card stock that became the hobby\u2019s canonical modern-rookie format. Bowman Chrome, Topps Chrome, and Topps Chrome Update are the flagship products.', example: 'Bowman Chrome prospect autos are the canonical MLB prospect card — Ohtani\u2019s 2013 Bowman Chrome auto sold for $225K at the 2021 peak.', related: ['Refractor', 'Superfractor'] },
  { term: 'Consignment', category: 'trading', def: 'An arrangement where a collector hands cards to a third party (auction house, broker) who sells them in exchange for a commission. Common for high-value cards or collections.', example: 'I consigned my high-end PC to PWCC — their commission is 5% on sales over $2K.', related: ['Marketplace', 'Dealer'] },
  { term: 'Crack & Flip', category: 'grading', def: 'Cracking a graded card out of its holder and immediately reselling raw — usually when the graded market is temporarily illiquid but raw demand is strong, or to enable a cross-grade attempt.', example: 'Crack & flip strategy: buy undervalued SGC 9 slabs, crack, send to PSA, flip as PSA 9 at 40% premium.', related: ['Crack-out', 'Cross-grade'] },
  { term: 'Kicker', category: 'slang', def: 'An unexpected high-value card pulled in addition to the primary hit — the "kicker" that turns a decent box into a memorable one.', example: "The box delivered the advertised auto plus a kicker — a numbered /25 parallel that was worth more than the box price.", related: ['Hit', 'Pull'] },
  { term: 'Refractor', category: 'production', def: 'A chrome-finish parallel treatment with rainbow light-reflection. Refractors come in base-refractor and colored-parallel variations (blue, red, orange, gold, black, etc) each with its own print run.', example: 'The X-Fractor refractor from Bowman Chrome is a popular mid-tier chrome collecting target.', related: ['Chrome', 'Superfractor', 'Parallel'] },
  { term: 'Prospect', category: 'production', def: 'A player whose cards are issued before their MLB/NBA/NFL/NHL debut. Prospect cards (e.g., Bowman Chrome prospects) can skyrocket in value when the player reaches the pros — but many prospects never make it.', example: 'I was pro-rata on 20 Bowman Chrome 1st Bowman prospect autos this year — 3 hit, 17 busted. Standard prospect-hit math.', related: ['RC', 'True Rookie', '1st Bowman'] },
];

type SortBy = 'alpha' | 'category';

export default function HobbyGlossaryClient() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('alpha');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = GLOSSARY.filter((t) => {
      if (cat !== 'all' && t.category !== cat) return false;
      if (!q) return true;
      const hay = [t.term, t.abbr || '', t.def, t.example, t.etymology || '', ...(t.related || [])].join(' ').toLowerCase();
      return hay.includes(q);
    });
    if (sortBy === 'alpha') arr = [...arr].sort((a, b) => a.term.localeCompare(b.term));
    else arr = [...arr].sort((a, b) => a.category.localeCompare(b.category) || a.term.localeCompare(b.term));
    return arr;
  }, [query, cat, sortBy]);

  const groupedByLetter = useMemo(() => {
    const map: Record<string, Term[]> = {};
    for (const t of filtered) {
      const letter = t.term[0].toUpperCase();
      (map[letter] ||= []).push(t);
    }
    return map;
  }, [filtered]);

  const groupedByCategory = useMemo(() => {
    const map: Record<string, Term[]> = {};
    for (const t of filtered) {
      (map[t.category] ||= []).push(t);
    }
    return map;
  }, [filtered]);

  const letters = Object.keys(groupedByLetter).sort();
  const categories = Object.keys(groupedByCategory).sort();

  const catMeta: Record<Category, { label: string; color: string }> = {
    grading: { label: 'Grading', color: 'bg-sky-950/60 text-sky-300 border-sky-800/50' },
    production: { label: 'Production', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' },
    market: { label: 'Market', color: 'bg-amber-950/60 text-amber-300 border-amber-800/50' },
    slang: { label: 'Slang', color: 'bg-pink-950/60 text-pink-300 border-pink-800/50' },
    trading: { label: 'Trading', color: 'bg-violet-950/60 text-violet-300 border-violet-800/50' },
    authentication: { label: 'Authentication', color: 'bg-red-950/60 text-red-300 border-red-800/50' },
    storage: { label: 'Storage', color: 'bg-slate-950/60 text-slate-300 border-slate-700/60' },
    numbering: { label: 'Numbering', color: 'bg-teal-950/60 text-teal-300 border-teal-800/50' },
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms, definitions, examples..."
            className="flex-1 min-w-[200px] rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="alpha">Sort A-Z</option>
            <option value="category">By category</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCat('all')} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${cat === 'all' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>All ({GLOSSARY.length})</button>
          {(Object.keys(catMeta) as Category[]).map((c) => {
            const count = GLOSSARY.filter((t) => t.category === c).length;
            return (
              <button key={c} onClick={() => setCat(c)} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${cat === c ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>
                {catMeta[c].label} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-300 font-semibold">{filtered.length} term{filtered.length === 1 ? '' : 's'} shown</span>
          {query && <button onClick={() => setQuery('')} className="text-gray-500 hover:text-amber-300">Clear search</button>}
        </div>
      </div>

      {/* Letter nav (only when alpha) */}
      {sortBy === 'alpha' && letters.length > 1 && (
        <div className="flex flex-wrap gap-1.5 sticky top-16 z-10 bg-slate-950/90 backdrop-blur px-2 py-2 rounded-lg border border-slate-800">
          {letters.map((L) => (
            <a key={L} href={`#letter-${L}`} className="w-7 h-7 flex items-center justify-center rounded bg-slate-800 text-amber-300 text-xs font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors">
              {L}
            </a>
          ))}
        </div>
      )}

      {/* Glossary */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-gray-500 text-sm">
          No terms match. Try clearing the search or switching categories.
        </div>
      ) : sortBy === 'alpha' ? (
        <div className="space-y-8">
          {letters.map((L) => (
            <div key={L} id={`letter-${L}`}>
              <h2 className="text-2xl font-black text-amber-300 mb-3 border-b border-amber-900/40 pb-2">{L}</h2>
              <div className="space-y-3">
                {groupedByLetter[L].map((t) => <TermCard key={t.term} t={t} catMeta={catMeta} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((c) => (
            <div key={c}>
              <h2 className="text-2xl font-black text-amber-300 mb-3 border-b border-amber-900/40 pb-2 capitalize">{catMeta[c as Category].label}</h2>
              <div className="space-y-3">
                {groupedByCategory[c].map((t) => <TermCard key={t.term} t={t} catMeta={catMeta} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TermCard({ t, catMeta }: { t: Term; catMeta: Record<Category, { label: string; color: string }> }) {
  const m = catMeta[t.category];
  return (
    <details className="group rounded-xl border border-slate-800 bg-slate-900/40 hover:border-amber-800/40 transition-colors" id={`term-${t.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
      <summary className="flex items-start gap-3 p-4 cursor-pointer">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg sm:text-xl font-black text-white">{t.term}</h3>
            {t.abbr && t.abbr !== t.term && <span className="text-[10px] font-mono uppercase text-gray-500">({t.abbr})</span>}
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${m.color}`}>{m.label}</span>
          </div>
          <p className="text-sm text-gray-300 mt-1 leading-relaxed">{t.def}</p>
        </div>
        <span className="text-gray-500 text-sm group-open:rotate-90 transition-transform mt-1 shrink-0">&#9654;</span>
      </summary>
      <div className="px-4 pb-4 space-y-3 text-sm">
        {t.etymology && (
          <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Origin</div>
            <p className="text-gray-300 italic">{t.etymology}</p>
          </div>
        )}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
          <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Example</div>
          <p className="text-gray-300 italic">&ldquo;{t.example}&rdquo;</p>
        </div>
        {t.related && t.related.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Related terms</div>
            <div className="flex flex-wrap gap-1.5">
              {t.related.map((r) => (
                <a key={r} href={`#term-${r.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 hover:bg-amber-950">{r}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
