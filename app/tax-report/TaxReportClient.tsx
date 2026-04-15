'use client';

import { useState, useEffect, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  description: string;
  date: string;
  amount: number;
  fees: number;
  linkedBuyId?: string;
}

interface TaxLot {
  buyTx: Transaction;
  sellTx: Transaction;
  gain: number;
  holdingDays: number;
  isLongTerm: boolean;
}

type Tab = 'transactions' | 'report' | 'guide';

const STORAGE_KEY = 'cardvault-tax-transactions';

// ── Component ────────────────────────────────────────────────────────────────

export default function TaxReportClient() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Tab>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [filingStatus, setFilingStatus] = useState<'single' | 'married'>('single');
  const [marginalRate, setMarginalRate] = useState(22);

  // Form state
  const [formType, setFormType] = useState<'buy' | 'sell'>('buy');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formFees, setFormFees] = useState('');
  const [formLinkedBuy, setFormLinkedBuy] = useState('');

  useEffect(() => { setMounted(true); }, []);

  // Load from localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTransactions(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [mounted]);

  // Save to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, mounted]);

  // Filter transactions by tax year
  const yearTransactions = useMemo(() =>
    transactions.filter(t => new Date(t.date).getFullYear() === taxYear),
  [transactions, taxYear]);

  const buys = useMemo(() => yearTransactions.filter(t => t.type === 'buy'), [yearTransactions]);
  const sells = useMemo(() => yearTransactions.filter(t => t.type === 'sell'), [yearTransactions]);

  // Calculate tax lots
  const taxLots = useMemo((): TaxLot[] => {
    return sells.map(sell => {
      const linkedBuy = sell.linkedBuyId
        ? transactions.find(t => t.id === sell.linkedBuyId)
        : null;
      const costBasis = linkedBuy ? linkedBuy.amount + linkedBuy.fees : 0;
      const netProceeds = sell.amount - sell.fees;
      const gain = netProceeds - costBasis;
      const buyDate = linkedBuy ? new Date(linkedBuy.date) : new Date(sell.date);
      const sellDate = new Date(sell.date);
      const holdingDays = Math.floor((sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
      const isLongTerm = holdingDays > 365;
      return { buyTx: linkedBuy || sell, sellTx: sell, gain, holdingDays, isLongTerm };
    }).filter(lot => lot.buyTx !== lot.sellTx || !lot.sellTx.linkedBuyId);
  }, [sells, transactions]);

  // Tax calculations
  const taxSummary = useMemo(() => {
    const shortTermGains = taxLots.filter(l => !l.isLongTerm && l.gain > 0).reduce((s, l) => s + l.gain, 0);
    const shortTermLosses = taxLots.filter(l => !l.isLongTerm && l.gain < 0).reduce((s, l) => s + Math.abs(l.gain), 0);
    const longTermGains = taxLots.filter(l => l.isLongTerm && l.gain > 0).reduce((s, l) => s + l.gain, 0);
    const longTermLosses = taxLots.filter(l => l.isLongTerm && l.gain < 0).reduce((s, l) => s + Math.abs(l.gain), 0);

    const netShortTerm = shortTermGains - shortTermLosses;
    const netLongTerm = longTermGains - longTermLosses;
    const totalNet = netShortTerm + netLongTerm;

    const shortTermTax = Math.max(0, netShortTerm) * (marginalRate / 100);
    const collectiblesRate = 0.28;
    const longTermTax = Math.max(0, netLongTerm) * collectiblesRate;
    const estimatedTax = shortTermTax + longTermTax;

    const totalBought = buys.reduce((s, t) => s + t.amount + t.fees, 0);
    const totalSold = sells.reduce((s, t) => s + t.amount, 0);
    const totalFees = [...buys, ...sells].reduce((s, t) => s + t.fees, 0);

    const deductibleLoss = totalNet < 0 ? Math.min(Math.abs(totalNet), 3000) : 0;
    const carryForward = totalNet < 0 ? Math.max(0, Math.abs(totalNet) - 3000) : 0;

    return {
      shortTermGains, shortTermLosses, longTermGains, longTermLosses,
      netShortTerm, netLongTerm, totalNet,
      shortTermTax, longTermTax, estimatedTax,
      totalBought, totalSold, totalFees,
      deductibleLoss, carryForward,
      lotCount: taxLots.length,
    };
  }, [taxLots, buys, sells, marginalRate]);

  const addTransaction = () => {
    if (!formDesc || !formDate || !formAmount) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      type: formType,
      description: formDesc,
      date: formDate,
      amount: parseFloat(formAmount) || 0,
      fees: parseFloat(formFees) || 0,
      linkedBuyId: formType === 'sell' ? formLinkedBuy || undefined : undefined,
    };
    setTransactions(prev => [...prev, tx]);
    setFormDesc(''); setFormDate(''); setFormAmount(''); setFormFees(''); setFormLinkedBuy('');
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const exportReport = () => {
    const lines = [
      `CardVault Tax Report — ${taxYear}`,
      `Filing Status: ${filingStatus} | Marginal Rate: ${marginalRate}%`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      '=== SUMMARY ===',
      `Total Purchased: $${taxSummary.totalBought.toLocaleString()}`,
      `Total Sold: $${taxSummary.totalSold.toLocaleString()}`,
      `Total Fees: $${taxSummary.totalFees.toLocaleString()}`,
      '',
      `Short-Term Gains: $${taxSummary.shortTermGains.toLocaleString()}`,
      `Short-Term Losses: -$${taxSummary.shortTermLosses.toLocaleString()}`,
      `Net Short-Term: $${taxSummary.netShortTerm.toLocaleString()}`,
      `Estimated Short-Term Tax (${marginalRate}%): $${Math.round(taxSummary.shortTermTax).toLocaleString()}`,
      '',
      `Long-Term Gains: $${taxSummary.longTermGains.toLocaleString()}`,
      `Long-Term Losses: -$${taxSummary.longTermLosses.toLocaleString()}`,
      `Net Long-Term: $${taxSummary.netLongTerm.toLocaleString()}`,
      `Estimated Long-Term Tax (28% collectibles): $${Math.round(taxSummary.longTermTax).toLocaleString()}`,
      '',
      `TOTAL NET GAIN/LOSS: $${taxSummary.totalNet.toLocaleString()}`,
      `ESTIMATED TAX: $${Math.round(taxSummary.estimatedTax).toLocaleString()}`,
      taxSummary.deductibleLoss > 0 ? `Deductible Loss (up to $3,000): $${taxSummary.deductibleLoss.toLocaleString()}` : '',
      taxSummary.carryForward > 0 ? `Loss Carry-Forward: $${taxSummary.carryForward.toLocaleString()}` : '',
      '',
      '=== TRANSACTIONS ===',
      ...yearTransactions.map(t => `${t.date} | ${t.type.toUpperCase()} | ${t.description} | $${t.amount} | Fees: $${t.fees}`),
      '',
      'DISCLAIMER: This is an estimate for educational purposes. Consult a tax professional.',
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join('\n'));
  };

  if (!mounted) return <div className="min-h-[400px] flex items-center justify-center text-gray-500">Loading tax reporter...</div>;

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-800/50 border border-gray-700/50 rounded-xl p-1">
        {([
          { key: 'transactions' as Tab, label: 'Transactions', count: yearTransactions.length },
          { key: 'report' as Tab, label: 'Tax Report', count: null },
          { key: 'guide' as Tab, label: 'Tax Guide', count: null },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {t.label} {t.count !== null && <span className="ml-1 text-xs opacity-70">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Settings Bar */}
      <div className="flex flex-wrap gap-3 bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs">Tax Year</label>
          <select
            value={taxYear}
            onChange={e => setTaxYear(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm"
          >
            {[2026, 2025, 2024, 2023].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs">Filing Status</label>
          <select
            value={filingStatus}
            onChange={e => setFilingStatus(e.target.value as 'single' | 'married')}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm"
          >
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-xs">Marginal Rate</label>
          <select
            value={marginalRate}
            onChange={e => setMarginalRate(Number(e.target.value))}
            className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm"
          >
            {[10, 12, 22, 24, 32, 35, 37].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Bought', value: `$${taxSummary.totalBought.toLocaleString()}`, color: 'text-white' },
          { label: 'Total Sold', value: `$${taxSummary.totalSold.toLocaleString()}`, color: 'text-white' },
          { label: 'Net Gain/Loss', value: `${taxSummary.totalNet >= 0 ? '+' : ''}$${taxSummary.totalNet.toLocaleString()}`, color: taxSummary.totalNet >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'Est. Tax', value: `$${Math.round(taxSummary.estimatedTax).toLocaleString()}`, color: taxSummary.estimatedTax > 0 ? 'text-amber-400' : 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3">
            <div className="text-gray-500 text-xs mb-1">{s.label}</div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="space-y-6">
          {/* Add Transaction Form */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Add Transaction</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFormType('buy')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${formType === 'buy' ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-700'}`}
                >
                  Buy / Acquire
                </button>
                <button
                  onClick={() => setFormType('sell')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${formType === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-900 text-gray-400 border border-gray-700'}`}
                >
                  Sell / Dispose
                </button>
              </div>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              />
              <input
                type="text"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
                placeholder="Card description (e.g., 2020 Prizm Justin Herbert RC)"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 sm:col-span-2"
              />
              <input
                type="number"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                placeholder="Amount ($)"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500"
              />
              <input
                type="number"
                value={formFees}
                onChange={e => setFormFees(e.target.value)}
                placeholder="Fees (shipping, platform, grading) ($)"
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500"
              />
              {formType === 'sell' && buys.length > 0 && (
                <select
                  value={formLinkedBuy}
                  onChange={e => setFormLinkedBuy(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm sm:col-span-2"
                >
                  <option value="">Link to purchase (optional)</option>
                  {transactions.filter(t => t.type === 'buy').map(t => (
                    <option key={t.id} value={t.id}>{t.date} — {t.description} — ${t.amount}</option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={addTransaction}
              disabled={!formDesc || !formDate || !formAmount}
              className="mt-4 px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add {formType === 'buy' ? 'Purchase' : 'Sale'}
            </button>
          </div>

          {/* Transaction List */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">{taxYear} Transactions ({yearTransactions.length})</h3>
            {yearTransactions.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">No transactions for {taxYear}. Add your card purchases and sales above.</p>
            ) : (
              <div className="space-y-2">
                {yearTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.type === 'buy' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                        {tx.type === 'buy' ? 'BUY' : 'SELL'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm truncate">{tx.description}</div>
                        <div className="text-gray-500 text-xs">{tx.date}{tx.fees > 0 ? ` | Fees: $${tx.fees}` : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono text-sm">${tx.amount.toLocaleString()}</span>
                      <button onClick={() => removeTransaction(tx.id)} className="text-gray-600 hover:text-red-400 text-sm">&times;</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tax Report Tab */}
      {tab === 'report' && (
        <div className="space-y-6">
          {/* Capital Gains Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">Short-Term (1 year or less)</h3>
              <p className="text-xs text-gray-500 mb-3">Taxed at your marginal rate: {marginalRate}%</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Gains</span><span className="text-emerald-400">+${taxSummary.shortTermGains.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Losses</span><span className="text-red-400">-${taxSummary.shortTermLosses.toLocaleString()}</span></div>
                <div className="flex justify-between border-t border-gray-700 pt-2"><span className="text-white font-medium">Net</span><span className={taxSummary.netShortTerm >= 0 ? 'text-emerald-400' : 'text-red-400'}>${taxSummary.netShortTerm.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Est. Tax</span><span className="text-amber-400">${Math.round(taxSummary.shortTermTax).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-white font-bold mb-3">Long-Term (over 1 year)</h3>
              <p className="text-xs text-gray-500 mb-3">Collectibles rate: 28% (max)</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Gains</span><span className="text-emerald-400">+${taxSummary.longTermGains.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Losses</span><span className="text-red-400">-${taxSummary.longTermLosses.toLocaleString()}</span></div>
                <div className="flex justify-between border-t border-gray-700 pt-2"><span className="text-white font-medium">Net</span><span className={taxSummary.netLongTerm >= 0 ? 'text-emerald-400' : 'text-red-400'}>${taxSummary.netLongTerm.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Est. Tax</span><span className="text-amber-400">${Math.round(taxSummary.longTermTax).toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-5">
            <h3 className="text-amber-300 font-bold mb-3">Tax Summary — {taxYear}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div><div className="text-gray-500 text-xs">Total Net</div><div className={`font-bold ${taxSummary.totalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${taxSummary.totalNet.toLocaleString()}</div></div>
              <div><div className="text-gray-500 text-xs">Est. Tax Owed</div><div className="font-bold text-amber-400">${Math.round(taxSummary.estimatedTax).toLocaleString()}</div></div>
              {taxSummary.deductibleLoss > 0 && <div><div className="text-gray-500 text-xs">Deductible Loss</div><div className="font-bold text-emerald-400">-${taxSummary.deductibleLoss.toLocaleString()}</div></div>}
              {taxSummary.carryForward > 0 && <div><div className="text-gray-500 text-xs">Loss Carry-Forward</div><div className="font-bold text-blue-400">${taxSummary.carryForward.toLocaleString()}</div></div>}
              <div><div className="text-gray-500 text-xs">Total Fees</div><div className="font-bold text-gray-300">${taxSummary.totalFees.toLocaleString()}</div></div>
              <div><div className="text-gray-500 text-xs">Tax Lots</div><div className="font-bold text-gray-300">{taxSummary.lotCount}</div></div>
            </div>
          </div>

          {/* Tax Lots */}
          {taxLots.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-white font-bold mb-4">Tax Lots ({taxLots.length})</h3>
              <div className="space-y-2">
                {taxLots.map((lot, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/50 rounded-lg px-4 py-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{lot.sellTx.description}</div>
                      <div className="text-gray-500 text-xs">
                        Held {lot.holdingDays} days ({lot.isLongTerm ? 'long-term 28%' : `short-term ${marginalRate}%`})
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Basis: ${(lot.buyTx.amount + lot.buyTx.fees).toLocaleString()}</span>
                      <span className="text-gray-400">Sold: ${lot.sellTx.amount.toLocaleString()}</span>
                      <span className={`font-bold ${lot.gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {lot.gain >= 0 ? '+' : ''}${lot.gain.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export */}
          <div className="flex gap-3">
            <button
              onClick={exportReport}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Copy Report to Clipboard
            </button>
          </div>
        </div>
      )}

      {/* Tax Guide Tab */}
      {tab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
            <h3 className="text-white font-bold mb-4">Collectibles Tax Basics</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="bg-amber-950/20 border border-amber-800/30 rounded-lg p-4">
                <h4 className="text-amber-300 font-medium mb-2">The 28% Collectibles Rate</h4>
                <p className="text-gray-400">Sports cards, trading cards, coins, art, and other collectibles are taxed at a <strong className="text-white">maximum rate of 28%</strong> for long-term capital gains. This is higher than the standard long-term rate (0-20%) that applies to stocks. However, if your marginal rate is below 28%, you pay the lower rate.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-emerald-400 font-medium mb-2">Short-Term (&le; 1 year)</h4>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>Taxed at your ordinary income rate (10-37%)</li>
                    <li>Most card flips are short-term</li>
                    <li>Card show purchases sold within months</li>
                    <li>eBay flips, break pulls sold quickly</li>
                  </ul>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Long-Term (&gt; 1 year)</h4>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>Taxed at collectibles rate (max 28%)</li>
                    <li>Investment-grade cards held for appreciation</li>
                    <li>Vintage cards bought for long-term value</li>
                    <li>Sealed wax held as an investment</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">What Counts as Cost Basis</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div><span className="text-emerald-400">+</span> Purchase price</div>
                  <div><span className="text-emerald-400">+</span> Shipping (inbound)</div>
                  <div><span className="text-emerald-400">+</span> Platform fees (buying)</div>
                  <div><span className="text-emerald-400">+</span> Grading fees (PSA/BGS)</div>
                  <div><span className="text-emerald-400">+</span> Insurance premiums</div>
                  <div><span className="text-emerald-400">+</span> Sales tax paid</div>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Deductible Selling Expenses</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div><span className="text-red-400">-</span> Platform fees (eBay, Mercari)</div>
                  <div><span className="text-red-400">-</span> Payment processing fees</div>
                  <div><span className="text-red-400">-</span> Shipping (outbound)</div>
                  <div><span className="text-red-400">-</span> Packaging materials</div>
                  <div><span className="text-red-400">-</span> Auction house commissions</div>
                  <div><span className="text-red-400">-</span> Photography costs</div>
                </div>
              </div>
              <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-4">
                <h4 className="text-red-300 font-medium mb-2">Common Mistakes</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li><strong className="text-white">1.</strong> Not reporting card sales at all (IRS receives 1099-K from eBay/PayPal for $600+)</li>
                  <li><strong className="text-white">2.</strong> Forgetting to add grading fees to cost basis (can be $20-150+ per card)</li>
                  <li><strong className="text-white">3.</strong> Not tracking original purchase price for cards you later sell</li>
                  <li><strong className="text-white">4.</strong> Treating hobby losses as business losses without qualifying as a dealer</li>
                  <li><strong className="text-white">5.</strong> Not knowing about the $3,000 capital loss deduction limit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
