'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
interface ChatMessage {
  id: number;
  user: Persona;
  text: string;
  timestamp: Date;
  type: 'message' | 'pull' | 'sale' | 'alert' | 'question';
}

interface Persona {
  name: string;
  badge: string;
  color: string;
  style: string; // collector archetype
}

// --- Helpers ---
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateHash(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(v: string): number {
  const m = v.match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 5;
}

// --- Personas ---
const personas: Persona[] = [
  { name: 'FlipKing23', badge: '👑', color: 'text-amber-400', style: 'flipper' },
  { name: 'RookieHunter', badge: '🎯', color: 'text-red-400', style: 'rookie' },
  { name: 'VintageVibes', badge: '🕰️', color: 'text-orange-400', style: 'vintage' },
  { name: 'GradeChaser', badge: '💎', color: 'text-cyan-400', style: 'grading' },
  { name: 'PackAddict99', badge: '📦', color: 'text-pink-400', style: 'opener' },
  { name: 'SetBuilder_Mike', badge: '📋', color: 'text-green-400', style: 'completionist' },
  { name: 'WaxWarrior', badge: '🔥', color: 'text-red-300', style: 'sealed' },
  { name: 'BudgetCollector', badge: '💰', color: 'text-emerald-400', style: 'budget' },
  { name: 'CardShowCarl', badge: '🎪', color: 'text-purple-400', style: 'shows' },
  { name: 'DealFinder_Jess', badge: '🔍', color: 'text-blue-400', style: 'deals' },
  { name: 'SlabDaddy', badge: '🧊', color: 'text-sky-400', style: 'graded' },
  { name: 'InvestorKai', badge: '📈', color: 'text-indigo-400', style: 'investor' },
  { name: 'BreakRoom_Tony', badge: '🎬', color: 'text-rose-400', style: 'breaks' },
  { name: 'RetroRicks', badge: '🕹️', color: 'text-yellow-400', style: 'retro' },
  { name: 'ProspectWatch', badge: '🔭', color: 'text-teal-400', style: 'prospects' },
  { name: 'PConly_Dan', badge: '❤️', color: 'text-red-500', style: 'pc' },
  { name: 'MintCondition', badge: '✨', color: 'text-white', style: 'quality' },
  { name: 'CardMom_Lisa', badge: '🌟', color: 'text-pink-300', style: 'family' },
  { name: 'NightFlip', badge: '🌙', color: 'text-violet-400', style: 'late-night' },
  { name: 'eBay_Sniper', badge: '🎯', color: 'text-lime-400', style: 'auction' },
];

function generateMessages(rng: () => number, count: number): Omit<ChatMessage, 'id' | 'timestamp'>[] {
  const messages: Omit<ChatMessage, 'id' | 'timestamp'>[] = [];
  const cards = sportsCards;
  const sportNames = ['baseball', 'basketball', 'football', 'hockey'];

  for (let i = 0; i < count; i++) {
    const persona = personas[Math.floor(rng() * personas.length)];
    const card = cards[Math.floor(rng() * cards.length)];
    const value = parseValue(card.estimatedValueRaw);
    const sport = card.sport;
    const roll = rng();

    if (roll < 0.25) {
      // Pull announcement
      const pullTexts = [
        `Just pulled a ${card.player} ${card.year} ${card.set}! ${value > 100 ? '🔥🔥🔥' : value > 30 ? '🔥' : 'Not bad!'}`,
        `Look what came out of the pack — ${card.player}! ${card.rookie ? 'RC! 🎯' : ''}`,
        `Ripped a box and hit ${card.player} ${card.set}. ${value > 200 ? 'HUGE HIT!' : 'Happy with this one.'}`,
        `${card.player} pull from ${card.set}! Grade or sell raw? 🤔`,
      ];
      messages.push({ user: persona, text: pullTexts[Math.floor(rng() * pullTexts.length)], type: 'pull' });
    } else if (roll < 0.45) {
      // Market discussion
      const marketTexts = [
        `${card.player} cards are ${rng() > 0.5 ? 'up' : 'down'} today. ${rng() > 0.5 ? 'Buy the dip?' : 'Taking profits here.'}`,
        `Anyone else loading up on ${sport} cards right now? Prices feel low.`,
        `PSA 10 ${card.player} just sold for ${value > 50 ? '$' + Math.round(value * (1 + rng() * 0.5)) : '$' + Math.round(value * 3)} on eBay. ${rng() > 0.5 ? 'Fair price?' : 'Overpay imo.'}`,
        `The ${sport} market is ${rng() > 0.5 ? 'heating up' : 'cooling off'}. Adjust your positions accordingly.`,
        `${card.player} is ${rng() > 0.5 ? 'undervalued' : 'overvalued'} at $${value}. Change my mind.`,
      ];
      messages.push({ user: persona, text: marketTexts[Math.floor(rng() * marketTexts.length)], type: 'message' });
    } else if (roll < 0.6) {
      // Sale announcement
      const saleTexts = [
        `Just sold my ${card.player} ${card.set} for $${Math.round(value * (0.8 + rng() * 0.4))}. ${rng() > 0.5 ? 'Profit!' : 'Took a small L but needed the capital.'}`,
        `Listed 3 ${card.player} cards on eBay. Starting at $${Math.round(value * 0.7)}. Who wants one?`,
        `Picked up a ${card.player} at a card show for $${Math.round(value * 0.6)}. Steal or overpay?`,
      ];
      messages.push({ user: persona, text: saleTexts[Math.floor(rng() * saleTexts.length)], type: 'sale' });
    } else if (roll < 0.75) {
      // Question
      const questionTexts = [
        `Is ${card.player} a good long-term hold? Got offered one for $${Math.round(value * 0.9)}.`,
        `PSA or BGS for ${card.year} ${card.set}? First time submitting.`,
        `What's the best ${sport} box to open right now? Budget is $200.`,
        `How do you guys store your raw ${sport} cards? Looking for better organization.`,
        `Anyone gone to a card show recently? Worth it or just overpriced?`,
        `Graded ${card.player} came back PSA ${Math.floor(rng() * 3) + 8}. Hold or sell now?`,
      ];
      messages.push({ user: persona, text: questionTexts[Math.floor(rng() * questionTexts.length)], type: 'question' });
    } else if (roll < 0.85) {
      // Alert
      const alertTexts = [
        `ALERT: ${card.player} just ${rng() > 0.5 ? 'hit a home run' : 'scored a game-winner'}! Cards about to spike!`,
        `Breaking: ${sport.charAt(0).toUpperCase() + sport.slice(1)} trade incoming. Watch the card prices!`,
        `PSA just announced faster turnaround times for ${rng() > 0.5 ? 'economy' : 'regular'} service!`,
        `New ${card.set.split(' ')[0]} product releasing next week. Pre-orders are live!`,
      ];
      messages.push({ user: persona, text: alertTexts[Math.floor(rng() * alertTexts.length)], type: 'alert' });
    } else {
      // General chat
      const chatTexts = [
        `Good ${new Date().getHours() < 12 ? 'morning' : 'evening'} everyone! What are we collecting today?`,
        `This hobby keeps me sane. Nothing like opening a fresh pack after a long day.`,
        `My ${sport} collection is getting out of control... need more binder pages 😅`,
        `Hot take: ${card.year < 2000 ? 'vintage' : 'modern'} cards are better long-term investments than ${card.year >= 2000 ? 'vintage' : 'modern'}.`,
        `Just reorganized my whole collection by sport. Took 6 hours. Worth it.`,
        `Weekend card show in my area this Saturday. Loading up the trade binder!`,
        `PC update: finally got the ${card.player} I've been chasing for months! 🎉`,
        `Does anyone else refresh eBay listings at 3am? Just me? 😂`,
      ];
      messages.push({ user: persona, text: chatTexts[Math.floor(rng() * chatTexts.length)], type: 'message' });
    }
  }

  return messages;
}

const typeColors: Record<string, { bg: string; border: string; label: string }> = {
  pull: { bg: 'bg-green-950/30', border: 'border-l-green-500', label: 'PULL' },
  sale: { bg: 'bg-blue-950/30', border: 'border-l-blue-500', label: 'SALE' },
  alert: { bg: 'bg-red-950/30', border: 'border-l-red-500', label: 'ALERT' },
  question: { bg: 'bg-purple-950/30', border: 'border-l-purple-500', label: '?' },
  message: { bg: '', border: 'border-l-zinc-700', label: '' },
};

type FilterType = 'all' | 'pull' | 'sale' | 'alert' | 'question';

export default function MarketChatClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLive, setIsLive] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  const seed = dateHash();

  // Initialize with messages
  useEffect(() => {
    const rng = seededRng(seed);
    const initial = generateMessages(rng, 20).map((msg, i) => ({
      ...msg,
      id: i,
      timestamp: new Date(Date.now() - (20 - i) * 15000),
    }));
    messageIdRef.current = initial.length;
    setMessages(initial);
  }, [seed]);

  // Add new messages periodically
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      const rng = seededRng(seed + Date.now());
      const newMsgs = generateMessages(rng, 1).map(msg => ({
        ...msg,
        id: messageIdRef.current++,
        timestamp: new Date(),
      }));
      setMessages(prev => [...prev, ...newMsgs].slice(-100)); // Keep last 100
      setNewCount(prev => prev + 1);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(timer);
  }, [isLive, seed]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current && isLive) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLive]);

  const filteredMessages = useMemo(() =>
    filter === 'all' ? messages : messages.filter(m => m.type === filter),
    [messages, filter]
  );

  const onlineCount = useMemo(() => {
    const unique = new Set(messages.slice(-30).map(m => m.user.name));
    return Math.max(unique.size, 8);
  }, [messages]);

  const filters: { type: FilterType; label: string; icon: string }[] = [
    { type: 'all', label: 'All', icon: '💬' },
    { type: 'pull', label: 'Pulls', icon: '📦' },
    { type: 'sale', label: 'Sales', icon: '💵' },
    { type: 'alert', label: 'Alerts', icon: '🚨' },
    { type: 'question', label: 'Q&A', icon: '❓' },
  ];

  const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {isLive && (
            <span className="flex items-center gap-1.5 bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {onlineCount} collectors online
          </span>
          {newCount > 0 && !isLive && (
            <span className="text-xs bg-indigo-950/60 text-indigo-400 px-2 py-0.5 rounded-full">
              +{newCount} new
            </span>
          )}
        </div>
        <button
          onClick={() => { setIsLive(prev => !prev); setNewCount(0); }}
          className={`text-xs px-3 py-1 rounded-lg ${isLive ? 'bg-red-950/40 text-red-400 border border-red-800/40' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map(f => (
          <button
            key={f.type}
            onClick={() => setFilter(f.type)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filter === f.type
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Chat feed */}
      <div
        ref={chatRef}
        className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-y-auto h-[500px] sm:h-[600px]"
      >
        <div className="p-3 space-y-1">
          {filteredMessages.map(msg => {
            const tc = typeColors[msg.type];
            return (
              <div
                key={msg.id}
                className={`${tc.bg} border-l-2 ${tc.border} pl-3 pr-2 py-1.5 rounded-r-lg hover:bg-zinc-800/30 transition-colors`}
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 flex items-center gap-1 min-w-0">
                    <span className="text-sm">{msg.user.badge}</span>
                    <span className={`text-xs font-bold ${msg.user.color} truncate`}>{msg.user.name}</span>
                    {tc.label && (
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                        msg.type === 'alert' ? 'bg-red-900/60 text-red-400' :
                        msg.type === 'pull' ? 'bg-green-900/60 text-green-400' :
                        msg.type === 'sale' ? 'bg-blue-900/60 text-blue-400' :
                        'bg-purple-900/60 text-purple-400'
                      }`}>
                        {tc.label}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600 shrink-0 mt-0.5">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-zinc-300 text-sm mt-0.5 leading-relaxed">{msg.text}</p>
              </div>
            );
          })}
          {filteredMessages.length === 0 && (
            <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
              No messages in this category yet...
            </div>
          )}
        </div>
      </div>

      {/* Chat stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-white">{messages.length}</div>
          <div className="text-[10px] text-zinc-500">Messages</div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-400">{messages.filter(m => m.type === 'pull').length}</div>
          <div className="text-[10px] text-zinc-500">Pulls Shared</div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-red-400">{messages.filter(m => m.type === 'alert').length}</div>
          <div className="text-[10px] text-zinc-500">Alerts</div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-purple-400">{messages.filter(m => m.type === 'question').length}</div>
          <div className="text-[10px] text-zinc-500">Questions</div>
        </div>
      </div>

      {/* Active Collectors */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Active Collectors</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set(messages.slice(-40).map(m => JSON.stringify(m.user)))]
            .map(u => JSON.parse(u) as Persona)
            .slice(0, 12)
            .map((p, i) => (
              <span key={i} className={`text-xs ${p.color} bg-zinc-800/60 px-2 py-1 rounded-full flex items-center gap-1`}>
                {p.badge} {p.name}
              </span>
            ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How Market Chat Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Live Feed', desc: 'Messages from 20 simulated collector personas stream in real-time. Each has a unique collecting style and personality.' },
            { step: '2', title: 'Real Card Data', desc: 'Every pull, sale, and price discussion references real cards from our 9,000+ database with actual market values.' },
            { step: '3', title: 'Filter by Type', desc: 'Focus on what matters: filter by Pulls (new opens), Sales (deals), Alerts (breaking news), or Q&A (community questions).' },
            { step: '4', title: 'Market Pulse', desc: 'Watch the chat to gauge community sentiment. Lots of pulls? New product dropped. Lots of alerts? Market is moving.' },
          ].map(item => (
            <div key={item.step} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 bg-indigo-600/30 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 font-bold text-sm">
                {item.step}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Chat Tips</h2>
        <div className="space-y-3">
          {[
            'Watch for ALERT messages — they signal market-moving events like trades, injuries, and big performances.',
            'Pull announcements reveal what products are being opened and which cards are actually hitting.',
            'Sale discussions show real-time pricing sentiment — are people taking profits or buying dips?',
            'Q&A threads capture what new collectors are asking — good indicator of trending interests.',
            'High message volume usually correlates with major sports events or new product releases.',
          ].map((tip, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-indigo-400 shrink-0">&#8226;</span>
              <p className="text-zinc-400 text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
