'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type WeatherCondition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy';
type AlertLevel = 'calm' | 'watch' | 'advisory' | 'storm';

interface SportWeather {
  sport: string;
  icon: string;
  condition: WeatherCondition;
  temperature: number; // -100 to 100
  trend: 'rising' | 'falling' | 'steady';
  headline: string;
  detail: string;
}

interface ForecastDay {
  day: string;
  date: string;
  events: string[];
  outlook: WeatherCondition;
  impact: string;
}

const WEATHER_ICONS: Record<WeatherCondition, { icon: string; label: string; color: string; bg: string }> = {
  'sunny': { icon: '☀️', label: 'Sunny', color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/40' },
  'partly-cloudy': { icon: '⛅', label: 'Partly Cloudy', color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-800/40' },
  'cloudy': { icon: '☁️', label: 'Cloudy', color: 'text-slate-400', bg: 'bg-slate-800/30 border-slate-600/40' },
  'rainy': { icon: '🌧️', label: 'Rainy', color: 'text-blue-400', bg: 'bg-blue-950/30 border-blue-800/40' },
  'stormy': { icon: '⛈️', label: 'Stormy', color: 'text-purple-400', bg: 'bg-purple-950/30 border-purple-800/40' },
};

const ALERT_CONFIG: Record<AlertLevel, { icon: string; label: string; color: string; bg: string; description: string }> = {
  'calm': { icon: '🟢', label: 'All Clear', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40', description: 'Normal trading conditions. No major catalysts on the immediate horizon.' },
  'watch': { icon: '🟡', label: 'Market Watch', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40', description: 'Upcoming events may cause price volatility. Stay informed and set alerts.' },
  'advisory': { icon: '🟠', label: 'Advisory', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/40', description: 'Active catalysts in play. Expect elevated price movement across multiple sports.' },
  'storm': { icon: '🔴', label: 'Storm Warning', color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/40', description: 'Major market event in progress. Prices are swinging. Proceed with strategy, not emotion.' },
};

function hashDay(offset: number): number {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const str = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getMonthSeason(): { month: number; dayOfMonth: number } {
  const now = new Date();
  return { month: now.getMonth(), dayOfMonth: now.getDate() };
}

function getSportWeather(): SportWeather[] {
  const { month, dayOfMonth } = getMonthSeason();
  const dailyHash = hashDay(0);

  // Seasonal base conditions per sport per month
  const seasonalData: Record<string, WeatherCondition[]> = {
    baseball: ['cloudy', 'cloudy', 'partly-cloudy', 'sunny', 'partly-cloudy', 'partly-cloudy', 'sunny', 'sunny', 'sunny', 'sunny', 'cloudy', 'cloudy'],
    basketball: ['partly-cloudy', 'sunny', 'sunny', 'sunny', 'sunny', 'sunny', 'cloudy', 'rainy', 'rainy', 'sunny', 'partly-cloudy', 'sunny'],
    football: ['sunny', 'stormy', 'partly-cloudy', 'stormy', 'rainy', 'cloudy', 'cloudy', 'partly-cloudy', 'stormy', 'sunny', 'sunny', 'sunny'],
    hockey: ['partly-cloudy', 'partly-cloudy', 'sunny', 'sunny', 'sunny', 'sunny', 'rainy', 'rainy', 'rainy', 'sunny', 'partly-cloudy', 'partly-cloudy'],
  };

  // Temperature ranges per sport per month (-100 to 100)
  const tempRanges: Record<string, number[]> = {
    baseball: [-30, -20, 10, 70, 40, 35, 75, 60, 65, 80, -15, -25],
    basketball: [30, 70, 75, 65, 80, 85, -20, -40, -35, 60, 40, 65],
    football: [80, 90, 20, 85, -10, -25, -15, 15, 90, 55, 75, 70],
    hockey: [35, 40, 60, 65, 75, 80, -30, -45, -40, 55, 35, 30],
  };

  const headlines: Record<string, string[]> = {
    baseball: ['Off-season quiet', 'Spring Training buzz building', 'Spring Training underway', 'Opening Day energy', 'Early season storylines forming', 'Mid-season settling', 'All-Star fever', 'Trade deadline volatility', 'Playoff race heating up', 'Postseason action', 'Award season', 'Hot Stove simmering'],
    basketball: ['Mid-season grind', 'All-Star Weekend approaching', 'March Madness mania', 'Playoff intensity rising', 'Conference Finals drama', 'Finals showdown', 'Summer League scouting', 'Deep off-season', 'Training camp previews', 'Season tip-off', 'Early season surprises', 'Christmas showcase'],
    football: ['Playoff intensity at peak', 'Super Bowl week', 'Free agency frenzy settling', 'Draft fever building', 'Post-draft settling', 'OTA speculation', 'Training camp buzz', 'Preseason evaluation', 'Season opener hype', 'Mid-season form', 'MVP race forming', 'Playoff picture crystallizing'],
    hockey: ['Mid-season action', 'Trade deadline approaching', 'Trade deadline passed', 'Playoff push', 'Conference Finals', 'Stanley Cup Finals', 'Off-season moves', 'Deep summer quiet', 'Preseason warmup', 'Season opening night', 'Early season trends', 'Mid-season check-in'],
  };

  const details: Record<string, string[]> = {
    baseball: [
      'Card prices at annual lows. Smart buyers are accumulating stars and rookies ahead of spring.',
      'Early spring training news starts moving cards of players in new situations. Watch for position battles.',
      'Spring training performance creating early buzz. Exhibition stats don\'t matter, but narrative does.',
      'Maximum attention on baseball. Opening Day lineups finalized. Rookie debuts spike card prices.',
      'Early performance separating contenders from pretenders. Breakout players seeing card movement.',
      'Market settling into patterns. Draft adds new prospect names. Trade rumors starting.',
      'All-Star selections spike featured player cards. Second-half storylines emerging.',
      'Trade deadline is the single biggest baseball card catalyst of the year. Traded stars spike 15-25%.',
      'Playoff races creating urgency. Contender cards rising, also-ran cards falling.',
      'Postseason heroes see massive spikes. World Series MVP cards can double overnight.',
      'Award announcements create brief spikes. Off-season preparation begins.',
      'Free agent signings spike whole-team card interest. New team = new collector base.',
    ],
    basketball: [
      'Season in full swing. Mid-season trades creating opportunities in undervalued cards.',
      'All-Star Weekend drives maximum basketball card attention. Featured players spike 10-20%.',
      'March Madness has fans watching college stars. Draft prospect cards in play for first time.',
      'Playoff basketball is premium content. First-round upsets create surprise card movement.',
      'Conference Finals narrow attention to 4 teams. Star players at peak card demand.',
      'NBA Finals is the biggest basketball card event. Championship winners spike 30-50%.',
      'Summer League provides first look at rookies. Early standouts see card movement.',
      'Deepest off-season point. Prices at annual lows. Best buying window for basketball.',
      'Training camp and preseason start building anticipation. Roster moves create opportunities.',
      'Opening night always drives attention. National TV games spike featured player cards.',
      'Early season surprises and disappointments moving cards. Breakout candidates emerging.',
      'Christmas Day games are the NBA\'s showcase. Featured matchups spike star player demand.',
    ],
    football: [
      'NFL Playoffs creating highest football card demand of the year. Winning QBs spike huge.',
      'Super Bowl is the biggest single-event catalyst in all of cards. Winner cards spike 30-50%.',
      'Free agency moves change team contexts. Stars in new places get new collector attention.',
      'NFL Draft is THE event for football card prices. Top picks spike 50-200% on draft night.',
      'Post-draft settling. Hype premium fading. Smart buyers accumulating picks who fell.',
      'OTA reports and minicamp highlights. Rookie hype building but no real action yet.',
      'Training camp opens. Position battles and rookie standouts start generating buzz.',
      'Preseason games give first real footage. Rookie performers see early card movement.',
      'Week 1 is the second-biggest football card event. Breakout performers spike 50-100%.',
      'Season in full swing. Weekly performances driving card prices up and down.',
      'MVP race and playoff positioning creating premium demand for star players.',
      'Playoff picture forming. Contender cards rising. Fantasy football driving collector interest.',
    ],
    hockey: [
      'Mid-season hockey. Steady demand with occasional spikes from highlight performances.',
      'Trade deadline approaching. Rental players to contenders see card spikes.',
      'Post-deadline settling. New team contexts creating card opportunities.',
      'Playoff hockey begins. Intensity rises. Goalie cards especially volatile during playoffs.',
      'Conference Finals narrowing attention. Star players at peak hockey card demand.',
      'Stanley Cup Finals. Championship winner cards spike significantly.',
      'Off-season moves and draft. New picks getting first card attention.',
      'Deep summer. Hockey card prices at absolute lowest. Prime buying opportunity.',
      'Preseason starting. New rosters generating buzz. Rookie camp standouts emerging.',
      'Opening night energy. New season narratives forming. Early standout performances.',
      'Settling into season. Young stars and breakout players driving card attention.',
      'Mid-season checkpoint. All-Star selections approaching. Trade rumors beginning.',
    ],
  };

  const sports = ['baseball', 'basketball', 'football', 'hockey'];
  const sportIcons: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };

  // Add daily variance to temperature
  const variance = ((dailyHash % 21) - 10); // -10 to +10

  return sports.map(sport => {
    const baseTemp = tempRanges[sport][month];
    const temp = Math.max(-100, Math.min(100, baseTemp + variance));
    const prevTemp = tempRanges[sport][(month + 11) % 12];
    const trend: 'rising' | 'falling' | 'steady' = baseTemp > prevTemp + 10 ? 'rising' : baseTemp < prevTemp - 10 ? 'falling' : 'steady';

    return {
      sport: sport.charAt(0).toUpperCase() + sport.slice(1),
      icon: sportIcons[sport],
      condition: seasonalData[sport][month],
      temperature: temp,
      trend,
      headline: headlines[sport][month],
      detail: details[sport][month],
    };
  });
}

function getForecast(): ForecastDay[] {
  const { month } = getMonthSeason();
  const days: ForecastDay[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Major events by month-day ranges (approximate)
  const majorEvents: Record<number, { event: string; dayRange: [number, number] }[]> = {
    0: [{ event: 'NFL Divisional Round', dayRange: [15, 20] }, { event: 'NFL Conference Championships', dayRange: [23, 28] }, { event: 'NHL Winter Classic', dayRange: [1, 3] }],
    1: [{ event: 'Super Bowl', dayRange: [7, 11] }, { event: 'NBA All-Star Weekend', dayRange: [12, 18] }, { event: 'Spring Training Opens', dayRange: [15, 22] }],
    2: [{ event: 'March Madness', dayRange: [15, 31] }, { event: 'NHL Trade Deadline', dayRange: [5, 9] }, { event: 'NFL Free Agency', dayRange: [10, 15] }],
    3: [{ event: 'MLB Opening Day', dayRange: [1, 5] }, { event: 'NBA Playoffs Start', dayRange: [17, 21] }, { event: 'NFL Draft', dayRange: [22, 28] }, { event: 'NHL Playoffs Start', dayRange: [17, 21] }],
    4: [{ event: 'NBA Conference Finals', dayRange: [13, 25] }, { event: 'NHL Conference Finals', dayRange: [13, 25] }],
    5: [{ event: 'NBA Finals', dayRange: [3, 24] }, { event: 'Stanley Cup Finals', dayRange: [5, 27] }, { event: 'MLB Draft', dayRange: [13, 19] }],
    6: [{ event: 'MLB All-Star Game', dayRange: [13, 17] }, { event: 'NBA Summer League', dayRange: [10, 23] }, { event: 'NFL Training Camp', dayRange: [21, 28] }],
    7: [{ event: 'MLB Trade Deadline', dayRange: [28, 31] }, { event: 'NFL Preseason', dayRange: [1, 26] }],
    8: [{ event: 'NFL Season Opener', dayRange: [3, 8] }, { event: 'MLB Playoff Race', dayRange: [15, 30] }],
    9: [{ event: 'MLB Postseason', dayRange: [1, 31] }, { event: 'NBA Season Opens', dayRange: [19, 25] }, { event: 'NHL Season Opens', dayRange: [5, 10] }],
    10: [{ event: 'MLB Awards', dayRange: [15, 23] }, { event: 'NFL MVP Race', dayRange: [1, 30] }, { event: 'Black Friday Deals', dayRange: [25, 30] }],
    11: [{ event: 'NBA Christmas Games', dayRange: [23, 27] }, { event: 'NFL Playoff Picture', dayRange: [20, 31] }, { event: 'Holiday Gift Season', dayRange: [10, 25] }],
  };

  const conditions: WeatherCondition[] = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy'];

  for (let i = 1; i <= 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfMonth = d.getDate();
    const forecastMonth = d.getMonth();
    const h = hashDay(i);

    // Check for events on this day
    const activeEvents = (majorEvents[forecastMonth] || [])
      .filter(e => dayOfMonth >= e.dayRange[0] && dayOfMonth <= e.dayRange[1])
      .map(e => e.event);

    // Determine outlook based on events and base hash
    const hasHighImpact = activeEvents.length > 1;
    const baseIdx = h % 5;
    const condIdx = hasHighImpact ? Math.min(baseIdx + 1, 4) : Math.max(0, Math.min(baseIdx, 3));

    const impacts = [
      'Steady conditions expected. Normal trading volumes.',
      'Light activity. No major catalysts in view.',
      'Moderate buzz. Keep an eye on trending cards.',
      'Elevated activity from ongoing events. Prices may swing.',
      'High-impact event day. Expect significant price movement.',
    ];

    days.push({
      day: dayNames[d.getDay()],
      date: `${forecastMonth + 1}/${dayOfMonth}`,
      events: activeEvents.length > 0 ? activeEvents : ['No major events'],
      outlook: conditions[condIdx],
      impact: activeEvents.length > 1 ? impacts[4] : activeEvents.length === 1 && activeEvents[0] !== 'No major events' ? impacts[3] : impacts[h % 3],
    });
  }

  return days;
}

function getAlertLevel(): AlertLevel {
  const { month, dayOfMonth } = getMonthSeason();

  // Storm: Draft week, Super Bowl week, Finals weeks
  if ((month === 3 && dayOfMonth >= 22 && dayOfMonth <= 28)) return 'storm'; // NFL Draft
  if ((month === 1 && dayOfMonth >= 7 && dayOfMonth <= 11)) return 'storm'; // Super Bowl
  if ((month === 5 && dayOfMonth >= 3 && dayOfMonth <= 24)) return 'advisory'; // NBA Finals
  if ((month === 5 && dayOfMonth >= 5 && dayOfMonth <= 27)) return 'advisory'; // Stanley Cup

  // Advisory: Playoffs starting, trade deadlines
  if (month === 3 && dayOfMonth >= 17) return 'advisory'; // Playoffs starting
  if (month === 2 && dayOfMonth >= 5 && dayOfMonth <= 9) return 'advisory'; // NHL trade deadline
  if (month === 8 && dayOfMonth <= 8) return 'advisory'; // NFL season opener

  // Watch: Active seasons with multiple sports
  if (month === 9 || month === 3 || month === 4) return 'watch'; // Multi-sport active months

  return 'calm';
}

function TempGauge({ temp, label }: { temp: number; label: string }) {
  const pct = ((temp + 100) / 200) * 100;
  const color = temp > 50 ? 'bg-red-500' : temp > 20 ? 'bg-orange-500' : temp > -20 ? 'bg-amber-500' : temp > -50 ? 'bg-blue-400' : 'bg-blue-600';

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-white/40 w-8 text-right">-100</span>
      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden relative">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-white/30"
          style={{ left: '50%' }}
        />
      </div>
      <span className="text-xs text-white/40 w-8">+100</span>
      <span className={`text-sm font-bold w-12 text-right ${temp > 20 ? 'text-red-400' : temp > -20 ? 'text-amber-400' : 'text-blue-400'}`}>
        {temp > 0 ? '+' : ''}{temp}
      </span>
    </div>
  );
}

export default function MarketWeatherClient() {
  const sportWeather = useMemo(() => getSportWeather(), []);
  const forecast = useMemo(() => getForecast(), []);
  const alertLevel = useMemo(() => getAlertLevel(), []);
  const [expandedSport, setExpandedSport] = useState<string | null>(null);

  const alert = ALERT_CONFIG[alertLevel];

  // Overall market temperature (average of all sports)
  const overallTemp = Math.round(sportWeather.reduce((sum, s) => sum + s.temperature, 0) / sportWeather.length);

  return (
    <div className="space-y-8">
      {/* Alert Banner */}
      <div className={`p-4 rounded-xl border ${alert.bg} flex items-start gap-3`}>
        <span className="text-2xl flex-shrink-0">{alert.icon}</span>
        <div>
          <div className={`text-sm font-bold ${alert.color}`}>Current Status: {alert.label}</div>
          <p className="text-sm text-white/60 mt-1">{alert.description}</p>
        </div>
      </div>

      {/* Overall Market Temperature */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Overall Market Temperature</h2>
            <p className="text-sm text-white/50">Composite reading across all four major sports</p>
          </div>
          <div className={`text-4xl font-bold ${overallTemp > 20 ? 'text-red-400' : overallTemp > -20 ? 'text-amber-400' : 'text-blue-400'}`}>
            {overallTemp > 0 ? '+' : ''}{overallTemp}°
          </div>
        </div>
        <TempGauge temp={overallTemp} label="Overall" />
      </div>

      {/* Sport Weather Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sportWeather.map(sw => {
          const weather = WEATHER_ICONS[sw.condition];
          const isExpanded = expandedSport === sw.sport;

          return (
            <button
              key={sw.sport}
              onClick={() => setExpandedSport(isExpanded ? null : sw.sport)}
              className={`text-left p-5 rounded-2xl border transition-all ${weather.bg} ${isExpanded ? 'ring-1 ring-white/20' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sw.icon}</span>
                  <span className="text-lg font-bold text-white">{sw.sport}</span>
                </div>
                <span className="text-3xl">{weather.icon}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-semibold ${weather.color}`}>{weather.label}</span>
                <span className="text-white/30">|</span>
                <span className={`text-xs ${sw.trend === 'rising' ? 'text-emerald-400' : sw.trend === 'falling' ? 'text-red-400' : 'text-amber-400'}`}>
                  {sw.trend === 'rising' ? '↑ Rising' : sw.trend === 'falling' ? '↓ Falling' : '→ Steady'}
                </span>
              </div>
              <p className="text-sm font-medium text-white/80 mb-3">{sw.headline}</p>
              <TempGauge temp={sw.temperature} label={sw.sport} />

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-white/70 leading-relaxed">{sw.detail}</p>
                </div>
              )}

              <div className="mt-2 text-[10px] text-white/30">
                {isExpanded ? 'Tap to collapse' : 'Tap for details'}
              </div>
            </button>
          );
        })}
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">5-Day Market Forecast</h2>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {forecast.map((day, i) => {
            const weather = WEATHER_ICONS[day.outlook];
            return (
              <div key={i} className={`p-3 rounded-xl border ${weather.bg} text-center`}>
                <div className="text-xs font-semibold text-white/60 mb-1">{day.day}</div>
                <div className="text-xs text-white/40 mb-2">{day.date}</div>
                <div className="text-2xl mb-1">{weather.icon}</div>
                <div className={`text-[10px] font-semibold ${weather.color} mb-2`}>{weather.label}</div>
                <div className="text-[9px] text-white/50 leading-tight">
                  {day.events[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Meteorologist Commentary */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🎙️</span>
          <div>
            <h2 className="text-xl font-bold text-white">Market Meteorologist</h2>
            <p className="text-xs text-white/40">Daily analysis from the CardVault weather desk</p>
          </div>
        </div>
        <div className="space-y-4">
          {sportWeather.map(sw => (
            <div key={sw.sport} className="flex gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <span className="text-xl flex-shrink-0">{sw.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white/90">{sw.sport}: {sw.headline}</div>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">{sw.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Legend */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3">Weather Legend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.entries(WEATHER_ICONS) as [WeatherCondition, typeof WEATHER_ICONS[WeatherCondition]][]).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-lg">{val.icon}</span>
              <div>
                <div className={`text-xs font-semibold ${val.color}`}>{val.label}</div>
                <div className="text-[10px] text-white/40">
                  {key === 'sunny' && 'High demand, prices up'}
                  {key === 'partly-cloudy' && 'Moderate activity'}
                  {key === 'cloudy' && 'Quiet market'}
                  {key === 'rainy' && 'Low demand, prices dip'}
                  {key === 'stormy' && 'High volatility'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Related Market Intelligence</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/seasonal-calendar', title: 'Seasonal Calendar', desc: 'Month-by-month buy/sell/hold signals' },
            { href: '/market-analysis', title: 'Daily Analysis', desc: 'What moved today and why' },
            { href: '/market-movers', title: 'Market Movers', desc: 'Today\'s biggest gainers and losers' },
            { href: '/market-heatmap', title: 'Market Heat Map', desc: 'Visual segment temperatures' },
            { href: '/market-pulse', title: 'Market Pulse', desc: 'Live market activity dashboard' },
            { href: '/ticker', title: 'Live Ticker', desc: 'Scrolling real-time card prices' },
            { href: '/card-catalysts', title: 'Price Catalysts', desc: 'Events that move card prices' },
            { href: '/market-sentiment', title: 'Market Sentiment', desc: 'Community mood index' },
            { href: '/investment-thesis', title: 'Investment Thesis', desc: 'Bull/bear case for any card' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/90">{link.title}</div>
                <div className="text-xs text-white/50">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
