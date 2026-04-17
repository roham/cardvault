import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardShuffleClient from './CardShuffleClient';

export const metadata: Metadata = {
  title: 'Card Shuffle — Daily Shell-Game Card Tracking | CardVault',
  description: 'Watch the target card get shuffled. Track it through the swap sequence. Pick the right position and win the card value. Three difficulty tiers, 10 rounds, daily + free play. Free spatial-tracking sports card game.',
  openGraph: {
    title: 'Card Shuffle — CardVault',
    description: 'Shell-game tracking with real sports cards. Watch, track, pick.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Shuffle — CardVault',
    description: 'Track the target card through the shuffle. Three tiers, 10 rounds, daily seed.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Shuffle' },
];

const faqItems = [
  {
    question: 'How do you play Card Shuffle?',
    answer: 'Each round, three to five real sports cards are laid face-up. The most valuable card is tagged as the target — memorize its position. The cards flip face-down and enter a shuffle animation with 3 to 10 pair-swaps depending on difficulty. When the shuffle ends, pick which position still holds the target. Correct picks bank the target card\u2019s fair-market value (times a difficulty multiplier); wrong picks score zero. Ten rounds per game.',
  },
  {
    question: 'What are the three difficulty tiers?',
    answer: 'Easy is 3 cards, 3 swaps, 800ms per swap, and a 1.0× multiplier — most collectors can track this with raw attention. Normal is 4 cards, 6 swaps, 500ms per swap, and a 1.5× multiplier — requires following two or three cards through intersecting swaps. Hard is 5 cards, 10 swaps, 300ms per swap, and a 2.0× multiplier — approaches the limits of visual working memory. Pick the tier that\u2019s a slight stretch for you; that\u2019s where spatial tracking actually trains.',
  },
  {
    question: 'Daily mode vs Free Play — what is the difference?',
    answer: 'Daily mode uses a date-plus-difficulty-seeded run: every player who opens Card Shuffle on the same day at the same difficulty faces the identical card pool and the identical swap sequence, so scores are comparable. You get one daily run per difficulty per day. Free Play generates a fresh seed each game for unlimited replays. Both feed the same lifetime stats (games, best score, lifetime target-tracking accuracy, daily streak).',
  },
  {
    question: 'Why value the target card as the scoring metric?',
    answer: 'Pure hit-count scoring (one point per correct pick) would make a $5 base card and a $20K vintage grail worth the same. Using the target card\u2019s FMV as the per-round payout anchors the game in real hobby stakes: the harder rounds tend to pull higher-value cards from the pool, so a correct Hard pick on a $8K Mantle is meaningfully different from a correct Easy pick on a $400 Prizm. Lifetime score tracks total hobby value you\u2019ve successfully tracked through shuffles.',
  },
  {
    question: 'How is the grade calculated?',
    answer: 'Grade ladder (after difficulty multiplier applied): S = $25,000+, A = $12,000-$25,000, B = $6,000-$12,000, C = $2,500-$6,000, D = $800-$2,500, F = under $800. Hard mode\u2019s 2.0× multiplier is the fast path to S. A perfect 10-for-10 Easy run on mid-tier pools typically lands B; a 6-for-10 Hard run on premium pools can land A.',
  },
  {
    question: 'What is the emoji share grid?',
    answer: 'After the game ends, the share button copies a 10-emoji summary: 🎯 for a correct pick, ❌ for a miss, one per round in order. Plus difficulty label, correct/total, score, and grade. Perfect for dropping into a hobby Discord or a group chat without leaking the specific cards pulled.',
  },
  {
    question: 'Is this just Card Memory but with a shell game?',
    answer: 'No. Card Memory (G-020) is static flip-and-match — cards stay put while you reveal pairs from memory. Card Shuffle is dynamic spatial tracking — cards move, and you must track a specific target through intersecting swaps. The cognitive load is different: Memory uses recall of past reveals, Shuffle uses continuous visual attention during motion. Closer to the classic cups-and-ball con than to any existing CardVault game.',
  },
  {
    question: 'How does this differ from the other attention/tracking games?',
    answer: 'Card Beat (G-077) is rhythm-timing with lanes and beat patterns — audio-reaction. Card Reflex and Card Snap are speed-matching. Card Echo is sequential pattern repeat (Simon-style). Card Shuffle is unique: none of those require following a single moving object through a swap sequence while the other cards also move. It is the only spatial-tracking mechanic in the CardVault game catalog.',
  },
];

export default function CardShufflePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Shuffle',
        description: 'Daily shell-game spatial-tracking puzzle using real sports cards. Memorize the target position, watch the shuffle, pick the target. Three difficulty tiers with escalating swap count and speed.',
        url: 'https://cardvault-two.vercel.app/card-shuffle',
        gameItem: { '@type': 'Thing', name: 'Sports trading card' },
        numberOfPlayers: { '@type': 'QuantitativeValue', value: 1 },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Daily shell-game tracking &middot; 10 rounds &middot; 3 difficulty tiers
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Shuffle</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Memorize the target card&rsquo;s position. Watch the cards shuffle. Pick where the target landed. Three tiers scale the difficulty from a gentle 3-card warm-up to a 5-card, 10-swap blur.
        </p>
      </div>

      <CardShuffleClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-cyan-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">More card games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-memory" className="text-cyan-300 hover:text-cyan-200">Card Memory</Link>
          <Link href="/card-echo" className="text-cyan-300 hover:text-cyan-200">Card Echo</Link>
          <Link href="/card-beat" className="text-cyan-300 hover:text-cyan-200">Card Beat</Link>
          <Link href="/card-reflex" className="text-cyan-300 hover:text-cyan-200">Card Reflex</Link>
          <Link href="/card-snap" className="text-cyan-300 hover:text-cyan-200">Card Snap</Link>
          <Link href="/card-path" className="text-cyan-300 hover:text-cyan-200">Card Path</Link>
          <Link href="/card-mastermind" className="text-cyan-300 hover:text-cyan-200">Card Mastermind</Link>
          <Link href="/card-oddball" className="text-cyan-300 hover:text-cyan-200">Card Oddball</Link>
          <Link href="/games" className="text-cyan-300 hover:text-cyan-200">All Games</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-cyan-300 hover:text-cyan-200">&larr; Games</Link>
        <Link href="/" className="text-cyan-300 hover:text-cyan-200">Home</Link>
      </div>
    </div>
  );
}
