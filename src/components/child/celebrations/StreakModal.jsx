'use client'

import './celebrations.css'
import { RainbowStreak, CosmosStreak, ChampionStreak, AdoStreak } from './StreakAnimations'

/* ============================================================
   TodoKids — StreakModal
   Exports: KidModal (rainbow/cosmos/champion), AdoModal
   Déclenché quand toutes les missions du jour sont done.
   ============================================================ */

const KID_CONFIG = {
  rainbow: {
    bg: 'linear-gradient(160deg, #FF6B9D 0%, #FFE66D 50%, #4ECDC4 100%)',
    cardBg: 'rgba(255,255,255,0.92)',
    titleColor: '#FF6B9D',
    textColor: '#333',
    closeBg: '#FF6B9D',
    title: 'INCROYABLE !',
    subtitle: 'Tu es une vraie star ! 🌟',
    StreakComp: RainbowStreak,
  },
  cosmos: {
    bg: 'linear-gradient(160deg, #0F0C29 0%, #302B63 60%, #24243E 100%)',
    cardBg: 'rgba(167,139,250,0.12)',
    titleColor: '#A78BFA',
    textColor: '#e2e8f0',
    closeBg: '#A78BFA',
    title: 'COSMIQUE !',
    subtitle: 'Tu conquiers l\'univers ! 🚀',
    StreakComp: CosmosStreak,
  },
  champion: {
    bg: 'linear-gradient(160deg, #F7971E 0%, #FFD200 100%)',
    cardBg: 'rgba(255,255,255,0.92)',
    titleColor: '#B45309',
    textColor: '#1a1a1a',
    closeBg: '#B45309',
    title: 'CHAMPION !',
    subtitle: 'Tu domines le terrain ! 🏆',
    StreakComp: ChampionStreak,
  },
}

// ── KidModal — universe rainbow / cosmos / champion ───────────
export function KidModal({ universeKey, childName, streak, onClose }) {
  const cfg = KID_CONFIG[universeKey] ?? KID_CONFIG.rainbow
  const StreakComp = cfg.StreakComp

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet" />

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(6px)',
          animation: 'backdropIn 0.3s ease both',
        }}
      />

      {/* Particles */}
      {['🌟', '✨', '💫', '⭐', '🎉', '🎊'].map((emoji, i) => (
        <span key={i} style={{
          position: 'fixed',
          top: -30,
          left: `${(i + 1) * 14}%`,
          zIndex: 1001,
          fontSize: 22,
          animation: `particleFall ${2.5 + i * 0.4}s linear infinite`,
          animationDelay: `${i * 0.5}s`,
          pointerEvents: 'none',
        }}>{emoji}</span>
      ))}

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          borderRadius: 32,
          overflow: 'hidden',
          background: cfg.bg,
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          animation: 'modalBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
          fontFamily: "'Nunito', sans-serif",
          pointerEvents: 'all',
        }}>
          {/* Header */}
          <div style={{ padding: '32px 24px 16px', textAlign: 'center' }}>
            <div style={{
              fontSize: 13,
              fontWeight: 800,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              letterSpacing: 3,
              marginBottom: 8,
              animation: 'fadeUp 0.4s ease both 0.3s',
            }}>
              Bravo {childName} !
            </div>
            <div style={{
              fontSize: 40,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 3px 12px rgba(0,0,0,0.2)',
              lineHeight: 1,
              animation: 'logoReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.1s',
            }}>
              {cfg.title}
            </div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              marginTop: 8,
              animation: 'fadeUp 0.4s ease both 0.4s',
            }}>
              {cfg.subtitle}
            </div>
          </div>

          {/* Streak animation */}
          <div style={{ padding: '0 20px', animation: 'fadeUp 0.4s ease both 0.5s' }}>
            <StreakComp streak={streak} />
          </div>

          {/* Info card */}
          <div style={{
            margin: '16px 20px',
            padding: '16px 20px',
            borderRadius: 20,
            background: cfg.cardBg,
            textAlign: 'center',
            animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both 0.6s',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6, animation: 'emojiFloat 2s ease-in-out infinite' }}>🔥</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: cfg.textColor }}>
              {streak} jour{streak > 1 ? 's' : ''} consécutif{streak > 1 ? 's' : ''} !
            </div>
            <div style={{ fontSize: 12, color: cfg.textColor, opacity: 0.6, marginTop: 4 }}>
              Continue comme ça, tu es inarrêtable !
            </div>
          </div>

          {/* Close button */}
          <div style={{ padding: '0 20px 24px' }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 16,
                background: cfg.closeBg,
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                fontFamily: "'Nunito', sans-serif",
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                animation: 'fadeUp 0.4s ease both 0.7s',
              }}
            >
              SUPER ! 🎉
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── AdoModal — univers ado ────────────────────────────────────
export function AdoModal({ childName, gender, streak, onClose }) {
  const lines =
    gender === 'girl'
      ? [`${childName}, t'assures grave`, 'Toutes tes missions validées 💅', 'Streak en feu 🔥']
      : [`${childName}, bro t'es en feu`, 'Toutes tes missions validées 💪', 'Streak actif 🔥']

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)',
          animation: 'blackIn 0.3s ease both',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          display: 'flex', alignItems: 'flex-end',
          padding: '0',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div style={{
          width: '100%',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          background: 'linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 100%)',
          padding: '32px 24px 40px',
          animation: 'adoSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          {/* Drag handle */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 28px' }} />

          {/* Glitch title */}
          <div style={{
            fontSize: 38,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 6,
            animation: 'nameReveal 0.5s ease both',
          }}>
            {lines[0]}
          </div>
          <div style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 4,
            animation: 'fadeUp 0.4s ease both 0.2s',
          }}>
            {lines[1]}
          </div>
          <div style={{
            fontSize: 14,
            color: '#FF3CAC',
            fontWeight: 600,
            marginBottom: 28,
            animation: 'fadeUp 0.4s ease both 0.3s',
          }}>
            {lines[2]}
          </div>

          {/* Streak display */}
          <AdoStreak streak={streak} />

          {/* CTA */}
          <button
            onClick={onClose}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FF3CAC, #784BA0)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            LET&apos;S GO ⚡
          </button>
        </div>
      </div>
    </>
  )
}
