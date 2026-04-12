import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  params: Promise<{ gen: string }>;
}

interface PokemonSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  total: number;
  images: { logo: string; symbol: string };
}

interface GenerationData {
  gen: string;
  name: string;
  subtitle: string;
  years: string;
  games: string;
  description: string;
  historicalContext: string;
  collectingContext: string;
  series: string[];
  topCards: Array<{ name: string; price: string; note: string; tcgId?: string }>;
  icon: string;
  color: string;
}

const generationData: Record<string, GenerationData> = {
  '1': {
    gen: '1',
    name: 'Generation 1',
    subtitle: 'The Original 151',
    years: '1996–2000',
    games: 'Pokémon Red, Blue, Yellow (Game Boy)',
    description: 'Generation 1 introduced the world to 151 Pokémon and the card game that would define collecting culture for the next three decades. The original English sets — Base Set, Jungle, Fossil, Base Set 2, and Team Rocket — represent the holy grail of Pokémon card collecting.',
    historicalContext: 'The English Base Set launched in January 1999 in North America. Wizards of the Coast (then holders of the TCG license) printed three versions: 1st Edition, Shadowless, and Unlimited — all in 1999. The 1st Edition print run was small, the cards were heavier stock than modern cards, and the holographic treatment was uniquely spectacular. Most collectors received Unlimited print cards, making 1st Edition copies significantly rarer.',
    collectingContext: 'Charizard is the undisputed king of Gen 1 collecting. A PSA 10 1st Edition Base Set Charizard sold for $420,000 in March 2022 — the record for any production Pokémon card. But the entire 1st Edition holo set commands multiples over Unlimited, and even Shadowless (the second print, identifiable by the absence of a drop shadow on the card image box) trades at meaningful premiums.',
    series: ['Base'],
    topCards: [
      { name: '1st Edition Charizard Holo', price: '$420,000 (PSA 10, 2022)', note: 'Most valuable production Pokémon card', tcgId: 'base1-4' },
      { name: '1st Edition Blastoise Holo', price: '$45,100 (PSA 10, 2021)', note: 'Water starter commands second-highest premium', tcgId: 'base1-2' },
      { name: 'Pikachu Illustrator', price: '$5,275,000 (PSA 10)', note: 'Trophy card — not Base Set but Gen 1 era' },
      { name: '1st Edition Chansey Holo', price: '$14,400 (PSA 10)', note: 'Pink surface makes PSA 10 very rare' },
      { name: 'Dark Charizard (Team Rocket)', price: '$9,600 (PSA 10)', note: 'Most valuable Team Rocket holo' },
    ],
    icon: '🔴',
    color: 'from-red-950/60 to-gray-900',
  },
  '2': {
    gen: '2',
    name: 'Generation 2',
    subtitle: 'Gold & Silver — Johto',
    years: '1999–2002',
    games: 'Pokémon Gold, Silver, Crystal (Game Boy Color)',
    description: 'Generation 2 introduced 100 new Pokémon and the beloved Johto region. The Neo series (Neo Genesis, Neo Discovery, Neo Revelation, Neo Destiny) is widely considered the finest-looking era of Pokémon cards, with clean art on premium stock.',
    historicalContext: 'The Neo series was produced by WotC in limited quantities compared to Base Set, making high-grade copies far rarer. 1st Edition prints exist for Neo Genesis and Neo Discovery — both are extremely valuable. Neo Destiny, the final Neo set, introduced Shining Pokémon: the first alternate-color (shiny) Pokémon ever in the card game.',
    collectingContext: "The 1st Edition Neo Genesis Lugia is the crown jewel of Gen 2 collecting — a PSA 10 sold for $144,300. Ho-Oh from Neo Revelation is the second most valuable. Shining Pokémon from Neo Destiny are condition-sensitive nightmares that are almost never found in PSA 10, making them extremely valuable when they surface.",
    series: ['Neo'],
    topCards: [
      { name: 'Lugia 1st Edition (Neo Genesis)', price: '$144,300 (PSA 10, 2021)', note: 'Most valuable Gen 2 card' },
      { name: 'Ho-Oh 1st Edition (Neo Revelation)', price: '$38,400 (PSA 10, 2022)', note: 'Legendary bird, limited 1st Ed print' },
      { name: 'Shining Charizard (Neo Destiny)', price: '$11,400 (PSA 9, 2021)', note: 'First shiny Charizard in the game' },
      { name: 'Espeon (Neo Discovery holo)', price: '$7,200 (PSA 10)', note: 'Eevee evolution collector favorite' },
    ],
    icon: '💛',
    color: 'from-yellow-950/60 to-gray-900',
  },
  '3': {
    gen: '3',
    name: 'Generation 3',
    subtitle: 'Ruby & Sapphire — Hoenn',
    years: '2003–2007',
    games: 'Pokémon Ruby, Sapphire, Emerald, FireRed, LeafGreen (Game Boy Advance)',
    description: "Generation 3 introduced the EX mechanic and with it the hobby's first systematic chase card structure. EX cards were the first Pokémon to have higher HP and unique attacks — and the first to have rare full-card holographic variants (ex versions). Gold Star cards — one per box — defined this era.",
    historicalContext: "The EX era ran from 2003 through 2007 across 17 sets. WotC lost the TCG license to Nintendo after EX Ruby & Sapphire launched; the sets were subsequently produced in-house by The Pokémon Company. Gold Star cards appeared starting with EX Team Rocket Returns and featured alternate artwork with a foil star — approximately one per 72-pack booster box.",
    collectingContext: 'EX Dragon Frontiers is the most collectable EX era set — every ex from the set commands premium PSA 10 prices. The shiny Charizard Gold Star (black/red instead of orange) is the most valuable Gold Star card at $60,065. Rayquaza Gold Star from EX Deoxys is the second most valuable at $45,100.',
    series: ['EX'],
    topCards: [
      { name: 'Charizard Gold Star (Dragon Frontiers)', price: '$60,065 (PSA 10, 2021)', note: 'Shiny Charizard — most coveted Gold Star' },
      { name: 'Rayquaza Gold Star (Deoxys)', price: '$45,100 (PSA 10, 2022)', note: 'Sky-serpent full-card holo' },
      { name: 'Umbreon Gold Star (POP Series 5)', price: '$70,000 (PSA 10, 2021)', note: 'Rarest Gold Star due to promo distribution' },
      { name: 'Lugia ex (Unseen Forces)', price: '$14,400 (PSA 10, 2021)', note: 'Lugia with gold stadium holo' },
    ],
    icon: '🌿',
    color: 'from-emerald-950/60 to-gray-900',
  },
  '4': {
    gen: '4',
    name: 'Generation 4',
    subtitle: 'Diamond & Pearl — Sinnoh',
    years: '2007–2010',
    games: 'Pokémon Diamond, Pearl, Platinum, HeartGold, SoulSilver (DS)',
    description: 'Generation 4 introduced Lv.X cards as the primary chase rarity, followed by the HGSS era\'s Prime cards — full-bleed illustrations that foreshadowed modern card design. The Undaunted and Triumphant sets from the HGSS series are particularly beloved.',
    historicalContext: 'The Diamond & Pearl era coincided with the DS generation and a period of relative quiet in the card market. HGSS (HeartGold & SoulSilver) sets launched in 2010 and introduced Prime cards — cards with full-art illustrations that extended to the edges of the card with no border. Prime cards are considered the direct ancestor of modern full-art cards.',
    collectingContext: "Gengar Prime and Espeon Prime from HGSS are the most coveted cards from this era. Both trade consistently and have maintained value through multiple market cycles. The aesthetic quality of the HGSS Prime cards holds up extremely well against modern cards.",
    series: ['Diamond & Pearl', 'HeartGold & SoulSilver'],
    topCards: [
      { name: 'Charizard Lv.X (Mysterious Treasures)', price: '$2,400 (PSA 10)', note: 'Definitive Lv.X chase card' },
      { name: 'Gengar Prime (Triumphant)', price: '$4,800 (PSA 10)', note: 'Most popular HGSS Prime' },
      { name: 'Espeon Prime (Undaunted)', price: '$6,000 (PSA 10)', note: 'Eevee evolution command premium' },
      { name: 'Umbreon Prime (Undaunted)', price: '$4,200 (PSA 10)', note: 'Pair with Espeon Prime for HGSS set completion' },
    ],
    icon: '💎',
    color: 'from-blue-950/60 to-gray-900',
  },
  '5': {
    gen: '5',
    name: 'Generation 5',
    subtitle: 'Black & White — Unova',
    years: '2011–2013',
    games: 'Pokémon Black, White, Black 2, White 2 (DS)',
    description: 'Generation 5 introduced the modern EX mechanic (different from EX era) and Full Art cards as rare variants of EX Pokémon. The Black & White era is where the modern collecting structure — base card, EX, Full Art EX, Secret Rare — was fully established.',
    historicalContext: "The Black & White era relaunched the TCG with a fresh aesthetic influenced by the new Unova Pokémon. Mewtwo EX was the first breakout modern EX, selling for $50+ in early 2012 when the card game was at peak competitive play. The BW era's Full Art EX cards set the template for every set through 2023.",
    collectingContext: "Most BW era Full Art cards have depreciated significantly since 2021. The Charizard EX from Flashfire is the standout value hold. High-grade BW era cards are available at reasonable prices compared to older eras — an accessible entry point for era collecting.",
    series: ['Black & White'],
    topCards: [
      { name: 'Mewtwo EX Full Art (Next Destinies)', price: '$600 (PSA 10)', note: 'First breakout BW era card' },
      { name: 'Charizard EX Full Art (Flashfire)', price: '$1,200 (PSA 10)', note: 'Most valuable BW era Charizard' },
      { name: 'Keldeo EX Full Art (Boundaries Crossed)', price: '$300 (PSA 10)', note: 'Water-horse breakout in BW era' },
    ],
    icon: '⚫',
    color: 'from-gray-800/60 to-gray-900',
  },
  '6': {
    gen: '6',
    name: 'Generation 6',
    subtitle: 'XY — Kalos',
    years: '2014–2017',
    games: 'Pokémon X, Y, Omega Ruby, Alpha Sapphire (3DS)',
    description: "Generation 6 produced the XY series — 16 sets in 3 years. XY Evolutions (2016) stands apart as a nostalgic reprint of the original Base Set, introducing classic card designs to a new generation while sending veteran collectors into a frenzy over Charizard and Pikachu reprints.",
    historicalContext: "XY Evolutions was designed as a love letter to the original game — featuring reprints of Base Set cards with updated HP values but identical artwork. The set's Charizard EX (Full Art) and Surfing Pikachu became instant collector favorites. Sealed XY Evolutions boxes became prized collectibles commanding 300%+ premiums.",
    collectingContext: "XY Evolutions is the most opened modern set due to nostalgia demand. The Charizard EX Full Art and M Charizard EX from this set are the standout pulls. Outside Evolutions, Roaring Skies M Rayquaza EX is one of the most visually striking cards from this era.",
    series: ['XY'],
    topCards: [
      { name: 'Charizard EX Full Art (XY Evolutions)', price: '$1,800 (PSA 10)', note: 'Nostalgic Base Set Charizard in modern packaging' },
      { name: 'Surfing Pikachu (XY Evolutions)', price: '$3,600 (PSA 10)', note: 'Community favorite — Gen 1 reference card' },
      { name: 'M Rayquaza EX (Roaring Skies)', price: '$600 (PSA 10)', note: 'Spectacular sky serpent artwork' },
    ],
    icon: '🦋',
    color: 'from-violet-950/60 to-gray-900',
  },
  '7': {
    gen: '7',
    name: 'Generation 7',
    subtitle: 'Sun & Moon — Alola',
    years: '2017–2019',
    games: 'Pokémon Sun, Moon, Ultra Sun, Ultra Moon (3DS)',
    description: 'Generation 7 introduced GX cards and the Rainbow Rare rarity. The Sun & Moon era is defined by its high-quality art and Tag Team GX cards — two Pokémon on one card with powerful combined attacks. The Tag Team format produced some of the most visually and mechanically interesting cards of any era.',
    historicalContext: "The GX mechanic replaced EX with higher HP and a powerful once-per-game GX attack. Full Art GX, Rainbow Rare GX, and Secret Rare GX represented three tiers of rarity above the base GX card. The Sun & Moon era was the last era before the pandemic card boom, meaning prices were still rational when these cards were current.",
    collectingContext: "Cosmic Eclipse — the final S&M set — is considered one of the most beautiful Pokémon sets ever produced, with Full Art Supporter cards featuring illustrated Trainer artwork. Tag Team GX pairs like Gengar & Mimikyu and Pikachu & Zekrom command the highest premiums from this era.",
    series: ['Sun & Moon'],
    topCards: [
      { name: 'Pikachu & Zekrom GX Full Art (Team Up)', price: '$1,200 (PSA 10)', note: 'Tag Team with electric combo' },
      { name: 'Mewtwo & Mew GX (Unified Minds)', price: '$600 (PSA 10)', note: 'Ultimate psychic combo card' },
      { name: 'Gengar & Mimikyu GX Full Art (Team Up)', price: '$1,800 (PSA 10)', note: 'Fan favorite ghost types combined' },
      { name: 'Illustrated Trainer cards (Cosmic Eclipse)', price: '$600–$2,400 (PSA 10)', note: 'Most beautiful art of the era' },
    ],
    icon: '☀️',
    color: 'from-orange-950/60 to-gray-900',
  },
  '8': {
    gen: '8',
    name: 'Generation 8',
    subtitle: 'Sword & Shield — Galar',
    years: '2020–2022',
    games: 'Pokémon Sword, Shield, Brilliant Diamond, Shining Pearl, Legends: Arceus (Switch)',
    description: 'Generation 8 — the Sword & Shield era — coincided precisely with the pandemic card boom of 2020-2021. VMAX cards, introduced here, are giant full-card art variants of V Pokémon. Evolving Skies produced "Moonbreon" — the Umbreon VMAX Secret Rare — which became a cultural touchstone in the hobby.',
    historicalContext: "The S&S era began in February 2020, weeks before COVID-19 lockdowns. The combination of stimulus money, lockdown boredom, and social media amplification drove card prices to unprecedented levels. Evolving Skies (Aug 2021) launched at peak hype — boxes originally MSRP $130 traded for $300+. The Umbreon VMAX full art — its dark blue moonlit scene — became the aesthetic identity of the era.",
    collectingContext: "Evolving Skies is the most collected S&S set due to Umbreon and Espeon VMAX alt arts. Sealed boxes continue to trade at strong premiums. The Charizard VMAX from Darkness Ablaze (the first full-art Charizard VMAX) drove massive demand for that set. Crown Zenith capped the era with premium content drawn from the S&S run.",
    series: ['Sword & Shield'],
    topCards: [
      { name: 'Umbreon VMAX (Moonbreon) — Evolving Skies', price: '$5,100 (PSA 10, 2022)', note: 'Most culturally significant modern card' },
      { name: 'Charizard VMAX Alt Art — Darkness Ablaze', price: '$3,600 (PSA 10, 2022)', note: 'First full-card Charizard VMAX' },
      { name: 'Espeon VMAX Alt Art — Evolving Skies', price: '$3,600 (PSA 10)', note: 'Pairs with Umbreon for Eevee duo' },
      { name: 'Pikachu VMAX Rainbow — Vivid Voltage', price: '$1,800 (PSA 10)', note: 'Franchise mascot in max form' },
    ],
    icon: '⚔️',
    color: 'from-indigo-950/60 to-gray-900',
  },
  '9': {
    gen: '9',
    name: 'Generation 9',
    subtitle: 'Scarlet & Violet — Paldea',
    years: '2023–present',
    games: 'Pokémon Scarlet, Violet (Switch)',
    description: 'Generation 9 is the current era, featuring the highest-quality full-art cards ever produced by The Pokémon Company. Special Illustration Rares (SIR) — full bleed, full scene illustrations — are the premium rarity of this era. Prismatic Evolutions became the most in-demand set of 2025.',
    historicalContext: "Scarlet & Violet launched in March 2023 with a completely redesigned card frame. The new SIR rarity features full-card illustration scenes with no border — the most visually immersive cards ever produced. The Pokémon Company has systematically improved print quality with each S&V set release.",
    collectingContext: "Prismatic Evolutions (January 2025) triggered nationwide product shortages and was one of the most significant Pokémon TCG events since the 2021 boom. The Umbreon ex SIR and Pikachu ex SIR are the defining cards of the set. Obsidian Flames' black Charizard ex SIR was the breakout card of 2023.",
    series: ['Scarlet & Violet'],
    topCards: [
      { name: 'Charizard ex SIR — Obsidian Flames', price: '$2,400 (PSA 10)', note: 'Black Charizard — breakout card of 2023' },
      { name: 'Umbreon ex SIR — Prismatic Evolutions', price: '$1,800 (PSA 10)', note: 'Moonbreon successor for the S&V era' },
      { name: 'Miraidon ex SIR — Scarlet & Violet', price: '$1,200 (PSA 10)', note: 'Face Legendary of the new era' },
      { name: 'Pikachu ex SIR — Prismatic Evolutions', price: '$1,200 (PSA 10)', note: 'Flagship mascot in new SIR format' },
    ],
    icon: '🌹',
    color: 'from-rose-950/60 to-gray-900',
  },
};

async function getSetsBySeries(seriesNames: string[]): Promise<PokemonSet[]> {
  try {
    const res = await fetch('https://api.pokemontcg.io/v2/sets?orderBy=releaseDate&pageSize=250', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const allSets: PokemonSet[] = data.data ?? [];
    return allSets.filter(s => seriesNames.includes(s.series));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return Object.keys(generationData).map(gen => ({ gen }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gen } = await params;
  const data = generationData[gen];
  if (!data) return { title: 'Generation Not Found' };
  return {
    title: `Pokémon ${data.name} Cards — ${data.subtitle}`,
    description: `Browse all Pokémon TCG sets from ${data.name} (${data.years}). ${data.description.slice(0, 120)}...`,
  };
}

export default async function PokemonGenerationPage({ params }: Props) {
  const { gen } = await params;
  const data = generationData[gen];
  if (!data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Generation not found.</p>
        <Link href="/pokemon/generations" className="text-emerald-400 hover:text-emerald-300 mt-4 inline-block">
          Back to all generations
        </Link>
      </div>
    );
  }

  const sets = await getSetsBySeries(data.series);

  // Prev / next navigation
  const genNum = parseInt(gen);
  const prevGen = genNum > 1 ? String(genNum - 1) : null;
  const nextGen = genNum < 9 ? String(genNum + 1) : null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className={`bg-gradient-to-b ${data.color} py-12`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/pokemon" className="hover:text-gray-300 transition-colors">Pokémon TCG</Link>
            <span>/</span>
            <Link href="/pokemon/generations" className="hover:text-gray-300 transition-colors">Generations</Link>
            <span>/</span>
            <span className="text-gray-300">{data.name}</span>
          </nav>

          <div className="flex items-start gap-4 mb-6">
            <span className="text-5xl">{data.icon}</span>
            <div>
              <p className="text-gray-500 text-sm mb-1">{data.games} · {data.years}</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{data.name} — {data.subtitle}</h1>
            </div>
          </div>

          <p className="text-gray-400 leading-relaxed max-w-3xl">{data.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Historical context */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Historical Context</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-sm leading-relaxed">{data.historicalContext}</p>
          </div>
        </section>

        {/* Most valuable cards */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Most Valuable Cards from This Era</h2>
          <div className="space-y-3">
            {data.topCards.map((card, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-start gap-4">
                <span className="text-gray-600 font-bold text-lg shrink-0 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      {card.tcgId ? (
                        <Link href={`/pokemon/cards/${card.tcgId}`} className="text-white font-semibold hover:text-yellow-400 transition-colors">
                          {card.name}
                        </Link>
                      ) : (
                        <span className="text-white font-semibold">{card.name}</span>
                      )}
                      <p className="text-gray-500 text-xs mt-0.5">{card.note}</p>
                    </div>
                    <span className="text-amber-400 font-bold text-sm shrink-0">{card.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collecting context */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Collecting This Era</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-sm leading-relaxed">{data.collectingContext}</p>
          </div>
        </section>

        {/* Sets from this generation */}
        {sets.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-5">
              Sets from {data.name}
              <span className="text-gray-500 text-sm font-normal ml-2">({sets.length} sets)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sets.map(set => (
                <Link key={set.id} href={`/pokemon/sets/${set.id}`} className="group block">
                  <div className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all hover:-translate-y-0.5">
                    <div className="relative h-12 mb-3 flex items-center justify-center">
                      {set.images?.logo ? (
                        <Image
                          src={set.images.logo}
                          alt={set.name}
                          fill
                          sizes="120px"
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <span className="text-2xl">{data.icon}</span>
                      )}
                    </div>
                    <h3 className="text-white text-xs font-semibold text-center line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {set.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-500 text-xs">
                        {set.releaseDate ? new Date(set.releaseDate).getFullYear() : '—'}
                      </span>
                      <span className="text-gray-500 text-xs">{set.total} cards</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Navigation between generations */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-6">
          {prevGen ? (
            <Link
              href={`/pokemon/generations/${prevGen}`}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700"
            >
              ← Generation {prevGen}
            </Link>
          ) : <div />}

          <Link
            href="/pokemon/generations"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            All Generations
          </Link>

          {nextGen ? (
            <Link
              href={`/pokemon/generations/${nextGen}`}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700"
            >
              Generation {nextGen} →
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
}
