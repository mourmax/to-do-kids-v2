'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../supabaseClient'
import AvatarDisplay from './AvatarDisplay'
import { KidModal, AdoModal } from './celebrations/StreakModal'
import { VictoryModal } from './celebrations/VictoryModal'
import { MalusModal } from './celebrations/MalusModal'

/* ============================================================
   TodoKids — ChildDashboard
   Layout kid (rainbow/cosmos/champion) ou ado.
   Reçoit les données depuis Supabase (passées en props par ChildApp).

   Props:
     profileId, childName, gender, universeKey, avatar,
     missions, streak, challenge, onMissionToggle, onEditAvatar
   ============================================================ */

// ── Config univers ─────────────────────────────────────────────
const UNIVERSES = {
  rainbow: {
    bg: 'linear-gradient(160deg, #FF6B9D 0%, #c84b77 40%, #FFE66D 100%)',
    cardBg: 'rgba(255,255,255,0.22)',
    cardBorder: 'rgba(255,255,255,0.35)',
    doneBg: 'rgba(255,255,255,0.35)',
    textPrimary: '#fff',
    textMuted: 'rgba(255,255,255,0.7)',
    checkBg: '#fff',
    checkColor: '#FF6B9D',
    streakBg: 'rgba(255,255,255,0.2)',
    challengeBg: 'rgba(255,255,255,0.15)',
    progressBar: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.6))',
    font: "'Nunito', sans-serif",
    fontLink: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap',
    labelDone: 'Validé par papa/maman ⏳',
    labelPending: 'En attente de validation',
  },
  cosmos: {
    bg: 'linear-gradient(160deg, #0F0C29 0%, #302B63 60%, #24243E 100%)',
    cardBg: 'rgba(167,139,250,0.1)',
    cardBorder: 'rgba(167,139,250,0.25)',
    doneBg: 'rgba(167,139,250,0.2)',
    textPrimary: '#e2e8f0',
    textMuted: 'rgba(226,232,240,0.55)',
    checkBg: '#A78BFA',
    checkColor: '#fff',
    streakBg: 'rgba(167,139,250,0.12)',
    challengeBg: 'rgba(56,189,248,0.1)',
    progressBar: 'linear-gradient(90deg, #A78BFA, #38BDF8)',
    font: "'Nunito', sans-serif",
    fontLink: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap',
    labelDone: '⏳ En attente de validation',
    labelPending: 'En orbite',
  },
  champion: {
    bg: 'linear-gradient(160deg, #F7971E 0%, #e07a10 50%, #FFD200 100%)',
    cardBg: 'rgba(255,255,255,0.22)',
    cardBorder: 'rgba(255,255,255,0.4)',
    doneBg: 'rgba(255,255,255,0.4)',
    textPrimary: '#1a1a1a',
    textMuted: 'rgba(26,26,26,0.6)',
    checkBg: '#B45309',
    checkColor: '#fff',
    streakBg: 'rgba(255,255,255,0.2)',
    challengeBg: 'rgba(255,255,255,0.18)',
    progressBar: 'linear-gradient(90deg, #B45309, #FFD200)',
    font: "'Nunito', sans-serif",
    fontLink: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap',
    labelDone: 'Validé ⏳',
    labelPending: 'En attente du coach',
  },
  ado: {
    bg: 'linear-gradient(160deg, #0d0d0d 0%, #1a1a2e 60%, #0d0d0d 100%)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    doneBg: 'rgba(255,60,172,0.08)',
    textPrimary: '#fff',
    textMuted: 'rgba(255,255,255,0.4)',
    checkBg: '#FF3CAC',
    checkColor: '#fff',
    streakBg: 'rgba(255,60,172,0.08)',
    challengeBg: 'rgba(120,75,160,0.15)',
    progressBar: 'linear-gradient(90deg, #FF3CAC, #784BA0)',
    font: "'Space Grotesk', sans-serif",
    fontLink: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap',
    labelDone: 'Validation en attente',
    labelPending: 'Pas encore validé',
  },
}

// ── Mission card (kid) ─────────────────────────────────────────
function KidMissionCard({ mission, u, onToggle, isToggling }) {
  const { t } = useTranslation()
  return (
    <div
      key={mission.id}
      style={{
        borderRadius: 20,
        padding: '16px 18px',
        background: mission.done ? u.doneBg : u.cardBg,
        border: `1.5px solid ${u.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: isToggling ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => !mission.done && onToggle(mission.id)}
        disabled={mission.done || isToggling}
        aria-label={mission.done ? 'Mission terminée' : 'Cocher la mission'}
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          border: `3px solid ${mission.done ? u.checkBg : 'rgba(255,255,255,0.5)'}`,
          background: mission.done ? u.checkBg : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: mission.done ? 'default' : 'pointer',
          flexShrink: 0,
          fontSize: 18,
          color: u.checkColor,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        {mission.done && '✓'}
      </button>

      {/* Icon + title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{mission.icon}</span>
          <span style={{
            fontSize: 15,
            fontWeight: 800,
            color: u.textPrimary,
            textDecoration: mission.done ? 'line-through' : 'none',
            opacity: mission.done ? 0.7 : 1,
          }}>
            {t(mission.title)}
          </span>
        </div>
        {mission.time && (
          <div style={{ fontSize: 12, color: u.textMuted, marginTop: 4, fontWeight: 600 }}>
            ⏰ {mission.time}
          </div>
        )}
        {mission.pendingValidation && (
          <div style={{ fontSize: 11, color: u.textMuted, marginTop: 3, fontWeight: 700 }}>
            {u.labelDone}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Mission row (ado) ──────────────────────────────────────────
function AdoMissionRow({ mission, u, onToggle, isToggling }) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${u.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: isToggling ? 0.7 : 1,
        transition: 'opacity 0.2s',
        background: mission.done ? u.doneBg : 'transparent',
      }}
    >
      <button
        onClick={() => !mission.done && onToggle(mission.id)}
        disabled={mission.done || isToggling}
        style={{
          width: 28, height: 28,
          borderRadius: 6,
          border: `2px solid ${mission.done ? u.checkBg : 'rgba(255,255,255,0.2)'}`,
          background: mission.done ? u.checkBg : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: mission.done ? 'default' : 'pointer',
          flexShrink: 0, fontSize: 14, color: u.checkColor,
        }}
      >
        {mission.done && '✓'}
      </button>

      <span style={{ fontSize: 18 }}>{mission.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: mission.done ? u.textMuted : u.textPrimary,
          textDecoration: mission.done ? 'line-through' : 'none',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {t(mission.title)}
        </div>
        {mission.time && (
          <div style={{ fontSize: 11, color: u.textMuted, marginTop: 2 }}>
            {mission.time}
          </div>
        )}
      </div>

      {mission.pendingValidation && (
        <div style={{
          fontSize: 10,
          color: '#FF3CAC',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontFamily: "'Space Grotesk', sans-serif",
          flexShrink: 0,
        }}>
          En attente
        </div>
      )}
    </div>
  )
}

// ── Circular countdown ring ─────────────────────────────────────
function CountdownRing({ seconds, total = 5, color = '#fff' }) {
  const r = 14
  const circ = 2 * Math.PI * r
  const offset = circ - (seconds / total) * circ
  return (
    <svg width={36} height={36} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={18} cy={18} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
      <circle cx={18} cy={18} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <text x={18} y={18} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={11} fontWeight={800}
        style={{ transform: 'rotate(90deg)', transformOrigin: '18px 18px' }}
      >{seconds}</text>
    </svg>
  )
}

// ── Day Complete Card — bouton avec countdown 5s ─────────────────
function DayCompleteCard({ isAdo, u, onAcknowledge, paused }) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); onAcknowledge(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onAcknowledge, paused])

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        borderRadius: isAdo ? 12 : 24, padding: '32px 24px', textAlign: 'center',
        background: u.cardBg, border: `2px solid ${u.cardBorder}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: isAdo ? 20 : 24, fontWeight: 900, color: u.textPrimary, lineHeight: 1.2 }}>
          {isAdo ? 'JOURNÉE VALIDÉE !' : 'Tes missions ont été validées !'}
        </div>
        <div style={{ fontSize: 14, color: u.textMuted, marginTop: 10, fontWeight: 600 }}>
          {isAdo ? 'Bravo bro, tu assures 🔥' : 'Bravo ! Tu es incroyable ⭐'}
        </div>

        {/* Bouton avec countdown */}
        <button
          onClick={onAcknowledge}
          style={{
            marginTop: 24,
            width: '100%',
            padding: '14px 20px',
            borderRadius: isAdo ? 12 : 16,
            background: u.checkBg,
            color: u.checkColor,
            fontWeight: 900,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: 1,
            border: `3px solid ${u.checkBg}`,
            cursor: 'pointer',
            boxShadow: `0 6px 20px rgba(0,0,0,0.2)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <span>SUPER ! ON PASSE À DEMAIN 🌙</span>
          <CountdownRing seconds={countdown} total={5} color={u.checkColor} />
        </button>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function ChildDashboard({
  profileId,
  childName,
  gender,
  universeKey,
  avatar,
  missions = [],
  streak = 0,
  challenge = null,
  onMissionToggle,
  onReset,
  onEditAvatar,
}) {
  const { t } = useTranslation()
  const u = UNIVERSES[universeKey] ?? UNIVERSES.rainbow
  const isAdo = universeKey === 'ado'

  const [showStreakModal, setShowStreakModal] = useState(false)
  const [showVictoryModal, setShowVictoryModal] = useState(false)
  const [showMalusModal, setShowMalusModal] = useState(false)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  // Ref pour éviter les doubles clics sur le reset
  const isResettingRef = useRef(false)
  // 🔒 Verrou anti-spam : Supabase envoie 1 event par mission upsértée.
  // Sans ce verrou, le timer de 600ms est annulé + redémarré à chaque event,
  // et la modale de célébration ne se déclenche jamais.
  const celebScheduledRef = useRef(false)

  const allDone = missions.length > 0 && missions.every((m) => m.done)
  const allValidated = missions.length > 0 && (
    missions.every((m) => m.parent_validated || m.validation_result === 'success') ||
    missions.some((m) => m.validation_result === 'success')
  )
  const doneCount = missions.filter((m) => m.done).length

  // Stable ref for the reset callback to prevent DayCompleteCard's interval from resetting
  const onResetRef = useRef(onReset)
  useEffect(() => { onResetRef.current = onReset }, [onReset])

  const handleAcknowledge = useCallback(async () => {
    if (isResettingRef.current) return
    isResettingRef.current = true
    setIsCelebrating(false)
    celebScheduledRef.current = false  // 🔓 Reset pour le prochain jour
    try {
      await onResetRef.current?.()
    } finally {
      isResettingRef.current = false
    }
  }, [])

  // ── 1. Streak modal — se déclenche UNE SEULE FOIS quand le parent valide ──
  // Le verrou `celebScheduledRef` empêche les multiples events Supabase realtime
  // (un par log upserté) de réinitialiser le timer en boucle.
  useEffect(() => {
    if (allValidated && missions.length > 0 && !celebScheduledRef.current) {
      celebScheduledRef.current = true  // 🔒 Un seul tir, pas de spam
      setIsCelebrating(true)            // Verrouille l'affichage du streak
      const timer = setTimeout(() => setShowStreakModal(true), 600)
      return () => clearTimeout(timer)
    }
  }, [allValidated, missions.length])  // PAS isCelebrating dans les déps !

  // ── Streak display: quand le modal s'ouvre, le parent vient d'incrémenter
  // current_streak mais le realtime n'a pas encore propagé le nouveau chiffre →
  // on affiche au minimum 1 pour éviter "0 jour consécutif"
  const displayStreak = isCelebrating ? Math.max(1, streak) : streak

  // ── 2. Victory modal — quand challenge.status passe à "won" ───
  useEffect(() => {
    if (challenge?.status === 'won') {
      setShowVictoryModal(true)
    }
  }, [challenge?.status])

  // ── 3. Malus modal — quand challenge.status passe à "lost" ────
  useEffect(() => {
    if (challenge?.status === 'lost') {
      setShowMalusModal(true)
    }
  }, [challenge?.status])

  // ── Toggle mission ───────────────────────────────────────────
  const handleMissionToggle = useCallback(async (missionId) => {
    setTogglingId(missionId)
    try {
      // On délègue la persistance (upsert daily_logs) au parent via App.jsx
      await onMissionToggle?.(missionId, true)
    } finally {
      setTogglingId(null)
    }
  }, [onMissionToggle])

  const challengeProgress = challenge
    ? Math.min(1, (challenge.daysCompleted ?? 0) / Math.max(1, challenge.daysTotal ?? 1))
    : 0

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={u.fontLink} rel="stylesheet" />

      <div style={{
        minHeight: '100dvh',
        background: u.bg,
        fontFamily: u.font,
        paddingBottom: 40,
      }}>
        {/* ── Header — centré ──────────────────────────────────── */}
        <div style={{ padding: '40px 20px 16px', textAlign: 'center' }}>
          {/* Avatar centré */}
          <button
            onClick={onEditAvatar}
            aria-label="Modifier mon avatar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block', margin: '0 auto 12px' }}
          >
            <AvatarDisplay
              avatar={avatar}
              size={72}
              style={{ border: '3px solid rgba(255,255,255,0.6)', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}
            />
          </button>
          {/* Nom centré */}
          <div style={{ fontSize: 13, color: u.textMuted, fontWeight: 600, marginBottom: 2 }}>
            {isAdo ? 'Ton dashboard' : 'Bonjour'}
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, color: u.textPrimary, lineHeight: 1.1 }}>
            {childName} {isAdo ? '⚡' : '👋'}
          </div>
        </div>

        {/* ── Streak card ──────────────────────────────────────── */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{
            borderRadius: isAdo ? 12 : 20,
            padding: '14px 18px',
            background: u.streakBg,
            border: isAdo ? '1px solid rgba(255,60,172,0.2)' : `1.5px solid ${u.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: isAdo ? 28 : 32 }}>🔥</span>
            <div>
              <div style={{ fontSize: 13, color: u.textMuted, fontWeight: 700, textTransform: isAdo ? 'uppercase' : 'none', letterSpacing: isAdo ? 2 : 0 }}>
                {isAdo ? 'STREAK' : 'Jours consécutifs'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: u.textPrimary }}>
                {displayStreak} <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.7 }}>jour{displayStreak > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Challenge card ───────────────────────────────────── */}
        {challenge && challenge.status === 'active' && (
          <div style={{ padding: '0 20px 16px' }}>
            <div style={{
              borderRadius: isAdo ? 12 : 20,
              padding: '16px 18px',
              background: u.challengeBg,
              border: `1.5px solid ${u.cardBorder}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: isAdo ? 12 : 14, fontWeight: 800, color: u.textPrimary, textTransform: isAdo ? 'uppercase' : 'none', letterSpacing: isAdo ? 2 : 0 }}>
                  {isAdo ? 'CHALLENGE' : '🎯 Mon challenge'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: u.textMuted }}>
                  {challenge.daysCompleted ?? 0}/{challenge.daysTotal ?? 0}j
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  height: '100%',
                  width: `${challengeProgress * 100}%`,
                  borderRadius: 4,
                  background: u.progressBar,
                  transition: 'width 0.5s ease',
                }} />
              </div>

              <div style={{ fontSize: 13, color: u.textMuted, fontWeight: 600 }}>
                🎁 {challenge.rewardText}
              </div>
            </div>
          </div>
        )}

        {/* ── Missions header ──────────────────────────────────── */}
        <div style={{ padding: '4px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: isAdo ? 12 : 16, fontWeight: 900, color: u.textPrimary, textTransform: isAdo ? 'uppercase' : 'none', letterSpacing: isAdo ? 2 : 0 }}>
            {isAdo ? t('child.my_missions').toUpperCase() : t('child.my_missions')}
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700,
            color: u.textMuted,
          }}>
            {doneCount}/{missions.length}
          </div>
        </div>

        {/* ── Missions list ─────────────────────────────────────── */}
        {allValidated ? (
          /* Day Complete State — avec countdown 5s */
          <DayCompleteCard
            isAdo={isAdo}
            u={u}
            onAcknowledge={handleAcknowledge}
            paused={showStreakModal || showVictoryModal || showMalusModal}
          />
        ) : isAdo ? (
          /* Ado: list style */
          <div style={{
            margin: '0 20px',
            borderRadius: 12,
            background: u.cardBg,
            border: `1px solid ${u.cardBorder}`,
            overflow: 'hidden',
          }}>
            {missions.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: u.textMuted, fontSize: 14 }}>
                Aucune mission pour aujourd&apos;hui
              </div>
            ) : (
              missions.map((m) => (
                <AdoMissionRow
                  key={m.id}
                  mission={m}
                  u={u}
                  onToggle={handleMissionToggle}
                  isToggling={togglingId === m.id}
                />
              ))
            )}
          </div>
        ) : (
          /* Kid: cards */
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {missions.length === 0 ? (
              <div style={{
                borderRadius: 20, padding: '24px', textAlign: 'center',
                background: u.cardBg, border: `1.5px solid ${u.cardBorder}`,
                color: u.textMuted, fontSize: 15,
              }}>
                Aucune mission pour aujourd&apos;hui ! 🎉
              </div>
            ) : (
              missions.map((m) => (
                <KidMissionCard
                  key={m.id}
                  mission={m}
                  u={u}
                  onToggle={handleMissionToggle}
                  isToggling={togglingId === m.id}
                />
              ))
            )}
          </div>
        )}

        {/* ── All done banner ───────────────────────────────────── */}
        {allDone && !allValidated && (
          <div style={{
            margin: '20px 20px 0',
            padding: '24px',
            borderRadius: isAdo ? 12 : 24,
            background: 'rgba(255,255,255,0.25)',
            border: `2px solid rgba(255,255,255,0.5)`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: isAdo ? 28 : 40, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: isAdo ? 16 : 20, fontWeight: 900, color: u.textPrimary }}>
              {isAdo ? 'En attente de validation' : 'Missions finies !'}
            </div>
            <div style={{ fontSize: 13, color: u.textMuted, marginTop: 4, fontWeight: 600 }}>
              {isAdo ? 'Tes parents vont valider ça' : 'Papa ou maman va valider ta super journée !'}
            </div>
          </div>
        )}
      </div>

      {/* ── Modales de célébration ──────────────────────────────── */}

      {/* Streak modal */}
      {showStreakModal && (
        isAdo ? (
          <AdoModal
            childName={childName}
            gender={gender}
            streak={displayStreak}
            onClose={() => setShowStreakModal(false)}
          />
        ) : (
          <KidModal
            universeKey={universeKey}
            childName={childName}
            streak={displayStreak}
            onClose={() => setShowStreakModal(false)}
          />
        )
      )}

      {/* Victory modal */}
      {showVictoryModal && challenge && (
        <VictoryModal
          theme={universeKey}
          childName={childName}
          gender={gender}
          rewardText={challenge.rewardText}
          onClose={() => setShowVictoryModal(false)}
        />
      )}

      {/* Malus modal */}
      {showMalusModal && challenge && (
        <MalusModal
          theme={universeKey}
          childName={childName}
          gender={gender}
          malusText={challenge.malusText}
          onClose={() => setShowMalusModal(false)}
        />
      )}
    </>
  )
}
