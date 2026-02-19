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
  const [error, setError] = useState(null)

  const loadFamilyData = useCallback(async (isSilent = false) => {
    // If no userId and no familyId, we can't load anything
    if (!userId && !familyId) { setIsLoading(false); return }

    try {
      if (!isSilent) setIsLoading(true)

      let fam = null
      let famError = null

      // 1. Get or Create Family
      if (userId) {
        let { data, error } = await supabase
          .from('families')
          .select('*')
          .eq('parent_owner_id', userId)
          .limit(1)

        fam = data?.[0] || null
        famError = error

        if (famError) throw famError

        if (!fam) {
          const { data: newFam, error: createFamError } = await supabase
            .from('families')
            .insert([{ parent_owner_id: userId }])
            .select()
            .single()

          if (createFamError) throw createFamError
          fam = newFam
        }
      } else if (familyId) {
        // Child path: find by family ID
        let { data, error } = await supabase
          .from('families')
          .select('*')
          .eq('id', familyId)
          .limit(1)

        fam = data?.[0] || null
        famError = error
      }

      if (famError) {
        throw new Error(`SQL_${famError.code || 'UNKNOWN'}: ${famError.message}`)
      }
      if (!fam) {
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

        if (profError) throw new Error(`SQL_CREATE_PROFS_${profError.code}: ${profError.message}`)
        profs = newProfs || []

      } else {
        // --- LOGIQUE AUTO-GUÉRISSEUSE (SELF-HEALING) ---
        const configuredChildren = profs.filter(p => !p.is_parent && p.child_name !== "Mon enfant")
        const placeholderChildren = profs.filter(p => !p.is_parent && p.child_name === "Mon enfant")

        let idsToDelete = []

        if (configuredChildren.length > 0 && placeholderChildren.length > 0) {
          idsToDelete = placeholderChildren.map(p => p.id)
        } else if (placeholderChildren.length > 1) {
          const [, ...remove] = placeholderChildren
          idsToDelete = remove.map(p => p.id)
        }

        if (idsToDelete.length > 0) {
          await supabase.from('profiles').delete().in('id', idsToDelete)
          profs = profs.filter(p => !idsToDelete.includes(p.id))
        }
      }

      setProfiles(profs || [])

      // 2.2 Default Missions creation recovery - ONLY if no missions exist yet
      // Pre-declare with let so the inner try block can assign it without TDZ issues
      let prefetchedMissions = null
      try {
        const { count } = await supabase
          .from('missions')
          .select('*', { count: 'exact', head: true })
          .eq('family_id', fam.id)

        if (count === 0) {
          const defaultMissions = [
            { title: "missions.do_homework", icon: "📚", family_id: fam.id, order_index: 1 },
            { title: "missions.tidy_toys", icon: "🧸", family_id: fam.id, order_index: 2 },
            { title: "missions.set_table", icon: "🍽️", family_id: fam.id, order_index: 3 }
          ]
          await supabase.from('missions').insert(defaultMissions)
          // Re-fetch right after creation and store in local variable (fixes TDZ bug)
          const { data: refreshedMissions } = await supabase
            .from('missions')
            .select('*')
            .eq('family_id', fam.id)
            .order('order_index')
          if (refreshedMissions) prefetchedMissions = refreshedMissions
        }
      } catch (mErr) {
        console.warn("Default missions creation check failed:", mErr)
      }

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

      // Recovery if parent profile is missing family_id (RLS edge case)
      if (parentProf && !parentProf.family_id && fam.id) {
        await supabase.from('profiles').update({ family_id: fam.id }).eq('id', parentProf.id)
      }

      if (!currentProfId || !profs.find(p => p.id === currentProfId)) {
        const firstChild = profs.find(p => p.role === 'child') || profs[0]
        currentProfId = firstChild?.id
        setActiveProfileId(currentProfId)
        localStorage.setItem('active_profile_id', currentProfId)
      }

      // 4. Fetch Missions & Logs
      const today = new Date().toISOString().split('T')[0]

      // Use prefetchedMissions if available (freshly created defaults), else fetch from DB
      let curMissions = prefetchedMissions
      if (!curMissions) {
        const { data: fetchedMissions } = await supabase
          .from('missions')
          .select('*')
          .eq('family_id', fam.id)
          .order('order_index')
        curMissions = fetchedMissions
      }

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
        .eq('assigned_to', currentProfId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (challError) console.error("Error fetching challenge:", challError)
      let chall = challs?.[0] || null

      if (!chall) {
        const { data: newChall, error: createError } = await supabase
          .from('challenges')
          .insert([{
            family_id: fam.id,
            assigned_to: currentProfId,
            reward_name: "Cadeau Surprise",
            duration_days: 2,
            is_active: true,
            current_streak: 0
          }])
          .select()
          .limit(1)

        if (createError) console.error("Error creating default challenge:", createError)
        chall = newChall?.[0] || null
      }
      setChallenge(chall)

      // 6. Merge & Filter Missions + Deduplicate UI (Safety net)
      const filteredMissions = (curMissions || []).filter(m =>
        !m.assigned_to || m.assigned_to === currentProfId
      )

      const seenMissions = new Set()
      const dedupedMissions = filteredMissions.filter(m => {
        const key = `${m.title}-${m.icon}-${m.order_index}`
        if (seenMissions.has(key)) return false
        seenMissions.add(key)
        return true
      })

      const mergedMissions = dedupedMissions.map(m => {
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

      // 7. Save the raw list for management (also deduped)
      const seenRaw = new Set()
      const dedupedRaw = (curMissions || []).filter(m => {
        const key = `${m.title}-${m.icon}-${m.order_index}`
        if (seenRaw.has(key)) return false
        seenRaw.add(key)
        return true
      })
      setFamilyMissions(dedupedRaw)

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

  const updateProfile = async (id, updates) => {
    // 1. Optimistic Update
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

    // 2. Database Update
    const { error } = await supabase.from('profiles').update(updates).eq('id', id)
    if (error) {
      console.error("Failed to update profile in DB:", error)
      // Rollback on error (re-load data)
      loadFamilyData(true)
      throw error
    }
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
    switchProfile,
    updateProfile
  }
}
