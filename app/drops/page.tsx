import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DropsCalendar from './DropsCalendar';

export const metadata: Metadata = {
  title: 'Drop Calendar — Themed Pack Events & Limited Releases',
  description: 'CardVault drop calendar. Upcoming themed digital pack events: NBA Playoffs, NFL Draft Night, Vintage Weekend, Stanley Cup, and more. Limited packs, exclusive badges, curated card pools.',
  openGraph: {
    title: 'Drop Calendar — CardVault',
    description: 'Upcoming themed pack drops: NBA Playoffs, NFL Draft Night, Vintage Weekend, and more. Limited packs, exclusive badges.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Drop Calendar — CardVault',
    description: 'Themed digital pack events with limited packs and exclusive badges.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Drop Calendar' },
];

const faqItems = [
  {
    question: 'What is a CardVault drop?',
    answer: 'A drop is a timed event where themed digital packs become available for a limited window. Each drop features a curated card pool (like Playoff Legends or Vintage Vault), a set number of packs, and exclusive event badges. When the packs are gone or the timer expires, the drop ends.',
  },
  {
    question: 'How do I participate in a drop?',
    answer: 'When a drop goes live, visit the Premium Packs page to open themed packs from the event pool. Cards you pull are automatically available to add to your digital binder. You earn an event badge for participating.',
  },
  {
    question: 'Are drop packs different from regular premium packs?',
    answer: 'Yes. Drop packs pull from special curated pools that are only available during the event window. For example, a Vintage Weekend drop only includes pre-1960 cards, while a Draft Night drop features top draft picks across all years. Regular premium packs are always available.',
  },
  {
    question: 'What are event badges?',
    answer: 'Each drop awards a unique badge to participants. Badges appear on your collector profile and track which events you participated in. Collect them all to show your dedication as a CardVault collector.',
  },
];

export default function DropsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Drop Calendar — CardVault',
        description: 'Themed digital pack events with limited packs and exclusive badges.',
        url: 'https://cardvault-two.vercel.app/drops',
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
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Live events &middot; Limited packs
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Drop Calendar</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Themed pack events tied to the sports calendar. NBA Playoffs, NFL Draft Night, Vintage Weekend, and more. Limited packs, curated pools, exclusive badges.
        </p>
      </div>

      <DropsCalendar />

      {/* FAQ */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
