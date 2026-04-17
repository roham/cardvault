'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_rookie_elig_v1';

type Sport = 'mlb' | 'nba' | 'nfl' | 'nhl' | 'pokemon';
type LicenseStatus = 'licensed' | 'pre-draft' | 'minor-league' | 'college' | 'unlicensed' | 'not-sure';

type Form = {
  sport: Sport;
  player: string;
  debutYear: string;
  cardYear: string;
  set: string;
  license: LicenseStatus;
  hasRcLogo: boolean;
  cardNumber: string;
};

const DEFAULT: Form = {
  sport: 'mlb',
  player: '',
  debutYear: '',
  cardYear: '',
  set: '',
  license: 'licensed',
  hasRcLogo: false,
  cardNumber: '',
};

type Verdict = {
  classification: 'true-rookie' | 'xrc' | 'prospect' | 'pre-rookie' | 'veteran' | 'unlicensed' | 'unclear';
  label: string;
  color: string;
  summary: string;
  rules: string[];
  flags: string[];
};

export default function RookieEligibilityClient() {
  const [form, setForm] = useState<Form>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) })); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form, hydrated]);

  function upd<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })); }

  const verdict = useMemo<Verdict>(() => classify(form), [form]);

  function reset() {
    if (!window.confirm('Reset?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setForm(DEFAULT);
  }

  if (!hydrated) return <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center text-gray-500 text-sm">Loading&hellip;</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Sec title="1. Sport">
          <div className="grid grid-cols-5 gap-2">
            {(['mlb', 'nba', 'nfl', 'nhl', 'pokemon'] as Sport[]).map((s) => (
              <button key={s} onClick={() => upd('sport', s)} className={`px-2 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${form.sport === s ? 'bg-teal-500 text-white' : 'bg-slate-800 text-gray-400 hover:text-white'}`}>
                {s === 'pokemon' ? 'Pokémon' : s}
              </button>
            ))}
          </div>
        </Sec>

        <Sec title="2. Player">
          <Fld label="Player name"><input type="text" value={form.player} onChange={(e) => upd('player', e.target.value)} placeholder="e.g., Shohei Ohtani" className={inp} /></Fld>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Fld label={`${sportDebutLabel(form.sport)}`}><input type="number" inputMode="numeric" value={form.debutYear} onChange={(e) => upd('debutYear', e.target.value)} placeholder="e.g., 2018" className={inp} /></Fld>
            <Fld label="Card year"><input type="number" inputMode="numeric" value={form.cardYear} onChange={(e) => upd('cardYear', e.target.value)} placeholder="e.g., 2018" className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="3. Card / set">
          <Fld label="Set name"><input type="text" value={form.set} onChange={(e) => upd('set', e.target.value)} placeholder="e.g., 2018 Topps Update" className={inp} /></Fld>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Fld label="Card number (optional)"><input type="text" value={form.cardNumber} onChange={(e) => upd('cardNumber', e.target.value)} placeholder="US1, 2, BCP-1, etc" className={inp} /></Fld>
            {form.sport === 'mlb' && (
              <label className="flex items-center gap-2 mt-6 text-sm text-gray-300">
                <input type="checkbox" checked={form.hasRcLogo} onChange={(e) => upd('hasRcLogo', e.target.checked)} className="accent-teal-500" />
                <span>Card has the MLB <span className="font-mono bg-slate-800 px-1">RC</span> logo</span>
              </label>
            )}
          </div>
        </Sec>

        <Sec title="4. License">
          <Fld label="License status">
            <select value={form.license} onChange={(e) => upd('license', e.target.value as LicenseStatus)} className={inp}>
              <option value="licensed">Licensed ({sportLicenseLabel(form.sport)})</option>
              <option value="pre-draft">Pre-draft (no pro league yet)</option>
              <option value="minor-league">Minor league / farm system</option>
              <option value="college">College / NCAA</option>
              <option value="unlicensed">Unlicensed (Leaf, Onyx, ITG, etc.)</option>
              <option value="not-sure">Not sure</option>
            </select>
          </Fld>
        </Sec>

        <button onClick={reset} className="px-3 py-1.5 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-xs">Reset form</button>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className={`rounded-2xl bg-gradient-to-br p-5 border ${verdict.color}`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-300">Verdict</div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">{verdict.label}</div>
          <p className="mt-2 text-sm text-gray-200 leading-relaxed">{verdict.summary}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-3">Rules applied</h3>
          {verdict.rules.length === 0 ? (
            <p className="text-sm text-gray-500">Fill in the sport, player debut year, and card year to see rule explanations.</p>
          ) : (
            <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
              {verdict.rules.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          )}
        </div>

        {verdict.flags.length > 0 && (
          <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-2">Flags</h3>
            <ul className="space-y-1 text-xs text-amber-200 list-disc list-inside">
              {verdict.flags.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        <div className="rounded-lg bg-slate-900/40 border border-slate-800 p-3 text-[11px] text-gray-500">
          Classifications: <span className="text-emerald-300">True Rookie</span> = licensed first-year pro RC · <span className="text-sky-300">XRC</span> = MLB Update/Traded rookie · <span className="text-violet-300">Prospect</span> = pre-pro licensed prospect card · <span className="text-orange-300">Pre-Rookie</span> = amateur/college/minor pre-debut · <span className="text-slate-300">Unlicensed</span> = not a True Rookie even if first-year · <span className="text-rose-300">Veteran</span> = post-rookie-year issue.
        </div>
      </div>
    </div>
  );
}

function classify(f: Form): Verdict {
  const debutYear = parseInt(f.debutYear, 10);
  const cardYear = parseInt(f.cardYear, 10);
  const rules: string[] = [];
  const flags: string[] = [];

  // Missing data
  if (!f.player || !f.debutYear || !f.cardYear || !f.set) {
    return {
      classification: 'unclear',
      label: 'Awaiting input',
      color: 'from-slate-900 to-slate-800 border-slate-700',
      summary: 'Enter player name, debut year, card year, and set name to evaluate.',
      rules: [],
      flags: [],
    };
  }
  if (isNaN(debutYear) || isNaN(cardYear)) {
    return {
      classification: 'unclear',
      label: 'Invalid year input',
      color: 'from-slate-900 to-slate-800 border-slate-700',
      summary: 'Year values must be numeric (e.g., 2018).',
      rules: [],
      flags: ['Debut year or card year is not numeric.'],
    };
  }

  const setLower = f.set.toLowerCase();

  // Unlicensed disqualifies True Rookie status for all sports
  if (f.license === 'unlicensed') {
    rules.push(`Card is from an unlicensed product (${f.set}). Unlicensed issues cannot qualify as True Rookies in any sport because they lack team/league trademarks.`);
    if (cardYear < debutYear) {
      rules.push(`Card year (${cardYear}) predates player's pro debut (${debutYear}) — falls into pre-rookie amateur category regardless.`);
    }
    return {
      classification: 'unlicensed',
      label: 'Unlicensed (not a True Rookie)',
      color: 'from-slate-900 to-slate-800 border-slate-600',
      summary: 'Unlicensed products (Leaf, Onyx, ITG Draft Prospects in some years) do not produce True Rookie cards. This card may have speculative value but it is not the player\u2019s official rookie card.',
      rules,
      flags: [f.license === 'unlicensed' ? 'Typical unlicensed hobby brands: Leaf NFL / Leaf NBA / Onyx MLB / ITG Draft Prospects. Always verify license status with the manufacturer.' : ''].filter(Boolean),
    };
  }

  // Pre-debut scenarios
  if (cardYear < debutYear) {
    rules.push(`Card year (${cardYear}) is before player's pro debut (${debutYear}).`);
    // Per sport
    if (f.sport === 'mlb') {
      if (f.license === 'minor-league' || setLower.includes('bowman chrome') || setLower.includes('bowman prospect') || setLower.includes('1st bowman')) {
        rules.push('MLB prospect cards from Bowman Chrome, Bowman Prospects, 1st Bowman, or minor-league product are classified as Prospect Cards, not True Rookies. Hobby convention: the player\u2019s first Topps base card AFTER MLB debut is the True Rookie.');
        return {
          classification: 'prospect',
          label: 'MLB Prospect Card',
          color: 'from-violet-950/40 to-violet-900/20 border-violet-800/50',
          summary: 'This is a Prospect Card — valuable if the player succeeds at MLB, but not the True Rookie. Look for a Topps or Topps Update card from the player\'s MLB debut year for the True Rookie.',
          rules,
          flags: [],
        };
      }
    } else if (f.sport === 'nba') {
      if (f.license === 'college' || setLower.includes('bowman university') || setLower.includes('chronicles draft') || setLower.includes('contenders draft')) {
        rules.push('NBA pre-draft / college-era cards (Bowman University, Contenders Draft Picks, Chronicles Draft) are classified as Prospect Cards. True Rookie requires first licensed Panini NBA issue after NBA debut.');
        return {
          classification: 'prospect',
          label: 'NBA Prospect Card',
          color: 'from-violet-950/40 to-violet-900/20 border-violet-800/50',
          summary: 'Pre-NBA college card. Not a True Rookie. Player\u2019s first Panini Prizm, Panini Donruss, or similar NBA-licensed product in the year of or after NBA debut is the True Rookie.',
          rules,
          flags: [],
        };
      }
    } else if (f.sport === 'nfl') {
      if (f.license === 'college' || f.license === 'pre-draft' || setLower.includes('contenders draft') || setLower.includes('bowman university') || setLower.includes('leaf draft')) {
        rules.push('NFL pre-draft / college-era cards (Bowman University, Panini Contenders Draft Picks, Leaf Metal Draft) are Prospect Cards. True Rookie requires first Panini-licensed NFL issue from the player\'s post-draft rookie year.');
        return {
          classification: 'prospect',
          label: 'NFL Prospect Card',
          color: 'from-violet-950/40 to-violet-900/20 border-violet-800/50',
          summary: 'Pre-draft or college-era NFL card. Not a True Rookie. Player\u2019s first Panini-licensed product (Prizm, Donruss, Select, etc.) after the NFL Draft is the True Rookie.',
          rules,
          flags: [],
        };
      }
    } else if (f.sport === 'nhl') {
      if (f.license === 'pre-draft' || f.license === 'minor-league' || setLower.includes('itg draft') || setLower.includes('ud chl') || setLower.includes('leaf ultimate draft')) {
        rules.push('NHL pre-draft or CHL cards (ITG Draft Prospects, UD CHL, Leaf Ultimate Draft) are Prospect / Pre-Rookie Cards. True Rookie requires Upper Deck Young Guns insert from player\'s NHL debut year.');
        return {
          classification: 'prospect',
          label: 'NHL Prospect Card',
          color: 'from-violet-950/40 to-violet-900/20 border-violet-800/50',
          summary: 'Pre-NHL prospect card. Not a True Rookie. Upper Deck Young Guns is the canonical NHL True Rookie format — look for UD Series 1 or Series 2 Young Guns insert from player\u2019s NHL debut year.',
          rules,
          flags: [],
        };
      }
    }
    // Generic pre-rookie fallback
    return {
      classification: 'pre-rookie',
      label: 'Pre-Rookie / Amateur Card',
      color: 'from-orange-950/40 to-orange-900/20 border-orange-800/50',
      summary: 'Card predates player\u2019s pro debut and isn\u2019t a classic Prospect Card format. Most likely a college, minor-league, or pre-draft amateur card. Not the True Rookie.',
      rules,
      flags: [],
    };
  }

  // Rookie year and later
  if (f.sport === 'mlb') {
    if (cardYear === debutYear) {
      if (setLower.includes('topps update') || setLower.includes('update series') || setLower.includes('traded')) {
        rules.push(`MLB card issued in the same calendar year as player\'s MLB debut (${debutYear}), in an Update or Traded series. Pre-2006 this was XRC (Extended Rookie Card); post-2006 with the RC logo, this IS the True Rookie.`);
        if (cardYear >= 2006 && f.hasRcLogo) {
          return {
            classification: 'true-rookie',
            label: 'True Rookie (MLB RC logo confirmed)',
            color: 'from-emerald-950/40 to-emerald-900/20 border-emerald-700/60',
            summary: 'True Rookie. Post-2006 MLB Update Series card with the official MLB RC logo is the canonical True Rookie.',
            rules,
            flags: [],
          };
        } else if (cardYear < 2006) {
          return {
            classification: 'xrc',
            label: 'XRC (Extended Rookie Card)',
            color: 'from-sky-950/40 to-sky-900/20 border-sky-700/60',
            summary: 'XRC — Extended Rookie Card from an MLB Update or Traded series before the 2006 RC-logo standardization. Recognized as a rookie card; some purists still distinguish XRC from True Rookie.',
            rules,
            flags: ['Pre-2006 MLB Traded/Update cards have contested "True Rookie" vs "XRC" status among collectors.'],
          };
        } else {
          flags.push('Post-2006 MLB Update card should carry the RC logo. If yours does not, double-check — some inserts and parallels within Update lack the RC logo and thus don\'t qualify as True Rookies.');
        }
      }
      // Rookie year but not Update — usually still pre-True Rookie for MLB
      rules.push(`MLB card issued in debut year (${debutYear}) but not in Update/Traded series. Most non-Update MLB base products do not include mid-season call-ups, so a first-year base card is unusual.`);
      flags.push('Double-check whether the player was called up mid-season or pre-April. Only pre-April debuts typically appear in Series 1/2 base sets of the same year.');
      return {
        classification: 'unclear',
        label: 'Unclear MLB status',
        color: 'from-slate-900 to-slate-800 border-slate-600',
        summary: 'Card year matches debut year but set is not Update/Traded. Classification depends on whether this specific player appeared in the Series 1 or Series 2 base set of his debut year.',
        rules,
        flags,
      };
    }
    if (cardYear === debutYear + 1) {
      rules.push(`MLB card issued in the year AFTER debut (${cardYear}). Post-2006 the player\'s Topps Series 1 base card from debutYear+1 typically carries the RC logo and is considered the True Rookie (unless an Update Series card already claimed that status in the prior year).`);
      if (f.hasRcLogo) {
        return {
          classification: 'true-rookie',
          label: 'True Rookie (MLB RC logo)',
          color: 'from-emerald-950/40 to-emerald-900/20 border-emerald-700/60',
          summary: 'True Rookie. MLB card with the RC logo issued in the year after debut — the canonical rookie format for modern MLB.',
          rules,
          flags: [],
        };
      }
      flags.push('RC logo not confirmed — only cards with the MLB RC logo qualify as post-2006 True Rookies. If the RC logo is present, this is a True Rookie.');
      return {
        classification: 'unclear',
        label: 'Likely True Rookie (verify RC logo)',
        color: 'from-emerald-950/30 to-sky-950/30 border-sky-800/50',
        summary: 'Most likely a True Rookie if the MLB RC logo is visible on the card. Confirm the RC logo before classifying definitively.',
        rules,
        flags,
      };
    }
    rules.push(`Card issued ${cardYear - debutYear} years after debut — well past rookie-year eligibility.`);
    return {
      classification: 'veteran',
      label: 'Veteran Issue',
      color: 'from-rose-950/40 to-rose-900/20 border-rose-800/50',
      summary: 'Card is a veteran-year issue, not a rookie card of any kind.',
      rules,
      flags: [],
    };
  }

  // NBA
  if (f.sport === 'nba') {
    if (cardYear === debutYear || cardYear === debutYear + 1) {
      if (f.license === 'licensed') {
        rules.push(`NBA card from debut year or debutYear+1 with full NBA/NBPA licensing (${f.set}). First Panini NBA-licensed issue after NBA debut is the True Rookie.`);
        return {
          classification: 'true-rookie',
          label: 'NBA True Rookie',
          color: 'from-emerald-950/40 to-emerald-900/20 border-emerald-700/60',
          summary: 'True Rookie. Licensed Panini NBA card from player\u2019s first pro season (or first post-debut season) is the canonical True Rookie. Panini Prizm is the flagship modern NBA True Rookie format.',
          rules,
          flags: [],
        };
      }
    }
    rules.push(`Card year ${cardYear} is past NBA debutYear+1 (${debutYear + 1}).`);
    return {
      classification: 'veteran',
      label: 'Veteran Issue',
      color: 'from-rose-950/40 to-rose-900/20 border-rose-800/50',
      summary: 'NBA card issued after the rookie-eligibility window. Veteran issue, not a rookie card.',
      rules,
      flags: [],
    };
  }

  // NFL
  if (f.sport === 'nfl') {
    if (cardYear === debutYear || cardYear === debutYear + 1) {
      if (f.license === 'licensed') {
        rules.push(`NFL card from debut year / debutYear+1 with full NFL/NFLPA licensing. First Panini-licensed NFL post-draft product is the True Rookie.`);
        return {
          classification: 'true-rookie',
          label: 'NFL True Rookie',
          color: 'from-emerald-950/40 to-emerald-900/20 border-emerald-700/60',
          summary: 'True Rookie. Panini-licensed NFL card (Prizm, Donruss, Select, Contenders, Mosaic) from the player\u2019s post-draft rookie year or the following year. Panini Prizm is the canonical modern NFL True Rookie.',
          rules,
          flags: ['2026 transition: Fanatics takes over the NFL license from Panini in 2026. 2026-rookie True Rookies will be Topps-branded going forward.'],
        };
      }
    }
    rules.push(`Card year ${cardYear} is past NFL debutYear+1 (${debutYear + 1}).`);
    return {
      classification: 'veteran',
      label: 'Veteran Issue',
      color: 'from-rose-950/40 to-rose-900/20 border-rose-800/50',
      summary: 'NFL card issued after the rookie-eligibility window. Veteran issue.',
      rules,
      flags: [],
    };
  }

  // NHL
  if (f.sport === 'nhl') {
    if (cardYear === debutYear || cardYear === debutYear + 1) {
      if (f.license === 'licensed' && setLower.includes('young guns')) {
        rules.push(`NHL Upper Deck Young Guns SP insert from debut year / debutYear+1 is the canonical NHL True Rookie. UD exclusive NHL license + Young Guns 1-in-4 pack SP format = definitional True Rookie.`);
        return {
          classification: 'true-rookie',
          label: 'NHL True Rookie (Young Guns)',
          color: 'from-emerald-950/40 to-emerald-900/20 border-emerald-700/60',
          summary: 'True Rookie. Upper Deck Young Guns is the canonical hockey rookie card format. Other UD NHL products (O-Pee-Chee, SP Authentic) from the same year are also rookie cards but Young Guns is the premium True Rookie.',
          rules,
          flags: [],
        };
      }
      if (f.license === 'licensed') {
        rules.push(`NHL card from debut year / debutYear+1 with UD NHL licensing but NOT Young Guns. This is a supporting rookie product — still a rookie card, but not the canonical True Rookie.`);
        return {
          classification: 'true-rookie',
          label: 'NHL Rookie Card (non-YG)',
          color: 'from-sky-950/40 to-sky-900/20 border-sky-700/60',
          summary: 'Rookie card. UD NHL-licensed issue from player\u2019s rookie year. The Young Guns version of the same player is the premier True Rookie; this is a supporting rookie product.',
          rules,
          flags: ['UD Young Guns is considered the canonical NHL True Rookie over O-Pee-Chee, SP Authentic, and other same-year UD products.'],
        };
      }
    }
    rules.push(`Card year ${cardYear} is past NHL debutYear+1 (${debutYear + 1}).`);
    return {
      classification: 'veteran',
      label: 'Veteran Issue',
      color: 'from-rose-950/40 to-rose-900/20 border-rose-800/50',
      summary: 'NHL card issued after rookie-eligibility window. Veteran issue.',
      rules,
      flags: [],
    };
  }

  // Pokemon — special case: no rookie concept
  if (f.sport === 'pokemon') {
    rules.push('Pokémon does not use a "rookie card" concept. Card values are driven by set-first-print status, 1st Edition stamping, Shadowless vs Unlimited, and specific-card scarcity — not rookie-year designation.');
    return {
      classification: 'unclear',
      label: 'N/A — Pokémon has no rookie card',
      color: 'from-purple-950/40 to-purple-900/20 border-purple-800/50',
      summary: 'Pokémon cards are not classified as rookies. Value drivers: 1st Edition (stamped) > Shadowless > Unlimited > reprints, plus specific-card scarcity within sets (e.g., Base Set Charizard holo is the hobby grail regardless of "rookie" concept).',
      rules,
      flags: ['Use Set Completion tools or Card Identifier for Pokémon instead of rookie-eligibility rules.'],
    };
  }

  return {
    classification: 'unclear',
    label: 'Unclear',
    color: 'from-slate-900 to-slate-800 border-slate-700',
    summary: 'Unable to classify definitively with the inputs provided.',
    rules,
    flags,
  };
}

function sportDebutLabel(s: Sport): string {
  return s === 'mlb' ? 'MLB debut year' :
         s === 'nba' ? 'NBA debut year' :
         s === 'nfl' ? 'NFL debut year' :
         s === 'nhl' ? 'NHL debut year' :
         'Primary-set release year';
}
function sportLicenseLabel(s: Sport): string {
  return s === 'mlb' ? 'Topps' :
         s === 'nba' ? 'Panini' :
         s === 'nfl' ? 'Panini (Fanatics from 2026)' :
         s === 'nhl' ? 'Upper Deck' :
         'The Pokémon Company / Wizards';
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-300">{title}</h3>{children}</section>;
}
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>{children}</label>;
}
const inp = 'w-full rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';
