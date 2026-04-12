import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Card Release Calendar 2026',
  description: 'Upcoming sports card and Pokémon TCG release dates for 2026. Topps, Bowman, Panini Prizm, National Treasures, Scarlet & Violet, and more.',
};

interface Release {
  id: string;
  name: string;
  brand: string;
  releaseDate: string;
  category: 'baseball' | 'basketball' | 'football' | 'hockey' | 'pokemon';
  type: 'Hobby Box' | 'Retail' | 'Hobby + Retail' | 'Set' | 'Special Collection';
  estimatedHobbyBoxPrice?: string;
  estimatedRetailPrice?: string;
  notes: string;
  status: 'upcoming' | 'released' | 'announced';
}

const releases: Release[] = [
  // Released (last 3 months)
  {
    id: 'topps-2026-s1',
    name: '2026 Topps Series 1 Baseball',
    brand: 'Topps',
    releaseDate: '2026-02-05',
    category: 'baseball',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$130',
    estimatedRetailPrice: '$25 (blaster)',
    notes: 'Headlined by Shohei Ohtani SP photo variations and new Career Highlights insert set. 1 guaranteed auto or relic per hobby box.',
    status: 'released',
  },
  {
    id: 'panini-2025-26-prizm-nba',
    name: '2025-26 Panini Prizm NBA Basketball',
    brand: 'Panini',
    releaseDate: '2026-02-12',
    category: 'basketball',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$200',
    estimatedRetailPrice: '$30 (blaster)',
    notes: 'Bronny James rookie cards headline this season\'s most anticipated NBA product. Prizm Silver parallels of key rookies are the chase.',
    status: 'released',
  },
  {
    id: 'ud-2025-26-series-1-hockey',
    name: '2025-26 Upper Deck Series 1 Hockey',
    brand: 'Upper Deck',
    releaseDate: '2026-01-15',
    category: 'hockey',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$80',
    estimatedRetailPrice: '$20 (blaster)',
    notes: 'Macklin Celebrini and Matvei Michkov lead the Young Guns class. First major hockey set of the 2025-26 season.',
    status: 'released',
  },
  {
    id: 'pokemon-prismatic-evolutions',
    name: 'Pokémon Scarlet & Violet — Prismatic Evolutions',
    brand: 'The Pokémon Company',
    releaseDate: '2026-01-17',
    category: 'pokemon',
    type: 'Set',
    estimatedRetailPrice: '$55 (ETB) · $185 (booster box)',
    notes: 'Eeveelution-themed set broke first-week sales records. Umbreon ex SAR, Jolteon ex SAR lead the chase cards. Elite Trainer Boxes remained scarce at retail for months.',
    status: 'released',
  },
  {
    id: 'panini-2025-mosaic-nfl',
    name: '2025 Panini Mosaic NFL Football',
    brand: 'Panini',
    releaseDate: '2026-02-20',
    category: 'football',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$120',
    estimatedRetailPrice: '$25 (blaster)',
    notes: 'Caleb Williams, Jayden Daniels, and Drake London are the key rookie targets. Mosaic Prizm refractors and Mosaic Gold parallels drive the hobby box premium.',
    status: 'released',
  },
  // Upcoming 2026
  {
    id: 'topps-2026-bowman',
    name: '2026 Bowman Baseball',
    brand: 'Topps',
    releaseDate: '2026-05-07',
    category: 'baseball',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$110',
    estimatedRetailPrice: '$25 (blaster)',
    notes: 'The definitive prospect card set. Jackson Holliday, Druw Jones, Chourio Chrome autos are the primary chase targets. First Bowman auto of a top prospect can be worth $10K+ in PSA 10.',
    status: 'upcoming',
  },
  {
    id: 'pokemon-destined-rivals',
    name: 'Pokémon Scarlet & Violet — Destined Rivals',
    brand: 'The Pokémon Company',
    releaseDate: '2026-05-30',
    category: 'pokemon',
    type: 'Set',
    estimatedRetailPrice: '$55 (ETB) · $185 (booster box)',
    notes: 'Confirmed 180+ cards including new Pokémon ex. Shiny Gardevoir ex and Shiny Sylveon ex are the marquee chase cards. Pre-release weekend May 16-19 at local game stores.',
    status: 'upcoming',
  },
  {
    id: 'panini-prizm-2026-baseball',
    name: '2026 Panini Prizm Baseball',
    brand: 'Panini',
    releaseDate: '2026-06-10',
    category: 'baseball',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$300',
    estimatedRetailPrice: '$40 (blaster)',
    notes: 'Prizm baseball\'s premium price reflects the ultra-popular Prizm Silver and colored refractor parallels. Key autos of Shohei Ohtani and Gunnar Henderson lead anticipated checklists.',
    status: 'upcoming',
  },
  {
    id: 'topps-2026-chrome-baseball',
    name: '2026 Topps Chrome Baseball',
    brand: 'Topps',
    releaseDate: '2026-08-12',
    category: 'baseball',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$180',
    estimatedRetailPrice: '$30 (blaster)',
    notes: 'The premium flagship. Chrome technology on every card. Refractor parallels, colored refractors, and superfractors (1/1) make this the most grading-worthy base set of the season.',
    status: 'announced',
  },
  {
    id: 'topps-2026-series-2',
    name: '2026 Topps Series 2 Baseball',
    brand: 'Topps',
    releaseDate: '2026-07-01',
    category: 'baseball',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$130',
    estimatedRetailPrice: '$25 (blaster)',
    notes: 'Mid-season flagship completing the Series 1 set. Additional short-prints and photo variations typically generate the most collector excitement.',
    status: 'announced',
  },
  {
    id: 'panini-select-2026-nba',
    name: '2025-26 Panini Select NBA Basketball',
    brand: 'Panini',
    releaseDate: '2026-04-15',
    category: 'basketball',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$180',
    estimatedRetailPrice: '$35 (blaster)',
    notes: 'Select\'s three-tiered structure (Concourse, Premier Level, Court Level) creates a natural hierarchy of card value. Bronny James rookie cards across all tiers will be the primary chase.',
    status: 'upcoming',
  },
  {
    id: 'panini-national-treasures-2025-26-nba',
    name: '2025-26 Panini National Treasures NBA',
    brand: 'Panini',
    releaseDate: '2026-08-20',
    category: 'basketball',
    type: 'Hobby Box',
    estimatedHobbyBoxPrice: '$1,200+',
    notes: 'The most premium product in basketball cards. Every card features a game-worn patch or autograph. Rookies numbered to 99 or fewer. NT rookies are career-defining cards for top picks.',
    status: 'announced',
  },
  {
    id: 'panini-prizm-2026-nfl',
    name: '2026 Panini Prizm NFL Football',
    brand: 'Panini',
    releaseDate: '2026-09-09',
    category: 'football',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$300',
    estimatedRetailPrice: '$40 (blaster)',
    notes: 'Releases with the start of the NFL season. Features rookies from the 2026 draft class. Prizm Football is the premier NFL product of the year — top rookies in Silver Prizm can command $1,000+ raw.',
    status: 'announced',
  },
  {
    id: 'panini-contenders-2026-nfl',
    name: '2026 Panini Contenders NFL Football',
    brand: 'Panini',
    releaseDate: '2026-10-14',
    category: 'football',
    type: 'Hobby Box',
    estimatedHobbyBoxPrice: '$200',
    notes: 'Home of the most storied rookie card in NFL history (Brady Contenders Auto). Every hobby box contains rookie ticket autographs. The 2026 class autos will be the most discussed rookie cards of the season.',
    status: 'announced',
  },
  {
    id: 'panini-national-treasures-2026-nfl',
    name: '2026 Panini National Treasures NFL Football',
    brand: 'Panini',
    releaseDate: '2026-12-09',
    category: 'football',
    type: 'Hobby Box',
    estimatedHobbyBoxPrice: '$2,000+',
    notes: 'Ultra-premium. Every card is numbered, game-worn patches, and signed. NT Football is where career-defining rookie patch autos live — numbered /99 or fewer for top picks.',
    status: 'announced',
  },
  {
    id: 'ud-2025-26-series-2-hockey',
    name: '2025-26 Upper Deck Series 2 Hockey',
    brand: 'Upper Deck',
    releaseDate: '2026-04-22',
    category: 'hockey',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$85',
    estimatedRetailPrice: '$20 (blaster)',
    notes: 'Second wave of Young Guns rookies for the 2025-26 class. Often contains the most desirable Young Guns cards of the season since fewer copies circulate early.',
    status: 'upcoming',
  },
  {
    id: 'pokemon-sv-twilight-masquerade-reprint',
    name: 'Pokémon Scarlet & Violet — Surging Sparks Reprint',
    brand: 'The Pokémon Company',
    releaseDate: '2026-05-01',
    category: 'pokemon',
    type: 'Set',
    estimatedRetailPrice: '$55 (ETB)',
    notes: 'Reprint wave for one of the most popular recent sets. Pikachu ex SAR and Iron Thorns ex IR are the primary chase cards from this Pikachu-themed set.',
    status: 'upcoming',
  },
  {
    id: 'panini-select-2026-nfl',
    name: '2026 Panini Select NFL Football',
    brand: 'Panini',
    releaseDate: '2026-10-28',
    category: 'football',
    type: 'Hobby + Retail',
    estimatedHobbyBoxPrice: '$180',
    estimatedRetailPrice: '$35 (blaster)',
    notes: 'Select\'s three-tier structure creates strong price differentiation between common base and Court Level numbered parallels. A strong mid-tier product between Prizm and National Treasures.',
    status: 'announced',
  },
  {
    id: 'pokemon-sv-new-fall-2026',
    name: 'Pokémon Scarlet & Violet — Fall 2026 Set (TBD)',
    brand: 'The Pokémon Company',
    releaseDate: '2026-10-03',
    category: 'pokemon',
    type: 'Set',
    estimatedRetailPrice: '$55 (ETB) · $185 (booster box)',
    notes: 'Title and full details TBD. The Pokémon Company typically releases one major fall set ahead of the holiday season. Expected to feature returning fan-favorite Pokémon with new ex and SAR treatments.',
    status: 'announced',
  },
];

const categoryConfig: Record<Release['category'], { label: string; emoji: string; color: string }> = {
  baseball: { label: 'Baseball', emoji: '⚾', color: 'bg-red-950/60 text-red-400 border-red-800/40' },
  basketball: { label: 'Basketball', emoji: '🏀', color: 'bg-orange-950/60 text-orange-400 border-orange-800/40' },
  football: { label: 'Football', emoji: '🏈', color: 'bg-blue-950/60 text-blue-400 border-blue-800/40' },
  hockey: { label: 'Hockey', emoji: '🏒', color: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40' },
  pokemon: { label: 'Pokémon', emoji: '⚡', color: 'bg-yellow-950/60 text-yellow-400 border-yellow-800/40' },
};

const statusConfig: Record<Release['status'], { label: string; color: string; dot: string }> = {
  released: { label: 'Released', color: 'text-gray-500', dot: 'bg-gray-500' },
  upcoming: { label: 'Upcoming', color: 'text-emerald-400', dot: 'bg-emerald-400 animate-pulse' },
  announced: { label: 'Announced', color: 'text-blue-400', dot: 'bg-blue-400' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function isReleased(dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d <= new Date();
}

function getCountdown(dateStr: string): string | null {
  const now = new Date();
  const target = new Date(dateStr + 'T12:00:00Z');
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${Math.ceil(days / 7)} weeks`;
  const months = Math.floor(days / 30);
  return `In ~${months} month${months > 1 ? 's' : ''}`;
}

export default function CalendarPage() {
  const categories = ['baseball', 'basketball', 'football', 'hockey', 'pokemon'] as const;
  const upcoming = releases.filter(r => r.status !== 'released').sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
  const past = releases.filter(r => r.status === 'released').sort((a, b) => b.releaseDate.localeCompare(a.releaseDate));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Release Calendar' }]} />

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Updated April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Release Calendar</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Upcoming and recent card releases for sports and Pokémon TCG. Real product names, real release windows, real estimated prices.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map(cat => {
          const cfg = categoryConfig[cat];
          const count = releases.filter(r => r.category === cat).length;
          return (
            <span key={cat} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${cfg.color}`}>
              {cfg.emoji} {cfg.label} <span className="opacity-60">({count})</span>
            </span>
          );
        })}
      </div>

      {/* Upcoming */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
          Upcoming Releases
        </h2>
        <div className="space-y-4">
          {upcoming.map(release => {
            const cat = categoryConfig[release.category];
            const status = statusConfig[release.status];
            const countdown = getCountdown(release.releaseDate);
            const ebayPreorderUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(release.name + ' pre-order')}&_sop=12`;
            const tcgPlayerUrl = release.category === 'pokemon'
              ? `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(release.name)}&view=grid`
              : null;
            return (
              <div key={release.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cat.color}`}>
                        {cat.emoji} {cat.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      <span className="text-gray-600 text-xs">{release.type}</span>
                      {countdown && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 px-2 py-0.5 rounded-full">
                          ⏱ {countdown}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{release.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{release.brand}</p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-3">{release.notes}</p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={ebayPreorderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-blue-950/40 border border-blue-800/40 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Pre-order on eBay ↗
                      </a>
                      {tcgPlayerUrl && (
                        <a
                          href={tcgPlayerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 bg-yellow-950/40 border border-yellow-800/40 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          TCGPlayer ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-white font-bold text-base">{formatDate(release.releaseDate)}</p>
                    {release.estimatedHobbyBoxPrice && (
                      <p className="text-emerald-400 text-sm font-medium mt-1">{release.estimatedHobbyBoxPrice} <span className="text-gray-500 font-normal">/hobby</span></p>
                    )}
                    {release.estimatedRetailPrice && (
                      <p className="text-gray-400 text-xs mt-0.5">{release.estimatedRetailPrice}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Past releases */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-gray-500 rounded-full" />
          Recent Releases
        </h2>
        <div className="space-y-4">
          {past.map(release => {
            const cat = categoryConfig[release.category];
            const status = statusConfig[release.status];
            return (
              <div key={release.id} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cat.color}`}>
                        {cat.emoji} {cat.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      <span className="text-gray-600 text-xs">{release.type}</span>
                    </div>
                    <h3 className="text-gray-200 font-bold text-base mb-1">{release.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{release.brand}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{release.notes}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-gray-400 font-semibold text-sm">{formatDate(release.releaseDate)}</p>
                    {release.estimatedHobbyBoxPrice && (
                      <p className="text-gray-500 text-sm mt-1">{release.estimatedHobbyBoxPrice} <span className="font-normal">/hobby</span></p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data disclaimer */}
      <div className="mt-10 p-5 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <p className="text-gray-500 text-sm">
          Release dates and prices are estimates based on announcements and historical patterns. Dates may shift. Hobby box prices reflect typical secondary market rates, not manufacturer MSRP.
          Always verify with your local card shop or distributor before placing pre-orders.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/news" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">Latest Hobby News →</Link>
          <Link href="/guides" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">Collector Guides →</Link>
          <Link href="/sports" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">Sports Cards →</Link>
        </div>
      </div>
    </div>
  );
}
