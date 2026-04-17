import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardRaceClient from './CardRaceClient';

export const metadata: Metadata = {
  title: 'Card Race — Daily Horse-Race-Style Card Prediction Game | CardVault',
  description: 'Pick Win / Place / Show across a field of five sports cards racing 12 furlongs. Each card runs on a deterministic step pattern derived from its attributes. Score the trifecta for bonus points. Daily seeded puzzle + free-play mode, emoji share, localStorage stats.',
  openGraph: {
    title: 'Card Race — CardVault',
    description: 'Five cards. Twelve furlongs. Pick the trifecta. Score the bonus.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Race — CardVault',
    description: 'Horse racing with cards. Pick Win / Place / Show. Watch them run.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Race' },
];

const faqItems = [
  {
    question: 'How does Card Race work?',
    answer: 'Five randomly selected sports cards are your field. You pick Win (first place), Place (second), and Show (third) before the race starts. The race runs across 12 furlongs — each furlong, every card takes a step whose size is determined by a deterministic hash of the card\'s attributes (player, year, sport, value) combined with the furlong number and the daily seed. This means the race outcome is fully determined by the cards in the field and the seed — not random — which is why Daily mode is comparable across players.',
  },
  {
    question: 'What\u2019s the scoring?',
    answer: 'Correct Win pick: 10 points. Correct Place pick (2nd place): 5 points. Correct Show pick (3rd place): 3 points. Maximum single-race score without the bonus: 18. Trifecta bonus (all three correct in exact order): +50. Perfect race scores 68. Score to letter grade: 60+ is A (rare — basically only trifecta hits), 40-59 is B (two picks correct), 20-39 is C (one pick correct), 10-19 is D (partial credit), below 10 is F.',
  },
  {
    question: 'Is the race actually random?',
    answer: 'No — it\'s deterministic, which is a feature not a bug. Card Race uses FNV-1a hashing of (card slug + furlong number + daily seed) to produce each step. This means two players on the same day see the same 5 cards and the same race outcome. Your picks are the only variable. Daily mode is comparable across the community; free-play mode uses fresh randomness each race for practice or curiosity.',
  },
  {
    question: 'Are the cards weighted — do higher-value cards race "faster"?',
    answer: 'No. Card attributes determine step sizes through hashing, not value. Value influences which cards appear in the field (lower-value cards are filtered out to keep the field interesting) but does NOT bias step sizes. A $50 rookie card has identical step-distribution potential to a $5,000 vintage card — the hash is what it is. This keeps the game feel fair: a well-liked common can beat a favorite grail in the same race.',
  },
  {
    question: 'Can I just play it for fun without worrying about scores?',
    answer: 'Absolutely. Free-play mode lets you run as many races as you want with no stats tracking. Or play Daily and just watch the race — the visual pace (300ms per furlong, 12 furlongs = ~3.6 seconds total) is the pleasure, regardless of whether you picked correctly. For serious stats tracking, Daily mode logs races + wins + trifecta hits + best race in localStorage for personal history.',
  },
  {
    question: 'Why five cards and twelve furlongs?',
    answer: 'Five is the canonical horse-race field size — it produces 5! = 120 possible Win/Place/Show permutations, large enough for 60 valid picks (Win × Place × Show excluding repeats) to be meaningfully varied. Twelve furlongs gives enough steps that small step-size differences compound into visible lead changes — races with only 3-4 furlongs feel abrupt and arbitrary; 20+ furlongs feel sluggish without adding drama. Twelve is the sweet spot for ~3-second races that hold attention to the finish.',
  },
  {
    question: 'How do I share my result?',
    answer: 'Click "Share result" after the race. The share format is a compact 3-line summary: "Card Race [date] · [score] / 68 · [grade letter]" plus an emoji-finish-order ribbon (🥇🥈🥉 next to your picks, showing green emoji if you picked correctly, red if not). Works great on X, Discord, Bluesky. Matches Wordle-style daily share patterns so friends know what they\'re looking at without needing context.',
  },
];

export default function CardRacePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        name: 'Card Race',
        description: 'Five-card horse-race prediction game. Pick Win / Place / Show and watch the field race 12 furlongs.',
        url: 'https://cardvault-two.vercel.app/card-race',
        genre: 'Prediction / Visual',
        gamePlatform: 'Web',
        numberOfPlayers: '1',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
          Five cards &middot; twelve furlongs &middot; pick Win / Place / Show
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Card Race</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Horse racing, hobby-edition. Five random sports cards race across twelve furlongs. Before the gates open you pick Win (first place), Place (second), and Show (third). Race outcomes are deterministic &mdash; no RNG &mdash; so Daily mode is comparable across the community. Hit the trifecta for the bonus. Try free-play as many times as you like.
        </p>
      </div>

      <CardRaceClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-cyan-300 transition-colors">{faq.question}<span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span></summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Games</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-keno" className="text-cyan-300 hover:text-cyan-200">Card Keno</Link>
          <Link href="/card-briefcase" className="text-cyan-300 hover:text-cyan-200">Card Briefcase</Link>
          <Link href="/card-dozen" className="text-cyan-300 hover:text-cyan-200">Card Dozen</Link>
          <Link href="/rank-or-tank" className="text-cyan-300 hover:text-cyan-200">Rank or Tank</Link>
          <Link href="/card-tower-climb" className="text-cyan-300 hover:text-cyan-200">Tower Climb</Link>
          <Link href="/card-pincer" className="text-cyan-300 hover:text-cyan-200">Card Pincer</Link>
          <Link href="/card-mastermind" className="text-cyan-300 hover:text-cyan-200">Card Mastermind</Link>
          <Link href="/games" className="text-cyan-300 hover:text-cyan-200">All Games</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/games" className="text-cyan-300 hover:text-cyan-200">&larr; All Games</Link>
        <Link href="/tools" className="text-cyan-300 hover:text-cyan-200">Tools</Link>
        <Link href="/" className="text-cyan-300 hover:text-cyan-200">Home</Link>
      </div>
    </div>
  );
}
