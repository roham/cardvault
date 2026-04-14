'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Types ──────────────────────────────────────────────────────
interface BreakRoom {
  id: string;
  name: string;
  host: string;
  format: 'hobby' | 'team' | 'random-team' | 'pick-your-pack';
  sport: string;
  product: string;
  viewers: number;
  status: 'live' | 'upcoming' | 'ended';
  startTime: number;
  totalPacks: number;
  packsOpened: number;
}

interface PullEvent {
  id: string;
  card: SportsCard;
  timestamp: number;
  isHit: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  type: 'chat' | 'system' | 'reaction';
}

type CommentaryType = 'play-by-play' | 'analysis' | 'hype' | 'trivia' | 'market';

interface CommentaryEvent {
  id: string;
  host: string;
  text: string;
  type: CommentaryType;
  timestamp: number;
  highlight: boolean;
}

// ── Host Personalities ────────────────────────────────────────
interface HostPersonality {
  name: string;
  avatar: string;
  color: string;
  bgColor: string;
  style: 'hype' | 'analyst' | 'historian' | 'entertainer' | 'dealer' | 'collector';
  catchphrases: string[];
}

const HOST_PERSONALITIES: Record<string, HostPersonality> = {
  CardKingMike: {
    name: 'CardKingMike', avatar: '👑', color: 'text-amber-400', bgColor: 'bg-amber-500/10',
    style: 'hype',
    catchphrases: ['LET\'S GOOO!', 'ABSOLUTE BANGER!', 'The King has spoken!', 'Crown jewel right there!'],
  },
  RipCityBreaks: {
    name: 'RipCityBreaks', avatar: '🔥', color: 'text-red-400', bgColor: 'bg-red-500/10',
    style: 'entertainer',
    catchphrases: ['RIP CITY BABY!', 'We stay RIPPING!', 'The wax is HOT today!', 'Another one for the display case!'],
  },
  JaxWax: {
    name: 'JaxWax', avatar: '🎯', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10',
    style: 'analyst',
    catchphrases: ['Smart money right there.', 'That\'s a PSA 10 candidate.', 'The numbers don\'t lie.', 'Value play for sure.'],
  },
  PullParty: {
    name: 'PullParty', avatar: '🎉', color: 'text-purple-400', bgColor: 'bg-purple-500/10',
    style: 'entertainer',
    catchphrases: ['PARTY TIME!', 'We\'re COOKING now!', 'The party never stops!', 'DJ drop the beat!'],
  },
  ChaseThePrizm: {
    name: 'ChaseThePrizm', avatar: '💎', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10',
    style: 'collector',
    catchphrases: ['Chase the rainbow!', 'That\'s a PC card.', 'Prizm magic!', 'One for the collection!'],
  },
  BigHitBreakers: {
    name: 'BigHitBreakers', avatar: '💥', color: 'text-orange-400', bgColor: 'bg-orange-500/10',
    style: 'dealer',
    catchphrases: ['BIG HIT ALERT!', 'That\'s money in the bank.', 'Straight to the case!', 'Show me the HITS!'],
  },
};

// ── Commentary Templates by Type ──────────────────────────────
const COMMENTARY_TEMPLATES: Record<CommentaryType, string[]> = {
  'play-by-play': [
    'And we pull... {player} from {set}!',
    'Next card out of the pack... {player}!',
    '{player} — {year} {set}, card #{number}.',
    'Pulling from pack {pack}... it\'s {player}!',
    'Off the top... {player}! {value} raw.',
  ],
  analysis: [
    '{player} — {value} raw, but a gem mint could be {gemValue}. {gradeTip}',
    'Market check: {player} has been {trend} lately. {value} is the current ask.',
    '{player} from {set} — {rookieNote}. Centering on these can be tricky.',
    'Comp watch: {player} at {value}. eBay last 30 days shows strong demand.',
    'PSA pop report on {player} is still low — {value} raw with upside at {gemValue}.',
  ],
  hype: [
    'OH MY! {player}! {catchphrase}',
    '{player}!!! THE CHAT IS GOING INSANE! {catchphrase}',
    'MONSTER PULL! {player} out of {set}! {catchphrase}',
    'NO WAY! {player}! That\'s a {value} card! {catchphrase}',
    'ARE YOU KIDDING ME?! {player}! {catchphrase}',
  ],
  trivia: [
    'Fun fact: {player} was {triviaFact}. Nice pull from {set}.',
    'Did you know? {player}\'s {year} {set} card is {triviaNote}.',
    '{player} — {sport} legend. {triviaFact}. Worth {value} raw.',
    'History check: {set} was a landmark release. {player} adds to the hits.',
    '{player} joining the break! {year} was a big year for {sport} cards.',
  ],
  market: [
    'Market insight: {player} at {value}. Grade it and you\'re looking at {gemValue}.',
    'Flip alert: {player} raw at {value}, gem mint at {gemValue}. That\'s a {multiplier}x multiplier.',
    'Hold or sell? {player} at {value} raw. {marketNote}',
    'The {set} checklist is deep — {player} at {value} is {marketTier} tier.',
    'Grading ROI: {player} costs ~$20 to grade, worth {gemValue} as a 10. {verdict}',
  ],
};

const TRIVIA_FACTS: Record<string, string[]> = {
  baseball: ['drafted in the first round', 'a multi-time All-Star', 'known for clutch hitting', 'a Gold Glove winner', 'part of a legendary rotation'],
  basketball: ['a lottery pick', 'known for their handles', 'an All-Star Game regular', 'a defensive anchor', 'a walking bucket'],
  football: ['a combine standout', 'a Pro Bowl regular', 'known for big-game plays', 'a team captain', 'a first-round talent'],
  hockey: ['a first-overall pick candidate', 'a Norris Trophy contender', 'known for highlight-reel goals', 'a franchise cornerstone', 'a playoff warrior'],
};

// ── Simulated data ─────────────────────────────────────────────
const HOSTS = ['CardKingMike', 'RipCityBreaks', 'JaxWax', 'PullParty', 'ChaseThePrizm', 'BigHitBreakers'];
const VIEWER_NAMES = ['collector_dave42', 'mia_cards23', 'marcus_flips', 'kai_invest', 'jess_rips', 'tony_deals', 'card_dad_mike', 'prizm_queen', 'wax_wizard', 'chrome_chaser', 'slab_king', 'hobby_hopper', 'flip_master', 'case_hit_carl', 'patch_hunter'];

const REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💎', label: 'Gem' },
  { emoji: '😱', label: 'Shock' },
  { emoji: '💰', label: 'Money' },
  { emoji: '🗑️', label: 'Trash' },
  { emoji: '🎯', label: 'Hit' },
];

function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

function generateRooms(): BreakRoom[] {
  const daySeed = Math.floor(Date.now() / (1000 * 60 * 60));
  const rng = seededRng(daySeed);
  const sports = ['baseball', 'basketball', 'football', 'hockey'];
  const products: Record<string, string[]> = {
    baseball: ['2024 Topps Series 1 Hobby', '2024 Bowman Chrome Hobby', '2023 Topps Chrome Hobby'],
    basketball: ['2023-24 Panini Prizm Hobby', '2024-25 Donruss Hobby', '2023-24 Select Hobby'],
    football: ['2024 Panini Prizm Hobby', '2024 Donruss Hobby', '2023 Mosaic Hobby'],
    hockey: ['2023-24 Upper Deck Series 1', '2024-25 Upper Deck Hobby', '2023-24 OPC Hobby'],
  };
  const formats: BreakRoom['format'][] = ['hobby', 'team', 'random-team', 'pick-your-pack'];

  return Array.from({ length: 6 }, (_, i) => {
    const sport = sports[Math.floor(rng() * sports.length)];
    const product = products[sport][Math.floor(rng() * products[sport].length)];
    const format = formats[Math.floor(rng() * formats.length)];
    const statusRoll = rng();
    const status: BreakRoom['status'] = i === 0 ? 'live' : statusRoll < 0.3 ? 'live' : statusRoll < 0.7 ? 'upcoming' : 'ended';
    return {
      id: `break-${daySeed}-${i}`,
      name: `${format === 'hobby' ? 'Full Box' : format === 'team' ? 'Team Break' : format === 'random-team' ? 'Random Teams' : 'Pick Your Pack'}: ${product}`,
      host: HOSTS[i % HOSTS.length],
      format, sport, product,
      viewers: Math.floor(rng() * 80) + 15,
      status,
      startTime: status === 'live' ? -(Math.floor(rng() * 3) + 1) : status === 'upcoming' ? Math.floor(rng() * 30) + 5 : -(Math.floor(rng() * 10) + 5),
      totalPacks: format === 'hobby' ? 24 : 12,
      packsOpened: status === 'live' ? Math.floor(rng() * 12) + 3 : status === 'ended' ? 24 : 0,
    };
  });
}

function parseValue(v: string): number {
  const match = v.replace(/[$,]/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function generateCommentary(
  card: SportsCard,
  host: string,
  isHit: boolean,
  context: { pullCount: number; hitCount: number; rookieCount: number; totalValue: number; hitStreak: number; packNum: number },
  rng: () => number,
): CommentaryEvent {
  const personality = HOST_PERSONALITIES[host] || HOST_PERSONALITIES.CardKingMike;
  const rawVal = parseValue(card.estimatedValueRaw);
  const gemVal = parseValue(card.estimatedValueGem);
  const multiplier = rawVal > 0 ? (gemVal / rawVal).toFixed(1) : '3.0';

  // Pick commentary type based on context
  let type: CommentaryType;
  if (isHit && rng() < 0.6) type = 'hype';
  else if (context.hitStreak >= 2 && rng() < 0.4) type = 'hype';
  else if (rawVal > 50 && rng() < 0.5) type = 'market';
  else if (rng() < 0.15) type = 'trivia';
  else if (rng() < 0.4) type = 'analysis';
  else type = 'play-by-play';

  // Context-aware overrides
  if (context.pullCount === 1) type = 'play-by-play';
  if (context.pullCount % 40 === 0) type = 'market'; // periodic market recap
  if (context.hitCount === 1 && isHit) type = 'hype'; // first hit always hype

  const templates = COMMENTARY_TEMPLATES[type];
  let text = templates[Math.floor(rng() * templates.length)];
  const catchphrase = personality.catchphrases[Math.floor(rng() * personality.catchphrases.length)];
  const triviaFacts = TRIVIA_FACTS[card.sport] || TRIVIA_FACTS.baseball;
  const triviaFact = triviaFacts[Math.floor(rng() * triviaFacts.length)];

  const gradeTips = ['Centering looks key here.', 'Surface quality matters.', 'Check those corners!', 'Edge-to-edge on these is tough.'];
  const trends = ['trending up', 'holding steady', 'gaining momentum', 'in high demand', 'seeing increased interest'];
  const marketNotes = ['Strong hold candidate.', 'Consider grading first.', 'Demand is up this quarter.', 'Supply is limited in high grades.'];
  const marketTiers = rawVal > 100 ? 'premium' : rawVal > 30 ? 'mid' : 'value';
  const verdicts = rawVal > 30 ? 'Worth the submission.' : 'Maybe wait for a price bump.';

  text = text
    .replace('{player}', card.player)
    .replace('{set}', card.set)
    .replace('{year}', String(card.year))
    .replace('{number}', card.cardNumber)
    .replace('{value}', card.estimatedValueRaw)
    .replace('{gemValue}', card.estimatedValueGem)
    .replace('{sport}', card.sport)
    .replace('{pack}', `#${context.packNum}`)
    .replace('{catchphrase}', catchphrase)
    .replace('{triviaFact}', triviaFact)
    .replace('{triviaNote}', card.rookie ? 'their rookie card' : `from a classic set`)
    .replace('{rookieNote}', card.rookie ? 'Rookie card alert' : `Veteran presence`)
    .replace('{gradeTip}', gradeTips[Math.floor(rng() * gradeTips.length)])
    .replace('{trend}', trends[Math.floor(rng() * trends.length)])
    .replace('{multiplier}', multiplier)
    .replace('{marketNote}', marketNotes[Math.floor(rng() * marketNotes.length)])
    .replace('{marketTier}', marketTiers)
    .replace('{verdict}', verdicts);

  // Add streak callouts
  if (context.hitStreak >= 3) {
    text += ` ${context.hitStreak}-HIT STREAK!`;
  }

  return {
    id: `c-${Date.now()}-${Math.floor(rng() * 10000)}`,
    host,
    text,
    type,
    timestamp: Date.now(),
    highlight: isHit || type === 'hype',
  };
}

const FORMAT_LABELS: Record<BreakRoom['format'], string> = {
  hobby: 'Hobby Box', team: 'Team Break', 'random-team': 'Random Teams', 'pick-your-pack': 'Pick Your Pack',
};
const SPORT_EMOJI: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

const COMMENTARY_TYPE_LABELS: Record<CommentaryType, { label: string; color: string; icon: string }> = {
  'play-by-play': { label: 'LIVE', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: '🎙️' },
  analysis: { label: 'ANALYSIS', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: '📊' },
  hype: { label: 'HYPE', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: '🔥' },
  trivia: { label: 'TRIVIA', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: '📚' },
  market: { label: 'MARKET', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: '💰' },
};

// ── AI Commentary Ticker ──────────────────────────────────────
function AICommentaryTicker({ commentary, host }: { commentary: CommentaryEvent[]; host: string }) {
  const tickerRef = useRef<HTMLDivElement>(null);
  const personality = HOST_PERSONALITIES[host] || HOST_PERSONALITIES.CardKingMike;
  const latest = commentary[commentary.length - 1];

  useEffect(() => {
    if (tickerRef.current) tickerRef.current.scrollTop = tickerRef.current.scrollHeight;
  }, [commentary]);

  if (commentary.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${personality.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>
            {personality.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-sm ${personality.color}`}>{personality.name}</span>
              <span className="text-[10px] font-bold bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700">AI HOST</span>
            </div>
            <p className="text-gray-500 text-sm">Waiting to start... Hit that Start Break button!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Latest commentary — prominent ticker */}
      {latest && (
        <div className={`p-4 border-b border-gray-800 ${latest.highlight ? 'bg-amber-950/20' : ''}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full ${personality.bgColor} flex items-center justify-center text-xl flex-shrink-0`}>
              {personality.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold text-sm ${personality.color}`}>{personality.name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${COMMENTARY_TYPE_LABELS[latest.type].color}`}>
                  {COMMENTARY_TYPE_LABELS[latest.type].icon} {COMMENTARY_TYPE_LABELS[latest.type].label}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${latest.highlight ? 'text-amber-100' : 'text-gray-300'}`}>{latest.text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Commentary history */}
      <div ref={tickerRef} className="max-h-40 overflow-y-auto">
        {commentary.slice(0, -1).reverse().slice(0, 8).map(c => {
          const typeInfo = COMMENTARY_TYPE_LABELS[c.type];
          return (
            <div key={c.id} className={`px-4 py-2 border-b border-gray-800/50 last:border-0 ${c.highlight ? 'bg-amber-950/10' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs">{typeInfo.icon}</span>
                <span className={`text-[10px] font-medium ${typeInfo.color.split(' ')[0]}`}>{typeInfo.label}</span>
                <span className="text-gray-500 text-xs flex-1 truncate">{c.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function BreakRoomClient() {
  const [rooms] = useState<BreakRoom[]>(generateRooms);
  const [activeRoom, setActiveRoom] = useState<BreakRoom | null>(null);
  const [pulls, setPulls] = useState<PullEvent[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [commentary, setCommentary] = useState<CommentaryEvent[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [packCount, setPackCount] = useState(0);
  const [isBreaking, setIsBreaking] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);
  const pullFeedRef = useRef<HTMLDivElement>(null);
  const chatFeedRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rngRef = useRef(seededRng(Date.now()));
  const breakStatsRef = useRef({ pullCount: 0, hitCount: 0, rookieCount: 0, totalValue: 0, hitStreak: 0, lastHitIndex: -1 });

  useEffect(() => { if (pullFeedRef.current) pullFeedRef.current.scrollTop = pullFeedRef.current.scrollHeight; }, [pulls]);
  useEffect(() => { if (chatFeedRef.current) chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight; }, [chat]);

  const joinRoom = useCallback((room: BreakRoom) => {
    setActiveRoom(room); setPulls([]); setPackCount(0); setIsBreaking(false); setCommentary([]);
    breakStatsRef.current = { pullCount: 0, hitCount: 0, rookieCount: 0, totalValue: 0, hitStreak: 0, lastHitIndex: -1 };
    rngRef.current = seededRng(Date.now());
    const rng = rngRef.current;
    const initMsgs = ['LFG! Let\'s see some hits!', 'Need a big pull!', 'Rip it!'];
    setChat(initMsgs.map((text, i) => ({
      id: `init-${i}`, user: VIEWER_NAMES[Math.floor(rng() * VIEWER_NAMES.length)],
      text, timestamp: Date.now() - (3 - i) * 5000, type: 'chat',
    })));
  }, []);

  const leaveRoom = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveRoom(null); setPulls([]); setChat([]); setPackCount(0); setIsBreaking(false); setCommentary([]);
  }, []);

  const startBreak = useCallback(() => {
    if (!activeRoom) return;
    setIsBreaking(true); setPackCount(0); setPulls([]); setCommentary([]);
    breakStatsRef.current = { pullCount: 0, hitCount: 0, rookieCount: 0, totalValue: 0, hitStreak: 0, lastHitIndex: -1 };
    const sportCards = sportsCards.filter(c => c.sport === activeRoom.sport);
    if (!sportCards.length) return;
    let count = 0;
    const total = activeRoom.totalPacks * 8;

    // Opening commentary
    const personality = HOST_PERSONALITIES[activeRoom.host] || HOST_PERSONALITIES.CardKingMike;
    setCommentary([{
      id: 'intro', host: activeRoom.host,
      text: `Welcome to the break! We've got ${activeRoom.totalPacks} packs of ${activeRoom.product} to rip. ${personality.catchphrases[0]} Let's see what's inside!`,
      type: 'play-by-play', timestamp: Date.now(), highlight: false,
    }]);

    intervalRef.current = setInterval(() => {
      count++;
      const rng = rngRef.current;
      const card = sportCards[Math.floor(rng() * sportCards.length)];
      const isHit = rng() < 0.15;
      const stats = breakStatsRef.current;
      stats.pullCount = count;
      stats.totalValue += parseValue(card.estimatedValueRaw);
      if (isHit) { stats.hitCount++; stats.hitStreak = (stats.lastHitIndex === count - 1) ? stats.hitStreak + 1 : 1; stats.lastHitIndex = count; }
      else if (stats.lastHitIndex !== count - 1) { stats.hitStreak = 0; }
      if (card.rookie) stats.rookieCount++;
      const packNum = Math.floor((count - 1) / 8) + 1;

      setPulls(prev => [...prev.slice(-50), { id: `p-${count}`, card, timestamp: Date.now(), isHit }]);
      if (count % 8 === 0) setPackCount(p => p + 1);

      // AI Commentary — fires on hits, every 3rd card, pack boundaries, and milestones
      if (isHit || count % 3 === 0 || count % 8 === 1 || (stats.hitCount === 5 && isHit)) {
        const commentaryEvent = generateCommentary(card, activeRoom.host, isHit, { ...stats, packNum }, rng);
        setCommentary(prev => [...prev.slice(-20), commentaryEvent]);
      }

      // Pack boundary commentary
      if (count % 8 === 0 && count < total) {
        const packHits = pulls.length > 0 ? 'Moving to the next pack!' : '';
        if (rng() < 0.4) {
          setCommentary(prev => [...prev.slice(-20), {
            id: `pack-${count}`, host: activeRoom.host,
            text: `Pack ${packNum} is done! ${stats.hitCount} hits so far from ${packNum} packs. ${packHits}`,
            type: 'play-by-play', timestamp: Date.now(), highlight: false,
          }]);
        }
      }

      // Viewer chat
      if (rng() < 0.3) {
        const msgs = [isHit ? '🔥🔥🔥' : 'Nice!', `${card.player}! Let's go!`, isHit ? 'MONSTER PULL!' : 'Keep ripping!', card.rookie ? 'RC!! 🎯' : 'Solid', 'Send to PSA!'];
        setChat(prev => [...prev.slice(-30), {
          id: `v-${count}`, user: VIEWER_NAMES[Math.floor(rng() * VIEWER_NAMES.length)],
          text: msgs[Math.floor(rng() * msgs.length)], timestamp: Date.now(), type: 'chat',
        }]);
      }

      if (count >= total) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsBreaking(false);
        const finalStats = breakStatsRef.current;
        setCommentary(prev => [...prev, {
          id: 'summary', host: activeRoom.host,
          text: `BREAK COMPLETE! ${total} cards from ${activeRoom.totalPacks} packs. ${finalStats.hitCount} big hits, ${finalStats.rookieCount} rookies pulled. Total estimated value: $${Math.round(finalStats.totalValue).toLocaleString()}. Thanks for watching!`,
          type: 'analysis', timestamp: Date.now(), highlight: true,
        }]);
        setChat(prev => [...prev, { id: 'end', user: 'System', text: `Break complete! ${total} cards from ${activeRoom.totalPacks} packs.`, timestamp: Date.now(), type: 'system' }]);
      }
    }, 800);
  }, [activeRoom, pulls.length]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const sendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    setChat(prev => [...prev.slice(-30), { id: `me-${Date.now()}`, user: 'You', text: chatInput.trim(), timestamp: Date.now(), type: 'chat' }]);
    setChatInput('');
  }, [chatInput]);

  const sendReaction = useCallback((emoji: string) => {
    const id = `r-${Date.now()}-${Math.random()}`;
    setFloatingReactions(prev => [...prev, { id, emoji, x: 20 + Math.random() * 60 }]);
    setTimeout(() => setFloatingReactions(prev => prev.filter(r => r.id !== id)), 2000);
  }, []);

  const hitCount = useMemo(() => pulls.filter(p => p.isHit).length, [pulls]);

  // ── Room List ────────────────────────────────────────────────
  if (!activeRoom) {
    const live = rooms.filter(r => r.status === 'live');
    const upcoming = rooms.filter(r => r.status === 'upcoming');
    const ended = rooms.filter(r => r.status === 'ended');

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-red-400 text-2xl font-bold">{live.length}</div>
            <div className="text-gray-500 text-xs">Live Now</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-blue-400 text-2xl font-bold">{upcoming.length}</div>
            <div className="text-gray-500 text-xs">Upcoming</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-gray-400 text-2xl font-bold">{rooms.reduce((s, r) => s + r.viewers, 0)}</div>
            <div className="text-gray-500 text-xs">Total Viewers</div>
          </div>
        </div>

        {live.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Now
            </h2>
            <div className="space-y-3">{live.map(r => <RoomCard key={r.id} room={r} onJoin={joinRoom} />)}</div>
          </div>
        )}
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-3">Upcoming Breaks</h2>
            <div className="space-y-3">{upcoming.map(r => <RoomCard key={r.id} room={r} onJoin={joinRoom} />)}</div>
          </div>
        )}
        {ended.length > 0 && (
          <div>
            <h2 className="text-gray-400 font-bold text-lg mb-3">Recently Ended</h2>
            <div className="space-y-3">{ended.map(r => <RoomCard key={r.id} room={r} onJoin={joinRoom} />)}</div>
          </div>
        )}
      </div>
    );
  }

  // ── Active Room ──────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={leaveRoom} className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {activeRoom.viewers + pulls.length} watching
          </div>
        </div>
        <h2 className="text-white font-bold text-lg">{activeRoom.name}</h2>
        <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs">
          <span>{SPORT_EMOJI[activeRoom.sport] || '🃏'} {activeRoom.sport}</span>
          <span>Host: {activeRoom.host}</span>
          <span>{FORMAT_LABELS[activeRoom.format]}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${(packCount / activeRoom.totalPacks) * 100}%` }} />
          </div>
          <span className="text-gray-400 text-xs font-medium">{packCount}/{activeRoom.totalPacks}</span>
          {!isBreaking && packCount === 0 && (
            <button onClick={startBreak} className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              Start Break
            </button>
          )}
        </div>
      </div>

      {/* AI Commentary Ticker */}
      <AICommentaryTicker commentary={commentary} host={activeRoom.host} />

      {/* Pulls + Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pull feed */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Live Pulls</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500">{pulls.length} cards</span>
              <span className="text-red-400 font-semibold">{hitCount} hits</span>
            </div>
          </div>
          <div ref={pullFeedRef} className="h-80 overflow-y-auto p-3 space-y-2">
            {pulls.length === 0 && (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                {isBreaking ? 'First card coming...' : 'Press "Start Break" to begin!'}
              </div>
            )}
            {pulls.map(pull => (
              <div key={pull.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${pull.isHit ? 'bg-amber-950/30 border border-amber-800/40' : 'bg-gray-800/40'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${pull.isHit ? 'bg-amber-500/20' : 'bg-gray-800'}`}>
                  {pull.isHit ? '🔥' : SPORT_EMOJI[pull.card.sport] || '🃏'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold truncate ${pull.isHit ? 'text-amber-300' : 'text-white'}`}>{pull.card.player}</span>
                    {pull.card.rookie && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex-shrink-0">RC</span>}
                    {pull.isHit && <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded flex-shrink-0">HIT</span>}
                  </div>
                  <p className="text-gray-500 text-xs truncate">{pull.card.year} {pull.card.set}</p>
                </div>
                <div className={`text-xs font-semibold flex-shrink-0 ${pull.isHit ? 'text-amber-400' : 'text-gray-400'}`}>{pull.card.estimatedValueRaw}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-800"><h3 className="text-white font-semibold text-sm">Chat</h3></div>
          <div ref={chatFeedRef} className="flex-1 h-60 lg:h-auto overflow-y-auto p-3 space-y-2">
            {chat.map(msg => (
              <div key={msg.id} className="text-sm">
                <span className={`font-semibold ${msg.type === 'system' ? 'text-red-400' : msg.user === 'You' ? 'text-emerald-400' : 'text-blue-400'}`}>{msg.user}</span>
                <span className="text-gray-400 ml-1">{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-800 flex gap-1.5 justify-center relative overflow-hidden">
            {REACTIONS.map(r => (
              <button key={r.emoji} onClick={() => sendReaction(r.emoji)} className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-lg" aria-label={r.label}>{r.emoji}</button>
            ))}
            {floatingReactions.map(r => (
              <span key={r.id} className="absolute text-2xl animate-bounce pointer-events-none" style={{ left: `${r.x}%`, bottom: '40px', opacity: 0.8 }}>{r.emoji}</span>
            ))}
          </div>
          <div className="p-2 border-t border-gray-800 flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendChat(); }} placeholder="Type a message..." className="flex-1 bg-gray-800 border border-gray-700 focus:border-red-500 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none transition-colors" />
            <button onClick={sendChat} disabled={!chatInput.trim()} className="bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">Send</button>
          </div>
        </div>
      </div>

      {/* Highlights */}
      {pulls.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">Break Highlights</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gray-800/60 rounded-xl p-3 text-center"><div className="text-white text-xl font-bold">{pulls.length}</div><div className="text-gray-500 text-xs">Cards Pulled</div></div>
            <div className="bg-gray-800/60 rounded-xl p-3 text-center"><div className="text-red-400 text-xl font-bold">{hitCount}</div><div className="text-gray-500 text-xs">Big Hits</div></div>
            <div className="bg-gray-800/60 rounded-xl p-3 text-center"><div className="text-amber-400 text-xl font-bold">{pulls.filter(p => p.card.rookie).length}</div><div className="text-gray-500 text-xs">Rookies</div></div>
            <div className="bg-gray-800/60 rounded-xl p-3 text-center"><div className="text-emerald-400 text-xl font-bold">{packCount}</div><div className="text-gray-500 text-xs">Packs</div></div>
          </div>
          {hitCount > 0 && (
            <div className="mt-3 space-y-1.5">
              <h4 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Top Hits</h4>
              {pulls.filter(p => p.isHit).slice(-5).reverse().map(hit => (
                <div key={hit.id} className="flex items-center justify-between bg-amber-950/20 border border-amber-900/20 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔥</span>
                    <div>
                      <span className="text-amber-300 text-sm font-semibold">{hit.card.player}</span>
                      {hit.card.rookie && <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded">RC</span>}
                      <p className="text-gray-500 text-xs">{hit.card.year} {hit.card.set}</p>
                    </div>
                  </div>
                  <span className="text-amber-400 text-sm font-semibold">{hit.card.estimatedValueRaw}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Room Card ──────────────────────────────────────────────────
function RoomCard({ room, onJoin }: { room: BreakRoom; onJoin: (room: BreakRoom) => void }) {
  const personality = HOST_PERSONALITIES[room.host];
  return (
    <div className={`bg-gray-900 border rounded-2xl p-4 transition-all ${room.status === 'live' ? 'border-red-800/50 hover:border-red-700/50' : 'border-gray-800 hover:border-gray-700'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {room.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />}
            <span className="text-white font-semibold text-sm truncate">{room.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 text-xs">
            <span>{SPORT_EMOJI[room.sport] || '🃏'} {room.sport}</span>
            <span className="flex items-center gap-1">
              {personality && <span>{personality.avatar}</span>}
              Host: {room.host}
            </span>
            <span>{FORMAT_LABELS[room.format]}</span>
            <span>{room.viewers} watching</span>
          </div>
          {room.status === 'live' && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${(room.packsOpened / room.totalPacks) * 100}%` }} />
              </div>
              <span className="text-gray-500 text-[10px]">{room.packsOpened}/{room.totalPacks}</span>
            </div>
          )}
          {room.status === 'upcoming' && <p className="text-blue-400/70 text-xs mt-1">Starts in ~{room.startTime} min</p>}
        </div>
        <button onClick={() => onJoin(room)} className={`flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
          room.status === 'live' ? 'bg-red-600 hover:bg-red-500 text-white' :
          room.status === 'upcoming' ? 'bg-blue-600 hover:bg-blue-500 text-white' :
          'bg-gray-800 hover:bg-gray-700 text-gray-400'
        }`}>
          {room.status === 'live' ? 'Join' : room.status === 'upcoming' ? 'Preview' : 'Replay'}
        </button>
      </div>
    </div>
  );
}
