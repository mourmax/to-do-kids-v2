import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useFamily(userId) {
  const [profile, setProfile] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [missions, setMissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFamilyData = useCallback(async (isSilent = false) => {
    if (!userId) { setIsLoading(false); return }
    
    try {
      // Refresh silencieux pour éviter le scintillement
      if (!isSilent) setIsLoading(true)
      
      const today = new Date().toISOString().split('T')[0]
      
      // 1. Profil (Isolation par ID utilisateur)
      let { data: prof } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (!prof) {
        const { data: newProf } = await supabase.from('profiles').insert([{ id: userId, child_name: "Matisse" }]).select().single()
        prof = newProf
      }
      setProfile(prof)

      // 2. Challenge (Isolation par parent_id)
      let { data: chall } = await supabase.from('challenges').select('*').eq('parent_id', userId).eq('is_active', true).maybeSingle()
      if (!chall) {
        const { data: newChall } = await supabase.from('challenges').insert([{ parent_id: userId, reward_name: "Cadeau Surprise", duration_days: 3, current_streak: 0 }]).select().single()
        chall = newChall
      }
      setChallenge(chall)

      // 3. Missions (Isolation par parent_id)
      const { data: curMissions } = await supabase.from('missions').select('*').eq('parent_id', userId).order('order_index')

      // 4. Logs (Sécurisation Multi-Famille par jointure inner)
      // On demande uniquement les logs dont la mission associée appartient à l'utilisateur connecté
      const { data: todayLogs } = await supabase
        .from('daily_logs')
        .select(`
          id, 
          mission_id, 
          child_validated, 
          parent_validated, 
          date,
          missions!inner(parent_id)
        `)
        .eq('missions.parent_id', userId)
        .eq('date', today)

      // 5. Fusion des données
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
      console.error("Erreur de chargement des données famille:", e) 
    } finally { 
      if (!isSilent) setIsLoading(false) 
    }
  }, [userId])

  useEffect(() => { loadFamilyData() }, [loadFamilyData])
  
  return { profile, challenge, missions, isLoading, refresh: loadFamilyData }
}