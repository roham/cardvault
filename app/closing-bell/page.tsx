import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ClosingBellClient from './ClosingBellClient';

export const metadata: Metadata = {
  title: 'The Closing Bell — Daily Card Market Wrap-Up Show | CardVault',
  description: 'The end-of-session companion to The Opening Bell. Five evening segments every day: Final Tape, Top 3 Winners, Top 3 Losers, After-Hours, and the Overnight Setup. New episode at close. Free.',
  openGraph: {
    title: 'The Closing Bell — Daily Card Market Wrap-Up Show | CardVault',
    description: 'End-of-session market recap for sports cards. Five segments, one new episode every evening, 9,800+ cards in rotation.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The Closing Bell — CardVault',
    description: 'Daily wrap-up show for card collectors. New episode every session close.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Closing Bell' },
];

const faqItems = [
  {
    question: 'What is The Closing Bell?',
    answer: 'The Closing Bell is the end-of-session companion to The Opening Bell. Every day after the virtual market close, a new five-segment recap drops, scripted deterministically from our 9,800+ card database. Segments are: Final Tape (the close print and day stats), Top 3 Winners (the three biggest gainers of the session), Top 3 Losers (the three biggest decliners), After-Hours (a late-breaking story on one card), and Overnight Setup (tomorrow\'s preview). Each episode is the same for every collector on the same calendar day, so the hobby has a shared wrap-up ritual.',
  },
  {
    question: 'How is this different from The Opening Bell?',
    answer: 'The Opening Bell airs at the session open with a single gainer, single loser, one to watch, and market-mood monologue — it is a morning show. The Closing Bell airs at session close with three winners and three losers, an after-hours story, and an overnight setup preview — it is a wrap-up show. Opening is about one card per segment and the morning tone; closing is about ranked leader-and-laggard tables and the post-close mood. Watch both and you get the full trading day.',
  },
  {
    question: 'Is this real market data?',
    answer: 'No. The Closing Bell is a simulation. Each episode is scripted deterministically from our card database so everyone sees the same recap on the same calendar day. The gain/loss percentages, close index, and after-hours commentary are illustrative — they are meant to teach end-of-day market reasoning and give the hobby an evening cadence, not to price individual cards. For real price research use the Price Guide, Comp Calculator, or individual Card Pages.',
  },
  {
    question: 'What is the CVX Close?',
    answer: 'A simulated end-of-session composite value for card market health, normalized to a base of 1,000. The close number is derived from the same seed used by The Opening Bell, then shifted by the post-open tape (advancers vs decliners). Green above 1,000 is a bullish close; red below 1,000 is a bearish close. The spread between CVX Open and CVX Close tells you whether the session trended up or down from the morning print.',
  },
  {
    question: 'Can I watch past episodes?',
    answer: 'Yes. The navigator jumps back through the last 7 sessions. Each date renders the exact wrap-up that aired on that evening — the Top 3 Winners, Top 3 Losers, after-hours story, and overnight setup all regenerate from the same seed used on that date. You can replay last Friday\'s close or catch up on yesterday\'s wrap if you missed it.',
  },
  {
    question: 'Why "After-Hours"?',
    answer: 'Because real markets have an after-hours session where late news moves prices before the next open. The After-Hours segment is where we surface the one story that broke AFTER the regular tape — a grading reveal leak, a trade rumor hitting late, a rookie-variant pop caught on a group-chat screenshot. Cheap dopamine for the evening scroll and a natural bridge from today\'s close to tomorrow\'s open.',
  },
];

export default function ClosingBellPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'The Closing Bell',
        description: 'Daily scripted wrap-up market show for sports card collectors. Five segments, one new episode per session close.',
        url: 'https://cardvault-two.vercel.app/closing-bell',
        applicationCategory: 'Entertainment',
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
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-mono font-medium px-3 py-1.5 rounded-full mb-4 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          After-Hours &middot; Daily Market Wrap &middot; New Episode Each Close
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight">The Closing Bell</h1>
        <p className="text-gray-400 text-lg">
          The end-of-session companion to The Opening Bell. Five wrap-up segments. One new episode at every close. Same recap
          for every collector tonight — so you can compare today&apos;s podium on tomorrow&apos;s group chat.
        </p>
      </div>

      <ClosingBellClient />

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(f => (
            <details key={f.question} className="group bg-gray-900 border border-gray-800 rounded-xl">
              <summary className="px-5 py-4 text-white font-medium cursor-pointer hover:text-indigo-400 transition-colors">
                {f.question}
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm">
                {f.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Live Market Experiences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/opening-bell" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🔔</span>
            <div><div className="text-white text-sm font-medium">Opening Bell</div><div className="text-gray-500 text-xs">Morning market show — five segments</div></div>
          </Link>
          <Link href="/market-roundtable" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🎙️</span>
            <div><div className="text-white text-sm font-medium">Market Roundtable</div><div className="text-gray-500 text-xs">Five AI analysts debate hot topics</div></div>
          </Link>
          <Link href="/market-reactions" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">⚡</span>
            <div><div className="text-white text-sm font-medium">Market Reactions</div><div className="text-gray-500 text-xs">Live event impact simulator</div></div>
          </Link>
          <Link href="/live-ticker" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">📈</span>
            <div><div className="text-white text-sm font-medium">Live Ticker</div><div className="text-gray-500 text-xs">Scrolling price ticker</div></div>
          </Link>
          <Link href="/market-movers" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">🚀</span>
            <div><div className="text-white text-sm font-medium">Market Movers</div><div className="text-gray-500 text-xs">Today&apos;s biggest price changes</div></div>
          </Link>
          <Link href="/market-report" className="flex items-center gap-3 px-4 py-3 bg-gray-900/60 border border-gray-800 hover:border-indigo-700/50 rounded-xl transition-colors">
            <span className="text-xl">📰</span>
            <div><div className="text-white text-sm font-medium">Market Report</div><div className="text-gray-500 text-xs">Weekly analysis digest</div></div>
          </Link>
        </div>
      </section>
    </div>
  );
}
