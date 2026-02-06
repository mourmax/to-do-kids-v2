import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../supabaseClient'

// Imports des sous-composants
import ParentVictoryModal from '../ParentVictoryModal'
import FailureModal from '../FailureModal'
import Toast from '../Toast'
import ValidationHeader from './ValidationHeader'
import ValidationMissionList from './ValidationMissionList'
import ChallengeRenewalView from './ChallengeRenewalView'
import { useTranslation } from 'react-i18next'
import { ListChecks } from 'lucide-react'

export default function ValidationTab({ challenge, missions, refresh, onEditSettings, onExit, childName, profile, profiles }) {
  const { t } = useTranslation()

  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false)
  const [showFailureModal, setShowFailureModal] = useState(false)

  // Toast State : null ou { message: string, type: 'success' | 'error' }
  const [toast, setToast] = useState(null)

  const allMissionsDone = missions.length > 0 && missions.every(m => m.is_completed && m.parent_validated)
  const childFinishedAll = missions.length > 0 && missions.every(m => m.is_completed) && !allMissionsDone
  const isDaySuccess = missions.length > 0 && missions.some(m => m.validation_result === 'success')

  // ✅ FIX: Le challenge est fini si le streak atteint la durée, PEU IMPORTE si is_active est encore true
  const isChallengeFinished = (challenge?.current_streak || 0) >= (challenge?.duration_days || 1)

  // Helper for colors
  const getColorClasses = (colorName) => {
    const maps = {
      rose: 'bg-rose-500/10 border-rose-500 text-rose-500',
      sky: 'bg-sky-500/10 border-sky-500 text-sky-500',
      emerald: 'bg-emerald-500/10 border-emerald-500 text-emerald-500',
      amber: 'bg-amber-500/10 border-amber-500 text-amber-500',
      violet: 'bg-indigo-500/10 border-indigo-500 text-indigo-500',
    }
    return maps[colorName] || maps.violet
  }

  // --- Gestion du Toast ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 🔄 Force refresh on mount
  useEffect(() => {
    refresh(true)
  }, [])

  // 1. Setup New Challenge / Renewal View
  if (!challenge || !challenge.is_active) {
    return (
      <ChallengeRenewalView
        challenge={challenge}
        missions={missions}
        profiles={profiles}
        familyId={profile?.family_id}
        onStart={(settings) => handleStartNewChallenge(settings)}
        onEditMissions={() => onEditSettings('missions')}
        refresh={refresh}
      />
    )
  }

  // --- Logique Métier ---

  const validateParent = async (missionId, currentStatus) => {
    try {
      if (!profile?.id) throw new Error("No profile selected")
      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase.from('daily_logs').upsert({
        mission_id: missionId,
        profile_id: profile.id, // 🛠️ CRUCIAL: Identifier l'enfant
        parent_validated: !currentStatus,
        date: today
      }, { onConflict: 'mission_id, profile_id, date' })

      if (error) throw error
      refresh(true)
    } catch (err) {
      console.error("Error validating parent:", err)
      showToast("Erreur de validation", "error")
    }
  }

  const handleDayResultClick = (isSuccess) => {
    if (isSuccess) {
      handleSuccess()
    } else {
      setShowFailureModal(true)
    }
  }

  const handleSuccess = async () => {
    if (!challenge?.id) return
    // Block success if not all missions are validated by parent
    if (!allMissionsDone) {
      showToast(t('validation.must_validate_all'), "error")
      return
    }
    const newStreak = (challenge.current_streak || 0) + 1
    await supabase.from('challenges').update({ current_streak: newStreak }).eq('id', challenge.id)

    const today = new Date().toISOString().split('T')[0]
    const missionIds = missions.map(m => m.id)

    // ✅ SUCCESS: On met à jour le résultat pour notifier l'enfant en temps réel
    // Note: On NE reset PAS child_validated/parent_validated pour garder l'historique propre "Fait & Validé"
    const { error: logError } = await supabase.from('daily_logs').update({
      validation_result: 'success',
      validation_requested: false // 🔄 On libère la demande
    })
      .eq('profile_id', profile.id)
      .eq('date', today)

    if (logError) {
      console.error("Error updating logs on success:", logError)
      showToast("Erreur de sauvegarde de la validation", "error")
    }

    if (newStreak >= (challenge?.duration_days || 1)) {
      setShowVictoryAnimation(true)
    } else {
      showToast(t('dashboard.day_validated'))
      refresh(true)
    }
  }

  const confirmFailure = async () => {
    setShowFailureModal(false)
    const today = new Date().toISOString().split('T')[0]

    const { error: challError } = await supabase.from('challenges').update({ current_streak: 0 }).eq('id', challenge.id)
    if (challError) console.error("Error resetting streak:", challError)

    // ❌ FAILURE: On met à jour pour notifier l'enfant (Aïe c'est raté)
    // L'enfant devra cliquer sur "J'ai compris" pour supprimer les logs lui-même via son dashboard
    const { error: logError } = await supabase.from('daily_logs').update({
      validation_result: 'failure',
      // On garde child_validated pour qu'il voie ce qu'il avait fait ? 
      // Non, on laisse tel quel, l'important est le statut failure.
      // Mais on enlève validation_requested pour débloquer le parent ? 
      // Si on enlève validation_requested, le parent ne voit plus le bouton ?
      // Le parent a fini son action.
      validation_requested: false
    })
      .eq('profile_id', profile.id)
      .eq('date', today)

    if (logError) {
      console.error("Error updating logs on failure:", logError)
      showToast("Erreur de validation (Failure)", "error")
    } else {
      showToast(t('validation.fail_confirmed', "Failure confirmed")) // Fallback text
    }

    await refresh(true)
  }

  const handleCloseVictoryModal = async () => {
    setShowVictoryAnimation(false)
    // Après la victoire, on passe en mode "en attente de re-programmation"
    if (challenge?.id) {
      await supabase.from('challenges').update({ is_active: false }).eq('id', challenge.id)
    }
    refresh(true)
    // On reste ici pour afficher le ChallengeRenewalView
  }

  const handleStartNewChallenge = async (newSettings = {}) => {
    const today = new Date().toISOString().split('T')[0]
    try {
      const updates = {
        current_streak: 0,
        is_active: true,
        ...newSettings
      }

      await supabase.from('challenges').update(updates).eq('id', challenge.id)

      const missionIds = missions.map(m => m.id)
      if (missionIds.length > 0) {
        // ️ RESET: Là seulement on supprime pour repartir à zéro
        await supabase.from('daily_logs').delete()
          .in('mission_id', missionIds)
          .eq('profile_id', profile.id)
          .eq('date', today)
      }
      await refresh(true)
      // showToast(t('dashboard.challenge_started')) // Optional feedback
    } catch (error) {
      console.error("Erreur reset:", error)
      showToast(t('errors.reset_failed'), "error")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

      {/* 🌟 TOAST */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* 🟢 NOTIFICATION: ENFANT A TOUT FINI */}
      <AnimatePresence>
        {childFinishedAll && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center gap-3 text-center transition-colors ${getColorClasses(profile?.color)}`}
          >
            <div className="w-12 h-12 rounded-full bg-current opacity-20 flex items-center justify-center animate-bounce">
              <ListChecks size={24} className="text-current" />
            </div>
            <div>
              <h4 className="font-black uppercase italic tracking-tighter text-lg">
                {t('validation.all_missions_done', { name: childName })}
              </h4>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {t('validation.validate_to_advance')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ValidationHeader
        isChallengeFinished={isChallengeFinished}
        allMissionsDone={allMissionsDone}
        isDaySuccess={isDaySuccess}
        challenge={challenge}
        missionsCount={missions.length}
        onStartNewChallenge={handleStartNewChallenge}
        onDayResult={handleDayResultClick}
        onEditSettings={(target) => onEditSettings(target)}
      />

      {/* 2. Liste des Missions */}
      <ValidationMissionList
        missions={isDaySuccess
          ? missions.map(m => ({ ...m, is_completed: false, parent_validated: false }))
          : missions
        }
        onValidate={validateParent}
      />

      {/* 3. Modales */}
      <AnimatePresence>
        {showVictoryAnimation && (
          <ParentVictoryModal
            childName={childName}
            rewardName={challenge?.reward_name}
            onClose={handleCloseVictoryModal}
          />
        )}
        {showFailureModal && (
          <FailureModal
            malusMessage={challenge?.malus_message}
            onClose={() => setShowFailureModal(false)}
            onConfirm={confirmFailure}
          />
        )}
      </AnimatePresence>

    </motion.div>
  )
}