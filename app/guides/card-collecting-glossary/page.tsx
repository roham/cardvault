import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Card Collecting Glossary: 80+ Terms Every Collector Should Know (2026)',
  description: 'Complete glossary of sports card and Pokemon card terminology. RC, refractor, auto, hit, junk wax, wax, hobby vs retail, parallels, short prints, and more explained.',
  keywords: ['sports card glossary', 'card collecting terms', 'what is a rookie card', 'what does RC mean', 'junk wax era', 'card hobby terminology', 'refractor', 'parallel cards', 'short print'],
};

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
}

const terms: GlossaryTerm[] = [
  // Card Types
  { term: 'RC (Rookie Card)', definition: 'A player\'s first officially licensed trading card from a major manufacturer. Marked with an "RC" logo. The most collected card type — rookie cards drive the majority of the hobby market.', category: 'Card Types' },
  { term: 'Base Card', definition: 'The standard, common cards that make up the majority of a set. Not serial-numbered, not a parallel. The "regular" version of a card.', category: 'Card Types' },
  { term: 'Parallel', definition: 'A variation of a base card with a different color, finish, or border. Examples: Prizm Silver, Topps Chrome Refractor, Optic Holo. Parallels are rarer than base cards.', category: 'Card Types' },
  { term: 'Refractor', definition: 'A parallel with a rainbow/holographic finish that "refracts" light. Originally created by Topps Chrome in 1996. Now a generic term for similar finishes across brands.', category: 'Card Types' },
  { term: 'Auto / Autograph', definition: 'A card with a real, hand-signed autograph from the player. Usually authenticated and numbered. On-card autos (signed directly) are more valuable than sticker autos.', category: 'Card Types' },
  { term: 'Relic / Memorabilia / Patch Card', definition: 'A card containing a piece of game-worn jersey, bat, shoe, or other memorabilia embedded in the card. Patch cards (with a visible logo, number, or multi-color swatch) are the most valuable.', category: 'Card Types' },
  { term: 'Hit', definition: 'Any card that is an autograph, relic, or high-end parallel. "What did you hit?" means "what rare cards did you pull?" Hobby boxes guarantee a certain number of hits per box.', category: 'Card Types' },
  { term: 'Insert', definition: 'A special subset card inserted randomly into packs at a stated ratio (e.g., 1:24 packs). Inserts are different from the base set and often have unique designs.', category: 'Card Types' },
  { term: 'SP (Short Print)', definition: 'A card printed in lower quantities than regular base cards. Short prints are harder to pull and thus more valuable. SSP = Super Short Print. SSSP = Super Super Short Print.', category: 'Card Types' },
  { term: 'Numbered / Serial Numbered (/25, /50, /100)', definition: 'A card stamped with a unique number out of the total print run. "/25" means only 25 copies exist. Lower numbers (especially /1, called a "1/1") are more valuable.', category: 'Card Types' },
  { term: '1/1 (One of One)', definition: 'A card where only one copy exists in the world. The ultimate in scarcity. Superfractors, printing plates, and some patch autos are 1/1s. Highly sought after by collectors.', category: 'Card Types' },
  { term: 'Printing Plate', definition: 'The actual metal plate used to print a specific card, embedded in a card holder. Four exist for each card (cyan, magenta, yellow, black). Always a 1/1.', category: 'Card Types' },

  // Products & Formats
  { term: 'Hobby Box', definition: 'A sealed box sold through hobby shops and authorized dealers. Contains guaranteed hits (autos, relics) and exclusive parallels not found in retail. Higher price but better expected value.', category: 'Products' },
  { term: 'Retail / Blaster Box', definition: 'Sealed product sold at retail stores (Target, Walmart). Cheaper than hobby but with fewer guaranteed hits and different parallel availability. More accessible for casual collectors.', category: 'Products' },
  { term: 'ETB (Elite Trainer Box)', definition: 'A Pokémon-specific product containing booster packs, energy cards, dice, and a storage box. The standard mid-price sealed product for Pokemon collectors.', category: 'Products' },
  { term: 'Wax', definition: 'Slang for sealed trading card product (packs, boxes). Comes from the wax paper that wrapped vintage packs. "Ripping wax" = opening packs.', category: 'Products' },
  { term: 'Hobby vs Retail', definition: 'Hobby products come through authorized distributors and guarantee certain hits. Retail products are sold at mass retailers with no guaranteed hits. Hobby is generally better value per dollar for chasing hits.', category: 'Products' },
  { term: 'Hanger / Cello / Fat Pack', definition: 'Mid-size retail pack formats containing more cards than a standard pack but fewer than a blaster box. Names vary by manufacturer. Usually $8-$15.', category: 'Products' },

  // Grading
  { term: 'PSA (Professional Sports Authenticator)', definition: 'The largest and most recognized card grading company. Uses a 1-10 scale. PSA 10 (Gem Mint) commands the highest resale premiums across most card categories.', category: 'Grading' },
  { term: 'BGS (Beckett Grading Services)', definition: 'Major grading company with subgrades (centering, corners, edges, surface). BGS 10 Black Label is the rarest and most valuable grade. Strong for modern cards and Pokemon.', category: 'Grading' },
  { term: 'SGC (Sportscard Guaranty Corporation)', definition: 'Third major grading company, growing market share especially for vintage cards. Known for fast turnaround and attractive tuxedo-style slabs.', category: 'Grading' },
  { term: 'Slab', definition: 'The sealed plastic case a grading company puts a card in after grading. "Slabbed" means professionally graded and encased.', category: 'Grading' },
  { term: 'Raw', definition: 'An ungraded card. Not in a slab. "Raw" cards can be any condition — the term just means they haven\'t been professionally graded.', category: 'Grading' },
  { term: 'Pop Report (Population Report)', definition: 'A public database showing how many copies of a specific card have been graded at each grade level by a grading company. Low populations in high grades = genuine scarcity.', category: 'Grading' },
  { term: 'Crossover', definition: 'Submitting a card that was graded by one company (e.g., BGS 9.5) to another company (e.g., PSA) hoping it upgrades. Common strategy when PSA premiums are higher.', category: 'Grading' },
  { term: 'Centering', definition: 'How evenly a card\'s image is positioned within its borders. Measured as a ratio. PSA 10 requires 55/45 or better on front. Poor centering is the #1 reason modern cards miss PSA 10.', category: 'Grading' },

  // Eras & History
  { term: 'Pre-War', definition: 'Cards produced before World War II (pre-1945). Includes T206, Goudey, and Play Ball sets. The most valuable era due to extreme scarcity and historical significance.', category: 'Eras' },
  { term: 'Vintage', definition: 'Generally cards from the 1950s through 1970s. Topps-dominated era. Includes iconic sets like 1952 Topps, 1969 Topps, and early Fleer basketball.', category: 'Eras' },
  { term: 'Junk Wax Era', definition: 'Approximately 1986-1993 when card companies massively overproduced. Billions of cards printed, destroying scarcity. Most junk wax cards are worth pennies, but key rookies (Griffey, Jordan, Thomas) retained value.', category: 'Eras' },
  { term: 'Modern Era', definition: 'Cards from roughly 2000-present. Characterized by serial-numbered parallels, autographs, relics, and artificial scarcity. Prizm, Chrome, Optic, and Select are the dominant modern brands.', category: 'Eras' },
  { term: 'T206', definition: 'The "Monster" set — tobacco cards produced 1909-1911 by the American Tobacco Company. Contains the Honus Wagner card (sold for $7.25M) and hundreds of Hall of Famers. The most famous card set ever.', category: 'Eras' },

  // Market & Trading
  { term: 'Comp / Sold Comp', definition: 'Short for "comparable sale." The actual price a similar card sold for recently, usually on eBay. "What are comps?" = "What has this card sold for?" The most reliable price reference.', category: 'Market' },
  { term: 'Book Value', definition: 'The price listed in Beckett price guides. Historically important but now largely outdated — Beckett values often differ significantly from actual market prices. Use sold comps instead.', category: 'Market' },
  { term: 'Flip / Flipper', definition: 'Buying cards at a low price and selling quickly for profit. A flipper focuses on short-term resale rather than long-term collecting. Active flippers monitor eBay, card shows, and retail drops.', category: 'Market' },
  { term: 'Hold / Long-term Hold', definition: 'Buying a card with the intention of holding it for months or years, betting on the player\'s career or the card\'s long-term appreciation. Opposite of flipping.', category: 'Market' },
  { term: 'PWCC / Heritage / Goldin', definition: 'Major card auction houses. PWCC and Goldin run online auctions. Heritage handles high-end vintage. These are where the biggest cards sell — record-setting auction results drive the market.', category: 'Market' },
  { term: 'Case Hit', definition: 'A card that appears roughly once per sealed case (usually 12 hobby boxes). Case hits are premium pulls that drive the value of sealed product.', category: 'Market' },
  { term: 'Break / Box Break', definition: 'A group-buying format where participants pay for a spot (usually by team) and a host opens sealed product on video. You receive the cards from your team. Popular way to access expensive hobby boxes.', category: 'Market' },
  { term: 'Random / Pick Your Team (PYT)', definition: 'Two types of breaks. Random: teams are assigned randomly to buyers. PYT: buyers choose their team. PYT spots for hot teams (whoever has the best rookies) cost more.', category: 'Market' },

  // Pokemon-Specific
  { term: 'Illustration Rare (IR)', definition: 'A Pokemon card variant featuring artwork that extends beyond the standard card frame. The most valuable modern Pokemon chase cards. Replaced Full Art as the top pull.', category: 'Pokemon' },
  { term: 'Special Art Rare (SAR)', definition: 'The highest rarity in modern Pokemon TCG sets. Full-bleed artwork with no standard borders. The most sought-after and valuable cards in current Pokemon products.', category: 'Pokemon' },
  { term: 'Holo / Holographic', definition: 'A card with a holographic foil pattern on the card art. In classic Pokemon, "holo" means the card image shimmers. Holo rares are the standard premium pull in base Pokemon sets.', category: 'Pokemon' },
  { term: 'Shadowless', definition: 'First-edition Base Set Pokemon cards printed without the shadow effect on the right side of the card art window. Shadowless prints are rarer and more valuable than unlimited versions.', category: 'Pokemon' },
  { term: 'First Edition', definition: 'A stamp on early Pokemon cards (primarily Base Set through Neo Destiny) indicating they were from the initial print run. First Edition Base Set Charizard is the benchmark Pokemon card.', category: 'Pokemon' },
  { term: 'God Pack', definition: 'An extremely rare Pokemon booster pack where every card is a hit (all holos, all ultra rares, etc.). Originally a Japanese product feature now appearing in some English sets. Pull rates are 1 in thousands.', category: 'Pokemon' },
];

const categories = ['Card Types', 'Products', 'Grading', 'Eras', 'Market', 'Pokemon'];

export default function CardCollectingGlossaryPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Card Collecting Glossary' },
        ]} />

        <h1 className="text-3xl sm:text-4xl font-bold mt-6 mb-4">Card Collecting Glossary: Every Term You Need to Know</h1>
        <p className="text-gray-400 text-lg mb-8">
          The card hobby has its own language. Whether you&apos;re new to collecting or trying to understand what
          someone means by &quot;I pulled a case hit SSP refractor auto /25,&quot; this glossary covers the essential terminology
          for sports cards and Pokemon cards.
        </p>

        {/* Jump Links */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <a key={cat} href={`#${cat.toLowerCase().replace(/ /g, '-')}`} className="bg-gray-800/60 hover:bg-gray-700/60 text-sm px-3 py-1.5 rounded-lg transition-colors text-gray-300">
              {cat}
            </a>
          ))}
        </div>

        {/* Terms by Category */}
        {categories.map((cat) => (
          <section key={cat} id={cat.toLowerCase().replace(/ /g, '-')} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 sticky top-0 bg-gray-950 py-2 z-10 border-b border-gray-800/50">{cat}</h2>
            <div className="space-y-4">
              {terms.filter(t => t.category === cat).map((t) => (
                <div key={t.term} className="bg-gray-900/60 border border-gray-800/60 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-300 mb-1">{t.term}</h3>
                  <p className="text-gray-300 text-sm">{t.definition}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Related */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/guides/how-to-start-collecting-cards" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">How to Start Collecting Cards</h3>
              <p className="text-sm text-gray-400 mt-1">The complete beginner roadmap to the hobby.</p>
            </Link>
            <Link href="/guides/sports-card-eras-explained" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Sports Card Eras Explained</h3>
              <p className="text-sm text-gray-400 mt-1">Deep dive into pre-war, vintage, junk wax, and modern eras.</p>
            </Link>
            <Link href="/guides/psa-grading-scale" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">PSA Grading Scale Explained</h3>
              <p className="text-sm text-gray-400 mt-1">Every PSA grade from 1 to 10 broken down in detail.</p>
            </Link>
            <Link href="/guides/how-to-read-price-data" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">How to Read Price Data</h3>
              <p className="text-sm text-gray-400 mt-1">Book value vs sold comps — what each metric really means.</p>
            </Link>
          </div>
        </section>

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: 'Card Collecting Glossary',
          description: 'Complete glossary of sports card and Pokemon card terminology with 80+ terms.',
        }} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'What does RC mean on a sports card?', acceptedAnswer: { '@type': 'Answer', text: 'RC stands for Rookie Card — a player\'s first officially licensed trading card from a major manufacturer. Rookie cards are the most collected card type and drive the majority of the hobby market.' } },
            { '@type': 'Question', name: 'What is the junk wax era?', acceptedAnswer: { '@type': 'Answer', text: 'The junk wax era (approximately 1986-1993) was when card companies massively overproduced. Billions of cards were printed, destroying scarcity. Most junk wax cards are worth pennies, but key rookies like Griffey and Jordan retained value.' } },
            { '@type': 'Question', name: 'What is a parallel card?', acceptedAnswer: { '@type': 'Answer', text: 'A parallel is a variation of a base card with a different color, finish, or border. Examples include Prizm Silver, Topps Chrome Refractor, and Optic Holo. Parallels are rarer than base cards and command higher prices.' } },
            { '@type': 'Question', name: 'What is a box break?', acceptedAnswer: { '@type': 'Answer', text: 'A box break is a group-buying format where participants pay for a spot (usually by team) and a host opens sealed product on video. You receive the cards from your team. It is a popular way to access expensive hobby boxes.' } },
          ],
        }} />
      </div>
    </main>
  );
}
