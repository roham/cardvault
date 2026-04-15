import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import CertCheck from './CertCheck';

export const metadata: Metadata = {
  title: 'PSA Cert Number Verifier — Check Any PSA Certification',
  description: 'Free PSA cert number checker. Verify any PSA certification number, identify the grading era, spot fake slabs, and learn about cert number ranges for PSA, BGS, CGC, and SGC.',
  openGraph: {
    title: 'PSA Cert Number Verifier — CardVault',
    description: 'Verify PSA certification numbers and spot fake graded cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PSA Cert Number Verifier — CardVault',
    description: 'Check any PSA cert number. Spot fakes. Free tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'PSA Cert Verifier' },
];

const faqItems = [
  {
    question: 'Where do I find the PSA certification number on a slab?',
    answer: 'The PSA cert number is the 8-digit number located on the front label of the slab, typically below the barcode. It is also printed on the back of newer PSA slabs. You can enter this number at psacard.com/cert to verify the card details.',
  },
  {
    question: 'How can I tell if a PSA slab is fake?',
    answer: 'Check these things: (1) Verify the cert number at psacard.com — if it does not exist, it is fake. (2) Compare the label font and colors to known authentic examples. (3) Check the hologram shifts colors when tilted. (4) Scan the QR code — it should link to the correct cert page. (5) The case should feel solid and rigid, not lightweight or flimsy.',
  },
  {
    question: 'What do PSA cert number ranges tell you?',
    answer: 'PSA cert numbers are assigned sequentially, so the number tells you approximately when the card was graded. Numbers under 10 million are from the 1990s (early PSA). Numbers 10-30 million are from the 2000s. Numbers 30-60 million are from 2009-2019. Numbers above 60 million are from the COVID boom era (2020+). This helps verify that the label era matches the cert range.',
  },
  {
    question: 'Can I verify BGS, CGC, or SGC cert numbers too?',
    answer: 'Yes, each grading company has their own verification website. BGS uses 10-digit numbers (verify at beckett.com). CGC Cards uses 10-digit numbers (verify at cgccards.com). SGC uses 7-digit numbers (verify at gosgc.com). The cert format differs between companies, so the number length alone can tell you which company graded the card.',
  },
  {
    question: 'What is a PSA label swap and how do I detect it?',
    answer: 'A label swap is when someone replaces the label on a PSA slab with a different label showing a higher grade. To detect this: verify the cert number online and compare the grade shown on the website with the grade on the physical label. If they do not match, the label has been swapped. Also check that the card description (year, set, player, card number) matches exactly.',
  },
];

export default function CertCheckPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'PSA Cert Number Verifier',
        description: 'Verify PSA certification numbers, identify grading era, and spot fake slabs.',
        url: 'https://cardvault-two.vercel.app/tools/cert-check',
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
          PSA &middot; BGS &middot; CGC &middot; SGC &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">PSA Cert Number Verifier</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Enter any PSA certification number to verify its format, identify the grading era, and get tips on spotting fake slabs. Links directly to PSA for official verification.
        </p>
      </div>

      <CertCheck />

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
            { href: '/tools/auth-check', label: 'Authentication Checker', desc: '12-point inspection for raw cards' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter', desc: 'PSA/BGS/CGC/SGC grade equivalents' },
            { href: '/tools/pop-report', label: 'Population Report', desc: 'Estimated grade distribution' },
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
