'use client';

import { useState, useMemo, useCallback } from 'react';

// ── Card Pool ────────────────────────────────────────────────────────────────
// Organized by value tiers for realistic trade progressions
const CARD_POOL = [
  // Tier 1: $3-$10 (starter cards)
  { name: '2023 Topps Chrome Corbin Carroll RC', player: 'Corbin Carroll', sport: 'Baseball', value: 5 },
  { name: '2024 Panini Prizm Marvin Harrison Jr. RC Base', player: 'Marvin Harrison Jr.', sport: 'Football', value: 4 },
  { name: '2023 Panini Prizm Brandon Miller RC', player: 'Brandon Miller', sport: 'Basketball', value: 6 },
  { name: '2022 Topps Julio Rodriguez RC Base', player: 'Julio Rodriguez', sport: 'Baseball', value: 8 },
  { name: '2024 Upper Deck Connor Bedard Base', player: 'Connor Bedard', sport: 'Hockey', value: 7 },
  { name: '2021 Panini Prizm Trevor Lawrence RC Base', player: 'Trevor Lawrence', sport: 'Football', value: 5 },
  { name: '2023 Topps Gunnar Henderson RC', player: 'Gunnar Henderson', sport: 'Baseball', value: 6 },
  { name: '2022 Panini Prizm Paolo Banchero RC Base', player: 'Paolo Banchero', sport: 'Basketball', value: 4 },
  // Tier 2: $12-$30
  { name: '2020 Panini Prizm Tua Tagovailoa RC', player: 'Tua Tagovailoa', sport: 'Football', value: 15 },
  { name: '2024 Topps Chrome Jackson Chourio RC', player: 'Jackson Chourio', sport: 'Baseball', value: 18 },
  { name: '2023 Panini Prizm Scoot Henderson RC', player: 'Scoot Henderson', sport: 'Basketball', value: 12 },
  { name: '2022 Topps Chrome Bobby Witt Jr. RC', player: 'Bobby Witt Jr.', sport: 'Baseball', value: 25 },
  { name: '2024 Panini Prizm Caleb Williams RC', player: 'Caleb Williams', sport: 'Football', value: 20 },
  { name: '2023 Upper Deck Adam Fantilli RC', player: 'Adam Fantilli', sport: 'Hockey', value: 14 },
  { name: '2022 Panini Prizm Chet Holmgren RC', player: 'Chet Holmgren', sport: 'Basketball', value: 16 },
  { name: '2024 Bowman Chrome Paul Skenes', player: 'Paul Skenes', sport: 'Baseball', value: 28 },
  // Tier 3: $35-$75
  { name: '2021 Panini Prizm Mac Jones RC Silver', player: 'Mac Jones', sport: 'Football', value: 35 },
  { name: '2020 Panini Prizm Anthony Edwards RC', player: 'Anthony Edwards', sport: 'Basketball', value: 65 },
  { name: '2019 Topps Chrome Fernando Tatis Jr. RC', player: 'Fernando Tatis Jr.', sport: 'Baseball', value: 45 },
  { name: '2020 Panini Prizm Joe Burrow RC', player: 'Joe Burrow', sport: 'Football', value: 55 },
  { name: '2023 Panini Prizm Victor Wembanyama RC Base', player: 'Victor Wembanyama', sport: 'Basketball', value: 50 },
  { name: '2023 Upper Deck Connor Bedard RC Young Guns', player: 'Connor Bedard', sport: 'Hockey', value: 60 },
  { name: '2024 Bowman Chrome Roki Sasaki', player: 'Roki Sasaki', sport: 'Baseball', value: 40 },
  { name: '2019 Panini Prizm Ja Morant RC', player: 'Ja Morant', sport: 'Basketball', value: 70 },
  // Tier 4: $80-$175
  { name: '2018 Topps Update Shohei Ohtani RC', player: 'Shohei Ohtani', sport: 'Baseball', value: 120 },
  { name: '2020 Panini Prizm Justin Herbert RC Silver', player: 'Justin Herbert', sport: 'Football', value: 100 },
  { name: '2018 Panini Prizm Luka Doncic RC', player: 'Luka Doncic', sport: 'Basketball', value: 150 },
  { name: '2024 Panini Prizm Caitlin Clark RC', player: 'Caitlin Clark', sport: 'Basketball', value: 90 },
  { name: '2015 Panini Prizm Nikola Jokic RC', player: 'Nikola Jokic', sport: 'Basketball', value: 130 },
  { name: '2020 Panini Prizm Joe Burrow RC Silver', player: 'Joe Burrow', sport: 'Football', value: 160 },
  { name: '2019 Bowman Chrome Wander Franco RC Auto', player: 'Wander Franco', sport: 'Baseball', value: 85 },
  { name: '2005 Upper Deck Sidney Crosby Young Guns RC', player: 'Sidney Crosby', sport: 'Hockey', value: 175 },
  // Tier 5: $200-$500
  { name: '2018 Panini Prizm Luka Doncic RC Silver', player: 'Luka Doncic', sport: 'Basketball', value: 350 },
  { name: '2011 Topps Update Mike Trout RC', player: 'Mike Trout', sport: 'Baseball', value: 400 },
  { name: '2017 Panini Prizm Patrick Mahomes RC', player: 'Patrick Mahomes', sport: 'Football', value: 300 },
  { name: '2023 Panini Prizm Victor Wembanyama RC Silver', player: 'Victor Wembanyama', sport: 'Basketball', value: 250 },
  { name: '2003 Topps Chrome LeBron James RC', player: 'LeBron James', sport: 'Basketball', value: 500 },
  { name: '2018 Topps Update Shohei Ohtani RC PSA 10', player: 'Shohei Ohtani', sport: 'Baseball', value: 450 },
  { name: '2000 Playoff Contenders Tom Brady RC Auto', player: 'Tom Brady', sport: 'Football', value: 480 },
  { name: '1979 O-Pee-Chee Wayne Gretzky RC', player: 'Wayne Gretzky', sport: 'Hockey', value: 500 },
  // Tier 6: $600+ (grail cards — only appear late as aspirational targets)
  { name: '2003 Topps Chrome LeBron James RC Refractor', player: 'LeBron James', sport: 'Basketball', value: 800 },
  { name: '2009 Bowman Chrome Mike Trout RC Auto', player: 'Mike Trout', sport: 'Baseball', value: 1200 },
  { name: '2017 National Treasures Patrick Mahomes RPA', player: 'Patrick Mahomes', sport: 'Football', value: 1000 },
  { name: '1986 Fleer Michael Jordan RC PSA 10', player: 'Michael Jordan', sport: 'Basketball', value: 1500 },
];

const SPORT_COLORS: Record<string, string> = {
  Basketball: 'text-orange-400',
  Football: 'text-green-400',
  Baseball: 'text-blue-400',
  Hockey: 'text-cyan-400',
};

const SPORT_BG: Record<string, string> = {
  Basketball: 'bg-orange-950/40 border-orange-800/30',
  Football: 'bg-green-950/40 border-green-800/30',
  Baseball: 'bg-blue-950/40 border-blue-800/30',
  Hockey: 'bg-cyan-950/40 border-cyan-800/30',
};

const TOTAL_ROUNDS = 10;
const STORAGE_KEY = 'cardvault-trade-up';

type GamePhase = 'menu' | 'picking' | 'result' | 'gameOver';

interface TradeOffer {
  card: typeof CARD_POOL[number];
  sweetener: number; // cash the other trader adds (can be 0 or negative meaning you pay)
  traderName: string;
  traderMotive: string; // reason they're offering this trade
}

interface RoundRecord {
  round: number;
  heldCard: typeof CARD_POOL[number];
  offers: TradeOffer[];
  chosenIndex: number | null; // null = kept current card
  newValue: number;
}

const TRADER_NAMES = [
  'Dave from the card show', 'Tony the dealer', 'Marcus the flipper',
  'A Reddit collector', 'Your coworker Steve', 'eBay seller CardKing99',
  'Mia from the LCS', 'A guy at the flea market', 'Jess from TikTok',
  'The break room regular', 'A Facebook group member', 'Kai the investor',
  'A kid at the card shop', 'Your neighbor Frank', 'A Whatnot seller',
];

const TRADE_MOTIVES = [
  'Collecting that player', 'Needs it for a set', 'Switching sports',
  'Desperate for cash', 'Thinks your card will spike', 'Liquidating collection',
  'Wants to grade yours', 'Birthday gift for their kid', 'Chasing a rainbow',
  'Dumping before price drops', 'Building a PC', 'Just got this in a break',
  'Trading up themselves', 'Downsizing collection', 'Got a duplicate',
];

// Seeded random for consistent game states
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function formatValue(v: number): string {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;
}

function getVerdict(startValue: number, endValue: number): { label: string; emoji: string; color: string; desc: string } {
  const multiplier = endValue / startValue;
  if (multiplier >= 100) return { label: 'Legendary Trader', emoji: '\u{1F451}', color: 'text-yellow-400', desc: 'From a common to a grail. You are the card whisperer.' };
  if (multiplier >= 50) return { label: 'Master Negotiator', emoji: '\u{1F48E}', color: 'text-purple-400', desc: 'You turned pocket change into serious value. Incredible instincts.' };
  if (multiplier >= 20) return { label: 'Sharp Trader', emoji: '\u{1F525}', color: 'text-red-400', desc: 'Consistent upgrades, smart moves. The card show fears you.' };
  if (multiplier >= 10) return { label: 'Solid Hustler', emoji: '\u{1F4AA}', color: 'text-blue-400', desc: 'Good eye for value. A few more rounds and you would be unstoppable.' };
  if (multiplier >= 3) return { label: 'Getting There', emoji: '\u{1F4C8}', color: 'text-green-400', desc: 'Not bad! You made progress, but left money on the table.' };
  if (multiplier >= 1) return { label: 'Flat Trader', emoji: '\u{1F610}', color: 'text-zinc-400', desc: 'You ended up about where you started. Sometimes the best trade is no trade.' };
  return { label: 'Downgraded', emoji: '\u{1F4C9}', color: 'text-red-500', desc: 'You traded down. Happens to everyone — even the pros get swindled sometimes.' };
}

export default function TradeUpClient() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [round, setRound] = useState(0);
  const [currentCard, setCurrentCard] = useState(CARD_POOL[0]);
  const [offers, setOffers] = useState<TradeOffer[]>([]);
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Load high score on mount
  const savedHigh = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).highScore || 0 : 0;
    } catch { return 0; }
  }, []);

  // Initialize high score from saved
  useState(() => { setHighScore(savedHigh); });

  const generateOffers = useCallback((heldCard: typeof CARD_POOL[number], roundNum: number, rng: () => number): TradeOffer[] => {
    // Target value range based on round progression
    // Early rounds: offer cards near current value (some up, some down)
    // Later rounds: bigger swings possible
    const currentValue = heldCard.value;
    const roundProgress = roundNum / TOTAL_ROUNDS; // 0.1 to 1.0

    // Filter cards that aren't the currently held card
    const available = CARD_POOL.filter(c => c.name !== heldCard.name);

    const offersArr: TradeOffer[] = [];
    const usedNames = new Set<string>();

    // Offer 1: Upgrade offer (good deal, 1.3x-2.5x value)
    const upgradeMultiplier = 1.3 + rng() * (1.2 + roundProgress * 1.0);
    const upgradeTarget = currentValue * upgradeMultiplier;
    const upgrades = available.filter(c => c.value >= upgradeTarget * 0.8 && c.value <= upgradeTarget * 1.5);
    if (upgrades.length > 0) {
      const card = pickRandom(upgrades, rng);
      const sweetener = 0;
      const traderName = pickRandom(TRADER_NAMES.filter(n => !usedNames.has(n)), rng);
      usedNames.add(traderName);
      offersArr.push({
        card,
        sweetener,
        traderName,
        traderMotive: pickRandom(TRADE_MOTIVES, rng),
      });
    }

    // Offer 2: Lateral or slight upgrade (1.0x-1.5x)
    const lateralTarget = currentValue * (0.9 + rng() * 0.6);
    const laterals = available.filter(c =>
      c.value >= lateralTarget * 0.7 && c.value <= lateralTarget * 1.3 &&
      !offersArr.some(o => o.card.name === c.name)
    );
    if (laterals.length > 0) {
      const card = pickRandom(laterals, rng);
      const sweetener = Math.round((rng() - 0.3) * currentValue * 0.2); // small cash add or subtract
      const traderName = pickRandom(TRADER_NAMES.filter(n => !usedNames.has(n)), rng);
      usedNames.add(traderName);
      offersArr.push({
        card,
        sweetener,
        traderName,
        traderMotive: pickRandom(TRADE_MOTIVES, rng),
      });
    }

    // Offer 3: Trap offer (downgrade disguised with cash, or just bad deal)
    const trapTarget = currentValue * (0.3 + rng() * 0.5);
    const traps = available.filter(c =>
      c.value >= trapTarget * 0.5 && c.value <= trapTarget * 1.5 &&
      !offersArr.some(o => o.card.name === c.name)
    );
    if (traps.length > 0) {
      const card = pickRandom(traps, rng);
      // Sometimes add cash to make it tempting
      const sweetener = rng() > 0.5 ? Math.round(rng() * currentValue * 0.15) : 0;
      const traderName = pickRandom(TRADER_NAMES.filter(n => !usedNames.has(n)), rng);
      usedNames.add(traderName);
      offersArr.push({
        card,
        sweetener,
        traderName,
        traderMotive: pickRandom(TRADE_MOTIVES, rng),
      });
    }

    // Shuffle offers so the "good" one isn't always first
    for (let i = offersArr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [offersArr[i], offersArr[j]] = [offersArr[j], offersArr[i]];
    }

    return offersArr;
  }, []);

  const startGame = useCallback(() => {
    const rng = seededRandom(Date.now());
    // Pick a random starter card from tier 1
    const starters = CARD_POOL.filter(c => c.value <= 10);
    const starter = pickRandom(starters, rng);

    setCurrentCard(starter);
    setRound(1);
    setHistory([]);
    setSelectedOffer(null);
    setShowResult(false);

    const firstOffers = generateOffers(starter, 1, rng);
    setOffers(firstOffers);
    setPhase('picking');
  }, [generateOffers]);

  const acceptTrade = useCallback((offerIndex: number) => {
    const offer = offers[offerIndex];
    setSelectedOffer(offerIndex);
    setShowResult(true);

    const record: RoundRecord = {
      round,
      heldCard: currentCard,
      offers,
      chosenIndex: offerIndex,
      newValue: offer.card.value,
    };

    const newHistory = [...history, record];
    setHistory(newHistory);

    // After a short delay, move to next round or game over
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        // Game over
        const finalValue = offer.card.value;
        if (finalValue > highScore) {
          setHighScore(finalValue);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScore: finalValue }));
          } catch { /* ignore */ }
        }
        setCurrentCard(offer.card);
        setPhase('gameOver');
      } else {
        const rng = seededRandom(Date.now() + round * 1000);
        const nextOffers = generateOffers(offer.card, round + 1, rng);
        setCurrentCard(offer.card);
        setOffers(nextOffers);
        setRound(r => r + 1);
        setSelectedOffer(null);
        setShowResult(false);
      }
    }, 1200);
  }, [offers, round, currentCard, history, highScore, generateOffers]);

  const keepCard = useCallback(() => {
    setSelectedOffer(-1);
    setShowResult(true);

    const record: RoundRecord = {
      round,
      heldCard: currentCard,
      offers,
      chosenIndex: null,
      newValue: currentCard.value,
    };

    const newHistory = [...history, record];
    setHistory(newHistory);

    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        const finalValue = currentCard.value;
        if (finalValue > highScore) {
          setHighScore(finalValue);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ highScore: finalValue }));
          } catch { /* ignore */ }
        }
        setPhase('gameOver');
      } else {
        const rng = seededRandom(Date.now() + round * 1000);
        const nextOffers = generateOffers(currentCard, round + 1, rng);
        setOffers(nextOffers);
        setRound(r => r + 1);
        setSelectedOffer(null);
        setShowResult(false);
      }
    }, 1200);
  }, [round, currentCard, offers, history, highScore, generateOffers]);

  // ── Menu Screen ──────────────────────────────────────────────────────────
  if (phase === 'menu') {
    return (
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center">
        <div className="text-5xl mb-4">{'\u{1F4B1}'}</div>
        <h2 className="text-2xl font-bold text-white mb-3">How It Works</h2>
        <div className="text-sm text-zinc-400 space-y-2 mb-6 max-w-md mx-auto text-left">
          <p><span className="text-white font-medium">1.</span> You start with a $5 common card.</p>
          <p><span className="text-white font-medium">2.</span> Each round, 3 collectors offer you trades.</p>
          <p><span className="text-white font-medium">3.</span> Accept the best deal — or keep what you have.</p>
          <p><span className="text-white font-medium">4.</span> After 10 rounds, your final card value is your score.</p>
          <p className="text-yellow-400/80 font-medium pt-2">Goal: Turn $5 into $500+ through smart trades.</p>
        </div>
        {highScore > 0 && (
          <p className="text-sm text-zinc-500 mb-4">Your best: {formatValue(highScore)}</p>
        )}
        <button
          onClick={startGame}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-lg transition-colors text-lg"
        >
          Start Trading
        </button>
      </div>
    );
  }

  // ── Game Over Screen ─────────────────────────────────────────────────────
  if (phase === 'gameOver') {
    const startValue = 5;
    const endValue = currentCard.value;
    const verdict = getVerdict(startValue, endValue);
    const multiplier = endValue / startValue;

    return (
      <div className="space-y-6">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 sm:p-8 text-center">
          <div className="text-5xl mb-3">{verdict.emoji}</div>
          <h2 className={`text-2xl font-bold mb-1 ${verdict.color}`}>{verdict.label}</h2>
          <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">{verdict.desc}</p>

          <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 inline-block">
            <p className="text-xs text-zinc-500 mb-1">Your Final Card</p>
            <p className="text-white font-bold text-lg">{currentCard.name}</p>
            <p className={`text-sm ${SPORT_COLORS[currentCard.sport]}`}>{currentCard.sport}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
            <div>
              <p className="text-xs text-zinc-500">Started</p>
              <p className="text-lg font-bold text-zinc-400">$5</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Final Value</p>
              <p className="text-lg font-bold text-white">{formatValue(endValue)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Multiplier</p>
              <p className={`text-lg font-bold ${multiplier >= 10 ? 'text-yellow-400' : multiplier >= 3 ? 'text-green-400' : 'text-zinc-300'}`}>
                {multiplier.toFixed(1)}x
              </p>
            </div>
          </div>

          {endValue > highScore && endValue > savedHigh && (
            <p className="text-yellow-400 text-sm font-medium mb-4">New High Score!</p>
          )}

          <button
            onClick={startGame}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            Trade Again
          </button>
        </div>

        {/* Trade History */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5">
          <h3 className="font-bold text-white mb-4">Trade History</h3>
          <div className="space-y-3">
            {history.map((rec, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-zinc-500 w-6 text-right">R{rec.round}</span>
                <span className="text-zinc-400 truncate flex-1">
                  {rec.heldCard.name.split(' ').slice(0, 4).join(' ')}...
                </span>
                <span className="text-zinc-600">{'\u2192'}</span>
                {rec.chosenIndex !== null ? (
                  <>
                    <span className="text-white truncate flex-1">
                      {rec.offers[rec.chosenIndex].card.name.split(' ').slice(0, 4).join(' ')}...
                    </span>
                    <span className={rec.newValue > rec.heldCard.value ? 'text-green-400' : rec.newValue < rec.heldCard.value ? 'text-red-400' : 'text-zinc-400'}>
                      {formatValue(rec.newValue)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-zinc-500 italic flex-1">Kept</span>
                    <span className="text-zinc-400">{formatValue(rec.heldCard.value)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Value progression bar */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">Value Progression</p>
            <div className="flex items-end gap-1 h-16">
              {history.map((rec, i) => {
                const val = rec.chosenIndex !== null ? rec.offers[rec.chosenIndex].card.value : rec.heldCard.value;
                const maxVal = Math.max(...history.map(r => r.chosenIndex !== null ? r.offers[r.chosenIndex].card.value : r.heldCard.value), 1);
                const height = Math.max(8, (val / maxVal) * 100);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-red-600/70 transition-all"
                    style={{ height: `${height}%` }}
                    title={`R${rec.round}: ${formatValue(val)}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Picking Phase ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-zinc-800 text-white text-sm font-bold px-3 py-1 rounded-full">
            Round {round}/{TOTAL_ROUNDS}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_ROUNDS }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < round - 1 ? 'bg-red-500' : i === round - 1 ? 'bg-red-400 animate-pulse' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>
        {highScore > 0 && (
          <span className="text-xs text-zinc-500">Best: {formatValue(highScore)}</span>
        )}
      </div>

      {/* Current card */}
      <div className={`border rounded-xl p-4 sm:p-5 ${SPORT_BG[currentCard.sport]}`}>
        <p className="text-xs text-zinc-500 mb-1">You&apos;re Holding</p>
        <h3 className="text-white font-bold text-lg">{currentCard.name}</h3>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-sm ${SPORT_COLORS[currentCard.sport]}`}>{currentCard.sport}</span>
          <span className="text-white font-bold">{formatValue(currentCard.value)}</span>
        </div>
      </div>

      {/* Trade offers */}
      <div>
        <p className="text-sm text-zinc-400 mb-3">
          {showResult ? 'Trade complete!' : 'Choose a trade offer — or keep your card:'}
        </p>
        <div className="space-y-3">
          {offers.map((offer, i) => {
            const isUpgrade = offer.card.value > currentCard.value;
            const isDowngrade = offer.card.value < currentCard.value;
            const netValue = offer.card.value + offer.sweetener;
            const isSelected = selectedOffer === i;
            const isDisabled = showResult;

            return (
              <button
                key={i}
                onClick={() => !isDisabled && acceptTrade(i)}
                disabled={isDisabled}
                className={`w-full text-left border rounded-xl p-4 transition-all ${
                  isSelected
                    ? 'border-red-500 bg-red-950/30 ring-1 ring-red-500/30'
                    : isDisabled
                    ? 'border-zinc-800/50 bg-zinc-900/30 opacity-50'
                    : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500 mb-1">{offer.traderName}</p>
                    <p className="text-white font-semibold truncate">{offer.card.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${SPORT_COLORS[offer.card.sport]}`}>{offer.card.sport}</span>
                      <span className="text-xs text-zinc-500">&middot;</span>
                      <span className="text-xs text-zinc-500 italic">&quot;{offer.traderMotive}&quot;</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold ${isUpgrade ? 'text-green-400' : isDowngrade ? 'text-red-400' : 'text-zinc-300'}`}>
                      {formatValue(offer.card.value)}
                    </p>
                    {offer.sweetener !== 0 && (
                      <p className={`text-xs ${offer.sweetener > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {offer.sweetener > 0 ? '+' : ''}{formatValue(offer.sweetener)} cash
                      </p>
                    )}
                    {showResult && !isSelected && (
                      <p className="text-xs text-zinc-600 mt-1">
                        {netValue > currentCard.value ? 'Would have been an upgrade' : 'Dodge!'}
                      </p>
                    )}
                  </div>
                </div>
                {isSelected && showResult && (
                  <div className={`mt-2 pt-2 border-t ${isUpgrade ? 'border-green-800/30' : 'border-red-800/30'}`}>
                    <p className={`text-xs font-medium ${isUpgrade ? 'text-green-400' : isDowngrade ? 'text-red-400' : 'text-zinc-400'}`}>
                      {isUpgrade ? `Upgraded! +${formatValue(offer.card.value - currentCard.value)}` :
                       isDowngrade ? `Downgraded. ${formatValue(offer.card.value - currentCard.value)}` :
                       'Lateral move.'}
                    </p>
                  </div>
                )}
              </button>
            );
          })}

          {/* Keep current card button */}
          <button
            onClick={() => !showResult && keepCard()}
            disabled={showResult}
            className={`w-full text-left border rounded-xl p-4 transition-all ${
              selectedOffer === -1
                ? 'border-yellow-600 bg-yellow-950/20 ring-1 ring-yellow-500/30'
                : showResult
                ? 'border-zinc-800/50 bg-zinc-900/30 opacity-50'
                : 'border-zinc-800 border-dashed bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Keep your current card</p>
                <p className="text-xs text-zinc-500 mt-0.5">Sometimes the best trade is no trade</p>
              </div>
              <span className="text-sm font-medium text-zinc-400">{formatValue(currentCard.value)}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Round history (compact) */}
      {history.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 mt-2">
          <p className="text-xs text-zinc-500 mb-2">Trade Log</p>
          <div className="flex flex-wrap gap-1">
            {history.map((rec, i) => {
              const wasUpgrade = rec.chosenIndex !== null && rec.offers[rec.chosenIndex].card.value > rec.heldCard.value;
              const wasKeep = rec.chosenIndex === null;
              return (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded ${
                    wasKeep ? 'bg-zinc-800 text-zinc-400' :
                    wasUpgrade ? 'bg-green-900/40 text-green-400' :
                    'bg-red-900/40 text-red-400'
                  }`}
                  title={`R${rec.round}: ${formatValue(rec.chosenIndex !== null ? rec.offers[rec.chosenIndex].card.value : rec.heldCard.value)}`}
                >
                  R{rec.round}: {rec.chosenIndex !== null ? formatValue(rec.offers[rec.chosenIndex].card.value) : 'Kept'}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
