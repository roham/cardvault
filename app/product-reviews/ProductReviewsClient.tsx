'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type Verdict = 'Buy' | 'Hold' | 'Avoid';
type Format = 'Hobby' | 'Retail' | 'Value';
type Sport = 'baseball' | 'basketball' | 'football' | 'hockey';

interface ProductReview {
  id: string;
  name: string;
  manufacturer: string;
  year: string;
  sport: Sport;
  format: Format;
  rating: number;
  priceRange: string;
  hitsPerBox: string;
  cardsPerBox: number;
  keyCards: string[];
  pros: string[];
  cons: string[];
  verdict: Verdict;
  bestFor: string;
  summary: string;
  ebaySearch: string;
}

const sportColors: Record<Sport, { bg: string; border: string; text: string; badge: string }> = {
  baseball: { bg: 'bg-rose-950/40', border: 'border-rose-800/40', text: 'text-rose-400', badge: 'bg-rose-900/60 text-rose-300' },
  basketball: { bg: 'bg-orange-950/40', border: 'border-orange-800/40', text: 'text-orange-400', badge: 'bg-orange-900/60 text-orange-300' },
  football: { bg: 'bg-blue-950/40', border: 'border-blue-800/40', text: 'text-blue-400', badge: 'bg-blue-900/60 text-blue-300' },
  hockey: { bg: 'bg-cyan-950/40', border: 'border-cyan-800/40', text: 'text-cyan-400', badge: 'bg-cyan-900/60 text-cyan-300' },
};

const sportIcons: Record<Sport, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };
const verdictColors: Record<Verdict, string> = { Buy: 'text-emerald-400', Hold: 'text-amber-400', Avoid: 'text-red-400' };
const verdictBg: Record<Verdict, string> = { Buy: 'bg-emerald-900/60 border-emerald-700/40', Hold: 'bg-amber-900/60 border-amber-700/40', Avoid: 'bg-red-900/60 border-red-700/40' };

const products: ProductReview[] = [
  {
    id: 'topps-chrome-2024-baseball',
    name: '2024 Topps Chrome Baseball',
    manufacturer: 'Topps',
    year: '2024',
    sport: 'baseball',
    format: 'Hobby',
    rating: 8.5,
    priceRange: '$200-$260',
    hitsPerBox: '2 autos per hobby box',
    cardsPerBox: 24,
    keyCards: ['Paul Skenes RC Auto', 'Jackson Chourio RC Refractor', 'Shota Imanaga RC', 'Wyatt Langford RC', 'Colton Cowser RC'],
    pros: ['Stacked 2024 rookie class with Skenes, Chourio, Imanaga', 'Chrome Refractor parallels hold long-term value', 'Two guaranteed autographs per hobby box'],
    cons: ['Hobby box prices elevated due to demand', 'Base card design similar to past years', 'Autograph checklist diluted with veterans'],
    verdict: 'Buy',
    bestFor: 'Investors and serious collectors who want the flagship chrome rookie product',
    summary: 'The crown jewel of 2024 baseball. The rookie class is the deepest in years — Skenes, Chourio, and Imanaga headline a group of 15+ impactful rookies. Chrome refractors remain the gold standard for modern card investing. Hobby boxes are pricey but deliver consistent hits.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+topps+chrome+baseball+hobby+box',
  },
  {
    id: 'topps-series-1-2025-baseball',
    name: '2025 Topps Series 1 Baseball',
    manufacturer: 'Topps',
    year: '2025',
    sport: 'baseball',
    format: 'Hobby',
    rating: 7.5,
    priceRange: '$100-$140',
    hitsPerBox: '1 auto or relic per hobby box',
    cardsPerBox: 24,
    keyCards: ['Paul Skenes 2nd Year', 'Jackson Chourio 2nd Year', 'Charlie Condon RC', 'Travis Bazzana RC', 'Jac Caglianone RC'],
    pros: ['First major product of 2025 — fresh checklist', 'Affordable hobby boxes compared to Chrome', 'Strong draft class rookies (Bazzana, Condon)'],
    cons: ['Only one guaranteed hit per hobby box', 'Base cards have limited long-term value', '2025 rookies unproven at MLB level'],
    verdict: 'Hold',
    bestFor: 'Collectors who want early access to 2025 rookies at a reasonable price',
    summary: 'The traditional season opener. Series 1 gives you first crack at 2025 rookies like Bazzana (#1 pick) and Condon, plus second-year cards of the loaded 2024 class. Value is decent at retail but hobby boxes are a coin flip with only one guaranteed hit.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2025+topps+series+1+baseball+hobby+box',
  },
  {
    id: 'bowman-chrome-2024-baseball',
    name: '2024 Bowman Chrome Baseball',
    manufacturer: 'Topps',
    year: '2024',
    sport: 'baseball',
    format: 'Hobby',
    rating: 8.0,
    priceRange: '$250-$320',
    hitsPerBox: '2 autos per hobby box (prospect autos)',
    cardsPerBox: 24,
    keyCards: ['Roki Sasaki Prospect Auto', 'Chase Burns 1st Chrome', 'Jac Caglianone 1st Chrome', 'Travis Bazzana 1st Chrome', 'Charlie Condon 1st Chrome'],
    pros: ['1st Bowman Chrome cards of top 2024 draft picks', 'Prospect autos are the lottery tickets of baseball cards', 'Strong international prospect checklist'],
    cons: ['Most prospect autos never reach the majors', 'High price point with risky returns', 'Prospect fatigue — same names across multiple products'],
    verdict: 'Buy',
    bestFor: 'Speculative investors willing to bet on future stars',
    summary: 'Bowman Chrome is the prospect bible. The 2024 edition features 1st Chrome cards of the loaded 2024 draft class plus international stars like Roki Sasaki. High risk, high reward — one hit prospect auto can pay for a case.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+bowman+chrome+baseball+hobby+box',
  },
  {
    id: 'topps-stadium-club-2024-baseball',
    name: '2024 Topps Stadium Club Baseball',
    manufacturer: 'Topps',
    year: '2024',
    sport: 'baseball',
    format: 'Hobby',
    rating: 7.0,
    priceRange: '$120-$160',
    hitsPerBox: '2 autos per hobby box',
    cardsPerBox: 16,
    keyCards: ['Paul Skenes RC Photo Variation', 'Jackson Chourio RC', 'Shota Imanaga RC', 'Elly De La Cruz 2nd Year', 'Fernando Tatis Jr. SP'],
    pros: ['Best photography in the hobby — full-bleed action shots', 'Two guaranteed autos at a reasonable price', 'Underrated long-term collectibility for design lovers'],
    cons: ['Lower resale value than Chrome or Prizm products', 'Fewer chase parallels compared to flagship', 'Shorter print run means less retail availability'],
    verdict: 'Hold',
    bestFor: 'Design-focused collectors who value photography over investment returns',
    summary: 'Stadium Club is the art gallery of sports cards. Full-bleed photography, no borders, pure baseball beauty. The 2024 edition features the same stacked rookie class in arguably the best-looking format. Two autos per box at a fair price. Buy for the beauty, not the investment.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+topps+stadium+club+baseball+hobby+box',
  },
  {
    id: 'prizm-2024-25-basketball',
    name: '2024-25 Panini Prizm Basketball',
    manufacturer: 'Panini',
    year: '2024-25',
    sport: 'basketball',
    format: 'Hobby',
    rating: 9.0,
    priceRange: '$600-$800',
    hitsPerBox: '2 autos, 12 Prizm parallels per hobby box',
    cardsPerBox: 12,
    keyCards: ['Zaccharie Risacher Silver Prizm RC', 'Alex Sarr RC Auto', 'Dalton Knecht RC', 'Reed Sheppard RC', 'Stephon Castle RC'],
    pros: ['The most collected basketball product in the world', 'Silver Prizms are the modern benchmark for RC value', 'Deep 2024 rookie class with international talent'],
    cons: ['Extremely expensive hobby boxes', 'Only 12 cards per pack — thin margin for error', 'Base Prizms carry little value without parallel color'],
    verdict: 'Buy',
    bestFor: 'Serious basketball collectors and investors who want the flagship product',
    summary: 'Prizm is basketball card royalty. The Silver Prizm parallel is the most recognizable and liquid card in modern collecting. The 2024-25 class features Risacher (#1 pick), Sarr (#2), and a deep supporting cast. Hobby boxes are expensive but Silver RCs from this product set the market.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+panini+prizm+basketball+hobby+box',
  },
  {
    id: 'select-2024-25-basketball',
    name: '2024-25 Panini Select Basketball',
    manufacturer: 'Panini',
    year: '2024-25',
    sport: 'basketball',
    format: 'Hobby',
    rating: 7.5,
    priceRange: '$350-$450',
    hitsPerBox: '3 autos per hobby box',
    cardsPerBox: 12,
    keyCards: ['Zaccharie Risacher Courtside RC', 'Alex Sarr Concourse RC', 'Dalton Knecht Premier Level RC', 'Stephon Castle Courtside', 'Reed Sheppard Tie-Dye'],
    pros: ['Three-tier design (Concourse/Premier/Courtside) creates natural scarcity', 'Three guaranteed autographs per hobby box', 'Tie-Dye and Zebra parallels are among the most striking in the hobby'],
    cons: ['Tier system confuses new collectors', 'Courtside cards often command a premium that inflates perceived value', 'Competes directly with Prizm for wallet share'],
    verdict: 'Hold',
    bestFor: 'Collectors who want more autos per box than Prizm at a lower price point',
    summary: 'Select offers a unique tiered structure — Concourse (silver border), Premier Level (gold), and Courtside (borderless) — creating built-in scarcity. Three autos per box is generous. The downside: Prizm silvers are more liquid. Select is the second-best basketball product, which is still very good.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+panini+select+basketball+hobby+box',
  },
  {
    id: 'donruss-2024-25-basketball',
    name: '2024-25 Panini Donruss Basketball',
    manufacturer: 'Panini',
    year: '2024-25',
    sport: 'basketball',
    format: 'Value',
    rating: 6.5,
    priceRange: '$100-$140',
    hitsPerBox: '1 auto per hobby box, 24 parallels',
    cardsPerBox: 30,
    keyCards: ['Zaccharie Risacher Rated Rookie', 'Alex Sarr Rated Rookie', 'Dalton Knecht Rated Rookie', 'Reed Sheppard Rated Rookie', 'Rob Dillingham Rated Rookie'],
    pros: ['Affordable entry point for basketball collectors', 'Rated Rookies are an iconic and recognized insert', 'High card count per box — lots of ripping fun'],
    cons: ['Base cards have minimal resale value', 'Only one auto per box', 'Parallels are less desirable than Prizm or Select'],
    verdict: 'Hold',
    bestFor: 'Budget collectors and beginners who want to rip packs without breaking the bank',
    summary: 'Donruss is the gateway drug to basketball card collecting. Rated Rookies are an iconic insert that every collector recognizes. At $100-$140, it is the most accessible hobby box in basketball. You will not make money ripping Donruss, but you will have fun and pull some nice rookie cards.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+panini+donruss+basketball+hobby+box',
  },
  {
    id: 'mosaic-2024-25-basketball',
    name: '2024-25 Panini Mosaic Basketball',
    manufacturer: 'Panini',
    year: '2024-25',
    sport: 'basketball',
    format: 'Hobby',
    rating: 7.0,
    priceRange: '$250-$320',
    hitsPerBox: '2 autos, 15 Mosaic parallels per hobby box',
    cardsPerBox: 15,
    keyCards: ['Zaccharie Risacher Mosaic RC', 'Alex Sarr Mosaic Silver RC', 'Dalton Knecht Stained Glass', 'National Pride inserts', 'Stephon Castle Genesis'],
    pros: ['Mosaic pattern parallels are visually stunning', 'Stained Glass and Genesis inserts are highly collectible', 'More affordable than Prizm with similar design appeal'],
    cons: ['Secondary market for Mosaic parallels is softer than Prizm', 'Some collectors find the pattern design too busy', 'Auto checklist can be hit-or-miss'],
    verdict: 'Hold',
    bestFor: 'Visual collectors who love colorful parallels and unique designs',
    summary: 'Mosaic sits between Donruss (budget) and Prizm (premium) in the Panini basketball lineup. The signature mosaic pattern creates some of the most eye-catching cards in the hobby, especially in Stained Glass and Genesis variants. Good value at the price, but Prizm silvers are more liquid if you are investing.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+panini+mosaic+basketball+hobby+box',
  },
  {
    id: 'prizm-2024-football',
    name: '2024 Panini Prizm Football',
    manufacturer: 'Panini',
    year: '2024',
    sport: 'football',
    format: 'Hobby',
    rating: 8.5,
    priceRange: '$500-$650',
    hitsPerBox: '3 autos, 12 Prizm parallels per hobby box',
    cardsPerBox: 12,
    keyCards: ['Caleb Williams Silver Prizm RC', 'Jayden Daniels RC Auto', 'Marvin Harrison Jr. Silver Prizm RC', 'Drake Maye RC', 'Bo Nix RC Auto'],
    pros: ['Deepest QB draft class in years — Williams, Daniels, Maye, Nix, McCarthy, Penix', 'Silver Prizm RCs are the benchmark for modern football cards', 'Three guaranteed autographs per hobby box'],
    cons: ['Expensive hobby boxes — QB-heavy draft inflates prices', 'Panini losing NFL license means this may be final year', 'Base Prizm cards without color are nearly worthless'],
    verdict: 'Buy',
    bestFor: 'Football collectors who want the definitive 2024 rookie product',
    summary: 'The 2024 NFL Draft produced the deepest QB class in a decade, and Prizm Football is where those rookies matter most. Caleb Williams, Jayden Daniels (ROY favorite), and Marvin Harrison Jr. headline a class that could define football cards for the next decade. Potentially the last Panini NFL Prizm — could add scarcity premium.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+panini+prizm+football+hobby+box',
  },
  {
    id: 'contenders-2024-football',
    name: '2024 Panini Contenders Football',
    manufacturer: 'Panini',
    year: '2024',
    sport: 'football',
    format: 'Hobby',
    rating: 8.0,
    priceRange: '$350-$450',
    hitsPerBox: '5-6 autos per hobby box',
    cardsPerBox: 18,
    keyCards: ['Caleb Williams Rookie Ticket Auto', 'Jayden Daniels Rookie Ticket Auto', 'Marvin Harrison Jr. Rookie Ticket', 'Drake Maye Rookie Ticket Auto', 'Brock Bowers Rookie Ticket Auto'],
    pros: ['Rookie Ticket Autos are the most iconic football card insert', 'Five to six guaranteed autographs — highest auto count of any major product', 'Strong checklist with all top 2024 draftees'],
    cons: ['Many autos are late-round picks with little value', 'Variation/SP system can be confusing for new collectors', 'Sticker autos on base Rookie Tickets reduce appeal'],
    verdict: 'Buy',
    bestFor: 'Auto chasers who want the most autographs per dollar spent',
    summary: 'Contenders is the auto hunter\'s paradise. Five to six guaranteed autographs per box means you are pulling signatures every few packs. The Rookie Ticket Auto is one of the most recognized and valued inserts in football cards. The 2024 QB class gives this product a massive ceiling — a Williams or Daniels Rookie Ticket Auto variation could be a five-figure card.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+panini+contenders+football+hobby+box',
  },
  {
    id: 'mosaic-2024-football',
    name: '2024 Panini Mosaic Football',
    manufacturer: 'Panini',
    year: '2024',
    sport: 'football',
    format: 'Value',
    rating: 7.0,
    priceRange: '$200-$260',
    hitsPerBox: '2 autos, 15 Mosaic parallels per hobby box',
    cardsPerBox: 15,
    keyCards: ['Caleb Williams Mosaic RC', 'Jayden Daniels Silver Mosaic RC', 'Marvin Harrison Jr. Stained Glass', 'Bo Nix Genesis RC', 'Malik Nabers Mosaic RC'],
    pros: ['More affordable than Prizm or Contenders', 'Stained Glass and Genesis inserts look incredible', 'Mosaic pattern gives cards a premium feel at a mid-tier price'],
    cons: ['Mosaic parallels less liquid than Prizm silvers', 'Two autos per box — some are low-value signers', 'Not the product to chase if you want maximum investment returns'],
    verdict: 'Hold',
    bestFor: 'Value-conscious collectors who want colorful football cards without paying Prizm prices',
    summary: 'Mosaic Football is the sweet spot between budget and premium. The mosaic-pattern parallels are visually striking, and inserts like Stained Glass and Genesis are genuine chase cards. Two autos and 15 parallels per box is fair at the price. Not the product for pure investors, but great for collectors who appreciate design.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+panini+mosaic+football+hobby+box',
  },
  {
    id: 'topps-chrome-2024-football',
    name: '2024 Topps Chrome Football',
    manufacturer: 'Topps',
    year: '2024',
    sport: 'football',
    format: 'Hobby',
    rating: 7.5,
    priceRange: '$180-$240',
    hitsPerBox: '1 auto per hobby box',
    cardsPerBox: 24,
    keyCards: ['Caleb Williams Chrome RC', 'Jayden Daniels Chrome Refractor RC', 'Marvin Harrison Jr. Chrome RC', 'Drake Maye Chrome Auto', 'Malik Nabers Chrome RC'],
    pros: ['Topps Chrome is back in football for the first time in years', 'Refractor parallels bring the baseball Chrome prestige to football', 'Historic product — could become iconic as Topps re-enters the NFL market'],
    cons: ['Only one auto per hobby box — thin hit rate for the price', 'Brand recognition still building vs established Panini products', 'Chrome base cards alone do not hold much value'],
    verdict: 'Hold',
    bestFor: 'Collectors betting on Topps as the future of football cards after the license transition',
    summary: 'Topps returns to football with Chrome, and the collecting world is watching. The refractor technology that made Chrome baseball iconic now applies to the 2024 NFL class. One auto per box is light, but this product could gain long-term significance as Topps takes over the NFL license. A speculative bet on the future.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024+topps+chrome+football+hobby+box',
  },
  {
    id: 'upper-deck-series-1-2024-25-hockey',
    name: '2024-25 Upper Deck Series 1 Hockey',
    manufacturer: 'Upper Deck',
    year: '2024-25',
    sport: 'hockey',
    format: 'Hobby',
    rating: 8.0,
    priceRange: '$120-$160',
    hitsPerBox: '6 Young Guns RCs per hobby box, no guaranteed auto',
    cardsPerBox: 24,
    keyCards: ['Macklin Celebrini Young Guns RC', 'Cutter Gauthier Young Guns', 'Matvei Michkov Young Guns', 'Cole Eiserman Canvas YG', 'Ivan Demidov Young Guns'],
    pros: ['Young Guns are the undisputed king of hockey rookie cards', 'Celebrini and Michkov headline the strongest YG class in years', 'Most affordable major hobby box across all four sports'],
    cons: ['No guaranteed autographs — must chase Young Guns instead', 'Base cards have virtually zero value', 'Upper Deck has exclusive NHL license — no competition means higher prices'],
    verdict: 'Buy',
    bestFor: 'Hockey collectors chasing the flagship Young Guns rookie cards',
    summary: 'Upper Deck Series 1 is hockey\'s Prizm — the product that defines rookie card value. The 2024-25 Young Guns class features Macklin Celebrini (#1 pick, potential generational talent) and Matvei Michkov (Flyers, electrifying Russian winger). At $120-$160, it is the most affordable flagship hobby box in the hobby. Six Young Guns per box is generous.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+series+1+hockey+hobby+box',
  },
  {
    id: 'upper-deck-mvp-2024-25-hockey',
    name: '2024-25 Upper Deck MVP Hockey',
    manufacturer: 'Upper Deck',
    year: '2024-25',
    sport: 'hockey',
    format: 'Value',
    rating: 6.0,
    priceRange: '$30-$50',
    hitsPerBox: 'No autos — parallel and insert chase',
    cardsPerBox: 36,
    keyCards: ['Macklin Celebrini MVP RC', 'Super Script parallels (/25)', 'Silver Script parallels', 'Colors & Contours die-cuts', 'Top Prospects inserts'],
    pros: ['Ultra-affordable — cheapest hobby box in any sport', '36 packs per box — tons of ripping content', 'Good for teaching kids about card collecting'],
    cons: ['Almost no secondary market value for any card', 'No autographs or memorabilia cards', 'Design is basic compared to premium products'],
    verdict: 'Avoid',
    bestFor: 'Parents buying for kids or casual fans who just want to rip packs',
    summary: 'MVP is Upper Deck\'s budget line and it shows. At $30-$50 per box, you get 36 packs of ripping fun with zero expectation of hitting anything valuable. The Super Script (/25) parallels are the only chase, and even those sell for modest amounts. Buy this for the experience, not the investment. Great gift for young hockey fans.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+mvp+hockey+hobby+box',
  },
  {
    id: 'upper-deck-allure-2024-25-hockey',
    name: '2024-25 Upper Deck Allure Hockey',
    manufacturer: 'Upper Deck',
    year: '2024-25',
    sport: 'hockey',
    format: 'Hobby',
    rating: 6.5,
    priceRange: '$80-$110',
    hitsPerBox: '3 rookies per box, chance at auto',
    cardsPerBox: 20,
    keyCards: ['Macklin Celebrini Allure RC', 'Matvei Michkov Allure RC', 'Triple Diamond parallels', 'Blue Sapphire /99', 'White Rainbow /99'],
    pros: ['Clean, chromium-style card design', 'Triple Diamond parallels are visually appealing', 'Affordable mid-tier product with rookie chase'],
    cons: ['No guaranteed autographs', 'Competes with Series 1 for hobby dollar — Series 1 usually wins', 'Allure RCs are less valuable than Young Guns RCs'],
    verdict: 'Avoid',
    bestFor: 'Collectors who like the chromium look but cannot afford Series 1 hobby boxes',
    summary: 'Allure occupies an awkward middle ground in hockey. It costs more than MVP but less than Series 1, yet neither the autos (not guaranteed) nor the rookies (less valued than Young Guns) give it a clear identity. The chromium design is nice but not enough to justify the price when Series 1 hobby boxes are only $40-$50 more and include six Young Guns.',
    ebaySearch: 'https://www.ebay.com/sch/i.html?_nkw=2024-25+upper+deck+allure+hockey+hobby+box',
  },
];

function getRatingColor(rating: number): string {
  if (rating >= 8.5) return 'text-emerald-400';
  if (rating >= 7.0) return 'text-amber-400';
  return 'text-red-400';
}

function getRatingBar(rating: number): string {
  if (rating >= 8.5) return 'bg-emerald-500';
  if (rating >= 7.0) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function ProductReviewsClient() {
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name'>('rating');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...products];
    if (sportFilter !== 'all') list = list.filter(p => p.sport === sportFilter);
    if (verdictFilter !== 'all') list = list.filter(p => p.verdict === verdictFilter);
    if (formatFilter !== 'all') list = list.filter(p => p.format === formatFilter);
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price') {
      list.sort((a, b) => {
        const pa = parseInt(a.priceRange.replace(/[^0-9]/g, ''));
        const pb = parseInt(b.priceRange.replace(/[^0-9]/g, ''));
        return pa - pb;
      });
    } else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sportFilter, verdictFilter, formatFilter, sortBy]);

  const stats = useMemo(() => ({
    total: products.length,
    avgRating: (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1),
    buyCount: products.filter(p => p.verdict === 'Buy').length,
    holdCount: products.filter(p => p.verdict === 'Hold').length,
    avoidCount: products.filter(p => p.verdict === 'Avoid').length,
  }), []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Product Release Reviews
        </h1>
        <p className="text-gray-400 text-lg">
          Honest reviews of every major 2024-2025 card product. Ratings, key pulls, and buy/hold/avoid verdicts.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Products Reviewed</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.avgRating}</div>
          <div className="text-xs text-gray-400">Avg Rating</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.buyCount}</div>
          <div className="text-xs text-gray-400">Buy Verdicts</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.holdCount}</div>
          <div className="text-xs text-gray-400">Hold Verdicts</div>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.avoidCount}</div>
          <div className="text-xs text-gray-400">Avoid Verdicts</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Sports</option>
          <option value="baseball">⚾ Baseball</option>
          <option value="basketball">🏀 Basketball</option>
          <option value="football">🏈 Football</option>
          <option value="hockey">🏒 Hockey</option>
        </select>
        <select
          value={verdictFilter}
          onChange={(e) => setVerdictFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Verdicts</option>
          <option value="Buy">✅ Buy</option>
          <option value="Hold">⏸️ Hold</option>
          <option value="Avoid">❌ Avoid</option>
        </select>
        <select
          value={formatFilter}
          onChange={(e) => setFormatFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Formats</option>
          <option value="Hobby">Hobby</option>
          <option value="Retail">Retail</option>
          <option value="Value">Value</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'name')}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="rating">Sort: Rating</option>
          <option value="price">Sort: Price (Low→High)</option>
          <option value="name">Sort: A-Z</option>
        </select>
      </div>

      <div className="text-sm text-gray-500 mb-6">{filtered.length} product{filtered.length !== 1 ? 's' : ''} shown</div>

      {/* Product Cards */}
      <div className="space-y-4">
        {filtered.map((product) => {
          const colors = sportColors[product.sport];
          const isExpanded = expandedId === product.id;
          return (
            <div
              key={product.id}
              className={`rounded-xl border ${colors.border} ${colors.bg} transition-all`}
            >
              {/* Card Header — always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : product.id)}
                className="w-full text-left p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-lg">{sportIcons[product.sport]}</span>
                      <h3 className="text-lg font-bold text-white">{product.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                        {product.sport.charAt(0).toUpperCase() + product.sport.slice(1)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                        {product.format}
                      </span>
                      <span className="text-gray-400">{product.manufacturer}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">{product.priceRange}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getRatingColor(product.rating)}`}>
                        {product.rating}
                      </span>
                      <span className="text-gray-500 text-sm">/10</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${verdictBg[product.verdict]}`}>
                      {product.verdict === 'Buy' ? '✅' : product.verdict === 'Hold' ? '⏸️' : '❌'} {product.verdict.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Rating bar */}
                <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getRatingBar(product.rating)}`}
                    style={{ width: `${product.rating * 10}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-gray-400 text-sm line-clamp-2">{product.summary}</p>
                  <span className="text-gray-500 text-xs ml-2 shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 border-t border-gray-800/50 pt-4 space-y-5">
                  {/* Hit Rate & Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase mb-1">Hits Per Box</div>
                      <div className="text-sm text-white font-medium">{product.hitsPerBox}</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase mb-1">Cards Per Box</div>
                      <div className="text-sm text-white font-medium">{product.cardsPerBox} packs</div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 uppercase mb-1">Best For</div>
                      <div className="text-sm text-white font-medium">{product.bestFor}</div>
                    </div>
                  </div>

                  {/* Key Cards */}
                  <div>
                    <h4 className="text-sm font-bold text-white mb-2">Key Cards to Chase</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.keyCards.map((card, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300 border border-gray-700/50">
                          {card}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400 mb-2">Pros</h4>
                      <ul className="space-y-1">
                        {product.pros.map((pro, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-emerald-500 shrink-0">+</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400 mb-2">Cons</h4>
                      <ul className="space-y-1">
                        {product.cons.map((con, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-red-500 shrink-0">−</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className={`rounded-lg p-4 border ${verdictBg[product.verdict]}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-lg font-bold ${verdictColors[product.verdict]}`}>
                        {product.verdict === 'Buy' ? '✅ BUY' : product.verdict === 'Hold' ? '⏸️ HOLD' : '❌ AVOID'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{product.summary}</p>
                  </div>

                  {/* eBay Link */}
                  <a
                    href={product.ebaySearch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/40 border border-blue-700/40 rounded-lg text-blue-300 text-sm hover:bg-blue-900/60 transition-colors"
                  >
                    Search on eBay →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products match your filters. Try adjusting your criteria.
        </div>
      )}

      {/* Buying Tips */}
      <section className="mt-12 bg-gray-900/40 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Box Buying Tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Set a Budget First', tip: 'Decide how much you can afford to lose before opening. Treat sealed wax as entertainment spending, not investment. Most hobby boxes return less than their purchase price in singles.' },
            { title: 'Check eBay Sold Listings', tip: 'Before buying a box, search eBay for recently sold singles from that product. If the top pull sells for less than the box price, the math does not work for ripping.' },
            { title: 'Buy Singles Over Boxes', tip: 'If you want specific cards, buying them individually is almost always cheaper than trying to pull them from sealed product. Rip for fun, buy singles for collecting.' },
            { title: 'Timing Matters', tip: 'Box prices usually peak at release and drop over the following months. Waiting 2-3 months after release can save 20-30% on hobby boxes. Exception: products with strong rookie classes may hold or increase.' },
            { title: 'Know Your Seller', tip: 'Buy sealed product from authorized dealers, your LCS, or reputable eBay sellers with high feedback. Resealed boxes are a real problem in the hobby — if the price seems too good to be true, it probably is.' },
            { title: 'Track Your Hits', tip: 'Keep a spreadsheet or use our Pack Opening History tool to track what you pull. Over time, you will learn which products give you the best returns and which to avoid.' },
          ].map((t, i) => (
            <div key={i} className="bg-gray-800/40 rounded-lg p-4">
              <h3 className="text-sm font-bold text-white mb-1">{t.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
