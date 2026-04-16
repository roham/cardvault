'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ── types ───────────────────────────────────────────────────────── */

interface Term {
  term: string;
  definition: string;
  category: Category;
  example?: string;
  toolLink?: { href: string; label: string };
  aka?: string[];
}

type Category = 'grading' | 'types' | 'market' | 'condition' | 'rarity' | 'selling' | 'investing' | 'breaks';

const CATEGORIES: { value: Category | 'all'; label: string; icon: string; color: string }[] = [
  { value: 'all', label: 'All Terms', icon: '📖', color: 'text-white' },
  { value: 'grading', label: 'Grading', icon: '🏆', color: 'text-amber-400' },
  { value: 'types', label: 'Card Types', icon: '🃏', color: 'text-blue-400' },
  { value: 'market', label: 'Market', icon: '📈', color: 'text-emerald-400' },
  { value: 'condition', label: 'Condition', icon: '🔍', color: 'text-purple-400' },
  { value: 'rarity', label: 'Rarity', icon: '💎', color: 'text-pink-400' },
  { value: 'selling', label: 'Selling', icon: '💰', color: 'text-green-400' },
  { value: 'investing', label: 'Investing', icon: '📊', color: 'text-cyan-400' },
  { value: 'breaks', label: 'Breaks', icon: '📦', color: 'text-orange-400' },
];

const CAT_COLORS: Record<Category, string> = {
  grading: 'border-amber-800/40 bg-amber-950/20',
  types: 'border-blue-800/40 bg-blue-950/20',
  market: 'border-emerald-800/40 bg-emerald-950/20',
  condition: 'border-purple-800/40 bg-purple-950/20',
  rarity: 'border-pink-800/40 bg-pink-950/20',
  selling: 'border-green-800/40 bg-green-950/20',
  investing: 'border-cyan-800/40 bg-cyan-950/20',
  breaks: 'border-orange-800/40 bg-orange-950/20',
};

const CAT_BADGE: Record<Category, string> = {
  grading: 'bg-amber-900/50 text-amber-400',
  types: 'bg-blue-900/50 text-blue-400',
  market: 'bg-emerald-900/50 text-emerald-400',
  condition: 'bg-purple-900/50 text-purple-400',
  rarity: 'bg-pink-900/50 text-pink-400',
  selling: 'bg-green-900/50 text-green-400',
  investing: 'bg-cyan-900/50 text-cyan-400',
  breaks: 'bg-orange-900/50 text-orange-400',
};

/* ── data ────────────────────────────────────────────────────────── */

const TERMS: Term[] = [
  // GRADING (15)
  { term: 'PSA', definition: 'Professional Sports Authenticator — the most popular card grading company. Uses a 1-10 scale with 10 being Gem Mint. Founded in 1991, PSA has graded over 60 million cards.', category: 'grading', example: 'A PSA 10 Shohei Ohtani rookie sells for 10x the raw price.', toolLink: { href: '/tools/grading-roi', label: 'Grading ROI Calculator' } },
  { term: 'BGS', definition: 'Beckett Grading Services — known for subgrade system (centering, corners, edges, surface) scored 1-10. A BGS 9.5 Gem Mint is roughly equivalent to PSA 10. BGS Black Label (all 10 subgrades) is the pinnacle.', category: 'grading', aka: ['Beckett'] },
  { term: 'CGC', definition: 'Certified Guaranty Company — originally a comic book grader that expanded to trading cards. Uses 1-10 scale with half-point increments. Known for clear, scratch-resistant holders.', category: 'grading' },
  { term: 'SGC', definition: 'Sportscard Guaranty Corporation — known for vintage card grading expertise. Uses a 1-10 scale. Their tuxedo-style holder is distinctive. Often preferred for pre-war cards.', category: 'grading' },
  { term: 'Gem Mint', definition: 'The highest grade achievable — PSA 10, BGS 9.5+, CGC 10, or SGC 10. Indicates virtually perfect condition with no visible flaws under magnification.', category: 'grading', example: 'Only about 30-50% of submissions receive Gem Mint grades.' },
  { term: 'Slab', definition: 'The sealed plastic case that holds a graded card. The term comes from the slab-like appearance of the hard plastic encapsulation. Slabs protect the card and display the grade.', category: 'grading', aka: ['Holder', 'Case'] },
  { term: 'Subgrades', definition: 'BGS scores individual aspects of a card: Centering, Corners, Edges, and Surface, each on a 1-10 scale. The overall grade is a weighted average. All four 10s earns a Black Label.', category: 'grading', toolLink: { href: '/tools/bgs-subgrade', label: 'BGS Subgrade Calculator' } },
  { term: 'Pop Report', definition: 'Population report — the total number of cards graded at each grade level for a specific card. Low pop counts (fewer graded) typically command higher prices due to perceived scarcity.', category: 'grading', toolLink: { href: '/tools/pop-report', label: 'Pop Report Lookup' } },
  { term: 'Crossover', definition: 'Removing a card from one grading company\'s slab to resubmit to a different company. Often done to move from BGS/CGC/SGC to PSA for higher resale value.', category: 'grading', toolLink: { href: '/tools/cross-grade', label: 'Cross-Grade Calculator' } },
  { term: 'Crack and Resubmit', definition: 'Breaking a card out of its current slab to resubmit to the same or different company hoping for a higher grade. Risky — the card could receive a lower grade.', category: 'grading', toolLink: { href: '/tools/regrade-calc', label: 'Regrade Calculator' } },
  { term: 'Turnaround Time', definition: 'The time between submitting a card for grading and receiving it back. Ranges from 5 days (express) to 6+ months (economy). Faster service costs significantly more.', category: 'grading', toolLink: { href: '/tools/turnaround-estimator', label: 'Turnaround Estimator' } },
  { term: 'Minimum Value', definition: 'Grading companies often require cards to meet a minimum estimated value for submission. PSA requires $20+ for most service levels to prevent overwhelming the system with bulk commons.', category: 'grading' },
  { term: 'Bulk Submission', definition: 'Submitting multiple cards at once, usually 20+ at a discounted per-card rate. The tradeoff is longer turnaround times. Popular for flippers grading large quantities of rookies.', category: 'grading' },
  { term: 'Authentication', definition: 'Verification that a card is genuine and not counterfeit. All grading companies authenticate before grading. Fake cards are marked as "Altered" or "Counterfeit" and returned without a grade.', category: 'grading', toolLink: { href: '/tools/auth-check', label: 'Authentication Checker' } },
  { term: 'Cert Number', definition: 'The unique certification number printed on every graded slab. Used to verify the grade and card details on the grading company\'s website. Always check cert numbers before buying graded cards.', category: 'grading', toolLink: { href: '/tools/cert-check', label: 'Cert Verification' } },

  // CARD TYPES (15)
  { term: 'Rookie Card (RC)', definition: 'A player\'s first officially licensed trading card from their professional debut season. RCs are the most collectible card type. The RC designation is printed on most modern cards.', category: 'types', example: 'A 2018 Topps Update Ronald Acuna Jr. RC is his flagship rookie.', toolLink: { href: '/tools/rookie-finder', label: 'Rookie Card Finder' } },
  { term: 'Base Card', definition: 'The standard, most common card in a set. Every player in the set has a base card. These are the bread and butter of collecting — high supply, lower individual value.', category: 'types' },
  { term: 'Parallel', definition: 'An alternate version of a base card featuring different colors, patterns, or finishes. Parallels vary in rarity — numbered parallels (e.g., /199, /50, /10) are scarcer and more valuable.', category: 'types', toolLink: { href: '/tools/parallel-value', label: 'Parallel Value Guide' } },
  { term: 'Refractor', definition: 'A special parallel with a rainbow-like, shiny surface. Originated with 1993 Topps Finest. Refractors are the gold standard of desirable parallels. Variations include Gold, Blue, Red, and Superfractor (/1).', category: 'types', example: 'A Topps Chrome Gold Refractor /50 is among the most chase-worthy parallels.' },
  { term: 'Auto / Autograph', definition: 'A card featuring a player\'s authentic signature, either on-card (signed directly on the card) or on a sticker affixed to the card. On-card autos command a premium.', category: 'types' },
  { term: 'Relic / Patch Card', definition: 'A card containing a piece of game-worn memorabilia — jersey swatch, bat piece, nameplate, or logo patch. Multi-color patches are more valuable than single-color swatches.', category: 'types' },
  { term: 'Insert', definition: 'A special card not part of the base set, inserted at a certain ratio (e.g., 1:24 packs). Inserts have unique designs and are typically more valuable than base cards.', category: 'types' },
  { term: 'Short Print (SP)', definition: 'A card produced in lower quantities than the standard base run. Short prints are harder to find, creating natural scarcity. SSPs (Super Short Prints) are even rarer.', category: 'types', aka: ['SP', 'SSP'] },
  { term: 'Bowman 1st', definition: 'A player\'s first Bowman card — the de facto "prospect card" for baseball. Bowman 1st cards are highly collectible because they come before the player\'s MLB debut and official RC.', category: 'types', example: 'A 2019 Bowman Chrome 1st Wander Franco was a $1,000+ card before his debut.' },
  { term: 'Prizm', definition: 'Panini\'s flagship basketball/football brand featuring holographic-like base cards and colorful numbered parallels. Silver Prizms are the default chase. The brand dominates modern card collecting.', category: 'types' },
  { term: 'Topps Chrome', definition: 'Topps\' premium chromium brand for baseball. Chrome refractors are among the most collected modern cards. The chromium finish provides a shinier, more durable surface than regular Topps.', category: 'types' },
  { term: 'Young Guns (YG)', definition: 'Upper Deck\'s rookie card designation for hockey. Short-printed in Series 1 and 2 packs. The most popular hockey RC brand, similar to what Prizm is for basketball.', category: 'types' },
  { term: 'Variation', definition: 'A card that looks similar to the base version but has a subtle difference — different photo, error, or design element. Photo variations can be extremely rare and valuable.', category: 'types' },
  { term: 'Numbered Card', definition: 'A card with a print run stamped on it (e.g., 45/99 means card 45 of 99 total). Lower print runs mean higher scarcity and typically higher value. /1 is a one-of-one.', category: 'types' },
  { term: 'One-of-One (1/1)', definition: 'A card with a print run of exactly one. The ultimate collectible — only one person in the world can own it. Superfractors, printing plates, and some patches are 1/1s.', category: 'types', aka: ['Superfractor', 'One of One'] },

  // MARKET (15)
  { term: 'Comps / Comparables', definition: 'Recently sold prices for the same or similar card. eBay "sold listings" are the standard source for comps. Always check comps before buying or selling.', category: 'market', toolLink: { href: '/tools/price-history', label: 'Price History Tool' } },
  { term: 'FMV', definition: 'Fair Market Value — the estimated price a card would sell for in an open market. Based on recent sold comps, condition, and demand. CardVault estimates FMV for 8,100+ cards.', category: 'market', aka: ['Fair Market Value'] },
  { term: 'BIN', definition: 'Buy It Now — a fixed-price eBay listing (vs. auction). BIN prices are often 10-30% above the average sold price because sellers price high and wait. Always check sold comps, not BIN listings.', category: 'market', aka: ['Buy It Now'] },
  { term: 'Hype Tax', definition: 'The premium paid immediately after a major event (draft, championship, viral moment). Card prices spike 50-200% on hype and typically correct within 30-90 days. Patient buyers win.', category: 'market', example: 'After Jayden Daniels was drafted #2, his cards spiked 300% and settled back in 6 weeks.' },
  { term: 'Market Correction', definition: 'A broad decline in card values, usually 10-30%, after a period of unsustainable price growth. Corrections are healthy and create buying opportunities. The 2022 correction hit modern cards hard.', category: 'market' },
  { term: 'Bubble', definition: 'When card prices exceed reasonable fundamentals. The 2020-2021 COVID card boom was a classic bubble — new money flooded in, prices soared, then corrected 40-60% in some segments.', category: 'market' },
  { term: 'Floor Price', definition: 'The lowest price a card typically trades at. Budget cards have a floor near $0.25-$1. High-demand rookies have higher floors. Floors are important for managing downside risk.', category: 'market' },
  { term: 'Ceiling', definition: 'The maximum realistic value a card could reach based on the player\'s potential. A #1 overall pick\'s ceiling is higher than a 7th-round pick\'s. Ceiling determines speculative upside.', category: 'market' },
  { term: 'Movers', definition: 'Cards showing significant price movement — up (gainers) or down (decliners). Tracking movers helps identify trends early and spot buying opportunities.', category: 'market', toolLink: { href: '/market-movers', label: 'Market Movers' } },
  { term: 'Seasonal Cycle', definition: 'Card prices follow predictable patterns: baseball peaks April-October, football August-February, basketball October-June. Buy in the off-season for better prices.', category: 'market', toolLink: { href: '/tools/seasonality', label: 'Seasonality Guide' } },
  { term: 'Dead Money', definition: 'Capital tied up in cards that aren\'t moving — no price appreciation, no buyer demand. Junk wax era commons are the classic example. Opportunity cost of holding dead money is real.', category: 'market' },
  { term: 'Catalyst', definition: 'An event that triggers price movement — draft pick, award, trade, injury return, viral moment. Positive catalysts spike prices; negative catalysts (injury, suspension) crash them.', category: 'market' },
  { term: 'Liquidity', definition: 'How quickly a card can be sold at or near market price. High-demand rookies (Ohtani, Wemby) are very liquid. Obscure vintage commons are illiquid — they sit for weeks.', category: 'market' },
  { term: 'Thin Market', definition: 'When very few copies of a card are available for sale or have recently sold, making it hard to determine an accurate price. Numbered parallels and vintage cards often have thin markets.', category: 'market' },
  { term: 'Whale', definition: 'A high-value card, typically $1,000+. Also refers to a collector or investor who spends heavily. Whale cards include vintage HOF RCs, 1/1 autos, and iconic base rookies in gem mint.', category: 'market' },

  // CONDITION (15)
  { term: 'Centering', definition: 'How evenly the card image is positioned within the borders. Perfect centering is 50/50 on both axes. PSA allows 55/45 for a 10, 60/40 for a 9. Centering is the first thing graders check.', category: 'condition', toolLink: { href: '/tools/centering-check', label: 'Centering Checker' } },
  { term: 'Corners', definition: 'The sharpness of a card\'s four corners. Rounded, dinged, or frayed corners immediately lower a grade. Corners are the most common reason cards don\'t achieve Gem Mint.', category: 'condition' },
  { term: 'Edges', definition: 'The smoothness of a card\'s four edges. Chipping, roughness, or dings along the edges reduce the grade. Dark-bordered cards show edge wear more visibly.', category: 'condition' },
  { term: 'Surface', definition: 'The front and back of the card. Scratches, print defects, staining, and fingerprint marks affect surface condition. Chrome and foil cards are especially prone to surface scratching.', category: 'condition' },
  { term: 'Print Line', definition: 'A thin line across the card surface from the printing process. Print lines are factory defects, not handling damage. They lower grades because they are visible flaws.', category: 'condition' },
  { term: 'Wax Stain', definition: 'Discoloration from direct contact with the pack\'s wax wrapper. Common in vintage cards from the 1950s-1980s when cards were packed against wax paper. Reduces desirability.', category: 'condition' },
  { term: 'Miscut', definition: 'A card with uneven cutting from the factory — one side has a much larger border. Extreme miscuts showing parts of adjacent cards can actually be collectible as "error" cards.', category: 'condition' },
  { term: 'Off-Center (OC)', definition: 'A card with noticeably uneven borders, graded below PSA 9 due to centering. PSA adds an OC qualifier. BGS factors centering into the subgrade. Off-center cards trade at significant discounts.', category: 'condition' },
  { term: 'Penny Sleeve', definition: 'A thin, soft plastic sleeve that is the first layer of protection for any card. Always put a card in a penny sleeve BEFORE a toploader or magnetic case. Costs about $0.01 each.', category: 'condition' },
  { term: 'Toploader', definition: 'A rigid plastic holder that protects a card from bending. Cards go in a penny sleeve first, then into the toploader. Standard protection for shipping and storage. About $0.10 each.', category: 'condition', toolLink: { href: '/tools/storage-calc', label: 'Storage Calculator' } },
  { term: 'One-Touch', definition: 'A magnetic card holder that snaps shut. More premium than toploaders. UV-protective versions help prevent sun damage. Used for higher-value raw cards. About $3-8 each.', category: 'condition' },
  { term: 'NM', definition: 'Near Mint — a card in excellent condition with only very minor flaws. Equivalent to PSA 7-8 range. Most "raw" cards sold online are described as NM or NM-MT (Near Mint to Mint).', category: 'condition', aka: ['Near Mint', 'NM-MT'] },
  { term: 'VG', definition: 'Very Good — a card with moderate wear including rounded corners, minor creases, or surface scuffs. PSA 4 range. Common for vintage cards. VG vintage HOF cards are affordable entry points.', category: 'condition', aka: ['Very Good'] },
  { term: 'Trimmed', definition: 'A card whose edges have been physically cut to improve centering or remove damage. Trimmed cards are considered altered/counterfeit by grading companies. Always a red flag.', category: 'condition' },
  { term: 'Factory Sealed', definition: 'A product that has never been opened, with the original manufacturer\'s seal intact. Factory sealed products are worth more than opened ones because contents are unknown and potentially valuable.', category: 'condition' },

  // RARITY (15)
  { term: 'Numbered (/X)', definition: 'A card with a specific print run stamped on it. /999 is relatively common, /99 is scarce, /25 is rare, /10 is very rare, /5 is ultra-rare, /1 is one-of-one. Lower numbers = higher value.', category: 'rarity' },
  { term: 'Hit', definition: 'A special card pulled from a pack — autograph, relic, numbered parallel, or insert. Each box guarantees a certain number of hits. "I pulled a hit!" means something beyond a base card.', category: 'rarity' },
  { term: 'Chase Card', definition: 'The most desirable card in a product — what everyone is chasing. Typically the best rookie in the set\'s most desirable parallel. The chase card drives the product\'s value.', category: 'rarity', example: 'The chase in 2024 Topps Chrome is the Elly De La Cruz Refractor RC.' },
  { term: 'Case Hit', definition: 'A card so rare it averages one per sealed case (12-20 boxes). Case hits are the ultra-premium inserts — Gold Refractors, 1st Auto Superfractors, and similar high-end pulls.', category: 'rarity' },
  { term: 'SSP', definition: 'Super Short Print — a card printed in very low quantities compared to the base set. SSPs can be 5-50x rarer than base cards. Often unmarked, making them hard to identify without a checklist.', category: 'rarity', aka: ['Super Short Print'] },
  { term: 'Printing Plate', definition: 'The actual metal plate used to print the card, inserted into packs as a 1/1. Four plates per card (Cyan, Magenta, Yellow, Black). Unique collectibles from the printing process.', category: 'rarity' },
  { term: 'Junk Wax Era', definition: 'The period from roughly 1987-1993 when card companies massively overproduced. Billions of cards were printed, making most commons nearly worthless today. Key lesson in supply and demand.', category: 'rarity', toolLink: { href: '/tools/era-guide', label: 'Era Guide' } },
  { term: 'Pre-War', definition: 'Cards produced before World War II (before 1942). Includes tobacco cards (T206), caramel cards, and early Goudey issues. Pre-war cards are scarce due to age and fragile materials.', category: 'rarity' },
  { term: 'Vintage', definition: 'Generally refers to cards from the 1950s-1970s (Topps era through the end of the classic designs). Vintage cards have inherent scarcity due to age, condition degradation, and attrition.', category: 'rarity' },
  { term: 'Modern', definition: 'Cards from roughly 1990-present. The modern era features chrome technology, refractors, autographs, relics, and numbered parallels. Modern cards rely on manufactured scarcity.', category: 'rarity' },
  { term: 'Ultra-Modern', definition: 'Cards from 2019-present. Characterized by extreme parallel variety, on-card autos, and high price points. Ultra-modern has created a massive secondary market.', category: 'rarity' },
  { term: 'Error Card', definition: 'A card with a manufacturing mistake — wrong photo, misspelled name, incorrect stats, or reversed image. Some errors are corrected mid-run, making the error version scarcer.', category: 'rarity', toolLink: { href: '/tools/error-cards', label: 'Error Card Guide' } },
  { term: 'Redemption', definition: 'A placeholder card redeemable for a future autograph or relic when the player signs their stickers. Redemptions can take months to fulfill. Unfulfilled redemptions are worth less.', category: 'rarity' },
  { term: 'Print Run', definition: 'The total number of copies printed for a specific card. Base cards might have millions printed. Numbered parallels explicitly state the print run. Lower runs = higher value.', category: 'rarity', toolLink: { href: '/tools/print-run', label: 'Print Run Estimator' } },
  { term: 'Color Match', definition: 'When a numbered parallel\'s color matches the player\'s team colors. A Blue Prizm /199 of a Dodger or a Green Prizm of a Celtics player. Color matches command premiums.', category: 'rarity' },

  // SELLING (15)
  { term: 'eBay Sold Listings', definition: 'Completed eBay sales showing what cards actually sold for — the gold standard for pricing cards. Filter by "Sold Items" in eBay search. Never price based on active listings.', category: 'selling' },
  { term: 'Final Value Fee', definition: 'eBay charges sellers approximately 13% of the total sale price (including shipping). This is the biggest cost of selling on eBay and must be factored into pricing.', category: 'selling', toolLink: { href: '/tools/ebay-fee-calc', label: 'eBay Fee Calculator' } },
  { term: 'PWE', definition: 'Plain White Envelope — the cheapest shipping method for raw cards. Card goes in a penny sleeve + toploader, then between two pieces of cardboard in a regular envelope. Costs about $0.75 to ship.', category: 'selling', aka: ['Plain White Envelope'] },
  { term: 'BMWT', definition: 'Bubble Mailer With Tracking — the standard shipping method for cards over $20. Provides more protection than PWE and includes tracking. Costs about $3.50-5.00 to ship.', category: 'selling', aka: ['Bubble Mailer With Tracking'], toolLink: { href: '/tools/shipping-calc', label: 'Shipping Calculator' } },
  { term: 'COMC', definition: 'Check Out My Cards — an online consignment service where you ship cards and they photograph, list, and sell them for you. 20% commission but saves time. Good for bulk selling.', category: 'selling' },
  { term: 'LCS', definition: 'Local Card Shop — a brick-and-mortar store that buys, sells, and trades cards. LCS typically pays 50-70% of market value when buying. Great for instant cash but not the best prices.', category: 'selling', aka: ['Local Card Shop'] },
  { term: 'Buyback', definition: 'Selling a card back to a dealer or platform at a predetermined percentage of market value, typically 60-90%. Quick and easy but you leave money on the table vs. selling to collectors.', category: 'selling' },
  { term: 'Consignment', definition: 'Having an auction house or dealer sell your cards on your behalf for a commission (typically 10-20%). Best for high-value cards ($500+) where professional marketing increases the final price.', category: 'selling', toolLink: { href: '/vault/consignment', label: 'Consignment Tracker' } },
  { term: 'Auction House', definition: 'Companies like Heritage, Goldin, PWCC, REA, and Lelands that conduct professional card auctions. They handle photography, descriptions, marketing, and have established buyer bases for high-end cards.', category: 'selling' },
  { term: 'Lot', definition: 'A group of cards sold together as a bundle. Lots typically sell at a discount to individual prices but move faster. Great for clearing bulk inventory. Team lots and player lots are most popular.', category: 'selling', toolLink: { href: '/vault/bundle-creator', label: 'Bundle Creator' } },
  { term: 'Flipping', definition: 'Buying cards at a low price and quickly reselling for profit. Successful flippers buy during dips, capitalize on hype events, and understand platform fees. Marcus the Flipper is a CardVault persona.', category: 'selling', toolLink: { href: '/tools/flip-calc', label: 'Flip Calculator' } },
  { term: 'Penny Start', definition: 'Starting an eBay auction at $0.99 to attract bidders. Risky for valuable cards (might sell below market) but effective for generating interest and achieving true market price.', category: 'selling' },
  { term: 'Tax Implications', definition: 'Card sales are taxable income. Cards held over 1 year are taxed at the 28% collectibles capital gains rate. Under 1 year is ordinary income tax rate. Always track cost basis.', category: 'selling', toolLink: { href: '/tools/tax-calc', label: 'Tax Calculator' } },
  { term: 'Offer / OBO', definition: 'Or Best Offer — a listing where the seller accepts offers below the listed price. OBO listings often sell 10-20% below the listed price. Always make offers on OBO listings.', category: 'selling', aka: ['OBO', 'Best Offer'] },
  { term: 'Marketplace', definition: 'Any platform where cards are bought and sold — eBay, Mercari, COMC, MySlabs, Facebook groups, card shows, Instagram. Each has different fee structures and buyer demographics.', category: 'selling' },

  // INVESTING (15)
  { term: 'Buy the Dip', definition: 'Purchasing a card after its price has declined, betting on a future rebound. Works best for established players experiencing temporary setbacks (injury, slump, trade).', category: 'investing', example: 'MacKenzie Gore cards dropped 90% from prospect peak — potential dip buy.' },
  { term: 'Holding Period', definition: 'The time you plan to own a card before selling. Short-term (flip within days/weeks), medium-term (months), or long-term (years). Longer holds mean collectibles tax rate (28%).', category: 'investing' },
  { term: 'Diversification', definition: 'Spreading card investments across multiple sports, players, eras, and card types to reduce risk. The 3-Sport Rule suggests no more than 50% in one sport.', category: 'investing', toolLink: { href: '/tools/diversification', label: 'Diversification Tool' } },
  { term: 'Cost Basis', definition: 'The original purchase price of a card, including shipping and fees. Used to calculate profit/loss and taxes. Track your cost basis for every card.', category: 'investing' },
  { term: 'ROI', definition: 'Return on Investment — profit divided by cost basis, expressed as a percentage. A $10 card sold for $15 is 50% ROI (before fees). Always factor in grading costs, shipping, and platform fees.', category: 'investing', aka: ['Return on Investment'], toolLink: { href: '/tools/investment-return', label: 'Investment Return Calculator' } },
  { term: 'EV', definition: 'Expected Value — the statistical average return from a product or break. A $200 box with $150 average pulls has -$50 EV. Most sealed products have negative EV for the average buyer.', category: 'investing', aka: ['Expected Value'], toolLink: { href: '/tools/sealed-ev', label: 'Sealed EV Calculator' } },
  { term: 'Speculation', definition: 'Buying cards of unproven players hoping they become stars. High risk, high reward. Prospect cards, draft picks, and international players are common speculation targets.', category: 'investing' },
  { term: 'Blue Chip', definition: 'A card or player considered a safe, reliable investment — established HOF players, iconic rookies, or milestone cards. Comparable to blue chip stocks. Lower upside but lower risk.', category: 'investing', example: 'A PSA 10 Michael Jordan Fleer RC is a blue chip card.' },
  { term: 'DCA', definition: 'Dollar-Cost Averaging — buying a card in small increments over time rather than all at once. Reduces the risk of buying at a peak. Works for cards you want long-term.', category: 'investing', aka: ['Dollar-Cost Averaging'], toolLink: { href: '/tools/dca-calculator', label: 'DCA Calculator' } },
  { term: 'Rip or Hold', definition: 'The decision to open a sealed product (rip it) or keep it sealed as an investment (hold). Sealed products typically appreciate 3-7% annually, but ripping is more fun.', category: 'investing', toolLink: { href: '/tools/rip-or-hold', label: 'Rip or Hold Calculator' } },
  { term: 'Dead Cat Bounce', definition: 'A brief price recovery after a significant decline, followed by further drops. Named after a Wall Street term. Don\'t confuse a temporary bounce with a genuine recovery.', category: 'investing' },
  { term: 'HODL', definition: 'Hold On for Dear Life — slang for refusing to sell during price declines. Originally from a misspelling in online investing forums. Applied to card collecting: holding through market corrections.', category: 'investing' },
  { term: 'Sell the News', definition: 'Selling a card before or immediately after an anticipated event (draft, award). Prices often peak on anticipation and drop once the news is confirmed.', category: 'investing' },
  { term: 'Concentration Risk', definition: 'Having too much value in a single player, sport, or card type. If that player gets injured or suspended, you lose everything. The 20% rule: no single player over 20% of your portfolio.', category: 'investing', toolLink: { href: '/tools/stress-test', label: 'Portfolio Stress Test' } },
  { term: 'Sealed Wax', definition: 'Unopened card products — boxes, cases, packs. Sealed wax is an investment vehicle because contents are unknown and supply decreases as products are opened over time.', category: 'investing', toolLink: { href: '/vault/sealed-wax', label: 'Sealed Wax Vault' } },

  // BREAKS (15)
  { term: 'Group Break', definition: 'A breaker buys sealed product and participants buy spots or teams. Cards are distributed based on the team/slot purchased. Filmed live on YouTube, Twitch, or Whatnot.', category: 'breaks', toolLink: { href: '/tools/break-spot', label: 'Break Spot Picker' } },
  { term: 'Breaker', definition: 'A person or company that hosts group breaks. Popular breakers include Layton Sports Cards, Mojobreak, and CardSmith Breaks. Breakers earn profit from selling spots above product cost.', category: 'breaks' },
  { term: 'Random Team', definition: 'A break format where teams are randomly assigned to participants. You pay a flat fee and get randomly allocated a team. Cheapest way to enter a break but no team choice.', category: 'breaks' },
  { term: 'Pick Your Team (PYT)', definition: 'A break format where participants choose which team they want. Popular teams (Yankees, Lakers, Chiefs) cost more. You get all cards of your chosen team from the break.', category: 'breaks', aka: ['PYT'] },
  { term: 'Hit Draft', definition: 'A break format where participants draft hits (autos, relics, numbered cards) in order based on their purchase position. Ensures fair distribution of premium cards.', category: 'breaks' },
  { term: 'Case Break', definition: 'A break of an entire case of product (typically 12-20 boxes). Cases offer better value per box and higher hit rates. Case breaks are premium and cost more to enter.', category: 'breaks' },
  { term: 'Hobby Box', definition: 'A sealed box purchased through card shops or distributors, containing guaranteed hits (autos, relics, parallels). Hobby boxes have better odds than retail. Typically $100-500+.', category: 'breaks' },
  { term: 'Retail Box', definition: 'A sealed box sold at retail stores (Target, Walmart). Lower price point but fewer guaranteed hits and worse odds than hobby. Includes blasters ($20-40), megas ($50-80), and hangers ($10-15).', category: 'breaks' },
  { term: 'Blaster Box', definition: 'A retail box typically containing 6-8 packs, sold at big-box retailers for $20-40. May include exclusive parallels not found in hobby boxes. Popular with casual collectors.', category: 'breaks' },
  { term: 'ETB', definition: 'Elite Trainer Box — a Pokemon TCG product containing 9 booster packs, energy cards, dice, and sleeves. The most popular Pokemon product for collectors and players. $40-50 retail.', category: 'breaks', aka: ['Elite Trainer Box'] },
  { term: 'Hot Box', definition: 'A box that contains a significantly above-average hit — an unexpected auto, a high-end parallel, or an error card. "Hot boxes" are random and can appear in any sealed product.', category: 'breaks' },
  { term: 'Personal Break', definition: 'When a breaker opens product exclusively for one person. You get every card from every pack. More expensive than group breaks but you get everything.', category: 'breaks' },
  { term: 'Spot Price', definition: 'The cost to buy into a specific break. Spot prices vary by team popularity, product, and breaker. Premium teams can cost 3-5x the average spot price.', category: 'breaks' },
  { term: 'Break Even', definition: 'The point at which the value of cards pulled equals the cost of the break spot. Most break participants do not break even. The entertainment value is part of the price.', category: 'breaks', toolLink: { href: '/tools/break-even', label: 'Break Even Calculator' } },
  { term: 'Whatnot', definition: 'A live-streaming marketplace app popular for card breaks and auctions. Sellers go live, show product, and buyers purchase in real-time. Has largely replaced YouTube for live breaks.', category: 'breaks' },
];

/* ── component ───────────────────────────────────────────────────── */

export default function EncyclopediaClient() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let result = TERMS;
    if (category !== 'all') result = result.filter(t => t.category === category);
    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.aka && t.aka.some(a => a.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [search, category]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TERMS.length };
    TERMS.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const toggle = (term: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term); else next.add(term);
      return next;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card Collecting Encyclopedia</h1>
        <p className="text-gray-400 text-lg">
          {TERMS.length} terms across {CATEGORIES.length - 1} categories. Everything you need to know about collecting.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search terms, definitions, or abbreviations..."
          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none text-lg"
        />
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              category === c.value
                ? 'border-emerald-500 bg-emerald-950/40 text-white'
                : 'border-gray-700 bg-gray-900/40 text-gray-400 hover:border-gray-500'
            }`}
          >
            <span className="mr-1">{c.icon}</span>
            {c.label}
            <span className="ml-1 text-gray-500 text-xs">({categoryCounts[c.value] || 0})</span>
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filtered.length} of {TERMS.length} terms
        {search && ` matching "${search}"`}
        {category !== 'all' && ` in ${CATEGORIES.find(c => c.value === category)?.label}`}
      </div>

      {/* Terms List */}
      <div className="space-y-2">
        {filtered.map(t => {
          const isOpen = expanded.has(t.term);
          return (
            <div
              key={t.term}
              className={`border rounded-xl transition-colors ${CAT_COLORS[t.category]} ${isOpen ? 'ring-1 ring-gray-600' : ''}`}
            >
              <button
                onClick={() => toggle(t.term)}
                className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="text-white font-bold text-base">{t.term}</h3>
                  {t.aka && t.aka.length > 0 && (
                    <span className="text-gray-500 text-xs hidden sm:inline">
                      ({t.aka.join(', ')})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${CAT_BADGE[t.category]}`}>
                    {t.category}
                  </span>
                  <span className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    &#9662;
                  </span>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-800/50 pt-3">
                  <p className="text-gray-300 text-sm leading-relaxed mb-2">{t.definition}</p>
                  {t.example && (
                    <p className="text-gray-500 text-sm italic mb-2">Example: {t.example}</p>
                  )}
                  {t.toolLink && (
                    <Link
                      href={t.toolLink.href}
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                    >
                      Try: {t.toolLink.label} &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-white font-bold text-lg mb-1">No terms found</h3>
          <p className="text-gray-500 text-sm">Try a different search or category filter.</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Encyclopedia Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-white">{TERMS.length}</div>
            <div className="text-gray-500 text-xs">Total Terms</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{CATEGORIES.length - 1}</div>
            <div className="text-gray-500 text-xs">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{TERMS.filter(t => t.toolLink).length}</div>
            <div className="text-gray-500 text-xs">Linked Tools</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{TERMS.filter(t => t.example).length}</div>
            <div className="text-gray-500 text-xs">With Examples</div>
          </div>
        </div>
      </div>
    </div>
  );
}
