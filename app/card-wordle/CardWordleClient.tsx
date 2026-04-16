'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';

/* ── helpers ─────────────────────────────────────────────────────── */

function dateHash(d: Date): number {
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRng(seed: number) {
  let s = seed || 42;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function parseValue(raw: string): number {
  const m = raw.match(/\$(\d[\d,]*)/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

/* ── types ───────────────────────────────────────────────────────── */

interface PlayerData {
  name: string;
  sport: string;
  position: string;
  team: string;
  decade: string;
  decadeNum: number;
  valueTier: number;
  value: number;
  cardCount: number;
  description: string;
  year: number;
}

type ClueColor = 'green' | 'yellow' | 'red';

interface GuessResult {
  player: PlayerData;
  sport: ClueColor;
  position: ClueColor;
  team: ClueColor;
  decade: ClueColor;
  value: ClueColor;
  valueDirection: 'up' | 'down' | 'match';
}

interface Stats {
  played: number;
  won: number;
  streak: number;
  maxStreak: number;
  distribution: number[]; // indices 0-6: guesses 1-6 + fail
}

/* ── constants ───────────────────────────────────────────────────── */

const MAX_GUESSES = 6;
const STORAGE_KEY = 'cardvault-card-wordle-stats';
const STATE_KEY = 'cardvault-card-wordle-state';
const SPORTS_ICONS: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

/* ── position extraction from description ────────────────────────── */

const POSITION_PATTERNS: Array<{ regex: RegExp; pos: string }> = [
  // Specific patterns first
  { regex: /\bquarterback\b|\bfranchise QB\b|\bdual-threat\b.*QB|\bQB\b/i, pos: 'QB' },
  { regex: /\brunning back\b|\bRB\b|\bhalfback\b/i, pos: 'RB' },
  { regex: /\bwide receiver\b|\breceiver\b|\bWR\b/i, pos: 'WR' },
  { regex: /\btight end\b|\bTE\b/i, pos: 'TE' },
  { regex: /\boffensive tackle\b|\boffensive line/i, pos: 'OT' },
  { regex: /\bcornerback\b|\bCB\b/i, pos: 'CB' },
  { regex: /\bsafety\b(?!.*net)|\bS\b.*(?:defensive|secondary)/i, pos: 'S' },
  { regex: /\bmiddle linebacker\b|\blinebacker\b|\bLB\b|\bEDGE\b|\bedge rusher\b/i, pos: 'LB' },
  { regex: /\bdefensive end\b|\bDE\b|\bdefensive tackle\b|\bDT\b|\bdefensive line/i, pos: 'DE' },
  // Baseball
  { regex: /\bpitch(?:er|ing)\b|\bCy Young\b|\bstarting pitcher\b|\bace\b|\b(?:SP|RP)\b.*(?:pitch|arm|fastball)/i, pos: 'SP' },
  { regex: /\bcloser\b|\brelief\b|\bsaves\b|\bbullpen\b/i, pos: 'RP' },
  { regex: /\bshortstop\b|\bat shortstop\b/i, pos: 'SS' },
  { regex: /\bsecond base(?:man)?\b|\b2B\b/i, pos: '2B' },
  { regex: /\bthird base(?:man)?\b|\b3B\b/i, pos: '3B' },
  { regex: /\bfirst base(?:man)?\b|\b1B\b/i, pos: '1B' },
  { regex: /\bcatcher\b/i, pos: 'C' },
  { regex: /\bcenter field(?:er)?\b|\bCF\b/i, pos: 'CF' },
  { regex: /\boutfield(?:er)?\b|\bOF\b|\bleft field\b|\bright field\b/i, pos: 'OF' },
  // Basketball
  { regex: /\bpoint guard\b|\bPG\b/i, pos: 'PG' },
  { regex: /\bshooting guard\b|\bSG\b|\bguard who\b|\bscoring guard\b/i, pos: 'SG' },
  { regex: /\bsmall forward\b|\bSF\b|\bwing\b/i, pos: 'SF' },
  { regex: /\bpower forward\b|\bPF\b|\bstretch (four|big)\b/i, pos: 'PF' },
  { regex: /\bcenter\b.*(?:basket|NBA|rebound|rim|block|dunk|post)/i, pos: 'C' },
  { regex: /\bguard\b.*(?:basket|NBA|score|shoot|point|play)/i, pos: 'G' },
  { regex: /\bforward\b.*(?:basket|NBA|score|shoot)/i, pos: 'F' },
  // Hockey
  { regex: /\bgoal(?:ie|tender|keeper)\b|\bnetminder\b|\bgoaltend/i, pos: 'G' },
  { regex: /\bdefense(?:man)?\b.*(?:hockey|NHL|Stanley|OPC|Young Guns|puck)/i, pos: 'D' },
  { regex: /\bleft wing\b|\bLW\b/i, pos: 'LW' },
  { regex: /\bright wing\b|\bRW\b|\bsniper\b.*(?:hockey|NHL)/i, pos: 'RW' },
  { regex: /\bcenter\b.*(?:hockey|NHL|Stanley|playmaking|faceoff)/i, pos: 'C' },
];

function extractPosition(description: string, sport: string): string {
  for (const { regex, pos } of POSITION_PATTERNS) {
    if (regex.test(description)) return pos;
  }
  // Sport-specific fallbacks
  switch (sport) {
    case 'baseball': return 'OF';
    case 'basketball': return 'G';
    case 'football': return 'WR';
    case 'hockey': return 'F';
    default: return '?';
  }
}

/* ── team extraction from description ────────────────────────────── */

const TEAM_PATTERNS: Array<{ regex: RegExp; team: string }> = [
  // MLB
  { regex: /\bYankees\b/i, team: 'Yankees' }, { regex: /\bRed Sox\b/i, team: 'Red Sox' },
  { regex: /\bDodgers\b/i, team: 'Dodgers' }, { regex: /\bMets\b/i, team: 'Mets' },
  { regex: /\bAstros\b/i, team: 'Astros' }, { regex: /\bBraves\b/i, team: 'Braves' },
  { regex: /\bPhillies\b/i, team: 'Phillies' }, { regex: /\bCardinals\b/i, team: 'Cardinals' },
  { regex: /\bCubs\b/i, team: 'Cubs' }, { regex: /\bGiants\b(?!.*football)/i, team: 'Giants' },
  { regex: /\bPadres\b/i, team: 'Padres' }, { regex: /\bOrioles\b/i, team: 'Orioles' },
  { regex: /\bTwins\b/i, team: 'Twins' }, { regex: /\bGuardians\b|\bIndians\b|\bCleveland\b.*baseball/i, team: 'Guardians' },
  { regex: /\bRangers\b(?!.*hockey)/i, team: 'Rangers' }, { regex: /\bBrewers\b/i, team: 'Brewers' },
  { regex: /\bReds\b/i, team: 'Reds' }, { regex: /\bPirates\b/i, team: 'Pirates' },
  { regex: /\bTigers\b/i, team: 'Tigers' }, { regex: /\bRoyals\b/i, team: 'Royals' },
  { regex: /\bWhite Sox\b/i, team: 'White Sox' }, { regex: /\bAngels\b/i, team: 'Angels' },
  { regex: /\bMariners\b/i, team: 'Mariners' }, { regex: /\bRays\b/i, team: 'Rays' },
  { regex: /\bAthletics\b|\bA's\b/i, team: 'Athletics' }, { regex: /\bDiamondbacks\b/i, team: 'Diamondbacks' },
  { regex: /\bRockies\b/i, team: 'Rockies' }, { regex: /\bNationals\b/i, team: 'Nationals' },
  { regex: /\bBlue Jays\b/i, team: 'Blue Jays' }, { regex: /\bMarlins\b/i, team: 'Marlins' },
  // NBA
  { regex: /\bLakers\b/i, team: 'Lakers' }, { regex: /\bCeltics\b/i, team: 'Celtics' },
  { regex: /\bBulls\b/i, team: 'Bulls' }, { regex: /\bWarriors\b/i, team: 'Warriors' },
  { regex: /\bHeat\b/i, team: 'Heat' }, { regex: /\bNets\b/i, team: 'Nets' },
  { regex: /\b76ers\b|\bSixers\b/i, team: '76ers' }, { regex: /\bKnicks\b/i, team: 'Knicks' },
  { regex: /\bBucks\b/i, team: 'Bucks' }, { regex: /\bSuns\b/i, team: 'Suns' },
  { regex: /\bNuggets\b/i, team: 'Nuggets' }, { regex: /\bClippers\b/i, team: 'Clippers' },
  { regex: /\bMavericks\b|\bMavs\b/i, team: 'Mavericks' }, { regex: /\bSpurs\b/i, team: 'Spurs' },
  { regex: /\bRaptors\b|\bToronto\b.*NBA/i, team: 'Raptors' }, { regex: /\bGrizzlies\b/i, team: 'Grizzlies' },
  { regex: /\bPelicans\b/i, team: 'Pelicans' }, { regex: /\bTimberwolves\b/i, team: 'Timberwolves' },
  { regex: /\bHawks\b/i, team: 'Hawks' }, { regex: /\bCavaliers\b|\bCavs\b/i, team: 'Cavaliers' },
  { regex: /\bPistons\b/i, team: 'Pistons' }, { regex: /\bPacers\b/i, team: 'Pacers' },
  { regex: /\bKings\b(?!.*hockey)/i, team: 'Kings' }, { regex: /\bMagic\b/i, team: 'Magic' },
  { regex: /\bRockets\b/i, team: 'Rockets' }, { regex: /\bThunder\b/i, team: 'Thunder' },
  { regex: /\bHornets\b/i, team: 'Hornets' }, { regex: /\bBlazers\b|\bTrail Blazers\b/i, team: 'Trail Blazers' },
  { regex: /\bJazz\b/i, team: 'Jazz' }, { regex: /\bWizards\b/i, team: 'Wizards' },
  // NFL
  { regex: /\bChiefs\b/i, team: 'Chiefs' }, { regex: /\bEagles\b/i, team: 'Eagles' },
  { regex: /\b49ers\b/i, team: '49ers' }, { regex: /\bBills\b/i, team: 'Bills' },
  { regex: /\bBengals\b/i, team: 'Bengals' }, { regex: /\bCowboys\b/i, team: 'Cowboys' },
  { regex: /\bDolphins\b/i, team: 'Dolphins' }, { regex: /\bPackers\b/i, team: 'Packers' },
  { regex: /\bRavens\b/i, team: 'Ravens' }, { regex: /\bChargers\b/i, team: 'Chargers' },
  { regex: /\bColts\b/i, team: 'Colts' }, { regex: /\bBroncos\b/i, team: 'Broncos' },
  { regex: /\bSeahawks\b/i, team: 'Seahawks' }, { regex: /\bSteelers\b/i, team: 'Steelers' },
  { regex: /\bPatriots\b/i, team: 'Patriots' }, { regex: /\bBears\b/i, team: 'Bears' },
  { regex: /\bFalcons\b/i, team: 'Falcons' }, { regex: /\bVikings\b/i, team: 'Vikings' },
  { regex: /\bSaints\b/i, team: 'Saints' }, { regex: /\bPanthers\b(?!.*hockey)/i, team: 'Panthers' },
  { regex: /\bJaguars\b/i, team: 'Jaguars' }, { regex: /\bRams\b/i, team: 'Rams' },
  { regex: /\bTexans\b/i, team: 'Texans' }, { regex: /\bCommanders\b|\bWashington\b.*(?:NFL|football)/i, team: 'Commanders' },
  { regex: /\bTitans\b/i, team: 'Titans' }, { regex: /\bJets\b/i, team: 'Jets' },
  { regex: /\bLions\b/i, team: 'Lions' }, { regex: /\bBuccaneers\b|\bBucs\b/i, team: 'Buccaneers' },
  // NHL
  { regex: /\bOilers\b/i, team: 'Oilers' }, { regex: /\bMaple Leafs\b/i, team: 'Maple Leafs' },
  { regex: /\bCanadiens\b|\bHabs\b/i, team: 'Canadiens' }, { regex: /\bBruins\b/i, team: 'Bruins' },
  { regex: /\bPenguins\b|\bPittsburgh\b.*(?:NHL|hockey|Stanley)/i, team: 'Penguins' },
  { regex: /\bBlackhawks\b/i, team: 'Blackhawks' }, { regex: /\bRed Wings\b/i, team: 'Red Wings' },
  { regex: /\bFlyers\b/i, team: 'Flyers' }, { regex: /\bCanucks\b|\bVancouver\b.*NHL/i, team: 'Canucks' },
  { regex: /\bFlames\b/i, team: 'Flames' }, { regex: /\bAvalanche\b/i, team: 'Avalanche' },
  { regex: /\bLightning\b/i, team: 'Lightning' }, { regex: /\bCapitals\b/i, team: 'Capitals' },
  { regex: /\bIslanders\b/i, team: 'Islanders' }, { regex: /\bDevils\b/i, team: 'Devils' },
  { regex: /\bSenators\b/i, team: 'Senators' }, { regex: /\bDucks\b/i, team: 'Ducks' },
  { regex: /\bSharks\b/i, team: 'Sharks' }, { regex: /\bPredators\b/i, team: 'Predators' },
  { regex: /\bWild\b.*(?:hockey|NHL|Minnesota)/i, team: 'Wild' },
  { regex: /\bCanes\b|\bHurricanes\b/i, team: 'Hurricanes' },
  { regex: /\bBlue Jackets\b/i, team: 'Blue Jackets' },
  { regex: /\bGolden Knights\b/i, team: 'Golden Knights' },
  { regex: /\bKraken\b/i, team: 'Kraken' },
  { regex: /\bStars\b.*(?:hockey|NHL|Dallas)/i, team: 'Stars' },
];

function extractTeam(description: string, _sport: string): string {
  for (const { regex, team } of TEAM_PATTERNS) {
    if (regex.test(description)) return team;
  }
  return 'Unknown';
}

/* ── position group matching ─────────────────────────────────────── */

const POSITION_GROUPS: Record<string, string> = {
  // Baseball Pitchers
  SP: 'pitcher', RP: 'pitcher', P: 'pitcher',
  // Baseball Infielders
  SS: 'infielder', '2B': 'infielder', '3B': 'infielder', '1B': 'infielder', IF: 'infielder', INF: 'infielder',
  // Baseball Outfielders
  OF: 'outfielder', CF: 'outfielder', RF: 'outfielder', LF: 'outfielder',
  // Baseball Catcher has no group — it's unique
  // NBA Guards
  PG: 'nba-guard', SG: 'nba-guard', G: 'nba-guard',
  // NBA Forwards
  SF: 'nba-forward', PF: 'nba-forward', F: 'nba-forward',
  // NBA/Hockey Centers handled by sport context
  // NFL Offense
  QB: 'nfl-offense', RB: 'nfl-offense', WR: 'nfl-offense', TE: 'nfl-offense', OT: 'nfl-offense', OL: 'nfl-offense', OG: 'nfl-offense',
  // NFL Defense
  CB: 'nfl-defense', S: 'nfl-defense', LB: 'nfl-defense', DE: 'nfl-defense', DT: 'nfl-defense', EDGE: 'nfl-defense', DL: 'nfl-defense',
  // NHL Forwards
  LW: 'nhl-forward', RW: 'nhl-forward',
  // NHL Defense
  D: 'nhl-defense',
};

function getPositionGroup(pos: string, sport: string): string {
  // Handle ambiguous positions by sport
  if (pos === 'C') {
    if (sport === 'basketball') return 'nba-center';
    if (sport === 'hockey') return 'nhl-forward';
    if (sport === 'football') return 'nfl-offense';
    return 'catcher'; // baseball
  }
  if (pos === 'G') {
    if (sport === 'hockey') return 'nhl-goalie';
    return 'nba-guard';
  }
  if (pos === 'F') {
    if (sport === 'hockey') return 'nhl-forward';
    return 'nba-forward';
  }
  return POSITION_GROUPS[pos] || pos;
}

/* ── value tier ──────────────────────────────────────────────────── */

function getValueTier(value: number): number {
  if (value < 5) return 1;
  if (value < 25) return 2;
  if (value < 100) return 3;
  if (value < 500) return 4;
  return 5;
}

const VALUE_TIER_LABELS: Record<number, string> = {
  1: '<$5',
  2: '$5-$24',
  3: '$25-$99',
  4: '$100-$499',
  5: '$500+',
};

/* ── build player map ────────────────────────────────────────────── */

function buildPlayerMap(): Map<string, PlayerData> {
  const map = new Map<string, { sport: string; years: number[]; descriptions: string[]; values: number[]; cardCount: number }>();

  for (const c of sportsCards) {
    if ((c.sport as string) === 'pokemon') continue;
    const val = parseValue(c.estimatedValueRaw || '$0');
    const existing = map.get(c.player);
    if (existing) {
      existing.years.push(c.year);
      existing.descriptions.push(c.description);
      existing.values.push(val);
      existing.cardCount++;
    } else {
      map.set(c.player, {
        sport: c.sport,
        years: [c.year],
        descriptions: [c.description],
        values: [val],
        cardCount: 1,
      });
    }
  }

  const result = new Map<string, PlayerData>();
  for (const [name, data] of map) {
    const allDesc = data.descriptions.join(' ');
    const position = extractPosition(allDesc, data.sport);
    const team = extractTeam(allDesc, data.sport);
    const minYear = Math.min(...data.years);
    const decadeNum = Math.floor(minYear / 10) * 10;
    const maxVal = Math.max(...data.values);
    result.set(name, {
      name,
      sport: data.sport,
      position,
      team,
      decade: `${decadeNum}s`,
      decadeNum,
      valueTier: getValueTier(maxVal),
      value: maxVal,
      cardCount: data.cardCount,
      description: data.descriptions[0],
      year: minYear,
    });
  }

  return result;
}

/* ── clue comparison ─────────────────────────────────────────────── */

function compareGuess(guess: PlayerData, answer: PlayerData): GuessResult {
  // Sport
  const sportClue: ClueColor = guess.sport === answer.sport ? 'green' : 'red';

  // Position
  let positionClue: ClueColor = 'red';
  if (guess.position === answer.position) {
    positionClue = 'green';
  } else if (getPositionGroup(guess.position, guess.sport) === getPositionGroup(answer.position, answer.sport)) {
    positionClue = 'yellow';
  }

  // Team
  let teamClue: ClueColor = 'red';
  if (guess.team === answer.team && guess.team !== 'Unknown') {
    teamClue = 'green';
  } else if (guess.sport === answer.sport) {
    teamClue = 'yellow';
  }

  // Decade
  let decadeClue: ClueColor = 'red';
  const decadeDiff = Math.abs(guess.decadeNum - answer.decadeNum);
  if (decadeDiff === 0) {
    decadeClue = 'green';
  } else if (decadeDiff <= 10) {
    decadeClue = 'yellow';
  }

  // Value
  let valueClue: ClueColor = 'red';
  const tierDiff = Math.abs(guess.valueTier - answer.valueTier);
  if (tierDiff === 0) {
    valueClue = 'green';
  } else if (tierDiff === 1) {
    valueClue = 'yellow';
  }

  const valueDirection: 'up' | 'down' | 'match' =
    guess.valueTier === answer.valueTier ? 'match' :
    guess.valueTier < answer.valueTier ? 'up' : 'down';

  return { player: guess, sport: sportClue, position: positionClue, team: teamClue, decade: decadeClue, value: valueClue, valueDirection };
}

/* ── component ───────────────────────────────────────────────────── */

export default function CardWordleClient() {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'daily' | 'random'>('daily');
  const [seed, setSeed] = useState(0);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [input, setInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [stats, setStats] = useState<Stats>({ played: 0, won: 0, streak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0, 0] });
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const playerMap = useMemo(() => buildPlayerMap(), []);

  // Eligible players: 3+ cards
  const eligiblePlayers = useMemo(() => {
    return Array.from(playerMap.values()).filter(p => p.cardCount >= 3);
  }, [playerMap]);

  // All player names for autocomplete
  const allPlayerNames = useMemo(() => {
    return Array.from(playerMap.keys()).sort();
  }, [playerMap]);

  // Select mystery player based on seed
  const answer = useMemo(() => {
    if (eligiblePlayers.length === 0) return null;
    const rng = seededRng(seed);
    const idx = Math.floor(rng() * eligiblePlayers.length);
    return eligiblePlayers[idx];
  }, [seed, eligiblePlayers]);

  // Guessed player names
  const guessedNames = useMemo(() => new Set(guesses.map(g => g.player.name)), [guesses]);

  // Autocomplete filtered list
  const autocompleteMatches = useMemo(() => {
    if (!input.trim()) return [];
    const q = input.toLowerCase().trim();
    return allPlayerNames
      .filter(name => name.toLowerCase().includes(q) && !guessedNames.has(name))
      .slice(0, 8);
  }, [input, allPlayerNames, guessedNames]);

  // Load state
  useEffect(() => {
    setMounted(true);
    const dailySeed = dateHash(new Date());
    setSeed(dailySeed);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStats(JSON.parse(saved));

      const state = localStorage.getItem(STATE_KEY);
      if (state) {
        const s = JSON.parse(state);
        if (s.seed === dailySeed) {
          setGuesses(s.guesses || []);
          setGameOver(s.gameOver || false);
          setWon(s.won || false);
          setRevealAnswer(s.revealAnswer || false);
        }
      }
    } catch {}
  }, []);

  // Save state
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      if (mode === 'daily') {
        localStorage.setItem(STATE_KEY, JSON.stringify({ seed, guesses, gameOver, won, revealAnswer }));
      }
    } catch {}
  }, [mounted, stats, seed, guesses, gameOver, won, mode, revealAnswer]);

  // Close autocomplete on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const submitGuess = useCallback((playerName: string) => {
    if (gameOver || !answer) return;

    const player = playerMap.get(playerName);
    if (!player) return;
    if (guessedNames.has(playerName)) return;

    const result = compareGuess(player, answer);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    setInput('');
    setShowAutocomplete(false);

    const isCorrect = playerName === answer.name;
    if (isCorrect) {
      setWon(true);
      setGameOver(true);
      setRevealAnswer(true);
      setStats(prev => {
        const newStreak = prev.streak + 1;
        const dist = [...prev.distribution];
        dist[newGuesses.length - 1]++;
        return {
          played: prev.played + 1,
          won: prev.won + 1,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          distribution: dist,
        };
      });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      setRevealAnswer(true);
      setStats(prev => {
        const dist = [...prev.distribution];
        dist[6]++;
        return {
          ...prev,
          played: prev.played + 1,
          streak: 0,
          distribution: dist,
        };
      });
    }
  }, [gameOver, answer, playerMap, guessedNames, guesses]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && autocompleteMatches.length > 0) {
      e.preventDefault();
      submitGuess(autocompleteMatches[0]);
    }
  }, [autocompleteMatches, submitGuess]);

  const startRandom = useCallback(() => {
    const newSeed = Date.now() + Math.floor(Math.random() * 99999);
    setSeed(newSeed);
    setMode('random');
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setInput('');
    setRevealAnswer(false);
    setShowAutocomplete(false);
  }, []);

  const startDaily = useCallback(() => {
    const dailySeed = dateHash(new Date());
    setSeed(dailySeed);
    setMode('daily');
    setGuesses([]);
    setGameOver(false);
    setWon(false);
    setInput('');
    setRevealAnswer(false);
    setShowAutocomplete(false);
    try { localStorage.removeItem(STATE_KEY); } catch {}
  }, []);

  const shareResults = useCallback(() => {
    if (!answer) return;
    const emojiMap: Record<ClueColor, string> = { green: '🟩', yellow: '🟨', red: '🟥' };
    const lines = guesses.map(g => {
      return [g.sport, g.position, g.team, g.decade, g.value]
        .map(c => emojiMap[c])
        .join('');
    });

    const text = `Card Wordle ${mode === 'daily' ? '(Daily)' : '(Random)'} ${won ? guesses.length : 'X'}/${MAX_GUESSES}\n\n${lines.join('\n')}\n\nhttps://cardvault-two.vercel.app/card-wordle`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [guesses, answer, mode, won]);

  const clueColorClass = (color: ClueColor): string => {
    switch (color) {
      case 'green': return 'bg-green-600';
      case 'yellow': return 'bg-yellow-600';
      case 'red': return 'bg-red-700';
    }
  };

  // Stats computations
  const winPct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution, 1);

  if (!mounted) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>;
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Card Wordle</h1>
        <p className="text-gray-400">Guess the mystery player in {MAX_GUESSES} tries with color-coded clues</p>
      </div>

      {/* Mode toggle + Stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={startDaily}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Daily
          </button>
          <button
            onClick={startRandom}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'random' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            Random
          </button>
        </div>

        <button
          onClick={() => setShowStats(prev => !prev)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          Stats
        </button>
      </div>

      {/* Guess count indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Guesses:</span>
        <div className="flex gap-1">
          {Array.from({ length: MAX_GUESSES }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < guesses.length
                  ? guesses[i]?.player.name === answer?.name
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{guesses.length}/{MAX_GUESSES}</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-1 px-1">
        {[
          { label: 'Sport', icon: '⚾🏀🏈🏒' },
          { label: 'Pos', icon: '' },
          { label: 'Team', icon: '' },
          { label: 'Era', icon: '' },
          { label: 'Value', icon: '' },
        ].map(col => (
          <div key={col.label} className="text-center text-xs text-gray-500 font-medium uppercase tracking-wide py-1">
            {col.label}
          </div>
        ))}
      </div>

      {/* Guess grid */}
      <div className="space-y-1 sm:space-y-2 mb-6">
        {guesses.map((g, i) => (
          <div key={i} className="grid grid-cols-5 gap-1 sm:gap-2">
            {/* Sport */}
            <div className={`${clueColorClass(g.sport)} rounded-lg p-2 sm:p-3 text-center transition-all duration-300`}>
              <div className="text-lg sm:text-xl">{SPORTS_ICONS[g.player.sport] || '?'}</div>
              <div className="text-[10px] sm:text-xs text-white/80 mt-0.5 truncate">{g.player.sport}</div>
            </div>
            {/* Position */}
            <div className={`${clueColorClass(g.position)} rounded-lg p-2 sm:p-3 text-center transition-all duration-300`}>
              <div className="text-sm sm:text-base font-bold text-white">{g.player.position}</div>
              <div className="text-[10px] sm:text-xs text-white/80 mt-0.5">pos</div>
            </div>
            {/* Team */}
            <div className={`${clueColorClass(g.team)} rounded-lg p-2 sm:p-3 text-center transition-all duration-300`}>
              <div className="text-[10px] sm:text-xs font-bold text-white leading-tight truncate">{g.player.team}</div>
              <div className="text-[10px] sm:text-xs text-white/80 mt-0.5">team</div>
            </div>
            {/* Decade */}
            <div className={`${clueColorClass(g.decade)} rounded-lg p-2 sm:p-3 text-center transition-all duration-300`}>
              <div className="text-sm sm:text-base font-bold text-white">{g.player.decade}</div>
              <div className="text-[10px] sm:text-xs text-white/80 mt-0.5">era</div>
            </div>
            {/* Value */}
            <div className={`${clueColorClass(g.value)} rounded-lg p-2 sm:p-3 text-center transition-all duration-300`}>
              <div className="text-sm sm:text-base font-bold text-white">
                T{g.player.valueTier}
                {g.valueDirection === 'up' && ' \u2B06\uFE0F'}
                {g.valueDirection === 'down' && ' \u2B07\uFE0F'}
              </div>
              <div className="text-[10px] sm:text-xs text-white/80 mt-0.5">{VALUE_TIER_LABELS[g.player.valueTier]}</div>
            </div>
          </div>
        ))}

        {/* Empty rows */}
        {!gameOver && Array.from({ length: MAX_GUESSES - guesses.length }).map((_, i) => (
          <div key={`empty-${i}`} className="grid grid-cols-5 gap-1 sm:gap-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center border border-gray-700/30">
                <div className="text-sm sm:text-base text-gray-600">?</div>
                <div className="text-[10px] sm:text-xs text-gray-700 mt-0.5">
                  {['sport', 'pos', 'team', 'era', 'value'][j]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Guess row label for guesses */}
      {guesses.length > 0 && (
        <div className="mb-4 space-y-1">
          {guesses.map((g, i) => (
            <div key={i} className="text-xs text-gray-400 text-center">
              <span className="text-gray-500">#{i + 1}:</span>{' '}
              <span className="text-white font-medium">{g.player.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      {!gameOver && (
        <div className="relative mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  setShowAutocomplete(true);
                }}
                onFocus={() => setShowAutocomplete(true)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a player name..."
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-amber-500 focus:outline-none text-sm sm:text-base"
                autoComplete="off"
              />

              {/* Autocomplete dropdown */}
              {showAutocomplete && autocompleteMatches.length > 0 && (
                <div
                  ref={autocompleteRef}
                  className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                >
                  {autocompleteMatches.map(name => {
                    const p = playerMap.get(name);
                    return (
                      <button
                        key={name}
                        onClick={() => {
                          submitGuess(name);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-medium">{name}</span>
                          <span className="text-xs text-gray-400">{p ? `${SPORTS_ICONS[p.sport] || ''} ${p.cardCount} cards` : ''}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Win/Lose reveal */}
      {gameOver && revealAnswer && answer && (
        <div className="text-center py-6 border-t border-gray-800 mt-2">
          {won ? (
            <div>
              <div className="text-4xl mb-3 animate-bounce">
                {guesses.length === 1 ? '🏆' : guesses.length <= 3 ? '🎉' : '✅'}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                {guesses.length === 1 ? 'Incredible!' : guesses.length <= 3 ? 'Great Job!' : 'You Got It!'}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                You found <span className="text-amber-400 font-semibold">{answer.name}</span> in {guesses.length} guess{guesses.length !== 1 ? 'es' : ''}!
              </p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">😞</div>
              <h2 className="text-xl font-bold text-white mb-1">Game Over</h2>
              <p className="text-gray-400 text-sm mb-4">
                The answer was <span className="text-amber-400 font-semibold">{answer.name}</span>
              </p>
            </div>
          )}

          {/* Answer card details */}
          <div className="max-w-md mx-auto bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xl">{SPORTS_ICONS[answer.sport] || ''}</span>
              <span className="text-lg font-bold text-white">{answer.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-900 rounded-lg p-2">
                <span className="text-gray-400">Sport: </span>
                <span className="text-white">{answer.sport}</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-2">
                <span className="text-gray-400">Position: </span>
                <span className="text-white">{answer.position}</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-2">
                <span className="text-gray-400">Team: </span>
                <span className="text-white">{answer.team}</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-2">
                <span className="text-gray-400">Era: </span>
                <span className="text-white">{answer.decade}</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-2 col-span-2">
                <span className="text-gray-400">Value Tier: </span>
                <span className="text-white">T{answer.valueTier} ({VALUE_TIER_LABELS[answer.valueTier]})</span>
                <span className="text-gray-500 ml-1">{' '}| {answer.cardCount} cards in database</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={shareResults}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              {copied ? 'Copied!' : 'Share Results'}
            </button>
            <button
              onClick={startRandom}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              Play Random
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              View Stats
            </button>
          </div>
        </div>
      )}

      {/* Stats modal */}
      {showStats && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowStats(false)}>
          <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Statistics</h3>
              <button onClick={() => setShowStats(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Played', value: stats.played },
                { label: 'Win %', value: winPct },
                { label: 'Streak', value: stats.streak },
                { label: 'Max', value: stats.maxStreak },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Guess distribution */}
            <h4 className="text-sm font-medium text-gray-300 mb-2">Guess Distribution</h4>
            <div className="space-y-1">
              {stats.distribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4 text-right">{i < 6 ? i + 1 : 'X'}</span>
                  <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                    <div
                      className={`h-full rounded text-xs text-white flex items-center justify-end pr-1 font-medium transition-all ${
                        i < 6 ? 'bg-green-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 0)}%` }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color guide */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">How to Play</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">1.</span> A mystery player is selected from the card database. Type a player name and select from the dropdown to guess.
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">2.</span> Each guess reveals 5 clues (Sport, Position, Team, Era, Value) with color-coded feedback:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 ml-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-green-600 flex-shrink-0" />
              <span>Exact match</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-yellow-600 flex-shrink-0" />
              <span>Close / same group</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-red-700 flex-shrink-0" />
              <span>No match</span>
            </div>
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">3.</span> Value column shows arrows: <span className="text-white">&#x2B06;&#xFE0F;</span> means answer is higher, <span className="text-white">&#x2B07;&#xFE0F;</span> means lower.
          </div>
          <div className="bg-gray-900/60 p-3 rounded-lg">
            <span className="text-amber-400 font-medium">4.</span> You have {MAX_GUESSES} guesses. Daily mode gives everyone the same player. Random mode lets you play unlimited games.
          </div>
        </div>

        {/* Value tiers */}
        <h3 className="text-sm font-bold text-white mt-6 mb-2">Value Tiers</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(VALUE_TIER_LABELS).map(([tier, label]) => (
            <span key={tier} className="px-3 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300">
              T{tier}: {label}
            </span>
          ))}
        </div>

        {/* Signal guide */}
        <h3 className="text-sm font-bold text-white mt-6 mb-2">Column Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="bg-gray-900/60 p-2 rounded-lg">
            <span className="text-white font-medium">Sport:</span> Green = same sport, Red = different
          </div>
          <div className="bg-gray-900/60 p-2 rounded-lg">
            <span className="text-white font-medium">Position:</span> Green = exact, Yellow = same group (e.g. both guards), Red = different
          </div>
          <div className="bg-gray-900/60 p-2 rounded-lg">
            <span className="text-white font-medium">Team:</span> Green = same team, Yellow = same sport, Red = different sport
          </div>
          <div className="bg-gray-900/60 p-2 rounded-lg">
            <span className="text-white font-medium">Era:</span> Green = same decade, Yellow = +/-1 decade, Red = far
          </div>
          <div className="bg-gray-900/60 p-2 rounded-lg sm:col-span-2">
            <span className="text-white font-medium">Value:</span> Green = same tier, Yellow = adjacent tier, Red = far. Arrows show direction.
          </div>
        </div>
      </section>

      {/* Related links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-3">More Card Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/card-groups', label: 'Card Groups', desc: 'Find 4 groups of 4 players that share something' },
            { href: '/card-hangman', label: 'Card Hangman', desc: 'Guess the mystery player name letter by letter' },
            { href: '/card-detective', label: 'Card Detective', desc: 'Daily mystery card guessing game' },
            { href: '/card-trivia', label: 'Card Trivia', desc: 'Test your sports card knowledge' },
            { href: '/games', label: 'All Games', desc: 'Browse all card games and puzzles' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="block p-3 rounded-lg bg-gray-900/60 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="text-sm font-medium text-white">{l.label}</div>
              <div className="text-xs text-gray-400">{l.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
