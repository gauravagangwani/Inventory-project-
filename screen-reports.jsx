// Reports & Expenses — Live data from DB

function BarChart({ data, color = 'oklch(0.72 0.10 230)', height = 140 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingBottom: 22, position: 'relative' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
          <div style={{ fontSize: 9.5, color: '#6B7A8D', fontWeight: 600, marginBottom: 3, whiteSpace: 'nowrap' }}>
            {d.value > 0 ? `₹${d.value >= 1000 ? (d.value / 1000).toFixed(0) + 'K' : d.value}` : ''}
          </div>
          <div style={{
            width: '100%', background: color, borderRadius: '4px 4px 0 0',
            height: `${(d.value / max) * (height - 44)}px`, minHeight: d.value > 0 ? 4 : 0,
            transition: 'height 0.3s ease', opacity: 0.85
          }} />
          <div style={{ fontSize: 10, color: '#8A96A8', position: 'absolute', bottom: 0 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

const EXP_CATS = ['Transport', 'Utilities', 'Labour', 'Rent', 'Repairs', 'Miscellaneous', 'Other'];
const CAT_COLORS_MAP = {
  Transport: 'oklch(0.72 0.10 230)', Utilities: 'oklch(0.78 0.10 75)',
  Labour: 'oklch(0.72 0.09 160)', Rent: 'oklch(0.68 0.09 310)',
  Repairs: 'oklch(0.65 0.15 25)', Miscellaneous: '#CBD5E1', Other: '#94A3B8'
};

function ReportsScreen({ refreshKey }) {
  const [data, setData] = React.useState({ monthly: [], total: 0, expenses: 0, profit: 0 });
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  React.useEffect(() => {
    const monthly = DB.analytics.monthlyRevenue();
    const total = DB.analytics.totalRevenue();
    const expenses = DB.analytics.totalExpenses();
    const invs = DB.invoices.getAll();
    const byCust = {};
    invs.forEach(inv => {
      byCust[inv.customerName] = (byCust[inv.customerName] || 0) + (inv.total || 0);
    });
    const topCusts = Object.entries(byCust).sort((a,b) => b[1]-a[1]).slice(0,5);
    setData({ monthly: monthly.map((v, i) => ({ label: MONTHS[i], value: v })), total, expenses, profit: total - expenses, topCusts });
  }, [refreshKey]);

  const fmt = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${Math.round(n)}`;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard label="Total Revenue" value={fmt(data.total)} sub="All time" color="oklch(0.72 0.10 230)" icon="📈" />
        <KPICard label="Total Expenses" value={fmt(data.expenses)} sub="All time" color="oklch(0.78 0.10 75)" icon="📉" />
        <KPICard label="Net Profit" value={fmt(data.profit)} sub="Revenue − Expenses" color="oklch(0.72 0.09 160)" icon="💹" />
        <KPICard label="GST Collected" value={fmt(DB.invoices.getAll().reduce((s,i) => s+(i.gstTotal||0),0))} sub="All invoices" color="oklch(0.68 0.09 310)" icon="🏦" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 16 }}>
        <Section>
          <SectionHeader title="Monthly Revenue" action={<span style={{ fontSize: 12, color: '#8A96A8' }}>This year</span>} />
          <div style={{ padding: '16px 20px 8px' }}>
            {data.monthly.every(d => d.value === 0)
              ? <div style={{ padding: '32px', textAlign: 'center', color: '#8A96A8', fontSize: 13 }}>No sales data yet. Create invoices to see revenue.</div>
              : <BarChart data={data.monthly} height={160} />
            }
          </div>
        </Section>
        <Section>
          <SectionHeader title="Top Customers" />
          <div style={{ padding: '8px 0' }}>
            {(data.topCusts || []).length === 0
              ? <div style={{ padding: '24px', textAlign: 'center', color: '#8A96A8', fontSize: 13 }}>No data yet</div>
              : (data.topCusts || []).map(([name, val], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'oklch(0.88 0.06 230)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'oklch(0.45 0.12 230)' }}>{i+1}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{name}</div>
                  <div style={{ fontWeight: 700, color: '#2D8A5E', fontSize: 13 }}>₹{val.toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        </Section>
      </div>

      {/* Invoice summary table */}
      <Section>
        <SectionHeader title="Sales Summary" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                {['Metric', 'Count', 'Amount'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: h === 'Metric' ? 'left' : 'right', fontWeight: 700, fontSize: 12, color: '#6B7A8D', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Paid Invoices', status: 'paid', color: '#2D8A5E' },
                { label: 'Pending Invoices', status: 'pending', color: '#B45309' },
                { label: 'Overdue Invoices', status: 'overdue', color: '#C0392B' },
              ].map(row => {
                const invs = DB.invoices.getAll().filter(i => i.status === row.status);
                const amt = invs.reduce((s, i) => s + (i.total || 0), 0);
                return (
                  <tr key={row.label} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 500 }}>{row.label}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right' }}>{invs.length}</td>
                    <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700, color: row.color }}>₹{amt.toLocaleString()}</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#F0FDF4' }}>
                <td style={{ padding: '11px 16px', fontWeight: 700 }}>Total</td>
                <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 700 }}>{DB.invoices.getAll().length}</td>
                <td style={{ padding: '11px 16px', textAlign: 'right', fontWeight: 800, color: '#2D8A5E', fontSize: 15 }}>₹{data.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function ExpensesScreen({ onRefresh, refreshKey }) {
  const [expenses, setExpenses] = React.useState([]);
  const [addModal, setAddModal] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const blank = { date: new Date().toISOString().slice(0, 10), category: 'Transport', description: '', amount: '', method: 'Cash' };
  const [form, setForm] = React.useState(blank);

  const load = () => setExpenses([...DB.expenses.getAll()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  React.useEffect(load, [refreshKey]);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const byCat = EXP_CATS.map(c => ({ cat: c, amt: expenses.filter(e => e.category === c).reduce((s, e) => s + (e.amount || 0), 0) })).filter(c => c.amt > 0);

  const handleSave = () => {
    if (!form.description || !form.amount) return;
    DB.expenses.add({ ...form, amount: parseFloat(form.amount) });
    setAddModal(false); setForm(blank); load(); onRefresh();
    showToast('Expense added!');
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <KPICard label="Total Expenses" value={total >= 1000 ? `₹${(total/1000).toFixed(1)}K` : `₹${total}`} sub="All time" color="oklch(0.78 0.10 75)" icon="💸" />
        <KPICard label="This Month" value={`₹${expenses.filter(e => { const d = new Date(e.createdAt); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((s,e) => s+(e.amount||0),0).toLocaleString()}`} sub="Current month" color="oklch(0.68 0.09 310)" icon="📅" />
        <KPICard label="Entries" value={expenses.length} sub="Total records" color="oklch(0.72 0.10 230)" icon="📝" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
        <Section>
          <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>Expense Log</div>
            <Btn variant="primary" size="sm" icon="+" onClick={() => setAddModal(true)}>Add Expense</Btn>
          </div>
          {expenses.length === 0
            ? <div style={{ padding: 40, textAlign: 'center', color: '#8A96A8' }}>No expenses recorded. <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setAddModal(true)}>Add one →</span></div>
            : <Table
                columns={[
                  { key: 'date', label: 'Date' },
                  { key: 'category', label: 'Category', render: v => <Badge label={v} type="info" /> },
                  { key: 'description', label: 'Description' },
                  { key: 'method', label: 'Method' },
                  { key: 'amount', label: 'Amount', render: v => <span style={{ fontWeight: 700, color: '#C0392B' }}>₹{(v||0).toLocaleString()}</span> },
                  { key: 'actions', label: '', render: (_, row) => (
                    <Btn size="sm" variant="danger" onClick={e => { e.stopPropagation(); DB.expenses.remove(row.id); load(); onRefresh(); showToast('Deleted', 'error'); }}>Delete</Btn>
                  )},
                ]}
                data={expenses}
              />
          }
        </Section>

        <Section>
          <SectionHeader title="By Category" />
          <div style={{ padding: '14px 18px' }}>
            {byCat.length === 0
              ? <div style={{ color: '#8A96A8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No expenses yet</div>
              : byCat.sort((a, b) => b.amt - a.amt).map(c => (
                <div key={c.cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 2, background: CAT_COLORS_MAP[c.cat] || '#CBD5E1' }} />
                      <span style={{ fontSize: 13 }}>{c.cat}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>₹{c.amt.toLocaleString()}</span>
                  </div>
                  <div style={{ height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c.amt / total) * 100}%`, background: CAT_COLORS_MAP[c.cat] || '#CBD5E1', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#8A96A8', marginTop: 2 }}>{Math.round((c.amt / total) * 100)}% of total</div>
                </div>
              ))
            }
          </div>
        </Section>
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Expense" width={440}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Date">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </FormField>
          <FormField label="Category" required>
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} options={EXP_CATS.map(c => ({ value: c, label: c }))} />
          </FormField>
          <div style={{ gridColumn: '1/-1' }}>
            <FormField label="Description" required>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
            </FormField>
          </div>
          <FormField label="Amount (₹)" required>
            <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
          </FormField>
          <FormField label="Payment Method">
            <Select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))} options={[{ value: 'Cash', label: 'Cash' }, { value: 'Bank', label: 'Bank Transfer' }, { value: 'UPI', label: 'UPI' }]} />
          </FormField>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="secondary" onClick={() => setAddModal(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>Save Expense</Btn>
        </div>
      </Modal>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

Object.assign(window, { ReportsScreen, ExpensesScreen, BarChart });
