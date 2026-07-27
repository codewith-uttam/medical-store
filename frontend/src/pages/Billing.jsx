import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Printer, FileText, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

/* ─────────────────────────────────────────────
   Store details — edit these to match your store
───────────────────────────────────────────── */
const STORE = {
  name: 'Swastik Medical Store',
  address: 'Bidupur Bazar',
  city: 'Bidupur 844503',
  phone: '+91 7766086408',
  email: 'sankalp.uttam04@gmail.com',
  gstin: '',
  tagline: '',
};

/* ─── Amount in words helper ─── */
function amountInWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function b100(n) { return n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : ''); }
  function b1000(n) { return n < 100 ? b100(n) : ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + b100(n % 100) : ''); }
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';
  let w = '';
  const cr = Math.floor(rupees / 10000000);
  const lk = Math.floor((rupees % 10000000) / 100000);
  const th = Math.floor((rupees % 100000) / 1000);
  const rs = rupees % 1000;
  if (cr) w += b1000(cr) + ' Crore ';
  if (lk) w += b1000(lk) + ' Lakh ';
  if (th) w += b1000(th) + ' Thousand ';
  if (rs) w += b1000(rs);
  w = w.trim() + ' Rupees';
  if (paise > 0) w += ' and ' + b100(paise) + ' Paise';
  return w + ' Only';
}

/* ─── Financial Year helper (Indian FY: April–March) ─── */
function getFY(date) {
  const d = date instanceof Date ? date : new Date(date);
  const month = d.getMonth(); // 0 = Jan, 3 = Apr
  const year  = d.getFullYear();
  return month >= 3
    ? `${year}-${String(year + 1).slice(2)}`   // Apr–Dec: e.g. 2025-26
    : `${year - 1}-${String(year).slice(2)}`;  // Jan–Mar: e.g. 2024-25
}

/* ─── Build the full standalone HTML for the print popup ─── */
function buildInvoiceHTML(bill, items) {
  const date = new Date(bill.date);
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const words = amountInWords(Math.max(0, bill.net_amount));
  const fy = getFY(date);
  const invoiceNo = 'SM/' + fy + '/' + String(bill.id).padStart(5, '0');


  const itemRows = items.map((item, i) => `
    <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
      <td class="no">${i + 1}</td>
      <td>
        <div class="med-name">${item.medicine_name || item.name || ''}</div>
        ${item.generic_name ? `<div class="med-gen">${item.generic_name}</div>` : ''}
      </td>
      <td class="r">₹${Number(item.price).toFixed(2)}</td>
      <td class="r">${item.quantity}</td>
      <td class="r bold">₹${Number(item.total || item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const discountRow = Number(bill.discount) > 0
    ? `<tr><td class="lbl">Discount</td><td class="val red">−₹${Number(bill.discount).toFixed(2)}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${invoiceNo} — ${STORE.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1a1a1a;
    background: #fff;
    padding: 30px 40px;
    font-size: 13px;
  }

  /* ── Header ── */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .store-name { font-size: 22px; font-weight: 800; color: #b45309; margin-bottom: 2px; }
  .tagline    { font-size: 11px; color: #78716c; font-style: italic; margin-bottom: 7px; }
  .store-info { font-size: 12px; color: #44403c; line-height: 1.75; }
  .gstin      { font-weight: 700; color: #1a1a1a; margin-top: 4px; }

  .inv-box { text-align: right; }
  .inv-title { font-size: 20px; font-weight: 900; letter-spacing: 2.5px; margin-bottom: 10px; }
  .meta { border-collapse: collapse; margin-left: auto; }
  .meta td { font-size: 12px; padding: 2px 4px; color: #44403c; }
  .meta td:first-child { text-align: right; color: #78716c; padding-right: 10px; }

  /* ── Divider ── */
  .divider { border: none; border-top: 2.5px solid #b45309; margin: 12px 0; }

  /* ── Customer ── */
  .customer-section { margin-bottom: 16px; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #78716c; margin-bottom: 3px; }
  .customer-name { font-size: 15px; font-weight: 600; }

  /* ── Items table ── */
  .items { width: 100%; border-collapse: collapse; }
  .items th {
    background: #b45309; color: #fff;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
    padding: 9px 11px; text-align: left;
  }
  .items th.r { text-align: right; }
  .items td { padding: 8px 11px; border-bottom: 1px solid #e7e5e4; vertical-align: middle; }
  .items td.r    { text-align: right; font-variant-numeric: tabular-nums; }
  .items td.bold { font-weight: 700; }
  .items td.no   { color: #78716c; width: 36px; }
  .even { background: #fff; }
  .odd  { background: #fafaf9; }
  .med-name { font-weight: 600; }
  .med-gen  { font-size: 11px; color: #78716c; margin-top: 1px; }

  /* ── Totals ── */
  .totals-wrap { display: flex; justify-content: flex-end; border-top: 2px solid #e7e5e4; }
  .totals { border-collapse: collapse; min-width: 260px; }
  .totals td { padding: 7px 12px; font-size: 13px; }
  .lbl { color: #78716c; text-align: right; }
  .val { font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
  .red { color: #dc2626; }
  .net-row td { border-top: 2px solid #b45309; }
  .net-row .lbl { font-size: 15px; font-weight: 700; color: #1a1a1a; }
  .net-row .val { font-size: 18px; font-weight: 800; color: #b45309; }

  /* ── Words ── */
  .words {
    font-size: 12px; color: #44403c;
    background: #fef9ee; border: 1px solid #fde68a; border-radius: 6px;
    padding: 8px 14px; margin: 14px 0;
  }

  /* ── Footer ── */
  .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 22px; padding-top: 14px; border-top: 1.5px dashed #d6d3d1; }
  .footer-note { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
  .footer-sub  { font-size: 11px; color: #78716c; line-height: 1.65; }
  .sig-wrap  { text-align: center; }
  .sig-line  { border-top: 1.5px solid #1a1a1a; width: 160px; margin-bottom: 6px; }
  .sig-label { font-size: 11px; color: #78716c; }

  @page { size: A4 portrait; margin: 0; }
  @media print { body { padding: 20mm 18mm; } }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div>
    <div class="store-name">${STORE.name}</div>
    <div class="tagline">${STORE.tagline}</div>
    <div class="store-info">${STORE.address}</div>
    <div class="store-info">${STORE.city}</div>
    <div class="store-info">&#128222; ${STORE.phone} &nbsp;|&nbsp; &#9993; ${STORE.email}</div>
    ${STORE.gstin ? `<div class="store-info gstin">GSTIN: ${STORE.gstin}</div>` : ''}
  </div>
  <div class="inv-box">
    <div class="inv-title">TAX INVOICE</div>
    <table class="meta">
      <tr><td>Invoice No.</td><td><strong>${invoiceNo}</strong></td></tr>
      <tr><td>Date</td><td>${dateStr}</td></tr>
      <tr><td>Time</td><td>${timeStr}</td></tr>
      <tr><td>Financial Year</td><td><strong>${fy}</strong></td></tr>
    </table>
  </div>
</div>

<hr class="divider"/>

<!-- CUSTOMER -->
<div class="customer-section">
  <div class="section-label">Bill To</div>
  <div class="customer-name">${bill.customer_name || 'Walk-in Customer'}</div>
</div>

<!-- ITEMS -->
<table class="items">
  <thead>
    <tr>
      <th>#</th>
      <th>Medicine Name</th>
      <th class="r">Unit Price</th>
      <th class="r">Qty</th>
      <th class="r">Total</th>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
</table>

<!-- TOTALS -->
<div class="totals-wrap">
  <table class="totals">
    <tr>
      <td class="lbl">Subtotal</td>
      <td class="val">₹${Number(bill.total_amount).toFixed(2)}</td>
    </tr>
    ${discountRow}
    <tr class="net-row">
      <td class="lbl">Net Amount</td>
      <td class="val">₹${Math.max(0, bill.net_amount).toFixed(2)}</td>
    </tr>
  </table>
</div>

<!-- WORDS -->
<div class="words"><strong>Amount in Words:</strong> ${words}</div>

<!-- FOOTER -->
<div class="footer">
  <div>
    <div class="footer-note">Thank you for your purchase!</div>
    <div class="footer-sub">This is a computer-generated invoice.</div>
    <div class="footer-sub">Goods once sold will not be taken back.</div>
  </div>
  <div class="sig-wrap">
    <div class="sig-line"></div>
    <div class="sig-label">Authorised Signature</div>
  </div>
</div>

<script>
  window.onload = function () {
    setTimeout(function () { window.print(); }, 300);
  };
</script>
</body>
</html>`;
}

/* ════════════════════════════════════════════
   Invoice Preview Component (on-screen modal)
════════════════════════════════════════════ */
function InvoicePreview({ bill, items }) {
  if (!bill) return null;
  const date = new Date(bill.date);
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const words = amountInWords(Math.max(0, bill.net_amount));
  const fy = getFY(date);
  const invoiceNo = 'SM/' + fy + '/' + String(bill.id).padStart(5, '0');


  return (
    <div className="invoice-print-root">
      {/* Header */}
      <div className="inv-header">
        <div>
          <div className="inv-store-name">{STORE.name}</div>
          <div className="inv-tagline">{STORE.tagline}</div>
          <div className="inv-store-info">{STORE.address}</div>
          <div className="inv-store-info">{STORE.city}</div>
          <div className="inv-store-info">📞 {STORE.phone} &nbsp;|&nbsp; ✉ {STORE.email}</div>
          {STORE.gstin && <div className="inv-store-info inv-gstin">GSTIN: {STORE.gstin}</div>}
        </div>
        <div className="inv-title-area">
          <div className="inv-title-label">TAX INVOICE</div>
          <table className="inv-meta-table"><tbody>
            <tr><td>Invoice No.</td><td><strong>{invoiceNo}</strong></td></tr>
            <tr><td>Date</td><td>{dateStr}</td></tr>
            <tr><td>Time</td><td>{timeStr}</td></tr>
            <tr><td>Financial Year</td><td><strong>{fy}</strong></td></tr>
          </tbody></table>
        </div>
      </div>

      <div className="inv-divider" />

      {/* Customer */}
      <div className="inv-customer-row">
        <div className="inv-section-label">Bill To</div>
        <div className="inv-customer-name">{bill.customer_name || 'Walk-in Customer'}</div>
      </div>

      {/* Items */}
      <table className="inv-items-table">
        <thead>
          <tr>
            <th className="inv-th inv-th-no">#</th>
            <th className="inv-th">Medicine Name</th>
            <th className="inv-th inv-th-right">Unit Price</th>
            <th className="inv-th inv-th-right">Qty</th>
            <th className="inv-th inv-th-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className={i % 2 === 0 ? 'inv-row-even' : 'inv-row-odd'}>
              <td className="inv-td inv-td-no">{i + 1}</td>
              <td className="inv-td">
                <div className="inv-med-name">{item.medicine_name || item.name}</div>
                {item.generic_name && <div className="inv-med-generic">{item.generic_name}</div>}
              </td>
              <td className="inv-td inv-td-right">₹{Number(item.price).toFixed(2)}</td>
              <td className="inv-td inv-td-right">{item.quantity}</td>
              <td className="inv-td inv-td-right">₹{Number(item.total || item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="inv-totals-wrapper">
        <div className="inv-totals-table-wrap">
          <table className="inv-totals-table"><tbody>
            <tr>
              <td className="inv-tot-label">Subtotal</td>
              <td className="inv-tot-val">₹{Number(bill.total_amount).toFixed(2)}</td>
            </tr>
            {Number(bill.discount) > 0 && (
              <tr>
                <td className="inv-tot-label">Discount</td>
                <td className="inv-tot-val inv-discount">−₹{Number(bill.discount).toFixed(2)}</td>
              </tr>
            )}
            <tr className="inv-net-row">
              <td className="inv-tot-label">Net Amount</td>
              <td className="inv-tot-val inv-net">₹{Math.max(0, bill.net_amount).toFixed(2)}</td>
            </tr>
          </tbody></table>
        </div>
      </div>

      {/* Words */}
      <div className="inv-words"><strong>Amount in Words:</strong> {words}</div>

      {/* Footer */}
      <div className="inv-footer">
        <div>
          <div className="inv-footer-note">Thank you for your purchase!</div>
          <div className="inv-footer-sub">This is a computer-generated invoice.</div>
          <div className="inv-footer-sub">Goods once sold will not be taken back.</div>
        </div>
        <div>
          <div className="inv-sig-line" />
          <div className="inv-sig-label">Authorised Signature</div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Main Billing Page
════════════════════════════════════════════ */
const Billing = () => {
  const { authHeaders } = useAuth();

  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedMed, setSelectedMed] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceBill, setInvoiceBill] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const fetchMedicines = () => {
    fetch('https://ancient-penguin-79.loca.lt/api/medicines', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setMedicines(Array.isArray(data) ? data.filter(m => m.quantity > 0) : []))
      .catch(console.error);
  };
  useEffect(() => { fetchMedicines(); }, []);

  const addToCart = () => {
    if (!selectedMed || quantity <= 0) return;
    const med = medicines.find(m => m.id === parseInt(selectedMed));
    if (!med) return;
    if (quantity > med.quantity) { alert(`Only ${med.quantity} available in stock.`); return; }
    const idx = cart.findIndex(i => i.medicine_id === med.id);
    if (idx >= 0) {
      const nc = [...cart];
      if (nc[idx].quantity + parseInt(quantity) > med.quantity) { alert('Cannot exceed available stock.'); return; }
      nc[idx] = { ...nc[idx], quantity: nc[idx].quantity + parseInt(quantity) };
      setCart(nc);
    } else {
      setCart([...cart, { medicine_id: med.id, name: med.name, price: med.price, quantity: parseInt(quantity) }]);
    }
    setSelectedMed(''); setQuantity(1);
  };

  const removeFromCart = (i) => setCart(cart.filter((_, idx) => idx !== i));

  const totalAmount = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const netAmount = Math.max(0, totalAmount - parseFloat(discount || 0));

  /* ── Generate bill then show invoice modal ── */
  const generateBill = async () => {
    if (cart.length === 0) return;
    setGenerating(true);
    try {
      const res = await fetch('https://ancient-penguin-79.loca.lt/api/bills', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          items: cart,
          discount: parseFloat(discount) || 0,
          customer_name: customerName.trim() || 'Walk-in Customer',
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to generate bill'); setGenerating(false); return; }

      const br = await fetch(`https://ancient-penguin-79.loca.lt/api/bills/${data.billId}`, { headers: authHeaders() });
      const bd = await br.json();
      setInvoiceBill(bd);
      setInvoiceItems(bd.items || []);
      setInvoiceModal(true);
      setCart([]); setDiscount(0); setCustomerName('');
      fetchMedicines();
    } catch { alert('Network error. Please try again.'); }
    setGenerating(false);
  };

  /* ── Open popup window with self-contained invoice HTML ── */
  const handlePrint = () => {
    if (!invoiceBill) return;
    const html = buildInvoiceHTML(invoiceBill, invoiceItems);
    
    // Create an invisible iframe to handle printing without popups
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    // Focus the iframe and trigger the print dialog
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      // Remove the iframe after printing (or if they cancel)
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    }, 250); // slight delay to ensure CSS styles are fully applied
  };

  const closeInvoice = () => { setInvoiceModal(false); setInvoiceBill(null); setInvoiceItems([]); };

  return (
    <div>
      <h1>Billing &amp; POS</h1>
      <p className="subtitle">Create invoices and process sales</p>

      <div className="billing-layout">

        {/* ── Left: Cart ── */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Customer name */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Customer Name (optional)</label>
            <input
              id="billing-customer-name"
              type="text"
              placeholder="Walk-in Customer"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>

          {/* Add item row */}
          <div className="add-item-row">
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Select Medicine</label>
              <select id="billing-medicine-select" value={selectedMed} onChange={e => setSelectedMed(e.target.value)}>
                <option value="">-- Choose Medicine --</option>
                {medicines.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Stock: {m.quantity}) — ₹{m.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Quantity</label>
              <input id="billing-qty" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <button id="billing-add-btn" className="btn btn-primary" onClick={addToCart} style={{ height: '46px' }}>
              <Plus size={18} /> Add
            </button>
          </div>

          {/* Cart Table */}
          <div className="table-container" style={{ flex: 1, minHeight: '280px' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Medicine</th><th>Unit Price</th><th>Qty</th><th>Total</th><th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-secondary)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td><span className="badge badge-warning">{item.quantity}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>₹{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => removeFromCart(idx)}>
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', opacity: 0.5 }}>
                        <ShoppingCart size={36} />
                        <span>Cart is empty — select a medicine above</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: Summary ── */}
        <div className="glass-panel" style={{ height: 'fit-content', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--accent-primary)" /> Order Summary
          </h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Items</span>
            <span style={{ fontWeight: 600 }}>{cart.reduce((a, i) => a + i.quantity, 0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
            <span style={{ fontWeight: 600 }}>₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label>Discount (₹)</label>
            <input id="billing-discount" type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
            <span style={{ fontSize: '17px', fontWeight: 600 }}>Net Amount</span>
            <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent-primary)' }}>₹{netAmount.toFixed(2)}</span>
          </div>

          <button
            id="billing-generate-btn"
            className="btn btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '16px' }}
            onClick={generateBill}
            disabled={cart.length === 0 || generating}
          >
            <Printer size={20} />
            {generating ? 'Saving…' : 'Generate Bill & Invoice'}
          </button>

          {cart.length > 0 && (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
              Invoice preview opens after saving
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════
          Invoice Preview Modal
      ══════════════════════════════════ */}
      {invoiceModal && invoiceBill && (
        <div className="invoice-modal-overlay" onClick={closeInvoice}>
          <div className="invoice-modal-box" onClick={e => e.stopPropagation()}>

            {/* Top bar */}
            <div className="invoice-modal-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={20} color="#4ade80" />
                <span style={{ fontWeight: 600 }}>
                  Bill Saved — {`SM/${getFY(new Date(invoiceBill.date))}/${String(invoiceBill.id).padStart(5, '0')}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  id="invoice-print-btn"
                  className="btn btn-primary"
                  onClick={handlePrint}
                  style={{ padding: '8px 18px', fontSize: '14px' }}
                >
                  <Printer size={16} /> Print / Save PDF
                </button>
                <button
                  onClick={closeInvoice}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', color: '#fef3e2', cursor: 'pointer', padding: '8px 12px',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable invoice preview */}
            <div className="invoice-modal-scroll">
              <InvoicePreview bill={invoiceBill} items={invoiceItems} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
