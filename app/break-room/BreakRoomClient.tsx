'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BreakRoomClient() {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);

  const formats = [
    { id: 'hobby', name: 'Hobby Box Break', icon: '📦', desc: 'Full hobby box ripped live', slots: 12, price: 'Free' },
    { id: 'team', name: 'Team Break', icon: '🏟️', desc: 'Pick your team, get their cards', slots: 30, price: 'Free' },
    { id: 'pick', name: 'Pick Your Pack', icon: '🎯', desc: 'Choose which pack to open', slots: 24, price: 'Free' },
    { id: 'random', name: 'Random Teams', icon: '🎲', desc: 'Random team assignment', slots: 30, price: 'Free' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {formats.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFormat(f.id)}
            className={`p-5 rounded-xl border text-left transition-all ${
              selectedFormat === f.id
                ? 'border-blue-500 bg-blue-900/20'
                : 'border-gray-700 bg-gray-800/60 hover:border-blue-600'
            }`}
          >
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-bold text-white">{f.name}</div>
            <div className="text-sm text-gray-400 mt-1">{f.desc}</div>
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
              <span>{f.slots} slots</span>
              <span className="text-green-400">{f.price}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedFormat && (
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🎬</div>
          <h3 className="text-xl font-bold text-white mb-2">Break Room Coming Soon</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Live simulated card breaks with real-time pulls, reactions, and chat are launching soon.
            In the meantime, try our pack simulator!
          </p>
          <Link
            href="/tools/pack-sim"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Open Pack Simulator
          </Link>
        </div>
      )}

      {!selectedFormat && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Select a break format above to get started.</p>
        </div>
      )}
    </div>
  );
}
