import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import YearInCardsClient from './YearInCardsClient';
import { cardYears } from '@/data/year-in-cards';

export const metadata: Metadata = {
  title: 'The Year in Cards — Annual Hobby Retrospectives 2020-2025 | CardVault',
  description:
    'Six calendar years of the modern card hobby, from the 2020 pandemic boom through the 2022 crash, the 2023 reset, and the 2025 Fanatics-NBA transition. Each year covers top market stories, biggest hammers, product launches, industry events, and a hobby year grade.',
  openGraph: {
    title: 'The Year in Cards — CardVault',
    description:
      'Annual card hobby retrospectives 2020-2025. Top stories, big hammers, product launches, industry events, and year grades for every year of the modern boom-through-recovery cycle.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'The Year in Cards — CardVault',
    description: 'The 2020 boom, the 2021 peak, the 2022 crash, the 2023 reset, the 2024 recovery, the 2025 normal year. Every year graded.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'The Year in Cards' },
];

const faqItems = [
  {
    question: 'Why does 2020 get an A+ and 2022 get a C?',
    answer:
      'Year grades reflect the hobby\u2019s overall condition, not whether prices went up or down. 2020 earns an A+ because the market expanded from a niche into a mainstream asset class with historic capital inflows, cultural visibility, and auction records. 2022 earns a C because modern speculative collectors absorbed 40-60% drawdowns even as the vintage top end printed the $12.6M Mantle record. A year where half the hobby loses money while the other half prints all-time-highs is a "mixed" year by definition.',
  },
  {
    question: 'Are the hammer prices real?',
    answer:
      'The flagship hammers cited (1952 Topps Mantle SGC 9.5 at $12.6M in August 2022, Pikachu Illustrator PSA 10 at $5.275M in July 2022, Goldin LeBron Exquisite at $1.8M in July 2020, T206 Wagner Robert Edwards at $6.606M in August 2021) are publicly reported sales. Secondary hammers and private-sale figures reflect reported ranges — private transactions often aren\u2019t fully documented. Treat this page as editorial context, not an auction-result database; for verified comps see our Auction Archive.',
  },
  {
    question: 'What is the difference between this and the State of the Hobby Report?',
    answer:
      'The State of the Hobby Report (M-039) is a single-year 2025 snapshot with current market data, demographics, and predictions. The Year in Cards is multi-year historical — six calendar years side by side, showing the arc from 2020 boom through 2025 normal year. State of the Hobby is a photograph; Year in Cards is the time-lapse.',
  },
  {
    question: 'Why only six years?',
    answer:
      'The "modern card boom" era has a clean start date: March 2020. Before that, the hobby ran on a different cadence — smaller audience, lower velocity, fewer record hammers, and the pre-pandemic grading backlog. 2020-2025 is the six-year window where the modern hobby both expanded and learned what its ceiling feels like. Older eras are covered in our History Timeline (M-018).',
  },
  {
    question: 'Does a "C" year mean I lost money?',
    answer:
      'Not necessarily. 2022 was a "C" because the speculative half of the market compressed 40-60%, but vintage blue-chip and pop-1 grails held flat or rose. If you owned a T206 Wagner or a Mantle in 2022, the year was fine. If you owned ten copies of 2020-21 Panini Prizm Anthony Edwards Silver, the year was brutal. Year grades describe the hobby\u2019s overall condition, not any individual collection.',
  },
  {
    question: 'Will you update this every year?',
    answer:
      'Yes. At the end of each calendar year this page gets a new entry — top stories, biggest hammers, notable product launches, industry events, and a year grade. 2026 will be added January 2027 once the full year\u2019s auction and industry data is in. Between updates, expect minor revisions if a major hammer later gets re-graded or a reported sale proves to be private-only.',
  },
];

export default function YearInCardsPage() {
  const totalYears = cardYears.length;
  const latestYear = cardYears[cardYears.length - 1]?.year;
  const earliestYear = cardYears[0]?.year;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'The Year in Cards — Annual Hobby Retrospectives 2020-2025',
          description:
            'Editorial archive of six calendar years of the modern card hobby, with top market stories, biggest auction hammers, product launches, industry events, and year grades.',
          url: 'https://cardvault-two.vercel.app/year-in-cards',
          author: { '@type': 'Organization', name: 'CardVault' },
          publisher: { '@type': 'Organization', name: 'CardVault' },
          datePublished: '2026-04-16',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: cardYears.map((y, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: `${y.year} — ${y.theme.split(' — ')[0]}`,
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          Year in Cards &middot; {totalYears} years &middot; {earliestYear}&ndash;{latestYear}
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-white mb-3">
          The Year in Cards
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          Six calendar years of the modern card hobby. The 2020 pandemic boom, the 2021 peak, the
          2022 crash, the 2023 reset, the 2024 recovery, the 2025 normal year. Each year gets a top-stories
          column, biggest hammers, notable product launches, industry events, a watershed moment,
          and a hobby grade from A+ to D.
        </p>
      </div>

      <YearInCardsClient />

      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-indigo-400 transition-colors">
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
          <Link href="/auction-archive" className="text-indigo-400 hover:text-indigo-300">
            Auction Archive
          </Link>
          <Link href="/set-archives" className="text-indigo-400 hover:text-indigo-300">
            Set Archives
          </Link>
          <Link href="/product-rankings" className="text-indigo-400 hover:text-indigo-300">
            Product Rankings
          </Link>
          <Link href="/state-of-hobby" className="text-indigo-400 hover:text-indigo-300">
            State of the Hobby
          </Link>
          <Link href="/draft-rewind" className="text-indigo-400 hover:text-indigo-300">
            2003 NBA Draft Rewind
          </Link>
          <Link href="/card-hall-of-fame" className="text-indigo-400 hover:text-indigo-300">
            Hall of Fame
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300">Home</Link>
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300">Tools</Link>
        <Link href="/guides" className="text-indigo-400 hover:text-indigo-300">Guides</Link>
      </div>
    </div>
  );
}
