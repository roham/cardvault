import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '50 Best Sports Cards Under $100 — Affordable Collecting Guide',
  description: 'The 50 best sports cards you can actually buy for under $100. Rookie cards, vintage commons, and modern hits that punch above their price. PSA 9 prices, why each card matters, and where to buy.',
  keywords: ['sports cards under 100 dollars', 'affordable sports cards', 'cheap rookie cards', 'best sports cards to collect', 'budget card collecting'],
};

interface BudgetCard {
  rank: number;
  name: string;
  set: string;
  player: string;
  sport: 'basketball' | 'baseball' | 'football' | 'hockey' | 'pokemon';
  psa9Price: string;
  rawPrice: string;
  why: string;
  slug?: string;
  buyTip: string;
}

const sportColor: Record<string, string> = {
  basketball: 'text-orange-400 bg-orange-950/40 border-orange-800/30',
  baseball: 'text-blue-400 bg-blue-950/40 border-blue-800/30',
  football: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30',
  hockey: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/30',
  pokemon: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/30',
};

const sportLabel: Record<string, string> = {
  basketball: 'Basketball',
  baseball: 'Baseball',
  football: 'Football',
  hockey: 'Hockey',
  pokemon: 'Pokémon',
};

const cards: BudgetCard[] = [
  {
    rank: 1,
    name: '1989-90 Hoops David Robinson #138 RC',
    set: '1989-90 NBA Hoops',
    player: 'David Robinson',
    sport: 'basketball',
    psa9Price: '$15–$35',
    rawPrice: '$2–$5',
    why: 'The Admiral\'s rookie. Robinson put up Hall of Fame numbers for 14 seasons and this Hoops RC is one of the most undervalued HOF rookies in the hobby. Abundant supply means affordable PSA 9s — the condition floor is the entire value driver.',
    buyTip: 'Search eBay sold listings for PSA 9. Raw copies in nice shape are worth submitting at $10 cost — PSA 9s sell for 3–5x raw price.',
  },
  {
    rank: 2,
    name: '1990-91 SkyBox Larry Bird #10',
    set: '1990-91 SkyBox',
    player: 'Larry Bird',
    sport: 'basketball',
    psa9Price: '$20–$50',
    rawPrice: '$3–$8',
    why: 'Late-career Bird in the flashy SkyBox set. His 1986 Fleer is out of budget, but this card captures one of the greatest players ever at a price anyone can access. Strong PSA registry presence keeps the market honest.',
    buyTip: 'Raw copies come in great condition regularly. SkyBox cards printed with decent quality — easier to hit PSA 9 than mid-80s sets.',
  },
  {
    rank: 3,
    name: '1992-93 Topps Shaquille O\'Neal #362 RC',
    set: '1992-93 Topps',
    player: "Shaquille O'Neal",
    sport: 'basketball',
    psa9Price: '$25–$60',
    rawPrice: '$5–$12',
    why: 'Shaq\'s Topps RC from his rookie season. Ultra and SkyBox versions exist too, but the Topps base is the most widely collected. The dominant center of his era and a clear first-ballot HOFer — the card will always have a floor.',
    slug: '1992-93-topps-shaquille-oneal-362-rc',
    buyTip: 'Centering is the main grading challenge on early 90s Topps. Look for raw copies with tight centering — most reject PSA 9 attempts are centering misses.',
  },
  {
    rank: 4,
    name: '1996-97 Topps Chrome Kobe Bryant #138 RC',
    set: '1996-97 Topps Chrome',
    player: 'Kobe Bryant',
    sport: 'basketball',
    psa9Price: '$60–$95',
    rawPrice: '$15–$30',
    why: 'Chrome technology applied to Kobe\'s rookie year — shiny, sharp, and genuinely undervalued for a top-5 player all time. The base Chrome RC sits just under $100 in PSA 9 while being one of the most recognizable rookie cards in basketball.',
    slug: '1996-97-topps-chrome-kobe-bryant-138-rc',
    buyTip: 'At $60–95 for PSA 9, this is arguably the best value HOF card in the entire hobby at this price point. Do not overthink it.',
  },
  {
    rank: 5,
    name: '2003-04 Topps Chrome Dwyane Wade #115 RC',
    set: '2003-04 Topps Chrome',
    player: 'Dwyane Wade',
    sport: 'basketball',
    psa9Price: '$30–$65',
    rawPrice: '$8–$18',
    why: '3× NBA champion, 13× All-Star, Hall of Famer. Wade\'s Chrome RC is routinely overlooked because 2003-04 was LeBron\'s rookie year. That class pressure is your opportunity — you get a career great at a discount.',
    buyTip: 'The LeBron shadow effect is real and persistent. Wade\'s Chrome RC is statistically superior to many cards at 2–3× the price.',
  },
  {
    rank: 6,
    name: '1997-98 Topps Chrome Tracy McGrady #115 RC',
    set: '1997-98 Topps Chrome',
    player: 'Tracy McGrady',
    sport: 'basketball',
    psa9Price: '$25–$55',
    rawPrice: '$6–$15',
    why: 'T-Mac put up some of the most jaw-dropping scoring seasons in NBA history. Two-time scoring champion, seven All-Star appearances, Hall of Famer. His Chrome RC is perpetually cheap because injuries cut his career short — but the card is fundamentally undervalued.',
    buyTip: 'Undervalued relative to comparable HOF RCs. A card for collectors who study the player, not the market.',
  },
  {
    rank: 7,
    name: '1986-87 Fleer Clyde Drexler #27',
    set: '1986-87 Fleer',
    player: 'Clyde Drexler',
    sport: 'basketball',
    psa9Price: '$50–$90',
    rawPrice: '$12–$25',
    why: 'Same set as Jordan\'s legendary rookie, Drexler\'s card from 1986-87 Fleer is a genuine vintage basketball card at a fraction of comparable players. Hall of Famer, 10× All-Star, NBA champion. The set itself has appreciation tailwinds beyond any individual player.',
    buyTip: 'Any 1986-87 Fleer card is a legitimate vintage basketball collectible. Drexler is the best value player remaining under $100.',
  },
  {
    rank: 8,
    name: '1986-87 Fleer Karl Malone #68',
    set: '1986-87 Fleer',
    player: 'Karl Malone',
    sport: 'basketball',
    psa9Price: '$40–$75',
    rawPrice: '$8–$20',
    why: 'The Mailman. Second all-time scorer at retirement. Two-time MVP. His 1986-87 Fleer card is from the same iconic set as Jordan and puts a two-time scoring champion in your collection for under $100.',
    buyTip: 'Pair with Stockton from the same set for a complete Jazz dynasty collection under $200 total.',
  },
  {
    rank: 9,
    name: '2009-10 Topps Stephen Curry #321 RC',
    set: '2009-10 Topps',
    player: 'Stephen Curry',
    sport: 'basketball',
    psa9Price: '$50–$90',
    rawPrice: '$15–$35',
    why: '4× NBA champion, 2× MVP (including unanimous). The Topps base RC is the most affordable Curry rookie in PSA slab form. His Panini RCs and Chrome versions trade much higher — this entry point gets you a legitimate Curry RC under $100.',
    buyTip: 'This is the floor entry for a multi-time champion and arguably the greatest shooter in NBA history. The floor feels solid.',
  },
  {
    rank: 10,
    name: '2010-11 Panini Paul George #270 RC',
    set: '2010-11 Panini',
    player: 'Paul George',
    sport: 'basketball',
    psa9Price: '$15–$30',
    rawPrice: '$3–$7',
    why: '9× All-Star, perennial All-NBA and DPOY candidate. PG\'s rookie card is criminally cheap — if he stays healthy he\'s a Hall of Fame case. High ceiling, rock-bottom floor.',
    buyTip: 'Buy raw in VG-EX condition and hold. The risk/reward on a potential HOFer at $3–7 raw is asymmetric in your favor.',
  },
  {
    rank: 11,
    name: '1993 SP Derek Jeter #279 RC',
    set: '1993 SP',
    player: 'Derek Jeter',
    sport: 'baseball',
    psa9Price: '$70–$95',
    rawPrice: '$15–$40',
    why: 'One of the most recognizable baseball RCs of the modern era. 5× World Series champion, 14× All-Star, Hall of Famer. The SP foil design holds up 30+ years later. PSA 9s frequently trade at $70–80 — a legitimate Jeter RC for under $100.',
    slug: '1993-sp-derek-jeter-279-rc',
    buyTip: 'The 1993 SP is a genuine key rookie — not a common. Budget for PSA grading if buying raw; centering affects value significantly.',
  },
  {
    rank: 12,
    name: '1989 Upper Deck Ken Griffey Jr. #1 RC',
    set: '1989 Upper Deck',
    player: 'Ken Griffey Jr.',
    sport: 'baseball',
    psa9Price: '$50–$85',
    rawPrice: '$10–$25',
    why: 'The most culturally significant baseball rookie of the junk wax era. Card #1 in the Upper Deck set. The Kid put up Hall of Fame numbers while becoming the face of baseball for a generation. PSA 9 remains accessible under $100.',
    slug: '1989-upper-deck-ken-griffey-jr-1',
    buyTip: 'High-population PSA 9 means consistent supply. Buy from sellers with strong feedback and compare centering on multiple copies before committing.',
  },
  {
    rank: 13,
    name: '1984 Donruss Don Mattingly #248 RC',
    set: '1984 Donruss',
    player: 'Don Mattingly',
    sport: 'baseball',
    psa9Price: '$40–$75',
    rawPrice: '$8–$18',
    why: 'Donnie Baseball. 6× Gold Glove, batting champion, MVP. The 1984 Donruss RC is a true short-print rookie — Mattingly was added late in the print run, making his RC genuinely scarcer than most junk wax cards.',
    buyTip: 'Condition is everything on 1984 Donruss. The cardstock is soft and susceptible to chipping. Only buy clean copies.',
  },
  {
    rank: 14,
    name: '1990 Leaf Sammy Sosa #220 RC',
    set: '1990 Leaf',
    player: 'Sammy Sosa',
    sport: 'baseball',
    psa9Price: '$20–$45',
    rawPrice: '$4–$10',
    why: 'The 1990 Leaf set was premium for its time — better stock and print quality than competitors. Sosa\'s home run records remain in the books. His RC from this premium set at under $50 PSA 9 is a historical baseball piece at a low cost.',
    buyTip: 'Leaf 1990 grades well compared to similar-era Topps/Donruss. Look for PSA submissions rather than raw to get consistent quality.',
  },
  {
    rank: 15,
    name: '2001 Topps Albert Pujols #331 RC',
    set: '2001 Topps',
    player: 'Albert Pujols',
    sport: 'baseball',
    psa9Price: '$55–$90',
    rawPrice: '$12–$28',
    why: '3× MVP, 2× World Series champion, 700+ career home runs, Hall of Famer. Pujols is arguably the greatest right-handed hitter in history and his Topps RC is still accessible under $100 in PSA 9. A generational talent whose card market is undervalued long-term.',
    buyTip: 'First-year 2001 Topps has well-documented production quality. PSA 9s are attainable from nice raw copies — worth submitting.',
  },
  {
    rank: 16,
    name: '2001 Bowman Chrome Ichiro Suzuki #340 RC',
    set: '2001 Bowman Chrome',
    player: 'Ichiro Suzuki',
    sport: 'baseball',
    psa9Price: '$60–$90',
    rawPrice: '$15–$35',
    why: 'Ichiro holds the MLB single-season hit record (262), 10× Gold Gloves, 10× batting titles, Hall of Famer. His Chrome RC is a genuine key piece just inside the $100 ceiling. The Japanese legend brought a unique playing style that elevated the entire game.',
    buyTip: 'Chrome holds grade well. Look for PSA 9 copies without print lines, which affect the reflective surface more than matte cardstock.',
  },
  {
    rank: 17,
    name: '1999 Bowman Chrome Alex Rodriguez #350 RC',
    set: '1999 Bowman Chrome',
    player: 'Alex Rodriguez',
    sport: 'baseball',
    psa9Price: '$25–$55',
    rawPrice: '$6–$15',
    why: '696 career home runs, 10× Gold Glove, 3× MVP. The PED controversy suppresses A-Rod\'s market permanently — which means the greatest statistical shortstop in history is perpetually cheap. The Chrome RC at $25–55 in PSA 9 is a collectors\' choice, not a speculators\'.',
    buyTip: 'Pure collectors play. Buy for the stats, not the Hall of Fame trajectory. At this price, the downside is limited.',
  },
  {
    rank: 18,
    name: '2011 Topps Update Mike Trout #US175 RC',
    set: '2011 Topps Update',
    player: 'Mike Trout',
    sport: 'baseball',
    psa9Price: '$55–$90',
    rawPrice: '$20–$40',
    why: 'Trout\'s most accessible true rookie. The Bowman Chrome auto is $1,000+; this Topps base RC is the same player, same season, same rookie designation — at a fraction of the cost. Best player of his generation by WAR and still active.',
    slug: '2011-topps-update-mike-trout-us175-rc',
    buyTip: 'High-print-run set means PSA 9 supply is steady. Centering and corner wear are the grade killers — inspect carefully before buying raw.',
  },
  {
    rank: 19,
    name: '2013 Topps Yasiel Puig #328 RC',
    set: '2013 Topps',
    player: 'Yasiel Puig',
    sport: 'baseball',
    psa9Price: '$10–$20',
    rawPrice: '$2–$5',
    why: 'The Wild Horse. Puig\'s arrival in 2013 was one of the most electric debut seasons in recent memory. His card remains a nostalgic piece for baseball fans who watched that Dodgers run. Cheap enough to collect multiple grades.',
    buyTip: 'Pure nostalgia play at this price. Buy a PSA 8 and a PSA 9 and enjoy the collection without breaking budget.',
  },
  {
    rank: 20,
    name: '2016 Topps Chrome Corey Seager #3 RC',
    set: '2016 Topps Chrome',
    player: 'Corey Seager',
    sport: 'baseball',
    psa9Price: '$15–$35',
    rawPrice: '$4–$10',
    why: '2× World Series champion, World Series MVP. Seager\'s Chrome RC is affordable for a player with rings and hardware. The Texas deal made him a centerpiece of a winning franchise — long-term floor is solid.',
    buyTip: 'Chrome grades consistently. This is a buy-and-hold RC for a player likely to stay in contention through his prime.',
  },
  {
    rank: 21,
    name: '2000 Bowman Tom Brady #236 RC',
    set: '2000 Bowman',
    player: 'Tom Brady',
    sport: 'football',
    psa9Price: '$80–$95',
    rawPrice: '$20–$45',
    why: 'GOAT. 7× Super Bowl champion. The Bowman RC is the most affordable of Brady\'s recognized rookie cards — the Playoff Contenders auto is $5,000+, the Stadium Club is $1,000+. This base Bowman RC gets you a Brady rookie under $100.',
    slug: '2000-bowman-tom-brady-236-rc',
    buyTip: 'The price ceiling has been tested. At $80–95 for PSA 9, this is not a speculation play — it\'s a genuine collectible with a hard floor set by the greatest QB ever.',
  },
  {
    rank: 22,
    name: '2000 Score Tom Brady #316 RC',
    set: '2000 Score',
    player: 'Tom Brady',
    sport: 'football',
    psa9Price: '$45–$75',
    rawPrice: '$10–$22',
    why: 'Brady\'s Score RC is the most budget-friendly of the three major 2000 Brady base rookies. Same year, same designation, cheaper entry because Score is a lower-tier set than Bowman. The player\'s legacy is identical.',
    slug: '2000-score-tom-brady-316-rc',
    buyTip: 'If $80 for the Bowman stretches your budget, the Score RC at $45–55 is the same career in a different wrapper.',
  },
  {
    rank: 23,
    name: '2004 Topps Eli Manning #350 RC',
    set: '2004 Topps',
    player: 'Eli Manning',
    sport: 'football',
    psa9Price: '$20–$40',
    rawPrice: '$5–$12',
    why: '2× Super Bowl champion, 2× Super Bowl MVP. Eli beat Brady twice in the Super Bowl — a career accomplishment that guarantees his legacy regardless of regular-season stats. His RC is perpetually undervalued relative to his championship résumé.',
    buyTip: 'Two SB MVPs at $20–40 in PSA 9 is objectively cheap. A collector\'s card, not a hype card.',
  },
  {
    rank: 24,
    name: '2006 Topps Reggie Bush #268 RC',
    set: '2006 Topps',
    player: 'Reggie Bush',
    sport: 'football',
    psa9Price: '$15–$30',
    rawPrice: '$3–$7',
    why: 'One of the most electrifying players of his era, the Heisman Trophy situation added permanent mystique. The RC is purely a collector\'s piece — buy it for what it represents in college football history, not NFL stats.',
    buyTip: 'Cheap enough to buy multiple. A unique piece for anyone who watched the 2005 USC season.',
  },
  {
    rank: 25,
    name: '2018 Prizm Lamar Jackson #209 RC',
    set: '2018 Panini Prizm',
    player: 'Lamar Jackson',
    sport: 'football',
    psa9Price: '$50–$90',
    rawPrice: '$12–$28',
    why: '2× MVP, unanimous first-ballot MVP in 2023. Jackson redefined the QB position. The base Prizm RC sits at the edge of this guide\'s budget in PSA 9 — a two-time MVP for under $100 is the definition of accessible value.',
    slug: '2018-panini-prizm-lamar-jackson-209-rc',
    buyTip: 'The Silver Prizm parallel runs $400–600+. The base Prizm RC at $50–90 captures the same player at a fraction. Excellent entry point.',
  },
  {
    rank: 26,
    name: '2018 Prizm Josh Allen #202 RC',
    set: '2018 Panini Prizm',
    player: 'Josh Allen',
    sport: 'football',
    psa9Price: '$55–$90',
    rawPrice: '$15–$30',
    why: 'The most exciting QB in football. Allen\'s arm talent and rushing ability make him a perennial MVP candidate. The base Prizm RC just makes the $100 ceiling in PSA 9 — an affordable entry into the most talked-about young franchise QB.',
    slug: '2018-panini-prizm-josh-allen-202-rc',
    buyTip: 'High demand, consistent supply in PSA 9. Don\'t overpay — be patient on the price and wait for the right sold listing to anchor your purchase.',
  },
  {
    rank: 27,
    name: '2020 Prizm Justin Herbert #304 RC',
    set: '2020 Panini Prizm',
    player: 'Justin Herbert',
    sport: 'football',
    psa9Price: '$30–$60',
    rawPrice: '$8–$18',
    why: 'Offensive Rookie of the Year. Broke Drew Brees\'s rookie TD record. Talented enough that Chargers fans are still bitter about never getting the full playoff run he deserves. Base Prizm RC is a clean, affordable entry into his market.',
    buyTip: 'Win-now market. Herbert\'s RC pops when the Chargers make a playoff run — accumulate now and hold through the post-season.',
  },
  {
    rank: 28,
    name: '2020 Prizm Joe Burrow #306 RC',
    set: '2020 Panini Prizm',
    player: 'Joe Burrow',
    sport: 'football',
    psa9Price: '$40–$75',
    rawPrice: '$10–$22',
    why: 'Super Bowl appearance in year 2. Elite accuracy, franchise QB. The Bengals\' success directly drives Burrow card values — PSA 9 base Prizm under $100 is a legitimate hold for a young QB in his prime.',
    slug: '2020-panini-prizm-joe-burrow-306-rc',
    buyTip: 'Buy before playoff runs, not during. The market spikes 20–30% when Cincinnati is on a run — accumulate in the offseason.',
  },
  {
    rank: 29,
    name: '2021 Prizm Mac Jones #338 RC',
    set: '2021 Panini Prizm',
    player: 'Mac Jones',
    sport: 'football',
    psa9Price: '$10–$20',
    rawPrice: '$2–$5',
    why: 'Pure upside play. Jones has the pedigree (Patriots, Belichick system) and the ceiling if he lands in the right situation. At $10–20 in PSA 9, the cost of being wrong is a rounding error.',
    buyTip: 'Risk/reward at this price is extraordinary. Even a 50% miss rate is acceptable when the upside is a starting QB who hits.',
  },
  {
    rank: 30,
    name: '2022 Prizm Brock Purdy #317 RC',
    set: '2022 Panini Prizm',
    player: 'Brock Purdy',
    sport: 'football',
    psa9Price: '$20–$45',
    rawPrice: '$5–$12',
    why: 'Mr. Irrelevant turned NFC Championship starter. Purdy\'s card market is entirely driven by continued 49ers success — but at $20–45 in PSA 9, you\'re buying a starting NFL QB at a price point that reflects zero expected value. The upside from here is real.',
    buyTip: 'The cheapest card of an active starting QB in a top offense in the NFC. That fact alone makes it interesting.',
  },
  {
    rank: 31,
    name: '1984 Topps Dan Marino #123 RC',
    set: '1984 Topps',
    player: 'Dan Marino',
    sport: 'football',
    psa9Price: '$65–$95',
    rawPrice: '$15–$35',
    why: 'The greatest pure passer in NFL history by many measures. Single-season TD and yardage records that stood for 20 years. Marino\'s Topps RC is a genuine vintage football piece just inside the $100 ceiling in PSA 9 — rare for a HOF quarterback.',
    slug: '1984-topps-dan-marino-123-rc',
    buyTip: 'Buy it. At $65–95 for a Marino PSA 9 RC, there is no better value ratio for a Hall of Fame QB. The 1984 Topps set grades harder than you expect — centering is the challenge.',
  },
  {
    rank: 32,
    name: '1984 Topps USFL Steve Young #52 RC',
    set: '1984 Topps USFL',
    player: 'Steve Young',
    sport: 'football',
    psa9Price: '$30–$55',
    rawPrice: '$6–$15',
    why: 'Steve Young\'s first mainstream card — from his USFL days before the NFL. Hall of Famer, Super Bowl champion, 3× passing champion, and the man who replaced Montana. The USFL context makes this unique in any collection.',
    buyTip: 'USFL cards are a distinct niche with dedicated collectors. The Young USFL RC has more upside than most collectors realize.',
  },
  {
    rank: 33,
    name: '1991 Pro Set Brett Favre #762 RC',
    set: '1991 Pro Set',
    player: 'Brett Favre',
    sport: 'football',
    psa9Price: '$25–$55',
    rawPrice: '$5–$12',
    why: '3× consecutive MVP. 297 consecutive starts. Super Bowl champion. Favre\'s 1991 Pro Set RC is the most collected of his early cards and a staple for any football collection. The man played through injuries that would end other careers.',
    buyTip: 'Pro Set quality is inconsistent — inspect corners and surface carefully before buying raw. PSA-slabbed copies take the guesswork out.',
  },
  {
    rank: 34,
    name: '1999 Topps Donovan McNabb #333 RC',
    set: '1999 Topps',
    player: 'Donovan McNabb',
    sport: 'football',
    psa9Price: '$15–$30',
    rawPrice: '$3–$7',
    why: 'Five NFC Championship games, one Super Bowl appearance, Hall of Famer. McNabb\'s career is objectively underappreciated by the market. His RC at $15–30 in PSA 9 is a legitimate Hall of Fame quarterback at a trivial price.',
    buyTip: 'Obvious value gap here. HOF QB at $15–30 PSA 9. The Eagles fanbase keeps this card visible — demand exists.',
  },
  {
    rank: 35,
    name: '1990-91 O-Pee-Chee Jaromir Jagr #11 RC',
    set: '1990-91 OPC',
    player: 'Jaromir Jagr',
    sport: 'hockey',
    psa9Price: '$40–$75',
    rawPrice: '$8–$20',
    why: '766 career goals — second all-time behind only Gretzky. 5× Stanley Cup champion. 9× scoring champion. Jagr\'s OPC RC is one of the best value propositions in hockey — a top-5 scorer ever available under $100 in PSA 9.',
    buyTip: 'OPC grades harder than Topps from the same era due to rougher card stock edges. Expect more PSA 8s in the population — which is why PSA 9 commands a premium.',
  },
  {
    rank: 36,
    name: '1990-91 Upper Deck Eric Lindros #525 RC',
    set: '1990-91 Upper Deck',
    player: 'Eric Lindros',
    sport: 'hockey',
    psa9Price: '$20–$40',
    rawPrice: '$5–$12',
    why: 'The Big E. Lindros was supposed to be the next Gretzky — the most physically dominant player in a generation. Injuries derailed the arc, but his 1990-91 UD RC captures the full weight of that expectation. Hall of Famer and a career tragically cut short.',
    buyTip: 'The injuries-vs-potential narrative keeps the price suppressed vs. his talent level. A clear buy for anyone who watched early 90s hockey.',
  },
  {
    rank: 37,
    name: '2005-06 Upper Deck Sidney Crosby #201 YG RC',
    set: '2005-06 Upper Deck',
    player: 'Sidney Crosby',
    sport: 'hockey',
    psa9Price: '$65–$95',
    rawPrice: '$20–$45',
    why: '3× Stanley Cup champion, 2× Hart Trophy, 2× Rocket Richard Trophy. Crosby is the face of modern hockey. His Young Guns RC sits right at the $100 ceiling in PSA 9 — the most accessible entry point for the best player of his era.',
    buyTip: 'The Young Guns format makes high grades difficult — card stock takes damage in packs. PSA 9 is the sweet spot for price vs. grade premium.',
  },
  {
    rank: 38,
    name: '2007-08 O-Pee-Chee Alex Ovechkin #35',
    set: '2007-08 O-Pee-Chee',
    player: 'Alex Ovechkin',
    sport: 'hockey',
    psa9Price: '$20–$40',
    rawPrice: '$4–$10',
    why: 'All-time goal-scoring leader. Ovi broke Gretzky\'s record and kept going. His 2005-06 RC is $200+ in PSA 9, but this later OPC card captures him during his prime scoring seasons at a fraction of the entry price.',
    buyTip: 'For budget collectors, this is the Ovechkin card. The man scored 65 goals in a season — his cards belong in every collection.',
  },
  {
    rank: 39,
    name: '2010-11 Upper Deck Taylor Hall #245 YG RC',
    set: '2010-11 Upper Deck',
    player: 'Taylor Hall',
    sport: 'hockey',
    psa9Price: '$20–$40',
    rawPrice: '$5–$12',
    why: 'Hart Trophy winner, #1 overall pick. Hall\'s career never matched the draft position hype, but his Young Guns RC is a clean, affordable piece for any hockey collection. The 2010-11 UD Young Guns class is deep with talent.',
    buyTip: 'Any top-10 overall draft pick in hockey will always have collector demand. Hall is no exception.',
  },
  {
    rank: 40,
    name: '2015-16 Upper Deck Connor McDavid #201 YG RC',
    set: '2015-16 Upper Deck',
    player: 'Connor McDavid',
    sport: 'hockey',
    psa9Price: '$80–$95',
    rawPrice: '$25–$50',
    why: 'The next one. McDavid is a generational talent — multiple Hart Trophies, Art Ross Trophies, Rocket Richard Trophy, MVP every season he stays healthy. The YG RC in PSA 9 just makes the $100 mark. This is the most important hockey RC of the 2010s decade.',
    buyTip: 'Buy raw and submit if you\'re confident in condition assessment. PSA 9 is achievable but not easy on YG format cards — centering and corner sharpness are critical.',
  },
  {
    rank: 41,
    name: '2003-04 Parkhurst Patrick Roy #97',
    set: '2003-04 Parkhurst',
    player: 'Patrick Roy',
    sport: 'hockey',
    psa9Price: '$15–$30',
    rawPrice: '$4–$8',
    why: 'Saint Patrick. 4× Stanley Cup champion, 3× Conn Smythe, 3× Vezina. Roy is the greatest goaltender in hockey history — and this card is under $30 in PSA 9. For any hockey collection, owning Roy is non-negotiable.',
    buyTip: 'His 1986-87 OPC RC is $200+ in PSA 9. This card gives you Roy in your collection without the premium.',
  },
  {
    rank: 42,
    name: '1999 Pokémon Base Set Venusaur #15 Holo',
    set: 'Base Set (Unlimited)',
    player: 'Venusaur',
    sport: 'pokemon',
    psa9Price: '$40–$70',
    rawPrice: '$10–$25',
    why: 'The most undervalued of the original three starters. Charizard gets the headlines and Blastoise gets the Pokémon #2 treatment, but Venusaur quietly holds real value. The original Base Set holo in PSA 9 is a legitimate vintage piece.',
    buyTip: 'The Venusaur discount vs. Charizard is structural — it\'s always been the third-most-sought starter. That gap makes Venusaur the better value play long-term.',
  },
  {
    rank: 43,
    name: '1999 Pokémon Base Set Ninetales #12 Holo',
    set: 'Base Set (Unlimited)',
    player: 'Ninetales',
    sport: 'pokemon',
    psa9Price: '$25–$50',
    rawPrice: '$6–$15',
    why: 'One of the most visually stunning cards in the original Base Set. Ninetales holo artwork is widely considered among the best in the set. Non-rare holos from Base Set are frequently overlooked — this is the collector\'s pick.',
    buyTip: 'The non-starter holos from Base Set are a collector\'s value play that gets overlooked when everyone focuses on Charizard. Ninetales, Nidoking, Magneton — all legitimate vintage pieces.',
  },
  {
    rank: 44,
    name: '1999 Pokémon Fossil Gengar #5 Holo',
    set: 'Fossil (Unlimited)',
    player: 'Gengar',
    sport: 'pokemon',
    psa9Price: '$30–$60',
    rawPrice: '$8–$20',
    why: 'Ghost-type king of the original sets. The Fossil Gengar holo is a fan-favorite card with a dedicated collector base. Fossil set cards are harder to find in clean condition than Base Set, making PSA 9 population tighter than the price suggests.',
    slug: '1999-pokemon-fossil-gengar-5-holo',
    buyTip: 'Fossil holos grade harder than Base Set. If you find a raw copy in excellent shape, submitting is worth the PSA fee.',
  },
  {
    rank: 45,
    name: '2002 Pokémon Expedition Charizard #6 Holo',
    set: 'Expedition (2002)',
    player: 'Charizard',
    sport: 'pokemon',
    psa9Price: '$40–$75',
    rawPrice: '$10–$25',
    why: 'e-Card era Charizard. Expedition was the first English set to use the e-Card reader technology. This Charizard holo is often overlooked by collectors focused on Base Set, creating a genuine value opportunity for the same beloved Pokémon in a rarer, harder-to-find set.',
    buyTip: 'Expedition cards are notoriously difficult to grade — the e-Card strip on the back is often scratched. Raw copies with clean backs are the key.',
  },
  {
    rank: 46,
    name: '2022 Pokémon SV Charizard ex Special Illustration Rare',
    set: 'Scarlet & Violet 151 (2023)',
    player: 'Charizard ex',
    sport: 'pokemon',
    psa9Price: '$40–$70',
    rawPrice: '$15–$35',
    why: 'The modern collector\'s Charizard. The 151 set brought back original 151 Pokémon in stunning new art styles. The Charizard ex IR is one of the most sought-after modern Pokémon cards with breathtaking full-art illustration. PSA 9 is achievable because modern card stock grades better than vintage.',
    buyTip: 'Modern cards grade clean. A $35–40 PSA 9 on a card this visually striking is solid value for display and long-term collector demand.',
  },
  {
    rank: 47,
    name: '2016 Pokémon Sun & Moon Tapu Koko GX #31',
    set: 'Sun & Moon (2017)',
    player: 'Tapu Koko',
    sport: 'pokemon',
    psa9Price: '$15–$30',
    rawPrice: '$4–$10',
    why: 'The Sun & Moon era introduced GX mechanic cards that were competitively dominant. Tapu Koko was everywhere in competitive play — cards with tournament history tend to retain collector interest beyond their competitive window.',
    buyTip: 'Former meta staple at budget price. Good introduction to GX-era Pokémon without spending real money.',
  },
  {
    rank: 48,
    name: '2021 Pokémon Battle Styles Rapid Strike Urshifu VMAX #88',
    set: 'Battle Styles (2021)',
    player: 'Urshifu VMAX',
    sport: 'pokemon',
    psa9Price: '$15–$25',
    rawPrice: '$5–$10',
    why: 'Tournament powerhouse. Urshifu VMAX drove competition for two years. Modern VMAX cards are where the game went between GX and ex, and this is one of the best artwork pieces from that transition era.',
    buyTip: 'Budget entry into modern tournament card collecting. Clean, vivid artwork on durable modern card stock.',
  },
  {
    rank: 49,
    name: '1999 Pokémon Jungle Electrode #2 Holo',
    set: 'Jungle (Unlimited)',
    player: 'Electrode',
    sport: 'pokemon',
    psa9Price: '$20–$40',
    rawPrice: '$5–$12',
    why: 'Jungle set holos are more scarce than Base Set in graded high condition but trade at a fraction of the price. Electrode is one of the more visually clean designs in the set. A legitimate vintage Pokémon card under $40 in PSA 9.',
    buyTip: 'The Jungle set is systematically undervalued vs. Base Set. Same era, same vintage status, lower prices. The gap exists because collectors know Base Set names — Jungle requires more knowledge.',
  },
  {
    rank: 50,
    name: '2000 Pokémon Team Rocket Dark Charizard #4 Holo',
    set: 'Team Rocket (2000)',
    player: 'Dark Charizard',
    sport: 'pokemon',
    psa9Price: '$35–$65',
    rawPrice: '$8–$20',
    why: 'The evil variant. Team Rocket Dark Charizard is the alt-art Charizard before alt-arts existed. The set introduced the "Dark" Pokémon concept and Dark Charizard became an instant collectible. Under $65 in PSA 9 for a Charizard card from 2000 is a compelling data point.',
    buyTip: 'Team Rocket cards have a distinct visual identity collectors love. Dark Charizard in particular has a dedicated secondary market separate from Base Set Charizard collectors.',
  },
];

const sportGroups = [
  { sport: 'basketball', label: 'Basketball', icon: '🏀' },
  { sport: 'baseball', label: 'Baseball', icon: '⚾' },
  { sport: 'football', label: 'Football', icon: '🏈' },
  { sport: 'hockey', label: 'Hockey', icon: '🏒' },
  { sport: 'pokemon', label: 'Pokémon', icon: '⚡' },
];

export default function BestCardsUnder100Page() {
  const bySport = (sport: string) => cards.filter(c => c.sport === sport);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Budget Collecting Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          50 Best Sports Cards Under $100
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Hall of Famers, iconic rookies, and vintage classics you can actually afford. Each card includes PSA 9 price range and exactly why it belongs in your collection.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
          <span>Prices reflect 2026 eBay sold listings</span>
          <span>·</span>
          <span>PSA 9 is the sweet-spot grade for most entries</span>
          <span>·</span>
          <span>50 cards across 5 categories</span>
        </div>
      </div>

      {/* Why under $100 matters */}
      <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-gray-900/30 border border-emerald-800/30 rounded-2xl p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-2">The case for the sub-$100 collection</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          The $100K cards get the press coverage. But 90% of collectors operate under $100 per card — and the opportunities in that range are genuinely exceptional. Many Hall of Famers trade at a fraction of their historical significance. Market inefficiency benefits the informed buyer.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { label: 'Dan Marino Topps RC PSA 9', value: '$65–$95', sub: 'Hall of Fame QB, single-season TD record holder' },
            { label: 'Kobe Bryant Chrome RC PSA 9', value: '$60–$95', sub: 'Top-5 all-time, 5× NBA champion' },
            { label: 'Connor McDavid YG RC PSA 9', value: '$80–$95', sub: 'Best hockey player of his generation' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <div className="text-emerald-400 text-xl font-bold mb-1">{stat.value}</div>
              <div className="text-white text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-gray-500 text-xs">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards by sport */}
      {sportGroups.map(({ sport, label, icon }) => {
        const group = bySport(sport);
        if (!group.length) return null;
        return (
          <section key={sport} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{icon}</span>
              <h2 className="text-white text-2xl font-bold">{label}</h2>
              <span className="text-gray-500 text-sm ml-2">{group.length} picks</span>
            </div>
            <div className="space-y-4">
              {group.map(card => (
                <div key={card.rank} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="shrink-0 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 text-sm font-bold">
                      {card.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Card name + sport badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {card.slug ? (
                          <Link href={`/sports/${card.slug}`} className="text-white font-bold text-base hover:text-emerald-400 transition-colors">
                            {card.name}
                          </Link>
                        ) : (
                          <span className="text-white font-bold text-base">{card.name}</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${sportColor[card.sport]}`}>
                          {sportLabel[card.sport]}
                        </span>
                      </div>
                      {/* Set + player */}
                      <p className="text-gray-500 text-sm mb-3">
                        {card.set} · {card.player}
                      </p>
                      {/* Why */}
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{card.why}</p>
                      {/* Price + buy tip */}
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-gray-800/60 rounded-xl px-4 py-2">
                          <div className="text-xs text-gray-500 mb-0.5">PSA 9 price</div>
                          <div className="text-emerald-400 font-bold text-sm">{card.psa9Price}</div>
                        </div>
                        <div className="bg-gray-800/60 rounded-xl px-4 py-2">
                          <div className="text-xs text-gray-500 mb-0.5">Raw price</div>
                          <div className="text-gray-300 font-medium text-sm">{card.rawPrice}</div>
                        </div>
                        <div className="flex-1 min-w-[200px] bg-emerald-950/30 border border-emerald-800/20 rounded-xl px-4 py-2">
                          <div className="text-xs text-emerald-500 mb-0.5 font-medium">Buying tip</div>
                          <div className="text-gray-300 text-sm">{card.buyTip}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Grade strategy callout */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-lg mb-3">When to grade vs. when to buy slabbed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-emerald-400 font-semibold text-sm mb-2">Grade it yourself when...</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· Raw price is under $20 and PSA 9 sells for $50+</li>
              <li>· You have confidence in the condition</li>
              <li>· PSA Economy tier ($20–25/card) applies</li>
              <li>· Centering is excellent (within 55/45 front)</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-orange-400 font-semibold text-sm mb-2">Buy already-slabbed when...</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· Raw copies are consistently overgraded by sellers</li>
              <li>· The card is difficult to grade (e.g., 1984 Topps, OPC)</li>
              <li>· You need the card for a display and want certainty</li>
              <li>· PSA 9/10 price gap is small (buy 9, avoid chasing 10)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/sports" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          Browse All Sports Cards
        </Link>
        <Link href="/guides/most-valuable-sports-cards" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Most Valuable Cards
        </Link>
        <Link href="/guides/best-pokemon-investments" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Pokémon Investments Guide
        </Link>
        <Link href="/guides/fake-cards" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Spot Fake Cards
        </Link>
      </div>
    </div>
  );
}
