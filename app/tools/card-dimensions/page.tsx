import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CardDimensions from './CardDimensions';

export const metadata: Metadata = {
  title: 'Card Size & Dimensions Guide — Every Era, Every Format',
  description: 'Free interactive guide to sports and Pokemon card dimensions by era. Exact measurements for T206 Tobacco (1.4375" x 2.625"), 1933 Goudey (2.375" x 2.875"), 1952 Topps (2.625" x 3.75"), modern standard (2.5" x 3.5"), minis, oversized, and more. Matches each format to the right sleeve, top loader, and binder page.',
  openGraph: {
    title: 'Card Size & Dimensions Guide — CardVault',
    description: 'Exact card dimensions for every era — T206 tobacco, 1933 Goudey, 1952 Topps, modern, minis, oversized. Find the right sleeve and holder for any vintage or modern card.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Size Guide — Every Era | CardVault',
    description: 'Vintage card dimensions decoded. Find the right sleeve and top loader for any format.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Dimensions Guide' },
];

const faqItems = [
  {
    question: 'What size is a standard modern sports card?',
    answer: 'The modern standard is 2.5" x 3.5" (63.5mm x 88.9mm). This has been the industry standard since 1957 Topps. All modern Topps, Panini, Upper Deck, Bowman, Pokemon, and most TCG cards use this size. A standard Ultra Pro penny sleeve and a 35pt 3" x 4" top loader fit perfectly.',
  },
  {
    question: 'What size are T206 tobacco cards from 1909?',
    answer: 'T206 and most early tobacco cards (1909-1915) measure 1.4375" x 2.625" — significantly narrower than modern cards. Standard modern sleeves are too wide. Use dedicated tobacco-era sleeves (typically 1.75" x 3") from BCW or similar, or a snug semi-rigid holder for PSA submission.',
  },
  {
    question: 'What size are 1933 Goudey and 1930s gum cards?',
    answer: '1933 Goudey, 1934 Goudey, 1934-1936 Diamond Stars, and most 1930s gum cards measure 2.375" x 2.875". They are slightly shorter than modern cards but wider than tobacco. Dedicated Goudey-size sleeves and top loaders exist. A standard modern top loader will hold the card but it will slide around.',
  },
  {
    question: 'What size are 1952 Topps baseball cards?',
    answer: '1952 through 1956 Topps baseball cards are 2.625" x 3.75" — noticeably larger than modern cards. These are called "vintage large" and require specialty sleeves (typically 2.75" x 4") and oversized vintage top loaders. Standard modern holders will not fit — a 1952 Topps Mickey Mantle will not close in a modern one-touch.',
  },
  {
    question: 'Are Japanese Pokemon cards the same size as English?',
    answer: 'No. Japanese Pokemon cards are slightly smaller — typically 2.48" x 3.46" (63mm x 88mm) vs English at 2.5" x 3.5". The difference is small but real, and English-size sleeves are too loose on Japanese cards. Use Japanese-size "Perfect Fit" or small-size sleeves for JP cards. Yu-Gi-Oh cards also use the Japanese size.',
  },
  {
    question: 'What size is a 1975 Topps Mini card?',
    answer: '1975 Topps Mini cards measure 2.125" x 3" — about 85% of the normal 1975 Topps size. Modern minis (like Allen & Ginter Mini from 2006+) are 1.75" x 2.75". Both require specialty mini-size sleeves and mini top loaders. Do not try to fit minis into a standard top loader — they will move around and damage easily.',
  },
  {
    question: 'How do I measure a card I am not sure about?',
    answer: 'Use a ruler marked in 1/16" or millimeters. Measure the outer edge of the cardboard (not the printed design). Record width x height. Compare to the formats in this guide. For grading purposes, always measure before submitting — most graders expect standard-size cards and require specialty handling for non-standard sizes. If your card is within 1/32" of a listed format, treat it as that format.',
  },
  {
    question: 'Do binder pages fit every card size?',
    answer: 'No. Standard 9-pocket binder pages are designed for 2.5" x 3.5" cards. Tobacco cards will slide around inside standard pockets. 1952 Topps will not fit at all. Specialty binder pages exist: 12-pocket for tobacco, 9-pocket vintage (slightly wider) for 1930s Goudey, 4-pocket or 2-pocket for oversized. Pick pages to match your card format.',
  },
];
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map(f => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function CardDimensionsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Breadcrumb items={breadcrumbs} />
      <JsonLd data={faqSchema} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-4 border border-cyan-500/20">
            📏 REFERENCE TOOL
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
            Card Dimensions Guide
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl">
            Every major card format from 1887 tobacco to 2026 modern — exact dimensions, sleeve fit, top loader size, and binder page compatibility. The vintage card size decoder.
          </p>
        </div>

        <CardDimensions />

        <div className="mt-12 space-y-8">
          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">How Card Dimensions Evolved</h2>
            <div className="space-y-3 text-gray-300 text-sm sm:text-base leading-relaxed">
              <p>
                The modern 2.5" x 3.5" standard was not always the default. Early tobacco cards from 1887-1915 were tiny (1.4" x 2.6") because they fit inside cigarette packs. When gum companies took over in the 1930s, Goudey grew cards to 2.375" x 2.875" to show larger player photos. Topps went even bigger in 1952 with a 2.625" x 3.75" format that many consider the "perfect" baseball card size.
              </p>
              <p>
                In 1957, Topps shrank their cards to 2.5" x 3.5" to save production costs. Every other major manufacturer followed. The modern standard has held for nearly 70 years — all Panini, Upper Deck, Bowman, Pokemon, Magic, and Yu-Gi-Oh cards use this size today (with Japanese TCG sizes being slightly smaller at roughly 2.48" x 3.46").
              </p>
              <p>
                Specialty sizes still exist: minis (1.75" x 2.75" for Allen &amp; Ginter retro inserts), panoramic cards (2.5" x 5.25" for modern inserts), and oversized box toppers (5" x 7" and larger). Knowing your format matters for sleeves, top loaders, binder pages, and grading submissions — graders charge more for non-standard sizes.
              </p>
            </div>
          </section>

          <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((f, i) => (
                <details key={i} className="group bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/40 transition-colors">
                  <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-4">
                    <span>{f.question}</span>
                    <span className="text-cyan-400 text-sm mt-0.5 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/tools/holder-guide" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">📏</span>
                <div>
                  <div className="font-semibold text-white text-sm">Holder Size Guide</div>
                  <div className="text-xs text-gray-400">Find the right thickness (pt) holder</div>
                </div>
              </Link>
              <Link href="/tools/storage-calc" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">📦</span>
                <div>
                  <div className="font-semibold text-white text-sm">Storage &amp; Supplies</div>
                  <div className="text-xs text-gray-400">Supply shopping list by collection size</div>
                </div>
              </Link>
              <Link href="/tools/centering-calc" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">📐</span>
                <div>
                  <div className="font-semibold text-white text-sm">Centering Calculator</div>
                  <div className="text-xs text-gray-400">Measure border % for grading</div>
                </div>
              </Link>
              <Link href="/tools/era-guide" className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-cyan-500/40 transition-colors">
                <span className="text-2xl">📜</span>
                <div>
                  <div className="font-semibold text-white text-sm">Era Guide</div>
                  <div className="text-xs text-gray-400">Historical context by era</div>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
