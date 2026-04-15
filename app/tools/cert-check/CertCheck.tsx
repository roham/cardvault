'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

/* ───── PSA cert ranges by era ───── */
const certRanges = [
  { era: 'Early PSA (1991-1998)', range: '00000001 – 09999999', digits: '8 digits', prefix: 'None', notes: 'Original PSA numbering. Cards from this era are vintage graded. Very early certs under 1M are highly collectible.' },
  { era: 'Growth Era (1999-2008)', range: '10000000 – 29999999', digits: '8 digits', prefix: 'None', notes: 'PSA expanded rapidly. Sports card boom era. Most cert numbers in this range are football, baseball, and basketball.' },
  { era: 'Modern Era (2009-2019)', range: '30000000 – 59999999', digits: '8 digits', prefix: 'None', notes: 'PSA became the dominant grading company. Pokemon and non-sports cards increasingly submitted.' },
  { era: 'Boom Era (2020-2022)', range: '60000000 – 79999999', digits: '8 digits', prefix: 'None', notes: 'COVID-era submission explosion. Wait times exceeded 12 months. Cert numbers skyrocketed.' },
  { era: 'Current Era (2023+)', range: '80000000+', digits: '8 digits', prefix: 'None', notes: 'PSA caught up on backlog. AI-assisted grading introduced. Numbers continue to climb.' },
];

const redFlags = [
  { flag: 'Cert number not found on PSA website', severity: 'high', detail: 'Every legitimate PSA-graded card has a cert number in their database at psacard.com/cert. If the number returns no results, the slab is fake.' },
  { flag: 'Label font or color looks wrong', severity: 'high', detail: 'PSA has changed label designs over the years, but each era has specific fonts, colors, and layouts. Compare against known authentic examples from the same era.' },
  { flag: 'Cert number format does not match', severity: 'high', detail: 'PSA cert numbers are 8 digits (or 8+ for recent). Numbers like "PSA-12345" or "1234567890" (10 digits) are not valid PSA formats.' },
  { flag: 'QR code does not scan or links to wrong page', severity: 'high', detail: 'Modern PSA labels have QR codes that link directly to the cert page. If the QR code leads nowhere or to a different card, the slab is fake.' },
  { flag: 'Case feels lightweight or flimsy', severity: 'medium', detail: 'Authentic PSA slabs have a specific weight and rigidity. Counterfeit cases often feel lighter or more flexible than genuine ones.' },
  { flag: 'Hologram looks flat or does not shift colors', severity: 'medium', detail: 'PSA holograms should show iridescent color shifts when tilted. Flat, non-shifting holograms indicate counterfeiting.' },
  { flag: 'Grade on slab does not match cert lookup', severity: 'high', detail: 'If the slab says PSA 10 but the cert lookup shows PSA 9, the label has been swapped. This is a common fraud technique.' },
  { flag: 'Card description on label does not match card', severity: 'high', detail: 'The year, set, player, and card number on the label must exactly match the card inside. Any mismatch means the card was swapped after grading.' },
];

const otherCompanies = [
  { company: 'BGS (Beckett)', format: '0012345678 (10 digits)', lookup: 'beckett.com/grading/card-lookup', notes: 'Beckett certs are 10 digits. Sub-grades (centering, corners, edges, surface) are on the label.' },
  { company: 'CGC (Cards)', format: '4012345001 (10 digits)', lookup: 'cgccards.com/certlookup/', notes: 'CGC uses 10-digit numbers starting with category prefix. Originally a comic grading company.' },
  { company: 'SGC', format: '1234567 (7 digits)', lookup: 'gosgc.com/card-lookup', notes: 'SGC certs are typically 7 digits. Known for tuxedo-style black labels and vintage card expertise.' },
];

export default function CertCheck() {
  const [certNumber, setCertNumber] = useState('');
  const [showRanges, setShowRanges] = useState(false);

  const analysis = useMemo(() => {
    const clean = certNumber.replace(/\D/g, '');
    if (!clean || clean.length < 6) return null;

    const num = parseInt(clean);
    let era = 'Unknown';
    let valid = false;
    let notes = '';

    if (clean.length === 8) {
      valid = true;
      if (num < 10000000) { era = 'Early PSA (1991-1998)'; notes = 'Very early PSA cert. These slabs are vintage and may have the old-style label. Highly collectible for label collectors.'; }
      else if (num < 30000000) { era = 'Growth Era (1999-2008)'; notes = 'Standard PSA cert from the growth era. Labels from this period use the classic red/white design.'; }
      else if (num < 60000000) { era = 'Modern Era (2009-2019)'; notes = 'Modern PSA cert. Labels transitioned to the current design during this period.'; }
      else if (num < 80000000) { era = 'Boom Era (2020-2022)'; notes = 'COVID boom era cert. Extremely high submission volumes. Labels use the current PSA design with hologram.'; }
      else { era = 'Current Era (2023+)'; notes = 'Recent PSA cert. Should have the latest label design with QR code and hologram.'; }
    } else if (clean.length === 9 || clean.length === 10) {
      // Could be BGS or CGC
      if (clean.length === 10) {
        era = 'Possibly BGS or CGC format';
        notes = 'This looks like a BGS (Beckett) or CGC cert number (10 digits). PSA uses 8 digits. Check with the appropriate company.';
        valid = false;
      } else {
        era = 'Non-standard PSA format';
        notes = 'PSA cert numbers are typically 8 digits. This may be from a different grading company.';
        valid = false;
      }
    } else if (clean.length === 7) {
      era = 'Possibly SGC format';
      notes = 'This looks like an SGC cert number (7 digits). PSA uses 8 digits. Verify at gosgc.com/card-lookup.';
      valid = false;
    } else {
      era = 'Invalid format';
      notes = 'PSA cert numbers are 8 digits. This number does not match any known grading company format.';
      valid = false;
    }

    return { clean, num, era, valid, notes, formatted: clean.replace(/(\d{4})(\d{4})/, '$1 $2') };
  }, [certNumber]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 bg-emerald-800 text-emerald-300 rounded-full text-sm font-bold">1</span>
          Enter Certification Number
        </h2>
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={certNumber}
              onChange={e => setCertNumber(e.target.value)}
              placeholder="e.g. 48567321"
              maxLength={15}
              className="flex-1 bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-3 text-lg font-mono tracking-wider focus:outline-none focus:border-emerald-500 placeholder-gray-600"
            />
            {certNumber && (
              <a
                href={`https://www.psacard.com/cert/${certNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
              >
                Verify on PSA &rarr;
              </a>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Find the cert number on the PSA label — it is the 8-digit number below the barcode.
          </p>
        </div>
      </section>

      {/* Analysis Result */}
      {analysis && (
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 bg-emerald-800 text-emerald-300 rounded-full text-sm font-bold">2</span>
            Analysis
          </h2>
          <div className={`rounded-xl border p-6 ${analysis.valid ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-yellow-900/20 border-yellow-700/50'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-900/60 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Cert Number</p>
                <p className="text-white font-mono text-lg tracking-wider">{analysis.formatted}</p>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Format</p>
                <p className={`font-medium text-sm ${analysis.valid ? 'text-emerald-400' : 'text-yellow-400'}`}>
                  {analysis.valid ? 'Valid PSA Format' : 'Non-PSA Format'}
                </p>
              </div>
              <div className="bg-gray-900/60 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Estimated Era</p>
                <p className="text-white font-medium text-sm">{analysis.era}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{analysis.notes}</p>
            {analysis.valid && (
              <div className="mt-4 p-3 bg-gray-900/40 rounded-lg">
                <p className="text-emerald-400 text-xs font-medium mb-1">Next Step</p>
                <p className="text-gray-300 text-xs">
                  Visit <a href={`https://www.psacard.com/cert/${analysis.clean}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">psacard.com/cert/{analysis.clean}</a> to verify this cert. Compare the card name, grade, and year on the PSA website with the physical label.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Red Flags Section */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 bg-emerald-800 text-emerald-300 rounded-full text-sm font-bold">3</span>
          Red Flags — How to Spot a Fake Slab
        </h2>
        <div className="space-y-3">
          {redFlags.map((rf, i) => (
            <div key={i} className={`p-4 rounded-xl border ${rf.severity === 'high' ? 'bg-red-900/10 border-red-800/40' : 'bg-yellow-900/10 border-yellow-800/40'}`}>
              <div className="flex items-start gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${rf.severity === 'high' ? 'bg-red-800 text-red-300' : 'bg-yellow-800 text-yellow-300'}`}>
                  {rf.severity === 'high' ? 'HIGH' : 'MEDIUM'}
                </span>
                <div>
                  <div className="text-white font-medium text-sm">{rf.flag}</div>
                  <div className="text-gray-400 text-xs mt-1">{rf.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cert Number Ranges */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">PSA Cert Number Ranges by Era</h2>
          <button onClick={() => setShowRanges(!showRanges)} className="text-xs text-emerald-400 hover:text-emerald-300">
            {showRanges ? 'Hide' : 'Show'} Ranges
          </button>
        </div>
        {showRanges && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                  <th className="py-3 pr-4 font-medium">Era</th>
                  <th className="py-3 px-4 font-medium">Cert Range</th>
                  <th className="py-3 px-4 font-medium">Format</th>
                  <th className="py-3 pl-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {certRanges.map((r, i) => (
                  <tr key={i} className="border-b border-gray-800/50 text-gray-300">
                    <td className="py-2.5 pr-4 font-medium text-white whitespace-nowrap">{r.era}</td>
                    <td className="py-2.5 px-4 font-mono">{r.range}</td>
                    <td className="py-2.5 px-4">{r.digits}</td>
                    <td className="py-2.5 pl-4 text-gray-400">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Other Companies */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Other Grading Companies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {otherCompanies.map(c => (
            <div key={c.company} className="p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
              <div className="text-white font-semibold text-sm mb-2">{c.company}</div>
              <div className="text-gray-400 text-xs mb-1">Format: <span className="font-mono">{c.format}</span></div>
              <div className="text-gray-500 text-xs mb-2">{c.notes}</div>
              <div className="text-emerald-400 text-xs">Verify: {c.lookup}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <section className="mt-8 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl">
        <h3 className="text-sm font-semibold text-white mb-3">Related Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/tools/auth-check', label: 'Authentication Checker' },
            { href: '/tools/condition-grader', label: 'Condition Self-Grader' },
            { href: '/tools/cross-grade', label: 'Cross-Grade Converter' },
            { href: '/tools/pop-report', label: 'Population Report' },
            { href: '/tools/submission-planner', label: 'Submission Planner' },
          ].map(l => (
            <Link key={l.href} href={l.href} className="text-xs px-3 py-1.5 bg-gray-700/50 border border-gray-600/50 text-emerald-400 hover:text-emerald-300 rounded-lg transition-colors">
              {l.label} &rarr;
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
