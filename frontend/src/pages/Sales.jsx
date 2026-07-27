import React, { useState, useEffect } from 'react';
import { ReceiptText, Printer, Eye, X, CheckCircle, Search, Calendar } from 'lucide-react';
import { useAuth } from '../AuthContext';

/* ── Store details (keep in sync with Billing.jsx) ── */
const STORE = {
  name: 'Swastik Medical Store',
  address: 'Bidupur Bazar',
  city: 'Bidupur 844503',
  phone: '+91 7766086408',
  email: 'sankalp.uttam04@gmail.com',
  gstin: '',
  tagline: '',
};

/* ── Helpers ── */
function amountInWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
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

function getFY(date) {
  const d = date instanceof Date ? date : new Date(date);
  const m = d.getMonth(), y = d.getFullYear();
  return m >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
}

function getInvoiceNo(id, dateStr) {
  return `SM/${getFY(dateStr)}/${String(id).padStart(5, '0')}`;
}

/* ── Build standalone print-popup HTML ── */
function buildInvoiceHTML(bill, items) {
  const date = new Date(bill.date);
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const words = amountInWords(Math.max(0, bill.net_amount));
  const fy = getFY(date);
  const invoiceNo = `SM/${fy}/${String(bill.id).padStart(5, '0')}`;

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
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 30px 40px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .store-name { font-size: 22px; font-weight: 800; color: #b45309; margin-bottom: 2px; }
  .tagline { font-size: 11px; color: #78716c; font-style: italic; margin-bottom: 7px; }
  .store-info { font-size: 12px; color: #44403c; line-height: 1.75; }
  .gstin { font-weight: 700; color: #1a1a1a; margin-top: 4px; }
  .inv-box { text-align: right; }
  .inv-title { font-size: 20px; font-weight: 900; letter-spacing: 2.5px; margin-bottom: 10px; }
  .meta { border-collapse: collapse; margin-left: auto; }
  .meta td { font-size: 12px; padding: 2px 4px; color: #44403c; }
  .meta td:first-child { text-align: right; color: #78716c; padding-right: 10px; }
  .divider { border: none; border-top: 2.5px solid #b45309; margin: 12px 0; }
  .customer-section { margin-bottom: 16px; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #78716c; margin-bottom: 3px; }
  .customer-name { font-size: 15px; font-weight: 600; }
  .items { width: 100%; border-collapse: collapse; }
  .items th { background: #b45309; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; padding: 9px 11px; text-align: left; }
  .items th.r { text-align: right; }
  .items td { padding: 8px 11px; border-bottom: 1px solid #e7e5e4; vertical-align: middle; }
  .items td.r { text-align: right; font-variant-numeric: tabular-nums; }
  .items td.bold { font-weight: 700; }
  .items td.no { color: #78716c; width: 36px; }
  .even { background: #fff; } .odd { background: #fafaf9; }
  .med-name { font-weight: 600; } .med-gen { font-size: 11px; color: #78716c; margin-top: 1px; }
  .totals-wrap { display: flex; justify-content: flex-end; border-top: 2px solid #e7e5e4; }
  .totals { border-collapse: collapse; min-width: 260px; }
  .totals td { padding: 7px 12px; font-size: 13px; }
  .lbl { color: #78716c; text-align: right; } .val { font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
  .red { color: #dc2626; }
  .net-row td { border-top: 2px solid #b45309; }
  .net-row .lbl { font-size: 15px; font-weight: 700; color: #1a1a1a; }
  .net-row .val { font-size: 18px; font-weight: 800; color: #b45309; }
  .words { font-size: 12px; color: #44403c; background: #fef9ee; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 14px; margin: 14px 0; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 22px; padding-top: 14px; border-top: 1.5px dashed #d6d3d1; }
  .footer-note { font-size: 13px; font-weight: 600; margin-bottom: 4px; } .footer-sub { font-size: 11px; color: #78716c; line-height: 1.65; }
  .sig-wrap { text-align: center; } .sig-line { border-top: 1.5px solid #1a1a1a; width: 160px; margin-bottom: 6px; } .sig-label { font-size: 11px; color: #78716c; }
  @page { size: A4 portrait; margin: 0; }
  @media print { body { padding: 20mm 18mm; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="store-name">${STORE.name}</div>
    ${STORE.tagline ? `<div class="tagline">${STORE.tagline}</div>` : ''}
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
<div class="customer-section">
  <div class="section-label">Bill To</div>
  <div class="customer-name">${bill.customer_name || 'Walk-in Customer'}</div>
</div>
<table class="items">
  <thead><tr><th>#</th><th>Medicine Name</th><th class="r">Unit Price</th><th class="r">Qty</th><th class="r">Total</th></tr></thead>
  <tbody>${itemRows}</tbody>
</table>
<div class="totals-wrap">
  <table class="totals"><tbody>
    <tr><td class="lbl">Subtotal</td><td class="val">₹${Number(bill.total_amount).toFixed(2)}</td></tr>
    ${discountRow}
    <tr class="net-row"><td class="lbl">Net Amount</td><td class="val">₹${Math.max(0, bill.net_amount).toFixed(2)}</td></tr>
  </tbody></table>
</div>
<div class="words"><strong>Amount in Words:</strong> ${words}</div>
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
<script>window.onload = function() { setTimeout(function(){ window.print(); }, 300); };<\/script>
</body></html>`;
}

/* ── On-screen invoice preview (inside modal) ── */
function InvoicePreview({ bill, items }) {
  if (!bill) return null;
  const date = new Date(bill.date);
  const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const words = amountInWords(Math.max(0, bill.net_amount));
  const fy = getFY(date);
  const invoiceNo = `SM/${fy}/${String(bill.id).padStart(5, '0')}`;

  return (
    <div className="invoice-print-root">
      <div className="inv-header">
        <div>
          <div className="inv-store-name">{STORE.name}</div>
          {STORE.tagline && <div className="inv-tagline">{STORE.tagline}</div>}
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
      <div className="inv-customer-row">
        <div className="inv-section-label">Bill To</div>
        <div className="inv-customer-name">{bill.customer_name || 'Walk-in Customer'}</div>
      </div>
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
      <div className="inv-words"><strong>Amount in Words:</strong> {words}</div>
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
   Sales / Invoice History Page
════════════════════════════════════════════ */
export default function Sales() {
  const { authHeaders } = useAuth();

  const [bills, setBills]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterFY, setFilterFY]     = useState('all');

  // Invoice modal
  const [modalOpen, setModalOpen]   = useState(false);
  const [activeBill, setActiveBill] = useState(null);
  const [activeItems, setActiveItems] = useState([]);
  const [loadingBill, setLoadingBill] = useState(false);

  /* Fetch all bills */
  const fetchBills = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/bills', { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { setBills(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBills(); }, []);

  /* Open invoice modal for a specific bill */
  const viewInvoice = async (billId) => {
    setLoadingBill(true);
    setModalOpen(true);
    setActiveBill(null);
    setActiveItems([]);
    try {
      const res = await fetch(`http://localhost:5000/api/bills/${billId}`, { headers: authHeaders() });
      const data = await res.json();
      setActiveBill(data);
      setActiveItems(data.items || []);
    } catch { setModalOpen(false); }
    setLoadingBill(false);
  };

  /* Print popup */
  const handlePrint = () => {
    if (!activeBill) return;
    const html = buildInvoiceHTML(activeBill, activeItems);
    
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

  const closeModal = () => { setModalOpen(false); setActiveBill(null); setActiveItems([]); };

  /* Collect unique FY values for the filter dropdown */
  const fyOptions = [...new Set(bills.map(b => getFY(b.date)))].sort().reverse();

  /* Filtered + searched bills */
  const filtered = bills.filter(b => {
    const fy = getFY(b.date);
    const invoiceNo = getInvoiceNo(b.id, b.date);
    const matchFY = filterFY === 'all' || fy === filterFY;
    const q = search.toLowerCase();
    const matchSearch = !q
      || invoiceNo.toLowerCase().includes(q)
      || (b.customer_name || '').toLowerCase().includes(q)
      || String(b.net_amount).includes(q);
    return matchFY && matchSearch;
  });

  /* Summary stats */
  const totalRevenue = filtered.reduce((a, b) => a + Number(b.net_amount), 0);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ReceiptText size={28} color="var(--accent-primary)" />
            Sales &amp; Invoices
          </h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>View and reprint all past bills</p>
        </div>

        {/* Stats chip */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Bills Shown</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-primary)' }}>{filtered.length}</div>
          </div>
          <div className="glass-panel" style={{ padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Revenue</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-primary)' }}>₹{totalRevenue.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            id="sales-search"
            type="text"
            placeholder="Search by invoice no, customer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
            className="input-standalone"
          />
        </div>
        {/* FY filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--text-secondary)" />
          <select
            id="sales-fy-filter"
            value={filterFY}
            onChange={e => setFilterFY(e.target.value)}
            style={{ minWidth: '140px' }}
          >
            <option value="all">All Years</option>
            {fyOptions.map(fy => (
              <option key={fy} value={fy}>FY {fy}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Bills Table ── */}
      <div className="glass-panel">
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>Loading invoices…</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Date &amp; Time</th>
                  <th>Customer</th>
                  <th>FY</th>
                  <th>Items</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Net Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bill => {
                  const invoiceNo = getInvoiceNo(bill.id, bill.date);
                  const d = new Date(bill.date);
                  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={bill.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '13px' }}>
                          {invoiceNo}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{dateStr}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{timeStr}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{bill.customer_name || 'Walk-in Customer'}</td>
                      <td>
                        <span className="badge badge-warning">{getFY(bill.date)}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>—</td>
                      <td>₹{Number(bill.total_amount).toFixed(2)}</td>
                      <td style={{ color: Number(bill.discount) > 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                        {Number(bill.discount) > 0 ? `−₹${Number(bill.discount).toFixed(2)}` : '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '15px' }}>
                        ₹{Number(bill.net_amount).toFixed(2)}
                      </td>
                      <td>
                        <button
                          id={`view-invoice-${bill.id}`}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => viewInvoice(bill.id)}
                        >
                          <Eye size={15} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                      <ReceiptText size={36} style={{ opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          Invoice Preview Modal
      ══════════════════════════════════ */}
      {modalOpen && (
        <div className="invoice-modal-overlay" onClick={closeModal}>
          <div className="invoice-modal-box" onClick={e => e.stopPropagation()}>

            {/* Top bar */}
            <div className="invoice-modal-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={20} color="#4ade80" />
                <span style={{ fontWeight: 600 }}>
                  {activeBill
                    ? `Invoice — SM/${getFY(activeBill.date)}/${String(activeBill.id).padStart(5, '0')}`
                    : 'Loading invoice…'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {activeBill && (
                  <button
                    id="sales-print-btn"
                    className="btn btn-primary"
                    onClick={handlePrint}
                    style={{ padding: '8px 18px', fontSize: '14px' }}
                  >
                    <Printer size={16} /> Print / Save PDF
                  </button>
                )}
                <button
                  onClick={closeModal}
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

            {/* Scrollable invoice */}
            <div className="invoice-modal-scroll">
              {loadingBill ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#78716c' }}>
                  Loading invoice details…
                </div>
              ) : (
                <InvoicePreview bill={activeBill} items={activeItems} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
