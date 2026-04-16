import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import { postMortems } from '../data';

export function generateStaticParams() {
  return postMortems.map(pm => ({ slug: pm.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pm = postMortems.find(p => p.slug === slug);
  if (!pm) return { title: 'Post-Mortem Not Found | CardVault' };

  return {
    title: `${pm.title} — Post-Mortem | CardVault`,
    description: pm.hook.substring(0, 200),
    openGraph: {
      title: pm.title,
      description: pm.subtitle,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: pm.title,
      description: pm.subtitle,
    },
    alternates: { canonical: './' },
  };
}

export default async function PostMortemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pm = postMortems.find(p => p.slug === slug);
  if (!pm) notFound();

  const idx = postMortems.findIndex(p => p.slug === slug);
  const caseNum = String(idx + 1).padStart(2, '0');
  const prev = idx > 0 ? postMortems[idx - 1] : null;
  const next = idx < postMortems.length - 1 ? postMortems[idx + 1] : null;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Post-Mortems', href: '/post-mortems' },
    { label: pm.title },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pm.title,
        description: pm.subtitle,
        datePublished: '2026-04-16',
        articleSection: 'Hobby History',
        publisher: { '@type': 'Organization', name: 'CardVault' },
      }} />

      <header className="mt-4 mb-8 border-b border-zinc-700 pb-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-red-950/50 border border-red-900/50 text-red-400 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-sm font-mono">
            Case #{caseNum}
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{pm.year}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{pm.manufacturer}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{pm.failureMode}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
          {pm.title}
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed italic">
          {pm.subtitle}
        </p>
      </header>

      {/* Hook */}
      <section className="mb-10">
        <div className="bg-zinc-900/60 border-l-4 border-red-600 rounded-r-md p-5">
          <p className="text-zinc-200 text-base sm:text-lg leading-relaxed">
            {pm.hook}
          </p>
        </div>
      </section>

      {/* Price crash card */}
      <section className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-md p-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1">Peak</div>
          <div className="text-xl font-black text-white font-mono">{pm.peakPrice}</div>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-md p-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1">Floor</div>
          <div className="text-xl font-black text-white font-mono">{pm.floorPrice}</div>
        </div>
        <div className="bg-red-950/40 border border-red-900/50 rounded-md p-4">
          <div className="text-[10px] font-bold tracking-widest uppercase text-red-400 mb-1">Crash</div>
          <div className="text-xl font-black text-red-300 font-mono">
            {pm.priceCrashPct > 0 ? `▼ ${pm.priceCrashPct}%` : 'Platform closed'}
          </div>
        </div>
      </section>

      {/* Launch context */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-red-500 mb-3 font-mono">01 · Launch Context</h2>
        <p className="text-zinc-300 leading-relaxed">{pm.launchContext}</p>
      </section>

      {/* What went wrong */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-red-500 mb-4 font-mono">02 · What Went Wrong</h2>
        <ol className="space-y-4 list-none">
          {pm.whatWentWrong.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 bg-red-950/50 border border-red-900/50 text-red-400 rounded-sm flex items-center justify-center font-mono text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-zinc-300 leading-relaxed">{item}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Price timeline */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-red-500 mb-4 font-mono">03 · Price Timeline</h2>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800">
                <th className="text-left py-2.5 px-4 text-[10px] font-bold tracking-widest uppercase text-zinc-500">Date</th>
                <th className="text-left py-2.5 px-4 text-[10px] font-bold tracking-widest uppercase text-zinc-500">Event</th>
                <th className="text-right py-2.5 px-4 text-[10px] font-bold tracking-widest uppercase text-zinc-500">Price</th>
              </tr>
            </thead>
            <tbody>
              {pm.priceTimeline.map((entry, i) => (
                <tr key={i} className={i !== pm.priceTimeline.length - 1 ? 'border-b border-zinc-800' : ''}>
                  <td className="py-3 px-4 text-zinc-400 font-mono text-xs whitespace-nowrap">{entry.date}</td>
                  <td className="py-3 px-4 text-zinc-300">{entry.event}</td>
                  <td className="py-3 px-4 text-right font-mono text-white">{entry.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Collector impact */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-red-500 mb-3 font-mono">04 · Collector Impact</h2>
        <p className="text-zinc-300 leading-relaxed">{pm.collectorImpact}</p>
      </section>

      {/* What replaced it */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-red-500 mb-3 font-mono">05 · What Replaced It</h2>
        <p className="text-zinc-300 leading-relaxed">{pm.whatReplacedIt}</p>
      </section>

      {/* Notable cards */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-red-500 mb-4 font-mono">06 · Notable Cards</h2>
        <div className="space-y-3">
          {pm.notableCards.map((card, i) => (
            <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-md p-4">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <h3 className="text-white font-semibold text-sm">{card.name}</h3>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-zinc-500">Peak <span className="text-zinc-300">{card.peak}</span></span>
                  <span className="text-red-500">→</span>
                  <span className="text-zinc-500">Floor <span className="text-zinc-300">{card.floor}</span></span>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{card.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lessons */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-red-500 mb-4 font-mono">07 · Lessons</h2>
        <ol className="space-y-3 list-none">
          {pm.lessons.map((lesson, i) => (
            <li key={i} className="flex gap-4">
              <span className="shrink-0 w-6 h-6 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-sm flex items-center justify-center font-mono text-xs">
                {i + 1}
              </span>
              <p className="text-zinc-300 leading-relaxed">{lesson}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Prev/Next navigation */}
      <nav className="mt-12 pt-6 border-t border-zinc-800 flex items-center justify-between gap-3">
        {prev ? (
          <Link
            href={`/post-mortems/${prev.slug}`}
            className="flex-1 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-md p-3 transition-colors group max-w-[calc(50%-6px)]"
          >
            <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1">← Previous Case</div>
            <div className="text-sm text-white group-hover:text-red-300 transition-colors line-clamp-1">{prev.title}</div>
          </Link>
        ) : (
          <div className="flex-1 max-w-[calc(50%-6px)]"/>
        )}
        {next ? (
          <Link
            href={`/post-mortems/${next.slug}`}
            className="flex-1 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-md p-3 transition-colors group max-w-[calc(50%-6px)] text-right"
          >
            <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1">Next Case →</div>
            <div className="text-sm text-white group-hover:text-red-300 transition-colors line-clamp-1">{next.title}</div>
          </Link>
        ) : (
          <div className="flex-1 max-w-[calc(50%-6px)]"/>
        )}
      </nav>

      <div className="mt-6 text-center">
        <Link href="/post-mortems" className="inline-flex items-center gap-2 text-zinc-500 hover:text-red-400 text-sm font-mono transition-colors">
          ← Back to Casefile Archive
        </Link>
      </div>
    </main>
  );
}
