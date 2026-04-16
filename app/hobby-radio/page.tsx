import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HobbyRadioClient from './HobbyRadioClient';

export const metadata: Metadata = {
  title: 'Card Hobby Radio — Live Collector Broadcast | CardVault',
  description: 'Tune in to Card Hobby Radio — a live simulated broadcast covering today\'s sports card market. Rotating segments: market updates, caller Q&A, hot takes, player spotlights, and deal alerts. Real data from 9,000+ cards across MLB, NFL, NBA, and NHL.',
  openGraph: {
    title: 'Card Hobby Radio — Live Collector Broadcast | CardVault',
    description: 'Simulated live radio broadcast for card collectors. Market updates, hot takes, caller Q&A, and deal alerts.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Hobby Radio — CardVault',
    description: 'Live card collecting radio — market updates, hot takes, caller Q&A, and deal alerts from real card data.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Hobby Radio' },
];

const faqItems = [
  {
    question: 'What is Card Hobby Radio?',
    answer: 'Card Hobby Radio is a simulated live radio broadcast for sports card collectors. It features rotating segments — Market Updates with price movers, Caller Q&A where collectors ask questions and get expert answers, Hot Takes with bold predictions and opinions, Player Spotlights highlighting investment-worthy cards, and Deal Alerts with buying opportunities. All card data comes from our 9,000+ card database with real estimated values.',
  },
  {
    question: 'How does the broadcast work?',
    answer: 'The broadcast auto-advances through segments, with new content appearing every 5-8 seconds. Each segment lasts about 60 seconds before rotating to the next type. You can pause and resume at any time. The daily broadcast is seeded to the current date so all listeners hear the same content. Switch to Random mode for a fresh broadcast anytime.',
  },
  {
    question: 'Who are the hosts and callers?',
    answer: 'The show is hosted by two AI personalities: Big Mike (market analyst, data-driven, 15 years in the hobby) and Card Queen (collector advocate, community-focused, breaks and social media expert). Callers are simulated collectors representing different archetypes — flippers, beginners, vintage enthusiasts, investors, and set builders — each with questions matching their collecting style.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes. Use the sport filter to focus the broadcast on MLB, NBA, NFL, or NHL cards only. The All option shows content across all four sports. Filtering changes which cards and players appear in market updates, spotlights, and deal alerts.',
  },
  {
    question: 'Is the data real?',
    answer: 'All card references use real data from our database of 9,000+ sports cards with actual estimated values. Market movements, price comparisons, and card details are based on real card data. The broadcast format and commentary are simulated to create an entertaining and educational experience.',
  },
];

export default function HobbyRadioPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Hobby Radio — Live Collector Broadcast',
        description: 'Simulated live radio broadcast for sports card collectors with market updates, caller Q&A, hot takes, player spotlights, and deal alerts.',
        url: 'https://cardvault-two.vercel.app/hobby-radio',
        applicationCategory: 'EntertainmentApplication',
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
          ON AIR &middot; Live Broadcast &middot; 4 Sports
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
          Card Hobby Radio
        </h1>
        <p className="text-zinc-400 text-base max-w-2xl">
          Your daily card collecting broadcast. Market updates, caller Q&amp;A, hot takes, player spotlights, and deal alerts — all powered by real data from 9,000+ cards.
        </p>
      </div>

      <HobbyRadioClient />

      {/* How It Works */}
      <div className="mt-10 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { step: '1', title: 'Tune In', desc: 'Hit play to start the live broadcast' },
            { step: '2', title: 'Listen', desc: 'Segments rotate: updates, Q&A, takes, spotlights' },
            { step: '3', title: 'Filter', desc: 'Focus on your sport: MLB, NBA, NFL, or NHL' },
            { step: '4', title: 'Act', desc: 'Use insights for your next card move' },
          ].map(s => (
            <div key={s.step} className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-3 text-center">
              <div className="text-amber-400 font-bold text-lg mb-1">{s.step}</div>
              <div className="text-sm font-medium text-white">{s.title}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-10 border-t border-zinc-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-zinc-800/30 border border-zinc-700/30 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-zinc-200 hover:text-white">
                {faq.question}
              </summary>
              <div className="px-4 pb-3 text-sm text-zinc-400 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-bold text-white mb-3">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/card-wire', label: 'Card Wire', desc: 'Live market news wire' },
            { href: '/market-chat', label: 'Market Chat', desc: 'Collector chat room' },
            { href: '/hobby-buzz', label: 'Hobby Buzz', desc: 'Collector discussion feed' },
            { href: '/power-plays', label: 'Power Plays', desc: 'Daily strategy picks' },
            { href: '/market-movers', label: 'Market Movers', desc: 'Daily price changes' },
            { href: '/live-hub', label: 'Live Hub', desc: 'All live features' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg p-3 hover:border-zinc-600 transition-colors">
              <div className="text-sm font-medium text-white">{link.label}</div>
              <div className="text-xs text-zinc-500">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
