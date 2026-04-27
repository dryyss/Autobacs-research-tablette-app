'use client'

import { useEffect, useMemo, useState } from 'react'
import { AutobacsLoader, DEFAULT_POOL, type AnimationId } from './AutobacsLoader'

interface Props {
  onWake?: () => void
  centre?: string
  idleAfter?: number  // ms, défaut 90 000 (90s)
  /** Mode preview : si défini, ouvre l'écran avec cette animation (bypasse le timer) */
  preview?: AnimationId | null
  /** Callback de fermeture en mode preview */
  onClosePreview?: () => void
}

const PROMOS = [
  { icon: '💡', label: 'Ampoules',       sub: '2 achetées, la 3e offerte' },
  { icon: '🔋', label: 'Batteries',      sub: 'Reprise ancienne batterie gratuite' },
  { icon: '🛢', label: 'Huiles',         sub: '5W-30 5L à partir de 29,90 €' },
  { icon: '🌧', label: 'Essuie-glaces',  sub: 'Montage offert ce week-end' },
  { icon: '⚫', label: 'Pneus',          sub: '4 achetés = équilibrage inclus' },
  { icon: '🛠', label: 'Kit révision',   sub: '-20% sur les kits 3 filtres' },
  { icon: '🧰', label: 'Freinage',       sub: 'Plaquettes + disques avant -15%' },
  { icon: '❄️', label: 'Préparez l\'hiver', sub: 'Pneus 4 saisons disponibles' },
]

// Animations exclues du tirage IdleScreen (rendu jugé non satisfaisant en plein écran)
const IDLE_EXCLUDED: AnimationId[] = ['watercolor']

// Pool effectif pour l'idle (DEFAULT_POOL moins les exclusions)
const IDLE_POOL: AnimationId[] = DEFAULT_POOL.filter(id => !IDLE_EXCLUDED.includes(id))

// Mémoire module-scope pour éviter de tirer 2 fois la même animation à la suite
let lastIdleAnim: AnimationId | null = null

function pickIdleAnim(): AnimationId {
  const candidates = IDLE_POOL.filter(id => id !== lastIdleAnim)
  const pool = candidates.length > 0 ? candidates : IDLE_POOL
  const picked = pool[Math.floor(Math.random() * pool.length)]
  lastIdleAnim = picked
  return picked
}

interface IdleTheme {
  bg: string                 // fond global (couleur ou gradient)
  textPrimary: string        // titre principal (Trouvez vos pièces auto)
  textSecondary: string      // sous-titre, infos
  accent: string             // CTA, séparateurs, libellés promo
  cornerColor: string        // bordures des 4 coins
  scanColor: string          // ligne scan
  glowColor: string          // glow central radial
  promoBg: string            // bandeau promo
  promoBorder: string
  headerBorder: string       // séparateur sous le header
  /** Filtre CSS sur le logo MAGAR (le logo Autobacs garde toujours ses vraies couleurs).
   *  Sur les thèmes sombres, on inverse le logo bleu foncé pour qu'il reste lisible. */
  magarFilter?: string
}

const THEMES: Record<AnimationId, IdleTheme> = {
  // ── Basiques : style Autobacs jour (fond clair, orange) ──────────────
  'pulse-wave': themeLight(),
  'fan-scan':   themeLight(),
  'stagger':    themeLight(),

  // ── Magar : papier sumi-e, encre ocre ─────────────────────────────────
  'sumi':        themeSumi(),
  'calligraphy': themeSumi(),
  'fan':         themeSumi(),
  'spiral':      themeSumi(),
  'live':        themeSumi(),

  // ── Aurora : nuit boréale ─────────────────────────────────────────────
  'aurora': {
    bg: 'linear-gradient(135deg, #0c1a2e 0%, #1a2f4d 60%, #2a1845 100%)',
    textPrimary: '#F0F4FF',
    textSecondary: 'rgba(240,244,255,.62)',
    accent: '#7DD3FC',
    cornerColor: 'rgba(125,211,252,.45)',
    scanColor: 'rgba(125,211,252,.22)',
    glowColor: 'rgba(125,211,252,0.12)',
    promoBg: 'rgba(125,211,252,.08)',
    promoBorder: 'rgba(125,211,252,.28)',
    headerBorder: 'rgba(125,211,252,.12)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },

  // ── Fireflies : nuit dorée des lucioles ───────────────────────────────
  'fireflies': {
    bg: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0e1a 100%)',
    textPrimary: '#F5EFD8',
    textSecondary: 'rgba(245,239,216,.55)',
    accent: '#FBBF24',
    cornerColor: 'rgba(251,191,36,.45)',
    scanColor: 'rgba(251,191,36,.18)',
    glowColor: 'rgba(251,191,36,0.1)',
    promoBg: 'rgba(251,191,36,.08)',
    promoBorder: 'rgba(251,191,36,.28)',
    headerBorder: 'rgba(251,191,36,.12)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },

  // ── Watercolor : aquarelle pastel rosée ───────────────────────────────
  'watercolor': {
    bg: 'linear-gradient(135deg, #fdf2f5 0%, #f5e8dc 60%, #e8dcf0 100%)',
    textPrimary: '#3a2840',
    textSecondary: 'rgba(58,40,64,.6)',
    accent: '#c2407a',
    cornerColor: 'rgba(194,64,122,.45)',
    scanColor: 'rgba(194,64,122,.16)',
    glowColor: 'rgba(194,64,122,0.08)',
    promoBg: 'rgba(194,64,122,.07)',
    promoBorder: 'rgba(194,64,122,.25)',
    headerBorder: 'rgba(58,40,64,.1)',
  },

  // ── Constellation : ciel étoilé bleu nuit ─────────────────────────────
  'constellation': {
    bg: 'radial-gradient(ellipse at center, #0d1832 0%, #050a1a 100%)',
    textPrimary: '#E8EFFF',
    textSecondary: 'rgba(232,239,255,.55)',
    accent: '#A5B4FC',
    cornerColor: 'rgba(165,180,252,.45)',
    scanColor: 'rgba(165,180,252,.18)',
    glowColor: 'rgba(165,180,252,0.1)',
    promoBg: 'rgba(165,180,252,.08)',
    promoBorder: 'rgba(165,180,252,.28)',
    headerBorder: 'rgba(165,180,252,.12)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },

  // ── Ember : braise chaude ─────────────────────────────────────────────
  'ember': {
    bg: 'radial-gradient(ellipse at center, #2a0e08 0%, #140604 100%)',
    textPrimary: '#FFE4D0',
    textSecondary: 'rgba(255,228,208,.55)',
    accent: '#FB923C',
    cornerColor: 'rgba(251,146,60,.5)',
    scanColor: 'rgba(251,146,60,.2)',
    glowColor: 'rgba(251,146,60,0.14)',
    promoBg: 'rgba(251,146,60,.1)',
    promoBorder: 'rgba(251,146,60,.3)',
    headerBorder: 'rgba(251,146,60,.14)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },

  // ── Rain : pluie sur étang bleu nuit ──────────────────────────────────
  'rain': {
    bg: 'linear-gradient(180deg, #0a1825 0%, #0d2030 100%)',
    textPrimary: '#E0EBF5',
    textSecondary: 'rgba(224,235,245,.55)',
    accent: '#67E8F9',
    cornerColor: 'rgba(103,232,249,.45)',
    scanColor: 'rgba(103,232,249,.18)',
    glowColor: 'rgba(103,232,249,0.1)',
    promoBg: 'rgba(103,232,249,.07)',
    promoBorder: 'rgba(103,232,249,.28)',
    headerBorder: 'rgba(103,232,249,.12)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },

  // ── Lantern : lanternes rouges sur fond noir ──────────────────────────
  'lantern': {
    bg: 'radial-gradient(ellipse at center, #1f0a0a 0%, #0c0404 100%)',
    textPrimary: '#FFE8D0',
    textSecondary: 'rgba(255,232,208,.55)',
    accent: '#F87171',
    cornerColor: 'rgba(248,113,113,.5)',
    scanColor: 'rgba(248,113,113,.18)',
    glowColor: 'rgba(248,113,113,0.12)',
    promoBg: 'rgba(248,113,113,.08)',
    promoBorder: 'rgba(248,113,113,.3)',
    headerBorder: 'rgba(248,113,113,.14)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },

  // ── Incense : encens, fumée violette ──────────────────────────────────
  'incense': {
    bg: 'linear-gradient(180deg, #14141a 0%, #1a1428 100%)',
    textPrimary: '#EDE6F5',
    textSecondary: 'rgba(237,230,245,.55)',
    accent: '#C4B5FD',
    cornerColor: 'rgba(196,181,253,.42)',
    scanColor: 'rgba(196,181,253,.18)',
    glowColor: 'rgba(196,181,253,0.1)',
    promoBg: 'rgba(196,181,253,.08)',
    promoBorder: 'rgba(196,181,253,.28)',
    headerBorder: 'rgba(196,181,253,.12)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },

  // ── Stardust : poussière d'étoiles violet/rose ────────────────────────
  'stardust': {
    bg: 'radial-gradient(ellipse at center, #1a0f2e 0%, #050214 100%)',
    textPrimary: '#F0E5FF',
    textSecondary: 'rgba(240,229,255,.55)',
    accent: '#F0ABFC',
    cornerColor: 'rgba(240,171,252,.45)',
    scanColor: 'rgba(240,171,252,.18)',
    glowColor: 'rgba(240,171,252,0.1)',
    promoBg: 'rgba(240,171,252,.07)',
    promoBorder: 'rgba(240,171,252,.28)',
    headerBorder: 'rgba(240,171,252,.12)',
    magarFilter: 'invert(1) brightness(1.3) saturate(1.1)',
  },
}

function themeLight(): IdleTheme {
  return {
    bg: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: 'rgba(26,26,26,.5)',
    accent: '#D9782D',
    cornerColor: 'rgba(217,120,45,.45)',
    scanColor: 'rgba(217,120,45,.18)',
    glowColor: 'rgba(217,120,45,0.08)',
    promoBg: 'rgba(217,120,45,.07)',
    promoBorder: 'rgba(217,120,45,.22)',
    headerBorder: 'rgba(0,0,0,.06)',
  }
}

function themeSumi(): IdleTheme {
  return {
    bg: 'linear-gradient(135deg, #fdf9f0 0%, #f5ede0 100%)',
    textPrimary: '#1f1a14',
    textSecondary: 'rgba(31,26,20,.55)',
    accent: '#a85820',
    cornerColor: 'rgba(168,88,32,.42)',
    scanColor: 'rgba(168,88,32,.16)',
    glowColor: 'rgba(168,88,32,0.07)',
    promoBg: 'rgba(168,88,32,.06)',
    promoBorder: 'rgba(168,88,32,.25)',
    headerBorder: 'rgba(31,26,20,.1)',
  }
}

export default function IdleScreen({
  onWake,
  centre = 'Herblay',
  idleAfter = 90_000,
  preview = null,
  onClosePreview,
}: Props) {
  const [visible, setVisible]     = useState(false)
  const [promoIdx, setPromoIdx]   = useState(0)
  const [time, setTime]           = useState('')
  // Animation tirée pour le cycle d'idle courant — null tant que l'idle n'est pas affiché
  const [animId, setAnimId]       = useState<AnimationId | null>(null)

  const isPreview = preview != null

  // En mode preview : ouvre immédiatement avec l'animation forcée, bypasse le timer
  useEffect(() => {
    if (isPreview) {
      setVisible(true)
      setAnimId(preview)
    }
  }, [preview, isPreview])

  // Tirage aléatoire d'une animation (et donc d'un thème) à chaque entrée en idle.
  // Désactivé en preview (animId est déjà imposé ci-dessus).
  useEffect(() => {
    if (visible && !isPreview) setAnimId(pickIdleAnim())
  }, [visible, isPreview])

  const theme = useMemo<IdleTheme>(
    () => (animId ? THEMES[animId] : themeLight()),
    [animId],
  )

  // Horloge live
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  // Rotation promos toutes les 3,5s (uniquement quand visible)
  useEffect(() => {
    if (!visible) return
    const t = setInterval(() => setPromoIdx(i => (i + 1) % PROMOS.length), 3500)
    return () => clearInterval(t)
  }, [visible])

  // Dès que l'idle devient visible (timeout d'inactivité atteint), on reset la session :
  // plaque, véhicule et recherches en cours sont effacés via onWake (KioskLayout l'appelle).
  // Pas de reset en mode preview.
  useEffect(() => {
    if (visible && !isPreview) onWake?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  // Timer inactivité — reset sur chaque interaction. Désactivé en preview.
  useEffect(() => {
    if (isPreview) return
    let timer: ReturnType<typeof setTimeout>

    const armTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setVisible(true), idleAfter)
    }

    // Réarme simplement le timer à chaque interaction, SANS déclencher onWake
    // (onWake n'est appelé que lorsque l'écran d'idle est réellement visible — voir onClick du wrapper).
    const handleActivity = () => armTimer()

    document.addEventListener('touchstart', handleActivity)
    document.addEventListener('click', handleActivity)
    document.addEventListener('keydown', handleActivity)
    armTimer()

    return () => {
      clearTimeout(timer)
      document.removeEventListener('touchstart', handleActivity)
      document.removeEventListener('click', handleActivity)
      document.removeEventListener('keydown', handleActivity)
    }
  }, [idleAfter, isPreview])

  if (!visible || !animId) return null

  const promo = PROMOS[promoIdx]

  return (
    <div
      onClick={() => {
        setVisible(false)
        if (isPreview) onClosePreview?.()
        else onWake?.()
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: theme.bg, cursor: 'pointer',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fadeInIdle .6s ease forwards',
        transition: 'background .8s ease',
      }}
    >
      <style>{`
        @keyframes fadeInIdle { from{opacity:0} to{opacity:1} }
        @keyframes floatIdle  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ticker     { 0%{opacity:0;transform:translateY(10px)} 12%,88%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-8px)} }
        @keyframes scanIdle   { 0%{top:0;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes pulseIdle  { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes glowIdle   { 0%,100%{opacity:.25} 50%{opacity:.55} }
        @keyframes ctaPulse   { 0%,100%{opacity:.75} 50%{opacity:1} }

        /* On retire le fond cream du loader pour que le thème de l'IdleScreen passe à travers */
        [data-idle-loader] [role="status"] {
          background: transparent !important;
          min-height: 0 !important;
          padding: 0 !important;
        }

        /* Aurora : on neutralise le cycle de couleurs du logo (magenta/violet/cyan) pour garder
           l'orange Autobacs. L'effet aurora reste via le drop-shadow et l'overlay glow. */
        [data-idle-loader] [role="status"][data-variant="aurora"] svg path[data-element="wave"],
        [data-idle-loader] [role="status"][data-variant="aurora"] svg path[data-element="seal"] {
          fill: #d9782d !important;
        }
      `}</style>

      {/* Badge preview — affiche l'ID de l'animation en cours (mode debug uniquement) */}
      {isPreview && (
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          background: theme.accent, color: '#fff',
          padding: '6px 14px', borderRadius: 999,
          fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,.25)',
        }}>
          {animId} · cliquez pour fermer
        </div>
      )}

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: theme.scanColor,
        animation: 'scanIdle 4s linear infinite',
      }} />

      {/* Glow central */}
      <div style={{
        position: 'absolute', width: 420, height: 420, borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.glowColor}, transparent 65%)`,
        animation: 'glowIdle 4s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Coins */}
      {([
        { top: 20, left: 20,    borderTop:    `1px solid ${theme.cornerColor}`, borderLeft:  `1px solid ${theme.cornerColor}` },
        { top: 20, right: 20,   borderTop:    `1px solid ${theme.cornerColor}`, borderRight: `1px solid ${theme.cornerColor}` },
        { bottom: 20, left: 20, borderBottom: `1px solid ${theme.cornerColor}`, borderLeft:  `1px solid ${theme.cornerColor}` },
        { bottom: 20, right: 20,borderBottom: `1px solid ${theme.cornerColor}`, borderRight: `1px solid ${theme.cornerColor}` },
      ] as React.CSSProperties[]).map((s, i) => (
        <div key={i} style={{ position: 'absolute', width: 22, height: 22, ...s }} />
      ))}

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px', borderBottom: `1px solid ${theme.headerBorder}`,
      }}>
        <img
          src="/autobacs-logo.svg"
          alt="Autobacs"
          style={{ height: 26, objectFit: 'contain' }}
        />
        <div style={{ color: theme.textSecondary, fontSize: 11, letterSpacing: 2 }}>
          {centre.toUpperCase()} · BORNE PRODUIT
        </div>
        <div style={{ color: theme.textPrimary, fontSize: 17, fontWeight: 600, letterSpacing: 1, fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </div>
      </div>

      {/* AutobacsLoader — animation aléatoire (forcée pour que IdleScreen connaisse l'ID) */}
      <div
        data-idle-loader
        style={{
          marginBottom: 38,
          animation: 'floatIdle 4s ease-in-out infinite',
        }}
      >
        <AutobacsLoader force={animId} size="lg" fullHeight={false} />
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <p style={{ color: theme.textPrimary, fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -.5 }}>
          Trouvez vos pièces auto
        </p>
        <p style={{ color: theme.textSecondary, fontSize: 13, margin: '10px 0 0', letterSpacing: .3 }}>
          Entrez votre plaque pour commencer
        </p>
      </div>

      {/* Promo rotative */}
      <div
        key={promoIdx}
        style={{
          background: theme.promoBg, border: `1px solid ${theme.promoBorder}`,
          borderRadius: 14, padding: '13px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 38, minWidth: 280,
          animation: 'ticker .4s ease forwards',
        }}
      >
        <span style={{ fontSize: 22 }}>{promo.icon}</span>
        <div>
          <p style={{ color: theme.accent, fontSize: 11, fontWeight: 700, letterSpacing: .5, textTransform: 'uppercase', margin: 0 }}>
            {promo.label}
          </p>
          <p style={{ color: theme.textSecondary, fontSize: 13, fontWeight: 600, margin: '3px 0 0' }}>
            {promo.sub}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        animation: 'ctaPulse 2s ease-in-out infinite',
      }}>
        <div style={{ width: 32, height: 2, background: theme.accent }} />
        <span style={{
          color: theme.accent,
          fontSize: 15,
          letterSpacing: 2.5,
          fontWeight: 700,
        }}>
          TOUCHEZ L&apos;ÉCRAN POUR DÉMARRER
        </span>
        <div style={{ width: 32, height: 2, background: theme.accent }} />
      </div>

      {/* Logo MAGAR + dots footer */}
      <div style={{ position: 'absolute', bottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <img
          src="/colored-logo-magar-dev.svg?v=2"
          alt="MAGAR Développement"
          style={{ height: 52, width: 'auto', opacity: 0.85, filter: theme.magarFilter }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, .35, .7].map((d, i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: theme.accent, opacity: .55,
              animation: `pulseIdle 2.2s ease-in-out ${d}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
