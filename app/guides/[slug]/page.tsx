import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { guides, getGuideBySlug } from '../guides-data';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return guides.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: guide.title,
    description: guide.summary,
    openGraph: {
      title: guide.title,
      description: guide.summary,
      type: 'article',
      url: `https://cardvault-two.vercel.app/guides/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: guide.title,
      description: guide.summary.slice(0, 120),
    },
  };
}

const calloutStyles = {
  tip: {
    border: 'border-emerald-800/50',
    bg: 'bg-emerald-950/30',
    icon: '💡',
    label: 'Tip',
    textColor: 'text-emerald-300',
    labelColor: 'text-emerald-400',
  },
  warning: {
    border: 'border-amber-800/40',
    bg: 'bg-amber-950/20',
    icon: '⚠️',
    label: 'Watch out',
    textColor: 'text-amber-200/80',
    labelColor: 'text-amber-400',
  },
  info: {
    border: 'border-blue-800/40',
    bg: 'bg-blue-950/20',
    icon: 'ℹ️',
    label: 'Note',
    textColor: 'text-blue-300/80',
    labelColor: 'text-blue-400',
  },
};

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const currentIndex = guides.findIndex(g => g.slug === slug);
  const prevGuide = currentIndex > 0 ? guides[currentIndex - 1] : null;
  const nextGuide = currentIndex < guides.length - 1 ? guides[currentIndex + 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Guides', href: '/guides' },
        { label: guide.title },
      ]} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guide.title,
        description: guide.summary,
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        mainEntityOfPage: `https://cardvault-two.vercel.app/guides/${slug}`,
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guide.content.map(section => ({
          '@type': 'Question',
          name: section.heading,
          acceptedAnswer: {
            '@type': 'Answer',
            text: section.body + (section.bullets ? ' ' + section.bullets.join('. ') : ''),
          },
        })),
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cardvault-two.vercel.app/' },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://cardvault-two.vercel.app/guides' },
          { '@type': 'ListItem', position: 3, name: guide.title },
        ],
      }} />

      {/* Header */}
      <div className={`bg-gradient-to-br ${guide.gradient} border border-gray-800 rounded-2xl p-8 mb-10`}>
        <div className="text-5xl mb-4">{guide.icon}</div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-300">
            {guide.category}
          </span>
          <span className="text-gray-500 text-xs">{guide.readTime} read</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">{guide.title}</h1>
        <p className="text-gray-300 text-base leading-relaxed">{guide.summary}</p>
      </div>

      {/* Table of contents */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-10">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">In this guide</p>
        <ol className="space-y-2">
          {guide.content.map((section, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-500 text-sm font-bold shrink-0 mt-0.5">{i + 1}.</span>
              <a
                href={`#section-${i}`}
                className="text-gray-300 hover:text-emerald-400 text-sm transition-colors leading-snug"
              >
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* Content */}
      <div className="space-y-12">
        {guide.content.map((section, i) => {
          const callout = section.calloutType ? calloutStyles[section.calloutType] : null;

          return (
            <section key={i} id={`section-${i}`} className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-emerald-500 font-bold text-lg">{i + 1}</span>
                <h2 className="text-xl font-bold text-white">{section.heading}</h2>
              </div>

              <p className="text-gray-400 leading-relaxed mb-4">{section.body}</p>

              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2.5 mb-4">
                  {section.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="text-emerald-500 shrink-0 mt-1 text-xs">▸</span>
                      <span className="text-gray-400 text-sm leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {callout && section.callout && (
                <div className={`border ${callout.border} ${callout.bg} rounded-xl px-5 py-4 flex items-start gap-3`}>
                  <span className="text-lg shrink-0">{callout.icon}</span>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${callout.labelColor}`}>{callout.label}</p>
                    <p className={`text-sm leading-relaxed ${callout.textColor}`}>{section.callout}</p>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Featured Cards Referenced in This Guide */}
      {guide.featuredCards && guide.featuredCards.length > 0 && (
        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">Cards Referenced in This Guide</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guide.featuredCards.map(card => {
              const href = card.type === 'pokemon' ? `/pokemon/cards/${card.slug}` : `/sports/${card.slug}`;
              return (
                <Link
                  key={card.slug}
                  href={href}
                  className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-emerald-500/50 rounded-xl px-4 py-3 transition-all group"
                >
                  <span className="text-lg shrink-0">{card.type === 'pokemon' ? '⚡' : '🃏'}</span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors truncate">{card.label}</p>
                    {card.note && <p className="text-gray-500 text-xs truncate">{card.note}</p>}
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-emerald-500 transition-colors shrink-0 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation between guides */}
      <div className="mt-16 border-t border-gray-800 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevGuide ? (
          <Link href={`/guides/${prevGuide.slug}`} className="group flex items-start gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-all">
            <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <div>
              <p className="text-gray-500 text-xs mb-1">Previous guide</p>
              <p className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors leading-snug">{prevGuide.title}</p>
            </div>
          </Link>
        ) : <div />}
        {nextGuide ? (
          <Link href={`/guides/${nextGuide.slug}`} className="group flex items-start gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-4 transition-all sm:ml-auto text-right sm:text-right">
            <div>
              <p className="text-gray-500 text-xs mb-1">Next guide</p>
              <p className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors leading-snug">{nextGuide.title}</p>
            </div>
            <svg className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ) : <div />}
      </div>

      {/* CTA */}
      <div className="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold mb-1">Put this knowledge to use</p>
          <p className="text-gray-400 text-sm">Use our tools to calculate grade premiums and find real market prices.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/tools" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Collector Tools
          </Link>
          <Link href="/price-guide" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Price Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
