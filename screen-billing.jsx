// Billing Screen — GST Invoice creator, list, view, print
// ── Print Invoice Component (renders as both screen preview and print layout) ──
function InvoicePrintView({ inv, biz }) {
  const lines = inv.lines || [];
  const now = new Date(inv.createdAt || Date.now());
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN');
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN');

  return (
    <div id="invoice-print-area" style={{ background: '#fff', fontFamily: 'Open Sans, sans-serif', fontSize: 13, color: '#1A2332', maxWidth: 780, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#1E293B', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>{biz.businessName}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{biz.address}, {biz.city}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Ph: {biz.phone} · GSTIN: {biz.gstin}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'oklch(0.78 0.10 75)' }}>TAX INVOICE</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Original Copy</div>
        </div>
      </div>

      {/* Bill To / Invoice Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '2px solid #E2E8F0' }}>
        <div style={{ padding: '14px 18px', borderRight: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Bill To</div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{inv.customerName || '—'}</div>
          {inv.customerAddress && <div style={{ fontSize: 12, color: '#374151', marginTop: 3 }}>{inv.customerAddress}</div>}
          {inv.customerPhone && <div style={{ fontSize: 12, color: '#374151' }}>Ph: {inv.customerPhone}</div>}
          {inv.customerGstin && <div style={{ fontSize: 12, color: '#374151' }}>GSTIN: {inv.customerGstin}</div>}
        </div>
        <div style={{ padding: '14px 18px', borderRight: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Shipping To</div>
          <div style={{ fontSize: 12, color: '#374151' }}>{inv.shippingAddress || inv.customerAddress || inv.customerName || '—'}</div>
        </div>
        <div style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Invoice Details</div>
          {[['Invoice No.', inv.invoiceNo], ['Date', dateStr], ['Time', timeStr], ['Due Date', dueDate]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: '#6B7A8D' }}>{l}:</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ background: '#B45309', color: '#fff' }}>
            {['#', 'Item Name', 'HSN/SAC', 'Qty', 'Price/Unit', 'Discount', 'GST', 'Amount'].map(h => (
              <th key={h} style={{ padding: '9px 10px', textAlign: h === '#' || h === 'Qty' ? 'center' : h === 'Amount' || h === 'GST' || h === 'Discount' || h === 'Price/Unit' ? 'right' : 'left', fontWeight: 700, fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => {
            const subtotal = (parseFloat(line.price) || 0) * (parseInt(line.qty) || 0);
            const disc = parseFloat(line.discount) || 0;
            const discAmt = (subtotal * disc / 100);
            const taxable = subtotal - discAmt;
            const gstAmt = taxable * (parseFloat(line.gstRate) || 0) / 100;
            const lineTotal = taxable + gstAmt;
            return (
              <tr key={i} style={{ background: i % 2 === 1 ? '#FAFBFD' : '#fff', borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '9px 10px', textAlign: 'center', color: '#6B7A8D' }}>{i + 1}</td>
                <td style={{ padding: '9px 10px', fontWeight: 600 }}>{line.name}</td>
                <td style={{ padding: '9px 10px', color: '#6B7A8D' }}>{line.hsnCode || '—'}</td>
                <td style={{ padding: '9px 10px', textAlign: 'center' }}>{line.qty}</td>
                <td style={{ padding: '9px 10px', textAlign: 'right' }}>₹{(parseFloat(line.price) || 0).toFixed(2)}</td>
                <td style={{ padding: '9px 10px', textAlign: 'right', color: disc > 0 ? '#B45309' : '#8A96A8' }}>
                  {disc > 0 ? `₹${discAmt.toFixed(2)} (${disc}%)` : '—'}
                </td>
                <td style={{ padding: '9px 10px', textAlign: 'right' }}>
                  ₹{gstAmt.toFixed(2)}<br />
                  <span style={{ fontSize: 10.5, color: '#8A96A8' }}>({line.gstRate || 0}%)</span>
                </td>
                <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700 }}>₹{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: '#F1F5F9', fontWeight: 700 }}>
            <td colSpan="3" style={{ padding: '10px 10px' }}>Total</td>
            <td style={{ padding: '10px 10px', textAlign: 'center' }}>{lines.reduce((s, l) => s + (parseInt(l.qty) || 0), 0)}</td>
            <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{lines.reduce((s, l) => s + (parseFloat(l.price) || 0) * (parseInt(l.qty) || 0), 0).toFixed(2)}</td>
            <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{inv.discountTotal ? inv.discountTotal.toFixed(2) : '0.00'}</td>
            <td style={{ padding: '10px 10px', textAlign: 'right' }}>₹{(inv.gstTotal || 0).toFixed(2)}</td>
            <td style={{ padding: '10px 10px', textAlign: 'right', fontSize: 15 }}>₹{(inv.total || 0).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Amount in words */}
      <div style={{ padding: '10px 18px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', fontSize: 12.5 }}>
        <strong>Amount in Words: </strong>
        <span style={{ color: '#374151' }}>{numberToWords(Math.round(inv.total || 0))} Rupees Only</span>
      </div>

      {/* Footer: bank + signature */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 18px', gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Pay To</div>
          {[['Bank', biz.bankName], ['Account No.', biz.accountNo], ['IFSC Code', biz.ifsc], ['UPI', biz.upiId]].map(([l, v]) => v && (
            <div key={l} style={{ fontSize: 12.5, marginBottom: 3 }}>
              <strong>{l}:</strong> {v}
            </div>
          ))}
          {inv.notes && <div style={{ marginTop: 10, fontSize: 12, color: '#374151' }}><strong>Notes:</strong> {inv.notes}</div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: '#6B7A8D', marginBottom: 4 }}>For: <strong>{biz.businessName}</strong></div>
          <div style={{ height: 60, border: '1px dashed #D1D9E6', borderRadius: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7A8D', fontWeight: 600 }}>Authorised Signatory</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '10px', background: '#1E293B', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
        Thank you for your business! · {biz.businessName} · {biz.phone}
      </div>
    </div>
  );
}

// simple number to words
function numberToWords(n) {
  if (n === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (num) => {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convert(num % 100) : '');
    if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
    if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
    return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
  };
  return convert(n);
}

// ── Invoice View Modal ──────────────────────────────────────────────────────
function InvoiceViewModal({ inv, onClose }) {
  const biz = DB.settings.get();
  const handlePrint = () => {
    window.__printInvoice = inv;
    window.print();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '20px', overflowY: 'auto', backdropFilter: 'blur(2px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 800, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>Invoice Preview — {inv.invoiceNo}</div>
          <Btn variant="primary" icon="🖨️" onClick={handlePrint}>Print Bill</Btn>
          <Btn variant="secondary" onClick={onClose}>Close</Btn>
        </div>
        <div style={{ padding: '20px' }}>
          <InvoicePrintView inv={inv} biz={biz} />
        </div>
      </div>
    </div>
  );
}

// ── Invoice Creator ─────────────────────────────────────────────────────────
function InvoiceCreator({ onSave, onCancel }) {
  const allProducts = DB.products.getAll();
  const allCustomers = DB.customers.getAll();
  const [customerId, setCustomerId] = React.useState('');
  const [isNewCustomer, setIsNewCustomer] = React.useState(false);
  const [newCustName, setNewCustName] = React.useState('');
  const [newCustPhone, setNewCustPhone] = React.useState('');
  const [shippingAddress, setShippingAddress] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [lines, setLines] = React.useState([{ productId: '', name: '', hsnCode: '', qty: 1, price: 0, discount: 0, gstRate: 12 }]);
  const [toast, setToast] = React.useState(null);

  const setLine = (i, k, v) => setLines(ls => ls.map((l, idx) => {
    if (idx !== i) return l;
    const updated = { ...l, [k]: v };
    if (k === 'productId' && v) {
      const p = allProducts.find(p => String(p.id) === String(v));
      if (p) { updated.name = p.name; updated.price = p.price; updated.hsnCode = p.hsnCode || ''; updated.gstRate = 12; }
    }
    return updated;
  }));

  const addLine = () => setLines(ls => [...ls, { productId: '', name: '', hsnCode: '', qty: 1, price: 0, discount: 0, gstRate: 12 }]);
  const removeLine = i => setLines(ls => ls.filter((_, idx) => idx !== i));

  const calcLine = (l) => {
    const sub = (parseFloat(l.price) || 0) * (parseInt(l.qty) || 0);
    const discAmt = sub * (parseFloat(l.discount) || 0) / 100;
    const taxable = sub - discAmt;
    const gst = taxable * (parseFloat(l.gstRate) || 0) / 100;
    return { sub, discAmt, taxable, gst, total: taxable + gst };
  };

  const subtotal = lines.reduce((s, l) => s + calcLine(l).taxable, 0);
  const gstTotal = lines.reduce((s, l) => s + calcLine(l).gst, 0);
  const discountTotal = lines.reduce((s, l) => s + calcLine(l).discAmt, 0);
  const total = subtotal + gstTotal;

  const handleSave = (statusVal) => {
    let custName = '', custPhone = '', custAddress = '', custGstin = '', custId = null;
    if (isNewCustomer) {
      if (!newCustName) { setToast({ msg: 'Enter customer name', type: 'error' }); return; }
      const nc = DB.customers.add({ name: newCustName, phone: newCustPhone, address: '', city: '' });
      custId = nc.id; custName = newCustName; custPhone = newCustPhone;
    } else {
      if (!customerId) { setToast({ msg: 'Select a customer', type: 'error' }); return; }
      const c = allCustomers.find(c => String(c.id) === String(customerId));
      if (c) { custId = c.id; custName = c.name; custPhone = c.phone; custAddress = c.address || ''; custGstin = c.gstin || ''; }
    }
    if (lines.every(l => !l.name)) { setToast({ msg: 'Add at least one item', type: 'error' }); return; }
    const validLines = lines.filter(l => l.name);
    const invNo = DB.settings.nextInvoiceNo();
    const inv = DB.invoices.add({
      invoiceNo: invNo, customerId: custId, customerName: custName,
      customerPhone: custPhone, customerAddress: custAddress, customerGstin: custGstin,
      shippingAddress: shippingAddress || custAddress,
      lines: validLines, subtotal, gstTotal, discountTotal, total, notes, status: statusVal
    });
    if (statusVal === 'paid' || statusVal === 'pending') DB.deductStock(validLines);
    onSave(inv);
  };

  const selectedCust = allCustomers.find(c => String(c.id) === String(customerId));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <Btn variant="secondary" size="sm" onClick={onCancel}>← Back</Btn>
        <div style={{ fontWeight: 700, fontSize: 17 }}>New Invoice</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 16, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Customer Selection */}
          <Section>
            <SectionHeader title="Customer Details" />
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button onClick={() => setIsNewCustomer(false)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: `1.5px solid ${!isNewCustomer ? '#2563EB' : '#E2E8F0'}`, background: !isNewCustomer ? '#EBF2FE' : '#fff', color: !isNewCustomer ? '#2563EB' : '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  Existing Customer
                </button>
                <button onClick={() => setIsNewCustomer(true)} style={{ flex: 1, padding: '8px', borderRadius: 7, border: `1.5px solid ${isNewCustomer ? '#2563EB' : '#E2E8F0'}`, background: isNewCustomer ? '#EBF2FE' : '#fff', color: isNewCustomer ? '#2563EB' : '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                  + New Customer
                </button>
              </div>
              {isNewCustomer ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <FormField label="Customer Name" required>
                    <Input value={newCustName} onChange={e => setNewCustName(e.target.value)} placeholder="Name or business" />
                  </FormField>
                  <FormField label="Phone">
                    <Input value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} placeholder="Mobile number" />
                  </FormField>
                </div>
              ) : (
                <FormField label="Select Customer" required>
                  <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ width: '100%', height: 38, padding: '0 10px', border: '1px solid #D1D9E6', borderRadius: 7, fontSize: 13.5, fontFamily: 'inherit', outline: 'none', background: '#FAFBFD' }}>
                    <option value="">— Choose customer —</option>
                    {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `· ${c.phone}` : ''}</option>)}
                  </select>
                </FormField>
              )}
              {selectedCust && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#F0F8FF', borderRadius: 8, fontSize: 12.5, color: '#374151' }}>
                  📍 {selectedCust.address || ''} {selectedCust.city || ''} {selectedCust.gstin ? `· GSTIN: ${selectedCust.gstin}` : ''}
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <FormField label="Shipping Address (if different)">
                  <Input value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} placeholder="Leave blank to use billing address" />
                </FormField>
              </div>
            </div>
          </Section>

          {/* Items */}
          <Section>
            <SectionHeader title="Items" action={<Btn size="sm" variant="secondary" icon="+" onClick={addLine}>Add Row</Btn>} />
            <div style={{ padding: '12px 16px' }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 70px 90px 70px 70px 36px', gap: 8, padding: '0 0 6px', marginBottom: 4, borderBottom: '1px solid #E2E8F0' }}>
                {['Product', 'Qty', 'Price ₹', 'Disc %', 'GST %', ''].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {lines.map((line, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 70px 90px 70px 70px 36px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select value={line.productId} onChange={e => setLine(i, 'productId', e.target.value)} style={{ height: 34, border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit', padding: '0 8px', width: '100%', outline: 'none' }}>
                    <option value="">Choose product…</option>
                    {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <input type="number" min="1" value={line.qty} onChange={e => setLine(i, 'qty', e.target.value)}
                    style={{ height: 34, border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', padding: '0 8px', width: '100%', outline: 'none', textAlign: 'center' }} />
                  <input type="number" min="0" value={line.price} onChange={e => setLine(i, 'price', e.target.value)}
                    style={{ height: 34, border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', padding: '0 8px', width: '100%', outline: 'none', textAlign: 'right' }} />
                  <input type="number" min="0" max="100" value={line.discount} onChange={e => setLine(i, 'discount', e.target.value)}
                    style={{ height: 34, border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', padding: '0 8px', width: '100%', outline: 'none', textAlign: 'center' }} />
                  <select value={line.gstRate} onChange={e => setLine(i, 'gstRate', e.target.value)} style={{ height: 34, border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12.5, fontFamily: 'inherit', padding: '0 4px', width: '100%', outline: 'none' }}>
                    {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                  <button onClick={() => removeLine(i)} disabled={lines.length === 1} style={{ height: 34, background: '#FEE8E8', border: 'none', borderRadius: 6, cursor: lines.length === 1 ? 'not-allowed' : 'pointer', color: '#C0392B', fontSize: 15, opacity: lines.length === 1 ? 0.3 : 1 }}>✕</button>
                </div>
              ))}
              {/* Line totals preview */}
              <div style={{ marginTop: 8, borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                {lines.filter(l => l.name).map((l, i) => {
                  const c = calcLine(l);
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7A8D', marginBottom: 3 }}>
                      <span>{l.name} × {l.qty}</span>
                      <span style={{ fontWeight: 600, color: '#1A2332' }}>₹{c.total.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section>
            <div style={{ padding: '14px 18px' }}>
              <FormField label="Notes / Remarks">
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, delivery notes…"
                  style={{ width: '100%', height: 56, border: '1px solid #D1D9E6', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', padding: '8px 12px', resize: 'none', boxSizing: 'border-box', outline: 'none' }} />
              </FormField>
            </div>
          </Section>
        </div>

        {/* Right: Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Section>
            <SectionHeader title="Bill Summary" />
            <div style={{ padding: '16px 18px' }}>
              {[['Subtotal', `₹${subtotal.toFixed(2)}`], ['Discount', `- ₹${discountTotal.toFixed(2)}`], ['GST', `₹${gstTotal.toFixed(2)}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13.5 }}>
                  <span style={{ color: '#6B7A8D' }}>{l}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: '#1A2332' }}>₹{total.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#8A96A8', marginTop: 6, textAlign: 'right' }}>
                {numberToWords(Math.round(total))} Rupees
              </div>
            </div>
          </Section>

          <Section>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Btn variant="primary" onClick={() => handleSave('paid')}>✅ Save & Mark Paid</Btn>
              <Btn variant="ghost" onClick={() => handleSave('pending')}>📋 Save as Pending</Btn>
            </div>
          </Section>
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

// ── Billing Screen ──────────────────────────────────────────────────────────
function BillingScreen({ onRefresh, refreshKey }) {
  const [view, setView] = React.useState('list');
  const [invoices, setInvoices] = React.useState([]);
  const [viewInv, setViewInv] = React.useState(null);
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [toast, setToast] = React.useState(null);

  const load = () => setInvoices([...DB.invoices.getAll()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  React.useEffect(load, [refreshKey]);

  const handleSaved = (inv) => {
    load(); setView('list'); onRefresh();
    setToast({ msg: `Invoice ${inv.invoiceNo} saved!`, type: 'success' });
    setViewInv(inv);
  };

  const updateStatus = (inv, status) => {
    DB.invoices.update(inv.id, { status });
    load(); onRefresh();
  };

  const filtered = invoices.filter(inv => {
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = (inv.invoiceNo || '').toLowerCase().includes(q) || (inv.customerName || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const statusMap = { paid: 'success', pending: 'warning', overdue: 'danger' };

  if (view === 'create') return (
    <InvoiceCreator onSave={handleSaved} onCancel={() => setView('list')} />
  );

  const totals = { paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0), pending: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.total || 0), 0), overdue: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.total || 0), 0) };
  const fmt = n => n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard label="Total Invoiced" value={fmt(invoices.reduce((s, i) => s + (i.total || 0), 0))} sub="All time" color="oklch(0.72 0.10 230)" icon="🧾" />
        <KPICard label="Collected" value={fmt(totals.paid)} sub={`${invoices.filter(i => i.status === 'paid').length} paid`} color="oklch(0.72 0.09 160)" icon="✅" />
        <KPICard label="Pending" value={fmt(totals.pending)} sub={`${invoices.filter(i => i.status === 'pending').length} invoices`} color="oklch(0.78 0.10 75)" icon="⏳" />
        <KPICard label="Overdue" value={fmt(totals.overdue)} sub={`${invoices.filter(i => i.status === 'overdue').length} invoices`} color="oklch(0.65 0.15 25)" icon="🚨" />
      </div>

      <Section>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 140 }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#8A96A8', fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice / customer…"
              style={{ paddingLeft: 28, paddingRight: 10, height: 34, width: '100%', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#F8FAFC' }} />
          </div>
          {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '5px 12px', borderRadius: 20, border: '1px solid', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit',
              borderColor: statusFilter === s ? '#2563EB' : '#E2E8F0', background: statusFilter === s ? '#EBF2FE' : '#fff',
              color: statusFilter === s ? '#2563EB' : '#6B7A8D', fontWeight: statusFilter === s ? 600 : 400
            }}>{s}</button>
          ))}
          <Btn variant="primary" size="sm" icon="+" onClick={() => setView('create')}>New Bill</Btn>
        </div>

        {filtered.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: '#8A96A8' }}>No invoices yet. <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setView('create')}>Create one →</span></div>
          : <Table
              columns={[
                { key: 'invoiceNo', label: 'Invoice #' },
                { key: 'customerName', label: 'Customer' },
                { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleDateString('en-IN') },
                { key: 'gstTotal', label: 'GST', render: v => `₹${(v || 0).toFixed(0)}` },
                { key: 'total', label: 'Amount', render: v => <span style={{ fontWeight: 700 }}>₹{(v || 0).toLocaleString()}</span> },
                { key: 'status', label: 'Status', render: (v, row) => (
                  <select value={v || 'pending'} onChange={e => updateStatus(row, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 12.5, cursor: 'pointer', fontWeight: 600, color: v === 'paid' ? '#2D8A5E' : v === 'overdue' ? '#C0392B' : '#B45309' }}>
                    <option value="pending">⏳ Pending</option>
                    <option value="paid">✅ Paid</option>
                    <option value="overdue">🚨 Overdue</option>
                  </select>
                )},
                { key: 'actions', label: '', render: (_, row) => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setViewInv(row); }}>View</Btn>
                    <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setViewInv(row); setTimeout(() => window.print(), 100); }}>🖨️ Print</Btn>
                  </div>
                )},
              ]}
              data={filtered}
              onRowClick={row => setViewInv(row)}
            />
        }
        <div style={{ padding: '10px 16px', color: '#8A96A8', fontSize: 12, borderTop: '1px solid #F1F5F9' }}>
          {filtered.length} invoices · Click a row to view
        </div>
      </Section>

      {viewInv && <InvoiceViewModal inv={viewInv} onClose={() => setViewInv(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

Object.assign(window, { BillingScreen, InvoicePrintView, InvoiceViewModal, numberToWords });
