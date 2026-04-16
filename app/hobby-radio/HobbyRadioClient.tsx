'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

// --- Types ---
type SegmentType = 'market-update' | 'caller-qa' | 'hot-take' | 'spotlight' | 'deal-alert';
type SportFilter = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey';

interface BroadcastEntry {
  id: number;
  segment: SegmentType;
  host: Host;
  text: string;
  card?: { name: string; slug: string; value: string; sport: string };
  caller?: Caller;
  timestamp: Date;
}

interface Host {
  name: string;
  badge: string;
  role: string;
  color: string;
}

interface Caller {
  name: string;
  badge: string;
  type: string;
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

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// --- Hosts ---
const hosts: Host[] = [
  { name: 'Big Mike', badge: '🎙️', role: 'Lead Analyst', color: 'text-amber-400' },
  { name: 'Card Queen', badge: '👑', role: 'Community Host', color: 'text-pink-400' },
];

// --- Callers ---
const callers: Caller[] = [
  { name: 'FlipMaster_Jay', badge: '💰', type: 'flipper' },
  { name: 'NewCollector_Sarah', badge: '🌱', type: 'beginner' },
  { name: 'VintageVault_Tom', badge: '🕰️', type: 'vintage' },
  { name: 'InvestorMike', badge: '📈', type: 'investor' },
  { name: 'SetChaser_Dan', badge: '📋', type: 'completionist' },
  { name: 'GradeGuru', badge: '💎', type: 'grading' },
  { name: 'PackRipper_Alex', badge: '📦', type: 'opener' },
  { name: 'BudgetKing', badge: '🎯', type: 'budget' },
  { name: 'ShowFloor_Pete', badge: '🎪', type: 'shows' },
  { name: 'RookieWatch_Kim', badge: '⭐', type: 'rookies' },
  { name: 'WaxHoarder', badge: '🔥', type: 'sealed' },
  { name: 'BreakAddict', badge: '🎬', type: 'breaks' },
];

// --- Segment config ---
const segmentConfig: Record<SegmentType, { label: string; icon: string; color: string; border: string; bg: string }> = {
  'market-update': { label: 'MARKET UPDATE', icon: '📊', color: 'text-emerald-400', border: 'border-emerald-700/50', bg: 'bg-emerald-950/30' },
  'caller-qa': { label: 'CALLER Q&A', icon: '📞', color: 'text-blue-400', border: 'border-blue-700/50', bg: 'bg-blue-950/30' },
  'hot-take': { label: 'HOT TAKE', icon: '🔥', color: 'text-red-400', border: 'border-red-700/50', bg: 'bg-red-950/30' },
  'spotlight': { label: 'PLAYER SPOTLIGHT', icon: '🌟', color: 'text-yellow-400', border: 'border-yellow-700/50', bg: 'bg-yellow-950/30' },
  'deal-alert': { label: 'DEAL ALERT', icon: '🚨', color: 'text-orange-400', border: 'border-orange-700/50', bg: 'bg-orange-950/30' },
};

const segmentOrder: SegmentType[] = ['market-update', 'caller-qa', 'hot-take', 'spotlight', 'deal-alert'];

// --- Sport labels ---
const sportLabels: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };

export default function HobbyRadioClient() {
  const [entries, setEntries] = useState<BroadcastEntry[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [sport, setSport] = useState<SportFilter>('all');
  const [currentSegment, setCurrentSegment] = useState<SegmentType>('market-update');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [entryCount, setEntryCount] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter cards by sport
  const cards = useMemo(() => {
    const filtered = sport === 'all' ? sportsCards : sportsCards.filter(c => c.sport === sport);
    return filtered.length > 0 ? filtered : sportsCards;
  }, [sport]);

  // Generate a broadcast entry
  const generateEntry = useCallback((idx: number, rng: () => number): BroadcastEntry => {
    const segType = segmentOrder[Math.floor(idx / 3) % segmentOrder.length];
    const host = hosts[Math.floor(rng() * hosts.length)];
    const card = cards[Math.floor(rng() * cards.length)];
    const val = parseValue(card.estimatedValueRaw);
    const caller = callers[Math.floor(rng() * callers.length)];
    const sportLabel = sportLabels[card.sport] || card.sport;
    const changePercent = Math.floor(rng() * 18) - 5;
    const isUp = changePercent > 0;

    let text = '';
    let entryCard: BroadcastEntry['card'] | undefined;
    let entryCaller: Caller | undefined;

    switch (segType) {
      case 'market-update': {
        const updates = [
          `${sportLabel} cards ${isUp ? 'showing strength' : 'cooling off'} this morning. ${card.player}${card.rookie ? ' (rookie)' : ''} is ${isUp ? 'up' : 'down'} about ${Math.abs(changePercent)}% — the ${card.name} currently sits around $${val.toLocaleString()} raw. ${isUp ? 'Buyers are aggressive.' : 'Some selling pressure here.'}`,
          `Big mover alert in ${sportLabel}: ${card.player} cards are seeing ${isUp ? 'increased demand' : 'profit-taking'}. The ${card.set} issue ${isUp ? 'climbing' : 'dipping'} ${Math.abs(changePercent)}%. ${card.rookie ? 'Rookie premium holding firm.' : 'Veteran card with steady collector base.'}`,
          `Market check on ${card.player} — ${card.name} trading around $${val.toLocaleString()}. ${isUp ? 'Volume is picking up, could see more upside.' : 'Lighter volume today, watch for support levels.'} ${sportLabel} sector overall is ${rng() > 0.5 ? 'bullish' : 'mixed'}.`,
          `${sportLabel} sector report: ${card.player} leading the ${isUp ? 'gainers' : 'decliners'} with a ${Math.abs(changePercent)}% move. The ${card.name} at $${val.toLocaleString()} is ${val > 200 ? 'a premium hold' : 'an accessible entry point'}. ${rng() > 0.5 ? 'Graded copies commanding strong premiums.' : 'Raw copies still moving well.'}`,
        ];
        text = updates[Math.floor(rng() * updates.length)];
        entryCard = { name: card.name, slug: card.slug, value: card.estimatedValueRaw, sport: card.sport };
        break;
      }
      case 'caller-qa': {
        const questions: Record<string, string[]> = {
          flipper: [
            `Hey, first-time caller. I picked up a ${card.name} for about $${Math.floor(val * 0.8).toLocaleString()} at a card show. Think I can flip it for profit?`,
            `Quick question — is ${card.player} a flip or a hold right now? I see them at $${val.toLocaleString()}.`,
          ],
          beginner: [
            `Hi, I\'m new to collecting. Is the ${card.name} a good first card to buy? It\'s $${val.toLocaleString()} raw.`,
            `I found my dad\'s old cards and there\'s a ${card.player} in there. Is it worth anything?`,
          ],
          vintage: [
            `Long-time collector here. How does the ${card.name} compare to vintage alternatives? $${val.toLocaleString()} seems ${val > 500 ? 'reasonable for quality' : 'like modern premium'}.`,
            `Seeing a lot of hype around ${card.player} but I prefer the classics. Any vintage ${sportLabel} picks you like right now?`,
          ],
          investor: [
            `Looking at ${card.player} as a long-term hold. The ${card.name} at $${val.toLocaleString()} — is the risk/reward there?`,
            `Portfolio allocation question — should I be adding more ${sportLabel} exposure? ${card.player} is on my radar.`,
          ],
          completionist: [
            `Working on the ${card.set} set. The ${card.player} card is my last need but $${val.toLocaleString()} is steep. Any tips on finding it cheaper?`,
            `Set builder here — anyone else tracking ${card.set} completion? The ${card.player} is the key card.`,
          ],
          grading: [
            `Got a raw ${card.name} that looks mint. Worth sending to PSA at this price point of $${val.toLocaleString()}?`,
            `PSA 10 vs BGS 9.5 on ${card.player} cards — which holds value better long-term?`,
          ],
          opener: [
            `Just ripped 3 boxes of ${card.set} and pulled a ${card.player}! Worth grading at $${val.toLocaleString()} raw?`,
            `Should I keep ripping ${card.set} or just buy the ${card.player} singles? Packs are fun but expensive.`,
          ],
          budget: [
            `Love ${card.player} but $${val.toLocaleString()} is over my budget. Any cheaper alternatives in ${sportLabel}?`,
            `Best ${sportLabel} cards under $${Math.max(25, Math.floor(val * 0.3)).toLocaleString()} right now?`,
          ],
          shows: [
            `Headed to a card show this weekend. Should I target ${card.player} cards? Seeing them around $${val.toLocaleString()} online.`,
            `Show floor prices for ${card.name} — typically better or worse than eBay?`,
          ],
          rookies: [
            `${card.rookie ? `${card.player} rookie cards — buy now or wait?` : `Looking for rookies similar to ${card.player}. Who\'s the next breakout in ${sportLabel}?`}`,
            `Rookie card market in ${sportLabel} — overheated or still room to run?`,
          ],
          sealed: [
            `Sealed ${card.set} boxes or ${card.player} singles? Which appreciates faster?`,
            `Is sealed wax of ${card.set} a good hold? Singles like ${card.player} at $${val.toLocaleString()} seem expensive.`,
          ],
          breaks: [
            `Thinking about entering a ${card.set} break for a shot at ${card.player}. Worth the spot price?`,
            `Break math question: is a ${sportLabel} team break worth it if ${card.player} is the main target?`,
          ],
        };
        const callerQs = questions[caller.type] || questions.beginner;
        const question = callerQs[Math.floor(rng() * callerQs.length)];

        const answers = [
          `Great question, ${caller.name}. ${card.player} at $${val.toLocaleString()} is ${val > 200 ? 'a premium card but the quality is there' : 'a solid entry point'}. ${card.rookie ? 'Rookie premium is real — don\'t sleep on it.' : 'Established player, steady demand.'} I\'d say ${isUp ? 'the trend is your friend right now' : 'wait for a dip if you can'}.`,
          `Thanks for calling in. ${card.player} is ${isUp ? 'hot right now' : 'in a bit of a lull'}, which actually ${isUp ? 'makes it harder to buy cheap' : 'could be a buying opportunity'}. The ${card.name} at $${val.toLocaleString()} — ${val > 500 ? 'make sure you\'re buying graded at that level' : 'raw is fine at this price point'}.`,
        ];
        const answer = answers[Math.floor(rng() * answers.length)];

        text = `📞 ${caller.badge} ${caller.name}: "${question}"\n\n${host.badge} ${host.name}: ${answer}`;
        entryCard = { name: card.name, slug: card.slug, value: card.estimatedValueRaw, sport: card.sport };
        entryCaller = caller;
        break;
      }
      case 'hot-take': {
        const takes = [
          `HOT TAKE: ${card.player} cards are ${isUp ? 'UNDERVALUED' : 'OVERVALUED'} right now. The ${card.name} at $${val.toLocaleString()} ${isUp ? 'should be double that in 12 months' : 'has 20% downside from here'}. Fight me. ${card.rookie ? '🔥 Rookie cards always carry a premium for a reason.' : ''}`,
          `Controversial opinion incoming: ${sportLabel} ${card.rookie ? 'rookies' : 'veterans'} are the ${rng() > 0.5 ? 'best' : 'worst'} investment in the hobby right now. ${card.player} at $${val.toLocaleString()} ${rng() > 0.5 ? 'proves my point' : 'is the exception'}. Don't @ me.`,
          `I'm saying it: ${card.player} will be ${rng() > 0.5 ? 'a top 5 card' : 'forgotten'} in ${sportLabel} in 5 years. The ${card.name} at $${val.toLocaleString()} is ${rng() > 0.5 ? 'a steal' : 'overpriced'}. Bookmark this take.`,
          `Nobody wants to hear this but ${sportLabel} ${val > 200 ? 'high-end' : 'budget'} cards are ${rng() > 0.5 ? 'where the smart money is going' : 'due for a correction'}. ${card.player} at $${val.toLocaleString()} — ${rng() > 0.5 ? 'BUY' : 'SELL'}. I said what I said.`,
        ];
        text = takes[Math.floor(rng() * takes.length)];
        entryCard = { name: card.name, slug: card.slug, value: card.estimatedValueRaw, sport: card.sport };
        break;
      }
      case 'spotlight': {
        const spotlights = [
          `🌟 PLAYER SPOTLIGHT: ${card.player} (${sportLabel})\n\nThe ${card.name} is ${card.rookie ? 'a rookie card — always a collector favorite' : 'a key issue for this player'}. Currently valued around $${val.toLocaleString()} raw. ${val > 500 ? 'This is a premium card with strong long-term appeal.' : val > 100 ? 'Mid-range card with room to grow.' : 'Affordable entry point for new collectors.'} ${card.set} is ${rng() > 0.5 ? 'a well-regarded set in the hobby' : 'gaining recognition among collectors'}.`,
          `🌟 SPOTLIGHT: Why ${card.player} deserves a spot in your collection.\n\nThe ${card.name} from ${card.set} — $${val.toLocaleString()} raw. ${card.rookie ? 'As a rookie card, this has maximum upside.' : 'This veteran card offers stability.'} ${sportLabel} market is ${isUp ? 'trending up' : 'consolidating'}, making this ${isUp ? 'a momentum play' : 'a potential value buy'}. Key card in any ${sportLabel} collection.`,
        ];
        text = spotlights[Math.floor(rng() * spotlights.length)];
        entryCard = { name: card.name, slug: card.slug, value: card.estimatedValueRaw, sport: card.sport };
        break;
      }
      case 'deal-alert': {
        const discount = Math.floor(rng() * 25) + 5;
        const dealPrice = Math.floor(val * (1 - discount / 100));
        const platforms = ['eBay', 'Facebook Marketplace', 'a local card show', 'COMC', 'MySlabs', 'Whatnot'];
        const platform = platforms[Math.floor(rng() * platforms.length)];
        const deals = [
          `🚨 DEAL ALERT: ${card.name} spotted on ${platform} for $${dealPrice.toLocaleString()} — that's ${discount}% below market of $${val.toLocaleString()}. ${card.rookie ? 'Rookie card at a discount? Don\'t wait.' : 'Good value on an established card.'} ${sportLabel} deals like this don't last.`,
          `🚨 PRICE DROP: ${card.player} — the ${card.name} just listed on ${platform} at $${dealPrice.toLocaleString()}, roughly ${discount}% under recent comps of $${val.toLocaleString()}. ${val > 200 ? 'High-end deal worth investigating.' : 'Affordable pickup if you move fast.'} Always verify condition before buying.`,
        ];
        text = deals[Math.floor(rng() * deals.length)];
        entryCard = { name: card.name, slug: card.slug, value: card.estimatedValueRaw, sport: card.sport };
        break;
      }
    }

    return {
      id: idx,
      segment: segType,
      host,
      text,
      card: entryCard,
      caller: entryCaller,
      timestamp: new Date(),
    };
  }, [cards]);

  // Start/stop broadcast
  useEffect(() => {
    if (!isLive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const baseSeed = mode === 'daily' ? dateHash() : Math.floor(Math.random() * 1_000_000);

    const tick = () => {
      setEntryCount(prev => {
        const next = prev + 1;
        const rng = seededRng(baseSeed + next * 7919);
        const entry = generateEntry(next, rng);
        const segType = segmentOrder[Math.floor(next / 3) % segmentOrder.length];
        setCurrentSegment(segType);
        setSegmentIndex(Math.floor(next / 3) % segmentOrder.length);
        setEntries(e => {
          const updated = [entry, ...e];
          return updated.slice(0, 80);
        });
        return next;
      });
    };

    // First entry immediately
    tick();

    const interval = 5000 + Math.floor(Math.random() * 3000);
    timerRef.current = setInterval(tick, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive, mode, sport, generateEntry]);

  // Auto-scroll
  useEffect(() => {
    if (feedRef.current && isLive) {
      feedRef.current.scrollTop = 0;
    }
  }, [entries.length, isLive]);

  // Reset on mode/sport change
  useEffect(() => {
    setEntries([]);
    setEntryCount(0);
  }, [mode, sport]);

  const segInfo = segmentConfig[currentSegment];

  return (
    <div className="space-y-4">
      {/* ON AIR Banner */}
      <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Live indicator + current segment */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isLive ? 'bg-red-900/50 border border-red-700/50' : 'bg-zinc-800 border border-zinc-700/50'}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
              <span className={`text-sm font-bold ${isLive ? 'text-red-400' : 'text-zinc-400'}`}>
                {isLive ? 'ON AIR' : 'PAUSED'}
              </span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${segInfo.bg} border ${segInfo.border}`}>
              <span>{segInfo.icon}</span>
              <span className={`text-xs font-semibold ${segInfo.color}`}>{segInfo.label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isLive
                  ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                  : 'bg-amber-600 text-white hover:bg-amber-500'
              }`}
            >
              {isLive ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button
              onClick={() => setMode(mode === 'daily' ? 'random' : 'daily')}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700/50"
            >
              {mode === 'daily' ? '📅 Daily' : '🎲 Random'}
            </button>
          </div>
        </div>

        {/* Sport filter */}
        <div className="flex flex-wrap gap-2 mt-3">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as SportFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setSport(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sport === s
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/50'
              }`}
            >
              {s === 'all' ? 'All Sports' : sportLabels[s] || s}
            </button>
          ))}
        </div>

        {/* Hosts */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500">Hosts:</span>
          {hosts.map(h => (
            <div key={h.name} className="flex items-center gap-1.5">
              <span>{h.badge}</span>
              <span className={`text-xs font-medium ${h.color}`}>{h.name}</span>
              <span className="text-xs text-zinc-600">({h.role})</span>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-zinc-800">
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-300 font-medium">{entries.length}</span> entries
          </div>
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-300 font-medium">{entries.filter(e => e.segment === 'market-update').length}</span> updates
          </div>
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-300 font-medium">{entries.filter(e => e.segment === 'caller-qa').length}</span> calls
          </div>
          <div className="text-xs text-zinc-500">
            <span className="text-zinc-300 font-medium">{entries.filter(e => e.segment === 'deal-alert').length}</span> deals
          </div>
          <div className="text-xs text-zinc-500">
            Segment <span className="text-zinc-300 font-medium">{segmentIndex + 1}</span>/5
          </div>
        </div>
      </div>

      {/* Segment progress bar */}
      <div className="flex gap-1">
        {segmentOrder.map((seg, i) => {
          const cfg = segmentConfig[seg];
          const isActive = i === segmentIndex;
          return (
            <div
              key={seg}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                isActive ? 'opacity-100' : i < segmentIndex ? 'opacity-60' : 'opacity-20'
              }`}
              style={{ backgroundColor: isActive ? undefined : '#3f3f46' }}
            >
              <div
                className={`h-full rounded-full ${isActive ? '' : ''}`}
                style={{
                  backgroundColor: isActive
                    ? seg === 'market-update' ? '#34d399'
                    : seg === 'caller-qa' ? '#60a5fa'
                    : seg === 'hot-take' ? '#f87171'
                    : seg === 'spotlight' ? '#facc15'
                    : '#fb923c'
                    : '#3f3f46',
                  width: '100%',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Broadcast feed */}
      <div
        ref={feedRef}
        className="bg-zinc-900/60 border border-zinc-700/30 rounded-xl max-h-[600px] overflow-y-auto"
      >
        {entries.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <div className="text-3xl mb-2">📻</div>
            <p className="text-sm">Starting broadcast...</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {entries.map(entry => {
              const cfg = segmentConfig[entry.segment];
              return (
                <div key={entry.id} className="p-4 hover:bg-zinc-800/20 transition-colors">
                  {/* Segment badge + timestamp */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className={`text-xs font-medium ${entry.host.color}`}>
                        {entry.host.badge} {entry.host.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-600">{formatTime(entry.timestamp)}</span>
                  </div>

                  {/* Content */}
                  <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {entry.text}
                  </div>

                  {/* Card reference */}
                  {entry.card && (
                    <Link
                      href={`/cards/${entry.card.slug}`}
                      className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-600 transition-colors"
                    >
                      <span className="text-xs">
                        {entry.card.sport === 'baseball' ? '⚾' : entry.card.sport === 'basketball' ? '🏀' : entry.card.sport === 'football' ? '🏈' : '🏒'}
                      </span>
                      <span className="text-xs text-zinc-400">{entry.card.name}</span>
                      <span className="text-xs text-emerald-400 font-medium">{entry.card.value}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Radio tips */}
      <div className="bg-zinc-800/20 border border-zinc-700/20 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Listening Tips</h3>
        <ul className="text-xs text-zinc-400 space-y-1.5">
          <li>• Market Updates provide the latest price movements — great for spotting trends early</li>
          <li>• Caller Q&A addresses real collecting scenarios — learn from other collectors' questions</li>
          <li>• Hot Takes are bold opinions — use them as starting points for your own research</li>
          <li>• Deal Alerts flag potential bargains — always verify condition and seller reputation before buying</li>
          <li>• Use sport filters to focus on your collecting interests</li>
        </ul>
      </div>
    </div>
  );
}
