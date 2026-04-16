import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TradeBlockClient from './TradeBlockClient';
import { sportsCards } from '@/data/sports-cards';

export const metadata: Metadata = {
  title: 'Card Trade Block — Build & Share Your For-Trade List | CardVault',
  description: 'Free card trade block builder. List cards you want to trade, set conditions and asking prices. Share via URL with dealers, Discord, Reddit. Search 9,000+ cards or add custom entries.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Trade Block Builder | CardVault',
    description: 'Build your trade block. List cards for trade, set prices, share everywhere.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Trade Block | CardVault',
    description: 'Build and share your for-trade list. Free tool for collectors.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Trade Block' },
];

const faqItems = [
  {
    question: 'How do I save my trade block?',
    answer: 'Your trade block is automatically saved to your browser local storage. It persists between visits on the same device and browser. To access your list elsewhere, use the Share Link feature to generate a URL containing your full trade block.',
  },
  {
    question: 'How do I share my trade block?',
    answer: 'Click Share Link to generate a URL containing your entire trade block. Send this to dealers, card groups on Discord or Reddit, or fellow collectors at card shows. You can also click Copy as Text for a plain-text version perfect for posting in forums, Facebook groups, or messaging apps.',
  },
  {
    question: 'What conditions should I list?',
    answer: 'Be as specific as possible. List the actual grade if the card is graded (PSA 10, BGS 9.5, etc.) or describe the raw condition (Near Mint, Excellent, Good). Accurate condition descriptions build trust and prevent wasted time negotiating when the other person sees the card.',
  },
  {
    question: 'Should I set asking prices or leave them open?',
    answer: 'It depends on your trading style. Setting an asking price helps filter serious inquiries and establishes a baseline for negotiations. Marking a card as Open to Offers signals flexibility and can attract more trade proposals. For high-value cards, setting a price is recommended to avoid lowball offers.',
  },
  {
    question: 'How is this different from the Want List?',
    answer: 'The Want List tracks cards you are looking for. The Trade Block lists cards you have and want to trade away. They are complementary tools — share both with dealers and trading partners so they can see what you need and what you are offering.',
  },
];

const cardData = sportsCards.map(c => ({
  name: c.name,
  slug: c.slug,
  sport: c.sport,
  year: c.year,
  set: c.set,
}));

export default function TradeBlockPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Trade Block Builder',
        description: 'Build, manage, and share your card trade block. List cards for trade with conditions and asking prices.',
        url: 'https://cardvault-two.vercel.app/tools/trade-block',
        applicationCategory: 'UtilityApplication',
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

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Trade Block Builder &middot; 9,000+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Trade Block</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          List cards you want to trade. Set conditions and asking prices. Share your trade block via URL, text, or screenshot.
        </p>
      </div>

      <TradeBlockClient cards={cardData} />

      {/* How It Works */}
      <div className="mt-12 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">How to Use Your Trade Block</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { step: '1', title: 'Add Cards', desc: 'Search from 9,000+ cards or add custom entries with name, set, year, and sport.' },
            { step: '2', title: 'Set Details', desc: 'Add condition (Raw, PSA 9, etc.), asking price or "open to offers," and any notes.' },
            { step: '3', title: 'Share Everywhere', desc: 'Generate a share link for Discord/Reddit or copy as text for forums and messages.' },
            { step: '4', title: 'Close Deals', desc: 'When a card is traded, mark it as moved. Track your trading activity over time.' },
          ].map(s => (
            <div key={s.step} className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-900/50 border border-orange-700/50 rounded-lg flex items-center justify-center text-orange-400 font-bold text-sm">{s.step}</span>
              <div>
                <h3 className="text-white font-semibold text-sm">{s.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Trade Block Tips</h2>
        <div className="space-y-3">
          {[
            { title: 'Be Honest About Condition', tip: 'Accurately describe flaws. Misrepresenting condition burns bridges in the hobby.' },
            { title: 'Price Graded Cards Higher', tip: 'Graded cards carry a premium. A PSA 10 is worth 2-10x more than raw near-mint.' },
            { title: 'Update Regularly', tip: 'Remove traded cards promptly. A stale trade block with sold items frustrates potential trading partners.' },
            { title: 'Cross-Reference Your Want List', tip: 'Share both your trade block AND want list. The best trades happen when both sides find what they need.' },
          ].map((t, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-orange-400 mt-0.5">&#x2022;</span>
              <div>
                <span className="text-white font-medium text-sm">{t.title}:</span>{' '}
                <span className="text-slate-400 text-sm">{t.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((f, i) => (
            <details key={i} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-orange-400 transition-colors">
                {f.question}
              </summary>
              <p className="text-slate-400 text-sm mt-2 pl-4 border-l-2 border-slate-700">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Links */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: '/tools/want-list', label: 'Want List Builder', desc: 'Track cards you need' },
          { href: '/tools/trade', label: 'Trade Evaluator', desc: 'Is this trade fair?' },
          { href: '/trade-hub', label: 'Trade Hub', desc: 'Propose and accept trades' },
          { href: '/tools/flip-calc', label: 'Flip Calculator', desc: 'Calculate sell profits' },
          { href: '/tools/selling-platforms', label: 'Selling Platforms', desc: 'Where to sell cards' },
          { href: '/tools/listing-generator', label: 'Listing Generator', desc: 'Write eBay listings' },
        ].map(link => (
          <Link key={link.href} href={link.href} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3 hover:border-orange-700/50 transition-colors group">
            <span className="text-white text-sm font-medium group-hover:text-orange-400 transition-colors">{link.label}</span>
            <span className="text-slate-500 text-xs block mt-0.5">{link.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
