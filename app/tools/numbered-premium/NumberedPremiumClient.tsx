'use client';

import { useState, useMemo } from 'react';

/* ---------- Types ---------- */

interface PremiumResult {
  serialNumber: number;
  printRun: number;
  jerseyNumber: number | null;
  isJerseyMatch: boolean;
  isFirstCard: boolean;
  isLastCard: boolean;
  isSingleDigit: boolean;
  isLowSerial: boolean;
  premiumMultiplier: number;
  desirabilityScore: number; // 1-10
  tier: string;
  tierColor: string;
  explanation: string;
  bestSerials: { number: number; reason: string; multiplier: string }[];
  rank: number; // where this serial ranks in desirability (1 = best)
  totalDesirableCount: number;
}

/* ---------- Constants ---------- */

const COMMON_PRINT_RUNS = [5, 10, 15, 25, 35, 50, 75, 99, 149, 199, 250, 299, 500, 750, 999];

/* ---------- Calculator Logic ---------- */

function calculatePremium(serial: number, printRun: number, jerseyNum: number | null): PremiumResult {
  const isJerseyMatch = jerseyNum !== null && serial === jerseyNum && serial <= printRun;
  const isFirstCard = serial === 1;
  const isLastCard = serial === printRun;
  const isSingleDigit = serial >= 1 && serial <= 9 && !isFirstCard;
  const isLowSerial = serial >= 1 && serial <= Math.max(10, Math.floor(printRun * 0.05));

  // Base multiplier starts at 1.0 for random serials
  let multiplier = 1.0;
  let explanation = '';
  let score = 3; // baseline desirability

  // Print run scarcity amplifier
  const scarcityFactor = printRun <= 10 ? 1.5 : printRun <= 25 ? 1.3 : printRun <= 99 ? 1.1 : 1.0;

  if (isJerseyMatch) {
    multiplier = (2.5 + (scarcityFactor - 1) * 5) * scarcityFactor;
    score = 10;
    explanation = `Jersey number match! Serial #${serial} matches the player's #${jerseyNum}. This is the single most desirable serial number — collectors pay significant premiums for jersey matches.`;
  } else if (isFirstCard) {
    multiplier = 2.0 * scarcityFactor;
    score = 9;
    explanation = `Card #1 — "First off the line." The #1 serial is the second most desirable after a jersey match. It carries prestige and collector cachet across all sports.`;
  } else if (isLastCard && printRun > 1) {
    multiplier = 1.6 * scarcityFactor;
    score = 8;
    explanation = `Last card in the print run (#${serial}/${printRun}). "Bookend" serials (#1 and the last number) are prized by collectors. Pairs well with #1 as a matched set.`;
  } else if (isSingleDigit) {
    const digitPremium = 1.3 + (0.05 * (10 - serial)); // lower digits = higher premium
    multiplier = digitPremium * scarcityFactor;
    score = 7;
    explanation = `Single-digit serial (#${serial}). Low numbers feel rarer even though every copy is equally scarce. Single digits command a moderate premium.`;
  } else if (serial === 10 || serial === 25 || serial === 50) {
    multiplier = 1.15;
    score = 5;
    explanation = `Round number serial (#${serial}). Round numbers have slight appeal to certain collectors but don't command significant premiums.`;
  } else if (jerseyNum !== null && serial === jerseyNum + 100 && serial <= printRun) {
    multiplier = 1.1;
    score = 4;
    explanation = `Near-jersey number (#${serial}). Not a direct match but contains the jersey number digits. Minimal premium.`;
  } else {
    // Check for popular culture numbers
    const funNumbers: Record<number, string> = {
      7: 'Lucky 7', 13: 'Lucky 13', 23: 'Jordan/LeBron number', 42: 'Jackie Robinson / Answer to Everything',
      69: 'Meme number (high demand in some circles)', 99: 'Gretzky number', 100: 'Century mark',
    };
    if (funNumbers[serial] && serial <= printRun) {
      multiplier = 1.1;
      score = 4;
      explanation = `${funNumbers[serial]} — a culturally notable number. Slight added interest from niche collectors.`;
    } else {
      multiplier = 1.0;
      score = 3;
      explanation = `Random serial (#${serial}/${printRun}). No special premium — this is the baseline value for this print run. The card is still equally rare as every other copy.`;
    }
  }

  // Calculate best serials for this print run
  const bestSerials: { number: number; reason: string; multiplier: string }[] = [];
  if (jerseyNum !== null && jerseyNum <= printRun) {
    bestSerials.push({ number: jerseyNum, reason: 'Jersey number match', multiplier: '2.5-5x' });
  }
  bestSerials.push({ number: 1, reason: 'First card', multiplier: '2-3x' });
  if (printRun > 1) {
    bestSerials.push({ number: printRun, reason: 'Last card (bookend)', multiplier: '1.5-2x' });
  }
  const singleDigits = Math.min(9, printRun);
  if (singleDigits > 1) {
    bestSerials.push({ number: -1, reason: `Single digits (2-${singleDigits})`, multiplier: '1.3-1.8x' });
  }

  // Determine tier
  let tier = 'Standard';
  let tierColor = 'text-gray-400';
  if (score >= 10) { tier = 'ELITE SERIAL'; tierColor = 'text-yellow-400'; }
  else if (score >= 9) { tier = 'PREMIUM'; tierColor = 'text-purple-400'; }
  else if (score >= 8) { tier = 'DESIRABLE'; tierColor = 'text-blue-400'; }
  else if (score >= 7) { tier = 'ABOVE AVERAGE'; tierColor = 'text-green-400'; }
  else if (score >= 5) { tier = 'SLIGHT PREMIUM'; tierColor = 'text-emerald-400'; }
  else if (score >= 4) { tier = 'MINOR INTEREST'; tierColor = 'text-gray-300'; }

  // Rank calculation - how many serials are more desirable than this one?
  let rank = 1;
  // Jersey match is #1 if it exists
  if (jerseyNum !== null && jerseyNum <= printRun) {
    if (!isJerseyMatch) rank++;
  }
  // #1 is next best
  if (!isFirstCard && !isJerseyMatch) rank++;
  // Last card
  if (!isLastCard && !isFirstCard && !isJerseyMatch && printRun > 1) rank++;
  // Single digits
  if (!isSingleDigit && !isFirstCard && !isLastCard && !isJerseyMatch) {
    rank += Math.min(8, printRun - 1); // single digits 2-9
  }
  const totalDesirableCount = (jerseyNum !== null && jerseyNum <= printRun ? 1 : 0) + 1 + (printRun > 1 ? 1 : 0) + Math.min(8, Math.max(0, printRun - 1));

  return {
    serialNumber: serial,
    printRun,
    jerseyNumber: jerseyNum,
    isJerseyMatch,
    isFirstCard,
    isLastCard,
    isSingleDigit,
    isLowSerial,
    premiumMultiplier: Math.round(multiplier * 100) / 100,
    desirabilityScore: score,
    tier,
    tierColor,
    explanation,
    bestSerials,
    rank: Math.min(rank, printRun),
    totalDesirableCount: Math.min(totalDesirableCount, printRun),
  };
}

/* ---------- Component ---------- */

export default function NumberedPremiumClient() {
  const [printRun, setPrintRun] = useState<number>(99);
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [customPrintRun, setCustomPrintRun] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);

  const effectivePrintRun = useCustom ? (parseInt(customPrintRun) || 0) : printRun;
  const serial = parseInt(serialNumber) || 0;
  const jersey = jerseyNumber.trim() !== '' ? parseInt(jerseyNumber) : null;

  const isValid = serial >= 1 && serial <= effectivePrintRun && effectivePrintRun >= 2;
  const result = useMemo(() => {
    if (!isValid) return null;
    return calculatePremium(serial, effectivePrintRun, jersey);
  }, [serial, effectivePrintRun, jersey, isValid]);

  // Generate the visual serial number display
  const serialDisplay = serial > 0 && effectivePrintRun >= 2
    ? `${serial.toString().padStart(effectivePrintRun.toString().length, '0')}/${effectivePrintRun}`
    : `??/${effectivePrintRun || '??'}`;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Enter Your Card Details</h2>

        {/* Print Run Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Print Run</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_PRINT_RUNS.map(run => (
              <button
                key={run}
                onClick={() => { setPrintRun(run); setUseCustom(false); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  !useCustom && printRun === run
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:bg-gray-700/60 hover:text-white'
                }`}
              >
                /{run}
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                useCustom
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-gray-900/60 border-gray-700 text-gray-400 hover:bg-gray-700/60 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>
          {useCustom && (
            <input
              type="number"
              min={2}
              max={99999}
              value={customPrintRun}
              onChange={e => setCustomPrintRun(e.target.value)}
              placeholder="Enter print run (e.g., 175)"
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          )}
        </div>

        {/* Serial Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Serial Number</label>
            <input
              type="number"
              min={1}
              max={effectivePrintRun}
              value={serialNumber}
              onChange={e => setSerialNumber(e.target.value)}
              placeholder={`1 to ${effectivePrintRun || '?'}`}
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Player Jersey Number <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="number"
              min={0}
              max={99}
              value={jerseyNumber}
              onChange={e => setJerseyNumber(e.target.value)}
              placeholder="e.g., 23, 12, 77"
              className="w-full px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Visual Serial Display */}
        <div className="text-center py-4 bg-gray-900/80 rounded-xl border border-gray-700/50">
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Your Card</div>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-white">
            {serialDisplay}
          </div>
          {jersey !== null && (
            <div className="text-gray-500 text-xs mt-1">Player Jersey: #{jersey}</div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className={`bg-gray-800/60 border rounded-2xl p-6 ${
            result.desirabilityScore >= 9 ? 'border-yellow-600/50' :
            result.desirabilityScore >= 7 ? 'border-blue-600/50' :
            'border-gray-700'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.tierColor}`}>
                  {result.tier}
                </div>
                <h3 className="text-xl font-bold text-white">
                  Serial #{result.serialNumber} / {result.printRun}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-xs">Premium Multiplier</div>
                <div className={`text-2xl font-bold ${result.premiumMultiplier > 1.5 ? 'text-green-400' : result.premiumMultiplier > 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {result.premiumMultiplier}x
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4">{result.explanation}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {result.isJerseyMatch && (
                <span className="px-3 py-1 bg-yellow-900/40 border border-yellow-700/50 text-yellow-400 text-xs font-bold rounded-full">
                  JERSEY MATCH #{result.jerseyNumber}
                </span>
              )}
              {result.isFirstCard && (
                <span className="px-3 py-1 bg-purple-900/40 border border-purple-700/50 text-purple-400 text-xs font-bold rounded-full">
                  CARD #1
                </span>
              )}
              {result.isLastCard && (
                <span className="px-3 py-1 bg-blue-900/40 border border-blue-700/50 text-blue-400 text-xs font-bold rounded-full">
                  LAST CARD
                </span>
              )}
              {result.isSingleDigit && (
                <span className="px-3 py-1 bg-green-900/40 border border-green-700/50 text-green-400 text-xs font-bold rounded-full">
                  SINGLE DIGIT
                </span>
              )}
              {result.isLowSerial && !result.isSingleDigit && !result.isFirstCard && (
                <span className="px-3 py-1 bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-xs font-bold rounded-full">
                  LOW SERIAL
                </span>
              )}
            </div>

            {/* Desirability Score Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Desirability Score</span>
                <span className={result.tierColor}>{result.desirabilityScore}/10</span>
              </div>
              <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    result.desirabilityScore >= 9 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' :
                    result.desirabilityScore >= 7 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                    result.desirabilityScore >= 5 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                    'bg-gradient-to-r from-gray-600 to-gray-400'
                  }`}
                  style={{ width: `${result.desirabilityScore * 10}%` }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-900/60 rounded-xl p-3 text-center">
                <div className="text-gray-500 text-xs">Print Run</div>
                <div className="text-white font-bold">/{result.printRun}</div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-3 text-center">
                <div className="text-gray-500 text-xs">Rarity Tier</div>
                <div className="text-white font-bold text-sm">
                  {result.printRun <= 5 ? 'Ultra Rare' :
                   result.printRun <= 10 ? 'Super Rare' :
                   result.printRun <= 25 ? 'Very Rare' :
                   result.printRun <= 50 ? 'Rare' :
                   result.printRun <= 99 ? 'Numbered' :
                   result.printRun <= 199 ? 'Limited' :
                   result.printRun <= 500 ? 'Serial' :
                   'Standard'}
                </div>
              </div>
              <div className="bg-gray-900/60 rounded-xl p-3 text-center">
                <div className="text-gray-500 text-xs">Value Impact</div>
                <div className={`font-bold ${result.premiumMultiplier > 1 ? 'text-green-400' : 'text-gray-400'}`}>
                  {result.premiumMultiplier > 1 ? `+${Math.round((result.premiumMultiplier - 1) * 100)}%` : 'Baseline'}
                </div>
              </div>
            </div>
          </div>

          {/* Best Serials for This Print Run */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Best Serial Numbers for /{effectivePrintRun}</h3>
            <div className="space-y-2">
              {result.bestSerials.map((s, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                  (s.number === serial) ? 'bg-amber-900/20 border-amber-700/50' : 'bg-gray-900/60 border-gray-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm font-mono w-6">#{i + 1}</span>
                    <div>
                      <span className="text-white font-medium">
                        {s.number === -1 ? `#2-#${Math.min(9, effectivePrintRun)}` : `#${s.number}`}
                      </span>
                      {s.number === serial && (
                        <span className="ml-2 text-amber-400 text-xs font-bold">YOUR CARD</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">{s.reason}</div>
                    <div className="text-green-400 text-sm font-bold">{s.multiplier}</div>
                  </div>
                </div>
              ))}
            </div>
            {jersey === null && (
              <p className="text-gray-500 text-xs mt-3">
                Tip: Enter the player&apos;s jersey number above to see if a jersey match exists in this print run.
              </p>
            )}
            {jersey !== null && jersey > effectivePrintRun && (
              <p className="text-yellow-500/80 text-xs mt-3">
                Note: The player&apos;s jersey number (#{jersey}) exceeds the print run (/{effectivePrintRun}), so no jersey match is possible in this parallel.
              </p>
            )}
          </div>

          {/* Print Run Comparison */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Serial #{serial} Across Print Runs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2 px-2">Print Run</th>
                    <th className="text-center text-gray-400 py-2 px-2">Tier</th>
                    <th className="text-right text-gray-400 py-2 px-2">Multiplier</th>
                    <th className="text-right text-gray-400 py-2 px-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[10, 25, 50, 99, 199, 500].filter(r => serial <= r).map(run => {
                    const comp = calculatePremium(serial, run, jersey);
                    return (
                      <tr key={run} className={`border-b border-gray-800 ${run === effectivePrintRun ? 'bg-amber-900/10' : ''}`}>
                        <td className="text-white py-2 px-2 font-mono">
                          /{run} {run === effectivePrintRun && <span className="text-amber-400 text-xs ml-1">yours</span>}
                        </td>
                        <td className={`text-center py-2 px-2 text-xs font-bold ${comp.tierColor}`}>{comp.tier}</td>
                        <td className={`text-right py-2 px-2 font-bold ${comp.premiumMultiplier > 1.5 ? 'text-green-400' : comp.premiumMultiplier > 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {comp.premiumMultiplier}x
                        </td>
                        <td className="text-right py-2 px-2 text-gray-400">{comp.desirabilityScore}/10</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No result — show guidance */}
      {!result && (
        <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🔢</div>
          <h3 className="text-white font-semibold mb-2">Enter Your Serial Number</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Select a print run and enter your card&apos;s serial number to see if it carries a premium. Add the player&apos;s jersey number for jersey match detection.
          </p>
        </div>
      )}
    </div>
  );
}
