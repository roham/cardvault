'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ─── Types ──────────────────────────────────────── */

type Sport = 'baseball' | 'basketball' | 'football' | 'hockey' | 'other';

interface NarrativeCard {
  id: string;
  name: string;
  year: number;
  set: string;
  sport: Sport;
  player: string;
  rookie: boolean;
  valueRaw: number;
  slug?: string;
  custom?: boolean;
}

type ArchetypeKey =
  | 'vintageConnoisseur'
  | 'modernMonster'
  | 'rookieHunter'
  | 'teamLoyalist'
  | 'diversifiedTrader'
  | 'setCompletionist'
  | 'budgetSpecialist'
  | 'premiumChaser';

interface Archetype {
  key: ArchetypeKey;
  title: string;
  tagline: string;
  accent: string;
  border: string;
  text: string;
  icon: string;
}

interface CollectionStats {
  total: number;
  preWar: number;
  vintage: number;
  modern: number;
  current: number;
  rookieCount: number;
  sportCounts: Record<string, number>;
  playerCounts: Record<string, number>;
  setCounts: Record<string, number>;
  totalValueRaw: number;
  avgValueRaw: number;
  medianValueRaw: number;
  oldestYear: number;
  newestYear: number;
  birthYearMatches: NarrativeCard[];
  topPlayer: string;
  topPlayerCount: number;
  topSport: string;
  topSportCount: number;
  topSet: string;
  topSetCount: number;
  uniqueSports: number;
}

interface NarrativeOutput {
  archetype: Archetype;
  vibe: string;
  paragraphs: [string, string, string];
  signature: NarrativeCard;
  quirky: { label: string; value: string }[];
}

interface Snapshot {
  ts: number;
  archetype: string;
  vibe: string;
  cardCount: number;
  totalValue: number;
}

/* ─── Data ───────────────────────────────────────── */

const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  vintageConnoisseur: {
    key: 'vintageConnoisseur',
    title: 'Vintage Connoisseur',
    tagline: 'Patience, paper, provenance.',
    accent: 'bg-amber-950/50',
    border: 'border-amber-700/50',
    text: 'text-amber-300',
    icon: '◈',
  },
  modernMonster: {
    key: 'modernMonster',
    title: 'Modern Monster',
    tagline: 'First in the door at every release.',
    accent: 'bg-emerald-950/50',
    border: 'border-emerald-700/50',
    text: 'text-emerald-300',
    icon: '⚡',
  },
  rookieHunter: {
    key: 'rookieHunter',
    title: 'Rookie Hunter',
    tagline: 'First-year cards, every sport, every era.',
    accent: 'bg-rose-950/50',
    border: 'border-rose-700/50',
    text: 'text-rose-300',
    icon: '★',
  },
  teamLoyalist: {
    key: 'teamLoyalist',
    title: 'Team Loyalist',
    tagline: 'The collection is the fandom.',
    accent: 'bg-sky-950/50',
    border: 'border-sky-700/50',
    text: 'text-sky-300',
    icon: '◉',
  },
  diversifiedTrader: {
    key: 'diversifiedTrader',
    title: 'Diversified Trader',
    tagline: 'Built like a portfolio, not a shrine.',
    accent: 'bg-indigo-950/50',
    border: 'border-indigo-700/50',
    text: 'text-indigo-300',
    icon: '◎',
  },
  setCompletionist: {
    key: 'setCompletionist',
    title: 'Set Completionist',
    tagline: 'The set is the story. Finish the set.',
    accent: 'bg-violet-950/50',
    border: 'border-violet-700/50',
    text: 'text-violet-300',
    icon: '▦',
  },
  budgetSpecialist: {
    key: 'budgetSpecialist',
    title: 'Budget Specialist',
    tagline: 'Every dollar does work.',
    accent: 'bg-teal-950/50',
    border: 'border-teal-700/50',
    text: 'text-teal-300',
    icon: '◐',
  },
  premiumChaser: {
    key: 'premiumChaser',
    title: 'Premium Chaser',
    tagline: 'Skip the base. Chase the grail.',
    accent: 'bg-fuchsia-950/50',
    border: 'border-fuchsia-700/50',
    text: 'text-fuchsia-300',
    icon: '♦',
  },
};

const VIBES: Record<ArchetypeKey, string[]> = {
  vintageConnoisseur: [
    'Cardboard archaeologist.',
    'Pre-war energy, post-hype zen.',
    'You time-travel through binders.',
    'Patina is a feature, not a flaw.',
  ],
  modernMonster: [
    'Release-day brain, release-day takes.',
    'You already pulled tomorrow’s chase.',
    'Your group chat is a Whatnot stream.',
    'Ink still wet, value already moved.',
  ],
  rookieHunter: [
    'First-year magnet.',
    'You bought it before they were famous.',
    'Every pack is a draft night.',
    'You read the combine results for fun.',
  ],
  teamLoyalist: [
    'One fandom, one collection, one problem.',
    'Your binder has a jersey number.',
    'You would trade three grails for a team patch auto.',
    'Loyalty cards taken literally.',
  ],
  diversifiedTrader: [
    'Diversified across four sports and two eras.',
    'Built like a portfolio manager, rips like a kid.',
    'Correlation is your enemy, variance is your friend.',
    'Your collection is a balanced index.',
  ],
  setCompletionist: [
    'Checklist in one hand, deal alert in the other.',
    'Singles are progress. Progress is joy.',
    'Every card has a card number. Every card number has a slot.',
    'You finish what you start.',
  ],
  budgetSpecialist: [
    'The art of the $12 card.',
    'Master of the dollar bin.',
    'Every dollar fights for its spot.',
    'Value investing, cardboard edition.',
  ],
  premiumChaser: [
    'Base cards sit on the bench.',
    'If it is not numbered, it is not in the binder.',
    'You hunt grails. You bag grails.',
    'Raw cards are someone else’s problem.',
  ],
};

/* ─── Helpers ────────────────────────────────────── */

function parseValue(v: string | number | undefined): number {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  const m = String(v).match(/\$([0-9,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

function formatMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

function computeStats(cards: NarrativeCard[], birthYear: number | null): CollectionStats {
  const total = cards.length;
  let preWar = 0, vintage = 0, modern = 0, current = 0, rookieCount = 0;
  const sportCounts: Record<string, number> = {};
  const playerCounts: Record<string, number> = {};
  const setCounts: Record<string, number> = {};
  const values: number[] = [];
  let totalValueRaw = 0;
  let oldestYear = Infinity;
  let newestYear = -Infinity;
  const birthYearMatches: NarrativeCard[] = [];

  for (const c of cards) {
    if (c.year < 1950) preWar++;
    else if (c.year < 1980) vintage++;
    else if (c.year < 2015) modern++;
    else current++;
    if (c.rookie) rookieCount++;
    sportCounts[c.sport] = (sportCounts[c.sport] ?? 0) + 1;
    playerCounts[c.player] = (playerCounts[c.player] ?? 0) + 1;
    setCounts[c.set] = (setCounts[c.set] ?? 0) + 1;
    values.push(c.valueRaw);
    totalValueRaw += c.valueRaw;
    if (c.year < oldestYear) oldestYear = c.year;
    if (c.year > newestYear) newestYear = c.year;
    if (birthYear && c.year === birthYear) birthYearMatches.push(c);
  }

  values.sort((a, b) => a - b);
  const median = total === 0 ? 0 : values[Math.floor(total / 2)];

  const topPlayerEntry = Object.entries(playerCounts).sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
  const topSportEntry = Object.entries(sportCounts).sort((a, b) => b[1] - a[1])[0] ?? ['', 0];
  const topSetEntry = Object.entries(setCounts).sort((a, b) => b[1] - a[1])[0] ?? ['', 0];

  return {
    total,
    preWar, vintage, modern, current, rookieCount,
    sportCounts, playerCounts, setCounts,
    totalValueRaw,
    avgValueRaw: total === 0 ? 0 : totalValueRaw / total,
    medianValueRaw: median,
    oldestYear: oldestYear === Infinity ? 0 : oldestYear,
    newestYear: newestYear === -Infinity ? 0 : newestYear,
    birthYearMatches,
    topPlayer: topPlayerEntry[0] as string,
    topPlayerCount: topPlayerEntry[1] as number,
    topSport: topSportEntry[0] as string,
    topSportCount: topSportEntry[1] as number,
    topSet: topSetEntry[0] as string,
    topSetCount: topSetEntry[1] as number,
    uniqueSports: Object.keys(sportCounts).length,
  };
}

function detectArchetype(stats: CollectionStats): ArchetypeKey {
  const { total, preWar, vintage, current, rookieCount, topPlayerCount, topSetCount, avgValueRaw, uniqueSports } = stats;
  if (total === 0) return 'diversifiedTrader';
  if ((preWar + vintage) / total >= 0.5) return 'vintageConnoisseur';
  if (current / total >= 0.7) return 'modernMonster';
  if (rookieCount / total >= 0.6) return 'rookieHunter';
  if (topPlayerCount >= Math.max(3, total * 0.4)) return 'teamLoyalist';
  if (topSetCount >= 4) return 'setCompletionist';
  if (avgValueRaw >= 500) return 'premiumChaser';
  if (avgValueRaw > 0 && avgValueRaw < 50) return 'budgetSpecialist';
  if (uniqueSports >= 3) return 'diversifiedTrader';
  return 'diversifiedTrader';
}

function pickSignature(cards: NarrativeCard[], archetype: ArchetypeKey): NarrativeCard {
  if (cards.length === 0) throw new Error('empty');
  const byValue = [...cards].sort((a, b) => b.valueRaw - a.valueRaw);
  const byYearAsc = [...cards].sort((a, b) => a.year - b.year);
  const byYearDesc = [...cards].sort((a, b) => b.year - a.year);
  switch (archetype) {
    case 'vintageConnoisseur': return byYearAsc[0];
    case 'modernMonster': return byYearDesc[0];
    case 'rookieHunter': {
      const rookies = byValue.filter((c) => c.rookie);
      return rookies[0] ?? byValue[0];
    }
    case 'teamLoyalist': {
      const counts: Record<string, number> = {};
      for (const c of cards) counts[c.player] = (counts[c.player] ?? 0) + 1;
      const topPlayer = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      const topPlayerCards = cards.filter((c) => c.player === topPlayer);
      return topPlayerCards.sort((a, b) => b.valueRaw - a.valueRaw)[0];
    }
    case 'setCompletionist': {
      const counts: Record<string, number> = {};
      for (const c of cards) counts[c.set] = (counts[c.set] ?? 0) + 1;
      const topSet = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      const topSetCards = cards.filter((c) => c.set === topSet);
      return topSetCards.sort((a, b) => b.valueRaw - a.valueRaw)[0];
    }
    case 'premiumChaser': return byValue[0];
    case 'budgetSpecialist': {
      const sorted = byValue.filter((c) => c.valueRaw > 0);
      return sorted[Math.floor(sorted.length / 2)] ?? byValue[0];
    }
    default: return byValue[Math.floor(byValue.length / 2)] ?? byValue[0];
  }
}

function sportPretty(s: string): string {
  const map: Record<string, string> = {
    baseball: 'baseball',
    basketball: 'basketball',
    football: 'football',
    hockey: 'hockey',
    other: 'cross-category',
  };
  return map[s] ?? s;
}

function buildParagraphs(stats: CollectionStats, archetype: ArchetypeKey, signature: NarrativeCard, birthYear: number | null): [string, string, string] {
  const sp = sportPretty(stats.topSport);
  const sportPct = pct(stats.topSportCount, stats.total);
  const rookiePct = pct(stats.rookieCount, stats.total);
  const totalVal = formatMoney(stats.totalValueRaw);
  const yearSpan = stats.newestYear - stats.oldestYear;
  const byb = birthYear && stats.birthYearMatches.length > 0;

  const openings: Record<ArchetypeKey, string> = {
    vintageConnoisseur: `You are a Vintage Connoisseur. ${Math.round((stats.preWar + stats.vintage) / stats.total * 100)}% of what you put in front of me predates 1980, and that is not an accident — it is a worldview. Your ${stats.total}-card sample stretches from ${stats.oldestYear} to ${stats.newestYear}, which is ${yearSpan} years of cardboard you treat like archival material. "${signature.name}" is the card a friend would pick up and go, "this is so you."`,
    modernMonster: `You are a Modern Monster. ${pct(stats.current, stats.total)}% of your cards are from 2015 or later, which means you are plugged into every release the way some people are plugged into a group chat. Out of ${stats.total} cards you sent, the newest is from ${stats.newestYear} and your signature piece is "${signature.name}" — recent, hype-adjacent, and already doing work.`,
    rookieHunter: `You are a Rookie Hunter. ${rookiePct}% of your cards are rookies — call-ups, debuts, first-year prints. That is a thesis, not a coincidence. ${stats.total}-card sample, ${stats.rookieCount} of them first-year cardboard, and your signature card "${signature.name}" is exactly the kind of pick a collector makes when they trust their eye on players before the market does.`,
    teamLoyalist: `You are a Team Loyalist. ${stats.topPlayerCount} of your ${stats.total} cards feature ${stats.topPlayer} — ${pct(stats.topPlayerCount, stats.total)}% of the collection, one name. Whatever fandom pulled you in is still pulling. Your signature card, "${signature.name}," is less of a pick and more of a pledge.`,
    diversifiedTrader: `You are a Diversified Trader. You put ${stats.total} cards in front of me and they span ${stats.uniqueSports} sports with nobody dominating — ${sp} only makes up ${sportPct}%. That is not how a fan collects; that is how a portfolio manager collects. "${signature.name}" is your signature not because it is the biggest card, but because it sits right in the middle of your risk curve.`,
    setCompletionist: `You are a Set Completionist. ${stats.topSetCount} of your ${stats.total} cards come from the same product — ${stats.topSet}. The rest of the hobby chases grails; you chase checklists. Your signature card "${signature.name}" is the anchor of the set you are building, and everything else is noise until the binder page is full.`,
    budgetSpecialist: `You are a Budget Specialist. Average card value in your sample is ${formatMoney(stats.avgValueRaw)}, total around ${totalVal}, and you still assembled ${stats.total} cards spanning ${yearSpan} years. This is the hobby played on hard mode. "${signature.name}" is your signature because it shows the kind of card you keep finding — well below what someone would expect from the name.`,
    premiumChaser: `You are a Premium Chaser. ${stats.total} cards, roughly ${totalVal} of total estimated value, and your average card sits at ${formatMoney(stats.avgValueRaw)}. You do not bother with base cards; you skip straight to the numbered tier. Your signature piece "${signature.name}" is exactly the kind of card this collection is built around.`,
  };

  const middles: Record<ArchetypeKey, string> = {
    vintageConnoisseur: `The structural tells: your oldest card is from ${stats.oldestYear}, your average raw value is ${formatMoney(stats.avgValueRaw)}, and ${sp} makes up ${sportPct}% of the sample. Collectors like you tend to treat price volatility as noise — the cards are older than most modern populations, the printing is done, and the comps are what they are. ${byb ? `You also have ${stats.birthYearMatches.length} card${stats.birthYearMatches.length > 1 ? 's' : ''} from the year you were born, which is the kind of quiet detail that gives a vintage collection personality.` : ''}`,
    modernMonster: `The structural tells: ${rookiePct}% of your cards are rookies, average raw value lands at ${formatMoney(stats.avgValueRaw)}, and ${sp} leads the board at ${sportPct}%. You are collecting forward — betting on players whose cards are still sorting out their long-term price, not backward into names everyone already knows. ${byb ? `${stats.birthYearMatches.length} card${stats.birthYearMatches.length > 1 ? 's' : ''} from the year you were born made the cut, which is a nice personal layer under the velocity.` : ''}`,
    rookieHunter: `The structural tells: your oldest rookie in the sample is from ${stats.oldestYear} and your newest is from ${stats.newestYear}, ${sp} leads at ${sportPct}%, and your average raw value is ${formatMoney(stats.avgValueRaw)}. The pattern is clean — you are treating rookie cards as an asset class of their own, not as accessories to a veteran collection. ${byb ? `${stats.birthYearMatches.length} birth-year card${stats.birthYearMatches.length > 1 ? 's' : ''} in the mix, too.` : ''}`,
    teamLoyalist: `The structural tells: ${stats.total} cards, ${sportPct}% in ${sp}, and the single most-represented set is ${stats.topSet} with ${stats.topSetCount} card${stats.topSetCount > 1 ? 's' : ''}. This is a collection built by somebody who watched the games, remembered the moments, and then backfilled the cardboard to match. Rookie share is ${rookiePct}%, and your average raw value lands at ${formatMoney(stats.avgValueRaw)}. ${byb ? `${stats.birthYearMatches.length} birth-year card${stats.birthYearMatches.length > 1 ? 's' : ''} also in there.` : ''}`,
    diversifiedTrader: `The structural tells: ${stats.total} cards across ${stats.uniqueSports} sports, year range from ${stats.oldestYear} to ${stats.newestYear}, and rookies making up ${rookiePct}% of the sample. Your top player, ${stats.topPlayer}, shows up ${stats.topPlayerCount} time${stats.topPlayerCount > 1 ? 's' : ''} — low concentration is intentional. Average raw value is ${formatMoney(stats.avgValueRaw)}; median is ${formatMoney(stats.medianValueRaw)}. ${byb ? `${stats.birthYearMatches.length} birth-year card${stats.birthYearMatches.length > 1 ? 's' : ''} complete the spread.` : ''}`,
    setCompletionist: `The structural tells: ${stats.topSetCount} cards from ${stats.topSet}, ${stats.uniqueSports} sport${stats.uniqueSports > 1 ? 's' : ''} represented, rookie share at ${rookiePct}%, and average raw value at ${formatMoney(stats.avgValueRaw)}. The set is the story — everything else is secondary. Anyone who has ever built a checklist understands why cards are not just cards once you are 70% through a set. ${byb ? `And ${stats.birthYearMatches.length} birth-year card${stats.birthYearMatches.length > 1 ? 's' : ''} slipped in.` : ''}`,
    budgetSpecialist: `The structural tells: ${stats.total} cards, average raw value ${formatMoney(stats.avgValueRaw)}, median ${formatMoney(stats.medianValueRaw)}, ${rookiePct}% rookies, year range ${stats.oldestYear}–${stats.newestYear}. You are pulling from 9,800+ available cards and consistently picking the ones the market has mispriced downward. Top sport is ${sp} at ${sportPct}%. ${byb ? `${stats.birthYearMatches.length} birth-year card${stats.birthYearMatches.length > 1 ? 's' : ''} in there too — cheap, personal, correctly priced.` : ''}`,
    premiumChaser: `The structural tells: ${stats.total} cards, average raw value ${formatMoney(stats.avgValueRaw)}, median ${formatMoney(stats.medianValueRaw)}, and ${stats.topPlayer} is your most-represented name with ${stats.topPlayerCount} appearance${stats.topPlayerCount > 1 ? 's' : ''}. Rookie share is ${rookiePct}%, and ${sp} leads at ${sportPct}%. A premium-heavy binder is a different sport from a base-card binder, and yours looks built, not inherited. ${byb ? `${stats.birthYearMatches.length} birth-year card${stats.birthYearMatches.length > 1 ? 's' : ''} also survived the cull.` : ''}`,
  };

  const closings: Record<ArchetypeKey, string> = {
    vintageConnoisseur: `Next move: add one card from the 1948–1956 window you do not already have — a Bowman, a Leaf, a play-at-the-plate Topps. That era is the shortest bridge between your current collection and the historical blue-chip tier. Trading tip: collectors like you almost always underweight hockey vintage. One 1950s Parkhurst would sharpen the spread without changing the character.`,
    modernMonster: `Next move: plant one anchor card that is older than 2005. A collection this modern benefits from a single vintage piece the same way a portfolio benefits from a bond allocation. It does not need to be expensive — it needs to be OLD. Trading tip: half your short-term risk is one bad rookie season. The anchor card removes the correlation problem without costing you any of your edge.`,
    rookieHunter: `Next move: pick one of your rookies — just one — and commit to the grade submission. Ungraded rookies are theses waiting to be tested, and a PSA/BGS slab is how the thesis earns its premium. Trading tip: the best move for a Rookie Hunter is usually the next card BEFORE the one everyone is talking about. Watch the "under-drafted in the first four picks" group; those are your most asymmetric buys.`,
    teamLoyalist: `Next move: the gap in a team collection is always the decade you were not following the sport. Figure out which decade is missing from your stack and add one flagship card from that era. Trading tip: franchise-patch autos on your most-collected player age better than base cards. If you are going to trade up, trade into patches, not numbers.`,
    diversifiedTrader: `Next move: this portfolio is well-diversified across sports but thin on era diversity. Add a card from a decade you currently have zero representation in. Trading tip: your collection is behaving like an index fund — fine as a default, but the highest-conviction collectors add one or two concentrated positions on top. Pick the player or set you actually love and overweight it on purpose.`,
    setCompletionist: `Next move: finish the set. You know what is missing, you know what it costs, and the longer you wait the more the prices compress around the chase cards. Trading tip: when you DO finish, do not immediately start the next set. Hold the completed build for at least six months — complete runs command a premium collectors always underestimate until they try to sell.`,
    budgetSpecialist: `Next move: take one card in your current collection under $25 and research the nearest graded PSA 9 comp. Sometimes the cheap card is actually a raw gem one submission away from a very different number. Trading tip: budget collectors win on volume and patience. You do not need to change your approach — you need to keep doing it for another two years.`,
    premiumChaser: `Next move: add ONE card priced below $100. The biggest blind spot in a premium collection is that you stop noticing which cheap cards are about to appreciate because you are not scanning that price tier anymore. Trading tip: for your chases, focus less on the highest-numbered parallel and more on the one the player actually cares about. Inscribed autos age differently than straight autos.`,
  };

  return [openings[archetype], middles[archetype], closings[archetype]];
}

function buildQuirky(stats: CollectionStats, birthYear: number | null) {
  const out: { label: string; value: string }[] = [];
  if (birthYear) {
    out.push({ label: `Cards from ${birthYear}`, value: `${stats.birthYearMatches.length}` });
  }
  out.push({ label: 'Dominant sport', value: `${sportPretty(stats.topSport)} (${pct(stats.topSportCount, stats.total)}%)` });
  out.push({ label: 'Oldest card year', value: `${stats.oldestYear || '—'}` });
  out.push({ label: 'Newest card year', value: `${stats.newestYear || '—'}` });
  out.push({ label: 'Rookie share', value: `${pct(stats.rookieCount, stats.total)}%` });
  out.push({ label: 'Est. total value', value: formatMoney(stats.totalValueRaw) });
  return out;
}

/* ─── DB prep ────────────────────────────────────── */

type DbCard = {
  slug: string;
  name: string;
  year: number;
  set: string;
  sport: Sport;
  player: string;
  rookie: boolean;
  valueRaw: number;
};

function buildDb(): DbCard[] {
  const rows: DbCard[] = [];
  for (const c of sportsCards as unknown as Array<Record<string, unknown>>) {
    rows.push({
      slug: String(c.slug),
      name: String(c.name),
      year: Number(c.year) || 0,
      set: String(c.set),
      sport: (String(c.sport) as Sport) || 'other',
      player: String(c.player),
      rookie: Boolean(c.rookie),
      valueRaw: parseValue(c.estimatedValueRaw as string),
    });
  }
  return rows;
}

const STORAGE_KEY = 'cv-collection-narrative-v1';

/* ─── Component ──────────────────────────────────── */

export default function CollectionNarrativeClient() {
  const db = useMemo(() => buildDb(), []);

  const [cards, setCards] = useState<NarrativeCard[]>([]);
  const [search, setSearch] = useState('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState({
    name: '', year: '', sport: 'baseball' as Sport, player: '', rookie: false, value: '',
  });
  const [output, setOutput] = useState<NarrativeOutput | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [copied, setCopied] = useState(false);

  /* Load last session */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { cards?: NarrativeCard[]; birthYear?: string; snapshots?: Snapshot[] };
      if (Array.isArray(parsed.cards)) setCards(parsed.cards);
      if (typeof parsed.birthYear === 'string') setBirthYear(parsed.birthYear);
      if (Array.isArray(parsed.snapshots)) setSnapshots(parsed.snapshots);
    } catch {}
  }, []);

  /* Persist */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards, birthYear, snapshots }));
    } catch {}
  }, [cards, birthYear, snapshots]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return [];
    return db
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.player.toLowerCase().includes(q) ||
        c.set.toLowerCase().includes(q))
      .slice(0, 10);
  }, [search, db]);

  const addDbCard = useCallback((row: DbCard) => {
    if (cards.length >= 20) return;
    if (cards.some((c) => c.id === row.slug)) return;
    setCards((prev) => [...prev, {
      id: row.slug,
      name: row.name,
      year: row.year,
      set: row.set,
      sport: row.sport,
      player: row.player,
      rookie: row.rookie,
      valueRaw: row.valueRaw,
      slug: row.slug,
    }]);
    setSearch('');
  }, [cards]);

  const addCustom = useCallback(() => {
    if (cards.length >= 20) return;
    if (!custom.name.trim()) return;
    const year = parseInt(custom.year, 10);
    if (!year || year < 1850 || year > 2100) return;
    const val = parseFloat(custom.value);
    setCards((prev) => [...prev, {
      id: `custom-${Date.now()}`,
      name: custom.name.trim(),
      year,
      set: custom.name.trim(),
      sport: custom.sport,
      player: custom.player.trim() || custom.name.trim(),
      rookie: custom.rookie,
      valueRaw: Number.isFinite(val) && val > 0 ? val : 0,
      custom: true,
    }]);
    setCustom({ name: '', year: '', sport: 'baseball', player: '', rookie: false, value: '' });
    setShowCustom(false);
  }, [custom, cards]);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('Clear all cards and your saved snapshots?')) return;
    setCards([]);
    setBirthYear('');
    setSnapshots([]);
    setOutput(null);
  }, []);

  const generate = useCallback(() => {
    if (cards.length < 5) return;
    const byY = birthYear ? parseInt(birthYear, 10) : null;
    const stats = computeStats(cards, byY && byY >= 1900 && byY <= 2100 ? byY : null);
    const archetypeKey = detectArchetype(stats);
    const archetype = ARCHETYPES[archetypeKey];
    const signature = pickSignature(cards, archetypeKey);
    const vibes = VIBES[archetypeKey];
    const vibeIndex = (cards.length + stats.oldestYear) % vibes.length;
    const vibe = vibes[vibeIndex];
    const paragraphs = buildParagraphs(stats, archetypeKey, signature, byY ?? null);
    const quirky = buildQuirky(stats, byY ?? null);
    const result: NarrativeOutput = { archetype, vibe, paragraphs, signature, quirky };
    setOutput(result);
    setSnapshots((prev) => [
      { ts: Date.now(), archetype: archetype.title, vibe, cardCount: cards.length, totalValue: stats.totalValueRaw },
      ...prev,
    ].slice(0, 10));
  }, [cards, birthYear]);

  const shareText = useMemo(() => {
    if (!output) return '';
    const lines: string[] = [];
    lines.push(`My CardVault Collection Narrative:`);
    lines.push(``);
    lines.push(`${output.archetype.icon} ${output.archetype.title}`);
    lines.push(`"${output.vibe}"`);
    lines.push(``);
    lines.push(`Signature card: ${output.signature.name}`);
    lines.push(`Cards analyzed: ${cards.length}`);
    lines.push(``);
    lines.push(output.paragraphs[0]);
    lines.push(``);
    lines.push(`→ cardvault-two.vercel.app/tools/collection-narrative`);
    return lines.join('\n');
  }, [output, cards.length]);

  const copyShare = useCallback(async () => {
    if (!shareText || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [shareText]);

  const canGenerate = cards.length >= 5;
  const totalValueNow = cards.reduce((s, c) => s + c.valueRaw, 0);

  return (
    <div className="space-y-6">
      {/* Collection builder */}
      <div className="rounded-xl border border-fuchsia-800/40 bg-gradient-to-br from-fuchsia-950/40 to-gray-900/60 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Your Collection Input</h2>
          <span className="text-xs text-fuchsia-300">{cards.length}/20 cards · {formatMoney(totalValueNow)} est.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 9,800+ cards — player, set, year..."
            className="flex-1 px-3 py-2 rounded-lg bg-gray-900/80 border border-gray-700/60 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-fuchsia-500"
          />
          <button
            onClick={() => setShowCustom((v) => !v)}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm whitespace-nowrap"
            type="button"
          >
            {showCustom ? '× Cancel custom' : '+ Add custom card'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="rounded-lg border border-gray-800 bg-gray-950/80 divide-y divide-gray-800 mb-3">
            {results.map((r) => (
              <button
                key={r.slug}
                onClick={() => addDbCard(r)}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-fuchsia-950/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm text-white">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.player} · {r.sport} · {r.rookie ? 'RC · ' : ''}{formatMoney(r.valueRaw)}</div>
                </div>
                <span className="text-fuchsia-400 text-sm">+ add</span>
              </button>
            ))}
          </div>
        )}

        {showCustom && (
          <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3 mb-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="Card name" className="px-2 py-1.5 rounded bg-gray-950 border border-gray-700 text-white text-sm" />
              <input type="number" value={custom.year} onChange={(e) => setCustom({ ...custom, year: e.target.value })} placeholder="Year" className="px-2 py-1.5 rounded bg-gray-950 border border-gray-700 text-white text-sm" />
              <input type="text" value={custom.player} onChange={(e) => setCustom({ ...custom, player: e.target.value })} placeholder="Player" className="px-2 py-1.5 rounded bg-gray-950 border border-gray-700 text-white text-sm" />
              <input type="number" value={custom.value} onChange={(e) => setCustom({ ...custom, value: e.target.value })} placeholder="Approx $ value" className="px-2 py-1.5 rounded bg-gray-950 border border-gray-700 text-white text-sm" />
              <select value={custom.sport} onChange={(e) => setCustom({ ...custom, sport: e.target.value as Sport })} className="px-2 py-1.5 rounded bg-gray-950 border border-gray-700 text-white text-sm">
                <option value="baseball">Baseball</option>
                <option value="basketball">Basketball</option>
                <option value="football">Football</option>
                <option value="hockey">Hockey</option>
                <option value="other">Other</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-300 px-2">
                <input type="checkbox" checked={custom.rookie} onChange={(e) => setCustom({ ...custom, rookie: e.target.checked })} />
                Rookie card
              </label>
            </div>
            <button onClick={addCustom} type="button" className="w-full px-3 py-2 rounded bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm font-medium">
              Add this card
            </button>
          </div>
        )}

        {/* Added list */}
        {cards.length > 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-950/50 divide-y divide-gray-800/60 max-h-64 overflow-y-auto">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2 gap-2">
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{c.name}{c.rookie && <span className="ml-1 text-xs text-rose-400">RC</span>}</div>
                  <div className="text-xs text-gray-500 truncate">{c.player} · {c.year} · {c.sport} · {formatMoney(c.valueRaw)}{c.custom && <span className="ml-1 text-fuchsia-400">(custom)</span>}</div>
                </div>
                <button onClick={() => removeCard(c.id)} type="button" className="text-gray-500 hover:text-rose-400 text-sm px-2">×</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-700/60 bg-gray-950/30 px-3 py-6 text-center text-sm text-gray-500">
            Add at least 5 cards to generate your narrative. Max 20.
          </div>
        )}

        <div className="mt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Birth year (optional):</label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="1990"
              className="w-24 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
          <button
            onClick={generate}
            disabled={!canGenerate}
            type="button"
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-white text-sm ${canGenerate ? 'bg-fuchsia-700 hover:bg-fuchsia-600' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            {canGenerate ? '✦ Generate Narrative' : `Need ${5 - cards.length} more card${5 - cards.length === 1 ? '' : 's'}`}
          </button>
          {cards.length > 0 && (
            <button onClick={clearAll} type="button" className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-rose-900/60 border border-gray-700 text-gray-400 hover:text-rose-300 text-xs">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className={`rounded-xl border ${output.archetype.border} ${output.archetype.accent} p-5 space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className={`text-xs uppercase tracking-wider ${output.archetype.text} mb-1`}>Archetype</div>
              <h3 className={`text-2xl font-black text-white flex items-center gap-3`}>
                <span className={`${output.archetype.text} text-3xl`}>{output.archetype.icon}</span>
                {output.archetype.title}
              </h3>
              <p className="text-gray-300 text-sm mt-1">{output.archetype.tagline}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Vibe tag</div>
              <div className={`text-base font-semibold ${output.archetype.text} italic`}>"{output.vibe}"</div>
            </div>
          </div>

          <div className="rounded-lg bg-black/30 border border-gray-800 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Signature card</div>
            <div className="text-white font-semibold">{output.signature.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              {output.signature.player} · {output.signature.year} · {sportPretty(output.signature.sport)} · {formatMoney(output.signature.valueRaw)}
              {output.signature.rookie && <span className="ml-2 text-rose-400">ROOKIE</span>}
            </div>
            {output.signature.slug && (
              <Link href={`/cards/${output.signature.slug}`} className={`${output.archetype.text} text-xs mt-2 inline-block hover:underline`}>
                View card page →
              </Link>
            )}
          </div>

          <div className="space-y-3 text-gray-200 leading-relaxed text-sm">
            <p>{output.paragraphs[0]}</p>
            <p>{output.paragraphs[1]}</p>
            <p>{output.paragraphs[2]}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {output.quirky.map((q, i) => (
              <div key={i} className="rounded-lg bg-black/40 border border-gray-800 px-3 py-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{q.label}</div>
                <div className={`text-sm font-semibold ${output.archetype.text}`}>{q.value}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
            <button onClick={copyShare} type="button" className="px-3 py-2 rounded bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm font-medium">
              {copied ? '✓ Copied!' : '📋 Copy Narrative'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm a ${output.archetype.title}. "${output.vibe}"\n\nSignature card: ${output.signature.name}\n\nGet your CardVault Collection Narrative →`)}&url=${encodeURIComponent('https://cardvault-two.vercel.app/tools/collection-narrative')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium"
            >
              Share to X
            </a>
            <button onClick={() => setOutput(null)} type="button" className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm">
              Hide
            </button>
          </div>
        </div>
      )}

      {/* Snapshots history */}
      {snapshots.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Your Past Narratives</h3>
          <div className="space-y-1.5">
            {snapshots.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800/50 pb-1.5 last:border-0">
                <span>
                  <span className="text-fuchsia-400 font-medium">{s.archetype}</span>
                  <span className="text-gray-600 mx-1">·</span>
                  <span className="italic">"{s.vibe}"</span>
                </span>
                <span className="text-gray-500">{s.cardCount} cards · {formatMoney(s.totalValue)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-4">
        <h3 className="text-sm font-semibold text-white mb-2">How the narrative is built</h3>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li><span className="text-fuchsia-400">Archetype detection</span> — your era mix, rookie share, player/set concentration, and average value map to 1 of 8 collector archetypes.</li>
          <li><span className="text-fuchsia-400">Signature card</span> — the card in your input that best embodies your archetype (oldest for Vintage Connoisseur, highest rookie for Rookie Hunter, etc.).</li>
          <li><span className="text-fuchsia-400">3-paragraph writeup</span> — opening identity, structural tells from your data, and a concrete next move to strengthen the collection.</li>
          <li><span className="text-fuchsia-400">Quirky stats</span> — small personal numbers (birth-year matches, dominant sport %, oldest/newest year) that make the share more specific than generic.</li>
          <li><span className="text-fuchsia-400">Local only</span> — your cards never leave your browser. Clear anytime.</li>
        </ul>
      </div>
    </div>
  );
}
