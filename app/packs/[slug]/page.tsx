import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import { STORE_PACKS, TIER_INFO, type StorePack } from '@/lib/vault';
import PackDetailClient from './PackDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

function getPackBySlug(slug: string): StorePack | undefined {
  return STORE_PACKS.find(p => p.id === slug);
}

export function generateStaticParams() {
  return STORE_PACKS.map(pack => ({ slug: pack.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPackBySlug(slug);
  if (!pack) return { title: 'Pack Not Found — CardVault' };

  const tier = TIER_INFO[pack.tier];
  return {
    title: `${pack.name} — ${tier.label} Pack $${pack.price} | CardVault Pack Store`,
    description: `${pack.description} ${pack.cardsPerPack} cards per pack. ${pack.guaranteedRarity}. ${pack.odds.map(o => `${o.chance} chance of ${o.label}`).join('. ')}.`,
    openGraph: {
      title: `${pack.name} — CardVault Pack Store`,
      description: `${tier.label} tier pack with ${pack.cardsPerPack} cards. ${pack.guaranteedRarity}.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${pack.name} — $${pack.price} | CardVault`,
      description: `${pack.description}`,
    },
    alternates: { canonical: './' },
  };
}

const SPORT_LABELS: Record<string, { name: string; icon: string }> = {
  baseball: { name: 'Baseball', icon: '⚾' },
  basketball: { name: 'Basketball', icon: '🏀' },
  football: { name: 'Football', icon: '🏈' },
  hockey: { name: 'Hockey', icon: '🏒' },
  mixed: { name: 'Multi-Sport', icon: '🎲' },
};

function getRelatedPacks(pack: StorePack): StorePack[] {
  // Same tier first, then same sport, excluding self
  return STORE_PACKS
    .filter(p => p.id !== pack.id)
    .sort((a, b) => {
      const aTier = a.tier === pack.tier ? 0 : 1;
      const bTier = b.tier === pack.tier ? 0 : 1;
      if (aTier !== bTier) return aTier - bTier;
      const aSport = a.sport === pack.sport ? 0 : 1;
      const bSport = b.sport === pack.sport ? 0 : 1;
      return aSport - bSport;
    })
    .slice(0, 4);
}

const faqTemplates = (pack: StorePack) => [
  {
    question: `What cards can I get from ${pack.name}?`,
    answer: `${pack.name} contains ${pack.cardsPerPack} cards from our database of real ${pack.sport === 'mixed' ? 'multi-sport' : pack.sport} cards. ${pack.guaranteedRarity}. Cards include rookies, Hall of Famers, and modern stars with real eBay values.`,
  },
  {
    question: `How much does ${pack.name} cost?`,
    answer: `${pack.name} costs $${pack.price.toFixed(2)} from your CardVault balance. New accounts start with a $250 welcome bonus. You can earn more by selling cards back at 90% of market value.`,
  },
  {
    question: `What are the odds for ${pack.name}?`,
    answer: `${pack.odds.map(o => `There is a ${o.chance} chance of pulling a ${o.label}`).join('. ')}. Every pack also guarantees: ${pack.guaranteedRarity}.`,
  },
  {
    question: `Can I sell cards from ${pack.name}?`,
    answer: `Yes. Every card you pull can be instantly sold back to CardVault for 90% of its fair market value. This lets you recoup value from duplicates or cards outside your collecting focus.`,
  },
  {
    question: `Is this a real purchase?`,
    answer: `No. The pack store is a prototype experience — no real money is involved. Your balance and cards are stored in your browser. All card data, player names, and values are real and sourced from eBay sold comparables.`,
  },
];

export default async function PackDetailPage({ params }: Props) {
  const { slug } = await params;
  const pack = getPackBySlug(slug);
  if (!pack) notFound();

  const tier = TIER_INFO[pack.tier];
  const sport = SPORT_LABELS[pack.sport] || { name: pack.sport, icon: '🃏' };
  const related = getRelatedPacks(pack);
  const faqItems = faqTemplates(pack);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Pack Store', href: '/packs' },
    { label: pack.name },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={breadcrumbs} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: pack.name,
        description: pack.description,
        url: `https://cardvault-two.vercel.app/packs/${pack.id}`,
        brand: { '@type': 'Brand', name: 'CardVault' },
        category: 'Digital Card Packs',
        offers: {
          '@type': 'Offer',
          price: pack.price.toFixed(2),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      }} />

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(q => ({
          '@type': 'Question',
          name: q.question,
          acceptedAnswer: { '@type': 'Answer', text: q.answer },
        })),
      }} />

      {/* Pack Header */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pack Visual */}
        <div className={`relative rounded-2xl border-2 ${tier.border} overflow-hidden`}>
          <div className={`bg-gradient-to-br ${pack.gradient} p-8 flex flex-col items-center justify-center min-h-[320px]`}>
            <div className="text-7xl mb-4">{pack.icon}</div>
            <h1 className="text-2xl font-bold text-white text-center">{pack.name}</h1>
            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tier.bg} ${tier.color}`}>
              {tier.label} Tier
            </div>
            {pack.isNew && (
              <div className="mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-full text-xs font-bold text-emerald-300 uppercase">
                New
              </div>
            )}
            {pack.featured && (
              <div className="mt-2 px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-bold text-amber-300 uppercase">
                Featured
              </div>
            )}
          </div>
        </div>

        {/* Pack Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{sport.icon}</span>
            <span className="text-sm text-slate-400 font-medium">{sport.name}</span>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">{pack.description}</p>

          <div className="text-3xl font-bold text-white mb-6">${pack.price.toFixed(2)}</div>

          {/* Pack Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3">
              <div className="text-xl font-bold text-white">{pack.cardsPerPack}</div>
              <div className="text-xs text-slate-400">Cards Per Pack</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-3">
              <div className="text-sm font-bold text-emerald-400">{pack.guaranteedRarity}</div>
              <div className="text-xs text-slate-400">Guaranteed</div>
            </div>
          </div>

          {/* Odds Table */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Pack Odds</h3>
            <div className="space-y-2">
              {pack.odds.map((odd, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{odd.label}</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{odd.chance}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Button (client component) */}
          <PackDetailClient pack={pack} />
        </div>
      </div>

      {/* What You Might Pull */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">What Could You Pull?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 border border-amber-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-sm font-semibold text-amber-400">Best Case</div>
            <div className="text-xs text-slate-400 mt-1">
              {pack.tier === 'platinum' ? 'Multiple $1,000+ cards including vintage HOF rookies'
               : pack.tier === 'gold' ? 'A $1,000+ HOF rookie or vintage key card'
               : pack.tier === 'silver' ? 'A $200+ premium star card or graded gem'
               : 'A $100+ surprise hit from an unexpected pull'}
            </div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-semibold text-slate-300">Average Pack</div>
            <div className="text-xs text-slate-400 mt-1">
              {pack.tier === 'platinum' ? 'All 3 cards worth $100-$500 each — solid portfolio builders'
               : pack.tier === 'gold' ? '1 guaranteed $200+ hit plus 3 solid $25-$75 cards'
               : pack.tier === 'silver' ? '1 guaranteed $50+ card plus 4 decent base cards'
               : '5 common to uncommon cards with 1-2 pleasant surprises'}
            </div>
          </div>
          <div className="bg-slate-800/30 border border-red-800/30 rounded-xl p-4 text-center">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-semibold text-red-400">Floor Guarantee</div>
            <div className="text-xs text-slate-400 mt-1">{pack.guaranteedRarity} — you are always guaranteed at least this.</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="group bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <summary className="p-4 cursor-pointer text-white font-medium text-sm flex justify-between items-center">
                {item.question}
                <span className="text-slate-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Related Packs */}
      <section className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-xl font-bold text-white mb-4">More Packs You Might Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {related.map(rp => {
            const rt = TIER_INFO[rp.tier];
            return (
              <Link
                key={rp.id}
                href={`/packs/${rp.id}`}
                className={`bg-gradient-to-br ${rp.gradient} border ${rt.border} rounded-xl p-4 hover:scale-[1.02] transition-transform text-center`}
              >
                <div className="text-3xl mb-2">{rp.icon}</div>
                <div className="text-sm font-semibold text-white">{rp.name}</div>
                <div className={`text-xs ${rt.color} mt-1`}>{rt.label} · ${rp.price}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Cross-links */}
      <section className="mt-10 border-t border-slate-800 pt-8">
        <h2 className="text-lg font-semibold text-white mb-4">More in the Pack Store</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/packs" className="text-sm text-blue-400 hover:text-blue-300">All Packs</Link>
          <Link href="/vault" className="text-sm text-blue-400 hover:text-blue-300">My Vault</Link>
          <Link href="/tools/pack-sim" className="text-sm text-blue-400 hover:text-blue-300">Pack Simulator</Link>
          <Link href="/tools/daily-pack" className="text-sm text-blue-400 hover:text-blue-300">Daily Free Pack</Link>
          <Link href="/marketplace" className="text-sm text-blue-400 hover:text-blue-300">Marketplace</Link>
          <Link href="/premium-packs" className="text-sm text-blue-400 hover:text-blue-300">Premium Packs</Link>
        </div>
      </section>
    </div>
  );
}
