import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import RecordBookClient from './RecordBookClient';

export const metadata: Metadata = {
  title: 'Card Price Record Book — Most Expensive Sports Cards Ever Sold | CardVault',
  description: 'The definitive record book of the most expensive sports cards ever sold at auction. From the $12.6M Mickey Mantle to million-dollar LeBron rookies. 40 verified record sales across baseball, basketball, football, and hockey with prices, grades, auction houses, and dates.',
  openGraph: {
    title: 'Card Price Record Book — Most Expensive Cards Ever Sold',
    description: '40 verified record card sales — $12.6M Mantle, $5.8M LeBron, $4.3M Mahomes, $3.75M Gretzky. Filter by sport, sort by price or year.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price Record Book — CardVault',
    description: 'The most expensive sports cards ever sold. 40 verified auction records with prices, grades, and details.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Record Book' },
];

const faqItems = [
  {
    question: 'What is the most expensive sports card ever sold?',
    answer: 'The most expensive sports card ever sold is the 1952 Topps Mickey Mantle #311, graded SGC 9.5, which sold for $12.6 million at Heritage Auctions in August 2022. This shattered the previous record of $7.25 million held by the T206 Honus Wagner. The 1952 Topps Mantle is considered the holy grail of post-war baseball cards, and only a handful of high-grade examples exist.',
  },
  {
    question: 'What is the most expensive basketball card ever sold?',
    answer: 'The most expensive basketball card is the 2003 Upper Deck Exquisite LeBron James Rookie Patch Autograph (RPA), graded BGS 9, which sold for $5.8 million at Goldin Auctions in April 2024. Limited to only 99 copies, this card combines the greatest active player with extreme scarcity. Other notable sales include the Luka Doncic National Treasures Logoman RPA ($4.6M) and the 1986 Fleer Michael Jordan BGS 10 ($2.93M).',
  },
  {
    question: 'What is the most expensive football card ever sold?',
    answer: 'The most expensive football card is the 2017 Panini National Treasures Patrick Mahomes Rookie Patch Auto (Shields Logo 1-of-1), which sold for $4.3 million at PWCC in March 2021. The second most expensive is the 2000 Playoff Contenders Tom Brady Championship Ticket Auto ($3.1M). Both sales occurred during the 2021 sports card boom when market prices peaked across all sports.',
  },
  {
    question: 'What is the most expensive hockey card ever sold?',
    answer: 'The most expensive hockey card is the 1979 O-Pee-Chee Wayne Gretzky #18 rookie card, graded PSA 10, which sold for $3.75 million at Heritage Auctions in December 2023. Only 2 PSA 10 copies are known to exist. The second most valuable hockey card is the 1966 Topps Bobby Orr RC ($900K PSA 9), followed by the 1951 Parkhurst Gordie Howe RC.',
  },
  {
    question: 'Why are rookie cards worth more than other cards?',
    answer: 'Rookie cards (RCs) consistently command the highest prices because they represent the first officially licensed card of a player. About 75% of all record card sales are rookie cards. Collectors prize RCs because they are finite in supply (unlike reprints or subsequent year cards), have historical significance as the earliest representation of a player\'s career, and tend to appreciate the most as a player\'s legacy grows. First-year cards are essentially the "first edition" of a player\'s collectible history.',
  },
];

export default function RecordBookPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Price Record Book — Most Expensive Sports Cards Ever Sold',
        description: 'The definitive record book of the most expensive sports cards ever sold at auction. 40 verified record sales across baseball, basketball, football, and hockey.',
        url: 'https://cardvault-two.vercel.app/record-book',
        applicationCategory: 'ReferenceApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }} />

      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Price Record Book
        </h1>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
          The most expensive sports cards ever sold at auction. From the $12.6M Mickey Mantle to million-dollar LeBron rookies — 40 verified record sales across baseball, basketball, football, and hockey with prices, grades, auction houses, and sale dates.
        </p>
      </div>

      <RecordBookClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-gray-800/50 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/40 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-white hover:text-blue-400 transition-colors">
                {item.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
        <Link href="/tools/grading-roi" className="hover:text-blue-400 transition-colors">Grading ROI</Link>
        <span>|</span>
        <Link href="/tools/investment-calc" className="hover:text-blue-400 transition-colors">Investment Calculator</Link>
        <span>|</span>
        <Link href="/guides/most-valuable-sports-cards" className="hover:text-blue-400 transition-colors">Most Valuable Cards Guide</Link>
        <span>|</span>
        <Link href="/tools/rarity-score" className="hover:text-blue-400 transition-colors">Rarity Score</Link>
        <span>|</span>
        <Link href="/tools/pop-report" className="hover:text-blue-400 transition-colors">Population Report</Link>
        <span>|</span>
        <Link href="/news" className="hover:text-blue-400 transition-colors">Card News</Link>
        <span>|</span>
        <Link href="/market-report" className="hover:text-blue-400 transition-colors">Market Report</Link>
      </div>
    </div>
  );
}
