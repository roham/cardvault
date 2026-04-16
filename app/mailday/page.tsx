import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MaildayClient from './MaildayClient';

export const metadata: Metadata = {
  title: 'Mailday Live — The Arrivals Feed | CardVault',
  description: 'Live simulated feed of card arrivals — PSA returns, eBay deliveries, card show pickups, break shipments, trade arrivals. Watch hobby mail drop in real time, with real cards, real personas, real reactions.',
  openGraph: {
    title: 'Mailday Live — CardVault',
    description: '8 mail types, 18 collector personas, a new arrival every 5 seconds. The hobby mail moment, streamed.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mailday Live — CardVault',
    description: 'Simulated live arrivals feed — PSA returns, eBay deliveries, break shipments, trade arrivals. Real cards, real reactions.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Live', href: '/live-hub' },
  { label: 'Mailday' },
];

const faqItems = [
  {
    question: 'What is Mailday?',
    answer: 'Mailday is the single best moment in the hobby — the day your graded cards come back, the day your eBay win lands on the porch, the day your break box ships. This feed simulates that moment on loop, pulling real cards from CardVault\'s 9,890+ card database and attaching them to 18 fictional collector personas across 8 mail types.',
  },
  {
    question: 'Is this a real arrivals feed?',
    answer: 'No. Mailday Live is a prototype experience. The collectors are fictional handles, the mail events are simulated every 5 seconds, and reactions come from a curated pool. All card names, values, and sport tags are real data from the CardVault card database, but no one actually received anything. We built this as a way for collectors to feel the cadence of hobby mail without having to wait months for their own submissions.',
  },
  {
    question: 'What are the 8 mail types?',
    answer: 'PSA Return, BGS Return, CGC Return, SGC Return (the four grading company returns, with PSA weighted heaviest at 22% of arrivals reflecting real submission volume); eBay Delivery, Card Show Pickup, Break Shipment, and Trade Arrival. Each has a distinct color, icon, verb phrasing, and reaction pool so you can tell them apart at a glance.',
  },
  {
    question: 'What does the GRAIL badge mean?',
    answer: 'An arrival earns the GRAIL badge if the card value is $1,000+ raw OR if it came back a PSA 10 at $300+ raw. Grails are rare by design — you\'ll see one maybe every 15-20 arrivals. Follow the fuchsia ring around the arrival tile. These are the moments that make the hobby feel magical.',
  },
  {
    question: 'Can I filter the feed?',
    answer: 'Yes. Two filter rails run above the feed — Mail Type (all 8 types plus All) and Sport (baseball, basketball, football, hockey, or All). Use them to narrow the stream to just PSA returns, just football eBay pickups, or whatever slice you care about. Filters are client-side and update instantly without reloading.',
  },
  {
    question: 'Why is this useful?',
    answer: 'Three reasons. One, it helps new collectors understand what "mailday" actually means — what arrives, from where, at what grade, at what value. Two, it gives veteran collectors a vicarious dopamine hit while waiting for their own submissions to return. Three, it provides ambient signal — the mix of grades, sports, and mail types reflects real hobby-traffic patterns and can give you a feel for what\'s circulating.',
  },
];

export default function MaildayPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'CardVault Mailday Live',
        description: 'Live simulated feed of hobby card arrivals — grading returns, eBay deliveries, card show pickups, break shipments, and trade arrivals.',
        url: 'https://cardvault-two.vercel.app/mailday',
        applicationCategory: 'EntertainmentApplication',
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
        <div className="inline-flex items-center gap-2 bg-teal-950/60 border border-teal-800/50 text-teal-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Mailday &middot; Live Arrivals &middot; 8 Mail Types
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Mailday Live — The Arrivals Feed</h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          The single best moment in the hobby, on loop. Watch simulated card arrivals drop in real time —
          PSA returns, eBay deliveries, card show pickups, break shipments, and trade arrivals. Real cards,
          real personas, real reactions. A new arrival every 5 seconds.
        </p>
      </div>

      <MaildayClient />

      <div className="mt-12 bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer text-white font-medium text-sm hover:text-teal-400 transition-colors list-none flex items-center gap-2">
                <span className="text-teal-400/60 group-open:rotate-90 transition-transform">&#9654;</span>
                {faq.question}
              </summary>
              <p className="text-gray-400 text-sm mt-2 ml-5">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>
          Part of the <Link href="/live-hub" className="text-teal-400 hover:underline">CardVault Live</Link> experience.
          See also: <Link href="/breakers-lounge" className="text-teal-400 hover:underline">Breakers Lounge</Link>,{' '}
          <Link href="/live-rip-feed" className="text-teal-400 hover:underline">Live Rip Feed</Link>,{' '}
          <Link href="/grading-feed" className="text-teal-400 hover:underline">Grading Results Feed</Link>,{' '}
          <Link href="/community-pulse" className="text-teal-400 hover:underline">Community Pulse</Link>,{' '}
          <Link href="/market-chat" className="text-teal-400 hover:underline">Market Chat</Link>,{' '}
          <Link href="/card-wire" className="text-teal-400 hover:underline">Card Wire</Link>.
        </p>
      </div>
    </div>
  );
}
