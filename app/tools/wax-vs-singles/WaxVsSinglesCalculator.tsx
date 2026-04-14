'use client';

import { useState, useMemo } from 'react';

interface SealedProduct {
  id: string;
  name: string;
  sport: string;
  price: number;
  packsPerBox: number;
  cardsPerPack: number;
  setSize: number;
  guaranteedHits: string;
  hitRate: string;
}

interface WantListCard {
  id: string;
  name: string;
  price: number;
  rarity: 'base' | 'insert' | 'short-print' | 'auto-relic' | 'parallel';
}

const sealedProducts: SealedProduct[] = [
  { id: 'topps-chrome-2024-hobby', name: '2024 Topps Chrome Hobby', sport: 'Baseball', price: 250, packsPerBox: 24, cardsPerPack: 4, setSize: 200, guaranteedHits: '2 autos', hitRate: '1 auto per 12 packs' },
  { id: 'topps-series-1-2025-hobby', name: '2025 Topps Series 1 Hobby', sport: 'Baseball', price: 80, packsPerBox: 24, cardsPerPack: 14, setSize: 330, guaranteedHits: '1 auto or relic', hitRate: '1 hit per 24 packs' },
  { id: 'bowman-chrome-2024-hobby', name: '2024 Bowman Chrome Hobby', sport: 'Baseball', price: 300, packsPerBox: 24, cardsPerPack: 4, setSize: 150, guaranteedHits: '2 autos', hitRate: '1 auto per 12 packs' },
  { id: 'topps-chrome-2024-blaster', name: '2024 Topps Chrome Blaster', sport: 'Baseball', price: 40, packsPerBox: 8, cardsPerPack: 4, setSize: 200, guaranteedHits: 'None guaranteed', hitRate: '~1 insert per 3 packs' },
  { id: 'prizm-basketball-2024-hobby', name: '2024-25 Prizm Basketball Hobby', sport: 'Basketball', price: 500, packsPerBox: 12, cardsPerPack: 12, setSize: 300, guaranteedHits: '2 autos, 12 Prizm parallels', hitRate: '1 auto per 6 packs' },
  { id: 'prizm-basketball-2024-blaster', name: '2024-25 Prizm Basketball Blaster', sport: 'Basketball', price: 50, packsPerBox: 6, cardsPerPack: 4, setSize: 300, guaranteedHits: 'None guaranteed', hitRate: '~1 insert per 4 packs' },
  { id: 'select-basketball-2024-hobby', name: '2024-25 Select Basketball Hobby', sport: 'Basketball', price: 700, packsPerBox: 12, cardsPerPack: 8, setSize: 250, guaranteedHits: '3 autos', hitRate: '1 auto per 4 packs' },
  { id: 'prizm-football-2024-hobby', name: '2024 Prizm Football Hobby', sport: 'Football', price: 600, packsPerBox: 12, cardsPerPack: 12, setSize: 400, guaranteedHits: '2 autos, 10 Prizm parallels', hitRate: '1 auto per 6 packs' },
  { id: 'prizm-football-2024-blaster', name: '2024 Prizm Football Blaster', sport: 'Football', price: 50, packsPerBox: 6, cardsPerPack: 4, setSize: 400, guaranteedHits: 'None guaranteed', hitRate: '~1 insert per 4 packs' },
  { id: 'optic-football-2024-hobby', name: '2024 Optic Football Hobby', sport: 'Football', price: 350, packsPerBox: 20, cardsPerPack: 4, setSize: 200, guaranteedHits: '1 auto', hitRate: '1 auto per 20 packs' },
  { id: 'upper-deck-hockey-2024-hobby', name: '2024-25 Upper Deck Series 1 Hobby', sport: 'Hockey', price: 120, packsPerBox: 24, cardsPerPack: 8, setSize: 250, guaranteedHits: '6 Young Guns', hitRate: '1 YG per 4 packs' },
  { id: 'upper-deck-hockey-2024-blaster', name: '2024-25 Upper Deck Series 1 Blaster', sport: 'Hockey', price: 35, packsPerBox: 8, cardsPerPack: 8, setSize: 250, guaranteedHits: '2 Young Guns', hitRate: '1 YG per 4 packs' },
  { id: 'pokemon-prismatic-etb', name: 'Pokemon Prismatic Evolutions ETB', sport: 'Pokemon', price: 55, packsPerBox: 9, cardsPerPack: 10, setSize: 180, guaranteedHits: 'None guaranteed', hitRate: '~1 holo per 3 packs' },
  { id: 'pokemon-journey-together-bb', name: 'Pokemon Journey Together Booster Box', sport: 'Pokemon', price: 130, packsPerBox: 36, cardsPerPack: 10, setSize: 160, guaranteedHits: '~36 holos/rares', hitRate: '~1 rare+ per pack' },
  { id: 'pokemon-surging-sparks-bb', name: 'Pokemon Surging Sparks Booster Box', sport: 'Pokemon', price: 110, packsPerBox: 36, cardsPerPack: 10, setSize: 190, guaranteedHits: '~36 holos/rares', hitRate: '~1 rare+ per pack' },
];

const rarityMultipliers: Record<WantListCard['rarity'], { label: string; boxesNeeded: number; desc: string }> = {
  'base': { label: 'Base Card', boxesNeeded: 0.5, desc: '~2 per box on average' },
  'insert': { label: 'Insert / Holo', boxesNeeded: 2, desc: '~1 per 2 boxes' },
  'short-print': { label: 'Short Print / SSP', boxesNeeded: 8, desc: '~1 per 8 boxes' },
  'auto-relic': { label: 'Auto / Relic', boxesNeeded: 15, desc: '~1 per 15 boxes' },
  'parallel': { label: 'Numbered Parallel', boxesNeeded: 25, desc: '~1 per 25 boxes' },
};

let cardId = 0;

export default function WaxVsSinglesCalculator() {
  const [selectedProduct, setSelectedProduct] = useState<SealedProduct>(sealedProducts[0]);
  const [sportFilter, setSportFilter] = useState('All');
  const [wantList, setWantList] = useState<WantListCard[]>([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardPrice, setNewCardPrice] = useState('');
  const [newCardRarity, setNewCardRarity] = useState<WantListCard['rarity']>('base');
  const [shippingPerCard, setShippingPerCard] = useState(2);
  const [customBoxPrice, setCustomBoxPrice] = useState('');

  const sports = ['All', ...Array.from(new Set(sealedProducts.map(p => p.sport)))];

  const filteredProducts = sportFilter === 'All'
    ? sealedProducts
    : sealedProducts.filter(p => p.sport === sportFilter);

  const addCard = () => {
    const price = parseFloat(newCardPrice);
    if (!newCardName.trim() || isNaN(price) || price <= 0) return;
    setWantList(prev => [...prev, {
      id: `card-${++cardId}`,
      name: newCardName.trim(),
      price,
      rarity: newCardRarity,
    }]);
    setNewCardName('');
    setNewCardPrice('');
  };

  const removeCard = (id: string) => {
    setWantList(prev => prev.filter(c => c.id !== id));
  };

  const boxPrice = customBoxPrice ? parseFloat(customBoxPrice) || selectedProduct.price : selectedProduct.price;

  const analysis = useMemo(() => {
    if (wantList.length === 0) return null;

    const totalSinglesRaw = wantList.reduce((sum, c) => sum + c.price, 0);
    const totalShipping = wantList.length * shippingPerCard;
    const totalSinglesCost = totalSinglesRaw + totalShipping;

    // Calculate expected boxes needed based on rarity of wanted cards
    const boxesNeededPerCard = wantList.map(c => ({
      ...c,
      boxesNeeded: rarityMultipliers[c.rarity].boxesNeeded,
    }));

    // Total boxes needed is max of any individual card (since you need ALL cards)
    const maxBoxesNeeded = Math.max(...boxesNeededPerCard.map(c => c.boxesNeeded));
    // But if you want multiple base cards, you might need more boxes
    const totalBaseCards = wantList.filter(c => c.rarity === 'base').length;
    const baseBoxesForAll = Math.ceil(totalBaseCards * 0.5);
    const effectiveBoxes = Math.max(maxBoxesNeeded, baseBoxesForAll);
    const roundedBoxes = Math.ceil(effectiveBoxes);

    const totalWaxCost = roundedBoxes * boxPrice;
    const savings = totalWaxCost - totalSinglesCost;
    const savingsPercent = ((savings / totalWaxCost) * 100);
    const verdict = totalSinglesCost < totalWaxCost ? 'singles' : 'wax';

    // Residual value estimate from wax (cards you pull but dont want)
    const cardsPerBox = selectedProduct.packsPerBox * selectedProduct.cardsPerPack;
    const totalCardsPulled = roundedBoxes * cardsPerBox;
    const residualPerCard = 0.15; // average bulk card value
    const residualValue = totalCardsPulled * residualPerCard;

    return {
      totalSinglesRaw,
      totalShipping,
      totalSinglesCost,
      roundedBoxes,
      totalWaxCost,
      savings: Math.abs(savings),
      savingsPercent: Math.abs(savingsPercent),
      verdict,
      residualValue,
      totalCardsPulled,
      boxesNeededPerCard,
    };
  }, [wantList, boxPrice, shippingPerCard, selectedProduct]);

  return (
    <div className="space-y-8">
      {/* Product Selection */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Step 1: Choose a Sealed Product</h2>

        {/* Sport Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sports.map(sport => (
            <button
              key={sport}
              onClick={() => { setSportFilter(sport); setSelectedProduct(sealedProducts.find(p => sport === 'All' || p.sport === sport) || sealedProducts[0]); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sportFilter === sport
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-700/50'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                selectedProduct.id === product.id
                  ? 'bg-amber-500/10 border-amber-700/50'
                  : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600'
              }`}
            >
              <div className="text-white font-medium text-sm">{product.name}</div>
              <div className="text-amber-400 font-bold mt-1">${product.price}</div>
              <div className="text-zinc-500 text-xs mt-1">{product.packsPerBox}pk / {product.cardsPerPack}cards - {product.guaranteedHits}</div>
            </button>
          ))}
        </div>

        {/* Selected Product Info */}
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-white font-semibold">{selectedProduct.name}</div>
              <div className="text-zinc-400 text-sm mt-1">
                {selectedProduct.packsPerBox} packs x {selectedProduct.cardsPerPack} cards = {selectedProduct.packsPerBox * selectedProduct.cardsPerPack} total cards per box
              </div>
              <div className="text-zinc-500 text-xs mt-1">Hits: {selectedProduct.guaranteedHits} | {selectedProduct.hitRate}</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-zinc-400 text-sm">Box Price:</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <input
                  type="number"
                  value={customBoxPrice || selectedProduct.price}
                  onChange={e => setCustomBoxPrice(e.target.value)}
                  className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Want List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Step 2: Build Your Want List</h2>
        <p className="text-zinc-400 text-sm mb-4">
          Add the specific cards you want from this set. Include each card&#39;s current market price.
        </p>

        {/* Add Card Form */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Card name (e.g., Ohtani Base RC)"
            value={newCardName}
            onChange={e => setNewCardName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCard()}
            className="flex-1 min-w-[200px] bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500"
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              type="number"
              placeholder="Price"
              value={newCardPrice}
              onChange={e => setNewCardPrice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCard()}
              className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm placeholder:text-zinc-500"
            />
          </div>
          <select
            value={newCardRarity}
            onChange={e => setNewCardRarity(e.target.value as WantListCard['rarity'])}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm"
          >
            {Object.entries(rarityMultipliers).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button
            onClick={addCard}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Add Card
          </button>
        </div>

        {/* Shipping Cost */}
        <div className="flex items-center gap-2 mb-4">
          <label className="text-zinc-400 text-sm">Avg shipping per card:</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              type="number"
              value={shippingPerCard}
              onChange={e => setShippingPerCard(parseFloat(e.target.value) || 0)}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-1.5 text-white text-sm"
              step="0.5"
              min="0"
            />
          </div>
        </div>

        {/* Quick Add Presets */}
        {wantList.length === 0 && (
          <div className="mb-4">
            <p className="text-zinc-500 text-xs mb-2">Quick example — add a typical want list:</p>
            <button
              onClick={() => {
                setWantList([
                  { id: `card-${++cardId}`, name: 'Rookie Base Card #1', price: 5, rarity: 'base' },
                  { id: `card-${++cardId}`, name: 'Rookie Base Card #2', price: 8, rarity: 'base' },
                  { id: `card-${++cardId}`, name: 'Veteran Star Base', price: 3, rarity: 'base' },
                  { id: `card-${++cardId}`, name: 'Insert Card', price: 15, rarity: 'insert' },
                  { id: `card-${++cardId}`, name: 'Short Print SP', price: 40, rarity: 'short-print' },
                ]);
              }}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm hover:border-amber-700/50 transition-colors"
            >
              Load Example Want List (5 cards, $71 total)
            </button>
          </div>
        )}

        {/* Want List Table */}
        {wantList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-400 font-medium py-2 pr-4">Card</th>
                  <th className="text-left text-zinc-400 font-medium py-2 pr-4">Rarity</th>
                  <th className="text-right text-zinc-400 font-medium py-2 pr-4">Price</th>
                  <th className="text-right text-zinc-400 font-medium py-2 pr-4">Est. Boxes to Pull</th>
                  <th className="text-right text-zinc-400 font-medium py-2"></th>
                </tr>
              </thead>
              <tbody>
                {wantList.map(card => (
                  <tr key={card.id} className="border-b border-zinc-800/50">
                    <td className="text-white py-2.5 pr-4">{card.name}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        card.rarity === 'base' ? 'bg-zinc-700 text-zinc-300' :
                        card.rarity === 'insert' ? 'bg-blue-900/50 text-blue-400' :
                        card.rarity === 'short-print' ? 'bg-purple-900/50 text-purple-400' :
                        card.rarity === 'auto-relic' ? 'bg-amber-900/50 text-amber-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                        {rarityMultipliers[card.rarity].label}
                      </span>
                    </td>
                    <td className="text-right text-amber-400 py-2.5 pr-4">${card.price.toFixed(2)}</td>
                    <td className="text-right text-zinc-400 py-2.5 pr-4">~{rarityMultipliers[card.rarity].boxesNeeded}</td>
                    <td className="text-right py-2.5">
                      <button onClick={() => removeCard(card.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                        &#10005;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td className="text-white font-medium py-2.5" colSpan={2}>Total ({wantList.length} cards)</td>
                  <td className="text-right text-amber-400 font-bold py-2.5 pr-4">
                    ${wantList.reduce((s, c) => s + c.price, 0).toFixed(2)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setWantList([])}
                className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {analysis && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Step 3: The Verdict</h2>

          {/* Verdict Banner */}
          <div className={`rounded-xl p-6 mb-6 border ${
            analysis.verdict === 'singles'
              ? 'bg-emerald-950/30 border-emerald-800/50'
              : 'bg-amber-950/30 border-amber-800/50'
          }`}>
            <div className={`text-2xl font-bold mb-2 ${
              analysis.verdict === 'singles' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {analysis.verdict === 'singles'
                ? 'Buy Singles — Save $' + analysis.savings.toFixed(0)
                : 'Buy Wax — Save $' + analysis.savings.toFixed(0)
              }
            </div>
            <p className="text-zinc-300">
              {analysis.verdict === 'singles'
                ? `Buying the ${wantList.length} cards individually costs $${analysis.totalSinglesCost.toFixed(0)} vs $${analysis.totalWaxCost.toFixed(0)} for ${analysis.roundedBoxes} box${analysis.roundedBoxes > 1 ? 'es' : ''}. Singles saves you ${analysis.savingsPercent.toFixed(0)}%.`
                : `Opening ${analysis.roundedBoxes} box${analysis.roundedBoxes > 1 ? 'es' : ''} costs $${analysis.totalWaxCost.toFixed(0)} vs $${analysis.totalSinglesCost.toFixed(0)} for singles. Plus you get ${analysis.totalCardsPulled.toLocaleString()} extra cards worth ~$${analysis.residualValue.toFixed(0)}.`
              }
            </p>
          </div>

          {/* Comparison Table */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Singles Side */}
            <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <h3 className="text-white font-semibold">Buy Singles</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Card prices ({wantList.length} cards)</span>
                  <span className="text-white">${analysis.totalSinglesRaw.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Shipping (~${shippingPerCard}/card)</span>
                  <span className="text-white">${analysis.totalShipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-700 pt-2 mt-2">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-emerald-400 font-bold text-lg">${analysis.totalSinglesCost.toFixed(2)}</span>
                </div>
                <div className="text-zinc-500 text-xs mt-2">
                  You get exactly the cards you want. No extras, no risk.
                </div>
              </div>
            </div>

            {/* Wax Side */}
            <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <h3 className="text-white font-semibold">Buy Wax</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Boxes needed</span>
                  <span className="text-white">{analysis.roundedBoxes} x ${boxPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total cards pulled</span>
                  <span className="text-white">{analysis.totalCardsPulled.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Est. residual value</span>
                  <span className="text-zinc-300">+${analysis.residualValue.toFixed(0)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-700 pt-2 mt-2">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-amber-400 font-bold text-lg">${analysis.totalWaxCost.toFixed(2)}</span>
                </div>
                <div className="text-zinc-500 text-xs mt-2">
                  You might pull your cards — or might not. Plus {analysis.totalCardsPulled.toLocaleString()} extra cards.
                </div>
              </div>
            </div>
          </div>

          {/* Per-Card Breakdown */}
          <div className="mt-6">
            <h3 className="text-white font-medium mb-3">Per-Card Difficulty</h3>
            <div className="space-y-2">
              {analysis.boxesNeededPerCard.map(card => (
                <div key={card.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{card.name}</div>
                  </div>
                  <div className="text-zinc-400 text-xs w-20 text-right">~{card.boxesNeeded} box{card.boxesNeeded !== 1 ? 'es' : ''}</div>
                  <div className="w-32 bg-zinc-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        card.boxesNeeded <= 1 ? 'bg-emerald-500' :
                        card.boxesNeeded <= 5 ? 'bg-amber-500' :
                        card.boxesNeeded <= 15 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, (card.boxesNeeded / 25) * 100)}%` }}
                    />
                  </div>
                  <div className="text-amber-400 text-sm w-16 text-right">${card.price}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Easy</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full"></span>Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>Hard</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Very Hard</span>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mt-6 bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/30">
            <h3 className="text-white font-medium text-sm mb-2">Pro Tips</h3>
            <ul className="text-zinc-400 text-xs space-y-1">
              <li>- Buy singles on eBay using Best Offer for 10-20% below listed prices</li>
              <li>- Buy wax when a product first releases — pull values are highest at launch</li>
              <li>- If you buy wax, sell duplicates within 48 hours while prices are still strong</li>
              <li>- Factor in eBay fees (~13%) and shipping when selling extras from wax</li>
              <li>- COMC and Sportlots offer lower shipping than eBay for singles purchases</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
