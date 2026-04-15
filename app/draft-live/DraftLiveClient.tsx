'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Seeded RNG for deterministic daily content
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dateHash(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

interface DraftPick {
  pick: number;
  round: number;
  team: string;
  teamAbbr: string;
  teamColor: string;
  player: string;
  position: string;
  college: string;
  cardImpact: string; // e.g. "+45%" or "NEW $50+"
  cardSlug?: string;
  isRevealed: boolean;
  reaction: 'fire' | 'ice' | 'question' | 'money' | null;
}

interface DraftEvent {
  year: number;
  name: string;
  sport: 'football' | 'basketball';
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  picks: DraftPick[];
}

const NFL_2026_ROUND1: Omit<DraftPick, 'isRevealed' | 'reaction'>[] = [
  { pick: 1, round: 1, team: 'Cleveland Browns', teamAbbr: 'CLE', teamColor: '#FF3C00', player: 'Cam Ward', position: 'QB', college: 'Miami (FL)', cardImpact: 'NEW $80+', cardSlug: undefined },
  { pick: 2, round: 1, team: 'New York Giants', teamAbbr: 'NYG', teamColor: '#0B2265', player: 'Shedeur Sanders', position: 'QB', college: 'Colorado', cardImpact: '+120%', cardSlug: 'shedeur-sanders-2025-panini-prizm-draft-1' },
  { pick: 3, round: 1, team: 'Tennessee Titans', teamAbbr: 'TEN', teamColor: '#4B92DB', player: 'Travis Hunter', position: 'WR/CB', college: 'Colorado', cardImpact: '+95%', cardSlug: 'travis-hunter-2025-panini-prizm-draft-2' },
  { pick: 4, round: 1, team: 'Jacksonville Jaguars', teamAbbr: 'JAX', teamColor: '#006778', player: 'Abdul Carter', position: 'EDGE', college: 'Penn State', cardImpact: 'NEW $60+', cardSlug: undefined },
  { pick: 5, round: 1, team: 'Las Vegas Raiders', teamAbbr: 'LV', teamColor: '#A5ACAF', player: 'Tetairoa McMillan', position: 'WR', college: 'Arizona', cardImpact: 'NEW $50+', cardSlug: undefined },
  { pick: 6, round: 1, team: 'New England Patriots', teamAbbr: 'NE', teamColor: '#002244', player: 'Mason Graham', position: 'DT', college: 'Michigan', cardImpact: 'NEW $35+', cardSlug: undefined },
  { pick: 7, round: 1, team: 'New York Jets', teamAbbr: 'NYJ', teamColor: '#125740', player: 'Ashton Jeanty', position: 'RB', college: 'Boise State', cardImpact: 'NEW $70+', cardSlug: undefined },
  { pick: 8, round: 1, team: 'Carolina Panthers', teamAbbr: 'CAR', teamColor: '#0085CA', player: 'Will Johnson', position: 'S', college: 'Michigan', cardImpact: 'NEW $40+', cardSlug: undefined },
  { pick: 9, round: 1, team: 'New Orleans Saints', teamAbbr: 'NO', teamColor: '#D3BC8D', player: 'Malaki Starks', position: 'S', college: 'Georgia', cardImpact: 'NEW $35+', cardSlug: undefined },
  { pick: 10, round: 1, team: 'Chicago Bears', teamAbbr: 'CHI', teamColor: '#C83803', player: 'Will Campbell', position: 'OT', college: 'LSU', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 11, round: 1, team: 'San Francisco 49ers', teamAbbr: 'SF', teamColor: '#AA0000', player: 'Kelvin Banks Jr.', position: 'OT', college: 'Texas', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 12, round: 1, team: 'Dallas Cowboys', teamAbbr: 'DAL', teamColor: '#003594', player: 'Luther Burden III', position: 'WR', college: 'Missouri', cardImpact: 'NEW $45+', cardSlug: undefined },
  { pick: 13, round: 1, team: 'Miami Dolphins', teamAbbr: 'MIA', teamColor: '#008E97', player: 'Tyler Warren', position: 'TE', college: 'Penn State', cardImpact: 'NEW $35+', cardSlug: undefined },
  { pick: 14, round: 1, team: 'Indianapolis Colts', teamAbbr: 'IND', teamColor: '#002C5F', player: 'Mykel Williams', position: 'EDGE', college: 'Georgia', cardImpact: 'NEW $30+', cardSlug: undefined },
  { pick: 15, round: 1, team: 'Atlanta Falcons', teamAbbr: 'ATL', teamColor: '#A71930', player: 'Colston Loveland', position: 'TE', college: 'Michigan', cardImpact: 'NEW $30+', cardSlug: undefined },
  { pick: 16, round: 1, team: 'Arizona Cardinals', teamAbbr: 'ARI', teamColor: '#97233F', player: 'James Pearce Jr.', position: 'EDGE', college: 'Tennessee', cardImpact: 'NEW $35+', cardSlug: undefined },
  { pick: 17, round: 1, team: 'Cincinnati Bengals', teamAbbr: 'CIN', teamColor: '#FB4F14', player: 'Derrick Harmon', position: 'DT', college: 'Oregon', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 18, round: 1, team: 'Seattle Seahawks', teamAbbr: 'SEA', teamColor: '#002244', player: 'Jalon Walker', position: 'LB', college: 'Georgia', cardImpact: 'NEW $30+', cardSlug: undefined },
  { pick: 19, round: 1, team: 'Tampa Bay Buccaneers', teamAbbr: 'TB', teamColor: '#D50A0A', player: 'Nic Scourton', position: 'EDGE', college: 'Texas A&M', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 20, round: 1, team: 'Denver Broncos', teamAbbr: 'DEN', teamColor: '#FB4F14', player: 'Benjamin Morrison', position: 'CB', college: 'Notre Dame', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 21, round: 1, team: 'Pittsburgh Steelers', teamAbbr: 'PIT', teamColor: '#FFB612', player: 'Josh Simmons', position: 'OT', college: 'Ohio State', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 22, round: 1, team: 'Los Angeles Chargers', teamAbbr: 'LAC', teamColor: '#0080C6', player: 'Cam Skattebo', position: 'RB', college: 'Arizona State', cardImpact: 'NEW $40+', cardSlug: undefined },
  { pick: 23, round: 1, team: 'Green Bay Packers', teamAbbr: 'GB', teamColor: '#203731', player: 'Emeka Egbuka', position: 'WR', college: 'Ohio State', cardImpact: 'NEW $30+', cardSlug: undefined },
  { pick: 24, round: 1, team: 'Minnesota Vikings', teamAbbr: 'MIN', teamColor: '#4F2683', player: 'Armand Membou', position: 'OT', college: 'Missouri', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 25, round: 1, team: 'Houston Texans', teamAbbr: 'HOU', teamColor: '#03202F', player: 'Kenneth Grant', position: 'DT', college: 'Michigan', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 26, round: 1, team: 'Los Angeles Rams', teamAbbr: 'LAR', teamColor: '#003594', player: 'Grey Zabel', position: 'OL', college: 'North Dakota State', cardImpact: 'NEW $15+', cardSlug: undefined },
  { pick: 27, round: 1, team: 'Baltimore Ravens', teamAbbr: 'BAL', teamColor: '#241773', player: 'Nick Emmanwori', position: 'S', college: 'South Carolina', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 28, round: 1, team: 'Detroit Lions', teamAbbr: 'DET', teamColor: '#0076B6', player: 'Shemar Stewart', position: 'DL', college: 'Texas A&M', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 29, round: 1, team: 'Buffalo Bills', teamAbbr: 'BUF', teamColor: '#00338D', player: 'Shavon Revel Jr.', position: 'CB', college: 'East Carolina', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 30, round: 1, team: 'Philadelphia Eagles', teamAbbr: 'PHI', teamColor: '#004C54', player: 'Tyleik Williams', position: 'DT', college: 'Ohio State', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 31, round: 1, team: 'Kansas City Chiefs', teamAbbr: 'KC', teamColor: '#E31837', player: 'Deone Walker', position: 'DT', college: 'Kentucky', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 32, round: 1, team: 'Washington Commanders', teamAbbr: 'WAS', teamColor: '#5A1414', player: 'Trey Amos', position: 'CB', college: 'Ole Miss', cardImpact: 'NEW $15+', cardSlug: undefined },
];

const NBA_2026_MOCK: Omit<DraftPick, 'isRevealed' | 'reaction'>[] = [
  { pick: 1, round: 1, team: 'Toronto Raptors', teamAbbr: 'TOR', teamColor: '#CE1141', player: 'Cooper Flagg', position: 'F', college: 'Duke', cardImpact: '+180%', cardSlug: undefined },
  { pick: 2, round: 1, team: 'Washington Wizards', teamAbbr: 'WAS', teamColor: '#002B5C', player: 'Dylan Harper', position: 'G', college: 'Rutgers', cardImpact: 'NEW $60+', cardSlug: undefined },
  { pick: 3, round: 1, team: 'Brooklyn Nets', teamAbbr: 'BKN', teamColor: '#000000', player: 'Ace Bailey', position: 'F', college: 'Rutgers', cardImpact: 'NEW $50+', cardSlug: undefined },
  { pick: 4, round: 1, team: 'Charlotte Hornets', teamAbbr: 'CHA', teamColor: '#1D1160', player: 'VJ Edgecombe', position: 'G', college: 'Baylor', cardImpact: 'NEW $45+', cardSlug: undefined },
  { pick: 5, round: 1, team: 'New Orleans Pelicans', teamAbbr: 'NOP', teamColor: '#0C2340', player: 'Kon Knueppel', position: 'G', college: 'Duke', cardImpact: 'NEW $35+', cardSlug: undefined },
  { pick: 6, round: 1, team: 'Portland Trail Blazers', teamAbbr: 'POR', teamColor: '#E03A3E', player: 'Airn Noi', position: 'F', college: 'Alabama', cardImpact: 'NEW $30+', cardSlug: undefined },
  { pick: 7, round: 1, team: 'Philadelphia 76ers', teamAbbr: 'PHI', teamColor: '#006BB6', player: 'Egor Demin', position: 'G', college: 'BYU', cardImpact: 'NEW $30+', cardSlug: undefined },
  { pick: 8, round: 1, team: 'Utah Jazz', teamAbbr: 'UTA', teamColor: '#002B5C', player: 'Nolan Traore', position: 'G', college: 'International', cardImpact: 'NEW $30+', cardSlug: undefined },
  { pick: 9, round: 1, team: 'Miami Heat', teamAbbr: 'MIA', teamColor: '#98002E', player: 'Kasparas Jakucionis', position: 'G', college: 'Illinois', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 10, round: 1, team: 'Chicago Bulls', teamAbbr: 'CHI', teamColor: '#CE1141', player: 'Liam McNeeley', position: 'F', college: 'UConn', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 11, round: 1, team: 'Sacramento Kings', teamAbbr: 'SAC', teamColor: '#5A2D81', player: 'Jeremiah Fears', position: 'G', college: 'Oklahoma', cardImpact: 'NEW $25+', cardSlug: undefined },
  { pick: 12, round: 1, team: 'Oklahoma City Thunder', teamAbbr: 'OKC', teamColor: '#007AC1', player: 'Boogie Fland', position: 'G', college: 'Arkansas', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 13, round: 1, team: 'San Antonio Spurs', teamAbbr: 'SA', teamColor: '#C4CED4', player: 'Jalil Bethea', position: 'G', college: 'Miami (FL)', cardImpact: 'NEW $20+', cardSlug: undefined },
  { pick: 14, round: 1, team: 'Indiana Pacers', teamAbbr: 'IND', teamColor: '#002D62', player: 'Collin Murray-Boyles', position: 'F', college: 'South Carolina', cardImpact: 'NEW $20+', cardSlug: undefined },
];

const HOT_TAKES = [
  'STEAL OF THE DRAFT! Way too low for this talent.',
  'Perfect fit. This team just got 10 wins better.',
  'Risky pick. Can he translate college production to the NFL?',
  'Book value SPIKING right now. Get his cards before they moon.',
  'Sleeper pick. Nobody is talking about this guy\'s ceiling.',
  'Guaranteed top-10 card from this class in 3 years.',
  'This feels like a reach. Board says someone else.',
  'Dynasty leagues salivating. This pick prints money.',
  'Love the player, hate the landing spot. Cards will be volatile.',
  'This is the pick that wins them a championship in 3 years.',
  'Buy window is closing FAST on this prospect.',
  'Collector alert: first cards will be scarce. Get in now.',
  'Perfect scheme fit. Expect immediate rookie production.',
  'Long-term hold. This card will be a monster in 5 years.',
  'The combine warrior. Athletic testing off the charts.',
];

const REACTION_EMOJIS = {
  fire: { emoji: '🔥', label: 'Fire pick' },
  ice: { emoji: '🥶', label: 'Cold take' },
  question: { emoji: '❓', label: 'Questionable' },
  money: { emoji: '💰', label: 'Money pick' },
};

export default function DraftLiveClient() {
  const [activeTab, setActiveTab] = useState<'nfl' | 'nba'>('nfl');
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [reactions, setReactions] = useState<Record<number, 'fire' | 'ice' | 'question' | 'money'>>({});
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ user: string; msg: string; time: string }[]>([]);

  const now = new Date();
  const rng = seededRng(dateHash(now));

  // Simulated viewer count
  useEffect(() => {
    setViewerCount(Math.floor(rng() * 3000) + 1200);
    const interval = setInterval(() => {
      setViewerCount(v => v + Math.floor(Math.random() * 20) - 8);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate chat messages for revealed picks
  useEffect(() => {
    const chatNames = ['CardKing99', 'RookieHunter', 'GemMintMike', 'WaxRippa', 'SlabDaddy', 'PrizmQueen', 'ToppsTrader', 'ChromeChaser', 'VintageVault', 'PackPuller', 'GradeGuru', 'FlipMaster'];
    const msgs: { user: string; msg: string; time: string }[] = [];
    const picks = activeTab === 'nfl' ? NFL_2026_ROUND1 : NBA_2026_MOCK;
    for (let i = 0; i < Math.min(revealedCount, picks.length); i++) {
      const p = picks[i];
      const r = seededRng(dateHash(now) + i * 7 + (activeTab === 'nfl' ? 0 : 1000));
      const name = chatNames[Math.floor(r() * chatNames.length)];
      const templates = [
        `${p.player} to ${p.teamAbbr}?! ${r() > 0.5 ? 'LOVE IT' : 'Not sure about this'}`,
        `${p.cardImpact.startsWith('+') ? 'Cards are MOVING' : 'New cards incoming!'} for ${p.player}`,
        `${p.teamAbbr} got their guy! ${p.player} is a beast`,
        `${p.position} was the right call here. ${p.player} fills a huge need`,
      ];
      msgs.push({ user: name, msg: templates[Math.floor(r() * templates.length)], time: `Pick ${p.pick}` });
    }
    setChatMessages(msgs.slice(-8));
  }, [revealedCount, activeTab]);

  const currentPicks = activeTab === 'nfl' ? NFL_2026_ROUND1 : NBA_2026_MOCK;

  const revealNext = useCallback(() => {
    if (revealedCount < currentPicks.length && !isRevealing) {
      setIsRevealing(true);
      setTimeout(() => {
        setRevealedCount(c => c + 1);
        setIsRevealing(false);
      }, 800);
    }
  }, [revealedCount, currentPicks.length, isRevealing]);

  const revealAll = () => {
    setRevealedCount(currentPicks.length);
  };

  const resetDraft = () => {
    setRevealedCount(0);
    setReactions({});
  };

  const addReaction = (pickNum: number, type: 'fire' | 'ice' | 'question' | 'money') => {
    setReactions(r => ({ ...r, [pickNum]: r[pickNum] === type ? undefined as unknown as 'fire' : type }));
  };

  // Switch tab resets
  const switchTab = (tab: 'nfl' | 'nba') => {
    setActiveTab(tab);
    setRevealedCount(0);
    setReactions({});
  };

  const getHotTake = (pickIndex: number) => {
    const r = seededRng(dateHash(now) + pickIndex * 13 + (activeTab === 'nfl' ? 0 : 500));
    return HOT_TAKES[Math.floor(r() * HOT_TAKES.length)];
  };

  // NFL Draft countdown (April 24, 2026)
  const draftDate = new Date('2026-04-24T20:00:00-04:00');
  const msUntilDraft = draftDate.getTime() - now.getTime();
  const daysUntilDraft = Math.max(0, Math.floor(msUntilDraft / (1000 * 60 * 60 * 24)));
  const hoursUntilDraft = Math.max(0, Math.floor((msUntilDraft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  return (
    <div className="space-y-8">
      {/* Draft Countdown Banner */}
      {msUntilDraft > 0 && (
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/30 border border-green-700/30 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">2026 NFL Draft Starts In</p>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-4xl font-black text-white">{daysUntilDraft}</p>
              <p className="text-gray-400 text-xs">DAYS</p>
            </div>
            <span className="text-gray-600 text-2xl">:</span>
            <div>
              <p className="text-4xl font-black text-white">{hoursUntilDraft}</p>
              <p className="text-gray-400 text-xs">HOURS</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">April 24-26, 2026 | Green Bay, WI</p>
        </div>
      )}

      {/* Tab Switcher + Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <button onClick={() => switchTab('nfl')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'nfl' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            NFL Draft 2026
          </button>
          <button onClick={() => switchTab('nba')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'nba' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            NBA Draft 2026
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> {viewerCount.toLocaleString()} watching
          </span>
          <span className="text-gray-500">{revealedCount}/{currentPicks.length} picks</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={revealNext}
          disabled={revealedCount >= currentPicks.length || isRevealing}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
        >
          {isRevealing ? 'Revealing...' : revealedCount === 0 ? 'Start Draft' : `Reveal Pick #${revealedCount + 1}`}
        </button>
        <button onClick={revealAll} className="px-5 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-all text-sm">
          Reveal All
        </button>
        <button onClick={resetDraft} className="px-5 py-3 bg-gray-800 text-gray-300 font-semibold rounded-xl hover:bg-gray-700 transition-all text-sm">
          Reset
        </button>
      </div>

      {/* Main Layout: Draft Board + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draft Board (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {currentPicks.map((pick, idx) => {
            const revealed = idx < revealedCount;
            return (
              <div
                key={`${activeTab}-${pick.pick}`}
                className={`relative border rounded-xl overflow-hidden transition-all duration-500 ${
                  revealed
                    ? 'bg-gray-900/80 border-gray-700/50'
                    : 'bg-gray-900/30 border-gray-800/30'
                } ${idx === revealedCount - 1 && revealed ? 'ring-2 ring-emerald-500/50' : ''}`}
              >
                {revealed ? (
                  <div className="flex items-stretch">
                    {/* Pick Number */}
                    <div
                      className="flex-shrink-0 w-14 sm:w-16 flex items-center justify-center text-white font-black text-lg"
                      style={{ backgroundColor: pick.teamColor + '40' }}
                    >
                      #{pick.pick}
                    </div>

                    {/* Pick Details */}
                    <div className="flex-1 p-3 sm:p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-medium">{pick.team}</p>
                          <p className="text-white font-bold text-base sm:text-lg truncate">{pick.player}</p>
                          <p className="text-gray-400 text-xs">{pick.position} &middot; {pick.college}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                            pick.cardImpact.startsWith('+') ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'
                          }`}>
                            {pick.cardImpact}
                          </span>
                          {pick.cardSlug && (
                            <Link href={`/sports/${pick.cardSlug}`} className="block mt-1 text-emerald-400 text-xs hover:underline">
                              View Card &rarr;
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Hot Take */}
                      <p className="mt-2 text-gray-500 text-xs italic">&ldquo;{getHotTake(idx)}&rdquo;</p>

                      {/* Reactions */}
                      <div className="flex gap-1.5 mt-2">
                        {(Object.entries(REACTION_EMOJIS) as [keyof typeof REACTION_EMOJIS, typeof REACTION_EMOJIS[keyof typeof REACTION_EMOJIS]][]).map(([key, { emoji, label }]) => (
                          <button
                            key={key}
                            onClick={() => addReaction(pick.pick, key)}
                            title={label}
                            className={`px-2 py-1 rounded-lg text-sm transition-all ${
                              reactions[pick.pick] === key
                                ? 'bg-gray-700 scale-110'
                                : 'bg-gray-800/50 hover:bg-gray-700/50'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-3 sm:p-4">
                    <div className="w-14 sm:w-16 flex-shrink-0 text-center text-gray-600 font-black text-lg">
                      #{pick.pick}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm">{pick.team}</p>
                      <div className="h-4 w-32 bg-gray-800/50 rounded mt-1 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Chat */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Chat
            </h3>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-gray-600 text-xs text-center py-4">Start the draft to see live chat</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-emerald-400 font-semibold">{msg.user}</span>
                    <span className="text-gray-600 ml-1">({msg.time})</span>
                    <p className="text-gray-300 mt-0.5">{msg.msg}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card Impact Summary */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Card Impact Tracker</h3>
            {revealedCount > 0 ? (
              <div className="space-y-2">
                {currentPicks.slice(0, revealedCount)
                  .filter(p => p.cardImpact.startsWith('+'))
                  .sort((a, b) => parseInt(b.cardImpact.replace(/\D/g, '')) - parseInt(a.cardImpact.replace(/\D/g, '')))
                  .slice(0, 5)
                  .map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300 truncate mr-2">{p.player}</span>
                      <span className="text-green-400 font-bold flex-shrink-0">{p.cardImpact}</span>
                    </div>
                  ))}
                <div className="border-t border-gray-800 pt-2 mt-2">
                  <p className="text-gray-500 text-xs">
                    {currentPicks.slice(0, revealedCount).filter(p => p.cardImpact.startsWith('NEW')).length} new rookies entering the market
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-xs text-center py-4">Start draft to track card impacts</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Draft Night Essentials</h3>
            <div className="space-y-2">
              {[
                { href: '/tools/draft-predictor', label: 'Draft Night Card Predictor', icon: '🎯' },
                { href: '/tools/investment-calc', label: 'Card Investment Calculator', icon: '📊' },
                { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
                { href: '/predictions', label: 'Prediction Markets', icon: '🎲' },
                { href: '/breaking-news', label: 'Breaking News', icon: '🚨' },
                { href: '/prospects', label: 'Prospect Rankings', icon: '📋' },
              ].map(link => (
                <Link key={link.href} href={link.href} className="flex items-center gap-2.5 text-xs text-gray-400 hover:text-emerald-400 transition-colors py-1">
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Draft Strategy Tips */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3">Card Collector Draft Tips</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-emerald-400">1.</span> Buy rookie cards BEFORE the pick is announced — prices spike 30-200% on draft night</li>
              <li className="flex gap-2"><span className="text-emerald-400">2.</span> Landing spot matters more than pick number for card values</li>
              <li className="flex gap-2"><span className="text-emerald-400">3.</span> QBs and skill position players have the highest card demand</li>
              <li className="flex gap-2"><span className="text-emerald-400">4.</span> Wait 48 hours after the draft before buying — initial spikes usually correct</li>
              <li className="flex gap-2"><span className="text-emerald-400">5.</span> Bowman University and Prizm Draft Picks are the key pre-NFL sets to target</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
