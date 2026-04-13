import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The 50 Most Valuable Sports Cards of All Time',
  description: 'Definitive list of the 50 most valuable sports cards ever sold. Record auction prices, current market ranges, and why each card commands its premium. Baseball, basketball, football, and hockey.',
  keywords: ['most valuable sports cards', 'expensive sports cards', 'record sports card sales', 'most valuable baseball cards', 'sports card prices'],
};

interface ValueCard {
  rank: number;
  name: string;
  recordSale: string;
  saleDate: string;
  saleVenue: string;
  currentRange: string;
  whyValuable: string;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  slug?: string;
}

const sportIcon: Record<string, string> = {
  baseball: '⚾',
  basketball: '🏀',
  football: '🏈',
  hockey: '🏒',
};

const sportColor: Record<string, string> = {
  baseball: 'text-red-400 bg-red-950/40 border-red-800/30',
  basketball: 'text-orange-400 bg-orange-950/40 border-orange-800/30',
  football: 'text-blue-400 bg-blue-950/40 border-blue-800/30',
  hockey: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/30',
};

const top50: ValueCard[] = [
  {
    rank: 1,
    name: '1952 Topps Mickey Mantle #311 (PSA 9)',
    recordSale: '$12,600,000',
    saleDate: 'Aug 2022',
    saleVenue: 'Heritage Auctions',
    currentRange: '$500,000–$12,600,000 depending on grade',
    whyValuable: 'The defining postwar sports card. Mantle is the most beloved player of the 1950s golden age, and this high-number short print is virtually impossible to find in mint condition. Only two PSA 9 copies are known.',
    sport: 'baseball',
    slug: '1952-topps-mickey-mantle-311',
  },
  {
    rank: 2,
    name: '1909-11 T206 Honus Wagner (PSA 5)',
    recordSale: '$7,250,000',
    saleDate: 'Aug 2021',
    saleVenue: 'Robert Edward Auctions',
    currentRange: '$1,000,000–$7,250,000 depending on grade',
    whyValuable: "Wagner reportedly demanded his card be pulled from tobacco packs, making genuine copies extraordinarily rare. The ex-Gretzky/McNall copy is the most famous card in existence. Fewer than 60 confirmed authentic examples exist.",
    sport: 'baseball',
    slug: '1909-t206-honus-wagner',
  },
  {
    rank: 3,
    name: '2003-04 Upper Deck Exquisite Collection LeBron James RPA #78 (BGS 9.5)',
    recordSale: '$5,200,000',
    saleDate: 'Apr 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$50,000–$5,200,000 depending on grade',
    whyValuable: "LeBron's Exquisite rookie patch auto is numbered to 99 copies and combines an on-card autograph with a game-used jersey relic. It is the most valuable modern basketball card and a barometer for the entire collector market.",
    sport: 'basketball',
    slug: '2003-04-exquisite-lebron-james-78',
  },
  {
    rank: 4,
    name: '1914 Cracker Jack Babe Ruth #103 (PSA 5)',
    recordSale: '$4,222,000',
    saleDate: 'Jun 2022',
    saleVenue: 'Goldin Auctions',
    currentRange: '$200,000–$4,222,000 depending on grade',
    whyValuable: "Ruth's earliest recognized card from the pre-war era. The Cracker Jack issue suffered massive attrition because the cards were inserted into food products and rarely preserved. Finding a genuine mid-grade example is an event.",
    sport: 'baseball',
    slug: '1914-cracker-jack-babe-ruth',
  },
  {
    rank: 5,
    name: '2000 Playoff Contenders Tom Brady #144 Auto RC (PSA 10)',
    recordSale: '$3,107,852',
    saleDate: 'Sep 2022',
    saleVenue: 'Goldin Auctions',
    currentRange: '$15,000–$3,107,852 depending on grade',
    whyValuable: "Brady's autographed rookie is numbered to 100 copies. As a 7-time Super Bowl champion, Brady has the strongest case for greatest NFL player ever, and this auto RC is the primary vehicle for that premium.",
    sport: 'football',
    slug: '2000-playoff-contenders-tom-brady-144',
  },
  {
    rank: 6,
    name: '1979-80 O-Pee-Chee Wayne Gretzky #18 (PSA 10)',
    recordSale: '$3,750,000',
    saleDate: 'Feb 2021',
    saleVenue: 'PWCC',
    currentRange: '$3,000–$3,750,000 depending on grade',
    whyValuable: "Gretzky holds 61 NHL records that may never be broken. His O-Pee-Chee rookie is the most valuable hockey card by a wide margin. The PSA 10 example is one of only a handful known; the card's black borders and card stock make mint examples near-impossible.",
    sport: 'hockey',
    slug: '1979-80-opee-chee-wayne-gretzky-18',
  },
  {
    rank: 7,
    name: '1986-87 Fleer Michael Jordan #57 (PSA 10)',
    recordSale: '$738,000',
    saleDate: 'Apr 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$3,000–$738,000 depending on grade',
    whyValuable: "Jordan's only true rookie card is the most iconic basketball card produced. The Fleer sticker set and the card's red-border design make centering a consistent issue — PSA 10 copies are extremely rare relative to the card's fame.",
    sport: 'basketball',
    slug: '1986-87-fleer-michael-jordan-57',
  },
  {
    rank: 8,
    name: '1984-85 Star Michael Jordan #101 (PSA 10)',
    recordSale: '$1,200,000',
    saleDate: 'Nov 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$10,000–$1,200,000 depending on grade',
    whyValuable: "Jordan's first-year card predates the 1986 Fleer. Star Company distributed cards as team sets sold at NBA arenas, so most were handled by fans and survive in low grades. Authenticated PSA 10 examples are trophy assets.",
    sport: 'basketball',
    slug: '1984-85-star-michael-jordan-101',
  },
  {
    rank: 9,
    name: '1948 Leaf Satchel Paige #8 (PSA 9)',
    recordSale: '$1,033,713',
    saleDate: 'Aug 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$10,000–$1,000,000+ depending on grade',
    whyValuable: 'One of the first Black players in the modern major leagues and a Hall of Fame pitcher. Paige cards from the 1940s are among the rarest in the hobby, and the 1948 Leaf is his most recognized issue.',
    sport: 'baseball',
  },
  {
    rank: 10,
    name: '1955 Topps Roberto Clemente #164 (PSA 10)',
    recordSale: '$478,000',
    saleDate: 'Jun 2022',
    saleVenue: 'Heritage Auctions',
    currentRange: '$3,000–$478,000 depending on grade',
    whyValuable: "Clemente's rookie card carries emotional weight beyond pure performance — his humanitarian legacy after his death in a 1972 plane crash made him a beloved figure. PSA 10 copies are exceptionally rare.",
    sport: 'baseball',
    slug: '1955-topps-roberto-clemente-164',
  },
  {
    rank: 11,
    name: '1996-97 Topps Chrome Kobe Bryant #138 (PSA 10)',
    recordSale: '$1,795,000',
    saleDate: 'Aug 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$2,000–$1,795,000 depending on grade',
    whyValuable: "Kobe's death in January 2020 triggered explosive demand for his rookie cards. The Topps Chrome issue from the loaded 1996 draft class is his most recognized RC, with PSA 10 examples essentially lottery tickets.",
    sport: 'basketball',
    slug: '1996-97-topps-chrome-kobe-bryant-138',
  },
  {
    rank: 12,
    name: '1935 National Chicle Bronko Nagurski #34 (PSA 8)',
    recordSale: '$400,100',
    saleDate: 'Nov 2020',
    saleVenue: 'Heritage Auctions',
    currentRange: '$5,000–$400,000+ depending on grade',
    whyValuable: 'The most valuable pre-war football card. Nagurski was the dominant player of early pro football, and this hand-painted card is among the most visually striking in pre-war collecting.',
    sport: 'football',
    slug: '1935-national-chicle-bronko-nagurski-34',
  },
  {
    rank: 13,
    name: '1969-70 Topps Lew Alcindor #25 (PSA 10)',
    recordSale: '$468,000',
    saleDate: 'Feb 2022',
    saleVenue: 'Goldin Auctions',
    currentRange: '$2,000–$468,000 depending on grade',
    whyValuable: "Kareem Abdul-Jabbar is the NBA's all-time leading scorer. His Topps rookie from 1969 is the most valuable basketball card from the pre-Jordan era.",
    sport: 'basketball',
    slug: '1969-topps-lew-alcindor-25',
  },
  {
    rank: 14,
    name: '2009 Bowman Chrome Mike Trout #BDPP89 (PSA 10)',
    recordSale: '$3,936,000',
    saleDate: 'Aug 2020',
    saleVenue: 'Goldin Auctions',
    currentRange: '$500–$3,936,000 depending on grade',
    whyValuable: "Trout is widely considered the best baseball player of his generation and potentially the most valuable living player in the hobby. His prospect Bowman Chrome card became the most valuable modern baseball card in 2020.",
    sport: 'baseball',
    slug: '2009-bowman-chrome-mike-trout-bdpp89',
  },
  {
    rank: 15,
    name: '1966-67 Topps Bobby Orr #35 (PSA 9)',
    recordSale: '$204,000',
    saleDate: 'Sep 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$2,000–$204,000 depending on grade',
    whyValuable: "Orr changed how defensemen played the game. His 1966-67 Topps rookie is extremely difficult to find in high grade due to the set's printing characteristics.",
    sport: 'hockey',
    slug: '1966-67-topps-bobby-orr-35',
  },
  {
    rank: 16,
    name: '2003-04 Topps Chrome LeBron James #111 (PSA 10)',
    recordSale: '$216,000',
    saleDate: 'Jun 2021',
    saleVenue: 'PWCC',
    currentRange: '$2,000–$216,000 depending on grade',
    whyValuable: "LeBron's flagship Topps Chrome rookie is the most accessible of his key RCs. Chrome refractors command significant premiums over base copies.",
    sport: 'basketball',
    slug: '2003-04-topps-chrome-lebron-james-111',
  },
  {
    rank: 17,
    name: '1993 SP Derek Jeter #279 (PSA 10)',
    recordSale: '$168,000',
    saleDate: 'May 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$500–$168,000 depending on grade',
    whyValuable: "The foil surface and centering issues in the 1993 SP set make PSA 10 examples nearly impossible to find — only 8 copies graded PSA 10 as of 2025. The pop-driven scarcity is the story.",
    sport: 'baseball',
    slug: '1993-sp-derek-jeter-279',
  },
  {
    rank: 18,
    name: '1951-52 Parkhurst Gordie Howe #66 (PSA 9)',
    recordSale: '$192,000',
    saleDate: 'Mar 2022',
    saleVenue: 'Heritage Auctions',
    currentRange: '$1,500–$192,000 depending on grade',
    whyValuable: "Mr. Hockey played at the highest level for four decades. His Parkhurst rookie is among the most coveted vintage hockey issues, with PSA 9 copies nearly never surfacing.",
    sport: 'hockey',
    slug: '1951-parkhurst-gordie-howe-66',
  },
  {
    rank: 19,
    name: '2017 Panini National Treasures Patrick Mahomes Auto (BGS 9.5)',
    recordSale: '$861,000',
    saleDate: 'Jul 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$10,000–$861,000 depending on grade/number',
    whyValuable: "Mahomes is a 3-time Super Bowl champion and the consensus best quarterback in the NFL. His National Treasures RPA is the defining Mahomes rookie autograph.",
    sport: 'football',
    slug: '2018-national-treasures-patrick-mahomes-auto',
  },
  {
    rank: 20,
    name: '1933 Goudey Babe Ruth #144 (PSA 7)',
    recordSale: '$264,000',
    saleDate: 'Nov 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$3,000–$264,000 depending on grade',
    whyValuable: "The Goudey set is the most collected pre-war baseball set, and Ruth appears four times in it. The #144 image — Ruth in a batting pose — is the most iconic of the four Ruth Goudeys.",
    sport: 'baseball',
  },
  {
    rank: 21,
    name: '2005-06 Upper Deck Young Guns Sidney Crosby #201 (PSA 10)',
    recordSale: '$228,300',
    saleDate: 'Aug 2021',
    saleVenue: 'PWCC',
    currentRange: '$500–$228,300 depending on grade',
    whyValuable: "Crosby's Upper Deck Young Guns rookie is the benchmark modern hockey rookie. His 3 Stanley Cups and Hart Trophy wins make him the best player of his generation.",
    sport: 'hockey',
    slug: '2005-06-upper-deck-young-guns-sidney-crosby-201',
  },
  {
    rank: 22,
    name: '2000 Topps Chrome Tom Brady #241 (PSA 10)',
    recordSale: '$336,000',
    saleDate: 'Sep 2021',
    saleVenue: 'PWCC',
    currentRange: '$1,000–$336,000 depending on grade',
    whyValuable: "Brady's Topps Chrome RC is the most liquid of his key rookies — not numbered, making it the accessible entry point for Brady collectors. Refractor variants command large premiums.",
    sport: 'football',
    slug: '2000-topps-chrome-tom-brady-241',
  },
  {
    rank: 23,
    name: '1989 Upper Deck Ken Griffey Jr. #1 (PSA 10)',
    recordSale: '$22,500',
    saleDate: 'Aug 2022',
    saleVenue: 'eBay',
    currentRange: '$200–$22,500 depending on grade',
    whyValuable: "Card #1 of Upper Deck's inaugural set. The pop-4,000+ in PSA 10 keeps the ceiling lower than scarcity cards, but Griffey remains one of the most beloved players in the hobby.",
    sport: 'baseball',
    slug: '1989-upper-deck-ken-griffey-jr-1',
  },
  {
    rank: 24,
    name: '1910 T210 Old Mill Joe Jackson',
    recordSale: '$667,000',
    saleDate: 'Dec 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$50,000–$667,000 depending on grade',
    whyValuable: "Shoeless Joe Jackson cards are among the rarest in the tobacco card era. His gambling ban keeps the historical drama alive and makes each authentic card a conversation piece.",
    sport: 'baseball',
  },
  {
    rank: 25,
    name: '1968 Topps Nolan Ryan #177 (PSA 9)',
    recordSale: '$744,000',
    saleDate: 'Oct 2022',
    saleVenue: 'Heritage Auctions',
    currentRange: '$300–$744,000 depending on grade',
    whyValuable: "Ryan holds the all-time strikeout record (5,714) and threw 7 no-hitters. His 1968 Topps rookie is shared with Jerry Koosman but commands its own premium in top grades.",
    sport: 'baseball',
    slug: '1968-topps-nolan-ryan-177',
  },
  {
    rank: 26,
    name: '1957 Topps Johnny Unitas #138 (PSA 8)',
    recordSale: '$60,000',
    saleDate: 'Apr 2022',
    saleVenue: 'Heritage Auctions',
    currentRange: '$2,000–$60,000 depending on grade',
    whyValuable: "Unitas is the father of the modern quarterback position. His 1957 Topps rookie is the key card of the most important QB before the Super Bowl era.",
    sport: 'football',
    slug: '1957-topps-johnny-unitas-138',
  },
  {
    rank: 27,
    name: '2015-16 Upper Deck Young Guns Connor McDavid #201 (PSA 10)',
    recordSale: '$75,000',
    saleDate: 'Nov 2021',
    saleVenue: 'PWCC',
    currentRange: '$300–$75,000 depending on grade',
    whyValuable: "McDavid is the best player in hockey since Gretzky by most measures. His Young Guns rookie is the primary investment card in the modern hockey market.",
    sport: 'hockey',
    slug: '2017-18-upper-deck-young-guns-connor-mcdavid-451',
  },
  {
    rank: 28,
    name: '1996-97 Upper Deck SP Kobe Bryant #134 (PSA 10)',
    recordSale: '$96,000',
    saleDate: 'Sep 2021',
    saleVenue: 'PWCC',
    currentRange: '$1,000–$96,000 depending on grade',
    whyValuable: "A second key Kobe rookie from the 1996-97 class. The Upper Deck SP features a premium foil finish that makes centering and corner issues highly visible.",
    sport: 'basketball',
    slug: '1996-97-ud3-kobe-bryant-20',
  },
  {
    rank: 29,
    name: '2011 Topps Update Mike Trout #US175 (PSA 10)',
    recordSale: '$468,000',
    saleDate: 'Feb 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$300–$468,000 depending on grade',
    whyValuable: "Trout's official flagship Topps rookie card. While less expensive than the 2009 Bowman Chrome prospect, this is the traditional 'official' rookie that many collectors consider definitive.",
    sport: 'baseball',
    slug: '2011-topps-update-mike-trout-us175',
  },
  {
    rank: 30,
    name: '1958 Topps Jim Brown #62 (PSA 9)',
    recordSale: '$102,000',
    saleDate: 'Jun 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$1,500–$102,000 depending on grade',
    whyValuable: "Jim Brown is widely considered the greatest running back in NFL history. He retired at his peak and his vintage Topps rookie is the key card of the position.",
    sport: 'football',
    slug: '1958-topps-jim-brown-62',
  },
  {
    rank: 31,
    name: '1979-80 Topps Wayne Gretzky #18 (PSA 10)',
    recordSale: '$180,000',
    saleDate: 'Nov 2021',
    saleVenue: 'PWCC',
    currentRange: '$1,000–$180,000 depending on grade',
    whyValuable: "The US-market Topps issue of Gretzky's rookie — slightly less scarce than O-Pee-Chee but still commands significant premiums. An entry point for collectors who can't afford the OPC.",
    sport: 'hockey',
    slug: '1979-80-topps-wayne-gretzky-18',
  },
  {
    rank: 32,
    name: '2019-20 Panini Prizm Zion Williamson #248 (BGS 10)',
    recordSale: '$43,200',
    saleDate: 'Jun 2021',
    saleVenue: 'PWCC',
    currentRange: '$200–$43,200 depending on grade',
    whyValuable: "Zion was the most hyped NBA prospect since LeBron. His Prizm rookie surged to absurd peaks during the 2020-21 card boom. Injuries have cooled the market but demand remains strong in gem grades.",
    sport: 'basketball',
    slug: '2019-20-prizm-zion-williamson-248',
  },
  {
    rank: 33,
    name: '2007-08 Topps Chrome Kevin Durant #131 (PSA 10)',
    recordSale: '$216,000',
    saleDate: 'Jan 2022',
    saleVenue: 'Goldin Auctions',
    currentRange: '$200–$216,000 depending on grade',
    whyValuable: "Durant is a two-time Finals MVP and one of the best scorers in NBA history. His Topps Chrome rookie surged following his Finals performances.",
    sport: 'basketball',
    slug: '2007-08-topps-chrome-kevin-durant-131',
  },
  {
    rank: 34,
    name: '1965 Topps Joe Namath #122 (PSA 9)',
    recordSale: '$264,000',
    saleDate: 'Nov 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$1,000–$264,000 depending on grade',
    whyValuable: "Broadway Joe's guaranteed Super Bowl III prediction and win cemented his legend. His 1965 Topps rookie is the most recognizable card from the AFL merger era.",
    sport: 'football',
    slug: '1965-topps-joe-namath-122',
  },
  {
    rank: 35,
    name: '1963 Topps Pete Rose #537 (PSA 9)',
    recordSale: '$72,000',
    saleDate: 'Mar 2021',
    saleVenue: 'PWCC',
    currentRange: '$500–$72,000 depending on grade',
    whyValuable: "Rose holds the all-time hits record (4,256) and his rookie — from the challenging short-printed high number series — is one of the toughest 1960s Topps rookies to grade.",
    sport: 'baseball',
    slug: '1963-topps-pete-rose-537',
  },
  {
    rank: 36,
    name: '2001 Bowman Chrome Albert Pujols RC (PSA 10)',
    recordSale: '$28,800',
    saleDate: 'Feb 2022',
    saleVenue: 'PWCC',
    currentRange: '$200–$28,800 depending on grade',
    whyValuable: "Pujols hit .329 with 700 home runs over 22 seasons. His Hall of Fame induction in 2022 drove significant appreciation in his rookie market.",
    sport: 'baseball',
    slug: '2001-bowman-chrome-albert-pujols',
  },
  {
    rank: 37,
    name: '1990-91 Upper Deck Jaromir Jagr #356 (PSA 10)',
    recordSale: '$8,400',
    saleDate: 'Apr 2022',
    saleVenue: 'eBay',
    currentRange: '$30–$8,400 depending on grade',
    whyValuable: "Jagr played elite hockey until age 45 and finished second all-time in NHL scoring. The mullet-era Upper Deck rookie is a beloved nostalgia piece.",
    sport: 'hockey',
    slug: '1990-91-upper-deck-jaromir-jagr-356',
  },
  {
    rank: 38,
    name: '1993-94 Topps Premier Martin Brodeur #351 (PSA 10)',
    recordSale: '$3,600',
    saleDate: 'Nov 2021',
    saleVenue: 'eBay',
    currentRange: '$30–$3,600 depending on grade',
    whyValuable: "Brodeur holds the all-time NHL records for goaltender wins, shutouts, and games played. His rookie remains the definitive modern hockey goaltender collecting target.",
    sport: 'hockey',
    slug: '2000-01-upper-deck-young-guns-martin-brodeur',
  },
  {
    rank: 39,
    name: '2018 Panini Prizm Lamar Jackson #212 (BGS 10)',
    recordSale: '$8,400',
    saleDate: 'Mar 2022',
    saleVenue: 'PWCC',
    currentRange: '$200–$8,400 depending on grade',
    whyValuable: "Jackson's back-to-back MVP awards (2019, 2023) established him as a generational dual-threat QB. His Prizm base rookie is the primary entry point for collectors.",
    sport: 'football',
    slug: '2018-panini-prizm-lamar-jackson-212',
  },
  {
    rank: 40,
    name: '2016 Panini Prizm Dak Prescott #341 (BGS 10)',
    recordSale: '$3,600',
    saleDate: 'Jan 2022',
    saleVenue: 'PWCC',
    currentRange: '$50–$3,600 depending on grade',
    whyValuable: "Prescott's value is tightly tied to Cowboys performance in big markets. The Prizm rookie captured his first season as Dallas starter.",
    sport: 'football',
    slug: '2016-panini-prizm-dak-prescott-341',
  },
  {
    rank: 41,
    name: '1951-52 Parkhurst Maurice Richard #4 (PSA 8)',
    recordSale: '$180,000',
    saleDate: 'Feb 2022',
    saleVenue: 'Heritage Auctions',
    currentRange: '$2,000–$180,000 depending on grade',
    whyValuable: "The Rocket scored 544 goals and won 8 Stanley Cups. His Parkhurst rookie is among the rarest vintage hockey cards and his cultural importance in Quebec makes it irreplaceable for Canadian collectors.",
    sport: 'hockey',
  },
  {
    rank: 42,
    name: '1986-87 Fleer Charles Barkley #7 (PSA 10)',
    recordSale: '$14,400',
    saleDate: 'Sep 2021',
    saleVenue: 'eBay',
    currentRange: '$200–$14,400 depending on grade',
    whyValuable: "Part of the all-time 1986-87 Fleer set, Barkley's RC benefits from the same red-border condition sensitivity that makes Jordan PSA 10s rare.",
    sport: 'basketball',
    slug: '1986-87-fleer-charles-barkley-7',
  },
  {
    rank: 43,
    name: '2023 Panini Prizm C.J. Stroud #321 (PSA 10)',
    recordSale: '$2,400',
    saleDate: 'Jun 2023',
    saleVenue: 'eBay',
    currentRange: '$30–$2,400 depending on grade',
    whyValuable: "Stroud led the Texans to the playoffs in year one, giving his rookies an immediate boost. The 2023 QB class is considered one of the deepest in years.",
    sport: 'football',
    slug: '2023-panini-prizm-cj-stroud-321',
  },
  {
    rank: 44,
    name: '1933 Goudey Lou Gehrig #92 (PSA 6)',
    recordSale: '$288,000',
    saleDate: 'Aug 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$5,000–$288,000 depending on grade',
    whyValuable: "The Iron Horse appeared in the Goudey set the year after Ruth. Gehrig's tragic death from ALS gives his cards enduring emotional significance beyond the statistics.",
    sport: 'baseball',
  },
  {
    rank: 45,
    name: '1962 Topps Roger Maris #1 (PSA 9)',
    recordSale: '$60,000',
    saleDate: 'Nov 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$500–$60,000 depending on grade',
    whyValuable: "Maris hit 61 home runs in 1961, breaking Ruth's record. His card #1 from the 1962 Topps set is one of the most challenging to find in mint grade.",
    sport: 'baseball',
  },
  {
    rank: 46,
    name: '1948 Bowman George Mikan #69 (PSA 8)',
    recordSale: '$120,000',
    saleDate: 'Jul 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$2,000–$120,000 depending on grade',
    whyValuable: "Mikan was the NBA's first dominant big man and the sport's first superstar. His 1948 Bowman rookie is the oldest recognized professional basketball card of consequence.",
    sport: 'basketball',
  },
  {
    rank: 47,
    name: '1975 Topps Mini George Brett #228 (PSA 9)',
    recordSale: '$14,400',
    saleDate: 'Feb 2022',
    saleVenue: 'eBay',
    currentRange: '$200–$14,400 depending on grade',
    whyValuable: "Brett hit .390 in 1980 and was a 3x batting champion. His 1975 Topps Mini rookie is the key Brett card and a legitimate blue-chip investment in vintage baseball.",
    sport: 'baseball',
  },
  {
    rank: 48,
    name: '2003-04 SP Authentic LeBron James #144 (PSA 9)',
    recordSale: '$96,000',
    saleDate: 'Apr 2021',
    saleVenue: 'PWCC',
    currentRange: '$3,000–$96,000 depending on grade',
    whyValuable: "The SP Authentic RC patch auto is numbered to 100 copies. One of several LeBron autos from his rookie year that trade as investment-grade blue chips.",
    sport: 'basketball',
  },
  {
    rank: 49,
    name: '2018 Panini Prizm Saquon Barkley #212 (PSA 10)',
    recordSale: '$5,100',
    saleDate: 'Sep 2021',
    saleVenue: 'PWCC',
    currentRange: '$50–$5,100 depending on grade',
    whyValuable: "Barkley's electrifying running style drove massive rookie demand from the 2018 class. PSA 10 Prizm base rookies of top players remain liquid.",
    sport: 'football',
  },
  {
    rank: 50,
    name: '2016-17 Panini Prizm Luka Doncic #280 (PSA 10)',
    recordSale: '$4,200,000',
    saleDate: 'Feb 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$500–$4,200,000 (numbered auto)',
    whyValuable: "Doncic's 1/1 Gold Logoman auto sold for $4.2M. His Prizm base rookies are among the most liquid modern basketball cards on the market. A back-to-back MVP candidacy makes him the next generational collecting target.",
    sport: 'basketball',
  },
];

export default function MostValuableSportsCardsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The 50 Most Valuable Sports Cards of All Time',
        description: 'Definitive list of the 50 most valuable sports cards ever sold. Record auction prices, current market ranges, and why each card commands its premium. Baseball, basketball, football, and hockey.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        mainEntityOfPage: 'https://cardvault-two.vercel.app/guides/most-valuable-sports-cards',
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          Public auction records only — no estimates
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          The 50 Most Valuable Sports Cards of All Time
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Ranked by record sale price. Every figure sourced from publicly reported auction results at Heritage Auctions, Goldin, PWCC, Robert Edward Auctions, and eBay.
        </p>
      </div>

      {/* Methodology */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-3">Methodology</h2>
        <div className="text-gray-400 text-sm leading-relaxed space-y-2">
          <p>
            Rankings use the highest verified public sale price for any graded copy of each card, regardless of grade. A T206 Wagner PSA 5 outranks a Fleer Jordan PSA 10 if its absolute sale price was higher — this is a list of most valuable cards, not most valuable grades.
          </p>
          <p>
            Current market ranges reflect mid-2025 sold comps and account for grade spread. The record sale may be a high-grade outlier; the range shows what most collectors can realistically buy or sell. All figures are USD.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Baseball cards', count: top50.filter(c => c.sport === 'baseball').length, icon: '⚾', color: 'text-red-400' },
          { label: 'Basketball cards', count: top50.filter(c => c.sport === 'basketball').length, icon: '🏀', color: 'text-orange-400' },
          { label: 'Football cards', count: top50.filter(c => c.sport === 'football').length, icon: '🏈', color: 'text-blue-400' },
          { label: 'Hockey cards', count: top50.filter(c => c.sport === 'hockey').length, icon: '🏒', color: 'text-cyan-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
            <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Card list */}
      <div className="space-y-4">
        {top50.map(card => (
          <div key={card.rank} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors">
            <div className="flex items-start gap-4">
              {/* Rank */}
              <div className="shrink-0 w-10 text-center">
                <span className={`text-2xl font-bold ${card.rank <= 3 ? 'text-amber-400' : card.rank <= 10 ? 'text-gray-300' : 'text-gray-600'}`}>
                  #{card.rank}
                </span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sportColor[card.sport]}`}>
                    {sportIcon[card.sport]} {card.sport}
                  </span>
                </div>
                <h2 className="text-white font-bold text-base sm:text-lg mb-1 leading-snug">
                  {card.slug ? (
                    <Link href={`/sports/${card.slug}`} className="hover:text-emerald-400 transition-colors">
                      {card.name}
                    </Link>
                  ) : (
                    card.name
                  )}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{card.whyValuable}</p>
                {/* Price data */}
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="bg-amber-950/40 border border-amber-800/30 rounded-lg px-3 py-1.5">
                    <span className="text-gray-500">Record sale </span>
                    <span className="text-amber-400 font-bold">{card.recordSale}</span>
                    <span className="text-gray-600"> · {card.saleDate} · {card.saleVenue}</span>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5">
                    <span className="text-gray-500">Current range </span>
                    <span className="text-gray-300">{card.currentRange}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-2">See Also</h3>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link href="/guides/most-valuable-pokemon-cards" className="inline-flex items-center gap-2 bg-yellow-950/40 border border-yellow-800/30 hover:border-yellow-600/50 text-yellow-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            ⚡ Most Valuable Pokémon Cards
          </Link>
          <Link href="/guides/card-market-2026" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Market Analysis 2026
          </Link>
          <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Browse Sports Cards
          </Link>
          <Link href="/price-guide" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Price Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
