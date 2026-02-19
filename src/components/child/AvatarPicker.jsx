'use client'

import { useRef } from 'react'
import AvatarDisplay from './AvatarDisplay'

/* ============================================================
   TodoKids — AvatarPicker
   Grille d'emojis + upload photo
   Props: universeKey, currentAvatar, onSelect, onBack
   ============================================================ */

const AVATARS = [
  '🦁', '🐯', '🦊', '🐻', '🐼',
  '🐨', '🦄', '🐸', '🐙', '🦋',
  '🦅', '🐬', '🦕', '🦖', '🐺',
  '🦝', '🐮', '🐷', '🦓', '🐘',
]

const THEME = {
  rainbow:  { bg: 'linear-gradient(160deg,#FF6B9D,#FFE66D,#4ECDC4)', primary: '#FF6B9D', text: '#fff', font: "'Nunito', sans-serif" },
  cosmos:   { bg: 'linear-gradient(160deg,#0F0C29,#302B63,#24243E)', primary: '#A78BFA', text: '#e2e8f0', font: "'Nunito', sans-serif" },
  champion: { bg: 'linear-gradient(160deg,#F7971E,#FFD200)',          primary: '#B45309', text: '#1a1a1a', font: "'Nunito', sans-serif" },
  ado:      { bg: 'linear-gradient(160deg,#0d0d0d,#1a1a2e)',          primary: '#FF3CAC', text: '#fff',    font: "'Space Grotesk', sans-serif" },
}

export default function AvatarPicker({ universeKey, currentAvatar, onSelect, onBack }) {
  const fileRef = useRef(null)
  const t = THEME[universeKey] ?? THEME.rainbow

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onSelect({ type: 'photo', src: ev.target.result })
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {universeKey === 'ado'
        ? <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet" />
        : <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet" />
      }

      <div style={{
        minHeight: '100dvh',
        background: t.bg,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: t.font,
        padding: '0 0 32px',
      }}>
        {/* Header */}
        <div style={{ padding: '48px 24px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}
            aria-label="Retour"
          >
            ←
          </button>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: t.text, margin: 0 }}>
              Choisis ton avatar
            </h1>
            <p style={{ fontSize: 14, color: t.text, opacity: 0.65, margin: '4px 0 0' }}>
              Emoji ou ta propre photo
            </p>
          </div>
        </div>

        {/* Current avatar preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <AvatarDisplay
            avatar={currentAvatar}
            size={90}
            style={{ border: `4px solid rgba(255,255,255,0.5)`, boxShadow: '0 8px 30px rgba(0,0,0,0.25)' }}
          />
        </div>

        {/* Upload photo */}
        <div style={{ padding: '0 20px 16px' }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              border: `2px dashed rgba(255,255,255,0.5)`,
              color: t.text,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: t.font,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span>📷</span>
            <span>Utiliser ma photo</span>
          </button>
        </div>

        {/* Emoji grid */}
        <div style={{ padding: '0 20px', flex: 1 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: t.text,
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 12,
          }}>
            Ou choisis un emoji
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}>
            {AVATARS.map((emoji) => {
              const isSelected = currentAvatar?.type === 'emoji' && currentAvatar?.value === emoji
              return (
                <button
                  key={emoji}
                  onClick={() => onSelect({ type: 'emoji', value: emoji })}
                  style={{
                    height: 60,
                    borderRadius: 16,
                    border: isSelected ? `3px solid rgba(255,255,255,0.9)` : '3px solid transparent',
                    background: isSelected
                      ? 'rgba(255,255,255,0.35)'
                      : 'rgba(255,255,255,0.15)',
                    fontSize: 28,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.1s',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
                  }}
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        </div>

        {/* Confirm */}
        {currentAvatar && (
          <div style={{ padding: '24px 20px 0' }}>
            <button
              onClick={() => onSelect(currentAvatar)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 18,
                background: t.primary,
                color: '#fff',
                fontSize: 16,
                fontWeight: 900,
                fontFamily: t.font,
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: 2,
                boxShadow: `0 6px 24px rgba(0,0,0,0.25)`,
              }}
            >
              C&apos;est mon avatar ! ✅
            </button>
          </div>
        )}
      </div>
    </>
  )
}
