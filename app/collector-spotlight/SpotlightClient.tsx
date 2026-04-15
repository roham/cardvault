'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Collector Profiles ────────────────────────────────────────────────

interface CollectorProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  archetype: string;
  tagline: string;
  avatar: string;
  yearsCollecting: number;
  focus: string[];
  collectionSize: string;
  prizedCard: { name: string; value: string; story: string };
  biggestFlip: { card: string; bought: string; sold: string; profit: string };
  topTips: string[];
  dailyRoutine: string;
  favoriteTools: { name: string; href: string }[];
  hotTake: string;
  stats: { label: string; value: string }[];
  sports: string[];
  quote: string;
}

const COLLECTORS: CollectorProfile[] = [
  {
    id: 'marcus-the-flipper',
    name: 'Marcus "The Flipper" Chen',
    age: 29,
    location: 'Phoenix, AZ',
    archetype: 'The Flipper',
    tagline: 'Buy the rumor, sell the hype',
    avatar: '💰',
    yearsCollecting: 7,
    focus: ['Modern rookies', 'Graded cards', 'Prizm/Optic', 'Short prints'],
    collectionSize: '2,400+ cards ($180K estimated value)',
    prizedCard: {
      name: '2018 Luka Doncic Prizm Silver PSA 10',
      value: '$8,500',
      story: 'Bought raw for $200 on eBay in 2019 when Luka was still "just a Euro league guy." Graded PSA 10. Could have sold for $50K in 2021 but held. Still my best ROI at 4,150%.',
    },
    biggestFlip: {
      card: '2023 Victor Wembanyama Prizm Silver',
      bought: '$450 (pre-draft)',
      sold: '$2,800 (draft night)',
      profit: '+$2,350 in 48 hours',
    },
    topTips: [
      'Buy 2-3 weeks before the NBA/NFL draft — prices spike 200-400% on draft night',
      'Never hold a player through their second season unless they show superstar trajectory',
      'PSA 10 pop report is your friend — low pop + high demand = premium',
      'Set price alerts on eBay. Patience gets you 30-40% below market on any card',
    ],
    dailyRoutine: 'Check eBay sold comps at 7am. Scan @CardPurchaser and @SportsCardInvestor on X. Review my watchlist on CardVault. Submit 10-15 bids by noon. Ship sold cards at 3pm.',
    favoriteTools: [
      { name: 'Price Watchlist', href: '/tools/watchlist' },
      { name: 'Flip Calculator', href: '/tools/flip-calc' },
      { name: 'Market Dashboard', href: '/tools/market-dashboard' },
    ],
    hotTake: 'Baseball cards are the most undervalued asset in the hobby right now. Basketball is overpriced relative to the size of the sport globally.',
    stats: [
      { label: 'Avg Monthly Profit', value: '$2,800' },
      { label: 'Cards Flipped/Month', value: '45-60' },
      { label: 'Win Rate', value: '78%' },
      { label: 'Best Month', value: '$12,400' },
    ],
    sports: ['basketball', 'football'],
    quote: 'The hobby rewards patience and punishes emotion. Set your exit price before you buy, and stick to it.',
  },
  {
    id: 'dave-the-dad',
    name: 'Dave "The Dad" Patterson',
    age: 42,
    location: 'Columbus, OH',
    archetype: 'The Returning Collector',
    tagline: 'Bonding with my son, one pack at a time',
    avatar: '👨‍👦',
    yearsCollecting: 3,
    focus: ['Junk wax nostalgia', 'Set building', 'Budget cards', 'Father-son bonding'],
    collectionSize: '800+ cards ($4,200 estimated value)',
    prizedCard: {
      name: '1989 Ken Griffey Jr. Upper Deck #1 PSA 8',
      value: '$120',
      story: 'Found this in my childhood collection in the attic when my son asked about baseball cards. Sent it to PSA and it came back an 8. It is not worth a fortune but it reconnected me to collecting.',
    },
    biggestFlip: {
      card: '1987 Topps Barry Bonds #320',
      bought: '$0.50 (garage sale)',
      sold: '$15 (eBay)',
      profit: '+$14.50 — taught my son about margins',
    },
    topTips: [
      'Do not chase the expensive stuff early. Learn the hobby with $1-5 cards first',
      'Card shows are way more fun than buying online — take your kids',
      'Penny sleeves + top loaders cost almost nothing and protect your investment',
      'The CardVault "What Should I Collect?" quiz saved me from wasting money on products I did not understand',
    ],
    dailyRoutine: 'Check CardVault card of the day over breakfast with my son. Sort and organize cards together on weekends. Hit a local card show once a month.',
    favoriteTools: [
      { name: 'What Should I Collect?', href: '/tools/quiz' },
      { name: 'Card Identifier', href: '/tools/identify' },
      { name: 'Set Completion Tracker', href: '/tools/set-completion' },
    ],
    hotTake: 'Junk wax era cards get too much hate. The nostalgia value is real and some of those cards are starting to appreciate again.',
    stats: [
      { label: 'Monthly Budget', value: '$75' },
      { label: 'Sets Completed', value: '3' },
      { label: 'Card Shows/Year', value: '12' },
      { label: 'Son\'s Favorite', value: 'Ohtani' },
    ],
    sports: ['baseball'],
    quote: 'I came back for the cards. I stayed for the time with my son.',
  },
  {
    id: 'mia-the-completionist',
    name: 'Mia "The List" Rodriguez',
    age: 23,
    location: 'Austin, TX',
    archetype: 'The Completionist',
    tagline: 'If I am missing one card, the set is not done',
    avatar: '📋',
    yearsCollecting: 5,
    focus: ['Set building', 'Visual binders', 'Parallels', 'Insert chases'],
    collectionSize: '6,200+ cards (14 complete sets, $28K estimated)',
    prizedCard: {
      name: '2023-24 Panini Prizm Basketball Complete Master Set',
      value: '$3,400',
      story: 'Took me 8 months to track down every base card, every parallel, every insert. The last card I needed was a Chet Holmgren Orange Ice /75 that I finally found on COMC for $45. The relief was unreal.',
    },
    biggestFlip: {
      card: 'N/A — I do not sell',
      bought: 'N/A',
      sold: 'N/A',
      profit: 'N/A — sets only appreciate',
    },
    topTips: [
      'Start with the base set. Check off cards as you go. CardVault Set Completion Tracker is essential',
      'Trade for the last 5% — eBay gets expensive for commons everyone needs',
      'Store completed sets in binder pages, organized by card number. It looks incredible',
      'Short prints are always the last ones you need. Budget 30% of your set cost for the final 10% of cards',
    ],
    dailyRoutine: 'Update my CardVault binder after every purchase. Check COMC for missing commons. Browse r/baseballcards for trade posts. Organize recent purchases into binder pages.',
    favoriteTools: [
      { name: 'Set Completion Tracker', href: '/tools/set-completion' },
      { name: 'Visual Binder', href: '/tools/visual-binder' },
      { name: 'Set Checklist', href: '/tools/set-checklist' },
    ],
    hotTake: 'Single card investors are playing the wrong game. Complete sets from good years always appreciate. The 2012 Topps Chrome complete set with Trout and Harper RCs is worth 10x what it cost to build.',
    stats: [
      { label: 'Complete Sets', value: '14' },
      { label: 'Active Builds', value: '3' },
      { label: 'Completion Rate', value: '96.8%' },
      { label: 'Rarest Pull', value: '/25 parallel' },
    ],
    sports: ['basketball', 'baseball'],
    quote: 'Collecting is not about the money. It is about the satisfaction of checking off every single card.',
  },
  {
    id: 'tony-the-dealer',
    name: 'Tony "The Table" Moretti',
    age: 55,
    location: 'Cherry Hill, NJ',
    archetype: 'The Dealer',
    tagline: '30 years at the table, still learning every day',
    avatar: '🏪',
    yearsCollecting: 30,
    focus: ['Vintage', 'Graded inventory', 'Card show circuit', 'Wholesale lots'],
    collectionSize: '15,000+ cards ($450K inventory)',
    prizedCard: {
      name: '1956 Topps Mickey Mantle #135 PSA 7',
      value: '$22,000',
      story: 'Bought this at a Cherry Hill card show in 1998 for $800. Have turned down $20K offers twice. Some cards you just do not sell. This one sits in my personal collection, not the inventory.',
    },
    biggestFlip: {
      card: '1986-87 Fleer Michael Jordan #57 PSA 9',
      bought: '$3,200 (2018)',
      sold: '$75,000 (2021)',
      profit: '+$71,800 — thank you, Last Dance',
    },
    topTips: [
      'At a card show, the best deals happen in the last hour. Dealers would rather sell cheap than pack it home',
      'Always examine cards under a loupe before buying graded. The holder can hide flaws',
      'Volume is king. I make more money on 500 $10 sales than 1 $5,000 sale',
      'CardVault Dealer Scanner is a godsend at shows — instant comp checks on my phone',
    ],
    dailyRoutine: 'Inventory check at 6am. Ship eBay orders by 10am. Price new acquisitions using CardVault and eBay comps. Shows on weekends. Buy collections on Tuesday/Wednesday — that is when people sell.',
    favoriteTools: [
      { name: 'Dealer Scanner', href: '/tools/dealer-scanner' },
      { name: 'Shipping Calculator', href: '/tools/shipping-calc' },
      { name: 'Listing Generator', href: '/tools/listing-generator' },
    ],
    hotTake: 'Pre-war cards are the most underappreciated segment of the hobby. A T206 Honus Wagner gets all the press, but you can buy beautiful 100-year-old cards for $50. People are sleeping on history.',
    stats: [
      { label: 'Shows/Year', value: '40+' },
      { label: 'Avg Show Revenue', value: '$3,200' },
      { label: 'Years as Dealer', value: '22' },
      { label: 'Inventory Items', value: '15,000+' },
    ],
    sports: ['baseball', 'basketball', 'football', 'hockey'],
    quote: 'Respect the hobby, respect the customer, and the money follows.',
  },
  {
    id: 'jess-the-opener',
    name: 'Jess "Rip Queen" Nakamura',
    age: 19,
    location: 'San Diego, CA',
    archetype: 'The Content Creator',
    tagline: 'If I did not film it, did I even pull it?',
    avatar: '📱',
    yearsCollecting: 2,
    focus: ['Pack breaks', 'Hobby boxes', 'Content creation', 'TikTok/YouTube'],
    collectionSize: '1,100+ cards ($15K estimated — mostly pulls)',
    prizedCard: {
      name: '2024 Bowman Chrome Ethan Salas Gold Auto /50',
      value: '$4,200',
      story: 'Pulled this live on TikTok with 2,000 viewers. My hands were shaking. The chat went insane. That video got 1.2M views and is the reason I have 180K followers now.',
    },
    biggestFlip: {
      card: '2024 Topps Chrome Elly De La Cruz Refractor Auto',
      bought: '$0 (pulled from $250 hobby box)',
      sold: '$1,800 (eBay)',
      profit: '+$1,550 net after box cost',
    },
    topTips: [
      'Film EVERY break. You never know which one goes viral. My best video was from a $25 blaster',
      'Hobby boxes are better content than retail — the guaranteed auto creates a narrative arc',
      'CardVault Pack Simulator is how I practice rip decisions before spending real money',
      'Do NOT get emotionally attached to pulls. Sell while the hype is hot, buy back later when it dips',
    ],
    dailyRoutine: 'Film a break at 11am (best engagement time). Edit and post by 3pm. Engage with comments until 6pm. Scout deals on eBay in the evening. Weekly rip stream on Friday nights.',
    favoriteTools: [
      { name: 'Pack Simulator', href: '/tools/pack-sim' },
      { name: 'Rip or Skip', href: '/rip-or-skip' },
      { name: 'Box Break Calculator', href: '/tools/box-break' },
    ],
    hotTake: 'Card collecting is going to be bigger than sneakers within 5 years. Gen Z cares about physical collectibles in a way nobody predicted.',
    stats: [
      { label: 'TikTok Followers', value: '180K' },
      { label: 'Boxes Ripped/Month', value: '8-12' },
      { label: 'Best Pull on Camera', value: '$4,200' },
      { label: 'Content Revenue', value: '$2,100/mo' },
    ],
    sports: ['baseball', 'basketball'],
    quote: 'The thrill of the rip is the whole point. If you are not having fun, you are doing it wrong.',
  },
  {
    id: 'kai-the-investor',
    name: 'Kai "The Portfolio" Williams',
    age: 26,
    location: 'Denver, CO',
    archetype: 'The Investor',
    tagline: 'Cards are alternative assets. Treat them like it.',
    avatar: '📈',
    yearsCollecting: 4,
    focus: ['Cross-category', 'Sealed products', 'PSA 10 modern', 'Market analysis'],
    collectionSize: '450 cards + 35 sealed products ($95K portfolio)',
    prizedCard: {
      name: '2018 Panini National Treasures Luka Doncic RPA /99',
      value: '$28,000',
      story: 'Bought this as my thesis investment in the "NBA globalization = card value" theory. European superstars drive international demand. Luka is the Michael Jordan of European collecting.',
    },
    biggestFlip: {
      card: '2020-21 Topps Chrome F1 Max Verstappen PSA 10',
      bought: '$120 (early 2022)',
      sold: '$2,800 (post 2023 championship)',
      profit: '+$2,680 — cross-category arbitrage',
    },
    topTips: [
      'Diversify across sports like you diversify a stock portfolio. I hold baseball, basketball, football, hockey, and F1',
      'Sealed products from limited print runs are the safest long-term hold in the hobby',
      'Never invest more than 5% of your portfolio in any single card',
      'CardVault Diversification Analyzer helps me rebalance quarterly',
    ],
    dailyRoutine: 'Check CardVault Market Dashboard and Market Movers at 8am. Review portfolio performance weekly. Buy sealed on dips. Sell individual cards when they hit 2x target.',
    favoriteTools: [
      { name: 'Diversification Analyzer', href: '/tools/diversification' },
      { name: 'Sealed EV Calculator', href: '/tools/sealed-ev' },
      { name: 'Investment Calculator', href: '/tools/investment-calc' },
    ],
    hotTake: 'The people buying $50K Jordan rookies are overpaying for nostalgia. The real alpha is in emerging markets — F1 cards, WNBA, and international soccer.',
    stats: [
      { label: 'Portfolio Value', value: '$95K' },
      { label: 'Annual Return', value: '+34%' },
      { label: 'Categories', value: '6 sports' },
      { label: 'Sealed Holdings', value: '35 products' },
    ],
    sports: ['basketball', 'baseball', 'football', 'hockey'],
    quote: 'Treat your collection like a portfolio and your hobby like a business. The two can coexist.',
  },
];

// ── Sport badge colors ────────────────────────────────────────────────

const sportBadge: Record<string, string> = {
  baseball: 'bg-red-950/50 text-red-400 border-red-800/50',
  basketball: 'bg-orange-950/50 text-orange-400 border-orange-800/50',
  football: 'bg-blue-950/50 text-blue-400 border-blue-800/50',
  hockey: 'bg-cyan-950/50 text-cyan-400 border-cyan-800/50',
};

export default function SpotlightClient() {
  const [selected, setSelected] = useState<string>(COLLECTORS[0].id);

  const collector = COLLECTORS.find(c => c.id === selected) || COLLECTORS[0];

  return (
    <div className="space-y-8">
      {/* Collector selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLLECTORS.map(c => (
          <button key={c.id} onClick={() => setSelected(c.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              selected === c.id
                ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
            }`}>
            <span className="text-lg">{c.avatar}</span>
            <span>{c.archetype}</span>
          </button>
        ))}
      </div>

      {/* Profile header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="text-5xl w-16 h-16 flex items-center justify-center bg-gray-800 rounded-2xl shrink-0">
            {collector.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{collector.name}</h2>
            <p className="text-emerald-400 font-medium mb-2">{collector.tagline}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{collector.age} years old</span>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{collector.location}</span>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{collector.yearsCollecting} years collecting</span>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{collector.collectionSize}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {collector.sports.map(s => (
                <span key={s} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${sportBadge[s] || 'bg-gray-800 text-gray-400'}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {collector.stats.map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-white font-bold text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Focus + Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Collecting Focus</h3>
          <div className="flex flex-wrap gap-2">
            {collector.focus.map(f => (
              <span key={f} className="text-sm bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-3 py-1 rounded-lg">{f}</span>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-900 to-gray-900/80 border border-gray-800 rounded-xl p-5 flex items-center">
          <blockquote className="text-gray-300 italic text-lg leading-relaxed">
            &ldquo;{collector.quote}&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Prized card + Biggest flip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Prized Card</h3>
          <p className="text-emerald-400 font-medium mb-1">{collector.prizedCard.name}</p>
          <p className="text-white font-bold text-lg mb-2">{collector.prizedCard.value}</p>
          <p className="text-gray-400 text-sm leading-relaxed">{collector.prizedCard.story}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Biggest Flip</h3>
          <p className="text-white font-medium mb-2">{collector.biggestFlip.card}</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-xs text-gray-500">Bought</p>
              <p className="text-red-400 font-medium text-sm">{collector.biggestFlip.bought}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sold</p>
              <p className="text-emerald-400 font-medium text-sm">{collector.biggestFlip.sold}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Profit</p>
              <p className="text-yellow-400 font-bold text-sm">{collector.biggestFlip.profit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">{collector.name.split(' ')[0]}&apos;s Top Tips</h3>
        <div className="space-y-3">
          {collector.topTips.map((tip, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-emerald-400 font-bold text-sm w-6 shrink-0">{i + 1}.</span>
              <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Daily routine */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Daily Routine</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{collector.dailyRoutine}</p>
      </div>

      {/* Hot take */}
      <div className="bg-gradient-to-r from-orange-950/30 to-gray-900 border border-orange-800/30 rounded-xl p-5">
        <h3 className="text-orange-400 font-semibold mb-2">Hot Take</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{collector.hotTake}</p>
      </div>

      {/* Favorite tools */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Favorite CardVault Tools</h3>
        <div className="flex flex-wrap gap-3">
          {collector.favoriteTools.map(t => (
            <Link key={t.href} href={t.href}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg border border-gray-700 hover:border-emerald-700 transition-colors">
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
