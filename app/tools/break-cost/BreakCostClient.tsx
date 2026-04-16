'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';

/* ─── Types ──────────────────────────────────────────────── */
type BreakFormat = 'random-team' | 'pick-your-team' | 'hit-draft' | 'personal-box';

interface TeamSpot {
  id: string;
  team: string;
  sport: string;
  price: string;
  buyer: string;
  claimed: boolean;
}

interface BreakConfig {
  id: string;
  product: string;
  productCost: string;
  shippingCost: string;
  breakerFee: string;
  format: BreakFormat;
  spots: TeamSpot[];
  createdAt: string;
}

/* ─── Data ───────────────────────────────────────────────── */
const BREAK_FORMATS: { value: BreakFormat; label: string; desc: string }[] = [
  { value: 'random-team', label: 'Random Team', desc: 'Teams randomly assigned after buy-in. Cheapest per spot.' },
  { value: 'pick-your-team', label: 'Pick Your Team (PYT)', desc: 'Buyers choose their team. Popular teams cost more.' },
  { value: 'hit-draft', label: 'Hit Draft', desc: 'All hits drafted snake-style by participants.' },
  { value: 'personal-box', label: 'Personal Box', desc: 'Each buyer gets their own sealed box from a case.' },
];

const POPULAR_PRODUCTS = [
  { name: '2024 Topps Chrome Hobby Box', cost: '250', teams: 30, sport: 'baseball' },
  { name: '2024 Panini Prizm Football Hobby', cost: '500', teams: 32, sport: 'football' },
  { name: '2024-25 Panini Prizm Basketball Hobby', cost: '350', teams: 30, sport: 'basketball' },
  { name: '2024-25 Upper Deck Series 1 Hockey Hobby', cost: '175', teams: 32, sport: 'hockey' },
  { name: '2025 Topps Series 1 Hobby Box', cost: '100', teams: 30, sport: 'baseball' },
  { name: '2024 Panini Prizm Football FOTL', cost: '1200', teams: 32, sport: 'football' },
  { name: '2024 Bowman Chrome Hobby Box', cost: '325', teams: 30, sport: 'baseball' },
  { name: '2024 Topps Chrome Jumbo', cost: '550', teams: 30, sport: 'baseball' },
  { name: '2024-25 Panini Prizm Basketball FOTL', cost: '900', teams: 30, sport: 'basketball' },
  { name: '2024-25 Upper Deck Series 2 Hockey Hobby', cost: '200', teams: 32, sport: 'hockey' },
];

const MLB_TEAMS = ['Arizona Diamondbacks','Atlanta Braves','Baltimore Orioles','Boston Red Sox','Chicago Cubs','Chicago White Sox','Cincinnati Reds','Cleveland Guardians','Colorado Rockies','Detroit Tigers','Houston Astros','Kansas City Royals','Los Angeles Angels','Los Angeles Dodgers','Miami Marlins','Milwaukee Brewers','Minnesota Twins','New York Mets','New York Yankees','Oakland Athletics','Philadelphia Phillies','Pittsburgh Pirates','San Diego Padres','San Francisco Giants','Seattle Mariners','St. Louis Cardinals','Tampa Bay Rays','Texas Rangers','Toronto Blue Jays','Washington Nationals'];
const NBA_TEAMS = ['Atlanta Hawks','Boston Celtics','Brooklyn Nets','Charlotte Hornets','Chicago Bulls','Cleveland Cavaliers','Dallas Mavericks','Denver Nuggets','Detroit Pistons','Golden State Warriors','Houston Rockets','Indiana Pacers','LA Clippers','Los Angeles Lakers','Memphis Grizzlies','Miami Heat','Milwaukee Bucks','Minnesota Timberwolves','New Orleans Pelicans','New York Knicks','Oklahoma City Thunder','Orlando Magic','Philadelphia 76ers','Phoenix Suns','Portland Trail Blazers','Sacramento Kings','San Antonio Spurs','Toronto Raptors','Utah Jazz','Washington Wizards'];
const NFL_TEAMS = ['Arizona Cardinals','Atlanta Falcons','Baltimore Ravens','Buffalo Bills','Carolina Panthers','Chicago Bears','Cincinnati Bengals','Cleveland Browns','Dallas Cowboys','Denver Broncos','Detroit Lions','Green Bay Packers','Houston Texans','Indianapolis Colts','Jacksonville Jaguars','Kansas City Chiefs','Las Vegas Raiders','Los Angeles Chargers','Los Angeles Rams','Miami Dolphins','Minnesota Vikings','New England Patriots','New Orleans Saints','New York Giants','New York Jets','Philadelphia Eagles','Pittsburgh Steelers','San Francisco 49ers','Seattle Seahawks','Tampa Bay Buccaneers','Tennessee Titans','Washington Commanders'];
const NHL_TEAMS = ['Anaheim Ducks','Arizona Coyotes','Boston Bruins','Buffalo Sabres','Calgary Flames','Carolina Hurricanes','Chicago Blackhawks','Colorado Avalanche','Columbus Blue Jackets','Dallas Stars','Detroit Red Wings','Edmonton Oilers','Florida Panthers','Los Angeles Kings','Minnesota Wild','Montreal Canadiens','Nashville Predators','New Jersey Devils','New York Islanders','New York Rangers','Ottawa Senators','Philadelphia Flyers','Pittsburgh Penguins','San Jose Sharks','Seattle Kraken','St. Louis Blues','Tampa Bay Lightning','Toronto Maple Leafs','Utah Hockey Club','Vancouver Canucks','Vegas Golden Knights','Washington Capitals','Winnipeg Jets'];

const TEAM_MAP: Record<string, string[]> = {
  baseball: MLB_TEAMS,
  basketball: NBA_TEAMS,
  football: NFL_TEAMS,
  hockey: NHL_TEAMS,
};

/* PYT tier multipliers — popular teams cost more */
const PYT_TIERS: Record<string, Record<string, number>> = {
  baseball: Object.fromEntries([
    ...['Los Angeles Dodgers','New York Yankees','Atlanta Braves','Philadelphia Phillies','Houston Astros','New York Mets'].map(t => [t, 1.8]),
    ...['Baltimore Orioles','Texas Rangers','San Diego Padres','Boston Red Sox','Chicago Cubs','Minnesota Twins','Cleveland Guardians','Seattle Mariners','Tampa Bay Rays','San Francisco Giants'].map(t => [t, 1.2]),
  ]),
  basketball: Object.fromEntries([
    ...['Oklahoma City Thunder','Boston Celtics','Los Angeles Lakers','Golden State Warriors','Dallas Mavericks','New York Knicks'].map(t => [t, 1.8]),
    ...['Denver Nuggets','Milwaukee Bucks','Phoenix Suns','Philadelphia 76ers','Cleveland Cavaliers','Memphis Grizzlies','Miami Heat','Minnesota Timberwolves','Sacramento Kings','Houston Rockets'].map(t => [t, 1.2]),
  ]),
  football: Object.fromEntries([
    ...['Kansas City Chiefs','Philadelphia Eagles','Dallas Cowboys','San Francisco 49ers','Detroit Lions','Buffalo Bills'].map(t => [t, 1.8]),
    ...['Miami Dolphins','Green Bay Packers','Houston Texans','Baltimore Ravens','Cincinnati Bengals','Chicago Bears','Jacksonville Jaguars','Los Angeles Rams','Pittsburgh Steelers','Minnesota Vikings'].map(t => [t, 1.2]),
  ]),
  hockey: Object.fromEntries([
    ...['Edmonton Oilers','Florida Panthers','Colorado Avalanche','Toronto Maple Leafs','New York Rangers','Dallas Stars'].map(t => [t, 1.8]),
    ...['Boston Bruins','Carolina Hurricanes','Vegas Golden Knights','Winnipeg Jets','Vancouver Canucks','Tampa Bay Lightning','New Jersey Devils','Nashville Predators','Minnesota Wild','Detroit Red Wings'].map(t => [t, 1.2]),
  ]),
};

function getTier(team: string, sport: string): number {
  return PYT_TIERS[sport]?.[team] ?? 1.0;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function fmt(n: number): string {
  return n.toFixed(2).replace(/\.00$/, '');
}

/* ─── Component ──────────────────────────────────────────── */
export default function BreakCostClient() {
  const [breaks, setBreaks] = useState<BreakConfig[]>([]);
  const [activeBreak, setActiveBreak] = useState<BreakConfig | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  /* Form state */
  const [fProduct, setFProduct] = useState('');
  const [fCost, setFCost] = useState('');
  const [fShipping, setFShipping] = useState('');
  const [fFee, setFFee] = useState('10');
  const [fFormat, setFFormat] = useState<BreakFormat>('random-team');
  const [fSport, setFSport] = useState('baseball');
  const [fSpotCount, setFSpotCount] = useState('');

  /* Load from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem('cv-break-cost');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBreaks(parsed);
        if (parsed.length > 0) setActiveBreak(parsed[0]);
      } catch { /* ignore */ }
    }
  }, []);

  /* Save to localStorage */
  const persist = useCallback((updated: BreakConfig[]) => {
    setBreaks(updated);
    localStorage.setItem('cv-break-cost', JSON.stringify(updated));
  }, []);

  /* Auto-fill from product presets */
  const handleProductSelect = (product: typeof POPULAR_PRODUCTS[0]) => {
    setFProduct(product.name);
    setFCost(product.cost);
    setFSport(product.sport);
    setFSpotCount(product.teams.toString());
  };

  /* Create break */
  const handleCreate = () => {
    const cost = parseFloat(fCost) || 0;
    const shipping = parseFloat(fShipping) || 0;
    const feePercent = parseFloat(fFee) || 0;
    const spotCount = parseInt(fSpotCount) || (TEAM_MAP[fSport]?.length ?? 30);
    const teams = TEAM_MAP[fSport] || MLB_TEAMS;
    const selectedTeams = teams.slice(0, spotCount);

    const totalCost = cost + shipping;
    const breakerCut = totalCost * (feePercent / 100);
    const totalToCollect = totalCost + breakerCut;

    let spots: TeamSpot[];

    if (fFormat === 'random-team') {
      const perSpot = totalToCollect / spotCount;
      spots = selectedTeams.map(team => ({
        id: genId(),
        team,
        sport: fSport,
        price: fmt(perSpot),
        buyer: '',
        claimed: false,
      }));
    } else if (fFormat === 'pick-your-team') {
      /* PYT: tier-based pricing */
      const tierSum = selectedTeams.reduce((sum, t) => sum + getTier(t, fSport), 0);
      const baseUnit = totalToCollect / tierSum;
      spots = selectedTeams.map(team => ({
        id: genId(),
        team,
        sport: fSport,
        price: fmt(baseUnit * getTier(team, fSport)),
        buyer: '',
        claimed: false,
      }));
    } else if (fFormat === 'hit-draft') {
      const perSpot = totalToCollect / spotCount;
      spots = Array.from({ length: spotCount }, (_, i) => ({
        id: genId(),
        team: `Spot ${i + 1}`,
        sport: fSport,
        price: fmt(perSpot),
        buyer: '',
        claimed: false,
      }));
    } else {
      /* personal-box */
      const perSpot = totalToCollect / spotCount;
      spots = Array.from({ length: spotCount }, (_, i) => ({
        id: genId(),
        team: `Box ${i + 1}`,
        sport: fSport,
        price: fmt(perSpot),
        buyer: '',
        claimed: false,
      }));
    }

    const newBreak: BreakConfig = {
      id: genId(),
      product: fProduct || 'Custom Break',
      productCost: fCost,
      shippingCost: fShipping || '0',
      breakerFee: fFee,
      format: fFormat,
      spots,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [newBreak, ...breaks];
    persist(updated);
    setActiveBreak(newBreak);
    setShowCreate(false);
    setFProduct('');
    setFCost('');
    setFShipping('');
    setFSpotCount('');
  };

  /* Toggle claimed */
  const toggleClaim = (spotId: string) => {
    if (!activeBreak) return;
    const updated = breaks.map(b => {
      if (b.id !== activeBreak.id) return b;
      return { ...b, spots: b.spots.map(s => s.id === spotId ? { ...s, claimed: !s.claimed } : s) };
    });
    persist(updated);
    setActiveBreak(updated.find(b => b.id === activeBreak.id) || null);
  };

  /* Update buyer name */
  const updateBuyer = (spotId: string, name: string) => {
    if (!activeBreak) return;
    const updated = breaks.map(b => {
      if (b.id !== activeBreak.id) return b;
      return { ...b, spots: b.spots.map(s => s.id === spotId ? { ...s, buyer: name } : s) };
    });
    persist(updated);
    setActiveBreak(updated.find(b => b.id === activeBreak.id) || null);
  };

  /* Delete break */
  const deleteBreak = (id: string) => {
    const updated = breaks.filter(b => b.id !== id);
    persist(updated);
    if (activeBreak?.id === id) setActiveBreak(updated[0] || null);
  };

  /* Copy to clipboard */
  const copyBreakdown = () => {
    if (!activeBreak) return;
    const lines = [
      `Break: ${activeBreak.product}`,
      `Format: ${BREAK_FORMATS.find(f => f.value === activeBreak.format)?.label}`,
      `Product Cost: $${activeBreak.productCost} | Shipping: $${activeBreak.shippingCost} | Breaker Fee: ${activeBreak.breakerFee}%`,
      '',
      ...activeBreak.spots.map(s => `${s.team}: $${s.price}${s.buyer ? ` — ${s.buyer}` : ''}${s.claimed ? ' [SOLD]' : ''}`),
      '',
      `Total: $${fmt(activeBreak.spots.reduce((s, sp) => s + parseFloat(sp.price), 0))}`,
      `${activeBreak.spots.filter(s => s.claimed).length}/${activeBreak.spots.length} spots filled`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
  };

  /* Stats */
  const stats = useMemo(() => {
    if (!activeBreak) return { total: 0, collected: 0, remaining: 0, filled: 0, open: 0, avg: 0, min: 0, max: 0 };
    const prices = activeBreak.spots.map(s => parseFloat(s.price));
    const total = prices.reduce((s, p) => s + p, 0);
    const collected = activeBreak.spots.filter(s => s.claimed).reduce((sum, s) => sum + parseFloat(s.price), 0);
    const filled = activeBreak.spots.filter(s => s.claimed).length;
    return {
      total,
      collected,
      remaining: total - collected,
      filled,
      open: activeBreak.spots.length - filled,
      avg: total / activeBreak.spots.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [activeBreak]);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      {activeBreak && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Price', value: `$${fmt(stats.total)}`, color: 'text-amber-400' },
            { label: 'Collected', value: `$${fmt(stats.collected)}`, color: 'text-emerald-400' },
            { label: 'Remaining', value: `$${fmt(stats.remaining)}`, color: 'text-rose-400' },
            { label: 'Spots Filled', value: `${stats.filled}/${activeBreak.spots.length}`, color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowCreate(!showCreate)} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + New Break
        </button>
        {activeBreak && (
          <>
            <button onClick={copyBreakdown} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Copy Breakdown
            </button>
            <button onClick={() => deleteBreak(activeBreak.id)} className="bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-slate-700">
              Delete
            </button>
          </>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-slate-800/60 border border-amber-800/40 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-bold text-lg">Set Up New Break</h3>

          {/* Quick-fill presets */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-2">Quick Fill — Popular Products</label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_PRODUCTS.map(p => (
                <button key={p.name} onClick={() => handleProductSelect(p)} className="bg-slate-700/60 hover:bg-amber-900/40 text-slate-300 hover:text-amber-300 text-xs px-3 py-1.5 rounded-lg border border-slate-600 hover:border-amber-700/50 transition-colors">
                  {p.name.replace(/20\d\d(-\d\d)?\s/, '').replace(' Hobby Box', '').replace(' Hobby', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">Product Name</label>
              <input value={fProduct} onChange={e => setFProduct(e.target.value)} placeholder="e.g. 2024 Topps Chrome Hobby" className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">Product Cost ($)</label>
              <input type="number" value={fCost} onChange={e => setFCost(e.target.value)} placeholder="250" className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">Shipping Cost ($)</label>
              <input type="number" value={fShipping} onChange={e => setFShipping(e.target.value)} placeholder="15" className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">Breaker Fee (%)</label>
              <input type="number" value={fFee} onChange={e => setFFee(e.target.value)} placeholder="10" className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">Sport</label>
              <select value={fSport} onChange={e => setFSport(e.target.value)} className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="baseball">Baseball (30 teams)</option>
                <option value="basketball">Basketball (30 teams)</option>
                <option value="football">Football (32 teams)</option>
                <option value="hockey">Hockey (33 teams)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">Break Format</label>
              <select value={fFormat} onChange={e => setFFormat(e.target.value as BreakFormat)} className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                {BREAK_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1">Number of Spots</label>
              <input type="number" value={fSpotCount} onChange={e => setFSpotCount(e.target.value)} placeholder={`${TEAM_MAP[fSport]?.length ?? 30}`} className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs">
              <strong className="text-amber-400">{BREAK_FORMATS.find(f => f.value === fFormat)?.label}:</strong>{' '}
              {BREAK_FORMATS.find(f => f.value === fFormat)?.desc}
              {fFormat === 'pick-your-team' && ' Top-tier teams (e.g. Yankees, Chiefs, Lakers) cost ~1.8x base. Mid-tier ~1.2x. Others at base price.'}
            </p>
          </div>

          <button onClick={handleCreate} disabled={!fCost} className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors text-sm">
            Calculate Break Pricing
          </button>
        </div>
      )}

      {/* Break selector (if multiple) */}
      {breaks.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {breaks.map(b => (
            <button key={b.id} onClick={() => setActiveBreak(b)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${activeBreak?.id === b.id ? 'bg-amber-900/40 border-amber-700/50 text-amber-300' : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'}`}>
              {b.product} ({b.createdAt})
            </button>
          ))}
        </div>
      )}

      {/* Spot grid */}
      {activeBreak && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold">
              {activeBreak.product} — {BREAK_FORMATS.find(f => f.value === activeBreak.format)?.label}
            </h3>
            {activeBreak.format === 'pick-your-team' && (
              <span className="text-amber-400 text-xs bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded">Tiered Pricing</span>
            )}
          </div>

          {/* Price range indicator */}
          {stats.min !== stats.max && (
            <div className="mb-3 text-xs text-slate-500">
              Price range: <span className="text-emerald-400">${fmt(stats.min)}</span> — <span className="text-amber-400">${fmt(stats.max)}</span> | Avg: <span className="text-white">${fmt(stats.avg)}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activeBreak.spots.map(spot => {
              const tier = getTier(spot.team, spot.sport);
              const tierLabel = tier >= 1.8 ? 'Premium' : tier >= 1.2 ? 'Mid' : 'Base';
              const tierColor = tier >= 1.8 ? 'text-amber-400' : tier >= 1.2 ? 'text-cyan-400' : 'text-slate-500';
              return (
                <div key={spot.id} className={`border rounded-lg p-3 transition-colors ${spot.claimed ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-slate-800/40 border-slate-700/50 hover:border-amber-700/40'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-sm font-medium truncate flex-1">{spot.team}</span>
                    <span className="text-amber-400 font-bold text-sm ml-2">${spot.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spot.buyer}
                      onChange={e => updateBuyer(spot.id, e.target.value)}
                      placeholder="Buyer name"
                      className="flex-1 bg-slate-900/60 border border-slate-700 rounded px-2 py-1 text-xs text-white placeholder:text-slate-600"
                    />
                    <button onClick={() => toggleClaim(spot.id)} className={`text-xs px-2 py-1 rounded font-medium transition-colors ${spot.claimed ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-800/40' : 'bg-slate-700/60 text-slate-400 hover:text-white border border-slate-600'}`}>
                      {spot.claimed ? 'Sold' : 'Open'}
                    </button>
                  </div>
                  {activeBreak.format === 'pick-your-team' && (
                    <div className={`text-xs mt-1 ${tierColor}`}>{tierLabel} tier ({tier}x)</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {breaks.length === 0 && !showCreate && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-white font-bold text-lg mb-2">No Breaks Yet</h3>
          <p className="text-slate-400 text-sm mb-4">Create a break to calculate fair spot pricing for all participants.</p>
          <button onClick={() => setShowCreate(true)} className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
            + Set Up First Break
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">How Break Cost Splitting Works</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Enter Product Details', desc: 'Add the product cost, shipping, and your breaker fee percentage.' },
            { step: '2', title: 'Choose Format & Sport', desc: 'Pick the break format. PYT uses tiered pricing — popular teams cost more.' },
            { step: '3', title: 'Get Fair Pricing', desc: 'The tool calculates each spot price including all costs and fees.' },
            { step: '4', title: 'Track & Share', desc: 'Mark spots as sold, add buyer names, and copy the breakdown to share.' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-900/40 border border-amber-800/40 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 text-xs font-bold">{s.step}</span>
              </div>
              <div>
                <span className="text-white text-sm font-medium">{s.title}</span>
                <p className="text-slate-400 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
