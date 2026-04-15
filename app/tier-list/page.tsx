import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import TierListMaker from './TierListMaker';

export const metadata: Metadata = {
  title: 'Card Tier List Maker — Rank Your Favorite Cards S to F',
  description: 'Create and share your card collecting tier lists. Rank 2024 rookies, GOAT cards, grading companies, and sealed products from S-tier to F-tier. Drag and drop, save your picks, share to X.',
  openGraph: {
    title: 'Card Tier List Maker — CardVault',
    description: 'Rank cards, players, and products from S-tier to F-tier. Share your hot takes with the community.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Tier List Maker — CardVault',
    description: 'Create your own card collecting tier lists. Rank rookies, GOAT cards, grading companies, and more.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tier List Maker' },
];

const faqItems = [
  {
    question: 'How does the tier list maker work?',
    answer: 'Choose a category (2024 rookies, GOAT cards, grading companies, etc.), then drag cards into tiers from S (best) to F (worst). On mobile, hover or tap a card to see quick-place buttons. Your rankings are saved locally so you can come back and adjust them. Share your completed tier list to X or copy it as text.',
  },
  {
    question: 'What do the tiers mean?',
    answer: 'S-tier is the absolute best — cards or items you consider elite with no debate. A-tier is excellent but not quite the pinnacle. B-tier is above average and solid. C-tier is average or middle-of-the-pack. D-tier is below average. F-tier is the worst in the category. Rankings are subjective — there are no wrong answers.',
  },
  {
    question: 'Can I share my tier list with friends?',
    answer: 'Yes. Once you have placed items, use the Copy Tier List button to copy a text version to your clipboard, or Share to X to post your rankings directly to X (formerly Twitter). The shared text includes your tier placements and a link back to the tier list maker.',
  },
];

export default function TierListPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Tier List Maker',
        description: 'Create and share card collecting tier lists. Rank 2024 rookies, GOAT cards across all sports, grading companies, and sealed products from S-tier to F-tier.',
        url: 'https://cardvault-two.vercel.app/tier-list',
        applicationCategory: 'GameApplication',
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
        <div className="inline-flex items-center gap-2 bg-rose-950/60 border border-rose-800/50 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
          7 Categories &middot; Drag &amp; Drop &middot; Shareable &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Tier List Maker</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Rank cards, players, and products from S-tier to F-tier. Choose a category, drag items into tiers,
          and share your hot takes with the collecting community.
        </p>
      </div>

      <TierListMaker />

      {/* FAQ Section */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
        {faqItems.map(f => (
          <div key={f.question} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">{f.question}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
