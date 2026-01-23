import { useState } from 'react'
import { Check, User } from 'lucide-react'
import { supabase } from '../../../supabaseClient'
import SectionCard from './SectionCard'

export default function IdentitySection({ profile, onShowSuccess, refresh }) {
  const [childName, setChildName] = useState(profile?.child_name || '')

  const saveChildName = async () => {
    if (!profile?.id) return
    const { error } = await supabase.from('profiles').update({ child_name: childName }).eq('id', profile.id)
    if (!error) { 
      onShowSuccess("Prénom mis à jour !")
      refresh(true) 
    }
  }

  return (
    <SectionCard icon={User} colorClass="text-indigo-400" title="Identité Enfant">
      <div className="flex gap-3">
        <input 
          value={childName} 
          onChange={(e) => setChildName(e.target.value)} 
          className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 font-bold outline-none text-white focus:border-indigo-500 transition-colors" 
        />
        <button onClick={saveChildName} className="bg-indigo-600 p-3 rounded-2xl hover:bg-indigo-500 shadow-lg text-white active:scale-95 transition-all">
          <Check size={20}/>
        </button>
      </div>
    </SectionCard>
  )
}