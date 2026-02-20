import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Gère les profils de la famille (table `profiles`).
 * Responsabilités :
 *  - Fetch et création des profils initiaux (parent + enfant placeholder)
 *  - Auto-guérison : suppression des placeholders "Mon enfant" en doublon
 *  - Patch des profils enfants sans invite_code
 *  - Patch du profil parent sans family_id (cas RLS edge)
 *  - Résolution et persistance de l'activeProfileId
 *
 * @returns {{
 *   profiles: object[],
 *   setProfiles: function,
 *   activeProfileId: string|null,
 *   switchProfile: function,
 *   loadProfiles: function
 * }}
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState([])
  const [activeProfileId, setActiveProfileId] = useState(
    () => localStorage.getItem('active_profile_id')
  )

  /**
   * Met à jour l'activeProfileId en état et en localStorage.
   */
  const switchProfile = useCallback((id) => {
    setActiveProfileId(id)
    localStorage.setItem('active_profile_id', id)
  }, [])

  /**
   * Charge, crée et normalise les profils pour une famille donnée.
   * Ferme sur activeProfileId pour résoudre le profil courant.
   *
   * @param {string} familyId
   * @returns {Promise<{ profs: object[], currentProfId: string }>}
   */
  const loadProfiles = useCallback(async (familyId) => {
    // --- 1. Fetch ---
    let { data: profs, error: profsFetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', familyId)

    if (profsFetchError) {
      throw new Error(`SQL_PROFS_${profsFetchError.code}: ${profsFetchError.message}`)
    }

    // --- 2. Création si aucun profil ---
    if (!profs || profs.length === 0) {
      const { data: newProfs, error: profError } = await supabase
        .from('profiles')
        .insert([
          { family_id: familyId, child_name: "Parent", role: 'parent', is_parent: true, preferred_theme: 'dark' },
          {
            family_id: familyId,
            child_name: "Mon enfant",
            role: 'child',
            is_parent: false,
            color: 'violet',
            gender: 'boy',
            invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            preferred_theme: 'dark'
          }
        ])
        .select()

      if (profError) {
        throw new Error(`SQL_CREATE_PROFS_${profError.code}: ${profError.message}`)
      }
      profs = newProfs || []

    } else {
      // --- 3. Auto-guérison : suppression des placeholders en doublon ---
      const configuredChildren = profs.filter(p => !p.is_parent && p.child_name !== "Mon enfant")
      const placeholderChildren = profs.filter(p => !p.is_parent && p.child_name === "Mon enfant")

      let idsToDelete = []
      if (configuredChildren.length > 0 && placeholderChildren.length > 0) {
        // Un vrai enfant existe → supprimer TOUS les placeholders
        idsToDelete = placeholderChildren.map(p => p.id)
      } else if (placeholderChildren.length > 1) {
        // Doublons de placeholder → n'en garder qu'un
        const [, ...remove] = placeholderChildren
        idsToDelete = remove.map(p => p.id)
      }

      if (idsToDelete.length > 0) {
        await supabase.from('profiles').delete().in('id', idsToDelete)
        profs = profs.filter(p => !idsToDelete.includes(p.id))
      }
    }

    // --- 4. Patch profils enfants sans invite_code ---
    const profilesToPatch = profs.filter(p => !p.is_parent && !p.invite_code)
    if (profilesToPatch.length > 0) {
      let hasUpdated = false
      const updatedProfs = [...profs]

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
      if (hasUpdated) profs = updatedProfs
    }

    // --- 5. Patch profil parent sans family_id (cas RLS edge) ---
    const parentProf = profs.find(p => p.is_parent)
    if (parentProf && !parentProf.family_id && familyId) {
      await supabase.from('profiles').update({ family_id: familyId }).eq('id', parentProf.id)
    }

    setProfiles(profs)

    // --- 6. Résolution de l'activeProfileId ---
    // Lit la valeur actuelle de la closure pour ce cycle de chargement.
    let currentProfId = activeProfileId
    if (!currentProfId || !profs.find(p => p.id === currentProfId)) {
      const firstChild = profs.find(p => p.role === 'child') || profs[0]
      currentProfId = firstChild?.id
      setActiveProfileId(currentProfId)
      localStorage.setItem('active_profile_id', currentProfId)
    }

    return { profs, currentProfId }
  }, [activeProfileId])

  return {
    profiles,
    setProfiles,
    activeProfileId,
    switchProfile,
    loadProfiles,
  }
}
