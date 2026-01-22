import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useFamily(userId) {
  const [profile, setProfile] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [missions, setMissions] = useState([])
  
  // Initialisé à true pour le premier chargement
  const [isLoading, setIsLoading] = useState(true)

  // AJOUT DU PARAMÈTRE isSilent = false par défaut
  const loadFamilyData = useCallback(async (isSilent = false) => {
    if (!userId) { setIsLoading(false); return }
    
    try {
      // 🌟 LE SECRET ANTI-SCINTILLEMENT :
      // On affiche le chargement SEULEMENT si ce n'est pas silencieux
      if (!isSilent) setIsLoading(true)
      
      const today = new Date().toISOString().split('T')[0]
      
      // 1. Profil
      let { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!prof) {
        const { data: newProf } = await supabase.from('profiles').insert([{ id: userId, child_name: "Matisse" }]).select().single()
        prof = newProf
      }
      setProfile(prof)

      // 2. Challenge
      let { data: chall } = await supabase.from('challenges').select('*').eq('parent_id', userId).eq('is_active', true).maybeSingle()
      if (!chall) {
        const { data: newChall } = await supabase.from('challenges').insert([{ parent_id: userId, reward_name: "Cadeau Surprise", duration_days: 3, current_streak: 0 }]).select().single()
        chall = newChall
      }
      setChallenge(chall)

      // 3. Missions + Logs
      const { data: curMissions } = await supabase.from('missions').select('*').eq('parent_id', userId).order('order_index')
      const { data: todayLogs } = await supabase.from('daily_logs').select('*').eq('date', today)

      const mergedMissions = (curMissions || []).map(m => {
        const log = todayLogs?.find(l => l.mission_id === m.id)
        return {
          ...m,
          is_completed: log?.child_validated || false,
          parent_validated: log?.parent_validated || false
        }
      })
      setMissions(mergedMissions)

    } catch (e) { 
      console.error(e) 
    } finally { 
      // Si ce n'était pas silencieux, on arrête le chargement
      if (!isSilent) setIsLoading(false) 
    }
  }, [userId])

  useEffect(() => { loadFamilyData() }, [loadFamilyData])
  
  // On retourne la fonction refresh qui pourra être appelée comme refresh(true)
  return { profile, challenge, missions, isLoading, refresh: loadFamilyData }
}