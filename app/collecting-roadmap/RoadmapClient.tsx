'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  toolLink?: string;
  toolLabel?: string;
}

interface Stage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  timeEstimate: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  milestones: Milestone[];
}

const STAGES: Stage[] = [
  {
    id: 'curious', number: 1, title: 'Curious', subtitle: 'Discover the hobby',
    timeEstimate: '~1 week', color: 'text-emerald-400', bgColor: 'bg-emerald-950/40', borderColor: 'border-emerald-800/40', icon: '🌱',
    milestones: [
      { id: 'c1', title: 'Learn what makes a card valuable', description: 'Understand the 5 factors: player, year, condition, scarcity, and demand.' },
      { id: 'c2', title: 'Understand PSA vs BGS vs CGC vs SGC', description: 'Know the 4 major grading companies and what their grades mean.', toolLink: '/tools/grading-roi', toolLabel: 'Grading ROI Calculator' },
      { id: 'c3', title: 'Learn the grading scale (1-10)', description: 'PSA 10 Gem Mint is the holy grail. PSA 9 Mint is the sweet spot for value.' },
      { id: 'c4', title: 'Browse card prices on eBay', description: 'Search "PSA 10 [player name]" on eBay sold listings to see real market prices.' },
      { id: 'c5', title: 'Take the Collector Personality Quiz', description: 'Discover which type of collector you are — flipper, investor, completionist, or casual.', toolLink: '/tools/quiz', toolLabel: 'Collector Quiz' },
    ],
  },
  {
    id: 'beginner', number: 2, title: 'Beginner', subtitle: 'Make your first moves',
    timeEstimate: '2-4 weeks', color: 'text-blue-400', bgColor: 'bg-blue-950/40', borderColor: 'border-blue-800/40', icon: '📦',
    milestones: [
      { id: 'b1', title: 'Buy your first card', description: 'Start with a $5-20 raw single of a player you like. eBay or your local card shop.' },
      { id: 'b2', title: 'Open your first pack', description: 'Experience the thrill. Try a hobby pack from a current year product.', toolLink: '/tools/pack-simulator', toolLabel: 'Pack Simulator' },
      { id: 'b3', title: 'Learn proper card storage', description: 'Penny sleeves + toploaders for raw cards. Never touch the surface. Store upright.' },
      { id: 'b4', title: 'Look up a card\'s value', description: 'Use eBay sold listings or CardVault to estimate what your card is worth.', toolLink: '/search', toolLabel: 'Card Search' },
      { id: 'b5', title: 'Join a card collecting community', description: 'Reddit r/sportscards, Facebook groups, Discord servers, or your local card shop.' },
      { id: 'b6', title: 'Set a monthly collecting budget', description: 'Decide what you can afford. $25-50/month is a solid starting point.' },
    ],
  },
  {
    id: 'intermediate', number: 3, title: 'Intermediate', subtitle: 'Build your strategy',
    timeEstimate: '1-3 months', color: 'text-purple-400', bgColor: 'bg-purple-950/40', borderColor: 'border-purple-800/40', icon: '📊',
    milestones: [
      { id: 'i1', title: 'Define your collecting focus', description: 'PC (personal collection) a player? Chase rookies? Complete sets? Pick your lane.' },
      { id: 'i2', title: 'Understand market seasonality', description: 'Prices spike during seasons, dip in offseasons. Buy low, sell high.', toolLink: '/tools/flip-window', toolLabel: 'Flip Window Calculator' },
      { id: 'i3', title: 'Submit your first card for grading', description: 'Pick your best card, choose PSA or SGC for starters, and submit.', toolLink: '/vault/submission-planner', toolLabel: 'Submission Planner' },
      { id: 'i4', title: 'Track your collection value', description: 'Know what you own and what it\'s worth. Update quarterly.', toolLink: '/vault/value-tracker', toolLabel: 'Value Tracker' },
      { id: 'i5', title: 'Make your first profitable sale', description: 'Sell a card for more than you paid. Even $5 profit counts as a win.' },
      { id: 'i6', title: 'Attend a card show or break', description: 'Experience the in-person hobby. Card shows are where deals happen.' },
    ],
  },
  {
    id: 'advanced', number: 4, title: 'Advanced', subtitle: 'Optimize your approach',
    timeEstimate: '3-6 months', color: 'text-amber-400', bgColor: 'bg-amber-950/40', borderColor: 'border-amber-800/40', icon: '🎯',
    milestones: [
      { id: 'a1', title: 'Build a diversified portfolio', description: 'Spread across sports, eras, and value tiers. Don\'t put everything in one player.', toolLink: '/tools/portfolio-rebalancer', toolLabel: 'Portfolio Rebalancer' },
      { id: 'a2', title: 'Master centering and condition assessment', description: 'Train your eye to spot 60/40 vs 55/45 centering, surface scratches, and print defects.', toolLink: '/tools/centering-checker', toolLabel: 'Centering Checker' },
      { id: 'a3', title: 'Calculate ROI before every grading submission', description: 'Never grade blind. Always run the numbers first.', toolLink: '/tools/grading-roi', toolLabel: 'Grading ROI Calculator' },
      { id: 'a4', title: 'Use multiple selling platforms', description: 'eBay for reach, COMC for convenience, Facebook groups for zero fees. Know when to use each.', toolLink: '/vault/bulk-sale', toolLabel: 'Bulk Sale Calculator' },
      { id: 'a5', title: 'Track P&L on all transactions', description: 'Know your true profit after fees, shipping, and grading costs.' },
    ],
  },
  {
    id: 'expert', number: 5, title: 'Expert', subtitle: 'Read the market',
    timeEstimate: '6-12 months', color: 'text-orange-400', bgColor: 'bg-orange-950/40', borderColor: 'border-orange-800/40', icon: '🔥',
    milestones: [
      { id: 'e1', title: 'Predict price movements from events', description: 'Draft picks, trades, injuries, awards — know how each moves card values.', toolLink: '/market-reactions', toolLabel: 'Market Reactions' },
      { id: 'e2', title: 'Identify undervalued cards before breakouts', description: 'Spot the prospect before the masses. Buy pre-hype, sell into the spike.' },
      { id: 'e3', title: 'Build relationships with dealers', description: 'Regular dealers give better prices. Become a known buyer at your local shop and shows.' },
      { id: 'e4', title: 'Manage a collection worth $5,000+', description: 'Insurance, proper storage, estate planning — protect what you\'ve built.', toolLink: '/vault/insurance', toolLabel: 'Insurance Estimator' },
      { id: 'e5', title: 'Mentor a new collector', description: 'Share what you\'ve learned. The hobby grows when experienced collectors help beginners.' },
    ],
  },
  {
    id: 'master', number: 6, title: 'Master', subtitle: 'Shape the hobby',
    timeEstimate: '1+ years', color: 'text-red-400', bgColor: 'bg-red-950/40', borderColor: 'border-red-800/40', icon: '👑',
    milestones: [
      { id: 'm1', title: 'Complete a major set', description: 'Full base set + inserts of a flagship product. The ultimate completionist achievement.' },
      { id: 'm2', title: 'Win an auction for a grail card', description: 'Land the card you\'ve been chasing. Heritage, Goldin, or eBay — make it happen.' },
      { id: 'm3', title: 'Build a themed collection with a story', description: 'Every card connects. "All-Time Team", "Rookie Class 2024", or "Cards I Watched Live".' },
      { id: 'm4', title: 'Achieve a lifetime positive ROI', description: 'Your total collection value exceeds your total investment. You\'re profitable.' },
    ],
  },
];

const STORAGE_KEY = 'cardvault_roadmap_progress';

function loadProgress(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveProgress(completed: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed])); } catch {}
}

export default function RoadmapClient() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expandedStage, setExpandedStage] = useState<string | null>('curious');
  const [copied, setCopied] = useState(false);

  useEffect(() => { setCompleted(loadProgress()); }, []);

  const toggle = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveProgress(next);
      return next;
    });
  }, []);

  const totalMilestones = STAGES.reduce((s, st) => s + st.milestones.length, 0);
  const totalCompleted = completed.size;
  const overallPct = totalMilestones > 0 ? Math.round((totalCompleted / totalMilestones) * 100) : 0;

  const stageProgress = useMemo(() => {
    return STAGES.map(s => {
      const done = s.milestones.filter(m => completed.has(m.id)).length;
      const total = s.milestones.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return { ...s, done, total, pct };
    });
  }, [completed]);

  const currentStage = useMemo(() => {
    for (let i = stageProgress.length - 1; i >= 0; i--) {
      if (stageProgress[i].pct === 100) {
        return i < stageProgress.length - 1 ? stageProgress[i + 1] : stageProgress[i];
      }
    }
    return stageProgress[0];
  }, [stageProgress]);

  const shareProgress = useCallback(() => {
    const lines = ['CARD COLLECTING ROADMAP PROGRESS', '================================', ''];
    stageProgress.forEach(s => {
      const bar = s.pct === 100 ? '[COMPLETE]' : `[${s.done}/${s.total}]`;
      lines.push(`Stage ${s.number}: ${s.title} ${bar} ${s.pct}%`);
    });
    lines.push('', `Overall: ${totalCompleted}/${totalMilestones} milestones (${overallPct}%)`);
    lines.push('', 'Track your progress at CardVault.com/collecting-roadmap');

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [stageProgress, totalCompleted, totalMilestones, overallPct]);

  const resetProgress = useCallback(() => {
    setCompleted(new Set());
    saveProgress(new Set());
  }, []);

  return (
    <div>
      {/* Overall progress bar */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-white font-semibold">Your Progress</span>
            <span className="text-gray-500 text-sm ml-2">Stage {currentStage.number}: {currentStage.title}</span>
          </div>
          <span className="text-indigo-400 font-bold text-lg">{overallPct}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
          <div className="bg-gradient-to-r from-emerald-500 via-blue-500 via-purple-500 via-amber-500 to-red-500 h-3 rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{totalCompleted} of {totalMilestones} milestones</span>
          <div className="flex gap-2">
            <button onClick={shareProgress} className="text-indigo-400 hover:text-indigo-300 transition-colors">
              {copied ? 'Copied!' : 'Share Progress'}
            </button>
            {totalCompleted > 0 && (
              <button onClick={resetProgress} className="text-red-400/60 hover:text-red-400 transition-colors">Reset</button>
            )}
          </div>
        </div>
      </div>

      {/* Stage progress mini-bar */}
      <div className="grid grid-cols-6 gap-1.5 mb-8">
        {stageProgress.map(s => (
          <button key={s.id} onClick={() => setExpandedStage(expandedStage === s.id ? null : s.id)} className={`rounded-lg p-2 text-center transition-colors ${expandedStage === s.id ? `${s.bgColor} ${s.borderColor} border` : 'bg-gray-900/60 border border-gray-800 hover:border-gray-700'}`}>
            <div className="text-lg">{s.icon}</div>
            <div className={`text-xs font-medium ${expandedStage === s.id ? s.color : 'text-gray-400'}`}>{s.title}</div>
            <div className="text-[10px] text-gray-500">{s.pct}%</div>
          </button>
        ))}
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {stageProgress.map(stage => {
          const isExpanded = expandedStage === stage.id;
          return (
            <div key={stage.id} className={`${stage.bgColor} border ${stage.borderColor} rounded-lg overflow-hidden transition-all`}>
              <button onClick={() => setExpandedStage(isExpanded ? null : stage.id)} className="w-full px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stage.icon}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${stage.color}`}>Stage {stage.number}: {stage.title}</span>
                      {stage.pct === 100 && <span className="text-emerald-400 text-xs bg-emerald-950/50 border border-emerald-800/40 px-1.5 py-0.5 rounded">COMPLETE</span>}
                    </div>
                    <span className="text-gray-500 text-sm">{stage.subtitle} &middot; {stage.timeEstimate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">{stage.done}/{stage.total}</span>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-2">
                  {/* Stage progress bar */}
                  <div className="w-full bg-gray-800/50 rounded-full h-1.5 mb-3">
                    <div className={`h-1.5 rounded-full transition-all duration-300`} style={{ width: `${stage.pct}%`, background: stage.color.includes('emerald') ? '#34d399' : stage.color.includes('blue') ? '#60a5fa' : stage.color.includes('purple') ? '#a78bfa' : stage.color.includes('amber') ? '#fbbf24' : stage.color.includes('orange') ? '#fb923c' : '#f87171' }} />
                  </div>

                  {stage.milestones.map(m => {
                    const isDone = completed.has(m.id);
                    return (
                      <div key={m.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${isDone ? 'bg-gray-800/30' : 'bg-gray-900/40'}`}>
                        <button onClick={() => toggle(m.id)} className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-600 border-emerald-600' : 'border-gray-600 hover:border-gray-400'}`}>
                          {isDone && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isDone ? 'text-gray-500 line-through' : 'text-white'}`}>{m.title}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{m.description}</div>
                          {m.toolLink && (
                            <a href={m.toolLink} className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs mt-1 transition-colors">
                              {m.toolLabel} <span className="text-[10px]">&rarr;</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-gray-900/60 border border-gray-800 rounded-lg p-5">
        <h3 className="text-white font-semibold mb-3">Tips for Your Journey</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { tip: 'Start with what you love', desc: 'Collect players and teams you actually care about. Passion sustains the hobby.' },
            { tip: 'Set a budget and stick to it', desc: 'Decide monthly spend before you start shopping. Avoid FOMO purchases.' },
            { tip: 'Buy the card, not the hype', desc: 'Social media creates artificial urgency. Real value builds slowly.' },
            { tip: 'Condition is everything', desc: 'A PSA 10 can be worth 5x a PSA 9. Learn to spot quality before you buy.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-800/30 rounded-lg p-3">
              <div className="text-white text-sm font-medium">{t.tip}</div>
              <div className="text-gray-500 text-xs mt-1">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
