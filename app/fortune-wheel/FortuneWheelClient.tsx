'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

function parseValue(raw: string): number {
  const m = raw.match(/\$[\d,]+/);
  if (!m) return 0;
  return parseInt(m[0].replace(/[$,]/g, ''), 10);
}

function dateHash(): number {
  const d = new Date();
  const str = `fortune-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h + str.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

interface WheelSlice {
  label: string;
  value: string;
  color: string;
  textColor: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  weight: number;
}

const WHEEL_SLICES: WheelSlice[] = [
  { label: '+$10', value: '10', color: '#374151', textColor: '#9CA3AF', rarity: 'common', weight: 25 },
  { label: '+$25', value: '25', color: '#1F2937', textColor: '#D1D5DB', rarity: 'common', weight: 20 },
  { label: '+$50', value: '50', color: '#064E3B', textColor: '#6EE7B7', rarity: 'uncommon', weight: 15 },
  { label: 'Free Card!', value: 'card', color: '#1E3A5F', textColor: '#93C5FD', rarity: 'uncommon', weight: 12 },
  { label: '+$100', value: '100', color: '#3B0764', textColor: '#C084FC', rarity: 'rare', weight: 10 },
  { label: '2x Card!', value: '2cards', color: '#78350F', textColor: '#FCD34D', rarity: 'rare', weight: 8 },
  { label: '+$250', value: '250', color: '#7F1D1D', textColor: '#FCA5A5', rarity: 'epic', weight: 5 },
  { label: 'Jackpot!', value: 'jackpot', color: '#92400E', textColor: '#FDE68A', rarity: 'legendary', weight: 3 },
  { label: '+$500', value: '500', color: '#831843', textColor: '#F9A8D4', rarity: 'legendary', weight: 2 },
];

const LS_KEY = 'cardvault_fortune_wheel';

interface SpinHistory {
  lastSpinDate: string;
  totalSpins: number;
  totalCredits: number;
  totalCards: number;
  bestPrize: string;
  streak: number;
}

function getHistory(): SpinHistory {
  if (typeof window === 'undefined') return { lastSpinDate: '', totalSpins: 0, totalCredits: 0, totalCards: 0, bestPrize: 'None', streak: 0 };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  return { lastSpinDate: '', totalSpins: 0, totalCredits: 0, totalCards: 0, bestPrize: 'None', streak: 0 };
}

function saveHistory(h: SpinHistory) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(h));
}

export default function FortuneWheelClient() {
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<SpinHistory>(getHistory);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelSlice | null>(null);
  const [resultCard, setResultCard] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  useState(() => { setMounted(true); setHistory(getHistory()); });

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const hasSpunToday = mounted && history.lastSpinDate === today;

  const validCards = useMemo(() =>
    sportsCards.filter(c => parseValue(c.estimatedValueRaw) >= 5 && parseValue(c.estimatedValueRaw) <= 200),
  []);

  const spinWheel = useCallback(() => {
    if (spinning || hasSpunToday) return;
    setSpinning(true);
    setResult(null);
    setResultCard(null);

    const rng = seededRng(dateHash() + history.totalSpins);
    const totalWeight = WHEEL_SLICES.reduce((sum, s) => sum + s.weight, 0);
    let roll = rng() * totalWeight;
    let chosen = WHEEL_SLICES[0];
    for (const slice of WHEEL_SLICES) {
      roll -= slice.weight;
      if (roll <= 0) { chosen = slice; break; }
    }

    // Calculate rotation to land on chosen slice
    const sliceAngle = 360 / WHEEL_SLICES.length;
    const chosenIdx = WHEEL_SLICES.indexOf(chosen);
    const targetAngle = 360 - (chosenIdx * sliceAngle + sliceAngle / 2);
    const spins = 5 + Math.floor(rng() * 3); // 5-7 full spins
    const totalRotation = rotation + spins * 360 + targetAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(chosen);

      // Award a random card if applicable
      if (chosen.value === 'card' || chosen.value === '2cards' || chosen.value === 'jackpot') {
        const cardIdx = Math.floor(rng() * validCards.length);
        setResultCard(validCards[cardIdx]?.player || 'Mystery Card');
      }

      // Update history
      const newHistory = { ...history };
      newHistory.lastSpinDate = today;
      newHistory.totalSpins += 1;
      newHistory.totalCards += chosen.value === 'card' ? 1 : chosen.value === '2cards' ? 2 : chosen.value === 'jackpot' ? 3 : 0;

      const credits = parseInt(chosen.value, 10);
      if (!isNaN(credits)) newHistory.totalCredits += credits;
      else if (chosen.value === 'jackpot') newHistory.totalCredits += 1000;

      if (chosen.rarity === 'legendary' || chosen.rarity === 'epic') {
        newHistory.bestPrize = chosen.label;
      }

      // Streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      newHistory.streak = history.lastSpinDate === yesterdayStr ? history.streak + 1 : 1;

      setHistory(newHistory);
      saveHistory(newHistory);
    }, 4000);
  }, [spinning, hasSpunToday, history, rotation, today, validCards]);

  const sliceAngle = 360 / WHEEL_SLICES.length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      {mounted && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Spins', value: history.totalSpins.toString(), color: 'text-amber-400' },
            { label: 'Credits Won', value: `$${history.totalCredits.toLocaleString()}`, color: 'text-green-400' },
            { label: 'Cards Won', value: history.totalCards.toString(), color: 'text-blue-400' },
            { label: 'Spin Streak', value: `${history.streak} day${history.streak !== 1 ? 's' : ''}`, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/80 border border-gray-800 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Wheel */}
      <div className="flex flex-col items-center">
        {/* Pointer */}
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-400 mb-[-8px] z-10" />

        {/* Wheel Container */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full transition-transform duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_SLICES.map((slice, i) => {
              const startAngle = (i * sliceAngle * Math.PI) / 180;
              const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
              const x1 = 100 + 95 * Math.cos(startAngle);
              const y1 = 100 + 95 * Math.sin(startAngle);
              const x2 = 100 + 95 * Math.cos(endAngle);
              const y2 = 100 + 95 * Math.sin(endAngle);
              const largeArc = sliceAngle > 180 ? 1 : 0;

              const midAngle = ((i + 0.5) * sliceAngle * Math.PI) / 180;
              const textX = 100 + 60 * Math.cos(midAngle);
              const textY = 100 + 60 * Math.sin(midAngle);
              const textRotation = (i + 0.5) * sliceAngle;

              return (
                <g key={i}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={slice.color}
                    stroke="#111827"
                    strokeWidth="1"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill={slice.textColor}
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  >
                    {slice.label}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="15" fill="#1F2937" stroke="#374151" strokeWidth="2" />
            <text x="100" y="100" fill="#F59E0B" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">SPIN</text>
          </svg>
        </div>

        {/* Spin Button */}
        <button
          onClick={spinWheel}
          disabled={spinning || hasSpunToday}
          className={`mt-4 px-8 py-3 text-lg font-bold rounded-xl transition-all ${
            spinning ? 'bg-gray-700 text-gray-500 cursor-wait animate-pulse' :
            hasSpunToday ? 'bg-gray-800 text-gray-600 cursor-not-allowed' :
            'bg-amber-600 hover:bg-amber-500 text-white hover:scale-105'
          }`}
        >
          {spinning ? 'Spinning...' : hasSpunToday ? 'Come Back Tomorrow!' : 'Spin the Wheel!'}
        </button>

        {hasSpunToday && !spinning && !result && (
          <p className="mt-2 text-gray-500 text-sm">
            You already spun today. Come back tomorrow for your next spin!
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className={`border rounded-xl p-6 text-center ${
          result.rarity === 'legendary' ? 'bg-amber-950/40 border-amber-700/60' :
          result.rarity === 'epic' ? 'bg-purple-950/40 border-purple-700/60' :
          result.rarity === 'rare' ? 'bg-blue-950/40 border-blue-700/60' :
          result.rarity === 'uncommon' ? 'bg-green-950/40 border-green-700/60' :
          'bg-gray-900/80 border-gray-800'
        }`}>
          <div className="text-3xl font-bold text-white mb-2">{result.label}</div>
          <div className={`text-sm font-medium mb-3 ${
            result.rarity === 'legendary' ? 'text-amber-400' :
            result.rarity === 'epic' ? 'text-purple-400' :
            result.rarity === 'rare' ? 'text-blue-400' :
            result.rarity === 'uncommon' ? 'text-green-400' :
            'text-gray-400'
          }`}>
            {result.rarity.toUpperCase()} Prize
          </div>
          {resultCard && (
            <p className="text-gray-300 text-sm">
              Card awarded: <span className="text-white font-medium">{resultCard}</span>
            </p>
          )}
          <p className="text-gray-500 text-xs mt-3">
            Added to your vault balance. Visit your <Link href="/vault" className="text-amber-400 hover:underline">Vault</Link> to see your collection.
          </p>
        </div>
      )}

      {/* Prizes Table */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Prize Table</h3>
        <div className="space-y-2">
          {WHEEL_SLICES.sort((a, b) => a.weight - b.weight).map(slice => (
            <div key={slice.label} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color, border: `1px solid ${slice.textColor}` }} />
                <span className="text-sm text-white font-medium">{slice.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  slice.rarity === 'legendary' ? 'bg-amber-900/60 text-amber-400' :
                  slice.rarity === 'epic' ? 'bg-purple-900/60 text-purple-400' :
                  slice.rarity === 'rare' ? 'bg-blue-900/60 text-blue-400' :
                  slice.rarity === 'uncommon' ? 'bg-green-900/60 text-green-400' :
                  'bg-gray-800 text-gray-400'
                }`}>
                  {slice.rarity}
                </span>
                <span className="text-xs text-gray-500 w-12 text-right">{((slice.weight / 100) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { href: '/tools/daily-pack', label: 'Daily Pack', desc: 'Free pack every day' },
          { href: '/vault', label: 'My Vault', desc: 'View your collection' },
          { href: '/my-hub', label: 'Collector Hub', desc: 'Daily activity dashboard' },
          { href: '/streak', label: 'Streak Tracker', desc: 'Track consecutive visits' },
          { href: '/achievements', label: 'Achievements', desc: 'Unlock badges' },
          { href: '/card-tycoon', label: 'Card Tycoon', desc: 'Market trading game' },
        ].map(t => (
          <Link key={t.href} href={t.href} className="p-3 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors">
            <div className="text-sm font-medium text-amber-400">{t.label}</div>
            <div className="text-xs text-gray-500">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
