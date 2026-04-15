'use client';

import { useState, useEffect, useCallback } from 'react';

type GoalCategory = 'set_completion' | 'card_acquisition' | 'grading' | 'value_target' | 'custom';
type GoalPriority = 'high' | 'medium' | 'low';
type GoalStatus = 'active' | 'completed' | 'paused';

interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number; // 0-100
  target: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
}

const CATEGORIES: { id: GoalCategory; label: string; icon: string; color: string }[] = [
  { id: 'set_completion', label: 'Set Completion', icon: 'C', color: 'text-blue-400' },
  { id: 'card_acquisition', label: 'Card Acquisition', icon: 'A', color: 'text-green-400' },
  { id: 'grading', label: 'Grading', icon: 'G', color: 'text-purple-400' },
  { id: 'value_target', label: 'Value Target', icon: '$', color: 'text-yellow-400' },
  { id: 'custom', label: 'Custom', icon: '*', color: 'text-gray-400' },
];

const PRESETS: { title: string; category: GoalCategory; target: string }[] = [
  { title: 'Complete 1987 Topps Baseball Set', category: 'set_completion', target: '792 cards' },
  { title: 'Own a PSA 10 of every 2024 Topps Chrome RC', category: 'card_acquisition', target: '30 cards' },
  { title: 'Grade 10 raw cards this month', category: 'grading', target: '10 submissions' },
  { title: 'Build $5,000 collection value', category: 'value_target', target: '$5,000' },
  { title: 'Complete 2024 Prizm Football base set', category: 'set_completion', target: '300 cards' },
  { title: 'Own one card of every HOF baseball player', category: 'card_acquisition', target: '340 players' },
  { title: 'Get a BGS 9.5 on my best card', category: 'grading', target: 'BGS 9.5' },
  { title: 'Own a vintage card from every decade 1950s-2020s', category: 'card_acquisition', target: '8 decades' },
];

const STORAGE_KEY = 'cardvault_goals';

function loadGoals(): Goal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveGoals(goals: Goal[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(goals)); } catch {}
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function CollectionGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalCategory>('card_acquisition');
  const [newPriority, setNewPriority] = useState<GoalPriority>('medium');
  const [newTarget, setNewTarget] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  const addGoal = useCallback((title: string, category: GoalCategory, priority: GoalPriority, target: string) => {
    const goal: Goal = {
      id: generateId(),
      title,
      category,
      priority,
      status: 'active',
      progress: 0,
      target,
      notes: '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [goal, ...goals];
    setGoals(next);
    saveGoals(next);
    setShowAdd(false);
    setNewTitle('');
    setNewTarget('');
  }, [goals]);

  const updateProgress = useCallback((id: string, progress: number) => {
    const next = goals.map(g => {
      if (g.id !== id) return g;
      const status = progress >= 100 ? 'completed' : 'active';
      return {
        ...g,
        progress: Math.min(100, Math.max(0, progress)),
        status,
        completedAt: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      } as Goal;
    });
    setGoals(next);
    saveGoals(next);
  }, [goals]);

  const togglePause = useCallback((id: string) => {
    const next = goals.map(g => {
      if (g.id !== id) return g;
      return { ...g, status: (g.status === 'paused' ? 'active' : 'paused') as GoalStatus };
    });
    setGoals(next);
    saveGoals(next);
  }, [goals]);

  const removeGoal = useCallback((id: string) => {
    const next = goals.filter(g => g.id !== id);
    setGoals(next);
    saveGoals(next);
  }, [goals]);

  const filtered = goals.filter(g => {
    if (filter === 'active') return g.status === 'active';
    if (filter === 'completed') return g.status === 'completed';
    return true;
  });

  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{activeCount}</div>
          <div className="text-xs text-gray-500">Active Goals</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{completedCount}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{avgProgress}%</div>
          <div className="text-xs text-gray-500">Avg Progress</div>
        </div>
      </div>

      {/* Filter + Add */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filter === f
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Completed'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
        >
          + Add Goal
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-gray-900 border border-indigo-800/50 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-indigo-300">New Goal</h3>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="e.g., Complete 1987 Topps Baseball Set"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as GoalCategory)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as GoalPriority)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Target</label>
              <input
                type="text"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                placeholder="e.g., 792 cards"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
          <button
            onClick={() => newTitle && addGoal(newTitle, newCategory, newPriority, newTarget)}
            disabled={!newTitle}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg text-sm"
          >
            Create Goal
          </button>

          {/* Presets */}
          <div>
            <h4 className="text-xs text-gray-500 mb-2">Quick Add Presets</h4>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.title}
                  onClick={() => addGoal(p.title, p.category, 'medium', p.target)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700 rounded-lg transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(goal => {
            const cat = CATEGORIES.find(c => c.id === goal.category);
            const priorityColor = goal.priority === 'high' ? 'text-red-400' : goal.priority === 'medium' ? 'text-yellow-400' : 'text-gray-500';
            const isCompleted = goal.status === 'completed';
            const isPaused = goal.status === 'paused';

            return (
              <div
                key={goal.id}
                className={`bg-gray-900 border rounded-xl p-4 transition-colors ${
                  isCompleted ? 'border-green-800/50 opacity-80' : isPaused ? 'border-gray-700 opacity-60' : 'border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-sm font-bold ${cat?.color || 'text-gray-400'}`}>
                      {cat?.icon || '?'}
                    </div>
                    <div>
                      <h3 className={`font-medium ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                        {goal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{cat?.label}</span>
                        <span className={`text-xs ${priorityColor}`}>
                          {goal.priority === 'high' ? 'HIGH' : goal.priority === 'medium' ? 'MED' : 'LOW'}
                        </span>
                        {goal.target && <span className="text-xs text-gray-600">Target: {goal.target}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => togglePause(goal.id)} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded">
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button onClick={() => removeGoal(goal.id)} className="text-xs text-gray-500 hover:text-red-400 px-2 py-1 rounded">
                      Del
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white min-w-[40px] text-right">{goal.progress}%</span>
                </div>

                {/* Progress Buttons */}
                {!isCompleted && !isPaused && (
                  <div className="flex gap-2 mt-3">
                    {[10, 25, 50, 75, 100].map(val => (
                      <button
                        key={val}
                        onClick={() => updateProgress(goal.id, val)}
                        className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                          goal.progress >= val
                            ? 'bg-indigo-900/50 border-indigo-700/50 text-indigo-300'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                )}

                {isCompleted && goal.completedAt && (
                  <p className="text-xs text-green-500 mt-2">Completed on {goal.completedAt}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500">
            {filter === 'completed' ? 'No completed goals yet. Keep collecting!' : 'No goals yet. Add your first collecting goal above!'}
          </p>
        </div>
      )}
    </div>
  );
}
