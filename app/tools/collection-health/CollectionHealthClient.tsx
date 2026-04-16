'use client';

import { useState, useCallback, useMemo } from 'react';

/* ── types ───────────────────────────────────────────────────────── */

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';
type Era = 'vintage' | 'junk' | 'modern' | 'ultra-modern';
type Condition = 'raw-poor' | 'raw-good' | 'raw-mint' | 'graded-7' | 'graded-8' | 'graded-9' | 'graded-10';
type CardType = 'rookie' | 'base' | 'insert' | 'auto';

interface CollectionCard {
  id: number;
  sport: Sport;
  era: Era;
  value: number;
  condition: Condition;
  cardType: CardType;
  player: string;
}

interface DimensionScore {
  name: string;
  score: number;
  max: 20;
  color: string;
  tips: string[];
}

/* ── presets ──────────────────────────────────────────────────────── */

const presets: Record<string, { label: string; desc: string; cards: Omit<CollectionCard, 'id'>[] }> = {
  flipper: {
    label: 'The Flipper',
    desc: 'Modern rookies, raw cards, focused on quick profits',
    cards: [
      { sport: 'football', era: 'ultra-modern', value: 200, condition: 'raw-good', cardType: 'rookie', player: 'Caleb Williams' },
      { sport: 'football', era: 'ultra-modern', value: 150, condition: 'raw-good', cardType: 'rookie', player: 'Marvin Harrison Jr' },
      { sport: 'basketball', era: 'ultra-modern', value: 300, condition: 'raw-mint', cardType: 'rookie', player: 'Victor Wembanyama' },
      { sport: 'basketball', era: 'ultra-modern', value: 100, condition: 'raw-good', cardType: 'rookie', player: 'Chet Holmgren' },
      { sport: 'baseball', era: 'ultra-modern', value: 80, condition: 'raw-good', cardType: 'rookie', player: 'Elly De La Cruz' },
      { sport: 'football', era: 'ultra-modern', value: 50, condition: 'raw-good', cardType: 'rookie', player: 'Jayden Daniels' },
      { sport: 'basketball', era: 'ultra-modern', value: 40, condition: 'raw-good', cardType: 'rookie', player: 'Reed Sheppard' },
      { sport: 'football', era: 'ultra-modern', value: 30, condition: 'raw-good', cardType: 'rookie', player: 'Drake Maye' },
    ],
  },
  vintage: {
    label: 'Vintage Collector',
    desc: 'Pre-1980 cards, graded, focused on preservation',
    cards: [
      { sport: 'baseball', era: 'vintage', value: 5000, condition: 'graded-8', cardType: 'base', player: 'Mickey Mantle' },
      { sport: 'baseball', era: 'vintage', value: 2000, condition: 'graded-7', cardType: 'rookie', player: 'Hank Aaron' },
      { sport: 'baseball', era: 'vintage', value: 1500, condition: 'graded-8', cardType: 'base', player: 'Willie Mays' },
      { sport: 'football', era: 'vintage', value: 800, condition: 'graded-7', cardType: 'rookie', player: 'Joe Montana' },
      { sport: 'basketball', era: 'vintage', value: 3000, condition: 'graded-8', cardType: 'rookie', player: 'Kareem Abdul-Jabbar' },
      { sport: 'hockey', era: 'vintage', value: 1200, condition: 'graded-7', cardType: 'rookie', player: 'Bobby Orr' },
    ],
  },
  balanced: {
    label: 'Balanced Portfolio',
    desc: 'Mix of sports, eras, and card types',
    cards: [
      { sport: 'baseball', era: 'vintage', value: 2000, condition: 'graded-8', cardType: 'rookie', player: 'Nolan Ryan' },
      { sport: 'baseball', era: 'modern', value: 500, condition: 'graded-9', cardType: 'rookie', player: 'Mike Trout' },
      { sport: 'basketball', era: 'modern', value: 800, condition: 'graded-9', cardType: 'rookie', player: 'LeBron James' },
      { sport: 'football', era: 'ultra-modern', value: 200, condition: 'graded-10', cardType: 'rookie', player: 'CJ Stroud' },
      { sport: 'hockey', era: 'modern', value: 300, condition: 'graded-9', cardType: 'rookie', player: 'Connor McDavid' },
      { sport: 'basketball', era: 'ultra-modern', value: 150, condition: 'raw-mint', cardType: 'rookie', player: 'Anthony Edwards' },
      { sport: 'baseball', era: 'ultra-modern', value: 100, condition: 'raw-good', cardType: 'auto', player: 'Shohei Ohtani' },
      { sport: 'football', era: 'modern', value: 400, condition: 'graded-9', cardType: 'insert', player: 'Patrick Mahomes' },
    ],
  },
  singleSport: {
    label: 'Single-Sport Fan',
    desc: 'All basketball, mix of eras',
    cards: [
      { sport: 'basketball', era: 'vintage', value: 5000, condition: 'graded-8', cardType: 'rookie', player: 'Michael Jordan' },
      { sport: 'basketball', era: 'modern', value: 2000, condition: 'graded-9', cardType: 'rookie', player: 'Kobe Bryant' },
      { sport: 'basketball', era: 'modern', value: 1000, condition: 'graded-9', cardType: 'rookie', player: 'LeBron James' },
      { sport: 'basketball', era: 'ultra-modern', value: 400, condition: 'graded-10', cardType: 'rookie', player: 'Luka Doncic' },
      { sport: 'basketball', era: 'ultra-modern', value: 300, condition: 'raw-mint', cardType: 'rookie', player: 'Victor Wembanyama' },
      { sport: 'basketball', era: 'ultra-modern', value: 100, condition: 'raw-good', cardType: 'rookie', player: 'Anthony Edwards' },
      { sport: 'basketball', era: 'modern', value: 150, condition: 'graded-9', cardType: 'auto', player: 'Stephen Curry' },
    ],
  },
  junkWax: {
    label: 'Junk Wax Hoarder',
    desc: 'Lots of 1987-1993 cards, mostly raw',
    cards: [
      { sport: 'baseball', era: 'junk', value: 5, condition: 'raw-good', cardType: 'base', player: 'Ken Griffey Jr' },
      { sport: 'baseball', era: 'junk', value: 3, condition: 'raw-good', cardType: 'base', player: 'Jose Canseco' },
      { sport: 'baseball', era: 'junk', value: 2, condition: 'raw-poor', cardType: 'base', player: 'Don Mattingly' },
      { sport: 'baseball', era: 'junk', value: 1, condition: 'raw-good', cardType: 'base', player: 'Mark McGwire' },
      { sport: 'baseball', era: 'junk', value: 1, condition: 'raw-poor', cardType: 'base', player: 'Darryl Strawberry' },
      { sport: 'football', era: 'junk', value: 3, condition: 'raw-good', cardType: 'base', player: 'Barry Sanders' },
      { sport: 'basketball', era: 'junk', value: 10, condition: 'raw-good', cardType: 'rookie', player: 'Michael Jordan' },
      { sport: 'baseball', era: 'junk', value: 2, condition: 'raw-good', cardType: 'base', player: 'Cal Ripken Jr' },
      { sport: 'baseball', era: 'junk', value: 1, condition: 'raw-poor', cardType: 'base', player: 'Bo Jackson' },
      { sport: 'baseball', era: 'junk', value: 1, condition: 'raw-poor', cardType: 'base', player: 'Nolan Ryan' },
    ],
  },
};

/* ── scoring ─────────────────────────────────────────────────────── */

function scoreCollection(cards: CollectionCard[]): { total: number; dimensions: DimensionScore[] } {
  if (cards.length === 0) {
    return { total: 0, dimensions: Array(5).fill(null).map((_, i) => ({ name: ['Diversification', 'Grade Quality', 'Risk Exposure', 'Growth Potential', 'Liquidity'][i], score: 0, max: 20, color: 'text-red-400', tips: ['Add cards to see your score'] })) };
  }

  const totalValue = cards.reduce((s, c) => s + c.value, 0);

  // 1. Diversification (0-20): sport spread, era spread, player uniqueness
  const sports = new Set(cards.map(c => c.sport));
  const eras = new Set(cards.map(c => c.era));
  const players = new Set(cards.map(c => c.player));
  const sportScore = Math.min(5, sports.size * 1.5);
  const eraScore = Math.min(5, eras.size * 1.5);
  const uniquePlayerRatio = players.size / cards.length;
  const playerScore = Math.min(5, uniquePlayerRatio * 6);
  const typeSet = new Set(cards.map(c => c.cardType));
  const typeScore = Math.min(5, typeSet.size * 1.5);
  const diversification = Math.round(sportScore + eraScore + playerScore + typeScore);
  const divTips: string[] = [];
  if (sports.size < 3) divTips.push('Add cards from more sports to reduce concentration risk');
  if (eras.size < 3) divTips.push('Mix vintage, modern, and ultra-modern cards for better era coverage');
  if (uniquePlayerRatio < 0.5) divTips.push('Reduce duplicate players to spread risk across more athletes');

  // 2. Grade Quality (0-20): graded %, average grade level, condition
  const graded = cards.filter(c => c.condition.startsWith('graded-'));
  const gradedPct = graded.length / cards.length;
  const gradedScore = Math.min(8, gradedPct * 10);
  const condMap: Record<Condition, number> = { 'raw-poor': 2, 'raw-good': 5, 'raw-mint': 7, 'graded-7': 7, 'graded-8': 8, 'graded-9': 9, 'graded-10': 10 };
  const avgCond = cards.reduce((s, c) => s + condMap[c.condition], 0) / cards.length;
  const condScore = Math.min(12, (avgCond / 10) * 12);
  const gradeQuality = Math.round(gradedScore + condScore);
  const gradeTips: string[] = [];
  if (gradedPct < 0.3) gradeTips.push('Get your most valuable cards graded to protect value and improve authenticity');
  if (avgCond < 7) gradeTips.push('Consider upgrading raw cards in poor condition or selling them to fund better copies');

  // 3. Risk Exposure (0-20, inverted — lower concentration = higher score)
  const playerValues: Record<string, number> = {};
  cards.forEach(c => { playerValues[c.player] = (playerValues[c.player] || 0) + c.value; });
  const maxPlayerPct = totalValue > 0 ? Math.max(...Object.values(playerValues)) / totalValue : 1;
  const concScore = Math.min(10, (1 - maxPlayerPct) * 12);
  const ultraModernPct = cards.filter(c => c.era === 'ultra-modern').length / cards.length;
  const volatilityScore = Math.min(10, (1 - ultraModernPct * 0.8) * 10);
  const riskExposure = Math.round(concScore + volatilityScore);
  const riskTips: string[] = [];
  if (maxPlayerPct > 0.4) riskTips.push(`More than 40% of your value is in one player — consider trimming to reduce concentration`);
  if (ultraModernPct > 0.7) riskTips.push('Heavy ultra-modern weighting increases volatility. Add vintage/modern for stability');

  // 4. Growth Potential (0-20): rookie %, modern/ultra-modern %, card type mix
  const rookiePct = cards.filter(c => c.cardType === 'rookie').length / cards.length;
  const rookieScore = Math.min(8, rookiePct * 12);
  const growthEraPct = cards.filter(c => c.era === 'modern' || c.era === 'ultra-modern').length / cards.length;
  const eraGrowthScore = Math.min(7, growthEraPct * 8);
  const hasAuto = cards.some(c => c.cardType === 'auto');
  const hasInsert = cards.some(c => c.cardType === 'insert');
  const varietyBonus = (hasAuto ? 2.5 : 0) + (hasInsert ? 2.5 : 0);
  const growthPotential = Math.round(rookieScore + eraGrowthScore + varietyBonus);
  const growthTips: string[] = [];
  if (rookiePct < 0.2) growthTips.push('Add more rookie cards — they have the highest appreciation potential');
  if (!hasAuto) growthTips.push('Autographed cards add significant long-term value. Consider adding at least one');

  // 5. Liquidity (0-20): how easily can you sell
  const highValueCards = cards.filter(c => c.value >= 50);
  const midValueCards = cards.filter(c => c.value >= 10 && c.value < 50);
  const highLiqScore = Math.min(10, highValueCards.length * 1.5);
  const midLiqScore = Math.min(5, midValueCards.length * 0.8);
  const gradedLiqBonus = Math.min(5, graded.length * 0.8);
  const liquidity = Math.round(highLiqScore + midLiqScore + gradedLiqBonus);
  const liqTips: string[] = [];
  if (highValueCards.length < 3) liqTips.push('Having 3+ cards worth $50+ ensures you have liquid assets that sell quickly');
  if (graded.length < 2) liqTips.push('Graded cards sell 2-3x faster than raw cards on eBay. Grade your best cards for liquidity');

  const dimensions: DimensionScore[] = [
    { name: 'Diversification', score: Math.min(20, diversification), max: 20, color: 'text-blue-400', tips: divTips },
    { name: 'Grade Quality', score: Math.min(20, gradeQuality), max: 20, color: 'text-purple-400', tips: gradeTips },
    { name: 'Risk Exposure', score: Math.min(20, riskExposure), max: 20, color: 'text-orange-400', tips: riskTips },
    { name: 'Growth Potential', score: Math.min(20, growthPotential), max: 20, color: 'text-green-400', tips: growthTips },
    { name: 'Liquidity', score: Math.min(20, liquidity), max: 20, color: 'text-cyan-400', tips: liqTips },
  ];

  const total = dimensions.reduce((s, d) => s + d.score, 0);
  return { total, dimensions };
}

function getGrade(score: number): { label: string; emoji: string; color: string } {
  if (score >= 90) return { label: 'Elite', emoji: 'S', color: 'text-yellow-400' };
  if (score >= 80) return { label: 'Excellent', emoji: 'A', color: 'text-green-400' };
  if (score >= 65) return { label: 'Good', emoji: 'B', color: 'text-blue-400' };
  if (score >= 50) return { label: 'Fair', emoji: 'C', color: 'text-zinc-300' };
  if (score >= 35) return { label: 'Needs Work', emoji: 'D', color: 'text-orange-400' };
  return { label: 'At Risk', emoji: 'F', color: 'text-red-400' };
}

/* ── component ───────────────────────────────────────────────────── */

export default function CollectionHealthClient() {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [nextId, setNextId] = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [sport, setSport] = useState<Sport>('baseball');
  const [era, setEra] = useState<Era>('ultra-modern');
  const [value, setValue] = useState('50');
  const [condition, setCondition] = useState<Condition>('raw-good');
  const [cardType, setCardType] = useState<CardType>('rookie');
  const [player, setPlayer] = useState('');

  const { total, dimensions } = useMemo(() => scoreCollection(cards), [cards]);
  const grade = getGrade(total);

  const addCard = useCallback(() => {
    const v = parseInt(value) || 0;
    if (v <= 0 || !player.trim()) return;
    setCards(prev => [...prev, { id: nextId, sport, era, value: v, condition, cardType, player: player.trim() }]);
    setNextId(n => n + 1);
    setPlayer('');
    setValue('50');
    setShowAdd(false);
  }, [sport, era, value, condition, cardType, player, nextId]);

  const removeCard = useCallback((id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const loadPreset = useCallback((key: string) => {
    const p = presets[key];
    if (!p) return;
    const newCards = p.cards.map((c, i) => ({ ...c, id: nextId + i }));
    setCards(newCards);
    setNextId(nextId + p.cards.length);
  }, [nextId]);

  const totalValue = cards.reduce((s, c) => s + c.value, 0);

  const copyAnalysis = useCallback(() => {
    const text = `Collection Health Score: ${total}/100 (${grade.label})\n${dimensions.map(d => `${d.name}: ${d.score}/20`).join('\n')}\nCards: ${cards.length} | Value: $${totalValue.toLocaleString()}\nhttps://cardvault-two.vercel.app/tools/collection-health`;
    navigator.clipboard.writeText(text).catch(() => {});
  }, [total, grade.label, dimensions, cards.length, totalValue]);

  const conditionLabels: Record<Condition, string> = {
    'raw-poor': 'Raw (Poor)', 'raw-good': 'Raw (Good)', 'raw-mint': 'Raw (Near Mint)',
    'graded-7': 'Graded 7', 'graded-8': 'Graded 8', 'graded-9': 'Graded 9', 'graded-10': 'Graded 10',
  };

  const sportEmoji: Record<Sport, string> = { baseball: '\u26be', basketball: '\ud83c\udfc0', football: '\ud83c\udfc8', hockey: '\ud83c\udfd2' };

  return (
    <div className="space-y-6">
      {/* Score display */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center">
        <div className="text-sm text-zinc-500 mb-2">Collection Health Score</div>
        <div className={`text-6xl font-black ${grade.color}`}>{total}</div>
        <div className={`text-lg font-medium ${grade.color} mt-1`}>{grade.label}</div>
        <div className="text-zinc-500 text-sm mt-2">{cards.length} cards &middot; ${totalValue.toLocaleString()} total value</div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-3">
        {dimensions.map(d => (
          <div key={d.name} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${d.color}`}>{d.name}</span>
              <span className="text-white font-bold text-sm">{d.score}/20</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-2 rounded-full transition-all ${d.score >= 16 ? 'bg-green-500' : d.score >= 12 ? 'bg-blue-500' : d.score >= 8 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(d.score / 20) * 100}%` }} />
            </div>
            {d.tips.length > 0 && (
              <div className="mt-2 space-y-1">
                {d.tips.map((tip, i) => (
                  <div key={i} className="text-xs text-zinc-500 flex gap-1.5">
                    <span className="text-yellow-500 mt-0.5">*</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Quick Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(presets).map(([key, p]) => (
            <button key={key} onClick={() => loadPreset(key)} className="text-left bg-zinc-800/60 border border-zinc-700/50 rounded-lg p-3 hover:border-emerald-600/50 transition-colors">
              <div className="text-white text-sm font-medium">{p.label}</div>
              <div className="text-zinc-500 text-xs mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Card list */}
      {cards.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-semibold">Your Cards ({cards.length})</h3>
          {cards.map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5">
              <span className="text-lg">{sportEmoji[c.sport]}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{c.player}</div>
                <div className="text-zinc-500 text-xs">{c.era} &middot; {conditionLabels[c.condition]} &middot; {c.cardType}</div>
              </div>
              <div className="text-white font-medium text-sm">${c.value.toLocaleString()}</div>
              <button onClick={() => removeCard(c.id)} className="text-zinc-600 hover:text-red-400 text-lg">&times;</button>
            </div>
          ))}
        </div>
      )}

      {/* Add card form */}
      {showAdd ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">Add a Card</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Player Name</label>
              <input value={player} onChange={e => setPlayer(e.target.value)} placeholder="e.g. Mike Trout" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Estimated Value ($)</label>
              <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value as Sport)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="baseball">Baseball</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="hockey">Hockey</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Era</label>
              <select value={era} onChange={e => setEra(e.target.value as Era)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="vintage">Vintage (pre-1980)</option>
                <option value="junk">Junk Wax (1980-1994)</option>
                <option value="modern">Modern (1995-2015)</option>
                <option value="ultra-modern">Ultra-Modern (2016+)</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Condition</label>
              <select value={condition} onChange={e => setCondition(e.target.value as Condition)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm">
                {Object.entries(conditionLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Card Type</label>
              <select value={cardType} onChange={e => setCardType(e.target.value as CardType)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="rookie">Rookie Card</option>
                <option value="base">Base Card</option>
                <option value="insert">Insert/Parallel</option>
                <option value="auto">Autograph</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={addCard} disabled={!player.trim() || !value} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50">
              Add Card
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => setShowAdd(true)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
            + Add Card
          </button>
          {cards.length > 0 && (
            <button onClick={copyAnalysis} className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-xl transition-colors text-sm">
              Copy Analysis
            </button>
          )}
        </div>
      )}

      {cards.length === 0 && (
        <div className="text-center text-zinc-600 text-sm py-4">
          Add cards manually or load a preset above to see your Collection Health Score.
        </div>
      )}
    </div>
  );
}
