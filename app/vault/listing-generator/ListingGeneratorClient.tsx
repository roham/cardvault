'use client';

import { useEffect, useMemo, useState } from 'react';

const STATE_KEY = 'cv_listing_generator_v1';

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'other';
type Condition = 'psa10' | 'psa9' | 'psa8' | 'bgs95' | 'bgs9' | 'sgc10' | 'raw-mint' | 'raw-nm' | 'raw-ex' | 'raw-vg';

type CardInput = {
  player: string;
  year: string;
  set: string;
  cardNumber: string;
  sport: Sport;
  condition: Condition;
  certNumber: string;
  isRookie: boolean;
  isAuto: boolean;
  isPatch: boolean;
  isNumbered: boolean;
  serialNumber: string;
  parallel: string;
  estimatedValue: string;
  notes: string;
};

const DEFAULT_INPUT: CardInput = {
  player: '',
  year: '',
  set: '',
  cardNumber: '',
  sport: 'baseball',
  condition: 'raw-nm',
  certNumber: '',
  isRookie: false,
  isAuto: false,
  isPatch: false,
  isNumbered: false,
  serialNumber: '',
  parallel: '',
  estimatedValue: '',
  notes: '',
};

const CONDITION_LABELS: Record<Condition, { title: string; long: string; grade: string }> = {
  psa10: { title: 'PSA 10', long: 'PSA 10 GEM MT', grade: 'Graded PSA 10 Gem Mint' },
  psa9: { title: 'PSA 9', long: 'PSA 9 MINT', grade: 'Graded PSA 9 Mint' },
  psa8: { title: 'PSA 8', long: 'PSA 8 NM-MT', grade: 'Graded PSA 8 Near Mint-Mint' },
  bgs95: { title: 'BGS 9.5', long: 'BGS 9.5 GEM MINT', grade: 'Graded BGS 9.5 Gem Mint' },
  bgs9: { title: 'BGS 9', long: 'BGS 9 MINT', grade: 'Graded BGS 9 Mint' },
  sgc10: { title: 'SGC 10', long: 'SGC 10 PRI', grade: 'Graded SGC 10 Pristine' },
  'raw-mint': { title: 'RAW MINT', long: 'RAW MINT', grade: 'Raw ungraded — Mint condition' },
  'raw-nm': { title: 'RAW NM', long: 'RAW NEAR MINT', grade: 'Raw ungraded — Near Mint condition' },
  'raw-ex': { title: 'RAW EX', long: 'RAW EXCELLENT', grade: 'Raw ungraded — Excellent condition' },
  'raw-vg': { title: 'RAW VG', long: 'RAW VERY GOOD', grade: 'Raw ungraded — Very Good condition' },
};

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.substring(0, maxLen - 1).trimEnd();
}

function buildTitles(c: CardInput): { keyword: string; feature: string; searchVolume: string } {
  const grade = CONDITION_LABELS[c.condition].title;
  const year = c.year ? c.year : '';
  const player = c.player || 'Player';
  const set = c.set || 'Set';
  const num = c.cardNumber ? `#${c.cardNumber}` : '';
  const parts: string[] = [];

  // Keyword-front: player + year + set + # + grade + features
  const kwParts = [year, player, set, num].filter(Boolean);
  if (c.isRookie) kwParts.push('RC');
  if (c.isAuto) kwParts.push('AUTO');
  if (c.isPatch) kwParts.push('PATCH');
  if (c.isNumbered && c.serialNumber) kwParts.push(`/${c.serialNumber}`);
  if (c.parallel) kwParts.push(c.parallel);
  kwParts.push(grade);
  const keyword = truncate(kwParts.join(' '), 80);

  // Feature-front: lead with premium feature for premium cards
  const featParts: string[] = [];
  if (c.isPatch && c.isAuto) featParts.push('🔥 AUTO PATCH');
  else if (c.isAuto) featParts.push('🔥 AUTO');
  else if (c.isPatch) featParts.push('PATCH');
  if (c.isNumbered && c.serialNumber) featParts.push(`/${c.serialNumber}`);
  featParts.push(year, player, set, num);
  if (c.isRookie) featParts.push('RC');
  if (c.parallel) featParts.push(c.parallel);
  featParts.push(grade);
  const feature = truncate(featParts.filter(Boolean).join(' '), 80);

  // Search-volume-front: era + sport + player + year + set + #
  const sportLabel = c.sport[0].toUpperCase() + c.sport.slice(1);
  const era = c.year ? (parseInt(c.year) < 1980 ? 'VINTAGE' : parseInt(c.year) < 2000 ? '90s' : '') : '';
  const svParts = [era, sportLabel, player, year, set, num].filter(Boolean);
  if (c.isRookie) svParts.push('RC');
  if (c.isAuto) svParts.push('AUTO');
  svParts.push(grade);
  const searchVolume = truncate(svParts.join(' '), 80);

  return { keyword, feature, searchVolume };
}

function buildKeywords(c: CardInput): string[] {
  const kw = new Set<string>();
  if (c.player) {
    kw.add(c.player);
    const parts = c.player.split(' ');
    if (parts.length > 1) kw.add(parts[parts.length - 1]); // last name
  }
  if (c.year) kw.add(c.year);
  if (c.set) {
    kw.add(c.set);
    const setWords = c.set.split(/\s+/);
    for (const w of setWords) if (w.length > 3) kw.add(w);
  }
  if (c.cardNumber) kw.add(`#${c.cardNumber}`);
  if (c.isRookie) { kw.add('RC'); kw.add('Rookie'); kw.add('Rookie Card'); }
  if (c.isAuto) { kw.add('AUTO'); kw.add('Autograph'); kw.add('Signed'); kw.add('On Card Auto'); }
  if (c.isPatch) { kw.add('Patch'); kw.add('Game Used'); kw.add('Jersey'); kw.add('GU'); }
  if (c.isNumbered) { kw.add('Numbered'); kw.add('Serial Numbered'); kw.add('SN'); }
  if (c.serialNumber) kw.add(`/${c.serialNumber}`);
  if (c.parallel) { kw.add(c.parallel); kw.add(`${c.parallel} Parallel`); }
  kw.add(c.sport);
  if (c.condition.startsWith('psa')) { kw.add('PSA'); kw.add('Graded'); kw.add(CONDITION_LABELS[c.condition].title); }
  if (c.condition.startsWith('bgs')) { kw.add('BGS'); kw.add('Beckett'); kw.add('Graded'); kw.add(CONDITION_LABELS[c.condition].title); }
  if (c.condition.startsWith('sgc')) { kw.add('SGC'); kw.add('Graded'); kw.add(CONDITION_LABELS[c.condition].title); }
  if (c.condition.startsWith('raw')) { kw.add('Raw'); kw.add('Ungraded'); kw.add('Vintage'); }
  if (c.year && parseInt(c.year) < 1980) { kw.add('Vintage'); kw.add('Antique'); kw.add('Pre-War'); }
  if (c.certNumber) kw.add(`Cert ${c.certNumber}`);
  return Array.from(kw).slice(0, 20);
}

function buildDescription(c: CardInput): string {
  const grade = CONDITION_LABELS[c.condition];
  const lines: string[] = [];
  lines.push(`${c.year || '[Year]'} ${c.set || '[Set]'} ${c.player || '[Player]'}${c.cardNumber ? ` #${c.cardNumber}` : ''}`);
  lines.push('');
  lines.push('CARD DETAILS:');
  lines.push(`• Player: ${c.player || '[Player name]'}`);
  lines.push(`• Year: ${c.year || '[Year]'}`);
  lines.push(`• Set: ${c.set || '[Set]'}`);
  if (c.cardNumber) lines.push(`• Card #: ${c.cardNumber}`);
  lines.push(`• Sport: ${c.sport[0].toUpperCase() + c.sport.slice(1)}`);
  if (c.isRookie) lines.push('• Rookie Card (RC)');
  if (c.isAuto) lines.push('• Autographed (on-card autograph)');
  if (c.isPatch) lines.push('• Game-used patch / relic');
  if (c.isNumbered && c.serialNumber) lines.push(`• Serial-numbered /${c.serialNumber}`);
  if (c.parallel) lines.push(`• Parallel: ${c.parallel}`);
  lines.push('');
  lines.push('CONDITION:');
  lines.push(`• ${grade.grade}`);
  if (c.certNumber) lines.push(`• Cert #: ${c.certNumber} (verify at grader\'s pop report)`);
  if (c.notes) lines.push(`• Notes: ${c.notes}`);
  lines.push('');
  lines.push('SHIPPING:');
  const val = parseFloat(c.estimatedValue || '0');
  if (val < 20) {
    lines.push('• PWE (penny sleeve + toploader + team bag) — $1 US. No tracking.');
    lines.push('• Upgrade to tracked First-Class available on request — +$4.');
  } else if (val < 75) {
    lines.push('• First-Class Envelope with tracking — $5 US.');
    lines.push('• Penny sleeve + toploader + team bag + bubble mailer.');
  } else if (val < 500) {
    lines.push('• USPS Ground Advantage with tracking + $100 insurance — $10 US.');
    lines.push('• Priority Mail upgrade available (1-3 day delivery) — +$3.');
    lines.push('• Semi-rigid card saver + toploader + bubble mailer.');
  } else {
    lines.push('• USPS Priority Mail Express or signature-required insured — $30-50 US.');
    lines.push('• Full declared-value insurance included.');
    lines.push('• Semi-rigid card saver + toploader + bubble mailer + cardboard support.');
    lines.push('• Signature required on delivery.');
  }
  lines.push('');
  lines.push('RETURNS: 14-day no-questions-asked returns accepted. Buyer pays return shipping. Card must be returned in original holder/condition.');
  lines.push('');
  lines.push('Please message with any questions before purchase. Ships within 1 business day.');
  return lines.join('\n');
}

function suggestCategory(c: CardInput): string {
  const modern = c.year && parseInt(c.year) >= 1980;
  const eraLabel = modern ? 'Modern (1980-Now)' : 'Vintage (1979 & Earlier)';
  const sportMap: Record<Sport, string> = {
    baseball: 'Baseball Cards',
    basketball: 'Basketball Cards',
    football: 'Football Cards',
    hockey: 'Hockey Cards',
    other: 'Other Sports Cards',
  };
  return `Sports Mem, Cards & Fan Shop > Sports Trading Cards > ${sportMap[c.sport]} > ${eraLabel}`;
}

function suggestShipping(c: CardInput): { class: string; cost: string; insurance: string; note: string } {
  const val = parseFloat(c.estimatedValue || '0');
  if (val < 20) return { class: 'PWE (plain white envelope)', cost: '$1', insurance: 'None', note: 'No tracking — buyer risk. Upgrade on request.' };
  if (val < 75) return { class: 'First-Class Envelope with tracking', cost: '$5', insurance: 'Up to $100', note: 'Tracking included. 2-5 day delivery.' };
  if (val < 500) return { class: 'USPS Ground Advantage', cost: '$10-12', insurance: '$100-500 included', note: 'Priority Mail upgrade +$3 for 1-3 day delivery.' };
  return { class: 'USPS Priority Express or Signature Insured', cost: '$30-50', insurance: 'Full declared value', note: 'Signature required. 1-day delivery. Recommended for cards $500+.' };
}

function suggestPricing(c: CardInput): { startingBid: string; bestOfferFloor: string; binPrice: string } {
  const val = parseFloat(c.estimatedValue || '0');
  if (val <= 0) return { startingBid: '—', bestOfferFloor: '—', binPrice: '—' };
  return {
    startingBid: `$${Math.max(1, Math.round(val * 0.1))}`,
    bestOfferFloor: `$${Math.round(val * 0.75)}`,
    binPrice: `$${Math.round(val * 1.1)}`,
  };
}

type CopyField = 'keyword' | 'feature' | 'searchVolume' | 'description' | 'keywords' | 'category' | 'all';

export default function ListingGeneratorClient() {
  const [input, setInput] = useState<CardInput>(DEFAULT_INPUT);
  const [copied, setCopied] = useState<CopyField | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STATE_KEY);
      if (s) setInput({ ...DEFAULT_INPUT, ...JSON.parse(s) });
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(input)); } catch {}
  }, [input]);

  const titles = useMemo(() => buildTitles(input), [input]);
  const description = useMemo(() => buildDescription(input), [input]);
  const keywords = useMemo(() => buildKeywords(input), [input]);
  const category = useMemo(() => suggestCategory(input), [input]);
  const shipping = useMemo(() => suggestShipping(input), [input]);
  const pricing = useMemo(() => suggestPricing(input), [input]);

  async function handleCopy(field: CopyField) {
    let text = '';
    switch (field) {
      case 'keyword': text = titles.keyword; break;
      case 'feature': text = titles.feature; break;
      case 'searchVolume': text = titles.searchVolume; break;
      case 'description': text = description; break;
      case 'keywords': text = keywords.join(', '); break;
      case 'category': text = category; break;
      case 'all':
        text = `TITLE (keyword-front):\n${titles.keyword}\n\nDESCRIPTION:\n${description}\n\nKEYWORDS:\n${keywords.join(', ')}\n\nCATEGORY:\n${category}\n\nSHIPPING:\n${shipping.class} — ${shipping.cost} — ${shipping.insurance}\n${shipping.note}\n\nvia CardVault https://cardvault-two.vercel.app/vault/listing-generator`;
        break;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-white">Card details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Player *</div>
            <input
              value={input.player}
              onChange={e => setInput({ ...input, player: e.target.value })}
              placeholder="e.g. Mike Trout"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Year *</div>
            <input
              value={input.year}
              onChange={e => setInput({ ...input, year: e.target.value })}
              placeholder="e.g. 2011"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Set *</div>
            <input
              value={input.set}
              onChange={e => setInput({ ...input, set: e.target.value })}
              placeholder="e.g. Topps Update"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Card #</div>
            <input
              value={input.cardNumber}
              onChange={e => setInput({ ...input, cardNumber: e.target.value })}
              placeholder="e.g. US175"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Sport</div>
            <select
              value={input.sport}
              onChange={e => setInput({ ...input, sport: e.target.value as Sport })}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="baseball">Baseball</option>
              <option value="basketball">Basketball</option>
              <option value="football">Football</option>
              <option value="hockey">Hockey</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Condition / Grade</div>
            <select
              value={input.condition}
              onChange={e => setInput({ ...input, condition: e.target.value as Condition })}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.long}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Cert # (if graded)</div>
            <input
              value={input.certNumber}
              onChange={e => setInput({ ...input, certNumber: e.target.value })}
              placeholder="e.g. 90234567"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Parallel (if any)</div>
            <input
              value={input.parallel}
              onChange={e => setInput({ ...input, parallel: e.target.value })}
              placeholder="e.g. Silver, Gold, Refractor, Prizm"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 pt-2">
          {[
            { key: 'isRookie', label: 'Rookie (RC)' },
            { key: 'isAuto', label: 'Autograph' },
            { key: 'isPatch', label: 'Patch / Relic' },
            { key: 'isNumbered', label: 'Numbered' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={(input as any)[key]}
                onChange={e => setInput({ ...input, [key]: e.target.checked } as CardInput)}
                className="w-4 h-4 accent-cyan-500"
              />
              {label}
            </label>
          ))}
        </div>

        {input.isNumbered && (
          <label className="block max-w-xs">
            <div className="text-sm font-semibold text-slate-300 mb-1">Serial # (denominator)</div>
            <input
              value={input.serialNumber}
              onChange={e => setInput({ ...input, serialNumber: e.target.value })}
              placeholder="e.g. 99, 25, 10, 1"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Estimated value ($)</div>
            <input
              type="number"
              value={input.estimatedValue}
              onChange={e => setInput({ ...input, estimatedValue: e.target.value })}
              placeholder="e.g. 250"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="text-xs text-slate-500 mt-1">Drives shipping + pricing suggestions.</div>
          </label>
          <label className="block">
            <div className="text-sm font-semibold text-slate-300 mb-1">Notes (optional)</div>
            <input
              value={input.notes}
              onChange={e => setInput({ ...input, notes: e.target.value })}
              placeholder="e.g. Sharp corners, centered, no surface scratches"
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* Title variations */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white">Title variations (80-char eBay-optimized)</h2>
        {[
          { key: 'keyword' as CopyField, label: 'KEYWORD-FRONT', desc: 'Maxes search ranking. Use for commodity rookies + graded cards.', text: titles.keyword },
          { key: 'feature' as CopyField, label: 'FEATURE-FRONT', desc: 'Maxes click-through. Use for auto / patch / 1/1 / serial-numbered.', text: titles.feature },
          { key: 'searchVolume' as CopyField, label: 'SEARCH-VOLUME-FRONT', desc: 'Maxes broad visibility. Use for vintage + era-searched cards.', text: titles.searchVolume },
        ].map(t => (
          <div key={t.key} className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">{t.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
              </div>
              <button
                onClick={() => handleCopy(t.key)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition"
              >
                {copied === t.key ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-700 rounded px-3 py-2 font-mono text-sm text-white break-words">
              {t.text}
            </div>
            <div className="text-xs text-slate-500 mt-1">{t.text.length} / 80 chars</div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold text-white">Full description</h2>
          <button
            onClick={() => handleCopy('description')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition"
          >
            {copied === 'description' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="bg-slate-950 border border-slate-700 rounded p-3 text-xs text-slate-200 whitespace-pre-wrap font-mono overflow-x-auto">{description}</pre>
      </div>

      {/* Keywords */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold text-white">Search keywords ({keywords.length})</h2>
          <button
            onClick={() => handleCopy('keywords')}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition"
          >
            {copied === 'keywords' ? '✓ Copied' : 'Copy all'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k, i) => (
            <span key={i} className="text-xs bg-cyan-950/60 border border-cyan-800/50 text-cyan-200 px-2 py-0.5 rounded">
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Category + Shipping + Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold">eBay category</div>
            <button
              onClick={() => handleCopy('category')}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded transition"
            >
              {copied === 'category' ? '✓' : 'Copy'}
            </button>
          </div>
          <div className="text-sm text-slate-200">{category}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold mb-2">Shipping</div>
          <div className="text-sm text-white font-semibold">{shipping.class}</div>
          <div className="text-xs text-slate-400 mt-1">
            <span className="text-slate-500">Cost:</span> {shipping.cost} ·
            <span className="text-slate-500 ml-2">Insurance:</span> {shipping.insurance}
          </div>
          <div className="text-xs text-slate-500 mt-1">{shipping.note}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs uppercase tracking-wider text-cyan-300 font-semibold mb-2">Pricing</div>
          <div className="space-y-1 text-xs text-slate-300">
            <div><span className="text-slate-500">Auction start:</span> <span className="font-mono text-white">{pricing.startingBid}</span></div>
            <div><span className="text-slate-500">Best offer floor:</span> <span className="font-mono text-white">{pricing.bestOfferFloor}</span></div>
            <div><span className="text-slate-500">BIN price:</span> <span className="font-mono text-white">{pricing.binPrice}</span></div>
          </div>
          <div className="text-xs text-slate-500 mt-2">Based on estimated value ${input.estimatedValue || '0'}.</div>
        </div>
      </div>

      {/* Copy all */}
      <div className="flex justify-center">
        <button
          onClick={() => handleCopy('all')}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-8 py-2.5 rounded-lg transition"
        >
          {copied === 'all' ? '✓ Copied everything' : 'Copy all (title + description + keywords + category + shipping)'}
        </button>
      </div>
    </div>
  );
}
