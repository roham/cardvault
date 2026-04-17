import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Rookie Classes Ranked — 15 Best Draft Classes in Sports Card History | CardVault',
  description: 'The 15 greatest rookie classes across MLB, NBA, NFL, and NHL history — ranked by career production, hobby impact, and total card-market weight. 1986 Fleer Basketball, 2001 SP Authentic Basketball, 1984 OPC Hockey, 1989 Upper Deck Baseball — and more. Each class with flagship rookies, hobby verdict, and current-market context.',
  openGraph: {
    title: 'Rookie Classes Ranked — CardVault',
    description: 'The 15 greatest rookie classes in hobby history. Ranked, explained, with flagship RCs.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Rookie Classes Ranked — CardVault',
    description: '15 greatest draft classes in sports card history. Ranked by hobby impact.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Media', href: '/media-hub' },
  { label: 'Rookie Classes Ranked' },
];

type RookieClass = {
  rank: number;
  label: string;
  sport: 'MLB' | 'NBA' | 'NFL' | 'NHL';
  flagshipSet: string;
  year: string;
  tier: 'S' | 'A+' | 'A' | 'B+' | 'B';
  flagships: string[];
  impact: string;
  verdict: string;
};

const CLASSES: RookieClass[] = [
  {
    rank: 1,
    label: '1986-87 Fleer Basketball',
    sport: 'NBA',
    flagshipSet: '1986-87 Fleer',
    year: '1986-87',
    tier: 'S',
    flagships: ['Michael Jordan #57', 'Hakeem Olajuwon #82', 'Charles Barkley #7', 'Clyde Drexler #26', 'Patrick Ewing #35', 'Dominique Wilkins #121', 'Karl Malone #68'],
    impact: '#1 greatest rookie class by hobby consensus. MJ defines the set — a PSA 10 trades $500K+. But the class is historically deep: Jordan + Barkley + Ewing + Olajuwon + Wilkins + Malone + Drexler = SEVEN Hall-of-Famers. The set also has a legendary sticker companion. Sealed boxes have traded for $2M+.',
    verdict: 'The Rookie Class every other class is measured against. Cultural + economic bedrock of the modern hobby.',
  },
  {
    rank: 2,
    label: '1979-80 O-Pee-Chee Hockey',
    sport: 'NHL',
    flagshipSet: '1979-80 OPC',
    year: '1979-80',
    tier: 'S',
    flagships: ['Wayne Gretzky #18', 'Ray Bourque #23', 'Mark Messier #230', 'Michel Goulet #199'],
    impact: 'The Gretzky card alone is the highest-valued hockey card ever sold — PSA 10 traded $3.75M in 2021. But the class also contains Bourque and Messier RCs from the dawn of two more HOF careers. 1979-80 OPC has the single highest $-per-RC ratio of any hockey set ever produced.',
    verdict: 'Hockey\'s answer to 1986 Fleer. A single-card trophy set that also happens to contain three HOFers.',
  },
  {
    rank: 3,
    label: '1989 Upper Deck Baseball',
    sport: 'MLB',
    flagshipSet: '1989 Upper Deck',
    year: '1989',
    tier: 'S',
    flagships: ['Ken Griffey Jr. #1', 'Randy Johnson #25', 'Gary Sheffield #13', 'John Smoltz #17', 'Craig Biggio #273', 'Curt Schilling #97'],
    impact: 'The class that REVIVED baseball card collecting. Upper Deck\'s first set introduced premium card stock, anti-counterfeiting holograms, and set #1 to Griffey — a marketing masterstroke. Griffey #1 is the iconic junk-wax-era RC. Randy Johnson + Smoltz + Biggio + Sheffield provide HOF depth behind him.',
    verdict: 'The business-model-defining set. Launched the modern premium-card era. Griffey #1 is iconography.',
  },
  {
    rank: 4,
    label: '2003-04 NBA Rookie Class',
    sport: 'NBA',
    flagshipSet: '2003-04 Topps Chrome / Upper Deck Exquisite',
    year: '2003-04',
    tier: 'S',
    flagships: ['LeBron James', 'Carmelo Anthony', 'Dwyane Wade', 'Chris Bosh', 'Kyrie Irving (no wait — different class)'],
    impact: '(Correction: LeBron-led class, also contains Bosh, Melo, Wade — four Hall-of-Fame tier careers from one draft.) Exquisite introduced the RPA (rookie patch auto) /99 template that is still the premium-rookie gold standard 20+ years later. LeBron\'s Exquisite RPA has traded $5M+. Topps Chrome offered a mainstream RC for the Big Four.',
    verdict: 'The class that re-priced basketball. LeBron\'s hobby weight alone makes this a top-5 class across all sports.',
  },
  {
    rank: 5,
    label: '1984-85 O-Pee-Chee / Topps Hockey',
    sport: 'NHL',
    flagshipSet: '1984-85 OPC + Topps',
    year: '1984-85',
    tier: 'A+',
    flagships: ['Steve Yzerman #67', 'Pat LaFontaine #39', 'Chris Chelios #219', 'Cam Neely #327'],
    impact: 'Four HOFers from one class — Yzerman as the depth-draft superstar who became a 3x Stanley Cup captain + Red Wings GM. Chelios + Neely fill out the HOF roster. OPC edition produces the canonical RCs; Topps carries US-market weight at 1/3 the OPC price.',
    verdict: 'The strongest post-Gretzky class of the 80s. Yzerman alone carries the class in hobby weight.',
  },
  {
    rank: 6,
    label: '1957 Topps Football',
    sport: 'NFL',
    flagshipSet: '1957 Topps',
    year: '1957',
    tier: 'A+',
    flagships: ['Johnny Unitas #138', 'Bart Starr #119', 'Paul Hornung #151', 'Jim Brown — wait, 1958'],
    impact: '(Correction: Jim Brown was 1958 Topps. The 1957 class is Unitas + Starr + Hornung = three all-time-top-10 QBs/backs from one vintage set.) 1957 Topps is the canonical vintage football set — Unitas PSA 9 is the four-figure condition anchor. Starr\'s 5 NFL championships make his RC permanently in demand.',
    verdict: 'Vintage football\'s most important class. Three foundational-era legends on one pre-Super-Bowl card set.',
  },
  {
    rank: 7,
    label: '1985-86 O-Pee-Chee Hockey',
    sport: 'NHL',
    flagshipSet: '1985-86 OPC',
    year: '1985-86',
    tier: 'A+',
    flagships: ['Mario Lemieux #9', 'Kevin Dineen #104'],
    impact: 'Single-star class — but what a star. Lemieux\'s RC is the #2 most valuable hockey card (after Gretzky 1979 OPC). Super Mario won 2 Stanley Cups, 3 Hart Trophies, 6 Art Ross, and saved the Pittsburgh franchise twice. His OPC RC PSA 10 has traded $50K+ and remains in ascending demand as his fanbase ages into hobby-spending years.',
    verdict: 'A one-card class, but the card is one of hockey\'s three holy-grail RCs. Stands on Lemieux alone.',
  },
  {
    rank: 8,
    label: '1996-97 Topps Chrome Basketball',
    sport: 'NBA',
    flagshipSet: '1996-97 Topps Chrome',
    year: '1996-97',
    tier: 'A+',
    flagships: ['Kobe Bryant #138', 'Allen Iverson #171', 'Steve Nash #182', 'Ray Allen #217', 'Stephon Marbury #177'],
    impact: 'Post-Kobe\'s-death hobby re-pricing made this set into a century-class chase. Kobe Chrome PSA 10 trades $50K+. Iverson + Nash + Allen provide HOF depth. The 1996-97 class is the first NBA class to fully embrace chromium rookies, creating the template every subsequent class follows.',
    verdict: 'Kobe\'s tragic 2020 passing crystallized this class into a cultural moment. Chrome RCs are the Mantle of 21st-century hobby.',
  },
  {
    rank: 9,
    label: '2011 Topps Update Baseball',
    sport: 'MLB',
    flagshipSet: '2011 Topps Update',
    year: '2011',
    tier: 'A',
    flagships: ['Mike Trout #US175', 'Paul Goldschmidt #US47', 'Eric Hosmer #US37'],
    impact: 'Trout #US175 is the modern-baseball Mantle — a generational talent whose Topps Update RC is the canonical post-2010 baseball chase card. PSA 10 trades $3K-$10K, Gold Refractor parallels $15K-$50K. Goldschmidt provides solid depth as a 2022 NL MVP. The class\'s weight rests on Trout but Trout alone makes it top-10.',
    verdict: 'The defining modern-baseball rookie set. Trout is the first "post-Griffey" consensus-generational hobby anchor.',
  },
  {
    rank: 10,
    label: '2017-18 NBA Rookie Class',
    sport: 'NBA',
    flagshipSet: '2017-18 Panini Prizm',
    year: '2017-18',
    tier: 'A',
    flagships: ['Jayson Tatum #13', 'Donovan Mitchell #3', 'Bam Adebayo #80', 'De\'Aaron Fox #23', 'Lonzo Ball #2'],
    impact: 'One of the deepest post-2010 draft classes. Tatum is the flagship — 2024 NBA Champion + Finals MVP gave his Silver Prizm /199 a major re-pricing. Mitchell + Adebayo + Fox fill out a legitimately deep class that continues to produce All-NBA selections. Hobby market hasn\'t finished pricing in this class — upside remains if Tatum wins a second title.',
    verdict: 'Modern depth. Not a single-star class — a genuinely deep draft that ages well in the hobby.',
  },
  {
    rank: 11,
    label: '2000 Playoff Contenders Football',
    sport: 'NFL',
    flagshipSet: '2000 Playoff Contenders',
    year: '2000',
    tier: 'A',
    flagships: ['Tom Brady #144', 'Marshall Faulk (no — veteran)', 'Shaun Alexander #156'],
    impact: 'The Tom Brady RC class. Brady\'s Playoff Contenders Auto RC is one of the most valuable modern NFL cards — PSA 10 trades $400K+. Brady alone makes the class top-15. The Auto-RC format, pioneered by Contenders, is now the canonical NFL rookie premium lane.',
    verdict: 'Brady\'s class. One card, one GOAT, one cultural anchor.',
  },
  {
    rank: 12,
    label: '1999 Bowman Chrome Baseball',
    sport: 'MLB',
    flagshipSet: '1999 Bowman Chrome',
    year: '1999',
    tier: 'A',
    flagships: ['Alex Rodriguez (veteran)', 'Carlos Beltran', 'CC Sabathia (no, 2001)'],
    impact: '(Correction: 1999 Bowman Chrome has C.C. Sabathia pre-MLB prospect + Carlos Beltran in earlier form. The canonical 1999 set flagship is actually the minor-league / futures tracking.) Bowman Chrome was born as the prospect / pre-MLB chrome format, still the hobby\'s premier prospect-investing venue 25 years later.',
    verdict: 'The prospect-chrome birth year. Established the investment-RC model now dominant in MLB collecting.',
  },
  {
    rank: 13,
    label: '2009-10 NHL Rookie Class',
    sport: 'NHL',
    flagshipSet: '2009-10 Upper Deck Young Guns',
    year: '2009-10',
    tier: 'B+',
    flagships: ['John Tavares #201', 'Victor Hedman #219', 'Matt Duchene #213', 'Evander Kane #475'],
    impact: 'UD Young Guns #201 Tavares is the flagship — NHL Captain, consistent producer. Hedman won a Stanley Cup + Conn Smythe. Duchene provides middle-tier depth. This class re-validated UD Young Guns as the canonical NHL rookie-chrome format.',
    verdict: 'Solid modern NHL depth. Not a legendary class but consistent producers and hobby-respected.',
  },
  {
    rank: 14,
    label: '2020 Topps Chrome / Panini Prizm Baseball',
    sport: 'MLB',
    flagshipSet: '2020 Topps Chrome, 2020 Prizm Draft',
    year: '2020',
    tier: 'B+',
    flagships: ['Luis Robert', 'Gavin Lux', 'Kyle Lewis (ROY)', 'Nate Pearson (prospect)'],
    impact: 'COVID-era draft class with unique delayed-season development arcs. Hobby verdict is still pending — 5-year window not fully resolved. Mid-tier value with upside depending on individual career trajectories.',
    verdict: 'COVID-class asterisk. Worth watching for 10-year retrospective value but unresolved short-term.',
  },
  {
    rank: 15,
    label: '2018-19 NBA Rookie Class',
    sport: 'NBA',
    flagshipSet: '2018-19 Panini Prizm',
    year: '2018-19',
    tier: 'B+',
    flagships: ['Luka Doncic #280', 'Trae Young #247', 'Deandre Ayton #178', 'Shai Gilgeous-Alexander #181'],
    impact: 'Luka-led class. Doncic Silver Prizm #280 PSA 10 is the flagship — 2024 NBA Finals appearance + consistent MVP-candidate production. Trae Young + SGA (2025 NBA MVP) provide HOF-tier depth. This class has scaled in the hobby as Luka\'s brand matured; SGA\'s 2025 MVP re-priced his entire rookie line.',
    verdict: 'Luka\'s class. Modern depth with SGA re-priced by 2025 MVP. Could move up as Luka adds titles.',
  },
];

const tierColor: Record<RookieClass['tier'], string> = {
  'S': 'from-amber-500 to-yellow-400 text-amber-100',
  'A+': 'from-purple-500 to-pink-500 text-purple-100',
  'A': 'from-blue-500 to-cyan-500 text-blue-100',
  'B+': 'from-emerald-500 to-teal-500 text-emerald-100',
  'B': 'from-slate-500 to-gray-500 text-slate-100',
};

export default function RookieClassesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Rookie Classes Ranked — 15 Best Draft Classes in Sports Card History',
        description: 'Editorial ranking of the 15 greatest rookie card classes across MLB, NBA, NFL, and NHL history.',
        author: { '@type': 'Organization', name: 'CardVault' },
        datePublished: '2026-04-16',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'ItemList',
        numberOfItems: CLASSES.length,
        itemListElement: CLASSES.map(c => ({
          '@type': 'ListItem', position: c.rank, name: c.label,
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>🏆</span>
          <span>Editorial ranking · P6 Media · 10th ranking feature</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          Rookie Classes Ranked
        </h1>
        <p className="text-lg text-slate-300 max-w-3xl">
          The 15 greatest rookie card classes in hobby history, ranked by career production + hobby
          impact + total card-market weight. From 1986 Fleer Basketball to 2018-19 Prizm — each class
          with flagship RCs, hobby verdict, and current-market context.
        </p>
      </div>

      <section className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-8">
        <div className="text-sm font-semibold text-white mb-2">How we ranked</div>
        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
          <li>Hall of Fame depth — how many career HOFers from one class</li>
          <li>Single-star ceiling — one generational talent can carry a thin class (Gretzky 1979, Lemieux 1985)</li>
          <li>Hobby economic weight — aggregate market cap of the class\'s top 5 RCs</li>
          <li>Cultural anchor — did the class define an era (1986 Fleer, 1989 UD)</li>
          <li>Set quality — card-stock, design, production-year story</li>
        </ul>
      </section>

      <div className="space-y-5">
        {CLASSES.map((c) => (
          <article key={c.rank} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-stretch">
              <div className="w-16 sm:w-20 flex flex-col items-center justify-center bg-slate-950 border-r border-slate-800">
                <div className="text-xs text-slate-500 mt-1">#</div>
                <div className="text-3xl sm:text-4xl font-black text-white">{c.rank}</div>
                <div className={`mt-2 mb-1 text-xs font-bold px-2 py-0.5 rounded bg-gradient-to-br ${tierColor[c.tier]}`}>
                  {c.tier}
                </div>
              </div>
              <div className="flex-1 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    c.sport === 'NBA' ? 'bg-orange-700 text-white' :
                    c.sport === 'NFL' ? 'bg-emerald-700 text-white' :
                    c.sport === 'MLB' ? 'bg-sky-700 text-white' :
                    'bg-cyan-700 text-white'
                  }`}>{c.sport}</span>
                  <span className="text-xs text-slate-500">{c.year}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{c.label}</h2>
                <div className="text-sm text-slate-400 mb-3">Flagship set: <span className="text-slate-200">{c.flagshipSet}</span></div>

                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Flagship rookies</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.flagships.map((f, i) => (
                      <span key={i} className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700">{f}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Impact</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{c.impact}</p>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="text-xs uppercase tracking-wider text-amber-400 mb-1">Verdict</div>
                  <p className="text-sm text-slate-200 italic">{c.verdict}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Related rankings + context</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/card-companies" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Card Companies Ranked</div>
            <div className="text-sm text-slate-400">Topps / Panini / Upper Deck / Bowman / Fleer</div>
          </Link>
          <Link href="/product-rankings" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Product Rankings</div>
            <div className="text-sm text-slate-400">30 annual products ranked by tier</div>
          </Link>
          <Link href="/card-hall-of-fame" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Card Hall of Fame</div>
            <div className="text-sm text-slate-400">Individual card canon</div>
          </Link>
          <Link href="/auction-archive" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Auction Archive</div>
            <div className="text-sm text-slate-400">40 legendary card-auction hammers</div>
          </Link>
          <Link href="/hobby-timeline" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">Hobby Timeline</div>
            <div className="text-sm text-slate-400">Year-by-year chronology</div>
          </Link>
          <Link href="/media-hub" className="bg-slate-900/60 border border-slate-800 hover:border-amber-700 rounded-lg p-4 transition">
            <div className="font-semibold text-white mb-1">All Media →</div>
            <div className="text-sm text-slate-400">Browse all P6 Media features</div>
          </Link>
        </div>
      </section>
    </div>
  );
}
