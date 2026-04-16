'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ── era definitions ─────────────────────────────────────────────── */

interface EraInfo {
  name: string;
  range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  collectingTips: string[];
  valueTrend: string;
  valueTrendLabel: string;
  valueTrendColor: string;
}

const eras: { min: number; max: number; era: EraInfo }[] = [
  {
    min: 1900, max: 1941,
    era: {
      name: 'Pre-War',
      range: '1900-1941',
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-800/50',
      description: 'The dawn of sports cards. Tobacco companies like American Tobacco Co. (T206), candy makers (Goudey), and gum companies (Play Ball) issued cards as promotional inserts. Cards from this era are extremely scarce and highly prized.',
      collectingTips: [
        'Authenticity is paramount — always buy graded or from reputable dealers',
        'Even low-grade examples (PSA 1-3) hold significant value due to scarcity',
        'Tobacco cards (T-series) are the most liquid Pre-War investments',
        'Look for lesser-known sets (Cracker Jack, Sporting Life) for relative value',
        'Trimming and restoration are common — check for altered cards carefully',
      ],
      valueTrend: 'Strong and steady appreciation. Surviving population decreases every year, driving prices higher. Pre-War is considered the safest long-term hold in the hobby.',
      valueTrendLabel: 'Strong Appreciation',
      valueTrendColor: 'text-green-400',
    },
  },
  {
    min: 1942, max: 1979,
    era: {
      name: 'Vintage',
      range: '1942-1979',
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/40',
      borderColor: 'border-orange-800/50',
      description: 'The Golden Age of collecting. Bowman and Topps dominated, producing iconic sets with legends like Mickey Mantle, Hank Aaron, Willie Mays, and Roberto Clemente. The 1952 Topps set is considered the most important post-war issue.',
      collectingTips: [
        'Centering is the biggest grading challenge — check before buying raw',
        'High-number series (short prints) are significantly more valuable',
        'Topps held a virtual monopoly from 1956-1980 making sets easier to complete',
        'Key rookie cards from this era are blue-chip investments',
        'Watch for wax stains, gum damage, and rubber band marks on vintage cards',
      ],
      valueTrend: 'Consistent appreciation for key cards and complete sets. Star rookies in PSA 7+ have shown 8-12% annual returns over the past two decades. Common cards appreciate slower but remain stable.',
      valueTrendLabel: 'Steady Appreciation',
      valueTrendColor: 'text-green-400',
    },
  },
  {
    min: 1980, max: 1994,
    era: {
      name: 'Junk Wax',
      range: '1980-1994',
      color: 'text-red-400',
      bgColor: 'bg-red-950/40',
      borderColor: 'border-red-800/50',
      description: 'The era of massive overproduction. Multiple manufacturers (Topps, Fleer, Donruss, Score, Upper Deck) printed millions of copies. Speculation drove a bubble that crashed, leaving most base cards nearly worthless. However, key rookies in gem mint condition remain valuable.',
      collectingTips: [
        'Only chase key rookies in PSA 10 or BGS 9.5+ — base cards have no value',
        'The 1986 Fleer Michael Jordan, 1989 Upper Deck Griffey Jr. are the era kings',
        'Error and variation cards can be surprisingly valuable from this era',
        'Unopened wax boxes and cases are more valuable than the cards inside',
        'Nostalgia drives collecting — many buyers are reliving their childhood',
      ],
      valueTrend: 'Mostly flat for base cards. Key rookies in PSA 10 have appreciated as the pop reports show how rare true gem mints are. Unopened product has outperformed opened cards significantly.',
      valueTrendLabel: 'Flat (Exceptions Exist)',
      valueTrendColor: 'text-yellow-400',
    },
  },
  {
    min: 1995, max: 2009,
    era: {
      name: 'Modern',
      range: '1995-2009',
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-800/50',
      description: 'The technology revolution in cards. Chrome refractors, autographs, game-used memorabilia, and serial-numbered parallels transformed the hobby. Manufacturers created scarcity through limited print runs rather than relying on natural attrition.',
      collectingTips: [
        'Chrome and refractor parallels are the preferred format for modern investment',
        'Autograph and memorabilia cards command premiums, but verify authenticity',
        'Serial-numbered cards (/25, /50, /100) provide built-in scarcity',
        'Key rookies: LeBron, Brady RC, Trout Chrome are proven blue chips',
        'Condition is king — modern cards are expected to grade PSA 9 or 10',
      ],
      valueTrend: 'Key rookies of proven stars have appreciated enormously. A 2003 Topps Chrome LeBron PSA 10 went from $500 to $50K+. Lesser players and base cards have limited upside. Chrome refractors outperform base versions.',
      valueTrendLabel: 'Moderate Appreciation',
      valueTrendColor: 'text-green-400',
    },
  },
  {
    min: 2010, max: 2025,
    era: {
      name: 'Ultra-Modern',
      range: '2010-Present',
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40',
      borderColor: 'border-purple-800/50',
      description: 'The social media and pandemic boom era. Panini Prizm, Topps Chrome, and Bowman Chrome dominate. YouTube breakers, Instagram hype, and COVID-era stimulus checks drove unprecedented demand. Extreme volatility with rapid price swings tied to player performance.',
      collectingTips: [
        'Buy the player, not the hype — wait 90 days after a breakout before buying',
        'Prizm Silver, Optic Rated Rookie, and Bowman Chrome 1st are the top formats',
        'The parallel rainbow chase (base, silver, gold, green, etc.) is a key driver',
        'Sell into hype spikes — prices often drop 40-60% after initial excitement',
        'Focus on #1 picks and generational talents for the safest holds',
      ],
      valueTrend: 'Highly volatile. Cards can spike 500% on a breakout game and crash 70% on an injury. Generational talents (Wembanyama, Ohtani) hold value best. Most cards from this era will lose value within 3-5 years unless the player becomes a Hall of Famer.',
      valueTrendLabel: 'Highly Volatile',
      valueTrendColor: 'text-red-400',
    },
  },
];

/* ── year-specific data ──────────────────────────────────────────── */

interface YearData {
  context: string;
  notableCards: { name: string; desc: string; href?: string }[];
}

const yearData: Record<number, YearData> = {
  1909: {
    context: 'American Tobacco Company issues the legendary T206 set, including the ultra-rare Honus Wagner card. The most valuable baseball card ever produced.',
    notableCards: [
      { name: 'T206 Honus Wagner', desc: 'The holy grail — fewer than 60 known copies. Record sale: $12.6M', href: '/players/honus-wagner' },
      { name: 'T206 Ty Cobb', desc: 'Multiple variations, all highly sought after', href: '/players/ty-cobb' },
      { name: 'T206 Cy Young', desc: 'Portrait of the winningest pitcher ever', href: '/players/cy-young' },
    ],
  },
  1933: {
    context: 'Goudey Gum Company releases its first baseball card set, featuring hand-painted artwork. Babe Ruth has four cards in the set.',
    notableCards: [
      { name: '1933 Goudey #53 Babe Ruth', desc: 'One of four Ruth cards in the set, iconic yellow background' },
      { name: '1933 Goudey #149 Babe Ruth', desc: 'The most valuable Goudey card' },
      { name: '1933 Goudey Lou Gehrig #92', desc: 'The Iron Horse in beautiful art deco style' },
    ],
  },
  1948: {
    context: 'Bowman and Leaf enter the market, launching the post-war card era. The first widely-distributed modern baseball card sets.',
    notableCards: [
      { name: '1948 Leaf #79 Jackie Robinson', desc: 'First card of the player who broke the color barrier' },
      { name: '1948 Bowman #69 George Mikan', desc: 'First true basketball card of the NBA pioneer' },
      { name: '1948 Leaf Satchel Paige', desc: 'Legendary Negro League pitcher\'s mainstream card debut' },
    ],
  },
  1952: {
    context: 'Topps releases its landmark 1952 set — the most important post-war baseball card set ever produced. High numbers are extremely scarce as unsold cases were famously dumped in the ocean.',
    notableCards: [
      { name: '1952 Topps #311 Mickey Mantle', desc: 'The most iconic post-war baseball card. Record sale: $12.6M', href: '/players/mickey-mantle' },
      { name: '1952 Topps #261 Willie Mays', desc: 'The Say Hey Kid\'s early Topps appearance', href: '/players/willie-mays' },
      { name: '1952 Topps #1 Andy Pafko', desc: 'First card in the set — condition-sensitive due to rubber band damage' },
    ],
  },
  1957: {
    context: 'Topps introduces the standard 2.5" x 3.5" card size still used today. The set includes key rookies of Hall of Famers.',
    notableCards: [
      { name: '1957 Topps #95 Mickey Mantle', desc: 'Mantle in the new standard size format' },
      { name: '1957 Topps #35 Frank Robinson', desc: 'Rookie card of the first Black manager in MLB' },
      { name: '1957 Topps #302 Sandy Koufax', desc: 'Early card of the legendary Dodgers lefty' },
    ],
  },
  1968: {
    context: 'Topps produces the iconic "burlap" design set. Nolan Ryan\'s rookie card appears in this landmark year.',
    notableCards: [
      { name: '1968 Topps #177 Nolan Ryan RC', desc: 'The Express\'s rookie card — a perennial blue chip', href: '/players/nolan-ryan' },
      { name: '1968 Topps #247 Johnny Bench RC', desc: 'Hall of Fame catcher\'s first card' },
      { name: '1968 Topps Milton Bradley', desc: 'Scarce board game variation commands huge premiums' },
    ],
  },
  1979: {
    context: 'Wayne Gretzky\'s rookie card year. The hobby begins transitioning from the vintage era as card collecting grows in mainstream popularity.',
    notableCards: [
      { name: '1979 O-Pee-Chee #18 Wayne Gretzky RC', desc: 'The Great One\'s rookie — most valuable hockey card ever', href: '/players/wayne-gretzky' },
      { name: '1979 Topps #116 Ozzie Smith RC', desc: 'The Wizard of Oz begins his Hall of Fame journey' },
      { name: '1979 Topps #115 Nolan Ryan', desc: 'Ryan as a California Angel, still a fan favorite' },
    ],
  },
  1986: {
    context: 'Fleer produces its landmark basketball set featuring Michael Jordan\'s rookie card — the most valuable modern sports card. The Junk Wax era is in full swing.',
    notableCards: [
      { name: '1986 Fleer #57 Michael Jordan RC', desc: 'The most iconic modern sports card. PSA 10: $50K+', href: '/players/michael-jordan' },
      { name: '1986 Topps #161 Jerry Rice RC', desc: 'The GOAT wide receiver\'s rookie card', href: '/players/jerry-rice' },
      { name: '1986 Fleer #7 Charles Barkley RC', desc: 'Sir Charles begins his Hall of Fame career' },
    ],
  },
  1989: {
    context: 'Upper Deck debuts with its premium card design, forever changing the industry. Ken Griffey Jr.\'s rookie card becomes the chase card of a generation.',
    notableCards: [
      { name: '1989 Upper Deck #1 Ken Griffey Jr. RC', desc: 'The card that defined a generation of collectors', href: '/players/ken-griffey-jr' },
      { name: '1989 Fleer Bill Ripken FF Error', desc: 'The infamous profanity bat-knob error card' },
      { name: '1989 Score #270 Barry Sanders RC', desc: 'The electric Lions RB\'s first card', href: '/players/barry-sanders' },
    ],
  },
  1993: {
    context: 'Finest and SP introduce the premium card tier. Derek Jeter\'s SP rookie becomes one of the most valuable Modern era cards.',
    notableCards: [
      { name: '1993 SP #279 Derek Jeter RC', desc: 'Foil rookie of the Yankees captain. PSA 10: $50K+', href: '/players/derek-jeter' },
      { name: '1993 Finest Refractor #1 Michael Jordan', desc: 'First refractor technology — revolutionary insert' },
      { name: '1993 Upper Deck #449 Shaquille O\'Neal', desc: 'Shaq attack in his sophomore year' },
    ],
  },
  1996: {
    context: 'Kobe Bryant and Allen Iverson enter the NBA. Bowman\'s Best and Finest Refractors are the premium chase cards. The hobby shifts toward manufactured scarcity.',
    notableCards: [
      { name: '1996 Topps Chrome #138 Kobe Bryant RC', desc: 'The Black Mamba\'s iconic chrome rookie', href: '/players/kobe-bryant' },
      { name: '1996 Topps Chrome #171 Allen Iverson RC', desc: 'The Answer\'s chrome debut' },
      { name: '1996 Bowman\'s Best #R1 Allen Iverson RC', desc: 'Premium rookie card with refractor parallel' },
    ],
  },
  2000: {
    context: 'Tom Brady is drafted 199th overall. His rookie cards are virtually ignored at the time. Meanwhile, the hobby adjusts after the late-90s boom.',
    notableCards: [
      { name: '2000 Bowman Chrome #236 Tom Brady RC', desc: 'The GOAT\'s chrome rookie. Originally $5, now $50K+ in PSA 10', href: '/players/tom-brady' },
      { name: '2000 Playoff Contenders #144 Tom Brady Auto RC', desc: 'Signed rookie — the ultimate Brady card' },
      { name: '2000 SPx #130 Tom Brady RC', desc: 'Serial numbered to 1,350 copies' },
    ],
  },
  2003: {
    context: 'LeBron James enters the NBA as the most hyped prospect in history. His Topps Chrome rookie card becomes the defining card of the modern era.',
    notableCards: [
      { name: '2003 Topps Chrome #111 LeBron James RC', desc: 'The king of modern basketball cards. PSA 10: $50K+', href: '/players/lebron-james' },
      { name: '2003 Exquisite #78 LeBron James Auto Patch RC /99', desc: 'The ultimate LeBron card. Sales exceed $5M' },
      { name: '2003 Topps Chrome #115 Dwyane Wade RC', desc: 'Flash\'s chrome rookie — D-Wade\'s signature card' },
    ],
  },
  2009: {
    context: 'Mike Trout is drafted 25th overall by the Angels. Stephen Curry is selected 7th by the Warriors. Two future legends enter professional sports.',
    notableCards: [
      { name: '2009 Bowman Chrome #BDPP61 Mike Trout', desc: 'Trout\'s Bowman Chrome prospect — the top modern baseball card', href: '/players/mike-trout' },
      { name: '2009 Topps Chrome #101 Stephen Curry RC', desc: 'Chef Curry\'s chrome rookie card', href: '/players/stephen-curry' },
      { name: '2009 Bowman Chrome Draft #BDPP89 Mike Trout Auto', desc: 'Trout signed prospect — five-figure card' },
    ],
  },
  2011: {
    context: 'Panini becomes the exclusive NBA card manufacturer. Cam Newton\'s Prizm rookies launch a new format. The Ultra-Modern era begins.',
    notableCards: [
      { name: '2011 Topps Update #US175 Mike Trout RC', desc: 'The flagship Trout rookie — most popular modern baseball card', href: '/players/mike-trout' },
      { name: '2011 Panini Gold Standard #252 Cam Newton RC Auto', desc: 'Panini\'s early NBA-exclusive work' },
      { name: '2011 Bowman Chrome #175 Bryce Harper RC', desc: 'Harper\'s chrome debut as a Nationals phenom' },
    ],
  },
  2012: {
    context: 'Panini introduces Prizm for basketball — the format that will define the Ultra-Modern era. First year of the iconic silver shimmer refractors.',
    notableCards: [
      { name: '2012 Prizm #236 Anthony Davis RC', desc: 'First Prizm basketball set — the beginning of an era' },
      { name: '2012 Panini National Treasures', desc: 'High-end basketball product with patch autos' },
      { name: '2012 Topps Chrome #144 Bryce Harper RC', desc: 'Harper\'s chrome rookie in his electrifying debut season' },
    ],
  },
  2017: {
    context: 'Patrick Mahomes is drafted 10th overall. His Prizm and Optic rookies will become the most valuable Ultra-Modern football cards.',
    notableCards: [
      { name: '2017 Panini Prizm #269 Patrick Mahomes RC', desc: 'The most valuable Ultra-Modern football card', href: '/players/patrick-mahomes' },
      { name: '2017 Donruss Optic #177 Patrick Mahomes RC', desc: 'The alternative Mahomes rookie of choice' },
      { name: '2017 Panini National Treasures Mahomes Auto Patch RC', desc: 'High-end Mahomes — six-figure card' },
    ],
  },
  2018: {
    context: 'Luka Doncic, Trae Young, and Shai Gilgeous-Alexander enter the NBA. Shohei Ohtani debuts in MLB. A massive rookie class for collectors.',
    notableCards: [
      { name: '2018 Prizm #280 Luka Doncic RC', desc: 'The Slovenian sensation\'s Prizm Silver is the chase card', href: '/players/luka-doncic' },
      { name: '2018 Topps Chrome #150 Shohei Ohtani RC', desc: 'The two-way unicorn\'s chrome debut', href: '/players/shohei-ohtani' },
      { name: '2018 Prizm #78 Trae Young RC', desc: 'Ice Trae\'s Prizm Silver rookie' },
    ],
  },
  2020: {
    context: 'COVID-19 drives a massive boom in card collecting. Stimulus checks and stay-at-home boredom fuel unprecedented demand. Justin Herbert and Joe Burrow enter the NFL.',
    notableCards: [
      { name: '2020 Prizm #325 Justin Herbert RC', desc: 'Herbert\'s Prizm Silver became the hottest football card of the boom', href: '/players/justin-herbert' },
      { name: '2020 Prizm #307 Joe Burrow RC', desc: '#1 overall pick\'s Prizm rookie' },
      { name: '2020 Topps Chrome #60 Luis Robert RC', desc: 'White Sox phenom\'s chrome debut' },
    ],
  },
  2023: {
    context: 'Victor Wembanyama enters the NBA as the most anticipated prospect since LeBron. Connor Bedard is the #1 NHL pick. CJ Stroud and Caleb Williams lead a loaded football class.',
    notableCards: [
      { name: '2023 Prizm #248 Victor Wembanyama RC', desc: 'The 7\'4" generational talent\'s chase card', href: '/players/victor-wembanyama' },
      { name: '2023 Upper Deck #201 Connor Bedard RC', desc: 'The next great hockey phenom\'s rookie' },
      { name: '2023 Prizm CJ Stroud RC', desc: 'Texans franchise QB\'s Prizm debut', href: '/players/cj-stroud' },
    ],
  },
};

/* ── fallback data generator ──────────────────────────────────────── */

function getDefaultYearData(year: number): YearData {
  if (year >= 1900 && year <= 1941) {
    return {
      context: `Pre-War era — cards were issued as promotional inserts in tobacco, candy, and gum products. The hobby was in its infancy with no organized collecting community. Cards from ${year} are extremely scarce today.`,
      notableCards: [
        { name: `${year} Tobacco/Candy Cards`, desc: 'Various issuers produced small sets with hand-drawn or photographed players' },
        { name: `${year} Strip Cards`, desc: 'Uncut sheets sold at candy stores, cut by hand by collectors' },
      ],
    };
  }
  if (year >= 1942 && year <= 1955) {
    return {
      context: `Post-War era — Bowman and Topps competed for dominance. Card production was affected by ${year <= 1945 ? 'World War II material shortages' : 'the post-war economic boom'}. Quality and design improved year over year.`,
      notableCards: [
        { name: `${year} Bowman Baseball`, desc: 'Bowman was the primary card manufacturer of the early post-war years' },
        { name: `${year} Topps Baseball`, desc: year >= 1951 ? 'Topps entered the market and began its decades-long reign' : 'Topps had not yet entered the baseball card market' },
      ],
    };
  }
  if (year >= 1956 && year <= 1979) {
    return {
      context: `Vintage Topps era — Topps held a virtual monopoly on baseball cards. Sets featured colorful designs and included rising stars who would become legends. Football, basketball, and hockey cards also grew in popularity.`,
      notableCards: [
        { name: `${year} Topps Baseball`, desc: 'The flagship set of the year — sought by vintage collectors worldwide' },
        { name: `${year} Topps Football`, desc: 'NFL cards grew in popularity alongside the league\'s TV expansion' },
      ],
    };
  }
  if (year >= 1980 && year <= 1994) {
    return {
      context: `Junk Wax era — massive overproduction by multiple manufacturers. ${year >= 1987 ? 'Peak overproduction years. Millions of each card printed.' : 'The early 80s saw the beginning of the speculation boom that would crash the market.'} Most base cards from this year have minimal value.`,
      notableCards: [
        { name: `${year} Topps Baseball`, desc: 'Topps continued its flagship set amidst growing competition' },
        { name: `${year} Fleer/Donruss`, desc: 'Competing manufacturers flooded the market with new product' },
      ],
    };
  }
  if (year >= 1995 && year <= 2009) {
    return {
      context: `Modern era — the hobby embraced technology with chrome finishes, refractors, autographed inserts, and memorabilia cards. Serial-numbered parallels created manufactured scarcity. Quality over quantity became the trend.`,
      notableCards: [
        { name: `${year} Topps Chrome`, desc: year >= 1996 ? 'Chrome technology became the preferred format for collectors' : 'Finest and SP led the premium card revolution' },
        { name: `${year} Bowman Chrome`, desc: 'Prospect cards became a key investment vehicle for speculators' },
      ],
    };
  }
  return {
    context: `Ultra-Modern era — Panini Prizm, Topps Chrome, and Bowman Chrome dominate the hobby. Social media drives hype cycles. Massive parallel rainbow chases and high-end autograph products define the market.`,
    notableCards: [
      { name: `${year} Panini Prizm`, desc: 'The silver shimmer Prizm is the most popular basketball/football format' },
      { name: `${year} Topps Chrome`, desc: 'Chrome refractors remain the gold standard for baseball collectors' },
    ],
  };
}

/* ── helper ────────────────────────────────────────────────────────── */

function getEraForYear(year: number): EraInfo {
  for (const e of eras) {
    if (year >= e.min && year <= e.max) return e.era;
  }
  return eras[eras.length - 1].era;
}

function calculateAge(year: number): { years: number; months: number } {
  const now = new Date(2026, 3, 15); // April 15, 2026 as stated in instructions
  const cardDate = new Date(year, 6, 1); // Approximate mid-year for card release
  let years = now.getFullYear() - cardDate.getFullYear();
  let months = now.getMonth() - cardDate.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years: Math.max(0, years), months: Math.max(0, months) };
}

/* ── component ───────────────────────────────────────────────────── */

export default function CardAgeClient() {
  const [year, setYear] = useState(1986);

  const era = useMemo(() => getEraForYear(year), [year]);
  const age = useMemo(() => calculateAge(year), [year]);
  const data = useMemo(() => yearData[year] || getDefaultYearData(year), [year]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(parseInt(e.target.value));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 1900 && v <= 2025) {
      setYear(v);
    }
  }, []);

  /* Timeline markers */
  const timelineEras = eras.map(e => ({
    ...e.era,
    min: e.min,
    max: e.max,
    widthPct: ((e.max - e.min + 1) / (2025 - 1900 + 1)) * 100,
  }));

  const markerPct = ((year - 1900) / (2025 - 1900)) * 100;

  return (
    <div className="space-y-6">
      {/* Year Input */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <label className="text-sm text-zinc-400 block mb-3">Select Card Year</label>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="number"
            min={1900}
            max={2025}
            value={year}
            onChange={handleInputChange}
            className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-lg font-bold text-center focus:outline-none focus:border-teal-500"
          />
          <div className="flex-1">
            <input
              type="range"
              min={1900}
              max={2025}
              value={year}
              onChange={handleSliderChange}
              className="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-zinc-600 mt-1">
              <span>1900</span>
              <span>1941</span>
              <span>1980</span>
              <span>1995</span>
              <span>2010</span>
              <span>2025</span>
            </div>
          </div>
        </div>

        {/* Quick era buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '1909 T206', y: 1909 },
            { label: '1952 Mantle', y: 1952 },
            { label: '1986 Jordan', y: 1986 },
            { label: '1989 Griffey', y: 1989 },
            { label: '2003 LeBron', y: 2003 },
            { label: '2017 Mahomes', y: 2017 },
            { label: '2023 Wemby', y: 2023 },
          ].map(q => (
            <button
              key={q.y}
              onClick={() => setYear(q.y)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                year === q.y
                  ? 'bg-teal-950/60 border-teal-600 text-teal-400'
                  : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400 hover:border-teal-700/50 hover:text-teal-400'
              }`}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age + Era Result */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center">
          <div className="text-sm text-zinc-500 mb-1">Card Age</div>
          <div className="text-5xl font-black text-teal-400">{age.years}</div>
          <div className="text-zinc-400 text-sm mt-1">
            {age.years === 1 ? 'year' : 'years'}{age.months > 0 ? `, ${age.months} ${age.months === 1 ? 'month' : 'months'}` : ''} old
          </div>
        </div>
        <div className={`${era.bgColor} border ${era.borderColor} rounded-xl p-6 text-center`}>
          <div className="text-sm text-zinc-500 mb-1">Collecting Era</div>
          <div className={`text-3xl font-black ${era.color}`}>{era.name}</div>
          <div className="text-zinc-400 text-sm mt-1">{era.range}</div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Era Timeline</h3>
        <div className="relative">
          {/* Era bars */}
          <div className="flex h-10 rounded-lg overflow-hidden mb-2">
            {timelineEras.map(e => (
              <div
                key={e.name}
                className={`${e.bgColor} border-r border-zinc-700/30 flex items-center justify-center relative group`}
                style={{ width: `${e.widthPct}%` }}
              >
                <span className={`text-[10px] font-medium ${e.color} truncate px-1 hidden sm:block`}>{e.name}</span>
              </div>
            ))}
          </div>
          {/* Position marker */}
          <div className="relative h-6">
            <div
              className="absolute top-0 w-0.5 h-4 bg-teal-400 transition-all duration-300"
              style={{ left: `${markerPct}%` }}
            />
            <div
              className="absolute top-4 -translate-x-1/2 text-teal-400 text-xs font-bold transition-all duration-300"
              style={{ left: `${markerPct}%` }}
            >
              {year}
            </div>
          </div>
          {/* Labels */}
          <div className="flex text-[10px] text-zinc-600 mt-1">
            {timelineEras.map(e => (
              <div key={e.name} style={{ width: `${e.widthPct}%` }} className="text-center truncate">
                {e.range}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Era Description */}
      <div className={`${era.bgColor} border ${era.borderColor} rounded-xl p-6`}>
        <h3 className={`font-semibold ${era.color} mb-2`}>{era.name} Era ({era.range})</h3>
        <p className="text-zinc-300 text-sm leading-relaxed">{era.description}</p>
      </div>

      {/* Historical Context */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-2">Historical Context for {year}</h3>
        <p className="text-zinc-300 text-sm leading-relaxed">{data.context}</p>
      </div>

      {/* Notable Cards */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">Notable Cards from {year}</h3>
        <div className="space-y-3">
          {data.notableCards.map((card, i) => (
            <div key={i} className="flex items-start gap-3 bg-zinc-800/40 border border-zinc-700/40 rounded-lg p-3">
              <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-800/40 flex items-center justify-center flex-shrink-0">
                <span className="text-teal-400 text-xs font-bold">{i + 1}</span>
              </div>
              <div className="min-w-0">
                {card.href ? (
                  <Link href={card.href} className="text-teal-400 text-sm font-medium hover:underline">
                    {card.name}
                  </Link>
                ) : (
                  <div className="text-white text-sm font-medium">{card.name}</div>
                )}
                <div className="text-zinc-500 text-xs mt-0.5">{card.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Value Trend */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-2">Value Trend Outlook</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-sm font-bold ${era.valueTrendColor}`}>{era.valueTrendLabel}</span>
          <span className="text-zinc-600 text-xs">for {era.name} era cards</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{era.valueTrend}</p>
      </div>

      {/* Collecting Tips */}
      <div className={`${era.bgColor} border ${era.borderColor} rounded-xl p-6`}>
        <h3 className={`font-semibold ${era.color} mb-3`}>Collecting Tips for {era.name} Era</h3>
        <div className="space-y-2">
          {era.collectingTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`${era.color} text-sm mt-0.5 flex-shrink-0`}>*</span>
              <span className="text-zinc-300 text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share */}
      <button
        onClick={() => {
          const text = `My ${year} card is ${age.years} years old!\nEra: ${era.name} (${era.range})\nValue Trend: ${era.valueTrendLabel}\nhttps://cardvault-two.vercel.app/tools/card-age`;
          navigator.clipboard.writeText(text).catch(() => {});
        }}
        className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors"
      >
        Copy Results to Clipboard
      </button>
    </div>
  );
}
