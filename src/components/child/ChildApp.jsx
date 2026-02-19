import { useState, useEffect, useCallback } from 'react'
import { useChildProfile } from '../../hooks/useChildProfile'
import UniversePicker from './UniversePicker'
import AvatarPicker from './AvatarPicker'
import ChildDashboard from './ChildDashboard'

/* ============================================================
   TodoKids — ChildApp
   Root component. Orchestre les 3 étapes :
     1. UniversePicker  (première visite ou reset)
     2. AvatarPicker    (après choix d'univers)
     3. ChildDashboard  (dashboard principal)

   Props (passées depuis le router parent) :
     profileId, childName, gender,
     missions, streak, challenge, onMissionToggle
   ============================================================ */

// ── Étapes ────────────────────────────────────────────────────
const STEP = {
  UNIVERSE: 'universe',
  AVATAR:   'avatar',
  DASHBOARD: 'dashboard',
}

export default function ChildApp({
  profileId,
  childName,
  gender = 'boy',
  missions = [],
  streak = 0,
  challenge = null,
  onMissionToggle,
}) {
  const { universeKey, avatar, saveUniverse, saveAvatar, isFirstVisit } = useChildProfile(profileId)

  // ── Étape courante ─────────────────────────────────────────
  const [step, setStep] = useState(null) // null = loading

  // Déduire l'étape initiale une fois les prefs chargées
  useEffect(() => {
    if (isFirstVisit) {
      setStep(STEP.UNIVERSE)
    } else if (!avatar) {
      setStep(STEP.AVATAR)
    } else {
      setStep(STEP.DASHBOARD)
    }
  // avatar intentionally omitted: after init, step is driven by handlers only
  }, [isFirstVisit]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────
  const handleSelectUniverse = useCallback((key) => {
    saveUniverse(key)
    setStep(STEP.AVATAR)
  }, [saveUniverse])

  const handleSelectAvatar = useCallback((newAvatar) => {
    saveAvatar(newAvatar)
    setStep(STEP.DASHBOARD)
  }, [saveAvatar])

  const handleEditAvatar = useCallback(() => {
    setStep(STEP.AVATAR)
  }, [])

  // ── Loading splash ─────────────────────────────────────────
  if (step === null) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #1a1a2e, #16213e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #A78BFA',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── UniversePicker ─────────────────────────────────────────
  if (step === STEP.UNIVERSE) {
    return (
      <UniversePicker
        childName={childName}
        onSelect={handleSelectUniverse}
      />
    )
  }

  // ── AvatarPicker ───────────────────────────────────────────
  if (step === STEP.AVATAR) {
    return (
      <AvatarPicker
        universeKey={universeKey ?? 'rainbow'}
        currentAvatar={avatar}
        onSelect={handleSelectAvatar}
        onBack={() => setStep(universeKey ? STEP.DASHBOARD : STEP.UNIVERSE)}
      />
    )
  }

  // ── ChildDashboard ─────────────────────────────────────────
  return (
    <ChildDashboard
      profileId={profileId}
      childName={childName}
      gender={gender}
      universeKey={universeKey ?? 'rainbow'}
      avatar={avatar}
      missions={missions}
      streak={streak}
      challenge={challenge}
      onMissionToggle={onMissionToggle}
      onEditAvatar={handleEditAvatar}
    />
  )
}
