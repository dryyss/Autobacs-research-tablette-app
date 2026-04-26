// app/kiosk/loading.tsx
// Next.js l'affiche automatiquement entre chaque navigation dans /kiosk
// Aucune configuration nécessaire — colle ce fichier dans app/kiosk/

export default function KioskLoading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#111',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes bar   { 0%{transform:scaleX(0);opacity:1} 70%{transform:scaleX(1);opacity:1} 90%,100%{transform:scaleX(0);opacity:0} }
        @keyframes blink { 0%,100%{opacity:.2;transform:scale(.6)} 50%{opacity:1;transform:scale(1)} }
        @keyframes fade  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes msg   { 0%,18%{opacity:0;transform:translateY(4px)} 22%,78%{opacity:1;transform:translateY(0)} 82%,100%{opacity:0;transform:translateY(-4px)} }
      `}</style>

      {/* Barre de progression top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: '#D9782D', transformOrigin: 'left',
        animation: 'bar 2.4s ease-in-out infinite',
      }} />

      {/* Coins décoratifs */}
      {([
        { top: 16, left: 16, borderTop: '1.5px solid rgba(217,120,45,.4)', borderLeft: '1.5px solid rgba(217,120,45,.4)' },
        { top: 16, right: 16, borderTop: '1.5px solid rgba(217,120,45,.4)', borderRight: '1.5px solid rgba(217,120,45,.4)' },
        { bottom: 16, left: 16, borderBottom: '1.5px solid rgba(217,120,45,.4)', borderLeft: '1.5px solid rgba(217,120,45,.4)' },
        { bottom: 16, right: 16, borderBottom: '1.5px solid rgba(217,120,45,.4)', borderRight: '1.5px solid rgba(217,120,45,.4)' },
      ] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 18, height: 18, ...s }} />
      ))}

      {/* Ring animé */}
      <div style={{
        position: 'relative', width: 120, height: 120,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
      }}>
        {/* Cercle de fond */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(217,120,45,.1)' }} />
        {/* Ring principal */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#D9782D', borderRightColor: 'rgba(217,120,45,.3)',
          animation: 'spin 1.1s linear infinite',
        }} />
        {/* Ring secondaire inverse */}
        <div style={{
          position: 'absolute', inset: 12, borderRadius: '50%',
          border: '1px solid transparent',
          borderTopColor: 'rgba(217,120,45,.35)',
          animation: 'spin 1.8s linear infinite reverse',
        }} />
        {/* Logo centre */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
        }}>
          <img src="/autobacs-logo.svg" alt="Autobacs" style={{ width: 48, height: 34, objectFit: 'contain' }} />
        </div>
      </div>

      {/* Texte */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, animation: 'fade .5s ease forwards' }}>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: -.3 }}>
          Chargement
        </p>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, margin: 0, letterSpacing: .5, fontWeight: 500 }}>
          Veuillez patienter...
        </p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
        {[0, .2, .4].map((delay, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#D9782D',
            animation: `blink 1.4s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
