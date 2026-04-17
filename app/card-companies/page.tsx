import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardCompaniesClient from './CardCompaniesClient';

export const metadata: Metadata = {
  title: 'Card Companies — The Greatest Sports Card Manufacturers Ranked | CardVault',
  description: 'Editorial tier ranking of 16 sports card manufacturers across 120 years. Topps, Upper Deck, Panini, Bowman, Fleer, Donruss, Pacific, Score, Leaf, Pinnacle — founded years, peak eras, flagship products, iconic cards, current status, and where each company lands on our four-tier list.',
  openGraph: {
    title: 'Card Companies Ranked — CardVault',
    description: 'Every major sports card manufacturer, tiered. 120 years of hobby history from T206 Piedmont to Panini Prizm.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Companies Ranked — CardVault',
    description: '16 manufacturers across 4 tiers. Who were the Titans? Who are the Classics? Who faded?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Card Companies' },
];

const faqItems = [
  {
    question: 'How are the tiers defined?',
    answer: 'Four tiers. TITAN: companies that shaped the hobby\u2019s trajectory across multiple decades (Topps, Upper Deck, Panini, Bowman). PILLAR: companies that defined an era but no longer dominate (Fleer, Donruss). CLASSIC: companies remembered fondly for specific runs or innovations (Pinnacle, Leaf, Score, Pacific). NICHE: companies with narrow-but-meaningful impact (SP Authentic pre-buyout, Playoff Contenders pre-Panini, SkyBox, In The Game, etc., grouped here as "Niche" because their standalone runs were shorter or narrower).',
  },
  {
    question: 'Why is Topps tier-1 if they lost the MLB license?',
    answer: 'Tiering is cumulative across history. Topps held the MLB monopoly for 74 years (1951\u20132025), created the Baseball Card (1951), launched Bowman\u2019s revival, shipped Chrome (1996) and Finest (1993) which defined modern premium, and published the T206-equivalents of every modern era. Losing the MLB license to Fanatics in 2026 does not retroactively diminish the 75-year catalog. Topps remains the most consequential card company in hobby history.',
  },
  {
    question: 'Where does Fanatics fit?',
    answer: 'Fanatics is technically a distribution and licensing conglomerate that ACQUIRED Topps in 2022. They now hold MLB, NBA, and NFL trading card licenses through their Fanatics Collectibles division. As of early 2026, everything Topps and Bowman ships is Fanatics-published, and Panini has lost the NBA and NFL licenses to them starting 2025-26 NBA and 2026 NFL. We list Topps as the ongoing brand; Fanatics is the parent. Future tier updates may split Fanatics out once they ship non-Topps-branded product.',
  },
  {
    question: 'Is Panini really a Titan?',
    answer: 'Panini USA launched the Donruss brand revival in 2009 and acquired exclusive NBA (2009) and NFL (2016) licenses, running both monopolies until Fanatics started taking them back (NBA 2025-26, NFL 2026). Their Prizm (2012) and National Treasures (2001 via Playoff; Panini revamped 2015) lines defined modern hit-driven collecting. Seventeen years of multi-sport dominance is Titan-tier even as they transition to a non-exclusive future.',
  },
  {
    question: 'How is this different from the Product Rankings page?',
    answer: 'Product Rankings (/product-rankings) ranks individual product LINES — 1952 Topps, 1986 Fleer Basketball, 2012 Prizm Basketball, etc. Card Companies ranks the manufacturers BEHIND those products. A company can make five great products and a Classic-tier rank; a company can dominate 60 years with only one truly iconic product and earn Titan. Different axis. Both pages link to each other so you can explore horizontally.',
  },
  {
    question: 'Will the tiers change?',
    answer: 'Yes. Fanatics becoming a distinct Titan once they ship non-legacy product. Panini\u2019s rank will be revisited around 2028 after we see what their post-exclusive catalog looks like. Upper Deck hockey-only era continuing past 2026 could either solidify or erode their standing depending on hobby response. This page will be periodically republished as the industry shifts.',
  },
];

export default function CardCompaniesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb items={breadcrumbs} />
      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
          Card Companies Ranked
        </h1>
        <p className="text-lg text-gray-700 mb-2">
          One hundred twenty years of sports card manufacturing. Sixteen companies. Four tiers. Every era represented.
        </p>
        <p className="text-sm text-gray-500">
          From American Tobacco (T206, 1909) to Panini Prizm (2012) to Fanatics Collectibles (2022\u2013present). Editorial tier ranking with founded-year / peak-era / flagship / iconic-card / current-status for each.
        </p>
      </header>

      <CardCompaniesClient />

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Related</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/product-rankings" className="p-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition">
            <div className="font-semibold text-sm">Product Rankings</div>
            <div className="text-xs text-gray-600">Individual products tiered</div>
          </Link>
          <Link href="/set-archives" className="p-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition">
            <div className="font-semibold text-sm">Set Archives</div>
            <div className="text-xs text-gray-600">40 greatest sets of all time</div>
          </Link>
          <Link href="/auction-archive" className="p-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition">
            <div className="font-semibold text-sm">Auction Archive</div>
            <div className="text-xs text-gray-600">Historic grail hammers</div>
          </Link>
          <Link href="/fanatics-timeline" className="p-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition">
            <div className="font-semibold text-sm">Fanatics Era Timeline</div>
            <div className="text-xs text-gray-600">How the 2022-2026 shift unfolded</div>
          </Link>
          <Link href="/post-mortems" className="p-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition">
            <div className="font-semibold text-sm">Post-Mortems</div>
            <div className="text-xs text-gray-600">Product line failures analyzed</div>
          </Link>
          <Link href="/card-hall-of-fame" className="p-3 rounded-lg border border-gray-200 hover:border-teal-400 hover:bg-teal-50 transition">
            <div className="font-semibold text-sm">Card Hall of Fame</div>
            <div className="text-xs text-gray-600">60 canon-tier individual cards</div>
          </Link>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Card Companies Ranked',
          datePublished: '2026-04-16',
          author: { '@type': 'Organization', name: 'CardVault' },
          description:
            'Editorial tier ranking of 16 sports card manufacturers across 120 years, covering Topps, Upper Deck, Panini, Bowman, Fleer, Donruss, Pacific, Score, Pinnacle, Leaf, and more.',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((i) => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: { '@type': 'Answer', text: i.answer },
          })),
        }}
      />
    </main>
  );
}
