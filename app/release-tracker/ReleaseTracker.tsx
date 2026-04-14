'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Release {
  id: string;
  name: string;
  sport: string;
  brand: string;
  type: string; // hobby, retail, blaster, etb
  releaseDate: string;
  estimatedPrice: string;
  keyRookies: string[];
  hitRate: string;
  description: string;
  notifyMe: boolean;
}

const upcomingReleases: Omit<Release, 'notifyMe'>[] = [
  { id: 'r1', name: '2025 Topps Series 2 Baseball', sport: 'baseball', brand: 'Topps', type: 'hobby', releaseDate: '2025-06-18', estimatedPrice: '$95-$120/hobby box', keyRookies: ['Paul Skenes', 'Jackson Chourio', 'Junior Caminero'], hitRate: '1 auto or relic per hobby box', description: 'The second installment of flagship Topps with additional rookies and inserts. Series 2 typically includes players who debuted after Series 1 cutoff.' },
  { id: 'r2', name: '2025 Panini Prizm Football', sport: 'football', brand: 'Panini', type: 'hobby', releaseDate: '2025-09-15', estimatedPrice: '$350-$450/hobby box', keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'], hitRate: '4 autos per hobby box', description: 'The most anticipated football product of the year. Prizm has become the gold standard for modern football card investing.' },
  { id: 'r3', name: '2025 Panini Prizm Basketball', sport: 'basketball', brand: 'Panini', type: 'hobby', releaseDate: '2025-10-08', estimatedPrice: '$400-$500/hobby box', keyRookies: ['Cooper Flagg', 'Dylan Harper', 'Ace Bailey'], hitRate: '4 autos per hobby box', description: 'Premium basketball product featuring the highly anticipated 2025 NBA Draft class led by Cooper Flagg.' },
  { id: 'r4', name: '2025 Topps Chrome Baseball', sport: 'baseball', brand: 'Topps', type: 'hobby', releaseDate: '2025-10-22', estimatedPrice: '$250-$350/hobby box', keyRookies: ['Paul Skenes', 'Jackson Chourio', 'Wyatt Langford'], hitRate: '2 autos per hobby box', description: 'The chromium version of Topps flagship. Chrome refractors are among the most sought-after modern baseball cards. Numbered parallels and auto refractors drive the value.' },
  { id: 'r5', name: '2025-26 Upper Deck Series 1 Hockey', sport: 'hockey', brand: 'Upper Deck', type: 'hobby', releaseDate: '2025-11-12', estimatedPrice: '$120-$180/hobby box', keyRookies: ['Macklin Celebrini', 'Ivan Demidov', 'Artyom Levshunov'], hitRate: '6 Young Guns per hobby box', description: 'The premier hockey product featuring Young Guns rookies. Upper Deck Series 1 Young Guns are the most collected hockey rookie cards in the modern era.' },
  { id: 'r6', name: '2025 Topps Heritage Baseball', sport: 'baseball', brand: 'Topps', type: 'hobby', releaseDate: '2025-05-07', estimatedPrice: '$80-$110/hobby box', keyRookies: ['Paul Skenes', 'Jackson Merrill', 'Masyn Winn'], hitRate: '1 auto per hobby box', description: 'Retro-designed product using the classic 1976 Topps template. Short prints and real one-of-one variations make this a set-builder favorite.' },
  { id: 'r7', name: '2025 Panini Donruss Football', sport: 'football', brand: 'Panini', type: 'hobby', releaseDate: '2025-07-23', estimatedPrice: '$150-$200/hobby box', keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'], hitRate: '3 autos per hobby box', description: 'An affordable entry point for NFL rookie cards. Rated Rookies are the signature insert and a staple of modern football collecting.' },
  { id: 'r8', name: '2025 Pokemon Prismatic Evolutions', sport: 'pokemon', brand: 'Pokemon Company', type: 'etb', releaseDate: '2025-05-02', estimatedPrice: '$55-$65/ETB', keyRookies: ['Eevee SIR', 'Umbreon ex', 'Glaceon ex'], hitRate: '11 packs, 10 cards per pack', description: 'One of the most hyped Pokemon sets of 2025. Eevee-themed with special illustration rares featuring all Eeveelutions. Expected to be the highest-demand Pokemon product of the year.' },
  { id: 'r9', name: '2025 Topps Bowman Baseball', sport: 'baseball', brand: 'Topps', type: 'hobby', releaseDate: '2025-05-21', estimatedPrice: '$150-$200/hobby box', keyRookies: ['Roman Anthony', 'Ethan Salas', 'JJ Wetherholt'], hitRate: '2 autos per hobby box', description: 'The prospect product. Bowman 1st chromes of top prospects are the most speculative and potentially most valuable cards in the hobby. Roman Anthony is the consensus #1 prospect.' },
  { id: 'r10', name: '2025 Panini Select Football', sport: 'football', brand: 'Panini', type: 'hobby', releaseDate: '2025-11-05', estimatedPrice: '$300-$400/hobby box', keyRookies: ['Shedeur Sanders', 'Cam Ward', 'Travis Hunter'], hitRate: '3 autos per hobby box', description: 'Multi-tiered product with Concourse (base), Premier (silver), and Field Level (courtside) designs. Tri-color die-cuts are the chase parallels.' },
  { id: 'r11', name: '2025 Panini Flawless Basketball', sport: 'basketball', brand: 'Panini', type: 'hobby', releaseDate: '2025-12-10', estimatedPrice: '$2,500-$3,500/box', keyRookies: ['Cooper Flagg', 'Dylan Harper', 'Ace Bailey'], hitRate: '10 cards, all hits', description: 'The ultra-premium product. Every card is a gem or metal-embedded card, patch, or autograph. The briefcase packaging and $3,000 price point make this the pinnacle of basketball cards.' },
  { id: 'r12', name: '2025-26 Pokemon Scarlet & Violet Set 12', sport: 'pokemon', brand: 'Pokemon Company', type: 'etb', releaseDate: '2025-08-08', estimatedPrice: '$45-$55/ETB', keyRookies: ['New SIR cards', 'Gold cards', 'Hyper Rares'], hitRate: '11 packs, 10 cards per pack', description: 'The next main series expansion for the Scarlet & Violet era. Each set introduces new Special Illustration Rares that command premium prices from collectors.' },
];

function getCountdown(dateStr: string) {
  const now = new Date();
  const release = new Date(dateStr + 'T00:00:00');
  const diff = release.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, released: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours, released: false };
}

const sportColors: Record<string, string> = {
  baseball: 'text-red-400 bg-red-950/30 border-red-800/50',
  basketball: 'text-orange-400 bg-orange-950/30 border-orange-800/50',
  football: 'text-green-400 bg-green-950/30 border-green-800/50',
  hockey: 'text-blue-400 bg-blue-950/30 border-blue-800/50',
  pokemon: 'text-yellow-400 bg-yellow-950/30 border-yellow-800/50',
};

export default function ReleaseTracker() {
  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cardvault-release-notifications');
    if (saved) setNotifications(JSON.parse(saved));
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('cardvault-release-notifications', JSON.stringify(notifications));
  }, [notifications, mounted]);

  const toggleNotify = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const releases = useMemo(() => {
    return upcomingReleases
      .filter(r => filter === 'all' || r.sport === filter)
      .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
  }, [filter]);

  const sports = ['all', ...new Set(upcomingReleases.map(r => r.sport))];

  if (!mounted) return <div className="text-gray-400 text-center py-10">Loading releases...</div>;

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {sports.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === s ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}`}
          >
            {s === 'all' ? 'All Sports' : s === 'pokemon' ? 'Pokemon' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Upcoming</div>
          <div className="text-2xl font-bold text-white">{releases.filter(r => !getCountdown(r.releaseDate).released).length}</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Next Release</div>
          <div className="text-lg font-bold text-emerald-400">
            {(() => {
              const next = releases.find(r => !getCountdown(r.releaseDate).released);
              return next ? `${getCountdown(next.releaseDate).days}d` : 'None';
            })()}
          </div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Tracking</div>
          <div className="text-2xl font-bold text-amber-400">{Object.values(notifications).filter(Boolean).length}</div>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500">Total Products</div>
          <div className="text-2xl font-bold text-white">{upcomingReleases.length}</div>
        </div>
      </div>

      {/* Release Cards */}
      <div className="space-y-4">
        {releases.map(release => {
          const cd = getCountdown(release.releaseDate);
          const colorClass = sportColors[release.sport] || 'text-gray-400 bg-gray-950/30 border-gray-800/50';

          return (
            <div key={release.id} className={`border rounded-2xl p-5 ${colorClass}`}>
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase bg-gray-900/60 px-2 py-0.5 rounded">{release.sport}</span>
                    <span className="text-xs text-gray-500">{release.brand}</span>
                    <span className="text-xs text-gray-600">{release.type.toUpperCase()}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{release.name}</h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {cd.released ? (
                    <span className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-xl">Released!</span>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{cd.days}</div>
                      <div className="text-xs text-gray-500">days</div>
                    </div>
                  )}
                  <button
                    onClick={() => toggleNotify(release.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${notifications[release.id] ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-600'}`}
                  >
                    {notifications[release.id] ? '🔔 Tracking' : '🔕 Track'}
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{release.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs block">Release Date</span>
                  <span className="text-white">{new Date(release.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Price</span>
                  <span className="text-white">{release.estimatedPrice}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Hit Rate</span>
                  <span className="text-white">{release.hitRate}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Key Rookies</span>
                  <span className="text-white">{release.keyRookies.join(', ')}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Link href="/tools/sealed-ev" className="text-xs px-3 py-1 bg-gray-900/60 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors">
                  Calculate EV
                </Link>
                <Link href="/tools/pack-sim" className="text-xs px-3 py-1 bg-gray-900/60 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors">
                  Simulate Opening
                </Link>
                <Link href="/tools/wax-vs-singles" className="text-xs px-3 py-1 bg-gray-900/60 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors">
                  Wax vs Singles
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
