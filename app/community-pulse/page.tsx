import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CommunityPulseClient from './CommunityPulseClient';

export const metadata: Metadata = {
  title: 'Community Pulse — Live Card Collecting Activity | CardVault',
  description: 'See what the card collecting community is doing right now. Live activity feed with simulated purchases, grading submissions, trending searches, break room activity, and market momentum. Real-time pulse of the hobby.',
  openGraph: {
    title: 'Community Pulse — CardVault',
    description: 'Live pulse of the card collecting community. See trending cards, recent activity, and what collectors are doing right now.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Community Pulse — CardVault',
    description: 'Real-time card collecting activity feed. See what the community is doing right now.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Community Pulse' },
];

const faqItems = [
  {
    question: 'What is the Community Pulse?',
    answer: 'The Community Pulse is a real-time activity dashboard that shows simulated collecting activity across the hobby. It displays recent purchases, grading submissions, trending searches, break room participation, and market momentum — giving you a feel for what the community is focused on right now. Think of it as a live heartbeat of the card collecting world.',
  },
  {
    question: 'Is the activity data real?',
    answer: 'The activity feed is simulated using real card data from our database of 6,400+ sports cards. While individual events (purchases, submissions, searches) are generated, the cards, players, and values referenced are real entries from our database. The trending patterns follow realistic hobby cycles — for example, baseball cards trend higher during spring training and the MLB draft, while football cards spike around the NFL season.',
  },
  {
    question: 'How often does the feed update?',
    answer: 'The live feed auto-generates new activity events every few seconds, simulating the constant flow of hobby activity. The trending cards section uses a daily seed so the top trending cards remain consistent throughout the day, similar to how real trending topics work on social media platforms.',
  },
  {
    question: 'Can I filter the activity feed?',
    answer: 'Yes. You can filter by activity type (purchases, grading, searches, breaks, all) and by sport (baseball, basketball, football, hockey, all). This lets you focus on the specific segment of the hobby you care about most.',
  },
  {
    question: 'How can I use the Community Pulse for collecting decisions?',
    answer: 'Watch for patterns in what the community is buying and searching for — if a particular player or set is trending, it may indicate growing demand and potential price increases. The grading submission feed shows which cards collectors consider worth the investment to grade. Use these signals alongside our Market Movers and Fear & Greed Index for a complete picture of hobby momentum.',
  },
];

export default function CommunityPulsePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Community Pulse',
        description: 'Live card collecting activity dashboard. See what the hobby community is doing right now.',
        url: 'https://cardvault-two.vercel.app/community-pulse',
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
        <div className="inline-flex items-center gap-2 bg-pink-950/60 border border-pink-800/50 text-pink-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
          Live Feed &middot; Auto-Updating &middot; Community Activity
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Community Pulse</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The live heartbeat of card collecting. See what collectors are buying, grading, searching, and ripping — right now.
        </p>
      </div>

      <CommunityPulseClient />

      {/* Related */}
      <section className="mt-16 mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Live Features</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/market-movers', label: 'Market Movers', icon: '📈' },
            { href: '/fear-greed', label: 'Fear & Greed Index', icon: '😱' },
            { href: '/market-sectors', label: 'Sector Report', icon: '🏛️' },
            { href: '/market-pulse', label: 'Market Pulse', icon: '💓' },
            { href: '/live-hub', label: 'Live Event Hub', icon: '🔴' },
            { href: '/break-room', label: 'Break Room', icon: '📺' },
            { href: '/hot-now', label: 'Hot Right Now', icon: '🔥' },
            { href: '/live-ticker', label: 'Price Ticker', icon: '📊' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm transition-colors">
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm flex items-center justify-between">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-800 pt-8 mt-8 text-sm text-gray-500">
        <p>
          See overall market sentiment with the <Link href="/fear-greed" className="text-emerald-400 hover:underline">Fear &amp; Greed Index</Link>,
          track <Link href="/market-movers" className="text-emerald-400 hover:underline">today&apos;s market movers</Link>,
          or dive into <Link href="/market-sectors" className="text-emerald-400 hover:underline">sector-level analysis</Link>.
          Browse all <Link href="/tools" className="text-emerald-400 hover:underline">84+ collecting tools</Link>.
        </p>
      </section>
    </div>
  );
}
