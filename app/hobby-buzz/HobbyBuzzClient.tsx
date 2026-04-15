'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── helpers ─── */
function dateHash(d: Date): number {
  const s = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function parseValue(v: string): number {
  const m = v.match(/\$[\d,]+/);
  return m ? parseInt(m[0].replace(/[$,]/g, ''), 10) : 0;
}

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function timeAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

/* ─── types ─── */
type PostType = 'hot-take' | 'buy-signal' | 'sell-signal' | 'question' | 'brag' | 'news-reaction' | 'grading-result';

interface BuzzPost {
  id: number;
  username: string;
  avatar: string;
  type: PostType;
  content: string;
  sport: string;
  likes: number;
  replies: number;
  timestamp: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  playerMention?: string;
}

/* ─── data ─── */
const USERNAMES = [
  'CardFlipKing', 'WaxRipperMike', 'PSA10Chaser', 'VintageVaultDave', 'RookieHunter23',
  'SlabQueenJess', 'MintCondition', 'GrailHunter99', 'BoxBreakBoss', 'FlipOrKeep',
  'DiamondCutter', 'GemMintGary', 'CardShowTony', 'PCCollector', 'HobbyInsider',
  'ToppsKing', 'PrizmPursuit', 'ChromeChaser', 'WaxMuseum', 'PackPuller',
  'InvestorIQ', 'CardNerd2025', 'SealedWaxLife', 'GradingGuru', 'VaultBuilder',
  'ShoeBoxFinds', 'CompsKing', 'BreakBuddy', 'DimeBoxDan', 'HitParade',
  'CenteredCards', 'EbayFlips', 'CardGameChanger', 'RookieReport', 'HobbyNewbie',
];

const AVATARS = [
  '🃏', '🎴', '💎', '🏆', '🔥', '⭐', '👑', '💰', '📦', '🎯',
  '🧊', '🎪', '🎰', '📈', '🏅', '🎲', '🃏', '⚡', '🌟', '💫',
];

const SPORT_COLORS: Record<string, string> = {
  baseball: 'text-rose-400', basketball: 'text-orange-400',
  football: 'text-emerald-400', hockey: 'text-sky-400', general: 'text-purple-400',
};
const SPORT_BG: Record<string, string> = {
  baseball: 'bg-rose-950/30 border-rose-800/30',
  basketball: 'bg-orange-950/30 border-orange-800/30',
  football: 'bg-emerald-950/30 border-emerald-800/30',
  hockey: 'bg-sky-950/30 border-sky-800/30',
  general: 'bg-purple-950/30 border-purple-800/30',
};
const SPORT_EMOJI: Record<string, string> = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒', general: '🃏',
};

const TYPE_CONFIG: Record<PostType, { label: string; color: string; icon: string }> = {
  'hot-take': { label: 'Hot Take', color: 'bg-red-950/60 text-red-400 border-red-800/50', icon: '🔥' },
  'buy-signal': { label: 'Buy Signal', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50', icon: '📈' },
  'sell-signal': { label: 'Sell Signal', color: 'bg-amber-950/60 text-amber-400 border-amber-800/50', icon: '📉' },
  'question': { label: 'Question', color: 'bg-blue-950/60 text-blue-400 border-blue-800/50', icon: '❓' },
  'brag': { label: 'Show Off', color: 'bg-purple-950/60 text-purple-400 border-purple-800/50', icon: '🏆' },
  'news-reaction': { label: 'News', color: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/50', icon: '📰' },
  'grading-result': { label: 'Grade Result', color: 'bg-amber-950/60 text-amber-400 border-amber-800/50', icon: '🏅' },
};

/* ─── template generators ─── */
function generateHotTake(rng: () => number, cards: typeof sportsCards): { content: string; sport: string; sentiment: 'bullish' | 'bearish' | 'neutral'; player?: string } {
  const templates = [
    { t: (p: string) => `${p} cards are going to 2x by end of year. Book it. The market hasn't priced in what's coming.`, s: 'bullish' as const },
    { t: (p: string) => `Unpopular opinion: ${p} is overpriced right now. Too much hype, not enough performance. Selling my position.`, s: 'bearish' as const },
    { t: (p: string) => `Everyone sleeping on ${p} cards. This is the buy window before the breakout.`, s: 'bullish' as const },
    { t: (p: string) => `I think ${p} has peaked. Population keeps growing and demand is flatting. Sell into strength.`, s: 'bearish' as const },
    { t: (p: string) => `${p} rookie cards are the best value play in the hobby right now. Fight me.`, s: 'bullish' as const },
    { t: (_p: string) => `Modern cards are a bubble. In 5 years half these rookies will be worth pennies. Go vintage or go home.`, s: 'bearish' as const },
    { t: (_p: string) => `PSA 10s are losing their premium. Too many submissions, too many 10s. BGS 9.5 Black Label is the new standard.`, s: 'neutral' as const },
    { t: (p: string) => `${p} just changed my whole portfolio strategy. Adding heavy to this position.`, s: 'bullish' as const },
  ];
  const card = cards[Math.floor(rng() * cards.length)];
  const tmpl = templates[Math.floor(rng() * templates.length)];
  return { content: tmpl.t(card.player), sport: card.sport, sentiment: tmpl.s, player: card.player };
}

function generateBuySignal(rng: () => number, cards: typeof sportsCards): { content: string; sport: string; player?: string } {
  const rookies = cards.filter(c => c.rookie && parseValue(c.estimatedValueRaw) >= 5);
  const card = rookies[Math.floor(rng() * rookies.length)];
  const reasons = [
    `Just loaded up on ${card.player} at ${card.estimatedValueRaw}. Upcoming catalyst should push this 30%+ higher.`,
    `Picked up 5x ${card.name} raw. PSA submission going out this week. If they come back 10s, that's easy money.`,
    `${card.player} is sitting at career lows. This is a buy-the-dip opportunity you won't see again this year.`,
    `Added ${card.player} to my portfolio. The risk/reward at ${card.estimatedValueRaw} is too good to pass up.`,
  ];
  return { content: reasons[Math.floor(rng() * reasons.length)], sport: card.sport, player: card.player };
}

function generateSellSignal(rng: () => number, cards: typeof sportsCards): { content: string; sport: string; player?: string } {
  const card = cards[Math.floor(rng() * cards.length)];
  const reasons = [
    `Sold my ${card.player} position today. Locked in 40% profit. Don't get greedy, take profits when you can.`,
    `Listing my ${card.name} on eBay tonight. Time to rotate into something with more upside.`,
    `${card.player} cards are going to correct. Population report just jumped 15%. Selling before the crash.`,
    `Taking profits on ${card.player}. Great run but I think the ceiling is priced in now.`,
  ];
  return { content: reasons[Math.floor(rng() * reasons.length)], sport: card.sport, player: card.player };
}

function generateQuestion(rng: () => number, cards: typeof sportsCards): { content: string; sport: string; player?: string } {
  const card = cards[Math.floor(rng() * cards.length)];
  const questions = [
    `Should I grade my ${card.name}? It looks like a 9 to me but centering is a little off. Worth the submission fee?`,
    `What do you all think of ${card.player} long term? Hold or sell now?`,
    `Is ${card.estimatedValueRaw} a fair price for ${card.name} raw? Seller on eBay has one but seems high.`,
    `New to collecting — is ${card.player} a good first investment card? Budget is around $50.`,
    `PSA or BGS for ${card.player} cards? I hear BGS is tougher but commands a premium.`,
  ];
  return { content: questions[Math.floor(rng() * questions.length)], sport: card.sport, player: card.player };
}

function generateBrag(rng: () => number, cards: typeof sportsCards): { content: string; sport: string; player?: string } {
  const valuable = cards.filter(c => parseValue(c.estimatedValueGem) >= 100);
  const card = valuable[Math.floor(rng() * valuable.length)];
  const grades = ['PSA 10', 'BGS 9.5', 'PSA 10', 'CGC 10', 'BGS 10 Black Label'];
  const grade = grades[Math.floor(rng() * grades.length)];
  const brags = [
    `Just got my ${card.player} back from PSA... ${grade}!!! Let's gooo! 🎉 ${card.estimatedValueGem} easy.`,
    `Pulled a ${card.name} from a hobby box today. First hit of the year and it's a BANGER.`,
    `Bought this ${card.player} raw for $20 three years ago. Just sold the ${grade} for ${card.estimatedValueGem}. Patience pays.`,
    `My ${card.player} collection is finally complete. 47 different cards spanning 1990-2024. PC goals achieved.`,
  ];
  return { content: brags[Math.floor(rng() * brags.length)], sport: card.sport, player: card.player };
}

function generateNewsReaction(rng: () => number): { content: string; sport: string } {
  const reactions = [
    { content: 'NFL Draft is next week. Rookie card prices about to go CRAZY. Which prospects are you stacking?', sport: 'football' },
    { content: 'NBA Playoffs are heating up. Every breakout performance = instant card price spike. Watch for the next Jimmy Butler type run.', sport: 'basketball' },
    { content: 'Topps just announced a new premium set. More product = more supply = lower prices. When will they stop oversaturating?', sport: 'baseball' },
    { content: 'Stanley Cup Playoffs getting wild. Any dark horse players you are buying before they blow up?', sport: 'hockey' },
    { content: 'Card show season is starting. Who else is stocking up for The National in July?', sport: 'general' },
    { content: 'PSA just raised their prices AGAIN. At this point, only grade cards worth $100+ raw. Everything else is negative ROI.', sport: 'general' },
    { content: 'Hobby boxes are getting more expensive but hit rates are not improving. Something has to give.', sport: 'general' },
    { content: 'International collector demand is growing 30% YoY. Baseball especially popular in Japan and Korea.', sport: 'baseball' },
  ];
  return reactions[Math.floor(rng() * reactions.length)];
}

function generateGradingResult(rng: () => number, cards: typeof sportsCards): { content: string; sport: string; player?: string } {
  const card = cards[Math.floor(rng() * cards.length)];
  const results = [
    { grade: 'PSA 10', reaction: 'GEM MINT! 💎 Best feeling in the hobby.' },
    { grade: 'PSA 9', reaction: 'MINT! Not a 10 but still happy. Centering got me.' },
    { grade: 'PSA 8', reaction: 'NM-MT... thought it was cleaner than that. Surface must have had something.' },
    { grade: 'BGS 9.5', reaction: 'GEM MINT with all 9.5 subs! So close to a Black Label.' },
    { grade: 'CGC 10', reaction: 'PRISTINE! CGC 10 pop is tiny. This is going to hold value.' },
  ];
  const result = results[Math.floor(rng() * results.length)];
  return { content: `${card.name} came back ${result.grade}! ${result.reaction}`, sport: card.sport, player: card.player };
}

export default function HobbyBuzzClient() {
  const [posts, setPosts] = useState<BuzzPost[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<PostType | 'all'>('all');
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const postIdRef = useRef(0);

  const today = new Date();
  const seed = dateHash(today);

  // Generate initial posts
  const initialPosts = useMemo(() => {
    const rng = seededRng(seed);
    const generated: BuzzPost[] = [];
    const types: PostType[] = ['hot-take', 'buy-signal', 'sell-signal', 'question', 'brag', 'news-reaction', 'grading-result'];

    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(rng() * types.length)];
      const username = USERNAMES[Math.floor(rng() * USERNAMES.length)];
      const avatar = AVATARS[Math.floor(rng() * AVATARS.length)];
      let postData: { content: string; sport: string; sentiment?: 'bullish' | 'bearish' | 'neutral'; player?: string };

      switch (type) {
        case 'hot-take': postData = generateHotTake(rng, sportsCards); break;
        case 'buy-signal': postData = { ...generateBuySignal(rng, sportsCards), sentiment: 'bullish' }; break;
        case 'sell-signal': postData = { ...generateSellSignal(rng, sportsCards), sentiment: 'bearish' }; break;
        case 'question': postData = { ...generateQuestion(rng, sportsCards), sentiment: 'neutral' }; break;
        case 'brag': postData = { ...generateBrag(rng, sportsCards), sentiment: 'bullish' }; break;
        case 'news-reaction': postData = { ...generateNewsReaction(rng), sentiment: 'neutral' }; break;
        case 'grading-result': postData = { ...generateGradingResult(rng, sportsCards), sentiment: 'bullish' }; break;
      }

      generated.push({
        id: i,
        username,
        avatar,
        type,
        content: postData.content,
        sport: postData.sport,
        likes: Math.floor(rng() * 120),
        replies: Math.floor(rng() * 30),
        timestamp: Math.floor(rng() * 7200), // 0-2 hours ago
        sentiment: postData.sentiment || 'neutral',
        playerMention: postData.player,
      });
    }

    // Sort by most recent
    generated.sort((a, b) => a.timestamp - b.timestamp);
    postIdRef.current = generated.length;
    return generated;
  }, [seed]);

  useEffect(() => {
    setMounted(true);
    setPosts(initialPosts);
  }, [initialPosts]);

  // Auto-add new posts
  useEffect(() => {
    if (!mounted || paused) return;
    const interval = setInterval(() => {
      const rng = seededRng(seed + postIdRef.current * 777 + Date.now());
      const types: PostType[] = ['hot-take', 'buy-signal', 'sell-signal', 'question', 'brag', 'news-reaction', 'grading-result'];
      const type = types[Math.floor(rng() * types.length)];
      const username = USERNAMES[Math.floor(rng() * USERNAMES.length)];
      const avatar = AVATARS[Math.floor(rng() * AVATARS.length)];
      let postData: { content: string; sport: string; sentiment?: 'bullish' | 'bearish' | 'neutral'; player?: string };

      switch (type) {
        case 'hot-take': postData = generateHotTake(rng, sportsCards); break;
        case 'buy-signal': postData = { ...generateBuySignal(rng, sportsCards), sentiment: 'bullish' }; break;
        case 'sell-signal': postData = { ...generateSellSignal(rng, sportsCards), sentiment: 'bearish' }; break;
        case 'question': postData = { ...generateQuestion(rng, sportsCards), sentiment: 'neutral' }; break;
        case 'brag': postData = { ...generateBrag(rng, sportsCards), sentiment: 'bullish' }; break;
        case 'news-reaction': postData = { ...generateNewsReaction(rng), sentiment: 'neutral' }; break;
        case 'grading-result': postData = { ...generateGradingResult(rng, sportsCards), sentiment: 'bullish' }; break;
      }

      const newPost: BuzzPost = {
        id: postIdRef.current++,
        username,
        avatar,
        type,
        content: postData.content,
        sport: postData.sport,
        likes: Math.floor(rng() * 20),
        replies: Math.floor(rng() * 5),
        timestamp: 0,
        sentiment: postData.sentiment || 'neutral',
        playerMention: postData.player,
      };

      setPosts(prev => [newPost, ...prev].slice(0, 50));
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted, paused, seed]);

  // Sentiment stats
  const sentimentStats = useMemo(() => {
    const bullish = posts.filter(p => p.sentiment === 'bullish').length;
    const bearish = posts.filter(p => p.sentiment === 'bearish').length;
    const total = posts.length || 1;
    return {
      bullish: Math.round((bullish / total) * 100),
      bearish: Math.round((bearish / total) * 100),
      neutral: 100 - Math.round((bullish / total) * 100) - Math.round((bearish / total) * 100),
    };
  }, [posts]);

  // Trending topics
  const trending = useMemo(() => {
    const mentions = new Map<string, number>();
    for (const p of posts) {
      if (p.playerMention) {
        mentions.set(p.playerMention, (mentions.get(p.playerMention) || 0) + 1);
      }
    }
    return [...mentions.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (filter !== 'all' && p.sport !== filter) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      return true;
    });
  }, [posts, filter, typeFilter]);

  if (!mounted) return <div className="text-center text-gray-500 py-20">Loading buzz...</div>;

  return (
    <div className="space-y-6">
      {/* Sentiment Bar */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Community Sentiment</h2>
          <span className="text-xs text-gray-500">{posts.length} posts</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden mb-2">
          <div className="bg-emerald-500 transition-all" style={{ width: `${sentimentStats.bullish}%` }} />
          <div className="bg-gray-600 transition-all" style={{ width: `${sentimentStats.neutral}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${sentimentStats.bearish}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-emerald-400">Bullish {sentimentStats.bullish}%</span>
          <span className="text-gray-400">Neutral {sentimentStats.neutral}%</span>
          <span className="text-red-400">Bearish {sentimentStats.bearish}%</span>
        </div>
      </div>

      {/* Trending + Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Trending */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Trending Players</h3>
          <div className="space-y-1.5">
            {trending.length > 0 ? trending.map(([player, count], i) => (
              <Link key={i} href={`/players/${slugifyPlayer(player)}`} className="flex items-center justify-between text-sm hover:text-amber-400 transition-colors">
                <span className="text-gray-300">#{i + 1} {player}</span>
                <span className="text-gray-500 text-xs">{count} mentions</span>
              </Link>
            )) : <span className="text-gray-500 text-xs">Loading trends...</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Feed Controls</h3>
          <button
            onClick={() => setPaused(!paused)}
            className={`w-full py-2 rounded-lg text-sm font-medium mb-3 transition-all ${
              paused ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-red-600/80 text-white hover:bg-red-500'
            }`}
          >
            {paused ? '&#9654; Resume Feed' : '&#10074;&#10074; Pause Feed'}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'baseball', 'basketball', 'football', 'hockey'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                  filter === s ? 'bg-amber-600 text-white' : 'bg-gray-700/60 text-gray-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : `${SPORT_EMOJI[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            typeFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
          }`}
        >
          All Types
        </button>
        {(Object.keys(TYPE_CONFIG) as PostType[]).map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === type ? 'bg-amber-600 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
            }`}
          >
            {TYPE_CONFIG[type].icon} {TYPE_CONFIG[type].label}
          </button>
        ))}
      </div>

      {/* Post Feed */}
      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const typeConf = TYPE_CONFIG[post.type];
          return (
            <div key={post.id} className={`${SPORT_BG[post.sport] || SPORT_BG.general} border rounded-xl p-4 transition-all`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{post.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white text-sm font-semibold">{post.username}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${typeConf.color}`}>
                      {typeConf.icon} {typeConf.label}
                    </span>
                    <span className="text-gray-600 text-xs">&middot;</span>
                    <span className="text-gray-500 text-xs">{timeAgo(post.timestamp)}</span>
                    <span className="text-gray-600 text-xs">&middot;</span>
                    <span className={`text-xs ${SPORT_COLORS[post.sport] || SPORT_COLORS.general}`}>
                      {SPORT_EMOJI[post.sport] || '🃏'} {post.sport.charAt(0).toUpperCase() + post.sport.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>&#10084; {post.likes}</span>
                    <span>&#128172; {post.replies}</span>
                    {post.playerMention && (
                      <Link href={`/players/${slugifyPlayer(post.playerMention)}`} className="text-amber-400/70 hover:text-amber-400">
                        @{post.playerMention}
                      </Link>
                    )}
                    <span className={`ml-auto ${
                      post.sentiment === 'bullish' ? 'text-emerald-400' : post.sentiment === 'bearish' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {post.sentiment === 'bullish' ? '&#9650; Bullish' : post.sentiment === 'bearish' ? '&#9660; Bearish' : '&#9644; Neutral'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center text-gray-500 py-10 text-sm">No posts match your filters. Try adjusting the sport or type filter.</div>
      )}
    </div>
  );
}
