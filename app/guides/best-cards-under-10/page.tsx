import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '30 Best Sports Cards Under $10 — Starter Collection Guide',
  description: 'The 30 best sports cards you can buy for under $10. Hall of Famers, junk wax era gems, and budget vintage singles in PSA 9 — build an incredible collection for the price of lunch.',
  keywords: ['sports cards under 10 dollars', 'cheap sports cards', 'junk wax era cards', 'budget card collecting', 'best cheap rookie cards', 'starter card collection'],
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
  {
    rank: 1,
    name: '1990-91 Hoops John Stockton #270',
    set: '1990-91 NBA Hoops',
    player: 'John Stockton',
    sport: 'basketball',
    psa9Price: '$5–$8',
    rawPrice: '$0.50–$1',
    why: 'The all-time assists and steals leader. Stockton is the most efficient point guard in NBA history and a first-ballot Hall of Famer. His 1990-91 Hoops card puts one of the most statistically dominant players ever into your collection for less than a cup of coffee.',
    buyTip: 'Raw copies are literally pocket change. Buy a stack of 5 for $3 total and pick the best centered one for your collection.',
  },
  {
    rank: 2,
    name: '1990-91 Hoops Hakeem Olajuwon #127',
    set: '1990-91 NBA Hoops',
    player: 'Hakeem Olajuwon',
    sport: 'basketball',
    psa9Price: '$5–$9',
    rawPrice: '$0.50–$1',
    why: '2x NBA champion, 2x Finals MVP, MVP, DPOY, 12x All-Star. The Dream is widely considered the most skilled center ever. His junk wax era commons are absurdly cheap for a player who outdueled Ewing, Robinson, and Shaq in the same decade.',
    buyTip: 'Hoops cards from 1990-91 were printed by the millions. Condition is easy to find — focus on centering when picking raw copies.',
  },
  {
    rank: 3,
    name: '1991-92 Upper Deck David Robinson #335',
    set: '1991-92 Upper Deck',
    player: 'David Robinson',
    sport: 'basketball',
    psa9Price: '$4–$7',
    rawPrice: '$0.50–$1',
    why: 'The Admiral. 2x NBA champion, MVP, DPOY, scoring champion, 10x All-Star. Robinson put up elite numbers for 14 seasons and anchored the Spurs dynasty. Upper Deck quality from this era was the best in the market — sharp photography and clean card stock.',
    buyTip: 'Upper Deck 1991-92 has better print quality than Hoops or Fleer from the same year. Worth paying the extra $0.25 for the superior product.',
  },
  {
    rank: 4,
    name: '1990-91 Fleer Charles Barkley #139',
    set: '1990-91 Fleer',
    player: 'Charles Barkley',
    sport: 'basketball',
    psa9Price: '$5–$9',
    rawPrice: '$0.50–$1.50',
    why: 'MVP, 11x All-Star, Hall of Famer. The Round Mound of Rebound was one of the most dominant power forwards in history. His 1986 Fleer RC is $100+, but this base card gives you Sir Charles in your collection for under $10 in a slab.',
    buyTip: 'Fleer 1990-91 centering is notoriously inconsistent. Sort through a few raw copies before picking your best candidate.',
  },
  {
    rank: 5,
    name: '1992-93 Upper Deck Shaquille O\'Neal #474',
    set: '1992-93 Upper Deck',
    player: "Shaquille O'Neal",
    sport: 'basketball',
    psa9Price: '$6–$9',
    rawPrice: '$1–$2',
    why: 'Shaq has multiple RC cards from his 1992-93 rookie year. The Topps RC commands $25-60 in PSA 9, but this Upper Deck base card captures the same dominant rookie season at a fraction. 4x champion, 3x Finals MVP, MVP — for under $10 slabbed.',
    buyTip: 'Not the main Topps RC but still a recognized Shaq rookie-year card. Perfect for budget collectors who want the player, not the premium.',
  },
  {
    rank: 6,
    name: '1990-91 SkyBox Magic Johnson #138',
    set: '1990-91 SkyBox',
    player: 'Magic Johnson',
    sport: 'basketball',
    psa9Price: '$6–$9',
    rawPrice: '$1–$2',
    why: '5x NBA champion, 3x Finals MVP, 3x MVP, 12x All-Star. Magic revolutionized the point guard position. The SkyBox set was the flashiest product of the junk wax era — the first to use full-color action photography. Magic in SkyBox is a legitimate display piece.',
    buyTip: 'SkyBox printing quality was above average for the era. These cards hold up well — crisp edges and vivid colors even 35 years later.',
  },
  {
    rank: 7,
    name: '1993-94 Topps Chris Webber #224 RC',
    set: '1993-94 Topps',
    player: 'Chris Webber',
    sport: 'basketball',
    psa9Price: '$5–$8',
    rawPrice: '$0.75–$1.50',
    why: '#1 overall pick, 5x All-Star, member of the Fab Five. C-Webb was one of the most skilled big men of the 1990s. His Topps RC is dirt cheap because he narrowly missed the Hall of Fame on the first ballot — but the talent was undeniable.',
    buyTip: 'A potential future Hall of Famer at $5-8 in PSA 9. If C-Webb eventually gets the call, this card reprices overnight.',
  },
  {
    rank: 8,
    name: '1993-94 Upper Deck Anfernee Hardaway #382 RC',
    set: '1993-94 Upper Deck',
    player: 'Anfernee Hardaway',
    sport: 'basketball',
    psa9Price: '$5–$8',
    rawPrice: '$0.75–$1.50',
    why: 'Penny was the next Magic Johnson — a 6\'7" point guard with handles, vision, and scoring ability that terrified defenses. Injuries robbed him of a top-10 all-time trajectory, but at his peak he was otherworldly. The RC is priced like he never existed.',
    buyTip: 'One of the most tragic "what if" careers in NBA history. At under $10 slabbed, you are buying elite talent at injury-discount pricing.',
  },
  {
    rank: 9,
    name: '1987 Topps Barry Bonds #320 RC',
    set: '1987 Topps',
    player: 'Barry Bonds',
    sport: 'baseball',
    psa9Price: '$6–$9',
    rawPrice: '$1–$2',
    why: 'All-time home run king. 7x MVP. 14x All-Star. 8x Gold Glove. Bonds is statistically the greatest position player in baseball history. The PED controversy permanently suppresses his card market — which means the home run king is available for pocket change.',
    buyTip: 'The market prices in the controversy permanently. If you collect for stats and accomplishments, this is the most undervalued card in the hobby.',
  },
  {
    rank: 10,
    name: '1990 Leaf Frank Thomas #300 RC',
    set: '1990 Leaf',
    player: 'Frank Thomas',
    sport: 'baseball',
    psa9Price: '$7–$9',
    rawPrice: '$1.50–$3',
    why: 'The Big Hurt. 2x MVP, Hall of Famer, 521 career home runs. Thomas was the most feared hitter in the AL for a decade. His 1990 Leaf RC is the premium product of the junk wax era — Leaf had better card stock and print quality than competitors.',
    buyTip: 'The Leaf RC is the best version of Frank Thomas under $10. Superior card stock means more PSA 9s survive from this product than Topps or Donruss.',
  },
  {
    rank: 11,
    name: '1987 Donruss Greg Maddux #36 RC',
    set: '1987 Donruss',
    player: 'Greg Maddux',
    sport: 'baseball',
    psa9Price: '$6–$9',
    rawPrice: '$1–$2',
    why: '4x consecutive Cy Young winner. 355 career wins. Hall of Famer. Maddux was the most precise pitcher of his generation — he made hitters look foolish with 85 mph fastballs. His Donruss RC is absurdly cheap for the greatest control pitcher in baseball history.',
    buyTip: '1987 Donruss has soft card stock that chips easily. Inspect corners carefully on raw copies. A clean PSA 9 at $6-9 is the safer buy.',
  },
  {
    rank: 12,
    name: '1988 Score Roberto Alomar #104 RC',
    set: '1988 Score',
    player: 'Roberto Alomar',
    sport: 'baseball',
    psa9Price: '$4–$7',
    rawPrice: '$0.50–$1',
    why: '12x All-Star, 10x Gold Glove, Hall of Famer. Alomar was the best second baseman of his era — a switch-hitter with elite defense and a .300 career average. His Score RC is nearly free in raw form.',
    buyTip: 'Score cards from 1988 have inconsistent cut quality. Buy several raw copies for $1 each and cherry-pick the best one.',
  },
  {
    rank: 13,
    name: '1988 Donruss Tom Glavine #644 RC',
    set: '1988 Donruss',
    player: 'Tom Glavine',
    sport: 'baseball',
    psa9Price: '$4–$7',
    rawPrice: '$0.50–$1',
    why: '2x Cy Young winner, World Series MVP, 305 career wins, Hall of Famer. Glavine anchored the greatest pitching rotation in baseball history alongside Maddux and Smoltz. Three Hall of Famers in one rotation — and Glavine\'s RC is under $7 slabbed.',
    buyTip: 'Pair with Maddux and Smoltz RCs for the complete Braves dynasty pitching trio. Total cost for all three in PSA 9: under $25.',
  },
  {
    rank: 14,
    name: '1986 Donruss Jose Canseco #39 RC',
    set: '1986 Donruss',
    player: 'Jose Canseco',
    sport: 'baseball',
    psa9Price: '$7–$9',
    rawPrice: '$1.50–$3',
    why: 'The first 40/40 man in MLB history. MVP, Rookie of the Year, 6x All-Star. Canseco was the most exciting player in baseball in the late 1980s. The 1986 Donruss RC was one of the hottest cards of its era — once $50+, now under $10 in PSA 9.',
    buyTip: 'A card with genuine nostalgia value for anyone who collected in the late 80s. The 1986 Donruss border design is iconic.',
  },
  {
    rank: 15,
    name: '1990 Upper Deck Sammy Sosa #17 RC',
    set: '1990 Upper Deck',
    player: 'Sammy Sosa',
    sport: 'baseball',
    psa9Price: '$5–$8',
    rawPrice: '$0.75–$1.50',
    why: '609 career home runs. The 1998 home run chase with McGwire saved baseball. Sosa hit 60+ home runs three times — something no one else in history has done. PED controversy suppresses the price, making a historically significant card dirt cheap.',
    buyTip: 'Upper Deck 1990 was the gold standard for card quality. Clean copies are abundant — centering is the main variable to check.',
  },
  {
    rank: 16,
    name: '1993 SP Jason Giambi #277 RC',
    set: '1993 SP',
    player: 'Jason Giambi',
    sport: 'baseball',
    psa9Price: '$4–$7',
    rawPrice: '$0.75–$1.50',
    why: 'MVP, 5x All-Star, .916 career OPS. Giambi was one of the most patient and powerful hitters of his era. The 1993 SP set is a premium product — the same set that houses the iconic Jeter RC. Giambi\'s card from that set is essentially free.',
    buyTip: 'Owning a card from the 1993 SP set at under $7 is the real appeal here. Premium product, budget price.',
  },
  {
    rank: 17,
    name: '1990 Score Emmitt Smith #101T RC',
    set: '1990 Score Supplemental',
    player: 'Emmitt Smith',
    sport: 'football',
    psa9Price: '$7–$9',
    rawPrice: '$1.50–$3',
    why: 'All-time NFL rushing leader. 3x Super Bowl champion. MVP. Hall of Famer. Emmitt Smith ran for 18,355 yards — a record that may never be broken. His Score RC is the most accessible version of the greatest rusher in football history.',
    buyTip: 'The Score Supplemental set was a traded/update product. The Emmitt RC from this set is widely recognized and collected. At $7-9 in PSA 9, it is objectively the best value HOF football card in the hobby.',
  },
  {
    rank: 18,
    name: '1989 Score Barry Sanders #257 RC',
    set: '1989 Score',
    player: 'Barry Sanders',
    sport: 'football',
    psa9Price: '$8–$9.50',
    rawPrice: '$2–$3',
    why: 'The most electrifying runner in NFL history. 10 consecutive 1,000-yard seasons. Retired in his prime at 30. Sanders was so dominant that he walked away while still the best — and his Score RC captures the beginning of that legendary career.',
    buyTip: 'The PSA 8 grade sells for $3-5. At this price tier, a PSA 8 is a perfectly acceptable alternative if the PSA 9 pushes your budget.',
  },
  {
    rank: 19,
    name: '1990 Pro Set Troy Aikman #1',
    set: '1990 Pro Set',
    player: 'Troy Aikman',
    sport: 'football',
    psa9Price: '$4–$7',
    rawPrice: '$0.50–$1',
    why: '3x Super Bowl champion, Super Bowl MVP, Hall of Famer. Aikman quarterbacked the most dominant dynasty of the 1990s. Pro Set was the most overproduced brand of the junk wax era — which means Aikman\'s card is essentially free for a three-time champion.',
    buyTip: 'Pro Set quality is the worst of the junk wax era. Finding a PSA 9 candidate in raw form is harder than you think. Buying slabbed at $4-7 is the efficient move.',
  },
  {
    rank: 20,
    name: '1989 Topps Traded Deion Sanders #30T RC',
    set: '1989 Topps Traded',
    player: 'Deion Sanders',
    sport: 'football',
    psa9Price: '$6–$9',
    rawPrice: '$1–$2',
    why: 'Prime Time. The greatest cover corner in NFL history and the only athlete to play in both a Super Bowl and a World Series. 2x Super Bowl champion, 8x Pro Bowl, Hall of Famer. Sanders transcended football — he was a cultural icon.',
    buyTip: 'Deion\'s dual-sport career gives this card crossover appeal with baseball collectors too. Broader demand base than a typical football-only card.',
  },
  {
    rank: 21,
    name: '1990 Fleer Sterling Sharpe #295',
    set: '1990 Fleer',
    player: 'Sterling Sharpe',
    sport: 'football',
    psa9Price: '$3–$6',
    rawPrice: '$0.50–$1',
    why: 'One of the greatest "what if" careers in football. Sharpe was a 3x All-Pro, 5x Pro Bowl receiver who was on a Hall of Fame trajectory before a neck injury ended his career at 29. Had he played 4 more healthy years, he would be in Canton.',
    buyTip: 'The cheapest card on this list. At $3-6 in PSA 9, this is a Hall of Fame-caliber talent at a price that rounds to zero.',
  },
  {
    rank: 22,
    name: '1991 Stadium Club Brett Favre #94 RC',
    set: '1991 Stadium Club',
    player: 'Brett Favre',
    sport: 'football',
    psa9Price: '$7–$9',
    rawPrice: '$1.50–$3',
    why: '3x consecutive MVP. Super Bowl champion. 297 consecutive starts — the iron man of football. Hall of Famer. Favre\'s Stadium Club RC is the premium version of his rookie cards. Stadium Club was Topps\' high-end line with full-bleed photography.',
    buyTip: 'Stadium Club cards look dramatically better than base Topps or Pro Set from the same era. The full-bleed design holds up as a display piece.',
  },
  {
    rank: 23,
    name: '1990-91 Score Martin Brodeur #439 RC',
    set: '1990-91 Score',
    player: 'Martin Brodeur',
    sport: 'hockey',
    psa9Price: '$6–$9',
    rawPrice: '$1–$2',
    why: 'The winningest goaltender in NHL history. 3x Stanley Cup champion, 4x Vezina Trophy, 691 career wins. Brodeur redefined the goaltender position and his records may stand forever. His Score RC is under $10 in PSA 9 — an absurd value for the GOAT netminder.',
    buyTip: 'Score 1990-91 was massively overproduced but Brodeur\'s RC has steady collector demand that keeps PSA 9 prices firm. A true floor card.',
  },
  {
    rank: 24,
    name: '1990-91 Upper Deck Jaromir Jagr #356 RC',
    set: '1990-91 Upper Deck',
    player: 'Jaromir Jagr',
    sport: 'hockey',
    psa9Price: '$6–$9',
    rawPrice: '$1–$2',
    why: 'Third all-time in NHL points. 5x Art Ross Trophy winner. Played professionally until age 49. Jagr\'s longevity and skill are unmatched — he was elite across four decades. The Upper Deck RC captures the start of a career that simply refused to end.',
    buyTip: 'Upper Deck quality from 1990-91 is excellent. These cards grade well — clean copies for PSA 9 are not hard to find in raw lots.',
  },
  {
    rank: 25,
    name: '1990-91 OPC Mats Sundin #432 RC',
    set: '1990-91 O-Pee-Chee',
    player: 'Mats Sundin',
    sport: 'hockey',
    psa9Price: '$5–$8',
    rawPrice: '$0.75–$1.50',
    why: 'First European player drafted #1 overall. 564 career goals, 1,349 career points. Sundin was the face of the Toronto Maple Leafs for a decade — in hockey\'s biggest market. His OPC RC is a key card for the overproduced era and a staple of Canadian collections.',
    buyTip: 'OPC card stock from this era is rougher than Upper Deck or Score. PSA 9s are slightly scarcer relative to population, which keeps the value honest.',
  },
  {
    rank: 26,
    name: '1990-91 Score Eric Lindros #440',
    set: '1990-91 Score',
    player: 'Eric Lindros',
    sport: 'hockey',
    psa9Price: '$4–$7',
    rawPrice: '$0.75–$1.50',
    why: 'The most hyped prospect in hockey history. Hart Trophy winner, Olympic gold medalist, Hall of Famer. Lindros was supposed to be the next Gretzky — and at his peak, he was the most physically dominant player alive. Concussions cut the story short, but the talent was generational.',
    buyTip: 'Lindros cards are permanently discounted by the injury narrative. Hall of Famer at $4-7 in PSA 9 is the definition of buying the dip.',
  },
  {
    rank: 27,
    name: '1999 Base Set Machamp #8 Holo (1st Edition)',
    set: 'Base Set (1st Edition)',
    player: 'Machamp',
    sport: 'pokemon',
    psa9Price: '$7–$9',
    rawPrice: '$2–$3',
    why: 'The most accessible 1st Edition Base Set holo in existence. Machamp was included in every Starter Deck, making it the only 1st Edition holo that was widely distributed. It is still a genuine 1st Edition Base Set holo card — the most iconic set in Pokemon history.',
    buyTip: 'Non-shadowless 1st Edition Machamp is the budget entry into Base Set 1st Edition collecting. The starter deck origin keeps supply high and prices low.',
  },
  {
    rank: 28,
    name: '1999 Jungle Scyther #10 Holo',
    set: 'Jungle (Unlimited)',
    player: 'Scyther',
    sport: 'pokemon',
    psa9Price: '$7–$9',
    rawPrice: '$2–$3',
    why: 'Scyther was a fan favorite and competitive staple in the original Pokemon TCG. The Jungle set holo artwork is clean and visually striking. Jungle holos are systematically undervalued versus Base Set — same era, same vintage status, lower prices across the board.',
    buyTip: 'Jungle set holos are the best value play in vintage Pokemon. Base Set gets all the attention while Jungle cards from the same year trade at 30-50% of comparable Base Set holos.',
  },
  {
    rank: 29,
    name: '2000 Team Rocket Dark Raichu #83 Holo',
    set: 'Team Rocket (2000)',
    player: 'Dark Raichu',
    sport: 'pokemon',
    psa9Price: '$6–$9',
    rawPrice: '$1.50–$3',
    why: 'The "secret rare" of the Team Rocket set — Dark Raichu was not listed on the checklist, making it a hidden card that collectors had to discover. The Team Rocket set introduced the "Dark" Pokemon concept and this card carries genuine lore within the hobby.',
    buyTip: 'The secret rare status gives this card a story that most budget cards lack. A great conversation piece in any collection.',
  },
  {
    rank: 30,
    name: '2000 Neo Genesis Heracross #6 Holo',
    set: 'Neo Genesis (2000)',
    player: 'Heracross',
    sport: 'pokemon',
    psa9Price: '$6–$9',
    rawPrice: '$1.50–$3',
    why: 'Neo Genesis was the first set to introduce Generation 2 Pokemon to the English TCG. Heracross is a fan-favorite fighting type with clean holo artwork. The Neo series is increasingly recognized by collectors as the next frontier after Base/Jungle/Fossil appreciation.',
    buyTip: 'Neo Genesis holos are where savvy collectors are accumulating now. The set has not had its price correction yet — early WotC sets outside Base/Jungle/Fossil are still undervalued.',
  },
];

const sportGroups = [
  { sport: 'basketball', label: 'Basketball', icon: '🏀' },
  { sport: 'baseball', label: 'Baseball', icon: '⚾' },
  { sport: 'football', label: 'Football', icon: '🏈' },
  { sport: 'hockey', label: 'Hockey', icon: '🏒' },
  { sport: 'pokemon', label: 'Pokemon', icon: '⚡' },
];

export default function BestCardsUnder10Page() {
  const bySport = (sport: string) => cards.filter(c => c.sport === sport);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: '30 Best Sports Cards Under $10 — Starter Collection Guide',
        description: 'The 30 best sports cards you can buy for under $10. Hall of Famers, junk wax era gems, and budget vintage singles in PSA 9 — build an incredible collection for the price of lunch.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        mainEntityOfPage: 'https://cardvault-two.vercel.app/guides/best-cards-under-10',
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          Budget Collecting Guide
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          30 Best Sports Cards Under $10
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Hall of Famers, iconic rookies, and vintage gems you can buy for less than lunch. Each card includes PSA 9 price range and exactly why it belongs in your collection.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
          <span>Prices reflect 2026 eBay sold listings</span>
          <span>·</span>
          <span>PSA 9 is the target grade for all entries</span>
          <span>·</span>
          <span>30 cards across 5 categories</span>
        </div>
      </div>

      {/* Why under $10 matters */}
      <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/20 to-gray-900/30 border border-emerald-800/30 rounded-2xl p-6 mb-10">
        <h2 className="text-white font-bold text-lg mb-2">The case for the sub-$10 collection</h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          You can build a hall-of-fame collection for the price of lunch. The junk wax era (1987-1994) produced billions of cards featuring some of the greatest athletes in history — and today, those cards trade for pennies raw and single digits slabbed. The result: PSA 9 copies of Hall of Famers, MVPs, and all-time record holders for under $10 each. A complete 30-card collection from this guide costs less than a single mid-tier modern hobby box.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {[
            { label: 'Hakeem Olajuwon Hoops PSA 9', value: '$5–$9', sub: '2x champion, MVP, DPOY, 12x All-Star' },
            { label: 'Barry Bonds Topps RC PSA 9', value: '$6–$9', sub: 'All-time HR king, 7x MVP' },
            { label: 'Martin Brodeur Score RC PSA 9', value: '$6–$9', sub: 'Winningest goalie ever, 3x Cup champion' },
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
        <h2 className="text-white font-bold text-lg mb-3">At this price tier, skip grading — buy raw</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-orange-400 font-semibold text-sm mb-2">Why grading rarely makes sense under $10</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· PSA grading costs $20-25 per card at Economy tier</li>
              <li>· A $7 PSA 9 card cost $20+ to grade — you lose money</li>
              <li>· Shipping and insurance add another $5-10</li>
              <li>· 6-month turnaround ties up your cards for half a year</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="text-emerald-400 font-semibold text-sm mb-2">The smart approach for sub-$10 cards</div>
            <ul className="text-gray-300 text-sm space-y-1.5">
              <li>· Buy already-slabbed PSA 9s when you find them at $5-9</li>
              <li>· Buy raw in bulk (5-10 copies) and cherry-pick the best</li>
              <li>· Use penny sleeves + top loaders for protection at $0.10 each</li>
              <li>· Save your grading budget for cards worth $25+ in PSA 9</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/sports" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          Browse All Sports Cards
        </Link>
        <Link href="/guides/best-cards-under-25" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Best Cards Under $25
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
