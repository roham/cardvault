import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import NegotiatorClient from './NegotiatorClient';

export const metadata: Metadata = {
  title: 'Card Price Negotiator — Practice Haggling at Card Shows | CardVault',
  description: 'Free interactive card show negotiation simulator. Practice haggling with 5 AI seller personalities. Pick any card from 7,800+ in the database, make offers, counter, and learn real negotiation tactics. Track your deals, savings, and best discount percentage.',
  openGraph: {
    title: 'Card Price Negotiator — CardVault',
    description: 'Practice your card show haggling skills. Negotiate with AI sellers, save money, learn tactics.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Price Negotiator — CardVault',
    description: 'Interactive negotiation simulator for card collectors. 5 seller personalities.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Vault', href: '/vault' },
  { label: 'Price Negotiator' },
];

const faqItems = [
  {
    question: 'How does the Card Price Negotiator work?',
    answer: 'Pick any card from the CardVault database of 7,800+ sports cards. You will be matched with a random AI seller who has their own personality and negotiation style. The seller marks up the card 15-40% above market value (like real card show dealers). You make offers, they counter, and you negotiate over up to 5 rounds to reach a deal or walk away.',
  },
  {
    question: 'What are the different seller personalities?',
    answer: 'There are 5 seller types: Card Show Tony (firm, knows his prices), Garage Sale Gary (flexible, cleaning out), Desperate Dan (needs cash, willing to deal), Savvy Sarah (full-time flipper, tests your knowledge), and Friendly Frank (hobby collector, wants fair deals). Each has different flexibility, minimum prices, and negotiation behavior.',
  },
  {
    question: 'What is a good opening offer?',
    answer: 'Start at 60-75% of the asking price. This leaves room for 2-3 rounds of back-and-forth while still being respectful. Opening too low (under 50%) may offend the seller, while opening too high (over 90%) leaves no room to negotiate. The best negotiators know comps (the card\'s real market value) and use that as leverage.',
  },
  {
    question: 'When should I walk away?',
    answer: 'Walk away when the seller\'s counter is above what you think the card is worth, when you have run out of rounds without getting close, or when you feel the seller is not negotiating in good faith. Walking away is a legitimate strategy — sometimes the seller will chase you with a better offer (in real life, not in this simulator).',
  },
  {
    question: 'How is the asking price determined?',
    answer: 'The AI seller marks up the card 15-40% above its estimated market value, simulating real card show pricing where dealers need margin. The market value shown is CardVault\'s estimated value based on eBay sold listings and auction house data. Your goal is to negotiate the price as close to or below market value as possible.',
  },
];

export default function NegotiatorPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Price Negotiator',
        description: 'Interactive card show negotiation simulator with 5 AI seller personalities. Practice haggling to save money on sports cards.',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: 'https://cardvault-two.vercel.app/vault/negotiator',
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

      <NegotiatorClient />

      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <details key={i} className="group" open={i === 0}>
              <summary className="cursor-pointer text-gray-300 hover:text-white font-medium">{f.question}</summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
