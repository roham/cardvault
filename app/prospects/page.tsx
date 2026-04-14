import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ProspectsClient from './ProspectsClient';

export const metadata: Metadata = {
  title: 'Prospect Rankings — Top Rookie Cards to Invest In (2025)',
  description: 'Weekly-updated rankings of the best rookie and prospect cards to buy across baseball, basketball, football, and hockey. Investment thesis, risk levels, and key cards for each prospect.',
  openGraph: {
    title: 'Prospect Rankings — CardVault',
    description: 'Top rookie cards to invest in. Weekly rankings across all sports with investment thesis and risk levels.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Prospect Rankings — CardVault',
    description: 'Weekly rookie card investment rankings. Baseball, basketball, football, hockey.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Prospect Rankings' },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How are prospect rankings determined?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rankings are based on a combination of on-field performance, card market momentum, prospect pedigree (draft position, awards), and future upside. Each prospect gets a composite score weighing these factors.',
      },
    },
    {
      '@type': 'Question',
      name: 'When do rankings update?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Rankings refresh every Monday with new performance data and market price movements from the previous week. Check back weekly for the latest shifts.',
      },
    },
    {
      '@type': 'Question',
      name: 'What do the risk levels mean?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Low risk means established star with strong floor. Medium risk means high-ceiling player with some uncertainty. High risk means boom-or-bust — could 10x or crash. Speculative means very early career with limited data.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I buy all the top-ranked prospects?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Rankings show investment potential, not guarantees. Diversify across sports and risk levels. Never invest more than you can afford to lose. Card markets are volatile.',
      },
    },
  ],
};

export default function ProspectsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Prospect Rankings — Top Rookie Cards to Invest In',
        description: 'Weekly-updated rankings of the best rookie and prospect cards across all major sports.',
        url: 'https://cardvault-two.vercel.app/prospects',
      }} />
      <JsonLd data={faqSchema} />

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-950/60 border border-orange-800/50 text-orange-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          Updated weekly
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Prospect Rankings</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Top rookie and prospect cards to invest in. Ranked by performance, market momentum, and upside.
        </p>
      </div>

      <ProspectsClient />

      {/* Related */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">Related Tools</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/tools/grading-roi" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Grading ROI</h3>
            <p className="text-sm text-gray-400">Should you grade that rookie card?</p>
          </Link>
          <Link href="/tools/price-history" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Price History</h3>
            <p className="text-sm text-gray-400">Track card price trends over time</p>
          </Link>
          <Link href="/market-analysis" className="block p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
            <h3 className="font-semibold text-white">Market Analysis</h3>
            <p className="text-sm text-gray-400">Daily market movers and trends</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
