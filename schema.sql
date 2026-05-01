-- ════════════════════════════════════════════════════════════════
-- Shri Krishna Sales · Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → Run
-- ════════════════════════════════════════════════════════════════

-- 1. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  category    TEXT DEFAULT 'General',
  sku         TEXT,
  hsn_code    TEXT,
  price       NUMERIC(10,2) DEFAULT 0,
  mrp         NUMERIC(10,2) DEFAULT 0,
  stock       INTEGER DEFAULT 0,
  min_stock   INTEGER DEFAULT 10,
  status      TEXT DEFAULT 'ok' CHECK (status IN ('ok','low','out')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  address     TEXT,
  city        TEXT,
  gstin       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INVOICES (transactions)
CREATE TABLE IF NOT EXISTS invoices (
  id                BIGSERIAL PRIMARY KEY,
  invoice_no        TEXT UNIQUE NOT NULL,
  customer_id       BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  customer_name     TEXT,
  customer_phone    TEXT,
  customer_address  TEXT,
  customer_gstin    TEXT,
  shipping_address  TEXT,
  lines             JSONB DEFAULT '[]',
  subtotal          NUMERIC(10,2) DEFAULT 0,
  gst_total         NUMERIC(10,2) DEFAULT 0,
  discount_total    NUMERIC(10,2) DEFAULT 0,
  total             NUMERIC(10,2) DEFAULT 0,
  notes             TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('paid','pending','overdue')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id          BIGSERIAL PRIMARY KEY,
  date        DATE DEFAULT CURRENT_DATE,
  category    TEXT DEFAULT 'Other',
  description TEXT,
  amount      NUMERIC(10,2) DEFAULT 0,
  method      TEXT DEFAULT 'Cash',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APP SETTINGS (single row, id always = 1)
CREATE TABLE IF NOT EXISTS app_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  business_name TEXT DEFAULT 'Shri Krishna Sales',
  gstin         TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  city          TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  email         TEXT DEFAULT '',
  bank_name     TEXT DEFAULT '',
  account_no    TEXT DEFAULT '',
  ifsc          TEXT DEFAULT '',
  upi_id        TEXT DEFAULT '',
  default_gst   INTEGER DEFAULT 12,
  invoice_prefix TEXT DEFAULT 'SKS',
  invoice_counter INTEGER DEFAULT 100
);

-- Insert default settings row
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── Trigger: auto-update updated_at on products ──────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS: Enable Row Level Security ───────────────────────────────
-- (Allows anon read/write — fine for single-user local app)
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow anon full access (single-user app)
CREATE POLICY "anon_all" ON products     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON customers    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON invoices     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON expenses     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON app_settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── Seed: sample products for Shri Krishna Sales ─────────────────
INSERT INTO products (name, category, hsn_code, price, mrp, stock, min_stock, status) VALUES
  ('Men''s Leather Wallet',    'Wallets',    '4205', 120,  180,  150, 20,  'ok'),
  ('Ladies Slim Wallet',       'Wallets',    '4205', 95,   150,  80,  15,  'ok'),
  ('Bifold Card Wallet',       'Wallets',    '4205', 80,   130,  7,   15,  'low'),
  ('UV Sunglasses (Square)',   'Goggles',    '9004', 65,   120,  200, 30,  'ok'),
  ('Sports Goggles',           'Goggles',    '9004', 90,   160,  5,   20,  'low'),
  ('Aviator Sunglasses',       'Goggles',    '9004', 75,   140,  120, 25,  'ok'),
  ('Baseball Cap',             'Caps',       '6505', 55,   100,  300, 40,  'ok'),
  ('Sports Cap (Dry-fit)',     'Caps',       '6505', 70,   130,  180, 30,  'ok'),
  ('Bucket Hat',               'Caps',       '6505', 60,   110,  9,   20,  'low'),
  ('Men''s Leather Belt 38mm', 'Belts',      '4203', 85,   150,  110, 20,  'ok'),
  ('Ladies Thin Belt',         'Belts',      '4203', 70,   130,  60,  15,  'ok'),
  ('Reversible Belt',          'Belts',      '4203', 110,  200,  0,   15,  'out'),
  ('Ladies Clutch Purse',      'Purses',     '4202', 140,  250,  75,  15,  'ok'),
  ('Wristlet Purse',           'Purses',     '4202', 110,  200,  40,  10,  'ok'),
  ('Ladies Shoulder Bag',      'Bags',       '4202', 250,  450,  55,  10,  'ok'),
  ('Handbag (Medium)',         'Bags',       '4202', 220,  400,  30,  10,  'ok'),
  ('Backpack',                 'Bags',       '4202', 300,  550,  8,   10,  'low'),
  ('Tote Bag (Canvas)',        'Cloth Bags', '6305', 45,   90,   500, 50,  'ok'),
  ('Jute Shopping Bag',        'Cloth Bags', '6305', 35,   70,   400, 50,  'ok'),
  ('Cotton Cloth Bag',         'Cloth Bags', '6305', 28,   60,   350, 40,  'ok')
ON CONFLICT DO NOTHING;
