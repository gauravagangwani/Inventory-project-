// ── Shri Krishna Sales · Data Layer ──────────────────────────────────────────
// All data lives in localStorage. Each collection: getAll / getById / add / update / remove
// Call DB.seed() once on first run to populate demo data.

const DB = (() => {
  // ── helpers ─────────────────────────────────────────────────────────────────
  const read  = key => JSON.parse(localStorage.getItem(key) || 'null');
  const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));
  const nextId = key => {
    const n = (read('__seq_' + key) || 0) + 1;
    write('__seq_' + key, n);
    return n;
  };

  // ── generic collection factory ───────────────────────────────────────────
  function makeCollection(key) {
    return {
      getAll: () => read(key) || [],
      getById: id => (read(key) || []).find(r => r.id === id) || null,
      add: data => {
        const rows = read(key) || [];
        const row = { ...data, id: nextId(key), createdAt: new Date().toISOString() };
        write(key, [...rows, row]);
        return row;
      },
      update: (id, data) => {
        const rows = (read(key) || []).map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r);
        write(key, rows);
      },
      remove: id => write(key, (read(key) || []).filter(r => r.id !== id)),
      clear: () => write(key, []),
    };
  }

  const products  = makeCollection('sks_products');
  const customers = makeCollection('sks_customers');
  const invoices  = makeCollection('sks_invoices');
  const expenses  = makeCollection('sks_expenses');

  // ── auth ────────────────────────────────────────────────────────────────────
  const auth = {
    getCredentials: () => read('sks_auth') || { username: 'admin', password: 'krishna123' },
    setCredentials: (u, p) => write('sks_auth', { username: u, password: p }),
    login: (u, p) => {
      const creds = auth.getCredentials();
      if (u === creds.username && p === creds.password) {
        write('sks_session', { loggedIn: true, user: u, ts: Date.now() });
        return true;
      }
      return false;
    },
    logout: () => write('sks_session', null),
    isLoggedIn: () => !!(read('sks_session') || {}).loggedIn,
    getUser: () => (read('sks_session') || {}).user || '',
  };

  // ── settings ────────────────────────────────────────────────────────────────
  const settings = {
    get: () => read('sks_settings') || {
      businessName: 'Shri Krishna Sales',
      gstin: '07AAECS1234A1ZK',
      address: 'Shop No. 12, Main Market, Wholesale Bazaar',
      city: 'Delhi – 110006',
      phone: '9876543210',
      email: 'shrikrishnasales@gmail.com',
      bankName: 'State Bank of India',
      accountNo: '32145678901',
      ifsc: 'SBIN0001234',
      upiId: 'shrikrishna@upi',
      defaultGst: 12,
      invoicePrefix: 'SKS',
      invoiceCounter: 100,
    },
    set: data => write('sks_settings', { ...settings.get(), ...data }),
    nextInvoiceNo: () => {
      const s = settings.get();
      const no = (s.invoiceCounter || 100) + 1;
      settings.set({ invoiceCounter: no });
      return `${s.invoicePrefix || 'SKS'}-${no}`;
    },
  };

  // ── stock helper ─────────────────────────────────────────────────────────
  const deductStock = (lines) => {
    lines.forEach(line => {
      if (!line.productId) return;
      const p = products.getById(line.productId);
      if (p) {
        const newQty = Math.max(0, (p.stock || 0) - (parseInt(line.qty) || 0));
        const status = newQty === 0 ? 'out' : newQty <= (p.minStock || 10) ? 'low' : 'ok';
        products.update(p.id, { stock: newQty, status });
      }
    });
  };

  // ── analytics helpers (live from stored data) ────────────────────────────
  const analytics = {
    totalRevenue: () => invoices.getAll().reduce((s, inv) => s + (inv.total || 0), 0),
    monthlyRevenue: () => {
      const months = Array(12).fill(0);
      invoices.getAll().forEach(inv => {
        const m = new Date(inv.createdAt).getMonth();
        months[m] += inv.total || 0;
      });
      return months;
    },
    totalStockValue: () => products.getAll().reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0),
    pendingPayments: () => invoices.getAll().filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + (i.total || 0), 0),
    pendingCount: () => invoices.getAll().filter(i => i.status === 'pending' || i.status === 'overdue').length,
    todaySales: () => {
      const today = new Date().toDateString();
      return invoices.getAll().filter(i => new Date(i.createdAt).toDateString() === today).reduce((s, i) => s + (i.total || 0), 0);
    },
    todayCount: () => {
      const today = new Date().toDateString();
      return invoices.getAll().filter(i => new Date(i.createdAt).toDateString() === today).length;
    },
    categoryBreakdown: () => {
      const map = {};
      products.getAll().forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
      return map;
    },
    lowStockItems: () => products.getAll().filter(p => p.status === 'low' || p.status === 'out'),
    recentInvoices: (n = 5) => [...invoices.getAll()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, n),
    totalExpenses: () => expenses.getAll().reduce((s, e) => s + (e.amount || 0), 0),
  };

  // ── seed data ────────────────────────────────────────────────────────────
  const seed = () => {
    if (read('sks_seeded')) return;

    // Products – Shri Krishna Sales catalogue
    const productSeed = [
      { name: "Men's Leather Wallet",    category: 'Wallets',   price: 120, mrp: 180, stock: 150, minStock: 20, hsnCode: '4205', status: 'ok' },
      { name: "Ladies Slim Wallet",      category: 'Wallets',   price: 95,  mrp: 150, stock: 80,  minStock: 15, hsnCode: '4205', status: 'ok' },
      { name: "Bifold Card Wallet",      category: 'Wallets',   price: 80,  mrp: 130, stock: 7,   minStock: 15, hsnCode: '4205', status: 'low' },
      { name: "UV Sunglasses (Square)",  category: 'Goggles',   price: 65,  mrp: 120, stock: 200, minStock: 30, hsnCode: '9004', status: 'ok' },
      { name: "Sports Goggles",          category: 'Goggles',   price: 90,  mrp: 160, stock: 5,   minStock: 20, hsnCode: '9004', status: 'low' },
      { name: "Aviator Sunglasses",      category: 'Goggles',   price: 75,  mrp: 140, stock: 120, minStock: 25, hsnCode: '9004', status: 'ok' },
      { name: "Baseball Cap",            category: 'Caps',      price: 55,  mrp: 100, stock: 300, minStock: 40, hsnCode: '6505', status: 'ok' },
      { name: "Sports Cap (Dry-fit)",    category: 'Caps',      price: 70,  mrp: 130, stock: 180, minStock: 30, hsnCode: '6505', status: 'ok' },
      { name: "Bucket Hat",              category: 'Caps',      price: 60,  mrp: 110, stock: 9,   minStock: 20, hsnCode: '6505', status: 'low' },
      { name: "Men's Leather Belt 38mm", category: 'Belts',     price: 85,  mrp: 150, stock: 110, minStock: 20, hsnCode: '4203', status: 'ok' },
      { name: "Ladies Thin Belt",        category: 'Belts',     price: 70,  mrp: 130, stock: 60,  minStock: 15, hsnCode: '4203', status: 'ok' },
      { name: "Reversible Belt",         category: 'Belts',     price: 110, mrp: 200, stock: 0,   minStock: 15, hsnCode: '4203', status: 'out' },
      { name: "Ladies Clutch Purse",     category: 'Purses',    price: 140, mrp: 250, stock: 75,  minStock: 15, hsnCode: '4202', status: 'ok' },
      { name: "Wristlet Purse",          category: 'Purses',    price: 110, mrp: 200, stock: 40,  minStock: 10, hsnCode: '4202', status: 'ok' },
      { name: "Ladies Shoulder Bag",     category: 'Bags',      price: 250, mrp: 450, stock: 55,  minStock: 10, hsnCode: '4202', status: 'ok' },
      { name: "Handbag (Medium)",        category: 'Bags',      price: 220, mrp: 400, stock: 30,  minStock: 10, hsnCode: '4202', status: 'ok' },
      { name: "Backpack",                category: 'Bags',      price: 300, mrp: 550, stock: 8,   minStock: 10, hsnCode: '4202', status: 'low' },
      { name: "Tote Bag (Canvas)",       category: 'Cloth Bags',price: 45,  mrp: 90,  stock: 500, minStock: 50, hsnCode: '6305', status: 'ok' },
      { name: "Jute Shopping Bag",       category: 'Cloth Bags',price: 35,  mrp: 70,  stock: 400, minStock: 50, hsnCode: '6305', status: 'ok' },
      { name: "Cotton Cloth Bag",        category: 'Cloth Bags',price: 28,  mrp: 60,  stock: 350, minStock: 40, hsnCode: '6305', status: 'ok' },
    ];
    productSeed.forEach(p => products.add(p));

    // Customers
    const custSeed = [
      { name: 'Sharma Traders',   phone: '9876543210', address: 'Lajpat Nagar, Delhi',    gstin: '07AAXCS1234B1ZP', city: 'Delhi' },
      { name: 'Patel Stores',     phone: '9845123456', address: 'Dadar, Mumbai',           gstin: '',                city: 'Mumbai' },
      { name: 'Global Mart',      phone: '9812345678', address: 'MG Road, Pune',           gstin: '27AAGCG5432C1ZR', city: 'Pune' },
      { name: 'Lucky Wholesale',  phone: '9901234567', address: 'Bapu Bazar, Jaipur',      gstin: '',                city: 'Jaipur' },
      { name: 'Metro Fashion',    phone: '9765432109', address: 'Commercial St, Bangalore', gstin: '29AABCM3456D1ZQ', city: 'Bangalore' },
    ];
    custSeed.forEach(c => customers.add(c));

    // Sample invoices
    const invSeed = [
      { invoiceNo: 'SKS-101', customerName: 'Sharma Traders', customerId: 1, lines: [{ name: "Men's Leather Wallet", qty: 20, price: 120, gstRate: 12, hsnCode: '4205' }, { name: 'Baseball Cap', qty: 30, price: 55, gstRate: 12, hsnCode: '6505' }], subtotal: 4050, gstTotal: 486, total: 4536, status: 'paid' },
      { invoiceNo: 'SKS-102', customerName: 'Patel Stores',   customerId: 2, lines: [{ name: 'UV Sunglasses (Square)', qty: 50, price: 65, gstRate: 18, hsnCode: '9004' }], subtotal: 3250, gstTotal: 585, total: 3835, status: 'pending' },
      { invoiceNo: 'SKS-103', customerName: 'Global Mart',    customerId: 3, lines: [{ name: "Ladies Clutch Purse", qty: 15, price: 140, gstRate: 12, hsnCode: '4202' }, { name: 'Ladies Slim Wallet', qty: 20, price: 95, gstRate: 12, hsnCode: '4205' }], subtotal: 3000, gstTotal: 360, total: 3360, status: 'paid' },
    ];
    invSeed.forEach(i => invoices.add(i));

    // Sample expenses
    const expSeed = [
      { date: '2026-04-28', category: 'Transport', description: 'Delivery charges', amount: 800, method: 'Cash' },
      { date: '2026-04-27', category: 'Rent', description: 'Shop rent April', amount: 12000, method: 'Bank' },
      { date: '2026-04-26', category: 'Labour', description: 'Helper wages', amount: 1500, method: 'Cash' },
    ];
    expSeed.forEach(e => expenses.add(e));

    write('sks_seeded', true);
  };

  return { products, customers, invoices, expenses, auth, settings, analytics, deductStock, seed };
})();

window.DB = DB;
