import type { Metadata } from 'next';
import Link from 'next/link';
import { sportsCards } from '@/data/sports-cards';
import { teams, playerTeamMap } from '@/data/teams-data';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Browse Cards by Team — All MLB, NBA, NFL & NHL Teams | CardVault',
  description: 'Find sports cards organized by team. Browse 124 professional teams across MLB, NBA, NFL, and NHL. See card counts, top players, and values for every franchise.',
  openGraph: {
    title: 'Browse Cards by Team — CardVault',
    description: 'Sports cards organized by all 124 pro teams. MLB, NBA, NFL, NHL.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Browse Cards by Team — CardVault',
    description: '124 team pages. Every MLB, NBA, NFL, and NHL franchise.',
  },
  alternates: { canonical: './' },
};

const sportConfig = [
  { key: 'baseball' as const, label: 'MLB', icon: '⚾', order: 1 },
  { key: 'basketball' as const, label: 'NBA', icon: '🏀', order: 2 },
  { key: 'football' as const, label: 'NFL', icon: '🏈', order: 3 },
  { key: 'hockey' as const, label: 'NHL', icon: '🏒', order: 4 },
];

export default function TeamsIndexPage() {
  // Pre-compute card counts per team
  const teamCardCounts = new Map<string, number>();
  for (const card of sportsCards) {
    const teamSlug = playerTeamMap[card.player];
    if (teamSlug) {
      teamCardCounts.set(teamSlug, (teamCardCounts.get(teamSlug) || 0) + 1);
    }
  }

  // Get top player per team (most cards)
  const teamTopPlayers = new Map<string, string>();
  const playerCardCounts = new Map<string, { name: string; team: string; count: number }>();
  for (const card of sportsCards) {
    const teamSlug = playerTeamMap[card.player];
    if (!teamSlug) continue;
    const key = `${card.player}|${teamSlug}`;
    const existing = playerCardCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      playerCardCounts.set(key, { name: card.player, team: teamSlug, count: 1 });
    }
  }
  for (const entry of playerCardCounts.values()) {
    const current = teamTopPlayers.get(entry.team);
    const currentCount = current
      ? (playerCardCounts.get(`${current}|${entry.team}`)?.count || 0)
      : 0;
    if (entry.count > currentCount) {
      teamTopPlayers.set(entry.team, entry.name);
    }
  }

  const totalTeamsWithCards = [...teamCardCounts.entries()].filter(([, count]) => count >= 3).length;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Teams' }]} />
          <h1 className="text-3xl md:text-4xl font-bold text-white mt-6">
            Browse Cards by Team
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            {totalTeamsWithCards} professional teams across MLB, NBA, NFL, and NHL. Find cards for your favorite franchise — from vintage legends to current stars.
          </p>
          <div className="flex gap-4 mt-4 text-sm text-gray-500">
            <span>{sportsCards.length.toLocaleString()} total cards</span>
            <span>·</span>
            <span>124 teams</span>
            <span>·</span>
            <span>4 leagues</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {sportConfig.map(sport => {
          const sportTeams = teams
            .filter(t => t.sport === sport.key)
            .map(t => ({
              ...t,
              cardCount: teamCardCounts.get(t.slug) || 0,
              topPlayer: teamTopPlayers.get(t.slug),
            }))
            .sort((a, b) => b.cardCount - a.cardCount);

          const totalCards = sportTeams.reduce((sum, t) => sum + t.cardCount, 0);

          return (
            <section key={sport.key} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{sport.icon}</span>
                <h2 className="text-2xl font-bold text-white">{sport.label}</h2>
                <span className="text-sm text-gray-500">
                  {sportTeams.length} teams · {totalCards.toLocaleString()} cards
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {sportTeams.map(team => (
                  <Link
                    key={team.slug}
                    href={team.cardCount >= 3 ? `/teams/${team.slug}` : '#'}
                    className={`rounded-lg border p-4 transition-all ${
                      team.cardCount >= 3
                        ? 'border-gray-800 hover:border-gray-600 bg-gray-900/40 hover:bg-gray-900/60'
                        : 'border-gray-800/50 bg-gray-900/20 opacity-50 cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border"
                        style={{
                          backgroundColor: team.primaryColor + '22',
                          borderColor: team.primaryColor + '44',
                          color: team.primaryColor,
                        }}
                      >
                        {team.abbreviation}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">
                          {team.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {team.conference} {team.division}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">
                          {team.cardCount}
                        </div>
                        <div className="text-xs text-gray-500">cards</div>
                      </div>
                    </div>
                    {team.topPlayer && team.cardCount >= 3 && (
                      <div className="mt-2 text-xs text-gray-400 truncate">
                        Top: {team.topPlayer}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Cross-links */}
        <section className="mt-8 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">More Ways to Browse</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/players', label: 'By Player', desc: 'All player profiles' },
              { href: '/sports', label: 'By Sport', desc: 'Baseball, Basketball, Football, Hockey' },
              { href: '/sports/years', label: 'By Year', desc: '1909–2025' },
              { href: '/sports/sets', label: 'By Set', desc: 'All card sets' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-gray-900/40 border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
              >
                <div className="font-semibold text-white text-sm">{link.label}</div>
                <div className="text-xs text-gray-500 mt-1">{link.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* JSON-LD */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Browse Cards by Team',
          description: 'Sports cards organized by all 124 professional teams across MLB, NBA, NFL, and NHL.',
          url: 'https://cardvault-two.vercel.app/teams',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app' },
              { '@type': 'ListItem', position: 2, name: 'Teams' },
            ],
          },
        }}
      />
    </div>
  );
}
