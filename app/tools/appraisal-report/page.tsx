import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import AppraisalReport from './AppraisalReport';

export const metadata: Metadata = {
  title: 'Card Appraisal Report Generator — Free Printable Collection Valuation',
  description: 'Generate a professional card collection appraisal report for insurance, estate planning, or consignment. Search 5,500+ cards, set grades, add custom items. Printable PDF-style format with total valuation.',
  openGraph: {
    title: 'Card Appraisal Report Generator — CardVault',
    description: 'Free professional appraisal reports for card collections. Insurance, estates, consignment.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Card Appraisal Report Generator — CardVault',
    description: 'Generate a printable card collection appraisal. Free and professional.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Appraisal Report' },
];

const faqItems = [
  {
    question: 'What is a card collection appraisal?',
    answer: 'A card collection appraisal is a document that lists every card in a collection along with its estimated market value. Appraisals are used for insurance coverage, estate planning, divorce settlements, consignment agreements, and tax deductions for charitable donations. This tool generates a professional-format appraisal you can print or save.',
  },
  {
    question: 'Is this appraisal legally valid for insurance?',
    answer: 'This tool generates an estimated market valuation based on recent comparable sales data. Most insurance companies accept self-prepared inventories for collections under $50,000. For high-value collections or legal disputes, we recommend having a certified appraiser (such as through the American Society of Appraisers) review and sign the report. Our tool gives you a strong starting document.',
  },
  {
    question: 'How are the card values determined?',
    answer: 'Values are based on recent eBay sold listings, auction house results, and dealer pricing data. We provide estimates for both raw (ungraded) and graded conditions. Always verify high-value cards with recent comparable sales before submitting to an insurance company.',
  },
  {
    question: 'Can I add cards not in the database?',
    answer: 'Yes. Use the custom entry option to add any card with a manual name, year, and value. This is useful for autographed cards, one-of-one parallels, vintage cards, or non-sports cards that may not be in our database.',
  },
  {
    question: 'How should I document condition for insurance?',
    answer: 'For graded cards, list the exact grade (e.g., PSA 9, BGS 9.5). For raw cards, use standard condition grades: Mint, Near Mint, Excellent, Very Good, Good, Fair, Poor. The more specific your condition notes, the stronger your insurance claim will be if you need to file one.',
  },
];

export default function AppraisalReportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Card Appraisal Report Generator',
        description: 'Generate professional card collection appraisal reports for insurance, estate planning, and consignment. Free printable format.',
        url: 'https://cardvault-two.vercel.app/tools/appraisal-report',
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
          5,500+ Cards &middot; Printable Report &middot; Insurance Ready &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Card Appraisal Report Generator
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Generate a professional collection appraisal for insurance, estate planning, or consignment. Add cards, set grades, and print a formatted report with total valuation.
        </p>
      </div>

      <AppraisalReport />

      {/* FAQ */}
      <div className="mt-12 print:hidden">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <details key={i} className="group bg-gray-900/60 border border-gray-800 rounded-xl">
              <summary className="cursor-pointer p-4 text-white font-medium hover:text-violet-400 transition-colors list-none flex justify-between items-center">
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
      <div className="mt-12 bg-gray-900/60 border border-gray-800 rounded-xl p-6 print:hidden">
        <h2 className="text-lg font-bold text-white mb-4">Related Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/insurance-calc', label: 'Insurance Calculator', desc: 'Estimate coverage needs and premiums' },
            { href: '/tools/collection-value', label: 'Collection Value', desc: 'Quick collection value estimate' },
            { href: '/tools/export-collection', label: 'Export Collection', desc: 'Download your collection as CSV/JSON' },
            { href: '/tools/grade-value-chart', label: 'Grade Value Chart', desc: 'See value at every grade level' },
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
