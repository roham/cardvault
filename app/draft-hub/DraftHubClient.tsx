'use client';

import { useState, useEffect } from 'react';

const DRAFT_DATE = new Date('2025-04-24T20:00:00-04:00'); // 8 PM ET

function getTimeLeft() {
  const now = new Date();
  const diff = DRAFT_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

export default function DraftHubClient() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (time.isPast) {
    return (
      <div className="mb-8 bg-emerald-900/30 border border-emerald-700 rounded-xl p-6 text-center">
        <div className="text-emerald-400 font-bold text-2xl mb-1">THE 2025 NFL DRAFT IS LIVE!</div>
        <p className="text-gray-400 text-sm">Check the Draft War Room for live pick tracking and card value updates.</p>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="text-center mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">2025 NFL Draft Starts In</div>
        <div className="flex justify-center gap-4 sm:gap-6">
          {[
            { value: time.days, label: 'Days' },
            { value: time.hours, label: 'Hours' },
            { value: time.minutes, label: 'Min' },
            { value: time.seconds, label: 'Sec' },
          ].map(unit => (
            <div key={unit.label} className="text-center">
              <div className="text-3xl sm:text-5xl font-bold text-white tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mt-1">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center text-xs text-gray-600">
        Round 1: Thursday, April 24 at 8:00 PM ET | Green Bay, Wisconsin
      </div>
    </div>
  );
}
