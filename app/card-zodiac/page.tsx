import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardZodiacClient from './CardZodiacClient';

export const metadata: Metadata = {
  title: 'Card Zodiac — Your Collector Sign by Birth Month | CardVault',
  description: 'Enter your birthday, get your Card Zodiac sign. 12 collector archetypes — The Archer, The Sprinter, The Grail Hunter, The Completist, and more. Ruling sport, ruling grail card, compatible signs, rival sign. Share your collector personality.',
  openGraph: {
    title: 'Card Zodiac — CardVault',
    description: 'Your birthday reveals your collector zodiac sign. 12 archetypes. One real grail card per sign.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Zodiac — CardVault',
    description: 'What collector sign were you born under? 12 zodiac archetypes reveal your card destiny.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Card Zodiac' },
];

const faqItems = [
  {
    question: 'How is my Card Zodiac sign determined?',
    answer: 'Your sign is determined by your birth month. Each of the 12 months maps to one collector archetype. Unlike traditional astrology (which uses 30-day cusps), Card Zodiac uses calendar months as whole units — if you were born any day in January you are The Archer, any day in February you are The Goalkeeper, and so on. Within the month, your birth day is used to pull a deterministic ruling grail card from your sign\'s player pool.',
  },
  {
    question: 'Is this based on real astrology?',
    answer: 'No. Card Zodiac is a collector personality framework loosely inspired by zodiac archetypes. The 12 signs represent collector behavior patterns (patience, aggression, completion, hoarding, prospecting, etc.) mapped to birth months. It is for entertainment, not divination. Nobody\'s collection performance depends on what month they were born — but it is a fun way to discover a collecting style that might resonate.',
  },
  {
    question: 'What does the "ruling grail" mean?',
    answer: 'Each sign has one iconic card from the CardVault database that represents the pinnacle of that archetype. The Archer (January) is ruled by Mickey Mantle — the vintage precision-hunter\'s ultimate target. The Sprinter (May) is ruled by Michael Jordan\'s 1986 Fleer rookie — momentum\'s greatest modern card. Your ruling grail is the real card in your sign\'s ruling player pool with the highest value, pulled live from the 9,840-card database.',
  },
  {
    question: 'What are compatible and rival signs?',
    answer: 'Compatible signs share collector DNA — similar patience levels, similar eras, similar risk appetites. The Archer (patient vintage) is compatible with The Veteran (long-hold) and The Grail Hunter (high-value vintage). Rival signs collect in opposite ways — The Archer\'s rival is The Sprinter (impulsive momentum). Trading within your compatible set feels natural. Trading with your rival means fundamental disagreement on what makes a card valuable.',
  },
  {
    question: 'Can I share my Card Zodiac result?',
    answer: 'Yes. The result screen has a Copy Result button that pushes a formatted text block to your clipboard — your sign name, emoji, ruling sport, lucky jersey number, ruling grail card, and the CardVault URL. Paste it in Discord, Reddit, X, or an iMessage to a collecting friend. The format is designed to fit in one text message and start a "what sign are you?" conversation.',
  },
  {
    question: 'Why these 12 archetypes?',
    answer: 'The 12 signs — Archer, Goalkeeper, Rookie, Slugger, Sprinter, Closer, Veteran, Scout, Trader, Completist, Hoarder, Grail Hunter — cover the major axes of collector behavior: patience (Archer/Veteran) vs impulse (Sprinter), set-completion (Completist) vs grail-hunting (Grail Hunter), quantity (Hoarder) vs quality (Grail Hunter), prospect (Scout/Rookie) vs established (Veteran), trading (Trader/Closer) vs holding (Veteran/Archer). Almost any collecting style maps to one of the 12.',
  },
];

export default function CardZodiacPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Card Zodiac',
        description: 'Enter your birthday to discover your collector zodiac sign. 12 archetypes mapped to birth months, each with a ruling grail card, ruling sport, lucky number, compatible signs, and rival sign.',
        url: 'https://cardvault-two.vercel.app/card-zodiac',
        applicationCategory: 'GameApplication',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span>♈</span>
          Card Zodiac &middot; 12 Signs &middot; Your Collecting Destiny
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Zodiac</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Twelve collector archetypes. One per birth month. Enter your birthday —
          reveal your sign, your ruling sport, your lucky number, and your ruling grail card.
        </p>
      </div>

      <CardZodiacClient />

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

      <div className="mt-8 text-sm text-gray-500">
        <p>
          More <Link href="/games" className="text-indigo-400 hover:underline">CardVault Games</Link>:{' '}
          <Link href="/card-darts" className="text-indigo-400 hover:underline">Card Darts</Link>,{' '}
          <Link href="/card-triad" className="text-indigo-400 hover:underline">Card Triad</Link>,{' '}
          <Link href="/card-plinko" className="text-indigo-400 hover:underline">Card Plinko</Link>,{' '}
          <Link href="/card-pairs" className="text-indigo-400 hover:underline">Card Pair Trader</Link>,{' '}
          <Link href="/card-wordle" className="text-indigo-400 hover:underline">Card Wordle</Link>,{' '}
          <Link href="/collector-quiz" className="text-indigo-400 hover:underline">Collector Quiz</Link>.
        </p>
      </div>
    </div>
  );
}
