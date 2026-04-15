import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import GiftPackClient from './GiftPackClient';

export const metadata: Metadata = {
  title: 'Gift Pack — Send Cards to Friends | CardVault',
  description: 'Create and share digital card gift packs with friends. Pick a theme, choose cards, add a personal message, and share via link. Recipients open with a card-by-card reveal animation and add to their binder. Free to create and send.',
  openGraph: {
    title: 'Gift Pack — Send Cards to Friends | CardVault',
    description: 'Create themed digital card gift packs. Birthday, holiday, congrats — pick cards and share via link.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Gift Pack — Send Cards to Friends | CardVault',
    description: 'Create and share digital card gift packs with a personal message.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Gift Pack' },
];

const faqItems = [
  {
    question: 'How do I create a gift pack?',
    answer: 'Pick a theme (Birthday, Holiday, Congrats, Thank You, Welcome, or Surprise), choose your pack size (3, 5, or 7 cards), select cards either randomly or by hand-picking specific ones, add a personal message, and click Create. You get a shareable link that anyone can open.',
  },
  {
    question: 'What happens when someone opens my gift?',
    answer: 'When someone opens your gift pack link, they see your themed message and can reveal cards one by one with an animation. After all cards are revealed, they can add them all to their digital binder with one click. The gift experience is designed to feel like opening a real pack.',
  },
  {
    question: 'Is it free to send gift packs?',
    answer: 'Yes, creating and sending gift packs is completely free. You can create as many as you want. Gift packs are digital — they add cards to the recipient binder, which is a free collecting feature. No real cards or money are exchanged.',
  },
  {
    question: 'Can I hand-pick which cards to include?',
    answer: 'Yes. Choose "Hand-Pick" mode in step 3, then search for specific cards by player name or card name. You can curate the exact cards you want to include, up to your chosen pack size. This is great for themed gifts — like all rookie cards, or all cards from a friend\'s favorite team.',
  },
  {
    question: 'How does the gift link work?',
    answer: 'The gift data is encoded directly in the URL — no account or login required. Anyone with the link can open the gift. The link contains the theme, your message, and the card selections. Share it via text, email, social media, or any messaging app.',
  },
];

export default function GiftPackPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Gift Pack',
        description: 'Create and share digital card gift packs with friends. Themed gifts with personal messages and card-by-card reveals.',
        url: 'https://cardvault-two.vercel.app/gift-pack',
        applicationCategory: 'EntertainmentApplication',
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
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Gift Pack
        </h1>
        <p className="text-gray-400 text-base max-w-xl">
          Create a themed card gift pack and share it with a friend. They get a card-by-card reveal and can add everything to their binder.
        </p>
      </div>

      <GiftPackClient />

      {/* How It Works */}
      <section className="mt-16 bg-gray-900/40 border border-gray-800/30 rounded-2xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-4">How Gift Packs Work</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Pick Theme', desc: 'Choose from Birthday, Holiday, Congrats, Thank You, Welcome, or Surprise themes.' },
            { step: '2', title: 'Choose Cards', desc: 'Random selection or hand-pick specific cards. 3, 5, or 7 card packs.' },
            { step: '3', title: 'Personalize', desc: 'Add your name and a message. Make it special for the recipient.' },
            { step: '4', title: 'Share Link', desc: 'Copy the link and send it. They open, reveal cards, and add to their binder.' },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-700/30 flex items-center justify-center text-emerald-400 font-bold mx-auto mb-3">
                {item.step}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/40 border border-gray-800/30 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium text-sm flex items-center justify-between">
                {item.question}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Cross Links */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/binder" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Digital Binder</h3>
          <p className="text-gray-500 text-xs">View and organize your card collection</p>
        </Link>
        <Link href="/digital-pack" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Daily Digital Pack</h3>
          <p className="text-gray-500 text-xs">5 free cards for your binder every day</p>
        </Link>
        <Link href="/premium-packs" className="bg-gray-900/40 border border-gray-800/30 rounded-xl p-4 hover:border-emerald-700/30 transition-colors">
          <h3 className="text-white font-bold text-sm mb-1">Premium Packs</h3>
          <p className="text-gray-500 text-xs">Themed packs with cooldown timers</p>
        </Link>
      </section>
    </div>
  );
}
