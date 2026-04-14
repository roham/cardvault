import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ConditionGrader from './ConditionGrader';

export const metadata: Metadata = {
  title: 'Card Condition Self-Grader — Estimate PSA, BGS & CGC Grades Free',
  description: 'Free card condition assessment tool. Walk through corners, edges, surface, and centering to estimate your PSA, BGS, or CGC grade before submitting. Works for sports cards and Pokemon.',
  openGraph: {
    title: 'Card Condition Self-Grader — CardVault',
    description: 'Assess your card condition step-by-step and get estimated PSA, BGS, and CGC grades. Free self-grading tool.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Condition Self-Grader — CardVault',
    description: 'What grade will your card get? Assess corners, edges, surface & centering to find out.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Condition Self-Grader' },
];

const faqItems = [
  {
    question: 'How accurate is this card condition grader?',
    answer: 'This tool provides an estimate based on the four main grading criteria used by PSA, BGS, and CGC: corners, edges, surface, and centering. While professional grading involves trained experts examining cards under magnification, our self-grader helps you get a ballpark estimate before investing in professional grading. Most users find results within 0.5-1 grade points of their actual grade.',
  },
  {
    question: 'What do PSA graders look for when grading a card?',
    answer: 'PSA graders evaluate four main areas: Corners (sharpness, whitening, fraying), Edges (chipping, roughness, whitening along the cut), Surface (scratches, print defects, staining, creases, wax residue), and Centering (left-right and top-bottom border alignment). The overall grade is most limited by the weakest area — a card with perfect corners but a crease on the surface will grade low.',
  },
  {
    question: 'Should I grade my card based on these results?',
    answer: 'Use these results as a screening tool. Generally, grade modern cards only if this tool estimates PSA 8 or higher AND the card is worth $30+ raw. For vintage cards (pre-1980), grading provides authentication value even at lower grades, so consider grading any vintage card worth $100+ raw. Always factor in grading costs ($20-$150 per card depending on service level).',
  },
  {
    question: 'What is the difference between PSA, BGS, and CGC grading?',
    answer: 'PSA uses a single overall grade (1-10) and is the most popular for sports cards. BGS gives sub-grades for corners, edges, surface, and centering — a BGS 9.5 with all sub-grades 9.5+ earns a "Pristine" label worth more than a standard 9.5. CGC is newer to sports cards (originally comic books) and uses a similar 1-10 scale. PSA 10 typically commands the highest premium, followed by BGS 10 (Black Label) and BGS 9.5.',
  },
  {
    question: 'Does card condition matter more for modern or vintage cards?',
    answer: 'Condition matters enormously for modern cards — a PSA 10 of a popular rookie can be worth 3-10x a PSA 9. For vintage cards (pre-1980), the market is more forgiving since pristine examples are extremely rare. A PSA 7 of a 1952 Topps Mantle is still a five-figure card. In general, the newer the card, the more condition-sensitive the market is.',
  },
];

export default function ConditionGraderPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Condition Self-Grader',
        description: 'Free card condition assessment tool. Evaluate corners, edges, surface, and centering to estimate PSA, BGS, and CGC grades.',
        url: 'https://cardvault-two.vercel.app/tools/condition-grader',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          PSA / BGS / CGC Estimates - Step-by-Step - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Condition Self-Grader
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Walk through each grading criterion — corners, edges, surface, and centering — and get
          estimated PSA, BGS, and CGC grades instantly. Know before you submit.
        </p>
      </div>

      <ConditionGrader />

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

      {/* Related Tools */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Grading ROI Calculator', href: '/tools/grading-roi', desc: 'Is grading your card worth the cost?' },
            { title: 'Centering Calculator', href: '/tools/centering-calc', desc: 'Measure centering against PSA/BGS/CGC standards' },
            { title: 'Grading Tracker', href: '/tools/grading-tracker', desc: 'Track your grading submissions and results' },
            { title: 'Flip Profit Calculator', href: '/tools/flip-calc', desc: 'Calculate your margins after fees and grading' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-violet-700/50 transition-colors">
              <h3 className="text-white font-medium text-sm mb-1">{tool.title}</h3>
              <p className="text-zinc-500 text-xs">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center text-zinc-600 text-xs mt-8">
        <p>Grade estimates are based on published grading company standards. Actual grades may vary based on the individual grader&apos;s assessment.</p>
        <p className="mt-1">
          <Link href="/tools" className="text-violet-500 hover:text-violet-400">All Tools</Link>
          {' '}&middot;{' '}
          <Link href="/guides/psa-grading-scale" className="text-violet-500 hover:text-violet-400">PSA Grading Guide</Link>
          {' '}&middot;{' '}
          <Link href="/guides/psa-vs-bgs-vs-cgc" className="text-violet-500 hover:text-violet-400">PSA vs BGS vs CGC</Link>
        </p>
      </div>
    </div>
  );
}
