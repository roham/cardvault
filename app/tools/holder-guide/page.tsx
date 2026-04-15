import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import HolderGuide from './HolderGuide';

export const metadata: Metadata = {
  title: 'Card Holder & Sleeve Size Guide — What Size Do I Need?',
  description: 'Free card holder size guide. Find the exact penny sleeve, top loader, one-touch, and magnetic holder size for any card — standard, jersey/relic, patch, booklet, and vintage. Covers Ultra Pro, BCW, and more.',
  openGraph: {
    title: 'Card Holder & Sleeve Size Guide — CardVault',
    description: 'Find the exact holder, sleeve, and top loader size for any sports or Pokemon card.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Holder & Sleeve Size Guide — CardVault',
    description: 'What size one-touch or top loader do I need? Free interactive guide.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Holder Size Guide' },
];

const faqItems = [
  {
    question: 'What size top loader do I need for a standard card?',
    answer: 'Standard sports cards and Pokemon cards (2.5" x 3.5", ~20pt thickness) fit in a standard 3" x 4" top loader (35pt). Always put the card in a penny sleeve first, then slide it into the top loader. This is the most common combination and works for 90%+ of modern base cards.',
  },
  {
    question: 'What size one-touch holder do I need for a jersey/relic card?',
    answer: 'Jersey and relic cards are typically 55pt-130pt thick depending on the patch size. Most single-swatch jersey cards fit a 55pt or 75pt one-touch. Multi-swatch or thick patch cards may need 100pt or 130pt. When in doubt, go one size up — a slightly loose fit is better than forcing a card into a holder that is too tight.',
  },
  {
    question: 'Do I need a penny sleeve inside a one-touch or magnetic holder?',
    answer: 'Yes, always use a penny sleeve (or a fitted sleeve for thicker cards) inside magnetic holders and one-touch cases. The sleeve prevents the card surface from touching the hard plastic directly, which can cause scratches or surface wear over time. This is especially important for cards you plan to grade.',
  },
  {
    question: 'What size holder do I need for a booklet card?',
    answer: 'Booklet cards (which fold open) require specialty holders. A standard booklet card (5" x 3.5" when open) fits a booklet one-touch or booklet magnetic holder. Panini Flawless booklets may need an oversized booklet holder. Always measure before buying — booklet sizes vary significantly between manufacturers.',
  },
  {
    question: 'How do I measure card thickness in points (pt)?',
    answer: 'Card thickness is measured in "points" where 1 point = 1/1000 of an inch. A standard card is about 20pt (0.020"). You can measure with a digital caliper, or use the rule of thumb: if you can easily bend it, it is around 20pt (standard). If it feels noticeably thicker, it is likely 55-75pt (jersey). If it barely bends, it is 100pt+ (thick patch/relic). Card thickness determines which holder size you need.',
  },
];

export default function HolderGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Holder & Sleeve Size Guide',
        description: 'Find the exact holder, sleeve, top loader, and one-touch size for any sports or Pokemon card.',
        url: 'https://cardvault-two.vercel.app/tools/holder-guide',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Sleeves &middot; Top Loaders &middot; One-Touch &middot; Magnetic &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Holder & Sleeve Size Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Find the exact sleeve, top loader, one-touch, and magnetic holder size for any card. Select your card type or enter thickness — get the right holder every time.
        </p>
      </div>

      <HolderGuide />

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2">{f.question}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="mt-12 pt-8 border-t border-gray-800">
        <h2 className="text-lg font-semibold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/tools/storage-calc', label: 'Storage & Supplies Calculator', desc: 'Full supply shopping list for your collection' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Grade your card before submitting' },
            { href: '/tools/submission-planner', label: 'Grading Submission Planner', desc: 'Compare grading companies and tiers' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="block bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-700/50 transition-colors">
              <span className="text-white font-medium text-sm">{t.label}</span>
              <span className="block text-gray-500 text-xs mt-1">{t.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
