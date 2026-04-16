import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PackRaceClient from './PackRaceClient';

export const metadata: Metadata = {
  title: 'Live Pack Race — Race 3 AI Collectors to Pull the Best Pack | CardVault',
  description: 'Race against 3 AI collectors in a real-time pack opening competition. 4 racers, 5 cards each, simultaneous reveals with live commentary. Who pulls the highest-value pack? Daily race and unlimited random mode. Free pack racing simulator for sports cards.',
  openGraph: {
    title: 'Live Pack Race — Real-Time Pack Opening Competition | CardVault',
    description: 'Race 3 AI collectors to pull the best pack. Simultaneous card reveals, live commentary, and podium finishes.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Pack Race — CardVault',
    description: 'Real-time pack opening race. 4 collectors, 5 cards each. Who wins?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Pack Race' },
];

const faqItems = [
  {
    question: 'What is Pack Race?',
    answer: 'Pack Race is a competitive pack opening simulator where you race against 3 AI collectors. All 4 racers open a 5-card pack simultaneously, with cards revealed one at a time. The racer with the highest total pack value wins. Think of it as a drag race, but instead of speed, you are competing on pull quality.',
  },
  {
    question: 'How are the packs generated?',
    answer: 'Each racer gets 5 cards randomly selected from our database of 7,500+ real sports cards. Cards range from common base cards worth $2 to premium hits worth $1,000+. The Daily Race uses the same seed for all players worldwide, so everyone faces the same matchup. Random Race generates fresh packs each time.',
  },
  {
    question: 'Can I filter by sport?',
    answer: 'Yes! Use the sport filter on the menu screen to race with only baseball, basketball, football, or hockey cards. This is great if you want to test your luck in a specific sport. The "All Sports" option includes cards from all four major sports.',
  },
  {
    question: 'Who are the AI opponents?',
    answer: 'You race against three AI collectors with distinct personalities: PackRipKing (aggressive ripper), GemMintGal (careful collector), and WaxBreaker99 (veteran breaker). Their packs are generated from the same card pool as yours, so the competition is fair — it all comes down to the luck of the draw.',
  },
  {
    question: 'How are winners determined?',
    answer: 'The winner is simply the racer whose 5 cards have the highest combined estimated market value. Values are based on recent eBay sold listings and represent mid-grade (PSA 7-8) prices. In case of a tie, the racer with the single highest-value card wins.',
  },
];

export default function PackRacePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Pack Race — Real-Time Pack Opening Competition',
        description: 'Race 3 AI collectors in simultaneous pack openings. 4 racers, 5 cards each, live commentary, and podium finishes.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/pack-race',
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

      <PackRaceClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More Live Experiences</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/live-rip-feed', label: 'Live Rip Feed', desc: 'Watch pack openings in real time' },
            { href: '/hot-deals', label: 'Hot Deals', desc: 'Daily price drops and bargains' },
            { href: '/hobby-buzz', label: 'Hobby Buzz', desc: 'Live collector discussion feed' },
            { href: '/live-hub', label: 'Live Hub', desc: 'All live experiences' },
            { href: '/card-tycoon', label: 'Card Tycoon', desc: 'Buy low, sell high simulator' },
            { href: '/packs', label: 'Pack Store', desc: 'Open packs with vault credits' },
            { href: '/pack-battle', label: 'Pack Battle', desc: 'Head-to-head product comparison' },
            { href: '/card-battle', label: 'Card Battles', desc: 'Stat-based card combat' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="bg-gray-900 border border-gray-800 hover:border-emerald-600/40 rounded-xl p-3 transition-all group">
              <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{l.label}</p>
              <p className="text-gray-500 text-xs mt-1">{l.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8 text-center text-gray-600 text-xs">
        <p>Card values are estimated based on recent eBay sold listings. Pack contents are simulated from our database of 7,500+ real sports cards.</p>
      </div>
    </div>
  );
}
