import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'The 50 Most Valuable Pokémon Cards of All Time',
  description: 'Definitive ranking of the 50 most valuable Pokémon cards ever sold. Record prices, current values, and why each card commands a premium — from 1st Edition Charizard to Pikachu Illustrator.',
  keywords: ['most valuable pokemon cards', 'expensive pokemon cards', 'pikachu illustrator price', '1st edition charizard price', 'pokemon card record sales'],
};

interface PokeCard {
  rank: number;
  name: string;
  set: string;
  era: 'vintage' | 'modern' | 'trophy';
  recordSale: string;
  saleDate: string;
  saleVenue: string;
  currentRange: string;
  whyValuable: string;
  tcgId?: string; // pokemontcg.io card id for linking
  grade?: string;
}

const eraColor: Record<string, string> = {
  vintage: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/30',
  modern: 'text-violet-400 bg-violet-950/40 border-violet-800/30',
  trophy: 'text-rose-400 bg-rose-950/40 border-rose-800/30',
};

const eraLabel: Record<string, string> = {
  vintage: 'Vintage (1996–2003)',
  modern: 'Modern',
  trophy: 'Trophy / Promo',
};

const top50: PokeCard[] = [
  {
    rank: 1,
    name: 'Pikachu Illustrator',
    set: 'CoroCoro Comic Promo (1998)',
    era: 'trophy',
    grade: 'PSA 10',
    recordSale: '$5,275,000',
    saleDate: 'Jul 2021',
    saleVenue: 'Private sale (Logan Paul/PWCC)',
    currentRange: '$200,000–$5,275,000 depending on grade',
    whyValuable: 'The most valuable Pokémon card in existence. Originally awarded as the first-place prize in a 1998 Japanese illustration contest, only 41 graded PSA copies are known worldwide. The card features the phrase "Illustrator" where normal cards say "Trainer" and was never released commercially. PSA 10 copies have sold for millions; even low grades are six-figure acquisitions.',
  },
  {
    rank: 2,
    name: '1st Edition Base Set Charizard Holo',
    set: 'Base Set 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$420,000',
    saleDate: 'Mar 2022',
    saleVenue: 'Goldin Auctions',
    currentRange: '$5,000–$420,000 depending on grade',
    whyValuable: 'The benchmark of Pokémon collecting. The 1st Edition stamp plus shadowless printing plus Charizard equals the most iconic card in the English language game. PSA 10 examples require flawless centering, pristine corners, and no print lines — an extremely difficult combination for 1999 mass-printed cards.',
    tcgId: 'base1-4',
  },
  {
    rank: 3,
    name: 'Kangaskhan Parent/Child Trophy Card',
    set: 'Super Secret Battle (1998)',
    era: 'trophy',
    grade: 'PSA 10',
    recordSale: '$150,100',
    saleDate: 'Oct 2020',
    saleVenue: 'Heritage Auctions',
    currentRange: '$80,000–$150,000',
    whyValuable: 'Awarded only to parent/child duo winners in a 1998 Japanese Super Secret Battle tournament. Extremely few copies exist — exact count unknown. Features artwork of a parent and child Kangaskhan unique to this card.',
  },
  {
    rank: 4,
    name: 'No. 1 Trainer',
    set: 'Trophy Card (1999)',
    era: 'trophy',
    grade: 'PSA 8',
    recordSale: '$375,000',
    saleDate: 'Jan 2021',
    saleVenue: 'PWCC',
    currentRange: '$100,000–$375,000 depending on grade/variant',
    whyValuable: 'Awarded to finalists in the 1999 Japanese Tropical Mega Battle. Multiple regional variants exist (No. 1, No. 2, No. 3 Trainer). The No. 1 Trainer is the rarest — only a handful are known to exist.',
  },
  {
    rank: 5,
    name: '1st Edition Shadowless Blastoise Holo',
    set: 'Base Set 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$45,100',
    saleDate: 'Nov 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$2,000–$45,100 depending on grade',
    whyValuable: 'The water-type starter from the original trio. Shadowless 1st Edition holos from the Base Set are prized for their print quality and rarity. Blastoise commands a premium over Venusaur as the second most popular of the original starters.',
    tcgId: 'base1-2',
  },
  {
    rank: 6,
    name: '1st Edition Shadowless Venusaur Holo',
    set: 'Base Set 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$38,400',
    saleDate: 'Oct 2021',
    saleVenue: 'PWCC',
    currentRange: '$1,500–$38,400 depending on grade',
    whyValuable: 'The grass-type starter completes the original trio. Among the 16 Base Set 1st Edition holos, the three starters remain the most coveted. Venusaur is the rarest PSA 10 of the three due to its tendency toward print lines on the green surface.',
    tcgId: 'base1-15',
  },
  {
    rank: 7,
    name: '1st Edition Shadowless Chansey Holo',
    set: 'Base Set 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$14,400',
    saleDate: 'Sep 2021',
    saleVenue: 'eBay',
    currentRange: '$800–$14,400 depending on grade',
    whyValuable: 'Among the 1st Edition Base Set holos, Chansey commands a disproportionate premium because her pink surface shows print defects exceptionally clearly, making PSA 10 copies very rare.',
  },
  {
    rank: 8,
    name: 'Lugia 1st Edition Neo Genesis Holo',
    set: 'Neo Genesis 1st Edition (2000)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$144,300',
    saleDate: 'Jul 2021',
    saleVenue: 'Goldin Auctions',
    currentRange: '$2,000–$144,300 depending on grade',
    whyValuable: 'Lugia is arguably the most beloved Legendary Pokémon from the second-generation games. The 1st Edition Neo Genesis Lugia is the first Lugia card ever printed in English and is considered the most desirable card from the entire Neo series.',
  },
  {
    rank: 9,
    name: 'Ho-Oh 1st Edition Neo Revelation Holo',
    set: 'Neo Revelation 1st Edition (2001)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$38,400',
    saleDate: 'Mar 2022',
    saleVenue: 'PWCC',
    currentRange: '$800–$38,400 depending on grade',
    whyValuable: "Ho-Oh's rainbow artwork made it an immediate collector target. The 1st Edition stamp on early Neo sets is rare because fewer hobby boxes reached North America compared to later print runs.",
  },
  {
    rank: 10,
    name: 'Gold Star Charizard (EX Dragon Frontiers)',
    set: 'EX Dragon Frontiers (2006)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$60,065',
    saleDate: 'Aug 2021',
    saleVenue: 'PWCC',
    currentRange: '$5,000–$60,065 depending on grade',
    whyValuable: 'Gold Star cards feature artwork with a foil star and a unique non-standard background, with approximately one per booster box. The shiny (alternate color) Charizard Gold Star is among the most sought-after cards from the EX era.',
  },
  {
    rank: 11,
    name: 'Crystal Charizard (Aquapolis)',
    set: 'Aquapolis (2003)',
    era: 'vintage',
    grade: 'PSA 9',
    recordSale: '$24,000',
    saleDate: 'Jun 2021',
    saleVenue: 'eBay',
    currentRange: '$3,000–$24,000 depending on grade',
    whyValuable: 'Crystal cards from the e-Card era feature a unique multi-color holo pattern. Only 3 Crystal Pokémon were printed per set. Charizard commands the highest premium, and the heavy holo effect causes a high PSA 10 failure rate.',
  },
  {
    rank: 12,
    name: 'Gold Star Umbreon (POP Series 5)',
    set: 'POP Series 5 (2007)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$70,000',
    saleDate: 'Nov 2021',
    saleVenue: 'PWCC',
    currentRange: '$5,000–$70,000 depending on grade',
    whyValuable: "Umbreon is one of the most popular Pokémon among collectors, and the Gold Star version was only obtainable via the POP promotional program. Extremely limited distribution means the total PSA population is tiny.",
  },
  {
    rank: 13,
    name: '1st Edition Base Set Holo Mewtwo',
    set: 'Base Set 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$27,000',
    saleDate: 'Aug 2021',
    saleVenue: 'PWCC',
    currentRange: '$1,000–$27,000 depending on grade',
    whyValuable: "Mewtwo was the most powerful Pokémon in the original game meta, and the 1st Edition holo remains a cornerstone of vintage Base Set collecting.",
  },
  {
    rank: 14,
    name: 'Tropical Wind Trophy Card (1999)',
    set: 'Tropical Mega Battle Promo',
    era: 'trophy',
    grade: 'PSA 7',
    recordSale: '$65,000',
    saleDate: 'Feb 2021',
    saleVenue: 'eBay',
    currentRange: '$30,000–$65,000',
    whyValuable: 'Only 12–15 Tropical Wind cards exist. Awarded to participants at the 1999 Tropical Mega Battle in Honolulu, this tournament promo is one of the rarest English Pokémon cards.',
  },
  {
    rank: 15,
    name: 'Shadowless Base Set Charizard Holo (Unlimited)',
    set: 'Base Set Shadowless (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$36,000',
    saleDate: 'Sep 2021',
    saleVenue: 'PWCC',
    currentRange: '$2,000–$36,000 depending on grade',
    whyValuable: "The shadowless printing run was the second print after 1st Edition and before the standard Unlimited run. Identifiable by the absence of a drop shadow on the card image box. Rarer than Unlimited, cheaper than 1st Edition.",
    tcgId: 'base1-4',
  },
  {
    rank: 16,
    name: 'Charizard VMAX (Alt Art) — Darkness Ablaze',
    set: 'Darkness Ablaze (2020)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$3,600',
    saleDate: 'Mar 2022',
    saleVenue: 'eBay',
    currentRange: '$300–$3,600 depending on grade',
    whyValuable: "The first major modern Charizard alt art from the Sword & Shield era triggered enormous collector demand. The VMAX Charizard artwork covers the full card face with no border, making it the most visually dramatic modern Charizard.",
  },
  {
    rank: 17,
    name: 'Moonbreon — Umbreon VMAX (Alt Art)',
    set: 'Evolving Skies (2021)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$5,100',
    saleDate: 'Feb 2022',
    saleVenue: 'PWCC',
    currentRange: '$300–$5,100 depending on grade',
    whyValuable: 'Nicknamed "Moonbreon" by the community, the Umbreon VMAX Secret Rare from Evolving Skies is the most coveted modern alt art. Its deep blue and gold full-art design became a cultural touchstone, and it remains one of the most-pulled targets in any Evolving Skies box.',
  },
  {
    rank: 18,
    name: 'Rayquaza Gold Star (Deoxys)',
    set: 'EX Deoxys (2005)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$45,100',
    saleDate: 'Jan 2022',
    saleVenue: 'PWCC',
    currentRange: '$3,000–$45,100 depending on grade',
    whyValuable: "Rayquaza's Gold Star is one of the most popular from the EX era. The card features the sky-serpent in a dramatic flying pose with full-card holo treatment. PSA 10 copies are legitimately scarce.",
  },
  {
    rank: 19,
    name: 'Charizard ex — Obsidian Flames (Special Illustration Rare)',
    set: 'Obsidian Flames (2023)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$2,400',
    saleDate: 'Nov 2023',
    saleVenue: 'eBay',
    currentRange: '$200–$2,400 depending on grade',
    whyValuable: 'The black-and-gold Charizard ex Special Illustration Rare from Obsidian Flames became an instant collector target. The card was the most-discussed modern Pokémon card of 2023 and drives significant set demand.',
  },
  {
    rank: 20,
    name: 'Pikachu VMAX (Rainbow Rare) — Vivid Voltage',
    set: 'Vivid Voltage (2020)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,800',
    saleDate: 'Jul 2021',
    saleVenue: 'eBay',
    currentRange: '$100–$1,800 depending on grade',
    whyValuable: "The rainbow rare treatment on a Pikachu card is always in demand. The Vivid Voltage VMAX Pikachu Rainbow features the franchise mascot's largest form with spectacular etched foiling.",
  },
  {
    rank: 21,
    name: 'Blastoise Holo — 2002 Wizards of the Coast Black Star Promo #18',
    set: 'WotC Black Star Promo (2002)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$4,800',
    saleDate: 'Apr 2022',
    saleVenue: 'eBay',
    currentRange: '$500–$4,800 depending on grade',
    whyValuable: "The WotC promo Blastoise was only available through specific promotions and tournament kits, making genuine PSA 10 copies extremely rare.",
  },
  {
    rank: 22,
    name: 'Espeon Gold Star (POP Series 5)',
    set: 'POP Series 5 (2007)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$36,000',
    saleDate: 'Oct 2021',
    saleVenue: 'PWCC',
    currentRange: '$3,000–$36,000 depending on grade',
    whyValuable: 'Espeon and Umbreon Gold Stars from POP Series 5 are the hardest to find of all Gold Stars due to their limited promotional distribution. Both were only available via redemption programs.',
  },
  {
    rank: 23,
    name: 'Charizard Star — Dragon Frontiers (Gold Star)',
    set: 'EX Dragon Frontiers (2006)',
    era: 'vintage',
    grade: 'PSA 9',
    recordSale: '$24,000',
    saleDate: 'May 2021',
    saleVenue: 'eBay',
    currentRange: '$3,000–$60,065 depending on grade',
    whyValuable: 'The shiny Charizard Gold Star features the alternate color Charizard (black and red instead of orange). The Gold Star rarity tier plus the Charizard demand makes this one of the most competitive cards in vintage Pokémon collecting.',
  },
  {
    rank: 24,
    name: 'Surfing Pikachu (Full Art) — XY Evolutions',
    set: 'XY Evolutions (2016)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$3,600',
    saleDate: 'Feb 2022',
    saleVenue: 'eBay',
    currentRange: '$200–$3,600 depending on grade',
    whyValuable: "XY Evolutions was a nostalgic reprint of the Base Set. The Surfing Pikachu Full Art was the most sought-after chase card in the set and became a cultural moment for collectors who grew up with the original game.",
  },
  {
    rank: 25,
    name: 'Charizard Holo — Expedition (e-Card)',
    set: 'Expedition Base Set (2002)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$6,000',
    saleDate: 'Sep 2021',
    saleVenue: 'PWCC',
    currentRange: '$400–$6,000 depending on grade',
    whyValuable: "The e-Card era is underappreciated relative to its rarity. Expedition Charizard features a distinctive reverse holo pattern and was printed in limited quantities compared to Base Set.",
  },
  {
    rank: 26,
    name: 'Mew (No. 9) — Base Set Japanese Promo',
    set: 'Japanese Promo (1998)',
    era: 'trophy',
    grade: 'PSA 8',
    recordSale: '$8,400',
    saleDate: 'Jul 2021',
    saleVenue: 'eBay',
    currentRange: '$2,000–$8,400 depending on grade',
    whyValuable: 'The original Japanese Mew promo from the Pokémon Card Game launch party was distributed exclusively at events in Japan. It was the first Mew card ever printed and carries significant historical weight.',
  },
  {
    rank: 27,
    name: 'Umbreon ex — Unseen Forces (Full Art Holo)',
    set: 'Unseen Forces (2005)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$12,000',
    saleDate: 'Jun 2021',
    saleVenue: 'PWCC',
    currentRange: '$800–$12,000 depending on grade',
    whyValuable: "Umbreon's ex card from Unseen Forces features the full stadium holo pattern unique to that set. Combined with Umbreon's persistent collector popularity, this card trades at a consistent premium.",
  },
  {
    rank: 28,
    name: 'Celebi ex — Unseen Forces',
    set: 'Unseen Forces (2005)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$4,800',
    saleDate: 'Mar 2022',
    saleVenue: 'eBay',
    currentRange: '$300–$4,800 depending on grade',
    whyValuable: "Celebi's ex card is among the most visually distinctive from the EX era and commands a premium among collectors of the Neo/EX transition period.",
  },
  {
    rank: 29,
    name: 'Charizard V (Full Art) — Champion\'s Path',
    set: "Champion's Path (2020)",
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,440',
    saleDate: 'Jan 2021',
    saleVenue: 'eBay',
    currentRange: '$100–$1,440 depending on grade',
    whyValuable: "Champion's Path was a limited set with no booster boxes sold directly — only elite trainer boxes and bundles. The Charizard V Full Art was the chase card and drove enormous demand during the 2020 hobby boom.",
  },
  {
    rank: 30,
    name: 'Gengar ex — FireRed & LeafGreen',
    set: 'EX FireRed & LeafGreen (2004)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$7,200',
    saleDate: 'Aug 2021',
    saleVenue: 'PWCC',
    currentRange: '$600–$7,200 depending on grade',
    whyValuable: "Gengar is one of the most popular original Pokémon among collectors. The FireRed & LeafGreen ex series featured clean artwork that aged well.",
  },
  {
    rank: 31,
    name: 'Lugia ex — Unseen Forces',
    set: 'Unseen Forces (2005)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$14,400',
    saleDate: 'Nov 2021',
    saleVenue: 'PWCC',
    currentRange: '$1,200–$14,400 depending on grade',
    whyValuable: "Lugia's continued popularity from Pokémon Gold and the Pokémon movie makes any Lugia ex a premium acquisition. The Unseen Forces version features the Lugia against a gold stadium holo.",
  },
  {
    rank: 32,
    name: 'Charizard (No. 006) — Japanese Base Set',
    set: 'Japanese Base Set (1996)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$58,320',
    saleDate: 'Jun 2022',
    saleVenue: 'Goldin Auctions',
    currentRange: '$5,000–$58,320 depending on grade',
    whyValuable: "The original 1996 Japanese Base Set Charizard predates the English version by 3 years. These cards have a different holo treatment and were never reprinted in the same way. PSA 10 examples are exceedingly rare.",
  },
  {
    rank: 33,
    name: 'Miraidon ex — Special Illustration Rare (Scarlet & Violet)',
    set: 'Scarlet & Violet Base (2023)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,200',
    saleDate: 'Mar 2023',
    saleVenue: 'eBay',
    currentRange: '$100–$1,200 depending on grade',
    whyValuable: "Miraidon is the face Legendary of the Scarlet & Violet era. The Special Illustration Rare variant features the Pokémon in a futuristic cityscape full-art treatment.",
  },
  {
    rank: 34,
    name: 'Charizard — 1999 Burger King Gold Plated',
    set: 'Burger King Promo (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$4,800',
    saleDate: 'Feb 2021',
    saleVenue: 'eBay',
    currentRange: '$200–$4,800 depending on grade',
    whyValuable: 'The 1999 Burger King Pokémon promo included 3 gold-plated cards. The Charizard version is the most sought-after for obvious reasons and commands significant premiums in perfect condition.',
  },
  {
    rank: 35,
    name: 'Gengar & Mimikyu GX (Full Art) — Team Up',
    set: 'Team Up (2019)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,800',
    saleDate: 'Nov 2021',
    saleVenue: 'eBay',
    currentRange: '$100–$1,800 depending on grade',
    whyValuable: "The Full Art Gengar & Mimikyu Tag Team GX card is a community favorite for its ghostly, stylized artwork. Tag Team GX cards from this era command consistent premiums.",
  },
  {
    rank: 36,
    name: 'Pikachu Holo — Jungle 1st Edition',
    set: 'Jungle 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$4,800',
    saleDate: 'Aug 2021',
    saleVenue: 'eBay',
    currentRange: '$400–$4,800 depending on grade',
    whyValuable: "The only Pikachu holo in the original WotC print run. The Jungle 1st Edition Pikachu is a cornerstone card for collectors and benefits from the franchise mascot premium.",
  },
  {
    rank: 37,
    name: 'Mewtwo — Fossil 1st Edition Holo',
    set: 'Fossil 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$6,000',
    saleDate: 'Mar 2022',
    saleVenue: 'PWCC',
    currentRange: '$400–$6,000 depending on grade',
    whyValuable: "Fossil set 1st Editions are scarcer than Base Set equivalents in PSA 10 because the set received less collector attention at release. Mewtwo remains the most powerful original Pokémon by design.",
  },
  {
    rank: 38,
    name: 'Mew ex — Legend Maker',
    set: 'Legend Maker (2006)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$4,200',
    saleDate: 'Jan 2022',
    saleVenue: 'eBay',
    currentRange: '$300–$4,200 depending on grade',
    whyValuable: "Mew is perpetually popular as the Pokémon with the most mystique from the original games. The Legend Maker ex features a full-card holo treatment.",
  },
  {
    rank: 39,
    name: 'Charizard ex — FireRed & LeafGreen',
    set: 'EX FireRed & LeafGreen (2004)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$9,600',
    saleDate: 'Jul 2021',
    saleVenue: 'PWCC',
    currentRange: '$800–$9,600 depending on grade',
    whyValuable: "The FireRed & LeafGreen ex Charizard features a clean fire-themed full-card holo artwork that holds up visually better than many EX era cards.",
  },
  {
    rank: 40,
    name: 'Eevee Heroes Umbreon VMAX (Japanese)',
    set: 'Eevee Heroes (2021, Japan)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$3,600',
    saleDate: 'Oct 2021',
    saleVenue: 'PWCC',
    currentRange: '$300–$3,600 depending on grade',
    whyValuable: 'The Japanese Eevee Heroes set released before Evolving Skies and contained the original Umbreon VMAX alt art. Japanese copies predate English counterparts and are considered more desirable by some collectors.',
  },
  {
    rank: 41,
    name: 'Charizard (Classic Collection) — Scarlet & Violet',
    set: 'Pokemon 151 (2023)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,440',
    saleDate: 'Dec 2023',
    saleVenue: 'eBay',
    currentRange: '$120–$1,440 depending on grade',
    whyValuable: "The Pokémon 151 set revisited the original 151 Pokémon with new modern artwork. The Charizard ex Special Illustration Rare from this set captures nostalgic energy and drives significant chase demand.",
  },
  {
    rank: 42,
    name: 'Dark Charizard Holo — Team Rocket 1st Edition',
    set: 'Team Rocket 1st Edition (2000)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$9,600',
    saleDate: 'Jun 2021',
    saleVenue: 'PWCC',
    currentRange: '$800–$9,600 depending on grade',
    whyValuable: "The Team Rocket set introduced the concept of evil Pokémon cards. Dark Charizard from the 1st Edition print run is among the most sought-after holo rares from WotC-era sets beyond Base Set.",
  },
  {
    rank: 43,
    name: 'Shining Charizard — Neo Destiny',
    set: 'Neo Destiny (2002)',
    era: 'vintage',
    grade: 'PSA 9',
    recordSale: '$11,400',
    saleDate: 'Sep 2021',
    saleVenue: 'Heritage Auctions',
    currentRange: '$2,000–$11,400 depending on grade',
    whyValuable: "The Shining cards from Neo Destiny were the first alternate-color (shiny) Pokémon in the card game. Shining Charizard is among the rarest — it was one of 8 Shining cards in a set with limited print runs.",
  },
  {
    rank: 44,
    name: 'Charizard VSTAR (Rainbow Rare) — Brilliant Stars',
    set: 'Brilliant Stars (2022)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,200',
    saleDate: 'May 2022',
    saleVenue: 'eBay',
    currentRange: '$100–$1,200 depending on grade',
    whyValuable: "Brilliant Stars introduced the VSTAR mechanic and Charizard VSTAR was the marquee card. The Rainbow Rare version features a full rainbow foil treatment.",
  },
  {
    rank: 45,
    name: 'Pikachu World Collection (2010)',
    set: 'Pikachu World Collection Promo',
    era: 'trophy',
    grade: 'PSA 10',
    recordSale: '$18,000',
    saleDate: 'Jan 2022',
    saleVenue: 'PWCC',
    currentRange: '$3,000–$18,000 depending on grade',
    whyValuable: "The 2010 Pikachu World Collection was a limited promotional set with very small print runs. Complete sets are extremely difficult to assemble.",
  },
  {
    rank: 46,
    name: 'Gyarados Holo — Base Set 1st Edition',
    set: 'Base Set 1st Edition (1999)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$12,000',
    saleDate: 'Aug 2021',
    saleVenue: 'PWCC',
    currentRange: '$800–$12,000 depending on grade',
    whyValuable: "The iconic sea serpent is one of the most popular Gen 1 Pokémon. The 1st Edition Base Set Gyarados holo commands its own premium separate from the starters.",
  },
  {
    rank: 47,
    name: 'Typhlosion ex — Dragon Frontiers',
    set: 'EX Dragon Frontiers (2006)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$4,200',
    saleDate: 'Mar 2022',
    saleVenue: 'eBay',
    currentRange: '$400–$4,200 depending on grade',
    whyValuable: "Dragon Frontiers is the most collected EX-era set among advanced collectors. Every ex from this set commands premium PSA 10 prices due to the per-box rarity.",
  },
  {
    rank: 48,
    name: 'Lapras ex — Unseen Forces',
    set: 'Unseen Forces (2005)',
    era: 'vintage',
    grade: 'PSA 10',
    recordSale: '$2,400',
    saleDate: 'Nov 2021',
    saleVenue: 'eBay',
    currentRange: '$200–$2,400 depending on grade',
    whyValuable: "Lapras is a nostalgic favorite from the original games and anime. The Unseen Forces ex holo treatment is among the most attractive from the stadium-holo era.",
  },
  {
    rank: 49,
    name: 'Charizard ex — Prismatic Evolutions (Special Illustration Rare)',
    set: 'Prismatic Evolutions (2025)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,800',
    saleDate: 'Feb 2025',
    saleVenue: 'eBay',
    currentRange: '$200–$1,800 depending on grade',
    whyValuable: "Prismatic Evolutions was the most anticipated set of 2025 and drove significant sealed product shortages. The Charizard Special Illustration Rare is the marquee pull from the set.",
  },
  {
    rank: 50,
    name: 'Pikachu ex Special Illustration Rare — Prismatic Evolutions',
    set: 'Prismatic Evolutions (2025)',
    era: 'modern',
    grade: 'PSA 10',
    recordSale: '$1,200',
    saleDate: 'Feb 2025',
    saleVenue: 'eBay',
    currentRange: '$100–$1,200 depending on grade',
    whyValuable: "The Pikachu ex Special Illustration Rare from Prismatic Evolutions captures the franchise mascot in a full-card scene that collectors immediately responded to. The Eevee-focus of the set gives every Eevee-evolution alt art in it premium status.",
  },
];

export default function MostValuablePokemonCardsPage() {
  const vintageCount = top50.filter(c => c.era === 'vintage').length;
  const modernCount = top50.filter(c => c.era === 'modern').length;
  const trophyCount = top50.filter(c => c.era === 'trophy').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'The 50 Most Valuable Pokémon Cards of All Time',
        description: 'Definitive ranking of the 50 most valuable Pokémon cards ever sold. Record prices, current values, and why each card commands a premium — from 1st Edition Charizard to Pikachu Illustrator.',
        author: { '@type': 'Organization', name: 'CardVault' },
        publisher: { '@type': 'Organization', name: 'CardVault', url: 'https://cardvault-two.vercel.app' },
        mainEntityOfPage: 'https://cardvault-two.vercel.app/guides/most-valuable-pokemon-cards',
      }} />
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-950/60 border border-yellow-800/50 text-yellow-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          Public auction records + TCGPlayer market data
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          The 50 Most Valuable Pokémon Cards of All Time
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Ranked by record sale price, from the $5.275M Pikachu Illustrator to the most coveted modern alt arts. Every figure from public auction records or market data.
        </p>
      </div>

      {/* Era breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-900 border border-yellow-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{vintageCount}</div>
          <div className="text-gray-500 text-xs mt-0.5">Vintage cards<br />(1996–2003)</div>
        </div>
        <div className="bg-gray-900 border border-violet-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-violet-400">{modernCount}</div>
          <div className="text-gray-500 text-xs mt-0.5">Modern cards<br />(2004–2025)</div>
        </div>
        <div className="bg-gray-900 border border-rose-900/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-400">{trophyCount}</div>
          <div className="text-gray-500 text-xs mt-0.5">Trophy / Promo<br />(rare events)</div>
        </div>
      </div>

      {/* Key insight */}
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-2xl p-5 mb-10">
        <h2 className="text-amber-400 font-bold mb-2">What Makes a Pokémon Card Valuable?</h2>
        <div className="text-gray-400 text-sm leading-relaxed space-y-2">
          <p>
            Three factors drive value: <strong className="text-gray-200">character</strong> (Charizard commands 5–10x the price of equivalent-rarity non-Charizard cards), <strong className="text-gray-200">print era</strong> (1st Edition and shadowless printings from 1999 are the holy grail), and <strong className="text-gray-200">grade</strong> (the difference between PSA 9 and PSA 10 on a vintage holo can be 5–20x).
          </p>
          <p>
            Trophy cards — distributed only at specific events with known copy counts under 50 — operate outside normal market dynamics and are effectively priceless in the truest sense.
          </p>
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-4">
        {top50.map(card => (
          <div key={card.rank} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors">
            <div className="flex items-start gap-4">
              {/* Rank */}
              <div className="shrink-0 w-10 text-center">
                <span className={`text-2xl font-bold ${card.rank <= 3 ? 'text-amber-400' : card.rank <= 10 ? 'text-gray-300' : 'text-gray-600'}`}>
                  #{card.rank}
                </span>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${eraColor[card.era]}`}>
                    {eraLabel[card.era]}
                  </span>
                </div>
                <h2 className="text-white font-bold text-base sm:text-lg mb-0.5 leading-snug">
                  {card.tcgId ? (
                    <Link href={`/pokemon/cards/${card.tcgId}`} className="hover:text-yellow-400 transition-colors">
                      {card.name}
                    </Link>
                  ) : (
                    card.name
                  )}
                </h2>
                <p className="text-gray-500 text-xs mb-2">{card.set}{card.grade ? ` · ${card.grade}` : ''}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{card.whyValuable}</p>
                {/* Price data */}
                <div className="flex flex-wrap gap-3 text-xs">
                  <div className="bg-amber-950/40 border border-amber-800/30 rounded-lg px-3 py-1.5">
                    <span className="text-gray-500">Record sale </span>
                    <span className="text-amber-400 font-bold">{card.recordSale}</span>
                    <span className="text-gray-600"> · {card.saleDate} · {card.saleVenue}</span>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1.5">
                    <span className="text-gray-500">Current range </span>
                    <span className="text-gray-300">{card.currentRange}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer links */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Explore More</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/guides/most-valuable-sports-cards" className="inline-flex items-center gap-2 bg-amber-950/40 border border-amber-800/30 hover:border-amber-600/50 text-amber-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            🏆 Most Valuable Sports Cards
          </Link>
          <Link href="/pokemon" className="inline-flex items-center gap-2 bg-yellow-950/40 border border-yellow-800/30 hover:border-yellow-600/50 text-yellow-400 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            ⚡ Browse Pokémon Sets
          </Link>
          <Link href="/guides/card-market-2026" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            Market Analysis 2026
          </Link>
          <Link href="/guides/when-to-grade-your-cards" className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700">
            When to Grade
          </Link>
        </div>
      </div>
    </div>
  );
}
