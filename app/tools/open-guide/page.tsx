import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import OpenGuideClient from './OpenGuideClient';

export const metadata: Metadata = {
  title: 'What Should I Open? — Sealed Product Recommender',
  description: 'Get personalized sealed product recommendations based on your budget, sport preference, and collecting goals. Compare hobby boxes, blasters, and ETBs with EV analysis.',
  openGraph: {
    title: 'What Should I Open? — CardVault Product Recommender',
    description: 'Find the best sealed product for you. Personalized recommendations with EV analysis.',
    type: 'website',
  },
  alternates: { canonical: './' },
};

export default function OpenGuidePage() {
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Tools', href: '/tools' },
    { label: 'What Should I Open?' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumb items={crumbs} />

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'What Should I Open? — Sealed Product Recommender',
          url: 'https://cardvault-two.vercel.app/tools/open-guide',
          applicationCategory: 'UtilityApplication',
          description: 'Personalized sealed product recommendations based on budget, sport, and collecting goals.',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }} />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            What Should I Open?
          </h1>
          <p className="text-gray-400 text-lg">
            Answer 4 quick questions and get personalized sealed product recommendations with EV analysis.
            We compare 58 products across baseball, basketball, football, hockey, and Pokemon.
          </p>
        </div>

        <OpenGuideClient />

        {/* Related Tools */}
        <section className="mt-12 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-lg font-bold mb-3">Related Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/products" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Product Encyclopedia</div>
              <div className="text-xs text-gray-500">Browse all 58 products</div>
            </Link>
            <Link href="/tools/sealed-ev" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Sealed EV Calculator</div>
              <div className="text-xs text-gray-500">Deep EV analysis</div>
            </Link>
            <Link href="/tools/pack-sim" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Pack Simulator</div>
              <div className="text-xs text-gray-500">Virtual rip before you buy</div>
            </Link>
            <Link href="/tools/quiz" className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
              <div className="text-sm font-medium text-blue-400">Collector Type Quiz</div>
              <div className="text-xs text-gray-500">Find your collecting style</div>
            </Link>
          </div>
        </section>

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is the best sealed product to open for value?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'The best product depends on your budget and sport preference. Use our recommender tool above to get personalized suggestions based on expected value analysis of 58 sealed products.',
              },
            },
            {
              '@type': 'Question',
              name: 'Should I buy hobby boxes or blasters?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Hobby boxes guarantee premium hits (autographs, memorabilia) and have higher EV, but cost more ($120-$900). Blasters ($25-$40) are accessible and fun with exclusive parallels. Beginners should start with blasters or ETBs.',
              },
            },
            {
              '@type': 'Question',
              name: 'How many products does the recommender analyze?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Our recommender analyzes 58 sealed products across baseball, basketball, football, hockey, and Pokemon. Products range from $15 hanger packs to $2,500 premium hobby boxes.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is opening sealed product a good investment?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Opening sealed product is gambling — most boxes have negative expected value, meaning you will lose money on average. Buy for the experience, not as an investment. Only spend what you can afford to lose.',
              },
            },
          ],
        }} />
      </div>
    </div>
  );
}
