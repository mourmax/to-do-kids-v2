import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Lock, Send, Clock, Trophy, Sun, Moon, Sparkles, BellRing, BellOff } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import MissionCard from './MissionCard'
import ProgressBar from './ChildProgressBar'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import ParentVictoryModal from '../parent/ParentVictoryModal'
import { NotificationService } from '../../services/notificationService'

const getColorClasses = (colorName) => {
  const maps = {
    rose: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    sky: 'bg-sky-500/20 border-sky-500/30 text-sky-300',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    violet: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  }
  const mapsActive = {
    rose: 'bg-rose-500 text-white shadow-rose-500/20',
    sky: 'bg-sky-500 text-white shadow-sky-500/20',
    emerald: 'bg-emerald-500 text-white shadow-emerald-500/20',
    amber: 'bg-amber-500 text-white shadow-amber-500/20',
    violet: 'bg-indigo-500 text-white shadow-indigo-500/20',
  }
  return {
    inactive: maps[colorName] || maps.violet,
    active: mapsActive[colorName] || mapsActive.violet
  }
}

export default function ChildDashboard({ profile, profiles, challenge, missions, refresh, onParentMode, onSwitchProfile, isChildSession }) {
  const { t } = useTranslation()

  // Filter only child profiles - BUT hide switcher if this is a child-only session (invited via code)
  const childProfiles = isChildSession ? [] : (profiles?.filter(p => !p.is_parent) || [])

  // Helper for colors

  // 🚀 ÉTAT LOCAL POUR LA RAPIDITÉ (Optimistic UI)
  const [optimisticMissions, setOptimisticMissions] = useState(missions || [])
  const prevMissionsRef = useRef(missions || [])

  // NOUVEAUX ÉTATS POUR LE FLUX DE VALIDATION
  const [validationRequested, setValidationRequested] = useState(false)
  const [validationResult, setValidationResult] = useState(null) // 'success' | 'failure' | null
  const [isRequesting, setIsRequesting] = useState(false)
  const [showVictoryModal, setShowVictoryModal] = useState(false)
  const [hasSeenVictory, setHasSeenVictory] = useState(false)

  // Synchronisation avec la DB et Realtime
  useEffect(() => {
    if (!missions || missions.length === 0) {
      setOptimisticMissions([])
      return
    }

    const hasPendingRequest = missions.some(m => m.validation_requested && !m.validation_result)
    const activeResult = missions.find(m => m.validation_result)?.validation_result

    // 1. Mise à jour des états de validation
    if (activeResult) {
      setValidationResult(activeResult)
      setValidationRequested(false)
    } else {
      setValidationResult(null)
      setValidationRequested(hasPendingRequest)
    }

    // 2. Gestion de la Modale de Victoire
    const safeCurrent = Number(challenge?.current_streak) || 0
    const safeTotal = Math.max(1, Number(challenge?.duration_days) || 1)
    const isVictory = safeCurrent >= safeTotal

    if (isVictory && !hasSeenVictory && !showVictoryModal) {
      setShowVictoryModal(true)
    }

    // 🚀 AUTO-CLOSE VICTORY MODAL SI LE STREAK REVIENT A 0 (Nouveau challenge configuré par le parent)
    if (safeCurrent === 0 && (showVictoryModal || hasSeenVictory)) {
      setShowVictoryModal(false)
      setHasSeenVictory(false)
      setValidationResult(null)
    }

    // 3. 🎉 CONFETTIS SUR TRANSITION VERS SUCCÈS
    const newlyValidated = missions.some(m => {
      const prev = prevMissionsRef.current.find(p => p.id === m.id)
      return m.parent_validated && prev && !prev.parent_validated
    })

    if (newlyValidated) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      })
    }

    setOptimisticMissions(missions)
    prevMissionsRef.current = missions
  }, [missions, challenge?.current_streak, challenge?.duration_days, hasSeenVictory, showVictoryModal])

  // 🔄 POLLING DE SECOURS : Si on attend une validation, on vérifie périodiquement (toutes les 5s)
  // au cas où le socket Realtime aurait raté l'événement.
  useEffect(() => {
    let interval
    if (validationRequested && !validationResult) {
      interval = setInterval(() => {
        refresh(true)
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [validationRequested, validationResult, refresh])
  useEffect(() => {
    if (!profile?.id) return

    const today = new Date().toISOString().split('T')[0]

    const channel = supabase
      .channel(`validation-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for ALL events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'daily_logs',
          filter: `profile_id=eq.${profile.id}`
        },
        async (payload) => {
          console.log("Realtime Daily Logs update (Child):", payload)
          refresh(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, refresh])

  // 🏆 SUBSCRIPTION CHALLENGES (Pour progression et victoire en direct)
  useEffect(() => {
    if (!challenge?.id) return

    const channel = supabase
      .channel(`challenge-sync-${challenge.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'challenges',
          filter: `id=eq.${challenge.id}`
        },
        async (payload) => {
          console.log("Realtime Challenge update:", payload)
          refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [challenge?.id, refresh])


  // Vérification : tout est fini ?
  const allMissionsDone = optimisticMissions.length > 0 && optimisticMissions.every(m => m.is_completed)

  const handleRequestValidation = async () => {
    setIsRequesting(true)
    const today = new Date().toISOString().split('T')[0]
    const missionIds = optimisticMissions.map(m => m.id)

    try {
      // ✅ Si on redemande, on annule l'état "BRAVO" ou "ÉCHEC" précédent
      setValidationResult(null)

      // On met à jour tous les logs du jour pour dire "validation_requested = true"
      const { error } = await supabase
        .from('daily_logs')
        .update({
          validation_requested: true,
          validation_result: null,
          child_validated: true // On s'assure qu'ils sont tous validés enfant
        })
        .in('mission_id', missionIds)
        .eq('profile_id', profile.id)
        .eq('date', today)

      if (error) throw error

      setValidationRequested(true)
    } catch (e) {
      console.error("Error requesting validation:", e)
    } finally {
      setIsRequesting(false)
    }
  }

  // 4. Initialisation des rappels de notifications
  useEffect(() => {
    if (missions && missions.length > 0 && NotificationService.getPermissionStatus() === 'granted') {
      missions.forEach(m => {
        if (m.scheduled_times && m.scheduled_times.length > 0 && !m.is_done) {
          m.scheduled_times.forEach(timeStr => {
            NotificationService.scheduleLocalReminder(
              t(m.title),
              timeStr,
              m.id
            )
          })
        }
      })
    }
  }, [missions, t])

  const handleToggleMission = async (missionId, isCompleted) => {
    // 🚀 SI BRAVO EST AFFICHÉ, ON RÉINITIALISE TOUTE LA JOURNÉE POUR RECOMMENCER
    if (validationResult) {
      setValidationResult(null)
      const today = new Date().toISOString().split('T')[0]
      const missionIds = optimisticMissions.map(m => m.id)

      await supabase.from('daily_logs')
        .update({
          validation_result: null,
          child_validated: false,
          parent_validated: false,
          validation_requested: false
        })
        .in('mission_id', missionIds)
        .eq('profile_id', profile.id)
        .eq('date', today)

      // On force un rafraîchissement global pour que tout le monde repasse en bleu
      refresh(true)
      // Note: On continue quand même pour traiter le toggle du bouton cliqué
    }

    // 1. MISE À JOUR VISUELLE INSTANTANÉE
    const newStatus = !isCompleted
    const today = new Date().toISOString().split('T')[0]

    // On calcule le nouvel état pour vérifier si c'est la fin
    const newMissions = optimisticMissions.map(m =>
      m.id === missionId ? { ...m, is_completed: newStatus } : m
    )
    setOptimisticMissions(newMissions)

    // 🚀 SCROLL VERS LE HAUT SI TOUT EST FINI
    const isAllDoneNow = newMissions.every(m => m.is_completed)
    if (isAllDoneNow) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 300)
    }

    // 2. MISE À JOUR DB (Background - Utilise UPSERT pour éviter les doublons)
    const { error } = await supabase.from('daily_logs').upsert({
      mission_id: missionId,
      profile_id: profile.id,
      date: today,
      child_validated: newStatus,
      parent_validated: false,
      validation_requested: false,
      validation_result: null
    }, { onConflict: 'mission_id, profile_id, date' })

    if (!error) {
      await refresh(true)
    } else {
      console.error("Erreur save:", error)
      setOptimisticMissions(missions) // Rollback si erreur
      await refresh(true)
    }
  }

  // Sécurisation Anti-NaN
  const safeCurrent = Math.max(0, Number(challenge?.current_streak) || 0)
  const safeTotal = Math.max(1, Number(challenge?.duration_days) || 1)
  const isVictory = safeCurrent >= safeTotal

  return (
    <div className={`space-y-6 pb-20 min-h-screen transition-colors duration-500 light-theme bg-[#F8FAFF]`}>

      {/* 🎈 ÉLÉMENTS LUDIQUES DE FOND (Bubbles) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-[10%] left-[5%] w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"
        />
        <div className="absolute top-[40%] left-[80%] w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
      </div>

      <div className="relative z-10 space-y-6 px-4 pt-6">
        {/* 🔴 SÉLECTEUR D'ENFANT (Header) */}
        {childProfiles.length > 1 && (
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 p-1.5 bg-slate-900/40 [.light-theme_&]:bg-white/50 border border-white/5 [.light-theme_&]:border-indigo-100 rounded-3xl shadow-xl [.light-theme_&]:shadow-indigo-500/5 backdrop-blur-sm">
              {childProfiles.map(p => {
                const isActive = profile?.id === p.id
                const colors = getColorClasses(p.color) || { active: '', inactive: '' }
                return (
                  <button
                    key={p.id}
                    onClick={() => onSwitchProfile(p.id)}
                    className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
                      ? `${colors.active} shadow-lg scale-105`
                      : `${colors.inactive} hover:bg-white/5`
                      }`}
                  >
                    {isActive ? `${t('auth.welcome', { name: '' })} ${p.child_name}` : p.child_name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Titre Section Refined */}
        <div className="relative pt-8 pb-4">

          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.9, 1, 0.9],
                scale: 1,
                y: [0, -5, 0]
              }}
              transition={{
                opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                scale: { duration: 0.5 }
              }}
              className="relative inline-block"
            >
              <h2 className="text-5xl sm:text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-indigo-800 italic uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(99,102,241,0.2)] animate-inner-glow">
                {profile?.child_name}
              </h2>
              {/* Stars moved to background and further away to not hide text */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-12 -right-12 z-0 pointer-events-none"
              >
                <Sparkles className="text-amber-400/30" size={48} />
              </motion.div>
              <motion.div
                animate={{
                  rotate: -360,
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-8 -left-12 z-0 pointer-events-none"
              >
                <Sparkles className="text-indigo-400/20" size={32} />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-black text-white/40 [.light-theme_&]:text-indigo-950/30 italic tracking-widest uppercase"
            >
              {t('dashboard.child_title')}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* --- 🏆 MESSAGE DE FIN (EN HAUT) --- */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence>
          {allMissionsDone && !validationRequested && validationResult !== 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-green-500 text-white p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(34,197,94,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center animate-bounce mb-2">
                  <CheckCircle size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">{t('dashboard.all_done')}</h3>
                <p className="text-sm font-medium text-green-100 opacity-90">{t('dashboard.good_job')}</p>
              </div>

              <div className="pt-4 border-t border-white/20 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-3">
                  {t('actions.next')}
                </p>
                <button
                  onClick={handleRequestValidation}
                  disabled={isRequesting}
                  className="w-full bg-white text-green-700 py-4 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  {isRequesting ? 'Envoi...' : t('dashboard.request_validation')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ✅ SUCCÈS - JOURNÉE VALIDÉE */}
          {validationResult === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="bg-emerald-500 text-white p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(16,185,129,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                  <CheckCircle size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">{t('child.congratulations')}</h3>
                <p className="text-sm font-medium text-emerald-100">{t('dashboard.day_validated_success')}</p>
              </div>
            </motion.div>
          )}

          {/* 🕐 EN ATTENTE DE VALIDATION */}
          {validationRequested && !validationResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-500 text-white p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(245,158,11,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                  <Clock size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">{t('child.waiting')}</h3>
                <p className="text-sm font-medium text-amber-100">{t('child.waiting_msg')}</p>
              </div>
            </motion.div>
          )}

          {/* ❌ ÉCHEC / MODE PARENT NON VALIDÉ */}
          {validationResult === 'failure' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="bg-red-500 text-white p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(239,68,68,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <span className="text-3xl">😢</span>
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">{t('child.oh_no')}</h3>
                <div className="bg-white/10 p-4 rounded-2xl w-full mt-2 space-y-2">
                  <p className="text-sm font-medium text-red-100">
                    {t('child.day_not_validated')}
                  </p>
                  {challenge?.malus_message && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">{t('child.malus_pay')}</p>
                      <p className="font-bold italic text-white">"{challenge.malus_message}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 relative z-10">
                <button
                  onClick={async () => {
                    setValidationResult(null)
                    setValidationRequested(false)
                    const today = new Date().toISOString().split('T')[0]
                    await supabase.from('daily_logs')
                      .update({
                        validation_requested: false,
                        validation_result: null,
                        child_validated: false,
                        parent_validated: false
                      })
                      .eq('profile_id', profile.id)
                      .eq('date', today)
                    await refresh(true)
                  }}
                  className="w-full bg-white text-red-600 py-4 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {t('actions.i_understand')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barre de progression */}
      {challenge && (
        <div className="max-w-5xl mx-auto">
          <ProgressBar
            current={safeCurrent}
            total={safeTotal}
            reward={challenge.reward_name || "Surprise"}
          />
        </div>
      )}

      {/* Liste des missions (Masquée si challenge fini) */}
      {!isVictory && challenge?.is_active && (
        <div id="mission-grid" className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 px-4 pb-12">
          {optimisticMissions.map((mission, index) => {
            const displayMission = validationResult === 'success'
              ? { ...mission, is_completed: false, parent_validated: false }
              : mission

            return (
              <MissionCard
                key={mission.id}
                mission={displayMission}
                index={index}
                onToggle={handleToggleMission}
              />
            )
          })}

          {optimisticMissions.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="bg-slate-900/40 [.light-theme_&]:bg-white/50 border-2 border-dashed border-white/5 [.light-theme_&]:border-indigo-100 rounded-[2.5rem] p-8">
                <p className="text-slate-500 [.light-theme_&]:text-indigo-400 text-xs font-black uppercase tracking-widest">
                  {t('dashboard.missions_empty')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showVictoryModal && (
          <ParentVictoryModal
            childName={profile?.child_name || 'Enfant'}
            rewardName={challenge?.reward_name}
            isParent={false}
            isReady={challenge && Number(challenge.current_streak) === 0}
            onClose={async () => {
              if (challenge && Number(challenge.current_streak) === 0) {
                setShowVictoryModal(false)
                setHasSeenVictory(false)
              } else {
                setHasSeenVictory(true)
                setShowVictoryModal(false)
              }
              refresh()
            }}
          />
        )}
      </AnimatePresence>

      {/* --- 🚀 ÉCRAN "Nouveau Challenge" SI LE PARENT A RE-VALIDÉ --- */}
      <AnimatePresence>
        {challenge && challenge.is_active && Number(challenge.current_streak) === 0 && !allMissionsDone && !validationRequested && (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(79,70,229,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                  <Trophy size={28} className="text-white" />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tight">{t('child.lets_go')}</h3>
                <p className="text-sm font-medium text-indigo-100">{t('child.challenge_ready')}</p>
                <button
                  onClick={() => {
                    const grid = document.getElementById('mission-grid')
                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    refresh(true)
                  }}
                  className="mt-4 w-full bg-white text-indigo-600 py-4 rounded-[1.5rem] font-black uppercase text-[12px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Trophy size={16} />
                  {t('child.start_challenge')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* --- 🕐 MESSAGE PENDING CONFIG SI CHALLENGE FINI MAIS PAS ENCORE RE-CONFIGURÉ --- */}
        {challenge && !challenge.is_active && (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 [.light-theme_&]:bg-white border border-white/10 [.light-theme_&]:border-indigo-100 p-6 rounded-[2.5rem] shadow-xl [.light-theme_&]:shadow-indigo-500/10 text-center space-y-4 relative overflow-hidden"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-white/5 [.light-theme_&]:bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                  <Clock size={28} className="text-slate-400 [.light-theme_&]:text-indigo-400 animate-pulse" />
                </div>
                <p className="text-sm font-black uppercase text-slate-300 [.light-theme_&]:text-indigo-950 tracking-widest opacity-80">
                  {t('child.waiting_parent_config')}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}