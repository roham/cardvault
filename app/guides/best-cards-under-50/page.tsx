import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '40 Best Sports Cards Under $50 — Collector\'s Sweet Spot Guide',
  description: 'The 40 best sports cards under $50. Graded HOF rookies, vintage gems, and modern hits at the hobby\'s sweet spot. PSA 9 prices, why each card matters, and where to buy.',
  keywords: ['sports cards under 50 dollars', 'best cheap sports cards', 'affordable rookie cards', 'budget card collecting', 'sports cards sweet spot'],
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
  pokemon: 'Pokemon',
};

const cards: BudgetCard[] = [
  // Basketball (10)
  {
    rank: 1,
    name: '1996-97 Topps Chrome Kobe Bryant #138 RC PSA 8',
    set: '1996-97 Topps Chrome',
    player: 'Kobe Bryant',
    sport: 'basketball',
    psa9Price: '$35-$50',
    rawPrice: '$15-$30',
    why: 'A top-5 player of all time in PSA 8 for under $50. The Chrome RC is one of the most recognizable rookie cards in the hobby. PSA 9 is $60-95, but PSA 8 puts Kobe\'s flagship RC in your collection at the sweet-spot budget. Five rings, 18 All-Star selections, and a legacy that only grows.',
    slug: '1996-97-topps-chrome-kobe-bryant-138',
    buyTip: 'PSA 8 is the value play here. The jump from 8 to 9 is $25-45 more — both grades display beautifully in a slab.',
  },
  {
    rank: 2,
    name: '1986-87 Fleer Charles Barkley #7 RC PSA 8',
    set: '1986-87 Fleer',
    player: 'Charles Barkley',
    sport: 'basketball',
    psa9Price: '$25-$45',
    rawPrice: '$8-$18',
    why: 'Sir Charles from the most iconic basketball set ever produced. MVP, 11x All-Star, Hall of Famer. His Fleer RC is a legitimate vintage basketball card from the same set as Jordan\'s legendary rookie. Owning any card from 1986-87 Fleer is owning basketball history.',
    buyTip: 'The 1986-87 Fleer set grades tough due to centering and soft card stock. PSA 8 is a realistic grade for most raw copies — don\'t chase PSA 9 unless centering is dead-on.',
  },
  {
    rank: 3,
    name: '1997-98 Topps Chrome Tim Duncan #115 RC PSA 9',
    set: '1997-98 Topps Chrome',
    player: 'Tim Duncan',
    sport: 'basketball',
    psa9Price: '$30-$50',
    rawPrice: '$10-$20',
    why: 'The Big Fundamental. 5x NBA champion, 2x MVP, 3x Finals MVP, 15x All-Star. Duncan is arguably the greatest power forward in NBA history. His Chrome RC in PSA 9 is one of the most absurdly undervalued cards in the hobby — a first-ballot HOFer with 5 rings for under $50.',
    buyTip: 'This is a Hall of Fame RC from the Chrome brand in PSA 9. The value here is so obvious it feels like a market error. Buy confidently.',
  },
  {
    rank: 4,
    name: '1998-99 Topps Chrome Dirk Nowitzki #154 RC PSA 9',
    set: '1998-99 Topps Chrome',
    player: 'Dirk Nowitzki',
    sport: 'basketball',
    psa9Price: '$25-$45',
    rawPrice: '$8-$18',
    why: 'The man who changed how basketball is played globally. MVP, Finals MVP, NBA champion with Dallas. Dirk\'s Chrome RC in PSA 9 is one of the most underappreciated HOF rookies in the entire hobby. He revolutionized the stretch-four position and took a franchise to a title.',
    buyTip: 'International collectors keep steady demand on Dirk\'s cards. The Chrome RC grades consistently — PSA 9 is achievable from clean raw copies.',
  },
  {
    rank: 5,
    name: '1998-99 Topps Chrome Vince Carter #199 RC PSA 9',
    set: '1998-99 Topps Chrome',
    player: 'Vince Carter',
    sport: 'basketball',
    psa9Price: '$20-$40',
    rawPrice: '$6-$15',
    why: 'Half Man, Half Amazing. The greatest dunker in NBA history and an 8x All-Star who played an unprecedented 22 seasons. His 2000 Slam Dunk Contest is the single most watched event in All-Star Weekend history. The Chrome RC at under $40 in PSA 9 is criminally cheap.',
    buyTip: 'Vince\'s cultural impact far exceeds his card prices. The dunk contest footage alone keeps new collectors finding this card every year.',
  },
  {
    rank: 6,
    name: '2003-04 Topps Chrome Dwyane Wade #115 RC PSA 9',
    set: '2003-04 Topps Chrome',
    player: 'Dwyane Wade',
    sport: 'basketball',
    psa9Price: '$30-$50',
    rawPrice: '$8-$18',
    why: '3x NBA champion, 13x All-Star, Finals MVP, Hall of Famer. Wade\'s Chrome RC is perpetually underpriced because he shares a rookie class with LeBron. That shadow is your opportunity — you get a career great and one of the best shooting guards ever at a fraction of comparable players.',
    buyTip: 'The LeBron shadow effect is structural and persistent. Wade\'s Chrome RC in PSA 9 is objectively superior value to many cards at 2-3x the price.',
  },
  {
    rank: 7,
    name: '2009-10 Topps Chrome Stephen Curry #101 RC PSA 8',
    set: '2009-10 Topps Chrome',
    player: 'Stephen Curry',
    sport: 'basketball',
    psa9Price: '$35-$50',
    rawPrice: '$15-$25',
    why: 'The greatest shooter in basketball history. 4x NBA champion, 2x MVP (including unanimous), changed how the game is played forever. His Chrome RC in PSA 9 is $200+, but PSA 8 gets you a legitimate Curry Chrome rookie under $50. Generational talent at a budget price.',
    buyTip: 'PSA 8 is the entry point for Curry\'s Chrome RC. The card grades tough — centering and surface issues keep most copies at PSA 8. That\'s exactly what makes this price accessible.',
  },
  {
    rank: 8,
    name: '2012-13 Prizm Anthony Davis #236 RC PSA 9',
    set: '2012-13 Panini Prizm',
    player: 'Anthony Davis',
    sport: 'basketball',
    psa9Price: '$25-$40',
    rawPrice: '$8-$15',
    why: 'NBA champion, 8x All-Star, All-NBA talent. Davis is one of the most gifted two-way players in basketball history. His Prizm RC from the inaugural year of the Prizm brand in PSA 9 under $40 is a genuine first-year Prizm RC of a champion.',
    buyTip: 'First-year Prizm (2012-13) has collector cachet similar to early Topps Chrome. The set itself has appreciation tailwinds beyond individual players.',
  },
  {
    rank: 9,
    name: '2013-14 Prizm Giannis Antetokounmpo #290 RC PSA 9',
    set: '2013-14 Panini Prizm',
    player: 'Giannis Antetokounmpo',
    sport: 'basketball',
    psa9Price: '$30-$50',
    rawPrice: '$10-$20',
    why: 'The Greek Freak. 2x MVP, NBA champion, Finals MVP. Giannis went from a complete unknown drafted 15th overall to arguably the best player in the world. His Prizm RC in PSA 9 under $50 is one of the best value propositions in modern basketball cards — a multi-time MVP for the price of dinner.',
    buyTip: 'Giannis is still in his prime. His card market has room to grow with every deep playoff run. Accumulate at this price.',
  },
  {
    rank: 10,
    name: '2018-19 Prizm Luka Doncic #280 RC PSA 9',
    set: '2018-19 Panini Prizm',
    player: 'Luka Doncic',
    sport: 'basketball',
    psa9Price: '$35-$50',
    rawPrice: '$12-$20',
    why: 'Generational playmaker. 5x All-Star before age 26, led Dallas to the NBA Finals. Luka is the heir apparent to LeBron as the league\'s best all-around player. His base Prizm RC in PSA 9 is the most accessible entry into the Luka market — Silver Prizm versions are $500+.',
    buyTip: 'The base Prizm RC is the floor entry for a player with top-5 all-time upside. At $35-50 in PSA 9, the risk/reward is heavily in your favor.',
  },

  // Baseball (10)
  {
    rank: 11,
    name: '1989 Upper Deck Ken Griffey Jr. #1 RC PSA 9',
    set: '1989 Upper Deck',
    player: 'Ken Griffey Jr.',
    sport: 'baseball',
    psa9Price: '$30-$50',
    rawPrice: '$10-$25',
    why: 'The most culturally significant baseball rookie of the junk wax era. Card #1 in the Upper Deck set. The Kid put up Hall of Fame numbers while becoming the face of baseball for an entire generation. 630 career home runs, 13x All-Star, 10x Gold Glove.',
    slug: '1989-upper-deck-ken-griffey-jr-1',
    buyTip: 'High-population PSA 9 means consistent supply. Compare centering on multiple copies before committing — centering is the grade killer on this card.',
  },
  {
    rank: 12,
    name: '1993 SP Derek Jeter #279 RC PSA 8',
    set: '1993 SP',
    player: 'Derek Jeter',
    sport: 'baseball',
    psa9Price: '$30-$50',
    rawPrice: '$15-$30',
    why: 'One of the most recognizable baseball RCs of the modern era in PSA 8. 5x World Series champion, 14x All-Star, Hall of Famer, Mr. November, The Captain. PSA 9 runs $70-95, but PSA 8 puts a legitimate Jeter RC in your collection under $50.',
    slug: '1993-sp-derek-jeter-279',
    buyTip: 'PSA 8 is the sweet-spot grade for the Jeter SP RC on a $50 budget. Centering and foil condition are the main grading challenges.',
  },
  {
    rank: 13,
    name: '2001 Topps Chrome Albert Pujols #596 RC PSA 9',
    set: '2001 Topps Chrome',
    player: 'Albert Pujols',
    sport: 'baseball',
    psa9Price: '$25-$45',
    rawPrice: '$8-$18',
    why: '3x MVP, 2x World Series champion, 700+ career home runs, first-ballot Hall of Famer. Pujols is arguably the greatest right-handed hitter in baseball history. His Chrome RC in PSA 9 under $50 is absurd value for a player of this caliber.',
    buyTip: 'Chrome grades consistently from this era. PSA 9 is achievable from nice raw copies — the card stock was high quality in 2001.',
  },
  {
    rank: 14,
    name: '2011 Topps Update Mike Trout #US175 RC PSA 8',
    set: '2011 Topps Update',
    player: 'Mike Trout',
    sport: 'baseball',
    psa9Price: '$30-$50',
    rawPrice: '$15-$30',
    why: 'The best player of his generation by WAR. 3x MVP, perennial All-Star. Trout\'s Topps Update RC is his most accessible true rookie card — the Bowman Chrome auto is $1,000+. PSA 8 puts a legitimate Mike Trout RC in your hands for under $50.',
    slug: '2011-topps-update-mike-trout-us175',
    buyTip: 'PSA 8 is the budget entry for Trout\'s flagship RC. Centering and corner wear are the grade killers — inspect carefully.',
  },
  {
    rank: 15,
    name: '1983 Topps Tony Gwynn #482 RC PSA 9',
    set: '1983 Topps',
    player: 'Tony Gwynn',
    sport: 'baseball',
    psa9Price: '$25-$40',
    rawPrice: '$8-$15',
    why: 'Mr. Padre. 8x batting champion — the most since Ty Cobb. 15x All-Star, 3,141 career hits, .338 lifetime average. Only struck out 434 times in 20 seasons. Gwynn\'s Topps RC in PSA 9 is a legitimate vintage HOF card at a price that defies logic.',
    buyTip: '1983 Topps centering can be problematic, but Tony Gwynn cards specifically tend to grade well. This is one of the best pure-value HOF RCs in the hobby.',
  },
  {
    rank: 16,
    name: '1984 Donruss Don Mattingly #248 RC PSA 9',
    set: '1984 Donruss',
    player: 'Don Mattingly',
    sport: 'baseball',
    psa9Price: '$25-$45',
    rawPrice: '$8-$18',
    why: 'Donnie Baseball. 6x Gold Glove, batting champion, MVP. The 1984 Donruss RC is a true short-print rookie — Mattingly was added late in the print run, making his RC genuinely scarcer than most junk wax cards. One of the most beloved Yankees of his era.',
    buyTip: 'Condition is everything on 1984 Donruss. The cardstock is soft and susceptible to chipping. Only buy clean copies with sharp corners.',
  },
  {
    rank: 17,
    name: '1985 Topps Mark McGwire #401 RC PSA 9',
    set: '1985 Topps',
    player: 'Mark McGwire',
    sport: 'baseball',
    psa9Price: '$25-$40',
    rawPrice: '$8-$15',
    why: 'The home run race of 1998 saved baseball. 583 career home runs, ROY, 12x All-Star. McGwire\'s 1985 Topps RC captures the USA Olympic team version before his A\'s career. The PED cloud suppresses his market — which means the most exciting power hitter of his era is perpetually cheap.',
    buyTip: 'The Olympic jersey photo makes this card visually distinct. Market suppression from PED era creates a permanent discount — buy for the baseball history, not the Hall debate.',
  },
  {
    rank: 18,
    name: '1982 Topps Cal Ripken Jr. #21 RC PSA 8',
    set: '1982 Topps Traded',
    player: 'Cal Ripken Jr.',
    sport: 'baseball',
    psa9Price: '$35-$50',
    rawPrice: '$12-$25',
    why: 'The Iron Man. 2,632 consecutive games — a record that may never be broken. 2x MVP, 19x All-Star, 3,184 career hits. Ripken\'s Topps Traded RC in PSA 8 puts a first-ballot Hall of Famer and one of baseball\'s most beloved figures in your collection under $50.',
    buyTip: '1982 Topps Traded is a smaller set than base Topps, which makes it slightly scarcer. PSA 8 is the realistic grade for most raw copies — centering on early 80s Topps is notoriously inconsistent.',
  },
  {
    rank: 19,
    name: '2018 Topps Chrome Shohei Ohtani #150 RC PSA 9',
    set: '2018 Topps Chrome',
    player: 'Shohei Ohtani',
    sport: 'baseball',
    psa9Price: '$25-$45',
    rawPrice: '$10-$18',
    why: 'The most unique player in baseball history. Two-way superstar who hits 40+ home runs and pitches at an elite level. Ohtani is doing things no one has done since Babe Ruth — and arguably doing them better. His Chrome RC in PSA 9 under $50 is a historical baseball artifact.',
    buyTip: 'Ohtani\'s market moves with his performance. The Dodgers contract guarantees he stays in the spotlight — accumulate his base Chrome RC at this price.',
  },
  {
    rank: 20,
    name: '2019 Topps Chrome Juan Soto #155 RC PSA 9',
    set: '2019 Topps Chrome',
    player: 'Juan Soto',
    sport: 'baseball',
    psa9Price: '$30-$45',
    rawPrice: '$10-$18',
    why: 'World Series champion at 20 years old. Soto\'s plate discipline and power combination is generational — he walks more than he strikes out while hitting 30+ home runs. His Chrome RC in PSA 9 at this price is a bet on the best young hitter in baseball becoming an all-time great.',
    buyTip: 'Soto is still entering his prime. Every MVP-caliber season will push this card higher. The $30-45 PSA 9 window won\'t last if he stays healthy.',
  },

  // Football (8)
  {
    rank: 21,
    name: '1998 Topps Chrome Peyton Manning #165 RC PSA 9',
    set: '1998 Topps Chrome',
    player: 'Peyton Manning',
    sport: 'football',
    psa9Price: '$30-$50',
    rawPrice: '$10-$20',
    why: '5x MVP — more than any other player in NFL history. 2x Super Bowl champion. Manning rewrote the record books for passing and is universally considered one of the two greatest QBs ever. His Chrome RC in PSA 9 under $50 is one of the most undervalued cards in all of football.',
    buyTip: 'A 5x MVP\'s Chrome RC for under $50 in PSA 9. This is the definition of market inefficiency. Buy without hesitation.',
  },
  {
    rank: 22,
    name: '2000 Bowman Chrome Tom Brady #236 RC PSA 8',
    set: '2000 Bowman Chrome',
    player: 'Tom Brady',
    sport: 'football',
    psa9Price: '$35-$50',
    rawPrice: '$15-$25',
    slug: '2000-bowman-chrome-tom-brady-236-rc',
    why: 'The GOAT. 7x Super Bowl champion. Brady\'s Bowman Chrome RC is one of the most sought-after modern football cards. PSA 9 is $200+, but PSA 8 puts a legitimate Chrome RC of the greatest QB ever in your collection under $50. The player\'s legacy makes this a cornerstone card.',
    buyTip: 'PSA 8 Brady Chrome RC is the floor entry for the greatest football player of all time. At $35-50, you own a piece of sporting history.',
  },
  {
    rank: 23,
    name: '1986 Topps Jerry Rice #161 RC PSA 8',
    set: '1986 Topps',
    player: 'Jerry Rice',
    sport: 'football',
    psa9Price: '$30-$50',
    rawPrice: '$10-$20',
    why: 'The greatest wide receiver in NFL history. All-time leader in receptions, receiving yards, and receiving touchdowns — records that may never be broken. 3x Super Bowl champion, 13x Pro Bowl. Rice\'s Topps RC in PSA 8 is a genuine vintage football collectible under $50.',
    buyTip: '1986 Topps football grades tough — centering and gum staining are common issues. PSA 8 is a strong grade for this card. Inspect surface condition carefully on raw copies.',
  },
  {
    rank: 24,
    name: '2012 Topps Chrome Russell Wilson #40 RC PSA 9',
    set: '2012 Topps Chrome',
    player: 'Russell Wilson',
    sport: 'football',
    psa9Price: '$25-$45',
    rawPrice: '$8-$15',
    why: 'Super Bowl champion, 9x Pro Bowl, one of the most efficient QBs in NFL history. Wilson was a third-round pick who immediately proved the doubters wrong. His Chrome RC in PSA 9 at this price is a legitimate champion\'s card at a budget price.',
    buyTip: 'Wilson\'s consistent career production provides a stable floor for his card values. Chrome grades well from this era — PSA 9 is achievable.',
  },
  {
    rank: 25,
    name: '2012 Topps Chrome Andrew Luck #1 RC PSA 9',
    set: '2012 Topps Chrome',
    player: 'Andrew Luck',
    sport: 'football',
    psa9Price: '$15-$30',
    rawPrice: '$5-$12',
    why: 'The most hyped QB prospect of the modern era. #1 overall pick, 4x Pro Bowl, led the Colts to the AFC Championship. Luck\'s sudden retirement at 29 creates a unique collector\'s piece — the career that could have been. A conversation-starter card at a rock-bottom price.',
    buyTip: 'The early retirement actually creates collector interest as a historical piece. At $15-30 in PSA 9, the downside is essentially zero.',
  },
  {
    rank: 26,
    name: '2014 Topps Chrome Jimmy Garoppolo #130a RC PSA 10',
    set: '2014 Topps Chrome',
    player: 'Jimmy Garoppolo',
    sport: 'football',
    psa9Price: '$20-$35',
    rawPrice: '$5-$12',
    why: 'NFC Championship QB, Brady\'s heir apparent who carved his own path with the 49ers. Garoppolo\'s Chrome RC is available in PSA 10 — a gem mint grade — for under $35. That\'s a PSA 10 slab of a starting NFL QB who played in the biggest games. The grade alone makes this interesting.',
    buyTip: 'A PSA 10 Chrome RC for under $35 is rare at any position. The gem mint grade has inherent collector appeal regardless of the player\'s career trajectory.',
  },
  {
    rank: 27,
    name: '2017 Panini Prizm Patrick Mahomes #269 RC PSA 8',
    set: '2017 Panini Prizm',
    player: 'Patrick Mahomes',
    sport: 'football',
    psa9Price: '$35-$50',
    rawPrice: '$15-$25',
    why: 'The most talented QB in NFL history. 3x Super Bowl champion, 3x Super Bowl MVP, 2x MVP. Mahomes is rewriting every record that matters. His base Prizm RC in PSA 9 is $300+, but PSA 8 puts the card of the generation in your collection under $50.',
    buyTip: 'PSA 8 Mahomes Prizm RC is the single best value play in modern football cards. You\'re buying the most decorated active QB for under $50. The floor is rock solid.',
  },
  {
    rank: 28,
    name: '2020 Panini Prizm Justin Herbert #325 RC PSA 9',
    set: '2020 Panini Prizm',
    player: 'Justin Herbert',
    sport: 'football',
    psa9Price: '$25-$45',
    rawPrice: '$8-$18',
    why: 'Offensive Rookie of the Year. Broke Drew Brees\'s rookie TD record. Herbert has the arm talent and accuracy to be a perennial MVP candidate. His base Prizm RC in PSA 9 is a clean, affordable entry into the market of the most talented young arm in the AFC.',
    buyTip: 'Herbert\'s card market moves with Chargers playoff success. Buy in the offseason when prices cool — the card pops 20-30% during playoff runs.',
  },

  // Hockey (6)
  {
    rank: 29,
    name: '2005-06 Upper Deck Sidney Crosby #201 YG RC PSA 8',
    set: '2005-06 Upper Deck',
    player: 'Sidney Crosby',
    sport: 'hockey',
    psa9Price: '$35-$50',
    rawPrice: '$18-$30',
    why: '3x Stanley Cup champion, 2x Hart Trophy, 2x Conn Smythe. Crosby is the face of modern hockey and the best player of his generation. His Young Guns RC in PSA 9 is $65-95, but PSA 8 puts the most important hockey card of the 2000s in your collection under $50.',
    buyTip: 'Young Guns format takes damage in packs — card stock is susceptible to corner and edge issues. PSA 8 is a realistic grade for most copies and displays beautifully.',
  },
  {
    rank: 30,
    name: '2005-06 Upper Deck Alexander Ovechkin #443 YG RC PSA 8',
    set: '2005-06 Upper Deck',
    player: 'Alexander Ovechkin',
    sport: 'hockey',
    psa9Price: '$30-$45',
    rawPrice: '$12-$25',
    why: 'The all-time goal-scoring leader. Ovi broke Gretzky\'s career goals record and kept going. 3x Hart Trophy, 9x Rocket Richard Trophy, Stanley Cup champion. His Young Guns RC in PSA 8 under $50 is a legitimate piece of hockey history.',
    buyTip: 'Ovechkin\'s goal record guarantees permanent collector interest. PSA 8 YG RCs with clean surfaces are the sweet spot for budget hockey collectors.',
  },
  {
    rank: 31,
    name: '2015-16 Upper Deck Connor McDavid #201 YG RC PSA 8',
    set: '2015-16 Upper Deck',
    player: 'Connor McDavid',
    sport: 'hockey',
    psa9Price: '$30-$50',
    rawPrice: '$15-$30',
    why: 'The next generational talent. Multiple Hart Trophies, Art Ross Trophies, Ted Lindsay Awards. McDavid is the fastest, most skilled player in hockey today. His YG RC in PSA 8 is the entry point for the most important hockey card of the 2010s.',
    buyTip: 'McDavid\'s PSA 9 YG RC is $80-95 and climbing. PSA 8 at $30-50 is the value play while he\'s still adding to his resume.',
  },
  {
    rank: 32,
    name: '1997-98 Pacific Joe Thornton #18 RC PSA 10',
    set: '1997-98 Pacific',
    player: 'Joe Thornton',
    sport: 'hockey',
    psa9Price: '$25-$40',
    rawPrice: '$8-$15',
    why: 'Hart Trophy winner, Art Ross Trophy winner, 1,539 career points. Jumbo Joe is one of the greatest playmakers in NHL history. His Pacific RC in PSA 10 — gem mint — is available under $40. That\'s a Hall of Famer in the highest possible grade.',
    buyTip: 'A PSA 10 of a Hall of Famer for under $40 is exceptionally rare. The Pacific brand keeps the price accessible — the grade and the player are what matter.',
  },
  {
    rank: 33,
    name: '2016-17 Upper Deck Auston Matthews #201 YG RC PSA 9',
    set: '2016-17 Upper Deck',
    player: 'Auston Matthews',
    sport: 'hockey',
    psa9Price: '$25-$45',
    rawPrice: '$10-$18',
    why: 'Rocket Richard Trophy winner, Hart Trophy winner, the best American-born hockey player of his generation. Matthews scores at a rate that puts him on pace for 600+ career goals. The Maple Leafs\' franchise player in PSA 9 under $50 is a strong long-term hold.',
    buyTip: 'Matthews\' card market is tied to Leafs playoff success. Buy during the offseason when prices dip — a deep playoff run will spike values significantly.',
  },
  {
    rank: 34,
    name: '2019-20 Upper Deck Jack Hughes #201 YG RC PSA 9',
    set: '2019-20 Upper Deck',
    player: 'Jack Hughes',
    sport: 'hockey',
    psa9Price: '$20-$35',
    rawPrice: '$8-$15',
    why: '#1 overall pick who has developed into a genuine star. Hughes\' game has elevated every season — his skating, scoring, and playmaking are elite. The Young Guns RC in PSA 9 at this price is a bet on continued improvement from a player with franchise-player ceiling.',
    buyTip: 'Hughes is still ascending. His breakout seasons have steadily pushed card values up. The $20-35 PSA 9 window may close as his production increases.',
  },

  // Pokemon (6)
  {
    rank: 35,
    name: '1999 Base Set Blastoise #2 Holo PSA 8',
    set: 'Base Set (Unlimited)',
    player: 'Blastoise',
    sport: 'pokemon',
    psa9Price: '$30-$50',
    rawPrice: '$12-$25',
    why: 'One of the original three starter evolutions. Blastoise is the #2 most iconic Pokemon card behind Charizard. The Base Set holo in PSA 8 is a genuine 1999 vintage Pokemon collectible at a price that\'s still accessible. As Base Set supply tightens, all three starters benefit.',
    buyTip: 'PSA 8 is the realistic grade for most Base Set holos due to print lines and holo scratches. Clean copies that deserve PSA 9 submission are worth the grading fee.',
  },
  {
    rank: 36,
    name: '1999 Base Set Venusaur #15 Holo PSA 8',
    set: 'Base Set (Unlimited)',
    player: 'Venusaur',
    sport: 'pokemon',
    psa9Price: '$25-$40',
    rawPrice: '$10-$20',
    why: 'The most undervalued of the original three starters. Charizard gets the headlines and Blastoise gets the #2 treatment, but Venusaur quietly holds real value as the third pillar of the original Base Set trio. The discount vs. Charizard is permanent — which makes it the better value play.',
    buyTip: 'The Venusaur discount is structural. Pair with Blastoise for under $80 total and you have two of the three original starters in slabs.',
  },
  {
    rank: 37,
    name: '1999 Fossil Gengar #5 Holo PSA 9',
    set: 'Fossil (Unlimited)',
    player: 'Gengar',
    sport: 'pokemon',
    psa9Price: '$30-$50',
    rawPrice: '$10-$20',
    slug: '1999-pokemon-fossil-gengar-5-holo',
    why: 'Ghost-type king of the original sets. The Fossil Gengar holo is a fan-favorite card with a dedicated collector base that transcends casual interest. Fossil set cards are harder to find in clean condition than Base Set, making the PSA 9 population tighter than the price suggests.',
    buyTip: 'Fossil holos grade harder than Base Set due to card stock differences. If you find a raw copy in excellent shape, submitting is worth the PSA fee — the PSA 9 premium is significant.',
  },
  {
    rank: 38,
    name: '2002 Expedition Charizard #6 Holo',
    set: 'Expedition (2002)',
    player: 'Charizard',
    sport: 'pokemon',
    psa9Price: '$35-$50',
    rawPrice: '$12-$25',
    why: 'e-Card era Charizard. Expedition was the first English set to use e-Card reader technology. This Charizard holo is overlooked by collectors focused on Base Set, creating a genuine value opportunity for the most popular Pokemon in a rarer, harder-to-find set from the early 2000s.',
    buyTip: 'Expedition cards are notoriously difficult to grade — the e-Card strip on the back is often scratched. Raw copies with clean backs are the key to hitting PSA 9.',
  },
  {
    rank: 39,
    name: '2023 SV 151 Charizard ex #199 IR',
    set: 'Scarlet & Violet 151 (2023)',
    player: 'Charizard ex',
    sport: 'pokemon',
    psa9Price: '$30-$45',
    rawPrice: '$15-$25',
    why: 'The modern collector\'s Charizard. The 151 set brought back the original 151 Pokemon in stunning new art styles. The Charizard ex Illustration Rare is one of the most visually striking modern Pokemon cards with breathtaking full-art illustration. Modern card stock grades clean.',
    buyTip: 'Modern cards grade consistently well. A PSA 9 at $30-45 on a card this visually impressive is solid value for display and long-term collector demand.',
  },
  {
    rank: 40,
    name: '2021 Evolving Skies Umbreon V Alt Art #188',
    set: 'Evolving Skies (2021)',
    player: 'Umbreon V',
    sport: 'pokemon',
    psa9Price: '$35-$50',
    rawPrice: '$15-$25',
    why: 'The crown jewel of Evolving Skies. The Umbreon V Alternate Art is one of the most popular modern Pokemon cards ever printed — the moonlit artwork is widely considered among the best in the entire Sword & Shield era. Umbreon has a devoted fanbase that keeps demand consistent.',
    buyTip: 'Alternate Art cards from Evolving Skies are the modern equivalent of vintage holos. Umbreon V Alt Art in particular has a collector following that rivals Base Set cards.',
  },
];

const sportGroups = [
  { sport: 'basketball', label: 'Basketball', icon: '🏀' },
  { sport: 'baseball', label: 'Baseball', icon: '⚾' },
  { sport: 'football', label: 'Football', icon: '🏈' },
  { sport: 'hockey', label: 'Hockey', icon: '🏒' },
  { sport: 'pokemon', label: 'Pokemon', icon: '⚡' },
];

export default function BestCardsUnder50Page() {
  const bySport = (sport: string) => cards.filter(c => c.sport === sport);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '40 Best Sports Cards Under $50 — Collector\'s Sweet Spot Guide',
        description: 'The 40 best sports cards under $50. Graded HOF rookies, vintage gems, and modern hits at the hobby\'s sweet spot. PSA 9 prices, why each card matters, and where to buy.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        mainEntityOfPage: 'https://cardvault-two.vercel.app/guides/best-cards-under-50',
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Budget Collecting Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          40 Best Sports Cards Under $50
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Graded Hall of Fame rookies, generational talents, and vintage icons at the hobby's sweet spot. Each card includes PSA price range and exactly why it belongs in your collection.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
          <span>Prices reflect 2026 eBay sold listings</span>
          <span>·</span>
          <span>PSA 8–9 is the sweet-spot grade for most entries</span>
          <span>·</span>
          <span>40 cards across 5 categories</span>
        </div>
      </div>

      {/* Why under $50 matters */}
      <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-gray-900/30 border border-emerald-800/30 rounded-2xl p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-2">The case for the sub-$50 collection</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          At $50 per card, you're not buying commons or junk wax — you're buying genuine blue-chip rookie cards of Hall of Famers and generational talents in graded slabs. This is the price point where the hobby gets serious. PSA 8 and PSA 9 copies of cards that defined entire eras are sitting right here, waiting for informed collectors to scoop them up.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { label: 'Tim Duncan Chrome RC PSA 9', value: '$30–$50', sub: '5× NBA champion, 2× MVP, greatest PF ever' },
            { label: 'Peyton Manning Chrome RC PSA 9', value: '$30–$50', sub: '5× MVP, 2× Super Bowl champion' },
            { label: 'Griffey Jr. UD RC PSA 9', value: '$30–$50', sub: 'Face of baseball, 630 career home runs' },
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
        <h2 className="text-white font-bold text-lg mb-3">The $50 sweet spot for grading</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-emerald-400 font-semibold text-sm mb-2">Why $50 is the grading sweet spot</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· Many raw cards at $15–20 are worth submitting to PSA</li>
              <li>· PSA 9/10 copies sell for 2–3x the raw price consistently</li>
              <li>· PSA Economy tier ($20–25/card) makes the math work</li>
              <li>· A $15 raw card that hits PSA 9 becomes a $40–50 card</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-orange-400 font-semibold text-sm mb-2">Maximize your grading ROI</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· Only submit cards with excellent centering (55/45 or better)</li>
              <li>· Chrome/Prizm cards grade more consistently than vintage</li>
              <li>· Batch submissions of 10+ cards reduce per-card shipping costs</li>
              <li>· At this price tier, PSA 9 is the target — don't chase PSA 10</li>
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
        <Link href="/guides/best-cards-under-25" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Best Cards Under $25
        </Link>
        <Link href="/guides/best-cards-under-100" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Best Cards Under $100
        </Link>
      </div>
    </div>
  );
}
