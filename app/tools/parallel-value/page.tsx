import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import ParallelValueCalc from './ParallelValueCalc';

export const metadata: Metadata = {
  title: 'Parallel Value Calculator — Estimate Refractor & Numbered Card Prices',
  description: 'Free parallel value calculator for sports cards and Pokemon. Enter a base card price to estimate refractor, numbered, and 1/1 parallel values across Topps Chrome, Prizm, Select, Optic, Bowman Chrome, and more.',
  openGraph: {
    title: 'Parallel Value Calculator — CardVault',
    description: 'Estimate what refractors, numbered parallels, and 1/1 cards are worth based on the base card price.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Parallel Value Calculator — CardVault',
    description: 'Free tool to estimate parallel and refractor card values across all major brands.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Parallel Value Calculator' },
];

const faqItems = [
  {
    question: 'How much is a refractor worth compared to the base card?',
    answer: 'Refractors typically sell for 2-5x the base card price for common players, and up to 8-10x for star rookies. The exact multiplier depends on the brand, print run, player demand, and whether the card is a rookie, autograph, or patch card. Topps Chrome refractors and Prizm Silver parallels tend to carry the highest premiums relative to their base versions.',
  },
  {
    question: 'What is a 1/1 card worth?',
    answer: 'A 1/1 (one-of-one) card is typically worth 100-500x the base card value for star players, and 50-150x for role players. The exact value depends heavily on the brand, player popularity, and whether it includes an autograph or patch. Topps Chrome Superfractors and Prizm Black 1/1s tend to command the highest premiums.',
  },
  {
    question: 'Do all parallel colors have the same value for the same print run?',
    answer: 'No. Even parallels with identical print runs can have very different values. Visually appealing colors (gold, black) tend to sell for more than less popular colors. Additionally, parallels that match a player team colors often carry a 10-20% premium. The brand recognition also matters — a Prizm Gold /10 typically sells for more than a Mosaic Gold /10.',
  },
  {
    question: 'Are numbered parallels a good investment?',
    answer: 'Numbered parallels under /50 tend to hold value better than higher-print-run parallels because of their scarcity. However, the best investment parallels combine low print runs with high-demand players (star rookies, HOF players) and premium brands (Prizm, Topps Chrome, National Treasures). Always check recent sold data before purchasing.',
  },
  {
    question: 'What is the difference between a refractor and a parallel?',
    answer: 'All refractors are parallels, but not all parallels are refractors. A parallel is any alternate version of a base card (different color, numbering, finish). A refractor specifically refers to a card with a reflective, rainbow-like coating that catches light — a technology pioneered by Topps Chrome in 1996. Prizm Silver cards have a similar reflective effect but are technically called "Prizm" rather than "refractor."',
  },
];

export default function ParallelValuePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Parallel Value Calculator',
        description: 'Estimate the value of refractor, numbered, and 1/1 parallel cards across all major brands including Topps Chrome, Prizm, Select, Optic, Bowman Chrome, Mosaic, Spectra, National Treasures, and Flawless.',
        url: 'https://cardvault-two.vercel.app/tools/parallel-value',
        applicationCategory: 'FinanceApplication',
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
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
          9 Brands &middot; 70+ Parallels &middot; Multiplier Estimates &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Parallel Value Calculator</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Enter a base card&rsquo;s value to estimate what refractors, numbered parallels, and 1/1 versions are worth.
          Covers Topps Chrome, Prizm, Select, Optic, Bowman Chrome, Mosaic, Spectra, National Treasures, and Flawless.
        </p>
      </div>

      <ParallelValueCalc />

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
