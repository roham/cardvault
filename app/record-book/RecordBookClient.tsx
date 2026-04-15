'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';
type Category = 'all' | 'highest-sale' | 'rookie' | 'vintage' | 'modern' | 'graded';

interface RecordSale {
  rank: number;
  cardName: string;
  player: string;
  year: number;
  sport: string;
  salePrice: number;
  grade: string;
  auctionHouse: string;
  saleDate: string;
  notes: string;
  isRookie: boolean;
}

// Real verified record card sales — publicly documented auction results
const RECORD_SALES: RecordSale[] = [
  { rank: 1, cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', year: 1952, sport: 'baseball', salePrice: 12600000, grade: 'SGC 9.5', auctionHouse: 'Heritage Auctions', saleDate: 'August 2022', notes: 'Highest price ever paid for a sports card. One of only a few high-grade examples known.', isRookie: false },
  { rank: 2, cardName: '1909 T206 Honus Wagner', player: 'Honus Wagner', year: 1909, sport: 'baseball', salePrice: 7250000, grade: 'SGC 2', auctionHouse: 'Robert Edward Auctions', saleDate: 'August 2022', notes: 'The most famous baseball card in history. Fewer than 60 copies are known to exist.', isRookie: false },
  { rank: 3, cardName: '1952 Topps Mickey Mantle #311', player: 'Mickey Mantle', year: 1952, sport: 'baseball', salePrice: 5200000, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'January 2021', notes: 'One of only 6 PSA 9 copies known. No PSA 10 exists for this card.', isRookie: false },
  { rank: 4, cardName: '2003 Upper Deck Exquisite LeBron James RPA', player: 'LeBron James', year: 2003, sport: 'basketball', salePrice: 5800000, grade: 'BGS 9', auctionHouse: 'Goldin Auctions', saleDate: 'April 2024', notes: 'Highest-selling basketball card ever. Rookie Patch Autograph limited to 99 copies.', isRookie: true },
  { rank: 5, cardName: '2018 Panini National Treasures Luka Doncic RPA', player: 'Luka Doncic', year: 2018, sport: 'basketball', salePrice: 4600000, grade: 'BGS 9.5', auctionHouse: 'Goldin Auctions', saleDate: 'February 2022', notes: 'Logoman 1-of-1 rookie patch autograph. Sold in a private transaction.', isRookie: true },
  { rank: 6, cardName: '2000 Playoff Contenders Tom Brady RC Auto', player: 'Tom Brady', year: 2000, sport: 'football', salePrice: 3107000, grade: 'BGS 8.5/Auto 9', auctionHouse: 'Lelands', saleDate: 'June 2021', notes: 'Most expensive football card ever sold. Championship Ticket #/100.', isRookie: true },
  { rank: 7, cardName: '1986 Fleer Michael Jordan #57', player: 'Michael Jordan', year: 1986, sport: 'basketball', salePrice: 2928000, grade: 'BGS 10 Pristine', auctionHouse: 'Goldin Auctions', saleDate: 'February 2022', notes: 'Only BGS 10 Pristine example with Black Label. The most iconic basketball card.', isRookie: true },
  { rank: 8, cardName: '1916 M101-4 Babe Ruth #151', player: 'Babe Ruth', year: 1916, sport: 'baseball', salePrice: 2460000, grade: 'PSA 7', auctionHouse: 'Memory Lane', saleDate: 'May 2023', notes: 'Ruth rookie card. One of the most significant cards in the hobby.', isRookie: true },
  { rank: 9, cardName: '1914 Baltimore News Babe Ruth', player: 'Babe Ruth', year: 1914, sport: 'baseball', salePrice: 2460000, grade: 'PSA 2', auctionHouse: 'Robert Edward Auctions', saleDate: 'August 2023', notes: 'Pre-rookie card from Ruth minor league days. Fewer than 10 known copies.', isRookie: false },
  { rank: 10, cardName: '2017 Panini National Treasures Patrick Mahomes RPA', player: 'Patrick Mahomes', year: 2017, sport: 'football', salePrice: 4300000, grade: 'BGS 8.5', auctionHouse: 'PWCC', saleDate: 'March 2021', notes: '1-of-1 Shields Logo rookie patch auto. Sold at the peak of the 2021 card boom.', isRookie: true },
  { rank: 11, cardName: '1979 O-Pee-Chee Wayne Gretzky #18', player: 'Wayne Gretzky', year: 1979, sport: 'hockey', salePrice: 3750000, grade: 'PSA 10', auctionHouse: 'Heritage Auctions', saleDate: 'December 2023', notes: 'The most valuable hockey card. Only 2 PSA 10 copies exist. The Great One.', isRookie: true },
  { rank: 12, cardName: '1933 Goudey Babe Ruth #53', player: 'Babe Ruth', year: 1933, sport: 'baseball', salePrice: 2160000, grade: 'PSA 8', auctionHouse: 'Heritage Auctions', saleDate: 'November 2023', notes: 'One of 4 Ruth cards in the iconic 1933 Goudey set.', isRookie: false },
  { rank: 13, cardName: '2018 Panini Prizm Luka Doncic Silver #280', player: 'Luka Doncic', year: 2018, sport: 'basketball', salePrice: 800000, grade: 'PSA 10', auctionHouse: 'Goldin Auctions', saleDate: 'January 2022', notes: 'The chase card of the modern era. Silver Prizm is the benchmark modern basketball card.', isRookie: true },
  { rank: 14, cardName: '2009 Bowman Chrome Mike Trout Auto #BDPP89', player: 'Mike Trout', year: 2009, sport: 'baseball', salePrice: 3936000, grade: 'BGS 9.5/Auto 10', auctionHouse: 'Goldin Auctions', saleDate: 'August 2020', notes: 'Superfractor 1-of-1. The most valuable modern baseball card at time of sale.', isRookie: true },
  { rank: 15, cardName: '1969 Topps Lew Alcindor #25', player: 'Kareem Abdul-Jabbar', year: 1969, sport: 'basketball', salePrice: 1260000, grade: 'PSA 10', auctionHouse: 'Goldin Auctions', saleDate: 'April 2024', notes: 'Only 1 PSA 10 exists. All-time NBA leading scorer (at time of sale).', isRookie: true },
  { rank: 16, cardName: '2000 Playoff Contenders Tom Brady RC Auto #144', player: 'Tom Brady', year: 2000, sport: 'football', salePrice: 2250000, grade: 'BGS 8.5/Auto 10', auctionHouse: 'PWCC', saleDate: 'March 2021', notes: 'Another Championship Ticket auto. 7x Super Bowl champion.', isRookie: true },
  { rank: 17, cardName: '1951 Bowman Mickey Mantle RC #253', player: 'Mickey Mantle', year: 1951, sport: 'baseball', salePrice: 1800000, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'November 2023', notes: 'True rookie card (year before the famous 1952 Topps). Rarely offered in high grade.', isRookie: true },
  { rank: 18, cardName: '1911 T206 Ty Cobb Bat Off Shoulder', player: 'Ty Cobb', year: 1911, sport: 'baseball', salePrice: 1560000, grade: 'PSA 8', auctionHouse: 'Robert Edward Auctions', saleDate: 'April 2023', notes: 'One of 4 Cobb variations in T206. Highest-graded example of this back.', isRookie: false },
  { rank: 19, cardName: '2018 Panini National Treasures Shohei Ohtani RPA', player: 'Shohei Ohtani', year: 2018, sport: 'baseball', salePrice: 1020000, grade: 'BGS 9.5', auctionHouse: 'Goldin Auctions', saleDate: 'August 2023', notes: 'Logoman 1-of-1. Two-way unicorn — pitcher and hitter at elite level.', isRookie: true },
  { rank: 20, cardName: '1958 Topps Jim Brown RC #62', player: 'Jim Brown', year: 1958, sport: 'football', salePrice: 358500, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'August 2020', notes: 'Greatest running back ever. Only a handful of PSA 9 copies exist.', isRookie: true },
  { rank: 21, cardName: '1948 Leaf Jackie Robinson RC #79', player: 'Jackie Robinson', year: 1948, sport: 'baseball', salePrice: 780000, grade: 'PSA 8', auctionHouse: 'Heritage Auctions', saleDate: 'November 2022', notes: 'Broke the color barrier. One of the most important cards in American sports history.', isRookie: true },
  { rank: 22, cardName: '1966 Topps Bobby Orr RC #35', player: 'Bobby Orr', year: 1966, sport: 'hockey', salePrice: 900000, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'October 2022', notes: 'Second most valuable hockey card. Revolutionized how defensemen play the game.', isRookie: true },
  { rank: 23, cardName: '2019 Panini National Treasures Zion Williamson RPA', player: 'Zion Williamson', year: 2019, sport: 'basketball', salePrice: 1800000, grade: 'BGS 9', auctionHouse: 'PWCC', saleDate: 'April 2021', notes: 'Logoman 1-of-1 RPA. Most hyped prospect since LeBron. Sold during 2021 boom.', isRookie: true },
  { rank: 24, cardName: '1979 O-Pee-Chee Wayne Gretzky #18', player: 'Wayne Gretzky', year: 1979, sport: 'hockey', salePrice: 1290000, grade: 'PSA 10', auctionHouse: 'Goldin Auctions', saleDate: 'November 2020', notes: 'Earlier sale of a PSA 10 Gretzky rookie. 4 all-time scoring records.', isRookie: true },
  { rank: 25, cardName: '1933 Goudey Napoleon Lajoie #106', player: 'Napoleon Lajoie', year: 1933, sport: 'baseball', salePrice: 600000, grade: 'PSA 5', auctionHouse: 'Robert Edward Auctions', saleDate: 'May 2023', notes: 'The "Holy Grail" of 1930s cards. Extremely rare — only distributed by mail.', isRookie: false },
  { rank: 26, cardName: '2020 Panini National Treasures Justin Herbert RPA', player: 'Justin Herbert', year: 2020, sport: 'football', salePrice: 500000, grade: 'BGS 9.5', auctionHouse: 'Goldin Auctions', saleDate: 'July 2022', notes: 'Shield Logo 1-of-1. 2020 Offensive Rookie of the Year.', isRookie: true },
  { rank: 27, cardName: '1986 Fleer Michael Jordan #57', player: 'Michael Jordan', year: 1986, sport: 'basketball', salePrice: 738000, grade: 'PSA 10', auctionHouse: 'Goldin Auctions', saleDate: 'September 2020', notes: 'The most recognizable basketball card. PSA 10 population continues to grow.', isRookie: true },
  { rank: 28, cardName: '1911 T205 Christy Mathewson', player: 'Christy Mathewson', year: 1911, sport: 'baseball', salePrice: 420000, grade: 'PSA 8', auctionHouse: 'Heritage Auctions', saleDate: 'February 2022', notes: 'First ballot HOF pitcher. Gold Border T205 set is among the most beautiful tobacco cards.', isRookie: false },
  { rank: 29, cardName: '1953 Parkhurst Jean Beliveau RC #27', player: 'Jean Beliveau', year: 1953, sport: 'hockey', salePrice: 135000, grade: 'PSA 8', auctionHouse: 'Heritage Auctions', saleDate: 'January 2023', notes: '10x Stanley Cup champion as a player. Arguably the most revered Montreal Canadien.', isRookie: true },
  { rank: 30, cardName: '2018 Panini Prizm Trae Young Silver #78', player: 'Trae Young', year: 2018, sport: 'basketball', salePrice: 280000, grade: 'PSA 10', auctionHouse: 'Goldin Auctions', saleDate: 'March 2021', notes: 'Drafted 5th in 2018 in the Luka/Trae swap. Ice Trae — 3-level scorer.', isRookie: true },
  { rank: 31, cardName: '1951 Parkhurst Gordie Howe RC #66', player: 'Gordie Howe', year: 1951, sport: 'hockey', salePrice: 480000, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'July 2023', notes: 'Mr. Hockey. Played professional hockey across 5 decades. Only high-grade examples command prices like this.', isRookie: true },
  { rank: 32, cardName: '2022 Bowman Chrome Victor Wembanyama', player: 'Victor Wembanyama', year: 2022, sport: 'basketball', salePrice: 300000, grade: 'PSA 10', auctionHouse: 'Goldin Auctions', saleDate: 'January 2024', notes: '#1 overall pick, 7-foot-4 unicorn. Generational talent already breaking records as a rookie.', isRookie: true },
  { rank: 33, cardName: '1963 Topps Pete Rose RC #537', player: 'Pete Rose', year: 1963, sport: 'baseball', salePrice: 720000, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'December 2024', notes: 'Hit King with 4,256 career hits. Banned from the HOF but his rookie card remains iconic.', isRookie: true },
  { rank: 34, cardName: '1965 Topps Joe Namath RC #122', player: 'Joe Namath', year: 1965, sport: 'football', salePrice: 264000, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'August 2021', notes: 'Broadway Joe guaranteed Super Bowl III and delivered. Changed the perception of the AFL.', isRookie: true },
  { rank: 35, cardName: '1957 Topps Johnny Unitas RC #138', player: 'Johnny Unitas', year: 1957, sport: 'football', salePrice: 264000, grade: 'PSA 8', auctionHouse: 'Heritage Auctions', saleDate: 'November 2020', notes: 'Golden Arm. Led the Greatest Game Ever Played (1958 NFL Championship).', isRookie: true },
  { rank: 36, cardName: '1986 Fleer Sticker Michael Jordan #8', player: 'Michael Jordan', year: 1986, sport: 'basketball', salePrice: 250000, grade: 'BGS 9.5', auctionHouse: 'PWCC', saleDate: 'July 2021', notes: 'The sticker counterpart to the famous Fleer #57. More affordable entry to MJ rookies.', isRookie: true },
  { rank: 37, cardName: '1911 T206 Cy Young Portrait', player: 'Cy Young', year: 1911, sport: 'baseball', salePrice: 480000, grade: 'PSA 7', auctionHouse: 'Robert Edward Auctions', saleDate: 'October 2022', notes: '511 wins — a record that will never be broken. The pitching award is named after him.', isRookie: false },
  { rank: 38, cardName: '1955 Topps Roberto Clemente RC #164', player: 'Roberto Clemente', year: 1955, sport: 'baseball', salePrice: 840000, grade: 'PSA 9', auctionHouse: 'Heritage Auctions', saleDate: 'August 2022', notes: '3,000 hits exactly. Died in a plane crash delivering earthquake relief supplies. True hero.', isRookie: true },
  { rank: 39, cardName: '1935 National Chicle Bronko Nagurski RC #34', player: 'Bronko Nagurski', year: 1935, sport: 'football', salePrice: 750000, grade: 'PSA 8', auctionHouse: 'Heritage Auctions', saleDate: 'November 2023', notes: 'The most valuable pre-war football card. Charter member of the Pro Football HOF.', isRookie: true },
  { rank: 40, cardName: '2023 Panini Prizm Connor Bedard Silver', player: 'Connor Bedard', year: 2023, sport: 'hockey', salePrice: 80000, grade: 'PSA 10', auctionHouse: 'eBay', saleDate: 'February 2024', notes: '#1 pick in 2023. Most hyped hockey prospect since McDavid. Calder Trophy winner.', isRookie: true },
];

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function sportColor(sport: string): string {
  switch (sport) {
    case 'baseball': return 'text-red-400';
    case 'basketball': return 'text-orange-400';
    case 'football': return 'text-green-400';
    case 'hockey': return 'text-sky-400';
    default: return 'text-gray-400';
  }
}

function sportBg(sport: string): string {
  switch (sport) {
    case 'baseball': return 'bg-red-900/30 border-red-800/40';
    case 'basketball': return 'bg-orange-900/30 border-orange-800/40';
    case 'football': return 'bg-green-900/30 border-green-800/40';
    case 'hockey': return 'bg-sky-900/30 border-sky-800/40';
    default: return 'bg-gray-900/30 border-gray-800/40';
  }
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function RecordBookClient() {
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<'price' | 'year' | 'recent'>('price');

  const filtered = useMemo(() => {
    let results = [...RECORD_SALES];
    if (sportFilter !== 'all') results = results.filter(s => s.sport === sportFilter);
    if (categoryFilter === 'rookie') results = results.filter(s => s.isRookie);
    if (categoryFilter === 'vintage') results = results.filter(s => s.year < 1970);
    if (categoryFilter === 'modern') results = results.filter(s => s.year >= 2000);
    if (categoryFilter === 'graded') results = results.filter(s => s.grade.includes('10'));

    if (sortBy === 'price') results.sort((a, b) => b.salePrice - a.salePrice);
    else if (sortBy === 'year') results.sort((a, b) => a.year - b.year);
    else results.sort((a, b) => {
      const yearA = parseInt(b.saleDate.split(' ')[1] || '2020');
      const yearB = parseInt(a.saleDate.split(' ')[1] || '2020');
      return yearA - yearB;
    });

    return results;
  }, [sportFilter, categoryFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = RECORD_SALES.reduce((s, r) => s + r.salePrice, 0);
    const bySport: Record<string, { count: number; total: number; highest: RecordSale }> = {};
    for (const sale of RECORD_SALES) {
      if (!bySport[sale.sport]) bySport[sale.sport] = { count: 0, total: 0, highest: sale };
      bySport[sale.sport].count++;
      bySport[sale.sport].total += sale.salePrice;
      if (sale.salePrice > bySport[sale.sport].highest.salePrice) bySport[sale.sport].highest = sale;
    }
    const rookieCount = RECORD_SALES.filter(s => s.isRookie).length;
    const avgPrice = total / RECORD_SALES.length;
    return { total, bySport, rookieCount, avgPrice };
  }, []);

  // Check which players exist in our database
  const playerSlugs = useMemo(() => {
    const map = new Map<string, string>();
    for (const card of sportsCards) {
      map.set(card.player.toLowerCase(), slugifyPlayer(card.player));
    }
    return map;
  }, []);

  return (
    <div>
      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/20 border border-yellow-800/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{formatPrice(stats.total)}</div>
          <div className="text-xs text-gray-400 mt-1">Total Record Sales</div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/40 to-violet-900/20 border border-purple-800/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{RECORD_SALES.length}</div>
          <div className="text-xs text-gray-400 mt-1">Notable Sales Tracked</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/20 border border-emerald-800/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{formatPrice(stats.avgPrice)}</div>
          <div className="text-xs text-gray-400 mt-1">Average Sale Price</div>
        </div>
        <div className="bg-gradient-to-br from-rose-900/40 to-pink-900/20 border border-rose-800/40 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-400">{Math.round((stats.rookieCount / RECORD_SALES.length) * 100)}%</div>
          <div className="text-xs text-gray-400 mt-1">Are Rookie Cards</div>
        </div>
      </div>

      {/* Sport Records Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {(['baseball', 'basketball', 'football', 'hockey'] as const).map(sport => {
          const data = stats.bySport[sport];
          if (!data) return null;
          return (
            <button
              key={sport}
              onClick={() => setSportFilter(sportFilter === sport ? 'all' : sport)}
              className={`${sportBg(sport)} border rounded-xl p-3 text-left transition-all ${sportFilter === sport ? 'ring-2 ring-white/30 scale-[1.02]' : 'hover:scale-[1.01]'}`}
            >
              <div className={`text-xs font-semibold uppercase tracking-wider ${sportColor(sport)}`}>{sport}</div>
              <div className="text-lg font-bold text-white mt-1">{formatPrice(data.highest.salePrice)}</div>
              <div className="text-xs text-gray-400 truncate">{data.highest.player}</div>
              <div className="text-xs text-gray-500 mt-1">{data.count} records</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1 bg-gray-900/60 rounded-lg p-1">
          {(['all', 'rookie', 'vintage', 'modern', 'graded'] as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${categoryFilter === cat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {cat === 'all' ? 'All' : cat === 'rookie' ? 'Rookies' : cat === 'vintage' ? 'Pre-1970' : cat === 'modern' ? '2000+' : 'PSA/BGS 10'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900/60 rounded-lg p-1 ml-auto">
          {(['price', 'year', 'recent'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${sortBy === s ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {s === 'price' ? 'By Price' : s === 'year' ? 'By Year' : 'Most Recent'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-400 mb-4">
        Showing {filtered.length} of {RECORD_SALES.length} record sales
        {sportFilter !== 'all' && <span className={`ml-2 ${sportColor(sportFilter)}`}>({sportFilter})</span>}
      </div>

      {/* Record Sales List */}
      <div className="space-y-3">
        {filtered.map((sale, idx) => {
          const playerSlug = playerSlugs.get(sale.player.toLowerCase());
          return (
            <div
              key={`${sale.cardName}-${sale.saleDate}-${idx}`}
              className={`${sportBg(sale.sport)} border rounded-xl p-4 sm:p-5 transition-all hover:scale-[1.005]`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Rank */}
                <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                  idx === 2 ? 'bg-amber-700/20 text-amber-500' :
                  'bg-gray-800/50 text-gray-500'
                }`}>
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-bold text-white">{sale.cardName}</h3>
                    {sale.isRookie && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 rounded-full">RC</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm mb-2">
                    <span className={`font-medium ${sportColor(sale.sport)}`}>
                      {sale.sport.charAt(0).toUpperCase() + sale.sport.slice(1)}
                    </span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{sale.grade}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{sale.auctionHouse}</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{sale.saleDate}</span>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{sale.notes}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-yellow-400">{sale.salePrice >= 1_000_000 ? `$${(sale.salePrice / 1_000_000).toFixed(1)}M` : `$${sale.salePrice.toLocaleString()}`}</span>
                    {playerSlug && (
                      <Link href={`/players/${playerSlug}`} className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 ml-2">
                        View Player Profile
                      </Link>
                    )}
                    <a
                      href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(sale.cardName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1"
                    >
                      Search on eBay
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No record sales match your filters. Try adjusting the sport or category.
        </div>
      )}

      {/* Key Takeaways */}
      <div className="mt-10 bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Key Takeaways from Record Sales</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-1">Rookie Cards Dominate</h3>
              <p className="text-sm text-gray-400">{stats.rookieCount} of {RECORD_SALES.length} record sales ({Math.round((stats.rookieCount / RECORD_SALES.length) * 100)}%) are rookie cards. First-year cards command the highest premiums across all sports.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-400 mb-1">Grading Matters Enormously</h3>
              <p className="text-sm text-gray-400">The difference between a PSA 9 and PSA 10 can be millions of dollars. A 1952 Topps Mantle PSA 9 sold for $5.2M while the SGC 9.5 hit $12.6M.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-1">Scarcity Drives Price</h3>
              <p className="text-sm text-gray-400">The T206 Wagner, 1-of-1 Logoman patches, and low-population vintage cards consistently achieve the highest prices. Fewer copies = higher ceiling.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-sky-400 mb-1">Baseball Leads, But Basketball Is Rising</h3>
              <p className="text-sm text-gray-400">Baseball has the most record sales due to 100+ years of card history, but basketball cards like LeBron and Luka RPAs are challenging at the top.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-orange-400 mb-1">1-of-1 Cards Are King</h3>
              <p className="text-sm text-gray-400">Modern 1-of-1 cards (Logoman patches, Superfractors) from Panini National Treasures and Bowman Chrome now compete with century-old vintage cardboard.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-400 mb-1">Hockey Is Undervalued</h3>
              <p className="text-sm text-gray-400">The Gretzky OPC RC at $3.75M is the only hockey card in the top 10. With fewer collectors and lower supply, hockey may offer the best upside.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-8 grid sm:grid-cols-3 gap-3">
        <Link href="/tools/grading-roi" className="block bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-blue-600/50 transition-colors">
          <div className="text-sm font-semibold text-white mb-1">Grading ROI Calculator</div>
          <div className="text-xs text-gray-400">See if grading your card is worth it</div>
        </Link>
        <Link href="/tools/investment-calc" className="block bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-emerald-600/50 transition-colors">
          <div className="text-sm font-semibold text-white mb-1">Investment Calculator</div>
          <div className="text-xs text-gray-400">Compare card returns vs stocks, gold</div>
        </Link>
        <Link href="/tools/price-history" className="block bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-purple-600/50 transition-colors">
          <div className="text-sm font-semibold text-white mb-1">Price History</div>
          <div className="text-xs text-gray-400">Track any card over 90 days</div>
        </Link>
        <Link href="/tools/rarity-score" className="block bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-amber-600/50 transition-colors">
          <div className="text-sm font-semibold text-white mb-1">Rarity Score Calculator</div>
          <div className="text-xs text-gray-400">How rare is your card? 0-100 score</div>
        </Link>
        <Link href="/tools/pop-report" className="block bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-rose-600/50 transition-colors">
          <div className="text-sm font-semibold text-white mb-1">Population Report</div>
          <div className="text-xs text-gray-400">PSA grade distribution estimates</div>
        </Link>
        <Link href="/tools/flip-calc" className="block bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 hover:border-sky-600/50 transition-colors">
          <div className="text-sm font-semibold text-white mb-1">Flip Profit Calculator</div>
          <div className="text-xs text-gray-400">Calculate ROI on card flips</div>
        </Link>
      </div>
    </div>
  );
}
