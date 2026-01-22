import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../supabaseClient'

// Imports des sous-composants
import ParentVictoryModal from '../ParentVictoryModal'
import FailureModal from '../FailureModal'
import Toast from '../Toast'
import ValidationHeader from './ValidationHeader'
import ValidationMissionList from './ValidationMissionList'

export default function ValidationTab({ challenge, missions, refresh, onEditSettings, onExit, childName }) {
  
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false)
  const [showFailureModal, setShowFailureModal] = useState(false)
  
  // Toast State : null ou { message: string, type: 'success' | 'error' }
  const [toast, setToast] = useState(null) 

  const allMissionsDone = missions.length > 0 && missions.every(m => m.is_completed && m.parent_validated)
  const isChallengeFinished = !showVictoryAnimation && (challenge?.current_streak || 0) >= (challenge?.duration_days || 1)

  // --- Gestion du Toast ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- Logique Métier ---

  const validateParent = async (missionId, currentStatus) => {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('daily_logs').upsert({
      mission_id: missionId,
      parent_validated: !currentStatus,
      date: today
    }, { onConflict: 'mission_id, date' })
    refresh(true)
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
      // 🚨 REMPLACEMENT ALERT
      showToast("Validez toutes les missions !", "error")
      return
    }
    const newStreak = (challenge.current_streak || 0) + 1
    await supabase.from('challenges').update({ current_streak: newStreak }).eq('id', challenge.id)

    if (newStreak >= (challenge?.duration_days || 1)) {
      setShowVictoryAnimation(true)
    } else {
      const today = new Date().toISOString().split('T')[0]
      const missionIds = missions.map(m => m.id)
      if (missionIds.length > 0) {
        await supabase.from('daily_logs').delete().in('mission_id', missionIds).eq('date', today)
      }
      showToast("Journée validée ! 🎉") // ✅ REMPLACEMENT ALERT
      refresh(true)
    }
  }

  const confirmFailure = async () => {
    setShowFailureModal(false)
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('challenges').update({ current_streak: 0 }).eq('id', challenge.id)
    const missionIds = missions.map(m => m.id)
    if (missionIds.length > 0) {
      await supabase.from('daily_logs').delete().in('mission_id', missionIds).eq('date', today)
    }
    showToast("Compteur remis à zéro") // ✅ REMPLACEMENT ALERT
    refresh(true)
  }

  const handleCloseVictoryModal = async () => {
    setShowVictoryAnimation(false)
    const today = new Date().toISOString().split('T')[0]
    const missionIds = missions.map(m => m.id)
    if (missionIds.length > 0) {
      await supabase.from('daily_logs').delete().in('mission_id', missionIds).eq('date', today)
    }
    refresh(true) 
  }

  const handleStartNewChallenge = async () => {
    const today = new Date().toISOString().split('T')[0]
    try {
      await supabase.from('challenges').update({ current_streak: 0 }).eq('id', challenge.id)
      const missionIds = missions.map(m => m.id)
      if (missionIds.length > 0) {
        await supabase.from('daily_logs').delete().in('mission_id', missionIds).eq('date', today)
      }
      await refresh(true)
      onExit() 
    } catch (error) {
      console.error("Erreur reset:", error)
      showToast("Erreur lors du reset", "error") // ✅ REMPLACEMENT ALERT ERREUR
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      
      {/* 🌟 TOAST */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* 1. Header (Verdict ou Fin) */}
      <ValidationHeader 
        isChallengeFinished={isChallengeFinished}
        allMissionsDone={allMissionsDone}
        challenge={challenge}
        missionsCount={missions.length}
        onStartNewChallenge={handleStartNewChallenge}
        onDayResult={handleDayResultClick}
        onEditSettings={onEditSettings}
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