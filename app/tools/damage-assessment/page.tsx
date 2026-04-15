import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DamageAssessment from './DamageAssessment';

export const metadata: Metadata = {
  title: 'Card Damage Assessment Tool — How Much Does Damage Cost You?',
  description: 'Free card damage assessment tool. Rate card defects like creases, scratches, staining, and corner wear to estimate grade impact and value reduction. Know what a damaged card is really worth.',
  openGraph: {
    title: 'Card Damage Assessment Tool — CardVault',
    description: 'Assess card damage severity and its impact on grade and value. Free tool for collectors.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Damage Assessment Tool — CardVault',
    description: 'How much does damage cost? Assess card defects and estimate value impact.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Damage Assessment' },
];

const faqItems = [
  {
    question: 'How does card damage affect the grade?',
    answer: 'Each type of damage has a different severity impact on the final PSA/BGS grade. Creases are the most damaging defect and will drop a card to PSA 1-4 depending on severity. Surface scratches typically cap a card at PSA 6-8. Corner wear is the most common defect and ranges from minor (PSA 8) to heavy (PSA 4). Staining, print defects, and edge wear each have their own grade impact ranges.',
  },
  {
    question: 'Should I buy damaged cards at a discount?',
    answer: 'Damaged cards can be good value if the discount matches the grade impact. A card with minor corner wear (PSA 7-8 range) at 40-60% of mint value can be a smart buy for personal collections. However, heavily damaged cards (PSA 1-3) are typically only valuable for iconic vintage cards where any example has collector demand.',
  },
  {
    question: 'Can damaged cards still be graded?',
    answer: 'Yes. Grading companies will grade any card regardless of condition. The grade simply reflects the current state. Some collectors prefer graded damaged cards because the slab protects from further damage and provides authentication. An "Authentic" or low-grade slab can still be valuable for key vintage cards.',
  },
  {
    question: 'What damage is most common in vintage cards?',
    answer: 'Vintage cards (pre-1980) most commonly have: rounded corners from handling, wax staining from pack storage, centering issues from old printing technology, and surface creases from being stored in rubber bands or shoeboxes. These defects are expected and priced into the vintage market.',
  },
  {
    question: 'How do I describe damage when selling?',
    answer: 'Be specific and honest. Use standard terms: crease (visible fold line), ding (small surface impact), surface scratch (visible line on surface), staining (discoloration), whitening (white marks on colored borders), and corner wear (rounded or soft corners). Include close-up photos of all defects. Undisclosed damage leads to returns and negative feedback.',
  },
];

export default function DamageAssessmentPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Damage Assessment Tool',
        description: 'Assess card damage and estimate grade impact and value reduction. Rate defects like creases, scratches, and corner wear.',
        url: 'https://cardvault-two.vercel.app/tools/damage-assessment',
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
        <div className="inline-flex items-center gap-2 bg-red-950/60 border border-red-800/50 text-red-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          8 Defect Types &middot; Grade Impact &middot; Value Reduction &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Damage Assessment Tool
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Rate the damage on any card and see how it affects the grade and value. Know exactly what a damaged card is worth before buying or selling.
        </p>
      </div>

      <DamageAssessment />

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-red-400 transition-colors list-none flex justify-between items-center">
                {faq.question}
                <span className="text-gray-500 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/condition-grader', label: 'Condition Self-Grader', desc: 'Step-by-step condition assessment' },
            { href: '/tools/photo-grade-estimator', label: 'Photo Grade Estimator', desc: 'Quick visual grade estimate' },
            { href: '/tools/grade-value-chart', label: 'Grade Value Chart', desc: 'Value at every grade level' },
            { href: '/tools/grading-probability', label: 'Grading Probability', desc: 'Grade probability distribution' },
          ].map(tool => (
            <a key={tool.href} href={tool.href} className="block p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition-colors">
              <div className="text-white text-sm font-medium">{tool.label}</div>
              <div className="text-gray-500 text-xs mt-1">{tool.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
