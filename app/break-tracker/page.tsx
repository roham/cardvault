import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakTrackerClient from './BreakTrackerClient';

export const metadata: Metadata = {
  title: 'Live Break Tracker — Log Pulls, Track Hit Rate & ROI in Real Time | CardVault',
  description: 'Track your box breaks in real time. Log every pull, see running hit rates, calculate ROI on the fly, and share your break results. Supports baseball, basketball, football, and hockey hobby boxes. The ultimate breaker companion.',
  openGraph: {
    title: 'Live Break Tracker — CardVault',
    description: 'Track pulls, hit rate, and ROI during your box break. The breaker companion app.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Live Break Tracker — CardVault',
    description: 'Log pulls in real time. Hit rate, ROI, and break results at your fingertips.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Break Tracker' },
];

const faqItems = [
  {
    question: 'What is the Live Break Tracker?',
    answer: 'The Live Break Tracker is a real-time companion tool for card breakers. While you rip packs or boxes, log each pull with a quick tap — the tracker calculates your running hit rate, total value pulled, and ROI versus your box cost. It works on mobile so you can track while you break at the table, at a card show, or during a live stream.',
  },
  {
    question: 'How do I log a pull during a break?',
    answer: 'Select your product, enter the box cost, and start breaking. For each card pulled, tap the rarity tier (Base, Parallel, Numbered, Auto, Patch, or Mega Hit) and optionally enter a player name and value. Quick-log buttons let you batch-add base cards without entering details for each one. The tracker updates totals instantly.',
  },
  {
    question: 'How is ROI calculated?',
    answer: 'ROI is calculated as (Total Value Pulled minus Box Cost) divided by Box Cost, shown as a percentage. A positive ROI means you pulled more value than you paid for the box. The tracker shows running ROI after each pull so you can see your break trending up or down in real time.',
  },
  {
    question: 'Can I save and share my break results?',
    answer: 'Yes. When you finish a break, the summary screen shows your total pulls, hit rate, total value, and ROI. You can copy a shareable text summary to paste on social media or group chats. Your break history is saved locally so you can review past breaks and track your overall performance over time.',
  },
  {
    question: 'What products are supported?',
    answer: 'The tracker includes preset products for all four major sports: Topps Chrome and Bowman for baseball, Panini Prizm for basketball and football, and Upper Deck for hockey. You can also create a custom product by entering the product name and cost. The rarity tiers work for any sealed product.',
  },
];

export default function BreakTrackerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Live Break Tracker',
        description: 'Real-time box break tracking tool. Log pulls, track hit rates, calculate ROI, and share results for baseball, basketball, football, and hockey hobby boxes.',
        url: 'https://cardvault-two.vercel.app/break-tracker',
        applicationCategory: 'UtilitiesApplication',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Live Tracking &middot; Mobile-First &middot; All 4 Sports
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Live Break Tracker
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Your real-time box break companion. Log every pull, track hit rate and value, calculate ROI on the fly. Built for breakers, by breakers.
        </p>
      </div>

      <BreakTrackerClient />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform ml-4 shrink-0">&#9660;</span>
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
        <h2 className="text-lg font-bold text-white mb-4">More Breaking Tools</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/group-break', label: 'Group Break Builder' },
            { href: '/break-room', label: 'Community Break Room' },
            { href: '/tools/box-break', label: 'Box Break Calculator' },
            { href: '/tools/pack-sim', label: 'Pack Simulator' },
            { href: '/tools/sealed-ev', label: 'Sealed Product EV' },
            { href: '/tools/pack-odds', label: 'Pack Odds Explorer' },
            { href: '/watch-party', label: 'Watch Party' },
            { href: '/break-schedule', label: 'Break Schedule' },
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
