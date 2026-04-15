import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ShowChecklist from './ShowChecklist';

export const metadata: Metadata = {
  title: 'Card Show Packing Checklist — What to Bring to a Card Show',
  description: 'Free interactive card show packing checklist. Never forget supplies, cash, or tools. Custom checklists for buyers, sellers, or both. Card protection, display supplies, tech, payment, and pro tips.',
  openGraph: {
    title: 'Card Show Packing Checklist — CardVault',
    description: 'Interactive packing list for card shows. Customized for buyers, sellers, or both.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Show Packing Checklist — CardVault',
    description: 'What to bring to a card show. Interactive checklist with pro tips.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Show Checklist' },
];

const faqItems = [
  {
    question: 'What should I bring to a card show?',
    answer: 'The essentials are: cash (mostly small bills for deals and change), penny sleeves and toploaders to protect purchases, your phone with a price-checking app like CardVault or eBay, payment apps (PayPal, Venmo, Zelle), a backpack or messenger bag, and a written want list with target prices. If you are selling, add display binders, card storage boxes, price stickers, and a table cloth.',
  },
  {
    question: 'How much cash should I bring to a card show?',
    answer: 'For buying, bring your total budget in cash — dealers give 5-10% cash discounts since they avoid processing fees. For a typical show, $200-500 is a good starting budget for mid-range purchases. Bring mostly $20s and $10s with some $1s and $5s. If selling, bring at least $100 in change (mix of $1s, $5s, $10s, $20s).',
  },
  {
    question: 'How early should I arrive at a card show?',
    answer: 'Arrive as early as possible — ideally during the "early bird" window if the show offers one. The best deals and rarest cards get scooped in the first hour. Many shows offer early admission for an extra $10-20, which is almost always worth it if you are buying. If you are a seller, arrive 1-2 hours before doors open to set up your table.',
  },
  {
    question: 'Should I bring supplies to a card show?',
    answer: 'Yes, absolutely. Penny sleeves, toploaders, and team bags cost 2-3x more at card shows compared to buying them online in bulk. Bring your own to protect purchases immediately after buying. You should also bring a jeweler loupe (10x-30x) to inspect card condition before buying raw cards.',
  },
  {
    question: 'How do I negotiate at a card show?',
    answer: 'Start by making a lap — walk the entire show before buying anything to compare prices. The same card can vary 30-50% between tables. Ask "what is your best cash price?" which signals you are ready to buy. Offering 10-20% below asking is standard. Buying multiple cards from one dealer often gets a better group discount. End-of-show (last 1-2 hours) is the best time to negotiate because dealers want to avoid packing inventory.',
  },
];

export default function ShowChecklistPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Show Packing Checklist',
        description: 'Interactive packing checklist for card shows. Customized for buyers, sellers, or both.',
        url: 'https://cardvault-two.vercel.app/tools/show-checklist',
        applicationCategory: 'UtilitiesApplication',
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
          Buyers &middot; Sellers &middot; 35+ Items &middot; Pro Tips
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Show Packing Checklist</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Never forget anything at a card show again. Select your role — buying, selling, or both — and check off items as you pack. Includes supplies, tech, cash tips, and pro negotiating advice.
        </p>
      </div>

      <ShowChecklist />

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
