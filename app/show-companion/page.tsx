import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowCompanionClient from './ShowCompanionClient';

export const metadata: Metadata = {
  title: 'Card Show Companion — Mobile Buy/Sell Tracker | CardVault',
  description: 'Your mobile companion for card shows. Manage buy lists with max prices, sell lists with floor prices, log purchases with running totals, and track your budget in real time. Free, no account needed.',
  openGraph: {
    title: 'Card Show Companion — Buy/Sell/Track at Shows | CardVault',
    description: 'Mobile-first card show tool. Buy list, sell list, purchase logger, budget tracker, and negotiation tips.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Companion — CardVault',
    description: 'Track buys, sells, and budget at card shows. Mobile-first tool for collectors and dealers.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Show Companion' },
];

const faqItems = [
  {
    question: 'What is the Card Show Companion?',
    answer: 'The Card Show Companion is a free mobile-first tool designed for use at card shows. It helps you manage a buy list (cards you want to find with max prices), a sell list (cards you brought to sell with min prices), a purchase log (everything you bought with running totals), and a budget tracker so you never overspend. Everything saves locally on your phone.',
  },
  {
    question: 'How do I use it at a card show?',
    answer: 'Before the show: add cards to your buy list with maximum prices you want to pay, and add cards to your sell list with your asking and minimum prices. Set your budget. At the show: use the purchase log to track every buy in real time. Mark items as found or sold. Check the summary tab to see your running P&L and budget remaining.',
  },
  {
    question: 'Is my data saved between sessions?',
    answer: 'Yes. All data is saved in your browser\'s local storage. Your buy list, sell list, purchases, and budget persist between page loads. Just don\'t clear your browser data before the show ends. Use the Copy Summary button to save a text backup of your show results.',
  },
  {
    question: 'What budget should I set for a card show?',
    answer: 'For beginners, $50-$100 is a great starting point — enough to grab some nice cards from dollar boxes and a few mid-range picks. Intermediate collectors typically bring $200-$500. Serious collectors and dealers may bring $1,000+. Whatever your budget, the companion helps you stick to it with real-time tracking.',
  },
  {
    question: 'Any tips for getting the best deals at card shows?',
    answer: 'Walk the entire show before buying anything — prices vary 20-40% between booths. Bring cash (many dealers offer 5-10% discounts). Bundle purchases for better deals. Check eBay sold prices on your phone before negotiating. Shop the dollar boxes for hidden gems. The last hour of the show is the best time to negotiate.',
  },
];

export default function ShowCompanionPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Companion',
        description: 'Mobile-first card show companion. Buy list, sell list, purchase logger, budget tracker, and negotiation tips for card shows.',
        url: 'https://cardvault-two.vercel.app/show-companion',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Mobile-First &middot; Buy List &middot; Sell List &middot; Budget Tracker
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Show Companion</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Your mobile toolkit for card shows. Track what you want to buy, what you brought
          to sell, and every purchase you make — with a running budget so you never overspend.
        </p>
      </div>

      <ShowCompanionClient />

      {/* FAQ */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium">
                {faq.question}
                <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', desc: 'Calculate profit per flip' },
            { href: '/flip-journal', label: 'Flip Journal', desc: 'Track all your flips' },
            { href: '/tools/shipping-calc', label: 'Shipping Calculator', desc: 'Compare shipping costs' },
            { href: '/tools/show-finder', label: 'Card Show Finder', desc: 'Find shows near you' },
            { href: '/tools/dealer-scanner', label: 'Dealer Scanner', desc: 'Quick mobile pricing' },
            { href: '/tools/budget-planner', label: 'Budget Planner', desc: 'Monthly hobby budget' },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-amber-800/50 transition-colors group">
              <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{tool.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
