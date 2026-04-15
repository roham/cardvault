'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
type Sport = 'all' | 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon';
type Signal = 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell';

interface MonthData {
  month: string;
  shortMonth: string;
  signal: Signal;
  reason: string;
  keyEvents: string[];
  tip: string;
}

interface SportSeason {
  sport: Sport;
  label: string;
  icon: string;
  color: string;
  months: MonthData[];
}

/* ───── Signal styling ───── */
const signalConfig: Record<Signal, { label: string; bg: string; text: string; dot: string }> = {
  'strong-buy':  { label: 'Strong Buy',  bg: 'bg-emerald-900/60', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  'buy':         { label: 'Buy',         bg: 'bg-green-900/40',   text: 'text-green-300',   dot: 'bg-green-400' },
  'hold':        { label: 'Hold',        bg: 'bg-yellow-900/40',  text: 'text-yellow-300',  dot: 'bg-yellow-400' },
  'sell':        { label: 'Sell',        bg: 'bg-orange-900/40',  text: 'text-orange-300',  dot: 'bg-orange-400' },
  'strong-sell': { label: 'Strong Sell', bg: 'bg-red-900/40',     text: 'text-red-300',     dot: 'bg-red-400' },
};

/* ───── Seasonality Data ───── */
const seasons: SportSeason[] = [
  {
    sport: 'baseball',
    label: 'Baseball',
    icon: '⚾',
    color: 'emerald',
    months: [
      { month: 'January', shortMonth: 'Jan', signal: 'strong-buy', reason: 'Off-season lull — sellers dump cards before spring training hype', keyEvents: ['Hot Stove free agent signings', 'Hall of Fame ballot results'], tip: 'Buy rookies of players who changed teams via free agency — their new-team cards will spike at Spring Training.' },
      { month: 'February', shortMonth: 'Feb', signal: 'buy', reason: 'Spring Training ramp-up begins — prices start climbing on prospect cards', keyEvents: ['Spring Training report dates', 'Bowman Chrome release hype'], tip: 'Target young pitchers — Spring Training velocity numbers can move markets overnight.' },
      { month: 'March', shortMonth: 'Mar', signal: 'hold', reason: 'Opening Day approaching — prospect prices already elevated', keyEvents: ['Opening Day lineups announced', 'Roster cuts finalize 26-man rosters'], tip: 'Sell Spring Training hype picks that won\'t make the roster. Buy players who make surprise Opening Day rosters.' },
      { month: 'April', shortMonth: 'Apr', signal: 'sell', reason: 'Opening Day spike — sell into the excitement of early-season hot starts', keyEvents: ['Opening Day', 'April hot starts inflate prices', 'Topps Series 1 chase period'], tip: 'Don\'t chase April stats. Players hitting .400 in April will regress. Sell into small-sample hype.' },
      { month: 'May', shortMonth: 'May', signal: 'hold', reason: 'Markets settle as sample sizes grow — watch for call-up candidates', keyEvents: ['Super 2 deadline approaching', 'Bowman 1st release'], tip: 'Bowman 1st drops in May — if you want prospect cards, buy the dip 2-3 weeks after release.' },
      { month: 'June', shortMonth: 'Jun', signal: 'buy', reason: 'MLB Draft creates new prospect markets — established player prices cool', keyEvents: ['MLB Draft (Week 2)', 'Call-up season begins'], tip: 'Buy established star cards during the draft — attention shifts to prospects and prices dip.' },
      { month: 'July', shortMonth: 'Jul', signal: 'sell', reason: 'All-Star Game and trade deadline hype — sell into excitement', keyEvents: ['All-Star Game', 'Trade Deadline (Jul 30)', 'Topps Update previews'], tip: 'Trade deadline moves create 24-48 hour price spikes on traded players. Sell within the window.' },
      { month: 'August', shortMonth: 'Aug', signal: 'hold', reason: 'Pennant race picks up — contending team players hold value', keyEvents: ['September call-ups approaching', 'Playoff picture forming', 'Topps Chrome release'], tip: 'Topps Chrome drops in August — the most important baseball card release of the year. Buy singles 3 weeks post-release.' },
      { month: 'September', shortMonth: 'Sep', signal: 'sell', reason: 'Playoff rosters set — sell cards of players on eliminated teams', keyEvents: ['Expanded rosters', 'Playoff seeding finalized', 'Award races heat up'], tip: 'MVP/Cy Young candidates see card spikes in September as narratives solidify. Sell before the award is announced.' },
      { month: 'October', shortMonth: 'Oct', signal: 'strong-sell', reason: 'Postseason is peak hype — sell into World Series excitement', keyEvents: ['ALDS/ALCS/NLDS/NLCS', 'World Series', 'Topps Update release'], tip: 'World Series hero cards spike 200-500% during the games. Sell within 48 hours — the premium fades fast.' },
      { month: 'November', shortMonth: 'Nov', signal: 'strong-buy', reason: 'Post-season hangover — baseball card attention drops dramatically', keyEvents: ['Free agency begins', 'Awards announced', 'Offseason trades'], tip: 'November is the single best month to buy baseball cards. Attention shifts to football and holiday shopping.' },
      { month: 'December', shortMonth: 'Dec', signal: 'buy', reason: 'Holiday selling + continued off-season — great buying opportunity', keyEvents: ['Winter Meetings', 'Blockbuster trades', 'Holiday gift demand'], tip: 'Winter Meeting trades create brief spikes. Buy during the quiet weeks between Christmas and New Year.' },
    ],
  },
  {
    sport: 'basketball',
    label: 'Basketball',
    icon: '🏀',
    color: 'orange',
    months: [
      { month: 'January', shortMonth: 'Jan', signal: 'hold', reason: 'Mid-season — All-Star selections create brief spikes', keyEvents: ['All-Star voting opens', 'Rookie standouts emerge', 'Martin Luther King Jr. Day games'], tip: 'First-time All-Stars see the biggest card spikes from selection. Buy before announcements if you have a prediction.' },
      { month: 'February', shortMonth: 'Feb', signal: 'sell', reason: 'All-Star Weekend hype — sell into Rising Stars/Slam Dunk excitement', keyEvents: ['All-Star Weekend', 'Rising Stars Challenge', 'Trade Deadline (Feb)'], tip: 'Trade deadline moves in basketball are massive. Stars on new teams see immediate 30-50% card spikes.' },
      { month: 'March', shortMonth: 'Mar', signal: 'hold', reason: 'Playoff positioning — cards of bubble team stars get volatile', keyEvents: ['March Madness (college)', 'Play-In race heats up', 'Award races solidify'], tip: 'March Madness college stars are a separate market — buy prospect cards of top performers for the NBA Draft bump.' },
      { month: 'April', shortMonth: 'Apr', signal: 'sell', reason: 'Playoffs begin — sell into the excitement of first-round matchups', keyEvents: ['NBA Playoffs Round 1', 'Play-In Tournament', 'Season awards announced'], tip: 'Playoff performers see massive short-term spikes. Game-winners and 50-point playoff games move markets instantly.' },
      { month: 'May', shortMonth: 'May', signal: 'sell', reason: 'Conference Semifinals/Finals — peak NBA card attention', keyEvents: ['Conference Semifinals', 'Conference Finals begin', 'Draft Lottery'], tip: 'Draft Lottery creates a 24-hour buying window for the #1 pick city\'s existing star cards.' },
      { month: 'June', shortMonth: 'Jun', signal: 'strong-sell', reason: 'NBA Finals + Draft — maximum hype and attention', keyEvents: ['NBA Finals', 'NBA Draft (late June)', 'Finals MVP coronation'], tip: 'NBA Finals MVP cards spike 100-300% during the series. Sell within the celebration window.' },
      { month: 'July', shortMonth: 'Jul', signal: 'strong-buy', reason: 'Dead period — free agency noise but card attention drops hard', keyEvents: ['Free agency opens (Jul 1)', 'Summer League', 'Prizm Basketball release window'], tip: 'July is the best month to buy basketball cards. Free agency surprises create brief windows to buy before new-team hype.' },
      { month: 'August', shortMonth: 'Aug', signal: 'buy', reason: 'Off-season doldrums — prices at annual lows for most players', keyEvents: ['Offseason workouts', 'Select/Optic release window', 'FIBA tournaments (in FIBA years)'], tip: 'Buy your favorite player\'s cards in August. You\'re 2 months from the season and prices are at their floor.' },
      { month: 'September', shortMonth: 'Sep', signal: 'buy', reason: 'Pre-season approaching — slight uptick begins on rookies', keyEvents: ['Training camp dates set', 'Pre-season schedule released', 'Roster battles begin'], tip: 'Target rookie cards of players expected to start. The market hasn\'t priced in opening night yet.' },
      { month: 'October', shortMonth: 'Oct', signal: 'sell', reason: 'Season tips off — sell rookie cards into opening week excitement', keyEvents: ['NBA Opening Night', 'Early season overreactions', 'Halloween'], tip: 'The first 2 weeks of NBA season create massive overreaction pricing. A rookie who scores 30 on opening night? Sell immediately.' },
      { month: 'November', shortMonth: 'Nov', signal: 'hold', reason: 'Season settles in — watch for breakout candidates', keyEvents: ['Regular season rhythm', 'In-Season Tournament', 'Black Friday card deals'], tip: 'In-Season Tournament creates mini-spikes for players on winning teams. It\'s a new pricing catalyst.' },
      { month: 'December', shortMonth: 'Dec', signal: 'hold', reason: 'Christmas Day games spotlight stars — brief spikes for performers', keyEvents: ['Christmas Day games', 'Holiday gift buying', 'Year-end list season'], tip: 'Christmas Day performances get outsized media attention. A big game on Dec 25 moves cards more than one in February.' },
    ],
  },
  {
    sport: 'football',
    label: 'Football',
    icon: '🏈',
    color: 'blue',
    months: [
      { month: 'January', shortMonth: 'Jan', signal: 'strong-sell', reason: 'NFL Playoffs + Super Bowl — peak football card demand', keyEvents: ['Divisional Round', 'Conference Championships', 'Super Bowl (early Feb)'], tip: 'Super Bowl MVP cards spike 200-400%. Sell within 72 hours — the premium evaporates once the parade is over.' },
      { month: 'February', shortMonth: 'Feb', signal: 'sell', reason: 'Super Bowl afterglow + NFL Combine approaching', keyEvents: ['Super Bowl (early Feb)', 'NFL Combine prep', 'Pro Bowl/Skills Challenge'], tip: 'Combine risers see card spikes even before they\'re drafted. Watch 40-yard dash times closely.' },
      { month: 'March', shortMonth: 'Mar', signal: 'hold', reason: 'Free agency reshuffles markets — trades create volatility', keyEvents: ['NFL Free Agency opens (mid-Mar)', 'Franchise tag deadline', 'NFL Combine results'], tip: 'Free agent signings create 48-hour spikes. A QB on a new team? His cards spike immediately — sell or buy fast.' },
      { month: 'April', shortMonth: 'Apr', signal: 'sell', reason: 'NFL Draft is the single biggest event in football card collecting', keyEvents: ['NFL Draft (late April)', 'Draft prospect card speculation', 'Post-draft euphoria'], tip: 'Draft night is the #1 selling night for football prospect cards. Sell Draft Night picks within 48 hours — reality sets in fast.' },
      { month: 'May', shortMonth: 'May', signal: 'buy', reason: 'Post-draft cooldown — OTAs don\'t move markets', keyEvents: ['OTAs begin', 'Rookie minicamps', 'Draft analysis settles'], tip: 'Buy draft picks 2-3 weeks after the draft when the initial hype fades. OTA photos don\'t move markets.' },
      { month: 'June', shortMonth: 'Jun', signal: 'strong-buy', reason: 'Dead period — minicamp is the only news. Lowest football card prices.', keyEvents: ['Mandatory minicamp', 'Football attention at annual low'], tip: 'June is the best month to buy football cards, period. No games, no news, no hype. Maximum buying power.' },
      { month: 'July', shortMonth: 'Jul', signal: 'buy', reason: 'Training camp approaching — prices start climbing on starters', keyEvents: ['Training camp opens (late July)', 'Contract holdouts', 'Depth chart battles'], tip: 'Buy before training camp reports. Beat the pre-season hype cycle by 2-3 weeks.' },
      { month: 'August', shortMonth: 'Aug', signal: 'hold', reason: 'Preseason games reveal new stars — prices climbing toward regular season', keyEvents: ['Preseason games', 'Roster cuts (53-man)', 'Prizm Football release window'], tip: 'Preseason standouts get over-hyped. Don\'t pay regular-season prices for preseason performances.' },
      { month: 'September', shortMonth: 'Sep', signal: 'sell', reason: 'Regular season kicks off — sell into Week 1 excitement', keyEvents: ['NFL Kickoff', 'Week 1 overreactions', 'Fantasy football drives demand'], tip: 'Week 1 overreactions are the most profitable sell window in all of card collecting. A rookie QB who throws 4 TDs in Week 1? Sell immediately.' },
      { month: 'October', shortMonth: 'Oct', signal: 'hold', reason: 'Season rhythm — real contenders emerge, pretenders fade', keyEvents: ['Bye weeks begin', 'Trade deadline approaching', 'Midseason form emerges'], tip: 'By October you can identify which rookies are real. Buy the underperformers you believe in — patience pays.' },
      { month: 'November', shortMonth: 'Nov', signal: 'hold', reason: 'Playoff picture forming — contender cards hold/rise, fading team cards drop', keyEvents: ['NFL Trade Deadline (early Nov)', 'Thanksgiving showcase games', 'Playoff race heats up'], tip: 'Thanksgiving games get 30M+ viewers. A dominant Turkey Day performance moves cards significantly.' },
      { month: 'December', shortMonth: 'Dec', signal: 'sell', reason: 'Playoff spots clinching — sell into divisional race excitement', keyEvents: ['Playoff clinching scenarios', 'Christmas/holiday buying', 'Award races'], tip: 'Holiday gift-buying inflates football card prices. List your cards before Dec 15 for maximum holiday buyer demand.' },
    ],
  },
  {
    sport: 'hockey',
    label: 'Hockey',
    icon: '🏒',
    color: 'cyan',
    months: [
      { month: 'January', shortMonth: 'Jan', signal: 'hold', reason: 'Mid-season — All-Star selections and World Juniors create buzz', keyEvents: ['World Junior Championship (early Jan)', 'NHL All-Star selections', 'Outdoor games (Winter Classic)'], tip: 'World Juniors standouts see prospect card spikes. Future NHL stars debut on the international stage every January.' },
      { month: 'February', shortMonth: 'Feb', signal: 'sell', reason: 'NHL Trade Deadline approaches — traded player cards spike', keyEvents: ['NHL All-Star Weekend', 'Trade Deadline (late Feb/early Mar)', 'Playoff race intensifies'], tip: 'The NHL Trade Deadline is the biggest card-moving event in hockey. Rental players on contenders spike 50-100%.' },
      { month: 'March', shortMonth: 'Mar', signal: 'sell', reason: 'Trade Deadline fallout + playoff positioning — high attention on hockey', keyEvents: ['Trade Deadline (early Mar)', 'Playoff push', 'Young Guns release window'], tip: 'Upper Deck Young Guns are the most important hockey cards. Buy singles 3-4 weeks after release for best prices.' },
      { month: 'April', shortMonth: 'Apr', signal: 'sell', reason: 'Stanley Cup Playoffs begin — sell into first-round excitement', keyEvents: ['Stanley Cup Playoffs Round 1', 'Regular season ends', 'Calder Trophy race'], tip: 'Playoff overtime heroes see instant card spikes. Hockey playoff OT is the most exciting event in sports — and cards follow.' },
      { month: 'May', shortMonth: 'May', signal: 'strong-sell', reason: 'Conference Finals — peak hockey card attention', keyEvents: ['Conference Finals', 'NHL Draft Lottery', 'Award finalists announced'], tip: 'Conference Finals stars get massive exposure. A Conn Smythe candidate? Sell into the hype.' },
      { month: 'June', shortMonth: 'Jun', signal: 'strong-sell', reason: 'Stanley Cup Finals + NHL Draft — maximum hockey card demand', keyEvents: ['Stanley Cup Finals', 'NHL Draft (late June)', 'Free agency opens (Jul 1)'], tip: 'Stanley Cup champions see sustained card premium for about 2 weeks. NHL Draft night prospect cards spike briefly.' },
      { month: 'July', shortMonth: 'Jul', signal: 'strong-buy', reason: 'Off-season — hockey attention drops to zero. Best buying month.', keyEvents: ['Free agency (Jul 1)', 'No games until October'], tip: 'July 1 free agent signings create brief spikes. After that, hockey cards are at their cheapest until October.' },
      { month: 'August', shortMonth: 'Aug', signal: 'strong-buy', reason: 'Dead zone — no hockey news. Absolute lowest prices of the year.', keyEvents: ['Nothing. Literally nothing.'], tip: 'August is the single best month to buy hockey cards. Zero competition. Maximum discounts.' },
      { month: 'September', shortMonth: 'Sep', signal: 'buy', reason: 'Pre-season approaching — rookie camp creates prospect buzz', keyEvents: ['Rookie camps', 'Pre-season roster battles', 'World Cup/4 Nations (in event years)'], tip: 'Buy before training camp. Rookie camp standouts will spike when rosters are announced.' },
      { month: 'October', shortMonth: 'Oct', signal: 'sell', reason: 'NHL season starts — sell into opening night and early-season hype', keyEvents: ['NHL Opening Night', 'Early season hot starts', 'Young Guns Series 1 release'], tip: 'Opening night rookies who score in their debut see 24-hour card spikes. Sell into the moment.' },
      { month: 'November', shortMonth: 'Nov', signal: 'hold', reason: 'Season settles — watch for breakout rookies and surprises', keyEvents: ['Regular season rhythm', 'International breaks (some years)', 'Young Guns updates'], tip: 'November is where real rookie breakouts separate from hot starts. This is when smart buying begins.' },
      { month: 'December', shortMonth: 'Dec', signal: 'hold', reason: 'Holiday buying + World Juniors preview', keyEvents: ['Holiday gift buying', 'World Junior Championship preview', 'Year-end lists'], tip: 'Holiday demand inflates hockey card prices slightly. The World Juniors preview in late December can create prospect buzz.' },
    ],
  },
  {
    sport: 'pokemon',
    label: 'Pokémon',
    icon: '⚡',
    color: 'yellow',
    months: [
      { month: 'January', shortMonth: 'Jan', signal: 'buy', reason: 'Post-holiday cooldown — Christmas gift cards are being sold off', keyEvents: ['New Year sales', 'Post-holiday market flood', 'Community Day events'], tip: 'Buy sealed product in January when holiday excess hits the secondary market. ETBs are cheapest now.' },
      { month: 'February', shortMonth: 'Feb', signal: 'buy', reason: 'Continued post-holiday lull — Valentine\'s Day has minimal card impact', keyEvents: ['Set rotation announcements', 'Regional Championships', 'New set previews'], tip: 'Target competitive playable cards before Regional Championship results spike winning deck staples.' },
      { month: 'March', shortMonth: 'Mar', signal: 'hold', reason: 'Spring set release approaching — speculation begins', keyEvents: ['New expansion announced/released', 'International Championships', 'Tax refund spending'], tip: 'New set releases flood the market — wait 3-4 weeks after release for singles to bottom out.' },
      { month: 'April', shortMonth: 'Apr', signal: 'hold', reason: 'Spring set actively being opened — singles prices declining', keyEvents: ['Spring set opening peak', 'Pokemon Day events', 'Competitive meta shifts'], tip: 'Singles from the newest set are cheapest about 4-6 weeks after release. That\'s your buy window.' },
      { month: 'May', shortMonth: 'May', signal: 'hold', reason: 'Pre-summer — prices stable before summer collector activity', keyEvents: ['Summer set previews', 'Pokemon GO events crossover', 'Regional Championships'], tip: 'Cross-media events (Pokemon GO Community Days, anime premieres) can spike specific character cards.' },
      { month: 'June', shortMonth: 'Jun', signal: 'sell', reason: 'Summer collector activity begins — kids out of school, more demand', keyEvents: ['Summer set release', 'Pokemon GO Fest', 'School\'s out buying surge'], tip: 'Summer is when casual collectors enter the market. They buy at retail markup — list your extras now.' },
      { month: 'July', shortMonth: 'Jul', signal: 'sell', reason: 'Peak summer activity — Pokemon Worlds approaching', keyEvents: ['Pokemon World Championships (Aug preview)', 'Summer vacation demand', 'Amazon Prime Day deals'], tip: 'World Championship deck lists spike card prices overnight. If you know the meta, position before Worlds.' },
      { month: 'August', shortMonth: 'Aug', signal: 'strong-sell', reason: 'Pokemon World Championships — peak competitive demand', keyEvents: ['Pokemon World Championships', 'Back-to-school sales', 'Fall set previews'], tip: 'Worlds winners\' deck cards spike 200-300%. Sell competitive cards during the tournament weekend.' },
      { month: 'September', shortMonth: 'Sep', signal: 'hold', reason: 'Fall set anticipation — back-to-school spending redirects budgets', keyEvents: ['Fall set release', 'New format rotation', 'Collector series announcements'], tip: 'Fall sets compete with back-to-school budgets. Sealed product is often available below MSRP early.' },
      { month: 'October', shortMonth: 'Oct', signal: 'buy', reason: 'Pre-holiday buying window — prices haven\'t spiked yet for gifting', keyEvents: ['Halloween specials', 'Holiday set previews', 'Pokemon Center exclusives announced'], tip: 'October is the last good window to buy sealed product before holiday markup. Stock up now for gifts or holds.' },
      { month: 'November', shortMonth: 'Nov', signal: 'sell', reason: 'Holiday shopping begins — demand spikes, especially sealed product', keyEvents: ['Black Friday deals', 'Holiday gift shopping', 'Special holiday products released'], tip: 'Black Friday Pokemon deals are the exception — sealed product at genuine discounts is worth buying. Everything else: sell into holiday demand.' },
      { month: 'December', shortMonth: 'Dec', signal: 'strong-sell', reason: 'Peak holiday demand — sealed product at maximum premium', keyEvents: ['Christmas gift buying peak', 'Year-end FOMO buying', 'Limited holiday products'], tip: 'December is when sealed Pokemon product commands the highest premium. If you\'re sitting on ETBs, this is your exit.' },
    ],
  },
];

/* ───── Component ───── */
export default function SeasonalityGuide() {
  const [selectedSport, setSelectedSport] = useState<Sport>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  const currentMonth = new Date().getMonth(); // 0-indexed

  const filteredSeasons = useMemo(() => {
    if (selectedSport === 'all') return seasons;
    return seasons.filter(s => s.sport === selectedSport);
  }, [selectedSport]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-8">
      {/* Sport Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all' as Sport, label: 'All Sports', icon: '🎯' },
          ...seasons.map(s => ({ value: s.sport, label: s.label, icon: s.icon })),
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelectedSport(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedSport === opt.value
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-3 py-1.5 rounded text-xs font-medium ${viewMode === 'calendar' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-3 py-1.5 rounded text-xs font-medium ${viewMode === 'timeline' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Timeline View
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(signalConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span className="text-gray-400">{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 ml-4">
          <span className="w-2.5 h-2.5 rounded-full bg-white ring-2 ring-emerald-400" />
          <span className="text-gray-400">Current Month</span>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        /* ───── Calendar View ───── */
        <div className="space-y-6">
          {filteredSeasons.map(season => (
            <div key={season.sport} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white mb-4">{season.icon} {season.label} — Monthly Buy/Sell Calendar</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 sm:gap-2">
                {season.months.map((m, i) => {
                  const cfg = signalConfig[m.signal];
                  const isCurrent = i === currentMonth;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedMonth(selectedMonth === i ? null : i)}
                      className={`relative p-2 sm:p-3 rounded-lg text-center transition-all ${cfg.bg} border ${
                        selectedMonth === i ? 'border-white ring-1 ring-white' : isCurrent ? 'border-emerald-400' : 'border-transparent'
                      } hover:border-gray-500`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
                      )}
                      <div className="text-xs text-gray-400 mb-1">{m.shortMonth}</div>
                      <div className={`w-3 h-3 rounded-full mx-auto ${cfg.dot}`} />
                      <div className={`text-[10px] mt-1 ${cfg.text} font-medium hidden sm:block`}>{cfg.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Month Detail */}
              {selectedMonth !== null && (
                <div className="mt-4 bg-gray-900/60 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-3 h-3 rounded-full ${signalConfig[season.months[selectedMonth].signal].dot}`} />
                    <h4 className="font-semibold text-white">
                      {season.months[selectedMonth].month} — {signalConfig[season.months[selectedMonth].signal].label}
                    </h4>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{season.months[selectedMonth].reason}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Key Events</h5>
                      <ul className="space-y-1">
                        {season.months[selectedMonth].keyEvents.map((e, j) => (
                          <li key={j} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span> {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Pro Tip</h5>
                      <p className="text-sm text-emerald-300 bg-emerald-950/40 rounded-lg p-3 border border-emerald-800/30">
                        {season.months[selectedMonth].tip}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ───── Timeline View ───── */
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-3 text-gray-400 font-medium sticky left-0 bg-gray-800/90 z-10 min-w-[100px]">Month</th>
                {filteredSeasons.map(s => (
                  <th key={s.sport} className="p-3 text-gray-400 font-medium text-center min-w-[90px]">{s.icon} {s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthNames.map((month, i) => (
                <tr
                  key={i}
                  className={`border-b border-gray-700/30 ${i === currentMonth ? 'bg-emerald-950/20' : ''} hover:bg-gray-700/20 cursor-pointer`}
                  onClick={() => setSelectedMonth(selectedMonth === i ? null : i)}
                >
                  <td className={`p-3 font-medium sticky left-0 bg-gray-800/90 z-10 ${i === currentMonth ? 'text-emerald-400' : 'text-white'}`}>
                    {i === currentMonth && <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2" />}
                    {month}
                  </td>
                  {filteredSeasons.map(s => {
                    const mData = s.months[i];
                    const cfg = signalConfig[mData.signal];
                    return (
                      <td key={s.sport} className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Timeline Selected Detail */}
          {selectedMonth !== null && (
            <div className="p-4 border-t border-gray-700/50">
              <h4 className="font-semibold text-white mb-3">{seasons[0].months[selectedMonth].month} — Across All Sports</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSeasons.map(s => {
                  const mData = s.months[selectedMonth];
                  const cfg = signalConfig[mData.signal];
                  return (
                    <div key={s.sport} className={`rounded-lg p-3 ${cfg.bg} border border-gray-700/30`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span>{s.icon}</span>
                        <span className={`font-medium ${cfg.text}`}>{s.label}: {cfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{mData.reason}</p>
                      <p className="text-xs text-emerald-300">{mData.tip}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Now Section */}
      <div className="bg-gradient-to-br from-emerald-950/60 to-gray-800/50 border border-emerald-800/30 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">📅 What to Do Right Now — {seasons[0].months[currentMonth].month}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map(s => {
            const mData = s.months[currentMonth];
            const cfg = signalConfig[mData.signal];
            return (
              <div key={s.sport} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{s.icon} {s.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{mData.reason}</p>
                <p className="text-xs text-emerald-300">{mData.tip}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Tips */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">General Seasonality Rules</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Buy the Off-Season', tip: 'Every sport has a dead period when attention shifts elsewhere. That\'s when prices are lowest. Baseball in November, basketball in July, football in June, hockey in August.' },
            { title: 'Sell the Event', tip: 'Championships, All-Star games, draft nights, and award announcements all create temporary price spikes. Sell INTO the excitement, not after it fades.' },
            { title: 'The 48-Hour Rule', tip: 'Most event-driven price spikes last 24-72 hours. A World Series hero, a draft pick, a trade — the premium starts fading within 2 days. Act fast.' },
            { title: 'New Set Patience', tip: 'Never buy singles from a new release in the first 2 weeks. Supply floods the market as boxes are opened. Wait 3-4 weeks for prices to bottom, then buy.' },
            { title: 'Tax Refund Season (March)', tip: 'Card prices across all sports get a bump in March when tax refunds hit. This is a reliable annual pattern. Sell before March, or hold through it.' },
            { title: 'Black Friday Exception', tip: 'Black Friday is one of the few times you should BUY during a normally expensive period. Genuine sealed product discounts 20-40% off are common.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900/40 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-1 text-sm">{item.title}</h4>
              <p className="text-gray-400 text-xs leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-gray-500 text-xs text-center">
        Seasonality patterns are based on historical market trends and are not guaranteed to repeat.
        Past performance does not predict future results. Card values can change due to player performance,
        injury, scandal, or market shifts. Always do your own research before buying or selling.
      </p>
    </div>
  );
}
