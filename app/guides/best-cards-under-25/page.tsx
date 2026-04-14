import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '40 Best Sports Cards Under $25 — Smart Collecting Guide',
  description: 'The 40 best sports cards you can buy for under $25. PSA-graded Hall of Famers, quality rookies, and vintage Pokémon holos that punch way above their price. PSA 9 prices, why each card matters, and where to buy.',
  keywords: ['sports cards under 25 dollars', 'cheap sports cards', 'affordable rookie cards', 'budget card collecting', 'best sports cards under 25', 'cheap PSA graded cards'],
  alternates: { canonical: './' },
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
    psa9Price: '$15–$25',
    rawPrice: '$2–$5',
    why: 'The Admiral\'s rookie card in a PSA 9 slab for under $25. Robinson put up Hall of Fame numbers for 14 seasons — two scoring titles, one MVP, two championships. This is one of the most undervalued HOF rookies in the hobby and the poster child for the sub-$25 tier.',
    buyTip: 'Search eBay sold listings for PSA 9. Raw copies in nice shape cost $2–5 and are worth submitting — PSA 9s sell for 5–10x raw price.',
  },
  {
    rank: 2,
    name: '1990-91 SkyBox Larry Bird #10',
    set: '1990-91 SkyBox',
    player: 'Larry Bird',
    sport: 'basketball',
    psa9Price: '$15–$20',
    rawPrice: '$3–$6',
    why: 'A Larry Bird card in a PSA slab for under $20. His 1986 Fleer is out of reach for most collectors, but SkyBox gives you one of the 10 greatest players in NBA history at a price anyone can access. The flashy SkyBox design has aged well.',
    buyTip: 'SkyBox cards printed with decent quality — easier to hit PSA 9 than mid-80s sets. Buy raw and submit if centering is solid.',
  },
  {
    rank: 3,
    name: '1992-93 Topps Shaquille O\'Neal #362 RC',
    set: '1992-93 Topps',
    player: "Shaquille O'Neal",
    sport: 'basketball',
    psa9Price: '$20–$25',
    rawPrice: '$5–$8',
    why: 'Shaq\'s Topps base RC — the most widely collected version of his rookie card. The dominant center of his era, 4x champion, MVP, first-ballot HOFer. At the top edge of this guide\'s budget in PSA 9, but the floor on a Shaq RC is rock solid.',
    slug: '1992-93-topps-shaquille-oneal-362',
    buyTip: 'Centering is the main grading challenge on early 90s Topps. Inspect raw copies carefully — most PSA 9 rejections are centering misses.',
  },
  {
    rank: 4,
    name: '1990-91 Fleer Scottie Pippen #30',
    set: '1990-91 Fleer',
    player: 'Scottie Pippen',
    sport: 'basketball',
    psa9Price: '$8–$15',
    rawPrice: '$2–$4',
    why: '6x NBA champion, Hall of Famer, top-50 all-time. Pippen was the second-best player on the greatest dynasty in basketball history. His 1990-91 Fleer is absurdly cheap relative to his career accomplishments — a genuine HOF card for pocket change.',
    buyTip: 'At $8–15 in PSA 9, this is one of the cheapest HOF basketball cards in existence. Buy multiple and gift them to friends who collect.',
  },
  {
    rank: 5,
    name: '1996-97 Topps Chrome Allen Iverson #171 RC',
    set: '1996-97 Topps Chrome',
    player: 'Allen Iverson',
    sport: 'basketball',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: 'The Answer. MVP, 4x scoring champion, 11x All-Star, Hall of Famer. Iverson changed the culture of the NBA and his Chrome RC is one of the most important basketball cards of the late 90s. PSA 9 sits right at the $25 ceiling — extraordinary value for a cultural icon.',
    buyTip: 'Chrome cards from 1996-97 are susceptible to surface scratching. Buy slabbed to guarantee condition rather than risking a raw submission.',
  },
  {
    rank: 6,
    name: '1993-94 Topps Anfernee Hardaway #334 RC',
    set: '1993-94 Topps',
    player: 'Anfernee Hardaway',
    sport: 'basketball',
    psa9Price: '$10–$20',
    rawPrice: '$2–$5',
    why: 'Penny Hardaway was the future of the NBA before injuries derailed everything. 4x All-Star, Olympic gold medalist, and the most exciting young player in basketball circa 1995. The card captures peak potential at a price that reflects the shortened prime.',
    buyTip: 'The injuries-vs-talent narrative suppresses this card permanently. If you appreciate the player, the price is a gift.',
  },
  {
    rank: 7,
    name: '1990-91 Hoops Isiah Thomas #111',
    set: '1990-91 NBA Hoops',
    player: 'Isiah Thomas',
    sport: 'basketball',
    psa9Price: '$5–$10',
    rawPrice: '$2–$3',
    why: '2x NBA champion, Finals MVP, 12x All-Star, Hall of Famer. Thomas led the Bad Boy Pistons to back-to-back titles and was one of the greatest point guards in history. Under $10 for a PSA 9 of a two-time champion is almost absurd.',
    buyTip: 'At this price point, buy the PSA 9 slab directly — the cost of grading a raw copy exceeds the slabbed price.',
  },
  {
    rank: 8,
    name: '1992-93 Ultra Karl Malone #175',
    set: '1992-93 Fleer Ultra',
    player: 'Karl Malone',
    sport: 'basketball',
    psa9Price: '$8–$15',
    rawPrice: '$2–$4',
    why: 'The Mailman. Second all-time scorer at retirement, 2x MVP, 14x All-Star. Malone\'s 1986-87 Fleer is $40+ in PSA 9, but this Ultra card captures the same career in a premium 90s set for a fraction. Pure collector value.',
    buyTip: 'Ultra had better card stock than base Fleer. Grades well and looks great in a slab. Pair with a Stockton for the complete Jazz duo.',
  },
  {
    rank: 9,
    name: '1991-92 Upper Deck Dikembe Mutombo #3 RC',
    set: '1991-92 Upper Deck',
    player: 'Dikembe Mutombo',
    sport: 'basketball',
    psa9Price: '$10–$20',
    rawPrice: '$2–$5',
    why: '4x Defensive Player of the Year, 8x All-Star, Hall of Famer. Mutombo\'s finger wag is one of the most iconic celebrations in sports. His Upper Deck RC is the definitive rookie card of a generational defender.',
    buyTip: 'Upper Deck quality from this era is excellent. Raw copies frequently grade PSA 9 — worth submitting at current grading costs.',
  },
  {
    rank: 10,
    name: '2003-04 Topps Chrome Carmelo Anthony #113 RC',
    set: '2003-04 Topps Chrome',
    player: 'Carmelo Anthony',
    sport: 'basketball',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: '10x All-Star, 3x Olympic gold medalist, scoring champion. Melo was the second pick in one of the greatest draft classes ever. The Chrome RC is perpetually suppressed by the LeBron shadow — same class, fraction of the price.',
    buyTip: 'The LeBron class discount is your advantage. Melo\'s Chrome RC at $15–25 PSA 9 is a legitimate HOF rookie from a legendary draft.',
  },
  {
    rank: 11,
    name: '1984 Donruss Don Mattingly #248 RC',
    set: '1984 Donruss',
    player: 'Don Mattingly',
    sport: 'baseball',
    psa9Price: '$15–$25',
    rawPrice: '$4–$8',
    why: 'Donnie Baseball. 6x Gold Glove, batting champion, MVP. The 1984 Donruss RC is a true short-print rookie — Mattingly was added late in the print run, making his RC genuinely scarcer than most junk wax cards. A real 1980s baseball icon.',
    buyTip: 'Condition is everything on 1984 Donruss. The cardstock is soft and chips easily. Only buy clean copies — or spend a bit more for the PSA slab.',
  },
  {
    rank: 12,
    name: '1986 Donruss Fred McGriff #28 RC',
    set: '1986 Donruss',
    player: 'Fred McGriff',
    sport: 'baseball',
    psa9Price: '$5–$10',
    rawPrice: '$2–$3',
    why: 'The Crime Dog. 493 career home runs — just 7 shy of 500 and the Hall of Fame line that long eluded him. McGriff finally got his due with posthumous induction. His RC at under $10 PSA 9 is one of the cheapest HOF cards in all of baseball.',
    buyTip: 'Buy the PSA 9 slab outright. At $5–10 it costs less than a grading submission. A legitimate Hall of Famer for single digits.',
  },
  {
    rank: 13,
    name: '1985 Topps Mark McGwire #401 RC',
    set: '1985 Topps',
    player: 'Mark McGwire',
    sport: 'baseball',
    psa9Price: '$10–$20',
    rawPrice: '$3–$6',
    why: 'The 1998 home run chase defined a generation of baseball fans. McGwire\'s 1985 Topps RC as a Team USA member is the most recognized rookie card from the steroid era. PED controversy keeps the price suppressed — which means 583 career HRs for $10–20.',
    buyTip: 'Pure nostalgia and history play. The 1998 season will always matter to baseball. At this price, the downside is zero.',
  },
  {
    rank: 14,
    name: '1989 Upper Deck Ken Griffey Jr. #1 RC (PSA 8)',
    set: '1989 Upper Deck',
    player: 'Ken Griffey Jr.',
    sport: 'baseball',
    psa9Price: '$15–$25',
    rawPrice: '$6–$8',
    why: 'The most culturally significant baseball rookie of the junk wax era — card #1 in the Upper Deck set. PSA 9 is above budget, but a PSA 8 of The Kid\'s iconic RC fits perfectly. Hall of Famer, 630 home runs, the sweetest swing in baseball history.',
    slug: '1989-upper-deck-ken-griffey-jr-1',
    buyTip: 'PSA 8 is the sweet spot for this card at the $25 budget. High population means consistent supply — be patient and find the right price.',
  },
  {
    rank: 15,
    name: '1993 SP Chipper Jones #280 RC',
    set: '1993 SP',
    player: 'Chipper Jones',
    sport: 'baseball',
    psa9Price: '$15–$25',
    rawPrice: '$4–$8',
    why: 'Switch-hitting Hall of Famer who spent his entire 19-year career with the Braves. MVP, 8x All-Star, .303 career average. The SP foil design holds up 30+ years later and Chipper\'s RC is a cornerstone for any 90s baseball collection.',
    buyTip: 'SP foil cards can show wear on the silver border. Look for clean edges when buying raw, or go straight for the PSA slab.',
  },
  {
    rank: 16,
    name: '1992 Bowman Mariano Rivera #302 RC',
    set: '1992 Bowman',
    player: 'Mariano Rivera',
    sport: 'baseball',
    psa9Price: '$10–$20',
    rawPrice: '$3–$6',
    why: 'The greatest closer in baseball history. 652 saves, 5x World Series champion, first unanimous Hall of Fame selection. Rivera\'s Bowman RC is shockingly cheap for a player whose career accomplishments are literally unmatched at his position.',
    buyTip: 'Unanimous HOF selection and still under $20 in PSA 9. The market systematically undervalues relief pitchers — your gain.',
  },
  {
    rank: 17,
    name: '1994 SP Alex Rodriguez #15 RC',
    set: '1994 SP',
    player: 'Alex Rodriguez',
    sport: 'baseball',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: '696 career home runs, 3x MVP, 14x All-Star. The PED controversy suppresses A-Rod\'s market permanently — the greatest statistical shortstop in history is perpetually cheap. The SP RC\'s foil design is visually striking and holds up well.',
    buyTip: 'Pure collectors\' play. Buy for the stats and the aesthetic, not the market trajectory. At this price, you own a piece of baseball history.',
  },
  {
    rank: 18,
    name: '2001 Topps Albert Pujols #331 RC',
    set: '2001 Topps',
    player: 'Albert Pujols',
    sport: 'baseball',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: '3x MVP, 2x World Series champion, 700+ career home runs, Hall of Famer. Pujols is arguably the greatest right-handed hitter in history. His base Topps RC at $15–25 in PSA 9 is one of the most undervalued HOF rookies in the hobby.',
    buyTip: '2001 Topps production quality is solid. PSA 9s are attainable from nice raw copies — worth submitting if you find a clean one.',
  },
  {
    rank: 19,
    name: '2001 Topps Ichiro Suzuki #726 RC',
    set: '2001 Topps',
    player: 'Ichiro Suzuki',
    sport: 'baseball',
    psa9Price: '$15–$20',
    rawPrice: '$5–$7',
    why: 'Ichiro holds the MLB single-season hit record (262), won 10 Gold Gloves, 10 batting titles, and brought a completely unique playing style from Japan. Hall of Famer. His Topps base RC in PSA 9 fits this guide perfectly and belongs in every baseball collection.',
    buyTip: 'The Bowman Chrome Ichiro is $60+ in PSA 9. This Topps base captures the same legend at a third of the price — the smarter entry point.',
  },
  {
    rank: 20,
    name: '1991 Topps Desert Shield Jeff Bagwell #755 RC',
    set: '1991 Topps Desert Shield',
    player: 'Jeff Bagwell',
    sport: 'baseball',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: 'The Desert Shield parallel is one of the most storied subsets in the hobby — cards sent to troops during the Gulf War. Bagwell\'s version is a Hall of Famer\'s RC with genuine historical context beyond the sport. MVP, 449 home runs, Astros legend.',
    buyTip: 'Verify the Desert Shield gold foil stamp on the front. Counterfeits exist — buy from reputable sellers or stick to PSA-slabbed copies.',
  },
  {
    rank: 21,
    name: '1984 Topps Dan Marino #123 RC (PSA 8)',
    set: '1984 Topps',
    player: 'Dan Marino',
    sport: 'football',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: 'The greatest pure passer of his era. Marino held the single-season TD and yardage records for 20 years. His Topps RC in PSA 9 is $65+, but a PSA 8 puts a genuine vintage HOF quarterback in your collection for under $25.',
    slug: '1984-topps-dan-marino-rc-123',
    buyTip: '1984 Topps grades harder than you expect — centering is brutal. PSA 8 is the realistic grade for most survivors and an excellent value.',
  },
  {
    rank: 22,
    name: '1986 Topps Jerry Rice #161 RC (PSA 7)',
    set: '1986 Topps',
    player: 'Jerry Rice',
    sport: 'football',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: 'The GOAT wide receiver. All-time leader in receptions, receiving yards, and receiving TDs. Rice\'s Topps RC in high grade is $200+, but a PSA 7 puts the greatest receiver ever in your collection at $15–25. The card, the player, the legacy — all accessible.',
    buyTip: 'PSA 7 is where Jerry Rice becomes affordable. Don\'t chase higher grades at this budget — the player is what matters.',
  },
  {
    rank: 23,
    name: '1998 Topps Chrome Peyton Manning #165 RC',
    set: '1998 Topps Chrome',
    player: 'Peyton Manning',
    sport: 'football',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: '5x MVP, 2x Super Bowl champion, Hall of Famer. Manning redefined the quarterback position with pre-snap reads and audible calls. His Chrome RC at $15–25 in PSA 9 is one of the best value HOF football cards in the entire hobby.',
    buyTip: 'A 5x MVP for $15–25 in PSA 9 Chrome. This is objectively one of the best deals in football card collecting. Buy with confidence.',
  },
  {
    rank: 24,
    name: '1990 Score Emmitt Smith #489 RC',
    set: '1990 Score',
    player: 'Emmitt Smith',
    sport: 'football',
    psa9Price: '$10–$15',
    rawPrice: '$2–$4',
    why: 'All-time NFL rushing leader. 3x Super Bowl champion, MVP, Hall of Famer. Smith\'s Score RC is the budget entry for the greatest rusher in NFL history — PSA 9 for $10–15 is almost impossible to believe for a player of this caliber.',
    buyTip: 'Score card stock from 1990 grades inconsistently. Buy the PSA 9 slab directly rather than gambling on raw submissions.',
  },
  {
    rank: 25,
    name: '1989 Score Barry Sanders #257 RC',
    set: '1989 Score',
    player: 'Barry Sanders',
    sport: 'football',
    psa9Price: '$10–$20',
    rawPrice: '$3–$5',
    why: 'The most electrifying runner in NFL history. Sanders retired early with 15,269 yards — imagine what the totals would be if he\'d played a full career. His Score RC in PSA 9 is under $20 for a player widely considered the most talented RB ever.',
    buyTip: 'Sanders\' Pro Set and Topps Traded RCs exist too, but the Score is the most collected. Buy PSA 9 slabbed for the cleanest presentation.',
  },
  {
    rank: 26,
    name: '2000 Bowman Chrome Tom Brady #236 RC',
    set: '2000 Bowman Chrome',
    player: 'Tom Brady',
    sport: 'football',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: 'GOAT. 7x Super Bowl champion. Brady\'s Bowman Chrome RC in PSA 9 is $80+, but PSA 8 or raw Chrome copies can be found at the $25 ceiling. Even a raw Brady Chrome RC is a legitimate piece of the greatest NFL career ever assembled.',
    slug: '2000-bowman-chrome-tom-brady-236-rc',
    buyTip: 'At this budget, you\'re likely looking at raw or PSA 8. Either way, you own a Tom Brady rookie card — the player\'s legacy does the heavy lifting.',
  },
  {
    rank: 27,
    name: '2004 Topps Chrome Ben Roethlisberger #166 RC',
    set: '2004 Topps Chrome',
    player: 'Ben Roethlisberger',
    sport: 'football',
    psa9Price: '$10–$20',
    rawPrice: '$3–$6',
    why: '2x Super Bowl champion, 6x Pro Bowler. Big Ben led the Steelers to two titles and was one of the most durable franchise QBs of his era. The Chrome RC at $10–20 PSA 9 is exceptional value for a two-time champion.',
    buyTip: 'Two rings for $10–20 in PSA 9. Chrome format grades well from this era — clean, shiny, and display-ready in a slab.',
  },
  {
    rank: 28,
    name: '2012 Topps Chrome Russell Wilson #14 RC',
    set: '2012 Topps Chrome',
    player: 'Russell Wilson',
    sport: 'football',
    psa9Price: '$15–$25',
    rawPrice: '$4–$7',
    why: 'Super Bowl champion, 9x Pro Bowler. Wilson proved that height doesn\'t limit QB success and led Seattle to one of the most dominant defensive championship runs ever. His Chrome RC is clean, affordable, and captures a franchise-defining QB.',
    buyTip: 'Wilson\'s market fluctuates with team performance. Buy during quiet offseason periods when prices dip — the championship pedigree provides a permanent floor.',
  },
  {
    rank: 29,
    name: '1990-91 Score Martin Brodeur #439 RC',
    set: '1990-91 Score',
    player: 'Martin Brodeur',
    sport: 'hockey',
    psa9Price: '$10–$15',
    rawPrice: '$2–$4',
    why: 'The winningest goaltender in NHL history. 691 career wins, 3x Stanley Cup champion, 4x Vezina Trophy. Brodeur\'s Score RC is criminal value — the greatest goalie in history for $10–15 in PSA 9. There is no rational argument against owning this card.',
    buyTip: 'Buy PSA 9 slabbed. The cost of raw + grading exceeds the slabbed price. This is a buy-and-display card for any hockey collection.',
  },
  {
    rank: 30,
    name: '1990-91 Upper Deck Jaromir Jagr #356 RC',
    set: '1990-91 Upper Deck',
    player: 'Jaromir Jagr',
    sport: 'hockey',
    psa9Price: '$10–$20',
    rawPrice: '$3–$5',
    why: '766 career goals — third all-time. 5x Art Ross Trophy winner who played until age 45. Jagr\'s Upper Deck RC is the more affordable alternative to his OPC version and captures one of the most prolific scorers in hockey history.',
    buyTip: 'Upper Deck quality from this era is strong. PSA 9 is achievable on raw copies — inspect centering and corners before submitting.',
  },
  {
    rank: 31,
    name: '1997-98 Pacific Joe Thornton #10 RC',
    set: '1997-98 Pacific',
    player: 'Joe Thornton',
    sport: 'hockey',
    psa9Price: '$10–$20',
    rawPrice: '$3–$5',
    why: 'Hart Trophy and Art Ross Trophy winner, 1,539 career points. Jumbo Joe was one of the best playmaking centers of his generation. His Pacific RC is affordable because the set isn\'t premium — but the player\'s career is undeniable.',
    buyTip: 'Pacific cards from the late 90s are underappreciated by collectors focused on Upper Deck. That brand bias is your value opportunity.',
  },
  {
    rank: 32,
    name: '2005-06 Upper Deck Sidney Crosby #201 YG RC (PSA 7)',
    set: '2005-06 Upper Deck',
    player: 'Sidney Crosby',
    sport: 'hockey',
    psa9Price: '$15–$25',
    rawPrice: '$8–$12',
    why: '3x Stanley Cup champion, 2x Hart Trophy, 2x Conn Smythe. Crosby is the face of modern hockey. His Young Guns RC in PSA 9 is $65+, but a PSA 7 puts the best player of his generation in your collection at the $25 mark.',
    buyTip: 'Young Guns format makes high grades difficult — card stock takes pack damage. PSA 7 at this budget is the smart entry point for Crosby.',
  },
  {
    rank: 33,
    name: '2005-06 Upper Deck Alexander Ovechkin #443 YG RC (PSA 7)',
    set: '2005-06 Upper Deck',
    player: 'Alexander Ovechkin',
    sport: 'hockey',
    psa9Price: '$15–$25',
    rawPrice: '$8–$12',
    why: 'All-time goal-scoring leader. Ovechkin broke Wayne Gretzky\'s record — the record everyone thought was unbreakable. A PSA 7 Young Guns RC of the greatest goal scorer ever at $15–25 is the hockey equivalent of finding a $20 bill on the sidewalk.',
    buyTip: 'Pair with the Crosby PSA 7 YG for under $50 total — you own the two defining players of modern hockey. Hard to beat that.',
  },
  {
    rank: 34,
    name: '1990-91 OPC Mats Sundin #432 RC',
    set: '1990-91 O-Pee-Chee',
    player: 'Mats Sundin',
    sport: 'hockey',
    psa9Price: '$10–$15',
    rawPrice: '$2–$4',
    why: 'First European player drafted #1 overall. 564 career goals, Maple Leafs all-time leading scorer. Sundin was a franchise player in Toronto for over a decade. His OPC RC is a meaningful hockey card at a trivial price.',
    buyTip: 'OPC card stock grades harder than Upper Deck or Score from the same era. Buy slabbed PSA 9 to avoid the rough edges that plague OPC submissions.',
  },
  {
    rank: 35,
    name: '1999 Base Set Nidoking #11 Holo',
    set: 'Base Set (Unlimited)',
    player: 'Nidoking',
    sport: 'pokemon',
    psa9Price: '$15–$20',
    rawPrice: '$5–$8',
    why: 'Original Base Set holo — one of the non-starter holos that collectors routinely overlook while chasing Charizard. Nidoking\'s artwork is iconic and the card carries full vintage Base Set credentials at a fraction of the starter prices.',
    buyTip: 'Non-starter Base Set holos are the best value in vintage Pokémon. Same set, same era, same vintage status — just less hype and better prices.',
  },
  {
    rank: 36,
    name: '1999 Base Set Alakazam #1 Holo',
    set: 'Base Set (Unlimited)',
    player: 'Alakazam',
    sport: 'pokemon',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: 'Card #1 in the Base Set. Alakazam holo was a competitive staple in early Pokémon TCG and the artwork is a classic. PSA 8 fits this budget comfortably, and a clean PSA 9 can be found at the ceiling. A foundational vintage Pokémon piece.',
    buyTip: 'Being card #1 in the set gives Alakazam extra collector appeal. Look for copies with clean holofoil — scratches are the main grade killer.',
  },
  {
    rank: 37,
    name: '1999 Jungle Flareon #3 Holo',
    set: 'Jungle (Unlimited)',
    player: 'Flareon',
    sport: 'pokemon',
    psa9Price: '$15–$20',
    rawPrice: '$4–$7',
    why: 'Eevee evolutions are among the most beloved Pokémon designs, and Flareon\'s Jungle holo is the original fire evolution card. Jungle set holos are more scarce than Base Set in graded condition but trade at a fraction of the price — systematic undervaluation.',
    buyTip: 'Jungle holos grade slightly harder than Base Set. A PSA 9 Flareon holo for $15–20 is a collector\'s delight — beautiful card, vintage credentials, great price.',
  },
  {
    rank: 38,
    name: '2000 Neo Genesis Typhlosion #17 Holo',
    set: 'Neo Genesis (2000)',
    player: 'Typhlosion',
    sport: 'pokemon',
    psa9Price: '$15–$25',
    rawPrice: '$5–$8',
    why: 'Neo Genesis is the bridge between WOTC vintage and the modern era. Typhlosion holo is one of the set\'s most sought-after cards, with fire-type artwork that rivals Base Set Charizard in visual impact. The set is increasingly recognized as vintage.',
    buyTip: 'Neo Genesis is gaining collector recognition as true vintage. Buy now while the price still reflects the "post-Base Set" discount.',
  },
  {
    rank: 39,
    name: '2002 Expedition Mewtwo #20 Holo',
    set: 'Expedition (2002)',
    player: 'Mewtwo',
    sport: 'pokemon',
    psa9Price: '$10–$20',
    rawPrice: '$4–$7',
    why: 'e-Card era Mewtwo. Expedition was the first English set with e-Card reader technology, making it a unique piece of Pokémon TCG history. Mewtwo is a perennial fan favorite and this card is overlooked by collectors focused on Base Set.',
    buyTip: 'Expedition cards are hard to grade — the e-Card strip on the back scratches easily. Slabbed copies are worth the small premium over raw.',
  },
  {
    rank: 40,
    name: '2021 Evolving Skies Dragonite V Alt Art #203',
    set: 'Evolving Skies (2021)',
    player: 'Dragonite V',
    sport: 'pokemon',
    psa9Price: '$15–$25',
    rawPrice: '$8–$12',
    why: 'Evolving Skies alt arts are widely considered the peak of modern Pokémon card design. The Dragonite V alt art features stunning artwork of Dragonite delivering mail — a design that connects to the anime in a way collectors love. Modern card stock grades clean.',
    buyTip: 'Modern alt arts are the new chase cards. Dragonite V at $15–25 PSA 9 is an accessible entry into the most celebrated modern Pokémon subset.',
  },
];

const sportGroups = [
  { sport: 'basketball', label: 'Basketball', icon: '🏀' },
  { sport: 'baseball', label: 'Baseball', icon: '⚾' },
  { sport: 'football', label: 'Football', icon: '🏈' },
  { sport: 'hockey', label: 'Hockey', icon: '🏒' },
  { sport: 'pokemon', label: 'Pokémon', icon: '⚡' },
];

export default function BestCardsUnder25Page() {
  const bySport = (sport: string) => cards.filter(c => c.sport === sport);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '40 Best Sports Cards Under $25 — Smart Collecting Guide',
        description: 'The 40 best sports cards you can buy for under $25. PSA-graded Hall of Famers, quality rookies, and vintage Pokémon holos that punch way above their price.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        mainEntityOfPage: 'https://cardvault-two.vercel.app/guides/best-cards-under-25',
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Budget Collecting Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          40 Best Sports Cards Under $25
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          PSA-graded Hall of Famers, quality rookies, and vintage holos — all for under $25. Each card includes graded price range and exactly why it belongs in your collection.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
          <span>Prices reflect 2026 eBay sold listings</span>
          <span>·</span>
          <span>PSA 9 is the target grade for most entries</span>
          <span>·</span>
          <span>40 cards across 5 categories</span>
        </div>
      </div>

      {/* Why under $25 matters */}
      <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-gray-900/30 border border-emerald-800/30 rounded-2xl p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-2">The case for the sub-$25 collection</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          At $25, something remarkable happens: you cross the threshold into PSA-graded Hall of Famers. Not reprints. Not base commons. Actual slabbed rookie cards and key issues of players enshrined in Cooperstown, Springfield, and Canton. The junk wax era produced billions of cards — and that oversupply means PSA 9 copies of genuine legends sell for less than a pizza dinner. The market misprices nostalgia. The informed buyer benefits.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { label: 'Emmitt Smith Score RC PSA 9', value: '$10–$15', sub: 'All-time NFL rushing leader, 3× champion' },
            { label: 'Mariano Rivera Bowman RC PSA 9', value: '$10–$20', sub: 'Greatest closer ever, unanimous HOF' },
            { label: 'Peyton Manning Chrome RC PSA 9', value: '$15–$25', sub: '5× MVP, 2× Super Bowl champion' },
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
        <h2 className="text-white font-bold text-lg mb-3">Grading strategy at the $25 tier</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-emerald-400 font-semibold text-sm mb-2">When grading makes sense...</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· PSA 9 sells for 3x+ the raw price (e.g., $5 raw / $15+ slabbed)</li>
              <li>· The card stock is known to grade well (Upper Deck, Chrome)</li>
              <li>· You can batch 10+ cards per PSA submission to reduce per-card cost</li>
              <li>· Centering is visibly clean (within 55/45 on the front)</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-orange-400 font-semibold text-sm mb-2">When to buy already slabbed...</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· PSA 9 price is under $15 (grading costs more than the slab is worth)</li>
              <li>· Card stock is known to grade poorly (1984 Topps, OPC, early Donruss)</li>
              <li>· You only want 1–2 cards and can't justify a bulk submission</li>
              <li>· The card is for display and you want guaranteed grade certainty</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/sports" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          Browse All Sports Cards
        </Link>
        <Link href="/guides/best-cards-under-10" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Best Cards Under $10
        </Link>
        <Link href="/guides/best-cards-under-50" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Best Cards Under $50
        </Link>
        <Link href="/guides/best-cards-under-100" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Best Cards Under $100
        </Link>
      </div>
    </div>
  );
}
