import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MarketPsychologyClient from './MarketPsychologyClient';

export const metadata: Metadata = {
  title: 'Card Market Psychology — 12 Collector Biases That Cost You Money | CardVault',
  description: 'Understand the 12 cognitive biases that affect card collectors. FOMO, anchoring, sunk cost fallacy, herd mentality, and more. Interactive self-assessment quiz with real hobby examples and tips to overcome each bias.',
  keywords: ['card collecting psychology', 'sports card FOMO', 'card market biases', 'collector mistakes', 'card investment psychology', 'cognitive biases collecting'],
  openGraph: {
    title: 'Card Market Psychology — 12 Biases That Cost Collectors Money',
    description: 'FOMO, anchoring, sunk cost, herd mentality — the hidden biases costing you money. Take the self-assessment quiz.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Card Market Psychology — CardVault',
    description: '12 cognitive biases every card collector should know. Interactive self-assessment included.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Card Market Psychology' },
];

const faqItems = [
  {
    question: 'What are cognitive biases in card collecting?',
    answer: 'Cognitive biases are systematic errors in thinking that affect how collectors make buying, selling, and valuation decisions. Common examples include FOMO (buying impulsively when prices spike), anchoring (over-relying on the first price you see), the endowment effect (overvaluing cards you own), and loss aversion (holding declining cards too long). These biases are universal — even experienced collectors fall victim to them, especially during market volatility.',
  },
  {
    question: 'How does FOMO affect card prices?',
    answer: 'FOMO (Fear of Missing Out) creates short-term price spikes that often exceed sustainable levels. When a player has a big game or gets drafted high, collectors rush to buy, pushing prices up 50-200% in hours. Within 1-2 weeks, prices typically correct back 30-60% as hype fades and supply meets demand. FOMO buyers who purchased at the peak are left holding overvalued cards. The 24-hour rule — waiting a full day before any purchase over $50 — is the simplest defense.',
  },
  {
    question: 'How do I know if I am an emotional collector?',
    answer: 'Signs of emotional collecting include: buying cards right after seeing social media hype, refusing to sell cards at a loss even when the player is declining, spending more after losses hoping to "make it back," overvaluing your own collection versus market comps, and following the crowd into hot players without independent analysis. Take the self-assessment quiz above to identify which specific biases affect you most.',
  },
  {
    question: 'Can understanding psychology actually improve my card collecting results?',
    answer: 'Yes. Research in behavioral finance shows that investors who understand cognitive biases outperform those who do not by 1-4% annually. In the card hobby — where emotions run even higher than in traditional investing — the impact is likely greater. Simply being aware that you are susceptible to a bias makes you less likely to act on it. Combining awareness with practical rules (24-hour cooling period, position size limits, eBay comp checks) can significantly improve your buying and selling decisions.',
  },
  {
    question: 'What is the most damaging bias for card collectors?',
    answer: 'Loss aversion and FOMO are typically the most costly. Loss aversion causes collectors to hold declining cards far too long, watching $400 investments become $80 while hoping for recovery. FOMO causes panic buying at market peaks, often 50-100% above where prices settle. Together, these biases create the classic losing pattern: buy high on hype, refuse to sell low on hope. The endowment effect compounds both — making you overvalue what you own and ignore market signals.',
  },
];

export default function MarketPsychologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Card Market Psychology: 12 Cognitive Biases That Cost Collectors Money',
        description: 'Understanding the cognitive biases that affect card collectors — FOMO, anchoring, sunk cost fallacy, herd mentality, and 8 more. Interactive self-assessment quiz.',
        url: 'https://cardvault-two.vercel.app/market-psychology',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault' },
        datePublished: '2025-04-16',
        dateModified: '2025-04-16',
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

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-800/50 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
          Market Psychology &middot; 12 Biases &middot; Self-Assessment Quiz
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Market Psychology</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The 12 cognitive biases that silently cost card collectors money. Understand them,
          identify which ones affect you, and learn practical strategies to make better decisions.
        </p>
      </div>

      <MarketPsychologyClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-purple-400 transition-colors list-none flex items-center gap-2">
                <span className="text-purple-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/guides" className="text-purple-400 hover:underline">CardVault Guides</Link> collection.
          See also: <Link href="/collecting-mistakes" className="text-purple-400 hover:underline">20 Collecting Mistakes</Link>,{' '}
          <Link href="/golden-rules" className="text-purple-400 hover:underline">25 Golden Rules</Link>,{' '}
          <Link href="/card-flipping-guide" className="text-purple-400 hover:underline">Flipping Guide</Link>,{' '}
          <Link href="/card-show-guide" className="text-purple-400 hover:underline">Card Show Guide</Link>,{' '}
          <Link href="/collecting-roadmap" className="text-purple-400 hover:underline">Collecting Roadmap</Link>.
        </p>
      </div>
    </div>
  );
}
