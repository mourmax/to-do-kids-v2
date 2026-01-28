import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../supabaseClient'

// Imports des sous-composants
import ParentVictoryModal from '../ParentVictoryModal'
import FailureModal from '../FailureModal'
import Toast from '../Toast'
import ValidationHeader from './ValidationHeader'
import ValidationMissionList from './ValidationMissionList'
import { useTranslation } from 'react-i18next'
import { ListChecks } from 'lucide-react'

export default function ValidationTab({ challenge, missions, refresh, onEditSettings, onExit, childName, profile }) {
  const { t } = useTranslation()

  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false)
  const [showFailureModal, setShowFailureModal] = useState(false)

  // Toast State : null ou { message: string, type: 'success' | 'error' }
  const [toast, setToast] = useState(null)

  const allMissionsDone = missions.length > 0 && missions.every(m => m.is_completed && m.parent_validated)
  const childFinishedAll = missions.length > 0 && missions.every(m => m.is_completed) && !allMissionsDone
  const isChallengeFinished = challenge?.is_active === false && (challenge?.current_streak || 0) >= (challenge?.duration_days || 1)

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
    if (!allMissionsDone) {
      showToast(t('actions.validate_all'), "error")
      return
    }
    const newStreak = (challenge.current_streak || 0) + 1
    await supabase.from('challenges').update({ current_streak: newStreak }).eq('id', challenge.id)

    const today = new Date().toISOString().split('T')[0]
    const missionIds = missions.map(m => m.id)

    // ✅ SUCCESS: On met à jour le résultat pour notifier l'enfant en temps réel
    const { error: logError } = await supabase.from('daily_logs').update({
      validation_result: 'success',
      child_validated: false, // 🔄 Reset pour la "journée suivante" ou le prochain cycle
      parent_validated: false, // 🔄 Reset pour la "journée suivante"
      validation_requested: false // 🔄 On libère la demande
    })
      .eq('profile_id', profile.id)
      .eq('date', today)

    if (logError) console.error("Error updating logs on success:", logError)

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

    // ❌ FAILURE: On supprime les logs du jour pour remettre Marie à zéro ("À faire")
    const { error: logError } = await supabase.from('daily_logs').delete()
      .eq('profile_id', profile.id)
      .eq('date', today)

    if (logError) {
      console.error("Error deleting logs on failure:", logError)
      showToast("Erreur de suppression", "error")
    } else {
      showToast(t('dashboard.counter_reset'))
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
    // Rediriger vers l'onglet réglages (Bilan)
    onEditSettings()
  }

  const handleStartNewChallenge = async () => {
    const today = new Date().toISOString().split('T')[0]
    try {
      await supabase.from('challenges').update({ current_streak: 0 }).eq('id', challenge.id)
      const missionIds = missions.map(m => m.id)
      if (missionIds.length > 0) {
        // �️ RESET: Là seulement on supprime pour repartir à zéro
        await supabase.from('daily_logs').delete()
          .in('mission_id', missionIds)
          .eq('profile_id', profile.id)
          .eq('date', today)
      }
      await refresh(true)
      onExit()
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
                {childName} a fini toutes ses missions !
              </h4>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                Validez sa journée pour avancer le challenge
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ValidationHeader
        isChallengeFinished={isChallengeFinished}
        allMissionsDone={allMissionsDone}
        challenge={challenge}
        missionsCount={missions.length}
        onStartNewChallenge={handleStartNewChallenge}
        onDayResult={handleDayResultClick}
        onEditSettings={(target) => onEditSettings(target)}
      />

      {/* 2. Liste des Missions */}
      <ValidationMissionList
        missions={missions}
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