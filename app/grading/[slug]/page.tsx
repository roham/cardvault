import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import { gradingCompanies, getGradingCompany } from '@/data/grading-companies';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return gradingCompanies.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = getGradingCompany(slug);
  if (!company) return { title: 'Grading Company Not Found' };
  return {
    title: `${company.name} Card Grading — Pricing, Turnaround, Grade Scale & Review (2026)`,
    description: `Complete ${company.name} (${company.fullName}) grading guide. ${company.tiers.length} service tiers from ${company.tiers[0].price}. Grade scale explained. Strengths, weaknesses, and when ${company.name} is the best choice. Updated 2026.`,
    openGraph: {
      title: `${company.name} Card Grading Guide — CardVault`,
      description: `${company.name} pricing from ${company.tiers[0].price}, ${company.tiers[0].turnaround} turnaround. Grade scale, pros/cons, and best use cases.`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${company.name} Card Grading — CardVault`,
      description: `Everything about ${company.name} grading: pricing, turnaround, scale, and when to use it.`,
    },
    alternates: { canonical: './' },
  };
}

export default async function GradingCompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = getGradingCompany(slug);
  if (!company) notFound();

  const otherCompanies = gradingCompanies.filter(c => c.slug !== slug);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${company.name} Card Grading — Complete Guide`,
        description: company.description,
        url: `https://cardvault-two.vercel.app/grading/${company.slug}`,
        publisher: { '@type': 'Organization', name: 'CardVault' },
        dateModified: '2026-04-15',
      }} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: company.faq.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }} />

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Grading Companies', href: '/grading' },
        { label: company.name },
      ]} />

      {/* Hero */}
      <div className="mb-10">
        <div className={`inline-flex items-center gap-2 ${company.accentBg} border ${company.accentBorder} ${company.accent} text-xs font-medium px-3 py-1.5 rounded-full mb-4`}>
          <span className={`w-1.5 h-1.5 rounded-full ${company.accent.replace('text-', 'bg-')}`} />
          Est. {company.founded} &middot; {company.headquarters} &middot; {company.totalCardsGraded} Cards Graded
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          {company.name} Card Grading
        </h1>
        <p className="text-gray-500 text-sm mb-3">{company.fullName}</p>
        <p className="text-gray-400 text-lg max-w-3xl">
          {company.description}
        </p>
      </div>

      {/* Quick Facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Cheapest Tier</div>
          <div className={`text-lg font-bold ${company.accent}`}>{company.tiers[0].price}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Fastest Tier</div>
          <div className={`text-lg font-bold ${company.accent}`}>{company.tiers[company.tiers.length - 1].turnaround}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Market Share</div>
          <div className={`text-lg font-bold ${company.accent}`}>{company.marketShare}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Graded</div>
          <div className={`text-lg font-bold ${company.accent}`}>{company.totalCardsGraded}</div>
        </div>
      </div>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
        <p className="text-gray-300 leading-relaxed">{company.overview}</p>
      </section>

      {/* Pricing Table */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{company.name} Grading Pricing &amp; Turnaround</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 py-3 px-3 font-medium">Service Tier</th>
                <th className="text-center text-gray-400 py-3 px-3 font-medium">Price</th>
                <th className="text-center text-gray-400 py-3 px-3 font-medium">Turnaround</th>
                <th className="text-center text-gray-400 py-3 px-3 font-medium">Max Value</th>
              </tr>
            </thead>
            <tbody>
              {company.tiers.map((tier, i) => (
                <tr key={tier.name} className={`border-b border-gray-800/50 ${i === 0 ? `${company.accentBg}` : ''}`}>
                  <td className="py-3 px-3 text-white font-medium">
                    {tier.name}
                    {i === 0 && <span className={`ml-2 text-xs ${company.accent}`}>Most Popular</span>}
                  </td>
                  <td className="text-center py-3 px-3 text-gray-300 font-medium">{tier.price}</td>
                  <td className="text-center py-3 px-3 text-gray-300">{tier.turnaround}</td>
                  <td className="text-center py-3 px-3 text-gray-500">{tier.minValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-gray-500 text-xs mt-2">Prices and turnaround times are estimates and may vary. Check {company.name}&apos;s website for current rates.</p>
      </section>

      {/* Grade Scale */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{company.name} Grading Scale</h2>
        <div className="space-y-3">
          {company.gradeScale.map((g, i) => {
            const isTop = i === 0;
            return (
              <div key={`${g.grade}-${g.label}`} className={`flex items-start gap-4 p-3 rounded-lg ${isTop ? `${company.accentBg} border ${company.accentBorder}` : 'bg-gray-900 border border-gray-800'}`}>
                <div className={`text-2xl font-bold ${isTop ? company.accent : 'text-gray-300'} w-12 text-center flex-shrink-0`}>
                  {g.grade}
                </div>
                <div>
                  <div className={`font-medium ${isTop ? company.accent : 'text-white'} text-sm`}>{g.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{g.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strengths & Weaknesses */}
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <section>
          <h2 className="text-xl font-bold text-emerald-400 mb-4">Strengths</h2>
          <div className="space-y-2">
            {company.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                {s}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold text-red-400 mb-4">Weaknesses</h2>
          <div className="space-y-2">
            {company.weaknesses.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5 flex-shrink-0">−</span>
                {w}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Best For */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">When to Choose {company.name}</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="space-y-2">
            {company.bestFor.map((use, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className={`mt-1 w-2 h-2 rounded-full ${company.accent.replace('text-', 'bg-')} flex-shrink-0`} />
                {use}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">{company.name} Tools on CardVault</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: '/tools/grading-roi', title: 'Grading ROI Calculator', desc: `Calculate whether grading with ${company.name} is profitable for your card.` },
            { href: '/tools/submission-planner', title: 'Submission Planner', desc: `Compare ${company.name} tiers side-by-side with PSA, BGS, CGC, and SGC.` },
            { href: '/tools/turnaround-estimator', title: 'Turnaround Estimator', desc: `Current ${company.name} wait times for every service level.` },
            { href: '/tools/condition-grader', title: 'Condition Self-Grader', desc: `Estimate your card's ${company.name} grade before submitting.` },
            ...(company.slug === 'bgs' ? [{ href: '/tools/bgs-subgrade', title: 'BGS Subgrade Calculator', desc: 'Calculate overall BGS grade from your subgrades.' }] : []),
            { href: '/tools/cross-grade', title: 'Cross-Grade Converter', desc: `Convert ${company.name} grades to PSA, BGS, CGC, and SGC equivalents.` },
          ].map(tool => (
            <Link key={tool.href} href={tool.href} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-emerald-800 transition-colors">
              <div className="text-white font-medium text-sm mb-1">{tool.title}</div>
              <div className="text-gray-500 text-xs">{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Compare with Other Companies */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Compare {company.name} With</h2>
        <div className="grid grid-cols-3 gap-3">
          {otherCompanies.map(other => (
            <Link key={other.slug} href={`/grading/${other.slug}`} className={`bg-gray-900 border border-gray-800 rounded-lg p-4 hover:${other.accentBorder} transition-colors text-center`}>
              <div className={`text-lg font-bold ${other.accent}`}>{other.name}</div>
              <div className="text-xs text-gray-500 mt-1">From {other.tiers[0].price}</div>
              <div className="text-xs text-gray-500">{other.tiers[0].turnaround}</div>
            </Link>
          ))}
        </div>
        <div className="mt-3 text-center">
          <Link href="/grading" className="text-sm text-violet-400 hover:underline">
            &larr; Full comparison of all grading companies
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-800 pt-10 mb-10">
        <h2 className="text-2xl font-bold text-white mb-6">{company.name} Grading FAQ</h2>
        <div className="space-y-6">
          {company.faq.map((faq, i) => (
            <details key={i} className="group">
              <summary className={`cursor-pointer text-white font-medium hover:${company.accent} transition-colors`}>
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-400 text-sm leading-relaxed pl-4">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-3">Explore More</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/grading', label: 'All Grading Companies' },
            { href: '/guides/psa-vs-bgs-vs-cgc', label: 'PSA vs BGS vs CGC Guide' },
            { href: '/tools/grading-roi', label: 'Grading ROI Calculator' },
            { href: '/tools/roi-heatmap', label: 'ROI Heatmap' },
            { href: '/tools/grade-spread', label: 'Grade Price Spread' },
            { href: '/invest', label: 'Investment Guides' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
