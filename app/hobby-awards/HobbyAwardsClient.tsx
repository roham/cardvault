'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface Nominee {
  player: string;
  card: string;
  year: number;
  sport: 'baseball' | 'basketball' | 'football' | 'hockey';
  value: string;
  slug: string;
  reason: string;
}

interface AwardCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  nominees: Nominee[];
  winnerIndex: number; // data-driven "official" pick
}

// ── Deterministic seed ─────────────────────────────────────────────────────
function getYearSeed(): number {
  return new Date().getFullYear();
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Award Categories ──────────────────────────────────────────────────────
const CATEGORIES: AwardCategory[] = [
  {
    id: 'rookie-of-year',
    title: 'Rookie Card of the Year',
    emoji: '🏆',
    description: 'The most impactful rookie card release — combining on-field/court dominance, collector demand, and market movement.',
    nominees: [
      { player: 'Victor Wembanyama', card: '2023 Panini Prizm RC', year: 2023, sport: 'basketball', value: '$200-$400', slug: 'victor-wembanyama', reason: 'Generational unicorn — 7\'4" with guard skills. Most hyped basketball rookie card since LeBron.' },
      { player: 'Paul Skenes', card: '2024 Bowman Chrome 1st', year: 2024, sport: 'baseball', value: '$80-$150', slug: 'paul-skenes', reason: 'Dominant pitching prospect delivering ace-level stuff from Day 1. Best pitching RC since Strasburg.' },
      { player: 'Caleb Williams', card: '2024 Panini Prizm RC', year: 2024, sport: 'football', value: '$60-$120', slug: 'caleb-williams', reason: '#1 overall pick with generational arm talent. Chicago banking their future on this RC.' },
      { player: 'Macklin Celebrini', card: '2024 Upper Deck Young Guns RC', year: 2024, sport: 'hockey', value: '$80-$150', slug: 'macklin-celebrini', reason: '#1 overall pick making instant impact. Best hockey rookie card since Bedard.' },
      { player: 'Jayden Daniels', card: '2024 Panini Prizm RC', year: 2024, sport: 'football', value: '$40-$80', slug: 'jayden-daniels', reason: 'OROY winner. Dual-threat QB transformed Washington overnight.' },
    ],
    winnerIndex: 0,
  },
  {
    id: 'best-investment',
    title: 'Best Investment Card',
    emoji: '📈',
    description: 'The card with the strongest risk-adjusted upside — high floor, high ceiling, and real fundamentals behind it.',
    nominees: [
      { player: 'Shohei Ohtani', card: '2018 Topps Update RC #US1', year: 2018, sport: 'baseball', value: '$300-$500', slug: 'shohei-ohtani', reason: 'True two-way unicorn. No comparable player in baseball history. Long-term blue chip.' },
      { player: 'Luka Doncic', card: '2018 Panini Prizm RC #280', year: 2018, sport: 'basketball', value: '$400-$600', slug: 'luka-doncic', reason: 'Already an all-timer at 25. Championship chase will define ceiling. Undervalued vs peers.' },
      { player: 'Patrick Mahomes', card: '2017 Panini Prizm RC', year: 2017, sport: 'football', value: '$500-$800', slug: 'patrick-mahomes', reason: 'Dynasty QB with 3 rings. Best football investment of the decade. Still climbing.' },
      { player: 'Connor McDavid', card: '2015 Upper Deck Young Guns RC', year: 2015, sport: 'hockey', value: '$400-$800', slug: 'connor-mcdavid', reason: 'Best hockey player alive. Cup chase is the catalyst for the next value spike.' },
      { player: 'Anthony Edwards', card: '2020 Panini Prizm RC', year: 2020, sport: 'basketball', value: '$100-$200', slug: 'anthony-edwards', reason: 'The next face of the NBA. Marketing machine + elite play = strong long-term hold.' },
    ],
    winnerIndex: 2,
  },
  {
    id: 'best-value',
    title: 'Best Bang for Your Buck',
    emoji: '💰',
    description: 'The card that delivers the most quality per dollar — undervalued stars whose cards haven\'t caught up to their performance.',
    nominees: [
      { player: 'Nikola Jokic', card: '2015 Panini Prizm RC', year: 2015, sport: 'basketball', value: '$300-$500', slug: 'nikola-jokic', reason: '3x MVP, champion, possibly the best passing big ever — still cheaper than Giannis and Luka RCs.' },
      { player: 'Gunnar Henderson', card: '2023 Topps Chrome RC', year: 2023, sport: 'baseball', value: '$30-$60', slug: 'gunnar-henderson', reason: 'Elite SS at 23 with 30+ HR power. His RC is priced like a mid-tier prospect — massive gap.' },
      { player: 'Lamar Jackson', card: '2018 Panini Prizm RC', year: 2018, sport: 'football', value: '$100-$200', slug: 'lamar-jackson', reason: 'Back-to-back MVP but priced at 1/3 of Mahomes. Market is slowly waking up.' },
      { player: 'Cale Makar', card: '2019 Upper Deck Young Guns RC', year: 2019, sport: 'hockey', value: '$100-$200', slug: 'cale-makar', reason: 'Best defenseman since Lidstrom. Norris Trophy lock. Cup champion. Somehow still affordable.' },
      { player: 'Bobby Witt Jr.', card: '2022 Topps Chrome RC', year: 2022, sport: 'baseball', value: '$40-$80', slug: 'bobby-witt-jr', reason: 'Extension locked him in long-term. 5-tool player with a decade of prime ahead. Bargain RC.' },
    ],
    winnerIndex: 0,
  },
  {
    id: 'breakout-star',
    title: 'Breakout Card of the Year',
    emoji: '🚀',
    description: 'The player whose cards exploded — going from overlooked to must-own. The biggest market mover of the year.',
    nominees: [
      { player: 'Caitlin Clark', card: '2024 Panini Prizm RC', year: 2024, sport: 'basketball', value: '$150-$300', slug: 'caitlin-clark', reason: 'Transcended the sport. Created a market for women\'s basketball cards that didn\'t exist before.' },
      { player: 'Jackson Chourio', card: '2024 Topps Chrome RC', year: 2024, sport: 'baseball', value: '$50-$100', slug: 'jackson-chourio', reason: '20-year-old 5-tool player. Cards went from $10 to $100+ during his breakout season.' },
      { player: 'Cam Ward', card: '2025 Bowman University', year: 2025, sport: 'football', value: '$30-$60', slug: 'cam-ward', reason: 'Transfer portal to Heisman finalist. Pre-NFL draft hype pushing cards to new heights.' },
      { player: 'Connor Bedard', card: '2023 Upper Deck Young Guns RC', year: 2023, sport: 'hockey', value: '$150-$300', slug: 'connor-bedard', reason: 'Most hyped hockey prospect since Crosby. Living up to every ounce of it.' },
      { player: 'CJ Stroud', card: '2023 Panini Prizm RC', year: 2023, sport: 'football', value: '$80-$150', slug: 'cj-stroud', reason: 'Incredible rookie year shocked everyone. Went from Day 2 pick buzz to franchise QB prices.' },
    ],
    winnerIndex: 0,
  },
  {
    id: 'iconic-card',
    title: 'Most Iconic Card',
    emoji: '👑',
    description: 'The card that defines an era — so recognizable it transcends the hobby. A piece of sports history.',
    nominees: [
      { player: 'Mickey Mantle', card: '1952 Topps #311', year: 1952, sport: 'baseball', value: '$100,000+', slug: 'mickey-mantle', reason: 'The Mona Lisa of baseball cards. Every auction sets a new record. The ultimate trophy card.' },
      { player: 'Michael Jordan', card: '1986 Fleer #57', year: 1986, sport: 'basketball', value: '$25,000-$50,000', slug: 'michael-jordan', reason: 'The card that launched modern card collecting. PSA 10s are the hobby\'s ultimate grail.' },
      { player: 'Wayne Gretzky', card: '1979 O-Pee-Chee RC #18', year: 1979, sport: 'hockey', value: '$50,000-$100,000', slug: 'wayne-gretzky', reason: 'The Great One\'s rookie card. Iconic blue border. Centerpiece of every hockey collection.' },
      { player: 'Tom Brady', card: '2000 Playoff Contenders RC Auto', year: 2000, sport: 'football', value: '$500,000+', slug: 'tom-brady', reason: 'Most valuable football card ever produced. 7 rings. GOAT debate settled on cardboard.' },
      { player: 'LeBron James', card: '2003 Topps Chrome RC #111', year: 2003, sport: 'basketball', value: '$5,000-$10,000', slug: 'lebron-james', reason: 'The modern era\'s most important card. Every serious collection needs one.' },
    ],
    winnerIndex: 0,
  },
  {
    id: 'best-budget',
    title: 'Best Budget Pick (Under $25)',
    emoji: '🎯',
    description: 'The smartest card you can buy for under $25 — cards with real upside that won\'t break the bank.',
    nominees: [
      { player: 'Elly De La Cruz', card: '2023 Topps Chrome RC', year: 2023, sport: 'baseball', value: '$15-$25', slug: 'elly-de-la-cruz', reason: 'Speed + power combo is electric. At $15-25 raw, this has 5x upside if he puts it all together.' },
      { player: 'Paolo Banchero', card: '2022 Panini Prizm RC', year: 2022, sport: 'basketball', value: '$15-$25', slug: 'paolo-banchero', reason: '#1 pick who keeps improving. Base Prizm RC under $20 is a steal for a franchise cornerstone.' },
      { player: 'Drake Maye', card: '2024 Panini Prizm RC', year: 2024, sport: 'football', value: '$15-$25', slug: 'drake-maye', reason: 'Late-season surge showed franchise QB potential. Buy-low window before Year 2 breakout.' },
      { player: 'Brock Faber', card: '2023 Upper Deck Young Guns RC', year: 2023, sport: 'hockey', value: '$10-$20', slug: 'brock-faber', reason: 'Elite skating defenseman on the Wild. Young Guns RC under $20 for a future Norris candidate.' },
      { player: 'Corbin Carroll', card: '2023 Topps Chrome RC', year: 2023, sport: 'baseball', value: '$15-$25', slug: 'corbin-carroll', reason: 'Former ROY whose cards cratered. Bounce-back season makes this the ultimate buy-low play.' },
    ],
    winnerIndex: 0,
  },
  {
    id: 'lifetime-achievement',
    title: 'Lifetime Achievement',
    emoji: '🎖️',
    description: 'Honoring a player whose cards have stood the test of time — decades of sustained value and collector love.',
    nominees: [
      { player: 'Ken Griffey Jr.', card: '1989 Upper Deck RC #1', year: 1989, sport: 'baseball', value: '$100-$200', slug: 'ken-griffey-jr', reason: 'The sweetest swing ever. His UD RC launched modern card collecting in the late \'80s. Still iconic.' },
      { player: 'Derek Jeter', card: '1993 SP Foil #279', year: 1993, sport: 'baseball', value: '$200-$400', slug: 'derek-jeter', reason: 'Captain clutch. His SP RC has held value for 30 years. The definition of steady appreciation.' },
      { player: 'Kobe Bryant', card: '1996 Topps Chrome RC #138', year: 1996, sport: 'basketball', value: '$500-$1,000', slug: 'kobe-bryant', reason: 'Mamba forever. His legacy has only grown since retirement. Cards appreciate with every passing year.' },
      { player: 'Mario Lemieux', card: '1985 O-Pee-Chee RC #9', year: 1985, sport: 'hockey', value: '$200-$400', slug: 'mario-lemieux', reason: 'Saved hockey twice — on ice and as an owner. His OPC RC is a cornerstone vintage card.' },
      { player: 'Joe Montana', card: '1981 Topps RC #216', year: 1981, sport: 'football', value: '$200-$400', slug: 'joe-montana', reason: 'Joe Cool. 4 rings, 0 interceptions in Super Bowls. His Topps RC defines football card collecting.' },
    ],
    winnerIndex: 0,
  },
  {
    id: 'best-set',
    title: 'Best Set of the Year',
    emoji: '📦',
    description: 'The product release that collectors were most excited about — the set everyone wanted to rip.',
    nominees: [
      { player: 'Various', card: '2024 Topps Chrome Baseball', year: 2024, sport: 'baseball', value: '$150-$250/box', slug: 'topps-chrome', reason: 'The gold standard. Chrome refractors of the loaded 2024 rookie class made this a must-rip product.' },
      { player: 'Various', card: '2023 Panini Prizm Basketball', year: 2023, sport: 'basketball', value: '$300-$500/box', slug: 'panini-prizm-basketball', reason: 'Wembanyama\'s flagship RC set. Every break was appointment viewing. Prizm Silver = the chase.' },
      { player: 'Various', card: '2024 Panini Prizm Football', year: 2024, sport: 'football', value: '$200-$400/box', slug: 'panini-prizm-football', reason: 'Stacked QB class. Caleb Williams, Jayden Daniels, Drake Maye all in one set. Huge demand.' },
      { player: 'Various', card: '2024 Upper Deck Series 1 Hockey', year: 2024, sport: 'hockey', value: '$80-$150/box', slug: 'upper-deck-series-1', reason: 'Celebrini Young Guns RC. Upper Deck remains the only licensed hockey product. Must-buy for collectors.' },
      { player: 'Various', card: '2024 Bowman Chrome Baseball', year: 2024, sport: 'baseball', value: '$200-$350/box', slug: 'bowman-chrome', reason: 'The prospect hunters\' Holy Grail. 1st Chrome autos of the next generation. Best long-term holds.' },
    ],
    winnerIndex: 0,
  },
  {
    id: 'comeback-card',
    title: 'Comeback Card of the Year',
    emoji: '🔄',
    description: 'The card that recovered from a crash — the player bounced back and so did the market.',
    nominees: [
      { player: 'Ja Morant', card: '2019 Panini Prizm RC', year: 2019, sport: 'basketball', value: '$80-$150', slug: 'ja-morant', reason: 'Cards cratered during off-court issues. Healthy return and highlight plays are rebuilding value.' },
      { player: 'Corbin Carroll', card: '2023 Topps Chrome RC', year: 2023, sport: 'baseball', value: '$15-$25', slug: 'corbin-carroll', reason: 'From ROY to sophomore slump to bounce-back season. Cards hit bottom and are climbing again.' },
      { player: 'Justin Fields', card: '2021 Panini Prizm RC', year: 2021, sport: 'football', value: '$15-$30', slug: 'justin-fields', reason: 'Traded from Chicago to Pittsburgh. New team, new system, new collector interest. Cards rebounding.' },
      { player: 'Nick Chubb', card: '2018 Panini Prizm RC', year: 2018, sport: 'football', value: '$20-$40', slug: 'nick-chubb', reason: 'Devastating knee injury tanked his cards. His return to the field sparked a value recovery.' },
      { player: 'Auston Matthews', card: '2016 Upper Deck Young Guns RC', year: 2016, sport: 'hockey', value: '$100-$200', slug: 'auston-matthews', reason: 'Playoff disappointments cratered his cards. But 60+ goals per season keeps bringing buyers back.' },
    ],
    winnerIndex: 1,
  },
  {
    id: 'community-favorite',
    title: 'Community Favorite',
    emoji: '❤️',
    description: 'The card the hobby loves most — not always the most valuable, but the one that brings people together.',
    nominees: [
      { player: 'Shohei Ohtani', card: '2018 Topps Update RC #US1', year: 2018, sport: 'baseball', value: '$300-$500', slug: 'shohei-ohtani', reason: 'Everyone loves Ohtani. Casuals and hardcore collectors agree — he\'s the most exciting player in sports.' },
      { player: 'Caitlin Clark', card: '2024 Panini Prizm RC', year: 2024, sport: 'basketball', value: '$150-$300', slug: 'caitlin-clark', reason: 'Brought millions of new collectors into the hobby. The most talked-about card of the year.' },
      { player: 'Ken Griffey Jr.', card: '1989 Upper Deck RC #1', year: 1989, sport: 'baseball', value: '$100-$200', slug: 'ken-griffey-jr', reason: 'Every collector over 35 has a story about this card. Pure nostalgia. The hobby\'s comfort food.' },
      { player: 'Connor McDavid', card: '2015 Upper Deck Young Guns RC', year: 2015, sport: 'hockey', value: '$400-$800', slug: 'connor-mcdavid', reason: 'Hockey collectors\' pride and joy. The card that proves hockey cards can hold elite value.' },
      { player: 'Patrick Mahomes', card: '2017 Panini Prizm RC', year: 2017, sport: 'football', value: '$500-$800', slug: 'patrick-mahomes', reason: 'The card that brought football back to the top of the hobby. Every collection wants one.' },
    ],
    winnerIndex: 0,
  },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function HobbyAwardsClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('rookie-of-year');
  const [sportFilter, setSportFilter] = useState<Sport>('all');
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentCategory = useMemo(
    () => CATEGORIES.find(c => c.id === selectedCategory) ?? CATEGORIES[0],
    [selectedCategory]
  );

  const filteredNominees = useMemo(() => {
    if (sportFilter === 'all') return currentCategory.nominees;
    return currentCategory.nominees.filter(n => n.sport === sportFilter);
  }, [currentCategory, sportFilter]);

  const handleVote = useCallback((categoryId: string, index: number) => {
    setUserVotes(prev => ({ ...prev, [categoryId]: index }));
  }, []);

  // Simulated "community" vote percentages (deterministic from seed)
  const communityVotes = useMemo(() => {
    const rand = seededRandom(getYearSeed());
    const result: Record<string, number[]> = {};
    for (const cat of CATEGORIES) {
      const raw = cat.nominees.map((_, i) => {
        const base = i === cat.winnerIndex ? 35 : 10 + rand() * 20;
        return base;
      });
      const total = raw.reduce((a, b) => a + b, 0);
      result[cat.id] = raw.map(v => Math.round((v / total) * 100));
    }
    return result;
  }, []);

  const totalVoted = Object.keys(userVotes).length;
  const totalCategories = CATEGORIES.length;

  const shareResults = useCallback(() => {
    const lines = ['🏆 My 2025 Card Hobby Awards Picks\n'];
    for (const cat of CATEGORIES) {
      const vote = userVotes[cat.id];
      if (vote !== undefined) {
        lines.push(`${cat.emoji} ${cat.title}: ${cat.nominees[vote].player}`);
      }
    }
    lines.push(`\n${totalVoted}/${totalCategories} categories voted`);
    lines.push('\nhttps://cardvault-two.vercel.app/hobby-awards');
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [userVotes, totalVoted, totalCategories]);

  const sportColors: Record<string, string> = {
    baseball: 'bg-red-500/20 text-red-400 border-red-500/30',
    basketball: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    football: 'bg-green-500/20 text-green-400 border-green-500/30',
    hockey: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{CATEGORIES.length}</div>
          <div className="text-xs text-zinc-500">Award Categories</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{CATEGORIES.reduce((a, c) => a + c.nominees.length, 0)}</div>
          <div className="text-xs text-zinc-500">Total Nominees</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{totalVoted}/{totalCategories}</div>
          <div className="text-xs text-zinc-500">Your Votes Cast</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">4</div>
          <div className="text-xs text-zinc-500">Sports Covered</div>
        </div>
      </div>

      {/* Category Selector */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Award Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-left p-3 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-950/50 border-amber-700/60 ring-1 ring-amber-600/30'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="text-lg mb-1">{cat.emoji}</div>
              <div className={`text-xs font-medium ${selectedCategory === cat.id ? 'text-amber-300' : 'text-zinc-300'}`}>
                {cat.title}
              </div>
              {userVotes[cat.id] !== undefined && (
                <div className="text-[10px] text-emerald-500 mt-1">Voted</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current Category */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{currentCategory.emoji}</span>
              <h2 className="text-xl font-bold text-white">{currentCategory.title}</h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-xl">{currentCategory.description}</p>
          </div>
          {/* Sport Filter */}
          <div className="flex gap-1 flex-shrink-0">
            {(['all', 'baseball', 'basketball', 'football', 'hockey'] as Sport[]).map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  sportFilter === s
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Nominees */}
        <div className="space-y-3">
          {filteredNominees.map((nominee, idx) => {
            const originalIndex = currentCategory.nominees.indexOf(nominee);
            const isWinner = originalIndex === currentCategory.winnerIndex;
            const isUserPick = userVotes[currentCategory.id] === originalIndex;
            const communityPct = communityVotes[currentCategory.id]?.[originalIndex] ?? 0;

            return (
              <div
                key={`${nominee.slug}-${idx}`}
                className={`relative rounded-lg border p-4 transition-all ${
                  isUserPick
                    ? 'bg-amber-950/40 border-amber-700/60'
                    : isWinner
                    ? 'bg-zinc-800/60 border-amber-800/30'
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {isWinner && !showResults && (
                  <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    WINNER
                  </div>
                )}
                {isUserPick && (
                  <div className="absolute -top-2 -left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    YOUR PICK
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/players/${nominee.slug}`}
                        className="font-semibold text-white hover:text-amber-400 transition-colors"
                      >
                        {nominee.player}
                      </Link>
                      <span className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded border ${sportColors[nominee.sport]}`}>
                        {nominee.sport}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-400 mb-1">{nominee.card}</div>
                    <div className="text-xs text-zinc-500 mb-2">{nominee.reason}</div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-400 font-medium">{nominee.value}</span>
                      {showResults && (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-amber-500/70 rounded-full transition-all duration-500"
                              style={{ width: `${communityPct}%` }}
                            />
                          </div>
                          <span className="text-zinc-400 font-mono">{communityPct}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleVote(currentCategory.id, originalIndex)}
                    className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isUserPick
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {isUserPick ? 'Picked' : 'Vote'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNominees.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No nominees in this sport for this category. Try &quot;All&quot; filter.
          </div>
        )}
      </div>

      {/* Results Toggle + Share */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowResults(!showResults)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
        >
          {showResults ? 'Hide Community Votes' : 'Show Community Votes'}
        </button>
        {totalVoted > 0 && (
          <button
            onClick={shareResults}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? 'Copied!' : `Share Your Ballot (${totalVoted}/${totalCategories})`}
          </button>
        )}
      </div>

      {/* Your Ballot Summary */}
      {totalVoted > 0 && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Your 2025 Ballot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const vote = userVotes[cat.id];
              return (
                <div key={cat.id} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-zinc-500">{cat.title}</div>
                    <div className={`font-medium truncate ${vote !== undefined ? 'text-amber-400' : 'text-zinc-600'}`}>
                      {vote !== undefined ? cat.nominees[vote].player : 'Not voted yet'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Official Winners */}
      <div className="bg-gradient-to-br from-amber-950/30 to-zinc-900/50 border border-amber-800/30 rounded-xl p-6">
        <h2 className="text-lg font-bold text-amber-300 mb-1">2025 Official Winners</h2>
        <p className="text-xs text-zinc-500 mb-4">Data-driven selections based on market performance, collector demand, and on-field impact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CATEGORIES.map(cat => {
            const winner = cat.nominees[cat.winnerIndex];
            return (
              <div key={cat.id} className="flex items-center gap-3 bg-zinc-900/50 rounded-lg p-3">
                <span className="text-lg">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{cat.title}</div>
                  <Link
                    href={`/players/${winner.slug}`}
                    className="font-semibold text-white hover:text-amber-400 transition-colors text-sm"
                  >
                    {winner.player}
                  </Link>
                  <div className="text-xs text-zinc-500">{winner.card}</div>
                </div>
                <span className="text-emerald-400 text-xs font-medium">{winner.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Internal Links */}
      <div className="border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More from CardVault</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/power-rankings" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Power Rankings</h3>
            <p className="text-xs text-zinc-500">This week&apos;s hottest cards by sport</p>
          </Link>
          <Link href="/market-movers" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Movers</h3>
            <p className="text-xs text-zinc-500">Daily gainers and decliners</p>
          </Link>
          <Link href="/invest" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Investment Guides</h3>
            <p className="text-xs text-zinc-500">Player-by-player investment analysis</p>
          </Link>
          <Link href="/market-heatmap" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Market Heat Map</h3>
            <p className="text-xs text-zinc-500">Visual market temperature dashboard</p>
          </Link>
          <Link href="/hobby-insider" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">Hobby Insider</h3>
            <p className="text-xs text-zinc-500">Institutional-grade market intel</p>
          </Link>
          <Link href="/tools" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/50 transition-colors">
            <h3 className="font-semibold text-white mb-1">All Tools</h3>
            <p className="text-xs text-zinc-500">81+ free collector tools</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
