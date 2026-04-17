'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cv_escrow_letter_draft_v1';

type Form = {
  effectiveDate: string;
  cardDescription: string;
  cardGrade: string;
  cardCert: string;
  salePrice: string;
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY';
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string;
  sellerName: string;
  sellerEmail: string;
  sellerAddress: string;
  agentType: 'third-party-service' | 'attorney' | 'auction-house' | 'trusted-peer' | 'bank';
  agentName: string;
  agentContact: string;
  agentFee: string;
  feeType: 'percent' | 'flat';
  feePayer: 'buyer' | 'seller' | 'split';
  inspectionDays: '3' | '5' | '7' | '14' | '30';
  shippingMode: 'seller-to-agent-to-buyer' | 'seller-direct-buyer' | 'in-person-handoff';
  releaseTrigger: 'buyer-accepts' | 'authenticator-confirms' | 'auto-after-deadline' | 'grading-confirms';
  disputeResolution: 'agent-decision' | 'named-authenticator' | 'aaa-arbitration';
  namedAuthenticator: 'psa' | 'beckett' | 'sgc' | 'jsa' | 'other';
  governingState: string;
  buyerSig: string;
  sellerSig: string;
  agentSig: string;
  executed: boolean;
};

const DEFAULT: Form = {
  effectiveDate: new Date().toISOString().slice(0, 10),
  cardDescription: '',
  cardGrade: '',
  cardCert: '',
  salePrice: '',
  currency: 'USD',
  buyerName: '', buyerEmail: '', buyerAddress: '',
  sellerName: '', sellerEmail: '', sellerAddress: '',
  agentType: 'third-party-service',
  agentName: '', agentContact: '',
  agentFee: '3',
  feeType: 'percent',
  feePayer: 'split',
  inspectionDays: '7',
  shippingMode: 'seller-to-agent-to-buyer',
  releaseTrigger: 'buyer-accepts',
  disputeResolution: 'named-authenticator',
  namedAuthenticator: 'psa',
  governingState: '',
  buyerSig: '', sellerSig: '', agentSig: '',
  executed: false,
};

function fmtMoney(n: number, currency: Form['currency']) {
  try {
    return n.toLocaleString('en-US', { style: 'currency', currency });
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default function EscrowLetterClient() {
  const [form, setForm] = useState<Form>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) })); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {}
  }, [form, hydrated]);

  function upd<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })); }

  const salePriceN = parseFloat(form.salePrice) || 0;
  const agentFeeN = parseFloat(form.agentFee) || 0;
  const feeAmount = form.feeType === 'percent' ? (salePriceN * agentFeeN) / 100 : agentFeeN;
  const buyerPaysFee = form.feePayer === 'buyer' ? feeAmount : form.feePayer === 'split' ? feeAmount / 2 : 0;
  const sellerPaysFee = form.feePayer === 'seller' ? feeAmount : form.feePayer === 'split' ? feeAmount / 2 : 0;
  const buyerDepositTotal = salePriceN + buyerPaysFee;
  const sellerNetProceeds = salePriceN - sellerPaysFee;

  const doc = useMemo(
    () => buildDoc(form, { salePriceN, feeAmount, buyerPaysFee, sellerPaysFee, buyerDepositTotal, sellerNetProceeds }),
    [form, salePriceN, feeAmount, buyerPaysFee, sellerPaysFee, buyerDepositTotal, sellerNetProceeds]
  );

  const ready = !!form.buyerName && !!form.sellerName && !!form.agentName && !!form.cardDescription && salePriceN > 0;

  function copy() {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(doc).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  }
  function printDoc() {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;
    w.document.body.style.margin = '0';
    const pre = w.document.createElement('pre');
    pre.style.fontFamily = "Georgia,'Times New Roman',serif"; pre.style.fontSize = '12pt'; pre.style.whiteSpace = 'pre-wrap';
    pre.style.padding = '1in'; pre.style.maxWidth = '7in'; pre.style.margin = '0 auto';
    pre.textContent = doc; w.document.body.appendChild(pre);
    setTimeout(() => w.print(), 100);
  }
  function reset() {
    if (!window.confirm('Reset the draft?')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setForm(DEFAULT);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <Sec title="1. Subject card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Effective date"><input type="date" value={form.effectiveDate} onChange={e => upd('effectiveDate', e.target.value)} className={inp} /></Fld>
            <Fld label="Sale price">
              <div className="flex gap-2">
                <input type="number" inputMode="decimal" placeholder="12500" value={form.salePrice} onChange={e => upd('salePrice', e.target.value)} className={`${inp} flex-1`} />
                <select value={form.currency} onChange={e => upd('currency', e.target.value as Form['currency'])} className={`${inp} w-24`}>
                  <option>USD</option><option>CAD</option><option>EUR</option><option>GBP</option><option>JPY</option>
                </select>
              </div>
            </Fld>
            <Fld label="Card description" className="sm:col-span-2"><input type="text" value={form.cardDescription} onChange={e => upd('cardDescription', e.target.value)} placeholder="2003-04 Upper Deck Exquisite LeBron James Rookie Patch Auto /99 #78" className={inp} /></Fld>
            <Fld label="Grade (label)"><input type="text" value={form.cardGrade} onChange={e => upd('cardGrade', e.target.value)} placeholder="PSA 9" className={inp} /></Fld>
            <Fld label="Cert #"><input type="text" value={form.cardCert} onChange={e => upd('cardCert', e.target.value)} placeholder="12345678" className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="2. Buyer">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name"><input type="text" value={form.buyerName} onChange={e => upd('buyerName', e.target.value)} className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.buyerEmail} onChange={e => upd('buyerEmail', e.target.value)} className={inp} /></Fld>
            <Fld label="Address / city / state" className="sm:col-span-2"><input type="text" value={form.buyerAddress} onChange={e => upd('buyerAddress', e.target.value)} placeholder="123 Main St, Springfield, IL" className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="3. Seller">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Full name"><input type="text" value={form.sellerName} onChange={e => upd('sellerName', e.target.value)} className={inp} /></Fld>
            <Fld label="Email"><input type="email" value={form.sellerEmail} onChange={e => upd('sellerEmail', e.target.value)} className={inp} /></Fld>
            <Fld label="Address / city / state" className="sm:col-span-2"><input type="text" value={form.sellerAddress} onChange={e => upd('sellerAddress', e.target.value)} placeholder="456 Oak Ave, Portland, OR" className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="4. Escrow agent">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Agent type">
              <select value={form.agentType} onChange={e => upd('agentType', e.target.value as Form['agentType'])} className={inp}>
                <option value="third-party-service">Third-party escrow service (Escrow.com)</option>
                <option value="attorney">Hobby attorney</option>
                <option value="auction-house">Auction house custody</option>
                <option value="trusted-peer">Mutually trusted peer / hobby figure</option>
                <option value="bank">Bank special-agency account</option>
              </select>
            </Fld>
            <Fld label="Agent name / firm"><input type="text" value={form.agentName} onChange={e => upd('agentName', e.target.value)} placeholder="Escrow.com / Jane Smith, Esq." className={inp} /></Fld>
            <Fld label="Agent contact (email or phone)" className="sm:col-span-2"><input type="text" value={form.agentContact} onChange={e => upd('agentContact', e.target.value)} className={inp} /></Fld>
            <Fld label={form.feeType === 'percent' ? 'Fee (%)' : 'Fee (flat)'}>
              <div className="flex gap-2">
                <input type="number" inputMode="decimal" value={form.agentFee} onChange={e => upd('agentFee', e.target.value)} className={`${inp} flex-1`} />
                <select value={form.feeType} onChange={e => upd('feeType', e.target.value as Form['feeType'])} className={`${inp} w-24`}>
                  <option value="percent">%</option><option value="flat">flat</option>
                </select>
              </div>
            </Fld>
            <Fld label="Fee paid by">
              <select value={form.feePayer} onChange={e => upd('feePayer', e.target.value as Form['feePayer'])} className={inp}>
                <option value="split">50/50 split</option>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </Fld>
          </div>
          {salePriceN > 0 && (
            <div className="mt-3 rounded-lg border border-violet-900/40 bg-violet-950/20 p-3 text-xs text-violet-200 space-y-1">
              <div className="flex justify-between"><span>Sale price</span><span className="font-mono">{fmtMoney(salePriceN, form.currency)}</span></div>
              <div className="flex justify-between"><span>Escrow fee ({form.feeType === 'percent' ? `${agentFeeN}%` : 'flat'})</span><span className="font-mono">{fmtMoney(feeAmount, form.currency)}</span></div>
              <div className="flex justify-between border-t border-violet-900/40 pt-1"><span>Buyer deposits</span><span className="font-mono">{fmtMoney(buyerDepositTotal, form.currency)}</span></div>
              <div className="flex justify-between"><span>Seller nets</span><span className="font-mono">{fmtMoney(sellerNetProceeds, form.currency)}</span></div>
            </div>
          )}
        </Sec>

        <Sec title="5. Terms">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Fld label="Inspection window">
              <select value={form.inspectionDays} onChange={e => upd('inspectionDays', e.target.value as Form['inspectionDays'])} className={inp}>
                <option value="3">3 days (graded, modern)</option>
                <option value="5">5 days (graded, vintage)</option>
                <option value="7">7 days (standard)</option>
                <option value="14">14 days (raw, vintage)</option>
                <option value="30">30 days (third-party auth req.)</option>
              </select>
            </Fld>
            <Fld label="Shipping flow">
              <select value={form.shippingMode} onChange={e => upd('shippingMode', e.target.value as Form['shippingMode'])} className={inp}>
                <option value="seller-to-agent-to-buyer">Seller &rarr; Agent &rarr; Buyer (3-step)</option>
                <option value="seller-direct-buyer">Seller &rarr; Buyer direct (agent holds funds)</option>
                <option value="in-person-handoff">In-person handoff at agent location</option>
              </select>
            </Fld>
            <Fld label="Release trigger">
              <select value={form.releaseTrigger} onChange={e => upd('releaseTrigger', e.target.value as Form['releaseTrigger'])} className={inp}>
                <option value="buyer-accepts">Buyer confirms acceptance in writing</option>
                <option value="authenticator-confirms">Named authenticator confirms condition</option>
                <option value="grading-confirms">Buyer submits for grading; grade meets threshold</option>
                <option value="auto-after-deadline">Auto-release after inspection window</option>
              </select>
            </Fld>
            <Fld label="Dispute resolution">
              <select value={form.disputeResolution} onChange={e => upd('disputeResolution', e.target.value as Form['disputeResolution'])} className={inp}>
                <option value="agent-decision">Escrow agent final decision</option>
                <option value="named-authenticator">Named third-party authenticator</option>
                <option value="aaa-arbitration">AAA binding arbitration</option>
              </select>
            </Fld>
            {form.disputeResolution === 'named-authenticator' && (
              <Fld label="Named authenticator">
                <select value={form.namedAuthenticator} onChange={e => upd('namedAuthenticator', e.target.value as Form['namedAuthenticator'])} className={inp}>
                  <option value="psa">PSA</option><option value="beckett">Beckett (BGS)</option><option value="sgc">SGC</option><option value="jsa">JSA (autos)</option><option value="other">Other (named in letter)</option>
                </select>
              </Fld>
            )}
            <Fld label="Governing state / province"><input type="text" value={form.governingState} onChange={e => upd('governingState', e.target.value)} placeholder="Delaware" className={inp} /></Fld>
          </div>
        </Sec>

        <Sec title="6. Executed">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Fld label="Buyer signature"><input type="text" value={form.buyerSig} onChange={e => upd('buyerSig', e.target.value)} placeholder="/s/ Buyer" className={inp} /></Fld>
            <Fld label="Seller signature"><input type="text" value={form.sellerSig} onChange={e => upd('sellerSig', e.target.value)} placeholder="/s/ Seller" className={inp} /></Fld>
            <Fld label="Agent signature"><input type="text" value={form.agentSig} onChange={e => upd('agentSig', e.target.value)} placeholder="/s/ Agent" className={inp} /></Fld>
          </div>
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-300">
            <input type="checkbox" checked={form.executed} onChange={e => upd('executed', e.target.checked)} className="accent-violet-500" />
            <span>All three parties have signed and received copies</span>
          </label>
        </Sec>

        <div className="flex flex-wrap gap-3">
          <button onClick={copy} disabled={!ready} className="px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white font-semibold text-sm">{copied ? 'Copied!' : 'Copy letter'}</button>
          <button onClick={printDoc} disabled={!ready} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-100 font-semibold text-sm">Print / PDF</button>
          <button onClick={reset} className="px-4 py-2 rounded-lg bg-transparent hover:bg-slate-800 text-gray-400 hover:text-gray-200 font-medium text-sm">Reset</button>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-stone-50 text-stone-900 p-6 shadow-2xl ring-1 ring-stone-200 overflow-auto max-h-[85vh]">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed" style={{ fontFamily: "Georgia,'Times New Roman',serif" }}>{doc}</pre>
        </div>
        <div className="mt-2 text-xs text-gray-500">Draft auto-saves locally. All three parties sign &mdash; originals retained by the escrow agent.</div>
      </div>
    </div>
  );
}

type Totals = {
  salePriceN: number;
  feeAmount: number;
  buyerPaysFee: number;
  sellerPaysFee: number;
  buyerDepositTotal: number;
  sellerNetProceeds: number;
};

function buildDoc(f: Form, t: Totals): string {
  const L: string[] = [];
  const M = (n: number) => fmtMoney(n, f.currency);
  L.push('ESCROW LETTER AGREEMENT');
  L.push('(Card Sale \u2014 Three-Party Instrument)');
  L.push('');
  L.push(`Effective date: ${f.effectiveDate}`);
  L.push('');
  L.push('PARTIES');
  L.push(`Buyer:  ${f.buyerName || '__________'}${f.buyerEmail ? ` <${f.buyerEmail}>` : ''}`);
  if (f.buyerAddress) L.push(`        ${f.buyerAddress}`);
  L.push(`Seller: ${f.sellerName || '__________'}${f.sellerEmail ? ` <${f.sellerEmail}>` : ''}`);
  if (f.sellerAddress) L.push(`        ${f.sellerAddress}`);
  L.push(`Agent:  ${f.agentName || '__________'} (${labelAgent(f.agentType)})`);
  if (f.agentContact) L.push(`        ${f.agentContact}`);
  L.push('');
  L.push('1. SUBJECT MATTER');
  L.push(`   The subject of this escrow is the sports / trading card described as:`);
  L.push(`     "${f.cardDescription || '__________'}"`);
  if (f.cardGrade || f.cardCert) {
    const g = [f.cardGrade && `Grade: ${f.cardGrade}`, f.cardCert && `Cert #: ${f.cardCert}`].filter(Boolean).join('   ');
    L.push(`     ${g}`);
  }
  L.push(`   Sale price: ${M(t.salePriceN)} (${f.currency}).`);
  L.push('');
  L.push('2. APPOINTMENT OF ESCROW AGENT');
  L.push(`   Buyer and Seller jointly appoint ${f.agentName || 'the Agent named above'} as their escrow agent to receive, hold, and disburse the funds and the subject card in accordance with this letter.`);
  L.push('');
  L.push('3. ESCROW AGENT DUTIES');
  L.push('   The Agent shall: (a) receive Buyer\u2019s funds into a segregated account; (b) confirm receipt to all parties; (c) receive the subject card from Seller and confirm receipt; (d) deliver the subject card per the Shipping Flow specified below; (e) hold funds until the Release Trigger is satisfied; (f) disburse funds to Seller net of Agent fee if and only if the Release Trigger is satisfied; (g) return funds to Buyer if the transaction is rejected within the Inspection Window.');
  L.push('');
  L.push('4. SHIPPING FLOW');
  L.push(`   ${labelShipping(f.shippingMode)}`);
  L.push('');
  L.push('5. INSPECTION WINDOW');
  L.push(`   Buyer shall have ${f.inspectionDays} calendar days from the date of receipt of the subject card to inspect, accept, or reject the card in writing. Rejection must be delivered to the Agent and to Seller within the inspection window and must state a specific, good-faith reason (condition mismatch, authenticity concern, wrong card, or failed authentication).`);
  L.push('');
  L.push('6. RELEASE TRIGGER');
  L.push(`   ${labelRelease(f.releaseTrigger, f.inspectionDays, f.namedAuthenticator)}`);
  L.push('');
  L.push('7. ESCROW FEE AND ALLOCATION');
  L.push(`   Agent\u2019s fee for this escrow is ${f.feeType === 'percent' ? `${f.agentFee}% of the sale price (${M(t.feeAmount)})` : `a flat ${M(t.feeAmount)}`}. ${labelFeePayer(f.feePayer, M(t.feeAmount), M(t.buyerPaysFee), M(t.sellerPaysFee))} Agent\u2019s fee is payable only upon successful completion of the transaction; if the transaction is voided under Section 5 or Section 8, the Agent may retain a wire/administrative fee not to exceed the lesser of $50 or 0.5% of the sale price, with the balance of any pre-paid fee refunded pro-rata to the party that paid it.`);
  L.push('');
  L.push('8. DISPUTE RESOLUTION');
  L.push(`   ${labelDispute(f.disputeResolution, f.namedAuthenticator)}`);
  L.push('');
  L.push('9. RISK OF LOSS IN TRANSIT');
  L.push('   Risk of loss during shipment from Seller to Agent rests with Seller until the Agent confirms receipt. Risk of loss during shipment from Agent to Buyer rests with Buyer upon the Agent\u2019s confirmation of handoff to a tracked carrier. Each shipping leg shall be sent via tracked, fully insured service (declared value = sale price) with signature confirmation required.');
  L.push('');
  L.push('10. REPRESENTATIONS AND WARRANTIES');
  L.push('    Seller represents and warrants that (a) Seller is the lawful owner of the subject card with full right to transfer it, (b) the card is free of liens, encumbrances, and competing claims, (c) the card is not stolen property and has not been reported as such, (d) the card has not been materially altered (trimmed, recolored, restored) beyond any disclosures made in the subject-matter description, and (e) any grade or certification number referenced is authentic and has not been swapped from another card.');
  L.push('    Buyer represents that (a) funds deposited are lawfully Buyer\u2019s and not subject to competing claims, (b) Buyer has not represented this transaction fraudulently to any third party (including payment networks), and (c) Buyer shall not initiate a chargeback, dispute, or reversal through any payment processor or card network while this escrow is in effect or after successful release.');
  L.push('');
  L.push('11. CONFIDENTIALITY');
  L.push('    Each party agrees to maintain the confidentiality of the other parties\u2019 identity, address, and financial information, except as required by law or by the Agent\u2019s compliance obligations (KYC, AML, tax reporting).');
  L.push('');
  L.push('12. GOVERNING LAW');
  L.push(`    This Agreement is governed by the laws of the State of ${f.governingState || '__________'}, without regard to its conflict-of-laws principles. Venue for any action to enforce this Agreement shall lie in the state or federal courts sitting in that state.`);
  L.push('');
  L.push('13. ENTIRE AGREEMENT');
  L.push('    This letter, together with any addenda signed by all three parties, constitutes the entire agreement among the parties with respect to the subject card and supersedes all prior oral or written communications relating to the same.');
  L.push('');
  L.push('SIGNATURES');
  L.push('');
  L.push(`Buyer:  ${f.buyerSig || '______________________________'}   Date: ${f.effectiveDate}`);
  L.push('');
  L.push(`Seller: ${f.sellerSig || '______________________________'}   Date: ${f.effectiveDate}`);
  L.push('');
  L.push(`Agent:  ${f.agentSig || '______________________________'}   Date: ${f.effectiveDate}`);
  L.push('');
  L.push(f.executed ? '[ EXECUTED ] All three parties have signed and exchanged copies of this letter.' : '[ DRAFT \u2014 NOT YET FULLY EXECUTED ]');
  return L.join('\n');
}

function labelAgent(t: Form['agentType']) {
  return t === 'third-party-service' ? 'regulated third-party escrow service' :
         t === 'attorney' ? 'licensed hobby attorney acting as escrow agent' :
         t === 'auction-house' ? 'auction house providing custody and escrow services' :
         t === 'trusted-peer' ? 'mutually trusted peer acting as good-faith escrow agent' :
         'bank special-agency account';
}
function labelShipping(s: Form['shippingMode']) {
  return s === 'seller-to-agent-to-buyer' ? 'Seller ships the subject card to the Agent via tracked, insured service within five (5) business days of this letter\u2019s effective date. The Agent confirms receipt and condition to all parties, then ships the card to Buyer via tracked, insured service upon Buyer\u2019s deposit of funds per Section 7.' :
         s === 'seller-direct-buyer' ? 'Seller ships the subject card directly to Buyer via tracked, insured, signature-required service within five (5) business days of Buyer\u2019s deposit of funds with the Agent. The Agent holds only the funds; the card transits directly Seller-to-Buyer under Buyer\u2019s deposit protection.' :
         'All parties meet in person at the Agent\u2019s location; Seller delivers the subject card to the Agent who, after verifying condition against the description in Section 1, hands the card to Buyer and releases funds to Seller on the same day.';
}
function labelRelease(r: Form['releaseTrigger'], days: Form['inspectionDays'], auth: Form['namedAuthenticator']) {
  return r === 'buyer-accepts' ? `Funds are released to Seller upon Buyer\u2019s written confirmation of acceptance of the subject card, delivered to the Agent within the ${days}-day Inspection Window.` :
         r === 'authenticator-confirms' ? `Funds are released to Seller upon written confirmation by ${labelAuth(auth)} that the subject card matches the description and grade stated in Section 1, submitted within the ${days}-day Inspection Window.` :
         r === 'grading-confirms' ? `Funds are released to Seller upon the grading service\u2019s public confirmation that the subject card received a grade at or above the threshold stated in Section 1. If the card grades below the threshold, Seller agrees to accept return of the card and refund Buyer in full less verified return-shipping costs.` :
         `Funds are automatically released to Seller upon expiration of the ${days}-day Inspection Window if no written rejection has been received by the Agent.`;
}
function labelFeePayer(p: Form['feePayer'], total: string, buyer: string, seller: string) {
  return p === 'buyer' ? `Buyer shall pay the full Agent fee (${total}) in addition to the sale price.` :
         p === 'seller' ? `Seller shall pay the full Agent fee (${total}), which shall be deducted from the disbursement to Seller.` :
         `Buyer and Seller shall each pay fifty percent (50%) of the Agent fee \u2014 Buyer ${buyer} above the sale price, Seller ${seller} deducted from the disbursement.`;
}
function labelDispute(d: Form['disputeResolution'], auth: Form['namedAuthenticator']) {
  return d === 'agent-decision' ? 'Any dispute arising from this escrow shall be resolved by the Agent, whose written decision is final and binding on both Buyer and Seller. The Agent may request documentation, photographs, or expert opinions at the Agent\u2019s sole discretion before rendering a decision.' :
         d === 'named-authenticator' ? `Any dispute arising from this escrow shall be submitted to ${labelAuth(auth)} as the named third-party authenticator, whose written finding regarding condition, authenticity, or grade shall be binding on both parties. The party found to be in error shall bear the cost of the authentication.` :
         'Any dispute arising from this escrow shall be resolved by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The arbitrator\u2019s award is final and enforceable in any court of competent jurisdiction. Each party bears its own attorneys\u2019 fees unless otherwise awarded.';
}
function labelAuth(a: Form['namedAuthenticator']) {
  return a === 'psa' ? 'Professional Sports Authenticator (PSA)' :
         a === 'beckett' ? 'Beckett Grading Services (BGS)' :
         a === 'sgc' ? 'Sportscard Guaranty Company (SGC)' :
         a === 'jsa' ? 'James Spence Authentication (JSA)' :
         'the third-party authenticator named in Section 1';
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"><h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-violet-300">{title}</h3>{children}</section>;
}
function Fld({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><div className="text-[11px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">{label}</div>{children}</label>;
}
const inp = 'w-full rounded-lg bg-slate-950 border border-slate-700 text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500';
