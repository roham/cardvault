import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import EventCountdownsClient from './EventCountdownsClient';

export const metadata: Metadata = {
  title: 'Hobby Event Countdowns — Major Card Collecting Dates & Market Impact | CardVault',
  description: 'Countdown timers for every major card collecting event: NFL Draft, NBA Draft, NSCC National, MLB playoffs, Super Bowl, All-Star games, Hall of Fame inductions, and more. Market impact analysis and collecting strategies for each event. Never miss a hobby catalyst.',
  openGraph: {
    title: 'Hobby Event Countdowns — CardVault',
    description: 'Live countdowns to every major card collecting event. Market impact and strategies included.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Hobby Event Countdowns — CardVault',
    description: 'Never miss a hobby event. Countdowns, market impact, and collecting strategies.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Event Countdowns' },
];

const faqItems = [
  {
    question: 'What events are tracked in the countdown dashboard?',
    answer: 'The dashboard tracks 15+ major hobby events including: NFL Draft, NBA Draft, MLB Draft, NHL Draft, Super Bowl, NBA Finals, World Series, Stanley Cup Finals, NFL/NBA/MLB/NHL All-Star Games, NSCC National Sports Collectors Convention, Hall of Fame inductions for all four sports, MLB Opening Day, and NFL Kickoff Weekend. Each event shows a live countdown timer, market impact rating, and collecting strategy.',
  },
  {
    question: 'How does the market impact rating work?',
    answer: 'Each event receives a market impact score from 1-10 based on historical price movement around that event. A 10/10 (like the NFL Draft or Super Bowl) means extreme card price volatility — cards related to the event can move 50-200%. A 3/10 (like a mid-season All-Star game) means modest impact. The rating helps you prioritize which events to prepare for.',
  },
  {
    question: 'What are the best hobby events for buying cards?',
    answer: 'The best buying opportunities come BEFORE events when prices are suppressed: football cards are cheapest in spring/summer before NFL season kicks off, basketball cards dip in summer, and baseball cards are discounted in winter. The NSCC National is also a great buying event — dealers bring inventory they need to move, creating deals. Post-elimination sell-offs (when a team loses in playoffs) also create brief buying windows.',
  },
  {
    question: 'What are the best hobby events for selling cards?',
    answer: 'Sell INTO the hype: football cards peak during NFL playoffs and Super Bowl week. Basketball cards peak during the NBA Finals. Baseball cards peak during the World Series and around Hall of Fame announcements. Draft night is the single biggest 24-hour price catalyst — cards of draft picks can spike 200%+ in hours. Sell within 48 hours of peak hype for maximum return.',
  },
  {
    question: 'What is the NSCC National?',
    answer: 'The NSCC (National Sports Collectors Convention) is the largest annual card collecting event in the world. Held each summer in a different US city, it features 500+ dealer booths, exclusive card releases from Topps/Panini/Upper Deck, autograph signings, and thousands of collectors. It is the single most important in-person event for the hobby. Attending the National is a bucket-list item for serious collectors.',
  },
];

export default function EventCountdownsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Hobby Event Countdowns',
        description: 'Live countdowns to every major card collecting event with market impact analysis and collecting strategies.',
        url: 'https://cardvault-two.vercel.app/event-countdowns',
        applicationCategory: 'LifestyleApplication',
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
        <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          15+ Events &middot; Live Countdowns &middot; Market Impact
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Hobby Event Countdowns
        </h1>
        <p className="text-gray-400 text-lg">
          Live countdowns to every major card collecting event. Market impact ratings, collecting
          strategies, and never miss a hobby catalyst.
        </p>
      </div>

      <EventCountdownsClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related */}
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Link href="/seasonal-calendar" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Seasonal Calendar</h3>
          <p className="text-gray-400 text-xs">12-month buy/sell/hold guide</p>
        </Link>
        <Link href="/market-weather" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Market Weather</h3>
          <p className="text-gray-400 text-xs">Daily market conditions</p>
        </Link>
        <Link href="/draft-war-room" className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 hover:border-gray-700/60 transition-colors">
          <h3 className="font-semibold text-white mb-1">Draft War Room</h3>
          <p className="text-gray-400 text-xs">Draft night card companion</p>
        </Link>
      </div>

      <div className="mt-8 text-center text-gray-600 text-xs">
        Event dates are based on announced schedules and historical patterns. Dates may shift.
      </div>
    </div>
  );
}
