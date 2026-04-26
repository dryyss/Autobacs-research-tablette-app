'use client'
// components/kiosk/IdleScreen.tsx
// Affiché automatiquement après `idleAfter` ms d'inactivité (défaut 90s)
// Disparaît dès que le client touche l'écran
//
// Usage — à placer dans ton layout principal :
//   <IdleScreen onWake={() => {}} centre="Herblay" />

import { useEffect, useState, useCallback } from 'react'

interface Props {
  onWake?: () => void
  centre?: string
  idleAfter?: number  // ms, défaut 90 000 (90s)
}

const PROMOS = [
  { icon: '💡', label: 'Ampoules',      sub: '2 achetées, la 3e offerte' },
  { icon: '🔋', label: 'Batteries',     sub: 'Reprise ancienne batterie gratuite' },
  { icon: '🛢', label: 'Huiles',        sub: '5W-30 5L à partir de 29,90 €' },
  { icon: '🌧', label: 'Essuie-glaces', sub: 'Montage offert ce week-end' },
  { icon: '⚫', label: 'Pneus',         sub: '4 achetés = équilibrage inclus' },
]

export default function IdleScreen({ onWake, centre = 'Herblay', idleAfter = 90_000 }: Props) {
  const [visible, setVisible]     = useState(false)
  const [promoIdx, setPromoIdx]   = useState(0)
  const [time, setTime]           = useState('')
  const [pulse, setPulse]         = useState(false)

  // Horloge live
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  // Rotation promos toutes les 4s (uniquement quand visible)
  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => setPromoIdx(i => (i + 1) % PROMOS.length), 4000)
    return () => clearInterval(t)
  }, [visible])

  // Effet breathing du ring
  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(t)
  }, [visible])

  // Timer inactivité — reset sur chaque interaction
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const show = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setVisible(true), idleAfter)
    }

    const hide = () => {
      setVisible(false)
      onWake?.()
      show()
    }

    document.addEventListener('touchstart', hide)
    document.addEventListener('click', hide)
    show()

    return () => {
      clearTimeout(timer)
      document.removeEventListener('touchstart', hide)
      document.removeEventListener('click', hide)
    }
  }, [idleAfter, onWake])

  if (!visible) return null

  const promo = PROMOS[promoIdx]

  return (
    <div
      onClick={() => { setVisible(false); onWake?.() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: '#0d0d0d', cursor: 'pointer',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fadeInIdle .6s ease forwards',
      }}
    >
      <style>{`
        @keyframes fadeInIdle { from{opacity:0} to{opacity:1} }
        @keyframes spinSlow   { to{transform:rotate(360deg)} }
        @keyframes floatIdle  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ticker     { 0%{opacity:0;transform:translateY(10px)} 12%,88%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-8px)} }
        @keyframes scanIdle   { 0%{top:0;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes pulseIdle  { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes glowIdle   { 0%,100%{opacity:.25} 50%{opacity:.55} }
        @keyframes ctaPulse   { 0%,100%{opacity:.2} 50%{opacity:.5} }
      `}</style>

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'rgba(217,120,45,.06)',
        animation: 'scanIdle 4s linear infinite',
      }} />

      {/* Glow central */}
      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,120,45,0.05), transparent 65%)',
        animation: 'glowIdle 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Coins */}
      {([
        { top: 20, left: 20, borderTop: '1px solid rgba(217,120,45,.25)', borderLeft: '1px solid rgba(217,120,45,.25)' },
        { top: 20, right: 20, borderTop: '1px solid rgba(217,120,45,.25)', borderRight: '1px solid rgba(217,120,45,.25)' },
        { bottom: 20, left: 20, borderBottom: '1px solid rgba(217,120,45,.25)', borderLeft: '1px solid rgba(217,120,45,.25)' },
        { bottom: 20, right: 20, borderBottom: '1px solid rgba(217,120,45,.25)', borderRight: '1px solid rgba(217,120,45,.25)' },
      ] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 22, height: 22, ...s }} />
      ))}

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px', borderBottom: '1px solid rgba(255,255,255,.04)',
      }}>
        <div style={{ background: '#D9782D', color: '#fff', fontWeight: 800, fontSize: 11, padding: '4px 12px', borderRadius: 5, letterSpacing: .5 }}>
          AUTOBACS
        </div>
        <div style={{ color: 'rgba(255,255,255,.18)', fontSize: 11, letterSpacing: 2 }}>
          {centre.toUpperCase()} · BORNE PRODUIT
        </div>
        <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 17, fontWeight: 600, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </div>
      </div>

      {/* Ring flottant */}
      <div style={{
        position: 'relative', width: 180, height: 180,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 38,
        animation: 'floatIdle 4s ease-in-out infinite',
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(217,120,45,.06)' }} />
        <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px solid rgba(217,120,45,.04)' }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '1.5px solid transparent',
          borderTopColor: `rgba(217,120,45,${pulse ? '.65' : '.25'})`,
          borderRightColor: `rgba(217,120,45,${pulse ? '.2' : '.07'})`,
          animation: 'spinSlow 7s linear infinite',
          transition: 'border-top-color 2s ease, border-right-color 2s ease',
        }} />
        <div style={{
          position: 'absolute', inset: 16, borderRadius: '50%',
          border: '1px solid transparent',
          borderTopColor: 'rgba(217,120,45,.14)',
          animation: 'spinSlow 11s linear infinite reverse',
        }} />

        {/* Centre */}
        <div style={{
          width: 108, height: 108, borderRadius: '50%',
          background: '#161616', border: '1px solid rgba(255,255,255,.05)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2,
        }}>
          <div style={{
            background: '#D9782D', color: '#fff', fontWeight: 800,
            fontSize: 11, padding: '4px 11px', borderRadius: 4,
            letterSpacing: .5, animation: 'pulseIdle 4s ease-in-out infinite',
          }}>AUTOBACS</div>
          <div style={{ color: 'rgba(255,255,255,.14)', fontSize: 9, letterSpacing: 3 }}>FRANCE</div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <p style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -.5 }}>
          Trouvez vos pièces auto
        </p>
        <p style={{ color: 'rgba(255,255,255,.22)', fontSize: 13, margin: '10px 0 0', letterSpacing: .3 }}>
          Entrez votre plaque pour commencer
        </p>
      </div>

      {/* Promo rotative */}
      <div
        key={promoIdx}
        style={{
          background: 'rgba(217,120,45,.08)', border: '1px solid rgba(217,120,45,.2)',
          borderRadius: 14, padding: '13px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 38, minWidth: 280,
          animation: 'ticker .4s ease forwards',
        }}
      >
        <span style={{ fontSize: 22 }}>{promo.icon}</span>
        <div>
          <p style={{ color: 'rgba(217,120,45,.9)', fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', margin: 0 }}>
            {promo.label}
          </p>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 600, margin: '3px 0 0' }}>
            {promo.sub}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'ctaPulse 3s ease-in-out infinite',
      }}>
        <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,.12)' }} />
        <span style={{ color: 'rgba(255,255,255,.22)', fontSize: 11, letterSpacing: 2 }}>
          TOUCHEZ L'ÉCRAN POUR DÉMARRER
        </span>
        <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,.12)' }} />
      </div>

      {/* Dots footer */}
      <div style={{ position: 'absolute', bottom: 20, display: 'flex', gap: 6 }}>
        {[0, .35, .7].map((d, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'rgba(217,120,45,.4)',
            animation: `pulseIdle 2.2s ease-in-out ${d}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
