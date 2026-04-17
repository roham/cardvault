import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardEchoClient from './CardEchoClient';

export const metadata: Metadata = {
  title: 'Card Echo — Daily Sports Card Sequence Memory Game | CardVault',
  description: 'Watch the cards flash in order — now tap them back in the same order. Each round adds one more card to remember. How long can you hold the chain? Free daily sports card memory game with three speed tiers.',
  openGraph: {
    title: 'Card Echo — CardVault',
    description: 'A sequence-memory game with real sports cards. Watch the flash pattern, repeat it back. Chain grows every round.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Echo — CardVault',
    description: 'Simon-says with sports cards. Watch the flash, repeat the pattern. How far can you get?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Echo' },
];

const faqItems = [
  {
    question: 'How do you play Card Echo?',
    answer: 'Six real sports cards line up on your screen. At the start of each round, some of the cards light up in a specific order — this is the flash pattern. Your job is to tap the cards in that same order. Round 1 flashes one card. Round 2 flashes two. Round 3 flashes three. The pattern keeps growing by one every round. Tap them back exactly, in order, and you advance. One wrong tap ends the run.',
  },
  {
    question: 'What are the three speed tiers?',
    answer: 'Slow (800ms per card) gives you time to watch and mentally label each card — good for warming up or if you just want to play with value data. Normal (500ms) is the default and rewards clean memory. Fast (300ms) pushes into speed-chunking territory where you have to group the pattern into phrases rather than individual cards. Your best-chain stat is tracked separately per speed.',
  },
  {
    question: 'Daily mode vs Free Play — what is the difference?',
    answer: 'Daily mode uses a date-seeded card pool — every player who opens Card Echo on the same day faces the same six sports cards. Your chain is directly comparable to what other collectors managed today. Your daily streak counts the number of consecutive days you played (and attempted at least round 1). Free Play rerolls a fresh card pool every game so you can practice infinitely. Both modes feed the same lifetime stats.',
  },
  {
    question: 'How does the grade system work?',
    answer: 'At the end of each run you receive a letter grade based on the highest round you completed successfully. S: 20+ rounds (world-class working-memory). A: 15-19. B: 10-14. C: 7-9. D: 4-6. F: 0-3. For reference, the classic digit-span literature puts human short-term memory around 7 ± 2 items — so a B-tier run is already at or above baseline, and S is genuinely exceptional.',
  },
  {
    question: 'Is there a strategy?',
    answer: 'Three techniques work well. First: chunk the pattern into pairs or triples rather than individual cards ("top-left then middle-right" becomes one unit). Second: label each card by its most distinctive attribute as soon as the board loads (jersey number, team color, sport) — so your sequence becomes "23 / Dodgers / 99" rather than "card at position 1 / card at position 4 / card at position 6." Third: under Fast speed, don\u2019t try to memorize the cards at all — memorize the spatial pattern of which tiles lit up, and tap by position alone.',
  },
  {
    question: 'Why real sports cards instead of coloured tiles?',
    answer: 'A generic Simon clone uses four coloured buttons — easy to memorize, emotionally flat. Card Echo forces you to actually engage with real cards (players, years, sets, values) between rounds. Over a long run you end up recognizing and remembering the specific cards, which doubles as low-pressure exposure to new players and sets. Think of it as vocabulary-building for collectors, disguised as a memory game.',
  },
];

export default function CardEchoPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
          Card Echo
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          Watch the sequence flash. Tap the cards back in the same order. Each correct round adds one more card to remember — how long can you hold the chain?
        </p>
        <p className="text-sm text-gray-500">
          Six real sports cards • Sequence grows every round • Three speed tiers • Daily + Free Play
        </p>
      </header>

      <CardEchoClient />

      <section className="mt-12 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl p-6 border border-cyan-200">
        <h2 className="text-2xl font-bold mb-4">The Psychology of Echo</h2>
        <div className="space-y-3 text-sm text-gray-800">
          <p>
            Card Echo is a working-memory benchmark dressed up as a hobby game. The task — reproduce a growing sequence in order — is the same one used in digit-span experiments since the 1880s. Classical results put the average human span at 7 ± 2 items, which means reaching round 7 already puts you at the median adult baseline.
          </p>
          <p>
            What moves people past 10 is <strong>chunking</strong>: instead of storing &quot;card A → card F → card C → card B,&quot; you compress adjacent pairs into phrases (&quot;A-F, C-B&quot;) and hold the fewer phrases. This is exactly how chess masters memorize positions and how mnemonists recall card decks — the raw capacity doesn&apos;t grow, the unit of storage does.
          </p>
          <p>
            Under the Fast tier (300ms per card) chunking by semantic content breaks down — there isn&apos;t time to name &quot;Mantle 52&quot; before the next card flashes. What works instead is <strong>spatial encoding</strong>: remember the lighting pattern on the tile grid as a shape, not as a list of cards.
          </p>
          <p className="text-xs text-gray-600">
            Hobby connection: set-build completion is also a memory task — which 387 cards do you still need? Most collectors outsource that to a checklist app, but the ones who can name their want-list from memory invariably move faster at shows and online.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/card-memory" className="p-3 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition">
            <div className="font-semibold text-sm">Card Memory</div>
            <div className="text-xs text-gray-600">Flip-pairs matching</div>
          </Link>
          <Link href="/card-mastermind" className="p-3 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition">
            <div className="font-semibold text-sm">Card Mastermind</div>
            <div className="text-xs text-gray-600">Deduce a mystery card in 10 guesses</div>
          </Link>
          <Link href="/card-chain" className="p-3 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition">
            <div className="font-semibold text-sm">Card Chain</div>
            <div className="text-xs text-gray-600">Build connected-attribute chains</div>
          </Link>
          <Link href="/card-dozen" className="p-3 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition">
            <div className="font-semibold text-sm">Card Dozen</div>
            <div className="text-xs text-gray-600">Pick the three worth the most</div>
          </Link>
          <Link href="/card-nim" className="p-3 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition">
            <div className="font-semibold text-sm">Card Nim</div>
            <div className="text-xs text-gray-600">Classic 21-game, misère rules</div>
          </Link>
          <Link href="/games" className="p-3 rounded-lg border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition">
            <div className="font-semibold text-sm">All Games</div>
            <div className="text-xs text-gray-600">80+ card games and puzzles</div>
          </Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Card Echo',
          url: 'https://cardvault-two.vercel.app/card-echo',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any',
          description:
            'Simon-says style sequence-memory game using six real sports cards. Watch the flash pattern, tap the cards back in the same order. Chain grows every round. Three speed tiers, daily mode, free to play in browser.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((i) => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: { '@type': 'Answer', text: i.answer },
          })),
        }}
      />
    </main>
  );
}
