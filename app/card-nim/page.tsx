import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardNimClient from './CardNimClient';

export const metadata: Metadata = {
  title: 'Card Nim — Daily 21-Card Strategy Puzzle | CardVault',
  description: 'The classic 21-game adapted for sports card collectors. Take 1, 2, or 3 cards from a pile of 21. Whoever takes the last card loses. Out-think the AI and learn misère Nim strategy with real cards. Free daily puzzle.',
  openGraph: {
    title: 'Card Nim — CardVault',
    description: 'Take-the-last-card-loses. Pure game theory with real sports cards. Can you find the winning pattern?',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Nim — CardVault',
    description: 'The 21-game with real sports cards. Take 1, 2, or 3 — do not get stuck with the last one.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Nim' },
];

const faqItems = [
  {
    question: 'How do you play Card Nim?',
    answer: 'A pile of 21 real sports cards sits on the table. You and the AI alternate turns. On each turn, you must take 1, 2, or 3 cards from the top of the pile. Whoever is forced to take the LAST card loses. The AI goes first. Your job is to think several moves ahead so that the last card ends up in the AI\u2019s hand.',
  },
  {
    question: 'Why is this called "misère" Nim?',
    answer: 'Nim is a classical combinatorial game theory puzzle. The normal version (last-card-takes-wins) has a straightforward optimal strategy. The misère version (last-card-takes-loses) is the interesting one. The 21-stick version of misère Nim was featured in GCHQ puzzle books and is often the first game-theory problem taught in recreational math. Card Nim reskins it with real sports cards.',
  },
  {
    question: 'Is there a winning strategy?',
    answer: 'Yes. From any pile of size n, the player whose turn it is wants to leave the opponent with a pile whose size mod 4 equals 1 (so 1, 5, 9, 13, 17, 21). That forces the opponent into a losing position. If you cannot do that (because the pile mod 4 is already 1 when it becomes your turn), you are in the losing position and must hope your opponent makes a mistake. At pile size 21 with AI moving first, the AI is in a losing position \u2014 so if you play optimally, you should always win.',
  },
  {
    question: 'What are the difficulty levels?',
    answer: 'Easy: the AI plays completely random moves (1-3 cards each turn). Medium: the AI plays optimally about 70% of the time and otherwise random. Expert: the AI plays the optimal move every turn. Against Expert on a 21-pile the AI starts in a losing position, so correct play on your part always wins. Against Easy or Medium you can make mistakes and still recover.',
  },
  {
    question: 'What do the card values do?',
    answer: 'The cards you successfully collect are yours \u2014 the total estimated value of your stack is your "take." Win/loss is determined strictly by who grabs the final card, but a higher take feels more satisfying and stacks for your lifetime-total stat. Playing the low-value end of the pile is often the right call when you need to leave a specific count for the opponent.',
  },
  {
    question: 'Why is the pile 21?',
    answer: 'Twenty-one is iconic \u2014 it is the "21 game" taught in every combinatorial game-theory class. Also, 21 mod 4 equals 1, which makes whoever moves FIRST the player in the losing position. Because the AI goes first, the human starts in the winning position \u2014 giving you a fair fight with a path to a guaranteed victory if you think correctly.',
  },
];

export default function CardNimPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
          Card Nim
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          The classic 21-game. Take 1, 2, or 3 cards from the pile each turn. Whoever is forced to grab the last card LOSES. Out-think the AI with pure combinatorial game theory.
        </p>
        <p className="text-sm text-gray-500">
          Pile of 21 real sports cards • AI goes first • Misère Nim • Strategy taught in every game theory course
        </p>
      </header>

      <CardNimClient />

      <section className="mt-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <h2 className="text-2xl font-bold mb-4">The Math Behind Card Nim</h2>
        <div className="space-y-3 text-sm text-gray-800">
          <p>
            Call a pile "<strong>safe</strong>" if its size minus 1 is divisible by 4 — that is, sizes 1, 5, 9, 13, 17, 21. If you hand your opponent a safe pile, they are guaranteed to lose against perfect play.
          </p>
          <p>
            The 21-pile is itself safe, which is why the AI (moving first) starts in the losing seat. Whatever it takes (1, 2, or 3), the remaining pile (20, 19, or 18) is <strong>not</strong> safe. Your job: subtract enough to hand the AI another safe pile.
          </p>
          <p>
            The rule-of-thumb: <strong>if the opponent takes k, you take (4 − k)</strong>. AI takes 1 → you take 3. AI takes 2 → you take 2. AI takes 3 → you take 1. Repeat. Eventually the pile reaches 1 and the AI has to take it.
          </p>
          <p>
            This is the entire strategy. Once you internalize it, you should never lose an Expert match.
          </p>
          <p className="text-xs text-gray-600">
            Card collecting connection: the same &quot;parity counting&quot; logic applies when you commit to a grading-submission schedule, a set-build order, or deciding which card of a pair to flip first. Discipline of counting multiples pays.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Related</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/card-mastermind" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Card Mastermind</div>
            <div className="text-xs text-gray-600">Deduce a mystery card in 10 guesses</div>
          </Link>
          <Link href="/card-tower-climb" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Card Tower Climb</div>
            <div className="text-xs text-gray-600">Push-your-luck 10-floor ladder</div>
          </Link>
          <Link href="/card-dozen" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Card Dozen</div>
            <div className="text-xs text-gray-600">Pick the three worth the most</div>
          </Link>
          <Link href="/card-poker" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Card Poker</div>
            <div className="text-xs text-gray-600">Build 5-of-7 poker hands</div>
          </Link>
          <Link href="/card-briefcase" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">Card Briefcase</div>
            <div className="text-xs text-gray-600">Deal or no deal with cards</div>
          </Link>
          <Link href="/games" className="p-3 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition">
            <div className="font-semibold text-sm">All Games</div>
            <div className="text-xs text-gray-600">70+ card games and puzzles</div>
          </Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Card Nim',
          url: 'https://cardvault-two.vercel.app/card-nim',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Any',
          description:
            'Misère Nim strategy game with a pile of 21 real sports cards. Take 1-3 per turn; whoever takes the last card loses. AI plays Easy, Medium, or Expert. Free and playable in browser.',
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
