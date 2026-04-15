import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import DiversificationAnalyzer from './DiversificationAnalyzer';

export const metadata: Metadata = {
  title: 'Portfolio Diversification Analyzer — Card Collection Risk Score',
  description: 'Free card portfolio diversification tool. Analyze your collection across sport, era, grade, and value tiers. Get a diversification score and personalized recommendations to reduce risk.',
  openGraph: {
    title: 'Portfolio Diversification Analyzer — CardVault',
    description: 'Score your card collection diversification and get risk-reduction recommendations.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Portfolio Diversification Analyzer — CardVault',
    description: 'How diversified is your card collection? Free analysis tool.',
  },
  alternates: { canonical: './' },
};

const breadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'Diversification Analyzer' },
];

const faqItems = [
  {
    question: 'Why does diversification matter for card collecting?',
    answer: 'Diversification reduces risk. If you own only basketball cards and the NBA has a lockout, your entire collection loses value. Spreading across sports, eras, grades, and value tiers means no single event can dramatically impact your portfolio. The same principle that makes stock portfolios safer applies to card collections.',
  },
  {
    question: 'How is the diversification score calculated?',
    answer: 'The score uses information entropy — a mathematical measure of how evenly distributed your cards are across categories. A score of 100 means perfectly even distribution across all categories. A score of 0 means everything is concentrated in one category. The overall score weights sport mix (30%), era spread (25%), value spread (25%), and grade mix (20%).',
  },
  {
    question: 'What is a good diversification score?',
    answer: 'A score of 60-80 is considered "Good" diversification for most collectors. Above 80 is "Excellent" and means your collection is well-balanced. Below 40 means significant concentration risk. Note that some concentration is intentional — if you specialize in vintage baseball, a low score does not mean you are doing something wrong, just that your portfolio is focused.',
  },
  {
    question: 'Should I diversify or specialize?',
    answer: 'Both strategies have merit. Specialization (focusing on one sport, era, or player) gives you deep knowledge and can lead to better buying decisions. Diversification reduces risk and smooths out market volatility. Many successful collectors do both — they specialize in one area while keeping 20-30% of their portfolio in other categories as a hedge.',
  },
  {
    question: 'How many cards do I need for meaningful diversification?',
    answer: 'You need at least 10-15 cards across 3+ categories for diversification to be meaningful. With fewer cards, your score will naturally be concentrated. The tool works with any number of cards but becomes most useful with 10+ entries. For investment portfolios, aim for 20-30 cards across multiple sports, eras, and value tiers.',
  },
];

export default function DiversificationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Portfolio Diversification Analyzer',
        description: 'Analyze card collection diversification across sport, era, grade, and value tiers.',
        url: 'https://cardvault-two.vercel.app/tools/diversification',
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
        <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Sport &middot; Era &middot; Grade &middot; Value &middot; Free
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Portfolio Diversification Analyzer</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Add your cards and see how diversified your collection is across sport, era, grade, and value tiers. Get a risk score and personalized recommendations.
        </p>
      </div>

      <DiversificationAnalyzer />

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
    </div>
  );
}
