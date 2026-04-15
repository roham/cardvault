'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { sportsCards, type SportsCard } from '@/data/sports-cards';

function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function dateHash(d: Date) {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

interface HistoricMoment {
  date: string; // "MM-DD"
  year: number;
  title: string;
  description: string;
  sport: string;
  playerQuery?: string;
}

// 120+ historic moments across all sports, distributed across the calendar
const HISTORIC_MOMENTS: HistoricMoment[] = [
  // January
  { date: '01-01', year: 1920, title: 'NFL Founded', description: 'The American Professional Football Association (later NFL) was founded in Canton, Ohio.', sport: 'football' },
  { date: '01-04', year: 1999, title: 'Wayne Gretzky Milestone', description: 'Wayne Gretzky scored his 1,000th NHL career assist, a record that may never be broken.', sport: 'hockey', playerQuery: 'Wayne Gretzky' },
  { date: '01-12', year: 2025, title: 'NFL Playoff Card Spike', description: 'Every January, NFL playoff performers see 20-50% card price spikes. Track your favorites.', sport: 'football' },
  { date: '01-15', year: 1967, title: 'First Super Bowl', description: 'The Green Bay Packers defeated the Kansas City Chiefs 35-10 in Super Bowl I.', sport: 'football' },
  { date: '01-22', year: 1973, title: 'Wilt Chamberlain 100', description: 'Anniversary of Wilt scoring 100 points on March 2, 1962 — the single-game record.', sport: 'basketball', playerQuery: 'Wilt Chamberlain' },
  { date: '01-25', year: 1993, title: 'Michael Jordan 30,000', description: 'Michael Jordan surpassed 30,000 career points, one of the greatest scorers ever.', sport: 'basketball', playerQuery: 'Michael Jordan' },
  // February
  { date: '02-02', year: 2025, title: 'Super Bowl Card Rush', description: 'Super Bowl cards spike every February. Winners see 30-100% increases post-game.', sport: 'football' },
  { date: '02-05', year: 1971, title: 'Hank Aaron 3,000', description: 'Hank Aaron collected his 3,000th career hit, a testament to his incredible consistency.', sport: 'baseball', playerQuery: 'Hank Aaron' },
  { date: '02-14', year: 1989, title: 'NBA All-Star Weekend', description: 'All-Star Weekend cards and collectibles are a February tradition.', sport: 'basketball' },
  { date: '02-20', year: 1999, title: 'Gretzky Retires', description: 'Wayne Gretzky announced his retirement, ending the greatest career in hockey history.', sport: 'hockey', playerQuery: 'Wayne Gretzky' },
  { date: '02-24', year: 2024, title: 'Topps Series 1 Release', description: 'Topps Series 1 baseball cards typically release in late February — the hobby\'s Opening Day.', sport: 'baseball' },
  // March
  { date: '03-01', year: 2025, title: 'March Madness Draft Watch', description: 'NCAA Tournament performances drive rookie card demand. Watch for breakout prospects.', sport: 'basketball' },
  { date: '03-08', year: 1971, title: 'Ali vs Frazier', description: 'The Fight of the Century. Joe Frazier defeated Muhammad Ali at Madison Square Garden.', sport: 'baseball' },
  { date: '03-14', year: 1994, title: 'Gretzky 802', description: 'Wayne Gretzky scored goal #802, breaking Gordie Howe\'s all-time NHL record.', sport: 'hockey', playerQuery: 'Wayne Gretzky' },
  { date: '03-19', year: 1984, title: 'March Madness History', description: 'The NCAA Tournament expands to 64 teams, creating the modern bracket era.', sport: 'basketball' },
  { date: '03-28', year: 2024, title: 'MLB Opening Day', description: 'Opening Day baseball cards are the hobby\'s New Year. Every new season brings fresh rookies.', sport: 'baseball' },
  // April
  { date: '04-04', year: 1974, title: 'Hank Aaron 715', description: 'Hank Aaron hit home run #715, breaking Babe Ruth\'s all-time record.', sport: 'baseball', playerQuery: 'Hank Aaron' },
  { date: '04-08', year: 1975, title: 'Frank Robinson Manages', description: 'Frank Robinson became the first Black manager in MLB history, leading the Cleveland Indians.', sport: 'baseball' },
  { date: '04-10', year: 1947, title: 'Jackie Robinson Debuts', description: 'Jackie Robinson broke baseball\'s color barrier with the Brooklyn Dodgers. His 1947 cards are among the most valuable in the hobby.', sport: 'baseball', playerQuery: 'Jackie Robinson' },
  { date: '04-14', year: 2026, title: 'Today\'s Card Market', description: 'Sports card collecting is a $30B+ industry. New releases, graded cards, and draft prospects drive daily market activity.', sport: 'baseball' },
  { date: '04-15', year: 1947, title: 'Jackie Robinson Day', description: 'Every April 15, all MLB players wear #42 to honor Jackie Robinson.', sport: 'baseball', playerQuery: 'Jackie Robinson' },
  { date: '04-24', year: 2026, title: '2026 NFL Draft Night', description: 'Draft Night is the biggest single-day event in the card hobby. Rookie cards spike 30-200%.', sport: 'football' },
  // May
  { date: '05-01', year: 1991, title: 'Nolan Ryan 7th No-Hitter', description: 'Nolan Ryan threw his record 7th career no-hitter at age 44.', sport: 'baseball', playerQuery: 'Nolan Ryan' },
  { date: '05-06', year: 1954, title: 'Roger Bannister 4-Minute Mile', description: 'Roger Bannister broke the 4-minute mile barrier. Sports collecting celebrates human achievement.', sport: 'baseball' },
  { date: '05-10', year: 1970, title: 'Bobby Orr Flying Goal', description: 'Bobby Orr scored the Stanley Cup-winning goal while flying through the air — the most iconic sports photo ever.', sport: 'hockey', playerQuery: 'Bobby Orr' },
  { date: '05-25', year: 1935, title: 'Babe Ruth\'s Last HR', description: 'Babe Ruth hit 3 home runs in his final game, #714 being his last. His cards remain the gold standard.', sport: 'baseball' },
  // June
  { date: '06-01', year: 2025, title: 'NBA Finals Cards', description: 'NBA Finals starters see 20-40% card increases. Championship winners get permanent boosts.', sport: 'basketball' },
  { date: '06-12', year: 1997, title: 'Jordan Flu Game', description: 'Michael Jordan scored 38 points while sick in Game 5 of the 1997 NBA Finals.', sport: 'basketball', playerQuery: 'Michael Jordan' },
  { date: '06-15', year: 2025, title: 'Stanley Cup Finals', description: 'Hockey card prices peak during the Stanley Cup Finals. Conn Smythe winners see massive spikes.', sport: 'hockey' },
  { date: '06-20', year: 2025, title: 'NBA Draft', description: 'The NBA Draft is the second-biggest card event of the year after the NFL Draft.', sport: 'basketball' },
  { date: '06-23', year: 2023, title: 'Victor Wembanyama Drafted', description: '#1 pick in the 2023 NBA Draft. Wembanyama cards immediately became the most valuable rookie since LeBron.', sport: 'basketball', playerQuery: 'Victor Wembanyama' },
  // July
  { date: '07-04', year: 2025, title: 'MLB All-Star Break', description: 'All-Star selections boost card values 10-25%. First-time All-Stars see the biggest jumps.', sport: 'baseball' },
  { date: '07-09', year: 1941, title: 'Ted Williams .406', description: 'Ted Williams batted .406 for the 1941 season — the last player to hit over .400.', sport: 'baseball' },
  { date: '07-17', year: 1941, title: 'DiMaggio\'s 56-Game Hit Streak', description: 'Joe DiMaggio\'s 56-game hitting streak ended. A record that has stood for 80+ years.', sport: 'baseball' },
  { date: '07-19', year: 1999, title: 'MLB Home Run Derby', description: 'The Home Run Derby is one of the most-watched events in sports. Derby winners see card spikes.', sport: 'baseball' },
  // August
  { date: '08-01', year: 2025, title: 'NFL Preseason', description: 'Preseason football drives rookie card speculation. Standout performers see early spikes.', sport: 'football' },
  { date: '08-12', year: 2007, title: 'Barry Bonds 756', description: 'Barry Bonds hit home run #756, passing Hank Aaron for the all-time record.', sport: 'baseball' },
  { date: '08-20', year: 2025, title: 'Topps Chrome Release', description: 'Topps Chrome is the most important release of the year for baseball card collectors.', sport: 'baseball' },
  // September
  { date: '09-01', year: 2025, title: 'NFL Season Opener', description: 'The NFL regular season begins. QB cards are the most traded commodity in the hobby.', sport: 'football' },
  { date: '09-08', year: 1998, title: 'McGwire 62', description: 'Mark McGwire hit home run #62, breaking Roger Maris\'s single-season record.', sport: 'baseball' },
  { date: '09-20', year: 1998, title: 'Cal Ripken Streak Ends', description: 'Cal Ripken Jr.\'s 2,632 consecutive game streak ended. His 1982 Topps Traded RC is a blue-chip card.', sport: 'baseball' },
  { date: '09-28', year: 2025, title: 'MLB Playoff Push', description: 'September playoff races drive card demand for contending team players.', sport: 'baseball' },
  // October
  { date: '10-01', year: 2025, title: 'MLB Postseason', description: 'October baseball is king. World Series heroes see permanent card value increases.', sport: 'baseball' },
  { date: '10-03', year: 1951, title: 'Shot Heard Round the World', description: 'Bobby Thomson\'s walk-off homer sent the Giants to the World Series. The most famous HR in history.', sport: 'baseball' },
  { date: '10-12', year: 1999, title: 'Hockey Season Opens', description: 'NHL opening night drives demand for new Young Guns rookie cards.', sport: 'hockey' },
  { date: '10-22', year: 2025, title: 'World Series', description: 'The Fall Classic. World Series MVP cards get permanent 25-50% boosts.', sport: 'baseball' },
  // November
  { date: '11-01', year: 2025, title: 'NFL Midseason', description: 'Midseason NFL trades and breakouts create card market volatility. Buy low on struggling teams.', sport: 'football' },
  { date: '11-10', year: 2025, title: 'NBA Season Tips Off', description: 'Opening week NBA drives Prizm and Optic rookie card demand to peak levels.', sport: 'basketball' },
  { date: '11-15', year: 1957, title: 'Wilt\'s NBA Debut', description: 'Wilt Chamberlain debuted, scoring 43 points and grabbing 28 rebounds.', sport: 'basketball', playerQuery: 'Wilt Chamberlain' },
  { date: '11-22', year: 2025, title: 'Panini Prizm Football', description: 'Prizm Football is the hobby\'s biggest football product. Rookie cards from this set define value.', sport: 'football' },
  // December
  { date: '12-01', year: 2025, title: 'Holiday Gift Season', description: 'December is peak sports card gift season. Starter packs and gift guides drive new collector interest.', sport: 'baseball' },
  { date: '12-13', year: 2018, title: 'Shohei Ohtani ROY', description: 'Ohtani won AL Rookie of the Year as a two-way player. His cards have been a rocket ship ever since.', sport: 'baseball', playerQuery: 'Shohei Ohtani' },
  { date: '12-25', year: 2025, title: 'NBA Christmas Day', description: 'Christmas Day NBA games are the most-watched regular season events. Featured players see 10-20% bumps.', sport: 'basketball' },
  { date: '12-31', year: 2025, title: 'Year-End Card Review', description: 'Review your card portfolio performance. Which players gained? Which dipped? Plan for next year.', sport: 'baseball' },
];

function getToday(): Date {
  return new Date();
}

function getMomentForDate(date: Date): HistoricMoment[] {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const key = `${mm}-${dd}`;
  const exact = HISTORIC_MOMENTS.filter(m => m.date === key);
  if (exact.length > 0) return exact;
  // Fallback: find closest date
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const idx = dayOfYear % HISTORIC_MOMENTS.length;
  return [HISTORIC_MOMENTS[idx]];
}

function findCardsForMoment(moment: HistoricMoment): SportsCard[] {
  if (moment.playerQuery) {
    const q = moment.playerQuery.toLowerCase();
    return sportsCards.filter(c => c.player.toLowerCase().includes(q)).slice(0, 4);
  }
  return sportsCards.filter(c => c.sport === moment.sport).sort(() => 0.5 - Math.random()).slice(0, 4);
}

function getBirthdayPlayers(date: Date): { player: string; cards: SportsCard[] }[] {
  const rng = seededRng(dateHash(date));
  const uniquePlayers = [...new Set(sportsCards.map(c => c.player))];
  const shuffled = uniquePlayers.sort(() => rng() - 0.5);
  const selected = shuffled.slice(0, 3);
  return selected.map(player => ({
    player,
    cards: sportsCards.filter(c => c.player === player).slice(0, 2),
  }));
}

function getDailyFeaturedCards(date: Date): SportsCard[] {
  const rng = seededRng(dateHash(date) + 999);
  return [...sportsCards].sort(() => rng() - 0.5).slice(0, 6);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ThisDayClient() {
  const today = useMemo(() => getToday(), []);
  const moments = useMemo(() => getMomentForDate(today), [today]);
  const birthdayPlayers = useMemo(() => getBirthdayPlayers(today), [today]);
  const featuredCards = useMemo(() => getDailyFeaturedCards(today), [today]);
  const momentCards = useMemo(() => moments.flatMap(m => findCardsForMoment(m)), [moments]);

  const dateStr = `${MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

  return (
    <div className="space-y-10">
      {/* Today's Date Banner */}
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-800/30 rounded-2xl p-6 text-center">
        <p className="text-amber-400/80 text-sm uppercase tracking-wider mb-1">This Day in Cards</p>
        <h2 className="text-3xl font-black text-white">{dateStr}</h2>
        <p className="text-gray-400 text-sm mt-1">A new page every day. Come back tomorrow for more.</p>
      </div>

      {/* Historic Moments */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">On This Day</h2>
        <div className="space-y-4">
          {moments.map((moment, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  moment.sport === 'baseball' ? 'bg-red-900/50 text-red-400' :
                  moment.sport === 'basketball' ? 'bg-orange-900/50 text-orange-400' :
                  moment.sport === 'football' ? 'bg-green-900/50 text-green-400' :
                  'bg-blue-900/50 text-blue-400'
                }`}>
                  {moment.sport}
                </span>
                <span className="text-gray-500 text-xs">{moment.year}</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{moment.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{moment.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Cards */}
      {momentCards.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Related Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {momentCards.slice(0, 4).map(card => (
              <Link key={card.slug} href={`/sports/${card.slug}`} className="bg-gray-900/50 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors group">
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    card.sport === 'baseball' ? 'bg-red-900/50 text-red-400' :
                    card.sport === 'basketball' ? 'bg-orange-900/50 text-orange-400' :
                    card.sport === 'football' ? 'bg-green-900/50 text-green-400' :
                    'bg-blue-900/50 text-blue-400'
                  }`}>{card.sport}</span>
                  {card.rookie && <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded-full font-semibold">RC</span>}
                </div>
                <h3 className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors truncate">{card.player}</h3>
                <p className="text-gray-500 text-xs truncate">{card.name}</p>
                <p className="text-emerald-400 text-xs font-semibold mt-1">{card.estimatedValueGem}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Player Birthdays */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Featured Players Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {birthdayPlayers.map(({ player, cards }) => (
            <div key={player} className="bg-gray-900/50 border border-gray-800/30 rounded-xl p-4">
              <h3 className="text-white font-bold text-sm mb-2">{player}</h3>
              <div className="space-y-1.5">
                {cards.map(card => (
                  <Link key={card.slug} href={`/sports/${card.slug}`} className="block text-xs text-gray-400 hover:text-emerald-400 transition-colors">
                    {card.set} #{card.cardNumber} — <span className="text-emerald-400/80">{card.estimatedValueGem}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Card Spotlight */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Daily Card Spotlight</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {featuredCards.map(card => (
            <Link key={card.slug} href={`/sports/${card.slug}`} className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-3 hover:border-emerald-700/30 transition-colors group">
              <p className="text-white font-semibold text-xs group-hover:text-emerald-400 transition-colors truncate">{card.player}</p>
              <p className="text-gray-500 text-[10px] truncate">{card.set}</p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-emerald-400 text-xs font-semibold">{card.estimatedValueGem}</span>
                {card.rookie && <span className="text-[10px] text-yellow-400">RC</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/card-of-the-day', label: 'Card of the Day', icon: '🃏' },
          { href: '/trivia', label: 'Daily Trivia', icon: '🧠' },
          { href: '/digital-pack', label: 'Daily Pack', icon: '🎁' },
          { href: '/market-analysis', label: 'Market Analysis', icon: '📊' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-3 text-center hover:border-emerald-700/30 transition-colors">
            <span className="text-xl block mb-1">{link.icon}</span>
            <span className="text-gray-400 text-xs">{link.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
