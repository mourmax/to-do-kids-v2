'use client'

import './celebrations.css'
import { RainbowRewardCard, CosmosRewardCard, ChampionRewardCard } from './RewardCards'

/* ============================================================
   TodoKids — VictoryModal
   Modale victoire challenge (challenge.status === "won")
   Props: theme, childName, gender, rewardText, onClose
   ============================================================ */

const VICTORY_CONFIG = {
  rainbow: {
    bg: 'linear-gradient(160deg, #FF6B9D 0%, #c84b77 60%, #FFE66D 100%)',
    cardBg: 'rgba(255,255,255,0.15)',
    font: "'Nunito', sans-serif",
    title: 'CHALLENGE RÉUSSI !',
    sub: 'Tu as tenu jusqu\'au bout !',
    trophy: '🏆',
    particles: ['🌈', '⭐', '💫', '🎉', '✨', '🎊', '💖', '🌟', '🎁'],
    RewardCard: RainbowRewardCard,
    closeBg: 'rgba(255,255,255,0.25)',
    closeColor: '#fff',
    titleColor: '#fff',
  },
  cosmos: {
    bg: 'linear-gradient(160deg, #0F0C29 0%, #302B63 60%, #1a1040 100%)',
    cardBg: 'rgba(167,139,250,0.12)',
    font: "'Nunito', sans-serif",
    title: 'MISSION ACCOMPLIE !',
    sub: 'Tu as conquis l\'espace !',
    trophy: '🛸',
    particles: ['⭐', '🌟', '💫', '🚀', '☄️', '🪐', '🌙', '💎', '✨'],
    RewardCard: CosmosRewardCard,
    closeBg: 'rgba(167,139,250,0.25)',
    closeColor: '#A78BFA',
    titleColor: '#A78BFA',
  },
  champion: {
    bg: 'linear-gradient(160deg, #F7971E 0%, #e07a10 50%, #FFD200 100%)',
    cardBg: 'rgba(255,255,255,0.2)',
    font: "'Nunito', sans-serif",
    title: 'VICTOIRE TOTALE !',
    sub: 'Le podium t\'appartient !',
    trophy: '🥇',
    particles: ['🏆', '⭐', '🥇', '💪', '🎯', '🏅', '🔥', '💥', '👑'],
    RewardCard: ChampionRewardCard,
    closeBg: 'rgba(0,0,0,0.2)',
    closeColor: '#fff',
    titleColor: '#fff',
  },
  ado: {
    bg: 'linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 60%, #0d0d0d 100%)',
    cardBg: 'rgba(255,60,172,0.08)',
    font: "'Space Grotesk', sans-serif",
    title: 'CHALLENGE : WIN',
    sub: null,
    trophy: '⚡',
    particles: ['⚡', '🔥', '💥', '🎯', '💜', '✨'],
    RewardCard: null,
    closeBg: 'linear-gradient(135deg, #FF3CAC, #784BA0)',
    closeColor: '#fff',
    titleColor: '#FF3CAC',
  },
}

export function VictoryModal({ theme, childName, gender, rewardText, onClose }) {
  const cfg = VICTORY_CONFIG[theme] ?? VICTORY_CONFIG.rainbow
  const isAdo = theme === 'ado'
  const RewardCard = cfg.RewardCard

  const adoLine =
    gender === 'girl'
      ? `${childName}, t'as tout déchiré 💅`
      : `${childName}, t'as tout défoncé 💪`

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
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'backdropIn 0.3s ease both',
        }}
      />

      {/* Particles */}
      {cfg.particles.map((emoji, i) => (
        <span key={i} style={{
          position: 'fixed',
          top: -30,
          left: `${(i + 0.5) * (100 / cfg.particles.length)}%`,
          zIndex: 1001,
          fontSize: 22,
          animation: `particleFall ${2 + i * 0.35}s linear infinite`,
          animationDelay: `${i * 0.45}s`,
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
          fontFamily: cfg.font,
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: isAdo ? undefined : 400,
          borderRadius: isAdo ? '28px 28px 0 0' : 32,
          overflow: 'hidden',
          background: cfg.bg,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          animation: isAdo ? 'adoSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both' : 'modalBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>

          {/* Rays for kid themes */}
          {!isAdo && (
            <div style={{
              position: 'absolute',
              top: '15%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              animation: 'rayExpand 3s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}

          {isAdo && (
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '28px auto 0' }} />
          )}

          <div style={{ padding: isAdo ? '20px 24px 40px' : '32px 24px 24px' }}>
            {/* Trophy / emoji */}
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{
                fontSize: isAdo ? 48 : 60,
                display: 'block',
                animation: isAdo ? 'emojiPulse 1.5s ease-in-out infinite' : 'giftBounce 2s ease-in-out infinite',
              }}>
                {cfg.trophy}
              </span>
            </div>

            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                fontSize: isAdo ? 30 : 36,
                fontWeight: 900,
                color: cfg.titleColor,
                lineHeight: 1.1,
                animation: isAdo ? 'nameReveal 0.5s ease both' : 'logoReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) both 0.1s',
                ...(isAdo && { fontFamily: "'Space Grotesk', sans-serif" }),
              }}>
                {isAdo ? adoLine : cfg.title}
              </div>
              {cfg.sub && !isAdo && (
                <div style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 700,
                  marginTop: 6,
                  animation: 'fadeUp 0.4s ease both 0.3s',
                }}>
                  {cfg.sub}
                </div>
              )}
              {isAdo && (
                <div style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.45)',
                  marginTop: 6,
                  fontFamily: "'Space Grotesk', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  animation: 'fadeUp 0.4s ease both 0.2s',
                }}>
                  CHALLENGE TERMINÉ
                </div>
              )}
            </div>

            {/* Reward card (kid) or reward block (ado) */}
            {RewardCard && (
              <div style={{ marginBottom: 20, animation: 'fadeUp 0.5s ease both 0.5s' }}>
                <RewardCard rewardText={rewardText} childName={childName} />
              </div>
            )}

            {isAdo && rewardText && (
              <div style={{
                marginBottom: 20,
                padding: '16px 20px',
                borderRadius: 12,
                background: 'rgba(255,60,172,0.1)',
                border: '1px solid rgba(255,60,172,0.25)',
                animation: 'fadeUp 0.4s ease both 0.4s',
              }}>
                <div style={{ fontSize: 11, color: '#FF3CAC', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  TA RÉCOMPENSE
                </div>
                <div style={{ fontSize: 18, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                  {rewardText}
                </div>
              </div>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: isAdo ? 12 : 16,
                background: cfg.closeBg,
                color: cfg.closeColor,
                fontSize: 15,
                fontWeight: 900,
                fontFamily: cfg.font,
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: isAdo ? 3 : 2,
                animation: 'fadeUp 0.4s ease both 0.7s',
              }}
            >
              {isAdo ? 'TROP BIEN ⚡' : 'GÉNIAL ! 🎉'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
