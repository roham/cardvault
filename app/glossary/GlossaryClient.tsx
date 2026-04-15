'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  related?: string[];
  seeAlso?: { label: string; href: string }[];
}

const categories = [
  { id: 'all', label: 'All Terms', color: 'bg-gray-700' },
  { id: 'grading', label: 'Grading', color: 'bg-blue-600' },
  { id: 'card-types', label: 'Card Types', color: 'bg-purple-600' },
  { id: 'market', label: 'Market & Business', color: 'bg-green-600' },
  { id: 'collecting', label: 'Collecting', color: 'bg-amber-600' },
  { id: 'condition', label: 'Condition', color: 'bg-red-600' },
  { id: 'sealed', label: 'Sealed Products', color: 'bg-pink-600' },
  { id: 'sports', label: 'Sports-Specific', color: 'bg-cyan-600' },
];

const glossaryTerms: GlossaryTerm[] = [
  // GRADING
  { term: 'PSA', definition: 'Professional Sports Authenticator — the largest and most recognized third-party card grading company. Founded in 1991. Cards are graded on a 1-10 scale, with PSA 10 being the highest grade (Gem Mint). PSA-graded cards typically command the highest premiums in the market.', category: 'grading', related: ['BGS', 'CGC', 'SGC', 'Gem Mint'], seeAlso: [{ label: 'Grading ROI Calculator', href: '/tools/grading-roi' }] },
  { term: 'BGS', definition: 'Beckett Grading Services — a major card grading company known for its subgrade system. BGS grades cards on a 1-10 scale with half-point increments and provides four subgrades: centering, corners, edges, and surface. A BGS 9.5 "Gem Mint" is their most common high grade, while a BGS 10 "Pristine" or "Black Label" (all four subgrades 10) is exceptionally rare.', category: 'grading', related: ['PSA', 'Subgrades', 'Black Label'] },
  { term: 'CGC', definition: 'Certified Guaranty Company — a grading company that expanded from comics to trading cards. Known for competitive pricing and faster turnaround times. Uses a 1-10 scale with half-point and quarter-point increments. CGC grades are generally accepted by the market but typically sell for slightly less than equivalent PSA grades.', category: 'grading', related: ['PSA', 'BGS', 'SGC'] },
  { term: 'SGC', definition: 'Sportscard Guaranty Corporation — specializes in vintage and pre-war card grading. Known for their tuxedo-style black holders ("tux holders"). Considered by many collectors to be the gold standard for vintage card authentication and grading. More affordable than PSA for most service levels.', category: 'grading', related: ['PSA', 'Vintage', 'Pre-War'] },
  { term: 'Gem Mint', definition: 'The highest practical grade a card can receive. At PSA, this is a 10. At BGS, a 9.5 is called "Gem Mint" while a 10 is "Pristine." A Gem Mint card has virtually perfect centering, sharp corners, clean edges, and a flawless surface. Gem Mint cards typically sell for 2-10x more than a grade 9.', category: 'grading', related: ['PSA 10', 'BGS 9.5', 'Pristine'] },
  { term: 'Subgrades', definition: 'Individual component grades given by BGS (and some other graders) that make up the overall grade. The four subgrades are centering, corners, edges, and surface. Each is graded 1-10. The overall grade is a weighted calculation of these four scores. Subgrades help collectors understand exactly why a card received its grade.', category: 'grading', related: ['BGS', 'Centering', 'Corners'] },
  { term: 'Black Label', definition: 'A BGS 10 with all four subgrades also being 10 — the rarest and most valuable grade possible from Beckett. The label is printed in black instead of gold. Black Label cards can sell for 5-20x more than a standard BGS 9.5. Extremely difficult to achieve; less than 1% of submitted cards earn this grade.', category: 'grading', related: ['BGS', 'Pristine', 'Gem Mint'] },
  { term: 'Raw', definition: 'An ungraded card that has not been submitted to any third-party grading company. Raw cards are sold without a protective slab or authentication. Most cards in the market are raw. Raw cards sell for significantly less than their graded equivalents, especially in high grades.', category: 'grading', related: ['Slab', 'Grading'] },
  { term: 'Slab', definition: 'The protective hard plastic case that a grading company seals a card into after grading. Also called a "holder." Each company has a distinctive slab design. The slab provides tamper-evident protection, displays the grade, and includes a certification number for verification. "Slab" is also used as a verb: "I\'m going to slab this card."', category: 'grading', related: ['Raw', 'PSA', 'BGS'] },
  { term: 'Population Report', definition: 'A database maintained by grading companies showing how many copies of each card they have graded and at what grades. Abbreviated "pop report." Low population numbers (especially at high grades) increase a card\'s value. PSA\'s pop report is the most widely referenced. Available at psacard.com.', category: 'grading', related: ['PSA', 'Gem Rate'], seeAlso: [{ label: 'Pop Report Checker', href: '/tools/pop-report' }] },
  { term: 'Gem Rate', definition: 'The percentage of submitted cards that receive a Gem Mint grade (PSA 10 or BGS 9.5+). Varies widely by set and era. Modern cards may have gem rates of 50-70%, while vintage cards might be under 1%. A low gem rate increases the premium for high-grade copies.', category: 'grading', related: ['Population Report', 'Gem Mint'] },
  { term: 'Crossover', definition: 'The process of re-submitting a card already graded by one company to a different grading company. Common example: submitting a BGS 9.5 to PSA hoping for a PSA 10 (which typically commands a higher price). Crossover attempts have a failure rate — the card may get the same or lower grade.', category: 'grading', related: ['PSA', 'BGS', 'Crack and Resubmit'] },
  { term: 'Crack and Resubmit', definition: 'Breaking a card out of its current grading slab to resubmit it to the same (or different) grading company, hoping for a higher grade. Risky — the card could receive a lower grade the second time. Often done when a collector believes the original grade was too harsh.', category: 'grading', related: ['Crossover', 'Slab'] },

  // CARD TYPES
  { term: 'Rookie Card (RC)', definition: 'A player\'s first officially licensed trading card, typically released during their first professional season. Marked with an "RC" logo on modern cards. Rookie cards are almost always the most valuable and sought-after cards for any player. The definition has evolved — pre-2006 cards use different criteria (first card in a major set).', category: 'card-types', related: ['1st Bowman', 'Prospect'] },
  { term: 'Refractor', definition: 'A special parallel version of a card with a rainbow-like, holographic finish that "refracts" light. First introduced by Topps Chrome in 1996. Refractors are more scarce than base cards and come in many sub-variants: Gold (/50), Orange (/25), Red (/5), Superfractor (1/1). One of the most popular parallel types in the hobby.', category: 'card-types', related: ['Parallel', 'Prizm', 'Chrome'] },
  { term: 'Prizm', definition: 'Panini\'s signature parallel technology, equivalent to Topps\'s refractor. The standard Silver Prizm has a distinctive cracked-ice holographic pattern. Panini Prizm (the product) is one of the most popular basketball and football card sets. Color Prizms (/numbered parallels) are highly sought after.', category: 'card-types', related: ['Refractor', 'Parallel', 'Silver'] },
  { term: 'Auto / Autograph', definition: 'A card that includes an authentic, hand-signed autograph from the player. Can be on-card (signed directly on the card) or sticker auto (signed on a sticker applied to the card). On-card autos are generally more valuable. Autograph cards are among the most desirable "hits" in packs.', category: 'card-types', related: ['Hit', 'On-Card Auto', 'Sticker Auto'] },
  { term: 'Relic / Memorabilia', definition: 'A card containing a piece of game-used or player-worn material — typically a jersey swatch, but can include bat pieces, glove leather, shoe material, or even stadium seats. "Game-used" means the item was actually used in a professional game, while "player-worn" was worn during a photo shoot or event.', category: 'card-types', related: ['Patch', 'Hit', 'Game-Used'] },
  { term: 'Patch', definition: 'A type of relic card featuring a piece of a jersey patch (nameplate, logo, number, team patch) rather than a plain jersey swatch. Patch cards are more valuable than standard relics because they show distinctive, multicolored design elements. A "sick patch" with team logo or letter can command 5-10x the price of a plain swatch.', category: 'card-types', related: ['Relic', 'Game-Used'] },
  { term: 'Parallel', definition: 'An alternate version of a base card, usually distinguished by different coloring, numbering, or finish. Most modern sets include multiple parallel tiers. Example: a base card might have Silver, Gold (/10), Red (/5), and Superfractor (1/1) parallels. Lower-numbered parallels are more scarce and valuable.', category: 'card-types', related: ['Refractor', 'Prizm', 'Numbered'] },
  { term: 'Numbered (/XX)', definition: 'A card that is serial-numbered, meaning each copy has a unique number stamped on it (e.g., 47/99 means it\'s card 47 out of 99 total copies). Lower total print runs (/25, /10, /5, /1) are more valuable. Written as "/99" or "out of 99." Being the first (1/99) or last (99/99) in a run can add a small premium.', category: 'card-types', related: ['Parallel', 'Short Print', '1/1'] },
  { term: '1/1 (One of One)', definition: 'A card where only a single copy exists in the entire world. The holy grail of modern cards. Examples include Superfractors (Topps), Gold Vinyl (Panini), and printing plates. 1/1 cards can sell for 10-100x the price of low-numbered parallels. The ultimate chase card for any player.', category: 'card-types', related: ['Superfractor', 'Numbered', 'Printing Plate'] },
  { term: 'Short Print (SP)', definition: 'A card produced in smaller quantities than the regular base cards in a set. Often harder to pull from packs and more valuable. Can be identified by different card numbers, photo variations, or codes on the back. "SSP" means Super Short Print (even more rare).', category: 'card-types', related: ['Variation', 'Base'] },
  { term: 'Insert', definition: 'A special card inserted into packs at lower odds than base cards. Inserts typically have unique designs, themes, or card stock separate from the base set. Examples: die-cuts, award winners subsets, rookie spotlights. Not as rare as autos or relics but more collectible than base cards.', category: 'card-types', related: ['Hit', 'Base', 'Chase'] },
  { term: 'Base Card', definition: 'The standard, most common version of a card in a set. Base cards make up the majority of cards in any product. While most base cards have minimal value (often under $1), rookie base cards of superstar players can be quite valuable. Base cards are the foundation that parallels, inserts, and hits build upon.', category: 'card-types', related: ['Parallel', 'Insert', 'Common'] },
  { term: 'Chrome', definition: 'A card printed on chromium-technology card stock that gives a shiny, reflective finish. Topps Chrome is the most well-known chromium product. Chrome cards are more durable than paper cards and are the primary platform for refractor parallels. Chrome rookies are generally more valuable than their paper equivalents.', category: 'card-types', related: ['Refractor', 'Paper', 'Topps'] },
  { term: '1st Bowman', definition: 'A player\'s first card in any Bowman product, often released while the player is still in the minor leagues or college. Marked with a "1st" logo. Not an official rookie card, but for many baseball players, the 1st Bowman Chrome auto is the most valuable card. The speculative nature of prospects makes 1st Bowmans high-risk, high-reward.', category: 'card-types', related: ['Rookie Card', 'Prospect', 'Bowman'] },
  { term: 'Variation', definition: 'An alternate version of a card with a different photo, design element, or error compared to the standard version. Can be intentional (SSP photo variations) or unintentional (error cards). Some variations are extremely rare and valuable — the "image variation" SSPs in Topps Series 1 are heavily chased.', category: 'card-types', related: ['Short Print', 'Error Card'] },
  { term: 'Printing Plate', definition: 'The actual metal plate used to print cards, inserted into packs as a 1/1 collectible. Each card has four printing plates (cyan, magenta, yellow, black — CMYK). While technically 1/1s, printing plates typically sell for less than other 1/1 parallels because they\'re thin metal and not visually appealing to all collectors.', category: 'card-types', related: ['1/1', 'Numbered'] },

  // MARKET & BUSINESS
  { term: 'Comp / Comparable', definition: 'A recent sale of the same or similar card used to determine fair market value. "What are the comps?" means "what has this card actually sold for recently?" eBay sold listings are the primary source for comps. The most reliable pricing data comes from multiple recent comps, not a single outlier sale.', category: 'market', related: ['FMV', 'Last Sold'], seeAlso: [{ label: 'Price Guide', href: '/price-guide' }] },
  { term: 'FMV (Fair Market Value)', definition: 'The price a card would sell for in an open market between a willing buyer and seller. Determined by recent comparable sales (comps). FMV can change quickly based on player performance, market trends, or major events. Multiple pricing sources (eBay sold, auction houses, dealer prices) help establish FMV.', category: 'market', related: ['Comp', 'Book Value'] },
  { term: 'Flip', definition: 'Buying a card at a lower price and quickly reselling it for profit. "Flippers" buy undervalued cards, chase short-term price spikes (like a player having a big game), or buy new releases to sell before prices drop. The flip market is most active around draft picks, breakout performances, and new product releases.', category: 'market', related: ['ROI', 'Invest'], seeAlso: [{ label: 'Flip Calculator', href: '/tools/flip-calc' }] },
  { term: 'ROI (Return on Investment)', definition: 'The percentage profit or loss on a card investment, calculated as (sale price - all costs) / total costs × 100. "All costs" includes purchase price, grading fees, shipping both ways, eBay/platform fees (typically 13-15%), and any other expenses. A card doubling in raw value might only yield 30-40% ROI after all fees.', category: 'market', related: ['Flip', 'Grading ROI'], seeAlso: [{ label: 'Grading ROI Calculator', href: '/tools/grading-roi' }] },
  { term: 'Book Value', definition: 'The price listed in an official price guide (historically Beckett). Once the standard for card pricing, book value has been largely replaced by real-time market data from eBay sold listings and auction results. Book value is now considered a rough guide rather than an accurate reflection of actual market prices.', category: 'market', related: ['FMV', 'Comp'] },
  { term: 'Wax', definition: 'Slang for sealed, unopened card product (boxes, packs, cases). Originates from the wax paper wrappers used on vintage packs. "Ripping wax" means opening packs. Sealed wax can be a good investment as prices tend to increase once a product goes out of print and key rookies in the set perform well.', category: 'market', related: ['Sealed', 'Rip', 'Case'] },
  { term: 'Case Hit', definition: 'A card so rare that on average only one appears per sealed case (typically 12-20 boxes). Case hits are among the most valuable pulls and can include 1/1s, premium autographs, or special parallels. Products often advertise case hits as a selling point.', category: 'market', related: ['Hit', 'Box', 'Odds'] },
  { term: 'Dutch Auction', definition: 'A selling format where the price starts high and decreases over time until a buyer accepts. Used on some platforms as an alternative to traditional auctions. In the card market, the term is also loosely used when a seller gradually reduces their asking price on a fixed-price listing.', category: 'market', related: ['Auction', 'BIN'] },
  { term: 'BIN (Buy It Now)', definition: 'A fixed-price listing on eBay or similar platforms where the buyer can purchase immediately at the listed price, without waiting for an auction to end. Collectors often search "BIN" when looking for immediate purchases. BIN prices are typically higher than auction final prices.', category: 'market', related: ['Auction', 'Comp'] },
  { term: 'Pump and Dump', definition: 'An unethical practice where someone artificially inflates a card\'s price (through shill bidding, social media hype, or coordinated buying) and then sells their inventory at the inflated price before the market corrects. Common around draft picks and viral moments. Always verify with real comps before buying during hype spikes.', category: 'market', related: ['Shill', 'FMV'] },
  { term: 'Shill Bidding', definition: 'The illegal practice of placing fake bids on your own auction (or having accomplices bid) to drive up the price. Violates eBay terms of service and can result in account suspension. Signs: low-feedback bidders, consistent bidding patterns, bids just above the current price with no intent to win.', category: 'market', related: ['Pump and Dump', 'Auction'] },
  { term: 'Grail', definition: 'A collector\'s most desired card — their "holy grail." Can be any card that holds personal significance or is the centerpiece of a collection. Examples: a PSA 10 rookie of your favorite player, a vintage card you\'ve wanted since childhood, or a 1/1 auto. Every collector has a different grail.', category: 'market', related: ['PC', 'Chase'] },

  // COLLECTING
  { term: 'PC (Personal Collection)', definition: 'Cards you collect for personal enjoyment rather than investment or resale. "That\'s a PC card" means you\'re keeping it regardless of value. Most collectors have a PC focused on their favorite players, teams, or themes. The PC is sacred — you don\'t sell PC cards.', category: 'collecting', related: ['Grail', 'Hold'] },
  { term: 'Set Completion', definition: 'The goal of collecting every card in a particular set. "Set builders" or "completionists" track their progress toward owning every base card, often branching into parallels and inserts. Modern sets can have 300-500+ base cards. Completing a set gives a satisfying sense of achievement.', category: 'collecting', related: ['Master Set', 'Checklist'], seeAlso: [{ label: 'Set Completion Tracker', href: '/tools/set-completion' }] },
  { term: 'Master Set', definition: 'A complete collection of EVERY card in a product — all base cards, all parallels, all inserts, all autographs, all relics. Extremely difficult and expensive to complete for modern products. Some master sets are valued at $10,000-$100,000+. The ultimate achievement for set builders.', category: 'collecting', related: ['Set Completion', 'Rainbow'] },
  { term: 'Rainbow', definition: 'Collecting every parallel variation of a single card. If a base card has 8 different parallels (base, silver, gold, red, blue, green, orange, 1/1), completing the rainbow means owning all 8. Popular for PC players. Rainbows of star rookies can cost thousands.', category: 'collecting', related: ['Parallel', 'PC', 'Master Set'] },
  { term: 'Hit', definition: 'An autograph, relic/memorabilia card, or other premium insert pulled from a pack. The exciting cards that make pack ripping worthwhile. Products are typically described by their "hit" count per box (e.g., "2 autos per box"). Hits are what drive the sealed product market.', category: 'collecting', related: ['Auto', 'Relic', 'Case Hit'] },
  { term: 'Dime Card / Dollar Card', definition: 'A common card with very low value — typically base cards of non-star players. "Dime boxes" at card shows are bins where every card is $0.10. These cards make up 90%+ of all cards printed. While individually worthless, they\'re important for set builders and fun for casual collectors.', category: 'collecting', related: ['Base Card', 'Common'] },
  { term: 'Penny Sleeve', definition: 'A thin, clear plastic sleeve used as the first layer of protection for a card. Costs about a penny each (hence the name). Cards should always be placed in a penny sleeve before going into a top loader or one-touch. The most basic but essential supply in card collecting.', category: 'collecting', related: ['Top Loader', 'One-Touch'] },
  { term: 'Top Loader', definition: 'A rigid clear plastic holder used to protect individual cards. Standard size is 3x4 inches. Cards are inserted (in a penny sleeve first) from the top opening. Essential for shipping, display, and short-term storage. Available in various thicknesses for different card types (standard, thick patch cards, etc.).', category: 'collecting', related: ['Penny Sleeve', 'One-Touch', 'Magnetic'] },
  { term: 'One-Touch', definition: 'A premium magnetic card holder that snaps shut around a card. More expensive than top loaders ($2-5 each) but provides better display and protection. Popular for high-value cards. Available in multiple thicknesses (35pt, 55pt, 75pt, 130pt, 180pt) — match the thickness to your card.', category: 'collecting', related: ['Top Loader', 'Penny Sleeve'] },
  { term: 'Binder', definition: 'A three-ring binder with 9-pocket pages used for organizing and storing card collections. The classic way to collect and display cards. Best for base sets, commons, and mid-value cards. Ultra Pro is the most popular binder page brand. Side-loading pages prevent cards from falling out.', category: 'collecting', related: ['Set Completion', 'Page'], seeAlso: [{ label: 'Visual Binder', href: '/binder' }] },
  { term: 'Card Show', definition: 'An event where dealers, collectors, and grading companies gather to buy, sell, trade, and grade cards. Shows range from small local events (20-30 tables) to massive national conventions like The National (800+ dealers). The best place to find deals, see cards in person, and meet other collectors.', category: 'collecting', related: ['Dealer', 'The National'], seeAlso: [{ label: 'Card Show Finder', href: '/tools/show-finder' }] },
  { term: 'The National', definition: 'The National Sports Collectors Convention — the largest and most prestigious card show in the world. Held annually in a different US city (usually late July/early August). Features 800+ dealer tables, exclusive card releases, celebrity signings, grading company booths, and 50,000+ attendees. The Super Bowl of card collecting.', category: 'collecting', related: ['Card Show'] },
  { term: 'LCS (Local Card Shop)', definition: 'A brick-and-mortar card shop in your area. LCS owners are often knowledgeable collectors themselves and can be valuable resources for pricing advice, finding specific cards, and connecting with the local collecting community. Supporting your LCS helps keep the hobby alive. Also called "your local."', category: 'collecting', related: ['Card Show', 'Dealer'] },

  // CONDITION
  { term: 'Centering', definition: 'How evenly the card image is positioned within the card borders. Perfect centering (50/50 left-right AND top-bottom) is required for the highest grades. Measured as a ratio: 60/40 is slightly off-center, 70/30 is noticeably off. PSA 10 requires 55/45 or better on front, 75/25 or better on back. The most common reason cards miss PSA 10.', category: 'condition', related: ['Subgrades', 'PSA 10'] },
  { term: 'Surface', definition: 'The condition of the card\'s face — scratches, print lines, dots, dimples, or other imperfections. Surface issues are most visible on chrome/foil cards. Even factory-fresh cards can have surface issues from the printing process. Use a bright light or jeweler\'s loupe to check surface quality before submitting for grading.', category: 'condition', related: ['Subgrades', 'Print Line'] },
  { term: 'Corners', definition: 'The sharpness and condition of a card\'s four corners. Sharp corners are essential for high grades. Corner wear shows as softening, fraying, or "dings." Vintage cards commonly have corner issues from decades of handling. Modern cards fresh from packs usually have sharp corners unless damaged during the packaging process.', category: 'condition', related: ['Subgrades', 'Ding'] },
  { term: 'Edges', definition: 'The condition of the card\'s four edges. Chipping (small pieces missing), roughness, or color showing through are edge defects. Edge wear is common on vintage cards. Chrome cards can show edge chipping more easily due to the metallic coating. Check edges under magnification for accurate assessment.', category: 'condition', related: ['Subgrades', 'Chipping'] },
  { term: 'Print Line', definition: 'A visible line or streak on a card\'s surface caused by the printing process, not by handling. Common on chrome and refractor cards. Print lines are a manufacturing defect, not damage, but they still reduce a card\'s grade and value. Often described as "roller lines" in vintage cards.', category: 'condition', related: ['Surface', 'Factory Defect'] },
  { term: 'Off-Center (OC)', definition: 'A card where the image is noticeably shifted to one side. Graded on a percentage basis: 60/40, 70/30, 80/20, 90/10. Severely off-center cards are called "miscuts." PSA historically used an OC qualifier for vintage cards that are off-center but otherwise high-grade. Off-centering is the single biggest grade killer.', category: 'condition', related: ['Centering', 'Miscut'] },
  { term: 'Whitening', definition: 'White spots or areas visible on a card\'s edges or corners where the coating has worn away, revealing the white card stock underneath. A sign of wear. On dark-bordered cards, whitening is extremely visible and significantly reduces grade and value. Check card edges carefully under good lighting.', category: 'condition', related: ['Corners', 'Edges', 'Wear'] },

  // SEALED PRODUCTS
  { term: 'Hobby Box', definition: 'A sealed box of card packs sold through hobby shops and online card retailers. Hobby boxes typically contain guaranteed hits (autographs, relics, numbered parallels) and more packs per box than retail. More expensive than retail but with better odds. The primary product for serious collectors.', category: 'sealed', related: ['Retail', 'Blaster', 'Case'], seeAlso: [{ label: 'Pack Store', href: '/packs' }] },
  { term: 'Retail', definition: 'Card products sold through mass retailers like Target, Walmart, and Amazon. Includes blasters, hangers, and cellos. Retail products have lower price points but also lower odds of premium hits compared to hobby. Retail is where most new collectors enter the hobby. Retail has been harder to find since the 2020 boom.', category: 'sealed', related: ['Hobby Box', 'Blaster'] },
  { term: 'Blaster', definition: 'A small retail box containing 6-8 packs, typically priced at $20-40. Sold at mass retailers. Some products include a blaster-exclusive parallel or bonus pack. The most accessible sealed product for casual collectors. Named for the "blaster" packaging style. Popular for content creation and casual ripping.', category: 'sealed', related: ['Retail', 'Hobby Box', 'Hanger'] },
  { term: 'Hanger', definition: 'A retail card package containing 2-4 packs in a hang-tag style package, typically $10-15. Often found at checkout areas of mass retailers. Smaller than blasters but more accessible for impulse buys. Some products include hanger-exclusive parallels.', category: 'sealed', related: ['Blaster', 'Retail', 'Cello'] },
  { term: 'Break', definition: 'A group box opening where multiple buyers share the cost of sealed product and divide the cards. Types include: random team (teams drawn randomly), pick your team (choose which team\'s cards you get), hit draft (draft hits in order), and personal break (someone opens for you on camera). Breaks happen live on YouTube, eBay, and dedicated platforms.', category: 'sealed', related: ['Hobby Box', 'Case Break'], seeAlso: [{ label: 'Break Room', href: '/break-room' }] },
  { term: 'Case', definition: 'A sealed shipping container of hobby boxes, typically containing 12-20 boxes depending on the product. Buying by the case offers a volume discount and guarantees a certain distribution of hits. "Case hits" are cards so rare that on average only one appears per case.', category: 'sealed', related: ['Hobby Box', 'Case Hit'] },
  { term: 'EV (Expected Value)', definition: 'The mathematical average value of all cards you\'d pull from a sealed product over many openings. If a hobby box costs $200 and the average total card value from opening it is $150, the EV is $150 (negative EV of -$50). Most sealed products have negative EV — the house always wins. But a single lucky pull can far exceed EV.', category: 'sealed', related: ['Hobby Box', 'Hit', 'ROI'], seeAlso: [{ label: 'Sealed EV Calculator', href: '/tools/sealed-ev' }] },

  // SPORTS-SPECIFIC
  { term: 'Prospect', definition: 'A pre-professional player whose cards are issued before they debut in the major leagues/NBA/NFL/NHL. Bowman baseball prospects are the most established market. Prospect cards are speculative — many prospects never make it to the pros. High risk, high reward if the player becomes a star.', category: 'sports', related: ['1st Bowman', 'Rookie Card'] },
  { term: 'Bowman', definition: 'A Topps brand focused on prospect and rookie cards, primarily in baseball. Bowman Chrome 1st autos are the most sought-after prospect cards. The annual Bowman release (May) is one of the biggest events in baseball card collecting. Also produces Bowman Draft and Bowman University for other sports.', category: 'sports', related: ['1st Bowman', 'Prospect', 'Chrome'] },
  { term: 'Topps', definition: 'The most iconic and longest-running card brand. Holds the exclusive MLB license since 2025 and the FIFA license. Known for Topps Series 1, Topps Chrome, Bowman, and Stadium Club. Founded in 1938. Owned by Fanatics since 2022. Topps flagship is the most collected baseball card product annually.', category: 'sports', related: ['Bowman', 'Chrome', 'Flagship'] },
  { term: 'Panini', definition: 'A major card manufacturer known for basketball (Prizm, National Treasures, Flawless) and football (Prizm, Contenders, Playbook) products. Lost NFL and NBA licenses to Fanatics starting 2025-2026. Panini\'s Prizm brand is one of the most popular in the hobby. Based in Italy with US headquarters in Texas.', category: 'sports', related: ['Prizm', 'National Treasures'] },
  { term: 'Upper Deck', definition: 'Card manufacturer known for premium products and the exclusive NHL license. Signature products include SP Authentic, The Cup, and Young Guns rookies. Upper Deck\'s 1989 debut with Ken Griffey Jr. revolutionized the hobby with holographic anti-counterfeit technology. Also produces entertainment and gaming cards.', category: 'sports', related: ['Young Guns', 'The Cup'] },
  { term: 'Young Guns', definition: 'Upper Deck\'s rookie card subset in their flagship hockey product. Young Guns cards are short-printed (1:4 packs) and are the definitive rookie cards in hockey collecting. A Connor McDavid Young Guns raw is worth $200+; PSA 10 is $1,500+. The most recognized rookie branding in hockey.', category: 'sports', related: ['Upper Deck', 'Rookie Card'] },
  { term: 'National Treasures', definition: 'Panini\'s ultra-premium product featuring large patch autographs and very low print runs. Hobby boxes cost $800-2,000+. The Rookie Patch Auto (RPA) is the most sought-after card in football and basketball — a numbered auto with a premium jersey patch. The standard by which all premium products are measured.', category: 'sports', related: ['Panini', 'RPA', 'Patch'] },
  { term: 'RPA (Rookie Patch Auto)', definition: 'A rookie autograph card that also contains a jersey patch. The most valuable modern card type in basketball and football collecting. National Treasures RPAs are the gold standard. Lower-numbered RPAs of star rookies can sell for $10,000-$100,000+. The ultimate chase card in premium products.', category: 'sports', related: ['National Treasures', 'Patch', 'Auto'] },
  { term: 'Vintage', definition: 'Cards produced before 1980 (some say 1975 or 1970). Vintage cards include iconic sets like 1952 Topps, 1986-87 Fleer Basketball, and pre-war tobacco cards. The vintage market is driven by condition, rarity, and historical significance. Vintage cards tend to be more stable investments than modern cards.', category: 'sports', related: ['Pre-War', 'Junk Wax'] },
  { term: 'Junk Wax Era', definition: 'The period from roughly 1987-1994 when card companies massively overproduced. Billions of cards were printed, making most cards from this era nearly worthless. Called "junk wax" because the sealed product is worth barely more than the packaging. Key exception: a few star rookies (Michael Jordan, Ken Griffey Jr.) still hold value.', category: 'sports', related: ['Vintage', 'Overproduction'] },
  { term: 'Pre-War', definition: 'Cards produced before World War II (pre-1945). Includes tobacco cards (T206, T205), candy cards, and other non-traditional card types. Pre-war cards are highly collectible due to their age, rarity, and historical significance. The T206 Honus Wagner is the most famous pre-war card, valued at millions.', category: 'sports', related: ['Vintage', 'T206'] },
  { term: 'Flagship', definition: 'A brand\'s primary, annual release. Topps Series 1 is Topps\' flagship baseball product, released every February. Flagships are typically the most collected set each year, have the most recognized rookie cards, and are the most affordable hobby entry point. "Flagship rookie" refers to the main rookie card from that year\'s primary product.', category: 'sports', related: ['Topps', 'Series 1'] },

  // MORE COLLECTING TERMS
  { term: 'Chase', definition: 'The act of trying to pull a specific card from packs. "I\'m chasing the Wemby auto" means buying packs hoping to pull that particular card. Also used as a noun: "What\'s the chase in this product?" meaning the most desirable card to pull.', category: 'collecting', related: ['Hit', 'Rip'] },
  { term: 'Rip', definition: 'Opening card packs. "Let\'s rip some wax" means "let\'s open some packs." One of the most enjoyable activities in the hobby — the anticipation of what might be inside. Content creators film themselves ripping packs for YouTube/TikTok. Also called "busting" or "breaking."', category: 'collecting', related: ['Wax', 'Break', 'Hit'], seeAlso: [{ label: 'Pack Simulator', href: '/tools/pack-sim' }] },
  { term: 'Snipe', definition: 'Placing a bid in the final seconds of an eBay auction to win before other bidders can respond. Sniping tools automate this process. A common strategy because other bidders don\'t have time to counter-bid. "I sniped it for $45" means winning at the last second. Some consider this bad etiquette; others see it as smart strategy.', category: 'collecting', related: ['Auction', 'BIN'] },
  { term: 'Hold', definition: 'Keeping a card long-term rather than selling. "Hold or sell?" is the most common question in the hobby. Generally, hold cards of active players you believe will continue performing well. Sell during hype spikes if you\'re not emotionally attached. PC cards are always holds.', category: 'collecting', related: ['Flip', 'PC', 'Invest'] },
  { term: 'Fire Sale', definition: 'Selling cards quickly at below-market prices, often because the seller needs cash fast or is leaving the hobby. "Fire sale" listings represent buying opportunities for collectors who act quickly. Common after a player gets injured or traded to a less popular team.', category: 'collecting', related: ['Flip', 'FMV'] },
  { term: 'Penny Stock', definition: 'A very cheap card (under $5) of a player with potential to increase significantly in value. Like penny stocks in the stock market — cheap to buy, most stay cheap, but a few pay off big. First-year players, prospects, and undervalued veterans are common "penny stock" picks in the hobby.', category: 'collecting', related: ['Flip', 'Prospect', 'Invest'] },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GlossaryClient() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let terms = glossaryTerms;
    if (activeCategory !== 'all') {
      terms = terms.filter(t => t.category === activeCategory);
    }
    if (activeLetter) {
      terms = terms.filter(t => t.term[0].toUpperCase() === activeLetter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      terms = terms.filter(t =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
      );
    }
    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [search, activeCategory, activeLetter]);

  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const base = activeCategory !== 'all'
      ? glossaryTerms.filter(t => t.category === activeCategory)
      : glossaryTerms;
    for (const t of base) {
      const l = t.term[0].toUpperCase();
      counts[l] = (counts[l] || 0) + 1;
    }
    return counts;
  }, [activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of glossaryTerms) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    counts['all'] = glossaryTerms.length;
    return counts;
  }, []);

  const getCategoryBadge = (cat: string) => {
    const c = categories.find(c => c.id === cat);
    return c ? c : { label: cat, color: 'bg-gray-600' };
  };

  return (
    <div>
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{glossaryTerms.length}</p>
          <p className="text-xs text-gray-400">Total Terms</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{categories.length - 1}</p>
          <p className="text-xs text-gray-400">Categories</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{Object.keys(letterCounts).length}</p>
          <p className="text-xs text-gray-400">Letters Used</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-white">{filtered.length}</p>
          <p className="text-xs text-gray-400">Showing</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveLetter(null); }}
          placeholder="Search terms or definitions..."
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setActiveLetter(null); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? `${cat.color} text-white`
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {cat.label} ({categoryCounts[cat.id] || 0})
          </button>
        ))}
      </div>

      {/* Alphabet Nav */}
      <div className="flex flex-wrap gap-1 mb-6">
        <button
          onClick={() => setActiveLetter(null)}
          className={`w-8 h-8 rounded text-xs font-bold transition-all ${
            !activeLetter ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
            disabled={!letterCounts[letter]}
            className={`w-8 h-8 rounded text-xs font-bold transition-all ${
              activeLetter === letter
                ? 'bg-blue-600 text-white'
                : letterCounts[letter]
                  ? 'bg-gray-800 text-gray-400 hover:text-white'
                  : 'bg-gray-900 text-gray-700 cursor-not-allowed'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Terms */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No terms found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(term => {
            const badge = getCategoryBadge(term.category);
            return (
              <div key={term.term} id={term.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="bg-gray-800/50 rounded-lg p-4 sm:p-5 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">{term.term}</h3>
                  <span className={`${badge.color} text-white text-xs px-2 py-0.5 rounded-full`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{term.definition}</p>
                {term.related && term.related.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-xs text-gray-500">Related:</span>
                    {term.related.map(r => (
                      <span key={r} className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
                {term.seeAlso && term.seeAlso.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {term.seeAlso.map(link => (
                      <Link key={link.href} href={link.href} className="text-xs text-blue-400 hover:text-blue-300 underline">
                        {link.label} &rarr;
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-10 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-800/30">
        <h3 className="text-lg font-bold text-white mb-2">New to Card Collecting?</h3>
        <p className="text-gray-300 text-sm mb-4">
          Start with our beginner-friendly tools and guides to learn the hobby.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools/quiz" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            Take the Collector Quiz
          </Link>
          <Link href="/guides" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            Read Guides
          </Link>
          <Link href="/tools" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
            Explore Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
