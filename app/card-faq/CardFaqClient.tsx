'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  tools?: { label: string; href: string }[];
}

const CATEGORIES = ['All', 'Grading', 'Buying', 'Selling', 'Investing', 'Condition', 'Pokémon', 'Breaks', 'Collecting Basics'];

const CATEGORY_COLORS: Record<string, string> = {
  'Grading': 'bg-purple-950/40 border-purple-800/40 text-purple-400',
  'Buying': 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400',
  'Selling': 'bg-blue-950/40 border-blue-800/40 text-blue-400',
  'Investing': 'bg-amber-950/40 border-amber-800/40 text-amber-400',
  'Condition': 'bg-red-950/40 border-red-800/40 text-red-400',
  'Pokémon': 'bg-yellow-950/40 border-yellow-800/40 text-yellow-400',
  'Breaks': 'bg-cyan-950/40 border-cyan-800/40 text-cyan-400',
  'Collecting Basics': 'bg-zinc-800/60 border-zinc-700/40 text-zinc-400',
};

const FAQ_DATA: FaqItem[] = [
  // Grading
  { id: 1, category: 'Grading', question: 'Is it worth grading my card?', answer: 'It depends on the card\'s raw value and condition. A common rule is the "3x Rule" — grading is worth it if a graded copy sells for at least 3x the raw price plus grading cost. For a card worth $20 raw that costs $20 to grade, you need it to sell for $120+ graded to justify it. Use our Grading ROI Calculator to check specific cards.', tools: [{ label: 'Grading ROI Calculator', href: '/tools/grading-roi' }] },
  { id: 2, category: 'Grading', question: 'What is the difference between PSA, BGS, and CGC?', answer: 'PSA (Professional Sports Authenticator) is the most popular and liquid — PSA 10s generally sell for the highest premiums. BGS (Beckett Grading Services) uses 4 subgrades (centering, corners, edges, surface) and a BGS 10 "Pristine" is rarer and more valuable than a PSA 10. CGC is newer but growing fast, often cheaper and faster. SGC is respected for vintage cards. Each has strengths depending on your card era and selling goals.', tools: [{ label: 'Grading Company Guide', href: '/grading' }] },
  { id: 3, category: 'Grading', question: 'How long does PSA grading take?', answer: 'PSA turnaround varies by service tier: Economy is 150+ business days ($20/card), Regular is 65 days ($50), Express is 20 days ($100), Super Express is 10 days ($150), and Walk-Through is 2 days ($300). Bulk submissions of 20+ cards get a discount. Actual times fluctuate — PSA halted submissions in 2021 due to a massive backlog. Always check current posted times before submitting.', tools: [{ label: 'Turnaround Estimator', href: '/tools/turnaround-estimator' }] },
  { id: 4, category: 'Grading', question: 'What does a PSA 10 mean?', answer: 'PSA 10 "Gem Mint" means the card is virtually perfect: sharp corners, full original gloss, perfect centering (within 55/45 or better), and no staining or print defects visible under 10x magnification. It is the highest PSA grade and cards that achieve it command significant premiums — often 5-10x the PSA 9 price for desirable cards.', tools: [{ label: 'PSA Grading Scale', href: '/guides/psa-grading-scale' }] },
  { id: 5, category: 'Grading', question: 'Can I get a card regraded for a higher grade?', answer: 'Yes, "cracking and resubmitting" is common. If you think your PSA 9 deserves a 10, you can crack the slab and resubmit. Success rates vary: PSA 9 to 10 is roughly 15-30% depending on the card. You can also cross over from BGS/CGC to PSA if you think the PSA scale is more favorable. Our Regrade Calculator shows expected value.', tools: [{ label: 'Regrade Calculator', href: '/tools/regrade-calc' }] },
  { id: 6, category: 'Grading', question: 'How do I check if a graded card slab is authentic?', answer: 'Look for these signs of a fake slab: misaligned labels, wrong fonts, poor plastic quality, loose inner card, mismatched cert numbers. Always verify the cert number on the grading company\'s website (PSA: psacard.com/cert, BGS: beckett.com/grading/card-lookup). AI-generated fake labels are getting better — cert verification is the only sure method.', tools: [{ label: 'Cert Verifier', href: '/tools/cert-check' }, { label: 'Auth Checker', href: '/tools/auth-check' }] },
  // Buying
  { id: 7, category: 'Buying', question: 'Where is the best place to buy sports cards?', answer: 'For singles: eBay has the largest selection and sold listing data for pricing. COMC (Check Out My Cards) is great for mid-range singles. Card shows offer negotiation opportunities and no shipping. Facebook groups can have deals but less buyer protection. For sealed product: your local card shop (LCS) supports the community, big box retailers (Target, Walmart) have retail at MSRP, and online retailers like Steel City and Blowout Cards offer pre-orders.', tools: [{ label: 'Selling Platforms Guide', href: '/tools/selling-platforms' }] },
  { id: 8, category: 'Buying', question: 'Should I buy sealed boxes or singles?', answer: 'Almost always buy singles if you want specific cards. Opening sealed product is gambling — the expected value of most boxes is 50-70% of retail price. You pay a "fun premium" to rip. Buy sealed product for: the experience of opening, if you want a wide variety, or if you believe the product will appreciate sealed. Our Wax vs Singles Calculator shows the math.', tools: [{ label: 'Wax vs Singles', href: '/tools/wax-vs-singles' }, { label: 'Sealed EV Calculator', href: '/tools/sealed-ev' }] },
  { id: 9, category: 'Buying', question: 'How do I know if a card is real or fake?', answer: 'Check: 1) Compare to known authentic copies (font, color, stock). 2) The light test — hold a flashlight behind it; real cards have consistent opacity. 3) The black layer — rip a worthless card from the same set and look for the black layer between the front and back paper. 4) Surface texture should match the set. 5) Print registration should be sharp. Vintage fakes are harder to detect — consider professional authentication for high-value cards.', tools: [{ label: 'Authentication Checker', href: '/tools/auth-check' }] },
  { id: 10, category: 'Buying', question: 'What does "RC" mean on a card?', answer: 'RC stands for "Rookie Card" — the first officially licensed base card of a player in their major league uniform. Rookie cards are typically the most valuable version of any player because they represent the origin point of their collecting history. Note: Bowman prospect cards (labeled "1st Bowman") technically come before the player reaches the majors, while the RC designation appears on flagship sets like Topps, Panini Prizm, etc.' },
  { id: 11, category: 'Buying', question: 'What is the best time of year to buy cards?', answer: 'Generally: buy in the off-season (winter for baseball/football, summer for basketball/hockey). Prices tend to dip when a sport is not in season. The worst time to buy is during peak hype — right after a big playoff performance or when a new set drops. "Buy the off-season, sell the in-season" is the closest thing to free money in the hobby.', tools: [{ label: 'Seasonality Tool', href: '/tools/seasonality' }] },
  // Selling
  { id: 12, category: 'Selling', question: 'What is the best platform to sell cards?', answer: 'eBay: largest audience, 13% final value fee. Best for $50+ cards. COMC: great for $5-50 cards, 20% fee but handles shipping. Facebook groups: 0% fees but less buyer protection. Card shows: 0% fees, instant cash, but booth costs and negotiation. Mercari: 10% fee, good for bundles. MySlabs: 8% for graded. The right platform depends on your card\'s value and quantity.', tools: [{ label: 'Flip Profit Calculator', href: '/tools/flip-calc' }, { label: 'Selling Platforms', href: '/tools/selling-platforms' }] },
  { id: 13, category: 'Selling', question: 'How much are my old baseball cards worth?', answer: 'Most cards from 1987-1994 ("Junk Wax Era") are worth $0.01-$0.10 regardless of the player, because they were massively overproduced. Cards from the 1950s-1970s in good condition can be valuable. The best way to check: search the exact card on eBay and filter by "Sold Items" — this shows what people actually paid, not what sellers are asking.', tools: [{ label: 'Card Identifier', href: '/tools/identify' }, { label: 'Collection Value', href: '/tools/collection-value' }] },
  { id: 14, category: 'Selling', question: 'Do I have to pay taxes on card sales?', answer: 'In the US, yes. Card sales are subject to capital gains tax. Cards held under 1 year are taxed as ordinary income. Cards held over 1 year are taxed at the collectibles rate of 28% (higher than the standard 15-20% long-term rate). Platforms like eBay issue 1099-K forms if you exceed $600 in annual sales. Keep records of your purchase price (cost basis) to minimize taxes.', tools: [{ label: 'Tax Calculator', href: '/tools/tax-calc' }] },
  { id: 15, category: 'Selling', question: 'Should I sell my card now or hold?', answer: 'Sell into hype: if a player just had a huge game or won an award, prices peak in the 48-72 hours after. The hobby follows a "90-Day Hype Rule" — most price spikes from a single event return to baseline within 90 days. Hold if: the player is young with a rising trajectory, the card is from a respected set, and you believe long-term appreciation. Generally: sell modern, hold vintage.' },
  // Investing
  { id: 16, category: 'Investing', question: 'Are sports cards a good investment?', answer: 'Cards can be profitable but they are NOT a traditional investment. They are illiquid, volatile, unregulated, and subject to fashion/hype cycles. Top-tier vintage cards (1950s-1970s stars) have appreciated consistently. Modern cards are speculative — they can spike 500% or crash 80%. A balanced approach: 80% of your card budget for enjoyment, 20% for "investment" cards you believe in long-term.', tools: [{ label: 'Investment Calculator', href: '/tools/investment-calc' }] },
  { id: 17, category: 'Investing', question: 'What makes a card valuable?', answer: 'Five factors: 1) Player significance (HOF, records, cultural icon). 2) Scarcity (low print run, population count). 3) Condition (PSA 10 vs raw). 4) Demand (current hype, team fanbase). 5) Set prestige (1952 Topps, Prizm, Bowman Chrome). The most valuable cards have all five: iconic player + scarce card + perfect condition + high demand + prestigious set.', tools: [{ label: 'Rarity Score', href: '/tools/rarity-score' }] },
  { id: 18, category: 'Investing', question: 'Should I invest in rookie cards or vintage?', answer: 'Different risk profiles: Rookie cards of current young stars are high-risk, high-reward. If the player becomes a Hall of Famer, the card could 10x. If they get injured or decline, it could lose 90%. Vintage cards (pre-1980) of established legends are lower risk — they tend to appreciate steadily at 5-10% annually. Most experienced investors recommend a mix: 70% vintage/established, 30% modern/speculative.' },
  { id: 19, category: 'Investing', question: 'What is a "pop report" and why does it matter?', answer: 'A population report shows how many copies of a specific card have been graded at each grade level by PSA, BGS, or CGC. Low population = fewer available = potential for higher prices. A card with 50 PSA 10s is generally worth more than one with 5,000 PSA 10s, all else equal. But beware: low pop can also mean low demand — nobody bothered grading it. Check pop reports before grading to gauge scarcity.', tools: [{ label: 'Pop Report Checker', href: '/tools/pop-report' }] },
  // Condition
  { id: 20, category: 'Condition', question: 'How do I tell the condition of my card?', answer: 'Check these 4 areas: 1) Corners — are they sharp points or soft/dinged? 2) Edges — run your finger along; feel for nicks, chips, or roughness. 3) Surface — look for scratches, print defects, or loss of gloss under angled light. 4) Centering — are the borders even on all sides? A card with sharp corners, clean edges, no surface issues, and good centering is likely an 8-9 grade. Our Condition Grader walks you through each step.', tools: [{ label: 'Condition Grader', href: '/tools/condition-grader' }, { label: 'Photo Grade Estimator', href: '/tools/photo-grade-estimator' }] },
  { id: 21, category: 'Condition', question: 'How should I store my cards?', answer: 'The protection stack: 1) Penny sleeve first (always sleeve before top-loading). 2) Then a semi-rigid top-loader or magnetic one-touch holder. 3) Store upright in card boxes or binder pages. 4) Keep in a cool (65-70°F), dry (40-50% humidity) environment. 5) Avoid direct sunlight. 6) Never rubber-band cards together. 7) For $100+ cards, consider a Card Saver I for eventual grading submission.', tools: [{ label: 'Storage Calculator', href: '/tools/storage-calc' }, { label: 'Holder Size Guide', href: '/tools/holder-guide' }] },
  { id: 22, category: 'Condition', question: 'Does centering matter for grading?', answer: 'Yes, centering is one of the 4 grading criteria and it can be the difference between a 9 and a 10. PSA allows 60/40 centering for a 10, 65/35 for a 9. BGS is stricter: 50/50 to 55/45 for a 10 subgrade. You can check centering before submitting by measuring the borders with a ruler or using our Centering Calculator. Poor centering is the #1 reason cards come back as 9s instead of 10s.', tools: [{ label: 'Centering Calculator', href: '/tools/centering-calc' }] },
  // Pokémon
  { id: 23, category: 'Pokémon', question: 'Are Pokémon cards a good investment?', answer: 'Pokémon is the largest TCG in the world and has shown strong long-term appreciation, especially vintage (Base Set, Jungle, Fossil) and special art rares (SARs) from modern sets. The Pokémon brand transcends card collecting — it is a cultural phenomenon. That said, modern Pokémon has massive print runs, so not every card will appreciate. Focus on: 1st Edition vintage, special art rares, and cards featuring iconic Pokémon (Charizard, Pikachu, Umbreon).' },
  { id: 24, category: 'Pokémon', question: 'What is a Special Art Rare (SAR)?', answer: 'Special Art Rares are full-art illustration cards in modern Pokémon sets that feature stunning artwork by talented illustrators. They are the most collected and valuable cards in modern Pokémon — the Charizard ex SAR from Obsidian Flames regularly sells for $250+. SARs replaced the "Rainbow Rare" chase card spot and collectors widely agree the artwork is far superior. Pull rates are approximately 1 per 2-3 booster boxes.' },
  { id: 25, category: 'Pokémon', question: 'What are the most valuable Pokémon cards?', answer: 'The most valuable are: 1st Edition Base Set Charizard PSA 10 ($300,000+), Pikachu Illustrator ($5.2M record), Shadowless Charizard PSA 10 ($100,000+), and various trophy cards. For modern cards: Moonbreon VMAX Alt Art ($500+), Umbreon ex SAR from Prismatic Evolutions ($200+), and Charizard ex SAR from Obsidian Flames ($250+). Browse our full Pokémon price guide for current values.' },
  // Breaks
  { id: 26, category: 'Breaks', question: 'What is a card break?', answer: 'A card break (or "group break") is where a breaker purchases sealed product and sells "spots" to participants. You buy a team (team break), a pick (pick break), or a random slot. The breaker opens the product on live stream and ships the cards to whoever owns that team/slot. It is a way to get cards from expensive products at a fraction of the full box price. Example: a $500 hobby box split 30 ways = ~$17/team.' },
  { id: 27, category: 'Breaks', question: 'Are card breaks worth it?', answer: 'Mathematically, breaks usually favor the breaker — they need to profit. Most participants lose money long-term. But breaks are worth it for: the entertainment/social experience, access to high-end products you cannot afford alone, and the chance at big hits. Treat break spending as entertainment budget, not investment. Our Break Spot Picker shows which teams offer the best value in any given product.', tools: [{ label: 'Break Spot Picker', href: '/tools/break-spot' }, { label: 'Break ROI Tracker', href: '/tools/break-roi' }] },
  // Collecting Basics
  { id: 28, category: 'Collecting Basics', question: 'How do I start collecting sports cards?', answer: 'Start simple: 1) Pick one sport and one player you love. 2) Search their cards on eBay "Sold Items" to learn prices. 3) Buy a few singles of cards you like in the $5-$25 range. 4) Protect them properly (penny sleeve + top-loader). 5) Explore sets and learn what makes cards valuable. Don\'t spend big until you understand the hobby. Our "What Should I Collect?" quiz can help point you in the right direction.', tools: [{ label: 'What Should I Collect?', href: '/tools/quiz' }, { label: 'Starter Kit Guide', href: '/tools/starter-kit' }] },
  { id: 29, category: 'Collecting Basics', question: 'What is the "Junk Wax Era"?', answer: 'The Junk Wax Era (1987-1994) refers to the period when card companies massively overproduced sports cards to meet collector demand. Sets like 1988 Donruss, 1989 Fleer, 1990 Topps, and 1991 Score were printed in such enormous quantities that most cards from this era are virtually worthless today ($0.01-$0.10). The lesson: supply matters more than anything. Exceptions exist — key rookie cards in high grades (Griffey, Jordan, etc.) still hold value.' },
  { id: 30, category: 'Collecting Basics', question: 'What does "1st Bowman" mean?', answer: 'A "1st Bowman" is a player\'s first appearance in a Bowman product — usually in Bowman Chrome as a prospect card. These are issued before the player reaches the major leagues and before they get an official RC (Rookie Card). 1st Bowman Chrome cards are extremely popular for prospect speculation because they are the earliest widely available cards. They carry a premium over the later RC for top prospects.' },
  // More Grading
  { id: 31, category: 'Grading', question: 'What is the cheapest way to grade cards?', answer: 'SGC is often the most affordable at ~$15/card for standard service. CGC Standard is ~$15-20/card. PSA Economy is $20/card but has long wait times (150+ days). For bulk submissions, PSA and SGC offer discounts on 20+ cards. If you are grading cards worth under $50 raw, consider whether grading is even worth it — the cost may exceed the value gained.', tools: [{ label: 'Submission Planner', href: '/tools/submission-planner' }] },
  // More Buying
  { id: 32, category: 'Buying', question: 'What is a "parallel" card?', answer: 'A parallel is a version of a base card with a different finish, color, or numbering. Examples: Prizm Silver (the iconic silver refractor), Topps Chrome Refractor, numbered parallels (/299, /99, /25, /10, /1). Lower numbered parallels are rarer and more valuable. A 1/1 (one-of-one) means only one copy exists. Parallels are the main "chase" in modern sets — the base card might be $1 while the Gold /10 is $500.' },
  { id: 33, category: 'Buying', question: 'What is a "hit" in card collecting?', answer: 'A "hit" is an insert card that is significantly rarer and more valuable than a base card — typically an autograph, game-worn memorabilia (relic/patch) card, or a low-numbered parallel. Hobby boxes guarantee a certain number of hits (e.g., "2 autos per box"). The hit rate is what drives the expected value of sealed products. Not all hits are created equal — a base auto of a backup catcher is a "hit" but may be worth less than the box cost.' },
  // More Selling
  { id: 34, category: 'Selling', question: 'When should I list cards on eBay auction vs Buy It Now?', answer: 'Auction: use for cards worth $200+ with high demand — competition drives the price up. End auctions on Sunday evening (7-9 PM ET) for maximum bidder activity. Buy It Now: use for most cards under $200. Price at or slightly below recent sold comps. Add "Best Offer" to let buyers negotiate. BIN sells faster and gives you price control. For true high-end cards ($1,000+), consider consignment with a major auction house (Heritage, Goldin, PWCC).' },
  { id: 35, category: 'Selling', question: 'How do I photograph cards for selling?', answer: 'Use natural or diffused light — no flash. Place the card on a dark, non-reflective surface. Take front, back, and all 4 corner close-ups. Show the full card with borders visible. For graded cards, include a photo of the label and the full slab. A dark background makes the card pop. Smartphone cameras are fine — steadiness matters more than megapixels. Our Photo Guide has detailed tips and setup recommendations.', tools: [{ label: 'Photography Guide', href: '/tools/photo-guide' }] },
  // More Investing
  { id: 36, category: 'Investing', question: 'What is card "flipping"?', answer: 'Flipping is buying cards at a low price and reselling them quickly for profit. Common strategies: buy at card shows and sell on eBay (arbitrage), buy during off-season dips and sell during peak hype, buy raw cards that look gradable and sell after grading (grade-and-flip), or buy into market events (player traded to big-market team, MVP award). Most serious flippers target 30-50% ROI per transaction after fees.', tools: [{ label: 'Flip Profit Calculator', href: '/tools/flip-calc' }] },
  { id: 37, category: 'Investing', question: 'How much of my budget should go to cards?', answer: 'Treat card collecting like any discretionary hobby spending. A common guideline: never invest money you cannot afford to lose. Most financial advisors suggest keeping collectibles/alternative investments under 5-10% of your total portfolio. For pure hobby spending (not "investment"), budget like any entertainment — set a monthly limit and stick to it. Our Budget Planner can help.', tools: [{ label: 'Budget Planner', href: '/tools/budget-planner' }] },
  // More Condition
  { id: 38, category: 'Condition', question: 'Can I clean or improve a card\'s condition?', answer: 'Generally, do NOT attempt to clean, alter, or "improve" a card. Grading companies look for evidence of tampering (trimming, recoloring, cleaning, pressing) and will flag altered cards as "Altered" or give them a "Qualified" grade, which destroys value. The exception: carefully removing surface debris (dust, light dirt) with a microfiber cloth is generally acceptable. Never use water, chemicals, or erasers on cards.' },
  // More Pokémon
  { id: 39, category: 'Pokémon', question: 'What is the difference between English and Japanese Pokémon cards?', answer: 'Japanese cards are printed first and often have different artwork, different rarity tiers, and different set compositions. Japanese cards are generally cheaper than English equivalents because: smaller collector base in the West, and Japanese print runs can be enormous. However, some Japanese exclusive art commands a premium. For investment: English cards have historically appreciated more in Western markets. For collecting: Japanese cards offer unique artwork at lower prices.' },
  { id: 40, category: 'Pokémon', question: 'What are the best Pokémon sets to open?', answer: 'For value: Prismatic Evolutions (Eevee-lution SARs), Scarlet & Violet 151 (Kanto nostalgia + SARs), and Obsidian Flames (Charizard ex SAR). For fun: Journey Together (character SARs), Surging Sparks (wide variety of hits), and Shrouded Fable (beautiful dark art). For vintage: Base Set Unlimited is the gold standard but expensive ($15,000+ per box). ETBs (Elite Trainer Boxes) offer the best packs-per-dollar ratio.' },
  // More Breaks
  { id: 41, category: 'Breaks', question: 'What is the difference between a team break and a pick break?', answer: 'Team break: you buy a specific team and receive ALL cards of that team from the opened product. Popular teams cost more. Pick break: you draft cards in order based on your pick position (1st pick chooses first after each pack). Pick 1 costs the most. Team breaks are better if you collect a specific team. Pick breaks are better if you want the best individual cards regardless of team.' },
  // More Basics
  { id: 42, category: 'Collecting Basics', question: 'What is a "case hit"?', answer: 'A case hit is a card so rare it only appears approximately once per case (usually 12 boxes = 1 case). These are among the rarest inserts in any product — examples include 1/1 superfractors, autographed patch cards, and printing plates. Case hits are the "holy grail" pulls that go viral on social media. They are NOT guaranteed per case — the term refers to the approximate odds.' },
  { id: 43, category: 'Collecting Basics', question: 'How do I find the value of my card?', answer: 'The most accurate way: search the exact card name on eBay and click "Sold Items" to see real transaction prices. Include the year, brand, card number, and grade if applicable. For quick estimates, search on CardVault. Avoid price guides that list "book value" — the only real value is what someone actually paid. Prices change daily based on player performance and market conditions.', tools: [{ label: 'Card Identifier', href: '/tools/identify' }, { label: 'Price History', href: '/tools/price-history' }] },
  { id: 44, category: 'Collecting Basics', question: 'What is "penny sleeving" and why is it important?', answer: 'A penny sleeve is a thin, soft plastic sleeve that costs about $0.01 each. You should ALWAYS put a card in a penny sleeve BEFORE inserting it into a top-loader or one-touch holder. The sleeve prevents the card from getting scratched by the harder plastic of the top-loader. Inserting a raw card directly into a top-loader can cause edge damage and scratches that hurt the grade. Penny sleeve first — always.' },
  { id: 45, category: 'Collecting Basics', question: 'What is a "short print" (SP)?', answer: 'A short print is a card intentionally produced in lower quantities than the standard base set. They look like base cards but have a different code on the back (usually a different stock photo or variation). SPs are rarer and more valuable than regular base cards. "Super Short Prints" (SSP) are even rarer. Topps Series 1 and 2 typically have SP photo variation cards that can be worth $20-100+ even of common players.' },
  { id: 46, category: 'Investing', question: 'What are the best cards to invest in right now?', answer: 'No one can predict the market, but historically strong categories: 1) Vintage HOF stars in mid-grades (PSA 5-7 are undervalued). 2) Young superstars before their next big achievement (MVP, ring). 3) Pre-rookie Bowman Chrome 1st of top prospects. 4) Pokemon vintage (Base Set Charizard, 1st Edition holos). Avoid: buying at peak hype, junk wax era commons, overproduced modern base cards. Always do your own research.' },
  { id: 47, category: 'Selling', question: 'How do I ship cards safely?', answer: 'For standard singles: penny sleeve + top-loader + painter\'s tape over the opening (never tape the card!) + bubble mailer. For graded cards: wrap slab in bubble wrap + place in a small box within a padded mailer. Always ship with tracking. For high-value ($100+) cards: use a rigid box, extra bubble wrap, and require signature confirmation. Insurance is recommended for $200+ shipments. Our Shipping Calculator estimates costs by carrier and method.', tools: [{ label: 'Shipping Calculator', href: '/tools/shipping-calc' }] },
  { id: 48, category: 'Breaks', question: 'How do I know if a breaker is legit?', answer: 'Check: 1) Reputation on social media (followers, engagement, reviews). 2) Do they show the product sealed before opening? 3) Do they ship within 1-2 weeks? 4) Are they licensed/partnered with eBay, Whatnot, or Loupe? 5) Do they provide tracking numbers? Avoid: breakers with no social presence, those who do not show sealed product, or those with consistent shipping complaints. Start with established breakers on Whatnot or eBay Live.' },
  { id: 49, category: 'Pokémon', question: 'How do I tell if my Pokémon card is 1st Edition?', answer: 'Look for the "1st Edition" stamp — a small circle with a "1" inside it, located on the left side of the card below the artwork frame. English 1st Edition Base Set cards were only printed in 1999 in limited quantities before switching to Unlimited (no stamp). The 1st Edition stamp appears on cards from Base Set through Neo Destiny (1999-2002). Modern Pokémon sets do not have 1st Edition printings — that distinction ended in 2003.' },
  { id: 50, category: 'Collecting Basics', question: 'What is a "refractor" or "prizm"?', answer: 'A refractor (Topps Chrome) or Prizm (Panini Prizm) is a parallel card with a special shiny/holographic finish. The Topps Chrome Refractor has a rainbow shimmer effect; the Panini Silver Prizm has a distinct silver-toned refraction. These are the most popular parallels in the hobby — a Silver Prizm of a top rookie can be worth 10-50x the base version. "Refractor" is Topps\'s term, "Prizm" is Panini\'s, but collectors use them somewhat interchangeably.' },
];

export default function CardFaqClient() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    let items = FAQ_DATA;
    if (category !== 'All') items = items.filter(f => f.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return items;
  }, [search, category]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: FAQ_DATA.length };
    for (const f of FAQ_DATA) {
      counts[f.category] = (counts[f.category] || 0) + 1;
    }
    return counts;
  }, []);

  const toggle = (id: number) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setOpenIds(new Set(filtered.map(f => f.id)));
  const collapseAll = () => setOpenIds(new Set());

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-zinc-500 hover:text-white">
            ✕
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              category === cat
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-400 hover:text-white hover:border-zinc-600'
            }`}
          >
            {cat} ({categoryCounts[cat] || 0})
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{filtered.length} question{filtered.length !== 1 ? 's' : ''}</span>
        <div className="flex gap-3">
          <button onClick={expandAll} className="hover:text-white transition-colors">Expand all</button>
          <button onClick={collapseAll} className="hover:text-white transition-colors">Collapse all</button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {filtered.map(faq => (
          <div key={faq.id} className={`border rounded-lg overflow-hidden transition-colors ${openIds.has(faq.id) ? 'bg-zinc-900/80 border-zinc-700' : 'bg-zinc-900/40 border-zinc-800'}`}>
            <button
              onClick={() => toggle(faq.id)}
              className="w-full text-left px-4 py-3 flex items-start gap-3"
            >
              <span className={`text-xs px-2 py-0.5 rounded border shrink-0 mt-0.5 ${CATEGORY_COLORS[faq.category] || 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                {faq.category}
              </span>
              <span className="text-sm font-medium text-zinc-200 flex-1">{faq.question}</span>
              <span className={`text-zinc-600 shrink-0 transition-transform ${openIds.has(faq.id) ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openIds.has(faq.id) && (
              <div className="px-4 pb-4 pl-[calc(1rem+3.5rem)]">
                <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                {faq.tools && faq.tools.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {faq.tools.map(t => (
                      <Link key={t.href} href={t.href} className="inline-flex items-center gap-1 text-xs bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 px-2.5 py-1 rounded-full hover:bg-emerald-900/40 transition-colors">
                        → {t.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg mb-2">No matching questions</p>
          <p className="text-sm">Try a different search term or category</p>
        </div>
      )}
    </div>
  );
}
