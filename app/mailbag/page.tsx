import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MailbagClient from './MailbagClient';

export const metadata: Metadata = {
  title: 'The CardVault Mailbag — Ask Auntie Mint | CardVault',
  description: 'Weekly advice column for card collectors. 12 reader questions answered by Auntie Mint — a 35-year collector with no-nonsense, practical takes on selling, grading, family disputes, investing, storage, and ethical dilemmas.',
  openGraph: {
    title: 'The CardVault Mailbag — CardVault',
    description: 'Weekly Q&A advice column. Real collector questions, straight-talk answers from Auntie Mint.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'The CardVault Mailbag — CardVault',
    description: 'Weekly Q&A advice column for card collectors.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Mailbag' },
];

const faqItems = [
  {
    question: 'Who is Auntie Mint?',
    answer: 'Auntie Mint is a fictional 35-year card collector persona created to voice the Mailbag advice column. She is not a real person. The character represents the veteran-collector archetype — the aunt at the family reunion who taught three cousins how to rip a pack, who keeps a binder at the kitchen table, and who has watched three full boom-and-bust cycles from 1989 onward. Her voice is warm, direct, practical, and allergic to hype. She references real card data and real market mechanics, but her takes are persona-voiced, not financial advice.',
  },
  {
    question: 'How often is the Mailbag updated?',
    answer: 'A new 12-question mailbag publishes every Monday morning and stays live for seven days. The question-to-answer pairings are deterministic from the ISO week number — every visitor in the same week reads the same mailbag, and a 4-week archive lets you read past weeks. Rotation draws from a pool of 60+ questions spanning six categories (selling, grading, family disputes, investing, storage, ethics) so the column cycles through different collector pain points across months.',
  },
  {
    question: 'Are these real reader letters?',
    answer: 'No. The handles, locations, and questions are fictional but they are composed from real patterns in how collectors ask for help — scraped from the kind of questions that appear weekly on r/sportscards, r/pokemoncards, r/baseballcards, card-collecting Facebook groups, and Discord #help channels. The question mix is designed to feel representative of what actual collectors ask, not to invent hypothetical problems no one has. The answers are Auntie Mint\'s takes on those real patterns.',
  },
  {
    question: 'Why an advice column instead of a news column?',
    answer: 'Because the hobby already has news. The Mailbag fills a gap: there is no single place where a confused collector can get a direct, practical answer to "should I sell my grandma\'s 1989 Griffey rookie or keep it?" or "my partner says my collection is a problem, now what?" The questions that get asked most are not about market trends. They are about specific personal decisions. An advice column is the format built for that.',
  },
  {
    question: 'Does Auntie Mint give financial or legal advice?',
    answer: 'No. Her answers are opinions from a collector-experience perspective. They are not financial, legal, tax, or estate-planning advice. For real sums, real disputes, or real estate questions, talk to a CPA, lawyer, or insurance adjuster — her answer will often say exactly that. The Mailbag is a thinking-partner, not a substitute for a licensed professional.',
  },
  {
    question: 'Can I submit a question?',
    answer: 'Yes — mailbag@cardvault.example (placeholder). Include a handle you want printed, your city/state, your category (selling, grading, family, investing, storage, ethics), and the question in under 150 words. Auntie Mint picks 12 letters per week. Selected questions are edited lightly for length and clarity; your handle and location are published, no personal details are shared.',
  },
];

export default function MailbagPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <header className="mt-4 mb-6 border-b border-amber-900/40 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
          THE CARDVAULT · MAILBAG
        </div>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Dear Auntie Mint
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
          Twelve reader questions. One plainspoken veteran. A new mailbag every Monday — selling, grading, family fights, investing, storage, and the stuff nobody else will answer straight.
        </p>
      </header>

      <MailbagClient />

      <section className="mt-10 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-5">
        <h2 className="mb-3 text-lg font-semibold">About Auntie Mint</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-amber-500/60 bg-amber-500/15 text-3xl">
            👵
          </div>
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-amber-200">Aunt Millicent &quot;Mint&quot; Harlan · 35-year collector</p>
            <p className="mt-1 text-slate-400">
              Mint started ripping wax in Toledo, Ohio in 1989, survived the junk wax crash, raised a daughter on Kenner Starting Lineup figures, ran a booth at three Midwest shows a year from 1994 to 2018, and still keeps a binder of her late husband&apos;s 1970 Topps set on the kitchen table. She does not own a Discord account, does not flip for a living, and will tell you — politely — if your question contains a bad idea.
            </p>
            <p className="mt-2 text-slate-400">
              Voice: direct, warm, allergic to hype, respects the money but respects the people behind it more. Favorite line: &quot;Before you grade it, ask yourself who you&apos;re trying to impress.&quot;
            </p>
          </div>
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
            { href: '/op-ed', label: 'The Op-Ed' },
            { href: '/news', label: 'News Feed' },
            { href: '/hobby-radio', label: 'Hobby Radio' },
            { href: '/card-wire', label: 'Card Wire' },
            { href: '/newsletter', label: 'Newsletter' },
            { href: '/podcasts', label: 'Hobby Podcasts' },
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
          '@type': 'WebApplication',
          name: 'The CardVault Mailbag',
          applicationCategory: 'LifestyleApplication',
          url: 'https://cardvault-two.vercel.app/mailbag',
          description: 'Weekly advice column for card collectors. 12 reader questions answered by Auntie Mint.',
          publisher: { '@type': 'Organization', name: 'CardVault' },
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
