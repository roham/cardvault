'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────
interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  league: string;
  venue: string;
  homeScore: number;
  awayScore: number;
  quarter: string;
  clock: string;
  status: 'live' | 'upcoming' | 'final';
  startTime: string;
  viewers: number;
}

interface PlayEvent {
  id: string;
  text: string;
  team: 'home' | 'away';
  impact: 'high' | 'medium' | 'low' | 'none';
  player?: string;
  type: 'score' | 'play' | 'turnover' | 'penalty' | 'timeout' | 'highlight';
  timestamp: number;
}

interface CardImpact {
  card: SportsCard;
  change: number;
  reason: string;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  type: 'chat' | 'system' | 'reaction' | 'card-alert';
}

// ── Seed-based RNG ────────────────────────────────────────────
function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

// ── Data ──────────────────────────────────────────────────────
const SPORT_EMOJI: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

const TEAMS: Record<string, { home: string; away: string; venue: string }[]> = {
  basketball: [
    { home: 'Lakers', away: 'Celtics', venue: 'Crypto.com Arena, LA' },
    { home: 'Warriors', away: 'Nuggets', venue: 'Chase Center, SF' },
    { home: 'Bucks', away: '76ers', venue: 'Fiserv Forum, MIL' },
    { home: 'Mavericks', away: 'Thunder', venue: 'AAC, Dallas' },
  ],
  baseball: [
    { home: 'Yankees', away: 'Red Sox', venue: 'Yankee Stadium, NYC' },
    { home: 'Dodgers', away: 'Giants', venue: 'Dodger Stadium, LA' },
    { home: 'Braves', away: 'Mets', venue: 'Truist Park, ATL' },
    { home: 'Cubs', away: 'Cardinals', venue: 'Wrigley Field, CHI' },
  ],
  football: [
    { home: 'Chiefs', away: 'Bills', venue: 'Arrowhead, KC' },
    { home: 'Cowboys', away: 'Eagles', venue: 'AT&T Stadium, DAL' },
    { home: '49ers', away: 'Rams', venue: 'Levi\'s Stadium, SF' },
    { home: 'Ravens', away: 'Bengals', venue: 'M&T Bank, BAL' },
  ],
  hockey: [
    { home: 'Maple Leafs', away: 'Bruins', venue: 'Scotiabank Arena, TOR' },
    { home: 'Rangers', away: 'Penguins', venue: 'MSG, NYC' },
    { home: 'Oilers', away: 'Avalanche', venue: 'Rogers Place, EDM' },
    { home: 'Panthers', away: 'Lightning', venue: 'Amerant Arena, MIA' },
  ],
};

const QUARTERS: Record<string, string[]> = {
  basketball: ['1st Qtr', '2nd Qtr', 'Halftime', '3rd Qtr', '4th Qtr', 'OT', 'Final'],
  baseball: ['Top 1st', 'Bot 1st', 'Top 2nd', 'Bot 2nd', 'Top 3rd', 'Bot 3rd', 'Top 4th', 'Bot 4th', 'Top 5th', 'Bot 5th', 'Top 6th', 'Bot 6th', 'Top 7th', 'Bot 7th', 'Top 8th', 'Bot 8th', 'Top 9th', 'Bot 9th', 'Final'],
  football: ['1st Qtr', '2nd Qtr', 'Halftime', '3rd Qtr', '4th Qtr', 'OT', 'Final'],
  hockey: ['1st Period', '2nd Period', '1st Intermission', '3rd Period', 'OT', 'Final'],
};

const PLAY_TEMPLATES: Record<string, { text: string; type: PlayEvent['type']; impact: PlayEvent['impact'] }[]> = {
  basketball: [
    { text: '{player} drains a three-pointer!', type: 'score', impact: 'medium' },
    { text: '{player} with the monster dunk!', type: 'highlight', impact: 'high' },
    { text: '{player} hits the mid-range jumper.', type: 'score', impact: 'low' },
    { text: '{player} with the assist to {player2} for the layup.', type: 'play', impact: 'low' },
    { text: '{player} with a steal and fast-break slam!', type: 'highlight', impact: 'high' },
    { text: 'Turnover by {player}. Ball goes the other way.', type: 'turnover', impact: 'none' },
    { text: '{player} gets to the line. Two free throws.', type: 'play', impact: 'low' },
    { text: 'Timeout called by {team}.', type: 'timeout', impact: 'none' },
    { text: '{player} blocks the shot! What a defensive play!', type: 'highlight', impact: 'medium' },
    { text: '{player} with the step-back three! BANG!', type: 'score', impact: 'high' },
  ],
  baseball: [
    { text: '{player} launches a solo home run to left!', type: 'score', impact: 'high' },
    { text: '{player} lines a single to right.', type: 'play', impact: 'low' },
    { text: '{player} strikes out swinging.', type: 'play', impact: 'none' },
    { text: '{player} with a double down the line!', type: 'play', impact: 'medium' },
    { text: '{player} makes a diving catch in the outfield!', type: 'highlight', impact: 'high' },
    { text: 'Ground ball to short, {player} gets the out.', type: 'play', impact: 'none' },
    { text: '{player} crushes a two-run homer! Ball is GONE!', type: 'score', impact: 'high' },
    { text: '{player} walks on four pitches.', type: 'play', impact: 'none' },
    { text: '{player} steals second base!', type: 'highlight', impact: 'medium' },
    { text: '{player} strikes out the side! Dominant inning.', type: 'highlight', impact: 'medium' },
  ],
  football: [
    { text: '{player} throws a 40-yard touchdown pass!', type: 'score', impact: 'high' },
    { text: '{player} rushes for 15 yards and a first down.', type: 'play', impact: 'low' },
    { text: '{player} intercepted! Turnover on downs.', type: 'turnover', impact: 'medium' },
    { text: '{player} with the sack! Third down stop!', type: 'highlight', impact: 'medium' },
    { text: '{player} punches it in from the 1-yard line! Touchdown!', type: 'score', impact: 'high' },
    { text: 'Field goal is GOOD from 48 yards.', type: 'score', impact: 'low' },
    { text: '{player} catches a 25-yard pass down the seam.', type: 'play', impact: 'medium' },
    { text: 'Penalty — holding on the offense. 10 yards back.', type: 'penalty', impact: 'none' },
    { text: '{player} breaks free for a 60-yard run! One-on-one at the 10!', type: 'highlight', impact: 'high' },
    { text: '{player} with a one-handed catch! Incredible!', type: 'highlight', impact: 'high' },
  ],
  hockey: [
    { text: '{player} fires one from the slot — GOAL!', type: 'score', impact: 'high' },
    { text: '{player} with the save! Robbery!', type: 'highlight', impact: 'medium' },
    { text: 'Icing called against {team}.', type: 'play', impact: 'none' },
    { text: '{player} takes a penalty. Power play coming.', type: 'penalty', impact: 'low' },
    { text: '{player} wrists one past the goalie! Snipe!', type: 'score', impact: 'high' },
    { text: '{player} with the big hit along the boards.', type: 'play', impact: 'low' },
    { text: '{player} toe-drags around the defender! Beautiful!', type: 'highlight', impact: 'medium' },
    { text: 'Offside. Play is blown dead.', type: 'play', impact: 'none' },
    { text: '{player} with a one-timer from the circle — GOAL!', type: 'score', impact: 'high' },
    { text: '{player} makes a glove save. Top corner!', type: 'highlight', impact: 'high' },
  ],
};

const VIEWER_NAMES = [
  'collector_dave42', 'mia_cards23', 'marcus_flips', 'kai_invest', 'jess_rips',
  'tony_deals', 'card_dad_mike', 'prizm_queen', 'wax_wizard', 'chrome_chaser',
  'slab_king', 'hobby_hopper', 'flip_master', 'case_hit_carl', 'patch_hunter',
  'box_break_bob', 'grade_guru', 'rookie_rush', 'vintage_vic', 'topps_king',
];

const CHAT_TEMPLATES = [
  'That {player} card is going to spike after this game!',
  'Just bought 3 copies of {player} before the game. Looking good!',
  'Anyone else holding {player} cards? 🔥',
  'Huge play by {player}! My portfolio loves this.',
  '{player} is COOKING tonight. Card values going up for sure.',
  'Should I sell my {player} card now or wait?',
  'This game is insane. Great night for card collectors!',
  'Buy signal on {player} cards. Performance is elite.',
  '{player} playing like a future Hall of Famer tonight.',
  'My {player} rookie card was my best purchase this year.',
  'Glad I graded my {player} before this season. PSA 10 value climbing.',
  'Who else is watching this with their card binder open? 😂',
];

const REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '📈', label: 'Pump' },
  { emoji: '💎', label: 'Gem' },
  { emoji: '🚀', label: 'Moon' },
  { emoji: '😤', label: 'Pain' },
  { emoji: '🎯', label: 'Hit' },
];

function parseValue(v: string): number {
  const match = v.replace(/[$,]/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// ── Generate Games ─────────────────────────────────────────────
function generateGames(): Game[] {
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 3));
  const rng = seededRng(daySeed);
  const sports = ['basketball', 'baseball', 'football', 'hockey'];

  return sports.map((sport, i) => {
    const matchups = TEAMS[sport];
    const matchup = matchups[Math.floor(rng() * matchups.length)];
    const quarters = QUARTERS[sport];
    const statusRoll = rng();
    const status: Game['status'] = i === 0 ? 'live' : statusRoll < 0.4 ? 'live' : statusRoll < 0.7 ? 'upcoming' : 'final';
    const qIdx = status === 'live' ? Math.floor(rng() * (quarters.length - 2)) + 1 : status === 'final' ? quarters.length - 1 : 0;

    const homeScore = status === 'upcoming' ? 0 : Math.floor(rng() * (sport === 'baseball' ? 8 : sport === 'hockey' ? 5 : sport === 'basketball' ? 110 : 35));
    const awayScore = status === 'upcoming' ? 0 : Math.floor(rng() * (sport === 'baseball' ? 8 : sport === 'hockey' ? 5 : sport === 'basketball' ? 110 : 35));
    const minutes = Math.floor(rng() * 12);
    const seconds = Math.floor(rng() * 60);

    return {
      id: `game-${daySeed}-${sport}`,
      homeTeam: matchup.home,
      awayTeam: matchup.away,
      sport,
      league: sport === 'basketball' ? 'NBA' : sport === 'baseball' ? 'MLB' : sport === 'football' ? 'NFL' : 'NHL',
      venue: matchup.venue,
      homeScore, awayScore,
      quarter: quarters[qIdx],
      clock: status === 'live' ? `${minutes}:${seconds.toString().padStart(2, '0')}` : '',
      status,
      startTime: status === 'upcoming' ? `${Math.floor(rng() * 3) + 7}:${rng() > 0.5 ? '00' : '30'} PM ET` : '',
      viewers: Math.floor(rng() * 200) + 30,
    };
  });
}

// ── Get relevant cards for a team/sport ─────────────────────────
function getTeamCards(sport: string, rng: () => number): SportsCard[] {
  const filtered = sportsCards.filter(c => c.sport === sport);
  const shuffled = [...filtered].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(20, shuffled.length));
}

// ── Main Component ────────────────────────────────────────────
export default function WatchPartyClient() {
  const [games] = useState<Game[]>(generateGames);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [plays, setPlays] = useState<PlayEvent[]>([]);
  const [cardImpacts, setCardImpacts] = useState<CardImpact[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [reactionBurst, setReactionBurst] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const playFeedRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const activeGame = selectedGame || games.find(g => g.status === 'live') || games[0];
  const teamCards = useMemo(() => {
    const rng = seededRng(activeGame.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    return getTeamCards(activeGame.sport, rng);
  }, [activeGame.id, activeGame.sport]);

  // Simulate play-by-play
  useEffect(() => {
    if (activeGame.status !== 'live') return;
    const gameSeed = activeGame.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    let rng = seededRng(gameSeed + Date.now());

    // Generate initial plays
    const initialPlays: PlayEvent[] = [];
    for (let i = 0; i < 5; i++) {
      const templates = PLAY_TEMPLATES[activeGame.sport] || PLAY_TEMPLATES.basketball;
      const template = templates[Math.floor(rng() * templates.length)];
      const team: 'home' | 'away' = rng() > 0.5 ? 'home' : 'away';
      const card = teamCards[Math.floor(rng() * teamCards.length)];
      const card2 = teamCards[Math.floor(rng() * teamCards.length)];
      const teamName = team === 'home' ? activeGame.homeTeam : activeGame.awayTeam;
      initialPlays.push({
        id: `play-init-${i}`,
        text: template.text
          .replace('{player}', card?.player || 'Player')
          .replace('{player2}', card2?.player || 'Player')
          .replace('{team}', teamName),
        team,
        impact: template.impact,
        player: card?.player,
        type: template.type,
        timestamp: Date.now() - (5 - i) * 15000,
      });
    }
    setPlays(initialPlays);

    // System welcome message
    setChat([{
      id: 'system-welcome',
      user: 'CardVault',
      text: `Welcome to the ${activeGame.awayTeam} @ ${activeGame.homeTeam} Watch Party! Track card impacts live as the game unfolds.`,
      timestamp: Date.now(),
      type: 'system',
    }]);

    const interval = setInterval(() => {
      rng = seededRng(gameSeed + Date.now());
      const templates = PLAY_TEMPLATES[activeGame.sport] || PLAY_TEMPLATES.basketball;
      const template = templates[Math.floor(rng() * templates.length)];
      const team: 'home' | 'away' = rng() > 0.5 ? 'home' : 'away';
      const card = teamCards[Math.floor(rng() * teamCards.length)];
      const card2 = teamCards[Math.floor(rng() * teamCards.length)];
      const teamName = team === 'home' ? activeGame.homeTeam : activeGame.awayTeam;

      const newPlay: PlayEvent = {
        id: `play-${Date.now()}`,
        text: template.text
          .replace('{player}', card?.player || 'Player')
          .replace('{player2}', card2?.player || 'Player')
          .replace('{team}', teamName),
        team,
        impact: template.impact,
        player: card?.player,
        type: template.type,
        timestamp: Date.now(),
      };

      setPlays(prev => [...prev.slice(-30), newPlay]);

      // Card impact on scoring/highlight plays
      if (card && (template.impact === 'high' || template.impact === 'medium')) {
        const rawVal = parseValue(card.estimatedValueRaw);
        const changePct = template.impact === 'high' ? (rng() * 8 + 3) : (rng() * 3 + 0.5);
        const reasons = template.impact === 'high'
          ? [`Big play boosts ${card.player} card value`, `${card.player} highlight reel moment`, `Elite performance — demand rising`]
          : [`Solid play by ${card.player}`, `Steady performance adds value`, `${card.player} showing consistency`];

        setCardImpacts(prev => [...prev.slice(-15), {
          card,
          change: changePct,
          reason: reasons[Math.floor(rng() * reasons.length)],
          timestamp: Date.now(),
        }]);
      }

      // Simulated chat from other viewers
      if (rng() > 0.4 && card) {
        const viewer = VIEWER_NAMES[Math.floor(rng() * VIEWER_NAMES.length)];
        const chatTemplate = CHAT_TEMPLATES[Math.floor(rng() * CHAT_TEMPLATES.length)];
        setChat(prev => [...prev.slice(-40), {
          id: `chat-${Date.now()}-${Math.floor(rng() * 1000)}`,
          user: viewer,
          text: chatTemplate.replace(/\{player\}/g, card.player),
          timestamp: Date.now(),
          type: rng() > 0.85 ? 'card-alert' : 'chat',
        }]);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [activeGame, teamCards]);

  // Auto-scroll feeds
  useEffect(() => {
    if (playFeedRef.current) playFeedRef.current.scrollTop = playFeedRef.current.scrollHeight;
  }, [plays]);
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat]);

  const handleReaction = useCallback((emoji: string) => {
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setReactionBurst(emoji);
    setTimeout(() => setReactionBurst(null), 800);
  }, []);

  const handleChat = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChat(prev => [...prev.slice(-40), {
      id: `chat-user-${Date.now()}`,
      user: 'You',
      text: chatInput,
      timestamp: Date.now(),
      type: 'chat',
    }]);
    setChatInput('');
  }, [chatInput]);

  const topMovers = useMemo(() => {
    const grouped: Record<string, { card: SportsCard; totalChange: number; count: number }> = {};
    cardImpacts.forEach(ci => {
      const key = ci.card.slug;
      if (!grouped[key]) grouped[key] = { card: ci.card, totalChange: 0, count: 0 };
      grouped[key].totalChange += ci.change;
      grouped[key].count++;
    });
    return Object.values(grouped).sort((a, b) => b.totalChange - a.totalChange).slice(0, 6);
  }, [cardImpacts]);

  // ── Game Selector ────────────────────────────────────────────
  const GameSelector = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {games.map(game => (
        <button
          key={game.id}
          onClick={() => setSelectedGame(game)}
          className={`text-left p-4 rounded-xl border transition-all ${
            activeGame.id === game.id
              ? 'bg-indigo-950/60 border-indigo-500/50 ring-1 ring-indigo-500/30'
              : 'bg-gray-900/60 border-gray-800 hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">{game.league} {SPORT_EMOJI[game.sport]}</span>
            {game.status === 'live' && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> LIVE
              </span>
            )}
            {game.status === 'upcoming' && <span className="text-[10px] font-medium text-gray-500">{game.startTime}</span>}
            {game.status === 'final' && <span className="text-[10px] font-bold text-gray-500">FINAL</span>}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold text-sm">{game.awayTeam}</div>
              <div className="text-white font-semibold text-sm">{game.homeTeam}</div>
            </div>
            {game.status !== 'upcoming' && (
              <div className="text-right">
                <div className="text-white font-bold text-sm">{game.awayScore}</div>
                <div className="text-white font-bold text-sm">{game.homeScore}</div>
              </div>
            )}
          </div>
          {game.status === 'live' && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{game.quarter} — {game.clock}</span>
              <span className="text-[10px] text-gray-500">{game.viewers} watching</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );

  // ── Active Game View ────────────────────────────────────────
  if (activeGame.status === 'upcoming') {
    return (
      <div>
        <GameSelector />
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
          <span className="text-4xl mb-4 block">{SPORT_EMOJI[activeGame.sport]}</span>
          <h2 className="text-xl font-bold text-white mb-2">{activeGame.awayTeam} @ {activeGame.homeTeam}</h2>
          <p className="text-gray-400 mb-2">{activeGame.venue}</p>
          <p className="text-indigo-400 font-medium">Starts at {activeGame.startTime}</p>
          <p className="text-gray-500 text-sm mt-4">Watch party opens 15 minutes before game time. Card impact tracking begins at tip-off.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <GameSelector />

      {/* Scoreboard Banner */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-white font-bold text-lg">{activeGame.awayTeam}</div>
              <div className="text-3xl font-black text-white">{activeGame.awayScore}</div>
            </div>
            <div className="text-gray-600 text-sm font-medium">@</div>
            <div className="text-center">
              <div className="text-white font-bold text-lg">{activeGame.homeTeam}</div>
              <div className="text-3xl font-black text-white">{activeGame.homeScore}</div>
            </div>
          </div>
          <div className="text-right">
            {activeGame.status === 'live' ? (
              <>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-xs font-bold">LIVE</span>
                </div>
                <div className="text-white font-medium text-sm mt-1">{activeGame.quarter}</div>
                <div className="text-gray-400 text-xs">{activeGame.clock}</div>
              </>
            ) : (
              <span className="text-gray-500 font-bold text-sm">FINAL</span>
            )}
            <div className="text-gray-500 text-[10px] mt-1">{activeGame.viewers} collectors watching</div>
          </div>
        </div>
      </div>

      {/* Reaction Bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {REACTIONS.map(r => (
          <button
            key={r.emoji}
            onClick={() => handleReaction(r.emoji)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm ${
              reactionBurst === r.emoji
                ? 'bg-indigo-500/20 border-indigo-500/50 scale-110'
                : 'bg-gray-900/60 border-gray-800 hover:border-gray-600'
            }`}
          >
            <span>{r.emoji}</span>
            <span className="text-gray-400 text-xs">{reactions[r.emoji] || 0}</span>
          </button>
        ))}
        <div className="ml-auto text-gray-600 text-xs hidden sm:block">
          {Object.values(reactions).reduce((a, b) => a + b, 0)} reactions
        </div>
      </div>

      {/* Main Grid: Play-by-Play + Card Impact + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Play-by-Play Feed */}
        <div className="lg:col-span-1 bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="text-lg">🎙️</span> Play-by-Play
            </h3>
            <span className="text-[10px] text-gray-500">{plays.length} plays</span>
          </div>
          <div ref={playFeedRef} className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
            {plays.map(play => (
              <div
                key={play.id}
                className={`p-2.5 rounded-lg text-sm ${
                  play.impact === 'high'
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : play.impact === 'medium'
                    ? 'bg-blue-500/5 border border-blue-500/10'
                    : 'bg-gray-800/40 border border-gray-800/60'
                }`}
              >
                <div className="flex items-start gap-2">
                  {play.impact === 'high' && <span className="text-amber-400 text-xs mt-0.5">🔥</span>}
                  {play.impact === 'medium' && <span className="text-blue-400 text-xs mt-0.5">📊</span>}
                  <div className="flex-1">
                    <p className={`${play.impact === 'high' ? 'text-amber-200 font-semibold' : 'text-gray-300'}`}>
                      {play.text}
                    </p>
                    {play.impact !== 'none' && play.player && (
                      <p className="text-[10px] text-indigo-400 mt-1">
                        📈 Card impact: {play.player}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Impact Tracker */}
        <div className="lg:col-span-1 bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="text-lg">📈</span> Card Impact Tracker
            </h3>
          </div>

          {/* Top Movers */}
          {topMovers.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-800/50">
              <p className="text-[10px] text-gray-500 uppercase font-medium mb-2">Top Movers Tonight</p>
              <div className="space-y-1.5">
                {topMovers.map((mover, i) => (
                  <div key={mover.card.slug} className="flex items-center justify-between px-2 py-1.5 bg-gray-800/40 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-500 text-[10px] w-4">{i + 1}.</span>
                      <Link href={`/cards/${mover.card.slug}`} className="text-white text-xs font-medium truncate hover:text-indigo-400 transition-colors">
                        {mover.card.player}
                      </Link>
                    </div>
                    <span className="text-emerald-400 text-xs font-bold flex-shrink-0">
                      +{mover.totalChange.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Impacts */}
          <div className="p-3 space-y-2 max-h-[250px] overflow-y-auto">
            {cardImpacts.length === 0 ? (
              <div className="text-center py-6">
                <span className="text-2xl block mb-2">📊</span>
                <p className="text-gray-500 text-sm">Card impacts appear as the game progresses...</p>
              </div>
            ) : (
              [...cardImpacts].reverse().slice(0, 10).map((ci, i) => (
                <div key={`${ci.card.slug}-${ci.timestamp}-${i}`} className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center justify-between">
                    <Link href={`/cards/${ci.card.slug}`} className="text-white text-xs font-medium hover:text-indigo-400 transition-colors truncate">
                      {ci.card.player} — {ci.card.year} {ci.card.set}
                    </Link>
                    <span className="text-emerald-400 text-xs font-bold flex-shrink-0 ml-2">
                      +{ci.change.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-500 text-[10px] mt-0.5">{ci.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-1 bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <span className="text-lg">💬</span> Watch Party Chat
            </h3>
            <span className="text-[10px] text-gray-500">{activeGame.viewers} here</span>
          </div>
          <div ref={chatRef} className="p-3 space-y-2 max-h-[320px] overflow-y-auto flex-1">
            {chat.map(msg => (
              <div key={msg.id} className={`text-sm ${msg.type === 'system' ? 'text-center' : ''}`}>
                {msg.type === 'system' ? (
                  <p className="text-indigo-400 text-xs bg-indigo-500/10 rounded-lg px-3 py-1.5">{msg.text}</p>
                ) : msg.type === 'card-alert' ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                    <span className="text-amber-400 text-xs font-bold">{msg.user}</span>
                    <span className="text-gray-400 text-xs ml-1">📈 {msg.text}</span>
                  </div>
                ) : (
                  <p>
                    <span className={`text-xs font-bold ${msg.user === 'You' ? 'text-indigo-400' : 'text-gray-400'}`}>
                      {msg.user}
                    </span>
                    <span className="text-gray-300 text-xs ml-1.5">{msg.text}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleChat} className="p-3 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Cards in Play */}
      {teamCards.length > 0 && (
        <div className="mt-6 bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">🃏</span> Cards in Play — {activeGame.sport.charAt(0).toUpperCase() + activeGame.sport.slice(1)} Players Active Tonight
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {teamCards.slice(0, 10).map(card => {
              const impact = topMovers.find(m => m.card.slug === card.slug);
              return (
                <Link
                  key={card.slug}
                  href={`/cards/${card.slug}`}
                  className="bg-gray-800/60 hover:bg-gray-700/60 rounded-xl p-3 transition-colors group"
                >
                  <div className="text-white text-xs font-medium truncate group-hover:text-indigo-400 transition-colors">
                    {card.player}
                  </div>
                  <div className="text-gray-500 text-[10px] truncate">{card.year} {card.set}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-gray-400 text-[10px]">{card.estimatedValueRaw}</span>
                    {impact && (
                      <span className="text-emerald-400 text-[10px] font-bold">+{impact.totalChange.toFixed(1)}%</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Features */}
      <div className="mt-6 bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">More Live Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/break-room" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">📺</span>
            <div>
              <div className="text-white text-sm font-medium">Break Room</div>
              <div className="text-gray-500 text-xs">Watch live card breaks</div>
            </div>
          </Link>
          <Link href="/auction-live" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🔨</span>
            <div>
              <div className="text-white text-sm font-medium">Live Auction</div>
              <div className="text-gray-500 text-xs">Bid on cards in real time</div>
            </div>
          </Link>
          <Link href="/card-show-feed" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 hover:bg-gray-700/60 rounded-xl transition-colors">
            <span className="text-xl">🏪</span>
            <div>
              <div className="text-white text-sm font-medium">Card Show Feed</div>
              <div className="text-gray-500 text-xs">Live deals and finds</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
