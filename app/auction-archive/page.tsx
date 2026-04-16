import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuctionArchiveClient from './AuctionArchiveClient';

export const metadata: Metadata = {
  title: 'Auction Archive — The Greatest Card Auction Hammers | CardVault',
  description: 'A curated editorial archive of 40 legendary card auction hammers. From the $12.6M 1952 Topps Mantle to the $5.3M Pikachu Illustrator to the $3.1M Brady Contenders — every major modern-era card sale, with sale date, auction house, grade, and backstory.',
  openGraph: {
    title: 'Auction Archive — CardVault',
    description: 'The 40 greatest card auction hammers of the modern era. Goldin, Heritage, PWCC. Mega, Elite, Major, Notable tiers.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Auction Archive — CardVault',
    description: 'The greatest card hammers ever. 40 record-setting sales with backstories.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Auction Archive' },
];

const faqItems = [
  {
    question: 'What is the most expensive sports card ever sold at auction?',
    answer: 'The 1952 Topps Mickey Mantle #311 graded SGC 9.5 sold for $12.6M at Heritage Platinum Night in August 2022 to Anthony Giordano. That sale set the all-time public record for any sports or trading card at auction. Before that the record was held by the T206 Honus Wagner PSA 5 at $6.6M. The Mantle was part of the Rosen Sinclair collection and had been off-market for over a decade.',
  },
  {
    question: 'What is the most expensive Pokémon card ever sold?',
    answer: 'Logan Paul\u2019s Pikachu Illustrator Promo graded PSA 10 sold in a private sale for $5.275M in July 2022. The Pikachu Illustrator was awarded to winners of a 1998 CoroCoro magazine card-illustration contest in Japan — fewer than 40 were produced, and Paul\u2019s copy is pop-2 at PSA 10. Logan Paul announced the purchase on his podcast and wore the card at WrestleMania.',
  },
  {
    question: 'Why do Goldin and Heritage dominate this archive?',
    answer: 'Goldin Auctions (now eBay-owned) and Heritage Auctions are the two dominant trading-card auction houses for marquee lots. Goldin specializes in modern and high-end graded cards with their Platinum Night and weekly auctions. Heritage has deep vintage infrastructure and run Platinum Night events for pre-war and post-war rarities. PWCC Marketplace was also a major player before their 2022 restructuring. Robert Edward, Memory Lane, Mile High, and SCP handle specialty segments (Robert Edward = vintage auction catalogs, Memory Lane = Americana/boxing, Mile High = hockey/Western, SCP = high-end vintage with photo documentation). Christie\u2019s occasionally handles marquee lots when estates route through traditional auction channels.',
  },
  {
    question: 'Why are so many peak sales from 2020-2022?',
    answer: 'The pandemic-era card boom (March 2020 through roughly March 2022) re-priced the entire hobby. With sports leagues paused and capital looking for alternatives, high-net-worth collectors and institutional buyers poured money into graded cards. Many all-time-high records were set in that window. Since early 2022, the modern-card market has corrected substantially — a Luka Silver Prizm PSA 10 that peaked at $35K sold for $3-5K in 2024. Vintage and pop-1 rarities have held value better than modern rookie parallels.',
  },
  {
    question: 'Do these sale prices include buyer premium?',
    answer: 'Yes. All prices shown are final hammer plus buyer premium — the total amount the buyer paid. Auction houses charge buyer premiums ranging from 10% to 25% on top of the hammer price. So a $10M hammer at a 20% premium is listed here as $12M. Insurance values, appraisal values, and private-sale "list prices" are excluded from this archive; only public-record auction results are tracked.',
  },
  {
    question: 'Is the same card always worth the same?',
    answer: 'No. The same card at the same grade can sell for very different prices across time. A 1986 Fleer Jordan PSA 10 that sold for $840K at peak is closer to $300K in 2024-26 as PSA 10 populations have grown and the broader basketball card market has cooled. Grade migrations (cards re-submitted and re-scored), pop-report updates, and market sentiment all drive price. Use this archive for historical reference; for current market values check our Comp Calculator and eBay sold listings.',
  },
];

export default function AuctionArchivePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Auction Archive — The Greatest Card Auction Hammers',
        description: 'Curated editorial archive of 40 legendary card auction hammers from the modern grading era, including $12.6M 1952 Topps Mantle, $5.3M Pikachu Illustrator, and $3.1M 2000 Contenders Brady.',
        url: 'https://cardvault-two.vercel.app/auction-archive',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault' },
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Auction Archive &middot; 40 hammers &middot; 4 tiers &middot; 7 sports
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Auction Archive</h1>
        <p className="text-gray-400 text-lg">
          The greatest card hammers of the modern grading era, organized by tier. $12.6M Mantle, $5.3M Pikachu
          Illustrator, $4.6M Luka National Treasures, $3.9M Trout Superfractor, $3.1M Brady Contenders — every major
          public auction result with the story behind it.
        </p>
      </div>

      <AuctionArchiveClient />

      {/* FAQ */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/40 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-amber-400 transition-colors">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400">{faq.answer}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 border-t border-gray-800 pt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Related Media & Tools</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/card-hall-of-fame" className="text-amber-500 hover:text-amber-400">Card Hall of Fame</Link>
          <Link href="/set-archives" className="text-amber-500 hover:text-amber-400">Set Archives</Link>
          <Link href="/famous-error-cards" className="text-amber-500 hover:text-amber-400">Famous Error Cards</Link>
          <Link href="/tools/comp-calculator" className="text-amber-500 hover:text-amber-400">Comp Calculator</Link>
          <Link href="/tools/counterfeit-scanner" className="text-amber-500 hover:text-amber-400">Counterfeit Risk Scanner</Link>
          <Link href="/pop-watch" className="text-amber-500 hover:text-amber-400">Pop Watch</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-amber-500 hover:text-amber-400">Tools</Link>
        <Link href="/games" className="text-amber-500 hover:text-amber-400">Games</Link>
        <Link href="/" className="text-amber-500 hover:text-amber-400">Home</Link>
      </div>
    </div>
  );
}
