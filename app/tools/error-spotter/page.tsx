import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorSpotterClient from './ErrorSpotterClient';

export const metadata: Metadata = {
  title: 'Card Error & Variation Spotter — Identify Valuable Errors | CardVault',
  description: 'Free card error identification guide. Learn to spot valuable printing errors, factory mistakes, short prints, and photo variations. 12 error types with detection tips, famous examples, and value premiums. Covers vintage through ultra-modern eras.',
  alternates: { canonical: './' },
  openGraph: {
    title: 'Card Error & Variation Spotter — Identify Valuable Errors | CardVault',
    description: 'Is your card an error? Identify valuable printing errors, factory mistakes, and variations with our free guide.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Error & Variation Spotter — CardVault',
    description: 'Spot valuable card errors and variations. Free identification guide.',
  },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Error & Variation Spotter' },
];

const faqItems = [
  {
    question: 'How do I know if my card has a valuable error?',
    answer: 'Start by comparing your card carefully with a known correct copy of the same card. Look for differences in the image, text, foil placement, cutting, and back printing. Common valuable errors include wrong backs (different player stats on back), missing foil stamps, No Name on Front (NNOF) errors, and extreme miscuts showing adjacent cards. Most importantly, research the specific error online — known errors are well-documented by the collector community.',
  },
  {
    question: 'Are all card errors valuable?',
    answer: 'No. Most card errors actually decrease value rather than increase it. Minor off-center cuts, small ink spots, and tiny printing imperfections are manufacturing variance, not collectible errors. The errors that command premiums are typically dramatic (like completely missing text or wrong photos), well-documented, and affect star players. A printing error on a common player\'s card has much less value than the same error on a Hall of Famer.',
  },
  {
    question: 'What is the difference between an SP and an SSP?',
    answer: 'SP (Short Print) and SSP (Super Short Print) refer to cards intentionally printed in lower quantities than the standard base set. SPs are typically printed at 1:3 to 1:10 ratio compared to base cards, while SSPs can be 1:50 to 1:100 or rarer. In Topps products, you can identify SPs by the code on the back of the card — SP variants have a longer code than base cards. Photo variations are the most common type of SP/SSP.',
  },
  {
    question: 'How can I tell if a card error is real or fake?',
    answer: 'Genuine errors are consistent across every copy of that card from the same print run — they are machine-produced defects. If an error appears hand-altered (uneven edges, surface disturbance visible under magnification), it is likely fake. Research the error online before buying. Known errors are documented in collector databases (Beckett, TCDB). Be especially skeptical of "one-of-a-kind" errors that have no documentation.',
  },
  {
    question: 'Do grading companies grade error cards?',
    answer: 'Yes. PSA, BGS, CGC, and SGC all grade error cards. PSA will often note the error on the label (e.g., "Wrong Back" or "NNOF"). The grade reflects the card\'s physical condition, not the error itself. Graded error cards command higher premiums because the slab provides authentication that the error is genuine and not post-production alteration.',
  },
];

export default function ErrorSpotterPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Error & Variation Spotter',
        description: 'Free card error identification guide. Spot valuable printing errors, factory mistakes, short prints, and photo variations.',
        url: 'https://cardvault-two.vercel.app/tools/error-spotter',
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

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          12 Error Types &bull; 4 Eras &bull; Detection Tips &bull; Famous Examples &bull; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
          Card Error &amp; Variation Spotter
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Is your card worth more than you think? Learn to identify valuable printing errors, factory mistakes, short prints, and photo variations across every era of card collecting.
        </p>
      </div>

      <ErrorSpotterClient />

      {/* FAQ Section */}
      <div className="mt-12 border-t border-slate-800 pt-10">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/tools" className="text-indigo-400 hover:text-indigo-300 text-sm">
          &larr; Back to All Tools
        </Link>
      </div>
    </div>
  );
}