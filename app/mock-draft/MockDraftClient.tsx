'use client';

import { useState, useMemo, useCallback } from 'react';

interface Prospect {
  name: string;
  position: string;
  school: string;
  projectedPick: number;
  cardValue: number;
  spikeEstimate: number;
  tier: 'elite' | 'first-round' | 'second-round' | 'day-two' | 'sleeper';
  needs: string[];
}

interface Team {
  name: string;
  abbrev: string;
  color: string;
  pick: number;
  needs: string[];
}

interface DraftPick {
  round: number;
  pickNumber: number;
  prospect: Prospect;
  team: string;
  isUser: boolean;
}

const PROSPECTS: Prospect[] = [
  { name: 'Cam Ward', position: 'QB', school: 'Miami', projectedPick: 1, cardValue: 80, spikeEstimate: 250, tier: 'elite', needs: ['QB'] },
  { name: 'Shedeur Sanders', position: 'QB', school: 'Colorado', projectedPick: 2, cardValue: 60, spikeEstimate: 200, tier: 'elite', needs: ['QB'] },
  { name: 'Travis Hunter', position: 'WR/CB', school: 'Colorado', projectedPick: 3, cardValue: 100, spikeEstimate: 300, tier: 'elite', needs: ['WR', 'CB'] },
  { name: 'Abdul Carter', position: 'EDGE', school: 'Penn State', projectedPick: 4, cardValue: 30, spikeEstimate: 120, tier: 'elite', needs: ['EDGE'] },
  { name: 'Will Campbell', position: 'OT', school: 'LSU', projectedPick: 5, cardValue: 15, spikeEstimate: 60, tier: 'first-round', needs: ['OL'] },
  { name: 'Mason Graham', position: 'DT', school: 'Michigan', projectedPick: 6, cardValue: 20, spikeEstimate: 80, tier: 'first-round', needs: ['DL'] },
  { name: 'Tetairoa McMillan', position: 'WR', school: 'Arizona', projectedPick: 7, cardValue: 45, spikeEstimate: 180, tier: 'elite', needs: ['WR'] },
  { name: 'Mykel Williams', position: 'EDGE', school: 'Georgia', projectedPick: 8, cardValue: 25, spikeEstimate: 100, tier: 'first-round', needs: ['EDGE'] },
  { name: 'Ashton Jeanty', position: 'RB', school: 'Boise State', projectedPick: 9, cardValue: 50, spikeEstimate: 200, tier: 'elite', needs: ['RB'] },
  { name: 'Will Johnson', position: 'CB', school: 'Michigan', projectedPick: 10, cardValue: 20, spikeEstimate: 80, tier: 'first-round', needs: ['CB'] },
  { name: 'Kelvin Banks Jr.', position: 'OT', school: 'Texas', projectedPick: 11, cardValue: 12, spikeEstimate: 50, tier: 'first-round', needs: ['OL'] },
  { name: 'James Pearce Jr.', position: 'EDGE', school: 'Tennessee', projectedPick: 12, cardValue: 25, spikeEstimate: 100, tier: 'first-round', needs: ['EDGE'] },
  { name: 'Jalen Milroe', position: 'QB', school: 'Alabama', projectedPick: 13, cardValue: 40, spikeEstimate: 180, tier: 'first-round', needs: ['QB'] },
  { name: 'Tyler Warren', position: 'TE', school: 'Penn State', projectedPick: 14, cardValue: 20, spikeEstimate: 90, tier: 'first-round', needs: ['TE'] },
  { name: 'Emeka Egbuka', position: 'WR', school: 'Ohio State', projectedPick: 15, cardValue: 20, spikeEstimate: 80, tier: 'first-round', needs: ['WR'] },
  { name: 'Jalon Walker', position: 'LB', school: 'Georgia', projectedPick: 16, cardValue: 15, spikeEstimate: 60, tier: 'first-round', needs: ['LB'] },
  { name: 'Kenneth Grant', position: 'DT', school: 'Michigan', projectedPick: 17, cardValue: 15, spikeEstimate: 60, tier: 'first-round', needs: ['DL'] },
  { name: 'Nic Scourton', position: 'EDGE', school: 'Texas A&M', projectedPick: 18, cardValue: 15, spikeEstimate: 60, tier: 'first-round', needs: ['EDGE'] },
  { name: 'Colston Loveland', position: 'TE', school: 'Michigan', projectedPick: 19, cardValue: 18, spikeEstimate: 70, tier: 'first-round', needs: ['TE'] },
  { name: 'Luther Burden III', position: 'WR', school: 'Missouri', projectedPick: 20, cardValue: 25, spikeEstimate: 100, tier: 'first-round', needs: ['WR'] },
  { name: 'Dillon Gabriel', position: 'QB', school: 'Oregon', projectedPick: 21, cardValue: 30, spikeEstimate: 140, tier: 'first-round', needs: ['QB'] },
  { name: 'Trey Amos', position: 'CB', school: 'Ole Miss', projectedPick: 22, cardValue: 12, spikeEstimate: 50, tier: 'second-round', needs: ['CB'] },
  { name: 'Tyler Booker', position: 'OG', school: 'Alabama', projectedPick: 23, cardValue: 10, spikeEstimate: 40, tier: 'second-round', needs: ['OL'] },
  { name: 'Grey Zabel', position: 'OL', school: 'North Dakota State', projectedPick: 24, cardValue: 8, spikeEstimate: 35, tier: 'second-round', needs: ['OL'] },
  { name: 'Omarion Hampton', position: 'RB', school: 'North Carolina', projectedPick: 25, cardValue: 20, spikeEstimate: 80, tier: 'second-round', needs: ['RB'] },
  { name: 'Derrick Harmon', position: 'DT', school: 'Oregon', projectedPick: 26, cardValue: 12, spikeEstimate: 50, tier: 'second-round', needs: ['DL'] },
  { name: 'Shemar Stewart', position: 'EDGE', school: 'Texas A&M', projectedPick: 27, cardValue: 12, spikeEstimate: 50, tier: 'second-round', needs: ['EDGE'] },
  { name: 'Benjamin Morrison', position: 'CB', school: 'Notre Dame', projectedPick: 28, cardValue: 15, spikeEstimate: 60, tier: 'second-round', needs: ['CB'] },
  { name: 'Deone Walker', position: 'DT', school: 'Kentucky', projectedPick: 29, cardValue: 15, spikeEstimate: 60, tier: 'second-round', needs: ['DL'] },
  { name: 'Shavon Revel Jr.', position: 'CB', school: 'East Carolina', projectedPick: 30, cardValue: 10, spikeEstimate: 50, tier: 'day-two', needs: ['CB'] },
  { name: 'Josh Simmons', position: 'OT', school: 'Ohio State', projectedPick: 31, cardValue: 10, spikeEstimate: 40, tier: 'day-two', needs: ['OL'] },
  { name: 'Matthew Golden', position: 'WR', school: 'Texas', projectedPick: 32, cardValue: 15, spikeEstimate: 70, tier: 'day-two', needs: ['WR'] },
  { name: 'Tyleik Williams', position: 'DT', school: 'Ohio State', projectedPick: 33, cardValue: 10, spikeEstimate: 40, tier: 'day-two', needs: ['DL'] },
  { name: 'Nick Singleton', position: 'RB', school: 'Penn State', projectedPick: 34, cardValue: 12, spikeEstimate: 50, tier: 'day-two', needs: ['RB'] },
  { name: 'Isaiah Bond', position: 'WR', school: 'Texas', projectedPick: 35, cardValue: 12, spikeEstimate: 50, tier: 'day-two', needs: ['WR'] },
  { name: 'Donovan Ezeiruaku', position: 'EDGE', school: 'Boston College', projectedPick: 36, cardValue: 10, spikeEstimate: 45, tier: 'day-two', needs: ['EDGE'] },
  { name: 'Darien Porter', position: 'WR', school: 'Iowa State', projectedPick: 37, cardValue: 8, spikeEstimate: 35, tier: 'sleeper', needs: ['WR'] },
  { name: 'Cam Skattebo', position: 'RB', school: 'Arizona State', projectedPick: 38, cardValue: 15, spikeEstimate: 70, tier: 'sleeper', needs: ['RB'] },
  { name: 'Danny Stutsman', position: 'LB', school: 'Oklahoma', projectedPick: 39, cardValue: 8, spikeEstimate: 35, tier: 'sleeper', needs: ['LB'] },
  { name: 'Josaiah Stewart', position: 'EDGE', school: 'Michigan', projectedPick: 40, cardValue: 10, spikeEstimate: 40, tier: 'sleeper', needs: ['EDGE'] },
];

const TEAMS: Team[] = [
  { name: 'Cleveland Browns', abbrev: 'CLE', color: '#311D00', pick: 1, needs: ['QB', 'WR', 'EDGE'] },
  { name: 'New York Giants', abbrev: 'NYG', color: '#0B2265', pick: 2, needs: ['QB', 'OL', 'EDGE'] },
  { name: 'Tennessee Titans', abbrev: 'TEN', color: '#4B92DB', pick: 3, needs: ['WR', 'CB', 'EDGE'] },
  { name: 'New England Patriots', abbrev: 'NE', color: '#002244', pick: 4, needs: ['WR', 'OL', 'EDGE'] },
  { name: 'Jacksonville Jaguars', abbrev: 'JAX', color: '#006778', pick: 5, needs: ['OL', 'EDGE', 'DL'] },
  { name: 'Las Vegas Raiders', abbrev: 'LV', color: '#000000', pick: 6, needs: ['QB', 'WR', 'CB'] },
  { name: 'New York Jets', abbrev: 'NYJ', color: '#125740', pick: 7, needs: ['QB', 'WR', 'OL'] },
  { name: 'Carolina Panthers', abbrev: 'CAR', color: '#0085CA', pick: 8, needs: ['EDGE', 'OL', 'WR'] },
  { name: 'New Orleans Saints', abbrev: 'NO', color: '#D3BC8D', pick: 9, needs: ['QB', 'CB', 'OL'] },
  { name: 'Chicago Bears', abbrev: 'CHI', color: '#0B162A', pick: 10, needs: ['OL', 'CB', 'EDGE'] },
  { name: 'San Francisco 49ers', abbrev: 'SF', color: '#AA0000', pick: 11, needs: ['DL', 'CB', 'WR'] },
  { name: 'Dallas Cowboys', abbrev: 'DAL', color: '#003594', pick: 12, needs: ['WR', 'OL', 'EDGE'] },
  { name: 'Miami Dolphins', abbrev: 'MIA', color: '#008E97', pick: 13, needs: ['QB', 'OL', 'DL'] },
  { name: 'Indianapolis Colts', abbrev: 'IND', color: '#002C5F', pick: 14, needs: ['WR', 'CB', 'EDGE'] },
  { name: 'Atlanta Falcons', abbrev: 'ATL', color: '#A71930', pick: 15, needs: ['EDGE', 'OL', 'DL'] },
  { name: 'Arizona Cardinals', abbrev: 'ARI', color: '#97233F', pick: 16, needs: ['DL', 'CB', 'EDGE'] },
];

type Phase = 'setup' | 'drafting' | 'results';

function fmt(n: number): string {
  return `$${n.toFixed(0)}`;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function MockDraftClient() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [userTeamIdx, setUserTeamIdx] = useState<number>(0);
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [currentPick, setCurrentPick] = useState(1);
  const [round, setRound] = useState(1);
  const [available, setAvailable] = useState<Prospect[]>([...PROSPECTS]);
  const [showingPick, setShowingPick] = useState(false);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('cardvault-mock-draft-high') || '0');
    }
    return 0;
  });

  const userTeam = TEAMS[userTeamIdx];
  const totalRounds = 3;
  const picksPerRound = TEAMS.length;

  const userPicks = useMemo(() => picks.filter(p => p.isUser), [picks]);
  const portfolioValue = useMemo(() => userPicks.reduce((s, p) => s + p.prospect.cardValue + p.prospect.spikeEstimate, 0), [userPicks]);

  const isUserPick = useCallback(() => {
    const pickInRound = ((currentPick - 1) % picksPerRound);
    return pickInRound === userTeamIdx;
  }, [currentPick, picksPerRound, userTeamIdx]);

  const aiPick = useCallback((teamIdx: number, avail: Prospect[]): Prospect => {
    const team = TEAMS[teamIdx];
    const rand = seededRandom(currentPick * 1000 + teamIdx);

    // AI prioritizes: need match > tier > value
    const needMatches = avail.filter(p => p.needs.some(n => team.needs.includes(n)));
    const pool = needMatches.length > 0 ? needMatches : avail;

    // Sort by tier priority then projected pick
    const sorted = [...pool].sort((a, b) => {
      const tierOrder = { elite: 0, 'first-round': 1, 'second-round': 2, 'day-two': 3, sleeper: 4 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
      return a.projectedPick - b.projectedPick;
    });

    // Add some randomness — sometimes the AI reaches or takes BPA
    const reach = rand() < 0.15;
    if (reach && sorted.length > 2) {
      return sorted[Math.min(2, sorted.length - 1)];
    }
    return sorted[0];
  }, [currentPick]);

  const makePick = useCallback((prospect: Prospect) => {
    const pickInRound = ((currentPick - 1) % picksPerRound);
    const team = TEAMS[pickInRound];

    const newPick: DraftPick = {
      round,
      pickNumber: currentPick,
      prospect,
      team: team.name,
      isUser: pickInRound === userTeamIdx,
    };

    setPicks(prev => [...prev, newPick]);
    setAvailable(prev => prev.filter(p => p.name !== prospect.name));
    setShowingPick(true);

    setTimeout(() => {
      setShowingPick(false);
      const nextPick = currentPick + 1;

      if (nextPick > totalRounds * picksPerRound) {
        // Draft is over
        setPhase('results');
        const finalValue = [...picks, newPick].filter(p => p.isUser).reduce((s, p) => s + p.prospect.cardValue + p.prospect.spikeEstimate, 0);
        if (finalValue > highScore) {
          setHighScore(finalValue);
          if (typeof window !== 'undefined') {
            localStorage.setItem('cardvault-mock-draft-high', finalValue.toString());
          }
        }
        return;
      }

      if (nextPick > round * picksPerRound) {
        setRound(r => r + 1);
      }
      setCurrentPick(nextPick);
    }, 1200);
  }, [currentPick, round, userTeamIdx, picksPerRound, totalRounds, picks, highScore]);

  // Auto-pick for AI teams
  const advanceDraft = useCallback(() => {
    if (isUserPick() || available.length === 0) return;

    const pickInRound = ((currentPick - 1) % picksPerRound);
    const pick = aiPick(pickInRound, available);
    makePick(pick);
  }, [isUserPick, currentPick, picksPerRound, aiPick, available, makePick]);

  const startDraft = useCallback(() => {
    setPicks([]);
    setCurrentPick(1);
    setRound(1);
    setAvailable([...PROSPECTS]);
    setPhase('drafting');
  }, []);

  const resetDraft = useCallback(() => {
    setPhase('setup');
    setPicks([]);
    setCurrentPick(1);
    setRound(1);
    setAvailable([...PROSPECTS]);
  }, []);

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Choose Your Team</h3>
          <p className="text-sm text-gray-400 mb-4">
            Pick an NFL team to control in the 2025 Draft. You draft in 3 rounds against AI GMs.
            Build the most valuable rookie card portfolio.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEAMS.map((team, i) => (
              <button
                key={team.abbrev}
                onClick={() => setUserTeamIdx(i)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  userTeamIdx === i
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                }`}
              >
                <div className="text-sm font-bold text-white">{team.abbrev}</div>
                <div className="text-xs text-gray-400">{team.name}</div>
                <div className="text-xs text-gray-600 mt-1">Pick #{team.pick}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {team.needs.map(n => (
                    <span key={n} className="text-[10px] px-1.5 py-0.5 bg-gray-800 rounded text-gray-500">{n}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <span className="text-2xl">1.</span>
              <p className="mt-1"><strong className="text-white">Draft 3 Rounds</strong> — Pick prospects when your team is on the clock. AI GMs draft based on team needs and player value.</p>
            </div>
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <span className="text-2xl">2.</span>
              <p className="mt-1"><strong className="text-white">Build Card Value</strong> — Each prospect has a pre-draft card value and estimated post-draft spike. Your score is total portfolio value.</p>
            </div>
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
              <span className="text-2xl">3.</span>
              <p className="mt-1"><strong className="text-white">Beat the AI</strong> — Strategy matters: QBs and skill players spike more, but they go early. Find value where others don&apos;t look.</p>
            </div>
          </div>
        </div>

        {highScore > 0 && (
          <div className="text-center text-sm text-gray-500">
            Your high score: <span className="text-emerald-400 font-bold">{fmt(highScore)}</span> portfolio value
          </div>
        )}

        <div className="text-center">
          <button
            onClick={startDraft}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg transition-colors"
          >
            Start the Draft
          </button>
        </div>
      </div>
    );
  }

  // Drafting phase
  if (phase === 'drafting') {
    const pickInRound = ((currentPick - 1) % picksPerRound);
    const currentTeam = TEAMS[pickInRound];
    const isUser = pickInRound === userTeamIdx;

    return (
      <div className="space-y-6">
        {/* Draft Status Bar */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Round {round} &middot; Pick {currentPick} of {totalRounds * picksPerRound}</span>
            <span className="text-sm text-emerald-400 font-bold">Portfolio: {fmt(portfolioValue)}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(currentPick / (totalRounds * picksPerRound)) * 100}%` }}
            />
          </div>
        </div>

        {/* On the Clock */}
        <div className={`border rounded-xl p-6 text-center ${
          isUser ? 'bg-emerald-900/30 border-emerald-700' : 'bg-gray-800/50 border-gray-700'
        }`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">On the Clock</div>
          <div className="text-2xl font-bold text-white mb-1">{currentTeam.name}</div>
          <div className="text-sm text-gray-400">Round {round}, Pick #{currentPick}</div>
          {isUser ? (
            <div className="mt-2 text-emerald-400 font-bold text-sm animate-pulse">YOUR PICK!</div>
          ) : (
            <div className="mt-2">
              {showingPick ? (
                <div className="text-yellow-400 font-bold text-sm">Selecting...</div>
              ) : (
                <button
                  onClick={advanceDraft}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  Simulate Pick
                </button>
              )}
            </div>
          )}
        </div>

        {/* Available Prospects (only show when it's user's pick) */}
        {isUser && !showingPick && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-4">Available Prospects</h3>
            <div className="space-y-2">
              {available.slice(0, 15).map(prospect => {
                const needMatch = prospect.needs.some(n => userTeam.needs.includes(n));
                return (
                  <button
                    key={prospect.name}
                    onClick={() => makePick(prospect)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:bg-gray-700/50 ${
                      needMatch ? 'border-emerald-700/50 bg-emerald-900/10' : 'border-gray-700/50 bg-gray-900/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{prospect.name}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{prospect.position}</span>
                        <span className="text-xs text-gray-600">{prospect.school}</span>
                        {needMatch && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">NEED</span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-500">
                        <span>Pre-draft: {fmt(prospect.cardValue)}</span>
                        <span className="text-emerald-400">Post-draft spike: +{fmt(prospect.spikeEstimate)}</span>
                        <span className={`${
                          prospect.tier === 'elite' ? 'text-yellow-400' :
                          prospect.tier === 'first-round' ? 'text-blue-400' :
                          prospect.tier === 'second-round' ? 'text-purple-400' :
                          'text-gray-500'
                        }`}>
                          {prospect.tier}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{fmt(prospect.cardValue + prospect.spikeEstimate)}</div>
                      <div className="text-[10px] text-gray-600">total value</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Last Pick Announcement */}
        {showingPick && picks.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 text-center animate-pulse">
            <div className="text-xs text-yellow-500 uppercase mb-1">Pick #{picks[picks.length - 1].pickNumber}</div>
            <div className="text-lg font-bold text-white">{picks[picks.length - 1].prospect.name}</div>
            <div className="text-sm text-gray-400">{picks[picks.length - 1].prospect.position} &middot; {picks[picks.length - 1].prospect.school}</div>
            <div className="text-sm text-gray-500 mt-1">Selected by {picks[picks.length - 1].team}</div>
          </div>
        )}

        {/* Your Picks So Far */}
        {userPicks.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-3">Your Picks</h3>
            <div className="space-y-2">
              {userPicks.map(p => (
                <div key={p.pickNumber} className="flex items-center gap-3 p-2 bg-gray-900/50 rounded-lg text-sm">
                  <span className="text-gray-600">R{p.round} #{p.pickNumber}</span>
                  <span className="text-white font-medium">{p.prospect.name}</span>
                  <span className="text-gray-500">{p.prospect.position}</span>
                  <span className="ml-auto text-emerald-400 font-bold">{fmt(p.prospect.cardValue + p.prospect.spikeEstimate)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results phase
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Draft Complete</div>
        <h3 className="text-2xl font-bold text-white mb-1">{userTeam.name}</h3>
        <div className="text-4xl font-bold text-emerald-400 mb-2">{fmt(portfolioValue)}</div>
        <div className="text-sm text-gray-400">Total Rookie Card Portfolio Value</div>
        {portfolioValue >= highScore && portfolioValue > 0 && (
          <div className="mt-2 text-yellow-400 font-bold text-sm">NEW HIGH SCORE!</div>
        )}
      </div>

      {/* Your Picks Detail */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Your Draft Class</h3>
        <div className="space-y-3">
          {userPicks.map(p => (
            <div key={p.pickNumber} className="flex items-center gap-4 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg">
              <div className="text-center min-w-[50px]">
                <div className="text-xs text-gray-600">Round {p.round}</div>
                <div className="text-lg font-bold text-white">#{p.pickNumber}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{p.prospect.name}</div>
                <div className="text-xs text-gray-400">{p.prospect.position} &middot; {p.prospect.school}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Pre: {fmt(p.prospect.cardValue)}</div>
                <div className="text-xs text-emerald-400">+{fmt(p.prospect.spikeEstimate)} spike</div>
                <div className="text-sm font-bold text-white">{fmt(p.prospect.cardValue + p.prospect.spikeEstimate)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Draft Board */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <h3 className="text-lg font-bold text-white mb-4">Full Draft Board</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-700">
                <th className="pb-2 font-medium">Pick</th>
                <th className="pb-2 font-medium">Team</th>
                <th className="pb-2 font-medium">Player</th>
                <th className="pb-2 font-medium">Pos</th>
                <th className="pb-2 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {picks.map(p => (
                <tr
                  key={p.pickNumber}
                  className={`border-b border-gray-800 ${p.isUser ? 'bg-emerald-900/20' : ''}`}
                >
                  <td className="py-2 text-gray-400">R{p.round} #{p.pickNumber}</td>
                  <td className="py-2 text-gray-300">{p.team.split(' ').pop()}</td>
                  <td className={`py-2 font-medium ${p.isUser ? 'text-emerald-400' : 'text-white'}`}>{p.prospect.name}</td>
                  <td className="py-2 text-gray-400">{p.prospect.position}</td>
                  <td className="py-2 text-right text-gray-300">{fmt(p.prospect.cardValue + p.prospect.spikeEstimate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={resetDraft}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
        >
          Draft Again
        </button>
        <button
          onClick={() => {
            const text = `I drafted a ${fmt(portfolioValue)} rookie card portfolio in CardVault's Mock Draft Simulator! My picks:\n${userPicks.map(p => `R${p.round} #${p.pickNumber}: ${p.prospect.name} (${p.prospect.position}) - ${fmt(p.prospect.cardValue + p.prospect.spikeEstimate)}`).join('\n')}\n\nTry it: cardvault-two.vercel.app/mock-draft`;
            navigator.clipboard?.writeText(text);
          }}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
        >
          Copy Results
        </button>
      </div>
    </div>
  );
}
