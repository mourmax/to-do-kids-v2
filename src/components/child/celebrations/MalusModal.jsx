'use client'

import './celebrations.css'

/* ============================================================
   TodoKids — MalusModal
   Modale malus challenge (challenge.status === "lost")
   Props: theme, childName, gender, malusText, onClose
   ============================================================ */

const KID_MALUS = {
  rainbow: {
    emoji: '😢',
    headline: 'Oh non, pas cette fois !',
    sub: 'Certaines missions n\'ont pas été accomplies…',
    rebond: 'Demain c\'est reparti, courage ! 🌈',
    colors: {
      bg: 'linear-gradient(160deg, #FF6B9D 0%, #c84b77 60%, #FFE66D 100%)',
      card: 'rgba(255,255,255,0.2)',
      text: '#fff',
      textMuted: 'rgba(255,255,255,0.7)',
      btn: 'rgba(255,255,255,0.25)',
      btnText: '#fff',
    },
    font: "'Nunito', sans-serif",
  },
  cosmos: {
    emoji: '🛸',
    headline: 'Mission échouée !',
    sub: 'La station spatiale attend ta prochaine tentative…',
    rebond: 'Nouvelle mission demain ! 🚀',
    colors: {
      bg: 'linear-gradient(160deg, #0F0C29 0%, #302B63 60%, #0F0C29 100%)',
      card: 'rgba(167,139,250,0.12)',
      text: '#e2e8f0',
      textMuted: 'rgba(226,232,240,0.6)',
      btn: 'rgba(167,139,250,0.25)',
      btnText: '#A78BFA',
    },
    font: "'Nunito', sans-serif",
  },
  champion: {
    emoji: '😤',
    headline: 'Pas cette fois !',
    sub: 'Les vrais champions tombent… et se relèvent !',
    rebond: 'Revanche demain, champion ! 🏆',
    colors: {
      bg: 'linear-gradient(160deg, #F7971E 0%, #e07a10 50%, #FFD200 100%)',
      card: 'rgba(255,255,255,0.2)',
      text: '#1a1a1a',
      textMuted: 'rgba(26,26,26,0.6)',
      btn: 'rgba(0,0,0,0.2)',
      btnText: '#fff',
    },
    font: "'Nunito', sans-serif",
  },
}

const ADO_MALUS = {
  boy: {
    emoji: '😤',
    headline: 'Bro, t\'as lâché',
    sub: 'La prochaine fois, prouve ce que tu vaux vraiment.',
    rebond: 'Mode revanche ON 💪',
  },
  girl: {
    emoji: '😤',
    headline: 'Aïe, c\'est raté cette fois',
    sub: 'La prochaine fois, tu vas tout déchirer, c\'est sûr.',
    rebond: 'Mode revanche activé 💅',
  },
}

export function MalusModal({ theme, childName, gender, malusText, onClose }) {
  const isAdo = theme === 'ado'

  // Config selon le thème
  const cfg = isAdo ? null : (KID_MALUS[theme] ?? KID_MALUS.rainbow)
  const adoCfg = isAdo ? (ADO_MALUS[gender] ?? ADO_MALUS.boy) : null

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {isAdo
        ? <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />
        : <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet" />
      }

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: isAdo ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          animation: isAdo ? 'blackIn 0.3s ease both' : 'backdropIn 0.3s ease both',
        }}
      />

      {/* Teardrop particles for kid */}
      {!isAdo && ['💧', '😢', '💧'].map((emoji, i) => (
        <span key={i} style={{
          position: 'fixed',
          top: 0,
          left: `${[25, 50, 75][i]}%`,
          zIndex: 1001,
          fontSize: 20,
          animation: `tearDrop 2s ease-in-out infinite`,
          animationDelay: `${i * 0.7}s`,
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
          alignItems: isAdo ? 'flex-end' : 'center',
          justifyContent: 'center',
          padding: isAdo ? 0 : '16px',
          fontFamily: isAdo ? "'Space Grotesk', sans-serif" : cfg.font,
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: isAdo ? undefined : 380,
          borderRadius: isAdo ? '28px 28px 0 0' : 28,
          overflow: 'hidden',
          background: isAdo
            ? 'linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 100%)'
            : cfg.colors.bg,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          animation: isAdo
            ? 'adoSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both'
            : 'shakeIn 0.5s ease both',
        }}>

          {isAdo && (
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '28px auto 0' }} />
          )}

          <div style={{ padding: isAdo ? '20px 24px 40px' : '32px 24px 24px' }}>
            {/* Emoji */}
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{
                fontSize: 58,
                display: 'block',
                animation: 'emojiBounce 2s ease-in-out infinite',
              }}>
                {isAdo ? adoCfg.emoji : cfg.emoji}
              </span>
            </div>

            {/* Text */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: isAdo ? 28 : 30,
                fontWeight: 900,
                color: isAdo ? '#fff' : cfg.colors.text,
                lineHeight: 1.2,
                marginBottom: 8,
                animation: isAdo
                  ? 'nameReveal 0.5s ease both'
                  : 'logoReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.1s',
                ...(isAdo && { animation: 'glitchRed 0.6s ease both' }),
              }}>
                {isAdo ? adoCfg.headline : cfg.headline}
              </div>
              <div style={{
                fontSize: 15,
                color: isAdo ? 'rgba(255,255,255,0.5)' : cfg.colors.textMuted,
                fontWeight: 600,
                lineHeight: 1.4,
                animation: 'fadeUp 0.4s ease both 0.3s',
              }}>
                {isAdo ? adoCfg.sub : `${childName}, ${cfg.sub}`}
              </div>
            </div>

            {/* Malus block */}
            {malusText && (
              <div style={{
                padding: '14px 18px',
                borderRadius: isAdo ? 10 : 16,
                background: isAdo ? 'rgba(255,60,172,0.1)' : cfg.colors.card,
                border: isAdo ? '1px solid rgba(255,60,172,0.25)' : 'none',
                marginBottom: 16,
                animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both 0.4s',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: isAdo ? '#FF3CAC' : cfg.colors.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 3,
                  marginBottom: 6,
                }}>
                  Malus
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isAdo ? '#fff' : cfg.colors.text,
                  lineHeight: 1.3,
                }}>
                  {malusText}
                </div>
              </div>
            )}

            {/* Rebond message */}
            <div style={{
              padding: '12px 16px',
              borderRadius: isAdo ? 10 : 14,
              background: isAdo ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.15)',
              marginBottom: 20,
              textAlign: 'center',
              animation: 'fadeUp 0.4s ease both 0.5s',
            }}>
              <div style={{
                fontSize: 15,
                fontWeight: 700,
                color: isAdo ? 'rgba(255,255,255,0.7)' : cfg.colors.text,
              }}>
                {isAdo ? adoCfg.rebond : cfg.rebond}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: isAdo ? 12 : 16,
                background: isAdo ? 'linear-gradient(135deg, #FF3CAC, #784BA0)' : cfg.colors.btn,
                color: isAdo ? '#fff' : cfg.colors.btnText,
                fontSize: 15,
                fontWeight: 900,
                fontFamily: isAdo ? "'Space Grotesk', sans-serif" : cfg.font,
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 2,
                animation: 'fadeUp 0.4s ease both 0.6s',
              }}
            >
              {isAdo ? 'COMPRIS 💪' : 'OK, DEMAIN C\'EST MON TOUR ! 💪'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
