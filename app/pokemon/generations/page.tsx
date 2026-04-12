import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pokémon TCG by Generation',
  description: 'Browse Pokémon TCG sets organized by generation. From Generation 1 Base Set (1999) through the latest Scarlet & Violet releases. Find the most valuable cards from each era.',
};

const generations = [
  {
    gen: '1',
    name: 'Generation 1',
    subtitle: 'Base Set — The Original 151',
    years: '1996–1999 (Japan) / 1999–2000 (English)',
    games: 'Pokémon Red & Blue / Green',
    description: 'The generation that started it all. Base Set, Jungle, Fossil, Team Rocket, and the Gym series defined Pokémon collecting for a generation and remain the most valuable vintage cards in the hobby. Charizard, Pikachu, Mewtwo, and Blastoise are the faces of this era.',
    sets: ['Base Set', 'Jungle', 'Fossil', 'Base Set 2', 'Team Rocket'],
    topCards: ['1st Edition Charizard', 'Pikachu Illustrator (promo)', 'Dark Charizard (Team Rocket)'],
    keyFact: 'The 1st Edition Base Set Charizard is the most valuable production Pokémon card, selling for $420,000 in 2022.',
    icon: '🔴',
    color: 'from-red-950/40 to-gray-900/20',
    badge: 'Most valuable era',
    badgeColor: 'bg-amber-900/60 text-amber-400 border-amber-700/40',
  },
  {
    gen: '2',
    name: 'Generation 2',
    subtitle: 'Neo — Gold & Silver',
    years: '1999–2000 (Japan) / 2000–2002 (English)',
    games: 'Pokémon Gold & Silver / Crystal',
    description: 'The Neo series introduced 100 new Pokémon including Lugia and Ho-Oh. The 1st Edition Lugia from Neo Genesis is considered the most valuable card from the Gen 2 era, while Neo Destiny\'s Shining cards were the first alternate-color (shiny) Pokémon ever printed.',
    sets: ['Neo Genesis', 'Neo Discovery', 'Neo Revelation', 'Neo Destiny'],
    topCards: ['Lugia 1st Edition (Neo Genesis)', 'Shining Charizard (Neo Destiny)', 'Ho-Oh 1st Edition (Neo Revelation)'],
    keyFact: 'The 1st Edition Neo Genesis Lugia PSA 10 sold for $144,300 — the most valuable Gen 2 card.',
    icon: '💛',
    color: 'from-yellow-950/40 to-gray-900/20',
    badge: 'Neo era',
    badgeColor: 'bg-yellow-900/60 text-yellow-400 border-yellow-700/40',
  },
  {
    gen: '3',
    name: 'Generation 3',
    subtitle: 'EX Series — Hoenn',
    years: '2003–2007',
    games: 'Pokémon Ruby & Sapphire / Emerald / FireRed & LeafGreen',
    description: 'The EX series introduced the Pokémon-ex mechanic and the first chase-card rarity structure that mirrors modern card design. Gold Star cards (one per box) drove massive pack opening and created some of the most valuable non-vintage Pokémon cards. The EX Dragon Frontiers Charizard Gold Star is the crown jewel.',
    sets: ['EX Ruby & Sapphire', 'EX FireRed & LeafGreen', 'EX Dragon Frontiers', 'EX Deoxys', 'EX Unseen Forces'],
    topCards: ['Charizard Gold Star (Dragon Frontiers)', 'Rayquaza Gold Star (Deoxys)', 'Umbreon Gold Star (POP Series 5)'],
    keyFact: 'Gold Star Charizard from Dragon Frontiers sold for $60,065 in 2021. Every EX from Dragon Frontiers commands premium PSA 10 prices.',
    icon: '🌿',
    color: 'from-emerald-950/40 to-gray-900/20',
    badge: 'Gold Star era',
    badgeColor: 'bg-emerald-900/60 text-emerald-400 border-emerald-700/40',
  },
  {
    gen: '4',
    name: 'Generation 4',
    subtitle: 'Diamond & Pearl — Sinnoh',
    years: '2007–2010',
    games: 'Pokémon Diamond & Pearl / Platinum / HeartGold & SoulSilver',
    description: 'The Diamond & Pearl era introduced Lv.X cards as the premiere rarity. The HGSS sets added Primes — beautiful full-art cards that foreshadowed the modern era\'s full-art design language. Gengar Prime and Espeon Prime remain the most coveted from this period.',
    sets: ['Diamond & Pearl', 'Mysterious Treasures', 'HeartGold & SoulSilver', 'Undaunted', 'Triumphant'],
    topCards: ['Charizard Lv.X (Mysterious Treasures)', 'Gengar Prime (Triumphant)', 'Espeon Prime (Undaunted)'],
    keyFact: 'Primes from HGSS are considered the spiritual predecessor to modern full-art cards and maintain strong collector demand.',
    icon: '💎',
    color: 'from-blue-950/40 to-gray-900/20',
    badge: 'Lv.X / Prime era',
    badgeColor: 'bg-blue-900/60 text-blue-400 border-blue-700/40',
  },
  {
    gen: '5',
    name: 'Generation 5',
    subtitle: 'Black & White — Unova',
    years: '2011–2013',
    games: 'Pokémon Black & White / BW2',
    description: 'Black & White introduced EX cards for the modern era — Full Art versions of Pokémon-EX as rare variants of the EX cards. This is where the Full Art rarity began to systematically drive collector demand. The next-generation EX mechanic laid the groundwork for modern collecting culture.',
    sets: ['Black & White', 'Next Destinies', 'Dark Explorers', 'Plasma Storm', 'Legendary Treasures'],
    topCards: ['Mewtwo EX Full Art (Next Destinies)', 'Charizard EX Full Art (Flashfire)', 'Rayquaza EX Full Art (Dragons Exalted)'],
    keyFact: 'The BW era introduced the Full Art variant as a systematic chase card, which is now the core of modern Pokémon collecting.',
    icon: '⚫',
    color: 'from-gray-800/40 to-gray-900/20',
    badge: 'Full Art era',
    badgeColor: 'bg-gray-700/60 text-gray-300 border-gray-600/40',
  },
  {
    gen: '6',
    name: 'Generation 6',
    subtitle: 'XY — Kalos',
    years: '2014–2016',
    games: 'Pokémon X & Y / ORAS',
    description: 'The XY era refined Full Art cards and introduced BREAK Evolution cards. XY Evolutions — a reprint of the original Base Set — became one of the most popular modern sets due to its nostalgic Charizard Full Art and Surfing Pikachu. XY Evolutions boxes became prized sealed collectibles.',
    sets: ['XY', 'Phantom Forces', 'Primal Clash', 'Roaring Skies', 'XY Evolutions'],
    topCards: ['Charizard EX Full Art (XY Evolutions)', 'Surfing Pikachu (XY Evolutions)', 'M Rayquaza EX Full Art'],
    keyFact: 'XY Evolutions is one of the most opened modern Pokémon sets due to the nostalgic Base Set reprints.',
    icon: '🦋',
    color: 'from-violet-950/40 to-gray-900/20',
    badge: 'Nostalgia era',
    badgeColor: 'bg-violet-900/60 text-violet-400 border-violet-700/40',
  },
  {
    gen: '7',
    name: 'Generation 7',
    subtitle: 'Sun & Moon — Alola',
    years: '2017–2019',
    games: 'Pokémon Sun & Moon / Ultra Sun & Ultra Moon',
    description: 'Sun & Moon introduced GX cards and the Rainbow Rare rarity. Tag Team GX cards — featuring two Pokémon together with powerful combined attacks — became extremely popular chase cards. The aesthetic quality of S&M era art holds up extremely well.',
    sets: ['Sun & Moon', 'Guardians Rising', 'Burning Shadows', 'Team Up', 'Unbroken Bonds', 'Cosmic Eclipse'],
    topCards: ['Pikachu & Zekrom GX (Full Art)', 'Mewtwo & Mew GX (Unified Minds)', 'Gengar & Mimikyu GX (Full Art)'],
    keyFact: 'Cosmic Eclipse is considered one of the best-looking modern Pokémon sets, with its illustrated full-art trainers commanding significant premiums.',
    icon: '☀️',
    color: 'from-orange-950/40 to-gray-900/20',
    badge: 'GX / Tag Team era',
    badgeColor: 'bg-orange-900/60 text-orange-400 border-orange-700/40',
  },
  {
    gen: '8',
    name: 'Generation 8',
    subtitle: 'Sword & Shield — Galar',
    years: '2020–2022',
    games: 'Pokémon Sword & Shield',
    description: 'Sword & Shield coincided with the pandemic-era card boom and introduced VMAX cards. The Umbreon VMAX Secret Rare (nicknamed "Moonbreon") from Evolving Skies became one of the most culturally significant modern cards. Crown Zenith capped the era with premium special set content.',
    sets: ['Sword & Shield', 'Darkness Ablaze', 'Vivid Voltage', 'Battle Styles', 'Chilling Reign', 'Evolving Skies', 'Fusion Strike', 'Brilliant Stars', 'Crown Zenith'],
    topCards: ['Umbreon VMAX (Moonbreon) — Evolving Skies', 'Charizard VMAX Alt Art — Darkness Ablaze', 'Pikachu VMAX Rainbow — Vivid Voltage'],
    keyFact: 'Evolving Skies is the most-opened Sword & Shield set due to the Umbreon and Espeon VMAX alt arts. Sealed boxes command strong premiums.',
    icon: '⚔️',
    color: 'from-indigo-950/40 to-gray-900/20',
    badge: 'VMAX era',
    badgeColor: 'bg-indigo-900/60 text-indigo-400 border-indigo-700/40',
  },
  {
    gen: '9',
    name: 'Generation 9',
    subtitle: 'Scarlet & Violet — Paldea',
    years: '2023–present',
    games: 'Pokémon Scarlet & Violet',
    description: 'Scarlet & Violet introduced ex cards (lowercase), Special Illustration Rares, and the highest-quality full-art cards ever printed by The Pokémon Company. Prismatic Evolutions (2025) became one of the most sought-after sets in Pokémon history, with pack shortages driving nationwide retailer sellouts.',
    sets: ['Scarlet & Violet', 'Paldea Evolved', 'Obsidian Flames', 'Paradox Rift', 'Temporal Forces', 'Twilight Masquerade', 'Shrouded Fable', 'Stellar Crown', 'Prismatic Evolutions'],
    topCards: ['Charizard ex SIR — Obsidian Flames', 'Umbreon ex SIR — Prismatic Evolutions', 'Miraidon ex SIR — Scarlet & Violet'],
    keyFact: 'Prismatic Evolutions launched in January 2025 to unprecedented demand — product sold out within hours nationwide and sealed product commanded 300%+ premiums for months.',
    icon: '🌹',
    color: 'from-rose-950/40 to-gray-900/20',
    badge: 'Current era',
    badgeColor: 'bg-rose-900/60 text-rose-400 border-rose-700/40',
  },
];

export default function PokemonGenerationsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/pokemon" className="hover:text-gray-300 transition-colors">Pokémon TCG</Link>
          <span>/</span>
          <span className="text-gray-300">By Generation</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Pokémon TCG by Generation</h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Browse every Pokémon TCG era from the original 1996 Japanese Base Set through the current Scarlet & Violet releases. Each generation has a distinct collecting story.
        </p>
      </div>

      {/* Generation cards */}
      <div className="space-y-5">
        {generations.map(gen => (
          <Link key={gen.gen} href={`/pokemon/generations/${gen.gen}`} className="group block">
            <div className={`bg-gradient-to-br ${gen.color} border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all hover:-translate-y-0.5`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">{gen.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${gen.badgeColor}`}>
                      {gen.badge}
                    </span>
                    <span className="text-gray-600 text-xs">{gen.years}</span>
                  </div>
                  <h2 className="text-white font-bold text-xl mb-0.5 group-hover:text-emerald-400 transition-colors">
                    {gen.name} — {gen.subtitle}
                  </h2>
                  <p className="text-gray-500 text-xs mb-3">{gen.games}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{gen.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-gray-600 text-xs mb-1">Key sets</div>
                      <div className="flex flex-wrap gap-1">
                        {gen.sets.slice(0, 4).map(s => (
                          <span key={s} className="bg-gray-800/60 text-gray-400 text-xs px-2 py-0.5 rounded">{s}</span>
                        ))}
                        {gen.sets.length > 4 && (
                          <span className="text-gray-600 text-xs py-0.5">+{gen.sets.length - 4} more</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs mb-1">Top cards</div>
                      <ul className="space-y-0.5">
                        {gen.topCards.slice(0, 2).map(c => (
                          <li key={c} className="text-gray-400 text-xs flex gap-1.5">
                            <span className="text-amber-500 shrink-0">·</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 bg-amber-950/30 border border-amber-800/20 rounded-xl px-3 py-2 text-xs text-amber-400/80">
                    {gen.keyFact}
                  </div>

                  <div className="mt-4 text-emerald-400 text-sm font-medium">
                    Explore Generation {gen.gen} →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/pokemon" className="inline-flex items-center gap-2 bg-yellow-950/40 border border-yellow-800/30 hover:border-yellow-600/50 text-yellow-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          ⚡ All Pokémon Sets
        </Link>
        <Link href="/guides/most-valuable-pokemon-cards" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          Most Valuable Cards
        </Link>
        <Link href="/guides/when-to-grade-your-cards" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
          When to Grade
        </Link>
      </div>
    </div>
  );
}
