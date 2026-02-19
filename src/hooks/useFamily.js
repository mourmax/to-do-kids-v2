/**
 * useFamily — Orchestrateur principal
 *
 * Délègue chaque domaine à un hook spécialisé et expose la même API publique
 * qu'avant le refacto : aucun composant ne doit être modifié.
 *
 * Flux d'exécution dans loadFamilyData :
 *   1. loadFamily      → résout la famille (parent ou enfant)
 *   2. loadProfiles    → résout les profils + activeProfileId
 *   3. loadDefaultMissions (si nécessaire)
 *   4. loadMissions + loadChallenge (en parallèle, optimisation)
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useFamilyData } from './useFamilyData'
import { useProfiles }   from './useProfiles'
import { useMissions }   from './useMissions'
import { useChallenge }  from './useChallenge'

export function useFamily(userId, familyId = null) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)

  // --- Hooks spécialisés ---
  const { family, loadFamily } = useFamilyData()

  const {
    profiles,
    setProfiles,
    activeProfileId,
    switchProfile,
    loadProfiles,
  } = useProfiles()

  const {
    missions,
    familyMissions,
    loadDefaultMissions,
    loadMissions,
  } = useMissions()

  const { challenge, loadChallenge } = useChallenge()

  // -------------------------------------------------------------------------
  // loadFamilyData — point d'entrée unique pour tous les refreshs
  // -------------------------------------------------------------------------
  const loadFamilyData = useCallback(async (isSilent = false) => {
    if (!userId && !familyId) { setIsLoading(false); return }

    try {
      if (!isSilent) setIsLoading(true)

      // 1. Famille
      const fam = await loadFamily(userId, familyId)

      // 2. Profils + résolution du profil actif
      const { currentProfId } = await loadProfiles(fam.id)

      // 3. Missions par défaut (crée + retourne si première visite, null sinon)
      const prefetchedMissions = await loadDefaultMissions(fam.id)

      // 4. Missions (merge daily_logs) + Challenge en parallèle
      await Promise.all([
        loadMissions(fam.id, currentProfId, prefetchedMissions),
        loadChallenge(fam.id, currentProfId),
      ])

    } catch (e) {
      console.error("Erreur useFamily (catch):", e)
      setError(e.message || "Unknown error during data load")
    } finally {
      if (!isSilent) setIsLoading(false)
    }
  }, [
    userId,
    familyId,
    loadFamily,
    loadProfiles,       // change quand activeProfileId change → déclenche le refresh
    loadDefaultMissions,
    loadMissions,
    loadChallenge,
  ])

  // Déclenchement automatique dès que loadFamilyData change.
  // Si family est déjà chargée, le refresh est silencieux (pas d'écran de chargement).
  useEffect(() => {
    loadFamilyData(!!family)
  }, [loadFamilyData])

  // -------------------------------------------------------------------------
  // updateProfile — mise à jour optimiste + rollback sur erreur
  // (gardée dans l'orchestrateur car elle dépend à la fois de setProfiles
  //  et de loadFamilyData pour le rollback)
  // -------------------------------------------------------------------------
  const updateProfile = async (id, updates) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

    const { error: dbError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)

    if (dbError) {
      console.error("Failed to update profile in DB:", dbError)
      loadFamilyData(true) // rollback via re-fetch silencieux
      throw dbError
    }
  }

  // -------------------------------------------------------------------------
  // Interface publique — identique à l'ancien useFamily
  // -------------------------------------------------------------------------
  return {
    family,
    profiles,
    activeProfile: profiles.find(p => p.id === activeProfileId),
    missions,
    allMissions: familyMissions,   // liste brute non filtrée (onglet Paramètres)
    challenge,
    isLoading,
    error,
    refresh:       loadFamilyData,
    switchProfile,
    updateProfile,
  }
}
