'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

interface DraftPick {
  pick: number;
  round: number;
  team: string;
  teamAbbr: string;
  player: string;
  position: string;
  school: string;
  preValue: string;
  postValueEst: string;
  spike: number;
  cardToBuy: string;
  cardSet: string;
  status: 'upcoming' | 'on-the-clock' | 'picked';
}

const NFL_2025_MOCK: DraftPick[] = [
  { pick: 1, round: 1, team: 'Tennessee Titans', teamAbbr: 'TEN', player: 'Cam Ward', position: 'QB', school: 'Miami', preValue: '$15–$40', postValueEst: '$80–$200', spike: 180, cardToBuy: 'Bowman University Chrome', cardSet: '2024 Bowman University', status: 'picked' },
  { pick: 2, round: 1, team: 'Cleveland Browns', teamAbbr: 'CLE', player: 'Shedeur Sanders', position: 'QB', school: 'Colorado', preValue: '$20–$60', postValueEst: '$100–$300', spike: 220, cardToBuy: 'Bowman University Chrome Auto', cardSet: '2024 Bowman University', status: 'picked' },
  { pick: 3, round: 1, team: 'New York Giants', teamAbbr: 'NYG', player: 'Travis Hunter', position: 'WR/CB', school: 'Colorado', preValue: '$25–$80', postValueEst: '$150–$500', spike: 300, cardToBuy: 'Prizm Draft Auto', cardSet: '2025 Panini Prizm Draft', status: 'picked' },
  { pick: 4, round: 1, team: 'New England Patriots', teamAbbr: 'NE', player: 'Abdul Carter', position: 'EDGE', school: 'Penn State', preValue: '$5–$15', postValueEst: '$25–$80', spike: 150, cardToBuy: 'Contenders Draft', cardSet: '2025 Contenders Draft', status: 'on-the-clock' },
  { pick: 5, round: 1, team: 'Jacksonville Jaguars', teamAbbr: 'JAX', player: 'Mason Graham', position: 'DL', school: 'Michigan', preValue: '$3–$10', postValueEst: '$15–$50', spike: 120, cardToBuy: 'Bowman University', cardSet: '2024 Bowman University', status: 'upcoming' },
  { pick: 6, round: 1, team: 'Las Vegas Raiders', teamAbbr: 'LV', player: 'Tetairoa McMillan', position: 'WR', school: 'Arizona', preValue: '$8–$25', postValueEst: '$40–$120', spike: 175, cardToBuy: 'Prizm Draft Silver', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
  { pick: 7, round: 1, team: 'New York Jets', teamAbbr: 'NYJ', player: 'Will Johnson', position: 'TE', school: 'Michigan', preValue: '$5–$15', postValueEst: '$20–$60', spike: 130, cardToBuy: 'Bowman University', cardSet: '2024 Bowman University', status: 'upcoming' },
  { pick: 8, round: 1, team: 'Carolina Panthers', teamAbbr: 'CAR', player: 'Ashton Jeanty', position: 'RB', school: 'Boise State', preValue: '$10–$30', postValueEst: '$50–$150', spike: 200, cardToBuy: 'Contenders Draft Auto', cardSet: '2025 Contenders Draft', status: 'upcoming' },
  { pick: 9, round: 1, team: 'New Orleans Saints', teamAbbr: 'NO', player: 'Tyler Warren', position: 'TE', school: 'Penn State', preValue: '$3–$10', postValueEst: '$12–$40', spike: 110, cardToBuy: 'Bowman University', cardSet: '2024 Bowman University', status: 'upcoming' },
  { pick: 10, round: 1, team: 'Chicago Bears', teamAbbr: 'CHI', player: 'Will Campbell', position: 'OL', school: 'LSU', preValue: '$2–$8', postValueEst: '$8–$25', spike: 90, cardToBuy: 'Bowman University Base', cardSet: '2024 Bowman University', status: 'upcoming' },
  { pick: 11, round: 1, team: 'San Francisco 49ers', teamAbbr: 'SF', player: 'Kelvin Banks Jr.', position: 'OL', school: 'Texas', preValue: '$2–$6', postValueEst: '$6–$20', spike: 85, cardToBuy: 'Bowman University', cardSet: '2024 Bowman University', status: 'upcoming' },
  { pick: 12, round: 1, team: 'Dallas Cowboys', teamAbbr: 'DAL', player: 'Mykel Williams', position: 'EDGE', school: 'Georgia', preValue: '$4–$12', postValueEst: '$15–$50', spike: 125, cardToBuy: 'Prizm Draft', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
  { pick: 13, round: 1, team: 'Miami Dolphins', teamAbbr: 'MIA', player: 'Jalon Walker', position: 'LB', school: 'Georgia', preValue: '$3–$10', postValueEst: '$10–$35', spike: 105, cardToBuy: 'Bowman University', cardSet: '2024 Bowman University', status: 'upcoming' },
  { pick: 14, round: 1, team: 'Indianapolis Colts', teamAbbr: 'IND', player: 'Luther Burden III', position: 'WR', school: 'Missouri', preValue: '$6–$20', postValueEst: '$30–$90', spike: 160, cardToBuy: 'Prizm Draft Silver', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
  { pick: 15, round: 1, team: 'Atlanta Falcons', teamAbbr: 'ATL', player: 'Colston Loveland', position: 'TE', school: 'Michigan', preValue: '$4–$12', postValueEst: '$15–$45', spike: 115, cardToBuy: 'Bowman University', cardSet: '2024 Bowman University', status: 'upcoming' },
  { pick: 16, round: 1, team: 'Arizona Cardinals', teamAbbr: 'ARI', player: 'Jaxson Dart', position: 'QB', school: 'Ole Miss', preValue: '$8–$25', postValueEst: '$35–$100', spike: 145, cardToBuy: 'Bowman University Chrome', cardSet: '2024 Bowman University', status: 'upcoming' },
];

const NBA_2025_MOCK: DraftPick[] = [
  { pick: 1, round: 1, team: 'Washington Wizards', teamAbbr: 'WAS', player: 'Cooper Flagg', position: 'PF/SF', school: 'Duke', preValue: '$30–$100', postValueEst: '$200–$800', spike: 350, cardToBuy: 'Prizm Draft RC', cardSet: '2025 Panini Prizm Draft', status: 'picked' },
  { pick: 2, round: 1, team: 'Charlotte Hornets', teamAbbr: 'CHA', player: 'Dylan Harper', position: 'SG', school: 'Rutgers', preValue: '$10–$30', postValueEst: '$50–$150', spike: 180, cardToBuy: 'Prizm Draft', cardSet: '2025 Panini Prizm Draft', status: 'picked' },
  { pick: 3, round: 1, team: 'Toronto Raptors', teamAbbr: 'TOR', player: 'Ace Bailey', position: 'SF', school: 'Rutgers', preValue: '$8–$25', postValueEst: '$40–$120', spike: 170, cardToBuy: 'Prizm Draft Silver', cardSet: '2025 Panini Prizm Draft', status: 'on-the-clock' },
  { pick: 4, round: 1, team: 'Portland Trail Blazers', teamAbbr: 'POR', player: 'VJ Edgecombe', position: 'SG', school: 'Baylor', preValue: '$5–$15', postValueEst: '$20–$60', spike: 130, cardToBuy: 'Prizm Draft', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
  { pick: 5, round: 1, team: 'Philadelphia 76ers', teamAbbr: 'PHI', player: 'Kon Knueppel', position: 'SG', school: 'Duke', preValue: '$4–$12', postValueEst: '$15–$50', spike: 120, cardToBuy: 'Prizm Draft', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
  { pick: 6, round: 1, team: 'Brooklyn Nets', teamAbbr: 'BKN', player: 'Nolan Traore', position: 'PG', school: 'France', preValue: '$4–$12', postValueEst: '$15–$45', spike: 115, cardToBuy: 'Prizm Draft', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
  { pick: 7, round: 1, team: 'Utah Jazz', teamAbbr: 'UTA', player: 'Egor Demin', position: 'PG', school: 'BYU', preValue: '$3–$10', postValueEst: '$12–$40', spike: 110, cardToBuy: 'Prizm Draft', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
  { pick: 8, round: 1, team: 'New Orleans Pelicans', teamAbbr: 'NOP', player: 'Liam McNeeley', position: 'SF', school: 'UConn', preValue: '$3–$10', postValueEst: '$10–$35', spike: 100, cardToBuy: 'Prizm Draft', cardSet: '2025 Panini Prizm Draft', status: 'upcoming' },
];

type Draft = 'nfl' | 'nba';

export default function DraftWarRoomClient() {
  const [activeDraft, setActiveDraft] = useState<Draft>('nfl');
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [showPortfolio, setShowPortfolio] = useState(false);

  const picks = activeDraft === 'nfl' ? NFL_2025_MOCK : NBA_2025_MOCK;
  const onClock = picks.find(p => p.status === 'on-the-clock');
  const picked = picks.filter(p => p.status === 'picked');
  const upcoming = picks.filter(p => p.status === 'upcoming');

  const togglePortfolio = (player: string) => {
    setPortfolio(prev =>
      prev.includes(player) ? prev.filter(p => p !== player) : [...prev, player]
    );
  };

  const portfolioValue = useMemo(() => {
    return picks.filter(p => portfolio.includes(p.player)).reduce((sum, p) => {
      const m = p.postValueEst.match(/\$([0-9,]+)/);
      return sum + (m ? parseInt(m[1].replace(/,/g, ''), 10) : 0);
    }, 0);
  }, [picks, portfolio]);

  const statusColors: Record<string, string> = {
    picked: 'border-emerald-700/40 bg-emerald-950/20',
    'on-the-clock': 'border-yellow-600/60 bg-yellow-950/30',
    upcoming: 'border-gray-700/40 bg-gray-900/60',
  };

  const spikeColor = (spike: number) => {
    if (spike >= 200) return 'text-red-400';
    if (spike >= 150) return 'text-orange-400';
    if (spike >= 100) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-8">
      {/* Draft selector */}
      <div className="flex gap-3">
        {[
          { value: 'nfl' as Draft, label: '2025 NFL Draft', date: 'Apr 24-26' },
          { value: 'nba' as Draft, label: '2025 NBA Draft', date: 'Jun 25-26' },
        ].map(d => (
          <button
            key={d.value}
            onClick={() => setActiveDraft(d.value)}
            className={`flex-1 py-3 px-4 rounded-xl border transition-colors text-center ${
              activeDraft === d.value
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <div className="font-bold text-sm">{d.label}</div>
            <div className="text-xs opacity-70">{d.date}</div>
          </button>
        ))}
      </div>

      {/* On The Clock */}
      {onClock && (
        <div className="bg-yellow-950/30 border-2 border-yellow-600/60 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">ON THE CLOCK</div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <div className="text-yellow-400 text-xs mb-1">Pick #{onClock.pick} - {onClock.team}</div>
              <h3 className="text-2xl font-bold text-white">{onClock.player}</h3>
              <div className="text-gray-400 text-sm">{onClock.position} - {onClock.school}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-500 text-xs">Card to Buy</div>
              <div className="text-white font-medium">{onClock.cardToBuy}</div>
              <div className="text-gray-500 text-xs mt-1">Pre-Draft: {onClock.preValue}</div>
              <div className={`font-bold ${spikeColor(onClock.spike)}`}>Post-Draft Est: {onClock.postValueEst}</div>
              <div className={`text-xs ${spikeColor(onClock.spike)}`}>+{onClock.spike}% spike expected</div>
            </div>
          </div>
          <button
            onClick={() => togglePortfolio(onClock.player)}
            className={`mt-4 text-sm px-4 py-2 rounded-lg border transition-colors ${
              portfolio.includes(onClock.player)
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-yellow-600'
            }`}
          >
            {portfolio.includes(onClock.player) ? 'In Portfolio' : 'Add to Draft Portfolio'}
          </button>
        </div>
      )}

      {/* Portfolio Strip */}
      {portfolio.length > 0 && (
        <div className="bg-gray-900 border border-emerald-800/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs">Your Draft Night Portfolio</div>
            <div className="text-white font-bold">{portfolio.length} player{portfolio.length !== 1 ? 's' : ''} tracked</div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-xs">Est. Portfolio Value</div>
            <div className="text-emerald-400 font-bold text-lg">${portfolioValue.toLocaleString()}+</div>
          </div>
          <button
            onClick={() => setShowPortfolio(!showPortfolio)}
            className="ml-4 text-sm px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:border-gray-600"
          >
            {showPortfolio ? 'Hide' : 'Show'}
          </button>
        </div>
      )}

      {showPortfolio && portfolio.length > 0 && (
        <div className="space-y-2">
          {picks.filter(p => portfolio.includes(p.player)).map(p => (
            <div key={p.player} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 flex justify-between items-center">
              <div>
                <span className="text-white text-sm font-medium">{p.player}</span>
                <span className="text-gray-500 text-xs ml-2">Pick #{p.pick} - {p.teamAbbr}</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${spikeColor(p.spike)}`}>{p.postValueEst}</div>
                <button onClick={() => togglePortfolio(p.player)} className="text-xs text-red-400/60 hover:text-red-400">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Already Picked */}
      {picked.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Already Picked</h3>
          <div className="space-y-2">
            {picked.map(p => (
              <div key={p.pick} className={`border rounded-xl p-4 ${statusColors.picked} flex flex-col sm:flex-row justify-between gap-3`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {p.pick}
                  </div>
                  <div>
                    <div className="text-white font-medium">{p.player} <span className="text-gray-500 text-xs">({p.position})</span></div>
                    <div className="text-gray-500 text-xs">{p.team} - {p.school}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <div className="text-gray-500 text-xs">Pre: {p.preValue}</div>
                    <div className={`text-sm font-bold ${spikeColor(p.spike)}`}>{p.postValueEst}</div>
                  </div>
                  <div className={`text-sm font-bold ${spikeColor(p.spike)}`}>+{p.spike}%</div>
                  <button
                    onClick={() => togglePortfolio(p.player)}
                    className={`text-xs px-2.5 py-1 rounded border ${
                      portfolio.includes(p.player)
                        ? 'border-emerald-700 text-emerald-400 bg-emerald-950/30'
                        : 'border-gray-700 text-gray-400 hover:border-emerald-700'
                    }`}
                  >
                    {portfolio.includes(p.player) ? 'Tracked' : 'Track'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Upcoming Picks</h3>
        <div className="space-y-2">
          {upcoming.map(p => (
            <div key={p.pick} className={`border rounded-xl p-4 ${statusColors.upcoming} flex flex-col sm:flex-row justify-between gap-3`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm">
                  {p.pick}
                </div>
                <div>
                  <div className="text-gray-300 font-medium">{p.player} <span className="text-gray-500 text-xs">({p.position})</span></div>
                  <div className="text-gray-600 text-xs">{p.team} - {p.school}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:text-right">
                <div>
                  <div className="text-gray-500 text-xs">Pre: {p.preValue}</div>
                  <div className="text-gray-400 text-xs">Post Est: {p.postValueEst}</div>
                </div>
                <div className={`text-xs ${spikeColor(p.spike)}`}>+{p.spike}%</div>
                <div className="text-gray-600 text-xs">{p.cardToBuy}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-3">Draft Night Buying Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <h4 className="text-white font-medium mb-2">Best Practices</h4>
            <ul className="space-y-1.5">
              <li>+ Buy BEFORE the pick is announced (pre-draft prices)</li>
              <li>+ QBs and skill positions see the biggest spikes</li>
              <li>+ First-round picks spike 100-350% on draft night</li>
              <li>+ Bowman University and Prizm Draft are the key sets</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Common Mistakes</h4>
            <ul className="space-y-1.5">
              <li>- Buying AFTER the pick (prices already spiked)</li>
              <li>- Overpaying in the first 30 minutes post-pick</li>
              <li>- Ignoring defensive players (lower spike, steadier hold)</li>
              <li>- Not having cards ready to sell into the hype</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cross-links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/tools/draft-predictor', label: 'Draft Night Predictor', desc: 'Full draft card analysis' },
          { href: '/tools/rookie-finder', label: 'Rookie Card Finder', desc: 'Find rookie cards by player' },
          { href: '/market-movers', label: 'Market Movers', desc: 'Real-time price changes' },
          { href: '/tools/watchlist', label: 'Price Watchlist', desc: 'Track cards you want' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-emerald-700 transition-colors group">
            <div className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{link.label}</div>
            <div className="text-gray-500 text-xs mt-1">{link.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
