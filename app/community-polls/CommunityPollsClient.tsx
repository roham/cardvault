'use client';

import { useState, useEffect, useMemo } from 'react';

// --- Types ---
type PollCategory = 'Grading' | 'Investment' | 'Collecting' | 'Sport' | 'Market' | 'Lifestyle';

interface Poll {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  category: PollCategory;
  // Simulated community baseline (% for option A, 0-100)
  communityA: number;
}

// --- Poll Data ---
const POLLS: Poll[] = [
  { id: 1, question: 'Which grading company do you trust more?', optionA: 'PSA', optionB: 'BGS / Beckett', category: 'Grading', communityA: 62 },
  { id: 2, question: 'Better long-term investment?', optionA: 'Vintage cards (pre-1980)', optionB: 'Modern rookies', category: 'Investment', communityA: 58 },
  { id: 3, question: 'If you could only collect one sport?', optionA: 'Baseball', optionB: 'Basketball', category: 'Sport', communityA: 45 },
  { id: 4, question: 'How do you prefer to buy cards?', optionA: 'Buy singles online', optionB: 'Rip sealed packs', category: 'Collecting', communityA: 52 },
  { id: 5, question: 'Would you rather have...', optionA: 'One PSA 10 grail card', optionB: 'A complete set of your favorite team', category: 'Collecting', communityA: 55 },
  { id: 6, question: 'Which matters more for card value?', optionA: 'The player\'s talent', optionB: 'The card\'s scarcity', category: 'Market', communityA: 48 },
  { id: 7, question: 'Best place to sell cards?', optionA: 'eBay', optionB: 'Card shows (in person)', category: 'Market', communityA: 56 },
  { id: 8, question: 'If you found a PSA 10 rookie in your childhood collection...', optionA: 'Sell immediately at peak', optionB: 'Hold it forever — the story is worth more', category: 'Investment', communityA: 38 },
  { id: 9, question: 'More exciting to pull from a pack?', optionA: 'A numbered parallel /10', optionB: 'An on-card autograph', category: 'Collecting', communityA: 35 },
  { id: 10, question: 'Which rookie class had more hobby impact?', optionA: '2018 (Soto, Acuna, Ohtani)', optionB: '2003 (LeBron, Wade, Melo)', category: 'Sport', communityA: 42 },
  { id: 11, question: 'Do you grade your own cards?', optionA: 'Yes — I submit regularly', optionB: 'No — I prefer raw cards', category: 'Grading', communityA: 44 },
  { id: 12, question: 'Better value in 2026?', optionA: 'Football cards', optionB: 'Hockey cards', category: 'Sport', communityA: 65 },
  { id: 13, question: 'Cards as investments: responsible or reckless?', optionA: 'Smart alternative investment', optionB: 'Collect for fun, not profit', category: 'Lifestyle', communityA: 40 },
  { id: 14, question: 'What killed the 1990s card market?', optionA: 'Overproduction by card companies', optionB: 'The 1994 baseball strike', category: 'Market', communityA: 78 },
  { id: 15, question: 'Would you buy a card you suspect might be trimmed?', optionA: 'Yes, if the price is low enough', optionB: 'Never — ethics matter', category: 'Grading', communityA: 22 },
  { id: 16, question: 'Better NFL card investment strategy?', optionA: 'Buy QBs — they drive the market', optionB: 'Buy skill positions — more upside', category: 'Investment', communityA: 60 },
  { id: 17, question: 'Topps or Panini?', optionA: 'Topps (heritage, MLB license)', optionB: 'Panini (Prizm, variety)', category: 'Collecting', communityA: 53 },
  { id: 18, question: 'When a player gets traded to a contender...', optionA: 'Buy now — prices spike on playoff runs', optionB: 'Wait — the hype premium fades', category: 'Market', communityA: 47 },
  { id: 19, question: 'Is the card hobby in a bubble?', optionA: 'No — it\'s the new normal', optionB: 'Yes — a correction is coming', category: 'Market', communityA: 52 },
  { id: 20, question: 'Would you rather collect...', optionA: 'One player, every card ever made', optionB: 'Every sport, only the best cards', category: 'Lifestyle', communityA: 38 },
];

// --- Storage ---
const VOTES_KEY = 'cardvault-community-polls-votes';

// --- Daily featured poll (deterministic) ---
function getDailyPollId(): number {
  const today = new Date();
  const daysSinceEpoch = Math.floor(today.getTime() / 86400000);
  return POLLS[daysSinceEpoch % POLLS.length].id;
}

// --- Category colors ---
function categoryStyle(c: PollCategory) {
  switch (c) {
    case 'Grading': return 'bg-blue-900/40 text-blue-400 border-blue-700/30';
    case 'Investment': return 'bg-emerald-900/40 text-emerald-400 border-emerald-700/30';
    case 'Collecting': return 'bg-violet-900/40 text-violet-400 border-violet-700/30';
    case 'Sport': return 'bg-orange-900/40 text-orange-400 border-orange-700/30';
    case 'Market': return 'bg-amber-900/40 text-amber-400 border-amber-700/30';
    case 'Lifestyle': return 'bg-pink-900/40 text-pink-400 border-pink-700/30';
  }
}

export default function CommunityPollsClient() {
  const [votes, setVotes] = useState<Record<number, 'A' | 'B'>>({});
  const [filterCategory, setFilterCategory] = useState<PollCategory | 'All'>('All');

  const dailyPollId = useMemo(() => getDailyPollId(), []);
  const dailyPoll = POLLS.find(p => p.id === dailyPollId)!;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOTES_KEY);
      if (saved) setVotes(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function castVote(pollId: number, choice: 'A' | 'B') {
    if (votes[pollId]) return; // Already voted
    const updated = { ...votes, [pollId]: choice };
    setVotes(updated);
    try { localStorage.setItem(VOTES_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
  }

  function getResult(poll: Poll) {
    const userVote = votes[poll.id];
    // Base community + small adjustment if user voted
    let aPercent = poll.communityA;
    if (userVote === 'A') aPercent = Math.min(99, aPercent + 1);
    if (userVote === 'B') aPercent = Math.max(1, aPercent - 1);
    return { aPercent, bPercent: 100 - aPercent };
  }

  const categories: PollCategory[] = ['Grading', 'Investment', 'Collecting', 'Sport', 'Market', 'Lifestyle'];

  const filteredPolls = POLLS.filter(p => {
    if (filterCategory !== 'All' && p.category !== filterCategory) return false;
    return true;
  }).filter(p => p.id !== dailyPollId); // Exclude daily from list

  const totalVoted = Object.keys(votes).length;

  return (
    <div>
      {/* Daily Featured Poll */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Today&apos;s Featured Poll</span>
          <span className="text-xs text-gray-600">&middot; New poll every day</span>
        </div>
        <PollCard poll={dailyPoll} vote={votes[dailyPoll.id]} onVote={castVote} featured />
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-6">
        <div className="text-sm text-gray-400">
          <span className="text-white font-bold">{totalVoted}</span> of <span className="text-white font-bold">{POLLS.length}</span> polls voted
        </div>
        <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(totalVoted / POLLS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterCategory === 'All' ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
        >
          All ({POLLS.length - 1})
        </button>
        {categories.map(c => {
          const count = POLLS.filter(p => p.category === c && p.id !== dailyPollId).length;
          if (count === 0) return null;
          return (
            <button
              key={c}
              onClick={() => setFilterCategory(filterCategory === c ? 'All' : c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filterCategory === c ? categoryStyle(c) : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500'}`}
            >
              {c} ({count})
            </button>
          );
        })}
      </div>

      {/* All Polls Grid */}
      <div className="space-y-4">
        {filteredPolls.map(poll => (
          <PollCard key={poll.id} poll={poll} vote={votes[poll.id]} onVote={castVote} />
        ))}
      </div>

      {filteredPolls.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No polls in this category. Try a different filter.
        </div>
      )}
    </div>
  );
}

// --- PollCard Component ---
function PollCard({
  poll,
  vote,
  onVote,
  featured = false,
}: {
  poll: Poll;
  vote?: 'A' | 'B';
  onVote: (id: number, choice: 'A' | 'B') => void;
  featured?: boolean;
}) {
  const hasVoted = !!vote;

  // Base community + user influence
  let aPercent = poll.communityA;
  if (vote === 'A') aPercent = Math.min(99, aPercent + 1);
  if (vote === 'B') aPercent = Math.max(1, aPercent - 1);
  const bPercent = 100 - aPercent;

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden ${featured ? 'border-purple-700/50 ring-1 ring-purple-800/30' : 'border-gray-800'}`}>
      <div className="p-5">
        {/* Category Badge + Question */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${categoryStyle(poll.category)}`}>
            {poll.category}
          </span>
          {featured && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-purple-900/40 text-purple-400 border border-purple-700/30">
              Featured
            </span>
          )}
        </div>
        <h3 className={`text-white font-bold mb-4 ${featured ? 'text-lg' : 'text-sm'}`}>{poll.question}</h3>

        {/* Voting Buttons / Results */}
        {!hasVoted ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onVote(poll.id, 'A')}
              className="py-3 px-4 bg-gray-800 hover:bg-blue-900/40 border border-gray-700 hover:border-blue-600 rounded-xl text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {poll.optionA}
            </button>
            <button
              onClick={() => onVote(poll.id, 'B')}
              className="py-3 px-4 bg-gray-800 hover:bg-purple-900/40 border border-gray-700 hover:border-purple-600 rounded-xl text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {poll.optionB}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Option A Result */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${vote === 'A' ? 'text-blue-400' : 'text-gray-400'}`}>
                  {poll.optionA} {vote === 'A' && <span className="text-xs ml-1">&#10003; Your vote</span>}
                </span>
                <span className={`text-sm font-bold ${aPercent > bPercent ? 'text-white' : 'text-gray-500'}`}>
                  {aPercent}%
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${aPercent >= bPercent ? 'bg-blue-500' : 'bg-blue-500/40'}`}
                  style={{ width: `${aPercent}%` }}
                />
              </div>
            </div>
            {/* Option B Result */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${vote === 'B' ? 'text-purple-400' : 'text-gray-400'}`}>
                  {poll.optionB} {vote === 'B' && <span className="text-xs ml-1">&#10003; Your vote</span>}
                </span>
                <span className={`text-sm font-bold ${bPercent > aPercent ? 'text-white' : 'text-gray-500'}`}>
                  {bPercent}%
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${bPercent > aPercent ? 'bg-purple-500' : 'bg-purple-500/40'}`}
                  style={{ width: `${bPercent}%` }}
                />
              </div>
            </div>
            <div className="text-center text-xs text-gray-600 mt-2">
              {aPercent > bPercent ? poll.optionA : poll.optionB} is winning
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
