import { motion } from 'framer-motion'
import { CheckCircle, Lock } from 'lucide-react'
import MissionCard from '../ui/MissionCard'
import ProgressBar from '../ui/ProgressBar'

export default function ChildDashboard({ profile, challenge, missions, refresh, onParentMode }) {
  
  // Vérification stricte : y a-t-il des missions et sont-elles toutes finies ?
  const allMissionsDone = missions && missions.length > 0 && missions.every(m => m.is_completed)

  return (
    <div className="space-y-8">
      
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

      {/* Barre de progression */}
      {challenge && (
        <ProgressBar 
          current={challenge.current_streak} 
          total={challenge.duration_days} 
          reward={challenge.reward_name}
        />
      )}

      {/* Liste des missions */}
      <div className="space-y-4">
        {missions.map((mission, index) => (
          <MissionCard 
            key={mission.id} 
            mission={mission} 
            index={index} 
            onToggle={() => refresh(true)} // Refresh silencieux important
          />
        ))}
        
        {/* Message si pas de missions */}
        {missions.length === 0 && (
          <div className="text-slate-500 text-center text-xs font-bold uppercase py-10">
            Aucune mission pour aujourd'hui
          </div>
        )}
      </div>

      {/* --- MESSAGE DE FIN --- */}
      {allMissionsDone && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500 text-white p-6 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.3)] text-center space-y-6 mt-8 border border-white/20"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight">Tout est fini !</h3>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
              Étape suivante
            </p>
            <p className="text-lg font-bold leading-tight">
              DEMANDE À TES PARENTS DE VALIDER
            </p>
          </div>

          <button
            onClick={onParentMode}
            className="w-full bg-white text-green-700 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            Accès Parents
          </button>
        </motion.div>
      )}

    </div>
  )
}