import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyAlmanacClient from './HobbyAlmanacClient';
import { almanacMonths } from '@/data/hobby-almanac';

export const metadata: Metadata = {
  title: 'The Hobby Almanac — Month-by-Month Card Collecting Calendar | CardVault',
  description:
    'A 12-month calendar for card collecting. Every month — product releases, major events, sport storylines, buy/sell advice, and historical notes. When to chase, when to accumulate, when to sit out.',
  openGraph: {
    title: 'The Hobby Almanac — CardVault',
    description:
      'The complete 12-month calendar for card collectors. Releases, events, storylines, buy/sell advice for every month of the hobby year.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'The Hobby Almanac — CardVault',
    description: 'Month-by-month hobby calendar — when to buy, when to sell, when to sit out.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'The Hobby Almanac' },
];

const faqItems = [
  {
    question: 'How is this different from a release calendar?',
    answer:
      'A release calendar tells you when products ship. The Almanac tells you when the hobby BREATHES — which months buyers are aggressive, which months inventory turns cheap, which weeks carry the highest or lowest spending premium. It combines product releases, sport events, storyline rhythms, and buy/sell timing into a 12-month decision framework.',
  },
  {
    question: 'Why does July get called PEAK spend?',
    answer:
      'The National Sports Collectors Convention is always in late July. For 5 days, the hobby\u2019s entire cash-in-hand economy concentrates in one city. Dealers rotate inventory. Collectors discount existing collections to raise cash for show-floor deals. Every piece of the hobby — auction houses, breakers, creators, grading companies — schedules content and drops around The National. No other month matches that concentration.',
  },
  {
    question: 'Why does January get called COLD?',
    answer:
      'Three reasons: wallets are recovering from December spending, only one major sport (NFL) is in playoff mode, and card shows are typically quiet in the post-holiday window. Vintage holds steady; modern speculative loses 15-25% vs November peaks. The one counter-trend is pre-MLB-season Spring Training speculation, which starts late January and builds through February-March.',
  },
  {
    question: 'Is the buy/sell advice financial advice?',
    answer:
      'No. This is editorial commentary on hobby spending rhythms, not financial or investment advice. Card markets are volatile, illiquid, and driven by sport narratives that can reverse in a single game. Treat the Almanac as a starting framework for your own research, not a trading plan. CardVault does not recommend any specific purchase or sale.',
  },
  {
    question: 'How often does this get updated?',
    answer:
      'The Almanac is structural — release timing, event calendars, and historical patterns change slowly year-over-year. Minor revisions happen when a major release shifts (Panini Prizm shipping timing, for example, shifted several times through 2023-2025) or when a league restructures its calendar. Expect structural edits roughly 2x per year; breaking news overrides the Almanac when a single event (license change, product cancellation) materially alters the rhythm.',
  },
  {
    question: 'Where does the Fanatics transition fit in?',
    answer:
      'Starting 2026 NFL + 2026 MLB + 2026-27 NBA + 2026-27 NHL license transitions to Fanatics begin to reshape the release calendar. Current Almanac entries reflect the 2024-2025 product schedule. As Fanatics transitions complete, expect release timing, product positioning, and event cadence to evolve. The Almanac will update to reflect the post-transition calendar once it stabilizes.',
  },
];

export default function AlmanacPage() {
  const totalMonths = almanacMonths.length;
  const totalReleases = almanacMonths.reduce((a, m) => a + m.releases.length, 0);
  const totalEvents = almanacMonths.reduce((a, m) => a + m.events.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'The Hobby Almanac — Month-by-Month Card Collecting Calendar',
          description:
            'Editorial 12-month calendar for card collectors. Product releases, major events, sport storylines, buy/sell advice, and historical notes for every month.',
          url: 'https://cardvault-two.vercel.app/almanac',
          author: { '@type': 'Organization', name: 'CardVault' },
          publisher: { '@type': 'Organization', name: 'CardVault' },
          datePublished: '2026-04-16',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: almanacMonths.map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${m.name} — ${m.theme}`,
          })),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }}
      />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          The Hobby Almanac &middot; {totalMonths} months &middot; {totalReleases} releases &middot; {totalEvents} events
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-white mb-3">
          The Hobby Almanac
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          A 12-month calendar for card collecting. When the market is hot, cold, peaking, building, or steady.
          Every month: product releases, major events, sport storylines, buy/sell advice, and historical patterns.
          Use it to time accumulation windows, schedule spending, and avoid the fake-urgency traps of the hobby
          news cycle.
        </p>
      </div>

      <HobbyAlmanacClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-orange-300 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Editorial</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/year-in-cards" className="text-orange-300 hover:text-orange-200">
            Year in Cards
          </Link>
          <Link href="/auction-archive" className="text-orange-300 hover:text-orange-200">
            Auction Archive
          </Link>
          <Link href="/state-of-hobby" className="text-orange-300 hover:text-orange-200">
            State of the Hobby
          </Link>
          <Link href="/set-archives" className="text-orange-300 hover:text-orange-200">
            Set Archives
          </Link>
          <Link href="/product-rankings" className="text-orange-300 hover:text-orange-200">
            Product Rankings
          </Link>
          <Link href="/card-companies" className="text-orange-300 hover:text-orange-200">
            Card Companies Ranked
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-orange-300 hover:text-orange-200">Home</Link>
        <Link href="/tools" className="text-orange-300 hover:text-orange-200">Tools</Link>
        <Link href="/guides" className="text-orange-300 hover:text-orange-200">Guides</Link>
      </div>
    </div>
  );
}
