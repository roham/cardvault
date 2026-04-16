import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketChatClient from './MarketChatClient';

export const metadata: Metadata = {
  title: 'Card Market Live Chat — Real-Time Collector Community Feed | CardVault',
  description: 'Watch the card collecting community in real-time. 20 AI collector personas share pulls, sales, alerts, and market discussions using real data from 9,000+ sports cards. Filter by pulls, sales, alerts, or Q&A.',
  openGraph: {
    title: 'Card Market Live Chat — Collector Community | CardVault',
    description: 'Live chat feed from 20 collector personas. Pulls, sales, alerts, and market talk using real card data.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Live Chat — CardVault',
    description: 'Watch collectors share pulls, sales, and market opinions in real-time.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Market Chat' },
];

const faqItems = [
  {
    question: 'Is this a real chat room?',
    answer: 'Market Chat is a simulated live chat feed featuring 20 AI collector personas. Each persona has a unique collecting style — flippers, vintage collectors, rookie hunters, grading enthusiasts, and more. All card references use real data from our 9,000+ card database with actual estimated values.',
  },
  {
    question: 'What types of messages appear in the chat?',
    answer: 'Five message types appear: Regular Messages (general discussion and hot takes), Pulls (pack opening results with real card data), Sales (buy/sell activity with prices), Alerts (breaking market news and player performance updates), and Questions (community Q&A about collecting, grading, and investing).',
  },
  {
    question: 'Can I filter the chat feed?',
    answer: 'Yes. Use the filter buttons above the chat to show only specific message types. Filter by Pulls to see what people are opening, Sales to track buy/sell activity, Alerts for breaking news, or Q&A for community questions. Select All to see the full feed.',
  },
  {
    question: 'How often do new messages appear?',
    answer: 'New messages appear every 4-7 seconds when the feed is live. You can pause and resume the feed at any time using the Pause button. The chat keeps the most recent 100 messages and auto-scrolls to show the latest activity.',
  },
  {
    question: 'Who are the collector personas?',
    answer: 'There are 20 unique personas representing different collecting styles: FlipKing23 (flipper), RookieHunter (rookie specialist), VintageVibes (classic cards), GradeChaser (PSA/BGS expert), PackAddict99 (pack opener), SetBuilder_Mike (completionist), and more. Each persona generates messages matching their collecting style.',
  },
];

export default function MarketChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Market Chat',
        description: 'Live simulated chat feed from 20 collector personas discussing pulls, sales, alerts, and market trends using real card data.',
        url: 'https://cardvault-two.vercel.app/market-chat',
        applicationCategory: 'SocialNetworkingApplication',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          Market Chat &middot; Live Feed &middot; 20 Collectors
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Live Chat</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Watch the collecting community in action. 20 collector personas share pulls,
          discuss prices, post alerts, and ask questions — all powered by real card data.
        </p>
      </div>

      <MarketChatClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-indigo-400 transition-colors list-none flex items-center gap-2">
                <span className="text-indigo-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/live-hub" className="text-indigo-400 hover:underline">CardVault Live</Link> experience.
          See also: <Link href="/hobby-buzz" className="text-indigo-400 hover:underline">Hobby Buzz</Link>,{' '}
          <Link href="/community-pulse" className="text-indigo-400 hover:underline">Community Pulse</Link>,{' '}
          <Link href="/card-wire" className="text-indigo-400 hover:underline">Card Wire</Link>,{' '}
          <Link href="/live-rip-feed" className="text-indigo-400 hover:underline">Live Rip Feed</Link>,{' '}
          <Link href="/trade-wall" className="text-indigo-400 hover:underline">Trade Wall</Link>.
        </p>
      </div>
    </div>
  );
}
