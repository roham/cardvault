import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CenteringCheckClient from './CenteringCheckClient';

export const metadata: Metadata = {
  title: 'Card Centering Checker — PSA Centering Grade Estimator | CardVault',
  description: 'Check your sports card centering before grading. Adjust left/right and top/bottom percentages to see estimated PSA, BGS, and CGC centering grades. Visual card preview, grade impact analysis, and value recommendations. Free centering tool for card collectors.',
  openGraph: {
    title: 'Card Centering Checker — CardVault',
    description: 'Will your card\'s centering pass PSA 10? Check your centering ratio and see grade estimates across all companies.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Centering Checker — CardVault',
    description: 'Free centering grade estimator for PSA, BGS, CGC. Visual preview and value tips.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Centering Checker' },
];

const faqItems = [
  {
    question: 'What centering ratio does PSA require for a PSA 10?',
    answer: 'PSA requires centering of approximately 60/40 or better (on both left/right and top/bottom) for a PSA 10 Gem Mint grade. This means the border on one side can be at most 1.5x the border on the opposite side. Anything worse than 60/40 will typically cap the card at PSA 9 regardless of the condition of the corners, edges, and surface.',
  },
  {
    question: 'How does BGS handle centering differently than PSA?',
    answer: 'BGS (Beckett Grading Services) gives centering its own separate subgrade from 1 to 10. This means a card with 9.5 corners, 9.5 edges, 9.5 surface, but 8.5 centering would get a BGS 9.5 overall rather than being completely capped by centering. This makes BGS a better choice for cards with good condition but slightly off centering.',
  },
  {
    question: 'Is left/right centering more important than top/bottom?',
    answer: 'Yes, most grading companies weight left/right centering more heavily than top/bottom. Left/right off-centering is more visually noticeable because the eye naturally compares the two sides. A card with 55/45 left/right and 60/40 top/bottom would likely grade higher than one with 60/40 left/right and 55/45 top/bottom.',
  },
  {
    question: 'How do I accurately measure my card centering?',
    answer: 'Use a millimeter ruler to measure the border on all four sides. Divide each side\'s measurement by the total of both sides (left + right, or top + bottom) to get the percentage. For example, if the left border is 2mm and the right border is 3mm, the centering is 40/60 (2/(2+3) = 40%). Phone apps like PSA Scanner and Centering Check can help with quick estimates using your camera.',
  },
  {
    question: 'Do vintage cards have different centering standards?',
    answer: 'Vintage cards (generally pre-1980) are typically graded with more lenient centering standards because printing technology was less precise. A 1952 Topps card with 65/35 centering might still qualify for higher grades than a 2024 card with the same centering. Graders understand that truly well-centered vintage cards are exceptionally rare, and the market values them accordingly.',
  },
];

export default function CenteringCheckPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Centering Checker',
        description: 'Check your sports card centering before grading. PSA, BGS, and CGC centering grade estimates.',
        url: 'https://cardvault-two.vercel.app/tools/centering-check',
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
        <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          PSA &middot; BGS &middot; CGC &middot; Visual Preview
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Centering Checker
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Will your card&apos;s centering pass for PSA 10? Adjust the sliders to match your card&apos;s borders
          and instantly see centering grades across PSA, BGS, and CGC with value recommendations.
        </p>
      </div>

      <CenteringCheckClient />

      {/* FAQ Section */}
      <div className="mt-16 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Pages */}
      <div className="mt-12 border-t border-zinc-800 pt-8">
        <p className="text-sm text-zinc-500">
          Explore more: <Link href="/tools/grade-spread" className="text-amber-400 hover:underline">Grade Price Spread</Link>
          {' '}&middot;{' '}
          <Link href="/tools/grading-roi" className="text-amber-400 hover:underline">Grading ROI</Link>
          {' '}&middot;{' '}
          <Link href="/tools/pop-report" className="text-amber-400 hover:underline">Pop Report Lookup</Link>
          {' '}&middot;{' '}
          <Link href="/grading" className="text-amber-400 hover:underline">Grading Company Hub</Link>
          {' '}&middot;{' '}
          <Link href="/tools/photo-grader" className="text-amber-400 hover:underline">Photo Grade Estimator</Link>
        </p>
      </div>
    </div>
  );
}
