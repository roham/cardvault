'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ───── Card Pool (30 investment scenarios) ───── */
interface InvestmentCard {
  id: number;
  player: string;
  card: string;
  year: number;
  sport: string;
  currentPrice: string;
  priceNum: number;
  trend: 'up' | 'down' | 'stable';
  reason: string;
  verdict: 'grade' | 'fade';
  explanation: string;
}

const cardPool: InvestmentCard[] = [
  { id: 1, player: 'Victor Wembanyama', card: '2023 Prizm RC', year: 2023, sport: 'Basketball', currentPrice: '$800', priceNum: 800, trend: 'up', reason: 'Generational talent, 7-4 unicorn, ROY', verdict: 'grade', explanation: 'Wemby is a generational prospect. His Prizm RC is a long-term hold — the next decade of basketball belongs to him.' },
  { id: 2, player: 'Caleb Williams', card: '2024 Prizm RC', year: 2024, sport: 'Football', currentPrice: '$120', priceNum: 120, trend: 'stable', reason: 'Bears #1 pick, USC Heisman winner', verdict: 'grade', explanation: 'NFL QB1 picks historically hold value. Williams has weapons in Chicago (Allen, Odunze). Buy window is now before breakout season.' },
  { id: 3, player: 'Junk Wax Era Commons', card: '1989 Topps Baseball (any common)', year: 1989, sport: 'Baseball', currentPrice: '$0.05', priceNum: 0.05, trend: 'stable', reason: 'Billions printed, zero scarcity', verdict: 'fade', explanation: 'With millions of each card in existence, junk wax commons will never appreciate. The math is simple — zero scarcity means zero upside.' },
  { id: 4, player: 'Paul Skenes', card: '2024 Bowman Chrome 1st', year: 2024, sport: 'Baseball', currentPrice: '$350', priceNum: 350, trend: 'up', reason: 'Pirates ace, 100mph+, NL ROY', verdict: 'grade', explanation: 'Skenes has the best pitch arsenal in baseball. His Bowman Chrome 1st is THE baseball investment of 2024. Cy Young potential.' },
  { id: 5, player: 'Caitlin Clark', card: '2024 Prizm WNBA RC', year: 2024, sport: 'Basketball', currentPrice: '$200', priceNum: 200, trend: 'up', reason: 'WNBA viewership revolution, ROY', verdict: 'grade', explanation: 'Clark is transcending the sport — TV ratings and attendance records prove it. Her cards have mainstream crossover appeal that no WNBA player has had before.' },
  { id: 6, player: 'Bryce Young', card: '2023 Prizm RC', year: 2023, sport: 'Football', currentPrice: '$15', priceNum: 15, trend: 'down', reason: '#1 pick, benched as starter, 5-8 frame concerns', verdict: 'fade', explanation: 'Young was benched in his second year. At 5-10, 204 lbs, the NFL is proving too physical. His cards have already crashed 90% from peak — catch the falling knife.' },
  { id: 7, player: 'Connor Bedard', card: '2024 Upper Deck YG RC', year: 2024, sport: 'Hockey', currentPrice: '$200', priceNum: 200, trend: 'up', reason: 'Generational hockey talent, #1 pick', verdict: 'grade', explanation: 'Bedard is the most exciting NHL prospect since McDavid. His Young Guns RC is a long-term hold — the Blackhawks rebuild is centered on him.' },
  { id: 8, player: 'Random Base Card', card: '2024 Topps Series 1 Common', year: 2024, sport: 'Baseball', currentPrice: '$0.25', priceNum: 0.25, trend: 'stable', reason: 'Modern base common, high print run', verdict: 'fade', explanation: 'Modern base cards are printed in quantities that prevent appreciation. Only numbered parallels, autographs, and key rookies hold value.' },
  { id: 9, player: 'Shohei Ohtani', card: '2018 Topps Update RC', year: 2018, sport: 'Baseball', currentPrice: '$300', priceNum: 300, trend: 'stable', reason: 'Two-way legend, Dodgers, $700M contract', verdict: 'grade', explanation: 'Ohtani is a once-in-a-century player. His flagship RC is already proven — it survived the gambling scandal and recovered. Blue chip.' },
  { id: 10, player: 'Jasson Dominguez', card: '2020 Bowman Chrome 1st', year: 2020, sport: 'Baseball', currentPrice: '$80', priceNum: 80, trend: 'down', reason: 'Yankees prospect, "The Martian", TJ surgery', verdict: 'fade', explanation: 'Dominguez was overhyped as a teenager. Tommy John surgery, slow development, and competition for playing time make this a risky hold at current prices.' },
  { id: 11, player: 'Luka Doncic', card: '2018 Prizm RC', year: 2018, sport: 'Basketball', currentPrice: '$400', priceNum: 400, trend: 'stable', reason: 'Generational talent, MVP candidate', verdict: 'grade', explanation: 'Luka is a top-5 NBA player and perennial MVP candidate. His Prizm RC is a pillar of any modern basketball card portfolio. Hold forever.' },
  { id: 12, player: 'Any PSA 9 (when PSA 10 exists)', card: 'Generic PSA 9 modern card', year: 2020, sport: 'Baseball', currentPrice: '$50', priceNum: 50, trend: 'down', reason: 'PSA 10s dominate value, 9s depreciate', verdict: 'fade', explanation: 'For modern cards, PSA 9 is becoming a consolation prize. The gap between PSA 9 and PSA 10 values grows every year. Either buy 10s or buy raw.' },
  { id: 13, player: 'Jayden Daniels', card: '2024 Prizm RC', year: 2024, sport: 'Football', currentPrice: '$150', priceNum: 150, trend: 'up', reason: 'Commanders QB, Heisman winner, ROY', verdict: 'grade', explanation: 'Daniels had one of the best rookie QB seasons in NFL history. Washington finally has their franchise QB. His Prizm RC is a strong buy at current levels.' },
  { id: 14, player: '1952 Topps Mickey Mantle #311', card: 'PSA 4', year: 1952, sport: 'Baseball', currentPrice: '$150,000', priceNum: 150000, trend: 'up', reason: 'The holy grail, only appreciates', verdict: 'grade', explanation: 'The 1952 Topps Mantle is the most iconic card in the hobby. Every grade from PSA 1 to PSA 9 has appreciated over every 5-year period in history. The definition of blue chip.' },
  { id: 15, player: 'Panini Hoops Base Cards', card: '2023 Hoops non-RC base', year: 2023, sport: 'Basketball', currentPrice: '$0.10', priceNum: 0.10, trend: 'stable', reason: 'Low-end product, infinite supply', verdict: 'fade', explanation: 'Hoops is the entry-level basketball product. Non-rookie base cards are essentially worthless. Only rookie cards from key players have any value.' },
  { id: 16, player: 'Mike Trout', card: '2011 Topps Update RC', year: 2011, sport: 'Baseball', currentPrice: '$150', priceNum: 150, trend: 'down', reason: 'Injuries derailing career, aging', verdict: 'fade', explanation: 'Trout is the best player of his generation, but injuries have limited him to under 100 games in 3 of the last 4 years. His flagship RC has declined from $500+ peak. Risk/reward is unfavorable.' },
  { id: 17, player: 'Matvei Michkov', card: '2024 Upper Deck YG RC', year: 2024, sport: 'Hockey', currentPrice: '$100', priceNum: 100, trend: 'up', reason: 'Flyers phenom, Russian sniper, dynamic scorer', verdict: 'grade', explanation: 'Michkov is the most exciting young scorer in the NHL. His creativity and goal-scoring ability have drawn comparisons to Ovechkin. Philadelphia has a star.' },
  { id: 18, player: 'Unopened Junk Wax Box', card: '1991 Score Baseball Factory Sealed', year: 1991, sport: 'Baseball', currentPrice: '$20', priceNum: 20, trend: 'stable', reason: 'Nostalgia appeal, but poor EV', verdict: 'fade', explanation: 'Opening junk wax is fun for nostalgia, but the expected value is near zero. If you buy for fun, great. As an investment, you will lose money every single time.' },
  { id: 19, player: 'Anthony Edwards', card: '2020 Prizm RC', year: 2020, sport: 'Basketball', currentPrice: '$250', priceNum: 250, trend: 'up', reason: 'Wolves star, All-NBA, marketable personality', verdict: 'grade', explanation: 'Ant-Man is the face of the next generation of NBA stars. His combination of talent, charisma, and marketability makes his Prizm RC a must-own for basketball collectors.' },
  { id: 20, player: 'Numbered Parallel /999', card: 'Generic /999 parallel (non-star)', year: 2023, sport: 'Football', currentPrice: '$3', priceNum: 3, trend: 'stable', reason: '/999 is too high for scarcity premium', verdict: 'fade', explanation: 'For parallels to hold value, the print run needs to be /99 or lower. /999 parallels of non-star players are functionally the same as base cards. Save your money for lower-numbered parallels of key players.' },
];

function getDailyCards(count: number): InvestmentCard[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const shuffled = [...cardPool];
  let m = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    m = (m * 1103515245 + 12345) & 0x7fffffff;
    const j = m % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

const trendIcon: Record<string, string> = { up: '↑', down: '↓', stable: '→' };
const trendColor: Record<string, string> = { up: 'text-emerald-400', down: 'text-red-400', stable: 'text-gray-400' };

export default function GradeOrFade() {
  const dailyCards = useMemo(() => getDailyCards(10), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<('grade' | 'fade')[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);

  const currentCard = dailyCards[currentIndex];
  const isComplete = currentIndex >= dailyCards.length;

  const score = useMemo(() => {
    let correct = 0;
    choices.forEach((choice, i) => {
      if (choice === dailyCards[i].verdict) correct++;
    });
    return correct;
  }, [choices, dailyCards]);

  const grade = useMemo(() => {
    if (score >= 9) return { letter: 'S', title: 'Card Shark', color: 'text-amber-400' };
    if (score >= 8) return { letter: 'A', title: 'Sharp Eye', color: 'text-emerald-400' };
    if (score >= 6) return { letter: 'B', title: 'Decent Reads', color: 'text-blue-400' };
    if (score >= 4) return { letter: 'C', title: 'Average Collector', color: 'text-gray-400' };
    return { letter: 'D', title: 'Needs Research', color: 'text-red-400' };
  }, [score]);

  const handleChoice = useCallback((choice: 'grade' | 'fade') => {
    setAnimDir(choice === 'grade' ? 'right' : 'left');
    setChoices(prev => [...prev, choice]);
    setShowResult(true);
    setTimeout(() => {
      setShowResult(false);
      setAnimDir(null);
      setCurrentIndex(prev => prev + 1);
    }, 2500);
  }, []);

  const shareText = useMemo(() => {
    const emoji = choices.map((c, i) => c === dailyCards[i].verdict ? '✅' : '❌').join('');
    return `Grade or Fade ${score}/10 ${grade.letter}\n${emoji}\nhttps://cardvault-two.vercel.app/grade-or-fade`;
  }, [choices, dailyCards, score, grade]);

  if (isComplete) {
    return (
      <div className="space-y-8">
        {/* Final Score */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Your Score</p>
          <div className={`text-7xl font-black ${grade.color} mb-2`}>{grade.letter}</div>
          <p className="text-xl font-bold text-white mb-1">{score}/10 Correct</p>
          <p className={`text-sm ${grade.color}`}>{grade.title}</p>
        </div>

        {/* Results Grid */}
        <div className="space-y-3">
          {dailyCards.map((card, i) => {
            const correct = choices[i] === card.verdict;
            return (
              <div key={card.id} className={`border rounded-xl p-4 ${correct ? 'border-emerald-700/50 bg-emerald-950/20' : 'border-red-700/50 bg-red-950/20'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-medium">{card.player}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${choices[i] === 'grade' ? 'bg-emerald-800/50 text-emerald-300' : 'bg-red-800/50 text-red-300'}`}>
                      You: {choices[i] === 'grade' ? 'GRADE' : 'FADE'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${card.verdict === 'grade' ? 'bg-emerald-800/50 text-emerald-300' : 'bg-red-800/50 text-red-300'}`}>
                      Answer: {card.verdict === 'grade' ? 'GRADE' : 'FADE'}
                    </span>
                    <span>{correct ? '✅' : '❌'}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs">{card.explanation}</p>
              </div>
            );
          })}
        </div>

        {/* Share */}
        <div className="flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(shareText)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Copy Results
          </button>
          <Link href="/tools" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors text-center">
            More Tools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{currentIndex + 1} of {dailyCards.length}</span>
        <div className="flex gap-1">
          {dailyCards.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i < choices.length
                  ? choices[i] === dailyCards[i].verdict ? 'bg-emerald-500' : 'bg-red-500'
                  : i === currentIndex ? 'bg-white' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Card */}
      {currentCard && (
        <div className={`bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 transition-transform duration-300 ${
          animDir === 'right' ? 'translate-x-[120%] opacity-0' : animDir === 'left' ? '-translate-x-[120%] opacity-0' : ''
        }`}>
          <div className="text-center mb-6">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{currentCard.sport} &middot; {currentCard.year}</span>
            <h3 className="text-2xl font-bold text-white mt-1">{currentCard.player}</h3>
            <p className="text-gray-400 text-sm">{currentCard.card}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="text-white font-semibold">{currentCard.currentPrice}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Trend</p>
              <p className={`font-semibold ${trendColor[currentCard.trend]}`}>{trendIcon[currentCard.trend]} {currentCard.trend}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">Sport</p>
              <p className="text-white font-semibold text-sm">{currentCard.sport}</p>
            </div>
          </div>

          <div className="bg-gray-900/30 rounded-xl p-4 mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">{currentCard.reason}</p>
          </div>

          {/* Result Overlay */}
          {showResult && (
            <div className={`rounded-xl p-4 mb-4 ${
              choices[choices.length - 1] === currentCard.verdict
                ? 'bg-emerald-950/60 border border-emerald-700/50'
                : 'bg-red-950/60 border border-red-700/50'
            }`}>
              <p className={`text-sm font-semibold mb-1 ${
                choices[choices.length - 1] === currentCard.verdict ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {choices[choices.length - 1] === currentCard.verdict ? '✅ Correct!' : '❌ Wrong!'}
                {' '}The answer is {currentCard.verdict === 'grade' ? 'GRADE' : 'FADE'}.
              </p>
              <p className="text-gray-400 text-xs">{currentCard.explanation}</p>
            </div>
          )}

          {/* Buttons */}
          {!showResult && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleChoice('fade')}
                className="bg-red-600/80 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                ← FADE
              </button>
              <button
                onClick={() => handleChoice('grade')}
                className="bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                GRADE →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
