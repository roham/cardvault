'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

// ── Helpers ──────────────────────────────────────────────────────

function dateHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function parseValue(v: string): number {
  const n = parseFloat(v.replace(/[$,]/g, ''));
  return isNaN(n) ? 0 : n;
}

// ── Types ────────────────────────────────────────────────────────

type RoomId = 'baseball' | 'basketball' | 'football' | 'hockey' | 'general';

interface ChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  timestamp: number;
  isYou?: boolean;
  cardSlug?: string;
  type: 'message' | 'system' | 'card-mention';
}

interface TrendingTopic {
  tag: string;
  label: string;
  count: number;
}

// ── Room Config ──────────────────────────────────────────────────

interface RoomConfig {
  id: RoomId;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  sport: string | null;
  description: string;
}

const ROOMS: RoomConfig[] = [
  { id: 'baseball', name: 'Baseball', icon: '⚾', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-800/40', sport: 'baseball', description: 'Rookie cards, vintage Topps, prospect watch' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-800/40', sport: 'basketball', description: 'Prizm pulls, NBA rookies, grading talk' },
  { id: 'football', name: 'Football', icon: '🏈', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-800/40', sport: 'football', description: 'Draft picks, NFL rookies, game-day flips' },
  { id: 'hockey', name: 'Hockey', icon: '🏒', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-800/40', sport: 'hockey', description: 'Young Guns, prospect hype, OPC vintage' },
  { id: 'general', name: 'General', icon: '💬', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-800/40', sport: null, description: 'Cross-sport chat, grading advice, card shows' },
];

// ── NPC Users ────────────────────────────────────────────────────

const NPC_USERS = [
  { name: 'CardShark42', avatar: '🦈' },
  { name: 'VintageKing', avatar: '👑' },
  { name: 'RookieHunter', avatar: '🎯' },
  { name: 'GrailChaser', avatar: '💎' },
  { name: 'WaxBreaker', avatar: '📦' },
  { name: 'ToppsCollector', avatar: '🃏' },
  { name: 'PrizmPuller', avatar: '✨' },
  { name: 'GradedGems', avatar: '💠' },
  { name: 'SetBuilder99', avatar: '📋' },
  { name: 'TheFlipKing', avatar: '💰' },
  { name: 'ChromeChaser', avatar: '🪞' },
  { name: 'HobbyLegend', avatar: '🏆' },
  { name: 'MintCondition', avatar: '🌿' },
  { name: 'PackRipper', avatar: '🔥' },
  { name: 'SilverSlugger', avatar: '⚡' },
  { name: 'WaxAddict', avatar: '🎰' },
  { name: 'BaseballBuff', avatar: '⚾' },
  { name: 'HoopsHero', avatar: '🏀' },
  { name: 'GridironGuru', avatar: '🏈' },
  { name: 'PuckDropper', avatar: '🏒' },
];

// ── Message Templates ────────────────────────────────────────────

function generateNpcMessages(room: RoomConfig, cards: SportsCard[], rng: () => number): ChatMessage[] {
  const sportCards = room.sport ? cards.filter(c => c.sport === room.sport) : cards;
  if (sportCards.length === 0) return [];

  const templates: ((card: SportsCard) => string)[] = [
    (c) => `Just picked up a ${c.name} for ${c.estimatedValueRaw}. Think it's a good buy?`,
    (c) => `Anyone sending ${c.player} cards to PSA right now? Wondering about the turnaround.`,
    (c) => `${c.player} is on fire this season. ${c.name} has to go up from here.`,
    (c) => `Got my ${c.name} back from CGC — 9.5! Estimated ${c.estimatedValueGem} gem mint.`,
    (c) => `Thinking about selling my ${c.player} collection. Market feels like it's peaking.`,
    (c) => `Found a ${c.name} at a card show this weekend for way under ${c.estimatedValueRaw}. Steal!`,
    (c) => `What's everyone's take on ${c.set} as an investment set?`,
    (c) => `${c.player} rookie cards are going to be huge. Loading up on ${c.set} while I can.`,
    (c) => `Just pulled a ${c.name} from a hobby box! Can't believe it.`,
    (c) => `Would you grade a ${c.name} or sell raw at ${c.estimatedValueRaw}?`,
    (c) => `${c.year} ${c.set} is one of the best sets ever produced. Change my mind.`,
    (c) => `How do you guys protect your high-value cards? My ${c.name} needs a better case.`,
    (c) => `${c.player} just had an incredible game. Watch the rookies spike tomorrow.`,
    (c) => `Bought two hobby boxes of ${c.set} — pulled nothing above ${c.estimatedValueRaw}. Pain.`,
    (c) => `Anyone know if the ${c.name} has a short print variation?`,
  ];

  const generalTemplates: string[] = [
    'PSA or CGC for modern cards? I keep going back and forth.',
    'Card shows > online shopping. Nothing beats seeing cards in person.',
    'Anyone else notice grading turnaround times are getting better?',
    'Hot take: raw cards are better investments than graded right now.',
    'Just started collecting again after 15 years. The hobby has changed so much!',
    'What are your top 3 cards in your PC right now?',
    'Penny sleeves + top loaders > one-touch magnetics. Fight me.',
    'The sealed wax market is insane right now. Hobby boxes are basically gold.',
    'Anyone going to the National this year? Already booked my hotel.',
    'BGS black label 10 > PSA 10. The centering standards alone...',
    'Just organized my entire collection by sport and year. Took all weekend.',
    'What grading company do you trust most for vintage cards?',
    'Starting a new PC of rookie cards only. Any sleeper picks?',
    'The online breaks scene is wild. Some of these breakers are pulling heat daily.',
    'How many of you actually track your collection value regularly?',
  ];

  const messages: ChatMessage[] = [];
  const now = Date.now();
  const count = 12 + Math.floor(rng() * 8); // 12-20 messages

  for (let i = 0; i < count; i++) {
    const user = pick(NPC_USERS, rng);
    const card = pick(sportCards, rng);
    const minutesAgo = Math.floor(rng() * 180); // within last 3 hours

    let text: string;
    let cardSlug: string | undefined;
    let type: ChatMessage['type'] = 'message';

    if (rng() > 0.3 && sportCards.length > 0) {
      text = pick(templates, rng)(card);
      cardSlug = card.slug;
      type = 'card-mention';
    } else {
      text = pick(generalTemplates, rng);
    }

    messages.push({
      id: `npc-${room.id}-${i}-${dateHash(text + i)}`,
      user: user.name,
      avatar: user.avatar,
      text,
      timestamp: now - minutesAgo * 60_000,
      cardSlug,
      type,
    });
  }

  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

function generateTrending(room: RoomConfig, cards: SportsCard[], rng: () => number): TrendingTopic[] {
  const sportCards = room.sport ? cards.filter(c => c.sport === room.sport) : cards;

  const sportTopics: Record<string, string[]> = {
    baseball: ['MLBDraft2026', 'ToppsUpdate', 'RookieWatch', 'VintageBaseball', 'PrizmBaseball', 'SpringTraining', 'WaxRips', 'BowmanChrome'],
    basketball: ['NBAPlayoffs', 'PrizmPulls', 'RookieSzn', 'WembyWatch', 'HoopsHype', 'DunkContest', 'NBADraft', 'SelectHoops'],
    football: ['NFLDraft', 'RookieQBs', 'GameDayFlips', 'PrizmFootball', 'ThrowbackCards', 'SuperBowlCards', 'GridironGreats', 'BowmanUniversity'],
    hockey: ['YoungGuns', 'BedardRookies', 'NHLPlayoffs', 'OPCHockey', 'ProspectWatch', 'StanleyCup', 'HockeyRC', 'UpperDeck'],
    general: ['GradingDebate', 'CardShowSzn', 'WaxAddict', 'PCShowcase', 'InvestmentCards', 'SealedWax', 'PSAvsCGC', 'CardCollecting'],
  };

  const tags = sportTopics[room.id] || sportTopics.general;
  const trending: TrendingTopic[] = [];

  // Pick top players for sport-specific topics
  const topPlayers = sportCards
    .sort((a, b) => parseValue(b.estimatedValueRaw) - parseValue(a.estimatedValueRaw))
    .slice(0, 5)
    .map(c => c.player);

  const uniquePlayers = [...new Set(topPlayers)].slice(0, 3);

  for (const player of uniquePlayers) {
    trending.push({
      tag: player.replace(/[^a-zA-Z]/g, ''),
      label: player,
      count: 10 + Math.floor(rng() * 40),
    });
  }

  // Add hashtag topics
  const shuffled = tags.sort(() => rng() - 0.5).slice(0, 4);
  for (const tag of shuffled) {
    trending.push({
      tag,
      label: `#${tag}`,
      count: 5 + Math.floor(rng() * 30),
    });
  }

  return trending.sort((a, b) => b.count - a.count).slice(0, 6);
}

// ── Storage Keys ─────────────────────────────────────────────────

const STORAGE_KEY = 'cardvault-league-chat';
const USERNAME_KEY = 'cardvault-chat-username';

interface StoredChat {
  messages: Record<RoomId, ChatMessage[]>;
  lastVisit: number;
}

function loadChat(): StoredChat | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveChat(data: StoredChat) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* storage full */ }
}

function loadUsername(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(USERNAME_KEY) || '';
  } catch { return ''; }
}

function saveUsername(name: string) {
  try {
    localStorage.setItem(USERNAME_KEY, name);
  } catch { /* ignore */ }
}

// ── Main Component ───────────────────────────────────────────────

export default function LeagueChatClient() {
  const [activeRoom, setActiveRoom] = useState<RoomId>('general');
  const [messages, setMessages] = useState<Record<RoomId, ChatMessage[]>>({} as Record<RoomId, ChatMessage[]>);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [mounted, setMounted] = useState(false);
  const [mobileShowRooms, setMobileShowRooms] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate NPC messages per room (deterministic per day)
  const npcMessages = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const result: Record<RoomId, ChatMessage[]> = {} as Record<RoomId, ChatMessage[]>;
    for (const room of ROOMS) {
      const seed = dateHash(`${today}-${room.id}-league-chat`);
      const rng = seededRng(seed);
      result[room.id] = generateNpcMessages(room, sportsCards as unknown as SportsCard[], rng);
    }
    return result;
  }, []);

  // Generate trending topics per room
  const trending = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const result: Record<RoomId, TrendingTopic[]> = {} as Record<RoomId, TrendingTopic[]>;
    for (const room of ROOMS) {
      const seed = dateHash(`${today}-${room.id}-trending`);
      const rng = seededRng(seed);
      result[room.id] = generateTrending(room, sportsCards as unknown as SportsCard[], rng);
    }
    return result;
  }, []);

  // Online counts per room (deterministic)
  const onlineCounts = useMemo(() => {
    const hour = new Date().getHours();
    const seed = dateHash(`online-${hour}`);
    const rng = seededRng(seed);
    const result: Record<RoomId, number> = {} as Record<RoomId, number>;
    for (const room of ROOMS) {
      result[room.id] = 15 + Math.floor(rng() * 85);
    }
    return result;
  }, []);

  // Load stored messages + username on mount
  useEffect(() => {
    const stored = loadChat();
    const name = loadUsername();
    if (name) setUsername(name);
    else setShowNameModal(true);

    const merged: Record<RoomId, ChatMessage[]> = {} as Record<RoomId, ChatMessage[]>;
    for (const room of ROOMS) {
      const npc = npcMessages[room.id] || [];
      const userMsgs = stored?.messages[room.id]?.filter(m => m.isYou) || [];
      merged[room.id] = [...npc, ...userMsgs].sort((a, b) => a.timestamp - b.timestamp);
    }
    setMessages(merged);
    setMounted(true);
  }, [npcMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  // Save user messages to localStorage
  const persistUserMessages = useCallback((msgs: Record<RoomId, ChatMessage[]>) => {
    const userOnly: Record<RoomId, ChatMessage[]> = {} as Record<RoomId, ChatMessage[]>;
    for (const room of ROOMS) {
      userOnly[room.id] = msgs[room.id]?.filter(m => m.isYou) || [];
    }
    saveChat({ messages: userOnly, lastVisit: Date.now() });
  }, []);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !username) return;

    const newMsg: ChatMessage = {
      id: `you-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      user: username,
      avatar: '🙋',
      text,
      timestamp: Date.now(),
      isYou: true,
      type: 'message',
    };

    setMessages(prev => {
      const updated = { ...prev, [activeRoom]: [...(prev[activeRoom] || []), newMsg] };
      persistUserMessages(updated);
      return updated;
    });
    setInput('');
    inputRef.current?.focus();
  }, [input, username, activeRoom, persistUserMessages]);

  const handleSetUsername = () => {
    const name = tempName.trim();
    if (name.length < 2) return;
    setUsername(name);
    saveUsername(name);
    setShowNameModal(false);
  };

  const activeRoomConfig = ROOMS.find(r => r.id === activeRoom)!;
  const roomMessages = messages[activeRoom] || [];
  const roomTrending = trending[activeRoom] || [];
  const roomOnline = onlineCounts[activeRoom] || 0;

  if (!mounted) {
    return (
      <div className="mt-8 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-48 mb-4" />
        <div className="h-96 bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">League Chat</h1>
          <p className="text-slate-400 mt-1">Per-sport collector chat rooms — discuss pulls, trades, and market moves</p>
        </div>
        <button
          onClick={() => { setTempName(username); setShowNameModal(true); }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-slate-600 transition-colors"
        >
          🙋 {username || 'Set Name'}
        </button>
      </div>

      {/* Mobile Room Selector Toggle */}
      <button
        onClick={() => setMobileShowRooms(!mobileShowRooms)}
        className="sm:hidden w-full flex items-center justify-between px-4 py-3 mb-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white"
      >
        <span className="flex items-center gap-2">
          <span>{activeRoomConfig.icon}</span>
          <span className="font-medium">{activeRoomConfig.name}</span>
          <span className="text-xs text-slate-500">{roomOnline} online</span>
        </span>
        <span className="text-slate-400">{mobileShowRooms ? '▲' : '▼'}</span>
      </button>

      {/* Mobile Room List */}
      {mobileShowRooms && (
        <div className="sm:hidden grid grid-cols-2 gap-2 mb-3">
          {ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => { setActiveRoom(room.id); setMobileShowRooms(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                activeRoom === room.id
                  ? `${room.bgColor} ${room.borderColor} ${room.color} font-medium`
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span>{room.icon}</span>
              <span>{room.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:block w-56 shrink-0 space-y-2">
          {ROOMS.map(room => {
            const online = onlineCounts[room.id] || 0;
            const isActive = activeRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                  isActive
                    ? `${room.bgColor} ${room.borderColor} shadow-lg`
                    : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{room.icon}</span>
                  <span className={`font-medium text-sm ${isActive ? room.color : 'text-white'}`}>{room.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-7">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-slate-500">{online} online</span>
                </div>
              </button>
            );
          })}

          {/* Trending Topics */}
          <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trending in {activeRoomConfig.name}</h3>
            <div className="space-y-1.5">
              {roomTrending.map(topic => (
                <div key={topic.tag} className="flex items-center justify-between">
                  <span className="text-sm text-blue-400 truncate">{topic.label}</span>
                  <span className="text-xs text-slate-500">{topic.count} msgs</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 min-w-0">
          {/* Room Header */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border ${activeRoomConfig.bgColor} ${activeRoomConfig.borderColor} border-b-0`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{activeRoomConfig.icon}</span>
              <div>
                <h2 className={`font-semibold ${activeRoomConfig.color}`}>{activeRoomConfig.name} Chat</h2>
                <p className="text-xs text-slate-500 hidden sm:block">{activeRoomConfig.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-slate-400">{roomOnline} online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[420px] sm:h-[480px] overflow-y-auto bg-slate-900/80 border-x border-slate-700/30 px-3 sm:px-4 py-3 space-y-3 scrollbar-thin">
            {roomMessages.length === 0 && (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No messages yet. Be the first to say something!
              </div>
            )}
            {roomMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.isYou ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                  {msg.avatar}
                </div>
                <div className={`max-w-[80%] ${msg.isYou ? 'text-right' : ''}`}>
                  <div className={`flex items-center gap-2 mb-0.5 ${msg.isYou ? 'justify-end' : ''}`}>
                    <span className={`text-xs font-medium ${msg.isYou ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {msg.user}
                    </span>
                    <span className="text-xs text-slate-600">{timeAgo(msg.timestamp)}</span>
                  </div>
                  <div className={`inline-block px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.isYou
                      ? 'bg-emerald-600/20 border border-emerald-700/40 text-emerald-100'
                      : msg.type === 'card-mention'
                        ? 'bg-slate-800/80 border border-amber-800/30 text-slate-200'
                        : 'bg-slate-800/80 border border-slate-700/40 text-slate-200'
                  }`}>
                    {msg.text}
                    {msg.cardSlug && (
                      <Link
                        href={`/sports/${msg.cardSlug}`}
                        className="block mt-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        View card details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 px-3 sm:px-4 py-3 bg-slate-800/50 border border-slate-700/30 rounded-b-xl border-t-0">
            {username ? (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                  placeholder={`Message #${activeRoomConfig.name.toLowerCase()}...`}
                  className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
                  maxLength={300}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                >
                  Send
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowNameModal(true)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                Set your display name to chat
              </button>
            )}
          </div>

          {/* Mobile Trending */}
          <div className="sm:hidden mt-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trending in {activeRoomConfig.name}</h3>
            <div className="flex flex-wrap gap-2">
              {roomTrending.map(topic => (
                <span key={topic.tag} className="px-2 py-1 bg-slate-700/50 rounded-full text-xs text-blue-400">
                  {topic.label} <span className="text-slate-500">{topic.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-white">{ROOMS.length}</div>
          <div className="text-xs text-slate-400">Chat Rooms</div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{Object.values(onlineCounts).reduce((a, b) => a + b, 0)}</div>
          <div className="text-xs text-slate-400">Total Online</div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-amber-400">{Object.values(messages).reduce((sum, msgs) => sum + msgs.length, 0)}</div>
          <div className="text-xs text-slate-400">Messages Today</div>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-purple-400">{Object.values(trending).reduce((sum, t) => sum + t.length, 0)}</div>
          <div className="text-xs text-slate-400">Trending Topics</div>
        </div>
      </div>

      {/* Username Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">Choose Your Display Name</h3>
            <p className="text-sm text-slate-400 mb-4">This is how other collectors will see you in chat.</p>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSetUsername(); }}
              placeholder="e.g. CardShark42"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 mb-4"
              maxLength={20}
              autoFocus
            />
            <div className="flex gap-2">
              {username && (
                <button
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSetUsername}
                disabled={tempName.trim().length < 2}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {username ? 'Update Name' : 'Join Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
