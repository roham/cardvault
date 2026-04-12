// Server component — static data, no interactivity needed
export default function GradingCostTable() {
  const services = [
    {
      company: 'PSA',
      tiers: [
        { name: 'Economy', turnaround: '~180 days', cost: 25, minValue: 'Any', note: 'Cheapest option, longest wait' },
        { name: 'Regular', turnaround: '45–60 days', cost: 50, minValue: 'Any', note: 'Standard Collectors Club' },
        { name: 'Express', turnaround: '10–20 days', cost: 150, minValue: '$499+ declared value', note: 'Faster, value declared' },
        { name: 'Super Express', turnaround: '3–5 days', cost: 500, minValue: '$4,999+', note: 'High-value rush' },
      ],
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/20 border-blue-900/40',
    },
    {
      company: 'BGS (Beckett)',
      tiers: [
        { name: 'Economy', turnaround: '~120 days', cost: 22, minValue: 'Any', note: 'Subgrades included' },
        { name: 'Standard', turnaround: '30–45 days', cost: 35, minValue: 'Any', note: 'Most popular BGS tier' },
        { name: 'Express', turnaround: '5–10 days', cost: 100, minValue: 'Any', note: 'Black Label potential' },
        { name: 'Premium', turnaround: '2 days', cost: 250, minValue: 'Any', note: 'Convention or event only' },
      ],
      color: 'text-red-400',
      bgColor: 'bg-red-950/20 border-red-900/40',
    },
    {
      company: 'SGC',
      tiers: [
        { name: 'Slowpoke', turnaround: '120 days', cost: 18, minValue: 'Any', note: 'Budget option' },
        { name: 'Standard', turnaround: '20–30 days', cost: 25, minValue: 'Any', note: 'Value for vintage' },
        { name: 'Express', turnaround: '5–10 days', cost: 60, minValue: 'Any', note: 'Popular for vintage baseball' },
      ],
      color: 'text-gray-300',
      bgColor: 'bg-gray-800/40 border-gray-700/40',
    },
  ];

  const breakEvenRules = [
    { rule: 'Only grade if expected value increase > 2× grading cost', icon: '✓' },
    { rule: 'PSA 10 premium for modern cards: typically 5–15× PSA 9 value', icon: '✓' },
    { rule: 'Vintage cards (pre-1980): grade even low-grade copies — authenticity value', icon: '✓' },
    { rule: 'Cards under $100 raw: rarely worth grading at any paid tier', icon: '⚠' },
    { rule: 'Count shipping both ways + insurance in your cost basis', icon: '⚠' },
  ];

  return (
    <div className="space-y-6">
      {/* Service tables */}
      {services.map(service => (
        <div key={service.company} className={`border ${service.bgColor} rounded-2xl overflow-hidden`}>
          <div className="px-5 py-4 border-b border-gray-800/50">
            <h3 className={`font-bold text-base ${service.color}`}>{service.company}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">Tier</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">Turnaround</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs">Cost/card</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs hidden sm:table-cell">Requirement</th>
                  <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {service.tiers.map((tier, i) => (
                  <tr key={tier.name} className={`border-t border-gray-800/40 ${i % 2 === 0 ? 'bg-gray-900/20' : ''}`}>
                    <td className="px-4 py-3 text-white font-medium text-sm">{tier.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{tier.turnaround}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-400 font-semibold text-sm">${tier.cost}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{tier.minValue}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{tier.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Break-even rules */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-4 text-sm">Break-even rules of thumb</h3>
        <div className="space-y-2.5">
          {breakEvenRules.map(item => (
            <div key={item.rule} className="flex items-start gap-2.5">
              <span className={`shrink-0 mt-0.5 text-sm font-bold ${item.icon === '✓' ? 'text-emerald-500' : 'text-amber-500'}`}>
                {item.icon}
              </span>
              <p className="text-gray-400 text-sm leading-relaxed">{item.rule}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-4 border-t border-gray-800 pt-3">
          Costs are approximate as of April 2026. Check each grader&apos;s current submission page for exact pricing — rates change frequently.
        </p>
      </div>
    </div>
  );
}
