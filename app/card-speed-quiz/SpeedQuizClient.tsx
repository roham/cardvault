'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
interface QuizCard {
  year: number;
  set: string;
  sport: string;
  cardNumber: string;
  hint: string;
  correctPlayer: string;
  options: string[];
}

interface RoundResult {
  card: QuizCard;
  correct: boolean;
  answer: string | null;
  timeMs: number;
  points: number;
}

type GameState = 'ready' | 'playing' | 'answering' | 'reveal' | 'done';

// ── Seeded RNG ─────────────────────────────────────────────────────────────
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getDaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Card Pool ──────────────────────────────────────────────────────────────
// Curated set of 60 well-known cards for the quiz
const CARD_POOL: Omit<QuizCard, 'options'>[] = [
  { year: 2018, set: 'Topps Update', sport: 'baseball', cardNumber: 'US1', hint: 'Two-way superstar from Japan who pitches AND hits. Won MVP with the Angels before signing the richest contract in sports history.', correctPlayer: 'Shohei Ohtani' },
  { year: 2011, set: 'Topps Update', sport: 'baseball', cardNumber: 'US175', hint: 'The Millville Meteor. Three-time MVP. Many consider him the best player of his generation despite injuries. Angels franchise player.', correctPlayer: 'Mike Trout' },
  { year: 2023, set: 'Panini Prizm', sport: 'basketball', cardNumber: '275', hint: '7-foot-4 French phenom drafted #1 overall by the Spurs. Already drawing comparisons to KD and KG. Alien-like wingspan.', correctPlayer: 'Victor Wembanyama' },
  { year: 2018, set: 'Panini Prizm', sport: 'basketball', cardNumber: '280', hint: 'Slovenian wonderkid who became the youngest player to average a triple-double. Known for step-back threes and clutch performances.', correctPlayer: 'Luka Doncic' },
  { year: 2017, set: 'Panini Prizm', sport: 'football', cardNumber: '269', hint: 'Texas Tech gunslinger who fell to pick 10 and then won three Super Bowls in his first seven seasons. The next great dynasty QB.', correctPlayer: 'Patrick Mahomes' },
  { year: 2015, set: 'Upper Deck Young Guns', sport: 'hockey', cardNumber: '201', hint: 'Edmonton Oilers captain and widely considered the best hockey player in the world. Wears #97 and has incredible speed.', correctPlayer: 'Connor McDavid' },
  { year: 2003, set: 'Topps Chrome', sport: 'basketball', cardNumber: '111', hint: 'The King from Akron. Four MVPs, four championships across three teams. All-time NBA scoring leader. Still playing past 40.', correctPlayer: 'LeBron James' },
  { year: 1989, set: 'Upper Deck', sport: 'baseball', cardNumber: '1', hint: 'The Kid. Sweetest swing in baseball history. 630 home runs. Iconic backwards cap. Seattle and Cincinnati legend.', correctPlayer: 'Ken Griffey Jr.' },
  { year: 1986, set: 'Fleer', sport: 'basketball', cardNumber: '57', hint: 'His Airness. Six championships, six Finals MVPs. The GOAT debate starts and ends with this Chicago Bulls legend. Tongue out.', correctPlayer: 'Michael Jordan' },
  { year: 2020, set: 'Panini Prizm', sport: 'football', cardNumber: '325', hint: 'LSU product who won the national championship and Heisman before being drafted #1 by the Bengals. Led them to a Super Bowl in year two.', correctPlayer: 'Joe Burrow' },
  { year: 2018, set: 'Panini Prizm', sport: 'football', cardNumber: '205', hint: 'Wyoming product known for his cannon arm and hurdling defenders. Bills franchise QB who runs the most electric offense in the AFC East.', correctPlayer: 'Josh Allen' },
  { year: 2019, set: 'Panini Prizm', sport: 'basketball', cardNumber: '248', hint: 'Athletic freak from Murray State who dunks on everyone. Memphis point guard known for flashy plays — and some off-court controversy.', correctPlayer: 'Ja Morant' },
  { year: 2024, set: 'Panini Prizm', sport: 'basketball', cardNumber: 'CC1', hint: 'Iowa Hawkeyes legend who broke the all-time NCAA scoring record. Drafted by the Indiana Fever and electrified the WNBA.', correctPlayer: 'Caitlin Clark' },
  { year: 2017, set: 'Panini Prizm', sport: 'basketball', cardNumber: '16', hint: 'Greek Freak. MVP and NBA champion with the Bucks. Came to the NBA as a raw 18-year-old from Greece and became a dominant force.', correctPlayer: 'Giannis Antetokounmpo' },
  { year: 2022, set: 'Topps Chrome', sport: 'baseball', cardNumber: '150', hint: 'Orioles shortstop who hits moonshot home runs at age 23. Already an MVP contender. Best power-hitting SS since A-Rod.', correctPlayer: 'Gunnar Henderson' },
  { year: 2023, set: 'Panini Prizm', sport: 'football', cardNumber: '301', hint: 'Ohio State product who led the Texans to the playoffs as a rookie. Surprisingly accurate for a first-year QB. Cool under pressure.', correctPlayer: 'CJ Stroud' },
  { year: 2022, set: 'Topps Chrome', sport: 'baseball', cardNumber: '200', hint: 'Royals shortstop and son of a former MLB player. Won a Gold Glove and Silver Slugger in the same year. Five-tool talent.', correctPlayer: 'Bobby Witt Jr.' },
  { year: 2020, set: 'Panini Prizm', sport: 'basketball', cardNumber: '258', hint: 'First overall pick by the Timberwolves who became the face of the franchise. Known for highlight dunks and being the next face of the NBA.', correctPlayer: 'Anthony Edwards' },
  { year: 2023, set: 'Upper Deck Young Guns', sport: 'hockey', cardNumber: '451', hint: 'First overall pick by the Blackhawks in 2023. The most hyped hockey prospect since McDavid. Canadian prodigy.', correctPlayer: 'Connor Bedard' },
  { year: 2015, set: 'Panini Prizm', sport: 'basketball', cardNumber: '335', hint: 'Second-round pick from Serbia who became a triple-double machine and 3x MVP in Denver. The best passing big man ever.', correctPlayer: 'Nikola Jokic' },
  { year: 1952, set: 'Topps', sport: 'baseball', cardNumber: '311', hint: 'The Yankee Clipper. 56-game hitting streak. Won 13 World Series. Married Marilyn Monroe. His 1952 Topps is a holy grail.', correctPlayer: 'Mickey Mantle' },
  { year: 2022, set: 'Topps Chrome', sport: 'baseball', cardNumber: '220', hint: 'Reds speedster from the Dominican Republic. Stole 67 bases as a 22-year-old. Power and speed combination unlike anyone in baseball.', correctPlayer: 'Elly De La Cruz' },
  { year: 2024, set: 'Panini Prizm', sport: 'football', cardNumber: '301', hint: 'LSU product selected #2 overall by Washington. Dual-threat QB who won Offensive Rookie of the Year. Heisman winner.', correctPlayer: 'Jayden Daniels' },
  { year: 2024, set: 'Panini Prizm', sport: 'football', cardNumber: '302', hint: 'USC product taken #1 overall by the Bears. Highly touted since high school. Gunslinger with a rocket arm. Very marketable.', correctPlayer: 'Caleb Williams' },
  { year: 2018, set: 'Panini Prizm', sport: 'football', cardNumber: '212', hint: 'Louisville product who won back-to-back NFL MVPs. The most electric runner at QB since Vick. Ravens franchise player.', correctPlayer: 'Lamar Jackson' },
  { year: 1993, set: 'SP', sport: 'baseball', cardNumber: '279', hint: 'The Captain. Five championships as Yankees shortstop. Mr. November. 3,000+ hits. One of the most clutch players ever.', correctPlayer: 'Derek Jeter' },
  { year: 2019, set: 'Upper Deck Young Guns', sport: 'hockey', cardNumber: '201', hint: 'Colorado Avalanche defenseman who won a Norris Trophy before age 24. Skates like a forward. Led the Avs to a Cup.', correctPlayer: 'Cale Makar' },
  { year: 2016, set: 'Panini Prizm', sport: 'basketball', cardNumber: '1', hint: 'Duke product, first overall pick. Won a championship and Finals MVP with the Celtics. Known for incredible two-way play.', correctPlayer: 'Jayson Tatum' },
  { year: 2022, set: 'Topps Chrome', sport: 'baseball', cardNumber: '1', hint: 'Dominican outfielder for the Braves who won MVP in 2023. Tore his ACL in 2024 but his rookie cards are still premium. Full name is Ronald.', correctPlayer: 'Ronald Acuna Jr.' },
  { year: 2024, set: 'Bowman Chrome', sport: 'baseball', cardNumber: '1', hint: 'Pirates right-hander who throws 100mph with a devastating slider. Won NL Rookie of the Year. Was #1 pick in 2023 MLB Draft.', correctPlayer: 'Paul Skenes' },
  { year: 1979, set: 'O-Pee-Chee', sport: 'hockey', cardNumber: '18', hint: 'The Great One. 894 goals and 2,857 points — both records that may never be broken. Played mostly for Edmonton and LA.', correctPlayer: 'Wayne Gretzky' },
  { year: 2023, set: 'Topps Chrome', sport: 'baseball', cardNumber: '1', hint: 'Mariners outfielder drafted #5 overall. Son of a legend. Electric tools — 40/40 potential. Still very young and developing.', correctPlayer: 'Julio Rodriguez' },
  { year: 2018, set: 'Panini Prizm', sport: 'basketball', cardNumber: '184', hint: 'Oklahoma City Thunder point guard from Canada. Silky smooth mid-range game and elite defense. Perennial MVP candidate.', correctPlayer: 'Shai Gilgeous-Alexander' },
  { year: 1996, set: 'Topps Chrome', sport: 'basketball', cardNumber: '138', hint: 'Black Mamba. Five championships with the Lakers. 81-point game. 60 points in his final game. Mamba Mentality.', correctPlayer: 'Kobe Bryant' },
  { year: 2020, set: 'Panini Prizm', sport: 'football', cardNumber: '332', hint: 'Alabama product taken #6 by the Chargers. Pro Bowl arm talent with a 6-6 frame. Needs a playoff run to fully validate.', correctPlayer: 'Justin Herbert' },
  { year: 2025, set: 'Bowman University', sport: 'football', cardNumber: 'CW1', hint: 'Miami QB and Heisman finalist who transferred from Washington State. Consensus #1 pick in 2025 NFL Draft. Name rhymes with "jam".', correctPlayer: 'Cam Ward' },
  { year: 2024, set: 'Upper Deck Young Guns', sport: 'hockey', cardNumber: '201', hint: '#1 overall pick in 2024 by the San Jose Sharks. Canadian prospect who dominated college hockey at Boston University.', correctPlayer: 'Macklin Celebrini' },
  { year: 2017, set: 'Panini Prizm', sport: 'basketball', cardNumber: '24', hint: 'Kentucky product drafted #5 by the Sacramento Kings. The fastest player in the NBA. Led Sacramento back to the playoffs after 16 years.', correctPlayer: "De'Aaron Fox" },
  { year: 2025, set: 'Panini Prizm Draft', sport: 'basketball', cardNumber: 'CF1', hint: 'Duke freshman projected as the #1 pick in the 2025 NBA Draft. Versatile forward who can do everything. Name sounds patriotic.', correctPlayer: 'Cooper Flagg' },
  { year: 2025, set: '2025 Topps Series 1', sport: 'baseball', cardNumber: 'RS1', hint: 'Japanese pitching phenom who signed with the Dodgers. Threw a perfect game in the NPB. Throws 102mph. Joins Ohtani in LA.', correctPlayer: 'Roki Sasaki' },
];

// All unique players for generating wrong answers
const ALL_PLAYERS = [...new Set(CARD_POOL.map(c => c.correctPlayer))];

const ROUNDS = 15;
const TIME_LIMIT_MS = 10000;

// ── Generate daily quiz ────────────────────────────────────────────────────
function generateDailyQuiz(): QuizCard[] {
  const rand = seededRandom(getDaySeed());
  const selected = shuffle(CARD_POOL, rand).slice(0, ROUNDS);

  return selected.map(card => {
    // Pick 3 wrong answers from other players (same sport preferred)
    const sameSport = ALL_PLAYERS.filter(p => p !== card.correctPlayer);
    const shuffledWrong = shuffle(sameSport, rand);
    const wrongAnswers = shuffledWrong.slice(0, 3);
    const options = shuffle([card.correctPlayer, ...wrongAnswers], rand);

    return { ...card, options };
  });
}

// ── Score calculation ──────────────────────────────────────────────────────
function calculatePoints(timeMs: number, correct: boolean): number {
  if (!correct) return 0;
  if (timeMs <= 2000) return 1000;
  if (timeMs >= TIME_LIMIT_MS) return 100;
  // Linear from 1000 at 2s to 100 at 10s
  return Math.round(1000 - ((timeMs - 2000) / (TIME_LIMIT_MS - 2000)) * 900);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function SpeedQuizClient() {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [quiz, setQuiz] = useState<QuizCard[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [shareText, setShareText] = useState('');

  const roundStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate quiz on mount
  useEffect(() => {
    setQuiz(generateDailyQuiz());
    // Load previous results if already played today
    const saved = localStorage.getItem('cardvault-speed-quiz');
    if (saved) {
      try {
        const data = JSON.parse(saved) as { date: string; results: RoundResult[] };
        const today = new Date().toISOString().split('T')[0];
        if (data.date === today && data.results.length === ROUNDS) {
          setResults(data.results);
          setGameState('done');
        }
      } catch { /* ignore */ }
    }
  }, []);

  const startTimer = useCallback(() => {
    roundStartRef.current = Date.now();
    setTimeLeft(TIME_LIMIT_MS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - roundStartRef.current;
      const remaining = Math.max(0, TIME_LIMIT_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        // Time's up
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 50);
  }, []);

  const startGame = useCallback(() => {
    if (quiz.length === 0) return;
    setGameState('playing');
    setCurrentRound(0);
    setResults([]);
    startTimer();
  }, [quiz, startTimer]);

  const handleAnswer = useCallback((answer: string | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeMs = Date.now() - roundStartRef.current;
    const card = quiz[currentRound];
    const correct = answer === card.correctPlayer;
    const points = calculatePoints(timeMs, correct);

    const result: RoundResult = { card, correct, answer, timeMs, points };
    const newResults = [...results, result];
    setResults(newResults);
    setGameState('reveal');

    // Auto-advance after 1.5s
    setTimeout(() => {
      if (currentRound + 1 >= ROUNDS) {
        setGameState('done');
        // Save results
        localStorage.setItem('cardvault-speed-quiz', JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          results: newResults,
        }));
        // Update high score
        const totalPoints = newResults.reduce((s, r) => s + r.points, 0);
        const savedHigh = localStorage.getItem('cardvault-speed-quiz-high');
        const highScore = savedHigh ? parseInt(savedHigh, 10) : 0;
        if (totalPoints > highScore) {
          localStorage.setItem('cardvault-speed-quiz-high', String(totalPoints));
        }
      } else {
        setCurrentRound(prev => prev + 1);
        setGameState('playing');
        startTimer();
      }
    }, 1500);
  }, [quiz, currentRound, results, startTimer]);

  // Handle timeout
  useEffect(() => {
    if (gameState === 'playing' && timeLeft <= 0) {
      handleAnswer(null);
    }
  }, [gameState, timeLeft, handleAnswer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleShare = useCallback(() => {
    const total = results.reduce((s, r) => s + r.points, 0);
    const correct = results.filter(r => r.correct).length;
    const avgTime = results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length / 100) / 10
      : 0;
    const bars = results.map(r => r.correct ? (r.timeMs < 3000 ? '\u{1F7E2}' : r.timeMs < 6000 ? '\u{1F7E1}' : '\u{1F7E0}') : '\u{1F534}').join('');

    const text = [
      `Card Speed Quiz - ${total.toLocaleString()} pts`,
      bars,
      `${correct}/${ROUNDS} correct | ${avgTime}s avg`,
      '',
      'cardvault-two.vercel.app/card-speed-quiz',
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setShareText('Copied!');
      setTimeout(() => setShareText(''), 2000);
    }).catch(() => {
      setShareText('Could not copy');
      setTimeout(() => setShareText(''), 2000);
    });
  }, [results]);

  // ── Ready Screen ─────────────────────────────────────────────────────────
  if (gameState === 'ready') {
    const savedHigh = typeof window !== 'undefined' ? localStorage.getItem('cardvault-speed-quiz-high') : null;
    const highScore = savedHigh ? parseInt(savedHigh, 10) : 0;

    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">{'\u{26A1}'}</div>
        <h2 className="text-2xl font-bold text-white mb-3">Ready to Test Your Knowledge?</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          {ROUNDS} cards. 10 seconds each. Identify the player from the clues.
          Faster answers = more points. Max score: {(ROUNDS * 1000).toLocaleString()}.
        </p>
        {highScore > 0 && (
          <p className="text-amber-400 text-sm mb-6">Your best: {highScore.toLocaleString()} pts</p>
        )}
        <button
          onClick={startGame}
          className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-lg transition-colors"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // ── Done Screen ──────────────────────────────────────────────────────────
  if (gameState === 'done') {
    const total = results.reduce((s, r) => s + r.points, 0);
    const correct = results.filter(r => r.correct).length;
    const avgTime = results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length / 100) / 10
      : 0;
    const savedHigh = typeof window !== 'undefined' ? localStorage.getItem('cardvault-speed-quiz-high') : null;
    const highScore = savedHigh ? parseInt(savedHigh, 10) : 0;
    const isNewHigh = total >= highScore && total > 0;

    const grade = total >= 12000 ? 'S' : total >= 10000 ? 'A+' : total >= 8000 ? 'A' : total >= 6000 ? 'B' : total >= 4000 ? 'C' : total >= 2000 ? 'D' : 'F';

    return (
      <div className="space-y-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-rose-950/50 to-zinc-900 border border-rose-800/30 rounded-2xl p-8 text-center">
          {isNewHigh && <p className="text-amber-400 text-sm font-bold mb-2">NEW HIGH SCORE!</p>}
          <div className="text-5xl font-black text-white mb-2">{total.toLocaleString()}</div>
          <p className="text-zinc-400 mb-6">points earned</p>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-2xl font-bold text-rose-400">{correct}/{ROUNDS}</div>
              <div className="text-xs text-zinc-500">Correct</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-2xl font-bold text-rose-400">{avgTime}s</div>
              <div className="text-xs text-zinc-500">Avg Time</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-2xl font-bold text-rose-400">{grade}</div>
              <div className="text-xs text-zinc-500">Grade</div>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {shareText || 'Copy Results'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Card Speed Quiz: ${total.toLocaleString()} pts | ${correct}/${ROUNDS} correct | ${avgTime}s avg\n\nTest your card knowledge: cardvault-two.vercel.app/card-speed-quiz`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Share to X
            </a>
          </div>
        </div>

        {/* Round-by-Round Results */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Round by Round</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${r.correct ? 'bg-emerald-950/30 border border-emerald-800/30' : 'bg-red-950/30 border border-red-800/30'}`}>
                <span className="text-xs text-zinc-500 w-6 text-right">#{i + 1}</span>
                <span className={`text-lg ${r.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.correct ? '\u2713' : '\u2717'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{r.card.correctPlayer}</div>
                  <div className="text-xs text-zinc-500">{r.card.year} {r.card.set}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{r.points}</div>
                  <div className="text-xs text-zinc-500">{(r.timeMs / 1000).toFixed(1)}s</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-zinc-500 text-sm">
          Come back tomorrow for a new set of cards!
        </p>
      </div>
    );
  }

  // ── Playing / Reveal Screen ──────────────────────────────────────────────
  const card = quiz[currentRound];
  if (!card) return null;

  const timerPct = (timeLeft / TIME_LIMIT_MS) * 100;
  const timerColor = timerPct > 50 ? 'bg-emerald-500' : timerPct > 25 ? 'bg-amber-500' : 'bg-red-500';

  const lastResult = gameState === 'reveal' && results.length > 0 ? results[results.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Round {currentRound + 1} of {ROUNDS}</span>
        <span className="text-sm text-zinc-400">
          {results.reduce((s, r) => s + r.points, 0).toLocaleString()} pts
        </span>
      </div>

      {/* Timer Bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${timerColor} transition-all duration-100 rounded-full`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Card Clue */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400 capitalize">{card.sport}</span>
          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{card.year}</span>
          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{card.set}</span>
          <span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">#{card.cardNumber}</span>
        </div>
        <p className="text-white text-lg leading-relaxed">{card.hint}</p>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {card.options.map((option) => {
          let btnClass = 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600';

          if (gameState === 'reveal' && lastResult) {
            if (option === card.correctPlayer) {
              btnClass = 'bg-emerald-900/50 border-emerald-600 text-emerald-300';
            } else if (option === lastResult.answer && !lastResult.correct) {
              btnClass = 'bg-red-900/50 border-red-600 text-red-300';
            } else {
              btnClass = 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500';
            }
          }

          return (
            <button
              key={option}
              onClick={() => gameState === 'playing' ? handleAnswer(option) : undefined}
              disabled={gameState !== 'playing'}
              className={`p-4 rounded-xl border text-left font-medium transition-colors ${btnClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Reveal feedback */}
      {gameState === 'reveal' && lastResult && (
        <div className={`text-center py-2 rounded-lg ${lastResult.correct ? 'text-emerald-400' : 'text-red-400'}`}>
          <span className="font-bold">
            {lastResult.correct
              ? `+${lastResult.points} points (${(lastResult.timeMs / 1000).toFixed(1)}s)`
              : lastResult.answer === null
                ? 'Time\'s up!'
                : `Wrong! It was ${lastResult.card.correctPlayer}`
            }
          </span>
        </div>
      )}

      {/* Round Progress Dots */}
      <div className="flex justify-center gap-1.5 pt-2">
        {Array.from({ length: ROUNDS }, (_, i) => {
          let dotClass = 'bg-zinc-700';
          if (i < results.length) {
            dotClass = results[i].correct ? 'bg-emerald-500' : 'bg-red-500';
          } else if (i === currentRound) {
            dotClass = 'bg-rose-500 animate-pulse';
          }
          return <div key={i} className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />;
        })}
      </div>
    </div>
  );
}
