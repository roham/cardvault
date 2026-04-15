'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────
type GoalTemplate =
  | 'set-completion'
  | 'value-target'
  | 'hof-rookies'
  | 'psa-10-club'
  | 'every-team'
  | 'budget-master'
  | 'rainbow-chase'
  | 'card-count'
  | 'custom';

interface Goal {
  id: string;
  template: GoalTemplate;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  icon: string;
  color: string;
  createdAt: string;
  completedAt: string | null;
  milestones: Milestone[];
}

interface Milestone {
  label: string;
  at: number; // percentage 0-100
  reached: boolean;
}

// ── Templates ──────────────────────────────────────────────────────────────
const TEMPLATES: {
  id: GoalTemplate;
  title: string;
  description: string;
  icon: string;
  color: string;
  defaultTarget: number;
  unit: string;
  milestones: { label: string; at: number }[];
}[] = [
  {
    id: 'set-completion',
    title: 'Complete a Set',
    description: 'Track cards toward completing a full base set',
    icon: '\u2611',
    color: 'blue',
    defaultTarget: 300,
    unit: 'cards',
    milestones: [
      { label: '25% done', at: 25 },
      { label: 'Halfway there', at: 50 },
      { label: '75% done', at: 75 },
      { label: 'Set complete!', at: 100 },
    ],
  },
  {
    id: 'value-target',
    title: 'Reach a Value Target',
    description: 'Hit a collection value milestone',
    icon: '\uD83D\uDCB0',
    color: 'emerald',
    defaultTarget: 10000,
    unit: 'dollars',
    milestones: [
      { label: '$2,500 milestone', at: 25 },
      { label: '$5,000 halfway', at: 50 },
      { label: '$7,500 almost there', at: 75 },
      { label: 'Target reached!', at: 100 },
    ],
  },
  {
    id: 'hof-rookies',
    title: 'HOF Rookie Collection',
    description: 'Collect Hall of Fame rookie cards from your sport',
    icon: '\uD83C\uDFC6',
    color: 'amber',
    defaultTarget: 25,
    unit: 'rookies',
    milestones: [
      { label: '5 HOF rookies', at: 20 },
      { label: '10 HOF rookies', at: 40 },
      { label: '20 HOF rookies', at: 80 },
      { label: 'Collection complete!', at: 100 },
    ],
  },
  {
    id: 'psa-10-club',
    title: 'PSA 10 Club',
    description: 'Accumulate gem mint graded cards',
    icon: '\uD83D\uDC8E',
    color: 'purple',
    defaultTarget: 10,
    unit: 'slabs',
    milestones: [
      { label: 'First PSA 10', at: 10 },
      { label: '5 gem mints', at: 50 },
      { label: 'Almost there', at: 90 },
      { label: 'Club achieved!', at: 100 },
    ],
  },
  {
    id: 'every-team',
    title: 'One From Every Team',
    description: 'Own at least one card from every team in a league',
    icon: '\uD83C\uDFDF\uFE0F',
    color: 'cyan',
    defaultTarget: 30,
    unit: 'teams',
    milestones: [
      { label: '10 teams covered', at: 33 },
      { label: '20 teams covered', at: 67 },
      { label: 'All teams!', at: 100 },
    ],
  },
  {
    id: 'budget-master',
    title: 'Budget Master',
    description: 'Stay under a monthly spending limit for consecutive months',
    icon: '\uD83D\uDCCA',
    color: 'rose',
    defaultTarget: 6,
    unit: 'months',
    milestones: [
      { label: '1 month on budget', at: 17 },
      { label: '3 months streak', at: 50 },
      { label: '5 months strong', at: 83 },
      { label: 'Budget master!', at: 100 },
    ],
  },
  {
    id: 'rainbow-chase',
    title: 'Rainbow Chase',
    description: 'Collect every parallel of a single card',
    icon: '\uD83C\uDF08',
    color: 'pink',
    defaultTarget: 12,
    unit: 'parallels',
    milestones: [
      { label: 'Base + 2 colors', at: 25 },
      { label: 'Halfway rainbow', at: 50 },
      { label: 'Almost complete', at: 83 },
      { label: 'Rainbow complete!', at: 100 },
    ],
  },
  {
    id: 'card-count',
    title: 'Card Count Milestone',
    description: 'Reach a total number of cards in your collection',
    icon: '\uD83D\uDCE6',
    color: 'orange',
    defaultTarget: 500,
    unit: 'cards',
    milestones: [
      { label: '100 cards', at: 20 },
      { label: '250 cards', at: 50 },
      { label: '400 cards', at: 80 },
      { label: 'Milestone hit!', at: 100 },
    ],
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; fill: string; light: string }> = {
  blue: { bg: 'bg-blue-950/40', border: 'border-blue-800/40', text: 'text-blue-400', fill: 'bg-blue-500', light: 'bg-blue-950/20' },
  emerald: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/40', text: 'text-emerald-400', fill: 'bg-emerald-500', light: 'bg-emerald-950/20' },
  amber: { bg: 'bg-amber-950/40', border: 'border-amber-800/40', text: 'text-amber-400', fill: 'bg-amber-500', light: 'bg-amber-950/20' },
  purple: { bg: 'bg-purple-950/40', border: 'border-purple-800/40', text: 'text-purple-400', fill: 'bg-purple-500', light: 'bg-purple-950/20' },
  cyan: { bg: 'bg-cyan-950/40', border: 'border-cyan-800/40', text: 'text-cyan-400', fill: 'bg-cyan-500', light: 'bg-cyan-950/20' },
  rose: { bg: 'bg-rose-950/40', border: 'border-rose-800/40', text: 'text-rose-400', fill: 'bg-rose-500', light: 'bg-rose-950/20' },
  pink: { bg: 'bg-pink-950/40', border: 'border-pink-800/40', text: 'text-pink-400', fill: 'bg-pink-500', light: 'bg-pink-950/20' },
  orange: { bg: 'bg-orange-950/40', border: 'border-orange-800/40', text: 'text-orange-400', fill: 'bg-orange-500', light: 'bg-orange-950/20' },
};

const STORAGE_KEY = 'cardvault-goals';

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function GoalsClient() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<'dashboard' | 'create' | 'completed'>('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState<string | null>(null);

  // Create form state
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [customUnit, setCustomUnit] = useState('cards');
  const [targetOverride, setTargetOverride] = useState('');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setGoals(JSON.parse(saved));
    } catch { /* empty */ }
  }, []);

  // Save to localStorage
  const persist = useCallback((next: Goal[]) => {
    setGoals(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* empty */ }
  }, []);

  // Active / completed splits
  const activeGoals = goals.filter(g => !g.completedAt);
  const completedGoals = goals.filter(g => g.completedAt);

  // ── Create Goal ──────────────────────────────────────────────────────────
  function handleCreate() {
    if (!selectedTemplate) return;

    let goal: Goal;

    if (selectedTemplate === 'custom') {
      if (!customTitle.trim() || !customTarget) return;
      const target = parseInt(customTarget, 10);
      if (isNaN(target) || target <= 0) return;
      goal = {
        id: genId(),
        template: 'custom',
        title: customTitle.trim(),
        description: customDescription.trim() || 'Custom collecting goal',
        target,
        current: 0,
        unit: customUnit,
        icon: '\u2B50',
        color: 'emerald',
        createdAt: new Date().toISOString(),
        completedAt: null,
        milestones: [
          { label: '25% done', at: 25, reached: false },
          { label: 'Halfway', at: 50, reached: false },
          { label: '75% done', at: 75, reached: false },
          { label: 'Goal complete!', at: 100, reached: false },
        ],
      };
    } else {
      const tmpl = TEMPLATES.find(t => t.id === selectedTemplate)!;
      const target = targetOverride ? parseInt(targetOverride, 10) : tmpl.defaultTarget;
      if (isNaN(target) || target <= 0) return;
      goal = {
        id: genId(),
        template: tmpl.id,
        title: tmpl.title,
        description: tmpl.description,
        target,
        current: 0,
        unit: tmpl.unit,
        icon: tmpl.icon,
        color: tmpl.color,
        createdAt: new Date().toISOString(),
        completedAt: null,
        milestones: tmpl.milestones.map(m => ({ ...m, reached: false })),
      };
    }

    persist([...goals, goal]);
    resetForm();
    setView('dashboard');
  }

  function resetForm() {
    setSelectedTemplate(null);
    setCustomTitle('');
    setCustomDescription('');
    setCustomTarget('');
    setCustomUnit('cards');
    setTargetOverride('');
  }

  // ── Update Progress ──────────────────────────────────────────────────────
  function updateProgress(id: string, newCurrent: number) {
    const updated = goals.map(g => {
      if (g.id !== id) return g;
      const clamped = Math.max(0, Math.min(newCurrent, g.target));
      const pct = (clamped / g.target) * 100;
      const milestones = g.milestones.map(m => ({
        ...m,
        reached: pct >= m.at,
      }));
      const justCompleted = clamped >= g.target && !g.completedAt;
      return {
        ...g,
        current: clamped,
        milestones,
        completedAt: justCompleted ? new Date().toISOString() : g.completedAt,
      };
    });

    const goal = updated.find(g => g.id === id);
    if (goal && goal.completedAt && !goals.find(g => g.id === id)?.completedAt) {
      setCelebrating(id);
      setTimeout(() => setCelebrating(null), 3000);
    }

    persist(updated);
    setEditingId(null);
  }

  // ── Delete Goal ──────────────────────────────────────────────────────────
  function deleteGoal(id: string) {
    persist(goals.filter(g => g.id !== id));
  }

  // ── Export / Import ──────────────────────────────────────────────────────
  function exportGoals() {
    const blob = new Blob([JSON.stringify(goals, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardvault-goals-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importGoals(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        if (Array.isArray(imported)) persist(imported);
      } catch { /* invalid json */ }
    };
    reader.readAsText(file);
  }

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalGoals = goals.length;
  const completedCount = completedGoals.length;
  const avgProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / activeGoals.length)
    : 0;
  const streak = completedGoals.length; // simplified: total completed

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{activeGoals.length}</div>
          <div className="text-xs text-zinc-500">Active Goals</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{completedCount}</div>
          <div className="text-xs text-zinc-500">Completed</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{avgProgress}%</div>
          <div className="text-xs text-zinc-500">Avg Progress</div>
        </div>
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-400">{totalGoals}</div>
          <div className="text-xs text-zinc-500">Total Goals</div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setView('dashboard')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          Dashboard ({activeGoals.length})
        </button>
        <button
          onClick={() => { setView('create'); resetForm(); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'create' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          + New Goal
        </button>
        <button
          onClick={() => setView('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'completed' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          Completed ({completedCount})
        </button>
        {goals.length > 0 && (
          <div className="ml-auto flex gap-2">
            <button
              onClick={exportGoals}
              className="px-3 py-2 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              Export
            </button>
            <label className="px-3 py-2 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={importGoals} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {/* Celebration Overlay */}
      {celebrating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">{'\uD83C\uDF89'}</div>
            <div className="text-3xl font-bold text-white mb-2">Goal Complete!</div>
            <div className="text-lg text-emerald-400">
              {goals.find(g => g.id === celebrating)?.title}
            </div>
          </div>
        </div>
      )}

      {/* ── Dashboard View ────────────────────────────────────────────── */}
      {view === 'dashboard' && (
        <div>
          {activeGoals.length === 0 ? (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-10 text-center">
              <div className="text-4xl mb-3">{'\uD83C\uDFAF'}</div>
              <h3 className="text-lg font-semibold text-white mb-2">No Active Goals</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Set your first collecting goal to start tracking progress.
              </p>
              <button
                onClick={() => { setView('create'); resetForm(); }}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals
                .sort((a, b) => (b.current / b.target) - (a.current / a.target))
                .map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    editing={editingId === goal.id}
                    onStartEdit={() => setEditingId(goal.id)}
                    onUpdate={(val) => updateProgress(goal.id, val)}
                    onDelete={() => deleteGoal(goal.id)}
                    onCancel={() => setEditingId(null)}
                  />
                ))}
            </div>
          )}

          {/* Quick Suggestions */}
          {activeGoals.length > 0 && activeGoals.length < 5 && (
            <div className="mt-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Suggested Next Goals</h3>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES
                  .filter(t => !activeGoals.some(g => g.template === t.id))
                  .slice(0, 3)
                  .map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setView('create'); setSelectedTemplate(t.id); }}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                    >
                      {t.icon} {t.title}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Create View ───────────────────────────────────────────────── */}
      {view === 'create' && (
        <div>
          {!selectedTemplate ? (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Choose a Goal Template</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {TEMPLATES.map(tmpl => {
                  const c = COLOR_MAP[tmpl.color];
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`${c.bg} border ${c.border} rounded-xl p-4 text-left hover:scale-[1.02] transition-transform`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{tmpl.icon}</span>
                        <div>
                          <div className={`font-semibold ${c.text}`}>{tmpl.title}</div>
                          <div className="text-xs text-zinc-500">Default: {tmpl.defaultTarget} {tmpl.unit}</div>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400">{tmpl.description}</p>
                    </button>
                  );
                })}

                {/* Custom option */}
                <button
                  onClick={() => setSelectedTemplate('custom')}
                  className="bg-zinc-900/70 border border-zinc-700 border-dashed rounded-xl p-4 text-left hover:border-emerald-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{'\u2B50'}</span>
                    <div>
                      <div className="font-semibold text-zinc-300">Custom Goal</div>
                      <div className="text-xs text-zinc-500">Define your own</div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400">Create a fully custom goal with your own title, target, and unit</p>
                </button>
              </div>
            </div>
          ) : selectedTemplate === 'custom' ? (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Create Custom Goal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    placeholder="e.g., Collect all 2024 Topps Series 1"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={customDescription}
                    onChange={e => setCustomDescription(e.target.value)}
                    placeholder="e.g., Complete base set of 350 cards"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Target Number</label>
                    <input
                      type="number"
                      value={customTarget}
                      onChange={e => setCustomTarget(e.target.value)}
                      placeholder="350"
                      min="1"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Unit</label>
                    <select
                      value={customUnit}
                      onChange={e => setCustomUnit(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600"
                    >
                      <option value="cards">cards</option>
                      <option value="dollars">dollars</option>
                      <option value="slabs">slabs</option>
                      <option value="teams">teams</option>
                      <option value="sets">sets</option>
                      <option value="months">months</option>
                      <option value="parallels">parallels</option>
                      <option value="rookies">rookies</option>
                      <option value="items">items</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCreate}
                    disabled={!customTitle.trim() || !customTarget}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Goal
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6">
              {(() => {
                const tmpl = TEMPLATES.find(t => t.id === selectedTemplate)!;
                const c = COLOR_MAP[tmpl.color];
                return (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{tmpl.icon}</span>
                      <div>
                        <h2 className={`text-lg font-semibold ${c.text}`}>{tmpl.title}</h2>
                        <p className="text-xs text-zinc-500">{tmpl.description}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm text-zinc-400 mb-1">
                        Target ({tmpl.unit})
                      </label>
                      <input
                        type="number"
                        value={targetOverride || tmpl.defaultTarget}
                        onChange={e => setTargetOverride(e.target.value)}
                        min="1"
                        className="w-full sm:w-48 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-600"
                      />
                      <p className="text-xs text-zinc-600 mt-1">Default: {tmpl.defaultTarget} {tmpl.unit}</p>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-zinc-500 mb-2">Milestones:</div>
                      <div className="flex flex-wrap gap-2">
                        {tmpl.milestones.map(m => (
                          <span key={m.at} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                            {m.at}% &mdash; {m.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCreate}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Create Goal
                      </button>
                      <button
                        onClick={resetForm}
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── Completed View ─────────────────────────────────────────────── */}
      {view === 'completed' && (
        <div>
          {completedGoals.length === 0 ? (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-10 text-center">
              <div className="text-4xl mb-3">{'\uD83C\uDFC5'}</div>
              <h3 className="text-lg font-semibold text-white mb-2">No Completed Goals Yet</h3>
              <p className="text-sm text-zinc-500">
                Keep working on your active goals. Completed goals will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedGoals
                .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                .map(goal => {
                  const c = COLOR_MAP[goal.color] || COLOR_MAP.emerald;
                  return (
                    <div key={goal.id} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <div className="font-semibold text-white">{goal.title}</div>
                            <div className="text-xs text-zinc-500">
                              {goal.target} {goal.unit} &middot; Completed {new Date(goal.completedAt!).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-sm font-medium">100%</span>
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
                            title="Remove"
                          >
                            {'\u2715'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Goal Card Component ────────────────────────────────────────────────────
function GoalCard({
  goal,
  editing,
  onStartEdit,
  onUpdate,
  onDelete,
  onCancel,
}: {
  goal: Goal;
  editing: boolean;
  onStartEdit: () => void;
  onUpdate: (val: number) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const [inputVal, setInputVal] = useState(goal.current.toString());
  const pct = Math.round((goal.current / goal.target) * 100);
  const c = COLOR_MAP[goal.color] || COLOR_MAP.emerald;

  useEffect(() => {
    setInputVal(goal.current.toString());
  }, [goal.current]);

  // Next milestone
  const nextMilestone = goal.milestones.find(m => !m.reached);

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 sm:p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goal.icon}</span>
          <div>
            <h3 className="font-semibold text-white">{goal.title}</h3>
            <p className="text-xs text-zinc-500">{goal.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDelete}
            className="text-xs text-zinc-600 hover:text-red-400 p-1 transition-colors"
            title="Delete goal"
          >
            {'\u2715'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className={`text-sm font-bold ${c.text}`}>{pct}%</span>
          <span className="text-xs text-zinc-500">
            {goal.unit === 'dollars' ? `$${goal.current.toLocaleString()}` : goal.current.toLocaleString()} / {goal.unit === 'dollars' ? `$${goal.target.toLocaleString()}` : goal.target.toLocaleString()} {goal.unit !== 'dollars' ? goal.unit : ''}
          </span>
        </div>
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full ${c.fill} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
          {/* Milestone markers */}
          {goal.milestones.map(m => (
            <div
              key={m.at}
              className={`absolute top-0 bottom-0 w-0.5 ${m.reached ? 'bg-white/40' : 'bg-zinc-600'}`}
              style={{ left: `${m.at}%` }}
              title={m.label}
            />
          ))}
        </div>
      </div>

      {/* Milestones Row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {goal.milestones.map(m => (
          <span
            key={m.at}
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              m.reached
                ? `${c.light} ${c.text} border ${c.border}`
                : 'bg-zinc-800/50 text-zinc-600 border border-zinc-800'
            }`}
          >
            {m.reached ? '\u2713' : '\u25CB'} {m.label}
          </span>
        ))}
      </div>

      {/* Next Milestone Hint */}
      {nextMilestone && (
        <div className="text-xs text-zinc-500 mb-3">
          Next: <span className={c.text}>{nextMilestone.label}</span> &mdash;{' '}
          {Math.max(0, Math.ceil((nextMilestone.at / 100) * goal.target) - goal.current)} {goal.unit} to go
        </div>
      )}

      {/* Update Controls */}
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            min="0"
            max={goal.target}
            className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-600"
            autoFocus
          />
          <span className="text-xs text-zinc-500">/ {goal.target} {goal.unit}</span>
          <button
            onClick={() => onUpdate(parseInt(inputVal, 10) || 0)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={onStartEdit}
            className={`px-4 py-1.5 ${c.light} border ${c.border} ${c.text} hover:bg-opacity-60 rounded text-xs font-medium transition-colors`}
          >
            Update Progress
          </button>
          <button
            onClick={() => onUpdate(goal.current + 1)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors"
            title="+1"
          >
            +1
          </button>
          {goal.unit === 'dollars' && (
            <>
              <button
                onClick={() => onUpdate(goal.current + 100)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors"
              >
                +$100
              </button>
              <button
                onClick={() => onUpdate(goal.current + 500)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors"
              >
                +$500
              </button>
            </>
          )}
        </div>
      )}

      {/* Created Date */}
      <div className="mt-3 text-[10px] text-zinc-600">
        Created {new Date(goal.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
