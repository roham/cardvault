import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import SlabWeightClient from './SlabWeightClient';

export const metadata: Metadata = {
  title: 'Slab Weight Verifier — Authenticate Graded Card Holders | CardVault',
  description: 'Verify graded card slab authenticity by weight. Compare your PSA, BGS, CGC, or SGC holder weight against known ranges for every slab generation. Visual authentication checklist, weight reference table, and expert tips for spotting fake slabs.',
  openGraph: {
    title: 'Slab Weight Verifier — CardVault',
    description: 'Is your graded slab authentic? Check the weight against known ranges for PSA, BGS, CGC, and SGC holders.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Slab Weight Verifier — CardVault',
    description: 'Free slab weight checker for PSA, BGS, CGC, SGC. Authenticate graded card holders by weight.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Slab Weight Verifier' },
];

const faqItems = [
  {
    question: 'Can you authenticate a graded slab by weight alone?',
    answer: 'No. Weight is one useful data point but should never be the sole factor in authenticating a slab. Counterfeiters have become increasingly sophisticated, and some fake holders may fall within the correct weight range. Always combine weight verification with visual inspection of the hologram, label quality, case seam, UV test, and certification number lookup on the grading company\'s official website.',
  },
  {
    question: 'Why do PSA slabs from different eras weigh different amounts?',
    answer: 'PSA has changed their holder design and materials multiple times over the years. The pre-2016 "old" holders used thinner plastic and a different label stock, resulting in lighter slabs (46-52g). The 2016-2020 "vintage" holders were slightly heavier (48-54g), and the current holders introduced in 2020 use a denser plastic compound and updated label, bringing the weight to 50-56g for standard cards.',
  },
  {
    question: 'What scale should I use to weigh graded card slabs?',
    answer: 'Use a digital pocket scale or jewelry scale with at least 0.1g precision and a capacity of at least 200g. These typically cost $10-$20 and are accurate enough for slab verification. Avoid kitchen scales, which usually only measure to the nearest gram and introduce too much error. Calibrate your scale before each use with the included calibration weight for the most accurate results.',
  },
  {
    question: 'Why would a genuine slab weigh more than the expected range?',
    answer: 'The most common reason is card thickness. Relic cards, jersey cards, patch cards, and thick memorabilia inserts add significant weight to the slab. Some vintage cards on thick cardboard stock can also push the weight slightly above the standard range. Additionally, PSA "thick holder" variants accommodate thicker cards and weigh 58-65g compared to the standard 50-56g. Always select the correct slab type when checking weight.',
  },
  {
    question: 'Are BGS slabs heavier than PSA slabs?',
    answer: 'Yes, generally. BGS standard slabs weigh 55-62g compared to PSA\'s current standard of 50-56g. This is because BGS uses a slightly different holder design with more material in the case construction. BGS thick holders for jersey and relic cards are even heavier at 68-78g. The weight difference between companies is one reason it\'s important to select the correct company and holder type when using a weight verification tool.',
  },
];

export default function SlabWeightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Slab Weight Verifier',
        description: 'Verify graded card slab authenticity by weight. Compare PSA, BGS, CGC, and SGC holder weights against known ranges.',
        url: 'https://cardvault-two.vercel.app/tools/slab-weight',
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
          PSA &middot; BGS &middot; CGC &middot; SGC &middot; Weight Auth
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Slab Weight Verifier
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Is your graded slab authentic? Select the grading company and holder type, enter the measured weight,
          and instantly see whether it falls within the expected range. Includes visual authentication checks for every company.
        </p>
      </div>

      <SlabWeightClient />

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
          Explore more: <Link href="/tools/centering-check" className="text-amber-400 hover:underline">Centering Checker</Link>
          {' '}&middot;{' '}
          <Link href="/tools/grade-spread" className="text-amber-400 hover:underline">Grade Price Spread</Link>
          {' '}&middot;{' '}
          <Link href="/tools/grading-roi" className="text-amber-400 hover:underline">Grading ROI</Link>
          {' '}&middot;{' '}
          <Link href="/grading" className="text-amber-400 hover:underline">Grading Company Hub</Link>
          {' '}&middot;{' '}
          <Link href="/tools/photo-grader" className="text-amber-400 hover:underline">Photo Grade Estimator</Link>
        </p>
      </div>
    </div>
  );
}
