'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type Movement = 'up' | 'down' | 'hold' | 'new';

interface RankedCard {
  rank: number;
  prevRank: number | null;
  movement: Movement;
  change: number;
  player: string;
  card: string;
  year: number;
  set: string;
  sport: Sport;
  value: string;
  reason: string;
  slug: string;
}

// ── Data ───────────────────────────────────────────────────────────────────
// Deterministic "weekly" rankings based on current date seed
function getWeekSeed(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  return now.getFullYear() * 100 + week;
}

const BASEBALL_CARDS: RankedCard[] = [
  { rank: 1, prevRank: 2, movement: 'up', change: 1, player: 'Shohei Ohtani', card: '2018 Topps Update RC #US1', year: 2018, set: 'Topps Update', sport: 'baseball', value: '$300-$500', reason: 'Historic season continues — MVP-caliber numbers in both pitching and hitting', slug: 'shohei-ohtani' },
  { rank: 2, prevRank: 1, movement: 'down', change: -1, player: 'Mike Trout', card: '2011 Topps Update RC #US175', year: 2011, set: 'Topps Update', sport: 'baseball', value: '$300-$500', reason: 'Still the gold standard but Ohtani hype has surpassed — buy the dip', slug: 'mike-trout' },
  { rank: 3, prevRank: 3, movement: 'hold', change: 0, player: 'Paul Skenes', card: '2024 Bowman Chrome 1st', year: 2024, set: 'Bowman Chrome', sport: 'baseball', value: '$80-$150', reason: 'Dominant pitching — ace-level stuff confirms prospect hype', slug: 'paul-skenes' },
  { rank: 4, prevRank: 6, movement: 'up', change: 2, player: 'Jackson Chourio', card: '2024 Topps Chrome RC', year: 2024, set: 'Topps Chrome', sport: 'baseball', value: '$50-$100', reason: '2025 All-Star breakout — youngest All-Star since Harper', slug: 'jackson-chourio' },
  { rank: 5, prevRank: null, movement: 'new', change: 0, player: 'Junior Caminero', card: '2024 Bowman Chrome 1st', year: 2024, set: 'Bowman Chrome', sport: 'baseball', value: '$40-$80', reason: 'Top prospect call-up imminent — buy window closing', slug: 'junior-caminero' },
  { rank: 6, prevRank: 4, movement: 'down', change: -2, player: 'Julio Rodriguez', card: '2022 Topps Chrome RC', year: 2022, set: 'Topps Chrome', sport: 'baseball', value: '$60-$120', reason: 'Slow start to season — typical early-April dip for J-Rod', slug: 'julio-rodriguez' },
  { rank: 7, prevRank: 5, movement: 'down', change: -2, player: 'Elly De La Cruz', card: '2023 Topps Chrome RC', year: 2023, set: 'Topps Chrome', sport: 'baseball', value: '$30-$60', reason: 'Speed + power combo electrifies but strikeout rate concerns some', slug: 'elly-de-la-cruz' },
  { rank: 8, prevRank: 9, movement: 'up', change: 1, player: 'Bobby Witt Jr.', card: '2022 Topps Chrome RC', year: 2022, set: 'Topps Chrome', sport: 'baseball', value: '$40-$80', reason: 'Extension locked in long-term value — franchise player discount', slug: 'bobby-witt-jr' },
  { rank: 9, prevRank: 7, movement: 'down', change: -2, player: 'Gunnar Henderson', card: '2023 Topps Chrome RC', year: 2023, set: 'Topps Chrome', sport: 'baseball', value: '$30-$60', reason: 'Still elite but hype cooled slightly from 2024 peak', slug: 'gunnar-henderson' },
  { rank: 10, prevRank: null, movement: 'new', change: 0, player: 'Corbin Carroll', card: '2023 Topps Chrome RC', year: 2023, set: 'Topps Chrome', sport: 'baseball', value: '$20-$40', reason: 'Bounce-back season after rough 2024 — buy-low opportunity', slug: 'corbin-carroll' },
];

const BASKETBALL_CARDS: RankedCard[] = [
  { rank: 1, prevRank: 1, movement: 'hold', change: 0, player: 'Victor Wembanyama', card: '2023 Panini Prizm RC', year: 2023, set: 'Panini Prizm', sport: 'basketball', value: '$200-$400', reason: 'Generational talent — every week brings new highlight reel plays', slug: 'victor-wembanyama' },
  { rank: 2, prevRank: 3, movement: 'up', change: 1, player: 'Luka Doncic', card: '2018 Panini Prizm RC #280', year: 2018, set: 'Panini Prizm', sport: 'basketball', value: '$400-$600', reason: 'Playoff run heating up — deep postseason could push values higher', slug: 'luka-doncic' },
  { rank: 3, prevRank: 2, movement: 'down', change: -1, player: 'Jayson Tatum', card: '2017 Panini Prizm RC', year: 2017, set: 'Panini Prizm', sport: 'basketball', value: '$100-$200', reason: 'Championship core locked in but championship tax already priced in', slug: 'jayson-tatum' },
  { rank: 4, prevRank: 5, movement: 'up', change: 1, player: 'Anthony Edwards', card: '2020 Panini Prizm RC', year: 2020, set: 'Panini Prizm', sport: 'basketball', value: '$100-$200', reason: 'Face of the next era — marketability and play style drive demand', slug: 'anthony-edwards' },
  { rank: 5, prevRank: 4, movement: 'down', change: -1, player: 'Caitlin Clark', card: '2024 Panini Prizm RC', year: 2024, set: 'Panini Prizm', sport: 'basketball', value: '$150-$300', reason: 'WNBA season approaching — preseason hype building for Year 2', slug: 'caitlin-clark' },
  { rank: 6, prevRank: 8, movement: 'up', change: 2, player: 'Nikola Jokic', card: '2015 Panini Prizm RC', year: 2015, set: 'Panini Prizm', sport: 'basketball', value: '$300-$500', reason: 'Another MVP-caliber season — long-term hold, undervalued vs peers', slug: 'nikola-jokic' },
  { rank: 7, prevRank: 6, movement: 'down', change: -1, player: 'LeBron James', card: '2003 Topps Chrome RC #111', year: 2003, set: 'Topps Chrome', sport: 'basketball', value: '$5,000-$10,000', reason: 'Legacy card — retirement approaching makes PSA 10s increasingly rare to find', slug: 'lebron-james' },
  { rank: 8, prevRank: null, movement: 'new', change: 0, player: 'Cooper Flagg', card: '2025 Panini Prizm Draft Picks', year: 2025, set: 'Panini Prizm', sport: 'basketball', value: '$50-$100', reason: 'Projected 2025 NBA #1 pick — pre-draft hype exploding', slug: 'cooper-flagg' },
  { rank: 9, prevRank: 7, movement: 'down', change: -2, player: 'Shai Gilgeous-Alexander', card: '2018 Panini Prizm RC', year: 2018, set: 'Panini Prizm', sport: 'basketball', value: '$100-$200', reason: 'MVP conversation regular but market cooling after last year surge', slug: 'shai-gilgeous-alexander' },
  { rank: 10, prevRank: 10, movement: 'hold', change: 0, player: 'Ja Morant', card: '2019 Panini Prizm RC', year: 2019, set: 'Panini Prizm', sport: 'basketball', value: '$80-$150', reason: 'Talent is undeniable but off-court concerns keep ceiling capped', slug: 'ja-morant' },
];

const FOOTBALL_CARDS: RankedCard[] = [
  { rank: 1, prevRank: 1, movement: 'hold', change: 0, player: 'Patrick Mahomes', card: '2017 Panini Prizm RC', year: 2017, set: 'Panini Prizm', sport: 'football', value: '$500-$800', reason: 'Dynasty locked in — cards hold strong even in offseason', slug: 'patrick-mahomes' },
  { rank: 2, prevRank: null, movement: 'new', change: 0, player: 'Cam Ward', card: '2025 Bowman University', year: 2025, set: 'Bowman University', sport: 'football', value: '$30-$60', reason: 'Consensus #1 pick in 2025 NFL Draft — Heisman finalist hype', slug: 'cam-ward' },
  { rank: 3, prevRank: 2, movement: 'down', change: -1, player: 'Caleb Williams', card: '2024 Panini Prizm RC', year: 2024, set: 'Panini Prizm', sport: 'football', value: '$60-$120', reason: 'Offseason hype for Year 2 — will sophomore season validate?', slug: 'caleb-williams' },
  { rank: 4, prevRank: 3, movement: 'down', change: -1, player: 'Josh Allen', card: '2018 Panini Prizm RC', year: 2018, set: 'Panini Prizm', sport: 'football', value: '$200-$400', reason: 'Perennial MVP contender — offseason dip is a buying opportunity', slug: 'josh-allen' },
  { rank: 5, prevRank: 4, movement: 'down', change: -1, player: 'Joe Burrow', card: '2020 Panini Prizm RC', year: 2020, set: 'Panini Prizm', sport: 'football', value: '$100-$200', reason: 'Super Bowl window open — healthy Burrow makes Bengals contenders', slug: 'joe-burrow' },
  { rank: 6, prevRank: 7, movement: 'up', change: 1, player: 'Lamar Jackson', card: '2018 Panini Prizm RC', year: 2018, set: 'Panini Prizm', sport: 'football', value: '$100-$200', reason: 'Back-to-back MVP — market finally respecting him after years undervalued', slug: 'lamar-jackson' },
  { rank: 7, prevRank: 5, movement: 'down', change: -2, player: 'Justin Herbert', card: '2020 Panini Prizm RC', year: 2020, set: 'Panini Prizm', sport: 'football', value: '$150-$250', reason: 'Elite talent but needs playoff success to push values higher', slug: 'justin-herbert' },
  { rank: 8, prevRank: 6, movement: 'down', change: -2, player: 'CJ Stroud', card: '2023 Panini Prizm RC', year: 2023, set: 'Panini Prizm', sport: 'football', value: '$80-$150', reason: 'Incredible rookie year but can he sustain? Year 2 is the test', slug: 'cj-stroud' },
  { rank: 9, prevRank: 9, movement: 'hold', change: 0, player: 'Jayden Daniels', card: '2024 Panini Prizm RC', year: 2024, set: 'Panini Prizm', sport: 'football', value: '$40-$80', reason: 'OROY winner — dual-threat QBs always command premium in hobby', slug: 'jayden-daniels' },
  { rank: 10, prevRank: null, movement: 'new', change: 0, player: 'Drake Maye', card: '2024 Panini Prizm RC', year: 2024, set: 'Panini Prizm', sport: 'football', value: '$20-$40', reason: 'Late-season surge showed franchise QB potential — buy-low window', slug: 'drake-maye' },
];

const HOCKEY_CARDS: RankedCard[] = [
  { rank: 1, prevRank: 1, movement: 'hold', change: 0, player: 'Connor McDavid', card: '2015 Upper Deck Young Guns RC', year: 2015, set: 'Upper Deck', sport: 'hockey', value: '$400-$800', reason: 'Best player in the world — playoff run determines if this goes higher', slug: 'connor-mcdavid' },
  { rank: 2, prevRank: 2, movement: 'hold', change: 0, player: 'Connor Bedard', card: '2023 Upper Deck Young Guns RC', year: 2023, set: 'Upper Deck', sport: 'hockey', value: '$150-$300', reason: 'Generational prospect living up to billing — rookie year highlights stacking up', slug: 'connor-bedard' },
  { rank: 3, prevRank: 4, movement: 'up', change: 1, player: 'Macklin Celebrini', card: '2024 Upper Deck Young Guns RC', year: 2024, set: 'Upper Deck', sport: 'hockey', value: '$80-$150', reason: '#1 overall pick making immediate impact — Calder Trophy contender', slug: 'macklin-celebrini' },
  { rank: 4, prevRank: 3, movement: 'down', change: -1, player: 'Nathan MacKinnon', card: '2013 Upper Deck Young Guns RC', year: 2013, set: 'Upper Deck', sport: 'hockey', value: '$200-$400', reason: 'Hart Trophy winner but Stanley Cup defense is key for value spike', slug: 'nathan-mackinnon' },
  { rank: 5, prevRank: 5, movement: 'hold', change: 0, player: 'Cale Makar', card: '2019 Upper Deck Young Guns RC', year: 2019, set: 'Upper Deck', sport: 'hockey', value: '$100-$200', reason: 'Best defenseman in the game — Norris Trophy lock driving demand', slug: 'cale-makar' },
  { rank: 6, prevRank: 8, movement: 'up', change: 2, player: 'Leon Draisaitl', card: '2014 Upper Deck Young Guns RC', year: 2014, set: 'Upper Deck', sport: 'hockey', value: '$100-$200', reason: 'Mega extension locked in — perennial 50-goal threat underpriced vs McDavid', slug: 'leon-draisaitl' },
  { rank: 7, prevRank: 6, movement: 'down', change: -1, player: 'Auston Matthews', card: '2016 Upper Deck Young Guns RC', year: 2016, set: 'Upper Deck', sport: 'hockey', value: '$100-$200', reason: 'Elite goal scorer but playoff struggles cap upside until deep run', slug: 'auston-matthews' },
  { rank: 8, prevRank: null, movement: 'new', change: 0, player: 'Matvei Michkov', card: '2024 Upper Deck Young Guns RC', year: 2024, set: 'Upper Deck', sport: 'hockey', value: '$40-$80', reason: 'Russian phenom finally in NHL — electric skill set creating buzz', slug: 'matvei-michkov' },
  { rank: 9, prevRank: 7, movement: 'down', change: -2, player: 'Sidney Crosby', card: '2005 Upper Deck Young Guns RC', year: 2005, set: 'Upper Deck', sport: 'hockey', value: '$500-$1,000', reason: 'Legacy card aging like fine wine — retirement timeline makes graded copies scarce', slug: 'sidney-crosby' },
  { rank: 10, prevRank: 10, movement: 'hold', change: 0, player: 'Igor Shesterkin', card: '2019 Upper Deck Young Guns RC', year: 2019, set: 'Upper Deck', sport: 'hockey', value: '$60-$120', reason: 'Best goalie in hockey — goalies rarely top card rankings but Shesterkin is different', slug: 'igor-shesterkin' },
];

const ALL_RANKINGS: Record<Sport, RankedCard[]> = {
  baseball: BASEBALL_CARDS,
  basketball: BASKETBALL_CARDS,
  football: FOOTBALL_CARDS,
  hockey: HOCKEY_CARDS,
};

const SPORT_CONFIG: Record<Sport, { label: string; color: string; bg: string; border: string }> = {
  baseball: { label: 'Baseball', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/40' },
  basketball: { label: 'Basketball', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800/40' },
  football: { label: 'Football', color: 'text-green-400', bg: 'bg-green-950/40', border: 'border-green-800/40' },
  hockey: { label: 'Hockey', color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-800/40' },
};

const MOVEMENT_DISPLAY: Record<Movement, { icon: string; color: string }> = {
  up: { icon: '\u25B2', color: 'text-emerald-400' },
  down: { icon: '\u25BC', color: 'text-red-400' },
  hold: { icon: '\u25AC', color: 'text-zinc-500' },
  new: { icon: 'NEW', color: 'text-amber-400' },
};

export default function PowerRankingsClient() {
  const [activeSport, setActiveSport] = useState<Sport | 'all'>('all');

  const weekSeed = useMemo(() => getWeekSeed(), []);
  const weekLabel = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return `Week ${week}, ${now.getFullYear()}`;
  }, []);

  const sportsToShow: Sport[] = activeSport === 'all'
    ? ['baseball', 'basketball', 'football', 'hockey']
    : [activeSport];

  // Overall #1 cards
  const overallTop = useMemo(() => {
    return Object.entries(ALL_RANKINGS).map(([sport, cards]) => ({
      sport: sport as Sport,
      card: cards[0],
    }));
  }, []);

  return (
    <div>
      {/* Week Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-zinc-500">
          {weekLabel} Power Rankings
        </div>
        <div className="text-xs text-zinc-600">
          Seed: #{weekSeed}
        </div>
      </div>

      {/* Overall #1s Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {overallTop.map(({ sport, card }) => {
          const cfg = SPORT_CONFIG[sport];
          return (
            <div key={sport} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3`}>
              <div className="text-[10px] text-zinc-500 uppercase mb-1">{cfg.label} #1</div>
              <div className={`font-bold text-sm ${cfg.color}`}>{card.player}</div>
              <div className="text-xs text-zinc-500">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Sport Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveSport('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSport === 'all' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          All Sports
        </button>
        {(Object.keys(SPORT_CONFIG) as Sport[]).map(sport => {
          const cfg = SPORT_CONFIG[sport];
          return (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSport === sport ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Rankings by Sport */}
      <div className="space-y-8">
        {sportsToShow.map(sport => {
          const cfg = SPORT_CONFIG[sport];
          const cards = ALL_RANKINGS[sport];
          return (
            <div key={sport}>
              <h2 className={`text-lg font-bold ${cfg.color} mb-3 flex items-center gap-2`}>
                {cfg.label} Power Rankings
                <span className="text-xs text-zinc-600 font-normal">Top 10</span>
              </h2>
              <div className="space-y-2">
                {cards.map(card => {
                  const mov = MOVEMENT_DISPLAY[card.movement];
                  return (
                    <div
                      key={card.rank}
                      className={`${cfg.bg} border ${cfg.border} rounded-lg p-3 sm:p-4`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Rank */}
                        <div className="flex-shrink-0 w-8 text-center">
                          <div className="text-xl font-bold text-white">{card.rank}</div>
                        </div>

                        {/* Movement */}
                        <div className="flex-shrink-0 w-10 text-center pt-1">
                          <div className={`text-xs font-bold ${mov.color}`}>
                            {mov.icon}
                          </div>
                          {card.movement !== 'new' && card.movement !== 'hold' && (
                            <div className={`text-[10px] ${mov.color}`}>
                              {card.change > 0 ? '+' : ''}{card.change}
                            </div>
                          )}
                          {card.prevRank && card.movement === 'hold' && (
                            <div className="text-[10px] text-zinc-600">#{card.prevRank}</div>
                          )}
                        </div>

                        {/* Card Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/players/${card.slug}`}
                              className="font-semibold text-white hover:underline"
                            >
                              {card.player}
                            </Link>
                            <span className="text-xs text-zinc-600">{card.year} {card.set}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{card.reason}</p>
                        </div>

                        {/* Value */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-sm font-bold text-white">{card.value}</div>
                          <div className="text-[10px] text-zinc-600">est. value</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology Note */}
      <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-2">Methodology</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Rankings are compiled using a composite score of recent price trends, eBay sold data volume,
          social media mentions, player performance metrics, and grading population changes. Cards are
          ranked within their sport. Movement arrows compare to the previous week&apos;s rankings.
          &quot;NEW&quot; indicates a card entering the top 10 for the first time in the current window.
          Rankings update every Monday at 12:00 AM ET.
        </p>
      </div>
    </div>
  );
}
