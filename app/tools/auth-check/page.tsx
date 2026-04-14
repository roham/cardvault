import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AuthCheck from './AuthCheck';

export const metadata: Metadata = {
  title: 'Card Authentication Checker — How to Spot Fake Sports Cards',
  description: 'Free card authentication checker. 12-point inspection for sports cards and Pokemon: print quality, card stock, holograms, serial numbers, and more. Spot fakes before you buy.',
  openGraph: {
    title: 'Card Authentication Checker — Spot Fake Cards | CardVault',
    description: 'Interactive 12-point authentication checklist. Check print quality, card stock, holograms, and more. Get an instant authenticity verdict.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Authentication Checker — CardVault',
    description: 'Is your card real or fake? 12-point authentication checker with instant verdict.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Authentication Checker' },
];

const faqItems = [
  {
    question: 'How can I tell if a sports card is fake?',
    answer: 'Check 5 key areas: (1) Print quality under magnification — fakes show blurry text and inconsistent dot patterns, (2) Card stock thickness and feel compared to known authentic cards, (3) Hologram or security features — missing or poor holograms are the strongest fake indicator, (4) Back design accuracy — fakers often neglect the back, (5) Price and seller reputation — if the deal is too good to be true, it probably is. Use our 12-point authentication checker for a systematic evaluation.',
  },
  {
    question: 'What tools do I need to authenticate cards?',
    answer: 'Essential: a 10x jeweler\'s loupe ($5-15), an LED flashlight ($5-10), and a known authentic card for comparison. Optional but helpful: UV blacklight to detect paper whiteners, a digital scale to verify card weight, and a phone macro lens to photograph details. Total investment under $30 covers the essentials.',
  },
  {
    question: 'Which cards are most commonly faked?',
    answer: 'The most counterfeited cards are high-value icons: 1952 Topps Mantle, 1986 Fleer Jordan, 1st Edition Base Set Charizard, 2003 Topps Chrome LeBron, Prizm Luka Doncic, and pre-war cards like T206 Wagner and Babe Ruth. Modern parallels (Prizm Silver, Optic Holo) are increasingly faked by altering base cards. Always authenticate cards over $500.',
  },
  {
    question: 'Should I get my card professionally authenticated?',
    answer: 'Yes, for any card worth over $200-500. Professional authentication from PSA, BGS, CGC, or SGC costs $15-50 and provides a tamper-evident case plus a serial number verifiable in their database. This is the gold standard — no visual inspection by a collector can match professional authentication. It also adds 10-30% resale value.',
  },
  {
    question: 'Can fake cards get past grading companies?',
    answer: 'Rarely, but it has happened. PSA and BGS have sophisticated authentication processes including blacklight, weight testing, and expert examination. However, very high-quality fakes (especially trimmed cards and altered parallel cards) have occasionally slipped through. If you suspect a graded card is fake, contact the grading company — they will examine it and, if confirmed fake, remove it from their registry.',
  },
];

export default function AuthCheckPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Authentication Checker',
        description: 'Interactive 12-point card authentication checklist. Spot fake sports cards and Pokemon cards before you buy.',
        url: 'https://cardvault-two.vercel.app/tools/auth-check',
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
          12-Point Inspection - Instant Verdict - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Authentication Checker
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Is your card real or fake? Run through our 12-point authentication checklist
          and get an instant confidence verdict. Use at card shows, before buying online,
          or whenever something feels off.
        </p>
      </div>

      <AuthCheck />

      {/* FAQ */}
      <section className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <summary className="p-5 cursor-pointer text-white font-medium flex items-center justify-between">
                {item.question}
                <span className="text-zinc-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>This tool provides guidance only. For definitive authentication, submit cards to PSA, BGS, CGC, or SGC.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-emerald-500 hover:text-emerald-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/tools/condition-grader" className="text-emerald-500 hover:text-emerald-400">Condition Grader</Link>
          {' '}&middot;{' '}
          <Link href="/tools/submission-planner" className="text-emerald-500 hover:text-emerald-400">Submission Planner</Link>
          {' '}&middot;{' '}
          <Link href="/guides/fake-cards" className="text-emerald-500 hover:text-emerald-400">Full Fake Cards Guide</Link>
        </p>
      </div>
    </div>
  );
}
