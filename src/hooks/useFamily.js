import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export function useFamily(userId, familyId = null) {
  const [family, setFamily] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [activeProfileId, setActiveProfileId] = useState(localStorage.getItem('active_profile_id'))
  const [missions, setMissions] = useState([])
  const [familyMissions, setFamilyMissions] = useState([]) // Raw list for management
  const [challenge, setChallenge] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadFamilyData = useCallback(async (isSilent = false) => {
    // If no userId and no familyId, we can't load anything
    if (!userId && !familyId) { setIsLoading(false); return }

    try {
      if (!isSilent) setIsLoading(true)
      console.log("[useFamily] Loading data for:", { userId, familyId })

      let fam = null
      let famError = null

      // 1. Get or Create Family
      if (userId) {
        console.log("[useFamily] Fetching family for parent:", userId)
        let { data, error } = await supabase
          .from('families')
          .select('*')
          .eq('parent_owner_id', userId)
          .maybeSingle()

        fam = data
        famError = error

        if (famError) {
          console.error("[useFamily] Error fetching family:", famError)
          throw famError
        }

        if (!fam) {
          console.log("[useFamily] No family found, creating one for parent:", userId)
          const { data: newFam, error: createFamError } = await supabase
            .from('families')
            .insert([{ parent_owner_id: userId }])
            .select()
            .single()

          if (createFamError) {
            console.error("[useFamily] Error creating family:", createFamError)
            throw createFamError
          }
          fam = newFam
          console.log("[useFamily] Family created successfully:", fam.id)
        }
      } else if (familyId) {
        // Child path: find by family ID
        let { data, error } = await supabase
          .from('families')
          .select('*')
          .eq('id', familyId)
          .maybeSingle()

        fam = data
        famError = error
      }

      if (famError) {
        console.error("[useFamily] Final family check error:", famError)
        throw new Error(`SQL_${famError.code || 'UNKNOWN'}: ${famError.message}`)
      }
      if (!fam) {
        console.warn("[useFamily] No family found after creation attempt")
        throw new Error("Missing family")
      }

      setFamily(fam)

      // 2. Get Profiles for this family
      let { data: profs, error: profsFetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('family_id', fam.id)

      if (profsFetchError) throw new Error(`SQL_PROFS_${profsFetchError.code}: ${profsFetchError.message}`)

      if (!profs || profs.length === 0) {
        console.log("Creating initial profiles for family:", fam.id)
        // 🛠️ FIX: Ensure we wait for the insert to finish and return the data
        const { data: newProfs, error: profError } = await supabase
          .from('profiles')
          .insert([
            { family_id: fam.id, child_name: "Parent", role: 'parent', is_parent: true, preferred_theme: 'dark' },
            {
              family_id: fam.id,
              child_name: "Mon enfant",
              role: 'child',
              is_parent: false,
              color: 'violet',
              invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
              preferred_theme: 'dark'
            }
          ])
          .select()

        if (profError) {
          console.error("[useFamily] Critical error creating profiles:", profError)
          throw new Error(`SQL_CREATE_PROFS_${profError.code}: ${profError.message}`)
        }
        profs = newProfs || []
        console.log("[useFamily] Profiles created successfully")

        // Default Missions creation (keep as is but maybe wrap in try/catch if critical)
        try {
          const { data: existingMissions } = await supabase
            .from('missions')
            .select('id')
            .eq('family_id', fam.id)
            .limit(1)

          if (!existingMissions || existingMissions.length === 0) {
            console.log("Creating default missions...")
            const defaultMissions = [
              { title: "Faire ses devoirs", icon: "📚", family_id: fam.id, order_index: 1 },
              { title: "Ranger sa chambre", icon: "🧸", family_id: fam.id, order_index: 2 },
              { title: "Mettre la table", icon: "🍽️", family_id: fam.id, order_index: 3 }
            ]
            await supabase.from('missions').insert(defaultMissions)
          }
        } catch (mErr) {
          console.warn("Default missions creation failed (non-critical):", mErr)
        }
      }
      setProfiles(profs || [])
      console.log("[useFamily] All data loaded successfully for family:", fam.id)

      // 2.5 Patch ALL existing profiles without invite codes
      const profilesToPatch = (profs || []).filter(p => !p.is_parent && !p.invite_code)
      if (profilesToPatch.length > 0) {
        let hasUpdated = false
        const updatedProfs = [...(profs || [])]
        for (const p of profilesToPatch) {
          const code = Math.random().toString(36).substring(2, 8).toUpperCase()
          const { data, error: upError } = await supabase
            .from('profiles')
            .update({ invite_code: code })
            .eq('id', p.id)
            .select()

          if (upError) {
            console.error("Failed to patch profile with invite_code:", upError)
          } else if (data) {
            const idx = updatedProfs.findIndex(pr => pr.id === p.id)
            if (idx !== -1) updatedProfs[idx] = data[0]
            hasUpdated = true
          }
        }
        if (hasUpdated) setProfiles(updatedProfs)
      }

      // 3. Handle Active Profile
      let currentProfId = activeProfileId
      const parentProf = profs.find(p => p.is_parent)

      // Double check if parent has family_id (recovery if RLS was messed up)
      if (parentProf && !parentProf.family_id && fam.id) {
        console.warn("Parent profile missing family_id, patching...")
        await supabase.from('profiles').update({ family_id: fam.id }).eq('id', parentProf.id)
      }

      if (!currentProfId || !profs.find(p => p.id === currentProfId)) {
        // Default to first child profile
        const firstChild = profs.find(p => p.role === 'child') || profs[0]
        currentProfId = firstChild?.id
        setActiveProfileId(currentProfId)
        localStorage.setItem('active_profile_id', currentProfId)
      }

      // 4. Fetch Missions & Logs
      const today = new Date().toISOString().split('T')[0]

      const { data: curMissions } = await supabase
        .from('missions')
        .select('*')
        .eq('family_id', fam.id)
        .order('order_index')

      const { data: todayLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('profile_id', currentProfId)
        .eq('date', today)

      // 5. Fetch Challenge - STRICTLY per-child (no shared family challenges)
      let { data: challs, error: challError } = await supabase
        .from('challenges')
        .select('*')
        .eq('family_id', fam.id)
        .eq('assigned_to', currentProfId) // 🛠️ CRUCIAL: Seulement les challenges de cet enfant
        .order('created_at', { ascending: false })
        .limit(1)

      if (challError) console.error("Error fetching challenge:", challError)
      let chall = challs?.[0] || null

      if (!chall) {
        console.log("No challenge found for profile, creating one:", currentProfId)
        const { data: newChall, error: createError } = await supabase
          .from('challenges')
          .insert([{
            family_id: fam.id,
            assigned_to: currentProfId, // 🛠️ CRUCIAL: Assigner à l'enfant actif
            reward_name: "Cadeau Surprise",
            duration_days: 7,
            is_active: true,
            current_streak: 0
          }])
          .select()
          .single()

        if (createError) console.error("Error creating default challenge:", createError)
        chall = newChall
      }
      setChallenge(chall)

      // 6. Merge & Filter Missions
      const filteredMissions = (curMissions || []).filter(m =>
        !m.assigned_to || m.assigned_to === currentProfId
      )

      const mergedMissions = filteredMissions.map(m => {
        const log = todayLogs?.find(l => l.mission_id === m.id)
        return {
          ...m,
          is_completed: log?.child_validated || false,
          parent_validated: log?.parent_validated || false,
          validation_requested: log?.validation_requested || false,
          validation_result: log?.validation_result || null
        }
      })
      setMissions(mergedMissions)

      // 7. Save the raw list for management
      setFamilyMissions(curMissions || [])

    } catch (e) {
      console.error("Erreur useFamily (catch):", e)
      setError(e.message || "Unknown error during data load")
    } finally {
      if (!isSilent) setIsLoading(false)
    }
  }, [userId, familyId, activeProfileId])

  useEffect(() => {
    // Effectuer un chargement "silencieux" si la famille est déjà chargée
    // Cela évite l'écran de chargement global sur un switch de profil
    loadFamilyData(!!family)
  }, [loadFamilyData])

  const switchProfile = (id) => {
    setActiveProfileId(id)
    localStorage.setItem('active_profile_id', id)
  }

  return {
    family,
    profiles,
    activeProfile: profiles.find(p => p.id === activeProfileId),
    missions,
    allMissions: familyMissions, // Unfiltered for management
    challenge,
    isLoading,
    error,
    refresh: loadFamilyData,
    switchProfile
  }
}
