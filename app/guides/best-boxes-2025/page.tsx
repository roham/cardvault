import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

const BASE = 'https://cardvault-two.vercel.app';

export const metadata: Metadata = {
  title: 'Best Sports Card Boxes to Buy in 2025 — Hobby, Retail & Value Picks',
  description:
    'The 12 best sports card boxes to buy in 2025 across hobby, retail, and value tiers. Price ranges, hit rates, key cards to chase, and honest verdicts for baseball, basketball, football, and hockey boxes.',
  keywords: [
    'best sports card boxes 2025',
    'what card boxes to buy',
    'best hobby boxes',
    'best blaster boxes 2025',
    'sports card box reviews',
    'sealed wax 2025',
  ],
  alternates: { canonical: './' },
  openGraph: {
    title: 'Best Sports Card Boxes to Buy in 2025 — Hobby, Retail & Value Picks',
    description:
      'The 12 best sports card boxes to buy in 2025. Hobby, retail, and value picks across all four major sports with prices, hit rates, and verdicts.',
    url: `${BASE}/guides/best-boxes-2025`,
    type: 'article',
    siteName: 'CardVault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Sports Card Boxes to Buy in 2025',
    description:
      '12 best boxes across hobby, retail & value tiers. Prices, hit rates, key rookies, and verdicts.',
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Sport = 'Baseball' | 'Basketball' | 'Football' | 'Hockey';
type Verdict = 'Buy' | 'Hold' | 'Skip';

interface BoxPick {
  name: string;
  sport: Sport;
  price: string;
  hits: string;
  keyCards: string;
  verdict: Verdict;
  verdictNote: string;
  ebaySearch: string;
}

const sportAccent: Record<Sport, { border: string; bg: string; text: string; icon: string }> = {
  Baseball: { border: 'border-rose-700/50', bg: 'bg-rose-950/30', text: 'text-rose-400', icon: '\u26be' },
  Basketball: { border: 'border-orange-700/50', bg: 'bg-orange-950/30', text: 'text-orange-400', icon: '\ud83c\udfc0' },
  Football: { border: 'border-emerald-700/50', bg: 'bg-emerald-950/30', text: 'text-emerald-400', icon: '\ud83c\udfc8' },
  Hockey: { border: 'border-sky-700/50', bg: 'bg-sky-950/30', text: 'text-sky-400', icon: '\ud83c\udfd2' },
};

const verdictColor: Record<Verdict, string> = {
  Buy: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50',
  Hold: 'text-yellow-400 bg-yellow-950/50 border-yellow-800/50',
  Skip: 'text-red-400 bg-red-950/50 border-red-800/50',
};

/* ----- Hobby Boxes ----- */
const hobbyBoxes: BoxPick[] = [
  {
    name: '2024 Topps Chrome Baseball Hobby',
    sport: 'Baseball',
    price: '$280\u2013$350',
    hits: '2 autographs per box, multiple refractors',
    keyCards: 'Paul Skenes RC Auto, Jackson Merrill RC, Wyatt Langford RC, Colton Cowser RC refractors',
    verdict: 'Buy',
    verdictNote: 'Strong checklist with proven ROY-caliber rookies and accessible price point. The flagship Chrome product remains the gold standard.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+topps+chrome+baseball+hobby+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024-25 Panini Prizm Basketball Hobby',
    sport: 'Basketball',
    price: '$600\u2013$800',
    hits: '2 autographs, 12 Prizm parallels per box',
    keyCards: 'Wembanyama 2nd-year Prizm parallels, Zach Edey RC, Stephon Castle RC, Reed Sheppard RC',
    verdict: 'Buy',
    verdictNote: 'Wembanyama 2nd-year parallels drive premium demand. Stacked 2024 rookie class with multiple franchise cornerstones. Prizm is basketball\'s Chrome.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+panini+prizm+basketball+hobby+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024 Panini Prizm Football Hobby',
    sport: 'Football',
    price: '$700\u2013$900',
    hits: '3 autographs, 12 Prizm parallels per box',
    keyCards: 'Caleb Williams RC Auto, Jayden Daniels RC, Bo Nix RC, Malik Nabers RC, Marvin Harrison Jr. RC',
    verdict: 'Buy',
    verdictNote: 'Three autos per box with the deepest QB class in years. Williams + Daniels alone justify the entry. Premium pricing but elite hit rate.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+panini+prizm+football+hobby+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024-25 Upper Deck Series 1 Hockey Hobby',
    sport: 'Hockey',
    price: '$120\u2013$160',
    hits: '6 Young Guns per box, possible auto/jersey inserts',
    keyCards: 'Macklin Celebrini YG, Matvei Michkov YG, Cutter Gauthier YG, Ivan Demidov YG',
    verdict: 'Buy',
    verdictNote: 'Best value hobby box on this list. Six Young Guns per box at $120\u2013$160 is outstanding. Celebrini and Michkov YGs are the headline chase.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+series+1+hockey+hobby+box&_sacat=0&LH_BIN=1',
  },
];

/* ----- Retail / Blaster Boxes ----- */
const retailBoxes: BoxPick[] = [
  {
    name: '2024 Topps Series 1 Baseball Blaster',
    sport: 'Baseball',
    price: '$25\u2013$30',
    hits: '1 exclusive relic or commemorative patch per box, parallels possible',
    keyCards: 'Elly De La Cruz, Gunnar Henderson, Jackson Chourio base/parallels',
    verdict: 'Buy',
    verdictNote: 'The best entry point in the hobby. Under $30 for a legit rip with real rookie content. Perfect for new collectors and kids.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+topps+series+1+baseball+blaster+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024-25 Donruss Basketball Blaster',
    sport: 'Basketball',
    price: '$30\u2013$40',
    hits: '1 auto or memorabilia card, Rated Rookies in every box',
    keyCards: 'Zach Edey Rated Rookie, Reed Sheppard RR, Stephon Castle RR, Holo parallels',
    verdict: 'Buy',
    verdictNote: 'Rated Rookies are iconic designs with real collector demand. Donruss is the best non-Prizm basketball product at retail.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+donruss+basketball+blaster+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024 Donruss Football Blaster',
    sport: 'Football',
    price: '$25\u2013$35',
    hits: '1 auto or memorabilia, Rated Rookies throughout',
    keyCards: 'Caleb Williams Rated Rookie, Jayden Daniels RR, Marvin Harrison Jr. RR, Bo Nix RR',
    verdict: 'Buy',
    verdictNote: 'Under $35 for a crack at the top QB class in years. Rated Rookies from this class have long-term hold potential.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+donruss+football+blaster+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024-25 Upper Deck Series 1 Hockey Blaster',
    sport: 'Hockey',
    price: '$25\u2013$30',
    hits: '1 Young Guns per box guaranteed, possible jersey card',
    keyCards: 'Macklin Celebrini Young Guns, Matvei Michkov YG, bonus pack exclusives',
    verdict: 'Buy',
    verdictNote: 'One guaranteed Young Guns at blaster price is the best sealed deal in hockey. Celebrini YG hunt makes this a must-buy.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+series+1+hockey+blaster+box&_sacat=0&LH_BIN=1',
  },
];

/* ----- Value Boxes ----- */
const valueBoxes: BoxPick[] = [
  {
    name: '2024 Topps Chrome Update Baseball',
    sport: 'Baseball',
    price: '$50\u2013$70',
    hits: '1 auto per box, refractor parallels',
    keyCards: 'Paul Skenes Chrome Update RC, Jackson Merrill, late-season callup rookies, refractor parallels',
    verdict: 'Buy',
    verdictNote: 'The sweet spot between hobby and blaster. One guaranteed auto plus Chrome refractors of the full 2024 rookie class at a mid-tier price.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+topps+chrome+update+baseball+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024-25 NBA Hoops Basketball',
    sport: 'Basketball',
    price: '$15\u2013$25',
    hits: '1 auto or insert per box, full rookie checklist',
    keyCards: 'Zach Edey RC, Reed Sheppard RC, Stephon Castle RC, Slam Dunk inserts, Artist Proof parallels',
    verdict: 'Buy',
    verdictNote: 'The cheapest way into the 2024-25 basketball rookie class. Hoops is undervalued as a brand \u2014 the base RCs are clean and the entry price is unbeatable.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+nba+hoops+basketball+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024 Mosaic Football',
    sport: 'Football',
    price: '$40\u2013$60',
    hits: '1 auto per box, mosaic parallels throughout',
    keyCards: 'Caleb Williams Mosaic RC, Jayden Daniels, Bo Nix, color burst and stained glass parallels',
    verdict: 'Buy',
    verdictNote: 'Mosaic parallels are among the best-looking in the hobby. Mid-tier price, elite QB class, and visually stunning inserts.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+mosaic+football+box&_sacat=0&LH_BIN=1',
  },
  {
    name: '2024-25 Upper Deck MVP Hockey',
    sport: 'Hockey',
    price: '$15\u2013$20',
    hits: 'No guaranteed hits, but prospect inserts and parallels throughout',
    keyCards: 'Celebrini, Michkov, Bedard 2nd-year parallels, silver script variants',
    verdict: 'Hold',
    verdictNote: 'At $15\u2013$20 the risk is minimal. No guaranteed hits hurts EV, but the entry price and fun factor make it a fine casual rip. Don\'t expect ROI.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+mvp+hockey+box&_sacat=0&LH_BIN=1',
  },
];

/* ----- FAQ ----- */
interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What's the best card box to buy for beginners?",
    answer:
      'Start with retail blasters in the $25\u2013$35 range. 2024 Topps Series 1 Baseball and 2024-25 Upper Deck Series 1 Hockey are the best entry points \u2014 real rookie content, recognizable brands, and low enough cost that a bad box doesn\'t sting. Avoid high-end hobby boxes until you know what you enjoy collecting.',
  },
  {
    question: 'Are hobby boxes worth more than retail?',
    answer:
      'Generally yes. Hobby boxes guarantee autographs and numbered parallels that retail boxes don\'t. The expected value per dollar is usually higher for hobby, but the entry price is also 5\u201330x higher. Retail is better for casual fun; hobby is better for chasing specific high-value hits.',
  },
  {
    question: 'When is the best time to buy sealed boxes?',
    answer:
      'Buy sealed boxes within the first 2\u20134 weeks of release when retail stores still have stock at MSRP, or 6\u201312 months after release when hype has cooled and secondary market prices dip. Avoid buying during initial hype peaks when flippers inflate prices 2\u20133x above MSRP.',
  },
  {
    question: 'Should I rip or hold sealed boxes?',
    answer:
      'It depends on your goal. Sealed boxes generally appreciate 3\u20135% annually as supply dwindles, but only for products with lasting demand (flagship releases like Topps Chrome, Prizm, Upper Deck Series 1). Most non-flagship products lose value. If you enjoy the hobby, rip. If you\'re purely investing, buy singles instead \u2014 they have better risk-adjusted returns than sealed wax.',
  },
  {
    question: 'How do I calculate the expected value of a box?',
    answer:
      'Add up the average eBay sold prices for every card you could pull, weighted by pull rates (usually listed on the box or manufacturer website). Divide total by number of boxes needed to pull those cards. Most hobby boxes have an EV of 50\u201380% of purchase price \u2014 the house always has an edge. Use our Sealed EV Calculator at /tools/sealed-ev for quick math.',
  },
];

/* ----- Tips ----- */
const tips = [
  { title: 'Buy at MSRP whenever possible', desc: 'Retail stores, Fanatics/Topps direct, and reputable online dealers sell at or near MSRP. Paying 2x on the secondary market kills your EV before you open the box.' },
  { title: 'Know the checklist before you buy', desc: 'A box is only as good as its checklist. Look up the full rookie and insert checklist to confirm the players you want are actually in the product.' },
  { title: 'Compare box EV to singles prices', desc: 'If the specific card you want can be bought as a single for less than 1\u20132 box prices, just buy the single. Ripping is entertainment; singles are investment.' },
  { title: 'Track hit rates, not YouTube breaks', desc: 'Breakers show their best pulls, not their average. Check community-reported hit rates on forums like Blowout Cards for realistic expectations.' },
  { title: 'Set a box budget and stick to it', desc: 'Decide before each month how much you\'ll spend on sealed wax. The dopamine of ripping makes it easy to overspend. Treat it like an entertainment budget, not an investment.' },
];

/* ----- Related Tools ----- */
const relatedTools = [
  { href: '/tools/sealed-ev', title: 'Sealed Box EV Calculator', desc: 'Calculate expected value of any sealed product' },
  { href: '/tools/wax-vs-singles', title: 'Wax vs Singles Analyzer', desc: 'Compare ROI of buying boxes vs. individual cards' },
  { href: '/tools/pack-sim', title: 'Pack Simulator', desc: 'Simulate opening packs without spending money' },
  { href: '/tools/rip-or-hold', title: 'Rip or Hold Advisor', desc: 'Should you open or keep your sealed wax?' },
  { href: '/tools/sealed-yield', title: 'Sealed Yield Tracker', desc: 'Track sealed product appreciation over time' },
];

/* ------------------------------------------------------------------ */
/*  Component helpers                                                  */
/* ------------------------------------------------------------------ */

function BoxCard({ box }: { box: BoxPick }) {
  const accent = sportAccent[box.sport];
  return (
    <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{accent.icon}</span>
          <div>
            <h3 className="text-white font-bold text-base sm:text-lg leading-tight">{box.name}</h3>
            <p className={`text-xs font-medium mt-0.5 ${accent.text}`}>{box.sport}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${verdictColor[box.verdict]}`}>
          {box.verdict}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/60 rounded-lg p-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Price Range</p>
          <p className="text-emerald-400 text-sm font-semibold mt-0.5">{box.price}</p>
        </div>
        <div className="bg-gray-900/60 rounded-lg p-3">
          <p className="text-gray-500 text-xs uppercase tracking-wide">Hits</p>
          <p className="text-white text-sm font-medium mt-0.5">{box.hits}</p>
        </div>
      </div>

      <div className="bg-gray-900/60 rounded-lg p-3 mb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wide">Key Cards to Chase</p>
        <p className="text-gray-300 text-sm mt-0.5">{box.keyCards}</p>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-3">{box.verdictNote}</p>

      <a
        href={box.ebaySearch}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${accent.text} hover:underline transition-colors`}
      >
        Search on eBay <span>&#8599;</span>
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BestBoxes2025Page() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* JSON-LD: Article */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: metadata.title as string,
        description: metadata.description as string,
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: BASE },
        datePublished: '2026-04-15',
        dateModified: '2026-04-15',
        url: `${BASE}/guides/best-boxes-2025`,
      }} />

      {/* JSON-LD: FAQPage */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      {/* JSON-LD: BreadcrumbList */}
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE}/guides` },
          { '@type': 'ListItem', position: 3, name: 'Best Boxes 2025' },
        ],
      }} />

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Guides', href: '/guides' },
        { label: 'Best Boxes 2025' },
      ]} />

      {/* ---- Header ---- */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          Updated April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Best Sports Card Boxes to Buy in 2025
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          Our picks for the best hobby boxes, retail blasters, and value products across baseball, basketball, football, and hockey. Every box ranked on hit rates, checklist quality, expected value, and resale demand.
        </p>
      </div>

      {/* ---- Intro ---- */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">The 2025 Box Market</h2>
        <div className="text-gray-300 text-sm leading-relaxed space-y-3">
          <p>
            The 2024-25 product cycle is one of the strongest in years. Baseball has a deep rookie class headlined by Paul Skenes and Jackson Merrill. Basketball features Victor Wembanyama second-year Prizm alongside a loaded 2024 draft class. Football delivered the most exciting QB class since 2021 with Caleb Williams, Jayden Daniels, and Bo Nix. And hockey gave us Macklin Celebrini and Matvei Michkov Young Guns &mdash; the most anticipated hockey rookie class since McDavid and Eichel.
          </p>
          <p>
            Prices have stabilized from the pandemic-era highs, making 2025 one of the best buying windows in recent memory. Whether you rip for fun or invest for returns, there is a box at every price point worth your money.
          </p>
        </div>
      </section>

      {/* ---- How We Picked ---- */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-3">How We Picked</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'EV Analysis', desc: 'Expected value vs. box price based on eBay sold comps for all auto and parallel inserts.' },
            { label: 'Hit Rates', desc: 'Guaranteed autos, numbered parallels, and chase insert frequency per box.' },
            { label: 'Checklist Quality', desc: 'Strength of the rookie class and star content. A box is only as good as its checklist.' },
            { label: 'Resale Demand', desc: 'Secondary market liquidity for the product and its key singles. Can you sell what you pull?' },
          ].map(m => (
            <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-amber-400 font-bold text-sm">{m.label}</p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Best Hobby Boxes ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">Best Hobby Boxes</h2>
        <p className="text-gray-400 text-sm mb-6">Premium products with guaranteed autographs and the highest expected value per box. Entry price: $120&ndash;$900.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hobbyBoxes.map(box => (
            <BoxCard key={box.name} box={box} />
          ))}
        </div>
      </section>

      {/* ---- Best Retail / Blaster Boxes ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">Best Retail / Blaster Boxes</h2>
        <p className="text-gray-400 text-sm mb-6">Affordable products available at retail stores. Best for beginners and casual collectors. Entry price: $25&ndash;$40.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {retailBoxes.map(box => (
            <BoxCard key={box.name} box={box} />
          ))}
        </div>
      </section>

      {/* ---- Best Value Boxes ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-2">Best Value Boxes</h2>
        <p className="text-gray-400 text-sm mb-6">Mid-tier products that balance price and content. More hit potential than blasters without the hobby box price tag. Entry price: $15&ndash;$70.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {valueBoxes.map(box => (
            <BoxCard key={box.name} box={box} />
          ))}
        </div>
      </section>

      {/* ---- Box Buying Tips ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Box Buying Tips</h2>
        <div className="space-y-4">
          {tips.map((tip, i) => (
            <div key={tip.title} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <span className="text-amber-400 font-bold text-lg mt-0.5">{i + 1}</span>
              <div>
                <p className="text-white font-semibold text-sm">{tip.title}</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <details key={item.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-semibold text-sm flex items-center justify-between">
                {item.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ---- Related Tools ---- */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedTools.map(tool => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group block border border-gray-800 rounded-xl p-4 hover:border-amber-500/40 transition-colors"
            >
              <p className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors">{tool.title}</p>
              <p className="text-gray-500 text-xs mt-1">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Disclaimer ---- */}
      <div className="mb-12 bg-amber-950/20 border border-amber-800/30 rounded-xl p-5">
        <p className="text-amber-300 font-semibold text-sm mb-1">Disclaimer</p>
        <p className="text-gray-400 text-sm leading-relaxed">
          Box prices and hit rates are based on current market data and manufacturer specs as of early 2025. Prices fluctuate based on supply and demand. Expected value calculations are estimates &mdash; actual results vary. CardVault has no affiliation with any manufacturer or retailer. Buy responsibly.
        </p>
      </div>

      {/* ---- Navigation ---- */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-800">
        <Link href="/guides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          <span>&#8592;</span> All Guides
        </Link>
        <Link href="/guides/best-rookie-cards-2026" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          Best Rookie Cards 2026 <span>&#8594;</span>
        </Link>
      </div>
    </div>
  );
}
