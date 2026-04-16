'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Types ──────────────────────────────────────────────── */
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

interface CardItem {
  pos: Position;
  name: string;
  sport: string;
  value: number;
  emoji: string;
}

/* ─── Constants ──────────────────────────────────────────── */
const GRID_W = 20;
const GRID_H = 14;
const BASE_SPEED = 180;
const SPEED_INCREASE = 3;
const MIN_SPEED = 60;

const CARD_POOL: { name: string; sport: string; value: number; emoji: string }[] = [
  { name: 'Base Card', sport: 'mixed', value: 10, emoji: '🃏' },
  { name: 'Rookie Card', sport: 'mixed', value: 25, emoji: '⭐' },
  { name: 'Refractor', sport: 'mixed', value: 50, emoji: '✨' },
  { name: 'Auto Card', sport: 'mixed', value: 100, emoji: '✍️' },
  { name: 'Numbered /25', sport: 'mixed', value: 200, emoji: '🔢' },
  { name: 'Prizm Silver', sport: 'basketball', value: 75, emoji: '🏀' },
  { name: 'Chrome Refractor', sport: 'baseball', value: 60, emoji: '⚾' },
  { name: 'Mosaic Gold', sport: 'football', value: 80, emoji: '🏈' },
  { name: 'Young Guns RC', sport: 'hockey', value: 55, emoji: '🏒' },
  { name: 'PSA 10 Gem', sport: 'mixed', value: 300, emoji: '💎' },
  { name: '1/1 Superfractor', sport: 'mixed', value: 500, emoji: '🌟' },
  { name: 'Patch Auto', sport: 'mixed', value: 250, emoji: '🧵' },
  { name: 'Case Hit', sport: 'mixed', value: 400, emoji: '🎯' },
  { name: 'Vintage Legend', sport: 'mixed', value: 150, emoji: '🏛️' },
  { name: 'Logoman 1/1', sport: 'mixed', value: 1000, emoji: '👑' },
];

function getGrade(score: number): { letter: string; color: string } {
  if (score >= 3000) return { letter: 'S', color: 'text-yellow-400' };
  if (score >= 2000) return { letter: 'A', color: 'text-purple-400' };
  if (score >= 1200) return { letter: 'B', color: 'text-blue-400' };
  if (score >= 600) return { letter: 'C', color: 'text-emerald-400' };
  if (score >= 300) return { letter: 'D', color: 'text-orange-400' };
  return { letter: 'F', color: 'text-red-400' };
}

function randomPos(exclude: Position[]): Position {
  let pos: Position;
  do {
    pos = { x: Math.floor(Math.random() * GRID_W), y: Math.floor(Math.random() * GRID_H) };
  } while (exclude.some(e => e.x === pos.x && e.y === pos.y));
  return pos;
}

function randomCard(pos: Position): CardItem {
  /* Weighted random — common cards appear more often */
  const weights = CARD_POOL.map(c => Math.max(1, 1000 / c.value));
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) { idx = i; break; }
  }
  const c = CARD_POOL[idx];
  return { pos, ...c };
}

/* ─── Component ──────────────────────────────────────────── */
export default function CardSnakeClient() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 7 }]);
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [score, setScore] = useState(0);
  const [cardsCollected, setCardsCollected] = useState(0);
  const [bestPull, setBestPull] = useState<string | null>(null);
  const [bestPullValue, setBestPullValue] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [highScore, setHighScore] = useState(0);
  const [lastCard, setLastCard] = useState<string | null>(null);
  const [mode, setMode] = useState<'daily' | 'random'>('random');

  const dirRef = useRef(dir);
  const snakeRef = useRef(snake);
  const cardsRef = useRef(cards);
  const scoreRef = useRef(score);
  const speedRef = useRef(speed);
  const gameOverRef = useRef(gameOver);
  const cardsCollectedRef = useRef(cardsCollected);
  const bestPullRef = useRef(bestPull);
  const bestPullValueRef = useRef(bestPullValue);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { cardsCollectedRef.current = cardsCollected; }, [cardsCollected]);
  useEffect(() => { bestPullRef.current = bestPull; }, [bestPull]);
  useEffect(() => { bestPullValueRef.current = bestPullValue; }, [bestPullValue]);

  /* Load high score */
  useEffect(() => {
    const saved = localStorage.getItem('cv-snake-high');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  /* Spawn initial cards */
  const spawnCards = useCallback((snakeBody: Position[]) => {
    const items: CardItem[] = [];
    for (let i = 0; i < 3; i++) {
      const pos = randomPos([...snakeBody, ...items.map(c => c.pos)]);
      items.push(randomCard(pos));
    }
    return items;
  }, []);

  /* Start game */
  const startGame = useCallback(() => {
    const initSnake = [{ x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }];
    setSnake(initSnake);
    setDir('RIGHT');
    dirRef.current = 'RIGHT';
    setScore(0);
    setCardsCollected(0);
    setBestPull(null);
    setBestPullValue(0);
    setGameOver(false);
    setSpeed(BASE_SPEED);
    setLastCard(null);
    const initCards = spawnCards(initSnake);
    setCards(initCards);
    setRunning(true);
  }, [spawnCards]);

  /* Keyboard controls */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (dirRef.current !== 'DOWN') setDir('UP');
          e.preventDefault();
          break;
        case 'ArrowDown': case 's': case 'S':
          if (dirRef.current !== 'UP') setDir('DOWN');
          e.preventDefault();
          break;
        case 'ArrowLeft': case 'a': case 'A':
          if (dirRef.current !== 'RIGHT') setDir('LEFT');
          e.preventDefault();
          break;
        case 'ArrowRight': case 'd': case 'D':
          if (dirRef.current !== 'LEFT') setDir('RIGHT');
          e.preventDefault();
          break;
        case ' ':
          if (!running && !gameOver) startGame();
          e.preventDefault();
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running, gameOver, startGame]);

  /* Game loop */
  useEffect(() => {
    if (!running || gameOverRef.current) return;

    const tick = () => {
      const currentSnake = [...snakeRef.current];
      const head = { ...currentSnake[0] };
      const d = dirRef.current;

      if (d === 'UP') head.y -= 1;
      if (d === 'DOWN') head.y += 1;
      if (d === 'LEFT') head.x -= 1;
      if (d === 'RIGHT') head.x += 1;

      /* Wall collision */
      if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
        setGameOver(true);
        setRunning(false);
        const finalScore = scoreRef.current;
        const hs = parseInt(localStorage.getItem('cv-snake-high') || '0');
        if (finalScore > hs) {
          localStorage.setItem('cv-snake-high', finalScore.toString());
          setHighScore(finalScore);
        }
        return;
      }

      /* Self collision */
      if (currentSnake.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        setRunning(false);
        const finalScore = scoreRef.current;
        const hs = parseInt(localStorage.getItem('cv-snake-high') || '0');
        if (finalScore > hs) {
          localStorage.setItem('cv-snake-high', finalScore.toString());
          setHighScore(finalScore);
        }
        return;
      }

      const newSnake = [head, ...currentSnake];
      let ate = false;
      let currentCards = [...cardsRef.current];

      /* Check card pickup */
      const hitIdx = currentCards.findIndex(c => c.pos.x === head.x && c.pos.y === head.y);
      if (hitIdx >= 0) {
        const card = currentCards[hitIdx];
        setScore(prev => prev + card.value);
        setCardsCollected(prev => prev + 1);
        setLastCard(`${card.emoji} ${card.name} +${card.value}`);
        if (card.value > bestPullValueRef.current) {
          setBestPull(card.name);
          setBestPullValue(card.value);
        }
        currentCards.splice(hitIdx, 1);
        const newPos = randomPos([...newSnake, ...currentCards.map(c => c.pos)]);
        currentCards.push(randomCard(newPos));
        /* Extra card at milestones */
        if ((cardsCollectedRef.current + 1) % 5 === 0 && currentCards.length < 6) {
          const bonusPos = randomPos([...newSnake, ...currentCards.map(c => c.pos)]);
          currentCards.push(randomCard(bonusPos));
        }
        ate = true;
        const newSpeed = Math.max(MIN_SPEED, BASE_SPEED - (cardsCollectedRef.current + 1) * SPEED_INCREASE);
        setSpeed(newSpeed);
      }

      if (!ate) newSnake.pop();
      setSnake(newSnake);
      setCards(currentCards);
    };

    const interval = setInterval(tick, speedRef.current);
    return () => clearInterval(interval);
  }, [running, speed]);

  /* Touch controls */
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30 && dirRef.current !== 'LEFT') setDir('RIGHT');
      else if (dx < -30 && dirRef.current !== 'RIGHT') setDir('LEFT');
    } else {
      if (dy > 30 && dirRef.current !== 'UP') setDir('DOWN');
      else if (dy < -30 && dirRef.current !== 'DOWN') setDir('UP');
    }
    touchStart.current = null;
  };

  const grade = getGrade(score);
  const cellSize = 'min(calc((100vw - 2rem) / 20), 28px)';

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Score', value: score.toLocaleString(), color: 'text-amber-400' },
          { label: 'Cards', value: cardsCollected.toString(), color: 'text-cyan-400' },
          { label: 'Best Pull', value: bestPull || '—', color: 'text-purple-400' },
          { label: 'High Score', value: highScore.toLocaleString(), color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 text-center">
            <div className={`text-lg font-bold ${s.color} truncate`}>{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Last card notification */}
      {lastCard && running && (
        <div className="text-center text-sm font-medium text-amber-300 animate-pulse">{lastCard}</div>
      )}

      {/* Game board */}
      <div
        className="relative bg-slate-900/80 border-2 border-slate-700 rounded-xl overflow-hidden mx-auto touch-none select-none"
        style={{
          width: `calc(${cellSize} * ${GRID_W})`,
          height: `calc(${cellSize} * ${GRID_H})`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: GRID_H }).map((_, y) => (
            <div key={y} className="flex">
              {Array.from({ length: GRID_W }).map((_, x) => (
                <div
                  key={x}
                  className="border border-slate-500/20"
                  style={{ width: cellSize, height: cellSize }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Snake */}
        {snake.map((seg, i) => (
          <div
            key={i}
            className={`absolute rounded-sm transition-all duration-75 ${i === 0 ? 'bg-emerald-400 z-10' : 'bg-emerald-600'}`}
            style={{
              width: cellSize,
              height: cellSize,
              left: `calc(${cellSize} * ${seg.x})`,
              top: `calc(${cellSize} * ${seg.y})`,
            }}
          >
            {i === 0 && (
              <span className="flex items-center justify-center w-full h-full text-xs">
                {dir === 'RIGHT' ? '>' : dir === 'LEFT' ? '<' : dir === 'UP' ? '^' : 'v'}
              </span>
            )}
          </div>
        ))}

        {/* Cards */}
        {cards.map((card, i) => (
          <div
            key={`${card.pos.x}-${card.pos.y}-${i}`}
            className="absolute flex items-center justify-center z-20 animate-pulse"
            style={{
              width: cellSize,
              height: cellSize,
              left: `calc(${cellSize} * ${card.pos.x})`,
              top: `calc(${cellSize} * ${card.pos.y})`,
              fontSize: `calc(${cellSize} * 0.65)`,
            }}
            title={`${card.name} (+${card.value})`}
          >
            {card.emoji}
          </div>
        ))}

        {/* Start/Game Over overlay */}
        {!running && (
          <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-30">
            <div className="text-center p-6">
              {gameOver ? (
                <>
                  <div className="text-3xl font-bold text-white mb-2">Game Over</div>
                  <div className={`text-5xl font-bold mb-2 ${grade.color}`}>{grade.letter}</div>
                  <div className="text-amber-400 font-bold text-xl mb-1">{score.toLocaleString()} points</div>
                  <div className="text-slate-400 text-sm mb-1">{cardsCollected} cards collected</div>
                  {bestPull && <div className="text-purple-400 text-sm mb-4">Best: {bestPull} (+{bestPullValue})</div>}
                  <button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                    Play Again
                  </button>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-1">🐍</div>
                  <div className="text-2xl font-bold text-white mb-2">Card Snake</div>
                  <p className="text-slate-400 text-sm mb-4 max-w-xs">Collect cards to grow your snake. Rare pulls = more points. How long can you survive?</p>
                  <button onClick={startGame} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                    Start Game
                  </button>
                  <p className="text-slate-600 text-xs mt-3">Arrow keys / WASD / Swipe to move</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="sm:hidden flex flex-col items-center gap-1">
        <button onClick={() => { if (dirRef.current !== 'DOWN') setDir('UP'); }} className="bg-slate-800 border border-slate-700 text-white w-14 h-14 rounded-lg text-2xl active:bg-slate-700">^</button>
        <div className="flex gap-1">
          <button onClick={() => { if (dirRef.current !== 'RIGHT') setDir('LEFT'); }} className="bg-slate-800 border border-slate-700 text-white w-14 h-14 rounded-lg text-2xl active:bg-slate-700">&lt;</button>
          <button onClick={() => { if (dirRef.current !== 'UP') setDir('DOWN'); }} className="bg-slate-800 border border-slate-700 text-white w-14 h-14 rounded-lg text-2xl active:bg-slate-700">v</button>
          <button onClick={() => { if (dirRef.current !== 'LEFT') setDir('RIGHT'); }} className="bg-slate-800 border border-slate-700 text-white w-14 h-14 rounded-lg text-2xl active:bg-slate-700">&gt;</button>
        </div>
      </div>

      {/* Card value legend */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3">Card Values</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {CARD_POOL.filter((_, i) => i < 10).map(c => (
            <div key={c.name} className="flex items-center gap-1.5 text-xs">
              <span>{c.emoji}</span>
              <span className="text-slate-400 truncate">{c.name}</span>
              <span className="text-amber-400 font-mono ml-auto">+{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
