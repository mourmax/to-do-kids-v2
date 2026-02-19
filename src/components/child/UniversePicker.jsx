'use client'

/* ============================================================
   TodoKids — UniversePicker
   Écran de choix d'univers (4 options : rainbow, cosmos, champion, ado)
   Props: childName, onSelect
   ============================================================ */

const UNIVERSES = {
  rainbow: {
    key: 'rainbow',
    label: 'Arc-en-ciel',
    description: 'Coloré et magique ✨',
    emoji: '🌈',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFE66D 50%, #4ECDC4 100%)',
    textColor: '#fff',
    shadow: 'rgba(255,107,157,0.5)',
  },
  cosmos: {
    key: 'cosmos',
    label: 'Cosmos',
    description: 'Voyage dans les étoiles 🚀',
    emoji: '🚀',
    gradient: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    textColor: '#fff',
    shadow: 'rgba(167,139,250,0.5)',
  },
  champion: {
    key: 'champion',
    label: 'Champion',
    description: 'Le podium t\'attend 🏆',
    emoji: '🏆',
    gradient: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)',
    textColor: '#1a1a1a',
    shadow: 'rgba(247,151,30,0.5)',
  },
  ado: {
    key: 'ado',
    label: 'Mode Ado',
    description: 'Style & swag ⚡',
    emoji: '⚡',
    gradient: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
    textColor: '#fff',
    shadow: 'rgba(255,60,172,0.5)',
    adoBorder: true,
  },
}

export default function UniversePicker({ childName, onSelect }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px 32px',
        fontFamily: "'Nunito', sans-serif",
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 8px',
            lineHeight: 1.2,
          }}>
            Salut {childName} !
          </h1>
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            fontWeight: 600,
          }}>
            Choisis ton univers
          </p>
        </div>

        {/* Grid */}
        <div style={{
          width: '100%',
          maxWidth: 400,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          {Object.values(UNIVERSES).map((u) => (
            <button
              key={u.key}
              onClick={() => onSelect(u.key)}
              style={{
                position: 'relative',
                borderRadius: 24,
                padding: '24px 16px',
                background: u.gradient,
                border: u.adoBorder ? '2px solid rgba(255,60,172,0.5)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                boxShadow: `0 8px 32px ${u.shadow}`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)'
                e.currentTarget.style.boxShadow = `0 12px 40px ${u.shadow}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = `0 8px 32px ${u.shadow}`
              }}
              onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              <span style={{ fontSize: 42, lineHeight: 1 }}>{u.emoji}</span>
              <span style={{
                fontSize: 16,
                fontWeight: 900,
                color: u.textColor,
                textAlign: 'center',
                lineHeight: 1.1,
              }}>
                {u.label}
              </span>
              <span style={{
                fontSize: 12,
                color: u.textColor,
                opacity: 0.75,
                textAlign: 'center',
                lineHeight: 1.3,
                fontWeight: 600,
              }}>
                {u.description}
              </span>
            </button>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
          Tu pourras changer d&apos;univers plus tard
        </p>
      </div>
    </>
  )
}
