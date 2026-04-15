import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SellingPlatforms from './SellingPlatforms';

export const metadata: Metadata = {
  title: 'Selling Platform Comparison — Where to Sell Your Cards for the Most Money',
  description: 'Free selling platform comparison tool. Enter your card value and compare net proceeds across eBay, PWCC, Goldin, Heritage Auctions, MySlabs, COMC, Facebook Groups, and local card shops. See fees, shipping costs, and what you actually keep.',
  openGraph: {
    title: 'Selling Platform Comparison — CardVault',
    description: 'Compare net proceeds across 8 selling platforms. Find where you keep the most money.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Selling Platform Comparison — CardVault',
    description: 'Where should you sell your card? Compare eBay, PWCC, Goldin, Heritage, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Selling Platform Comparison' },
];

const faqItems = [
  {
    question: 'Where should I sell my sports cards?',
    answer: 'It depends on the card value. For cards under $100, eBay and Facebook Groups offer the best combination of low fees and fast sales. For cards worth $100-$500, PWCC Marketplace becomes competitive. For premium cards worth $500+, auction houses like Goldin and Heritage Auctions have the buyer base to drive top prices. Local card shops give you instant cash but typically pay 40-60% of market value.',
  },
  {
    question: 'What are the selling fees on eBay for sports cards?',
    answer: 'eBay charges a 13.25% final value fee on sports card sales (Trading Cards category), plus $0.30 per transaction. This includes payment processing — there is no separate PayPal fee since eBay uses Managed Payments. Promoted listings cost an additional 2-20% if you choose to boost visibility. For a $100 card, expect to pay about $13.55 in total fees.',
  },
  {
    question: 'Is it better to sell on PWCC or eBay?',
    answer: 'PWCC has a lower seller commission (10%) vs eBay (13.25%), but PWCC charges buyers a 20% premium which can depress hammer prices. For graded cards worth $100+, PWCC often nets you similar or more money due to their collector audience. For cards under $100, eBay is usually better because PWCC minimums and the auction format favor higher-value items.',
  },
  {
    question: 'How much do local card shops pay for cards?',
    answer: 'Local card shops typically pay 40-60% of market value for sports cards. The exact percentage depends on the card desirability, current demand, and your relationship with the shop owner. The advantages are instant cash, zero fees, and no shipping hassle. Negotiate — shops need inventory and many will pay more for cards they know they can flip quickly.',
  },
  {
    question: 'What is a buyer premium and how does it affect sellers?',
    answer: 'A buyer premium is an additional percentage that auction houses charge buyers on top of the winning bid (hammer price). For example, Goldin charges 22% buyer premium — if a card sells for $1,000 hammer, the buyer pays $1,220. While this does not directly reduce the seller payout (you receive hammer minus commission), it can suppress bidding because buyers factor the premium into their maximum bids.',
  },
];

export default function SellingPlatformsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Selling Platform Comparison Tool',
        description: 'Compare net proceeds from selling cards across eBay, PWCC, Goldin, Heritage Auctions, MySlabs, COMC, Facebook Groups, and local card shops.',
        url: 'https://cardvault-two.vercel.app/tools/selling-platforms',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          eBay &middot; PWCC &middot; Goldin &middot; Heritage &middot; MySlabs &middot; COMC &middot; FB Groups &middot; LCS
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Where Should I Sell My Card?</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Enter your card&apos;s estimated value and compare net proceeds across 8 major selling platforms. See exactly what fees you&apos;ll pay and how much you&apos;ll actually keep.
        </p>
      </div>

      <SellingPlatforms />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
