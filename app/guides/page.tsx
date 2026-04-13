import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from './guides-data';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Collector Guides',
  description: 'Free guides for sports card and Pokémon TCG collectors. Learn how to start collecting, when to grade cards, how to read price data, and more.',
};

export default function GuidesPage() {
  const featured = guides[0];
  const rest = guides.slice(1);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Collector Guides',
        description: 'Free guides for sports card and Pokémon TCG collectors.',
        url: 'https://cardvault-two.vercel.app/guides',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: guides.length,
          itemListElement: guides.map((guide, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://cardvault-two.vercel.app/guides/${guide.slug}`,
            name: guide.title,
          })),
        },
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-800/50 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          Beginner to advanced — no paywalls
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Collector Guides</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Practical knowledge for buying, grading, and valuing cards. Written for people who want to make smart decisions, not chase hype.
        </p>
      </div>

      {/* Featured guide */}
      <Link href={`/guides/${featured.slug}`} className="group block mb-8">
        <div className={`bg-gradient-to-br ${featured.gradient} border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-8 transition-all hover:-translate-y-0.5`}>
          <div className="flex items-start gap-4">
            <div className="text-5xl shrink-0">{featured.icon}</div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-300">
                  {featured.category}
                </span>
                <span className="text-gray-500 text-xs">{featured.readTime} read</span>
              </div>
              <h2 className="text-white text-2xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-400 leading-relaxed max-w-2xl">{featured.summary}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                Read guide
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Rest of guides grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {rest.map(guide => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group block">
            <div className={`h-full bg-gradient-to-br ${guide.gradient} border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all hover:-translate-y-0.5`}>
              <div className="text-3xl mb-4">{guide.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-300">
                  {guide.category}
                </span>
                <span className="text-gray-500 text-xs">{guide.readTime} read</span>
              </div>
              <h2 className="text-white text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors leading-snug">
                {guide.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{guide.summary}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-emerald-400 text-sm font-medium">
                Read →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Community links */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h3 className="text-white font-bold text-lg mb-2">Community Resources</h3>
        <p className="text-gray-400 text-sm mb-5">Where serious collectors hang out and share knowledge.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              name: 'r/sportscards',
              desc: '1.8M members — the largest Reddit community for sports card collectors',
              url: 'https://reddit.com/r/sportscards',
              icon: '🏆',
            },
            {
              name: 'r/PokemonTCG',
              desc: '600K+ members — buying, selling, and collecting Pokémon cards',
              url: 'https://reddit.com/r/PokemonTCG',
              icon: '⚡',
            },
            {
              name: 'Blowout Forums',
              desc: 'Veteran community for authentication, vintage collecting, and deal threads',
              url: 'https://blowoutforums.com',
              icon: '💬',
            },
            {
              name: 'PSA Forums',
              desc: 'Official PSA discussion boards — grading questions and submission tracking',
              url: 'https://forums.psacard.com',
              icon: '🏅',
            },
          ].map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-xl p-4 transition-all"
            >
              <span className="text-xl shrink-0">{link.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">{link.name}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{link.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Tool cross-links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/tools" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          Collector Tools
        </Link>
        <Link href="/price-guide" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Price Guide
        </Link>
        <Link href="/sports" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Sports Cards
        </Link>
      </div>
    </div>
  );
}
