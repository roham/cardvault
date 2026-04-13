import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Best Pokémon Card Investments for 2026 — What to Buy Now',
  description: 'The definitive Pokémon card investment guide for 2026. Vintage holos, sealed product, modern alt-arts, and graded slabs analyzed by risk tier, entry price, and long-term upside. Data-driven, no hype.',
  keywords: ['best pokemon card investments 2026', 'pokemon cards worth buying', 'vintage pokemon card value', 'sealed pokemon packs investment', 'pokemon alt art cards'],
};

interface InvestmentCard {
  name: string;
  set: string;
  category: 'vintage-raw' | 'vintage-graded' | 'sealed' | 'modern-alt' | 'modern-graded';
  entryPrice: string;
  targetReturn: string;
  timeframe: string;
  risk: 'low' | 'medium' | 'high' | 'very-high';
  thesis: string;
  watchOut: string;
  tcgId?: string;
  slug?: string;
}

const riskColor: Record<string, string> = {
  low: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30',
  medium: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/30',
  high: 'text-orange-400 bg-orange-950/40 border-orange-800/30',
  'very-high': 'text-rose-400 bg-rose-950/40 border-rose-800/30',
};

const riskLabel: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  'very-high': 'Speculative',
};

const categoryLabel: Record<string, string> = {
  'vintage-raw': 'Vintage (Raw)',
  'vintage-graded': 'Vintage (Graded)',
  sealed: 'Sealed Product',
  'modern-alt': 'Modern Alt Art',
  'modern-graded': 'Modern (Graded)',
};

const categoryIcon: Record<string, string> = {
  'vintage-raw': '📜',
  'vintage-graded': '🏅',
  sealed: '📦',
  'modern-alt': '🎨',
  'modern-graded': '⭐',
};

const investments: InvestmentCard[] = [
  // Vintage Graded — best risk-adjusted
  {
    name: '1st Edition Base Set Charizard PSA 7',
    set: 'Base Set 1st Edition (1999)',
    category: 'vintage-graded',
    entryPrice: '$3,000–$5,000',
    targetReturn: '2–4× in 5 years',
    timeframe: '3–7 years',
    risk: 'low',
    thesis: 'The benchmark collectible of the entire hobby. PSA 7 is the sweet spot — it\'s authenticated, the 1st Edition stamp is verified, and it costs a fraction of PSA 9 ($60K+). Every generation of new collectors discovers this card. Supply is finite: only ~3,000 PSA-graded 1st Ed Charizards exist across all grades. Historically, low-grade 1st Edition holos have appreciated faster percentage-wise than high grades because price-sensitive collectors still need an entry point.',
    watchOut: 'High-grade PSA 9/10 speculation can temporarily suppress lower grades during bubble periods. The floor at PSA 7 has held across multiple market cycles — but cycles exist.',
    tcgId: 'base1-4',
    slug: '1999-base-set-1st-edition-charizard-4-psa10',
  },
  {
    name: 'Shadowless Charizard PSA 9',
    set: 'Base Set Shadowless (1999)',
    category: 'vintage-graded',
    entryPrice: '$8,000–$15,000',
    targetReturn: '1.5–3× in 7 years',
    timeframe: '5–10 years',
    risk: 'low',
    thesis: 'Shadowless print run preceded the Unlimited print run. Same design year as 1st Edition, minus the stamp, but printed in limited quantities before Wizards extended the shadow effect. PSA 9 shadowless Charizards trade for $8–15K — substantial, but a fraction of the $60K+ 1st Ed PSA 9. This is the "certified vintage" play with more accessible entry and stable long-term appreciation.',
    watchOut: 'Authentication risk if buying raw. Only buy PSA/BGS-slabbed to confirm shadowless status. Some sellers misidentify prints.',
    slug: '1999-base-set-charizard-4-shadowless',
  },
  {
    name: '1st Edition Base Set Blastoise PSA 8',
    set: 'Base Set 1st Edition (1999)',
    category: 'vintage-graded',
    entryPrice: '$2,000–$4,000',
    targetReturn: '2–3× in 5 years',
    timeframe: '3–7 years',
    risk: 'low',
    thesis: 'Blastoise is the second most collected of the original three starters. PSA 8 hits the sweet spot: authenticated, high enough grade to be display-worthy, low enough price to have significant upside vs. PSA 9 ($20K+). When Charizard runs, Blastoise follows — the correlation is tight historically.',
    watchOut: 'Charizard drives the market. Blastoise appreciates in Charizard\'s wake. If you believe in Charizard long-term, Blastoise at PSA 8 is the leveraged version of that bet.',
    tcgId: 'base1-2',
  },
  {
    name: '1st Edition Base Set Venusaur PSA 9',
    set: 'Base Set 1st Edition (1999)',
    category: 'vintage-graded',
    entryPrice: '$3,000–$6,000',
    targetReturn: '2–4× in 7 years',
    timeframe: '5–10 years',
    risk: 'low',
    thesis: 'The most undervalued of the three starters. Perpetually third in market interest but graded identically as 1st Edition vintage. In PSA 9, Venusaur is significantly cheaper than Charizard and Blastoise despite equivalent vintage status. If either of the other two becomes inaccessible to new buyers, Venusaur becomes the next entry point.',
    watchOut: 'Venusaur appreciation is slower and less dramatic than Charizard. This is a patient play for collectors, not traders.',
  },
  {
    name: '1999 Base Set Pikachu #58 (No Symbol) PSA 9',
    set: 'Base Set Shadowless (1999)',
    category: 'vintage-graded',
    entryPrice: '$800–$1,800',
    targetReturn: '2–4× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'The shadowless Pikachu without the edition symbol is one of the earliest Pikachu variants. Pikachu is the face of the franchise globally — merchandise, movies, merchandise, games, all driven by this specific character. The no-symbol variant has a small but dedicated collector base and trades at a fraction of the iconic promos.',
    watchOut: 'Niche variant knowledge required. Verify shadowless status and no-symbol variant with a grader before significant investment.',
  },
  {
    name: 'Jungle Set Flareon Holo PSA 9',
    set: 'Jungle (1999)',
    category: 'vintage-graded',
    entryPrice: '$400–$800',
    targetReturn: '2–3× in 5 years',
    timeframe: '3–6 years',
    risk: 'medium',
    thesis: 'Flareon is the fire-type Eeveelution from the Jungle set — fan favorite and visually iconic. Jungle holos are consistently undervalued vs. Base Set despite being the same vintage era. PSA 9 Jungle holos are supply-constrained: the set graded harder due to softer cardstock. The Eeveelution family has strong cross-audience appeal.',
    watchOut: 'Jungle cards are difficult to grade. PSA 9 population is smaller than Base Set, which is the thesis — but it also means fewer PSA 9 copies trade, making price discovery slow.',
  },
  {
    name: 'Team Rocket Dark Charizard Holo PSA 9',
    set: 'Team Rocket (2000)',
    category: 'vintage-graded',
    entryPrice: '$600–$1,200',
    targetReturn: '2–3× in 5 years',
    timeframe: '3–6 years',
    risk: 'medium',
    thesis: 'Any Charizard is a collectible with a global collector base. The Team Rocket "Dark" variant is visually distinct from Base Set — a different artistic interpretation of the same character. The 2000 set dates put this firmly in vintage territory. Dark Charizard collectors are separate from Base Set Charizard collectors — you\'re tapping two fanbases.',
    watchOut: 'The Dark type theme can polarize — some collectors specifically want it, others specifically don\'t. The market is narrower than Base Set Charizard.',
    slug: '2000-pokemon-team-rocket-dark-charizard-4-holo',
  },
  {
    name: 'EX Dragon Rayquaza Holo PSA 9',
    set: 'EX Dragon (2003)',
    category: 'vintage-graded',
    entryPrice: '$300–$600',
    targetReturn: '2–4× in 5 years',
    timeframe: '3–6 years',
    risk: 'medium',
    thesis: 'Rayquaza is the #2 most collected legendary behind Charizard for a specific segment of collectors. EX Dragon Rayquaza was the first mainstream Rayquaza holo — the origin point for all Rayquaza card collecting. EX-era cards are approaching the same vintage appreciation curve that Base Set went through in the late 2010s.',
    watchOut: 'EX-era cards haven\'t reached mainstream collector recognition the way Base Set has. This is a 5-year minimum hold while the generation who grew up with EX-era enters peak spending years.',
    slug: '2003-ex-dragon-rayquaza-102-holo',
  },

  // Sealed product
  {
    name: 'Scarlet & Violet 151 Elite Trainer Box (Sealed)',
    set: 'Scarlet & Violet: 151 (2023)',
    category: 'sealed',
    entryPrice: '$60–$80',
    targetReturn: '3–6× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'The 151 set brought back all original 151 Pokémon in new art styles with stunning Special Illustration Rares. ETBs sealed and undamaged are supply-constrained because: (1) most get opened, (2) the nostalgia factor for adult collectors is strongest with original 151. Historical precedent: Base Set packs now sell for $300–500 each. Sword & Shield ETBs that sold for $50 now trade at $300–500 sealed.',
    watchOut: 'Short-term print runs can suppress price if supply exceeds demand at launch. Sealed product is illiquid — you can\'t grade or sell individual cards without destroying the investment. Storage matters: temperature, humidity, no sunlight.',
  },
  {
    name: 'Crown Zenith Elite Trainer Box (Sealed)',
    set: 'Crown Zenith (2023)',
    category: 'sealed',
    entryPrice: '$70–$100',
    targetReturn: '3–5× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'Crown Zenith was a Galarian Star Universe-style "best of" set — reprints and premium cards from the Sword & Shield era. These celebration sets are historically strong sealed investments because they package the best content of an era in one box. Print run was controlled, and they stopped printing when retail sold through.',
    watchOut: 'If TCG Pokémon releases another "Crown Zenith" style set, demand may split. Track reprint announcements carefully.',
  },
  {
    name: 'Brilliant Stars Booster Box (Sealed)',
    set: 'Sword & Shield: Brilliant Stars (2022)',
    category: 'sealed',
    entryPrice: '$90–$130',
    targetReturn: '3–5× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'Brilliant Stars introduced the VSTAR mechanic and contained Arceus VSTAR — one of the most impactful competitive Pokémon cards of 2022–23. Booster boxes from rotation-era sets appreciate when those Pokémon leave the competitive format because the supply of sealed boxes becomes permanently fixed.',
    watchOut: 'Sealed boxes require proper storage. A box stored improperly can have warped packs, compromising the investment.',
  },
  {
    name: 'Hidden Fates Elite Trainer Box (Sealed)',
    set: 'Hidden Fates (2019)',
    category: 'sealed',
    entryPrice: '$250–$400',
    targetReturn: '2–3× in 5 years',
    timeframe: '3–7 years',
    risk: 'low',
    thesis: 'Hidden Fates is already past its initial appreciation window — it was $40 in 2019 and now trades at $250–400 sealed. It contains Shiny Charizard GX, which drives demand from both competitive and collector markets. The set is out of print and supply is permanently fixed. Any future Charizard mania pulls these up.',
    watchOut: 'Already appreciated significantly. Lower return potential from here vs. 2022–23 sealed that hasn\'t run yet. Consider whether the 2–3× from $300 is compelling vs. 4–6× from newer sealed at $60–100.',
  },
  {
    name: 'Shining Fates Elite Trainer Box (Sealed)',
    set: 'Shining Fates (2021)',
    category: 'sealed',
    entryPrice: '$150–$250',
    targetReturn: '2–3× in 5 years',
    timeframe: '3–7 years',
    risk: 'low',
    thesis: 'Shining Fates was the Shiny card set of the Sword & Shield era — released during peak COVID-era collector demand. The set contains Shiny Charizard VMAX, which remains one of the most sought-after modern cards. Print run was extended due to demand but supply is now finite. ETB format limits pack count per box.',
    watchOut: 'Reprints are always possible — Pokémon has reprinted fan-favorite sets before. Hidden Fates got a limited reprint in 2020. Monitor any announcements about Shining Fates reprints.',
  },

  // Modern Alt Art — the growth category
  {
    name: 'Umbreon VMAX Alt Art #215 PSA 10',
    set: 'Evolving Skies (2021)',
    category: 'modern-graded',
    entryPrice: '$400–$700',
    targetReturn: '2–4× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'Umbreon has one of the most devoted fanbases of any Pokémon. The Evolving Skies Umbreon VMAX Alt Art is widely considered the best card design of the Sword & Shield era — full-bleed rainbow art that captures the character perfectly. PSA 10 examples have sustained $400–700 despite multiple print runs. Alt art demand is driven by visual preference, not just rarity.',
    watchOut: 'Modern cards have more supply than vintage. PSA 10 pop reports grow over time. Monitor whether population growth outpaces collector demand increases.',
  },
  {
    name: 'Charizard ex Special Illustration Rare PSA 10',
    set: 'Scarlet & Violet 151 (2023)',
    category: 'modern-graded',
    entryPrice: '$200–$400',
    targetReturn: '2–4× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'The definitive Charizard card of the modern era. The SV 151 Charizard ex SIR features art reminiscent of the original Base Set composition but reimagined in modern illustration style — directly bridging nostalgia and contemporary collection. Charizard cards with strong art maintain collector demand across generations.',
    watchOut: 'The 151 set had a large print run. PSA 10 population will grow. The card depends on continued Charizard cult following, which has been consistent for 25 years.',
    slug: '2023-sv-151-charizard-ex-ir',
  },
  {
    name: 'Mew ex Special Illustration Rare PSA 10',
    set: 'Scarlet & Violet 151 (2023)',
    category: 'modern-graded',
    entryPrice: '$150–$300',
    targetReturn: '2–3× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'Mew is the secret legendary — original to the games, beloved as a mystery Pokémon since 1996. The 151 Mew ex SIR has stunning artwork that captures Mew in full-art illustration. Among modern cards, Mew SIR is considered one of the best art pieces from the set. Strong secondary market demand from collectors who passed during initial release.',
    watchOut: 'Not as iconic as Charizard with the broader market. The Mew collector niche is passionate but smaller.',
    slug: '2023-sv-151-mew-ex-ir',
  },
  {
    name: 'Pikachu ex Special Illustration Rare PSA 10',
    set: 'Scarlet & Violet 151 (2023)',
    category: 'modern-graded',
    entryPrice: '$100–$200',
    targetReturn: '2–4× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'Pikachu is the franchise mascot — globally the most recognized Pokémon by non-players. SIR Pikachu from 151 has clean, accessible artwork that appeals to the broadest possible collector base. Entry price is accessible, PSA 10 ceiling is high if Pikachu continues driving franchise interest.',
    watchOut: 'Pikachu gets a new card every set, every expansion. Collector attention fragments across multiple Pikachu cards. Choose the 151 SIR specifically for its franchise tie-in to the original 151.',
  },
  {
    name: 'Gardevoir ex Special Illustration Rare PSA 10',
    set: 'Scarlet & Violet: Paldea Evolved (2023)',
    category: 'modern-graded',
    entryPrice: '$100–$200',
    targetReturn: '2–4× in 5 years',
    timeframe: '3–7 years',
    risk: 'medium',
    thesis: 'Gardevoir has one of the most dedicated fanbases of any non-legendary Pokémon. The Paldea Evolved SIR features an illustration widely regarded as among the best in the SV era — glowing, ethereal, magazine-quality art. PSA 10 examples have appreciated steadily since release. The Gardevoir collector community has strong internal demand.',
    watchOut: 'SV-era print runs are large. Long-term appreciation depends on the broader collector market growing faster than PSA 10 population.',
  },
  {
    name: 'Chien-Pao ex Special Illustration Rare PSA 10',
    set: 'Scarlet & Violet: Paldea Evolved (2023)',
    category: 'modern-alt',
    entryPrice: '$60–$120',
    targetReturn: '3–5× in 5 years',
    timeframe: '3–7 years',
    risk: 'high',
    thesis: 'New legendary with striking visual design. Early-gen legendaries that define competitive formats tend to build collector bases over time — Chien-Pao was a competitive powerhouse. The art style (inspired by Chinese mythology) is distinct from typical Pokémon design, creating cross-cultural collector interest. Early entry point before the character becomes iconic.',
    watchOut: 'New Pokémon haven\'t proven long-term collector interest. Chien-Pao\'s "Chinese mythology" aesthetic is either a long-term strength or a limiting factor depending on market expansion.',
  },
  {
    name: 'Iono Full Art Supporter PSA 10',
    set: 'Scarlet & Violet: Paldea Evolved (2023)',
    category: 'modern-graded',
    entryPrice: '$150–$300',
    targetReturn: '2–3× in 5 years',
    timeframe: '3–5 years',
    risk: 'high',
    thesis: 'Character cards — trainer cards featuring human characters — have built a dedicated collector base separate from Pokémon cards. Iono became a breakout character with strong fan art community and competitive play dominance. Trainer full arts command a premium over Pokémon cards in many cases. The collector base for trainer cards is growing.',
    watchOut: 'Character-driven collector demand is harder to predict than species-driven demand. Iono\'s popularity is genuine but could plateau if newer characters take over.',
  },

  // Modern Alt Art raw plays
  {
    name: 'Mewtwo ex Special Illustration Rare (Raw)',
    set: 'Scarlet & Violet 151 (2023)',
    category: 'modern-alt',
    entryPrice: '$40–$80',
    targetReturn: '3–6× in 5 years',
    timeframe: '3–7 years',
    risk: 'high',
    thesis: 'Mewtwo is the most powerful Pokémon in the original games. The 151 SIR features dramatic art consistent with Mewtwo\'s character as the ultimate bio-engineered Pokémon. Raw copies under $80 represent the entry-level spec position — submit for PSA 10 and hold.',
    watchOut: 'PSA 10 pop will grow from raw submissions. If the PSA 10 price falls below $200, the risk/reward breaks down for most submission plays.',
  },
  {
    name: 'Snorlax ex Special Illustration Rare (Raw)',
    set: 'Scarlet & Violet 151 (2023)',
    category: 'modern-alt',
    entryPrice: '$30–$60',
    targetReturn: '3–5× in 5 years',
    timeframe: '3–7 years',
    risk: 'high',
    thesis: 'Snorlax is universally beloved — the "relatable" Pokémon that transcends the fanbase. The SIR art captures Snorlax\'s laid-back energy perfectly. International appeal: Snorlax is especially popular in Japan and Southeast Asia, adding export market support.',
    watchOut: 'Snorlax doesn\'t have the "power level" appeal of Mewtwo or the "design" appeal of Gardevoir. Appreciation may be slower.',
  },

  // Vintage Raw — for collectors who want to submit
  {
    name: 'Base Set Unlimited Charizard #4 (Raw, Near Mint)',
    set: 'Base Set Unlimited (1999)',
    category: 'vintage-raw',
    entryPrice: '$150–$300',
    targetReturn: '3–6× via PSA 9 submission',
    timeframe: '1–3 years',
    risk: 'medium',
    thesis: 'An NM raw Unlimited Charizard submits for PSA 9 at $150–300 cost. A PSA 9 Unlimited Charizard sells for $500–800 depending on market timing. That\'s a 2–4× return on the card price alone — before considering time value. Key: you need to accurately assess "Near Mint" condition. Corners, centering, surface, and edges all matter.',
    watchOut: 'Condition assessment is the entire thesis. If the card grades PSA 7 instead of PSA 9, the economics flip. Only buy raw if you can assess corners, centering, and surface under a loupe.',
    tcgId: 'base1-4',
  },
  {
    name: 'Jungle Vaporeon Holo #12 (Raw, Near Mint)',
    set: 'Jungle (1999)',
    category: 'vintage-raw',
    entryPrice: '$40–$80',
    targetReturn: '3–5× via PSA 9 submission',
    timeframe: '1–3 years',
    risk: 'high',
    thesis: 'Vaporeon is the water Eeveelution — strong fan appeal and beautiful artwork. Jungle holos in PSA 9 trade for $150–300. Raw NM copies available for $40–80 regularly. If you can grade your own cards accurately, this is a high-efficiency submission play. Eeveelutions broadly have strong market demand.',
    watchOut: 'Jungle cards grade harder. Expect a lower PSA 9 hit rate than Base Set. Price accordingly: build in a 30–40% PSA 8 scenario into your economics.',
  },
  {
    name: 'Fossil Lapras Holo #10 (Raw, Near Mint)',
    set: 'Fossil (1999)',
    category: 'vintage-raw',
    entryPrice: '$30–$60',
    targetReturn: '3–5× via PSA 9 submission',
    timeframe: '1–3 years',
    risk: 'high',
    thesis: 'Lapras has cross-audience appeal (fans of water types, fans of the Safari Zone, fans of the Pokémon ride mechanic in games). Fossil set holos are undersupplied in PSA 9 — harder to grade than Base Set. PSA 9 Lapras trades for $120–200. Raw NM copies at $30–60 create a compelling submission opportunity.',
    watchOut: 'Fossil Lapras is a niche within a niche. If you can\'t sell PSA 9 within 6 months at target, the liquidity risk is real. Have a floor price in mind before submitting.',
  },
];

const categories = [
  { key: 'vintage-graded', label: 'Vintage Graded', icon: '🏅', blurb: 'Authenticated vintage cards. Lowest risk, proven appreciation, highest entry price.' },
  { key: 'sealed', label: 'Sealed Product', icon: '📦', blurb: 'Booster boxes and ETBs in factory seal. Fixed supply once out of print — the long game.' },
  { key: 'modern-graded', label: 'Modern Graded', icon: '⭐', blurb: 'PSA 10 modern cards. High ceiling, higher supply — select for iconic Pokémon and best art.' },
  { key: 'modern-alt', label: 'Modern Alt Art (Raw Spec)', icon: '🎨', blurb: 'Raw modern cards bought to submit or hold. Highest risk, highest potential short-term return.' },
  { key: 'vintage-raw', label: 'Vintage Raw (Submit)', icon: '📜', blurb: 'Buying raw vintage to grade. Requires strong condition assessment skills. High variance.' },
];

export default function BestPokemonInvestmentsPage() {
  const byCategory = (cat: string) => investments.filter(i => i.category === cat);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Best Pokémon Card Investments for 2026 — What to Buy Now',
        description: 'The definitive Pokémon card investment guide for 2026. Vintage holos, sealed product, modern alt-arts, and graded slabs analyzed by risk tier, entry price, and long-term upside. Data-driven, no hype.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        mainEntityOfPage: 'https://cardvault-two.vercel.app/guides/best-pokemon-investments',
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          Investment Analysis · Updated 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Best Pokémon Card Investments for 2026
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Vintage graded, sealed product, modern alt arts, and raw submission plays — analyzed by risk tier, entry price, and long-term thesis. No hype, no speculation dressed as analysis.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-8 text-sm">
        <p className="text-gray-400">
          <span className="text-yellow-400 font-medium">Note: </span>
          This guide analyzes collectible card market dynamics, not financial investment advice. Pokémon cards are collectibles — not securities, not stores of value with guaranteed return. Every entry here carries real risk of loss. Treat this like a serious hobby with investment characteristics, not a portfolio strategy.
        </p>
      </div>

      {/* Risk tier overview */}
      <div className="mb-10">
        <h2 className="text-white text-xl font-bold mb-4">How to use this guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { tier: 'Low Risk', color: 'emerald', desc: 'Proven appreciation track record. Multiple market cycles survived. PSA-authenticated vintage. You\'re buying history with a floor.' },
            { tier: 'Medium Risk', color: 'yellow', desc: 'Strong thesis, but with 2–3 variables you don\'t control. Modern graded, sealed product under 5 years old, Jungle/Fossil vintage.' },
            { tier: 'High Risk', color: 'orange', desc: 'Speculative plays based on character popularity trends or submission arbitrage. Requires accurate execution. Real downside exists.' },
            { tier: 'Speculative', color: 'rose', desc: 'Thesis depends on multiple uncertain factors. Entry level plays that could 5× or go to zero. Position size accordingly.' },
          ].map(({ tier, color, desc }) => (
            <div key={tier} className={`bg-${color}-950/20 border border-${color}-800/30 rounded-xl p-4`}>
              <div className={`text-${color}-400 font-bold text-sm mb-2`}>{tier}</div>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category sections */}
      {categories.map(({ key, label, icon, blurb }) => {
        const group = byCategory(key);
        if (!group.length) return null;
        return (
          <section key={key} className="mb-14">
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{icon}</span>
                <h2 className="text-white text-2xl font-bold">{label}</h2>
              </div>
              <p className="text-gray-400 text-sm ml-12">{blurb}</p>
            </div>
            <div className="space-y-5">
              {group.map(card => (
                <div key={card.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-base">{card.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${riskColor[card.risk]}`}>
                      {riskLabel[card.risk]}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{card.set}</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-800/60 rounded-xl px-4 py-2">
                      <div className="text-xs text-gray-500 mb-0.5">Entry price</div>
                      <div className="text-white font-bold text-sm">{card.entryPrice}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-xl px-4 py-2">
                      <div className="text-xs text-gray-500 mb-0.5">Target return</div>
                      <div className="text-emerald-400 font-bold text-sm">{card.targetReturn}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-xl px-4 py-2">
                      <div className="text-xs text-gray-500 mb-0.5">Timeframe</div>
                      <div className="text-gray-300 font-medium text-sm">{card.timeframe}</div>
                    </div>
                  </div>

                  {/* Thesis */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1.5">Investment thesis</div>
                    <p className="text-gray-300 text-sm leading-relaxed">{card.thesis}</p>
                  </div>

                  {/* Watch out */}
                  <div className="bg-orange-950/20 border border-orange-800/20 rounded-xl px-4 py-3">
                    <div className="text-xs text-orange-400 font-medium uppercase tracking-wide mb-1">Watch out</div>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.watchOut}</p>
                  </div>

                  {/* Link to card page */}
                  {card.slug && (
                    <div className="mt-4">
                      <Link href={`/sports/${card.slug}`} className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                        View card details →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Market timing section */}
      <div className="bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-gray-900/30 border border-violet-800/30 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-xl mb-3">When to buy, when to sell</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="text-emerald-400 font-semibold text-sm mb-2">Best buying conditions</div>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>· 3–6 months after a major set releases (hype cools, supply remains)</li>
              <li>· Off-season for major Pokémon media (no movie, no game announcement)</li>
              <li>· Immediately after a supply event (set reprint, large collection sale)</li>
              <li>· When broader collector sentiment is negative about "Pokémon is dead"</li>
              <li>· Q1 and Q3 — tax season and back-to-school suppress discretionary spend</li>
            </ul>
          </div>
          <div>
            <div className="text-orange-400 font-semibold text-sm mb-2">Warning signals</div>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>· YouTube and TikTok coverage of your specific card increases 10×</li>
              <li>· eBay asking prices diverge sharply from sold listings</li>
              <li>· PSA grading tier increases (submission surge compresses future supply)</li>
              <li>· New Pokémon game/movie announced with your Pokémon as featured character</li>
              <li>· "This card is going to be the next Charizard" appears in online forums</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Storage callout */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-bold text-lg mb-3">Storage is not optional</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">
          An improperly stored card loses grade potential — and therefore value — irreversibly. Pokémon cards are more vulnerable to humidity than sports cards due to their glossy ink process.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Penny sleeves + toploader', when: 'Raw cards', detail: 'Minimum protection. Always sleeve before placing in toploader.' },
            { label: 'Card savers + 35pt holders', when: 'PSA submission', detail: 'Required for PSA submission. Card savers reduce edge damage during shipping.' },
            { label: 'Humidity-controlled storage', when: 'Sealed product', detail: '45–55% relative humidity. No UV exposure. Upright storage for booster boxes.' },
          ].map(tip => (
            <div key={tip.label} className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-white font-semibold text-sm mb-1">{tip.label}</div>
              <div className="text-yellow-400 text-xs mb-2">{tip.when}</div>
              <div className="text-gray-400 text-xs leading-relaxed">{tip.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Link href="/guides/most-valuable-pokemon-cards" className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          Most Valuable Pokémon Cards
        </Link>
        <Link href="/guides/fake-cards" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Spot Fake Cards
        </Link>
        <Link href="/guides/best-cards-under-100" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Best Cards Under $100
        </Link>
      </div>
    </div>
  );
}
