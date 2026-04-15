import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import MediaHubClient from './MediaHubClient';

export const metadata: Metadata = {
  title: 'Card Collecting Media Hub — Top Podcasts, YouTube Channels & Creators | CardVault',
  description: 'Discover the best card collecting podcasts, YouTube channels, TikTok creators, and blogs. 50+ curated creators across sports cards, Pokemon, investing, grading, and ripping. Your one-stop directory for hobby media.',
  openGraph: {
    title: 'Card Collecting Media Hub — Podcasts, YouTube & Creators',
    description: '50+ curated card collecting creators: podcasts, YouTube, TikTok, blogs. Find your next favorite hobby content.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Collecting Media Hub — CardVault',
    description: '50+ curated card collecting podcasts, YouTube channels, and creators.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Media Hub' },
];

const faqItems = [
  {
    question: 'What is the CardVault Media Hub?',
    answer: 'The CardVault Media Hub is a curated directory of the best card collecting content creators across all platforms. Browse top YouTube channels, podcasts, TikTok creators, blogs, and newsletters covering sports cards, Pokemon, grading, investing, and ripping. Each listing includes subscriber/follower counts, content focus, and direct links.',
  },
  {
    question: 'How are creators selected for the directory?',
    answer: 'Creators are selected based on content quality, community reputation, posting consistency, and audience engagement. We prioritize creators who provide genuine value to collectors — whether that is market analysis, grading tips, pack opening entertainment, investment education, or community building. The directory is updated regularly as new creators emerge.',
  },
  {
    question: 'What types of card collecting content are covered?',
    answer: 'The directory covers six categories: Market Analysis (price trends, investment strategies), Ripping and Opening (pack breaks, box openings), Grading and Authentication (PSA, BGS, CGC tips), Investing and Flipping (buy-sell strategies, ROI tracking), Community and Culture (hobby news, collector stories), and Education (beginner guides, collecting 101). Each creator is tagged by their primary focus.',
  },
  {
    question: 'Can I suggest a creator for the directory?',
    answer: 'Yes. The Media Hub is continuously expanding. We track emerging creators across all platforms and regularly add new listings. The best card collecting creators combine expertise, entertainment, and genuine passion for the hobby. Community recommendations help surface great creators we might have missed.',
  },
  {
    question: 'Which platform has the best card collecting content?',
    answer: 'YouTube is the leading platform for in-depth card collecting content — long-form reviews, break videos, and market analysis. Podcasts are growing fast for commute-friendly hobby discussion. TikTok leads for quick entertainment and viral pack openings. Blogs and newsletters deliver the most detailed written analysis. Most serious collectors follow creators across multiple platforms.',
  },
];

export default function MediaHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Card Collecting Media Hub — Podcasts, YouTube & Creators',
        description: 'Curated directory of the best card collecting podcasts, YouTube channels, TikTok creators, and blogs.',
        url: 'https://cardvault-two.vercel.app/media-hub',
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
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          Podcasts - YouTube - TikTok - Blogs - Newsletters
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Collecting Media Hub</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Discover the best card collecting content creators across every platform. 50+ curated podcasts, YouTube channels, TikTok accounts, blogs, and newsletters — all in one place.
        </p>
      </div>

      <MediaHubClient />

      {/* FAQ Section */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((item, i) => (
            <details key={i} className="group bg-gray-900/50 border border-gray-800 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium hover:text-rose-400 transition-colors">
                {item.question}
                <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-4">Related</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'News Feed', href: '/news' },
            { label: 'Market Analysis', href: '/market-analysis' },
            { label: 'Creator Widgets', href: '/creators' },
            { label: 'Collector Spotlight', href: '/collector-spotlight' },
            { label: 'Content Calendar', href: '/content-calendar' },
            { label: 'Newsletter', href: '/newsletter' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-300 hover:text-white hover:border-gray-700 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
