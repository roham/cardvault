'use client';

import { useState, useMemo, useCallback } from 'react';
import { sportsCards } from '@/data/sports-cards';

type GamePhase = 'intro' | 'playing' | 'reveal' | 'results';

interface BoxCard {
  slug: string;
  player: string;
  sport: string;
  year: number;
  value: number;
  set: string;
  rookie: boolean;
}

interface Box {
  id: number;
  hint: string;
  cards: BoxCard[];
  selectedIndex: number | null;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generateDailySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function parseValue(card: (typeof sportsCards)[0]): number {
  const match = card.estimatedValueGem.match(/\$([0-9,.]+)/);
  if (match) return parseFloat(match[1].replace(',', ''));
  const matchRaw = card.estimatedValueRaw.match(/\$([0-9,.]+)/);
  if (matchRaw) return parseFloat(matchRaw[1].replace(',', ''));
  return 5;
}

const HINTS = [
  (cards: BoxCard[]) => `All ${cards[0].sport} cards`,
  (cards: BoxCard[]) => `Mix of ${[...new Set(cards.map(c => c.sport))].join(' & ')}`,
  (cards: BoxCard[]) => cards.some(c => c.rookie) ? 'Contains at least one rookie' : 'No rookies in this box',
  (cards: BoxCard[]) => `Cards from ${cards.map(c => c.year).sort()[0]} to ${cards.map(c => c.year).sort().reverse()[0]}`,
  (cards: BoxCard[]) => `Value range: $${Math.min(...cards.map(c => c.value))} to $${Math.max(...cards.map(c => c.value))}`,
];

function generateBoxes(seed: number): Box[] {
  const rng = seededRandom(seed);
  const allCards = sportsCards.map(c => ({
    slug: c.slug,
    player: c.player,
    sport: c.sport,
    year: c.year,
    value: parseValue(c),
    set: c.set,
    rookie: c.rookie,
  }));

  const shuffled = [...allCards].sort(() => rng() - 0.5);
  const boxes: Box[] = [];

  for (let i = 0; i < 5; i++) {
    const cards = shuffled.slice(i * 3, i * 3 + 3);
    const hintFn = HINTS[Math.floor(rng() * HINTS.length)];
    boxes.push({
      id: i,
      hint: hintFn(cards),
      cards,
      selectedIndex: null,
    });
  }

  return boxes;
}

function formatValue(v: number): string {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;
}

function getGrade(score: number, maxScore: number): { grade: string; color: string } {
  const pct = score / maxScore;
  if (pct >= 0.9) return { grade: 'S', color: 'text-amber-400' };
  if (pct >= 0.8) return { grade: 'A', color: 'text-emerald-400' };
  if (pct >= 0.7) return { grade: 'B', color: 'text-blue-400' };
  if (pct >= 0.55) return { grade: 'C', color: 'text-purple-400' };
  if (pct >= 0.4) return { grade: 'D', color: 'text-orange-400' };
  return { grade: 'F', color: 'text-red-400' };
}

export default function MysteryBoxClient() {
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [randomSeed, setRandomSeed] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentBox, setCurrentBox] = useState(0);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [revealedBox, setRevealedBox] = useState<number | null>(null);

  const seed = useMemo(() => mode === 'daily' ? generateDailySeed() : randomSeed, [mode, randomSeed]);

  const startGame = useCallback((gameMode: 'daily' | 'random') => {
    setMode(gameMode);
    const s = gameMode === 'daily' ? generateDailySeed() : Date.now();
    if (gameMode === 'random') setRandomSeed(s);
    setBoxes(generateBoxes(gameMode === 'daily' ? generateDailySeed() : s));
    setCurrentBox(0);
    setRevealedBox(null);
    setPhase('playing');
  }, []);

  const selectCard = useCallback((boxIndex: number, cardIndex: number) => {
    setBoxes(prev => prev.map((b, i) => i === boxIndex ? { ...b, selectedIndex: cardIndex } : b));
    setRevealedBox(boxIndex);
    setTimeout(() => {
      setRevealedBox(null);
      if (boxIndex < 4) {
        setCurrentBox(boxIndex + 1);
      } else {
        setPhase('results');
      }
    }, 2000);
  }, []);

  const totalScore = boxes.reduce((sum, b) => sum + (b.selectedIndex !== null ? b.cards[b.selectedIndex].value : 0), 0);
  const maxScore = boxes.reduce((sum, b) => sum + Math.max(...b.cards.map(c => c.value)), 0);
  const minScore = boxes.reduce((sum, b) => sum + Math.min(...b.cards.map(c => c.value)), 0);

  const shareResults = () => {
    const { grade } = getGrade(totalScore, maxScore);
    const emojis = boxes.map(b => {
      if (b.selectedIndex === null) return '⬛';
      const best = Math.max(...b.cards.map(c => c.value));
      const picked = b.cards[b.selectedIndex].value;
      if (picked === best) return '🟩';
      if (picked >= best * 0.7) return '🟨';
      return '🟥';
    }).join('');
    const text = `Card Mystery Box ${mode === 'daily' ? '(Daily)' : '(Random)'}\n${emojis}\nScore: ${formatValue(totalScore)} / ${formatValue(maxScore)} (${grade})\nPlay at cardvault-two.vercel.app/card-mystery-box`;
    navigator.clipboard.writeText(text);
  };

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-white mb-2">Card Mystery Box</h2>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Open 5 mystery boxes. Each has 3 face-down cards — pick one based on the hint. Reveal what you got (and what you missed). Highest total value wins.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => startGame('daily')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition">
            Daily Challenge
          </button>
          <button onClick={() => startGame('random')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition">
            Random
          </button>
        </div>
      </div>
    );
  }

  // Playing phase
  if (phase === 'playing') {
    const box = boxes[currentBox];
    return (
      <div>
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {boxes.map((b, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition ${
              i < currentBox ? 'bg-emerald-500' : i === currentBox ? 'bg-blue-500' : 'bg-gray-800'
            }`} />
          ))}
        </div>

        <div className="text-center mb-6">
          <div className="text-gray-400 text-sm">Box {currentBox + 1} of 5</div>
          <div className="text-white font-bold text-lg mt-1">{box.hint}</div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {box.cards.map((card, i) => {
            const isRevealed = revealedBox === currentBox;
            const isSelected = box.selectedIndex === i;
            return (
              <button
                key={i}
                onClick={() => !isRevealed && box.selectedIndex === null && selectCard(currentBox, i)}
                disabled={isRevealed || box.selectedIndex !== null}
                className={`aspect-[2/3] rounded-xl border-2 transition-all transform ${
                  isRevealed && isSelected ? 'border-emerald-500 bg-emerald-950/40 scale-105' :
                  isRevealed && !isSelected ? 'border-gray-700 bg-gray-900 opacity-60' :
                  'border-gray-600 bg-gray-800 hover:border-blue-500 hover:scale-105 cursor-pointer'
                } flex flex-col items-center justify-center p-3`}
              >
                {isRevealed ? (
                  <>
                    <div className="text-3xl mb-2">{
                      card.sport === 'baseball' ? '⚾' :
                      card.sport === 'basketball' ? '🏀' :
                      card.sport === 'football' ? '🏈' : '🏒'
                    }</div>
                    <div className="text-white text-xs font-bold text-center leading-tight">{card.player}</div>
                    <div className="text-gray-400 text-xs">{card.year}</div>
                    <div className={`font-bold text-sm mt-1 ${card.value >= 50 ? 'text-amber-400' : card.value >= 20 ? 'text-emerald-400' : 'text-white'}`}>
                      {formatValue(card.value)}
                    </div>
                    {card.rookie && <span className="text-xs text-amber-400 mt-0.5">RC</span>}
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">❓</div>
                    <div className="text-gray-500 text-xs">Card {i + 1}</div>
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Running total */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Running total: <span className="text-white font-bold">{formatValue(boxes.slice(0, currentBox).reduce((sum, b) => sum + (b.selectedIndex !== null ? b.cards[b.selectedIndex].value : 0), 0))}</span>
        </div>
      </div>
    );
  }

  // Results
  const { grade, color } = getGrade(totalScore, maxScore);

  return (
    <div>
      {/* Score Header */}
      <div className="text-center mb-8">
        <div className={`text-5xl font-black ${color} mb-2`}>{grade}</div>
        <div className="text-2xl font-bold text-white">{formatValue(totalScore)} <span className="text-gray-500 text-lg">/ {formatValue(maxScore)}</span></div>
        <div className="text-gray-500 text-sm mt-1">
          {Math.round((totalScore / maxScore) * 100)}% of optimal · Best possible: {formatValue(maxScore)} · Worst: {formatValue(minScore)}
        </div>
      </div>

      {/* Box Results */}
      <div className="space-y-4 mb-8">
        {boxes.map((box, bi) => {
          const best = Math.max(...box.cards.map(c => c.value));
          const picked = box.selectedIndex !== null ? box.cards[box.selectedIndex].value : 0;
          const gotBest = picked === best;
          return (
            <div key={bi} className={`rounded-lg p-4 border ${gotBest ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-gray-900 border-gray-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Box {bi + 1}</span>
                {gotBest && <span className="text-emerald-400 text-xs font-bold">BEST PICK</span>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {box.cards.map((card, ci) => {
                  const isPicked = box.selectedIndex === ci;
                  const isBest = card.value === best;
                  return (
                    <div key={ci} className={`rounded p-2 text-center text-xs ${
                      isPicked ? 'bg-blue-950/40 border border-blue-700' :
                      isBest ? 'bg-amber-950/20 border border-amber-800/30' :
                      'bg-gray-800/50'
                    }`}>
                      <div className="text-white font-bold truncate">{card.player}</div>
                      <div className={`font-bold ${card.value >= 50 ? 'text-amber-400' : 'text-gray-300'}`}>{formatValue(card.value)}</div>
                      {isPicked && <div className="text-blue-400 text-[10px] mt-0.5">YOUR PICK</div>}
                      {isBest && !isPicked && <div className="text-amber-400 text-[10px] mt-0.5">BEST</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button onClick={shareResults} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition text-sm">
          Share Results
        </button>
        <button onClick={() => startGame('random')} className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition text-sm">
          Play Again (Random)
        </button>
        <button onClick={() => setPhase('intro')} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-lg transition text-sm">
          Menu
        </button>
      </div>
    </div>
  );
}
