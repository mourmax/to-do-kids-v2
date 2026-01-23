import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Lock } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import MissionCard from './MissionCard'
import ProgressBar from './ChildProgressBar'

export default function ChildDashboard({ profile, challenge, missions, refresh, onParentMode }) {
  
  // 🚀 ÉTAT LOCAL POUR LA RAPIDITÉ (Optimistic UI)
  const [optimisticMissions, setOptimisticMissions] = useState(missions || [])

  // Synchronisation avec la DB
  useEffect(() => {
    setOptimisticMissions(missions || [])
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
      .eq('date', today)
      .maybeSingle()

    let error
    if (existingLog) {
      const res = await supabase.from('daily_logs').update({ child_validated: newStatus }).eq('id', existingLog.id)
      error = res.error
    } else {
      const res = await supabase.from('daily_logs').insert([{ mission_id: missionId, date: today, child_validated: newStatus }])
      error = res.error
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
      
      {/* En-tête Enfant */}
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="inline-block px-4 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest"
        >
          Bonjour {profile?.child_name || 'Champion'}
        </motion.div>
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          Tes Missions
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
              <h3 className="text-2xl font-black uppercase italic tracking-tight">Tout est fini !</h3>
              <p className="text-sm font-medium text-green-100">Super boulot aujourd'hui</p>
            </div>

            <div className="pt-4 border-t border-white/20 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-3">
                Étape suivante
              </p>
              <button
                onClick={onParentMode}
                className="w-full bg-white text-green-700 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Lock size={14} />
                Demander validation
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
            Aucune mission pour aujourd'hui
          </div>
        )}
      </div>

    </div>
  )
}