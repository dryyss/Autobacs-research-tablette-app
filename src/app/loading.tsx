// Affiché automatiquement par Next.js entre chaque navigation.
// Visuel aligné sur SplashScreen pour une expérience cohérente.

export default function KioskLoading() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#FFFFFF',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes rise    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanSpl { 0%{top:0;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0} }
      `}</style>

      {/* Scan line ambiante */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'rgba(217,120,45,.18)',
        animation: 'scanSpl 3.5s linear infinite',
      }} />

      {/* Glow central */}
      <div style={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,120,45,0.08), transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Coins */}
      {([
        { top: 24, left: 24, borderTop: '1px solid rgba(217,120,45,.5)', borderLeft: '1px solid rgba(217,120,45,.5)' },
        { top: 24, right: 24, borderTop: '1px solid rgba(217,120,45,.5)', borderRight: '1px solid rgba(217,120,45,.5)' },
        { bottom: 24, left: 24, borderBottom: '1px solid rgba(217,120,45,.5)', borderLeft: '1px solid rgba(217,120,45,.5)' },
        { bottom: 24, right: 24, borderBottom: '1px solid rgba(217,120,45,.5)', borderRight: '1px solid rgba(217,120,45,.5)' },
      ] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
      ))}

      {/* Ring principal */}
      <div style={{
        position: 'relative', width: 200, height: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 40,
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(217,120,45,.18)' }} />
        <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px solid rgba(217,120,45,.12)' }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#D9782D', borderRightColor: 'rgba(217,120,45,.4)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 16, borderRadius: '50%',
          border: '1px solid transparent',
          borderTopColor: 'rgba(217,120,45,.5)',
          animation: 'spin 1.1s linear infinite reverse',
        }} />
        {/* Centre logo */}
        <div style={{
          width: 124, height: 124, borderRadius: '50%',
          background: 'rgba(217,120,45,0.07)',
          border: '1.5px solid rgba(217,120,45,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
          animation: 'pulse 1.1s ease-in-out infinite',
          boxShadow: '0 4px 28px rgba(217,120,45,0.28)',
        }}>
          <img src="/autobacs-logo.svg" alt="Autobacs" style={{ width: 96, height: 70, objectFit: 'contain' }} />
        </div>
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 32, animation: 'rise .6s ease forwards' }}>
        <p style={{ color: '#1A1A1A', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -.5 }}>
          Chargement
        </p>
        <p style={{ color: 'rgba(26,26,26,.6)', fontSize: 14, margin: '8px 0 0', letterSpacing: .5, fontWeight: 500 }}>
          Veuillez patienter...
        </p>
      </div>

      {/* Logo MAGAR en bas */}
      <div style={{
        position: 'absolute', bottom: 14,
        animation: 'rise 1s ease 1.5s both',
      }}>
        <img
          src="/colored-logo-magar-dev.svg"
          alt="MAGAR Développement"
          style={{ height: 56, width: 'auto', objectFit: 'contain', opacity: 0.85 }}
        />
      </div>
    </div>
  )
}
