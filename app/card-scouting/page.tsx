import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardScoutingClient from './CardScoutingClient';

export const metadata: Metadata = {
  title: 'Card Scouting Report — Daily Player Investment Analysis | CardVault',
  description: 'Get a daily scouting report on sports card investments. BUY/HOLD/SELL verdicts, investment grades, strengths and risks, comparable players, and full card portfolio analysis. 9,500+ cards across MLB, NBA, NFL, and NHL.',
  openGraph: {
    title: 'Card Scouting Report — Player Investment Analysis | CardVault',
    description: 'Daily scouting reports with BUY/HOLD/SELL verdicts, investment grades, and card portfolio analysis for sports card collectors.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Scouting Report | CardVault',
    description: 'Daily player scouting reports. BUY/HOLD/SELL verdicts, investment grades, risk analysis. 9,500+ cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Scouting Report' },
];

const faqItems = [
  {
    question: 'How are scouting reports generated?',
    answer: 'Each report analyzes a player complete card portfolio from our database of 9,500+ sports cards. We evaluate total cards, set diversity, value range, rookie card count, and year span to generate an investment grade, verdict (BUY/HOLD/SELL/WATCH), and confidence rating. Daily reports feature the same player for everyone; Random mode picks a new player each time.',
  },
  {
    question: 'What does the BUY/HOLD/SELL/WATCH verdict mean?',
    answer: 'BUY means the player cards show favorable value metrics and growth potential. HOLD means stable fundamentals with no strong catalyst. SELL suggests considering taking profits at current levels. WATCH means there is uncertainty worth monitoring before committing. Confidence stars (1-5) indicate how strong the signal is.',
  },
  {
    question: 'What is the investment grade?',
    answer: 'The grade (D through S) reflects the overall quality of a player card portfolio as an investment. It factors in card count, set diversity, rookie card availability, value distribution, and sport. S and A+ grades indicate elite portfolios; C and below suggest higher risk or thinner markets.',
  },
  {
    question: 'How are comparable players chosen?',
    answer: 'Comparables are selected from players in the same sport with similar card counts in our database. They help you benchmark the scouted player against peers with similar market presence. Click any comparable to visit their player page and see their full card list.',
  },
  {
    question: 'Is this financial advice?',
    answer: 'No. Scouting reports are for entertainment and educational purposes only. Card values fluctuate based on player performance, market conditions, and many other factors. Always do your own research before making collecting or investment decisions. Past performance does not guarantee future results.',
  },
];

export default function CardScoutingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Scouting Report',
        description: 'Daily player scouting reports with BUY/HOLD/SELL verdicts, investment grades, and card portfolio analysis.',
        url: 'https://cardvault-two.vercel.app/card-scouting',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Card Scouting &middot; Daily Player Analysis &middot; BUY / HOLD / SELL
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Card Scouting Report
        </h1>
        <p className="text-gray-400 text-lg">
          Deep-dive investment analysis on a new player every day. Card portfolio metrics,
          BUY/HOLD/SELL verdict, strengths, risks, and comparable players.
        </p>
      </div>

      <CardScoutingClient />

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

      {/* Back links */}
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/tools" className="text-amber-500 hover:text-amber-400">&larr; All Tools</Link>
        <Link href="/games" className="text-amber-500 hover:text-amber-400">Games</Link>
        <Link href="/" className="text-amber-500 hover:text-amber-400">Home</Link>
      </div>
    </div>
  );
}
