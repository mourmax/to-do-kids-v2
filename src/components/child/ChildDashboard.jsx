import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Lock } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import MissionCard from './MissionCard'
import ProgressBar from './ChildProgressBar'
import { useTranslation } from 'react-i18next'
import confetti from 'canvas-confetti'

export default function ChildDashboard({ profile, profiles, challenge, missions, refresh, onParentMode, onSwitchProfile }) {
  const { t } = useTranslation()

  // Filter only child profiles
  const childProfiles = profiles?.filter(p => !p.is_parent) || []

  // ... (getColorClasses helper remain the same) ...
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

  // Synchronisation avec la DB (quand on change d'enfant ou que le parent change un truc)
  useEffect(() => {
    // 🎉 DÉTECTION DE VALIDATION PARENT POUR LES CONFETIS
    const newlyValidated = (missions || []).some(m => {
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

    setOptimisticMissions(missions || [])
    prevMissionsRef.current = missions || []
  }, [missions])

  // Vérification : tout est fini ?
  const allMissionsDone = optimisticMissions.length > 0 && optimisticMissions.every(m => m.is_completed)

  const handleToggleMission = async (missionId, isCompleted) => {
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

    // 2. MISE À JOUR DB (Background)
    const { data: existingLog } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('mission_id', missionId)
      .eq('profile_id', profile.id) // 🛠️ CRUCIAL: Identifier le bon enfant
      .eq('date', today)
      .maybeSingle()

    let error
    if (existingLog) {
      const { error: upError } = await supabase.from('daily_logs').update({
        child_validated: newStatus
      }).eq('id', existingLog.id)
      error = upError
    } else {
      const { error: insError } = await supabase.from('daily_logs').insert([{
        mission_id: missionId,
        profile_id: profile.id, // 🛠️ CRUCIAL: Assigner à l'enfant actif
        date: today,
        child_validated: newStatus
      }])
      error = insError
    }

    if (!error) {
      refresh(true)
    } else {
      console.error("Erreur save:", error)
      setOptimisticMissions(missions) // Rollback si erreur
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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          {t('dashboard.child_title')}
        </h1>
      </div>

      {/* --- 🏆 MESSAGE DE FIN (EN HAUT) --- */}
      <AnimatePresence>
        {allMissionsDone && (
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
                onClick={onParentMode}
                className="w-full bg-white text-green-700 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                {t('dashboard.request_validation')}
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
        {optimisticMissions.map((mission, index) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={index}
            onToggle={handleToggleMission}
          />
        ))}

        {optimisticMissions.length === 0 && (
          <div className="col-span-2 text-slate-500 text-center text-xs font-bold uppercase py-10">
            {t('dashboard.missions_empty')}
          </div>
        )}
      </div>

    </div>
  )
}