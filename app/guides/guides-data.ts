export interface Guide {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  icon: string;
  gradient: string;
  content: GuideSection[];
}

export interface GuideSection {
  heading: string;
  body: string;
  bullets?: string[];
  callout?: string;
  calloutType?: 'tip' | 'warning' | 'info';
}

export const guides: Guide[] = [
  {
    slug: 'how-to-start-collecting-cards',
    title: 'How to Start Collecting Cards in 2026',
    summary: 'The beginner-to-collector roadmap: what to buy first, where to buy, how to store safely, and how to avoid the traps that cost new collectors money.',
    category: 'Beginner',
    readTime: '8 min',
    icon: '🃏',
    gradient: 'from-emerald-900/40 via-teal-900/20 to-gray-900/40',
    content: [
      {
        heading: 'Pick one lane first',
        body: 'New collectors who try to collect everything collect nothing. The hobby has two dominant categories: sports cards and Pokémon TCG. Both are deep, active markets with real price data. Pick one based on your genuine interest — not what YouTube says is hot right now.',
        bullets: [
          'Sports cards: choose one sport, one era (vintage 1950s–80s, junk wax 1985–93, modern 2000s+)',
          'Pokémon TCG: choose one focus — raw singles, sealed packs, vintage Base Set, or modern Scarlet & Violet',
          'Set a hard monthly budget and stick to it for 6 months before expanding',
        ],
      },
      {
        heading: 'Where to buy (and where not to)',
        body: 'Every channel has trade-offs on price, authenticity risk, and selection.',
        bullets: [
          'eBay sold listings: the best real-world price reference. Always check "Sold" not "Active" listings.',
          'TCGPlayer: best for Pokémon singles. Buyer protection, seller ratings, no negotiation needed.',
          'COMC / Sportlots: good for vintage sports cards, searchable large inventories.',
          'Local card shows: best prices on raw cards, no shipping risk, can inspect in person.',
          'Retail (Target/Walmart packs): worst expected value. Entertainment only — not investment.',
        ],
        callout: 'Never buy graded cards from Facebook Marketplace or local social groups without verifying the case authenticity on PSA\'s website first. Fake slabs are common.',
        calloutType: 'warning',
      },
      {
        heading: 'Storage is not optional',
        body: 'Cards lose value fast from preventable damage. Every card you intend to keep should be protected immediately.',
        bullets: [
          'Penny sleeves first, then a top loader — the standard protective stack for individual cards',
          'Binder storage: use side-loading 9-pocket pages, never top-loading (cards can fall)',
          'Climate matters: avoid attics, basements, garages — humidity and temperature extremes crack cases and warp cards',
          'High-value raw cards ($100+): store in one-touch magnetic cases, flat and dry',
        ],
      },
      {
        heading: 'Understanding what drives value',
        body: 'Card value is driven by four factors, roughly in order of importance: player/character popularity, condition/grade, scarcity (print run or population report), and market timing. Most collectors overweight timing and underweight condition — which is the opposite of what makes money.',
        callout: 'Tip: The PSA Pop Report shows exactly how many cards have been graded at each grade level. Low populations in high grades = genuine scarcity. High PSA 10 populations = grade premium may be lower.',
        calloutType: 'tip',
      },
      {
        heading: 'Avoid the common traps',
        body: 'Most expensive beginner mistakes are avoidable.',
        bullets: [
          'Do not buy sealed wax as an investment — expected value is almost always negative vs. buying singles',
          'Do not pay "book value" — Beckett book values are not market prices. Use eBay sold comps.',
          'Do not grade cards worth less than $100 raw — grading fees (PSA Economy: $25) plus turnaround make economics impossible',
          'Do not buy raw vintage for big money without third-party authentication — alterations and forgeries exist',
        ],
      },
    ],
  },
  {
    slug: 'when-to-grade-your-cards',
    title: 'When to Grade (And When Not To)',
    summary: 'Grading is not always worth it. This guide explains grade economics, which cards benefit most, and how to calculate your actual break-even before submitting.',
    category: 'Grading',
    readTime: '6 min',
    icon: '🏅',
    gradient: 'from-blue-900/40 via-indigo-900/20 to-gray-900/40',
    content: [
      {
        heading: 'The break-even math',
        body: 'Grading only makes financial sense when the expected grade premium exceeds your all-in cost. Your all-in cost includes: submission fee, two-way shipping (~$20–35 round trip), insurance if required, and your time.',
        bullets: [
          'PSA Economy ($25) + shipping ($30) = ~$55 minimum. Card needs $55+ value increase to break even.',
          'PSA Express ($150) + shipping = ~$185 minimum. Only for cards where a grade jump adds $500+.',
          'BGS Standard ($35) + shipping = ~$65 minimum. Better for cards where Black Label 9.5 commands a large premium.',
        ],
        callout: 'Rule of thumb: If a PSA 9 version of your card sells for less than 3× your PSA 7/8 raw price, grading is not worth it financially.',
        calloutType: 'tip',
      },
      {
        heading: 'Cards that grade well vs. cards that do not',
        body: 'Not all cards are worth submitting regardless of economics.',
        bullets: [
          'Vintage (pre-1980): Grade even lower-grade copies for authenticity. Collectors pay a meaningful premium for slabbed vintage over raw.',
          'Modern star rookies (post-2000): Only grade if condition is near-perfect. The difference between PSA 8 and PSA 9 is often 2–5×.',
          'Common modern cards: Almost never worth grading — high PSA 10 populations make the grade premium small.',
          'Pokémon vintage (Base Set, Jungle, Fossil): High demand for high-grade slabs. Check pop report first.',
          'Modern Pokémon (Scarlet & Violet era): Only Special Art Rares and Illustration Rares typically support grade premiums.',
        ],
      },
      {
        heading: 'Choosing the right grading company',
        body: 'PSA is the market standard for maximum liquidity. BGS is preferred by some collectors for subgrade transparency and Black Label prestige. SGC is growing for vintage baseball. Choose based on what buyers for your specific card prefer.',
        bullets: [
          'PSA: highest name recognition, most liquidity, largest pop report database',
          'BGS: subgrades tell you exactly why a card scored what it did; Black Label 10 is genuinely rare',
          'SGC: faster for vintage, growing collector base, slightly lower premiums than PSA',
          'CGC (comic company): limited market acceptance for cards — avoid for most sports and Pokémon',
        ],
      },
      {
        heading: 'How to evaluate condition before submitting',
        body: 'Submitting cards in less-than-optimal condition wastes money. Check these before sending:',
        bullets: [
          'Corners: use a loupe (jeweler\'s magnifier) — PSA 10 allows zero corner wear',
          'Centering: measure with a ruler or centering tool — PSA 10 requires 55/45 or better on all sides',
          'Surface: check for print lines, scratches, haze under bright light at an angle',
          'Edges: run a fingertip along edges — any roughness reduces grade',
        ],
        callout: 'If a card would not grade PSA 9 or better, the economics rarely justify Economy submission. Grade only what you believe will come back 9 or 10.',
        calloutType: 'warning',
      },
    ],
  },
  {
    slug: 'how-to-read-price-data',
    title: 'How to Read Card Price Data',
    summary: 'Book values, market prices, sold comps — they all mean different things. This guide explains what each metric is, which to trust, and how to use them to make decisions.',
    category: 'Pricing',
    readTime: '5 min',
    icon: '📊',
    gradient: 'from-amber-900/40 via-orange-900/20 to-gray-900/40',
    content: [
      {
        heading: 'The three price sources (and what they actually mean)',
        body: 'Most pricing confusion comes from mixing up three fundamentally different data types.',
        bullets: [
          'Beckett Book Value: a subjective editorial price set by Beckett staff. Outdated quickly. NOT market price. Used primarily as a reference anchor by hobby veterans who grew up with it.',
          'TCGPlayer Market Price: the trailing average of actual sales on TCGPlayer for Pokémon singles. Real data, ~24hr lag. The best single price reference for modern Pokémon.',
          'eBay Sold Comps: the ground truth. Real transactions, searchable by exact card and grade. Most reliable for sports cards, vintage Pokémon, and graded copies.',
        ],
        callout: 'When someone says "it books for $X" — that\'s Beckett. When someone says "it sold for $X" — that\'s real. These numbers can differ by 50–300% for popular cards.',
        calloutType: 'warning',
      },
      {
        heading: 'How to pull an eBay sold comp',
        body: 'Finding accurate comps takes one minute:',
        bullets: [
          '1. Go to eBay. Search the exact card: "[Year] [Player] [Set] [Card Number] [Grade if graded]"',
          '2. On the left sidebar: check "Sold Items" under "Show Only"',
          '3. Sort by: "Ending soonest" first (most recent), then expand to 90 days if too few results',
          '4. Filter by: condition (graded vs raw), specific grade (PSA 9, PSA 10, etc.)',
          '5. Look for the median of recent sales — ignore outliers on both ends',
        ],
      },
      {
        heading: 'Grade multipliers',
        body: 'The same card in different grades can sell for wildly different amounts. These are general ranges — individual cards vary significantly.',
        bullets: [
          'PSA 10 vs PSA 9: typically 3–15× higher. Higher for vintage or low-pop cards.',
          'PSA 9 vs PSA 8: typically 2–4× higher. This is often the biggest value jump.',
          'PSA 8 vs PSA 7: typically 1.5–2× higher.',
          'Raw NM vs PSA 8: raw typically 40–60% of PSA 8 price (varies by card liquidity).',
        ],
        callout: 'Use our Grade Value Calculator to estimate the value across all grade tiers from a single known price.',
        calloutType: 'tip',
      },
      {
        heading: 'When prices are misleading',
        body: 'Not all sales data is good data.',
        bullets: [
          'Single anomalous eBay sales: one record sale does not reset the market. Look at 5–10 sales.',
          'Active listings: asking prices mean nothing — sellers list high, buyers decide the actual market.',
          'Low-volume vintage: if fewer than 5 cards have sold in 90 days, pricing is illiquid. Any sale can be an outlier.',
          'Auction house prices: Heritage, Goldin, and PWCC sales often exceed market due to auction premium and premium buyer pool. Adjust down ~10–20% for actual comparable market.',
        ],
      },
    ],
  },
  {
    slug: 'sports-card-eras-explained',
    title: 'Sports Card Eras: Vintage, Junk Wax & Modern',
    summary: 'The hobby\'s history in plain language. What made each era different, which cards matter from each period, and what it means for today\'s market.',
    category: 'History',
    readTime: '7 min',
    icon: '📅',
    gradient: 'from-red-900/40 via-rose-900/20 to-gray-900/40',
    content: [
      {
        heading: 'The Pre-War Era (before 1941)',
        body: 'The earliest collectible cards, predating organized baseball\'s modern era. T206 tobacco cards (1909–1911) are the most iconic — issued inside cigarette packs, featuring hundreds of players. The T206 Honus Wagner is the most famous and valuable sports card ever made.',
        bullets: [
          'Key sets: T206 (1909–11), T205, E90-1 American Caramel, 1914 Cracker Jack',
          'Condition: extremely rare in top grades due to age and handling over 100+ years',
          'Market: illiquid but stable. Prices driven by historical significance and extreme rarity.',
          'Who collects it: museum-level collectors and deep-pocketed hobbyists. Not a beginner market.',
        ],
      },
      {
        heading: 'The Golden Age (1948–1979)',
        body: 'The Bowman and Topps era. Modern-format cards with real photography, produced in sets. This era contains most of baseball\'s golden age players — Mantle, Mays, Aaron, Clemente. The 1952 Topps set is the most iconic of the era.',
        bullets: [
          'Key cards: 1952 Topps Mickey Mantle #311, 1955 Topps Roberto Clemente, 1963 Topps Pete Rose rookie',
          'Condition: PSA 8+ copies are rare and valuable; most copies grade PSA 4–6',
          'Market: strong and active. Significant grading population supports reliable comps.',
          'Who collects it: core of the "investment-grade" hobby. Price stability vs. modern volatility.',
        ],
      },
      {
        heading: 'The Junk Wax Era (1985–1993)',
        body: 'The most overproduced era in hobby history. Card companies printed billions of cards in response to collector demand, creating a glut that still suppresses prices today. Most junk wax cards are worth cents regardless of grade — with notable exceptions.',
        bullets: [
          'Why most are worthless: print runs in the hundreds of millions, massive surviving supply',
          'Notable exceptions: 1986 Fleer Michael Jordan (limited production), 1989 Upper Deck Ken Griffey Jr. rookie, 1993 SP Derek Jeter',
          'PSA 10 premiums: even junk wax has PSA 10 premium due to poor centering from era — a Griffey PSA 10 vs PSA 9 gap is often 10×',
          'Beginner trap: most card show bins are full of 1988–1992 cards with zero value. Know before you buy.',
        ],
        callout: 'A common beginner mistake: seeing a "1989 Rickey Henderson Topps" and thinking it\'s valuable because Henderson is a Hall of Famer. Topps printed 3 billion+ cards in 1989. It\'s worth a quarter.',
        calloutType: 'warning',
      },
      {
        heading: 'The Modern Era (2000–present)',
        body: 'Defined by serial-numbered parallels, autographs, patch cards, and premium brands. The market bifurcated: massive print runs for base cards (nearly worthless) and ultra-short-print premium cards that command serious money.',
        bullets: [
          'Key innovation: /10, /25, /50 serial-numbered parallels — verifiable scarcity printed into the card',
          'Key brands: Topps Chrome, Panini Prizm, National Treasures, Exquisite Collection',
          'Key rookies: 2003 Topps Chrome LeBron, 2009 Bowman Chrome Trout, 2021-22 Prizm Wembanyama',
          'Grading focus: PSA 10 is achievable on modern cards (better manufacturing); pop reports matter for pricing',
        ],
      },
    ],
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(g => g.slug === slug);
}
