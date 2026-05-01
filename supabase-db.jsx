// ── Supabase DB Layer ─────────────────────────────────────────────────────────
// Replaces localStorage db.jsx with real Supabase queries.
// Same API surface — all methods are async (return Promises).
// ─────────────────────────────────────────────────────────────────────────────

const SB = (() => {
  const db = () => window.supabaseClient;

  // ── Error helper ──────────────────────────────────────────────────────────
  const check = ({ data, error }, fallback = []) => {
    if (error) { console.error('[Supabase]', error.message); return fallback; }
    return data;
  };

  // ── Stock status helper ───────────────────────────────────────────────────
  const stockStatus = (stock, minStock) =>
    stock === 0 ? 'out' : stock <= (minStock || 10) ? 'low' : 'ok';

  // ══════════════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ══════════════════════════════════════════════════════════════════════════
  const products = {
    getAll: async () => {
      const res = await db().from('products').select('*').order('name');
      return check(res, []);
    },
    getById: async (id) => {
      const res = await db().from('products').select('*').eq('id', id).single();
      return check(res, null);
    },
    add: async (data) => {
      const stock = parseInt(data.stock) || 0;
      const minStock = parseInt(data.min_stock || data.minStock) || 10;
      const row = {
        name: data.name, category: data.category || 'General',
        hsn_code: data.hsnCode || data.hsn_code || '',
        price: parseFloat(data.price) || 0,
        mrp: parseFloat(data.mrp) || 0,
        stock, min_stock: minStock,
        status: stockStatus(stock, minStock),
        sku: data.sku || '',
      };
      const res = await db().from('products').insert(row).select().single();
      return check(res, null);
    },
    update: async (id, data) => {
      const stock = data.stock !== undefined ? parseInt(data.stock) : undefined;
      const minStock = parseInt(data.min_stock || data.minStock) || 10;
      const row = { ...data };
      if (data.hsnCode) { row.hsn_code = data.hsnCode; delete row.hsnCode; }
      if (data.minStock) { row.min_stock = data.minStock; delete row.minStock; }
      if (stock !== undefined) row.status = stockStatus(stock, minStock);
      delete row.id; delete row.created_at; delete row.updated_at;
      const res = await db().from('products').update(row).eq('id', id).select().single();
      return check(res, null);
    },
    remove: async (id) => {
      const res = await db().from('products').delete().eq('id', id);
      return !res.error;
    },
    deductStock: async (lines) => {
      for (const line of lines) {
        if (!line.productId) continue;
        const p = await products.getById(line.productId);
        if (!p) continue;
        const newStock = Math.max(0, (p.stock || 0) - (parseInt(line.qty) || 0));
        await products.update(p.id, { stock: newStock, min_stock: p.min_stock });
      }
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  // CUSTOMERS
  // ══════════════════════════════════════════════════════════════════════════
  const customers = {
    getAll: async () => {
      const res = await db().from('customers').select('*').order('name');
      return check(res, []);
    },
    getById: async (id) => {
      const res = await db().from('customers').select('*').eq('id', id).single();
      return check(res, null);
    },
    add: async (data) => {
      const row = { name: data.name, phone: data.phone || '', email: data.email || '', address: data.address || '', city: data.city || '', gstin: data.gstin || '' };
      const res = await db().from('customers').insert(row).select().single();
      return check(res, null);
    },
    update: async (id, data) => {
      const row = { name: data.name, phone: data.phone || '', email: data.email || '', address: data.address || '', city: data.city || '', gstin: data.gstin || '' };
      const res = await db().from('customers').update(row).eq('id', id).select().single();
      return check(res, null);
    },
    remove: async (id) => {
      const res = await db().from('customers').delete().eq('id', id);
      return !res.error;
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  // INVOICES
  // ══════════════════════════════════════════════════════════════════════════
  const invoices = {
    getAll: async () => {
      const res = await db().from('invoices').select('*').order('created_at', { ascending: false });
      return check(res, []).map(mapInv);
    },
    getById: async (id) => {
      const res = await db().from('invoices').select('*').eq('id', id).single();
      const row = check(res, null);
      return row ? mapInv(row) : null;
    },
    getByCustomer: async (customerId) => {
      const res = await db().from('invoices').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
      return check(res, []).map(mapInv);
    },
    add: async (data) => {
      const invNo = await settings.nextInvoiceNo();
      const row = {
        invoice_no: data.invoiceNo || invNo,
        customer_id: data.customerId || null,
        customer_name: data.customerName || '',
        customer_phone: data.customerPhone || '',
        customer_address: data.customerAddress || '',
        customer_gstin: data.customerGstin || '',
        shipping_address: data.shippingAddress || '',
        lines: data.lines || [],
        subtotal: parseFloat(data.subtotal) || 0,
        gst_total: parseFloat(data.gstTotal) || 0,
        discount_total: parseFloat(data.discountTotal) || 0,
        total: parseFloat(data.total) || 0,
        notes: data.notes || '',
        status: data.status || 'pending',
      };
      const res = await db().from('invoices').insert(row).select().single();
      const saved = check(res, null);
      return saved ? mapInv(saved) : null;
    },
    update: async (id, data) => {
      const row = {};
      if (data.status !== undefined) row.status = data.status;
      if (data.notes !== undefined) row.notes = data.notes;
      const res = await db().from('invoices').update(row).eq('id', id).select().single();
      const saved = check(res, null);
      return saved ? mapInv(saved) : null;
    },
    remove: async (id) => {
      const res = await db().from('invoices').delete().eq('id', id);
      return !res.error;
    },
  };

  // Map snake_case DB columns → camelCase used in UI
  const mapInv = (row) => ({
    ...row,
    invoiceNo: row.invoice_no,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    customerGstin: row.customer_gstin,
    shippingAddress: row.shipping_address,
    gstTotal: row.gst_total,
    discountTotal: row.discount_total,
    createdAt: row.created_at,
  });

  // ══════════════════════════════════════════════════════════════════════════
  // EXPENSES
  // ══════════════════════════════════════════════════════════════════════════
  const expenses = {
    getAll: async () => {
      const res = await db().from('expenses').select('*').order('created_at', { ascending: false });
      return check(res, []);
    },
    add: async (data) => {
      const row = { date: data.date, category: data.category, description: data.description, amount: parseFloat(data.amount) || 0, method: data.method || 'Cash' };
      const res = await db().from('expenses').insert(row).select().single();
      return check(res, null);
    },
    remove: async (id) => {
      const res = await db().from('expenses').delete().eq('id', id);
      return !res.error;
    },
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ══════════════════════════════════════════════════════════════════════════
  const settings = {
    get: async () => {
      const res = await db().from('app_settings').select('*').eq('id', 1).single();
      const row = check(res, null);
      if (!row) return _defaultSettings();
      return {
        businessName: row.business_name, gstin: row.gstin, address: row.address,
        city: row.city, phone: row.phone, email: row.email, bankName: row.bank_name,
        accountNo: row.account_no, ifsc: row.ifsc, upiId: row.upi_id,
        defaultGst: row.default_gst, invoicePrefix: row.invoice_prefix,
        invoiceCounter: row.invoice_counter,
      };
    },
    set: async (data) => {
      const row = {
        business_name: data.businessName, gstin: data.gstin, address: data.address,
        city: data.city, phone: data.phone, email: data.email, bank_name: data.bankName,
        account_no: data.accountNo, ifsc: data.ifsc, upi_id: data.upiId,
        default_gst: data.defaultGst, invoice_prefix: data.invoicePrefix,
        invoice_counter: data.invoiceCounter,
      };
      await db().from('app_settings').upsert({ id: 1, ...row });
    },
    nextInvoiceNo: async () => {
      const { data } = await db().from('app_settings').select('invoice_counter, invoice_prefix').eq('id', 1).single();
      const prefix = (data && data.invoice_prefix) || 'SKS';
      const counter = ((data && data.invoice_counter) || 100) + 1;
      await db().from('app_settings').update({ invoice_counter: counter }).eq('id', 1);
      return `${prefix}-${counter}`;
    },
  };

  const _defaultSettings = () => ({
    businessName: 'Shri Krishna Sales', gstin: '', address: '', city: '', phone: '', email: '',
    bankName: '', accountNo: '', ifsc: '', upiId: '', defaultGst: 12, invoicePrefix: 'SKS', invoiceCounter: 100,
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ANALYTICS (all async)
  // ══════════════════════════════════════════════════════════════════════════
  const analytics = {
    totalRevenue: async () => {
      const { data } = await db().from('invoices').select('total');
      return (data || []).reduce((s, r) => s + (r.total || 0), 0);
    },
    monthlyRevenue: async () => {
      const { data } = await db().from('invoices').select('total, created_at');
      const months = Array(12).fill(0);
      (data || []).forEach(r => { months[new Date(r.created_at).getMonth()] += r.total || 0; });
      return months;
    },
    totalStockValue: async () => {
      const { data } = await db().from('products').select('price, stock');
      return (data || []).reduce((s, r) => s + (r.price || 0) * (r.stock || 0), 0);
    },
    pendingPayments: async () => {
      const { data } = await db().from('invoices').select('total, status').in('status', ['pending', 'overdue']);
      return (data || []).reduce((s, r) => s + (r.total || 0), 0);
    },
    pendingCount: async () => {
      const { count } = await db().from('invoices').select('id', { count: 'exact', head: true }).in('status', ['pending', 'overdue']);
      return count || 0;
    },
    todaySales: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await db().from('invoices').select('total').gte('created_at', today + 'T00:00:00');
      return (data || []).reduce((s, r) => s + (r.total || 0), 0);
    },
    todayCount: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await db().from('invoices').select('id', { count: 'exact', head: true }).gte('created_at', today + 'T00:00:00');
      return count || 0;
    },
    lowStockItems: async () => {
      const { data } = await db().from('products').select('*').in('status', ['low', 'out']).order('stock');
      return data || [];
    },
    recentInvoices: async (n = 5) => {
      const { data } = await db().from('invoices').select('*').order('created_at', { ascending: false }).limit(n);
      return (data || []).map(mapInv);
    },
    totalExpenses: async () => {
      const { data } = await db().from('expenses').select('amount');
      return (data || []).reduce((s, r) => s + (r.amount || 0), 0);
    },
    categoryBreakdown: async () => {
      const { data } = await db().from('products').select('category');
      const map = {};
      (data || []).forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
      return map;
    },
    topCustomers: async (n = 5) => {
      const { data } = await db().from('invoices').select('customer_name, total');
      const map = {};
      (data || []).forEach(r => { map[r.customer_name] = (map[r.customer_name] || 0) + (r.total || 0); });
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
    },
  };

  // ── Auth (still localStorage for login session) ───────────────────────────
  const _read = k => JSON.parse(localStorage.getItem(k) || 'null');
  const _write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const auth = {
    getCredentials: () => _read('sks_auth') || { username: 'admin', password: 'krishna123' },
    setCredentials: (u, p) => _write('sks_auth', { username: u, password: p }),
    login: (u, p) => {
      const creds = auth.getCredentials();
      if (u === creds.username && p === creds.password) { _write('sks_session', { loggedIn: true, user: u }); return true; }
      return false;
    },
    logout: () => _write('sks_session', null),
    isLoggedIn: () => !!(_read('sks_session') || {}).loggedIn,
    getUser: () => (_read('sks_session') || {}).user || '',
  };

  // ── Real-time subscriptions ───────────────────────────────────────────────
  const subscriptions = {
    onProductsChange: (cb) => {
      return db().channel('products-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, cb)
        .subscribe();
    },
    onInvoicesChange: (cb) => {
      return db().channel('invoices-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, cb)
        .subscribe();
    },
    unsubscribe: (channel) => { if (channel) db().removeChannel(channel); },
  };

  // ── Connection test ───────────────────────────────────────────────────────
  const testConnection = async () => {
    try {
      const { error } = await db().from('app_settings').select('id').limit(1);
      return !error;
    } catch { return false; }
  };

  return { products, customers, invoices, expenses, settings, analytics, auth, subscriptions, testConnection, deductStock: products.deductStock };
})();

window.DB = SB; // Same global name as before — screens don't need to change
