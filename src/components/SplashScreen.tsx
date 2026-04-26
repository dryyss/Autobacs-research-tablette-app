'use client'
// components/kiosk/SplashScreen.tsx

import { useEffect, useState } from 'react'
import MagarLogoChorale from './MagarLogoChorale'

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

export default function SplashScreen({ onDone, duration = 6500, centre = 'Herblay' }: Props) {
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
      background: '#FFFFFF',
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
        position: 'relative', width: 160, height: 160,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 40,
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(217,120,45,.18)' }} />
        <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px solid rgba(217,120,45,.12)' }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#D9782D', borderRightColor: 'rgba(217,120,45,.4)',
          animation: 'spin 1.2s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 14, borderRadius: '50%',
          border: '1px solid transparent',
          borderTopColor: 'rgba(217,120,45,.5)',
          animation: 'spin 2s linear infinite reverse',
        }} />
        {/* Centre logo */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'rgba(217,120,45,0.07)',
          border: '1.5px solid rgba(217,120,45,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
          animation: 'pulse 2s ease-in-out infinite',
          boxShadow: '0 4px 24px rgba(217,120,45,0.22)',
        }}>
          <img src="/autobacs-logo.svg" alt="Autobacs" style={{ width: 74, height: 54, objectFit: 'contain' }} />
        </div>
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center', marginBottom: 32, animation: 'rise .6s ease forwards' }}>
        <p style={{ color: '#1A1A1A', fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: -.5 }}>
          Borne de recherche produit
        </p>
        <p style={{ color: 'rgba(26,26,26,.6)', fontSize: 14, margin: '8px 0 0', letterSpacing: .5, fontWeight: 500 }}>
          Centre {centre}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        width: 220, height: 2, background: 'rgba(0,0,0,.08)',
        borderRadius: 100, overflow: 'hidden', marginBottom: 14,
      }}>
        <div style={{
          height: '100%', background: '#D9782D', borderRadius: 100,
          width: `${progress}%`, transition: 'width .05s linear',
        }} />
      </div>

      {/* Message step */}
      <p key={step} style={{
        color: 'rgba(26,26,26,.55)', fontSize: 13, letterSpacing: 1, fontWeight: 500,
        margin: 0, animation: 'rise .3s ease forwards', textTransform: 'uppercase',
      }}>
        {STEPS[step]}
      </p>

      {/* Version */}
      <div style={{ position: 'absolute', bottom: 56, color: 'rgba(26,26,26,.45)', fontSize: 11, letterSpacing: 1 }}>
        v1.0.0
      </div>

      {/* Logo MAGAR animé en bas */}
      <div style={{ position: 'absolute', bottom: 12 }}>
        <MagarLogoChorale size={72} />
      </div>
    </div>
  )
}
