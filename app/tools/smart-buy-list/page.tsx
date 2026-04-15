import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SmartBuyListClient from './SmartBuyListClient';

export const metadata: Metadata = {
  title: 'Smart Buy List — Card Show Shopping List Builder | CardVault',
  description: 'Build a prioritized card shopping list for your next card show or online buying session. Set your budget, add cards with target prices, prioritize must-buys vs wants, and track spending. Mobile-first tool for sports card collectors.',
  openGraph: {
    title: 'Smart Buy List — Card Show Shopping Planner | CardVault',
    description: 'Build your card show shopping list with budget tracking, priority levels, and target prices for every card.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Smart Buy List — CardVault',
    description: 'Prioritized card shopping list with budget tracking. Perfect for card shows and online buying.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Smart Buy List' },
];

const faqItems = [
  {
    question: 'What is the Smart Buy List?',
    answer: 'The Smart Buy List is a card show shopping planner that helps you build a prioritized list of sports cards you want to buy. Set your total budget, search and add cards from our database of 6,800+ cards, assign target prices and priority levels (Must Buy, Want, Maybe), and track your spending against your budget in real time. Your list saves automatically and works offline at card shows.',
  },
  {
    question: 'How should I set target prices for cards on my buy list?',
    answer: 'Target prices are pre-filled based on estimated raw card values from recent market data. You can adjust these to match your maximum comfortable buy price. For card shows, set target prices 10-20% below eBay sold prices since dealers at shows often price competitively to move inventory. Always check eBay sold listings (not active listings) for the most accurate market reference.',
  },
  {
    question: 'What do the priority levels mean?',
    answer: 'Must Buy cards are your top targets — the cards you came to the show specifically to find. Want cards are desirable but not essential — you will buy them if the price is right. Maybe cards are impulse candidates — only buy if you have budget remaining after securing your must-buys and wants. This system prevents overspending on low-priority cards early in a show.',
  },
  {
    question: 'Does my buy list save between visits?',
    answer: 'Yes, your buy list and budget are automatically saved to your browser\'s local storage. They persist between visits and work even without an internet connection — perfect for using at card shows with spotty WiFi. You can also copy your list to the clipboard to share or paste into a notes app.',
  },
  {
    question: 'How can I use this at a card show?',
    answer: 'Before the show: build your list at home with research-backed target prices. At the show: open this page on your phone, check off cards as you find them, adjust prices based on what dealers are asking, and watch your budget bar to stay on track. After the show: review what you bought vs. planned to refine your strategy for next time. The mobile-friendly design means everything works with one hand.',
  },
];

export default function SmartBuyListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Smart Buy List — Card Show Shopping Planner',
        description: 'Build a prioritized card shopping list with budget tracking for card shows and online buying.',
        url: 'https://cardvault-two.vercel.app/tools/smart-buy-list',
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
          Budget Tracking &middot; 3 Priority Levels &middot; 6,800+ Cards
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Smart Buy List</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Build your card show shopping list. Set a budget, add cards with target prices, prioritize your picks, and never overspend at a card show again.
        </p>
      </div>

      <SmartBuyListClient />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white font-medium text-sm">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform ml-2">&#9660;</span>
              </summary>
              <div className="px-5 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Back */}
      <div className="mt-8 text-center">
        <Link href="/tools" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}
