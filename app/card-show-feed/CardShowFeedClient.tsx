'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type PostType = 'deal' | 'graded' | 'raw' | 'table' | 'fire';

interface FeedPost {
  id: number;
  type: PostType;
  username: string;
  avatar: string;
  location: string;
  card: typeof sportsCards[0];
  pricePaid: number;
  marketValue: number;
  grade?: string;
  comment: string;
  timeAgo: string;
  likes: number;
}

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function parseValue(v: string): number {
  const m = v.match(/\$([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatPrice(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
  return '$' + n.toLocaleString();
}

const sportIcons: Record<string, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };

const postTypeConfig: Record<PostType, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  deal: { label: 'Deal Alert', emoji: '\ud83d\udca5', color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800/30' },
  graded: { label: 'Graded Hit', emoji: '\ud83c\udf1f', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-800/30' },
  raw: { label: 'Raw Find', emoji: '\ud83d\udd0d', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-800/30' },
  table: { label: 'Table Pickup', emoji: '\ud83e\uddf3', color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800/30' },
  fire: { label: 'Fire Pull', emoji: '\ud83d\udd25', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-800/30' },
};

const usernames = [
  'CardFlipKing', 'VintageVault22', 'RookieHunter_', 'WaxRipper99', 'GradedGems',
  'SlabDaddy', 'DimeBoxDigger', 'ChaseThePrizm', 'BasementBreaks', 'ShowFloorSam',
  'JerseyCollector', 'PatchHunter', 'AutoAddict_', 'TopLoaderTom', 'PennySleeveQueen',
  'HobbyBoxHero', 'SilverPrizmSam', 'ChromeChaser', 'RefractorRick', 'NumbdParallel',
];

const avatars = [
  '\ud83e\uddd4', '\ud83d\udc68\u200d\ud83d\udcbb', '\ud83d\udc69\u200d\ud83c\udfa4', '\ud83e\uddd1\u200d\ud83d\ude80', '\ud83d\udc68\u200d\ud83c\udfed',
  '\ud83d\udc69\u200d\ud83d\udd2c', '\ud83e\uddd1\u200d\ud83c\udfa8', '\ud83d\udc68\u200d\ud83c\udf73', '\ud83d\udc69\u200d\ud83c\udfeb', '\ud83e\uddd1\u200d\ud83d\udcbc',
];

const locations = [
  'National Sports Collectors Convention, Cleveland OH',
  'The Dallas Card Show, TX',
  'Chantilly Card Show, VA',
  'Chicago Sun-Times Card Show, IL',
  'Atlanta Card Show, GA',
  'Tampa Bay Card Show, FL',
  'Philadelphia Card Show, PA',
  'Houston Collectors Expo, TX',
  'Denver Mile High Card Show, CO',
  'Portland Card Show, OR',
  'San Diego Sports Card Expo, CA',
  'Detroit Card Show, MI',
  'Minneapolis Sports Card Show, MN',
  'Phoenix Cactus League Show, AZ',
  'Seattle Card Expo, WA',
];

const dealComments = [
  'Dealer had no idea what he had. Grabbed it instantly.',
  'Was sitting in a $1 box. Could not believe my eyes.',
  'Negotiated down from asking. Still a massive steal.',
  'End of show deal — dealer wanted to pack up light.',
  'Found this in a stack of commons. My hands were shaking.',
  'The guy next to me passed on it. His loss!',
  'Been hunting this card for months. Finally found one priced right.',
];
const gradedComments = [
  'Just got this back from PSA. Gem mint baby!',
  'BGS 9.5 with a 10 sub. Might cross to PSA.',
  'Submitted 3 months ago. Worth the wait.',
  'Pop report says only 12 exist in this grade.',
  'Sub-grade breakdown: 9.5/10/9.5/9.5. So close to a 10.',
];
const rawComments = [
  'Centering looks perfect. Sending to PSA this week.',
  'Found this beauty in a showcase. Sharp corners, clean surface.',
  'The edges on this one are pristine. Grading candidate for sure.',
  'Pulled from a junk wax box I bought for $5.',
];
const tableComments = [
  'Dealer had a whole binder of these. Picked the best one.',
  'Fair price, clean card, good addition to the PC.',
  'Table 47 has the best vintage cards at this show.',
  'Supporting the local dealers. This one was worth it.',
];
const fireComments = [
  'PULLED THIS FROM A HOBBY BOX. I AM SHAKING.',
  'First pack I opened at the show. INSANE luck.',
  'The whole table erupted when I flipped this over.',
  'Break gods blessed me today. Case hit!',
  'Serial numbered to /25. The crowd was losing it.',
];

function getComments(type: PostType): string[] {
  switch (type) {
    case 'deal': return dealComments;
    case 'graded': return gradedComments;
    case 'raw': return rawComments;
    case 'table': return tableComments;
    case 'fire': return fireComments;
  }
}

const grades = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'CGC 9.5', 'SGC 10'];
const timeAgos = ['Just now', '2m ago', '5m ago', '8m ago', '12m ago', '15m ago', '22m ago', '30m ago', '45m ago', '1h ago', '1.5h ago', '2h ago'];

export default function CardShowFeedClient() {
  const [filter, setFilter] = useState<Sport | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PostType | 'all'>('all');

  const posts = useMemo(() => {
    const now = Date.now();
    const seed = Math.floor(now / 60000); // Changes every minute
    const rng = seededRng(seed);

    const validCards = sportsCards.filter(c => parseValue(c.estimatedValueRaw) > 0);
    const shuffled = [...validCards].sort(() => rng() - 0.5);

    const types: PostType[] = ['deal', 'graded', 'raw', 'table', 'fire'];
    const result: FeedPost[] = [];

    for (let i = 0; i < 20 && i < shuffled.length; i++) {
      const card = shuffled[i];
      const marketValue = parseValue(card.estimatedValueRaw);
      const type = types[Math.floor(rng() * types.length)];
      const discount = type === 'deal' ? 0.3 + rng() * 0.4 : // 30-70% of market
                       type === 'table' ? 0.8 + rng() * 0.3 : // 80-110% of market
                       type === 'fire' ? 0 : // free (pulled from pack)
                       0.9 + rng() * 0.2; // 90-110% for others
      const pricePaid = type === 'fire' ? Math.round(15 + rng() * 35) : Math.round(marketValue * discount);
      const comments = getComments(type);

      result.push({
        id: i,
        type,
        username: usernames[Math.floor(rng() * usernames.length)],
        avatar: avatars[Math.floor(rng() * avatars.length)],
        location: locations[Math.floor(rng() * locations.length)],
        card,
        pricePaid,
        marketValue,
        grade: type === 'graded' ? grades[Math.floor(rng() * grades.length)] : undefined,
        comment: comments[Math.floor(rng() * comments.length)],
        timeAgo: timeAgos[Math.min(i, timeAgos.length - 1)],
        likes: Math.floor(rng() * 150) + 5,
      });
    }

    return result;
  }, []);

  const filtered = posts.filter(p => {
    if (filter !== 'all' && p.card.sport !== filter) return false;
    if (typeFilter !== 'all' && p.type !== typeFilter) return false;
    return true;
  });

  // Live counter
  const [activeViewers, setActiveViewers] = useState(0);
  useEffect(() => {
    setActiveViewers(Math.floor(Math.random() * 200) + 50);
    const interval = setInterval(() => {
      setActiveViewers(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Live stats bar */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-400">{Math.max(50, activeViewers)} watching</span>
        </div>
        <div className="text-gray-600">|</div>
        <div className="text-gray-400">{posts.length} posts today</div>
        <div className="text-gray-600">|</div>
        <div className="text-gray-400">{locations.length} shows active</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1">
          {(['all', 'baseball', 'basketball', 'football', 'hockey'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s ? 'bg-purple-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Sports' : `${sportIcons[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', 'deal', 'graded', 'raw', 'table', 'fire'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-purple-600 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Types' : `${postTypeConfig[t].emoji} ${postTypeConfig[t].label}`}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.map(post => {
          const cfg = postTypeConfig[post.type];
          const savings = post.marketValue - post.pricePaid;
          const savingsPct = post.marketValue > 0 ? Math.round((savings / post.marketValue) * 100) : 0;

          return (
            <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">{post.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{post.username}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} border ${cfg.border} ${cfg.color}`}>
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs mt-0.5">{post.location} &middot; {post.timeAgo}</div>
                </div>
                <div className="text-lg">{sportIcons[post.card.sport] || ''}</div>
              </div>

              {/* Card info */}
              <div className="bg-gray-800/40 rounded-lg p-3 mb-3">
                <Link href={`/sports/${post.card.slug}`} className="text-white font-semibold text-sm hover:text-blue-400 transition-colors">
                  {post.card.name}
                </Link>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                  {post.grade && (
                    <span className="text-purple-400 font-bold">{post.grade}</span>
                  )}
                  <span className="text-gray-400">Paid: <span className="text-white font-medium">{formatPrice(post.pricePaid)}</span></span>
                  <span className="text-gray-400">Market: <span className="text-white font-medium">{formatPrice(post.marketValue)}</span></span>
                  {savings > 0 && post.type !== 'fire' && (
                    <span className="text-emerald-400 font-medium">Saved {formatPrice(savings)} ({savingsPct}% off)</span>
                  )}
                  {post.type === 'fire' && (
                    <span className="text-red-400 font-medium">Pack cost only!</span>
                  )}
                  {post.card.rookie && (
                    <span className="text-amber-400">RC</span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <p className="text-gray-300 text-sm mb-3">{post.comment}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>{post.likes} likes</span>
                <span>{Math.floor(post.likes * 0.3)} replies</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No posts match your filters. Try broadening your search.
        </div>
      )}

      <div className="text-center text-gray-600 text-xs">
        Feed updates every minute with simulated card show activity from {sportsCards.length.toLocaleString()} tracked cards
      </div>
    </div>
  );
}
