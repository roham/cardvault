import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Breadcrumb from '@/components/Breadcrumb';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PSA Grading Scale Explained: What is PSA 10, PSA 9, PSA 8? (2026 Guide)',
  description: 'Complete PSA grading scale from PSA 1 to PSA 10 Gem Mint. Learn what each grade means, how PSA evaluates cards, centering standards, and what grade your card might receive.',
  keywords: ['PSA grading scale', 'what is PSA 10', 'PSA 9 vs PSA 10', 'PSA grades explained', 'PSA Gem Mint', 'card grading scale', 'PSA centering requirements'],
};

interface GradeInfo {
  grade: string;
  name: string;
  description: string;
  centering: string;
  corners: string;
  edges: string;
  surface: string;
  premiumNote: string;
  color: string;
}

const grades: GradeInfo[] = [
  { grade: '10', name: 'Gem Mint', description: 'Virtually perfect in every way. The card must have four sharp corners, perfect centering within tolerance, smooth edges, and a clean surface with no print lines.', centering: '55/45 or better on front, 75/25 or better on back', corners: 'Four perfectly sharp corners with no wear', edges: 'No edge chipping, no rough edges', surface: 'No print lines, scratches, haze, or surface defects', premiumNote: 'Commands the highest premium — often 2-5x over PSA 9. The gold standard of graded cards.', color: 'text-yellow-400' },
  { grade: '9', name: 'Mint', description: 'A superb condition card with one minor flaw. This could be very slight off-centering, a barely perceptible print line, or a hairline touch of corner whitening.', centering: '60/40 or better on front, 90/10 or better on back', corners: 'Four sharp corners with at most one minor imperfection', edges: 'Smooth edges with minimal visible wear', surface: 'One minor flaw such as a slight print line', premiumNote: 'The sweet spot for most collectors — significantly cheaper than PSA 10 but still high-grade.', color: 'text-green-400' },
  { grade: '8', name: 'NM-MT (Near Mint-Mint)', description: 'A near-perfect card with 2-3 minor flaws. Slight off-centering, minor corner wear, or surface imperfections noticeable on close inspection.', centering: '65/35 or better on front, 90/10 or better on back', corners: 'Slight corner whitening or minor tip wear on 1-2 corners', edges: 'Slight edge wear that is barely noticeable', surface: 'Minor print defects acceptable', premiumNote: 'Great entry point for expensive cards — often 50-70% cheaper than PSA 9 for modern cards.', color: 'text-blue-400' },
  { grade: '7', name: 'NM (Near Mint)', description: 'A well-centered card with minor wear on corners and edges. May have a slight crease or print defect. The card looks good at first glance.', centering: '70/30 or better on front, 90/10 or better on back', corners: 'Light fuzzing or whitening on multiple corners', edges: 'Slight roughness along one or more edges', surface: 'Light scratches or print defects acceptable', premiumNote: 'Solid collector grade for vintage cards — many pre-1980 cards in PSA 7 are excellent values.', color: 'text-cyan-400' },
  { grade: '6', name: 'EX-MT (Excellent-Mint)', description: 'Noticeable surface wear and/or printing defects. May have off-centering, corner wear, and minor creasing. Still a presentable card.', centering: '75/25 or better on front', corners: 'Moderate corner wear — rounding or whitening visible', edges: 'Noticeable edge wear or minor chipping', surface: 'Light creasing or print spots acceptable', premiumNote: 'Affordable way to own high-end vintage. A PSA 6 1952 Mantle is still a significant card.', color: 'text-purple-400' },
  { grade: '5', name: 'EX (Excellent)', description: 'A card with several moderate flaws but no severe damage. Noticeable wear on corners and edges, moderate centering issues. Still a solid representative of the card.', centering: '80/20 or better on front', corners: 'Moderate to heavy corner wear', edges: 'Moderate edge wear with possible chipping', surface: 'Minor creases, print defects, light staining acceptable', premiumNote: 'The value sweet spot for vintage cards pre-1970. Authentic, slabbed, and affordable.', color: 'text-orange-400' },
  { grade: '4', name: 'VG-EX (Very Good-Excellent)', description: 'Moderate wear throughout. Corners show heavy rounding, edges show wear, and slight creases may be present. Card is complete with no major structural damage.', centering: 'No specific requirement', corners: 'Heavy rounding on most corners', edges: 'Heavy edge wear with moderate chipping', surface: 'Moderate creases and surface wear acceptable', premiumNote: 'Entry level for rare vintage. A PSA 4 T206 Honus Wagner sold for $1.5M in 2021.', color: 'text-red-400' },
  { grade: '1-3', name: 'Poor to VG', description: 'Cards showing heavy wear, major creases, writing, staining, or structural damage. These grades authenticate the card more than they assess condition. Still valuable for rare vintage where any authenticated example is significant.', centering: 'No specific requirement', corners: 'Heavy wear acceptable', edges: 'Heavy wear and damage acceptable', surface: 'Major creases, staining, and damage acceptable', premiumNote: 'Authentication value primarily. For T206-era and other pre-war cards, even PSA 1 copies hold significant value.', color: 'text-gray-400' },
];

export default function PsaGradingScalePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'PSA Grading Scale' },
        ]} />

        <h1 className="text-3xl sm:text-4xl font-bold mt-6 mb-4">PSA Grading Scale Explained: What Every Grade Means</h1>
        <p className="text-gray-400 text-lg mb-8">
          PSA (Professional Sports Authenticator) uses a 1-10 grading scale to evaluate sports cards and trading cards.
          Understanding what each grade means — and what PSA looks at — helps you decide whether to submit a card
          and set realistic expectations for the grade it will receive.
        </p>

        {/* Quick Answer Box */}
        <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-6 mb-10">
          <h2 className="text-xl font-bold text-blue-300 mb-3">What is PSA 10?</h2>
          <p className="text-gray-300">
            <strong>PSA 10 (Gem Mint)</strong> is the highest grade a card can receive from PSA. It means the card is
            virtually perfect: four sharp corners, centering within 55/45 on the front and 75/25 on the back, smooth
            edges, and a clean surface with no print lines, scratches, or defects. PSA 10 cards typically command
            <strong> 2-5x higher prices</strong> than PSA 9 copies of the same card.
          </p>
        </div>

        {/* The Four Factors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">The Four Factors PSA Evaluates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Centering', desc: 'How evenly the image is positioned within the card borders. Measured as a ratio (e.g., 55/45 means 55% on one side, 45% on the other). PSA 10 requires 55/45 or better on front.', icon: '🎯' },
              { title: 'Corners', desc: 'Sharpness of all four corners. PSA examines under magnification for any rounding, whitening, or chipping. Corner damage is the most common reason cards miss PSA 10.', icon: '📐' },
              { title: 'Edges', desc: 'Smoothness and consistency of card edges. Chipping, roughness, or diamond-cutting (jagged cut lines) can lower a grade. Often requires a loupe to properly evaluate.', icon: '✂️' },
              { title: 'Surface', desc: 'The face and back of the card. Includes print lines (factory defects), scratches, haze, wax staining, and fingerprints. Surface issues on Chrome/Prizm cards are extremely common.', icon: '🔍' },
            ].map((factor) => (
              <div key={factor.title} className="bg-gray-900/60 border border-gray-800/60 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{factor.icon}</span>
                  <h3 className="text-lg font-semibold">{factor.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{factor.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Grade Breakdown */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">PSA Grade Breakdown: 10 to 1</h2>
          <div className="space-y-6">
            {grades.map((g) => (
              <div key={g.grade} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
                <div className="flex items-baseline gap-3 mb-3">
                  <span className={`text-3xl font-black ${g.color}`}>PSA {g.grade}</span>
                  <span className="text-lg font-semibold text-gray-300">{g.name}</span>
                </div>
                <p className="text-gray-300 mb-4">{g.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Centering:</span> <span className="text-gray-300">{g.centering}</span></div>
                  <div><span className="text-gray-500">Corners:</span> <span className="text-gray-300">{g.corners}</span></div>
                  <div><span className="text-gray-500">Edges:</span> <span className="text-gray-300">{g.edges}</span></div>
                  <div><span className="text-gray-500">Surface:</span> <span className="text-gray-300">{g.surface}</span></div>
                </div>
                <p className="text-sm text-yellow-400/80 mt-3 italic">{g.premiumNote}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PSA 9 vs PSA 10 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">PSA 9 vs PSA 10: Is the Upgrade Worth It?</h2>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
            <p className="text-gray-300 mb-4">
              The jump from PSA 9 to PSA 10 is the single biggest price multiplier in the hobby. For many modern
              cards, PSA 10 commands 2-5x the price of PSA 9. But the difference in physical quality between a 9 and
              10 can be almost invisible to the naked eye.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="py-2 pr-4">Card Example</th>
                    <th className="py-2 pr-4">PSA 9 Price</th>
                    <th className="py-2 pr-4">PSA 10 Price</th>
                    <th className="py-2">Multiplier</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-800/50"><td className="py-2 pr-4">2018 Prizm Luka Doncic</td><td className="py-2 pr-4">~$400</td><td className="py-2 pr-4">~$1,800</td><td className="py-2 text-green-400">4.5x</td></tr>
                  <tr className="border-b border-gray-800/50"><td className="py-2 pr-4">2020 Prizm Justin Herbert</td><td className="py-2 pr-4">~$60</td><td className="py-2 pr-4">~$250</td><td className="py-2 text-green-400">4.2x</td></tr>
                  <tr className="border-b border-gray-800/50"><td className="py-2 pr-4">Base Set Charizard Holo</td><td className="py-2 pr-4">~$3,000</td><td className="py-2 pr-4">~$15,000</td><td className="py-2 text-green-400">5x</td></tr>
                  <tr><td className="py-2 pr-4">1986 Fleer Michael Jordan</td><td className="py-2 pr-4">~$15,000</td><td className="py-2 pr-4">~$50,000</td><td className="py-2 text-green-400">3.3x</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Prices are approximate as of early 2026 based on eBay sold comps.
              The multiplier varies by card — high-population modern cards tend to have larger 9-to-10 gaps.
            </p>
          </div>
        </section>

        {/* How to Self-Grade */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How to Estimate Your Card&apos;s Grade Before Submitting</h2>
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6">
            <ol className="space-y-4 text-gray-300">
              <li><strong>1. Use a loupe or jeweler&apos;s magnifier (10x).</strong> Your naked eye will miss corner whitening and surface scratches that PSA will catch.</li>
              <li><strong>2. Check centering first.</strong> Use a ruler or centering tool. If centering is worse than 60/40, you likely won&apos;t get a PSA 10.</li>
              <li><strong>3. Examine corners under magnification.</strong> Rotate the card and check each corner. Any white dot visible under 10x magnification is a ding.</li>
              <li><strong>4. Check edges with your fingertip.</strong> Run your finger gently along each edge. Any roughness indicates edge wear.</li>
              <li><strong>5. Hold the card at an angle under bright light.</strong> This reveals surface scratches, print lines, and haze that are invisible straight-on.</li>
              <li><strong>6. Compare to eBay photos of graded copies.</strong> Search the exact card in PSA 10, look at the centering and condition, then compare to yours.</li>
            </ol>
          </div>
        </section>

        {/* Related Tools */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Related CardVault Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/tools/grading-roi" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Grading ROI Calculator</h3>
              <p className="text-sm text-gray-400 mt-1">Calculate whether grading your card is worth the cost based on raw vs. graded price difference.</p>
            </Link>
            <Link href="/guides/psa-vs-bgs-vs-cgc" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">PSA vs BGS vs CGC Comparison</h3>
              <p className="text-sm text-gray-400 mt-1">Which grading company should you use? Full comparison of costs, turnaround, and premiums.</p>
            </Link>
            <Link href="/guides/when-to-grade-your-cards" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">When to Grade Your Cards</h3>
              <p className="text-sm text-gray-400 mt-1">The break-even math on grading — which cards benefit most and when it does not make sense.</p>
            </Link>
            <Link href="/tools/identify" className="block bg-gray-900/60 border border-gray-800/60 rounded-lg p-4 hover:border-blue-600/50 transition-colors">
              <h3 className="font-semibold text-blue-400">Card Identifier</h3>
              <p className="text-sm text-gray-400 mt-1">Not sure what card you have? Search by player, year, or set to identify your card.</p>
            </Link>
          </div>
        </section>

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'PSA Grading Scale Explained: What Every Grade Means',
          description: 'Complete PSA grading scale from PSA 1 to PSA 10 Gem Mint. Learn what each grade means and how PSA evaluates cards.',
          author: { '@type': 'Organization', name: 'CardVault' },
          publisher: { '@type': 'Organization', name: 'CardVault' },
          datePublished: '2026-04-14',
          dateModified: '2026-04-14',
        }} />
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is PSA 10?',
              acceptedAnswer: { '@type': 'Answer', text: 'PSA 10 (Gem Mint) is the highest grade a card can receive from PSA. It means the card has four sharp corners, centering within 55/45 on front and 75/25 on back, smooth edges, and a clean surface with no defects. PSA 10 cards command 2-5x higher prices than PSA 9.' }
            },
            {
              '@type': 'Question',
              name: 'What is the difference between PSA 9 and PSA 10?',
              acceptedAnswer: { '@type': 'Answer', text: 'PSA 9 (Mint) allows one minor flaw such as slight off-centering (up to 60/40) or a barely perceptible print line. PSA 10 (Gem Mint) must be virtually perfect with centering at 55/45 or better. The price difference is typically 2-5x for modern cards.' }
            },
            {
              '@type': 'Question',
              name: 'What does PSA look at when grading a card?',
              acceptedAnswer: { '@type': 'Answer', text: 'PSA evaluates four factors: centering (how evenly positioned the image is within borders), corners (sharpness of all four corners), edges (smoothness and consistency), and surface (print quality, scratches, haze). All four must meet the grade standard.' }
            },
            {
              '@type': 'Question',
              name: 'How much does PSA grading cost?',
              acceptedAnswer: { '@type': 'Answer', text: 'PSA Economy costs $25/card with 65 business day turnaround. PSA Regular is $75/card with 30 business days. Express is $150/card with 15 business days. Add ~$20-35 for shipping round trip.' }
            },
          ],
        }} />
      </div>
    </main>
  );
}
