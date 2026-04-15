'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
interface CardShow {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  city: string;
  state: string;
  venue: string;
  type: 'local' | 'regional' | 'national';
  categories: ('sports' | 'pokemon' | 'vintage' | 'autographs' | 'sealed')[];
  tables: number;
  admission: string;
  website?: string;
  notes: string;
}

const states = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const stateNames: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina',
  ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
  TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'Washington DC',
};

/* ───── Show Data ───── */
const shows: CardShow[] = [
  // National
  { id: 'nscc-2026', name: 'The National Sports Collectors Convention', date: '2026-07-29', endDate: '2026-08-02', city: 'Atlantic City', state: 'NJ', venue: 'Atlantic City Convention Center', type: 'national', categories: ['sports', 'pokemon', 'vintage', 'autographs', 'sealed'], tables: 800, admission: '$30-$150', notes: 'The Super Bowl of card shows. 800+ tables, celebrity autographs, exclusive releases. The biggest event in the hobby.' },
  // Regional
  { id: 'dallas-card-show-apr', name: 'Dallas Card Show', date: '2026-04-18', endDate: '2026-04-19', city: 'Dallas', state: 'TX', venue: 'Dallas Market Hall', type: 'regional', categories: ['sports', 'pokemon', 'vintage', 'autographs'], tables: 350, admission: '$10-$25', notes: 'One of the largest monthly shows in Texas. 350+ dealers from across the South.' },
  { id: 'chicago-sportscards-may', name: 'Chicago Sports Spectacular', date: '2026-05-16', endDate: '2026-05-17', city: 'Chicago', state: 'IL', venue: 'Stephens Convention Center', type: 'regional', categories: ['sports', 'vintage', 'autographs'], tables: 250, admission: '$8-$20', notes: 'Midwest premier show. Great for vintage Topps and Chicago sports memorabilia.' },
  { id: 'socal-card-show-apr', name: 'SoCal Card Show', date: '2026-04-25', endDate: '2026-04-26', city: 'Anaheim', state: 'CA', venue: 'Anaheim Convention Center', type: 'regional', categories: ['sports', 'pokemon', 'autographs', 'sealed'], tables: 300, admission: '$10-$25', notes: 'West Coast largest show. Heavy on modern cards and Pokemon.' },
  { id: 'nyc-card-expo-may', name: 'NYC Card Expo', date: '2026-05-02', endDate: '2026-05-03', city: 'New York', state: 'NY', venue: 'Javits Center', type: 'regional', categories: ['sports', 'pokemon', 'vintage'], tables: 200, admission: '$15-$30', notes: 'East Coast flagship. Strong vintage market and NYC sports focus.' },
  { id: 'philly-sports-show-may', name: 'Philadelphia Sports Card Show', date: '2026-05-09', city: 'Philadelphia', state: 'PA', venue: 'Greater Philadelphia Expo Center', type: 'regional', categories: ['sports', 'vintage', 'autographs'], tables: 180, admission: '$5-$15', notes: 'Philly sports focus. Great for Eagles, Phillies, and 76ers cards.' },
  { id: 'atlanta-card-show-may', name: 'Atlanta Card Show', date: '2026-05-23', city: 'Atlanta', state: 'GA', venue: 'Atlanta Expo Center', type: 'regional', categories: ['sports', 'pokemon', 'sealed'], tables: 150, admission: '$8-$15', notes: 'Southeast hub. Growing Pokemon presence alongside sports.' },
  { id: 'houston-card-show-apr', name: 'Houston Card Show', date: '2026-04-26', city: 'Houston', state: 'TX', venue: 'NRG Center', type: 'regional', categories: ['sports', 'pokemon', 'autographs'], tables: 200, admission: '$8-$20', notes: 'Texas-sized deals. Astros and Texans focus. Growing Panini presence.' },
  { id: 'bay-area-card-show-may', name: 'Bay Area Card Show', date: '2026-05-30', city: 'San Francisco', state: 'CA', venue: 'Cow Palace', type: 'regional', categories: ['sports', 'pokemon', 'vintage'], tables: 175, admission: '$10-$20', notes: 'Warriors, 49ers, Giants focus. Silicon Valley collectors bring buying power.' },
  { id: 'detroit-card-show-jun', name: 'Motor City Card Show', date: '2026-06-06', city: 'Detroit', state: 'MI', venue: 'Suburban Collection Showplace', type: 'regional', categories: ['sports', 'vintage', 'autographs'], tables: 120, admission: '$5-$15', notes: 'Detroit sports heritage. Red Wings vintage and Lions rising cards.' },
  // Local
  { id: 'maple-grove-weekly', name: 'Maple Grove Sports Cards', date: '2026-04-19', city: 'Minneapolis', state: 'MN', venue: 'Maple Grove Community Center', type: 'local', categories: ['sports', 'pokemon'], tables: 30, admission: 'Free', notes: 'Weekly Saturday show. Great for beginners and local deals.' },
  { id: 'denver-monthly-apr', name: 'Mile High Card Show', date: '2026-04-20', city: 'Denver', state: 'CO', venue: 'National Western Complex', type: 'local', categories: ['sports', 'pokemon', 'vintage'], tables: 60, admission: '$5', notes: 'Monthly show with Colorado sports focus. Nuggets cards trending.' },
  { id: 'phoenix-card-show-apr', name: 'Valley of the Sun Card Show', date: '2026-04-26', city: 'Phoenix', state: 'AZ', venue: 'Arizona State Fairgrounds', type: 'local', categories: ['sports', 'pokemon', 'sealed'], tables: 50, admission: '$5-$10', notes: 'Arizona hobby hub. Spring training base cards available.' },
  { id: 'seattle-card-expo-may', name: 'Pacific NW Card Expo', date: '2026-05-10', city: 'Seattle', state: 'WA', venue: 'Seattle Center Exhibition Hall', type: 'local', categories: ['sports', 'pokemon'], tables: 75, admission: '$5-$10', notes: 'PNW collectors hub. Seahawks and Mariners focus.' },
  { id: 'miami-card-show-may', name: 'Miami Sports Cards', date: '2026-05-17', city: 'Miami', state: 'FL', venue: 'Miami Dade County Fair Expo', type: 'local', categories: ['sports', 'pokemon', 'autographs'], tables: 80, admission: '$8', notes: 'South Florida hotspot. Heat, Dolphins, and Pantera cards.' },
  { id: 'boston-card-show-jun', name: 'New England Card Expo', date: '2026-06-07', city: 'Boston', state: 'MA', venue: 'Shriner Auditorium', type: 'local', categories: ['sports', 'vintage'], tables: 65, admission: '$5-$10', notes: 'Red Sox vintage paradise. Strong New England sports community.' },
  { id: 'nashville-show-jun', name: 'Nashville Sports Card Show', date: '2026-06-14', city: 'Nashville', state: 'TN', venue: 'Nashville Fairgrounds', type: 'local', categories: ['sports', 'autographs'], tables: 40, admission: '$5', notes: 'Growing scene. Titans and Predators focus. Country music city collectors.' },
  { id: 'portland-show-jun', name: 'Rose City Card Show', date: '2026-06-21', city: 'Portland', state: 'OR', venue: 'Portland Expo Center', type: 'local', categories: ['sports', 'pokemon', 'vintage'], tables: 55, admission: '$5', notes: 'Oregon hobby scene. Trail Blazers vintage and Pokemon hot here.' },
  { id: 'columbus-show-apr', name: 'Buckeye Card Show', date: '2026-04-19', city: 'Columbus', state: 'OH', venue: 'Ohio Expo Center', type: 'local', categories: ['sports', 'vintage', 'sealed'], tables: 70, admission: '$5', notes: 'Ohio State collector heaven. Football and baseball focus.' },
  { id: 'charlotte-show-may', name: 'Queen City Card Expo', date: '2026-05-24', city: 'Charlotte', state: 'NC', venue: 'Charlotte Convention Center', type: 'local', categories: ['sports', 'pokemon'], tables: 55, admission: '$5-$10', notes: 'Carolina sports scene. Panthers and Hornets growing collector base.' },
];

const typeColors: Record<string, string> = {
  national: 'bg-amber-950/60 border-amber-800/50 text-amber-400',
  regional: 'bg-blue-950/60 border-blue-800/50 text-blue-400',
  local: 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400',
};

const categoryIcons: Record<string, string> = {
  sports: '🏟️',
  pokemon: '⚡',
  vintage: '🏛️',
  autographs: '✍️',
  sealed: '📦',
};

/* ───── Component ───── */
export default function ShowFinder() {
  const [stateFilter, setStateFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'tables'>('date');

  const filteredShows = useMemo(() => {
    let result = [...shows];
    if (stateFilter) result = result.filter(s => s.state === stateFilter);
    if (typeFilter) result = result.filter(s => s.type === typeFilter);
    if (categoryFilter) result = result.filter(s => s.categories.includes(categoryFilter as CardShow['categories'][number]));

    if (sortBy === 'date') result.sort((a, b) => a.date.localeCompare(b.date));
    else result.sort((a, b) => b.tables - a.tables);

    return result;
  }, [stateFilter, typeFilter, categoryFilter, sortBy]);

  const statesWithShows = useMemo(() => [...new Set(shows.map(s => s.state))].sort(), []);
  const nextShow = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return shows.filter(s => s.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  }, []);

  const formatDate = (date: string, endDate?: string) => {
    const d = new Date(date + 'T12:00:00');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    if (endDate) {
      const e = new Date(endDate + 'T12:00:00');
      const eMonth = e.toLocaleString('en-US', { month: 'short' });
      const eDay = e.getDate();
      if (month === eMonth) return `${month} ${day}-${eDay}`;
      return `${month} ${day} - ${eMonth} ${eDay}`;
    }
    return `${month} ${day}`;
  };

  const daysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / 86400000);
    if (days < 0) return 'Past';
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  return (
    <div className="space-y-8">
      {/* Next Show Countdown */}
      {nextShow && (
        <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-800/30 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Next Upcoming Show</div>
              <h3 className="text-xl font-bold text-white">{nextShow.name}</h3>
              <p className="text-gray-400 text-sm">{nextShow.city}, {stateNames[nextShow.state]} &middot; {nextShow.venue}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{daysUntil(nextShow.date)}</div>
              <div className="text-xs text-gray-500">{formatDate(nextShow.date, nextShow.endDate)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Find Shows</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">State</label>
            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {statesWithShows.map(s => (
                <option key={s} value={s}>{stateNames[s] || s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Show Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="national">National</option>
              <option value="regional">Regional</option>
              <option value="local">Local</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="sports">Sports Cards</option>
              <option value="pokemon">Pokemon</option>
              <option value="vintage">Vintage</option>
              <option value="autographs">Autographs</option>
              <option value="sealed">Sealed Products</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'tables')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date (Soonest)</option>
              <option value="tables">Size (Most Tables)</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-gray-600 mt-3">{filteredShows.length} shows found</div>
      </div>

      {/* Show List */}
      <div className="space-y-3">
        {filteredShows.map(show => {
          const isPast = new Date(show.date) < new Date();
          return (
            <div key={show.id} className={`bg-gray-900/60 border border-gray-800 rounded-xl p-4 sm:p-5 hover:border-gray-700 transition-colors ${isPast ? 'opacity-50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Date badge */}
                <div className="sm:w-20 shrink-0 text-center">
                  <div className="inline-block sm:block bg-gray-800 border border-gray-700 rounded-xl p-2 sm:p-3">
                    <div className="text-xs text-gray-500">{new Date(show.date + 'T12:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()}</div>
                    <div className="text-2xl font-bold text-white">{new Date(show.date + 'T12:00:00').getDate()}</div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold">{show.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${typeColors[show.type]}`}>
                      {show.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{show.city}, {stateNames[show.state]} &middot; {show.venue}</p>

                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span>{formatDate(show.date, show.endDate)}</span>
                    <span>&middot;</span>
                    <span>{show.tables}+ tables</span>
                    <span>&middot;</span>
                    <span>{show.admission}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {show.categories.map(cat => (
                      <span key={cat} className="text-xs bg-gray-800 border border-gray-700 rounded-full px-2 py-0.5 text-gray-400">
                        {categoryIcons[cat]} {cat}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-2">{show.notes}</p>
                </div>

                {/* Countdown */}
                <div className="sm:w-24 shrink-0 text-right">
                  <div className={`text-sm font-bold ${isPast ? 'text-gray-600' : 'text-blue-400'}`}>
                    {daysUntil(show.date)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredShows.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm">No shows found matching your filters. Try broadening your search.</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Card Show Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Bring Cash', tip: 'Most dealers prefer cash and will give better deals. ATMs at shows charge $5-10 fees and have long lines.' },
            { title: 'Arrive Early', tip: 'Best deals go fast. VIP/early bird admission is worth it for serious buyers — first picks on raw vintage and sealed wax.' },
            { title: 'Use CardVault Mobile', tip: 'Pull up the Dealer Scanner tool on your phone to check prices in real-time while negotiating at tables.' },
            { title: 'Negotiate on Multiples', tip: 'Buying 3+ cards from one dealer? Ask for a bundle discount. Most dealers will take 10-20% off for multi-card deals.' },
            { title: 'Check Condition Carefully', tip: 'Use the Condition Grader tool to assess corners, edges, surface, and centering before paying top dollar for "NM" cards.' },
            { title: 'End of Show Deals', tip: 'Dealers drop prices in the last hour — they do not want to pack unsold inventory. Come back before close for steals.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-3">
              <h4 className="text-sm font-medium text-white mb-1">{t.title}</h4>
              <p className="text-xs text-gray-400">{t.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-links */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Show Day Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/card-show', label: 'Card Show Companion' },
            { href: '/tools/dealer-scanner', label: 'Dealer Scanner' },
            { href: '/tools/condition-grader', label: 'Condition Grader' },
            { href: '/tools/flip-calc', label: 'Flip Calculator' },
            { href: '/tools/auth-check', label: 'Auth Checker' },
            { href: '/tools/grading-roi', label: 'Grading ROI' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
