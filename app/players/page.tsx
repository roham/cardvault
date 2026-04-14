import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Player Card Profiles — Most Collected Athletes',
  description: 'Browse complete card checklists for the most collected players in sports cards. Michael Jordan, Mickey Mantle, LeBron James, Wayne Gretzky, and more — every card we track, sorted by value.',
};

interface PlayerProfile {
  slug: string;
  name: string;
  sport: string;
  sportIcon: string;
  era: string;
  topCard: string;
  recordSale: string;
  cardCount: number;
  description: string;
  color: string;
}

const players: PlayerProfile[] = [
  // Baseball
  {
    slug: 'mickey-mantle',
    name: 'Mickey Mantle',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '1951–1968',
    topCard: '1952 Topps #311',
    recordSale: '$12,600,000',
    cardCount: 8,
    description: 'The most beloved player of the 1950s golden age. Switch-hitter, Triple Crown winner, 7 World Series titles.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'babe-ruth',
    name: 'Babe Ruth',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '1914–1935',
    topCard: '1914 Cracker Jack #103',
    recordSale: '$4,222,000',
    cardCount: 5,
    description: 'The Sultan of Swat. 714 home runs, .342 average, 7 World Series. Pre-war cards are among the most valuable in existence.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'mike-trout',
    name: 'Mike Trout',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2011–present',
    topCard: '2009 Bowman Chrome Prospects',
    recordSale: '$3,936,000',
    cardCount: 6,
    description: '3-time MVP and the best player of his generation. His Bowman Chrome prospect card is the most valuable modern baseball card.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'derek-jeter',
    name: 'Derek Jeter',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '1992–2014',
    topCard: '1993 SP #279',
    recordSale: '$168,000',
    cardCount: 5,
    description: "The Captain. 5 World Series championships, 14× All-Star. His 1993 SP rookie is one of the hobby's most notoriously hard-to-grade cards.",
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'ken-griffey-jr',
    name: 'Ken Griffey Jr.',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '1989–2010',
    topCard: '1989 Upper Deck #1',
    recordSale: '$22,500',
    cardCount: 3,
    description: "The Kid. Card #1 of Upper Deck's inaugural set, Jr. is one of the most beloved players in baseball history.",
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'shohei-ohtani',
    name: 'Shohei Ohtani',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2018–present',
    topCard: '2018 Bowman Chrome Prospects',
    recordSale: '$150,000',
    cardCount: 4,
    description: 'The two-way generational talent. Ohtani is the most unique player in baseball history — elite pitcher and elite hitter simultaneously.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'honus-wagner',
    name: 'Honus Wagner',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '1897–1917',
    topCard: '1909-11 T206',
    recordSale: '$7,250,000',
    cardCount: 2,
    description: 'The Flying Dutchman. His T206 tobacco card is the most famous card in existence — Wagner allegedly demanded his be pulled from packs.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  // Basketball
  {
    slug: 'michael-jordan',
    name: 'Michael Jordan',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '1984–2003',
    topCard: '1986-87 Fleer #57',
    recordSale: '$738,000',
    cardCount: 9,
    description: '6× champion, 5× MVP. The 1986-87 Fleer rookie is basketball\'s most iconic card. His 1984-85 Star RC predates it.',
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'lebron-james',
    name: 'LeBron James',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '2003–present',
    topCard: '2003-04 Exquisite RPA',
    recordSale: '$5,200,000',
    cardCount: 7,
    description: "4× champion, all-time leading scorer. His 2003-04 Exquisite RPA is basketball's most valuable modern card at $5.2M.",
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'kobe-bryant',
    name: 'Kobe Bryant',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '1996–2016',
    topCard: '1996-97 Topps Chrome #138',
    recordSale: '$1,795,000',
    cardCount: 5,
    description: "5× champion, Black Mamba. Kobe's passing in 2020 drove explosive demand. PSA 10 rookies now trade at life-changing premiums.",
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'luka-doncic',
    name: 'Luka Doncic',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '2018–present',
    topCard: '2018-19 Prizm #280 Gold Logoman',
    recordSale: '$4,200,000',
    cardCount: 4,
    description: "Two-time MVP, generational talent from Slovenia. His 1/1 Gold Logoman auto sold for $4.2M — the most valuable modern basketball card sold.",
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'victor-wembanyama',
    name: 'Victor Wembanyama',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '2023–present',
    topCard: '2023-24 Prizm Rookie RC',
    recordSale: '$192,000',
    cardCount: 3,
    description: "The generational big man redefining the center position. At 7'4\" with guard skills, Wembanyama's rookie market is one of the most watched in the hobby.",
    color: 'from-orange-950/40 to-gray-900/20',
  },
  // Football
  {
    slug: 'tom-brady',
    name: 'Tom Brady',
    sport: 'Football',
    sportIcon: '🏈',
    era: '2000–2022',
    topCard: '2000 Playoff Contenders Auto #144',
    recordSale: '$3,107,852',
    cardCount: 6,
    description: '7× Super Bowl champion, greatest of all time. His autographed Playoff Contenders rookie numbered to 100 sold for $3.1M.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'patrick-mahomes',
    name: 'Patrick Mahomes',
    sport: 'Football',
    sportIcon: '🏈',
    era: '2017–present',
    topCard: '2017 National Treasures RPA',
    recordSale: '$861,000',
    cardCount: 4,
    description: '3× Super Bowl champion. At 29, Mahomes is the most decorated active quarterback and the primary collecting target in modern football.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'joe-montana',
    name: 'Joe Montana',
    sport: 'Football',
    sportIcon: '🏈',
    era: '1979–1994',
    topCard: '1981 Topps Rookie Card',
    recordSale: '$50,000',
    cardCount: 3,
    description: '4× Super Bowl champion, 4× Super Bowl MVP, never threw a pick in the Super Bowl. Montana cards are blue chips in vintage football.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'peyton-manning',
    name: 'Peyton Manning',
    sport: 'Football',
    sportIcon: '🏈',
    era: '1998–2015',
    topCard: '1998 Playoff Contenders Ticket',
    recordSale: '$40,000',
    cardCount: 3,
    description: '2× Super Bowl champion, 5× MVP. The most prolific statistical quarterback of his era and a Hall of Famer.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  // Hockey
  {
    slug: 'wayne-gretzky',
    name: 'Wayne Gretzky',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '1979–1999',
    topCard: '1979-80 O-Pee-Chee #18',
    recordSale: '$3,750,000',
    cardCount: 5,
    description: 'The Great One. 61 NHL records. His O-Pee-Chee rookie is the most valuable hockey card at $3.75M in PSA 10.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
  {
    slug: 'bobby-orr',
    name: 'Bobby Orr',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '1966–1979',
    topCard: '1966-67 Topps #35',
    recordSale: '$204,000',
    cardCount: 3,
    description: 'The greatest defenseman in NHL history. Orr changed how the position was played and his rookie is exceptionally difficult in top grade.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
  {
    slug: 'connor-mcdavid',
    name: 'Connor McDavid',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '2015–present',
    topCard: '2015-16 Upper Deck Young Guns #201',
    recordSale: '$75,000',
    cardCount: 4,
    description: 'The generational talent. McDavid has won 4 Hart Trophies and is the best player in hockey since Gretzky.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
  {
    slug: 'sidney-crosby',
    name: 'Sidney Crosby',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '2005–present',
    topCard: '2005-06 Upper Deck Young Guns #201',
    recordSale: '$228,300',
    cardCount: 3,
    description: '3× Stanley Cup champion, 2× Hart Trophy. The Kid is the most decorated player of his generation.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
  {
    slug: 'mario-lemieux',
    name: 'Mario Lemieux',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '1984–2006',
    topCard: '1985-86 O-Pee-Chee #9',
    recordSale: '$500,000+',
    cardCount: 7,
    description: 'The most naturally gifted hockey player in history. Two-time Cup champion who saved the Penguins franchise.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
  {
    slug: 'larry-bird',
    name: 'Larry Bird',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '1979–1992',
    topCard: '1980-81 Topps #34',
    recordSale: '$1,800,000+',
    cardCount: 5,
    description: 'Boston Celtics legend, 3× MVP, 3× champion. His rivalry with Magic Johnson saved the NBA.',
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'stephen-curry',
    name: 'Stephen Curry',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '2009–present',
    topCard: '2009-10 Topps Chrome #101',
    recordSale: '$600,000+',
    cardCount: 5,
    description: 'The greatest shooter in basketball history. 4× champion, 2× MVP, changed how the game is played.',
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'julio-rodriguez',
    name: 'Julio Rodríguez',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2022–present',
    topCard: '2022 Topps #659',
    recordSale: '$150,000+',
    cardCount: 5,
    description: 'Mariners superstar with elite power-speed combo. AL ROY 2022, locked in long-term.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'juan-soto',
    name: 'Juan Soto',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2018–present',
    topCard: '2018 Topps Update #US300',
    recordSale: '$200,000+',
    cardCount: 5,
    description: 'Generational hitter, World Series champ at 20, and holder of the largest contract in sports history.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'vladimir-guerrero-jr',
    name: 'Vladimir Guerrero Jr.',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2019–present',
    topCard: '2019 Topps Chrome #201',
    recordSale: '$100,000+',
    cardCount: 4,
    description: 'Son of a Hall of Famer who\'s carving his own legacy. Elite power bat, perennial All-Star.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'ichiro-suzuki',
    name: 'Ichiro Suzuki',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2001–2019',
    topCard: '2001 Topps #726',
    recordSale: '$200,000+',
    cardCount: 4,
    description: 'The greatest contact hitter of his era. 10× Gold Glove, single-season hit record holder.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'trevor-lawrence',
    name: 'Trevor Lawrence',
    sport: 'Football',
    sportIcon: '🏈',
    era: '2021–present',
    topCard: '2021 Panini Prizm #331',
    recordSale: '$300,000+',
    cardCount: 4,
    description: 'Generational QB prospect, Clemson national champion, Jaguars franchise cornerstone.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'joe-burrow',
    name: 'Joe Burrow',
    sport: 'Football',
    sportIcon: '🏈',
    era: '2020–present',
    topCard: '2020 Panini Prizm #307',
    recordSale: '$250,000+',
    cardCount: 4,
    description: 'Historic Heisman winner, Super Bowl quarterback, and one of the most popular modern football cards.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'jayson-tatum',
    name: 'Jayson Tatum',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '2017–present',
    topCard: '2017-18 Panini Prizm #16',
    recordSale: '$200,000+',
    cardCount: 4,
    description: '2024 NBA champion and Finals MVP. The face of the Celtics dynasty.',
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'ja-morant',
    name: 'Ja Morant',
    sport: 'Basketball',
    sportIcon: '🏀',
    era: '2019–present',
    topCard: '2019-20 Panini Prizm #249',
    recordSale: '$150,000+',
    cardCount: 4,
    description: 'The most explosive athlete in the NBA. ROY, Most Improved, and perpetual highlight reel.',
    color: 'from-orange-950/40 to-gray-900/20',
  },
  {
    slug: 'josh-allen',
    name: 'Josh Allen',
    sport: 'Football',
    sportIcon: '🏈',
    era: '2018–present',
    topCard: '2018 Panini Prizm #205',
    recordSale: '$200,000+',
    cardCount: 4,
    description: 'The most physically gifted QB in football. Cannon arm, elite runner, Bills franchise cornerstone.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'lamar-jackson',
    name: 'Lamar Jackson',
    sport: 'Football',
    sportIcon: '🏈',
    era: '2018–present',
    topCard: '2018 Panini Prizm #212',
    recordSale: '$150,000+',
    cardCount: 3,
    description: '2× MVP and the most dynamic dual-threat QB in NFL history.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'albert-pujols',
    name: 'Albert Pujols',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2001–2022',
    topCard: '2001 Topps Traded #T247',
    recordSale: '$100,000+',
    cardCount: 3,
    description: 'Greatest right-handed hitter of the modern era. 3× MVP, 700 HR club, 2× champion.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'aaron-judge',
    name: 'Aaron Judge',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2016–present',
    topCard: '2017 Topps #287',
    recordSale: '$100,000+',
    cardCount: 3,
    description: 'The AL home run king. 62 HRs shattered the Maris record. Yankees captain and MVP.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'ronald-acuna-jr',
    name: 'Ronald Acuña Jr.',
    sport: 'Baseball',
    sportIcon: '⚾',
    era: '2018–present',
    topCard: '2018 Topps Update #US250',
    recordSale: '$150,000+',
    cardCount: 3,
    description: 'The only 40-70 player in baseball history. Unanimous MVP, 5-tool phenom.',
    color: 'from-red-950/40 to-gray-900/20',
  },
  {
    slug: 'jaromir-jagr',
    name: 'Jaromír Jágr',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '1990–2018',
    topCard: '1990-91 Upper Deck #356',
    recordSale: '$50,000+',
    cardCount: 3,
    description: 'Second-highest scorer in NHL history. 2× Cup winner who played into his 50s.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
  {
    slug: 'brett-hull',
    name: 'Brett Hull',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '1986–2005',
    topCard: '1988-89 O-Pee-Chee #66',
    recordSale: '$30,000+',
    cardCount: 3,
    description: 'One of the greatest goal scorers ever. 741 career goals, 86-goal season.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
  {
    slug: 'saquon-barkley',
    name: 'Saquon Barkley',
    sport: 'Football',
    sportIcon: '🏈',
    era: '2018–present',
    topCard: '2018 Panini Prizm #202',
    recordSale: '$50,000+',
    cardCount: 3,
    description: 'Elite running back who hit 2,000 yards with the Eagles. ROY, Pro Bowler, human highlight reel.',
    color: 'from-blue-950/40 to-gray-900/20',
  },
  {
    slug: 'eric-lindros',
    name: 'Eric Lindros',
    sport: 'Hockey',
    sportIcon: '🏒',
    era: '1992–2007',
    topCard: '1990-91 Score #440',
    recordSale: '$20,000+',
    cardCount: 3,
    description: 'The most physically dominant forward since Gordie Howe. Hart Trophy winner, tragic what-if career.',
    color: 'from-cyan-950/40 to-gray-900/20',
  },
];

const sportGroups = ['Baseball', 'Basketball', 'Football', 'Hockey'];

export default function PlayersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Player Card Profiles',
        description: 'Complete card checklists for the most collected athletes in sports cards.',
        url: 'https://cardvault-two.vercel.app/players',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: players.length,
          itemListElement: players.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://cardvault-two.vercel.app/players/${p.slug}`,
            name: p.name,
          })),
        },
      }} />
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Player Card Profiles</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Complete card checklists for the most collected athletes in the hobby. Every card we track, player biography, and price context — in one place.
        </p>
      </div>

      {/* Per-sport sections */}
      {sportGroups.map(sport => {
        const sportPlayers = players.filter(p => p.sport === sport);
        const icon = sportPlayers[0]?.sportIcon ?? '';
        return (
          <section key={sport} className="mb-14">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
              <span>{icon}</span> {sport}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sportPlayers.map(player => (
                <Link key={player.slug} href={`/players/${player.slug}`} className="group block">
                  <div className={`h-full bg-gradient-to-br ${player.color} border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-5 transition-all hover:-translate-y-0.5`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold text-base group-hover:text-emerald-400 transition-colors">{player.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{player.era}</p>
                      </div>
                      <span className="text-xl">{player.sportIcon}</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-4">{player.description}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Top card</span>
                        <span className="text-gray-400 text-right">{player.topCard}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Record sale</span>
                        <span className="text-amber-400 font-bold">{player.recordSale}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Cards tracked</span>
                        <span className="text-gray-400">{player.cardCount}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-emerald-400 text-xs font-medium">
                      View all cards →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* All Players from Database */}
      <AllPlayersSection profileSlugs={new Set(players.map(p => p.slug))} />

      {/* CTA */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-white font-bold mb-1">Every player in our database is listed above.</h3>
          <p className="text-gray-400 text-sm">Browse all {sportsCards.length}+ cards in our price guide or search for any card.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/price-guide" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Guide
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            All Sports Cards
          </Link>
        </div>
      </div>
    </div>
  );
}

// Auto-generated player list from the database
function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const sportColorMap: Record<string, string> = {
  baseball: 'bg-red-950/30 border-red-800/30 hover:border-red-600/50',
  basketball: 'bg-orange-950/30 border-orange-800/30 hover:border-orange-600/50',
  football: 'bg-blue-950/30 border-blue-800/30 hover:border-blue-600/50',
  hockey: 'bg-cyan-950/30 border-cyan-800/30 hover:border-cyan-600/50',
};

const sportIconMap: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
};

function AllPlayersSection({ profileSlugs }: { profileSlugs: Set<string> }) {
  // Build player map from all cards
  const playerMap = new Map<string, { name: string; sport: string; count: number; rookie: boolean }>();
  for (const card of sportsCards) {
    const slug = slugifyPlayer(card.player);
    const existing = playerMap.get(slug);
    if (existing) {
      existing.count++;
      if (card.rookie) existing.rookie = true;
    } else {
      playerMap.set(slug, { name: card.player, sport: card.sport, count: 1, rookie: card.rookie });
    }
  }

  // Get players NOT in featured profiles
  const otherPlayers = [...playerMap.entries()]
    .filter(([slug]) => !profileSlugs.has(slug))
    .sort((a, b) => b[1].count - a[1].count || a[1].name.localeCompare(b[1].name));

  const sportOrder = ['baseball', 'basketball', 'football', 'hockey'] as const;

  return (
    <section className="mb-14">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">All Players ({playerMap.size} total)</h2>
        <p className="text-gray-400 text-sm">Every player in the CardVault database. Click any name to see all their tracked cards and values.</p>
      </div>
      {sportOrder.map(sport => {
        const sportPlayers = otherPlayers.filter(([, p]) => p.sport === sport);
        if (sportPlayers.length === 0) return null;
        return (
          <div key={sport} className="mb-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <span>{sportIconMap[sport]}</span> {sport.charAt(0).toUpperCase() + sport.slice(1)}
              <span className="text-gray-500 text-sm font-normal">({sportPlayers.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {sportPlayers.map(([slug, player]) => (
                <Link key={slug} href={`/players/${slug}`} className="group block">
                  <div className={`${sportColorMap[sport]} border rounded-xl px-3 py-2.5 transition-all hover:-translate-y-0.5`}>
                    <div className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors truncate">{player.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {player.count} card{player.count !== 1 ? 's' : ''}
                      {player.rookie && <span className="text-emerald-500 ml-1">RC</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
