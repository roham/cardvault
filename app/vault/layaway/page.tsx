import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import LayawayClient from './LayawayClient';

export const metadata: Metadata = {
  title: 'Card Layaway Plan — Pay Over Time for High-Value Cards | CardVault',
  description: 'Put any sports card on layaway and pay over time. Choose 4, 8, or 12 weekly payments. Track your plans, make payments from your wallet, and add completed cards to your vault. Search 9,500+ real cards. Free layaway simulator.',
  openGraph: {
    title: 'Card Layaway Plan — Pay Over Time | CardVault',
    description: 'Put high-value cards on layaway. 4, 8, or 12 weekly payments. Track progress and complete your collection.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Layaway Plan — CardVault',
    description: 'Virtual card layaway. Pay over time for high-value cards. Free simulator.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Layaway Plan' },
];

const faqItems = [
  {
    question: 'What is the Card Layaway Plan?',
    answer: 'The Card Layaway Plan lets you put any card from our 9,500+ database on a simulated layaway payment plan. Instead of paying the full price upfront, you choose 4, 8, or 12 weekly payments. Make payments from your vault wallet each week. Once all payments are complete, the card is added to your vault collection. It simulates the layaway programs that many local card shops (LCS) offer for high-value cards.',
  },
  {
    question: 'How do payment plans work?',
    answer: 'You pick a card, select a plan length (4, 8, or 12 payments), and put down the first payment. The remaining balance is split into equal weekly installments. A small layaway fee is added: 5% for 4-payment plans, 10% for 8-payment plans, and 15% for 12-payment plans. These fees mirror real-world layaway costs that card shops charge to hold cards.',
  },
  {
    question: 'What happens if I miss payments?',
    answer: 'If you miss 3 consecutive payments, the layaway is forfeited. You lose all payments already made — the card goes back to inventory. This mirrors real LCS layaway policies where shops cannot hold cards indefinitely. To avoid forfeiture, make payments consistently. You can also cancel a plan voluntarily, which refunds 50% of payments made.',
  },
  {
    question: 'Is real money involved?',
    answer: 'No. Card Layaway is a free educational simulation using your vault wallet balance (browser localStorage). No real money changes hands. Card values are real — based on eBay sold data and auction results — but all transactions are simulated. The goal is to teach collectors how layaway works so they can use it at real card shops.',
  },
  {
    question: 'How does this compare to real card shop layaway?',
    answer: 'Most local card shops offer 30-90 day layaway plans with 10-25% down and weekly or biweekly payments. Some charge a small fee (5-15%), others do not. Our simulator uses similar terms. The key lesson: layaway lets you acquire cards you could not afford in one purchase, but fees and forfeiture risk mean you pay a premium for the convenience.',
  },
];

export default function LayawayPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Layaway Plan',
        description: 'Simulated card layaway payment plans. Put high-value cards on layaway and pay over 4, 8, or 12 weekly payments.',
        url: 'https://cardvault-two.vercel.app/vault/layaway',
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
          Layaway &middot; 9,500+ Cards &middot; 3 Plan Lengths
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Layaway Plan</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Put high-value cards on layaway and pay over time. Choose 4, 8, or 12 weekly payments.
          Complete your plan to add the card to your vault — just like layaway at your local card shop.
        </p>
      </div>

      <LayawayClient />

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

      {/* Real-World Layaway Comparison */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Real-World Card Shop Layaway Terms</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 pr-4">Shop Type</th>
                <th className="text-left py-2 pr-4">Down Payment</th>
                <th className="text-left py-2 pr-4">Duration</th>
                <th className="text-left py-2 pr-4">Fee</th>
                <th className="text-left py-2">Forfeiture</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-medium">Local Card Shop (LCS)</td>
                <td className="py-2 pr-4">10-25%</td>
                <td className="py-2 pr-4">30-90 days</td>
                <td className="py-2 pr-4">0-10%</td>
                <td className="py-2">Store credit or forfeit</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-medium">Online Dealers</td>
                <td className="py-2 pr-4">20-50%</td>
                <td className="py-2 pr-4">30-60 days</td>
                <td className="py-2 pr-4">0-5%</td>
                <td className="py-2">Usually forfeit after 14d late</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 pr-4 font-medium">Card Show Dealers</td>
                <td className="py-2 pr-4">25-50%</td>
                <td className="py-2 pr-4">Until next show</td>
                <td className="py-2 pr-4">Usually none</td>
                <td className="py-2">Card goes back to inventory</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-emerald-400">CardVault Sim</td>
                <td className="py-2 pr-4">First payment</td>
                <td className="py-2 pr-4">4-12 weeks</td>
                <td className="py-2 pr-4">5-15%</td>
                <td className="py-2">Forfeit after 3 missed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Layaway Tips for Real Card Shops</h2>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li><strong className="text-white">Ask before you assume.</strong> Not every shop offers layaway. Some only do it for purchases over $100-$200. Ask the terms upfront.</li>
          <li><strong className="text-white">Get it in writing.</strong> Even at a friendly LCS, get layaway terms on paper: price, schedule, forfeiture policy, and any fees.</li>
          <li><strong className="text-white">Shorter plans save money.</strong> Fewer payments = lower fees and less time for the market to move against you.</li>
          <li><strong className="text-white">Price is locked at agreement.</strong> If the card goes up 50% during layaway, you still pay the original price — that is the upside of layaway.</li>
          <li><strong className="text-white">Market risk goes both ways.</strong> If the card drops 30% during your plan, you are still committed to the original price. Only use layaway for cards you want to keep long-term.</li>
        </ul>
      </div>

      {/* Internal Links */}
      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/vault" className="text-emerald-400 hover:underline">CardVault Vault</Link> experience.
          See also: <Link href="/packs" className="text-emerald-400 hover:underline">Pack Store</Link>,{' '}
          <Link href="/vault/auction-sniper" className="text-emerald-400 hover:underline">Auction Sniper</Link>,{' '}
          <Link href="/vault/pawn-shop" className="text-emerald-400 hover:underline">Pawn Shop</Link>,{' '}
          <Link href="/vault/flash-sale" className="text-emerald-400 hover:underline">Flash Sales</Link>,{' '}
          <Link href="/tools/investment-calc" className="text-emerald-400 hover:underline">Investment Calculator</Link>,{' '}
          <Link href="/vault/subscription" className="text-emerald-400 hover:underline">Subscription Box</Link>.
        </p>
      </div>
    </div>
  );
}
