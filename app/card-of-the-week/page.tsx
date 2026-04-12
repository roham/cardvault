import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Card of the Week — Weekly Featured Cards with Market Analysis',
  description: 'Weekly deep-dives on the most interesting cards in the hobby. Market context, investment thesis, and why each card deserves a spotlight. Sports and Pokémon.',
};

interface WeeklyCard {
  week: string;
  date: string;
  title: string;
  cardName: string;
  category: 'sports' | 'pokemon';
  sport?: string;
  currentValue: string;
  writeup: string;
  marketContext: string;
  investmentThesis: string;
  slug?: string;
  tcgId?: string;
  badge?: string;
  badgeColor?: string;
}

const weeklyCards: WeeklyCard[] = [
  {
    week: 'Week 12',
    date: 'Apr 7, 2026',
    title: 'The Card PSA Can\'t Replicate',
    cardName: '1952 Topps Mickey Mantle #311',
    category: 'sports',
    sport: 'baseball',
    currentValue: '$15,000–$12,600,000 (grade-dependent)',
    badge: 'Iconic',
    badgeColor: 'bg-amber-900/60 text-amber-400 border-amber-700/40',
    writeup: 'The 1952 Topps Mickey Mantle isn\'t just a valuable card. It\'s a cultural artifact. When it sold for $12.6M at Heritage in August 2022, it became the highest-priced sports card ever sold at auction — and it did so because a PSA 9 example is nearly impossible to find. The card was printed as a high-number (card #311 in a set that went to 407), making it a short print in a set already printed conservatively. Mantle himself is the most beloved player of the golden age of baseball; the Yankees of the 1950s are the most storied dynasty in American sports. Put a card that\'s nearly impossible to find in pristine condition, add the most beloved player in the sport\'s 1950s heyday, and you get the defining sports card of the modern hobby.',
    marketContext: 'High-grade examples (PSA 8 and above) appreciate consistently through every market cycle. Lower grades (PSA 4–6) offer an accessible entry point — a PSA 6 sold for $540,000 in 2021. The pandemic boom drove wild pricing on everything; the correction has been modest for this card versus modern cards, which confirms its blue-chip status.',
    investmentThesis: 'Scarcity + cultural permanence = durable value. The PSA population at PSA 8 and above is tiny and grows slowly — maybe one or two new submissions reach those grades per year. Every serious vintage sports card collection contains or wants this card. Supply is essentially fixed. Demand grows as the collector base expands.',
    slug: '1952-topps-mickey-mantle-311',
  },
  {
    week: 'Week 11',
    date: 'Mar 31, 2026',
    title: 'Pikachu in a Scenario That Never Existed',
    cardName: 'Umbreon VMAX Secret Rare (Moonbreon) — Evolving Skies',
    category: 'pokemon',
    currentValue: '$300–$5,100 (grade-dependent)',
    badge: 'Community Icon',
    badgeColor: 'bg-indigo-900/60 text-indigo-400 border-indigo-700/40',
    writeup: 'The community named it "Moonbreon" within days of Evolving Skies\' August 2021 release. The Umbreon VMAX Secret Rare features a nighttime city scene with the dark Eevee evolution sitting elegantly against a deep blue sky, the moon partially visible — an atmosphere unlike anything the TCG had produced before. It became an instant cultural shorthand for what modern Pokémon card art could achieve. If you show a non-collector the Moonbreon, they say it\'s beautiful. That matters in collecting.',
    marketContext: 'At peak pandemic pricing, sealed Evolving Skies booster boxes hit $300+. The Moonbreon PSA 10 reached $5,100. Both have corrected significantly — booster boxes now trade around $100-120 and the PSA 10 Moonbreon is in the $500-800 range depending on timing. For collectors who held through the correction, the card\'s cultural status means long-term demand is unlikely to disappear.',
    investmentThesis: 'Cards that become cultural icons retain a floor that pure market cards don\'t. The Moonbreon is now "the card" people reference when explaining modern Pokémon collecting to outsiders. That kind of name recognition is rare and valuable long-term. At current prices, it\'s a reasonable acquisition for anyone who believes the S&S era will have collectible significance in 10 years.',
  },
  {
    week: 'Week 10',
    date: 'Mar 24, 2026',
    title: 'The Rookie That Rewrote the Rulebook',
    cardName: '2000 Playoff Contenders Tom Brady Auto #144',
    category: 'sports',
    sport: 'football',
    currentValue: '$5,000–$3,107,852 (grade-dependent)',
    badge: 'Grail Card',
    badgeColor: 'bg-blue-900/60 text-blue-400 border-blue-700/40',
    writeup: 'Tom Brady was selected 199th overall in the 2000 NFL Draft. The conventional wisdom was that he\'d be a backup. Playoff Contenders produced his rookie autograph that year, numbering it to just 100 copies. By the time Brady won his first Super Bowl in February 2002, it was clear something special had arrived. Six more Super Bowls later, that /100 auto is the most valuable modern football card in existence. A PSA 10 sold for $3,107,852 in September 2022. The card\'s scarcity (100 copies) and Brady\'s historic career have made it a trophy asset.',
    marketContext: 'Brady retired in February 2023 (after his brief 2022 unretirement), which typically drives short-term price increases. The market peak for Brady came in 2021-2022; prices have settled somewhat but remain astronomical for top-grade copies. Mid-grade examples (PSA 7-8) are more accessible and offer the same narrative at a lower price point.',
    investmentThesis: '7 Super Bowls isn\'t a record that anyone alive today is likely to see broken. Brady\'s cards are generationally important in the same way Ruth and Mantle are in baseball. The /100 print run on the Contenders auto means the ceiling is structural — 100 copies can\'t become 500. If you can access a PSA 6 or 7, you own a genuine piece of the most important modern football collecting story.',
    slug: '2000-playoff-contenders-tom-brady-144',
  },
  {
    week: 'Week 9',
    date: 'Mar 17, 2026',
    title: 'The Card That Started Everything',
    cardName: 'Base Set 1st Edition Charizard Holo',
    category: 'pokemon',
    currentValue: '$5,000–$420,000 (grade-dependent)',
    badge: 'Benchmark',
    badgeColor: 'bg-amber-900/60 text-amber-400 border-amber-700/40',
    writeup: 'There is no card in Pokémon collecting that carries more weight than the 1st Edition Base Set Charizard. The 1st Edition stamp on the left side of the artwork box, the absence of a drop shadow on the image (making it also a Shadowless print), the flame-colored holo — all on a card from 1999 when nine-year-olds were ripping open packs at Toys R Us. Most of them creased it putting it in their pocket. The ones that didn\'t are now worth hundreds of thousands of dollars.',
    marketContext: 'A PSA 10 1st Edition Charizard sold for $420,000 in March 2022. PSA 9 copies sell for $50,000-80,000 as of 2025. PSA 7 copies are in the $5,000-10,000 range. The correction from 2021 peaks has been real but modest for this card — it represents genuine scarcity and genuine cultural permanence. Every market cycle, this card holds.',
    investmentThesis: "If you can afford a mid-grade 1st Edition Charizard in any condition, it's probably the most defensible position in Pokémon collecting. The card will always be the most culturally significant Pokémon card. Its scarcity is real — 1st Edition print runs were small and most cards were played with. The PSA 10 ceiling is essentially infinite as long as Pokémon exists as a brand.",
    tcgId: 'base1-4',
  },
  {
    week: 'Week 8',
    date: 'Mar 10, 2026',
    title: 'Hockey\'s Most Undervalued Trophy',
    cardName: '1979-80 O-Pee-Chee Wayne Gretzky #18',
    category: 'sports',
    sport: 'hockey',
    currentValue: '$3,000–$3,750,000 (grade-dependent)',
    badge: 'Greatest Rookie',
    badgeColor: 'bg-cyan-900/60 text-cyan-400 border-cyan-700/40',
    writeup: 'Gretzky holds 61 NHL records. Not 61 records that might be broken — 61 records where the nearest competitor is so far behind that the records are essentially permanent. His OPC rookie reflects this in card form. The card has black borders, which means any edge ding or scratching grades it down. The stock is thinner than modern cards. Canadian winters and hockey-playing kids meant most copies were destroyed before 1985. A PSA 10 copy sold for $3.75M in February 2021 — the most expensive hockey card ever sold.',
    marketContext: 'Hockey cards trade at roughly 20-30% of equivalent baseball and basketball cards for comparable players. The Gretzky OPC is the exception — $3.75M is real money regardless of sport. Mid-grade examples (PSA 4-6) offer exposure to the most dominant athlete of his era at prices that baseball equivalents would laugh at.',
    investmentThesis: "The structural argument: Gretzky's records aren't going to be broken, which means his cultural importance won't erode. Hockey's collector base is growing. Canadian collectors have deep pockets and treat Gretzky cards like Americans treat Ruth cards. The OPC rookie is the most important hockey card; it's also arguably the most undervalued trophy card in any sport relative to the player's historical dominance.",
    slug: '1979-80-opee-chee-wayne-gretzky-18',
  },
  {
    week: 'Week 7',
    date: 'Mar 3, 2026',
    title: 'What Happens When Brilliance Meets Tragedy',
    cardName: '1996-97 Topps Chrome Kobe Bryant #138',
    category: 'sports',
    sport: 'basketball',
    currentValue: '$2,000–$1,795,000 (grade-dependent)',
    badge: 'Black Mamba',
    badgeColor: 'bg-orange-900/60 text-orange-400 border-orange-700/40',
    writeup: "In January 2020, Kobe Bryant died in a helicopter crash alongside his daughter Gianna and seven others. The card market responded within 48 hours. His 1996-97 Topps Chrome rookie had been a steady $1,000-3,000 card in PSA 10. By March 2020, it was trading at $10,000+. By 2021, a PSA 10 sold for $1,795,000. That's not speculation — that's the market repricing permanence. Kobe was always a Hall of Famer, always a 5× champion, always the standard for obsessive dedication. Tragedy added emotional weight that only increases with time.",
    marketContext: "The correction from 2021 peaks brought the PSA 10 back to $200,000-400,000 range — still multiples above pre-2020 prices, confirming the rerating was structural rather than pure speculation. PSA 7-8 copies are accessible at $2,000-8,000 and represent the same fundamental story at a lower entry point.",
    investmentThesis: "The most defensible modern basketball card below Jordan and LeBron. Kobe's legacy continues to grow — The Mamba Mentality is arguably more culturally relevant now than during his playing career. The 1996-97 Chrome has the right combination of print quality, centering challenges, and subject permanence to hold value through every market cycle.",
    slug: '1996-97-topps-chrome-kobe-bryant-138',
  },
  {
    week: 'Week 6',
    date: 'Feb 24, 2026',
    title: 'The Pikachu Illustrator Isn\'t a Card. It\'s a Document.',
    cardName: 'Pikachu Illustrator (1998 CoroCoro Promo)',
    category: 'pokemon',
    currentValue: '$200,000–$5,275,000 (grade-dependent)',
    badge: 'Trophy Card',
    badgeColor: 'bg-rose-900/60 text-rose-400 border-rose-700/40',
    writeup: 'In 1998, the Japanese publication CoroCoro Comic ran an illustration contest for the Pokémon Card Game. First place — and runners-up — won a Pikachu Illustrator card: a promo featuring Pikachu drawing a picture of Clefairy. Where a normal card says "Trainer," this one says "Illustrator." Only 41 graded PSA copies are confirmed to exist worldwide. In July 2021, Logan Paul purchased a PSA 10 example for $5,275,000 — the most expensive Pokémon card ever sold. It is not really a card. It is a historical artifact with a PSA grade.',
    marketContext: 'The Pikachu Illustrator exists outside normal market logic. There are 41 copies. Demand is unlimited. The price is whatever the last transaction was. PSA 1 copies sell for over $200,000. Mid-grade copies (PSA 5-7) are in the $1-3M range. PSA 10: $5M+.',
    investmentThesis: 'Trophy cards with defined and tiny supply are the most defensible positions in any collecting market. The Illustrator has 41 copies and infinite name recognition. Every serious Pokémon collector knows this card. There is no scenario where it becomes less culturally significant. If you can access one at any grade, you hold one of 41 pieces of the most famous Pokémon card in history.',
  },
  {
    week: 'Week 5',
    date: 'Feb 17, 2026',
    title: "The Sport's Greatest Player, Its Rarest Card",
    cardName: '1909-11 T206 Honus Wagner',
    category: 'sports',
    sport: 'baseball',
    currentValue: '$1,000,000–$7,250,000 (grade-dependent)',
    badge: 'White Whale',
    badgeColor: 'bg-amber-900/60 text-amber-400 border-amber-700/40',
    writeup: "The story: Honus Wagner, the greatest shortstop in baseball history, demanded his card be pulled from American Tobacco Company cigarette packs in 1909. Some say he objected to tobacco advertising; others say he wanted to be paid. Either way, production stopped after a small run. Fewer than 60 authenticated T206 Wagners exist today. The ex-Gretzky/McNall copy — once owned by Wayne Gretzky and Bruce McNall — is the most famous single trading card in the world. It sold for $7,250,000 in 2021.",
    marketContext: "The T206 Wagner market operates completely differently from normal cards. There's no PSA population growth to worry about — no new cards will be found. The 60 or so copies shift between private collectors and auction houses on a timeframe of years, not months. Each sale resets the market.",
    investmentThesis: 'The scarcest authenticated card for the greatest player at the oldest recognized rarity tier in the hobby. There is no more definitive argument for permanent value. If you have the means, a Wagner in any authenticated condition is the white whale of the hobby.',
    slug: '1909-t206-honus-wagner',
  },
  {
    week: 'Week 4',
    date: 'Feb 10, 2026',
    title: 'The Generational Rookie',
    cardName: '2003-04 Exquisite Collection LeBron James RPA #78',
    category: 'sports',
    sport: 'basketball',
    currentValue: '$50,000–$5,200,000 (grade-dependent)',
    badge: 'Most Valuable Modern',
    badgeColor: 'bg-orange-900/60 text-orange-400 border-orange-700/40',
    writeup: "Upper Deck's 2003-04 Exquisite Collection was the most premium rookie card set ever produced at the time — $500 per pack, numbered to 99, on-card autograph, game-used patch. LeBron James was the #1 pick in the most anticipated draft since Shaquille O'Neal. The Exquisite RPA combines the rarest card in the set with the most anticipated player in NBA history. A BGS 9.5 example sold for $5,200,000 in April 2021 — the most expensive modern basketball card ever sold.",
    marketContext: 'The Exquisite RPA sold for $5.2M at peak pandemic market. Mid-grade examples are in the $50,000-200,000 range, which is still extraordinary for a modern card. LeBron broke the all-time NBA scoring record in 2023 — the kind of achievement that permanently elevates card values.',
    investmentThesis: "LeBron will be discussed alongside Jordan for the GOAT title for the next 50 years. His cards are the primary investment vehicle for that debate. The Exquisite RPA's /99 numbering and on-card autograph make it the definitive rookie. At any price point that gives you access to this card, you're buying the most important modern basketball collecting story.",
    slug: '2003-04-exquisite-lebron-james-78',
  },
  {
    week: 'Week 3',
    date: 'Feb 3, 2026',
    title: 'Gold Stars Were Worth the Hunt',
    cardName: 'Rayquaza Gold Star — EX Deoxys (2005)',
    category: 'pokemon',
    currentValue: '$3,000–$45,100 (grade-dependent)',
    badge: 'EX Era',
    badgeColor: 'bg-emerald-900/60 text-emerald-400 border-emerald-700/40',
    writeup: "EX Deoxys shipped in 2005 when the Pokémon TCG was between hype cycles — the Base Set nostalgia had faded, and the modern era of massive chase cards hadn't arrived yet. Kids opened packs for the game, not the collection. Gold Star cards were seeded approximately one per 72-pack booster box, and the Rayquaza Gold Star featured the sky serpent in a dynamic diving pose against a full-card holo background. It's one of the most visually striking cards from any era. A PSA 10 sold for $45,100 in January 2022.",
    marketContext: 'EX era cards are the most undervalued major collecting segment in Pokémon. Most collectors focus on Base Set vintage or modern SIRs, leaving EX era cards at prices that reflect their actual scarcity. Rayquaza Gold Star PSA 10 at $45K is remarkable value relative to comparable-scarcity vintage cards.',
    investmentThesis: 'The EX era produced genuinely scarce high-quality cards with very low PSA 10 populations. The Gold Stars in particular — roughly one per box across multiple sets — have print runs so small that the PSA 10 populations are in double digits for most of them. As vintage collectors exhaust Base Set opportunities, the EX era is the natural next move.',
  },
  {
    week: 'Week 2',
    date: 'Jan 27, 2026',
    title: 'Modern Hockey\'s Most Investable Card',
    cardName: '2015-16 Upper Deck Young Guns Connor McDavid #201',
    category: 'sports',
    sport: 'hockey',
    currentValue: '$300–$75,000 (grade-dependent)',
    badge: 'Generational Talent',
    badgeColor: 'bg-cyan-900/60 text-cyan-400 border-cyan-700/40',
    writeup: "McDavid won the Hart Trophy as league MVP in his second season at age 20. He's won it 4 times before 30 — the same total as Gretzky through his age-30 season. His Young Guns rookie from the 2015-16 Upper Deck set is the most watched card in modern hockey. The hockey card market is the most undervalued major sports card segment; Canadian collectors have deep pockets, and McDavid's performance trajectory has only improved the underlying thesis since the card was first published.",
    marketContext: 'A PSA 10 Young Guns sold for $75,000 in November 2021. The card has corrected to $10,000-20,000 range for PSA 10, with the pandemic premium deflating. Mid-grade copies (PSA 8-9) are available for $500-3,000 — exceptionally reasonable for a card tied to a player of this stature.',
    investmentThesis: 'McDavid is 28 in 2026. He has 5-10 peak years remaining. Every Hart Trophy win, every scoring title, every deep playoff run adds to the narrative. The Young Guns card is the canonical RC and trades on a collector base that is growing as hockey expands in the United States. Current prices may look very low in 10 years.',
    slug: '2017-18-upper-deck-young-guns-connor-mcdavid-451',
  },
  {
    week: 'Week 1',
    date: 'Jan 20, 2026',
    title: 'The Rookie That\'s Always Worth Something',
    cardName: '1986-87 Fleer Michael Jordan #57',
    category: 'sports',
    sport: 'basketball',
    currentValue: '$3,000–$738,000 (grade-dependent)',
    badge: 'GOAT Card',
    badgeColor: 'bg-orange-900/60 text-orange-400 border-orange-700/40',
    writeup: "The 1986-87 Fleer set is the most important basketball card set ever produced. Jordan's card — numbered 57 — features him mid-dunk in a composition that defines the card hobby's visual language for basketball. The red border makes centering and corner wear instantly visible, which is why PSA 10 copies are so rare — the population is ~400 out of millions of submissions. A PSA 10 sold for $738,000 in April 2021. The card exists at every price point from $50 (heavily played) to hundreds of thousands, making it one of the most accessible blue-chip cards in the hobby.",
    marketContext: 'Jordan cards are the safest position in basketball collecting. 6 titles, 6 Finals MVPs, GOAT status that has held for 30 years. The Fleer RC specifically benefits from the structural rarity of PSA 10 copies and the emotional resonance of being the actual first mainstream Jordan card. PSA 7-8 copies at $3,000-15,000 are accessible to most serious collectors.',
    investmentThesis: "Jordan's legacy is permanent. His cards are held by institutional collectors who don't panic sell. The Fleer RC has survived multiple market cycles and always recovered. For a first-time buyer of a blue-chip sports card, a mid-grade Jordan Fleer RC is a sensible entry to the hobby's most stable market segment.",
    slug: '1986-87-fleer-michael-jordan-57',
  },
];

const categoryColor: Record<string, string> = {
  sports: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30',
  pokemon: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/30',
};

export default function CardOfTheWeekPage() {
  const featured = weeklyCards[0];
  const archive = weeklyCards.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          Updated weekly
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card of the Week</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          One card, every week. Deep write-ups on why a specific card matters — the history, the market context, and the collector thesis. Sports and Pokémon.
        </p>
      </div>

      {/* Featured — current week */}
      <div className="bg-gradient-to-br from-violet-950/40 via-gray-900/40 to-gray-900/20 border border-violet-800/30 rounded-2xl p-7 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-violet-900/60 border border-violet-700/40 text-violet-400 text-xs font-bold px-2 py-0.5 rounded-full">
            {featured.week} · Current
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColor[featured.category]}`}>
            {featured.category === 'sports' ? featured.sport : 'Pokémon'}
          </span>
          {featured.badge && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${featured.badgeColor}`}>
              {featured.badge}
            </span>
          )}
          <span className="text-gray-600 text-xs ml-auto">{featured.date}</span>
        </div>

        <h2 className="text-white text-2xl font-bold mb-1">{featured.title}</h2>
        <p className="text-gray-400 text-sm mb-5">{featured.cardName}</p>

        <div className="bg-amber-950/30 border border-amber-800/20 rounded-xl px-4 py-2 text-xs text-amber-400 mb-5 inline-block">
          Current value: {featured.currentValue}
        </div>

        <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
          <p>{featured.writeup}</p>

          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-gray-600 text-xs uppercase tracking-wide mb-2">Market Context</div>
            <p>{featured.marketContext}</p>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/20 rounded-xl p-4">
            <div className="text-emerald-400 text-xs uppercase tracking-wide mb-2">Investment Thesis</div>
            <p className="text-gray-300">{featured.investmentThesis}</p>
          </div>
        </div>

        {(featured.slug || featured.tcgId) && (
          <div className="mt-5">
            <Link
              href={featured.slug ? `/sports/${featured.slug}` : `/pokemon/cards/${featured.tcgId}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              View Card Details →
            </Link>
          </div>
        )}
      </div>

      {/* Archive */}
      <h2 className="text-xl font-bold text-white mb-5">Archive</h2>
      <div className="space-y-4">
        {archive.map(card => (
          <div key={card.week} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-gray-600 text-xs">{card.week}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColor[card.category]}`}>
                {card.category === 'sports' ? card.sport : 'Pokémon'}
              </span>
              {card.badge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
              <span className="text-gray-600 text-xs ml-auto">{card.date}</span>
            </div>

            <h3 className="text-white font-bold text-base mb-0.5">{card.title}</h3>
            <p className="text-gray-500 text-xs mb-3">{card.cardName}</p>

            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
              {card.writeup}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-amber-400 text-xs">{card.currentValue}</span>
              {(card.slug || card.tcgId) && (
                <Link
                  href={card.slug ? `/sports/${card.slug}` : `/pokemon/cards/${card.tcgId}`}
                  className="text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors"
                >
                  View card →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-2">Explore More</h3>
        <div className="flex flex-wrap gap-3 mt-3">
          <Link href="/guides/most-valuable-sports-cards" className="inline-flex items-center gap-2 bg-amber-950/40 border border-amber-800/30 hover:border-amber-600/50 text-amber-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            🏆 Most Valuable Sports Cards
          </Link>
          <Link href="/guides/most-valuable-pokemon-cards" className="inline-flex items-center gap-2 bg-yellow-950/40 border border-yellow-800/30 hover:border-yellow-600/50 text-yellow-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            ⚡ Most Valuable Pokémon Cards
          </Link>
          <Link href="/guides" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            All Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
