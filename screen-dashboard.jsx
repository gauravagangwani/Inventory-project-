// Dashboard Screen — Live data from DB
function LineSVG({ data, color = '#2563EB', height = 100 }) {
  if (!data || data.every(v => v === 0)) data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const w = 400, h = height;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * (h - 12) - 4;
    return `${x},${y}`;
  });
  const area = `M${pts[0]} L${pts.slice(1).join(' L')} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lg1)" />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - (v / max) * (h - 12) - 4;
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="2" />;
      })}
    </svg>
  );
}

function PieChart({ data }) {
  if (!data || data.length === 0) return <div style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A96A8', fontSize: 12 }}>No data</div>;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let angle = -Math.PI / 2;
  const cx = 70, cy = 70, r = 58, inner = 32;
  const COLORS = ['oklch(0.72 0.10 230)', 'oklch(0.72 0.09 160)', 'oklch(0.78 0.10 75)', 'oklch(0.68 0.09 310)', '#CBD5E1', 'oklch(0.65 0.12 15)', 'oklch(0.75 0.10 190)'];
  const slices = data.map((d, idx) => {
    const a = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += a;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const xi1 = cx + inner * Math.cos(angle - a), yi1 = cy + inner * Math.sin(angle - a);
    const xi2 = cx + inner * Math.cos(angle), yi2 = cy + inner * Math.sin(angle);
    const large = a > Math.PI ? 1 : 0;
    return { ...d, path: `M${xi1},${yi1} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large},0 ${xi1},${yi1} Z`, color: COLORS[idx % COLORS.length] };
  });
  return (
    <svg viewBox="0 0 140 140" width={140} height={140}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth="2" />)}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="11" fill="#6B7A8D" fontFamily="Open Sans,sans-serif">Total</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1A2332" fontFamily="Open Sans,sans-serif">{total}</text>
    </svg>
  );
}

function DashboardScreen({ onNav, refreshKey }) {
  const [data, setData] = React.useState({});
  const COLORS = ['oklch(0.72 0.10 230)', 'oklch(0.72 0.09 160)', 'oklch(0.78 0.10 75)', 'oklch(0.68 0.09 310)', '#CBD5E1', 'oklch(0.65 0.12 15)', 'oklch(0.75 0.10 190)'];

  React.useEffect(() => {
    const a = DB.analytics;
    const catBreak = a.categoryBreakdown();
    setData({
      revenue: a.totalRevenue(),
      stockValue: a.totalStockValue(),
      pending: a.pendingPayments(),
      pendingCount: a.pendingCount(),
      todaySales: a.todaySales(),
      todayCount: a.todayCount(),
      monthly: a.monthlyRevenue(),
      catPie: Object.entries(catBreak).map(([k, v]) => ({ label: k, value: v })),
      lowStock: a.lowStockItems().slice(0, 5),
      recent: a.recentInvoices(5),
    });
  }, [refreshKey]);

  const fmt = n => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`;
  const statusMap = { paid: 'success', pending: 'warning', overdue: 'danger' };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        <KPICard label="Total Revenue" value={fmt(data.revenue || 0)} sub="All time" color="oklch(0.72 0.10 230)" icon="💰" />
        <KPICard label="Stock Value" value={fmt(data.stockValue || 0)} sub={`${DB.products.getAll().length} SKUs`} color="oklch(0.72 0.09 160)" icon="📦" />
        <KPICard label="Pending Payments" value={fmt(data.pending || 0)} sub={`${data.pendingCount || 0} invoices`} color="oklch(0.78 0.10 75)" icon="⏳" />
        <KPICard label="Today's Sales" value={fmt(data.todaySales || 0)} sub={`${data.todayCount || 0} bills today`} color="oklch(0.68 0.09 310)" icon="📈" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <Btn variant="primary" icon="📄" onClick={() => onNav('billing')}>Create Bill</Btn>
        <Btn variant="secondary" icon="+" onClick={() => onNav('inventory')}>Add Stock</Btn>
        <Btn variant="secondary" icon="👤" onClick={() => onNav('customers')}>Add Customer</Btn>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 22 }}>
        <Section>
          <SectionHeader title="Monthly Sales" action={<span style={{ fontSize: 12, color: '#8A96A8' }}>This year</span>} />
          <div style={{ padding: '16px 20px 12px' }}>
            <LineSVG data={data.monthly || []} color="#2563EB" height={110} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {MONTHS.map(m => <span key={m} style={{ fontSize: 10, color: '#8A96A8' }}>{m}</span>)}
            </div>
          </div>
        </Section>
        <Section>
          <SectionHeader title="Category Mix" />
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <PieChart data={data.catPie || []} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {(data.catPie || []).map((d, i) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151', flex: 1 }}>{d.label}</span>
                  <span style={{ fontSize: 11.5, color: '#8A96A8' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Section>
          <SectionHeader title="Recent Invoices" action={<Btn size="sm" variant="ghost" onClick={() => onNav('billing')}>View All</Btn>} />
          {(data.recent || []).length === 0
            ? <div style={{ padding: '24px', textAlign: 'center', color: '#8A96A8', fontSize: 13 }}>No invoices yet. <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => onNav('billing')}>Create one →</span></div>
            : <Table
                columns={[
                  { key: 'invoiceNo', label: 'Invoice' },
                  { key: 'customerName', label: 'Customer' },
                  { key: 'total', label: 'Amount', render: v => `₹${(v || 0).toLocaleString()}` },
                  { key: 'status', label: 'Status', render: v => <Badge label={(v||'pending').charAt(0).toUpperCase()+(v||'pending').slice(1)} type={statusMap[v] || 'warning'} /> },
                ]}
                data={data.recent || []}
              />
          }
        </Section>
        <Section>
          <SectionHeader title="Low Stock Alerts" action={<Badge label={`${(data.lowStock || []).length} items`} type="warning" />} />
          {(data.lowStock || []).length === 0
            ? <div style={{ padding: '24px', textAlign: 'center', color: '#8A96A8', fontSize: 13 }}>All items are well stocked ✅</div>
            : <div style={{ padding: '4px 0' }}>
                {(data.lowStock || []).map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 18px', borderBottom: i < (data.lowStock.length - 1) ? '1px solid #F1F5F9' : 'none', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: item.status === 'out' ? '#FEE8E8' : '#FEF3E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{item.status === 'out' ? '🚫' : '⚠️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2332' }}>{item.name}</div>
                      <div style={{ fontSize: 11.5, color: '#8A96A8' }}>{item.category} · Min: {item.minStock}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: item.status === 'out' ? '#C0392B' : '#B45309' }}>{item.stock}</div>
                      <div style={{ fontSize: 11, color: '#8A96A8' }}>left</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScreen, LineSVG, PieChart });
