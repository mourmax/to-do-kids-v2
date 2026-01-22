import confetti from 'canvas-confetti'
import { Lock } from 'lucide-react'
import { supabase } from '../../supabaseClient'

// Import des modules factorisés
import ChildHeader from './ChildHeader'
import ChildProgressBar from './ChildProgressBar'
import MissionCard from './MissionCard'
import VictoryModal from './VictoryModal'

export default function ChildDashboard({ profile, challenge, missions, onParentMode, refresh }) {
  
  const streak = challenge?.current_streak || 0
  const goal = challenge?.duration_days || 1
  const isChallengeWon = streak >= goal
  
  const sortedMissions = [...missions].sort((a, b) => a.is_completed - b.is_completed)

  const handleMissionClick = async (missionId, isDone) => {
    if (isChallengeWon) return

    if (!isDone) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }

    const today = new Date().toISOString().split('T')[0]
    
    // Appel DB
    const { error } = await supabase
      .from('daily_logs')
      .upsert({ 
        mission_id: missionId, 
        child_validated: !isDone, 
        date: today 
      }, { onConflict: 'mission_id, date' })

    if (!error) {
      // 🌟 LA CORRECTION EST ICI : On utilise le mode silencieux (true)
      refresh(true) 
    } else {
      console.error("Erreur DB:", error.message)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-xl mx-auto min-h-screen bg-[#020617] font-sans relative">
      
      <ChildHeader />

      <div className="px-2">
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
          Salut {profile?.child_name}!
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
          Tes missions du jour
        </p>
      </div>

      <ChildProgressBar 
        streak={streak} 
        goal={goal} 
        rewardName={challenge?.reward_name} 
      />

      <div className="grid grid-cols-2 gap-4">
        {sortedMissions.map((m) => (
          <MissionCard key={m.id} mission={m} onClick={handleMissionClick} />
        ))}
      </div>

      <button onClick={onParentMode} className="mt-4 py-4 flex items-center justify-center gap-2 text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] hover:text-white transition-colors">
        <Lock size={14} /> Accès Parent
      </button>

      {isChallengeWon && (
        <VictoryModal 
          rewardName={challenge?.reward_name} 
          onParentMode={onParentMode} 
        />
      )}
    </div>
  )
}