import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Card Games — 50+ Free Card Collecting Games & Challenges | CardVault',
  description: 'Play 50+ free card collecting games: trivia, puzzles, drafts, trading sims, pack battles, and daily challenges. All using real sports card data from 8,000+ cards.',
  openGraph: {
    title: 'Card Games — 50+ Free Card Collecting Games | CardVault',
    description: '50+ free card collecting games: trivia, puzzles, drafts, market sims, daily challenges. Real sports card data.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Games — CardVault',
    description: '50+ free card games using real sports card data. Trivia, drafts, trading sims, puzzles, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games' },
];

interface GameLink {
  href: string;
  name: string;
  desc: string;
  daily?: boolean;
}

const categories: { title: string; icon: string; color: string; games: GameLink[] }[] = [
  {
    title: 'Daily Challenges',
    icon: '📅',
    color: 'from-amber-900/40 to-amber-800/20 border-amber-700/30',
    games: [
      { href: '/daily-challenges', name: 'Daily Challenges', desc: 'Complete 3 daily challenges for XP and streaks', daily: true },
      { href: '/card-of-the-day', name: 'Card of the Day', desc: 'New featured card every day with trivia', daily: true },
      { href: '/flip-or-keep', name: 'Flip or Keep', desc: 'See 10 cards, flip for cash or keep collecting', daily: true },
      { href: '/rip-or-skip', name: 'Rip or Skip', desc: 'Vote to open or pass on sealed products', daily: true },
      { href: '/card-this-or-that', name: 'This or That', desc: 'Would you rather? Reveals your collector type', daily: true },
      { href: '/card-power-rankings', name: 'Power Rankings', desc: 'Top 25 hottest cards this week', daily: true },
      { href: '/card-bingo', name: 'Card Bingo', desc: 'Daily 5x5 collecting challenge board', daily: true },
      { href: '/bingo', name: 'Collector Bingo', desc: 'Daily bingo card with collecting challenges', daily: true },
    ],
  },
  {
    title: 'Trivia & Knowledge',
    icon: '🧠',
    color: 'from-purple-900/40 to-purple-800/20 border-purple-700/30',
    games: [
      { href: '/trivia', name: 'Daily Trivia', desc: '5 daily questions with 10-second timer', daily: true },
      { href: '/card-trivia', name: 'Trivia Challenge', desc: '40 questions across 6 categories' },
      { href: '/card-jeopardy', name: 'Card Jeopardy', desc: '6 categories, Daily Doubles, Final Jeopardy' },
      { href: '/card-speed-quiz', name: 'Speed Quiz', desc: 'Name that player against the clock' },
      { href: '/guess-the-card', name: 'Guess the Card', desc: 'Wordle-style daily card puzzle — 6 tries' },
      { href: '/card-detective', name: 'Card Detective', desc: 'Identify mystery cards from progressive clues' },
      { href: '/card-connections', name: 'Card Connections', desc: 'Link two players through shared attributes' },
      { href: '/card-timeline', name: 'Card Timeline', desc: 'Sort 7 cards in chronological order' },
      { href: '/card-typing', name: 'Card Typing', desc: 'Speed typing game with player names' },
      { href: '/card-wordle', name: 'Card Wordle', desc: 'Guess mystery player in 6 tries with clues' },
      { href: '/card-lingo', name: 'Card Lingo Quiz', desc: 'Test your hobby vocabulary — 60+ terms' },
      { href: '/card-plinko', name: 'Card Plinko', desc: 'Drop cards through pegs — hit the 5x jackpot' },
      { href: '/card-chain', name: 'Card Chain', desc: 'Build longest chain — each card connects to the last' },
    ],
  },
  {
    title: 'Value & Pricing',
    icon: '💰',
    color: 'from-emerald-900/40 to-emerald-800/20 border-emerald-700/30',
    games: [
      { href: '/card-price-is-right', name: 'Price is Right', desc: 'Guess the exact card value' },
      { href: '/price-is-right', name: 'Classic Price Game', desc: 'How well do you know card values?' },
      { href: '/card-value-snap', name: 'Value Snap', desc: 'Tap the more valuable card — fast!' },
      { href: '/card-ladder', name: 'Card Ladder', desc: 'Higher or lower card value game' },
      { href: '/card-streak', name: 'Card Streak', desc: 'Guess if the next card is worth more or less' },
      { href: '/price-blitz', name: 'Price Blitz', desc: '20 cards in 60 seconds — over or under?' },
      { href: '/card-war', name: 'Card War', desc: 'Two cards drawn, pick the more valuable one' },
      { href: '/card-stack', name: 'Card Stack', desc: 'Build a 5-card stack that totals exactly $500' },
      { href: '/card-gauntlet', name: 'Card Gauntlet', desc: 'Endless survival — pick the pricier card, 3 lives' },
      { href: '/card-top-trumps', name: 'Card Top Trumps', desc: 'Pick your best stat to beat the CPU — 10 rounds' },
    ],
  },
  {
    title: 'Market & Trading',
    icon: '📈',
    color: 'from-blue-900/40 to-blue-800/20 border-blue-700/30',
    games: [
      { href: '/card-tycoon', name: 'Card Tycoon', desc: 'Buy low, sell high — card market simulator' },
      { href: '/card-market-simulator', name: 'Market Simulator', desc: 'Trade cards like stocks with $10K' },
      { href: '/trading-sim', name: 'Trading Sim', desc: 'Buy and sell over 7 simulated days' },
      { href: '/card-dealer', name: 'Card Dealer', desc: 'Run your own card shop for a day' },
      { href: '/hot-potato', name: 'Hot Potato', desc: 'Sell before the price crashes!' },
      { href: '/card-auction', name: 'Card Auction', desc: 'Bid on cards against 3 AI collectors' },
      { href: '/card-catalysts', name: 'Price Catalysts', desc: 'Track events that move card values' },
      { href: '/card-thrift', name: 'Card Thrift Store', desc: 'Dig a bargain bin — pick 10 of 20 cards blind' },
      { href: '/card-pairs', name: 'Card Pair Trader', desc: 'Pick 2 of 4 cards closest to a target value' },
    ],
  },
  {
    title: 'Strategy & Draft',
    icon: '♟️',
    color: 'from-red-900/40 to-red-800/20 border-red-700/30',
    games: [
      { href: '/card-draft', name: 'Card Draft', desc: 'Snake draft vs 3 AI opponents' },
      { href: '/card-clash', name: 'Card Clash', desc: 'Head-to-head draft battle' },
      { href: '/card-triad', name: 'Card Triad', desc: '3×3 grid battle — capture with higher edges' },
      { href: '/card-bracket', name: 'Card Bracket', desc: '16-card single elimination tournament' },
      { href: '/card-battle', name: 'Card Battles', desc: 'Stat-based card combat' },
      { href: '/mock-draft', name: 'Mock Draft', desc: 'Be the GM — build your rookie card portfolio' },
      { href: '/card-keeper', name: 'Card Keeper', desc: 'Cards fly by — 4 seconds to keep or pass' },
      { href: '/card-set-rush', name: 'Set Rush', desc: '60-second set-building challenge' },
    ],
  },
  {
    title: 'Casino & Luck',
    icon: '🎰',
    color: 'from-yellow-900/40 to-yellow-800/20 border-yellow-700/30',
    games: [
      { href: '/card-slots', name: 'Card Slots', desc: 'Daily slot machine with card reels' },
      { href: '/card-blackjack', name: 'Card Blackjack', desc: 'Hit 21 using real sports card values' },
      { href: '/card-roulette', name: 'Card Roulette', desc: 'Quick-fire buy or pass game' },
      { href: '/card-yahtzee', name: 'Card Yahtzee', desc: 'Roll 5 cards, score the best hand' },
      { href: '/card-poker', name: 'Card Poker', desc: 'Deal 7, keep 5, form the best poker hand — chase the Royal Flush' },
      { href: '/card-snake', name: 'Card Snake', desc: 'Collect cards to grow your snake' },
      { href: '/break-bingo', name: 'Break Bingo', desc: 'Bingo meets card breaks — watch pulls, call BINGO!' },
    ],
  },
  {
    title: 'Puzzles',
    icon: '🧩',
    color: 'from-cyan-900/40 to-cyan-800/20 border-cyan-700/30',
    games: [
      { href: '/card-crossword', name: 'Card Crossword', desc: 'Daily mini crossword with hobby clues' },
      { href: '/card-scramble', name: 'Card Scramble', desc: 'Unscramble card hobby words' },
      { href: '/card-hangman', name: 'Card Hangman', desc: 'Guess the mystery player name' },
      { href: '/word-search', name: 'Word Search', desc: 'Find hidden collecting words daily' },
      { href: '/card-sudoku', name: 'Card Sudoku', desc: 'Logic puzzle with sports card themes' },
      { href: '/card-minesweeper', name: 'Card Minesweeper', desc: 'Find hit cards without clicking duds' },
      { href: '/card-memory', name: 'Card Memory', desc: 'Flip and match card pairs' },
      { href: '/memory-match', name: 'Memory Match', desc: 'Match 8 pairs on a 4x4 grid' },
      { href: '/card-grid', name: 'Card Grid', desc: 'Immaculate Grid — match row + column criteria', daily: true },
      { href: '/card-treasure-map', name: 'Card Treasure Map', desc: 'Find the hidden treasure card on a 7x7 grid', daily: true },
      { href: '/card-dig', name: 'Card Dig', desc: 'Excavate 6 buried cards from dirt, clay, and rock', daily: true },
    ],
  },
  {
    title: 'Pack Opening',
    icon: '📦',
    color: 'from-pink-900/40 to-pink-800/20 border-pink-700/30',
    games: [
      { href: '/pack-battle', name: 'Pack Battle', desc: 'Compare two products head-to-head' },
      { href: '/pack-race', name: 'Pack Race', desc: 'Race 3 AI collectors to pull the best pack' },
    ],
  },
];

const totalGames = categories.reduce((sum, cat) => sum + cat.games.length, 0);

const faqItems = [
  {
    question: 'Are all card games free?',
    answer: 'Yes! Every game on CardVault is completely free to play with no account required. All games use real data from our database of 8,000+ sports cards.',
  },
  {
    question: 'Do the games use real card data?',
    answer: 'Yes. Every game pulls from our database of 8,000+ real sports cards across baseball, basketball, football, and hockey. Card values, player stats, and set information are all based on actual market data.',
  },
  {
    question: 'Which games have daily challenges?',
    answer: 'Many games offer a Daily mode where every player sees the same board, cards, or questions — perfect for comparing scores with friends. Look for the "Daily" badge on games. Popular daily games include Guess the Card, Daily Trivia, Flip or Keep, and Card Jeopardy.',
  },
  {
    question: 'Do my scores save?',
    answer: 'Yes. All game statistics — scores, streaks, win rates, and history — save automatically to your browser\'s local storage. Your progress is preserved between visits on the same device.',
  },
  {
    question: 'What categories of games are available?',
    answer: 'We have 8 categories: Daily Challenges (daily tasks and votes), Trivia & Knowledge (quiz games), Value & Pricing (guess card values), Market & Trading (buy/sell simulations), Strategy & Draft (competitive drafts), Casino & Luck (slots, blackjack, roulette), Puzzles (crosswords, word search, sudoku), and Pack Opening (pack comparison games).',
  },
];

export default function GamesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Card Collecting Games — 50+ Free Games',
        description: 'Play 50+ free card collecting games using real sports card data. Trivia, puzzles, drafts, trading simulations, and daily challenges.',
        url: 'https://cardvault-two.vercel.app/games',
        numberOfItems: totalGames,
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          {totalGames} Games &middot; All Free &middot; Real Card Data
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Collecting Games
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          50+ free games built on real data from 8,000+ sports cards. Test your knowledge, trade like a pro, draft against AI, and compete on daily leaderboards.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalGames}</div>
          <div className="text-xs text-zinc-500">Total Games</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{categories.length}</div>
          <div className="text-xs text-zinc-500">Categories</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{categories.reduce((s, c) => s + c.games.filter(g => g.daily).length, 0)}</div>
          <div className="text-xs text-zinc-500">Daily Modes</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">8,400+</div>
          <div className="text-xs text-zinc-500">Real Cards Used</div>
        </div>
      </div>

      {/* Game categories */}
      <div className="space-y-8">
        {categories.map(cat => (
          <section key={cat.title}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.title}
              <span className="text-xs font-normal text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{cat.games.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.games.map(game => (
                <Link
                  key={game.href}
                  href={game.href}
                  className={`bg-gradient-to-br ${cat.color} border rounded-xl p-4 hover:scale-[1.02] transition-transform group`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                      {game.name}
                    </h3>
                    {game.daily && (
                      <span className="text-[10px] font-medium bg-amber-900/60 text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">
                        Daily
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{game.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Related tools */}
      <div className="mt-12 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-3">Collector Tools</h2>
        <p className="text-zinc-400 text-sm mb-4">Prefer tools over games? We have 100+ interactive tools for grading, pricing, and collecting.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools', label: 'All Tools', desc: '100+ collector tools' },
            { href: '/tools/pack-sim', label: 'Pack Simulator', desc: 'Open virtual packs' },
            { href: '/tools/grading-roi', label: 'Grading ROI', desc: 'Is grading worth it?' },
            { href: '/tools/portfolio', label: 'Fantasy Portfolio', desc: 'Draft 5 cards, compete' },
            { href: '/weekly-challenge', label: 'Weekly Challenge', desc: 'Weekly card draft contest' },
            { href: '/leaderboard', label: 'Leaderboards', desc: 'Global rankings' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="bg-zinc-800/60 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600/50 transition-colors">
              <p className="text-white text-sm font-medium">{l.label}</p>
              <p className="text-zinc-500 text-xs">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-10 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-zinc-900/80 border border-zinc-800 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-200 hover:text-white flex items-center justify-between">
                {f.question}
                <span className="text-zinc-600 group-open:rotate-180 transition-transform">&#x25BC;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
