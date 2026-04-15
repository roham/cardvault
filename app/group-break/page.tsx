import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GroupBreakClient from './GroupBreakClient';

export const metadata: Metadata = {
  title: 'Group Break Builder — Join Simulated Card Breaks | CardVault',
  description: 'Join group card breaks with team selection. Pick your team, watch cards revealed live, and collect your pulls. Supports baseball, basketball, football, and hockey hobby boxes. Multiple break formats.',
  openGraph: {
    title: 'Group Break Builder — CardVault',
    description: 'Pick your team, buy a spot, and watch the break unfold. All cards of your team are yours.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Group Break Builder — CardVault',
    description: 'Join simulated group breaks. Pick your team, watch the rip, collect your cards.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Group Break' },
];

const faqItems = [
  {
    question: 'What is a group break in card collecting?',
    answer: 'A group break (or case break) is where multiple collectors split the cost of an expensive hobby box or case. Each participant buys a "spot" — usually tied to a specific team. When the box is opened, every card pulled for your team goes to you. This lets collectors access premium products at a fraction of the cost while adding excitement to the ripping experience.',
  },
  {
    question: 'What break formats are available?',
    answer: 'We offer three formats: Pick Your Team (PYT) where you choose your team and all their cards are yours; Random Team where teams are randomly assigned for the cheapest spots; and Hit Draft where hits are drafted in spot order, adding strategic depth. PYT is the most popular format in real breaks.',
  },
  {
    question: 'How are spot prices determined?',
    answer: 'Spot prices are based on the total expected value of the box divided by the number of spots, with popular teams (like Yankees, Cowboys, or Lakers) costing more in real breaks. In our simulation, all spots are equally priced so you can focus on the experience rather than pricing dynamics.',
  },
  {
    question: 'Are group breaks a good deal for collectors?',
    answer: 'Group breaks give you access to premium hobby boxes that might cost $200-$1000+ at a fraction of the price. However, the variance is high — you might get amazing hits or nothing at all for your team. The value depends on which teams are hot (rookie-heavy teams in draft years are worth more). Think of it as entertainment with potential upside.',
  },
  {
    question: 'What happens to hits in a group break?',
    answer: 'In a Pick Your Team break, all cards (including hits like autographs, numbered cards, and parallels) for your team go to you. In Hit Draft format, when a hit is pulled, the person with the current draft pick claims it regardless of team. This creates interesting strategy around draft position.',
  },
];

export default function GroupBreakPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Group Break Builder',
        description: 'Join simulated group card breaks. Pick your team, watch cards revealed live, and collect your pulls across baseball, basketball, football, and hockey.',
        url: 'https://cardvault-two.vercel.app/group-break',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
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

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Team Breaks - Live Reveal - Free to Join
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Group Break Builder
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Pick your team, buy a spot, and watch the break unfold. Every card of your team is yours.
          Multiple break formats, all four major sports.
        </p>
      </div>

      <GroupBreakClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform ml-4 shrink-0">▼</span>
              </summary>
              <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="mt-12 mb-8 border-t border-zinc-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">More Live Experiences</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/break-room', label: 'Community Break Room' },
            { href: '/watch-party', label: 'Watch Party' },
            { href: '/auction-house', label: 'Auction House' },
            { href: '/break-schedule', label: 'Break Schedule' },
            { href: '/tools/pack-sim', label: 'Pack Simulator' },
            { href: '/tools/box-break', label: 'Box Break Calculator' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV' },
            { href: '/break-tracker', label: 'Break Tracker' },
            { href: '/draft-live', label: 'Draft Night Live' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
