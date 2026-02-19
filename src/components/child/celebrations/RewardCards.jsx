'use client'

import './celebrations.css'

/* ============================================================
   TodoKids — RewardCards
   Cartes de récompense dans la modale victoire (challenge won)
   RainbowRewardCard, CosmosRewardCard, ChampionRewardCard
   ============================================================ */

// ── RainbowRewardCard ─────────────────────────────────────────
export function RainbowRewardCard({ rewardText, childName }) {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 24,
      overflow: 'hidden',
      padding: '28px 24px',
      background: 'linear-gradient(135deg, #FF6B9D, #FFE66D, #4ECDC4)',
      boxShadow: '0 8px 40px rgba(255,107,157,0.45)',
      animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      {/* Sparkles */}
      {['✨', '💫', '⭐'].map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          fontSize: 20,
          top: `${[10, 20, 8][i]}%`,
          right: `${[8, 18, 30][i]}%`,
          animation: `starLight ${1 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.3}s`,
        }}>{s}</span>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
        <span style={{ fontSize: 52, animation: 'giftBounce 2s ease-in-out infinite' }}>🎁</span>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 }}>
            Ta récompense, {childName} !
          </div>
          <div style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            lineHeight: 1.3,
          }}>
            {rewardText}
          </div>
        </div>

        {/* Shimmer bar */}
        <div style={{ width: '80%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.3)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.8), rgba(255,255,255,0.1))',
            backgroundSize: '200% 100%',
            animation: 'barShimmer 1.5s linear infinite',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── CosmosRewardCard ──────────────────────────────────────────
export function CosmosRewardCard({ rewardText, childName }) {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      padding: '28px 24px',
      background: 'linear-gradient(135deg, #0F0C29, #302B63)',
      border: '1px solid rgba(167,139,250,0.4)',
      boxShadow: '0 8px 40px rgba(167,139,250,0.3)',
      animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      {/* Scan line */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #A78BFA, transparent)',
        animation: 'scanLine 3s linear infinite',
        opacity: 0.5,
      }} />

      {/* Holo border */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 20,
        border: '2px solid #A78BFA',
        animation: 'holoBorder 3s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* Stars */}
      {['⭐', '🌟', '💫'].map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          fontSize: 18,
          top: `${[12, 22, 6][i]}%`,
          right: `${[6, 20, 35][i]}%`,
          animation: `starLight ${1.2 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }}>{s}</span>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 50, animation: 'capsuleLand 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>🛸</span>

        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6 }}>
            Mission accomplie, {childName} !
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.35,
            textShadow: '0 0 20px rgba(167,139,250,0.5)',
          }}>
            {rewardText}
          </div>
        </div>

        <div style={{ width: '80%', height: 4, borderRadius: 2, background: 'rgba(167,139,250,0.2)', overflow: 'hidden' }}>
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

// ── ChampionRewardCard ────────────────────────────────────────
export function ChampionRewardCard({ rewardText, childName }) {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
      padding: '28px 24px',
      background: 'linear-gradient(135deg, #F7971E, #FFD200)',
      boxShadow: '0 8px 40px rgba(247,151,30,0.5)',
      animation: 'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      {/* Epic glow */}
      <div style={{
        position: 'absolute',
        inset: -4,
        borderRadius: 24,
        animation: 'epicPulse 2s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Medal shine */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0, width: '40%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
        transform: 'skewX(-20deg)',
        animation: 'medalShine 2.5s linear infinite',
      }} />

      {['🏆', '⭐', '💥'].map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          fontSize: 20,
          top: `${[10, 18, 5][i]}%`,
          right: `${[8, 22, 38][i]}%`,
          animation: `championFlash ${1 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.25}s`,
        }}>{s}</span>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 52, animation: 'medalDrop 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}>🥇</span>

        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(90,50,0,0.6)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 }}>
            Champion {childName} !
          </div>
          <div style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#1a1a1a',
            lineHeight: 1.3,
          }}>
            {rewardText}
          </div>
        </div>

        <div style={{ width: '80%', height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #fff6, #fff, #fff6)',
            backgroundSize: '200% 100%',
            animation: 'barShimmer 1.5s linear infinite',
          }} />
        </div>
      </div>
    </div>
  )
}
