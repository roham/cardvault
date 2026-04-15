'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ───── Era Data ───── */
interface Era {
  id: string;
  name: string;
  years: string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  overview: string;
  keyManufacturers: string[];
  notableCards: { name: string; year: number; value: string }[];
  gradingTips: string[];
  investmentOutlook: { rating: 'strong' | 'moderate' | 'speculative' | 'caution'; summary: string };
  collectingTips: string[];
  avgCondition: string;
  population: string;
}

const eras: Era[] = [
  {
    id: 'pre-war',
    name: 'Pre-War Era',
    years: '1887–1945',
    icon: '🏛️',
    color: 'text-amber-300',
    borderColor: 'border-amber-700/50',
    bgColor: 'bg-amber-950/40',
    overview: 'The dawn of card collecting. Cards were issued by tobacco, candy, and gum companies as promotional inserts. These are the rarest and most historically significant cards in the hobby. Pre-war cards are true antiques — many are over 100 years old.',
    keyManufacturers: ['American Tobacco Company (T205, T206, T207)', 'Goudey Gum Company', 'Play Ball (Bowman predecessor)', 'Cracker Jack', 'W-series strip cards'],
    notableCards: [
      { name: 'T206 Honus Wagner', year: 1909, value: '$3M-$7.25M' },
      { name: '1933 Goudey Babe Ruth #53', year: 1933, value: '$200K-$1M' },
      { name: '1914 Cracker Jack Ty Cobb', year: 1914, value: '$100K-$500K' },
      { name: 'T206 Ty Cobb (Green Portrait)', year: 1909, value: '$50K-$300K' },
      { name: '1941 Play Ball Joe DiMaggio', year: 1941, value: '$20K-$100K' },
    ],
    gradingTips: [
      'Paper quality varies greatly — tobacco cards used thinner stock than gum cards',
      'Rounded corners are expected and not as penalized as modern cards',
      'Staining from tobacco/gum is common — light staining is acceptable in mid-grades',
      'Trimming detection is critical — many pre-war cards were hand-cut with irregular edges',
      'PSA and SGC are the preferred graders for pre-war cards',
    ],
    investmentOutlook: { rating: 'strong', summary: 'Pre-war cards have the strongest long-term appreciation. Scarcity increases every year as cards are lost or damaged. HOF players in any grade are liquid investments.' },
    collectingTips: [
      'Start with T206 commons — authentic 100+ year old cards for $50-$200',
      'Buy graded — authentication is critical for cards this old',
      'Focus on condition relative to era, not absolute grade',
      'Join PWCC, Heritage, or REA for serious pre-war acquisitions',
    ],
    avgCondition: 'PSA 2-4 (most survivors)',
    population: 'Extremely scarce — most cards exist in hundreds, not thousands',
  },
  {
    id: 'post-war',
    name: 'Post-War Golden Age',
    years: '1946–1969',
    icon: '⭐',
    color: 'text-yellow-300',
    borderColor: 'border-yellow-700/50',
    bgColor: 'bg-yellow-950/40',
    overview: 'The golden age of baseball cards. Bowman and Topps battled for dominance, Topps won, and became the sole major manufacturer by 1956. Iconic designs, legendary players, and the cards that defined generations of collectors.',
    keyManufacturers: ['Topps (dominant from 1952)', 'Bowman (1948-1955)', 'Fleer (intermittent)'],
    notableCards: [
      { name: '1952 Topps Mickey Mantle #311', year: 1952, value: '$500K-$12.6M' },
      { name: '1951 Bowman Mickey Mantle #253', year: 1951, value: '$100K-$1M' },
      { name: '1954 Topps Hank Aaron #128', year: 1954, value: '$50K-$500K' },
      { name: '1955 Topps Roberto Clemente #164', year: 1955, value: '$30K-$400K' },
      { name: '1966 Topps Mickey Mantle #50', year: 1966, value: '$5K-$50K' },
    ],
    gradingTips: [
      'Centering is often poor — well-centered cards command huge premiums',
      'Wax staining on the back is common from packaging',
      'High-numbers (last series) were printed in smaller quantities and are more valuable',
      'Color registration can be off — this is a factory issue, not damage',
      'Surface printing quality improved throughout the 1950s',
    ],
    investmentOutlook: { rating: 'strong', summary: 'Post-war HOF rookies are blue-chip investments. The 1952 Topps set is the most desirable post-war set. High-grade examples continue to set auction records.' },
    collectingTips: [
      'High-number series cards (printed last, in smaller quantities) are the key to value',
      'Focus on rookies of HOFers — they have the widest collector base',
      'Well-centered examples command 2-5x premiums over off-center',
      'Buy the best grade you can afford — condition is king in this era',
    ],
    avgCondition: 'PSA 3-5 (typical)',
    population: 'Scarce in high grade — most were handled by kids',
  },
  {
    id: 'vintage',
    name: 'Vintage Era',
    years: '1970–1980',
    icon: '📻',
    color: 'text-orange-300',
    borderColor: 'border-orange-700/50',
    bgColor: 'bg-orange-950/40',
    overview: 'The expansion era. Topps remained the sole manufacturer but card quality improved. Basketball cards arrived (1969-70 Topps), hockey expanded, and football cards became more sophisticated. This era produced many affordable HOF rookies.',
    keyManufacturers: ['Topps (exclusive MLB license)', 'O-Pee-Chee (Canadian market)', 'Topps Basketball & Football'],
    notableCards: [
      { name: '1979 OPC Wayne Gretzky #18', year: 1979, value: '$50K-$1M' },
      { name: '1980 Topps Larry Bird / Magic Johnson #6', year: 1980, value: '$10K-$200K' },
      { name: '1975 Topps George Brett #228', year: 1975, value: '$5K-$50K' },
      { name: '1970 Topps Nolan Ryan #712', year: 1970, value: '$5K-$40K' },
      { name: '1976 Topps Walter Payton #148', year: 1976, value: '$5K-$30K' },
    ],
    gradingTips: [
      'Diamond cutting (rough edges from the cutting process) is common',
      'Cards from this era are very condition-sensitive — small flaws drop grades significantly',
      'Black-bordered cards (1971 Topps) are notoriously hard to find centered and chip-free',
      'O-Pee-Chee versions are often more valuable than Topps for hockey',
      'Miscut/off-center cards from this era are typically worth less, not more',
    ],
    investmentOutlook: { rating: 'strong', summary: 'Vintage HOF rookies (Gretzky, Bird/Magic, Brett, Payton) are proven investments. Black-bordered 1971 Topps in high grade are extremely desirable. The hockey market is particularly strong.' },
    collectingTips: [
      'This era is the sweet spot — affordable entry with strong appreciation potential',
      'Focus on multi-sport collecting — basketball and hockey RCs are still undervalued vs baseball',
      'Look for OPC variants of hockey cards — often rarer and more valuable',
      'Mid-grade examples (PSA 5-7) offer best value-to-price ratio',
    ],
    avgCondition: 'PSA 4-6 (typical)',
    population: 'Moderate — more survived than earlier eras but high-grade is still scarce',
  },
  {
    id: 'junk-wax',
    name: 'Junk Wax Era',
    years: '1981–1993',
    icon: '📦',
    color: 'text-red-300',
    borderColor: 'border-red-700/50',
    bgColor: 'bg-red-950/40',
    overview: 'The boom and bust. Multiple manufacturers entered the market (Fleer, Donruss, Score, Upper Deck), print runs exploded to millions, and speculation ran rampant. Most cards from this era are worth pennies — but key rookies and error cards remain valuable.',
    keyManufacturers: ['Topps', 'Fleer (returned 1981)', 'Donruss (debuted 1981)', 'Score (debuted 1988)', 'Upper Deck (debuted 1989)', 'Bowman (returned 1989)'],
    notableCards: [
      { name: '1989 Upper Deck Ken Griffey Jr. #1', year: 1989, value: '$200-$5K' },
      { name: '1986 Fleer Michael Jordan #57', year: 1986, value: '$5K-$500K' },
      { name: '1993 SP Derek Jeter #279', year: 1993, value: '$500-$100K' },
      { name: '1989 Fleer Bill Ripken "FF" Error', year: 1989, value: '$100-$3K' },
      { name: '1990 Topps Frank Thomas NNOF #414', year: 1990, value: '$500-$5K' },
    ],
    gradingTips: [
      'Print quality varies wildly between manufacturers — Upper Deck set the new standard in 1989',
      'Gem Mint (PSA 10) matters more here than any other era due to high population',
      'Fleer and Donruss cards are prone to edge chipping and poor centering',
      'Error cards are the hidden gems — check for wrong backs, missing text, and color variations',
      'Topps Tiffany and factory-sealed sets retain value while base cards do not',
    ],
    investmentOutlook: { rating: 'caution', summary: 'Most junk wax base cards are worthless due to massive overproduction. However, key rookies in PSA 10 (Jordan, Griffey, Jeter), error cards, and premium parallels can be excellent investments. The era is NOT dead — it is highly selective.' },
    collectingTips: [
      'Only invest in key rookies and error cards — commons are nearly worthless',
      'PSA 10 is the only grade that matters for junk wax star cards',
      'Buy sealed boxes for nostalgia, not investment (unless Fleer 1986)',
      'Error cards from this era are the best collecting value — fascinating history for $10-$100',
    ],
    avgCondition: 'PSA 7-9 (most survived in excellent condition)',
    population: 'Extremely high — millions of each card exist',
  },
  {
    id: 'modern',
    name: 'Modern Era',
    years: '1994–2010',
    icon: '💎',
    color: 'text-blue-300',
    borderColor: 'border-blue-700/50',
    bgColor: 'bg-blue-950/40',
    overview: 'The premium revolution. Insert cards, refractors, autographs, and numbered parallels transformed the hobby. Bowman Chrome created the modern prospect market. Print runs decreased significantly from junk wax levels, restoring scarcity.',
    keyManufacturers: ['Topps Chrome (debuted 1996)', 'Bowman Chrome (debuted 1997)', 'Panini (entered 2009)', 'Upper Deck', 'Fleer/SkyBox (defunct 2005)'],
    notableCards: [
      { name: '2009 Bowman Chrome Mike Trout #BDPP89', year: 2009, value: '$5K-$500K' },
      { name: '2003 Topps Chrome LeBron James #111', year: 2003, value: '$5K-$200K' },
      { name: '2000 Playoff Contenders Tom Brady #144', year: 2000, value: '$100K-$3M' },
      { name: '1997 Topps Chrome Refractor Tim Duncan #115', year: 1997, value: '$2K-$30K' },
      { name: '2005 Bowman Chrome Alex Ovechkin #223', year: 2005, value: '$500-$10K' },
    ],
    gradingTips: [
      'Chrome/refractor cards show surface scratches easily — handle with gloves',
      'Bowman Chrome prospect autographs are THE modern collectible',
      'Numbered parallels (/50, /25, /10, 1/1) are the key to value',
      'Centering on Chrome cards is often problematic — well-centered examples command premiums',
      'PSA 10 and BGS 9.5 are the target grades for modern cards',
    ],
    investmentOutlook: { rating: 'strong', summary: 'Modern era key rookies (Trout, LeBron, Brady) are blue chips. Bowman Chrome 1st editions and numbered parallels are the modern equivalent of vintage rookies. The Chrome/refractor format created a sustainable scarcity model.' },
    collectingTips: [
      'Bowman Chrome 1st Bowman autographs of top prospects are the #1 modern investment',
      'Focus on numbered parallels — /250 and lower hold value, base often does not',
      'Chrome refractors are the premium tier — Superfractors (1/1) are holy grails',
      'This era bridges vintage and ultra-modern — best of both worlds for new collectors',
    ],
    avgCondition: 'PSA 8-10 (careful handling common)',
    population: 'Moderate — significantly less than junk wax but more than vintage',
  },
  {
    id: 'ultra-modern',
    name: 'Ultra-Modern Era',
    years: '2011–Present',
    icon: '🚀',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-700/50',
    bgColor: 'bg-emerald-950/40',
    overview: 'The social media boom and bust. COVID drove card prices to all-time highs, new collectors flooded in, and the hobby became mainstream. Panini dominates football and basketball while Topps holds baseball and hockey. The digital age of card collecting is here.',
    keyManufacturers: ['Topps (baseball, hockey)', 'Panini (football, basketball until 2026)', 'Fanatics (taking over all sports 2025-2026)', 'Upper Deck (hockey, entertainment)'],
    notableCards: [
      { name: '2018 Topps Update Shohei Ohtani #US1', year: 2018, value: '$200-$5K' },
      { name: '2018 Panini Prizm Luka Doncic #280', year: 2018, value: '$500-$10K' },
      { name: '2020 Panini Prizm Justin Herbert #325', year: 2020, value: '$100-$3K' },
      { name: '2019 Bowman Chrome Wander Franco #BCP-1', year: 2019, value: '$100-$2K' },
      { name: '2023 Topps Chrome Victor Wembanyama', year: 2023, value: '$200-$5K' },
    ],
    gradingTips: [
      'Card quality from Panini is inconsistent — surface issues and centering problems are common',
      'Modern grading turnaround times vary from 2 weeks to 6+ months depending on service level',
      'BGS 9.5 Pristine is increasingly preferred for basketball and football cards',
      'Raw cards in obvious PSA 10 condition can sell for nearly as much as graded',
      'Crossover from BGS to PSA is common for cards that score BGS 9.5 or Pristine',
    ],
    investmentOutlook: { rating: 'speculative', summary: 'Ultra-modern cards are volatile — tied directly to player performance. Buy players you believe in, not hype. The Fanatics transition in 2025-26 will disrupt the market. Numbered parallels and rookie autographs hold best.' },
    collectingTips: [
      'Only invest in cards of players you have conviction on — performance drives value',
      'Buy during offseason dips, sell during peak performance/playoffs',
      'Numbered parallels (/99 and lower) are safest — base rookies are often overproduced',
      'The Fanatics transition creates uncertainty — diversify across manufacturers',
    ],
    avgCondition: 'PSA 9-10 (handled carefully by collectors from pack to sleeve)',
    population: 'High — modern print runs are significant, but parallels remain scarce',
  },
];

const outlookColors: Record<string, { bg: string; text: string }> = {
  strong: { bg: 'bg-emerald-950/50', text: 'text-emerald-400' },
  moderate: { bg: 'bg-blue-950/50', text: 'text-blue-400' },
  speculative: { bg: 'bg-amber-950/50', text: 'text-amber-400' },
  caution: { bg: 'bg-red-950/50', text: 'text-red-400' },
};

export default function EraGuide() {
  const [selectedEra, setSelectedEra] = useState<string | null>(null);

  const activeEra = eras.find(e => e.id === selectedEra);

  return (
    <div className="space-y-10">
      {/* Timeline */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Select an Era</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {eras.map(era => {
            const isActive = selectedEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => setSelectedEra(isActive ? null : era.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? `${era.bgColor} ${era.borderColor} ring-1 ring-emerald-500/30`
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/70 hover:bg-gray-800/70'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{era.icon}</span>
                  <span className={`font-semibold text-sm ${isActive ? era.color : 'text-white'}`}>{era.name}</span>
                </div>
                <p className="text-gray-500 text-xs font-mono mb-2">{era.years}</p>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{era.overview}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Era Detail */}
      {activeEra && (
        <section className={`${activeEra.bgColor} border ${activeEra.borderColor} rounded-2xl p-6 space-y-8`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{activeEra.icon}</span>
              <div>
                <h2 className={`text-2xl font-bold ${activeEra.color}`}>{activeEra.name}</h2>
                <p className="text-gray-400 text-sm font-mono">{activeEra.years}</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mt-3">{activeEra.overview}</p>
          </div>

          {/* Key Manufacturers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Key Manufacturers</h3>
            <div className="flex flex-wrap gap-2">
              {activeEra.keyManufacturers.map((m, i) => (
                <span key={i} className="bg-gray-900/60 border border-gray-700/40 rounded-lg px-3 py-1.5 text-sm text-gray-300">{m}</span>
              ))}
            </div>
          </div>

          {/* Notable Cards */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Most Notable Cards</h3>
            <div className="space-y-2">
              {activeEra.notableCards.map((card, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900/50 border border-gray-700/30 rounded-lg p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{card.name}</p>
                    <p className="text-gray-500 text-xs">{card.year}</p>
                  </div>
                  <span className="text-emerald-400 text-sm font-semibold whitespace-nowrap">{card.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grading Tips */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Grading Tips for This Era</h3>
            <ul className="space-y-2">
              {activeEra.gradingTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-emerald-400 mt-0.5 shrink-0">&#10003;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Typical Condition (Surviving Cards)</p>
              <p className="text-white font-semibold text-sm">{activeEra.avgCondition}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Population / Scarcity</p>
              <p className="text-white font-semibold text-sm">{activeEra.population}</p>
            </div>
          </div>

          {/* Investment Outlook */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Investment Outlook</h3>
            <div className={`${outlookColors[activeEra.investmentOutlook.rating].bg} border border-gray-700/30 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm font-bold uppercase ${outlookColors[activeEra.investmentOutlook.rating].text}`}>
                  {activeEra.investmentOutlook.rating}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{activeEra.investmentOutlook.summary}</p>
            </div>
          </div>

          {/* Collecting Tips */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Getting Started</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeEra.collectingTips.map((tip, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comparison Table */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Era Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium py-2 px-3">Era</th>
                <th className="text-left text-gray-400 font-medium py-2 px-3">Years</th>
                <th className="text-left text-gray-400 font-medium py-2 px-3">Avg Grade</th>
                <th className="text-left text-gray-400 font-medium py-2 px-3">Scarcity</th>
                <th className="text-left text-gray-400 font-medium py-2 px-3">Outlook</th>
              </tr>
            </thead>
            <tbody>
              {eras.map(era => (
                <tr key={era.id} className="border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer" onClick={() => setSelectedEra(era.id)}>
                  <td className="py-2 px-3"><span className="mr-1">{era.icon}</span><span className="text-white">{era.name}</span></td>
                  <td className="py-2 px-3 text-gray-400 font-mono text-xs">{era.years}</td>
                  <td className="py-2 px-3 text-gray-300">{era.avgCondition}</td>
                  <td className="py-2 px-3 text-gray-300 text-xs">{era.population.split(' — ')[0]}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs font-bold uppercase ${outlookColors[era.investmentOutlook.rating].text}`}>
                      {era.investmentOutlook.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Related Tools */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/investment-calc', label: 'Investment Calculator' },
            { href: '/tools/error-cards', label: 'Error Card Value Guide' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
            { href: '/tools/price-history', label: 'Price History' },
            { href: '/tools/rarity-score', label: 'Rarity Score Calculator' },
            { href: '/tools/pop-report', label: 'Population Report' },
            { href: '/tools/diversification', label: 'Diversification Analyzer' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-xs font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
