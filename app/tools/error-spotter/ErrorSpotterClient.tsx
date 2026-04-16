'use client';

import { useState } from 'react';
import Link from 'next/link';

type ErrorCategory = 'printing' | 'variation' | 'factory' | 'centering' | 'all';
type Era = 'vintage' | 'junk' | 'modern' | 'ultra-modern' | 'all';

interface ErrorType {
  id: string;
  name: string;
  category: ErrorCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'ultra-rare';
  valuePremium: string;
  description: string;
  howToSpot: string[];
  examples: string[];
  eras: Era[];
}

const errorTypes: ErrorType[] = [
  // Printing Errors
  {
    id: 'wrong-back',
    name: 'Wrong Back Error',
    category: 'printing',
    rarity: 'rare',
    valuePremium: '5x-50x base value',
    description: 'Card has the correct front image but a completely different player\'s stats and info on the back. Caused by sheets being fed out of alignment during the printing process.',
    howToSpot: ['Front and back show different players', 'Back stats don\'t match front player', 'Card number on back may differ from checklist', 'Compare with a known correct copy'],
    examples: ['1989 Fleer Bill Ripken (multiple back variations)', '1990 Topps Frank Thomas NNOF (No Name On Front)', '2020 Topps Chrome wrong-back parallels'],
    eras: ['vintage', 'junk', 'modern', 'ultra-modern'],
  },
  {
    id: 'missing-foil',
    name: 'Missing Foil Stamp',
    category: 'factory',
    rarity: 'uncommon',
    valuePremium: '2x-10x base value',
    description: 'The foil stamping (team logo, brand logo, or player name) is partially or completely absent. Common in products that use foil stamping in their design.',
    howToSpot: ['Area where foil should be is blank or shows raw cardstock', 'Compare foil placement with a correct copy', 'Partial foil (smeared or incomplete) is also collectible', 'Check under magnification for residue'],
    examples: ['Topps Chrome missing refractor foil', 'Panini Prizm missing silver coating', 'Upper Deck missing hologram'],
    eras: ['modern', 'ultra-modern'],
  },
  {
    id: 'double-print',
    name: 'Double Print / Ghost Image',
    category: 'printing',
    rarity: 'uncommon',
    valuePremium: '1.5x-5x base value',
    description: 'A second, offset impression of the image appears as a "ghost" behind the primary image. Caused by the printing plate not being properly cleaned between runs.',
    howToSpot: ['Faint secondary image visible behind main image', 'Text appears doubled or shadowed', 'Colors may appear muddled or oversaturated', 'Hold card at angle to see offset impression'],
    examples: ['1969 Topps White Letter variations', 'Various Topps base cards with ghosting', '2023 Bowman ghost image errors'],
    eras: ['vintage', 'junk', 'modern', 'ultra-modern'],
  },
  {
    id: 'miscut',
    name: 'Miscut / Off-Center Cut',
    category: 'factory',
    rarity: 'common',
    valuePremium: '0.5x-3x (minor miscuts decrease value, extreme miscuts showing adjacent card increase value)',
    description: 'Card is cut off-center, with uneven borders. Minor miscuts REDUCE value. However, extreme miscuts that show part of the adjacent card can be worth a significant premium to error collectors.',
    howToSpot: ['Measure border widths — standard cards have equal borders', 'Severe miscuts show part of another card at the edge', 'Completely blank borders on one side indicate extreme miscut', 'Adjacent card visible = premium; slight off-center = penalty'],
    examples: ['Any set can produce miscuts', 'Diamond-cut errors (rotated 45 degrees)', 'Miscuts showing two players are most valuable'],
    eras: ['vintage', 'junk', 'modern', 'ultra-modern'],
  },
  {
    id: 'ink-smear',
    name: 'Ink Smear / Blotch',
    category: 'printing',
    rarity: 'common',
    valuePremium: '1x-3x base value (most reduce value; large/distinctive smears can add premium)',
    description: 'Excess ink creates a visible smear, blob, or streak on the card surface. Most ink errors decrease value, but distinctive or strategically-placed smears on star cards can command premiums.',
    howToSpot: ['Visible colored streaks or blobs', 'Area of abnormal color density', 'May be on front or back', 'Differs from staining (which happens after production)'],
    examples: ['Topps black ink smear errors', 'Colored streaks across card face', 'Back printing smears'],
    eras: ['vintage', 'junk', 'modern', 'ultra-modern'],
  },
  {
    id: 'no-name',
    name: 'No Name on Front (NNOF)',
    category: 'printing',
    rarity: 'very-rare',
    valuePremium: '10x-100x+ base value',
    description: 'The player\'s name is completely absent from the front of the card. One of the most famous errors in collecting. The 1990 Topps Frank Thomas NNOF is one of the most valuable error cards ever produced.',
    howToSpot: ['Name line/bar is completely blank', 'Position text may also be missing', 'Compare carefully with normal version', 'Some NNOF cards were corrected mid-print run'],
    examples: ['1990 Topps Frank Thomas #414 NNOF (worth $50-$500+)', '2001 Topps Traded Albert Pujols missing foil', 'Various Topps base cards across years'],
    eras: ['vintage', 'junk', 'modern'],
  },
  // Variations
  {
    id: 'ssp',
    name: 'Short Print / Super Short Print (SP/SSP)',
    category: 'variation',
    rarity: 'rare',
    valuePremium: '3x-50x base value',
    description: 'Intentionally printed in lower quantities than standard base cards. Photo variations (different photo from base) are the most common type. SSPs are even more limited than SPs.',
    howToSpot: ['Check card code on back (Topps uses specific codes for SP/SSP)', 'Compare photo with base version — SP often has a different pose', 'Some sets mark SPs with different card numbers or suffixes', 'Topps SP code on back is typically 3-4 digits longer'],
    examples: ['Topps Series 1/2 photo SPs and SSPs', 'Bowman Chrome prospect SPs', 'Panini Prizm photo variations', 'Upper Deck Young Guns High Series'],
    eras: ['modern', 'ultra-modern'],
  },
  {
    id: 'photo-variation',
    name: 'Photo Variation',
    category: 'variation',
    rarity: 'rare',
    valuePremium: '2x-20x base value',
    description: 'Same card number and design, but features a different photograph of the player. Often the most subtle and valuable variation type because casual collectors miss them entirely.',
    howToSpot: ['Compare player pose/action with standard base card', 'Photo may show different uniform, angle, or setting', 'Card number is identical to base version', 'Sometimes background color or lighting differs'],
    examples: ['Topps flagship photo SPs (legends in throwback uniforms)', '2018 Topps Update Shohei Ohtani SP variations', 'Bowman Chrome prospect photo variations'],
    eras: ['modern', 'ultra-modern'],
  },
  {
    id: 'reverse-negative',
    name: 'Reverse Negative / Flipped Image',
    category: 'printing',
    rarity: 'very-rare',
    valuePremium: '5x-30x base value',
    description: 'The player\'s image is printed as a mirror image (reversed left-to-right). Look for jersey numbers that appear backwards or left-handed players appearing right-handed.',
    howToSpot: ['Jersey numbers or text appear reversed/mirrored', 'Right-handed player appears left-handed (or vice versa)', 'Team logo may face the wrong direction', 'Compare batting/throwing stance with known photos'],
    examples: ['1957 Topps reversed image errors', '1989 Fleer Bill Ripken reverse variations', 'Various vintage Topps reversed negatives'],
    eras: ['vintage', 'junk'],
  },
  {
    id: 'color-shift',
    name: 'Color Shift / Registration Error',
    category: 'printing',
    rarity: 'uncommon',
    valuePremium: '1.5x-5x base value',
    description: 'One or more color layers are misaligned during printing, creating a blurry or 3D-like effect. The more dramatic the shift, the more valuable the error.',
    howToSpot: ['Image appears blurry or has a 3D/anaglyph effect', 'Text may have colored shadows', 'One color (usually cyan, magenta, yellow, or black) is offset', 'Compare with correctly printed copy'],
    examples: ['Topps base cards with major CMYK shifts', 'Panini products with color registration issues', 'Any offset-printed product can have color shifts'],
    eras: ['vintage', 'junk', 'modern', 'ultra-modern'],
  },
  {
    id: 'blank-back',
    name: 'Blank Back',
    category: 'factory',
    rarity: 'rare',
    valuePremium: '3x-15x base value',
    description: 'The back of the card is completely blank — no stats, no text, just raw white or grey cardstock. Caused by the back printing sheet being missed during production.',
    howToSpot: ['Back is completely blank/white', 'No printing at all on reverse side', 'Card stock may look different from normal', 'Compare weight — should be same as regular card'],
    examples: ['Topps blank back proofs (sometimes from sheet cutting)', 'Factory error blank backs (unintentional)', 'Pre-production proofs sometimes surface'],
    eras: ['vintage', 'junk', 'modern', 'ultra-modern'],
  },
  {
    id: 'uncorrected-error',
    name: 'Uncorrected Error (stat/bio mistake)',
    category: 'printing',
    rarity: 'common',
    valuePremium: '1x-2x base value (most carry minimal premium unless famous)',
    description: 'Statistical, biographical, or textual errors that were never corrected in subsequent print runs. Most carry minimal premium unless the error is famous or the player is a star.',
    howToSpot: ['Wrong stats listed (check against official records)', 'Incorrect team, position, or birthdate', 'Wrong player photo (correct name, wrong face)', 'Misspelled names or city names'],
    examples: ['2007 Topps #316 wrong photo (two different players swapped)', 'Incorrect stat lines on various Topps cards', 'Misspelled names throughout various sets'],
    eras: ['vintage', 'junk', 'modern', 'ultra-modern'],
  },
];

const categories: { value: ErrorCategory; label: string; count: number }[] = [
  { value: 'all', label: 'All Errors', count: errorTypes.length },
  { value: 'printing', label: 'Printing Errors', count: errorTypes.filter(e => e.category === 'printing').length },
  { value: 'variation', label: 'Variations', count: errorTypes.filter(e => e.category === 'variation').length },
  { value: 'factory', label: 'Factory Errors', count: errorTypes.filter(e => e.category === 'factory').length },
];

const eras: { value: Era; label: string; years: string }[] = [
  { value: 'all', label: 'All Eras', years: '' },
  { value: 'vintage', label: 'Vintage', years: 'Pre-1980' },
  { value: 'junk', label: 'Junk Wax Era', years: '1980-1994' },
  { value: 'modern', label: 'Modern', years: '1995-2019' },
  { value: 'ultra-modern', label: 'Ultra-Modern', years: '2020+' },
];

const rarityColors: Record<string, { bg: string; text: string; label: string }> = {
  'common': { bg: 'bg-slate-700/40', text: 'text-slate-300', label: 'Common' },
  'uncommon': { bg: 'bg-green-900/40', text: 'text-green-400', label: 'Uncommon' },
  'rare': { bg: 'bg-blue-900/40', text: 'text-blue-400', label: 'Rare' },
  'very-rare': { bg: 'bg-purple-900/40', text: 'text-purple-400', label: 'Very Rare' },
  'ultra-rare': { bg: 'bg-amber-900/40', text: 'text-amber-400', label: 'Ultra Rare' },
};

const famousErrors = [
  { card: '1990 Topps Frank Thomas #414 NNOF', value: '$50-$500+', desc: 'No Name on Front — the most famous modern error card', icon: '\u26be' },
  { card: '1989 Fleer Bill Ripken #616', value: '$25-$1,000+', desc: 'Obscene text on bat knob — multiple correction variants exist', icon: '\u26be' },
  { card: '1957 Topps #62 Billy Martin (wrong back)', value: '$100-$300', desc: 'Billy Martin front with Whitey Ford stats on back', icon: '\u26be' },
  { card: '2018 Topps Update Shohei Ohtani SP', value: '$200-$2,000+', desc: 'Photo variation showing batting vs pitching pose', icon: '\u26be' },
  { card: '1969 Topps White Letter Variations', value: '$2x-5x base', desc: 'Team name in white vs yellow lettering', icon: '\u26be' },
  { card: '2020 Topps Chrome Sapphire Luis Robert SSP', value: '$500-$5,000+', desc: 'Super short print photo variation in premium product', icon: '\u26be' },
];

const fakeVsRealTips = [
  { title: 'Real errors are consistent', desc: 'A genuine error affects every copy of that card from that print run. If only your copy has the error, it was likely damaged post-production.' },
  { title: 'Check the print run', desc: 'Authentic printing errors show clean, machine-produced characteristics. Hand-altered cards show irregularities under magnification.' },
  { title: 'Research before buying', desc: 'Cross-reference any error against collector databases (Beckett, TCDB, collector forums). Known errors are well-documented.' },
  { title: 'Be skeptical of "one-of-a-kind" claims', desc: 'If a seller claims an error is unique and undocumented, proceed with extreme caution. Most legitimate errors are known to the hobby.' },
  { title: 'Surface damage is not an error', desc: 'Scratches, dents, stains, and surface wear happen after production. These are condition issues, not errors, and they reduce value.' },
  { title: 'Centering is not always an error', desc: 'Mild off-center cards are common manufacturing variance. Only extreme miscuts (showing adjacent card) qualify as collectible errors.' },
];

export default function ErrorSpotterClient() {
  const [category, setCategory] = useState<ErrorCategory>('all');
  const [era, setEra] = useState<Era>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = errorTypes.filter(e => {
    if (category !== 'all' && e.category !== category) return false;
    if (era !== 'all' && !e.eras.includes(era)) return false;
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      if (!e.name.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  category === c.value
                    ? 'bg-indigo-600/30 border border-indigo-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Era</label>
          <div className="flex flex-wrap gap-2">
            {eras.map(e => (
              <button
                key={e.value}
                onClick={() => setEra(e.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  era === e.value
                    ? 'bg-indigo-600/30 border border-indigo-500 text-white'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {e.label} {e.years && <span className="text-slate-500 ml-1">{e.years}</span>}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search error types..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Showing {filtered.length} of {errorTypes.length} error types
      </div>

      {/* Error Cards */}
      <div className="space-y-3">
        {filtered.map(error => {
          const rarity = rarityColors[error.rarity];
          const isExpanded = expandedId === error.id;
          return (
            <div
              key={error.id}
              className={`rounded-xl border transition-all ${isExpanded ? 'border-indigo-500/50 bg-slate-800/60' : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'}`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : error.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white font-bold text-sm">{error.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rarity.bg} ${rarity.text}`}>
                      {rarity.label}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{error.category}</span>
                  </div>
                  <div className="text-xs text-emerald-400 mt-1">Premium: {error.valuePremium}</div>
                </div>
                <span className="text-slate-500 text-lg">{isExpanded ? '\u25b2' : '\u25bc'}</span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-slate-700/50 pt-4">
                  <p className="text-sm text-slate-300 leading-relaxed">{error.description}</p>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-2">How to Spot It</h4>
                    <ul className="space-y-1">
                      {error.howToSpot.map((tip, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">\u2022</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-2">Famous Examples</h4>
                    <div className="flex flex-wrap gap-2">
                      {error.examples.map((ex, i) => (
                        <span key={i} className="text-xs bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white mb-2">Found In Eras</h4>
                    <div className="flex gap-2">
                      {error.eras.map(e => (
                        <span key={e} className="text-[10px] bg-slate-700/30 text-slate-400 px-2 py-0.5 rounded capitalize">
                          {e === 'ultra-modern' ? 'Ultra-Modern (2020+)' : e === 'junk' ? 'Junk Wax (1980-94)' : e === 'vintage' ? 'Vintage (pre-1980)' : 'Modern (1995-2019)'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Famous Error Cards */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Most Famous Error Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {famousErrors.map((card, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{card.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{card.card}</div>
                  <div className="text-xs text-emerald-400 mt-0.5">{card.value}</div>
                  <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fake vs Real */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Fake vs. Real: How to Tell</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fakeVsRealTips.map((tip, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="text-sm font-bold text-white mb-1">{tip.title}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Related Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/tools/auth-check', label: 'Authentication Checker', desc: '12-point inspection' },
            { href: '/tools/condition-grader', label: 'Condition Grader', desc: 'Self-grade your cards' },
            { href: '/tools/cert-check', label: 'Cert Verifier', desc: 'Check slab authenticity' },
            { href: '/tools/photo-grade-estimator', label: 'Photo Grade Estimator', desc: 'Visual grade assessment' },
            { href: '/tools/rarity-score', label: 'Rarity Score', desc: '0-100 rarity rating' },
            { href: '/tools/pop-report', label: 'Population Report', desc: 'Grade distribution data' },
          ].map(t => (
            <Link key={t.href} href={t.href} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-indigo-500/50 transition-colors">
              <div className="text-sm font-medium text-white">{t.label}</div>
              <div className="text-xs text-slate-500">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}