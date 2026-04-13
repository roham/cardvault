import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PSA vs BGS vs CGC: Which Grading Company Should You Use in 2026?',
  description: 'Complete comparison of PSA, BGS, and CGC card grading services. Turnaround times, costs, resale premiums, label types, and which grader is right for your cards in 2026.',
  keywords: ['PSA vs BGS', 'PSA vs CGC', 'BGS vs CGC', 'card grading comparison', 'best card grading company 2026', 'PSA grading cost', 'BGS grading cost'],
};

interface GraderInfo {
  name: string;
  fullName: string;
  founded: string;
  totalGraded: string;
  headquarters: string;
  scale: string;
  subgrades: boolean;
  turnaround: string;
  baseCost: string;
  premium: string;
  bestFor: string[];
  weaknesses: string[];
  color: string;
  borderColor: string;
  labelTypes: { name: string; description: string }[];
}

const graders: GraderInfo[] = [
  {
    name: 'PSA',
    fullName: 'Professional Sports Authenticator',
    founded: '1991',
    totalGraded: '60M+ cards',
    headquarters: 'Santa Ana, CA',
    scale: '1-10 (half-point increments available)',
    subgrades: false,
    turnaround: '20-65 business days (standard)',
    baseCost: '$25/card (Value tier, 65 business days)',
    premium: 'Highest resale premiums across all sports. PSA 10 commands 2-5x over BGS 9.5 for most cards.',
    bestFor: [
      'Vintage cards (pre-1980) where PSA dominance is strongest',
      'High-value cards where resale premium matters most',
      'Sports cards in general — PSA is the market standard',
      'Building a graded collection for maximum liquidity',
    ],
    weaknesses: [
      'No subgrades — you get one number with no detail on centering, edges, corners, surface',
      'Longest turnaround times of the big 3',
      'Inconsistent grading (same card can grade differently on resubmission)',
      'Most expensive for bulk submissions',
    ],
    color: 'bg-red-950/40',
    borderColor: 'border-red-800/40',
    labelTypes: [
      { name: 'Standard Red Label', description: 'The default PSA label. Card is authenticated and graded.' },
      { name: 'Gold Label (PSA 10)', description: 'Awarded only to Gem Mint 10 cards. The most valuable designation in the hobby.' },
      { name: 'Green Label', description: 'Indicates a qualified grade — the card has a minor flaw but grades higher otherwise. Denoted with a "Q" mark.' },
    ],
  },
  {
    name: 'BGS',
    fullName: 'Beckett Grading Services',
    founded: '1999',
    totalGraded: '20M+ cards',
    headquarters: 'Dallas, TX',
    scale: '1-10 (half-point increments)',
    subgrades: true,
    turnaround: '10-50 business days (standard)',
    baseCost: '$22/card (Standard, 50 business days)',
    premium: 'BGS 10 Pristine and BGS 10 Black Label can command equal or higher premiums than PSA 10 for modern cards.',
    bestFor: [
      'Modern cards (2000+) where subgrades add transparency',
      'Cards where you want to see centering/corners/edges/surface breakdown',
      'Chasing the BGS 10 Black Label — the rarest and most valuable grade',
      'Pokemon TCG cards (BGS has strong market share)',
    ],
    weaknesses: [
      'Lower resale premium than PSA for most vintage cards',
      'Less market liquidity — fewer collectors trade exclusively in BGS',
      'BGS 9.5 (Gem Mint) often sells for less than PSA 10 despite similar quality',
      'Beckett brand confusion (BGS vs BCCG vs BVG)',
    ],
    color: 'bg-blue-950/40',
    borderColor: 'border-blue-800/40',
    labelTypes: [
      { name: 'Standard BGS Label', description: 'Shows four subgrades: Centering, Corners, Edges, Surface. Overall grade is weighted average.' },
      { name: 'BGS 10 Pristine', description: 'All four subgrades are 10. Extremely rare — commands massive premiums.' },
      { name: 'BGS 10 Black Label', description: 'Perfect 10 on all subgrades with a black label background. The rarest grade in the hobby. Can exceed PSA 10 values.' },
    ],
  },
  {
    name: 'CGC',
    fullName: 'Certified Guaranty Company (Cards division)',
    founded: '2020 (for cards; CGC Comics since 2000)',
    totalGraded: '5M+ cards',
    headquarters: 'Sarasota, FL',
    scale: '1-10 (half-point increments)',
    subgrades: true,
    turnaround: '5-30 business days (fastest of the big 3)',
    baseCost: '$15/card (Economy, 30 business days)',
    premium: 'Lower resale premiums than PSA or BGS for sports. Growing acceptance for Pokemon TCG.',
    bestFor: [
      'Budget grading — lowest cost per card',
      'Fast turnaround — best for time-sensitive submissions',
      'Pokemon TCG cards — CGC has strong and growing market share',
      'Volume submissions where cost matters more than premium',
    ],
    weaknesses: [
      'Lowest resale premiums for sports cards — CGC 10 often sells for 50-70% of PSA 10',
      'Newest entrant — less collector trust and market history',
      'Inner sleeves required for submission (additional cost)',
      'Slab design is polarizing — thicker than PSA or BGS holders',
    ],
    color: 'bg-amber-950/40',
    borderColor: 'border-amber-800/40',
    labelTypes: [
      { name: 'Standard CGC Label', description: 'Shows subgrades for Centering, Corners, Edges, Surface. Clean design.' },
      { name: 'CGC Perfect 10', description: 'All subgrades are 10. CGC awards this grade more frequently than BGS Pristine.' },
      { name: 'CGC Pristine 10', description: 'Even stricter than Perfect 10 — flawless under 5x magnification. Extremely rare.' },
    ],
  },
];

const faqItems = [
  {
    question: 'Which grading company gives the highest resale value?',
    answer: 'PSA consistently commands the highest resale premiums across sports cards. A PSA 10 typically sells for 2-5x more than the equivalent BGS 9.5 or CGC 10 for the same card. The exception is the BGS 10 Black Label, which can match or exceed PSA 10 prices for modern cards.',
  },
  {
    question: 'Is PSA grading worth the extra cost?',
    answer: 'For cards worth $100+ raw, yes. The PSA premium on resale typically exceeds the difference in grading costs. For cards worth under $50 raw, consider CGC for the lower cost — the grading fee can eat into the value of lower-end cards regardless of grader.',
  },
  {
    question: 'Which grading company is best for Pokemon cards?',
    answer: 'PSA remains the market leader for Pokemon, but CGC and BGS both have strong market share. CGC is gaining ground in the Pokemon space due to lower costs and faster turnaround. For high-value vintage Pokemon (Base Set Charizard, etc.), PSA still commands the highest premium.',
  },
  {
    question: 'How long does PSA grading take in 2026?',
    answer: 'PSA turnaround times vary by service level: Value ($25/card) takes 65 business days, Regular ($50/card) takes 30 business days, Express ($100/card) takes 15 business days, and Super Express ($200/card) takes 5 business days. Walk-through service ($600/card) is 1-2 business days.',
  },
  {
    question: 'Can I crack a BGS or CGC slab and resubmit to PSA?',
    answer: 'Yes, this is a common practice called "crossover" or "cracking and resubmitting." Many collectors do this when they believe a BGS 9.5 will cross to a PSA 10 — the price difference can be significant. However, there is risk: the card may grade lower at PSA, and you lose the original grade.',
  },
  {
    question: 'What is a BGS Black Label?',
    answer: 'A BGS Black Label (also called a "Quad 10" or "BGS 10 Black") means all four subgrades — Centering, Corners, Edges, and Surface — received a perfect 10. The label background turns black instead of silver. These are extraordinarily rare and can command higher prices than PSA 10 for the same card.',
  },
];

export default function PsaVsBgsVsCgcPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'PSA vs BGS vs CGC: Which Grading Company Should You Use in 2026?',
        description: metadata.description as string,
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        datePublished: '2026-04-13',
        dateModified: '2026-04-13',
        url: 'https://cardvault-two.vercel.app/guides/psa-vs-bgs-vs-cgc',
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
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://cardvault-two.vercel.app/guides' },
          { '@type': 'ListItem', position: 3, name: 'PSA vs BGS vs CGC' },
        ],
      }} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Guides', href: '/guides' },
        { label: 'PSA vs BGS vs CGC' },
      ]} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          Updated April 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          PSA vs BGS vs CGC: Which Grading Company Should You Use?
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-relaxed">
          The three major card grading companies each have different strengths, pricing, turnaround times, and resale premiums. This guide helps you choose the right grader for your cards based on what matters: cost, speed, or maximum resale value.
        </p>
      </div>

      {/* Quick Comparison Table */}
      <div className="mb-12 overflow-x-auto">
        <h2 className="text-xl font-bold text-white mb-4">Quick Comparison</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-3 text-gray-400 font-medium">Feature</th>
              <th className="text-center py-3 px-3 text-red-400 font-semibold">PSA</th>
              <th className="text-center py-3 px-3 text-blue-400 font-semibold">BGS</th>
              <th className="text-center py-3 px-3 text-amber-400 font-semibold">CGC</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {[
              ['Founded', '1991', '1999', '2020'],
              ['Total Cards Graded', '60M+', '20M+', '5M+'],
              ['Base Cost', '$25/card', '$22/card', '$15/card'],
              ['Fastest Turnaround', '5 biz days ($200)', '5 biz days ($250)', '3 biz days ($150)'],
              ['Standard Turnaround', '65 biz days', '50 biz days', '30 biz days'],
              ['Subgrades', 'No', 'Yes (4)', 'Yes (4)'],
              ['Grading Scale', '1-10', '1-10', '1-10'],
              ['Resale Premium', 'Highest', 'Medium', 'Lowest'],
              ['Best For', 'Sports cards', 'Modern + Pokemon', 'Budget + Pokemon'],
            ].map(([feature, psa, bgs, cgc]) => (
              <tr key={feature} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                <td className="py-2.5 px-3 text-gray-400 font-medium">{feature}</td>
                <td className="py-2.5 px-3 text-center">{psa}</td>
                <td className="py-2.5 px-3 text-center">{bgs}</td>
                <td className="py-2.5 px-3 text-center">{cgc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Grader Sections */}
      {graders.map(grader => (
        <section key={grader.name} className={`mb-10 rounded-2xl border ${grader.borderColor} ${grader.color} p-6 sm:p-8`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{grader.name}</h2>
              <p className="text-gray-400 text-sm">{grader.fullName} &middot; Founded {grader.founded} &middot; {grader.totalGraded}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900/40 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Base Cost</p>
              <p className="text-white font-semibold">{grader.baseCost}</p>
            </div>
            <div className="bg-gray-900/40 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Standard Turnaround</p>
              <p className="text-white font-semibold">{grader.turnaround}</p>
            </div>
            <div className="bg-gray-900/40 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Subgrades</p>
              <p className="text-white font-semibold">{grader.subgrades ? 'Yes — Centering, Corners, Edges, Surface' : 'No — single overall grade'}</p>
            </div>
            <div className="bg-gray-900/40 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Scale</p>
              <p className="text-white font-semibold">{grader.scale}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-300 text-sm leading-relaxed mb-2"><strong className="text-white">Resale Premium:</strong> {grader.premium}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Best For</h3>
              <ul className="space-y-1.5">
                {grader.bestFor.map(item => (
                  <li key={item} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-emerald-400 shrink-0">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Weaknesses</h3>
              <ul className="space-y-1.5">
                {grader.weaknesses.map(item => (
                  <li key={item} className="text-gray-300 text-sm flex gap-2">
                    <span className="text-red-400 shrink-0">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-white font-semibold text-sm mb-2">Label Types</h3>
            <div className="space-y-2">
              {grader.labelTypes.map(label => (
                <div key={label.name} className="bg-gray-900/40 rounded-lg p-3">
                  <p className="text-white text-sm font-medium">{label.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{label.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Decision Framework */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Which Grader Should You Use? Decision Framework</h2>
        <div className="space-y-4">
          {[
            {
              scenario: 'Your card is worth $500+ raw and you want maximum resale value',
              recommendation: 'PSA',
              reason: 'The PSA premium on high-value cards more than justifies the cost and wait time. PSA 10 commands the highest prices at auction.',
              color: 'border-red-800/40 bg-red-950/20',
            },
            {
              scenario: 'You want to see exactly why your card received its grade',
              recommendation: 'BGS or CGC',
              reason: 'Both provide subgrades for Centering, Corners, Edges, and Surface. This transparency is valuable for understanding card condition and making crossover decisions.',
              color: 'border-blue-800/40 bg-blue-950/20',
            },
            {
              scenario: 'You are grading 50+ cards and cost matters',
              recommendation: 'CGC',
              reason: 'At $15/card for economy service, CGC is the most cost-effective for volume submissions. Best for cards worth $10-$100 raw where the grading fee needs to stay low.',
              color: 'border-amber-800/40 bg-amber-950/20',
            },
            {
              scenario: 'You are grading Pokemon TCG cards',
              recommendation: 'PSA or CGC',
              reason: 'PSA still commands the highest premium for Pokemon, but CGC is gaining market share rapidly and offers lower costs. BGS is the third choice for Pokemon.',
              color: 'border-purple-800/40 bg-purple-950/20',
            },
            {
              scenario: 'You need cards back quickly (selling at a show, time-sensitive)',
              recommendation: 'CGC',
              reason: 'CGC offers the fastest standard turnaround times. Their economy service (30 business days) beats PSA Value (65 days) significantly.',
              color: 'border-amber-800/40 bg-amber-950/20',
            },
            {
              scenario: 'You are chasing the absolute highest possible grade label',
              recommendation: 'BGS',
              reason: 'The BGS 10 Black Label is the most prestigious grade in the hobby. It requires all four subgrades at 10 and is rarer than a PSA 10. For the right card, a Black Label commands the highest price.',
              color: 'border-blue-800/40 bg-blue-950/20',
            },
          ].map(item => (
            <div key={item.scenario} className={`rounded-xl border ${item.color} p-5`}>
              <p className="text-white font-semibold text-sm mb-1">{item.scenario}</p>
              <p className="text-emerald-400 text-sm font-medium mb-1">Recommendation: {item.recommendation}</p>
              <p className="text-gray-400 text-sm">{item.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map(item => (
            <div key={item.question} className="border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Guides */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Related Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: '/guides/when-to-grade-your-cards', title: 'When to Grade (And When Not To)', desc: 'Calculate if grading your card makes financial sense' },
            { href: '/guides/grading-guide', title: 'PSA Grading Scale Explained', desc: 'What each PSA grade means and what to expect' },
            { href: '/guides/how-to-read-price-data', title: 'How to Read Card Price Data', desc: 'eBay sold comps vs book value vs market price' },
            { href: '/guides/fake-cards', title: 'How to Spot Fake Cards', desc: 'Fake slabs, trimmed cards, and authentication tips' },
            { href: '/tools', title: 'Card Price Checker', desc: 'Look up any card and see estimated values by grade' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="group block border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-colors">
              <p className="text-white font-semibold text-sm group-hover:text-emerald-400 transition-colors">{link.title}</p>
              <p className="text-gray-500 text-xs mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Nav */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-800">
        <Link href="/guides" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          <span>&#8592;</span> All Guides
        </Link>
        <Link href="/guides/grading-guide" className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
          PSA Grading Scale <span>&#8594;</span>
        </Link>
      </div>
    </div>
  );
}
