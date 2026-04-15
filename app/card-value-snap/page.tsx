import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ValueSnapClient from './ValueSnapClient';

export const metadata: Metadata = {
  title: 'Card Value Snap — Which Card Is Worth More? | CardVault',
  description: 'Two cards appear — tap the one worth more. 20 rounds of rapid-fire card value comparisons. Train your pricing instincts. Daily challenge with shareable results.',
  openGraph: {
    title: 'Card Value Snap — CardVault',
    description: 'Which card is worth more? 20 rounds of rapid-fire value comparisons.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Value Snap — CardVault',
    description: '20 rounds. Two cards. Pick the more valuable one.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Games', href: '/games' },
  { label: 'Value Snap' },
];

const faqItems = [
  { question: 'How does Card Value Snap work?', answer: 'Each round shows two real sports cards side by side. Tap the card you think is worth more in gem mint condition. You have 8 seconds per round and 20 rounds total. Faster correct answers earn more points.' },
  { question: 'Are these real card values?', answer: 'Yes. All values are based on estimated gem mint market prices from the CardVault database of over 6,000 sports cards.' },
  { question: 'How is the score calculated?', answer: 'Correct answers earn up to 500 points based on speed. Answer in under 2 seconds for the full 500. Wrong answers score zero. Perfect game: 10,000 points.' },
  { question: 'Why is this useful?', answer: 'Knowing relative card values is essential for trading, buying at shows, and spotting deals. This game trains your pricing instincts.' },
];

export default function ValueSnapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Card Value Snap', description: 'Which card is worth more? Rapid-fire value comparison game.', url: 'https://cardvault-two.vercel.app/card-value-snap', applicationCategory: 'GameApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          Daily Game &middot; 20 Rounds &middot; 8 Sec Each
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Value Snap</h1>
        <p className="text-zinc-400 text-lg max-w-2xl">Two cards. One is worth more. Pick it. 20 rounds of rapid-fire value comparisons to sharpen your pricing instincts.</p>
      </div>

      <ValueSnapClient />

      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-4">More Games</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/card-speed-quiz" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-sky-700/50 transition-colors"><h3 className="font-semibold text-white mb-1">Speed Quiz</h3><p className="text-xs text-zinc-500">Name the player from clues</p></Link>
          <Link href="/flip-or-keep" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-sky-700/50 transition-colors"><h3 className="font-semibold text-white mb-1">Flip or Keep</h3><p className="text-xs text-zinc-500">Flip for cash or keep?</p></Link>
          <Link href="/hot-potato" className="block bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 hover:border-sky-700/50 transition-colors"><h3 className="font-semibold text-white mb-1">Hot Potato</h3><p className="text-xs text-zinc-500">Sell before the crash</p></Link>
        </div>
      </div>

      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq) => (<div key={faq.question}><h3 className="font-semibold text-white mb-2">{faq.question}</h3><p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p></div>))}
        </div>
      </div>
    </div>
  );
}
