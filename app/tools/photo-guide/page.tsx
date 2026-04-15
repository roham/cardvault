import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import PhotoGuideClient from './PhotoGuideClient';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Card Photography Guide — How to Photograph Sports Cards for eBay & COMC',
  description: 'Free interactive guide to photographing sports cards for selling on eBay, COMC, and social media. Lighting setups, photo checklists, platform requirements, and common mistakes to avoid.',
  openGraph: {
    title: 'Card Photography Guide — CardVault',
    description: 'Learn how to photograph sports cards like a pro. Lighting setups, checklists, platform requirements, and tips for selling on eBay, COMC, and social media.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Photography Guide — CardVault',
    description: 'Interactive guide to photographing sports cards for selling. Lighting setups, checklists, and platform requirements.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Card Photography Guide' },
];

const faqItems = [
  {
    question: 'What is the best background for photographing sports cards?',
    answer: 'Black felt or microfiber cloth is the best all-around background for sports card photography. It absorbs light to prevent reflections, creates strong contrast with card edges, and hides imperfections. For dark-bordered cards, switch to a white background. Avoid textured or patterned surfaces as they distract from the card.',
  },
  {
    question: 'How do I avoid glare when photographing graded slabs?',
    answer: 'The number one trick is to angle the slab about 5-10 degrees instead of shooting perfectly straight on. Use diffused lighting from two sides rather than direct overhead light. If using natural light, position near a window with a white curtain as a diffuser. Never use direct flash — it creates a hot spot right in the center of the slab.',
  },
  {
    question: 'What resolution do eBay photos need to be?',
    answer: 'eBay requires a minimum of 500 pixels on the longest side, but recommends at least 1600x1200 pixels for best results. Higher resolution photos allow buyers to zoom in and see card details, which builds trust and reduces returns. Most modern smartphones easily exceed this requirement. You can upload up to 12 photos per listing for free.',
  },
  {
    question: 'Do I need expensive equipment to photograph cards?',
    answer: 'No. A modern smartphone camera and natural window light can produce excellent card photos. The key is technique: steady hands or a phone stand, consistent lighting, clean backgrounds, and proper framing. A $20-30 phone tripod and a $5 sheet of black felt are the only purchases most sellers need to dramatically improve their photos.',
  },
  {
    question: 'How many photos should I take of each card for selling?',
    answer: 'For raw singles, take at least 5 photos: front, back, and close-ups of corners, centering, and edges. For graded slabs, capture 4 photos minimum: front showing the grade, back showing the cert number, an angle shot showing thickness, and a close-up of the label. More photos build buyer confidence and reduce returns and disputes.',
  },
];

export default function PhotoGuidePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Photography Guide',
        description: 'Interactive guide to photographing sports cards for selling on eBay, COMC, and social media. Lighting setups, checklists, and platform-specific requirements.',
        url: 'https://cardvault-two.vercel.app/tools/photo-guide',
        applicationCategory: 'UtilityApplication',
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
          Lighting &middot; Checklists &middot; Platform Tips &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Card Photography Guide</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Take better card photos that sell faster. Interactive checklists, lighting setup guides, and platform-specific requirements for eBay, COMC, Instagram, and Facebook Marketplace.
        </p>
      </div>

      <PhotoGuideClient />

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
      <section className="mt-12 border-t border-gray-800 pt-10">
        <h3 className="text-white font-semibold mb-4">Related Tools</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/tools/listing-generator', label: 'eBay Listing Generator', icon: '📝' },
            { href: '/tools/flip-calc', label: 'Flip Profit Calculator', icon: '💸' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', icon: '🔬' },
            { href: '/tools/auth-check', label: 'Authentication Checker', icon: '🔐' },
            { href: '/tools/dealer-scanner', label: 'Dealer Scanner', icon: '📱' },
          ].map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-xl text-sm font-medium px-4 py-2 transition-colors"
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
