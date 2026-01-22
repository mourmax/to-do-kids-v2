import { motion } from 'framer-motion'
import { CheckCircle, Lock } from 'lucide-react' // Ajout de Lock
import MissionCard from '../ui/MissionCard'
import ProgressBar from '../ui/ProgressBar'

export default function ChildDashboard({ profile, challenge, missions, refresh, onParentMode }) {
  
  // Vérifier si toutes les missions sont cochées par l'enfant
  const allMissionsDone = missions.length > 0 && missions.every(m => m.is_completed)

  return (
    <div className="space-y-8 pb-12 max-w-sm mx-auto">
      
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

      {/* Barre de progression (Challenge) */}
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
            onToggle={() => refresh(true)} // Refresh silencieux
          />
        ))}
      </div>

      {/* --- NOUVEAU : Message de fin de journée --- */}
      {allMissionsDone && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500 text-white p-6 rounded-3xl shadow-[0_0_40px_rgba(34,197,94,0.3)] text-center space-y-4 mt-8"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle size={32} className="text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight">Mission Complète !</h3>
            <p className="text-green-100 font-bold text-sm mt-1">Tu as tout terminé, bravo !</p>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest opacity-80 pt-2 border-t border-white/20">
            Demande à tes parents de valider
          </p>

          <button
            onClick={onParentMode}
            className="w-full bg-white text-green-600 py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            Accès Parents
          </button>
        </motion.div>
      )}

    </div>
  )
}