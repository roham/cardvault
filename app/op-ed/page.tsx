import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import OpEdClient from './OpEdClient';

export const metadata: Metadata = {
  title: 'The CardVault Op-Ed — Daily Hobby Opinion Column | CardVault',
  description: 'Daily opinion column covering the card hobby. Five rotating columnists — each with a distinct stance — weigh in on the topic of the day. New column every 24 hours, shareable takes, comment signal panel.',
  openGraph: {
    title: 'The CardVault Op-Ed — CardVault',
    description: 'Daily hobby opinion column. Five voices, one topic, a new piece every 24 hours.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The CardVault Op-Ed — CardVault',
    description: 'Daily hobby opinion column. Who\'s right today?',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Op-Ed' },
];

const faqItems = [
  {
    question: 'Are the columnists real people?',
    answer: 'No. The CardVault Op-Ed is a fictional editorial page modeled on a real-world newspaper opinion section. Five archetype columnists represent distinct perspectives in the hobby — the vintage purist, the modern speculator, the analytics head, the dealer-side realist, and the TikTok breaker — so that any topic gets argued from five real points of view collectors actually hold. Their takes are not sourced to any specific person. The positions are hobby-authentic because they reflect real Reddit/Twitter/podcast debates, but the bylines are personas.',
  },
  {
    question: 'How often does a new column publish?',
    answer: 'One per day. The topic + columnist rotation is deterministic from the calendar date, so every visitor on the same day reads the same column. Yesterday\'s column is available in the 7-day archive. Different columnists cover different topics on different days — over a week you will see multiple voices on multiple subjects.',
  },
  {
    question: 'Why have five columnists instead of one editorial voice?',
    answer: 'Because the hobby has five real perspectives and pretending there is a single "correct take" is how magazine columns get stale. A vintage purist and a TikTok breaker disagree on fundamentals. Both can be right for their segment. Rotating the byline means readers see the argument from whichever angle fits today — and over a week, they see the full spectrum, which is closer to the truth than any one columnist would deliver.',
  },
  {
    question: 'Can I comment?',
    answer: 'The comment signal panel at the bottom shows 8 NPC responses per column — some agreeing, some disagreeing, some piling on — seeded from the column\'s stance so it feels like a real newspaper comment section. You cannot post directly yet (no account system), but you can click "Agree" or "Disagree" to log your vote locally. Agreement rates are shown on the comment panel. Planned: real comments once accounts ship.',
  },
  {
    question: 'Is the Op-Ed SEO bait?',
    answer: 'No. It is designed as genuine opinion journalism for collectors. The columns take a position, defend it with an argument, and close with a recommendation — the same structure the New York Times and Wall Street Journal op-ed pages use. Google\'s Helpful Content update rewards depth-over-breadth content; op-eds rank because they provide the unique perspective AI summarization cannot replicate. Any SEO benefit is a consequence of the format, not the purpose.',
  },
  {
    question: 'Can I submit a column idea?',
    answer: 'Yes. Email op-ed@cardvault.example (placeholder) with a topic and a 150-word pitch. The editorial board reviews pitches weekly. First-time contributors should expect a response within 10 days. Paid columns not currently offered.',
  },
];

export default function OpEdPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-6 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
          THE CARDVAULT · OPINION
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          The Op-Ed
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
          Five columnists. One topic per day. The full spectrum of hobby opinion — from vintage purist to TikTok breaker — rotating every 24 hours.
        </p>
      </header>

      <OpEdClient />

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">The Columnists</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              n: 'Margaret Hollingsworth',
              b: 'Vintage Purist',
              d: 'Covering the hobby since 1989. Believes 1957–1989 is the holy era. Skeptical of graded moderns and allergic to parallels.',
              c: 'rose',
            },
            {
              n: 'Marcus "Marc" Abeyta',
              b: 'Modern Speculator',
              d: 'Ex-finance turned card flipper. Thinks every rookie auto is an option contract. Bullish on Bowman Chrome prospect autos.',
              c: 'emerald',
            },
            {
              n: 'Dr. Priya Subramanian',
              b: 'The Analyst',
              d: 'Data-first. Refuses to write about anything without citing pop reports, VCP, and sold comps. Neutral on everything but bad methodology.',
              c: 'cyan',
            },
            {
              n: 'Tony "T-Bone" Caravella',
              b: 'Dealer Realist',
              d: '35 years at the LCS. Knows what actually sells on a Saturday. Has seen every trend cycle twice. Hates influencers.',
              c: 'amber',
            },
            {
              n: 'Jess "BrrrBreaks" Lin',
              b: 'Breaker · TikTok Native',
              d: '250k followers. Rips live 4 nights a week. Believes the future of the hobby is audience, not investment. Writes how she talks.',
              c: 'fuchsia',
            },
          ].map((p) => (
            <div
              key={p.n}
              className={`rounded-lg border p-3 ${
                p.c === 'rose'
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : p.c === 'emerald'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : p.c === 'cyan'
                      ? 'border-cyan-500/30 bg-cyan-500/5'
                      : p.c === 'amber'
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-fuchsia-500/30 bg-fuchsia-500/5'
              }`}
            >
              <div className="text-sm font-semibold">{p.n}</div>
              <div className="text-[11px] uppercase tracking-wide opacity-80">{p.b}</div>
              <p className="mt-1 text-xs text-slate-400">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="mb-3 text-lg font-semibold">Frequently asked</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <div key={item.question}>
              <h3 className="text-sm font-semibold text-slate-200">{item.question}</h3>
              <p className="mt-1 text-sm text-slate-400">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">More from CardVault Media</h2>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: '/news', label: 'News Feed' },
            { href: '/breaking-news', label: 'Breaking News' },
            { href: '/card-wire', label: 'Card Wire' },
            { href: '/podcasts', label: 'Hobby Podcasts' },
            { href: '/hobby-radio', label: 'Hobby Radio' },
            { href: '/newsletter', label: 'Newsletter' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 hover:border-amber-500/40 hover:text-amber-300"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'OpinionNewsArticle',
          headline: 'The CardVault Op-Ed',
          url: 'https://cardvault-two.vercel.app/op-ed',
          publisher: {
            '@type': 'Organization',
            name: 'CardVault',
          },
          description: 'Daily hobby opinion column with five rotating columnists.',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
          })),
        }}
      />
    </main>
  );
}
