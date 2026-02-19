import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Gère le fetch et la création de la famille (table `families`).
 * Expose une fonction load(userId, familyId) appelée par l'orchestrateur useFamily.
 *
 * @returns {{ family: object|null, loadFamily: function }}
 */
export function useFamilyData() {
  const [family, setFamily] = useState(null)

  /**
   * Récupère ou crée la famille selon le chemin parent (userId) ou enfant (familyId).
   * Lève une erreur si la famille est introuvable après création.
   * @param {string|null} userId
   * @param {string|null} familyId
   * @returns {Promise<object>} La famille trouvée ou créée
   */
  const loadFamily = useCallback(async (userId, familyId) => {
    let fam = null
    let famError = null

    if (userId) {
      // Chemin parent : cherche ou crée la famille
      const { data, error } = await supabase
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
      // Chemin enfant : trouve la famille par ID
      const { data, error } = await supabase
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
    return fam
  }, [])

  return { family, loadFamily }
}
