import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import BuyingGuideClient from './BuyingGuideClient';

export const metadata: Metadata = {
  title: 'Card Buying Guide — Where & How to Buy Sports Cards Safely | CardVault',
  description: 'Free interactive card buying advisor. Enter any sports card and get personalized platform recommendations, fair price estimates, authentication tips, red flags to watch, and a step-by-step buying checklist. Covers eBay, COMC, Whatnot, Facebook groups, card shows, and local shops.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Buying Guide — Where & How to Buy Sports Cards Safely | CardVault',
    description: 'Enter any card you want to buy. Get the best platform, fair price, authentication tips, and red flags to watch.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Buying Guide — CardVault',
    description: 'Free buying advisor for sports cards. Best platform, fair price, authentication tips, red flags.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Buying Guide' },
];

const faqItems = [
  {
    question: 'Where is the best place to buy sports cards online?',
    answer: 'It depends on the card value. For cards under $20, eBay or Mercari offer the most selection and competitive pricing. For $20-$200, COMC (Check Out My Cards) lets you inspect high-res scans before buying — eliminating condition surprises. For $200+, eBay with authenticity guarantee or Whatnot live auctions often produce the best deals. Facebook groups offer the lowest fees (0%) but require trusting the seller. Always factor in shipping costs, platform fees, and buyer protection when comparing prices across platforms.',
  },
  {
    question: 'How do I avoid buying fake or counterfeit sports cards?',
    answer: 'For graded cards (PSA, BGS, CGC, SGC): verify the certification number on the grading company website, check slab weight and font consistency, and look for hologram security features. For raw cards: examine print quality under magnification, check card stock thickness, compare to known authentic examples, and be wary of deals that seem too good to be true. Buy from established sellers with positive feedback history. Vintage cards (pre-1980) require extra scrutiny for trimming, re-coloring, and alterations.',
  },
  {
    question: 'How do I know if I am paying a fair price for a sports card?',
    answer: 'Check recent sold listings on eBay (not active listings — those are asking prices, not market prices). Filter by "Sold Items" and match the exact card, condition, and grade. Look at the last 5-10 sales to establish a range. For graded cards, PSA\'s price guide and 130point.com provide historical sales data. A fair price is within 10% of the median recent sold price. Be cautious of cards priced 30%+ below market — they may be counterfeit, damaged, or misrepresented.',
  },
  {
    question: 'Should I buy raw or graded sports cards?',
    answer: 'Buy graded if you want certainty of condition and authenticity — graded cards have verified grades and tamper-evident slabs. Buy raw if you are comfortable assessing condition yourself and want to save money (raw cards are typically 30-60% cheaper than graded). For cards worth $100+, buying graded (PSA 9 or 10) protects your investment. For cards under $50, buying raw and grading yourself can yield better returns if you can accurately assess condition.',
  },
  {
    question: 'What should I check before buying a card at a card show?',
    answer: 'Bring a loupe or magnifying glass to inspect centering, corners, edges, and surface. Compare the asking price to recent eBay sold prices on your phone. Check for soft corners, surface scratches, print defects, and off-center borders. For graded cards, verify the cert number on the spot using the grading company app. Negotiate — dealers expect it, especially later in the day or on the last day of a multi-day show. Ask about bulk discounts if buying multiple cards.',
  },
];

export default function BuyingGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Buying Guide',
        description: 'Free interactive card buying advisor. Get personalized platform recommendations, fair price estimates, authentication tips, and buying checklists for any sports card.',
        url: 'https://cardvault-two.vercel.app/tools/buying-guide',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Platform Comparison - Fair Price - Authentication - Red Flags - Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Buying Guide
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Enter any card you want to buy. Get the best platform, fair price estimate, authentication checklist, and red flags to watch — personalized to your card.
        </p>
      </div>

      <BuyingGuideClient />

      {/* How It Works */}
      <section className="mt-16 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6">How to Use This Guide</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { step: '1', title: 'Search or Describe Your Card', desc: 'Search our database of 8,900+ cards or manually enter card details like sport, era, and estimated value.' },
            { step: '2', title: 'Get Platform Rankings', desc: 'See which buying platform is best for your specific card based on price range, protection, and fees.' },
            { step: '3', title: 'Review Authentication Tips', desc: 'Get era-specific and format-specific tips to verify your card is genuine before purchasing.' },
            { step: '4', title: 'Check the Buying Checklist', desc: 'Follow the step-by-step checklist to make a smart, safe purchase every time.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-blue-400 font-bold text-sm">
                {item.step}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-xl">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-blue-400 transition-colors">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9662;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Assess card condition before buying' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit after platform fees' },
            { href: '/tools/dealer-scanner', label: 'Dealer Scanner', desc: 'Fast pricing at card shows' },
            { href: '/tools/insurance-calc', label: 'Insurance Calculator', desc: 'Protect your collection' },
            { href: '/tools/centering-check', label: 'Centering Checker', desc: 'Verify centering before grading' },
            { href: '/tools/slab-weight', label: 'Slab Weight Verifier', desc: 'Authenticate graded cards' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="block p-3 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-blue-600/50 transition-colors">
              <div className="text-white font-medium text-sm">{link.label}</div>
              <div className="text-gray-500 text-xs mt-0.5">{link.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
