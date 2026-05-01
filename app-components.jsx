// Shared UI Components: Sidebar, Navbar, Cards, Buttons, Badges, Modals
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'inventory', label: 'Inventory', icon: '⬡' },
  { id: 'customers', label: 'Customers', icon: '◎' },
  { id: 'billing', label: 'Billing', icon: '▤' },
  { id: 'reports', label: 'Reports', icon: '▲' },
  { id: 'expenses', label: 'Expenses', icon: '◈' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

function Sidebar({ active, onNav }) {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#1E293B',
      display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100,
      boxShadow: '2px 0 12px rgba(0,0,0,0.10)'
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: 'oklch(0.72 0.10 230)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#fff', fontWeight: 700
          }}>W</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.2px' }}>WholesaleOS</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Management Suite</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 600, letterSpacing: '0.08em', padding: '0 12px 8px', textTransform: 'uppercase' }}>Main Menu</div>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '10px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
            marginBottom: 2, textAlign: 'left', fontSize: 13.5, fontWeight: active === item.id ? 600 : 400,
            background: active === item.id ? 'rgba(255,255,255,0.10)' : 'transparent',
            color: active === item.id ? '#fff' : 'rgba(255,255,255,0.55)',
            transition: 'all 0.15s ease',
            position: 'relative'
          }}
            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { if (active !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
          >
            {active === item.id && <div style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%',
              width: 3, background: 'oklch(0.72 0.10 230)', borderRadius: '0 3px 3px 0'
            }} />}
            <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom user */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'oklch(0.65 0.09 160)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13
          }}>R</div>
          <div>
            <div style={{ color: '#fff', fontSize: 12.5, fontWeight: 600 }}>Rajesh Kumar</div>
            <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Navbar({ title, onNav }) {
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  return (
    <header style={{
      height: 60, background: '#fff', borderBottom: '1px solid #E8ECF2',
      display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16,
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text1)' }}>{title}</div>
      </div>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8A96A8', fontSize: 14 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products, customers…"
          style={{
            paddingLeft: 32, paddingRight: 14, height: 36, width: 240,
            border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13,
            color: '#1A2332', background: 'var(--surface2)', outline: 'none',
            fontFamily: 'inherit'
          }} />
      </div>
      {/* Notif */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setNotifOpen(!notifOpen)} style={{
          width: 36, height: 36, borderRadius: 8, border: '1px solid #E2E8F0',
          background: 'var(--surface2)', cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
        }}>
          🔔
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 8, height: 8,
            background: 'oklch(0.65 0.15 25)', borderRadius: '50%', border: '1.5px solid #fff'
          }} />
        </button>
        {notifOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 44, width: 300, background: '#fff',
            border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            zIndex: 200, overflow: 'hidden'
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E8ECF2', fontWeight: 700, fontSize: 13.5 }}>Notifications</div>
            {[
              { text: 'Low stock: Basmati Rice (12 bags)', time: '5m ago', color: 'oklch(0.78 0.10 75)' },
              { text: 'New payment from Sharma Traders', time: '1h ago', color: 'oklch(0.72 0.09 160)' },
              { text: 'Invoice #1042 is overdue', time: '2h ago', color: 'oklch(0.65 0.15 25)' },
            ].map((n, i) => (
              <div key={i} style={{ padding: '12px 16px', borderBottom: i < 2 ? '1px solid #F1F5F9' : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text1)' }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: '#8A96A8', marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

// Reusable KPI Card
function KPICard({ label, value, sub, color, icon }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s', cursor: 'default',
      borderTop: `3px solid ${color}`
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text1)', letterSpacing: '-0.5px' }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text4)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + '22', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, flexShrink: 0
        }}>{icon}</div>
      </div>
    </div>
  );
}

// Badge
function Badge({ label, type }) {
  const styles = {
    success: { bg: '#E6F4EE', color: '#2D8A5E' },
    warning: { bg: '#FEF3E2', color: '#B45309' },
    danger: { bg: '#FEE8E8', color: '#C0392B' },
    info: { bg: '#EAF2FD', color: '#2563EB' },
    default: { bg: '#F1F5F9', color: '#475569' },
  };
  const s = styles[type] || styles.default;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 11.5, fontWeight: 600,
      padding: '3px 9px', borderRadius: 20, letterSpacing: '0.02em'
    }}>{label}</span>
  );
}

// Primary Button
function Btn({ children, onClick, variant = 'primary', size = 'md', icon }) {
  const variants = {
    primary: { bg: '#2563EB', color: '#fff', border: 'none' },
    secondary: { bg: '#F1F5F9', color: '#374151', border: '1px solid #E2E8F0' },
    success: { bg: 'oklch(0.62 0.12 160)', color: '#fff', border: 'none' },
    danger: { bg: 'oklch(0.60 0.15 25)', color: '#fff', border: 'none' },
    ghost: { bg: 'transparent', color: '#2563EB', border: '1.5px solid #2563EB' },
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 13.5 },
    lg: { padding: '11px 22px', fontSize: 14.5 },
  };
  const v = variants[variant];
  const s = sizes[size];
  return (
    <button onClick={onClick} style={{
      ...v, ...s, borderRadius: 8, cursor: 'pointer', fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
      transition: 'opacity 0.15s, transform 0.1s',
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
      onMouseDown={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {icon && <span>{icon}</span>}{children}
    </button>
  );
}

// Table
function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
        <thead>
          <tr style={{ background: 'var(--surface2)' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '11px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12,
                color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em',
                borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap'
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                borderBottom: '1px solid var(--border2)',
                transition: 'background 0.12s',
                cursor: onRowClick ? 'pointer' : 'default'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 14px', color: 'var(--text1)' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Modal
function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 14, width, maxWidth: '95vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden',
        animation: 'modalIn 0.2s ease'
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--text1)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text4)', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: '22px' }}>{children}</div>
      </div>
    </div>
  );
}

// FormField
function FormField({ label, children, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text2)', marginBottom: 5 }}>
        {label}{required && <span style={{ color: 'oklch(0.60 0.15 25)' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', style: extraStyle }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
      width: '100%', height: 38, padding: '0 12px', border: '1px solid var(--border)',
      borderRadius: 7, fontSize: 13.5, color: 'var(--text1)', fontFamily: 'inherit',
      outline: 'none', boxSizing: 'border-box', background: 'var(--input-bg)',
      transition: 'border-color 0.15s',
      ...extraStyle
    }}
      onFocus={e => e.target.style.borderColor = '#2563EB'}
      onBlur={e => e.target.style.borderColor = '#D1D9E6'}
    />
  );
}

function Select({ value, onChange, options, style: extraStyle }) {
  return (
    <select value={value} onChange={onChange} style={{
      width: '100%', height: 38, padding: '0 10px', border: '1px solid var(--border)',
      borderRadius: 7, fontSize: 13.5, color: 'var(--text1)', fontFamily: 'inherit',
      outline: 'none', boxSizing: 'border-box', background: 'var(--input-bg)', cursor: 'pointer',
      ...extraStyle
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// Section card wrapper
function Section({ children, style: s }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden', ...s
    }}>{children}</div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{
      padding: '16px 20px', borderBottom: '1px solid var(--border2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text1)' }}>{title}</div>
      {action}
    </div>
  );
}

Object.assign(window, {
  Sidebar, Navbar, KPICard, Badge, Btn, Table, Modal, FormField, Input, Select, Section, SectionHeader, NAV_ITEMS
});
