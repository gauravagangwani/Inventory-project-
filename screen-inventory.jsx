// Inventory Screen — Full CRUD with real DB
const SKS_CATS = ['All', 'Wallets', 'Goggles', 'Caps', 'Belts', 'Purses', 'Bags', 'Cloth Bags'];

function Toast({ msg, type, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  const colors = { success: '#2D8A5E', error: '#C0392B', info: '#2563EB' };
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: '#1E293B', color: '#fff', borderRadius: 10, padding: '12px 18px',
      fontSize: 13.5, fontWeight: 500, boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
      display: 'flex', alignItems: 'center', gap: 10, animation: 'fadeSlide 0.2s ease',
      borderLeft: `4px solid ${colors[type] || colors.info}`
    }}>
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      {msg}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const blank = { name: '', category: 'Wallets', price: '', mrp: '', stock: '', minStock: 10, hsnCode: '' };
  const [form, setForm] = React.useState(product ? { ...product } : blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name && form.price && form.stock !== '';

  return (
    <Modal open onClose={onClose} title={product ? `Edit: ${product.name}` : 'Add New Product'} width={520}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="Product Name" required>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Men's Leather Wallet" />
          </FormField>
        </div>
        <FormField label="Category" required>
          <Select value={form.category} onChange={e => set('category', e.target.value)}
            options={SKS_CATS.slice(1).map(c => ({ value: c, label: c }))} />
        </FormField>
        <FormField label="HSN Code">
          <Input value={form.hsnCode} onChange={e => set('hsnCode', e.target.value)} placeholder="e.g. 4205" />
        </FormField>
        <FormField label="Purchase Price (₹)" required>
          <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" />
        </FormField>
        <FormField label="MRP / Selling Price (₹)">
          <Input type="number" value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0" />
        </FormField>
        <FormField label="Current Stock" required>
          <Input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
        </FormField>
        <FormField label="Low Stock Alert Below">
          <Input type="number" value={form.minStock} onChange={e => set('minStock', e.target.value)} placeholder="10" />
        </FormField>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={() => valid && onSave(form)}>
          {product ? 'Save Changes' : 'Add Product'}
        </Btn>
      </div>
    </Modal>
  );
}

function InventoryScreen({ onRefresh }) {
  const [products, setProducts] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [modal, setModal] = React.useState(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const load = () => setProducts(DB.products.getAll());
  React.useEffect(load, []);

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const filtered = products.filter(p => {
    const matchCat = cat === 'All' || p.category === cat;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || (p.hsnCode || '').includes(q) || p.category.toLowerCase().includes(q);
    return matchCat && matchStatus && matchSearch;
  });

  const handleSave = (form) => {
    const stock = parseInt(form.stock) || 0;
    const minStock = parseInt(form.minStock) || 10;
    const status = stock === 0 ? 'out' : stock <= minStock ? 'low' : 'ok';
    const data = { ...form, price: parseFloat(form.price) || 0, mrp: parseFloat(form.mrp) || 0, stock, minStock, status };
    if (modal && modal.id) { DB.products.update(modal.id, data); showToast('Product updated!'); }
    else { DB.products.add(data); showToast('Product added!'); }
    setModal(null); load(); onRefresh();
  };

  const handleDelete = (p) => {
    DB.products.remove(p.id);
    setDeleteConfirm(null);
    showToast(`"${p.name}" deleted`, 'error');
    load(); onRefresh();
  };

  const statusCfg = { ok: { label: 'In Stock', type: 'success' }, low: { label: 'Low Stock', type: 'warning' }, out: { label: 'Out of Stock', type: 'danger' } };
  const counts = { total: products.length, ok: products.filter(p => p.status === 'ok').length, low: products.filter(p => p.status === 'low').length, out: products.filter(p => p.status === 'out').length };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[['Total SKUs', counts.total, 'oklch(0.72 0.10 230)'], ['In Stock', counts.ok, 'oklch(0.72 0.09 160)'], ['Low Stock', counts.low, 'oklch(0.78 0.10 75)'], ['Out of Stock', counts.out, 'oklch(0.65 0.15 25)']].map(([label, val, color]) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 10, padding: '14px 18px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 11, color: '#8A96A8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#1A2332', marginTop: 4 }}>{val}</div>
          </div>
        ))}
      </div>

      <Section>
        {/* Toolbar */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#8A96A8', fontSize: 13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              style={{ paddingLeft: 28, paddingRight: 10, height: 34, width: '100%', border: '1px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#F8FAFC' }} />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {SKS_CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '4px 11px', borderRadius: 20, border: '1px solid', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                borderColor: cat === c ? '#2563EB' : '#E2E8F0', background: cat === c ? '#EBF2FE' : '#fff',
                color: cat === c ? '#2563EB' : '#6B7A8D', fontWeight: cat === c ? 600 : 400
              }}>{c}</button>
            ))}
          </div>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            options={[{ value: 'All', label: 'All Status' }, { value: 'ok', label: 'In Stock' }, { value: 'low', label: 'Low Stock' }, { value: 'out', label: 'Out of Stock' }]}
            style={{ width: 130, height: 34 }} />
          <Btn variant="primary" size="sm" icon="+" onClick={() => setModal('new')}>Add Product</Btn>
        </div>

        {filtered.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: '#8A96A8' }}>No products found. <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setModal('new')}>Add one →</span></div>
          : <Table
              columns={[
                { key: 'name', label: 'Product Name' },
                { key: 'category', label: 'Category', render: v => <Badge label={v} type="info" /> },
                { key: 'hsnCode', label: 'HSN', render: v => v || '—' },
                { key: 'stock', label: 'Stock', render: (v, row) => <span style={{ fontWeight: 700, color: row.status === 'out' ? '#C0392B' : row.status === 'low' ? '#B45309' : '#1A2332' }}>{v}</span> },
                { key: 'price', label: 'Cost Price', render: v => `₹${(v || 0).toLocaleString()}` },
                { key: 'mrp', label: 'MRP', render: v => `₹${(v || 0).toLocaleString()}` },
                { key: 'status', label: 'Status', render: v => <Badge label={(statusCfg[v] || statusCfg.ok).label} type={(statusCfg[v] || statusCfg.ok).type} /> },
                { key: 'actions', label: '', render: (_, row) => (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" variant="secondary" onClick={e => { e.stopPropagation(); setModal(row); }}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={e => { e.stopPropagation(); setDeleteConfirm(row); }}>Delete</Btn>
                  </div>
                )},
              ]}
              data={filtered}
            />
        }
        <div style={{ padding: '10px 16px', color: '#8A96A8', fontSize: 12, borderTop: '1px solid #F1F5F9' }}>
          {filtered.length} of {products.length} products
        </div>
      </Section>

      {(modal === 'new' || (modal && modal.id)) && (
        <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      {deleteConfirm && (
        <Modal open onClose={() => setDeleteConfirm(null)} title="Delete Product?" width={400}>
          <p style={{ color: '#374151', marginBottom: 20 }}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => handleDelete(deleteConfirm)}>Yes, Delete</Btn>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}

Object.assign(window, { InventoryScreen, Toast, SKS_CATS });
