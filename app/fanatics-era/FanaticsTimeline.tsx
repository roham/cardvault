'use client';

import { useState } from 'react';

interface Event {
  key: string;
  date: string;
  year: number;
  category: 'MLB' | 'NFL' | 'NBA' | 'NHL' | 'Corporate' | 'Legal';
  title: string;
  summary: string;
  impact: string;
  keyFact: string;
  color: 'emerald' | 'orange' | 'rose' | 'cyan' | 'amber' | 'violet';
}

// Real events. Sources: public SEC filings, press releases from MLBPA/NFLPA/NBPA,
// Front Office Sports, SportBusiness Journal, Card Business reporting.
const EVENTS: Event[] = [
  {
    key: 'fanatics-mlbpa-2021',
    date: 'August 2021',
    year: 2021,
    category: 'MLB',
    title: 'Fanatics signs MLBPA deal, ending Topps\' 70-year streak',
    summary: 'Fanatics announced a long-term exclusive trading card agreement with the MLBPA (Major League Baseball Players Association) set to begin in 2026 — ending Topps\' decades-long dominance. The news sent shockwaves through the hobby.',
    impact: 'Topps stock collapsed. The planned Topps SPAC merger (valued at $1.3B) was cancelled within weeks. Collectors scrambled to speculate on "final Topps era" flagship products.',
    keyFact: 'Topps had made MLB cards continuously since 1951 — a 70-year run.',
    color: 'emerald',
  },
  {
    key: 'fanatics-nflpa-2021',
    date: 'August 2021',
    year: 2021,
    category: 'NFL',
    title: 'Fanatics signs NFLPA trading card rights',
    summary: 'Alongside the MLBPA announcement, Fanatics secured exclusive NFLPA trading card rights starting after Panini\'s exclusive deal expired. The NFLPA deal was structured to begin after the 2025 season.',
    impact: 'Panini\'s NFL exclusive — which they\'d held since 2016 — was now dated. The hobby had 3+ years of Panini NFL products before the transition would start.',
    keyFact: 'Fanatics secured NFL, NBA, and MLB licenses within 90 days in 2021.',
    color: 'orange',
  },
  {
    key: 'fanatics-nbpa-2021',
    date: 'October 2021',
    year: 2021,
    category: 'NBA',
    title: 'Fanatics signs NBPA trading card deal',
    summary: 'Fanatics completed its trifecta with the NBPA (National Basketball Players Association), securing exclusive trading card rights starting after Panini\'s NBA exclusive ended. Panini had held the NBA exclusive since 2009.',
    impact: 'Panini faced losing two of its three marquee licenses (NFL and NBA) within a few years. Industry analysts noted Fanatics had effectively consolidated US sports card production under a single umbrella.',
    keyFact: 'The three deals (MLB, NFL, NBA) were valued at roughly $2B+ combined over their terms.',
    color: 'rose',
  },
  {
    key: 'topps-acquisition-2022',
    date: 'January 2022',
    year: 2022,
    category: 'Corporate',
    title: 'Fanatics acquires Topps for ~$500M',
    summary: 'Rather than wait until 2026 to start producing MLB cards, Fanatics simply bought Topps outright. The deal closed in January 2022, immediately giving Fanatics the Topps brand, manufacturing infrastructure, and active MLB license. Bowman, Topps Chrome, and Finest all came with the acquisition.',
    impact: 'Topps became a Fanatics subsidiary. The "Fanatics Collectibles" division now operated one of the most iconic brands in sports memorabilia. The MLB exclusive transition became seamless — same brand, new owner.',
    keyFact: 'Topps had been founded in 1938 — it became a Fanatics asset 84 years later.',
    color: 'violet',
  },
  {
    key: 'panini-lawsuit-2023',
    date: 'August 2023',
    year: 2023,
    category: 'Legal',
    title: 'Panini sues Fanatics for antitrust',
    summary: 'Panini America filed a federal antitrust lawsuit against Fanatics, alleging monopolistic consolidation of the trading card market. The suit sought damages and injunctive relief to prevent further license consolidation.',
    impact: 'The lawsuit triggered public back-and-forth between the two companies, including counter-suits from Fanatics. The legal battle extended through 2024-2025 with no clear resolution preventing the license transitions.',
    keyFact: 'Panini\'s suit argued Fanatics\' licensing blitz violated Sherman Act provisions against monopolization.',
    color: 'amber',
  },
  {
    key: 'upper-deck-nhl-extension',
    date: 'December 2023',
    year: 2023,
    category: 'NHL',
    title: 'Upper Deck extends NHL exclusive through 2025-26',
    summary: 'Upper Deck negotiated an extension of its NHL and NHLPA trading card exclusives, originally set to expire in 2024, through the 2025-26 NHL season. The extension preserved Upper Deck\'s 20+ year run as the exclusive NHL card maker.',
    impact: 'Hockey remained the only major North American sports league NOT under the Fanatics umbrella. Young Guns, SP Authentic, and The Cup continued uninterrupted. Speculation about post-2026 NHL rights continues.',
    keyFact: 'Upper Deck\'s NHL exclusive dates back to 2004 — over 22 consecutive seasons by 2026.',
    color: 'cyan',
  },
  {
    key: 'panini-nfl-final-2024',
    date: 'Fall 2024',
    year: 2024,
    category: 'NFL',
    title: 'Panini\'s final NFL season as exclusive licensee',
    summary: 'The 2024-25 NFL season was Panini\'s last as the exclusive NFL trading card partner. Prizm, Select, Donruss, and National Treasures released under their final licensed run. The 2024 NFL Draft class (Caleb Williams, Jayden Daniels, Marvin Harrison Jr.) became the last "only-Panini" NFL rookie class.',
    impact: 'Sealed Panini 2024-25 NFL hobby boxes saw 20-40% price appreciation through early 2026 as the "final year" premium emerged. Caleb Williams rookies in 2024 Panini Prizm became speculative centerpieces.',
    keyFact: 'Panini had held the NFL exclusive since 2016 — replacing Topps at that time.',
    color: 'orange',
  },
  {
    key: 'panini-nba-final-2025',
    date: 'Spring 2025',
    year: 2025,
    category: 'NBA',
    title: 'Panini\'s final NBA season as exclusive licensee',
    summary: 'The 2024-25 NBA season marked Panini\'s final year as exclusive NBA card maker. 2024-25 Prizm Basketball, Select, and Donruss Basketball all released under the expiring license. After this season, Topps (via Fanatics) took over NBA rights.',
    impact: 'The hobby\'s single most important Panini product — Prizm Basketball — entered its terminal release. Collectors treated 2024-25 Prizm rookies (Zach Edey, Matas Buzelis, Zaccharie Risacher) as the "last Panini RC" for those players.',
    keyFact: 'Panini\'s NBA exclusive ran 2009-2025, a 16-year dominant era for Prizm and Select basketball.',
    color: 'rose',
  },
  {
    key: 'topps-chrome-nba-return-2026',
    date: 'February 2026',
    year: 2026,
    category: 'NBA',
    title: 'Topps Chrome Basketball returns after 17 years',
    summary: 'Topps Chrome Basketball 2025-26 released in February 2026 — the first licensed Topps NBA product since 2009. The flagship included veteran base, refractor parallels, and the first licensed rookie cards of the 2025-26 NBA class (Cooper Flagg, Dylan Harper, VJ Edgecombe).',
    impact: 'Topps NBA rookie card pricing emerged immediately — Cooper Flagg base Topps Chrome refractor sold in the $400-600 range within days. A split-universe dynamic appeared: Topps 2025-26 rookie cards AND late-production Panini products both competed for "flagship RC" status.',
    keyFact: 'The gap between Topps\' last licensed NBA product (2008-09 Topps) and the 2025-26 return was 17 years.',
    color: 'violet',
  },
  {
    key: 'topps-nfl-2026-announcement',
    date: 'March 2026',
    year: 2026,
    category: 'NFL',
    title: 'Topps announces 2026 NFL product calendar',
    summary: 'Topps released its 2026 NFL product calendar, confirming Topps Chrome Football, Bowman Chrome Football University, Finest, and Stadium Club Football would all return for the 2026 season. Release windows cover fall 2026 through winter 2026-27.',
    impact: 'Collectors began pre-speculating on 2026 NFL rookie cards. The 2026 NFL Draft class (including Carson Beck, Cam Ward, Garrett Nussmeier) will be the first to appear in new Topps flagship products. Panini still plans unlicensed 2026 releases for secondary appeal.',
    keyFact: 'This will be the first Topps-exclusive NFL release calendar since 2015 — a full decade gap.',
    color: 'orange',
  },
];

const COLORS: Record<Event['color'], { text: string; bg: string; border: string; ring: string; dot: string }> = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', ring: 'ring-emerald-500/40', dot: 'bg-emerald-400' },
  orange: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', ring: 'ring-orange-500/40', dot: 'bg-orange-400' },
  rose: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', ring: 'ring-rose-500/40', dot: 'bg-rose-400' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', ring: 'ring-cyan-500/40', dot: 'bg-cyan-400' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', ring: 'ring-amber-500/40', dot: 'bg-amber-400' },
  violet: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', ring: 'ring-violet-500/40', dot: 'bg-violet-400' },
};

const CATEGORIES: Event['category'][] = ['MLB', 'NFL', 'NBA', 'NHL', 'Corporate', 'Legal'];

export default function FanaticsTimeline() {
  const [expanded, setExpanded] = useState<string | null>('fanatics-mlbpa-2021');
  const [filter, setFilter] = useState<Event['category'] | 'All'>('All');

  const filtered = filter === 'All' ? EVENTS : EVENTS.filter(e => e.category === filter);

  return (
    <div>
      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
            filter === 'All'
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
              : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700'
          }`}
        >
          All Events ({EVENTS.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = EVENTS.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                filter === cat
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                  : 'bg-gray-900/60 text-gray-400 border-gray-800 hover:border-gray-700'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Spine */}
        <div className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/40 via-orange-500/40 to-violet-500/40" />

        <div className="space-y-5">
          {filtered.map(ev => {
            const c = COLORS[ev.color];
            const isOpen = expanded === ev.key;
            return (
              <div key={ev.key} className="relative pl-10 sm:pl-12">
                {/* Dot */}
                <div className={`absolute left-0 top-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full ${c.bg} ${c.border} border-2 flex items-center justify-center`}>
                  <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${c.dot}`} />
                </div>

                <button
                  onClick={() => setExpanded(isOpen ? null : ev.key)}
                  className={`w-full text-left rounded-2xl border p-4 sm:p-5 transition-all ${
                    isOpen
                      ? `${c.border} ${c.bg} ring-2 ${c.ring}`
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{ev.date}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-gray-400 border border-gray-800">
                        {ev.category}
                      </span>
                    </div>
                    <span className={`text-lg ${c.text} ${isOpen ? 'rotate-180' : ''} transition-transform`}>
                      ▾
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug mb-1">
                    {ev.title}
                  </h3>
                  {!isOpen && (
                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{ev.summary}</p>
                  )}

                  {isOpen && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">What happened</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{ev.summary}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Market impact</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{ev.impact}</p>
                      </div>
                      <div className={`rounded-xl ${c.bg} ${c.border} border p-3`}>
                        <div className={`text-xs font-semibold uppercase tracking-wider ${c.text} mb-0.5`}>Key fact</div>
                        <p className="text-sm text-gray-200 leading-relaxed font-medium">{ev.keyFact}</p>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No events in this category.
        </div>
      )}
    </div>
  );
}
