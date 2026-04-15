'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';

interface BreakSpot {
  id: number;
  team: string;
  sport: string;
  price: number;
  owner: string | null; // null = open, 'you' = user, otherwise NPC name
}

interface Pull {
  cardName: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'hit' | 'legendary';
  spotId: number;
}

type BreakFormat = 'random-team' | 'pick-your-team' | 'hit-draft';
type BreakStatus = 'lobby' | 'filling' | 'breaking' | 'results';

const MLB_TEAMS = ['Yankees', 'Dodgers', 'Braves', 'Astros', 'Phillies', 'Mets', 'Cubs', 'Red Sox', 'Padres', 'Orioles', 'Rangers', 'Mariners', 'Cardinals', 'Giants', 'Guardians', 'Tigers', 'Twins', 'Brewers', 'Diamondbacks', 'Rays', 'Blue Jays', 'White Sox', 'Reds', 'Pirates', 'Royals', 'Angels', 'Athletics', 'Nationals', 'Rockies', 'Marlins'];
const NBA_TEAMS = ['Celtics', 'Lakers', 'Warriors', 'Nuggets', 'Bucks', 'Heat', 'Suns', 'Knicks', 'Sixers', 'Nets', 'Clippers', 'Mavericks', 'Cavaliers', 'Thunder', 'Timberwolves', 'Kings', 'Pelicans', 'Hawks', 'Raptors', 'Bulls', 'Magic', 'Pacers', 'Grizzlies', 'Spurs', 'Trail Blazers', 'Rockets', 'Hornets', 'Pistons', 'Jazz', 'Wizards'];
const NFL_TEAMS = ['Chiefs', 'Bills', 'Eagles', 'Cowboys', '49ers', 'Lions', 'Ravens', 'Dolphins', 'Bengals', 'Packers', 'Jets', 'Texans', 'Jaguars', 'Browns', 'Steelers', 'Colts', 'Chargers', 'Broncos', 'Raiders', 'Vikings', 'Bears', 'Saints', 'Buccaneers', 'Falcons', 'Seahawks', 'Commanders', 'Cardinals', 'Rams', 'Panthers', 'Giants', 'Titans', 'Patriots'];
const NHL_TEAMS = ['Panthers', 'Oilers', 'Rangers', 'Stars', 'Avalanche', 'Hurricanes', 'Bruins', 'Maple Leafs', 'Lightning', 'Devils', 'Islanders', 'Capitals', 'Penguins', 'Canadiens', 'Red Wings', 'Senators', 'Sabres', 'Flyers', 'Blue Jackets', 'Wild', 'Jets', 'Predators', 'Blues', 'Blackhawks', 'Flames', 'Canucks', 'Kraken', 'Golden Knights', 'Coyotes', 'Ducks', 'Sharks', 'Kings'];

const BREAK_PRODUCTS = [
  { id: 'topps-chrome', name: '2024 Topps Chrome Hobby Box', sport: 'baseball', teams: MLB_TEAMS, totalValue: 450, spots: 30, pricePerSpot: 18 },
  { id: 'prizm-basketball', name: '2024-25 Panini Prizm Hobby Box', sport: 'basketball', teams: NBA_TEAMS, totalValue: 800, spots: 30, pricePerSpot: 32 },
  { id: 'prizm-football', name: '2024 Panini Prizm Football Hobby', sport: 'football', teams: NFL_TEAMS, totalValue: 600, spots: 32, pricePerSpot: 22 },
  { id: 'upper-deck', name: '2024-25 Upper Deck Series 1 Hobby', sport: 'hockey', teams: NHL_TEAMS, totalValue: 350, spots: 32, pricePerSpot: 14 },
];

const NPC_NAMES = ['CardKingMike', 'RipCityBreaks', 'JaxWax', 'PullParty', 'ChaseThePrizm', 'BigHitBreakers', 'WaxAddict', 'SlabCity', 'PackRipKing', 'GemMintGary', 'TheCardDoc', 'PrizmPatrol', 'ToppsKing', 'ChromeChaser', 'RookieHunter', 'VintageVince', 'ModernMaster', 'HitMachine', 'BoxBuster99', 'CardFlipKing'];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generatePulls(product: typeof BREAK_PRODUCTS[0], spots: BreakSpot[], seed: number): Pull[] {
  const rng = seededRandom(seed);
  const pulls: Pull[] = [];
  const cardCount = 20 + Math.floor(rng() * 10);

  for (let i = 0; i < cardCount; i++) {
    const roll = rng();
    let rarity: Pull['rarity'];
    let value: number;

    if (roll < 0.02) {
      rarity = 'legendary';
      value = 100 + Math.floor(rng() * 400);
    } else if (roll < 0.08) {
      rarity = 'hit';
      value = 30 + Math.floor(rng() * 70);
    } else if (roll < 0.25) {
      rarity = 'rare';
      value = 10 + Math.floor(rng() * 25);
    } else if (roll < 0.50) {
      rarity = 'uncommon';
      value = 3 + Math.floor(rng() * 8);
    } else {
      rarity = 'common';
      value = 1 + Math.floor(rng() * 3);
    }

    const spotIdx = Math.floor(rng() * spots.length);
    const team = spots[spotIdx].team;
    const names = {
      baseball: [`${team} Rookie Auto`, `${team} Base Chrome`, `${team} Refractor`, `${team} Numbered /250`, `${team} Parallel`],
      basketball: [`${team} Prizm Silver`, `${team} Base Prizm`, `${team} Color Blast`, `${team} Numbered /199`, `${team} Auto`],
      football: [`${team} Prizm Silver`, `${team} Base Prizm`, `${team} Downtown`, `${team} Numbered /149`, `${team} Auto Patch`],
      hockey: [`${team} Young Guns`, `${team} Base UD`, `${team} Canvas`, `${team} Numbered /249`, `${team} Auto Patch`],
    };

    const sportNames = names[product.sport as keyof typeof names] || names.baseball;
    const nameIdx = rarity === 'legendary' ? 0 : rarity === 'hit' ? 3 : rarity === 'rare' ? 2 : rarity === 'uncommon' ? 4 : 1;

    pulls.push({
      cardName: sportNames[nameIdx] || `${team} Card`,
      value,
      rarity,
      spotId: spots[spotIdx].id,
    });
  }

  return pulls;
}

const rarityColors: Record<string, string> = {
  common: 'bg-zinc-700 text-zinc-300',
  uncommon: 'bg-blue-900/60 text-blue-400',
  rare: 'bg-purple-900/60 text-purple-400',
  hit: 'bg-amber-900/60 text-amber-400',
  legendary: 'bg-red-900/60 text-red-400',
};

export default function GroupBreakClient() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [format, setFormat] = useState<BreakFormat>('pick-your-team');
  const [status, setStatus] = useState<BreakStatus>('lobby');
  const [spots, setSpots] = useState<BreakSpot[]>([]);
  const [userSpot, setUserSpot] = useState<number | null>(null);
  const [pulls, setPulls] = useState<Pull[]>([]);
  const [revealIdx, setRevealIdx] = useState(0);
  const [breakSeed] = useState(() => Date.now());

  const product = useMemo(() => BREAK_PRODUCTS.find(p => p.id === selectedProduct), [selectedProduct]);

  const initSpots = useCallback((prod: typeof BREAK_PRODUCTS[0]) => {
    const rng = seededRandom(breakSeed);
    const newSpots: BreakSpot[] = prod.teams.slice(0, prod.spots).map((team, i) => {
      const isNpc = rng() < 0.6;
      return {
        id: i,
        team,
        sport: prod.sport,
        price: prod.pricePerSpot,
        owner: isNpc ? NPC_NAMES[Math.floor(rng() * NPC_NAMES.length)] : null,
      };
    });
    setSpots(newSpots);
    setStatus('filling');
    setUserSpot(null);
    setPulls([]);
    setRevealIdx(0);
  }, [breakSeed]);

  function selectSpot(spotId: number) {
    if (status !== 'filling' || userSpot !== null) return;
    setSpots(prev => prev.map(s => s.id === spotId ? { ...s, owner: 'you' } : s));
    setUserSpot(spotId);
  }

  function startBreak() {
    if (!product || userSpot === null) return;
    // Fill remaining open spots with NPCs
    const rng = seededRandom(breakSeed + 1);
    const filled = spots.map(s => ({
      ...s,
      owner: s.owner || NPC_NAMES[Math.floor(rng() * NPC_NAMES.length)],
    }));
    setSpots(filled);
    const newPulls = generatePulls(product, filled, breakSeed + 2);
    setPulls(newPulls);
    setStatus('breaking');
    setRevealIdx(0);
  }

  // Auto-reveal pulls during break
  useEffect(() => {
    if (status !== 'breaking') return;
    if (revealIdx >= pulls.length) {
      const timer = setTimeout(() => setStatus('results'), 1000);
      return () => clearTimeout(timer);
    }
    const delay = pulls[revealIdx]?.rarity === 'legendary' ? 1500 : pulls[revealIdx]?.rarity === 'hit' ? 1000 : 500;
    const timer = setTimeout(() => setRevealIdx(prev => prev + 1), delay);
    return () => clearTimeout(timer);
  }, [status, revealIdx, pulls]);

  const userPulls = useMemo(() => pulls.filter(p => p.spotId === userSpot), [pulls, userSpot]);
  const userValue = useMemo(() => userPulls.reduce((sum, p) => sum + p.value, 0), [userPulls]);
  const spotPrice = product?.pricePerSpot ?? 0;

  function resetBreak() {
    setSelectedProduct(null);
    setStatus('lobby');
    setSpots([]);
    setUserSpot(null);
    setPulls([]);
    setRevealIdx(0);
  }

  // LOBBY — select product & format
  if (status === 'lobby') {
    return (
      <div className="space-y-8">
        {/* Format selector */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Break Format</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { id: 'pick-your-team' as BreakFormat, label: 'Pick Your Team', desc: 'Choose your team. All cards of that team are yours.', icon: '🎯' },
              { id: 'random-team' as BreakFormat, label: 'Random Team', desc: 'Teams assigned randomly. Cheapest spots, biggest upside.', icon: '🎲' },
              { id: 'hit-draft' as BreakFormat, label: 'Hit Draft', desc: 'Hits are drafted in spot order. Strategy matters.', icon: '👑' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  format === f.id
                    ? 'border-emerald-600 bg-emerald-950/30 ring-1 ring-emerald-600/30'
                    : 'border-zinc-700 bg-zinc-800/40 hover:border-zinc-600'
                }`}
              >
                <div className="text-xl mb-1">{f.icon}</div>
                <div className={`font-semibold ${format === f.id ? 'text-emerald-400' : 'text-white'}`}>{f.label}</div>
                <p className="text-xs text-zinc-400 mt-1">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Product selector */}
        <div>
          <h2 className="text-lg font-bold text-white mb-3">Select Product to Break</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {BREAK_PRODUCTS.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelectedProduct(p.id); initSpots(p); }}
                className="p-4 rounded-xl border border-zinc-700 bg-zinc-800/40 hover:border-emerald-600 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-400">{p.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300 capitalize">{p.sport}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span>{p.spots} spots</span>
                  <span>${p.pricePerSpot}/spot</span>
                  <span>~${p.totalValue} total value</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-3">How Group Breaks Work</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Pick a Product', desc: 'Choose which box to break — baseball, basketball, football, or hockey.' },
              { step: '2', title: 'Buy a Spot', desc: 'Pick your team. Every card of that team pulled from the box is yours.' },
              { step: '3', title: 'Watch the Break', desc: 'Cards are revealed one by one. See what each team gets in real time.' },
              { step: '4', title: 'Collect Your Cards', desc: 'Your team\'s pulls go to your collection. Big hits could be in any pack!' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-900/60 text-emerald-400 font-bold flex items-center justify-center mx-auto mb-2">{s.step}</div>
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // FILLING — pick your spot
  if (status === 'filling' && product) {
    const filledCount = spots.filter(s => s.owner !== null).length;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{product.name}</h2>
            <p className="text-sm text-zinc-400">{format === 'pick-your-team' ? 'Pick your team' : format === 'random-team' ? 'Random assignment' : 'Hit draft'} — {filledCount}/{spots.length} spots filled</p>
          </div>
          <button onClick={resetBreak} className="text-xs text-zinc-500 hover:text-white px-3 py-1 border border-zinc-700 rounded-lg">
            Back
          </button>
        </div>

        <div className="bg-zinc-900/60 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(filledCount / spots.length) * 100}%` }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {spots.map(spot => {
            const isUser = spot.owner === 'you';
            const isTaken = spot.owner !== null && !isUser;
            const isOpen = spot.owner === null;

            return (
              <button
                key={spot.id}
                onClick={() => isOpen && selectSpot(spot.id)}
                disabled={!isOpen || userSpot !== null}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isUser ? 'border-emerald-600 bg-emerald-950/40 ring-1 ring-emerald-600/30' :
                  isTaken ? 'border-zinc-700 bg-zinc-800/30 opacity-60 cursor-default' :
                  'border-zinc-700 bg-zinc-800/40 hover:border-emerald-600 hover:bg-emerald-950/20 cursor-pointer'
                }`}
              >
                <div className={`text-sm font-bold ${isUser ? 'text-emerald-400' : isTaken ? 'text-zinc-500' : 'text-white'}`}>
                  {spot.team}
                </div>
                <div className="text-xs text-zinc-400 mt-1">${spot.price}</div>
                <div className={`text-xs mt-1 ${isUser ? 'text-emerald-400' : isTaken ? 'text-zinc-600' : 'text-emerald-600'}`}>
                  {isUser ? 'YOUR SPOT' : isTaken ? spot.owner : 'OPEN'}
                </div>
              </button>
            );
          })}
        </div>

        {userSpot !== null && (
          <div className="text-center">
            <button
              onClick={startBreak}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg transition-colors"
            >
              Start Break
            </button>
            <p className="text-xs text-zinc-500 mt-2">
              Your team: <span className="text-emerald-400 font-bold">{spots.find(s => s.id === userSpot)?.team}</span> — ${spotPrice}
            </p>
          </div>
        )}
      </div>
    );
  }

  // BREAKING — reveal cards
  if ((status === 'breaking' || status === 'results') && product) {
    const revealedPulls = pulls.slice(0, revealIdx);
    const userTeam = spots.find(s => s.id === userSpot)?.team ?? '';

    if (status === 'results') {
      // Results view
      const spotResults = spots.map(spot => {
        const spotPulls = pulls.filter(p => p.spotId === spot.id);
        const totalVal = spotPulls.reduce((s, p) => s + p.value, 0);
        return { ...spot, pulls: spotPulls, totalValue: totalVal };
      }).sort((a, b) => b.totalValue - a.totalValue);

      const roi = ((userValue - spotPrice) / spotPrice * 100).toFixed(0);

      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Break Complete!</h2>
            <p className="text-zinc-400">{product.name} — {format.replace(/-/g, ' ')}</p>
          </div>

          {/* Your results */}
          <div className={`border rounded-2xl p-6 ${userValue >= spotPrice ? 'border-emerald-600/50 bg-emerald-950/20' : 'border-red-600/50 bg-red-950/20'}`}>
            <h3 className="text-lg font-bold text-white mb-1">Your Pulls — {userTeam}</h3>
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-2xl font-black text-white">${userValue}</div>
                <div className="text-xs text-zinc-400">Total Value</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">${spotPrice}</div>
                <div className="text-xs text-zinc-400">Spot Cost</div>
              </div>
              <div>
                <div className={`text-2xl font-black ${userValue >= spotPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                  {userValue >= spotPrice ? '+' : ''}{roi}%
                </div>
                <div className="text-xs text-zinc-400">ROI</div>
              </div>
            </div>
            {userPulls.length === 0 ? (
              <p className="text-zinc-500 text-sm">No cards landed for your team this break. That's the gamble!</p>
            ) : (
              <div className="space-y-2">
                {userPulls.sort((a, b) => b.value - a.value).map((pull, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/40 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${rarityColors[pull.rarity]}`}>{pull.rarity}</span>
                      <span className="text-sm text-white">{pull.cardName}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">${pull.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Break Leaderboard</h3>
            <div className="space-y-2">
              {spotResults.slice(0, 10).map((spot, i) => (
                <div key={spot.id} className={`flex items-center justify-between p-2 rounded-lg ${spot.owner === 'you' ? 'bg-emerald-950/30 border border-emerald-800/40' : 'bg-zinc-800/30'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold w-6 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>
                      #{i + 1}
                    </span>
                    <span className="text-sm text-white">{spot.team}</span>
                    <span className="text-xs text-zinc-500">({spot.owner === 'you' ? 'YOU' : spot.owner})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">{spot.pulls.length} cards</span>
                    <span className={`text-sm font-bold ${spot.totalValue >= spotPrice ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${spot.totalValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={resetBreak} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors">
              Join Another Break
            </button>
            <Link href="/break-room" className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors">
              Break Room
            </Link>
          </div>
        </div>
      );
    }

    // Breaking animation
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-1">Breaking: {product.name}</h2>
          <p className="text-sm text-zinc-400">
            Card {revealIdx}/{pulls.length} — Your team: <span className="text-emerald-400 font-bold">{userTeam}</span>
          </p>
          <div className="mt-3 bg-zinc-800 rounded-full h-2 max-w-md mx-auto">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(revealIdx / pulls.length) * 100}%` }} />
          </div>
        </div>

        {/* Current reveal */}
        {revealIdx > 0 && (
          <div className="flex justify-center">
            {(() => {
              const current = pulls[revealIdx - 1];
              const isYours = current.spotId === userSpot;
              return (
                <div className={`p-6 rounded-2xl border text-center transition-all transform scale-100 animate-pulse ${
                  isYours ? 'border-emerald-500 bg-emerald-950/30' : 'border-zinc-700 bg-zinc-800/40'
                }`}>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${rarityColors[current.rarity]}`}>{current.rarity}</span>
                  <div className="text-lg font-bold text-white mt-2">{current.cardName}</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">${current.value}</div>
                  <div className={`text-xs mt-2 ${isYours ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}>
                    {isYours ? 'YOUR CARD!' : spots.find(s => s.id === current.spotId)?.team}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Your running total */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-sm text-zinc-400">Your pulls so far</div>
          <div className="text-2xl font-black text-white mt-1">
            ${revealedPulls.filter(p => p.spotId === userSpot).reduce((s, p) => s + p.value, 0)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {revealedPulls.filter(p => p.spotId === userSpot).length} cards — Spot cost: ${spotPrice}
          </div>
        </div>

        {/* Recent pulls feed */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 max-h-60 overflow-y-auto">
          <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Pull Feed</h3>
          <div className="space-y-1">
            {revealedPulls.slice(-8).reverse().map((pull, i) => {
              const isYours = pull.spotId === userSpot;
              return (
                <div key={i} className={`flex items-center justify-between p-1.5 rounded ${isYours ? 'bg-emerald-950/30' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${rarityColors[pull.rarity]}`}>{pull.rarity.slice(0, 3)}</span>
                    <span className="text-xs text-zinc-300">{pull.cardName}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-400">${pull.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
