import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakSpotClient from './BreakSpotClient';
import { sportsCards } from '@/data/sports-cards';
import { sealedProducts } from '@/data/sealed-products';
import { teams, playerTeamMap } from '@/data/teams-data';

export const metadata: Metadata = {
  title: 'Break Spot Picker — Which Team to Buy in a Group Break | CardVault',
  description: 'Find the best team to buy in a group break. See expected value for every team spot based on real card data from 8,000+ cards. Compare EV to spot price and get a BUY/FAIR/AVOID verdict. Free break spot calculator.',
  openGraph: {
    title: 'Break Spot Picker — Best Team to Buy in a Group Break | CardVault',
    description: 'Which team gives you the best value in a group break? See EV rankings for all 30 teams.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Break Spot Picker — CardVault',
    description: 'Find the best-value team spot in any group break. Real EV data from 8,000+ cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Break Spot Picker' },
];

const faqItems = [
  {
    question: 'What is a group break in card collecting?',
    answer: 'A group break is when a breaker opens sealed product (hobby boxes, cases) on a livestream and each participant buys one or more team spots. You receive every card pulled for your team(s). Break spots range from $2 to $200+ depending on the product and team desirability. The key question is always: which team gives you the best chance at valuable pulls?',
  },
  {
    question: 'How does the Break Spot Picker calculate team EV?',
    answer: 'We analyze our database of 8,000+ real sports cards to count how many players from each team appear in modern sets. Teams with more star players in the checklist have a higher share of the product\'s total expected value. More players = more chances at hits (autos, relics, numbered parallels) for your team. The EV is proportional to each team\'s player representation.',
  },
  {
    question: 'What do the BUY, FAIR, and AVOID verdicts mean?',
    answer: 'BUY means the team\'s expected value is 30% or more above your spot price — a strong value pick. FAIR means the EV is roughly in line with the price (within 20%). AVOID means the EV is 20% or more below your spot price — you\'re likely overpaying. These are estimates based on checklist representation, not guarantees.',
  },
  {
    question: 'Why do some teams have more players than others?',
    answer: 'Teams with larger fanbases, more star players, and deeper rosters tend to have more representation in card products. For example, the Yankees, Dodgers, and Lakers typically have more cards in any given set than smaller-market teams. This is why spots for popular teams cost more in breaks — and why this tool helps you find hidden value in less popular teams.',
  },
  {
    question: 'Should I always buy the highest-EV team?',
    answer: 'Not necessarily. The highest-EV teams usually have the most expensive spots in a break. The real value is in finding teams where the EV exceeds the spot price — sometimes mid-tier teams offer better value because their spot price is lower relative to their EV. This tool helps you identify those mismatches.',
  },
];

/* ── server-side data prep ───────────────────────────────────────── */

function slugifyPlayer(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseValue(v: string): number {
  const match = v.match(/\$([0-9,.]+)/);
  if (!match) return 5;
  return parseFloat(match[1].replace(/,/g, ''));
}

function prepareProducts() {
  return sealedProducts
    .filter(p => p.sport !== 'pokemon')
    .map(p => {
      const hitEV = p.hitRates.reduce((sum, h) => {
        const oddsMatch = h.odds.match(/1:(\d+)/);
        const frequency = oddsMatch ? p.packsPerBox / parseInt(oddsMatch[1]) : 1;
        return sum + (h.avgValue * frequency);
      }, 0);
      return {
        slug: p.slug,
        name: p.name,
        sport: p.sport as 'baseball' | 'basketball' | 'football' | 'hockey',
        retailPrice: p.retailPrice,
        ev: p.baseCardValue + hitEV,
      };
    })
    .sort((a, b) => b.ev - a.ev);
}

function prepareTeams() {
  // Build a map of player → team using playerTeamMap, fallback to card data
  const teamMap: Record<string, {
    name: string;
    fullName: string;
    slug: string;
    sport: 'baseball' | 'basketball' | 'football' | 'hockey';
    primaryColor: string;
    players: { name: string; slug: string; avgValue: number }[];
  }> = {};

  // Initialize all teams
  for (const team of teams) {
    teamMap[team.slug] = {
      name: team.name,
      fullName: team.fullName,
      slug: team.slug,
      sport: team.sport,
      primaryColor: team.primaryColor,
      players: [],
    };
  }

  // Group cards by player
  const playerCards = new Map<string, { name: string; slug: string; sport: string; values: number[] }>();
  for (const card of sportsCards) {
    const pSlug = slugifyPlayer(card.player);
    const existing = playerCards.get(pSlug);
    if (existing) {
      existing.values.push(parseValue(card.estimatedValueRaw));
    } else {
      playerCards.set(pSlug, {
        name: card.player,
        slug: pSlug,
        sport: card.sport,
        values: [parseValue(card.estimatedValueRaw)],
      });
    }
  }

  // Assign players to teams
  for (const [pSlug, pData] of playerCards) {
    // Look up team from playerTeamMap
    const teamSlug = playerTeamMap[pData.name] || playerTeamMap[pData.name.toLowerCase()];
    if (teamSlug && teamMap[teamSlug]) {
      const avgVal = pData.values.reduce((a, b) => a + b, 0) / pData.values.length;
      teamMap[teamSlug].players.push({ name: pData.name, slug: pSlug, avgValue: avgVal });
    }
  }

  return teamMap;
}

/* ── page ────────────────────────────────────────────────────────── */

export default function BreakSpotPage() {
  const products = prepareProducts();
  const teamsByTeam = prepareTeams();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Break Spot Picker — Group Break Team Value Calculator',
        description: 'Find the best team to buy in a group break based on real card data from 8,000+ sports cards.',
        url: 'https://cardvault-two.vercel.app/tools/break-spot',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Break Tool &middot; {Object.values(teamsByTeam).reduce((s, t) => s + t.players.length, 0).toLocaleString()} Players &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Break Spot Picker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Which team should you buy in a group break? See expected value rankings for every team based on real card data from 8,000+ cards. Find hidden value before the break starts.
        </p>
      </div>

      <BreakSpotClient products={products} teamsByTeam={teamsByTeam} />

      {/* FAQ */}
      <div className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/50 rounded-lg">
              <summary className="cursor-pointer px-4 py-3 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-3 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Looking for more break tools? Try our{' '}
          <Link href="/tools/box-break" className="text-blue-400 hover:text-blue-300">Box Break Calculator</Link>,{' '}
          <Link href="/tools/sealed-ev" className="text-blue-400 hover:text-blue-300">Sealed Product EV Calculator</Link>, or{' '}
          <Link href="/tools/pack-sim" className="text-blue-400 hover:text-blue-300">Pack Simulator</Link>.
          Track your break results with the{' '}
          <Link href="/tools/flip-calc" className="text-blue-400 hover:text-blue-300">Flip Profit Calculator</Link>.
        </p>
      </div>
    </div>
  );
}
