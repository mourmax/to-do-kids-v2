'use client'

import './celebrations.css'

/* ============================================================
   TodoKids — StreakAnimations
   Animations visuelles pour chaque univers dans la modale streak
   RainbowStreak, CosmosStreak, ChampionStreak, AdoStreak
   ============================================================ */

// ── Particules flottantes ──────────────────────────────────────
function FloatingParticle({ emoji, style }) {
  return (
    <span
      style={{
        position: 'absolute',
        fontSize: 24,
        animation: `particleFall ${2 + Math.random() * 3}s linear infinite`,
        animationDelay: `${Math.random() * 2}s`,
        ...style,
      }}
    >
      {emoji}
    </span>
  )
}

// ── RainbowStreak ─────────────────────────────────────────────
export function RainbowStreak({ streak }) {
  const particles = ['🌈', '⭐', '💫', '🎉', '✨', '🎊', '💖', '🌟']
  const positions = [5, 15, 28, 42, 57, 70, 83, 92]

  return (
    <div style={{ position: 'relative', height: 140, overflow: 'hidden', borderRadius: 20, background: 'linear-gradient(135deg, #FF6B9D22, #FFE66D22, #4ECDC422)' }}>
      {/* Floating particles */}
      {particles.map((emoji, i) => (
        <FloatingParticle
          key={i}
          emoji={emoji}
          style={{ left: `${positions[i]}%`, top: -20, animationDelay: `${i * 0.3}s` }}
        />
      ))}

      {/* Central display */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 48, animation: 'emojiBounce 1.8s ease-in-out infinite' }}>🌈</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 52,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #FF6B9D, #FFE66D, #4ECDC4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'streakWow 0.6s cubic-bezier(0.34,1.56,0.64,1) both, streakGlow 2s ease-in-out infinite 0.6s',
          }}>
            {streak}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#FF6B9D' }}>jour{streak > 1 ? 's' : ''}</span>
        </div>

        {/* Rainbow bar */}
        <div style={{ width: 120, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: '100%',
            borderRadius: 4,
            background: 'linear-gradient(90deg, #FF6B9D, #FFE66D, #4ECDC4)',
            backgroundSize: '200% 100%',
            animation: 'barShimmer 2s linear infinite',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── CosmosStreak ──────────────────────────────────────────────
export function CosmosStreak({ streak }) {
  const stars = ['⭐', '🌟', '💫', '🚀', '🛸', '🌙', '☄️', '🪐']
  const positions = [3, 14, 26, 40, 55, 68, 80, 91]

  return (
    <div style={{ position: 'relative', height: 140, overflow: 'hidden', borderRadius: 20, background: 'linear-gradient(135deg, #0F0C29, #302B63)' }}>
      {/* Star particles */}
      {stars.map((emoji, i) => (
        <FloatingParticle
          key={i}
          emoji={emoji}
          style={{ left: `${positions[i]}%`, top: -20, fontSize: 18, animationDelay: `${i * 0.35}s` }}
        />
      ))}

      {/* Scan line effect */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #A78BFA, #38BDF8, transparent)',
        animation: 'scanLine 3s linear infinite',
        opacity: 0.5,
      }} />

      {/* Central display */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 44, animation: 'capsuleLand 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>🚀</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#A78BFA',
            animation: 'streakWow 0.6s cubic-bezier(0.34,1.56,0.64,1) both, streakGlow 2s ease-in-out infinite 0.6s',
            textShadow: '0 0 20px #A78BFA',
          }}>
            {streak}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#38BDF8' }}>jour{streak > 1 ? 's' : ''}</span>
        </div>

        {/* Holo bar */}
        <div style={{ width: 120, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #A78BFA, #38BDF8, #A78BFA)',
            backgroundSize: '200% 100%',
            animation: 'barShimmer 2s linear infinite',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── ChampionStreak ────────────────────────────────────────────
export function ChampionStreak({ streak }) {
  const items = ['🏆', '⭐', '🥇', '💪', '🎯', '🏅', '🔥', '💥']
  const positions = [4, 16, 29, 43, 57, 71, 84, 94]

  return (
    <div style={{ position: 'relative', height: 140, overflow: 'hidden', borderRadius: 20, background: 'linear-gradient(135deg, #F7971E33, #FFD20033)' }}>
      {/* Particles */}
      {items.map((emoji, i) => (
        <FloatingParticle
          key={i}
          emoji={emoji}
          style={{ left: `${positions[i]}%`, top: -20, animationDelay: `${i * 0.28}s` }}
        />
      ))}

      {/* Central display */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ fontSize: 46, animation: 'championBadge 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>🏆</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 52,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #F7971E, #FFD200)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 100%',
            animation: 'streakWow 0.6s cubic-bezier(0.34,1.56,0.64,1) both, shimmerGold 2s linear infinite 0.6s',
          }}>
            {streak}
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#F7971E' }}>jour{streak > 1 ? 's' : ''}</span>
        </div>

        {/* Gold bar */}
        <div style={{ width: 120, height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #F7971E, #FFD200, #F7971E)',
            backgroundSize: '200% 100%',
            animation: 'barShimmer 1.8s linear infinite',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── AdoStreak ─────────────────────────────────────────────────
export function AdoStreak({ streak }) {
  return (
    <div style={{
      position: 'relative',
      height: 120,
      overflow: 'hidden',
      borderRadius: 12,
      background: 'rgba(255,60,172,0.08)',
      border: '1px solid rgba(255,60,172,0.2)',
    }}>
      {/* Glitch line */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, #FF3CAC, transparent)',
        animation: 'scanLine 2s linear infinite',
        opacity: 0.6,
      }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 32, animation: 'emojiPulse 1.5s ease-in-out infinite' }}>⚡</span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#FF3CAC',
              fontFamily: "'Space Grotesk', sans-serif",
              lineHeight: 1,
              animation: 'countLand 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>
              {streak}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: 2 }}>
              JOURS
            </span>
          </div>
          <div style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            fontFamily: "'Space Grotesk', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: 3,
            animation: 'labelSlide 0.5s ease both 0.3s',
          }}>
            STREAK EN COURS
          </div>
        </div>
      </div>
    </div>
  )
}
