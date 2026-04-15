'use client';

import { useState } from 'react';

interface HolderRec {
  cardType: string;
  thickness: string;
  pennySleeve: string;
  topLoader: string;
  oneTouch: string;
  notes: string;
}

const HOLDER_DATA: HolderRec[] = [
  { cardType: 'Standard Base Card', thickness: '20pt', pennySleeve: 'Standard (2-5/8" x 3-5/8")', topLoader: '35pt (3" x 4")', oneTouch: '35pt One-Touch', notes: 'Fits 90%+ of modern base cards. Always penny sleeve first.' },
  { cardType: 'Thick Base Card', thickness: '35pt', pennySleeve: 'Standard', topLoader: '55pt Top Loader', oneTouch: '55pt One-Touch', notes: 'Some premium base cards (Optic, Select) are slightly thicker.' },
  { cardType: 'Jersey/Relic (Single Swatch)', thickness: '55-75pt', pennySleeve: 'Thick Card Sleeve', topLoader: '75pt Top Loader', oneTouch: '75pt One-Touch', notes: 'Single-swatch jerseys. Measure if unsure — varies by brand.' },
  { cardType: 'Jersey/Relic (Multi-Swatch)', thickness: '100-130pt', pennySleeve: 'Thick Card Sleeve', topLoader: '130pt Top Loader', oneTouch: '130pt One-Touch', notes: 'Multi-piece patches, thick relics. Go one size up if in doubt.' },
  { cardType: 'Thick Patch / Auto Patch', thickness: '130-180pt', pennySleeve: 'Super Thick Sleeve', topLoader: '180pt Top Loader', oneTouch: '180pt One-Touch', notes: 'Thick patch cards (Flawless, Immaculate). May need specialty holders.' },
  { cardType: 'Booklet Card', thickness: 'Varies', pennySleeve: 'Booklet Sleeve', topLoader: 'Booklet Top Loader', oneTouch: 'Booklet One-Touch', notes: 'Folds open to ~5" x 3.5". Measure before buying — sizes vary significantly.' },
  { cardType: 'Graded Card (PSA/BGS)', thickness: 'Slab', pennySleeve: 'N/A', topLoader: 'N/A', oneTouch: 'N/A', notes: 'Already in a protective case. Use a graded card sleeve or team bag for added scratch protection.' },
  { cardType: 'Vintage (Pre-1980)', thickness: '20-25pt', pennySleeve: 'Standard', topLoader: '35pt Top Loader', oneTouch: '35pt One-Touch', notes: 'Same size as modern but more fragile. Handle by edges only. Consider semi-rigid for grading submission.' },
  { cardType: 'Pokemon / TCG Card', thickness: '20pt', pennySleeve: 'Standard (Japanese size for JP cards)', topLoader: '35pt Top Loader', oneTouch: '35pt One-Touch', notes: 'Standard Pokemon cards are same dimensions as sports cards. Japanese cards are slightly smaller (use Japanese-size sleeves).' },
  { cardType: 'Oversized / Box Topper', thickness: '20-35pt', pennySleeve: '4" x 6" Sleeve', topLoader: '5" x 7" Top Loader', oneTouch: 'N/A (use frame or display)', notes: 'Box toppers, oversized inserts. Measure dimensions first — no standard size.' },
];

export default function HolderGuide() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customThickness, setCustomThickness] = useState('');

  const selectedData = HOLDER_DATA.find(h => h.cardType === selectedType);

  const thicknessRec = customThickness ? (() => {
    const pt = parseInt(customThickness);
    if (isNaN(pt) || pt <= 0) return null;
    if (pt <= 35) return HOLDER_DATA[0];
    if (pt <= 55) return HOLDER_DATA[2];
    if (pt <= 100) return HOLDER_DATA[3];
    if (pt <= 130) return HOLDER_DATA[3];
    return HOLDER_DATA[4];
  })() : null;

  return (
    <div>
      {/* Quick Select */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3">Select Your Card Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {HOLDER_DATA.map(h => (
            <button
              key={h.cardType}
              onClick={() => { setSelectedType(h.cardType); setCustomThickness(''); }}
              className={`p-3 rounded-xl text-xs font-medium text-left transition-colors border ${
                selectedType === h.cardType
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="font-semibold text-white text-sm mb-0.5">{h.cardType}</div>
              <div className="text-gray-500">{h.thickness}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Thickness Input */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3">Or Enter Thickness (pt)</h2>
        <div className="flex gap-3 items-center">
          <input
            type="number"
            value={customThickness}
            onChange={e => { setCustomThickness(e.target.value); setSelectedType(null); }}
            placeholder="e.g. 55"
            className="w-32 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-600"
          />
          <span className="text-gray-500 text-sm">pt (1pt = 1/1000")</span>
        </div>
      </div>

      {/* Recommendation */}
      {(selectedData || thicknessRec) && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-emerald-400 mb-4">Recommended Holders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-900/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Penny Sleeve</p>
              <p className="text-white font-medium text-sm">{(selectedData || thicknessRec)!.pennySleeve}</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Top Loader</p>
              <p className="text-white font-medium text-sm">{(selectedData || thicknessRec)!.topLoader}</p>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">One-Touch / Magnetic</p>
              <p className="text-white font-medium text-sm">{(selectedData || thicknessRec)!.oneTouch}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{(selectedData || thicknessRec)!.notes}</p>
        </div>
      )}

      {/* Full Reference Table */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-3">Full Size Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Card Type</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Thickness</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Penny Sleeve</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">Top Loader</th>
                <th className="text-left py-3 px-3 text-gray-400 font-medium">One-Touch</th>
              </tr>
            </thead>
            <tbody>
              {HOLDER_DATA.map(h => (
                <tr
                  key={h.cardType}
                  className={`border-b border-gray-800/50 ${
                    selectedType === h.cardType ? 'bg-emerald-500/10' : 'hover:bg-gray-900/40'
                  }`}
                >
                  <td className="py-2.5 px-3 text-white font-medium">{h.cardType}</td>
                  <td className="py-2.5 px-3 text-gray-400">{h.thickness}</td>
                  <td className="py-2.5 px-3 text-gray-400">{h.pennySleeve}</td>
                  <td className="py-2.5 px-3 text-gray-400">{h.topLoader}</td>
                  <td className="py-2.5 px-3 text-gray-400">{h.oneTouch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-3">Pro Tips</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 shrink-0">1.</span>
            <span>Always penny sleeve before top loader. The sleeve prevents scratches from the hard plastic.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 shrink-0">2.</span>
            <span>When in doubt, go one size up. A slightly loose fit is better than forcing a card into a tight holder.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 shrink-0">3.</span>
            <span>For grading submissions, use semi-rigid holders (Card Savers). Most grading companies prefer them over top loaders.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 shrink-0">4.</span>
            <span>Store cards vertically (like books) to prevent warping. Never stack heavy items on top of cards.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
