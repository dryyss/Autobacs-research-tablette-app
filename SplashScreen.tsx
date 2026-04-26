'use client'
// components/kiosk/SplashScreen.tsx
// Affiché au démarrage de la tablette — disparaît automatiquement après `duration` ms
//
// Usage :
//   const [ready, setReady] = useState(false)
//   if (!ready) return <SplashScreen onDone={() => setReady(true)} />

import { useEffect, useState } from 'react'

interface Props {
  onDone: () => void
  duration?: number   // ms, défaut 2800
  centre?: string
}

const STEPS = [
  'Démarrage du système...',
  'Connexion au catalogue...',
  'Chargement des stocks...',
  'Prêt',
]

export default function SplashScreen({ onDone, duration = 2800, centre = 'Herblay' }: Props) {
  const [step, setStep]         = useState(0)
  const [progress, setProgress] = useState(0)
  const [fading, setFading]     = useState(false)

  useEffect(() => {
    const start   = Date.now()
    const stepDur = (duration - 400) / STEPS.length

    // Progress bar continue
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / (duration - 400)) * 100)
      setProgress(pct)
    }, 30)

    // Messages qui avancent
    const stepTimers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * stepDur)
    )

    // Fondu sortie
    const fadeTimer = setTimeout(() => setFading(true), duration - 400)
    const doneTimer = setTimeout(onDone, duration)

    return () => {
      clearInterval(tick)
      stepTimers.forEach(clearTimeout)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone, duration])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0d0d0d',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.4s ease',
    }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes rise    { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanSpl { 0%{top:0;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0} }
      `}</style>

      {/* Scan line ambiante */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'rgba(217,120,45,.07)',
        animation: 'scanSpl 3.5s linear infinite',
      }} />

      {/* Glow central */}
      <div style={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,120,45,0.05), transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Coins */}
      {([
        { top: 24, left: 24, borderTop: '1px solid rgba(217,120,45,.3)', borderLeft: '1px solid rgba(217,120,45,.3)' },
        { top: 24, right: 24, borderTop: '1px solid rgba(217,120,45,.3)', borderRight: '1px solid rgba(217,120,45,.3)' },
        { bottom: 24, left: 24, borderBottom: '1px solid rgba(217,120,45,.3)', borderLeft: '1px solid rgba(217,120,45,.3)' },
        { bottom: 24, right: 24, borderBottom: '1px solid rgba(217,120,45,.3)', borderRight: '1px solid rgba(217,120,45,.3)' },
      ] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
      ))}

      {/* Ring principal */}
      <div style={{
        position: 'relative', width: 160, height: 160,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 40,
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(217,120,45,.08)' }} />
        <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(217,120,45,.05)' }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#D9782D', borderRightColor: 'rgba(217,120,45,.25)',
          animation: 'spin 1.2s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 14, borderRadius: '50%',
          border: '1px solid transparent',
          borderTopColor: 'rgba(217,120,45,.3)',
          animation: 'spin 2s linear infinite reverse',
        }} />
        {/* Centre logo */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: '#161616', border: '1px solid rgba(255,255,255,.06)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 7, zIndex: 2,
        }}>
          <div style={{
            background: '#D9782D', color: '#fff', fontWeight: 800,
            fontSize: 12, padding: '5px 12px', borderRadius: 5,
            letterSpacing: .5, animation: 'pulse 2s ease-in-out infinite',
          }}>AUTOBACS</div>
          <div style={{ color: 'rgba(255,255,255,.2)', fontSize: 9, letterSpacing: 3 }}>FRANCE</div>
        </div>
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 32, animation: 'rise .6s ease forwards' }}>
        <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -.5 }}>
          Borne de recherche produit
        </p>
        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13, margin: '8px 0 0', letterSpacing: .5 }}>
          Centre {centre}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 220, height: 2, background: 'rgba(255,255,255,.06)',
        borderRadius: 100, overflow: 'hidden', marginBottom: 14,
      }}>
        <div style={{
          height: '100%', background: '#D9782D', borderRadius: 100,
          width: `${progress}%`, transition: 'width .05s linear',
        }} />
      </div>

      {/* Message step */}
      <p key={step} style={{
        color: 'rgba(255,255,255,.3)', fontSize: 11, letterSpacing: 1,
        margin: 0, animation: 'rise .3s ease forwards',
      }}>
        {STEPS[step]}
      </p>

      {/* Version */}
      <div style={{ position: 'absolute', bottom: 24, color: 'rgba(255,255,255,.1)', fontSize: 10, letterSpacing: 1 }}>
        v1.0.0 · MAGAR Développement
      </div>
    </div>
  )
}
