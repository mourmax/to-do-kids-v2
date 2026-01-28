import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Lock, Send, Clock, Trophy, Sun, Moon } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import MissionCard from './MissionCard'
import ProgressBar from './ChildProgressBar'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'
import ParentVictoryModal from '../parent/ParentVictoryModal'

export default function ChildDashboard({ profile, profiles, challenge, missions, refresh, onParentMode, onSwitchProfile, isChildSession }) {
  const { t } = useTranslation()

  // Filter only child profiles - BUT hide switcher if this is a child-only session (invited via code)
  const childProfiles = isChildSession ? [] : (profiles?.filter(p => !p.is_parent) || [])

  // Helper for colors
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

  // SUBSCRIPTION REALTIME
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
          refresh()
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

  return (
    <div className="space-y-6 pb-20">

      {/* 🔴 SÉLECTEUR D'ENFANT (Header) */}
      {childProfiles.length > 1 && (
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1.5 bg-slate-900/40 border border-white/5 rounded-2xl">
            {childProfiles.map(p => {
              const isActive = profile?.id === p.id
              const colors = getColorClasses(p.color)
              return (
                <button
                  key={p.id}
                  onClick={() => onSwitchProfile(p.id)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
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

      {/* Titre Section */}
      <div className="text-center space-y-2 relative">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          {t('dashboard.child_title')}
        </h1>

        {/* Toggle Thème pour l'enfant */}
        <button
          onClick={async () => {
            const newTheme = profile?.preferred_theme === 'light' ? 'dark' : 'light'
            const { error } = await supabase
              .from('profiles')
              .update({ preferred_theme: newTheme })
              .eq('id', profile.id)
            if (!error) refresh()
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-slate-900/40 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg shadow-black/20"
          title="Changer de thème"
        >
          {profile?.preferred_theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* --- 🏆 MESSAGE DE FIN (EN HAUT) --- */}
      <AnimatePresence>
        {allMissionsDone && !validationRequested && validationResult !== 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-green-500 text-white p-6 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce mb-2">
                <CheckCircle size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">{t('dashboard.all_done')}</h3>
              <p className="text-sm font-medium text-green-100">{t('dashboard.good_job')}</p>
            </div>

            <div className="pt-4 border-t border-white/20 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-3">
                {t('actions.next')}
              </p>
              <button
                onClick={handleRequestValidation}
                disabled={isRequesting}
                className="w-full bg-white text-green-700 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={14} />
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
            className="bg-emerald-500 text-white p-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                <CheckCircle size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">BRAVO !</h3>
              <p className="text-sm font-medium text-emerald-100">{t('dashboard.day_validated_success')}</p>
            </div>
          </motion.div>
        )}

        {/* 🕐 EN ATTENTE DE VALIDATION */}
        {validationRequested && !validationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-500 text-white p-6 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                <Clock size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">En attente...</h3>
              <p className="text-sm font-medium text-amber-100">Ton parent va bientôt valider ta journée !</p>
            </div>
          </motion.div>
        )}

        {/* ❌ ÉCHEC / MODE PARENT NON VALIDÉ */}
        {validationResult === 'failure' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="bg-red-500 text-white p-6 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">😢</span>
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">Oh mince...</h3>
              <p className="text-sm font-medium text-red-100">
                La journée n'a pas été validée. Le compteur repart à zéro.
              </p>
              {challenge?.malus_message && (
                <div className="bg-white/10 p-3 rounded-xl w-full mt-2">
                  <p className="text-[10px] font-black uppercase opacity-70">Gage à payer :</p>
                  <p className="font-bold italic">"{challenge.malus_message}"</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/20 relative z-10">
              <button
                onClick={async () => {
                  // Reset local
                  setValidationResult(null)
                  setValidationRequested(false)
                  // Reset DB (acknowledge)
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
                className="w-full bg-white text-red-600 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                J'ai compris
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre de progression */}
      {challenge && (
        <ProgressBar
          current={safeCurrent}
          total={safeTotal}
          reward={challenge.reward_name || "Surprise"}
        />
      )}

      {/* Liste des missions */}
      <div className="grid grid-cols-2 gap-4">
        {optimisticMissions.map((mission, index) => {
          // 🚀 VISUEL "A FAIRE" SI VALIDÉ (pour pouvoir recommencer)
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
          <div className="col-span-2 text-slate-500 text-center text-xs font-bold uppercase py-10">
            {t('dashboard.missions_empty')}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showVictoryModal && (
          <ParentVictoryModal
            childName={profile?.child_name || 'Enfant'}
            rewardName={challenge?.reward_name}
            isParent={false}
            isReady={challenge && Number(challenge.current_streak) === 0}
            onClose={async () => {
              if (challenge && Number(challenge.current_streak) === 0) {
                // Si le parent a déjà configuré, on ferme juste
                setShowVictoryModal(false)
                setHasSeenVictory(false)
              } else {
                // Sinon on marque comme vu pour éviter le loop
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-indigo-600 text-white p-6 rounded-3xl shadow-[0_0_40px_rgba(79,70,229,0.3)] text-center space-y-4 border border-white/20 relative overflow-hidden mb-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-bounce">
                <Trophy size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tight">C'est parti !</h3>
              <p className="text-sm font-medium text-indigo-100">Tes parents ont préparé un nouveau challenge pour toi !</p>
              <button
                onClick={async () => {
                  // Optionnel: On peut marquer un début officiel ici si besoin
                  refresh(true)
                }}
                className="mt-4 w-full bg-white text-indigo-600 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Débuter le challenge {profile?.child_name}
              </button>
            </div>
          </motion.div>
        )}

        {/* --- 🕐 MESSAGE PENDING CONFIG SI CHALLENGE FINI MAIS PAS ENCORE RE-CONFIGURÉ --- */}
        {challenge && !challenge.is_active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl text-center space-y-4 border border-white/10 relative overflow-hidden mb-6"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                <Clock size={24} className="text-slate-400 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-slate-300">En attente de validation de tes parents pour le nouveau challenge</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}