'use client';

import { useState, useEffect, useMemo } from 'react';

type Tier = 'titan' | 'pillar' | 'classic' | 'niche';
type Status = 'active' | 'merged' | 'defunct' | 'acquired';
type SportFocus = 'multi' | 'baseball' | 'basketball' | 'football' | 'hockey' | 'vintage';
type EraGroup = 'pre-war' | 'post-war' | 'junk-wax' | 'premium' | 'modern' | 'ultra-modern';

interface Company {
  id: string;
  name: string;
  tier: Tier;
  status: Status;
  founded: number;
  peakEra: string;
  eraGroups: EraGroup[];
  sportFocus: SportFocus;
  flagship: string;
  iconicCard: string;
  currentStatus: string;
  bio: string;
  rationale: string;
  funFact: string;
}

const COMPANIES: Company[] = [
  {
    id: 'topps',
    name: 'Topps',
    tier: 'titan',
    status: 'acquired',
    founded: 1938,
    peakEra: '1951\u20132025',
    eraGroups: ['post-war', 'junk-wax', 'premium', 'modern', 'ultra-modern'],
    sportFocus: 'multi',
    flagship: 'Topps flagship baseball (1951\u2013present)',
    iconicCard: '1952 Topps Mickey Mantle #311',
    currentStatus: 'Fanatics Collectibles subsidiary (2022\u2013). MLB exclusive 1956\u20132025.',
    bio: 'Launched the modern baseball card in 1952. Held the MLB monopoly for 74 years. Created Chrome (1996), Finest (1993), Bowman Chrome (1997), and the modern refractor category. Defined the template of "one flagship set per year" that every sport now imitates.',
    rationale: 'No single company shaped the hobby more. 75 years of MLB content is the single largest cultural footprint in cardboard.',
    funFact: 'The 1952 Topps high numbers were famously dumped into the Atlantic Ocean in 1960, which is why Mantle #311 is scarce.',
  },
  {
    id: 'upper-deck',
    name: 'Upper Deck',
    tier: 'titan',
    status: 'active',
    founded: 1988,
    peakEra: '1989\u20132010',
    eraGroups: ['junk-wax', 'premium', 'modern'],
    sportFocus: 'multi',
    flagship: 'Upper Deck flagship (1989\u2013)',
    iconicCard: '1989 Upper Deck Ken Griffey Jr. #1',
    currentStatus: 'NHL exclusive (1990\u2013, renewed through 2029). Golf, entertainment. No more MLB/NBA/NFL.',
    bio: 'Reset hobby quality standards overnight with the 1989 debut: gloss-coated, holograms, serial numbers, high-res photography. Invented the premium category. Held the NBA market in the Jordan/Kobe era. Created SP Authentic (1994), Exquisite (2003), and The Cup (2006\u2013) \u2014 three flagship lines that set the ceiling for sport-specific luxury.',
    rationale: 'Every premium standard in modern cards traces back to 1989 Upper Deck. Hockey-only now, but the DNA is everywhere.',
    funFact: 'Exquisite Basketball 2003-04 created the rookie patch auto category by itself. Everything from National Treasures to Immaculate borrowed the template.',
  },
  {
    id: 'panini',
    name: 'Panini',
    tier: 'titan',
    status: 'active',
    founded: 1961,
    peakEra: '2009\u20132025',
    eraGroups: ['modern', 'ultra-modern'],
    sportFocus: 'multi',
    flagship: 'Panini Prizm (2012\u2013), National Treasures (2015\u2013)',
    iconicCard: '2012-13 Panini Prizm Silver LeBron James',
    currentStatus: 'Lost NBA exclusive 2025-26, NFL 2026. Retains Donruss Optic, Select, Mosaic, Prizm branding through existing contracts.',
    bio: 'Italian sticker giant (1961\u2013) who acquired Donruss USA in 2009, grabbed the NBA exclusive the same year, added NFL in 2016, and built a modern hit-driven empire. Prizm Silver Luka and Ja Morant rookies defined the 2019-2021 boom. National Treasures Mahomes PSA 10 holds the modern football record.',
    rationale: 'Seventeen years running two major-sport monopolies is Titan-tier regardless of what happens post-Fanatics. Modern collecting IS Panini-shaped.',
    funFact: 'The Italian parent is 65 years old \u2014 their sticker albums (World Cup stickers, Euro stickers) still outsell their North American trading cards 10:1 globally.',
  },
  {
    id: 'bowman',
    name: 'Bowman',
    tier: 'titan',
    status: 'merged',
    founded: 1948,
    peakEra: '1948\u20131955, 1989\u2013present (revived)',
    eraGroups: ['post-war', 'junk-wax', 'premium', 'modern', 'ultra-modern'],
    sportFocus: 'baseball',
    flagship: 'Bowman Chrome (1997\u2013), Bowman Draft (1999\u2013)',
    iconicCard: '1952 Bowman Willie Mays #218; Bowman Chrome Prospect Mike Trout',
    currentStatus: 'Topps subsidiary since 1956 acquisition; now Fanatics Collectibles sub-brand. First-chance prospect brand.',
    bio: 'America\u2019s first major post-war card company (1948). Fought Topps head-to-head through the early 1950s until Topps acquired them in 1956. Revived in 1989 as a prospect-focused brand. Bowman Chrome Prospect autos are the canonical "first-card" format for every MLB draft pick.',
    rationale: 'Two separate iconic runs (1948-1955 originals + 1989-present revived). Prospect first-card format is uncopied \u2014 a category all its own.',
    funFact: 'The 1953 Bowman Color set is considered the prettiest baseball card set ever made. The photography had no other company caught up until Upper Deck in 1989.',
  },
  {
    id: 'fleer',
    name: 'Fleer',
    tier: 'pillar',
    status: 'defunct',
    founded: 1885,
    peakEra: '1981\u20131998',
    eraGroups: ['junk-wax', 'premium'],
    sportFocus: 'multi',
    flagship: 'Fleer flagship (1981\u20132007)',
    iconicCard: '1986 Fleer Michael Jordan #57',
    currentStatus: 'Ceased operations 2005. Brand name owned by Upper Deck; used sporadically in hockey.',
    bio: 'Started as a gum company in 1885. Broke Topps\u2019 MLB monopoly in 1981 via antitrust lawsuit. The 1986-87 Fleer Basketball set launched the modern basketball card category single-handed. Also made Fleer Metal, Ultra, Flair \u2014 influential premium junk-wax-era products.',
    rationale: 'Two monumental achievements: forcing open the MLB monopoly, and birthing modern basketball with 1986 Fleer. Fell during the late-1990s oversupply and never recovered.',
    funFact: 'The 1981 Fleer MLB set debuted the same week as Donruss \u2014 both were direct results of the 1980 U.S. District Court ruling against Topps.',
  },
  {
    id: 'donruss',
    name: 'Donruss',
    tier: 'pillar',
    status: 'acquired',
    founded: 1954,
    peakEra: '1981\u20131992, 2001\u2013present (as Panini brand)',
    eraGroups: ['junk-wax', 'modern', 'ultra-modern'],
    sportFocus: 'multi',
    flagship: 'Donruss flagship (1981\u20131992), Donruss Optic (2016\u2013)',
    iconicCard: '1982 Donruss Cal Ripken Jr. RC #405; Donruss Optic Prizm Luka',
    currentStatus: 'Owned by Panini (2009\u2013). Active brand across MLB, NBA, NFL.',
    bio: 'Original 1981 MLB breakthrough alongside Fleer. Made through 1992, then folded. Playoff acquired the brand in 2001, Panini in 2009. Donruss Optic (2016-present) has become the budget-premium workhorse \u2014 "Prizm for $5/pack."',
    rationale: 'First-gen pillar during the 1981-1992 original run; second-gen via Optic format in the modern era. Cumulative impact earns Pillar.',
    funFact: 'The 1984 Donruss Don Mattingly RC is the single most "pulled from original Mom\u2019s-basement" Junk Wax card \u2014 every collector has 500 copies.',
  },
  {
    id: 'pacific',
    name: 'Pacific',
    tier: 'classic',
    status: 'defunct',
    founded: 1968,
    peakEra: '1998\u20132001',
    eraGroups: ['premium'],
    sportFocus: 'multi',
    flagship: 'Pacific Omega, Invincible, Crown Royale',
    iconicCard: '1998 Pacific Peyton Manning Draft Picks RC',
    currentStatus: 'Ceased operations 2001. Brand dormant.',
    bio: 'Oddball West Coast manufacturer that made weird, beautiful premium-era products. Ultra-reflective finishes, die-cut crowns, Spanish-language variants. Known for chrome refractors before Topps systemized them.',
    rationale: 'Small footprint but beloved by 1990s premium collectors. Crown Royale die-cuts are still chased. Classic tier for cult status.',
    funFact: 'Pacific Invincible 1998 had 14 different parallel levels \u2014 more than most collectors knew existed at the time.',
  },
  {
    id: 'pinnacle',
    name: 'Pinnacle',
    tier: 'classic',
    status: 'defunct',
    founded: 1988,
    peakEra: '1992\u20131998',
    eraGroups: ['junk-wax', 'premium'],
    sportFocus: 'multi',
    flagship: 'Pinnacle Mint, Zenith, Totally Certified',
    iconicCard: '1997 Pinnacle Certified Mirror Gold Kobe Bryant /30',
    currentStatus: 'Ceased operations 1998. Assets absorbed by Playoff (pre-Panini).',
    bio: 'Aggressive premium-era company. Pinnacle Mint shipped actual coins. Totally Certified Mirror Gold /30 parallels were the predecessor to modern case-hit parallels. Bankruptcy in 1998 during the post-boom contraction.',
    rationale: 'Short but intense run. Innovative parallel structure still referenced. Classic tier for specific-era impact.',
    funFact: 'Pinnacle Zenith 1996 contained actual gold-foil-embedded cards \u2014 the technology was a nightmare to produce and contributed to the company\u2019s cash burn.',
  },
  {
    id: 'leaf',
    name: 'Leaf',
    tier: 'classic',
    status: 'active',
    founded: 1948,
    peakEra: '1948\u20131949, 2010\u2013present (as Brian Gray Leaf)',
    eraGroups: ['post-war', 'ultra-modern'],
    sportFocus: 'multi',
    flagship: 'Leaf Trinity, Leaf Valiant, Leaf Metal Draft',
    iconicCard: '1948 Leaf Jackie Robinson #79',
    currentStatus: 'Active as Leaf Trading Cards (Brian Gray era, 2010\u2013). Pre-NFL/NBA draft product specialist.',
    bio: 'Original 1948 Leaf set is one of the three great post-war issues (Leaf, Bowman, Topps). Dormant for decades, reactivated as a pre-draft autograph specialist in 2010 by Brian Gray. Can\u2019t print licensed uniforms, so they mass-sign college/high-school prospects before they hit major-league cards.',
    rationale: 'Two distinct eras, both meaningful. 1948 Leaf Robinson is a canonical card. Modern Leaf\u2019s pre-draft niche is unique and valuable.',
    funFact: 'The 1948 Leaf set had 98 cards but 49 are notoriously "short-printed" \u2014 the original Leaf brothers never finished printing them, making high-number vintage Leaf among the scarcest post-war cards.',
  },
  {
    id: 'score',
    name: 'Score',
    tier: 'classic',
    status: 'acquired',
    founded: 1988,
    peakEra: '1988\u20131993',
    eraGroups: ['junk-wax'],
    sportFocus: 'multi',
    flagship: 'Score flagship (1988\u20132016 as Panini brand)',
    iconicCard: '1989 Score Barry Sanders RC #257',
    currentStatus: 'Panini\u2019s budget NFL brand through 2024. Minimal recent production.',
    bio: 'Launched 1988 targeted at Topps\u2019 flagship. Aggressive photography, all-color design, full stats on back. 1989 Score Football set contains Barry Sanders, Troy Aikman, Derrick Thomas, and others as rookies \u2014 one of the densest rookie classes ever printed.',
    rationale: 'One great set (1989 Score Football) and a solid junk-wax-era run. Classic tier for specific-product impact.',
    funFact: 'The 1988 Score Baseball debut was so disruptive that Topps retooled their 1989 design to catch up.',
  },
  {
    id: 'sp',
    name: 'SP (SP Authentic / SPx)',
    tier: 'classic',
    status: 'acquired',
    founded: 1993,
    peakEra: '1994\u20132012',
    eraGroups: ['premium', 'modern'],
    sportFocus: 'multi',
    flagship: 'SP Authentic (1994\u2013), SPx (1997\u20132011)',
    iconicCard: '1993 SP Derek Jeter RC #279 (foil, chipping)',
    currentStatus: 'Upper Deck sub-brand. Active in NHL only.',
    bio: 'Upper Deck\u2019s premium sub-brand. 1993 SP launched the serial-numbered foil-parallel era. 1997 SPx introduced holo cards. SP Authentic hockey is still a flagship. Died in MLB/NBA/NFL when Upper Deck lost those licenses.',
    rationale: 'Premium-era pioneer within Upper Deck\u2019s umbrella. Multiple innovations tied to SP label. Classic for foundational innovation.',
    funFact: 'The 1993 SP Derek Jeter RC is infamous for chipping around the edges \u2014 PSA 10 copies are worth 20x what PSA 9 copies sell for because so few survived the foil-chip problem.',
  },
  {
    id: 'skybox',
    name: 'SkyBox',
    tier: 'classic',
    status: 'defunct',
    founded: 1989,
    peakEra: '1990\u20131998',
    eraGroups: ['junk-wax', 'premium'],
    sportFocus: 'basketball',
    flagship: 'SkyBox flagship NBA (1990\u20131998), NBA Hoops (partnership with Fleer)',
    iconicCard: '1990-91 SkyBox Michael Jordan #41',
    currentStatus: 'Fleer acquired brand 1995; brand dormant post-Fleer collapse.',
    bio: 'Launched 1990 with gradient backgrounds and unconventional design language. Dominant in NBA the first half of the 1990s. 1996 SkyBox E-XL and Z-Force were cult-favorites. Absorbed into Fleer in 1995.',
    rationale: 'Basketball-specific era impact. Classic for NBA card design template (gradient, action-focus).',
    funFact: 'The original SkyBox founder was H. Beverly Hight, an engineer who made the first 3D-digital-render trading cards with the 1990 debut.',
  },
  {
    id: 'playoff',
    name: 'Playoff',
    tier: 'classic',
    status: 'acquired',
    founded: 1992,
    peakEra: '1998\u20132008',
    eraGroups: ['premium', 'modern'],
    sportFocus: 'football',
    flagship: 'Playoff Contenders (1998\u2013), Absolute Memorabilia, Crown Royale',
    iconicCard: '2000 Playoff Contenders Tom Brady RC Auto #144',
    currentStatus: 'Panini acquired Playoff in 2009. Contenders, Absolute, Crown Royale continue as Panini brands.',
    bio: 'Texas-based football specialist. Created Playoff Contenders (the standard for NFL rookie autographs) in 1998. Brady\u2019s 2000 Contenders RC Auto is the crown jewel of modern football cards. Panini kept the brand after acquisition.',
    rationale: 'Created the canonical NFL rookie-auto format. Classic tier for category-defining product.',
    funFact: 'The 2000 Playoff Contenders Tom Brady Championship Ticket /100 parallel holds the all-time modern NFL record \u2014 $3.1M at Lelands in 2022.',
  },
  {
    id: 'fanatics',
    name: 'Fanatics Collectibles',
    tier: 'pillar',
    status: 'active',
    founded: 2021,
    peakEra: '2022\u2013present',
    eraGroups: ['ultra-modern'],
    sportFocus: 'multi',
    flagship: 'Inherited Topps / Bowman brand ecosystem',
    iconicCard: 'TBD \u2014 first fully Fanatics-branded flagship ships 2026',
    currentStatus: 'Holds MLB (2026\u2013), NBA (2025-26\u2013), NFL (2026\u2013), WNBA exclusive licenses.',
    bio: 'Consolidated the U.S. trading card industry in ~36 months. Announced MLB exclusive 2021, acquired Topps 2022, announced NBA 2022, NFL 2022 \u2014 implementing exclusives over 2025-26 and 2026 seasons. Still shipping under Topps and Bowman labels while the brand transition plays out.',
    rationale: 'Pillar today, possible Titan by 2030. Impact is already industry-reshaping, but the Fanatics-branded catalog is still forming.',
    funFact: 'The Fanatics\u2013MLB announcement in August 2021 wiped ~40% off Topps\u2019 SPAC valuation overnight and forced the $500M direct-acquisition in January 2022.',
  },
  {
    id: 'in-the-game',
    name: 'In The Game (ITG)',
    tier: 'niche',
    status: 'active',
    founded: 2001,
    peakEra: '2005\u20132015',
    eraGroups: ['modern'],
    sportFocus: 'hockey',
    flagship: 'In The Game Used Hockey, Heroes & Prospects, Ultimate Memorabilia',
    iconicCard: '2005-06 ITG Heroes & Prospects Carey Price RC Auto',
    currentStatus: 'Leaf Trading Cards absorbed ITG in 2014; brand used sparingly for hockey-adjacent releases.',
    bio: 'Canadian hockey-focused manufacturer. Competed with Upper Deck and O-Pee-Chee by signing unlicensed prospects and alumni. The 1972 Summit Series ITG commemorative is a cult favorite. Brand sold to Leaf in 2014.',
    rationale: 'Narrow sport focus, narrower era. Niche tier for real-but-limited impact in hockey.',
    funFact: 'ITG\u2019s "Ultimate Memorabilia" series made multi-piece patches popular in hockey before Upper Deck systematized the category in The Cup.',
  },
  {
    id: 'american-tobacco',
    name: 'American Tobacco (T206 era)',
    tier: 'titan',
    status: 'defunct',
    founded: 1890,
    peakEra: '1909\u20131911',
    eraGroups: ['pre-war'],
    sportFocus: 'vintage',
    flagship: 'T206 White Border (1909\u20131911), T205 Gold Border (1911)',
    iconicCard: 'T206 Honus Wagner #378',
    currentStatus: 'Defunct (dissolved 1911 via Sherman Antitrust Act).',
    bio: 'The tobacco trust that printed T206 as promotional inserts in cigarette packages from 1909-1911. The 524-card T206 set is the foundation of collecting \u2014 every subsequent product traces back to it. Wagner refused to allow tobacco-sponsored cards; his is the rarest, and in 2022 sold for $7.25M.',
    rationale: 'Titan tier for creating the hobby. Literally the source. No T206, no modern collecting.',
    funFact: 'The T206 set is technically a promotional insert \u2014 a 20th-century advertising gimmick that accidentally became the cornerstone of a multi-billion-dollar collecting industry.',
  },
];

const TIER_META: Record<Tier, { label: string; bg: string; text: string; border: string; rank: number }> = {
  titan: { label: 'TITAN', bg: 'bg-gradient-to-br from-amber-500 to-yellow-500', text: 'text-white', border: 'border-amber-600', rank: 1 },
  pillar: { label: 'PILLAR', bg: 'bg-gradient-to-br from-slate-400 to-slate-500', text: 'text-white', border: 'border-slate-500', rank: 2 },
  classic: { label: 'CLASSIC', bg: 'bg-gradient-to-br from-orange-400 to-amber-400', text: 'text-white', border: 'border-orange-500', rank: 3 },
  niche: { label: 'NICHE', bg: 'bg-gradient-to-br from-gray-300 to-gray-400', text: 'text-gray-800', border: 'border-gray-400', rank: 4 },
};

const STATUS_META: Record<Status, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  merged: { label: 'Merged', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  defunct: { label: 'Defunct', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  acquired: { label: 'Acquired', color: 'text-violet-700 bg-violet-50 border-violet-200' },
};

const STORAGE_KEY = 'cv_card_companies_v1';

export default function CardCompaniesClient() {
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [sportFilter, setSportFilter] = useState<SportFocus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'tier' | 'founded' | 'alpha'>('tier');
  const [votes, setVotes] = useState<Record<string, 'agree' | 'disagree' | null>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.votes) setVotes(parsed.votes);
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ votes }));
    } catch {
      /* noop */
    }
  }, [votes]);

  const filtered = useMemo(() => {
    const f = COMPANIES.filter((c) => {
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (sportFilter !== 'all' && c.sportFocus !== sportFilter) return false;
      return true;
    });
    if (sortBy === 'tier') {
      f.sort((a, b) => TIER_META[a.tier].rank - TIER_META[b.tier].rank || a.name.localeCompare(b.name));
    } else if (sortBy === 'founded') {
      f.sort((a, b) => a.founded - b.founded);
    } else {
      f.sort((a, b) => a.name.localeCompare(b.name));
    }
    return f;
  }, [tierFilter, statusFilter, sportFilter, sortBy]);

  const vote = (id: string, v: 'agree' | 'disagree') => {
    setVotes((prev) => ({ ...prev, [id]: prev[id] === v ? null : v }));
  };

  const grouped = useMemo(() => {
    if (sortBy !== 'tier') return null;
    const g: Record<Tier, Company[]> = { titan: [], pillar: [], classic: [], niche: [] };
    filtered.forEach((c) => g[c.tier].push(c));
    return g;
  }, [filtered, sortBy]);

  const agreeCount = Object.values(votes).filter((v) => v === 'agree').length;
  const disagreeCount = Object.values(votes).filter((v) => v === 'disagree').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-300 text-center">
          <div className="text-2xl font-bold text-amber-900">{COMPANIES.filter((c) => c.tier === 'titan').length}</div>
          <div className="text-xs text-amber-800 font-semibold uppercase">Titans</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-slate-100 to-gray-200 border border-slate-300 text-center">
          <div className="text-2xl font-bold text-slate-900">{COMPANIES.filter((c) => c.tier === 'pillar').length}</div>
          <div className="text-xs text-slate-800 font-semibold uppercase">Pillars</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-300 text-center">
          <div className="text-2xl font-bold text-orange-900">{COMPANIES.filter((c) => c.tier === 'classic').length}</div>
          <div className="text-xs text-orange-800 font-semibold uppercase">Classics</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 text-center">
          <div className="text-2xl font-bold text-gray-900">{COMPANIES.filter((c) => c.tier === 'niche').length}</div>
          <div className="text-xs text-gray-700 font-semibold uppercase">Niche</div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-3">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-600 mb-1.5">Tier</div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'titan', 'pillar', 'classic', 'niche'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition ${
                  tierFilter === t
                    ? 'border-teal-500 bg-teal-100 text-teal-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                }`}
              >
                {t === 'all' ? 'All tiers' : TIER_META[t].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-600 mb-1.5">Status</div>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'active', 'merged', 'acquired', 'defunct'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition ${
                  statusFilter === s
                    ? 'border-teal-500 bg-teal-100 text-teal-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_META[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-600 mb-1.5">Sport focus</div>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'multi', 'baseball', 'basketball', 'football', 'hockey', 'vintage'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSportFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition capitalize ${
                    sportFilter === s
                      ? 'border-teal-500 bg-teal-100 text-teal-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                  }`}
                >
                  {s === 'all' ? 'Any' : s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-600 mb-1.5">Sort</div>
            <div className="flex flex-wrap gap-1.5">
              {(['tier', 'founded', 'alpha'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition capitalize ${
                    sortBy === s
                      ? 'border-teal-500 bg-teal-100 text-teal-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        {(agreeCount > 0 || disagreeCount > 0) && (
          <div className="text-xs text-gray-600">
            Your votes: <span className="text-emerald-700 font-semibold">{agreeCount} agree</span> • <span className="text-rose-700 font-semibold">{disagreeCount} disagree</span>
          </div>
        )}
      </div>

      {/* Grouped or flat listing */}
      {sortBy === 'tier' && grouped ? (
        (['titan', 'pillar', 'classic', 'niche'] as Tier[]).map((t) =>
          grouped[t].length === 0 ? null : (
            <section key={t} className="space-y-2">
              <div
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${TIER_META[t].bg} ${TIER_META[t].text}`}
              >
                {TIER_META[t].label} — {grouped[t].length} {grouped[t].length === 1 ? 'company' : 'companies'}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {grouped[t].map((c) => (
                  <CompanyCard key={c.id} company={c} expanded={expanded === c.id} onToggle={() => setExpanded(expanded === c.id ? null : c.id)} vote={votes[c.id]} onVote={vote} />
                ))}
              </div>
            </section>
          ),
        )
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {filtered.map((c) => (
            <CompanyCard key={c.id} company={c} expanded={expanded === c.id} onToggle={() => setExpanded(expanded === c.id ? null : c.id)} vote={votes[c.id]} onVote={vote} />
          ))}
        </div>
      )}
      {filtered.length === 0 && (
        <div className="p-8 rounded-xl bg-gray-50 border border-gray-200 text-center text-gray-500 text-sm">
          No companies match your filters.
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company: c, expanded, onToggle, vote, onVote }: { company: Company; expanded: boolean; onToggle: () => void; vote: 'agree' | 'disagree' | null | undefined; onVote: (id: string, v: 'agree' | 'disagree') => void }) {
  return (
    <article className="p-4 rounded-lg bg-white border border-gray-200 hover:border-teal-300 transition shadow-sm">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${TIER_META[c.tier].bg} ${TIER_META[c.tier].text}`}>
            {TIER_META[c.tier].label}
          </span>
          <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
          <span className="text-xs text-gray-500">est. {c.founded}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_META[c.status].color}`}>
            {STATUS_META[c.status].label}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="text-xs px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </header>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold">Peak era</div>
          <div className="text-gray-900">{c.peakEra}</div>
        </div>
        <div>
          <div className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold">Flagship</div>
          <div className="text-gray-900">{c.flagship}</div>
        </div>
        <div>
          <div className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold">Iconic card</div>
          <div className="text-gray-900 font-semibold">{c.iconicCard}</div>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-gray-800">{c.bio}</p>
          <div className="p-2 rounded bg-teal-50 border border-teal-200">
            <div className="text-[10px] uppercase tracking-wider text-teal-800 font-semibold">Tier rationale</div>
            <p className="text-teal-900 text-xs">{c.rationale}</p>
          </div>
          <div className="p-2 rounded bg-gray-50 border border-gray-200">
            <div className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">Current status (2026)</div>
            <p className="text-gray-800 text-xs">{c.currentStatus}</p>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200">
            <div className="text-[10px] uppercase tracking-wider text-amber-800 font-semibold">Fun fact</div>
            <p className="text-amber-900 text-xs">{c.funFact}</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-500">Do you agree with this tier?</span>
            <button
              onClick={() => onVote(c.id, 'agree')}
              className={`text-xs px-2 py-1 rounded border transition ${
                vote === 'agree'
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              ✓ Agree
            </button>
            <button
              onClick={() => onVote(c.id, 'disagree')}
              className={`text-xs px-2 py-1 rounded border transition ${
                vote === 'disagree'
                  ? 'bg-rose-600 text-white border-rose-700'
                  : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
              }`}
            >
              ✗ Disagree
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
