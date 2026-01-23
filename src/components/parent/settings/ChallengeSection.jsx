import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import SectionCard from './SectionCard'

export default function ChallengeSection({ challenge, onShowSuccess, refresh }) {
  const [rewardName, setRewardName] = useState('')
  const [seriesLength, setSeriesLength] = useState(3)
  const [malusMessage, setMalusMessage] = useState('')

  useEffect(() => {
    if (challenge) {
      setRewardName(challenge.reward_name)
      setSeriesLength(challenge.duration_days)
      setMalusMessage(challenge.malus_message)
    }
  }, [challenge])

  const saveChallengeSettings = async () => {
    if (!challenge?.id) return
    const finalLength = Math.max(1, parseInt(seriesLength) || 1)
    
    const { error } = await supabase.from('challenges').update({ 
      reward_name: rewardName, 
      duration_days: finalLength, 
      malus_message: malusMessage 
    }).eq('id', challenge.id)

    if (!error) { 
      setSeriesLength(finalLength)
      onShowSuccess("Challenge enregistré !")
      refresh(true) 
    }
  }

  return (
    <SectionCard icon={Trophy} colorClass="text-orange-500" title="Réglages du Challenge">
      <div className="space-y-4">
        <div>
          <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Cadeau</label>
          <input value={rewardName} onChange={(e) => setRewardName(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-white" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Série (jours)</label>
            <input 
              type="number" 
              min="1" 
              value={seriesLength} 
              onChange={(e) => setSeriesLength(e.target.value)} 
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-white" 
            />
          </div>
          <div className="py-3 px-4 bg-slate-800/50 rounded-2xl text-center font-black text-indigo-400 flex flex-col justify-center leading-none">
            <span className="text-[8px] uppercase mb-1">Actuel</span>
            Jour {challenge?.current_streak || 0}
          </div>
        </div>

        <div>
          <label className="text-[9px] text-slate-500 uppercase font-black ml-1">Message Malus</label>
          <input value={malusMessage} onChange={(e) => setMalusMessage(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 mt-1 font-bold outline-none text-red-400" />
        </div>
        
        <button onClick={saveChallengeSettings} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-[10px] shadow-xl active:scale-95 transition-all text-white">
          Sauvegarder les réglages
        </button>
      </div>
    </SectionCard>
  )
}