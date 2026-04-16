import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import FlippingGuideClient from './FlippingGuideClient';

export const metadata: Metadata = {
  title: 'Card Flipping Guide — How to Buy & Sell Sports Cards for Profit | CardVault',
  description: 'Complete guide to flipping sports cards for profit. Learn where to buy undervalued cards, best selling platforms, grading arbitrage, fee math, shipping tips, risk management, and advanced strategies. 8 chapters with interactive readiness checklist.',
  openGraph: {
    title: 'Card Flipping Guide — Buy & Sell Cards for Profit | CardVault',
    description: 'Learn to flip sports cards profitably. Platform arbitrage, grading tricks, seasonal timing, and risk management.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Card Flipping Guide — CardVault',
    description: 'The complete guide to buying and selling sports cards for profit.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Guides', href: '/guides' },
  { label: 'Card Flipping Guide' },
];

const faqItems = [
  {
    question: 'How much money do I need to start flipping cards?',
    answer: 'You can start with as little as $200-500. This lets you buy 10-20 cards in the $10-50 range, learn the market, and develop your eye for undervalued cards. As you profit, reinvest to grow your capital. Most successful flippers started with under $500 and scaled up over 3-6 months.',
  },
  {
    question: 'What is the average profit margin for card flipping?',
    answer: 'Experienced flippers typically see 20-40% net profit margins after accounting for platform fees, shipping, and supplies. On a $50 card sold on eBay for $80, your net profit might be $15-20 after the 13% eBay fee, shipping costs, and original purchase price. Higher-value cards and grading arbitrage can yield better margins.',
  },
  {
    question: 'Which sports cards are best for flipping?',
    answer: 'Football and basketball cards tend to have the most volatile pricing, creating more flip opportunities. Rookie cards of breakout players offer the biggest swings. For consistent volume, focus on $10-100 raw cards of current-season players whose on-field performance drives demand. Avoid vintage cards for flipping — they move slowly.',
  },
  {
    question: 'How do I avoid buying fake or altered cards?',
    answer: 'Buy graded cards from PSA, BGS, CGC, or SGC for anything over $100. For raw cards, learn to check print quality, centering, and holographic stickers. Avoid deals that seem too good to be true. Buy from sellers with strong feedback scores. Use PSA cert verification for graded purchases. At card shows, bring a loupe and UV light.',
  },
  {
    question: 'Do I need to pay taxes on card flipping profits?',
    answer: 'Yes. In the United States, card flipping income is taxable. If you sell more than $600 on platforms like eBay or PayPal, you will receive a 1099-K form. Sports card profits are taxed as collectibles at up to 28% for long-term capital gains, or as ordinary income for short-term flips. Keep detailed records of all purchases and sales. Consult a tax professional for your specific situation.',
  },
];

export default function CardFlippingGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Card Flipping Guide: How to Buy & Sell Sports Cards for Profit',
        description: 'Complete guide to flipping sports cards for profit. Covers finding deals, selling platforms, grading arbitrage, fee math, and risk management.',
        url: 'https://cardvault-two.vercel.app/card-flipping-guide',
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
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How to Flip Sports Cards for Profit',
        description: 'Step-by-step guide to buying undervalued sports cards and selling them for profit.',
        step: [
          { '@type': 'HowToStep', name: 'Set Your Budget', text: 'Start with $200-500 in capital you can afford to lose. This gives you enough to buy 10-20 cards while learning.' },
          { '@type': 'HowToStep', name: 'Find Undervalued Cards', text: 'Source cards from Facebook groups, card shows, and casual platforms where sellers price below market value.' },
          { '@type': 'HowToStep', name: 'Calculate Your Margins', text: 'Before buying, calculate total cost including fees, shipping, and supplies. Target 30%+ gross margin.' },
          { '@type': 'HowToStep', name: 'List and Sell', text: 'Sell on high-traffic platforms like eBay for maximum exposure. Use proper titles, photos, and competitive pricing.' },
          { '@type': 'HowToStep', name: 'Ship Professionally', text: 'Package cards securely with top loaders and bubble mailers. Ship within 1-2 days with tracking.' },
          { '@type': 'HowToStep', name: 'Track and Optimize', text: 'Record every transaction. Analyze your P&L monthly. Double down on what works, cut what does not.' },
        ],
      }} />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Flipping Guide &middot; 8 Chapters &middot; Interactive Checklist
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Flipping Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          The complete guide to buying and selling sports cards for profit. From finding
          undervalued cards to grading arbitrage, platform fees to shipping — everything you need to flip cards successfully.
        </p>
      </div>

      <FlippingGuideClient />

      {/* FAQ */}
      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-emerald-400 transition-colors list-none flex items-center gap-2">
                <span className="text-emerald-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
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
          Part of the <Link href="/guides" className="text-emerald-400 hover:underline">CardVault Guides</Link> collection.
          See also: <Link href="/card-show-guide" className="text-emerald-400 hover:underline">Card Show Guide</Link>,{' '}
          <Link href="/collecting-mistakes" className="text-emerald-400 hover:underline">20 Collecting Mistakes</Link>,{' '}
          <Link href="/golden-rules" className="text-emerald-400 hover:underline">25 Golden Rules</Link>,{' '}
          <Link href="/storage-guide" className="text-emerald-400 hover:underline">Storage Guide</Link>,{' '}
          <Link href="/collecting-roadmap" className="text-emerald-400 hover:underline">Collecting Roadmap</Link>.
        </p>
      </div>
    </div>
  );
}
