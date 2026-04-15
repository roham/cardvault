import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyBuzzClient from './HobbyBuzzClient';

export const metadata: Metadata = {
  title: 'Hobby Buzz — Live Collector Discussion Feed | CardVault',
  description: 'See what sports card collectors are talking about right now. Live feed of hot takes, buy/sell signals, grading results, questions, and brags. Community sentiment tracker with trending players and sport filters.',
  openGraph: {
    title: 'Hobby Buzz — Live Collector Feed | CardVault',
    description: 'Live sports card collector discussion feed. Hot takes, buy signals, grading results, and community sentiment — updated in real time.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hobby Buzz | CardVault',
    description: 'Live collector discussion feed with hot takes, signals, and community sentiment.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/community-pulse' },
  { label: 'Hobby Buzz' },
];

const faqItems = [
  {
    question: 'What is Hobby Buzz?',
    answer: 'Hobby Buzz is a simulated live discussion feed showing what sports card collectors are talking about right now. It features hot takes, buy and sell signals, grading results, questions from new collectors, brags about pulls and grades, and news reactions — all generated from our database of 6,800+ real sports cards. The feed updates every 5 seconds with new posts, and you can filter by sport (baseball, basketball, football, hockey) or post type.',
  },
  {
    question: 'Are these real collectors posting?',
    answer: 'The posts are AI-generated simulations based on real collector behaviors and conversations we observe in the hobby. The player mentions, card values, and market commentary reference real cards in our database. While the usernames are fictional, the discussion topics and sentiment accurately reflect the types of conversations happening in card collecting communities, Discord servers, and social media.',
  },
  {
    question: 'What does the Community Sentiment bar show?',
    answer: 'The Community Sentiment bar aggregates all visible posts into three categories: Bullish (green, expecting prices to rise), Bearish (red, expecting prices to fall), and Neutral (gray, informational or asking questions). It gives you a quick read on the overall mood of the collector community. A heavily bullish feed might indicate FOMO, while a bearish feed could signal buying opportunities.',
  },
  {
    question: 'How do I use the buy/sell signals?',
    answer: 'Buy and sell signals represent simulated collector opinions, not financial advice. Buy signals highlight cards that collectors believe are undervalued or have upcoming catalysts. Sell signals indicate cards where collectors think it is time to take profits. Use these as conversation starters and combine them with your own research — check actual eBay sold prices, population reports, and player performance before making decisions.',
  },
  {
    question: 'Can I pause the live feed?',
    answer: 'Yes! Click the Pause Feed button to stop new posts from appearing. This lets you read through the current posts without new content pushing them down. Click Resume Feed to start the live updates again. You can also filter by sport or post type to focus on the content most relevant to you.',
  },
];

export default function HobbyBuzzPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Hobby Buzz — Live Collector Discussion Feed',
        description: 'Live sports card collector discussion feed with hot takes, buy/sell signals, grading results, and community sentiment.',
        url: 'https://cardvault-two.vercel.app/hobby-buzz',
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
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Live Feed &middot; Auto-Updating &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Hobby Buzz</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          See what collectors are saying right now. Hot takes, buy signals, grading results, and market chatter — all in one live feed.
        </p>
      </div>

      <HobbyBuzzClient />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-800/40 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-amber-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Live Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link href="/community-pulse" className="text-amber-400 hover:text-amber-300">Community Pulse &rarr;</Link>
          <Link href="/community-polls" className="text-amber-400 hover:text-amber-300">Community Polls &rarr;</Link>
          <Link href="/league-chat" className="text-amber-400 hover:text-amber-300">League Chat &rarr;</Link>
          <Link href="/market-sentiment" className="text-amber-400 hover:text-amber-300">Market Sentiment &rarr;</Link>
          <Link href="/fear-greed" className="text-amber-400 hover:text-amber-300">Fear & Greed Index &rarr;</Link>
          <Link href="/market-outlook" className="text-amber-400 hover:text-amber-300">2025 Market Outlook &rarr;</Link>
          <Link href="/card-show-feed" className="text-amber-400 hover:text-amber-300">Card Show Feed &rarr;</Link>
          <Link href="/ticker" className="text-amber-400 hover:text-amber-300">Live Price Ticker &rarr;</Link>
        </div>
      </section>
    </div>
  );
}
