import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards, SportsCard } from '@/data/sports-cards';
import { getNotableSales } from '@/data/notable-sales';
import SportsCardTile from '@/components/SportsCardTile';
import CardGrid from '@/components/CardGrid';

interface Props {
  params: Promise<{ slug: string }>;
}

interface PlayerInfo {
  slug: string;
  name: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  bio: string;
  careerHighlights: string[];
  ebaySearchUrl: string;
}

const playerProfiles: PlayerInfo[] = [
  {
    slug: 'mickey-mantle',
    name: 'Mickey Mantle',
    sport: 'baseball',
    bio: 'Mickey Mantle played center field for the New York Yankees from 1951 to 1968, winning 7 World Series titles and 3 AL MVP Awards. A switch-hitter with extraordinary power from both sides of the plate, Mantle hit 536 career home runs despite playing much of his career in pain from a serious knee injury.',
    careerHighlights: ['7× World Series Champion', '3× AL MVP (1956, 1957, 1962)', 'Triple Crown (1956)', '16× All-Star', '536 career home runs', 'Hall of Fame inductee (1974)'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=mickey+mantle+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'babe-ruth',
    name: 'Babe Ruth',
    sport: 'baseball',
    bio: "George Herman 'Babe' Ruth transformed baseball from a pitcher to the most feared home run hitter in history. His 714 career home runs stood as the all-time record for nearly 40 years. Ruth's larger-than-life personality and baseball dominance made him the sport's first true superstar.",
    careerHighlights: ['7× World Series Champion', '.342 career batting average', '714 career home runs (stood until 1974)', '12× AL home run leader', 'Hall of Fame inductee (1936)', 'Among the first 5 players ever elected to HOF'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=babe+ruth+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'mike-trout',
    name: 'Mike Trout',
    sport: 'baseball',
    bio: "Mike Trout is widely considered the greatest baseball player of his generation. Playing for the Los Angeles Angels since 2011, Trout won 3 AL MVP Awards before age 29. His Bowman Chrome prospect card became the most valuable modern baseball card when it sold for $3.9M in 2020.",
    careerHighlights: ['3× AL MVP (2014, 2016, 2019)', '10× Silver Slugger', '9× All-Star', '.301 career batting average', 'Best WAR in baseball multiple times over', '2009 Bowman Chrome RC sold for $3,936,000'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=mike+trout+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'derek-jeter',
    name: 'Derek Jeter',
    sport: 'baseball',
    bio: "Derek Jeter spent his entire 20-year career with the New York Yankees, winning 5 World Series titles and earning the captaincy. His 1993 SP rookie card is the hobby's most notoriously difficult PSA 10 — only 8 copies have ever graded PSA 10 due to the card's foil surface centering issues.",
    careerHighlights: ['5× World Series Champion', '14× All-Star', '3465 career hits (6th all-time)', 'AL Rookie of the Year (1996)', '5× Gold Glove', 'Hall of Fame inductee (2020)'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=derek+jeter+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'ken-griffey-jr',
    name: 'Ken Griffey Jr.',
    sport: 'baseball',
    bio: "Ken Griffey Jr.'s card #1 in Upper Deck's landmark 1989 set introduced a generation to premium card collecting. His effortless swing and pure athleticism made him the face of baseball in the 1990s. Griffey won 10 consecutive Gold Gloves and was selected to 13 All-Star Games.",
    careerHighlights: ['10× Gold Glove', '13× All-Star', '630 career home runs', '1997 AL MVP', 'Hall of Fame inductee (2016)', '1989 UD #1 card is the most iconic modern baseball RC'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=ken+griffey+jr+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'shohei-ohtani',
    name: 'Shohei Ohtani',
    sport: 'baseball',
    bio: "Shohei Ohtani is the most unique player in baseball history — simultaneously a legitimate ace starter and a .304/.380/.585 slash line hitter. His 2023 AL MVP season included 44 home runs while also posting elite pitching numbers. He signed a record $700M contract with the Dodgers in December 2023.",
    careerHighlights: ['2× AL MVP (2021, 2023)', 'Hit 44 HR + pitched at elite level in same season (2023)', '$700M record contract with Dodgers', 'Only player in history to exceed 10 HR + 10 pitching starts in multiple seasons', '3× All-Star'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=shohei+ohtani+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'honus-wagner',
    name: 'Honus Wagner',
    sport: 'baseball',
    bio: "Honus Wagner played shortstop for the Pittsburgh Pirates from 1897 to 1917 and is considered the greatest shortstop in baseball history. His T206 tobacco card became the most famous card in the hobby after Wagner allegedly forced its recall from production — fewer than 60 authenticated copies exist.",
    careerHighlights: ['.328 career batting average', '8× NL batting champion', '3420 career hits', 'Hall of Fame inductee (1936)', 'Among the first 5 players ever elected to HOF', 'T206 card sold for $7,250,000 in 2021'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=honus+wagner+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'michael-jordan',
    name: 'Michael Jordan',
    sport: 'basketball',
    bio: "Michael Jordan is the standard by which all NBA players are measured. 6 championships, 6 Finals MVPs, and a career that defined an era. His 1986-87 Fleer rookie is the most iconic basketball card ever produced, and his 1984-85 Star Company first-year card is the holy grail for Jordan collectors.",
    careerHighlights: ['6× NBA Champion', '6× Finals MVP', '5× MVP', '14× All-Star', '10× scoring champion', 'Hall of Fame inductee (2009)', '1986 Fleer RC PSA 10 sold for $738,000'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=michael+jordan+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'lebron-james',
    name: 'LeBron James',
    sport: 'basketball',
    bio: "LeBron James is the NBA's all-time leading scorer and 4-time champion. His 2003-04 Exquisite Collection rookie patch auto sold for $5.2M — the most valuable basketball card ever. Collectors debate GOAT status with Jordan; the market for LeBron cards rivals Jordan's across all eras.",
    careerHighlights: ['4× NBA Champion', '4× Finals MVP', '4× MVP', 'NBA all-time scoring leader', '20× All-Star', 'Hall of Fame eligible 2025', '2003-04 Exquisite RPA sold for $5,200,000'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=lebron+james+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'kobe-bryant',
    name: 'Kobe Bryant',
    sport: 'basketball',
    bio: "Kobe Bryant spent his entire 20-year career with the Los Angeles Lakers, winning 5 championships and becoming one of the most technically gifted scorers in NBA history. Following his tragic death in January 2020, demand for his cards exploded — PSA 10 copies of his 1996-97 Topps Chrome rookie now regularly sell for seven figures.",
    careerHighlights: ['5× NBA Champion', '2× Finals MVP', '18× All-Star', '81-point single game (2006)', '33,643 career points', 'Hall of Fame inductee (2020)', '1996-97 Topps Chrome RC PSA 10 sold for $1,795,000'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=kobe+bryant+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'luka-doncic',
    name: 'Luka Doncic',
    sport: 'basketball',
    bio: "Luka Doncic arrived in the NBA at 19 and immediately produced All-Star numbers. A two-time MVP, Doncic's combination of playmaking, shooting, and basketball IQ has made him the face of the next generation of NBA superstars. His 1/1 Gold Logoman auto sold for $4.2M in February 2021.",
    careerHighlights: ['2× MVP (2024, 2025)', '2× All-NBA First Team', 'Rookie of the Year (2019)', 'NBA All-Star multiple times', 'EuroLeague champion at 19', '1/1 Gold Logoman auto sold for $4,200,000'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=luka+doncic+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'victor-wembanyama',
    name: 'Victor Wembanyama',
    sport: 'basketball',
    bio: "Victor Wembanyama is the most anticipated NBA draft prospect in a generation. At 7'4\" with elite agility, shooting range, and shot-blocking ability, Wembanyama is redefining what a center can be. Selected #1 overall by the Spurs in 2023, his first-year cards are among the most watched in the modern hobby.",
    careerHighlights: ['#1 overall pick (2023 NBA Draft)', 'NBA Rookie of the Year (2024)', 'Most-blocked shots per game in NBA history as a rookie', 'First player in 40 years with 1,000+ points, 500+ rebounds, 150+ blocks as a rookie', 'French national team star'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=victor+wembanyama+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'tom-brady',
    name: 'Tom Brady',
    sport: 'football',
    bio: "Tom Brady is the unambiguous GOAT of NFL quarterbacks. 7 Super Bowl championships — 3 with different teams — define a career unlike any other. His 2000 Playoff Contenders autographed rookie numbered to 100 copies sold for $3.1M in 2022, cementing his status as the most collectible modern football player.",
    careerHighlights: ['7× Super Bowl Champion', '5× Super Bowl MVP', '3× NFL MVP', '15× Pro Bowl', '89,214 career passing yards (all-time record)', '2000 Playoff Contenders Auto RC sold for $3,107,852'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=tom+brady+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'patrick-mahomes',
    name: 'Patrick Mahomes',
    sport: 'football',
    bio: "Patrick Mahomes has won 3 Super Bowl titles by age 29, establishing himself as the dominant quarterback of his era and a legitimate GOAT candidate. His National Treasures rookie patch auto sold for $861,000 in 2021 and remains the benchmark Mahomes rookie.",
    careerHighlights: ['3× Super Bowl Champion', '2× Super Bowl MVP', '2× NFL MVP (2018, 2022)', '3× All-Pro', 'Franchise record holder for TD passes in a season', '2017 National Treasures RPA sold for $861,000'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=patrick+mahomes+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'joe-montana',
    name: 'Joe Montana',
    sport: 'football',
    bio: "Joe Montana won 4 Super Bowls without ever throwing a Super Bowl interception — a perfect postseason record unmatched in the sport. Cool Joe's 1981 Topps rookie is the primary Montana card and a blue chip in vintage football collecting.",
    careerHighlights: ['4× Super Bowl Champion', '4× Super Bowl MVP', '2× NFL MVP', '8× Pro Bowl', 'Never threw an interception in 122 Super Bowl pass attempts', 'Hall of Fame inductee (2000)'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=joe+montana+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'peyton-manning',
    name: 'Peyton Manning',
    sport: 'football',
    bio: "Peyton Manning is one of the most accomplished quarterbacks in NFL history, winning Super Bowls with two different franchises and setting multiple passing records. His 5 MVP awards are the most in NFL history. The 1998 Playoff Contenders Ticket is his most sought-after rookie.",
    careerHighlights: ['2× Super Bowl Champion', '5× NFL MVP (NFL record)', '14× Pro Bowl', '71,940 career passing yards', 'Held single-season TD record (55 TDs in 2013)', 'Hall of Fame inductee (2021)'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=peyton+manning+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'wayne-gretzky',
    name: 'Wayne Gretzky',
    sport: 'hockey',
    bio: "Wayne Gretzky holds 61 NHL records that may never be broken. His career assist total (1,963) alone exceeds the total points of every other player in NHL history. The Great One's 1979-80 O-Pee-Chee rookie card sold for $3.75M in PSA 10 — the most valuable hockey card ever sold.",
    careerHighlights: ['4× Stanley Cup Champion', '9× Hart Trophy (MVP)', '10× Ross Trophy (scoring champion)', '2857 career points (nearest player has ~2100)', '61 NHL records', 'OPC rookie PSA 10 sold for $3,750,000'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=wayne+gretzky+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'bobby-orr',
    name: 'Bobby Orr',
    sport: 'hockey',
    bio: "Bobby Orr revolutionized the defenseman position, becoming the only defenseman to win the NHL scoring title (twice). His spectacular rushing style and elite defensive play made him the consensus best defenseman in history. His 1966-67 Topps rookie is among the rarest vintage hockey cards in PSA 9.",
    careerHighlights: ['2× Stanley Cup Champion', '8× Norris Trophy (best defenseman)', '2× Art Ross Trophy (scoring champion)', '3× Hart Trophy', '2× Conn Smythe', 'Hall of Fame inductee (1979 — first year eligible)'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=bobby+orr+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'connor-mcdavid',
    name: 'Connor McDavid',
    sport: 'hockey',
    bio: "Connor McDavid is the best hockey player of his generation, widely considered the most gifted natural skater the sport has seen since Gretzky. With 4 Hart Trophies and multiple scoring titles before age 30, his Young Guns rookie is the primary investment card in the modern hockey market.",
    careerHighlights: ['4× Hart Trophy', '4× Art Ross Trophy (scoring champion)', 'Multiple 100+ point seasons', 'First player to score 150 points since Mario Lemieux', 'Fastest skater in NHL history', 'Captain of the Edmonton Oilers at 19'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=connor+mcdavid+card+psa&LH_Complete=1&LH_Sold=1',
  },
  {
    slug: 'sidney-crosby',
    name: 'Sidney Crosby',
    sport: 'hockey',
    bio: "Sidney Crosby is the most decorated captain in NHL history, winning 3 Stanley Cups and cementing the Pittsburgh Penguins dynasty. His 2005-06 Upper Deck Young Guns rookie is the benchmark modern hockey card and has shown strong appreciation over the past decade.",
    careerHighlights: ['3× Stanley Cup Champion', '2× Hart Trophy', '2× Art Ross Trophy', '2× Olympic Gold Medal', 'NHL All-Star multiple times', 'YG rookie PSA 10 sold for $228,300'],
    ebaySearchUrl: 'https://www.ebay.com/sch/i.html?_nkw=sidney+crosby+card+psa&LH_Complete=1&LH_Sold=1',
  },
];

// Map player slugs to card player name in sportsCards data
const playerNameMap: Record<string, string> = {
  'mickey-mantle': 'Mickey Mantle',
  'babe-ruth': 'Babe Ruth',
  'mike-trout': 'Mike Trout',
  'derek-jeter': 'Derek Jeter',
  'ken-griffey-jr': 'Ken Griffey Jr.',
  'shohei-ohtani': 'Shohei Ohtani',
  'honus-wagner': 'Honus Wagner',
  'michael-jordan': 'Michael Jordan',
  'lebron-james': 'LeBron James',
  'kobe-bryant': 'Kobe Bryant',
  'luka-doncic': 'Luka Doncic',
  'victor-wembanyama': 'Victor Wembanyama',
  'tom-brady': 'Tom Brady',
  'patrick-mahomes': 'Patrick Mahomes',
  'joe-montana': 'Joe Montana',
  'peyton-manning': 'Peyton Manning',
  'wayne-gretzky': 'Wayne Gretzky',
  'bobby-orr': 'Bobby Orr',
  'connor-mcdavid': 'Connor McDavid',
  'sidney-crosby': 'Sidney Crosby',
};

const sportColors: Record<string, string> = {
  baseball: 'from-red-950 via-gray-900 to-gray-950',
  basketball: 'from-orange-950 via-gray-900 to-gray-950',
  football: 'from-blue-950 via-gray-900 to-gray-950',
  hockey: 'from-cyan-950 via-gray-900 to-gray-950',
};

const sportBadge: Record<string, string> = {
  baseball: 'bg-red-900/50 text-red-300',
  basketball: 'bg-orange-900/50 text-orange-300',
  football: 'bg-blue-900/50 text-blue-300',
  hockey: 'bg-cyan-900/50 text-cyan-300',
};

const sportIcons: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

export async function generateStaticParams() {
  return playerProfiles.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = playerProfiles.find(p => p.slug === slug);
  if (!player) return { title: 'Player Not Found' };
  return {
    title: `${player.name} Cards — Complete Checklist & Values`,
    description: `Every ${player.name} card we track, sorted by value. Career highlights, record sale prices, and current market ranges for all grades.`,
  };
}

export default async function PlayerPage({ params }: Props) {
  const { slug } = await params;
  const player = playerProfiles.find(p => p.slug === slug);
  if (!player) notFound();

  const playerName = playerNameMap[slug];
  const playerCards: SportsCard[] = playerName
    ? sportsCards.filter(c => c.player === playerName)
    : [];

  // Get the record sale for the most valuable card
  const topSale = playerCards.reduce<{ card: SportsCard; price: string; priceValue: number } | null>((best, card) => {
    const sales = getNotableSales(card.slug);
    if (!sales || !sales.sales[0]) return best;
    const top = sales.sales[0];
    if (!best || top.priceValue > best.priceValue) {
      return { card, price: top.price, priceValue: top.priceValue };
    }
    return best;
  }, null);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className={`bg-gradient-to-b ${sportColors[player.sport]} py-12`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/players" className="hover:text-gray-300 transition-colors">Players</Link>
            <span>/</span>
            <span className="text-gray-300">{player.name}</span>
          </nav>

          <div className="flex items-start gap-4 mb-6">
            <span className="text-5xl">{sportIcons[player.sport]}</span>
            <div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sportBadge[player.sport]} mb-2 inline-block`}>
                {player.sport.charAt(0).toUpperCase() + player.sport.slice(1)}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{player.name}</h1>
              {topSale && (
                <p className="text-gray-400 text-sm mt-1">
                  Record sale: <span className="text-amber-400 font-bold">{topSale.price}</span>
                  <span className="text-gray-600"> · {topSale.card.name}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-400 leading-relaxed max-w-3xl mb-6">{player.bio}</p>

          {/* Career highlights */}
          <div className="flex flex-wrap gap-2">
            {player.careerHighlights.map(h => (
              <span key={h} className="bg-gray-800/60 border border-gray-700/50 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card checklist */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {playerCards.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Complete Card Checklist
                <span className="text-gray-500 text-sm font-normal ml-2">({playerCards.length} cards tracked)</span>
              </h2>
              <a
                href={player.ebaySearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/40 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
              >
                Search eBay →
              </a>
            </div>

            <CardGrid columns={4}>
              {playerCards.map(card => (
                <SportsCardTile key={card.slug} card={card} />
              ))}
            </CardGrid>
          </>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <p className="text-gray-400 mb-4">Detailed card checklist for {player.name} is being compiled.</p>
            <a
              href={player.ebaySearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-600/40 text-yellow-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Search eBay sold listings →
            </a>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/players" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            ← All Players
          </Link>
          <Link href={`/sports#${player.sport}`} className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Browse {player.sport.charAt(0).toUpperCase() + player.sport.slice(1)} Cards
          </Link>
          <Link href="/guides/investing-101" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Investing Guide
          </Link>
          <Link href="/price-guide" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
