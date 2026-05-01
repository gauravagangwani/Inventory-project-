// Auth Screen – Login
function AuthScreen({ onLogin }) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);

  const handleLogin = () => {
    setError('');
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      const ok = DB.auth.login(username.trim(), password);
      if (ok) { onLogin(); }
      else { setError('Incorrect username or password.'); setLoading(false); }
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #F0F4FB 0%, #E8F0FE 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Open Sans, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, background: '#1E293B', borderRadius: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: '#fff', fontWeight: 800, marginBottom: 16,
            boxShadow: '0 8px 24px rgba(30,41,59,0.25)'
          }}>SKS</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A2332', marginBottom: 4 }}>Shri Krishna Sales</h1>
          <p style={{ color: '#6B7A8D', fontSize: 13.5 }}>Wholesale Management System</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '32px 28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)'
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Admin Login</h2>
          <p style={{ color: '#8A96A8', fontSize: 13, marginBottom: 24 }}>Sign in to access the dashboard</p>

          {error && (
            <div style={{
              background: '#FEE8E8', border: '1px solid #FCA5A5', borderRadius: 8,
              padding: '10px 14px', marginBottom: 16, color: '#C0392B', fontSize: 13, fontWeight: 500
            }}>⚠️ {error}</div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Username</label>
            <input
              value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Enter username"
              style={{
                width: '100%', height: 42, padding: '0 14px', border: '1.5px solid #D1D9E6',
                borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = '#2563EB'}
              onBlur={e => e.target.style.borderColor = '#D1D9E6'}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                style={{
                  width: '100%', height: 42, padding: '0 42px 0 14px', border: '1.5px solid #D1D9E6',
                  borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = '#D1D9E6'}
              />
              <button onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#8A96A8'
              }}>{showPw ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', height: 44, background: loading ? '#94A3B8' : '#1E293B',
            color: '#fff', border: 'none', borderRadius: 9, fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            {loading ? <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Signing in…</> : 'Sign In'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#8A96A8' }}>
            Default: <strong>admin</strong> / <strong>krishna123</strong>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

Object.assign(window, { AuthScreen });
