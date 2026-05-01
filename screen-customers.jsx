// Customers Screen — Full CRUD with real DB
function CustomerDetail({ customer, onBack, refreshKey }) {
  const [bills, setBills] = React.useState([]);
  React.useEffect(() => {
    setBills(DB.invoices.getAll().filter(inv => inv.customerId === customer.id));
  }, [customer.id, refreshKey]);

  const total = bills.reduce((s, b) => s + (b.total || 0), 0);
  const outstanding = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + (b.total || 0), 0);
  const statusMap = { paid: 'success', pending: 'warning', overdue: 'danger' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Btn variant="secondary" size="sm" onClick={onBack}>← Back</Btn>
        <div style={{ fontWeight: 700, fontSize: 17 }}>{customer.name}</div>
        <Badge label={outstanding > 0 ? `₹${outstanding.toLocaleString()} outstanding` : 'Clear'} type={outstanding > 0 ? 'warning' : 'success'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Section>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'oklch(0.72 0.10 230)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700 }}>{customer.name[0]}</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{customer.name}</div>
                  <div style={{ color: '#8A96A8', fontSize: 12 }}>{customer.city || ''}</div>
                </div>
              </div>
              {[['Phone', customer.phone || '—'], ['GSTIN', customer.gstin || '—'], ['Address', customer.address || '—'], ['City', customer.city || '—']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: 12.5 }}>
                  <span style={{ color: '#8A96A8' }}>{l}</span>
                  <span style={{ fontWeight: 600, color: '#1A2332', maxWidth: 160, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </Section>
          <Section>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Summary</div>
              {[['Total Bills', bills.length], ['Lifetime Value', `₹${total.toLocaleString()}`], ['Outstanding', outstanding > 0 ? `₹${outstanding.toLocaleString()}` : '—']].map(([l, v], i) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: 13, color: '#6B7A8D' }}>{l}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: i === 2 && outstanding > 0 ? '#C0392B' : '#1A2332' }}>{v}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
        <Section>
          <SectionHeader title="Purchase History" action={<Badge label={`${bills.length} bills`} type="info" />} />
          {bills.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', color: '#8A96A8' }}>No bills yet for this customer.</div>
            : <Table
                columns={[
                  { key: 'invoiceNo', label: 'Invoice' },
                  { key: 'createdAt', label: 'Date', render: v => new Date(v).toLocaleDateString('en-IN') },
                  { key: 'total', label: 'Amount', render: v => `₹${(v || 0).toLocaleString()}` },
                  { key: 'status', label: 'Status', render: v => <Badge label={(v || 'pending').charAt(0).toUpperCase() + (v || 'pending').slice(1)} type={statusMap[v] || 'warning'} /> },
                ]}
                data={bills}
              />
          }
        </Section>
      </div>
    </div>
  );
}

function CustomersScreen({ onRefresh, refreshKey }) {
  const [customers, setCustomers] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [detail, setDetail] = React.useState(null);
  const [modal, setModal] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const blank = { name: '', phone: '', address: '', city: '', gstin: '' };
  const [form, setForm] = React.useState(blank);

  const load = () => setCustomers(DB.customers.getAll());
  React.useEffect(load, [refreshKey]);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  if (detail) return <CustomerDetail customer={detail} onBack={() => setDetail(null)} refreshKey={refreshKey} />;

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone || '').includes(q) || (c.city || '').toLowerCase().includes(q);
  });

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (modal && modal.id) { DB.customers.update(modal.id, form); showToast('Customer updated!'); }
    else { DB.customers.add(form); showToast('Customer added!'); }
    setModal(null); setForm(blank); load(); onRefresh();
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard label="Total Customers" value={customers.length} sub="All accounts" color="oklch(0.72 0.10 230)" icon="👥" />
        <KPICard label="Active This Month" value={customers.length} sub="Have transactions" color="oklch(0.72 0.09 160)" icon="📊" />
        <KPICard label="With Outstanding" value={0} sub="Pending dues" color="oklch(0.78 0.10 75)" icon="⏳" />
      </div>

      <Section>
        <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#8A96A8', fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, city…"
              style={{ paddingLeft: 28, paddingRight: 10, height: 34, width: '100%', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#F8FAFC' }} />
          </div>
          <Btn variant="primary" size="sm" icon="+" onClick={() => { setForm(blank); setModal('new'); }}>Add Customer</Btn>
        </div>
        {filtered.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: '#8A96A8' }}>No customers found. <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => { setForm(blank); setModal('new'); }}>Add one →</span></div>
          : <Table
              columns={[
                { key: 'name', label: 'Name', render: (v, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'oklch(0.88 0.06 230)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'oklch(0.45 0.12 230)' }}>{v[0]}</div>
                    <div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 11.5, color: '#8A96A8' }}>{row.city || ''}</div></div>
                  </div>
                )},
                { key: 'phone', label: 'Phone', render: v => v || '—' },
                { key: 'gstin', label: 'GSTIN', render: v => v || '—' },
                { key: 'actions', label: '', render: (_, row) => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setDetail(row); }}>View</Btn>
                    <Btn size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setForm({ name: row.name, phone: row.phone, address: row.address || '', city: row.city || '', gstin: row.gstin || '' }); setModal(row); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={e => { e.stopPropagation(); setDeleteConfirm(row); }}>Delete</Btn>
                  </div>
                )},
              ]}
              data={filtered}
              onRowClick={row => setDetail(row)}
            />
        }
        <div style={{ padding: '10px 16px', color: '#8A96A8', fontSize: 12, borderTop: '1px solid #F1F5F9' }}>{filtered.length} customers · Click a row to view details</div>
      </Section>

      <Modal open={!!modal} onClose={() => { setModal(null); setForm(blank); }} title={modal && modal.id ? 'Edit Customer' : 'Add New Customer'} width={460}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <FormField label="Customer / Business Name" required>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sharma Traders" />
            </FormField>
          </div>
          <FormField label="Phone Number" required>
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile" />
          </FormField>
          <FormField label="City">
            <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
          </FormField>
          <div style={{ gridColumn: '1/-1' }}>
            <FormField label="Address">
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Shop / area address" />
            </FormField>
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <FormField label="GSTIN (optional)">
              <Input value={form.gstin} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} placeholder="e.g. 07AAECS1234A1ZK" />
            </FormField>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => { setModal(null); setForm(blank); }}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>{modal && modal.id ? 'Save Changes' : 'Add Customer'}</Btn>
        </div>
      </Modal>

      {deleteConfirm && (
        <Modal open onClose={() => setDeleteConfirm(null)} title="Delete Customer?" width={400}>
          <p style={{ color: '#374151', marginBottom: 20 }}>Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { DB.customers.remove(deleteConfirm.id); setDeleteConfirm(null); showToast(`Deleted`, 'error'); load(); onRefresh(); }}>Delete</Btn>
          </div>
        </Modal>
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

Object.assign(window, { CustomersScreen });
