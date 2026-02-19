import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Déduplication d'une liste de missions par clé composite titre+icône+ordre.
 * Conservée en JS en attendant la contrainte UNIQUE côté DB.
 * @param {object[]} list
 * @returns {object[]}
 */
function dedupMissions(list) {
  const seen = new Set()
  return (list || []).filter(m => {
    const key = `${m.title}-${m.icon}-${m.order_index}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Gère les missions de la famille (tables `missions` et `daily_logs`).
 * Responsabilités :
 *  - Vérification et création des missions par défaut
 *  - Fetch des missions + logs du jour
 *  - Filtrage par profil actif
 *  - Déduplication (safety net)
 *  - Merge missions ↔ daily_logs
 *
 * @returns {{
 *   missions: object[],
 *   familyMissions: object[],
 *   loadDefaultMissions: function,
 *   loadMissions: function
 * }}
 */
export function useMissions() {
  const [missions, setMissions] = useState([])
  const [familyMissions, setFamilyMissions] = useState([])

  /**
   * Vérifie si la famille a des missions. Si non, crée les missions par défaut
   * et retourne la liste fraîchement insérée pour éviter un second fetch.
   *
   * @param {string} familyId
   * @returns {Promise<object[]|null>} Missions créées, ou null si elles existaient déjà
   */
  const loadDefaultMissions = useCallback(async (familyId) => {
    try {
      const { count } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId)

      if (count !== 0) return null

      const defaultMissions = [
        { title: "missions.do_homework", icon: "📚", family_id: familyId, order_index: 1 },
        { title: "missions.tidy_toys",   icon: "🧸", family_id: familyId, order_index: 2 },
        { title: "missions.set_table",   icon: "🍽️", family_id: familyId, order_index: 3 },
      ]
      await supabase.from('missions').insert(defaultMissions)

      // Re-fetch immédiat : évite la TDZ qui existait dans l'ancien useFamily
      const { data: freshMissions } = await supabase
        .from('missions')
        .select('*')
        .eq('family_id', familyId)
        .order('order_index')

      return freshMissions || null
    } catch (mErr) {
      console.warn("Default missions creation check failed:", mErr)
      return null
    }
  }, [])

  /**
   * Fetch les missions et les logs du jour, puis met à jour l'état.
   *
   * @param {string}        familyId
   * @param {string}        profileId         Profil actif (détermine les logs)
   * @param {object[]|null} prefetchedMissions Missions déjà chargées (création par défaut)
   */
  const loadMissions = useCallback(async (familyId, profileId, prefetchedMissions) => {
    // Utilise le prefetch si disponible (évite un fetch redondant)
    let rawMissions = prefetchedMissions
    if (!rawMissions) {
      const { data: fetchedMissions } = await supabase
        .from('missions')
        .select('*')
        .eq('family_id', familyId)
        .order('order_index')
      rawMissions = fetchedMissions
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: todayLogs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('profile_id', profileId)
      .eq('date', today)

    // Filtre par profil actif, déduplique, puis merge avec les logs
    const filtered = (rawMissions || []).filter(
      m => !m.assigned_to || m.assigned_to === profileId
    )
    const deduped = dedupMissions(filtered)

    const merged = deduped.map(m => {
      const log = todayLogs?.find(l => l.mission_id === m.id)
      return {
        ...m,
        is_completed:         log?.child_validated      || false,
        parent_validated:     log?.parent_validated     || false,
        validation_requested: log?.validation_requested || false,
        validation_result:    log?.validation_result    || null,
      }
    })

    setMissions(merged)

    // Liste brute pour la gestion (onglet Paramètres)
    setFamilyMissions(dedupMissions(rawMissions))
  }, [])

  return {
    missions,
    familyMissions,
    loadDefaultMissions,
    loadMissions,
  }
}
