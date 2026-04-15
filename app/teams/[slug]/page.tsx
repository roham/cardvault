import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sportsCards } from '@/data/sports-cards';
import { teams, playerTeamMap, getTeamBySlug } from '@/data/teams-data';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SportsCardTile from '@/components/SportsCardTile';

interface Props {
  params: Promise<{ slug: string }>;
}

const sportIcons: Record<string, string> = { baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒' };
const sportLabels: Record<string, string> = { baseball: 'MLB', basketball: 'NBA', football: 'NFL', hockey: 'NHL' };

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getTeamCards(teamSlug: string) {
  return sportsCards.filter(card => playerTeamMap[card.player] === teamSlug);
}

// ISR — 124 teams, render on demand
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  // Pre-generate pages for teams that have cards
  const allPlayerNames = sportsCards.map(c => c.player);
  return teams
    .filter(team => {
      const count = allPlayerNames.filter(name => playerTeamMap[name] === team.slug).length;
      return count >= 3;
    })
    .map(team => ({ slug: team.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) return { title: 'Team Not Found' };
  const cards = getTeamCards(slug);
  const league = sportLabels[team.sport] || team.sport;
  return {
    title: `${team.fullName} Cards — ${cards.length} Cards, Checklists & Values | CardVault`,
    description: `Browse all ${team.fullName} (${league}) sports cards. ${cards.length} cards tracked with values for ${[...new Set(cards.map(c => c.player))].length} players. Find rookie cards, legends, and current stars.`,
    openGraph: {
      title: `${team.fullName} Cards — CardVault`,
      description: `${cards.length} ${team.fullName} cards with values, checklists, and eBay links.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${team.fullName} Cards — CardVault`,
      description: `${cards.length} cards tracked for the ${team.fullName}. Legends, rookies, and current stars.`,
    },
    alternates: { canonical: './' },
  };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const team = getTeamBySlug(slug);
  if (!team) notFound();

  const cards = getTeamCards(slug);
  if (cards.length === 0) notFound();

  const league = sportLabels[team.sport] || team.sport;
  const icon = sportIcons[team.sport] || '🃏';

  // Group cards by player
  const playerMap = new Map<string, typeof cards>();
  for (const card of cards) {
    const existing = playerMap.get(card.player) || [];
    existing.push(card);
    playerMap.set(card.player, existing);
  }

  // Sort players by card count descending, then alphabetically
  const sortedPlayers = [...playerMap.entries()].sort((a, b) => {
    if (b[1].length !== a[1].length) return b[1].length - a[1].length;
    return a[0].localeCompare(b[0]);
  });

  // Stats
  const rookieCards = cards.filter(c => c.rookie);
  const uniquePlayers = sortedPlayers.length;
  const uniqueSets = [...new Set(cards.map(c => c.set))].length;
  const yearRange = cards.length > 0
    ? `${Math.min(...cards.map(c => c.year))}–${Math.max(...cards.map(c => c.year))}`
    : '';

  // Top cards (by gem value estimate)
  const topCards = [...cards].sort((a, b) => {
    const parseVal = (v: string) => {
      const match = v.replace(/,/g, '').match(/\$?([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    };
    return parseVal(b.estimatedValueGem) - parseVal(a.estimatedValueGem);
  }).slice(0, 6);

  // FAQ
  const faqItems = [
    {
      question: `How many ${team.fullName} cards are tracked on CardVault?`,
      answer: `CardVault tracks ${cards.length} ${team.fullName} cards across ${uniqueSets} sets, spanning ${yearRange}. This includes ${rookieCards.length} rookie cards and cards from ${uniquePlayers} different players.`,
    },
    {
      question: `Who has the most valuable ${team.name} cards?`,
      answer: topCards.length > 0
        ? `The most valuable ${team.name} cards on our platform include the ${topCards[0].name} (gem mint: ${topCards[0].estimatedValueGem}). Other high-value cards come from ${topCards.slice(1, 4).map(c => c.player).join(', ')}.`
        : `Check individual player pages for detailed pricing.`,
    },
    {
      question: `What are the best ${team.fullName} rookie cards to collect?`,
      answer: rookieCards.length > 0
        ? `Notable ${team.name} rookie cards include ${rookieCards.slice(0, 5).map(c => c.name).join(', ')}. Rookie cards typically appreciate faster than base cards, especially for franchise players.`
        : `Browse our database for the latest rookie cards from ${team.name} players.`,
    },
    {
      question: `Where can I buy ${team.fullName} cards?`,
      answer: `Each card page on CardVault includes a direct "Buy on eBay" link. You can also use our Trade Evaluator, Flip Calculator, and Price History tools to make informed purchases.`,
    },
  ];

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Teams', href: '/teams' },
    { label: team.fullName },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero with team colors */}
      <div
        className="py-12 border-b border-gray-800"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor}33 0%, ${team.secondaryColor}22 50%, rgba(3,7,18,1) 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <Breadcrumb items={breadcrumbs} />

          <div className="flex items-center gap-4 mt-6 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold border-2"
              style={{
                backgroundColor: team.primaryColor + '33',
                borderColor: team.primaryColor + '66',
                color: team.primaryColor,
              }}
            >
              {team.abbreviation.slice(0, 3)}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {team.fullName} Cards
              </h1>
              <p className="text-gray-400 mt-1">
                {icon} {league} · {team.conference} {team.division} · {cards.length} cards tracked
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Total Cards', value: cards.length.toString() },
              { label: 'Players', value: uniquePlayers.toString() },
              { label: 'Rookie Cards', value: rookieCards.length.toString() },
              { label: 'Year Range', value: yearRange },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-900/60 rounded-lg p-3 border border-gray-800">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Cards */}
        {topCards.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Most Valuable {team.name} Cards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCards.map(card => (
                <SportsCardTile key={card.slug} card={card} />
              ))}
            </div>
          </section>
        )}

        {/* Cards by Player */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Cards by Player ({uniquePlayers})
          </h2>
          <div className="space-y-6">
            {sortedPlayers.map(([playerName, playerCards]) => (
              <div key={playerName} className="bg-gray-900/40 rounded-lg border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <Link
                    href={`/players/${slugifyPlayer(playerName)}`}
                    className="text-lg font-semibold text-blue-400 hover:text-blue-300"
                  >
                    {playerName}
                    <span className="text-gray-500 text-sm ml-2">
                      ({playerCards.length} card{playerCards.length !== 1 ? 's' : ''})
                    </span>
                  </Link>
                  {playerCards.some(c => c.rookie) && (
                    <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                      Has Rookie Cards
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {playerCards.slice(0, 6).map(card => (
                    <Link
                      key={card.slug}
                      href={`/sports/${card.slug}`}
                      className="bg-gray-800/60 rounded p-3 hover:bg-gray-700/60 transition-colors"
                    >
                      <div className="text-sm font-medium text-white truncate">{card.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{card.set} · {card.year}</div>
                      <div className="text-xs text-green-400 mt-1">
                        Raw: {card.estimatedValueRaw}
                      </div>
                    </Link>
                  ))}
                  {playerCards.length > 6 && (
                    <Link
                      href={`/players/${slugifyPlayer(playerName)}`}
                      className="bg-gray-800/40 rounded p-3 flex items-center justify-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      +{playerCards.length - 6} more →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rookie Cards Section */}
        {rookieCards.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {team.name} Rookie Cards ({rookieCards.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rookieCards.slice(0, 12).map(card => (
                <SportsCardTile key={card.slug} card={card} />
              ))}
            </div>
            {rookieCards.length > 12 && (
              <p className="text-gray-400 text-sm mt-3">
                Showing 12 of {rookieCards.length} rookie cards.{' '}
                <Link href={`/tools/rookie-finder?team=${team.abbreviation}`} className="text-blue-400 hover:underline">
                  Find more →
                </Link>
              </p>
            )}
          </section>
        )}

        {/* Related Tools */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Tools for {team.name} Collectors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/tools/grading-roi', label: 'Grading ROI Calculator', icon: '📊' },
              { href: '/tools/price-history', label: 'Price History', icon: '📈' },
              { href: '/tools/trade', label: 'Trade Evaluator', icon: '🔄' },
              { href: '/tools/flip-calc', label: 'Flip Calculator', icon: '💰' },
              { href: '/tools/watchlist', label: 'Price Watchlist', icon: '👁️' },
              { href: '/tools/pack-sim', label: 'Pack Simulator', icon: '📦' },
              { href: '/tools/collection-value', label: 'Collection Value', icon: '🏆' },
              { href: '/tools/set-cost', label: 'Set Cost Estimator', icon: '✅' },
            ].map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-gray-900/60 rounded-lg p-3 border border-gray-800 hover:border-gray-600 transition-colors text-center"
              >
                <div className="text-2xl mb-1">{tool.icon}</div>
                <div className="text-xs text-gray-300">{tool.label}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-gray-900/40 rounded-lg border border-gray-800 p-4">
                <h3 className="font-semibold text-white mb-2">{item.question}</h3>
                <p className="text-gray-400 text-sm">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse Other Teams */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">
            More {league} Teams
          </h2>
          <div className="flex flex-wrap gap-2">
            {teams
              .filter(t => t.sport === team.sport && t.slug !== team.slug)
              .sort((a, b) => a.fullName.localeCompare(b.fullName))
              .map(t => (
                <Link
                  key={t.slug}
                  href={`/teams/${t.slug}`}
                  className="text-sm px-3 py-1.5 rounded-full border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
                >
                  {t.fullName}
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
          name: `${team.fullName} Cards`,
          description: `Browse all ${team.fullName} sports cards — ${cards.length} cards tracked with values.`,
          url: `https://cardvault-two.vercel.app/teams/${team.slug}`,
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((b, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: b.label,
              ...(b.href ? { item: `https://cardvault-two.vercel.app${b.href}` } : {}),
            })),
          },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: cards.length,
            itemListElement: topCards.slice(0, 5).map((card, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: card.name,
              url: `https://cardvault-two.vercel.app/sports/${card.slug}`,
            })),
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </div>
  );
}
