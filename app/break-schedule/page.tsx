import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BreakScheduleClient from './BreakScheduleClient';

export const metadata: Metadata = {
  title: 'Break Schedule — Upcoming Live Card Breaks & Events | CardVault',
  description: 'Full schedule of upcoming live card breaks on CardVault. Hobby box rips, team breaks, vintage specials, and themed events across baseball, basketball, football, and hockey. Set reminders and never miss a break.',
  openGraph: {
    title: 'Break Schedule — Upcoming Live Breaks | CardVault',
    description: 'Full schedule of upcoming card breaks. Hobby boxes, team breaks, vintage specials, and themed events.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Break Schedule — CardVault',
    description: 'Never miss a live card break. Full schedule with reminders.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Break Schedule' },
];

const faqItems = [
  {
    question: 'What is a break schedule?',
    answer: 'The break schedule shows all upcoming live card break events on CardVault. Each entry lists the break format (hobby box, team break, random teams, or pick-your-pack), the product being opened, the sport, the time, and the AI host running the break. You can set reminders so you never miss a break you are interested in.',
  },
  {
    question: 'How often are breaks scheduled?',
    answer: 'CardVault runs 6 break rooms per day across all four major sports. Breaks rotate hourly with different formats and products. Special themed breaks happen during major events — NFL Draft Night, NBA Playoffs, MLB Opening Day, and Stanley Cup Finals all get dedicated break sessions with premium products.',
  },
  {
    question: 'Can I set reminders for upcoming breaks?',
    answer: 'Yes. Click the bell icon on any scheduled break to add it to your reminders. Reminders are saved in your browser so they persist across visits. You can view all your reminders in the "My Reminders" tab and remove them at any time.',
  },
  {
    question: 'What break formats are available?',
    answer: 'CardVault offers four break formats: Hobby Box (full box opened one pack at a time), Team Break (buy a team slot, receive all cards for that team), Random Teams (teams assigned randomly for a lower buy-in), and Pick Your Pack (choose which pack to open from the box). Each format offers a different experience and price point.',
  },
  {
    question: 'Do breaks have AI commentary?',
    answer: 'Every break features a unique AI host personality — from the hype-heavy CardKingMike to the analytical JaxWax. Hosts provide play-by-play calls, market analysis on valuable pulls, hype reactions for big hits, trivia about players, and ROI observations. The commentary makes watching breaks engaging even if you are just spectating.',
  },
];

export default function BreakSchedulePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Break Schedule',
        description: 'Full schedule of upcoming live card breaks with reminders, sport filters, and AI-hosted break rooms.',
        url: 'https://cardvault-two.vercel.app/break-schedule',
        applicationCategory: 'EntertainmentApplication',
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

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
        Break Schedule
      </h1>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Upcoming live card breaks across all sports. Set reminders, filter by sport or format, and join the action when breaks go live.
      </p>

      <BreakScheduleClient />

      {/* Related Pages */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/break-room" className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-red-500/50 transition-colors">
          <div className="text-2xl mb-2">🎥</div>
          <h3 className="text-white font-bold text-sm mb-1">Break Room</h3>
          <p className="text-gray-400 text-xs">Join a live break right now</p>
        </Link>
        <Link href="/drops" className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="text-2xl mb-2">🗓️</div>
          <h3 className="text-white font-bold text-sm mb-1">Drop Calendar</h3>
          <p className="text-gray-400 text-xs">Themed pack events and limited releases</p>
        </Link>
        <Link href="/release-tracker" className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
          <div className="text-2xl mb-2">📦</div>
          <h3 className="text-white font-bold text-sm mb-1">Release Tracker</h3>
          <p className="text-gray-400 text-xs">New set releases with countdown timers</p>
        </Link>
      </div>

      {/* FAQ */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map((item, i) => (
          <details key={i} className="group bg-gray-800/30 border border-gray-700/40 rounded-xl">
            <summary className="cursor-pointer px-5 py-4 text-white font-medium text-sm list-none flex items-center justify-between">
              {item.question}
              <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
